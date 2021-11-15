/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/objects", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/browser/constants", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/nls!vs/workbench/contrib/notebook/browser/view/renderers/cellEditorOptions", "vs/platform/actions/common/actions", "vs/workbench/services/editor/common/editorService", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/browser/contrib/coreActions"], function (require, exports, event_1, objects_1, platform_1, configurationRegistry_1, configuration_1, constants_1, notebookBrowser_1, notebookCommon_1, nls_1, actions_1, editorService_1, contextkey_1, coreActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CellEditorOptions = void 0;
    class CellEditorOptions {
        constructor(configurationService, language) {
            this.configurationService = configurationService;
            this._lineNumbers = 'inherit';
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this.disposable = configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor') || e.affectsConfiguration('notebook') || e.affectsConfiguration(notebookCommon_1.ShowCellStatusBarKey)) {
                    this._value = computeEditorOptions();
                    this._onDidChange.fire(this.value);
                }
            });
            (0, notebookBrowser_1.EditorTopPaddingChangeEvent)(() => {
                this._value = computeEditorOptions();
                this._onDidChange.fire(this.value);
            });
            const computeEditorOptions = () => {
                const showCellStatusBar = configurationService.getValue(notebookCommon_1.ShowCellStatusBarKey);
                const editorPadding = {
                    top: (0, notebookBrowser_1.getEditorTopPadding)(),
                    bottom: showCellStatusBar ? constants_1.EDITOR_BOTTOM_PADDING : constants_1.EDITOR_BOTTOM_PADDING_WITHOUT_STATUSBAR
                };
                const renderLiNumbers = configurationService.getValue('notebook.lineNumbers') === 'on';
                const lineNumbers = renderLiNumbers ? 'on' : 'off';
                const editorOptions = (0, objects_1.deepClone)(configurationService.getValue('editor', { overrideIdentifier: language }));
                const computed = Object.assign(Object.assign(Object.assign({}, editorOptions), CellEditorOptions.fixedEditorOptions), { padding: editorPadding, lineNumbers });
                if (!computed.folding) {
                    computed.lineDecorationsWidth = 16;
                }
                return computed;
            };
            this._value = computeEditorOptions();
        }
        dispose() {
            this._onDidChange.dispose();
            this.disposable.dispose();
        }
        get value() {
            return this._value;
        }
        setGlyphMargin(gm) {
            if (gm !== this._value.glyphMargin) {
                this._value.glyphMargin = gm;
                this._onDidChange.fire(this.value);
            }
        }
        setLineNumbers(lineNumbers) {
            this._lineNumbers = lineNumbers;
            if (this._lineNumbers === 'inherit') {
                const renderLiNumbers = this.configurationService.getValue('notebook.lineNumbers') === 'on';
                const lineNumbers = renderLiNumbers ? 'on' : 'off';
                this._value.lineNumbers = lineNumbers;
            }
            else {
                this._value.lineNumbers = lineNumbers;
            }
            this._onDidChange.fire(this.value);
        }
    }
    exports.CellEditorOptions = CellEditorOptions;
    CellEditorOptions.fixedEditorOptions = {
        scrollBeyondLastLine: false,
        scrollbar: {
            verticalScrollbarSize: 14,
            horizontal: 'auto',
            useShadows: true,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            alwaysConsumeMouseWheel: false
        },
        renderLineHighlightOnlyWhenFocus: true,
        overviewRulerLanes: 0,
        selectOnLineNumbers: false,
        lineNumbers: 'off',
        lineDecorationsWidth: 0,
        glyphMargin: false,
        fixedOverflowWidgets: true,
        minimap: { enabled: false },
        renderValidationDecorations: 'on'
    };
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'notebook',
        order: 100,
        type: 'object',
        'properties': {
            'notebook.lineNumbers': {
                type: 'string',
                enum: ['off', 'on'],
                default: 'off',
                markdownDescription: (0, nls_1.localize)(0, null)
            }
        }
    });
    (0, actions_1.registerAction2)(class ToggleLineNumberAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.toggleLineNumbers',
                title: { value: (0, nls_1.localize)(1, null), original: 'Toggle Notebook Line Numbers' },
                precondition: notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED,
                menu: [{
                        id: actions_1.MenuId.EditorTitle,
                        group: 'LineNumber',
                        order: 0,
                        when: notebookBrowser_1.NOTEBOOK_IS_ACTIVE_EDITOR
                    }],
                category: coreActions_1.NOTEBOOK_ACTIONS_CATEGORY,
                f1: true,
                toggled: {
                    condition: contextkey_1.ContextKeyExpr.notEquals('config.notebook.lineNumbers', 'off'),
                    title: { value: (0, nls_1.localize)(2, null), original: 'Show Notebook Line Numbers' },
                }
            });
        }
        async run(accessor) {
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const renderLiNumbers = configurationService.getValue('notebook.lineNumbers') === 'on';
            if (renderLiNumbers) {
                configurationService.updateValue('notebook.lineNumbers', 'off');
            }
            else {
                configurationService.updateValue('notebook.lineNumbers', 'on');
            }
        }
    });
    (0, actions_1.registerAction2)(class ToggleActiveLineNumberAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'notebook.cell.toggleLineNumbers',
                title: 'Show Cell Line Numbers',
                precondition: notebookBrowser_1.NOTEBOOK_EDITOR_FOCUSED,
                menu: [{
                        id: actions_1.MenuId.NotebookCellTitle,
                        group: 'View',
                        order: 1
                    }],
                toggled: contextkey_1.ContextKeyExpr.or(notebookBrowser_1.NOTEBOOK_CELL_LINE_NUMBERS.isEqualTo('on'), contextkey_1.ContextKeyExpr.and(notebookBrowser_1.NOTEBOOK_CELL_LINE_NUMBERS.isEqualTo('inherit'), contextkey_1.ContextKeyExpr.equals('config.notebook.lineNumbers', 'on')))
            });
        }
        async run(accessor, context) {
            let cell = context === null || context === void 0 ? void 0 : context.cell;
            if (!cell) {
                const editor = (0, notebookBrowser_1.getNotebookEditorFromEditorPane)(accessor.get(editorService_1.IEditorService).activeEditorPane);
                if (!editor || !editor.hasModel()) {
                    return;
                }
                cell = editor.getActiveCell();
            }
            if (cell) {
                const configurationService = accessor.get(configuration_1.IConfigurationService);
                const renderLineNumbers = configurationService.getValue('notebook.lineNumbers') === 'on';
                const cellLineNumbers = cell.lineNumbers;
                // 'on', 'inherit' 	-> 'on'
                // 'on', 'off'		-> 'off'
                // 'on', 'on'		-> 'on'
                // 'off', 'inherit'	-> 'off'
                // 'off', 'off'		-> 'off'
                // 'off', 'on'		-> 'on'
                const currentLineNumberIsOn = cellLineNumbers === 'on' || (cellLineNumbers === 'inherit' && renderLineNumbers);
                if (currentLineNumberIsOn) {
                    cell.lineNumbers = 'off';
                }
                else {
                    cell.lineNumbers = 'on';
                }
            }
        }
    });
});
//# sourceMappingURL=cellEditorOptions.js.map