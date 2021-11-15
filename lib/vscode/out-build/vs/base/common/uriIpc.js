/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "./network"], function (require, exports, uri_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.transformAndReviveIncomingURIs = exports.transformIncomingURIs = exports.transformOutgoingURIs = exports.DefaultURITransformer = exports.URITransformer = void 0;
    function toJSON(uri) {
        return uri.toJSON();
    }
    class URITransformer {
        constructor(remoteAuthority) {
            this.remoteAuthority = remoteAuthority;
        }
        // NOTE@coder: Coming in from the browser it'll be vscode-remote so it needs
        // to be transformed into file.
        transformIncoming(uri) {
            return uri.scheme === network_1.Schemas.vscodeRemote
                ? toJSON(uri_1.URI.file(uri.path))
                : uri;
        }
        // NOTE@coder: Going out to the browser it'll be file so it needs to be
        // transformed into vscode-remote.
        transformOutgoing(uri) {
            return uri.scheme === network_1.Schemas.file
                ? toJSON(uri_1.URI.from({ authority: this.remoteAuthority, scheme: network_1.Schemas.vscodeRemote, path: uri.path }))
                : uri;
        }
        transformOutgoingURI(uri) {
            return uri.scheme === network_1.Schemas.file
                ? uri_1.URI.from({ authority: this.remoteAuthority, scheme: network_1.Schemas.vscodeRemote, path: uri.path })
                : uri;
        }
        transformOutgoingScheme(scheme) {
            return scheme === network_1.Schemas.file
                ? network_1.Schemas.vscodeRemote
                : scheme;
        }
    }
    exports.URITransformer = URITransformer;
    exports.DefaultURITransformer = new class {
        transformIncoming(uri) {
            return uri;
        }
        transformOutgoing(uri) {
            return uri;
        }
        transformOutgoingURI(uri) {
            return uri;
        }
        transformOutgoingScheme(scheme) {
            return scheme;
        }
    };
    function _transformOutgoingURIs(obj, transformer, depth) {
        if (!obj || depth > 200) {
            return null;
        }
        if (typeof obj === 'object') {
            if (obj instanceof uri_1.URI) {
                return transformer.transformOutgoing(obj);
            }
            // walk object (or array)
            for (let key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    const r = _transformOutgoingURIs(obj[key], transformer, depth + 1);
                    if (r !== null) {
                        obj[key] = r;
                    }
                }
            }
        }
        return null;
    }
    function transformOutgoingURIs(obj, transformer) {
        const result = _transformOutgoingURIs(obj, transformer, 0);
        if (result === null) {
            // no change
            return obj;
        }
        return result;
    }
    exports.transformOutgoingURIs = transformOutgoingURIs;
    function _transformIncomingURIs(obj, transformer, revive, depth) {
        if (!obj || depth > 200) {
            return null;
        }
        if (typeof obj === 'object') {
            if (obj.$mid === 1) {
                return revive ? uri_1.URI.revive(transformer.transformIncoming(obj)) : transformer.transformIncoming(obj);
            }
            // walk object (or array)
            for (let key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    const r = _transformIncomingURIs(obj[key], transformer, revive, depth + 1);
                    if (r !== null) {
                        obj[key] = r;
                    }
                }
            }
        }
        return null;
    }
    function transformIncomingURIs(obj, transformer) {
        const result = _transformIncomingURIs(obj, transformer, false, 0);
        if (result === null) {
            // no change
            return obj;
        }
        return result;
    }
    exports.transformIncomingURIs = transformIncomingURIs;
    function transformAndReviveIncomingURIs(obj, transformer) {
        const result = _transformIncomingURIs(obj, transformer, true, 0);
        if (result === null) {
            // no change
            return obj;
        }
        return result;
    }
    exports.transformAndReviveIncomingURIs = transformAndReviveIncomingURIs;
});
//# sourceMappingURL=uriIpc.js.map