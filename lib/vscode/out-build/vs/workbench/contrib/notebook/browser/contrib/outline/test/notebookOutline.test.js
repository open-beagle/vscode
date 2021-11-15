/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/notebook/test/testNotebookEditor", "vs/workbench/contrib/notebook/browser/contrib/outline/notebookOutline", "vs/platform/theme/common/themeService", "vs/base/test/common/mock", "vs/base/common/event", "vs/workbench/services/editor/common/editorService", "vs/platform/markers/common/markers", "vs/platform/markers/common/markerService", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, assert, testNotebookEditor_1, notebookOutline_1, themeService_1, mock_1, event_1, editorService_1, markers_1, markerService_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Notebook Outline', function () {
        const instantiationService = (0, testNotebookEditor_1.setupInstantiationService)();
        instantiationService.set(editorService_1.IEditorService, new class extends (0, mock_1.mock)() {
        });
        instantiationService.set(markers_1.IMarkerService, new markerService_1.MarkerService());
        instantiationService.set(themeService_1.IThemeService, new class extends (0, mock_1.mock)() {
            constructor() {
                super(...arguments);
                this.onDidFileIconThemeChange = event_1.Event.None;
            }
            getFileIconTheme() {
                return { hasFileIcons: true, hasFolderIcons: true, hidesExplorerArrows: false };
            }
        });
        function withNotebookOutline(cells, callback) {
            return (0, testNotebookEditor_1.withTestNotebook)(cells, (editor) => {
                if (!editor.hasModel()) {
                    assert.ok(false, 'MUST have active text editor');
                }
                const outline = instantiationService.createInstance(notebookOutline_1.NotebookCellOutline, editor, 1 /* OutlinePane */);
                return callback(outline, editor);
            });
        }
        test('basic', async function () {
            await withNotebookOutline([], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements(), []);
            });
        });
        test('special characters in heading', async function () {
            await withNotebookOutline([
                ['# Hellö & Hällo', 'md', notebookCommon_1.CellKind.Markdown]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'Hellö & Hällo');
            });
            await withNotebookOutline([
                ['# bo<i>ld</i>', 'md', notebookCommon_1.CellKind.Markdown]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'bold');
            });
        });
        test('Heading text defines entry label', async function () {
            return await withNotebookOutline([
                ['foo\n # h1', 'md', notebookCommon_1.CellKind.Markdown]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 1);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'h1');
            });
        });
        test('Notebook outline ignores markdown headings #115200', async function () {
            await withNotebookOutline([
                ['## h2 \n# h1', 'md', notebookCommon_1.CellKind.Markdown]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 2);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'h2');
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[1].label, 'h1');
            });
            await withNotebookOutline([
                ['## h2', 'md', notebookCommon_1.CellKind.Markdown],
                ['# h1', 'md', notebookCommon_1.CellKind.Markdown]
            ], outline => {
                assert.ok(outline instanceof notebookOutline_1.NotebookCellOutline);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements().length, 2);
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[0].label, 'h2');
                assert.deepStrictEqual(outline.config.quickPickDataSource.getQuickPickElements()[1].label, 'h1');
            });
        });
    });
});
//# sourceMappingURL=notebookOutline.test.js.map