/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/uri", "vs/base/common/platform"], function (require, exports, path_1, uri_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertThrowsAsync = exports.testRepeat = exports.suiteRepeat = exports.toResource = void 0;
    function toResource(path) {
        if (platform_1.isWindows) {
            return uri_1.URI.file((0, path_1.join)('C:\\', btoa(this.test.fullTitle()), path));
        }
        return uri_1.URI.file((0, path_1.join)('/', btoa(this.test.fullTitle()), path));
    }
    exports.toResource = toResource;
    function suiteRepeat(n, description, callback) {
        for (let i = 0; i < n; i++) {
            suite(`${description} (iteration ${i})`, callback);
        }
    }
    exports.suiteRepeat = suiteRepeat;
    function testRepeat(n, description, callback) {
        for (let i = 0; i < n; i++) {
            test(`${description} (iteration ${i})`, callback);
        }
    }
    exports.testRepeat = testRepeat;
    async function assertThrowsAsync(block, message = 'Missing expected exception') {
        try {
            await block();
        }
        catch (_a) {
            return;
        }
        const err = message instanceof Error ? message : new Error(message);
        throw err;
    }
    exports.assertThrowsAsync = assertThrowsAsync;
});
//# sourceMappingURL=utils.js.map