/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/nls!vs/workbench/contrib/notebook/browser/notebookIcons", "vs/platform/theme/common/iconRegistry"], function (require, exports, codicons_1, nls_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mimetypeIcon = exports.renderOutputIcon = exports.revertIcon = exports.openAsTextIcon = exports.expandedIcon = exports.collapsedIcon = exports.executingStateIcon = exports.pendingStateIcon = exports.errorStateIcon = exports.successStateIcon = exports.unfoldIcon = exports.splitCellIcon = exports.clearIcon = exports.moveDownIcon = exports.moveUpIcon = exports.stopEditIcon = exports.editIcon = exports.executeAllIcon = exports.deleteCellIcon = exports.stopIcon = exports.executeIcon = exports.selectKernelIcon = exports.configureKernelIcon = void 0;
    exports.configureKernelIcon = (0, iconRegistry_1.registerIcon)('notebook-kernel-configure', codicons_1.Codicon.settingsGear, (0, nls_1.localize)(0, null));
    exports.selectKernelIcon = (0, iconRegistry_1.registerIcon)('notebook-kernel-select', codicons_1.Codicon.serverEnvironment, (0, nls_1.localize)(1, null));
    exports.executeIcon = (0, iconRegistry_1.registerIcon)('notebook-execute', codicons_1.Codicon.play, (0, nls_1.localize)(2, null));
    exports.stopIcon = (0, iconRegistry_1.registerIcon)('notebook-stop', codicons_1.Codicon.primitiveSquare, (0, nls_1.localize)(3, null));
    exports.deleteCellIcon = (0, iconRegistry_1.registerIcon)('notebook-delete-cell', codicons_1.Codicon.trash, (0, nls_1.localize)(4, null));
    exports.executeAllIcon = (0, iconRegistry_1.registerIcon)('notebook-execute-all', codicons_1.Codicon.runAll, (0, nls_1.localize)(5, null));
    exports.editIcon = (0, iconRegistry_1.registerIcon)('notebook-edit', codicons_1.Codicon.pencil, (0, nls_1.localize)(6, null));
    exports.stopEditIcon = (0, iconRegistry_1.registerIcon)('notebook-stop-edit', codicons_1.Codicon.check, (0, nls_1.localize)(7, null));
    exports.moveUpIcon = (0, iconRegistry_1.registerIcon)('notebook-move-up', codicons_1.Codicon.arrowUp, (0, nls_1.localize)(8, null));
    exports.moveDownIcon = (0, iconRegistry_1.registerIcon)('notebook-move-down', codicons_1.Codicon.arrowDown, (0, nls_1.localize)(9, null));
    exports.clearIcon = (0, iconRegistry_1.registerIcon)('notebook-clear', codicons_1.Codicon.clearAll, (0, nls_1.localize)(10, null));
    exports.splitCellIcon = (0, iconRegistry_1.registerIcon)('notebook-split-cell', codicons_1.Codicon.splitVertical, (0, nls_1.localize)(11, null));
    exports.unfoldIcon = (0, iconRegistry_1.registerIcon)('notebook-unfold', codicons_1.Codicon.unfold, (0, nls_1.localize)(12, null));
    exports.successStateIcon = (0, iconRegistry_1.registerIcon)('notebook-state-success', codicons_1.Codicon.check, (0, nls_1.localize)(13, null));
    exports.errorStateIcon = (0, iconRegistry_1.registerIcon)('notebook-state-error', codicons_1.Codicon.error, (0, nls_1.localize)(14, null));
    exports.pendingStateIcon = (0, iconRegistry_1.registerIcon)('notebook-state-pending', codicons_1.Codicon.clock, (0, nls_1.localize)(15, null));
    exports.executingStateIcon = (0, iconRegistry_1.registerIcon)('notebook-state-executing', codicons_1.Codicon.sync, (0, nls_1.localize)(16, null));
    exports.collapsedIcon = (0, iconRegistry_1.registerIcon)('notebook-collapsed', codicons_1.Codicon.chevronRight, (0, nls_1.localize)(17, null));
    exports.expandedIcon = (0, iconRegistry_1.registerIcon)('notebook-expanded', codicons_1.Codicon.chevronDown, (0, nls_1.localize)(18, null));
    exports.openAsTextIcon = (0, iconRegistry_1.registerIcon)('notebook-open-as-text', codicons_1.Codicon.fileCode, (0, nls_1.localize)(19, null));
    exports.revertIcon = (0, iconRegistry_1.registerIcon)('notebook-revert', codicons_1.Codicon.discard, (0, nls_1.localize)(20, null));
    exports.renderOutputIcon = (0, iconRegistry_1.registerIcon)('notebook-render-output', codicons_1.Codicon.preview, (0, nls_1.localize)(21, null));
    exports.mimetypeIcon = (0, iconRegistry_1.registerIcon)('notebook-mimetype', codicons_1.Codicon.code, (0, nls_1.localize)(22, null));
});
//# sourceMappingURL=notebookIcons.js.map