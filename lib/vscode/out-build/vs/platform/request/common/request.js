/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/platform/request/common/request", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/base/common/buffer"], function (require, exports, nls_1, instantiation_1, configurationRegistry_1, platform_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.updateProxyConfigurationsScope = exports.asJson = exports.asText = exports.isSuccess = exports.IRequestService = void 0;
    exports.IRequestService = (0, instantiation_1.createDecorator)('requestService');
    function isSuccess(context) {
        return (context.res.statusCode && context.res.statusCode >= 200 && context.res.statusCode < 300) || context.res.statusCode === 1223;
    }
    exports.isSuccess = isSuccess;
    function hasNoContent(context) {
        return context.res.statusCode === 204;
    }
    async function asText(context) {
        if (!isSuccess(context)) {
            throw new Error('Server returned ' + context.res.statusCode);
        }
        if (hasNoContent(context)) {
            return null;
        }
        const buffer = await (0, buffer_1.streamToBuffer)(context.stream);
        return buffer.toString();
    }
    exports.asText = asText;
    async function asJson(context) {
        if (!isSuccess(context)) {
            throw new Error('Server returned ' + context.res.statusCode);
        }
        if (hasNoContent(context)) {
            return null;
        }
        const buffer = await (0, buffer_1.streamToBuffer)(context.stream);
        const str = buffer.toString();
        try {
            return JSON.parse(str);
        }
        catch (err) {
            err.message += ':\n' + str;
            throw err;
        }
    }
    exports.asJson = asJson;
    function updateProxyConfigurationsScope(scope) {
        registerProxyConfigurations(scope);
    }
    exports.updateProxyConfigurationsScope = updateProxyConfigurationsScope;
    let proxyConfiguration;
    function registerProxyConfigurations(scope) {
        const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
        if (proxyConfiguration) {
            configurationRegistry.deregisterConfigurations([proxyConfiguration]);
        }
        proxyConfiguration = {
            id: 'http',
            order: 15,
            title: (0, nls_1.localize)(0, null),
            type: 'object',
            scope,
            properties: {
                'http.proxy': {
                    type: 'string',
                    pattern: '^https?://([^:]*(:[^@]*)?@)?([^:]+|\\[[:0-9a-fA-F]+\\])(:\\d+)?/?$|^$',
                    markdownDescription: (0, nls_1.localize)(1, null),
                    restricted: true
                },
                'http.proxyStrictSSL': {
                    type: 'boolean',
                    default: true,
                    description: (0, nls_1.localize)(2, null),
                    restricted: true
                },
                'http.proxyAuthorization': {
                    type: ['null', 'string'],
                    default: null,
                    markdownDescription: (0, nls_1.localize)(3, null),
                    restricted: true
                },
                'http.proxySupport': {
                    type: 'string',
                    enum: ['off', 'on', 'fallback', 'override'],
                    enumDescriptions: [
                        (0, nls_1.localize)(4, null),
                        (0, nls_1.localize)(5, null),
                        (0, nls_1.localize)(6, null),
                        (0, nls_1.localize)(7, null),
                    ],
                    default: 'override',
                    description: (0, nls_1.localize)(8, null),
                    restricted: true
                },
                'http.systemCertificates': {
                    type: 'boolean',
                    default: true,
                    description: (0, nls_1.localize)(9, null),
                    restricted: true
                }
            }
        };
        configurationRegistry.registerConfiguration(proxyConfiguration);
    }
    registerProxyConfigurations(2 /* MACHINE */);
});
//# sourceMappingURL=request.js.map