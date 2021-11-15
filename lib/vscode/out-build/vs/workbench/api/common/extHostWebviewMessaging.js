/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer"], function (require, exports, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deserializeWebviewMessage = exports.serializeWebviewMessage = void 0;
    class ArrayBufferSet {
        constructor() {
            this.buffers = [];
        }
        add(buffer) {
            let index = this.buffers.indexOf(buffer);
            if (index < 0) {
                index = this.buffers.length;
                this.buffers.push(buffer);
            }
            return index;
        }
    }
    function serializeWebviewMessage(message, transfer) {
        if (transfer) {
            // Extract all ArrayBuffers from the message and replace them with references.
            const arrayBuffers = new ArrayBufferSet();
            const replacer = (_key, value) => {
                if (value instanceof ArrayBuffer) {
                    const index = arrayBuffers.add(value);
                    return {
                        $$vscode_array_buffer_reference$$: true,
                        index,
                    };
                }
                else if (ArrayBuffer.isView(value)) {
                    const type = getTypedArrayType(value);
                    if (type) {
                        const index = arrayBuffers.add(value.buffer);
                        return {
                            $$vscode_array_buffer_reference$$: true,
                            index,
                            view: {
                                type: type,
                                byteLength: value.byteLength,
                                byteOffset: value.byteOffset,
                            }
                        };
                    }
                }
                return value;
            };
            const serializedMessage = JSON.stringify(message, replacer);
            const buffers = arrayBuffers.buffers.map(arrayBuffer => {
                const bytes = new Uint8Array(arrayBuffer);
                return buffer_1.VSBuffer.wrap(bytes);
            });
            return { message: serializedMessage, buffers };
        }
        else {
            return { message: JSON.stringify(message), buffers: [] };
        }
    }
    exports.serializeWebviewMessage = serializeWebviewMessage;
    function getTypedArrayType(value) {
        switch (value.constructor.name) {
            case 'Int8Array': return 1 /* Int8Array */;
            case 'Uint8Array': return 2 /* Uint8Array */;
            case 'Uint8ClampedArray': return 3 /* Uint8ClampedArray */;
            case 'Int16Array': return 4 /* Int16Array */;
            case 'Uint16Array': return 5 /* Uint16Array */;
            case 'Int32Array': return 6 /* Int32Array */;
            case 'Uint32Array': return 7 /* Uint32Array */;
            case 'Float32Array': return 8 /* Float32Array */;
            case 'Float64Array': return 9 /* Float64Array */;
            case 'BigInt64Array': return 10 /* BigInt64Array */;
            case 'BigUint64Array': return 11 /* BigUint64Array */;
        }
        return undefined;
    }
    function deserializeWebviewMessage(jsonMessage, buffers) {
        const arrayBuffers = buffers.map(buffer => {
            const arrayBuffer = new ArrayBuffer(buffer.byteLength);
            const uint8Array = new Uint8Array(arrayBuffer);
            uint8Array.set(buffer.buffer);
            return arrayBuffer;
        });
        const reviver = !buffers.length ? undefined : (_key, value) => {
            if (typeof value === 'object' && value.$$vscode_array_buffer_reference$$) {
                const ref = value;
                const { index } = ref;
                const arrayBuffer = arrayBuffers[index];
                if (ref.view) {
                    switch (ref.view.type) {
                        case 1 /* Int8Array */: return new Int8Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Int8Array.BYTES_PER_ELEMENT);
                        case 2 /* Uint8Array */: return new Uint8Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint8Array.BYTES_PER_ELEMENT);
                        case 3 /* Uint8ClampedArray */: return new Uint8ClampedArray(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint8ClampedArray.BYTES_PER_ELEMENT);
                        case 4 /* Int16Array */: return new Int16Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Int16Array.BYTES_PER_ELEMENT);
                        case 5 /* Uint16Array */: return new Uint16Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint16Array.BYTES_PER_ELEMENT);
                        case 6 /* Int32Array */: return new Int32Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Int32Array.BYTES_PER_ELEMENT);
                        case 7 /* Uint32Array */: return new Uint32Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Uint32Array.BYTES_PER_ELEMENT);
                        case 8 /* Float32Array */: return new Float32Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Float32Array.BYTES_PER_ELEMENT);
                        case 9 /* Float64Array */: return new Float64Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / Float64Array.BYTES_PER_ELEMENT);
                        case 10 /* BigInt64Array */: return new BigInt64Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / BigInt64Array.BYTES_PER_ELEMENT);
                        case 11 /* BigUint64Array */: return new BigUint64Array(arrayBuffer, ref.view.byteOffset, ref.view.byteLength / BigUint64Array.BYTES_PER_ELEMENT);
                        default: throw new Error('Unknown array buffer view type');
                    }
                }
                return arrayBuffer;
            }
            return value;
        };
        const message = JSON.parse(jsonMessage, reviver);
        return { message, arrayBuffers };
    }
    exports.deserializeWebviewMessage = deserializeWebviewMessage;
});
//# sourceMappingURL=extHostWebviewMessaging.js.map