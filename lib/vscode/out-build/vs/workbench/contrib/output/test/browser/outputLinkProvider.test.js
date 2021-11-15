/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/platform", "vs/workbench/contrib/output/common/outputLinkComputer", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, uri_1, platform_1, outputLinkComputer_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('OutputLinkProvider', () => {
        function toOSPath(p) {
            if (platform_1.isMacintosh || platform_1.isLinux) {
                return p.replace(/\\/g, '/');
            }
            return p;
        }
        test('OutputLinkProvider - Link detection', function () {
            const rootFolder = platform_1.isWindows ? uri_1.URI.file('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala') :
                uri_1.URI.file('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala');
            let patterns = outputLinkComputer_1.OutputLinkComputer.createPatterns(rootFolder);
            let contextService = new workbenchTestServices_1.TestContextService();
            let line = toOSPath('Foo bar');
            let result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 0);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString());
            assert.strictEqual(result[0].range.startColumn, 5);
            assert.strictEqual(result[0].range.endColumn, 84);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336 in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString() + '#336');
            assert.strictEqual(result[0].range.startColumn, 5);
            assert.strictEqual(result[0].range.endColumn, 88);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336:9
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336:9 in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString() + '#336,9');
            assert.strictEqual(result[0].range.startColumn, 5);
            assert.strictEqual(result[0].range.endColumn, 90);
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336:9 in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString() + '#336,9');
            assert.strictEqual(result[0].range.startColumn, 5);
            assert.strictEqual(result[0].range.endColumn, 90);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts>dir
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts>dir in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString());
            assert.strictEqual(result[0].range.startColumn, 5);
            assert.strictEqual(result[0].range.endColumn, 84);
            // Example: at [C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336:9]
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:336:9] in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString() + '#336,9');
            assert.strictEqual(result[0].range.startColumn, 5);
            assert.strictEqual(result[0].range.endColumn, 90);
            // Example: at [C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts]
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts] in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts]').toString());
            // Example: C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\express\server.js on line 8
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts on line 8');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString() + '#8');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 90);
            // Example: C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\express\server.js on line 8, column 13
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts on line 8, column 13');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString() + '#8,13');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 101);
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts on LINE 8, COLUMN 13');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString() + '#8,13');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 101);
            // Example: C:\Users\someone\AppData\Local\Temp\_monacodata_9888\workspaces\express\server.js:line 8
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts:line 8');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString() + '#8');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 87);
            // Example: at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts)
            line = toOSPath(' at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts)');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString());
            assert.strictEqual(result[0].range.startColumn, 15);
            assert.strictEqual(result[0].range.endColumn, 94);
            // Example: at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts:278)
            line = toOSPath(' at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts:278)');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString() + '#278');
            assert.strictEqual(result[0].range.startColumn, 15);
            assert.strictEqual(result[0].range.endColumn, 98);
            // Example: at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts:278:34)
            line = toOSPath(' at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts:278:34)');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString() + '#278,34');
            assert.strictEqual(result[0].range.startColumn, 15);
            assert.strictEqual(result[0].range.endColumn, 101);
            line = toOSPath(' at File.put (C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Game.ts:278:34)');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString() + '#278,34');
            assert.strictEqual(result[0].range.startColumn, 15);
            assert.strictEqual(result[0].range.endColumn, 101);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts(45): error
            line = toOSPath('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts(45): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 102);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts (45,18): error
            line = toOSPath('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts (45): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 103);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts(45,18): error
            line = toOSPath('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts(45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 105);
            line = toOSPath('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts(45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 105);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts (45,18): error
            line = toOSPath('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts (45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 106);
            line = toOSPath('C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/lib/something/Features.ts (45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 106);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts(45): error
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts(45): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 102);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts (45,18): error
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts (45): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 103);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts(45,18): error
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts(45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 105);
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts(45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 105);
            // Example: C:/Users/someone/AppData/Local/Temp/_monacodata_9888/workspaces/mankala/Features.ts (45,18): error
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts (45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 106);
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features.ts (45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/lib/something/Features.ts').toString() + '#45,18');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 106);
            // Example: C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features Special.ts (45,18): error.
            line = toOSPath('C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\lib\\something\\Features Special.ts (45,18): error');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/lib/something/Features Special.ts').toString() + '#45,18');
            assert.strictEqual(result[0].range.startColumn, 1);
            assert.strictEqual(result[0].range.endColumn, 114);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts.
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts. in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString());
            assert.strictEqual(result[0].range.startColumn, 5);
            assert.strictEqual(result[0].range.endColumn, 84);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            // Example: at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game\\
            line = toOSPath(' at C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game\\ in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            // Example: at "C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts"
            line = toOSPath(' at "C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts" in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts').toString());
            assert.strictEqual(result[0].range.startColumn, 6);
            assert.strictEqual(result[0].range.endColumn, 85);
            // Example: at 'C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts'
            line = toOSPath(' at \'C:\\Users\\someone\\AppData\\Local\\Temp\\_monacodata_9888\\workspaces\\mankala\\Game.ts\' in');
            result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].url, contextService.toResource('/Game.ts\'').toString());
            assert.strictEqual(result[0].range.startColumn, 6);
            assert.strictEqual(result[0].range.endColumn, 86);
        });
        test('OutputLinkProvider - #106847', function () {
            const rootFolder = platform_1.isWindows ? uri_1.URI.file('C:\\Users\\username\\Desktop\\test-ts') :
                uri_1.URI.file('C:/Users/username/Desktop');
            let patterns = outputLinkComputer_1.OutputLinkComputer.createPatterns(rootFolder);
            let contextService = new workbenchTestServices_1.TestContextService();
            let line = toOSPath('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa C:\\Users\\username\\Desktop\\test-ts\\prj.conf C:\\Users\\username\\Desktop\\test-ts\\prj.conf C:\\Users\\username\\Desktop\\test-ts\\prj.conf');
            let result = outputLinkComputer_1.OutputLinkComputer.detectLinks(line, 1, patterns, contextService);
            assert.strictEqual(result.length, 3);
            for (const res of result) {
                assert.ok(res.range.startColumn > 0 && res.range.endColumn > 0);
            }
        });
    });
});
//# sourceMappingURL=outputLinkProvider.test.js.map