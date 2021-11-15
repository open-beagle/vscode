/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/base/common/errorMessage", "vs/base/common/types", "vs/base/common/arrays"], function (require, exports, nls, types, arrays) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toErrorMessage = void 0;
    function exceptionToErrorMessage(exception, verbose) {
        if (verbose && (exception.stack || exception.stacktrace)) {
            return nls.localize(0, null, detectSystemErrorMessage(exception), stackToString(exception.stack) || stackToString(exception.stacktrace));
        }
        return detectSystemErrorMessage(exception);
    }
    function stackToString(stack) {
        if (Array.isArray(stack)) {
            return stack.join('\n');
        }
        return stack;
    }
    function detectSystemErrorMessage(exception) {
        // See https://nodejs.org/api/errors.html#errors_class_system_error
        if (typeof exception.code === 'string' && typeof exception.errno === 'number' && typeof exception.syscall === 'string') {
            return nls.localize(1, null, exception.message);
        }
        return exception.message || nls.localize(2, null);
    }
    /**
     * Tries to generate a human readable error message out of the error. If the verbose parameter
     * is set to true, the error message will include stacktrace details if provided.
     *
     * @returns A string containing the error message.
     */
    function toErrorMessage(error = null, verbose = false) {
        if (!error) {
            return nls.localize(3, null);
        }
        if (Array.isArray(error)) {
            const errors = arrays.coalesce(error);
            const msg = toErrorMessage(errors[0], verbose);
            if (errors.length > 1) {
                return nls.localize(4, null, msg, errors.length);
            }
            return msg;
        }
        if (types.isString(error)) {
            return error;
        }
        if (error.detail) {
            const detail = error.detail;
            if (detail.error) {
                return exceptionToErrorMessage(detail.error, verbose);
            }
            if (detail.exception) {
                return exceptionToErrorMessage(detail.exception, verbose);
            }
        }
        if (error.stack) {
            return exceptionToErrorMessage(error, verbose);
        }
        if (error.message) {
            return error.message;
        }
        return nls.localize(5, null);
    }
    exports.toErrorMessage = toErrorMessage;
});
//# sourceMappingURL=errorMessage.js.map