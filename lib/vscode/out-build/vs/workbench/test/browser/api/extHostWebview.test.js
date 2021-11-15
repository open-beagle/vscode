/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/test/common/mock", "vs/platform/log/common/log", "vs/workbench/api/common/extHostApiDeprecationService", "vs/workbench/api/common/extHostWebview", "vs/workbench/api/common/extHostWebviewPanels", "./testRPCProtocol"], function (require, exports, assert, uri_1, mock_1, log_1, extHostApiDeprecationService_1, extHostWebview_1, extHostWebviewPanels_1, testRPCProtocol_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostWebview', () => {
        let rpcProtocol;
        setup(() => {
            const shape = createNoopMainThreadWebviews();
            rpcProtocol = (0, testRPCProtocol_1.SingleProxyRPCProtocol)(shape);
        });
        test('Cannot register multiple serializers for the same view type', async () => {
            const viewType = 'view.type';
            const extHostWebviews = new extHostWebview_1.ExtHostWebviews(rpcProtocol, {
                webviewCspSource: '',
                webviewResourceRoot: '',
                isExtensionDevelopmentDebug: false,
            }, undefined, new log_1.NullLogService(), extHostApiDeprecationService_1.NullApiDeprecationService);
            const extHostWebviewPanels = new extHostWebviewPanels_1.ExtHostWebviewPanels(rpcProtocol, extHostWebviews, undefined);
            let lastInvokedDeserializer = undefined;
            class NoopSerializer {
                async deserializeWebviewPanel(_webview, _state) {
                    lastInvokedDeserializer = this;
                }
            }
            const extension = {};
            const serializerA = new NoopSerializer();
            const serializerB = new NoopSerializer();
            const serializerARegistration = extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializerA);
            await extHostWebviewPanels.$deserializeWebviewPanel('x', viewType, {
                title: 'title',
                state: {},
                panelOptions: {},
                webviewOptions: {}
            }, 0);
            assert.strictEqual(lastInvokedDeserializer, serializerA);
            assert.throws(() => extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializerB), 'Should throw when registering two serializers for the same view');
            serializerARegistration.dispose();
            extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializerB);
            await extHostWebviewPanels.$deserializeWebviewPanel('x', viewType, {
                title: 'title',
                state: {},
                panelOptions: {},
                webviewOptions: {}
            }, 0);
            assert.strictEqual(lastInvokedDeserializer, serializerB);
        });
        test('asWebviewUri for desktop vscode-resource scheme', () => {
            const extHostWebviews = new extHostWebview_1.ExtHostWebviews(rpcProtocol, {
                webviewCspSource: '',
                webviewResourceRoot: 'vscode-resource://{{resource}}',
                isExtensionDevelopmentDebug: false,
            }, undefined, new log_1.NullLogService(), extHostApiDeprecationService_1.NullApiDeprecationService);
            const extHostWebviewPanels = new extHostWebviewPanels_1.ExtHostWebviewPanels(rpcProtocol, extHostWebviews, undefined);
            const webview = extHostWebviewPanels.createWebviewPanel({}, 'type', 'title', 1, {});
            assert.strictEqual(webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/file.html')).toString(), 'vscode-resource://file///Users/codey/file.html', 'Unix basic');
            assert.strictEqual(webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/file.html#frag')).toString(), 'vscode-resource://file///Users/codey/file.html#frag', 'Unix should preserve fragment');
            assert.strictEqual(webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/f%20ile.html')).toString(), 'vscode-resource://file///Users/codey/f%20ile.html', 'Unix with encoding');
            assert.strictEqual(webview.webview.asWebviewUri(uri_1.URI.parse('file://localhost/Users/codey/file.html')).toString(), 'vscode-resource://file//localhost/Users/codey/file.html', 'Unix should preserve authority');
            assert.strictEqual(webview.webview.asWebviewUri(uri_1.URI.parse('file:///c:/codey/file.txt')).toString(), 'vscode-resource://file///c%3A/codey/file.txt', 'Windows C drive');
        });
        test('asWebviewUri for web endpoint', () => {
            const extHostWebviews = new extHostWebview_1.ExtHostWebviews(rpcProtocol, {
                webviewCspSource: '',
                webviewResourceRoot: `https://{{uuid}}.webview.contoso.com/commit/{{resource}}`,
                isExtensionDevelopmentDebug: false,
            }, undefined, new log_1.NullLogService(), extHostApiDeprecationService_1.NullApiDeprecationService);
            const extHostWebviewPanels = new extHostWebviewPanels_1.ExtHostWebviewPanels(rpcProtocol, extHostWebviews, undefined);
            const webview = extHostWebviewPanels.createWebviewPanel({}, 'type', 'title', 1, {});
            function stripEndpointUuid(input) {
                return input.replace(/^https:\/\/[^\.]+?\./, '');
            }
            assert.strictEqual(stripEndpointUuid(webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/file.html')).toString()), 'webview.contoso.com/commit/file///Users/codey/file.html', 'Unix basic');
            assert.strictEqual(stripEndpointUuid(webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/file.html#frag')).toString()), 'webview.contoso.com/commit/file///Users/codey/file.html#frag', 'Unix should preserve fragment');
            assert.strictEqual(stripEndpointUuid(webview.webview.asWebviewUri(uri_1.URI.parse('file:///Users/codey/f%20ile.html')).toString()), 'webview.contoso.com/commit/file///Users/codey/f%20ile.html', 'Unix with encoding');
            assert.strictEqual(stripEndpointUuid(webview.webview.asWebviewUri(uri_1.URI.parse('file://localhost/Users/codey/file.html')).toString()), 'webview.contoso.com/commit/file//localhost/Users/codey/file.html', 'Unix should preserve authority');
            assert.strictEqual(stripEndpointUuid(webview.webview.asWebviewUri(uri_1.URI.parse('file:///c:/codey/file.txt')).toString()), 'webview.contoso.com/commit/file///c%3A/codey/file.txt', 'Windows C drive');
        });
    });
    function createNoopMainThreadWebviews() {
        return new class extends (0, mock_1.mock)() {
            $createWebviewPanel() { }
            $registerSerializer() { }
            $unregisterSerializer() { }
        };
    }
});
//# sourceMappingURL=extHostWebview.test.js.map