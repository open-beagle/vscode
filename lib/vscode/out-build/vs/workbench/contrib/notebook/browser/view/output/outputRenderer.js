/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/notebook/browser/notebookRegistry", "vs/base/common/errors"], function (require, exports, notebookRegistry_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutputRenderer = void 0;
    class OutputRenderer {
        constructor(notebookEditor, instantiationService) {
            this.instantiationService = instantiationService;
            this._richMimeTypeRenderers = new Map();
            this._contributions = {};
            this._renderers = [];
            const contributions = notebookRegistry_1.NotebookRegistry.getOutputTransformContributions();
            for (const desc of contributions) {
                try {
                    const contribution = this.instantiationService.createInstance(desc.ctor, notebookEditor);
                    this._contributions[desc.id] = contribution;
                    contribution.getMimetypes().forEach(mimetype => {
                        this._richMimeTypeRenderers.set(mimetype, contribution);
                    });
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
            }
        }
        getContribution(preferredMimeType) {
            if (preferredMimeType) {
                return this._richMimeTypeRenderers.get(preferredMimeType);
            }
            return undefined;
        }
        renderNoop(viewModel, container) {
            const contentNode = document.createElement('p');
            contentNode.innerText = `No renderer could be found for output.`;
            container.appendChild(contentNode);
            return { type: 0 /* Mainframe */ };
        }
        render(viewModel, container, preferredMimeType, notebookUri) {
            if (!viewModel.model.outputs.length) {
                return this.renderNoop(viewModel, container);
            }
            if (!preferredMimeType || !this._richMimeTypeRenderers.has(preferredMimeType)) {
                const contentNode = document.createElement('p');
                const mimeTypes = viewModel.model.outputs.map(op => op.mime);
                const mimeTypesMessage = mimeTypes.join(', ');
                if (preferredMimeType) {
                    contentNode.innerText = `No renderer could be found for MIME type: ${preferredMimeType}`;
                }
                else {
                    contentNode.innerText = `No renderer could be found for output. It has the following MIME types: ${mimeTypesMessage}`;
                }
                container.appendChild(contentNode);
                return { type: 0 /* Mainframe */ };
            }
            const renderer = this._richMimeTypeRenderers.get(preferredMimeType);
            const items = viewModel.model.outputs.filter(op => op.mime === preferredMimeType);
            if (items.length && renderer) {
                return renderer.render(viewModel, items, container, notebookUri);
            }
            else {
                return this.renderNoop(viewModel, container);
            }
        }
    }
    exports.OutputRenderer = OutputRenderer;
});
//# sourceMappingURL=outputRenderer.js.map