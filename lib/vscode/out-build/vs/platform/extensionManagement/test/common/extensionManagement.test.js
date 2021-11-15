define(["require", "exports", "assert", "vs/platform/extensionManagement/common/extensionManagement"], function (require, exports, assert, extensionManagement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Extension Identifier Pattern', () => {
        test('extension identifier pattern', () => {
            const regEx = new RegExp(extensionManagement_1.EXTENSION_IDENTIFIER_PATTERN);
            assert.strictEqual(true, regEx.test('publisher.name'));
            assert.strictEqual(true, regEx.test('publiSher.name'));
            assert.strictEqual(true, regEx.test('publisher.Name'));
            assert.strictEqual(true, regEx.test('PUBLISHER.NAME'));
            assert.strictEqual(true, regEx.test('PUBLISHEr.NAMe'));
            assert.strictEqual(true, regEx.test('PUBLISHEr.N-AMe'));
            assert.strictEqual(true, regEx.test('PUB-LISHEr.NAMe'));
            assert.strictEqual(true, regEx.test('PUB-LISHEr.N-AMe'));
            assert.strictEqual(true, regEx.test('PUBLISH12Er90.N-A54Me123'));
            assert.strictEqual(true, regEx.test('111PUBLISH12Er90.N-1111A54Me123'));
            assert.strictEqual(false, regEx.test('publishername'));
            assert.strictEqual(false, regEx.test('-publisher.name'));
            assert.strictEqual(false, regEx.test('publisher.-name'));
            assert.strictEqual(false, regEx.test('-publisher.-name'));
            assert.strictEqual(false, regEx.test('publ_isher.name'));
            assert.strictEqual(false, regEx.test('publisher._name'));
        });
    });
});
//# sourceMappingURL=extensionManagement.test.js.map