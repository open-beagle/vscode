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
define(["require", "exports", "vs/workbench/common/contributions", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/contrib/configExporter/electron-sandbox/configurationExportHelper"], function (require, exports, contributions_1, platform_1, instantiation_1, environmentService_1, configurationExportHelper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionPoints = void 0;
    let ExtensionPoints = class ExtensionPoints {
        constructor(instantiationService, environmentService) {
            // Config Exporter
            if (environmentService.args['export-default-configuration']) {
                instantiationService.createInstance(configurationExportHelper_1.DefaultConfigurationExportHelper);
            }
        }
    };
    ExtensionPoints = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, environmentService_1.INativeWorkbenchEnvironmentService)
    ], ExtensionPoints);
    exports.ExtensionPoints = ExtensionPoints;
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(ExtensionPoints, 3 /* Restored */);
});
//# sourceMappingURL=configurationExportHelper.contribution.js.map