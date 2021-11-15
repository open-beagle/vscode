/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/preferences/browser/settingsTreeModels"], function (require, exports, assert, settingsTreeModels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SettingsTree', () => {
        test('settingKeyToDisplayFormat', () => {
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.bar'), {
                category: 'Foo',
                label: 'Bar'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.bar.etc'), {
                category: 'Foo › Bar',
                label: 'Etc'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('fooBar.etcSomething'), {
                category: 'Foo Bar',
                label: 'Etc Something'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo'), {
                category: '',
                label: 'Foo'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.1leading.number'), {
                category: 'Foo › 1leading',
                label: 'Number'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.1Leading.number'), {
                category: 'Foo › 1 Leading',
                label: 'Number'
            });
        });
        test('settingKeyToDisplayFormat - with category', () => {
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.bar', 'foo'), {
                category: '',
                label: 'Bar'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('disableligatures.ligatures', 'disableligatures'), {
                category: '',
                label: 'Ligatures'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.bar.etc', 'foo'), {
                category: 'Bar',
                label: 'Etc'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('fooBar.etcSomething', 'foo'), {
                category: 'Foo Bar',
                label: 'Etc Something'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.bar.etc', 'foo/bar'), {
                category: '',
                label: 'Etc'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('foo.bar.etc', 'something/foo'), {
                category: 'Bar',
                label: 'Etc'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('bar.etc', 'something.bar'), {
                category: '',
                label: 'Etc'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('fooBar.etc', 'fooBar'), {
                category: '',
                label: 'Etc'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('fooBar.somethingElse.etc', 'fooBar'), {
                category: 'Something Else',
                label: 'Etc'
            });
        });
        test('settingKeyToDisplayFormat - known acronym/term', () => {
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('css.someCssSetting'), {
                category: 'CSS',
                label: 'Some CSS Setting'
            });
            assert.deepStrictEqual((0, settingsTreeModels_1.settingKeyToDisplayFormat)('powershell.somePowerShellSetting'), {
                category: 'PowerShell',
                label: 'Some PowerShell Setting'
            });
        });
        test('parseQuery', () => {
            function testParseQuery(input, expected) {
                assert.deepStrictEqual((0, settingsTreeModels_1.parseQuery)(input), expected, input);
            }
            testParseQuery('', {
                tags: [],
                extensionFilters: [],
                query: '',
                featureFilters: [],
                idFilters: []
            });
            testParseQuery('@modified', {
                tags: ['modified'],
                extensionFilters: [],
                query: '',
                featureFilters: [],
                idFilters: []
            });
            testParseQuery('@tag:foo', {
                tags: ['foo'],
                extensionFilters: [],
                query: '',
                featureFilters: [],
                idFilters: []
            });
            testParseQuery('@modified foo', {
                tags: ['modified'],
                extensionFilters: [],
                query: 'foo',
                featureFilters: [],
                idFilters: []
            });
            testParseQuery('@tag:foo @modified', {
                tags: ['foo', 'modified'],
                extensionFilters: [],
                query: '',
                featureFilters: [],
                idFilters: []
            });
            testParseQuery('@tag:foo @modified my query', {
                tags: ['foo', 'modified'],
                extensionFilters: [],
                query: 'my query',
                featureFilters: [],
                idFilters: []
            });
            testParseQuery('test @modified query', {
                tags: ['modified'],
                extensionFilters: [],
                query: 'test  query',
                featureFilters: [],
                idFilters: []
            });
            testParseQuery('test @modified', {
                tags: ['modified'],
                extensionFilters: [],
                query: 'test',
                featureFilters: [],
                idFilters: []
            });
            testParseQuery('query has @ for some reason', {
                tags: [],
                extensionFilters: [],
                query: 'query has @ for some reason',
                featureFilters: [],
                idFilters: []
            });
            testParseQuery('@ext:github.vscode-pull-request-github', {
                tags: [],
                extensionFilters: ['github.vscode-pull-request-github'],
                query: '',
                featureFilters: [],
                idFilters: []
            });
            testParseQuery('@ext:github.vscode-pull-request-github,vscode.git', {
                tags: [],
                extensionFilters: ['github.vscode-pull-request-github', 'vscode.git'],
                query: '',
                featureFilters: [],
                idFilters: []
            });
            testParseQuery('@feature:scm', {
                tags: [],
                extensionFilters: [],
                featureFilters: ['scm'],
                query: '',
                idFilters: []
            });
            testParseQuery('@feature:scm,terminal', {
                tags: [],
                extensionFilters: [],
                featureFilters: ['scm', 'terminal'],
                query: '',
                idFilters: []
            });
            testParseQuery('@id:files.autoSave', {
                tags: [],
                extensionFilters: [],
                featureFilters: [],
                query: '',
                idFilters: ['files.autoSave']
            });
            testParseQuery('@id:files.autoSave,terminal.integrated.commandsToSkipShell', {
                tags: [],
                extensionFilters: [],
                featureFilters: [],
                query: '',
                idFilters: ['files.autoSave', 'terminal.integrated.commandsToSkipShell']
            });
        });
    });
});
//# sourceMappingURL=settingsTreeModels.test.js.map