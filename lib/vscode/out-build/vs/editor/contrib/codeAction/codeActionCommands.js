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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/bulkEditService", "vs/editor/common/editorContextKeys", "vs/editor/contrib/codeAction/codeAction", "vs/editor/contrib/codeAction/codeActionUi", "vs/editor/contrib/message/messageController", "vs/nls!vs/editor/contrib/codeAction/codeActionCommands", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/markers/common/markers", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "./codeActionModel", "./types"], function (require, exports, cancellation_1, lazy_1, lifecycle_1, strings_1, editorExtensions_1, bulkEditService_1, editorContextKeys_1, codeAction_1, codeActionUi_1, messageController_1, nls, commands_1, contextkey_1, instantiation_1, markers_1, notification_1, progress_1, telemetry_1, codeActionModel_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutoFixAction = exports.FixAllAction = exports.OrganizeImportsAction = exports.SourceAction = exports.RefactorAction = exports.CodeActionCommand = exports.QuickFixAction = exports.applyCodeAction = exports.QuickFixController = void 0;
    function contextKeyForSupportedActions(kind) {
        return contextkey_1.ContextKeyExpr.regex(codeActionModel_1.SUPPORTED_CODE_ACTIONS.keys()[0], new RegExp('(\\s|^)' + (0, strings_1.escapeRegExpCharacters)(kind.value) + '\\b'));
    }
    const argsSchema = {
        type: 'object',
        defaultSnippets: [{ body: { kind: '' } }],
        properties: {
            'kind': {
                type: 'string',
                description: nls.localize(0, null),
            },
            'apply': {
                type: 'string',
                description: nls.localize(1, null),
                default: "ifSingle" /* IfSingle */,
                enum: ["first" /* First */, "ifSingle" /* IfSingle */, "never" /* Never */],
                enumDescriptions: [
                    nls.localize(2, null),
                    nls.localize(3, null),
                    nls.localize(4, null),
                ]
            },
            'preferred': {
                type: 'boolean',
                default: false,
                description: nls.localize(5, null),
            }
        }
    };
    let QuickFixController = class QuickFixController extends lifecycle_1.Disposable {
        constructor(editor, markerService, contextKeyService, progressService, _instantiationService) {
            super();
            this._instantiationService = _instantiationService;
            this._editor = editor;
            this._model = this._register(new codeActionModel_1.CodeActionModel(this._editor, markerService, contextKeyService, progressService));
            this._register(this._model.onDidChangeState(newState => this.update(newState)));
            this._ui = new lazy_1.Lazy(() => this._register(new codeActionUi_1.CodeActionUi(editor, QuickFixAction.Id, AutoFixAction.Id, {
                applyCodeAction: async (action, retrigger) => {
                    try {
                        await this._applyCodeAction(action);
                    }
                    finally {
                        if (retrigger) {
                            this._trigger({ type: 2 /* Auto */, filter: {} });
                        }
                    }
                }
            }, this._instantiationService)));
        }
        static get(editor) {
            return editor.getContribution(QuickFixController.ID);
        }
        update(newState) {
            this._ui.getValue().update(newState);
        }
        showCodeActions(trigger, actions, at) {
            return this._ui.getValue().showCodeActionList(trigger, actions, at, { includeDisabledActions: false });
        }
        manualTriggerAtCurrentPosition(notAvailableMessage, filter, autoApply) {
            if (!this._editor.hasModel()) {
                return;
            }
            messageController_1.MessageController.get(this._editor).closeMessage();
            const triggerPosition = this._editor.getPosition();
            this._trigger({ type: 1 /* Invoke */, filter, autoApply, context: { notAvailableMessage, position: triggerPosition } });
        }
        _trigger(trigger) {
            return this._model.trigger(trigger);
        }
        _applyCodeAction(action) {
            return this._instantiationService.invokeFunction(applyCodeAction, action, this._editor);
        }
    };
    QuickFixController.ID = 'editor.contrib.quickFixController';
    QuickFixController = __decorate([
        __param(1, markers_1.IMarkerService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, progress_1.IEditorProgressService),
        __param(4, instantiation_1.IInstantiationService)
    ], QuickFixController);
    exports.QuickFixController = QuickFixController;
    async function applyCodeAction(accessor, item, editor) {
        const bulkEditService = accessor.get(bulkEditService_1.IBulkEditService);
        const commandService = accessor.get(commands_1.ICommandService);
        const telemetryService = accessor.get(telemetry_1.ITelemetryService);
        const notificationService = accessor.get(notification_1.INotificationService);
        telemetryService.publicLog2('codeAction.applyCodeAction', {
            codeActionTitle: item.action.title,
            codeActionKind: item.action.kind,
            codeActionIsPreferred: !!item.action.isPreferred,
        });
        await item.resolve(cancellation_1.CancellationToken.None);
        if (item.action.edit) {
            await bulkEditService.apply(bulkEditService_1.ResourceEdit.convert(item.action.edit), { editor, label: item.action.title });
        }
        if (item.action.command) {
            try {
                await commandService.executeCommand(item.action.command.id, ...(item.action.command.arguments || []));
            }
            catch (err) {
                const message = asMessage(err);
                notificationService.error(typeof message === 'string'
                    ? message
                    : nls.localize(6, null));
            }
        }
    }
    exports.applyCodeAction = applyCodeAction;
    function asMessage(err) {
        if (typeof err === 'string') {
            return err;
        }
        else if (err instanceof Error && typeof err.message === 'string') {
            return err.message;
        }
        else {
            return undefined;
        }
    }
    function triggerCodeActionsForEditorSelection(editor, notAvailableMessage, filter, autoApply) {
        if (editor.hasModel()) {
            const controller = QuickFixController.get(editor);
            if (controller) {
                controller.manualTriggerAtCurrentPosition(notAvailableMessage, filter, autoApply);
            }
        }
    }
    class QuickFixAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: QuickFixAction.Id,
                label: nls.localize(7, null),
                alias: 'Quick Fix...',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* CtrlCmd */ | 84 /* US_DOT */,
                    weight: 100 /* EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            return triggerCodeActionsForEditorSelection(editor, nls.localize(8, null), undefined, undefined);
        }
    }
    exports.QuickFixAction = QuickFixAction;
    QuickFixAction.Id = 'editor.action.quickFix';
    class CodeActionCommand extends editorExtensions_1.EditorCommand {
        constructor() {
            super({
                id: codeAction_1.codeActionCommandId,
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider),
                description: {
                    description: 'Trigger a code action',
                    args: [{ name: 'args', schema: argsSchema, }]
                }
            });
        }
        runEditorCommand(_accessor, editor, userArgs) {
            const args = types_1.CodeActionCommandArgs.fromUser(userArgs, {
                kind: types_1.CodeActionKind.Empty,
                apply: "ifSingle" /* IfSingle */,
            });
            return triggerCodeActionsForEditorSelection(editor, typeof (userArgs === null || userArgs === void 0 ? void 0 : userArgs.kind) === 'string'
                ? args.preferred
                    ? nls.localize(9, null, userArgs.kind)
                    : nls.localize(10, null, userArgs.kind)
                : args.preferred
                    ? nls.localize(11, null)
                    : nls.localize(12, null), {
                include: args.kind,
                includeSourceActions: true,
                onlyIncludePreferredActions: args.preferred,
            }, args.apply);
        }
    }
    exports.CodeActionCommand = CodeActionCommand;
    class RefactorAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: codeAction_1.refactorCommandId,
                label: nls.localize(13, null),
                alias: 'Refactor...',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 48 /* KEY_R */,
                    mac: {
                        primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 48 /* KEY_R */
                    },
                    weight: 100 /* EditorContrib */
                },
                contextMenuOpts: {
                    group: '1_modification',
                    order: 2,
                    when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.CodeActionKind.Refactor)),
                },
                description: {
                    description: 'Refactor...',
                    args: [{ name: 'args', schema: argsSchema }]
                }
            });
        }
        run(_accessor, editor, userArgs) {
            const args = types_1.CodeActionCommandArgs.fromUser(userArgs, {
                kind: types_1.CodeActionKind.Refactor,
                apply: "never" /* Never */
            });
            return triggerCodeActionsForEditorSelection(editor, typeof (userArgs === null || userArgs === void 0 ? void 0 : userArgs.kind) === 'string'
                ? args.preferred
                    ? nls.localize(14, null, userArgs.kind)
                    : nls.localize(15, null, userArgs.kind)
                : args.preferred
                    ? nls.localize(16, null)
                    : nls.localize(17, null), {
                include: types_1.CodeActionKind.Refactor.contains(args.kind) ? args.kind : types_1.CodeActionKind.None,
                onlyIncludePreferredActions: args.preferred,
            }, args.apply);
        }
    }
    exports.RefactorAction = RefactorAction;
    class SourceAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: codeAction_1.sourceActionCommandId,
                label: nls.localize(18, null),
                alias: 'Source Action...',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasCodeActionsProvider),
                contextMenuOpts: {
                    group: '1_modification',
                    order: 2.1,
                    when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.CodeActionKind.Source)),
                },
                description: {
                    description: 'Source Action...',
                    args: [{ name: 'args', schema: argsSchema }]
                }
            });
        }
        run(_accessor, editor, userArgs) {
            const args = types_1.CodeActionCommandArgs.fromUser(userArgs, {
                kind: types_1.CodeActionKind.Source,
                apply: "never" /* Never */
            });
            return triggerCodeActionsForEditorSelection(editor, typeof (userArgs === null || userArgs === void 0 ? void 0 : userArgs.kind) === 'string'
                ? args.preferred
                    ? nls.localize(19, null, userArgs.kind)
                    : nls.localize(20, null, userArgs.kind)
                : args.preferred
                    ? nls.localize(21, null)
                    : nls.localize(22, null), {
                include: types_1.CodeActionKind.Source.contains(args.kind) ? args.kind : types_1.CodeActionKind.None,
                includeSourceActions: true,
                onlyIncludePreferredActions: args.preferred,
            }, args.apply);
        }
    }
    exports.SourceAction = SourceAction;
    class OrganizeImportsAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: codeAction_1.organizeImportsCommandId,
                label: nls.localize(23, null),
                alias: 'Organize Imports',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.CodeActionKind.SourceOrganizeImports)),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* Shift */ | 512 /* Alt */ | 45 /* KEY_O */,
                    weight: 100 /* EditorContrib */
                },
            });
        }
        run(_accessor, editor) {
            return triggerCodeActionsForEditorSelection(editor, nls.localize(24, null), { include: types_1.CodeActionKind.SourceOrganizeImports, includeSourceActions: true }, "ifSingle" /* IfSingle */);
        }
    }
    exports.OrganizeImportsAction = OrganizeImportsAction;
    class FixAllAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: codeAction_1.fixAllCommandId,
                label: nls.localize(25, null),
                alias: 'Fix All',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.CodeActionKind.SourceFixAll))
            });
        }
        run(_accessor, editor) {
            return triggerCodeActionsForEditorSelection(editor, nls.localize(26, null), { include: types_1.CodeActionKind.SourceFixAll, includeSourceActions: true }, "ifSingle" /* IfSingle */);
        }
    }
    exports.FixAllAction = FixAllAction;
    class AutoFixAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: AutoFixAction.Id,
                label: nls.localize(27, null),
                alias: 'Auto Fix...',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, contextKeyForSupportedActions(types_1.CodeActionKind.QuickFix)),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 512 /* Alt */ | 1024 /* Shift */ | 84 /* US_DOT */,
                    mac: {
                        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 84 /* US_DOT */
                    },
                    weight: 100 /* EditorContrib */
                }
            });
        }
        run(_accessor, editor) {
            return triggerCodeActionsForEditorSelection(editor, nls.localize(28, null), {
                include: types_1.CodeActionKind.QuickFix,
                onlyIncludePreferredActions: true
            }, "ifSingle" /* IfSingle */);
        }
    }
    exports.AutoFixAction = AutoFixAction;
    AutoFixAction.Id = 'editor.action.autoFix';
});
//# sourceMappingURL=codeActionCommands.js.map