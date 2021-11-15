/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WindowDriverRegistryChannelClient = exports.WindowDriverChannelClient = exports.WindowDriverChannel = void 0;
    class WindowDriverChannel {
        constructor(driver) {
            this.driver = driver;
        }
        listen(_, event) {
            throw new Error(`No event found: ${event}`);
        }
        call(_, command, arg) {
            switch (command) {
                case 'click': return this.driver.click(arg[0], arg[1], arg[2]);
                case 'doubleClick': return this.driver.doubleClick(arg);
                case 'setValue': return this.driver.setValue(arg[0], arg[1]);
                case 'getTitle': return this.driver.getTitle();
                case 'isActiveElement': return this.driver.isActiveElement(arg);
                case 'getElements': return this.driver.getElements(arg[0], arg[1]);
                case 'getElementXY': return this.driver.getElementXY(arg[0], arg[1], arg[2]);
                case 'typeInEditor': return this.driver.typeInEditor(arg[0], arg[1]);
                case 'getTerminalBuffer': return this.driver.getTerminalBuffer(arg);
                case 'writeInTerminal': return this.driver.writeInTerminal(arg[0], arg[1]);
            }
            throw new Error(`Call not found: ${command}`);
        }
    }
    exports.WindowDriverChannel = WindowDriverChannel;
    class WindowDriverChannelClient {
        constructor(channel) {
            this.channel = channel;
        }
        click(selector, xoffset, yoffset) {
            return this.channel.call('click', [selector, xoffset, yoffset]);
        }
        doubleClick(selector) {
            return this.channel.call('doubleClick', selector);
        }
        setValue(selector, text) {
            return this.channel.call('setValue', [selector, text]);
        }
        getTitle() {
            return this.channel.call('getTitle');
        }
        isActiveElement(selector) {
            return this.channel.call('isActiveElement', selector);
        }
        getElements(selector, recursive) {
            return this.channel.call('getElements', [selector, recursive]);
        }
        getElementXY(selector, xoffset, yoffset) {
            return this.channel.call('getElementXY', [selector, xoffset, yoffset]);
        }
        typeInEditor(selector, text) {
            return this.channel.call('typeInEditor', [selector, text]);
        }
        getTerminalBuffer(selector) {
            return this.channel.call('getTerminalBuffer', selector);
        }
        writeInTerminal(selector, text) {
            return this.channel.call('writeInTerminal', [selector, text]);
        }
    }
    exports.WindowDriverChannelClient = WindowDriverChannelClient;
    class WindowDriverRegistryChannelClient {
        constructor(channel) {
            this.channel = channel;
        }
        registerWindowDriver(windowId) {
            return this.channel.call('registerWindowDriver', windowId);
        }
        reloadWindowDriver(windowId) {
            return this.channel.call('reloadWindowDriver', windowId);
        }
    }
    exports.WindowDriverRegistryChannelClient = WindowDriverRegistryChannelClient;
});
//# sourceMappingURL=driverIpc.js.map