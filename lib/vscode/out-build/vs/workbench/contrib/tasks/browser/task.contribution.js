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
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/browser/task.contribution", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/workbench/contrib/tasks/common/problemMatcher", "vs/platform/progress/common/progress", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/services/statusbar/common/statusbar", "vs/workbench/services/output/common/output", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/tasks/common/taskService", "vs/workbench/common/contributions", "vs/workbench/contrib/tasks/browser/runAutomaticTasks", "vs/platform/keybinding/common/keybindingsRegistry", "../common/jsonSchema_v1", "../common/jsonSchema_v2", "vs/workbench/contrib/tasks/browser/abstractTaskService", "vs/workbench/services/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/browser/contextkeys", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/tasks/browser/tasksQuickAccess", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/tasks/common/taskDefinitionRegistry"], function (require, exports, nls, lifecycle_1, platform_1, actions_1, problemMatcher_1, progress_1, jsonContributionRegistry, statusbar_1, output_1, tasks_1, taskService_1, contributions_1, runAutomaticTasks_1, keybindingsRegistry_1, jsonSchema_v1_1, jsonSchema_v2_1, abstractTaskService_1, configuration_1, configurationRegistry_1, contextkeys_1, quickAccess_1, tasksQuickAccess_1, contextkey_1, taskDefinitionRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskStatusBarContributions = void 0;
    const SHOW_TASKS_COMMANDS_CONTEXT = contextkey_1.ContextKeyExpr.or(taskService_1.ShellExecutionSupportedContext, taskService_1.ProcessExecutionSupportedContext);
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(runAutomaticTasks_1.RunAutomaticTasks, 4 /* Eventually */);
    (0, actions_1.registerAction2)(runAutomaticTasks_1.ManageAutomaticTaskRunning);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: runAutomaticTasks_1.ManageAutomaticTaskRunning.ID,
            title: runAutomaticTasks_1.ManageAutomaticTaskRunning.LABEL,
            category: tasks_1.TASKS_CATEGORY
        },
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    let TaskStatusBarContributions = class TaskStatusBarContributions extends lifecycle_1.Disposable {
        constructor(taskService, statusbarService, progressService) {
            super();
            this.taskService = taskService;
            this.statusbarService = statusbarService;
            this.progressService = progressService;
            this.activeTasksCount = 0;
            this.registerListeners();
        }
        registerListeners() {
            let promise = undefined;
            let resolver;
            this.taskService.onDidStateChange(event => {
                if (event.kind === "changed" /* Changed */) {
                    this.updateRunningTasksStatus();
                }
                if (!this.ignoreEventForUpdateRunningTasksCount(event)) {
                    switch (event.kind) {
                        case "active" /* Active */:
                            this.activeTasksCount++;
                            if (this.activeTasksCount === 1) {
                                if (!promise) {
                                    promise = new Promise((resolve) => {
                                        resolver = resolve;
                                    });
                                }
                            }
                            break;
                        case "inactive" /* Inactive */:
                            // Since the exiting of the sub process is communicated async we can't order inactive and terminate events.
                            // So try to treat them accordingly.
                            if (this.activeTasksCount > 0) {
                                this.activeTasksCount--;
                                if (this.activeTasksCount === 0) {
                                    if (promise && resolver) {
                                        resolver();
                                    }
                                }
                            }
                            break;
                        case "terminated" /* Terminated */:
                            if (this.activeTasksCount !== 0) {
                                this.activeTasksCount = 0;
                                if (promise && resolver) {
                                    resolver();
                                }
                            }
                            break;
                    }
                }
                if (promise && (event.kind === "active" /* Active */) && (this.activeTasksCount === 1)) {
                    this.progressService.withProgress({ location: 10 /* Window */, command: 'workbench.action.tasks.showTasks' }, progress => {
                        progress.report({ message: nls.localize(0, null) });
                        return promise;
                    }).then(() => {
                        promise = undefined;
                    });
                }
            });
        }
        async updateRunningTasksStatus() {
            const tasks = await this.taskService.getActiveTasks();
            if (tasks.length === 0) {
                if (this.runningTasksStatusItem) {
                    this.runningTasksStatusItem.dispose();
                    this.runningTasksStatusItem = undefined;
                }
            }
            else {
                const itemProps = {
                    text: `$(tools) ${tasks.length}`,
                    ariaLabel: nls.localize(1, null, tasks.length),
                    tooltip: nls.localize(2, null),
                    command: 'workbench.action.tasks.showTasks',
                };
                if (!this.runningTasksStatusItem) {
                    this.runningTasksStatusItem = this.statusbarService.addEntry(itemProps, 'status.runningTasks', nls.localize(3, null), 0 /* LEFT */, 49 /* Medium Priority, next to Markers */);
                }
                else {
                    this.runningTasksStatusItem.update(itemProps);
                }
            }
        }
        ignoreEventForUpdateRunningTasksCount(event) {
            if (!this.taskService.inTerminal()) {
                return false;
            }
            if (event.group !== tasks_1.TaskGroup.Build) {
                return true;
            }
            if (!event.__task) {
                return false;
            }
            return event.__task.configurationProperties.problemMatchers === undefined || event.__task.configurationProperties.problemMatchers.length === 0;
        }
    };
    TaskStatusBarContributions = __decorate([
        __param(0, taskService_1.ITaskService),
        __param(1, statusbar_1.IStatusbarService),
        __param(2, progress_1.IProgressService)
    ], TaskStatusBarContributions);
    exports.TaskStatusBarContributions = TaskStatusBarContributions;
    workbenchRegistry.registerWorkbenchContribution(TaskStatusBarContributions, 3 /* Restored */);
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: '2_run',
        command: {
            id: 'workbench.action.tasks.runTask',
            title: nls.localize(4, null)
        },
        order: 1,
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: '2_run',
        command: {
            id: 'workbench.action.tasks.build',
            title: nls.localize(5, null)
        },
        order: 2,
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    // Manage Tasks
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: '3_manage',
        command: {
            precondition: tasks_1.TASK_RUNNING_STATE,
            id: 'workbench.action.tasks.showTasks',
            title: nls.localize(6, null)
        },
        order: 1,
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: '3_manage',
        command: {
            precondition: tasks_1.TASK_RUNNING_STATE,
            id: 'workbench.action.tasks.restartTask',
            title: nls.localize(7, null)
        },
        order: 2,
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: '3_manage',
        command: {
            precondition: tasks_1.TASK_RUNNING_STATE,
            id: 'workbench.action.tasks.terminate',
            title: nls.localize(8, null)
        },
        order: 3,
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    // Configure Tasks
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: '4_configure',
        command: {
            id: 'workbench.action.tasks.configureTaskRunner',
            title: nls.localize(9, null)
        },
        order: 1,
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarTerminalMenu, {
        group: '4_configure',
        command: {
            id: 'workbench.action.tasks.configureDefaultBuildTask',
            title: nls.localize(10, null)
        },
        order: 2,
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.openWorkspaceFileTasks',
            title: { value: nls.localize(11, null), original: 'Open Workspace Tasks' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: contextkey_1.ContextKeyExpr.and(contextkeys_1.WorkbenchStateContext.isEqualTo('workspace'), SHOW_TASKS_COMMANDS_CONTEXT)
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: abstractTaskService_1.ConfigureTaskAction.ID,
            title: { value: abstractTaskService_1.ConfigureTaskAction.TEXT, original: 'Configure Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.showLog',
            title: { value: nls.localize(12, null), original: 'Show Task Log' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.runTask',
            title: { value: nls.localize(13, null), original: 'Run Task' },
            category: tasks_1.TASKS_CATEGORY
        }
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.reRunTask',
            title: { value: nls.localize(14, null), original: 'Rerun Last Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.restartTask',
            title: { value: nls.localize(15, null), original: 'Restart Running Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.showTasks',
            title: { value: nls.localize(16, null), original: 'Show Running Tasks' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.terminate',
            title: { value: nls.localize(17, null), original: 'Terminate Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.build',
            title: { value: nls.localize(18, null), original: 'Run Build Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.test',
            title: { value: nls.localize(19, null), original: 'Run Test Task' },
            category: tasks_1.TASKS_CATEGORY
        },
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.configureDefaultBuildTask',
            title: {
                value: nls.localize(20, null),
                original: 'Configure Default Build Task'
            },
            category: tasks_1.TASKS_CATEGORY
        },
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.configureDefaultTestTask',
            title: {
                value: nls.localize(21, null),
                original: 'Configure Default Test Task'
            },
            category: tasks_1.TASKS_CATEGORY
        },
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
        command: {
            id: 'workbench.action.tasks.openUserTasks',
            title: {
                value: nls.localize(22, null),
                original: 'Open User Tasks'
            }, category: tasks_1.TASKS_CATEGORY
        },
        when: SHOW_TASKS_COMMANDS_CONTEXT
    });
    // MenuRegistry.addCommand( { id: 'workbench.action.tasks.rebuild', title: nls.localize('RebuildAction.label', 'Run Rebuild Task'), category: tasksCategory });
    // MenuRegistry.addCommand( { id: 'workbench.action.tasks.clean', title: nls.localize('CleanAction.label', 'Run Clean Task'), category: tasksCategory });
    keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
        id: 'workbench.action.tasks.build',
        weight: 200 /* WorkbenchContrib */,
        when: undefined,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 32 /* KEY_B */
    });
    // Tasks Output channel. Register it before using it in Task Service.
    let outputChannelRegistry = platform_1.Registry.as(output_1.Extensions.OutputChannels);
    outputChannelRegistry.registerChannel({ id: abstractTaskService_1.AbstractTaskService.OutputChannelId, label: abstractTaskService_1.AbstractTaskService.OutputChannelLabel, log: false });
    // Register Quick Access
    const quickAccessRegistry = (platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess));
    const tasksPickerContextKey = 'inTasksPicker';
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: tasksQuickAccess_1.TasksQuickAccessProvider,
        prefix: tasksQuickAccess_1.TasksQuickAccessProvider.PREFIX,
        contextKey: tasksPickerContextKey,
        placeholder: nls.localize(23, null),
        helpEntries: [{ description: nls.localize(24, null), needsEditor: false }]
    });
    // tasks.json validation
    let schema = {
        id: configuration_1.tasksSchemaId,
        description: 'Task definition file',
        type: 'object',
        allowTrailingCommas: true,
        allowComments: true,
        default: {
            version: '2.0.0',
            tasks: [
                {
                    label: 'My Task',
                    command: 'echo hello',
                    type: 'shell',
                    args: [],
                    problemMatcher: ['$tsc'],
                    presentation: {
                        reveal: 'always'
                    },
                    group: 'build'
                }
            ]
        }
    };
    schema.definitions = Object.assign(Object.assign({}, jsonSchema_v1_1.default.definitions), jsonSchema_v2_1.default.definitions);
    schema.oneOf = [...(jsonSchema_v2_1.default.oneOf || []), ...(jsonSchema_v1_1.default.oneOf || [])];
    let jsonRegistry = platform_1.Registry.as(jsonContributionRegistry.Extensions.JSONContribution);
    jsonRegistry.registerSchema(configuration_1.tasksSchemaId, schema);
    problemMatcher_1.ProblemMatcherRegistry.onMatcherChanged(() => {
        (0, jsonSchema_v2_1.updateProblemMatchers)();
        jsonRegistry.notifySchemaChanged(configuration_1.tasksSchemaId);
    });
    taskDefinitionRegistry_1.TaskDefinitionRegistry.onDefinitionsChanged(() => {
        (0, jsonSchema_v2_1.updateTaskDefinitions)();
        jsonRegistry.notifySchemaChanged(configuration_1.tasksSchemaId);
    });
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'task',
        order: 100,
        title: nls.localize(25, null),
        type: 'object',
        properties: {
            'task.problemMatchers.neverPrompt': {
                markdownDescription: nls.localize(26, null),
                'oneOf': [
                    {
                        type: 'boolean',
                        markdownDescription: nls.localize(27, null)
                    },
                    {
                        type: 'object',
                        patternProperties: {
                            '.*': {
                                type: 'boolean'
                            }
                        },
                        markdownDescription: nls.localize(28, null),
                        default: {
                            'shell': true
                        }
                    }
                ],
                default: false
            },
            'task.autoDetect': {
                markdownDescription: nls.localize(29, null),
                type: 'string',
                enum: ['on', 'off'],
                default: 'on'
            },
            'task.slowProviderWarning': {
                markdownDescription: nls.localize(30, null),
                'oneOf': [
                    {
                        type: 'boolean',
                        markdownDescription: nls.localize(31, null)
                    },
                    {
                        type: 'array',
                        items: {
                            type: 'string',
                            markdownDescription: nls.localize(32, null)
                        }
                    }
                ],
                default: true
            },
            'task.quickOpen.history': {
                markdownDescription: nls.localize(33, null),
                type: 'number',
                default: 30, minimum: 0, maximum: 30
            },
            'task.quickOpen.detail': {
                markdownDescription: nls.localize(34, null),
                type: 'boolean',
                default: true
            },
            'task.quickOpen.skip': {
                type: 'boolean',
                description: nls.localize(35, null),
                default: false
            },
            'task.quickOpen.showAll': {
                type: 'boolean',
                description: nls.localize(36, null),
                default: false
            },
            'task.saveBeforeRun': {
                markdownDescription: nls.localize(37, null),
                type: 'string',
                enum: ['always', 'never', 'prompt'],
                enumDescriptions: [
                    nls.localize(38, null),
                    nls.localize(39, null),
                    nls.localize(40, null),
                ],
                default: 'always',
            },
        }
    });
});
//# sourceMappingURL=task.contribution.js.map