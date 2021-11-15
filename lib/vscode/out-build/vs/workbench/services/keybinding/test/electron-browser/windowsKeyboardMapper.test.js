/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/keyCodes", "vs/base/common/scanCode", "vs/workbench/services/keybinding/common/windowsKeyboardMapper", "vs/workbench/services/keybinding/test/electron-browser/keyboardMapperTestUtils"], function (require, exports, keyCodes_1, scanCode_1, windowsKeyboardMapper_1, keyboardMapperTestUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const WRITE_FILE_IF_DIFFERENT = false;
    async function createKeyboardMapper(isUSStandard, file) {
        const rawMappings = await (0, keyboardMapperTestUtils_1.readRawMapping)(file);
        return new windowsKeyboardMapper_1.WindowsKeyboardMapper(isUSStandard, rawMappings);
    }
    function _assertResolveKeybinding(mapper, k, expected) {
        const keyBinding = (0, keyCodes_1.createKeybinding)(k, 1 /* Windows */);
        (0, keyboardMapperTestUtils_1.assertResolveKeybinding)(mapper, keyBinding, expected);
    }
    suite('keyboardMapper - WINDOWS de_ch', () => {
        let mapper;
        suiteSetup(async () => {
            mapper = await createKeyboardMapper(false, 'win_de_ch');
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'win_de_ch.txt');
        });
        test('resolveKeybinding Ctrl+A', () => {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 31 /* KEY_A */, [{
                    label: 'Ctrl+A',
                    ariaLabel: 'Control+A',
                    electronAccelerator: 'Ctrl+A',
                    userSettingsLabel: 'ctrl+a',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+A'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Z', () => {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 56 /* KEY_Z */, [{
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
        test('resolveKeybinding Ctrl+]', () => {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 89 /* US_CLOSE_SQUARE_BRACKET */, [{
                    label: 'Ctrl+^',
                    ariaLabel: 'Control+^',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+oem_6',
                    isWYSIWYG: false,
                    isChord: false,
                    dispatchParts: ['ctrl+]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 89 /* US_CLOSE_SQUARE_BRACKET */,
                code: null
            }, {
                label: 'Ctrl+^',
                ariaLabel: 'Control+^',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+oem_6',
                isWYSIWYG: false,
                isChord: false,
                dispatchParts: ['ctrl+]'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeybinding Shift+]', () => {
            _assertResolveKeybinding(mapper, 1024 /* Shift */ | 89 /* US_CLOSE_SQUARE_BRACKET */, [{
                    label: 'Shift+^',
                    ariaLabel: 'Shift+^',
                    electronAccelerator: null,
                    userSettingsLabel: 'shift+oem_6',
                    isWYSIWYG: false,
                    isChord: false,
                    dispatchParts: ['shift+]'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+/', () => {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 85 /* US_SLASH */, [{
                    label: 'Ctrl+§',
                    ariaLabel: 'Control+§',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+oem_2',
                    isWYSIWYG: false,
                    isChord: false,
                    dispatchParts: ['ctrl+/'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Shift+/', () => {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 1024 /* Shift */ | 85 /* US_SLASH */, [{
                    label: 'Ctrl+Shift+§',
                    ariaLabel: 'Control+Shift+§',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+shift+oem_2',
                    isWYSIWYG: false,
                    isChord: false,
                    dispatchParts: ['ctrl+shift+/'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+\\', () => {
            _assertResolveKeybinding(mapper, (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 88 /* US_BACKSLASH */), [{
                    label: 'Ctrl+K Ctrl+ä',
                    ariaLabel: 'Control+K Control+ä',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+oem_5',
                    isWYSIWYG: false,
                    isChord: true,
                    dispatchParts: ['ctrl+K', 'ctrl+\\'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
        test('resolveKeybinding Ctrl+K Ctrl+=', () => {
            _assertResolveKeybinding(mapper, (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 81 /* US_EQUAL */), []);
        });
        test('resolveKeybinding Ctrl+DownArrow', () => {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 18 /* DownArrow */, [{
                    label: 'Ctrl+DownArrow',
                    ariaLabel: 'Control+DownArrow',
                    electronAccelerator: 'Ctrl+Down',
                    userSettingsLabel: 'ctrl+down',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+DownArrow'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+NUMPAD_0', () => {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 93 /* NUMPAD_0 */, [{
                    label: 'Ctrl+NumPad0',
                    ariaLabel: 'Control+NumPad0',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+numpad0',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+NumPad0'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeybinding Ctrl+Home', () => {
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 14 /* Home */, [{
                    label: 'Ctrl+Home',
                    ariaLabel: 'Control+Home',
                    electronAccelerator: 'Ctrl+Home',
                    userSettingsLabel: 'ctrl+home',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+Home'],
                    singleModifierDispatchParts: [null],
                }]);
        });
        test('resolveKeyboardEvent Ctrl+Home', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 14 /* Home */,
                code: null
            }, {
                label: 'Ctrl+Home',
                ariaLabel: 'Control+Home',
                electronAccelerator: 'Ctrl+Home',
                userSettingsLabel: 'ctrl+home',
                isWYSIWYG: true,
                isChord: false,
                dispatchParts: ['ctrl+Home'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveUserBinding empty', () => {
            (0, keyboardMapperTestUtils_1.assertResolveUserBinding)(mapper, [], []);
        });
        test('resolveUserBinding Ctrl+[Comma] Ctrl+/', () => {
            (0, keyboardMapperTestUtils_1.assertResolveUserBinding)(mapper, [
                new scanCode_1.ScanCodeBinding(true, false, false, false, 60 /* Comma */),
                new keyCodes_1.SimpleKeybinding(true, false, false, false, 85 /* US_SLASH */),
            ], [{
                    label: 'Ctrl+, Ctrl+§',
                    ariaLabel: 'Control+, Control+§',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+oem_comma ctrl+oem_2',
                    isWYSIWYG: false,
                    isChord: true,
                    dispatchParts: ['ctrl+,', 'ctrl+/'],
                    singleModifierDispatchParts: [null, null],
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
    suite('keyboardMapper - WINDOWS en_us', () => {
        let mapper;
        suiteSetup(async () => {
            mapper = await createKeyboardMapper(true, 'win_en_us');
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'win_en_us.txt');
        });
        test('resolveKeybinding Ctrl+K Ctrl+\\', () => {
            _assertResolveKeybinding(mapper, (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 88 /* US_BACKSLASH */), [{
                    label: 'Ctrl+K Ctrl+\\',
                    ariaLabel: 'Control+K Control+\\',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+\\',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['ctrl+K', 'ctrl+\\'],
                    singleModifierDispatchParts: [null, null],
                }]);
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
                label: 'Shift',
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
                label: 'Alt',
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
                label: 'Windows',
                ariaLabel: 'Windows',
                electronAccelerator: null,
                userSettingsLabel: 'win',
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
                label: 'Ctrl+Shift',
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
    suite('keyboardMapper - WINDOWS por_ptb', () => {
        let mapper;
        suiteSetup(async () => {
            mapper = await createKeyboardMapper(false, 'win_por_ptb');
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'win_por_ptb.txt');
        });
        test('resolveKeyboardEvent Ctrl+[IntlRo]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 110 /* ABNT_C1 */,
                code: null
            }, {
                label: 'Ctrl+/',
                ariaLabel: 'Control+/',
                electronAccelerator: 'Ctrl+ABNT_C1',
                userSettingsLabel: 'ctrl+abnt_c1',
                isWYSIWYG: false,
                isChord: false,
                dispatchParts: ['ctrl+ABNT_C1'],
                singleModifierDispatchParts: [null],
            });
        });
        test('resolveKeyboardEvent Ctrl+[NumpadComma]', () => {
            (0, keyboardMapperTestUtils_1.assertResolveKeyboardEvent)(mapper, {
                _standardKeyboardEventBrand: true,
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                metaKey: false,
                keyCode: 111 /* ABNT_C2 */,
                code: null
            }, {
                label: 'Ctrl+.',
                ariaLabel: 'Control+.',
                electronAccelerator: 'Ctrl+ABNT_C2',
                userSettingsLabel: 'ctrl+abnt_c2',
                isWYSIWYG: false,
                isChord: false,
                dispatchParts: ['ctrl+ABNT_C2'],
                singleModifierDispatchParts: [null],
            });
        });
    });
    suite('keyboardMapper - WINDOWS ru', () => {
        let mapper;
        suiteSetup(async () => {
            mapper = await createKeyboardMapper(false, 'win_ru');
        });
        test('mapping', () => {
            return (0, keyboardMapperTestUtils_1.assertMapping)(WRITE_FILE_IF_DIFFERENT, mapper, 'win_ru.txt');
        });
        test('issue ##24361: resolveKeybinding Ctrl+K Ctrl+K', () => {
            _assertResolveKeybinding(mapper, (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 41 /* KEY_K */), [{
                    label: 'Ctrl+K Ctrl+K',
                    ariaLabel: 'Control+K Control+K',
                    electronAccelerator: null,
                    userSettingsLabel: 'ctrl+k ctrl+k',
                    isWYSIWYG: true,
                    isChord: true,
                    dispatchParts: ['ctrl+K', 'ctrl+K'],
                    singleModifierDispatchParts: [null, null],
                }]);
        });
    });
    suite('keyboardMapper - misc', () => {
        test('issue #23513: Toggle Sidebar Visibility and Go to Line display same key mapping in Arabic keyboard', () => {
            const mapper = new windowsKeyboardMapper_1.WindowsKeyboardMapper(false, {
                'KeyB': {
                    'vkey': 'VK_B',
                    'value': 'لا',
                    'withShift': 'لآ',
                    'withAltGr': '',
                    'withShiftAltGr': ''
                },
                'KeyG': {
                    'vkey': 'VK_G',
                    'value': 'ل',
                    'withShift': 'لأ',
                    'withAltGr': '',
                    'withShiftAltGr': ''
                }
            });
            _assertResolveKeybinding(mapper, 2048 /* CtrlCmd */ | 32 /* KEY_B */, [{
                    label: 'Ctrl+B',
                    ariaLabel: 'Control+B',
                    electronAccelerator: 'Ctrl+B',
                    userSettingsLabel: 'ctrl+b',
                    isWYSIWYG: true,
                    isChord: false,
                    dispatchParts: ['ctrl+B'],
                    singleModifierDispatchParts: [null],
                }]);
        });
    });
});
//# sourceMappingURL=windowsKeyboardMapper.test.js.map