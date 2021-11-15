/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/editor/common/config/editorOptions", "vs/base/common/platform", "vs/editor/common/model/wordHelper"], function (require, exports, nls, platform, wordHelper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditorOptions = exports.EditorOption = exports.editorOptionsRegistry = exports.EDITOR_MODEL_DEFAULTS = exports.EDITOR_FONT_DEFAULTS = exports.WrappingIndent = exports.filterValidationDecorations = exports.RenderLineNumbersType = exports.EditorLayoutInfoComputer = exports.RenderMinimap = exports.EditorFontLigatures = exports.cursorStyleToString = exports.TextEditorCursorStyle = exports.TextEditorCursorBlinkingStyle = exports.stringSet = exports.boolean = exports.ComputeOptionsMemory = exports.ValidatedEditorOptions = exports.ConfigurationChangedEvent = exports.MINIMAP_GUTTER_WIDTH = exports.EditorAutoIndentStrategy = void 0;
    /**
     * Configuration options for auto indentation in the editor
     */
    var EditorAutoIndentStrategy;
    (function (EditorAutoIndentStrategy) {
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["None"] = 0] = "None";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Keep"] = 1] = "Keep";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Brackets"] = 2] = "Brackets";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Advanced"] = 3] = "Advanced";
        EditorAutoIndentStrategy[EditorAutoIndentStrategy["Full"] = 4] = "Full";
    })(EditorAutoIndentStrategy = exports.EditorAutoIndentStrategy || (exports.EditorAutoIndentStrategy = {}));
    /**
     * @internal
     * The width of the minimap gutter, in pixels.
     */
    exports.MINIMAP_GUTTER_WIDTH = 8;
    //#endregion
    /**
     * An event describing that the configuration of the editor has changed.
     */
    class ConfigurationChangedEvent {
        /**
         * @internal
         */
        constructor(values) {
            this._values = values;
        }
        hasChanged(id) {
            return this._values[id];
        }
    }
    exports.ConfigurationChangedEvent = ConfigurationChangedEvent;
    /**
     * @internal
     */
    class ValidatedEditorOptions {
        constructor() {
            this._values = [];
        }
        _read(option) {
            return this._values[option];
        }
        get(id) {
            return this._values[id];
        }
        _write(option, value) {
            this._values[option] = value;
        }
    }
    exports.ValidatedEditorOptions = ValidatedEditorOptions;
    /**
     * @internal
     */
    class ComputeOptionsMemory {
        constructor() {
            this.stableMinimapLayoutInput = null;
            this.stableFitMaxMinimapScale = 0;
            this.stableFitRemainingWidth = 0;
        }
    }
    exports.ComputeOptionsMemory = ComputeOptionsMemory;
    /**
     * @internal
     */
    class BaseEditorOption {
        constructor(id, name, defaultValue, schema) {
            this.id = id;
            this.name = name;
            this.defaultValue = defaultValue;
            this.schema = schema;
        }
        compute(env, options, value) {
            return value;
        }
    }
    /**
     * @internal
     */
    class ComputedEditorOption {
        constructor(id, deps = null) {
            this.schema = undefined;
            this.id = id;
            this.name = '_never_';
            this.defaultValue = undefined;
            this.deps = deps;
        }
        validate(input) {
            return this.defaultValue;
        }
    }
    class SimpleEditorOption {
        constructor(id, name, defaultValue, schema) {
            this.id = id;
            this.name = name;
            this.defaultValue = defaultValue;
            this.schema = schema;
        }
        validate(input) {
            if (typeof input === 'undefined') {
                return this.defaultValue;
            }
            return input;
        }
        compute(env, options, value) {
            return value;
        }
    }
    /**
     * @internal
     */
    function boolean(value, defaultValue) {
        if (typeof value === 'undefined') {
            return defaultValue;
        }
        if (value === 'false') {
            // treat the string 'false' as false
            return false;
        }
        return Boolean(value);
    }
    exports.boolean = boolean;
    class EditorBooleanOption extends SimpleEditorOption {
        constructor(id, name, defaultValue, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'boolean';
                schema.default = defaultValue;
            }
            super(id, name, defaultValue, schema);
        }
        validate(input) {
            return boolean(input, this.defaultValue);
        }
    }
    class EditorIntOption extends SimpleEditorOption {
        constructor(id, name, defaultValue, minimum, maximum, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'integer';
                schema.default = defaultValue;
                schema.minimum = minimum;
                schema.maximum = maximum;
            }
            super(id, name, defaultValue, schema);
            this.minimum = minimum;
            this.maximum = maximum;
        }
        static clampedInt(value, defaultValue, minimum, maximum) {
            if (typeof value === 'undefined') {
                return defaultValue;
            }
            let r = parseInt(value, 10);
            if (isNaN(r)) {
                return defaultValue;
            }
            r = Math.max(minimum, r);
            r = Math.min(maximum, r);
            return r | 0;
        }
        validate(input) {
            return EditorIntOption.clampedInt(input, this.defaultValue, this.minimum, this.maximum);
        }
    }
    class EditorFloatOption extends SimpleEditorOption {
        constructor(id, name, defaultValue, validationFn, schema) {
            if (typeof schema !== 'undefined') {
                schema.type = 'number';
                schema.default = defaultValue;
            }
            super(id, name, defaultValue, schema);
            this.validationFn = validationFn;
        }
        static clamp(n, min, max) {
            if (n < min) {
                return min;
            }
            if (n > max) {
                return max;
            }
            return n;
        }
        static float(value, defaultValue) {
            if (typeof value === 'number') {
                return value;
            }
            if (typeof value === 'undefined') {
                return defaultValue;
            }
            const r = parseFloat(value);
            return (isNaN(r) ? defaultValue : r);
        }
        validate(input) {
            return this.validationFn(EditorFloatOption.float(input, this.defaultValue));
        }
    }
    class EditorStringOption extends SimpleEditorOption {
        static string(value, defaultValue) {
            if (typeof value !== 'string') {
                return defaultValue;
            }
            return value;
        }
        constructor(id, name, defaultValue, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'string';
                schema.default = defaultValue;
            }
            super(id, name, defaultValue, schema);
        }
        validate(input) {
            return EditorStringOption.string(input, this.defaultValue);
        }
    }
    /**
     * @internal
     */
    function stringSet(value, defaultValue, allowedValues) {
        if (typeof value !== 'string') {
            return defaultValue;
        }
        if (allowedValues.indexOf(value) === -1) {
            return defaultValue;
        }
        return value;
    }
    exports.stringSet = stringSet;
    class EditorStringEnumOption extends SimpleEditorOption {
        constructor(id, name, defaultValue, allowedValues, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'string';
                schema.enum = allowedValues;
                schema.default = defaultValue;
            }
            super(id, name, defaultValue, schema);
            this._allowedValues = allowedValues;
        }
        validate(input) {
            return stringSet(input, this.defaultValue, this._allowedValues);
        }
    }
    class EditorEnumOption extends BaseEditorOption {
        constructor(id, name, defaultValue, defaultStringValue, allowedValues, convert, schema = undefined) {
            if (typeof schema !== 'undefined') {
                schema.type = 'string';
                schema.enum = allowedValues;
                schema.default = defaultStringValue;
            }
            super(id, name, defaultValue, schema);
            this._allowedValues = allowedValues;
            this._convert = convert;
        }
        validate(input) {
            if (typeof input !== 'string') {
                return this.defaultValue;
            }
            if (this._allowedValues.indexOf(input) === -1) {
                return this.defaultValue;
            }
            return this._convert(input);
        }
    }
    //#endregion
    //#region autoIndent
    function _autoIndentFromString(autoIndent) {
        switch (autoIndent) {
            case 'none': return 0 /* None */;
            case 'keep': return 1 /* Keep */;
            case 'brackets': return 2 /* Brackets */;
            case 'advanced': return 3 /* Advanced */;
            case 'full': return 4 /* Full */;
        }
    }
    //#endregion
    //#region accessibilitySupport
    class EditorAccessibilitySupport extends BaseEditorOption {
        constructor() {
            super(2 /* accessibilitySupport */, 'accessibilitySupport', 0 /* Unknown */, {
                type: 'string',
                enum: ['auto', 'on', 'off'],
                enumDescriptions: [
                    nls.localize(0, null),
                    nls.localize(1, null),
                    nls.localize(2, null),
                ],
                default: 'auto',
                description: nls.localize(3, null)
            });
        }
        validate(input) {
            switch (input) {
                case 'auto': return 0 /* Unknown */;
                case 'off': return 1 /* Disabled */;
                case 'on': return 2 /* Enabled */;
            }
            return this.defaultValue;
        }
        compute(env, options, value) {
            if (value === 0 /* Unknown */) {
                // The editor reads the `accessibilitySupport` from the environment
                return env.accessibilitySupport;
            }
            return value;
        }
    }
    class EditorComments extends BaseEditorOption {
        constructor() {
            const defaults = {
                insertSpace: true,
                ignoreEmptyLines: true,
            };
            super(17 /* comments */, 'comments', defaults, {
                'editor.comments.insertSpace': {
                    type: 'boolean',
                    default: defaults.insertSpace,
                    description: nls.localize(4, null)
                },
                'editor.comments.ignoreEmptyLines': {
                    type: 'boolean',
                    default: defaults.ignoreEmptyLines,
                    description: nls.localize(5, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                insertSpace: boolean(input.insertSpace, this.defaultValue.insertSpace),
                ignoreEmptyLines: boolean(input.ignoreEmptyLines, this.defaultValue.ignoreEmptyLines),
            };
        }
    }
    //#endregion
    //#region cursorBlinking
    /**
     * The kind of animation in which the editor's cursor should be rendered.
     */
    var TextEditorCursorBlinkingStyle;
    (function (TextEditorCursorBlinkingStyle) {
        /**
         * Hidden
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Hidden"] = 0] = "Hidden";
        /**
         * Blinking
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Blink"] = 1] = "Blink";
        /**
         * Blinking with smooth fading
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Smooth"] = 2] = "Smooth";
        /**
         * Blinking with prolonged filled state and smooth fading
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Phase"] = 3] = "Phase";
        /**
         * Expand collapse animation on the y axis
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Expand"] = 4] = "Expand";
        /**
         * No-Blinking
         */
        TextEditorCursorBlinkingStyle[TextEditorCursorBlinkingStyle["Solid"] = 5] = "Solid";
    })(TextEditorCursorBlinkingStyle = exports.TextEditorCursorBlinkingStyle || (exports.TextEditorCursorBlinkingStyle = {}));
    function _cursorBlinkingStyleFromString(cursorBlinkingStyle) {
        switch (cursorBlinkingStyle) {
            case 'blink': return 1 /* Blink */;
            case 'smooth': return 2 /* Smooth */;
            case 'phase': return 3 /* Phase */;
            case 'expand': return 4 /* Expand */;
            case 'solid': return 5 /* Solid */;
        }
    }
    //#endregion
    //#region cursorStyle
    /**
     * The style in which the editor's cursor should be rendered.
     */
    var TextEditorCursorStyle;
    (function (TextEditorCursorStyle) {
        /**
         * As a vertical line (sitting between two characters).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["Line"] = 1] = "Line";
        /**
         * As a block (sitting on top of a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["Block"] = 2] = "Block";
        /**
         * As a horizontal line (sitting under a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["Underline"] = 3] = "Underline";
        /**
         * As a thin vertical line (sitting between two characters).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["LineThin"] = 4] = "LineThin";
        /**
         * As an outlined block (sitting on top of a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["BlockOutline"] = 5] = "BlockOutline";
        /**
         * As a thin horizontal line (sitting under a character).
         */
        TextEditorCursorStyle[TextEditorCursorStyle["UnderlineThin"] = 6] = "UnderlineThin";
    })(TextEditorCursorStyle = exports.TextEditorCursorStyle || (exports.TextEditorCursorStyle = {}));
    /**
     * @internal
     */
    function cursorStyleToString(cursorStyle) {
        switch (cursorStyle) {
            case TextEditorCursorStyle.Line: return 'line';
            case TextEditorCursorStyle.Block: return 'block';
            case TextEditorCursorStyle.Underline: return 'underline';
            case TextEditorCursorStyle.LineThin: return 'line-thin';
            case TextEditorCursorStyle.BlockOutline: return 'block-outline';
            case TextEditorCursorStyle.UnderlineThin: return 'underline-thin';
        }
    }
    exports.cursorStyleToString = cursorStyleToString;
    function _cursorStyleFromString(cursorStyle) {
        switch (cursorStyle) {
            case 'line': return TextEditorCursorStyle.Line;
            case 'block': return TextEditorCursorStyle.Block;
            case 'underline': return TextEditorCursorStyle.Underline;
            case 'line-thin': return TextEditorCursorStyle.LineThin;
            case 'block-outline': return TextEditorCursorStyle.BlockOutline;
            case 'underline-thin': return TextEditorCursorStyle.UnderlineThin;
        }
    }
    //#endregion
    //#region editorClassName
    class EditorClassName extends ComputedEditorOption {
        constructor() {
            super(123 /* editorClassName */, [62 /* mouseStyle */, 31 /* extraEditorClassName */]);
        }
        compute(env, options, _) {
            const classNames = ['monaco-editor'];
            if (options.get(31 /* extraEditorClassName */)) {
                classNames.push(options.get(31 /* extraEditorClassName */));
            }
            if (env.extraEditorClassName) {
                classNames.push(env.extraEditorClassName);
            }
            if (options.get(62 /* mouseStyle */) === 'default') {
                classNames.push('mouse-default');
            }
            else if (options.get(62 /* mouseStyle */) === 'copy') {
                classNames.push('mouse-copy');
            }
            if (options.get(97 /* showUnused */)) {
                classNames.push('showUnused');
            }
            if (options.get(121 /* showDeprecated */)) {
                classNames.push('showDeprecated');
            }
            return classNames.join(' ');
        }
    }
    //#endregion
    //#region emptySelectionClipboard
    class EditorEmptySelectionClipboard extends EditorBooleanOption {
        constructor() {
            super(30 /* emptySelectionClipboard */, 'emptySelectionClipboard', true, { description: nls.localize(6, null) });
        }
        compute(env, options, value) {
            return value && env.emptySelectionClipboard;
        }
    }
    class EditorFind extends BaseEditorOption {
        constructor() {
            const defaults = {
                cursorMoveOnType: true,
                seedSearchStringFromSelection: true,
                autoFindInSelection: 'never',
                globalFindClipboard: false,
                addExtraSpaceOnTop: true,
                loop: true
            };
            super(33 /* find */, 'find', defaults, {
                'editor.find.cursorMoveOnType': {
                    type: 'boolean',
                    default: defaults.cursorMoveOnType,
                    description: nls.localize(7, null)
                },
                'editor.find.seedSearchStringFromSelection': {
                    type: 'boolean',
                    default: defaults.seedSearchStringFromSelection,
                    description: nls.localize(8, null)
                },
                'editor.find.autoFindInSelection': {
                    type: 'string',
                    enum: ['never', 'always', 'multiline'],
                    default: defaults.autoFindInSelection,
                    enumDescriptions: [
                        nls.localize(9, null),
                        nls.localize(10, null),
                        nls.localize(11, null)
                    ],
                    description: nls.localize(12, null)
                },
                'editor.find.globalFindClipboard': {
                    type: 'boolean',
                    default: defaults.globalFindClipboard,
                    description: nls.localize(13, null),
                    included: platform.isMacintosh
                },
                'editor.find.addExtraSpaceOnTop': {
                    type: 'boolean',
                    default: defaults.addExtraSpaceOnTop,
                    description: nls.localize(14, null)
                },
                'editor.find.loop': {
                    type: 'boolean',
                    default: defaults.loop,
                    description: nls.localize(15, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                cursorMoveOnType: boolean(input.cursorMoveOnType, this.defaultValue.cursorMoveOnType),
                seedSearchStringFromSelection: boolean(input.seedSearchStringFromSelection, this.defaultValue.seedSearchStringFromSelection),
                autoFindInSelection: typeof _input.autoFindInSelection === 'boolean'
                    ? (_input.autoFindInSelection ? 'always' : 'never')
                    : stringSet(input.autoFindInSelection, this.defaultValue.autoFindInSelection, ['never', 'always', 'multiline']),
                globalFindClipboard: boolean(input.globalFindClipboard, this.defaultValue.globalFindClipboard),
                addExtraSpaceOnTop: boolean(input.addExtraSpaceOnTop, this.defaultValue.addExtraSpaceOnTop),
                loop: boolean(input.loop, this.defaultValue.loop),
            };
        }
    }
    //#endregion
    //#region fontLigatures
    /**
     * @internal
     */
    class EditorFontLigatures extends BaseEditorOption {
        constructor() {
            super(41 /* fontLigatures */, 'fontLigatures', EditorFontLigatures.OFF, {
                anyOf: [
                    {
                        type: 'boolean',
                        description: nls.localize(16, null),
                    },
                    {
                        type: 'string',
                        description: nls.localize(17, null)
                    }
                ],
                description: nls.localize(18, null),
                default: false
            });
        }
        validate(input) {
            if (typeof input === 'undefined') {
                return this.defaultValue;
            }
            if (typeof input === 'string') {
                if (input === 'false') {
                    return EditorFontLigatures.OFF;
                }
                if (input === 'true') {
                    return EditorFontLigatures.ON;
                }
                return input;
            }
            if (Boolean(input)) {
                return EditorFontLigatures.ON;
            }
            return EditorFontLigatures.OFF;
        }
    }
    exports.EditorFontLigatures = EditorFontLigatures;
    EditorFontLigatures.OFF = '"liga" off, "calt" off';
    EditorFontLigatures.ON = '"liga" on, "calt" on';
    //#endregion
    //#region fontInfo
    class EditorFontInfo extends ComputedEditorOption {
        constructor() {
            super(40 /* fontInfo */);
        }
        compute(env, options, _) {
            return env.fontInfo;
        }
    }
    //#endregion
    //#region fontSize
    class EditorFontSize extends SimpleEditorOption {
        constructor() {
            super(42 /* fontSize */, 'fontSize', exports.EDITOR_FONT_DEFAULTS.fontSize, {
                type: 'number',
                minimum: 6,
                maximum: 100,
                default: exports.EDITOR_FONT_DEFAULTS.fontSize,
                description: nls.localize(19, null)
            });
        }
        validate(input) {
            let r = EditorFloatOption.float(input, this.defaultValue);
            if (r === 0) {
                return exports.EDITOR_FONT_DEFAULTS.fontSize;
            }
            return EditorFloatOption.clamp(r, 6, 100);
        }
        compute(env, options, value) {
            // The final fontSize respects the editor zoom level.
            // So take the result from env.fontInfo
            return env.fontInfo.fontSize;
        }
    }
    //#endregion
    //#region fontWeight
    class EditorFontWeight extends BaseEditorOption {
        constructor() {
            super(43 /* fontWeight */, 'fontWeight', exports.EDITOR_FONT_DEFAULTS.fontWeight, {
                anyOf: [
                    {
                        type: 'number',
                        minimum: EditorFontWeight.MINIMUM_VALUE,
                        maximum: EditorFontWeight.MAXIMUM_VALUE,
                        errorMessage: nls.localize(20, null)
                    },
                    {
                        type: 'string',
                        pattern: '^(normal|bold|1000|[1-9][0-9]{0,2})$'
                    },
                    {
                        enum: EditorFontWeight.SUGGESTION_VALUES
                    }
                ],
                default: exports.EDITOR_FONT_DEFAULTS.fontWeight,
                description: nls.localize(21, null)
            });
        }
        validate(input) {
            if (input === 'normal' || input === 'bold') {
                return input;
            }
            return String(EditorIntOption.clampedInt(input, exports.EDITOR_FONT_DEFAULTS.fontWeight, EditorFontWeight.MINIMUM_VALUE, EditorFontWeight.MAXIMUM_VALUE));
        }
    }
    EditorFontWeight.SUGGESTION_VALUES = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    EditorFontWeight.MINIMUM_VALUE = 1;
    EditorFontWeight.MAXIMUM_VALUE = 1000;
    class EditorGoToLocation extends BaseEditorOption {
        constructor() {
            const defaults = {
                multiple: 'peek',
                multipleDefinitions: 'peek',
                multipleTypeDefinitions: 'peek',
                multipleDeclarations: 'peek',
                multipleImplementations: 'peek',
                multipleReferences: 'peek',
                alternativeDefinitionCommand: 'editor.action.goToReferences',
                alternativeTypeDefinitionCommand: 'editor.action.goToReferences',
                alternativeDeclarationCommand: 'editor.action.goToReferences',
                alternativeImplementationCommand: '',
                alternativeReferenceCommand: '',
            };
            const jsonSubset = {
                type: 'string',
                enum: ['peek', 'gotoAndPeek', 'goto'],
                default: defaults.multiple,
                enumDescriptions: [
                    nls.localize(22, null),
                    nls.localize(23, null),
                    nls.localize(24, null)
                ]
            };
            const alternativeCommandOptions = ['', 'editor.action.referenceSearch.trigger', 'editor.action.goToReferences', 'editor.action.peekImplementation', 'editor.action.goToImplementation', 'editor.action.peekTypeDefinition', 'editor.action.goToTypeDefinition', 'editor.action.peekDeclaration', 'editor.action.revealDeclaration', 'editor.action.peekDefinition', 'editor.action.revealDefinitionAside', 'editor.action.revealDefinition'];
            super(47 /* gotoLocation */, 'gotoLocation', defaults, {
                'editor.gotoLocation.multiple': {
                    deprecationMessage: nls.localize(25, null),
                },
                'editor.gotoLocation.multipleDefinitions': Object.assign({ description: nls.localize(26, null) }, jsonSubset),
                'editor.gotoLocation.multipleTypeDefinitions': Object.assign({ description: nls.localize(27, null) }, jsonSubset),
                'editor.gotoLocation.multipleDeclarations': Object.assign({ description: nls.localize(28, null) }, jsonSubset),
                'editor.gotoLocation.multipleImplementations': Object.assign({ description: nls.localize(29, null) }, jsonSubset),
                'editor.gotoLocation.multipleReferences': Object.assign({ description: nls.localize(30, null) }, jsonSubset),
                'editor.gotoLocation.alternativeDefinitionCommand': {
                    type: 'string',
                    default: defaults.alternativeDefinitionCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize(31, null)
                },
                'editor.gotoLocation.alternativeTypeDefinitionCommand': {
                    type: 'string',
                    default: defaults.alternativeTypeDefinitionCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize(32, null)
                },
                'editor.gotoLocation.alternativeDeclarationCommand': {
                    type: 'string',
                    default: defaults.alternativeDeclarationCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize(33, null)
                },
                'editor.gotoLocation.alternativeImplementationCommand': {
                    type: 'string',
                    default: defaults.alternativeImplementationCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize(34, null)
                },
                'editor.gotoLocation.alternativeReferenceCommand': {
                    type: 'string',
                    default: defaults.alternativeReferenceCommand,
                    enum: alternativeCommandOptions,
                    description: nls.localize(35, null)
                },
            });
        }
        validate(_input) {
            var _a, _b, _c, _d, _e;
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                multiple: stringSet(input.multiple, this.defaultValue.multiple, ['peek', 'gotoAndPeek', 'goto']),
                multipleDefinitions: (_a = input.multipleDefinitions) !== null && _a !== void 0 ? _a : stringSet(input.multipleDefinitions, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                multipleTypeDefinitions: (_b = input.multipleTypeDefinitions) !== null && _b !== void 0 ? _b : stringSet(input.multipleTypeDefinitions, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                multipleDeclarations: (_c = input.multipleDeclarations) !== null && _c !== void 0 ? _c : stringSet(input.multipleDeclarations, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                multipleImplementations: (_d = input.multipleImplementations) !== null && _d !== void 0 ? _d : stringSet(input.multipleImplementations, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                multipleReferences: (_e = input.multipleReferences) !== null && _e !== void 0 ? _e : stringSet(input.multipleReferences, 'peek', ['peek', 'gotoAndPeek', 'goto']),
                alternativeDefinitionCommand: EditorStringOption.string(input.alternativeDefinitionCommand, this.defaultValue.alternativeDefinitionCommand),
                alternativeTypeDefinitionCommand: EditorStringOption.string(input.alternativeTypeDefinitionCommand, this.defaultValue.alternativeTypeDefinitionCommand),
                alternativeDeclarationCommand: EditorStringOption.string(input.alternativeDeclarationCommand, this.defaultValue.alternativeDeclarationCommand),
                alternativeImplementationCommand: EditorStringOption.string(input.alternativeImplementationCommand, this.defaultValue.alternativeImplementationCommand),
                alternativeReferenceCommand: EditorStringOption.string(input.alternativeReferenceCommand, this.defaultValue.alternativeReferenceCommand),
            };
        }
    }
    class EditorHover extends BaseEditorOption {
        constructor() {
            const defaults = {
                enabled: true,
                delay: 300,
                sticky: true
            };
            super(50 /* hover */, 'hover', defaults, {
                'editor.hover.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize(36, null)
                },
                'editor.hover.delay': {
                    type: 'number',
                    default: defaults.delay,
                    description: nls.localize(37, null)
                },
                'editor.hover.sticky': {
                    type: 'boolean',
                    default: defaults.sticky,
                    description: nls.localize(38, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                delay: EditorIntOption.clampedInt(input.delay, this.defaultValue.delay, 0, 10000),
                sticky: boolean(input.sticky, this.defaultValue.sticky)
            };
        }
    }
    var RenderMinimap;
    (function (RenderMinimap) {
        RenderMinimap[RenderMinimap["None"] = 0] = "None";
        RenderMinimap[RenderMinimap["Text"] = 1] = "Text";
        RenderMinimap[RenderMinimap["Blocks"] = 2] = "Blocks";
    })(RenderMinimap = exports.RenderMinimap || (exports.RenderMinimap = {}));
    /**
     * @internal
     */
    class EditorLayoutInfoComputer extends ComputedEditorOption {
        constructor() {
            super(126 /* layoutInfo */, [
                46 /* glyphMargin */, 54 /* lineDecorationsWidth */, 35 /* folding */,
                61 /* minimap */, 89 /* scrollbar */, 56 /* lineNumbers */,
                57 /* lineNumbersMinChars */, 91 /* scrollBeyondLastLine */,
                113 /* wordWrap */, 116 /* wordWrapColumn */, 117 /* wordWrapOverride1 */, 118 /* wordWrapOverride2 */,
                2 /* accessibilitySupport */
            ]);
        }
        compute(env, options, _) {
            return EditorLayoutInfoComputer.computeLayout(options, {
                memory: env.memory,
                outerWidth: env.outerWidth,
                outerHeight: env.outerHeight,
                isDominatedByLongLines: env.isDominatedByLongLines,
                lineHeight: env.fontInfo.lineHeight,
                viewLineCount: env.viewLineCount,
                lineNumbersDigitCount: env.lineNumbersDigitCount,
                typicalHalfwidthCharacterWidth: env.fontInfo.typicalHalfwidthCharacterWidth,
                maxDigitWidth: env.fontInfo.maxDigitWidth,
                pixelRatio: env.pixelRatio
            });
        }
        static computeContainedMinimapLineCount(input) {
            const typicalViewportLineCount = input.height / input.lineHeight;
            const extraLinesBeyondLastLine = input.scrollBeyondLastLine ? (typicalViewportLineCount - 1) : 0;
            const desiredRatio = (input.viewLineCount + extraLinesBeyondLastLine) / (input.pixelRatio * input.height);
            const minimapLineCount = Math.floor(input.viewLineCount / desiredRatio);
            return { typicalViewportLineCount, extraLinesBeyondLastLine, desiredRatio, minimapLineCount };
        }
        static _computeMinimapLayout(input, memory) {
            const outerWidth = input.outerWidth;
            const outerHeight = input.outerHeight;
            const pixelRatio = input.pixelRatio;
            if (!input.minimap.enabled) {
                return {
                    renderMinimap: 0 /* None */,
                    minimapLeft: 0,
                    minimapWidth: 0,
                    minimapHeightIsEditorHeight: false,
                    minimapIsSampling: false,
                    minimapScale: 1,
                    minimapLineHeight: 1,
                    minimapCanvasInnerWidth: 0,
                    minimapCanvasInnerHeight: Math.floor(pixelRatio * outerHeight),
                    minimapCanvasOuterWidth: 0,
                    minimapCanvasOuterHeight: outerHeight,
                };
            }
            // Can use memory if only the `viewLineCount` and `remainingWidth` have changed
            const stableMinimapLayoutInput = memory.stableMinimapLayoutInput;
            const couldUseMemory = (stableMinimapLayoutInput
                // && input.outerWidth === lastMinimapLayoutInput.outerWidth !!! INTENTIONAL OMITTED
                && input.outerHeight === stableMinimapLayoutInput.outerHeight
                && input.lineHeight === stableMinimapLayoutInput.lineHeight
                && input.typicalHalfwidthCharacterWidth === stableMinimapLayoutInput.typicalHalfwidthCharacterWidth
                && input.pixelRatio === stableMinimapLayoutInput.pixelRatio
                && input.scrollBeyondLastLine === stableMinimapLayoutInput.scrollBeyondLastLine
                && input.minimap.enabled === stableMinimapLayoutInput.minimap.enabled
                && input.minimap.side === stableMinimapLayoutInput.minimap.side
                && input.minimap.size === stableMinimapLayoutInput.minimap.size
                && input.minimap.showSlider === stableMinimapLayoutInput.minimap.showSlider
                && input.minimap.renderCharacters === stableMinimapLayoutInput.minimap.renderCharacters
                && input.minimap.maxColumn === stableMinimapLayoutInput.minimap.maxColumn
                && input.minimap.scale === stableMinimapLayoutInput.minimap.scale
                && input.verticalScrollbarWidth === stableMinimapLayoutInput.verticalScrollbarWidth
                // && input.viewLineCount === lastMinimapLayoutInput.viewLineCount !!! INTENTIONAL OMITTED
                // && input.remainingWidth === lastMinimapLayoutInput.remainingWidth !!! INTENTIONAL OMITTED
                && input.isViewportWrapping === stableMinimapLayoutInput.isViewportWrapping);
            const lineHeight = input.lineHeight;
            const typicalHalfwidthCharacterWidth = input.typicalHalfwidthCharacterWidth;
            const scrollBeyondLastLine = input.scrollBeyondLastLine;
            const minimapRenderCharacters = input.minimap.renderCharacters;
            let minimapScale = (pixelRatio >= 2 ? Math.round(input.minimap.scale * 2) : input.minimap.scale);
            const minimapMaxColumn = input.minimap.maxColumn;
            const minimapSize = input.minimap.size;
            const minimapSide = input.minimap.side;
            const verticalScrollbarWidth = input.verticalScrollbarWidth;
            const viewLineCount = input.viewLineCount;
            const remainingWidth = input.remainingWidth;
            const isViewportWrapping = input.isViewportWrapping;
            const baseCharHeight = minimapRenderCharacters ? 2 : 3;
            let minimapCanvasInnerHeight = Math.floor(pixelRatio * outerHeight);
            const minimapCanvasOuterHeight = minimapCanvasInnerHeight / pixelRatio;
            let minimapHeightIsEditorHeight = false;
            let minimapIsSampling = false;
            let minimapLineHeight = baseCharHeight * minimapScale;
            let minimapCharWidth = minimapScale / pixelRatio;
            let minimapWidthMultiplier = 1;
            if (minimapSize === 'fill' || minimapSize === 'fit') {
                const { typicalViewportLineCount, extraLinesBeyondLastLine, desiredRatio, minimapLineCount } = EditorLayoutInfoComputer.computeContainedMinimapLineCount({
                    viewLineCount: viewLineCount,
                    scrollBeyondLastLine: scrollBeyondLastLine,
                    height: outerHeight,
                    lineHeight: lineHeight,
                    pixelRatio: pixelRatio
                });
                // ratio is intentionally not part of the layout to avoid the layout changing all the time
                // when doing sampling
                const ratio = viewLineCount / minimapLineCount;
                if (ratio > 1) {
                    minimapHeightIsEditorHeight = true;
                    minimapIsSampling = true;
                    minimapScale = 1;
                    minimapLineHeight = 1;
                    minimapCharWidth = minimapScale / pixelRatio;
                }
                else {
                    let fitBecomesFill = false;
                    let maxMinimapScale = minimapScale + 1;
                    if (minimapSize === 'fit') {
                        const effectiveMinimapHeight = Math.ceil((viewLineCount + extraLinesBeyondLastLine) * minimapLineHeight);
                        if (isViewportWrapping && couldUseMemory && remainingWidth <= memory.stableFitRemainingWidth) {
                            // There is a loop when using `fit` and viewport wrapping:
                            // - view line count impacts minimap layout
                            // - minimap layout impacts viewport width
                            // - viewport width impacts view line count
                            // To break the loop, once we go to a smaller minimap scale, we try to stick with it.
                            fitBecomesFill = true;
                            maxMinimapScale = memory.stableFitMaxMinimapScale;
                        }
                        else {
                            fitBecomesFill = (effectiveMinimapHeight > minimapCanvasInnerHeight);
                            if (isViewportWrapping && fitBecomesFill) {
                                // remember for next time
                                memory.stableMinimapLayoutInput = input;
                                memory.stableFitRemainingWidth = remainingWidth;
                            }
                            else {
                                memory.stableMinimapLayoutInput = null;
                                memory.stableFitRemainingWidth = 0;
                            }
                        }
                    }
                    if (minimapSize === 'fill' || fitBecomesFill) {
                        minimapHeightIsEditorHeight = true;
                        const configuredMinimapScale = minimapScale;
                        minimapLineHeight = Math.min(lineHeight * pixelRatio, Math.max(1, Math.floor(1 / desiredRatio)));
                        minimapScale = Math.min(maxMinimapScale, Math.max(1, Math.floor(minimapLineHeight / baseCharHeight)));
                        if (minimapScale > configuredMinimapScale) {
                            minimapWidthMultiplier = Math.min(2, minimapScale / configuredMinimapScale);
                        }
                        minimapCharWidth = minimapScale / pixelRatio / minimapWidthMultiplier;
                        minimapCanvasInnerHeight = Math.ceil((Math.max(typicalViewportLineCount, viewLineCount + extraLinesBeyondLastLine)) * minimapLineHeight);
                        if (isViewportWrapping && fitBecomesFill) {
                            memory.stableFitMaxMinimapScale = minimapScale;
                        }
                    }
                }
            }
            // Given:
            // (leaving 2px for the cursor to have space after the last character)
            // viewportColumn = (contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth
            // minimapWidth = viewportColumn * minimapCharWidth
            // contentWidth = remainingWidth - minimapWidth
            // What are good values for contentWidth and minimapWidth ?
            // minimapWidth = ((contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth) * minimapCharWidth
            // typicalHalfwidthCharacterWidth * minimapWidth = (contentWidth - verticalScrollbarWidth - 2) * minimapCharWidth
            // typicalHalfwidthCharacterWidth * minimapWidth = (remainingWidth - minimapWidth - verticalScrollbarWidth - 2) * minimapCharWidth
            // (typicalHalfwidthCharacterWidth + minimapCharWidth) * minimapWidth = (remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth
            // minimapWidth = ((remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth) / (typicalHalfwidthCharacterWidth + minimapCharWidth)
            const minimapMaxWidth = Math.floor(minimapMaxColumn * minimapCharWidth);
            const minimapWidth = Math.min(minimapMaxWidth, Math.max(0, Math.floor(((remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth) / (typicalHalfwidthCharacterWidth + minimapCharWidth))) + exports.MINIMAP_GUTTER_WIDTH);
            let minimapCanvasInnerWidth = Math.floor(pixelRatio * minimapWidth);
            const minimapCanvasOuterWidth = minimapCanvasInnerWidth / pixelRatio;
            minimapCanvasInnerWidth = Math.floor(minimapCanvasInnerWidth * minimapWidthMultiplier);
            const renderMinimap = (minimapRenderCharacters ? 1 /* Text */ : 2 /* Blocks */);
            const minimapLeft = (minimapSide === 'left' ? 0 : (outerWidth - minimapWidth - verticalScrollbarWidth));
            return {
                renderMinimap,
                minimapLeft,
                minimapWidth,
                minimapHeightIsEditorHeight,
                minimapIsSampling,
                minimapScale,
                minimapLineHeight,
                minimapCanvasInnerWidth,
                minimapCanvasInnerHeight,
                minimapCanvasOuterWidth,
                minimapCanvasOuterHeight,
            };
        }
        static computeLayout(options, env) {
            const outerWidth = env.outerWidth | 0;
            const outerHeight = env.outerHeight | 0;
            const lineHeight = env.lineHeight | 0;
            const lineNumbersDigitCount = env.lineNumbersDigitCount | 0;
            const typicalHalfwidthCharacterWidth = env.typicalHalfwidthCharacterWidth;
            const maxDigitWidth = env.maxDigitWidth;
            const pixelRatio = env.pixelRatio;
            const viewLineCount = env.viewLineCount;
            const wordWrapOverride2 = options.get(118 /* wordWrapOverride2 */);
            const wordWrapOverride1 = (wordWrapOverride2 === 'inherit' ? options.get(117 /* wordWrapOverride1 */) : wordWrapOverride2);
            const wordWrap = (wordWrapOverride1 === 'inherit' ? options.get(113 /* wordWrap */) : wordWrapOverride1);
            const wordWrapColumn = options.get(116 /* wordWrapColumn */);
            const accessibilitySupport = options.get(2 /* accessibilitySupport */);
            const isDominatedByLongLines = env.isDominatedByLongLines;
            const showGlyphMargin = options.get(46 /* glyphMargin */);
            const showLineNumbers = (options.get(56 /* lineNumbers */).renderType !== 0 /* Off */);
            const lineNumbersMinChars = options.get(57 /* lineNumbersMinChars */);
            const scrollBeyondLastLine = options.get(91 /* scrollBeyondLastLine */);
            const minimap = options.get(61 /* minimap */);
            const scrollbar = options.get(89 /* scrollbar */);
            const verticalScrollbarWidth = scrollbar.verticalScrollbarSize;
            const verticalScrollbarHasArrows = scrollbar.verticalHasArrows;
            const scrollbarArrowSize = scrollbar.arrowSize;
            const horizontalScrollbarHeight = scrollbar.horizontalScrollbarSize;
            const rawLineDecorationsWidth = options.get(54 /* lineDecorationsWidth */);
            const folding = options.get(35 /* folding */);
            let lineDecorationsWidth;
            if (typeof rawLineDecorationsWidth === 'string' && /^\d+(\.\d+)?ch$/.test(rawLineDecorationsWidth)) {
                const multiple = parseFloat(rawLineDecorationsWidth.substr(0, rawLineDecorationsWidth.length - 2));
                lineDecorationsWidth = EditorIntOption.clampedInt(multiple * typicalHalfwidthCharacterWidth, 0, 0, 1000);
            }
            else {
                lineDecorationsWidth = EditorIntOption.clampedInt(rawLineDecorationsWidth, 0, 0, 1000);
            }
            if (folding) {
                lineDecorationsWidth += 16;
            }
            let lineNumbersWidth = 0;
            if (showLineNumbers) {
                const digitCount = Math.max(lineNumbersDigitCount, lineNumbersMinChars);
                lineNumbersWidth = Math.round(digitCount * maxDigitWidth);
            }
            let glyphMarginWidth = 0;
            if (showGlyphMargin) {
                glyphMarginWidth = lineHeight;
            }
            let glyphMarginLeft = 0;
            let lineNumbersLeft = glyphMarginLeft + glyphMarginWidth;
            let decorationsLeft = lineNumbersLeft + lineNumbersWidth;
            let contentLeft = decorationsLeft + lineDecorationsWidth;
            const remainingWidth = outerWidth - glyphMarginWidth - lineNumbersWidth - lineDecorationsWidth;
            let isWordWrapMinified = false;
            let isViewportWrapping = false;
            let wrappingColumn = -1;
            if (accessibilitySupport !== 2 /* Enabled */) {
                // See https://github.com/microsoft/vscode/issues/27766
                // Never enable wrapping when a screen reader is attached
                // because arrow down etc. will not move the cursor in the way
                // a screen reader expects.
                if (wordWrapOverride1 === 'inherit' && isDominatedByLongLines) {
                    // Force viewport width wrapping if model is dominated by long lines
                    isWordWrapMinified = true;
                    isViewportWrapping = true;
                }
                else if (wordWrap === 'on' || wordWrap === 'bounded') {
                    isViewportWrapping = true;
                }
                else if (wordWrap === 'wordWrapColumn') {
                    wrappingColumn = wordWrapColumn;
                }
            }
            const minimapLayout = EditorLayoutInfoComputer._computeMinimapLayout({
                outerWidth: outerWidth,
                outerHeight: outerHeight,
                lineHeight: lineHeight,
                typicalHalfwidthCharacterWidth: typicalHalfwidthCharacterWidth,
                pixelRatio: pixelRatio,
                scrollBeyondLastLine: scrollBeyondLastLine,
                minimap: minimap,
                verticalScrollbarWidth: verticalScrollbarWidth,
                viewLineCount: viewLineCount,
                remainingWidth: remainingWidth,
                isViewportWrapping: isViewportWrapping,
            }, env.memory || new ComputeOptionsMemory());
            if (minimapLayout.renderMinimap !== 0 /* None */ && minimapLayout.minimapLeft === 0) {
                // the minimap is rendered to the left, so move everything to the right
                glyphMarginLeft += minimapLayout.minimapWidth;
                lineNumbersLeft += minimapLayout.minimapWidth;
                decorationsLeft += minimapLayout.minimapWidth;
                contentLeft += minimapLayout.minimapWidth;
            }
            const contentWidth = remainingWidth - minimapLayout.minimapWidth;
            // (leaving 2px for the cursor to have space after the last character)
            const viewportColumn = Math.max(1, Math.floor((contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth));
            const verticalArrowSize = (verticalScrollbarHasArrows ? scrollbarArrowSize : 0);
            if (isViewportWrapping) {
                // compute the actual wrappingColumn
                wrappingColumn = Math.max(1, viewportColumn);
                if (wordWrap === 'bounded') {
                    wrappingColumn = Math.min(wrappingColumn, wordWrapColumn);
                }
            }
            return {
                width: outerWidth,
                height: outerHeight,
                glyphMarginLeft: glyphMarginLeft,
                glyphMarginWidth: glyphMarginWidth,
                lineNumbersLeft: lineNumbersLeft,
                lineNumbersWidth: lineNumbersWidth,
                decorationsLeft: decorationsLeft,
                decorationsWidth: lineDecorationsWidth,
                contentLeft: contentLeft,
                contentWidth: contentWidth,
                minimap: minimapLayout,
                viewportColumn: viewportColumn,
                isWordWrapMinified: isWordWrapMinified,
                isViewportWrapping: isViewportWrapping,
                wrappingColumn: wrappingColumn,
                verticalScrollbarWidth: verticalScrollbarWidth,
                horizontalScrollbarHeight: horizontalScrollbarHeight,
                overviewRuler: {
                    top: verticalArrowSize,
                    width: verticalScrollbarWidth,
                    height: (outerHeight - 2 * verticalArrowSize),
                    right: 0
                }
            };
        }
    }
    exports.EditorLayoutInfoComputer = EditorLayoutInfoComputer;
    class EditorLightbulb extends BaseEditorOption {
        constructor() {
            const defaults = { enabled: true };
            super(53 /* lightbulb */, 'lightbulb', defaults, {
                'editor.lightbulb.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize(39, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled)
            };
        }
    }
    class EditorInlineHints extends BaseEditorOption {
        constructor() {
            const defaults = { enabled: true, fontSize: 0, fontFamily: exports.EDITOR_FONT_DEFAULTS.fontFamily };
            super(122 /* inlineHints */, 'inlineHints', defaults, {
                'editor.inlineHints.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize(40, null)
                },
                'editor.inlineHints.fontSize': {
                    type: 'number',
                    default: defaults.fontSize,
                    description: nls.localize(41, null)
                },
                'editor.inlineHints.fontFamily': {
                    type: 'string',
                    default: defaults.fontFamily,
                    description: nls.localize(42, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                fontSize: EditorIntOption.clampedInt(input.fontSize, this.defaultValue.fontSize, 0, 100),
                fontFamily: EditorStringOption.string(input.fontFamily, this.defaultValue.fontFamily)
            };
        }
    }
    //#endregion
    //#region lineHeight
    class EditorLineHeight extends EditorIntOption {
        constructor() {
            super(55 /* lineHeight */, 'lineHeight', exports.EDITOR_FONT_DEFAULTS.lineHeight, 0, 150, { description: nls.localize(43, null) });
        }
        compute(env, options, value) {
            // The lineHeight is computed from the fontSize if it is 0.
            // Moreover, the final lineHeight respects the editor zoom level.
            // So take the result from env.fontInfo
            return env.fontInfo.lineHeight;
        }
    }
    class EditorMinimap extends BaseEditorOption {
        constructor() {
            const defaults = {
                enabled: true,
                size: 'proportional',
                side: 'right',
                showSlider: 'mouseover',
                renderCharacters: true,
                maxColumn: 120,
                scale: 1,
            };
            super(61 /* minimap */, 'minimap', defaults, {
                'editor.minimap.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize(44, null)
                },
                'editor.minimap.size': {
                    type: 'string',
                    enum: ['proportional', 'fill', 'fit'],
                    enumDescriptions: [
                        nls.localize(45, null),
                        nls.localize(46, null),
                        nls.localize(47, null),
                    ],
                    default: defaults.size,
                    description: nls.localize(48, null)
                },
                'editor.minimap.side': {
                    type: 'string',
                    enum: ['left', 'right'],
                    default: defaults.side,
                    description: nls.localize(49, null)
                },
                'editor.minimap.showSlider': {
                    type: 'string',
                    enum: ['always', 'mouseover'],
                    default: defaults.showSlider,
                    description: nls.localize(50, null)
                },
                'editor.minimap.scale': {
                    type: 'number',
                    default: defaults.scale,
                    minimum: 1,
                    maximum: 3,
                    enum: [1, 2, 3],
                    description: nls.localize(51, null)
                },
                'editor.minimap.renderCharacters': {
                    type: 'boolean',
                    default: defaults.renderCharacters,
                    description: nls.localize(52, null)
                },
                'editor.minimap.maxColumn': {
                    type: 'number',
                    default: defaults.maxColumn,
                    description: nls.localize(53, null)
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                size: stringSet(input.size, this.defaultValue.size, ['proportional', 'fill', 'fit']),
                side: stringSet(input.side, this.defaultValue.side, ['right', 'left']),
                showSlider: stringSet(input.showSlider, this.defaultValue.showSlider, ['always', 'mouseover']),
                renderCharacters: boolean(input.renderCharacters, this.defaultValue.renderCharacters),
                scale: EditorIntOption.clampedInt(input.scale, 1, 1, 3),
                maxColumn: EditorIntOption.clampedInt(input.maxColumn, this.defaultValue.maxColumn, 1, 10000),
            };
        }
    }
    //#endregion
    //#region multiCursorModifier
    function _multiCursorModifierFromString(multiCursorModifier) {
        if (multiCursorModifier === 'ctrlCmd') {
            return (platform.isMacintosh ? 'metaKey' : 'ctrlKey');
        }
        return 'altKey';
    }
    class EditorPadding extends BaseEditorOption {
        constructor() {
            super(71 /* padding */, 'padding', { top: 0, bottom: 0 }, {
                'editor.padding.top': {
                    type: 'number',
                    default: 0,
                    minimum: 0,
                    maximum: 1000,
                    description: nls.localize(54, null)
                },
                'editor.padding.bottom': {
                    type: 'number',
                    default: 0,
                    minimum: 0,
                    maximum: 1000,
                    description: nls.localize(55, null)
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                top: EditorIntOption.clampedInt(input.top, 0, 0, 1000),
                bottom: EditorIntOption.clampedInt(input.bottom, 0, 0, 1000)
            };
        }
    }
    class EditorParameterHints extends BaseEditorOption {
        constructor() {
            const defaults = {
                enabled: true,
                cycle: false
            };
            super(72 /* parameterHints */, 'parameterHints', defaults, {
                'editor.parameterHints.enabled': {
                    type: 'boolean',
                    default: defaults.enabled,
                    description: nls.localize(56, null)
                },
                'editor.parameterHints.cycle': {
                    type: 'boolean',
                    default: defaults.cycle,
                    description: nls.localize(57, null)
                },
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                enabled: boolean(input.enabled, this.defaultValue.enabled),
                cycle: boolean(input.cycle, this.defaultValue.cycle)
            };
        }
    }
    //#endregion
    //#region pixelRatio
    class EditorPixelRatio extends ComputedEditorOption {
        constructor() {
            super(124 /* pixelRatio */);
        }
        compute(env, options, _) {
            return env.pixelRatio;
        }
    }
    class EditorQuickSuggestions extends BaseEditorOption {
        constructor() {
            const defaults = {
                other: true,
                comments: false,
                strings: false
            };
            super(75 /* quickSuggestions */, 'quickSuggestions', defaults, {
                anyOf: [
                    {
                        type: 'boolean',
                    },
                    {
                        type: 'object',
                        properties: {
                            strings: {
                                type: 'boolean',
                                default: defaults.strings,
                                description: nls.localize(58, null)
                            },
                            comments: {
                                type: 'boolean',
                                default: defaults.comments,
                                description: nls.localize(59, null)
                            },
                            other: {
                                type: 'boolean',
                                default: defaults.other,
                                description: nls.localize(60, null)
                            },
                        }
                    }
                ],
                default: defaults,
                description: nls.localize(61, null)
            });
            this.defaultValue = defaults;
        }
        validate(_input) {
            if (typeof _input === 'boolean') {
                return _input;
            }
            if (_input && typeof _input === 'object') {
                const input = _input;
                const opts = {
                    other: boolean(input.other, this.defaultValue.other),
                    comments: boolean(input.comments, this.defaultValue.comments),
                    strings: boolean(input.strings, this.defaultValue.strings),
                };
                if (opts.other && opts.comments && opts.strings) {
                    return true; // all on
                }
                else if (!opts.other && !opts.comments && !opts.strings) {
                    return false; // all off
                }
                else {
                    return opts;
                }
            }
            return this.defaultValue;
        }
    }
    var RenderLineNumbersType;
    (function (RenderLineNumbersType) {
        RenderLineNumbersType[RenderLineNumbersType["Off"] = 0] = "Off";
        RenderLineNumbersType[RenderLineNumbersType["On"] = 1] = "On";
        RenderLineNumbersType[RenderLineNumbersType["Relative"] = 2] = "Relative";
        RenderLineNumbersType[RenderLineNumbersType["Interval"] = 3] = "Interval";
        RenderLineNumbersType[RenderLineNumbersType["Custom"] = 4] = "Custom";
    })(RenderLineNumbersType = exports.RenderLineNumbersType || (exports.RenderLineNumbersType = {}));
    class EditorRenderLineNumbersOption extends BaseEditorOption {
        constructor() {
            super(56 /* lineNumbers */, 'lineNumbers', { renderType: 1 /* On */, renderFn: null }, {
                type: 'string',
                enum: ['off', 'on', 'relative', 'interval'],
                enumDescriptions: [
                    nls.localize(62, null),
                    nls.localize(63, null),
                    nls.localize(64, null),
                    nls.localize(65, null)
                ],
                default: 'on',
                description: nls.localize(66, null)
            });
        }
        validate(lineNumbers) {
            let renderType = this.defaultValue.renderType;
            let renderFn = this.defaultValue.renderFn;
            if (typeof lineNumbers !== 'undefined') {
                if (typeof lineNumbers === 'function') {
                    renderType = 4 /* Custom */;
                    renderFn = lineNumbers;
                }
                else if (lineNumbers === 'interval') {
                    renderType = 3 /* Interval */;
                }
                else if (lineNumbers === 'relative') {
                    renderType = 2 /* Relative */;
                }
                else if (lineNumbers === 'on') {
                    renderType = 1 /* On */;
                }
                else {
                    renderType = 0 /* Off */;
                }
            }
            return {
                renderType,
                renderFn
            };
        }
    }
    //#endregion
    //#region renderValidationDecorations
    /**
     * @internal
     */
    function filterValidationDecorations(options) {
        const renderValidationDecorations = options.get(84 /* renderValidationDecorations */);
        if (renderValidationDecorations === 'editable') {
            return options.get(77 /* readOnly */);
        }
        return renderValidationDecorations === 'on' ? false : true;
    }
    exports.filterValidationDecorations = filterValidationDecorations;
    class EditorRulers extends BaseEditorOption {
        constructor() {
            const defaults = [];
            const columnSchema = { type: 'number', description: nls.localize(67, null) };
            super(88 /* rulers */, 'rulers', defaults, {
                type: 'array',
                items: {
                    anyOf: [
                        columnSchema,
                        {
                            type: [
                                'object'
                            ],
                            properties: {
                                column: columnSchema,
                                color: {
                                    type: 'string',
                                    description: nls.localize(68, null),
                                    format: 'color-hex'
                                }
                            }
                        }
                    ]
                },
                default: defaults,
                description: nls.localize(69, null)
            });
        }
        validate(input) {
            if (Array.isArray(input)) {
                let rulers = [];
                for (let _element of input) {
                    if (typeof _element === 'number') {
                        rulers.push({
                            column: EditorIntOption.clampedInt(_element, 0, 0, 10000),
                            color: null
                        });
                    }
                    else if (_element && typeof _element === 'object') {
                        const element = _element;
                        rulers.push({
                            column: EditorIntOption.clampedInt(element.column, 0, 0, 10000),
                            color: element.color
                        });
                    }
                }
                rulers.sort((a, b) => a.column - b.column);
                return rulers;
            }
            return this.defaultValue;
        }
    }
    function _scrollbarVisibilityFromString(visibility, defaultValue) {
        if (typeof visibility !== 'string') {
            return defaultValue;
        }
        switch (visibility) {
            case 'hidden': return 2 /* Hidden */;
            case 'visible': return 3 /* Visible */;
            default: return 1 /* Auto */;
        }
    }
    class EditorScrollbar extends BaseEditorOption {
        constructor() {
            super(89 /* scrollbar */, 'scrollbar', {
                vertical: 1 /* Auto */,
                horizontal: 1 /* Auto */,
                arrowSize: 11,
                useShadows: true,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                horizontalScrollbarSize: 12,
                horizontalSliderSize: 12,
                verticalScrollbarSize: 14,
                verticalSliderSize: 14,
                handleMouseWheel: true,
                alwaysConsumeMouseWheel: true,
                scrollByPage: false
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            const horizontalScrollbarSize = EditorIntOption.clampedInt(input.horizontalScrollbarSize, this.defaultValue.horizontalScrollbarSize, 0, 1000);
            const verticalScrollbarSize = EditorIntOption.clampedInt(input.verticalScrollbarSize, this.defaultValue.verticalScrollbarSize, 0, 1000);
            return {
                arrowSize: EditorIntOption.clampedInt(input.arrowSize, this.defaultValue.arrowSize, 0, 1000),
                vertical: _scrollbarVisibilityFromString(input.vertical, this.defaultValue.vertical),
                horizontal: _scrollbarVisibilityFromString(input.horizontal, this.defaultValue.horizontal),
                useShadows: boolean(input.useShadows, this.defaultValue.useShadows),
                verticalHasArrows: boolean(input.verticalHasArrows, this.defaultValue.verticalHasArrows),
                horizontalHasArrows: boolean(input.horizontalHasArrows, this.defaultValue.horizontalHasArrows),
                handleMouseWheel: boolean(input.handleMouseWheel, this.defaultValue.handleMouseWheel),
                alwaysConsumeMouseWheel: boolean(input.alwaysConsumeMouseWheel, this.defaultValue.alwaysConsumeMouseWheel),
                horizontalScrollbarSize: horizontalScrollbarSize,
                horizontalSliderSize: EditorIntOption.clampedInt(input.horizontalSliderSize, horizontalScrollbarSize, 0, 1000),
                verticalScrollbarSize: verticalScrollbarSize,
                verticalSliderSize: EditorIntOption.clampedInt(input.verticalSliderSize, verticalScrollbarSize, 0, 1000),
                scrollByPage: boolean(input.scrollByPage, this.defaultValue.scrollByPage),
            };
        }
    }
    class EditorSuggest extends BaseEditorOption {
        constructor() {
            const defaults = {
                insertMode: 'insert',
                filterGraceful: true,
                snippetsPreventQuickSuggestions: true,
                localityBonus: false,
                shareSuggestSelections: false,
                showIcons: true,
                showStatusBar: false,
                showInlineDetails: true,
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showInterfaces: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showKeywords: true,
                showWords: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true,
                showSnippets: true,
                showUsers: true,
                showIssues: true,
            };
            super(103 /* suggest */, 'suggest', defaults, {
                'editor.suggest.insertMode': {
                    type: 'string',
                    enum: ['insert', 'replace'],
                    enumDescriptions: [
                        nls.localize(70, null),
                        nls.localize(71, null),
                    ],
                    default: defaults.insertMode,
                    description: nls.localize(72, null)
                },
                'editor.suggest.filterGraceful': {
                    type: 'boolean',
                    default: defaults.filterGraceful,
                    description: nls.localize(73, null)
                },
                'editor.suggest.localityBonus': {
                    type: 'boolean',
                    default: defaults.localityBonus,
                    description: nls.localize(74, null)
                },
                'editor.suggest.shareSuggestSelections': {
                    type: 'boolean',
                    default: defaults.shareSuggestSelections,
                    markdownDescription: nls.localize(75, null)
                },
                'editor.suggest.snippetsPreventQuickSuggestions': {
                    type: 'boolean',
                    default: defaults.snippetsPreventQuickSuggestions,
                    description: nls.localize(76, null)
                },
                'editor.suggest.showIcons': {
                    type: 'boolean',
                    default: defaults.showIcons,
                    description: nls.localize(77, null)
                },
                'editor.suggest.showStatusBar': {
                    type: 'boolean',
                    default: defaults.showStatusBar,
                    description: nls.localize(78, null)
                },
                'editor.suggest.showInlineDetails': {
                    type: 'boolean',
                    default: defaults.showInlineDetails,
                    description: nls.localize(79, null)
                },
                'editor.suggest.maxVisibleSuggestions': {
                    type: 'number',
                    deprecationMessage: nls.localize(80, null),
                },
                'editor.suggest.filteredTypes': {
                    type: 'object',
                    deprecationMessage: nls.localize(81, null)
                },
                'editor.suggest.showMethods': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(82, null)
                },
                'editor.suggest.showFunctions': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(83, null)
                },
                'editor.suggest.showConstructors': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(84, null)
                },
                'editor.suggest.showFields': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(85, null)
                },
                'editor.suggest.showVariables': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(86, null)
                },
                'editor.suggest.showClasses': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(87, null)
                },
                'editor.suggest.showStructs': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(88, null)
                },
                'editor.suggest.showInterfaces': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(89, null)
                },
                'editor.suggest.showModules': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(90, null)
                },
                'editor.suggest.showProperties': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(91, null)
                },
                'editor.suggest.showEvents': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(92, null)
                },
                'editor.suggest.showOperators': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(93, null)
                },
                'editor.suggest.showUnits': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(94, null)
                },
                'editor.suggest.showValues': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(95, null)
                },
                'editor.suggest.showConstants': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(96, null)
                },
                'editor.suggest.showEnums': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(97, null)
                },
                'editor.suggest.showEnumMembers': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(98, null)
                },
                'editor.suggest.showKeywords': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(99, null)
                },
                'editor.suggest.showWords': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(100, null)
                },
                'editor.suggest.showColors': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(101, null)
                },
                'editor.suggest.showFiles': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(102, null)
                },
                'editor.suggest.showReferences': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(103, null)
                },
                'editor.suggest.showCustomcolors': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(104, null)
                },
                'editor.suggest.showFolders': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(105, null)
                },
                'editor.suggest.showTypeParameters': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(106, null)
                },
                'editor.suggest.showSnippets': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(107, null)
                },
                'editor.suggest.showUsers': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(108, null)
                },
                'editor.suggest.showIssues': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: nls.localize(109, null)
                }
            });
        }
        validate(_input) {
            if (!_input || typeof _input !== 'object') {
                return this.defaultValue;
            }
            const input = _input;
            return {
                insertMode: stringSet(input.insertMode, this.defaultValue.insertMode, ['insert', 'replace']),
                filterGraceful: boolean(input.filterGraceful, this.defaultValue.filterGraceful),
                snippetsPreventQuickSuggestions: boolean(input.snippetsPreventQuickSuggestions, this.defaultValue.filterGraceful),
                localityBonus: boolean(input.localityBonus, this.defaultValue.localityBonus),
                shareSuggestSelections: boolean(input.shareSuggestSelections, this.defaultValue.shareSuggestSelections),
                showIcons: boolean(input.showIcons, this.defaultValue.showIcons),
                showStatusBar: boolean(input.showStatusBar, this.defaultValue.showStatusBar),
                showInlineDetails: boolean(input.showInlineDetails, this.defaultValue.showInlineDetails),
                showMethods: boolean(input.showMethods, this.defaultValue.showMethods),
                showFunctions: boolean(input.showFunctions, this.defaultValue.showFunctions),
                showConstructors: boolean(input.showConstructors, this.defaultValue.showConstructors),
                showFields: boolean(input.showFields, this.defaultValue.showFields),
                showVariables: boolean(input.showVariables, this.defaultValue.showVariables),
                showClasses: boolean(input.showClasses, this.defaultValue.showClasses),
                showStructs: boolean(input.showStructs, this.defaultValue.showStructs),
                showInterfaces: boolean(input.showInterfaces, this.defaultValue.showInterfaces),
                showModules: boolean(input.showModules, this.defaultValue.showModules),
                showProperties: boolean(input.showProperties, this.defaultValue.showProperties),
                showEvents: boolean(input.showEvents, this.defaultValue.showEvents),
                showOperators: boolean(input.showOperators, this.defaultValue.showOperators),
                showUnits: boolean(input.showUnits, this.defaultValue.showUnits),
                showValues: boolean(input.showValues, this.defaultValue.showValues),
                showConstants: boolean(input.showConstants, this.defaultValue.showConstants),
                showEnums: boolean(input.showEnums, this.defaultValue.showEnums),
                showEnumMembers: boolean(input.showEnumMembers, this.defaultValue.showEnumMembers),
                showKeywords: boolean(input.showKeywords, this.defaultValue.showKeywords),
                showWords: boolean(input.showWords, this.defaultValue.showWords),
                showColors: boolean(input.showColors, this.defaultValue.showColors),
                showFiles: boolean(input.showFiles, this.defaultValue.showFiles),
                showReferences: boolean(input.showReferences, this.defaultValue.showReferences),
                showFolders: boolean(input.showFolders, this.defaultValue.showFolders),
                showTypeParameters: boolean(input.showTypeParameters, this.defaultValue.showTypeParameters),
                showSnippets: boolean(input.showSnippets, this.defaultValue.showSnippets),
                showUsers: boolean(input.showUsers, this.defaultValue.showUsers),
                showIssues: boolean(input.showIssues, this.defaultValue.showIssues),
            };
        }
    }
    class SmartSelect extends BaseEditorOption {
        constructor() {
            super(99 /* smartSelect */, 'smartSelect', {
                selectLeadingAndTrailingWhitespace: true
            }, {
                'editor.smartSelect.selectLeadingAndTrailingWhitespace': {
                    description: nls.localize(110, null),
                    default: true,
                    type: 'boolean'
                }
            });
        }
        validate(input) {
            if (!input || typeof input !== 'object') {
                return this.defaultValue;
            }
            return {
                selectLeadingAndTrailingWhitespace: boolean(input.selectLeadingAndTrailingWhitespace, this.defaultValue.selectLeadingAndTrailingWhitespace)
            };
        }
    }
    //#endregion
    //#region tabFocusMode
    class EditorTabFocusMode extends ComputedEditorOption {
        constructor() {
            super(125 /* tabFocusMode */, [77 /* readOnly */]);
        }
        compute(env, options, _) {
            const readOnly = options.get(77 /* readOnly */);
            return (readOnly ? true : env.tabFocusMode);
        }
    }
    //#endregion
    //#region wrappingIndent
    /**
     * Describes how to indent wrapped lines.
     */
    var WrappingIndent;
    (function (WrappingIndent) {
        /**
         * No indentation => wrapped lines begin at column 1.
         */
        WrappingIndent[WrappingIndent["None"] = 0] = "None";
        /**
         * Same => wrapped lines get the same indentation as the parent.
         */
        WrappingIndent[WrappingIndent["Same"] = 1] = "Same";
        /**
         * Indent => wrapped lines get +1 indentation toward the parent.
         */
        WrappingIndent[WrappingIndent["Indent"] = 2] = "Indent";
        /**
         * DeepIndent => wrapped lines get +2 indentation toward the parent.
         */
        WrappingIndent[WrappingIndent["DeepIndent"] = 3] = "DeepIndent";
    })(WrappingIndent = exports.WrappingIndent || (exports.WrappingIndent = {}));
    function _wrappingIndentFromString(wrappingIndent) {
        switch (wrappingIndent) {
            case 'none': return 0 /* None */;
            case 'same': return 1 /* Same */;
            case 'indent': return 2 /* Indent */;
            case 'deepIndent': return 3 /* DeepIndent */;
        }
    }
    class EditorWrappingInfoComputer extends ComputedEditorOption {
        constructor() {
            super(127 /* wrappingInfo */, [126 /* layoutInfo */]);
        }
        compute(env, options, _) {
            const layoutInfo = options.get(126 /* layoutInfo */);
            return {
                isDominatedByLongLines: env.isDominatedByLongLines,
                isWordWrapMinified: layoutInfo.isWordWrapMinified,
                isViewportWrapping: layoutInfo.isViewportWrapping,
                wrappingColumn: layoutInfo.wrappingColumn,
            };
        }
    }
    //#endregion
    const DEFAULT_WINDOWS_FONT_FAMILY = 'Consolas, \'Courier New\', monospace';
    const DEFAULT_MAC_FONT_FAMILY = 'Menlo, Monaco, \'Courier New\', monospace';
    const DEFAULT_LINUX_FONT_FAMILY = '\'Droid Sans Mono\', \'monospace\', monospace, \'Droid Sans Fallback\'';
    /**
     * @internal
     */
    exports.EDITOR_FONT_DEFAULTS = {
        fontFamily: (platform.isMacintosh ? DEFAULT_MAC_FONT_FAMILY : (platform.isLinux ? DEFAULT_LINUX_FONT_FAMILY : DEFAULT_WINDOWS_FONT_FAMILY)),
        fontWeight: 'normal',
        fontSize: (platform.isMacintosh ? 12 : 14),
        lineHeight: 0,
        letterSpacing: 0,
    };
    /**
     * @internal
     */
    exports.EDITOR_MODEL_DEFAULTS = {
        tabSize: 4,
        indentSize: 4,
        insertSpaces: true,
        detectIndentation: true,
        trimAutoWhitespace: true,
        largeFileOptimizations: true
    };
    /**
     * @internal
     */
    exports.editorOptionsRegistry = [];
    function register(option) {
        exports.editorOptionsRegistry[option.id] = option;
        return option;
    }
    var EditorOption;
    (function (EditorOption) {
        EditorOption[EditorOption["acceptSuggestionOnCommitCharacter"] = 0] = "acceptSuggestionOnCommitCharacter";
        EditorOption[EditorOption["acceptSuggestionOnEnter"] = 1] = "acceptSuggestionOnEnter";
        EditorOption[EditorOption["accessibilitySupport"] = 2] = "accessibilitySupport";
        EditorOption[EditorOption["accessibilityPageSize"] = 3] = "accessibilityPageSize";
        EditorOption[EditorOption["ariaLabel"] = 4] = "ariaLabel";
        EditorOption[EditorOption["autoClosingBrackets"] = 5] = "autoClosingBrackets";
        EditorOption[EditorOption["autoClosingDelete"] = 6] = "autoClosingDelete";
        EditorOption[EditorOption["autoClosingOvertype"] = 7] = "autoClosingOvertype";
        EditorOption[EditorOption["autoClosingQuotes"] = 8] = "autoClosingQuotes";
        EditorOption[EditorOption["autoIndent"] = 9] = "autoIndent";
        EditorOption[EditorOption["automaticLayout"] = 10] = "automaticLayout";
        EditorOption[EditorOption["autoSurround"] = 11] = "autoSurround";
        EditorOption[EditorOption["codeLens"] = 12] = "codeLens";
        EditorOption[EditorOption["codeLensFontFamily"] = 13] = "codeLensFontFamily";
        EditorOption[EditorOption["codeLensFontSize"] = 14] = "codeLensFontSize";
        EditorOption[EditorOption["colorDecorators"] = 15] = "colorDecorators";
        EditorOption[EditorOption["columnSelection"] = 16] = "columnSelection";
        EditorOption[EditorOption["comments"] = 17] = "comments";
        EditorOption[EditorOption["contextmenu"] = 18] = "contextmenu";
        EditorOption[EditorOption["copyWithSyntaxHighlighting"] = 19] = "copyWithSyntaxHighlighting";
        EditorOption[EditorOption["cursorBlinking"] = 20] = "cursorBlinking";
        EditorOption[EditorOption["cursorSmoothCaretAnimation"] = 21] = "cursorSmoothCaretAnimation";
        EditorOption[EditorOption["cursorStyle"] = 22] = "cursorStyle";
        EditorOption[EditorOption["cursorSurroundingLines"] = 23] = "cursorSurroundingLines";
        EditorOption[EditorOption["cursorSurroundingLinesStyle"] = 24] = "cursorSurroundingLinesStyle";
        EditorOption[EditorOption["cursorWidth"] = 25] = "cursorWidth";
        EditorOption[EditorOption["disableLayerHinting"] = 26] = "disableLayerHinting";
        EditorOption[EditorOption["disableMonospaceOptimizations"] = 27] = "disableMonospaceOptimizations";
        EditorOption[EditorOption["domReadOnly"] = 28] = "domReadOnly";
        EditorOption[EditorOption["dragAndDrop"] = 29] = "dragAndDrop";
        EditorOption[EditorOption["emptySelectionClipboard"] = 30] = "emptySelectionClipboard";
        EditorOption[EditorOption["extraEditorClassName"] = 31] = "extraEditorClassName";
        EditorOption[EditorOption["fastScrollSensitivity"] = 32] = "fastScrollSensitivity";
        EditorOption[EditorOption["find"] = 33] = "find";
        EditorOption[EditorOption["fixedOverflowWidgets"] = 34] = "fixedOverflowWidgets";
        EditorOption[EditorOption["folding"] = 35] = "folding";
        EditorOption[EditorOption["foldingStrategy"] = 36] = "foldingStrategy";
        EditorOption[EditorOption["foldingHighlight"] = 37] = "foldingHighlight";
        EditorOption[EditorOption["unfoldOnClickAfterEndOfLine"] = 38] = "unfoldOnClickAfterEndOfLine";
        EditorOption[EditorOption["fontFamily"] = 39] = "fontFamily";
        EditorOption[EditorOption["fontInfo"] = 40] = "fontInfo";
        EditorOption[EditorOption["fontLigatures"] = 41] = "fontLigatures";
        EditorOption[EditorOption["fontSize"] = 42] = "fontSize";
        EditorOption[EditorOption["fontWeight"] = 43] = "fontWeight";
        EditorOption[EditorOption["formatOnPaste"] = 44] = "formatOnPaste";
        EditorOption[EditorOption["formatOnType"] = 45] = "formatOnType";
        EditorOption[EditorOption["glyphMargin"] = 46] = "glyphMargin";
        EditorOption[EditorOption["gotoLocation"] = 47] = "gotoLocation";
        EditorOption[EditorOption["hideCursorInOverviewRuler"] = 48] = "hideCursorInOverviewRuler";
        EditorOption[EditorOption["highlightActiveIndentGuide"] = 49] = "highlightActiveIndentGuide";
        EditorOption[EditorOption["hover"] = 50] = "hover";
        EditorOption[EditorOption["inDiffEditor"] = 51] = "inDiffEditor";
        EditorOption[EditorOption["letterSpacing"] = 52] = "letterSpacing";
        EditorOption[EditorOption["lightbulb"] = 53] = "lightbulb";
        EditorOption[EditorOption["lineDecorationsWidth"] = 54] = "lineDecorationsWidth";
        EditorOption[EditorOption["lineHeight"] = 55] = "lineHeight";
        EditorOption[EditorOption["lineNumbers"] = 56] = "lineNumbers";
        EditorOption[EditorOption["lineNumbersMinChars"] = 57] = "lineNumbersMinChars";
        EditorOption[EditorOption["linkedEditing"] = 58] = "linkedEditing";
        EditorOption[EditorOption["links"] = 59] = "links";
        EditorOption[EditorOption["matchBrackets"] = 60] = "matchBrackets";
        EditorOption[EditorOption["minimap"] = 61] = "minimap";
        EditorOption[EditorOption["mouseStyle"] = 62] = "mouseStyle";
        EditorOption[EditorOption["mouseWheelScrollSensitivity"] = 63] = "mouseWheelScrollSensitivity";
        EditorOption[EditorOption["mouseWheelZoom"] = 64] = "mouseWheelZoom";
        EditorOption[EditorOption["multiCursorMergeOverlapping"] = 65] = "multiCursorMergeOverlapping";
        EditorOption[EditorOption["multiCursorModifier"] = 66] = "multiCursorModifier";
        EditorOption[EditorOption["multiCursorPaste"] = 67] = "multiCursorPaste";
        EditorOption[EditorOption["occurrencesHighlight"] = 68] = "occurrencesHighlight";
        EditorOption[EditorOption["overviewRulerBorder"] = 69] = "overviewRulerBorder";
        EditorOption[EditorOption["overviewRulerLanes"] = 70] = "overviewRulerLanes";
        EditorOption[EditorOption["padding"] = 71] = "padding";
        EditorOption[EditorOption["parameterHints"] = 72] = "parameterHints";
        EditorOption[EditorOption["peekWidgetDefaultFocus"] = 73] = "peekWidgetDefaultFocus";
        EditorOption[EditorOption["definitionLinkOpensInPeek"] = 74] = "definitionLinkOpensInPeek";
        EditorOption[EditorOption["quickSuggestions"] = 75] = "quickSuggestions";
        EditorOption[EditorOption["quickSuggestionsDelay"] = 76] = "quickSuggestionsDelay";
        EditorOption[EditorOption["readOnly"] = 77] = "readOnly";
        EditorOption[EditorOption["renameOnType"] = 78] = "renameOnType";
        EditorOption[EditorOption["renderControlCharacters"] = 79] = "renderControlCharacters";
        EditorOption[EditorOption["renderIndentGuides"] = 80] = "renderIndentGuides";
        EditorOption[EditorOption["renderFinalNewline"] = 81] = "renderFinalNewline";
        EditorOption[EditorOption["renderLineHighlight"] = 82] = "renderLineHighlight";
        EditorOption[EditorOption["renderLineHighlightOnlyWhenFocus"] = 83] = "renderLineHighlightOnlyWhenFocus";
        EditorOption[EditorOption["renderValidationDecorations"] = 84] = "renderValidationDecorations";
        EditorOption[EditorOption["renderWhitespace"] = 85] = "renderWhitespace";
        EditorOption[EditorOption["revealHorizontalRightPadding"] = 86] = "revealHorizontalRightPadding";
        EditorOption[EditorOption["roundedSelection"] = 87] = "roundedSelection";
        EditorOption[EditorOption["rulers"] = 88] = "rulers";
        EditorOption[EditorOption["scrollbar"] = 89] = "scrollbar";
        EditorOption[EditorOption["scrollBeyondLastColumn"] = 90] = "scrollBeyondLastColumn";
        EditorOption[EditorOption["scrollBeyondLastLine"] = 91] = "scrollBeyondLastLine";
        EditorOption[EditorOption["scrollPredominantAxis"] = 92] = "scrollPredominantAxis";
        EditorOption[EditorOption["selectionClipboard"] = 93] = "selectionClipboard";
        EditorOption[EditorOption["selectionHighlight"] = 94] = "selectionHighlight";
        EditorOption[EditorOption["selectOnLineNumbers"] = 95] = "selectOnLineNumbers";
        EditorOption[EditorOption["showFoldingControls"] = 96] = "showFoldingControls";
        EditorOption[EditorOption["showUnused"] = 97] = "showUnused";
        EditorOption[EditorOption["snippetSuggestions"] = 98] = "snippetSuggestions";
        EditorOption[EditorOption["smartSelect"] = 99] = "smartSelect";
        EditorOption[EditorOption["smoothScrolling"] = 100] = "smoothScrolling";
        EditorOption[EditorOption["stickyTabStops"] = 101] = "stickyTabStops";
        EditorOption[EditorOption["stopRenderingLineAfter"] = 102] = "stopRenderingLineAfter";
        EditorOption[EditorOption["suggest"] = 103] = "suggest";
        EditorOption[EditorOption["suggestFontSize"] = 104] = "suggestFontSize";
        EditorOption[EditorOption["suggestLineHeight"] = 105] = "suggestLineHeight";
        EditorOption[EditorOption["suggestOnTriggerCharacters"] = 106] = "suggestOnTriggerCharacters";
        EditorOption[EditorOption["suggestSelection"] = 107] = "suggestSelection";
        EditorOption[EditorOption["tabCompletion"] = 108] = "tabCompletion";
        EditorOption[EditorOption["tabIndex"] = 109] = "tabIndex";
        EditorOption[EditorOption["unusualLineTerminators"] = 110] = "unusualLineTerminators";
        EditorOption[EditorOption["useTabStops"] = 111] = "useTabStops";
        EditorOption[EditorOption["wordSeparators"] = 112] = "wordSeparators";
        EditorOption[EditorOption["wordWrap"] = 113] = "wordWrap";
        EditorOption[EditorOption["wordWrapBreakAfterCharacters"] = 114] = "wordWrapBreakAfterCharacters";
        EditorOption[EditorOption["wordWrapBreakBeforeCharacters"] = 115] = "wordWrapBreakBeforeCharacters";
        EditorOption[EditorOption["wordWrapColumn"] = 116] = "wordWrapColumn";
        EditorOption[EditorOption["wordWrapOverride1"] = 117] = "wordWrapOverride1";
        EditorOption[EditorOption["wordWrapOverride2"] = 118] = "wordWrapOverride2";
        EditorOption[EditorOption["wrappingIndent"] = 119] = "wrappingIndent";
        EditorOption[EditorOption["wrappingStrategy"] = 120] = "wrappingStrategy";
        EditorOption[EditorOption["showDeprecated"] = 121] = "showDeprecated";
        EditorOption[EditorOption["inlineHints"] = 122] = "inlineHints";
        // Leave these at the end (because they have dependencies!)
        EditorOption[EditorOption["editorClassName"] = 123] = "editorClassName";
        EditorOption[EditorOption["pixelRatio"] = 124] = "pixelRatio";
        EditorOption[EditorOption["tabFocusMode"] = 125] = "tabFocusMode";
        EditorOption[EditorOption["layoutInfo"] = 126] = "layoutInfo";
        EditorOption[EditorOption["wrappingInfo"] = 127] = "wrappingInfo";
    })(EditorOption = exports.EditorOption || (exports.EditorOption = {}));
    /**
     * WORKAROUND: TS emits "any" for complex editor options values (anything except string, bool, enum, etc. ends up being "any")
     * @monacodtsreplace
     * /accessibilitySupport, any/accessibilitySupport, AccessibilitySupport/
     * /comments, any/comments, EditorCommentsOptions/
     * /find, any/find, EditorFindOptions/
     * /fontInfo, any/fontInfo, FontInfo/
     * /gotoLocation, any/gotoLocation, GoToLocationOptions/
     * /hover, any/hover, EditorHoverOptions/
     * /lightbulb, any/lightbulb, EditorLightbulbOptions/
     * /minimap, any/minimap, EditorMinimapOptions/
     * /parameterHints, any/parameterHints, InternalParameterHintOptions/
     * /quickSuggestions, any/quickSuggestions, ValidQuickSuggestionsOptions/
     * /suggest, any/suggest, InternalSuggestOptions/
     */
    exports.EditorOptions = {
        acceptSuggestionOnCommitCharacter: register(new EditorBooleanOption(0 /* acceptSuggestionOnCommitCharacter */, 'acceptSuggestionOnCommitCharacter', true, { markdownDescription: nls.localize(111, null) })),
        acceptSuggestionOnEnter: register(new EditorStringEnumOption(1 /* acceptSuggestionOnEnter */, 'acceptSuggestionOnEnter', 'on', ['on', 'smart', 'off'], {
            markdownEnumDescriptions: [
                '',
                nls.localize(112, null),
                ''
            ],
            markdownDescription: nls.localize(113, null)
        })),
        accessibilitySupport: register(new EditorAccessibilitySupport()),
        accessibilityPageSize: register(new EditorIntOption(3 /* accessibilityPageSize */, 'accessibilityPageSize', 10, 1, 1073741824 /* MAX_SAFE_SMALL_INTEGER */, {
            description: nls.localize(114, null)
        })),
        ariaLabel: register(new EditorStringOption(4 /* ariaLabel */, 'ariaLabel', nls.localize(115, null))),
        autoClosingBrackets: register(new EditorStringEnumOption(5 /* autoClosingBrackets */, 'autoClosingBrackets', 'languageDefined', ['always', 'languageDefined', 'beforeWhitespace', 'never'], {
            enumDescriptions: [
                '',
                nls.localize(116, null),
                nls.localize(117, null),
                '',
            ],
            description: nls.localize(118, null)
        })),
        autoClosingDelete: register(new EditorStringEnumOption(6 /* autoClosingDelete */, 'autoClosingDelete', 'auto', ['always', 'auto', 'never'], {
            enumDescriptions: [
                '',
                nls.localize(119, null),
                '',
            ],
            description: nls.localize(120, null)
        })),
        autoClosingOvertype: register(new EditorStringEnumOption(7 /* autoClosingOvertype */, 'autoClosingOvertype', 'auto', ['always', 'auto', 'never'], {
            enumDescriptions: [
                '',
                nls.localize(121, null),
                '',
            ],
            description: nls.localize(122, null)
        })),
        autoClosingQuotes: register(new EditorStringEnumOption(8 /* autoClosingQuotes */, 'autoClosingQuotes', 'languageDefined', ['always', 'languageDefined', 'beforeWhitespace', 'never'], {
            enumDescriptions: [
                '',
                nls.localize(123, null),
                nls.localize(124, null),
                '',
            ],
            description: nls.localize(125, null)
        })),
        autoIndent: register(new EditorEnumOption(9 /* autoIndent */, 'autoIndent', 4 /* Full */, 'full', ['none', 'keep', 'brackets', 'advanced', 'full'], _autoIndentFromString, {
            enumDescriptions: [
                nls.localize(126, null),
                nls.localize(127, null),
                nls.localize(128, null),
                nls.localize(129, null),
                nls.localize(130, null),
            ],
            description: nls.localize(131, null)
        })),
        automaticLayout: register(new EditorBooleanOption(10 /* automaticLayout */, 'automaticLayout', false)),
        autoSurround: register(new EditorStringEnumOption(11 /* autoSurround */, 'autoSurround', 'languageDefined', ['languageDefined', 'quotes', 'brackets', 'never'], {
            enumDescriptions: [
                nls.localize(132, null),
                nls.localize(133, null),
                nls.localize(134, null),
                ''
            ],
            description: nls.localize(135, null)
        })),
        stickyTabStops: register(new EditorBooleanOption(101 /* stickyTabStops */, 'stickyTabStops', false, { description: nls.localize(136, null) })),
        codeLens: register(new EditorBooleanOption(12 /* codeLens */, 'codeLens', true, { description: nls.localize(137, null) })),
        codeLensFontFamily: register(new EditorStringOption(13 /* codeLensFontFamily */, 'codeLensFontFamily', '', { description: nls.localize(138, null) })),
        codeLensFontSize: register(new EditorIntOption(14 /* codeLensFontSize */, 'codeLensFontSize', 0, 0, 100, {
            type: 'number',
            default: 0,
            minimum: 0,
            maximum: 100,
            description: nls.localize(139, null)
        })),
        colorDecorators: register(new EditorBooleanOption(15 /* colorDecorators */, 'colorDecorators', true, { description: nls.localize(140, null) })),
        columnSelection: register(new EditorBooleanOption(16 /* columnSelection */, 'columnSelection', false, { description: nls.localize(141, null) })),
        comments: register(new EditorComments()),
        contextmenu: register(new EditorBooleanOption(18 /* contextmenu */, 'contextmenu', true)),
        copyWithSyntaxHighlighting: register(new EditorBooleanOption(19 /* copyWithSyntaxHighlighting */, 'copyWithSyntaxHighlighting', true, { description: nls.localize(142, null) })),
        cursorBlinking: register(new EditorEnumOption(20 /* cursorBlinking */, 'cursorBlinking', 1 /* Blink */, 'blink', ['blink', 'smooth', 'phase', 'expand', 'solid'], _cursorBlinkingStyleFromString, { description: nls.localize(143, null) })),
        cursorSmoothCaretAnimation: register(new EditorBooleanOption(21 /* cursorSmoothCaretAnimation */, 'cursorSmoothCaretAnimation', false, { description: nls.localize(144, null) })),
        cursorStyle: register(new EditorEnumOption(22 /* cursorStyle */, 'cursorStyle', TextEditorCursorStyle.Line, 'line', ['line', 'block', 'underline', 'line-thin', 'block-outline', 'underline-thin'], _cursorStyleFromString, { description: nls.localize(145, null) })),
        cursorSurroundingLines: register(new EditorIntOption(23 /* cursorSurroundingLines */, 'cursorSurroundingLines', 0, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */, { description: nls.localize(146, null) })),
        cursorSurroundingLinesStyle: register(new EditorStringEnumOption(24 /* cursorSurroundingLinesStyle */, 'cursorSurroundingLinesStyle', 'default', ['default', 'all'], {
            enumDescriptions: [
                nls.localize(147, null),
                nls.localize(148, null)
            ],
            description: nls.localize(149, null)
        })),
        cursorWidth: register(new EditorIntOption(25 /* cursorWidth */, 'cursorWidth', 0, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */, { markdownDescription: nls.localize(150, null) })),
        disableLayerHinting: register(new EditorBooleanOption(26 /* disableLayerHinting */, 'disableLayerHinting', false)),
        disableMonospaceOptimizations: register(new EditorBooleanOption(27 /* disableMonospaceOptimizations */, 'disableMonospaceOptimizations', false)),
        domReadOnly: register(new EditorBooleanOption(28 /* domReadOnly */, 'domReadOnly', false)),
        dragAndDrop: register(new EditorBooleanOption(29 /* dragAndDrop */, 'dragAndDrop', true, { description: nls.localize(151, null) })),
        emptySelectionClipboard: register(new EditorEmptySelectionClipboard()),
        extraEditorClassName: register(new EditorStringOption(31 /* extraEditorClassName */, 'extraEditorClassName', '')),
        fastScrollSensitivity: register(new EditorFloatOption(32 /* fastScrollSensitivity */, 'fastScrollSensitivity', 5, x => (x <= 0 ? 5 : x), { markdownDescription: nls.localize(152, null) })),
        find: register(new EditorFind()),
        fixedOverflowWidgets: register(new EditorBooleanOption(34 /* fixedOverflowWidgets */, 'fixedOverflowWidgets', false)),
        folding: register(new EditorBooleanOption(35 /* folding */, 'folding', true, { description: nls.localize(153, null) })),
        foldingStrategy: register(new EditorStringEnumOption(36 /* foldingStrategy */, 'foldingStrategy', 'auto', ['auto', 'indentation'], {
            enumDescriptions: [
                nls.localize(154, null),
                nls.localize(155, null),
            ],
            description: nls.localize(156, null)
        })),
        foldingHighlight: register(new EditorBooleanOption(37 /* foldingHighlight */, 'foldingHighlight', true, { description: nls.localize(157, null) })),
        unfoldOnClickAfterEndOfLine: register(new EditorBooleanOption(38 /* unfoldOnClickAfterEndOfLine */, 'unfoldOnClickAfterEndOfLine', false, { description: nls.localize(158, null) })),
        fontFamily: register(new EditorStringOption(39 /* fontFamily */, 'fontFamily', exports.EDITOR_FONT_DEFAULTS.fontFamily, { description: nls.localize(159, null) })),
        fontInfo: register(new EditorFontInfo()),
        fontLigatures2: register(new EditorFontLigatures()),
        fontSize: register(new EditorFontSize()),
        fontWeight: register(new EditorFontWeight()),
        formatOnPaste: register(new EditorBooleanOption(44 /* formatOnPaste */, 'formatOnPaste', false, { description: nls.localize(160, null) })),
        formatOnType: register(new EditorBooleanOption(45 /* formatOnType */, 'formatOnType', false, { description: nls.localize(161, null) })),
        glyphMargin: register(new EditorBooleanOption(46 /* glyphMargin */, 'glyphMargin', true, { description: nls.localize(162, null) })),
        gotoLocation: register(new EditorGoToLocation()),
        hideCursorInOverviewRuler: register(new EditorBooleanOption(48 /* hideCursorInOverviewRuler */, 'hideCursorInOverviewRuler', false, { description: nls.localize(163, null) })),
        highlightActiveIndentGuide: register(new EditorBooleanOption(49 /* highlightActiveIndentGuide */, 'highlightActiveIndentGuide', true, { description: nls.localize(164, null) })),
        hover: register(new EditorHover()),
        inDiffEditor: register(new EditorBooleanOption(51 /* inDiffEditor */, 'inDiffEditor', false)),
        letterSpacing: register(new EditorFloatOption(52 /* letterSpacing */, 'letterSpacing', exports.EDITOR_FONT_DEFAULTS.letterSpacing, x => EditorFloatOption.clamp(x, -5, 20), { description: nls.localize(165, null) })),
        lightbulb: register(new EditorLightbulb()),
        lineDecorationsWidth: register(new SimpleEditorOption(54 /* lineDecorationsWidth */, 'lineDecorationsWidth', 10)),
        lineHeight: register(new EditorLineHeight()),
        lineNumbers: register(new EditorRenderLineNumbersOption()),
        lineNumbersMinChars: register(new EditorIntOption(57 /* lineNumbersMinChars */, 'lineNumbersMinChars', 5, 1, 300)),
        linkedEditing: register(new EditorBooleanOption(58 /* linkedEditing */, 'linkedEditing', false, { description: nls.localize(166, null) })),
        links: register(new EditorBooleanOption(59 /* links */, 'links', true, { description: nls.localize(167, null) })),
        matchBrackets: register(new EditorStringEnumOption(60 /* matchBrackets */, 'matchBrackets', 'always', ['always', 'near', 'never'], { description: nls.localize(168, null) })),
        minimap: register(new EditorMinimap()),
        mouseStyle: register(new EditorStringEnumOption(62 /* mouseStyle */, 'mouseStyle', 'text', ['text', 'default', 'copy'])),
        mouseWheelScrollSensitivity: register(new EditorFloatOption(63 /* mouseWheelScrollSensitivity */, 'mouseWheelScrollSensitivity', 1, x => (x === 0 ? 1 : x), { markdownDescription: nls.localize(169, null) })),
        mouseWheelZoom: register(new EditorBooleanOption(64 /* mouseWheelZoom */, 'mouseWheelZoom', false, { markdownDescription: nls.localize(170, null) })),
        multiCursorMergeOverlapping: register(new EditorBooleanOption(65 /* multiCursorMergeOverlapping */, 'multiCursorMergeOverlapping', true, { description: nls.localize(171, null) })),
        multiCursorModifier: register(new EditorEnumOption(66 /* multiCursorModifier */, 'multiCursorModifier', 'altKey', 'alt', ['ctrlCmd', 'alt'], _multiCursorModifierFromString, {
            markdownEnumDescriptions: [
                nls.localize(172, null),
                nls.localize(173, null)
            ],
            markdownDescription: nls.localize(174, null)






        })),
        multiCursorPaste: register(new EditorStringEnumOption(67 /* multiCursorPaste */, 'multiCursorPaste', 'spread', ['spread', 'full'], {
            markdownEnumDescriptions: [
                nls.localize(175, null),
                nls.localize(176, null)
            ],
            markdownDescription: nls.localize(177, null)
        })),
        occurrencesHighlight: register(new EditorBooleanOption(68 /* occurrencesHighlight */, 'occurrencesHighlight', true, { description: nls.localize(178, null) })),
        overviewRulerBorder: register(new EditorBooleanOption(69 /* overviewRulerBorder */, 'overviewRulerBorder', true, { description: nls.localize(179, null) })),
        overviewRulerLanes: register(new EditorIntOption(70 /* overviewRulerLanes */, 'overviewRulerLanes', 3, 0, 3)),
        padding: register(new EditorPadding()),
        parameterHints: register(new EditorParameterHints()),
        peekWidgetDefaultFocus: register(new EditorStringEnumOption(73 /* peekWidgetDefaultFocus */, 'peekWidgetDefaultFocus', 'tree', ['tree', 'editor'], {
            enumDescriptions: [
                nls.localize(180, null),
                nls.localize(181, null)
            ],
            description: nls.localize(182, null)
        })),
        definitionLinkOpensInPeek: register(new EditorBooleanOption(74 /* definitionLinkOpensInPeek */, 'definitionLinkOpensInPeek', false, { description: nls.localize(183, null) })),
        quickSuggestions: register(new EditorQuickSuggestions()),
        quickSuggestionsDelay: register(new EditorIntOption(76 /* quickSuggestionsDelay */, 'quickSuggestionsDelay', 10, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */, { description: nls.localize(184, null) })),
        readOnly: register(new EditorBooleanOption(77 /* readOnly */, 'readOnly', false)),
        renameOnType: register(new EditorBooleanOption(78 /* renameOnType */, 'renameOnType', false, { description: nls.localize(185, null), markdownDeprecationMessage: nls.localize(186, null) })),
        renderControlCharacters: register(new EditorBooleanOption(79 /* renderControlCharacters */, 'renderControlCharacters', false, { description: nls.localize(187, null) })),
        renderIndentGuides: register(new EditorBooleanOption(80 /* renderIndentGuides */, 'renderIndentGuides', true, { description: nls.localize(188, null) })),
        renderFinalNewline: register(new EditorBooleanOption(81 /* renderFinalNewline */, 'renderFinalNewline', true, { description: nls.localize(189, null) })),
        renderLineHighlight: register(new EditorStringEnumOption(82 /* renderLineHighlight */, 'renderLineHighlight', 'line', ['none', 'gutter', 'line', 'all'], {
            enumDescriptions: [
                '',
                '',
                '',
                nls.localize(190, null),
            ],
            description: nls.localize(191, null)
        })),
        renderLineHighlightOnlyWhenFocus: register(new EditorBooleanOption(83 /* renderLineHighlightOnlyWhenFocus */, 'renderLineHighlightOnlyWhenFocus', false, { description: nls.localize(192, null) })),
        renderValidationDecorations: register(new EditorStringEnumOption(84 /* renderValidationDecorations */, 'renderValidationDecorations', 'editable', ['editable', 'on', 'off'])),
        renderWhitespace: register(new EditorStringEnumOption(85 /* renderWhitespace */, 'renderWhitespace', 'selection', ['none', 'boundary', 'selection', 'trailing', 'all'], {
            enumDescriptions: [
                '',
                nls.localize(193, null),
                nls.localize(194, null),
                nls.localize(195, null),
                ''
            ],
            description: nls.localize(196, null)
        })),
        revealHorizontalRightPadding: register(new EditorIntOption(86 /* revealHorizontalRightPadding */, 'revealHorizontalRightPadding', 30, 0, 1000)),
        roundedSelection: register(new EditorBooleanOption(87 /* roundedSelection */, 'roundedSelection', true, { description: nls.localize(197, null) })),
        rulers: register(new EditorRulers()),
        scrollbar: register(new EditorScrollbar()),
        scrollBeyondLastColumn: register(new EditorIntOption(90 /* scrollBeyondLastColumn */, 'scrollBeyondLastColumn', 5, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */, { description: nls.localize(198, null) })),
        scrollBeyondLastLine: register(new EditorBooleanOption(91 /* scrollBeyondLastLine */, 'scrollBeyondLastLine', true, { description: nls.localize(199, null) })),
        scrollPredominantAxis: register(new EditorBooleanOption(92 /* scrollPredominantAxis */, 'scrollPredominantAxis', true, { description: nls.localize(200, null) })),
        selectionClipboard: register(new EditorBooleanOption(93 /* selectionClipboard */, 'selectionClipboard', true, {
            description: nls.localize(201, null),
            included: platform.isLinux
        })),
        selectionHighlight: register(new EditorBooleanOption(94 /* selectionHighlight */, 'selectionHighlight', true, { description: nls.localize(202, null) })),
        selectOnLineNumbers: register(new EditorBooleanOption(95 /* selectOnLineNumbers */, 'selectOnLineNumbers', true)),
        showFoldingControls: register(new EditorStringEnumOption(96 /* showFoldingControls */, 'showFoldingControls', 'mouseover', ['always', 'mouseover'], {
            enumDescriptions: [
                nls.localize(203, null),
                nls.localize(204, null),
            ],
            description: nls.localize(205, null)
        })),
        showUnused: register(new EditorBooleanOption(97 /* showUnused */, 'showUnused', true, { description: nls.localize(206, null) })),
        showDeprecated: register(new EditorBooleanOption(121 /* showDeprecated */, 'showDeprecated', true, { description: nls.localize(207, null) })),
        inlineHints: register(new EditorInlineHints()),
        snippetSuggestions: register(new EditorStringEnumOption(98 /* snippetSuggestions */, 'snippetSuggestions', 'inline', ['top', 'bottom', 'inline', 'none'], {
            enumDescriptions: [
                nls.localize(208, null),
                nls.localize(209, null),
                nls.localize(210, null),
                nls.localize(211, null),
            ],
            description: nls.localize(212, null)
        })),
        smartSelect: register(new SmartSelect()),
        smoothScrolling: register(new EditorBooleanOption(100 /* smoothScrolling */, 'smoothScrolling', false, { description: nls.localize(213, null) })),
        stopRenderingLineAfter: register(new EditorIntOption(102 /* stopRenderingLineAfter */, 'stopRenderingLineAfter', 10000, -1, 1073741824 /* MAX_SAFE_SMALL_INTEGER */)),
        suggest: register(new EditorSuggest()),
        suggestFontSize: register(new EditorIntOption(104 /* suggestFontSize */, 'suggestFontSize', 0, 0, 1000, { markdownDescription: nls.localize(214, null) })),
        suggestLineHeight: register(new EditorIntOption(105 /* suggestLineHeight */, 'suggestLineHeight', 0, 0, 1000, { markdownDescription: nls.localize(215, null) })),
        suggestOnTriggerCharacters: register(new EditorBooleanOption(106 /* suggestOnTriggerCharacters */, 'suggestOnTriggerCharacters', true, { description: nls.localize(216, null) })),
        suggestSelection: register(new EditorStringEnumOption(107 /* suggestSelection */, 'suggestSelection', 'recentlyUsed', ['first', 'recentlyUsed', 'recentlyUsedByPrefix'], {
            markdownEnumDescriptions: [
                nls.localize(217, null),
                nls.localize(218, null),
                nls.localize(219, null),
            ],
            description: nls.localize(220, null)
        })),
        tabCompletion: register(new EditorStringEnumOption(108 /* tabCompletion */, 'tabCompletion', 'off', ['on', 'off', 'onlySnippets'], {
            enumDescriptions: [
                nls.localize(221, null),
                nls.localize(222, null),
                nls.localize(223, null),
            ],
            description: nls.localize(224, null)
        })),
        tabIndex: register(new EditorIntOption(109 /* tabIndex */, 'tabIndex', 0, -1, 1073741824 /* MAX_SAFE_SMALL_INTEGER */)),
        unusualLineTerminators: register(new EditorStringEnumOption(110 /* unusualLineTerminators */, 'unusualLineTerminators', 'prompt', ['auto', 'off', 'prompt'], {
            enumDescriptions: [
                nls.localize(225, null),
                nls.localize(226, null),
                nls.localize(227, null),
            ],
            description: nls.localize(228, null)
        })),
        useTabStops: register(new EditorBooleanOption(111 /* useTabStops */, 'useTabStops', true, { description: nls.localize(229, null) })),
        wordSeparators: register(new EditorStringOption(112 /* wordSeparators */, 'wordSeparators', wordHelper_1.USUAL_WORD_SEPARATORS, { description: nls.localize(230, null) })),
        wordWrap: register(new EditorStringEnumOption(113 /* wordWrap */, 'wordWrap', 'off', ['off', 'on', 'wordWrapColumn', 'bounded'], {
            markdownEnumDescriptions: [
                nls.localize(231, null),
                nls.localize(232, null),
                nls.localize(233, null),





                nls.localize(234, null),






            ],
            description: nls.localize(235, null)






        })),
        wordWrapBreakAfterCharacters: register(new EditorStringOption(114 /* wordWrapBreakAfterCharacters */, 'wordWrapBreakAfterCharacters', ' \t})]?|/&.,;¢°′″‰℃、。｡､￠，．：；？！％・･ゝゞヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻ｧｨｩｪｫｬｭｮｯｰ”〉》」』】〕）］｝｣')),
        wordWrapBreakBeforeCharacters: register(new EditorStringOption(115 /* wordWrapBreakBeforeCharacters */, 'wordWrapBreakBeforeCharacters', '([{‘“〈《「『【〔（［｛｢£¥＄￡￥+＋')),
        wordWrapColumn: register(new EditorIntOption(116 /* wordWrapColumn */, 'wordWrapColumn', 80, 1, 1073741824 /* MAX_SAFE_SMALL_INTEGER */, {
            markdownDescription: nls.localize(236, null)






        })),
        wordWrapOverride1: register(new EditorStringEnumOption(117 /* wordWrapOverride1 */, 'wordWrapOverride1', 'inherit', ['off', 'on', 'inherit'])),
        wordWrapOverride2: register(new EditorStringEnumOption(118 /* wordWrapOverride2 */, 'wordWrapOverride2', 'inherit', ['off', 'on', 'inherit'])),
        wrappingIndent: register(new EditorEnumOption(119 /* wrappingIndent */, 'wrappingIndent', 1 /* Same */, 'same', ['none', 'same', 'indent', 'deepIndent'], _wrappingIndentFromString, {
            enumDescriptions: [
                nls.localize(237, null),
                nls.localize(238, null),
                nls.localize(239, null),
                nls.localize(240, null),
            ],
            description: nls.localize(241, null),
        })),
        wrappingStrategy: register(new EditorStringEnumOption(120 /* wrappingStrategy */, 'wrappingStrategy', 'simple', ['simple', 'advanced'], {
            enumDescriptions: [
                nls.localize(242, null),
                nls.localize(243, null)
            ],
            description: nls.localize(244, null)
        })),
        // Leave these at the end (because they have dependencies!)
        editorClassName: register(new EditorClassName()),
        pixelRatio: register(new EditorPixelRatio()),
        tabFocusMode: register(new EditorTabFocusMode()),
        layoutInfo: register(new EditorLayoutInfoComputer()),
        wrappingInfo: register(new EditorWrappingInfoComputer())
    };
});
//# sourceMappingURL=editorOptions.js.map