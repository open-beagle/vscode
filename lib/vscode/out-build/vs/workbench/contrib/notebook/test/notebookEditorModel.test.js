/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/base/test/common/mock", "vs/platform/instantiation/common/instantiationService", "vs/platform/log/common/log", "vs/workbench/contrib/notebook/common/notebookEditorModel"], function (require, exports, assert, event_1, lifecycle_1, resources_1, uri_1, mock_1, instantiationService_1, log_1, notebookEditorModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('NotebookEditorModel', function () {
        const instaService = new instantiationService_1.InstantiationService();
        const notebokService = new class extends (0, mock_1.mock)() {
        };
        const backupService = new class extends (0, mock_1.mock)() {
        };
        const notificationService = new class extends (0, mock_1.mock)() {
        };
        const untitledTextEditorService = new class extends (0, mock_1.mock)() {
        };
        const fileService = new class extends (0, mock_1.mock)() {
            constructor() {
                super(...arguments);
                this.onDidFilesChange = event_1.Event.None;
            }
        };
        const labelService = new class extends (0, mock_1.mock)() {
            getUriBasenameLabel(uri) { return uri.toString(); }
        };
        const notebookDataProvider = new class extends (0, mock_1.mock)() {
        };
        test('working copy uri', function () {
            const r1 = uri_1.URI.parse('foo-files:///my.nb');
            const r2 = uri_1.URI.parse('bar-files:///my.nb');
            const copies = [];
            const workingCopyService = new class extends (0, mock_1.mock)() {
                registerWorkingCopy(copy) {
                    copies.push(copy);
                    return lifecycle_1.Disposable.None;
                }
            };
            new notebookEditorModel_1.ComplexNotebookEditorModel(r1, 'fff', notebookDataProvider, instaService, notebokService, workingCopyService, backupService, fileService, notificationService, new log_1.NullLogService(), untitledTextEditorService, labelService);
            new notebookEditorModel_1.ComplexNotebookEditorModel(r2, 'fff', notebookDataProvider, instaService, notebokService, workingCopyService, backupService, fileService, notificationService, new log_1.NullLogService(), untitledTextEditorService, labelService);
            assert.strictEqual(copies.length, 2);
            assert.strictEqual(!(0, resources_1.isEqual)(copies[0].resource, copies[1].resource), true);
        });
    });
});
//# sourceMappingURL=notebookEditorModel.test.js.map