/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/platform/workspaces/common/workspaces", "vs/platform/log/common/log", "vs/platform/environment/common/environment", "vs/workbench/common/views"], function (require, exports, uri_1, commands_1, workspaces_1, log_1, environment_1, views_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoveViewsAPICommand = exports.OpenIssueReporter = exports.RemoveFromRecentlyOpenedAPICommand = exports.NewWindowAPICommand = void 0;
    function adjustHandler(handler) {
        return (accessor, ...args) => {
            return handler(accessor.get(commands_1.ICommandService), ...args);
        };
    }
    class NewWindowAPICommand {
        static execute(executor, options) {
            const commandOptions = {
                forceReuseWindow: options && options.reuseWindow,
                remoteAuthority: options && options.remoteAuthority
            };
            return executor.executeCommand('_files.newWindow', commandOptions);
        }
    }
    exports.NewWindowAPICommand = NewWindowAPICommand;
    NewWindowAPICommand.ID = 'vscode.newWindow';
    commands_1.CommandsRegistry.registerCommand({
        id: NewWindowAPICommand.ID,
        handler: adjustHandler(NewWindowAPICommand.execute),
        description: {
            description: 'Opens an new window',
            args: []
        }
    });
    commands_1.CommandsRegistry.registerCommand('_workbench.removeFromRecentlyOpened', function (accessor, uri) {
        const workspacesService = accessor.get(workspaces_1.IWorkspacesService);
        return workspacesService.removeRecentlyOpened([uri]);
    });
    class RemoveFromRecentlyOpenedAPICommand {
        static execute(executor, path) {
            if (typeof path === 'string') {
                path = path.match(/^[^:/?#]+:\/\//) ? uri_1.URI.parse(path) : uri_1.URI.file(path);
            }
            else {
                path = uri_1.URI.revive(path); // called from extension host
            }
            return executor.executeCommand('_workbench.removeFromRecentlyOpened', path);
        }
    }
    exports.RemoveFromRecentlyOpenedAPICommand = RemoveFromRecentlyOpenedAPICommand;
    RemoveFromRecentlyOpenedAPICommand.ID = 'vscode.removeFromRecentlyOpened';
    commands_1.CommandsRegistry.registerCommand(RemoveFromRecentlyOpenedAPICommand.ID, adjustHandler(RemoveFromRecentlyOpenedAPICommand.execute));
    class OpenIssueReporter {
        static execute(executor, args) {
            const commandArgs = typeof args === 'string'
                ? { extensionId: args }
                : args;
            return executor.executeCommand('workbench.action.openIssueReporter', commandArgs);
        }
    }
    exports.OpenIssueReporter = OpenIssueReporter;
    OpenIssueReporter.ID = 'vscode.openIssueReporter';
    commands_1.CommandsRegistry.registerCommand('_workbench.addToRecentlyOpened', async function (accessor, recentEntry) {
        const workspacesService = accessor.get(workspaces_1.IWorkspacesService);
        let recent = undefined;
        const uri = recentEntry.uri;
        const label = recentEntry.label;
        const remoteAuthority = recentEntry.remoteAuthority;
        if (recentEntry.type === 'workspace') {
            const workspace = await workspacesService.getWorkspaceIdentifier(uri);
            recent = { workspace, label, remoteAuthority };
        }
        else if (recentEntry.type === 'folder') {
            recent = { folderUri: uri, label, remoteAuthority };
        }
        else {
            recent = { fileUri: uri, label, remoteAuthority };
        }
        return workspacesService.addRecentlyOpened([recent]);
    });
    commands_1.CommandsRegistry.registerCommand('_workbench.getRecentlyOpened', async function (accessor) {
        const workspacesService = accessor.get(workspaces_1.IWorkspacesService);
        return workspacesService.getRecentlyOpened();
    });
    commands_1.CommandsRegistry.registerCommand('_extensionTests.setLogLevel', function (accessor, level) {
        const logService = accessor.get(log_1.ILogService);
        const environmentService = accessor.get(environment_1.IEnvironmentService);
        if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
            logService.setLevel(level);
        }
    });
    commands_1.CommandsRegistry.registerCommand('_extensionTests.getLogLevel', function (accessor) {
        const logService = accessor.get(log_1.ILogService);
        return logService.getLevel();
    });
    commands_1.CommandsRegistry.registerCommand('_workbench.action.moveViews', async function (accessor, options) {
        const viewDescriptorService = accessor.get(views_1.IViewDescriptorService);
        const destination = viewDescriptorService.getViewContainerById(options.destinationId);
        if (!destination) {
            return;
        }
        // FYI, don't use `moveViewsToContainer` in 1 shot, because it expects all views to have the same current location
        for (const viewId of options.viewIds) {
            const viewDescriptor = viewDescriptorService.getViewDescriptorById(viewId);
            if (viewDescriptor === null || viewDescriptor === void 0 ? void 0 : viewDescriptor.canMoveView) {
                viewDescriptorService.moveViewsToContainer([viewDescriptor], destination, views_1.ViewVisibilityState.Default);
            }
        }
        await accessor.get(views_1.IViewsService).openViewContainer(destination.id, true);
    });
    class MoveViewsAPICommand {
        static execute(executor, options) {
            if (!Array.isArray(options === null || options === void 0 ? void 0 : options.viewIds) || typeof (options === null || options === void 0 ? void 0 : options.destinationId) !== 'string') {
                return Promise.reject('Invalid arguments');
            }
            return executor.executeCommand('_workbench.action.moveViews', options);
        }
    }
    exports.MoveViewsAPICommand = MoveViewsAPICommand;
    MoveViewsAPICommand.ID = 'vscode.moveViews';
    commands_1.CommandsRegistry.registerCommand({
        id: MoveViewsAPICommand.ID,
        handler: adjustHandler(MoveViewsAPICommand.execute),
        description: {
            description: 'Move Views',
            args: []
        }
    });
    // -----------------------------------------------------------------
    // The following commands are registered on the renderer but as API
    // command. DO NOT USE this unless you have understood what this
    // means
    // -----------------------------------------------------------------
    class OpenAPICommand {
        static execute(executor, resource) {
            return executor.executeCommand('_workbench.open', resource);
        }
    }
    OpenAPICommand.ID = 'vscode.open';
    commands_1.CommandsRegistry.registerCommand(OpenAPICommand.ID, adjustHandler(OpenAPICommand.execute));
    class DiffAPICommand {
        static execute(executor, left, right, label, options) {
            return executor.executeCommand('_workbench.diff', [
                left, right,
                label,
            ]);
        }
    }
    DiffAPICommand.ID = 'vscode.diff';
    commands_1.CommandsRegistry.registerCommand(DiffAPICommand.ID, adjustHandler(DiffAPICommand.execute));
});
//# sourceMappingURL=apiCommands.js.map