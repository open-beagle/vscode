/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/common/replModel", "vs/base/common/severity", "vs/workbench/contrib/debug/common/debugModel", "vs/base/common/types", "vs/base/common/resources", "vs/base/common/uuid", "vs/base/common/event"], function (require, exports, nls, severity_1, debugModel_1, types_1, resources_1, uuid_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReplModel = exports.ReplGroup = exports.ReplEvaluationResult = exports.ReplEvaluationInput = exports.RawObjectReplElement = exports.SimpleReplElement = void 0;
    const MAX_REPL_LENGTH = 10000;
    let topReplElementCounter = 0;
    const getUniqueId = () => `topReplElement:${topReplElementCounter++}`;
    class SimpleReplElement {
        constructor(session, id, value, severity, sourceData) {
            this.session = session;
            this.id = id;
            this.value = value;
            this.severity = severity;
            this.sourceData = sourceData;
            this._count = 1;
            this._onDidChangeCount = new event_1.Emitter();
        }
        toString(includeSource = false) {
            let valueRespectCount = this.value;
            for (let i = 1; i < this.count; i++) {
                valueRespectCount += (valueRespectCount.endsWith('\n') ? '' : '\n') + this.value;
            }
            const sourceStr = (this.sourceData && includeSource) ? ` ${this.sourceData.source.name}` : '';
            return valueRespectCount + sourceStr;
        }
        getId() {
            return this.id;
        }
        set count(value) {
            this._count = value;
            this._onDidChangeCount.fire();
        }
        get count() {
            return this._count;
        }
        get onDidChangeCount() {
            return this._onDidChangeCount.event;
        }
    }
    exports.SimpleReplElement = SimpleReplElement;
    class RawObjectReplElement {
        constructor(id, name, valueObj, sourceData, annotation) {
            this.id = id;
            this.name = name;
            this.valueObj = valueObj;
            this.sourceData = sourceData;
            this.annotation = annotation;
        }
        getId() {
            return this.id;
        }
        get value() {
            if (this.valueObj === null) {
                return 'null';
            }
            else if (Array.isArray(this.valueObj)) {
                return `Array[${this.valueObj.length}]`;
            }
            else if ((0, types_1.isObject)(this.valueObj)) {
                return 'Object';
            }
            else if ((0, types_1.isString)(this.valueObj)) {
                return `"${this.valueObj}"`;
            }
            return String(this.valueObj) || '';
        }
        get hasChildren() {
            return (Array.isArray(this.valueObj) && this.valueObj.length > 0) || ((0, types_1.isObject)(this.valueObj) && Object.getOwnPropertyNames(this.valueObj).length > 0);
        }
        getChildren() {
            let result = [];
            if (Array.isArray(this.valueObj)) {
                result = this.valueObj.slice(0, RawObjectReplElement.MAX_CHILDREN)
                    .map((v, index) => new RawObjectReplElement(`${this.id}:${index}`, String(index), v));
            }
            else if ((0, types_1.isObject)(this.valueObj)) {
                result = Object.getOwnPropertyNames(this.valueObj).slice(0, RawObjectReplElement.MAX_CHILDREN)
                    .map((key, index) => new RawObjectReplElement(`${this.id}:${index}`, key, this.valueObj[key]));
            }
            return Promise.resolve(result);
        }
        toString() {
            return `${this.name}\n${this.value}`;
        }
    }
    exports.RawObjectReplElement = RawObjectReplElement;
    RawObjectReplElement.MAX_CHILDREN = 1000; // upper bound of children per value
    class ReplEvaluationInput {
        constructor(value) {
            this.value = value;
            this.id = (0, uuid_1.generateUuid)();
        }
        toString() {
            return this.value;
        }
        getId() {
            return this.id;
        }
    }
    exports.ReplEvaluationInput = ReplEvaluationInput;
    class ReplEvaluationResult extends debugModel_1.ExpressionContainer {
        constructor() {
            super(undefined, undefined, 0, (0, uuid_1.generateUuid)());
            this._available = true;
        }
        get available() {
            return this._available;
        }
        async evaluateExpression(expression, session, stackFrame, context) {
            const result = await super.evaluateExpression(expression, session, stackFrame, context);
            this._available = result;
            return result;
        }
        toString() {
            return `${this.value}`;
        }
    }
    exports.ReplEvaluationResult = ReplEvaluationResult;
    class ReplGroup {
        constructor(name, autoExpand, sourceData) {
            this.name = name;
            this.autoExpand = autoExpand;
            this.sourceData = sourceData;
            this.children = [];
            this.ended = false;
            this.id = `replGroup:${ReplGroup.COUNTER++}`;
        }
        get hasChildren() {
            return true;
        }
        getId() {
            return this.id;
        }
        toString(includeSource = false) {
            const sourceStr = (includeSource && this.sourceData) ? ` ${this.sourceData.source.name}` : '';
            return this.name + sourceStr;
        }
        addChild(child) {
            const lastElement = this.children.length ? this.children[this.children.length - 1] : undefined;
            if (lastElement instanceof ReplGroup && !lastElement.hasEnded) {
                lastElement.addChild(child);
            }
            else {
                this.children.push(child);
            }
        }
        getChildren() {
            return this.children;
        }
        end() {
            const lastElement = this.children.length ? this.children[this.children.length - 1] : undefined;
            if (lastElement instanceof ReplGroup && !lastElement.hasEnded) {
                lastElement.end();
            }
            else {
                this.ended = true;
            }
        }
        get hasEnded() {
            return this.ended;
        }
    }
    exports.ReplGroup = ReplGroup;
    ReplGroup.COUNTER = 0;
    function areSourcesEqual(first, second) {
        if (!first && !second) {
            return true;
        }
        if (first && second) {
            return first.column === second.column && first.lineNumber === second.lineNumber && first.source.uri.toString() === second.source.uri.toString();
        }
        return false;
    }
    class ReplModel {
        constructor(configurationService) {
            this.configurationService = configurationService;
            this.replElements = [];
            this._onDidChangeElements = new event_1.Emitter();
            this.onDidChangeElements = this._onDidChangeElements.event;
        }
        getReplElements() {
            return this.replElements;
        }
        async addReplExpression(session, stackFrame, name) {
            this.addReplElement(new ReplEvaluationInput(name));
            const result = new ReplEvaluationResult();
            await result.evaluateExpression(name, session, stackFrame, 'repl');
            this.addReplElement(result);
        }
        appendToRepl(session, data, sev, source) {
            const clearAnsiSequence = '\u001b[2J';
            if (typeof data === 'string' && data.indexOf(clearAnsiSequence) >= 0) {
                // [2J is the ansi escape sequence for clearing the display http://ascii-table.com/ansi-escape-sequences.php
                this.removeReplExpressions();
                this.appendToRepl(session, nls.localize(0, null), severity_1.default.Ignore);
                data = data.substr(data.lastIndexOf(clearAnsiSequence) + clearAnsiSequence.length);
            }
            if (typeof data === 'string') {
                const previousElement = this.replElements.length ? this.replElements[this.replElements.length - 1] : undefined;
                if (previousElement instanceof SimpleReplElement && previousElement.severity === sev) {
                    const config = this.configurationService.getValue('debug');
                    if (previousElement.value === data && areSourcesEqual(previousElement.sourceData, source) && config.console.collapseIdenticalLines) {
                        previousElement.count++;
                        // No need to fire an event, just the count updates and badge will adjust automatically
                        return;
                    }
                    if (!previousElement.value.endsWith('\n') && !previousElement.value.endsWith('\r\n') && previousElement.count === 1) {
                        this.replElements[this.replElements.length - 1] = new SimpleReplElement(session, getUniqueId(), previousElement.value + data, sev, source);
                        this._onDidChangeElements.fire();
                        return;
                    }
                }
                const element = new SimpleReplElement(session, getUniqueId(), data, sev, source);
                this.addReplElement(element);
            }
            else {
                // TODO@Isidor hack, we should introduce a new type which is an output that can fetch children like an expression
                data.severity = sev;
                data.sourceData = source;
                this.addReplElement(data);
            }
        }
        startGroup(name, autoExpand, sourceData) {
            const group = new ReplGroup(name, autoExpand, sourceData);
            this.addReplElement(group);
        }
        endGroup() {
            const lastElement = this.replElements[this.replElements.length - 1];
            if (lastElement instanceof ReplGroup) {
                lastElement.end();
            }
        }
        addReplElement(newElement) {
            const lastElement = this.replElements.length ? this.replElements[this.replElements.length - 1] : undefined;
            if (lastElement instanceof ReplGroup && !lastElement.hasEnded) {
                lastElement.addChild(newElement);
            }
            else {
                this.replElements.push(newElement);
                if (this.replElements.length > MAX_REPL_LENGTH) {
                    this.replElements.splice(0, this.replElements.length - MAX_REPL_LENGTH);
                }
            }
            this._onDidChangeElements.fire();
        }
        logToRepl(session, sev, args, frame) {
            let source;
            if (frame) {
                source = {
                    column: frame.column,
                    lineNumber: frame.line,
                    source: session.getSource({
                        name: (0, resources_1.basenameOrAuthority)(frame.uri),
                        path: frame.uri.fsPath
                    })
                };
            }
            // add output for each argument logged
            let simpleVals = [];
            for (let i = 0; i < args.length; i++) {
                let a = args[i];
                // undefined gets printed as 'undefined'
                if (typeof a === 'undefined') {
                    simpleVals.push('undefined');
                }
                // null gets printed as 'null'
                else if (a === null) {
                    simpleVals.push('null');
                }
                // objects & arrays are special because we want to inspect them in the REPL
                else if ((0, types_1.isObject)(a) || Array.isArray(a)) {
                    // flush any existing simple values logged
                    if (simpleVals.length) {
                        this.appendToRepl(session, simpleVals.join(' '), sev, source);
                        simpleVals = [];
                    }
                    // show object
                    this.appendToRepl(session, new RawObjectReplElement(getUniqueId(), a.prototype, a, undefined, nls.localize(1, null)), sev, source);
                }
                // string: watch out for % replacement directive
                // string substitution and formatting @ https://developer.chrome.com/devtools/docs/console
                else if (typeof a === 'string') {
                    let buf = '';
                    for (let j = 0, len = a.length; j < len; j++) {
                        if (a[j] === '%' && (a[j + 1] === 's' || a[j + 1] === 'i' || a[j + 1] === 'd' || a[j + 1] === 'O')) {
                            i++; // read over substitution
                            buf += !(0, types_1.isUndefinedOrNull)(args[i]) ? args[i] : ''; // replace
                            j++; // read over directive
                        }
                        else {
                            buf += a[j];
                        }
                    }
                    simpleVals.push(buf);
                }
                // number or boolean is joined together
                else {
                    simpleVals.push(a);
                }
            }
            // flush simple values
            // always append a new line for output coming from an extension such that separate logs go to separate lines #23695
            if (simpleVals.length) {
                this.appendToRepl(session, simpleVals.join(' ') + '\n', sev, source);
            }
        }
        removeReplExpressions() {
            if (this.replElements.length > 0) {
                this.replElements = [];
                this._onDidChangeElements.fire();
            }
        }
    }
    exports.ReplModel = ReplModel;
});
//# sourceMappingURL=replModel.js.map