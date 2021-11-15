/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "crypto", "net", "vs/base/common/platform", "os", "vs/base/common/path", "vs/workbench/contrib/debug/node/debugAdapter"], function (require, exports, assert, crypto, net, platform, os_1, path_1, debugAdapter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function rndPort() {
        const min = 8000;
        const max = 9000;
        return Math.floor(Math.random() * (max - min) + min);
    }
    function sendInitializeRequest(debugAdapter) {
        return new Promise((resolve, reject) => {
            debugAdapter.sendRequest('initialize', { adapterID: 'test' }, (result) => {
                resolve(result);
            });
        });
    }
    function serverConnection(socket) {
        socket.on('data', (data) => {
            const str = data.toString().split('\r\n')[2];
            const request = JSON.parse(str);
            const response = {
                seq: request.seq,
                request_seq: request.seq,
                type: 'response',
                command: request.command
            };
            if (request.arguments.adapterID === 'test') {
                response.success = true;
            }
            else {
                response.success = false;
                response.message = 'failed';
            }
            const responsePayload = JSON.stringify(response);
            socket.write(`Content-Length: ${responsePayload.length}\r\n\r\n${responsePayload}`);
        });
    }
    suite('Debug - StreamDebugAdapter', () => {
        const port = rndPort();
        const pipeName = crypto.randomBytes(10).toString('hex');
        const pipePath = platform.isWindows ? (0, path_1.join)('\\\\.\\pipe\\', pipeName) : (0, path_1.join)((0, os_1.tmpdir)(), pipeName);
        const testCases = [
            {
                testName: 'NamedPipeDebugAdapter',
                debugAdapter: new debugAdapter_1.NamedPipeDebugAdapter({
                    type: 'pipeServer',
                    path: pipePath
                }),
                connectionDetail: pipePath
            },
            {
                testName: 'SocketDebugAdapter',
                debugAdapter: new debugAdapter_1.SocketDebugAdapter({
                    type: 'server',
                    port
                }),
                connectionDetail: port
            }
        ];
        for (const testCase of testCases) {
            test(`StreamDebugAdapter (${testCase.testName}) can initialize a connection`, async () => {
                const server = net.createServer(serverConnection).listen(testCase.connectionDetail);
                const debugAdapter = testCase.debugAdapter;
                try {
                    await debugAdapter.startSession();
                    const response = await sendInitializeRequest(debugAdapter);
                    assert.strictEqual(response.command, 'initialize');
                    assert.strictEqual(response.request_seq, 1);
                    assert.strictEqual(response.success, true, response.message);
                }
                finally {
                    await debugAdapter.stopSession();
                    server.close();
                    debugAdapter.dispose();
                }
            });
        }
    });
});
//# sourceMappingURL=streamDebugAdapter.test.js.map