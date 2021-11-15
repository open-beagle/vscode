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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/progress/common/progress", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/memento", "vs/workbench/common/views", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webview/browser/webviewWindowDragMonitor", "vs/workbench/contrib/webviewView/browser/webviewViewService", "vs/workbench/services/extensions/common/extensions"], function (require, exports, DOM, cancellation_1, event_1, lifecycle_1, platform_1, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, keybinding_1, opener_1, progress_1, storage_1, telemetry_1, themeService_1, viewPane_1, memento_1, views_1, webview_1, webviewWindowDragMonitor_1, webviewViewService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewViewPane = void 0;
    const storageKeys = {
        webviewState: 'webviewState',
    };
    let WebviewViewPane = class WebviewViewPane extends viewPane_1.ViewPane {
        constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, storageService, extensionService, progressService, webviewService, webviewViewService, viewService) {
            super(Object.assign(Object.assign({}, options), { titleMenuId: actions_1.MenuId.ViewTitle }), keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.extensionService = extensionService;
            this.progressService = progressService;
            this.webviewService = webviewService;
            this.webviewViewService = webviewViewService;
            this.viewService = viewService;
            this._webview = this._register(new lifecycle_1.MutableDisposable());
            this._webviewDisposables = this._register(new lifecycle_1.DisposableStore());
            this._activated = false;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this._onDispose = this._register(new event_1.Emitter());
            this.onDispose = this._onDispose.event;
            this.defaultTitle = this.title;
            this.memento = new memento_1.Memento(`webviewView.${this.id}`, storageService);
            this.viewState = this.memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
            this._register(this.onDidChangeBodyVisibility(() => this.updateTreeVisibility()));
            this._register(this.webviewViewService.onNewResolverRegistered(e => {
                if (e.viewType === this.id) {
                    // Potentially re-activate if we have a new resolver
                    this.updateTreeVisibility();
                }
            }));
            this.updateTreeVisibility();
        }
        dispose() {
            this._onDispose.fire();
            super.dispose();
        }
        focus() {
            var _a;
            super.focus();
            (_a = this._webview.value) === null || _a === void 0 ? void 0 : _a.focus();
        }
        renderBody(container) {
            super.renderBody(container);
            this._container = container;
            if (!this._resizeObserver) {
                this._resizeObserver = new ResizeObserver(() => {
                    (0, platform_1.setImmediate)(() => {
                        var _a;
                        if (this._container) {
                            (_a = this._webview.value) === null || _a === void 0 ? void 0 : _a.layoutWebviewOverElement(this._container);
                        }
                    });
                });
                this._register((0, lifecycle_1.toDisposable)(() => {
                    this._resizeObserver.disconnect();
                }));
                this._resizeObserver.observe(container);
            }
        }
        saveState() {
            if (this._webview.value) {
                this.viewState[storageKeys.webviewState] = this._webview.value.state;
            }
            this.memento.saveMemento();
            super.saveState();
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            if (!this._webview.value) {
                return;
            }
            if (this._container) {
                this._webview.value.layoutWebviewOverElement(this._container, new DOM.Dimension(width, height));
            }
        }
        updateTreeVisibility() {
            var _a, _b;
            if (this.isBodyVisible()) {
                this.activate();
                (_a = this._webview.value) === null || _a === void 0 ? void 0 : _a.claim(this, undefined);
            }
            else {
                (_b = this._webview.value) === null || _b === void 0 ? void 0 : _b.release(this);
            }
        }
        activate() {
            var _a;
            if (!this._activated) {
                this._activated = true;
                const webviewId = `webviewView-${this.id.replace(/[^a-z0-9]/gi, '-')}`.toLowerCase();
                const webview = this.webviewService.createWebviewOverlay(webviewId, {}, {}, undefined);
                webview.state = this.viewState[storageKeys.webviewState];
                this._webview.value = webview;
                if (this._container) {
                    (_a = this._webview.value) === null || _a === void 0 ? void 0 : _a.layoutWebviewOverElement(this._container);
                }
                this._webviewDisposables.add((0, lifecycle_1.toDisposable)(() => {
                    var _a;
                    (_a = this._webview.value) === null || _a === void 0 ? void 0 : _a.release(this);
                }));
                this._webviewDisposables.add(webview.onDidUpdateState(() => {
                    this.viewState[storageKeys.webviewState] = webview.state;
                }));
                this._webviewDisposables.add(new webviewWindowDragMonitor_1.WebviewWindowDragMonitor(() => this._webview.value));
                const source = this._webviewDisposables.add(new cancellation_1.CancellationTokenSource());
                this.withProgress(async () => {
                    await this.extensionService.activateByEvent(`onView:${this.id}`);
                    let self = this;
                    const webviewView = {
                        webview,
                        onDidChangeVisibility: this.onDidChangeBodyVisibility,
                        onDispose: this.onDispose,
                        get title() { return self.setTitle; },
                        set title(value) { self.updateTitle(value); },
                        get description() { return self.titleDescription; },
                        set description(value) { self.updateTitleDescription(value); },
                        dispose: () => {
                            // Only reset and clear the webview itself. Don't dispose of the view container
                            this._activated = false;
                            this._webview.clear();
                            this._webviewDisposables.clear();
                        },
                        show: (preserveFocus) => {
                            this.viewService.openView(this.id, !preserveFocus);
                        }
                    };
                    await this.webviewViewService.resolve(this.id, webviewView, source.token);
                });
            }
        }
        updateTitle(value) {
            this.setTitle = value;
            super.updateTitle(typeof value === 'string' ? value : this.defaultTitle);
        }
        async withProgress(task) {
            return this.progressService.withProgress({ location: this.id, delay: 500 }, task);
        }
    };
    WebviewViewPane = __decorate([
        __param(1, keybinding_1.IKeybindingService),
        __param(2, contextView_1.IContextMenuService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, views_1.IViewDescriptorService),
        __param(6, instantiation_1.IInstantiationService),
        __param(7, opener_1.IOpenerService),
        __param(8, themeService_1.IThemeService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, storage_1.IStorageService),
        __param(11, extensions_1.IExtensionService),
        __param(12, progress_1.IProgressService),
        __param(13, webview_1.IWebviewService),
        __param(14, webviewViewService_1.IWebviewViewService),
        __param(15, views_1.IViewsService)
    ], WebviewViewPane);
    exports.WebviewViewPane = WebviewViewPane;
});
//# sourceMappingURL=webviewViewPane.js.map