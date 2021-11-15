/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestDialogService = void 0;
    class TestDialogService {
        confirm(_confirmation) { return Promise.resolve({ confirmed: false }); }
        show(_severity, _message, _buttons, _options) { return Promise.resolve({ choice: 0 }); }
        input() { {
            return Promise.resolve({ choice: 0, values: [] });
        } }
        about() { return Promise.resolve(); }
    }
    exports.TestDialogService = TestDialogService;
});
//# sourceMappingURL=testDialogService.js.map