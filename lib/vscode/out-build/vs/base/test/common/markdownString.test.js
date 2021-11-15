/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/htmlContent"], function (require, exports, assert, htmlContent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MarkdownString', () => {
        test('Escape leading whitespace', function () {
            const mds = new htmlContent_1.MarkdownString();
            mds.appendText('Hello\n    Not a code block');
            assert.strictEqual(mds.value, 'Hello\n\n&nbsp;&nbsp;&nbsp;&nbsp;Not&nbsp;a&nbsp;code&nbsp;block');
        });
        test('MarkdownString.appendText doesn\'t escape quote #109040', function () {
            const mds = new htmlContent_1.MarkdownString();
            mds.appendText('> Text\n>More');
            assert.strictEqual(mds.value, '\\>&nbsp;Text\n\n\\>More');
        });
        test('appendText', () => {
            const mds = new htmlContent_1.MarkdownString();
            mds.appendText('# foo\n*bar*');
            assert.strictEqual(mds.value, '\\#&nbsp;foo\n\n\\*bar\\*');
        });
        suite('ThemeIcons', () => {
            suite('Support On', () => {
                test('appendText', () => {
                    const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: true });
                    mds.appendText('$(zap) $(not a theme icon) $(add)');
                    assert.strictEqual(mds.value, '\\\\$\\(zap\\)&nbsp;$\\(not&nbsp;a&nbsp;theme&nbsp;icon\\)&nbsp;\\\\$\\(add\\)');
                });
                test('appendMarkdown', () => {
                    const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: true });
                    mds.appendMarkdown('$(zap) $(not a theme icon) $(add)');
                    assert.strictEqual(mds.value, '$(zap) $(not a theme icon) $(add)');
                });
                test('appendMarkdown with escaped icon', () => {
                    const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: true });
                    mds.appendMarkdown('\\$(zap) $(not a theme icon) $(add)');
                    assert.strictEqual(mds.value, '\\$(zap) $(not a theme icon) $(add)');
                });
            });
            suite('Support Off', () => {
                test('appendText', () => {
                    const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: false });
                    mds.appendText('$(zap) $(not a theme icon) $(add)');
                    assert.strictEqual(mds.value, '$\\(zap\\)&nbsp;$\\(not&nbsp;a&nbsp;theme&nbsp;icon\\)&nbsp;$\\(add\\)');
                });
                test('appendMarkdown', () => {
                    const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: false });
                    mds.appendMarkdown('$(zap) $(not a theme icon) $(add)');
                    assert.strictEqual(mds.value, '$(zap) $(not a theme icon) $(add)');
                });
                test('appendMarkdown with escaped icon', () => {
                    const mds = new htmlContent_1.MarkdownString(undefined, { supportThemeIcons: true });
                    mds.appendMarkdown('\\$(zap) $(not a theme icon) $(add)');
                    assert.strictEqual(mds.value, '\\$(zap) $(not a theme icon) $(add)');
                });
            });
        });
    });
});
//# sourceMappingURL=markdownString.test.js.map