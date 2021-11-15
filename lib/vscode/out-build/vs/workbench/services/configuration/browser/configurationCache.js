/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network"], function (require, exports, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigurationCache = void 0;
    class ConfigurationCache {
        needsCaching(resource) {
            // Cache all non user data resources
            return ![network_1.Schemas.file, network_1.Schemas.userData, network_1.Schemas.tmp].includes(resource.scheme);
        }
        async read(key) {
            return '';
        }
        async write(key, content) {
        }
        async remove(key) {
        }
    }
    exports.ConfigurationCache = ConfigurationCache;
});
//# sourceMappingURL=configurationCache.js.map