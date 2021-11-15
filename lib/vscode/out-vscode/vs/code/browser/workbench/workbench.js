/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
(function() {
var __m = ["vs/server/node/util","require","exports","vs/base/common/uriIpc","vs/code/browser/workbench/workbench","vs/workbench/workbench.web.api","vs/base/common/uri","vs/base/common/event","vs/base/common/uuid","vs/base/common/cancellation","vs/base/common/buffer","vs/base/common/lifecycle","vs/base/parts/request/browser/request","vs/platform/windows/common/windows","vs/base/common/resources","vs/base/browser/browser","vs/nls!vs/code/browser/workbench/workbench","vs/base/common/network","vs/platform/product/common/product"];
var __M = function(deps) {
  var result = [];
  for (var i = 0, len = deps.length; i < len; i++) {
    result[i] = __m[deps[i]];
  }
  return result;
};

define(__m[0/*vs/server/node/util*/], __M([1/*require*/,2/*exports*/,3/*vs/base/common/uriIpc*/]), function (require, exports, uriIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.encodePath = exports.getUriTransformer = void 0;
    const getUriTransformer = (remoteAuthority) => {
        return new uriIpc_1.URITransformer(remoteAuthority);
    };
    exports.getUriTransformer = getUriTransformer;
    /**
     * Encode a path for opening via the folder or workspace query parameter. This
     * preserves slashes so it can be edited by hand more easily.
     */
    const encodePath = (path) => {
        return path.split('/').map((p) => encodeURIComponent(p)).join('/');
    };
    exports.encodePath = encodePath;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[4/*vs/code/browser/workbench/workbench*/], __M([1/*require*/,2/*exports*/,5/*vs/workbench/workbench.web.api*/,6/*vs/base/common/uri*/,7/*vs/base/common/event*/,8/*vs/base/common/uuid*/,9/*vs/base/common/cancellation*/,10/*vs/base/common/buffer*/,11/*vs/base/common/lifecycle*/,12/*vs/base/parts/request/browser/request*/,13/*vs/platform/windows/common/windows*/,14/*vs/base/common/resources*/,15/*vs/base/browser/browser*/,16/*vs/nls!vs/code/browser/workbench/workbench*/,17/*vs/base/common/network*/,18/*vs/platform/product/common/product*/,0/*vs/server/node/util*/]), function (require, exports, workbench_web_api_1, uri_1, event_1, uuid_1, cancellation_1, buffer_1, lifecycle_1, request_1, windows_1, resources_1, browser_1, nls_1, network_1, product_1, util_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function doCreateUri(path, queryValues) {
        let query = undefined;
        if (queryValues) {
            let index = 0;
            queryValues.forEach((value, key) => {
                if (!query) {
                    query = '';
                }
                const prefix = (index++ === 0) ? '' : '&';
                query += `${prefix}${key}=${encodeURIComponent(value)}`;
            });
        }
        return uri_1.URI.parse(window.location.href).with({ path, query });
    }
    class LocalStorageCredentialsProvider {
        constructor() {
            let authSessionInfo;
            const authSessionElement = document.getElementById('vscode-workbench-auth-session');
            const authSessionElementAttribute = authSessionElement ? authSessionElement.getAttribute('data-settings') : undefined;
            if (authSessionElementAttribute) {
                try {
                    authSessionInfo = JSON.parse(authSessionElementAttribute);
                }
                catch (error) { /* Invalid session is passed. Ignore. */ }
            }
            if (authSessionInfo) {
                // Settings Sync Entry
                this.setPassword(`${product_1.default.urlProtocol}.login`, 'account', JSON.stringify(authSessionInfo));
                // Auth extension Entry
                this.authService = `${product_1.default.urlProtocol}-${authSessionInfo.providerId}.login`;
                this.setPassword(this.authService, 'account', JSON.stringify(authSessionInfo.scopes.map(scopes => ({
                    id: authSessionInfo.id,
                    scopes,
                    accessToken: authSessionInfo.accessToken
                }))));
            }
        }
        get credentials() {
            if (!this._credentials) {
                try {
                    const serializedCredentials = window.localStorage.getItem(LocalStorageCredentialsProvider.CREDENTIALS_OPENED_KEY);
                    if (serializedCredentials) {
                        this._credentials = JSON.parse(serializedCredentials);
                    }
                }
                catch (error) {
                    // ignore
                }
                if (!Array.isArray(this._credentials)) {
                    this._credentials = [];
                }
            }
            return this._credentials;
        }
        save() {
            window.localStorage.setItem(LocalStorageCredentialsProvider.CREDENTIALS_OPENED_KEY, JSON.stringify(this.credentials));
        }
        async getPassword(service, account) {
            return this.doGetPassword(service, account);
        }
        async doGetPassword(service, account) {
            for (const credential of this.credentials) {
                if (credential.service === service) {
                    if (typeof account !== 'string' || account === credential.account) {
                        return credential.password;
                    }
                }
            }
            return null;
        }
        async setPassword(service, account, password) {
            this.doDeletePassword(service, account);
            this.credentials.push({ service, account, password });
            this.save();
            try {
                if (password && service === this.authService) {
                    const value = JSON.parse(password);
                    if (Array.isArray(value) && value.length === 0) {
                        await this.logout(service);
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
        }
        async deletePassword(service, account) {
            const result = await this.doDeletePassword(service, account);
            if (result && service === this.authService) {
                try {
                    await this.logout(service);
                }
                catch (error) {
                    console.log(error);
                }
            }
            return result;
        }
        async doDeletePassword(service, account) {
            let found = false;
            this._credentials = this.credentials.filter(credential => {
                if (credential.service === service && credential.account === account) {
                    found = true;
                    return false;
                }
                return true;
            });
            if (found) {
                this.save();
            }
            return found;
        }
        async findPassword(service) {
            return this.doGetPassword(service);
        }
        async findCredentials(service) {
            return this.credentials
                .filter(credential => credential.service === service)
                .map(({ account, password }) => ({ account, password }));
        }
        async logout(service) {
            const queryValues = new Map();
            queryValues.set('logout', String(true));
            queryValues.set('service', service);
            await (0, request_1.request)({
                url: doCreateUri('/auth/logout', queryValues).toString(true)
            }, cancellation_1.CancellationToken.None);
        }
    }
    LocalStorageCredentialsProvider.CREDENTIALS_OPENED_KEY = 'credentials.provider';
    class PollingURLCallbackProvider extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onCallback = this._register(new event_1.Emitter());
            this.onCallback = this._onCallback.event;
        }
        create(options) {
            const queryValues = new Map();
            const requestId = (0, uuid_1.generateUuid)();
            queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.REQUEST_ID, requestId);
            const { scheme, authority, path, query, fragment } = options ? options : { scheme: undefined, authority: undefined, path: undefined, query: undefined, fragment: undefined };
            if (scheme) {
                queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.SCHEME, scheme);
            }
            if (authority) {
                queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.AUTHORITY, authority);
            }
            if (path) {
                queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.PATH, path);
            }
            if (query) {
                queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.QUERY, query);
            }
            if (fragment) {
                queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.FRAGMENT, fragment);
            }
            // Start to poll on the callback being fired
            this.periodicFetchCallback(requestId, Date.now());
            return doCreateUri('/callback', queryValues);
        }
        async periodicFetchCallback(requestId, startTime) {
            // Ask server for callback results
            const queryValues = new Map();
            queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.REQUEST_ID, requestId);
            const result = await (0, request_1.request)({
                url: doCreateUri('/fetch-callback', queryValues).toString(true)
            }, cancellation_1.CancellationToken.None);
            // Check for callback results
            const content = await (0, buffer_1.streamToBuffer)(result.stream);
            if (content.byteLength > 0) {
                try {
                    this._onCallback.fire(uri_1.URI.revive(JSON.parse(content.toString())));
                }
                catch (error) {
                    console.error(error);
                }
                return; // done
            }
            // Continue fetching unless we hit the timeout
            if (Date.now() - startTime < PollingURLCallbackProvider.FETCH_TIMEOUT) {
                setTimeout(() => this.periodicFetchCallback(requestId, startTime), PollingURLCallbackProvider.FETCH_INTERVAL);
            }
        }
    }
    PollingURLCallbackProvider.FETCH_INTERVAL = 500; // fetch every 500ms
    PollingURLCallbackProvider.FETCH_TIMEOUT = 5 * 60 * 1000; // ...but stop after 5min
    PollingURLCallbackProvider.QUERY_KEYS = {
        REQUEST_ID: 'vscode-requestId',
        SCHEME: 'vscode-scheme',
        AUTHORITY: 'vscode-authority',
        PATH: 'vscode-path',
        QUERY: 'vscode-query',
        FRAGMENT: 'vscode-fragment'
    };
    class WorkspaceProvider {
        constructor(workspace, payload) {
            this.workspace = workspace;
            this.payload = payload;
            this.trusted = true;
        }
        async open(workspace, options) {
            if ((options === null || options === void 0 ? void 0 : options.reuse) && !options.payload && this.isSame(this.workspace, workspace)) {
                return true; // return early if workspace and environment is not changing and we are reusing window
            }
            const targetHref = this.createTargetUrl(workspace, options);
            if (targetHref) {
                if (options === null || options === void 0 ? void 0 : options.reuse) {
                    window.location.href = targetHref;
                    return true;
                }
                else {
                    let result;
                    if (browser_1.isStandalone) {
                        result = window.open(targetHref, '_blank', 'toolbar=no'); // ensures to open another 'standalone' window!
                    }
                    else {
                        result = window.open(targetHref);
                    }
                    return !!result;
                }
            }
            return false;
        }
        createTargetUrl(workspace, options) {
            // Empty
            let targetHref = undefined;
            if (!workspace) {
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_EMPTY_WINDOW}=true`;
            }
            // Folder
            else if ((0, windows_1.isFolderToOpen)(workspace)) {
                const target = workspace.folderUri.scheme === network_1.Schemas.vscodeRemote
                    ? (0, util_1.encodePath)(workspace.folderUri.path)
                    : encodeURIComponent(workspace.folderUri.toString());
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_FOLDER}=${target}`;
            }
            // Workspace
            else if ((0, windows_1.isWorkspaceToOpen)(workspace)) {
                const target = workspace.workspaceUri.scheme === network_1.Schemas.vscodeRemote
                    ? (0, util_1.encodePath)(workspace.workspaceUri.path)
                    : encodeURIComponent(workspace.workspaceUri.toString());
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_WORKSPACE}=${target}`;
            }
            // Append payload if any
            if (options === null || options === void 0 ? void 0 : options.payload) {
                targetHref += `&${WorkspaceProvider.QUERY_PARAM_PAYLOAD}=${encodeURIComponent(JSON.stringify(options.payload))}`;
            }
            return targetHref;
        }
        isSame(workspaceA, workspaceB) {
            if (!workspaceA || !workspaceB) {
                return workspaceA === workspaceB; // both empty
            }
            if ((0, windows_1.isFolderToOpen)(workspaceA) && (0, windows_1.isFolderToOpen)(workspaceB)) {
                return (0, resources_1.isEqual)(workspaceA.folderUri, workspaceB.folderUri); // same workspace
            }
            if ((0, windows_1.isWorkspaceToOpen)(workspaceA) && (0, windows_1.isWorkspaceToOpen)(workspaceB)) {
                return (0, resources_1.isEqual)(workspaceA.workspaceUri, workspaceB.workspaceUri); // same workspace
            }
            return false;
        }
        hasRemote() {
            if (this.workspace) {
                if ((0, windows_1.isFolderToOpen)(this.workspace)) {
                    return this.workspace.folderUri.scheme === network_1.Schemas.vscodeRemote;
                }
                if ((0, windows_1.isWorkspaceToOpen)(this.workspace)) {
                    return this.workspace.workspaceUri.scheme === network_1.Schemas.vscodeRemote;
                }
            }
            return true;
        }
    }
    WorkspaceProvider.QUERY_PARAM_EMPTY_WINDOW = 'ew';
    WorkspaceProvider.QUERY_PARAM_FOLDER = 'folder';
    WorkspaceProvider.QUERY_PARAM_WORKSPACE = 'workspace';
    WorkspaceProvider.QUERY_PARAM_PAYLOAD = 'payload';
    class WindowIndicator {
        constructor(workspace) {
            this.onDidChange = event_1.Event.None;
            let repositoryOwner = undefined;
            let repositoryName = undefined;
            if (workspace) {
                let uri = undefined;
                if ((0, windows_1.isFolderToOpen)(workspace)) {
                    uri = workspace.folderUri;
                }
                else if ((0, windows_1.isWorkspaceToOpen)(workspace)) {
                    uri = workspace.workspaceUri;
                }
                if ((uri === null || uri === void 0 ? void 0 : uri.scheme) === 'github' || (uri === null || uri === void 0 ? void 0 : uri.scheme) === 'codespace') {
                    [repositoryOwner, repositoryName] = uri.authority.split('+');
                }
            }
            // Repo
            if (repositoryName && repositoryOwner) {
                this.label = (0, nls_1.localize)(0, null, repositoryOwner, repositoryName);
                this.tooltip = (0, nls_1.localize)(1, null, repositoryOwner, repositoryName);
            }
            // No Repo
            else {
                this.label = (0, nls_1.localize)(2, null);
                this.tooltip = (0, nls_1.localize)(3, null);
            }
        }
    }
    (function () {
        var _a;
        // Find config by checking for DOM
        const configElement = document.getElementById('vscode-workbench-web-configuration');
        const configElementAttribute = configElement ? configElement.getAttribute('data-settings') : undefined;
        if (!configElement || !configElementAttribute) {
            throw new Error('Missing web configuration element');
        }
        const config = Object.assign({ webviewEndpoint: `${window.location.origin}${window.location.pathname.replace(/\/+$/, '')}/webview` }, JSON.parse(configElementAttribute));
        // Strip the protocol from the authority if it exists.
        const normalizeAuthority = (authority) => authority.replace(/^https?:\/\//, '');
        if (config.remoteAuthority) {
            config.remoteAuthority = normalizeAuthority(config.remoteAuthority);
        }
        if (config.workspaceUri && config.workspaceUri.authority) {
            config.workspaceUri.authority = normalizeAuthority(config.workspaceUri.authority);
        }
        if (config.folderUri && config.folderUri.authority) {
            config.folderUri.authority = normalizeAuthority(config.folderUri.authority);
        }
        // Find workspace to open and payload
        let foundWorkspace = false;
        let workspace;
        let payload = ((_a = config.workspaceProvider) === null || _a === void 0 ? void 0 : _a.payload) || Object.create(null);
        // If no workspace is provided through the URL, check for config attribute from server
        if (!foundWorkspace) {
            if (config.folderUri) {
                workspace = { folderUri: uri_1.URI.revive(config.folderUri) };
            }
            else if (config.workspaceUri) {
                workspace = { workspaceUri: uri_1.URI.revive(config.workspaceUri) };
            }
            else {
                workspace = undefined;
            }
        }
        // Workspace Provider
        const workspaceProvider = new WorkspaceProvider(workspace, payload);
        // Window indicator (unless connected to a remote)
        let windowIndicator = undefined;
        if (!workspaceProvider.hasRemote()) {
            windowIndicator = new WindowIndicator(workspace);
        }
        // Product Quality Change Handler
        const productQualityChangeHandler = (quality) => {
            let queryString = `quality=${quality}`;
            // Save all other query params we might have
            const query = new URL(document.location.href).searchParams;
            query.forEach((value, key) => {
                if (key !== 'quality') {
                    queryString += `&${key}=${value}`;
                }
            });
            window.location.href = `${window.location.origin}?${queryString}`;
        };
        // settings sync options
        const settingsSyncOptions = config.settingsSyncOptions ? {
            enabled: config.settingsSyncOptions.enabled,
            enablementHandler: (enablement) => {
                let queryString = `settingsSync=${enablement ? 'true' : 'false'}`;
                // Save all other query params we might have
                const query = new URL(document.location.href).searchParams;
                query.forEach((value, key) => {
                    if (key !== 'settingsSync') {
                        queryString += `&${key}=${value}`;
                    }
                });
                window.location.href = `${window.location.origin}?${queryString}`;
            }
        } : undefined;
        // Finally create workbench
        (0, workbench_web_api_1.create)(document.body, Object.assign(Object.assign({}, config), { settingsSyncOptions,
            windowIndicator,
            productQualityChangeHandler,
            workspaceProvider, urlCallbackProvider: new PollingURLCallbackProvider(), credentialsProvider: new LocalStorageCredentialsProvider() }));
    })();
});

}).call(this);
//# sourceMappingURL=workbench.js.map
