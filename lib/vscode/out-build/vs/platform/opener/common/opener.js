/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/base/common/uri", "vs/platform/instantiation/common/instantiation"], function (require, exports, lifecycle_1, strings_1, uri_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.matchesScheme = exports.NullOpenerService = exports.IOpenerService = void 0;
    exports.IOpenerService = (0, instantiation_1.createDecorator)('openerService');
    exports.NullOpenerService = Object.freeze({
        _serviceBrand: undefined,
        registerOpener() { return lifecycle_1.Disposable.None; },
        registerValidator() { return lifecycle_1.Disposable.None; },
        registerExternalUriResolver() { return lifecycle_1.Disposable.None; },
        setDefaultExternalOpener() { },
        registerExternalOpener() { return lifecycle_1.Disposable.None; },
        async open() { return false; },
        async resolveExternalUri(uri) { return { resolved: uri, dispose() { } }; },
    });
    function matchesScheme(target, scheme) {
        if (uri_1.URI.isUri(target)) {
            return (0, strings_1.equalsIgnoreCase)(target.scheme, scheme);
        }
        else {
            return (0, strings_1.startsWithIgnoreCase)(target, scheme + ':');
        }
    }
    exports.matchesScheme = matchesScheme;
});
//# sourceMappingURL=opener.js.map