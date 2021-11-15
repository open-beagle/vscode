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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/workbench/api/common/extHostCustomers", "../common/extHost.protocol", "vs/nls!vs/workbench/api/browser/mainThreadFileSystemEventService", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/api/browser/mainThreadEditors", "vs/editor/browser/services/bulkEditService", "vs/platform/progress/common/progress", "vs/base/common/async", "vs/base/common/cancellation", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/platform/storage/common/storage", "vs/platform/actions/common/actions", "vs/platform/log/common/log", "vs/platform/environment/common/environment"], function (require, exports, lifecycle_1, files_1, extHostCustomers_1, extHost_protocol_1, nls_1, configurationRegistry_1, platform_1, workingCopyFileService_1, mainThreadEditors_1, bulkEditService_1, progress_1, async_1, cancellation_1, dialogs_1, severity_1, storage_1, actions_1, log_1, environment_1) {
    "use strict";
    var MainThreadFileSystemEventService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadFileSystemEventService = void 0;
    let MainThreadFileSystemEventService = MainThreadFileSystemEventService_1 = class MainThreadFileSystemEventService {
        constructor(extHostContext, fileService, workingCopyFileService, bulkEditService, progressService, dialogService, storageService, logService, envService) {
            this._listener = new lifecycle_1.DisposableStore();
            const proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostFileSystemEventService);
            // file system events - (changes the editor and other make)
            const events = {
                created: [],
                changed: [],
                deleted: []
            };
            this._listener.add(fileService.onDidFilesChange(event => {
                for (let change of event.changes) {
                    switch (change.type) {
                        case 1 /* ADDED */:
                            events.created.push(change.resource);
                            break;
                        case 0 /* UPDATED */:
                            events.changed.push(change.resource);
                            break;
                        case 2 /* DELETED */:
                            events.deleted.push(change.resource);
                            break;
                    }
                }
                proxy.$onFileEvent(events);
                events.created.length = 0;
                events.changed.length = 0;
                events.deleted.length = 0;
            }));
            const fileOperationParticipant = new class {
                async participate(files, operation, undoInfo, timeout, token) {
                    if (undoInfo === null || undoInfo === void 0 ? void 0 : undoInfo.isUndoing) {
                        return;
                    }
                    const cts = new cancellation_1.CancellationTokenSource(token);
                    const timer = setTimeout(() => cts.cancel(), timeout);
                    const data = await progressService.withProgress({
                        location: 15 /* Notification */,
                        title: this._progressLabel(operation),
                        cancellable: true,
                        delay: Math.min(timeout / 2, 3000)
                    }, () => {
                        // race extension host event delivery against timeout AND user-cancel
                        const onWillEvent = proxy.$onWillRunFileOperation(operation, files, timeout, token);
                        return (0, async_1.raceCancellation)(onWillEvent, cts.token);
                    }, () => {
                        // user-cancel
                        cts.cancel();
                    }).finally(() => {
                        cts.dispose();
                        clearTimeout(timer);
                    });
                    if (!data) {
                        // cancelled or no reply
                        return;
                    }
                    const needsConfirmation = data.edit.edits.some(edit => { var _a; return (_a = edit.metadata) === null || _a === void 0 ? void 0 : _a.needsConfirmation; });
                    let showPreview = storageService.getBoolean(MainThreadFileSystemEventService_1.MementoKeyAdditionalEdits, 0 /* GLOBAL */);
                    if (envService.extensionTestsLocationURI) {
                        // don't show dialog in tests
                        showPreview = false;
                    }
                    if (showPreview === undefined) {
                        // show a user facing message
                        let message;
                        if (data.extensionNames.length === 1) {
                            if (operation === 0 /* CREATE */) {
                                message = (0, nls_1.localize)(0, null, data.extensionNames[0]);
                            }
                            else if (operation === 3 /* COPY */) {
                                message = (0, nls_1.localize)(1, null, data.extensionNames[0]);
                            }
                            else if (operation === 2 /* MOVE */) {
                                message = (0, nls_1.localize)(2, null, data.extensionNames[0]);
                            }
                            else /* if (operation === FileOperation.DELETE) */ {
                                message = (0, nls_1.localize)(3, null, data.extensionNames[0]);
                            }
                        }
                        else {
                            if (operation === 0 /* CREATE */) {
                                message = (0, nls_1.localize)(4, null, data.extensionNames.length);
                            }
                            else if (operation === 3 /* COPY */) {
                                message = (0, nls_1.localize)(5, null, data.extensionNames.length);
                            }
                            else if (operation === 2 /* MOVE */) {
                                message = (0, nls_1.localize)(6, null, data.extensionNames.length);
                            }
                            else /* if (operation === FileOperation.DELETE) */ {
                                message = (0, nls_1.localize)(7, null, data.extensionNames.length);
                            }
                        }
                        if (needsConfirmation) {
                            // edit which needs confirmation -> always show dialog
                            const answer = await dialogService.show(severity_1.default.Info, message, [(0, nls_1.localize)(8, null), (0, nls_1.localize)(9, null)], { cancelId: 1 });
                            showPreview = true;
                            if (answer.choice === 1) {
                                // no changes wanted
                                return;
                            }
                        }
                        else {
                            // choice
                            const answer = await dialogService.show(severity_1.default.Info, message, [(0, nls_1.localize)(10, null), (0, nls_1.localize)(11, null), (0, nls_1.localize)(12, null)], {
                                cancelId: 2,
                                checkbox: { label: (0, nls_1.localize)(13, null) }
                            });
                            if (answer.choice === 2) {
                                // no changes wanted, don't persist cancel option
                                return;
                            }
                            showPreview = answer.choice === 1;
                            if (answer.checkboxChecked /* && answer.choice !== 2 */) {
                                storageService.store(MainThreadFileSystemEventService_1.MementoKeyAdditionalEdits, showPreview, 0 /* GLOBAL */, 0 /* USER */);
                            }
                        }
                    }
                    logService.info('[onWill-handler] applying additional workspace edit from extensions', data.extensionNames);
                    await bulkEditService.apply((0, mainThreadEditors_1.reviveWorkspaceEditDto2)(data.edit), { undoRedoGroupId: undoInfo === null || undoInfo === void 0 ? void 0 : undoInfo.undoRedoGroupId, showPreview });
                }
                _progressLabel(operation) {
                    switch (operation) {
                        case 0 /* CREATE */:
                            return (0, nls_1.localize)(14, null);
                        case 2 /* MOVE */:
                            return (0, nls_1.localize)(15, null);
                        case 3 /* COPY */:
                            return (0, nls_1.localize)(16, null);
                        case 1 /* DELETE */:
                            return (0, nls_1.localize)(17, null);
                    }
                }
            };
            // BEFORE file operation
            this._listener.add(workingCopyFileService.addFileOperationParticipant(fileOperationParticipant));
            // AFTER file operation
            this._listener.add(workingCopyFileService.onDidRunWorkingCopyFileOperation(e => proxy.$onDidRunFileOperation(e.operation, e.files)));
        }
        dispose() {
            this._listener.dispose();
        }
    };
    MainThreadFileSystemEventService.MementoKeyAdditionalEdits = `file.particpants.additionalEdits`;
    MainThreadFileSystemEventService = MainThreadFileSystemEventService_1 = __decorate([
        extHostCustomers_1.extHostCustomer,
        __param(1, files_1.IFileService),
        __param(2, workingCopyFileService_1.IWorkingCopyFileService),
        __param(3, bulkEditService_1.IBulkEditService),
        __param(4, progress_1.IProgressService),
        __param(5, dialogs_1.IDialogService),
        __param(6, storage_1.IStorageService),
        __param(7, log_1.ILogService),
        __param(8, environment_1.IEnvironmentService)
    ], MainThreadFileSystemEventService);
    exports.MainThreadFileSystemEventService = MainThreadFileSystemEventService;
    (0, actions_1.registerAction2)(class ResetMemento extends actions_1.Action2 {
        constructor() {
            super({
                id: 'files.participants.resetChoice',
                title: (0, nls_1.localize)(18, null),
                f1: true
            });
        }
        run(accessor) {
            accessor.get(storage_1.IStorageService).remove(MainThreadFileSystemEventService.MementoKeyAdditionalEdits, 0 /* GLOBAL */);
        }
    });
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'files',
        properties: {
            'files.participants.timeout': {
                type: 'number',
                default: 60000,
                markdownDescription: (0, nls_1.localize)(19, null),
            }
        }
    });
});
//# sourceMappingURL=mainThreadFileSystemEventService.js.map