/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatMessageForTerminal = void 0;
    /**
     * Formats a message from the product to be written to the terminal.
     */
    function formatMessageForTerminal(message, excludeLeadingNewLine = false) {
        // Wrap in bold and ensure it's on a new line
        return `${excludeLeadingNewLine ? '' : '\r\n'}\x1b[1m${message}\x1b[0m\n\r`;
    }
    exports.formatMessageForTerminal = formatMessageForTerminal;
});
//# sourceMappingURL=terminalStrings.js.map