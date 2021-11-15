define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/editor/browser/services/openerService", "vs/editor/test/browser/editorTestServices", "vs/platform/commands/common/commands", "vs/platform/opener/common/opener"], function (require, exports, assert, lifecycle_1, uri_1, openerService_1, editorTestServices_1, commands_1, opener_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('OpenerService', function () {
        const editorService = new editorTestServices_1.TestCodeEditorService();
        let lastCommand;
        const commandService = new (class {
            constructor() {
                this.onWillExecuteCommand = () => lifecycle_1.Disposable.None;
                this.onDidExecuteCommand = () => lifecycle_1.Disposable.None;
            }
            executeCommand(id, ...args) {
                lastCommand = { id, args };
                return Promise.resolve(undefined);
            }
        })();
        setup(function () {
            lastCommand = undefined;
        });
        test('delegate to editorService, scheme:///fff', async function () {
            const openerService = new openerService_1.OpenerService(editorService, commands_1.NullCommandService);
            await openerService.open(uri_1.URI.parse('another:///somepath'));
            assert.strictEqual(editorService.lastInput.options.selection, undefined);
        });
        test('delegate to editorService, scheme:///fff#L123', async function () {
            const openerService = new openerService_1.OpenerService(editorService, commands_1.NullCommandService);
            await openerService.open(uri_1.URI.parse('file:///somepath#L23'));
            assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
            assert.strictEqual(editorService.lastInput.options.selection.startColumn, 1);
            assert.strictEqual(editorService.lastInput.options.selection.endLineNumber, undefined);
            assert.strictEqual(editorService.lastInput.options.selection.endColumn, undefined);
            assert.strictEqual(editorService.lastInput.resource.fragment, '');
            await openerService.open(uri_1.URI.parse('another:///somepath#L23'));
            assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
            assert.strictEqual(editorService.lastInput.options.selection.startColumn, 1);
            await openerService.open(uri_1.URI.parse('another:///somepath#L23,45'));
            assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
            assert.strictEqual(editorService.lastInput.options.selection.startColumn, 45);
            assert.strictEqual(editorService.lastInput.options.selection.endLineNumber, undefined);
            assert.strictEqual(editorService.lastInput.options.selection.endColumn, undefined);
            assert.strictEqual(editorService.lastInput.resource.fragment, '');
        });
        test('delegate to editorService, scheme:///fff#123,123', async function () {
            const openerService = new openerService_1.OpenerService(editorService, commands_1.NullCommandService);
            await openerService.open(uri_1.URI.parse('file:///somepath#23'));
            assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
            assert.strictEqual(editorService.lastInput.options.selection.startColumn, 1);
            assert.strictEqual(editorService.lastInput.options.selection.endLineNumber, undefined);
            assert.strictEqual(editorService.lastInput.options.selection.endColumn, undefined);
            assert.strictEqual(editorService.lastInput.resource.fragment, '');
            await openerService.open(uri_1.URI.parse('file:///somepath#23,45'));
            assert.strictEqual(editorService.lastInput.options.selection.startLineNumber, 23);
            assert.strictEqual(editorService.lastInput.options.selection.startColumn, 45);
            assert.strictEqual(editorService.lastInput.options.selection.endLineNumber, undefined);
            assert.strictEqual(editorService.lastInput.options.selection.endColumn, undefined);
            assert.strictEqual(editorService.lastInput.resource.fragment, '');
        });
        test('delegate to commandsService, command:someid', async function () {
            const openerService = new openerService_1.OpenerService(editorService, commandService);
            const id = `aCommand${Math.random()}`;
            commands_1.CommandsRegistry.registerCommand(id, function () { });
            assert.strictEqual(lastCommand, undefined);
            await openerService.open(uri_1.URI.parse('command:' + id));
            assert.strictEqual(lastCommand, undefined);
        });
        test('delegate to commandsService, command:someid', async function () {
            const openerService = new openerService_1.OpenerService(editorService, commandService);
            const id = `aCommand${Math.random()}`;
            commands_1.CommandsRegistry.registerCommand(id, function () { });
            await openerService.open(uri_1.URI.parse('command:' + id).with({ query: '\"123\"' }), { allowCommands: true });
            assert.strictEqual(lastCommand.id, id);
            assert.strictEqual(lastCommand.args.length, 1);
            assert.strictEqual(lastCommand.args[0], '123');
            await openerService.open(uri_1.URI.parse('command:' + id), { allowCommands: true });
            assert.strictEqual(lastCommand.id, id);
            assert.strictEqual(lastCommand.args.length, 0);
            await openerService.open(uri_1.URI.parse('command:' + id).with({ query: '123' }), { allowCommands: true });
            assert.strictEqual(lastCommand.id, id);
            assert.strictEqual(lastCommand.args.length, 1);
            assert.strictEqual(lastCommand.args[0], 123);
            await openerService.open(uri_1.URI.parse('command:' + id).with({ query: JSON.stringify([12, true]) }), { allowCommands: true });
            assert.strictEqual(lastCommand.id, id);
            assert.strictEqual(lastCommand.args.length, 2);
            assert.strictEqual(lastCommand.args[0], 12);
            assert.strictEqual(lastCommand.args[1], true);
        });
        test('links are protected by validators', async function () {
            const openerService = new openerService_1.OpenerService(editorService, commandService);
            openerService.registerValidator({ shouldOpen: () => Promise.resolve(false) });
            const httpResult = await openerService.open(uri_1.URI.parse('https://www.microsoft.com'));
            const httpsResult = await openerService.open(uri_1.URI.parse('https://www.microsoft.com'));
            assert.strictEqual(httpResult, false);
            assert.strictEqual(httpsResult, false);
        });
        test('links validated by validators go to openers', async function () {
            const openerService = new openerService_1.OpenerService(editorService, commandService);
            openerService.registerValidator({ shouldOpen: () => Promise.resolve(true) });
            let openCount = 0;
            openerService.registerOpener({
                open: (resource) => {
                    openCount++;
                    return Promise.resolve(true);
                }
            });
            await openerService.open(uri_1.URI.parse('http://microsoft.com'));
            assert.strictEqual(openCount, 1);
            await openerService.open(uri_1.URI.parse('https://microsoft.com'));
            assert.strictEqual(openCount, 2);
        });
        test('links aren\'t manipulated before being passed to validator: PR #118226', async function () {
            const openerService = new openerService_1.OpenerService(editorService, commandService);
            openerService.registerValidator({
                shouldOpen: (resource) => {
                    // We don't want it to convert strings into URIs
                    assert.strictEqual(resource instanceof uri_1.URI, false);
                    return Promise.resolve(false);
                }
            });
            await openerService.open('https://wwww.microsoft.com');
            await openerService.open('https://www.microsoft.com??params=CountryCode%3DUSA%26Name%3Dvscode"');
        });
        test('links validated by multiple validators', async function () {
            const openerService = new openerService_1.OpenerService(editorService, commandService);
            let v1 = 0;
            openerService.registerValidator({
                shouldOpen: () => {
                    v1++;
                    return Promise.resolve(true);
                }
            });
            let v2 = 0;
            openerService.registerValidator({
                shouldOpen: () => {
                    v2++;
                    return Promise.resolve(true);
                }
            });
            let openCount = 0;
            openerService.registerOpener({
                open: (resource) => {
                    openCount++;
                    return Promise.resolve(true);
                }
            });
            await openerService.open(uri_1.URI.parse('http://microsoft.com'));
            assert.strictEqual(openCount, 1);
            assert.strictEqual(v1, 1);
            assert.strictEqual(v2, 1);
            await openerService.open(uri_1.URI.parse('https://microsoft.com'));
            assert.strictEqual(openCount, 2);
            assert.strictEqual(v1, 2);
            assert.strictEqual(v2, 2);
        });
        test('links invalidated by first validator do not continue validating', async function () {
            const openerService = new openerService_1.OpenerService(editorService, commandService);
            let v1 = 0;
            openerService.registerValidator({
                shouldOpen: () => {
                    v1++;
                    return Promise.resolve(false);
                }
            });
            let v2 = 0;
            openerService.registerValidator({
                shouldOpen: () => {
                    v2++;
                    return Promise.resolve(true);
                }
            });
            let openCount = 0;
            openerService.registerOpener({
                open: (resource) => {
                    openCount++;
                    return Promise.resolve(true);
                }
            });
            await openerService.open(uri_1.URI.parse('http://microsoft.com'));
            assert.strictEqual(openCount, 0);
            assert.strictEqual(v1, 1);
            assert.strictEqual(v2, 0);
            await openerService.open(uri_1.URI.parse('https://microsoft.com'));
            assert.strictEqual(openCount, 0);
            assert.strictEqual(v1, 2);
            assert.strictEqual(v2, 0);
        });
        test('matchesScheme', function () {
            assert.ok((0, opener_1.matchesScheme)('https://microsoft.com', 'https'));
            assert.ok((0, opener_1.matchesScheme)('http://microsoft.com', 'http'));
            assert.ok((0, opener_1.matchesScheme)('hTTPs://microsoft.com', 'https'));
            assert.ok((0, opener_1.matchesScheme)('httP://microsoft.com', 'http'));
            assert.ok((0, opener_1.matchesScheme)(uri_1.URI.parse('https://microsoft.com'), 'https'));
            assert.ok((0, opener_1.matchesScheme)(uri_1.URI.parse('http://microsoft.com'), 'http'));
            assert.ok((0, opener_1.matchesScheme)(uri_1.URI.parse('hTTPs://microsoft.com'), 'https'));
            assert.ok((0, opener_1.matchesScheme)(uri_1.URI.parse('httP://microsoft.com'), 'http'));
            assert.ok(!(0, opener_1.matchesScheme)(uri_1.URI.parse('https://microsoft.com'), 'http'));
            assert.ok(!(0, opener_1.matchesScheme)(uri_1.URI.parse('htt://microsoft.com'), 'http'));
            assert.ok(!(0, opener_1.matchesScheme)(uri_1.URI.parse('z://microsoft.com'), 'http'));
        });
    });
});
//# sourceMappingURL=openerService.test.js.map