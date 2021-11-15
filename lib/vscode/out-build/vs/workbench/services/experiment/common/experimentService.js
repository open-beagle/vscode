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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/platform", "vs/workbench/common/memento", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/platform/instantiation/common/extensions", "vs/platform/configuration/common/configuration", "vs/platform/product/common/productService"], function (require, exports, instantiation_1, platform, memento_1, telemetry_1, storage_1, extensions_1, configuration_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExperimentService = exports.ITASExperimentService = void 0;
    exports.ITASExperimentService = (0, instantiation_1.createDecorator)('TASExperimentService');
    const storageKey = 'VSCode.ABExp.FeatureData';
    const refetchInterval = 0; // no polling
    class MementoKeyValueStorage {
        constructor(memento) {
            this.memento = memento;
            this.mementoObj = memento.getMemento(0 /* GLOBAL */, 1 /* MACHINE */);
        }
        async getValue(key, defaultValue) {
            const value = await this.mementoObj[key];
            return value || defaultValue;
        }
        setValue(key, value) {
            this.mementoObj[key] = value;
            this.memento.saveMemento();
        }
    }
    class ExperimentServiceTelemetry {
        constructor(telemetryService, productService) {
            this.telemetryService = telemetryService;
            this.productService = productService;
        }
        get assignmentContext() {
            var _a;
            return (_a = this._lastAssignmentContext) === null || _a === void 0 ? void 0 : _a.split(';');
        }
        // __GDPR__COMMON__ "VSCode.ABExp.Features" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        // __GDPR__COMMON__ "abexp.assignmentcontext" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
        setSharedProperty(name, value) {
            var _a;
            if (name === ((_a = this.productService.tasConfig) === null || _a === void 0 ? void 0 : _a.assignmentContextTelemetryPropertyName)) {
                this._lastAssignmentContext = value;
            }
            this.telemetryService.setExperimentProperty(name, value);
        }
        postEvent(eventName, props) {
            const data = {};
            for (const [key, value] of props.entries()) {
                data[key] = value;
            }
            /* __GDPR__
                "query-expfeature" : {
                    "ABExp.queriedFeature": { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
                }
            */
            this.telemetryService.publicLog(eventName, data);
        }
    }
    class ExperimentServiceFilterProvider {
        constructor(version, appName, machineId, targetPopulation) {
            this.version = version;
            this.appName = appName;
            this.machineId = machineId;
            this.targetPopulation = targetPopulation;
        }
        getFilterValue(filter) {
            switch (filter) {
                case Filters.ApplicationVersion:
                    return this.version; // productService.version
                case Filters.Build:
                    return this.appName; // productService.nameLong
                case Filters.ClientId:
                    return this.machineId;
                case Filters.Language:
                    return platform.language;
                case Filters.ExtensionName:
                    return 'vscode-core'; // always return vscode-core for exp service
                case Filters.TargetPopulation:
                    return this.targetPopulation;
                default:
                    return '';
            }
        }
        getFilters() {
            let filters = new Map();
            let filterValues = Object.values(Filters);
            for (let value of filterValues) {
                filters.set(value, this.getFilterValue(value));
            }
            return filters;
        }
    }
    /*
    Based upon the official VSCode currently existing filters in the
    ExP backend for the VSCode cluster.
    https://experimentation.visualstudio.com/Analysis%20and%20Experimentation/_git/AnE.ExP.TAS.TachyonHost.Configuration?path=%2FConfigurations%2Fvscode%2Fvscode.json&version=GBmaster
    "X-MSEdge-Market": "detection.market",
    "X-FD-Corpnet": "detection.corpnet",
    "X-VSCode–AppVersion": "appversion",
    "X-VSCode-Build": "build",
    "X-MSEdge-ClientId": "clientid",
    "X-VSCode-ExtensionName": "extensionname",
    "X-VSCode-TargetPopulation": "targetpopulation",
    "X-VSCode-Language": "language"
    */
    var Filters;
    (function (Filters) {
        /**
         * The market in which the extension is distributed.
         */
        Filters["Market"] = "X-MSEdge-Market";
        /**
         * The corporation network.
         */
        Filters["CorpNet"] = "X-FD-Corpnet";
        /**
         * Version of the application which uses experimentation service.
         */
        Filters["ApplicationVersion"] = "X-VSCode-AppVersion";
        /**
         * Insiders vs Stable.
         */
        Filters["Build"] = "X-VSCode-Build";
        /**
         * Client Id which is used as primary unit for the experimentation.
         */
        Filters["ClientId"] = "X-MSEdge-ClientId";
        /**
         * Extension header.
         */
        Filters["ExtensionName"] = "X-VSCode-ExtensionName";
        /**
         * The language in use by VS Code
         */
        Filters["Language"] = "X-VSCode-Language";
        /**
         * The target population.
         * This is used to separate internal, early preview, GA, etc.
         */
        Filters["TargetPopulation"] = "X-VSCode-TargetPopulation";
    })(Filters || (Filters = {}));
    var TargetPopulation;
    (function (TargetPopulation) {
        TargetPopulation["Team"] = "team";
        TargetPopulation["Internal"] = "internal";
        TargetPopulation["Insiders"] = "insider";
        TargetPopulation["Public"] = "public";
    })(TargetPopulation || (TargetPopulation = {}));
    let ExperimentService = class ExperimentService {
        constructor(telemetryService, storageService, configurationService, productService) {
            var _a;
            this.telemetryService = telemetryService;
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.productService = productService;
            this.networkInitialized = false;
            if (productService.tasConfig && this.experimentsEnabled && this.telemetryService.isOptedIn) {
                this.tasClient = this.setupTASClient();
            }
            // For development purposes, configure the delay until tas local tas treatment ovverrides are available
            const overrideDelay = (_a = this.configurationService.getValue('experiments.overrideDelay')) !== null && _a !== void 0 ? _a : 0;
            this.overrideInitDelay = new Promise(resolve => setTimeout(resolve, overrideDelay));
        }
        get experimentsEnabled() {
            return this.configurationService.getValue('workbench.enableExperiments') === true;
        }
        async getTreatment(name) {
            // For development purposes, allow overriding tas assignments to test variants locally.
            await this.overrideInitDelay;
            const override = this.configurationService.getValue('experiments.override.' + name);
            if (override !== undefined) {
                this.telemetryService.publicLog2('tasClientOverrideTreatment', { treatmentName: name, });
                return override;
            }
            const startSetup = Date.now();
            if (!this.tasClient) {
                return undefined;
            }
            if (!this.experimentsEnabled) {
                return undefined;
            }
            let result;
            const client = await this.tasClient;
            if (this.networkInitialized) {
                result = client.getTreatmentVariable('vscode', name);
            }
            else {
                result = await client.getTreatmentVariableAsync('vscode', name, true);
            }
            this.telemetryService.publicLog2('tasClientReadTreatmentComplete', { readTime: Date.now() - startSetup, treatmentName: name, treatmentValue: JSON.stringify(result) });
            return result;
        }
        async getCurrentExperiments() {
            var _a;
            if (!this.tasClient) {
                return undefined;
            }
            if (!this.experimentsEnabled) {
                return undefined;
            }
            await this.tasClient;
            return (_a = this.telemetry) === null || _a === void 0 ? void 0 : _a.assignmentContext;
        }
        async setupTASClient() {
            const startSetup = Date.now();
            const telemetryInfo = await this.telemetryService.getTelemetryInfo();
            const targetPopulation = telemetryInfo.msftInternal ? TargetPopulation.Internal : (this.productService.quality === 'stable' ? TargetPopulation.Public : TargetPopulation.Insiders);
            const machineId = telemetryInfo.machineId;
            const filterProvider = new ExperimentServiceFilterProvider(this.productService.version, this.productService.nameLong, machineId, targetPopulation);
            const keyValueStorage = new MementoKeyValueStorage(new memento_1.Memento(ExperimentService.MEMENTO_ID, this.storageService));
            this.telemetry = new ExperimentServiceTelemetry(this.telemetryService, this.productService);
            const tasConfig = this.productService.tasConfig;
            const tasClient = new (await new Promise((resolve_1, reject_1) => { require(['tas-client-umd'], resolve_1, reject_1); })).ExperimentationService({
                filterProviders: [filterProvider],
                telemetry: this.telemetry,
                storageKey: storageKey,
                keyValueStorage: keyValueStorage,
                featuresTelemetryPropertyName: tasConfig.featuresTelemetryPropertyName,
                assignmentContextTelemetryPropertyName: tasConfig.assignmentContextTelemetryPropertyName,
                telemetryEventName: tasConfig.telemetryEventName,
                endpoint: tasConfig.endpoint,
                refetchInterval: refetchInterval,
            });
            await tasClient.initializePromise;
            tasClient.initialFetch.then(() => this.networkInitialized = true);
            this.telemetryService.publicLog2('tasClientSetupComplete', { setupTime: Date.now() - startSetup });
            return tasClient;
        }
    };
    ExperimentService.MEMENTO_ID = 'experiment.service.memento';
    ExperimentService = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, storage_1.IStorageService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, productService_1.IProductService)
    ], ExperimentService);
    exports.ExperimentService = ExperimentService;
    (0, extensions_1.registerSingleton)(exports.ITASExperimentService, ExperimentService, false);
});
//# sourceMappingURL=experimentService.js.map