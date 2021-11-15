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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostCustomers", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, lifecycle_1, extHost_protocol_1, extHostCustomers_1, editorGroupsService_1) {
    "use strict";
    var MainThreadEditorTabs_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadEditorTabs = void 0;
    let MainThreadEditorTabs = MainThreadEditorTabs_1 = class MainThreadEditorTabs {
        constructor(extHostContext, _editorGroupsService) {
            this._editorGroupsService = _editorGroupsService;
            this._dispoables = new lifecycle_1.DisposableStore();
            this._groups = new Map();
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostEditorTabs);
            this._editorGroupsService.groups.forEach(this._subscribeToGroup, this);
            this._dispoables.add(_editorGroupsService.onDidAddGroup(this._subscribeToGroup, this));
            this._dispoables.add(_editorGroupsService.onDidRemoveGroup(e => {
                const subscription = this._groups.get(e);
                if (subscription) {
                    subscription.dispose();
                    this._groups.delete(e);
                    this._pushEditorTabs();
                }
            }));
            this._pushEditorTabs();
        }
        dispose() {
            (0, lifecycle_1.dispose)(this._groups.values());
            this._dispoables.dispose();
        }
        _subscribeToGroup(group) {
            var _a;
            (_a = this._groups.get(group)) === null || _a === void 0 ? void 0 : _a.dispose();
            const listener = group.onDidGroupChange(e => {
                if (MainThreadEditorTabs_1._GroupEventFilter.has(e.kind)) {
                    this._pushEditorTabs();
                }
            });
            this._groups.set(group, listener);
        }
        _pushEditorTabs() {
            var _a;
            const tabs = [];
            for (const group of this._editorGroupsService.groups) {
                for (const editor of group.editors) {
                    if (editor.isDisposed() || !editor.resource) {
                        continue;
                    }
                    tabs.push({
                        group: group.id,
                        name: (_a = editor.getTitle(0 /* SHORT */)) !== null && _a !== void 0 ? _a : '',
                        resource: editor.resource
                    });
                }
            }
            this._proxy.$acceptEditorTabs(tabs);
        }
    };
    MainThreadEditorTabs._GroupEventFilter = new Set([3 /* EDITOR_CLOSE */, 2 /* EDITOR_OPEN */]);
    MainThreadEditorTabs = MainThreadEditorTabs_1 = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadEditorTabs),
        __param(1, editorGroupsService_1.IEditorGroupsService)
    ], MainThreadEditorTabs);
    exports.MainThreadEditorTabs = MainThreadEditorTabs;
});
//# sourceMappingURL=mainThreadEditorTabs.js.map