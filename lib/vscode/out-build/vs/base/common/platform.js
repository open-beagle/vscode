/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isLittleEndian = exports.OS = exports.OperatingSystem = exports.setImmediate = exports.translationsConfigFile = exports.locale = exports.Language = exports.language = exports.userAgent = exports.platform = exports.isIOS = exports.isWeb = exports.isNative = exports.isLinuxSnap = exports.isLinux = exports.isMacintosh = exports.isWindows = exports.PlatformToString = exports.Platform = exports.isPreferringBrowserCodeLoad = exports.browserCodeLoadingCacheStrategy = exports.isElectronSandboxed = exports.globals = void 0;
    const LANGUAGE_DEFAULT = 'en';
    let _isWindows = false;
    let _isMacintosh = false;
    let _isLinux = false;
    let _isLinuxSnap = false;
    let _isNative = false;
    let _isWeb = false;
    let _isIOS = false;
    let _locale = undefined;
    let _language = LANGUAGE_DEFAULT;
    let _translationsConfigFile = undefined;
    let _userAgent = undefined;
    exports.globals = (typeof self === 'object' ? self : typeof global === 'object' ? global : {});
    let nodeProcess = undefined;
    if (typeof exports.globals.vscode !== 'undefined') {
        // Native environment (sandboxed)
        nodeProcess = exports.globals.vscode.process;
    }
    else if (typeof process !== 'undefined') {
        // Native environment (non-sandboxed)
        nodeProcess = process;
    }
    const isElectronRenderer = typeof ((_a = nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.versions) === null || _a === void 0 ? void 0 : _a.electron) === 'string' && nodeProcess.type === 'renderer';
    exports.isElectronSandboxed = isElectronRenderer && (nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.sandboxed);
    exports.browserCodeLoadingCacheStrategy = (() => {
        // Always enabled when sandbox is enabled
        if (exports.isElectronSandboxed) {
            return 'bypassHeatCheck';
        }
        // Otherwise, only enabled conditionally
        const env = nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.env['VSCODE_BROWSER_CODE_LOADING'];
        if (typeof env === 'string') {
            if (env === 'none' || env === 'code' || env === 'bypassHeatCheck' || env === 'bypassHeatCheckAndEagerCompile') {
                return env;
            }
            return 'bypassHeatCheck';
        }
        return undefined;
    })();
    exports.isPreferringBrowserCodeLoad = typeof exports.browserCodeLoadingCacheStrategy === 'string';
    // Web environment
    if (typeof navigator === 'object' && !isElectronRenderer) {
        _userAgent = navigator.userAgent;
        _isWindows = _userAgent.indexOf('Windows') >= 0;
        _isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
        _isIOS = (_userAgent.indexOf('Macintosh') >= 0 || _userAgent.indexOf('iPad') >= 0 || _userAgent.indexOf('iPhone') >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
        _isLinux = _userAgent.indexOf('Linux') >= 0;
        _isWeb = true;
        _locale = navigator.language;
        _language = _locale;
        // NOTE@coder: Make languages work.
        const el = typeof document !== 'undefined' && document.getElementById('vscode-remote-nls-configuration');
        const rawNlsConfig = el && el.getAttribute('data-settings');
        if (rawNlsConfig) {
            try {
                const nlsConfig = JSON.parse(rawNlsConfig);
                _locale = nlsConfig.locale;
                _translationsConfigFile = nlsConfig._translationsConfigFile;
                _language = nlsConfig.availableLanguages['*'] || LANGUAGE_DEFAULT;
            }
            catch (error) { /* Oh well. */ }
        }
    }
    // Native environment
    else if (typeof nodeProcess === 'object') {
        _isWindows = (nodeProcess.platform === 'win32');
        _isMacintosh = (nodeProcess.platform === 'darwin');
        _isLinux = (nodeProcess.platform === 'linux');
        _isLinuxSnap = _isLinux && !!nodeProcess.env['SNAP'] && !!nodeProcess.env['SNAP_REVISION'];
        _locale = LANGUAGE_DEFAULT;
        _language = LANGUAGE_DEFAULT;
        const rawNlsConfig = nodeProcess.env['VSCODE_NLS_CONFIG'];
        if (rawNlsConfig) {
            try {
                const nlsConfig = JSON.parse(rawNlsConfig);
                const resolved = nlsConfig.availableLanguages['*'];
                _locale = nlsConfig.locale;
                // VSCode's default language is 'en'
                _language = resolved ? resolved : LANGUAGE_DEFAULT;
                _translationsConfigFile = nlsConfig._translationsConfigFile;
            }
            catch (e) {
            }
        }
        _isNative = true;
    }
    // Unknown environment
    else {
        console.error('Unable to resolve platform.');
    }
    var Platform;
    (function (Platform) {
        Platform[Platform["Web"] = 0] = "Web";
        Platform[Platform["Mac"] = 1] = "Mac";
        Platform[Platform["Linux"] = 2] = "Linux";
        Platform[Platform["Windows"] = 3] = "Windows";
    })(Platform = exports.Platform || (exports.Platform = {}));
    function PlatformToString(platform) {
        switch (platform) {
            case 0 /* Web */: return 'Web';
            case 1 /* Mac */: return 'Mac';
            case 2 /* Linux */: return 'Linux';
            case 3 /* Windows */: return 'Windows';
        }
    }
    exports.PlatformToString = PlatformToString;
    let _platform = 0 /* Web */;
    if (_isMacintosh) {
        _platform = 1 /* Mac */;
    }
    else if (_isWindows) {
        _platform = 3 /* Windows */;
    }
    else if (_isLinux) {
        _platform = 2 /* Linux */;
    }
    exports.isWindows = _isWindows;
    exports.isMacintosh = _isMacintosh;
    exports.isLinux = _isLinux;
    exports.isLinuxSnap = _isLinuxSnap;
    exports.isNative = _isNative;
    exports.isWeb = _isWeb;
    exports.isIOS = _isIOS;
    exports.platform = _platform;
    exports.userAgent = _userAgent;
    /**
     * The language used for the user interface. The format of
     * the string is all lower case (e.g. zh-tw for Traditional
     * Chinese)
     */
    exports.language = _language;
    var Language;
    (function (Language) {
        function value() {
            return exports.language;
        }
        Language.value = value;
        function isDefaultVariant() {
            if (exports.language.length === 2) {
                return exports.language === 'en';
            }
            else if (exports.language.length >= 3) {
                return exports.language[0] === 'e' && exports.language[1] === 'n' && exports.language[2] === '-';
            }
            else {
                return false;
            }
        }
        Language.isDefaultVariant = isDefaultVariant;
        function isDefault() {
            return exports.language === 'en';
        }
        Language.isDefault = isDefault;
    })(Language = exports.Language || (exports.Language = {}));
    /**
     * The OS locale or the locale specified by --locale. The format of
     * the string is all lower case (e.g. zh-tw for Traditional
     * Chinese). The UI is not necessarily shown in the provided locale.
     */
    exports.locale = _locale;
    /**
     * The translatios that are available through language packs.
     */
    exports.translationsConfigFile = _translationsConfigFile;
    exports.setImmediate = (function defineSetImmediate() {
        if (exports.globals.setImmediate) {
            return exports.globals.setImmediate.bind(exports.globals);
        }
        if (typeof exports.globals.postMessage === 'function' && !exports.globals.importScripts) {
            let pending = [];
            exports.globals.addEventListener('message', (e) => {
                if (e.data && e.data.vscodeSetImmediateId) {
                    for (let i = 0, len = pending.length; i < len; i++) {
                        const candidate = pending[i];
                        if (candidate.id === e.data.vscodeSetImmediateId) {
                            pending.splice(i, 1);
                            candidate.callback();
                            return;
                        }
                    }
                }
            });
            let lastId = 0;
            return (callback) => {
                const myId = ++lastId;
                pending.push({
                    id: myId,
                    callback: callback
                });
                exports.globals.postMessage({ vscodeSetImmediateId: myId }, '*');
            };
        }
        if (typeof (nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.nextTick) === 'function') {
            return nodeProcess.nextTick.bind(nodeProcess);
        }
        const _promise = Promise.resolve();
        return (callback) => _promise.then(callback);
    })();
    var OperatingSystem;
    (function (OperatingSystem) {
        OperatingSystem[OperatingSystem["Windows"] = 1] = "Windows";
        OperatingSystem[OperatingSystem["Macintosh"] = 2] = "Macintosh";
        OperatingSystem[OperatingSystem["Linux"] = 3] = "Linux";
    })(OperatingSystem = exports.OperatingSystem || (exports.OperatingSystem = {}));
    exports.OS = (_isMacintosh || _isIOS ? 2 /* Macintosh */ : (_isWindows ? 1 /* Windows */ : 3 /* Linux */));
    let _isLittleEndian = true;
    let _isLittleEndianComputed = false;
    function isLittleEndian() {
        if (!_isLittleEndianComputed) {
            _isLittleEndianComputed = true;
            const test = new Uint8Array(2);
            test[0] = 1;
            test[1] = 2;
            const view = new Uint16Array(test.buffer);
            _isLittleEndian = (view[0] === (2 << 8) + 1);
        }
        return _isLittleEndian;
    }
    exports.isLittleEndian = isLittleEndian;
});
//# sourceMappingURL=platform.js.map