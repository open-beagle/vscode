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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/driver/common/driverIpc", "vs/platform/instantiation/common/instantiation", "vs/platform/ipc/electron-sandbox/services", "vs/base/common/async", "vs/platform/driver/browser/baseDriver", "vs/platform/native/electron-sandbox/native"], function (require, exports, lifecycle_1, driverIpc_1, instantiation_1, services_1, async_1, baseDriver_1, native_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerWindowDriver = void 0;
    let WindowDriver = class WindowDriver extends baseDriver_1.BaseWindowDriver {
        constructor(nativeHostService) {
            super();
            this.nativeHostService = nativeHostService;
        }
        click(selector, xoffset, yoffset) {
            const offset = typeof xoffset === 'number' && typeof yoffset === 'number' ? { x: xoffset, y: yoffset } : undefined;
            return this._click(selector, 1, offset);
        }
        doubleClick(selector) {
            return this._click(selector, 2);
        }
        async _click(selector, clickCount, offset) {
            const { x, y } = await this._getElementXY(selector, offset);
            await this.nativeHostService.sendInputEvent({ type: 'mouseDown', x, y, button: 'left', clickCount });
            await (0, async_1.timeout)(10);
            await this.nativeHostService.sendInputEvent({ type: 'mouseUp', x, y, button: 'left', clickCount });
            await (0, async_1.timeout)(100);
        }
        async openDevTools() {
            await this.nativeHostService.openDevTools({ mode: 'detach' });
        }
    };
    WindowDriver = __decorate([
        __param(0, native_1.INativeHostService)
    ], WindowDriver);
    async function registerWindowDriver(accessor, windowId) {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const mainProcessService = accessor.get(services_1.IMainProcessService);
        const windowDriver = instantiationService.createInstance(WindowDriver);
        const windowDriverChannel = new driverIpc_1.WindowDriverChannel(windowDriver);
        mainProcessService.registerChannel('windowDriver', windowDriverChannel);
        const windowDriverRegistryChannel = mainProcessService.getChannel('windowDriverRegistry');
        const windowDriverRegistry = new driverIpc_1.WindowDriverRegistryChannelClient(windowDriverRegistryChannel);
        await windowDriverRegistry.registerWindowDriver(windowId);
        // const options = await windowDriverRegistry.registerWindowDriver(windowId);
        // if (options.verbose) {
        // 	windowDriver.openDevTools();
        // }
        return (0, lifecycle_1.toDisposable)(() => windowDriverRegistry.reloadWindowDriver(windowId));
    }
    exports.registerWindowDriver = registerWindowDriver;
});
//# sourceMappingURL=driver.js.map