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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/localizations/common/localizations"], function (require, exports, lifecycle_1, localizations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalizationsUpdater = void 0;
    let LocalizationsUpdater = class LocalizationsUpdater extends lifecycle_1.Disposable {
        constructor(localizationsService) {
            super();
            this.localizationsService = localizationsService;
            this.updateLocalizations();
        }
        updateLocalizations() {
            this.localizationsService.update();
        }
    };
    LocalizationsUpdater = __decorate([
        __param(0, localizations_1.ILocalizationsService)
    ], LocalizationsUpdater);
    exports.LocalizationsUpdater = LocalizationsUpdater;
});
//# sourceMappingURL=localizationsUpdater.js.map