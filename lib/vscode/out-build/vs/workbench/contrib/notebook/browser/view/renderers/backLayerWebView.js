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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/buffer", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/mime", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uuid", "vs/nls!vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/opener/common/opener", "vs/platform/telemetry/common/telemetry", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/view/renderers/webviewPreloads", "vs/workbench/contrib/notebook/browser/view/renderers/webviewThemeMapping", "vs/workbench/contrib/notebook/browser/viewModel/markdownCellViewModel", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/webview/browser/webview", "vs/workbench/contrib/webview/common/webviewUri", "vs/workbench/services/environment/common/environmentService"], function (require, exports, arrays_1, buffer_1, event_1, lifecycle_1, mime_1, network_1, platform_1, resources_1, UUID, nls, menuEntryActionViewItem_1, actions_1, contextkey_1, contextView_1, dialogs_1, files_1, opener_1, telemetry_1, workspace_1, notebookBrowser_1, webviewPreloads_1, webviewThemeMapping_1, markdownCellViewModel_1, notebookService_1, webview_1, webviewUri_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BackLayerWebView = void 0;
    function html(strings, ...values) {
        let str = '';
        strings.forEach((string, i) => {
            str += string + (values[i] || '');
        });
        return str;
    }
    let BackLayerWebView = class BackLayerWebView extends lifecycle_1.Disposable {
        constructor(notebookEditor, id, documentUri, options, webviewService, openerService, notebookService, contextService, environmentService, fileDialogService, fileService, contextMenuService, menuService, contextKeyService, telemetryService) {
            super();
            this.notebookEditor = notebookEditor;
            this.id = id;
            this.documentUri = documentUri;
            this.options = options;
            this.webviewService = webviewService;
            this.openerService = openerService;
            this.notebookService = notebookService;
            this.contextService = contextService;
            this.environmentService = environmentService;
            this.fileDialogService = fileDialogService;
            this.fileService = fileService;
            this.contextMenuService = contextMenuService;
            this.menuService = menuService;
            this.contextKeyService = contextKeyService;
            this.telemetryService = telemetryService;
            this.webview = undefined;
            this.insetMapping = new Map();
            this.markdownPreviewMapping = new Map();
            this.hiddenInsetMapping = new Set();
            this.reversedInsetMapping = new Map();
            this.localResourceRootsCache = undefined;
            this.rendererRootsCache = [];
            this.kernelRootsCache = [];
            this._onMessage = this._register(new event_1.Emitter());
            this._preloadsCache = new Set();
            this.onMessage = this._onMessage.event;
            this._disposed = false;
            this.element = document.createElement('div');
            this.element.style.height = '1400px';
            this.element.style.position = 'absolute';
        }
        generateContent(coreDependencies, baseUrl) {
            const markupRenderer = this.getMarkdownRenderer();
            const outputWidth = `calc(100% - ${this.options.leftMargin + this.options.rightMargin + this.options.runGutter}px)`;
            const outputMarginLeft = `${this.options.leftMargin + this.options.runGutter}px`;
            return html `
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<base href="${baseUrl}/"/>

				<!--
				Markdown previews are rendered using a shadow dom and are not effected by normal css.
				Insert this style node into all preview shadow doms for styling.
				-->
				<template id="preview-styles">
					<style>
						img {
							max-width: 100%;
							max-height: 100%;
						}

						a {
							text-decoration: none;
						}

						a:hover {
							text-decoration: underline;
						}

						a:focus,
						input:focus,
						select:focus,
						textarea:focus {
							outline: 1px solid -webkit-focus-ring-color;
							outline-offset: -1px;
						}

						hr {
							border: 0;
							height: 2px;
							border-bottom: 2px solid;
						}

						h1 {
							font-size: 26px;
							line-height: 31px;
							margin: 0;
							margin-bottom: 13px;
						}

						h2 {
							font-size: 19px;
							margin: 0;
							margin-bottom: 10px;
						}

						h1,
						h2,
						h3 {
							font-weight: normal;
						}

						div {
							width: 100%;
						}

						/* Adjust margin of first item in markdown cell */
						*:first-child {
							margin-top: 0px;
						}

						/* h1 tags don't need top margin */
						h1:first-child {
							margin-top: 0;
						}

						/* Removes bottom margin when only one item exists in markdown cell */
						*:only-child,
						*:last-child {
							margin-bottom: 0;
							padding-bottom: 0;
						}

						/* makes all markdown cells consistent */
						div {
							min-height: ${this.options.previewNodePadding * 2}px;
						}

						table {
							border-collapse: collapse;
							border-spacing: 0;
						}

						table th,
						table td {
							border: 1px solid;
						}

						table > thead > tr > th {
							text-align: left;
							border-bottom: 1px solid;
						}

						table > thead > tr > th,
						table > thead > tr > td,
						table > tbody > tr > th,
						table > tbody > tr > td {
							padding: 5px 10px;
						}

						table > tbody > tr + tr > td {
							border-top: 1px solid;
						}

						blockquote {
							margin: 0 7px 0 5px;
							padding: 0 16px 0 10px;
							border-left-width: 5px;
							border-left-style: solid;
						}

						code,
						.code {
							font-family: var(--monaco-monospace-font);
							font-size: 1em;
							line-height: 1.357em;
						}

						.code {
							white-space: pre-wrap;
						}

						.latex-block {
							display: block;
						}

						.latex {
							vertical-align: middle;
							display: inline-block;
						}

						.latex img,
						.latex-block img {
							filter: brightness(0) invert(0)
						}

						dragging {
							background-color: var(--vscode-editor-background);
						}
					</style>
				</template>
				<style>
					#container .cell_container {
						width: 100%;
					}

					#container .output_container {
						width: 100%;
					}

					#container > div > div > div.output {
						width: ${outputWidth};
						margin-left: ${outputMarginLeft};
						padding: ${this.options.outputNodePadding}px ${this.options.outputNodePadding}px ${this.options.outputNodePadding}px ${this.options.outputNodeLeftPadding}px;
						box-sizing: border-box;
						background-color: var(--vscode-notebook-outputContainerBackgroundColor);
					}

					/* markdown */
					#container > div.preview {
						width: 100%;
						padding-right: ${this.options.previewNodePadding}px;
						padding-left: ${this.options.leftMargin}px;
						padding-top: ${this.options.previewNodePadding}px;
						padding-bottom: ${this.options.previewNodePadding}px;

						box-sizing: border-box;
						white-space: nowrap;
						overflow: hidden;
						user-select: none;
						-webkit-user-select: none;
						-ms-user-select: none;
						white-space: initial;
						cursor: grab;

						color: var(--vscode-foreground);
					}

					#container > div.preview.emptyMarkdownCell::before {
						content: "${nls.localize(0, null)}";
						font-style: italic;
						opacity: 0.6;
					}

					#container > div.preview.selected {
						background: var(--vscode-notebook-selectedCellBackground);
					}

					#container > div.preview.dragging {
						background-color: var(--vscode-editor-background);
					}

					.monaco-workbench.vs-dark .notebookOverlay .cell.markdown .latex img,
					.monaco-workbench.vs-dark .notebookOverlay .cell.markdown .latex-block img {
						filter: brightness(0) invert(1)
					}

					#container > div.nb-symbolHighlight > div {
						background-color: var(--vscode-notebook-symbolHighlightBackground);
					}

					#container > div.nb-cellDeleted > div {
						background-color: var(--vscode-diffEditor-removedTextBackground);
					}

					#container > div.nb-cellAdded > div {
						background-color: var(--vscode-diffEditor-insertedTextBackground);
					}

					#container > div > div:not(.preview) > div {
						overflow-x: scroll;
					}

					body {
						padding: 0px;
						height: 100%;
						width: 100%;
					}

					table, thead, tr, th, td, tbody {
						border: none !important;
						border-color: transparent;
						border-spacing: 0;
						border-collapse: collapse;
					}

					table {
						width: 100%;
					}

					table, th, tr {
						text-align: left !important;
					}

					thead {
						font-weight: bold;
						background-color: rgba(130, 130, 130, 0.16);
					}

					th, td {
						padding: 4px 8px;
					}

					tr:nth-child(even) {
						background-color: rgba(130, 130, 130, 0.08);
					}

					tbody th {
						font-weight: normal;
					}

				</style>
			</head>
			<body style="overflow: hidden;">
				<script>
					self.require = {};
				</script>
				${coreDependencies}
				<div id='container' class="widgetarea" style="position: absolute;width:100%;top: 0px"></div>
				<script type="module">${(0, webviewPreloads_1.preloadsScriptStr)({
                outputNodePadding: this.options.outputNodePadding,
                outputNodeLeftPadding: this.options.outputNodeLeftPadding,
            }, {
                entrypoint: markupRenderer[0].entrypoint,
                dependencies: markupRenderer[0].dependencies,
            })}</script>
			</body>
		</html>`;
        }
        getMarkdownRenderer() {
            const allRenderers = this.notebookService.getMarkupRendererInfo();
            const topLevelMarkdownRenderers = allRenderers
                .filter(renderer => !renderer.dependsOn)
                .filter(renderer => { var _a; return (_a = renderer.mimeTypes) === null || _a === void 0 ? void 0 : _a.includes('text/markdown'); });
            const subRenderers = new Map();
            for (const renderer of allRenderers) {
                if (renderer.dependsOn) {
                    if (!subRenderers.has(renderer.dependsOn)) {
                        subRenderers.set(renderer.dependsOn, []);
                    }
                    const entryPoint = (0, webviewUri_1.asWebviewUri)(this.environmentService, this.id, renderer.entrypoint);
                    subRenderers.get(renderer.dependsOn).push({ entrypoint: entryPoint.toString(true) });
                }
            }
            return topLevelMarkdownRenderers.map((renderer) => {
                const src = (0, webviewUri_1.asWebviewUri)(this.environmentService, this.id, renderer.entrypoint);
                return {
                    entrypoint: src.toString(),
                    dependencies: subRenderers.get(renderer.id) || [],
                };
            });
        }
        postRendererMessage(rendererId, message) {
            this._sendMessageToWebview({
                __vscode_notebook_message: true,
                type: 'customRendererMessage',
                message,
                rendererId
            });
        }
        resolveOutputId(id) {
            const output = this.reversedInsetMapping.get(id);
            if (!output) {
                return;
            }
            const cellInfo = this.insetMapping.get(output).cellInfo;
            return { cellInfo, output };
        }
        isResolved() {
            return !!this.webview;
        }
        async createWebview() {
            let coreDependencies = '';
            let resolveFunc;
            this._initalized = new Promise((resolve, reject) => {
                resolveFunc = resolve;
            });
            const baseUrl = (0, webviewUri_1.asWebviewUri)(this.environmentService, this.id, (0, resources_1.dirname)(this.documentUri));
            if (!platform_1.isWeb) {
                const loaderUri = network_1.FileAccess.asFileUri('vs/loader.js', require);
                const loader = (0, webviewUri_1.asWebviewUri)(this.environmentService, this.id, loaderUri);
                coreDependencies = `<script src="${loader}"></script><script>
			var requirejs = (function() {
				return require;
			}());
			</script>`;
                const htmlContent = this.generateContent(coreDependencies, baseUrl.toString());
                this._initialize(htmlContent);
                resolveFunc();
            }
            else {
                const loaderUri = network_1.FileAccess.asBrowserUri('vs/loader.js', require);
                fetch(loaderUri.toString(true)).then(async (response) => {
                    if (response.status !== 200) {
                        throw new Error(response.statusText);
                    }
                    const loaderJs = await response.text();
                    coreDependencies = `
<script>
${loaderJs}
</script>
<script>
var requirejs = (function() {
	return require;
}());
</script>
`;
                    const htmlContent = this.generateContent(coreDependencies, baseUrl.toString());
                    this._initialize(htmlContent);
                    resolveFunc();
                }, error => {
                    // the fetch request is rejected
                    const htmlContent = this.generateContent(coreDependencies, baseUrl.toString());
                    this._initialize(htmlContent);
                    resolveFunc();
                });
            }
            await this._initalized;
        }
        async _initialize(content) {
            if (!document.body.contains(this.element)) {
                throw new Error('Element is already detached from the DOM tree');
            }
            this.webview = this._createInset(this.webviewService, content);
            this.webview.mountTo(this.element);
            this._register(this.webview);
            this._register(this.webview.onDidClickLink(link => {
                if (this._disposed) {
                    return;
                }
                if (!link) {
                    return;
                }
                if ((0, opener_1.matchesScheme)(link, network_1.Schemas.http) || (0, opener_1.matchesScheme)(link, network_1.Schemas.https) || (0, opener_1.matchesScheme)(link, network_1.Schemas.mailto)
                    || (0, opener_1.matchesScheme)(link, network_1.Schemas.command)) {
                    this.openerService.open(link, { fromUserGesture: true, allowContributedOpeners: true, allowCommands: true });
                }
            }));
            this._register(this.webview.onDidReload(() => {
                if (this._disposed) {
                    return;
                }
                let renderers = new Set();
                for (const inset of this.insetMapping.values()) {
                    if (inset.renderer) {
                        renderers.add(inset.renderer);
                    }
                }
                this._preloadsCache.clear();
                this.updateRendererPreloads(renderers);
                for (const [output, inset] of this.insetMapping.entries()) {
                    this._sendMessageToWebview(Object.assign(Object.assign({}, inset.cachedCreation), { initiallyHidden: this.hiddenInsetMapping.has(output) }));
                }
            }));
            this._register(this.webview.onMessage((message) => {
                const data = message.message;
                if (this._disposed) {
                    return;
                }
                if (!data.__vscode_notebook_message) {
                    this._onMessage.fire({ message: data });
                    return;
                }
                switch (data.type) {
                    case 'dimension':
                        {
                            for (const update of data.updates) {
                                const height = update.height;
                                if (update.isOutput) {
                                    const resolvedResult = this.resolveOutputId(update.id);
                                    if (resolvedResult) {
                                        const { cellInfo, output } = resolvedResult;
                                        this.notebookEditor.updateOutputHeight(cellInfo, output, height, !!update.init, 'webview#dimension');
                                        this.notebookEditor.scheduleOutputHeightAck(cellInfo, update.id, height);
                                    }
                                }
                                else {
                                    this.notebookEditor.updateMarkdownCellHeight(update.id, height, !!update.init);
                                }
                            }
                            break;
                        }
                    case 'mouseenter':
                        {
                            const resolvedResult = this.resolveOutputId(data.id);
                            if (resolvedResult) {
                                const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                                if (latestCell) {
                                    latestCell.outputIsHovered = true;
                                }
                            }
                            break;
                        }
                    case 'mouseleave':
                        {
                            const resolvedResult = this.resolveOutputId(data.id);
                            if (resolvedResult) {
                                const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                                if (latestCell) {
                                    latestCell.outputIsHovered = false;
                                }
                            }
                            break;
                        }
                    case 'outputFocus':
                        {
                            const resolvedResult = this.resolveOutputId(data.id);
                            if (resolvedResult) {
                                const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                                if (latestCell) {
                                    latestCell.outputIsFocused = true;
                                }
                            }
                            break;
                        }
                    case 'outputBlur':
                        {
                            const resolvedResult = this.resolveOutputId(data.id);
                            if (resolvedResult) {
                                const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                                if (latestCell) {
                                    latestCell.outputIsFocused = false;
                                }
                            }
                            break;
                        }
                    case 'scroll-ack':
                        {
                            // const date = new Date();
                            // const top = data.data.top;
                            // console.log('ack top ', top, ' version: ', data.version, ' - ', date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds());
                            break;
                        }
                    case 'did-scroll-wheel':
                        {
                            this.notebookEditor.triggerScroll(Object.assign(Object.assign({}, data.payload), { preventDefault: () => { }, stopPropagation: () => { } }));
                            break;
                        }
                    case 'focus-editor':
                        {
                            const resolvedResult = this.resolveOutputId(data.id);
                            if (resolvedResult) {
                                const latestCell = this.notebookEditor.getCellByInfo(resolvedResult.cellInfo);
                                if (!latestCell) {
                                    return;
                                }
                                if (data.focusNext) {
                                    this.notebookEditor.focusNextNotebookCell(latestCell, 'editor');
                                }
                                else {
                                    this.notebookEditor.focusNotebookCell(latestCell, 'editor');
                                }
                            }
                            break;
                        }
                    case 'clicked-data-url':
                        {
                            this._onDidClickDataLink(data);
                            break;
                        }
                    case 'customRendererMessage':
                        {
                            this._onMessage.fire({ message: data.message, forRenderer: data.rendererId });
                            break;
                        }
                    case 'clickMarkdownPreview':
                        {
                            const cell = this.notebookEditor.getCellById(data.cellId);
                            if (cell) {
                                if (data.shiftKey || (platform_1.isMacintosh ? data.metaKey : data.ctrlKey)) {
                                    // Add to selection
                                    this.notebookEditor.toggleNotebookCellSelection(cell);
                                }
                                else {
                                    // Normal click
                                    this.notebookEditor.focusNotebookCell(cell, 'container', { skipReveal: true });
                                }
                            }
                            break;
                        }
                    case 'contextMenuMarkdownPreview':
                        {
                            const cell = this.notebookEditor.getCellById(data.cellId);
                            if (cell) {
                                // Focus the cell first
                                this.notebookEditor.focusNotebookCell(cell, 'container', { skipReveal: true });
                                // Then show the context menu
                                const webviewRect = this.element.getBoundingClientRect();
                                this.contextMenuService.showContextMenu({
                                    getActions: () => {
                                        const result = [];
                                        const menu = this.menuService.createMenu(actions_1.MenuId.NotebookCellTitle, this.contextKeyService);
                                        (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, undefined, result);
                                        menu.dispose();
                                        return result;
                                    },
                                    getAnchor: () => ({
                                        x: webviewRect.x + data.clientX,
                                        y: webviewRect.y + data.clientY
                                    })
                                });
                            }
                            break;
                        }
                    case 'toggleMarkdownPreview':
                        {
                            const cell = this.notebookEditor.getCellById(data.cellId);
                            if (cell) {
                                this.notebookEditor.setMarkdownCellEditState(data.cellId, notebookBrowser_1.CellEditState.Editing);
                                this.notebookEditor.focusNotebookCell(cell, 'editor', { skipReveal: true });
                            }
                            break;
                        }
                    case 'mouseEnterMarkdownPreview':
                        {
                            const cell = this.notebookEditor.getCellById(data.cellId);
                            if (cell instanceof markdownCellViewModel_1.MarkdownCellViewModel) {
                                cell.cellIsHovered = true;
                            }
                            break;
                        }
                    case 'mouseLeaveMarkdownPreview':
                        {
                            const cell = this.notebookEditor.getCellById(data.cellId);
                            if (cell instanceof markdownCellViewModel_1.MarkdownCellViewModel) {
                                cell.cellIsHovered = false;
                            }
                            break;
                        }
                    case 'cell-drag-start':
                        {
                            this.notebookEditor.markdownCellDragStart(data.cellId, data.position);
                            break;
                        }
                    case 'cell-drag':
                        {
                            this.notebookEditor.markdownCellDrag(data.cellId, data.position);
                            break;
                        }
                    case 'cell-drop':
                        {
                            this.notebookEditor.markdownCellDrop(data.cellId, {
                                clientY: data.position.clientY,
                                ctrlKey: data.ctrlKey,
                                altKey: data.altKey,
                            });
                            break;
                        }
                    case 'cell-drag-end':
                        {
                            this.notebookEditor.markdownCellDragEnd(data.cellId);
                            break;
                        }
                    case 'telemetryFoundRenderedMarkdownMath':
                        {
                            this.telemetryService.publicLog2('notebook/markdown/renderedLatex', {});
                            break;
                        }
                    case 'telemetryFoundUnrenderedMarkdownMath':
                        {
                            this.telemetryService.publicLog2('notebook/markdown/foundUnrenderedLatex', {
                                latexDirective: data.latexDirective
                            });
                            break;
                        }
                }
            }));
        }
        async _onDidClickDataLink(event) {
            if (typeof event.data !== 'string') {
                return;
            }
            const [splitStart, splitData] = event.data.split(';base64,');
            if (!splitData || !splitStart) {
                return;
            }
            const defaultDir = (0, resources_1.dirname)(this.documentUri);
            let defaultName;
            if (event.downloadName) {
                defaultName = event.downloadName;
            }
            else {
                const mimeType = splitStart.replace(/^data:/, '');
                const candidateExtension = mimeType && (0, mime_1.getExtensionForMimeType)(mimeType);
                defaultName = candidateExtension ? `download${candidateExtension}` : 'download';
            }
            const defaultUri = (0, resources_1.joinPath)(defaultDir, defaultName);
            const newFileUri = await this.fileDialogService.showSaveDialog({
                defaultUri
            });
            if (!newFileUri) {
                return;
            }
            const decoded = atob(splitData);
            const typedArray = new Uint8Array(decoded.length);
            for (let i = 0; i < decoded.length; i++) {
                typedArray[i] = decoded.charCodeAt(i);
            }
            const buff = buffer_1.VSBuffer.wrap(typedArray);
            await this.fileService.writeFile(newFileUri, buff);
            await this.openerService.open(newFileUri);
        }
        _createInset(webviewService, content) {
            const rootPath = platform_1.isWeb ? network_1.FileAccess.asBrowserUri('', require) : network_1.FileAccess.asFileUri('', require);
            const workspaceFolders = this.contextService.getWorkspace().folders.map(x => x.uri);
            this.localResourceRootsCache = [
                ...this.notebookService.getNotebookProviderResourceRoots(),
                ...this.notebookService.getMarkupRendererInfo().map(x => (0, resources_1.dirname)(x.entrypoint)),
                ...workspaceFolders,
                rootPath,
            ];
            const webview = webviewService.createWebviewElement(this.id, {
                purpose: "notebookRenderer" /* NotebookRenderer */,
                enableFindWidget: false,
                transformCssVariables: webviewThemeMapping_1.transformWebviewThemeVars,
                serviceWorkerFetchIgnoreSubdomain: true
            }, {
                allowMultipleAPIAcquire: true,
                allowScripts: true,
                localResourceRoots: this.localResourceRootsCache,
                useRootAuthority: true
            }, undefined);
            let resolveFunc;
            this._loaded = new Promise((resolve, reject) => {
                resolveFunc = resolve;
            });
            const dispose = webview.onMessage((message) => {
                const data = message.message;
                if (data.__vscode_notebook_message && data.type === 'initialized') {
                    resolveFunc();
                    dispose.dispose();
                }
            });
            webview.html = content;
            return webview;
        }
        shouldUpdateInset(cell, output, cellTop, outputOffset) {
            var _a;
            if (this._disposed) {
                return false;
            }
            if ((_a = cell.metadata) === null || _a === void 0 ? void 0 : _a.outputCollapsed) {
                return false;
            }
            if (this.hiddenInsetMapping.has(output)) {
                return true;
            }
            const outputCache = this.insetMapping.get(output);
            if (!outputCache) {
                return false;
            }
            if (outputOffset === outputCache.cachedCreation.outputOffset && cellTop === outputCache.cachedCreation.cellTop) {
                return false;
            }
            return true;
        }
        ackHeight(cellId, id, height) {
            this._sendMessageToWebview({
                type: 'ack-dimension',
                cellId: cellId,
                outputId: id,
                height: height
            });
        }
        updateScrollTops(outputRequests, markdownPreviews) {
            if (this._disposed) {
                return;
            }
            const widgets = (0, arrays_1.coalesce)(outputRequests.map((request) => {
                const outputCache = this.insetMapping.get(request.output);
                if (!outputCache) {
                    return;
                }
                if (!request.forceDisplay && !this.shouldUpdateInset(request.cell, request.output, request.cellTop, request.outputOffset)) {
                    return;
                }
                const id = outputCache.outputId;
                outputCache.cachedCreation.cellTop = request.cellTop;
                outputCache.cachedCreation.outputOffset = request.outputOffset;
                this.hiddenInsetMapping.delete(request.output);
                return {
                    outputId: id,
                    cellTop: request.cellTop,
                    outputOffset: request.outputOffset,
                    forceDisplay: request.forceDisplay,
                };
            }));
            if (!widgets.length && !markdownPreviews.length) {
                return;
            }
            this._sendMessageToWebview({
                type: 'view-scroll',
                widgets: widgets,
                markdownPreviews,
            });
        }
        async createMarkdownPreview(cellId, cellHandle, content, cellTop, contentHash) {
            if (this._disposed) {
                return;
            }
            if (this.markdownPreviewMapping.has(cellId)) {
                console.error('Trying to create markdown preview that already exists');
                return;
            }
            const initialTop = cellTop;
            this.markdownPreviewMapping.set(cellId, { contentHash, visible: true });
            this._sendMessageToWebview({
                type: 'createMarkdownPreview',
                id: cellId,
                handle: cellHandle,
                content: content,
                top: initialTop,
            });
        }
        async showMarkdownPreview(cellId, cellHandle, content, cellTop, contentHash) {
            if (this._disposed) {
                return;
            }
            if (!this.markdownPreviewMapping.has(cellId)) {
                return this.createMarkdownPreview(cellId, cellHandle, content, cellTop, contentHash);
            }
            const entry = this.markdownPreviewMapping.get(cellId);
            if (!entry) {
                console.error('Try to show a preview that does not exist');
                return;
            }
            if (entry.contentHash !== contentHash || !entry.visible) {
                this._sendMessageToWebview({
                    type: 'showMarkdownPreview',
                    id: cellId,
                    handle: cellHandle,
                    // If the content has not changed, we still want to make sure the
                    // preview is visible but don't need to send anything over
                    content: entry.contentHash === contentHash ? undefined : content,
                    top: cellTop
                });
            }
            entry.contentHash = contentHash;
            entry.visible = true;
        }
        async hideMarkdownPreviews(cellIds) {
            if (this._disposed) {
                return;
            }
            const cellsToHide = [];
            for (const cellId of cellIds) {
                const entry = this.markdownPreviewMapping.get(cellId);
                if (entry) {
                    if (entry.visible) {
                        cellsToHide.push(cellId);
                        entry.visible = false;
                    }
                }
            }
            if (cellsToHide.length) {
                this._sendMessageToWebview({
                    type: 'hideMarkdownPreviews',
                    ids: cellsToHide
                });
            }
        }
        async unhideMarkdownPreviews(cellIds) {
            if (this._disposed) {
                return;
            }
            const toUnhide = [];
            for (const cellId of cellIds) {
                const entry = this.markdownPreviewMapping.get(cellId);
                if (entry) {
                    if (!entry.visible) {
                        entry.visible = true;
                        toUnhide.push(cellId);
                    }
                }
                else {
                    console.error(`Trying to unhide a preview that does not exist: ${cellId}`);
                }
            }
            this._sendMessageToWebview({
                type: 'unhideMarkdownPreviews',
                ids: toUnhide,
            });
        }
        async deleteMarkdownPreviews(cellIds) {
            if (this._disposed) {
                return;
            }
            for (const id of cellIds) {
                if (!this.markdownPreviewMapping.has(id)) {
                    console.error(`Trying to delete a preview that does not exist: ${id}`);
                }
                this.markdownPreviewMapping.delete(id);
            }
            if (cellIds.length) {
                this._sendMessageToWebview({
                    type: 'deleteMarkdownPreview',
                    ids: cellIds
                });
            }
        }
        async updateMarkdownPreviewSelections(selectedCellsIds) {
            if (this._disposed) {
                return;
            }
            this._sendMessageToWebview({
                type: 'updateSelectedMarkdownPreviews',
                selectedCellIds: selectedCellsIds.filter(id => this.markdownPreviewMapping.has(id)),
            });
        }
        async initializeMarkdown(cells) {
            await this._loaded;
            if (this._disposed) {
                return;
            }
            // TODO: use proper handler
            const p = new Promise(resolve => {
                var _a;
                (_a = this.webview) === null || _a === void 0 ? void 0 : _a.onMessage(e => {
                    if (e.message.type === 'initializedMarkdownPreview') {
                        resolve();
                    }
                });
            });
            for (const cell of cells) {
                this.markdownPreviewMapping.set(cell.cellId, { contentHash: 0, visible: false });
            }
            this._sendMessageToWebview({
                type: 'initializeMarkdownPreview',
                cells: cells,
            });
            await p;
        }
        async createOutput(cellInfo, content, cellTop, offset) {
            if (this._disposed) {
                return;
            }
            if (this.insetMapping.has(content.source)) {
                const outputCache = this.insetMapping.get(content.source);
                if (outputCache) {
                    this.hiddenInsetMapping.delete(content.source);
                    this._sendMessageToWebview({
                        type: 'showOutput',
                        cellId: outputCache.cellInfo.cellId,
                        outputId: outputCache.outputId,
                        cellTop: cellTop,
                        outputOffset: offset
                    });
                    return;
                }
            }
            const messageBase = {
                type: 'html',
                cellId: cellInfo.cellId,
                cellTop: cellTop,
                outputOffset: offset,
                left: 0,
                requiredPreloads: [],
            };
            let message;
            let renderer;
            if (content.type === 2 /* Extension */) {
                const output = content.source.model;
                renderer = content.renderer;
                const outputDto = output.outputs.find(op => op.mime === content.mimeType);
                message = Object.assign(Object.assign({}, messageBase), { outputId: output.outputId, apiNamespace: content.renderer.id, requiredPreloads: await this.updateRendererPreloads([content.renderer]), content: {
                        type: 2 /* Extension */,
                        outputId: output.outputId,
                        mimeType: content.mimeType,
                        value: outputDto === null || outputDto === void 0 ? void 0 : outputDto.value,
                        metadata: outputDto === null || outputDto === void 0 ? void 0 : outputDto.metadata,
                    } });
            }
            else {
                message = Object.assign(Object.assign({}, messageBase), { outputId: UUID.generateUuid(), content: {
                        type: content.type,
                        htmlContent: content.htmlContent,
                    } });
            }
            this._sendMessageToWebview(message);
            this.insetMapping.set(content.source, { outputId: message.outputId, cellInfo: cellInfo, renderer, cachedCreation: message });
            this.hiddenInsetMapping.delete(content.source);
            this.reversedInsetMapping.set(message.outputId, content.source);
        }
        removeInsets(outputs) {
            if (this._disposed) {
                return;
            }
            for (const output of outputs) {
                const outputCache = this.insetMapping.get(output);
                if (!outputCache) {
                    continue;
                }
                const id = outputCache.outputId;
                this._sendMessageToWebview({
                    type: 'clearOutput',
                    apiNamespace: outputCache.cachedCreation.apiNamespace,
                    cellUri: outputCache.cellInfo.cellUri.toString(),
                    outputId: id,
                    cellId: outputCache.cellInfo.cellId
                });
                this.insetMapping.delete(output);
                this.reversedInsetMapping.delete(id);
            }
        }
        hideInset(output) {
            if (this._disposed) {
                return;
            }
            const outputCache = this.insetMapping.get(output);
            if (!outputCache) {
                return;
            }
            this.hiddenInsetMapping.add(output);
            this._sendMessageToWebview({
                type: 'hideOutput',
                outputId: outputCache.outputId,
                cellId: outputCache.cellInfo.cellId,
            });
        }
        clearInsets() {
            if (this._disposed) {
                return;
            }
            this._sendMessageToWebview({
                type: 'clear'
            });
            this.insetMapping = new Map();
            this.reversedInsetMapping = new Map();
        }
        focusWebview() {
            var _a;
            if (this._disposed) {
                return;
            }
            (_a = this.webview) === null || _a === void 0 ? void 0 : _a.focus();
        }
        focusOutput(cellId) {
            var _a;
            if (this._disposed) {
                return;
            }
            (_a = this.webview) === null || _a === void 0 ? void 0 : _a.focus();
            setTimeout(() => {
                this._sendMessageToWebview({
                    type: 'focus-output',
                    cellId,
                });
            }, 50);
        }
        deltaCellOutputContainerClassNames(cellId, added, removed) {
            this._sendMessageToWebview({
                type: 'decorations',
                cellId,
                addedClassNames: added,
                removedClassNames: removed
            });
        }
        async updateKernelPreloads(extensionLocations, preloads) {
            if (this._disposed) {
                return;
            }
            await this._loaded;
            const resources = [];
            for (const preload of preloads) {
                const uri = this.environmentService.isExtensionDevelopment && (preload.scheme === 'http' || preload.scheme === 'https')
                    ? preload : (0, webviewUri_1.asWebviewUri)(this.environmentService, this.id, preload);
                if (!this._preloadsCache.has(uri.toString())) {
                    resources.push({ uri: uri.toString(), originalUri: preload.toString() });
                    this._preloadsCache.add(uri.toString());
                }
            }
            if (!resources.length) {
                return;
            }
            this.kernelRootsCache = [...extensionLocations, ...this.kernelRootsCache];
            this._updatePreloads(resources, 'kernel');
        }
        async updateRendererPreloads(renderers) {
            if (this._disposed) {
                return [];
            }
            await this._loaded;
            const requiredPreloads = [];
            const resources = [];
            const extensionLocations = [];
            for (const rendererInfo of renderers) {
                extensionLocations.push(rendererInfo.extensionLocation);
                for (const preload of [rendererInfo.entrypoint, ...rendererInfo.preloads]) {
                    const uri = (0, webviewUri_1.asWebviewUri)(this.environmentService, this.id, preload);
                    const resource = { uri: uri.toString(), originalUri: preload.toString() };
                    requiredPreloads.push(resource);
                    if (!this._preloadsCache.has(uri.toString())) {
                        resources.push(resource);
                        this._preloadsCache.add(uri.toString());
                    }
                }
            }
            if (!resources.length) {
                return requiredPreloads;
            }
            this.rendererRootsCache = extensionLocations;
            this._updatePreloads(resources, 'renderer');
            return requiredPreloads;
        }
        _updatePreloads(resources, source) {
            if (!this.webview) {
                return;
            }
            const mixedResourceRoots = [...(this.localResourceRootsCache || []), ...this.rendererRootsCache, ...this.kernelRootsCache];
            this.webview.localResourcesRoot = mixedResourceRoots;
            this._sendMessageToWebview({
                type: 'preload',
                resources: resources,
                source: source
            });
        }
        _sendMessageToWebview(message) {
            var _a;
            if (this._disposed) {
                return;
            }
            (_a = this.webview) === null || _a === void 0 ? void 0 : _a.postMessage(message);
        }
        clearPreloadsCache() {
            this._preloadsCache.clear();
        }
        dispose() {
            var _a;
            this._disposed = true;
            (_a = this.webview) === null || _a === void 0 ? void 0 : _a.dispose();
            super.dispose();
        }
    };
    BackLayerWebView = __decorate([
        __param(4, webview_1.IWebviewService),
        __param(5, opener_1.IOpenerService),
        __param(6, notebookService_1.INotebookService),
        __param(7, workspace_1.IWorkspaceContextService),
        __param(8, environmentService_1.IWorkbenchEnvironmentService),
        __param(9, dialogs_1.IFileDialogService),
        __param(10, files_1.IFileService),
        __param(11, contextView_1.IContextMenuService),
        __param(12, actions_1.IMenuService),
        __param(13, contextkey_1.IContextKeyService),
        __param(14, telemetry_1.ITelemetryService)
    ], BackLayerWebView);
    exports.BackLayerWebView = BackLayerWebView;
});
//# sourceMappingURL=backLayerWebView.js.map