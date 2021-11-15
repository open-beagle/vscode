/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/base/common/event"], function (require, exports, uri_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostEditorTabs = void 0;
    class ExtHostEditorTabs {
        constructor() {
            this._onDidChangeTabs = new event_1.Emitter();
            this.onDidChangeTabs = this._onDidChangeTabs.event;
            this._tabs = [];
        }
        get tabs() {
            return this._tabs;
        }
        $acceptEditorTabs(tabs) {
            this._tabs = tabs.map(dto => {
                return {
                    name: dto.name,
                    group: dto.group,
                    resource: uri_1.URI.revive(dto.resource)
                };
            });
            this._onDidChangeTabs.fire();
        }
    }
    exports.ExtHostEditorTabs = ExtHostEditorTabs;
});
//# sourceMappingURL=extHostEditorTabs.js.map