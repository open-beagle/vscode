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
define(["require", "exports", "vs/platform/dialogs/common/dialogs", "vs/base/common/uri", "vs/platform/instantiation/common/extensions", "vs/workbench/services/dialogs/browser/abstractFileDialogService", "vs/base/common/network", "vs/base/common/decorators", "vs/base/common/uuid", "vs/nls!vs/workbench/services/dialogs/browser/fileDialogService"], function (require, exports, dialogs_1, uri_1, extensions_1, abstractFileDialogService_1, network_1, decorators_1, uuid_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileDialogService = void 0;
    class FileDialogService extends abstractFileDialogService_1.AbstractFileDialogService {
        get fileSystemProvider() {
            return this.fileService.getProvider(network_1.Schemas.file);
        }
        async pickFileFolderAndOpen(options) {
            const schema = this.getFileSystemSchema(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultFilePath(schema);
            }
            if (this.shouldUseSimplified(schema)) {
                return this.pickFileFolderAndOpenSimplified(schema, options, false);
            }
            throw new Error((0, nls_1.localize)(0, null));
        }
        async pickFileAndOpen(options) {
            const schema = this.getFileSystemSchema(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultFilePath(schema);
            }
            if (this.shouldUseSimplified(schema)) {
                return this.pickFileAndOpenSimplified(schema, options, false);
            }
            const [handle] = await window.showOpenFilePicker({ multiple: false });
            const uuid = (0, uuid_1.generateUuid)();
            const uri = uri_1.URI.from({ scheme: network_1.Schemas.file, path: `/${uuid}/${handle.name}` });
            this.fileSystemProvider.registerFileHandle(uuid, handle);
            await this.openerService.open(uri, { fromUserGesture: true, editorOptions: { pinned: true } });
        }
        async pickFolderAndOpen(options) {
            const schema = this.getFileSystemSchema(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultFolderPath(schema);
            }
            if (this.shouldUseSimplified(schema)) {
                return this.pickFolderAndOpenSimplified(schema, options);
            }
            throw new Error((0, nls_1.localize)(1, null));
        }
        async pickWorkspaceAndOpen(options) {
            const schema = this.getFileSystemSchema(options);
            if (!options.defaultUri) {
                options.defaultUri = await this.defaultWorkspacePath(schema);
            }
            if (this.shouldUseSimplified(schema)) {
                return this.pickWorkspaceAndOpenSimplified(schema, options);
            }
            throw new Error((0, nls_1.localize)(2, null));
        }
        async pickFileToSave(defaultUri, availableFileSystems) {
            const schema = this.getFileSystemSchema({ defaultUri, availableFileSystems });
            if (this.shouldUseSimplified(schema)) {
                return this.pickFileToSaveSimplified(schema, this.getPickFileToSaveDialogOptions(defaultUri, availableFileSystems));
            }
            const handle = await window.showSaveFilePicker();
            const uuid = (0, uuid_1.generateUuid)();
            const uri = uri_1.URI.from({ scheme: network_1.Schemas.file, path: `/${uuid}/${handle.name}` });
            this.fileSystemProvider.registerFileHandle(uuid, handle);
            return uri;
        }
        async showSaveDialog(options) {
            const schema = this.getFileSystemSchema(options);
            if (this.shouldUseSimplified(schema)) {
                return this.showSaveDialogSimplified(schema, options);
            }
            const handle = await window.showSaveFilePicker();
            const uuid = (0, uuid_1.generateUuid)();
            const uri = uri_1.URI.from({ scheme: network_1.Schemas.file, path: `/${uuid}/${handle.name}` });
            this.fileSystemProvider.registerFileHandle(uuid, handle);
            return uri;
        }
        async showOpenDialog(options) {
            const schema = this.getFileSystemSchema(options);
            if (this.shouldUseSimplified(schema)) {
                return this.showOpenDialogSimplified(schema, options);
            }
            const handle = await window.showDirectoryPicker();
            const uuid = (0, uuid_1.generateUuid)();
            const uri = uri_1.URI.from({ scheme: network_1.Schemas.file, path: `/${uuid}/${handle.name}` });
            this.fileSystemProvider.registerDirectoryHandle(uuid, handle);
            return [uri];
        }
        addFileSchemaIfNeeded(schema) {
            return schema === network_1.Schemas.untitled ? [network_1.Schemas.file] : [schema];
        }
        shouldUseSimplified(scheme) {
            return ![network_1.Schemas.file, network_1.Schemas.userData, network_1.Schemas.tmp].includes(scheme);
        }
    }
    __decorate([
        decorators_1.memoize
    ], FileDialogService.prototype, "fileSystemProvider", null);
    exports.FileDialogService = FileDialogService;
    (0, extensions_1.registerSingleton)(dialogs_1.IFileDialogService, FileDialogService, true);
});
//# sourceMappingURL=fileDialogService.js.map