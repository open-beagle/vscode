/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/platform/theme/common/iconRegistry"], function (require, exports, codicons_1, nls_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.preferencesOpenSettingsIcon = exports.preferencesClearInputIcon = exports.settingsDiscardIcon = exports.settingsRemoveIcon = exports.settingsAddIcon = exports.settingsEditIcon = exports.keybindingsAddIcon = exports.keybindingsEditIcon = exports.keybindingsSortIcon = exports.keybindingsRecordKeysIcon = exports.settingsMoreActionIcon = exports.settingsScopeDropDownIcon = exports.settingsGroupCollapsedIcon = exports.settingsGroupExpandedIcon = void 0;
    exports.settingsGroupExpandedIcon = (0, iconRegistry_1.registerIcon)('settings-group-expanded', codicons_1.Codicon.chevronDown, (0, nls_1.localize)(0, null));
    exports.settingsGroupCollapsedIcon = (0, iconRegistry_1.registerIcon)('settings-group-collapsed', codicons_1.Codicon.chevronRight, (0, nls_1.localize)(1, null));
    exports.settingsScopeDropDownIcon = (0, iconRegistry_1.registerIcon)('settings-folder-dropdown', codicons_1.Codicon.triangleDown, (0, nls_1.localize)(2, null));
    exports.settingsMoreActionIcon = (0, iconRegistry_1.registerIcon)('settings-more-action', codicons_1.Codicon.gear, (0, nls_1.localize)(3, null));
    exports.keybindingsRecordKeysIcon = (0, iconRegistry_1.registerIcon)('keybindings-record-keys', codicons_1.Codicon.recordKeys, (0, nls_1.localize)(4, null));
    exports.keybindingsSortIcon = (0, iconRegistry_1.registerIcon)('keybindings-sort', codicons_1.Codicon.sortPrecedence, (0, nls_1.localize)(5, null));
    exports.keybindingsEditIcon = (0, iconRegistry_1.registerIcon)('keybindings-edit', codicons_1.Codicon.edit, (0, nls_1.localize)(6, null));
    exports.keybindingsAddIcon = (0, iconRegistry_1.registerIcon)('keybindings-add', codicons_1.Codicon.add, (0, nls_1.localize)(7, null));
    exports.settingsEditIcon = (0, iconRegistry_1.registerIcon)('settings-edit', codicons_1.Codicon.edit, (0, nls_1.localize)(8, null));
    exports.settingsAddIcon = (0, iconRegistry_1.registerIcon)('settings-add', codicons_1.Codicon.add, (0, nls_1.localize)(9, null));
    exports.settingsRemoveIcon = (0, iconRegistry_1.registerIcon)('settings-remove', codicons_1.Codicon.close, (0, nls_1.localize)(10, null));
    exports.settingsDiscardIcon = (0, iconRegistry_1.registerIcon)('settings-discard', codicons_1.Codicon.discard, (0, nls_1.localize)(11, null));
    exports.preferencesClearInputIcon = (0, iconRegistry_1.registerIcon)('preferences-clear-input', codicons_1.Codicon.clearAll, (0, nls_1.localize)(12, null));
    exports.preferencesOpenSettingsIcon = (0, iconRegistry_1.registerIcon)('preferences-open-settings', codicons_1.Codicon.goToFile, (0, nls_1.localize)(13, null));
});
//# sourceMappingURL=preferencesIcons.js.map