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
define(["require", "exports", "./extHost.protocol", "vs/platform/files/common/files", "vs/workbench/api/common/extHostTypes", "vs/base/common/buffer", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostFileSystemInfo"], function (require, exports, extHost_protocol_1, files, extHostTypes_1, buffer_1, instantiation_1, extHostRpcService_1, extHostFileSystemInfo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IExtHostConsumerFileSystem = exports.ExtHostConsumerFileSystem = void 0;
    let ExtHostConsumerFileSystem = class ExtHostConsumerFileSystem {
        constructor(extHostRpc, fileSystemInfo) {
            const proxy = extHostRpc.getProxy(extHost_protocol_1.MainContext.MainThreadFileSystem);
            this.value = Object.freeze({
                stat(uri) {
                    return proxy.$stat(uri).catch(ExtHostConsumerFileSystem._handleError);
                },
                readDirectory(uri) {
                    return proxy.$readdir(uri).catch(ExtHostConsumerFileSystem._handleError);
                },
                createDirectory(uri) {
                    return proxy.$mkdir(uri).catch(ExtHostConsumerFileSystem._handleError);
                },
                async readFile(uri) {
                    return proxy.$readFile(uri).then(buff => buff.buffer).catch(ExtHostConsumerFileSystem._handleError);
                },
                writeFile(uri, content) {
                    return proxy.$writeFile(uri, buffer_1.VSBuffer.wrap(content)).catch(ExtHostConsumerFileSystem._handleError);
                },
                delete(uri, options) {
                    return proxy.$delete(uri, Object.assign({ recursive: false, useTrash: false }, options)).catch(ExtHostConsumerFileSystem._handleError);
                },
                rename(oldUri, newUri, options) {
                    return proxy.$rename(oldUri, newUri, Object.assign({ overwrite: false }, options)).catch(ExtHostConsumerFileSystem._handleError);
                },
                copy(source, destination, options) {
                    return proxy.$copy(source, destination, Object.assign({ overwrite: false }, options)).catch(ExtHostConsumerFileSystem._handleError);
                },
                isWritableFileSystem(scheme) {
                    const capabilities = fileSystemInfo.getCapabilities(scheme);
                    if (typeof capabilities === 'number') {
                        return !(capabilities & 2048 /* Readonly */);
                    }
                    return undefined;
                }
            });
        }
        static _handleError(err) {
            // generic error
            if (!(err instanceof Error)) {
                throw new extHostTypes_1.FileSystemError(String(err));
            }
            // no provider (unknown scheme) error
            if (err.name === 'ENOPRO') {
                throw extHostTypes_1.FileSystemError.Unavailable(err.message);
            }
            // file system error
            switch (err.name) {
                case files.FileSystemProviderErrorCode.FileExists: throw extHostTypes_1.FileSystemError.FileExists(err.message);
                case files.FileSystemProviderErrorCode.FileNotFound: throw extHostTypes_1.FileSystemError.FileNotFound(err.message);
                case files.FileSystemProviderErrorCode.FileNotADirectory: throw extHostTypes_1.FileSystemError.FileNotADirectory(err.message);
                case files.FileSystemProviderErrorCode.FileIsADirectory: throw extHostTypes_1.FileSystemError.FileIsADirectory(err.message);
                case files.FileSystemProviderErrorCode.NoPermissions: throw extHostTypes_1.FileSystemError.NoPermissions(err.message);
                case files.FileSystemProviderErrorCode.Unavailable: throw extHostTypes_1.FileSystemError.Unavailable(err.message);
                default: throw new extHostTypes_1.FileSystemError(err.message, err.name);
            }
        }
    };
    ExtHostConsumerFileSystem = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostFileSystemInfo_1.IExtHostFileSystemInfo)
    ], ExtHostConsumerFileSystem);
    exports.ExtHostConsumerFileSystem = ExtHostConsumerFileSystem;
    exports.IExtHostConsumerFileSystem = (0, instantiation_1.createDecorator)('IExtHostConsumerFileSystem');
});
//# sourceMappingURL=extHostFileSystemConsumer.js.map