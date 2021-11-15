/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/workbench/common/dialogs", "vs/platform/instantiation/common/extensions"], function (require, exports, lifecycle_1, dialogs_1, dialogs_2, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DialogService = void 0;
    class DialogService extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this.model = this._register(new dialogs_2.DialogsModel());
        }
        async confirm(confirmation) {
            const handle = this.model.show({ confirmArgs: { confirmation } });
            return await handle.result;
        }
        async show(severity, message, buttons, options) {
            const handle = this.model.show({ showArgs: { severity, message, buttons, options } });
            return await handle.result;
        }
        async input(severity, message, buttons, inputs, options) {
            const handle = this.model.show({ inputArgs: { severity, message, buttons, inputs, options } });
            return await handle.result;
        }
        async about() {
            const handle = this.model.show({});
            await handle.result;
        }
    }
    exports.DialogService = DialogService;
    (0, extensions_1.registerSingleton)(dialogs_1.IDialogService, DialogService, true);
});
//# sourceMappingURL=dialogService.js.map