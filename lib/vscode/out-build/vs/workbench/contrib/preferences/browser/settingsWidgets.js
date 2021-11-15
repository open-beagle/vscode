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
define(["require", "exports", "vs/base/browser/canIUse", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/selectBox/selectBox", "vs/base/common/async", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/types", "vs/nls!vs/workbench/contrib/preferences/browser/settingsWidgets", "vs/platform/contextview/browser/contextView", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/styler", "vs/platform/theme/common/themeService", "vs/workbench/contrib/preferences/browser/preferencesIcons", "vs/css!./media/settingsWidgets"], function (require, exports, canIUse_1, DOM, actionbar_1, button_1, inputBox_1, selectBox_1, async_1, color_1, event_1, lifecycle_1, platform_1, types_1, nls_1, contextView_1, colorRegistry_1, styler_1, themeService_1, preferencesIcons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ObjectSettingWidget = exports.ExcludeSettingWidget = exports.ListSettingWidget = exports.AbstractListSettingWidget = exports.ListSettingListModel = exports.focusedRowBorder = exports.rowHoverBackground = exports.focusedRowBackground = exports.settingsNumberInputBorder = exports.settingsNumberInputForeground = exports.settingsNumberInputBackground = exports.settingsTextInputBorder = exports.settingsTextInputForeground = exports.settingsTextInputBackground = exports.settingsCheckboxBorder = exports.settingsCheckboxForeground = exports.settingsCheckboxBackground = exports.settingsSelectListBorder = exports.settingsSelectBorder = exports.settingsSelectForeground = exports.settingsSelectBackground = exports.modifiedItemIndicator = exports.settingsHeaderForeground = void 0;
    const $ = DOM.$;
    exports.settingsHeaderForeground = (0, colorRegistry_1.registerColor)('settings.headerForeground', { light: '#444444', dark: '#e7e7e7', hc: '#ffffff' }, (0, nls_1.localize)(0, null));
    exports.modifiedItemIndicator = (0, colorRegistry_1.registerColor)('settings.modifiedItemIndicator', {
        light: new color_1.Color(new color_1.RGBA(102, 175, 224)),
        dark: new color_1.Color(new color_1.RGBA(12, 125, 157)),
        hc: new color_1.Color(new color_1.RGBA(0, 73, 122))
    }, (0, nls_1.localize)(1, null));
    // Enum control colors
    exports.settingsSelectBackground = (0, colorRegistry_1.registerColor)(`settings.dropdownBackground`, { dark: colorRegistry_1.selectBackground, light: colorRegistry_1.selectBackground, hc: colorRegistry_1.selectBackground }, (0, nls_1.localize)(2, null));
    exports.settingsSelectForeground = (0, colorRegistry_1.registerColor)('settings.dropdownForeground', { dark: colorRegistry_1.selectForeground, light: colorRegistry_1.selectForeground, hc: colorRegistry_1.selectForeground }, (0, nls_1.localize)(3, null));
    exports.settingsSelectBorder = (0, colorRegistry_1.registerColor)('settings.dropdownBorder', { dark: colorRegistry_1.selectBorder, light: colorRegistry_1.selectBorder, hc: colorRegistry_1.selectBorder }, (0, nls_1.localize)(4, null));
    exports.settingsSelectListBorder = (0, colorRegistry_1.registerColor)('settings.dropdownListBorder', { dark: colorRegistry_1.editorWidgetBorder, light: colorRegistry_1.editorWidgetBorder, hc: colorRegistry_1.editorWidgetBorder }, (0, nls_1.localize)(5, null));
    // Bool control colors
    exports.settingsCheckboxBackground = (0, colorRegistry_1.registerColor)('settings.checkboxBackground', { dark: colorRegistry_1.simpleCheckboxBackground, light: colorRegistry_1.simpleCheckboxBackground, hc: colorRegistry_1.simpleCheckboxBackground }, (0, nls_1.localize)(6, null));
    exports.settingsCheckboxForeground = (0, colorRegistry_1.registerColor)('settings.checkboxForeground', { dark: colorRegistry_1.simpleCheckboxForeground, light: colorRegistry_1.simpleCheckboxForeground, hc: colorRegistry_1.simpleCheckboxForeground }, (0, nls_1.localize)(7, null));
    exports.settingsCheckboxBorder = (0, colorRegistry_1.registerColor)('settings.checkboxBorder', { dark: colorRegistry_1.simpleCheckboxBorder, light: colorRegistry_1.simpleCheckboxBorder, hc: colorRegistry_1.simpleCheckboxBorder }, (0, nls_1.localize)(8, null));
    // Text control colors
    exports.settingsTextInputBackground = (0, colorRegistry_1.registerColor)('settings.textInputBackground', { dark: colorRegistry_1.inputBackground, light: colorRegistry_1.inputBackground, hc: colorRegistry_1.inputBackground }, (0, nls_1.localize)(9, null));
    exports.settingsTextInputForeground = (0, colorRegistry_1.registerColor)('settings.textInputForeground', { dark: colorRegistry_1.inputForeground, light: colorRegistry_1.inputForeground, hc: colorRegistry_1.inputForeground }, (0, nls_1.localize)(10, null));
    exports.settingsTextInputBorder = (0, colorRegistry_1.registerColor)('settings.textInputBorder', { dark: colorRegistry_1.inputBorder, light: colorRegistry_1.inputBorder, hc: colorRegistry_1.inputBorder }, (0, nls_1.localize)(11, null));
    // Number control colors
    exports.settingsNumberInputBackground = (0, colorRegistry_1.registerColor)('settings.numberInputBackground', { dark: colorRegistry_1.inputBackground, light: colorRegistry_1.inputBackground, hc: colorRegistry_1.inputBackground }, (0, nls_1.localize)(12, null));
    exports.settingsNumberInputForeground = (0, colorRegistry_1.registerColor)('settings.numberInputForeground', { dark: colorRegistry_1.inputForeground, light: colorRegistry_1.inputForeground, hc: colorRegistry_1.inputForeground }, (0, nls_1.localize)(13, null));
    exports.settingsNumberInputBorder = (0, colorRegistry_1.registerColor)('settings.numberInputBorder', { dark: colorRegistry_1.inputBorder, light: colorRegistry_1.inputBorder, hc: colorRegistry_1.inputBorder }, (0, nls_1.localize)(14, null));
    exports.focusedRowBackground = (0, colorRegistry_1.registerColor)('settings.focusedRowBackground', {
        dark: color_1.Color.fromHex('#808080').transparent(0.14),
        light: (0, colorRegistry_1.transparent)(colorRegistry_1.listFocusBackground, .4),
        hc: null
    }, (0, nls_1.localize)(15, null));
    exports.rowHoverBackground = (0, colorRegistry_1.registerColor)('notebook.rowHoverBackground', {
        dark: (0, colorRegistry_1.transparent)(exports.focusedRowBackground, .5),
        light: (0, colorRegistry_1.transparent)(exports.focusedRowBackground, .7),
        hc: null
    }, (0, nls_1.localize)(16, null));
    exports.focusedRowBorder = (0, colorRegistry_1.registerColor)('notebook.focusedRowBorder', {
        dark: color_1.Color.white.transparent(0.12),
        light: color_1.Color.black.transparent(0.12),
        hc: colorRegistry_1.focusBorder
    }, (0, nls_1.localize)(17, null));
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const checkboxBackgroundColor = theme.getColor(exports.settingsCheckboxBackground);
        if (checkboxBackgroundColor) {
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-bool .setting-value-checkbox { background-color: ${checkboxBackgroundColor} !important; }`);
        }
        const checkboxForegroundColor = theme.getColor(exports.settingsCheckboxForeground);
        if (checkboxForegroundColor) {
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-bool .setting-value-checkbox { color: ${checkboxForegroundColor} !important; }`);
        }
        const checkboxBorderColor = theme.getColor(exports.settingsCheckboxBorder);
        if (checkboxBorderColor) {
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-bool .setting-value-checkbox { border-color: ${checkboxBorderColor} !important; }`);
        }
        const link = theme.getColor(colorRegistry_1.textLinkForeground);
        if (link) {
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-trust-description a { color: ${link}; }`);
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-trust-description a > code { color: ${link}; }`);
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-markdown a { color: ${link}; }`);
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-markdown a > code { color: ${link}; }`);
            collector.addRule(`.monaco-select-box-dropdown-container > .select-box-details-pane > .select-box-description-markdown a { color: ${link}; }`);
            collector.addRule(`.monaco-select-box-dropdown-container > .select-box-details-pane > .select-box-description-markdown a > code { color: ${link}; }`);
            const disabledfgColor = new color_1.Color(new color_1.RGBA(link.rgba.r, link.rgba.g, link.rgba.b, 0.8));
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item.setting-item-untrusted > .setting-item-contents .setting-item-markdown a { color: ${disabledfgColor}; }`);
        }
        const activeLink = theme.getColor(colorRegistry_1.textLinkActiveForeground);
        if (activeLink) {
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-trust-description a:hover, .settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-trust-description a:active { color: ${activeLink}; }`);
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-trust-description a:hover > code, .settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-trust-description a:active > code { color: ${activeLink}; }`);
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-markdown a:hover, .settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-markdown a:active { color: ${activeLink}; }`);
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-markdown a:hover > code, .settings-editor > .settings-body > .settings-tree-container .setting-item-contents .setting-item-markdown a:active > code { color: ${activeLink}; }`);
            collector.addRule(`.monaco-select-box-dropdown-container > .select-box-details-pane > .select-box-description-markdown a:hover, .monaco-select-box-dropdown-container > .select-box-details-pane > .select-box-description-markdown a:active { color: ${activeLink}; }`);
            collector.addRule(`.monaco-select-box-dropdown-container > .select-box-details-pane > .select-box-description-markdown a:hover > code, .monaco-select-box-dropdown-container > .select-box-details-pane > .select-box-description-markdown a:active > code { color: ${activeLink}; }`);
        }
        const headerForegroundColor = theme.getColor(exports.settingsHeaderForeground);
        if (headerForegroundColor) {
            collector.addRule(`.settings-editor > .settings-header > .settings-header-controls .settings-tabs-widget .action-label.checked { color: ${headerForegroundColor}; border-bottom-color: ${headerForegroundColor}; }`);
        }
        const foregroundColor = theme.getColor(colorRegistry_1.foreground);
        if (foregroundColor) {
            collector.addRule(`.settings-editor > .settings-header > .settings-header-controls .settings-tabs-widget .action-label { color: ${foregroundColor}; }`);
        }
        // List control
        const listHoverBackgroundColor = theme.getColor(colorRegistry_1.listHoverBackground);
        if (listHoverBackgroundColor) {
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item.setting-item-list .setting-list-row:hover { background-color: ${listHoverBackgroundColor}; }`);
        }
        const listHoverForegroundColor = theme.getColor(colorRegistry_1.listHoverForeground);
        if (listHoverForegroundColor) {
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item.setting-item-list .setting-list-row:hover { color: ${listHoverForegroundColor}; }`);
        }
        const listSelectBackgroundColor = theme.getColor(colorRegistry_1.listActiveSelectionBackground);
        if (listSelectBackgroundColor) {
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item.setting-item-list .setting-list-row.selected:focus { background-color: ${listSelectBackgroundColor}; }`);
        }
        const listInactiveSelectionBackgroundColor = theme.getColor(colorRegistry_1.listInactiveSelectionBackground);
        if (listInactiveSelectionBackgroundColor) {
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item.setting-item-list .setting-list-row.selected:not(:focus) { background-color: ${listInactiveSelectionBackgroundColor}; }`);
        }
        const listInactiveSelectionForegroundColor = theme.getColor(colorRegistry_1.listInactiveSelectionForeground);
        if (listInactiveSelectionForegroundColor) {
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item.setting-item-list .setting-list-row.selected:not(:focus) { color: ${listInactiveSelectionForegroundColor}; }`);
        }
        const listSelectForegroundColor = theme.getColor(colorRegistry_1.listActiveSelectionForeground);
        if (listSelectForegroundColor) {
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item.setting-item-list .setting-list-row.selected:focus { color: ${listSelectForegroundColor}; }`);
        }
        const codeTextForegroundColor = theme.getColor(colorRegistry_1.textPreformatForeground);
        if (codeTextForegroundColor) {
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item .setting-item-markdown code { color: ${codeTextForegroundColor} }`);
            collector.addRule(`.monaco-select-box-dropdown-container > .select-box-details-pane > .select-box-description-markdown code { color: ${codeTextForegroundColor} }`);
            const disabledfgColor = new color_1.Color(new color_1.RGBA(codeTextForegroundColor.rgba.r, codeTextForegroundColor.rgba.g, codeTextForegroundColor.rgba.b, 0.8));
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item.setting-item-untrusted > .setting-item-contents .setting-item-description .setting-item-markdown code { color: ${disabledfgColor} }`);
        }
        const modifiedItemIndicatorColor = theme.getColor(exports.modifiedItemIndicator);
        if (modifiedItemIndicatorColor) {
            collector.addRule(`.settings-editor > .settings-body > .settings-tree-container .setting-item-contents > .setting-item-modified-indicator { border-color: ${modifiedItemIndicatorColor}; }`);
        }
    });
    class ListSettingListModel {
        constructor(newItem) {
            this._dataItems = [];
            this._editKey = null;
            this._selectedIdx = null;
            this._newDataItem = newItem;
        }
        get items() {
            const items = this._dataItems.map((item, i) => {
                const editing = typeof this._editKey === 'number' && this._editKey === i;
                return Object.assign(Object.assign({}, item), { editing, selected: i === this._selectedIdx || editing });
            });
            if (this._editKey === 'create') {
                items.push(Object.assign({ editing: true, selected: true }, this._newDataItem));
            }
            return items;
        }
        setEditKey(key) {
            this._editKey = key;
        }
        setValue(listData) {
            this._dataItems = listData;
        }
        select(idx) {
            this._selectedIdx = idx;
        }
        getSelected() {
            return this._selectedIdx;
        }
        selectNext() {
            if (typeof this._selectedIdx === 'number') {
                this._selectedIdx = Math.min(this._selectedIdx + 1, this._dataItems.length - 1);
            }
            else {
                this._selectedIdx = 0;
            }
        }
        selectPrevious() {
            if (typeof this._selectedIdx === 'number') {
                this._selectedIdx = Math.max(this._selectedIdx - 1, 0);
            }
            else {
                this._selectedIdx = 0;
            }
        }
    }
    exports.ListSettingListModel = ListSettingListModel;
    let AbstractListSettingWidget = class AbstractListSettingWidget extends lifecycle_1.Disposable {
        constructor(container, themeService, contextViewService) {
            super();
            this.container = container;
            this.themeService = themeService;
            this.contextViewService = contextViewService;
            this.rowElements = [];
            this._onDidChangeList = this._register(new event_1.Emitter());
            this.model = new ListSettingListModel(this.getEmptyItem());
            this.listDisposables = this._register(new lifecycle_1.DisposableStore());
            this.onDidChangeList = this._onDidChangeList.event;
            this.listElement = DOM.append(container, $('div'));
            this.listElement.setAttribute('role', 'list');
            this.getContainerClasses().forEach(c => this.listElement.classList.add(c));
            this.listElement.setAttribute('tabindex', '0');
            DOM.append(container, this.renderAddButton());
            this.renderList();
            this._register(DOM.addDisposableListener(this.listElement, DOM.EventType.CLICK, e => this.onListClick(e)));
            this._register(DOM.addDisposableListener(this.listElement, DOM.EventType.DBLCLICK, e => this.onListDoubleClick(e)));
            this._register(DOM.addStandardDisposableListener(this.listElement, 'keydown', (e) => {
                if (e.equals(16 /* UpArrow */)) {
                    this.selectPreviousRow();
                }
                else if (e.equals(18 /* DownArrow */)) {
                    this.selectNextRow();
                }
                else {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
            }));
        }
        get domNode() {
            return this.listElement;
        }
        get items() {
            return this.model.items;
        }
        setValue(listData) {
            this.model.setValue(listData);
            this.renderList();
        }
        renderHeader() {
            return;
        }
        isAddButtonVisible() {
            return true;
        }
        renderList() {
            const focused = DOM.isAncestor(document.activeElement, this.listElement);
            DOM.clearNode(this.listElement);
            this.listDisposables.clear();
            const newMode = this.model.items.some(item => !!(item.editing && this.isItemNew(item)));
            this.container.classList.toggle('setting-list-hide-add-button', !this.isAddButtonVisible() || newMode);
            const header = this.renderHeader();
            const ITEM_HEIGHT = 24;
            let listHeight = ITEM_HEIGHT * this.model.items.length;
            if (header) {
                listHeight += ITEM_HEIGHT;
                this.listElement.appendChild(header);
            }
            this.rowElements = this.model.items.map((item, i) => this.renderDataOrEditItem(item, i, focused));
            this.rowElements.forEach(rowElement => this.listElement.appendChild(rowElement));
            this.listElement.style.height = listHeight + 'px';
        }
        editSetting(idx) {
            this.model.setEditKey(idx);
            this.renderList();
        }
        cancelEdit() {
            this.model.setEditKey('none');
            this.renderList();
        }
        handleItemChange(originalItem, changedItem, idx) {
            this.model.setEditKey('none');
            this._onDidChangeList.fire({
                originalItem,
                item: changedItem,
                targetIndex: idx,
            });
            this.renderList();
        }
        renderDataOrEditItem(item, idx, listFocused) {
            const rowElement = item.editing ?
                this.renderEdit(item, idx) :
                this.renderDataItem(item, idx, listFocused);
            rowElement.setAttribute('role', 'listitem');
            return rowElement;
        }
        renderDataItem(item, idx, listFocused) {
            const rowElement = this.renderItem(item);
            rowElement.setAttribute('data-index', idx + '');
            rowElement.setAttribute('tabindex', item.selected ? '0' : '-1');
            rowElement.classList.toggle('selected', item.selected);
            const actionBar = new actionbar_1.ActionBar(rowElement);
            this.listDisposables.add(actionBar);
            actionBar.push(this.getActionsForItem(item, idx), { icon: true, label: true });
            rowElement.title = this.getLocalizedRowTitle(item);
            rowElement.setAttribute('aria-label', rowElement.title);
            if (item.selected && listFocused) {
                this.listDisposables.add((0, async_1.disposableTimeout)(() => rowElement.focus()));
            }
            return rowElement;
        }
        renderAddButton() {
            const rowElement = $('.setting-list-new-row');
            const startAddButton = this._register(new button_1.Button(rowElement));
            startAddButton.label = this.getLocalizedStrings().addButtonLabel;
            startAddButton.element.classList.add('setting-list-addButton');
            this._register((0, styler_1.attachButtonStyler)(startAddButton, this.themeService));
            this._register(startAddButton.onDidClick(() => {
                this.model.setEditKey('create');
                this.renderList();
            }));
            return rowElement;
        }
        onListClick(e) {
            const targetIdx = this.getClickedItemIndex(e);
            if (targetIdx < 0) {
                return;
            }
            if (this.model.getSelected() === targetIdx) {
                return;
            }
            this.selectRow(targetIdx);
            e.preventDefault();
            e.stopPropagation();
        }
        onListDoubleClick(e) {
            const targetIdx = this.getClickedItemIndex(e);
            if (targetIdx < 0) {
                return;
            }
            const item = this.model.items[targetIdx];
            if (item) {
                this.editSetting(targetIdx);
                e.preventDefault();
                e.stopPropagation();
            }
        }
        getClickedItemIndex(e) {
            if (!e.target) {
                return -1;
            }
            const actionbar = DOM.findParentWithClass(e.target, 'monaco-action-bar');
            if (actionbar) {
                // Don't handle doubleclicks inside the action bar
                return -1;
            }
            const element = DOM.findParentWithClass(e.target, 'setting-list-row');
            if (!element) {
                return -1;
            }
            const targetIdxStr = element.getAttribute('data-index');
            if (!targetIdxStr) {
                return -1;
            }
            const targetIdx = parseInt(targetIdxStr);
            return targetIdx;
        }
        selectRow(idx) {
            this.model.select(idx);
            this.rowElements.forEach(row => row.classList.remove('selected'));
            const selectedRow = this.rowElements[this.model.getSelected()];
            selectedRow.classList.add('selected');
            selectedRow.focus();
        }
        selectNextRow() {
            this.model.selectNext();
            this.selectRow(this.model.getSelected());
        }
        selectPreviousRow() {
            this.model.selectPrevious();
            this.selectRow(this.model.getSelected());
        }
    };
    AbstractListSettingWidget = __decorate([
        __param(1, themeService_1.IThemeService),
        __param(2, contextView_1.IContextViewService)
    ], AbstractListSettingWidget);
    exports.AbstractListSettingWidget = AbstractListSettingWidget;
    class ListSettingWidget extends AbstractListSettingWidget {
        getEmptyItem() {
            return { value: '' };
        }
        getContainerClasses() {
            return ['setting-list-widget'];
        }
        getActionsForItem(item, idx) {
            return [
                {
                    class: themeService_1.ThemeIcon.asClassName(preferencesIcons_1.settingsEditIcon),
                    enabled: true,
                    id: 'workbench.action.editListItem',
                    tooltip: this.getLocalizedStrings().editActionTooltip,
                    run: () => this.editSetting(idx)
                },
                {
                    class: themeService_1.ThemeIcon.asClassName(preferencesIcons_1.settingsRemoveIcon),
                    enabled: true,
                    id: 'workbench.action.removeListItem',
                    tooltip: this.getLocalizedStrings().deleteActionTooltip,
                    run: () => this._onDidChangeList.fire({ originalItem: item, item: undefined, targetIndex: idx })
                }
            ];
        }
        renderItem(item) {
            const rowElement = $('.setting-list-row');
            const valueElement = DOM.append(rowElement, $('.setting-list-value'));
            const siblingElement = DOM.append(rowElement, $('.setting-list-sibling'));
            valueElement.textContent = item.value;
            siblingElement.textContent = item.sibling ? `when: ${item.sibling}` : null;
            return rowElement;
        }
        renderEdit(item, idx) {
            const rowElement = $('.setting-list-edit-row');
            const updatedItem = () => ({
                value: valueInput.value,
                sibling: siblingInput === null || siblingInput === void 0 ? void 0 : siblingInput.value
            });
            const onKeyDown = (e) => {
                if (e.equals(3 /* Enter */)) {
                    this.handleItemChange(item, updatedItem(), idx);
                }
                else if (e.equals(9 /* Escape */)) {
                    this.cancelEdit();
                    e.preventDefault();
                }
                rowElement === null || rowElement === void 0 ? void 0 : rowElement.focus();
            };
            const valueInput = new inputBox_1.InputBox(rowElement, this.contextViewService, {
                placeholder: this.getLocalizedStrings().inputPlaceholder
            });
            valueInput.element.classList.add('setting-list-valueInput');
            this.listDisposables.add((0, styler_1.attachInputBoxStyler)(valueInput, this.themeService, {
                inputBackground: exports.settingsSelectBackground,
                inputForeground: exports.settingsTextInputForeground,
                inputBorder: exports.settingsTextInputBorder
            }));
            this.listDisposables.add(valueInput);
            valueInput.value = item.value;
            this.listDisposables.add(DOM.addStandardDisposableListener(valueInput.inputElement, DOM.EventType.KEY_DOWN, onKeyDown));
            let siblingInput;
            if (!(0, types_1.isUndefinedOrNull)(item.sibling)) {
                siblingInput = new inputBox_1.InputBox(rowElement, this.contextViewService, {
                    placeholder: this.getLocalizedStrings().siblingInputPlaceholder
                });
                siblingInput.element.classList.add('setting-list-siblingInput');
                this.listDisposables.add(siblingInput);
                this.listDisposables.add((0, styler_1.attachInputBoxStyler)(siblingInput, this.themeService, {
                    inputBackground: exports.settingsSelectBackground,
                    inputForeground: exports.settingsTextInputForeground,
                    inputBorder: exports.settingsTextInputBorder
                }));
                siblingInput.value = item.sibling;
                this.listDisposables.add(DOM.addStandardDisposableListener(siblingInput.inputElement, DOM.EventType.KEY_DOWN, onKeyDown));
            }
            const okButton = this._register(new button_1.Button(rowElement));
            okButton.label = (0, nls_1.localize)(18, null);
            okButton.element.classList.add('setting-list-ok-button');
            this.listDisposables.add((0, styler_1.attachButtonStyler)(okButton, this.themeService));
            this.listDisposables.add(okButton.onDidClick(() => this.handleItemChange(item, updatedItem(), idx)));
            const cancelButton = this._register(new button_1.Button(rowElement));
            cancelButton.label = (0, nls_1.localize)(19, null);
            cancelButton.element.classList.add('setting-list-cancel-button');
            this.listDisposables.add((0, styler_1.attachButtonStyler)(cancelButton, this.themeService));
            this.listDisposables.add(cancelButton.onDidClick(() => this.cancelEdit()));
            this.listDisposables.add((0, async_1.disposableTimeout)(() => {
                valueInput.focus();
                valueInput.select();
            }));
            return rowElement;
        }
        isItemNew(item) {
            return item.value === '';
        }
        getLocalizedRowTitle({ value, sibling }) {
            return (0, types_1.isUndefinedOrNull)(sibling)
                ? (0, nls_1.localize)(20, null, value)
                : (0, nls_1.localize)(21, null, value, sibling);
        }
        getLocalizedStrings() {
            return {
                deleteActionTooltip: (0, nls_1.localize)(22, null),
                editActionTooltip: (0, nls_1.localize)(23, null),
                addButtonLabel: (0, nls_1.localize)(24, null),
                inputPlaceholder: (0, nls_1.localize)(25, null),
                siblingInputPlaceholder: (0, nls_1.localize)(26, null),
            };
        }
    }
    exports.ListSettingWidget = ListSettingWidget;
    class ExcludeSettingWidget extends ListSettingWidget {
        getContainerClasses() {
            return ['setting-list-exclude-widget'];
        }
        getLocalizedRowTitle({ value, sibling }) {
            return (0, types_1.isUndefinedOrNull)(sibling)
                ? (0, nls_1.localize)(27, null, value)
                : (0, nls_1.localize)(28, null, value, sibling);
        }
        getLocalizedStrings() {
            return {
                deleteActionTooltip: (0, nls_1.localize)(29, null),
                editActionTooltip: (0, nls_1.localize)(30, null),
                addButtonLabel: (0, nls_1.localize)(31, null),
                inputPlaceholder: (0, nls_1.localize)(32, null),
                siblingInputPlaceholder: (0, nls_1.localize)(33, null),
            };
        }
    }
    exports.ExcludeSettingWidget = ExcludeSettingWidget;
    class ObjectSettingWidget extends AbstractListSettingWidget {
        constructor() {
            super(...arguments);
            this.currentSettingKey = '';
            this.showAddButton = true;
            this.keySuggester = () => undefined;
            this.valueSuggester = () => undefined;
        }
        setValue(listData, options) {
            var _a, _b, _c;
            this.showAddButton = (_a = options === null || options === void 0 ? void 0 : options.showAddButton) !== null && _a !== void 0 ? _a : this.showAddButton;
            this.keySuggester = (_b = options === null || options === void 0 ? void 0 : options.keySuggester) !== null && _b !== void 0 ? _b : this.keySuggester;
            this.valueSuggester = (_c = options === null || options === void 0 ? void 0 : options.valueSuggester) !== null && _c !== void 0 ? _c : this.valueSuggester;
            if ((0, types_1.isDefined)(options) && options.settingKey !== this.currentSettingKey) {
                this.model.setEditKey('none');
                this.model.select(null);
                this.currentSettingKey = options.settingKey;
            }
            super.setValue(listData);
        }
        isItemNew(item) {
            return item.key.data === '' && item.value.data === '';
        }
        isAddButtonVisible() {
            return this.showAddButton;
        }
        getEmptyItem() {
            return {
                key: { type: 'string', data: '' },
                value: { type: 'string', data: '' },
                removable: true,
            };
        }
        getContainerClasses() {
            return ['setting-list-object-widget'];
        }
        getActionsForItem(item, idx) {
            const actions = [
                {
                    class: themeService_1.ThemeIcon.asClassName(preferencesIcons_1.settingsEditIcon),
                    enabled: true,
                    id: 'workbench.action.editListItem',
                    tooltip: this.getLocalizedStrings().editActionTooltip,
                    run: () => this.editSetting(idx)
                },
            ];
            if (item.removable) {
                actions.push({
                    class: themeService_1.ThemeIcon.asClassName(preferencesIcons_1.settingsRemoveIcon),
                    enabled: true,
                    id: 'workbench.action.removeListItem',
                    tooltip: this.getLocalizedStrings().deleteActionTooltip,
                    run: () => this._onDidChangeList.fire({ originalItem: item, item: undefined, targetIndex: idx })
                });
            }
            else {
                actions.push({
                    class: themeService_1.ThemeIcon.asClassName(preferencesIcons_1.settingsDiscardIcon),
                    enabled: true,
                    id: 'workbench.action.resetListItem',
                    tooltip: this.getLocalizedStrings().resetActionTooltip,
                    run: () => this._onDidChangeList.fire({ originalItem: item, item: undefined, targetIndex: idx })
                });
            }
            return actions;
        }
        renderHeader() {
            const header = $('.setting-list-row-header');
            const keyHeader = DOM.append(header, $('.setting-list-object-key'));
            const valueHeader = DOM.append(header, $('.setting-list-object-value'));
            const { keyHeaderText, valueHeaderText } = this.getLocalizedStrings();
            keyHeader.textContent = keyHeaderText;
            valueHeader.textContent = valueHeaderText;
            return header;
        }
        renderItem(item) {
            const rowElement = $('.setting-list-row');
            rowElement.classList.add('setting-list-object-row');
            const keyElement = DOM.append(rowElement, $('.setting-list-object-key'));
            const valueElement = DOM.append(rowElement, $('.setting-list-object-value'));
            keyElement.textContent = item.key.data;
            valueElement.textContent = item.value.data.toString();
            return rowElement;
        }
        renderEdit(item, idx) {
            const rowElement = $('.setting-list-edit-row.setting-list-object-row');
            const changedItem = Object.assign({}, item);
            const onKeyChange = (key) => {
                var _a;
                changedItem.key = key;
                okButton.enabled = key.data !== '';
                const suggestedValue = (_a = this.valueSuggester(key.data)) !== null && _a !== void 0 ? _a : item.value;
                if (this.shouldUseSuggestion(item.value, changedItem.value, suggestedValue)) {
                    onValueChange(suggestedValue);
                    renderLatestValue();
                }
            };
            const onValueChange = (value) => {
                changedItem.value = value;
            };
            let keyWidget;
            let keyElement;
            if (this.showAddButton) {
                if (this.isItemNew(item)) {
                    const suggestedKey = this.keySuggester(this.model.items.map(({ key: { data } }) => data));
                    if ((0, types_1.isDefined)(suggestedKey)) {
                        changedItem.key = suggestedKey;
                        const suggestedValue = this.valueSuggester(changedItem.key.data);
                        onValueChange(suggestedValue !== null && suggestedValue !== void 0 ? suggestedValue : changedItem.value);
                    }
                }
                const { widget, element } = this.renderEditWidget(changedItem.key, {
                    idx,
                    isKey: true,
                    originalItem: item,
                    changedItem,
                    update: onKeyChange,
                });
                keyWidget = widget;
                keyElement = element;
            }
            else {
                keyElement = $('.setting-list-object-key');
                keyElement.textContent = item.key.data;
            }
            let valueWidget;
            const valueContainer = $('.setting-list-object-value-container');
            const renderLatestValue = () => {
                const { widget, element } = this.renderEditWidget(changedItem.value, {
                    idx,
                    isKey: false,
                    originalItem: item,
                    changedItem,
                    update: onValueChange,
                });
                valueWidget = widget;
                DOM.clearNode(valueContainer);
                valueContainer.append(element);
            };
            renderLatestValue();
            rowElement.append(keyElement, valueContainer);
            const okButton = this._register(new button_1.Button(rowElement));
            okButton.enabled = changedItem.key.data !== '';
            okButton.label = (0, nls_1.localize)(34, null);
            okButton.element.classList.add('setting-list-ok-button');
            this.listDisposables.add((0, styler_1.attachButtonStyler)(okButton, this.themeService));
            this.listDisposables.add(okButton.onDidClick(() => this.handleItemChange(item, changedItem, idx)));
            const cancelButton = this._register(new button_1.Button(rowElement));
            cancelButton.label = (0, nls_1.localize)(35, null);
            cancelButton.element.classList.add('setting-list-cancel-button');
            this.listDisposables.add((0, styler_1.attachButtonStyler)(cancelButton, this.themeService));
            this.listDisposables.add(cancelButton.onDidClick(() => this.cancelEdit()));
            this.listDisposables.add((0, async_1.disposableTimeout)(() => {
                const widget = keyWidget !== null && keyWidget !== void 0 ? keyWidget : valueWidget;
                widget.focus();
                if (widget instanceof inputBox_1.InputBox) {
                    widget.select();
                }
            }));
            return rowElement;
        }
        renderEditWidget(keyOrValue, options) {
            switch (keyOrValue.type) {
                case 'string':
                    return this.renderStringEditWidget(keyOrValue, options);
                case 'enum':
                    return this.renderEnumEditWidget(keyOrValue, options);
                case 'boolean':
                    return this.renderEnumEditWidget({
                        type: 'enum',
                        data: keyOrValue.data.toString(),
                        options: [{ value: 'true' }, { value: 'false' }],
                    }, options);
            }
        }
        renderStringEditWidget(keyOrValue, { idx, isKey, originalItem, changedItem, update }) {
            const wrapper = $(isKey ? '.setting-list-object-input-key' : '.setting-list-object-input-value');
            const inputBox = new inputBox_1.InputBox(wrapper, this.contextViewService, {
                placeholder: isKey
                    ? (0, nls_1.localize)(36, null)
                    : (0, nls_1.localize)(37, null),
            });
            inputBox.element.classList.add('setting-list-object-input');
            this.listDisposables.add((0, styler_1.attachInputBoxStyler)(inputBox, this.themeService, {
                inputBackground: exports.settingsSelectBackground,
                inputForeground: exports.settingsTextInputForeground,
                inputBorder: exports.settingsTextInputBorder
            }));
            this.listDisposables.add(inputBox);
            inputBox.value = keyOrValue.data;
            this.listDisposables.add(inputBox.onDidChange(value => update(Object.assign(Object.assign({}, keyOrValue), { data: value }))));
            const onKeyDown = (e) => {
                if (e.equals(3 /* Enter */)) {
                    this.handleItemChange(originalItem, changedItem, idx);
                }
                else if (e.equals(9 /* Escape */)) {
                    this.cancelEdit();
                    e.preventDefault();
                }
            };
            this.listDisposables.add(DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, onKeyDown));
            return { widget: inputBox, element: wrapper };
        }
        renderEnumEditWidget(keyOrValue, { isKey, originalItem, update }) {
            const selectBoxOptions = keyOrValue.options.map(({ value, description }) => ({ text: value, description }));
            const selected = keyOrValue.options.findIndex(option => keyOrValue.data === option.value);
            const selectBox = new selectBox_1.SelectBox(selectBoxOptions, selected, this.contextViewService, undefined, {
                useCustomDrawn: !(platform_1.isIOS && canIUse_1.BrowserFeatures.pointerEvents)
            });
            this.listDisposables.add((0, styler_1.attachSelectBoxStyler)(selectBox, this.themeService, {
                selectBackground: exports.settingsSelectBackground,
                selectForeground: exports.settingsSelectForeground,
                selectBorder: exports.settingsSelectBorder,
                selectListBorder: exports.settingsSelectListBorder
            }));
            const originalKeyOrValue = isKey ? originalItem.key : originalItem.value;
            this.listDisposables.add(selectBox.onDidSelect(({ selected }) => update(originalKeyOrValue.type === 'boolean'
                ? Object.assign(Object.assign({}, originalKeyOrValue), { data: selected === 'true' ? true : false }) : Object.assign(Object.assign({}, originalKeyOrValue), { data: selected }))));
            const wrapper = $('.setting-list-object-input');
            wrapper.classList.add(isKey ? 'setting-list-object-input-key' : 'setting-list-object-input-value');
            selectBox.render(wrapper);
            return { widget: selectBox, element: wrapper };
        }
        shouldUseSuggestion(originalValue, previousValue, newValue) {
            // suggestion is exactly the same
            if (newValue.type !== 'enum' && newValue.type === previousValue.type && newValue.data === previousValue.data) {
                return false;
            }
            // item is new, use suggestion
            if (originalValue.data === '') {
                return true;
            }
            if (previousValue.type === newValue.type && newValue.type !== 'enum') {
                return false;
            }
            // check if all enum options are the same
            if (previousValue.type === 'enum' && newValue.type === 'enum') {
                const previousEnums = new Set(previousValue.options.map(({ value }) => value));
                newValue.options.forEach(({ value }) => previousEnums.delete(value));
                // all options are the same
                if (previousEnums.size === 0) {
                    return false;
                }
            }
            return true;
        }
        getLocalizedRowTitle(item) {
            var _a;
            let enumDescription = item.key.type === 'enum'
                ? (_a = item.key.options.find(({ value }) => item.key.data === value)) === null || _a === void 0 ? void 0 : _a.description
                : undefined;
            // avoid rendering double '.'
            if ((0, types_1.isDefined)(enumDescription) && enumDescription.endsWith('.')) {
                enumDescription = enumDescription.slice(0, enumDescription.length - 1);
            }
            return (0, types_1.isDefined)(enumDescription)
                ? `${enumDescription}. Currently set to ${item.value.data}.`
                : (0, nls_1.localize)(38, null, item.key.data, item.value.data);
        }
        getLocalizedStrings() {
            return {
                deleteActionTooltip: (0, nls_1.localize)(39, null),
                resetActionTooltip: (0, nls_1.localize)(40, null),
                editActionTooltip: (0, nls_1.localize)(41, null),
                addButtonLabel: (0, nls_1.localize)(42, null),
                keyHeaderText: (0, nls_1.localize)(43, null),
                valueHeaderText: (0, nls_1.localize)(44, null),
            };
        }
    }
    exports.ObjectSettingWidget = ObjectSettingWidget;
});
//# sourceMappingURL=settingsWidgets.js.map