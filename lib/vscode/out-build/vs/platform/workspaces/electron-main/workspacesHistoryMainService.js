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
define(["require", "exports", "vs/nls!vs/platform/workspaces/electron-main/workspacesHistoryMainService", "vs/base/common/arrays", "vs/platform/state/node/state", "electron", "vs/platform/log/common/log", "vs/base/common/labels", "vs/base/common/event", "vs/base/common/platform", "vs/platform/workspaces/common/workspaces", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/base/common/async", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/network", "vs/base/node/pfs", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle"], function (require, exports, nls_1, arrays_1, state_1, electron_1, log_1, labels_1, event_1, platform_1, workspaces_1, workspacesManagementMainService_1, async_1, resources_1, uri_1, network_1, pfs_1, lifecycleMainService_1, instantiation_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspacesHistoryMainService = exports.IWorkspacesHistoryMainService = void 0;
    exports.IWorkspacesHistoryMainService = (0, instantiation_1.createDecorator)('workspacesHistoryMainService');
    let WorkspacesHistoryMainService = class WorkspacesHistoryMainService extends lifecycle_1.Disposable {
        constructor(stateService, logService, workspacesManagementMainService, lifecycleMainService) {
            super();
            this.stateService = stateService;
            this.logService = logService;
            this.workspacesManagementMainService = workspacesManagementMainService;
            this.lifecycleMainService = lifecycleMainService;
            this._onDidChangeRecentlyOpened = this._register(new event_1.Emitter());
            this.onDidChangeRecentlyOpened = this._onDidChangeRecentlyOpened.event;
            this.macOSRecentDocumentsUpdater = this._register(new async_1.ThrottledDelayer(800));
            this.registerListeners();
        }
        registerListeners() {
            // Install window jump list after opening window
            this.lifecycleMainService.when(3 /* AfterWindowOpen */).then(() => this.handleWindowsJumpList());
            // Add to history when entering workspace
            this._register(this.workspacesManagementMainService.onDidEnterWorkspace(event => this.addRecentlyOpened([{ workspace: event.workspace }])));
        }
        handleWindowsJumpList() {
            if (!platform_1.isWindows) {
                return; // only on windows
            }
            this.updateWindowsJumpList();
            this._register(this.onDidChangeRecentlyOpened(() => this.updateWindowsJumpList()));
        }
        addRecentlyOpened(recentToAdd) {
            const workspaces = [];
            const files = [];
            for (let recent of recentToAdd) {
                // Workspace
                if ((0, workspaces_1.isRecentWorkspace)(recent)) {
                    if (!this.workspacesManagementMainService.isUntitledWorkspace(recent.workspace) && indexOfWorkspace(workspaces, recent.workspace) === -1) {
                        workspaces.push(recent);
                    }
                }
                // Folder
                else if ((0, workspaces_1.isRecentFolder)(recent)) {
                    if (indexOfFolder(workspaces, recent.folderUri) === -1) {
                        workspaces.push(recent);
                    }
                }
                // File
                else {
                    const alreadyExistsInHistory = indexOfFile(files, recent.fileUri) >= 0;
                    const shouldBeFiltered = recent.fileUri.scheme === network_1.Schemas.file && WorkspacesHistoryMainService.COMMON_FILES_FILTER.indexOf((0, resources_1.basename)(recent.fileUri)) >= 0;
                    if (!alreadyExistsInHistory && !shouldBeFiltered) {
                        files.push(recent);
                        // Add to recent documents (Windows only, macOS later)
                        if (platform_1.isWindows && recent.fileUri.scheme === network_1.Schemas.file) {
                            electron_1.app.addRecentDocument(recent.fileUri.fsPath);
                        }
                    }
                }
            }
            this.addEntriesFromStorage(workspaces, files);
            if (workspaces.length > WorkspacesHistoryMainService.MAX_TOTAL_RECENT_ENTRIES) {
                workspaces.length = WorkspacesHistoryMainService.MAX_TOTAL_RECENT_ENTRIES;
            }
            if (files.length > WorkspacesHistoryMainService.MAX_TOTAL_RECENT_ENTRIES) {
                files.length = WorkspacesHistoryMainService.MAX_TOTAL_RECENT_ENTRIES;
            }
            this.saveRecentlyOpened({ workspaces, files });
            this._onDidChangeRecentlyOpened.fire();
            // Schedule update to recent documents on macOS dock
            if (platform_1.isMacintosh) {
                this.macOSRecentDocumentsUpdater.trigger(() => this.updateMacOSRecentDocuments());
            }
        }
        removeRecentlyOpened(recentToRemove) {
            const keep = (recent) => {
                const uri = location(recent);
                for (const resourceToRemove of recentToRemove) {
                    if (resources_1.extUriBiasedIgnorePathCase.isEqual(resourceToRemove, uri)) {
                        return false;
                    }
                }
                return true;
            };
            const mru = this.getRecentlyOpened();
            const workspaces = mru.workspaces.filter(keep);
            const files = mru.files.filter(keep);
            if (workspaces.length !== mru.workspaces.length || files.length !== mru.files.length) {
                this.saveRecentlyOpened({ files, workspaces });
                this._onDidChangeRecentlyOpened.fire();
                // Schedule update to recent documents on macOS dock
                if (platform_1.isMacintosh) {
                    this.macOSRecentDocumentsUpdater.trigger(() => this.updateMacOSRecentDocuments());
                }
            }
        }
        async updateMacOSRecentDocuments() {
            if (!platform_1.isMacintosh) {
                return;
            }
            // We clear all documents first to ensure an up-to-date view on the set. Since entries
            // can get deleted on disk, this ensures that the list is always valid
            electron_1.app.clearRecentDocuments();
            const mru = this.getRecentlyOpened();
            // Collect max-N recent workspaces that are known to exist
            const workspaceEntries = [];
            let entries = 0;
            for (let i = 0; i < mru.workspaces.length && entries < WorkspacesHistoryMainService.MAX_MACOS_DOCK_RECENT_WORKSPACES; i++) {
                const loc = location(mru.workspaces[i]);
                if (loc.scheme === network_1.Schemas.file) {
                    const workspacePath = (0, resources_1.originalFSPath)(loc);
                    if (await (0, pfs_1.exists)(workspacePath)) {
                        workspaceEntries.push(workspacePath);
                        entries++;
                    }
                }
            }
            // Collect max-N recent files that are known to exist
            const fileEntries = [];
            for (let i = 0; i < mru.files.length && entries < WorkspacesHistoryMainService.MAX_MACOS_DOCK_RECENT_ENTRIES_TOTAL; i++) {
                const loc = location(mru.files[i]);
                if (loc.scheme === network_1.Schemas.file) {
                    const filePath = (0, resources_1.originalFSPath)(loc);
                    if (WorkspacesHistoryMainService.COMMON_FILES_FILTER.includes((0, resources_1.basename)(loc)) || // skip some well known file entries
                        workspaceEntries.includes(filePath) // prefer a workspace entry over a file entry (e.g. for .code-workspace)
                    ) {
                        continue;
                    }
                    if (await (0, pfs_1.exists)(filePath)) {
                        fileEntries.push(filePath);
                        entries++;
                    }
                }
            }
            // The apple guidelines (https://developer.apple.com/design/human-interface-guidelines/macos/menus/menu-anatomy/)
            // explain that most recent entries should appear close to the interaction by the user (e.g. close to the
            // mouse click). Most native macOS applications that add recent documents to the dock, show the most recent document
            // to the bottom (because the dock menu is not appearing from top to bottom, but from the bottom to the top). As such
            // we fill in the entries in reverse order so that the most recent shows up at the bottom of the menu.
            //
            // On top of that, the maximum number of documents can be configured by the user (defaults to 10). To ensure that
            // we are not failing to show the most recent entries, we start by adding files first (in reverse order of recency)
            // and then add folders (in reverse order of recency). Given that strategy, we can ensure that the most recent
            // N folders are always appearing, even if the limit is low (https://github.com/microsoft/vscode/issues/74788)
            fileEntries.reverse().forEach(fileEntry => electron_1.app.addRecentDocument(fileEntry));
            workspaceEntries.reverse().forEach(workspaceEntry => electron_1.app.addRecentDocument(workspaceEntry));
        }
        clearRecentlyOpened() {
            this.saveRecentlyOpened({ workspaces: [], files: [] });
            electron_1.app.clearRecentDocuments();
            // Event
            this._onDidChangeRecentlyOpened.fire();
        }
        getRecentlyOpened(include) {
            var _a, _b;
            const workspaces = [];
            const files = [];
            // Add current workspace to beginning if set
            const currentWorkspace = (_a = include === null || include === void 0 ? void 0 : include.config) === null || _a === void 0 ? void 0 : _a.workspace;
            if ((0, workspaces_1.isWorkspaceIdentifier)(currentWorkspace) && !this.workspacesManagementMainService.isUntitledWorkspace(currentWorkspace)) {
                workspaces.push({ workspace: currentWorkspace });
            }
            else if ((0, workspaces_1.isSingleFolderWorkspaceIdentifier)(currentWorkspace)) {
                workspaces.push({ folderUri: currentWorkspace.uri });
            }
            // Add currently files to open to the beginning if any
            const currentFiles = (_b = include === null || include === void 0 ? void 0 : include.config) === null || _b === void 0 ? void 0 : _b.filesToOpenOrCreate;
            if (currentFiles) {
                for (let currentFile of currentFiles) {
                    const fileUri = currentFile.fileUri;
                    if (fileUri && indexOfFile(files, fileUri) === -1) {
                        files.push({ fileUri });
                    }
                }
            }
            this.addEntriesFromStorage(workspaces, files);
            return { workspaces, files };
        }
        addEntriesFromStorage(workspaces, files) {
            // Get from storage
            let recents = this.getRecentlyOpenedFromStorage();
            for (let recent of recents.workspaces) {
                let index = (0, workspaces_1.isRecentFolder)(recent) ? indexOfFolder(workspaces, recent.folderUri) : indexOfWorkspace(workspaces, recent.workspace);
                if (index >= 0) {
                    workspaces[index].label = workspaces[index].label || recent.label;
                }
                else {
                    workspaces.push(recent);
                }
            }
            for (let recent of recents.files) {
                let index = indexOfFile(files, recent.fileUri);
                if (index >= 0) {
                    files[index].label = files[index].label || recent.label;
                }
                else {
                    files.push(recent);
                }
            }
        }
        getRecentlyOpenedFromStorage() {
            const storedRecents = this.stateService.getItem(WorkspacesHistoryMainService.recentlyOpenedStorageKey);
            return (0, workspaces_1.restoreRecentlyOpened)(storedRecents, this.logService);
        }
        saveRecentlyOpened(recent) {
            const serialized = (0, workspaces_1.toStoreData)(recent);
            this.stateService.setItem(WorkspacesHistoryMainService.recentlyOpenedStorageKey, serialized);
        }
        updateWindowsJumpList() {
            if (!platform_1.isWindows) {
                return; // only on windows
            }
            const jumpList = [];
            // Tasks
            jumpList.push({
                type: 'tasks',
                items: [
                    {
                        type: 'task',
                        title: (0, nls_1.localize)(0, null),
                        description: (0, nls_1.localize)(1, null),
                        program: process.execPath,
                        args: '-n',
                        iconPath: process.execPath,
                        iconIndex: 0
                    }
                ]
            });
            // Recent Workspaces
            if (this.getRecentlyOpened().workspaces.length > 0) {
                // The user might have meanwhile removed items from the jump list and we have to respect that
                // so we need to update our list of recent paths with the choice of the user to not add them again
                // Also: Windows will not show our custom category at all if there is any entry which was removed
                // by the user! See https://github.com/microsoft/vscode/issues/15052
                let toRemove = [];
                for (let item of electron_1.app.getJumpListSettings().removedItems) {
                    const args = item.args;
                    if (args) {
                        const match = /^--(folder|file)-uri\s+"([^"]+)"$/.exec(args);
                        if (match) {
                            toRemove.push(uri_1.URI.parse(match[2]));
                        }
                    }
                }
                this.removeRecentlyOpened(toRemove);
                // Add entries
                let hasWorkspaces = false;
                const items = (0, arrays_1.coalesce)(this.getRecentlyOpened().workspaces.slice(0, 7 /* limit number of entries here */).map(recent => {
                    const workspace = (0, workspaces_1.isRecentWorkspace)(recent) ? recent.workspace : recent.folderUri;
                    const { title, description } = this.getWindowsJumpListLabel(workspace, recent.label);
                    let args;
                    if (uri_1.URI.isUri(workspace)) {
                        args = `--folder-uri "${workspace.toString()}"`;
                    }
                    else {
                        hasWorkspaces = true;
                        args = `--file-uri "${workspace.configPath.toString()}"`;
                    }
                    return {
                        type: 'task',
                        title: title.substr(0, 255),
                        description: description.substr(0, 255),
                        program: process.execPath,
                        args,
                        iconPath: 'explorer.exe',
                        iconIndex: 0
                    };
                }));
                if (items.length > 0) {
                    jumpList.push({
                        type: 'custom',
                        name: hasWorkspaces ? (0, nls_1.localize)(2, null) : (0, nls_1.localize)(3, null),
                        items
                    });
                }
            }
            // Recent
            jumpList.push({
                type: 'recent' // this enables to show files in the "recent" category
            });
            try {
                electron_1.app.setJumpList(jumpList);
            }
            catch (error) {
                this.logService.warn('updateWindowsJumpList#setJumpList', error); // since setJumpList is relatively new API, make sure to guard for errors
            }
        }
        getWindowsJumpListLabel(workspace, recentLabel) {
            // Prefer recent label
            if (recentLabel) {
                return { title: (0, labels_1.splitName)(recentLabel).name, description: recentLabel };
            }
            // Single Folder
            if (uri_1.URI.isUri(workspace)) {
                return { title: (0, resources_1.basename)(workspace), description: renderJumpListPathDescription(workspace) };
            }
            // Workspace: Untitled
            if (this.workspacesManagementMainService.isUntitledWorkspace(workspace)) {
                return { title: (0, nls_1.localize)(4, null), description: '' };
            }
            // Workspace: normal
            let filename = (0, resources_1.basename)(workspace.configPath);
            if (filename.endsWith(workspaces_1.WORKSPACE_EXTENSION)) {
                filename = filename.substr(0, filename.length - workspaces_1.WORKSPACE_EXTENSION.length - 1);
            }
            return { title: (0, nls_1.localize)(5, null, filename), description: renderJumpListPathDescription(workspace.configPath) };
        }
    };
    WorkspacesHistoryMainService.MAX_TOTAL_RECENT_ENTRIES = 100;
    WorkspacesHistoryMainService.MAX_MACOS_DOCK_RECENT_WORKSPACES = 7; // prefer higher number of workspaces...
    WorkspacesHistoryMainService.MAX_MACOS_DOCK_RECENT_ENTRIES_TOTAL = 10; // ...over number of files
    // Exclude some very common files from the dock/taskbar
    WorkspacesHistoryMainService.COMMON_FILES_FILTER = [
        'COMMIT_EDITMSG',
        'MERGE_MSG'
    ];
    WorkspacesHistoryMainService.recentlyOpenedStorageKey = 'openedPathsList';
    WorkspacesHistoryMainService = __decorate([
        __param(0, state_1.IStateService),
        __param(1, log_1.ILogService),
        __param(2, workspacesManagementMainService_1.IWorkspacesManagementMainService),
        __param(3, lifecycleMainService_1.ILifecycleMainService)
    ], WorkspacesHistoryMainService);
    exports.WorkspacesHistoryMainService = WorkspacesHistoryMainService;
    function renderJumpListPathDescription(uri) {
        return uri.scheme === 'file' ? (0, labels_1.normalizeDriveLetter)(uri.fsPath) : uri.toString();
    }
    function location(recent) {
        if ((0, workspaces_1.isRecentFolder)(recent)) {
            return recent.folderUri;
        }
        if ((0, workspaces_1.isRecentFile)(recent)) {
            return recent.fileUri;
        }
        return recent.workspace.configPath;
    }
    function indexOfWorkspace(arr, candidate) {
        return arr.findIndex(workspace => (0, workspaces_1.isRecentWorkspace)(workspace) && workspace.workspace.id === candidate.id);
    }
    function indexOfFolder(arr, candidate) {
        return arr.findIndex(folder => (0, workspaces_1.isRecentFolder)(folder) && resources_1.extUriBiasedIgnorePathCase.isEqual(folder.folderUri, candidate));
    }
    function indexOfFile(arr, candidate) {
        return arr.findIndex(file => resources_1.extUriBiasedIgnorePathCase.isEqual(file.fileUri, candidate));
    }
});
//# sourceMappingURL=workspacesHistoryMainService.js.map