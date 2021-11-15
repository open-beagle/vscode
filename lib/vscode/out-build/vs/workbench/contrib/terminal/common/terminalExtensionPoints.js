/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/extensions/common/extensionsRegistry", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/arrays", "vs/platform/instantiation/common/instantiation"], function (require, exports, extensionsRegistry, terminal_1, arrays_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalContributionService = exports.ITerminalContributionService = exports.terminalsExtPoint = void 0;
    // terminal extension point
    exports.terminalsExtPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint(terminal_1.terminalContributionsDescriptor);
    exports.ITerminalContributionService = (0, instantiation_1.createDecorator)('terminalContributionsService');
    class TerminalContributionService {
        constructor() {
            this._serviceBrand = undefined;
            this._terminalTypes = [];
            exports.terminalsExtPoint.setHandler(contributions => {
                this._terminalTypes = (0, arrays_1.flatten)(contributions.filter(c => c.description.enableProposedApi).map(c => {
                    var _a, _b;
                    return ((_b = (_a = c.value) === null || _a === void 0 ? void 0 : _a.types) === null || _b === void 0 ? void 0 : _b.map(e => {
                        // TODO: Remove after adoption in js-debug
                        if (!e.icon && c.description.identifier.value === 'ms-vscode.js-debug') {
                            e.icon = '$(debug)';
                        }
                        // Only support $(id) for now, without that it should point to a path to be
                        // consistent with other icon APIs
                        if (e.icon && e.icon.startsWith('$(') && e.icon.endsWith(')')) {
                            e.icon = e.icon.substr(2, e.icon.length - 3);
                        }
                        else {
                            e.icon = undefined;
                        }
                        return e;
                    })) || [];
                }));
            });
        }
        get terminalTypes() {
            return this._terminalTypes;
        }
    }
    exports.TerminalContributionService = TerminalContributionService;
});
//# sourceMappingURL=terminalExtensionPoints.js.map