/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "os", "vs/base/common/path", "vs/base/common/uuid", "vs/base/node/pfs", "vs/base/common/async", "vs/base/common/normalization", "vs/base/common/buffer", "vs/base/test/node/testUtils", "vs/base/common/platform"], function (require, exports, assert, fs, os_1, path_1, uuid_1, pfs_1, async_1, normalization_1, buffer_1, testUtils_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, testUtils_1.flakySuite)('PFS', function () {
        let testDir;
        setup(() => {
            testDir = (0, testUtils_1.getRandomTestPath)((0, os_1.tmpdir)(), 'vsctests', 'pfs');
            return fs.promises.mkdir(testDir, { recursive: true });
        });
        teardown(() => {
            return (0, pfs_1.rimraf)(testDir);
        });
        test('writeFile', async () => {
            const testFile = (0, path_1.join)(testDir, 'writefile.txt');
            assert.ok(!(await (0, pfs_1.exists)(testFile)));
            await (0, pfs_1.writeFile)(testFile, 'Hello World', (null));
            assert.strictEqual((await fs.promises.readFile(testFile)).toString(), 'Hello World');
        });
        test('writeFile - parallel write on different files works', async () => {
            const testFile1 = (0, path_1.join)(testDir, 'writefile1.txt');
            const testFile2 = (0, path_1.join)(testDir, 'writefile2.txt');
            const testFile3 = (0, path_1.join)(testDir, 'writefile3.txt');
            const testFile4 = (0, path_1.join)(testDir, 'writefile4.txt');
            const testFile5 = (0, path_1.join)(testDir, 'writefile5.txt');
            await Promise.all([
                (0, pfs_1.writeFile)(testFile1, 'Hello World 1', (null)),
                (0, pfs_1.writeFile)(testFile2, 'Hello World 2', (null)),
                (0, pfs_1.writeFile)(testFile3, 'Hello World 3', (null)),
                (0, pfs_1.writeFile)(testFile4, 'Hello World 4', (null)),
                (0, pfs_1.writeFile)(testFile5, 'Hello World 5', (null))
            ]);
            assert.strictEqual(fs.readFileSync(testFile1).toString(), 'Hello World 1');
            assert.strictEqual(fs.readFileSync(testFile2).toString(), 'Hello World 2');
            assert.strictEqual(fs.readFileSync(testFile3).toString(), 'Hello World 3');
            assert.strictEqual(fs.readFileSync(testFile4).toString(), 'Hello World 4');
            assert.strictEqual(fs.readFileSync(testFile5).toString(), 'Hello World 5');
        });
        test('writeFile - parallel write on same files works and is sequentalized', async () => {
            const testFile = (0, path_1.join)(testDir, 'writefile.txt');
            await Promise.all([
                (0, pfs_1.writeFile)(testFile, 'Hello World 1', undefined),
                (0, pfs_1.writeFile)(testFile, 'Hello World 2', undefined),
                (0, async_1.timeout)(10).then(() => (0, pfs_1.writeFile)(testFile, 'Hello World 3', undefined)),
                (0, pfs_1.writeFile)(testFile, 'Hello World 4', undefined),
                (0, async_1.timeout)(10).then(() => (0, pfs_1.writeFile)(testFile, 'Hello World 5', undefined))
            ]);
            assert.strictEqual(fs.readFileSync(testFile).toString(), 'Hello World 5');
        });
        test('rimraf - simple - unlink', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            await (0, pfs_1.rimraf)(testDir);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - simple - move', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            await (0, pfs_1.rimraf)(testDir, pfs_1.RimRafMode.MOVE);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - recursive folder structure - unlink', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            fs.mkdirSync((0, path_1.join)(testDir, 'somefolder'));
            fs.writeFileSync((0, path_1.join)(testDir, 'somefolder', 'somefile.txt'), 'Contents');
            await (0, pfs_1.rimraf)(testDir);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - recursive folder structure - move', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            fs.mkdirSync((0, path_1.join)(testDir, 'somefolder'));
            fs.writeFileSync((0, path_1.join)(testDir, 'somefolder', 'somefile.txt'), 'Contents');
            await (0, pfs_1.rimraf)(testDir, pfs_1.RimRafMode.MOVE);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - simple ends with dot - move', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            await (0, pfs_1.rimraf)(testDir, pfs_1.RimRafMode.MOVE);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimraf - simple ends with dot slash/backslash - move', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            await (0, pfs_1.rimraf)(`${testDir}${path_1.sep}`, pfs_1.RimRafMode.MOVE);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimrafSync - swallows file not found error', function () {
            const nonExistingDir = (0, path_1.join)(testDir, 'not-existing');
            (0, pfs_1.rimrafSync)(nonExistingDir);
            assert.ok(!fs.existsSync(nonExistingDir));
        });
        test('rimrafSync - simple', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            (0, pfs_1.rimrafSync)(testDir);
            assert.ok(!fs.existsSync(testDir));
        });
        test('rimrafSync - recursive folder structure', async () => {
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            fs.mkdirSync((0, path_1.join)(testDir, 'somefolder'));
            fs.writeFileSync((0, path_1.join)(testDir, 'somefolder', 'somefile.txt'), 'Contents');
            (0, pfs_1.rimrafSync)(testDir);
            assert.ok(!fs.existsSync(testDir));
        });
        test('copy, move and delete', async () => {
            const id = (0, uuid_1.generateUuid)();
            const id2 = (0, uuid_1.generateUuid)();
            const sourceDir = (0, testUtils_1.getPathFromAmdModule)(require, './fixtures');
            const parentDir = (0, path_1.join)((0, os_1.tmpdir)(), 'vsctests', 'pfs');
            const targetDir = (0, path_1.join)(parentDir, id);
            const targetDir2 = (0, path_1.join)(parentDir, id2);
            await (0, pfs_1.copy)(sourceDir, targetDir, { preserveSymlinks: true });
            assert.ok(fs.existsSync(targetDir));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir, 'index.html')));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir, 'site.css')));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir, 'examples')));
            assert.ok(fs.statSync((0, path_1.join)(targetDir, 'examples')).isDirectory());
            assert.ok(fs.existsSync((0, path_1.join)(targetDir, 'examples', 'small.jxs')));
            await (0, pfs_1.move)(targetDir, targetDir2);
            assert.ok(!fs.existsSync(targetDir));
            assert.ok(fs.existsSync(targetDir2));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'index.html')));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'site.css')));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'examples')));
            assert.ok(fs.statSync((0, path_1.join)(targetDir2, 'examples')).isDirectory());
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'examples', 'small.jxs')));
            await (0, pfs_1.move)((0, path_1.join)(targetDir2, 'index.html'), (0, path_1.join)(targetDir2, 'index_moved.html'));
            assert.ok(!fs.existsSync((0, path_1.join)(targetDir2, 'index.html')));
            assert.ok(fs.existsSync((0, path_1.join)(targetDir2, 'index_moved.html')));
            await (0, pfs_1.rimraf)(parentDir);
            assert.ok(!fs.existsSync(parentDir));
        });
        test('copy handles symbolic links', async () => {
            const id1 = (0, uuid_1.generateUuid)();
            const symbolicLinkTarget = (0, path_1.join)(testDir, id1);
            const id2 = (0, uuid_1.generateUuid)();
            const symLink = (0, path_1.join)(testDir, id2);
            const id3 = (0, uuid_1.generateUuid)();
            const copyTarget = (0, path_1.join)(testDir, id3);
            await fs.promises.mkdir(symbolicLinkTarget, { recursive: true });
            fs.symlinkSync(symbolicLinkTarget, symLink, 'junction');
            // Copy preserves symlinks if configured as such
            //
            // Windows: this test does not work because creating symlinks
            // requires priviledged permissions (admin).
            if (!platform_1.isWindows) {
                await (0, pfs_1.copy)(symLink, copyTarget, { preserveSymlinks: true });
                assert.ok(fs.existsSync(copyTarget));
                const { symbolicLink } = await pfs_1.SymlinkSupport.stat(copyTarget);
                assert.ok(symbolicLink);
                assert.ok(!symbolicLink.dangling);
                const target = await fs.promises.readlink(copyTarget);
                assert.strictEqual(target, symbolicLinkTarget);
                // Copy does not preserve symlinks if configured as such
                await (0, pfs_1.rimraf)(copyTarget);
                await (0, pfs_1.copy)(symLink, copyTarget, { preserveSymlinks: false });
                assert.ok(fs.existsSync(copyTarget));
                const { symbolicLink: symbolicLink2 } = await pfs_1.SymlinkSupport.stat(copyTarget);
                assert.ok(!symbolicLink2);
            }
            // Copy does not fail over dangling symlinks
            await (0, pfs_1.rimraf)(copyTarget);
            await (0, pfs_1.rimraf)(symbolicLinkTarget);
            await (0, pfs_1.copy)(symLink, copyTarget, { preserveSymlinks: true }); // this should not throw
            if (!platform_1.isWindows) {
                const { symbolicLink } = await pfs_1.SymlinkSupport.stat(copyTarget);
                assert.ok(symbolicLink === null || symbolicLink === void 0 ? void 0 : symbolicLink.dangling);
            }
            else {
                assert.ok(!fs.existsSync(copyTarget));
            }
        });
        test('copy handles symbolic links when the reference is inside source', async () => {
            // Source Folder
            const sourceFolder = (0, path_1.join)(testDir, (0, uuid_1.generateUuid)(), 'copy-test'); // copy-test
            const sourceLinkTestFolder = (0, path_1.join)(sourceFolder, 'link-test'); // copy-test/link-test
            const sourceLinkMD5JSFolder = (0, path_1.join)(sourceLinkTestFolder, 'md5'); // copy-test/link-test/md5
            const sourceLinkMD5JSFile = (0, path_1.join)(sourceLinkMD5JSFolder, 'md5.js'); // copy-test/link-test/md5/md5.js
            await fs.promises.mkdir(sourceLinkMD5JSFolder, { recursive: true });
            await (0, pfs_1.writeFile)(sourceLinkMD5JSFile, 'Hello from MD5');
            const sourceLinkMD5JSFolderLinked = (0, path_1.join)(sourceLinkTestFolder, 'md5-linked'); // copy-test/link-test/md5-linked
            fs.symlinkSync(sourceLinkMD5JSFolder, sourceLinkMD5JSFolderLinked, 'junction');
            // Target Folder
            const targetLinkTestFolder = (0, path_1.join)(sourceFolder, 'link-test copy'); // copy-test/link-test copy
            const targetLinkMD5JSFolder = (0, path_1.join)(targetLinkTestFolder, 'md5'); // copy-test/link-test copy/md5
            const targetLinkMD5JSFile = (0, path_1.join)(targetLinkMD5JSFolder, 'md5.js'); // copy-test/link-test copy/md5/md5.js
            const targetLinkMD5JSFolderLinked = (0, path_1.join)(targetLinkTestFolder, 'md5-linked'); // copy-test/link-test copy/md5-linked
            // Copy with `preserveSymlinks: true` and verify result
            //
            // Windows: this test does not work because creating symlinks
            // requires priviledged permissions (admin).
            if (!platform_1.isWindows) {
                await (0, pfs_1.copy)(sourceLinkTestFolder, targetLinkTestFolder, { preserveSymlinks: true });
                assert.ok(fs.existsSync(targetLinkTestFolder));
                assert.ok(fs.existsSync(targetLinkMD5JSFolder));
                assert.ok(fs.existsSync(targetLinkMD5JSFile));
                assert.ok(fs.existsSync(targetLinkMD5JSFolderLinked));
                assert.ok(fs.lstatSync(targetLinkMD5JSFolderLinked).isSymbolicLink());
                const linkTarget = await fs.promises.readlink(targetLinkMD5JSFolderLinked);
                assert.strictEqual(linkTarget, targetLinkMD5JSFolder);
                await fs.promises.rmdir(targetLinkTestFolder, { recursive: true });
            }
            // Copy with `preserveSymlinks: false` and verify result
            await (0, pfs_1.copy)(sourceLinkTestFolder, targetLinkTestFolder, { preserveSymlinks: false });
            assert.ok(fs.existsSync(targetLinkTestFolder));
            assert.ok(fs.existsSync(targetLinkMD5JSFolder));
            assert.ok(fs.existsSync(targetLinkMD5JSFile));
            assert.ok(fs.existsSync(targetLinkMD5JSFolderLinked));
            assert.ok(fs.lstatSync(targetLinkMD5JSFolderLinked).isDirectory());
        });
        test('readDirsInDir', async () => {
            fs.mkdirSync((0, path_1.join)(testDir, 'somefolder1'));
            fs.mkdirSync((0, path_1.join)(testDir, 'somefolder2'));
            fs.mkdirSync((0, path_1.join)(testDir, 'somefolder3'));
            fs.writeFileSync((0, path_1.join)(testDir, 'somefile.txt'), 'Contents');
            fs.writeFileSync((0, path_1.join)(testDir, 'someOtherFile.txt'), 'Contents');
            const result = await (0, pfs_1.readDirsInDir)(testDir);
            assert.strictEqual(result.length, 3);
            assert.ok(result.indexOf('somefolder1') !== -1);
            assert.ok(result.indexOf('somefolder2') !== -1);
            assert.ok(result.indexOf('somefolder3') !== -1);
        });
        test('stat link', async () => {
            var _a;
            const id1 = (0, uuid_1.generateUuid)();
            const directory = (0, path_1.join)(testDir, id1);
            const id2 = (0, uuid_1.generateUuid)();
            const symbolicLink = (0, path_1.join)(testDir, id2);
            await fs.promises.mkdir(directory, { recursive: true });
            fs.symlinkSync(directory, symbolicLink, 'junction');
            let statAndIsLink = await pfs_1.SymlinkSupport.stat(directory);
            assert.ok(!(statAndIsLink === null || statAndIsLink === void 0 ? void 0 : statAndIsLink.symbolicLink));
            statAndIsLink = await pfs_1.SymlinkSupport.stat(symbolicLink);
            assert.ok(statAndIsLink === null || statAndIsLink === void 0 ? void 0 : statAndIsLink.symbolicLink);
            assert.ok(!((_a = statAndIsLink === null || statAndIsLink === void 0 ? void 0 : statAndIsLink.symbolicLink) === null || _a === void 0 ? void 0 : _a.dangling));
        });
        test('stat link (non existing target)', async () => {
            var _a;
            const id1 = (0, uuid_1.generateUuid)();
            const directory = (0, path_1.join)(testDir, id1);
            const id2 = (0, uuid_1.generateUuid)();
            const symbolicLink = (0, path_1.join)(testDir, id2);
            await fs.promises.mkdir(directory, { recursive: true });
            fs.symlinkSync(directory, symbolicLink, 'junction');
            await (0, pfs_1.rimraf)(directory);
            const statAndIsLink = await pfs_1.SymlinkSupport.stat(symbolicLink);
            assert.ok(statAndIsLink === null || statAndIsLink === void 0 ? void 0 : statAndIsLink.symbolicLink);
            assert.ok((_a = statAndIsLink === null || statAndIsLink === void 0 ? void 0 : statAndIsLink.symbolicLink) === null || _a === void 0 ? void 0 : _a.dangling);
        });
        test('readdir', async () => {
            if (normalization_1.canNormalize && typeof process.versions['electron'] !== 'undefined' /* needs electron */) {
                const id = (0, uuid_1.generateUuid)();
                const newDir = (0, path_1.join)(testDir, 'pfs', id, 'öäü');
                await fs.promises.mkdir(newDir, { recursive: true });
                assert.ok(fs.existsSync(newDir));
                const children = await (0, pfs_1.readdir)((0, path_1.join)(testDir, 'pfs', id));
                assert.strictEqual(children.some(n => n === 'öäü'), true); // Mac always converts to NFD, so
            }
        });
        test('readdir (with file types)', async () => {
            if (normalization_1.canNormalize && typeof process.versions['electron'] !== 'undefined' /* needs electron */) {
                const newDir = (0, path_1.join)(testDir, 'öäü');
                await fs.promises.mkdir(newDir, { recursive: true });
                await (0, pfs_1.writeFile)((0, path_1.join)(testDir, 'somefile.txt'), 'contents');
                assert.ok(fs.existsSync(newDir));
                const children = await (0, pfs_1.readdir)(testDir, { withFileTypes: true });
                assert.strictEqual(children.some(n => n.name === 'öäü'), true); // Mac always converts to NFD, so
                assert.strictEqual(children.some(n => n.isDirectory()), true);
                assert.strictEqual(children.some(n => n.name === 'somefile.txt'), true);
                assert.strictEqual(children.some(n => n.isFile()), true);
            }
        });
        test('writeFile (string)', async () => {
            const smallData = 'Hello World';
            const bigData = (new Array(100 * 1024)).join('Large String\n');
            return testWriteFileAndFlush(smallData, smallData, bigData, bigData);
        });
        test('writeFile (Buffer)', async () => {
            const smallData = 'Hello World';
            const bigData = (new Array(100 * 1024)).join('Large String\n');
            return testWriteFileAndFlush(Buffer.from(smallData), smallData, Buffer.from(bigData), bigData);
        });
        test('writeFile (UInt8Array)', async () => {
            const smallData = 'Hello World';
            const bigData = (new Array(100 * 1024)).join('Large String\n');
            return testWriteFileAndFlush(buffer_1.VSBuffer.fromString(smallData).buffer, smallData, buffer_1.VSBuffer.fromString(bigData).buffer, bigData);
        });
        async function testWriteFileAndFlush(smallData, smallDataValue, bigData, bigDataValue) {
            const testFile = (0, path_1.join)(testDir, 'flushed.txt');
            assert.ok(fs.existsSync(testDir));
            await (0, pfs_1.writeFile)(testFile, smallData);
            assert.strictEqual(fs.readFileSync(testFile).toString(), smallDataValue);
            await (0, pfs_1.writeFile)(testFile, bigData);
            assert.strictEqual(fs.readFileSync(testFile).toString(), bigDataValue);
        }
        test('writeFile (string, error handling)', async () => {
            const testFile = (0, path_1.join)(testDir, 'flushed.txt');
            fs.mkdirSync(testFile); // this will trigger an error later because testFile is now a directory!
            let expectedError;
            try {
                await (0, pfs_1.writeFile)(testFile, 'Hello World');
            }
            catch (error) {
                expectedError = error;
            }
            assert.ok(expectedError);
        });
        test('writeFileSync', async () => {
            const testFile = (0, path_1.join)(testDir, 'flushed.txt');
            (0, pfs_1.writeFileSync)(testFile, 'Hello World');
            assert.strictEqual(fs.readFileSync(testFile).toString(), 'Hello World');
            const largeString = (new Array(100 * 1024)).join('Large String\n');
            (0, pfs_1.writeFileSync)(testFile, largeString);
            assert.strictEqual(fs.readFileSync(testFile).toString(), largeString);
        });
    });
});
//# sourceMappingURL=pfs.test.js.map