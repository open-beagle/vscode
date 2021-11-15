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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/files.contribution", "vs/base/common/path", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/platform/files/common/files", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/files/browser/editors/textFileEditorTracker", "vs/workbench/contrib/files/browser/editors/textFileSaveErrorHandler", "vs/workbench/contrib/files/common/editors/fileEditorInput", "vs/workbench/contrib/files/browser/editors/binaryFileEditor", "vs/platform/instantiation/common/descriptors", "vs/base/common/platform", "vs/workbench/contrib/files/browser/explorerViewlet", "vs/workbench/browser/editor", "vs/platform/label/common/label", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/files/browser/explorerService", "vs/workbench/services/textfile/common/encoding", "vs/base/common/network", "vs/workbench/contrib/files/common/workspaceWatcher", "vs/editor/common/config/commonEditorConfig", "vs/workbench/contrib/files/common/dirtyFilesIndicator", "vs/editor/browser/editorExtensions", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/files/browser/files"], function (require, exports, nls, path_1, platform_1, configurationRegistry_1, contributions_1, editor_1, files_1, files_2, textFileEditorTracker_1, textFileSaveErrorHandler_1, fileEditorInput_1, binaryFileEditor_1, descriptors_1, platform, explorerViewlet_1, editor_2, label_1, extensions_1, explorerService_1, encoding_1, network_1, workspaceWatcher_1, commonEditorConfig_1, dirtyFilesIndicator_1, editorExtensions_1, undoRedo_1, files_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let FileUriLabelContribution = class FileUriLabelContribution {
        constructor(labelService) {
            labelService.registerFormatter({
                scheme: network_1.Schemas.file,
                formatting: {
                    label: '${authority}${path}',
                    separator: path_1.sep,
                    tildify: !platform.isWindows,
                    normalizeDriveLetter: platform.isWindows,
                    authorityPrefix: path_1.sep + path_1.sep,
                    workspaceSuffix: ''
                }
            });
        }
    };
    FileUriLabelContribution = __decorate([
        __param(0, label_1.ILabelService)
    ], FileUriLabelContribution);
    (0, extensions_1.registerSingleton)(files_3.IExplorerService, explorerService_1.ExplorerService, true);
    // Register file editors
    platform_1.Registry.as(editor_1.EditorExtensions.Editors).registerEditor(editor_2.EditorDescriptor.create(binaryFileEditor_1.BinaryFileEditor, binaryFileEditor_1.BinaryFileEditor.ID, nls.localize(0, null)), [
        new descriptors_1.SyncDescriptor(fileEditorInput_1.FileEditorInput)
    ]);
    // Register default file input factory
    platform_1.Registry.as(editor_1.EditorExtensions.EditorInputFactories).registerFileEditorInputFactory({
        typeId: files_2.FILE_EDITOR_INPUT_ID,
        createFileEditorInput: (resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredMode, instantiationService) => {
            return instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredMode);
        },
        isFileEditorInput: (obj) => {
            return obj instanceof fileEditorInput_1.FileEditorInput;
        }
    });
    // Register Editor Input Serializer
    platform_1.Registry.as(editor_1.EditorExtensions.EditorInputFactories).registerEditorInputSerializer(files_2.FILE_EDITOR_INPUT_ID, files_3.FileEditorInputSerializer);
    // Register Explorer views
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(explorerViewlet_1.ExplorerViewletViewsContribution, 1 /* Starting */);
    // Register Text File Editor Tracker
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(textFileEditorTracker_1.TextFileEditorTracker, 1 /* Starting */);
    // Register Text File Save Error Handler
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(textFileSaveErrorHandler_1.TextFileSaveErrorHandler, 1 /* Starting */);
    // Register uri display for file uris
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(FileUriLabelContribution, 1 /* Starting */);
    // Register Workspace Watcher
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(workspaceWatcher_1.WorkspaceWatcher, 3 /* Restored */);
    // Register Dirty Files Indicator
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(dirtyFilesIndicator_1.DirtyFilesIndicator, 1 /* Starting */);
    // Configuration
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const hotExitConfiguration = platform.isNative ?
        {
            'type': 'string',
            'scope': 1 /* APPLICATION */,
            'enum': [files_1.HotExitConfiguration.OFF, files_1.HotExitConfiguration.ON_EXIT, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE],
            'default': files_1.HotExitConfiguration.ON_EXIT,
            'markdownEnumDescriptions': [
                nls.localize(1, null),
                nls.localize(2, null),
                nls.localize(3, null)
            ],
            'description': nls.localize(4, null, files_1.HotExitConfiguration.ON_EXIT, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE)
        } : {
        'type': 'string',
        'scope': 1 /* APPLICATION */,
        'enum': [files_1.HotExitConfiguration.OFF, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE],
        'default': files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE,
        'markdownEnumDescriptions': [
            nls.localize(5, null),
            nls.localize(6, null)
        ],
        'description': nls.localize(7, null, files_1.HotExitConfiguration.ON_EXIT, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE)
    };
    configurationRegistry.registerConfiguration({
        'id': 'files',
        'order': 9,
        'title': nls.localize(8, null),
        'type': 'object',
        'properties': {
            [files_1.FILES_EXCLUDE_CONFIG]: {
                'type': 'object',
                'markdownDescription': nls.localize(9, null),
                'default': { '**/.git': true, '**/.svn': true, '**/.hg': true, '**/CVS': true, '**/.DS_Store': true },
                'scope': 4 /* RESOURCE */,
                'additionalProperties': {
                    'anyOf': [
                        {
                            'type': 'boolean',
                            'description': nls.localize(10, null),
                        },
                        {
                            'type': 'object',
                            'properties': {
                                'when': {
                                    'type': 'string',
                                    'pattern': '\\w*\\$\\(basename\\)\\w*',
                                    'default': '$(basename).ext',
                                    'description': nls.localize(11, null)
                                }
                            }
                        }
                    ]
                }
            },
            [files_1.FILES_ASSOCIATIONS_CONFIG]: {
                'type': 'object',
                'markdownDescription': nls.localize(12, null),
                'additionalProperties': {
                    'type': 'string'
                }
            },
            'files.encoding': {
                'type': 'string',
                'enum': Object.keys(encoding_1.SUPPORTED_ENCODINGS),
                'default': 'utf8',
                'description': nls.localize(13, null),
                'scope': 5 /* LANGUAGE_OVERRIDABLE */,
                'enumDescriptions': Object.keys(encoding_1.SUPPORTED_ENCODINGS).map(key => encoding_1.SUPPORTED_ENCODINGS[key].labelLong),
                'enumItemLabels': Object.keys(encoding_1.SUPPORTED_ENCODINGS).map(key => encoding_1.SUPPORTED_ENCODINGS[key].labelLong)
            },
            'files.autoGuessEncoding': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize(14, null),
                'scope': 5 /* LANGUAGE_OVERRIDABLE */
            },
            'files.eol': {
                'type': 'string',
                'enum': [
                    '\n',
                    '\r\n',
                    'auto'
                ],
                'enumDescriptions': [
                    nls.localize(15, null),
                    nls.localize(16, null),
                    nls.localize(17, null)
                ],
                'default': 'auto',
                'description': nls.localize(18, null),
                'scope': 5 /* LANGUAGE_OVERRIDABLE */
            },
            'files.enableTrash': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize(19, null)
            },
            'files.trimTrailingWhitespace': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize(20, null),
                'scope': 5 /* LANGUAGE_OVERRIDABLE */
            },
            'files.insertFinalNewline': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize(21, null),
                'scope': 5 /* LANGUAGE_OVERRIDABLE */
            },
            'files.trimFinalNewlines': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize(22, null),
                scope: 5 /* LANGUAGE_OVERRIDABLE */,
            },
            'files.autoSave': {
                'type': 'string',
                'enum': [files_1.AutoSaveConfiguration.OFF, files_1.AutoSaveConfiguration.AFTER_DELAY, files_1.AutoSaveConfiguration.ON_FOCUS_CHANGE, files_1.AutoSaveConfiguration.ON_WINDOW_CHANGE],
                'markdownEnumDescriptions': [
                    nls.localize(23, null),
                    nls.localize(24, null),
                    nls.localize(25, null),
                    nls.localize(26, null)
                ],
                'default': platform.isWeb ? files_1.AutoSaveConfiguration.AFTER_DELAY : files_1.AutoSaveConfiguration.OFF,
                'markdownDescription': nls.localize(27, null, files_1.AutoSaveConfiguration.OFF, files_1.AutoSaveConfiguration.AFTER_DELAY, files_1.AutoSaveConfiguration.ON_FOCUS_CHANGE, files_1.AutoSaveConfiguration.ON_WINDOW_CHANGE, files_1.AutoSaveConfiguration.AFTER_DELAY)
            },
            'files.autoSaveDelay': {
                'type': 'number',
                'default': 1000,
                'markdownDescription': nls.localize(28, null, files_1.AutoSaveConfiguration.AFTER_DELAY)
            },
            'files.watcherExclude': {
                'type': 'object',
                'default': platform.isWindows /* https://github.com/microsoft/vscode/issues/23954 */ ? { '**/.git/objects/**': true, '**/.git/subtree-cache/**': true, '**/node_modules/*/**': true, '**/.hg/store/**': true } : { '**/.git/objects/**': true, '**/.git/subtree-cache/**': true, '**/node_modules/**': true, '**/.hg/store/**': true },
                'description': nls.localize(29, null),
                'scope': 4 /* RESOURCE */
            },
            'files.hotExit': hotExitConfiguration,
            'files.defaultLanguage': {
                'type': 'string',
                'markdownDescription': nls.localize(30, null)
            },
            'files.maxMemoryForLargeFilesMB': {
                'type': 'number',
                'default': 4096,
                'markdownDescription': nls.localize(31, null),
                included: platform.isNative
            },
            'files.restoreUndoStack': {
                'type': 'boolean',
                'description': nls.localize(32, null),
                'default': true
            },
            'files.saveConflictResolution': {
                'type': 'string',
                'enum': [
                    'askUser',
                    'overwriteFileOnDisk'
                ],
                'enumDescriptions': [
                    nls.localize(33, null),
                    nls.localize(34, null)
                ],
                'description': nls.localize(35, null),
                'default': 'askUser',
                'scope': 5 /* LANGUAGE_OVERRIDABLE */
            },
            'files.simpleDialog.enable': {
                'type': 'boolean',
                'description': nls.localize(36, null),
                'default': false
            }
        }
    });
    configurationRegistry.registerConfiguration(Object.assign(Object.assign({}, commonEditorConfig_1.editorConfigurationBaseNode), { properties: {
            'editor.formatOnSave': {
                'type': 'boolean',
                'description': nls.localize(37, null),
                'scope': 5 /* LANGUAGE_OVERRIDABLE */,
            },
            'editor.formatOnSaveMode': {
                'type': 'string',
                'default': 'file',
                'enum': [
                    'file',
                    'modifications'
                ],
                'enumDescriptions': [
                    nls.localize(38, null),
                    nls.localize(39, null),
                ],
                'markdownDescription': nls.localize(40, null),
                'scope': 5 /* LANGUAGE_OVERRIDABLE */,
            },
        } }));
    configurationRegistry.registerConfiguration({
        'id': 'explorer',
        'order': 10,
        'title': nls.localize(41, null),
        'type': 'object',
        'properties': {
            'explorer.openEditors.visible': {
                'type': 'number',
                'description': nls.localize(42, null),
                'default': 9
            },
            'explorer.openEditors.sortOrder': {
                'type': 'string',
                'enum': ['editorOrder', 'alphabetical'],
                'description': nls.localize(43, null),
                'enumDescriptions': [
                    nls.localize(44, null),
                    nls.localize(45, null)
                ],
                'default': 'editorOrder'
            },
            'explorer.autoReveal': {
                'type': ['boolean', 'string'],
                'enum': [true, false, 'focusNoScroll'],
                'default': true,
                'enumDescriptions': [
                    nls.localize(46, null),
                    nls.localize(47, null),
                    nls.localize(48, null),
                ],
                'description': nls.localize(49, null)
            },
            'explorer.enableDragAndDrop': {
                'type': 'boolean',
                'description': nls.localize(50, null),
                'default': true
            },
            'explorer.confirmDragAndDrop': {
                'type': 'boolean',
                'description': nls.localize(51, null),
                'default': true
            },
            'explorer.confirmDelete': {
                'type': 'boolean',
                'description': nls.localize(52, null),
                'default': true
            },
            'explorer.sortOrder': {
                'type': 'string',
                'enum': ["default" /* Default */, "mixed" /* Mixed */, "filesFirst" /* FilesFirst */, "type" /* Type */, "modified" /* Modified */],
                'default': "default" /* Default */,
                'enumDescriptions': [
                    nls.localize(53, null),
                    nls.localize(54, null),
                    nls.localize(55, null),
                    nls.localize(56, null),
                    nls.localize(57, null)
                ],
                'description': nls.localize(58, null)
            },
            'explorer.decorations.colors': {
                type: 'boolean',
                description: nls.localize(59, null),
                default: true
            },
            'explorer.decorations.badges': {
                type: 'boolean',
                description: nls.localize(60, null),
                default: true
            },
            'explorer.incrementalNaming': {
                enum: ['simple', 'smart'],
                enumDescriptions: [
                    nls.localize(61, null),
                    nls.localize(62, null)
                ],
                description: nls.localize(63, null),
                default: 'simple'
            },
            'explorer.compactFolders': {
                'type': 'boolean',
                'description': nls.localize(64, null),
                'default': true
            },
        }
    });
    editorExtensions_1.UndoCommand.addImplementation(110, 'explorer', (accessor) => {
        const undoRedoService = accessor.get(undoRedo_1.IUndoRedoService);
        const explorerService = accessor.get(files_3.IExplorerService);
        if (explorerService.hasViewFocus() && undoRedoService.canUndo(explorerService_1.UNDO_REDO_SOURCE)) {
            undoRedoService.undo(explorerService_1.UNDO_REDO_SOURCE);
            return true;
        }
        return false;
    });
    editorExtensions_1.RedoCommand.addImplementation(110, 'explorer', (accessor) => {
        const undoRedoService = accessor.get(undoRedo_1.IUndoRedoService);
        const explorerService = accessor.get(files_3.IExplorerService);
        if (explorerService.hasViewFocus() && undoRedoService.canRedo(explorerService_1.UNDO_REDO_SOURCE)) {
            undoRedoService.redo(explorerService_1.UNDO_REDO_SOURCE);
            return true;
        }
        return false;
    });
});
//# sourceMappingURL=files.contribution.js.map