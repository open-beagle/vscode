/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/list/listWidget", "vs/base/browser/dom", "vs/base/browser/ui/splitview/splitview", "vs/base/common/event", "vs/css!./table"], function (require, exports, listWidget_1, dom_1, splitview_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Table = void 0;
    class TableListRenderer {
        constructor(columns, renderers, getColumnSize) {
            this.columns = columns;
            this.getColumnSize = getColumnSize;
            this.templateId = TableListRenderer.TemplateId;
            this.renderedTemplates = new Set();
            const rendererMap = new Map(renderers.map(r => [r.templateId, r]));
            this.renderers = [];
            for (const column of columns) {
                const renderer = rendererMap.get(column.templateId);
                if (!renderer) {
                    throw new Error(`Table cell renderer for template id ${column.templateId} not found.`);
                }
                this.renderers.push(renderer);
            }
        }
        renderTemplate(container) {
            const rowContainer = (0, dom_1.append)(container, (0, dom_1.$)('.monaco-table-tr'));
            const cellContainers = [];
            const cellTemplateData = [];
            for (let i = 0; i < this.columns.length; i++) {
                const renderer = this.renderers[i];
                const cellContainer = (0, dom_1.append)(rowContainer, (0, dom_1.$)('.monaco-table-td', { 'data-col-index': i }));
                cellContainer.style.width = `${this.getColumnSize(i)}px`;
                cellContainers.push(cellContainer);
                cellTemplateData.push(renderer.renderTemplate(cellContainer));
            }
            const result = { container, cellContainers, cellTemplateData };
            this.renderedTemplates.add(result);
            return result;
        }
        renderElement(element, index, templateData, height) {
            for (let i = 0; i < this.columns.length; i++) {
                const column = this.columns[i];
                const cell = column.project(element);
                const renderer = this.renderers[i];
                renderer.renderElement(cell, index, templateData.cellTemplateData[i], height);
            }
        }
        disposeElement(element, index, templateData, height) {
            for (let i = 0; i < this.columns.length; i++) {
                const renderer = this.renderers[i];
                if (renderer.disposeElement) {
                    const column = this.columns[i];
                    const cell = column.project(element);
                    renderer.disposeElement(cell, index, templateData.cellTemplateData[i], height);
                }
            }
        }
        disposeTemplate(templateData) {
            for (let i = 0; i < this.columns.length; i++) {
                const renderer = this.renderers[i];
                renderer.disposeTemplate(templateData.cellTemplateData[i]);
            }
            (0, dom_1.clearNode)(templateData.container);
            this.renderedTemplates.delete(templateData);
        }
        layoutColumn(index, size) {
            for (const { cellContainers } of this.renderedTemplates) {
                cellContainers[index].style.width = `${size}px`;
            }
        }
    }
    TableListRenderer.TemplateId = 'row';
    function asListVirtualDelegate(delegate) {
        return {
            getHeight(row) { return delegate.getHeight(row); },
            getTemplateId() { return TableListRenderer.TemplateId; },
        };
    }
    class ColumnHeader {
        constructor(column, index) {
            this.column = column;
            this.index = index;
            this._onDidLayout = new event_1.Emitter();
            this.onDidLayout = this._onDidLayout.event;
            this.element = (0, dom_1.$)('.monaco-table-th', { 'data-col-index': index, title: column.tooltip }, column.label);
        }
        get minimumSize() { var _a; return (_a = this.column.minimumWidth) !== null && _a !== void 0 ? _a : 120; }
        get maximumSize() { var _a; return (_a = this.column.maximumWidth) !== null && _a !== void 0 ? _a : Number.POSITIVE_INFINITY; }
        get onDidChange() { var _a; return (_a = this.column.onDidChangeWidthConstraints) !== null && _a !== void 0 ? _a : event_1.Event.None; }
        layout(size) {
            this._onDidLayout.fire([this.index, size]);
        }
    }
    class Table {
        constructor(user, container, virtualDelegate, columns, renderers, _options) {
            this.virtualDelegate = virtualDelegate;
            this.domId = `table_id_${++Table.InstanceCount}`;
            this.cachedHeight = 0;
            this.domNode = (0, dom_1.append)(container, (0, dom_1.$)(`.monaco-table.${this.domId}`));
            const headers = columns.map((c, i) => new ColumnHeader(c, i));
            const descriptor = {
                size: headers.reduce((a, b) => a + b.column.weight, 0),
                views: headers.map(view => ({ size: view.column.weight, view }))
            };
            this.splitview = new splitview_1.SplitView(this.domNode, {
                orientation: 1 /* HORIZONTAL */,
                scrollbarVisibility: 2 /* Hidden */,
                getSashOrthogonalSize: () => this.cachedHeight,
                descriptor
            });
            this.splitview.el.style.height = `${virtualDelegate.headerRowHeight}px`;
            this.splitview.el.style.lineHeight = `${virtualDelegate.headerRowHeight}px`;
            const renderer = new TableListRenderer(columns, renderers, i => this.splitview.getViewSize(i));
            this.list = new listWidget_1.List(user, this.domNode, asListVirtualDelegate(virtualDelegate), [renderer], _options);
            this.columnLayoutDisposable = event_1.Event.any(...headers.map(h => h.onDidLayout))(([index, size]) => renderer.layoutColumn(index, size));
            this.styleElement = (0, dom_1.createStyleSheet)(this.domNode);
            this.style({});
        }
        get onDidChangeFocus() { return this.list.onDidChangeFocus; }
        get onDidChangeSelection() { return this.list.onDidChangeSelection; }
        get onDidScroll() { return this.list.onDidScroll; }
        get onMouseClick() { return this.list.onMouseClick; }
        get onMouseDblClick() { return this.list.onMouseDblClick; }
        get onMouseMiddleClick() { return this.list.onMouseMiddleClick; }
        get onPointer() { return this.list.onPointer; }
        get onMouseUp() { return this.list.onMouseUp; }
        get onMouseDown() { return this.list.onMouseDown; }
        get onMouseOver() { return this.list.onMouseOver; }
        get onMouseMove() { return this.list.onMouseMove; }
        get onMouseOut() { return this.list.onMouseOut; }
        get onTouchStart() { return this.list.onTouchStart; }
        get onTap() { return this.list.onTap; }
        get onContextMenu() { return this.list.onContextMenu; }
        get onDidFocus() { return this.list.onDidFocus; }
        get onDidBlur() { return this.list.onDidBlur; }
        get scrollTop() { return this.list.scrollTop; }
        set scrollTop(scrollTop) { this.list.scrollTop = scrollTop; }
        get scrollLeft() { return this.list.scrollLeft; }
        set scrollLeft(scrollLeft) { this.list.scrollLeft = scrollLeft; }
        get scrollHeight() { return this.list.scrollHeight; }
        get renderHeight() { return this.list.renderHeight; }
        get onDidDispose() { return this.list.onDidDispose; }
        updateOptions(options) {
            this.list.updateOptions(options);
        }
        splice(start, deleteCount, elements = []) {
            this.list.splice(start, deleteCount, elements);
        }
        rerender() {
            this.list.rerender();
        }
        row(index) {
            return this.list.element(index);
        }
        indexOf(element) {
            return this.list.indexOf(element);
        }
        get length() {
            return this.list.length;
        }
        getHTMLElement() {
            return this.domNode;
        }
        layout(height, width) {
            height = height !== null && height !== void 0 ? height : (0, dom_1.getContentHeight)(this.domNode);
            width = width !== null && width !== void 0 ? width : (0, dom_1.getContentWidth)(this.domNode);
            this.cachedHeight = height;
            this.splitview.layout(width);
            const listHeight = height - this.virtualDelegate.headerRowHeight;
            this.list.getHTMLElement().style.height = `${listHeight}px`;
            this.list.layout(listHeight, width);
        }
        toggleKeyboardNavigation() {
            this.list.toggleKeyboardNavigation();
        }
        style(styles) {
            const content = [];
            content.push(`.monaco-table.${this.domId} > .monaco-split-view2 .monaco-sash.vertical::before {
			top: ${this.virtualDelegate.headerRowHeight + 1}px;
			height: calc(100% - ${this.virtualDelegate.headerRowHeight}px);
		}`);
            this.styleElement.textContent = content.join('\n');
            this.list.style(styles);
        }
        domFocus() {
            this.list.domFocus();
        }
        setAnchor(index) {
            this.list.setAnchor(index);
        }
        getAnchor() {
            return this.list.getAnchor();
        }
        getSelectedElements() {
            return this.list.getSelectedElements();
        }
        setSelection(indexes, browserEvent) {
            this.list.setSelection(indexes, browserEvent);
        }
        getSelection() {
            return this.list.getSelection();
        }
        setFocus(indexes, browserEvent) {
            this.list.setFocus(indexes, browserEvent);
        }
        focusNext(n = 1, loop = false, browserEvent) {
            this.list.focusNext(n, loop, browserEvent);
        }
        focusPrevious(n = 1, loop = false, browserEvent) {
            this.list.focusPrevious(n, loop, browserEvent);
        }
        focusNextPage(browserEvent) {
            return this.list.focusNextPage(browserEvent);
        }
        focusPreviousPage(browserEvent) {
            return this.list.focusPreviousPage(browserEvent);
        }
        focusFirst(browserEvent) {
            this.list.focusFirst(browserEvent);
        }
        focusLast(browserEvent) {
            this.list.focusLast(browserEvent);
        }
        getFocus() {
            return this.list.getFocus();
        }
        getFocusedElements() {
            return this.list.getFocusedElements();
        }
        reveal(index, relativeTop) {
            this.list.reveal(index, relativeTop);
        }
        dispose() {
            this.splitview.dispose();
            this.list.dispose();
            this.columnLayoutDisposable.dispose();
        }
    }
    exports.Table = Table;
    Table.InstanceCount = 0;
});
//# sourceMappingURL=tableWidget.js.map