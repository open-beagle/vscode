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
define(["require", "exports", "vs/nls!vs/editor/contrib/linkedEditing/linkedEditing", "vs/editor/browser/editorExtensions", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/editor/common/core/position", "vs/base/common/cancellation", "vs/editor/common/core/range", "vs/editor/common/modes", "vs/base/common/async", "vs/editor/common/model/textModel", "vs/platform/contextkey/common/contextkey", "vs/editor/common/editorContextKeys", "vs/base/common/uri", "vs/editor/browser/services/codeEditorService", "vs/base/common/errors", "vs/base/common/strings", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/base/common/color", "vs/editor/common/modes/languageConfigurationRegistry"], function (require, exports, nls, editorExtensions_1, arrays, lifecycle_1, position_1, cancellation_1, range_1, modes_1, async_1, textModel_1, contextkey_1, editorContextKeys_1, uri_1, codeEditorService_1, errors_1, strings, colorRegistry_1, themeService_1, color_1, languageConfigurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.editorLinkedEditingBackground = exports.LinkedEditingAction = exports.LinkedEditingContribution = exports.CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE = void 0;
    exports.CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE = new contextkey_1.RawContextKey('LinkedEditingInputVisible', false);
    const DECORATION_CLASS_NAME = 'linked-editing-decoration';
    let LinkedEditingContribution = class LinkedEditingContribution extends lifecycle_1.Disposable {
        constructor(editor, contextKeyService) {
            super();
            this._debounceDuration = 200;
            this._localToDispose = this._register(new lifecycle_1.DisposableStore());
            this._editor = editor;
            this._enabled = false;
            this._visibleContextKey = exports.CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE.bindTo(contextKeyService);
            this._currentDecorations = [];
            this._languageWordPattern = null;
            this._currentWordPattern = null;
            this._ignoreChangeEvent = false;
            this._localToDispose = this._register(new lifecycle_1.DisposableStore());
            this._rangeUpdateTriggerPromise = null;
            this._rangeSyncTriggerPromise = null;
            this._currentRequest = null;
            this._currentRequestPosition = null;
            this._currentRequestModelVersion = null;
            this._register(this._editor.onDidChangeModel(() => this.reinitialize()));
            this._register(this._editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(58 /* linkedEditing */) || e.hasChanged(78 /* renameOnType */)) {
                    this.reinitialize();
                }
            }));
            this._register(modes_1.LinkedEditingRangeProviderRegistry.onDidChange(() => this.reinitialize()));
            this._register(this._editor.onDidChangeModelLanguage(() => this.reinitialize()));
            this.reinitialize();
        }
        static get(editor) {
            return editor.getContribution(LinkedEditingContribution.ID);
        }
        reinitialize() {
            const model = this._editor.getModel();
            const isEnabled = model !== null && (this._editor.getOption(58 /* linkedEditing */) || this._editor.getOption(78 /* renameOnType */)) && modes_1.LinkedEditingRangeProviderRegistry.has(model);
            if (isEnabled === this._enabled) {
                return;
            }
            this._enabled = isEnabled;
            this.clearRanges();
            this._localToDispose.clear();
            if (!isEnabled || model === null) {
                return;
            }
            this._languageWordPattern = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getWordDefinition(model.getLanguageIdentifier().id);
            this._localToDispose.add(model.onDidChangeLanguageConfiguration(() => {
                this._languageWordPattern = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getWordDefinition(model.getLanguageIdentifier().id);
            }));
            const rangeUpdateScheduler = new async_1.Delayer(this._debounceDuration);
            const triggerRangeUpdate = () => {
                this._rangeUpdateTriggerPromise = rangeUpdateScheduler.trigger(() => this.updateRanges(), this._debounceDuration);
            };
            const rangeSyncScheduler = new async_1.Delayer(0);
            const triggerRangeSync = (decorations) => {
                this._rangeSyncTriggerPromise = rangeSyncScheduler.trigger(() => this._syncRanges(decorations));
            };
            this._localToDispose.add(this._editor.onDidChangeCursorPosition(() => {
                triggerRangeUpdate();
            }));
            this._localToDispose.add(this._editor.onDidChangeModelContent((e) => {
                if (!this._ignoreChangeEvent) {
                    if (this._currentDecorations.length > 0) {
                        const referenceRange = model.getDecorationRange(this._currentDecorations[0]);
                        if (referenceRange && e.changes.every(c => referenceRange.intersectRanges(c.range))) {
                            triggerRangeSync(this._currentDecorations);
                            return;
                        }
                    }
                }
                triggerRangeUpdate();
            }));
            this._localToDispose.add({
                dispose: () => {
                    rangeUpdateScheduler.cancel();
                    rangeSyncScheduler.cancel();
                }
            });
            this.updateRanges();
        }
        _syncRanges(decorations) {
            // dalayed invocation, make sure we're still on
            if (!this._editor.hasModel() || decorations !== this._currentDecorations || decorations.length === 0) {
                // nothing to do
                return;
            }
            const model = this._editor.getModel();
            const referenceRange = model.getDecorationRange(decorations[0]);
            if (!referenceRange || referenceRange.startLineNumber !== referenceRange.endLineNumber) {
                return this.clearRanges();
            }
            const referenceValue = model.getValueInRange(referenceRange);
            if (this._currentWordPattern) {
                const match = referenceValue.match(this._currentWordPattern);
                const matchLength = match ? match[0].length : 0;
                if (matchLength !== referenceValue.length) {
                    return this.clearRanges();
                }
            }
            let edits = [];
            for (let i = 1, len = decorations.length; i < len; i++) {
                const mirrorRange = model.getDecorationRange(decorations[i]);
                if (!mirrorRange) {
                    continue;
                }
                if (mirrorRange.startLineNumber !== mirrorRange.endLineNumber) {
                    edits.push({
                        range: mirrorRange,
                        text: referenceValue
                    });
                }
                else {
                    let oldValue = model.getValueInRange(mirrorRange);
                    let newValue = referenceValue;
                    let rangeStartColumn = mirrorRange.startColumn;
                    let rangeEndColumn = mirrorRange.endColumn;
                    const commonPrefixLength = strings.commonPrefixLength(oldValue, newValue);
                    rangeStartColumn += commonPrefixLength;
                    oldValue = oldValue.substr(commonPrefixLength);
                    newValue = newValue.substr(commonPrefixLength);
                    const commonSuffixLength = strings.commonSuffixLength(oldValue, newValue);
                    rangeEndColumn -= commonSuffixLength;
                    oldValue = oldValue.substr(0, oldValue.length - commonSuffixLength);
                    newValue = newValue.substr(0, newValue.length - commonSuffixLength);
                    if (rangeStartColumn !== rangeEndColumn || newValue.length !== 0) {
                        edits.push({
                            range: new range_1.Range(mirrorRange.startLineNumber, rangeStartColumn, mirrorRange.endLineNumber, rangeEndColumn),
                            text: newValue
                        });
                    }
                }
            }
            if (edits.length === 0) {
                return;
            }
            try {
                this._editor.popUndoStop();
                this._ignoreChangeEvent = true;
                const prevEditOperationType = this._editor._getViewModel().getPrevEditOperationType();
                this._editor.executeEdits('linkedEditing', edits);
                this._editor._getViewModel().setPrevEditOperationType(prevEditOperationType);
            }
            finally {
                this._ignoreChangeEvent = false;
            }
        }
        dispose() {
            this.clearRanges();
            super.dispose();
        }
        clearRanges() {
            this._visibleContextKey.set(false);
            this._currentDecorations = this._editor.deltaDecorations(this._currentDecorations, []);
            if (this._currentRequest) {
                this._currentRequest.cancel();
                this._currentRequest = null;
                this._currentRequestPosition = null;
            }
        }
        get currentUpdateTriggerPromise() {
            return this._rangeUpdateTriggerPromise || Promise.resolve();
        }
        get currentSyncTriggerPromise() {
            return this._rangeSyncTriggerPromise || Promise.resolve();
        }
        async updateRanges(force = false) {
            if (!this._editor.hasModel()) {
                this.clearRanges();
                return;
            }
            const position = this._editor.getPosition();
            if (!this._enabled && !force || this._editor.getSelections().length > 1) {
                // disabled or multicursor
                this.clearRanges();
                return;
            }
            const model = this._editor.getModel();
            const modelVersionId = model.getVersionId();
            if (this._currentRequestPosition && this._currentRequestModelVersion === modelVersionId) {
                if (position.equals(this._currentRequestPosition)) {
                    return; // same position
                }
                if (this._currentDecorations && this._currentDecorations.length > 0) {
                    const range = model.getDecorationRange(this._currentDecorations[0]);
                    if (range && range.containsPosition(position)) {
                        return; // just moving inside the existing primary range
                    }
                }
            }
            this._currentRequestPosition = position;
            this._currentRequestModelVersion = modelVersionId;
            const request = (0, async_1.createCancelablePromise)(async (token) => {
                try {
                    const response = await getLinkedEditingRanges(model, position, token);
                    if (request !== this._currentRequest) {
                        return;
                    }
                    this._currentRequest = null;
                    if (modelVersionId !== model.getVersionId()) {
                        return;
                    }
                    let ranges = [];
                    if (response === null || response === void 0 ? void 0 : response.ranges) {
                        ranges = response.ranges;
                    }
                    this._currentWordPattern = (response === null || response === void 0 ? void 0 : response.wordPattern) || this._languageWordPattern;
                    let foundReferenceRange = false;
                    for (let i = 0, len = ranges.length; i < len; i++) {
                        if (range_1.Range.containsPosition(ranges[i], position)) {
                            foundReferenceRange = true;
                            if (i !== 0) {
                                const referenceRange = ranges[i];
                                ranges.splice(i, 1);
                                ranges.unshift(referenceRange);
                            }
                            break;
                        }
                    }
                    if (!foundReferenceRange) {
                        // Cannot do linked editing if the ranges are not where the cursor is...
                        this.clearRanges();
                        return;
                    }
                    const decorations = ranges.map(range => ({ range: range, options: LinkedEditingContribution.DECORATION }));
                    this._visibleContextKey.set(true);
                    this._currentDecorations = this._editor.deltaDecorations(this._currentDecorations, decorations);
                }
                catch (err) {
                    if (!(0, errors_1.isPromiseCanceledError)(err)) {
                        (0, errors_1.onUnexpectedError)(err);
                    }
                    if (this._currentRequest === request || !this._currentRequest) {
                        // stop if we are still the latest request
                        this.clearRanges();
                    }
                }
            });
            this._currentRequest = request;
            return request;
        }
        // for testing
        setDebounceDuration(timeInMS) {
            this._debounceDuration = timeInMS;
        }
    };
    LinkedEditingContribution.ID = 'editor.contrib.linkedEditing';
    LinkedEditingContribution.DECORATION = textModel_1.ModelDecorationOptions.register({
        stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */,
        className: DECORATION_CLASS_NAME
    });
    LinkedEditingContribution = __decorate([
        __param(1, contextkey_1.IContextKeyService)
    ], LinkedEditingContribution);
    exports.LinkedEditingContribution = LinkedEditingContribution;
    class LinkedEditingAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.linkedEditing',
                label: nls.localize(0, null),
                alias: 'Start Linked Editing',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasRenameProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 60 /* F2 */,
                    weight: 100 /* EditorContrib */
                }
            });
        }
        runCommand(accessor, args) {
            const editorService = accessor.get(codeEditorService_1.ICodeEditorService);
            const [uri, pos] = Array.isArray(args) && args || [undefined, undefined];
            if (uri_1.URI.isUri(uri) && position_1.Position.isIPosition(pos)) {
                return editorService.openCodeEditor({ resource: uri }, editorService.getActiveCodeEditor()).then(editor => {
                    if (!editor) {
                        return;
                    }
                    editor.setPosition(pos);
                    editor.invokeWithinContext(accessor => {
                        this.reportTelemetry(accessor, editor);
                        return this.run(accessor, editor);
                    });
                }, errors_1.onUnexpectedError);
            }
            return super.runCommand(accessor, args);
        }
        run(_accessor, editor) {
            const controller = LinkedEditingContribution.get(editor);
            if (controller) {
                return Promise.resolve(controller.updateRanges(true));
            }
            return Promise.resolve();
        }
    }
    exports.LinkedEditingAction = LinkedEditingAction;
    const LinkedEditingCommand = editorExtensions_1.EditorCommand.bindToContribution(LinkedEditingContribution.get);
    (0, editorExtensions_1.registerEditorCommand)(new LinkedEditingCommand({
        id: 'cancelLinkedEditingInput',
        precondition: exports.CONTEXT_ONTYPE_RENAME_INPUT_VISIBLE,
        handler: x => x.clearRanges(),
        kbOpts: {
            kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
            weight: 100 /* EditorContrib */ + 99,
            primary: 9 /* Escape */,
            secondary: [1024 /* Shift */ | 9 /* Escape */]
        }
    }));
    function getLinkedEditingRanges(model, position, token) {
        const orderedByScore = modes_1.LinkedEditingRangeProviderRegistry.ordered(model);
        // in order of score ask the linked editing range provider
        // until someone response with a good result
        // (good = not null)
        return (0, async_1.first)(orderedByScore.map(provider => async () => {
            try {
                return await provider.provideLinkedEditingRanges(model, position, token);
            }
            catch (e) {
                (0, errors_1.onUnexpectedExternalError)(e);
                return undefined;
            }
        }), result => !!result && arrays.isNonEmptyArray(result === null || result === void 0 ? void 0 : result.ranges));
    }
    exports.editorLinkedEditingBackground = (0, colorRegistry_1.registerColor)('editor.linkedEditingBackground', { dark: color_1.Color.fromHex('#f00').transparent(0.3), light: color_1.Color.fromHex('#f00').transparent(0.3), hc: color_1.Color.fromHex('#f00').transparent(0.3) }, nls.localize(1, null));
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const editorLinkedEditingBackgroundColor = theme.getColor(exports.editorLinkedEditingBackground);
        if (editorLinkedEditingBackgroundColor) {
            collector.addRule(`.monaco-editor .${DECORATION_CLASS_NAME} { background: ${editorLinkedEditingBackgroundColor}; border-left-color: ${editorLinkedEditingBackgroundColor}; }`);
        }
    });
    (0, editorExtensions_1.registerModelAndPositionCommand)('_executeLinkedEditingProvider', (model, position) => getLinkedEditingRanges(model, position, cancellation_1.CancellationToken.None));
    (0, editorExtensions_1.registerEditorContribution)(LinkedEditingContribution.ID, LinkedEditingContribution);
    (0, editorExtensions_1.registerEditorAction)(LinkedEditingAction);
});
//# sourceMappingURL=linkedEditing.js.map