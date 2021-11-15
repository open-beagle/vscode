/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/process", "vs/base/common/types", "vs/base/common/objects", "vs/base/common/platform", "vs/base/common/labels", "vs/nls!vs/workbench/services/configurationResolver/common/variableResolver"], function (require, exports, paths, process, types, objects, platform_1, labels_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractVariableResolverService = void 0;
    class AbstractVariableResolverService {
        constructor(_context, _labelService, _envVariablesPromise) {
            this._contributedVariables = new Map();
            this._context = _context;
            this._labelService = _labelService;
            if (_envVariablesPromise) {
                this._envVariablesPromise = _envVariablesPromise.then(envVariables => {
                    return this.prepareEnv(envVariables);
                });
            }
        }
        prepareEnv(envVariables) {
            // windows env variables are case insensitive
            if (platform_1.isWindows) {
                const ev = Object.create(null);
                Object.keys(envVariables).forEach(key => {
                    ev[key.toLowerCase()] = envVariables[key];
                });
                return ev;
            }
            return envVariables;
        }
        resolveWithEnvironment(environment, root, value) {
            return this.recursiveResolve(this.prepareEnv(environment), root ? root.uri : undefined, value);
        }
        async resolveAsync(root, value) {
            return this.recursiveResolve(await this._envVariablesPromise, root ? root.uri : undefined, value);
        }
        async resolveAnyBase(workspaceFolder, config, commandValueMapping, resolvedVariables) {
            const result = objects.deepClone(config);
            // hoist platform specific attributes to top level
            if (platform_1.isWindows && result.windows) {
                Object.keys(result.windows).forEach(key => result[key] = result.windows[key]);
            }
            else if (platform_1.isMacintosh && result.osx) {
                Object.keys(result.osx).forEach(key => result[key] = result.osx[key]);
            }
            else if (platform_1.isLinux && result.linux) {
                Object.keys(result.linux).forEach(key => result[key] = result.linux[key]);
            }
            // delete all platform specific sections
            delete result.windows;
            delete result.osx;
            delete result.linux;
            // substitute all variables recursively in string values
            return this.recursiveResolve(await this._envVariablesPromise, workspaceFolder ? workspaceFolder.uri : undefined, result, commandValueMapping, resolvedVariables);
        }
        async resolveAnyAsync(workspaceFolder, config, commandValueMapping) {
            return this.resolveAnyBase(workspaceFolder, config, commandValueMapping);
        }
        async resolveAnyMap(workspaceFolder, config, commandValueMapping) {
            const resolvedVariables = new Map();
            const newConfig = await this.resolveAnyBase(workspaceFolder, config, commandValueMapping, resolvedVariables);
            return { newConfig, resolvedVariables };
        }
        resolveWithInteractionReplace(folder, config, section, variables) {
            throw new Error('resolveWithInteractionReplace not implemented.');
        }
        resolveWithInteraction(folder, config, section, variables) {
            throw new Error('resolveWithInteraction not implemented.');
        }
        contributeVariable(variable, resolution) {
            if (this._contributedVariables.has(variable)) {
                throw new Error('Variable ' + variable + ' is contributed twice.');
            }
            else {
                this._contributedVariables.set(variable, resolution);
            }
        }
        recursiveResolve(environment, folderUri, value, commandValueMapping, resolvedVariables) {
            if (types.isString(value)) {
                return this.resolveString(environment, folderUri, value, commandValueMapping, resolvedVariables);
            }
            else if (types.isArray(value)) {
                return value.map(s => this.recursiveResolve(environment, folderUri, s, commandValueMapping, resolvedVariables));
            }
            else if (types.isObject(value)) {
                let result = Object.create(null);
                Object.keys(value).forEach(key => {
                    const replaced = this.resolveString(environment, folderUri, key, commandValueMapping, resolvedVariables);
                    result[replaced] = this.recursiveResolve(environment, folderUri, value[key], commandValueMapping, resolvedVariables);
                });
                return result;
            }
            return value;
        }
        resolveString(environment, folderUri, value, commandValueMapping, resolvedVariables) {
            // loop through all variables occurrences in 'value'
            const replaced = value.replace(AbstractVariableResolverService.VARIABLE_REGEXP, (match, variable) => {
                // disallow attempted nesting, see #77289
                if (variable.includes(AbstractVariableResolverService.VARIABLE_LHS)) {
                    return match;
                }
                let resolvedValue = this.evaluateSingleVariable(environment, match, variable, folderUri, commandValueMapping);
                if (resolvedVariables) {
                    resolvedVariables.set(variable, resolvedValue);
                }
                return resolvedValue;
            });
            return replaced;
        }
        fsPath(displayUri) {
            return this._labelService ? this._labelService.getUriLabel(displayUri, { noPrefix: true }) : displayUri.fsPath;
        }
        evaluateSingleVariable(environment, match, variable, folderUri, commandValueMapping) {
            // try to separate variable arguments from variable name
            let argument;
            const parts = variable.split(':');
            if (parts.length > 1) {
                variable = parts[0];
                argument = parts[1];
            }
            // common error handling for all variables that require an open editor
            const getFilePath = () => {
                const filePath = this._context.getFilePath();
                if (filePath) {
                    return filePath;
                }
                throw new Error((0, nls_1.localize)(0, null, match));
            };
            // common error handling for all variables that require an open editor
            const getFolderPathForFile = () => {
                const filePath = getFilePath(); // throws error if no editor open
                if (this._context.getWorkspaceFolderPathForFile) {
                    const folderPath = this._context.getWorkspaceFolderPathForFile();
                    if (folderPath) {
                        return folderPath;
                    }
                }
                throw new Error((0, nls_1.localize)(1, null, match, paths.basename(filePath)));
            };
            // common error handling for all variables that require an open folder and accept a folder name argument
            const getFolderUri = () => {
                if (argument) {
                    const folder = this._context.getFolderUri(argument);
                    if (folder) {
                        return folder;
                    }
                    throw new Error((0, nls_1.localize)(2, null, match, argument));
                }
                if (folderUri) {
                    return folderUri;
                }
                if (this._context.getWorkspaceFolderCount() > 1) {
                    throw new Error((0, nls_1.localize)(3, null, match));
                }
                throw new Error((0, nls_1.localize)(4, null, match));
            };
            switch (variable) {
                case 'env':
                    if (argument) {
                        if (environment) {
                            // Depending on the source of the environment, on Windows, the values may all be lowercase.
                            const env = environment[platform_1.isWindows ? argument.toLowerCase() : argument];
                            if (types.isString(env)) {
                                return env;
                            }
                        }
                        // For `env` we should do the same as a normal shell does - evaluates undefined envs to an empty string #46436
                        return '';
                    }
                    throw new Error((0, nls_1.localize)(5, null, match));
                case 'config':
                    if (argument) {
                        const config = this._context.getConfigurationValue(folderUri, argument);
                        if (types.isUndefinedOrNull(config)) {
                            throw new Error((0, nls_1.localize)(6, null, match, argument));
                        }
                        if (types.isObject(config)) {
                            throw new Error((0, nls_1.localize)(7, null, match, argument));
                        }
                        return config;
                    }
                    throw new Error((0, nls_1.localize)(8, null, match));
                case 'command':
                    return this.resolveFromMap(match, argument, commandValueMapping, 'command');
                case 'input':
                    return this.resolveFromMap(match, argument, commandValueMapping, 'input');
                default: {
                    switch (variable) {
                        case 'workspaceRoot':
                        case 'workspaceFolder':
                            return (0, labels_1.normalizeDriveLetter)(this.fsPath(getFolderUri()));
                        case 'cwd':
                            return ((folderUri || argument) ? (0, labels_1.normalizeDriveLetter)(this.fsPath(getFolderUri())) : process.cwd());
                        case 'workspaceRootFolderName':
                        case 'workspaceFolderBasename':
                            return paths.basename(this.fsPath(getFolderUri()));
                        case 'lineNumber':
                            const lineNumber = this._context.getLineNumber();
                            if (lineNumber) {
                                return lineNumber;
                            }
                            throw new Error((0, nls_1.localize)(9, null, match));
                        case 'selectedText':
                            const selectedText = this._context.getSelectedText();
                            if (selectedText) {
                                return selectedText;
                            }
                            throw new Error((0, nls_1.localize)(10, null, match));
                        case 'file':
                            return getFilePath();
                        case 'fileWorkspaceFolder':
                            return getFolderPathForFile();
                        case 'relativeFile':
                            if (folderUri || argument) {
                                return paths.relative(this.fsPath(getFolderUri()), getFilePath());
                            }
                            return getFilePath();
                        case 'relativeFileDirname':
                            const dirname = paths.dirname(getFilePath());
                            if (folderUri || argument) {
                                const relative = paths.relative(this.fsPath(getFolderUri()), dirname);
                                return relative.length === 0 ? '.' : relative;
                            }
                            return dirname;
                        case 'fileDirname':
                            return paths.dirname(getFilePath());
                        case 'fileExtname':
                            return paths.extname(getFilePath());
                        case 'fileBasename':
                            return paths.basename(getFilePath());
                        case 'fileBasenameNoExtension':
                            const basename = paths.basename(getFilePath());
                            return (basename.slice(0, basename.length - paths.extname(basename).length));
                        case 'fileDirnameBasename':
                            return paths.basename(paths.dirname(getFilePath()));
                        case 'execPath':
                            const ep = this._context.getExecPath();
                            if (ep) {
                                return ep;
                            }
                            return match;
                        case 'execInstallFolder':
                            const ar = this._context.getAppRoot();
                            if (ar) {
                                return ar;
                            }
                            return match;
                        case 'pathSeparator':
                            return paths.sep;
                        default:
                            try {
                                const key = argument ? `${variable}:${argument}` : variable;
                                return this.resolveFromMap(match, key, commandValueMapping, undefined);
                            }
                            catch (error) {
                                return match;
                            }
                    }
                }
            }
        }
        resolveFromMap(match, argument, commandValueMapping, prefix) {
            if (argument && commandValueMapping) {
                const v = (prefix === undefined) ? commandValueMapping[argument] : commandValueMapping[prefix + ':' + argument];
                if (typeof v === 'string') {
                    return v;
                }
                throw new Error((0, nls_1.localize)(11, null, match));
            }
            return match;
        }
    }
    exports.AbstractVariableResolverService = AbstractVariableResolverService;
    AbstractVariableResolverService.VARIABLE_LHS = '${';
    AbstractVariableResolverService.VARIABLE_REGEXP = /\$\{(.*?)\}/g;
});
//# sourceMappingURL=variableResolver.js.map