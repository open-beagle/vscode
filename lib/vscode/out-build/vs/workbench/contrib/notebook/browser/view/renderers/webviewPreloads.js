/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.preloadsScriptStr = void 0;
    async function webviewPreloads(markdownRendererModule, markdownDeps) {
        var _a;
        const acquireVsCodeApi = globalThis.acquireVsCodeApi;
        const vscode = acquireVsCodeApi();
        delete globalThis.acquireVsCodeApi;
        const handleInnerClick = (event) => {
            if (!event || !event.view || !event.view.document) {
                return;
            }
            for (const node of event.composedPath()) {
                if (node instanceof HTMLAnchorElement && node.href) {
                    if (node.href.startsWith('blob:')) {
                        handleBlobUrlClick(node.href, node.download);
                    }
                    else if (node.href.startsWith('data:')) {
                        handleDataUrl(node.href, node.download);
                    }
                    event.preventDefault();
                    return;
                }
            }
        };
        const handleDataUrl = async (data, downloadName) => {
            postNotebookMessage('clicked-data-url', {
                data,
                downloadName
            });
        };
        const handleBlobUrlClick = async (url, downloadName) => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    handleDataUrl(reader.result, downloadName);
                });
                reader.readAsDataURL(blob);
            }
            catch (e) {
                console.error(e.message);
            }
        };
        document.body.addEventListener('click', handleInnerClick);
        const preservedScriptAttributes = [
            'type', 'src', 'nonce', 'noModule', 'async',
        ];
        // derived from https://github.com/jquery/jquery/blob/d0ce00cdfa680f1f0c38460bc51ea14079ae8b07/src/core/DOMEval.js
        const domEval = (container) => {
            var _a;
            const arr = Array.from(container.getElementsByTagName('script'));
            for (let n = 0; n < arr.length; n++) {
                const node = arr[n];
                const scriptTag = document.createElement('script');
                const trustedScript = (_a = ttPolicy === null || ttPolicy === void 0 ? void 0 : ttPolicy.createScript(node.innerText)) !== null && _a !== void 0 ? _a : node.innerText;
                scriptTag.text = trustedScript;
                for (const key of preservedScriptAttributes) {
                    const val = node[key] || node.getAttribute && node.getAttribute(key);
                    if (val) {
                        scriptTag.setAttribute(key, val);
                    }
                }
                // TODO@connor4312: should script with src not be removed?
                container.appendChild(scriptTag).parentNode.removeChild(scriptTag);
            }
        };
        const runScript = async (url, originalUri, globals = {}) => {
            let text;
            try {
                const res = await fetch(url);
                text = await res.text();
                if (!res.ok) {
                    throw new Error(`Unexpected ${res.status} requesting ${originalUri}: ${text || res.statusText}`);
                }
                globals.scriptUrl = url;
            }
            catch (e) {
                return () => ({ state: 1 /* Error */, error: e.message });
            }
            const args = Object.entries(globals);
            return () => {
                try {
                    new Function(...args.map(([k]) => k), text)(...args.map(([, v]) => v));
                    return { state: 0 /* Ok */ };
                }
                catch (e) {
                    console.error(e);
                    return { state: 1 /* Error */, error: e.message };
                }
            };
        };
        const dimensionUpdater = new class {
            constructor() {
                this.pending = new Map();
            }
            update(id, height, options) {
                if (!this.pending.size) {
                    setTimeout(() => {
                        this.updateImmediately();
                    }, 0);
                }
                this.pending.set(id, Object.assign({ id,
                    height }, options));
            }
            updateImmediately() {
                if (!this.pending.size) {
                    return;
                }
                postNotebookMessage('dimension', {
                    updates: Array.from(this.pending.values())
                });
                this.pending.clear();
            }
        };
        const resizeObserver = new class {
            constructor() {
                this._observedElements = new WeakMap();
                this._observer = new ResizeObserver(entries => {
                    for (const entry of entries) {
                        if (!document.body.contains(entry.target)) {
                            continue;
                        }
                        const observedElementInfo = this._observedElements.get(entry.target);
                        if (!observedElementInfo) {
                            continue;
                        }
                        if (entry.target.id === observedElementInfo.id && entry.contentRect) {
                            if (observedElementInfo.output) {
                                let height = 0;
                                if (entry.contentRect.height !== 0) {
                                    entry.target.style.padding = `${__outputNodePadding__}px ${__outputNodePadding__}px ${__outputNodePadding__}px ${__outputNodeLeftPadding__}px`;
                                    height = entry.contentRect.height + __outputNodePadding__ * 2;
                                }
                                else {
                                    entry.target.style.padding = `0px`;
                                }
                                dimensionUpdater.update(observedElementInfo.id, height, {
                                    isOutput: true
                                });
                            }
                            else {
                                dimensionUpdater.update(observedElementInfo.id, entry.target.clientHeight, {
                                    isOutput: false
                                });
                            }
                        }
                    }
                });
            }
            observe(container, id, output) {
                if (this._observedElements.has(container)) {
                    return;
                }
                this._observedElements.set(container, { id, output });
                this._observer.observe(container);
            }
        };
        function scrollWillGoToParent(event) {
            for (let node = event.target; node; node = node.parentNode) {
                if (!(node instanceof Element) || node.id === 'container' || node.classList.contains('cell_container') || node.classList.contains('output_container')) {
                    return false;
                }
                if (event.deltaY < 0 && node.scrollTop > 0) {
                    return true;
                }
                if (event.deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight) {
                    return true;
                }
            }
            return false;
        }
        const handleWheel = (event) => {
            if (event.defaultPrevented || scrollWillGoToParent(event)) {
                return;
            }
            postNotebookMessage('did-scroll-wheel', {
                payload: {
                    deltaMode: event.deltaMode,
                    deltaX: event.deltaX,
                    deltaY: event.deltaY,
                    deltaZ: event.deltaZ,
                    detail: event.detail,
                    type: event.type
                }
            });
        };
        function focusFirstFocusableInCell(cellId) {
            const cellOutputContainer = document.getElementById(cellId);
            if (cellOutputContainer) {
                const focusableElement = cellOutputContainer.querySelector('[tabindex="0"], [href], button, input, option, select, textarea');
                focusableElement === null || focusableElement === void 0 ? void 0 : focusableElement.focus();
            }
        }
        function createFocusSink(cellId, outputId, focusNext) {
            const element = document.createElement('div');
            element.tabIndex = 0;
            element.addEventListener('focus', () => {
                postNotebookMessage('focus-editor', {
                    id: outputId,
                    focusNext
                });
            });
            return element;
        }
        function addMouseoverListeners(element, outputId) {
            element.addEventListener('mouseenter', () => {
                postNotebookMessage('mouseenter', {
                    id: outputId,
                });
            });
            element.addEventListener('mouseleave', () => {
                postNotebookMessage('mouseleave', {
                    id: outputId,
                });
            });
        }
        function isAncestor(testChild, testAncestor) {
            while (testChild) {
                if (testChild === testAncestor) {
                    return true;
                }
                testChild = testChild.parentNode;
            }
            return false;
        }
        class FocusTracker {
            constructor(element, outputId) {
                this._hasFocus = false;
                this._loosingFocus = false;
                this._element = element;
                this._outputId = outputId;
                this._hasFocus = isAncestor(document.activeElement, element);
                this._loosingFocus = false;
                element.addEventListener('focus', this._onFocus.bind(this), true);
                element.addEventListener('blur', this._onBlur.bind(this), true);
            }
            _onFocus() {
                this._loosingFocus = false;
                if (!this._hasFocus) {
                    this._hasFocus = true;
                    postNotebookMessage('outputFocus', {
                        id: this._outputId,
                    });
                }
            }
            _onBlur() {
                if (this._hasFocus) {
                    this._loosingFocus = true;
                    window.setTimeout(() => {
                        if (this._loosingFocus) {
                            this._loosingFocus = false;
                            this._hasFocus = false;
                            postNotebookMessage('outputBlur', {
                                id: this._outputId,
                            });
                        }
                    }, 0);
                }
            }
            dispose() {
                if (this._element) {
                    this._element.removeEventListener('focus', this._onFocus, true);
                    this._element.removeEventListener('blur', this._onBlur, true);
                }
            }
        }
        const focusTrackers = new Map();
        function addFocusTracker(element, outputId) {
            var _a;
            if (focusTrackers.has(outputId)) {
                (_a = focusTrackers.get(outputId)) === null || _a === void 0 ? void 0 : _a.dispose();
            }
            focusTrackers.set(outputId, new FocusTracker(element, outputId));
        }
        const dontEmit = Symbol('dontEmit');
        function createEmitter(listenerChange = () => undefined) {
            const listeners = new Set();
            return {
                fire(data) {
                    for (const listener of [...listeners]) {
                        listener.fn.call(listener.thisArg, data);
                    }
                },
                event(fn, thisArg, disposables) {
                    const listenerObj = { fn, thisArg };
                    const disposable = {
                        dispose: () => {
                            listeners.delete(listenerObj);
                            listenerChange(listeners);
                        },
                    };
                    listeners.add(listenerObj);
                    listenerChange(listeners);
                    if (disposables instanceof Array) {
                        disposables.push(disposable);
                    }
                    else if (disposables) {
                        disposables.add(disposable);
                    }
                    return disposable;
                },
            };
        }
        // Maps the events in the given emitter, invoking mapFn on each one. mapFn can return
        // the dontEmit symbol to skip emission.
        function mapEmitter(emitter, mapFn) {
            let listener;
            const mapped = createEmitter(listeners => {
                if (listeners.size && !listener) {
                    listener = emitter.event(data => {
                        const v = mapFn(data);
                        if (v !== dontEmit) {
                            mapped.fire(v);
                        }
                    });
                }
                else if (listener && !listeners.size) {
                    listener.dispose();
                }
            });
            return mapped.event;
        }
        const onWillDestroyOutput = createEmitter();
        const onDidCreateOutput = createEmitter();
        const onDidReceiveMessage = createEmitter();
        const matchesNs = (namespace, query) => namespace === '*' || query === namespace || query === 'undefined';
        window.acquireNotebookRendererApi = (namespace) => {
            if (!namespace || typeof namespace !== 'string') {
                throw new Error(`acquireNotebookRendererApi should be called your renderer type as a string, got: ${namespace}.`);
            }
            return {
                postMessage(message) {
                    postNotebookMessage('customRendererMessage', {
                        rendererId: namespace,
                        message,
                    });
                },
                setState(newState) {
                    vscode.setState(Object.assign(Object.assign({}, vscode.getState()), { [namespace]: newState }));
                },
                getState() {
                    const state = vscode.getState();
                    return typeof state === 'object' && state ? state[namespace] : undefined;
                },
                onDidReceiveMessage: mapEmitter(onDidReceiveMessage, ([ns, data]) => ns === namespace ? data : dontEmit),
                onWillDestroyOutput: mapEmitter(onWillDestroyOutput, ([ns, data]) => matchesNs(namespace, ns) ? data : dontEmit),
                onDidCreateOutput: mapEmitter(onDidCreateOutput, ([ns, data]) => matchesNs(namespace, ns) ? data : dontEmit),
            };
        };
        let PreloadState;
        (function (PreloadState) {
            PreloadState[PreloadState["Ok"] = 0] = "Ok";
            PreloadState[PreloadState["Error"] = 1] = "Error";
        })(PreloadState || (PreloadState = {}));
        /**
         * Map of preload resource URIs to promises that resolve one the resource
         * loads or errors.
         */
        const preloadPromises = new Map();
        const queuedOuputActions = new Map();
        /**
         * Enqueues an action that affects a output. This blocks behind renderer load
         * requests that affect the same output. This should be called whenever you
         * do something that affects output to ensure it runs in
         * the correct order.
         */
        const enqueueOutputAction = (event, fn) => {
            const queued = queuedOuputActions.get(event.outputId);
            const maybePromise = queued ? queued.then(() => fn(event)) : fn(event);
            if (typeof maybePromise === 'undefined') {
                return; // a synchonrously-called function, we're done
            }
            const promise = maybePromise.then(() => {
                if (queuedOuputActions.get(event.outputId) === promise) {
                    queuedOuputActions.delete(event.outputId);
                }
            });
            queuedOuputActions.set(event.outputId, promise);
        };
        const ttPolicy = (_a = window.trustedTypes) === null || _a === void 0 ? void 0 : _a.createPolicy('notebookOutputRenderer', {
            createHTML: value => value,
            createScript: value => value,
        });
        window.addEventListener('wheel', handleWheel);
        window.addEventListener('message', rawEvent => {
            const event = rawEvent;
            switch (event.data.type) {
                case 'initializeMarkdownPreview':
                    for (const cell of event.data.cells) {
                        createMarkdownPreview(cell.cellId, cell.content, cell.offset);
                        const cellContainer = document.getElementById(cell.cellId);
                        if (cellContainer) {
                            cellContainer.style.visibility = 'hidden';
                        }
                    }
                    dimensionUpdater.updateImmediately();
                    postNotebookMessage('initializedMarkdownPreview', {});
                    break;
                case 'createMarkdownPreview':
                    createMarkdownPreview(event.data.id, event.data.content, event.data.top);
                    break;
                case 'showMarkdownPreview':
                    {
                        const data = event.data;
                        const cellContainer = document.getElementById(data.id);
                        if (cellContainer) {
                            cellContainer.style.visibility = 'visible';
                            cellContainer.style.top = `${data.top}px`;
                        }
                        updateMarkdownPreview(data.id, data.content);
                    }
                    break;
                case 'hideMarkdownPreviews':
                    {
                        for (const id of event.data.ids) {
                            const cellContainer = document.getElementById(id);
                            if (cellContainer) {
                                cellContainer.style.visibility = 'hidden';
                            }
                        }
                    }
                    break;
                case 'unhideMarkdownPreviews':
                    {
                        for (const id of event.data.ids) {
                            const cellContainer = document.getElementById(id);
                            if (cellContainer) {
                                cellContainer.style.visibility = 'visible';
                            }
                            updateMarkdownPreview(id, undefined);
                        }
                    }
                    break;
                case 'deleteMarkdownPreview':
                    {
                        for (const id of event.data.ids) {
                            const cellContainer = document.getElementById(id);
                            cellContainer === null || cellContainer === void 0 ? void 0 : cellContainer.remove();
                        }
                    }
                    break;
                case 'updateSelectedMarkdownPreviews':
                    {
                        const selectedCellIds = new Set(event.data.selectedCellIds);
                        for (const oldSelected of document.querySelectorAll('.preview.selected')) {
                            const id = oldSelected.id;
                            if (!selectedCellIds.has(id)) {
                                oldSelected.classList.remove('selected');
                            }
                        }
                        for (const newSelected of selectedCellIds) {
                            const previewContainer = document.getElementById(newSelected);
                            if (previewContainer) {
                                previewContainer.classList.add('selected');
                            }
                        }
                    }
                    break;
                case 'html':
                    enqueueOutputAction(event.data, async (data) => {
                        var _a;
                        const preloadResults = await Promise.all(data.requiredPreloads.map(p => preloadPromises.get(p.uri)));
                        if (!queuedOuputActions.has(data.outputId)) { // output was cleared while loading
                            return;
                        }
                        let cellOutputContainer = document.getElementById(data.cellId);
                        const outputId = data.outputId;
                        if (!cellOutputContainer) {
                            const container = document.getElementById('container');
                            const upperWrapperElement = createFocusSink(data.cellId, outputId);
                            container.appendChild(upperWrapperElement);
                            const newElement = document.createElement('div');
                            newElement.id = data.cellId;
                            newElement.classList.add('cell_container');
                            container.appendChild(newElement);
                            cellOutputContainer = newElement;
                            const lowerWrapperElement = createFocusSink(data.cellId, outputId, true);
                            container.appendChild(lowerWrapperElement);
                        }
                        cellOutputContainer.style.position = 'absolute';
                        cellOutputContainer.style.top = data.cellTop + 'px';
                        const outputContainer = document.createElement('div');
                        outputContainer.classList.add('output_container');
                        outputContainer.style.position = 'absolute';
                        outputContainer.style.overflow = 'hidden';
                        outputContainer.style.maxHeight = '0px';
                        outputContainer.style.top = `${data.outputOffset}px`;
                        const outputNode = document.createElement('div');
                        outputNode.classList.add('output');
                        outputNode.style.position = 'absolute';
                        outputNode.style.top = `0px`;
                        outputNode.style.left = data.left + 'px';
                        // outputNode.style.width = 'calc(100% - ' + data.left + 'px)';
                        // outputNode.style.minHeight = '32px';
                        outputNode.style.padding = '0px';
                        outputNode.id = outputId;
                        addMouseoverListeners(outputNode, outputId);
                        addFocusTracker(outputNode, outputId);
                        const content = data.content;
                        if (content.type === 1 /* Html */) {
                            const trustedHtml = (_a = ttPolicy === null || ttPolicy === void 0 ? void 0 : ttPolicy.createHTML(content.htmlContent)) !== null && _a !== void 0 ? _a : content.htmlContent;
                            outputNode.innerHTML = trustedHtml;
                            cellOutputContainer.appendChild(outputContainer);
                            outputContainer.appendChild(outputNode);
                            domEval(outputNode);
                        }
                        else if (preloadResults.some(e => (e === null || e === void 0 ? void 0 : e.state) === 1 /* Error */)) {
                            outputNode.innerText = `Error loading preloads:`;
                            const errList = document.createElement('ul');
                            for (const result of preloadResults) {
                                if ((result === null || result === void 0 ? void 0 : result.state) === 1 /* Error */) {
                                    const item = document.createElement('li');
                                    item.innerText = result.error;
                                    errList.appendChild(item);
                                }
                            }
                            outputNode.appendChild(errList);
                            cellOutputContainer.appendChild(outputContainer);
                            outputContainer.appendChild(outputNode);
                        }
                        else {
                            const { metadata, mimeType, value } = content;
                            onDidCreateOutput.fire([data.apiNamespace, {
                                    element: outputNode,
                                    outputId,
                                    mime: content.mimeType,
                                    value: content.value,
                                    metadata: content.metadata,
                                    get mimeType() {
                                        console.warn(`event.mimeType is deprecated, use 'mime' instead`);
                                        return mimeType;
                                    },
                                    get output() {
                                        console.warn(`event.output is deprecated, use properties directly instead`);
                                        return {
                                            metadata: { [mimeType]: metadata },
                                            data: { [mimeType]: value },
                                            outputId,
                                        };
                                    },
                                }]);
                            cellOutputContainer.appendChild(outputContainer);
                            outputContainer.appendChild(outputNode);
                        }
                        resizeObserver.observe(outputNode, outputId, true);
                        const clientHeight = outputNode.clientHeight;
                        const cps = document.defaultView.getComputedStyle(outputNode);
                        if (clientHeight !== 0 && cps.padding === '0px') {
                            // we set padding to zero if the output height is zero (then we can have a zero-height output DOM node)
                            // thus we need to ensure the padding is accounted when updating the init height of the output
                            dimensionUpdater.update(outputId, clientHeight + __outputNodePadding__ * 2, {
                                isOutput: true,
                                init: true,
                            });
                            outputNode.style.padding = `${__outputNodePadding__}px ${__outputNodePadding__}px ${__outputNodePadding__}px ${__outputNodeLeftPadding__}px`;
                        }
                        else {
                            dimensionUpdater.update(outputId, outputNode.clientHeight, {
                                isOutput: true,
                                init: true,
                            });
                        }
                        // don't hide until after this step so that the height is right
                        cellOutputContainer.style.visibility = data.initiallyHidden ? 'hidden' : 'visible';
                    });
                    break;
                case 'view-scroll':
                    {
                        // const date = new Date();
                        // console.log('----- will scroll ----  ', date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds());
                        for (const request of event.data.widgets) {
                            const widget = document.getElementById(request.outputId);
                            if (widget) {
                                widget.parentElement.parentElement.style.top = `${request.cellTop}px`;
                                widget.parentElement.style.top = `${request.outputOffset}px`;
                                if (request.forceDisplay) {
                                    widget.parentElement.parentElement.style.visibility = 'visible';
                                }
                            }
                        }
                        for (const cell of event.data.markdownPreviews) {
                            const container = document.getElementById(cell.id);
                            if (container) {
                                container.style.top = `${cell.top}px`;
                            }
                        }
                        break;
                    }
                case 'clear':
                    queuedOuputActions.clear(); // stop all loading outputs
                    onWillDestroyOutput.fire([undefined, undefined]);
                    document.getElementById('container').innerText = '';
                    focusTrackers.forEach(ft => {
                        ft.dispose();
                    });
                    focusTrackers.clear();
                    break;
                case 'clearOutput':
                    const output = document.getElementById(event.data.outputId);
                    queuedOuputActions.delete(event.data.outputId); // stop any in-progress rendering
                    if (output && output.parentNode) {
                        onWillDestroyOutput.fire([event.data.apiNamespace, { outputId: event.data.outputId }]);
                        output.parentNode.removeChild(output);
                    }
                    break;
                case 'hideOutput':
                    enqueueOutputAction(event.data, ({ outputId }) => {
                        var _a, _b;
                        const container = (_b = (_a = document.getElementById(outputId)) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.parentElement;
                        if (container) {
                            container.style.visibility = 'hidden';
                        }
                    });
                    break;
                case 'showOutput':
                    enqueueOutputAction(event.data, ({ outputId, cellTop: top, }) => {
                        const output = document.getElementById(outputId);
                        if (output) {
                            output.parentElement.parentElement.style.visibility = 'visible';
                            output.parentElement.parentElement.style.top = top + 'px';
                            dimensionUpdater.update(outputId, output.clientHeight, {
                                isOutput: true,
                            });
                        }
                    });
                    break;
                case 'ack-dimension':
                    {
                        const { outputId, height } = event.data;
                        const output = document.getElementById(outputId);
                        if (output) {
                            output.parentElement.style.maxHeight = `${height}px`;
                            output.parentElement.style.height = `${height}px`;
                        }
                        break;
                    }
                case 'preload':
                    const resources = event.data.resources;
                    const globals = event.data.type === 'preload' ? { acquireVsCodeApi } : {};
                    let queue = Promise.resolve({ state: 0 /* Ok */ });
                    for (const { uri, originalUri } of resources) {
                        // create the promise so that the scripts download in parallel, but
                        // only invoke them in series within the queue
                        const promise = runScript(uri, originalUri, globals);
                        queue = queue.then(() => promise.then(fn => {
                            const result = fn();
                            if (result.state === 1 /* Error */) {
                                console.error(result.error);
                            }
                            return result;
                        }));
                        preloadPromises.set(uri, queue);
                    }
                    break;
                case 'focus-output':
                    focusFirstFocusableInCell(event.data.cellId);
                    break;
                case 'decorations':
                    {
                        const outputContainer = document.getElementById(event.data.cellId);
                        outputContainer === null || outputContainer === void 0 ? void 0 : outputContainer.classList.add(...event.data.addedClassNames);
                        outputContainer === null || outputContainer === void 0 ? void 0 : outputContainer.classList.remove(...event.data.removedClassNames);
                    }
                    break;
                case 'customRendererMessage':
                    onDidReceiveMessage.fire([event.data.rendererId, event.data.message]);
                    break;
            }
        });
        const markdownRenderer = await markdownRendererModule.activate(markdownDeps);
        vscode.postMessage({
            __vscode_notebook_message: true,
            type: 'initialized'
        });
        function createMarkdownPreview(cellId, content, top) {
            const container = document.getElementById('container');
            const cellContainer = document.createElement('div');
            cellContainer.id = cellId;
            cellContainer.classList.add('preview');
            cellContainer.style.position = 'absolute';
            cellContainer.style.top = top + 'px';
            container.appendChild(cellContainer);
            cellContainer.addEventListener('dblclick', () => {
                postNotebookMessage('toggleMarkdownPreview', { cellId });
            });
            cellContainer.addEventListener('click', e => {
                postNotebookMessage('clickMarkdownPreview', {
                    cellId,
                    altKey: e.altKey,
                    ctrlKey: e.ctrlKey,
                    metaKey: e.metaKey,
                    shiftKey: e.shiftKey,
                });
            });
            cellContainer.addEventListener('contextmenu', e => {
                postNotebookMessage('contextMenuMarkdownPreview', {
                    cellId,
                    clientX: e.clientX,
                    clientY: e.clientY,
                });
            });
            cellContainer.addEventListener('mouseenter', () => {
                postNotebookMessage('mouseEnterMarkdownPreview', { cellId });
            });
            cellContainer.addEventListener('mouseleave', () => {
                postNotebookMessage('mouseLeaveMarkdownPreview', { cellId });
            });
            cellContainer.setAttribute('draggable', 'true');
            cellContainer.addEventListener('dragstart', e => {
                markdownPreviewDragManager.startDrag(e, cellId);
            });
            cellContainer.addEventListener('drag', e => {
                markdownPreviewDragManager.updateDrag(e, cellId);
            });
            cellContainer.addEventListener('dragend', e => {
                markdownPreviewDragManager.endDrag(e, cellId);
            });
            const previewRoot = cellContainer.attachShadow({ mode: 'open' });
            // Add default webview style
            const defaultStyles = document.getElementById('_defaultStyles');
            previewRoot.appendChild(defaultStyles.cloneNode(true));
            // Add default preview style
            const previewStyles = document.getElementById('preview-styles');
            previewRoot.appendChild(previewStyles.content.cloneNode(true));
            const previewNode = document.createElement('div');
            previewNode.id = 'preview';
            previewRoot.appendChild(previewNode);
            updateMarkdownPreview(cellId, content);
            resizeObserver.observe(cellContainer, cellId, false);
        }
        function postNotebookMessage(type, properties) {
            vscode.postMessage(Object.assign({ __vscode_notebook_message: true, type }, properties));
        }
        let hasPostedRenderedMathTelemetry = false;
        const unsupportedKatexTermsRegex = /(\\(?:abovewithdelims|array|Arrowvert|arrowvert|atopwithdelims|bbox|bracevert|buildrel|cancelto|cases|class|cssId|ddddot|dddot|DeclareMathOperator|definecolor|displaylines|enclose|eqalign|eqalignno|eqref|hfil|hfill|idotsint|iiiint|label|leftarrowtail|leftroot|leqalignno|lower|mathtip|matrix|mbox|mit|mmlToken|moveleft|moveright|mspace|newenvironment|Newextarrow|notag|oldstyle|overparen|overwithdelims|pmatrix|raise|ref|renewenvironment|require|root|Rule|scr|shoveleft|shoveright|sideset|skew|Space|strut|style|texttip|Tiny|toggle|underparen|unicode|uproot)\b)/g;
        function updateMarkdownPreview(cellId, content) {
            const previewContainerNode = document.getElementById(cellId);
            if (!previewContainerNode) {
                return;
            }
            const previewRoot = previewContainerNode.shadowRoot;
            const previewNode = previewRoot === null || previewRoot === void 0 ? void 0 : previewRoot.getElementById('preview');
            // TODO: handle namespace
            if (typeof content === 'string') {
                if (content.trim().length === 0) {
                    previewContainerNode.classList.add('emptyMarkdownCell');
                    previewNode.innerText = '';
                }
                else {
                    previewContainerNode.classList.remove('emptyMarkdownCell');
                    markdownRenderer.renderMarkup({
                        element: previewNode,
                        content: content
                    });
                    if (!hasPostedRenderedMathTelemetry) {
                        const hasRenderedMath = previewNode.querySelector('.katex');
                        if (hasRenderedMath) {
                            hasPostedRenderedMathTelemetry = true;
                            postNotebookMessage('telemetryFoundRenderedMarkdownMath', {});
                        }
                    }
                    const matches = previewNode.innerText.match(unsupportedKatexTermsRegex);
                    if (matches) {
                        postNotebookMessage('telemetryFoundUnrenderedMarkdownMath', {
                            latexDirective: matches[0],
                        });
                    }
                }
            }
            dimensionUpdater.update(cellId, previewContainerNode.clientHeight, {
                isOutput: false
            });
        }
        const markdownPreviewDragManager = new class MarkdownPreviewDragManager {
            constructor() {
                document.addEventListener('dragover', e => {
                    // Allow dropping dragged markdown cells
                    e.preventDefault();
                });
                document.addEventListener('drop', e => {
                    e.preventDefault();
                    const drag = this.currentDrag;
                    if (!drag) {
                        return;
                    }
                    this.currentDrag = undefined;
                    postNotebookMessage('cell-drop', {
                        cellId: drag.cellId,
                        ctrlKey: e.ctrlKey,
                        altKey: e.altKey,
                        position: { clientY: e.clientY },
                    });
                });
            }
            startDrag(e, cellId) {
                if (!e.dataTransfer) {
                    return;
                }
                this.currentDrag = { cellId, clientY: e.clientY };
                e.target.classList.add('dragging');
                postNotebookMessage('cell-drag-start', {
                    cellId: cellId,
                    position: { clientY: e.clientY },
                });
                // Continuously send updates while dragging instead of relying on `updateDrag`.
                // This lets us scroll the list based on drag position.
                const trySendDragUpdate = () => {
                    var _a;
                    if (((_a = this.currentDrag) === null || _a === void 0 ? void 0 : _a.cellId) !== cellId) {
                        return;
                    }
                    postNotebookMessage('cell-drag', {
                        cellId: cellId,
                        position: { clientY: this.currentDrag.clientY },
                    });
                    requestAnimationFrame(trySendDragUpdate);
                };
                requestAnimationFrame(trySendDragUpdate);
            }
            updateDrag(e, cellId) {
                var _a;
                if (cellId !== ((_a = this.currentDrag) === null || _a === void 0 ? void 0 : _a.cellId)) {
                    this.currentDrag = undefined;
                }
                this.currentDrag = { cellId, clientY: e.clientY };
            }
            endDrag(e, cellId) {
                this.currentDrag = undefined;
                e.target.classList.remove('dragging');
                postNotebookMessage('cell-drag-end', {
                    cellId: cellId
                });
            }
        }();
    }
    function preloadsScriptStr(styleValues, markdownRenderer) {
        const markdownCtx = {
            dependencies: markdownRenderer.dependencies,
        };
        return `
	import * as markdownRendererModule from "${markdownRenderer.entrypoint}";
	(${webviewPreloads})(markdownRendererModule, JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(markdownCtx))}")))`
            .replace(/__outputNodePadding__/g, `${styleValues.outputNodePadding}`)
            .replace(/__outputNodeLeftPadding__/g, `${styleValues.outputNodeLeftPadding}`);
    }
    exports.preloadsScriptStr = preloadsScriptStr;
});
//# sourceMappingURL=webviewPreloads.js.map