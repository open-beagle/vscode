/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/nls!vs/workbench/contrib/url/browser/trustedDomains", "vs/platform/product/common/productService", "vs/platform/storage/common/storage", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/authentication/browser/authenticationService", "vs/platform/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/platform/workspace/common/workspace"], function (require, exports, uri_1, nls_1, productService_1, storage_1, editorService_1, authenticationService_1, files_1, textfiles_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readStaticTrustedDomains = exports.readAuthenticationTrustedDomains = exports.readWorkspaceTrustedDomains = exports.readTrustedDomains = exports.extractGitHubRemotesFromGitConfig = exports.configureOpenerTrustedDomainsHandler = exports.manageTrustedDomainSettingsCommand = exports.TRUSTED_DOMAINS_CONTENT_STORAGE_KEY = exports.TRUSTED_DOMAINS_STORAGE_KEY = void 0;
    const TRUSTED_DOMAINS_URI = uri_1.URI.parse('trustedDomains:/Trusted Domains');
    exports.TRUSTED_DOMAINS_STORAGE_KEY = 'http.linkProtectionTrustedDomains';
    exports.TRUSTED_DOMAINS_CONTENT_STORAGE_KEY = 'http.linkProtectionTrustedDomainsContent';
    exports.manageTrustedDomainSettingsCommand = {
        id: 'workbench.action.manageTrustedDomain',
        description: {
            description: (0, nls_1.localize)(0, null),
            args: []
        },
        handler: async (accessor) => {
            const editorService = accessor.get(editorService_1.IEditorService);
            editorService.openEditor({ resource: TRUSTED_DOMAINS_URI, mode: 'jsonc', options: { pinned: true } });
            return;
        }
    };
    async function configureOpenerTrustedDomainsHandler(trustedDomains, domainToConfigure, resource, quickInputService, storageService, editorService, telemetryService) {
        const parsedDomainToConfigure = uri_1.URI.parse(domainToConfigure);
        const toplevelDomainSegements = parsedDomainToConfigure.authority.split('.');
        const domainEnd = toplevelDomainSegements.slice(toplevelDomainSegements.length - 2).join('.');
        const topLevelDomain = '*.' + domainEnd;
        const options = [];
        options.push({
            type: 'item',
            label: (0, nls_1.localize)(1, null, domainToConfigure),
            id: 'trust',
            toTrust: domainToConfigure,
            picked: true
        });
        const isIP = toplevelDomainSegements.length === 4 &&
            toplevelDomainSegements.every(segment => Number.isInteger(+segment) || Number.isInteger(+segment.split(':')[0]));
        if (isIP) {
            if (parsedDomainToConfigure.authority.includes(':')) {
                const base = parsedDomainToConfigure.authority.split(':')[0];
                options.push({
                    type: 'item',
                    label: (0, nls_1.localize)(2, null, base),
                    toTrust: base + ':*',
                    id: 'trust'
                });
            }
        }
        else {
            options.push({
                type: 'item',
                label: (0, nls_1.localize)(3, null, domainEnd),
                toTrust: topLevelDomain,
                id: 'trust'
            });
        }
        options.push({
            type: 'item',
            label: (0, nls_1.localize)(4, null),
            toTrust: '*',
            id: 'trust'
        });
        options.push({
            type: 'item',
            label: (0, nls_1.localize)(5, null),
            id: 'manage'
        });
        const pickedResult = await quickInputService.pick(options, { activeItem: options[0] });
        if (pickedResult && pickedResult.id) {
            telemetryService.publicLog2('trustedDomains.configureTrustedDomainsQuickPickChoice', { choice: pickedResult.id });
            switch (pickedResult.id) {
                case 'manage':
                    await editorService.openEditor({
                        resource: TRUSTED_DOMAINS_URI.with({ fragment: resource.toString() }),
                        mode: 'jsonc',
                        options: { pinned: true }
                    });
                    return trustedDomains;
                case 'trust':
                    const itemToTrust = pickedResult.toTrust;
                    if (trustedDomains.indexOf(itemToTrust) === -1) {
                        storageService.remove(exports.TRUSTED_DOMAINS_CONTENT_STORAGE_KEY, 0 /* GLOBAL */);
                        storageService.store(exports.TRUSTED_DOMAINS_STORAGE_KEY, JSON.stringify([...trustedDomains, itemToTrust]), 0 /* GLOBAL */, 0 /* USER */);
                        return [...trustedDomains, itemToTrust];
                    }
            }
        }
        return [];
    }
    exports.configureOpenerTrustedDomainsHandler = configureOpenerTrustedDomainsHandler;
    // Exported for testing.
    function extractGitHubRemotesFromGitConfig(gitConfig) {
        const domains = new Set();
        let match;
        const RemoteMatcher = /^\s*url\s*=\s*(?:git@|https:\/\/)github\.com(?::|\/)(\S*)\s*$/mg;
        while (match = RemoteMatcher.exec(gitConfig)) {
            const repo = match[1].replace(/\.git$/, '');
            if (repo) {
                domains.add(`https://github.com/${repo}/`);
            }
        }
        return [...domains];
    }
    exports.extractGitHubRemotesFromGitConfig = extractGitHubRemotesFromGitConfig;
    async function getRemotes(fileService, textFileService, contextService) {
        const workspaceUris = contextService.getWorkspace().folders.map(folder => folder.uri);
        const domains = await Promise.race([
            new Promise(resolve => setTimeout(() => resolve([]), 2000)),
            Promise.all(workspaceUris.map(async (workspaceUri) => {
                const path = workspaceUri.path;
                const uri = workspaceUri.with({ path: `${path !== '/' ? path : ''}/.git/config` });
                const exists = await fileService.exists(uri);
                if (!exists) {
                    return [];
                }
                const gitConfig = (await (textFileService.read(uri, { acceptTextOnly: true }).catch(() => ({ value: '' })))).value;
                return extractGitHubRemotesFromGitConfig(gitConfig);
            }))
        ]);
        const set = domains.reduce((set, list) => list.reduce((set, item) => set.add(item), set), new Set());
        return [...set];
    }
    async function readTrustedDomains(accessor) {
        const { defaultTrustedDomains, trustedDomains } = readStaticTrustedDomains(accessor);
        const [workspaceDomains, userDomains] = await Promise.all([readWorkspaceTrustedDomains(accessor), readAuthenticationTrustedDomains(accessor)]);
        return {
            workspaceDomains,
            userDomains,
            defaultTrustedDomains,
            trustedDomains,
        };
    }
    exports.readTrustedDomains = readTrustedDomains;
    async function readWorkspaceTrustedDomains(accessor) {
        const fileService = accessor.get(files_1.IFileService);
        const textFileService = accessor.get(textfiles_1.ITextFileService);
        const workspaceContextService = accessor.get(workspace_1.IWorkspaceContextService);
        return getRemotes(fileService, textFileService, workspaceContextService);
    }
    exports.readWorkspaceTrustedDomains = readWorkspaceTrustedDomains;
    async function readAuthenticationTrustedDomains(accessor) {
        var _a;
        const authenticationService = accessor.get(authenticationService_1.IAuthenticationService);
        return authenticationService.isAuthenticationProviderRegistered('github') && ((_a = (await authenticationService.getSessions('github'))) !== null && _a !== void 0 ? _a : []).length > 0
            ? [`https://github.com`]
            : [];
    }
    exports.readAuthenticationTrustedDomains = readAuthenticationTrustedDomains;
    function readStaticTrustedDomains(accessor) {
        const storageService = accessor.get(storage_1.IStorageService);
        const productService = accessor.get(productService_1.IProductService);
        const defaultTrustedDomains = productService.linkProtectionTrustedDomains
            ? [...productService.linkProtectionTrustedDomains]
            : [];
        let trustedDomains = [];
        try {
            const trustedDomainsSrc = storageService.get(exports.TRUSTED_DOMAINS_STORAGE_KEY, 0 /* GLOBAL */);
            if (trustedDomainsSrc) {
                trustedDomains = JSON.parse(trustedDomainsSrc);
            }
        }
        catch (err) { }
        return {
            defaultTrustedDomains,
            trustedDomains,
        };
    }
    exports.readStaticTrustedDomains = readStaticTrustedDomains;
});
//# sourceMappingURL=trustedDomains.js.map