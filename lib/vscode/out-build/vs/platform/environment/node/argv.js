/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "minimist", "vs/nls!vs/platform/environment/node/argv", "vs/base/common/platform"], function (require, exports, minimist, nls_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildVersionMessage = exports.buildHelpMessage = exports.formatOptions = exports.parseArgs = exports.OPTIONS = void 0;
    /**
     * This code is also used by standalone cli's. Avoid adding any other dependencies.
     */
    const helpCategories = {
        o: (0, nls_1.localize)(0, null),
        e: (0, nls_1.localize)(1, null),
        t: (0, nls_1.localize)(2, null)
    };
    exports.OPTIONS = {
        'diff': { type: 'boolean', cat: 'o', alias: 'd', args: ['file', 'file'], description: (0, nls_1.localize)(3, null) },
        'add': { type: 'boolean', cat: 'o', alias: 'a', args: 'folder', description: (0, nls_1.localize)(4, null) },
        'goto': { type: 'boolean', cat: 'o', alias: 'g', args: 'file:line[:character]', description: (0, nls_1.localize)(5, null) },
        'new-window': { type: 'boolean', cat: 'o', alias: 'n', description: (0, nls_1.localize)(6, null) },
        'reuse-window': { type: 'boolean', cat: 'o', alias: 'r', description: (0, nls_1.localize)(7, null) },
        'wait': { type: 'boolean', cat: 'o', alias: 'w', description: (0, nls_1.localize)(8, null) },
        'waitMarkerFilePath': { type: 'string' },
        'locale': { type: 'string', cat: 'o', args: 'locale', description: (0, nls_1.localize)(9, null) },
        'user-data-dir': { type: 'string', cat: 'o', args: 'dir', description: (0, nls_1.localize)(10, null) },
        'help': { type: 'boolean', cat: 'o', alias: 'h', description: (0, nls_1.localize)(11, null) },
        'extensions-dir': { type: 'string', deprecates: 'extensionHomePath', cat: 'e', args: 'dir', description: (0, nls_1.localize)(12, null) },
        'extensions-download-dir': { type: 'string' },
        'builtin-extensions-dir': { type: 'string' },
        'extra-builtin-extensions-dir': { type: 'string[]', cat: 'o', description: 'Path to an extra builtin extension directory.' },
        'extra-extensions-dir': { type: 'string[]', cat: 'o', description: 'Path to an extra user extension directory.' },
        'list-extensions': { type: 'boolean', cat: 'e', description: (0, nls_1.localize)(13, null) },
        'show-versions': { type: 'boolean', cat: 'e', description: (0, nls_1.localize)(14, null) },
        'category': { type: 'string', cat: 'e', description: (0, nls_1.localize)(15, null) },
        'install-extension': { type: 'string[]', cat: 'e', args: 'extension-id[@version] | path-to-vsix', description: (0, nls_1.localize)(16, null) },
        'uninstall-extension': { type: 'string[]', cat: 'e', args: 'extension-id', description: (0, nls_1.localize)(17, null) },
        'enable-proposed-api': { type: 'string[]', cat: 'e', args: 'extension-id', description: (0, nls_1.localize)(18, null) },
        'version': { type: 'boolean', cat: 't', alias: 'v', description: (0, nls_1.localize)(19, null) },
        'verbose': { type: 'boolean', cat: 't', description: (0, nls_1.localize)(20, null) },
        'log': { type: 'string', cat: 't', args: 'level', description: (0, nls_1.localize)(21, null) },
        'status': { type: 'boolean', alias: 's', cat: 't', description: (0, nls_1.localize)(22, null) },
        'prof-startup': { type: 'boolean', cat: 't', description: (0, nls_1.localize)(23, null) },
        'prof-append-timers': { type: 'string' },
        'prof-startup-prefix': { type: 'string' },
        'prof-v8-extensions': { type: 'boolean' },
        'disable-extensions': { type: 'boolean', deprecates: 'disableExtensions', cat: 't', description: (0, nls_1.localize)(24, null) },
        'disable-extension': { type: 'string[]', cat: 't', args: 'extension-id', description: (0, nls_1.localize)(25, null) },
        'sync': { type: 'string', cat: 't', description: (0, nls_1.localize)(26, null), args: ['on', 'off'] },
        'inspect-extensions': { type: 'string', deprecates: 'debugPluginHost', args: 'port', cat: 't', description: (0, nls_1.localize)(27, null) },
        'inspect-brk-extensions': { type: 'string', deprecates: 'debugBrkPluginHost', args: 'port', cat: 't', description: (0, nls_1.localize)(28, null) },
        'disable-gpu': { type: 'boolean', cat: 't', description: (0, nls_1.localize)(29, null) },
        'max-memory': { type: 'string', cat: 't', description: (0, nls_1.localize)(30, null) },
        'telemetry': { type: 'boolean', cat: 't', description: (0, nls_1.localize)(31, null) },
        'remote': { type: 'string' },
        'folder-uri': { type: 'string[]', cat: 'o', args: 'uri' },
        'file-uri': { type: 'string[]', cat: 'o', args: 'uri' },
        'locate-extension': { type: 'string[]' },
        'extensionDevelopmentPath': { type: 'string[]' },
        'extensionDevelopmentKind': { type: 'string[]' },
        'extensionTestsPath': { type: 'string' },
        'debugId': { type: 'string' },
        'debugRenderer': { type: 'boolean' },
        'inspect-search': { type: 'string', deprecates: 'debugSearch' },
        'inspect-brk-search': { type: 'string', deprecates: 'debugBrkSearch' },
        'export-default-configuration': { type: 'string' },
        'install-source': { type: 'string' },
        'driver': { type: 'string' },
        'logExtensionHostCommunication': { type: 'boolean' },
        'skip-release-notes': { type: 'boolean' },
        'disable-telemetry': { type: 'boolean' },
        'disable-updates': { type: 'boolean' },
        'disable-keytar': { type: 'boolean' },
        'disable-crash-reporter': { type: 'boolean' },
        'crash-reporter-directory': { type: 'string' },
        'crash-reporter-id': { type: 'string' },
        'skip-add-to-recently-opened': { type: 'boolean' },
        'unity-launch': { type: 'boolean' },
        'open-url': { type: 'boolean' },
        'file-write': { type: 'boolean' },
        'file-chmod': { type: 'boolean' },
        'driver-verbose': { type: 'boolean' },
        'install-builtin-extension': { type: 'string[]' },
        'force': { type: 'boolean' },
        'do-not-sync': { type: 'boolean' },
        'trace': { type: 'boolean' },
        'trace-category-filter': { type: 'string' },
        'trace-options': { type: 'string' },
        'force-user-env': { type: 'boolean' },
        'force-disable-user-env': { type: 'boolean' },
        'open-devtools': { type: 'boolean' },
        '__sandbox': { type: 'boolean' },
        'logsPath': { type: 'string' },
        // chromium flags
        'no-proxy-server': { type: 'boolean' },
        'proxy-server': { type: 'string' },
        'proxy-bypass-list': { type: 'string' },
        'proxy-pac-url': { type: 'string' },
        'js-flags': { type: 'string' },
        'inspect': { type: 'string' },
        'inspect-brk': { type: 'string' },
        'nolazy': { type: 'boolean' },
        'force-device-scale-factor': { type: 'string' },
        'force-renderer-accessibility': { type: 'boolean' },
        'ignore-certificate-errors': { type: 'boolean' },
        'allow-insecure-localhost': { type: 'boolean' },
        'log-net-log': { type: 'string' },
        'vmodule': { type: 'string' },
        '_urls': { type: 'string[]' },
        _: { type: 'string[]' } // main arguments
    };
    const ignoringReporter = {
        onUnknownOption: () => { },
        onMultipleValues: () => { }
    };
    function parseArgs(args, options, errorReporter = ignoringReporter) {
        const alias = {};
        const string = [];
        const boolean = [];
        for (let optionId in options) {
            const o = options[optionId];
            if (o.alias) {
                alias[optionId] = o.alias;
            }
            if (o.type === 'string' || o.type === 'string[]') {
                string.push(optionId);
                if (o.deprecates) {
                    string.push(o.deprecates);
                }
            }
            else if (o.type === 'boolean') {
                boolean.push(optionId);
                if (o.deprecates) {
                    boolean.push(o.deprecates);
                }
            }
        }
        // remove aliases to avoid confusion
        const parsedArgs = minimist(args, { string, boolean, alias });
        const cleanedArgs = {};
        const remainingArgs = parsedArgs;
        // https://github.com/microsoft/vscode/issues/58177, https://github.com/microsoft/vscode/issues/106617
        cleanedArgs._ = parsedArgs._.map(arg => String(arg)).filter(arg => arg.length > 0);
        delete remainingArgs._;
        for (let optionId in options) {
            const o = options[optionId];
            if (o.alias) {
                delete remainingArgs[o.alias];
            }
            let val = remainingArgs[optionId];
            if (o.deprecates && remainingArgs.hasOwnProperty(o.deprecates)) {
                if (!val) {
                    val = remainingArgs[o.deprecates];
                }
                delete remainingArgs[o.deprecates];
            }
            if (typeof val !== 'undefined') {
                if (o.type === 'string[]') {
                    if (val && !Array.isArray(val)) {
                        val = [val];
                    }
                }
                else if (o.type === 'string') {
                    if (Array.isArray(val)) {
                        val = val.pop(); // take the last
                        errorReporter.onMultipleValues(optionId, val);
                    }
                }
                cleanedArgs[optionId] = val;
            }
            delete remainingArgs[optionId];
        }
        for (let key in remainingArgs) {
            errorReporter.onUnknownOption(key);
        }
        return cleanedArgs;
    }
    exports.parseArgs = parseArgs;
    function formatUsage(optionId, option) {
        let args = '';
        if (option.args) {
            if (Array.isArray(option.args)) {
                args = ` <${option.args.join('> <')}>`;
            }
            else {
                args = ` <${option.args}>`;
            }
        }
        if (option.alias) {
            return `-${option.alias} --${optionId}${args}`;
        }
        return `--${optionId}${args}`;
    }
    // exported only for testing
    function formatOptions(options, columns) {
        let maxLength = 0;
        let usageTexts = [];
        for (const optionId in options) {
            const o = options[optionId];
            const usageText = formatUsage(optionId, o);
            maxLength = Math.max(maxLength, usageText.length);
            usageTexts.push([usageText, o.description]);
        }
        let argLength = maxLength + 2 /*left padding*/ + 1 /*right padding*/;
        if (columns - argLength < 25) {
            // Use a condensed version on narrow terminals
            return usageTexts.reduce((r, ut) => r.concat([`  ${ut[0]}`, `      ${ut[1]}`]), []);
        }
        let descriptionColumns = columns - argLength - 1;
        let result = [];
        for (const ut of usageTexts) {
            let usage = ut[0];
            let wrappedDescription = wrapText(ut[1], descriptionColumns);
            let keyPadding = indent(argLength - usage.length - 2 /*left padding*/);
            result.push('  ' + usage + keyPadding + wrappedDescription[0]);
            for (let i = 1; i < wrappedDescription.length; i++) {
                result.push(indent(argLength) + wrappedDescription[i]);
            }
        }
        return result;
    }
    exports.formatOptions = formatOptions;
    function indent(count) {
        return ' '.repeat(count);
    }
    function wrapText(text, columns) {
        let lines = [];
        while (text.length) {
            let index = text.length < columns ? text.length : text.lastIndexOf(' ', columns);
            let line = text.slice(0, index).trim();
            text = text.slice(index);
            lines.push(line);
        }
        return lines;
    }
    function buildHelpMessage(productName, executableName, version, options, isPipeSupported = true) {
        const columns = (process.stdout).isTTY && (process.stdout).columns || 80;
        let help = [`${productName} ${version}`];
        help.push('');
        help.push(`${(0, nls_1.localize)(32, null)}: ${executableName} [${(0, nls_1.localize)(33, null)}][${(0, nls_1.localize)(34, null)}...]`);
        help.push('');
        if (isPipeSupported) {
            if (platform_1.isWindows) {
                help.push((0, nls_1.localize)(35, null, executableName));
            }
            else {
                help.push((0, nls_1.localize)(36, null, executableName));
            }
            help.push('');
        }
        const optionsByCategory = {};
        for (const optionId in options) {
            const o = options[optionId];
            if (o.description && o.cat) {
                let optionsByCat = optionsByCategory[o.cat];
                if (!optionsByCat) {
                    optionsByCategory[o.cat] = optionsByCat = {};
                }
                optionsByCat[optionId] = o;
            }
        }
        for (let helpCategoryKey in optionsByCategory) {
            const key = helpCategoryKey;
            let categoryOptions = optionsByCategory[key];
            if (categoryOptions) {
                help.push(helpCategories[key]);
                help.push(...formatOptions(categoryOptions, columns));
                help.push('');
            }
        }
        return help.join('\n');
    }
    exports.buildHelpMessage = buildHelpMessage;
    function buildVersionMessage(version, commit) {
        return `${version || (0, nls_1.localize)(37, null)}\n${commit || (0, nls_1.localize)(38, null)}\n${process.arch}`;
    }
    exports.buildVersionMessage = buildVersionMessage;
});
//# sourceMappingURL=argv.js.map