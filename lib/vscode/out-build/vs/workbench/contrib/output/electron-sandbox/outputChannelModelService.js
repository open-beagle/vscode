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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/path", "vs/base/common/resources", "vs/base/common/uri", "vs/base/common/async", "vs/platform/files/common/files", "vs/editor/common/services/modelService", "vs/editor/common/services/modeService", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/workbench/contrib/output/common/outputChannelModel", "vs/workbench/services/environment/common/environmentService", "vs/base/common/date", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/extensions", "vs/base/common/event", "vs/platform/native/electron-sandbox/native", "vs/base/common/buffer"], function (require, exports, instantiation_1, path_1, resources, uri_1, async_1, files_1, modelService_1, modeService_1, lifecycle_1, log_1, outputChannelModel_1, environmentService_1, date_1, telemetry_1, extensions_1, event_1, native_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutputChannelModelService = void 0;
    let OutputChannelBackedByFile = class OutputChannelBackedByFile extends outputChannelModel_1.AbstractFileOutputChannelModel {
        constructor(id, modelUri, mimeType, file, fileService, modelService, modeService, loggerService) {
            super(modelUri, mimeType, file, fileService, modelService, modeService);
            this.appendedMessage = '';
            this.loadingFromFileInProgress = false;
            // Donot rotate to check for the file reset
            this.logger = loggerService.createLogger(this.file, { always: true, donotRotate: true, donotUseFormatters: true });
            const rotatingFilePathDirectory = resources.dirname(this.file);
            this.rotatingFilePath = resources.joinPath(rotatingFilePathDirectory, `${id}.1.log`);
            this._register(fileService.watch(rotatingFilePathDirectory));
            this._register(fileService.onDidFilesChange(e => {
                if (e.contains(this.rotatingFilePath)) {
                    this.resettingDelayer.trigger(() => this.resetModel());
                }
            }));
            this.resettingDelayer = new async_1.ThrottledDelayer(50);
        }
        append(message) {
            // update end offset always as message is read
            this.endOffset = this.endOffset + buffer_1.VSBuffer.fromString(message).byteLength;
            if (this.loadingFromFileInProgress) {
                this.appendedMessage += message;
            }
            else {
                this.write(message);
                if (this.model) {
                    this.appendedMessage += message;
                    if (!this.modelUpdater.isScheduled()) {
                        this.modelUpdater.schedule();
                    }
                }
            }
        }
        clear(till) {
            super.clear(till);
            this.appendedMessage = '';
        }
        loadModel() {
            this.loadingFromFileInProgress = true;
            if (this.modelUpdater.isScheduled()) {
                this.modelUpdater.cancel();
            }
            this.appendedMessage = '';
            return this.loadFile()
                .then(content => {
                if (this.endOffset !== this.startOffset + buffer_1.VSBuffer.fromString(content).byteLength) {
                    // Queue content is not written into the file
                    // Flush it and load file again
                    this.flush();
                    return this.loadFile();
                }
                return content;
            })
                .then(content => {
                if (this.appendedMessage) {
                    this.write(this.appendedMessage);
                    this.appendedMessage = '';
                }
                this.loadingFromFileInProgress = false;
                return this.createModel(content);
            });
        }
        resetModel() {
            this.startOffset = 0;
            this.endOffset = 0;
            if (this.model) {
                return this.loadModel().then(() => undefined);
            }
            return Promise.resolve(undefined);
        }
        loadFile() {
            return this.fileService.readFile(this.file, { position: this.startOffset })
                .then(content => this.appendedMessage ? content.value + this.appendedMessage : content.value.toString());
        }
        updateModel() {
            if (this.model && this.appendedMessage) {
                this.appendToModel(this.appendedMessage);
                this.appendedMessage = '';
            }
        }
        write(content) {
            this.logger.info(content);
        }
        flush() {
            this.logger.flush();
        }
    };
    OutputChannelBackedByFile = __decorate([
        __param(4, files_1.IFileService),
        __param(5, modelService_1.IModelService),
        __param(6, modeService_1.IModeService),
        __param(7, log_1.ILoggerService)
    ], OutputChannelBackedByFile);
    let DelegatedOutputChannelModel = class DelegatedOutputChannelModel extends lifecycle_1.Disposable {
        constructor(id, modelUri, mimeType, outputDir, instantiationService, logService, fileService, telemetryService) {
            super();
            this.instantiationService = instantiationService;
            this.logService = logService;
            this.fileService = fileService;
            this.telemetryService = telemetryService;
            this._onDidAppendedContent = this._register(new event_1.Emitter());
            this.onDidAppendedContent = this._onDidAppendedContent.event;
            this._onDispose = this._register(new event_1.Emitter());
            this.onDispose = this._onDispose.event;
            this.outputChannelModel = this.createOutputChannelModel(id, modelUri, mimeType, outputDir);
        }
        async createOutputChannelModel(id, modelUri, mimeType, outputDirPromise) {
            let outputChannelModel;
            try {
                const outputDir = await outputDirPromise;
                const file = resources.joinPath(outputDir, `${id}.log`);
                // Make sure file exists before creating the channel
                await this.fileService.createFile(file);
                outputChannelModel = this.instantiationService.createInstance(OutputChannelBackedByFile, id, modelUri, mimeType, file);
            }
            catch (e) {
                // Do not crash if spdlog rotating logger cannot be loaded (workaround for https://github.com/microsoft/vscode/issues/47883)
                this.logService.error(e);
                this.telemetryService.publicLog2('output.channel.creation.error');
                outputChannelModel = this.instantiationService.createInstance(outputChannelModel_1.BufferredOutputChannel, modelUri, mimeType);
            }
            this._register(outputChannelModel);
            this._register(outputChannelModel.onDidAppendedContent(() => this._onDidAppendedContent.fire()));
            this._register(outputChannelModel.onDispose(() => this._onDispose.fire()));
            return outputChannelModel;
        }
        append(output) {
            this.outputChannelModel.then(outputChannelModel => outputChannelModel.append(output));
        }
        update() {
            this.outputChannelModel.then(outputChannelModel => outputChannelModel.update());
        }
        loadModel() {
            return this.outputChannelModel.then(outputChannelModel => outputChannelModel.loadModel());
        }
        clear(till) {
            this.outputChannelModel.then(outputChannelModel => outputChannelModel.clear(till));
        }
    };
    DelegatedOutputChannelModel = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, log_1.ILogService),
        __param(6, files_1.IFileService),
        __param(7, telemetry_1.ITelemetryService)
    ], DelegatedOutputChannelModel);
    let OutputChannelModelService = class OutputChannelModelService extends outputChannelModel_1.AbstractOutputChannelModelService {
        constructor(instantiationService, environmentService, fileService, nativeHostService) {
            super(instantiationService);
            this.environmentService = environmentService;
            this.fileService = fileService;
            this.nativeHostService = nativeHostService;
            this._outputDir = null;
        }
        createOutputChannelModel(id, modelUri, mimeType, file) {
            return file ? super.createOutputChannelModel(id, modelUri, mimeType, file) :
                this.instantiationService.createInstance(DelegatedOutputChannelModel, id, modelUri, mimeType, this.outputDir);
        }
        get outputDir() {
            if (!this._outputDir) {
                const outputDir = uri_1.URI.file((0, path_1.join)(this.environmentService.logsPath, `output_${this.nativeHostService.windowId}_${(0, date_1.toLocalISOString)(new Date()).replace(/-|:|\.\d+Z$/g, '')}`));
                this._outputDir = this.fileService.createFolder(outputDir).then(() => outputDir);
            }
            return this._outputDir;
        }
    };
    OutputChannelModelService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, files_1.IFileService),
        __param(3, native_1.INativeHostService)
    ], OutputChannelModelService);
    exports.OutputChannelModelService = OutputChannelModelService;
    (0, extensions_1.registerSingleton)(outputChannelModel_1.IOutputChannelModelService, OutputChannelModelService);
});
//# sourceMappingURL=outputChannelModelService.js.map