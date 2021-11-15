define(["require", "exports", "assert", "vs/editor/common/config/editorZoom", "vs/editor/test/common/mocks/testConfiguration"], function (require, exports, assert, editorZoom_1, testConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Common Editor Config', () => {
        test('Zoom Level', () => {
            //Zoom levels are defined to go between -5, 20 inclusive
            const zoom = editorZoom_1.EditorZoom;
            zoom.setZoomLevel(0);
            assert.strictEqual(zoom.getZoomLevel(), 0);
            zoom.setZoomLevel(-0);
            assert.strictEqual(zoom.getZoomLevel(), 0);
            zoom.setZoomLevel(5);
            assert.strictEqual(zoom.getZoomLevel(), 5);
            zoom.setZoomLevel(-1);
            assert.strictEqual(zoom.getZoomLevel(), -1);
            zoom.setZoomLevel(9);
            assert.strictEqual(zoom.getZoomLevel(), 9);
            zoom.setZoomLevel(-9);
            assert.strictEqual(zoom.getZoomLevel(), -5);
            zoom.setZoomLevel(20);
            assert.strictEqual(zoom.getZoomLevel(), 20);
            zoom.setZoomLevel(-10);
            assert.strictEqual(zoom.getZoomLevel(), -5);
            zoom.setZoomLevel(9.1);
            assert.strictEqual(zoom.getZoomLevel(), 9.1);
            zoom.setZoomLevel(-9.1);
            assert.strictEqual(zoom.getZoomLevel(), -5);
            zoom.setZoomLevel(Infinity);
            assert.strictEqual(zoom.getZoomLevel(), 20);
            zoom.setZoomLevel(Number.NEGATIVE_INFINITY);
            assert.strictEqual(zoom.getZoomLevel(), -5);
        });
        class TestWrappingConfiguration extends testConfiguration_1.TestConfiguration {
            _getEnvConfiguration() {
                return {
                    extraEditorClassName: '',
                    outerWidth: 1000,
                    outerHeight: 100,
                    emptySelectionClipboard: true,
                    pixelRatio: 1,
                    zoomLevel: 0,
                    accessibilitySupport: 0 /* Unknown */
                };
            }
        }
        function assertWrapping(config, isViewportWrapping, wrappingColumn) {
            const options = config.options;
            const wrappingInfo = options.get(127 /* wrappingInfo */);
            assert.strictEqual(wrappingInfo.isViewportWrapping, isViewportWrapping);
            assert.strictEqual(wrappingInfo.wrappingColumn, wrappingColumn);
        }
        test('wordWrap default', () => {
            let config = new TestWrappingConfiguration({});
            assertWrapping(config, false, -1);
        });
        test('wordWrap compat false', () => {
            let config = new TestWrappingConfiguration({
                wordWrap: false
            });
            assertWrapping(config, false, -1);
        });
        test('wordWrap compat true', () => {
            let config = new TestWrappingConfiguration({
                wordWrap: true
            });
            assertWrapping(config, true, 80);
        });
        test('wordWrap on', () => {
            let config = new TestWrappingConfiguration({
                wordWrap: 'on'
            });
            assertWrapping(config, true, 80);
        });
        test('wordWrap on without minimap', () => {
            let config = new TestWrappingConfiguration({
                wordWrap: 'on',
                minimap: {
                    enabled: false
                }
            });
            assertWrapping(config, true, 88);
        });
        test('wordWrap on does not use wordWrapColumn', () => {
            let config = new TestWrappingConfiguration({
                wordWrap: 'on',
                wordWrapColumn: 10
            });
            assertWrapping(config, true, 80);
        });
        test('wordWrap off', () => {
            let config = new TestWrappingConfiguration({
                wordWrap: 'off'
            });
            assertWrapping(config, false, -1);
        });
        test('wordWrap off does not use wordWrapColumn', () => {
            let config = new TestWrappingConfiguration({
                wordWrap: 'off',
                wordWrapColumn: 10
            });
            assertWrapping(config, false, -1);
        });
        test('wordWrap wordWrapColumn uses default wordWrapColumn', () => {
            let config = new TestWrappingConfiguration({
                wordWrap: 'wordWrapColumn'
            });
            assertWrapping(config, false, 80);
        });
        test('wordWrap wordWrapColumn uses wordWrapColumn', () => {
            let config = new TestWrappingConfiguration({
                wordWrap: 'wordWrapColumn',
                wordWrapColumn: 100
            });
            assertWrapping(config, false, 100);
        });
        test('wordWrap wordWrapColumn validates wordWrapColumn', () => {
            let config = new TestWrappingConfiguration({
                wordWrap: 'wordWrapColumn',
                wordWrapColumn: -1
            });
            assertWrapping(config, false, 1);
        });
        test('wordWrap bounded uses default wordWrapColumn', () => {
            let config = new TestWrappingConfiguration({
                wordWrap: 'bounded'
            });
            assertWrapping(config, true, 80);
        });
        test('wordWrap bounded uses wordWrapColumn', () => {
            let config = new TestWrappingConfiguration({
                wordWrap: 'bounded',
                wordWrapColumn: 40
            });
            assertWrapping(config, true, 40);
        });
        test('wordWrap bounded validates wordWrapColumn', () => {
            let config = new TestWrappingConfiguration({
                wordWrap: 'bounded',
                wordWrapColumn: -1
            });
            assertWrapping(config, true, 1);
        });
        test('issue #53152: Cannot assign to read only property \'enabled\' of object', () => {
            let hoverOptions = {};
            Object.defineProperty(hoverOptions, 'enabled', {
                writable: false,
                value: true
            });
            let config = new testConfiguration_1.TestConfiguration({ hover: hoverOptions });
            assert.strictEqual(config.options.get(50 /* hover */).enabled, true);
            config.updateOptions({ hover: { enabled: false } });
            assert.strictEqual(config.options.get(50 /* hover */).enabled, false);
        });
        test('does not emit event when nothing changes', () => {
            const config = new testConfiguration_1.TestConfiguration({ glyphMargin: true, roundedSelection: false });
            let event = null;
            config.onDidChange(e => event = e);
            assert.strictEqual(config.options.get(46 /* glyphMargin */), true);
            config.updateOptions({ glyphMargin: true });
            config.updateOptions({ roundedSelection: false });
            assert.strictEqual(event, null);
        });
        test('issue #94931: Unable to open source file', () => {
            const config = new testConfiguration_1.TestConfiguration({ quickSuggestions: null });
            const actual = config.options.get(75 /* quickSuggestions */);
            assert.deepStrictEqual(actual, {
                other: true,
                comments: false,
                strings: false
            });
        });
        test('issue #102920: Can\'t snap or split view with JSON files', () => {
            const config = new testConfiguration_1.TestConfiguration({ quickSuggestions: null });
            config.updateOptions({ quickSuggestions: { strings: true } });
            const actual = config.options.get(75 /* quickSuggestions */);
            assert.deepStrictEqual(actual, {
                other: true,
                comments: false,
                strings: true
            });
        });
    });
});
//# sourceMappingURL=commonEditorConfig.test.js.map