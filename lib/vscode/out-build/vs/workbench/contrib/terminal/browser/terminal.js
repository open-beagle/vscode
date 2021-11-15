/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalConnectionState = exports.Direction = exports.IRemoteTerminalService = exports.ITerminalInstanceService = exports.ITerminalService = void 0;
    exports.ITerminalService = (0, instantiation_1.createDecorator)('terminalService');
    exports.ITerminalInstanceService = (0, instantiation_1.createDecorator)('terminalInstanceService');
    exports.IRemoteTerminalService = (0, instantiation_1.createDecorator)('remoteTerminalService');
    var Direction;
    (function (Direction) {
        Direction[Direction["Left"] = 0] = "Left";
        Direction[Direction["Right"] = 1] = "Right";
        Direction[Direction["Up"] = 2] = "Up";
        Direction[Direction["Down"] = 3] = "Down";
    })(Direction = exports.Direction || (exports.Direction = {}));
    var TerminalConnectionState;
    (function (TerminalConnectionState) {
        TerminalConnectionState[TerminalConnectionState["Connecting"] = 0] = "Connecting";
        TerminalConnectionState[TerminalConnectionState["Connected"] = 1] = "Connected";
    })(TerminalConnectionState = exports.TerminalConnectionState || (exports.TerminalConnectionState = {}));
});
//# sourceMappingURL=terminal.js.map