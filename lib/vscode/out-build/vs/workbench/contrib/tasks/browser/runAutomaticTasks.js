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
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/browser/runAutomaticTasks", "vs/base/common/resources", "vs/base/common/lifecycle", "vs/workbench/contrib/tasks/common/taskService", "vs/base/common/collections", "vs/workbench/contrib/tasks/common/tasks", "vs/platform/storage/common/storage", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/platform/actions/common/actions", "vs/platform/workspace/common/workspaceTrust"], function (require, exports, nls, resources, lifecycle_1, taskService_1, collections_1, tasks_1, storage_1, notification_1, quickInput_1, actions_1, workspaceTrust_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ManageAutomaticTaskRunning = exports.RunAutomaticTasks = void 0;
    const ARE_AUTOMATIC_TASKS_ALLOWED_IN_WORKSPACE = 'tasks.run.allowAutomatic';
    let RunAutomaticTasks = class RunAutomaticTasks extends lifecycle_1.Disposable {
        constructor(taskService, storageService, workspaceTrustManagementService, workspaceTrustRequestService) {
            super();
            this.taskService = taskService;
            const isFolderAutomaticAllowed = storageService.getBoolean(ARE_AUTOMATIC_TASKS_ALLOWED_IN_WORKSPACE, 1 /* WORKSPACE */, undefined);
            const isWorkspaceTrusted = workspaceTrustManagementService.isWorkpaceTrusted();
            this.tryRunTasks(isFolderAutomaticAllowed && isWorkspaceTrusted);
        }
        tryRunTasks(isAllowed) {
            // Only run if allowed. Prompting for permission occurs when a user first tries to run a task.
            if (isAllowed === true) {
                this.taskService.getWorkspaceTasks(2 /* FolderOpen */).then(workspaceTaskResult => {
                    let { tasks } = RunAutomaticTasks.findAutoTasks(this.taskService, workspaceTaskResult);
                    if (tasks.length > 0) {
                        RunAutomaticTasks.runTasks(this.taskService, tasks);
                    }
                });
            }
        }
        static runTasks(taskService, tasks) {
            tasks.forEach(task => {
                if (task instanceof Promise) {
                    task.then(promiseResult => {
                        if (promiseResult) {
                            taskService.run(promiseResult);
                        }
                    });
                }
                else {
                    taskService.run(task);
                }
            });
        }
        static getTaskSource(source) {
            var _a, _b;
            const taskKind = tasks_1.TaskSourceKind.toConfigurationTarget(source.kind);
            switch (taskKind) {
                case 5 /* WORKSPACE_FOLDER */: {
                    return resources.joinPath(source.config.workspaceFolder.uri, source.config.file);
                }
                case 4 /* WORKSPACE */: {
                    return (_b = (_a = source.config.workspace) === null || _a === void 0 ? void 0 : _a.configuration) !== null && _b !== void 0 ? _b : undefined;
                }
            }
            return undefined;
        }
        static findAutoTasks(taskService, workspaceTaskResult) {
            const tasks = new Array();
            const taskNames = new Array();
            const locations = new Map();
            if (workspaceTaskResult) {
                workspaceTaskResult.forEach(resultElement => {
                    if (resultElement.set) {
                        resultElement.set.tasks.forEach(task => {
                            if (task.runOptions.runOn === tasks_1.RunOnOptions.folderOpen) {
                                tasks.push(task);
                                taskNames.push(task._label);
                                const location = RunAutomaticTasks.getTaskSource(task._source);
                                if (location) {
                                    locations.set(location.fsPath, location);
                                }
                            }
                        });
                    }
                    if (resultElement.configurations) {
                        (0, collections_1.forEach)(resultElement.configurations.byIdentifier, (configedTask) => {
                            if (configedTask.value.runOptions.runOn === tasks_1.RunOnOptions.folderOpen) {
                                tasks.push(new Promise(resolve => {
                                    taskService.getTask(resultElement.workspaceFolder, configedTask.value._id, true).then(task => resolve(task));
                                }));
                                if (configedTask.value._label) {
                                    taskNames.push(configedTask.value._label);
                                }
                                else {
                                    taskNames.push(configedTask.value.configures.task);
                                }
                                const location = RunAutomaticTasks.getTaskSource(configedTask.value._source);
                                if (location) {
                                    locations.set(location.fsPath, location);
                                }
                            }
                        });
                    }
                });
            }
            return { tasks, taskNames, locations };
        }
        static async promptForPermission(taskService, storageService, notificationService, workspaceTrustManagementService, openerService, workspaceTaskResult) {
            const isWorkspaceTrusted = workspaceTrustManagementService.isWorkpaceTrusted;
            if (!isWorkspaceTrusted) {
                return;
            }
            const isFolderAutomaticAllowed = storageService.getBoolean(ARE_AUTOMATIC_TASKS_ALLOWED_IN_WORKSPACE, 1 /* WORKSPACE */, undefined);
            if (isFolderAutomaticAllowed !== undefined) {
                return;
            }
            let { tasks, taskNames, locations } = RunAutomaticTasks.findAutoTasks(taskService, workspaceTaskResult);
            if (taskNames.length > 0) {
                // We have automatic tasks, prompt to allow.
                this.showPrompt(notificationService, storageService, taskService, openerService, taskNames, locations).then(allow => {
                    if (allow) {
                        RunAutomaticTasks.runTasks(taskService, tasks);
                    }
                });
            }
        }
        static showPrompt(notificationService, storageService, taskService, openerService, taskNames, locations) {
            return new Promise(resolve => {
                notificationService.prompt(notification_1.Severity.Info, nls.localize(0, null, taskNames.join(', '), Array.from(locations.keys()).join(', ')), [{
                        label: nls.localize(1, null),
                        run: () => {
                            resolve(true);
                            storageService.store(ARE_AUTOMATIC_TASKS_ALLOWED_IN_WORKSPACE, true, 1 /* WORKSPACE */, 1 /* MACHINE */);
                        }
                    },
                    {
                        label: nls.localize(2, null),
                        run: () => {
                            resolve(false);
                            storageService.store(ARE_AUTOMATIC_TASKS_ALLOWED_IN_WORKSPACE, false, 1 /* WORKSPACE */, 1 /* MACHINE */);
                        }
                    },
                    {
                        label: locations.size === 1 ? nls.localize(3, null) : nls.localize(4, null),
                        run: async () => {
                            for (const location of locations) {
                                await openerService.open(location[1]);
                            }
                            resolve(false);
                        }
                    }]);
            });
        }
    };
    RunAutomaticTasks = __decorate([
        __param(0, taskService_1.ITaskService),
        __param(1, storage_1.IStorageService),
        __param(2, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(3, workspaceTrust_1.IWorkspaceTrustRequestService)
    ], RunAutomaticTasks);
    exports.RunAutomaticTasks = RunAutomaticTasks;
    class ManageAutomaticTaskRunning extends actions_1.Action2 {
        constructor() {
            super({
                id: ManageAutomaticTaskRunning.ID,
                title: ManageAutomaticTaskRunning.LABEL,
                category: tasks_1.TASKS_CATEGORY
            });
        }
        async run(accessor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const storageService = accessor.get(storage_1.IStorageService);
            const allowItem = { label: nls.localize(6, null) };
            const disallowItem = { label: nls.localize(7, null) };
            const value = await quickInputService.pick([allowItem, disallowItem], { canPickMany: false });
            if (!value) {
                return;
            }
            storageService.store(ARE_AUTOMATIC_TASKS_ALLOWED_IN_WORKSPACE, value === allowItem, 1 /* WORKSPACE */, 1 /* MACHINE */);
        }
    }
    exports.ManageAutomaticTaskRunning = ManageAutomaticTaskRunning;
    ManageAutomaticTaskRunning.ID = 'workbench.action.tasks.manageAutomaticRunning';
    ManageAutomaticTaskRunning.LABEL = nls.localize(5, null);
});
//# sourceMappingURL=runAutomaticTasks.js.map