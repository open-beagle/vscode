/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/browser/mainThreadMessageService", "vs/platform/notification/common/notification", "vs/base/test/common/mock", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/event"], function (require, exports, assert, mainThreadMessageService_1, notification_1, mock_1, lifecycle_1, platform, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const emptyDialogService = new class {
        show() {
            throw new Error('not implemented');
        }
        confirm() {
            throw new Error('not implemented');
        }
        about() {
            throw new Error('not implemented');
        }
        input() {
            throw new Error('not implemented');
        }
    };
    const emptyCommandService = {
        _serviceBrand: undefined,
        onWillExecuteCommand: () => lifecycle_1.Disposable.None,
        onDidExecuteCommand: () => lifecycle_1.Disposable.None,
        executeCommand: (commandId, ...args) => {
            return Promise.resolve(undefined);
        }
    };
    const emptyNotificationService = new class {
        constructor() {
            this.onDidAddNotification = event_1.Event.None;
            this.onDidRemoveNotification = event_1.Event.None;
        }
        notify(...args) {
            throw new Error('not implemented');
        }
        info(...args) {
            throw new Error('not implemented');
        }
        warn(...args) {
            throw new Error('not implemented');
        }
        error(...args) {
            throw new Error('not implemented');
        }
        prompt(severity, message, choices, options) {
            throw new Error('not implemented');
        }
        status(message, options) {
            return lifecycle_1.Disposable.None;
        }
        setFilter(filter) {
            throw new Error('not implemented.');
        }
    };
    class EmptyNotificationService {
        constructor(withNotify) {
            this.withNotify = withNotify;
            this.onDidAddNotification = event_1.Event.None;
            this.onDidRemoveNotification = event_1.Event.None;
        }
        notify(notification) {
            this.withNotify(notification);
            return new notification_1.NoOpNotification();
        }
        info(message) {
            throw new Error('Method not implemented.');
        }
        warn(message) {
            throw new Error('Method not implemented.');
        }
        error(message) {
            throw new Error('Method not implemented.');
        }
        prompt(severity, message, choices, options) {
            throw new Error('Method not implemented');
        }
        status(message, options) {
            return lifecycle_1.Disposable.None;
        }
        setFilter(filter) {
            throw new Error('Method not implemented.');
        }
    }
    suite('ExtHostMessageService', function () {
        test('propagte handle on select', async function () {
            let service = new mainThreadMessageService_1.MainThreadMessageService(null, new EmptyNotificationService(notification => {
                assert.strictEqual(notification.actions.primary.length, 1);
                platform.setImmediate(() => notification.actions.primary[0].run());
            }), emptyCommandService, emptyDialogService);
            const handle = await service.$showMessage(1, 'h', {}, [{ handle: 42, title: 'a thing', isCloseAffordance: true }]);
            assert.strictEqual(handle, 42);
        });
        suite('modal', () => {
            test('calls dialog service', async () => {
                const service = new mainThreadMessageService_1.MainThreadMessageService(null, emptyNotificationService, emptyCommandService, new class extends (0, mock_1.mock)() {
                    show(severity, message, buttons) {
                        assert.strictEqual(severity, 1);
                        assert.strictEqual(message, 'h');
                        assert.strictEqual(buttons.length, 2);
                        assert.strictEqual(buttons[1], 'Cancel');
                        return Promise.resolve({ choice: 0 });
                    }
                });
                const handle = await service.$showMessage(1, 'h', { modal: true }, [{ handle: 42, title: 'a thing', isCloseAffordance: false }]);
                assert.strictEqual(handle, 42);
            });
            test('returns undefined when cancelled', async () => {
                const service = new mainThreadMessageService_1.MainThreadMessageService(null, emptyNotificationService, emptyCommandService, new class extends (0, mock_1.mock)() {
                    show() {
                        return Promise.resolve({ choice: 1 });
                    }
                });
                const handle = await service.$showMessage(1, 'h', { modal: true }, [{ handle: 42, title: 'a thing', isCloseAffordance: false }]);
                assert.strictEqual(handle, undefined);
            });
            test('hides Cancel button when not needed', async () => {
                const service = new mainThreadMessageService_1.MainThreadMessageService(null, emptyNotificationService, emptyCommandService, new class extends (0, mock_1.mock)() {
                    show(severity, message, buttons) {
                        assert.strictEqual(buttons.length, 1);
                        return Promise.resolve({ choice: 0 });
                    }
                });
                const handle = await service.$showMessage(1, 'h', { modal: true }, [{ handle: 42, title: 'a thing', isCloseAffordance: true }]);
                assert.strictEqual(handle, 42);
            });
        });
    });
});
//# sourceMappingURL=extHostMessagerService.test.js.map