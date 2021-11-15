/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/modes/supports/characterPair", "vs/editor/test/common/modesTestUtils", "vs/editor/common/modes/languageConfiguration"], function (require, exports, assert, characterPair_1, modesTestUtils_1, languageConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CharacterPairSupport', () => {
        test('only autoClosingPairs', () => {
            let characaterPairSupport = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: 'a', close: 'b' }] });
            assert.deepStrictEqual(characaterPairSupport.getAutoClosingPairs(), [new languageConfiguration_1.StandardAutoClosingPairConditional({ open: 'a', close: 'b' })]);
            assert.deepStrictEqual(characaterPairSupport.getSurroundingPairs(), [new languageConfiguration_1.StandardAutoClosingPairConditional({ open: 'a', close: 'b' })]);
        });
        test('only empty autoClosingPairs', () => {
            let characaterPairSupport = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [] });
            assert.deepStrictEqual(characaterPairSupport.getAutoClosingPairs(), []);
            assert.deepStrictEqual(characaterPairSupport.getSurroundingPairs(), []);
        });
        test('only brackets', () => {
            let characaterPairSupport = new characterPair_1.CharacterPairSupport({ brackets: [['a', 'b']] });
            assert.deepStrictEqual(characaterPairSupport.getAutoClosingPairs(), [new languageConfiguration_1.StandardAutoClosingPairConditional({ open: 'a', close: 'b' })]);
            assert.deepStrictEqual(characaterPairSupport.getSurroundingPairs(), [new languageConfiguration_1.StandardAutoClosingPairConditional({ open: 'a', close: 'b' })]);
        });
        test('only empty brackets', () => {
            let characaterPairSupport = new characterPair_1.CharacterPairSupport({ brackets: [] });
            assert.deepStrictEqual(characaterPairSupport.getAutoClosingPairs(), []);
            assert.deepStrictEqual(characaterPairSupport.getSurroundingPairs(), []);
        });
        test('only surroundingPairs', () => {
            let characaterPairSupport = new characterPair_1.CharacterPairSupport({ surroundingPairs: [{ open: 'a', close: 'b' }] });
            assert.deepStrictEqual(characaterPairSupport.getAutoClosingPairs(), []);
            assert.deepStrictEqual(characaterPairSupport.getSurroundingPairs(), [{ open: 'a', close: 'b' }]);
        });
        test('only empty surroundingPairs', () => {
            let characaterPairSupport = new characterPair_1.CharacterPairSupport({ surroundingPairs: [] });
            assert.deepStrictEqual(characaterPairSupport.getAutoClosingPairs(), []);
            assert.deepStrictEqual(characaterPairSupport.getSurroundingPairs(), []);
        });
        test('brackets is ignored when having autoClosingPairs', () => {
            let characaterPairSupport = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [], brackets: [['a', 'b']] });
            assert.deepStrictEqual(characaterPairSupport.getAutoClosingPairs(), []);
            assert.deepStrictEqual(characaterPairSupport.getSurroundingPairs(), []);
        });
        function findAutoClosingPair(characterPairSupport, character) {
            return characterPairSupport.getAutoClosingPairs().find(autoClosingPair => autoClosingPair.open === character);
        }
        function testShouldAutoClose(characterPairSupport, line, character, column) {
            const autoClosingPair = findAutoClosingPair(characterPairSupport, character);
            if (!autoClosingPair) {
                return false;
            }
            return characterPair_1.CharacterPairSupport.shouldAutoClosePair(autoClosingPair, (0, modesTestUtils_1.createFakeScopedLineTokens)(line), column);
        }
        test('shouldAutoClosePair in empty line', () => {
            let sup = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: '{', close: '}', notIn: ['string', 'comment'] }] });
            assert.strictEqual(testShouldAutoClose(sup, [], 'a', 1), false);
            assert.strictEqual(testShouldAutoClose(sup, [], '{', 1), true);
        });
        test('shouldAutoClosePair in not interesting line 1', () => {
            let sup = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: '{', close: '}', notIn: ['string', 'comment'] }] });
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'do', type: 0 /* Other */ }], '{', 3), true);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'do', type: 0 /* Other */ }], 'a', 3), false);
        });
        test('shouldAutoClosePair in not interesting line 2', () => {
            let sup = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: '{', close: '}' }] });
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'do', type: 2 /* String */ }], '{', 3), true);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'do', type: 2 /* String */ }], 'a', 3), false);
        });
        test('shouldAutoClosePair in interesting line 1', () => {
            let sup = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: '{', close: '}', notIn: ['string', 'comment'] }] });
            assert.strictEqual(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], '{', 1), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], 'a', 1), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], '{', 2), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], 'a', 2), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], '{', 3), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], 'a', 3), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], '{', 4), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: '"a"', type: 2 /* String */ }], 'a', 4), false);
        });
        test('shouldAutoClosePair in interesting line 2', () => {
            let sup = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: '{', close: '}', notIn: ['string', 'comment'] }] });
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 1), true);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 1), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 2), true);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 2), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 3), true);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 3), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 4), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 4), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 5), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 5), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 6), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 6), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], '{', 7), true);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: 'x=', type: 0 /* Other */ }, { text: '"a"', type: 2 /* String */ }, { text: ';', type: 0 /* Other */ }], 'a', 7), false);
        });
        test('shouldAutoClosePair in interesting line 3', () => {
            let sup = new characterPair_1.CharacterPairSupport({ autoClosingPairs: [{ open: '{', close: '}', notIn: ['string', 'comment'] }] });
            assert.strictEqual(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], '{', 1), true);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], 'a', 1), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], '{', 2), true);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], 'a', 2), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], '{', 3), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], 'a', 3), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], '{', 4), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], 'a', 4), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], '{', 5), false);
            assert.strictEqual(testShouldAutoClose(sup, [{ text: ' ', type: 0 /* Other */ }, { text: '//a', type: 1 /* Comment */ }], 'a', 5), false);
        });
    });
});
//# sourceMappingURL=characterPair.test.js.map