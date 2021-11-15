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
define(["require", "exports", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/common/extensions", "vs/platform/theme/common/themeService", "vs/workbench/services/extensions/common/extensions", "vs/platform/contextview/browser/contextView", "vs/platform/notification/common/notification", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/platform/label/common/label", "vs/workbench/services/environment/common/environmentService", "vs/workbench/contrib/extensions/browser/abstractRuntimeExtensionsEditor"], function (require, exports, telemetry_1, instantiation_1, extensions_1, themeService_1, extensions_2, contextView_1, notification_1, contextkey_1, storage_1, label_1, environmentService_1, abstractRuntimeExtensionsEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RuntimeExtensionsEditor = void 0;
    let RuntimeExtensionsEditor = class RuntimeExtensionsEditor extends abstractRuntimeExtensionsEditor_1.AbstractRuntimeExtensionsEditor {
        constructor(telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService) {
            super(telemetryService, themeService, contextKeyService, extensionsWorkbenchService, extensionService, notificationService, contextMenuService, instantiationService, storageService, labelService, environmentService);
        }
        _getProfileInfo() {
            return null;
        }
        _getUnresponsiveProfile(extensionId) {
            return undefined;
        }
        _createSlowExtensionAction(element) {
            return null;
        }
        _createReportExtensionIssueAction(element) {
            return null;
        }
        _createSaveExtensionHostProfileAction() {
            return null;
        }
        _createProfileAction() {
            return null;
        }
    };
    RuntimeExtensionsEditor = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, extensions_1.IExtensionsWorkbenchService),
        __param(4, extensions_2.IExtensionService),
        __param(5, notification_1.INotificationService),
        __param(6, contextView_1.IContextMenuService),
        __param(7, instantiation_1.IInstantiationService),
        __param(8, storage_1.IStorageService),
        __param(9, label_1.ILabelService),
        __param(10, environmentService_1.IWorkbenchEnvironmentService)
    ], RuntimeExtensionsEditor);
    exports.RuntimeExtensionsEditor = RuntimeExtensionsEditor;
});
//# sourceMappingURL=browserRuntimeExtensionsEditor.js.map