/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/nls!vs/platform/userDataSync/common/userDataSync", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/base/common/resources", "vs/base/common/arrays", "vs/base/common/types"], function (require, exports, instantiation_1, extensionManagement_1, platform_1, configurationRegistry_1, nls_1, jsonContributionRegistry_1, resources_1, arrays_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSyncResourceFromLocalPreview = exports.PREVIEW_DIR_NAME = exports.USER_DATA_SYNC_SCHEME = exports.IUserDataSyncLogService = exports.IUserDataSyncUtilService = exports.IUserDataAutoSyncService = exports.IUserDataAutoSyncEnablementService = exports.IUserDataSyncService = exports.IUserDataSyncResourceEnablementService = exports.getEnablementKey = exports.SYNC_SERVICE_URL_TYPE = exports.MergeState = exports.Change = exports.SyncStatus = exports.UserDataAutoSyncError = exports.UserDataSyncStoreError = exports.UserDataSyncError = exports.UserDataSyncErrorCode = exports.createSyncHeaders = exports.HEADER_EXECUTION_ID = exports.HEADER_OPERATION_ID = exports.IUserDataSyncBackupStoreService = exports.IUserDataSyncStoreService = exports.IUserDataSyncStoreManagementService = exports.ALL_SYNC_RESOURCES = exports.SyncResource = exports.isAuthenticationProvider = exports.registerConfiguration = exports.getDefaultIgnoredSettings = exports.getDisallowedIgnoredSettings = exports.CONFIGURATION_SYNC_STORE_KEY = void 0;
    exports.CONFIGURATION_SYNC_STORE_KEY = 'configurationSync.store';
    function getDisallowedIgnoredSettings() {
        const allSettings = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
        return Object.keys(allSettings).filter(setting => !!allSettings[setting].disallowSyncIgnore);
    }
    exports.getDisallowedIgnoredSettings = getDisallowedIgnoredSettings;
    function getDefaultIgnoredSettings() {
        const allSettings = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
        const ignoreSyncSettings = Object.keys(allSettings).filter(setting => !!allSettings[setting].ignoreSync);
        const machineSettings = Object.keys(allSettings).filter(setting => allSettings[setting].scope === 2 /* MACHINE */ || allSettings[setting].scope === 6 /* MACHINE_OVERRIDABLE */);
        const disallowedSettings = getDisallowedIgnoredSettings();
        return (0, arrays_1.distinct)([exports.CONFIGURATION_SYNC_STORE_KEY, ...ignoreSyncSettings, ...machineSettings, ...disallowedSettings]);
    }
    exports.getDefaultIgnoredSettings = getDefaultIgnoredSettings;
    function registerConfiguration() {
        const ignoredSettingsSchemaId = 'vscode://schemas/ignoredSettings';
        const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        configurationRegistry.registerConfiguration({
            id: 'settingsSync',
            order: 30,
            title: (0, nls_1.localize)(0, null),
            type: 'object',
            properties: {
                'settingsSync.keybindingsPerPlatform': {
                    type: 'boolean',
                    description: (0, nls_1.localize)(1, null),
                    default: true,
                    scope: 1 /* APPLICATION */,
                    tags: ['sync', 'usesOnlineServices']
                },
                'settingsSync.ignoredExtensions': {
                    'type': 'array',
                    markdownDescription: (0, nls_1.localize)(2, null),
                    items: [{
                            type: 'string',
                            pattern: extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN,
                            errorMessage: (0, nls_1.localize)(3, null)
                        }],
                    'default': [],
                    'scope': 1 /* APPLICATION */,
                    uniqueItems: true,
                    disallowSyncIgnore: true,
                    tags: ['sync', 'usesOnlineServices']
                },
                'settingsSync.ignoredSettings': {
                    'type': 'array',
                    description: (0, nls_1.localize)(4, null),
                    'default': [],
                    'scope': 1 /* APPLICATION */,
                    $ref: ignoredSettingsSchemaId,
                    additionalProperties: true,
                    uniqueItems: true,
                    disallowSyncIgnore: true,
                    tags: ['sync', 'usesOnlineServices']
                }
            }
        });
        const jsonRegistry = platform_1.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
        const registerIgnoredSettingsSchema = () => {
            const disallowedIgnoredSettings = getDisallowedIgnoredSettings();
            const defaultIgnoredSettings = getDefaultIgnoredSettings().filter(s => s !== exports.CONFIGURATION_SYNC_STORE_KEY);
            const settings = Object.keys(configurationRegistry_1.allSettings.properties).filter(setting => defaultIgnoredSettings.indexOf(setting) === -1);
            const ignoredSettings = defaultIgnoredSettings.filter(setting => disallowedIgnoredSettings.indexOf(setting) === -1);
            const ignoredSettingsSchema = {
                items: {
                    type: 'string',
                    enum: [...settings, ...ignoredSettings.map(setting => `-${setting}`)]
                },
            };
            jsonRegistry.registerSchema(ignoredSettingsSchemaId, ignoredSettingsSchema);
        };
        return configurationRegistry.onDidUpdateConfiguration(() => registerIgnoredSettingsSchema());
    }
    exports.registerConfiguration = registerConfiguration;
    function isAuthenticationProvider(thing) {
        return thing
            && (0, types_1.isObject)(thing)
            && (0, types_1.isString)(thing.id)
            && (0, types_1.isArray)(thing.scopes);
    }
    exports.isAuthenticationProvider = isAuthenticationProvider;
    var SyncResource;
    (function (SyncResource) {
        SyncResource["Settings"] = "settings";
        SyncResource["Keybindings"] = "keybindings";
        SyncResource["Snippets"] = "snippets";
        SyncResource["Extensions"] = "extensions";
        SyncResource["GlobalState"] = "globalState";
    })(SyncResource = exports.SyncResource || (exports.SyncResource = {}));
    exports.ALL_SYNC_RESOURCES = ["settings" /* Settings */, "keybindings" /* Keybindings */, "snippets" /* Snippets */, "extensions" /* Extensions */, "globalState" /* GlobalState */];
    exports.IUserDataSyncStoreManagementService = (0, instantiation_1.createDecorator)('IUserDataSyncStoreManagementService');
    exports.IUserDataSyncStoreService = (0, instantiation_1.createDecorator)('IUserDataSyncStoreService');
    exports.IUserDataSyncBackupStoreService = (0, instantiation_1.createDecorator)('IUserDataSyncBackupStoreService');
    //#endregion
    // #region User Data Sync Headers
    exports.HEADER_OPERATION_ID = 'x-operation-id';
    exports.HEADER_EXECUTION_ID = 'X-Execution-Id';
    function createSyncHeaders(executionId) {
        const headers = {};
        headers[exports.HEADER_EXECUTION_ID] = executionId;
        return headers;
    }
    exports.createSyncHeaders = createSyncHeaders;
    //#endregion
    // #region User Data Sync Error
    var UserDataSyncErrorCode;
    (function (UserDataSyncErrorCode) {
        // Client Errors (>= 400 )
        UserDataSyncErrorCode["Unauthorized"] = "Unauthorized";
        UserDataSyncErrorCode["Conflict"] = "Conflict";
        UserDataSyncErrorCode["Gone"] = "Gone";
        UserDataSyncErrorCode["PreconditionFailed"] = "PreconditionFailed";
        UserDataSyncErrorCode["TooLarge"] = "TooLarge";
        UserDataSyncErrorCode["UpgradeRequired"] = "UpgradeRequired";
        UserDataSyncErrorCode["PreconditionRequired"] = "PreconditionRequired";
        UserDataSyncErrorCode["TooManyRequests"] = "RemoteTooManyRequests";
        UserDataSyncErrorCode["TooManyRequestsAndRetryAfter"] = "TooManyRequestsAndRetryAfter";
        // Local Errors
        UserDataSyncErrorCode["RequestFailed"] = "RequestFailed";
        UserDataSyncErrorCode["RequestCanceled"] = "RequestCanceled";
        UserDataSyncErrorCode["RequestTimeout"] = "RequestTimeout";
        UserDataSyncErrorCode["NoRef"] = "NoRef";
        UserDataSyncErrorCode["TurnedOff"] = "TurnedOff";
        UserDataSyncErrorCode["SessionExpired"] = "SessionExpired";
        UserDataSyncErrorCode["ServiceChanged"] = "ServiceChanged";
        UserDataSyncErrorCode["DefaultServiceChanged"] = "DefaultServiceChanged";
        UserDataSyncErrorCode["LocalTooManyRequests"] = "LocalTooManyRequests";
        UserDataSyncErrorCode["LocalPreconditionFailed"] = "LocalPreconditionFailed";
        UserDataSyncErrorCode["LocalInvalidContent"] = "LocalInvalidContent";
        UserDataSyncErrorCode["LocalError"] = "LocalError";
        UserDataSyncErrorCode["IncompatibleLocalContent"] = "IncompatibleLocalContent";
        UserDataSyncErrorCode["IncompatibleRemoteContent"] = "IncompatibleRemoteContent";
        UserDataSyncErrorCode["UnresolvedConflicts"] = "UnresolvedConflicts";
        UserDataSyncErrorCode["Unknown"] = "Unknown";
    })(UserDataSyncErrorCode = exports.UserDataSyncErrorCode || (exports.UserDataSyncErrorCode = {}));
    class UserDataSyncError extends Error {
        constructor(message, code, resource, operationId) {
            super(message);
            this.code = code;
            this.resource = resource;
            this.operationId = operationId;
            this.name = `${this.code} (UserDataSyncError) syncResource:${this.resource || 'unknown'} operationId:${this.operationId || 'unknown'}`;
        }
    }
    exports.UserDataSyncError = UserDataSyncError;
    class UserDataSyncStoreError extends UserDataSyncError {
        constructor(message, url, code, operationId) {
            super(message, code, undefined, operationId);
            this.url = url;
        }
    }
    exports.UserDataSyncStoreError = UserDataSyncStoreError;
    class UserDataAutoSyncError extends UserDataSyncError {
        constructor(message, code) {
            super(message, code);
        }
    }
    exports.UserDataAutoSyncError = UserDataAutoSyncError;
    (function (UserDataSyncError) {
        function toUserDataSyncError(error) {
            if (error instanceof UserDataSyncError) {
                return error;
            }
            const match = /^(.+) \(UserDataSyncError\) syncResource:(.+) operationId:(.+)$/.exec(error.name);
            if (match && match[1]) {
                const syncResource = match[2] === 'unknown' ? undefined : match[2];
                const operationId = match[3] === 'unknown' ? undefined : match[3];
                return new UserDataSyncError(error.message, match[1], syncResource, operationId);
            }
            return new UserDataSyncError(error.message, UserDataSyncErrorCode.Unknown);
        }
        UserDataSyncError.toUserDataSyncError = toUserDataSyncError;
    })(UserDataSyncError = exports.UserDataSyncError || (exports.UserDataSyncError = {}));
    var SyncStatus;
    (function (SyncStatus) {
        SyncStatus["Uninitialized"] = "uninitialized";
        SyncStatus["Idle"] = "idle";
        SyncStatus["Syncing"] = "syncing";
        SyncStatus["HasConflicts"] = "hasConflicts";
    })(SyncStatus = exports.SyncStatus || (exports.SyncStatus = {}));
    var Change;
    (function (Change) {
        Change[Change["None"] = 0] = "None";
        Change[Change["Added"] = 1] = "Added";
        Change[Change["Modified"] = 2] = "Modified";
        Change[Change["Deleted"] = 3] = "Deleted";
    })(Change = exports.Change || (exports.Change = {}));
    var MergeState;
    (function (MergeState) {
        MergeState["Preview"] = "preview";
        MergeState["Conflict"] = "conflict";
        MergeState["Accepted"] = "accepted";
    })(MergeState = exports.MergeState || (exports.MergeState = {}));
    //#endregion
    // #region keys synced only in web
    exports.SYNC_SERVICE_URL_TYPE = 'sync.store.url.type';
    function getEnablementKey(resource) { return `sync.enable.${resource}`; }
    exports.getEnablementKey = getEnablementKey;
    // #endregion
    // #region User Data Sync Services
    exports.IUserDataSyncResourceEnablementService = (0, instantiation_1.createDecorator)('IUserDataSyncResourceEnablementService');
    exports.IUserDataSyncService = (0, instantiation_1.createDecorator)('IUserDataSyncService');
    exports.IUserDataAutoSyncEnablementService = (0, instantiation_1.createDecorator)('IUserDataAutoSyncEnablementService');
    exports.IUserDataAutoSyncService = (0, instantiation_1.createDecorator)('IUserDataAutoSyncService');
    exports.IUserDataSyncUtilService = (0, instantiation_1.createDecorator)('IUserDataSyncUtilService');
    exports.IUserDataSyncLogService = (0, instantiation_1.createDecorator)('IUserDataSyncLogService');
    //#endregion
    exports.USER_DATA_SYNC_SCHEME = 'vscode-userdata-sync';
    exports.PREVIEW_DIR_NAME = 'preview';
    function getSyncResourceFromLocalPreview(localPreview, environmentService) {
        if (localPreview.scheme === exports.USER_DATA_SYNC_SCHEME) {
            return undefined;
        }
        localPreview = localPreview.with({ scheme: environmentService.userDataSyncHome.scheme });
        return exports.ALL_SYNC_RESOURCES.filter(syncResource => (0, resources_1.isEqualOrParent)(localPreview, (0, resources_1.joinPath)(environmentService.userDataSyncHome, syncResource, exports.PREVIEW_DIR_NAME)))[0];
    }
    exports.getSyncResourceFromLocalPreview = getSyncResourceFromLocalPreview;
});
//# sourceMappingURL=userDataSync.js.map