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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/notifications/notificationsActions", "vs/base/common/actions", "vs/platform/telemetry/common/telemetry", "vs/platform/notification/common/notification", "vs/workbench/browser/parts/notifications/notificationsCommands", "vs/platform/commands/common/commands", "vs/platform/clipboard/common/clipboardService", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/base/common/hash", "vs/css!./media/notificationsActions"], function (require, exports, nls_1, actions_1, telemetry_1, notification_1, notificationsCommands_1, commands_1, clipboardService_1, codicons_1, iconRegistry_1, themeService_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotificationActionRunner = exports.CopyNotificationMessageAction = exports.ConfigureNotificationAction = exports.CollapseNotificationAction = exports.ExpandNotificationAction = exports.HideNotificationsCenterAction = exports.ClearAllNotificationsAction = exports.ClearNotificationAction = void 0;
    const clearIcon = (0, iconRegistry_1.registerIcon)('notifications-clear', codicons_1.Codicon.close, (0, nls_1.localize)(0, null));
    const clearAllIcon = (0, iconRegistry_1.registerIcon)('notifications-clear-all', codicons_1.Codicon.clearAll, (0, nls_1.localize)(1, null));
    const hideIcon = (0, iconRegistry_1.registerIcon)('notifications-hide', codicons_1.Codicon.chevronDown, (0, nls_1.localize)(2, null));
    const expandIcon = (0, iconRegistry_1.registerIcon)('notifications-expand', codicons_1.Codicon.chevronUp, (0, nls_1.localize)(3, null));
    const collapseIcon = (0, iconRegistry_1.registerIcon)('notifications-collapse', codicons_1.Codicon.chevronDown, (0, nls_1.localize)(4, null));
    const configureIcon = (0, iconRegistry_1.registerIcon)('notifications-configure', codicons_1.Codicon.gear, (0, nls_1.localize)(5, null));
    let ClearNotificationAction = class ClearNotificationAction extends actions_1.Action {
        constructor(id, label, commandService) {
            super(id, label, themeService_1.ThemeIcon.asClassName(clearIcon));
            this.commandService = commandService;
        }
        async run(notification) {
            this.commandService.executeCommand(notificationsCommands_1.CLEAR_NOTIFICATION, notification);
        }
    };
    ClearNotificationAction.ID = notificationsCommands_1.CLEAR_NOTIFICATION;
    ClearNotificationAction.LABEL = (0, nls_1.localize)(6, null);
    ClearNotificationAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], ClearNotificationAction);
    exports.ClearNotificationAction = ClearNotificationAction;
    let ClearAllNotificationsAction = class ClearAllNotificationsAction extends actions_1.Action {
        constructor(id, label, commandService) {
            super(id, label, themeService_1.ThemeIcon.asClassName(clearAllIcon));
            this.commandService = commandService;
        }
        async run() {
            this.commandService.executeCommand(notificationsCommands_1.CLEAR_ALL_NOTIFICATIONS);
        }
    };
    ClearAllNotificationsAction.ID = notificationsCommands_1.CLEAR_ALL_NOTIFICATIONS;
    ClearAllNotificationsAction.LABEL = (0, nls_1.localize)(7, null);
    ClearAllNotificationsAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], ClearAllNotificationsAction);
    exports.ClearAllNotificationsAction = ClearAllNotificationsAction;
    let HideNotificationsCenterAction = class HideNotificationsCenterAction extends actions_1.Action {
        constructor(id, label, commandService) {
            super(id, label, themeService_1.ThemeIcon.asClassName(hideIcon));
            this.commandService = commandService;
        }
        async run() {
            this.commandService.executeCommand(notificationsCommands_1.HIDE_NOTIFICATIONS_CENTER);
        }
    };
    HideNotificationsCenterAction.ID = notificationsCommands_1.HIDE_NOTIFICATIONS_CENTER;
    HideNotificationsCenterAction.LABEL = (0, nls_1.localize)(8, null);
    HideNotificationsCenterAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], HideNotificationsCenterAction);
    exports.HideNotificationsCenterAction = HideNotificationsCenterAction;
    let ExpandNotificationAction = class ExpandNotificationAction extends actions_1.Action {
        constructor(id, label, commandService) {
            super(id, label, themeService_1.ThemeIcon.asClassName(expandIcon));
            this.commandService = commandService;
        }
        async run(notification) {
            this.commandService.executeCommand(notificationsCommands_1.EXPAND_NOTIFICATION, notification);
        }
    };
    ExpandNotificationAction.ID = notificationsCommands_1.EXPAND_NOTIFICATION;
    ExpandNotificationAction.LABEL = (0, nls_1.localize)(9, null);
    ExpandNotificationAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], ExpandNotificationAction);
    exports.ExpandNotificationAction = ExpandNotificationAction;
    let CollapseNotificationAction = class CollapseNotificationAction extends actions_1.Action {
        constructor(id, label, commandService) {
            super(id, label, themeService_1.ThemeIcon.asClassName(collapseIcon));
            this.commandService = commandService;
        }
        async run(notification) {
            this.commandService.executeCommand(notificationsCommands_1.COLLAPSE_NOTIFICATION, notification);
        }
    };
    CollapseNotificationAction.ID = notificationsCommands_1.COLLAPSE_NOTIFICATION;
    CollapseNotificationAction.LABEL = (0, nls_1.localize)(10, null);
    CollapseNotificationAction = __decorate([
        __param(2, commands_1.ICommandService)
    ], CollapseNotificationAction);
    exports.CollapseNotificationAction = CollapseNotificationAction;
    class ConfigureNotificationAction extends actions_1.Action {
        constructor(id, label, configurationActions) {
            super(id, label, themeService_1.ThemeIcon.asClassName(configureIcon));
            this.configurationActions = configurationActions;
        }
    }
    exports.ConfigureNotificationAction = ConfigureNotificationAction;
    ConfigureNotificationAction.ID = 'workbench.action.configureNotification';
    ConfigureNotificationAction.LABEL = (0, nls_1.localize)(11, null);
    let CopyNotificationMessageAction = class CopyNotificationMessageAction extends actions_1.Action {
        constructor(id, label, clipboardService) {
            super(id, label);
            this.clipboardService = clipboardService;
        }
        run(notification) {
            return this.clipboardService.writeText(notification.message.raw);
        }
    };
    CopyNotificationMessageAction.ID = 'workbench.action.copyNotificationMessage';
    CopyNotificationMessageAction.LABEL = (0, nls_1.localize)(12, null);
    CopyNotificationMessageAction = __decorate([
        __param(2, clipboardService_1.IClipboardService)
    ], CopyNotificationMessageAction);
    exports.CopyNotificationMessageAction = CopyNotificationMessageAction;
    let NotificationActionRunner = class NotificationActionRunner extends actions_1.ActionRunner {
        constructor(telemetryService, notificationService) {
            super();
            this.telemetryService = telemetryService;
            this.notificationService = notificationService;
        }
        async runAction(action, context) {
            this.telemetryService.publicLog2('workbenchActionExecuted', { id: action.id, from: 'message' });
            if (context) {
                // If the context is not present it is a "global" notification action. Will be captured by other events
                this.telemetryService.publicLog2('notification:actionExecuted', { id: (0, hash_1.hash)(context.message.original.toString()).toString(), actionLabel: action.label, source: context.sourceId || 'core', silent: context.silent });
            }
            // Run and make sure to notify on any error again
            try {
                await super.runAction(action, context);
            }
            catch (error) {
                this.notificationService.error(error);
            }
        }
    };
    NotificationActionRunner = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, notification_1.INotificationService)
    ], NotificationActionRunner);
    exports.NotificationActionRunner = NotificationActionRunner;
});
//# sourceMappingURL=notificationsActions.js.map