/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/common/problemMatcher", "vs/base/common/objects", "vs/base/common/strings", "vs/base/common/assert", "vs/base/common/path", "vs/base/common/types", "vs/base/common/uuid", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/uri", "vs/base/common/parsers", "vs/platform/markers/common/markers", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/base/common/event"], function (require, exports, nls_1, Objects, Strings, Assert, path_1, Types, UUID, Platform, severity_1, uri_1, parsers_1, markers_1, extensionsRegistry_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProblemMatcherRegistry = exports.ProblemMatcherParser = exports.ProblemPatternRegistry = exports.Schemas = exports.ExtensionRegistryReporter = exports.ProblemPatternParser = exports.Config = exports.createLineMatcher = exports.getResource = exports.isNamedProblemMatcher = exports.ApplyToKind = exports.ProblemLocationKind = exports.FileLocationKind = void 0;
    var FileLocationKind;
    (function (FileLocationKind) {
        FileLocationKind[FileLocationKind["Default"] = 0] = "Default";
        FileLocationKind[FileLocationKind["Relative"] = 1] = "Relative";
        FileLocationKind[FileLocationKind["Absolute"] = 2] = "Absolute";
        FileLocationKind[FileLocationKind["AutoDetect"] = 3] = "AutoDetect";
    })(FileLocationKind = exports.FileLocationKind || (exports.FileLocationKind = {}));
    (function (FileLocationKind) {
        function fromString(value) {
            value = value.toLowerCase();
            if (value === 'absolute') {
                return FileLocationKind.Absolute;
            }
            else if (value === 'relative') {
                return FileLocationKind.Relative;
            }
            else if (value === 'autodetect') {
                return FileLocationKind.AutoDetect;
            }
            else {
                return undefined;
            }
        }
        FileLocationKind.fromString = fromString;
    })(FileLocationKind = exports.FileLocationKind || (exports.FileLocationKind = {}));
    var ProblemLocationKind;
    (function (ProblemLocationKind) {
        ProblemLocationKind[ProblemLocationKind["File"] = 0] = "File";
        ProblemLocationKind[ProblemLocationKind["Location"] = 1] = "Location";
    })(ProblemLocationKind = exports.ProblemLocationKind || (exports.ProblemLocationKind = {}));
    (function (ProblemLocationKind) {
        function fromString(value) {
            value = value.toLowerCase();
            if (value === 'file') {
                return ProblemLocationKind.File;
            }
            else if (value === 'location') {
                return ProblemLocationKind.Location;
            }
            else {
                return undefined;
            }
        }
        ProblemLocationKind.fromString = fromString;
    })(ProblemLocationKind = exports.ProblemLocationKind || (exports.ProblemLocationKind = {}));
    var ApplyToKind;
    (function (ApplyToKind) {
        ApplyToKind[ApplyToKind["allDocuments"] = 0] = "allDocuments";
        ApplyToKind[ApplyToKind["openDocuments"] = 1] = "openDocuments";
        ApplyToKind[ApplyToKind["closedDocuments"] = 2] = "closedDocuments";
    })(ApplyToKind = exports.ApplyToKind || (exports.ApplyToKind = {}));
    (function (ApplyToKind) {
        function fromString(value) {
            value = value.toLowerCase();
            if (value === 'alldocuments') {
                return ApplyToKind.allDocuments;
            }
            else if (value === 'opendocuments') {
                return ApplyToKind.openDocuments;
            }
            else if (value === 'closeddocuments') {
                return ApplyToKind.closedDocuments;
            }
            else {
                return undefined;
            }
        }
        ApplyToKind.fromString = fromString;
    })(ApplyToKind = exports.ApplyToKind || (exports.ApplyToKind = {}));
    function isNamedProblemMatcher(value) {
        return value && Types.isString(value.name) ? true : false;
    }
    exports.isNamedProblemMatcher = isNamedProblemMatcher;
    async function getResource(filename, matcher, fileService) {
        let kind = matcher.fileLocation;
        let fullPath;
        if (kind === FileLocationKind.Absolute) {
            fullPath = filename;
        }
        else if ((kind === FileLocationKind.Relative) && matcher.filePrefix) {
            fullPath = (0, path_1.join)(matcher.filePrefix, filename);
        }
        else if (kind === FileLocationKind.AutoDetect) {
            const matcherClone = Objects.deepClone(matcher);
            matcherClone.fileLocation = FileLocationKind.Relative;
            if (fileService) {
                const relative = await getResource(filename, matcherClone);
                let stat = undefined;
                try {
                    stat = await fileService.resolve(relative);
                }
                catch (ex) {
                    // Do nothing, we just need to catch file resolution errors.
                }
                if (stat) {
                    return relative;
                }
            }
            matcherClone.fileLocation = FileLocationKind.Absolute;
            return getResource(filename, matcherClone);
        }
        if (fullPath === undefined) {
            throw new Error('FileLocationKind is not actionable. Does the matcher have a filePrefix? This should never happen.');
        }
        fullPath = (0, path_1.normalize)(fullPath);
        fullPath = fullPath.replace(/\\/g, '/');
        if (fullPath[0] !== '/') {
            fullPath = '/' + fullPath;
        }
        if (matcher.uriProvider !== undefined) {
            return matcher.uriProvider(fullPath);
        }
        else {
            return uri_1.URI.file(fullPath);
        }
    }
    exports.getResource = getResource;
    function createLineMatcher(matcher, fileService) {
        let pattern = matcher.pattern;
        if (Types.isArray(pattern)) {
            return new MultiLineMatcher(matcher, fileService);
        }
        else {
            return new SingleLineMatcher(matcher, fileService);
        }
    }
    exports.createLineMatcher = createLineMatcher;
    const endOfLine = Platform.OS === 1 /* Windows */ ? '\r\n' : '\n';
    class AbstractLineMatcher {
        constructor(matcher, fileService) {
            this.matcher = matcher;
            this.fileService = fileService;
        }
        handle(lines, start = 0) {
            return { match: null, continue: false };
        }
        next(line) {
            return null;
        }
        fillProblemData(data, pattern, matches) {
            if (data) {
                this.fillProperty(data, 'file', pattern, matches, true);
                this.appendProperty(data, 'message', pattern, matches, true);
                this.fillProperty(data, 'code', pattern, matches, true);
                this.fillProperty(data, 'severity', pattern, matches, true);
                this.fillProperty(data, 'location', pattern, matches, true);
                this.fillProperty(data, 'line', pattern, matches);
                this.fillProperty(data, 'character', pattern, matches);
                this.fillProperty(data, 'endLine', pattern, matches);
                this.fillProperty(data, 'endCharacter', pattern, matches);
                return true;
            }
            else {
                return false;
            }
        }
        appendProperty(data, property, pattern, matches, trim = false) {
            const patternProperty = pattern[property];
            if (Types.isUndefined(data[property])) {
                this.fillProperty(data, property, pattern, matches, trim);
            }
            else if (!Types.isUndefined(patternProperty) && patternProperty < matches.length) {
                let value = matches[patternProperty];
                if (trim) {
                    value = Strings.trim(value);
                }
                data[property] += endOfLine + value;
            }
        }
        fillProperty(data, property, pattern, matches, trim = false) {
            const patternAtProperty = pattern[property];
            if (Types.isUndefined(data[property]) && !Types.isUndefined(patternAtProperty) && patternAtProperty < matches.length) {
                let value = matches[patternAtProperty];
                if (value !== undefined) {
                    if (trim) {
                        value = Strings.trim(value);
                    }
                    data[property] = value;
                }
            }
        }
        getMarkerMatch(data) {
            try {
                let location = this.getLocation(data);
                if (data.file && location && data.message) {
                    let marker = {
                        severity: this.getSeverity(data),
                        startLineNumber: location.startLineNumber,
                        startColumn: location.startCharacter,
                        endLineNumber: location.endLineNumber,
                        endColumn: location.endCharacter,
                        message: data.message
                    };
                    if (data.code !== undefined) {
                        marker.code = data.code;
                    }
                    if (this.matcher.source !== undefined) {
                        marker.source = this.matcher.source;
                    }
                    return {
                        description: this.matcher,
                        resource: this.getResource(data.file),
                        marker: marker
                    };
                }
            }
            catch (err) {
                console.error(`Failed to convert problem data into match: ${JSON.stringify(data)}`);
            }
            return undefined;
        }
        getResource(filename) {
            return getResource(filename, this.matcher, this.fileService);
        }
        getLocation(data) {
            if (data.kind === ProblemLocationKind.File) {
                return this.createLocation(0, 0, 0, 0);
            }
            if (data.location) {
                return this.parseLocationInfo(data.location);
            }
            if (!data.line) {
                return null;
            }
            let startLine = parseInt(data.line);
            let startColumn = data.character ? parseInt(data.character) : undefined;
            let endLine = data.endLine ? parseInt(data.endLine) : undefined;
            let endColumn = data.endCharacter ? parseInt(data.endCharacter) : undefined;
            return this.createLocation(startLine, startColumn, endLine, endColumn);
        }
        parseLocationInfo(value) {
            if (!value || !value.match(/(\d+|\d+,\d+|\d+,\d+,\d+,\d+)/)) {
                return null;
            }
            let parts = value.split(',');
            let startLine = parseInt(parts[0]);
            let startColumn = parts.length > 1 ? parseInt(parts[1]) : undefined;
            if (parts.length > 3) {
                return this.createLocation(startLine, startColumn, parseInt(parts[2]), parseInt(parts[3]));
            }
            else {
                return this.createLocation(startLine, startColumn, undefined, undefined);
            }
        }
        createLocation(startLine, startColumn, endLine, endColumn) {
            if (startColumn !== undefined && endColumn !== undefined) {
                return { startLineNumber: startLine, startCharacter: startColumn, endLineNumber: endLine || startLine, endCharacter: endColumn };
            }
            if (startColumn !== undefined) {
                return { startLineNumber: startLine, startCharacter: startColumn, endLineNumber: startLine, endCharacter: startColumn };
            }
            return { startLineNumber: startLine, startCharacter: 1, endLineNumber: startLine, endCharacter: 2 ** 31 - 1 }; // See https://github.com/microsoft/vscode/issues/80288#issuecomment-650636442 for discussion
        }
        getSeverity(data) {
            let result = null;
            if (data.severity) {
                let value = data.severity;
                if (value) {
                    result = severity_1.default.fromValue(value);
                    if (result === severity_1.default.Ignore) {
                        if (value === 'E') {
                            result = severity_1.default.Error;
                        }
                        else if (value === 'W') {
                            result = severity_1.default.Warning;
                        }
                        else if (value === 'I') {
                            result = severity_1.default.Info;
                        }
                        else if (Strings.equalsIgnoreCase(value, 'hint')) {
                            result = severity_1.default.Info;
                        }
                        else if (Strings.equalsIgnoreCase(value, 'note')) {
                            result = severity_1.default.Info;
                        }
                    }
                }
            }
            if (result === null || result === severity_1.default.Ignore) {
                result = this.matcher.severity || severity_1.default.Error;
            }
            return markers_1.MarkerSeverity.fromSeverity(result);
        }
    }
    class SingleLineMatcher extends AbstractLineMatcher {
        constructor(matcher, fileService) {
            super(matcher, fileService);
            this.pattern = matcher.pattern;
        }
        get matchLength() {
            return 1;
        }
        handle(lines, start = 0) {
            Assert.ok(lines.length - start === 1);
            let data = Object.create(null);
            if (this.pattern.kind !== undefined) {
                data.kind = this.pattern.kind;
            }
            let matches = this.pattern.regexp.exec(lines[start]);
            if (matches) {
                this.fillProblemData(data, this.pattern, matches);
                let match = this.getMarkerMatch(data);
                if (match) {
                    return { match: match, continue: false };
                }
            }
            return { match: null, continue: false };
        }
        next(line) {
            return null;
        }
    }
    class MultiLineMatcher extends AbstractLineMatcher {
        constructor(matcher, fileService) {
            super(matcher, fileService);
            this.patterns = matcher.pattern;
        }
        get matchLength() {
            return this.patterns.length;
        }
        handle(lines, start = 0) {
            Assert.ok(lines.length - start === this.patterns.length);
            this.data = Object.create(null);
            let data = this.data;
            data.kind = this.patterns[0].kind;
            for (let i = 0; i < this.patterns.length; i++) {
                let pattern = this.patterns[i];
                let matches = pattern.regexp.exec(lines[i + start]);
                if (!matches) {
                    return { match: null, continue: false };
                }
                else {
                    // Only the last pattern can loop
                    if (pattern.loop && i === this.patterns.length - 1) {
                        data = Objects.deepClone(data);
                    }
                    this.fillProblemData(data, pattern, matches);
                }
            }
            let loop = !!this.patterns[this.patterns.length - 1].loop;
            if (!loop) {
                this.data = undefined;
            }
            const markerMatch = data ? this.getMarkerMatch(data) : null;
            return { match: markerMatch ? markerMatch : null, continue: loop };
        }
        next(line) {
            let pattern = this.patterns[this.patterns.length - 1];
            Assert.ok(pattern.loop === true && this.data !== null);
            let matches = pattern.regexp.exec(line);
            if (!matches) {
                this.data = undefined;
                return null;
            }
            let data = Objects.deepClone(this.data);
            let problemMatch;
            if (this.fillProblemData(data, pattern, matches)) {
                problemMatch = this.getMarkerMatch(data);
            }
            return problemMatch ? problemMatch : null;
        }
    }
    var Config;
    (function (Config) {
        let CheckedProblemPattern;
        (function (CheckedProblemPattern) {
            function is(value) {
                let candidate = value;
                return candidate && Types.isString(candidate.regexp);
            }
            CheckedProblemPattern.is = is;
        })(CheckedProblemPattern = Config.CheckedProblemPattern || (Config.CheckedProblemPattern = {}));
        let NamedProblemPattern;
        (function (NamedProblemPattern) {
            function is(value) {
                let candidate = value;
                return candidate && Types.isString(candidate.name);
            }
            NamedProblemPattern.is = is;
        })(NamedProblemPattern = Config.NamedProblemPattern || (Config.NamedProblemPattern = {}));
        let NamedCheckedProblemPattern;
        (function (NamedCheckedProblemPattern) {
            function is(value) {
                let candidate = value;
                return candidate && NamedProblemPattern.is(candidate) && Types.isString(candidate.regexp);
            }
            NamedCheckedProblemPattern.is = is;
        })(NamedCheckedProblemPattern = Config.NamedCheckedProblemPattern || (Config.NamedCheckedProblemPattern = {}));
        let MultiLineProblemPattern;
        (function (MultiLineProblemPattern) {
            function is(value) {
                return value && Types.isArray(value);
            }
            MultiLineProblemPattern.is = is;
        })(MultiLineProblemPattern = Config.MultiLineProblemPattern || (Config.MultiLineProblemPattern = {}));
        let MultiLineCheckedProblemPattern;
        (function (MultiLineCheckedProblemPattern) {
            function is(value) {
                if (!MultiLineProblemPattern.is(value)) {
                    return false;
                }
                for (const element of value) {
                    if (!Config.CheckedProblemPattern.is(element)) {
                        return false;
                    }
                }
                return true;
            }
            MultiLineCheckedProblemPattern.is = is;
        })(MultiLineCheckedProblemPattern = Config.MultiLineCheckedProblemPattern || (Config.MultiLineCheckedProblemPattern = {}));
        let NamedMultiLineCheckedProblemPattern;
        (function (NamedMultiLineCheckedProblemPattern) {
            function is(value) {
                let candidate = value;
                return candidate && Types.isString(candidate.name) && Types.isArray(candidate.patterns) && MultiLineCheckedProblemPattern.is(candidate.patterns);
            }
            NamedMultiLineCheckedProblemPattern.is = is;
        })(NamedMultiLineCheckedProblemPattern = Config.NamedMultiLineCheckedProblemPattern || (Config.NamedMultiLineCheckedProblemPattern = {}));
        function isNamedProblemMatcher(value) {
            return Types.isString(value.name);
        }
        Config.isNamedProblemMatcher = isNamedProblemMatcher;
    })(Config = exports.Config || (exports.Config = {}));
    class ProblemPatternParser extends parsers_1.Parser {
        constructor(logger) {
            super(logger);
        }
        parse(value) {
            if (Config.NamedMultiLineCheckedProblemPattern.is(value)) {
                return this.createNamedMultiLineProblemPattern(value);
            }
            else if (Config.MultiLineCheckedProblemPattern.is(value)) {
                return this.createMultiLineProblemPattern(value);
            }
            else if (Config.NamedCheckedProblemPattern.is(value)) {
                let result = this.createSingleProblemPattern(value);
                result.name = value.name;
                return result;
            }
            else if (Config.CheckedProblemPattern.is(value)) {
                return this.createSingleProblemPattern(value);
            }
            else {
                this.error((0, nls_1.localize)(0, null));
                return null;
            }
        }
        createSingleProblemPattern(value) {
            let result = this.doCreateSingleProblemPattern(value, true);
            if (result === undefined) {
                return null;
            }
            else if (result.kind === undefined) {
                result.kind = ProblemLocationKind.Location;
            }
            return this.validateProblemPattern([result]) ? result : null;
        }
        createNamedMultiLineProblemPattern(value) {
            const validPatterns = this.createMultiLineProblemPattern(value.patterns);
            if (!validPatterns) {
                return null;
            }
            let result = {
                name: value.name,
                label: value.label ? value.label : value.name,
                patterns: validPatterns
            };
            return result;
        }
        createMultiLineProblemPattern(values) {
            let result = [];
            for (let i = 0; i < values.length; i++) {
                let pattern = this.doCreateSingleProblemPattern(values[i], false);
                if (pattern === undefined) {
                    return null;
                }
                if (i < values.length - 1) {
                    if (!Types.isUndefined(pattern.loop) && pattern.loop) {
                        pattern.loop = false;
                        this.error((0, nls_1.localize)(1, null));
                    }
                }
                result.push(pattern);
            }
            if (result[0].kind === undefined) {
                result[0].kind = ProblemLocationKind.Location;
            }
            return this.validateProblemPattern(result) ? result : null;
        }
        doCreateSingleProblemPattern(value, setDefaults) {
            const regexp = this.createRegularExpression(value.regexp);
            if (regexp === undefined) {
                return undefined;
            }
            let result = { regexp };
            if (value.kind) {
                result.kind = ProblemLocationKind.fromString(value.kind);
            }
            function copyProperty(result, source, resultKey, sourceKey) {
                const value = source[sourceKey];
                if (typeof value === 'number') {
                    result[resultKey] = value;
                }
            }
            copyProperty(result, value, 'file', 'file');
            copyProperty(result, value, 'location', 'location');
            copyProperty(result, value, 'line', 'line');
            copyProperty(result, value, 'character', 'column');
            copyProperty(result, value, 'endLine', 'endLine');
            copyProperty(result, value, 'endCharacter', 'endColumn');
            copyProperty(result, value, 'severity', 'severity');
            copyProperty(result, value, 'code', 'code');
            copyProperty(result, value, 'message', 'message');
            if (value.loop === true || value.loop === false) {
                result.loop = value.loop;
            }
            if (setDefaults) {
                if (result.location || result.kind === ProblemLocationKind.File) {
                    let defaultValue = {
                        file: 1,
                        message: 0
                    };
                    result = Objects.mixin(result, defaultValue, false);
                }
                else {
                    let defaultValue = {
                        file: 1,
                        line: 2,
                        character: 3,
                        message: 0
                    };
                    result = Objects.mixin(result, defaultValue, false);
                }
            }
            return result;
        }
        validateProblemPattern(values) {
            let file = false, message = false, location = false, line = false;
            let locationKind = (values[0].kind === undefined) ? ProblemLocationKind.Location : values[0].kind;
            values.forEach((pattern, i) => {
                if (i !== 0 && pattern.kind) {
                    this.error((0, nls_1.localize)(2, null));
                }
                file = file || !Types.isUndefined(pattern.file);
                message = message || !Types.isUndefined(pattern.message);
                location = location || !Types.isUndefined(pattern.location);
                line = line || !Types.isUndefined(pattern.line);
            });
            if (!(file && message)) {
                this.error((0, nls_1.localize)(3, null));
                return false;
            }
            if (locationKind === ProblemLocationKind.Location && !(location || line)) {
                this.error((0, nls_1.localize)(4, null));
                return false;
            }
            return true;
        }
        createRegularExpression(value) {
            let result;
            try {
                result = new RegExp(value);
            }
            catch (err) {
                this.error((0, nls_1.localize)(5, null, value));
            }
            return result;
        }
    }
    exports.ProblemPatternParser = ProblemPatternParser;
    class ExtensionRegistryReporter {
        constructor(_collector, _validationStatus = new parsers_1.ValidationStatus()) {
            this._collector = _collector;
            this._validationStatus = _validationStatus;
        }
        info(message) {
            this._validationStatus.state = 1 /* Info */;
            this._collector.info(message);
        }
        warn(message) {
            this._validationStatus.state = 2 /* Warning */;
            this._collector.warn(message);
        }
        error(message) {
            this._validationStatus.state = 3 /* Error */;
            this._collector.error(message);
        }
        fatal(message) {
            this._validationStatus.state = 4 /* Fatal */;
            this._collector.error(message);
        }
        get status() {
            return this._validationStatus;
        }
    }
    exports.ExtensionRegistryReporter = ExtensionRegistryReporter;
    var Schemas;
    (function (Schemas) {
        Schemas.ProblemPattern = {
            default: {
                regexp: '^([^\\\\s].*)\\\\((\\\\d+,\\\\d+)\\\\):\\\\s*(.*)$',
                file: 1,
                location: 2,
                message: 3
            },
            type: 'object',
            additionalProperties: false,
            properties: {
                regexp: {
                    type: 'string',
                    description: (0, nls_1.localize)(6, null)
                },
                kind: {
                    type: 'string',
                    description: (0, nls_1.localize)(7, null)
                },
                file: {
                    type: 'integer',
                    description: (0, nls_1.localize)(8, null)
                },
                location: {
                    type: 'integer',
                    description: (0, nls_1.localize)(9, null)
                },
                line: {
                    type: 'integer',
                    description: (0, nls_1.localize)(10, null)
                },
                column: {
                    type: 'integer',
                    description: (0, nls_1.localize)(11, null)
                },
                endLine: {
                    type: 'integer',
                    description: (0, nls_1.localize)(12, null)
                },
                endColumn: {
                    type: 'integer',
                    description: (0, nls_1.localize)(13, null)
                },
                severity: {
                    type: 'integer',
                    description: (0, nls_1.localize)(14, null)
                },
                code: {
                    type: 'integer',
                    description: (0, nls_1.localize)(15, null)
                },
                message: {
                    type: 'integer',
                    description: (0, nls_1.localize)(16, null)
                },
                loop: {
                    type: 'boolean',
                    description: (0, nls_1.localize)(17, null)
                }
            }
        };
        Schemas.NamedProblemPattern = Objects.deepClone(Schemas.ProblemPattern);
        Schemas.NamedProblemPattern.properties = Objects.deepClone(Schemas.NamedProblemPattern.properties) || {};
        Schemas.NamedProblemPattern.properties['name'] = {
            type: 'string',
            description: (0, nls_1.localize)(18, null)
        };
        Schemas.MultiLineProblemPattern = {
            type: 'array',
            items: Schemas.ProblemPattern
        };
        Schemas.NamedMultiLineProblemPattern = {
            type: 'object',
            additionalProperties: false,
            properties: {
                name: {
                    type: 'string',
                    description: (0, nls_1.localize)(19, null)
                },
                patterns: {
                    type: 'array',
                    description: (0, nls_1.localize)(20, null),
                    items: Schemas.ProblemPattern
                }
            }
        };
    })(Schemas = exports.Schemas || (exports.Schemas = {}));
    const problemPatternExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'problemPatterns',
        jsonSchema: {
            description: (0, nls_1.localize)(21, null),
            type: 'array',
            items: {
                anyOf: [
                    Schemas.NamedProblemPattern,
                    Schemas.NamedMultiLineProblemPattern
                ]
            }
        }
    });
    class ProblemPatternRegistryImpl {
        constructor() {
            this.patterns = Object.create(null);
            this.fillDefaults();
            this.readyPromise = new Promise((resolve, reject) => {
                problemPatternExtPoint.setHandler((extensions, delta) => {
                    // We get all statically know extension during startup in one batch
                    try {
                        delta.removed.forEach(extension => {
                            let problemPatterns = extension.value;
                            for (let pattern of problemPatterns) {
                                if (this.patterns[pattern.name]) {
                                    delete this.patterns[pattern.name];
                                }
                            }
                        });
                        delta.added.forEach(extension => {
                            let problemPatterns = extension.value;
                            let parser = new ProblemPatternParser(new ExtensionRegistryReporter(extension.collector));
                            for (let pattern of problemPatterns) {
                                if (Config.NamedMultiLineCheckedProblemPattern.is(pattern)) {
                                    let result = parser.parse(pattern);
                                    if (parser.problemReporter.status.state < 3 /* Error */) {
                                        this.add(result.name, result.patterns);
                                    }
                                    else {
                                        extension.collector.error((0, nls_1.localize)(22, null));
                                        extension.collector.error(JSON.stringify(pattern, undefined, 4));
                                    }
                                }
                                else if (Config.NamedProblemPattern.is(pattern)) {
                                    let result = parser.parse(pattern);
                                    if (parser.problemReporter.status.state < 3 /* Error */) {
                                        this.add(pattern.name, result);
                                    }
                                    else {
                                        extension.collector.error((0, nls_1.localize)(23, null));
                                        extension.collector.error(JSON.stringify(pattern, undefined, 4));
                                    }
                                }
                                parser.reset();
                            }
                        });
                    }
                    catch (error) {
                        // Do nothing
                    }
                    resolve(undefined);
                });
            });
        }
        onReady() {
            return this.readyPromise;
        }
        add(key, value) {
            this.patterns[key] = value;
        }
        get(key) {
            return this.patterns[key];
        }
        fillDefaults() {
            this.add('msCompile', {
                regexp: /^(?:\s+\d+\>)?([^\s].*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\)\s*:\s+(error|warning|info)\s+(\w+\d+)\s*:\s*(.*)$/,
                kind: ProblemLocationKind.Location,
                file: 1,
                location: 2,
                severity: 3,
                code: 4,
                message: 5
            });
            this.add('gulp-tsc', {
                regexp: /^([^\s].*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(\d+)\s+(.*)$/,
                kind: ProblemLocationKind.Location,
                file: 1,
                location: 2,
                code: 3,
                message: 4
            });
            this.add('cpp', {
                regexp: /^([^\s].*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(error|warning|info)\s+(C\d+)\s*:\s*(.*)$/,
                kind: ProblemLocationKind.Location,
                file: 1,
                location: 2,
                severity: 3,
                code: 4,
                message: 5
            });
            this.add('csc', {
                regexp: /^([^\s].*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(error|warning|info)\s+(CS\d+)\s*:\s*(.*)$/,
                kind: ProblemLocationKind.Location,
                file: 1,
                location: 2,
                severity: 3,
                code: 4,
                message: 5
            });
            this.add('vb', {
                regexp: /^([^\s].*)\((\d+|\d+,\d+|\d+,\d+,\d+,\d+)\):\s+(error|warning|info)\s+(BC\d+)\s*:\s*(.*)$/,
                kind: ProblemLocationKind.Location,
                file: 1,
                location: 2,
                severity: 3,
                code: 4,
                message: 5
            });
            this.add('lessCompile', {
                regexp: /^\s*(.*) in file (.*) line no. (\d+)$/,
                kind: ProblemLocationKind.Location,
                message: 1,
                file: 2,
                line: 3
            });
            this.add('jshint', {
                regexp: /^(.*):\s+line\s+(\d+),\s+col\s+(\d+),\s(.+?)(?:\s+\((\w)(\d+)\))?$/,
                kind: ProblemLocationKind.Location,
                file: 1,
                line: 2,
                character: 3,
                message: 4,
                severity: 5,
                code: 6
            });
            this.add('jshint-stylish', [
                {
                    regexp: /^(.+)$/,
                    kind: ProblemLocationKind.Location,
                    file: 1
                },
                {
                    regexp: /^\s+line\s+(\d+)\s+col\s+(\d+)\s+(.+?)(?:\s+\((\w)(\d+)\))?$/,
                    line: 1,
                    character: 2,
                    message: 3,
                    severity: 4,
                    code: 5,
                    loop: true
                }
            ]);
            this.add('eslint-compact', {
                regexp: /^(.+):\sline\s(\d+),\scol\s(\d+),\s(Error|Warning|Info)\s-\s(.+)\s\((.+)\)$/,
                file: 1,
                kind: ProblemLocationKind.Location,
                line: 2,
                character: 3,
                severity: 4,
                message: 5,
                code: 6
            });
            this.add('eslint-stylish', [
                {
                    regexp: /^((?:[a-zA-Z]:)*[\\\/.]+.*?)$/,
                    kind: ProblemLocationKind.Location,
                    file: 1
                },
                {
                    regexp: /^\s+(\d+):(\d+)\s+(error|warning|info)\s+(.+?)(?:\s\s+(.*))?$/,
                    line: 1,
                    character: 2,
                    severity: 3,
                    message: 4,
                    code: 5,
                    loop: true
                }
            ]);
            this.add('go', {
                regexp: /^([^:]*: )?((.:)?[^:]*):(\d+)(:(\d+))?: (.*)$/,
                kind: ProblemLocationKind.Location,
                file: 2,
                line: 4,
                character: 6,
                message: 7
            });
        }
    }
    exports.ProblemPatternRegistry = new ProblemPatternRegistryImpl();
    class ProblemMatcherParser extends parsers_1.Parser {
        constructor(logger) {
            super(logger);
        }
        parse(json) {
            let result = this.createProblemMatcher(json);
            if (!this.checkProblemMatcherValid(json, result)) {
                return undefined;
            }
            this.addWatchingMatcher(json, result);
            return result;
        }
        checkProblemMatcherValid(externalProblemMatcher, problemMatcher) {
            if (!problemMatcher) {
                this.error((0, nls_1.localize)(24, null, JSON.stringify(externalProblemMatcher, null, 4)));
                return false;
            }
            if (!problemMatcher.pattern) {
                this.error((0, nls_1.localize)(25, null, JSON.stringify(externalProblemMatcher, null, 4)));
                return false;
            }
            if (!problemMatcher.owner) {
                this.error((0, nls_1.localize)(26, null, JSON.stringify(externalProblemMatcher, null, 4)));
                return false;
            }
            if (Types.isUndefined(problemMatcher.fileLocation)) {
                this.error((0, nls_1.localize)(27, null, JSON.stringify(externalProblemMatcher, null, 4)));
                return false;
            }
            return true;
        }
        createProblemMatcher(description) {
            let result = null;
            let owner = Types.isString(description.owner) ? description.owner : UUID.generateUuid();
            let source = Types.isString(description.source) ? description.source : undefined;
            let applyTo = Types.isString(description.applyTo) ? ApplyToKind.fromString(description.applyTo) : ApplyToKind.allDocuments;
            if (!applyTo) {
                applyTo = ApplyToKind.allDocuments;
            }
            let fileLocation = undefined;
            let filePrefix = undefined;
            let kind;
            if (Types.isUndefined(description.fileLocation)) {
                fileLocation = FileLocationKind.Relative;
                filePrefix = '${workspaceFolder}';
            }
            else if (Types.isString(description.fileLocation)) {
                kind = FileLocationKind.fromString(description.fileLocation);
                if (kind) {
                    fileLocation = kind;
                    if ((kind === FileLocationKind.Relative) || (kind === FileLocationKind.AutoDetect)) {
                        filePrefix = '${workspaceFolder}';
                    }
                }
            }
            else if (Types.isStringArray(description.fileLocation)) {
                let values = description.fileLocation;
                if (values.length > 0) {
                    kind = FileLocationKind.fromString(values[0]);
                    if (values.length === 1 && kind === FileLocationKind.Absolute) {
                        fileLocation = kind;
                    }
                    else if (values.length === 2 && (kind === FileLocationKind.Relative || kind === FileLocationKind.AutoDetect) && values[1]) {
                        fileLocation = kind;
                        filePrefix = values[1];
                    }
                }
            }
            let pattern = description.pattern ? this.createProblemPattern(description.pattern) : undefined;
            let severity = description.severity ? severity_1.default.fromValue(description.severity) : undefined;
            if (severity === severity_1.default.Ignore) {
                this.info((0, nls_1.localize)(28, null, description.severity));
                severity = severity_1.default.Error;
            }
            if (Types.isString(description.base)) {
                let variableName = description.base;
                if (variableName.length > 1 && variableName[0] === '$') {
                    let base = exports.ProblemMatcherRegistry.get(variableName.substring(1));
                    if (base) {
                        result = Objects.deepClone(base);
                        if (description.owner !== undefined && owner !== undefined) {
                            result.owner = owner;
                        }
                        if (description.source !== undefined && source !== undefined) {
                            result.source = source;
                        }
                        if (description.fileLocation !== undefined && fileLocation !== undefined) {
                            result.fileLocation = fileLocation;
                            result.filePrefix = filePrefix;
                        }
                        if (description.pattern !== undefined && pattern !== undefined && pattern !== null) {
                            result.pattern = pattern;
                        }
                        if (description.severity !== undefined && severity !== undefined) {
                            result.severity = severity;
                        }
                        if (description.applyTo !== undefined && applyTo !== undefined) {
                            result.applyTo = applyTo;
                        }
                    }
                }
            }
            else if (fileLocation && pattern) {
                result = {
                    owner: owner,
                    applyTo: applyTo,
                    fileLocation: fileLocation,
                    pattern: pattern,
                };
                if (source) {
                    result.source = source;
                }
                if (filePrefix) {
                    result.filePrefix = filePrefix;
                }
                if (severity) {
                    result.severity = severity;
                }
            }
            if (Config.isNamedProblemMatcher(description)) {
                result.name = description.name;
                result.label = Types.isString(description.label) ? description.label : description.name;
            }
            return result;
        }
        createProblemPattern(value) {
            if (Types.isString(value)) {
                let variableName = value;
                if (variableName.length > 1 && variableName[0] === '$') {
                    let result = exports.ProblemPatternRegistry.get(variableName.substring(1));
                    if (!result) {
                        this.error((0, nls_1.localize)(29, null, variableName));
                    }
                    return result;
                }
                else {
                    if (variableName.length === 0) {
                        this.error((0, nls_1.localize)(30, null));
                    }
                    else {
                        this.error((0, nls_1.localize)(31, null, variableName));
                    }
                }
            }
            else if (value) {
                let problemPatternParser = new ProblemPatternParser(this.problemReporter);
                if (Array.isArray(value)) {
                    return problemPatternParser.parse(value);
                }
                else {
                    return problemPatternParser.parse(value);
                }
            }
            return null;
        }
        addWatchingMatcher(external, internal) {
            let oldBegins = this.createRegularExpression(external.watchedTaskBeginsRegExp);
            let oldEnds = this.createRegularExpression(external.watchedTaskEndsRegExp);
            if (oldBegins && oldEnds) {
                internal.watching = {
                    activeOnStart: false,
                    beginsPattern: { regexp: oldBegins },
                    endsPattern: { regexp: oldEnds }
                };
                return;
            }
            let backgroundMonitor = external.background || external.watching;
            if (Types.isUndefinedOrNull(backgroundMonitor)) {
                return;
            }
            let begins = this.createWatchingPattern(backgroundMonitor.beginsPattern);
            let ends = this.createWatchingPattern(backgroundMonitor.endsPattern);
            if (begins && ends) {
                internal.watching = {
                    activeOnStart: Types.isBoolean(backgroundMonitor.activeOnStart) ? backgroundMonitor.activeOnStart : false,
                    beginsPattern: begins,
                    endsPattern: ends
                };
                return;
            }
            if (begins || ends) {
                this.error((0, nls_1.localize)(32, null));
            }
        }
        createWatchingPattern(external) {
            if (Types.isUndefinedOrNull(external)) {
                return null;
            }
            let regexp;
            let file;
            if (Types.isString(external)) {
                regexp = this.createRegularExpression(external);
            }
            else {
                regexp = this.createRegularExpression(external.regexp);
                if (Types.isNumber(external.file)) {
                    file = external.file;
                }
            }
            if (!regexp) {
                return null;
            }
            return file ? { regexp, file } : { regexp, file: 1 };
        }
        createRegularExpression(value) {
            let result = null;
            if (!value) {
                return result;
            }
            try {
                result = new RegExp(value);
            }
            catch (err) {
                this.error((0, nls_1.localize)(33, null, value));
            }
            return result;
        }
    }
    exports.ProblemMatcherParser = ProblemMatcherParser;
    (function (Schemas) {
        Schemas.WatchingPattern = {
            type: 'object',
            additionalProperties: false,
            properties: {
                regexp: {
                    type: 'string',
                    description: (0, nls_1.localize)(34, null)
                },
                file: {
                    type: 'integer',
                    description: (0, nls_1.localize)(35, null)
                },
            }
        };
        Schemas.PatternType = {
            anyOf: [
                {
                    type: 'string',
                    description: (0, nls_1.localize)(36, null)
                },
                Schemas.ProblemPattern,
                Schemas.MultiLineProblemPattern
            ],
            description: (0, nls_1.localize)(37, null)
        };
        Schemas.ProblemMatcher = {
            type: 'object',
            additionalProperties: false,
            properties: {
                base: {
                    type: 'string',
                    description: (0, nls_1.localize)(38, null)
                },
                owner: {
                    type: 'string',
                    description: (0, nls_1.localize)(39, null)
                },
                source: {
                    type: 'string',
                    description: (0, nls_1.localize)(40, null)
                },
                severity: {
                    type: 'string',
                    enum: ['error', 'warning', 'info'],
                    description: (0, nls_1.localize)(41, null)
                },
                applyTo: {
                    type: 'string',
                    enum: ['allDocuments', 'openDocuments', 'closedDocuments'],
                    description: (0, nls_1.localize)(42, null)
                },
                pattern: Schemas.PatternType,
                fileLocation: {
                    oneOf: [
                        {
                            type: 'string',
                            enum: ['absolute', 'relative', 'autoDetect']
                        },
                        {
                            type: 'array',
                            items: {
                                type: 'string'
                            }
                        }
                    ],
                    description: (0, nls_1.localize)(43, null)
                },
                background: {
                    type: 'object',
                    additionalProperties: false,
                    description: (0, nls_1.localize)(44, null),
                    properties: {
                        activeOnStart: {
                            type: 'boolean',
                            description: (0, nls_1.localize)(45, null)
                        },
                        beginsPattern: {
                            oneOf: [
                                {
                                    type: 'string'
                                },
                                Schemas.WatchingPattern
                            ],
                            description: (0, nls_1.localize)(46, null)
                        },
                        endsPattern: {
                            oneOf: [
                                {
                                    type: 'string'
                                },
                                Schemas.WatchingPattern
                            ],
                            description: (0, nls_1.localize)(47, null)
                        }
                    }
                },
                watching: {
                    type: 'object',
                    additionalProperties: false,
                    deprecationMessage: (0, nls_1.localize)(48, null),
                    description: (0, nls_1.localize)(49, null),
                    properties: {
                        activeOnStart: {
                            type: 'boolean',
                            description: (0, nls_1.localize)(50, null)
                        },
                        beginsPattern: {
                            oneOf: [
                                {
                                    type: 'string'
                                },
                                Schemas.WatchingPattern
                            ],
                            description: (0, nls_1.localize)(51, null)
                        },
                        endsPattern: {
                            oneOf: [
                                {
                                    type: 'string'
                                },
                                Schemas.WatchingPattern
                            ],
                            description: (0, nls_1.localize)(52, null)
                        }
                    }
                }
            }
        };
        Schemas.LegacyProblemMatcher = Objects.deepClone(Schemas.ProblemMatcher);
        Schemas.LegacyProblemMatcher.properties = Objects.deepClone(Schemas.LegacyProblemMatcher.properties) || {};
        Schemas.LegacyProblemMatcher.properties['watchedTaskBeginsRegExp'] = {
            type: 'string',
            deprecationMessage: (0, nls_1.localize)(53, null),
            description: (0, nls_1.localize)(54, null)
        };
        Schemas.LegacyProblemMatcher.properties['watchedTaskEndsRegExp'] = {
            type: 'string',
            deprecationMessage: (0, nls_1.localize)(55, null),
            description: (0, nls_1.localize)(56, null)
        };
        Schemas.NamedProblemMatcher = Objects.deepClone(Schemas.ProblemMatcher);
        Schemas.NamedProblemMatcher.properties = Objects.deepClone(Schemas.NamedProblemMatcher.properties) || {};
        Schemas.NamedProblemMatcher.properties.name = {
            type: 'string',
            description: (0, nls_1.localize)(57, null)
        };
        Schemas.NamedProblemMatcher.properties.label = {
            type: 'string',
            description: (0, nls_1.localize)(58, null)
        };
    })(Schemas = exports.Schemas || (exports.Schemas = {}));
    const problemMatchersExtPoint = extensionsRegistry_1.ExtensionsRegistry.registerExtensionPoint({
        extensionPoint: 'problemMatchers',
        deps: [problemPatternExtPoint],
        jsonSchema: {
            description: (0, nls_1.localize)(59, null),
            type: 'array',
            items: Schemas.NamedProblemMatcher
        }
    });
    class ProblemMatcherRegistryImpl {
        constructor() {
            this._onMatchersChanged = new event_1.Emitter();
            this.onMatcherChanged = this._onMatchersChanged.event;
            this.matchers = Object.create(null);
            this.fillDefaults();
            this.readyPromise = new Promise((resolve, reject) => {
                problemMatchersExtPoint.setHandler((extensions, delta) => {
                    try {
                        delta.removed.forEach(extension => {
                            let problemMatchers = extension.value;
                            for (let matcher of problemMatchers) {
                                if (this.matchers[matcher.name]) {
                                    delete this.matchers[matcher.name];
                                }
                            }
                        });
                        delta.added.forEach(extension => {
                            let problemMatchers = extension.value;
                            let parser = new ProblemMatcherParser(new ExtensionRegistryReporter(extension.collector));
                            for (let matcher of problemMatchers) {
                                let result = parser.parse(matcher);
                                if (result && isNamedProblemMatcher(result)) {
                                    this.add(result);
                                }
                            }
                        });
                        if ((delta.removed.length > 0) || (delta.added.length > 0)) {
                            this._onMatchersChanged.fire();
                        }
                    }
                    catch (error) {
                    }
                    let matcher = this.get('tsc-watch');
                    if (matcher) {
                        matcher.tscWatch = true;
                    }
                    resolve(undefined);
                });
            });
        }
        onReady() {
            exports.ProblemPatternRegistry.onReady();
            return this.readyPromise;
        }
        add(matcher) {
            this.matchers[matcher.name] = matcher;
        }
        get(name) {
            return this.matchers[name];
        }
        keys() {
            return Object.keys(this.matchers);
        }
        fillDefaults() {
            this.add({
                name: 'msCompile',
                label: (0, nls_1.localize)(60, null),
                owner: 'msCompile',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.ProblemPatternRegistry.get('msCompile')
            });
            this.add({
                name: 'lessCompile',
                label: (0, nls_1.localize)(61, null),
                deprecated: true,
                owner: 'lessCompile',
                source: 'less',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.ProblemPatternRegistry.get('lessCompile'),
                severity: severity_1.default.Error
            });
            this.add({
                name: 'gulp-tsc',
                label: (0, nls_1.localize)(62, null),
                owner: 'typescript',
                source: 'ts',
                applyTo: ApplyToKind.closedDocuments,
                fileLocation: FileLocationKind.Relative,
                filePrefix: '${workspaceFolder}',
                pattern: exports.ProblemPatternRegistry.get('gulp-tsc')
            });
            this.add({
                name: 'jshint',
                label: (0, nls_1.localize)(63, null),
                owner: 'jshint',
                source: 'jshint',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.ProblemPatternRegistry.get('jshint')
            });
            this.add({
                name: 'jshint-stylish',
                label: (0, nls_1.localize)(64, null),
                owner: 'jshint',
                source: 'jshint',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.ProblemPatternRegistry.get('jshint-stylish')
            });
            this.add({
                name: 'eslint-compact',
                label: (0, nls_1.localize)(65, null),
                owner: 'eslint',
                source: 'eslint',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                filePrefix: '${workspaceFolder}',
                pattern: exports.ProblemPatternRegistry.get('eslint-compact')
            });
            this.add({
                name: 'eslint-stylish',
                label: (0, nls_1.localize)(66, null),
                owner: 'eslint',
                source: 'eslint',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Absolute,
                pattern: exports.ProblemPatternRegistry.get('eslint-stylish')
            });
            this.add({
                name: 'go',
                label: (0, nls_1.localize)(67, null),
                owner: 'go',
                source: 'go',
                applyTo: ApplyToKind.allDocuments,
                fileLocation: FileLocationKind.Relative,
                filePrefix: '${workspaceFolder}',
                pattern: exports.ProblemPatternRegistry.get('go')
            });
        }
    }
    exports.ProblemMatcherRegistry = new ProblemMatcherRegistryImpl();
});
//# sourceMappingURL=problemMatcher.js.map