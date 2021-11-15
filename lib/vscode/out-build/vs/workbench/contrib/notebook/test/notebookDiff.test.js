/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/diff/diff", "vs/workbench/contrib/notebook/browser/diff/eventDispatcher", "vs/workbench/contrib/notebook/browser/diff/notebookTextDiffEditor", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/test/testNotebookEditor"], function (require, exports, assert, diff_1, eventDispatcher_1, notebookTextDiffEditor_1, notebookCommon_1, testNotebookEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookCommon', () => {
        test('diff insert', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], [
                ['var h = 8;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}]
            ], (model, accessor) => {
                const eventDispatcher = new eventDispatcher_1.NotebookDiffEditorEventDispatcher();
                const diffResult = notebookTextDiffEditor_1.NotebookTextDiffEditor.computeDiff(accessor, model, eventDispatcher, {
                    cellsDiff: {
                        changes: [{
                                originalStart: 0,
                                originalLength: 0,
                                modifiedStart: 0,
                                modifiedLength: 1
                            }],
                        quitEarly: false
                    }
                });
                assert.strictEqual(diffResult.firstChangeIndex, 0);
                assert.strictEqual(diffResult.viewModels[0].type, 'insert');
                assert.strictEqual(diffResult.viewModels[1].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[2].type, 'unchanged');
            });
        });
        test('diff insert 2', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var f = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var g = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], [
                ['var h = 8;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var a = 1;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var b = 2;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var c = 3;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var d = 4;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var e = 5;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var f = 6;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['var g = 7;', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (model, accessor) => {
                const eventDispatcher = new eventDispatcher_1.NotebookDiffEditorEventDispatcher();
                const diffResult = notebookTextDiffEditor_1.NotebookTextDiffEditor.computeDiff(accessor, model, eventDispatcher, {
                    cellsDiff: {
                        changes: [{
                                originalStart: 0,
                                originalLength: 0,
                                modifiedStart: 0,
                                modifiedLength: 1
                            }, {
                                originalStart: 0,
                                originalLength: 6,
                                modifiedStart: 1,
                                modifiedLength: 6
                            }],
                        quitEarly: false
                    }
                });
                assert.strictEqual(diffResult.firstChangeIndex, 0);
                assert.strictEqual(diffResult.viewModels[0].type, 'insert');
                assert.strictEqual(diffResult.viewModels[1].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[2].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[3].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[4].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[5].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[6].type, 'unchanged');
                assert.strictEqual(diffResult.viewModels[7].type, 'unchanged');
            });
        });
        test('LCS', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['# Description', 'markdown', notebookCommon_1.CellKind.Markdown, [], { custom: { metadata: {} } }],
                ['x = 3', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: true } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: 'text/plain', value: '3' }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: false } } }]
            ], [
                ['# Description', 'markdown', notebookCommon_1.CellKind.Markdown, [], { custom: { metadata: {} } }],
                ['x = 3', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: true } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: false } } }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: 'text/plain', value: '3' }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 1 }]
            ], async (model) => {
                const diff = new diff_1.LcsDiff(new notebookCommon_1.CellSequence(model.original.notebook), new notebookCommon_1.CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                assert.deepStrictEqual(diffResult.changes.map(change => ({
                    originalStart: change.originalStart,
                    originalLength: change.originalLength,
                    modifiedStart: change.modifiedStart,
                    modifiedLength: change.modifiedLength
                })), [{
                        originalStart: 2,
                        originalLength: 0,
                        modifiedStart: 2,
                        modifiedLength: 1
                    }, {
                        originalStart: 3,
                        originalLength: 1,
                        modifiedStart: 4,
                        modifiedLength: 0
                    }]);
            });
        });
        test('LCS 2', async () => {
            await (0, testNotebookEditor_1.withTestNotebookDiffModel)([
                ['# Description', 'markdown', notebookCommon_1.CellKind.Markdown, [], { custom: { metadata: {} } }],
                ['x = 3', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: true } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: 'text/plain', value: '3' }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: false } } }],
                ['x = 5', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: 'text/plain', value: '5' }] }], {}],
            ], [
                ['# Description', 'markdown', notebookCommon_1.CellKind.Markdown, [], { custom: { metadata: {} } }],
                ['x = 3', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: true } }, executionOrder: 1 }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], { custom: { metadata: { collapsed: false } } }],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: 'text/plain', value: '3' }] }], { custom: { metadata: { collapsed: false } }, executionOrder: 1 }],
                ['x = 5', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [{ outputId: 'someId', outputs: [{ mime: 'text/plain', value: '5' }] }], {}],
                ['x', 'javascript', notebookCommon_1.CellKind.Code, [], {}],
            ], async (model) => {
                const diff = new diff_1.LcsDiff(new notebookCommon_1.CellSequence(model.original.notebook), new notebookCommon_1.CellSequence(model.modified.notebook));
                const diffResult = diff.ComputeDiff(false);
                notebookTextDiffEditor_1.NotebookTextDiffEditor.prettyChanges(model, diffResult);
                assert.deepStrictEqual(diffResult.changes.map(change => ({
                    originalStart: change.originalStart,
                    originalLength: change.originalLength,
                    modifiedStart: change.modifiedStart,
                    modifiedLength: change.modifiedLength
                })), [{
                        originalStart: 2,
                        originalLength: 0,
                        modifiedStart: 2,
                        modifiedLength: 1
                    }, {
                        originalStart: 3,
                        originalLength: 1,
                        modifiedStart: 4,
                        modifiedLength: 0
                    }, {
                        originalStart: 5,
                        originalLength: 0,
                        modifiedStart: 5,
                        modifiedLength: 1
                    }, {
                        originalStart: 6,
                        originalLength: 1,
                        modifiedStart: 7,
                        modifiedLength: 0
                    }]);
            });
        });
    });
});
//# sourceMappingURL=notebookDiff.test.js.map