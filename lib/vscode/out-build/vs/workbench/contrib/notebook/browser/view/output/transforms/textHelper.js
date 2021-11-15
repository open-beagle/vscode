/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/markdownRenderer", "vs/base/common/lifecycle", "vs/editor/common/core/range", "vs/editor/common/model/pieceTreeTextBuffer/pieceTreeTextBufferBuilder", "vs/workbench/contrib/debug/browser/debugANSIHandling"], function (require, exports, DOM, markdownRenderer_1, lifecycle_1, range_1, pieceTreeTextBufferBuilder_1, debugANSIHandling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.truncatedArrayOfString = void 0;
    const SIZE_LIMIT = 65535;
    const LINES_LIMIT = 500;
    function generateViewMoreElement(outputs, openerService, textFileService) {
        const md = {
            value: '[show more (open the raw output data in a text editor) ...](command:workbench.action.openLargeOutput)',
            isTrusted: true,
            supportThemeIcons: true
        };
        const element = (0, markdownRenderer_1.renderMarkdown)(md, {
            actionHandler: {
                callback: (content) => {
                    if (content === 'command:workbench.action.openLargeOutput') {
                        return textFileService.untitled.resolve({
                            associatedResource: undefined,
                            mode: 'plaintext',
                            initialValue: outputs.join('')
                        }).then(model => {
                            const resource = model.resource;
                            openerService.open(resource);
                        });
                    }
                    return;
                },
                disposeables: new lifecycle_1.DisposableStore()
            }
        });
        element.classList.add('output-show-more');
        return element;
    }
    function truncatedArrayOfString(container, outputs, linkDetector, openerService, textFileService, themeService) {
        const fullLen = outputs.reduce((p, c) => {
            return p + c.length;
        }, 0);
        let buffer = undefined;
        if (fullLen > SIZE_LIMIT) {
            // it's too large and we should find min(maxSizeLimit, maxLineLimit)
            const bufferBuilder = new pieceTreeTextBufferBuilder_1.PieceTreeTextBufferBuilder();
            outputs.forEach(output => bufferBuilder.acceptChunk(output));
            const factory = bufferBuilder.finish();
            buffer = factory.create(1 /* LF */).textBuffer;
            const sizeBufferLimitPosition = buffer.getPositionAt(SIZE_LIMIT);
            if (sizeBufferLimitPosition.lineNumber < LINES_LIMIT) {
                const truncatedText = buffer.getValueInRange(new range_1.Range(1, 1, sizeBufferLimitPosition.lineNumber, sizeBufferLimitPosition.column), 0 /* TextDefined */);
                container.appendChild((0, debugANSIHandling_1.handleANSIOutput)(truncatedText, linkDetector, themeService, undefined));
                // view more ...
                container.appendChild(generateViewMoreElement(outputs, openerService, textFileService));
                return;
            }
        }
        if (!buffer) {
            const bufferBuilder = new pieceTreeTextBufferBuilder_1.PieceTreeTextBufferBuilder();
            outputs.forEach(output => bufferBuilder.acceptChunk(output));
            const factory = bufferBuilder.finish();
            buffer = factory.create(1 /* LF */).textBuffer;
        }
        if (buffer.getLineCount() < LINES_LIMIT) {
            const lineCount = buffer.getLineCount();
            const fullRange = new range_1.Range(1, 1, lineCount, Math.max(1, buffer.getLineLastNonWhitespaceColumn(lineCount)));
            container.appendChild((0, debugANSIHandling_1.handleANSIOutput)(buffer.getValueInRange(fullRange, 0 /* TextDefined */), linkDetector, themeService, undefined));
            return;
        }
        const pre = DOM.$('pre');
        container.appendChild(pre);
        pre.appendChild((0, debugANSIHandling_1.handleANSIOutput)(buffer.getValueInRange(new range_1.Range(1, 1, LINES_LIMIT - 5, buffer.getLineLastNonWhitespaceColumn(LINES_LIMIT - 5)), 0 /* TextDefined */), linkDetector, themeService, undefined));
        // view more ...
        container.appendChild(generateViewMoreElement(outputs, openerService, textFileService));
        const lineCount = buffer.getLineCount();
        const pre2 = DOM.$('div');
        container.appendChild(pre2);
        pre2.appendChild((0, debugANSIHandling_1.handleANSIOutput)(buffer.getValueInRange(new range_1.Range(lineCount - 5, 1, lineCount, buffer.getLineLastNonWhitespaceColumn(lineCount)), 0 /* TextDefined */), linkDetector, themeService, undefined));
    }
    exports.truncatedArrayOfString = truncatedArrayOfString;
});
//# sourceMappingURL=textHelper.js.map