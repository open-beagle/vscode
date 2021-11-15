/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "os", "vs/base/common/path", "vs/base/node/pfs", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/environment/node/argv", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/platform/workspaces/common/workspaces", "vs/platform/log/common/log", "vs/base/common/uri", "vs/base/test/node/testUtils", "vs/base/common/platform", "vs/base/common/labels", "vs/base/common/resources", "vs/platform/product/common/product"], function (require, exports, assert, fs, os, path, pfs, environmentMainService_1, argv_1, workspacesManagementMainService_1, workspaces_1, log_1, uri_1, testUtils_1, platform_1, labels_1, resources_1, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('WorkspacesManagementMainService', () => {
        class TestDialogMainService {
            pickFileFolder(options, window) { throw new Error('Method not implemented.'); }
            pickFolder(options, window) { throw new Error('Method not implemented.'); }
            pickFile(options, window) { throw new Error('Method not implemented.'); }
            pickWorkspace(options, window) { throw new Error('Method not implemented.'); }
            showMessageBox(options, window) { throw new Error('Method not implemented.'); }
            showSaveDialog(options, window) { throw new Error('Method not implemented.'); }
            showOpenDialog(options, window) { throw new Error('Method not implemented.'); }
        }
        class TestBackupMainService {
            isHotExitEnabled() { throw new Error('Method not implemented.'); }
            getWorkspaceBackups() { throw new Error('Method not implemented.'); }
            getFolderBackupPaths() { throw new Error('Method not implemented.'); }
            getEmptyWindowBackupPaths() { throw new Error('Method not implemented.'); }
            registerWorkspaceBackupSync(workspace, migrateFrom) { throw new Error('Method not implemented.'); }
            registerFolderBackupSync(folderUri) { throw new Error('Method not implemented.'); }
            registerEmptyWindowBackupSync(backupFolder, remoteAuthority) { throw new Error('Method not implemented.'); }
            unregisterWorkspaceBackupSync(workspace) { throw new Error('Method not implemented.'); }
            unregisterFolderBackupSync(folderUri) { throw new Error('Method not implemented.'); }
            unregisterEmptyWindowBackupSync(backupFolder) { throw new Error('Method not implemented.'); }
            async getDirtyWorkspaces() { return []; }
        }
        function createUntitledWorkspace(folders, names) {
            return service.createUntitledWorkspace(folders.map((folder, index) => ({ uri: uri_1.URI.file(folder), name: names ? names[index] : undefined })));
        }
        function createWorkspace(workspaceConfigPath, folders, names) {
            const ws = {
                folders: []
            };
            for (let i = 0; i < folders.length; i++) {
                const f = folders[i];
                const s = f instanceof uri_1.URI ? { uri: f.toString() } : { path: f };
                if (names) {
                    s.name = names[i];
                }
                ws.folders.push(s);
            }
            fs.writeFileSync(workspaceConfigPath, JSON.stringify(ws));
        }
        function createUntitledWorkspaceSync(folders, names) {
            return service.createUntitledWorkspaceSync(folders.map((folder, index) => ({ uri: uri_1.URI.file(folder), name: names ? names[index] : undefined })));
        }
        let testDir;
        let untitledWorkspacesHomePath;
        let environmentMainService;
        let service;
        const cwd = process.cwd();
        const tmpDir = os.tmpdir();
        setup(async () => {
            testDir = (0, testUtils_1.getRandomTestPath)(tmpDir, 'vsctests', 'workspacesmanagementmainservice');
            untitledWorkspacesHomePath = path.join(testDir, 'Workspaces');
            const productService = Object.assign({ _serviceBrand: undefined }, product_1.default);
            environmentMainService = new class TestEnvironmentService extends environmentMainService_1.EnvironmentMainService {
                constructor() {
                    super((0, argv_1.parseArgs)(process.argv, argv_1.OPTIONS), productService);
                }
                get untitledWorkspacesHome() {
                    return uri_1.URI.file(untitledWorkspacesHomePath);
                }
            };
            service = new workspacesManagementMainService_1.WorkspacesManagementMainService(environmentMainService, new log_1.NullLogService(), new TestBackupMainService(), new TestDialogMainService(), productService);
            return fs.promises.mkdir(untitledWorkspacesHomePath, { recursive: true });
        });
        teardown(() => {
            service.dispose();
            return pfs.rimraf(testDir);
        });
        function assertPathEquals(p1, p2) {
            if (platform_1.isWindows) {
                p1 = (0, labels_1.normalizeDriveLetter)(p1);
                p2 = (0, labels_1.normalizeDriveLetter)(p2);
            }
            assert.strictEqual(p1, p2);
        }
        function assertEqualURI(u1, u2) {
            assert.strictEqual(u1.toString(), u2.toString());
        }
        test('createWorkspace (folders)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            assert.ok(workspace);
            assert.ok(fs.existsSync(workspace.configPath.fsPath));
            assert.ok(service.isUntitledWorkspace(workspace));
            const ws = JSON.parse(fs.readFileSync(workspace.configPath.fsPath).toString());
            assert.strictEqual(ws.folders.length, 2);
            assertPathEquals(ws.folders[0].path, cwd);
            assertPathEquals(ws.folders[1].path, tmpDir);
            assert.ok(!ws.folders[0].name);
            assert.ok(!ws.folders[1].name);
        });
        test('createWorkspace (folders with name)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir], ['currentworkingdirectory', 'tempdir']);
            assert.ok(workspace);
            assert.ok(fs.existsSync(workspace.configPath.fsPath));
            assert.ok(service.isUntitledWorkspace(workspace));
            const ws = JSON.parse(fs.readFileSync(workspace.configPath.fsPath).toString());
            assert.strictEqual(ws.folders.length, 2);
            assertPathEquals(ws.folders[0].path, cwd);
            assertPathEquals(ws.folders[1].path, tmpDir);
            assert.strictEqual(ws.folders[0].name, 'currentworkingdirectory');
            assert.strictEqual(ws.folders[1].name, 'tempdir');
        });
        test('createUntitledWorkspace (folders as other resource URIs)', async () => {
            const folder1URI = uri_1.URI.parse('myscheme://server/work/p/f1');
            const folder2URI = uri_1.URI.parse('myscheme://server/work/o/f3');
            const workspace = await service.createUntitledWorkspace([{ uri: folder1URI }, { uri: folder2URI }], 'server');
            assert.ok(workspace);
            assert.ok(fs.existsSync(workspace.configPath.fsPath));
            assert.ok(service.isUntitledWorkspace(workspace));
            const ws = JSON.parse(fs.readFileSync(workspace.configPath.fsPath).toString());
            assert.strictEqual(ws.folders.length, 2);
            assert.strictEqual(ws.folders[0].uri, folder1URI.toString(true));
            assert.strictEqual(ws.folders[1].uri, folder2URI.toString(true));
            assert.ok(!ws.folders[0].name);
            assert.ok(!ws.folders[1].name);
            assert.strictEqual(ws.remoteAuthority, 'server');
        });
        test('createWorkspaceSync (folders)', () => {
            const workspace = createUntitledWorkspaceSync([cwd, tmpDir]);
            assert.ok(workspace);
            assert.ok(fs.existsSync(workspace.configPath.fsPath));
            assert.ok(service.isUntitledWorkspace(workspace));
            const ws = JSON.parse(fs.readFileSync(workspace.configPath.fsPath).toString());
            assert.strictEqual(ws.folders.length, 2);
            assertPathEquals(ws.folders[0].path, cwd);
            assertPathEquals(ws.folders[1].path, tmpDir);
            assert.ok(!ws.folders[0].name);
            assert.ok(!ws.folders[1].name);
        });
        test('createWorkspaceSync (folders with names)', () => {
            const workspace = createUntitledWorkspaceSync([cwd, tmpDir], ['currentworkingdirectory', 'tempdir']);
            assert.ok(workspace);
            assert.ok(fs.existsSync(workspace.configPath.fsPath));
            assert.ok(service.isUntitledWorkspace(workspace));
            const ws = JSON.parse(fs.readFileSync(workspace.configPath.fsPath).toString());
            assert.strictEqual(ws.folders.length, 2);
            assertPathEquals(ws.folders[0].path, cwd);
            assertPathEquals(ws.folders[1].path, tmpDir);
            assert.strictEqual(ws.folders[0].name, 'currentworkingdirectory');
            assert.strictEqual(ws.folders[1].name, 'tempdir');
        });
        test('createUntitledWorkspaceSync (folders as other resource URIs)', () => {
            const folder1URI = uri_1.URI.parse('myscheme://server/work/p/f1');
            const folder2URI = uri_1.URI.parse('myscheme://server/work/o/f3');
            const workspace = service.createUntitledWorkspaceSync([{ uri: folder1URI }, { uri: folder2URI }]);
            assert.ok(workspace);
            assert.ok(fs.existsSync(workspace.configPath.fsPath));
            assert.ok(service.isUntitledWorkspace(workspace));
            const ws = JSON.parse(fs.readFileSync(workspace.configPath.fsPath).toString());
            assert.strictEqual(ws.folders.length, 2);
            assert.strictEqual(ws.folders[0].uri, folder1URI.toString(true));
            assert.strictEqual(ws.folders[1].uri, folder2URI.toString(true));
            assert.ok(!ws.folders[0].name);
            assert.ok(!ws.folders[1].name);
        });
        test('resolveWorkspaceSync', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            assert.ok(service.resolveLocalWorkspaceSync(workspace.configPath));
            // make it a valid workspace path
            const newPath = path.join(path.dirname(workspace.configPath.fsPath), `workspace.${workspaces_1.WORKSPACE_EXTENSION}`);
            fs.renameSync(workspace.configPath.fsPath, newPath);
            workspace.configPath = uri_1.URI.file(newPath);
            const resolved = service.resolveLocalWorkspaceSync(workspace.configPath);
            assert.strictEqual(2, resolved.folders.length);
            assertEqualURI(resolved.configPath, workspace.configPath);
            assert.ok(resolved.id);
            fs.writeFileSync(workspace.configPath.fsPath, JSON.stringify({ something: 'something' })); // invalid workspace
            const resolvedInvalid = service.resolveLocalWorkspaceSync(workspace.configPath);
            assert.ok(!resolvedInvalid);
        });
        test('resolveWorkspaceSync (support relative paths)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            fs.writeFileSync(workspace.configPath.fsPath, JSON.stringify({ folders: [{ path: './ticino-playground/lib' }] }));
            const resolved = service.resolveLocalWorkspaceSync(workspace.configPath);
            assertEqualURI(resolved.folders[0].uri, uri_1.URI.file(path.join(path.dirname(workspace.configPath.fsPath), 'ticino-playground', 'lib')));
        });
        test('resolveWorkspaceSync (support relative paths #2)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            fs.writeFileSync(workspace.configPath.fsPath, JSON.stringify({ folders: [{ path: './ticino-playground/lib/../other' }] }));
            const resolved = service.resolveLocalWorkspaceSync(workspace.configPath);
            assertEqualURI(resolved.folders[0].uri, uri_1.URI.file(path.join(path.dirname(workspace.configPath.fsPath), 'ticino-playground', 'other')));
        });
        test('resolveWorkspaceSync (support relative paths #3)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            fs.writeFileSync(workspace.configPath.fsPath, JSON.stringify({ folders: [{ path: 'ticino-playground/lib' }] }));
            const resolved = service.resolveLocalWorkspaceSync(workspace.configPath);
            assertEqualURI(resolved.folders[0].uri, uri_1.URI.file(path.join(path.dirname(workspace.configPath.fsPath), 'ticino-playground', 'lib')));
        });
        test('resolveWorkspaceSync (support invalid JSON via fault tolerant parsing)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            fs.writeFileSync(workspace.configPath.fsPath, '{ "folders": [ { "path": "./ticino-playground/lib" } , ] }'); // trailing comma
            const resolved = service.resolveLocalWorkspaceSync(workspace.configPath);
            assertEqualURI(resolved.folders[0].uri, uri_1.URI.file(path.join(path.dirname(workspace.configPath.fsPath), 'ticino-playground', 'lib')));
        });
        test('rewriteWorkspaceFileForNewLocation', async () => {
            const folder1 = cwd; // absolute path because outside of tmpDir
            const tmpInsideDir = path.join(tmpDir, 'inside');
            const firstConfigPath = path.join(tmpDir, 'myworkspace0.code-workspace');
            createWorkspace(firstConfigPath, [folder1, 'inside', path.join('inside', 'somefolder')]);
            const origContent = fs.readFileSync(firstConfigPath).toString();
            let origConfigPath = uri_1.URI.file(firstConfigPath);
            let workspaceConfigPath = uri_1.URI.file(path.join(tmpDir, 'inside', 'myworkspace1.code-workspace'));
            let newContent = (0, workspaces_1.rewriteWorkspaceFileForNewLocation)(origContent, origConfigPath, false, workspaceConfigPath, resources_1.extUriBiasedIgnorePathCase);
            let ws = JSON.parse(newContent);
            assert.strictEqual(ws.folders.length, 3);
            assertPathEquals(ws.folders[0].path, folder1); // absolute path because outside of tmpdir
            assertPathEquals(ws.folders[1].path, '.');
            assertPathEquals(ws.folders[2].path, 'somefolder');
            origConfigPath = workspaceConfigPath;
            workspaceConfigPath = uri_1.URI.file(path.join(tmpDir, 'myworkspace2.code-workspace'));
            newContent = (0, workspaces_1.rewriteWorkspaceFileForNewLocation)(newContent, origConfigPath, false, workspaceConfigPath, resources_1.extUriBiasedIgnorePathCase);
            ws = JSON.parse(newContent);
            assert.strictEqual(ws.folders.length, 3);
            assertPathEquals(ws.folders[0].path, folder1);
            assertPathEquals(ws.folders[1].path, 'inside');
            assertPathEquals(ws.folders[2].path, platform_1.isWindows ? 'inside\\somefolder' : 'inside/somefolder');
            origConfigPath = workspaceConfigPath;
            workspaceConfigPath = uri_1.URI.file(path.join(tmpDir, 'other', 'myworkspace2.code-workspace'));
            newContent = (0, workspaces_1.rewriteWorkspaceFileForNewLocation)(newContent, origConfigPath, false, workspaceConfigPath, resources_1.extUriBiasedIgnorePathCase);
            ws = JSON.parse(newContent);
            assert.strictEqual(ws.folders.length, 3);
            assertPathEquals(ws.folders[0].path, folder1);
            assertPathEquals(ws.folders[1].path, platform_1.isWindows ? '..\\inside' : '../inside');
            assertPathEquals(ws.folders[2].path, platform_1.isWindows ? '..\\inside\\somefolder' : '../inside/somefolder');
            origConfigPath = workspaceConfigPath;
            workspaceConfigPath = uri_1.URI.parse('foo://foo/bar/myworkspace2.code-workspace');
            newContent = (0, workspaces_1.rewriteWorkspaceFileForNewLocation)(newContent, origConfigPath, false, workspaceConfigPath, resources_1.extUriBiasedIgnorePathCase);
            ws = JSON.parse(newContent);
            assert.strictEqual(ws.folders.length, 3);
            assert.strictEqual(ws.folders[0].uri, uri_1.URI.file(folder1).toString(true));
            assert.strictEqual(ws.folders[1].uri, uri_1.URI.file(tmpInsideDir).toString(true));
            assert.strictEqual(ws.folders[2].uri, uri_1.URI.file(path.join(tmpInsideDir, 'somefolder')).toString(true));
            fs.unlinkSync(firstConfigPath);
        });
        test('rewriteWorkspaceFileForNewLocation (preserves comments)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir, path.join(tmpDir, 'somefolder')]);
            const workspaceConfigPath = uri_1.URI.file(path.join(tmpDir, `myworkspace.${Date.now()}.${workspaces_1.WORKSPACE_EXTENSION}`));
            let origContent = fs.readFileSync(workspace.configPath.fsPath).toString();
            origContent = `// this is a comment\n${origContent}`;
            let newContent = (0, workspaces_1.rewriteWorkspaceFileForNewLocation)(origContent, workspace.configPath, false, workspaceConfigPath, resources_1.extUriBiasedIgnorePathCase);
            assert.strictEqual(0, newContent.indexOf('// this is a comment'));
            service.deleteUntitledWorkspaceSync(workspace);
        });
        test('rewriteWorkspaceFileForNewLocation (preserves forward slashes)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir, path.join(tmpDir, 'somefolder')]);
            const workspaceConfigPath = uri_1.URI.file(path.join(tmpDir, `myworkspace.${Date.now()}.${workspaces_1.WORKSPACE_EXTENSION}`));
            let origContent = fs.readFileSync(workspace.configPath.fsPath).toString();
            origContent = origContent.replace(/[\\]/g, '/'); // convert backslash to slash
            const newContent = (0, workspaces_1.rewriteWorkspaceFileForNewLocation)(origContent, workspace.configPath, false, workspaceConfigPath, resources_1.extUriBiasedIgnorePathCase);
            const ws = JSON.parse(newContent);
            assert.ok(ws.folders.every(f => f.path.indexOf('\\') < 0));
            service.deleteUntitledWorkspaceSync(workspace);
        });
        (!platform_1.isWindows ? test.skip : test)('rewriteWorkspaceFileForNewLocation (unc paths)', async () => {
            const workspaceLocation = path.join(tmpDir, 'wsloc');
            const folder1Location = 'x:\\foo';
            const folder2Location = '\\\\server\\share2\\some\\path';
            const folder3Location = path.join(workspaceLocation, 'inner', 'more');
            const workspace = await createUntitledWorkspace([folder1Location, folder2Location, folder3Location]);
            const workspaceConfigPath = uri_1.URI.file(path.join(workspaceLocation, `myworkspace.${Date.now()}.${workspaces_1.WORKSPACE_EXTENSION}`));
            let origContent = fs.readFileSync(workspace.configPath.fsPath).toString();
            const newContent = (0, workspaces_1.rewriteWorkspaceFileForNewLocation)(origContent, workspace.configPath, true, workspaceConfigPath, resources_1.extUriBiasedIgnorePathCase);
            const ws = JSON.parse(newContent);
            assertPathEquals(ws.folders[0].path, folder1Location);
            assertPathEquals(ws.folders[1].path, folder2Location);
            assertPathEquals(ws.folders[2].path, 'inner\\more');
            service.deleteUntitledWorkspaceSync(workspace);
        });
        test('deleteUntitledWorkspaceSync (untitled)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            assert.ok(fs.existsSync(workspace.configPath.fsPath));
            service.deleteUntitledWorkspaceSync(workspace);
            assert.ok(!fs.existsSync(workspace.configPath.fsPath));
        });
        test('deleteUntitledWorkspaceSync (saved)', async () => {
            const workspace = await createUntitledWorkspace([cwd, tmpDir]);
            service.deleteUntitledWorkspaceSync(workspace);
        });
        test('getUntitledWorkspaceSync', async function () {
            let untitled = service.getUntitledWorkspacesSync();
            assert.strictEqual(untitled.length, 0);
            const untitledOne = await createUntitledWorkspace([cwd, tmpDir]);
            assert.ok(fs.existsSync(untitledOne.configPath.fsPath));
            untitled = service.getUntitledWorkspacesSync();
            assert.strictEqual(1, untitled.length);
            assert.strictEqual(untitledOne.id, untitled[0].workspace.id);
            service.deleteUntitledWorkspaceSync(untitledOne);
            untitled = service.getUntitledWorkspacesSync();
            assert.strictEqual(0, untitled.length);
        });
        test('getSingleWorkspaceIdentifier', async function () {
            const nonLocalUri = uri_1.URI.parse('myscheme://server/work/p/f1');
            const nonLocalUriId = (0, workspacesManagementMainService_1.getSingleFolderWorkspaceIdentifier)(nonLocalUri);
            assert.ok(nonLocalUriId === null || nonLocalUriId === void 0 ? void 0 : nonLocalUriId.id);
            const localNonExistingUri = uri_1.URI.file(path.join(testDir, 'f1'));
            const localNonExistingUriId = (0, workspacesManagementMainService_1.getSingleFolderWorkspaceIdentifier)(localNonExistingUri);
            assert.ok(!localNonExistingUriId);
            fs.mkdirSync(path.join(testDir, 'f1'));
            const localExistingUri = uri_1.URI.file(path.join(testDir, 'f1'));
            const localExistingUriId = (0, workspacesManagementMainService_1.getSingleFolderWorkspaceIdentifier)(localExistingUri);
            assert.ok(localExistingUriId === null || localExistingUriId === void 0 ? void 0 : localExistingUriId.id);
        });
        test('workspace identifiers are stable', function () {
            var _a, _b;
            // workspace identifier (local)
            assert.strictEqual((0, workspacesManagementMainService_1.getWorkspaceIdentifier)(uri_1.URI.file('/hello/test')).id, platform_1.isWindows /* slash vs backslash */ ? '9f3efb614e2cd7924e4b8076e6c72233' : 'e36736311be12ff6d695feefe415b3e8');
            // single folder identifier (local)
            const fakeStat = {
                ino: 1611312115129,
                birthtimeMs: 1611312115129,
                birthtime: new Date(1611312115129)
            };
            assert.strictEqual((_a = (0, workspacesManagementMainService_1.getSingleFolderWorkspaceIdentifier)(uri_1.URI.file('/hello/test'), fakeStat)) === null || _a === void 0 ? void 0 : _a.id, platform_1.isWindows /* slash vs backslash */ ? '9a8441e897e5174fa388bc7ef8f7a710' : '1d726b3d516dc2a6d343abf4797eaaef');
            // workspace identifier (remote)
            assert.strictEqual((0, workspacesManagementMainService_1.getWorkspaceIdentifier)(uri_1.URI.parse('vscode-remote:/hello/test')).id, '786de4f224d57691f218dc7f31ee2ee3');
            // single folder identifier (remote)
            assert.strictEqual((_b = (0, workspacesManagementMainService_1.getSingleFolderWorkspaceIdentifier)(uri_1.URI.parse('vscode-remote:/hello/test'))) === null || _b === void 0 ? void 0 : _b.id, '786de4f224d57691f218dc7f31ee2ee3');
        });
    });
});
//# sourceMappingURL=workspacesManagementMainService.test.js.map