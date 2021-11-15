define(["require", "exports", "fs", "path", "util", "vs/base/common/network", "vs/base/node/languagePacks", "vs/platform/product/common/product"], function (require, exports, fs, path, util, network_1, lp, product_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLocaleFromConfig = exports.getTranslations = exports.getNlsConfiguration = exports.isInternalConfiguration = void 0;
    const configurations = new Map();
    const metadataPath = path.join(network_1.FileAccess.asFileUri('', require).fsPath, 'nls.metadata.json');
    const isInternalConfiguration = (config) => {
        return config && !!config._languagePackId;
    };
    exports.isInternalConfiguration = isInternalConfiguration;
    const DefaultConfiguration = {
        locale: 'en',
        availableLanguages: {},
    };
    const getNlsConfiguration = async (locale, userDataPath) => {
        const id = `${locale}: ${userDataPath}`;
        if (!configurations.has(id)) {
            configurations.set(id, new Promise(async (resolve) => {
                const config = product_1.default.commit && await util.promisify(fs.exists)(metadataPath)
                    ? await lp.getNLSConfiguration(product_1.default.commit, userDataPath, metadataPath, locale)
                    : DefaultConfiguration;
                if ((0, exports.isInternalConfiguration)(config)) {
                    config._languagePackSupport = true;
                }
                // If the configuration has no results keep trying since code-server
                // doesn't restart when a language is installed so this result would
                // persist (the plugin might not be installed yet or something).
                if (config.locale !== 'en' && config.locale !== 'en-us' && Object.keys(config.availableLanguages).length === 0) {
                    configurations.delete(id);
                }
                resolve(config);
            }));
        }
        return configurations.get(id);
    };
    exports.getNlsConfiguration = getNlsConfiguration;
    const getTranslations = async (locale, userDataPath) => {
        const config = await (0, exports.getNlsConfiguration)(locale, userDataPath);
        if ((0, exports.isInternalConfiguration)(config)) {
            try {
                return JSON.parse(await util.promisify(fs.readFile)(config._translationsConfigFile, 'utf8'));
            }
            catch (error) { /* Nothing yet. */ }
        }
        return {};
    };
    exports.getTranslations = getTranslations;
    const getLocaleFromConfig = async (userDataPath) => {
        const files = ['locale.json', 'argv.json'];
        for (let i = 0; i < files.length; ++i) {
            try {
                const localeConfigUri = path.join(userDataPath, 'User', files[i]);
                const content = stripComments(await util.promisify(fs.readFile)(localeConfigUri, 'utf8'));
                return JSON.parse(content).locale;
            }
            catch (error) { /* Ignore. */ }
        }
        return 'en';
    };
    exports.getLocaleFromConfig = getLocaleFromConfig;
    // Taken from src/main.js in the main VS Code source.
    const stripComments = (content) => {
        const regexp = /('(?:[^\\']*(?:\\.)?)*')|('(?:[^\\']*(?:\\.)?)*')|(\/\*(?:\r?\n|.)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))/g;
        return content.replace(regexp, (match, _m1, _m2, m3, m4) => {
            // Only one of m1, m2, m3, m4 matches
            if (m3) {
                // A block comment. Replace with nothing
                return '';
            }
            else if (m4) {
                // A line comment. If it ends in \r?\n then keep it.
                const length_1 = m4.length;
                if (length_1 > 2 && m4[length_1 - 1] === '\n') {
                    return m4[length_1 - 2] === '\r' ? '\r\n' : '\n';
                }
                else {
                    return '';
                }
            }
            else {
                // We match a string
                return match;
            }
        });
    };
});
//# sourceMappingURL=nls.js.map