/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/scanCode", "vs/workbench/services/keybinding/common/macLinuxFallbackKeyboardMapper", "vs/workbench/services/keybinding/test/electron-browser/keyboardMapperTestUtils"], function (require, exports, keyCodes_1, scanCode_1, macLinuxFallbackKeyboardMapper_1, keyboardMapperTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('keyboardMapper - MAC fallback', () => {
        let mapper = new macLinuxFallbackKeyboardMapper_1.MacLinuxFallbackKeyboardMapper(2 /* Macintosh */);
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, (0, keyCodes_1.createKeybinding)(k, 2 /* Macintosh */), expected);
        }
        test('resolveKeybinding Cmd+Z', () => {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 56 /* KEY_Z */, [{
                    label: '⌘Z',
                    ariaLabel: 'Command+Z',
                    electronAccelerator: 'Cmd+Z',
                    userSettingsLabel: 'cmd+z',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['meta+Z'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Cmd+K Cmd+=', () => {
            _assertResolveKeybinding((0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 81 /* US_EQUAL */), [{
                    label: '⌘K ⌘=',
                    ariaLabel: 'Command+K Command+=',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+k cmd+=',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['meta+K', 'meta+='],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeyboardEvent Cmd+Z', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                keyCode: 56 /* KEY_Z */,
                code: null
            }, {
                label: '⌘Z',
                ariaLabel: 'Command+Z',
                electronAccelerator: 'Cmd+Z',
                userSettingsLabel: 'cmd+z',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['meta+Z'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveUserBinding empty', () => {
            (0, keyboardMapperTestUtils_1.assertResolveUserBinding)(mapper, [], []);
        });
        test('resolveUserBinding Cmd+[Comma] Cmd+/', () => {
            (0, keyboardMapperTestUtils_1.assertResolveUserBinding)(mapper, [
                new scanCode_1.ScanCodeBinding(false, false, false, true, 60 /* Comma */),
                new keyCodes_1.SimpleKeybinding(false, false, false, true, 85 /* US_SLASH */),
            ], [{
                    label: '⌘, ⌘/',
                    ariaLabel: 'Command+, Command+/',
                    electronAccelerator: null,
                    userSettingsLabel: 'cmd+, cmd+/',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['meta+,', 'meta+/'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier Meta+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                keyCode: 57 /* Meta */,
                code: null
            }, {
                label: '⌘',
                ariaLabel: 'Command',
                electronAccelerator: null,
                userSettingsLabel: 'cmd',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
        test('resolveKeyboardEvent Single Modifier Shift+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                keyCode: 4 /* Shift */,
                code: null
            }, {
                label: '⇧',
                ariaLabel: 'Shift',
                electronAccelerator: null,
                userSettingsLabel: 'shift',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['shift'],
            });
        });
        test('resolveKeyboardEvent Single Modifier Alt+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: true,
                metaKey: false,
                keyCode: 6 /* Alt */,
                code: null
            }, {
                label: '⌥',
                ariaLabel: 'Alt',
                electronAccelerator: null,
                userSettingsLabel: 'alt',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['alt'],
            });
        });
        test('resolveKeyboardEvent Single Modifier Meta+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: true,
                keyCode: 57 /* Meta */,
                code: null
            }, {
                label: '⌘',
                ariaLabel: 'Command',
                electronAccelerator: null,
                userSettingsLabel: 'cmd',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['meta'],
            });
        });
        test('resolveKeyboardEvent Only Modifiers Ctrl+Shift+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                keyCode: 4 /* Shift */,
                code: null
            }, {
                label: '⌃⇧',
                ariaLabel: 'Control+Shift',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+shift',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: [null],
            });
        });
    });
    suite('keyboardMapper - LINUX fallback', () => {
        let mapper = new macLinuxFallbackKeyboardMapper_1.MacLinuxFallbackKeyboardMapper(3 /* Linux */);
        function _assertResolveKeybinding(k, expected) {
            (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, (0, keyCodes_1.createKeybinding)(k, 3 /* Linux */), expected);
        }
        test('resolveKeybinding Ctrl+Z', () => {
            _assertResolveKeybinding(2048 /* CtrlCmd */ | 56 /* KEY_Z */, [{
                    label: 'Ctrl+Z',
                    ariaLabel: 'Control+Z',
                    electronAccelerator: 'Ctrl+Z',
                    userSettingsLabel: 'ctrl+z',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+Z'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+=', () => {
            _assertResolveKeybinding((0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 81 /* US_EQUAL */), [{
                    label: 'Ctrl+K Ctrl+=',
                    ariaLabel: 'Control+K Control+=',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+=',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['ctrl+K', 'ctrl+='],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+Z', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 56 /* KEY_Z */,
                code: null
            }, {
                label: 'Ctrl+Z',
                ariaLabel: 'Control+Z',
                electronAccelerator: 'Ctrl+Z',
                userSettingsLabel: 'ctrl+z',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['ctrl+Z'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveUserBinding Ctrl+[Comma] Ctrl+/', () => {
            (0, keyboardMapperTestUtils_1.assertResolveUserBinding)(mapper, [
                new scanCode_1.ScanCodeBinding(true, false, false, false, 60 /* Comma */),
                new keyCodes_1.SimpleKeybinding(true, false, false, false, 85 /* US_SLASH */),
            ], [{
                    label: 'Ctrl+, Ctrl+/',
                    ariaLabel: 'Control+, Control+/',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+, ctrl+/',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['ctrl+,', 'ctrl+/'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveUserBinding Ctrl+[Comma]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveUserBinding)(mapper, [
                new scanCode_1.ScanCodeBinding(true, false, false, false, 60 /* Comma */),
            ], [{
                    label: 'Ctrl+,',
                    ariaLabel: 'Control+,',
                    electronAccelerator: 'Ctrl+,',
                    userSettingsLabel: 'ctrl+,',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+,'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Single Modifier Ctrl+', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 5 /* Ctrl */,
                code: null
            }, {
                label: 'Ctrl',
                ariaLabel: 'Control',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: [null],
                singleModifierDispatchParts: ['ctrl'],
            });
        });
    });
});
//# sourceMappingURL=macLinuxFallbackKeyboardMapper.test.js.map