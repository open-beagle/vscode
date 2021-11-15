/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/codeEditor/browser/saveParticipants", "vs/platform/configuration/test/common/testConfigurationService", "vs/workbench/test/browser/workbenchTestServices", "vs/base/test/common/utils", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/workbench/services/textfile/common/textFileEditorModel", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, assert, saveParticipants_1, testConfigurationService_1, workbenchTestServices_1, utils_1, range_1, selection_1, textFileEditorModel_1, textfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Save Participants', function () {
        let instantiationService;
        let accessor;
        setup(() => {
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)();
            accessor = instantiationService.createInstance(workbenchTestServices_1.TestServiceAccessor);
        });
        teardown(() => {
            accessor.textFileService.files.dispose();
        });
        test('insert final new line', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/final_new_line.txt'), 'utf8', undefined);
            await model.resolve();
            const configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('files', { 'insertFinalNewline': true });
            const participant = new saveParticipants_1.FinalNewLineParticipant(configService, undefined);
            // No new line for empty lines
            let lineContent = '';
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), lineContent);
            // No new line if last line already empty
            lineContent = `Hello New Line${model.textEditorModel.getEOL()}`;
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), lineContent);
            // New empty line added (single line)
            lineContent = 'Hello New Line';
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${lineContent}${model.textEditorModel.getEOL()}`);
            // New empty line added (multi line)
            lineContent = `Hello New Line${model.textEditorModel.getEOL()}Hello New Line${model.textEditorModel.getEOL()}Hello New Line`;
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${lineContent}${model.textEditorModel.getEOL()}`);
        });
        test('trim final new lines', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/trim_final_new_line.txt'), 'utf8', undefined);
            await model.resolve();
            const configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('files', { 'trimFinalNewlines': true });
            const participant = new saveParticipants_1.TrimFinalNewLinesParticipant(configService, undefined);
            const textContent = 'Trim New Line';
            const eol = `${model.textEditorModel.getEOL()}`;
            // No new line removal if last line is not new line
            let lineContent = `${textContent}`;
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), lineContent);
            // No new line removal if last line is single new line
            lineContent = `${textContent}${eol}`;
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), lineContent);
            // Remove new line (single line with two new lines)
            lineContent = `${textContent}${eol}${eol}`;
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}${eol}`);
            // Remove new lines (multiple lines with multiple new lines)
            lineContent = `${textContent}${eol}${textContent}${eol}${eol}${eol}`;
            model.textEditorModel.setValue(lineContent);
            await participant.participate(model, { reason: 1 /* EXPLICIT */ });
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}${eol}${textContent}${eol}`);
        });
        test('trim final new lines bug#39750', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/trim_final_new_line.txt'), 'utf8', undefined);
            await model.resolve();
            const configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('files', { 'trimFinalNewlines': true });
            const participant = new saveParticipants_1.TrimFinalNewLinesParticipant(configService, undefined);
            const textContent = 'Trim New Line';
            // single line
            let lineContent = `${textContent}`;
            model.textEditorModel.setValue(lineContent);
            // apply edits and push to undo stack.
            let textEdits = [{ range: new range_1.Range(1, 14, 1, 14), text: '.', forceMoveMarkers: false }];
            model.textEditorModel.pushEditOperations([new selection_1.Selection(1, 14, 1, 14)], textEdits, () => { return [new selection_1.Selection(1, 15, 1, 15)]; });
            // undo
            await model.textEditorModel.undo();
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}`);
            // trim final new lines should not mess the undo stack
            await participant.participate(model, { reason: 1 /* EXPLICIT */ });
            await model.textEditorModel.redo();
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}.`);
        });
        test('trim final new lines bug#46075', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/trim_final_new_line.txt'), 'utf8', undefined);
            await model.resolve();
            const configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('files', { 'trimFinalNewlines': true });
            const participant = new saveParticipants_1.TrimFinalNewLinesParticipant(configService, undefined);
            const textContent = 'Test';
            const eol = `${model.textEditorModel.getEOL()}`;
            let content = `${textContent}${eol}${eol}`;
            model.textEditorModel.setValue(content);
            // save many times
            for (let i = 0; i < 10; i++) {
                await participant.participate(model, { reason: 1 /* EXPLICIT */ });
            }
            // confirm trimming
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}${eol}`);
            // undo should go back to previous content immediately
            await model.textEditorModel.undo();
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}${eol}${eol}`);
            await model.textEditorModel.redo();
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}${eol}`);
        });
        test('trim whitespace', async function () {
            const model = instantiationService.createInstance(textFileEditorModel_1.TextFileEditorModel, utils_1.toResource.call(this, '/path/trim_final_new_line.txt'), 'utf8', undefined);
            await model.resolve();
            const configService = new testConfigurationService_1.TestConfigurationService();
            configService.setUserConfiguration('files', { 'trimTrailingWhitespace': true });
            const participant = new saveParticipants_1.TrimWhitespaceParticipant(configService, undefined);
            const textContent = 'Test';
            let content = `${textContent} 	`;
            model.textEditorModel.setValue(content);
            // save many times
            for (let i = 0; i < 10; i++) {
                await participant.participate(model, { reason: 1 /* EXPLICIT */ });
            }
            // confirm trimming
            assert.strictEqual((0, textfiles_1.snapshotToString)(model.createSnapshot()), `${textContent}`);
        });
    });
});
//# sourceMappingURL=saveParticipant.test.js.map