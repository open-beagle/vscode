/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/theme/common/themeService", "vs/base/common/event", "vs/nls!vs/platform/theme/common/iconRegistry", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/base/common/async", "vs/base/common/codicons"], function (require, exports, platform, themeService_1, event_1, nls_1, jsonContributionRegistry_1, async_1, Codicons) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.syncing = exports.gotoNextLocation = exports.gotoPreviousLocation = exports.widgetClose = exports.iconsSchemaId = exports.getIconRegistry = exports.registerIcon = exports.Extensions = void 0;
    //  ------ API types
    // icon registry
    exports.Extensions = {
        IconContribution: 'base.contributions.icons'
    };
    class IconRegistry {
        constructor() {
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this.iconSchema = {
                definitions: {
                    icons: {
                        type: 'object',
                        properties: {
                            fontId: { type: 'string', description: (0, nls_1.localize)(0, null) },
                            fontCharacter: { type: 'string', description: (0, nls_1.localize)(1, null) }
                        },
                        additionalProperties: false,
                        defaultSnippets: [{ body: { fontCharacter: '\\\\e030' } }]
                    }
                },
                type: 'object',
                properties: {}
            };
            this.iconReferenceSchema = { type: 'string', pattern: `^${Codicons.CSSIcon.iconNameExpression}$`, enum: [], enumDescriptions: [] };
            this.iconsById = {};
            this.iconFontsById = {};
        }
        registerIcon(id, defaults, description, deprecationMessage) {
            const existing = this.iconsById[id];
            if (existing) {
                if (description && !existing.description) {
                    existing.description = description;
                    this.iconSchema.properties[id].markdownDescription = `${description} $(${id})`;
                    const enumIndex = this.iconReferenceSchema.enum.indexOf(id);
                    if (enumIndex !== -1) {
                        this.iconReferenceSchema.enumDescriptions[enumIndex] = description;
                    }
                    this._onDidChange.fire();
                }
                return existing;
            }
            let iconContribution = { id, description, defaults, deprecationMessage };
            this.iconsById[id] = iconContribution;
            let propertySchema = { $ref: '#/definitions/icons' };
            if (deprecationMessage) {
                propertySchema.deprecationMessage = deprecationMessage;
            }
            if (description) {
                propertySchema.markdownDescription = `${description}: $(${id})`;
            }
            this.iconSchema.properties[id] = propertySchema;
            this.iconReferenceSchema.enum.push(id);
            this.iconReferenceSchema.enumDescriptions.push(description || '');
            this._onDidChange.fire();
            return { id };
        }
        deregisterIcon(id) {
            delete this.iconsById[id];
            delete this.iconSchema.properties[id];
            const index = this.iconReferenceSchema.enum.indexOf(id);
            if (index !== -1) {
                this.iconReferenceSchema.enum.splice(index, 1);
                this.iconReferenceSchema.enumDescriptions.splice(index, 1);
            }
            this._onDidChange.fire();
        }
        getIcons() {
            return Object.keys(this.iconsById).map(id => this.iconsById[id]);
        }
        getIcon(id) {
            return this.iconsById[id];
        }
        getIconSchema() {
            return this.iconSchema;
        }
        getIconReferenceSchema() {
            return this.iconReferenceSchema;
        }
        registerIconFont(id, definition) {
            const existing = this.iconFontsById[id];
            if (existing) {
                return existing;
            }
            let iconFontContribution = { id, definition };
            this.iconFontsById[id] = iconFontContribution;
            this._onDidChange.fire();
            return iconFontContribution;
        }
        deregisterIconFont(id) {
            delete this.iconFontsById[id];
        }
        getIconFonts() {
            return Object.keys(this.iconFontsById).map(id => this.iconFontsById[id]);
        }
        getIconFont(id) {
            return this.iconFontsById[id];
        }
        toString() {
            const sorter = (i1, i2) => {
                return i1.id.localeCompare(i2.id);
            };
            const classNames = (i) => {
                while (themeService_1.ThemeIcon.isThemeIcon(i.defaults)) {
                    i = this.iconsById[i.defaults.id];
                }
                return `codicon codicon-${i ? i.id : ''}`;
            };
            let reference = [];
            reference.push(`| preview     | identifier                        | default codicon ID                | description`);
            reference.push(`| ----------- | --------------------------------- | --------------------------------- | --------------------------------- |`);
            const contributions = Object.keys(this.iconsById).map(key => this.iconsById[key]);
            for (const i of contributions.filter(i => !!i.description).sort(sorter)) {
                reference.push(`|<i class="${classNames(i)}"></i>|${i.id}|${themeService_1.ThemeIcon.isThemeIcon(i.defaults) ? i.defaults.id : i.id}|${i.description || ''}|`);
            }
            reference.push(`| preview     | identifier                        `);
            reference.push(`| ----------- | --------------------------------- |`);
            for (const i of contributions.filter(i => !themeService_1.ThemeIcon.isThemeIcon(i.defaults)).sort(sorter)) {
                reference.push(`|<i class="${classNames(i)}"></i>|${i.id}|`);
            }
            return reference.join('\n');
        }
    }
    const iconRegistry = new IconRegistry();
    platform.Registry.add(exports.Extensions.IconContribution, iconRegistry);
    function registerIcon(id, defaults, description, deprecationMessage) {
        return iconRegistry.registerIcon(id, defaults, description, deprecationMessage);
    }
    exports.registerIcon = registerIcon;
    function getIconRegistry() {
        return iconRegistry;
    }
    exports.getIconRegistry = getIconRegistry;
    function initialize() {
        for (const icon of Codicons.iconRegistry.all) {
            iconRegistry.registerIcon(icon.id, icon.definition, icon.description);
        }
        Codicons.iconRegistry.onDidRegister(icon => iconRegistry.registerIcon(icon.id, icon.definition, icon.description));
    }
    initialize();
    exports.iconsSchemaId = 'vscode://schemas/icons';
    let schemaRegistry = platform.Registry.as(jsonContributionRegistry_1.Extensions.JSONContribution);
    schemaRegistry.registerSchema(exports.iconsSchemaId, iconRegistry.getIconSchema());
    const delayer = new async_1.RunOnceScheduler(() => schemaRegistry.notifySchemaChanged(exports.iconsSchemaId), 200);
    iconRegistry.onDidChange(() => {
        if (!delayer.isScheduled()) {
            delayer.schedule();
        }
    });
    //setTimeout(_ => console.log(iconRegistry.toString()), 5000);
    // common icons
    exports.widgetClose = registerIcon('widget-close', Codicons.Codicon.close, (0, nls_1.localize)(2, null));
    exports.gotoPreviousLocation = registerIcon('goto-previous-location', Codicons.Codicon.arrowUp, (0, nls_1.localize)(3, null));
    exports.gotoNextLocation = registerIcon('goto-next-location', Codicons.Codicon.arrowDown, (0, nls_1.localize)(4, null));
    exports.syncing = themeService_1.ThemeIcon.modify(Codicons.Codicon.sync, 'spin');
});
//# sourceMappingURL=iconRegistry.js.map