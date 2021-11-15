/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/resources"], function (require, exports, network_1, platform_1, process_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let product;
    // Native sandbox environment
    if (typeof platform_1.globals.vscode !== 'undefined') {
        const configuration = platform_1.globals.vscode.context.configuration();
        if (configuration) {
            product = configuration.product;
        }
        else {
            throw new Error('Sandbox: unable to resolve product configuration from preload script.');
        }
    }
    // Native node.js environment
    else if (typeof (require === null || require === void 0 ? void 0 : require.__$__nodeRequire) === 'function') {
        // Obtain values from product.json and package.json
        const rootPath = (0, resources_1.dirname)(network_1.FileAccess.asFileUri('', require));
        product = require.__$__nodeRequire((0, resources_1.joinPath)(rootPath, 'product.json').fsPath);
        const pkg = require.__$__nodeRequire((0, resources_1.joinPath)(rootPath, 'package.json').fsPath);
        // Running out of sources
        if (process_1.env['VSCODE_DEV']) {
            Object.assign(product, {
                nameShort: `${product.nameShort} Dev`,
                nameLong: `${product.nameLong} Dev`,
                dataFolderName: `${product.dataFolderName}-dev`
            });
        }
        Object.assign(product, {
            version: pkg.version
        });
    }
    // Web environment or unknown
    else {
        // Built time configuration (do NOT modify)
        product = { /*BUILD->INSERT_PRODUCT_CONFIGURATION*/};
        // Running out of sources
        if (Object.keys(product).length === 0) {
            Object.assign(product, {
                version: '1.56.0-dev',
                nameShort: platform_1.isWeb ? 'Code Web - OSS Dev' : 'Code - OSS Dev',
                nameLong: platform_1.isWeb ? 'Code Web - OSS Dev' : 'Code - OSS Dev',
                applicationName: 'code-oss',
                dataFolderName: '.vscode-oss',
                urlProtocol: 'code-oss',
                reportIssueUrl: 'https://github.com/microsoft/vscode/issues/new',
                licenseName: 'MIT',
                licenseUrl: 'https://github.com/microsoft/vscode/blob/main/LICENSE.txt',
                extensionAllowedProposedApi: [
                    'ms-vscode.vscode-js-profile-flame',
                    'ms-vscode.vscode-js-profile-table',
                    'ms-vscode.github-browser',
                    'ms-vscode.github-richnav',
                    'ms-vscode.remotehub',
                    'ms-vscode.remotehub-insiders'
                ],
            });
        }
        // NOTE@coder: Add the ability to inject settings from the server.
        const el = document.getElementById('vscode-remote-product-configuration');
        const rawProductConfiguration = el && el.getAttribute('data-settings');
        if (rawProductConfiguration) {
            Object.assign(product, JSON.parse(rawProductConfiguration));
        }
    }
    exports.default = product;
});
//# sourceMappingURL=product.js.map