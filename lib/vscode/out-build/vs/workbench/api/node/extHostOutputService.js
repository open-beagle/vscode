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
define(["require", "exports", "vs/base/common/uri", "vs/base/common/path", "vs/base/common/date", "vs/base/node/pfs", "fs", "vs/workbench/api/common/extHostOutput", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService", "vs/base/common/lifecycle", "vs/platform/log/common/log", "vs/platform/log/node/spdlogLog", "vs/platform/files/common/files"], function (require, exports, uri_1, path_1, date_1, pfs_1, fs_1, extHostOutput_1, extHostInitDataService_1, extHostRpcService_1, lifecycle_1, log_1, spdlogLog_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostOutputService2 = exports.ExtHostOutputChannelBackedByFile = void 0;
    class OutputAppender {
        constructor(name, file) {
            this.file = file;
            this.appender = (0, spdlogLog_1.createRotatingLogger)(name, file, 30 * files_1.ByteSize.MB, 1);
            this.appender.clearFormatters();
        }
        append(content) {
            this.appender.critical(content);
        }
        flush() {
            this.appender.flush();
        }
    }
    class ExtHostOutputChannelBackedByFile extends extHostOutput_1.AbstractExtHostOutputChannel {
        constructor(name, appender, proxy) {
            super(name, false, uri_1.URI.file(appender.file), proxy);
            this._appender = appender;
        }
        append(value) {
            super.append(value);
            this._appender.append(value);
            this._onDidAppend.fire();
        }
        update() {
            this._appender.flush();
            super.update();
        }
        show(columnOrPreserveFocus, preserveFocus) {
            this._appender.flush();
            super.show(columnOrPreserveFocus, preserveFocus);
        }
        clear() {
            this._appender.flush();
            super.clear();
        }
    }
    exports.ExtHostOutputChannelBackedByFile = ExtHostOutputChannelBackedByFile;
    let ExtHostOutputService2 = class ExtHostOutputService2 extends extHostOutput_1.ExtHostOutputService {
        constructor(extHostRpc, logService, initData) {
            super(extHostRpc);
            this.logService = logService;
            this._namePool = 1;
            this._channels = new Map();
            this._visibleChannelDisposable = new lifecycle_1.MutableDisposable();
            this._logsLocation = initData.logsLocation;
        }
        $setVisibleChannel(channelId) {
            if (channelId) {
                const channel = this._channels.get(channelId);
                if (channel) {
                    this._visibleChannelDisposable.value = channel.onDidAppend(() => channel.update());
                }
            }
        }
        createOutputChannel(name) {
            name = name.trim();
            if (!name) {
                throw new Error('illegal argument `name`. must not be falsy');
            }
            const extHostOutputChannel = this._doCreateOutChannel(name);
            extHostOutputChannel.then(channel => channel._id.then(id => this._channels.set(id, channel)));
            return new extHostOutput_1.LazyOutputChannel(name, extHostOutputChannel);
        }
        async _doCreateOutChannel(name) {
            try {
                const outputDirPath = (0, path_1.join)(this._logsLocation.fsPath, `output_logging_${(0, date_1.toLocalISOString)(new Date()).replace(/-|:|\.\d+Z$/g, '')}`);
                const exists = await pfs_1.SymlinkSupport.existsDirectory(outputDirPath);
                if (!exists) {
                    await fs_1.promises.mkdir(outputDirPath, { recursive: true });
                }
                const fileName = `${this._namePool++}-${name.replace(/[\\/:\*\?"<>\|]/g, '')}`;
                const file = uri_1.URI.file((0, path_1.join)(outputDirPath, `${fileName}.log`));
                const appender = new OutputAppender(fileName, file.fsPath);
                return new ExtHostOutputChannelBackedByFile(name, appender, this._proxy);
            }
            catch (error) {
                // Do not crash if logger cannot be created
                this.logService.error(error);
                return new extHostOutput_1.ExtHostPushOutputChannel(name, this._proxy);
            }
        }
    };
    ExtHostOutputService2 = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, log_1.ILogService),
        __param(2, extHostInitDataService_1.IExtHostInitDataService)
    ], ExtHostOutputService2);
    exports.ExtHostOutputService2 = ExtHostOutputService2;
});
//# sourceMappingURL=extHostOutputService.js.map