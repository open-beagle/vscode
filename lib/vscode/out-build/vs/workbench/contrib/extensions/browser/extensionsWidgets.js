/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/contrib/extensions/common/extensions", "vs/base/browser/dom", "vs/base/common/platform", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsWidgets", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/label/common/label", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/base/browser/ui/countBadge/countBadge", "vs/platform/configuration/common/configuration", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/theme/common/colorRegistry", "vs/css!./media/extensionsWidgets"], function (require, exports, lifecycle_1, extensions_1, dom_1, platform, nls_1, extensionManagement_1, extensionRecommendations_1, label_1, extensionsActions_1, themeService_1, theme_1, event_1, instantiation_1, countBadge_1, configuration_1, userDataSync_1, extensionsIcons_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extensionRatingIconColor = exports.SyncIgnoredWidget = exports.ExtensionPackCountWidget = exports.RemoteBadgeWidget = exports.RecommendationWidget = exports.TooltipWidget = exports.RatingsWidget = exports.InstallCountWidget = exports.Label = exports.ExtensionWidget = void 0;
    class ExtensionWidget extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._extension = null;
        }
        get extension() { return this._extension; }
        set extension(extension) { this._extension = extension; this.update(); }
        update() { this.render(); }
    }
    exports.ExtensionWidget = ExtensionWidget;
    let Label = class Label extends ExtensionWidget {
        constructor(element, fn, extensionsWorkbenchService) {
            super();
            this.element = element;
            this.fn = fn;
            this.render();
        }
        render() {
            this.element.textContent = this.extension ? this.fn(this.extension) : '';
        }
    };
    Label = __decorate([
        __param(2, extensions_1.IExtensionsWorkbenchService)
    ], Label);
    exports.Label = Label;
    let InstallCountWidget = class InstallCountWidget extends ExtensionWidget {
        constructor(container, small, extensionsWorkbenchService) {
            super();
            this.container = container;
            this.small = small;
            container.classList.add('extension-install-count');
            this.render();
        }
        render() {
            this.container.innerText = '';
            if (!this.extension) {
                return;
            }
            const installCount = this.extension.installCount;
            if (installCount === undefined) {
                return;
            }
            let installLabel;
            if (this.small) {
                if (installCount > 1000000) {
                    installLabel = `${Math.floor(installCount / 100000) / 10}M`;
                }
                else if (installCount > 1000) {
                    installLabel = `${Math.floor(installCount / 1000)}K`;
                }
                else {
                    installLabel = String(installCount);
                }
            }
            else {
                installLabel = installCount.toLocaleString(platform.locale);
            }
            (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themeService_1.ThemeIcon.asCSSSelector(extensionsIcons_1.installCountIcon)));
            const count = (0, dom_1.append)(this.container, (0, dom_1.$)('span.count'));
            count.textContent = installLabel;
        }
    };
    InstallCountWidget = __decorate([
        __param(2, extensions_1.IExtensionsWorkbenchService)
    ], InstallCountWidget);
    exports.InstallCountWidget = InstallCountWidget;
    class RatingsWidget extends ExtensionWidget {
        constructor(container, small) {
            super();
            this.container = container;
            this.small = small;
            container.classList.add('extension-ratings');
            if (this.small) {
                container.classList.add('small');
            }
            this.render();
        }
        render() {
            this.container.innerText = '';
            if (!this.extension) {
                return;
            }
            if (this.extension.rating === undefined) {
                return;
            }
            if (this.small && !this.extension.ratingCount) {
                return;
            }
            const rating = Math.round(this.extension.rating * 2) / 2;
            if (this.small) {
                (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themeService_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starFullIcon)));
                const count = (0, dom_1.append)(this.container, (0, dom_1.$)('span.count'));
                count.textContent = String(rating);
            }
            else {
                for (let i = 1; i <= 5; i++) {
                    if (rating >= i) {
                        (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themeService_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starFullIcon)));
                    }
                    else if (rating >= i - 0.5) {
                        (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themeService_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starHalfIcon)));
                    }
                    else {
                        (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themeService_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starEmptyIcon)));
                    }
                }
            }
            this.container.title = this.extension.ratingCount === 1 ? (0, nls_1.localize)(0, null)
                : typeof this.extension.ratingCount === 'number' && this.extension.ratingCount > 1 ? (0, nls_1.localize)(1, null, this.extension.ratingCount) : (0, nls_1.localize)(2, null);
        }
    }
    exports.RatingsWidget = RatingsWidget;
    let TooltipWidget = class TooltipWidget extends ExtensionWidget {
        constructor(parent, tooltipAction, recommendationWidget, labelService) {
            super();
            this.parent = parent;
            this.tooltipAction = tooltipAction;
            this.recommendationWidget = recommendationWidget;
            this.labelService = labelService;
            this._register(event_1.Event.any(this.tooltipAction.onDidChange, this.recommendationWidget.onDidChangeTooltip, this.labelService.onDidChangeFormatters)(() => this.render()));
        }
        render() {
            this.parent.title = this.getTooltip();
        }
        getTooltip() {
            if (!this.extension) {
                return '';
            }
            if (this.tooltipAction.label) {
                return this.tooltipAction.label;
            }
            return this.recommendationWidget.tooltip;
        }
    };
    TooltipWidget = __decorate([
        __param(3, label_1.ILabelService)
    ], TooltipWidget);
    exports.TooltipWidget = TooltipWidget;
    let RecommendationWidget = class RecommendationWidget extends ExtensionWidget {
        constructor(parent, themeService, extensionRecommendationsService) {
            super();
            this.parent = parent;
            this.themeService = themeService;
            this.extensionRecommendationsService = extensionRecommendationsService;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this._tooltip = '';
            this._onDidChangeTooltip = this._register(new event_1.Emitter());
            this.onDidChangeTooltip = this._onDidChangeTooltip.event;
            this.render();
            this._register((0, lifecycle_1.toDisposable)(() => this.clear()));
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.render()));
        }
        get tooltip() { return this._tooltip; }
        set tooltip(tooltip) {
            if (this._tooltip !== tooltip) {
                this._tooltip = tooltip;
                this._onDidChangeTooltip.fire();
            }
        }
        clear() {
            this.tooltip = '';
            if (this.element) {
                this.parent.removeChild(this.element);
            }
            this.element = undefined;
            this.disposables.clear();
        }
        render() {
            this.clear();
            if (!this.extension) {
                return;
            }
            const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
            if (extRecommendations[this.extension.identifier.id.toLowerCase()]) {
                this.element = (0, dom_1.append)(this.parent, (0, dom_1.$)('div.extension-bookmark'));
                const recommendation = (0, dom_1.append)(this.element, (0, dom_1.$)('.recommendation'));
                (0, dom_1.append)(recommendation, (0, dom_1.$)('span' + themeService_1.ThemeIcon.asCSSSelector(extensionsIcons_1.ratingIcon)));
                const applyBookmarkStyle = (theme) => {
                    const bgColor = theme.getColor(extensionsActions_1.extensionButtonProminentBackground);
                    const fgColor = theme.getColor(extensionsActions_1.extensionButtonProminentForeground);
                    recommendation.style.borderTopColor = bgColor ? bgColor.toString() : 'transparent';
                    recommendation.style.color = fgColor ? fgColor.toString() : 'white';
                };
                applyBookmarkStyle(this.themeService.getColorTheme());
                this.themeService.onDidColorThemeChange(applyBookmarkStyle, this, this.disposables);
                this.tooltip = extRecommendations[this.extension.identifier.id.toLowerCase()].reasonText;
            }
        }
    };
    RecommendationWidget = __decorate([
        __param(1, themeService_1.IThemeService),
        __param(2, extensionRecommendations_1.IExtensionRecommendationsService)
    ], RecommendationWidget);
    exports.RecommendationWidget = RecommendationWidget;
    let RemoteBadgeWidget = class RemoteBadgeWidget extends ExtensionWidget {
        constructor(parent, tooltip, extensionManagementServerService, instantiationService) {
            super();
            this.tooltip = tooltip;
            this.extensionManagementServerService = extensionManagementServerService;
            this.instantiationService = instantiationService;
            this.remoteBadge = this._register(new lifecycle_1.MutableDisposable());
            this.element = (0, dom_1.append)(parent, (0, dom_1.$)('.extension-remote-badge-container'));
            this.render();
            this._register((0, lifecycle_1.toDisposable)(() => this.clear()));
        }
        clear() {
            if (this.remoteBadge.value) {
                this.element.removeChild(this.remoteBadge.value.element);
            }
            this.remoteBadge.clear();
        }
        render() {
            this.clear();
            if (!this.extension || !this.extension.local || !this.extension.server || !(this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) || this.extension.server !== this.extensionManagementServerService.remoteExtensionManagementServer) {
                return;
            }
            this.remoteBadge.value = this.instantiationService.createInstance(RemoteBadge, this.tooltip);
            (0, dom_1.append)(this.element, this.remoteBadge.value.element);
        }
    };
    RemoteBadgeWidget = __decorate([
        __param(2, extensionManagement_1.IExtensionManagementServerService),
        __param(3, instantiation_1.IInstantiationService)
    ], RemoteBadgeWidget);
    exports.RemoteBadgeWidget = RemoteBadgeWidget;
    let RemoteBadge = class RemoteBadge extends lifecycle_1.Disposable {
        constructor(tooltip, labelService, themeService, extensionManagementServerService) {
            super();
            this.tooltip = tooltip;
            this.labelService = labelService;
            this.themeService = themeService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.element = (0, dom_1.$)('div.extension-badge.extension-remote-badge');
            this.render();
        }
        render() {
            (0, dom_1.append)(this.element, (0, dom_1.$)('span' + themeService_1.ThemeIcon.asCSSSelector(extensionsIcons_1.remoteIcon)));
            const applyBadgeStyle = () => {
                if (!this.element) {
                    return;
                }
                const bgColor = this.themeService.getColorTheme().getColor(theme_1.EXTENSION_BADGE_REMOTE_BACKGROUND);
                const fgColor = this.themeService.getColorTheme().getColor(theme_1.EXTENSION_BADGE_REMOTE_FOREGROUND);
                this.element.style.backgroundColor = bgColor ? bgColor.toString() : '';
                this.element.style.color = fgColor ? fgColor.toString() : '';
            };
            applyBadgeStyle();
            this._register(this.themeService.onDidColorThemeChange(() => applyBadgeStyle()));
            if (this.tooltip) {
                const updateTitle = () => {
                    if (this.element && this.extensionManagementServerService.remoteExtensionManagementServer) {
                        this.element.title = (0, nls_1.localize)(3, null, this.extensionManagementServerService.remoteExtensionManagementServer.label);
                    }
                };
                this._register(this.labelService.onDidChangeFormatters(() => updateTitle()));
                updateTitle();
            }
        }
    };
    RemoteBadge = __decorate([
        __param(1, label_1.ILabelService),
        __param(2, themeService_1.IThemeService),
        __param(3, extensionManagement_1.IExtensionManagementServerService)
    ], RemoteBadge);
    class ExtensionPackCountWidget extends ExtensionWidget {
        constructor(parent) {
            super();
            this.parent = parent;
            this.render();
            this._register((0, lifecycle_1.toDisposable)(() => this.clear()));
        }
        clear() {
            if (this.element) {
                this.element.remove();
            }
        }
        render() {
            this.clear();
            if (!this.extension || !this.extension.extensionPack.length) {
                return;
            }
            this.element = (0, dom_1.append)(this.parent, (0, dom_1.$)('.extension-badge.extension-pack-badge'));
            const countBadge = new countBadge_1.CountBadge(this.element);
            countBadge.setCount(this.extension.extensionPack.length);
        }
    }
    exports.ExtensionPackCountWidget = ExtensionPackCountWidget;
    let SyncIgnoredWidget = class SyncIgnoredWidget extends ExtensionWidget {
        constructor(container, configurationService, extensionsWorkbenchService, userDataAutoSyncEnablementService) {
            super();
            this.configurationService = configurationService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.userDataAutoSyncEnablementService = userDataAutoSyncEnablementService;
            this.element = (0, dom_1.append)(container, (0, dom_1.$)('span.extension-sync-ignored' + themeService_1.ThemeIcon.asCSSSelector(extensionsIcons_1.syncIgnoredIcon)));
            this.element.title = (0, nls_1.localize)(4, null);
            this.element.classList.add(...themeService_1.ThemeIcon.asClassNameArray(extensionsIcons_1.syncIgnoredIcon));
            this.element.classList.add('hide');
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectedKeys.includes('settingsSync.ignoredExtensions'))(() => this.render()));
            this._register(userDataAutoSyncEnablementService.onDidChangeEnablement(() => this.update()));
            this.render();
        }
        render() {
            this.element.classList.toggle('hide', !(this.extension && this.extension.state === 1 /* Installed */ && this.userDataAutoSyncEnablementService.isEnabled() && this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension)));
        }
    };
    SyncIgnoredWidget = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, userDataSync_1.IUserDataAutoSyncEnablementService)
    ], SyncIgnoredWidget);
    exports.SyncIgnoredWidget = SyncIgnoredWidget;
    // Rating icon
    exports.extensionRatingIconColor = (0, colorRegistry_1.registerColor)('extensionIcon.starForeground', { light: '#DF6100', dark: '#FF8E00', hc: '#FF8E00' }, (0, nls_1.localize)(5, null), true);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const extensionRatingIcon = theme.getColor(exports.extensionRatingIconColor);
        if (extensionRatingIcon) {
            collector.addRule(`.extension-ratings .codicon-extensions-star-full, .extension-ratings .codicon-extensions-star-half { color: ${extensionRatingIcon}; }`);
        }
    });
});
//# sourceMappingURL=extensionsWidgets.js.map