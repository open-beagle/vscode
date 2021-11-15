/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/contrib/files/common/files", "vs/workbench/common/editor", "vs/base/browser/ui/list/listWidget", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/files/common/explorerModel", "vs/base/common/arrays", "vs/base/browser/ui/tree/asyncDataTree", "vs/platform/instantiation/common/instantiation", "vs/base/common/resources"], function (require, exports, uri_1, files_1, editor_1, listWidget_1, editorService_1, explorerModel_1, arrays_1, asyncDataTree_1, instantiation_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOpenEditorsViewMultiSelection = exports.getMultiSelectedResources = exports.getResourceForCommand = exports.IExplorerService = exports.FileEditorInputSerializer = void 0;
    class FileEditorInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            const fileEditorInput = editorInput;
            const resource = fileEditorInput.resource;
            const preferredResource = fileEditorInput.preferredResource;
            const serializedFileEditorInput = {
                resourceJSON: resource.toJSON(),
                preferredResourceJSON: (0, resources_1.isEqual)(resource, preferredResource) ? undefined : preferredResource,
                name: fileEditorInput.getPreferredName(),
                description: fileEditorInput.getPreferredDescription(),
                encoding: fileEditorInput.getEncoding(),
                modeId: fileEditorInput.getPreferredMode() // only using the preferred user associated mode here if available to not store redundant data
            };
            return JSON.stringify(serializedFileEditorInput);
        }
        deserialize(instantiationService, serializedEditorInput) {
            return instantiationService.invokeFunction(accessor => {
                const serializedFileEditorInput = JSON.parse(serializedEditorInput);
                const resource = uri_1.URI.revive(serializedFileEditorInput.resourceJSON);
                const preferredResource = uri_1.URI.revive(serializedFileEditorInput.preferredResourceJSON);
                const name = serializedFileEditorInput.name;
                const description = serializedFileEditorInput.description;
                const encoding = serializedFileEditorInput.encoding;
                const mode = serializedFileEditorInput.modeId;
                const fileEditorInput = accessor.get(editorService_1.IEditorService).createEditorInput({ resource, label: name, description, encoding, mode, forceFile: true });
                if (preferredResource) {
                    fileEditorInput.setPreferredResource(preferredResource);
                }
                return fileEditorInput;
            });
        }
    }
    exports.FileEditorInputSerializer = FileEditorInputSerializer;
    exports.IExplorerService = (0, instantiation_1.createDecorator)('explorerService');
    function getFocus(listService) {
        let list = listService.lastFocusedList;
        if ((list === null || list === void 0 ? void 0 : list.getHTMLElement()) === document.activeElement) {
            let focus;
            if (list instanceof listWidget_1.List) {
                const focused = list.getFocusedElements();
                if (focused.length) {
                    focus = focused[0];
                }
            }
            else if (list instanceof asyncDataTree_1.AsyncDataTree) {
                const focused = list.getFocus();
                if (focused.length) {
                    focus = focused[0];
                }
            }
            return focus;
        }
        return undefined;
    }
    // Commands can get executed from a command palette, from a context menu or from some list using a keybinding
    // To cover all these cases we need to properly compute the resource on which the command is being executed
    function getResourceForCommand(resource, listService, editorService) {
        if (uri_1.URI.isUri(resource)) {
            return resource;
        }
        const focus = getFocus(listService);
        if (focus instanceof explorerModel_1.ExplorerItem) {
            return focus.resource;
        }
        else if (focus instanceof files_1.OpenEditor) {
            return focus.getResource();
        }
        return editor_1.EditorResourceAccessor.getOriginalUri(editorService.activeEditor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
    }
    exports.getResourceForCommand = getResourceForCommand;
    function getMultiSelectedResources(resource, listService, editorService, explorerService) {
        const list = listService.lastFocusedList;
        if ((list === null || list === void 0 ? void 0 : list.getHTMLElement()) === document.activeElement) {
            // Explorer
            if (list instanceof asyncDataTree_1.AsyncDataTree && list.getFocus().every(item => item instanceof explorerModel_1.ExplorerItem)) {
                // Explorer
                const context = explorerService.getContext(true);
                if (context.length) {
                    return context.map(c => c.resource);
                }
            }
            // Open editors view
            if (list instanceof listWidget_1.List) {
                const selection = (0, arrays_1.coalesce)(list.getSelectedElements().filter(s => s instanceof files_1.OpenEditor).map((oe) => oe.getResource()));
                const focusedElements = list.getFocusedElements();
                const focus = focusedElements.length ? focusedElements[0] : undefined;
                let mainUriStr = undefined;
                if (uri_1.URI.isUri(resource)) {
                    mainUriStr = resource.toString();
                }
                else if (focus instanceof files_1.OpenEditor) {
                    const focusedResource = focus.getResource();
                    mainUriStr = focusedResource ? focusedResource.toString() : undefined;
                }
                // We only respect the selection if it contains the main element.
                if (selection.some(s => s.toString() === mainUriStr)) {
                    return selection;
                }
            }
        }
        const result = getResourceForCommand(resource, listService, editorService);
        return !!result ? [result] : [];
    }
    exports.getMultiSelectedResources = getMultiSelectedResources;
    function getOpenEditorsViewMultiSelection(listService, editorGroupService) {
        const list = listService.lastFocusedList;
        if ((list === null || list === void 0 ? void 0 : list.getHTMLElement()) === document.activeElement) {
            // Open editors view
            if (list instanceof listWidget_1.List) {
                const selection = (0, arrays_1.coalesce)(list.getSelectedElements().filter(s => s instanceof files_1.OpenEditor));
                const focusedElements = list.getFocusedElements();
                const focus = focusedElements.length ? focusedElements[0] : undefined;
                let mainEditor = undefined;
                if (focus instanceof files_1.OpenEditor) {
                    mainEditor = focus;
                }
                // We only respect the selection if it contains the main element.
                if (selection.some(s => s === mainEditor)) {
                    return selection;
                }
            }
        }
        return undefined;
    }
    exports.getOpenEditorsViewMultiSelection = getOpenEditorsViewMultiSelection;
});
//# sourceMappingURL=files.js.map