/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/editor", "vs/workbench/common/editor", "vs/platform/registry/common/platform", "vs/workbench/browser/parts/editor/editorPane", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/common/async", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/workbench/services/workingCopy/common/workingCopyService"], function (require, exports, nls_1, editor_1, platform_1, editorPane_1, arrays_1, lifecycle_1, async_1, editorService_1, uriIdentity_1, workingCopyService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeEditorAriaLabel = exports.whenEditorClosed = exports.EditorDescriptor = void 0;
    /**
     * A lightweight descriptor of an editor. The descriptor is deferred so that heavy editors
     * can load lazily in the workbench.
     */
    class EditorDescriptor {
        constructor(ctor, id, name) {
            this.ctor = ctor;
            this.id = id;
            this.name = name;
        }
        static create(ctor, id, name) {
            return new EditorDescriptor(ctor, id, name);
        }
        instantiate(instantiationService) {
            return instantiationService.createInstance(this.ctor);
        }
        getId() {
            return this.id;
        }
        getName() {
            return this.name;
        }
        describes(obj) {
            return obj instanceof editorPane_1.EditorPane && obj.getId() === this.id;
        }
    }
    exports.EditorDescriptor = EditorDescriptor;
    class EditorRegistry {
        constructor() {
            this.editors = [];
            this.mapEditorToInputs = new Map();
        }
        registerEditor(descriptor, inputDescriptors) {
            this.mapEditorToInputs.set(descriptor, inputDescriptors);
            const remove = (0, arrays_1.insert)(this.editors, descriptor);
            return (0, lifecycle_1.toDisposable)(() => {
                this.mapEditorToInputs.delete(descriptor);
                remove();
            });
        }
        getEditor(input) {
            const findEditorDescriptors = (input, byInstanceOf) => {
                const matchingDescriptors = [];
                for (const editor of this.editors) {
                    const inputDescriptors = this.mapEditorToInputs.get(editor) || [];
                    for (const inputDescriptor of inputDescriptors) {
                        const inputClass = inputDescriptor.ctor;
                        // Direct check on constructor type (ignores prototype chain)
                        if (!byInstanceOf && input.constructor === inputClass) {
                            matchingDescriptors.push(editor);
                            break;
                        }
                        // Normal instanceof check
                        else if (byInstanceOf && input instanceof inputClass) {
                            matchingDescriptors.push(editor);
                            break;
                        }
                    }
                }
                // If no descriptors found, continue search using instanceof and prototype chain
                if (!byInstanceOf && matchingDescriptors.length === 0) {
                    return findEditorDescriptors(input, true);
                }
                if (byInstanceOf) {
                    return matchingDescriptors;
                }
                return matchingDescriptors;
            };
            const descriptors = findEditorDescriptors(input);
            if (descriptors.length > 0) {
                // Ask the input for its preferred Editor
                const preferredEditorId = input.getPreferredEditorId(descriptors.map(descriptor => descriptor.getId()));
                if (preferredEditorId) {
                    return this.getEditorById(preferredEditorId);
                }
                // Otherwise, first come first serve
                return descriptors[0];
            }
            return undefined;
        }
        getEditorById(editorId) {
            return this.editors.find(editor => editor.getId() === editorId);
        }
        getEditors() {
            return this.editors.slice(0);
        }
        getEditorInputs() {
            const inputClasses = [];
            for (const editor of this.editors) {
                const editorInputDescriptors = this.mapEditorToInputs.get(editor);
                if (editorInputDescriptors) {
                    inputClasses.push(...editorInputDescriptors.map(descriptor => descriptor.ctor));
                }
            }
            return inputClasses;
        }
    }
    platform_1.Registry.add(editor_1.EditorExtensions.Editors, new EditorRegistry());
    //#endregion
    //#region Editor Close Tracker
    function whenEditorClosed(accessor, resources) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const uriIdentityService = accessor.get(uriIdentity_1.IUriIdentityService);
        const workingCopyService = accessor.get(workingCopyService_1.IWorkingCopyService);
        return new Promise(resolve => {
            let remainingResources = [...resources];
            // Observe any editor closing from this moment on
            const listener = editorService.onDidCloseEditor(async (event) => {
                const primaryResource = editor_1.EditorResourceAccessor.getOriginalUri(event.editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
                const secondaryResource = editor_1.EditorResourceAccessor.getOriginalUri(event.editor, { supportSideBySide: editor_1.SideBySideEditor.SECONDARY });
                // Remove from resources to wait for being closed based on the
                // resources from editors that got closed
                remainingResources = remainingResources.filter(resource => {
                    if (uriIdentityService.extUri.isEqual(resource, primaryResource) || uriIdentityService.extUri.isEqual(resource, secondaryResource)) {
                        return false; // remove - the closing editor matches this resource
                    }
                    return true; // keep - not yet closed
                });
                // All resources to wait for being closed are closed
                if (remainingResources.length === 0) {
                    // If auto save is configured with the default delay (1s) it is possible
                    // to close the editor while the save still continues in the background. As such
                    // we have to also check if the editors to track for are dirty and if so wait
                    // for them to get saved.
                    const dirtyResources = resources.filter(resource => workingCopyService.isDirty(resource));
                    if (dirtyResources.length > 0) {
                        await async_1.Promises.settled(dirtyResources.map(async (resource) => await new Promise(resolve => {
                            if (!workingCopyService.isDirty(resource)) {
                                return resolve(); // return early if resource is not dirty
                            }
                            // Otherwise resolve promise when resource is saved
                            const listener = workingCopyService.onDidChangeDirty(workingCopy => {
                                if (!workingCopy.isDirty() && uriIdentityService.extUri.isEqual(resource, workingCopy.resource)) {
                                    listener.dispose();
                                    return resolve();
                                }
                            });
                        })));
                    }
                    listener.dispose();
                    return resolve();
                }
            });
        });
    }
    exports.whenEditorClosed = whenEditorClosed;
    //#endregion
    //#region ARIA
    function computeEditorAriaLabel(input, index, group, groupCount) {
        let ariaLabel = input.getAriaLabel();
        if (group && !group.isPinned(input)) {
            ariaLabel = (0, nls_1.localize)(0, null, ariaLabel);
        }
        if (group === null || group === void 0 ? void 0 : group.isSticky(index !== null && index !== void 0 ? index : input)) {
            ariaLabel = (0, nls_1.localize)(1, null, ariaLabel);
        }
        // Apply group information to help identify in
        // which group we are (only if more than one group
        // is actually opened)
        if (group && groupCount > 1) {
            ariaLabel = `${ariaLabel}, ${group.ariaLabel}`;
        }
        return ariaLabel;
    }
    exports.computeEditorAriaLabel = computeEditorAriaLabel;
});
//#endregion
//# sourceMappingURL=editor.js.map