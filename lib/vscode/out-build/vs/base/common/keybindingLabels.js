/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/base/common/keybindingLabels"], function (require, exports, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UserSettingsLabelProvider = exports.ElectronAcceleratorLabelProvider = exports.AriaLabelProvider = exports.UILabelProvider = exports.ModifierLabelProvider = void 0;
    class ModifierLabelProvider {
        constructor(mac, windows, linux = windows) {
            this.modifierLabels = [null]; // index 0 will never me accessed.
            this.modifierLabels[2 /* Macintosh */] = mac;
            this.modifierLabels[1 /* Windows */] = windows;
            this.modifierLabels[3 /* Linux */] = linux;
        }
        toLabel(OS, parts, keyLabelProvider) {
            if (parts.length === 0) {
                return null;
            }
            const result = [];
            for (let i = 0, len = parts.length; i < len; i++) {
                const part = parts[i];
                const keyLabel = keyLabelProvider(part);
                if (keyLabel === null) {
                    // this keybinding cannot be expressed...
                    return null;
                }
                result[i] = _simpleAsString(part, keyLabel, this.modifierLabels[OS]);
            }
            return result.join(' ');
        }
    }
    exports.ModifierLabelProvider = ModifierLabelProvider;
    /**
     * A label provider that prints modifiers in a suitable format for displaying in the UI.
     */
    exports.UILabelProvider = new ModifierLabelProvider({
        ctrlKey: '⌃',
        shiftKey: '⇧',
        altKey: '⌥',
        metaKey: '⌘',
        separator: '',
    }, {
        ctrlKey: nls.localize(0, null),
        shiftKey: nls.localize(1, null),
        altKey: nls.localize(2, null),
        metaKey: nls.localize(3, null),
        separator: '+',
    }, {
        ctrlKey: nls.localize(4, null),
        shiftKey: nls.localize(5, null),
        altKey: nls.localize(6, null),
        metaKey: nls.localize(7, null),
        separator: '+',
    });
    /**
     * A label provider that prints modifiers in a suitable format for ARIA.
     */
    exports.AriaLabelProvider = new ModifierLabelProvider({
        ctrlKey: nls.localize(8, null),
        shiftKey: nls.localize(9, null),
        altKey: nls.localize(10, null),
        metaKey: nls.localize(11, null),
        separator: '+',
    }, {
        ctrlKey: nls.localize(12, null),
        shiftKey: nls.localize(13, null),
        altKey: nls.localize(14, null),
        metaKey: nls.localize(15, null),
        separator: '+',
    }, {
        ctrlKey: nls.localize(16, null),
        shiftKey: nls.localize(17, null),
        altKey: nls.localize(18, null),
        metaKey: nls.localize(19, null),
        separator: '+',
    });
    /**
     * A label provider that prints modifiers in a suitable format for Electron Accelerators.
     * See https://github.com/electron/electron/blob/master/docs/api/accelerator.md
     */
    exports.ElectronAcceleratorLabelProvider = new ModifierLabelProvider({
        ctrlKey: 'Ctrl',
        shiftKey: 'Shift',
        altKey: 'Alt',
        metaKey: 'Cmd',
        separator: '+',
    }, {
        ctrlKey: 'Ctrl',
        shiftKey: 'Shift',
        altKey: 'Alt',
        metaKey: 'Super',
        separator: '+',
    });
    /**
     * A label provider that prints modifiers in a suitable format for user settings.
     */
    exports.UserSettingsLabelProvider = new ModifierLabelProvider({
        ctrlKey: 'ctrl',
        shiftKey: 'shift',
        altKey: 'alt',
        metaKey: 'cmd',
        separator: '+',
    }, {
        ctrlKey: 'ctrl',
        shiftKey: 'shift',
        altKey: 'alt',
        metaKey: 'win',
        separator: '+',
    }, {
        ctrlKey: 'ctrl',
        shiftKey: 'shift',
        altKey: 'alt',
        metaKey: 'meta',
        separator: '+',
    });
    function _simpleAsString(modifiers, key, labels) {
        if (key === null) {
            return '';
        }
        const result = [];
        // translate modifier keys: Ctrl-Shift-Alt-Meta
        if (modifiers.ctrlKey) {
            result.push(labels.ctrlKey);
        }
        if (modifiers.shiftKey) {
            result.push(labels.shiftKey);
        }
        if (modifiers.altKey) {
            result.push(labels.altKey);
        }
        if (modifiers.metaKey) {
            result.push(labels.metaKey);
        }
        // the actual key
        if (key !== '') {
            result.push(key);
        }
        return result.join(labels.separator);
    }
});
//# sourceMappingURL=keybindingLabels.js.map