/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/path", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, glob, path_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookProviderInfo = void 0;
    class NotebookProviderInfo {
        constructor(descriptor) {
            var _a;
            this.id = descriptor.id;
            this.displayName = descriptor.displayName;
            this._selectors = ((_a = descriptor.selectors) === null || _a === void 0 ? void 0 : _a.map(selector => ({
                include: selector.filenamePattern,
                exclude: selector.excludeFileNamePattern || ''
            }))) || [];
            this.priority = descriptor.priority;
            this.providerExtensionId = descriptor.providerExtensionId;
            this.providerDescription = descriptor.providerDescription;
            this.providerDisplayName = descriptor.providerDisplayName;
            this.providerExtensionLocation = descriptor.providerExtensionLocation;
            this.dynamicContribution = descriptor.dynamicContribution;
            this.exclusive = descriptor.exclusive;
            this._options = {
                transientCellMetadata: {},
                transientDocumentMetadata: {},
                transientOutputs: false
            };
        }
        get selectors() {
            return this._selectors;
        }
        get options() {
            return this._options;
        }
        update(args) {
            if (args.selectors) {
                this._selectors = args.selectors;
            }
            if (args.options) {
                this._options = args.options;
            }
        }
        matches(resource) {
            var _a;
            return (_a = this.selectors) === null || _a === void 0 ? void 0 : _a.some(selector => NotebookProviderInfo.selectorMatches(selector, resource));
        }
        static selectorMatches(selector, resource) {
            if (typeof selector === 'string') {
                // filenamePattern
                if (glob.match(selector.toLowerCase(), (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                    return true;
                }
            }
            if (glob.isRelativePattern(selector)) {
                if (glob.match(selector, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                    return true;
                }
            }
            if (!(0, notebookCommon_1.isDocumentExcludePattern)(selector)) {
                return false;
            }
            let filenamePattern = selector.include;
            let excludeFilenamePattern = selector.exclude;
            if (glob.match(filenamePattern, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                if (excludeFilenamePattern) {
                    if (glob.match(excludeFilenamePattern, (0, path_1.basename)(resource.fsPath).toLowerCase())) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
    }
    exports.NotebookProviderInfo = NotebookProviderInfo;
});
//# sourceMappingURL=notebookProvider.js.map