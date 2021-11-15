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
define(["require", "exports", "vs/nls!vs/editor/contrib/hover/hover", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/editor/common/services/modeService", "vs/editor/contrib/hover/modesContentHover", "vs/editor/contrib/hover/modesGlyphHover", "vs/platform/opener/common/opener", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/editor/contrib/gotoSymbol/link/goToDefinitionAtPosition", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation"], function (require, exports, nls, keyCodes_1, lifecycle_1, editorExtensions_1, range_1, editorContextKeys_1, modeService_1, modesContentHover_1, modesGlyphHover_1, opener_1, colorRegistry_1, themeService_1, goToDefinitionAtPosition_1, contextkey_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModesHoverController = void 0;
    let ModesHoverController = class ModesHoverController {
        constructor(_editor, _instantiationService, _openerService, _modeService, _themeService, _contextKeyService) {
            this._editor = _editor;
            this._instantiationService = _instantiationService;
            this._openerService = _openerService;
            this._modeService = _modeService;
            this._themeService = _themeService;
            this._toUnhook = new lifecycle_1.DisposableStore();
            this._isMouseDown = false;
            this._hoverClicked = false;
            this._contentWidget = null;
            this._glyphWidget = null;
            this._hookEvents();
            this._didChangeConfigurationHandler = this._editor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(50 /* hover */)) {
                    this._unhookEvents();
                    this._hookEvents();
                }
            });
            this._hoverVisibleKey = editorContextKeys_1.EditorContextKeys.hoverVisible.bindTo(_contextKeyService);
        }
        static get(editor) {
            return editor.getContribution(ModesHoverController.ID);
        }
        _hookEvents() {
            const hideWidgetsEventHandler = () => this._hideWidgets();
            const hoverOpts = this._editor.getOption(50 /* hover */);
            this._isHoverEnabled = hoverOpts.enabled;
            this._isHoverSticky = hoverOpts.sticky;
            if (this._isHoverEnabled) {
                this._toUnhook.add(this._editor.onMouseDown((e) => this._onEditorMouseDown(e)));
                this._toUnhook.add(this._editor.onMouseUp((e) => this._onEditorMouseUp(e)));
                this._toUnhook.add(this._editor.onMouseMove((e) => this._onEditorMouseMove(e)));
                this._toUnhook.add(this._editor.onKeyDown((e) => this._onKeyDown(e)));
                this._toUnhook.add(this._editor.onDidChangeModelDecorations(() => this._onModelDecorationsChanged()));
            }
            else {
                this._toUnhook.add(this._editor.onMouseMove((e) => this._onEditorMouseMove(e)));
                this._toUnhook.add(this._editor.onKeyDown((e) => this._onKeyDown(e)));
            }
            this._toUnhook.add(this._editor.onMouseLeave(hideWidgetsEventHandler));
            this._toUnhook.add(this._editor.onDidChangeModel(hideWidgetsEventHandler));
            this._toUnhook.add(this._editor.onDidScrollChange((e) => this._onEditorScrollChanged(e)));
        }
        _unhookEvents() {
            this._toUnhook.clear();
        }
        _onModelDecorationsChanged() {
            var _a, _b;
            (_a = this._contentWidget) === null || _a === void 0 ? void 0 : _a.onModelDecorationsChanged();
            (_b = this._glyphWidget) === null || _b === void 0 ? void 0 : _b.onModelDecorationsChanged();
        }
        _onEditorScrollChanged(e) {
            if (e.scrollTopChanged || e.scrollLeftChanged) {
                this._hideWidgets();
            }
        }
        _onEditorMouseDown(mouseEvent) {
            this._isMouseDown = true;
            const targetType = mouseEvent.target.type;
            if (targetType === 9 /* CONTENT_WIDGET */ && mouseEvent.target.detail === modesContentHover_1.ModesContentHoverWidget.ID) {
                this._hoverClicked = true;
                // mouse down on top of content hover widget
                return;
            }
            if (targetType === 12 /* OVERLAY_WIDGET */ && mouseEvent.target.detail === modesGlyphHover_1.ModesGlyphHoverWidget.ID) {
                // mouse down on top of overlay hover widget
                return;
            }
            if (targetType !== 12 /* OVERLAY_WIDGET */ && mouseEvent.target.detail !== modesGlyphHover_1.ModesGlyphHoverWidget.ID) {
                this._hoverClicked = false;
            }
            this._hideWidgets();
        }
        _onEditorMouseUp(mouseEvent) {
            this._isMouseDown = false;
        }
        _onEditorMouseMove(mouseEvent) {
            var _a, _b, _c, _d, _e, _f;
            let targetType = mouseEvent.target.type;
            if (this._isMouseDown && this._hoverClicked) {
                return;
            }
            if (this._isHoverSticky && targetType === 9 /* CONTENT_WIDGET */ && mouseEvent.target.detail === modesContentHover_1.ModesContentHoverWidget.ID) {
                // mouse moved on top of content hover widget
                return;
            }
            if (this._isHoverSticky && !((_b = (_a = mouseEvent.event.browserEvent.view) === null || _a === void 0 ? void 0 : _a.getSelection()) === null || _b === void 0 ? void 0 : _b.isCollapsed)) {
                // selected text within content hover widget
                return;
            }
            if (!this._isHoverSticky && targetType === 9 /* CONTENT_WIDGET */ && mouseEvent.target.detail === modesContentHover_1.ModesContentHoverWidget.ID
                && ((_c = this._contentWidget) === null || _c === void 0 ? void 0 : _c.isColorPickerVisible())) {
                // though the hover is not sticky, the color picker needs to.
                return;
            }
            if (this._isHoverSticky && targetType === 12 /* OVERLAY_WIDGET */ && mouseEvent.target.detail === modesGlyphHover_1.ModesGlyphHoverWidget.ID) {
                // mouse moved on top of overlay hover widget
                return;
            }
            if (targetType === 7 /* CONTENT_EMPTY */) {
                const epsilon = this._editor.getOption(40 /* fontInfo */).typicalHalfwidthCharacterWidth / 2;
                const data = mouseEvent.target.detail;
                if (data && !data.isAfterLines && typeof data.horizontalDistanceToText === 'number' && data.horizontalDistanceToText < epsilon) {
                    // Let hover kick in even when the mouse is technically in the empty area after a line, given the distance is small enough
                    targetType = 6 /* CONTENT_TEXT */;
                }
            }
            if (targetType === 6 /* CONTENT_TEXT */) {
                (_d = this._glyphWidget) === null || _d === void 0 ? void 0 : _d.hide();
                if (this._isHoverEnabled && mouseEvent.target.range) {
                    // TODO@rebornix. This should be removed if we move Color Picker out of Hover component.
                    // Check if mouse is hovering on color decorator
                    const hoverOnColorDecorator = [...((_e = mouseEvent.target.element) === null || _e === void 0 ? void 0 : _e.classList.values()) || []].find(className => className.startsWith('ced-colorBox'))
                        && mouseEvent.target.range.endColumn - mouseEvent.target.range.startColumn === 1;
                    const showAtRange = (hoverOnColorDecorator // shift the mouse focus by one as color decorator is a `before` decoration of next character.
                        ? new range_1.Range(mouseEvent.target.range.startLineNumber, mouseEvent.target.range.startColumn + 1, mouseEvent.target.range.endLineNumber, mouseEvent.target.range.endColumn + 1)
                        : mouseEvent.target.range);
                    if (!this._contentWidget) {
                        this._contentWidget = new modesContentHover_1.ModesContentHoverWidget(this._editor, this._hoverVisibleKey, this._instantiationService, this._themeService);
                    }
                    this._contentWidget.startShowingAt(showAtRange, 0 /* Delayed */, false);
                }
            }
            else if (targetType === 2 /* GUTTER_GLYPH_MARGIN */) {
                (_f = this._contentWidget) === null || _f === void 0 ? void 0 : _f.hide();
                if (this._isHoverEnabled && mouseEvent.target.position) {
                    if (!this._glyphWidget) {
                        this._glyphWidget = new modesGlyphHover_1.ModesGlyphHoverWidget(this._editor, this._modeService, this._openerService);
                    }
                    this._glyphWidget.startShowingAt(mouseEvent.target.position.lineNumber);
                }
            }
            else {
                this._hideWidgets();
            }
        }
        _onKeyDown(e) {
            if (e.keyCode !== 5 /* Ctrl */ && e.keyCode !== 6 /* Alt */ && e.keyCode !== 57 /* Meta */ && e.keyCode !== 4 /* Shift */) {
                // Do not hide hover when a modifier key is pressed
                this._hideWidgets();
            }
        }
        _hideWidgets() {
            var _a, _b, _c;
            if ((this._isMouseDown && this._hoverClicked && ((_a = this._contentWidget) === null || _a === void 0 ? void 0 : _a.isColorPickerVisible()))) {
                return;
            }
            this._hoverClicked = false;
            (_b = this._glyphWidget) === null || _b === void 0 ? void 0 : _b.hide();
            (_c = this._contentWidget) === null || _c === void 0 ? void 0 : _c.hide();
        }
        isColorPickerVisible() {
            var _a;
            return ((_a = this._contentWidget) === null || _a === void 0 ? void 0 : _a.isColorPickerVisible()) || false;
        }
        showContentHover(range, mode, focus) {
            if (!this._contentWidget) {
                this._contentWidget = new modesContentHover_1.ModesContentHoverWidget(this._editor, this._hoverVisibleKey, this._instantiationService, this._themeService);
            }
            this._contentWidget.startShowingAt(range, mode, focus);
        }
        dispose() {
            var _a, _b;
            this._unhookEvents();
            this._toUnhook.dispose();
            this._didChangeConfigurationHandler.dispose();
            (_a = this._glyphWidget) === null || _a === void 0 ? void 0 : _a.dispose();
            (_b = this._contentWidget) === null || _b === void 0 ? void 0 : _b.dispose();
        }
    };
    ModesHoverController.ID = 'editor.contrib.hover';
    ModesHoverController = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, opener_1.IOpenerService),
        __param(3, modeService_1.IModeService),
        __param(4, themeService_1.IThemeService),
        __param(5, contextkey_1.IContextKeyService)
    ], ModesHoverController);
    exports.ModesHoverController = ModesHoverController;
    class ShowHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.showHover',
                label: nls.localize(0, null),






                alias: 'Show Hover',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 39 /* KEY_I */),
                    weight: 100 /* EditorContrib */
                }
            });
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            let controller = ModesHoverController.get(editor);
            if (!controller) {
                return;
            }
            const position = editor.getPosition();
            const range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
            const focus = editor.getOption(2 /* accessibilitySupport */) === 2 /* Enabled */;
            controller.showContentHover(range, 1 /* Immediate */, focus);
        }
    }
    class ShowDefinitionPreviewHoverAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.showDefinitionPreviewHover',
                label: nls.localize(1, null),






                alias: 'Show Definition Preview Hover',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            let controller = ModesHoverController.get(editor);
            if (!controller) {
                return;
            }
            const position = editor.getPosition();
            if (!position) {
                return;
            }
            const range = new range_1.Range(position.lineNumber, position.column, position.lineNumber, position.column);
            const goto = goToDefinitionAtPosition_1.GotoDefinitionAtPositionEditorContribution.get(editor);
            const promise = goto.startFindDefinitionFromCursor(position);
            promise.then(() => {
                controller.showContentHover(range, 1 /* Immediate */, true);
            });
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(ModesHoverController.ID, ModesHoverController);
    (0, editorExtensions_1.registerEditorAction)(ShowHoverAction);
    (0, editorExtensions_1.registerEditorAction)(ShowDefinitionPreviewHoverAction);
    // theming
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const editorHoverHighlightColor = theme.getColor(colorRegistry_1.editorHoverHighlight);
        if (editorHoverHighlightColor) {
            collector.addRule(`.monaco-editor .hoverHighlight { background-color: ${editorHoverHighlightColor}; }`);
        }
        const hoverBackground = theme.getColor(colorRegistry_1.editorHoverBackground);
        if (hoverBackground) {
            collector.addRule(`.monaco-editor .monaco-hover { background-color: ${hoverBackground}; }`);
        }
        const hoverBorder = theme.getColor(colorRegistry_1.editorHoverBorder);
        if (hoverBorder) {
            collector.addRule(`.monaco-editor .monaco-hover { border: 1px solid ${hoverBorder}; }`);
            collector.addRule(`.monaco-editor .monaco-hover .hover-row:not(:first-child):not(:empty) { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
            collector.addRule(`.monaco-editor .monaco-hover hr { border-top: 1px solid ${hoverBorder.transparent(0.5)}; }`);
            collector.addRule(`.monaco-editor .monaco-hover hr { border-bottom: 0px solid ${hoverBorder.transparent(0.5)}; }`);
        }
        const link = theme.getColor(colorRegistry_1.textLinkForeground);
        if (link) {
            collector.addRule(`.monaco-editor .monaco-hover a { color: ${link}; }`);
        }
        const hoverForeground = theme.getColor(colorRegistry_1.editorHoverForeground);
        if (hoverForeground) {
            collector.addRule(`.monaco-editor .monaco-hover { color: ${hoverForeground}; }`);
        }
        const actionsBackground = theme.getColor(colorRegistry_1.editorHoverStatusBarBackground);
        if (actionsBackground) {
            collector.addRule(`.monaco-editor .monaco-hover .hover-row .actions { background-color: ${actionsBackground}; }`);
        }
        const codeBackground = theme.getColor(colorRegistry_1.textCodeBlockBackground);
        if (codeBackground) {
            collector.addRule(`.monaco-editor .monaco-hover code { background-color: ${codeBackground}; }`);
        }
    });
});
//# sourceMappingURL=hover.js.map