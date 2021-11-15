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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/actions", "vs/base/common/color", "vs/base/common/event", "vs/base/common/objects", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/contrib/zoneWidget/zoneWidget", "vs/nls!vs/editor/contrib/peekView/peekView", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/editor/browser/editorExtensions", "vs/platform/theme/common/colorRegistry", "vs/base/common/codicons", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/css!./media/peekViewWidget"], function (require, exports, dom, actionbar_1, actions_1, color_1, event_1, objects, codeEditorService_1, embeddedCodeEditorWidget_1, zoneWidget_1, nls, contextkey_1, instantiation_1, extensions_1, editorExtensions_1, colorRegistry_1, codicons_1, menuEntryActionViewItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.peekViewEditorMatchHighlightBorder = exports.peekViewEditorMatchHighlight = exports.peekViewResultsMatchHighlight = exports.peekViewEditorGutterBackground = exports.peekViewEditorBackground = exports.peekViewResultsSelectionForeground = exports.peekViewResultsSelectionBackground = exports.peekViewResultsFileForeground = exports.peekViewResultsMatchForeground = exports.peekViewResultsBackground = exports.peekViewBorder = exports.peekViewTitleInfoForeground = exports.peekViewTitleForeground = exports.peekViewTitleBackground = exports.PeekViewWidget = exports.getOuterEditor = exports.PeekContext = exports.IPeekViewService = void 0;
    exports.IPeekViewService = (0, instantiation_1.createDecorator)('IPeekViewService');
    (0, extensions_1.registerSingleton)(exports.IPeekViewService, class {
        constructor() {
            this._widgets = new Map();
        }
        addExclusiveWidget(editor, widget) {
            const existing = this._widgets.get(editor);
            if (existing) {
                existing.listener.dispose();
                existing.widget.dispose();
            }
            const remove = () => {
                const data = this._widgets.get(editor);
                if (data && data.widget === widget) {
                    data.listener.dispose();
                    this._widgets.delete(editor);
                }
            };
            this._widgets.set(editor, { widget, listener: widget.onDidClose(remove) });
        }
    });
    var PeekContext;
    (function (PeekContext) {
        PeekContext.inPeekEditor = new contextkey_1.RawContextKey('inReferenceSearchEditor', true, nls.localize(0, null));
        PeekContext.notInPeekEditor = PeekContext.inPeekEditor.toNegated();
    })(PeekContext = exports.PeekContext || (exports.PeekContext = {}));
    let PeekContextController = class PeekContextController {
        constructor(editor, contextKeyService) {
            if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
                PeekContext.inPeekEditor.bindTo(contextKeyService);
            }
        }
        dispose() { }
    };
    PeekContextController.ID = 'editor.contrib.referenceController';
    PeekContextController = __decorate([
        __param(1, contextkey_1.IContextKeyService)
    ], PeekContextController);
    (0, editorExtensions_1.registerEditorContribution)(PeekContextController.ID, PeekContextController);
    function getOuterEditor(accessor) {
        let editor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
        if (editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget) {
            return editor.getParentEditor();
        }
        return editor;
    }
    exports.getOuterEditor = getOuterEditor;
    const defaultOptions = {
        headerBackgroundColor: color_1.Color.white,
        primaryHeadingColor: color_1.Color.fromHex('#333333'),
        secondaryHeadingColor: color_1.Color.fromHex('#6c6c6cb3')
    };
    let PeekViewWidget = class PeekViewWidget extends zoneWidget_1.ZoneWidget {
        constructor(editor, options, instantiationService) {
            super(editor, options);
            this.instantiationService = instantiationService;
            this._onDidClose = new event_1.Emitter();
            this.onDidClose = this._onDidClose.event;
            objects.mixin(this.options, defaultOptions, false);
        }
        dispose() {
            if (!this.disposed) {
                this.disposed = true; // prevent consumers who dispose on onDidClose from looping
                super.dispose();
                this._onDidClose.fire(this);
            }
        }
        style(styles) {
            let options = this.options;
            if (styles.headerBackgroundColor) {
                options.headerBackgroundColor = styles.headerBackgroundColor;
            }
            if (styles.primaryHeadingColor) {
                options.primaryHeadingColor = styles.primaryHeadingColor;
            }
            if (styles.secondaryHeadingColor) {
                options.secondaryHeadingColor = styles.secondaryHeadingColor;
            }
            super.style(styles);
        }
        _applyStyles() {
            super._applyStyles();
            let options = this.options;
            if (this._headElement && options.headerBackgroundColor) {
                this._headElement.style.backgroundColor = options.headerBackgroundColor.toString();
            }
            if (this._primaryHeading && options.primaryHeadingColor) {
                this._primaryHeading.style.color = options.primaryHeadingColor.toString();
            }
            if (this._secondaryHeading && options.secondaryHeadingColor) {
                this._secondaryHeading.style.color = options.secondaryHeadingColor.toString();
            }
            if (this._bodyElement && options.frameColor) {
                this._bodyElement.style.borderColor = options.frameColor.toString();
            }
        }
        _fillContainer(container) {
            this.setCssClass('peekview-widget');
            this._headElement = dom.$('.head');
            this._bodyElement = dom.$('.body');
            this._fillHead(this._headElement);
            this._fillBody(this._bodyElement);
            container.appendChild(this._headElement);
            container.appendChild(this._bodyElement);
        }
        _fillHead(container, noCloseAction) {
            const titleElement = dom.$('.peekview-title');
            dom.append(this._headElement, titleElement);
            dom.addStandardDisposableListener(titleElement, 'click', event => this._onTitleClick(event));
            this._fillTitleIcon(titleElement);
            this._primaryHeading = dom.$('span.filename');
            this._secondaryHeading = dom.$('span.dirname');
            this._metaHeading = dom.$('span.meta');
            dom.append(titleElement, this._primaryHeading, this._secondaryHeading, this._metaHeading);
            const actionsContainer = dom.$('.peekview-actions');
            dom.append(this._headElement, actionsContainer);
            const actionBarOptions = this._getActionBarOptions();
            this._actionbarWidget = new actionbar_1.ActionBar(actionsContainer, actionBarOptions);
            this._disposables.add(this._actionbarWidget);
            if (!noCloseAction) {
                this._actionbarWidget.push(new actions_1.Action('peekview.close', nls.localize(1, null), codicons_1.Codicon.close.classNames, true, () => {
                    this.dispose();
                    return Promise.resolve();
                }), { label: false, icon: true });
            }
        }
        _fillTitleIcon(container) {
        }
        _getActionBarOptions() {
            return {
                actionViewItemProvider: menuEntryActionViewItem_1.createActionViewItem.bind(undefined, this.instantiationService),
                orientation: 0 /* HORIZONTAL */
            };
        }
        _onTitleClick(event) {
            // implement me
        }
        setTitle(primaryHeading, secondaryHeading) {
            if (this._primaryHeading && this._secondaryHeading) {
                this._primaryHeading.innerText = primaryHeading;
                this._primaryHeading.setAttribute('aria-label', primaryHeading);
                if (secondaryHeading) {
                    this._secondaryHeading.innerText = secondaryHeading;
                }
                else {
                    dom.clearNode(this._secondaryHeading);
                }
            }
        }
        setMetaTitle(value) {
            if (this._metaHeading) {
                if (value) {
                    this._metaHeading.innerText = value;
                    dom.show(this._metaHeading);
                }
                else {
                    dom.hide(this._metaHeading);
                }
            }
        }
        _doLayout(heightInPixel, widthInPixel) {
            if (!this._isShowing && heightInPixel < 0) {
                // Looks like the view zone got folded away!
                this.dispose();
                return;
            }
            const headHeight = Math.ceil(this.editor.getOption(55 /* lineHeight */) * 1.2);
            const bodyHeight = Math.round(heightInPixel - (headHeight + 2 /* the border-top/bottom width*/));
            this._doLayoutHead(headHeight, widthInPixel);
            this._doLayoutBody(bodyHeight, widthInPixel);
        }
        _doLayoutHead(heightInPixel, widthInPixel) {
            if (this._headElement) {
                this._headElement.style.height = `${heightInPixel}px`;
                this._headElement.style.lineHeight = this._headElement.style.height;
            }
        }
        _doLayoutBody(heightInPixel, widthInPixel) {
            if (this._bodyElement) {
                this._bodyElement.style.height = `${heightInPixel}px`;
            }
        }
    };
    PeekViewWidget = __decorate([
        __param(2, instantiation_1.IInstantiationService)
    ], PeekViewWidget);
    exports.PeekViewWidget = PeekViewWidget;
    exports.peekViewTitleBackground = (0, colorRegistry_1.registerColor)('peekViewTitle.background', { dark: '#1E1E1E', light: '#FFFFFF', hc: '#0C141F' }, nls.localize(2, null));
    exports.peekViewTitleForeground = (0, colorRegistry_1.registerColor)('peekViewTitleLabel.foreground', { dark: '#FFFFFF', light: '#333333', hc: '#FFFFFF' }, nls.localize(3, null));
    exports.peekViewTitleInfoForeground = (0, colorRegistry_1.registerColor)('peekViewTitleDescription.foreground', { dark: '#ccccccb3', light: '#616161e6', hc: '#FFFFFF99' }, nls.localize(4, null));
    exports.peekViewBorder = (0, colorRegistry_1.registerColor)('peekView.border', { dark: '#007acc', light: '#007acc', hc: colorRegistry_1.contrastBorder }, nls.localize(5, null));
    exports.peekViewResultsBackground = (0, colorRegistry_1.registerColor)('peekViewResult.background', { dark: '#252526', light: '#F3F3F3', hc: color_1.Color.black }, nls.localize(6, null));
    exports.peekViewResultsMatchForeground = (0, colorRegistry_1.registerColor)('peekViewResult.lineForeground', { dark: '#bbbbbb', light: '#646465', hc: color_1.Color.white }, nls.localize(7, null));
    exports.peekViewResultsFileForeground = (0, colorRegistry_1.registerColor)('peekViewResult.fileForeground', { dark: color_1.Color.white, light: '#1E1E1E', hc: color_1.Color.white }, nls.localize(8, null));
    exports.peekViewResultsSelectionBackground = (0, colorRegistry_1.registerColor)('peekViewResult.selectionBackground', { dark: '#3399ff33', light: '#3399ff33', hc: null }, nls.localize(9, null));
    exports.peekViewResultsSelectionForeground = (0, colorRegistry_1.registerColor)('peekViewResult.selectionForeground', { dark: color_1.Color.white, light: '#6C6C6C', hc: color_1.Color.white }, nls.localize(10, null));
    exports.peekViewEditorBackground = (0, colorRegistry_1.registerColor)('peekViewEditor.background', { dark: '#001F33', light: '#F2F8FC', hc: color_1.Color.black }, nls.localize(11, null));
    exports.peekViewEditorGutterBackground = (0, colorRegistry_1.registerColor)('peekViewEditorGutter.background', { dark: exports.peekViewEditorBackground, light: exports.peekViewEditorBackground, hc: exports.peekViewEditorBackground }, nls.localize(12, null));
    exports.peekViewResultsMatchHighlight = (0, colorRegistry_1.registerColor)('peekViewResult.matchHighlightBackground', { dark: '#ea5c004d', light: '#ea5c004d', hc: null }, nls.localize(13, null));
    exports.peekViewEditorMatchHighlight = (0, colorRegistry_1.registerColor)('peekViewEditor.matchHighlightBackground', { dark: '#ff8f0099', light: '#f5d802de', hc: null }, nls.localize(14, null));
    exports.peekViewEditorMatchHighlightBorder = (0, colorRegistry_1.registerColor)('peekViewEditor.matchHighlightBorder', { dark: null, light: null, hc: colorRegistry_1.activeContrastBorder }, nls.localize(15, null));
});
//# sourceMappingURL=peekView.js.map