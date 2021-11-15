define(["require", "exports", "assert", "vs/editor/common/modes/languageConfiguration", "vs/editor/common/modes/supports/onEnter", "vs/editor/test/common/modes/supports/javascriptOnEnterRules"], function (require, exports, assert, languageConfiguration_1, onEnter_1, javascriptOnEnterRules_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('OnEnter', () => {
        test('uses brackets', () => {
            let brackets = [
                ['(', ')'],
                ['begin', 'end']
            ];
            let support = new onEnter_1.OnEnterSupport({
                brackets: brackets
            });
            let testIndentAction = (beforeText, afterText, expected) => {
                let actual = support.onEnter(3 /* Advanced */, '', beforeText, afterText);
                if (expected === languageConfiguration_1.IndentAction.None) {
                    assert.strictEqual(actual, null);
                }
                else {
                    assert.strictEqual(actual.indentAction, expected);
                }
            };
            testIndentAction('a', '', languageConfiguration_1.IndentAction.None);
            testIndentAction('', 'b', languageConfiguration_1.IndentAction.None);
            testIndentAction('(', 'b', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('a', ')', languageConfiguration_1.IndentAction.None);
            testIndentAction('begin', 'ending', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('abegin', 'end', languageConfiguration_1.IndentAction.None);
            testIndentAction('begin', ')', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('begin', 'end', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('begin ', ' end', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction(' begin', 'end//as', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('(', ')', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('( ', ')', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('a(', ')b', languageConfiguration_1.IndentAction.IndentOutdent);
            testIndentAction('(', '', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('(', 'foo', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('begin', 'foo', languageConfiguration_1.IndentAction.Indent);
            testIndentAction('begin', '', languageConfiguration_1.IndentAction.Indent);
        });
        test('uses regExpRules', () => {
            let support = new onEnter_1.OnEnterSupport({
                onEnterRules: javascriptOnEnterRules_1.javascriptOnEnterRules
            });
            let testIndentAction = (previousLineText, beforeText, afterText, expectedIndentAction, expectedAppendText, removeText = 0) => {
                let actual = support.onEnter(3 /* Advanced */, previousLineText, beforeText, afterText);
                if (expectedIndentAction === null) {
                    assert.strictEqual(actual, null, 'isNull:' + beforeText);
                }
                else {
                    assert.strictEqual(actual !== null, true, 'isNotNull:' + beforeText);
                    assert.strictEqual(actual.indentAction, expectedIndentAction, 'indentAction:' + beforeText);
                    if (expectedAppendText !== null) {
                        assert.strictEqual(actual.appendText, expectedAppendText, 'appendText:' + beforeText);
                    }
                    if (removeText !== 0) {
                        assert.strictEqual(actual.removeText, removeText, 'removeText:' + beforeText);
                    }
                }
            };
            testIndentAction('', '\t/**', ' */', languageConfiguration_1.IndentAction.IndentOutdent, ' * ');
            testIndentAction('', '\t/**', '', languageConfiguration_1.IndentAction.None, ' * ');
            testIndentAction('', '\t/** * / * / * /', '', languageConfiguration_1.IndentAction.None, ' * ');
            testIndentAction('', '\t/** /*', '', languageConfiguration_1.IndentAction.None, ' * ');
            testIndentAction('', '/**', '', languageConfiguration_1.IndentAction.None, ' * ');
            testIndentAction('', '\t/**/', '', null, null);
            testIndentAction('', '\t/***/', '', null, null);
            testIndentAction('', '\t/*******/', '', null, null);
            testIndentAction('', '\t/** * * * * */', '', null, null);
            testIndentAction('', '\t/** */', '', null, null);
            testIndentAction('', '\t/** asdfg */', '', null, null);
            testIndentAction('', '\t/* asdfg */', '', null, null);
            testIndentAction('', '\t/* asdfg */', '', null, null);
            testIndentAction('', '\t/** asdfg */', '', null, null);
            testIndentAction('', '*/', '', null, null);
            testIndentAction('', '\t/*', '', null, null);
            testIndentAction('', '\t*', '', null, null);
            testIndentAction('\t/**', '\t *', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('\t * something', '\t *', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('\t *', '\t *', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('', '\t */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', '\t * */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', '\t * * / * / * / */', '', null, null);
            testIndentAction('\t/**', '\t * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('\t * something', '\t * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('\t *', '\t * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('/**', ' * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * something', ' * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' *', ' * asdfsfagadfg', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('/**', ' * asdfsfagadfg * * * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * something', ' * asdfsfagadfg * * * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' *', ' * asdfsfagadfg * * * ', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('/**', ' * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * something', ' * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' *', ' * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('/**', ' * asdfsfagadfg * / * / * /', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * something', ' * asdfsfagadfg * / * / * /', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' *', ' * asdfsfagadfg * / * / * /', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('/**', ' * asdfsfagadfg * / * / * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' * something', ' * asdfsfagadfg * / * / * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction(' *', ' * asdfsfagadfg * / * / * /*', '', languageConfiguration_1.IndentAction.None, '* ');
            testIndentAction('', ' */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction(' */', ' * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
            testIndentAction('', '\t */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', '\t\t */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', '   */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', '     */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', '\t     */', '', languageConfiguration_1.IndentAction.None, null, 1);
            testIndentAction('', ' *--------------------------------------------------------------------------------------------*/', '', languageConfiguration_1.IndentAction.None, null, 1);
            // issue #43469
            testIndentAction('class A {', '    * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
            testIndentAction('', '    * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
            testIndentAction('    ', '    * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
            testIndentAction('class A {', '  * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
            testIndentAction('', '  * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
            testIndentAction('  ', '  * test() {', '', languageConfiguration_1.IndentAction.Indent, null, 0);
        });
    });
});
//# sourceMappingURL=onEnter.test.js.map