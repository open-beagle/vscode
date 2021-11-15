/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/actions/developerActions", "vs/platform/keybinding/common/keybinding", "vs/base/browser/event", "vs/base/common/color", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/base/browser/keyboardEvent", "vs/base/common/async", "vs/platform/layout/browser/layoutService", "vs/platform/registry/common/platform", "vs/platform/actions/common/actions", "vs/platform/storage/common/storage", "vs/base/common/numbers", "vs/platform/configuration/common/configurationRegistry", "vs/platform/log/common/log", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/common/actions", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/css!./media/actions"], function (require, exports, nls_1, keybinding_1, event_1, color_1, event_2, lifecycle_1, dom_1, configuration_1, contextkey_1, keyboardEvent_1, async_1, layoutService_1, platform_1, actions_1, storage_1, numbers_1, configurationRegistry_1, log_1, workingCopyService_1, actions_2, workingCopyBackup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class InspectContextKeysAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.inspectContextKeys',
                title: { value: (0, nls_1.localize)(0, null), original: 'Inspect Context Keys' },
                category: actions_2.CATEGORIES.Developer,
                f1: true
            });
        }
        run(accessor) {
            const contextKeyService = accessor.get(contextkey_1.IContextKeyService);
            const disposables = new lifecycle_1.DisposableStore();
            const stylesheet = (0, dom_1.createStyleSheet)();
            disposables.add((0, lifecycle_1.toDisposable)(() => {
                if (stylesheet.parentNode) {
                    stylesheet.parentNode.removeChild(stylesheet);
                }
            }));
            (0, dom_1.createCSSRule)('*', 'cursor: crosshair !important;', stylesheet);
            const hoverFeedback = document.createElement('div');
            document.body.appendChild(hoverFeedback);
            disposables.add((0, lifecycle_1.toDisposable)(() => document.body.removeChild(hoverFeedback)));
            hoverFeedback.style.position = 'absolute';
            hoverFeedback.style.pointerEvents = 'none';
            hoverFeedback.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            hoverFeedback.style.zIndex = '1000';
            const onMouseMove = (0, event_1.domEvent)(document.body, 'mousemove', true);
            disposables.add(onMouseMove(e => {
                const target = e.target;
                const position = (0, dom_1.getDomNodePagePosition)(target);
                hoverFeedback.style.top = `${position.top}px`;
                hoverFeedback.style.left = `${position.left}px`;
                hoverFeedback.style.width = `${position.width}px`;
                hoverFeedback.style.height = `${position.height}px`;
            }));
            const onMouseDown = event_2.Event.once((0, event_1.domEvent)(document.body, 'mousedown', true));
            onMouseDown(e => { e.preventDefault(); e.stopPropagation(); }, null, disposables);
            const onMouseUp = event_2.Event.once((0, event_1.domEvent)(document.body, 'mouseup', true));
            onMouseUp(e => {
                e.preventDefault();
                e.stopPropagation();
                const context = contextKeyService.getContext(e.target);
                console.log(context.collectAllValues());
                (0, lifecycle_1.dispose)(disposables);
            }, null, disposables);
        }
    }
    class ToggleScreencastModeAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleScreencastMode',
                title: { value: (0, nls_1.localize)(1, null), original: 'Toggle Screencast Mode' },
                category: actions_2.CATEGORIES.Developer,
                f1: true
            });
        }
        run(accessor) {
            if (ToggleScreencastModeAction.disposable) {
                ToggleScreencastModeAction.disposable.dispose();
                ToggleScreencastModeAction.disposable = undefined;
                return;
            }
            const layoutService = accessor.get(layoutService_1.ILayoutService);
            const configurationService = accessor.get(configuration_1.IConfigurationService);
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const disposables = new lifecycle_1.DisposableStore();
            const container = layoutService.container;
            const mouseMarker = (0, dom_1.append)(container, (0, dom_1.$)('.screencast-mouse'));
            disposables.add((0, lifecycle_1.toDisposable)(() => mouseMarker.remove()));
            const onMouseDown = (0, event_1.domEvent)(container, 'mousedown', true);
            const onMouseUp = (0, event_1.domEvent)(container, 'mouseup', true);
            const onMouseMove = (0, event_1.domEvent)(container, 'mousemove', true);
            const updateMouseIndicatorColor = () => {
                mouseMarker.style.borderColor = color_1.Color.fromHex(configurationService.getValue('screencastMode.mouseIndicatorColor')).toString();
            };
            let mouseIndicatorSize;
            const updateMouseIndicatorSize = () => {
                mouseIndicatorSize = (0, numbers_1.clamp)(configurationService.getValue('screencastMode.mouseIndicatorSize') || 20, 20, 100);
                mouseMarker.style.height = `${mouseIndicatorSize}px`;
                mouseMarker.style.width = `${mouseIndicatorSize}px`;
            };
            updateMouseIndicatorColor();
            updateMouseIndicatorSize();
            disposables.add(onMouseDown(e => {
                mouseMarker.style.top = `${e.clientY - mouseIndicatorSize / 2}px`;
                mouseMarker.style.left = `${e.clientX - mouseIndicatorSize / 2}px`;
                mouseMarker.style.display = 'block';
                const mouseMoveListener = onMouseMove(e => {
                    mouseMarker.style.top = `${e.clientY - mouseIndicatorSize / 2}px`;
                    mouseMarker.style.left = `${e.clientX - mouseIndicatorSize / 2}px`;
                });
                event_2.Event.once(onMouseUp)(() => {
                    mouseMarker.style.display = 'none';
                    mouseMoveListener.dispose();
                });
            }));
            const keyboardMarker = (0, dom_1.append)(container, (0, dom_1.$)('.screencast-keyboard'));
            disposables.add((0, lifecycle_1.toDisposable)(() => keyboardMarker.remove()));
            const updateKeyboardFontSize = () => {
                keyboardMarker.style.fontSize = `${(0, numbers_1.clamp)(configurationService.getValue('screencastMode.fontSize') || 56, 20, 100)}px`;
            };
            const updateKeyboardMarker = () => {
                keyboardMarker.style.bottom = `${(0, numbers_1.clamp)(configurationService.getValue('screencastMode.verticalOffset') || 0, 0, 90)}%`;
            };
            let keyboardMarkerTimeout;
            const updateKeyboardMarkerTimeout = () => {
                keyboardMarkerTimeout = (0, numbers_1.clamp)(configurationService.getValue('screencastMode.keyboardOverlayTimeout') || 800, 500, 5000);
            };
            updateKeyboardFontSize();
            updateKeyboardMarker();
            updateKeyboardMarkerTimeout();
            disposables.add(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('screencastMode.verticalOffset')) {
                    updateKeyboardMarker();
                }
                if (e.affectsConfiguration('screencastMode.fontSize')) {
                    updateKeyboardFontSize();
                }
                if (e.affectsConfiguration('screencastMode.keyboardOverlayTimeout')) {
                    updateKeyboardMarkerTimeout();
                }
                if (e.affectsConfiguration('screencastMode.mouseIndicatorColor')) {
                    updateMouseIndicatorColor();
                }
                if (e.affectsConfiguration('screencastMode.mouseIndicatorSize')) {
                    updateMouseIndicatorSize();
                }
            }));
            const onKeyDown = (0, event_1.domEvent)(window, 'keydown', true);
            let keyboardTimeout = lifecycle_1.Disposable.None;
            let length = 0;
            disposables.add(onKeyDown(e => {
                keyboardTimeout.dispose();
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                const shortcut = keybindingService.softDispatch(event, event.target);
                if (shortcut || !configurationService.getValue('screencastMode.onlyKeyboardShortcuts')) {
                    if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey
                        || length > 20
                        || event.keyCode === 1 /* Backspace */ || event.keyCode === 9 /* Escape */) {
                        keyboardMarker.innerText = '';
                        length = 0;
                    }
                    const keybinding = keybindingService.resolveKeyboardEvent(event);
                    const label = keybinding.getLabel();
                    const key = (0, dom_1.$)('span.key', {}, label || '');
                    length++;
                    (0, dom_1.append)(keyboardMarker, key);
                }
                const promise = (0, async_1.timeout)(keyboardMarkerTimeout);
                keyboardTimeout = (0, lifecycle_1.toDisposable)(() => promise.cancel());
                promise.then(() => {
                    keyboardMarker.textContent = '';
                    length = 0;
                });
            }));
            ToggleScreencastModeAction.disposable = disposables;
        }
    }
    class LogStorageAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.logStorage',
                title: { value: (0, nls_1.localize)(2, null), original: 'Log Storage Database Contents' },
                category: actions_2.CATEGORIES.Developer,
                f1: true
            });
        }
        run(accessor) {
            accessor.get(storage_1.IStorageService).logStorage();
        }
    }
    class LogWorkingCopiesAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.logWorkingCopies',
                title: { value: (0, nls_1.localize)(3, null), original: 'Log Working Copies' },
                category: actions_2.CATEGORIES.Developer,
                f1: true
            });
        }
        async run(accessor) {
            const workingCopyService = accessor.get(workingCopyService_1.IWorkingCopyService);
            const workingCopyBackupService = accessor.get(workingCopyBackup_1.IWorkingCopyBackupService);
            const logService = accessor.get(log_1.ILogService);
            const backups = await workingCopyBackupService.getBackups();
            const msg = [
                ``,
                `[Working Copies]`,
                ...(workingCopyService.workingCopies.length > 0) ?
                    workingCopyService.workingCopies.map(workingCopy => `${workingCopy.isDirty() ? '● ' : ''}${workingCopy.resource.toString(true)} (typeId: ${workingCopy.typeId || '<no typeId>'})`) :
                    ['<none>'],
                ``,
                `[Backups]`,
                ...(backups.length > 0) ?
                    backups.map(backup => `${backup.resource.toString(true)} (typeId: ${backup.typeId || '<no typeId>'})`) :
                    ['<none>'],
            ];
            logService.info(msg.join('\n'));
        }
    }
    // --- Actions Registration
    (0, actions_1.registerAction2)(InspectContextKeysAction);
    (0, actions_1.registerAction2)(ToggleScreencastModeAction);
    (0, actions_1.registerAction2)(LogStorageAction);
    (0, actions_1.registerAction2)(LogWorkingCopiesAction);
    // --- Configuration
    // Screen Cast Mode
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'screencastMode',
        order: 9,
        title: (0, nls_1.localize)(4, null),
        type: 'object',
        properties: {
            'screencastMode.verticalOffset': {
                type: 'number',
                default: 20,
                minimum: 0,
                maximum: 90,
                description: (0, nls_1.localize)(5, null)
            },
            'screencastMode.fontSize': {
                type: 'number',
                default: 56,
                minimum: 20,
                maximum: 100,
                description: (0, nls_1.localize)(6, null)
            },
            'screencastMode.onlyKeyboardShortcuts': {
                type: 'boolean',
                description: (0, nls_1.localize)(7, null),
                default: false
            },
            'screencastMode.keyboardOverlayTimeout': {
                type: 'number',
                default: 800,
                minimum: 500,
                maximum: 5000,
                description: (0, nls_1.localize)(8, null)
            },
            'screencastMode.mouseIndicatorColor': {
                type: 'string',
                format: 'color-hex',
                default: '#FF0000',
                description: (0, nls_1.localize)(9, null)
            },
            'screencastMode.mouseIndicatorSize': {
                type: 'number',
                default: 20,
                minimum: 20,
                maximum: 100,
                description: (0, nls_1.localize)(10, null)
            },
        }
    });
});
//# sourceMappingURL=developerActions.js.map