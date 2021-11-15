/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/core/position", "vs/editor/common/model/mirrorTextModel", "vs/editor/common/model/textModel", "vs/editor/test/common/editorTestUtils"], function (require, exports, assert, position_1, mirrorTextModel_1, textModel_1, editorTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertSyncedModels = exports.testApplyEditsWithSyncedModels = void 0;
    function testApplyEditsWithSyncedModels(original, edits, expected, inputEditsAreInvalid = false) {
        let originalStr = original.join('\n');
        let expectedStr = expected.join('\n');
        assertSyncedModels(originalStr, (model, assertMirrorModels) => {
            // Apply edits & collect inverse edits
            let inverseEdits = model.applyEdits(edits, true);
            // Assert edits produced expected result
            assert.deepStrictEqual(model.getValue(1 /* LF */), expectedStr);
            assertMirrorModels();
            // Apply the inverse edits
            let inverseInverseEdits = model.applyEdits(inverseEdits, true);
            // Assert the inverse edits brought back model to original state
            assert.deepStrictEqual(model.getValue(1 /* LF */), originalStr);
            if (!inputEditsAreInvalid) {
                const simplifyEdit = (edit) => {
                    return {
                        identifier: edit.identifier,
                        range: edit.range,
                        text: edit.text,
                        forceMoveMarkers: edit.forceMoveMarkers || false,
                        isAutoWhitespaceEdit: edit.isAutoWhitespaceEdit || false
                    };
                };
                // Assert the inverse of the inverse edits are the original edits
                assert.deepStrictEqual(inverseInverseEdits.map(simplifyEdit), edits.map(simplifyEdit));
            }
            assertMirrorModels();
        });
    }
    exports.testApplyEditsWithSyncedModels = testApplyEditsWithSyncedModels;
    var AssertDocumentLineMappingDirection;
    (function (AssertDocumentLineMappingDirection) {
        AssertDocumentLineMappingDirection[AssertDocumentLineMappingDirection["OffsetToPosition"] = 0] = "OffsetToPosition";
        AssertDocumentLineMappingDirection[AssertDocumentLineMappingDirection["PositionToOffset"] = 1] = "PositionToOffset";
    })(AssertDocumentLineMappingDirection || (AssertDocumentLineMappingDirection = {}));
    function assertOneDirectionLineMapping(model, direction, msg) {
        let allText = model.getValue();
        let line = 1, column = 1, previousIsCarriageReturn = false;
        for (let offset = 0; offset <= allText.length; offset++) {
            // The position coordinate system cannot express the position between \r and \n
            let position = new position_1.Position(line, column + (previousIsCarriageReturn ? -1 : 0));
            if (direction === 0 /* OffsetToPosition */) {
                let actualPosition = model.getPositionAt(offset);
                assert.strictEqual(actualPosition.toString(), position.toString(), msg + ' - getPositionAt mismatch for offset ' + offset);
            }
            else {
                // The position coordinate system cannot express the position between \r and \n
                let expectedOffset = offset + (previousIsCarriageReturn ? -1 : 0);
                let actualOffset = model.getOffsetAt(position);
                assert.strictEqual(actualOffset, expectedOffset, msg + ' - getOffsetAt mismatch for position ' + position.toString());
            }
            if (allText.charAt(offset) === '\n') {
                line++;
                column = 1;
            }
            else {
                column++;
            }
            previousIsCarriageReturn = (allText.charAt(offset) === '\r');
        }
    }
    function assertLineMapping(model, msg) {
        assertOneDirectionLineMapping(model, 1 /* PositionToOffset */, msg);
        assertOneDirectionLineMapping(model, 0 /* OffsetToPosition */, msg);
    }
    function assertSyncedModels(text, callback, setup = null) {
        let model = (0, editorTestUtils_1.createTextModel)(text, textModel_1.TextModel.DEFAULT_CREATION_OPTIONS, null);
        model.setEOL(0 /* LF */);
        assertLineMapping(model, 'model');
        if (setup) {
            setup(model);
            assertLineMapping(model, 'model');
        }
        let mirrorModel2 = new mirrorTextModel_1.MirrorTextModel(null, model.getLinesContent(), model.getEOL(), model.getVersionId());
        let mirrorModel2PrevVersionId = model.getVersionId();
        model.onDidChangeContent((e) => {
            let versionId = e.versionId;
            if (versionId < mirrorModel2PrevVersionId) {
                console.warn('Model version id did not advance between edits (2)');
            }
            mirrorModel2PrevVersionId = versionId;
            mirrorModel2.onEvents(e);
        });
        let assertMirrorModels = () => {
            assertLineMapping(model, 'model');
            assert.strictEqual(mirrorModel2.getText(), model.getValue(), 'mirror model 2 text OK');
            assert.strictEqual(mirrorModel2.version, model.getVersionId(), 'mirror model 2 version OK');
        };
        callback(model, assertMirrorModels);
        model.dispose();
        mirrorModel2.dispose();
    }
    exports.assertSyncedModels = assertSyncedModels;
});
//# sourceMappingURL=editableTextModelTestUtils.js.map