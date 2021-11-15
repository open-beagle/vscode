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
define(["require", "exports", "vs/base/common/event", "vs/platform/instantiation/common/extensions", "vs/base/common/lifecycle", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/themes/common/hostColorSchemeService"], function (require, exports, event_1, extensions_1, lifecycle_1, environmentService_1, hostColorSchemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserHostColorSchemeService = void 0;
    let BrowserHostColorSchemeService = class BrowserHostColorSchemeService extends lifecycle_1.Disposable {
        constructor(environmentService) {
            super();
            this.environmentService = environmentService;
            this._onDidSchemeChangeEvent = this._register(new event_1.Emitter());
            this.registerListeners();
        }
        registerListeners() {
            window.matchMedia('(prefers-color-scheme: dark)').addListener(() => {
                this._onDidSchemeChangeEvent.fire();
            });
            window.matchMedia('(forced-colors: active)').addListener(() => {
                this._onDidSchemeChangeEvent.fire();
            });
        }
        get onDidChangeColorScheme() {
            return this._onDidSchemeChangeEvent.event;
        }
        get dark() {
            if (window.matchMedia(`(prefers-color-scheme: light)`).matches) {
                return false;
            }
            else if (window.matchMedia(`(prefers-color-scheme: dark)`).matches) {
                return true;
            }
            return this.environmentService.configuration.colorScheme.dark;
        }
        get highContrast() {
            if (window.matchMedia(`(forced-colors: active)`).matches) {
                return true;
            }
            return this.environmentService.configuration.colorScheme.highContrast;
        }
    };
    BrowserHostColorSchemeService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService)
    ], BrowserHostColorSchemeService);
    exports.BrowserHostColorSchemeService = BrowserHostColorSchemeService;
    (0, extensions_1.registerSingleton)(hostColorSchemeService_1.IHostColorSchemeService, BrowserHostColorSchemeService, true);
});
//# sourceMappingURL=browserHostColorSchemeService.js.map