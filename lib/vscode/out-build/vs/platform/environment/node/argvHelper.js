/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/nls!vs/platform/environment/node/argvHelper", "vs/platform/files/common/files", "vs/platform/environment/node/argv"], function (require, exports, assert, nls_1, files_1, argv_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isLaunchedFromCli = exports.addArg = exports.parseCLIProcessArgv = exports.parseMainProcessArgv = void 0;
    function parseAndValidate(cmdLineArgs, reportWarnings) {
        const errorReporter = {
            onUnknownOption: (id) => {
                console.warn((0, nls_1.localize)(0, null, id));
            },
            onMultipleValues: (id, val) => {
                console.warn((0, nls_1.localize)(1, null, id, val));
            }
        };
        const args = (0, argv_1.parseArgs)(cmdLineArgs, argv_1.OPTIONS, reportWarnings ? errorReporter : undefined);
        if (args.goto) {
            args._.forEach(arg => assert(/^(\w:)?[^:]+(:\d*){0,2}$/.test(arg), (0, nls_1.localize)(2, null)));
        }
        if (args['max-memory']) {
            assert(parseInt(args['max-memory']) >= files_1.MIN_MAX_MEMORY_SIZE_MB, `The max-memory argument cannot be specified lower than ${files_1.MIN_MAX_MEMORY_SIZE_MB} MB.`);
        }
        return args;
    }
    function stripAppPath(argv) {
        const index = argv.findIndex(a => !/^-/.test(a));
        if (index > -1) {
            return [...argv.slice(0, index), ...argv.slice(index + 1)];
        }
        return undefined;
    }
    /**
     * Use this to parse raw code process.argv such as: `Electron . --verbose --wait`
     */
    function parseMainProcessArgv(processArgv) {
        let [, ...args] = processArgv;
        // If dev, remove the first non-option argument: it's the app location
        if (process.env['VSCODE_DEV']) {
            args = stripAppPath(args) || [];
        }
        // If called from CLI, don't report warnings as they are already reported.
        const reportWarnings = !isLaunchedFromCli(process.env);
        return parseAndValidate(args, reportWarnings);
    }
    exports.parseMainProcessArgv = parseMainProcessArgv;
    /**
     * Use this to parse raw code CLI process.argv such as: `Electron cli.js . --verbose --wait`
     */
    function parseCLIProcessArgv(processArgv) {
        const [, , ...args] = processArgv; // remove the first non-option argument: it's always the app location
        return parseAndValidate(args, true);
    }
    exports.parseCLIProcessArgv = parseCLIProcessArgv;
    function addArg(argv, ...args) {
        const endOfArgsMarkerIndex = argv.indexOf('--');
        if (endOfArgsMarkerIndex === -1) {
            argv.push(...args);
        }
        else {
            // if the we have an argument "--" (end of argument marker)
            // we cannot add arguments at the end. rather, we add
            // arguments before the "--" marker.
            argv.splice(endOfArgsMarkerIndex, 0, ...args);
        }
        return argv;
    }
    exports.addArg = addArg;
    function isLaunchedFromCli(env) {
        return env['VSCODE_CLI'] === '1';
    }
    exports.isLaunchedFromCli = isLaunchedFromCli;
});
//# sourceMappingURL=argvHelper.js.map