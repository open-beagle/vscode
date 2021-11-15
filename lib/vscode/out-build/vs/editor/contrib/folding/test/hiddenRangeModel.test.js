define(["require", "exports", "assert", "vs/editor/contrib/folding/foldingModel", "vs/editor/test/common/editorTestUtils", "vs/editor/contrib/folding/indentRangeProvider", "./foldingModel.test", "vs/editor/contrib/folding/hiddenRangeModel"], function (require, exports, assert, foldingModel_1, editorTestUtils_1, indentRangeProvider_1, foldingModel_test_1, hiddenRangeModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Hidden Range Model', () => {
        function r(startLineNumber, endLineNumber) {
            return { startLineNumber, endLineNumber };
        }
        function assertRanges(actual, expectedRegions, message) {
            assert.deepStrictEqual(actual.map(r => ({ startLineNumber: r.startLineNumber, endLineNumber: r.endLineNumber })), expectedRegions, message);
        }
        test('hasRanges', () => {
            let lines = [
                /* 1*/ '/**',
                /* 2*/ ' * Comment',
                /* 3*/ ' */',
                /* 4*/ 'class A {',
                /* 5*/ '  void foo() {',
                /* 6*/ '    if (true) {',
                /* 7*/ '      //hello',
                /* 8*/ '    }',
                /* 9*/ '  }',
                /* 10*/ '}'
            ];
            let textModel = (0, editorTestUtils_1.createTextModel)(lines.join('\n'));
            let foldingModel = new foldingModel_1.FoldingModel(textModel, new foldingModel_test_1.TestDecorationProvider(textModel));
            let hiddenRangeModel = new hiddenRangeModel_1.HiddenRangeModel(foldingModel);
            assert.strictEqual(hiddenRangeModel.hasRanges(), false);
            let ranges = (0, indentRangeProvider_1.computeRanges)(textModel, false, undefined);
            foldingModel.update(ranges);
            foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(1), foldingModel.getRegionAtLine(6)]);
            assertRanges(hiddenRangeModel.hiddenRanges, [r(2, 3), r(7, 7)]);
            assert.strictEqual(hiddenRangeModel.hasRanges(), true);
            assert.strictEqual(hiddenRangeModel.isHidden(1), false);
            assert.strictEqual(hiddenRangeModel.isHidden(2), true);
            assert.strictEqual(hiddenRangeModel.isHidden(3), true);
            assert.strictEqual(hiddenRangeModel.isHidden(4), false);
            assert.strictEqual(hiddenRangeModel.isHidden(5), false);
            assert.strictEqual(hiddenRangeModel.isHidden(6), false);
            assert.strictEqual(hiddenRangeModel.isHidden(7), true);
            assert.strictEqual(hiddenRangeModel.isHidden(8), false);
            assert.strictEqual(hiddenRangeModel.isHidden(9), false);
            assert.strictEqual(hiddenRangeModel.isHidden(10), false);
            foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(4)]);
            assertRanges(hiddenRangeModel.hiddenRanges, [r(2, 3), r(5, 9)]);
            assert.strictEqual(hiddenRangeModel.hasRanges(), true);
            assert.strictEqual(hiddenRangeModel.isHidden(1), false);
            assert.strictEqual(hiddenRangeModel.isHidden(2), true);
            assert.strictEqual(hiddenRangeModel.isHidden(3), true);
            assert.strictEqual(hiddenRangeModel.isHidden(4), false);
            assert.strictEqual(hiddenRangeModel.isHidden(5), true);
            assert.strictEqual(hiddenRangeModel.isHidden(6), true);
            assert.strictEqual(hiddenRangeModel.isHidden(7), true);
            assert.strictEqual(hiddenRangeModel.isHidden(8), true);
            assert.strictEqual(hiddenRangeModel.isHidden(9), true);
            assert.strictEqual(hiddenRangeModel.isHidden(10), false);
            foldingModel.toggleCollapseState([foldingModel.getRegionAtLine(1), foldingModel.getRegionAtLine(6), foldingModel.getRegionAtLine(4)]);
            assertRanges(hiddenRangeModel.hiddenRanges, []);
            assert.strictEqual(hiddenRangeModel.hasRanges(), false);
            assert.strictEqual(hiddenRangeModel.isHidden(1), false);
            assert.strictEqual(hiddenRangeModel.isHidden(2), false);
            assert.strictEqual(hiddenRangeModel.isHidden(3), false);
            assert.strictEqual(hiddenRangeModel.isHidden(4), false);
            assert.strictEqual(hiddenRangeModel.isHidden(5), false);
            assert.strictEqual(hiddenRangeModel.isHidden(6), false);
            assert.strictEqual(hiddenRangeModel.isHidden(7), false);
            assert.strictEqual(hiddenRangeModel.isHidden(8), false);
            assert.strictEqual(hiddenRangeModel.isHidden(9), false);
            assert.strictEqual(hiddenRangeModel.isHidden(10), false);
        });
    });
});
//# sourceMappingURL=hiddenRangeModel.test.js.map