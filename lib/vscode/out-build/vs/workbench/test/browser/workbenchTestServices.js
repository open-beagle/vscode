/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/workbench/contrib/files/common/editors/fileEditorInput", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/common/editor", "vs/base/common/event", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/configuration/common/configuration", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/services/textmodelResolver/common/textModelResolverService", "vs/editor/common/services/resolverService", "vs/workbench/services/untitled/common/untitledTextEditorService", "vs/platform/workspace/common/workspace", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/instantiation/common/serviceCollection", "vs/platform/files/common/files", "vs/editor/common/services/modelService", "vs/editor/common/services/modeServiceImpl", "vs/editor/common/services/modelServiceImpl", "vs/workbench/services/textfile/common/textfiles", "vs/editor/common/services/modeService", "vs/workbench/services/history/common/history", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/workspace/test/common/testWorkspace", "vs/platform/environment/common/environment", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/editor/common/services/textResourceConfigurationService", "vs/editor/common/core/position", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/editor/common/core/range", "vs/platform/dialogs/common/dialogs", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/workbench/services/extensions/common/extensions", "vs/platform/keybinding/common/keybinding", "vs/workbench/services/decorations/browser/decorations", "vs/base/common/lifecycle", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/editor/browser/services/codeEditorService", "vs/workbench/browser/editor", "vs/base/browser/dom", "vs/platform/log/common/log", "vs/platform/label/common/label", "vs/base/common/async", "vs/workbench/services/viewlet/browser/viewlet", "vs/platform/storage/common/storage", "vs/base/common/platform", "vs/workbench/services/label/common/labelService", "vs/base/common/buffer", "vs/base/common/network", "vs/platform/product/common/productService", "vs/platform/product/common/product", "vs/workbench/services/host/browser/host", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/platform/accessibility/common/accessibility", "vs/workbench/services/environment/browser/environmentService", "vs/workbench/services/textfile/browser/browserTextFileService", "vs/workbench/services/environment/common/environmentService", "vs/editor/common/model/textModel", "vs/workbench/services/path/common/pathService", "vs/platform/progress/common/progress", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/instantiation/common/descriptors", "vs/platform/dialogs/test/common/testDialogService", "vs/workbench/services/editor/browser/codeEditorService", "vs/workbench/browser/parts/editor/editorPart", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/quickinput/browser/quickInputService", "vs/platform/list/browser/listService", "vs/base/common/path", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/workbench/services/uriIdentity/common/uriIdentityService", "vs/workbench/services/textfile/common/textFileEditorModelManager", "vs/platform/files/common/inMemoryFilesystemProvider", "vs/base/common/stream", "vs/workbench/services/textfile/browser/textFileService", "vs/workbench/services/textfile/common/encoding", "vs/platform/theme/common/theme", "vs/base/common/iterator", "vs/workbench/services/workingCopy/common/workingCopyBackupService", "vs/workbench/services/workingCopy/browser/workingCopyBackupService", "vs/platform/files/common/fileService", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/editor/test/browser/testCodeEditor", "vs/workbench/contrib/files/browser/editors/textFileEditor", "vs/workbench/common/editor/resourceEditorInput", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/browser/parts/editor/sideBySideEditor", "vs/platform/workspaces/common/workspaces", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/workspaces/test/common/testWorkspaceTrustService", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/terminal/browser/terminal", "vs/base/common/types", "vs/workbench/services/editor/browser/editorOverrideService", "vs/workbench/contrib/files/common/files", "vs/workbench/services/editor/common/editorOverrideService", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/files/browser/elevatedFileService", "vs/workbench/browser/parts/editor/textDiffEditor", "vs/workbench/common/editor/diffEditorInput", "vs/editor/common/services/editorWorkerService"], function (require, exports, fileEditorInput_1, instantiationServiceMock_1, resources_1, uri_1, telemetry_1, telemetryUtils_1, editor_1, event_1, workingCopyBackup_1, configuration_1, layoutService_1, textModelResolverService_1, resolverService_1, untitledTextEditorService_1, workspace_1, lifecycle_1, serviceCollection_1, files_1, modelService_1, modeServiceImpl_1, modelServiceImpl_1, textfiles_1, modeService_1, history_1, instantiation_1, testConfigurationService_1, testWorkspace_1, environment_1, themeService_1, testThemeService_1, textResourceConfigurationService_1, position_1, actions_1, contextkey_1, mockKeybindingService_1, range_1, dialogs_1, notification_1, testNotificationService_1, extensions_1, keybinding_1, decorations_1, lifecycle_2, editorGroupsService_1, editorService_1, codeEditorService_1, editor_2, dom_1, log_1, label_1, async_1, viewlet_1, storage_1, platform_1, labelService_1, buffer_1, network_1, productService_1, product_1, host_1, workingCopyService_1, filesConfigurationService_1, accessibility_1, environmentService_1, browserTextFileService_1, environmentService_2, textModel_1, pathService_1, progress_1, workingCopyFileService_1, undoRedoService_1, undoRedo_1, textFileEditorModel_1, platform_2, editorPane_1, descriptors_1, testDialogService_1, codeEditorService_2, editorPart_1, quickInput_1, quickInputService_1, listService_1, path_1, workbenchTestServices_1, uriIdentity_1, uriIdentityService_1, textFileEditorModelManager_1, inMemoryFilesystemProvider_1, stream_1, textFileService_1, encoding_1, theme_1, iterator_1, workingCopyBackupService_1, workingCopyBackupService_2, fileService_1, textResourceEditor_1, testCodeEditor_1, textFileEditor_1, resourceEditorInput_1, untitledTextEditorInput_1, sideBySideEditor_1, workspaces_1, workspaceTrust_1, testWorkspaceTrustService_1, terminal_1, terminal_2, types_1, editorOverrideService_1, files_2, editorOverrideService_2, workingCopyEditorService_1, elevatedFileService_1, elevatedFileService_2, textDiffEditor_1, diffEditorInput_1, editorWorkerService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestEditorWorkerService = exports.TestQuickInputService = exports.TestLocalTerminalService = exports.TestTerminalProfileResolverService = exports.TestTerminalInstanceService = exports.TestWorkspacesService = exports.getLastResolvedFileStat = exports.TestTextFileEditorModelManager = exports.TestPathService = exports.TestListService = exports.createEditorPart = exports.TestEditorPart = exports.TestFileEditorInput = exports.registerTestDiffEditor = exports.registerTestSideBySideEditor = exports.registerTestResourceEditor = exports.registerTestFileEditor = exports.registerTestEditor = exports.TestEditorInput = exports.TestReadonlyTextFileEditorModel = exports.TestFilesConfigurationService = exports.TestHostService = exports.productService = exports.TestInMemoryFileSystemProvider = exports.RemoteFileSystemProvider = exports.TestTextResourceConfigurationService = exports.TestWillShutdownEvent = exports.TestBeforeShutdownEvent = exports.TestLifecycleService = exports.InMemoryTestWorkingCopyBackupService = exports.toTypedWorkingCopyId = exports.toUntypedWorkingCopyId = exports.TestWorkingCopyBackupService = exports.TestFileService = exports.TestEditorService = exports.TestEditorGroupAccessor = exports.TestEditorGroupView = exports.TestEditorGroupsService = exports.TestViewsService = exports.TestPanelService = exports.TestViewletService = exports.TestLayoutService = exports.TestFileDialogService = exports.TestHistoryService = exports.TestMenuService = exports.TestDecorationsService = exports.TestAccessibilityService = exports.TestProgressService = exports.TestEnvironmentService = exports.TestProductService = exports.TestEncodingOracle = exports.TestBrowserTextFileServiceWithEncodingOverrides = exports.TestTextFileService = exports.TestServiceAccessor = exports.workbenchInstantiationService = exports.TestTextFileEditor = exports.TestTextResourceEditor = exports.createFileEditorInput = void 0;
    function createFileEditorInput(instantiationService, resource) {
        return instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, undefined, undefined, undefined, undefined, undefined);
    }
    exports.createFileEditorInput = createFileEditorInput;
    platform_2.Registry.as(editor_1.EditorExtensions.EditorInputFactories).registerFileEditorInputFactory({
        typeId: files_2.FILE_EDITOR_INPUT_ID,
        createFileEditorInput: (resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredMode, instantiationService) => {
            return instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredMode);
        },
        isFileEditorInput: (obj) => {
            return obj instanceof fileEditorInput_1.FileEditorInput;
        }
    });
    class TestTextResourceEditor extends textResourceEditor_1.TextResourceEditor {
        createEditorControl(parent, configuration) {
            return this.instantiationService.createInstance(testCodeEditor_1.TestCodeEditor, parent, configuration, {});
        }
    }
    exports.TestTextResourceEditor = TestTextResourceEditor;
    class TestTextFileEditor extends textFileEditor_1.TextFileEditor {
        createEditorControl(parent, configuration) {
            return this.instantiationService.createInstance(testCodeEditor_1.TestCodeEditor, parent, configuration, {});
        }
    }
    exports.TestTextFileEditor = TestTextFileEditor;
    function workbenchInstantiationService(overrides, disposables = new lifecycle_2.DisposableStore()) {
        const instantiationService = new instantiationServiceMock_1.TestInstantiationService(new serviceCollection_1.ServiceCollection([lifecycle_1.ILifecycleService, new TestLifecycleService()]));
        instantiationService.stub(editorWorkerService_1.IEditorWorkerService, new TestEditorWorkerService());
        instantiationService.stub(workingCopyService_1.IWorkingCopyService, disposables.add(new workingCopyService_1.WorkingCopyService()));
        instantiationService.stub(environment_1.IEnvironmentService, exports.TestEnvironmentService);
        instantiationService.stub(environmentService_2.IWorkbenchEnvironmentService, exports.TestEnvironmentService);
        const contextKeyService = (overrides === null || overrides === void 0 ? void 0 : overrides.contextKeyService) ? overrides.contextKeyService(instantiationService) : instantiationService.createInstance(mockKeybindingService_1.MockContextKeyService);
        instantiationService.stub(contextkey_1.IContextKeyService, contextKeyService);
        instantiationService.stub(progress_1.IProgressService, new TestProgressService());
        const workspaceContextService = new workbenchTestServices_1.TestContextService(testWorkspace_1.TestWorkspace);
        instantiationService.stub(workspace_1.IWorkspaceContextService, workspaceContextService);
        const configService = new testConfigurationService_1.TestConfigurationService();
        instantiationService.stub(configuration_1.IConfigurationService, configService);
        instantiationService.stub(filesConfigurationService_1.IFilesConfigurationService, disposables.add(new TestFilesConfigurationService(contextKeyService, configService)));
        instantiationService.stub(textResourceConfigurationService_1.ITextResourceConfigurationService, new TestTextResourceConfigurationService(configService));
        instantiationService.stub(untitledTextEditorService_1.IUntitledTextEditorService, disposables.add(instantiationService.createInstance(untitledTextEditorService_1.UntitledTextEditorService)));
        instantiationService.stub(storage_1.IStorageService, disposables.add(new workbenchTestServices_1.TestStorageService()));
        instantiationService.stub(pathService_1.IPathService, (overrides === null || overrides === void 0 ? void 0 : overrides.pathService) ? overrides.pathService(instantiationService) : new TestPathService());
        const layoutService = new TestLayoutService();
        instantiationService.stub(layoutService_1.IWorkbenchLayoutService, layoutService);
        instantiationService.stub(dialogs_1.IDialogService, new testDialogService_1.TestDialogService());
        const accessibilityService = new TestAccessibilityService();
        instantiationService.stub(accessibility_1.IAccessibilityService, accessibilityService);
        instantiationService.stub(dialogs_1.IFileDialogService, instantiationService.createInstance(TestFileDialogService));
        instantiationService.stub(modeService_1.IModeService, disposables.add(instantiationService.createInstance(modeServiceImpl_1.ModeServiceImpl)));
        instantiationService.stub(history_1.IHistoryService, new TestHistoryService());
        instantiationService.stub(textResourceConfigurationService_1.ITextResourcePropertiesService, new workbenchTestServices_1.TestTextResourcePropertiesService(configService));
        instantiationService.stub(undoRedo_1.IUndoRedoService, instantiationService.createInstance(undoRedoService_1.UndoRedoService));
        const themeService = new testThemeService_1.TestThemeService();
        instantiationService.stub(themeService_1.IThemeService, themeService);
        instantiationService.stub(modelService_1.IModelService, disposables.add(instantiationService.createInstance(modelServiceImpl_1.ModelServiceImpl)));
        const fileService = new TestFileService();
        instantiationService.stub(files_1.IFileService, fileService);
        instantiationService.stub(uriIdentity_1.IUriIdentityService, new uriIdentityService_1.UriIdentityService(fileService));
        instantiationService.stub(workingCopyBackup_1.IWorkingCopyBackupService, new TestWorkingCopyBackupService());
        instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
        instantiationService.stub(notification_1.INotificationService, new testNotificationService_1.TestNotificationService());
        instantiationService.stub(untitledTextEditorService_1.IUntitledTextEditorService, disposables.add(instantiationService.createInstance(untitledTextEditorService_1.UntitledTextEditorService)));
        instantiationService.stub(actions_1.IMenuService, new TestMenuService());
        const keybindingService = new mockKeybindingService_1.MockKeybindingService();
        instantiationService.stub(keybinding_1.IKeybindingService, keybindingService);
        instantiationService.stub(decorations_1.IDecorationsService, new TestDecorationsService());
        instantiationService.stub(extensions_1.IExtensionService, new workbenchTestServices_1.TestExtensionService());
        instantiationService.stub(workingCopyEditorService_1.IWorkingCopyEditorService, disposables.add(instantiationService.createInstance(workingCopyEditorService_1.WorkingCopyEditorService)));
        instantiationService.stub(workingCopyFileService_1.IWorkingCopyFileService, disposables.add(instantiationService.createInstance(workingCopyFileService_1.WorkingCopyFileService)));
        instantiationService.stub(textfiles_1.ITextFileService, (overrides === null || overrides === void 0 ? void 0 : overrides.textFileService) ? overrides.textFileService(instantiationService) : disposables.add(instantiationService.createInstance(TestTextFileService)));
        instantiationService.stub(host_1.IHostService, instantiationService.createInstance(TestHostService));
        instantiationService.stub(resolverService_1.ITextModelService, disposables.add(instantiationService.createInstance(textModelResolverService_1.TextModelResolverService)));
        instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
        const editorGroupService = new TestEditorGroupsService([new TestEditorGroupView(0)]);
        instantiationService.stub(editorGroupsService_1.IEditorGroupsService, editorGroupService);
        instantiationService.stub(label_1.ILabelService, disposables.add(instantiationService.createInstance(labelService_1.LabelService)));
        const editorService = (overrides === null || overrides === void 0 ? void 0 : overrides.editorService) ? overrides.editorService(instantiationService) : new TestEditorService(editorGroupService);
        instantiationService.stub(editorService_1.IEditorService, editorService);
        instantiationService.stub(editorOverrideService_2.IEditorOverrideService, disposables.add(instantiationService.createInstance(editorOverrideService_1.EditorOverrideService)));
        instantiationService.stub(codeEditorService_1.ICodeEditorService, disposables.add(new codeEditorService_2.CodeEditorService(editorService, themeService, configService)));
        instantiationService.stub(viewlet_1.IViewletService, new TestViewletService());
        instantiationService.stub(listService_1.IListService, new TestListService());
        instantiationService.stub(quickInput_1.IQuickInputService, disposables.add(new quickInputService_1.QuickInputService(configService, instantiationService, keybindingService, contextKeyService, themeService, accessibilityService, layoutService)));
        instantiationService.stub(workspaces_1.IWorkspacesService, new TestWorkspacesService());
        instantiationService.stub(workspaceTrust_1.IWorkspaceTrustManagementService, new testWorkspaceTrustService_1.TestWorkspaceTrustManagementService());
        instantiationService.stub(terminal_2.ITerminalInstanceService, new TestTerminalInstanceService());
        instantiationService.stub(terminal_1.ILocalTerminalService, new TestLocalTerminalService());
        instantiationService.stub(elevatedFileService_1.IElevatedFileService, new elevatedFileService_2.BrowserElevatedFileService());
        return instantiationService;
    }
    exports.workbenchInstantiationService = workbenchInstantiationService;
    let TestServiceAccessor = class TestServiceAccessor {
        constructor(lifecycleService, textFileService, workingCopyFileService, filesConfigurationService, contextService, modelService, fileService, fileDialogService, workingCopyService, editorService, editorGroupService, modeService, textModelResolverService, untitledTextEditorService, testConfigurationService, workingCopyBackupService, hostService, quickInputService, labelService, logService, uriIdentityService, instantitionService, notificationService, workingCopyEditorService, instantiationService, elevatedFileService) {
            this.lifecycleService = lifecycleService;
            this.textFileService = textFileService;
            this.workingCopyFileService = workingCopyFileService;
            this.filesConfigurationService = filesConfigurationService;
            this.contextService = contextService;
            this.modelService = modelService;
            this.fileService = fileService;
            this.fileDialogService = fileDialogService;
            this.workingCopyService = workingCopyService;
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            this.modeService = modeService;
            this.textModelResolverService = textModelResolverService;
            this.untitledTextEditorService = untitledTextEditorService;
            this.testConfigurationService = testConfigurationService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.hostService = hostService;
            this.quickInputService = quickInputService;
            this.labelService = labelService;
            this.logService = logService;
            this.uriIdentityService = uriIdentityService;
            this.instantitionService = instantitionService;
            this.notificationService = notificationService;
            this.workingCopyEditorService = workingCopyEditorService;
            this.instantiationService = instantiationService;
            this.elevatedFileService = elevatedFileService;
        }
    };
    TestServiceAccessor = __decorate([
        __param(0, lifecycle_1.ILifecycleService),
        __param(1, textfiles_1.ITextFileService),
        __param(2, workingCopyFileService_1.IWorkingCopyFileService),
        __param(3, filesConfigurationService_1.IFilesConfigurationService),
        __param(4, workspace_1.IWorkspaceContextService),
        __param(5, modelService_1.IModelService),
        __param(6, files_1.IFileService),
        __param(7, dialogs_1.IFileDialogService),
        __param(8, workingCopyService_1.IWorkingCopyService),
        __param(9, editorService_1.IEditorService),
        __param(10, editorGroupsService_1.IEditorGroupsService),
        __param(11, modeService_1.IModeService),
        __param(12, resolverService_1.ITextModelService),
        __param(13, untitledTextEditorService_1.IUntitledTextEditorService),
        __param(14, configuration_1.IConfigurationService),
        __param(15, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(16, host_1.IHostService),
        __param(17, quickInput_1.IQuickInputService),
        __param(18, label_1.ILabelService),
        __param(19, log_1.ILogService),
        __param(20, uriIdentity_1.IUriIdentityService),
        __param(21, instantiation_1.IInstantiationService),
        __param(22, notification_1.INotificationService),
        __param(23, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(24, instantiation_1.IInstantiationService),
        __param(25, elevatedFileService_1.IElevatedFileService)
    ], TestServiceAccessor);
    exports.TestServiceAccessor = TestServiceAccessor;
    let TestTextFileService = class TestTextFileService extends browserTextFileService_1.BrowserTextFileService {
        constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, productService, filesConfigurationService, textModelService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, modeService, logService, elevatedFileService) {
            super(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, textModelService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, modeService, logService, elevatedFileService);
            this.readStreamError = undefined;
            this.writeError = undefined;
        }
        setReadStreamErrorOnce(error) {
            this.readStreamError = error;
        }
        async readStream(resource, options) {
            if (this.readStreamError) {
                const error = this.readStreamError;
                this.readStreamError = undefined;
                throw error;
            }
            const content = await this.fileService.readFileStream(resource, options);
            return {
                resource: content.resource,
                name: content.name,
                mtime: content.mtime,
                ctime: content.ctime,
                etag: content.etag,
                encoding: 'utf8',
                value: await (0, textModel_1.createTextBufferFactoryFromStream)(content.value),
                size: 10
            };
        }
        setWriteErrorOnce(error) {
            this.writeError = error;
        }
        async write(resource, value, options) {
            if (this.writeError) {
                const error = this.writeError;
                this.writeError = undefined;
                throw error;
            }
            return super.write(resource, value, options);
        }
    };
    TestTextFileService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, untitledTextEditorService_1.IUntitledTextEditorService),
        __param(2, lifecycle_1.ILifecycleService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, modelService_1.IModelService),
        __param(5, environmentService_2.IWorkbenchEnvironmentService),
        __param(6, dialogs_1.IDialogService),
        __param(7, dialogs_1.IFileDialogService),
        __param(8, textResourceConfigurationService_1.ITextResourceConfigurationService),
        __param(9, productService_1.IProductService),
        __param(10, filesConfigurationService_1.IFilesConfigurationService),
        __param(11, resolverService_1.ITextModelService),
        __param(12, codeEditorService_1.ICodeEditorService),
        __param(13, pathService_1.IPathService),
        __param(14, workingCopyFileService_1.IWorkingCopyFileService),
        __param(15, uriIdentity_1.IUriIdentityService),
        __param(16, modeService_1.IModeService),
        __param(17, log_1.ILogService),
        __param(18, elevatedFileService_1.IElevatedFileService)
    ], TestTextFileService);
    exports.TestTextFileService = TestTextFileService;
    class TestBrowserTextFileServiceWithEncodingOverrides extends browserTextFileService_1.BrowserTextFileService {
        get encoding() {
            if (!this._testEncoding) {
                this._testEncoding = this._register(this.instantiationService.createInstance(TestEncodingOracle));
            }
            return this._testEncoding;
        }
    }
    exports.TestBrowserTextFileServiceWithEncodingOverrides = TestBrowserTextFileServiceWithEncodingOverrides;
    class TestEncodingOracle extends textFileService_1.EncodingOracle {
        get encodingOverrides() {
            return [
                { extension: 'utf16le', encoding: encoding_1.UTF16le },
                { extension: 'utf16be', encoding: encoding_1.UTF16be },
                { extension: 'utf8bom', encoding: encoding_1.UTF8_with_bom }
            ];
        }
        set encodingOverrides(overrides) { }
    }
    exports.TestEncodingOracle = TestEncodingOracle;
    class TestEnvironmentServiceWithArgs extends environmentService_1.BrowserWorkbenchEnvironmentService {
        constructor() {
            super(...arguments);
            this.args = [];
        }
    }
    exports.TestProductService = Object.assign({ _serviceBrand: undefined }, product_1.default);
    exports.TestEnvironmentService = new TestEnvironmentServiceWithArgs(Object.create(null), exports.TestProductService);
    class TestProgressService {
        withProgress(options, task, onDidCancel) {
            return task(progress_1.Progress.None);
        }
    }
    exports.TestProgressService = TestProgressService;
    class TestAccessibilityService {
        constructor() {
            this.onDidChangeScreenReaderOptimized = event_1.Event.None;
        }
        isScreenReaderOptimized() { return false; }
        alwaysUnderlineAccessKeys() { return Promise.resolve(false); }
        setAccessibilitySupport(accessibilitySupport) { }
        getAccessibilitySupport() { return 0 /* Unknown */; }
    }
    exports.TestAccessibilityService = TestAccessibilityService;
    class TestDecorationsService {
        constructor() {
            this.onDidChangeDecorations = event_1.Event.None;
        }
        registerDecorationsProvider(_provider) { return lifecycle_2.Disposable.None; }
        getDecoration(_uri, _includeChildren, _overwrite) { return undefined; }
    }
    exports.TestDecorationsService = TestDecorationsService;
    class TestMenuService {
        createMenu(_id, _scopedKeybindingService) {
            return {
                onDidChange: event_1.Event.None,
                dispose: () => undefined,
                getActions: () => []
            };
        }
    }
    exports.TestMenuService = TestMenuService;
    class TestHistoryService {
        constructor(root) {
            this.root = root;
        }
        reopenLastClosedEditor() { }
        forward() { }
        back() { }
        last() { }
        removeFromHistory(_input) { }
        clear() { }
        clearRecentlyOpened() { }
        getHistory() { return []; }
        openNextRecentlyUsedEditor(group) { }
        openPreviouslyUsedEditor(group) { }
        getLastActiveWorkspaceRoot(_schemeFilter) { return this.root; }
        getLastActiveFile(_schemeFilter) { return undefined; }
        openLastEditLocation() { }
    }
    exports.TestHistoryService = TestHistoryService;
    let TestFileDialogService = class TestFileDialogService {
        constructor(pathService) {
            this.pathService = pathService;
        }
        async defaultFilePath(_schemeFilter) { return this.pathService.userHome(); }
        async defaultFolderPath(_schemeFilter) { return this.pathService.userHome(); }
        async defaultWorkspacePath(_schemeFilter) { return this.pathService.userHome(); }
        pickFileFolderAndOpen(_options) { return Promise.resolve(0); }
        pickFileAndOpen(_options) { return Promise.resolve(0); }
        pickFolderAndOpen(_options) { return Promise.resolve(0); }
        pickWorkspaceAndOpen(_options) { return Promise.resolve(0); }
        setPickFileToSave(path) { this.fileToSave = path; }
        pickFileToSave(defaultUri, availableFileSystems) { return Promise.resolve(this.fileToSave); }
        showSaveDialog(_options) { return Promise.resolve(undefined); }
        showOpenDialog(_options) { return Promise.resolve(undefined); }
        setConfirmResult(result) { this.confirmResult = result; }
        showSaveConfirm(fileNamesOrResources) { return Promise.resolve(this.confirmResult); }
    };
    TestFileDialogService = __decorate([
        __param(0, pathService_1.IPathService)
    ], TestFileDialogService);
    exports.TestFileDialogService = TestFileDialogService;
    class TestLayoutService {
        constructor() {
            this.openedDefaultEditors = false;
            this.dimension = { width: 800, height: 600 };
            this.container = window.document.body;
            this.onDidChangeZenMode = event_1.Event.None;
            this.onDidChangeCenteredLayout = event_1.Event.None;
            this.onDidChangeFullscreen = event_1.Event.None;
            this.onDidChangeWindowMaximized = event_1.Event.None;
            this.onDidChangePanelPosition = event_1.Event.None;
            this.onDidChangePartVisibility = event_1.Event.None;
            this.onDidLayout = event_1.Event.None;
            this.onDidChangeNotificationsVisibility = event_1.Event.None;
            this.whenReady = Promise.resolve(undefined);
            this.whenRestored = Promise.resolve(undefined);
        }
        layout() { }
        isRestored() { return true; }
        hasFocus(_part) { return false; }
        focusPart(_part) { }
        hasWindowBorder() { return false; }
        getWindowBorderWidth() { return 0; }
        getWindowBorderRadius() { return undefined; }
        isVisible(_part) { return true; }
        getDimension(_part) { return new dom_1.Dimension(0, 0); }
        getContainer(_part) { return null; }
        isTitleBarHidden() { return false; }
        isStatusBarHidden() { return false; }
        isActivityBarHidden() { return false; }
        setActivityBarHidden(_hidden) { }
        isSideBarHidden() { return false; }
        async setEditorHidden(_hidden) { }
        async setSideBarHidden(_hidden) { }
        isPanelHidden() { return false; }
        async setPanelHidden(_hidden) { }
        toggleMaximizedPanel() { }
        isPanelMaximized() { return false; }
        getMenubarVisibility() { throw new Error('not implemented'); }
        toggleMenuBar() { }
        getSideBarPosition() { return 0; }
        getPanelPosition() { return 0; }
        async setPanelPosition(_position) { }
        addClass(_clazz) { }
        removeClass(_clazz) { }
        getMaximumEditorDimensions() { throw new Error('not implemented'); }
        toggleZenMode() { }
        isEditorLayoutCentered() { return false; }
        centerEditorLayout(_active) { }
        resizePart(_part, _sizeChangeWidth, _sizeChangeHeight) { }
        registerPart(part) { }
        isWindowMaximized() { return false; }
        updateWindowMaximizedState(maximized) { }
        getVisibleNeighborPart(part, direction) { return undefined; }
        focus() { }
    }
    exports.TestLayoutService = TestLayoutService;
    let activeViewlet = {};
    class TestViewletService {
        constructor() {
            this.onDidViewletRegisterEmitter = new event_1.Emitter();
            this.onDidViewletDeregisterEmitter = new event_1.Emitter();
            this.onDidViewletOpenEmitter = new event_1.Emitter();
            this.onDidViewletCloseEmitter = new event_1.Emitter();
            this.onDidViewletRegister = this.onDidViewletRegisterEmitter.event;
            this.onDidViewletDeregister = this.onDidViewletDeregisterEmitter.event;
            this.onDidViewletOpen = this.onDidViewletOpenEmitter.event;
            this.onDidViewletClose = this.onDidViewletCloseEmitter.event;
        }
        openViewlet(id, focus) { return Promise.resolve(undefined); }
        getViewlets() { return []; }
        getAllViewlets() { return []; }
        getActiveViewlet() { return activeViewlet; }
        getDefaultViewletId() { return 'workbench.view.explorer'; }
        getViewlet(id) { return undefined; }
        getProgressIndicator(id) { return undefined; }
        hideActiveViewlet() { }
        getLastActiveViewletId() { return undefined; }
        dispose() { }
    }
    exports.TestViewletService = TestViewletService;
    class TestPanelService {
        constructor() {
            this.onDidPanelOpen = new event_1.Emitter().event;
            this.onDidPanelClose = new event_1.Emitter().event;
        }
        async openPanel(id, focus) { return undefined; }
        getPanel(id) { return activeViewlet; }
        getPanels() { return []; }
        getPinnedPanels() { return []; }
        getActivePanel() { return activeViewlet; }
        setPanelEnablement(id, enabled) { }
        dispose() { }
        showActivity(panelId, badge, clazz) { throw new Error('Method not implemented.'); }
        getProgressIndicator(id) { return null; }
        hideActivePanel() { }
        getLastActivePanelId() { return undefined; }
    }
    exports.TestPanelService = TestPanelService;
    class TestViewsService {
        constructor() {
            this.onDidChangeViewContainerVisibility = new event_1.Emitter().event;
            this.onDidChangeViewVisibilityEmitter = new event_1.Emitter();
            this.onDidChangeViewVisibility = this.onDidChangeViewVisibilityEmitter.event;
        }
        isViewContainerVisible(id) { return true; }
        getVisibleViewContainer() { return null; }
        openViewContainer(id, focus) { return Promise.resolve(null); }
        closeViewContainer(id) { }
        isViewVisible(id) { return true; }
        getActiveViewWithId(id) { return null; }
        getViewWithId(id) { return null; }
        openView(id, focus) { return Promise.resolve(null); }
        closeView(id) { }
        getViewProgressIndicator(id) { return null; }
        getActiveViewPaneContainerWithId(id) { return null; }
    }
    exports.TestViewsService = TestViewsService;
    class TestEditorGroupsService {
        constructor(groups = []) {
            this.groups = groups;
            this.onDidChangeActiveGroup = event_1.Event.None;
            this.onDidActivateGroup = event_1.Event.None;
            this.onDidAddGroup = event_1.Event.None;
            this.onDidRemoveGroup = event_1.Event.None;
            this.onDidMoveGroup = event_1.Event.None;
            this.onDidChangeGroupIndex = event_1.Event.None;
            this.onDidLayout = event_1.Event.None;
            this.onDidChangeEditorPartOptions = event_1.Event.None;
            this.orientation = 0 /* HORIZONTAL */;
            this.whenReady = Promise.resolve(undefined);
            this.whenRestored = Promise.resolve(undefined);
            this.hasRestorableState = false;
            this.contentDimension = { width: 800, height: 600 };
        }
        get activeGroup() { return this.groups[0]; }
        get count() { return this.groups.length; }
        isRestored() { return true; }
        getGroups(_order) { return this.groups; }
        getGroup(identifier) { return this.groups.find(group => group.id === identifier); }
        getLabel(_identifier) { return 'Group 1'; }
        findGroup(_scope, _source, _wrap) { throw new Error('not implemented'); }
        activateGroup(_group) { throw new Error('not implemented'); }
        restoreGroup(_group) { throw new Error('not implemented'); }
        getSize(_group) { return { width: 100, height: 100 }; }
        setSize(_group, _size) { }
        arrangeGroups(_arrangement) { }
        applyLayout(_layout) { }
        setGroupOrientation(_orientation) { }
        addGroup(_location, _direction, _options) { throw new Error('not implemented'); }
        removeGroup(_group) { }
        moveGroup(_group, _location, _direction) { throw new Error('not implemented'); }
        mergeGroup(_group, _target, _options) { throw new Error('not implemented'); }
        mergeAllGroups() { throw new Error('not implemented'); }
        copyGroup(_group, _location, _direction) { throw new Error('not implemented'); }
        centerLayout(active) { }
        isLayoutCentered() { return false; }
        enforcePartOptions(options) { return lifecycle_2.Disposable.None; }
    }
    exports.TestEditorGroupsService = TestEditorGroupsService;
    class TestEditorGroupView {
        constructor(id) {
            this.id = id;
            this.editors = [];
            this.whenRestored = Promise.resolve(undefined);
            this.isEmpty = true;
            this.isMinimized = false;
            this.onWillDispose = event_1.Event.None;
            this.onDidGroupChange = event_1.Event.None;
            this.onWillCloseEditor = event_1.Event.None;
            this.onDidCloseEditor = event_1.Event.None;
            this.onDidOpenEditorFail = event_1.Event.None;
            this.onDidFocus = event_1.Event.None;
            this.onDidChange = event_1.Event.None;
            this.onWillMoveEditor = event_1.Event.None;
        }
        getEditors(_order) { return []; }
        findEditors(_resource) { return []; }
        getEditorByIndex(_index) { throw new Error('not implemented'); }
        getIndexOfEditor(_editor) { return -1; }
        openEditor(_editor, _options) { throw new Error('not implemented'); }
        openEditors(_editors) { throw new Error('not implemented'); }
        isPinned(_editor) { return false; }
        isSticky(_editor) { return false; }
        isActive(_editor) { return false; }
        contains(candidate) { return false; }
        moveEditor(_editor, _target, _options) { }
        copyEditor(_editor, _target, _options) { }
        async closeEditor(_editor, options) { }
        async closeEditors(_editors, options) { }
        async closeAllEditors(options) { }
        async replaceEditors(_editors) { }
        pinEditor(_editor) { }
        stickEditor(editor) { }
        unstickEditor(editor) { }
        focus() { }
        get scopedContextKeyService() { throw new Error('not implemented'); }
        setActive(_isActive) { }
        notifyIndexChanged(_index) { }
        dispose() { }
        toJSON() { return Object.create(null); }
        layout(_width, _height) { }
        relayout() { }
    }
    exports.TestEditorGroupView = TestEditorGroupView;
    class TestEditorGroupAccessor {
        constructor() {
            this.groups = [];
            this.partOptions = {};
            this.onDidChangeEditorPartOptions = event_1.Event.None;
            this.onDidVisibilityChange = event_1.Event.None;
        }
        getGroup(identifier) { throw new Error('Method not implemented.'); }
        getGroups(order) { throw new Error('Method not implemented.'); }
        activateGroup(identifier) { throw new Error('Method not implemented.'); }
        restoreGroup(identifier) { throw new Error('Method not implemented.'); }
        addGroup(location, direction, options) { throw new Error('Method not implemented.'); }
        mergeGroup(group, target, options) { throw new Error('Method not implemented.'); }
        moveGroup(group, location, direction) { throw new Error('Method not implemented.'); }
        copyGroup(group, location, direction) { throw new Error('Method not implemented.'); }
        removeGroup(group) { throw new Error('Method not implemented.'); }
        arrangeGroups(arrangement, target) { throw new Error('Method not implemented.'); }
    }
    exports.TestEditorGroupAccessor = TestEditorGroupAccessor;
    class TestEditorService {
        constructor(editorGroupService) {
            this.editorGroupService = editorGroupService;
            this.onDidActiveEditorChange = event_1.Event.None;
            this.onDidVisibleEditorsChange = event_1.Event.None;
            this.onDidCloseEditor = event_1.Event.None;
            this.onDidOpenEditorFail = event_1.Event.None;
            this.onDidMostRecentlyActiveEditorsChange = event_1.Event.None;
            this.editors = [];
            this.mostRecentlyActiveEditors = [];
            this.visibleEditorPanes = [];
            this.visibleTextEditorControls = [];
            this.visibleEditors = [];
            this.count = this.editors.length;
        }
        get activeTextEditorControl() { return this._activeTextEditorControl; }
        set activeTextEditorControl(value) { this._activeTextEditorControl = value; }
        get activeEditor() { return this._activeEditor; }
        set activeEditor(value) { this._activeEditor = value; }
        getEditors() { return []; }
        findEditors() { return []; }
        getEditorOverrides(resource, options, group) { return []; }
        overrideOpenEditor(_handler) { return (0, lifecycle_2.toDisposable)(() => undefined); }
        async openEditor(editor, optionsOrGroup, group) {
            throw new Error('not implemented');
        }
        doResolveEditorOpenRequest(editor) {
            if (!this.editorGroupService) {
                return undefined;
            }
            return [this.editorGroupService.activeGroup, editor, undefined];
        }
        openEditors(_editors, _group) { throw new Error('not implemented'); }
        isOpened(_editor) { return false; }
        replaceEditors(_editors, _group) { return Promise.resolve(undefined); }
        createEditorInput(_input) { throw new Error('not implemented'); }
        save(editors, options) { throw new Error('Method not implemented.'); }
        saveAll(options) { throw new Error('Method not implemented.'); }
        revert(editors, options) { throw new Error('Method not implemented.'); }
        revertAll(options) { throw new Error('Method not implemented.'); }
    }
    exports.TestEditorService = TestEditorService;
    class TestFileService {
        constructor() {
            this._onDidFilesChange = new event_1.Emitter();
            this._onDidRunOperation = new event_1.Emitter();
            this.onWillActivateFileSystemProvider = event_1.Event.None;
            this.onDidChangeFileSystemProviderCapabilities = event_1.Event.None;
            this.onError = event_1.Event.None;
            this.content = 'Hello Html';
            this.notExistsSet = new Set();
            this.readShouldThrowError = undefined;
            this.writeShouldThrowError = undefined;
            this.onDidChangeFileSystemProviderRegistrations = event_1.Event.None;
            this.providers = new Map();
            this.watches = [];
        }
        setContent(content) { this.content = content; }
        getContent() { return this.content; }
        getLastReadFileUri() { return this.lastReadFileUri; }
        get onDidFilesChange() { return this._onDidFilesChange.event; }
        fireFileChanges(event) { this._onDidFilesChange.fire(event); }
        get onDidRunOperation() { return this._onDidRunOperation.event; }
        fireAfterOperation(event) { this._onDidRunOperation.fire(event); }
        resolve(resource, _options) {
            return Promise.resolve({
                resource,
                etag: Date.now().toString(),
                encoding: 'utf8',
                mtime: Date.now(),
                size: 42,
                isFile: true,
                isDirectory: false,
                isSymbolicLink: false,
                name: (0, resources_1.basename)(resource)
            });
        }
        async resolveAll(toResolve) {
            const stats = await Promise.all(toResolve.map(resourceAndOption => this.resolve(resourceAndOption.resource, resourceAndOption.options)));
            return stats.map(stat => ({ stat, success: true }));
        }
        async exists(_resource) { return !this.notExistsSet.has(_resource); }
        readFile(resource, options) {
            if (this.readShouldThrowError) {
                throw this.readShouldThrowError;
            }
            this.lastReadFileUri = resource;
            return Promise.resolve({
                resource: resource,
                value: buffer_1.VSBuffer.fromString(this.content),
                etag: 'index.txt',
                encoding: 'utf8',
                mtime: Date.now(),
                ctime: Date.now(),
                name: (0, resources_1.basename)(resource),
                size: 1
            });
        }
        readFileStream(resource, options) {
            if (this.readShouldThrowError) {
                throw this.readShouldThrowError;
            }
            this.lastReadFileUri = resource;
            return Promise.resolve({
                resource,
                value: (0, buffer_1.bufferToStream)(buffer_1.VSBuffer.fromString(this.content)),
                etag: 'index.txt',
                encoding: 'utf8',
                mtime: Date.now(),
                ctime: Date.now(),
                size: 1,
                name: (0, resources_1.basename)(resource)
            });
        }
        async writeFile(resource, bufferOrReadable, options) {
            await (0, async_1.timeout)(0);
            if (this.writeShouldThrowError) {
                throw this.writeShouldThrowError;
            }
            return ({
                resource,
                etag: 'index.txt',
                mtime: Date.now(),
                ctime: Date.now(),
                size: 42,
                isFile: true,
                isDirectory: false,
                isSymbolicLink: false,
                name: (0, resources_1.basename)(resource)
            });
        }
        move(_source, _target, _overwrite) { return Promise.resolve(null); }
        copy(_source, _target, _overwrite) { return Promise.resolve(null); }
        createFile(_resource, _content, _options) { return Promise.resolve(null); }
        createFolder(_resource) { return Promise.resolve(null); }
        registerProvider(scheme, provider) {
            this.providers.set(scheme, provider);
            return (0, lifecycle_2.toDisposable)(() => this.providers.delete(scheme));
        }
        getProvider(scheme) {
            return this.providers.get(scheme);
        }
        activateProvider(_scheme) { throw new Error('not implemented'); }
        canHandleResource(resource) { return resource.scheme === network_1.Schemas.file || this.providers.has(resource.scheme); }
        listCapabilities() {
            return [
                { scheme: network_1.Schemas.file, capabilities: 4 /* FileOpenReadWriteClose */ },
                ...iterator_1.Iterable.map(this.providers, ([scheme, p]) => { return { scheme, capabilities: p.capabilities }; })
            ];
        }
        hasCapability(resource, capability) {
            if (capability === 1024 /* PathCaseSensitive */ && platform_1.isLinux) {
                return true;
            }
            return false;
        }
        async del(_resource, _options) { }
        watch(_resource) {
            this.watches.push(_resource);
            return (0, lifecycle_2.toDisposable)(() => this.watches.splice(this.watches.indexOf(_resource), 1));
        }
        getWriteEncoding(_resource) { return { encoding: 'utf8', hasBOM: false }; }
        dispose() { }
        async canCreateFile(source, options) { return true; }
        async canMove(source, target, overwrite) { return true; }
        async canCopy(source, target, overwrite) { return true; }
        async canDelete(resource, options) { return true; }
    }
    exports.TestFileService = TestFileService;
    class TestWorkingCopyBackupService extends workingCopyBackupService_1.InMemoryWorkingCopyBackupService {
        constructor() {
            super();
        }
        parseBackupContent(textBufferFactory) {
            const textBuffer = textBufferFactory.create(1 /* LF */).textBuffer;
            const lineCount = textBuffer.getLineCount();
            const range = new range_1.Range(1, 1, lineCount, textBuffer.getLineLength(lineCount) + 1);
            return textBuffer.getValueInRange(range, 0 /* TextDefined */);
        }
    }
    exports.TestWorkingCopyBackupService = TestWorkingCopyBackupService;
    function toUntypedWorkingCopyId(resource) {
        return toTypedWorkingCopyId(resource, '');
    }
    exports.toUntypedWorkingCopyId = toUntypedWorkingCopyId;
    function toTypedWorkingCopyId(resource, typeId = 'testBackupTypeId') {
        return { typeId, resource };
    }
    exports.toTypedWorkingCopyId = toTypedWorkingCopyId;
    class InMemoryTestWorkingCopyBackupService extends workingCopyBackupService_2.BrowserWorkingCopyBackupService {
        constructor() {
            const environmentService = exports.TestEnvironmentService;
            const logService = new log_1.NullLogService();
            const fileService = new fileService_1.FileService(logService);
            fileService.registerProvider(network_1.Schemas.file, new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            fileService.registerProvider(network_1.Schemas.userData, new inMemoryFilesystemProvider_1.InMemoryFileSystemProvider());
            super(new workbenchTestServices_1.TestContextService(testWorkspace_1.TestWorkspace), environmentService, fileService, logService);
            this.fileService = fileService;
            this.backupResourceJoiners = [];
            this.discardBackupJoiners = [];
            this.discardedBackups = [];
        }
        joinBackupResource() {
            return new Promise(resolve => this.backupResourceJoiners.push(resolve));
        }
        joinDiscardBackup() {
            return new Promise(resolve => this.discardBackupJoiners.push(resolve));
        }
        async backup(identifier, content, versionId, meta, token) {
            await super.backup(identifier, content, versionId, meta, token);
            while (this.backupResourceJoiners.length) {
                this.backupResourceJoiners.pop()();
            }
        }
        async discardBackup(identifier) {
            await super.discardBackup(identifier);
            this.discardedBackups.push(identifier);
            while (this.discardBackupJoiners.length) {
                this.discardBackupJoiners.pop()();
            }
        }
        async getBackupContents(identifier) {
            const backupResource = this.toBackupResource(identifier);
            const fileContents = await this.fileService.readFile(backupResource);
            return fileContents.value.toString();
        }
    }
    exports.InMemoryTestWorkingCopyBackupService = InMemoryTestWorkingCopyBackupService;
    class TestLifecycleService {
        constructor() {
            this._onBeforeShutdown = new event_1.Emitter();
            this._onWillShutdown = new event_1.Emitter();
            this._onShutdown = new event_1.Emitter();
            this.shutdownJoiners = [];
        }
        get onBeforeShutdown() { return this._onBeforeShutdown.event; }
        get onWillShutdown() { return this._onWillShutdown.event; }
        get onDidShutdown() { return this._onShutdown.event; }
        async when() { }
        fireShutdown(reason = 2 /* QUIT */) {
            this.shutdownJoiners = [];
            this._onWillShutdown.fire({
                join: p => {
                    this.shutdownJoiners.push(p);
                },
                reason
            });
        }
        fireBeforeShutdown(event) { this._onBeforeShutdown.fire(event); }
        fireWillShutdown(event) { this._onWillShutdown.fire(event); }
        shutdown() {
            this.fireShutdown();
        }
    }
    exports.TestLifecycleService = TestLifecycleService;
    class TestBeforeShutdownEvent {
        constructor() {
            this.reason = 1 /* CLOSE */;
        }
        veto(value) {
            this.value = value;
        }
    }
    exports.TestBeforeShutdownEvent = TestBeforeShutdownEvent;
    class TestWillShutdownEvent {
        constructor() {
            this.value = [];
            this.reason = 1 /* CLOSE */;
        }
        join(promise, id) {
            this.value.push(promise);
        }
    }
    exports.TestWillShutdownEvent = TestWillShutdownEvent;
    class TestTextResourceConfigurationService {
        constructor(configurationService = new testConfigurationService_1.TestConfigurationService()) {
            this.configurationService = configurationService;
        }
        onDidChangeConfiguration() {
            return { dispose() { } };
        }
        getValue(resource, arg2, arg3) {
            const position = position_1.Position.isIPosition(arg2) ? arg2 : null;
            const section = position ? (typeof arg3 === 'string' ? arg3 : undefined) : (typeof arg2 === 'string' ? arg2 : undefined);
            return this.configurationService.getValue(section, { resource });
        }
        updateValue(resource, key, value, configurationTarget) {
            return this.configurationService.updateValue(key, value);
        }
    }
    exports.TestTextResourceConfigurationService = TestTextResourceConfigurationService;
    class RemoteFileSystemProvider {
        constructor(diskFileSystemProvider, remoteAuthority) {
            this.diskFileSystemProvider = diskFileSystemProvider;
            this.remoteAuthority = remoteAuthority;
            this.capabilities = this.diskFileSystemProvider.capabilities;
            this.onDidChangeCapabilities = this.diskFileSystemProvider.onDidChangeCapabilities;
            this.onDidChangeFile = event_1.Event.map(this.diskFileSystemProvider.onDidChangeFile, changes => changes.map((c) => {
                return {
                    type: c.type,
                    resource: c.resource.with({ scheme: network_1.Schemas.vscodeRemote, authority: this.remoteAuthority }),
                };
            }));
        }
        watch(resource, opts) { return this.diskFileSystemProvider.watch(this.toFileResource(resource), opts); }
        stat(resource) { return this.diskFileSystemProvider.stat(this.toFileResource(resource)); }
        mkdir(resource) { return this.diskFileSystemProvider.mkdir(this.toFileResource(resource)); }
        readdir(resource) { return this.diskFileSystemProvider.readdir(this.toFileResource(resource)); }
        delete(resource, opts) { return this.diskFileSystemProvider.delete(this.toFileResource(resource), opts); }
        rename(from, to, opts) { return this.diskFileSystemProvider.rename(this.toFileResource(from), this.toFileResource(to), opts); }
        copy(from, to, opts) { return this.diskFileSystemProvider.copy(this.toFileResource(from), this.toFileResource(to), opts); }
        readFile(resource) { return this.diskFileSystemProvider.readFile(this.toFileResource(resource)); }
        writeFile(resource, content, opts) { return this.diskFileSystemProvider.writeFile(this.toFileResource(resource), content, opts); }
        open(resource, opts) { return this.diskFileSystemProvider.open(this.toFileResource(resource), opts); }
        close(fd) { return this.diskFileSystemProvider.close(fd); }
        read(fd, pos, data, offset, length) { return this.diskFileSystemProvider.read(fd, pos, data, offset, length); }
        write(fd, pos, data, offset, length) { return this.diskFileSystemProvider.write(fd, pos, data, offset, length); }
        readFileStream(resource, opts, token) { return this.diskFileSystemProvider.readFileStream(this.toFileResource(resource), opts, token); }
        toFileResource(resource) { return resource.with({ scheme: network_1.Schemas.file, authority: '' }); }
    }
    exports.RemoteFileSystemProvider = RemoteFileSystemProvider;
    class TestInMemoryFileSystemProvider extends inMemoryFilesystemProvider_1.InMemoryFileSystemProvider {
        constructor() {
            super(...arguments);
            this.capabilities = 2 /* FileReadWrite */
                | 1024 /* PathCaseSensitive */
                | 16 /* FileReadStream */;
        }
        readFileStream(resource) {
            const BUFFER_SIZE = 64 * 1024;
            const stream = (0, stream_1.newWriteableStream)(data => buffer_1.VSBuffer.concat(data.map(data => buffer_1.VSBuffer.wrap(data))).buffer);
            (async () => {
                try {
                    const data = await this.readFile(resource);
                    let offset = 0;
                    while (offset < data.length) {
                        await (0, async_1.timeout)(0);
                        await stream.write(data.subarray(offset, offset + BUFFER_SIZE));
                        offset += BUFFER_SIZE;
                    }
                    await (0, async_1.timeout)(0);
                    stream.end();
                }
                catch (error) {
                    stream.end(error);
                }
            })();
            return stream;
        }
    }
    exports.TestInMemoryFileSystemProvider = TestInMemoryFileSystemProvider;
    exports.productService = Object.assign({ _serviceBrand: undefined }, product_1.default);
    class TestHostService {
        constructor() {
            this._hasFocus = true;
            this._onDidChangeFocus = new event_1.Emitter();
            this.onDidChangeFocus = this._onDidChangeFocus.event;
            this.colorScheme = theme_1.ColorScheme.DARK;
            this.onDidChangeColorScheme = event_1.Event.None;
        }
        get hasFocus() { return this._hasFocus; }
        async hadLastFocus() { return this._hasFocus; }
        setFocus(focus) {
            this._hasFocus = focus;
            this._onDidChangeFocus.fire(this._hasFocus);
        }
        async restart() { }
        async reload() { }
        async close() { }
        async focus(options) { }
        async openWindow(arg1, arg2) { }
        async toggleFullScreen() { }
    }
    exports.TestHostService = TestHostService;
    class TestFilesConfigurationService extends filesConfigurationService_1.FilesConfigurationService {
        onFilesConfigurationChange(configuration) {
            super.onFilesConfigurationChange(configuration);
        }
    }
    exports.TestFilesConfigurationService = TestFilesConfigurationService;
    class TestReadonlyTextFileEditorModel extends textFileEditorModel_1.TextFileEditorModel {
        isReadonly() {
            return true;
        }
    }
    exports.TestReadonlyTextFileEditorModel = TestReadonlyTextFileEditorModel;
    class TestEditorInput extends editor_1.EditorInput {
        constructor(resource, _typeId) {
            super();
            this.resource = resource;
            this._typeId = _typeId;
        }
        get typeId() {
            return this._typeId;
        }
        resolve() {
            return Promise.resolve(null);
        }
    }
    exports.TestEditorInput = TestEditorInput;
    function registerTestEditor(id, inputs, serializerInputId) {
        class TestEditor extends editorPane_1.EditorPane {
            constructor() {
                super(id, telemetryUtils_1.NullTelemetryService, new testThemeService_1.TestThemeService(), new workbenchTestServices_1.TestStorageService());
                this._scopedContextKeyService = new mockKeybindingService_1.MockContextKeyService();
            }
            async setInput(input, options, context, token) {
                super.setInput(input, options, context, token);
                await input.resolve();
            }
            getId() { return id; }
            layout() { }
            createEditor() { }
            get scopedContextKeyService() {
                return this._scopedContextKeyService;
            }
        }
        const disposables = new lifecycle_2.DisposableStore();
        disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.Editors).registerEditor(editor_2.EditorDescriptor.create(TestEditor, id, 'Test Editor Control'), inputs));
        if (serializerInputId) {
            class EditorsObserverTestEditorInputSerializer {
                canSerialize(editorInput) {
                    return true;
                }
                serialize(editorInput) {
                    let testEditorInput = editorInput;
                    let testInput = {
                        resource: testEditorInput.resource.toString()
                    };
                    return JSON.stringify(testInput);
                }
                deserialize(instantiationService, serializedEditorInput) {
                    let testInput = JSON.parse(serializedEditorInput);
                    return new TestFileEditorInput(uri_1.URI.parse(testInput.resource), serializerInputId);
                }
            }
            disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(serializerInputId, EditorsObserverTestEditorInputSerializer));
        }
        return disposables;
    }
    exports.registerTestEditor = registerTestEditor;
    function registerTestFileEditor() {
        const disposables = new lifecycle_2.DisposableStore();
        disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.Editors).registerEditor(editor_2.EditorDescriptor.create(TestTextFileEditor, TestTextFileEditor.ID, 'Text File Editor'), [new descriptors_1.SyncDescriptor(fileEditorInput_1.FileEditorInput)]));
        return disposables;
    }
    exports.registerTestFileEditor = registerTestFileEditor;
    function registerTestResourceEditor() {
        const disposables = new lifecycle_2.DisposableStore();
        disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.Editors).registerEditor(editor_2.EditorDescriptor.create(TestTextResourceEditor, TestTextResourceEditor.ID, 'Text Editor'), [
            new descriptors_1.SyncDescriptor(untitledTextEditorInput_1.UntitledTextEditorInput),
            new descriptors_1.SyncDescriptor(resourceEditorInput_1.ResourceEditorInput)
        ]));
        return disposables;
    }
    exports.registerTestResourceEditor = registerTestResourceEditor;
    function registerTestSideBySideEditor() {
        const disposables = new lifecycle_2.DisposableStore();
        disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.Editors).registerEditor(editor_2.EditorDescriptor.create(sideBySideEditor_1.SideBySideEditor, sideBySideEditor_1.SideBySideEditor.ID, 'Text Editor'), [
            new descriptors_1.SyncDescriptor(editor_1.SideBySideEditorInput)
        ]));
        return disposables;
    }
    exports.registerTestSideBySideEditor = registerTestSideBySideEditor;
    function registerTestDiffEditor() {
        const disposables = new lifecycle_2.DisposableStore();
        disposables.add(platform_2.Registry.as(editor_1.EditorExtensions.Editors).registerEditor(editor_2.EditorDescriptor.create(textDiffEditor_1.TextDiffEditor, textDiffEditor_1.TextDiffEditor.ID, 'Text Diff Editor'), [
            new descriptors_1.SyncDescriptor(diffEditorInput_1.DiffEditorInput)
        ]));
        return disposables;
    }
    exports.registerTestDiffEditor = registerTestDiffEditor;
    class TestFileEditorInput extends editor_1.EditorInput {
        constructor(resource, _typeId) {
            super();
            this.resource = resource;
            this._typeId = _typeId;
            this.preferredResource = this.resource;
            this.gotDisposed = false;
            this.gotSaved = false;
            this.gotSavedAs = false;
            this.gotReverted = false;
            this.dirty = false;
            this.fails = false;
            this.movedEditor = undefined;
        }
        get typeId() { return this._typeId; }
        resolve() { return !this.fails ? Promise.resolve(null) : Promise.reject(new Error('fails')); }
        matches(other) { return !!((other === null || other === void 0 ? void 0 : other.resource) && this.resource.toString() === other.resource.toString() && other instanceof TestFileEditorInput && other.typeId === this.typeId); }
        setPreferredResource(resource) { }
        async setEncoding(encoding) { }
        getEncoding() { return undefined; }
        setPreferredName(name) { }
        setPreferredDescription(description) { }
        setPreferredEncoding(encoding) { }
        setMode(mode) { }
        setPreferredMode(mode) { }
        setForceOpenAsBinary() { }
        setFailToOpen() {
            this.fails = true;
        }
        async save(groupId, options) {
            this.gotSaved = true;
            this.dirty = false;
            return this;
        }
        async saveAs(groupId, options) {
            this.gotSavedAs = true;
            return this;
        }
        async revert(group, options) {
            this.gotReverted = true;
            this.gotSaved = false;
            this.gotSavedAs = false;
            this.dirty = false;
        }
        setDirty() { this.dirty = true; }
        isDirty() {
            return this.dirty;
        }
        isReadonly() {
            return false;
        }
        isResolved() { return false; }
        dispose() {
            super.dispose();
            this.gotDisposed = true;
        }
        rename() { return this.movedEditor; }
    }
    exports.TestFileEditorInput = TestFileEditorInput;
    class TestEditorPart extends editorPart_1.EditorPart {
        saveState() {
            return super.saveState();
        }
        clearState() {
            const workspaceMemento = this.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
            for (const key of Object.keys(workspaceMemento)) {
                delete workspaceMemento[key];
            }
            const globalMemento = this.getMemento(0 /* GLOBAL */, 1 /* MACHINE */);
            for (const key of Object.keys(globalMemento)) {
                delete globalMemento[key];
            }
        }
    }
    exports.TestEditorPart = TestEditorPart;
    async function createEditorPart(instantiationService, disposables) {
        const part = disposables.add(instantiationService.createInstance(TestEditorPart));
        part.create(document.createElement('div'));
        part.layout(1080, 800);
        await part.whenReady;
        return part;
    }
    exports.createEditorPart = createEditorPart;
    class TestListService {
        constructor() {
            this.lastFocusedList = undefined;
        }
        register() {
            return lifecycle_2.Disposable.None;
        }
    }
    exports.TestListService = TestListService;
    class TestPathService {
        constructor(fallbackUserHome = uri_1.URI.from({ scheme: network_1.Schemas.vscodeRemote, path: '/' })) {
            this.fallbackUserHome = fallbackUserHome;
            this.defaultUriScheme = network_1.Schemas.vscodeRemote;
        }
        get path() { return Promise.resolve(platform_1.isWindows ? path_1.win32 : path_1.posix); }
        async userHome() { return this.fallbackUserHome; }
        get resolvedUserHome() { return this.fallbackUserHome; }
        async fileURI(path) {
            return uri_1.URI.file(path);
        }
    }
    exports.TestPathService = TestPathService;
    class TestTextFileEditorModelManager extends textFileEditorModelManager_1.TextFileEditorModelManager {
        add(resource, model) {
            return super.add(resource, model);
        }
        remove(resource) {
            return super.remove(resource);
        }
    }
    exports.TestTextFileEditorModelManager = TestTextFileEditorModelManager;
    function getLastResolvedFileStat(model) {
        const candidate = model;
        return candidate === null || candidate === void 0 ? void 0 : candidate.lastResolvedFileStat;
    }
    exports.getLastResolvedFileStat = getLastResolvedFileStat;
    class TestWorkspacesService {
        constructor() {
            this.onDidChangeRecentlyOpened = event_1.Event.None;
        }
        async createUntitledWorkspace(folders, remoteAuthority) { throw new Error('Method not implemented.'); }
        async deleteUntitledWorkspace(workspace) { }
        async addRecentlyOpened(recents) { }
        async removeRecentlyOpened(workspaces) { }
        async clearRecentlyOpened() { }
        async getRecentlyOpened() { return { files: [], workspaces: [] }; }
        async getDirtyWorkspaces() { return []; }
        async enterWorkspace(path) { throw new Error('Method not implemented.'); }
        async getWorkspaceIdentifier(workspacePath) { throw new Error('Method not implemented.'); }
    }
    exports.TestWorkspacesService = TestWorkspacesService;
    class TestTerminalInstanceService {
        async getDefaultShellAndArgs() {
            return {
                shell: 'bash',
                args: undefined
            };
        }
        async getMainProcessParentEnv() {
            return {};
        }
        async getXtermConstructor() { throw new Error('Method not implemented.'); }
        async getXtermSearchConstructor() { throw new Error('Method not implemented.'); }
        async getXtermUnicode11Constructor() { throw new Error('Method not implemented.'); }
        async getXtermWebglConstructor() { throw new Error('Method not implemented.'); }
        createWindowsShellHelper(shellProcessId, xterm) { throw new Error('Method not implemented.'); }
    }
    exports.TestTerminalInstanceService = TestTerminalInstanceService;
    class TestTerminalProfileResolverService {
        resolveIcon(shellLaunchConfig) { }
        async resolveShellLaunchConfig(shellLaunchConfig, options) { }
        async getDefaultProfile(options) { return { path: '/default', profileName: 'Default' }; }
        async getDefaultShell(options) { return '/default'; }
        async getDefaultShellArgs(options) { return []; }
        async getShellEnvironment() { return process.env; }
        getSafeConfigValue(key, os) { return undefined; }
        getSafeConfigValueFullKey(key) { return undefined; }
    }
    exports.TestTerminalProfileResolverService = TestTerminalProfileResolverService;
    class TestLocalTerminalService {
        constructor() {
            this.onPtyHostExit = event_1.Event.None;
            this.onPtyHostUnresponsive = event_1.Event.None;
            this.onPtyHostResponsive = event_1.Event.None;
            this.onPtyHostRestart = event_1.Event.None;
        }
        async createProcess(shellLaunchConfig, cwd, cols, rows, env, windowsEnableConpty, shouldPersist) {
            return new TestTerminalChildProcess(shouldPersist);
        }
        async attachToProcess(id) { throw new Error('Method not implemented.'); }
        async listProcesses() { throw new Error('Method not implemented.'); }
        getDefaultSystemShell(osOverride) { throw new Error('Method not implemented.'); }
        getShellEnvironment() { throw new Error('Method not implemented.'); }
        async setTerminalLayoutInfo(argsOrLayout) { throw new Error('Method not implemented.'); }
        async getTerminalLayoutInfo() { throw new Error('Method not implemented.'); }
        async reduceConnectionGraceTime() { throw new Error('Method not implemented.'); }
        processBinary(id, data) { throw new Error('Method not implemented.'); }
    }
    exports.TestLocalTerminalService = TestLocalTerminalService;
    class TestTerminalChildProcess {
        constructor(shouldPersist) {
            this.shouldPersist = shouldPersist;
            this.id = 0;
            this.onProcessData = event_1.Event.None;
            this.onProcessExit = event_1.Event.None;
            this.onProcessReady = event_1.Event.None;
            this.onProcessTitleChanged = event_1.Event.None;
            this.onProcessShellTypeChanged = event_1.Event.None;
        }
        async start() { return undefined; }
        shutdown(immediate) { }
        input(data) { }
        resize(cols, rows) { }
        acknowledgeDataEvent(charCount) { }
        async getInitialCwd() { return ''; }
        async getCwd() { return ''; }
        async getLatency() { return 0; }
        async processBinary(data) { }
    }
    class TestQuickInputService {
        constructor() {
            this.onShow = event_1.Event.None;
            this.onHide = event_1.Event.None;
            this.quickAccess = undefined;
        }
        async pick(picks, options, token) {
            if ((0, types_1.isArray)(picks)) {
                return { label: 'selectedPick', description: 'pick description', value: 'selectedPick' };
            }
            else {
                return undefined;
            }
        }
        async input(options, token) { return options ? 'resolved' + options.prompt : 'resolved'; }
        createQuickPick() { throw new Error('not implemented.'); }
        createInputBox() { throw new Error('not implemented.'); }
        focus() { throw new Error('not implemented.'); }
        toggle() { throw new Error('not implemented.'); }
        navigate(next, quickNavigate) { throw new Error('not implemented.'); }
        accept() { throw new Error('not implemented.'); }
        back() { throw new Error('not implemented.'); }
        cancel() { throw new Error('not implemented.'); }
    }
    exports.TestQuickInputService = TestQuickInputService;
    class TestEditorWorkerService {
        canComputeDiff(original, modified) { return false; }
        async computeDiff(original, modified, ignoreTrimWhitespace, maxComputationTime) { return null; }
        canComputeDirtyDiff(original, modified) { return false; }
        async computeDirtyDiff(original, modified, ignoreTrimWhitespace) { return null; }
        async computeMoreMinimalEdits(resource, edits) { return undefined; }
        canComputeWordRanges(resource) { return false; }
        async computeWordRanges(resource, range) { return null; }
        canNavigateValueSet(resource) { return false; }
        async navigateValueSet(resource, range, up) { return null; }
    }
    exports.TestEditorWorkerService = TestEditorWorkerService;
});
//# sourceMappingURL=workbenchTestServices.js.map