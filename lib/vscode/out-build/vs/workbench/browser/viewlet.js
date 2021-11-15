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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/browser/composite", "vs/platform/instantiation/common/instantiation", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/layout/browser/layoutService", "vs/platform/theme/common/themeService", "vs/platform/storage/common/storage", "vs/platform/contextview/browser/contextView", "vs/workbench/services/extensions/common/extensions", "vs/platform/workspace/common/workspace", "vs/platform/configuration/common/configuration", "vs/workbench/browser/panecomposite"], function (require, exports, platform_1, composite_1, instantiation_1, telemetry_1, layoutService_1, themeService_1, storage_1, contextView_1, extensions_1, workspace_1, configuration_1, panecomposite_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewletRegistry = exports.Extensions = exports.ViewletDescriptor = exports.Viewlet = void 0;
    let Viewlet = class Viewlet extends panecomposite_1.PaneComposite {
        constructor(id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService, layoutService, configurationService) {
            super(id, telemetryService, storageService, instantiationService, themeService, contextMenuService, extensionService, contextService);
            this.layoutService = layoutService;
            this.configurationService = configurationService;
        }
    };
    Viewlet = __decorate([
        __param(1, telemetry_1.ITelemetryService),
        __param(2, storage_1.IStorageService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, themeService_1.IThemeService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, extensions_1.IExtensionService),
        __param(7, workspace_1.IWorkspaceContextService),
        __param(8, layoutService_1.IWorkbenchLayoutService),
        __param(9, configuration_1.IConfigurationService)
    ], Viewlet);
    exports.Viewlet = Viewlet;
    /**
     * A viewlet descriptor is a leightweight descriptor of a viewlet in the workbench.
     */
    class ViewletDescriptor extends composite_1.CompositeDescriptor {
        constructor(ctor, id, name, cssClass, order, requestedIndex, iconUrl) {
            super(ctor, id, name, cssClass, order, requestedIndex);
            this.iconUrl = iconUrl;
        }
        static create(ctor, id, name, cssClass, order, requestedIndex, iconUrl) {
            return new ViewletDescriptor(ctor, id, name, cssClass, order, requestedIndex, iconUrl);
        }
    }
    exports.ViewletDescriptor = ViewletDescriptor;
    exports.Extensions = {
        Viewlets: 'workbench.contributions.viewlets'
    };
    class ViewletRegistry extends composite_1.CompositeRegistry {
        /**
         * Registers a viewlet to the platform.
         */
        registerViewlet(descriptor) {
            super.registerComposite(descriptor);
        }
        /**
         * Deregisters a viewlet to the platform.
         */
        deregisterViewlet(id) {
            super.deregisterComposite(id);
        }
        /**
         * Returns the viewlet descriptor for the given id or null if none.
         */
        getViewlet(id) {
            return this.getComposite(id);
        }
        /**
         * Returns an array of registered viewlets known to the platform.
         */
        getViewlets() {
            return this.getComposites();
        }
    }
    exports.ViewletRegistry = ViewletRegistry;
    platform_1.Registry.add(exports.Extensions.Viewlets, new ViewletRegistry());
});
//# sourceMappingURL=viewlet.js.map