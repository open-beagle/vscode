/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/terminal/browser/links/terminalValidatedLocalLinkProvider", "xterm", "vs/base/common/strings", "vs/base/common/uri", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/test/common/instantiationServiceMock"], function (require, exports, assert, terminalValidatedLocalLinkProvider_1, xterm_1, strings_1, uri_1, testConfigurationService_1, configuration_1, instantiationServiceMock_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const unixLinks = [
        '/foo',
        '~/foo',
        './foo',
        '../foo',
        '/foo/bar',
        '/foo/bar+more',
        'foo/bar',
        'foo/bar+more',
    ];
    const windowsLinks = [
        'c:\\foo',
        '\\\\?\\c:\\foo',
        'c:/foo',
        '.\\foo',
        './foo',
        '..\\foo',
        '~\\foo',
        '~/foo',
        'c:/foo/bar',
        'c:\\foo\\bar',
        'c:\\foo\\bar+more',
        'c:\\foo/bar\\baz',
        'foo/bar',
        'foo/bar',
        'foo\\bar',
        'foo\\bar+more',
    ];
    const supportedLinkFormats = [
        { urlFormat: '{0}' },
        { urlFormat: '{0} on line {1}', line: '5' },
        { urlFormat: '{0} on line {1}, column {2}', line: '5', column: '3' },
        { urlFormat: '{0}:line {1}', line: '5' },
        { urlFormat: '{0}:line {1}, column {2}', line: '5', column: '3' },
        { urlFormat: '{0}({1})', line: '5' },
        { urlFormat: '{0} ({1})', line: '5' },
        { urlFormat: '{0}({1},{2})', line: '5', column: '3' },
        { urlFormat: '{0} ({1},{2})', line: '5', column: '3' },
        { urlFormat: '{0}({1}, {2})', line: '5', column: '3' },
        { urlFormat: '{0} ({1}, {2})', line: '5', column: '3' },
        { urlFormat: '{0}:{1}', line: '5' },
        { urlFormat: '{0}:{1}:{2}', line: '5', column: '3' },
        { urlFormat: '{0}[{1}]', line: '5' },
        { urlFormat: '{0} [{1}]', line: '5' },
        { urlFormat: '{0}[{1},{2}]', line: '5', column: '3' },
        { urlFormat: '{0} [{1},{2}]', line: '5', column: '3' },
        { urlFormat: '{0}[{1}, {2}]', line: '5', column: '3' },
        { urlFormat: '{0} [{1}, {2}]', line: '5', column: '3' },
        { urlFormat: '{0}",{1}', line: '5' }
    ];
    suite('Workbench - TerminalValidatedLocalLinkProvider', () => {
        let instantiationService;
        setup(() => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(configuration_1.IConfigurationService, testConfigurationService_1.TestConfigurationService);
        });
        async function assertLink(text, os, expected) {
            const xterm = new xterm_1.Terminal();
            const provider = instantiationService.createInstance(terminalValidatedLocalLinkProvider_1.TerminalValidatedLocalLinkProvider, xterm, os, () => { }, () => { }, () => { }, (_, cb) => { cb({ uri: uri_1.URI.file('/'), isDirectory: false }); });
            // Write the text and wait for the parser to finish
            await new Promise(r => xterm.write(text, r));
            // Ensure all links are provided
            const links = (await new Promise(r => provider.provideLinks(1, r)));
            assert.strictEqual(links.length, expected.length);
            const actual = links.map(e => ({
                text: e.text,
                range: e.range
            }));
            const expectedVerbose = expected.map(e => ({
                text: e.text,
                range: {
                    start: { x: e.range[0][0], y: e.range[0][1] },
                    end: { x: e.range[1][0], y: e.range[1][1] },
                }
            }));
            assert.deepStrictEqual(actual, expectedVerbose);
        }
        suite('Linux/macOS', () => {
            unixLinks.forEach(baseLink => {
                suite(`Link: ${baseLink}`, () => {
                    for (let i = 0; i < supportedLinkFormats.length; i++) {
                        const linkFormat = supportedLinkFormats[i];
                        test(`Format: ${linkFormat.urlFormat}`, async () => {
                            const formattedLink = (0, strings_1.format)(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
                            await assertLink(formattedLink, 3 /* Linux */, [{ text: formattedLink, range: [[1, 1], [formattedLink.length, 1]] }]);
                            await assertLink(` ${formattedLink} `, 3 /* Linux */, [{ text: formattedLink, range: [[2, 1], [formattedLink.length + 1, 1]] }]);
                            await assertLink(`(${formattedLink})`, 3 /* Linux */, [{ text: formattedLink, range: [[2, 1], [formattedLink.length + 1, 1]] }]);
                            await assertLink(`[${formattedLink}]`, 3 /* Linux */, [{ text: formattedLink, range: [[2, 1], [formattedLink.length + 1, 1]] }]);
                        });
                    }
                });
            });
            test('Git diff links', async () => {
                await assertLink(`diff --git a/foo/bar b/foo/bar`, 3 /* Linux */, [
                    { text: 'foo/bar', range: [[14, 1], [20, 1]] },
                    { text: 'foo/bar', range: [[24, 1], [30, 1]] }
                ]);
                await assertLink(`--- a/foo/bar`, 3 /* Linux */, [{ text: 'foo/bar', range: [[7, 1], [13, 1]] }]);
                await assertLink(`+++ b/foo/bar`, 3 /* Linux */, [{ text: 'foo/bar', range: [[7, 1], [13, 1]] }]);
            });
        });
        suite('Windows', () => {
            windowsLinks.forEach(baseLink => {
                suite(`Link "${baseLink}"`, () => {
                    for (let i = 0; i < supportedLinkFormats.length; i++) {
                        const linkFormat = supportedLinkFormats[i];
                        test(`Format: ${linkFormat.urlFormat}`, async () => {
                            const formattedLink = (0, strings_1.format)(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
                            await assertLink(formattedLink, 1 /* Windows */, [{ text: formattedLink, range: [[1, 1], [formattedLink.length, 1]] }]);
                            await assertLink(` ${formattedLink} `, 1 /* Windows */, [{ text: formattedLink, range: [[2, 1], [formattedLink.length + 1, 1]] }]);
                            await assertLink(`(${formattedLink})`, 1 /* Windows */, [{ text: formattedLink, range: [[2, 1], [formattedLink.length + 1, 1]] }]);
                            await assertLink(`[${formattedLink}]`, 1 /* Windows */, [{ text: formattedLink, range: [[2, 1], [formattedLink.length + 1, 1]] }]);
                        });
                    }
                });
            });
            test('Git diff links', async () => {
                await assertLink(`diff --git a/foo/bar b/foo/bar`, 3 /* Linux */, [
                    { text: 'foo/bar', range: [[14, 1], [20, 1]] },
                    { text: 'foo/bar', range: [[24, 1], [30, 1]] }
                ]);
                await assertLink(`--- a/foo/bar`, 3 /* Linux */, [{ text: 'foo/bar', range: [[7, 1], [13, 1]] }]);
                await assertLink(`+++ b/foo/bar`, 3 /* Linux */, [{ text: 'foo/bar', range: [[7, 1], [13, 1]] }]);
            });
        });
        test('should support multiple link results', async () => {
            await assertLink('./foo ./bar', 3 /* Linux */, [
                { range: [[1, 1], [5, 1]], text: './foo' },
                { range: [[7, 1], [11, 1]], text: './bar' }
            ]);
        });
    });
});
//# sourceMappingURL=terminalValidatedLocalLinkProvider.test.js.map