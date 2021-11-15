/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/path", "vs/base/common/process", "vs/base/node/pfs", "vs/base/common/types", "vs/base/common/objects", "vs/base/common/platform"], function (require, exports, os, path, process, pfs, types_1, objects_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.findExecutable = exports.getWindowsBuildNumber = void 0;
    function getWindowsBuildNumber() {
        const osVersion = (/(\d+)\.(\d+)\.(\d+)/g).exec(os.release());
        let buildNumber = 0;
        if (osVersion && osVersion.length === 4) {
            buildNumber = parseInt(osVersion[3]);
        }
        return buildNumber;
    }
    exports.getWindowsBuildNumber = getWindowsBuildNumber;
    async function findExecutable(command, cwd, paths, env = process.env, exists = pfs.exists) {
        // If we have an absolute path then we take it.
        if (path.isAbsolute(command)) {
            return await exists(command) ? command : undefined;
        }
        if (cwd === undefined) {
            cwd = process.cwd();
        }
        const dir = path.dirname(command);
        if (dir !== '.') {
            // We have a directory and the directory is relative (see above). Make the path absolute
            // to the current working directory.
            const fullPath = path.join(cwd, command);
            return await exists(fullPath) ? fullPath : undefined;
        }
        const envPath = (0, objects_1.getCaseInsensitive)(env, 'PATH');
        if (paths === undefined && (0, types_1.isString)(envPath)) {
            paths = envPath.split(path.delimiter);
        }
        // No PATH environment. Make path absolute to the cwd.
        if (paths === undefined || paths.length === 0) {
            const fullPath = path.join(cwd, command);
            return await exists(fullPath) ? fullPath : undefined;
        }
        // We have a simple file name. We get the path variable from the env
        // and try to find the executable on the path.
        for (let pathEntry of paths) {
            // The path entry is absolute.
            let fullPath;
            if (path.isAbsolute(pathEntry)) {
                fullPath = path.join(pathEntry, command);
            }
            else {
                fullPath = path.join(cwd, pathEntry, command);
            }
            if (await exists(fullPath)) {
                return fullPath;
            }
            if (platform_1.isWindows) {
                let withExtension = fullPath + '.com';
                if (await exists(withExtension)) {
                    return withExtension;
                }
                withExtension = fullPath + '.exe';
                if (await exists(withExtension)) {
                    return withExtension;
                }
            }
        }
        const fullPath = path.join(cwd, command);
        return await exists(fullPath) ? fullPath : undefined;
    }
    exports.findExecutable = findExecutable;
});
//# sourceMappingURL=terminalEnvironment.js.map