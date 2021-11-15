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
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcome/walkThrough/browser/editor/editorWalkThrough", "vs/workbench/services/editor/common/editorService", "vs/base/common/actions", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/welcome/walkThrough/browser/walkThroughInput", "vs/base/common/network", "vs/platform/editor/common/editor", "vs/workbench/contrib/welcome/walkThrough/browser/editor/vs_code_editor_walkthrough"], function (require, exports, nls_1, editorService_1, actions_1, instantiation_1, walkThroughInput_1, network_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorWalkThroughInputSerializer = exports.EditorWalkThroughAction = void 0;
    const typeId = 'workbench.editors.walkThroughInput';
    const inputOptions = {
        typeId,
        name: (0, nls_1.localize)(0, null),
        resource: network_1.FileAccess.asBrowserUri('./vs_code_editor_walkthrough.md', require)
            .with({
            scheme: network_1.Schemas.walkThrough,
            query: JSON.stringify({ moduleId: 'vs/workbench/contrib/welcome/walkThrough/browser/editor/vs_code_editor_walkthrough' })
        }),
        telemetryFrom: 'walkThrough'
    };
    let EditorWalkThroughAction = class EditorWalkThroughAction extends actions_1.Action {
        constructor(id, label, editorService, instantiationService) {
            super(id, label);
            this.editorService = editorService;
            this.instantiationService = instantiationService;
        }
        run() {
            const input = this.instantiationService.createInstance(walkThroughInput_1.WalkThroughInput, inputOptions);
            return this.editorService.openEditor(input, { pinned: true, override: editor_1.EditorOverride.DISABLED })
                .then(() => void (0));
        }
    };
    EditorWalkThroughAction.ID = 'workbench.action.showInteractivePlayground';
    EditorWalkThroughAction.LABEL = (0, nls_1.localize)(1, null);
    EditorWalkThroughAction = __decorate([
        __param(2, editorService_1.IEditorService),
        __param(3, instantiation_1.IInstantiationService)
    ], EditorWalkThroughAction);
    exports.EditorWalkThroughAction = EditorWalkThroughAction;
    class EditorWalkThroughInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            return '{}';
        }
        deserialize(instantiationService, serializedEditorInput) {
            return instantiationService.createInstance(walkThroughInput_1.WalkThroughInput, inputOptions);
        }
    }
    exports.EditorWalkThroughInputSerializer = EditorWalkThroughInputSerializer;
    EditorWalkThroughInputSerializer.ID = typeId;
});
//# sourceMappingURL=editorWalkThrough.js.map