/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/uri", "vs/base/common/uuid"], function (require, exports, path_1, uri_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flakySuite = exports.getPathFromAmdModule = exports.getRandomTestPath = void 0;
    function getRandomTestPath(tmpdir, ...segments) {
        return (0, path_1.join)(tmpdir, ...segments, (0, uuid_1.generateUuid)());
    }
    exports.getRandomTestPath = getRandomTestPath;
    function getPathFromAmdModule(requirefn, relativePath) {
        return uri_1.URI.parse(requirefn.toUrl(relativePath)).fsPath;
    }
    exports.getPathFromAmdModule = getPathFromAmdModule;
    function flakySuite(title, fn) {
        return suite(title, function () {
            // Flaky suites need retries and timeout to complete
            // e.g. because they access the file system which can
            // be unreliable depending on the environment.
            this.retries(3);
            this.timeout(1000 * 20);
            // Invoke suite ensuring that `this` is
            // properly wired in.
            fn.call(this);
        });
    }
    exports.flakySuite = flakySuite;
});
//# sourceMappingURL=testUtils.js.map