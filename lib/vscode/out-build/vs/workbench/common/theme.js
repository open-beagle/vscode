/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/common/theme", "vs/platform/theme/common/colorRegistry", "vs/base/common/color"], function (require, exports, nls_1, colorRegistry_1, color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WINDOW_INACTIVE_BORDER = exports.WINDOW_ACTIVE_BORDER = exports.NOTIFICATIONS_INFO_ICON_FOREGROUND = exports.NOTIFICATIONS_WARNING_ICON_FOREGROUND = exports.NOTIFICATIONS_ERROR_ICON_FOREGROUND = exports.NOTIFICATIONS_BORDER = exports.NOTIFICATIONS_CENTER_HEADER_BACKGROUND = exports.NOTIFICATIONS_CENTER_HEADER_FOREGROUND = exports.NOTIFICATIONS_LINKS = exports.NOTIFICATIONS_BACKGROUND = exports.NOTIFICATIONS_FOREGROUND = exports.NOTIFICATIONS_TOAST_BORDER = exports.NOTIFICATIONS_CENTER_BORDER = exports.MENUBAR_SELECTION_BORDER = exports.MENUBAR_SELECTION_BACKGROUND = exports.MENUBAR_SELECTION_FOREGROUND = exports.TITLE_BAR_BORDER = exports.TITLE_BAR_INACTIVE_BACKGROUND = exports.TITLE_BAR_ACTIVE_BACKGROUND = exports.TITLE_BAR_INACTIVE_FOREGROUND = exports.TITLE_BAR_ACTIVE_FOREGROUND = exports.SIDE_BAR_SECTION_HEADER_BORDER = exports.SIDE_BAR_SECTION_HEADER_FOREGROUND = exports.SIDE_BAR_SECTION_HEADER_BACKGROUND = exports.SIDE_BAR_DRAG_AND_DROP_BACKGROUND = exports.SIDE_BAR_TITLE_FOREGROUND = exports.SIDE_BAR_BORDER = exports.SIDE_BAR_FOREGROUND = exports.SIDE_BAR_BACKGROUND = exports.EXTENSION_BADGE_REMOTE_FOREGROUND = exports.EXTENSION_BADGE_REMOTE_BACKGROUND = exports.STATUS_BAR_HOST_NAME_FOREGROUND = exports.STATUS_BAR_HOST_NAME_BACKGROUND = exports.ACTIVITY_BAR_BADGE_FOREGROUND = exports.ACTIVITY_BAR_BADGE_BACKGROUND = exports.ACTIVITY_BAR_DRAG_AND_DROP_BORDER = exports.ACTIVITY_BAR_ACTIVE_BACKGROUND = exports.ACTIVITY_BAR_ACTIVE_FOCUS_BORDER = exports.ACTIVITY_BAR_ACTIVE_BORDER = exports.ACTIVITY_BAR_BORDER = exports.ACTIVITY_BAR_INACTIVE_FOREGROUND = exports.ACTIVITY_BAR_FOREGROUND = exports.ACTIVITY_BAR_BACKGROUND = exports.STATUS_BAR_ERROR_ITEM_FOREGROUND = exports.STATUS_BAR_ERROR_ITEM_BACKGROUND = exports.STATUS_BAR_PROMINENT_ITEM_HOVER_BACKGROUND = exports.STATUS_BAR_PROMINENT_ITEM_BACKGROUND = exports.STATUS_BAR_PROMINENT_ITEM_FOREGROUND = exports.STATUS_BAR_ITEM_HOVER_BACKGROUND = exports.STATUS_BAR_ITEM_ACTIVE_BACKGROUND = exports.STATUS_BAR_NO_FOLDER_BORDER = exports.STATUS_BAR_BORDER = exports.STATUS_BAR_NO_FOLDER_BACKGROUND = exports.STATUS_BAR_BACKGROUND = exports.STATUS_BAR_NO_FOLDER_FOREGROUND = exports.STATUS_BAR_FOREGROUND = exports.PANEL_SECTION_BORDER = exports.PANEL_SECTION_HEADER_BORDER = exports.PANEL_SECTION_HEADER_FOREGROUND = exports.PANEL_SECTION_HEADER_BACKGROUND = exports.PANEL_SECTION_DRAG_AND_DROP_BACKGROUND = exports.PANEL_DRAG_AND_DROP_BORDER = exports.PANEL_INPUT_BORDER = exports.PANEL_ACTIVE_TITLE_BORDER = exports.PANEL_INACTIVE_TITLE_FOREGROUND = exports.PANEL_ACTIVE_TITLE_FOREGROUND = exports.PANEL_BORDER = exports.PANEL_BACKGROUND = exports.IMAGE_PREVIEW_BORDER = exports.EDITOR_DRAG_AND_DROP_BACKGROUND = exports.EDITOR_GROUP_BORDER = exports.EDITOR_GROUP_HEADER_BORDER = exports.EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND = exports.EDITOR_GROUP_HEADER_TABS_BORDER = exports.EDITOR_GROUP_HEADER_TABS_BACKGROUND = exports.EDITOR_GROUP_FOCUSED_EMPTY_BORDER = exports.EDITOR_GROUP_EMPTY_BACKGROUND = exports.EDITOR_PANE_BACKGROUND = exports.TAB_UNFOCUSED_INACTIVE_MODIFIED_BORDER = exports.TAB_UNFOCUSED_ACTIVE_MODIFIED_BORDER = exports.TAB_INACTIVE_MODIFIED_BORDER = exports.TAB_ACTIVE_MODIFIED_BORDER = exports.TAB_UNFOCUSED_HOVER_BORDER = exports.TAB_HOVER_BORDER = exports.TAB_UNFOCUSED_ACTIVE_BORDER_TOP = exports.TAB_ACTIVE_BORDER_TOP = exports.TAB_UNFOCUSED_ACTIVE_BORDER = exports.TAB_ACTIVE_BORDER = exports.TAB_LAST_PINNED_BORDER = exports.TAB_BORDER = exports.TAB_UNFOCUSED_HOVER_FOREGROUND = exports.TAB_HOVER_FOREGROUND = exports.TAB_UNFOCUSED_HOVER_BACKGROUND = exports.TAB_HOVER_BACKGROUND = exports.TAB_UNFOCUSED_INACTIVE_FOREGROUND = exports.TAB_UNFOCUSED_ACTIVE_FOREGROUND = exports.TAB_INACTIVE_FOREGROUND = exports.TAB_ACTIVE_FOREGROUND = exports.TAB_UNFOCUSED_INACTIVE_BACKGROUND = exports.TAB_INACTIVE_BACKGROUND = exports.TAB_UNFOCUSED_ACTIVE_BACKGROUND = exports.TAB_ACTIVE_BACKGROUND = exports.WORKBENCH_BACKGROUND = void 0;
    // < --- Workbench (not customizable) --- >
    function WORKBENCH_BACKGROUND(theme) {
        switch (theme.type) {
            case 'dark':
                return color_1.Color.fromHex('#252526');
            case 'light':
                return color_1.Color.fromHex('#F3F3F3');
            default:
                return color_1.Color.fromHex('#000000');
        }
    }
    exports.WORKBENCH_BACKGROUND = WORKBENCH_BACKGROUND;
    // < --- Tabs --- >
    //#region Tab Background
    exports.TAB_ACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('tab.activeBackground', {
        dark: colorRegistry_1.editorBackground,
        light: colorRegistry_1.editorBackground,
        hc: colorRegistry_1.editorBackground
    }, (0, nls_1.localize)(0, null));
    exports.TAB_UNFOCUSED_ACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('tab.unfocusedActiveBackground', {
        dark: exports.TAB_ACTIVE_BACKGROUND,
        light: exports.TAB_ACTIVE_BACKGROUND,
        hc: exports.TAB_ACTIVE_BACKGROUND
    }, (0, nls_1.localize)(1, null));
    exports.TAB_INACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('tab.inactiveBackground', {
        dark: '#2D2D2D',
        light: '#ECECEC',
        hc: null
    }, (0, nls_1.localize)(2, null));
    exports.TAB_UNFOCUSED_INACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('tab.unfocusedInactiveBackground', {
        dark: exports.TAB_INACTIVE_BACKGROUND,
        light: exports.TAB_INACTIVE_BACKGROUND,
        hc: exports.TAB_INACTIVE_BACKGROUND
    }, (0, nls_1.localize)(3, null));
    //#endregion
    //#region Tab Foreground
    exports.TAB_ACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('tab.activeForeground', {
        dark: color_1.Color.white,
        light: '#333333',
        hc: color_1.Color.white
    }, (0, nls_1.localize)(4, null));
    exports.TAB_INACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('tab.inactiveForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_FOREGROUND, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_FOREGROUND, 0.7),
        hc: color_1.Color.white
    }, (0, nls_1.localize)(5, null));
    exports.TAB_UNFOCUSED_ACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('tab.unfocusedActiveForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_FOREGROUND, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_FOREGROUND, 0.7),
        hc: color_1.Color.white
    }, (0, nls_1.localize)(6, null));
    exports.TAB_UNFOCUSED_INACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('tab.unfocusedInactiveForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_INACTIVE_FOREGROUND, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_INACTIVE_FOREGROUND, 0.5),
        hc: color_1.Color.white
    }, (0, nls_1.localize)(7, null));
    //#endregion
    //#region Tab Hover Foreground/Background
    exports.TAB_HOVER_BACKGROUND = (0, colorRegistry_1.registerColor)('tab.hoverBackground', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(8, null));
    exports.TAB_UNFOCUSED_HOVER_BACKGROUND = (0, colorRegistry_1.registerColor)('tab.unfocusedHoverBackground', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_HOVER_BACKGROUND, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_HOVER_BACKGROUND, 0.7),
        hc: null
    }, (0, nls_1.localize)(9, null));
    exports.TAB_HOVER_FOREGROUND = (0, colorRegistry_1.registerColor)('tab.hoverForeground', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(10, null));
    exports.TAB_UNFOCUSED_HOVER_FOREGROUND = (0, colorRegistry_1.registerColor)('tab.unfocusedHoverForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_HOVER_FOREGROUND, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_HOVER_FOREGROUND, 0.5),
        hc: null
    }, (0, nls_1.localize)(11, null));
    //#endregion
    //#region Tab Borders
    exports.TAB_BORDER = (0, colorRegistry_1.registerColor)('tab.border', {
        dark: '#252526',
        light: '#F3F3F3',
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(12, null));
    exports.TAB_LAST_PINNED_BORDER = (0, colorRegistry_1.registerColor)('tab.lastPinnedBorder', {
        dark: colorRegistry_1.treeIndentGuidesStroke,
        light: colorRegistry_1.treeIndentGuidesStroke,
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(13, null));
    exports.TAB_ACTIVE_BORDER = (0, colorRegistry_1.registerColor)('tab.activeBorder', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(14, null));
    exports.TAB_UNFOCUSED_ACTIVE_BORDER = (0, colorRegistry_1.registerColor)('tab.unfocusedActiveBorder', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_BORDER, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_BORDER, 0.7),
        hc: null
    }, (0, nls_1.localize)(15, null));
    exports.TAB_ACTIVE_BORDER_TOP = (0, colorRegistry_1.registerColor)('tab.activeBorderTop', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(16, null));
    exports.TAB_UNFOCUSED_ACTIVE_BORDER_TOP = (0, colorRegistry_1.registerColor)('tab.unfocusedActiveBorderTop', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_BORDER_TOP, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_BORDER_TOP, 0.7),
        hc: null
    }, (0, nls_1.localize)(17, null));
    exports.TAB_HOVER_BORDER = (0, colorRegistry_1.registerColor)('tab.hoverBorder', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(18, null));
    exports.TAB_UNFOCUSED_HOVER_BORDER = (0, colorRegistry_1.registerColor)('tab.unfocusedHoverBorder', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_HOVER_BORDER, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_HOVER_BORDER, 0.7),
        hc: null
    }, (0, nls_1.localize)(19, null));
    //#endregion
    //#region Tab Modified Border
    exports.TAB_ACTIVE_MODIFIED_BORDER = (0, colorRegistry_1.registerColor)('tab.activeModifiedBorder', {
        dark: '#3399CC',
        light: '#33AAEE',
        hc: null
    }, (0, nls_1.localize)(20, null));
    exports.TAB_INACTIVE_MODIFIED_BORDER = (0, colorRegistry_1.registerColor)('tab.inactiveModifiedBorder', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_MODIFIED_BORDER, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_MODIFIED_BORDER, 0.5),
        hc: color_1.Color.white
    }, (0, nls_1.localize)(21, null));
    exports.TAB_UNFOCUSED_ACTIVE_MODIFIED_BORDER = (0, colorRegistry_1.registerColor)('tab.unfocusedActiveModifiedBorder', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_MODIFIED_BORDER, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_ACTIVE_MODIFIED_BORDER, 0.7),
        hc: color_1.Color.white
    }, (0, nls_1.localize)(22, null));
    exports.TAB_UNFOCUSED_INACTIVE_MODIFIED_BORDER = (0, colorRegistry_1.registerColor)('tab.unfocusedInactiveModifiedBorder', {
        dark: (0, colorRegistry_1.transparent)(exports.TAB_INACTIVE_MODIFIED_BORDER, 0.5),
        light: (0, colorRegistry_1.transparent)(exports.TAB_INACTIVE_MODIFIED_BORDER, 0.5),
        hc: color_1.Color.white
    }, (0, nls_1.localize)(23, null));
    //#endregion
    // < --- Editors --- >
    exports.EDITOR_PANE_BACKGROUND = (0, colorRegistry_1.registerColor)('editorPane.background', {
        dark: colorRegistry_1.editorBackground,
        light: colorRegistry_1.editorBackground,
        hc: colorRegistry_1.editorBackground
    }, (0, nls_1.localize)(24, null));
    (0, colorRegistry_1.registerColor)('editorGroup.background', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(25, null), false, (0, nls_1.localize)(26, null));
    exports.EDITOR_GROUP_EMPTY_BACKGROUND = (0, colorRegistry_1.registerColor)('editorGroup.emptyBackground', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(27, null));
    exports.EDITOR_GROUP_FOCUSED_EMPTY_BORDER = (0, colorRegistry_1.registerColor)('editorGroup.focusedEmptyBorder', {
        dark: null,
        light: null,
        hc: colorRegistry_1.focusBorder
    }, (0, nls_1.localize)(28, null));
    exports.EDITOR_GROUP_HEADER_TABS_BACKGROUND = (0, colorRegistry_1.registerColor)('editorGroupHeader.tabsBackground', {
        dark: '#252526',
        light: '#F3F3F3',
        hc: null
    }, (0, nls_1.localize)(29, null));
    exports.EDITOR_GROUP_HEADER_TABS_BORDER = (0, colorRegistry_1.registerColor)('editorGroupHeader.tabsBorder', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(30, null));
    exports.EDITOR_GROUP_HEADER_NO_TABS_BACKGROUND = (0, colorRegistry_1.registerColor)('editorGroupHeader.noTabsBackground', {
        dark: colorRegistry_1.editorBackground,
        light: colorRegistry_1.editorBackground,
        hc: colorRegistry_1.editorBackground
    }, (0, nls_1.localize)(31, null));
    exports.EDITOR_GROUP_HEADER_BORDER = (0, colorRegistry_1.registerColor)('editorGroupHeader.border', {
        dark: null,
        light: null,
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(32, null));
    exports.EDITOR_GROUP_BORDER = (0, colorRegistry_1.registerColor)('editorGroup.border', {
        dark: '#444444',
        light: '#E7E7E7',
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(33, null));
    exports.EDITOR_DRAG_AND_DROP_BACKGROUND = (0, colorRegistry_1.registerColor)('editorGroup.dropBackground', {
        dark: color_1.Color.fromHex('#53595D').transparent(0.5),
        light: color_1.Color.fromHex('#2677CB').transparent(0.18),
        hc: null
    }, (0, nls_1.localize)(34, null));
    // < --- Resource Viewer --- >
    exports.IMAGE_PREVIEW_BORDER = (0, colorRegistry_1.registerColor)('imagePreview.border', {
        dark: color_1.Color.fromHex('#808080').transparent(0.35),
        light: color_1.Color.fromHex('#808080').transparent(0.35),
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(35, null));
    // < --- Panels --- >
    exports.PANEL_BACKGROUND = (0, colorRegistry_1.registerColor)('panel.background', {
        dark: colorRegistry_1.editorBackground,
        light: colorRegistry_1.editorBackground,
        hc: colorRegistry_1.editorBackground
    }, (0, nls_1.localize)(36, null));
    exports.PANEL_BORDER = (0, colorRegistry_1.registerColor)('panel.border', {
        dark: color_1.Color.fromHex('#808080').transparent(0.35),
        light: color_1.Color.fromHex('#808080').transparent(0.35),
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(37, null));
    exports.PANEL_ACTIVE_TITLE_FOREGROUND = (0, colorRegistry_1.registerColor)('panelTitle.activeForeground', {
        dark: '#E7E7E7',
        light: '#424242',
        hc: color_1.Color.white
    }, (0, nls_1.localize)(38, null));
    exports.PANEL_INACTIVE_TITLE_FOREGROUND = (0, colorRegistry_1.registerColor)('panelTitle.inactiveForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.PANEL_ACTIVE_TITLE_FOREGROUND, 0.6),
        light: (0, colorRegistry_1.transparent)(exports.PANEL_ACTIVE_TITLE_FOREGROUND, 0.75),
        hc: color_1.Color.white
    }, (0, nls_1.localize)(39, null));
    exports.PANEL_ACTIVE_TITLE_BORDER = (0, colorRegistry_1.registerColor)('panelTitle.activeBorder', {
        dark: exports.PANEL_ACTIVE_TITLE_FOREGROUND,
        light: exports.PANEL_ACTIVE_TITLE_FOREGROUND,
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(40, null));
    exports.PANEL_INPUT_BORDER = (0, colorRegistry_1.registerColor)('panelInput.border', {
        dark: null,
        light: color_1.Color.fromHex('#ddd'),
        hc: null
    }, (0, nls_1.localize)(41, null));
    exports.PANEL_DRAG_AND_DROP_BORDER = (0, colorRegistry_1.registerColor)('panel.dropBorder', {
        dark: exports.PANEL_ACTIVE_TITLE_FOREGROUND,
        light: exports.PANEL_ACTIVE_TITLE_FOREGROUND,
        hc: exports.PANEL_ACTIVE_TITLE_FOREGROUND,
    }, (0, nls_1.localize)(42, null));
    exports.PANEL_SECTION_DRAG_AND_DROP_BACKGROUND = (0, colorRegistry_1.registerColor)('panelSection.dropBackground', {
        dark: exports.EDITOR_DRAG_AND_DROP_BACKGROUND,
        light: exports.EDITOR_DRAG_AND_DROP_BACKGROUND,
        hc: exports.EDITOR_DRAG_AND_DROP_BACKGROUND,
    }, (0, nls_1.localize)(43, null));
    exports.PANEL_SECTION_HEADER_BACKGROUND = (0, colorRegistry_1.registerColor)('panelSectionHeader.background', {
        dark: color_1.Color.fromHex('#808080').transparent(0.2),
        light: color_1.Color.fromHex('#808080').transparent(0.2),
        hc: null
    }, (0, nls_1.localize)(44, null));
    exports.PANEL_SECTION_HEADER_FOREGROUND = (0, colorRegistry_1.registerColor)('panelSectionHeader.foreground', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(45, null));
    exports.PANEL_SECTION_HEADER_BORDER = (0, colorRegistry_1.registerColor)('panelSectionHeader.border', {
        dark: colorRegistry_1.contrastBorder,
        light: colorRegistry_1.contrastBorder,
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(46, null));
    exports.PANEL_SECTION_BORDER = (0, colorRegistry_1.registerColor)('panelSection.border', {
        dark: exports.PANEL_BORDER,
        light: exports.PANEL_BORDER,
        hc: exports.PANEL_BORDER
    }, (0, nls_1.localize)(47, null));
    // < --- Status --- >
    exports.STATUS_BAR_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBar.foreground', {
        dark: '#FFFFFF',
        light: '#FFFFFF',
        hc: '#FFFFFF'
    }, (0, nls_1.localize)(48, null));
    exports.STATUS_BAR_NO_FOLDER_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBar.noFolderForeground', {
        dark: exports.STATUS_BAR_FOREGROUND,
        light: exports.STATUS_BAR_FOREGROUND,
        hc: exports.STATUS_BAR_FOREGROUND
    }, (0, nls_1.localize)(49, null));
    exports.STATUS_BAR_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBar.background', {
        dark: '#007ACC',
        light: '#007ACC',
        hc: null
    }, (0, nls_1.localize)(50, null));
    exports.STATUS_BAR_NO_FOLDER_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBar.noFolderBackground', {
        dark: '#68217A',
        light: '#68217A',
        hc: null
    }, (0, nls_1.localize)(51, null));
    exports.STATUS_BAR_BORDER = (0, colorRegistry_1.registerColor)('statusBar.border', {
        dark: null,
        light: null,
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(52, null));
    exports.STATUS_BAR_NO_FOLDER_BORDER = (0, colorRegistry_1.registerColor)('statusBar.noFolderBorder', {
        dark: exports.STATUS_BAR_BORDER,
        light: exports.STATUS_BAR_BORDER,
        hc: exports.STATUS_BAR_BORDER
    }, (0, nls_1.localize)(53, null));
    exports.STATUS_BAR_ITEM_ACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.activeBackground', {
        dark: color_1.Color.white.transparent(0.18),
        light: color_1.Color.white.transparent(0.18),
        hc: color_1.Color.white.transparent(0.18)
    }, (0, nls_1.localize)(54, null));
    exports.STATUS_BAR_ITEM_HOVER_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.hoverBackground', {
        dark: color_1.Color.white.transparent(0.12),
        light: color_1.Color.white.transparent(0.12),
        hc: color_1.Color.white.transparent(0.12)
    }, (0, nls_1.localize)(55, null));
    exports.STATUS_BAR_PROMINENT_ITEM_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.prominentForeground', {
        dark: exports.STATUS_BAR_FOREGROUND,
        light: exports.STATUS_BAR_FOREGROUND,
        hc: exports.STATUS_BAR_FOREGROUND
    }, (0, nls_1.localize)(56, null));
    exports.STATUS_BAR_PROMINENT_ITEM_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.prominentBackground', {
        dark: color_1.Color.black.transparent(0.5),
        light: color_1.Color.black.transparent(0.5),
        hc: color_1.Color.black.transparent(0.5),
    }, (0, nls_1.localize)(57, null));
    exports.STATUS_BAR_PROMINENT_ITEM_HOVER_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.prominentHoverBackground', {
        dark: color_1.Color.black.transparent(0.3),
        light: color_1.Color.black.transparent(0.3),
        hc: color_1.Color.black.transparent(0.3),
    }, (0, nls_1.localize)(58, null));
    exports.STATUS_BAR_ERROR_ITEM_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.errorBackground', {
        dark: (0, colorRegistry_1.darken)(colorRegistry_1.errorForeground, .4),
        light: (0, colorRegistry_1.darken)(colorRegistry_1.errorForeground, .4),
        hc: null,
    }, (0, nls_1.localize)(59, null));
    exports.STATUS_BAR_ERROR_ITEM_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.errorForeground', {
        dark: color_1.Color.white,
        light: color_1.Color.white,
        hc: color_1.Color.white,
    }, (0, nls_1.localize)(60, null));
    // < --- Activity Bar --- >
    exports.ACTIVITY_BAR_BACKGROUND = (0, colorRegistry_1.registerColor)('activityBar.background', {
        dark: '#333333',
        light: '#2C2C2C',
        hc: '#000000'
    }, (0, nls_1.localize)(61, null));
    exports.ACTIVITY_BAR_FOREGROUND = (0, colorRegistry_1.registerColor)('activityBar.foreground', {
        dark: color_1.Color.white,
        light: color_1.Color.white,
        hc: color_1.Color.white
    }, (0, nls_1.localize)(62, null));
    exports.ACTIVITY_BAR_INACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('activityBar.inactiveForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.ACTIVITY_BAR_FOREGROUND, 0.4),
        light: (0, colorRegistry_1.transparent)(exports.ACTIVITY_BAR_FOREGROUND, 0.4),
        hc: color_1.Color.white
    }, (0, nls_1.localize)(63, null));
    exports.ACTIVITY_BAR_BORDER = (0, colorRegistry_1.registerColor)('activityBar.border', {
        dark: null,
        light: null,
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(64, null));
    exports.ACTIVITY_BAR_ACTIVE_BORDER = (0, colorRegistry_1.registerColor)('activityBar.activeBorder', {
        dark: exports.ACTIVITY_BAR_FOREGROUND,
        light: exports.ACTIVITY_BAR_FOREGROUND,
        hc: null
    }, (0, nls_1.localize)(65, null));
    exports.ACTIVITY_BAR_ACTIVE_FOCUS_BORDER = (0, colorRegistry_1.registerColor)('activityBar.activeFocusBorder', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(66, null));
    exports.ACTIVITY_BAR_ACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('activityBar.activeBackground', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(67, null));
    exports.ACTIVITY_BAR_DRAG_AND_DROP_BORDER = (0, colorRegistry_1.registerColor)('activityBar.dropBorder', {
        dark: exports.ACTIVITY_BAR_FOREGROUND,
        light: exports.ACTIVITY_BAR_FOREGROUND,
        hc: exports.ACTIVITY_BAR_FOREGROUND,
    }, (0, nls_1.localize)(68, null));
    exports.ACTIVITY_BAR_BADGE_BACKGROUND = (0, colorRegistry_1.registerColor)('activityBarBadge.background', {
        dark: '#007ACC',
        light: '#007ACC',
        hc: '#000000'
    }, (0, nls_1.localize)(69, null));
    exports.ACTIVITY_BAR_BADGE_FOREGROUND = (0, colorRegistry_1.registerColor)('activityBarBadge.foreground', {
        dark: color_1.Color.white,
        light: color_1.Color.white,
        hc: color_1.Color.white
    }, (0, nls_1.localize)(70, null));
    // < --- Remote --- >
    exports.STATUS_BAR_HOST_NAME_BACKGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.remoteBackground', {
        dark: exports.ACTIVITY_BAR_BADGE_BACKGROUND,
        light: exports.ACTIVITY_BAR_BADGE_BACKGROUND,
        hc: exports.ACTIVITY_BAR_BADGE_BACKGROUND
    }, (0, nls_1.localize)(71, null));
    exports.STATUS_BAR_HOST_NAME_FOREGROUND = (0, colorRegistry_1.registerColor)('statusBarItem.remoteForeground', {
        dark: exports.ACTIVITY_BAR_BADGE_FOREGROUND,
        light: exports.ACTIVITY_BAR_BADGE_FOREGROUND,
        hc: exports.ACTIVITY_BAR_BADGE_FOREGROUND
    }, (0, nls_1.localize)(72, null));
    exports.EXTENSION_BADGE_REMOTE_BACKGROUND = (0, colorRegistry_1.registerColor)('extensionBadge.remoteBackground', {
        dark: exports.ACTIVITY_BAR_BADGE_BACKGROUND,
        light: exports.ACTIVITY_BAR_BADGE_BACKGROUND,
        hc: exports.ACTIVITY_BAR_BADGE_BACKGROUND
    }, (0, nls_1.localize)(73, null));
    exports.EXTENSION_BADGE_REMOTE_FOREGROUND = (0, colorRegistry_1.registerColor)('extensionBadge.remoteForeground', {
        dark: exports.ACTIVITY_BAR_BADGE_FOREGROUND,
        light: exports.ACTIVITY_BAR_BADGE_FOREGROUND,
        hc: exports.ACTIVITY_BAR_BADGE_FOREGROUND
    }, (0, nls_1.localize)(74, null));
    // < --- Side Bar --- >
    exports.SIDE_BAR_BACKGROUND = (0, colorRegistry_1.registerColor)('sideBar.background', {
        dark: '#252526',
        light: '#F3F3F3',
        hc: '#000000'
    }, (0, nls_1.localize)(75, null));
    exports.SIDE_BAR_FOREGROUND = (0, colorRegistry_1.registerColor)('sideBar.foreground', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(76, null));
    exports.SIDE_BAR_BORDER = (0, colorRegistry_1.registerColor)('sideBar.border', {
        dark: null,
        light: null,
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(77, null));
    exports.SIDE_BAR_TITLE_FOREGROUND = (0, colorRegistry_1.registerColor)('sideBarTitle.foreground', {
        dark: exports.SIDE_BAR_FOREGROUND,
        light: exports.SIDE_BAR_FOREGROUND,
        hc: exports.SIDE_BAR_FOREGROUND
    }, (0, nls_1.localize)(78, null));
    exports.SIDE_BAR_DRAG_AND_DROP_BACKGROUND = (0, colorRegistry_1.registerColor)('sideBar.dropBackground', {
        dark: exports.EDITOR_DRAG_AND_DROP_BACKGROUND,
        light: exports.EDITOR_DRAG_AND_DROP_BACKGROUND,
        hc: exports.EDITOR_DRAG_AND_DROP_BACKGROUND,
    }, (0, nls_1.localize)(79, null));
    exports.SIDE_BAR_SECTION_HEADER_BACKGROUND = (0, colorRegistry_1.registerColor)('sideBarSectionHeader.background', {
        dark: color_1.Color.fromHex('#808080').transparent(0.2),
        light: color_1.Color.fromHex('#808080').transparent(0.2),
        hc: null
    }, (0, nls_1.localize)(80, null));
    exports.SIDE_BAR_SECTION_HEADER_FOREGROUND = (0, colorRegistry_1.registerColor)('sideBarSectionHeader.foreground', {
        dark: exports.SIDE_BAR_FOREGROUND,
        light: exports.SIDE_BAR_FOREGROUND,
        hc: exports.SIDE_BAR_FOREGROUND
    }, (0, nls_1.localize)(81, null));
    exports.SIDE_BAR_SECTION_HEADER_BORDER = (0, colorRegistry_1.registerColor)('sideBarSectionHeader.border', {
        dark: colorRegistry_1.contrastBorder,
        light: colorRegistry_1.contrastBorder,
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(82, null));
    // < --- Title Bar --- >
    exports.TITLE_BAR_ACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('titleBar.activeForeground', {
        dark: '#CCCCCC',
        light: '#333333',
        hc: '#FFFFFF'
    }, (0, nls_1.localize)(83, null));
    exports.TITLE_BAR_INACTIVE_FOREGROUND = (0, colorRegistry_1.registerColor)('titleBar.inactiveForeground', {
        dark: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_FOREGROUND, 0.6),
        light: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_FOREGROUND, 0.6),
        hc: null
    }, (0, nls_1.localize)(84, null));
    exports.TITLE_BAR_ACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('titleBar.activeBackground', {
        dark: '#3C3C3C',
        light: '#DDDDDD',
        hc: '#000000'
    }, (0, nls_1.localize)(85, null));
    exports.TITLE_BAR_INACTIVE_BACKGROUND = (0, colorRegistry_1.registerColor)('titleBar.inactiveBackground', {
        dark: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_BACKGROUND, 0.6),
        light: (0, colorRegistry_1.transparent)(exports.TITLE_BAR_ACTIVE_BACKGROUND, 0.6),
        hc: null
    }, (0, nls_1.localize)(86, null));
    exports.TITLE_BAR_BORDER = (0, colorRegistry_1.registerColor)('titleBar.border', {
        dark: null,
        light: null,
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(87, null));
    // < --- Menubar --- >
    exports.MENUBAR_SELECTION_FOREGROUND = (0, colorRegistry_1.registerColor)('menubar.selectionForeground', {
        dark: exports.TITLE_BAR_ACTIVE_FOREGROUND,
        light: exports.TITLE_BAR_ACTIVE_FOREGROUND,
        hc: exports.TITLE_BAR_ACTIVE_FOREGROUND
    }, (0, nls_1.localize)(88, null));
    exports.MENUBAR_SELECTION_BACKGROUND = (0, colorRegistry_1.registerColor)('menubar.selectionBackground', {
        dark: (0, colorRegistry_1.transparent)(color_1.Color.white, 0.1),
        light: (0, colorRegistry_1.transparent)(color_1.Color.black, 0.1),
        hc: null
    }, (0, nls_1.localize)(89, null));
    exports.MENUBAR_SELECTION_BORDER = (0, colorRegistry_1.registerColor)('menubar.selectionBorder', {
        dark: null,
        light: null,
        hc: colorRegistry_1.activeContrastBorder
    }, (0, nls_1.localize)(90, null));
    // < --- Notifications --- >
    exports.NOTIFICATIONS_CENTER_BORDER = (0, colorRegistry_1.registerColor)('notificationCenter.border', {
        dark: null,
        light: null,
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(91, null));
    exports.NOTIFICATIONS_TOAST_BORDER = (0, colorRegistry_1.registerColor)('notificationToast.border', {
        dark: null,
        light: null,
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(92, null));
    exports.NOTIFICATIONS_FOREGROUND = (0, colorRegistry_1.registerColor)('notifications.foreground', {
        dark: colorRegistry_1.editorWidgetForeground,
        light: colorRegistry_1.editorWidgetForeground,
        hc: colorRegistry_1.editorWidgetForeground
    }, (0, nls_1.localize)(93, null));
    exports.NOTIFICATIONS_BACKGROUND = (0, colorRegistry_1.registerColor)('notifications.background', {
        dark: colorRegistry_1.editorWidgetBackground,
        light: colorRegistry_1.editorWidgetBackground,
        hc: colorRegistry_1.editorWidgetBackground
    }, (0, nls_1.localize)(94, null));
    exports.NOTIFICATIONS_LINKS = (0, colorRegistry_1.registerColor)('notificationLink.foreground', {
        dark: colorRegistry_1.textLinkForeground,
        light: colorRegistry_1.textLinkForeground,
        hc: colorRegistry_1.textLinkForeground
    }, (0, nls_1.localize)(95, null));
    exports.NOTIFICATIONS_CENTER_HEADER_FOREGROUND = (0, colorRegistry_1.registerColor)('notificationCenterHeader.foreground', {
        dark: null,
        light: null,
        hc: null
    }, (0, nls_1.localize)(96, null));
    exports.NOTIFICATIONS_CENTER_HEADER_BACKGROUND = (0, colorRegistry_1.registerColor)('notificationCenterHeader.background', {
        dark: (0, colorRegistry_1.lighten)(exports.NOTIFICATIONS_BACKGROUND, 0.3),
        light: (0, colorRegistry_1.darken)(exports.NOTIFICATIONS_BACKGROUND, 0.05),
        hc: exports.NOTIFICATIONS_BACKGROUND
    }, (0, nls_1.localize)(97, null));
    exports.NOTIFICATIONS_BORDER = (0, colorRegistry_1.registerColor)('notifications.border', {
        dark: exports.NOTIFICATIONS_CENTER_HEADER_BACKGROUND,
        light: exports.NOTIFICATIONS_CENTER_HEADER_BACKGROUND,
        hc: exports.NOTIFICATIONS_CENTER_HEADER_BACKGROUND
    }, (0, nls_1.localize)(98, null));
    exports.NOTIFICATIONS_ERROR_ICON_FOREGROUND = (0, colorRegistry_1.registerColor)('notificationsErrorIcon.foreground', {
        dark: colorRegistry_1.editorErrorForeground,
        light: colorRegistry_1.editorErrorForeground,
        hc: colorRegistry_1.editorErrorForeground
    }, (0, nls_1.localize)(99, null));
    exports.NOTIFICATIONS_WARNING_ICON_FOREGROUND = (0, colorRegistry_1.registerColor)('notificationsWarningIcon.foreground', {
        dark: colorRegistry_1.editorWarningForeground,
        light: colorRegistry_1.editorWarningForeground,
        hc: colorRegistry_1.editorWarningForeground
    }, (0, nls_1.localize)(100, null));
    exports.NOTIFICATIONS_INFO_ICON_FOREGROUND = (0, colorRegistry_1.registerColor)('notificationsInfoIcon.foreground', {
        dark: colorRegistry_1.editorInfoForeground,
        light: colorRegistry_1.editorInfoForeground,
        hc: colorRegistry_1.editorInfoForeground
    }, (0, nls_1.localize)(101, null));
    exports.WINDOW_ACTIVE_BORDER = (0, colorRegistry_1.registerColor)('window.activeBorder', {
        dark: null,
        light: null,
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(102, null));
    exports.WINDOW_INACTIVE_BORDER = (0, colorRegistry_1.registerColor)('window.inactiveBorder', {
        dark: null,
        light: null,
        hc: colorRegistry_1.contrastBorder
    }, (0, nls_1.localize)(103, null));
});
//# sourceMappingURL=theme.js.map