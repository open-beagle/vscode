/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/api/browser/mainThreadDocumentContentProviders", "vs/editor/test/common/editorTestUtils", "vs/base/test/common/mock", "vs/workbench/test/browser/api/testRPCProtocol"], function (require, exports, assert, uri_1, mainThreadDocumentContentProviders_1, editorTestUtils_1, mock_1, testRPCProtocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadDocumentContentProviders', function () {
        test('events are processed properly', function () {
            let uri = uri_1.URI.parse('test:uri');
            let model = (0, editorTestUtils_1.createTextModel)('1', undefined, undefined, uri);
            let providers = new mainThreadDocumentContentProviders_1.MainThreadDocumentContentProviders(new testRPCProtocol_1.TestRPCProtocol(), null, null, new class extends (0, mock_1.mock)() {
                getModel(_uri) {
                    assert.strictEqual(uri.toString(), _uri.toString());
                    return model;
                }
            }, new class extends (0, mock_1.mock)() {
                computeMoreMinimalEdits(_uri, data) {
                    assert.strictEqual(model.getValue(), '1');
                    return Promise.resolve(data);
                }
            });
            return new Promise((resolve, reject) => {
                let expectedEvents = 1;
                model.onDidChangeContent(e => {
                    expectedEvents -= 1;
                    try {
                        assert.ok(expectedEvents >= 0);
                    }
                    catch (err) {
                        reject(err);
                    }
                    if (model.getValue() === '1\n2\n3') {
                        resolve();
                    }
                });
                providers.$onVirtualDocumentChange(uri, '1\n2');
                providers.$onVirtualDocumentChange(uri, '1\n2\n3');
            });
        });
    });
});
//# sourceMappingURL=mainThreadDocumentContentProviders.test.js.map