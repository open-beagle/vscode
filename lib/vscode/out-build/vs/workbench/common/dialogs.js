/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DialogsModel = void 0;
    class DialogsModel extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this.dialogs = [];
            this._onDidShowDialog = this._register(new event_1.Emitter());
            this.onDidShowDialog = this._onDidShowDialog.event;
        }
        show(dialog) {
            let resolver;
            const item = {
                args: dialog,
                close: (result) => { this.dialogs.splice(0, 1); resolver(result); }
            };
            this.dialogs.push(item);
            this._onDidShowDialog.fire();
            return {
                item,
                result: new Promise(resolve => { resolver = resolve; })
            };
        }
    }
    exports.DialogsModel = DialogsModel;
});
//# sourceMappingURL=dialogs.js.map