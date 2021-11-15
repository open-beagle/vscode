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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/highlightedlabel/highlightedLabel", "vs/base/common/filters", "vs/editor/common/core/range", "vs/editor/common/modes", "vs/editor/contrib/documentSymbols/outlineModel", "vs/nls!vs/workbench/contrib/codeEditor/browser/outline/documentSymbolsTree", "vs/base/browser/ui/iconLabel/iconLabel", "vs/platform/configuration/common/configuration", "vs/platform/markers/common/markers", "vs/platform/theme/common/themeService", "vs/platform/theme/common/colorRegistry", "vs/base/common/async", "vs/editor/common/services/textResourceConfigurationService", "vs/css!./documentSymbolsTree", "vs/editor/contrib/symbolIcons/symbolIcons"], function (require, exports, dom, highlightedLabel_1, filters_1, range_1, modes_1, outlineModel_1, nls_1, iconLabel_1, configuration_1, markers_1, themeService_1, colorRegistry_1, async_1, textResourceConfigurationService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocumentSymbolComparator = exports.DocumentSymbolFilter = exports.DocumentSymbolRenderer = exports.DocumentSymbolGroupRenderer = exports.DocumentSymbolVirtualDelegate = exports.DocumentSymbolIdentityProvider = exports.DocumentSymbolAccessibilityProvider = exports.DocumentSymbolNavigationLabelProvider = void 0;
    class DocumentSymbolNavigationLabelProvider {
        getKeyboardNavigationLabel(element) {
            if (element instanceof outlineModel_1.OutlineGroup) {
                return element.label;
            }
            else {
                return element.symbol.name;
            }
        }
    }
    exports.DocumentSymbolNavigationLabelProvider = DocumentSymbolNavigationLabelProvider;
    class DocumentSymbolAccessibilityProvider {
        constructor(_ariaLabel) {
            this._ariaLabel = _ariaLabel;
        }
        getWidgetAriaLabel() {
            return this._ariaLabel;
        }
        getAriaLabel(element) {
            if (element instanceof outlineModel_1.OutlineGroup) {
                return element.label;
            }
            else {
                return element.symbol.name;
            }
        }
    }
    exports.DocumentSymbolAccessibilityProvider = DocumentSymbolAccessibilityProvider;
    class DocumentSymbolIdentityProvider {
        getId(element) {
            return element.id;
        }
    }
    exports.DocumentSymbolIdentityProvider = DocumentSymbolIdentityProvider;
    class DocumentSymbolGroupTemplate {
        constructor(labelContainer, label) {
            this.labelContainer = labelContainer;
            this.label = label;
        }
    }
    DocumentSymbolGroupTemplate.id = 'DocumentSymbolGroupTemplate';
    class DocumentSymbolTemplate {
        constructor(container, iconLabel, iconClass, decoration) {
            this.container = container;
            this.iconLabel = iconLabel;
            this.iconClass = iconClass;
            this.decoration = decoration;
        }
    }
    DocumentSymbolTemplate.id = 'DocumentSymbolTemplate';
    class DocumentSymbolVirtualDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(element) {
            return element instanceof outlineModel_1.OutlineGroup
                ? DocumentSymbolGroupTemplate.id
                : DocumentSymbolTemplate.id;
        }
    }
    exports.DocumentSymbolVirtualDelegate = DocumentSymbolVirtualDelegate;
    class DocumentSymbolGroupRenderer {
        constructor() {
            this.templateId = DocumentSymbolGroupTemplate.id;
        }
        renderTemplate(container) {
            const labelContainer = dom.$('.outline-element-label');
            container.classList.add('outline-element');
            dom.append(container, labelContainer);
            return new DocumentSymbolGroupTemplate(labelContainer, new highlightedLabel_1.HighlightedLabel(labelContainer, true));
        }
        renderElement(node, _index, template) {
            template.label.set(node.element.label, (0, filters_1.createMatches)(node.filterData));
        }
        disposeTemplate(_template) {
            // nothing
        }
    }
    exports.DocumentSymbolGroupRenderer = DocumentSymbolGroupRenderer;
    let DocumentSymbolRenderer = class DocumentSymbolRenderer {
        constructor(_renderMarker, _configurationService, _themeService) {
            this._renderMarker = _renderMarker;
            this._configurationService = _configurationService;
            this._themeService = _themeService;
            this.templateId = DocumentSymbolTemplate.id;
        }
        renderTemplate(container) {
            container.classList.add('outline-element');
            const iconLabel = new iconLabel_1.IconLabel(container, { supportHighlights: true });
            const iconClass = dom.$('.outline-element-icon');
            const decoration = dom.$('.outline-element-decoration');
            container.prepend(iconClass);
            container.appendChild(decoration);
            return new DocumentSymbolTemplate(container, iconLabel, iconClass, decoration);
        }
        renderElement(node, _index, template) {
            const { element } = node;
            const options = {
                matches: (0, filters_1.createMatches)(node.filterData),
                labelEscapeNewLines: true,
                extraClasses: ['nowrap'],
                title: (0, nls_1.localize)(0, null, element.symbol.name, DocumentSymbolRenderer._symbolKindNames[element.symbol.kind])
            };
            if (this._configurationService.getValue("outline.icons" /* icons */)) {
                // add styles for the icons
                template.iconClass.className = '';
                template.iconClass.classList.add(`outline-element-icon`, ...modes_1.SymbolKinds.toCssClassName(element.symbol.kind, true).split(' '));
            }
            if (element.symbol.tags.indexOf(1 /* Deprecated */) >= 0) {
                options.extraClasses.push(`deprecated`);
                options.matches = [];
            }
            template.iconLabel.setLabel(element.symbol.name, element.symbol.detail, options);
            if (this._renderMarker) {
                this._renderMarkerInfo(element, template);
            }
        }
        _renderMarkerInfo(element, template) {
            if (!element.marker) {
                dom.hide(template.decoration);
                template.container.style.removeProperty('--outline-element-color');
                return;
            }
            const { count, topSev } = element.marker;
            const color = this._themeService.getColorTheme().getColor(topSev === markers_1.MarkerSeverity.Error ? colorRegistry_1.listErrorForeground : colorRegistry_1.listWarningForeground);
            const cssColor = color ? color.toString() : 'inherit';
            // color of the label
            if (this._configurationService.getValue("outline.problems.colors" /* problemsColors */)) {
                template.container.style.setProperty('--outline-element-color', cssColor);
            }
            else {
                template.container.style.removeProperty('--outline-element-color');
            }
            // badge with color/rollup
            if (!this._configurationService.getValue("outline.problems.badges" /* problemsBadges */)) {
                dom.hide(template.decoration);
            }
            else if (count > 0) {
                dom.show(template.decoration);
                template.decoration.classList.remove('bubble');
                template.decoration.innerText = count < 10 ? count.toString() : '+9';
                template.decoration.title = count === 1 ? (0, nls_1.localize)(1, null) : (0, nls_1.localize)(2, null, count);
                template.decoration.style.setProperty('--outline-element-color', cssColor);
            }
            else {
                dom.show(template.decoration);
                template.decoration.classList.add('bubble');
                template.decoration.innerText = '\uea71';
                template.decoration.title = (0, nls_1.localize)(3, null);
                template.decoration.style.setProperty('--outline-element-color', cssColor);
            }
        }
        disposeTemplate(_template) {
            _template.iconLabel.dispose();
        }
    };
    DocumentSymbolRenderer._symbolKindNames = {
        [17 /* Array */]: (0, nls_1.localize)(4, null),
        [16 /* Boolean */]: (0, nls_1.localize)(5, null),
        [4 /* Class */]: (0, nls_1.localize)(6, null),
        [13 /* Constant */]: (0, nls_1.localize)(7, null),
        [8 /* Constructor */]: (0, nls_1.localize)(8, null),
        [9 /* Enum */]: (0, nls_1.localize)(9, null),
        [21 /* EnumMember */]: (0, nls_1.localize)(10, null),
        [23 /* Event */]: (0, nls_1.localize)(11, null),
        [7 /* Field */]: (0, nls_1.localize)(12, null),
        [0 /* File */]: (0, nls_1.localize)(13, null),
        [11 /* Function */]: (0, nls_1.localize)(14, null),
        [10 /* Interface */]: (0, nls_1.localize)(15, null),
        [19 /* Key */]: (0, nls_1.localize)(16, null),
        [5 /* Method */]: (0, nls_1.localize)(17, null),
        [1 /* Module */]: (0, nls_1.localize)(18, null),
        [2 /* Namespace */]: (0, nls_1.localize)(19, null),
        [20 /* Null */]: (0, nls_1.localize)(20, null),
        [15 /* Number */]: (0, nls_1.localize)(21, null),
        [18 /* Object */]: (0, nls_1.localize)(22, null),
        [24 /* Operator */]: (0, nls_1.localize)(23, null),
        [3 /* Package */]: (0, nls_1.localize)(24, null),
        [6 /* Property */]: (0, nls_1.localize)(25, null),
        [14 /* String */]: (0, nls_1.localize)(26, null),
        [22 /* Struct */]: (0, nls_1.localize)(27, null),
        [25 /* TypeParameter */]: (0, nls_1.localize)(28, null),
        [12 /* Variable */]: (0, nls_1.localize)(29, null),
    };
    DocumentSymbolRenderer = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, themeService_1.IThemeService)
    ], DocumentSymbolRenderer);
    exports.DocumentSymbolRenderer = DocumentSymbolRenderer;
    let DocumentSymbolFilter = class DocumentSymbolFilter {
        constructor(_prefix, _textResourceConfigService) {
            this._prefix = _prefix;
            this._textResourceConfigService = _textResourceConfigService;
        }
        filter(element) {
            const outline = outlineModel_1.OutlineModel.get(element);
            if (!(element instanceof outlineModel_1.OutlineElement)) {
                return true;
            }
            const configName = DocumentSymbolFilter.kindToConfigName[element.symbol.kind];
            const configKey = `${this._prefix}.${configName}`;
            return this._textResourceConfigService.getValue(outline === null || outline === void 0 ? void 0 : outline.uri, configKey);
        }
    };
    DocumentSymbolFilter.kindToConfigName = Object.freeze({
        [0 /* File */]: 'showFiles',
        [1 /* Module */]: 'showModules',
        [2 /* Namespace */]: 'showNamespaces',
        [3 /* Package */]: 'showPackages',
        [4 /* Class */]: 'showClasses',
        [5 /* Method */]: 'showMethods',
        [6 /* Property */]: 'showProperties',
        [7 /* Field */]: 'showFields',
        [8 /* Constructor */]: 'showConstructors',
        [9 /* Enum */]: 'showEnums',
        [10 /* Interface */]: 'showInterfaces',
        [11 /* Function */]: 'showFunctions',
        [12 /* Variable */]: 'showVariables',
        [13 /* Constant */]: 'showConstants',
        [14 /* String */]: 'showStrings',
        [15 /* Number */]: 'showNumbers',
        [16 /* Boolean */]: 'showBooleans',
        [17 /* Array */]: 'showArrays',
        [18 /* Object */]: 'showObjects',
        [19 /* Key */]: 'showKeys',
        [20 /* Null */]: 'showNull',
        [21 /* EnumMember */]: 'showEnumMembers',
        [22 /* Struct */]: 'showStructs',
        [23 /* Event */]: 'showEvents',
        [24 /* Operator */]: 'showOperators',
        [25 /* TypeParameter */]: 'showTypeParameters',
    });
    DocumentSymbolFilter = __decorate([
        __param(1, textResourceConfigurationService_1.ITextResourceConfigurationService)
    ], DocumentSymbolFilter);
    exports.DocumentSymbolFilter = DocumentSymbolFilter;
    class DocumentSymbolComparator {
        constructor() {
            this._collator = new async_1.IdleValue(() => new Intl.Collator(undefined, { numeric: true }));
        }
        compareByPosition(a, b) {
            if (a instanceof outlineModel_1.OutlineGroup && b instanceof outlineModel_1.OutlineGroup) {
                return a.order - b.order;
            }
            else if (a instanceof outlineModel_1.OutlineElement && b instanceof outlineModel_1.OutlineElement) {
                return range_1.Range.compareRangesUsingStarts(a.symbol.range, b.symbol.range) || this._collator.value.compare(a.symbol.name, b.symbol.name);
            }
            return 0;
        }
        compareByType(a, b) {
            if (a instanceof outlineModel_1.OutlineGroup && b instanceof outlineModel_1.OutlineGroup) {
                return a.order - b.order;
            }
            else if (a instanceof outlineModel_1.OutlineElement && b instanceof outlineModel_1.OutlineElement) {
                return a.symbol.kind - b.symbol.kind || this._collator.value.compare(a.symbol.name, b.symbol.name);
            }
            return 0;
        }
        compareByName(a, b) {
            if (a instanceof outlineModel_1.OutlineGroup && b instanceof outlineModel_1.OutlineGroup) {
                return a.order - b.order;
            }
            else if (a instanceof outlineModel_1.OutlineElement && b instanceof outlineModel_1.OutlineElement) {
                return this._collator.value.compare(a.symbol.name, b.symbol.name) || range_1.Range.compareRangesUsingStarts(a.symbol.range, b.symbol.range);
            }
            return 0;
        }
    }
    exports.DocumentSymbolComparator = DocumentSymbolComparator;
});
//# sourceMappingURL=documentSymbolsTree.js.map