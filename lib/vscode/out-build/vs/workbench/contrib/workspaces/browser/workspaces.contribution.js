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
define(["require", "exports", "vs/nls!vs/workbench/contrib/workspaces/browser/workspaces.contribution", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/platform/workspace/common/workspace", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/platform/notification/common/notification", "vs/base/common/resources", "vs/workbench/services/host/browser/host", "vs/platform/quickinput/common/quickInput", "vs/platform/workspaces/common/workspaces"], function (require, exports, nls_1, platform_1, contributions_1, workspace_1, lifecycle_1, files_1, notification_1, resources_1, host_1, quickInput_1, workspaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspacesFinderContribution = void 0;
    /**
     * A workbench contribution that will look for `.code-workspace` files in the root of the
     * workspace folder and open a notification to suggest to open one of the workspaces.
     */
    let WorkspacesFinderContribution = class WorkspacesFinderContribution extends lifecycle_1.Disposable {
        constructor(contextService, notificationService, fileService, quickInputService, hostService) {
            super();
            this.contextService = contextService;
            this.notificationService = notificationService;
            this.fileService = fileService;
            this.quickInputService = quickInputService;
            this.hostService = hostService;
            this.findWorkspaces();
        }
        async findWorkspaces() {
            var _a;
            const folder = this.contextService.getWorkspace().folders[0];
            if (!folder || this.contextService.getWorkbenchState() !== 2 /* FOLDER */) {
                return; // require a single root folder
            }
            const rootFileNames = (_a = (await this.fileService.resolve(folder.uri)).children) === null || _a === void 0 ? void 0 : _a.map(child => child.name);
            if (Array.isArray(rootFileNames)) {
                const workspaceFiles = rootFileNames.filter(workspaces_1.hasWorkspaceFileExtension);
                if (workspaceFiles.length > 0) {
                    this.doHandleWorkspaceFiles(folder.uri, workspaceFiles);
                }
            }
        }
        doHandleWorkspaceFiles(folder, workspaces) {
            const neverShowAgain = { id: 'workspaces.dontPromptToOpen', scope: notification_1.NeverShowAgainScope.WORKSPACE, isSecondary: true };
            // Prompt to open one workspace
            if (workspaces.length === 1) {
                const workspaceFile = workspaces[0];
                this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)(0, null, workspaceFile, 'https://go.microsoft.com/fwlink/?linkid=2025315'), [{
                        label: (0, nls_1.localize)(1, null),
                        run: () => this.hostService.openWindow([{ workspaceUri: (0, resources_1.joinPath)(folder, workspaceFile) }])
                    }], { neverShowAgain });
            }
            // Prompt to select a workspace from many
            else if (workspaces.length > 1) {
                this.notificationService.prompt(notification_1.Severity.Info, (0, nls_1.localize)(2, null, 'https://go.microsoft.com/fwlink/?linkid=2025315'), [{
                        label: (0, nls_1.localize)(3, null),
                        run: () => {
                            this.quickInputService.pick(workspaces.map(workspace => ({ label: workspace })), { placeHolder: (0, nls_1.localize)(4, null) }).then(pick => {
                                if (pick) {
                                    this.hostService.openWindow([{ workspaceUri: (0, resources_1.joinPath)(folder, pick.label) }]);
                                }
                            });
                        }
                    }], { neverShowAgain });
            }
        }
    };
    WorkspacesFinderContribution = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, notification_1.INotificationService),
        __param(2, files_1.IFileService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, host_1.IHostService)
    ], WorkspacesFinderContribution);
    exports.WorkspacesFinderContribution = WorkspacesFinderContribution;
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(WorkspacesFinderContribution, 4 /* Eventually */);
});
//# sourceMappingURL=workspaces.contribution.js.map