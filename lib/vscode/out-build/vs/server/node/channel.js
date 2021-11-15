define(["require", "exports", "@coder/logger", "os", "path", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/uriIpc", "vs/platform/extensions/common/extensions", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/product/common/product", "vs/server/node/nls", "vs/server/node/util", "vs/workbench/contrib/terminal/common/environmentVariableCollection", "vs/workbench/contrib/terminal/common/environmentVariableShared", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/workbench/contrib/terminal/node/terminalEnvironment", "vs/workbench/services/configurationResolver/common/variableResolver", "vs/workbench/services/extensions/node/extensionPoints"], function (require, exports, logger_1, os, path, buffer_1, cancellation_1, event_1, platform, resources, uri_1, uriIpc_1, extensions_1, diskFileSystemProvider_1, product_1, nls_1, util_1, environmentVariableCollection_1, environmentVariableShared_1, terminalEnvironment, terminalEnvironment_1, variableResolver_1, extensionPoints_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalProviderChannel = exports.ExtensionEnvironmentChannel = exports.FileProviderChannel = void 0;
    /**
     * Extend the file provider to allow unwatching.
     */
    class Watcher extends diskFileSystemProvider_1.DiskFileSystemProvider {
        constructor() {
            super(...arguments);
            this.watches = new Map();
        }
        dispose() {
            this.watches.forEach((w) => w.dispose());
            this.watches.clear();
            super.dispose();
        }
        _watch(req, resource, opts) {
            this.watches.set(req, this.watch(resource, opts));
        }
        unwatch(req) {
            this.watches.get(req).dispose();
            this.watches.delete(req);
        }
    }
    class FileProviderChannel {
        constructor(environmentService, logService) {
            this.environmentService = environmentService;
            this.logService = logService;
            this.watchers = new Map();
            this.provider = new diskFileSystemProvider_1.DiskFileSystemProvider(this.logService);
        }
        listen(context, event, args) {
            switch (event) {
                case 'filechange': return this.filechange(context, args[0]);
                case 'readFileStream': return this.readFileStream(args[0], args[1]);
            }
            throw new Error(`Invalid listen '${event}'`);
        }
        filechange(context, session) {
            const emitter = new event_1.Emitter({
                onFirstListenerAdd: () => {
                    const provider = new Watcher(this.logService);
                    this.watchers.set(session, provider);
                    const transformer = (0, util_1.getUriTransformer)(context.remoteAuthority);
                    provider.onDidChangeFile((events) => {
                        emitter.fire(events.map((event) => (Object.assign(Object.assign({}, event), { resource: transformer.transformOutgoing(event.resource) }))));
                    });
                    provider.onDidErrorOccur((event) => this.logService.error(event));
                },
                onLastListenerRemove: () => {
                    this.watchers.get(session).dispose();
                    this.watchers.delete(session);
                },
            });
            return emitter.event;
        }
        readFileStream(resource, opts) {
            const cts = new cancellation_1.CancellationTokenSource();
            const fileStream = this.provider.readFileStream(this.transform(resource), opts, cts.token);
            const emitter = new event_1.Emitter({
                onFirstListenerAdd: () => {
                    fileStream.on('data', (data) => emitter.fire(buffer_1.VSBuffer.wrap(data)));
                    fileStream.on('error', (error) => emitter.fire(error));
                    fileStream.on('end', () => emitter.fire('end'));
                },
                onLastListenerRemove: () => cts.cancel(),
            });
            return emitter.event;
        }
        call(_, command, args) {
            switch (command) {
                case 'stat': return this.stat(args[0]);
                case 'open': return this.open(args[0], args[1]);
                case 'close': return this.close(args[0]);
                case 'read': return this.read(args[0], args[1], args[2]);
                case 'readFile': return this.readFile(args[0]);
                case 'write': return this.write(args[0], args[1], args[2], args[3], args[4]);
                case 'writeFile': return this.writeFile(args[0], args[1], args[2]);
                case 'delete': return this.delete(args[0], args[1]);
                case 'mkdir': return this.mkdir(args[0]);
                case 'readdir': return this.readdir(args[0]);
                case 'rename': return this.rename(args[0], args[1], args[2]);
                case 'copy': return this.copy(args[0], args[1], args[2]);
                case 'watch': return this.watch(args[0], args[1], args[2], args[3]);
                case 'unwatch': return this.unwatch(args[0], args[1]);
            }
            throw new Error(`Invalid call '${command}'`);
        }
        dispose() {
            this.watchers.forEach((w) => w.dispose());
            this.watchers.clear();
        }
        async stat(resource) {
            return this.provider.stat(this.transform(resource));
        }
        async open(resource, opts) {
            return this.provider.open(this.transform(resource), opts);
        }
        async close(fd) {
            return this.provider.close(fd);
        }
        async read(fd, pos, length) {
            const buffer = buffer_1.VSBuffer.alloc(length);
            const bytesRead = await this.provider.read(fd, pos, buffer.buffer, 0, length);
            return [buffer, bytesRead];
        }
        async readFile(resource) {
            return buffer_1.VSBuffer.wrap(await this.provider.readFile(this.transform(resource)));
        }
        write(fd, pos, buffer, offset, length) {
            return this.provider.write(fd, pos, buffer.buffer, offset, length);
        }
        writeFile(resource, buffer, opts) {
            return this.provider.writeFile(this.transform(resource), buffer.buffer, opts);
        }
        async delete(resource, opts) {
            return this.provider.delete(this.transform(resource), opts);
        }
        async mkdir(resource) {
            return this.provider.mkdir(this.transform(resource));
        }
        async readdir(resource) {
            return this.provider.readdir(this.transform(resource));
        }
        async rename(resource, target, opts) {
            return this.provider.rename(this.transform(resource), uri_1.URI.from(target), opts);
        }
        copy(resource, target, opts) {
            return this.provider.copy(this.transform(resource), uri_1.URI.from(target), opts);
        }
        async watch(session, req, resource, opts) {
            this.watchers.get(session)._watch(req, this.transform(resource), opts);
        }
        async unwatch(session, req) {
            this.watchers.get(session).unwatch(req);
        }
        transform(resource) {
            // Used for walkthrough content.
            if (/^\/static[^/]*\//.test(resource.path)) {
                return uri_1.URI.file(this.environmentService.appRoot + resource.path.replace(/^\/static[^/]*\//, '/'));
                // Used by the webview service worker to load resources.
            }
            else if (resource.path === '/vscode-resource' && resource.query) {
                try {
                    const query = JSON.parse(resource.query);
                    if (query.requestResourcePath) {
                        return uri_1.URI.file(query.requestResourcePath);
                    }
                }
                catch (error) { /* Carry on. */ }
            }
            return uri_1.URI.from(resource);
        }
    }
    exports.FileProviderChannel = FileProviderChannel;
    // See ../../workbench/services/remote/common/remoteAgentEnvironmentChannel.ts
    class ExtensionEnvironmentChannel {
        constructor(environment, log, telemetry, connectionToken) {
            this.environment = environment;
            this.log = log;
            this.telemetry = telemetry;
            this.connectionToken = connectionToken;
        }
        listen(_, event) {
            throw new Error(`Invalid listen '${event}'`);
        }
        async call(context, command, args) {
            switch (command) {
                case 'getEnvironmentData':
                    return (0, uriIpc_1.transformOutgoingURIs)(await this.getEnvironmentData(), (0, util_1.getUriTransformer)(context.remoteAuthority));
                case 'scanExtensions':
                    return (0, uriIpc_1.transformOutgoingURIs)(await this.scanExtensions(args.language), (0, util_1.getUriTransformer)(context.remoteAuthority));
                case 'getDiagnosticInfo': return this.getDiagnosticInfo();
                case 'disableTelemetry': return this.disableTelemetry();
                case 'logTelemetry': return this.logTelemetry(args[0], args[1]);
                case 'flushTelemetry': return this.flushTelemetry();
            }
            throw new Error(`Invalid call '${command}'`);
        }
        async getEnvironmentData() {
            return {
                pid: process.pid,
                connectionToken: this.connectionToken,
                appRoot: uri_1.URI.file(this.environment.appRoot),
                settingsPath: this.environment.settingsResource,
                logsPath: uri_1.URI.file(this.environment.logsPath),
                extensionsPath: uri_1.URI.file(this.environment.extensionsPath),
                extensionHostLogsPath: uri_1.URI.file(path.join(this.environment.logsPath, 'extension-host')),
                globalStorageHome: this.environment.globalStorageHome,
                workspaceStorageHome: this.environment.workspaceStorageHome,
                userHome: this.environment.userHome,
                useHostProxy: false,
                os: platform.OS,
                marks: []
            };
        }
        async scanExtensions(language) {
            const translations = await (0, nls_1.getTranslations)(language, this.environment.userDataPath);
            const scanMultiple = (isBuiltin, isUnderDevelopment, paths) => {
                return Promise.all(paths.map((path) => {
                    return extensionPoints_1.ExtensionScanner.scanExtensions(new extensionPoints_1.ExtensionScannerInput(product_1.default.version, product_1.default.commit, language, !!process.env.VSCODE_DEV, path, isBuiltin, isUnderDevelopment, translations), this.log);
                }));
            };
            const scanBuiltin = async () => {
                return scanMultiple(true, false, [this.environment.builtinExtensionsPath, ...this.environment.extraBuiltinExtensionPaths]);
            };
            const scanInstalled = async () => {
                return scanMultiple(false, true, [this.environment.extensionsPath, ...this.environment.extraExtensionPaths]);
            };
            return Promise.all([scanBuiltin(), scanInstalled()]).then((allExtensions) => {
                const uniqueExtensions = new Map();
                allExtensions.forEach((multipleExtensions) => {
                    multipleExtensions.forEach((extensions) => {
                        extensions.forEach((extension) => {
                            const id = extensions_1.ExtensionIdentifier.toKey(extension.identifier);
                            if (uniqueExtensions.has(id)) {
                                const oldPath = uniqueExtensions.get(id).extensionLocation.fsPath;
                                const newPath = extension.extensionLocation.fsPath;
                                this.log.warn(`${oldPath} has been overridden ${newPath}`);
                            }
                            uniqueExtensions.set(id, extension);
                        });
                    });
                });
                return Array.from(uniqueExtensions.values());
            });
        }
        getDiagnosticInfo() {
            throw new Error('not implemented');
        }
        async disableTelemetry() {
            this.telemetry.setEnabled(false);
        }
        async logTelemetry(eventName, data) {
            this.telemetry.publicLog(eventName, data);
        }
        async flushTelemetry() {
            // We always send immediately at the moment.
        }
    }
    exports.ExtensionEnvironmentChannel = ExtensionEnvironmentChannel;
    // Reference: - ../../workbench/api/common/extHostDebugService.ts
    class VariableResolverService extends variableResolver_1.AbstractVariableResolverService {
        constructor(remoteAuthority, args, env) {
            super({
                getFolderUri: (name) => {
                    const folder = args.workspaceFolders.find((f) => f.name === name);
                    return folder && uri_1.URI.revive(folder.uri);
                },
                getWorkspaceFolderCount: () => {
                    return args.workspaceFolders.length;
                },
                // In ../../workbench/contrib/terminal/common/remoteTerminalChannel.ts it
                // looks like there are `config:` entries which must be for this? Not sure
                // how/if the URI comes into play though.
                getConfigurationValue: (_, section) => {
                    return args.resolvedVariables[`config:${section}`];
                },
                getAppRoot: () => {
                    return (args.resolverEnv && args.resolverEnv['VSCODE_CWD']) || env['VSCODE_CWD'] || process.cwd();
                },
                getExecPath: () => {
                    // Assuming that resolverEnv is just for use in the resolver and not for
                    // the terminal itself.
                    return (args.resolverEnv && args.resolverEnv['VSCODE_EXEC_PATH']) || env['VSCODE_EXEC_PATH'];
                },
                // This is just a guess; this is the only file-related thing we're sent
                // and none of these resolver methods seem to get called so I don't know
                // how to test.
                getFilePath: () => {
                    const resource = transformIncoming(remoteAuthority, args.activeFileResource);
                    if (!resource) {
                        return undefined;
                    }
                    // See ../../editor/standalone/browser/simpleServices.ts;
                    // `BaseConfigurationResolverService` calls `getUriLabel` from there.
                    if (resource.scheme === 'file') {
                        return resource.fsPath;
                    }
                    return resource.path;
                },
                // It looks like these are set here although they aren't on the types:
                // ../../workbench/contrib/terminal/common/remoteTerminalChannel.ts
                getSelectedText: () => {
                    return args.resolvedVariables.selectedText;
                },
                getLineNumber: () => {
                    return args.resolvedVariables.selectedText;
                },
            }, undefined, Promise.resolve(env));
        }
    }
    class TerminalProviderChannel {
        constructor(logService, ptyService) {
            this.logService = logService;
            this.ptyService = ptyService;
        }
        listen(_, event, args) {
            logger_1.logger.trace('TerminalProviderChannel:listen', (0, logger_1.field)('event', event), (0, logger_1.field)('args', args));
            switch (event) {
                case '$onPtyHostExitEvent': return this.ptyService.onPtyHostExit || event_1.Event.None;
                case '$onPtyHostStartEvent': return this.ptyService.onPtyHostStart || event_1.Event.None;
                case '$onPtyHostUnresponsiveEvent': return this.ptyService.onPtyHostUnresponsive || event_1.Event.None;
                case '$onPtyHostResponsiveEvent': return this.ptyService.onPtyHostResponsive || event_1.Event.None;
                case '$onProcessDataEvent': return this.ptyService.onProcessData;
                case '$onProcessExitEvent': return this.ptyService.onProcessExit;
                case '$onProcessReadyEvent': return this.ptyService.onProcessReady;
                case '$onProcessReplayEvent': return this.ptyService.onProcessReplay;
                case '$onProcessTitleChangedEvent': return this.ptyService.onProcessTitleChanged;
                case '$onProcessShellTypeChangedEvent': return this.ptyService.onProcessShellTypeChanged;
                case '$onProcessOverrideDimensionsEvent': return this.ptyService.onProcessOverrideDimensions;
                case '$onProcessResolvedShellLaunchConfigEvent': return this.ptyService.onProcessResolvedShellLaunchConfig;
                case '$onProcessOrphanQuestion': return this.ptyService.onProcessOrphanQuestion;
                // NOTE@asher: I think this must have something to do with running
                // commands on the terminal that will do things in VS Code but we
                // already have that functionality via a socket so I'm not sure what
                // this is for.
                case '$onExecuteCommand': return event_1.Event.None;
            }
            throw new Error(`Invalid listen '${event}'`);
        }
        call(context, command, args) {
            logger_1.logger.trace('TerminalProviderChannel:call', (0, logger_1.field)('command', command), (0, logger_1.field)('args', args));
            switch (command) {
                case '$restartPtyHost': return this.restartPtyHost();
                case '$createProcess': return this.createProcess(context.remoteAuthority, args);
                case '$attachToProcess': return this.ptyService.attachToProcess(args[0]);
                case '$start': return this.ptyService.start(args[0]);
                case '$input': return this.ptyService.input(args[0], args[1]);
                case '$acknowledgeDataEvent': return this.ptyService.acknowledgeDataEvent(args[0], args[1]);
                case '$shutdown': return this.ptyService.shutdown(args[0], args[1]);
                case '$resize': return this.ptyService.resize(args[0], args[1], args[2]);
                case '$getInitialCwd': return this.ptyService.getInitialCwd(args[0]);
                case '$getCwd': return this.ptyService.getCwd(args[0]);
                case '$sendCommandResult': return this.sendCommandResult(args[0], args[1], args[2], args[3]);
                case '$orphanQuestionReply': return this.ptyService.orphanQuestionReply(args[0]);
                case '$listProcesses': return this.ptyService.listProcesses();
                case '$setTerminalLayoutInfo': return this.ptyService.setTerminalLayoutInfo(args);
                case '$getTerminalLayoutInfo': return this.ptyService.getTerminalLayoutInfo(args);
                case '$getShellEnvironment': return this.ptyService.getShellEnvironment();
                case '$getDefaultSystemShell': return this.ptyService.getDefaultSystemShell(args[0]);
                case '$reduceConnectionGraceTime': return this.ptyService.reduceConnectionGraceTime();
            }
            throw new Error(`Invalid call '${command}'`);
        }
        async dispose() {
            // Nothing at the moment.
        }
        async restartPtyHost() {
            if (this.ptyService.restartPtyHost) {
                return this.ptyService.restartPtyHost();
            }
        }
        // References: - ../../workbench/api/node/extHostTerminalService.ts
        //             - ../../workbench/contrib/terminal/browser/terminalProcessManager.ts
        async createProcess(remoteAuthority, args) {
            var _a;
            const shellLaunchConfig = {
                name: args.shellLaunchConfig.name,
                executable: args.shellLaunchConfig.executable,
                args: args.shellLaunchConfig.args,
                // TODO: Should we transform if it's a string as well? The incoming
                // transform only takes `UriComponents` so I suspect it's not necessary.
                cwd: typeof args.shellLaunchConfig.cwd !== 'string'
                    ? transformIncoming(remoteAuthority, args.shellLaunchConfig.cwd)
                    : args.shellLaunchConfig.cwd,
                env: args.shellLaunchConfig.env,
            };
            const activeWorkspaceUri = transformIncoming(remoteAuthority, (_a = args.activeWorkspaceFolder) === null || _a === void 0 ? void 0 : _a.uri);
            const activeWorkspace = activeWorkspaceUri && args.activeWorkspaceFolder ? Object.assign(Object.assign({}, args.activeWorkspaceFolder), { uri: activeWorkspaceUri, toResource: (relativePath) => resources.joinPath(activeWorkspaceUri, relativePath) }) : undefined;
            const resolverService = new VariableResolverService(remoteAuthority, args, process.env);
            const resolver = terminalEnvironment.createVariableResolver(activeWorkspace, process.env, resolverService);
            shellLaunchConfig.cwd = terminalEnvironment.getCwd(shellLaunchConfig, os.homedir(), resolver, activeWorkspaceUri, args.configuration['terminal.integrated.cwd'], this.logService);
            // Use instead of `terminal.integrated.env.${platform}` to make types work.
            const getEnvFromConfig = () => {
                if (platform.isWindows) {
                    return args.configuration['terminal.integrated.env.windows'];
                }
                else if (platform.isMacintosh) {
                    return args.configuration['terminal.integrated.env.osx'];
                }
                return args.configuration['terminal.integrated.env.linux'];
            };
            const getNonInheritedEnv = async () => {
                const env = await (0, terminalEnvironment_1.getMainProcessParentEnv)(process.env);
                env.VSCODE_IPC_HOOK_CLI = process.env['VSCODE_IPC_HOOK_CLI'];
                return env;
            };
            const env = terminalEnvironment.createTerminalEnvironment(shellLaunchConfig, getEnvFromConfig(), resolver, product_1.default.version, args.configuration['terminal.integrated.detectLocale'], args.configuration['terminal.integrated.inheritEnv'] !== false
                ? process.env
                : await getNonInheritedEnv());
            // Apply extension environment variable collections to the environment.
            if (!shellLaunchConfig.strictEnv) {
                // They come in an array and in serialized format.
                const envVariableCollections = new Map();
                for (const [k, v] of args.envVariableCollections) {
                    envVariableCollections.set(k, { map: (0, environmentVariableShared_1.deserializeEnvironmentVariableCollection)(v) });
                }
                const mergedCollection = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(envVariableCollections);
                mergedCollection.applyToProcessEnvironment(env);
            }
            const persistentTerminalId = await this.ptyService.createProcess(shellLaunchConfig, shellLaunchConfig.cwd, args.cols, args.rows, env, process.env, // Environment used for findExecutable
            false, // windowsEnableConpty
            args.shouldPersistTerminal, args.workspaceId, args.workspaceName);
            return {
                persistentTerminalId,
                resolvedShellLaunchConfig: shellLaunchConfig,
            };
        }
        async sendCommandResult(_id, _reqId, _isError, _payload) {
            // NOTE: Not required unless we implement the matching event, see above.
            throw new Error('not implemented');
        }
    }
    exports.TerminalProviderChannel = TerminalProviderChannel;
    function transformIncoming(remoteAuthority, uri) {
        const transformer = (0, util_1.getUriTransformer)(remoteAuthority);
        return uri ? uri_1.URI.revive(transformer.transformIncoming(uri)) : uri;
    }
});
//# sourceMappingURL=channel.js.map