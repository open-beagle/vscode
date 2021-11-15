/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/color", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/terminal/common/terminal"], function (require, exports, async_1, color_1, decorators_1, event_1, lifecycle_1, strings_1, telemetry_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TypeAheadAddon = exports.CharPredictState = exports.PredictionTimeline = exports.PredictionStats = exports.isTenativeCharacterPrediction = void 0;
    const ESC = '\x1b';
    const CSI = `${ESC}[`;
    const SHOW_CURSOR = `${CSI}?25h`;
    const HIDE_CURSOR = `${CSI}?25l`;
    const DELETE_CHAR = `${CSI}X`;
    const DELETE_REST_OF_LINE = `${CSI}K`;
    const CSI_STYLE_RE = /^\x1b\[[0-9;]*m/;
    const CSI_MOVE_RE = /^\x1b\[?([0-9]*)(;[35])?O?([DC])/;
    const NOT_WORD_RE = /[^a-z0-9]/i;
    const statsBufferSize = 24;
    const statsSendTelemetryEvery = 1000 * 60 * 5; // how often to collect stats
    const statsMinSamplesToTurnOn = 5;
    const statsMinAccuracyToTurnOn = 0.3;
    const statsToggleOffThreshold = 0.5; // if latency is less than `threshold * this`, turn off
    /**
     * Codes that should be omitted from sending to the prediction engine and instead omitted directly:
     * - Hide cursor (DECTCEM): We wrap the local echo sequence in hide and show
     *   CSI ? 2 5 l
     * - Show cursor (DECTCEM): We wrap the local echo sequence in hide and show
     *   CSI ? 2 5 h
     * - Device Status Report (DSR): These sequence fire report events from xterm which could cause
     *   double reporting and potentially a stack overflow (#119472)
     *   CSI Ps n
     *   CSI ? Ps n
     */
    const PREDICTION_OMIT_RE = /^(\x1b\[(\??25[hl]|\??[0-9;]+n))+/;
    const core = (terminal) => terminal._core;
    const flushOutput = (terminal) => {
        // TODO: Flushing output is not possible anymore without async
    };
    var CursorMoveDirection;
    (function (CursorMoveDirection) {
        CursorMoveDirection["Back"] = "D";
        CursorMoveDirection["Forwards"] = "C";
    })(CursorMoveDirection || (CursorMoveDirection = {}));
    class Cursor {
        constructor(rows, cols, buffer) {
            this.rows = rows;
            this.cols = cols;
            this.buffer = buffer;
            this._x = 0;
            this._y = 1;
            this._baseY = 1;
            this._x = buffer.cursorX;
            this._y = buffer.cursorY;
            this._baseY = buffer.baseY;
        }
        get x() {
            return this._x;
        }
        get y() {
            return this._y;
        }
        get baseY() {
            return this._baseY;
        }
        get coordinate() {
            return { x: this._x, y: this._y, baseY: this._baseY };
        }
        getLine() {
            return this.buffer.getLine(this._y + this._baseY);
        }
        getCell(loadInto) {
            var _a;
            return (_a = this.getLine()) === null || _a === void 0 ? void 0 : _a.getCell(this._x, loadInto);
        }
        moveTo(coordinate) {
            this._x = coordinate.x;
            this._y = (coordinate.y + coordinate.baseY) - this._baseY;
            return this.moveInstruction();
        }
        clone() {
            const c = new Cursor(this.rows, this.cols, this.buffer);
            c.moveTo(this);
            return c;
        }
        move(x, y) {
            this._x = x;
            this._y = y;
            return this.moveInstruction();
        }
        shift(x = 0, y = 0) {
            this._x += x;
            this._y += y;
            return this.moveInstruction();
        }
        moveInstruction() {
            if (this._y >= this.rows) {
                this._baseY += this._y - (this.rows - 1);
                this._y = this.rows - 1;
            }
            else if (this._y < 0) {
                this._baseY -= this._y;
                this._y = 0;
            }
            return `${CSI}${this._y + 1};${this._x + 1}H`;
        }
    }
    const moveToWordBoundary = (b, cursor, direction) => {
        let ateLeadingWhitespace = false;
        if (direction < 0) {
            cursor.shift(-1);
        }
        let cell;
        while (cursor.x >= 0) {
            cell = cursor.getCell(cell);
            if (!(cell === null || cell === void 0 ? void 0 : cell.getCode())) {
                return;
            }
            const chars = cell.getChars();
            if (NOT_WORD_RE.test(chars)) {
                if (ateLeadingWhitespace) {
                    break;
                }
            }
            else {
                ateLeadingWhitespace = true;
            }
            cursor.shift(direction);
        }
        if (direction < 0) {
            cursor.shift(1); // we want to place the cursor after the whitespace starting the word
        }
    };
    var MatchResult;
    (function (MatchResult) {
        /** matched successfully */
        MatchResult[MatchResult["Success"] = 0] = "Success";
        /** failed to match */
        MatchResult[MatchResult["Failure"] = 1] = "Failure";
        /** buffer data, it might match in the future one more data comes in */
        MatchResult[MatchResult["Buffer"] = 2] = "Buffer";
    })(MatchResult || (MatchResult = {}));
    class StringReader {
        constructor(input) {
            this.input = input;
            this.index = 0;
        }
        get remaining() {
            return this.input.length - this.index;
        }
        get eof() {
            return this.index === this.input.length;
        }
        get rest() {
            return this.input.slice(this.index);
        }
        /**
         * Advances the reader and returns the character if it matches.
         */
        eatChar(char) {
            if (this.input[this.index] !== char) {
                return;
            }
            this.index++;
            return char;
        }
        /**
         * Advances the reader and returns the string if it matches.
         */
        eatStr(substr) {
            if (this.input.slice(this.index, substr.length) !== substr) {
                return;
            }
            this.index += substr.length;
            return substr;
        }
        /**
         * Matches and eats the substring character-by-character. If EOF is reached
         * before the substring is consumed, it will buffer. Index is not moved
         * if it's not a match.
         */
        eatGradually(substr) {
            let prevIndex = this.index;
            for (let i = 0; i < substr.length; i++) {
                if (i > 0 && this.eof) {
                    return 2 /* Buffer */;
                }
                if (!this.eatChar(substr[i])) {
                    this.index = prevIndex;
                    return 1 /* Failure */;
                }
            }
            return 0 /* Success */;
        }
        /**
         * Advances the reader and returns the regex if it matches.
         */
        eatRe(re) {
            const match = re.exec(this.input.slice(this.index));
            if (!match) {
                return;
            }
            this.index += match[0].length;
            return match;
        }
        /**
         * Advances the reader and returns the character if the code matches.
         */
        eatCharCode(min = 0, max = min + 1) {
            const code = this.input.charCodeAt(this.index);
            if (code < min || code >= max) {
                return undefined;
            }
            this.index++;
            return code;
        }
    }
    /**
     * Preidction which never tests true. Will always discard predictions made
     * after it.
     */
    class HardBoundary {
        constructor() {
            this.clearAfterTimeout = false;
        }
        apply() {
            return '';
        }
        rollback() {
            return '';
        }
        rollForwards() {
            return '';
        }
        matches() {
            return 1 /* Failure */;
        }
    }
    /**
     * Wraps another prediction. Does not apply the prediction, but will pass
     * through its `matches` request.
     */
    class TentativeBoundary {
        constructor(inner) {
            this.inner = inner;
        }
        apply(buffer, cursor) {
            this.appliedCursor = cursor.clone();
            this.inner.apply(buffer, this.appliedCursor);
            return '';
        }
        rollback(cursor) {
            this.inner.rollback(cursor.clone());
            return '';
        }
        rollForwards(cursor, withInput) {
            if (this.appliedCursor) {
                cursor.moveTo(this.appliedCursor);
            }
            return withInput;
        }
        matches(input) {
            return this.inner.matches(input);
        }
    }
    const isTenativeCharacterPrediction = (p) => p instanceof TentativeBoundary && p.inner instanceof CharacterPrediction;
    exports.isTenativeCharacterPrediction = isTenativeCharacterPrediction;
    /**
     * Prediction for a single alphanumeric character.
     */
    class CharacterPrediction {
        constructor(style, char) {
            this.style = style;
            this.char = char;
            this.affectsStyle = true;
        }
        apply(_, cursor) {
            const cell = cursor.getCell();
            this.appliedAt = cell
                ? { pos: cursor.coordinate, oldAttributes: attributesToSeq(cell), oldChar: cell.getChars() }
                : { pos: cursor.coordinate, oldAttributes: '', oldChar: '' };
            cursor.shift(1);
            return this.style.apply + this.char + this.style.undo;
        }
        rollback(cursor) {
            if (!this.appliedAt) {
                return ''; // not applied
            }
            const { oldAttributes, oldChar, pos } = this.appliedAt;
            const r = cursor.moveTo(pos) + (oldChar ? `${oldAttributes}${oldChar}${cursor.moveTo(pos)}` : DELETE_CHAR);
            return r;
        }
        rollForwards(cursor, input) {
            if (!this.appliedAt) {
                return ''; // not applied
            }
            return cursor.clone().moveTo(this.appliedAt.pos) + input;
        }
        matches(input, lookBehind) {
            let startIndex = input.index;
            // remove any styling CSI before checking the char
            while (input.eatRe(CSI_STYLE_RE)) { }
            if (input.eof) {
                return 2 /* Buffer */;
            }
            if (input.eatChar(this.char)) {
                return 0 /* Success */;
            }
            if (lookBehind instanceof CharacterPrediction) {
                // see #112842
                const sillyZshOutcome = input.eatGradually(`\b${lookBehind.char}${this.char}`);
                if (sillyZshOutcome !== 1 /* Failure */) {
                    return sillyZshOutcome;
                }
            }
            input.index = startIndex;
            return 1 /* Failure */;
        }
    }
    class BackspacePrediction {
        constructor(terminal) {
            this.terminal = terminal;
        }
        apply(_, cursor) {
            var _a;
            // at eol if everything to the right is whitespace (zsh will emit a "clear line" code in this case)
            // todo: can be optimized if `getTrimmedLength` is exposed from xterm
            const isLastChar = !((_a = cursor.getLine()) === null || _a === void 0 ? void 0 : _a.translateToString(undefined, cursor.x).trim());
            const pos = cursor.coordinate;
            const move = cursor.shift(-1);
            const cell = cursor.getCell();
            this.appliedAt = cell
                ? { isLastChar, pos, oldAttributes: attributesToSeq(cell), oldChar: cell.getChars() }
                : { isLastChar, pos, oldAttributes: '', oldChar: '' };
            return move + DELETE_CHAR;
        }
        rollback(cursor) {
            if (!this.appliedAt) {
                return ''; // not applied
            }
            const { oldAttributes, oldChar, pos } = this.appliedAt;
            if (!oldChar) {
                return cursor.moveTo(pos) + DELETE_CHAR;
            }
            return oldAttributes + oldChar + cursor.moveTo(pos) + attributesToSeq(core(this.terminal)._inputHandler._curAttrData);
        }
        rollForwards() {
            return '';
        }
        matches(input) {
            var _a;
            if ((_a = this.appliedAt) === null || _a === void 0 ? void 0 : _a.isLastChar) {
                const r1 = input.eatGradually(`\b${CSI}K`);
                if (r1 !== 1 /* Failure */) {
                    return r1;
                }
                const r2 = input.eatGradually(`\b \b`);
                if (r2 !== 1 /* Failure */) {
                    return r2;
                }
            }
            return 1 /* Failure */;
        }
    }
    class NewlinePrediction {
        apply(_, cursor) {
            this.prevPosition = cursor.coordinate;
            cursor.move(0, cursor.y + 1);
            return '\r\n';
        }
        rollback(cursor) {
            return this.prevPosition ? cursor.moveTo(this.prevPosition) : '';
        }
        rollForwards() {
            return ''; // does not need to rewrite
        }
        matches(input) {
            return input.eatGradually('\r\n');
        }
    }
    /**
     * Prediction when the cursor reaches the end of the line. Similar to newline
     * prediction, but shells handle it slightly differently.
     */
    class LinewrapPrediction extends NewlinePrediction {
        apply(_, cursor) {
            this.prevPosition = cursor.coordinate;
            cursor.move(0, cursor.y + 1);
            return ' \r';
        }
        matches(input) {
            // bash and zshell add a space which wraps in the terminal, then a CR
            const r = input.eatGradually(' \r');
            if (r !== 1 /* Failure */) {
                // zshell additionally adds a clear line after wrapping to be safe -- eat it
                const r2 = input.eatGradually(DELETE_REST_OF_LINE);
                return r2 === 2 /* Buffer */ ? 2 /* Buffer */ : r;
            }
            return input.eatGradually('\r\n');
        }
    }
    class CursorMovePrediction {
        constructor(direction, moveByWords, amount) {
            this.direction = direction;
            this.moveByWords = moveByWords;
            this.amount = amount;
        }
        apply(buffer, cursor) {
            const prevPosition = cursor.x;
            const currentCell = cursor.getCell();
            const prevAttrs = currentCell ? attributesToSeq(currentCell) : '';
            const { amount, direction, moveByWords } = this;
            const delta = direction === "D" /* Back */ ? -1 : 1;
            const target = cursor.clone();
            if (moveByWords) {
                for (let i = 0; i < amount; i++) {
                    moveToWordBoundary(buffer, target, delta);
                }
            }
            else {
                target.shift(delta * amount);
            }
            this.applied = {
                amount: Math.abs(cursor.x - target.x),
                prevPosition,
                prevAttrs,
                rollForward: cursor.moveTo(target),
            };
            return this.applied.rollForward;
        }
        rollback(cursor) {
            if (!this.applied) {
                return '';
            }
            return cursor.move(this.applied.prevPosition, cursor.y) + this.applied.prevAttrs;
        }
        rollForwards() {
            return ''; // does not need to rewrite
        }
        matches(input) {
            if (!this.applied) {
                return 1 /* Failure */;
            }
            const direction = this.direction;
            const { amount, rollForward } = this.applied;
            // arg can be omitted to move one character. We don't eatGradually() here
            // or below moves that don't go as far as the cursor would be buffered
            // indefinitely
            if (input.eatStr(`${CSI}${direction}`.repeat(amount))) {
                return 0 /* Success */;
            }
            // \b is the equivalent to moving one character back
            if (direction === "D" /* Back */) {
                if (input.eatStr(`\b`.repeat(amount))) {
                    return 0 /* Success */;
                }
            }
            // check if the cursor position is set absolutely
            if (rollForward) {
                const r = input.eatGradually(rollForward);
                if (r !== 1 /* Failure */) {
                    return r;
                }
            }
            // check for a relative move in the direction
            return input.eatGradually(`${CSI}${amount}${direction}`);
        }
    }
    class PredictionStats extends lifecycle_1.Disposable {
        constructor(timeline) {
            super();
            this.stats = [];
            this.index = 0;
            this.addedAtTime = new WeakMap();
            this.changeEmitter = new event_1.Emitter();
            this.onChange = this.changeEmitter.event;
            this._register(timeline.onPredictionAdded(p => this.addedAtTime.set(p, Date.now())));
            this._register(timeline.onPredictionSucceeded(this.pushStat.bind(this, true)));
            this._register(timeline.onPredictionFailed(this.pushStat.bind(this, false)));
        }
        /**
         * Gets the percent (0-1) of predictions that were accurate.
         */
        get accuracy() {
            let correctCount = 0;
            for (const [, correct] of this.stats) {
                if (correct) {
                    correctCount++;
                }
            }
            return correctCount / (this.stats.length || 1);
        }
        /**
         * Gets the number of recorded stats.
         */
        get sampleSize() {
            return this.stats.length;
        }
        /**
         * Gets latency stats of successful predictions.
         */
        get latency() {
            const latencies = this.stats.filter(([, correct]) => correct).map(([s]) => s).sort();
            return {
                count: latencies.length,
                min: latencies[0],
                median: latencies[Math.floor(latencies.length / 2)],
                max: latencies[latencies.length - 1],
            };
        }
        /**
         * Gets the maximum observed latency.
         */
        get maxLatency() {
            let max = -Infinity;
            for (const [latency, correct] of this.stats) {
                if (correct) {
                    max = Math.max(latency, max);
                }
            }
            return max;
        }
        pushStat(correct, prediction) {
            const started = this.addedAtTime.get(prediction);
            this.stats[this.index] = [Date.now() - started, correct];
            this.index = (this.index + 1) % statsBufferSize;
            this.changeEmitter.fire();
        }
    }
    exports.PredictionStats = PredictionStats;
    class PredictionTimeline {
        constructor(terminal, style) {
            this.terminal = terminal;
            this.style = style;
            /**
             * Expected queue of events. Only predictions for the lowest are
             * written into the terminal.
             */
            this.expected = [];
            /**
             * Current prediction generation.
             */
            this.currentGen = 0;
            /**
             * Whether predictions are echoed to the terminal. If false, predictions
             * will still be computed internally for latency metrics, but input will
             * never be adjusted.
             */
            this.showPredictions = false;
            this.addedEmitter = new event_1.Emitter();
            this.onPredictionAdded = this.addedEmitter.event;
            this.failedEmitter = new event_1.Emitter();
            this.onPredictionFailed = this.failedEmitter.event;
            this.succeededEmitter = new event_1.Emitter();
            this.onPredictionSucceeded = this.succeededEmitter.event;
        }
        get currentGenerationPredictions() {
            return this.expected.filter(({ gen }) => gen === this.expected[0].gen).map(({ p }) => p);
        }
        get isShowingPredictions() {
            return this.showPredictions;
        }
        get length() {
            return this.expected.length;
        }
        setShowPredictions(show) {
            if (show === this.showPredictions) {
                return;
            }
            // console.log('set predictions:', show);
            this.showPredictions = show;
            const buffer = this.getActiveBuffer();
            if (!buffer) {
                return;
            }
            const toApply = this.currentGenerationPredictions;
            if (show) {
                this.clearCursor();
                this.style.expectIncomingStyle(toApply.reduce((count, p) => p.affectsStyle ? count + 1 : count, 0));
                this.terminal.write(toApply.map(p => p.apply(buffer, this.physicalCursor(buffer))).join(''));
            }
            else {
                this.terminal.write(toApply.reverse().map(p => p.rollback(this.physicalCursor(buffer))).join(''));
            }
        }
        /**
         * Undoes any predictions written and resets expectations.
         */
        undoAllPredictions() {
            const buffer = this.getActiveBuffer();
            if (this.showPredictions && buffer) {
                this.terminal.write(this.currentGenerationPredictions.reverse()
                    .map(p => p.rollback(this.physicalCursor(buffer))).join(''));
            }
            this.expected = [];
        }
        /**
         * Should be called when input is incoming to the temrinal.
         */
        beforeServerInput(input) {
            var _a;
            const originalInput = input;
            if (this.inputBuffer) {
                input = this.inputBuffer + input;
                this.inputBuffer = undefined;
            }
            if (!this.expected.length) {
                this.clearPredictionState();
                return input;
            }
            const buffer = this.getActiveBuffer();
            if (!buffer) {
                this.clearPredictionState();
                return input;
            }
            let output = '';
            const reader = new StringReader(input);
            const startingGen = this.expected[0].gen;
            const emitPredictionOmitted = () => {
                const omit = reader.eatRe(PREDICTION_OMIT_RE);
                if (omit) {
                    output += omit[0];
                }
            };
            ReadLoop: while (this.expected.length && reader.remaining > 0) {
                emitPredictionOmitted();
                const { p: prediction, gen } = this.expected[0];
                const cursor = this.physicalCursor(buffer);
                let beforeTestReaderIndex = reader.index;
                switch (prediction.matches(reader, this.lookBehind)) {
                    case 0 /* Success */:
                        // if the input character matches what the next prediction expected, undo
                        // the prediction and write the real character out.
                        const eaten = input.slice(beforeTestReaderIndex, reader.index);
                        if (gen === startingGen) {
                            output += (_a = prediction.rollForwards) === null || _a === void 0 ? void 0 : _a.call(prediction, cursor, eaten);
                        }
                        else {
                            prediction.apply(buffer, this.physicalCursor(buffer)); // move cursor for additional apply
                            output += eaten;
                        }
                        this.succeededEmitter.fire(prediction);
                        this.lookBehind = prediction;
                        this.expected.shift();
                        break;
                    case 2 /* Buffer */:
                        // on a buffer, store the remaining data and completely read data
                        // to be output as normal.
                        this.inputBuffer = input.slice(beforeTestReaderIndex);
                        reader.index = input.length;
                        break ReadLoop;
                    case 1 /* Failure */:
                        // on a failure, roll back all remaining items in this generation
                        // and clear predictions, since they are no longer valid
                        const rollback = this.expected.filter(p => p.gen === startingGen).reverse();
                        output += rollback.map(({ p }) => p.rollback(this.physicalCursor(buffer))).join('');
                        if (rollback.some(r => r.p.affectsStyle)) {
                            // reading the current style should generally be safe, since predictions
                            // always restore the style if they modify it.
                            output += attributesToSeq(core(this.terminal)._inputHandler._curAttrData);
                        }
                        this.clearPredictionState();
                        this.failedEmitter.fire(prediction);
                        break ReadLoop;
                }
            }
            emitPredictionOmitted();
            // Extra data (like the result of running a command) should cause us to
            // reset the cursor
            if (!reader.eof) {
                output += reader.rest;
                this.clearPredictionState();
            }
            // If we passed a generation boundary, apply the current generation's predictions
            if (this.expected.length && startingGen !== this.expected[0].gen) {
                for (const { p, gen } of this.expected) {
                    if (gen !== this.expected[0].gen) {
                        break;
                    }
                    if (p.affectsStyle) {
                        this.style.expectIncomingStyle();
                    }
                    output += p.apply(buffer, this.physicalCursor(buffer));
                }
            }
            if (!this.showPredictions) {
                return originalInput;
            }
            if (output.length === 0 || output === input) {
                return output;
            }
            if (this._physicalCursor) {
                output += this._physicalCursor.moveInstruction();
            }
            // prevent cursor flickering while typing
            output = HIDE_CURSOR + output + SHOW_CURSOR;
            return output;
        }
        /**
         * Clears any expected predictions and stored state. Should be called when
         * the pty gives us something we don't recognize.
         */
        clearPredictionState() {
            this.expected = [];
            this.clearCursor();
            this.lookBehind = undefined;
        }
        /**
         * Appends a typeahead prediction.
         */
        addPrediction(buffer, prediction) {
            this.expected.push({ gen: this.currentGen, p: prediction });
            this.addedEmitter.fire(prediction);
            if (this.currentGen !== this.expected[0].gen) {
                prediction.apply(buffer, this.tentativeCursor(buffer));
                return false;
            }
            const text = prediction.apply(buffer, this.physicalCursor(buffer));
            this._tenativeCursor = undefined; // next read will get or clone the physical cursor
            if (this.showPredictions && text) {
                if (prediction.affectsStyle) {
                    this.style.expectIncomingStyle();
                }
                // console.log('predict:', JSON.stringify(text));
                this.terminal.write(text);
            }
            return true;
        }
        addBoundary(buffer, prediction) {
            let applied = false;
            if (buffer && prediction) {
                // We apply the prediction so that it's matched against, but wrapped
                // in a tentativeboundary so that it doesn't affect the physical cursor.
                // Then we apply it specifically to the tentative cursor.
                applied = this.addPrediction(buffer, new TentativeBoundary(prediction));
                prediction.apply(buffer, this.tentativeCursor(buffer));
            }
            this.currentGen++;
            return applied;
        }
        /**
         * Peeks the last prediction written.
         */
        peekEnd() {
            var _a;
            return (_a = this.expected[this.expected.length - 1]) === null || _a === void 0 ? void 0 : _a.p;
        }
        /**
         * Peeks the first pending prediction.
         */
        peekStart() {
            var _a;
            return (_a = this.expected[0]) === null || _a === void 0 ? void 0 : _a.p;
        }
        /**
         * Current position of the cursor in the terminal.
         */
        physicalCursor(buffer) {
            if (!this._physicalCursor) {
                if (this.showPredictions) {
                    flushOutput(this.terminal);
                }
                this._physicalCursor = new Cursor(this.terminal.rows, this.terminal.cols, buffer);
            }
            return this._physicalCursor;
        }
        /**
         * Cursor position if all predictions and boundaries that have been inserted
         * so far turn out to be successfully predicted.
         */
        tentativeCursor(buffer) {
            if (!this._tenativeCursor) {
                this._tenativeCursor = this.physicalCursor(buffer).clone();
            }
            return this._tenativeCursor;
        }
        clearCursor() {
            this._physicalCursor = undefined;
            this._tenativeCursor = undefined;
        }
        getActiveBuffer() {
            const buffer = this.terminal.buffer.active;
            return buffer.type === 'normal' ? buffer : undefined;
        }
    }
    exports.PredictionTimeline = PredictionTimeline;
    /**
     * Gets the escape sequence args to restore state/appearence in the cell.
     */
    const attributesToArgs = (cell) => {
        if (cell.isAttributeDefault()) {
            return [0];
        }
        const args = [];
        if (cell.isBold()) {
            args.push(1);
        }
        if (cell.isDim()) {
            args.push(2);
        }
        if (cell.isItalic()) {
            args.push(3);
        }
        if (cell.isUnderline()) {
            args.push(4);
        }
        if (cell.isBlink()) {
            args.push(5);
        }
        if (cell.isInverse()) {
            args.push(7);
        }
        if (cell.isInvisible()) {
            args.push(8);
        }
        if (cell.isFgRGB()) {
            args.push(38, 2, cell.getFgColor() >>> 24, (cell.getFgColor() >>> 16) & 0xFF, cell.getFgColor() & 0xFF);
        }
        if (cell.isFgPalette()) {
            args.push(38, 5, cell.getFgColor());
        }
        if (cell.isFgDefault()) {
            args.push(39);
        }
        if (cell.isBgRGB()) {
            args.push(48, 2, cell.getBgColor() >>> 24, (cell.getBgColor() >>> 16) & 0xFF, cell.getBgColor() & 0xFF);
        }
        if (cell.isBgPalette()) {
            args.push(48, 5, cell.getBgColor());
        }
        if (cell.isBgDefault()) {
            args.push(49);
        }
        return args;
    };
    /**
     * Gets the escape sequence to restore state/appearence in the cell.
     */
    const attributesToSeq = (cell) => `${CSI}${attributesToArgs(cell).join(';')}m`;
    const arrayHasPrefixAt = (a, ai, b) => {
        if (a.length - ai > b.length) {
            return false;
        }
        for (let bi = 0; bi < b.length; bi++, ai++) {
            if (b[ai] !== a[ai]) {
                return false;
            }
        }
        return true;
    };
    /**
     * @see https://github.com/xtermjs/xterm.js/blob/065eb13a9d3145bea687239680ec9696d9112b8e/src/common/InputHandler.ts#L2127
     */
    const getColorWidth = (params, pos) => {
        const accu = [0, 0, -1, 0, 0, 0];
        let cSpace = 0;
        let advance = 0;
        do {
            const v = params[pos + advance];
            accu[advance + cSpace] = typeof v === 'number' ? v : v[0];
            if (typeof v !== 'number') {
                let i = 0;
                do {
                    if (accu[1] === 5) {
                        cSpace = 1;
                    }
                    accu[advance + i + 1 + cSpace] = v[i];
                } while (++i < v.length && i + advance + 1 + cSpace < accu.length);
                break;
            }
            // exit early if can decide color mode with semicolons
            if ((accu[1] === 5 && advance + cSpace >= 2)
                || (accu[1] === 2 && advance + cSpace >= 5)) {
                break;
            }
            // offset colorSpace slot for semicolon mode
            if (accu[1]) {
                cSpace = 1;
            }
        } while (++advance + pos < params.length && advance + cSpace < accu.length);
        return advance;
    };
    class TypeAheadStyle {
        constructor(value, terminal) {
            this.terminal = terminal;
            /**
             * Number of typeahead style arguments we expect to read. If this is 0 and
             * we see a style coming in, we know that the PTY actually wanted to update.
             */
            this.expectedIncomingStyles = 0;
            this.onUpdate(value);
        }
        static compileArgs(args) {
            return `${CSI}${args.join(';')}m`;
        }
        /**
         * Signals that a style was written to the terminal and we should watch
         * for it coming in.
         */
        expectIncomingStyle(n = 1) {
            this.expectedIncomingStyles += n * 2;
        }
        /**
         * Starts tracking for CSI changes in the terminal.
         */
        startTracking() {
            this.expectedIncomingStyles = 0;
            this.onDidWriteSGR(attributesToArgs(core(this.terminal)._inputHandler._curAttrData));
            this.csiHandler = this.terminal.parser.registerCsiHandler({ final: 'm' }, args => {
                this.onDidWriteSGR(args);
                return false;
            });
        }
        /**
         * Stops tracking terminal CSI changes.
         */
        debounceStopTracking() {
            this.stopTracking();
        }
        /**
         * @inheritdoc
         */
        dispose() {
            this.stopTracking();
        }
        stopTracking() {
            var _a;
            (_a = this.csiHandler) === null || _a === void 0 ? void 0 : _a.dispose();
            this.csiHandler = undefined;
        }
        onDidWriteSGR(args) {
            const originalUndo = this.undoArgs;
            for (let i = 0; i < args.length;) {
                const px = args[i];
                const p = typeof px === 'number' ? px : px[0];
                if (this.expectedIncomingStyles) {
                    if (arrayHasPrefixAt(args, i, this.undoArgs)) {
                        this.expectedIncomingStyles--;
                        i += this.undoArgs.length;
                        continue;
                    }
                    if (arrayHasPrefixAt(args, i, this.applyArgs)) {
                        this.expectedIncomingStyles--;
                        i += this.applyArgs.length;
                        continue;
                    }
                }
                const width = p === 38 || p === 48 || p === 58 ? getColorWidth(args, i) : 1;
                switch (this.applyArgs[0]) {
                    case 1:
                        if (p === 2) {
                            this.undoArgs = [22, 2];
                        }
                        else if (p === 22 || p === 0) {
                            this.undoArgs = [22];
                        }
                        break;
                    case 2:
                        if (p === 1) {
                            this.undoArgs = [22, 1];
                        }
                        else if (p === 22 || p === 0) {
                            this.undoArgs = [22];
                        }
                        break;
                    case 38:
                        if (p === 0 || p === 39 || p === 100) {
                            this.undoArgs = [39];
                        }
                        else if ((p >= 30 && p <= 38) || (p >= 90 && p <= 97)) {
                            this.undoArgs = args.slice(i, i + width);
                        }
                        break;
                    default:
                        if (p === this.applyArgs[0]) {
                            this.undoArgs = this.applyArgs;
                        }
                        else if (p === 0) {
                            this.undoArgs = this.originalUndoArgs;
                        }
                    // no-op
                }
                i += width;
            }
            if (originalUndo !== this.undoArgs) {
                this.undo = TypeAheadStyle.compileArgs(this.undoArgs);
            }
        }
        /**
         * Updates the current typeahead style.
         */
        onUpdate(style) {
            const { applyArgs, undoArgs } = this.getArgs(style);
            this.applyArgs = applyArgs;
            this.undoArgs = this.originalUndoArgs = undoArgs;
            this.apply = TypeAheadStyle.compileArgs(this.applyArgs);
            this.undo = TypeAheadStyle.compileArgs(this.undoArgs);
        }
        getArgs(style) {
            switch (style) {
                case 'bold':
                    return { applyArgs: [1], undoArgs: [22] };
                case 'dim':
                    return { applyArgs: [2], undoArgs: [22] };
                case 'italic':
                    return { applyArgs: [3], undoArgs: [23] };
                case 'underlined':
                    return { applyArgs: [4], undoArgs: [24] };
                case 'inverted':
                    return { applyArgs: [7], undoArgs: [27] };
                default:
                    const { r, g, b } = color_1.Color.fromHex(style).rgba;
                    return { applyArgs: [38, 2, r, g, b], undoArgs: [39] };
            }
        }
    }
    __decorate([
        (0, decorators_1.debounce)(2000)
    ], TypeAheadStyle.prototype, "debounceStopTracking", null);
    const compileExcludeRegexp = (programs = terminal_1.DEFAULT_LOCAL_ECHO_EXCLUDE) => new RegExp(`\\b(${programs.map(strings_1.escapeRegExpCharacters).join('|')})\\b`, 'i');
    var CharPredictState;
    (function (CharPredictState) {
        /** No characters typed on this line yet */
        CharPredictState[CharPredictState["Unknown"] = 0] = "Unknown";
        /** Has a pending character prediction */
        CharPredictState[CharPredictState["HasPendingChar"] = 1] = "HasPendingChar";
        /** Character validated on this line */
        CharPredictState[CharPredictState["Validated"] = 2] = "Validated";
    })(CharPredictState = exports.CharPredictState || (exports.CharPredictState = {}));
    let TypeAheadAddon = class TypeAheadAddon extends lifecycle_1.Disposable {
        constructor(processManager, config, telemetryService) {
            super();
            this.processManager = processManager;
            this.config = config;
            this.telemetryService = telemetryService;
            this.typeaheadThreshold = this.config.config.localEchoLatencyThreshold;
            this.excludeProgramRe = compileExcludeRegexp(this.config.config.localEchoExcludePrograms);
            this.terminalTitle = '';
            this._register((0, lifecycle_1.toDisposable)(() => { var _a; return (_a = this.clearPredictionDebounce) === null || _a === void 0 ? void 0 : _a.dispose(); }));
        }
        activate(terminal) {
            const style = this.typeaheadStyle = this._register(new TypeAheadStyle(this.config.config.localEchoStyle, terminal));
            const timeline = this.timeline = new PredictionTimeline(terminal, this.typeaheadStyle);
            const stats = this.stats = this._register(new PredictionStats(this.timeline));
            timeline.setShowPredictions(this.typeaheadThreshold === 0);
            this._register(terminal.onData(e => this.onUserData(e)));
            this._register(terminal.onTitleChange(title => {
                this.terminalTitle = title;
                this.reevaluatePredictorState(stats, timeline);
            }));
            this._register(terminal.onResize(() => {
                timeline.setShowPredictions(false);
                timeline.clearCursor();
                this.reevaluatePredictorState(stats, timeline);
            }));
            this._register(this.config.onConfigChanged(() => {
                style.onUpdate(this.config.config.localEchoStyle);
                this.typeaheadThreshold = this.config.config.localEchoLatencyThreshold;
                this.excludeProgramRe = compileExcludeRegexp(this.config.config.localEchoExcludePrograms);
                this.reevaluatePredictorState(stats, timeline);
            }));
            this._register(this.timeline.onPredictionSucceeded(p => {
                var _a;
                if (((_a = this.lastRow) === null || _a === void 0 ? void 0 : _a.charState) === 1 /* HasPendingChar */ && (0, exports.isTenativeCharacterPrediction)(p) && p.inner.appliedAt) {
                    if (p.inner.appliedAt.pos.y + p.inner.appliedAt.pos.baseY === this.lastRow.y) {
                        this.lastRow.charState = 2 /* Validated */;
                    }
                }
            }));
            this._register(this.processManager.onBeforeProcessData(e => this.onBeforeProcessData(e)));
            let nextStatsSend;
            this._register(stats.onChange(() => {
                if (!nextStatsSend) {
                    nextStatsSend = setTimeout(() => {
                        this.sendLatencyStats(stats);
                        nextStatsSend = undefined;
                    }, statsSendTelemetryEvery);
                }
                if (timeline.length === 0) {
                    style.debounceStopTracking();
                }
                this.reevaluatePredictorState(stats, timeline);
            }));
        }
        reset() {
            this.lastRow = undefined;
        }
        deferClearingPredictions() {
            var _a, _b;
            if (!this.stats || !this.timeline) {
                return;
            }
            (_a = this.clearPredictionDebounce) === null || _a === void 0 ? void 0 : _a.dispose();
            if (this.timeline.length === 0 || ((_b = this.timeline.peekStart()) === null || _b === void 0 ? void 0 : _b.clearAfterTimeout) === false) {
                this.clearPredictionDebounce = undefined;
                return;
            }
            this.clearPredictionDebounce = (0, async_1.disposableTimeout)(() => {
                var _a, _b;
                (_a = this.timeline) === null || _a === void 0 ? void 0 : _a.undoAllPredictions();
                if (((_b = this.lastRow) === null || _b === void 0 ? void 0 : _b.charState) === 1 /* HasPendingChar */) {
                    this.lastRow.charState = 0 /* Unknown */;
                }
            }, Math.max(500, this.stats.maxLatency * 3 / 2));
        }
        /**
         * Note on debounce:
         *
         * We want to toggle the state only when the user has a pause in their
         * typing. Otherwise, we could turn this on when the PTY sent data but the
         * terminal cursor is not updated, causes issues.
         */
        reevaluatePredictorState(stats, timeline) {
            this.reevaluatePredictorStateNow(stats, timeline);
        }
        reevaluatePredictorStateNow(stats, timeline) {
            if (this.excludeProgramRe.test(this.terminalTitle)) {
                timeline.setShowPredictions(false);
            }
            else if (this.typeaheadThreshold < 0) {
                timeline.setShowPredictions(false);
            }
            else if (this.typeaheadThreshold === 0) {
                timeline.setShowPredictions(true);
            }
            else if (stats.sampleSize > statsMinSamplesToTurnOn && stats.accuracy > statsMinAccuracyToTurnOn) {
                const latency = stats.latency.median;
                if (latency >= this.typeaheadThreshold) {
                    timeline.setShowPredictions(true);
                }
                else if (latency < this.typeaheadThreshold / statsToggleOffThreshold) {
                    timeline.setShowPredictions(false);
                }
            }
        }
        sendLatencyStats(stats) {
            /* __GDPR__
                "terminalLatencyStats" : {
                    "min" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "max" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "median" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "count" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true },
                    "predictionAccuracy" : { "classification": "SystemMetaData", "purpose": "PerformanceAndHealth", "isMeasurement": true }
                }
             */
            this.telemetryService.publicLog('terminalLatencyStats', Object.assign(Object.assign({}, stats.latency), { predictionAccuracy: stats.accuracy }));
        }
        onUserData(data) {
            var _a, _b, _c, _d;
            if (((_a = this.timeline) === null || _a === void 0 ? void 0 : _a.terminal.buffer.active.type) !== 'normal') {
                return;
            }
            // console.log('user data:', JSON.stringify(data));
            const terminal = this.timeline.terminal;
            const buffer = terminal.buffer.active;
            // Detect programs like git log/less that use the normal buffer but don't
            // take input by deafult (fixes #109541)
            if (buffer.cursorX === 1 && buffer.cursorY === terminal.rows - 1) {
                if (((_c = (_b = buffer.getLine(buffer.cursorY + buffer.baseY)) === null || _b === void 0 ? void 0 : _b.getCell(0)) === null || _c === void 0 ? void 0 : _c.getChars()) === ':') {
                    return;
                }
            }
            // the following code guards the terminal prompt to avoid being able to
            // arrow or backspace-into the prompt. Record the lowest X value at which
            // the user gave input, and mark all additions before that as tentative.
            const actualY = buffer.baseY + buffer.cursorY;
            if (actualY !== ((_d = this.lastRow) === null || _d === void 0 ? void 0 : _d.y)) {
                this.lastRow = { y: actualY, startingX: buffer.cursorX, endingX: buffer.cursorX, charState: 0 /* Unknown */ };
            }
            else {
                this.lastRow.startingX = Math.min(this.lastRow.startingX, buffer.cursorX);
                this.lastRow.endingX = Math.max(this.lastRow.endingX, this.timeline.physicalCursor(buffer).x);
            }
            const addLeftNavigating = (p) => this.timeline.tentativeCursor(buffer).x <= this.lastRow.startingX
                ? this.timeline.addBoundary(buffer, p)
                : this.timeline.addPrediction(buffer, p);
            const addRightNavigating = (p) => this.timeline.tentativeCursor(buffer).x >= this.lastRow.endingX - 1
                ? this.timeline.addBoundary(buffer, p)
                : this.timeline.addPrediction(buffer, p);
            /** @see https://github.com/xtermjs/xterm.js/blob/1913e9512c048e3cf56bb5f5df51bfff6899c184/src/common/input/Keyboard.ts */
            const reader = new StringReader(data);
            while (reader.remaining > 0) {
                if (reader.eatCharCode(127)) { // backspace
                    const previous = this.timeline.peekEnd();
                    if (previous && previous instanceof CharacterPrediction) {
                        this.timeline.addBoundary();
                    }
                    // backspace must be able to read the previously-written character in
                    // the event that it needs to undo it
                    if (this.timeline.isShowingPredictions) {
                        flushOutput(this.timeline.terminal);
                    }
                    if (this.timeline.tentativeCursor(buffer).x <= this.lastRow.startingX) {
                        this.timeline.addBoundary(buffer, new BackspacePrediction(this.timeline.terminal));
                    }
                    else {
                        // Backspace decrements our ability to go right.
                        this.lastRow.endingX--;
                        this.timeline.addPrediction(buffer, new BackspacePrediction(this.timeline.terminal));
                    }
                    continue;
                }
                if (reader.eatCharCode(32, 126)) { // alphanum
                    const char = data[reader.index - 1];
                    const prediction = new CharacterPrediction(this.typeaheadStyle, char);
                    if (this.lastRow.charState === 0 /* Unknown */) {
                        this.timeline.addBoundary(buffer, prediction);
                        this.lastRow.charState = 1 /* HasPendingChar */;
                    }
                    else {
                        this.timeline.addPrediction(buffer, prediction);
                    }
                    if (this.timeline.tentativeCursor(buffer).x >= terminal.cols) {
                        this.timeline.addBoundary(buffer, new LinewrapPrediction());
                    }
                    continue;
                }
                const cursorMv = reader.eatRe(CSI_MOVE_RE);
                if (cursorMv) {
                    const direction = cursorMv[3];
                    const p = new CursorMovePrediction(direction, !!cursorMv[2], Number(cursorMv[1]) || 1);
                    if (direction === "D" /* Back */) {
                        addLeftNavigating(p);
                    }
                    else {
                        addRightNavigating(p);
                    }
                    continue;
                }
                if (reader.eatStr(`${ESC}f`)) {
                    addRightNavigating(new CursorMovePrediction("C" /* Forwards */, true, 1));
                    continue;
                }
                if (reader.eatStr(`${ESC}b`)) {
                    addLeftNavigating(new CursorMovePrediction("D" /* Back */, true, 1));
                    continue;
                }
                if (reader.eatChar('\r') && buffer.cursorY < terminal.rows - 1) {
                    this.timeline.addPrediction(buffer, new NewlinePrediction());
                    continue;
                }
                // something else
                this.timeline.addBoundary(buffer, new HardBoundary());
                break;
            }
            if (this.timeline.length === 1) {
                this.deferClearingPredictions();
                this.typeaheadStyle.startTracking();
            }
        }
        onBeforeProcessData(event) {
            if (!this.timeline) {
                return;
            }
            // console.log('incoming data:', JSON.stringify(event.data));
            event.data = this.timeline.beforeServerInput(event.data);
            // console.log('emitted data:', JSON.stringify(event.data));
            this.deferClearingPredictions();
        }
    };
    __decorate([
        (0, decorators_1.debounce)(100)
    ], TypeAheadAddon.prototype, "reevaluatePredictorState", null);
    TypeAheadAddon = __decorate([
        __param(2, telemetry_1.ITelemetryService)
    ], TypeAheadAddon);
    exports.TypeAheadAddon = TypeAheadAddon;
});
//# sourceMappingURL=terminalTypeAheadAddon.js.map