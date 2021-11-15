/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/mime", "vs/base/common/uri"], function (require, exports, assert, mime_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Mime', () => {
        test('Dynamically Register Text Mime', () => {
            let guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('foo.monaco'));
            assert.deepStrictEqual(guess, ['application/unknown']);
            (0, mime_1.registerTextMime)({ id: 'monaco', extension: '.monaco', mime: 'text/monaco' });
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('foo.monaco'));
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('.monaco'));
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
            (0, mime_1.registerTextMime)({ id: 'codefile', filename: 'Codefile', mime: 'text/code' });
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('Codefile'));
            assert.deepStrictEqual(guess, ['text/code', 'text/plain']);
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('foo.Codefile'));
            assert.deepStrictEqual(guess, ['application/unknown']);
            (0, mime_1.registerTextMime)({ id: 'docker', filepattern: 'Docker*', mime: 'text/docker' });
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('Docker-debug'));
            assert.deepStrictEqual(guess, ['text/docker', 'text/plain']);
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('docker-PROD'));
            assert.deepStrictEqual(guess, ['text/docker', 'text/plain']);
            (0, mime_1.registerTextMime)({ id: 'niceregex', mime: 'text/nice-regex', firstline: /RegexesAreNice/ });
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('Randomfile.noregistration'), 'RegexesAreNice');
            assert.deepStrictEqual(guess, ['text/nice-regex', 'text/plain']);
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('Randomfile.noregistration'), 'RegexesAreNotNice');
            assert.deepStrictEqual(guess, ['application/unknown']);
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('Codefile'), 'RegexesAreNice');
            assert.deepStrictEqual(guess, ['text/code', 'text/plain']);
        });
        test('Mimes Priority', () => {
            (0, mime_1.registerTextMime)({ id: 'monaco', extension: '.monaco', mime: 'text/monaco' });
            (0, mime_1.registerTextMime)({ id: 'foobar', mime: 'text/foobar', firstline: /foobar/ });
            let guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('foo.monaco'));
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('foo.monaco'), 'foobar');
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
            (0, mime_1.registerTextMime)({ id: 'docker', filename: 'dockerfile', mime: 'text/winner' });
            (0, mime_1.registerTextMime)({ id: 'docker', filepattern: 'dockerfile*', mime: 'text/looser' });
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('dockerfile'));
            assert.deepStrictEqual(guess, ['text/winner', 'text/plain']);
            (0, mime_1.registerTextMime)({ id: 'azure-looser', mime: 'text/azure-looser', firstline: /azure/ });
            (0, mime_1.registerTextMime)({ id: 'azure-winner', mime: 'text/azure-winner', firstline: /azure/ });
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('azure'), 'azure');
            assert.deepStrictEqual(guess, ['text/azure-winner', 'text/plain']);
        });
        test('Specificity priority 1', () => {
            (0, mime_1.registerTextMime)({ id: 'monaco2', extension: '.monaco2', mime: 'text/monaco2' });
            (0, mime_1.registerTextMime)({ id: 'monaco2', filename: 'specific.monaco2', mime: 'text/specific-monaco2' });
            assert.deepStrictEqual((0, mime_1.guessMimeTypes)(uri_1.URI.file('specific.monaco2')), ['text/specific-monaco2', 'text/plain']);
            assert.deepStrictEqual((0, mime_1.guessMimeTypes)(uri_1.URI.file('foo.monaco2')), ['text/monaco2', 'text/plain']);
        });
        test('Specificity priority 2', () => {
            (0, mime_1.registerTextMime)({ id: 'monaco3', filename: 'specific.monaco3', mime: 'text/specific-monaco3' });
            (0, mime_1.registerTextMime)({ id: 'monaco3', extension: '.monaco3', mime: 'text/monaco3' });
            assert.deepStrictEqual((0, mime_1.guessMimeTypes)(uri_1.URI.file('specific.monaco3')), ['text/specific-monaco3', 'text/plain']);
            assert.deepStrictEqual((0, mime_1.guessMimeTypes)(uri_1.URI.file('foo.monaco3')), ['text/monaco3', 'text/plain']);
        });
        test('Mimes Priority - Longest Extension wins', () => {
            (0, mime_1.registerTextMime)({ id: 'monaco', extension: '.monaco', mime: 'text/monaco' });
            (0, mime_1.registerTextMime)({ id: 'monaco', extension: '.monaco.xml', mime: 'text/monaco-xml' });
            (0, mime_1.registerTextMime)({ id: 'monaco', extension: '.monaco.xml.build', mime: 'text/monaco-xml-build' });
            let guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('foo.monaco'));
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('foo.monaco.xml'));
            assert.deepStrictEqual(guess, ['text/monaco-xml', 'text/plain']);
            guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('foo.monaco.xml.build'));
            assert.deepStrictEqual(guess, ['text/monaco-xml-build', 'text/plain']);
        });
        test('Mimes Priority - User configured wins', () => {
            (0, mime_1.registerTextMime)({ id: 'monaco', extension: '.monaco.xnl', mime: 'text/monaco', userConfigured: true });
            (0, mime_1.registerTextMime)({ id: 'monaco', extension: '.monaco.xml', mime: 'text/monaco-xml' });
            let guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('foo.monaco.xnl'));
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
        });
        test('Mimes Priority - Pattern matches on path if specified', () => {
            (0, mime_1.registerTextMime)({ id: 'monaco', filepattern: '**/dot.monaco.xml', mime: 'text/monaco' });
            (0, mime_1.registerTextMime)({ id: 'other', filepattern: '*ot.other.xml', mime: 'text/other' });
            let guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('/some/path/dot.monaco.xml'));
            assert.deepStrictEqual(guess, ['text/monaco', 'text/plain']);
        });
        test('Mimes Priority - Last registered mime wins', () => {
            (0, mime_1.registerTextMime)({ id: 'monaco', filepattern: '**/dot.monaco.xml', mime: 'text/monaco' });
            (0, mime_1.registerTextMime)({ id: 'other', filepattern: '**/dot.monaco.xml', mime: 'text/other' });
            let guess = (0, mime_1.guessMimeTypes)(uri_1.URI.file('/some/path/dot.monaco.xml'));
            assert.deepStrictEqual(guess, ['text/other', 'text/plain']);
        });
        test('Data URIs', () => {
            (0, mime_1.registerTextMime)({ id: 'data', extension: '.data', mime: 'text/data' });
            assert.deepStrictEqual((0, mime_1.guessMimeTypes)(uri_1.URI.parse(`data:;label:something.data;description:data,`)), ['text/data', 'text/plain']);
        });
    });
});
//# sourceMappingURL=mime.test.js.map