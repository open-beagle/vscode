/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/platform/extensionManagement/common/extensionManagement", "vs/platform/instantiation/common/instantiation", "vs/base/common/network"], function (require, exports, nls_1, instantiation_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtensionManagementCLIService = exports.PreferencesLocalizedLabel = exports.PreferencesLabel = exports.ExtensionsChannelId = exports.ExtensionsLocalizedLabel = exports.ExtensionsLabel = exports.DefaultIconPath = exports.IExtensionTipsService = exports.IGlobalExtensionEnablementService = exports.ENABLED_EXTENSIONS_STORAGE_PATH = exports.DISABLED_EXTENSIONS_STORAGE_PATH = exports.IExtensionManagementService = exports.ExtensionManagementError = exports.INSTALL_ERROR_INCOMPATIBLE = exports.INSTALL_ERROR_MALICIOUS = exports.INSTALL_ERROR_NOT_SUPPORTED = exports.IExtensionGalleryService = exports.InstallOperation = exports.StatisticType = exports.SortOrder = exports.SortBy = exports.isIExtensionIdentifier = exports.EXTENSION_IDENTIFIER_REGEX = exports.EXTENSION_IDENTIFIER_PATTERN = void 0;
    exports.EXTENSION_IDENTIFIER_PATTERN = '^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$';
    exports.EXTENSION_IDENTIFIER_REGEX = new RegExp(exports.EXTENSION_IDENTIFIER_PATTERN);
    function isIExtensionIdentifier(thing) {
        return thing
            && typeof thing === 'object'
            && typeof thing.id === 'string'
            && (!thing.uuid || typeof thing.uuid === 'string');
    }
    exports.isIExtensionIdentifier = isIExtensionIdentifier;
    var SortBy;
    (function (SortBy) {
        SortBy[SortBy["NoneOrRelevance"] = 0] = "NoneOrRelevance";
        SortBy[SortBy["LastUpdatedDate"] = 1] = "LastUpdatedDate";
        SortBy[SortBy["Title"] = 2] = "Title";
        SortBy[SortBy["PublisherName"] = 3] = "PublisherName";
        SortBy[SortBy["InstallCount"] = 4] = "InstallCount";
        SortBy[SortBy["PublishedDate"] = 5] = "PublishedDate";
        SortBy[SortBy["AverageRating"] = 6] = "AverageRating";
        SortBy[SortBy["WeightedRating"] = 12] = "WeightedRating";
    })(SortBy = exports.SortBy || (exports.SortBy = {}));
    var SortOrder;
    (function (SortOrder) {
        SortOrder[SortOrder["Default"] = 0] = "Default";
        SortOrder[SortOrder["Ascending"] = 1] = "Ascending";
        SortOrder[SortOrder["Descending"] = 2] = "Descending";
    })(SortOrder = exports.SortOrder || (exports.SortOrder = {}));
    var StatisticType;
    (function (StatisticType) {
        StatisticType["Uninstall"] = "uninstall";
    })(StatisticType = exports.StatisticType || (exports.StatisticType = {}));
    var InstallOperation;
    (function (InstallOperation) {
        InstallOperation[InstallOperation["None"] = 0] = "None";
        InstallOperation[InstallOperation["Install"] = 1] = "Install";
        InstallOperation[InstallOperation["Update"] = 2] = "Update";
    })(InstallOperation = exports.InstallOperation || (exports.InstallOperation = {}));
    exports.IExtensionGalleryService = (0, instantiation_1.createDecorator)('extensionGalleryService');
    exports.INSTALL_ERROR_NOT_SUPPORTED = 'notsupported';
    exports.INSTALL_ERROR_MALICIOUS = 'malicious';
    exports.INSTALL_ERROR_INCOMPATIBLE = 'incompatible';
    class ExtensionManagementError extends Error {
        constructor(message, code) {
            super(message);
            this.code = code;
        }
    }
    exports.ExtensionManagementError = ExtensionManagementError;
    exports.IExtensionManagementService = (0, instantiation_1.createDecorator)('extensionManagementService');
    exports.DISABLED_EXTENSIONS_STORAGE_PATH = 'extensionsIdentifiers/disabled';
    exports.ENABLED_EXTENSIONS_STORAGE_PATH = 'extensionsIdentifiers/enabled';
    exports.IGlobalExtensionEnablementService = (0, instantiation_1.createDecorator)('IGlobalExtensionEnablementService');
    exports.IExtensionTipsService = (0, instantiation_1.createDecorator)('IExtensionTipsService');
    exports.DefaultIconPath = network_1.FileAccess.asBrowserUri('./media/defaultIcon.png', require).toString(true);
    exports.ExtensionsLabel = (0, nls_1.localize)(0, null);
    exports.ExtensionsLocalizedLabel = { value: exports.ExtensionsLabel, original: 'Extensions' };
    exports.ExtensionsChannelId = 'extensions';
    exports.PreferencesLabel = (0, nls_1.localize)(1, null);
    exports.PreferencesLocalizedLabel = { value: exports.PreferencesLabel, original: 'Preferences' };
    exports.IExtensionManagementCLIService = (0, instantiation_1.createDecorator)('IExtensionManagementCLIService');
});
//# sourceMappingURL=extensionManagement.js.map