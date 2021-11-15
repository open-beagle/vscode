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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensions"], function (require, exports, lifecycle_1, workspaceTrust_1, extensionManagement_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionEnablementByWorkspaceTrustRequirement = void 0;
    let ExtensionEnablementByWorkspaceTrustRequirement = class ExtensionEnablementByWorkspaceTrustRequirement extends lifecycle_1.Disposable {
        constructor(workspaceTrustManagementService, extensionService, extensionEnablementService) {
            super();
            this.extensionService = extensionService;
            this.extensionEnablementService = extensionEnablementService;
            this._register(workspaceTrustManagementService.onDidChangeTrust(trusted => this.onDidChangeTrustState(trusted)));
        }
        async onDidChangeTrustState(trusted) {
            if (trusted) {
                // Untrusted -> Trusted
                await this.extensionEnablementService.updateEnablementByWorkspaceTrustRequirement();
            }
            else {
                // Trusted -> Untrusted
                this.extensionService.stopExtensionHosts();
                await this.extensionEnablementService.updateEnablementByWorkspaceTrustRequirement();
                this.extensionService.startExtensionHosts();
            }
        }
    };
    ExtensionEnablementByWorkspaceTrustRequirement = __decorate([
        __param(0, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(1, extensions_1.IExtensionService),
        __param(2, extensionManagement_1.IWorkbenchExtensionEnablementService)
    ], ExtensionEnablementByWorkspaceTrustRequirement);
    exports.ExtensionEnablementByWorkspaceTrustRequirement = ExtensionEnablementByWorkspaceTrustRequirement;
});
//# sourceMappingURL=extensionEnablementByWorkspaceTrustRequirement.js.map