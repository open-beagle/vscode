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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/actions", "vs/nls!vs/workbench/electron-sandbox/actions/windowActions", "vs/platform/windows/electron-sandbox/window", "vs/platform/keybinding/common/keybinding", "vs/base/browser/browser", "vs/platform/files/common/files", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/platform/quickinput/common/quickInput", "vs/editor/common/services/getIconClasses", "vs/platform/configuration/common/configuration", "vs/platform/native/electron-sandbox/native", "vs/base/common/codicons", "vs/platform/workspaces/common/workspaces", "vs/css!./media/actions"], function (require, exports, uri_1, actions_1, nls_1, window_1, keybinding_1, browser_1, files_1, modelService_1, modeService_1, quickInput_1, getIconClasses_1, configuration_1, native_1, codicons_1, workspaces_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleWindowTabsBarHandler = exports.MergeWindowTabsHandlerHandler = exports.MoveWindowTabToNewWindowHandler = exports.ShowNextWindowTabHandler = exports.ShowPreviousWindowTabHandler = exports.NewWindowTabHandler = exports.QuickSwitchWindow = exports.SwitchWindow = exports.BaseSwitchWindow = exports.ZoomResetAction = exports.ZoomOutAction = exports.ZoomInAction = exports.BaseZoomAction = exports.CloseCurrentWindowAction = void 0;
    let CloseCurrentWindowAction = class CloseCurrentWindowAction extends actions_1.Action {
        constructor(id, label, nativeHostService) {
            super(id, label);
            this.nativeHostService = nativeHostService;
        }
        async run() {
            this.nativeHostService.closeWindow();
        }
    };
    CloseCurrentWindowAction.ID = 'workbench.action.closeWindow';
    CloseCurrentWindowAction.LABEL = (0, nls_1.localize)(0, null);
    CloseCurrentWindowAction = __decorate([
        __param(2, native_1.INativeHostService)
    ], CloseCurrentWindowAction);
    exports.CloseCurrentWindowAction = CloseCurrentWindowAction;
    let BaseZoomAction = class BaseZoomAction extends actions_1.Action {
        constructor(id, label, configurationService) {
            super(id, label);
            this.configurationService = configurationService;
        }
        async setConfiguredZoomLevel(level) {
            level = Math.round(level); // when reaching smallest zoom, prevent fractional zoom levels
            if (level > BaseZoomAction.MAX_ZOOM_LEVEL || level < BaseZoomAction.MIN_ZOOM_LEVEL) {
                return; // https://github.com/microsoft/vscode/issues/48357
            }
            await this.configurationService.updateValue(BaseZoomAction.SETTING_KEY, level);
            (0, window_1.applyZoom)(level);
        }
    };
    BaseZoomAction.SETTING_KEY = 'window.zoomLevel';
    BaseZoomAction.MAX_ZOOM_LEVEL = 9;
    BaseZoomAction.MIN_ZOOM_LEVEL = -8;
    BaseZoomAction = __decorate([
        __param(2, configuration_1.IConfigurationService)
    ], BaseZoomAction);
    exports.BaseZoomAction = BaseZoomAction;
    let ZoomInAction = class ZoomInAction extends BaseZoomAction {
        constructor(id, label, configurationService) {
            super(id, label, configurationService);
        }
        async run() {
            this.setConfiguredZoomLevel((0, browser_1.getZoomLevel)() + 1);
        }
    };
    ZoomInAction.ID = 'workbench.action.zoomIn';
    ZoomInAction.LABEL = (0, nls_1.localize)(1, null);
    ZoomInAction = __decorate([
        __param(2, configuration_1.IConfigurationService)
    ], ZoomInAction);
    exports.ZoomInAction = ZoomInAction;
    let ZoomOutAction = class ZoomOutAction extends BaseZoomAction {
        constructor(id, label, configurationService) {
            super(id, label, configurationService);
        }
        async run() {
            this.setConfiguredZoomLevel((0, browser_1.getZoomLevel)() - 1);
        }
    };
    ZoomOutAction.ID = 'workbench.action.zoomOut';
    ZoomOutAction.LABEL = (0, nls_1.localize)(2, null);
    ZoomOutAction = __decorate([
        __param(2, configuration_1.IConfigurationService)
    ], ZoomOutAction);
    exports.ZoomOutAction = ZoomOutAction;
    let ZoomResetAction = class ZoomResetAction extends BaseZoomAction {
        constructor(id, label, configurationService) {
            super(id, label, configurationService);
        }
        async run() {
            this.setConfiguredZoomLevel(0);
        }
    };
    ZoomResetAction.ID = 'workbench.action.zoomReset';
    ZoomResetAction.LABEL = (0, nls_1.localize)(3, null);
    ZoomResetAction = __decorate([
        __param(2, configuration_1.IConfigurationService)
    ], ZoomResetAction);
    exports.ZoomResetAction = ZoomResetAction;
    class BaseSwitchWindow extends actions_1.Action {
        constructor(id, label, quickInputService, keybindingService, modelService, modeService, nativeHostService) {
            super(id, label);
            this.quickInputService = quickInputService;
            this.keybindingService = keybindingService;
            this.modelService = modelService;
            this.modeService = modeService;
            this.nativeHostService = nativeHostService;
            this.closeWindowAction = {
                iconClass: codicons_1.Codicon.removeClose.classNames,
                tooltip: (0, nls_1.localize)(4, null)
            };
            this.closeDirtyWindowAction = {
                iconClass: 'dirty-window ' + codicons_1.Codicon.closeDirty,
                tooltip: (0, nls_1.localize)(5, null),
                alwaysVisible: true
            };
        }
        async run() {
            const currentWindowId = this.nativeHostService.windowId;
            const windows = await this.nativeHostService.getWindows();
            const placeHolder = (0, nls_1.localize)(6, null);
            const picks = windows.map(window => {
                const resource = window.filename ? uri_1.URI.file(window.filename) : (0, workspaces_1.isSingleFolderWorkspaceIdentifier)(window.workspace) ? window.workspace.uri : (0, workspaces_1.isWorkspaceIdentifier)(window.workspace) ? window.workspace.configPath : undefined;
                const fileKind = window.filename ? files_1.FileKind.FILE : (0, workspaces_1.isSingleFolderWorkspaceIdentifier)(window.workspace) ? files_1.FileKind.FOLDER : (0, workspaces_1.isWorkspaceIdentifier)(window.workspace) ? files_1.FileKind.ROOT_FOLDER : files_1.FileKind.FILE;
                return {
                    payload: window.id,
                    label: window.title,
                    ariaLabel: window.dirty ? (0, nls_1.localize)(7, null, window.title) : window.title,
                    iconClasses: (0, getIconClasses_1.getIconClasses)(this.modelService, this.modeService, resource, fileKind),
                    description: (currentWindowId === window.id) ? (0, nls_1.localize)(8, null) : undefined,
                    buttons: currentWindowId !== window.id ? window.dirty ? [this.closeDirtyWindowAction] : [this.closeWindowAction] : undefined
                };
            });
            const autoFocusIndex = (picks.indexOf(picks.filter(pick => pick.payload === currentWindowId)[0]) + 1) % picks.length;
            const pick = await this.quickInputService.pick(picks, {
                contextKey: 'inWindowsPicker',
                activeItem: picks[autoFocusIndex],
                placeHolder,
                quickNavigate: this.isQuickNavigate() ? { keybindings: this.keybindingService.lookupKeybindings(this.id) } : undefined,
                onDidTriggerItemButton: async (context) => {
                    await this.nativeHostService.closeWindowById(context.item.payload);
                    context.removeItem();
                }
            });
            if (pick) {
                this.nativeHostService.focusWindow({ windowId: pick.payload });
            }
        }
    }
    exports.BaseSwitchWindow = BaseSwitchWindow;
    let SwitchWindow = class SwitchWindow extends BaseSwitchWindow {
        constructor(id, label, quickInputService, keybindingService, modelService, modeService, nativeHostService) {
            super(id, label, quickInputService, keybindingService, modelService, modeService, nativeHostService);
        }
        isQuickNavigate() {
            return false;
        }
    };
    SwitchWindow.ID = 'workbench.action.switchWindow';
    SwitchWindow.LABEL = (0, nls_1.localize)(9, null);
    SwitchWindow = __decorate([
        __param(2, quickInput_1.IQuickInputService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, modelService_1.IModelService),
        __param(5, modeService_1.IModeService),
        __param(6, native_1.INativeHostService)
    ], SwitchWindow);
    exports.SwitchWindow = SwitchWindow;
    let QuickSwitchWindow = class QuickSwitchWindow extends BaseSwitchWindow {
        constructor(id, label, quickInputService, keybindingService, modelService, modeService, nativeHostService) {
            super(id, label, quickInputService, keybindingService, modelService, modeService, nativeHostService);
        }
        isQuickNavigate() {
            return true;
        }
    };
    QuickSwitchWindow.ID = 'workbench.action.quickSwitchWindow';
    QuickSwitchWindow.LABEL = (0, nls_1.localize)(10, null);
    QuickSwitchWindow = __decorate([
        __param(2, quickInput_1.IQuickInputService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, modelService_1.IModelService),
        __param(5, modeService_1.IModeService),
        __param(6, native_1.INativeHostService)
    ], QuickSwitchWindow);
    exports.QuickSwitchWindow = QuickSwitchWindow;
    const NewWindowTabHandler = function (accessor) {
        return accessor.get(native_1.INativeHostService).newWindowTab();
    };
    exports.NewWindowTabHandler = NewWindowTabHandler;
    const ShowPreviousWindowTabHandler = function (accessor) {
        return accessor.get(native_1.INativeHostService).showPreviousWindowTab();
    };
    exports.ShowPreviousWindowTabHandler = ShowPreviousWindowTabHandler;
    const ShowNextWindowTabHandler = function (accessor) {
        return accessor.get(native_1.INativeHostService).showNextWindowTab();
    };
    exports.ShowNextWindowTabHandler = ShowNextWindowTabHandler;
    const MoveWindowTabToNewWindowHandler = function (accessor) {
        return accessor.get(native_1.INativeHostService).moveWindowTabToNewWindow();
    };
    exports.MoveWindowTabToNewWindowHandler = MoveWindowTabToNewWindowHandler;
    const MergeWindowTabsHandlerHandler = function (accessor) {
        return accessor.get(native_1.INativeHostService).mergeAllWindowTabs();
    };
    exports.MergeWindowTabsHandlerHandler = MergeWindowTabsHandlerHandler;
    const ToggleWindowTabsBarHandler = function (accessor) {
        return accessor.get(native_1.INativeHostService).toggleWindowTabsBar();
    };
    exports.ToggleWindowTabsBarHandler = ToggleWindowTabsBarHandler;
});
//# sourceMappingURL=windowActions.js.map