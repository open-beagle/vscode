/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/theme/common/themeService", "vs/platform/theme/common/iconRegistry", "vs/base/browser/dom", "vs/base/common/event"], function (require, exports, themeService_1, iconRegistry_1, dom_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIconsStyleSheet = void 0;
    function getIconsStyleSheet() {
        const onDidChangeEmmiter = new event_1.Emitter();
        const iconRegistry = (0, iconRegistry_1.getIconRegistry)();
        iconRegistry.onDidChange(() => onDidChangeEmmiter.fire());
        return {
            onDidChange: onDidChangeEmmiter.event,
            getCSS() {
                const usedFontIds = {};
                const formatIconRule = (contribution) => {
                    let definition = contribution.defaults;
                    while (themeService_1.ThemeIcon.isThemeIcon(definition)) {
                        const c = iconRegistry.getIcon(definition.id);
                        if (!c) {
                            return undefined;
                        }
                        definition = c.defaults;
                    }
                    const fontId = definition.fontId;
                    if (fontId) {
                        const fontContribution = iconRegistry.getIconFont(fontId);
                        if (fontContribution) {
                            usedFontIds[fontId] = fontContribution;
                            return `.codicon-${contribution.id}:before { content: '${definition.fontCharacter}'; font-family: ${(0, dom_1.asCSSPropertyValue)(fontId)}; }`;
                        }
                    }
                    return `.codicon-${contribution.id}:before { content: '${definition.fontCharacter}'; }`;
                };
                const rules = [];
                for (let contribution of iconRegistry.getIcons()) {
                    const rule = formatIconRule(contribution);
                    if (rule) {
                        rules.push(rule);
                    }
                }
                for (let id in usedFontIds) {
                    const fontContribution = usedFontIds[id];
                    const src = fontContribution.definition.src.map(l => `${(0, dom_1.asCSSUrl)(l.location)} format('${l.format}')`).join(', ');
                    rules.push(`@font-face { src: ${src}; font-family: ${(0, dom_1.asCSSPropertyValue)(id)}; }`);
                }
                return rules.join('\n');
            }
        };
    }
    exports.getIconsStyleSheet = getIconsStyleSheet;
});
//# sourceMappingURL=iconsStyleSheet.js.map