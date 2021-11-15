/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/resources", "vs/platform/instantiation/common/instantiation", "vs/base/common/map"], function (require, exports, uri_1, resources_1, instantiation_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toWorkspaceFolder = exports.WorkspaceFolder = exports.Workspace = exports.isWorkspaceFolder = exports.isWorkspace = exports.WorkbenchState = exports.IWorkspaceContextService = void 0;
    exports.IWorkspaceContextService = (0, instantiation_1.createDecorator)('contextService');
    var WorkbenchState;
    (function (WorkbenchState) {
        WorkbenchState[WorkbenchState["EMPTY"] = 1] = "EMPTY";
        WorkbenchState[WorkbenchState["FOLDER"] = 2] = "FOLDER";
        WorkbenchState[WorkbenchState["WORKSPACE"] = 3] = "WORKSPACE";
    })(WorkbenchState = exports.WorkbenchState || (exports.WorkbenchState = {}));
    function isWorkspace(thing) {
        const candidate = thing;
        return !!(candidate && typeof candidate === 'object'
            && typeof candidate.id === 'string'
            && Array.isArray(candidate.folders));
    }
    exports.isWorkspace = isWorkspace;
    function isWorkspaceFolder(thing) {
        const candidate = thing;
        return !!(candidate && typeof candidate === 'object'
            && uri_1.URI.isUri(candidate.uri)
            && typeof candidate.name === 'string'
            && typeof candidate.toResource === 'function');
    }
    exports.isWorkspaceFolder = isWorkspaceFolder;
    class Workspace {
        constructor(_id, folders, _configuration, _ignorePathCasing) {
            this._id = _id;
            this._configuration = _configuration;
            this._ignorePathCasing = _ignorePathCasing;
            this._foldersMap = map_1.TernarySearchTree.forUris(this._ignorePathCasing);
            this.folders = folders;
        }
        update(workspace) {
            this._id = workspace.id;
            this._configuration = workspace.configuration;
            this._ignorePathCasing = workspace._ignorePathCasing;
            this.folders = workspace.folders;
        }
        get folders() {
            return this._folders;
        }
        set folders(folders) {
            this._folders = folders;
            this.updateFoldersMap();
        }
        get id() {
            return this._id;
        }
        get configuration() {
            return this._configuration;
        }
        set configuration(configuration) {
            this._configuration = configuration;
        }
        getFolder(resource) {
            if (!resource) {
                return null;
            }
            return this._foldersMap.findSubstr(resource.with({
                scheme: resource.scheme,
                authority: resource.authority,
                path: resource.path
            })) || null;
        }
        updateFoldersMap() {
            this._foldersMap = map_1.TernarySearchTree.forUris(this._ignorePathCasing);
            for (const folder of this.folders) {
                this._foldersMap.set(folder.uri, folder);
            }
        }
        toJSON() {
            return { id: this.id, folders: this.folders, configuration: this.configuration };
        }
    }
    exports.Workspace = Workspace;
    class WorkspaceFolder {
        constructor(data, raw) {
            this.raw = raw;
            this.uri = data.uri;
            this.index = data.index;
            this.name = data.name;
        }
        toResource(relativePath) {
            return (0, resources_1.joinPath)(this.uri, relativePath);
        }
        toJSON() {
            return { uri: this.uri, name: this.name, index: this.index };
        }
    }
    exports.WorkspaceFolder = WorkspaceFolder;
    function toWorkspaceFolder(resource) {
        return new WorkspaceFolder({ uri: resource, index: 0, name: (0, resources_1.basenameOrAuthority)(resource) }, { uri: resource.toString() });
    }
    exports.toWorkspaceFolder = toWorkspaceFolder;
});
//# sourceMappingURL=workspace.js.map