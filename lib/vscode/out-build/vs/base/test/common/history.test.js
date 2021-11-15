define(["require", "exports", "assert", "vs/base/common/history"], function (require, exports, assert, history_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('History Navigator', () => {
        test('create reduces the input to limit', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 2);
            assert.deepStrictEqual(['3', '4'], toArray(testObject));
        });
        test('create sets the position to last', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 100);
            assert.strictEqual(testObject.current(), null);
            assert.strictEqual(testObject.next(), null);
            assert.strictEqual(testObject.previous(), '4');
        });
        test('last returns last element', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 100);
            assert.strictEqual(testObject.first(), '1');
            assert.strictEqual(testObject.last(), '4');
        });
        test('first returns first element', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            assert.strictEqual('2', testObject.first());
        });
        test('next returns next element', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            testObject.first();
            assert.strictEqual(testObject.next(), '3');
            assert.strictEqual(testObject.next(), '4');
            assert.strictEqual(testObject.next(), null);
        });
        test('previous returns previous element', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            assert.strictEqual(testObject.previous(), '4');
            assert.strictEqual(testObject.previous(), '3');
            assert.strictEqual(testObject.previous(), '2');
            assert.strictEqual(testObject.previous(), null);
        });
        test('next on last element returs null and remains on last', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            testObject.first();
            testObject.last();
            assert.strictEqual(testObject.current(), '4');
            assert.strictEqual(testObject.next(), null);
        });
        test('previous on first element returs null and remains on first', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            testObject.first();
            assert.strictEqual(testObject.current(), '2');
            assert.strictEqual(testObject.previous(), null);
        });
        test('add reduces the input to limit', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 2);
            testObject.add('5');
            assert.deepStrictEqual(toArray(testObject), ['4', '5']);
        });
        test('adding existing element changes the position', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 5);
            testObject.add('2');
            assert.deepStrictEqual(toArray(testObject), ['1', '3', '4', '2']);
        });
        test('add resets the navigator to last', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3', '4'], 3);
            testObject.first();
            testObject.add('5');
            assert.strictEqual(testObject.previous(), '5');
            assert.strictEqual(testObject.next(), null);
        });
        test('adding an existing item changes the order', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3']);
            testObject.add('1');
            assert.deepStrictEqual(['2', '3', '1'], toArray(testObject));
        });
        test('previous returns null if the current position is the first one', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3']);
            testObject.first();
            assert.deepStrictEqual(testObject.previous(), null);
        });
        test('previous returns object if the current position is not the first one', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3']);
            testObject.first();
            testObject.next();
            assert.deepStrictEqual(testObject.previous(), '1');
        });
        test('next returns null if the current position is the last one', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3']);
            testObject.last();
            assert.deepStrictEqual(testObject.next(), null);
        });
        test('next returns object if the current position is not the last one', () => {
            const testObject = new history_1.HistoryNavigator(['1', '2', '3']);
            testObject.last();
            testObject.previous();
            assert.deepStrictEqual(testObject.next(), '3');
        });
        test('clear', () => {
            const testObject = new history_1.HistoryNavigator(['a', 'b', 'c']);
            assert.strictEqual(testObject.previous(), 'c');
            testObject.clear();
            assert.strictEqual(testObject.current(), null);
        });
        function toArray(historyNavigator) {
            let result = [];
            historyNavigator.first();
            if (historyNavigator.current()) {
                do {
                    result.push(historyNavigator.current());
                } while (historyNavigator.next());
            }
            return result;
        }
    });
});
//# sourceMappingURL=history.test.js.map