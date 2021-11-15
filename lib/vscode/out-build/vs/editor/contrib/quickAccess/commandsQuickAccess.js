/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/quickinput/browser/commandsQuickAccess", "vs/base/common/iconLabels"], function (require, exports, commandsQuickAccess_1, iconLabels_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractEditorCommandsQuickAccessProvider = void 0;
    class AbstractEditorCommandsQuickAccessProvider extends commandsQuickAccess_1.AbstractCommandsQuickAccessProvider {
        constructor(options, instantiationService, keybindingService, commandService, telemetryService, notificationService) {
            super(options, instantiationService, keybindingService, commandService, telemetryService, notificationService);
        }
        getCodeEditorCommandPicks() {
            const activeTextEditorControl = this.activeTextEditorControl;
            if (!activeTextEditorControl) {
                return [];
            }
            const editorCommandPicks = [];
            for (const editorAction of activeTextEditorControl.getSupportedActions()) {
                editorCommandPicks.push({
                    commandId: editorAction.id,
                    commandAlias: editorAction.alias,
                    label: (0, iconLabels_1.stripIcons)(editorAction.label) || editorAction.id,
                });
            }
            return editorCommandPicks;
        }
    }
    exports.AbstractEditorCommandsQuickAccessProvider = AbstractEditorCommandsQuickAccessProvider;
});
//# sourceMappingURL=commandsQuickAccess.js.map