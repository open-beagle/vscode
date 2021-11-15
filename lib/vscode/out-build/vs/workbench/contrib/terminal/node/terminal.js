/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/base/common/platform", "vs/base/node/pfs", "vs/workbench/contrib/terminal/common/terminal"], function (require, exports, fs, platform_1, pfs_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.linuxDistro = void 0;
    let detectedDistro = terminal_1.LinuxDistro.Unknown;
    if (platform_1.isLinux) {
        const file = '/etc/os-release';
        pfs_1.SymlinkSupport.existsFile(file).then(async (exists) => {
            if (!exists) {
                return;
            }
            const buffer = await fs.promises.readFile(file);
            const contents = buffer.toString();
            if (/NAME="?Fedora"?/.test(contents)) {
                detectedDistro = terminal_1.LinuxDistro.Fedora;
            }
            else if (/NAME="?Ubuntu"?/.test(contents)) {
                detectedDistro = terminal_1.LinuxDistro.Ubuntu;
            }
        });
    }
    exports.linuxDistro = detectedDistro;
});
//# sourceMappingURL=terminal.js.map