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
define(["require", "exports", "vs/nls!vs/platform/menubar/electron-main/menubar", "vs/base/common/platform", "vs/platform/environment/electron-main/environmentMainService", "electron", "vs/platform/windows/common/windows", "vs/platform/configuration/common/configuration", "vs/platform/telemetry/common/telemetry", "vs/platform/update/common/update", "vs/platform/product/common/productService", "vs/base/common/async", "vs/platform/log/common/log", "vs/base/common/labels", "vs/platform/windows/electron-main/windows", "vs/platform/workspaces/electron-main/workspacesHistoryMainService", "vs/platform/menubar/common/menubar", "vs/base/common/uri", "vs/platform/state/node/state", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/native/electron-main/nativeHostMainService", "vs/base/common/cancellation"], function (require, exports, nls, platform_1, environmentMainService_1, electron_1, windows_1, configuration_1, telemetry_1, update_1, productService_1, async_1, log_1, labels_1, windows_2, workspacesHistoryMainService_1, menubar_1, uri_1, state_1, lifecycleMainService_1, nativeHostMainService_1, cancellation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Menubar = void 0;
    const telemetryFrom = 'menu';
    let Menubar = class Menubar {
        constructor(updateService, configurationService, windowsMainService, environmentMainService, telemetryService, workspacesHistoryMainService, stateService, lifecycleMainService, logService, nativeHostMainService, productService) {
            this.updateService = updateService;
            this.configurationService = configurationService;
            this.windowsMainService = windowsMainService;
            this.environmentMainService = environmentMainService;
            this.telemetryService = telemetryService;
            this.workspacesHistoryMainService = workspacesHistoryMainService;
            this.stateService = stateService;
            this.lifecycleMainService = lifecycleMainService;
            this.logService = logService;
            this.nativeHostMainService = nativeHostMainService;
            this.productService = productService;
            this.fallbackMenuHandlers = Object.create(null);
            this.menuUpdater = new async_1.RunOnceScheduler(() => this.doUpdateMenu(), 0);
            this.menuGC = new async_1.RunOnceScheduler(() => { this.oldMenus = []; }, 10000);
            this.menubarMenus = Object.create(null);
            this.keybindings = Object.create(null);
            if (platform_1.isMacintosh || (0, windows_1.getTitleBarStyle)(this.configurationService) === 'native') {
                this.restoreCachedMenubarData();
            }
            this.addFallbackHandlers();
            this.closedLastWindow = false;
            this.noActiveWindow = false;
            this.oldMenus = [];
            this.install();
            this.registerListeners();
        }
        restoreCachedMenubarData() {
            const menubarData = this.stateService.getItem(Menubar.lastKnownMenubarStorageKey);
            if (menubarData) {
                if (menubarData.menus) {
                    this.menubarMenus = menubarData.menus;
                }
                if (menubarData.keybindings) {
                    this.keybindings = menubarData.keybindings;
                }
            }
        }
        addFallbackHandlers() {
            // File Menu Items
            this.fallbackMenuHandlers['workbench.action.files.newUntitledFile'] = (menuItem, win, event) => this.windowsMainService.openEmptyWindow({ context: 2 /* MENU */, contextWindowId: win === null || win === void 0 ? void 0 : win.id });
            this.fallbackMenuHandlers['workbench.action.newWindow'] = (menuItem, win, event) => this.windowsMainService.openEmptyWindow({ context: 2 /* MENU */, contextWindowId: win === null || win === void 0 ? void 0 : win.id });
            this.fallbackMenuHandlers['workbench.action.files.openFileFolder'] = (menuItem, win, event) => this.nativeHostMainService.pickFileFolderAndOpen(undefined, { forceNewWindow: this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } });
            this.fallbackMenuHandlers['workbench.action.openWorkspace'] = (menuItem, win, event) => this.nativeHostMainService.pickWorkspaceAndOpen(undefined, { forceNewWindow: this.isOptionClick(event), telemetryExtraData: { from: telemetryFrom } });
            // Recent Menu Items
            this.fallbackMenuHandlers['workbench.action.clearRecentFiles'] = () => this.workspacesHistoryMainService.clearRecentlyOpened();
            // Help Menu Items
            const twitterUrl = this.productService.twitterUrl;
            if (twitterUrl) {
                this.fallbackMenuHandlers['workbench.action.openTwitterUrl'] = () => this.openUrl(twitterUrl, 'openTwitterUrl');
            }
            const requestFeatureUrl = this.productService.requestFeatureUrl;
            if (requestFeatureUrl) {
                this.fallbackMenuHandlers['workbench.action.openRequestFeatureUrl'] = () => this.openUrl(requestFeatureUrl, 'openUserVoiceUrl');
            }
            const reportIssueUrl = this.productService.reportIssueUrl;
            if (reportIssueUrl) {
                this.fallbackMenuHandlers['workbench.action.openIssueReporter'] = () => this.openUrl(reportIssueUrl, 'openReportIssues');
            }
            const licenseUrl = this.productService.licenseUrl;
            if (licenseUrl) {
                this.fallbackMenuHandlers['workbench.action.openLicenseUrl'] = () => {
                    if (platform_1.language) {
                        const queryArgChar = licenseUrl.indexOf('?') > 0 ? '&' : '?';
                        this.openUrl(`${licenseUrl}${queryArgChar}lang=${platform_1.language}`, 'openLicenseUrl');
                    }
                    else {
                        this.openUrl(licenseUrl, 'openLicenseUrl');
                    }
                };
            }
            const privacyStatementUrl = this.productService.privacyStatementUrl;
            if (privacyStatementUrl && licenseUrl) {
                this.fallbackMenuHandlers['workbench.action.openPrivacyStatementUrl'] = () => {
                    if (platform_1.language) {
                        const queryArgChar = licenseUrl.indexOf('?') > 0 ? '&' : '?';
                        this.openUrl(`${privacyStatementUrl}${queryArgChar}lang=${platform_1.language}`, 'openPrivacyStatement');
                    }
                    else {
                        this.openUrl(privacyStatementUrl, 'openPrivacyStatement');
                    }
                };
            }
        }
        registerListeners() {
            // Keep flag when app quits
            this.lifecycleMainService.onWillShutdown(() => this.willShutdown = true);
            // Listen to some events from window service to update menu
            this.windowsMainService.onDidChangeWindowsCount(e => this.onDidChangeWindowsCount(e));
            this.nativeHostMainService.onDidBlurWindow(() => this.onDidChangeWindowFocus());
            this.nativeHostMainService.onDidFocusWindow(() => this.onDidChangeWindowFocus());
        }
        get currentEnableMenuBarMnemonics() {
            let enableMenuBarMnemonics = this.configurationService.getValue('window.enableMenuBarMnemonics');
            if (typeof enableMenuBarMnemonics !== 'boolean') {
                enableMenuBarMnemonics = true;
            }
            return enableMenuBarMnemonics;
        }
        get currentEnableNativeTabs() {
            if (!platform_1.isMacintosh) {
                return false;
            }
            let enableNativeTabs = this.configurationService.getValue('window.nativeTabs');
            if (typeof enableNativeTabs !== 'boolean') {
                enableNativeTabs = false;
            }
            return enableNativeTabs;
        }
        updateMenu(menubarData, windowId) {
            this.menubarMenus = menubarData.menus;
            this.keybindings = menubarData.keybindings;
            // Save off new menu and keybindings
            this.stateService.setItem(Menubar.lastKnownMenubarStorageKey, menubarData);
            this.scheduleUpdateMenu();
        }
        scheduleUpdateMenu() {
            this.menuUpdater.schedule(); // buffer multiple attempts to update the menu
        }
        doUpdateMenu() {
            // Due to limitations in Electron, it is not possible to update menu items dynamically. The suggested
            // workaround from Electron is to set the application menu again.
            // See also https://github.com/electron/electron/issues/846
            //
            // Run delayed to prevent updating menu while it is open
            if (!this.willShutdown) {
                setTimeout(() => {
                    if (!this.willShutdown) {
                        this.install();
                    }
                }, 10 /* delay this because there is an issue with updating a menu when it is open */);
            }
        }
        onDidChangeWindowsCount(e) {
            if (!platform_1.isMacintosh) {
                return;
            }
            // Update menu if window count goes from N > 0 or 0 > N to update menu item enablement
            if ((e.oldCount === 0 && e.newCount > 0) || (e.oldCount > 0 && e.newCount === 0)) {
                this.closedLastWindow = e.newCount === 0;
                this.scheduleUpdateMenu();
            }
        }
        onDidChangeWindowFocus() {
            if (!platform_1.isMacintosh) {
                return;
            }
            this.noActiveWindow = !electron_1.BrowserWindow.getFocusedWindow();
            this.scheduleUpdateMenu();
        }
        install() {
            // Store old menu in our array to avoid GC to collect the menu and crash. See #55347
            // TODO@sbatten Remove this when fixed upstream by Electron
            const oldMenu = electron_1.Menu.getApplicationMenu();
            if (oldMenu) {
                this.oldMenus.push(oldMenu);
            }
            // If we don't have a menu yet, set it to null to avoid the electron menu.
            // This should only happen on the first launch ever
            if (Object.keys(this.menubarMenus).length === 0) {
                electron_1.Menu.setApplicationMenu(platform_1.isMacintosh ? new electron_1.Menu() : null);
                return;
            }
            // Menus
            const menubar = new electron_1.Menu();
            // Mac: Application
            let macApplicationMenuItem;
            if (platform_1.isMacintosh) {
                const applicationMenu = new electron_1.Menu();
                macApplicationMenuItem = new electron_1.MenuItem({ label: this.productService.nameShort, submenu: applicationMenu });
                this.setMacApplicationMenu(applicationMenu);
                menubar.append(macApplicationMenuItem);
            }
            // Mac: Dock
            if (platform_1.isMacintosh && !this.appMenuInstalled) {
                this.appMenuInstalled = true;
                const dockMenu = new electron_1.Menu();
                dockMenu.append(new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize(0, null)), click: () => this.windowsMainService.openEmptyWindow({ context: 1 /* DOCK */ }) }));
                electron_1.app.dock.setMenu(dockMenu);
            }
            // File
            const fileMenu = new electron_1.Menu();
            const fileMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize(1, null)), submenu: fileMenu });
            this.setMenuById(fileMenu, 'File');
            menubar.append(fileMenuItem);
            // Edit
            const editMenu = new electron_1.Menu();
            const editMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize(2, null)), submenu: editMenu });
            this.setMenuById(editMenu, 'Edit');
            menubar.append(editMenuItem);
            // Selection
            const selectionMenu = new electron_1.Menu();
            const selectionMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize(3, null)), submenu: selectionMenu });
            this.setMenuById(selectionMenu, 'Selection');
            menubar.append(selectionMenuItem);
            // View
            const viewMenu = new electron_1.Menu();
            const viewMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize(4, null)), submenu: viewMenu });
            this.setMenuById(viewMenu, 'View');
            menubar.append(viewMenuItem);
            // Go
            const gotoMenu = new electron_1.Menu();
            const gotoMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize(5, null)), submenu: gotoMenu });
            this.setMenuById(gotoMenu, 'Go');
            menubar.append(gotoMenuItem);
            // Debug
            const debugMenu = new electron_1.Menu();
            const debugMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize(6, null)), submenu: debugMenu });
            this.setMenuById(debugMenu, 'Run');
            menubar.append(debugMenuItem);
            // Terminal
            const terminalMenu = new electron_1.Menu();
            const terminalMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize(7, null)), submenu: terminalMenu });
            this.setMenuById(terminalMenu, 'Terminal');
            menubar.append(terminalMenuItem);
            // Mac: Window
            let macWindowMenuItem;
            if (this.shouldDrawMenu('Window')) {
                const windowMenu = new electron_1.Menu();
                macWindowMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize(8, null)), submenu: windowMenu, role: 'window' });
                this.setMacWindowMenu(windowMenu);
            }
            if (macWindowMenuItem) {
                menubar.append(macWindowMenuItem);
            }
            // Help
            const helpMenu = new electron_1.Menu();
            const helpMenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize(9, null)), submenu: helpMenu, role: 'help' });
            this.setMenuById(helpMenu, 'Help');
            menubar.append(helpMenuItem);
            if (menubar.items && menubar.items.length > 0) {
                electron_1.Menu.setApplicationMenu(menubar);
            }
            else {
                electron_1.Menu.setApplicationMenu(null);
            }
            // Dispose of older menus after some time
            this.menuGC.schedule();
        }
        setMacApplicationMenu(macApplicationMenu) {
            const about = this.createMenuItem(nls.localize(10, null, this.productService.nameLong), 'workbench.action.showAboutDialog');
            const checkForUpdates = this.getUpdateMenuItems();
            let preferences;
            if (this.shouldDrawMenu('Preferences')) {
                const preferencesMenu = new electron_1.Menu();
                this.setMenuById(preferencesMenu, 'Preferences');
                preferences = new electron_1.MenuItem({ label: this.mnemonicLabel(nls.localize(11, null)), submenu: preferencesMenu });
            }
            const servicesMenu = new electron_1.Menu();
            const services = new electron_1.MenuItem({ label: nls.localize(12, null), role: 'services', submenu: servicesMenu });
            const hide = new electron_1.MenuItem({ label: nls.localize(13, null, this.productService.nameLong), role: 'hide', accelerator: 'Command+H' });
            const hideOthers = new electron_1.MenuItem({ label: nls.localize(14, null), role: 'hideOthers', accelerator: 'Command+Alt+H' });
            const showAll = new electron_1.MenuItem({ label: nls.localize(15, null), role: 'unhide' });
            const quit = new electron_1.MenuItem(this.likeAction('workbench.action.quit', {
                label: nls.localize(16, null, this.productService.nameLong), click: () => {
                    const lastActiveWindow = this.windowsMainService.getLastActiveWindow();
                    if (this.windowsMainService.getWindowCount() === 0 || // allow to quit when no more windows are open
                        !!electron_1.BrowserWindow.getFocusedWindow() || // allow to quit when window has focus (fix for https://github.com/microsoft/vscode/issues/39191)
                        (lastActiveWindow === null || lastActiveWindow === void 0 ? void 0 : lastActiveWindow.isMinimized()) // allow to quit when window has no focus but is minimized (https://github.com/microsoft/vscode/issues/63000)
                    ) {
                        this.nativeHostMainService.quit(undefined);
                    }
                }
            }));
            const actions = [about];
            actions.push(...checkForUpdates);
            if (preferences) {
                actions.push(...[
                    __separator__(),
                    preferences
                ]);
            }
            actions.push(...[
                __separator__(),
                services,
                __separator__(),
                hide,
                hideOthers,
                showAll,
                __separator__(),
                quit
            ]);
            actions.forEach(i => macApplicationMenu.append(i));
        }
        shouldDrawMenu(menuId) {
            // We need to draw an empty menu to override the electron default
            if (!platform_1.isMacintosh && (0, windows_1.getTitleBarStyle)(this.configurationService) === 'custom') {
                return false;
            }
            switch (menuId) {
                case 'File':
                case 'Help':
                    if (platform_1.isMacintosh) {
                        return (this.windowsMainService.getWindowCount() === 0 && this.closedLastWindow) || (this.windowsMainService.getWindowCount() > 0 && this.noActiveWindow) || (!!this.menubarMenus && !!this.menubarMenus[menuId]);
                    }
                case 'Window':
                    if (platform_1.isMacintosh) {
                        return (this.windowsMainService.getWindowCount() === 0 && this.closedLastWindow) || (this.windowsMainService.getWindowCount() > 0 && this.noActiveWindow) || !!this.menubarMenus;
                    }
                default:
                    return this.windowsMainService.getWindowCount() > 0 && (!!this.menubarMenus && !!this.menubarMenus[menuId]);
            }
        }
        setMenu(menu, items) {
            items.forEach((item) => {
                if ((0, menubar_1.isMenubarMenuItemSeparator)(item)) {
                    menu.append(__separator__());
                }
                else if ((0, menubar_1.isMenubarMenuItemSubmenu)(item)) {
                    const submenu = new electron_1.Menu();
                    const submenuItem = new electron_1.MenuItem({ label: this.mnemonicLabel(item.label), submenu });
                    this.setMenu(submenu, item.submenu.items);
                    menu.append(submenuItem);
                }
                else if ((0, menubar_1.isMenubarMenuItemRecentAction)(item)) {
                    menu.append(this.createOpenRecentMenuItem(item));
                }
                else if ((0, menubar_1.isMenubarMenuItemAction)(item)) {
                    if (item.id === 'workbench.action.showAboutDialog') {
                        this.insertCheckForUpdatesItems(menu);
                    }
                    if (platform_1.isMacintosh) {
                        if ((this.windowsMainService.getWindowCount() === 0 && this.closedLastWindow) ||
                            (this.windowsMainService.getWindowCount() > 0 && this.noActiveWindow)) {
                            // In the fallback scenario, we are either disabled or using a fallback handler
                            if (this.fallbackMenuHandlers[item.id]) {
                                menu.append(new electron_1.MenuItem(this.likeAction(item.id, { label: this.mnemonicLabel(item.label), click: this.fallbackMenuHandlers[item.id] })));
                            }
                            else {
                                menu.append(this.createMenuItem(item.label, item.id, false, item.checked));
                            }
                        }
                        else {
                            menu.append(this.createMenuItem(item.label, item.id, item.enabled === false ? false : true, !!item.checked));
                        }
                    }
                    else {
                        menu.append(this.createMenuItem(item.label, item.id, item.enabled === false ? false : true, !!item.checked));
                    }
                }
            });
        }
        setMenuById(menu, menuId) {
            if (this.menubarMenus && this.menubarMenus[menuId]) {
                this.setMenu(menu, this.menubarMenus[menuId].items);
            }
        }
        insertCheckForUpdatesItems(menu) {
            const updateItems = this.getUpdateMenuItems();
            if (updateItems.length) {
                updateItems.forEach(i => menu.append(i));
                menu.append(__separator__());
            }
        }
        createOpenRecentMenuItem(item) {
            const revivedUri = uri_1.URI.revive(item.uri);
            const commandId = item.id;
            const openable = (commandId === 'openRecentFile') ? { fileUri: revivedUri } :
                (commandId === 'openRecentWorkspace') ? { workspaceUri: revivedUri } : { folderUri: revivedUri };
            return new electron_1.MenuItem(this.likeAction(commandId, {
                label: item.label,
                click: (menuItem, win, event) => {
                    const openInNewWindow = this.isOptionClick(event);
                    const success = this.windowsMainService.open({
                        context: 2 /* MENU */,
                        cli: this.environmentMainService.args,
                        urisToOpen: [openable],
                        forceNewWindow: openInNewWindow,
                        gotoLineMode: false,
                        remoteAuthority: item.remoteAuthority
                    }).length > 0;
                    if (!success) {
                        this.workspacesHistoryMainService.removeRecentlyOpened([revivedUri]);
                    }
                }
            }, false));
        }
        isOptionClick(event) {
            return !!(event && ((!platform_1.isMacintosh && (event.ctrlKey || event.shiftKey)) || (platform_1.isMacintosh && (event.metaKey || event.altKey))));
        }
        createRoleMenuItem(label, commandId, role) {
            const options = {
                label: this.mnemonicLabel(label),
                role,
                enabled: true
            };
            return new electron_1.MenuItem(this.withKeybinding(commandId, options));
        }
        setMacWindowMenu(macWindowMenu) {
            const minimize = new electron_1.MenuItem({ label: nls.localize(17, null), role: 'minimize', accelerator: 'Command+M', enabled: this.windowsMainService.getWindowCount() > 0 });
            const zoom = new electron_1.MenuItem({ label: nls.localize(18, null), role: 'zoom', enabled: this.windowsMainService.getWindowCount() > 0 });
            const bringAllToFront = new electron_1.MenuItem({ label: nls.localize(19, null), role: 'front', enabled: this.windowsMainService.getWindowCount() > 0 });
            const switchWindow = this.createMenuItem(nls.localize(20, null), 'workbench.action.switchWindow');
            const nativeTabMenuItems = [];
            if (this.currentEnableNativeTabs) {
                nativeTabMenuItems.push(__separator__());
                nativeTabMenuItems.push(this.createMenuItem(nls.localize(21, null), 'workbench.action.newWindowTab'));
                nativeTabMenuItems.push(this.createRoleMenuItem(nls.localize(22, null), 'workbench.action.showPreviousWindowTab', 'selectPreviousTab'));
                nativeTabMenuItems.push(this.createRoleMenuItem(nls.localize(23, null), 'workbench.action.showNextWindowTab', 'selectNextTab'));
                nativeTabMenuItems.push(this.createRoleMenuItem(nls.localize(24, null), 'workbench.action.moveWindowTabToNewWindow', 'moveTabToNewWindow'));
                nativeTabMenuItems.push(this.createRoleMenuItem(nls.localize(25, null), 'workbench.action.mergeAllWindowTabs', 'mergeAllWindows'));
            }
            [
                minimize,
                zoom,
                __separator__(),
                switchWindow,
                ...nativeTabMenuItems,
                __separator__(),
                bringAllToFront
            ].forEach(item => macWindowMenu.append(item));
        }
        getUpdateMenuItems() {
            const state = this.updateService.state;
            switch (state.type) {
                case "uninitialized" /* Uninitialized */:
                    return [];
                case "idle" /* Idle */:
                    return [new electron_1.MenuItem({
                            label: this.mnemonicLabel(nls.localize(26, null)), click: () => setTimeout(() => {
                                this.reportMenuActionTelemetry('CheckForUpdate');
                                this.updateService.checkForUpdates(true);
                            }, 0)
                        })];
                case "checking for updates" /* CheckingForUpdates */:
                    return [new electron_1.MenuItem({ label: nls.localize(27, null), enabled: false })];
                case "available for download" /* AvailableForDownload */:
                    return [new electron_1.MenuItem({
                            label: this.mnemonicLabel(nls.localize(28, null)), click: () => {
                                this.updateService.downloadUpdate();
                            }
                        })];
                case "downloading" /* Downloading */:
                    return [new electron_1.MenuItem({ label: nls.localize(29, null), enabled: false })];
                case "downloaded" /* Downloaded */:
                    return [new electron_1.MenuItem({
                            label: this.mnemonicLabel(nls.localize(30, null)), click: () => {
                                this.reportMenuActionTelemetry('InstallUpdate');
                                this.updateService.applyUpdate();
                            }
                        })];
                case "updating" /* Updating */:
                    return [new electron_1.MenuItem({ label: nls.localize(31, null), enabled: false })];
                case "ready" /* Ready */:
                    return [new electron_1.MenuItem({
                            label: this.mnemonicLabel(nls.localize(32, null)), click: () => {
                                this.reportMenuActionTelemetry('RestartToUpdate');
                                this.updateService.quitAndInstall();
                            }
                        })];
            }
        }
        createMenuItem(arg1, arg2, arg3, arg4) {
            const label = this.mnemonicLabel(arg1);
            const click = (typeof arg2 === 'function') ? arg2 : (menuItem, win, event) => {
                const userSettingsLabel = menuItem ? menuItem.userSettingsLabel : null;
                let commandId = arg2;
                if (Array.isArray(arg2)) {
                    commandId = this.isOptionClick(event) ? arg2[1] : arg2[0]; // support alternative action if we got multiple action Ids and the option key was pressed while invoking
                }
                if (userSettingsLabel && event.triggeredByAccelerator) {
                    this.runActionInRenderer({ type: 'keybinding', userSettingsLabel });
                }
                else {
                    this.runActionInRenderer({ type: 'commandId', commandId });
                }
            };
            const enabled = typeof arg3 === 'boolean' ? arg3 : this.windowsMainService.getWindowCount() > 0;
            const checked = typeof arg4 === 'boolean' ? arg4 : false;
            const options = {
                label,
                click,
                enabled
            };
            if (checked) {
                options.type = 'checkbox';
                options.checked = checked;
            }
            let commandId;
            if (typeof arg2 === 'string') {
                commandId = arg2;
            }
            else if (Array.isArray(arg2)) {
                commandId = arg2[0];
            }
            if (platform_1.isMacintosh) {
                // Add role for special case menu items
                if (commandId === 'editor.action.clipboardCutAction') {
                    options.role = 'cut';
                }
                else if (commandId === 'editor.action.clipboardCopyAction') {
                    options.role = 'copy';
                }
                else if (commandId === 'editor.action.clipboardPasteAction') {
                    options.role = 'paste';
                }
                // Add context aware click handlers for special case menu items
                if (commandId === 'undo') {
                    options.click = this.makeContextAwareClickHandler(click, {
                        inDevTools: devTools => devTools.undo(),
                        inNoWindow: () => electron_1.Menu.sendActionToFirstResponder('undo:')
                    });
                }
                else if (commandId === 'redo') {
                    options.click = this.makeContextAwareClickHandler(click, {
                        inDevTools: devTools => devTools.redo(),
                        inNoWindow: () => electron_1.Menu.sendActionToFirstResponder('redo:')
                    });
                }
                else if (commandId === 'editor.action.selectAll') {
                    options.click = this.makeContextAwareClickHandler(click, {
                        inDevTools: devTools => devTools.selectAll(),
                        inNoWindow: () => electron_1.Menu.sendActionToFirstResponder('selectAll:')
                    });
                }
            }
            return new electron_1.MenuItem(this.withKeybinding(commandId, options));
        }
        makeContextAwareClickHandler(click, contextSpecificHandlers) {
            return (menuItem, win, event) => {
                // No Active Window
                const activeWindow = electron_1.BrowserWindow.getFocusedWindow();
                if (!activeWindow) {
                    return contextSpecificHandlers.inNoWindow();
                }
                // DevTools focused
                if (activeWindow.webContents.isDevToolsFocused() &&
                    activeWindow.webContents.devToolsWebContents) {
                    return contextSpecificHandlers.inDevTools(activeWindow.webContents.devToolsWebContents);
                }
                // Finally execute command in Window
                click(menuItem, win || activeWindow, event);
            };
        }
        runActionInRenderer(invocation) {
            // We make sure to not run actions when the window has no focus, this helps
            // for https://github.com/microsoft/vscode/issues/25907 and specifically for
            // https://github.com/microsoft/vscode/issues/11928
            // Still allow to run when the last active window is minimized though for
            // https://github.com/microsoft/vscode/issues/63000
            let activeBrowserWindow = electron_1.BrowserWindow.getFocusedWindow();
            if (!activeBrowserWindow) {
                const lastActiveWindow = this.windowsMainService.getLastActiveWindow();
                if (lastActiveWindow === null || lastActiveWindow === void 0 ? void 0 : lastActiveWindow.isMinimized()) {
                    activeBrowserWindow = lastActiveWindow.win;
                }
            }
            const activeWindow = activeBrowserWindow ? this.windowsMainService.getWindowById(activeBrowserWindow.id) : undefined;
            if (activeWindow) {
                this.logService.trace('menubar#runActionInRenderer', invocation);
                if (platform_1.isMacintosh && !this.environmentMainService.isBuilt && !activeWindow.isReady) {
                    if ((invocation.type === 'commandId' && invocation.commandId === 'workbench.action.toggleDevTools') || (invocation.type !== 'commandId' && invocation.userSettingsLabel === 'alt+cmd+i')) {
                        // prevent this action from running twice on macOS (https://github.com/microsoft/vscode/issues/62719)
                        // we already register a keybinding in bootstrap-window.js for opening developer tools in case something
                        // goes wrong and that keybinding is only removed when the application has loaded (= window ready).
                        return;
                    }
                }
                if (invocation.type === 'commandId') {
                    const runActionPayload = { id: invocation.commandId, from: 'menu' };
                    activeWindow.sendWhenReady('vscode:runAction', cancellation_1.CancellationToken.None, runActionPayload);
                }
                else {
                    const runKeybindingPayload = { userSettingsLabel: invocation.userSettingsLabel };
                    activeWindow.sendWhenReady('vscode:runKeybinding', cancellation_1.CancellationToken.None, runKeybindingPayload);
                }
            }
            else {
                this.logService.trace('menubar#runActionInRenderer: no active window found', invocation);
            }
        }
        withKeybinding(commandId, options) {
            const binding = typeof commandId === 'string' ? this.keybindings[commandId] : undefined;
            // Apply binding if there is one
            if (binding === null || binding === void 0 ? void 0 : binding.label) {
                // if the binding is native, we can just apply it
                if (binding.isNative !== false) {
                    options.accelerator = binding.label;
                    options.userSettingsLabel = binding.userSettingsLabel;
                }
                // the keybinding is not native so we cannot show it as part of the accelerator of
                // the menu item. we fallback to a different strategy so that we always display it
                else if (typeof options.label === 'string') {
                    const bindingIndex = options.label.indexOf('[');
                    if (bindingIndex >= 0) {
                        options.label = `${options.label.substr(0, bindingIndex)} [${binding.label}]`;
                    }
                    else {
                        options.label = `${options.label} [${binding.label}]`;
                    }
                }
            }
            // Unset bindings if there is none
            else {
                options.accelerator = undefined;
            }
            return options;
        }
        likeAction(commandId, options, setAccelerator = !options.accelerator) {
            if (setAccelerator) {
                options = this.withKeybinding(commandId, options);
            }
            const originalClick = options.click;
            options.click = (item, window, event) => {
                this.reportMenuActionTelemetry(commandId);
                if (originalClick) {
                    originalClick(item, window, event);
                }
            };
            return options;
        }
        openUrl(url, id) {
            this.nativeHostMainService.openExternal(undefined, url);
            this.reportMenuActionTelemetry(id);
        }
        reportMenuActionTelemetry(id) {
            this.telemetryService.publicLog2('workbenchActionExecuted', { id, from: telemetryFrom });
        }
        mnemonicLabel(label) {
            return (0, labels_1.mnemonicMenuLabel)(label, !this.currentEnableMenuBarMnemonics);
        }
    };
    Menubar.lastKnownMenubarStorageKey = 'lastKnownMenubarData';
    Menubar = __decorate([
        __param(0, update_1.IUpdateService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, windows_2.IWindowsMainService),
        __param(3, environmentMainService_1.IEnvironmentMainService),
        __param(4, telemetry_1.ITelemetryService),
        __param(5, workspacesHistoryMainService_1.IWorkspacesHistoryMainService),
        __param(6, state_1.IStateService),
        __param(7, lifecycleMainService_1.ILifecycleMainService),
        __param(8, log_1.ILogService),
        __param(9, nativeHostMainService_1.INativeHostMainService),
        __param(10, productService_1.IProductService)
    ], Menubar);
    exports.Menubar = Menubar;
    function __separator__() {
        return new electron_1.MenuItem({ type: 'separator' });
    }
});
//# sourceMappingURL=menubar.js.map