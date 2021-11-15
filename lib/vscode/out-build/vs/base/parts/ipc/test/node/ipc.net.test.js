/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "net", "events", "vs/base/parts/ipc/common/ipc.net", "vs/base/parts/ipc/node/ipc.net", "vs/base/common/buffer", "os", "vs/platform/product/common/product"], function (require, exports, assert, net_1, events_1, ipc_net_1, ipc_net_2, buffer_1, os_1, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MessageStream {
        constructor(x) {
            this._currentComplete = null;
            this._messages = [];
            x.onMessage(data => {
                this._messages.push(data);
                this._trigger();
            });
        }
        _trigger() {
            if (!this._currentComplete) {
                return;
            }
            if (this._messages.length === 0) {
                return;
            }
            const complete = this._currentComplete;
            const msg = this._messages.shift();
            this._currentComplete = null;
            complete(msg);
        }
        waitForOne() {
            return new Promise((complete) => {
                this._currentComplete = complete;
                this._trigger();
            });
        }
    }
    class EtherStream extends events_1.EventEmitter {
        constructor(_ether, _name) {
            super();
            this._ether = _ether;
            this._name = _name;
        }
        write(data, cb) {
            if (!Buffer.isBuffer(data)) {
                throw new Error(`Invalid data`);
            }
            this._ether.write(this._name, data);
            return true;
        }
    }
    class Ether {
        constructor() {
            this._a = new EtherStream(this, 'a');
            this._b = new EtherStream(this, 'b');
            this._ab = [];
            this._ba = [];
        }
        get a() {
            return this._a;
        }
        get b() {
            return this._b;
        }
        write(from, data) {
            if (from === 'a') {
                this._ab.push(data);
            }
            else {
                this._ba.push(data);
            }
            setImmediate(() => this._deliver());
        }
        _deliver() {
            if (this._ab.length > 0) {
                const data = Buffer.concat(this._ab);
                this._ab.length = 0;
                this._b.emit('data', data);
                setImmediate(() => this._deliver());
                return;
            }
            if (this._ba.length > 0) {
                const data = Buffer.concat(this._ba);
                this._ba.length = 0;
                this._a.emit('data', data);
                setImmediate(() => this._deliver());
                return;
            }
        }
    }
    suite('IPC, Socket Protocol', () => {
        let ether;
        setup(() => {
            ether = new Ether();
        });
        test('read/write', async () => {
            const a = new ipc_net_1.Protocol(new ipc_net_2.NodeSocket(ether.a));
            const b = new ipc_net_1.Protocol(new ipc_net_2.NodeSocket(ether.b));
            const bMessages = new MessageStream(b);
            a.send(buffer_1.VSBuffer.fromString('foobarfarboo'));
            const msg1 = await bMessages.waitForOne();
            assert.strictEqual(msg1.toString(), 'foobarfarboo');
            const buffer = buffer_1.VSBuffer.alloc(1);
            buffer.writeUInt8(123, 0);
            a.send(buffer);
            const msg2 = await bMessages.waitForOne();
            assert.strictEqual(msg2.readUInt8(0), 123);
        });
        test('read/write, object data', async () => {
            const a = new ipc_net_1.Protocol(new ipc_net_2.NodeSocket(ether.a));
            const b = new ipc_net_1.Protocol(new ipc_net_2.NodeSocket(ether.b));
            const bMessages = new MessageStream(b);
            const data = {
                pi: Math.PI,
                foo: 'bar',
                more: true,
                data: 'Hello World'.split('')
            };
            a.send(buffer_1.VSBuffer.fromString(JSON.stringify(data)));
            const msg = await bMessages.waitForOne();
            assert.deepStrictEqual(JSON.parse(msg.toString()), data);
        });
    });
    suite('PersistentProtocol reconnection', () => {
        let ether;
        setup(() => {
            ether = new Ether();
        });
        test('acks get piggybacked with messages', async () => {
            const a = new ipc_net_1.PersistentProtocol(new ipc_net_2.NodeSocket(ether.a));
            const aMessages = new MessageStream(a);
            const b = new ipc_net_1.PersistentProtocol(new ipc_net_2.NodeSocket(ether.b));
            const bMessages = new MessageStream(b);
            a.send(buffer_1.VSBuffer.fromString('a1'));
            assert.strictEqual(a.unacknowledgedCount, 1);
            assert.strictEqual(b.unacknowledgedCount, 0);
            a.send(buffer_1.VSBuffer.fromString('a2'));
            assert.strictEqual(a.unacknowledgedCount, 2);
            assert.strictEqual(b.unacknowledgedCount, 0);
            a.send(buffer_1.VSBuffer.fromString('a3'));
            assert.strictEqual(a.unacknowledgedCount, 3);
            assert.strictEqual(b.unacknowledgedCount, 0);
            const a1 = await bMessages.waitForOne();
            assert.strictEqual(a1.toString(), 'a1');
            assert.strictEqual(a.unacknowledgedCount, 3);
            assert.strictEqual(b.unacknowledgedCount, 0);
            const a2 = await bMessages.waitForOne();
            assert.strictEqual(a2.toString(), 'a2');
            assert.strictEqual(a.unacknowledgedCount, 3);
            assert.strictEqual(b.unacknowledgedCount, 0);
            const a3 = await bMessages.waitForOne();
            assert.strictEqual(a3.toString(), 'a3');
            assert.strictEqual(a.unacknowledgedCount, 3);
            assert.strictEqual(b.unacknowledgedCount, 0);
            b.send(buffer_1.VSBuffer.fromString('b1'));
            assert.strictEqual(a.unacknowledgedCount, 3);
            assert.strictEqual(b.unacknowledgedCount, 1);
            const b1 = await aMessages.waitForOne();
            assert.strictEqual(b1.toString(), 'b1');
            assert.strictEqual(a.unacknowledgedCount, 0);
            assert.strictEqual(b.unacknowledgedCount, 1);
            a.send(buffer_1.VSBuffer.fromString('a4'));
            assert.strictEqual(a.unacknowledgedCount, 1);
            assert.strictEqual(b.unacknowledgedCount, 1);
            const b2 = await bMessages.waitForOne();
            assert.strictEqual(b2.toString(), 'a4');
            assert.strictEqual(a.unacknowledgedCount, 1);
            assert.strictEqual(b.unacknowledgedCount, 0);
        });
    });
    suite('IPC, create handle', () => {
        test('createRandomIPCHandle', async () => {
            return testIPCHandle((0, ipc_net_2.createRandomIPCHandle)());
        });
        test('createStaticIPCHandle', async () => {
            return testIPCHandle((0, ipc_net_2.createStaticIPCHandle)((0, os_1.tmpdir)(), 'test', product_1.default.version));
        });
        function testIPCHandle(handle) {
            return new Promise((resolve, reject) => {
                const pipeName = (0, ipc_net_2.createRandomIPCHandle)();
                const server = (0, net_1.createServer)();
                server.on('error', () => {
                    return new Promise(() => server.close(() => reject()));
                });
                server.listen(pipeName, () => {
                    server.removeListener('error', reject);
                    return new Promise(() => {
                        server.close(() => resolve());
                    });
                });
            });
        }
    });
});
//# sourceMappingURL=ipc.net.test.js.map