/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "./foldingRanges"], function (require, exports, event_1, foldingRanges_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setCollapseStateForType = exports.setCollapseStateForMatchingLines = exports.setCollapseStateForRest = exports.setCollapseStateAtLevel = exports.setCollapseStateUp = exports.setCollapseStateLevelsUp = exports.setCollapseStateLevelsDown = exports.toggleCollapseState = exports.FoldingModel = void 0;
    class FoldingModel {
        constructor(textModel, decorationProvider) {
            this._updateEventEmitter = new event_1.Emitter();
            this.onDidChange = this._updateEventEmitter.event;
            this._textModel = textModel;
            this._decorationProvider = decorationProvider;
            this._regions = new foldingRanges_1.FoldingRegions(new Uint32Array(0), new Uint32Array(0));
            this._editorDecorationIds = [];
            this._isInitialized = false;
        }
        get regions() { return this._regions; }
        get textModel() { return this._textModel; }
        get isInitialized() { return this._isInitialized; }
        get decorationProvider() { return this._decorationProvider; }
        toggleCollapseState(toggledRegions) {
            if (!toggledRegions.length) {
                return;
            }
            toggledRegions = toggledRegions.sort((r1, r2) => r1.regionIndex - r2.regionIndex);
            const processed = {};
            this._decorationProvider.changeDecorations(accessor => {
                let k = 0; // index from [0 ... this.regions.length]
                let dirtyRegionEndLine = -1; // end of the range where decorations need to be updated
                let lastHiddenLine = -1; // the end of the last hidden lines
                const updateDecorationsUntil = (index) => {
                    while (k < index) {
                        const endLineNumber = this._regions.getEndLineNumber(k);
                        const isCollapsed = this._regions.isCollapsed(k);
                        if (endLineNumber <= dirtyRegionEndLine) {
                            accessor.changeDecorationOptions(this._editorDecorationIds[k], this._decorationProvider.getDecorationOption(isCollapsed, endLineNumber <= lastHiddenLine));
                        }
                        if (isCollapsed && endLineNumber > lastHiddenLine) {
                            lastHiddenLine = endLineNumber;
                        }
                        k++;
                    }
                };
                for (let region of toggledRegions) {
                    let index = region.regionIndex;
                    let editorDecorationId = this._editorDecorationIds[index];
                    if (editorDecorationId && !processed[editorDecorationId]) {
                        processed[editorDecorationId] = true;
                        updateDecorationsUntil(index); // update all decorations up to current index using the old dirtyRegionEndLine
                        let newCollapseState = !this._regions.isCollapsed(index);
                        this._regions.setCollapsed(index, newCollapseState);
                        dirtyRegionEndLine = Math.max(dirtyRegionEndLine, this._regions.getEndLineNumber(index));
                    }
                }
                updateDecorationsUntil(this._regions.length);
            });
            this._updateEventEmitter.fire({ model: this, collapseStateChanged: toggledRegions });
        }
        update(newRegions, blockedLineNumers = []) {
            let newEditorDecorations = [];
            let isBlocked = (startLineNumber, endLineNumber) => {
                for (let blockedLineNumber of blockedLineNumers) {
                    if (startLineNumber < blockedLineNumber && blockedLineNumber <= endLineNumber) { // first line is visible
                        return true;
                    }
                }
                return false;
            };
            let lastHiddenLine = -1;
            let initRange = (index, isCollapsed) => {
                const startLineNumber = newRegions.getStartLineNumber(index);
                const endLineNumber = newRegions.getEndLineNumber(index);
                if (isCollapsed && isBlocked(startLineNumber, endLineNumber)) {
                    isCollapsed = false;
                }
                newRegions.setCollapsed(index, isCollapsed);
                const maxColumn = this._textModel.getLineMaxColumn(startLineNumber);
                const decorationRange = {
                    startLineNumber: startLineNumber,
                    startColumn: Math.max(maxColumn - 1, 1),
                    endLineNumber: startLineNumber,
                    endColumn: maxColumn
                };
                newEditorDecorations.push({ range: decorationRange, options: this._decorationProvider.getDecorationOption(isCollapsed, endLineNumber <= lastHiddenLine) });
                if (isCollapsed && endLineNumber > lastHiddenLine) {
                    lastHiddenLine = endLineNumber;
                }
            };
            let i = 0;
            let nextCollapsed = () => {
                while (i < this._regions.length) {
                    let isCollapsed = this._regions.isCollapsed(i);
                    i++;
                    if (isCollapsed) {
                        return i - 1;
                    }
                }
                return -1;
            };
            let k = 0;
            let collapsedIndex = nextCollapsed();
            while (collapsedIndex !== -1 && k < newRegions.length) {
                // get the latest range
                let decRange = this._textModel.getDecorationRange(this._editorDecorationIds[collapsedIndex]);
                if (decRange) {
                    let collapsedStartLineNumber = decRange.startLineNumber;
                    if (decRange.startColumn === Math.max(decRange.endColumn - 1, 1) && this._textModel.getLineMaxColumn(collapsedStartLineNumber) === decRange.endColumn) { // test that the decoration is still covering the full line else it got deleted
                        while (k < newRegions.length) {
                            let startLineNumber = newRegions.getStartLineNumber(k);
                            if (collapsedStartLineNumber >= startLineNumber) {
                                initRange(k, collapsedStartLineNumber === startLineNumber);
                                k++;
                            }
                            else {
                                break;
                            }
                        }
                    }
                }
                collapsedIndex = nextCollapsed();
            }
            while (k < newRegions.length) {
                initRange(k, false);
                k++;
            }
            this._editorDecorationIds = this._decorationProvider.deltaDecorations(this._editorDecorationIds, newEditorDecorations);
            this._regions = newRegions;
            this._isInitialized = true;
            this._updateEventEmitter.fire({ model: this });
        }
        /**
         * Collapse state memento, for persistence only
         */
        getMemento() {
            let collapsedRanges = [];
            for (let i = 0; i < this._regions.length; i++) {
                if (this._regions.isCollapsed(i)) {
                    let range = this._textModel.getDecorationRange(this._editorDecorationIds[i]);
                    if (range) {
                        let startLineNumber = range.startLineNumber;
                        let endLineNumber = range.endLineNumber + this._regions.getEndLineNumber(i) - this._regions.getStartLineNumber(i);
                        collapsedRanges.push({ startLineNumber, endLineNumber });
                    }
                }
            }
            if (collapsedRanges.length > 0) {
                return collapsedRanges;
            }
            return undefined;
        }
        /**
         * Apply persisted state, for persistence only
         */
        applyMemento(state) {
            if (!Array.isArray(state)) {
                return;
            }
            let toToogle = [];
            for (let range of state) {
                let region = this.getRegionAtLine(range.startLineNumber);
                if (region && !region.isCollapsed) {
                    toToogle.push(region);
                }
            }
            this.toggleCollapseState(toToogle);
        }
        dispose() {
            this._decorationProvider.deltaDecorations(this._editorDecorationIds, []);
        }
        getAllRegionsAtLine(lineNumber, filter) {
            let result = [];
            if (this._regions) {
                let index = this._regions.findRange(lineNumber);
                let level = 1;
                while (index >= 0) {
                    let current = this._regions.toRegion(index);
                    if (!filter || filter(current, level)) {
                        result.push(current);
                    }
                    level++;
                    index = current.parentIndex;
                }
            }
            return result;
        }
        getRegionAtLine(lineNumber) {
            if (this._regions) {
                let index = this._regions.findRange(lineNumber);
                if (index >= 0) {
                    return this._regions.toRegion(index);
                }
            }
            return null;
        }
        getRegionsInside(region, filter) {
            let result = [];
            let index = region ? region.regionIndex + 1 : 0;
            let endLineNumber = region ? region.endLineNumber : Number.MAX_VALUE;
            if (filter && filter.length === 2) {
                const levelStack = [];
                for (let i = index, len = this._regions.length; i < len; i++) {
                    let current = this._regions.toRegion(i);
                    if (this._regions.getStartLineNumber(i) < endLineNumber) {
                        while (levelStack.length > 0 && !current.containedBy(levelStack[levelStack.length - 1])) {
                            levelStack.pop();
                        }
                        levelStack.push(current);
                        if (filter(current, levelStack.length)) {
                            result.push(current);
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                for (let i = index, len = this._regions.length; i < len; i++) {
                    let current = this._regions.toRegion(i);
                    if (this._regions.getStartLineNumber(i) < endLineNumber) {
                        if (!filter || filter(current)) {
                            result.push(current);
                        }
                    }
                    else {
                        break;
                    }
                }
            }
            return result;
        }
    }
    exports.FoldingModel = FoldingModel;
    /**
     * Collapse or expand the regions at the given locations
     * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
     * @param lineNumbers the location of the regions to collapse or expand, or if not set, all regions in the model.
     */
    function toggleCollapseState(foldingModel, levels, lineNumbers) {
        let toToggle = [];
        for (let lineNumber of lineNumbers) {
            let region = foldingModel.getRegionAtLine(lineNumber);
            if (region) {
                const doCollapse = !region.isCollapsed;
                toToggle.push(region);
                if (levels > 1) {
                    let regionsInside = foldingModel.getRegionsInside(region, (r, level) => r.isCollapsed !== doCollapse && level < levels);
                    toToggle.push(...regionsInside);
                }
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.toggleCollapseState = toggleCollapseState;
    /**
     * Collapse or expand the regions at the given locations including all children.
     * @param doCollapse Whether to collapse or expand
     * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
     * @param lineNumbers the location of the regions to collapse or expand, or if not set, all regions in the model.
     */
    function setCollapseStateLevelsDown(foldingModel, doCollapse, levels = Number.MAX_VALUE, lineNumbers) {
        let toToggle = [];
        if (lineNumbers && lineNumbers.length > 0) {
            for (let lineNumber of lineNumbers) {
                let region = foldingModel.getRegionAtLine(lineNumber);
                if (region) {
                    if (region.isCollapsed !== doCollapse) {
                        toToggle.push(region);
                    }
                    if (levels > 1) {
                        let regionsInside = foldingModel.getRegionsInside(region, (r, level) => r.isCollapsed !== doCollapse && level < levels);
                        toToggle.push(...regionsInside);
                    }
                }
            }
        }
        else {
            let regionsInside = foldingModel.getRegionsInside(null, (r, level) => r.isCollapsed !== doCollapse && level < levels);
            toToggle.push(...regionsInside);
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateLevelsDown = setCollapseStateLevelsDown;
    /**
     * Collapse or expand the regions at the given locations including all parents.
     * @param doCollapse Whether to collapse or expand
     * @param levels The number of levels. Use 1 to only impact the regions at the location, use Number.MAX_VALUE for all levels.
     * @param lineNumbers the location of the regions to collapse or expand.
     */
    function setCollapseStateLevelsUp(foldingModel, doCollapse, levels, lineNumbers) {
        let toToggle = [];
        for (let lineNumber of lineNumbers) {
            let regions = foldingModel.getAllRegionsAtLine(lineNumber, (region, level) => region.isCollapsed !== doCollapse && level <= levels);
            toToggle.push(...regions);
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateLevelsUp = setCollapseStateLevelsUp;
    /**
     * Collapse or expand a region at the given locations. If the inner most region is already collapsed/expanded, uses the first parent instead.
     * @param doCollapse Whether to collapse or expand
     * @param lineNumbers the location of the regions to collapse or expand.
     */
    function setCollapseStateUp(foldingModel, doCollapse, lineNumbers) {
        let toToggle = [];
        for (let lineNumber of lineNumbers) {
            let regions = foldingModel.getAllRegionsAtLine(lineNumber, (region) => region.isCollapsed !== doCollapse);
            if (regions.length > 0) {
                toToggle.push(regions[0]);
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateUp = setCollapseStateUp;
    /**
     * Folds or unfolds all regions that have a given level, except if they contain one of the blocked lines.
     * @param foldLevel level. Level == 1 is the top level
     * @param doCollapse Whether to collapse or expand
    */
    function setCollapseStateAtLevel(foldingModel, foldLevel, doCollapse, blockedLineNumbers) {
        let filter = (region, level) => level === foldLevel && region.isCollapsed !== doCollapse && !blockedLineNumbers.some(line => region.containsLine(line));
        let toToggle = foldingModel.getRegionsInside(null, filter);
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateAtLevel = setCollapseStateAtLevel;
    /**
     * Folds or unfolds all regions, except if they contain or are contained by a region of one of the blocked lines.
     * @param doCollapse Whether to collapse or expand
     * @param blockedLineNumbers the location of regions to not collapse or expand
     */
    function setCollapseStateForRest(foldingModel, doCollapse, blockedLineNumbers) {
        let filteredRegions = [];
        for (let lineNumber of blockedLineNumbers) {
            filteredRegions.push(foldingModel.getAllRegionsAtLine(lineNumber, undefined)[0]);
        }
        let filter = (region) => filteredRegions.every((filteredRegion) => !filteredRegion.containedBy(region) && !region.containedBy(filteredRegion)) && region.isCollapsed !== doCollapse;
        let toToggle = foldingModel.getRegionsInside(null, filter);
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateForRest = setCollapseStateForRest;
    /**
     * Folds all regions for which the lines start with a given regex
     * @param foldingModel the folding model
     */
    function setCollapseStateForMatchingLines(foldingModel, regExp, doCollapse) {
        let editorModel = foldingModel.textModel;
        let regions = foldingModel.regions;
        let toToggle = [];
        for (let i = regions.length - 1; i >= 0; i--) {
            if (doCollapse !== regions.isCollapsed(i)) {
                let startLineNumber = regions.getStartLineNumber(i);
                if (regExp.test(editorModel.getLineContent(startLineNumber))) {
                    toToggle.push(regions.toRegion(i));
                }
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateForMatchingLines = setCollapseStateForMatchingLines;
    /**
     * Folds all regions of the given type
     * @param foldingModel the folding model
     */
    function setCollapseStateForType(foldingModel, type, doCollapse) {
        let regions = foldingModel.regions;
        let toToggle = [];
        for (let i = regions.length - 1; i >= 0; i--) {
            if (doCollapse !== regions.isCollapsed(i) && type === regions.getType(i)) {
                toToggle.push(regions.toRegion(i));
            }
        }
        foldingModel.toggleCollapseState(toToggle);
    }
    exports.setCollapseStateForType = setCollapseStateForType;
});
//# sourceMappingURL=foldingModel.js.map