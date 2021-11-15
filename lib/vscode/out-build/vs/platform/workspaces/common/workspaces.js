/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/nls!vs/platform/workspaces/common/workspaces", "vs/platform/workspace/common/workspace", "vs/base/common/uri", "vs/base/common/platform", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/jsonEdit", "vs/base/common/json", "vs/base/common/network", "vs/base/common/labels", "vs/base/common/extpath", "vs/platform/remote/common/remoteHosts"], function (require, exports, instantiation_1, nls_1, workspace_1, uri_1, platform_1, path_1, resources_1, jsonEdit, json, network_1, labels_1, extpath_1, remoteHosts_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toStoreData = exports.restoreRecentlyOpened = exports.useSlashForPath = exports.rewriteWorkspaceFileForNewLocation = exports.toWorkspaceFolders = exports.getStoredWorkspaceFolder = exports.isRawUriWorkspaceFolder = exports.isRawFileWorkspaceFolder = exports.isStoredWorkspaceFolder = exports.isUntitledWorkspace = exports.reviveIdentifier = exports.isWorkspaceIdentifier = exports.toWorkspaceIdentifier = exports.isSingleFolderWorkspaceIdentifier = exports.isRecentFile = exports.isRecentFolder = exports.isRecentWorkspace = exports.IWorkspacesService = exports.hasWorkspaceFileExtension = exports.UNTITLED_WORKSPACE_NAME = exports.WORKSPACE_FILTER = exports.WORKSPACE_EXTENSION = void 0;
    exports.WORKSPACE_EXTENSION = 'code-workspace';
    const WORKSPACE_SUFFIX = `.${exports.WORKSPACE_EXTENSION}`;
    exports.WORKSPACE_FILTER = [{ name: (0, nls_1.localize)(0, null), extensions: [exports.WORKSPACE_EXTENSION] }];
    exports.UNTITLED_WORKSPACE_NAME = 'workspace.json';
    function hasWorkspaceFileExtension(path) {
        const ext = (typeof path === 'string') ? (0, path_1.extname)(path) : (0, resources_1.extname)(path);
        return ext === WORKSPACE_SUFFIX;
    }
    exports.hasWorkspaceFileExtension = hasWorkspaceFileExtension;
    exports.IWorkspacesService = (0, instantiation_1.createDecorator)('workspacesService');
    function isRecentWorkspace(curr) {
        return curr.hasOwnProperty('workspace');
    }
    exports.isRecentWorkspace = isRecentWorkspace;
    function isRecentFolder(curr) {
        return curr.hasOwnProperty('folderUri');
    }
    exports.isRecentFolder = isRecentFolder;
    function isRecentFile(curr) {
        return curr.hasOwnProperty('fileUri');
    }
    exports.isRecentFile = isRecentFile;
    function isSingleFolderWorkspaceIdentifier(obj) {
        const singleFolderIdentifier = obj;
        return typeof (singleFolderIdentifier === null || singleFolderIdentifier === void 0 ? void 0 : singleFolderIdentifier.id) === 'string' && uri_1.URI.isUri(singleFolderIdentifier.uri);
    }
    exports.isSingleFolderWorkspaceIdentifier = isSingleFolderWorkspaceIdentifier;
    function toWorkspaceIdentifier(workspace) {
        // Multi root
        if (workspace.configuration) {
            return {
                id: workspace.id,
                configPath: workspace.configuration
            };
        }
        // Single folder
        if (workspace.folders.length === 1) {
            return {
                id: workspace.id,
                uri: workspace.folders[0].uri
            };
        }
        // Empty workspace
        return undefined;
    }
    exports.toWorkspaceIdentifier = toWorkspaceIdentifier;
    function isWorkspaceIdentifier(obj) {
        const workspaceIdentifier = obj;
        return typeof (workspaceIdentifier === null || workspaceIdentifier === void 0 ? void 0 : workspaceIdentifier.id) === 'string' && uri_1.URI.isUri(workspaceIdentifier.configPath);
    }
    exports.isWorkspaceIdentifier = isWorkspaceIdentifier;
    function reviveIdentifier(identifier) {
        // Single Folder
        const singleFolderIdentifierCandidate = identifier;
        if (singleFolderIdentifierCandidate === null || singleFolderIdentifierCandidate === void 0 ? void 0 : singleFolderIdentifierCandidate.uri) {
            return { id: singleFolderIdentifierCandidate.id, uri: uri_1.URI.revive(singleFolderIdentifierCandidate.uri) };
        }
        // Multi folder
        const workspaceIdentifierCandidate = identifier;
        if (workspaceIdentifierCandidate === null || workspaceIdentifierCandidate === void 0 ? void 0 : workspaceIdentifierCandidate.configPath) {
            return { id: workspaceIdentifierCandidate.id, configPath: uri_1.URI.revive(workspaceIdentifierCandidate.configPath) };
        }
        // Empty
        if (identifier === null || identifier === void 0 ? void 0 : identifier.id) {
            return { id: identifier.id };
        }
        return undefined;
    }
    exports.reviveIdentifier = reviveIdentifier;
    function isUntitledWorkspace(path, environmentService) {
        return resources_1.extUriBiasedIgnorePathCase.isEqualOrParent(path, environmentService.untitledWorkspacesHome);
    }
    exports.isUntitledWorkspace = isUntitledWorkspace;
    //#endregion
    //#region Workspace File Utilities
    function isStoredWorkspaceFolder(obj) {
        return isRawFileWorkspaceFolder(obj) || isRawUriWorkspaceFolder(obj);
    }
    exports.isStoredWorkspaceFolder = isStoredWorkspaceFolder;
    function isRawFileWorkspaceFolder(obj) {
        const candidate = obj;
        return typeof (candidate === null || candidate === void 0 ? void 0 : candidate.path) === 'string' && (!candidate.name || typeof candidate.name === 'string');
    }
    exports.isRawFileWorkspaceFolder = isRawFileWorkspaceFolder;
    function isRawUriWorkspaceFolder(obj) {
        const candidate = obj;
        return typeof (candidate === null || candidate === void 0 ? void 0 : candidate.uri) === 'string' && (!candidate.name || typeof candidate.name === 'string');
    }
    exports.isRawUriWorkspaceFolder = isRawUriWorkspaceFolder;
    /**
     * Given a folder URI and the workspace config folder, computes the IStoredWorkspaceFolder using
    * a relative or absolute path or a uri.
     * Undefined is returned if the folderURI and the targetConfigFolderURI don't have the same schema or authority
     *
     * @param folderURI a workspace folder
     * @param forceAbsolute if set, keep the path absolute
     * @param folderName a workspace name
     * @param targetConfigFolderURI the folder where the workspace is living in
     * @param useSlashForPath if set, use forward slashes for file paths on windows
     */
    function getStoredWorkspaceFolder(folderURI, forceAbsolute, folderName, targetConfigFolderURI, useSlashForPath = !platform_1.isWindows, extUri) {
        if (folderURI.scheme !== targetConfigFolderURI.scheme) {
            return { name: folderName, uri: folderURI.toString(true) };
        }
        let folderPath = !forceAbsolute ? extUri.relativePath(targetConfigFolderURI, folderURI) : undefined;
        if (folderPath !== undefined) {
            if (folderPath.length === 0) {
                folderPath = '.';
            }
            else if (platform_1.isWindows && folderURI.scheme === network_1.Schemas.file && !useSlashForPath) {
                // Windows gets special treatment:
                // - use backslahes unless slash is used by other existing folders
                folderPath = folderPath.replace(/\//g, '\\');
            }
        }
        else {
            // use absolute path
            if (folderURI.scheme === network_1.Schemas.file) {
                folderPath = folderURI.fsPath;
                if (platform_1.isWindows) {
                    // Windows gets special treatment:
                    // - normalize all paths to get nice casing of drive letters
                    // - use backslahes unless slash is used by other existing folders
                    folderPath = (0, labels_1.normalizeDriveLetter)(folderPath);
                    if (useSlashForPath) {
                        folderPath = (0, extpath_1.toSlashes)(folderPath);
                    }
                }
            }
            else {
                if (!extUri.isEqualAuthority(folderURI.authority, targetConfigFolderURI.authority)) {
                    return { name: folderName, uri: folderURI.toString(true) };
                }
                folderPath = folderURI.path;
            }
        }
        return { name: folderName, path: folderPath };
    }
    exports.getStoredWorkspaceFolder = getStoredWorkspaceFolder;
    function toWorkspaceFolders(configuredFolders, workspaceConfigFile, extUri) {
        let result = [];
        let seen = new Set();
        const relativeTo = extUri.dirname(workspaceConfigFile);
        for (let configuredFolder of configuredFolders) {
            let uri = null;
            if (isRawFileWorkspaceFolder(configuredFolder)) {
                if (configuredFolder.path) {
                    uri = extUri.resolvePath(relativeTo, configuredFolder.path);
                }
            }
            else if (isRawUriWorkspaceFolder(configuredFolder)) {
                try {
                    uri = uri_1.URI.parse(configuredFolder.uri);
                    // this makes sure all workspace folder are absolute
                    if (uri.path[0] !== '/') {
                        uri = uri.with({ path: '/' + uri.path });
                    }
                }
                catch (e) {
                    console.warn(e);
                    // ignore
                }
            }
            if (uri) {
                // remove duplicates
                let comparisonKey = extUri.getComparisonKey(uri);
                if (!seen.has(comparisonKey)) {
                    seen.add(comparisonKey);
                    const name = configuredFolder.name || extUri.basenameOrAuthority(uri);
                    result.push(new workspace_1.WorkspaceFolder({ uri, name, index: result.length }, configuredFolder));
                }
            }
        }
        return result;
    }
    exports.toWorkspaceFolders = toWorkspaceFolders;
    /**
     * Rewrites the content of a workspace file to be saved at a new location.
     * Throws an exception if file is not a valid workspace file
     */
    function rewriteWorkspaceFileForNewLocation(rawWorkspaceContents, configPathURI, isFromUntitledWorkspace, targetConfigPathURI, extUri) {
        let storedWorkspace = doParseStoredWorkspace(configPathURI, rawWorkspaceContents);
        const sourceConfigFolder = extUri.dirname(configPathURI);
        const targetConfigFolder = extUri.dirname(targetConfigPathURI);
        const rewrittenFolders = [];
        const slashForPath = useSlashForPath(storedWorkspace.folders);
        for (const folder of storedWorkspace.folders) {
            const folderURI = isRawFileWorkspaceFolder(folder) ? extUri.resolvePath(sourceConfigFolder, folder.path) : uri_1.URI.parse(folder.uri);
            let absolute;
            if (isFromUntitledWorkspace) {
                // if it was an untitled workspace, try to make paths relative
                absolute = false;
            }
            else {
                // for existing workspaces, preserve whether a path was absolute or relative
                absolute = !isRawFileWorkspaceFolder(folder) || (0, path_1.isAbsolute)(folder.path);
            }
            rewrittenFolders.push(getStoredWorkspaceFolder(folderURI, absolute, folder.name, targetConfigFolder, slashForPath, extUri));
        }
        // Preserve as much of the existing workspace as possible by using jsonEdit
        // and only changing the folders portion.
        const formattingOptions = { insertSpaces: false, tabSize: 4, eol: (platform_1.isLinux || platform_1.isMacintosh) ? '\n' : '\r\n' };
        const edits = jsonEdit.setProperty(rawWorkspaceContents, ['folders'], rewrittenFolders, formattingOptions);
        let newContent = jsonEdit.applyEdits(rawWorkspaceContents, edits);
        if (storedWorkspace.remoteAuthority === (0, remoteHosts_1.getRemoteAuthority)(targetConfigPathURI)) {
            // unsaved remote workspaces have the remoteAuthority set. Remove it when no longer nexessary.
            newContent = jsonEdit.applyEdits(newContent, jsonEdit.removeProperty(newContent, ['remoteAuthority'], formattingOptions));
        }
        return newContent;
    }
    exports.rewriteWorkspaceFileForNewLocation = rewriteWorkspaceFileForNewLocation;
    function doParseStoredWorkspace(path, contents) {
        // Parse workspace file
        let storedWorkspace = json.parse(contents); // use fault tolerant parser
        // Filter out folders which do not have a path or uri set
        if (storedWorkspace && Array.isArray(storedWorkspace.folders)) {
            storedWorkspace.folders = storedWorkspace.folders.filter(folder => isStoredWorkspaceFolder(folder));
        }
        else {
            throw new Error(`${path} looks like an invalid workspace file.`);
        }
        return storedWorkspace;
    }
    function useSlashForPath(storedFolders) {
        if (platform_1.isWindows) {
            return storedFolders.some(folder => isRawFileWorkspaceFolder(folder) && folder.path.indexOf('/') >= 0);
        }
        return true;
    }
    exports.useSlashForPath = useSlashForPath;
    function isSerializedRecentWorkspace(data) {
        return data.workspace && typeof data.workspace === 'object' && typeof data.workspace.id === 'string' && typeof data.workspace.configPath === 'string';
    }
    function isSerializedRecentFolder(data) {
        return typeof data.folderUri === 'string';
    }
    function isSerializedRecentFile(data) {
        return typeof data.fileUri === 'string';
    }
    function restoreRecentlyOpened(data, logService) {
        const result = { workspaces: [], files: [] };
        if (data) {
            const restoreGracefully = function (entries, func) {
                for (let i = 0; i < entries.length; i++) {
                    try {
                        func(entries[i], i);
                    }
                    catch (e) {
                        logService.warn(`Error restoring recent entry ${JSON.stringify(entries[i])}: ${e.toString()}. Skip entry.`);
                    }
                }
            };
            const storedRecents = data;
            if (Array.isArray(storedRecents.entries)) {
                restoreGracefully(storedRecents.entries, (entry) => {
                    const label = entry.label;
                    const remoteAuthority = entry.remoteAuthority;
                    if (isSerializedRecentWorkspace(entry)) {
                        result.workspaces.push({ label, remoteAuthority, workspace: { id: entry.workspace.id, configPath: uri_1.URI.parse(entry.workspace.configPath) } });
                    }
                    else if (isSerializedRecentFolder(entry)) {
                        result.workspaces.push({ label, remoteAuthority, folderUri: uri_1.URI.parse(entry.folderUri) });
                    }
                    else if (isSerializedRecentFile(entry)) {
                        result.files.push({ label, remoteAuthority, fileUri: uri_1.URI.parse(entry.fileUri) });
                    }
                });
            }
            else {
                const storedRecents2 = data;
                if (Array.isArray(storedRecents2.workspaces3)) {
                    restoreGracefully(storedRecents2.workspaces3, (workspace, i) => {
                        const label = (Array.isArray(storedRecents2.workspaceLabels) && storedRecents2.workspaceLabels[i]) || undefined;
                        if (typeof workspace === 'object' && typeof workspace.id === 'string' && typeof workspace.configURIPath === 'string') {
                            result.workspaces.push({ label, workspace: { id: workspace.id, configPath: uri_1.URI.parse(workspace.configURIPath) } });
                        }
                        else if (typeof workspace === 'string') {
                            result.workspaces.push({ label, folderUri: uri_1.URI.parse(workspace) });
                        }
                    });
                }
                if (Array.isArray(storedRecents2.files2)) {
                    restoreGracefully(storedRecents2.files2, (file, i) => {
                        const label = (Array.isArray(storedRecents2.fileLabels) && storedRecents2.fileLabels[i]) || undefined;
                        if (typeof file === 'string') {
                            result.files.push({ label, fileUri: uri_1.URI.parse(file) });
                        }
                    });
                }
            }
        }
        return result;
    }
    exports.restoreRecentlyOpened = restoreRecentlyOpened;
    function toStoreData(recents) {
        const serialized = { entries: [] };
        for (const recent of recents.workspaces) {
            if (isRecentFolder(recent)) {
                serialized.entries.push({ folderUri: recent.folderUri.toString(), label: recent.label, remoteAuthority: recent.remoteAuthority });
            }
            else {
                serialized.entries.push({ workspace: { id: recent.workspace.id, configPath: recent.workspace.configPath.toString() }, label: recent.label, remoteAuthority: recent.remoteAuthority });
            }
        }
        for (const recent of recents.files) {
            serialized.entries.push({ fileUri: recent.fileUri.toString(), label: recent.label, remoteAuthority: recent.remoteAuthority });
        }
        return serialized;
    }
    exports.toStoreData = toStoreData;
});
//#endregion
//# sourceMappingURL=workspaces.js.map