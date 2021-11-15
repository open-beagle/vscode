/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/modes", "vs/editor/common/modes/languageConfiguration", "vs/editor/common/modes/languageConfigurationRegistry"], function (require, exports, assert, modes_1, languageConfiguration_1, languageConfigurationRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('StandardAutoClosingPairConditional', () => {
        test('Missing notIn', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}' });
            assert.strictEqual(v.isOK(0 /* Other */), true);
            assert.strictEqual(v.isOK(1 /* Comment */), true);
            assert.strictEqual(v.isOK(2 /* String */), true);
            assert.strictEqual(v.isOK(4 /* RegEx */), true);
        });
        test('Empty notIn', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: [] });
            assert.strictEqual(v.isOK(0 /* Other */), true);
            assert.strictEqual(v.isOK(1 /* Comment */), true);
            assert.strictEqual(v.isOK(2 /* String */), true);
            assert.strictEqual(v.isOK(4 /* RegEx */), true);
        });
        test('Invalid notIn', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['bla'] });
            assert.strictEqual(v.isOK(0 /* Other */), true);
            assert.strictEqual(v.isOK(1 /* Comment */), true);
            assert.strictEqual(v.isOK(2 /* String */), true);
            assert.strictEqual(v.isOK(4 /* RegEx */), true);
        });
        test('notIn in strings', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['string'] });
            assert.strictEqual(v.isOK(0 /* Other */), true);
            assert.strictEqual(v.isOK(1 /* Comment */), true);
            assert.strictEqual(v.isOK(2 /* String */), false);
            assert.strictEqual(v.isOK(4 /* RegEx */), true);
        });
        test('notIn in comments', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['comment'] });
            assert.strictEqual(v.isOK(0 /* Other */), true);
            assert.strictEqual(v.isOK(1 /* Comment */), false);
            assert.strictEqual(v.isOK(2 /* String */), true);
            assert.strictEqual(v.isOK(4 /* RegEx */), true);
        });
        test('notIn in regex', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['regex'] });
            assert.strictEqual(v.isOK(0 /* Other */), true);
            assert.strictEqual(v.isOK(1 /* Comment */), true);
            assert.strictEqual(v.isOK(2 /* String */), true);
            assert.strictEqual(v.isOK(4 /* RegEx */), false);
        });
        test('notIn in strings nor comments', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['string', 'comment'] });
            assert.strictEqual(v.isOK(0 /* Other */), true);
            assert.strictEqual(v.isOK(1 /* Comment */), false);
            assert.strictEqual(v.isOK(2 /* String */), false);
            assert.strictEqual(v.isOK(4 /* RegEx */), true);
        });
        test('notIn in strings nor regex', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['string', 'regex'] });
            assert.strictEqual(v.isOK(0 /* Other */), true);
            assert.strictEqual(v.isOK(1 /* Comment */), true);
            assert.strictEqual(v.isOK(2 /* String */), false);
            assert.strictEqual(v.isOK(4 /* RegEx */), false);
        });
        test('notIn in comments nor regex', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['comment', 'regex'] });
            assert.strictEqual(v.isOK(0 /* Other */), true);
            assert.strictEqual(v.isOK(1 /* Comment */), false);
            assert.strictEqual(v.isOK(2 /* String */), true);
            assert.strictEqual(v.isOK(4 /* RegEx */), false);
        });
        test('notIn in strings, comments nor regex', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['string', 'comment', 'regex'] });
            assert.strictEqual(v.isOK(0 /* Other */), true);
            assert.strictEqual(v.isOK(1 /* Comment */), false);
            assert.strictEqual(v.isOK(2 /* String */), false);
            assert.strictEqual(v.isOK(4 /* RegEx */), false);
        });
        test('language configurations priorities', () => {
            var _a;
            const id = new modes_1.LanguageIdentifier('testLang1', 15);
            const d1 = languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(id, { comments: { lineComment: '1' } }, 100);
            const d2 = languageConfigurationRegistry_1.LanguageConfigurationRegistry.register(id, { comments: { lineComment: '2' } }, 10);
            assert.strictEqual((_a = languageConfigurationRegistry_1.LanguageConfigurationRegistry.getComments(id.id)) === null || _a === void 0 ? void 0 : _a.lineCommentToken, '1');
            d1.dispose();
            d2.dispose();
        });
    });
});
//# sourceMappingURL=languageConfiguration.test.js.map