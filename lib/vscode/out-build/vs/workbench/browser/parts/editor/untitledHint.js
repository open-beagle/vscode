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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/nls!vs/workbench/browser/parts/editor/untitledHint", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/workbench/browser/parts/editor/editorStatus", "vs/platform/commands/common/commands", "vs/editor/common/modes/modesRegistry", "vs/base/common/network", "vs/platform/configuration/common/configuration", "vs/workbench/services/experiment/common/experimentService"], function (require, exports, dom, lifecycle_1, nls_1, themeService_1, colorRegistry_1, editorStatus_1, commands_1, modesRegistry_1, network_1, configuration_1, experimentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UntitledHintContribution = void 0;
    const $ = dom.$;
    const untitledHintSetting = 'workbench.editor.untitled.hint';
    let UntitledHintContribution = class UntitledHintContribution {
        constructor(editor, commandService, configurationService, experimentService) {
            this.editor = editor;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.experimentService = experimentService;
            this.toDispose = [];
            this.toDispose.push(this.editor.onDidChangeModel(() => this.update()));
            this.toDispose.push(this.editor.onDidChangeModelLanguage(() => this.update()));
            this.toDispose.push(this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(untitledHintSetting)) {
                    this.update();
                }
            }));
            this.experimentService.getTreatment('untitledhint').then(treatment => {
                this.experimentTreatment = treatment;
                this.update();
            });
        }
        update() {
            var _a;
            (_a = this.untitledHintContentWidget) === null || _a === void 0 ? void 0 : _a.dispose();
            const configValue = this.configurationService.getValue(untitledHintSetting);
            const untitledHintMode = configValue === 'default' ? (this.experimentTreatment || 'text') : configValue;
            const model = this.editor.getModel();
            if (model && model.uri.scheme === network_1.Schemas.untitled && model.getModeId() === modesRegistry_1.PLAINTEXT_MODE_ID && untitledHintMode === 'text') {
                this.untitledHintContentWidget = new UntitledHintContentWidget(this.editor, this.commandService, this.configurationService);
            }
        }
        dispose() {
            var _a;
            (0, lifecycle_1.dispose)(this.toDispose);
            (_a = this.untitledHintContentWidget) === null || _a === void 0 ? void 0 : _a.dispose();
        }
    };
    UntitledHintContribution.ID = 'editor.contrib.untitledHint';
    UntitledHintContribution = __decorate([
        __param(1, commands_1.ICommandService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, experimentService_1.ITASExperimentService)
    ], UntitledHintContribution);
    exports.UntitledHintContribution = UntitledHintContribution;
    class UntitledHintContentWidget {
        constructor(editor, commandService, configurationService) {
            this.editor = editor;
            this.commandService = commandService;
            this.configurationService = configurationService;
            this.toDispose = [];
            this.toDispose.push(editor.onDidChangeModelContent(() => this.onDidChangeModelContent()));
            this.toDispose.push(this.editor.onDidChangeConfiguration((e) => {
                if (this.domNode && e.hasChanged(40 /* fontInfo */)) {
                    this.editor.applyFontInfo(this.domNode);
                }
            }));
            this.onDidChangeModelContent();
        }
        onDidChangeModelContent() {
            if (this.editor.getValue() === '') {
                this.editor.addContentWidget(this);
            }
            else {
                this.editor.removeContentWidget(this);
            }
        }
        getId() {
            return UntitledHintContentWidget.ID;
        }
        // Select a language to get started. Start typing to dismiss, or don't show this again.
        getDomNode() {
            if (!this.domNode) {
                this.domNode = $('.untitled-hint');
                this.domNode.style.width = 'max-content';
                const language = $('a.language-mode');
                language.style.cursor = 'pointer';
                language.innerText = (0, nls_1.localize)(0, null);
                this.domNode.appendChild(language);
                const toGetStarted = $('span');
                toGetStarted.innerText = (0, nls_1.localize)(1, null);
                this.domNode.appendChild(toGetStarted);
                const dontShow = $('a');
                dontShow.style.cursor = 'pointer';
                dontShow.innerText = (0, nls_1.localize)(2, null);
                this.domNode.appendChild(dontShow);
                const thisAgain = $('span');
                thisAgain.innerText = (0, nls_1.localize)(3, null);
                this.domNode.appendChild(thisAgain);
                this.toDispose.push(dom.addDisposableListener(language, 'click', async (e) => {
                    e.stopPropagation();
                    // Need to focus editor before so current editor becomes active and the command is properly executed
                    this.editor.focus();
                    await this.commandService.executeCommand(editorStatus_1.ChangeModeAction.ID, { from: 'hint' });
                    this.editor.focus();
                }));
                this.toDispose.push(dom.addDisposableListener(dontShow, 'click', () => {
                    this.configurationService.updateValue(untitledHintSetting, 'hidden');
                    this.dispose();
                    this.editor.focus();
                }));
                this.toDispose.push(dom.addDisposableListener(this.domNode, 'click', () => {
                    this.editor.focus();
                }));
                this.domNode.style.fontStyle = 'italic';
                this.domNode.style.paddingLeft = '4px';
                this.editor.applyFontInfo(this.domNode);
            }
            return this.domNode;
        }
        getPosition() {
            return {
                position: { lineNumber: 1, column: 1 },
                preference: [0 /* EXACT */]
            };
        }
        dispose() {
            this.editor.removeContentWidget(this);
            (0, lifecycle_1.dispose)(this.toDispose);
        }
    }
    UntitledHintContentWidget.ID = 'editor.widget.untitledHint';
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const inputPlaceholderForegroundColor = theme.getColor(colorRegistry_1.inputPlaceholderForeground);
        if (inputPlaceholderForegroundColor) {
            collector.addRule(`.monaco-editor .contentWidgets .untitled-hint { color: ${inputPlaceholderForegroundColor}; }`);
        }
        const textLinkForegroundColor = theme.getColor(colorRegistry_1.textLinkForeground);
        if (textLinkForegroundColor) {
            collector.addRule(`.monaco-editor .contentWidgets .untitled-hint a { color: ${textLinkForegroundColor}; }`);
        }
    });
});
//# sourceMappingURL=untitledHint.js.map