/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/nls!vs/workbench/services/extensions/node/extensionPoints", "vs/base/common/path", "vs/base/common/semver/semver", "vs/base/common/json", "vs/base/common/arrays", "vs/base/common/jsonErrorMessages", "vs/base/common/types", "vs/base/common/uri", "vs/base/node/pfs", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensionValidator", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/common/extensionPoints"], function (require, exports, fs, nls, path, semver, json, arrays, jsonErrorMessages_1, types, uri_1, pfs, extensionManagementUtil_1, extensionValidator_1, extensions_1, extensionPoints_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionScanner = exports.ExtensionScannerInput = void 0;
    const MANIFEST_FILE = 'package.json';
    class ExtensionManifestHandler {
        constructor(ourVersion, log, absoluteFolderPath, isBuiltin, isUnderDevelopment) {
            this._ourVersion = ourVersion;
            this._log = log;
            this._absoluteFolderPath = absoluteFolderPath;
            this._isBuiltin = isBuiltin;
            this._isUnderDevelopment = isUnderDevelopment;
            this._absoluteManifestPath = path.join(absoluteFolderPath, MANIFEST_FILE);
        }
    }
    class ExtensionManifestParser extends ExtensionManifestHandler {
        static _fastParseJSON(text, errors) {
            try {
                return JSON.parse(text);
            }
            catch (err) {
                // invalid JSON, let's get good errors
                return json.parse(text, errors);
            }
        }
        parse() {
            return fs.promises.readFile(this._absoluteManifestPath).then((manifestContents) => {
                var _a;
                const errors = [];
                const manifest = ExtensionManifestParser._fastParseJSON(manifestContents.toString(), errors);
                if (json.getNodeType(manifest) !== 'object') {
                    this._log.error(this._absoluteFolderPath, nls.localize(0, null, this._absoluteManifestPath));
                }
                else if (errors.length === 0) {
                    if (manifest.__metadata) {
                        manifest.uuid = manifest.__metadata.id;
                    }
                    manifest.isUserBuiltin = !!((_a = manifest.__metadata) === null || _a === void 0 ? void 0 : _a.isBuiltin);
                    delete manifest.__metadata;
                    return manifest;
                }
                else {
                    errors.forEach(e => {
                        this._log.error(this._absoluteFolderPath, nls.localize(1, null, this._absoluteManifestPath, e.offset, e.length, (0, jsonErrorMessages_1.getParseErrorMessage)(e.error)));
                    });
                }
                return null;
            }, (err) => {
                if (err.code === 'ENOENT') {
                    return null;
                }
                this._log.error(this._absoluteFolderPath, nls.localize(2, null, this._absoluteManifestPath, err.message));
                return null;
            });
        }
    }
    class ExtensionManifestNLSReplacer extends ExtensionManifestHandler {
        constructor(ourVersion, log, absoluteFolderPath, isBuiltin, isUnderDevelopment, nlsConfig) {
            super(ourVersion, log, absoluteFolderPath, isBuiltin, isUnderDevelopment);
            this._nlsConfig = nlsConfig;
        }
        replaceNLS(extensionDescription) {
            const reportErrors = (localized, errors) => {
                errors.forEach((error) => {
                    this._log.error(this._absoluteFolderPath, nls.localize(3, null, localized, (0, jsonErrorMessages_1.getParseErrorMessage)(error.error)));
                });
            };
            const reportInvalidFormat = (localized) => {
                this._log.error(this._absoluteFolderPath, nls.localize(4, null, localized));
            };
            let extension = path.extname(this._absoluteManifestPath);
            let basename = this._absoluteManifestPath.substr(0, this._absoluteManifestPath.length - extension.length);
            const translationId = `${extensionDescription.publisher}.${extensionDescription.name}`;
            let translationPath = this._nlsConfig.translations[translationId];
            let localizedMessages;
            if (translationPath) {
                localizedMessages = fs.promises.readFile(translationPath, 'utf8').then((content) => {
                    let errors = [];
                    let translationBundle = json.parse(content, errors);
                    if (errors.length > 0) {
                        reportErrors(translationPath, errors);
                        return { values: undefined, default: `${basename}.nls.json` };
                    }
                    else if (json.getNodeType(translationBundle) !== 'object') {
                        reportInvalidFormat(translationPath);
                        return { values: undefined, default: `${basename}.nls.json` };
                    }
                    else {
                        let values = translationBundle.contents ? translationBundle.contents.package : undefined;
                        return { values: values, default: `${basename}.nls.json` };
                    }
                }, (error) => {
                    return { values: undefined, default: `${basename}.nls.json` };
                });
            }
            else {
                localizedMessages = pfs.SymlinkSupport.existsFile(basename + '.nls' + extension).then(exists => {
                    if (!exists) {
                        return undefined;
                    }
                    return ExtensionManifestNLSReplacer.findMessageBundles(this._nlsConfig, basename).then((messageBundle) => {
                        if (!messageBundle.localized) {
                            return { values: undefined, default: messageBundle.original };
                        }
                        return fs.promises.readFile(messageBundle.localized, 'utf8').then(messageBundleContent => {
                            let errors = [];
                            let messages = json.parse(messageBundleContent, errors);
                            if (errors.length > 0) {
                                reportErrors(messageBundle.localized, errors);
                                return { values: undefined, default: messageBundle.original };
                            }
                            else if (json.getNodeType(messages) !== 'object') {
                                reportInvalidFormat(messageBundle.localized);
                                return { values: undefined, default: messageBundle.original };
                            }
                            return { values: messages, default: messageBundle.original };
                        }, (err) => {
                            return { values: undefined, default: messageBundle.original };
                        });
                    }, (err) => {
                        return undefined;
                    });
                });
            }
            return localizedMessages.then((localizedMessages) => {
                if (localizedMessages === undefined) {
                    return extensionDescription;
                }
                let errors = [];
                // resolveOriginalMessageBundle returns null if localizedMessages.default === undefined;
                return ExtensionManifestNLSReplacer.resolveOriginalMessageBundle(localizedMessages.default, errors).then((defaults) => {
                    if (errors.length > 0) {
                        reportErrors(localizedMessages.default, errors);
                        return extensionDescription;
                    }
                    else if (json.getNodeType(localizedMessages) !== 'object') {
                        reportInvalidFormat(localizedMessages.default);
                        return extensionDescription;
                    }
                    const localized = localizedMessages.values || Object.create(null);
                    ExtensionManifestNLSReplacer._replaceNLStrings(this._nlsConfig, extensionDescription, localized, defaults, this._log, this._absoluteFolderPath);
                    return extensionDescription;
                });
            }, (err) => {
                return extensionDescription;
            });
        }
        /**
         * Parses original message bundle, returns null if the original message bundle is null.
         */
        static resolveOriginalMessageBundle(originalMessageBundle, errors) {
            return new Promise((c, e) => {
                if (originalMessageBundle) {
                    fs.promises.readFile(originalMessageBundle).then(originalBundleContent => {
                        c(json.parse(originalBundleContent.toString(), errors));
                    }, (err) => {
                        c(null);
                    });
                }
                else {
                    c(null);
                }
            });
        }
        /**
         * Finds localized message bundle and the original (unlocalized) one.
         * If the localized file is not present, returns null for the original and marks original as localized.
         */
        static findMessageBundles(nlsConfig, basename) {
            return new Promise((c, e) => {
                function loop(basename, locale) {
                    let toCheck = `${basename}.nls.${locale}.json`;
                    pfs.SymlinkSupport.existsFile(toCheck).then(exists => {
                        if (exists) {
                            c({ localized: toCheck, original: `${basename}.nls.json` });
                        }
                        let index = locale.lastIndexOf('-');
                        if (index === -1) {
                            c({ localized: `${basename}.nls.json`, original: null });
                        }
                        else {
                            locale = locale.substring(0, index);
                            loop(basename, locale);
                        }
                    });
                }
                if (nlsConfig.devMode || nlsConfig.pseudo || !nlsConfig.locale) {
                    return c({ localized: basename + '.nls.json', original: null });
                }
                loop(basename, nlsConfig.locale);
            });
        }
        /**
         * This routine makes the following assumptions:
         * The root element is an object literal
         */
        static _replaceNLStrings(nlsConfig, literal, messages, originalMessages, log, messageScope) {
            function processEntry(obj, key, command) {
                let value = obj[key];
                if (types.isString(value)) {
                    let str = value;
                    let length = str.length;
                    if (length > 1 && str[0] === '%' && str[length - 1] === '%') {
                        let messageKey = str.substr(1, length - 2);
                        let message = messages[messageKey];
                        // If the messages come from a language pack they might miss some keys
                        // Fill them from the original messages.
                        if (message === undefined && originalMessages) {
                            message = originalMessages[messageKey];
                        }
                        if (message) {
                            if (nlsConfig.pseudo) {
                                // FF3B and FF3D is the Unicode zenkaku representation for [ and ]
                                message = '\uFF3B' + message.replace(/[aouei]/g, '$&$&') + '\uFF3D';
                            }
                            obj[key] = command && (key === 'title' || key === 'category') && originalMessages ? { value: message, original: originalMessages[messageKey] } : message;
                        }
                        else {
                            log.warn(messageScope, nls.localize(5, null, messageKey));
                        }
                    }
                }
                else if (types.isObject(value)) {
                    for (let k in value) {
                        if (value.hasOwnProperty(k)) {
                            k === 'commands' ? processEntry(value, k, true) : processEntry(value, k, command);
                        }
                    }
                }
                else if (types.isArray(value)) {
                    for (let i = 0; i < value.length; i++) {
                        processEntry(value, i, command);
                    }
                }
            }
            for (let key in literal) {
                if (literal.hasOwnProperty(key)) {
                    processEntry(literal, key);
                }
            }
        }
    }
    class ExtensionManifestValidator extends ExtensionManifestHandler {
        validate(_extensionDescription) {
            let extensionDescription = _extensionDescription;
            extensionDescription.isBuiltin = this._isBuiltin;
            extensionDescription.isUserBuiltin = !this._isBuiltin && !!extensionDescription.isUserBuiltin;
            extensionDescription.isUnderDevelopment = this._isUnderDevelopment;
            let notices = [];
            if (!ExtensionManifestValidator.isValidExtensionDescription(this._ourVersion, this._absoluteFolderPath, extensionDescription, notices)) {
                notices.forEach((error) => {
                    this._log.error(this._absoluteFolderPath, error);
                });
                return null;
            }
            // in this case the notices are warnings
            notices.forEach((error) => {
                this._log.warn(this._absoluteFolderPath, error);
            });
            // allow publisher to be undefined to make the initial extension authoring experience smoother
            if (!extensionDescription.publisher) {
                extensionDescription.publisher = 'undefined_publisher';
            }
            // id := `publisher.name`
            extensionDescription.id = (0, extensionManagementUtil_1.getExtensionId)(extensionDescription.publisher, extensionDescription.name);
            extensionDescription.identifier = new extensions_1.ExtensionIdentifier(extensionDescription.id);
            extensionDescription.extensionLocation = uri_1.URI.file(this._absoluteFolderPath);
            return extensionDescription;
        }
        static isValidExtensionDescription(version, extensionFolderPath, extensionDescription, notices) {
            if (!ExtensionManifestValidator.baseIsValidExtensionDescription(extensionFolderPath, extensionDescription, notices)) {
                return false;
            }
            if (!semver.valid(extensionDescription.version)) {
                notices.push(nls.localize(6, null));
                return false;
            }
            return (0, extensionValidator_1.isValidExtensionVersion)(version, extensionDescription, notices);
        }
        static baseIsValidExtensionDescription(extensionFolderPath, extensionDescription, notices) {
            if (!extensionDescription) {
                notices.push(nls.localize(7, null));
                return false;
            }
            if (typeof extensionDescription.publisher !== 'undefined' && typeof extensionDescription.publisher !== 'string') {
                notices.push(nls.localize(8, null));
                return false;
            }
            if (typeof extensionDescription.name !== 'string') {
                notices.push(nls.localize(9, null, 'name'));
                return false;
            }
            if (typeof extensionDescription.version !== 'string') {
                notices.push(nls.localize(10, null, 'version'));
                return false;
            }
            if (!extensionDescription.engines) {
                notices.push(nls.localize(11, null, 'engines'));
                return false;
            }
            if (typeof extensionDescription.engines.vscode !== 'string') {
                notices.push(nls.localize(12, null, 'engines.vscode'));
                return false;
            }
            if (typeof extensionDescription.extensionDependencies !== 'undefined') {
                if (!ExtensionManifestValidator._isStringArray(extensionDescription.extensionDependencies)) {
                    notices.push(nls.localize(13, null, 'extensionDependencies'));
                    return false;
                }
            }
            if (typeof extensionDescription.activationEvents !== 'undefined') {
                if (!ExtensionManifestValidator._isStringArray(extensionDescription.activationEvents)) {
                    notices.push(nls.localize(14, null, 'activationEvents'));
                    return false;
                }
                if (typeof extensionDescription.main === 'undefined' && typeof extensionDescription.browser === 'undefined') {
                    notices.push(nls.localize(15, null, 'activationEvents', 'main'));
                    return false;
                }
            }
            if (typeof extensionDescription.main !== 'undefined') {
                if (typeof extensionDescription.main !== 'string') {
                    notices.push(nls.localize(16, null, 'main'));
                    return false;
                }
                else {
                    const normalizedAbsolutePath = path.join(extensionFolderPath, extensionDescription.main);
                    if (!normalizedAbsolutePath.startsWith(extensionFolderPath)) {
                        notices.push(nls.localize(17, null, normalizedAbsolutePath, extensionFolderPath));
                        // not a failure case
                    }
                }
                if (typeof extensionDescription.activationEvents === 'undefined') {
                    notices.push(nls.localize(18, null, 'activationEvents', 'main'));
                    return false;
                }
            }
            if (typeof extensionDescription.browser !== 'undefined') {
                if (typeof extensionDescription.browser !== 'string') {
                    notices.push(nls.localize(19, null, 'browser'));
                    return false;
                }
                else {
                    const normalizedAbsolutePath = path.join(extensionFolderPath, extensionDescription.browser);
                    if (!normalizedAbsolutePath.startsWith(extensionFolderPath)) {
                        notices.push(nls.localize(20, null, normalizedAbsolutePath, extensionFolderPath));
                        // not a failure case
                    }
                }
                if (typeof extensionDescription.activationEvents === 'undefined') {
                    notices.push(nls.localize(21, null, 'activationEvents', 'browser'));
                    return false;
                }
            }
            return true;
        }
        static _isStringArray(arr) {
            if (!Array.isArray(arr)) {
                return false;
            }
            for (let i = 0, len = arr.length; i < len; i++) {
                if (typeof arr[i] !== 'string') {
                    return false;
                }
            }
            return true;
        }
    }
    class ExtensionScannerInput {
        constructor(ourVersion, commit, locale, devMode, absoluteFolderPath, isBuiltin, isUnderDevelopment, translations) {
            this.ourVersion = ourVersion;
            this.commit = commit;
            this.locale = locale;
            this.devMode = devMode;
            this.absoluteFolderPath = absoluteFolderPath;
            this.isBuiltin = isBuiltin;
            this.isUnderDevelopment = isUnderDevelopment;
            this.translations = translations;
            // Keep empty!! (JSON.parse)
        }
        static createNLSConfig(input) {
            return {
                devMode: input.devMode,
                locale: input.locale,
                pseudo: input.locale === 'pseudo',
                translations: input.translations
            };
        }
        static equals(a, b) {
            return (a.ourVersion === b.ourVersion
                && a.commit === b.commit
                && a.locale === b.locale
                && a.devMode === b.devMode
                && a.absoluteFolderPath === b.absoluteFolderPath
                && a.isBuiltin === b.isBuiltin
                && a.isUnderDevelopment === b.isUnderDevelopment
                && a.mtime === b.mtime
                && extensionPoints_1.Translations.equals(a.translations, b.translations));
        }
    }
    exports.ExtensionScannerInput = ExtensionScannerInput;
    class DefaultExtensionResolver {
        constructor(root) {
            this.root = root;
        }
        resolveExtensions() {
            return pfs.readDirsInDir(this.root)
                .then(folders => folders.map(name => ({ name, path: path.join(this.root, name) })));
        }
    }
    class ExtensionScanner {
        /**
         * Read the extension defined in `absoluteFolderPath`
         */
        static scanExtension(version, log, absoluteFolderPath, isBuiltin, isUnderDevelopment, nlsConfig) {
            absoluteFolderPath = path.normalize(absoluteFolderPath);
            let parser = new ExtensionManifestParser(version, log, absoluteFolderPath, isBuiltin, isUnderDevelopment);
            return parser.parse().then((extensionDescription) => {
                if (extensionDescription === null) {
                    return null;
                }
                let nlsReplacer = new ExtensionManifestNLSReplacer(version, log, absoluteFolderPath, isBuiltin, isUnderDevelopment, nlsConfig);
                return nlsReplacer.replaceNLS(extensionDescription);
            }).then((extensionDescription) => {
                if (extensionDescription === null) {
                    return null;
                }
                let validator = new ExtensionManifestValidator(version, log, absoluteFolderPath, isBuiltin, isUnderDevelopment);
                return validator.validate(extensionDescription);
            });
        }
        /**
         * Scan a list of extensions defined in `absoluteFolderPath`
         */
        static async scanExtensions(input, log, resolver = null) {
            const absoluteFolderPath = input.absoluteFolderPath;
            const isBuiltin = input.isBuiltin;
            const isUnderDevelopment = input.isUnderDevelopment;
            if (!resolver) {
                resolver = new DefaultExtensionResolver(absoluteFolderPath);
            }
            try {
                let obsolete = {};
                if (!isBuiltin) {
                    try {
                        const obsoleteFileContents = await fs.promises.readFile(path.join(absoluteFolderPath, '.obsolete'), 'utf8');
                        obsolete = JSON.parse(obsoleteFileContents);
                    }
                    catch (err) {
                        // Don't care
                    }
                }
                let refs = await resolver.resolveExtensions();
                // Ensure the same extension order
                refs.sort((a, b) => a.name < b.name ? -1 : 1);
                if (!isBuiltin) {
                    refs = refs.filter(ref => ref.name.indexOf('.') !== 0); // Do not consider user extension folder starting with `.`
                }
                const nlsConfig = ExtensionScannerInput.createNLSConfig(input);
                let _extensionDescriptions = await Promise.all(refs.map(r => this.scanExtension(input.ourVersion, log, r.path, isBuiltin, isUnderDevelopment, nlsConfig)));
                let extensionDescriptions = arrays.coalesce(_extensionDescriptions);
                extensionDescriptions = extensionDescriptions.filter(item => item !== null && !obsolete[new extensionManagementUtil_1.ExtensionIdentifierWithVersion({ id: (0, extensionManagementUtil_1.getGalleryExtensionId)(item.publisher, item.name) }, item.version).key()]);
                if (!isBuiltin) {
                    // Filter out outdated extensions
                    const byExtension = (0, extensionManagementUtil_1.groupByExtension)(extensionDescriptions, e => ({ id: e.identifier.value, uuid: e.uuid }));
                    extensionDescriptions = byExtension.map(p => p.sort((a, b) => semver.rcompare(a.version, b.version))[0]);
                }
                extensionDescriptions.sort((a, b) => {
                    if (a.extensionLocation.fsPath < b.extensionLocation.fsPath) {
                        return -1;
                    }
                    return 1;
                });
                return extensionDescriptions;
            }
            catch (err) {
                log.error(absoluteFolderPath, err);
                return [];
            }
        }
        /**
         * Combination of scanExtension and scanExtensions: If an extension manifest is found at root, we load just this extension,
         * otherwise we assume the folder contains multiple extensions.
         */
        static scanOneOrMultipleExtensions(input, log) {
            const absoluteFolderPath = input.absoluteFolderPath;
            const isBuiltin = input.isBuiltin;
            const isUnderDevelopment = input.isUnderDevelopment;
            return pfs.SymlinkSupport.existsFile(path.join(absoluteFolderPath, MANIFEST_FILE)).then((exists) => {
                if (exists) {
                    const nlsConfig = ExtensionScannerInput.createNLSConfig(input);
                    return this.scanExtension(input.ourVersion, log, absoluteFolderPath, isBuiltin, isUnderDevelopment, nlsConfig).then((extensionDescription) => {
                        if (extensionDescription === null) {
                            return [];
                        }
                        return [extensionDescription];
                    });
                }
                return this.scanExtensions(input, log);
            }, (err) => {
                log.error(absoluteFolderPath, err);
                return [];
            });
        }
        static scanSingleExtension(input, log) {
            const absoluteFolderPath = input.absoluteFolderPath;
            const isBuiltin = input.isBuiltin;
            const isUnderDevelopment = input.isUnderDevelopment;
            const nlsConfig = ExtensionScannerInput.createNLSConfig(input);
            return this.scanExtension(input.ourVersion, log, absoluteFolderPath, isBuiltin, isUnderDevelopment, nlsConfig);
        }
        static mergeBuiltinExtensions(builtinExtensions, extraBuiltinExtensions) {
            return Promise.all([builtinExtensions, extraBuiltinExtensions]).then(([builtinExtensions, extraBuiltinExtensions]) => {
                let resultMap = Object.create(null);
                for (let i = 0, len = builtinExtensions.length; i < len; i++) {
                    resultMap[extensions_1.ExtensionIdentifier.toKey(builtinExtensions[i].identifier)] = builtinExtensions[i];
                }
                // Overwrite with extensions found in extra
                for (let i = 0, len = extraBuiltinExtensions.length; i < len; i++) {
                    resultMap[extensions_1.ExtensionIdentifier.toKey(extraBuiltinExtensions[i].identifier)] = extraBuiltinExtensions[i];
                }
                let resultArr = Object.keys(resultMap).map((id) => resultMap[id]);
                resultArr.sort((a, b) => {
                    const aLastSegment = path.basename(a.extensionLocation.fsPath);
                    const bLastSegment = path.basename(b.extensionLocation.fsPath);
                    if (aLastSegment < bLastSegment) {
                        return -1;
                    }
                    if (aLastSegment > bLastSegment) {
                        return 1;
                    }
                    return 0;
                });
                return resultArr;
            });
        }
    }
    exports.ExtensionScanner = ExtensionScanner;
});
//# sourceMappingURL=extensionPoints.js.map