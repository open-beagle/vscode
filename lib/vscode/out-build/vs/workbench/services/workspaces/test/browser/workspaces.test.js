/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/workbench/services/workspaces/browser/workspaces"], function (require, exports, assert, uri_1, workspaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workspaces', () => {
        test('workspace identifiers are stable', function () {
            var _a;
            // workspace identifier
            assert.strictEqual((0, workspaces_1.getWorkspaceIdentifier)(uri_1.URI.parse('vscode-remote:/hello/test')).id, '474434e4');
            // single folder identifier
            assert.strictEqual((_a = (0, workspaces_1.getSingleFolderWorkspaceIdentifier)(uri_1.URI.parse('vscode-remote:/hello/test'))) === null || _a === void 0 ? void 0 : _a.id, '474434e4');
        });
    });
});
// suite('Workspace Trust', () => {
// 	let workspaceTrustService: IWorkspaceTrustService;
// 	setup(() => {
// 		const instantiationService: TestInstantiationService = <TestInstantiationService>workbenchInstantiationService();
// 		workspaceTrustService = instantiationService.createInstance(WorkspaceTrustService);
// 	});
// 	teardown(() => {
// 	});
// 	test('Sample Test', function () {
// 		assert.strictEqual(workspaceTrustStateToString(workspaceTrustService.getWorkspaceTrustState()), 'Trusted');
// 	});
// });
//# sourceMappingURL=workspaces.test.js.map