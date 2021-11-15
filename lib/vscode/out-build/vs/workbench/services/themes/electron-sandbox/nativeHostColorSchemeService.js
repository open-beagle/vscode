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
define(["require", "exports", "vs/base/common/event", "vs/platform/native/electron-sandbox/native", "vs/platform/instantiation/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/base/common/lifecycle", "vs/workbench/services/themes/common/hostColorSchemeService"], function (require, exports, event_1, native_1, extensions_1, environmentService_1, lifecycle_1, hostColorSchemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeHostColorSchemeService = void 0;
    let NativeHostColorSchemeService = class NativeHostColorSchemeService extends lifecycle_1.Disposable {
        constructor(nativeHostService, environmentService) {
            super();
            this.nativeHostService = nativeHostService;
            this.environmentService = environmentService;
            this._onDidChangeColorScheme = this._register(new event_1.Emitter());
            this.onDidChangeColorScheme = this._onDidChangeColorScheme.event;
            this.dark = this.environmentService.configuration.colorScheme.dark;
            this.highContrast = this.environmentService.configuration.colorScheme.highContrast;
            this.registerListeners();
        }
        registerListeners() {
            // Color Scheme
            this._register(this.nativeHostService.onDidChangeColorScheme(({ highContrast, dark }) => {
                this.dark = dark;
                this.highContrast = highContrast;
                this._onDidChangeColorScheme.fire();
            }));
        }
    };
    NativeHostColorSchemeService = __decorate([
        __param(0, native_1.INativeHostService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService)
    ], NativeHostColorSchemeService);
    exports.NativeHostColorSchemeService = NativeHostColorSchemeService;
    (0, extensions_1.registerSingleton)(hostColorSchemeService_1.IHostColorSchemeService, NativeHostColorSchemeService, true);
});
//# sourceMappingURL=nativeHostColorSchemeService.js.map