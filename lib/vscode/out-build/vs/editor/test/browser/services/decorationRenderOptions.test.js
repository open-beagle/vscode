/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/platform", "vs/base/common/uri", "vs/editor/browser/services/codeEditorServiceImpl", "vs/platform/theme/test/common/testThemeService"], function (require, exports, assert, platform, uri_1, codeEditorServiceImpl_1, testThemeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const themeServiceMock = new testThemeService_1.TestThemeService();
    class TestCodeEditorServiceImpl extends codeEditorServiceImpl_1.CodeEditorServiceImpl {
        getActiveCodeEditor() {
            return null;
        }
        openCodeEditor(input, source, sideBySide) {
            return Promise.resolve(null);
        }
    }
    class TestGlobalStyleSheet extends codeEditorServiceImpl_1.GlobalStyleSheet {
        constructor() {
            super(null);
            this.rules = [];
        }
        insertRule(rule, index) {
            this.rules.unshift(rule);
        }
        removeRulesContainingSelector(ruleName) {
            for (let i = 0; i < this.rules.length; i++) {
                if (this.rules[i].indexOf(ruleName) >= 0) {
                    this.rules.splice(i, 1);
                    i--;
                }
            }
        }
        read() {
            return this.rules.join('\n');
        }
    }
    suite('Decoration Render Options', () => {
        let options = {
            gutterIconPath: uri_1.URI.parse('https://github.com/microsoft/vscode/blob/main/resources/linux/code.png'),
            gutterIconSize: 'contain',
            backgroundColor: 'red',
            borderColor: 'yellow'
        };
        test('register and resolve decoration type', () => {
            let s = new TestCodeEditorServiceImpl(null, themeServiceMock);
            s.registerDecorationType('example', options);
            assert.notStrictEqual(s.resolveDecorationOptions('example', false), undefined);
        });
        test('remove decoration type', () => {
            let s = new TestCodeEditorServiceImpl(null, themeServiceMock);
            s.registerDecorationType('example', options);
            assert.notStrictEqual(s.resolveDecorationOptions('example', false), undefined);
            s.removeDecorationType('example');
            assert.throws(() => s.resolveDecorationOptions('example', false));
        });
        function readStyleSheet(styleSheet) {
            return styleSheet.read();
        }
        test('css properties', () => {
            const styleSheet = new TestGlobalStyleSheet();
            const s = new TestCodeEditorServiceImpl(styleSheet, themeServiceMock);
            s.registerDecorationType('example', options);
            const sheet = readStyleSheet(styleSheet);
            assert(sheet.indexOf(`{background:url('https://github.com/microsoft/vscode/blob/main/resources/linux/code.png') center center no-repeat;background-size:contain;}`) >= 0);
            assert(sheet.indexOf(`{background-color:red;border-color:yellow;box-sizing: border-box;}`) >= 0);
        });
        test('theme color', () => {
            const options = {
                backgroundColor: { id: 'editorBackground' },
                borderColor: { id: 'editorBorder' },
            };
            const styleSheet = new TestGlobalStyleSheet();
            const themeService = new testThemeService_1.TestThemeService(new testThemeService_1.TestColorTheme({
                editorBackground: '#FF0000'
            }));
            const s = new TestCodeEditorServiceImpl(styleSheet, themeService);
            s.registerDecorationType('example', options);
            assert.strictEqual(readStyleSheet(styleSheet), '.monaco-editor .ced-example-0 {background-color:#ff0000;border-color:transparent;box-sizing: border-box;}');
            themeService.setTheme(new testThemeService_1.TestColorTheme({
                editorBackground: '#EE0000',
                editorBorder: '#00FFFF'
            }));
            assert.strictEqual(readStyleSheet(styleSheet), '.monaco-editor .ced-example-0 {background-color:#ee0000;border-color:#00ffff;box-sizing: border-box;}');
            s.removeDecorationType('example');
            assert.strictEqual(readStyleSheet(styleSheet), '');
        });
        test('theme overrides', () => {
            const options = {
                color: { id: 'editorBackground' },
                light: {
                    color: '#FF00FF'
                },
                dark: {
                    color: '#000000',
                    after: {
                        color: { id: 'infoForeground' }
                    }
                }
            };
            const styleSheet = new TestGlobalStyleSheet();
            const themeService = new testThemeService_1.TestThemeService(new testThemeService_1.TestColorTheme({
                editorBackground: '#FF0000',
                infoForeground: '#444444'
            }));
            const s = new TestCodeEditorServiceImpl(styleSheet, themeService);
            s.registerDecorationType('example', options);
            const expected = [
                '.vs-dark.monaco-editor .ced-example-4::after, .hc-black.monaco-editor .ced-example-4::after {color:#444444 !important;}',
                '.vs-dark.monaco-editor .ced-example-1, .hc-black.monaco-editor .ced-example-1 {color:#000000 !important;}',
                '.vs.monaco-editor .ced-example-1 {color:#FF00FF !important;}',
                '.monaco-editor .ced-example-1 {color:#ff0000 !important;}'
            ].join('\n');
            assert.strictEqual(readStyleSheet(styleSheet), expected);
            s.removeDecorationType('example');
            assert.strictEqual(readStyleSheet(styleSheet), '');
        });
        test('css properties, gutterIconPaths', () => {
            const styleSheet = new TestGlobalStyleSheet();
            const s = new TestCodeEditorServiceImpl(styleSheet, themeServiceMock);
            // URI, only minimal encoding
            s.registerDecorationType('example', { gutterIconPath: uri_1.URI.parse('data:image/svg+xml;base64,PHN2ZyB4b+') });
            assert(readStyleSheet(styleSheet).indexOf(`{background:url('data:image/svg+xml;base64,PHN2ZyB4b+') center center no-repeat;}`) > 0);
            s.removeDecorationType('example');
            function assertBackground(url1, url2) {
                const actual = readStyleSheet(styleSheet);
                assert(actual.indexOf(`{background:url('${url1}') center center no-repeat;}`) > 0
                    || actual.indexOf(`{background:url('${url2}') center center no-repeat;}`) > 0);
            }
            if (platform.isWindows) {
                // windows file path (used as string)
                s.registerDecorationType('example', { gutterIconPath: uri_1.URI.file('c:\\files\\miles\\more.png') });
                assertBackground('file:///c:/files/miles/more.png', 'vscode-file://vscode-app/c:/files/miles/more.png');
                s.removeDecorationType('example');
                // single quote must always be escaped/encoded
                s.registerDecorationType('example', { gutterIconPath: uri_1.URI.file('c:\\files\\foo\\b\'ar.png') });
                assertBackground('file:///c:/files/foo/b%27ar.png', 'vscode-file://vscode-app/c:/files/foo/b%27ar.png');
                s.removeDecorationType('example');
            }
            else {
                // unix file path (used as string)
                s.registerDecorationType('example', { gutterIconPath: uri_1.URI.file('/Users/foo/bar.png') });
                assertBackground('file:///Users/foo/bar.png', 'vscode-file://vscode-app/Users/foo/bar.png');
                s.removeDecorationType('example');
                // single quote must always be escaped/encoded
                s.registerDecorationType('example', { gutterIconPath: uri_1.URI.file('/Users/foo/b\'ar.png') });
                assertBackground('file:///Users/foo/b%27ar.png', 'vscode-file://vscode-app/Users/foo/b%27ar.png');
                s.removeDecorationType('example');
            }
            s.registerDecorationType('example', { gutterIconPath: uri_1.URI.parse('http://test/pa\'th') });
            assert(readStyleSheet(styleSheet).indexOf(`{background:url('http://test/pa%27th') center center no-repeat;}`) > 0);
            s.removeDecorationType('example');
        });
    });
});
//# sourceMappingURL=decorationRenderOptions.test.js.map