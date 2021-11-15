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
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/browser/exceptionWidget", "vs/base/browser/dom", "vs/editor/contrib/zoneWidget/zoneWidget", "vs/workbench/contrib/debug/common/debug", "vs/base/common/async", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/debug/browser/linkDetector", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/platform/theme/common/iconRegistry", "vs/css!./media/exceptionWidget"], function (require, exports, nls, dom, zoneWidget_1, debug_1, async_1, themeService_1, colorRegistry_1, instantiation_1, linkDetector_1, actionbar_1, actions_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExceptionWidget = exports.debugExceptionWidgetBackground = exports.debugExceptionWidgetBorder = void 0;
    const $ = dom.$;
    // theming
    exports.debugExceptionWidgetBorder = (0, colorRegistry_1.registerColor)('debugExceptionWidget.border', { dark: '#a31515', light: '#a31515', hc: '#a31515' }, nls.localize(0, null));
    exports.debugExceptionWidgetBackground = (0, colorRegistry_1.registerColor)('debugExceptionWidget.background', { dark: '#420b0d', light: '#f1dfde', hc: '#420b0d' }, nls.localize(1, null));
    let ExceptionWidget = class ExceptionWidget extends zoneWidget_1.ZoneWidget {
        constructor(editor, exceptionInfo, debugSession, themeService, instantiationService) {
            super(editor, { showFrame: true, showArrow: true, isAccessible: true, frameWidth: 1, className: 'exception-widget-container' });
            this.exceptionInfo = exceptionInfo;
            this.debugSession = debugSession;
            this.instantiationService = instantiationService;
            this.applyTheme(themeService.getColorTheme());
            this._disposables.add(themeService.onDidColorThemeChange(this.applyTheme.bind(this)));
            this.create();
            const onDidLayoutChangeScheduler = new async_1.RunOnceScheduler(() => this._doLayout(undefined, undefined), 50);
            this._disposables.add(this.editor.onDidLayoutChange(() => onDidLayoutChangeScheduler.schedule()));
            this._disposables.add(onDidLayoutChangeScheduler);
        }
        applyTheme(theme) {
            this.backgroundColor = theme.getColor(exports.debugExceptionWidgetBackground);
            const frameColor = theme.getColor(exports.debugExceptionWidgetBorder);
            this.style({
                arrowColor: frameColor,
                frameColor: frameColor
            }); // style() will trigger _applyStyles
        }
        _applyStyles() {
            if (this.container) {
                this.container.style.backgroundColor = this.backgroundColor ? this.backgroundColor.toString() : '';
            }
            super._applyStyles();
        }
        _fillContainer(container) {
            this.setCssClass('exception-widget');
            // Set the font size and line height to the one from the editor configuration.
            const fontInfo = this.editor.getOption(40 /* fontInfo */);
            container.style.fontSize = `${fontInfo.fontSize}px`;
            container.style.lineHeight = `${fontInfo.lineHeight}px`;
            container.tabIndex = 0;
            const title = $('.title');
            const label = $('.label');
            dom.append(title, label);
            const actions = $('.actions');
            dom.append(title, actions);
            label.textContent = this.exceptionInfo.id ? nls.localize(2, null, this.exceptionInfo.id) : nls.localize(3, null);
            let ariaLabel = label.textContent;
            const actionBar = new actionbar_1.ActionBar(actions);
            actionBar.push(new actions_1.Action('editor.closeExceptionWidget', nls.localize(4, null), themeService_1.ThemeIcon.asClassName(iconRegistry_1.widgetClose), true, async () => {
                const contribution = this.editor.getContribution(debug_1.EDITOR_CONTRIBUTION_ID);
                contribution.closeExceptionWidget();
            }), { label: false, icon: true });
            dom.append(container, title);
            if (this.exceptionInfo.description) {
                let description = $('.description');
                description.textContent = this.exceptionInfo.description;
                ariaLabel += ', ' + this.exceptionInfo.description;
                dom.append(container, description);
            }
            if (this.exceptionInfo.details && this.exceptionInfo.details.stackTrace) {
                let stackTrace = $('.stack-trace');
                const linkDetector = this.instantiationService.createInstance(linkDetector_1.LinkDetector);
                const linkedStackTrace = linkDetector.linkify(this.exceptionInfo.details.stackTrace, true, this.debugSession ? this.debugSession.root : undefined);
                stackTrace.appendChild(linkedStackTrace);
                dom.append(container, stackTrace);
                ariaLabel += ', ' + this.exceptionInfo.details.stackTrace;
            }
            container.setAttribute('aria-label', ariaLabel);
        }
        _doLayout(_heightInPixel, _widthInPixel) {
            // Reload the height with respect to the exception text content and relayout it to match the line count.
            this.container.style.height = 'initial';
            const lineHeight = this.editor.getOption(55 /* lineHeight */);
            const arrowHeight = Math.round(lineHeight / 3);
            const computedLinesNumber = Math.ceil((this.container.offsetHeight + arrowHeight) / lineHeight);
            this._relayout(computedLinesNumber);
        }
        focus() {
            var _a;
            // Focus into the container for accessibility purposes so the exception and stack trace gets read
            (_a = this.container) === null || _a === void 0 ? void 0 : _a.focus();
        }
        hasfocus() {
            return dom.isAncestor(document.activeElement, this.container);
        }
    };
    ExceptionWidget = __decorate([
        __param(3, themeService_1.IThemeService),
        __param(4, instantiation_1.IInstantiationService)
    ], ExceptionWidget);
    exports.ExceptionWidget = ExceptionWidget;
});
//# sourceMappingURL=exceptionWidget.js.map