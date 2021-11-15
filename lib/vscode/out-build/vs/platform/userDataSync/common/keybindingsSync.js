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
define(["require", "exports", "vs/platform/files/common/files", "vs/platform/userDataSync/common/userDataSync", "vs/platform/userDataSync/common/keybindingsMerge", "vs/base/common/json", "vs/nls!vs/platform/userDataSync/common/keybindingsSync", "vs/platform/environment/common/environment", "vs/platform/configuration/common/configuration", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/arrays", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/base/common/buffer", "vs/base/common/event"], function (require, exports, files_1, userDataSync_1, keybindingsMerge_1, json_1, nls_1, environment_1, configuration_1, platform_1, types_1, arrays_1, abstractSynchronizer_1, telemetry_1, storage_1, buffer_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KeybindingsInitializer = exports.KeybindingsSynchroniser = exports.getKeybindingsContentFromSyncContent = void 0;
    function getKeybindingsContentFromSyncContent(syncContent, platformSpecific) {
        const parsed = JSON.parse(syncContent);
        if (!platformSpecific) {
            return (0, types_1.isUndefined)(parsed.all) ? null : parsed.all;
        }
        switch (platform_1.OS) {
            case 2 /* Macintosh */:
                return (0, types_1.isUndefined)(parsed.mac) ? null : parsed.mac;
            case 3 /* Linux */:
                return (0, types_1.isUndefined)(parsed.linux) ? null : parsed.linux;
            case 1 /* Windows */:
                return (0, types_1.isUndefined)(parsed.windows) ? null : parsed.windows;
        }
    }
    exports.getKeybindingsContentFromSyncContent = getKeybindingsContentFromSyncContent;
    let KeybindingsSynchroniser = class KeybindingsSynchroniser extends abstractSynchronizer_1.AbstractJsonFileSynchroniser {
        constructor(userDataSyncStoreService, userDataSyncBackupStoreService, logService, configurationService, userDataSyncResourceEnablementService, fileService, environmentService, storageService, userDataSyncUtilService, telemetryService) {
            super(environmentService.keybindingsResource, "keybindings" /* Keybindings */, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncBackupStoreService, userDataSyncResourceEnablementService, telemetryService, logService, userDataSyncUtilService, configurationService);
            /* Version 2: Change settings from `sync.${setting}` to `settingsSync.{setting}` */
            this.version = 2;
            this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'keybindings.json');
            this.localResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' });
            this.remoteResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' });
            this.acceptedResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' });
            this._register(event_1.Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.keybindingsPerPlatform'))(() => this.triggerLocalChange()));
        }
        async generateSyncPreview(remoteUserData, lastSyncUserData, token) {
            const remoteContent = remoteUserData.syncData ? this.getKeybindingsContentFromSyncContent(remoteUserData.syncData.content) : null;
            const lastSyncContent = lastSyncUserData ? this.getKeybindingsContentFromLastSyncUserData(lastSyncUserData) : null;
            // Get file content last to get the latest
            const fileContent = await this.getLocalFileContent();
            const formattingOptions = await this.getFormattingOptions();
            let mergedContent = null;
            let hasLocalChanged = false;
            let hasRemoteChanged = false;
            let hasConflicts = false;
            if (remoteContent) {
                let localContent = fileContent ? fileContent.value.toString() : '[]';
                localContent = localContent || '[]';
                if (this.hasErrors(localContent)) {
                    throw new userDataSync_1.UserDataSyncError((0, nls_1.localize)(0, null), userDataSync_1.UserDataSyncErrorCode.LocalInvalidContent, this.resource);
                }
                if (!lastSyncContent // First time sync
                    || lastSyncContent !== localContent // Local has forwarded
                    || lastSyncContent !== remoteContent // Remote has forwarded
                ) {
                    this.logService.trace(`${this.syncResourceLogLabel}: Merging remote keybindings with local keybindings...`);
                    const result = await (0, keybindingsMerge_1.merge)(localContent, remoteContent, lastSyncContent, formattingOptions, this.userDataSyncUtilService);
                    // Sync only if there are changes
                    if (result.hasChanges) {
                        mergedContent = result.mergeContent;
                        hasConflicts = result.hasConflicts;
                        hasLocalChanged = hasConflicts || result.mergeContent !== localContent;
                        hasRemoteChanged = hasConflicts || result.mergeContent !== remoteContent;
                    }
                }
            }
            // First time syncing to remote
            else if (fileContent) {
                this.logService.trace(`${this.syncResourceLogLabel}: Remote keybindings does not exist. Synchronizing keybindings for the first time.`);
                mergedContent = fileContent.value.toString();
                hasRemoteChanged = true;
            }
            const previewResult = {
                content: mergedContent,
                localChange: hasLocalChanged ? fileContent ? 2 /* Modified */ : 1 /* Added */ : 0 /* None */,
                remoteChange: hasRemoteChanged ? 2 /* Modified */ : 0 /* None */,
                hasConflicts
            };
            return [{
                    fileContent,
                    localResource: this.localResource,
                    localContent: fileContent ? fileContent.value.toString() : null,
                    localChange: previewResult.localChange,
                    remoteResource: this.remoteResource,
                    remoteContent,
                    remoteChange: previewResult.remoteChange,
                    previewResource: this.previewResource,
                    previewResult,
                    acceptedResource: this.acceptedResource,
                }];
        }
        async getMergeResult(resourcePreview, token) {
            return resourcePreview.previewResult;
        }
        async getAcceptResult(resourcePreview, resource, content, token) {
            /* Accept local resource */
            if (this.extUri.isEqual(resource, this.localResource)) {
                return {
                    content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
                    localChange: 0 /* None */,
                    remoteChange: 2 /* Modified */,
                };
            }
            /* Accept remote resource */
            if (this.extUri.isEqual(resource, this.remoteResource)) {
                return {
                    content: resourcePreview.remoteContent,
                    localChange: 2 /* Modified */,
                    remoteChange: 0 /* None */,
                };
            }
            /* Accept preview resource */
            if (this.extUri.isEqual(resource, this.previewResource)) {
                if (content === undefined) {
                    return {
                        content: resourcePreview.previewResult.content,
                        localChange: resourcePreview.previewResult.localChange,
                        remoteChange: resourcePreview.previewResult.remoteChange,
                    };
                }
                else {
                    return {
                        content,
                        localChange: 2 /* Modified */,
                        remoteChange: 2 /* Modified */,
                    };
                }
            }
            throw new Error(`Invalid Resource: ${resource.toString()}`);
        }
        async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            var _a;
            const { fileContent } = resourcePreviews[0][0];
            let { content, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* None */ && remoteChange === 0 /* None */) {
                this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing keybindings.`);
            }
            if (content !== null) {
                content = content.trim();
                content = content || '[]';
                if (this.hasErrors(content)) {
                    throw new userDataSync_1.UserDataSyncError((0, nls_1.localize)(1, null), userDataSync_1.UserDataSyncErrorCode.LocalInvalidContent, this.resource);
                }
            }
            if (localChange !== 0 /* None */) {
                this.logService.trace(`${this.syncResourceLogLabel}: Updating local keybindings...`);
                if (fileContent) {
                    await this.backupLocal(this.toSyncContent(fileContent.value.toString()));
                }
                await this.updateLocalFileContent(content || '[]', fileContent, force);
                this.logService.info(`${this.syncResourceLogLabel}: Updated local keybindings`);
            }
            if (remoteChange !== 0 /* None */) {
                this.logService.trace(`${this.syncResourceLogLabel}: Updating remote keybindings...`);
                const remoteContents = this.toSyncContent(content || '[]', (_a = remoteUserData.syncData) === null || _a === void 0 ? void 0 : _a.content);
                remoteUserData = await this.updateRemoteUserData(remoteContents, force ? null : remoteUserData.ref);
                this.logService.info(`${this.syncResourceLogLabel}: Updated remote keybindings`);
            }
            // Delete the preview
            try {
                await this.fileService.del(this.previewResource);
            }
            catch (e) { /* ignore */ }
            if ((lastSyncUserData === null || lastSyncUserData === void 0 ? void 0 : lastSyncUserData.ref) !== remoteUserData.ref) {
                this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized keybindings...`);
                await this.updateLastSyncUserData(remoteUserData, { platformSpecific: this.syncKeybindingsPerPlatform() });
                this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized keybindings`);
            }
        }
        async hasLocalData() {
            try {
                const localFileContent = await this.getLocalFileContent();
                if (localFileContent) {
                    const keybindings = (0, json_1.parse)(localFileContent.value.toString());
                    if ((0, arrays_1.isNonEmptyArray)(keybindings)) {
                        return true;
                    }
                }
            }
            catch (error) {
                if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */) {
                    return true;
                }
            }
            return false;
        }
        async getAssociatedResources({ uri }) {
            const comparableResource = (await this.fileService.exists(this.file)) ? this.file : this.localResource;
            return [{ resource: this.extUri.joinPath(uri, 'keybindings.json'), comparableResource }];
        }
        async resolveContent(uri) {
            if (this.extUri.isEqual(this.remoteResource, uri) || this.extUri.isEqual(this.localResource, uri) || this.extUri.isEqual(this.acceptedResource, uri)) {
                return this.resolvePreviewContent(uri);
            }
            let content = await super.resolveContent(uri);
            if (content) {
                return content;
            }
            content = await super.resolveContent(this.extUri.dirname(uri));
            if (content) {
                const syncData = this.parseSyncData(content);
                if (syncData) {
                    switch (this.extUri.basename(uri)) {
                        case 'keybindings.json':
                            return this.getKeybindingsContentFromSyncContent(syncData.content);
                    }
                }
            }
            return null;
        }
        getKeybindingsContentFromLastSyncUserData(lastSyncUserData) {
            if (!lastSyncUserData.syncData) {
                return null;
            }
            // Return null if there is a change in platform specific property from last time sync.
            if (lastSyncUserData.platformSpecific !== undefined && lastSyncUserData.platformSpecific !== this.syncKeybindingsPerPlatform()) {
                return null;
            }
            return this.getKeybindingsContentFromSyncContent(lastSyncUserData.syncData.content);
        }
        getKeybindingsContentFromSyncContent(syncContent) {
            try {
                return getKeybindingsContentFromSyncContent(syncContent, this.syncKeybindingsPerPlatform());
            }
            catch (e) {
                this.logService.error(e);
                return null;
            }
        }
        toSyncContent(keybindingsContent, syncContent) {
            let parsed = {};
            try {
                parsed = JSON.parse(syncContent || '{}');
            }
            catch (e) {
                this.logService.error(e);
            }
            if (!this.syncKeybindingsPerPlatform()) {
                parsed.all = keybindingsContent;
            }
            else {
                delete parsed.all;
            }
            switch (platform_1.OS) {
                case 2 /* Macintosh */:
                    parsed.mac = keybindingsContent;
                    break;
                case 3 /* Linux */:
                    parsed.linux = keybindingsContent;
                    break;
                case 1 /* Windows */:
                    parsed.windows = keybindingsContent;
                    break;
            }
            return JSON.stringify(parsed);
        }
        syncKeybindingsPerPlatform() {
            let userValue = this.configurationService.inspect('settingsSync.keybindingsPerPlatform').userValue;
            if (userValue !== undefined) {
                return userValue;
            }
            userValue = this.configurationService.inspect('sync.keybindingsPerPlatform').userValue;
            if (userValue !== undefined) {
                return userValue;
            }
            return this.configurationService.getValue('settingsSync.keybindingsPerPlatform');
        }
    };
    KeybindingsSynchroniser = __decorate([
        __param(0, userDataSync_1.IUserDataSyncStoreService),
        __param(1, userDataSync_1.IUserDataSyncBackupStoreService),
        __param(2, userDataSync_1.IUserDataSyncLogService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, userDataSync_1.IUserDataSyncResourceEnablementService),
        __param(5, files_1.IFileService),
        __param(6, environment_1.IEnvironmentService),
        __param(7, storage_1.IStorageService),
        __param(8, userDataSync_1.IUserDataSyncUtilService),
        __param(9, telemetry_1.ITelemetryService)
    ], KeybindingsSynchroniser);
    exports.KeybindingsSynchroniser = KeybindingsSynchroniser;
    let KeybindingsInitializer = class KeybindingsInitializer extends abstractSynchronizer_1.AbstractInitializer {
        constructor(fileService, environmentService, logService) {
            super("keybindings" /* Keybindings */, environmentService, logService, fileService);
        }
        async doInitialize(remoteUserData) {
            const keybindingsContent = remoteUserData.syncData ? this.getKeybindingsContentFromSyncContent(remoteUserData.syncData.content) : null;
            if (!keybindingsContent) {
                this.logService.info('Skipping initializing keybindings because remote keybindings does not exist.');
                return;
            }
            const isEmpty = await this.isEmpty();
            if (!isEmpty) {
                this.logService.info('Skipping initializing keybindings because local keybindings exist.');
                return;
            }
            await this.fileService.writeFile(this.environmentService.keybindingsResource, buffer_1.VSBuffer.fromString(keybindingsContent));
            await this.updateLastSyncUserData(remoteUserData);
        }
        async isEmpty() {
            try {
                const fileContent = await this.fileService.readFile(this.environmentService.settingsResource);
                const keybindings = (0, json_1.parse)(fileContent.value.toString());
                return !(0, arrays_1.isNonEmptyArray)(keybindings);
            }
            catch (error) {
                return error.fileOperationResult === 1 /* FILE_NOT_FOUND */;
            }
        }
        getKeybindingsContentFromSyncContent(syncContent) {
            try {
                return getKeybindingsContentFromSyncContent(syncContent, true);
            }
            catch (e) {
                this.logService.error(e);
                return null;
            }
        }
    };
    KeybindingsInitializer = __decorate([
        __param(0, files_1.IFileService),
        __param(1, environment_1.IEnvironmentService),
        __param(2, userDataSync_1.IUserDataSyncLogService)
    ], KeybindingsInitializer);
    exports.KeybindingsInitializer = KeybindingsInitializer;
});
//# sourceMappingURL=keybindingsSync.js.map