/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/browser/mainThreadDocuments", "vs/editor/test/common/editorTestUtils", "vs/base/common/async", "vs/base/common/uri", "vs/base/common/resources"], function (require, exports, assert, mainThreadDocuments_1, editorTestUtils_1, async_1, uri_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('BoundModelReferenceCollection', () => {
        let col = new mainThreadDocuments_1.BoundModelReferenceCollection(resources_1.extUri, 15, 75);
        teardown(() => {
            col.dispose();
        });
        test('max age', async () => {
            let didDispose = false;
            col.add(uri_1.URI.parse('test://farboo'), {
                object: { textEditorModel: (0, editorTestUtils_1.createTextModel)('farboo') },
                dispose() {
                    didDispose = true;
                }
            });
            await (0, async_1.timeout)(30);
            assert.strictEqual(didDispose, true);
        });
        test('max size', () => {
            let disposed = [];
            col.add(uri_1.URI.parse('test://farboo'), {
                object: { textEditorModel: (0, editorTestUtils_1.createTextModel)('farboo') },
                dispose() {
                    disposed.push(0);
                }
            }, 6);
            col.add(uri_1.URI.parse('test://boofar'), {
                object: { textEditorModel: (0, editorTestUtils_1.createTextModel)('boofar') },
                dispose() {
                    disposed.push(1);
                }
            }, 6);
            col.add(uri_1.URI.parse('test://xxxxxxx'), {
                object: { textEditorModel: (0, editorTestUtils_1.createTextModel)(new Array(71).join('x')) },
                dispose() {
                    disposed.push(2);
                }
            }, 70);
            assert.deepStrictEqual(disposed, [0, 1]);
        });
        test('dispose uri', () => {
            let disposed = [];
            col.add(uri_1.URI.parse('test:///farboo'), {
                object: { textEditorModel: (0, editorTestUtils_1.createTextModel)('farboo') },
                dispose() {
                    disposed.push(0);
                }
            });
            col.add(uri_1.URI.parse('test:///boofar'), {
                object: { textEditorModel: (0, editorTestUtils_1.createTextModel)('boofar') },
                dispose() {
                    disposed.push(1);
                }
            });
            col.add(uri_1.URI.parse('test:///boo/far1'), {
                object: { textEditorModel: (0, editorTestUtils_1.createTextModel)('boo/far1') },
                dispose() {
                    disposed.push(2);
                }
            });
            col.add(uri_1.URI.parse('test:///boo/far2'), {
                object: { textEditorModel: (0, editorTestUtils_1.createTextModel)('boo/far2') },
                dispose() {
                    disposed.push(3);
                }
            });
            col.add(uri_1.URI.parse('test:///boo1/far'), {
                object: { textEditorModel: (0, editorTestUtils_1.createTextModel)('boo1/far') },
                dispose() {
                    disposed.push(4);
                }
            });
            col.remove(uri_1.URI.parse('test:///unknown'));
            assert.strictEqual(disposed.length, 0);
            col.remove(uri_1.URI.parse('test:///farboo'));
            assert.deepStrictEqual(disposed, [0]);
            disposed = [];
            col.remove(uri_1.URI.parse('test:///boo'));
            assert.deepStrictEqual(disposed, [2, 3]);
        });
    });
});
//# sourceMappingURL=mainThreadDocuments.test.js.map