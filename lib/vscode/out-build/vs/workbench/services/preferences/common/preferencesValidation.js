/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/services/preferences/common/preferencesValidation", "vs/base/common/color", "vs/base/common/types"], function (require, exports, nls, color_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getInvalidTypeError = exports.createValidator = void 0;
    function canBeType(propTypes, ...types) {
        return types.some(t => propTypes.includes(t));
    }
    function createValidator(prop) {
        const type = Array.isArray(prop.type) ? prop.type : [prop.type];
        const isNullable = canBeType(type, 'null');
        const isNumeric = (canBeType(type, 'number') || canBeType(type, 'integer')) && (type.length === 1 || type.length === 2 && isNullable);
        const numericValidations = getNumericValidators(prop);
        const stringValidations = getStringValidators(prop);
        const stringArrayValidator = getArrayOfStringValidator(prop);
        return value => {
            if (prop.type === 'string' && stringValidations.length === 0) {
                return null;
            }
            if (isNullable && value === '') {
                return '';
            }
            const errors = [];
            if (stringArrayValidator) {
                const err = stringArrayValidator(value);
                if (err) {
                    errors.push(err);
                }
            }
            if (isNumeric) {
                if (value === '' || isNaN(+value)) {
                    errors.push(nls.localize(0, null));
                }
                else {
                    errors.push(...numericValidations.filter(validator => !validator.isValid(+value)).map(validator => validator.message));
                }
            }
            if (prop.type === 'string') {
                errors.push(...stringValidations.filter(validator => !validator.isValid('' + value)).map(validator => validator.message));
            }
            if (errors.length) {
                return prop.errorMessage ? [prop.errorMessage, ...errors].join(' ') : errors.join(' ');
            }
            return '';
        };
    }
    exports.createValidator = createValidator;
    /**
     * Returns an error string if the value is invalid and can't be displayed in the settings UI for the given type.
     */
    function getInvalidTypeError(value, type) {
        if (typeof type === 'undefined') {
            return;
        }
        const typeArr = Array.isArray(type) ? type : [type];
        if (!typeArr.some(_type => valueValidatesAsType(value, _type))) {
            return nls.localize(1, null, JSON.stringify(type));
        }
        return;
    }
    exports.getInvalidTypeError = getInvalidTypeError;
    function valueValidatesAsType(value, type) {
        const valueType = typeof value;
        if (type === 'boolean') {
            return valueType === 'boolean';
        }
        else if (type === 'object') {
            return value && !Array.isArray(value) && valueType === 'object';
        }
        else if (type === 'null') {
            return value === null;
        }
        else if (type === 'array') {
            return Array.isArray(value);
        }
        else if (type === 'string') {
            return valueType === 'string';
        }
        else if (type === 'number' || type === 'integer') {
            return valueType === 'number';
        }
        return true;
    }
    function getStringValidators(prop) {
        const uriRegex = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
        let patternRegex;
        if (typeof prop.pattern === 'string') {
            patternRegex = new RegExp(prop.pattern);
        }
        return [
            {
                enabled: prop.maxLength !== undefined,
                isValid: ((value) => value.length <= prop.maxLength),
                message: nls.localize(2, null, prop.maxLength)
            },
            {
                enabled: prop.minLength !== undefined,
                isValid: ((value) => value.length >= prop.minLength),
                message: nls.localize(3, null, prop.minLength)
            },
            {
                enabled: patternRegex !== undefined,
                isValid: ((value) => patternRegex.test(value)),
                message: prop.patternErrorMessage || nls.localize(4, null, prop.pattern)
            },
            {
                enabled: prop.format === 'color-hex',
                isValid: ((value) => color_1.Color.Format.CSS.parseHex(value)),
                message: nls.localize(5, null)
            },
            {
                enabled: prop.format === 'uri' || prop.format === 'uri-reference',
                isValid: ((value) => !!value.length),
                message: nls.localize(6, null)
            },
            {
                enabled: prop.format === 'uri' || prop.format === 'uri-reference',
                isValid: ((value) => uriRegex.test(value)),
                message: nls.localize(7, null)
            },
            {
                enabled: prop.format === 'uri',
                isValid: ((value) => {
                    const matches = value.match(uriRegex);
                    return !!(matches && matches[2]);
                }),
                message: nls.localize(8, null)
            },
        ].filter(validation => validation.enabled);
    }
    function getNumericValidators(prop) {
        const type = Array.isArray(prop.type) ? prop.type : [prop.type];
        const isNullable = canBeType(type, 'null');
        const isIntegral = (canBeType(type, 'integer')) && (type.length === 1 || type.length === 2 && isNullable);
        const isNumeric = canBeType(type, 'number', 'integer') && (type.length === 1 || type.length === 2 && isNullable);
        if (!isNumeric) {
            return [];
        }
        let exclusiveMax;
        let exclusiveMin;
        if (typeof prop.exclusiveMaximum === 'boolean') {
            exclusiveMax = prop.exclusiveMaximum ? prop.maximum : undefined;
        }
        else {
            exclusiveMax = prop.exclusiveMaximum;
        }
        if (typeof prop.exclusiveMinimum === 'boolean') {
            exclusiveMin = prop.exclusiveMinimum ? prop.minimum : undefined;
        }
        else {
            exclusiveMin = prop.exclusiveMinimum;
        }
        return [
            {
                enabled: exclusiveMax !== undefined && (prop.maximum === undefined || exclusiveMax <= prop.maximum),
                isValid: ((value) => value < exclusiveMax),
                message: nls.localize(9, null, exclusiveMax)
            },
            {
                enabled: exclusiveMin !== undefined && (prop.minimum === undefined || exclusiveMin >= prop.minimum),
                isValid: ((value) => value > exclusiveMin),
                message: nls.localize(10, null, exclusiveMin)
            },
            {
                enabled: prop.maximum !== undefined && (exclusiveMax === undefined || exclusiveMax > prop.maximum),
                isValid: ((value) => value <= prop.maximum),
                message: nls.localize(11, null, prop.maximum)
            },
            {
                enabled: prop.minimum !== undefined && (exclusiveMin === undefined || exclusiveMin < prop.minimum),
                isValid: ((value) => value >= prop.minimum),
                message: nls.localize(12, null, prop.minimum)
            },
            {
                enabled: prop.multipleOf !== undefined,
                isValid: ((value) => value % prop.multipleOf === 0),
                message: nls.localize(13, null, prop.multipleOf)
            },
            {
                enabled: isIntegral,
                isValid: ((value) => value % 1 === 0),
                message: nls.localize(14, null)
            },
        ].filter(validation => validation.enabled);
    }
    function getArrayOfStringValidator(prop) {
        if (prop.type === 'array' && prop.items && !(0, types_1.isArray)(prop.items) && prop.items.type === 'string') {
            const propItems = prop.items;
            if (propItems && !(0, types_1.isArray)(propItems) && propItems.type === 'string') {
                const withQuotes = (s) => `'` + s + `'`;
                return value => {
                    if (!value) {
                        return null;
                    }
                    let message = '';
                    const stringArrayValue = value;
                    if (prop.uniqueItems) {
                        if (new Set(stringArrayValue).size < stringArrayValue.length) {
                            message += nls.localize(15, null);
                            message += '\n';
                        }
                    }
                    if (prop.minItems && stringArrayValue.length < prop.minItems) {
                        message += nls.localize(16, null, prop.minItems);
                        message += '\n';
                    }
                    if (prop.maxItems && stringArrayValue.length > prop.maxItems) {
                        message += nls.localize(17, null, prop.maxItems);
                        message += '\n';
                    }
                    if (typeof propItems.pattern === 'string') {
                        const patternRegex = new RegExp(propItems.pattern);
                        stringArrayValue.forEach(v => {
                            if (!patternRegex.test(v)) {
                                message +=
                                    propItems.patternErrorMessage ||
                                        nls.localize(18, null, withQuotes(v), withQuotes(propItems.pattern));
                            }
                        });
                    }
                    const propItemsEnum = propItems.enum;
                    if (propItemsEnum) {
                        stringArrayValue.forEach(v => {
                            if (propItemsEnum.indexOf(v) === -1) {
                                message += nls.localize(19, null, withQuotes(v), '[' + propItemsEnum.map(withQuotes).join(', ') + ']');
                                message += '\n';
                            }
                        });
                    }
                    return message;
                };
            }
        }
        return null;
    }
});
//# sourceMappingURL=preferencesValidation.js.map