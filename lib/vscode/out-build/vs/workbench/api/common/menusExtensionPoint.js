/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/api/common/menusExtensionPoint", "vs/base/common/strings", "vs/base/common/resources", "vs/base/common/collections", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/base/common/lifecycle", "vs/platform/theme/common/themeService", "vs/base/common/iterator", "vs/base/common/arrays"], function (require, exports, nls_1, strings_1, resources, collections_1, extensionsRegistry_1, contextkey_1, actions_1, lifecycle_1, themeService_1, iterator_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.commandsExtensionPoint = void 0;
    const apiMenus = [
        {
            key: 'commandPalette',
            id: actions_1.MenuId.CommandPalette,
            description: (0, nls_1.localize)(0, null),
            supportsSubmenus: false
        },
        {
            key: 'touchBar',
            id: actions_1.MenuId.TouchBarContext,
            description: (0, nls_1.localize)(1, null),
            supportsSubmenus: false
        },
        {
            key: 'editor/title',
            id: actions_1.MenuId.EditorTitle,
            description: (0, nls_1.localize)(2, null)
        },
        {
            key: 'editor/title/run',
            id: actions_1.MenuId.EditorTitleRun,
            description: (0, nls_1.localize)(3, null)
        },
        {
            key: 'editor/context',
            id: actions_1.MenuId.EditorContext,
            description: (0, nls_1.localize)(4, null)
        },
        {
            key: 'editor/context/copy',
            id: actions_1.MenuId.EditorContextCopy,
            description: (0, nls_1.localize)(5, null)
        },
        {
            key: 'explorer/context',
            id: actions_1.MenuId.ExplorerContext,
            description: (0, nls_1.localize)(6, null)
        },
        {
            key: 'editor/title/context',
            id: actions_1.MenuId.EditorTitleContext,
            description: (0, nls_1.localize)(7, null)
        },
        {
            key: 'debug/callstack/context',
            id: actions_1.MenuId.DebugCallStackContext,
            description: (0, nls_1.localize)(8, null)
        },
        {
            key: 'debug/variables/context',
            id: actions_1.MenuId.DebugVariablesContext,
            description: (0, nls_1.localize)(9, null)
        },
        {
            key: 'debug/toolBar',
            id: actions_1.MenuId.DebugToolBar,
            description: (0, nls_1.localize)(10, null)
        },
        {
            key: 'menuBar/file',
            id: actions_1.MenuId.MenubarFileMenu,
            description: (0, nls_1.localize)(11, null),
            proposed: true
        },
        {
            key: 'menuBar/home',
            id: actions_1.MenuId.MenubarHomeMenu,
            description: (0, nls_1.localize)(12, null),
            proposed: true,
            supportsSubmenus: false
        },
        {
            key: 'menuBar/edit/copy',
            id: actions_1.MenuId.MenubarCopy,
            description: (0, nls_1.localize)(13, null)
        },
        {
            key: 'scm/title',
            id: actions_1.MenuId.SCMTitle,
            description: (0, nls_1.localize)(14, null)
        },
        {
            key: 'scm/sourceControl',
            id: actions_1.MenuId.SCMSourceControl,
            description: (0, nls_1.localize)(15, null)
        },
        {
            key: 'scm/resourceState/context',
            id: actions_1.MenuId.SCMResourceContext,
            description: (0, nls_1.localize)(16, null)
        },
        {
            key: 'scm/resourceFolder/context',
            id: actions_1.MenuId.SCMResourceFolderContext,
            description: (0, nls_1.localize)(17, null)
        },
        {
            key: 'scm/resourceGroup/context',
            id: actions_1.MenuId.SCMResourceGroupContext,
            description: (0, nls_1.localize)(18, null)
        },
        {
            key: 'scm/change/title',
            id: actions_1.MenuId.SCMChangeContext,
            description: (0, nls_1.localize)(19, null)
        },
        {
            key: 'statusBar/windowIndicator',
            id: actions_1.MenuId.StatusBarWindowIndicatorMenu,
            description: (0, nls_1.localize)(20, null),
            proposed: true,
            supportsSubmenus: false
        },
        {
            key: 'statusBar/remoteIndicator',
            id: actions_1.MenuId.StatusBarRemoteIndicatorMenu,
            description: (0, nls_1.localize)(21, null),
            supportsSubmenus: false
        },
        {
            key: 'view/title',
            id: actions_1.MenuId.ViewTitle,
            description: (0, nls_1.localize)(22, null)
        },
        {
            key: 'view/item/context',
            id: actions_1.MenuId.ViewItemContext,
            description: (0, nls_1.localize)(23, null)
        },
        {
            key: 'comments/commentThread/title',
            id: actions_1.MenuId.CommentThreadTitle,
            description: (0, nls_1.localize)(24, null)
        },
        {
            key: 'comments/commentThread/context',
            id: actions_1.MenuId.CommentThreadActions,
            description: (0, nls_1.localize)(25, null),
            supportsSubmenus: false
        },
        {
            key: 'comments/comment/title',
            id: actions_1.MenuId.CommentTitle,
            description: (0, nls_1.localize)(26, null)
        },
        {
            key: 'comments/comment/context',
            id: actions_1.MenuId.CommentActions,
            description: (0, nls_1.localize)(27, null),
            supportsSubmenus: false
        },
        {
            key: 'notebook/toolbar',
            id: actions_1.MenuId.NotebookToolbar,
            description: (0, nls_1.localize)(28, null),
            proposed: true
        },
        {
            key: 'notebook/cell/title',
            id: actions_1.MenuId.NotebookCellTitle,
            description: (0, nls_1.localize)(29, null),
            proposed: true
        },
        {
            key: 'testing/item/context',
            id: actions_1.MenuId.TestItem,
            description: (0, nls_1.localize)(30, null),
            proposed: true
        },
        {
            key: 'extension/context',
            id: actions_1.MenuId.ExtensionContext,
            description: (0, nls_1.localize)(31, null)
        },
        {
            key: 'timeline/title',
            id: actions_1.MenuId.TimelineTitle,
            description: (0, nls_1.localize)(32, null)
        },
        {
            key: 'timeline/item/context',
            id: actions_1.MenuId.TimelineItemContext,
            description: (0, nls_1.localize)(33, null)
        },
        {
            key: 'ports/item/context',
            id: actions_1.MenuId.TunnelContext,
            description: (0, nls_1.localize)(34, null)
        },
        {
            key: 'ports/item/origin/inline',
            id: actions_1.MenuId.TunnelOriginInline,
            description: (0, nls_1.localize)(35, null)
        },
        {
            key: 'ports/item/port/inline',
            id: actions_1.MenuId.TunnelPortInline,
            description: (0, nls_1.localize)(36, null)
        }
    ];
    var schema;
    (function (schema) {
        // --- menus, submenus contribution point
        function isMenuItem(item) {
            return typeof item.command === 'string';
        }
        schema.isMenuItem = isMenuItem;
        function isValidMenuItem(item, collector) {
            if (typeof item.command !== 'string') {
                collector.error((0, nls_1.localize)(37, null, 'command'));
                return false;
            }
            if (item.alt && typeof item.alt !== 'string') {
                collector.error((0, nls_1.localize)(38, null, 'alt'));
                return false;
            }
            if (item.when && typeof item.when !== 'string') {
                collector.error((0, nls_1.localize)(39, null, 'when'));
                return false;
            }
            if (item.group && typeof item.group !== 'string') {
                collector.error((0, nls_1.localize)(40, null, 'group'));
                return false;
            }
            return true;
        }
        schema.isValidMenuItem = isValidMenuItem;
        function isValidSubmenuItem(item, collector) {
            if (typeof item.submenu !== 'string') {
                collector.error((0, nls_1.localize)(41, null, 'submenu'));
                return false;
            }
            if (item.when && typeof item.when !== 'string') {
                collector.error((0, nls_1.localize)(42, null, 'when'));
                return false;
            }
            if (item.group && typeof item.group !== 'string') {
                collector.error((0, nls_1.localize)(43, null, 'group'));
                return false;
            }
            return true;
        }
        schema.isValidSubmenuItem = isValidSubmenuItem;
        function isValidItems(items, collector) {
            if (!Array.isArray(items)) {
                collector.error((0, nls_1.localize)(44, null));
                return false;
            }
            for (let item of items) {
                if (isMenuItem(item)) {
                    if (!isValidMenuItem(item, collector)) {
                        return false;
                    }
                }
                else {
                    if (!isValidSubmenuItem(item, collector)) {
                        return false;
                    }
                }
            }
            return true;
        }
        schema.isValidItems = isValidItems;
        function isValidSubmenu(submenu, collector) {
            if (typeof submenu !== 'object') {
                collector.error((0, nls_1.localize)(45, null));
                return false;
            }
            if (typeof submenu.id !== 'string') {
                collector.error((0, nls_1.localize)(46, null, 'id'));
                return false;
            }
            if (typeof submenu.label !== 'string') {
                collector.error((0, nls_1.localize)(47, null, 'label'));
                return false;
            }
            return true;
        }
        schema.isValidSubmenu = isValidSubmenu;
        const menuItem = {
            type: 'object',
            required: ['command'],
            properties: {
                command: {
                    description: (0, nls_1.localize)(48, null),
                    type: 'string'
                },
                alt: {
                    description: (0, nls_1.localize)(49, null),
                    type: 'string'
                },
                when: {
                    description: (0, nls_1.localize)(50, null),
                    type: 'string'
                },
                group: {
                    description: (0, nls_1.localize)(51, null),
                    type: 'string'
                }
            }
        };
        const submenuItem = {
            type: 'object',
            required: ['submenu'],
            properties: {
                submenu: {
                    description: (0, nls_1.localize)(52, null),
                    type: 'string'
                },
                when: {
                    description: (0, nls_1.localize)(53, null),
                    type: 'string'
                },
                group: {
                    description: (0, nls_1.localize)(54, null),
                    type: 'string'
                }
            }
        };
        const submenu = {
            type: 'object',
            required: ['id', 'label'],
            properties: {
                id: {
                    description: (0, nls_1.localize)(55, null),
                    type: 'string'
                },
                label: {
                    description: (0, nls_1.localize)(56, null),
                    type: 'string'
                },
                icon: {
                    description: (0, nls_1.localize)(57, null),
                    anyOf: [{
                            type: 'string'
                        },
                        {
                            type: 'object',
                            properties: {
                                light: {
                                    description: (0, nls_1.localize)(58, null),
                                    type: 'string'
                                },
                                dark: {
                                    description: (0, nls_1.localize)(59, null),
                                    type: 'string'
                                }
                            }
                        }]
                }
            }
        };
        schema.menusContribution = {
            description: (0, nls_1.localize)(60, null),
            type: 'object',
            properties: (0, arrays_1.index)(apiMenus, menu => menu.key, menu => ({
                description: menu.proposed ? `(${(0, nls_1.localize)(61, null)}) ${menu.description}` : menu.description,
                type: 'array',
                items: menu.supportsSubmenus === false ? menuItem : { oneOf: [menuItem, submenuItem] }
            })),
            additionalProperties: {
                description: 'Submenu',
                type: 'array',
                items: { oneOf: [menuItem, submenuItem] }
            }
        };
        schema.submenusContribution = {
            description: (0, nls_1.localize)(62, null),
            type: 'array',
            items: submenu
        };
        function isValidCommand(command, collector) {
            if (!command) {
                collector.error((0, nls_1.localize)(63, null));
                return false;
            }
            if ((0, strings_1.isFalsyOrWhitespace)(command.command)) {
                collector.error((0, nls_1.localize)(64, null, 'command'));
                return false;
            }
            if (!isValidLocalizedString(command.title, collector, 'title')) {
                return false;
            }
            if (command.enablement && typeof command.enablement !== 'string') {
                collector.error((0, nls_1.localize)(65, null, 'precondition'));
                return false;
            }
            if (command.category && !isValidLocalizedString(command.category, collector, 'category')) {
                return false;
            }
            if (!isValidIcon(command.icon, collector)) {
                return false;
            }
            return true;
        }
        schema.isValidCommand = isValidCommand;
        function isValidIcon(icon, collector) {
            if (typeof icon === 'undefined') {
                return true;
            }
            if (typeof icon === 'string') {
                return true;
            }
            else if (typeof icon.dark === 'string' && typeof icon.light === 'string') {
                return true;
            }
            collector.error((0, nls_1.localize)(66, null));
            return false;
        }
        function isValidLocalizedString(localized, collector, propertyName) {
            if (typeof localized === 'undefined') {
                collector.error((0, nls_1.localize)(67, null, propertyName));
                return false;
            }
            else if (typeof localized === 'string' && (0, strings_1.isFalsyOrWhitespace)(localized)) {
                collector.error((0, nls_1.localize)(68, null, propertyName));
                return false;
            }
            else if (typeof localized !== 'string' && ((0, strings_1.isFalsyOrWhitespace)(localized.original) || (0, strings_1.isFalsyOrWhitespace)(localized.value))) {
                collector.error((0, nls_1.localize)(69, null, `${propertyName}.value`, `${propertyName}.original`));
                return false;
            }
            return true;
        }
        const commandType = {
            type: 'object',
            required: ['command', 'title'],
            properties: {
                command: {
                    description: (0, nls_1.localize)(70, null),
                    type: 'string'
                },
                title: {
                    description: (0, nls_1.localize)(71, null),
                    type: 'string'
                },
                category: {
                    description: (0, nls_1.localize)(72, null),
                    type: 'string'
                },
                enablement: {
                    description: (0, nls_1.localize)(73, null),
                    type: 'string'
                },
                icon: {
                    description: (0, nls_1.localize)(74, null),
                    anyOf: [{
                            type: 'string'
                        },
                        {
                            type: 'object',
                            properties: {
                                light: {
                                    description: (0, nls_1.localize)(75, null),
                                    type: 'string'
                                },
                                dark: {
                                    description: (0, nls_1.localize)(76, null),
                                    type: 'string'
                                }
                            }
                        }]
                }
            }
        };
        schema.commandsContribution = {
            description: (0, nls_1.localize)(77, null),
            oneOf: [
                commandType,
                {
                    type: 'array',
                    items: commandType
                }
            ]
        };
    })(schema || (schema = {}));
    const _commandRegistrations = new lifecycle_1.DisposableStore();
    exports.commandsExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'commands',
        jsonSchema: schema.commandsContribution
    });
    exports.commandsExtensionPoint.setHandler(extensions => {
        function handleCommand(userFriendlyCommand, extension, bucket) {
            var _a;
            if (!schema.isValidCommand(userFriendlyCommand, extension.collector)) {
                return;
            }
            const { icon, enablement, category, title, command } = userFriendlyCommand;
            let absoluteIcon;
            if (icon) {
                if (typeof icon === 'string') {
                    absoluteIcon = (_a = themeService_1.ThemeIcon.fromString(icon)) !== null && _a !== void 0 ? _a : { dark: resources.joinPath(extension.description.extensionLocation, icon), light: resources.joinPath(extension.description.extensionLocation, icon) };
                }
                else {
                    absoluteIcon = {
                        dark: resources.joinPath(extension.description.extensionLocation, icon.dark),
                        light: resources.joinPath(extension.description.extensionLocation, icon.light)
                    };
                }
            }
            if (actions_1.MenuRegistry.getCommand(command)) {
                extension.collector.info((0, nls_1.localize)(78, null, userFriendlyCommand.command));
            }
            bucket.push({
                id: command,
                title,
                category,
                precondition: contextkey_1.ContextKeyExpr.deserialize(enablement),
                icon: absoluteIcon
            });
        }
        // remove all previous command registrations
        _commandRegistrations.clear();
        const newCommands = [];
        for (const extension of extensions) {
            const { value } = extension;
            if (Array.isArray(value)) {
                for (const command of value) {
                    handleCommand(command, extension, newCommands);
                }
            }
            else {
                handleCommand(value, extension, newCommands);
            }
        }
        _commandRegistrations.add(actions_1.MenuRegistry.addCommands(newCommands));
    });
    const _submenus = new Map();
    const submenusExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'submenus',
        jsonSchema: schema.submenusContribution
    });
    submenusExtensionPoint.setHandler(extensions => {
        _submenus.clear();
        for (let extension of extensions) {
            const { value, collector } = extension;
            (0, collections_1.forEach)(value, entry => {
                if (!schema.isValidSubmenu(entry.value, collector)) {
                    return;
                }
                if (!entry.value.id) {
                    collector.warn((0, nls_1.localize)(79, null, entry.value.id));
                    return;
                }
                if (_submenus.has(entry.value.id)) {
                    collector.warn((0, nls_1.localize)(80, null, entry.value.id));
                    return;
                }
                if (!entry.value.label) {
                    collector.warn((0, nls_1.localize)(81, null, entry.value.label));
                    return;
                }
                let absoluteIcon;
                if (entry.value.icon) {
                    if (typeof entry.value.icon === 'string') {
                        absoluteIcon = themeService_1.ThemeIcon.fromString(entry.value.icon) || { dark: resources.joinPath(extension.description.extensionLocation, entry.value.icon) };
                    }
                    else {
                        absoluteIcon = {
                            dark: resources.joinPath(extension.description.extensionLocation, entry.value.icon.dark),
                            light: resources.joinPath(extension.description.extensionLocation, entry.value.icon.light)
                        };
                    }
                }
                const item = {
                    id: new actions_1.MenuId(`api:${entry.value.id}`),
                    label: entry.value.label,
                    icon: absoluteIcon
                };
                _submenus.set(entry.value.id, item);
            });
        }
    });
    const _apiMenusByKey = new Map(iterator_1.Iterable.map(iterator_1.Iterable.from(apiMenus), menu => ([menu.key, menu])));
    const _menuRegistrations = new lifecycle_1.DisposableStore();
    const _submenuMenuItems = new Map();
    const menusExtensionPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'menus',
        jsonSchema: schema.menusContribution,
        deps: [submenusExtensionPoint]
    });
    menusExtensionPoint.setHandler(extensions => {
        // remove all previous menu registrations
        _menuRegistrations.clear();
        _submenuMenuItems.clear();
        const items = [];
        for (let extension of extensions) {
            const { value, collector } = extension;
            (0, collections_1.forEach)(value, entry => {
                if (!schema.isValidItems(entry.value, collector)) {
                    return;
                }
                let menu = _apiMenusByKey.get(entry.key);
                if (!menu) {
                    const submenu = _submenus.get(entry.key);
                    if (submenu) {
                        menu = {
                            key: entry.key,
                            id: submenu.id,
                            description: ''
                        };
                    }
                }
                if (!menu) {
                    collector.warn((0, nls_1.localize)(82, null, entry.key));
                    return;
                }
                if (menu.proposed && !extension.description.enableProposedApi) {
                    collector.error((0, nls_1.localize)(83, null, entry.key, extension.description.identifier.value));
                    return;
                }
                for (const menuItem of entry.value) {
                    let item;
                    if (schema.isMenuItem(menuItem)) {
                        const command = actions_1.MenuRegistry.getCommand(menuItem.command);
                        const alt = menuItem.alt && actions_1.MenuRegistry.getCommand(menuItem.alt) || undefined;
                        if (!command) {
                            collector.error((0, nls_1.localize)(84, null, menuItem.command));
                            continue;
                        }
                        if (menuItem.alt && !alt) {
                            collector.warn((0, nls_1.localize)(85, null, menuItem.alt));
                        }
                        if (menuItem.command === menuItem.alt) {
                            collector.info((0, nls_1.localize)(86, null));
                        }
                        item = { command, alt, group: undefined, order: undefined, when: undefined };
                    }
                    else {
                        if (menu.supportsSubmenus === false) {
                            collector.error((0, nls_1.localize)(87, null));
                            continue;
                        }
                        const submenu = _submenus.get(menuItem.submenu);
                        if (!submenu) {
                            collector.error((0, nls_1.localize)(88, null, menuItem.submenu));
                            continue;
                        }
                        let submenuRegistrations = _submenuMenuItems.get(menu.id.id);
                        if (!submenuRegistrations) {
                            submenuRegistrations = new Set();
                            _submenuMenuItems.set(menu.id.id, submenuRegistrations);
                        }
                        if (submenuRegistrations.has(submenu.id.id)) {
                            collector.warn((0, nls_1.localize)(89, null, menuItem.submenu, entry.key));
                            continue;
                        }
                        submenuRegistrations.add(submenu.id.id);
                        item = { submenu: submenu.id, icon: submenu.icon, title: submenu.label, group: undefined, order: undefined, when: undefined };
                    }
                    if (menuItem.group) {
                        const idx = menuItem.group.lastIndexOf('@');
                        if (idx > 0) {
                            item.group = menuItem.group.substr(0, idx);
                            item.order = Number(menuItem.group.substr(idx + 1)) || undefined;
                        }
                        else {
                            item.group = menuItem.group;
                        }
                    }
                    item.when = contextkey_1.ContextKeyExpr.deserialize(menuItem.when);
                    items.push({ id: menu.id, item });
                }
            });
        }
        _menuRegistrations.add(actions_1.MenuRegistry.appendMenuItems(items));
    });
});
//# sourceMappingURL=menusExtensionPoint.js.map