/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/preferences/common/preferences", "vs/platform/editor/common/editor", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor"], function (require, exports, nls_1, editor_1, instantiation_1, editor_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.USE_SPLIT_JSON_SETTING = exports.DEFAULT_SETTINGS_EDITOR_SETTING = exports.FOLDER_SETTINGS_PATH = exports.getSettingsTargetName = exports.IPreferencesService = exports.SettingsEditorOptions = exports.SettingValueType = void 0;
    var SettingValueType;
    (function (SettingValueType) {
        SettingValueType["Null"] = "null";
        SettingValueType["Enum"] = "enum";
        SettingValueType["String"] = "string";
        SettingValueType["Integer"] = "integer";
        SettingValueType["Number"] = "number";
        SettingValueType["Boolean"] = "boolean";
        SettingValueType["ArrayOfString"] = "array-of-string";
        SettingValueType["Exclude"] = "exclude";
        SettingValueType["Complex"] = "complex";
        SettingValueType["NullableInteger"] = "nullable-integer";
        SettingValueType["NullableNumber"] = "nullable-number";
        SettingValueType["Object"] = "object";
    })(SettingValueType = exports.SettingValueType || (exports.SettingValueType = {}));
    class SettingsEditorOptions extends editor_2.EditorOptions {
        static create(options) {
            const newOptions = new SettingsEditorOptions();
            options = Object.assign(Object.assign({}, {
                override: editor_1.EditorOverride.DISABLED,
                pinned: true
            }), options);
            newOptions.overwrite(options);
            newOptions.target = options.target;
            newOptions.folderUri = options.folderUri;
            newOptions.query = options.query;
            newOptions.revealSetting = options.revealSetting;
            newOptions.focusSearch = options.focusSearch;
            return newOptions;
        }
    }
    exports.SettingsEditorOptions = SettingsEditorOptions;
    exports.IPreferencesService = (0, instantiation_1.createDecorator)('preferencesService');
    function getSettingsTargetName(target, resource, workspaceContextService) {
        switch (target) {
            case 1 /* USER */:
            case 2 /* USER_LOCAL */:
                return (0, nls_1.localize)(0, null);
            case 4 /* WORKSPACE */:
                return (0, nls_1.localize)(1, null);
            case 5 /* WORKSPACE_FOLDER */:
                const folder = workspaceContextService.getWorkspaceFolder(resource);
                return folder ? folder.name : '';
        }
        return '';
    }
    exports.getSettingsTargetName = getSettingsTargetName;
    exports.FOLDER_SETTINGS_PATH = '.vscode/settings.json';
    exports.DEFAULT_SETTINGS_EDITOR_SETTING = 'workbench.settings.openDefaultSettings';
    exports.USE_SPLIT_JSON_SETTING = 'workbench.settings.useSplitJSON';
});
//# sourceMappingURL=preferences.js.map