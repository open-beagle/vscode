/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.transformWebviewThemeVars = void 0;
    const mapping = [
        ['theme-font-family', 'vscode-font-family'],
        ['theme-font-weight', 'vscode-font-weight'],
        ['theme-font-size', 'vscode-font-size'],
        ['theme-code-font-family', 'vscode-editor-font-family'],
        ['theme-code-font-weight', 'vscode-editor-font-weight'],
        ['theme-code-font-size', 'vscode-editor-font-size'],
        // Editor
        ['theme-background', 'vscode-editor-background'],
        ['theme-foreground', 'vscode-editor-foreground'],
        ['theme-link', 'vscode-textLink-foreground'],
        ['theme-link-active', 'vscode-textLink-activeForeground'],
        // Buttons
        ['theme-button-background', 'vscode-button-background'],
        ['theme-button-hover-background', 'vscode-button-hoverBackground'],
        ['theme-button-foreground', 'vscode-button-foreground'],
        ['theme-button-secondary-background', 'vscode-button-secondaryBackground'],
        ['theme-button-secondary-hover-background', 'vscode-button-secondaryHoverBackground'],
        ['theme-button-secondary-foreground', 'vscode-button-secondaryForeground'],
        ['theme-button-hover-foreground', 'vscode-button-foreground'],
        ['theme-button-focus-foreground', 'vscode-button-foreground'],
        ['theme-button-secondary-hover-foreground', 'vscode-button-secondaryForeground'],
        ['theme-button-secondary-focus-foreground', 'vscode-button-secondaryForeground'],
        // Inputs
        ['theme-input-background', 'vscode-input-background'],
        ['theme-input-foreground', 'vscode-input-foreground'],
        ['theme-input-placeholder-foreground', 'vscode-input-placeholderForeground'],
        ['theme-input-focus-border-color', 'vscode-focusBorder'],
        // Menus
        ['theme-menu-background', 'vscode-menu-background'],
        ['theme-menu-foreground', 'vscode-menu-foreground'],
        ['theme-menu-hover-background', 'vscode-menu-selectionBackground'],
        ['theme-menu-focus-background', 'vscode-menu-selectionBackground'],
        ['theme-menu-hover-foreground', 'vscode-menu-selectionForeground'],
        ['theme-menu-focus-foreground', 'vscode-menu-selectionForeground'],
        // Errors
        ['theme-error-background', 'vscode-inputValidation-errorBackground'],
        ['theme-error-foreground', 'vscode-foreground'],
        ['theme-warning-background', 'vscode-inputValidation-warningBackground'],
        ['theme-warning-foreground', 'vscode-foreground'],
        ['theme-info-background', 'vscode-inputValidation-infoBackground'],
        ['theme-info-foreground', 'vscode-foreground'],
    ];
    const constants = {
        'theme-input-border-width': '1px',
        'theme-button-primary-hover-shadow': 'none',
        'theme-button-secondary-hover-shadow': 'none',
        'theme-input-border-color': 'transparent',
    };
    /**
     * Transforms base vscode theme variables into generic variables for notebook
     * renderers.
     * @see https://github.com/microsoft/vscode/issues/107985 for context
     */
    const transformWebviewThemeVars = (s) => {
        const result = Object.assign(Object.assign({}, s), constants); // todo@connor4312: remove after a period of time to allow migration
        for (const [target, src] of mapping) {
            result[target] = s[src];
        }
        return result;
    };
    exports.transformWebviewThemeVars = transformWebviewThemeVars;
});
//# sourceMappingURL=webviewThemeMapping.js.map