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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/core/markdownRenderer", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/platform/instantiation/common/instantiation", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/workbench/contrib/debug/browser/debugANSIHandling", "vs/workbench/contrib/debug/browser/linkDetector", "vs/workbench/contrib/notebook/browser/notebookRegistry", "vs/workbench/contrib/notebook/browser/view/output/transforms/textHelper", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, DOM, lifecycle_1, resources_1, types_1, uri_1, markdownRenderer_1, codeEditorWidget_1, modelService_1, modeService_1, instantiation_1, opener_1, themeService_1, debugANSIHandling_1, linkDetector_1, notebookRegistry_1, textHelper_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOutputSimpleEditorOptions = void 0;
    function getStringValue(data) {
        return (0, types_1.isArray)(data) ? data.join('') : String(data);
    }
    let JSONRendererContrib = class JSONRendererContrib extends lifecycle_1.Disposable {
        constructor(notebookEditor, instantiationService, modelService, modeService) {
            super();
            this.notebookEditor = notebookEditor;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.modeService = modeService;
        }
        getType() {
            return 0 /* Mainframe */;
        }
        getMimetypes() {
            return ['application/json'];
        }
        render(output, items, container, notebookUri) {
            const str = items.map(item => JSON.stringify(item.value, null, '\t')).join('');
            const editor = this.instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, container, Object.assign(Object.assign({}, getOutputSimpleEditorOptions()), { dimension: {
                    width: 0,
                    height: 0
                }, automaticLayout: true }), {
                isSimpleWidget: true
            });
            const mode = this.modeService.create('json');
            const resource = uri_1.URI.parse(`notebook-output-${Date.now()}.json`);
            const textModel = this.modelService.createModel(str, mode, resource, false);
            editor.setModel(textModel);
            const width = this.notebookEditor.getCellOutputLayoutInfo(output.cellViewModel).width;
            const fontInfo = this.notebookEditor.getCellOutputLayoutInfo(output.cellViewModel).fontInfo;
            const height = Math.min(textModel.getLineCount(), 16) * (fontInfo.lineHeight || 18);
            editor.layout({
                height,
                width
            });
            container.style.height = `${height + 8}px`;
            return { type: 0 /* Mainframe */, initHeight: height };
        }
    };
    JSONRendererContrib = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, modelService_1.IModelService),
        __param(3, modeService_1.IModeService)
    ], JSONRendererContrib);
    class JavaScriptRendererContrib extends lifecycle_1.Disposable {
        constructor(notebookEditor) {
            super();
            this.notebookEditor = notebookEditor;
        }
        getType() {
            return 1 /* Html */;
        }
        getMimetypes() {
            return ['application/javascript'];
        }
        render(output, items, container, notebookUri) {
            let scriptVal = '';
            items.forEach(item => {
                const data = item.value;
                const str = (0, types_1.isArray)(data) ? data.join('') : data;
                scriptVal += `<script type="application/javascript">${str}</script>`;
            });
            return {
                type: 1 /* Html */,
                source: output,
                htmlContent: scriptVal
            };
        }
    }
    let CodeRendererContrib = class CodeRendererContrib extends lifecycle_1.Disposable {
        constructor(notebookEditor, instantiationService, modelService, modeService) {
            super();
            this.notebookEditor = notebookEditor;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.modeService = modeService;
        }
        getType() {
            return 0 /* Mainframe */;
        }
        getMimetypes() {
            return ['text/x-javascript'];
        }
        render(output, items, container, notebookUri) {
            const str = items.map(item => getStringValue(item.value)).join('');
            const editor = this.instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, container, Object.assign(Object.assign({}, getOutputSimpleEditorOptions()), { dimension: {
                    width: 0,
                    height: 0
                } }), {
                isSimpleWidget: true
            });
            const mode = this.modeService.create('javascript');
            const resource = uri_1.URI.parse(`notebook-output-${Date.now()}.js`);
            const textModel = this.modelService.createModel(str, mode, resource, false);
            editor.setModel(textModel);
            const width = this.notebookEditor.getCellOutputLayoutInfo(output.cellViewModel).width;
            const fontInfo = this.notebookEditor.getCellOutputLayoutInfo(output.cellViewModel).fontInfo;
            const height = Math.min(textModel.getLineCount(), 16) * (fontInfo.lineHeight || 18);
            editor.layout({
                height,
                width
            });
            container.style.height = `${height + 8}px`;
            return { type: 0 /* Mainframe */ };
        }
    };
    CodeRendererContrib = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, modelService_1.IModelService),
        __param(3, modeService_1.IModeService)
    ], CodeRendererContrib);
    let StreamRendererContrib = class StreamRendererContrib extends lifecycle_1.Disposable {
        constructor(notebookEditor, openerService, themeService, textFileService, instantiationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.openerService = openerService;
            this.themeService = themeService;
            this.textFileService = textFileService;
            this.instantiationService = instantiationService;
        }
        getType() {
            return 0 /* Mainframe */;
        }
        getMimetypes() {
            return ['application/x.notebook.stdout', 'application/x.notebook.stream'];
        }
        render(output, items, container, notebookUri) {
            const linkDetector = this.instantiationService.createInstance(linkDetector_1.LinkDetector);
            items.forEach(item => {
                const text = getStringValue(item.value);
                const contentNode = DOM.$('span.output-stream');
                (0, textHelper_1.truncatedArrayOfString)(contentNode, [text], linkDetector, this.openerService, this.textFileService, this.themeService);
                container.appendChild(contentNode);
            });
            return { type: 0 /* Mainframe */ };
        }
    };
    StreamRendererContrib = __decorate([
        __param(1, opener_1.IOpenerService),
        __param(2, themeService_1.IThemeService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, instantiation_1.IInstantiationService)
    ], StreamRendererContrib);
    class StderrRendererContrib extends StreamRendererContrib {
        getType() {
            return 0 /* Mainframe */;
        }
        getMimetypes() {
            return ['application/x.notebook.stderr'];
        }
        render(output, items, container, notebookUri) {
            const result = super.render(output, items, container, notebookUri);
            container.classList.add('error');
            return result;
        }
    }
    let ErrorRendererContrib = class ErrorRendererContrib extends lifecycle_1.Disposable {
        constructor(notebookEditor, themeService, instantiationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.themeService = themeService;
            this.instantiationService = instantiationService;
        }
        getType() {
            return 0 /* Mainframe */;
        }
        getMimetypes() {
            return ['application/x.notebook.error-traceback'];
        }
        render(output, items, container, notebookUri) {
            const linkDetector = this.instantiationService.createInstance(linkDetector_1.LinkDetector);
            items.forEach(item => {
                const data = item.value;
                const header = document.createElement('div');
                const headerMessage = data.ename && data.evalue
                    ? `${data.ename}: ${data.evalue}`
                    : data.ename || data.evalue;
                if (headerMessage) {
                    header.innerText = headerMessage;
                    container.appendChild(header);
                }
                const traceback = document.createElement('pre');
                traceback.classList.add('traceback');
                if (data.traceback) {
                    for (let j = 0; j < data.traceback.length; j++) {
                        traceback.appendChild((0, debugANSIHandling_1.handleANSIOutput)(data.traceback[j], linkDetector, this.themeService, undefined));
                    }
                }
                container.appendChild(traceback);
                container.classList.add('error');
                return { type: 0 /* Mainframe */ };
            });
            return { type: 0 /* Mainframe */ };
        }
        _render() {
        }
    };
    ErrorRendererContrib = __decorate([
        __param(1, themeService_1.IThemeService),
        __param(2, instantiation_1.IInstantiationService)
    ], ErrorRendererContrib);
    let PlainTextRendererContrib = class PlainTextRendererContrib extends lifecycle_1.Disposable {
        constructor(notebookEditor, openerService, themeService, textFileService, instantiationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.openerService = openerService;
            this.themeService = themeService;
            this.textFileService = textFileService;
            this.instantiationService = instantiationService;
        }
        getType() {
            return 0 /* Mainframe */;
        }
        getMimetypes() {
            return ['text/plain'];
        }
        render(output, items, container, notebookUri) {
            const linkDetector = this.instantiationService.createInstance(linkDetector_1.LinkDetector);
            const str = items.map(item => getStringValue(item.value));
            const contentNode = DOM.$('.output-plaintext');
            (0, textHelper_1.truncatedArrayOfString)(contentNode, str, linkDetector, this.openerService, this.textFileService, this.themeService);
            container.appendChild(contentNode);
            return { type: 0 /* Mainframe */, supportAppend: true };
        }
    };
    PlainTextRendererContrib = __decorate([
        __param(1, opener_1.IOpenerService),
        __param(2, themeService_1.IThemeService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, instantiation_1.IInstantiationService)
    ], PlainTextRendererContrib);
    class HTMLRendererContrib extends lifecycle_1.Disposable {
        constructor(notebookEditor) {
            super();
            this.notebookEditor = notebookEditor;
        }
        getType() {
            return 1 /* Html */;
        }
        getMimetypes() {
            return ['text/html'];
        }
        render(output, items, container, notebookUri) {
            const data = items.map(item => getStringValue(item.value)).join('');
            const str = ((0, types_1.isArray)(data) ? data.join('') : data);
            return {
                type: 1 /* Html */,
                source: output,
                htmlContent: str
            };
        }
    }
    class SVGRendererContrib extends lifecycle_1.Disposable {
        constructor(notebookEditor) {
            super();
            this.notebookEditor = notebookEditor;
        }
        getType() {
            return 1 /* Html */;
        }
        getMimetypes() {
            return ['image/svg+xml'];
        }
        render(output, items, container, notebookUri) {
            const str = items.map(item => getStringValue(item.value)).join('');
            return {
                type: 1 /* Html */,
                source: output,
                htmlContent: str
            };
        }
    }
    let MdRendererContrib = class MdRendererContrib extends lifecycle_1.Disposable {
        constructor(notebookEditor, instantiationService) {
            super();
            this.notebookEditor = notebookEditor;
            this.instantiationService = instantiationService;
        }
        getType() {
            return 0 /* Mainframe */;
        }
        getMimetypes() {
            return ['text/markdown'];
        }
        render(output, items, container, notebookUri) {
            items.forEach(item => {
                const data = item.value;
                const str = ((0, types_1.isArray)(data) ? data.join('') : data);
                const mdOutput = document.createElement('div');
                const mdRenderer = this.instantiationService.createInstance(markdownRenderer_1.MarkdownRenderer, { baseUrl: (0, resources_1.dirname)(notebookUri) });
                mdOutput.appendChild(mdRenderer.render({ value: str, isTrusted: true, supportThemeIcons: true }, undefined, { gfm: true }).element);
                container.appendChild(mdOutput);
            });
            return { type: 0 /* Mainframe */ };
        }
    };
    MdRendererContrib = __decorate([
        __param(1, instantiation_1.IInstantiationService)
    ], MdRendererContrib);
    class PNGRendererContrib extends lifecycle_1.Disposable {
        constructor(notebookEditor) {
            super();
            this.notebookEditor = notebookEditor;
        }
        getType() {
            return 0 /* Mainframe */;
        }
        getMimetypes() {
            return ['image/png'];
        }
        render(output, items, container, notebookUri) {
            items.forEach(item => {
                const image = document.createElement('img');
                const imagedata = item.value;
                image.src = `data:image/png;base64,${imagedata}`;
                const display = document.createElement('div');
                display.classList.add('display');
                display.appendChild(image);
                container.appendChild(display);
            });
            return { type: 0 /* Mainframe */ };
        }
    }
    class JPEGRendererContrib extends lifecycle_1.Disposable {
        constructor(notebookEditor) {
            super();
            this.notebookEditor = notebookEditor;
        }
        getType() {
            return 0 /* Mainframe */;
        }
        getMimetypes() {
            return ['image/jpeg'];
        }
        render(output, items, container, notebookUri) {
            items.forEach(item => {
                const image = document.createElement('img');
                const imagedata = item.value;
                image.src = `data:image/jpeg;base64,${imagedata}`;
                const display = document.createElement('div');
                display.classList.add('display');
                display.appendChild(image);
                container.appendChild(display);
            });
            return { type: 0 /* Mainframe */ };
        }
    }
    notebookRegistry_1.NotebookRegistry.registerOutputTransform('json', JSONRendererContrib);
    notebookRegistry_1.NotebookRegistry.registerOutputTransform('javascript', JavaScriptRendererContrib);
    notebookRegistry_1.NotebookRegistry.registerOutputTransform('html', HTMLRendererContrib);
    notebookRegistry_1.NotebookRegistry.registerOutputTransform('svg', SVGRendererContrib);
    notebookRegistry_1.NotebookRegistry.registerOutputTransform('markdown', MdRendererContrib);
    notebookRegistry_1.NotebookRegistry.registerOutputTransform('png', PNGRendererContrib);
    notebookRegistry_1.NotebookRegistry.registerOutputTransform('jpeg', JPEGRendererContrib);
    notebookRegistry_1.NotebookRegistry.registerOutputTransform('plain', PlainTextRendererContrib);
    notebookRegistry_1.NotebookRegistry.registerOutputTransform('code', CodeRendererContrib);
    notebookRegistry_1.NotebookRegistry.registerOutputTransform('error-trace', ErrorRendererContrib);
    notebookRegistry_1.NotebookRegistry.registerOutputTransform('stream-text', StreamRendererContrib);
    notebookRegistry_1.NotebookRegistry.registerOutputTransform('stderr', StderrRendererContrib);
    function getOutputSimpleEditorOptions() {
        return {
            readOnly: true,
            wordWrap: 'on',
            overviewRulerLanes: 0,
            glyphMargin: false,
            selectOnLineNumbers: false,
            hideCursorInOverviewRuler: true,
            selectionHighlight: false,
            lineDecorationsWidth: 0,
            overviewRulerBorder: false,
            scrollBeyondLastLine: false,
            renderLineHighlight: 'none',
            minimap: {
                enabled: false
            },
            lineNumbers: 'off',
            scrollbar: {
                alwaysConsumeMouseWheel: false
            }
        };
    }
    exports.getOutputSimpleEditorOptions = getOutputSimpleEditorOptions;
});
//# sourceMappingURL=richTransform.js.map