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
define(["require", "exports", "vs/editor/common/services/modelService", "vs/platform/files/common/files", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/search/common/search", "vs/workbench/services/search/common/searchService", "vs/workbench/services/uriIdentity/common/uriIdentity"], function (require, exports, modelService_1, files_1, extensions_1, log_1, telemetry_1, editorService_1, extensions_2, search_1, searchService_1, uriIdentity_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteSearchService = void 0;
    let RemoteSearchService = class RemoteSearchService extends searchService_1.SearchService {
        constructor(modelService, editorService, telemetryService, logService, extensionService, fileService, uriIdentityService) {
            super(modelService, editorService, telemetryService, logService, extensionService, fileService, uriIdentityService);
        }
    };
    RemoteSearchService = __decorate([
        __param(0, modelService_1.IModelService),
        __param(1, editorService_1.IEditorService),
        __param(2, telemetry_1.ITelemetryService),
        __param(3, log_1.ILogService),
        __param(4, extensions_2.IExtensionService),
        __param(5, files_1.IFileService),
        __param(6, uriIdentity_1.IUriIdentityService)
    ], RemoteSearchService);
    exports.RemoteSearchService = RemoteSearchService;
    (0, extensions_1.registerSingleton)(search_1.ISearchService, RemoteSearchService, true);
});
//# sourceMappingURL=searchService.js.map