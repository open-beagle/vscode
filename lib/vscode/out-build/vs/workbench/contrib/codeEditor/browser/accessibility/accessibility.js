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
define(["require", "exports", "vs/nls!vs/workbench/contrib/codeEditor/browser/accessibility/accessibility", "vs/base/browser/dom", "vs/base/browser/fastDomNode", "vs/base/browser/formattedTextRenderer", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/widget", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/base/common/uri", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/contrib/toggleTabFocusMode/toggleTabFocusMode", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/opener/common/opener", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/workbench/contrib/files/browser/fileCommands", "vs/editor/browser/services/codeEditorService", "vs/css!./accessibility"], function (require, exports, nls, dom, fastDomNode_1, formattedTextRenderer_1, aria_1, widget_1, lifecycle_1, platform, strings, uri_1, editorExtensions_1, editorContextKeys_1, toggleTabFocusMode_1, configuration_1, contextkey_1, instantiation_1, keybinding_1, opener_1, colorRegistry_1, themeService_1, actions_1, commands_1, fileCommands_1, codeEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AccessibilityHelpController = void 0;
    const CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE = new contextkey_1.RawContextKey('accessibilityHelpWidgetVisible', false);
    let AccessibilityHelpController = class AccessibilityHelpController extends lifecycle_1.Disposable {
        constructor(editor, instantiationService) {
            super();
            this._editor = editor;
            this._widget = this._register(instantiationService.createInstance(AccessibilityHelpWidget, this._editor));
        }
        static get(editor) {
            return editor.getContribution(AccessibilityHelpController.ID);
        }
        show() {
            this._widget.show();
        }
        hide() {
            this._widget.hide();
        }
    };
    AccessibilityHelpController.ID = 'editor.contrib.accessibilityHelpController';
    AccessibilityHelpController = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], AccessibilityHelpController);
    exports.AccessibilityHelpController = AccessibilityHelpController;
    let AccessibilityHelpWidget = class AccessibilityHelpWidget extends widget_1.Widget {
        constructor(editor, _contextKeyService, _keybindingService, _configurationService, _openerService) {
            super();
            this._contextKeyService = _contextKeyService;
            this._keybindingService = _keybindingService;
            this._configurationService = _configurationService;
            this._openerService = _openerService;
            this._editor = editor;
            this._isVisibleKey = CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE.bindTo(this._contextKeyService);
            this._domNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this._domNode.setClassName('accessibilityHelpWidget');
            this._domNode.setWidth(AccessibilityHelpWidget.WIDTH);
            this._domNode.setHeight(AccessibilityHelpWidget.HEIGHT);
            this._domNode.setDisplay('none');
            this._domNode.setAttribute('role', 'dialog');
            this._domNode.setAttribute('aria-hidden', 'true');
            this._contentDomNode = (0, fastDomNode_1.createFastDomNode)(document.createElement('div'));
            this._contentDomNode.setAttribute('role', 'document');
            this._domNode.appendChild(this._contentDomNode);
            this._isVisible = false;
            this._register(this._editor.onDidLayoutChange(() => {
                if (this._isVisible) {
                    this._layout();
                }
            }));
            // Intentionally not configurable!
            this._register(dom.addStandardDisposableListener(this._contentDomNode.domNode, 'keydown', (e) => {
                if (!this._isVisible) {
                    return;
                }
                if (e.equals(2048 /* CtrlCmd */ | 35 /* KEY_E */)) {
                    (0, aria_1.alert)(nls.localize(0, null));
                    this._configurationService.updateValue('editor.accessibilitySupport', 'on');
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (e.equals(2048 /* CtrlCmd */ | 38 /* KEY_H */)) {
                    (0, aria_1.alert)(nls.localize(1, null));
                    this._openerService.open(uri_1.URI.parse('https://go.microsoft.com/fwlink/?linkid=851010'));
                    e.preventDefault();
                    e.stopPropagation();
                }
            }));
            this.onblur(this._contentDomNode.domNode, () => {
                this.hide();
            });
            this._editor.addOverlayWidget(this);
        }
        dispose() {
            this._editor.removeOverlayWidget(this);
            super.dispose();
        }
        getId() {
            return AccessibilityHelpWidget.ID;
        }
        getDomNode() {
            return this._domNode.domNode;
        }
        getPosition() {
            return {
                preference: null
            };
        }
        show() {
            if (this._isVisible) {
                return;
            }
            this._isVisible = true;
            this._isVisibleKey.set(true);
            this._layout();
            this._domNode.setDisplay('block');
            this._domNode.setAttribute('aria-hidden', 'false');
            this._contentDomNode.domNode.tabIndex = 0;
            this._buildContent();
            this._contentDomNode.domNode.focus();
        }
        _descriptionForCommand(commandId, msg, noKbMsg) {
            let kb = this._keybindingService.lookupKeybinding(commandId);
            if (kb) {
                return strings.format(msg, kb.getAriaLabel());
            }
            return strings.format(noKbMsg, commandId);
        }
        _buildContent() {
            const options = this._editor.getOptions();
            let text = nls.localize(2, null);
            text += '\n\n' + nls.localize(3, null);
            const configuredValue = this._configurationService.getValue('editor').accessibilitySupport;
            const actualValue = options.get(2 /* accessibilitySupport */);
            const emergencyTurnOnMessage = (platform.isMacintosh
                ? nls.localize(4, null)
                : nls.localize(5, null));
            switch (configuredValue) {
                case 'auto':
                    switch (actualValue) {
                        case 0 /* Unknown */:
                            // Should never happen in VS Code
                            text += '\n\n - ' + nls.localize(6, null);
                            break;
                        case 2 /* Enabled */:
                            text += '\n\n - ' + nls.localize(7, null);
                            break;
                        case 1 /* Disabled */:
                            text += '\n\n - ' + nls.localize(8, null);
                            text += ' ' + emergencyTurnOnMessage;
                            break;
                    }
                    break;
                case 'on':
                    text += '\n\n - ' + nls.localize(9, null);
                    break;
                case 'off':
                    text += '\n\n - ' + nls.localize(10, null);
                    text += ' ' + emergencyTurnOnMessage;
                    break;
            }
            const NLS_TAB_FOCUS_MODE_ON = nls.localize(11, null);
            const NLS_TAB_FOCUS_MODE_ON_NO_KB = nls.localize(12, null);
            const NLS_TAB_FOCUS_MODE_OFF = nls.localize(13, null);
            const NLS_TAB_FOCUS_MODE_OFF_NO_KB = nls.localize(14, null);
            if (options.get(125 /* tabFocusMode */)) {
                text += '\n\n - ' + this._descriptionForCommand(toggleTabFocusMode_1.ToggleTabFocusModeAction.ID, NLS_TAB_FOCUS_MODE_ON, NLS_TAB_FOCUS_MODE_ON_NO_KB);
            }
            else {
                text += '\n\n - ' + this._descriptionForCommand(toggleTabFocusMode_1.ToggleTabFocusModeAction.ID, NLS_TAB_FOCUS_MODE_OFF, NLS_TAB_FOCUS_MODE_OFF_NO_KB);
            }
            const openDocMessage = (platform.isMacintosh
                ? nls.localize(15, null)
                : nls.localize(16, null));
            text += '\n\n' + openDocMessage;
            text += '\n\n' + nls.localize(17, null);
            this._contentDomNode.domNode.appendChild((0, formattedTextRenderer_1.renderFormattedText)(text));
            // Per https://www.w3.org/TR/wai-aria/roles#document, Authors SHOULD provide a title or label for documents
            this._contentDomNode.domNode.setAttribute('aria-label', text);
        }
        hide() {
            if (!this._isVisible) {
                return;
            }
            this._isVisible = false;
            this._isVisibleKey.reset();
            this._domNode.setDisplay('none');
            this._domNode.setAttribute('aria-hidden', 'true');
            this._contentDomNode.domNode.tabIndex = -1;
            dom.clearNode(this._contentDomNode.domNode);
            this._editor.focus();
        }
        _layout() {
            let editorLayout = this._editor.getLayoutInfo();
            const width = Math.min(editorLayout.width - 40, AccessibilityHelpWidget.WIDTH);
            const height = Math.min(editorLayout.height - 40, AccessibilityHelpWidget.HEIGHT);
            this._domNode.setTop(Math.round((editorLayout.height - height) / 2));
            this._domNode.setLeft(Math.round((editorLayout.width - width) / 2));
            this._domNode.setWidth(width);
            this._domNode.setHeight(height);
        }
    };
    AccessibilityHelpWidget.ID = 'editor.contrib.accessibilityHelpWidget';
    AccessibilityHelpWidget.WIDTH = 500;
    AccessibilityHelpWidget.HEIGHT = 300;
    AccessibilityHelpWidget = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, keybinding_1.IKeybindingService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, opener_1.IOpenerService)
    ], AccessibilityHelpWidget);
    // Show Accessibility Help is a workench command so it can also be shown when there is no editor open #108850
    class ShowAccessibilityHelpAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'editor.action.showAccessibilityHelp',
                title: { value: nls.localize(18, null), original: 'Show Accessibility Help' },
                f1: true,
                keybinding: {
                    primary: 512 /* Alt */ | 59 /* F1 */,
                    weight: 100 /* EditorContrib */,
                    linux: {
                        primary: 512 /* Alt */ | 1024 /* Shift */ | 59 /* F1 */,
                        secondary: [512 /* Alt */ | 59 /* F1 */]
                    }
                }
            });
        }
        async run(accessor) {
            const commandService = accessor.get(commands_1.ICommandService);
            const editorService = accessor.get(codeEditorService_1.ICodeEditorService);
            let activeEditor = editorService.getActiveCodeEditor();
            if (!activeEditor) {
                await commandService.executeCommand(fileCommands_1.NEW_UNTITLED_FILE_COMMAND_ID);
            }
            activeEditor = editorService.getActiveCodeEditor();
            if (activeEditor) {
                const controller = AccessibilityHelpController.get(activeEditor);
                if (controller) {
                    controller.show();
                }
            }
        }
    }
    (0, editorExtensions_1.registerEditorContribution)(AccessibilityHelpController.ID, AccessibilityHelpController);
    (0, actions_1.registerAction2)(ShowAccessibilityHelpAction);
    const AccessibilityHelpCommand = editorExtensions_1.EditorCommand.bindToContribution(AccessibilityHelpController.get);
    (0, editorExtensions_1.registerEditorCommand)(new AccessibilityHelpCommand({
        id: 'closeAccessibilityHelp',
        precondition: CONTEXT_ACCESSIBILITY_WIDGET_VISIBLE,
        handler: x => x.hide(),
        kbOpts: {
            weight: 100 /* EditorContrib */ + 100,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 9 /* Escape */, secondary: [1024 /* Shift */ | 9 /* Escape */]
        }
    }));
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const widgetBackground = theme.getColor(colorRegistry_1.editorWidgetBackground);
        if (widgetBackground) {
            collector.addRule(`.monaco-editor .accessibilityHelpWidget { background-color: ${widgetBackground}; }`);
        }
        const widgetForeground = theme.getColor(colorRegistry_1.editorWidgetForeground);
        if (widgetBackground) {
            collector.addRule(`.monaco-editor .accessibilityHelpWidget { color: ${widgetForeground}; }`);
        }
        const widgetShadowColor = theme.getColor(colorRegistry_1.widgetShadow);
        if (widgetShadowColor) {
            collector.addRule(`.monaco-editor .accessibilityHelpWidget { box-shadow: 0 2px 8px ${widgetShadowColor}; }`);
        }
        const hcBorder = theme.getColor(colorRegistry_1.contrastBorder);
        if (hcBorder) {
            collector.addRule(`.monaco-editor .accessibilityHelpWidget { border: 2px solid ${hcBorder}; }`);
        }
    });
});
//# sourceMappingURL=accessibility.js.map