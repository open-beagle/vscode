/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/layout/browser/layoutService"], function (require, exports, instantiation_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.panelOpensMaximizedFromString = exports.panelOpensMaximizedSettingToString = exports.positionFromString = exports.positionToString = exports.PanelOpensMaximizedOptions = exports.Position = exports.Parts = exports.IWorkbenchLayoutService = void 0;
    exports.IWorkbenchLayoutService = (0, instantiation_1.refineServiceDecorator)(layoutService_1.ILayoutService);
    var Parts;
    (function (Parts) {
        Parts["TITLEBAR_PART"] = "workbench.parts.titlebar";
        Parts["ACTIVITYBAR_PART"] = "workbench.parts.activitybar";
        Parts["SIDEBAR_PART"] = "workbench.parts.sidebar";
        Parts["PANEL_PART"] = "workbench.parts.panel";
        Parts["EDITOR_PART"] = "workbench.parts.editor";
        Parts["STATUSBAR_PART"] = "workbench.parts.statusbar";
    })(Parts = exports.Parts || (exports.Parts = {}));
    var Position;
    (function (Position) {
        Position[Position["LEFT"] = 0] = "LEFT";
        Position[Position["RIGHT"] = 1] = "RIGHT";
        Position[Position["BOTTOM"] = 2] = "BOTTOM";
    })(Position = exports.Position || (exports.Position = {}));
    var PanelOpensMaximizedOptions;
    (function (PanelOpensMaximizedOptions) {
        PanelOpensMaximizedOptions[PanelOpensMaximizedOptions["ALWAYS"] = 0] = "ALWAYS";
        PanelOpensMaximizedOptions[PanelOpensMaximizedOptions["NEVER"] = 1] = "NEVER";
        PanelOpensMaximizedOptions[PanelOpensMaximizedOptions["REMEMBER_LAST"] = 2] = "REMEMBER_LAST";
    })(PanelOpensMaximizedOptions = exports.PanelOpensMaximizedOptions || (exports.PanelOpensMaximizedOptions = {}));
    function positionToString(position) {
        switch (position) {
            case 0 /* LEFT */: return 'left';
            case 1 /* RIGHT */: return 'right';
            case 2 /* BOTTOM */: return 'bottom';
            default: return 'bottom';
        }
    }
    exports.positionToString = positionToString;
    const positionsByString = {
        [positionToString(0 /* LEFT */)]: 0 /* LEFT */,
        [positionToString(1 /* RIGHT */)]: 1 /* RIGHT */,
        [positionToString(2 /* BOTTOM */)]: 2 /* BOTTOM */
    };
    function positionFromString(str) {
        return positionsByString[str];
    }
    exports.positionFromString = positionFromString;
    function panelOpensMaximizedSettingToString(setting) {
        switch (setting) {
            case 0 /* ALWAYS */: return 'always';
            case 1 /* NEVER */: return 'never';
            case 2 /* REMEMBER_LAST */: return 'preserve';
            default: return 'preserve';
        }
    }
    exports.panelOpensMaximizedSettingToString = panelOpensMaximizedSettingToString;
    const panelOpensMaximizedByString = {
        [panelOpensMaximizedSettingToString(0 /* ALWAYS */)]: 0 /* ALWAYS */,
        [panelOpensMaximizedSettingToString(1 /* NEVER */)]: 1 /* NEVER */,
        [panelOpensMaximizedSettingToString(2 /* REMEMBER_LAST */)]: 2 /* REMEMBER_LAST */
    };
    function panelOpensMaximizedFromString(str) {
        return panelOpensMaximizedByString[str];
    }
    exports.panelOpensMaximizedFromString = panelOpensMaximizedFromString;
});
//# sourceMappingURL=layoutService.js.map