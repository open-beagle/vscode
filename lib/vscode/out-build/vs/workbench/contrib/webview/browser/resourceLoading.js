/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/extpath", "vs/base/common/network", "vs/base/common/path", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/webview/common/mimeTypes"], function (require, exports, extpath_1, network_1, path_1, uri_1, files_1, mimeTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadLocalResource = exports.WebviewResourceResponse = void 0;
    var WebviewResourceResponse;
    (function (WebviewResourceResponse) {
        let Type;
        (function (Type) {
            Type[Type["Success"] = 0] = "Success";
            Type[Type["Failed"] = 1] = "Failed";
            Type[Type["AccessDenied"] = 2] = "AccessDenied";
            Type[Type["NotModified"] = 3] = "NotModified";
        })(Type = WebviewResourceResponse.Type || (WebviewResourceResponse.Type = {}));
        class StreamSuccess {
            constructor(stream, etag, mimeType) {
                this.stream = stream;
                this.etag = etag;
                this.mimeType = mimeType;
                this.type = Type.Success;
            }
        }
        WebviewResourceResponse.StreamSuccess = StreamSuccess;
        WebviewResourceResponse.Failed = { type: Type.Failed };
        WebviewResourceResponse.AccessDenied = { type: Type.AccessDenied };
        class NotModified {
            constructor(mimeType) {
                this.mimeType = mimeType;
                this.type = Type.NotModified;
            }
        }
        WebviewResourceResponse.NotModified = NotModified;
    })(WebviewResourceResponse = exports.WebviewResourceResponse || (exports.WebviewResourceResponse = {}));
    async function loadLocalResource(requestUri, ifNoneMatch, options, fileService, requestService, logService, token) {
        logService.debug(`loadLocalResource - being. requestUri=${requestUri}`);
        const resourceToLoad = getResourceToLoad(requestUri, options.roots, options.extensionLocation, options.useRootAuthority);
        logService.debug(`loadLocalResource - found resource to load. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
        if (!resourceToLoad) {
            return WebviewResourceResponse.AccessDenied;
        }
        const mime = (0, mimeTypes_1.getWebviewContentMimeType)(requestUri); // Use the original path for the mime
        if (resourceToLoad.scheme === network_1.Schemas.http || resourceToLoad.scheme === network_1.Schemas.https) {
            const headers = {};
            if (ifNoneMatch) {
                headers['If-None-Match'] = ifNoneMatch;
            }
            const response = await requestService.request({
                url: resourceToLoad.toString(true),
                headers: headers
            }, token);
            logService.debug(`loadLocalResource - Loaded over http(s). requestUri=${requestUri}, response=${response.res.statusCode}`);
            switch (response.res.statusCode) {
                case 200:
                    return new WebviewResourceResponse.StreamSuccess(response.stream, response.res.headers['etag'], mime);
                case 304: // Not modified
                    return new WebviewResourceResponse.NotModified(mime);
                default:
                    return WebviewResourceResponse.Failed;
            }
        }
        try {
            const result = await fileService.readFileStream(resourceToLoad, { etag: ifNoneMatch });
            return new WebviewResourceResponse.StreamSuccess(result.value, result.etag, mime);
        }
        catch (err) {
            if (err instanceof files_1.FileOperationError) {
                const result = err.fileOperationResult;
                // NotModified status is expected and can be handled gracefully
                if (result === 2 /* FILE_NOT_MODIFIED_SINCE */) {
                    return new WebviewResourceResponse.NotModified(mime);
                }
            }
            // Otherwise the error is unexpected.
            logService.debug(`loadLocalResource - Error using fileReader. requestUri=${requestUri}`);
            console.log(err);
            return WebviewResourceResponse.Failed;
        }
    }
    exports.loadLocalResource = loadLocalResource;
    function getResourceToLoad(requestUri, roots, extensionLocation, useRootAuthority) {
        for (const root of roots) {
            if (containsResource(root, requestUri)) {
                return normalizeResourcePath(requestUri, extensionLocation, useRootAuthority ? root.authority : undefined);
            }
        }
        return undefined;
    }
    function normalizeResourcePath(resource, extensionLocation, useRemoteAuthority) {
        // If we are loading a file resource from a webview created by a remote extension, rewrite the uri to go remote
        if (useRemoteAuthority || (resource.scheme === network_1.Schemas.file && (extensionLocation === null || extensionLocation === void 0 ? void 0 : extensionLocation.scheme) === network_1.Schemas.vscodeRemote)) {
            return uri_1.URI.from({
                scheme: network_1.Schemas.vscodeRemote,
                authority: useRemoteAuthority !== null && useRemoteAuthority !== void 0 ? useRemoteAuthority : extensionLocation.authority,
                path: '/vscode-resource',
                query: JSON.stringify({
                    requestResourcePath: resource.path
                })
            });
        }
        return resource;
    }
    function containsResource(root, resource) {
        let rootPath = root.fsPath + (root.fsPath.endsWith(path_1.sep) ? '' : path_1.sep);
        let resourceFsPath = resource.fsPath;
        if ((0, extpath_1.isUNC)(root.fsPath) && (0, extpath_1.isUNC)(resource.fsPath)) {
            rootPath = rootPath.toLowerCase();
            resourceFsPath = resourceFsPath.toLowerCase();
        }
        return resourceFsPath.startsWith(rootPath);
    }
});
//# sourceMappingURL=resourceLoading.js.map