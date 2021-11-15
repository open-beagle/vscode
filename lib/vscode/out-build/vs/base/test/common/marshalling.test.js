define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/marshalling"], function (require, exports, assert, uri_1, marshalling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Marshalling', () => {
        test('RegExp', () => {
            let value = /foo/img;
            let raw = (0, marshalling_1.stringify)(value);
            let clone = (0, marshalling_1.parse)(raw);
            assert.strictEqual(value.source, clone.source);
            assert.strictEqual(value.global, clone.global);
            assert.strictEqual(value.ignoreCase, clone.ignoreCase);
            assert.strictEqual(value.multiline, clone.multiline);
        });
        test('URI', () => {
            const value = uri_1.URI.from({ scheme: 'file', authority: 'server', path: '/shares/c#files', query: 'q', fragment: 'f' });
            const raw = (0, marshalling_1.stringify)(value);
            const clone = (0, marshalling_1.parse)(raw);
            assert.strictEqual(value.scheme, clone.scheme);
            assert.strictEqual(value.authority, clone.authority);
            assert.strictEqual(value.path, clone.path);
            assert.strictEqual(value.query, clone.query);
            assert.strictEqual(value.fragment, clone.fragment);
        });
        test('Bug 16793:# in folder name => mirror models get out of sync', () => {
            const uri1 = uri_1.URI.file('C:\\C#\\file.txt');
            assert.strictEqual((0, marshalling_1.parse)((0, marshalling_1.stringify)(uri1)).toString(), uri1.toString());
        });
    });
});
//# sourceMappingURL=marshalling.test.js.map