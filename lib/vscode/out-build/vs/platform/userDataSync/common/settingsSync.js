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
define(["require", "exports", "vs/platform/files/common/files", "vs/platform/userDataSync/common/userDataSync", "vs/base/common/buffer", "vs/nls!vs/platform/userDataSync/common/settingsSync", "vs/base/common/event", "vs/platform/environment/common/environment", "vs/platform/configuration/common/configuration", "vs/platform/userDataSync/common/settingsMerge", "vs/platform/userDataSync/common/content", "vs/platform/userDataSync/common/abstractSynchronizer", "vs/platform/telemetry/common/telemetry", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/storage/common/storage", "vs/base/common/jsonEdit"], function (require, exports, files_1, userDataSync_1, buffer_1, nls_1, event_1, environment_1, configuration_1, settingsMerge_1, content_1, abstractSynchronizer_1, telemetry_1, extensionManagement_1, storage_1, jsonEdit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SettingsInitializer = exports.SettingsSynchroniser = exports.parseSettingsSyncContent = void 0;
    function isSettingsSyncContent(thing) {
        return thing
            && (thing.settings && typeof thing.settings === 'string')
            && Object.keys(thing).length === 1;
    }
    function parseSettingsSyncContent(syncContent) {
        const parsed = JSON.parse(syncContent);
        return isSettingsSyncContent(parsed) ? parsed : /* migrate */ { settings: syncContent };
    }
    exports.parseSettingsSyncContent = parseSettingsSyncContent;
    let SettingsSynchroniser = class SettingsSynchroniser extends abstractSynchronizer_1.AbstractJsonFileSynchroniser {
        constructor(fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncBackupStoreService, logService, userDataSyncUtilService, configurationService, userDataSyncResourceEnablementService, telemetryService, extensionManagementService) {
            super(environmentService.settingsResource, "settings" /* Settings */, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncBackupStoreService, userDataSyncResourceEnablementService, telemetryService, logService, userDataSyncUtilService, configurationService);
            this.extensionManagementService = extensionManagementService;
            /* Version 2: Change settings from `sync.${setting}` to `settingsSync.{setting}` */
            this.version = 2;
            this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'settings.json');
            this.localResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'local' });
            this.remoteResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'remote' });
            this.acceptedResource = this.previewResource.with({ scheme: userDataSync_1.USER_DATA_SYNC_SCHEME, authority: 'accepted' });
            this._defaultIgnoredSettings = undefined;
        }
        async generateSyncPreview(remoteUserData, lastSyncUserData, token) {
            const fileContent = await this.getLocalFileContent();
            const formattingOptions = await this.getFormattingOptions();
            const remoteSettingsSyncContent = this.getSettingsSyncContent(remoteUserData);
            const lastSettingsSyncContent = lastSyncUserData ? this.getSettingsSyncContent(lastSyncUserData) : null;
            const ignoredSettings = await this.getIgnoredSettings();
            let mergedContent = null;
            let hasLocalChanged = false;
            let hasRemoteChanged = false;
            let hasConflicts = false;
            if (remoteSettingsSyncContent) {
                let localContent = fileContent ? fileContent.value.toString().trim() : '{}';
                localContent = localContent || '{}';
                this.validateContent(localContent);
                this.logService.trace(`${this.syncResourceLogLabel}: Merging remote settings with local settings...`);
                const result = (0, settingsMerge_1.merge)(localContent, remoteSettingsSyncContent.settings, lastSettingsSyncContent ? lastSettingsSyncContent.settings : null, ignoredSettings, [], formattingOptions);
                mergedContent = result.localContent || result.remoteContent;
                hasLocalChanged = result.localContent !== null;
                hasRemoteChanged = result.remoteContent !== null;
                hasConflicts = result.hasConflicts;
            }
            // First time syncing to remote
            else if (fileContent) {
                this.logService.trace(`${this.syncResourceLogLabel}: Remote settings does not exist. Synchronizing settings for the first time.`);
                mergedContent = fileContent.value.toString();
                hasRemoteChanged = true;
            }
            const previewResult = {
                content: mergedContent,
                localChange: hasLocalChanged ? 2 /* Modified */ : 0 /* None */,
                remoteChange: hasRemoteChanged ? 2 /* Modified */ : 0 /* None */,
                hasConflicts
            };
            return [{
                    fileContent,
                    localResource: this.localResource,
                    localContent: fileContent ? fileContent.value.toString() : null,
                    localChange: previewResult.localChange,
                    remoteResource: this.remoteResource,
                    remoteContent: remoteSettingsSyncContent ? remoteSettingsSyncContent.settings : null,
                    remoteChange: previewResult.remoteChange,
                    previewResource: this.previewResource,
                    previewResult,
                    acceptedResource: this.acceptedResource,
                }];
        }
        async getMergeResult(resourcePreview, token) {
            const formatUtils = await this.getFormattingOptions();
            const ignoredSettings = await this.getIgnoredSettings();
            return Object.assign(Object.assign({}, resourcePreview.previewResult), { 
                // remove ignored settings from the preview content
                content: resourcePreview.previewResult.content ? (0, settingsMerge_1.updateIgnoredSettings)(resourcePreview.previewResult.content, '{}', ignoredSettings, formatUtils) : null });
        }
        async getAcceptResult(resourcePreview, resource, content, token) {
            const formattingOptions = await this.getFormattingOptions();
            const ignoredSettings = await this.getIgnoredSettings();
            /* Accept local resource */
            if (this.extUri.isEqual(resource, this.localResource)) {
                return {
                    /* Remove ignored settings */
                    content: resourcePreview.fileContent ? (0, settingsMerge_1.updateIgnoredSettings)(resourcePreview.fileContent.value.toString(), '{}', ignoredSettings, formattingOptions) : null,
                    localChange: 0 /* None */,
                    remoteChange: 2 /* Modified */,
                };
            }
            /* Accept remote resource */
            if (this.extUri.isEqual(resource, this.remoteResource)) {
                return {
                    /* Update ignored settings from local file content */
                    content: resourcePreview.remoteContent !== null ? (0, settingsMerge_1.updateIgnoredSettings)(resourcePreview.remoteContent, resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : '{}', ignoredSettings, formattingOptions) : null,
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
                        /* Add ignored settings from local file content */
                        content: content !== null ? (0, settingsMerge_1.updateIgnoredSettings)(content, resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : '{}', ignoredSettings, formattingOptions) : null,
                        localChange: 2 /* Modified */,
                        remoteChange: 2 /* Modified */,
                    };
                }
            }
            throw new Error(`Invalid Resource: ${resource.toString()}`);
        }
        async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
            const { fileContent } = resourcePreviews[0][0];
            let { content, localChange, remoteChange } = resourcePreviews[0][1];
            if (localChange === 0 /* None */ && remoteChange === 0 /* None */) {
                this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing settings.`);
            }
            content = content ? content.trim() : '{}';
            content = content || '{}';
            this.validateContent(content);
            if (localChange !== 0 /* None */) {
                this.logService.trace(`${this.syncResourceLogLabel}: Updating local settings...`);
                if (fileContent) {
                    await this.backupLocal(JSON.stringify(this.toSettingsSyncContent(fileContent.value.toString())));
                }
                await this.updateLocalFileContent(content, fileContent, force);
                await this.configurationService.reloadConfiguration(2 /* USER_LOCAL */);
                this.logService.info(`${this.syncResourceLogLabel}: Updated local settings`);
            }
            if (remoteChange !== 0 /* None */) {
                const formatUtils = await this.getFormattingOptions();
                // Update ignored settings from remote
                const remoteSettingsSyncContent = this.getSettingsSyncContent(remoteUserData);
                const ignoredSettings = await this.getIgnoredSettings(content);
                content = (0, settingsMerge_1.updateIgnoredSettings)(content, remoteSettingsSyncContent ? remoteSettingsSyncContent.settings : '{}', ignoredSettings, formatUtils);
                this.logService.trace(`${this.syncResourceLogLabel}: Updating remote settings...`);
                remoteUserData = await this.updateRemoteUserData(JSON.stringify(this.toSettingsSyncContent(content)), force ? null : remoteUserData.ref);
                this.logService.info(`${this.syncResourceLogLabel}: Updated remote settings`);
            }
            // Delete the preview
            try {
                await this.fileService.del(this.previewResource);
            }
            catch (e) { /* ignore */ }
            if ((lastSyncUserData === null || lastSyncUserData === void 0 ? void 0 : lastSyncUserData.ref) !== remoteUserData.ref) {
                this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized settings...`);
                await this.updateLastSyncUserData(remoteUserData);
                this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized settings`);
            }
        }
        async hasLocalData() {
            try {
                const localFileContent = await this.getLocalFileContent();
                if (localFileContent) {
                    const formatUtils = await this.getFormattingOptions();
                    const content = (0, content_1.edit)(localFileContent.value.toString(), [userDataSync_1.CONFIGURATION_SYNC_STORE_KEY], undefined, formatUtils);
                    return !(0, settingsMerge_1.isEmpty)(content);
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
            return [{ resource: this.extUri.joinPath(uri, 'settings.json'), comparableResource }];
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
                    const settingsSyncContent = this.parseSettingsSyncContent(syncData.content);
                    if (settingsSyncContent) {
                        switch (this.extUri.basename(uri)) {
                            case 'settings.json':
                                return settingsSyncContent.settings;
                        }
                    }
                }
            }
            return null;
        }
        async resolvePreviewContent(resource) {
            let content = await super.resolvePreviewContent(resource);
            if (content) {
                const formatUtils = await this.getFormattingOptions();
                // remove ignored settings from the preview content
                const ignoredSettings = await this.getIgnoredSettings();
                content = (0, settingsMerge_1.updateIgnoredSettings)(content, '{}', ignoredSettings, formatUtils);
            }
            return content;
        }
        getSettingsSyncContent(remoteUserData) {
            return remoteUserData.syncData ? this.parseSettingsSyncContent(remoteUserData.syncData.content) : null;
        }
        parseSettingsSyncContent(syncContent) {
            try {
                return parseSettingsSyncContent(syncContent);
            }
            catch (e) {
                this.logService.error(e);
            }
            return null;
        }
        toSettingsSyncContent(settings) {
            return { settings };
        }
        async getIgnoredSettings(content) {
            if (!this._defaultIgnoredSettings) {
                this._defaultIgnoredSettings = this.userDataSyncUtilService.resolveDefaultIgnoredSettings();
                const disposable = event_1.Event.any(event_1.Event.filter(this.extensionManagementService.onDidInstallExtension, (e => !!e.gallery)), event_1.Event.filter(this.extensionManagementService.onDidUninstallExtension, (e => !e.error)))(() => {
                    disposable.dispose();
                    this._defaultIgnoredSettings = undefined;
                });
            }
            const defaultIgnoredSettings = await this._defaultIgnoredSettings;
            return (0, settingsMerge_1.getIgnoredSettings)(defaultIgnoredSettings, this.configurationService, content);
        }
        validateContent(content) {
            if (this.hasErrors(content)) {
                throw new userDataSync_1.UserDataSyncError((0, nls_1.localize)(0, null), userDataSync_1.UserDataSyncErrorCode.LocalInvalidContent, this.resource);
            }
        }
        async recoverSettings() {
            try {
                const fileContent = await this.getLocalFileContent();
                if (!fileContent) {
                    return;
                }
                const syncData = JSON.parse(fileContent.value.toString());
                if (!isSyncData(syncData)) {
                    return;
                }
                this.telemetryService.publicLog2('sync/settingsCorrupted');
                const settingsSyncContent = this.parseSettingsSyncContent(syncData.content);
                if (!settingsSyncContent || !settingsSyncContent.settings) {
                    return;
                }
                let settings = settingsSyncContent.settings;
                const formattingOptions = await this.getFormattingOptions();
                for (const key in syncData) {
                    if (['version', 'content', 'machineId'].indexOf(key) === -1 && syncData[key] !== undefined) {
                        const edits = (0, jsonEdit_1.setProperty)(settings, [key], syncData[key], formattingOptions);
                        if (edits.length) {
                            settings = (0, jsonEdit_1.applyEdits)(settings, edits);
                        }
                    }
                }
                await this.fileService.writeFile(this.file, buffer_1.VSBuffer.fromString(settings));
            }
            catch (e) { /* ignore */ }
        }
    };
    SettingsSynchroniser = __decorate([
        __param(0, files_1.IFileService),
        __param(1, environment_1.IEnvironmentService),
        __param(2, storage_1.IStorageService),
        __param(3, userDataSync_1.IUserDataSyncStoreService),
        __param(4, userDataSync_1.IUserDataSyncBackupStoreService),
        __param(5, userDataSync_1.IUserDataSyncLogService),
        __param(6, userDataSync_1.IUserDataSyncUtilService),
        __param(7, configuration_1.IConfigurationService),
        __param(8, userDataSync_1.IUserDataSyncResourceEnablementService),
        __param(9, telemetry_1.ITelemetryService),
        __param(10, extensionManagement_1.IExtensionManagementService)
    ], SettingsSynchroniser);
    exports.SettingsSynchroniser = SettingsSynchroniser;
    let SettingsInitializer = class SettingsInitializer extends abstractSynchronizer_1.AbstractInitializer {
        constructor(fileService, environmentService, logService) {
            super("settings" /* Settings */, environmentService, logService, fileService);
        }
        async doInitialize(remoteUserData) {
            const settingsSyncContent = remoteUserData.syncData ? this.parseSettingsSyncContent(remoteUserData.syncData.content) : null;
            if (!settingsSyncContent) {
                this.logService.info('Skipping initializing settings because remote settings does not exist.');
                return;
            }
            const isEmpty = await this.isEmpty();
            if (!isEmpty) {
                this.logService.info('Skipping initializing settings because local settings exist.');
                return;
            }
            await this.fileService.writeFile(this.environmentService.settingsResource, buffer_1.VSBuffer.fromString(settingsSyncContent.settings));
            await this.updateLastSyncUserData(remoteUserData);
        }
        async isEmpty() {
            try {
                const fileContent = await this.fileService.readFile(this.environmentService.settingsResource);
                return (0, settingsMerge_1.isEmpty)(fileContent.value.toString().trim());
            }
            catch (error) {
                return error.fileOperationResult === 1 /* FILE_NOT_FOUND */;
            }
        }
        parseSettingsSyncContent(syncContent) {
            try {
                return parseSettingsSyncContent(syncContent);
            }
            catch (e) {
                this.logService.error(e);
            }
            return null;
        }
    };
    SettingsInitializer = __decorate([
        __param(0, files_1.IFileService),
        __param(1, environment_1.IEnvironmentService),
        __param(2, userDataSync_1.IUserDataSyncLogService)
    ], SettingsInitializer);
    exports.SettingsInitializer = SettingsInitializer;
    function isSyncData(thing) {
        if (thing
            && (thing.version !== undefined && typeof thing.version === 'number')
            && (thing.content !== undefined && typeof thing.content === 'string')
            && (thing.machineId !== undefined && typeof thing.machineId === 'string')) {
            return true;
        }
        return false;
    }
});
//# sourceMappingURL=settingsSync.js.map