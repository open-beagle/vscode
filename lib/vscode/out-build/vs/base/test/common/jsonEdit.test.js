define(["require", "exports", "vs/base/common/jsonEdit", "assert"], function (require, exports, jsonEdit_1, assert) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('JSON - edits', () => {
        function assertEdit(content, edits, expected) {
            assert(edits);
            let lastEditOffset = content.length;
            for (let i = edits.length - 1; i >= 0; i--) {
                let edit = edits[i];
                assert(edit.offset >= 0 && edit.length >= 0 && edit.offset + edit.length <= content.length);
                assert(typeof edit.content === 'string');
                assert(lastEditOffset >= edit.offset + edit.length); // make sure all edits are ordered
                lastEditOffset = edit.offset;
                content = content.substring(0, edit.offset) + edit.content + content.substring(edit.offset + edit.length);
            }
            assert.strictEqual(content, expected);
        }
        let formatterOptions = {
            insertSpaces: true,
            tabSize: 2,
            eol: '\n'
        };
        test('set property', () => {
            let content = '{\n  "x": "y"\n}';
            let edits = (0, jsonEdit_1.setProperty)(content, ['x'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "x": "bar"\n}');
            content = 'true';
            edits = (0, jsonEdit_1.setProperty)(content, [], 'bar', formatterOptions);
            assertEdit(content, edits, '"bar"');
            content = '{\n  "x": "y"\n}';
            edits = (0, jsonEdit_1.setProperty)(content, ['x'], { key: true }, formatterOptions);
            assertEdit(content, edits, '{\n  "x": {\n    "key": true\n  }\n}');
            content = '{\n  "a": "b",  "x": "y"\n}';
            edits = (0, jsonEdit_1.setProperty)(content, ['a'], null, formatterOptions);
            assertEdit(content, edits, '{\n  "a": null,  "x": "y"\n}');
        });
        test('insert property', () => {
            let content = '{}';
            let edits = (0, jsonEdit_1.setProperty)(content, ['foo'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "foo": "bar"\n}');
            edits = (0, jsonEdit_1.setProperty)(content, ['foo', 'foo2'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "foo": {\n    "foo2": "bar"\n  }\n}');
            content = '{\n}';
            edits = (0, jsonEdit_1.setProperty)(content, ['foo'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "foo": "bar"\n}');
            content = '  {\n  }';
            edits = (0, jsonEdit_1.setProperty)(content, ['foo'], 'bar', formatterOptions);
            assertEdit(content, edits, '  {\n    "foo": "bar"\n  }');
            content = '{\n  "x": "y"\n}';
            edits = (0, jsonEdit_1.setProperty)(content, ['foo'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "x": "y",\n  "foo": "bar"\n}');
            content = '{\n  "x": "y"\n}';
            edits = (0, jsonEdit_1.setProperty)(content, ['e'], 'null', formatterOptions);
            assertEdit(content, edits, '{\n  "x": "y",\n  "e": "null"\n}');
            edits = (0, jsonEdit_1.setProperty)(content, ['x'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "x": "bar"\n}');
            content = '{\n  "x": {\n    "a": 1,\n    "b": true\n  }\n}\n';
            edits = (0, jsonEdit_1.setProperty)(content, ['x'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "x": "bar"\n}\n');
            edits = (0, jsonEdit_1.setProperty)(content, ['x', 'b'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "x": {\n    "a": 1,\n    "b": "bar"\n  }\n}\n');
            edits = (0, jsonEdit_1.setProperty)(content, ['x', 'c'], 'bar', formatterOptions, () => 0);
            assertEdit(content, edits, '{\n  "x": {\n    "c": "bar",\n    "a": 1,\n    "b": true\n  }\n}\n');
            edits = (0, jsonEdit_1.setProperty)(content, ['x', 'c'], 'bar', formatterOptions, () => 1);
            assertEdit(content, edits, '{\n  "x": {\n    "a": 1,\n    "c": "bar",\n    "b": true\n  }\n}\n');
            edits = (0, jsonEdit_1.setProperty)(content, ['x', 'c'], 'bar', formatterOptions, () => 2);
            assertEdit(content, edits, '{\n  "x": {\n    "a": 1,\n    "b": true,\n    "c": "bar"\n  }\n}\n');
            edits = (0, jsonEdit_1.setProperty)(content, ['c'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "x": {\n    "a": 1,\n    "b": true\n  },\n  "c": "bar"\n}\n');
            content = '{\n  "a": [\n    {\n    } \n  ]  \n}';
            edits = (0, jsonEdit_1.setProperty)(content, ['foo'], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "a": [\n    {\n    } \n  ],\n  "foo": "bar"\n}');
            content = '';
            edits = (0, jsonEdit_1.setProperty)(content, ['foo', 0], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "foo": [\n    "bar"\n  ]\n}');
            content = '//comment';
            edits = (0, jsonEdit_1.setProperty)(content, ['foo', 0], 'bar', formatterOptions);
            assertEdit(content, edits, '{\n  "foo": [\n    "bar"\n  ]\n} //comment');
        });
        test('remove property', () => {
            let content = '{\n  "x": "y"\n}';
            let edits = (0, jsonEdit_1.removeProperty)(content, ['x'], formatterOptions);
            assertEdit(content, edits, '{\n}');
            content = '{\n  "x": "y", "a": []\n}';
            edits = (0, jsonEdit_1.removeProperty)(content, ['x'], formatterOptions);
            assertEdit(content, edits, '{\n  "a": []\n}');
            content = '{\n  "x": "y", "a": []\n}';
            edits = (0, jsonEdit_1.removeProperty)(content, ['a'], formatterOptions);
            assertEdit(content, edits, '{\n  "x": "y"\n}');
        });
        test('insert item at 0', () => {
            let content = '[\n  2,\n  3\n]';
            let edits = (0, jsonEdit_1.setProperty)(content, [0], 1, formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  2,\n  3\n]');
        });
        test('insert item at 0 in empty array', () => {
            let content = '[\n]';
            let edits = (0, jsonEdit_1.setProperty)(content, [0], 1, formatterOptions);
            assertEdit(content, edits, '[\n  1\n]');
        });
        test('insert item at an index', () => {
            let content = '[\n  1,\n  3\n]';
            let edits = (0, jsonEdit_1.setProperty)(content, [1], 2, formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  2,\n  3\n]');
        });
        test('insert item at an index im empty array', () => {
            let content = '[\n]';
            let edits = (0, jsonEdit_1.setProperty)(content, [1], 1, formatterOptions);
            assertEdit(content, edits, '[\n  1\n]');
        });
        test('insert item at end index', () => {
            let content = '[\n  1,\n  2\n]';
            let edits = (0, jsonEdit_1.setProperty)(content, [2], 3, formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  2,\n  3\n]');
        });
        test('insert item at end to empty array', () => {
            let content = '[\n]';
            let edits = (0, jsonEdit_1.setProperty)(content, [-1], 'bar', formatterOptions);
            assertEdit(content, edits, '[\n  "bar"\n]');
        });
        test('insert item at end', () => {
            let content = '[\n  1,\n  2\n]';
            let edits = (0, jsonEdit_1.setProperty)(content, [-1], 'bar', formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  2,\n  "bar"\n]');
        });
        test('remove item in array with one item', () => {
            let content = '[\n  1\n]';
            let edits = (0, jsonEdit_1.setProperty)(content, [0], undefined, formatterOptions);
            assertEdit(content, edits, '[]');
        });
        test('remove item in the middle of the array', () => {
            let content = '[\n  1,\n  2,\n  3\n]';
            let edits = (0, jsonEdit_1.setProperty)(content, [1], undefined, formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  3\n]');
        });
        test('remove last item in the array', () => {
            let content = '[\n  1,\n  2,\n  "bar"\n]';
            let edits = (0, jsonEdit_1.setProperty)(content, [2], undefined, formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  2\n]');
        });
        test('remove last item in the array if ends with comma', () => {
            let content = '[\n  1,\n  "foo",\n  "bar",\n]';
            let edits = (0, jsonEdit_1.setProperty)(content, [2], undefined, formatterOptions);
            assertEdit(content, edits, '[\n  1,\n  "foo"\n]');
        });
        test('remove last item in the array if there is a comment in the beginning', () => {
            let content = '// This is a comment\n[\n  1,\n  "foo",\n  "bar"\n]';
            let edits = (0, jsonEdit_1.setProperty)(content, [2], undefined, formatterOptions);
            assertEdit(content, edits, '// This is a comment\n[\n  1,\n  "foo"\n]');
        });
    });
});
//# sourceMappingURL=jsonEdit.test.js.map