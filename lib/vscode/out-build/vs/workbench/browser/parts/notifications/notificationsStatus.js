/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/workbench/services/statusbar/common/statusbar", "vs/base/common/lifecycle", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/nls!vs/workbench/browser/parts/notifications/notificationsStatus"], function (require, exports, statusbar_1, lifecycle_1, notificationsCommands_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationsStatus = void 0;
    let NotificationsStatus = class NotificationsStatus extends lifecycle_1.Disposable {
        constructor(model, statusbarService) {
            super();
            this.model = model;
            this.statusbarService = statusbarService;
            this.newNotificationsCount = 0;
            this.isNotificationsCenterVisible = false;
            this.isNotificationsToastsVisible = false;
            this.updateNotificationsCenterStatusItem();
            if (model.statusMessage) {
                this.doSetStatusMessage(model.statusMessage);
            }
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.model.onDidChangeNotification(e => this.onDidChangeNotification(e)));
            this._register(this.model.onDidChangeStatusMessage(e => this.onDidChangeStatusMessage(e)));
        }
        onDidChangeNotification(e) {
            // Consider a notification as unread as long as it only
            // appeared as toast and not in the notification center
            if (!this.isNotificationsCenterVisible) {
                if (e.kind === 0 /* ADD */) {
                    this.newNotificationsCount++;
                }
                else if (e.kind === 3 /* REMOVE */ && this.newNotificationsCount > 0) {
                    this.newNotificationsCount--;
                }
            }
            // Update in status bar
            this.updateNotificationsCenterStatusItem();
        }
        updateNotificationsCenterStatusItem() {
            // Figure out how many notifications have progress only if neither
            // toasts are visible nor center is visible. In that case we still
            // want to give a hint to the user that something is running.
            let notificationsInProgress = 0;
            if (!this.isNotificationsCenterVisible && !this.isNotificationsToastsVisible) {
                for (const notification of this.model.notifications) {
                    if (notification.hasProgress) {
                        notificationsInProgress++;
                    }
                }
            }
            // Show the bell with a dot if there are unread or in-progress notifications
            const statusProperties = {
                text: `${notificationsInProgress > 0 || this.newNotificationsCount > 0 ? '$(bell-dot)' : '$(bell)'}`,
                ariaLabel: (0, nls_1.localize)(0, null),
                command: this.isNotificationsCenterVisible ? notificationsCommands_1.HIDE_NOTIFICATIONS_CENTER : notificationsCommands_1.SHOW_NOTIFICATIONS_CENTER,
                tooltip: this.getTooltip(notificationsInProgress),
                showBeak: this.isNotificationsCenterVisible
            };
            if (!this.notificationsCenterStatusItem) {
                this.notificationsCenterStatusItem = this.statusbarService.addEntry(statusProperties, 'status.notifications', (0, nls_1.localize)(1, null), 1 /* RIGHT */, -Number.MAX_VALUE /* towards the far end of the right hand side */);
            }
            else {
                this.notificationsCenterStatusItem.update(statusProperties);
            }
        }
        getTooltip(notificationsInProgress) {
            if (this.isNotificationsCenterVisible) {
                return (0, nls_1.localize)(2, null);
            }
            if (this.model.notifications.length === 0) {
                return (0, nls_1.localize)(3, null);
            }
            if (notificationsInProgress === 0) {
                if (this.newNotificationsCount === 0) {
                    return (0, nls_1.localize)(4, null);
                }
                if (this.newNotificationsCount === 1) {
                    return (0, nls_1.localize)(5, null);
                }
                return (0, nls_1.localize)(6, null, this.newNotificationsCount);
            }
            if (this.newNotificationsCount === 0) {
                return (0, nls_1.localize)(7, null, notificationsInProgress);
            }
            if (this.newNotificationsCount === 1) {
                return (0, nls_1.localize)(8, null, notificationsInProgress);
            }
            return (0, nls_1.localize)(9, null, this.newNotificationsCount, notificationsInProgress);
        }
        update(isCenterVisible, isToastsVisible) {
            let updateNotificationsCenterStatusItem = false;
            if (this.isNotificationsCenterVisible !== isCenterVisible) {
                this.isNotificationsCenterVisible = isCenterVisible;
                this.newNotificationsCount = 0; // Showing the notification center resets the unread counter to 0
                updateNotificationsCenterStatusItem = true;
            }
            if (this.isNotificationsToastsVisible !== isToastsVisible) {
                this.isNotificationsToastsVisible = isToastsVisible;
                updateNotificationsCenterStatusItem = true;
            }
            // Update in status bar as needed
            if (updateNotificationsCenterStatusItem) {
                this.updateNotificationsCenterStatusItem();
            }
        }
        onDidChangeStatusMessage(e) {
            const statusItem = e.item;
            switch (e.kind) {
                // Show status notification
                case 0 /* ADD */:
                    this.doSetStatusMessage(statusItem);
                    break;
                // Hide status notification (if its still the current one)
                case 1 /* REMOVE */:
                    if (this.currentStatusMessage && this.currentStatusMessage[0] === statusItem) {
                        (0, lifecycle_1.dispose)(this.currentStatusMessage[1]);
                        this.currentStatusMessage = undefined;
                    }
                    break;
            }
        }
        doSetStatusMessage(item) {
            const message = item.message;
            const showAfter = item.options && typeof item.options.showAfter === 'number' ? item.options.showAfter : 0;
            const hideAfter = item.options && typeof item.options.hideAfter === 'number' ? item.options.hideAfter : -1;
            // Dismiss any previous
            if (this.currentStatusMessage) {
                (0, lifecycle_1.dispose)(this.currentStatusMessage[1]);
            }
            // Create new
            let statusMessageEntry;
            let showHandle = setTimeout(() => {
                statusMessageEntry = this.statusbarService.addEntry({ text: message, ariaLabel: message }, 'status.message', (0, nls_1.localize)(10, null), 0 /* LEFT */, -Number.MAX_VALUE /* far right on left hand side */);
                showHandle = null;
            }, showAfter);
            // Dispose function takes care of timeouts and actual entry
            let hideHandle;
            const statusMessageDispose = {
                dispose: () => {
                    if (showHandle) {
                        clearTimeout(showHandle);
                    }
                    if (hideHandle) {
                        clearTimeout(hideHandle);
                    }
                    if (statusMessageEntry) {
                        statusMessageEntry.dispose();
                    }
                }
            };
            if (hideAfter > 0) {
                hideHandle = setTimeout(() => statusMessageDispose.dispose(), hideAfter);
            }
            // Remember as current status message
            this.currentStatusMessage = [item, statusMessageDispose];
        }
    };
    NotificationsStatus = __decorate([
        __param(1, statusbar_1.IStatusbarService)
    ], NotificationsStatus);
    exports.NotificationsStatus = NotificationsStatus;
});
//# sourceMappingURL=notificationsStatus.js.map