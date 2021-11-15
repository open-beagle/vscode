/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/api/common/extHost.api.impl", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/severity", "vs/base/common/uri", "vs/editor/common/config/editorOptions", "vs/editor/common/model", "vs/editor/common/modes/languageConfiguration", "vs/editor/common/modes/languageSelector", "vs/platform/files/common/files", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostApiCommands", "vs/workbench/api/common/extHostClipboard", "vs/workbench/api/common/extHostCommands", "vs/workbench/api/common/extHostComments", "vs/workbench/api/common/extHostConfiguration", "vs/workbench/api/common/extHostDiagnostics", "vs/workbench/api/common/extHostDialogs", "vs/workbench/api/common/extHostDocumentContentProviders", "vs/workbench/api/common/extHostDocumentSaveParticipant", "vs/workbench/api/common/extHostDocuments", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/common/extHostExtensionService", "vs/workbench/api/common/extHostFileSystem", "vs/workbench/api/common/extHostFileSystemEventService", "vs/workbench/api/common/extHostLanguageFeatures", "vs/workbench/api/common/extHostLanguages", "vs/workbench/api/common/extHostMessageService", "vs/workbench/api/common/extHostOutput", "vs/workbench/api/common/extHostProgress", "vs/workbench/api/common/extHostQuickOpen", "vs/workbench/api/common/extHostSCM", "vs/workbench/api/common/extHostStatusBar", "vs/workbench/api/common/extHostStorage", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostTextEditors", "vs/workbench/api/common/extHostTreeViews", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostUrls", "vs/workbench/api/common/extHostWebview", "vs/workbench/api/common/extHostWindow", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/services/extensions/common/extensions", "vs/base/common/collections", "vs/workbench/api/common/extHostCodeInsets", "vs/workbench/api/common/extHostLabelService", "vs/platform/remote/common/remoteHosts", "vs/workbench/api/common/extHostDecorations", "vs/workbench/api/common/extHostTask", "vs/workbench/api/common/extHostDebugService", "vs/workbench/api/common/extHostSearch", "vs/platform/log/common/log", "vs/workbench/api/common/extHostUriTransformerService", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostNotebook", "vs/workbench/api/common/extHostTheming", "vs/workbench/api/common/extHostTunnelService", "vs/workbench/api/common/extHostApiDeprecationService", "vs/workbench/api/common/extHostAuthentication", "vs/workbench/api/common/extHostTimeline", "vs/workbench/api/common/extHostNotebookConcatDocument", "vs/workbench/api/common/extHostStoragePaths", "vs/workbench/api/common/extHostFileSystemConsumer", "vs/workbench/api/common/extHostWebviewView", "vs/workbench/api/common/extHostCustomEditors", "vs/workbench/api/common/extHostWebviewPanels", "vs/workbench/api/common/extHostBulkEdits", "vs/workbench/api/common/extHostFileSystemInfo", "vs/workbench/api/common/extHostTesting", "vs/workbench/api/common/extHostUriOpener", "vs/workbench/api/common/exHostSecretState", "vs/workbench/api/common/extHostEditorTabs", "vs/workbench/api/common/extHostTelemetry", "vs/workbench/api/common/extHostNotebookKernels", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/search/common/searchExtTypes"], function (require, exports, nls, cancellation_1, errors, event_1, severity_1, uri_1, editorOptions_1, model_1, languageConfiguration, languageSelector_1, files, extHost_protocol_1, extHostApiCommands_1, extHostClipboard_1, extHostCommands_1, extHostComments_1, extHostConfiguration_1, extHostDiagnostics_1, extHostDialogs_1, extHostDocumentContentProviders_1, extHostDocumentSaveParticipant_1, extHostDocuments_1, extHostDocumentsAndEditors_1, extHostExtensionService_1, extHostFileSystem_1, extHostFileSystemEventService_1, extHostLanguageFeatures_1, extHostLanguages_1, extHostMessageService_1, extHostOutput_1, extHostProgress_1, extHostQuickOpen_1, extHostSCM_1, extHostStatusBar_1, extHostStorage_1, extHostTerminalService_1, extHostTextEditors_1, extHostTreeViews_1, typeConverters, extHostTypes, extHostUrls_1, extHostWebview_1, extHostWindow_1, extHostWorkspace_1, extensions_1, collections_1, extHostCodeInsets_1, extHostLabelService_1, remoteHosts_1, extHostDecorations_1, extHostTask_1, extHostDebugService_1, extHostSearch_1, log_1, extHostUriTransformerService_1, extHostRpcService_1, extHostInitDataService_1, extHostNotebook_1, extHostTheming_1, extHostTunnelService_1, extHostApiDeprecationService_1, extHostAuthentication_1, extHostTimeline_1, extHostNotebookConcatDocument_1, extHostStoragePaths_1, extHostFileSystemConsumer_1, extHostWebviewView_1, extHostCustomEditors_1, extHostWebviewPanels_1, extHostBulkEdits_1, extHostFileSystemInfo_1, extHostTesting_1, extHostUriOpener_1, exHostSecretState_1, extHostEditorTabs_1, extHostTelemetry_1, extHostNotebookKernels_1, remoteAuthorityResolver_1, searchExtTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createApiFactoryAndRegisterActors = void 0;
    /**
     * This method instantiates and returns the extension API surface
     */
    function createApiFactoryAndRegisterActors(accessor) {
        // services
        const initData = accessor.get(extHostInitDataService_1.IExtHostInitDataService);
        const extHostFileSystemInfo = accessor.get(extHostFileSystemInfo_1.IExtHostFileSystemInfo);
        const extHostConsumerFileSystem = accessor.get(extHostFileSystemConsumer_1.IExtHostConsumerFileSystem);
        const extensionService = accessor.get(extHostExtensionService_1.IExtHostExtensionService);
        const extHostWorkspace = accessor.get(extHostWorkspace_1.IExtHostWorkspace);
        const extHostTelemetry = accessor.get(extHostTelemetry_1.IExtHostTelemetry);
        const extHostConfiguration = accessor.get(extHostConfiguration_1.IExtHostConfiguration);
        const uriTransformer = accessor.get(extHostUriTransformerService_1.IURITransformerService);
        const rpcProtocol = accessor.get(extHostRpcService_1.IExtHostRpcService);
        const extHostStorage = accessor.get(extHostStorage_1.IExtHostStorage);
        const extensionStoragePaths = accessor.get(extHostStoragePaths_1.IExtensionStoragePaths);
        const extHostLogService = accessor.get(log_1.ILogService);
        const extHostTunnelService = accessor.get(extHostTunnelService_1.IExtHostTunnelService);
        const extHostApiDeprecation = accessor.get(extHostApiDeprecationService_1.IExtHostApiDeprecationService);
        const extHostWindow = accessor.get(extHostWindow_1.IExtHostWindow);
        const extHostSecretState = accessor.get(exHostSecretState_1.IExtHostSecretState);
        // register addressable instances
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostFileSystemInfo, extHostFileSystemInfo);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostLogService, extHostLogService);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostWorkspace, extHostWorkspace);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostConfiguration, extHostConfiguration);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostExtensionService, extensionService);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostStorage, extHostStorage);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTunnelService, extHostTunnelService);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostWindow, extHostWindow);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostSecretState, extHostSecretState);
        rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTelemetry, extHostTelemetry);
        // automatically create and register addressable instances
        const extHostDecorations = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDecorations, accessor.get(extHostDecorations_1.IExtHostDecorations));
        const extHostDocumentsAndEditors = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocumentsAndEditors, accessor.get(extHostDocumentsAndEditors_1.IExtHostDocumentsAndEditors));
        const extHostCommands = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostCommands, accessor.get(extHostCommands_1.IExtHostCommands));
        const extHostTerminalService = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTerminalService, accessor.get(extHostTerminalService_1.IExtHostTerminalService));
        const extHostDebugService = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDebugService, accessor.get(extHostDebugService_1.IExtHostDebugService));
        const extHostSearch = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostSearch, accessor.get(extHostSearch_1.IExtHostSearch));
        const extHostTask = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTask, accessor.get(extHostTask_1.IExtHostTask));
        const extHostOutputService = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostOutputService, accessor.get(extHostOutput_1.IExtHostOutputService));
        // manually create and register addressable instances
        const extHostEditorTabs = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostEditorTabs, new extHostEditorTabs_1.ExtHostEditorTabs());
        const extHostUrls = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostUrls, new extHostUrls_1.ExtHostUrls(rpcProtocol));
        const extHostDocuments = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocuments, new extHostDocuments_1.ExtHostDocuments(rpcProtocol, extHostDocumentsAndEditors));
        const extHostDocumentContentProviders = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocumentContentProviders, new extHostDocumentContentProviders_1.ExtHostDocumentContentProvider(rpcProtocol, extHostDocumentsAndEditors, extHostLogService));
        const extHostDocumentSaveParticipant = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDocumentSaveParticipant, new extHostDocumentSaveParticipant_1.ExtHostDocumentSaveParticipant(extHostLogService, extHostDocuments, rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadBulkEdits)));
        const extHostNotebook = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostNotebook, new extHostNotebook_1.ExtHostNotebookController(rpcProtocol, extHostCommands, extHostDocumentsAndEditors, extHostDocuments, extHostLogService, extensionStoragePaths));
        const extHostNotebookKernels = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostNotebookKernels, new extHostNotebookKernels_1.ExtHostNotebookKernels(rpcProtocol, initData, extHostNotebook));
        const extHostEditors = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostEditors, new extHostTextEditors_1.ExtHostEditors(rpcProtocol, extHostDocumentsAndEditors));
        const extHostTreeViews = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTreeViews, new extHostTreeViews_1.ExtHostTreeViews(rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadTreeViews), extHostCommands, extHostLogService));
        const extHostEditorInsets = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostEditorInsets, new extHostCodeInsets_1.ExtHostEditorInsets(rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadEditorInsets), extHostEditors, initData.environment));
        const extHostDiagnostics = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostDiagnostics, new extHostDiagnostics_1.ExtHostDiagnostics(rpcProtocol, extHostLogService));
        const extHostLanguageFeatures = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostLanguageFeatures, new extHostLanguageFeatures_1.ExtHostLanguageFeatures(rpcProtocol, uriTransformer, extHostDocuments, extHostCommands, extHostDiagnostics, extHostLogService, extHostApiDeprecation));
        const extHostFileSystem = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostFileSystem, new extHostFileSystem_1.ExtHostFileSystem(rpcProtocol, extHostLanguageFeatures));
        const extHostFileSystemEvent = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostFileSystemEventService, new extHostFileSystemEventService_1.ExtHostFileSystemEventService(rpcProtocol, extHostLogService, extHostDocumentsAndEditors));
        const extHostQuickOpen = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostQuickOpen, (0, extHostQuickOpen_1.createExtHostQuickOpen)(rpcProtocol, extHostWorkspace, extHostCommands));
        const extHostSCM = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostSCM, new extHostSCM_1.ExtHostSCM(rpcProtocol, extHostCommands, extHostLogService));
        const extHostComment = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostComments, new extHostComments_1.ExtHostComments(rpcProtocol, extHostCommands, extHostDocuments));
        const extHostProgress = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostProgress, new extHostProgress_1.ExtHostProgress(rpcProtocol.getProxy(extHost_protocol_1.MainContext.MainThreadProgress)));
        const extHostLabelService = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHosLabelService, new extHostLabelService_1.ExtHostLabelService(rpcProtocol));
        const extHostTheming = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTheming, new extHostTheming_1.ExtHostTheming(rpcProtocol));
        const extHostAuthentication = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostAuthentication, new extHostAuthentication_1.ExtHostAuthentication(rpcProtocol));
        const extHostTimeline = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTimeline, new extHostTimeline_1.ExtHostTimeline(rpcProtocol, extHostCommands));
        const extHostWebviews = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostWebviews, new extHostWebview_1.ExtHostWebviews(rpcProtocol, initData.environment, extHostWorkspace, extHostLogService, extHostApiDeprecation));
        const extHostWebviewPanels = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostWebviewPanels, new extHostWebviewPanels_1.ExtHostWebviewPanels(rpcProtocol, extHostWebviews, extHostWorkspace));
        const extHostCustomEditors = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostCustomEditors, new extHostCustomEditors_1.ExtHostCustomEditors(rpcProtocol, extHostDocuments, extensionStoragePaths, extHostWebviews, extHostWebviewPanels));
        const extHostWebviewViews = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostWebviewViews, new extHostWebviewView_1.ExtHostWebviewViews(rpcProtocol, extHostWebviews));
        const extHostTesting = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostTesting, new extHostTesting_1.ExtHostTesting(rpcProtocol, extHostDocumentsAndEditors, extHostWorkspace));
        const extHostUriOpeners = rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostUriOpeners, new extHostUriOpener_1.ExtHostUriOpeners(rpcProtocol));
        // Check that no named customers are missing
        const expected = (0, collections_1.values)(extHost_protocol_1.ExtHostContext);
        rpcProtocol.assertRegistered(expected);
        // Other instances
        const extHostBulkEdits = new extHostBulkEdits_1.ExtHostBulkEdits(rpcProtocol, extHostDocumentsAndEditors);
        const extHostClipboard = new extHostClipboard_1.ExtHostClipboard(rpcProtocol);
        const extHostMessageService = new extHostMessageService_1.ExtHostMessageService(rpcProtocol, extHostLogService);
        const extHostDialogs = new extHostDialogs_1.ExtHostDialogs(rpcProtocol);
        const extHostStatusBar = new extHostStatusBar_1.ExtHostStatusBar(rpcProtocol, extHostCommands.converter);
        const extHostLanguages = new extHostLanguages_1.ExtHostLanguages(rpcProtocol, extHostDocuments);
        // Register API-ish commands
        extHostApiCommands_1.ExtHostApiCommands.register(extHostCommands);
        return function (extension, extensionRegistry, configProvider) {
            // Check document selectors for being overly generic. Technically this isn't a problem but
            // in practice many extensions say they support `fooLang` but need fs-access to do so. Those
            // extension should specify then the `file`-scheme, e.g. `{ scheme: 'fooLang', language: 'fooLang' }`
            // We only inform once, it is not a warning because we just want to raise awareness and because
            // we cannot say if the extension is doing it right or wrong...
            const checkSelector = (function () {
                let done = (!extension.isUnderDevelopment);
                function informOnce(selector) {
                    if (!done) {
                        extHostLogService.info(`Extension '${extension.identifier.value}' uses a document selector without scheme. Learn more about this: https://go.microsoft.com/fwlink/?linkid=872305`);
                        done = true;
                    }
                }
                return function perform(selector) {
                    if (Array.isArray(selector)) {
                        selector.forEach(perform);
                    }
                    else if (typeof selector === 'string') {
                        informOnce(selector);
                    }
                    else {
                        const filter = selector; // TODO: microsoft/TypeScript#42768
                        if (typeof filter.scheme === 'undefined') {
                            informOnce(selector);
                        }
                        if (!extension.enableProposedApi && typeof filter.exclusive === 'boolean') {
                            (0, extensions_1.throwProposedApiError)(extension);
                        }
                    }
                    return selector;
                };
            })();
            const authentication = {
                getSession(providerId, scopes, options) {
                    return extHostAuthentication.getSession(extension, providerId, scopes, options);
                },
                get onDidChangeSessions() {
                    return extHostAuthentication.onDidChangeSessions;
                },
                registerAuthenticationProvider(id, label, provider, options) {
                    return extHostAuthentication.registerAuthenticationProvider(id, label, provider, options);
                },
                get onDidChangeAuthenticationProviders() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostAuthentication.onDidChangeAuthenticationProviders;
                },
                get providers() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostAuthentication.providers;
                },
                logout(providerId, sessionId) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostAuthentication.removeSession(providerId, sessionId);
                }
            };
            // namespace: commands
            const commands = {
                registerCommand(id, command, thisArgs) {
                    return extHostCommands.registerCommand(true, id, command, thisArgs);
                },
                registerTextEditorCommand(id, callback, thisArg) {
                    return extHostCommands.registerCommand(true, id, (...args) => {
                        const activeTextEditor = extHostEditors.getActiveTextEditor();
                        if (!activeTextEditor) {
                            extHostLogService.warn('Cannot execute ' + id + ' because there is no active text editor.');
                            return undefined;
                        }
                        return activeTextEditor.edit((edit) => {
                            callback.apply(thisArg, [activeTextEditor, edit, ...args]);
                        }).then((result) => {
                            if (!result) {
                                extHostLogService.warn('Edits from command ' + id + ' were not applied.');
                            }
                        }, (err) => {
                            extHostLogService.warn('An error occurred while running command ' + id, err);
                        });
                    });
                },
                registerDiffInformationCommand: (id, callback, thisArg) => {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostCommands.registerCommand(true, id, async (...args) => {
                        const activeTextEditor = extHostDocumentsAndEditors.activeEditor(true);
                        if (!activeTextEditor) {
                            extHostLogService.warn('Cannot execute ' + id + ' because there is no active text editor.');
                            return undefined;
                        }
                        const diff = await extHostEditors.getDiffInformation(activeTextEditor.id);
                        callback.apply(thisArg, [diff, ...args]);
                    });
                },
                executeCommand(id, ...args) {
                    return extHostCommands.executeCommand(id, ...args);
                },
                getCommands(filterInternal = false) {
                    return extHostCommands.getCommands(filterInternal);
                }
            };
            // namespace: env
            const env = {
                get machineId() { return initData.telemetryInfo.machineId; },
                get sessionId() { return initData.telemetryInfo.sessionId; },
                get language() { return initData.environment.appLanguage; },
                get appName() { return initData.environment.appName; },
                get appRoot() { var _a, _b; return (_b = (_a = initData.environment.appRoot) === null || _a === void 0 ? void 0 : _a.fsPath) !== null && _b !== void 0 ? _b : ''; },
                get uriScheme() { return initData.environment.appUriScheme; },
                get clipboard() { return extHostClipboard.value; },
                get shell() {
                    return extHostTerminalService.getDefaultShell(false, configProvider);
                },
                get isTelemetryEnabled() {
                    return extHostTelemetry.getTelemetryEnabled();
                },
                get onDidChangeTelemetryEnabled() {
                    return extHostTelemetry.onDidChangeTelemetryEnabled;
                },
                get isNewAppInstall() {
                    const installAge = Date.now() - new Date(initData.telemetryInfo.firstSessionDate).getTime();
                    return isNaN(installAge) ? false : installAge < 1000 * 60 * 60 * 24; // install age is less than a day
                },
                openExternal(uri, options) {
                    return extHostWindow.openUri(uri, {
                        allowTunneling: !!initData.remote.authority,
                        allowContributedOpeners: options === null || options === void 0 ? void 0 : options.allowContributedOpeners,
                    });
                },
                asExternalUri(uri) {
                    if (uri.scheme === initData.environment.appUriScheme) {
                        return extHostUrls.createAppUri(uri);
                    }
                    return extHostWindow.asExternalUri(uri, { allowTunneling: !!initData.remote.authority });
                },
                get remoteName() {
                    return (0, remoteHosts_1.getRemoteName)(initData.remote.authority);
                },
                get uiKind() {
                    return initData.uiKind;
                }
            };
            if (!initData.environment.extensionTestsLocationURI) {
                // allow to patch env-function when running tests
                Object.freeze(env);
            }
            const extensionKind = initData.remote.isRemote
                ? extHostTypes.ExtensionKind.Workspace
                : extHostTypes.ExtensionKind.UI;
            const test = {
                registerTestController(provider) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTesting.registerTestController(extension.identifier.value, provider);
                },
                createDocumentTestObserver(document) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTesting.createTextDocumentTestObserver(document);
                },
                createWorkspaceTestObserver(workspaceFolder) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTesting.createWorkspaceTestObserver(workspaceFolder);
                },
                runTests(provider) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTesting.runTests(provider);
                },
                createTestItem(options, data) {
                    return new extHostTypes.TestItemImpl(options.id, options.label, options.uri, data);
                },
                createTestRun(request, name, persist) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTesting.createTestRun(extension.identifier.value, request, name, persist);
                },
                get onDidChangeTestResults() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTesting.onResultsChanged;
                },
                get testResults() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTesting.results;
                },
            };
            // todo@connor4312: backwards compatibility for a short period
            test.createTestRunTask = test.createTestRun;
            // namespace: extensions
            const extensions = {
                getExtension(extensionId) {
                    const desc = extensionRegistry.getExtensionDescription(extensionId);
                    if (desc) {
                        return new extHostExtensionService_1.Extension(extensionService, extension.identifier, desc, extensionKind);
                    }
                    return undefined;
                },
                get all() {
                    return extensionRegistry.getAllExtensionDescriptions().map((desc) => new extHostExtensionService_1.Extension(extensionService, extension.identifier, desc, extensionKind));
                },
                get onDidChange() {
                    return extensionRegistry.onDidChange;
                }
            };
            // namespace: languages
            const languages = {
                createDiagnosticCollection(name) {
                    return extHostDiagnostics.createDiagnosticCollection(extension.identifier, name);
                },
                get onDidChangeDiagnostics() {
                    return extHostDiagnostics.onDidChangeDiagnostics;
                },
                getDiagnostics: (resource) => {
                    return extHostDiagnostics.getDiagnostics(resource);
                },
                getLanguages() {
                    return extHostLanguages.getLanguages();
                },
                setTextDocumentLanguage(document, languageId) {
                    return extHostLanguages.changeLanguage(document.uri, languageId);
                },
                match(selector, document) {
                    return (0, languageSelector_1.score)(typeConverters.LanguageSelector.from(selector), document.uri, document.languageId, true);
                },
                registerCodeActionsProvider(selector, provider, metadata) {
                    return extHostLanguageFeatures.registerCodeActionProvider(extension, checkSelector(selector), provider, metadata);
                },
                registerCodeLensProvider(selector, provider) {
                    return extHostLanguageFeatures.registerCodeLensProvider(extension, checkSelector(selector), provider);
                },
                registerDefinitionProvider(selector, provider) {
                    return extHostLanguageFeatures.registerDefinitionProvider(extension, checkSelector(selector), provider);
                },
                registerDeclarationProvider(selector, provider) {
                    return extHostLanguageFeatures.registerDeclarationProvider(extension, checkSelector(selector), provider);
                },
                registerImplementationProvider(selector, provider) {
                    return extHostLanguageFeatures.registerImplementationProvider(extension, checkSelector(selector), provider);
                },
                registerTypeDefinitionProvider(selector, provider) {
                    return extHostLanguageFeatures.registerTypeDefinitionProvider(extension, checkSelector(selector), provider);
                },
                registerHoverProvider(selector, provider) {
                    return extHostLanguageFeatures.registerHoverProvider(extension, checkSelector(selector), provider, extension.identifier);
                },
                registerEvaluatableExpressionProvider(selector, provider) {
                    return extHostLanguageFeatures.registerEvaluatableExpressionProvider(extension, checkSelector(selector), provider, extension.identifier);
                },
                registerInlineValuesProvider(selector, provider) {
                    return extHostLanguageFeatures.registerInlineValuesProvider(extension, checkSelector(selector), provider, extension.identifier);
                },
                registerDocumentHighlightProvider(selector, provider) {
                    return extHostLanguageFeatures.registerDocumentHighlightProvider(extension, checkSelector(selector), provider);
                },
                registerLinkedEditingRangeProvider(selector, provider) {
                    return extHostLanguageFeatures.registerLinkedEditingRangeProvider(extension, checkSelector(selector), provider);
                },
                registerReferenceProvider(selector, provider) {
                    return extHostLanguageFeatures.registerReferenceProvider(extension, checkSelector(selector), provider);
                },
                registerRenameProvider(selector, provider) {
                    return extHostLanguageFeatures.registerRenameProvider(extension, checkSelector(selector), provider);
                },
                registerDocumentSymbolProvider(selector, provider, metadata) {
                    return extHostLanguageFeatures.registerDocumentSymbolProvider(extension, checkSelector(selector), provider, metadata);
                },
                registerWorkspaceSymbolProvider(provider) {
                    return extHostLanguageFeatures.registerWorkspaceSymbolProvider(extension, provider);
                },
                registerDocumentFormattingEditProvider(selector, provider) {
                    return extHostLanguageFeatures.registerDocumentFormattingEditProvider(extension, checkSelector(selector), provider);
                },
                registerDocumentRangeFormattingEditProvider(selector, provider) {
                    return extHostLanguageFeatures.registerDocumentRangeFormattingEditProvider(extension, checkSelector(selector), provider);
                },
                registerOnTypeFormattingEditProvider(selector, provider, firstTriggerCharacter, ...moreTriggerCharacters) {
                    return extHostLanguageFeatures.registerOnTypeFormattingEditProvider(extension, checkSelector(selector), provider, [firstTriggerCharacter].concat(moreTriggerCharacters));
                },
                registerDocumentSemanticTokensProvider(selector, provider, legend) {
                    return extHostLanguageFeatures.registerDocumentSemanticTokensProvider(extension, checkSelector(selector), provider, legend);
                },
                registerDocumentRangeSemanticTokensProvider(selector, provider, legend) {
                    return extHostLanguageFeatures.registerDocumentRangeSemanticTokensProvider(extension, checkSelector(selector), provider, legend);
                },
                registerSignatureHelpProvider(selector, provider, firstItem, ...remaining) {
                    if (typeof firstItem === 'object') {
                        return extHostLanguageFeatures.registerSignatureHelpProvider(extension, checkSelector(selector), provider, firstItem);
                    }
                    return extHostLanguageFeatures.registerSignatureHelpProvider(extension, checkSelector(selector), provider, typeof firstItem === 'undefined' ? [] : [firstItem, ...remaining]);
                },
                registerCompletionItemProvider(selector, provider, ...triggerCharacters) {
                    return extHostLanguageFeatures.registerCompletionItemProvider(extension, checkSelector(selector), provider, triggerCharacters);
                },
                registerDocumentLinkProvider(selector, provider) {
                    return extHostLanguageFeatures.registerDocumentLinkProvider(extension, checkSelector(selector), provider);
                },
                registerColorProvider(selector, provider) {
                    return extHostLanguageFeatures.registerColorProvider(extension, checkSelector(selector), provider);
                },
                registerFoldingRangeProvider(selector, provider) {
                    return extHostLanguageFeatures.registerFoldingRangeProvider(extension, checkSelector(selector), provider);
                },
                registerSelectionRangeProvider(selector, provider) {
                    return extHostLanguageFeatures.registerSelectionRangeProvider(extension, selector, provider);
                },
                registerCallHierarchyProvider(selector, provider) {
                    return extHostLanguageFeatures.registerCallHierarchyProvider(extension, selector, provider);
                },
                setLanguageConfiguration: (language, configuration) => {
                    return extHostLanguageFeatures.setLanguageConfiguration(extension, language, configuration);
                },
                getTokenInformationAtPosition(doc, pos) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostLanguages.tokenAtPosition(doc, pos);
                },
                registerInlineHintsProvider(selector, provider) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostLanguageFeatures.registerInlineHintsProvider(extension, selector, provider);
                }
            };
            // namespace: window
            const window = {
                get activeTextEditor() {
                    return extHostEditors.getActiveTextEditor();
                },
                get visibleTextEditors() {
                    return extHostEditors.getVisibleTextEditors();
                },
                get activeTerminal() {
                    return extHostTerminalService.activeTerminal;
                },
                get terminals() {
                    return extHostTerminalService.terminals;
                },
                async showTextDocument(documentOrUri, columnOrOptions, preserveFocus) {
                    const document = await (uri_1.URI.isUri(documentOrUri)
                        ? Promise.resolve(workspace.openTextDocument(documentOrUri))
                        : Promise.resolve(documentOrUri));
                    return extHostEditors.showTextDocument(document, columnOrOptions, preserveFocus);
                },
                createTextEditorDecorationType(options) {
                    return extHostEditors.createTextEditorDecorationType(options);
                },
                onDidChangeActiveTextEditor(listener, thisArg, disposables) {
                    return extHostEditors.onDidChangeActiveTextEditor(listener, thisArg, disposables);
                },
                onDidChangeVisibleTextEditors(listener, thisArg, disposables) {
                    return extHostEditors.onDidChangeVisibleTextEditors(listener, thisArg, disposables);
                },
                onDidChangeTextEditorSelection(listener, thisArgs, disposables) {
                    return extHostEditors.onDidChangeTextEditorSelection(listener, thisArgs, disposables);
                },
                onDidChangeTextEditorOptions(listener, thisArgs, disposables) {
                    return extHostEditors.onDidChangeTextEditorOptions(listener, thisArgs, disposables);
                },
                onDidChangeTextEditorVisibleRanges(listener, thisArgs, disposables) {
                    return extHostEditors.onDidChangeTextEditorVisibleRanges(listener, thisArgs, disposables);
                },
                onDidChangeTextEditorViewColumn(listener, thisArg, disposables) {
                    return extHostEditors.onDidChangeTextEditorViewColumn(listener, thisArg, disposables);
                },
                onDidCloseTerminal(listener, thisArg, disposables) {
                    return extHostTerminalService.onDidCloseTerminal(listener, thisArg, disposables);
                },
                onDidOpenTerminal(listener, thisArg, disposables) {
                    return extHostTerminalService.onDidOpenTerminal(listener, thisArg, disposables);
                },
                onDidChangeActiveTerminal(listener, thisArg, disposables) {
                    return extHostTerminalService.onDidChangeActiveTerminal(listener, thisArg, disposables);
                },
                onDidChangeTerminalDimensions(listener, thisArg, disposables) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTerminalService.onDidChangeTerminalDimensions(listener, thisArg, disposables);
                },
                onDidWriteTerminalData(listener, thisArg, disposables) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTerminalService.onDidWriteTerminalData(listener, thisArg, disposables);
                },
                get state() {
                    return extHostWindow.state;
                },
                onDidChangeWindowState(listener, thisArg, disposables) {
                    return extHostWindow.onDidChangeWindowState(listener, thisArg, disposables);
                },
                showInformationMessage(message, ...rest) {
                    return extHostMessageService.showMessage(extension, severity_1.default.Info, message, rest[0], rest.slice(1));
                },
                showWarningMessage(message, ...rest) {
                    return extHostMessageService.showMessage(extension, severity_1.default.Warning, message, rest[0], rest.slice(1));
                },
                showErrorMessage(message, ...rest) {
                    return extHostMessageService.showMessage(extension, severity_1.default.Error, message, rest[0], rest.slice(1));
                },
                showQuickPick(items, options, token) {
                    return extHostQuickOpen.showQuickPick(items, !!extension.enableProposedApi, options, token);
                },
                showWorkspaceFolderPick(options) {
                    return extHostQuickOpen.showWorkspaceFolderPick(options);
                },
                showInputBox(options, token) {
                    return extHostQuickOpen.showInput(options, token);
                },
                showOpenDialog(options) {
                    return extHostDialogs.showOpenDialog(options);
                },
                showSaveDialog(options) {
                    return extHostDialogs.showSaveDialog(options);
                },
                createStatusBarItem(alignmentOrOptions, priority) {
                    let id;
                    let name;
                    let alignment;
                    let accessibilityInformation = undefined;
                    if (alignmentOrOptions && typeof alignmentOrOptions !== 'number') {
                        id = alignmentOrOptions.id;
                        name = alignmentOrOptions.name;
                        alignment = alignmentOrOptions.alignment;
                        priority = alignmentOrOptions.priority;
                        accessibilityInformation = alignmentOrOptions.accessibilityInformation;
                    }
                    else {
                        id = extension.identifier.value;
                        name = nls.localize(0, null, extension.displayName || extension.name);
                        alignment = alignmentOrOptions;
                    }
                    return extHostStatusBar.createStatusBarEntry(id, name, alignment, priority, accessibilityInformation);
                },
                setStatusBarMessage(text, timeoutOrThenable) {
                    return extHostStatusBar.setStatusBarMessage(text, timeoutOrThenable);
                },
                withScmProgress(task) {
                    extHostApiDeprecation.report('window.withScmProgress', extension, `Use 'withProgress' instead.`);
                    return extHostProgress.withProgress(extension, { location: extHostTypes.ProgressLocation.SourceControl }, (progress, token) => task({ report(n) { } }));
                },
                withProgress(options, task) {
                    return extHostProgress.withProgress(extension, options, task);
                },
                createOutputChannel(name) {
                    return extHostOutputService.createOutputChannel(name);
                },
                createWebviewPanel(viewType, title, showOptions, options) {
                    return extHostWebviewPanels.createWebviewPanel(extension, viewType, title, showOptions, options);
                },
                createWebviewTextEditorInset(editor, line, height, options) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostEditorInsets.createWebviewEditorInset(editor, line, height, options, extension);
                },
                createTerminal(nameOrOptions, shellPath, shellArgs) {
                    if (typeof nameOrOptions === 'object') {
                        if ('pty' in nameOrOptions) {
                            return extHostTerminalService.createExtensionTerminal(nameOrOptions);
                        }
                        if (nameOrOptions.message) {
                            (0, extensions_1.checkProposedApiEnabled)(extension);
                        }
                        if (nameOrOptions.icon) {
                            (0, extensions_1.checkProposedApiEnabled)(extension);
                        }
                        return extHostTerminalService.createTerminalFromOptions(nameOrOptions);
                    }
                    return extHostTerminalService.createTerminal(nameOrOptions, shellPath, shellArgs);
                },
                registerTerminalLinkProvider(handler) {
                    return extHostTerminalService.registerLinkProvider(handler);
                },
                registerTreeDataProvider(viewId, treeDataProvider) {
                    return extHostTreeViews.registerTreeDataProvider(viewId, treeDataProvider, extension);
                },
                createTreeView(viewId, options) {
                    return extHostTreeViews.createTreeView(viewId, options, extension);
                },
                registerWebviewPanelSerializer: (viewType, serializer) => {
                    return extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializer);
                },
                registerCustomEditorProvider: (viewType, provider, options = {}) => {
                    return extHostCustomEditors.registerCustomEditorProvider(extension, viewType, provider, options);
                },
                registerFileDecorationProvider(provider) {
                    return extHostDecorations.registerFileDecorationProvider(provider, extension.identifier);
                },
                registerUriHandler(handler) {
                    return extHostUrls.registerUriHandler(extension.identifier, handler);
                },
                createQuickPick() {
                    return extHostQuickOpen.createQuickPick(extension.identifier, !!extension.enableProposedApi);
                },
                createInputBox() {
                    return extHostQuickOpen.createInputBox(extension.identifier);
                },
                get activeColorTheme() {
                    return extHostTheming.activeColorTheme;
                },
                onDidChangeActiveColorTheme(listener, thisArg, disposables) {
                    return extHostTheming.onDidChangeActiveColorTheme(listener, thisArg, disposables);
                },
                registerWebviewViewProvider(viewId, provider, options) {
                    return extHostWebviewViews.registerWebviewViewProvider(extension, viewId, provider, options === null || options === void 0 ? void 0 : options.webviewOptions);
                },
                get activeNotebookEditor() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.activeNotebookEditor;
                },
                onDidChangeActiveNotebookEditor(listener, thisArgs, disposables) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.onDidChangeActiveNotebookEditor(listener, thisArgs, disposables);
                },
                get visibleNotebookEditors() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.visibleNotebookEditors;
                },
                get onDidChangeVisibleNotebookEditors() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.onDidChangeVisibleNotebookEditors;
                },
                onDidChangeNotebookEditorSelection(listener, thisArgs, disposables) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.onDidChangeNotebookEditorSelection(listener, thisArgs, disposables);
                },
                onDidChangeNotebookEditorVisibleRanges(listener, thisArgs, disposables) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.onDidChangeNotebookEditorVisibleRanges(listener, thisArgs, disposables);
                },
                showNotebookDocument(uriOrDocument, options) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.showNotebookDocument(uriOrDocument, options);
                },
                registerExternalUriOpener(id, opener, metadata) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostUriOpeners.registerExternalUriOpener(extension.identifier, id, opener, metadata);
                },
                get openEditors() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostEditorTabs.tabs;
                },
                get onDidChangeOpenEditors() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostEditorTabs.onDidChangeTabs;
                }
            };
            // namespace: workspace
            const workspace = {
                get rootPath() {
                    extHostApiDeprecation.report('workspace.rootPath', extension, `Please use 'workspace.workspaceFolders' instead. More details: https://aka.ms/vscode-eliminating-rootpath`);
                    return extHostWorkspace.getPath();
                },
                set rootPath(value) {
                    throw errors.readonly();
                },
                getWorkspaceFolder(resource) {
                    return extHostWorkspace.getWorkspaceFolder(resource);
                },
                get workspaceFolders() {
                    return extHostWorkspace.getWorkspaceFolders();
                },
                get name() {
                    return extHostWorkspace.name;
                },
                set name(value) {
                    throw errors.readonly();
                },
                get workspaceFile() {
                    return extHostWorkspace.workspaceFile;
                },
                set workspaceFile(value) {
                    throw errors.readonly();
                },
                updateWorkspaceFolders: (index, deleteCount, ...workspaceFoldersToAdd) => {
                    return extHostWorkspace.updateWorkspaceFolders(extension, index, deleteCount || 0, ...workspaceFoldersToAdd);
                },
                onDidChangeWorkspaceFolders: function (listener, thisArgs, disposables) {
                    return extHostWorkspace.onDidChangeWorkspace(listener, thisArgs, disposables);
                },
                asRelativePath: (pathOrUri, includeWorkspace) => {
                    return extHostWorkspace.getRelativePath(pathOrUri, includeWorkspace);
                },
                findFiles: (include, exclude, maxResults, token) => {
                    // Note, undefined/null have different meanings on "exclude"
                    return extHostWorkspace.findFiles(typeConverters.GlobPattern.from(include), typeConverters.GlobPattern.from(exclude), maxResults, extension.identifier, token);
                },
                findTextInFiles: (query, optionsOrCallback, callbackOrToken, token) => {
                    let options;
                    let callback;
                    if (typeof optionsOrCallback === 'object') {
                        options = optionsOrCallback;
                        callback = callbackOrToken;
                    }
                    else {
                        options = {};
                        callback = optionsOrCallback;
                        token = callbackOrToken;
                    }
                    return extHostWorkspace.findTextInFiles(query, options || {}, callback, extension.identifier, token);
                },
                saveAll: (includeUntitled) => {
                    return extHostWorkspace.saveAll(includeUntitled);
                },
                applyEdit(edit) {
                    return extHostBulkEdits.applyWorkspaceEdit(edit);
                },
                createFileSystemWatcher: (pattern, ignoreCreate, ignoreChange, ignoreDelete) => {
                    return extHostFileSystemEvent.createFileSystemWatcher(typeConverters.GlobPattern.from(pattern), ignoreCreate, ignoreChange, ignoreDelete);
                },
                get textDocuments() {
                    return extHostDocuments.getAllDocumentData().map(data => data.document);
                },
                set textDocuments(value) {
                    throw errors.readonly();
                },
                openTextDocument(uriOrFileNameOrOptions) {
                    let uriPromise;
                    const options = uriOrFileNameOrOptions;
                    if (typeof uriOrFileNameOrOptions === 'string') {
                        uriPromise = Promise.resolve(uri_1.URI.file(uriOrFileNameOrOptions));
                    }
                    else if (uri_1.URI.isUri(uriOrFileNameOrOptions)) {
                        uriPromise = Promise.resolve(uriOrFileNameOrOptions);
                    }
                    else if (!options || typeof options === 'object') {
                        uriPromise = extHostDocuments.createDocumentData(options);
                    }
                    else {
                        throw new Error('illegal argument - uriOrFileNameOrOptions');
                    }
                    return uriPromise.then(uri => {
                        return extHostDocuments.ensureDocumentData(uri).then(documentData => {
                            return documentData.document;
                        });
                    });
                },
                onDidOpenTextDocument: (listener, thisArgs, disposables) => {
                    return extHostDocuments.onDidAddDocument(listener, thisArgs, disposables);
                },
                onDidCloseTextDocument: (listener, thisArgs, disposables) => {
                    return extHostDocuments.onDidRemoveDocument(listener, thisArgs, disposables);
                },
                onDidChangeTextDocument: (listener, thisArgs, disposables) => {
                    return extHostDocuments.onDidChangeDocument(listener, thisArgs, disposables);
                },
                onDidSaveTextDocument: (listener, thisArgs, disposables) => {
                    return extHostDocuments.onDidSaveDocument(listener, thisArgs, disposables);
                },
                onWillSaveTextDocument: (listener, thisArgs, disposables) => {
                    return extHostDocumentSaveParticipant.getOnWillSaveTextDocumentEvent(extension)(listener, thisArgs, disposables);
                },
                onDidChangeConfiguration: (listener, thisArgs, disposables) => {
                    return configProvider.onDidChangeConfiguration(listener, thisArgs, disposables);
                },
                getConfiguration(section, scope) {
                    scope = arguments.length === 1 ? undefined : scope;
                    return configProvider.getConfiguration(section, scope, extension);
                },
                registerTextDocumentContentProvider(scheme, provider) {
                    return extHostDocumentContentProviders.registerTextDocumentContentProvider(scheme, provider);
                },
                registerTaskProvider: (type, provider) => {
                    extHostApiDeprecation.report('window.registerTaskProvider', extension, `Use the corresponding function on the 'tasks' namespace instead`);
                    return extHostTask.registerTaskProvider(extension, type, provider);
                },
                registerFileSystemProvider(scheme, provider, options) {
                    return extHostFileSystem.registerFileSystemProvider(extension.identifier, scheme, provider, options);
                },
                get fs() {
                    return extHostConsumerFileSystem.value;
                },
                registerFileSearchProvider: (scheme, provider) => {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostSearch.registerFileSearchProvider(scheme, provider);
                },
                registerTextSearchProvider: (scheme, provider) => {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostSearch.registerTextSearchProvider(scheme, provider);
                },
                registerRemoteAuthorityResolver: (authorityPrefix, resolver) => {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extensionService.registerRemoteAuthorityResolver(authorityPrefix, resolver);
                },
                registerResourceLabelFormatter: (formatter) => {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostLabelService.$registerResourceLabelFormatter(formatter);
                },
                onDidCreateFiles: (listener, thisArg, disposables) => {
                    return extHostFileSystemEvent.onDidCreateFile(listener, thisArg, disposables);
                },
                onDidDeleteFiles: (listener, thisArg, disposables) => {
                    return extHostFileSystemEvent.onDidDeleteFile(listener, thisArg, disposables);
                },
                onDidRenameFiles: (listener, thisArg, disposables) => {
                    return extHostFileSystemEvent.onDidRenameFile(listener, thisArg, disposables);
                },
                onWillCreateFiles: (listener, thisArg, disposables) => {
                    return extHostFileSystemEvent.getOnWillCreateFileEvent(extension)(listener, thisArg, disposables);
                },
                onWillDeleteFiles: (listener, thisArg, disposables) => {
                    return extHostFileSystemEvent.getOnWillDeleteFileEvent(extension)(listener, thisArg, disposables);
                },
                onWillRenameFiles: (listener, thisArg, disposables) => {
                    return extHostFileSystemEvent.getOnWillRenameFileEvent(extension)(listener, thisArg, disposables);
                },
                openTunnel: (forward) => {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTunnelService.openTunnel(extension, forward).then(value => {
                        if (!value) {
                            throw new Error('cannot open tunnel');
                        }
                        return value;
                    });
                },
                get tunnels() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTunnelService.getTunnels();
                },
                onDidChangeTunnels: (listener, thisArg, disposables) => {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTunnelService.onDidChangeTunnels(listener, thisArg, disposables);
                },
                registerPortAttributesProvider: (portSelector, provider) => {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTunnelService.registerPortsAttributesProvider(portSelector, provider);
                },
                registerTimelineProvider: (scheme, provider) => {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostTimeline.registerTimelineProvider(scheme, provider, extension.identifier, extHostCommands.converter);
                },
                get isTrusted() {
                    return extHostWorkspace.trusted;
                },
                requestWorkspaceTrust: (options) => {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostWorkspace.requestWorkspaceTrust(options);
                },
                onDidGrantWorkspaceTrust: (listener, thisArgs, disposables) => {
                    return extHostWorkspace.onDidGrantWorkspaceTrust(listener, thisArgs, disposables);
                }
            };
            // namespace: scm
            const scm = {
                get inputBox() {
                    extHostApiDeprecation.report('scm.inputBox', extension, `Use 'SourceControl.inputBox' instead`);
                    return extHostSCM.getLastInputBox(extension); // Strict null override - Deprecated api
                },
                createSourceControl(id, label, rootUri) {
                    return extHostSCM.createSourceControl(extension, id, label, rootUri);
                }
            };
            // namespace: comments
            const comments = {
                createCommentController(id, label) {
                    return extHostComment.createCommentController(extension, id, label);
                }
            };
            // namespace: debug
            const debug = {
                get activeDebugSession() {
                    return extHostDebugService.activeDebugSession;
                },
                get activeDebugConsole() {
                    return extHostDebugService.activeDebugConsole;
                },
                get breakpoints() {
                    return extHostDebugService.breakpoints;
                },
                onDidStartDebugSession(listener, thisArg, disposables) {
                    return extHostDebugService.onDidStartDebugSession(listener, thisArg, disposables);
                },
                onDidTerminateDebugSession(listener, thisArg, disposables) {
                    return extHostDebugService.onDidTerminateDebugSession(listener, thisArg, disposables);
                },
                onDidChangeActiveDebugSession(listener, thisArg, disposables) {
                    return extHostDebugService.onDidChangeActiveDebugSession(listener, thisArg, disposables);
                },
                onDidReceiveDebugSessionCustomEvent(listener, thisArg, disposables) {
                    return extHostDebugService.onDidReceiveDebugSessionCustomEvent(listener, thisArg, disposables);
                },
                onDidChangeBreakpoints(listener, thisArgs, disposables) {
                    return extHostDebugService.onDidChangeBreakpoints(listener, thisArgs, disposables);
                },
                registerDebugConfigurationProvider(debugType, provider, triggerKind) {
                    return extHostDebugService.registerDebugConfigurationProvider(debugType, provider, triggerKind || extHostTypes.DebugConfigurationProviderTriggerKind.Initial);
                },
                registerDebugAdapterDescriptorFactory(debugType, factory) {
                    return extHostDebugService.registerDebugAdapterDescriptorFactory(extension, debugType, factory);
                },
                registerDebugAdapterTrackerFactory(debugType, factory) {
                    return extHostDebugService.registerDebugAdapterTrackerFactory(debugType, factory);
                },
                startDebugging(folder, nameOrConfig, parentSessionOrOptions) {
                    if (!parentSessionOrOptions || (typeof parentSessionOrOptions === 'object' && 'configuration' in parentSessionOrOptions)) {
                        return extHostDebugService.startDebugging(folder, nameOrConfig, { parentSession: parentSessionOrOptions });
                    }
                    return extHostDebugService.startDebugging(folder, nameOrConfig, parentSessionOrOptions || {});
                },
                stopDebugging(session) {
                    return extHostDebugService.stopDebugging(session);
                },
                addBreakpoints(breakpoints) {
                    return extHostDebugService.addBreakpoints(breakpoints);
                },
                removeBreakpoints(breakpoints) {
                    return extHostDebugService.removeBreakpoints(breakpoints);
                },
                asDebugSourceUri(source, session) {
                    return extHostDebugService.asDebugSourceUri(source, session);
                }
            };
            const tasks = {
                registerTaskProvider: (type, provider) => {
                    return extHostTask.registerTaskProvider(extension, type, provider);
                },
                fetchTasks: (filter) => {
                    return extHostTask.fetchTasks(filter);
                },
                executeTask: (task) => {
                    return extHostTask.executeTask(extension, task);
                },
                get taskExecutions() {
                    return extHostTask.taskExecutions;
                },
                onDidStartTask: (listeners, thisArgs, disposables) => {
                    return extHostTask.onDidStartTask(listeners, thisArgs, disposables);
                },
                onDidEndTask: (listeners, thisArgs, disposables) => {
                    return extHostTask.onDidEndTask(listeners, thisArgs, disposables);
                },
                onDidStartTaskProcess: (listeners, thisArgs, disposables) => {
                    return extHostTask.onDidStartTaskProcess(listeners, thisArgs, disposables);
                },
                onDidEndTaskProcess: (listeners, thisArgs, disposables) => {
                    return extHostTask.onDidEndTaskProcess(listeners, thisArgs, disposables);
                }
            };
            // namespace: notebook
            const notebook = {
                openNotebookDocument: (uriComponents) => {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.openNotebookDocument(uriComponents);
                },
                get onDidOpenNotebookDocument() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.onDidOpenNotebookDocument;
                },
                get onDidCloseNotebookDocument() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.onDidCloseNotebookDocument;
                },
                get onDidSaveNotebookDocument() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.onDidSaveNotebookDocument;
                },
                get notebookDocuments() {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.notebookDocuments.map(d => d.apiNotebook);
                },
                registerNotebookSerializer(viewType, serializer, options) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.registerNotebookSerializer(extension, viewType, serializer, options);
                },
                registerNotebookContentProvider: (viewType, provider, options) => {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.registerNotebookContentProvider(extension, viewType, provider, options);
                },
                registerNotebookCellStatusBarItemProvider: (selector, provider) => {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.registerNotebookCellStatusBarItemProvider(extension, selector, provider);
                },
                createNotebookEditorDecorationType(options) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.createNotebookEditorDecorationType(options);
                },
                onDidChangeNotebookDocumentMetadata(listener, thisArgs, disposables) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.onDidChangeNotebookDocumentMetadata(listener, thisArgs, disposables);
                },
                onDidChangeNotebookCells(listener, thisArgs, disposables) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.onDidChangeNotebookCells(listener, thisArgs, disposables);
                },
                onDidChangeCellExecutionState(listener, thisArgs, disposables) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.onDidChangeNotebookCellExecutionState(listener, thisArgs, disposables);
                },
                onDidChangeCellOutputs(listener, thisArgs, disposables) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.onDidChangeCellOutputs(listener, thisArgs, disposables);
                },
                onDidChangeCellMetadata(listener, thisArgs, disposables) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.onDidChangeCellMetadata(listener, thisArgs, disposables);
                },
                createConcatTextDocument(notebook, selector) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return new extHostNotebookConcatDocument_1.ExtHostNotebookConcatDocument(extHostNotebook, extHostDocuments, notebook, selector);
                },
                createNotebookCellExecutionTask(uri, index, kernelId) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebook.createNotebookCellExecution(uri, index, kernelId);
                },
                createNotebookController(id, viewType, label, executeHandler, preloads) {
                    (0, extensions_1.checkProposedApiEnabled)(extension);
                    return extHostNotebookKernels.createNotebookController(extension, id, viewType, label, executeHandler, preloads);
                }
            };
            return {
                version: initData.version,
                // namespaces
                authentication,
                commands,
                comments,
                debug,
                env,
                extensions,
                languages,
                notebook,
                scm,
                tasks,
                test,
                window,
                workspace,
                // types
                Breakpoint: extHostTypes.Breakpoint,
                CallHierarchyIncomingCall: extHostTypes.CallHierarchyIncomingCall,
                CallHierarchyItem: extHostTypes.CallHierarchyItem,
                CallHierarchyOutgoingCall: extHostTypes.CallHierarchyOutgoingCall,
                CancellationError: errors.CancellationError,
                CancellationTokenSource: cancellation_1.CancellationTokenSource,
                CandidatePortSource: extHost_protocol_1.CandidatePortSource,
                CodeAction: extHostTypes.CodeAction,
                CodeActionKind: extHostTypes.CodeActionKind,
                CodeActionTriggerKind: extHostTypes.CodeActionTriggerKind,
                CodeLens: extHostTypes.CodeLens,
                Color: extHostTypes.Color,
                ColorInformation: extHostTypes.ColorInformation,
                ColorPresentation: extHostTypes.ColorPresentation,
                ColorThemeKind: extHostTypes.ColorThemeKind,
                CommentMode: extHostTypes.CommentMode,
                CommentThreadCollapsibleState: extHostTypes.CommentThreadCollapsibleState,
                CompletionItem: extHostTypes.CompletionItem,
                CompletionItemKind: extHostTypes.CompletionItemKind,
                CompletionItemTag: extHostTypes.CompletionItemTag,
                CompletionList: extHostTypes.CompletionList,
                CompletionTriggerKind: extHostTypes.CompletionTriggerKind,
                ConfigurationTarget: extHostTypes.ConfigurationTarget,
                CustomExecution: extHostTypes.CustomExecution,
                DebugAdapterExecutable: extHostTypes.DebugAdapterExecutable,
                DebugAdapterInlineImplementation: extHostTypes.DebugAdapterInlineImplementation,
                DebugAdapterNamedPipeServer: extHostTypes.DebugAdapterNamedPipeServer,
                DebugAdapterServer: extHostTypes.DebugAdapterServer,
                DebugConfigurationProviderTriggerKind: extHostTypes.DebugConfigurationProviderTriggerKind,
                DebugConsoleMode: extHostTypes.DebugConsoleMode,
                DecorationRangeBehavior: extHostTypes.DecorationRangeBehavior,
                Diagnostic: extHostTypes.Diagnostic,
                DiagnosticRelatedInformation: extHostTypes.DiagnosticRelatedInformation,
                DiagnosticSeverity: extHostTypes.DiagnosticSeverity,
                DiagnosticTag: extHostTypes.DiagnosticTag,
                Disposable: extHostTypes.Disposable,
                DocumentHighlight: extHostTypes.DocumentHighlight,
                DocumentHighlightKind: extHostTypes.DocumentHighlightKind,
                DocumentLink: extHostTypes.DocumentLink,
                DocumentSymbol: extHostTypes.DocumentSymbol,
                EndOfLine: extHostTypes.EndOfLine,
                EnvironmentVariableMutatorType: extHostTypes.EnvironmentVariableMutatorType,
                EvaluatableExpression: extHostTypes.EvaluatableExpression,
                InlineValueText: extHostTypes.InlineValueText,
                InlineValueVariableLookup: extHostTypes.InlineValueVariableLookup,
                InlineValueEvaluatableExpression: extHostTypes.InlineValueEvaluatableExpression,
                EventEmitter: event_1.Emitter,
                ExtensionKind: extHostTypes.ExtensionKind,
                ExtensionMode: extHostTypes.ExtensionMode,
                ExternalUriOpenerPriority: extHostTypes.ExternalUriOpenerPriority,
                FileChangeType: extHostTypes.FileChangeType,
                FileDecoration: extHostTypes.FileDecoration,
                FileSystemError: extHostTypes.FileSystemError,
                FileType: files.FileType,
                FoldingRange: extHostTypes.FoldingRange,
                FoldingRangeKind: extHostTypes.FoldingRangeKind,
                FunctionBreakpoint: extHostTypes.FunctionBreakpoint,
                Hover: extHostTypes.Hover,
                IndentAction: languageConfiguration.IndentAction,
                Location: extHostTypes.Location,
                MarkdownString: extHostTypes.MarkdownString,
                OverviewRulerLane: model_1.OverviewRulerLane,
                ParameterInformation: extHostTypes.ParameterInformation,
                PortAutoForwardAction: extHostTypes.PortAutoForwardAction,
                Position: extHostTypes.Position,
                ProcessExecution: extHostTypes.ProcessExecution,
                ProgressLocation: extHostTypes.ProgressLocation,
                QuickInputButtons: extHostTypes.QuickInputButtons,
                Range: extHostTypes.Range,
                RelativePattern: extHostTypes.RelativePattern,
                Selection: extHostTypes.Selection,
                SelectionRange: extHostTypes.SelectionRange,
                SemanticTokens: extHostTypes.SemanticTokens,
                SemanticTokensBuilder: extHostTypes.SemanticTokensBuilder,
                SemanticTokensEdit: extHostTypes.SemanticTokensEdit,
                SemanticTokensEdits: extHostTypes.SemanticTokensEdits,
                SemanticTokensLegend: extHostTypes.SemanticTokensLegend,
                ShellExecution: extHostTypes.ShellExecution,
                ShellQuoting: extHostTypes.ShellQuoting,
                SignatureHelp: extHostTypes.SignatureHelp,
                SignatureHelpTriggerKind: extHostTypes.SignatureHelpTriggerKind,
                SignatureInformation: extHostTypes.SignatureInformation,
                SnippetString: extHostTypes.SnippetString,
                SourceBreakpoint: extHostTypes.SourceBreakpoint,
                StandardTokenType: extHostTypes.StandardTokenType,
                StatusBarAlignment: extHostTypes.StatusBarAlignment,
                SymbolInformation: extHostTypes.SymbolInformation,
                SymbolKind: extHostTypes.SymbolKind,
                SymbolTag: extHostTypes.SymbolTag,
                Task: extHostTypes.Task,
                TaskGroup: extHostTypes.TaskGroup,
                TaskPanelKind: extHostTypes.TaskPanelKind,
                TaskRevealKind: extHostTypes.TaskRevealKind,
                TaskScope: extHostTypes.TaskScope,
                TextDocumentSaveReason: extHostTypes.TextDocumentSaveReason,
                TextEdit: extHostTypes.TextEdit,
                TextEditorCursorStyle: editorOptions_1.TextEditorCursorStyle,
                TextEditorLineNumbersStyle: extHostTypes.TextEditorLineNumbersStyle,
                TextEditorRevealType: extHostTypes.TextEditorRevealType,
                TextEditorSelectionChangeKind: extHostTypes.TextEditorSelectionChangeKind,
                ThemeColor: extHostTypes.ThemeColor,
                ThemeIcon: extHostTypes.ThemeIcon,
                TreeItem: extHostTypes.TreeItem,
                TreeItemCollapsibleState: extHostTypes.TreeItemCollapsibleState,
                UIKind: extHost_protocol_1.UIKind,
                Uri: uri_1.URI,
                ViewColumn: extHostTypes.ViewColumn,
                WorkspaceEdit: extHostTypes.WorkspaceEdit,
                // proposed api types
                InlineHint: extHostTypes.InlineHint,
                InlineHintKind: extHostTypes.InlineHintKind,
                RemoteAuthorityResolverError: extHostTypes.RemoteAuthorityResolverError,
                RemoteTrustOption: remoteAuthorityResolver_1.RemoteTrustOption,
                ResolvedAuthority: extHostTypes.ResolvedAuthority,
                SourceControlInputBoxValidationType: extHostTypes.SourceControlInputBoxValidationType,
                ExtensionRuntime: extHostTypes.ExtensionRuntime,
                TimelineItem: extHostTypes.TimelineItem,
                NotebookRange: extHostTypes.NotebookRange,
                NotebookCellKind: extHostTypes.NotebookCellKind,
                NotebookCellExecutionState: extHostTypes.NotebookCellExecutionState,
                NotebookDocumentMetadata: extHostTypes.NotebookDocumentMetadata,
                NotebookCellMetadata: extHostTypes.NotebookCellMetadata,
                NotebookCellData: extHostTypes.NotebookCellData,
                NotebookData: extHostTypes.NotebookData,
                NotebookCellStatusBarAlignment: extHostTypes.NotebookCellStatusBarAlignment,
                NotebookEditorRevealType: extHostTypes.NotebookEditorRevealType,
                NotebookCellOutput: extHostTypes.NotebookCellOutput,
                NotebookCellOutputItem: extHostTypes.NotebookCellOutputItem,
                NotebookCellStatusBarItem: extHostTypes.NotebookCellStatusBarItem,
                NotebookControllerAffinity: extHostTypes.NotebookControllerAffinity,
                LinkedEditingRanges: extHostTypes.LinkedEditingRanges,
                TestItemStatus: extHostTypes.TestItemStatus,
                TestResultState: extHostTypes.TestResultState,
                TestMessage: extHostTypes.TestMessage,
                TextSearchCompleteMessageType: searchExtTypes_1.TextSearchCompleteMessageType,
                TestMessageSeverity: extHostTypes.TestMessageSeverity,
                WorkspaceTrustState: extHostTypes.WorkspaceTrustState
            };
        };
    }
    exports.createApiFactoryAndRegisterActors = createApiFactoryAndRegisterActors;
});
//# sourceMappingURL=extHost.api.impl.js.map