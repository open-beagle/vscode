/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/log/common/log", "vs/platform/files/common/files"], function (require, exports, log_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpdLogLogger = exports.createRotatingLogger = void 0;
    async function createSpdLogLogger(name, logfilePath, filesize, filecount) {
        // Do not crash if spdlog cannot be loaded
        try {
            const _spdlog = await new Promise((resolve_1, reject_1) => { require(['spdlog'], resolve_1, reject_1); });
            _spdlog.setAsyncMode(8192, 500);
            return _spdlog.createRotatingLoggerAsync(name, logfilePath, filesize, filecount);
        }
        catch (e) {
            console.error(e);
        }
        return null;
    }
    function createRotatingLogger(name, filename, filesize, filecount) {
        const _spdlog = require.__$__nodeRequire('spdlog');
        return _spdlog.createRotatingLogger(name, filename, filesize, filecount);
    }
    exports.createRotatingLogger = createRotatingLogger;
    function log(logger, level, message) {
        switch (level) {
            case log_1.LogLevel.Trace:
                logger.trace(message);
                break;
            case log_1.LogLevel.Debug:
                logger.debug(message);
                break;
            case log_1.LogLevel.Info:
                logger.info(message);
                break;
            case log_1.LogLevel.Warning:
                logger.warn(message);
                break;
            case log_1.LogLevel.Error:
                logger.error(message);
                break;
            case log_1.LogLevel.Critical:
                logger.critical(message);
                break;
            default: throw new Error('Invalid log level');
        }
    }
    class SpdLogLogger extends log_1.AbstractMessageLogger {
        constructor(name, filepath, rotating, level) {
            super();
            this.name = name;
            this.filepath = filepath;
            this.rotating = rotating;
            this.buffer = [];
            this.setLevel(level);
            this._loggerCreationPromise = this._createSpdLogLogger();
            this._register(this.onDidChangeLogLevel(level => {
                if (this._logger) {
                    this._logger.setLevel(level);
                }
            }));
        }
        _createSpdLogLogger() {
            const filecount = this.rotating ? 6 : 1;
            const filesize = (30 / filecount) * files_1.ByteSize.MB;
            return createSpdLogLogger(this.name, this.filepath, filesize, filecount)
                .then(logger => {
                if (logger) {
                    this._logger = logger;
                    this._logger.setLevel(this.getLevel());
                    for (const { level, message } of this.buffer) {
                        log(this._logger, level, message);
                    }
                    this.buffer = [];
                }
            });
        }
        log(level, message) {
            if (this._logger) {
                log(this._logger, level, message);
            }
            else if (this.getLevel() <= level) {
                this.buffer.push({ level, message });
            }
        }
        clearFormatters() {
            if (this._logger) {
                this._logger.clearFormatters();
            }
            else {
                this._loggerCreationPromise.then(() => this.clearFormatters());
            }
        }
        flush() {
            if (this._logger) {
                this._logger.flush();
            }
            else {
                this._loggerCreationPromise.then(() => this.flush());
            }
        }
        dispose() {
            if (this._logger) {
                this.disposeLogger();
            }
            else {
                this._loggerCreationPromise.then(() => this.disposeLogger());
            }
        }
        disposeLogger() {
            if (this._logger) {
                this._logger.drop();
                this._logger = undefined;
            }
        }
    }
    exports.SpdLogLogger = SpdLogLogger;
});
//# sourceMappingURL=spdlogLog.js.map