var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/path", "vs/nls!vs/server/browser/client", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configurationRegistry", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/extensions", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/registry/common/platform", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/server/common/telemetry", "vs/server/common/util", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/contrib/localizations/browser/localizations.contribution", "vs/workbench/services/localizations/browser/localizationsService"], function (require, exports, path, nls_1, actions_1, commands_1, configurationRegistry_1, contextkey_1, extensions_1, log_1, notification_1, platform_1, storage_1, telemetry_1, telemetry_2, util_1, remoteAgentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initialize = void 0;
    /**
     * All client-side customization to VS Code should live in this file when
     * possible.
     */
    const options = (0, util_1.getOptions)();
    let TelemetryService = class TelemetryService extends telemetry_2.TelemetryChannelClient {
        constructor(remoteAgentService) {
            super(remoteAgentService.getConnection().getChannel('telemetry'));
        }
    };
    TelemetryService = __decorate([
        __param(0, remoteAgentService_1.IRemoteAgentService)
    ], TelemetryService);
    const TELEMETRY_SECTION_ID = 'telemetry';
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        'id': TELEMETRY_SECTION_ID,
        'order': 110,
        'type': 'object',
        'title': (0, nls_1.localize)(0, null),
        'properties': {
            'telemetry.enableTelemetry': {
                'type': 'boolean',
                'description': (0, nls_1.localize)(1, null),
                'default': !options.disableTelemetry,
                'tags': ['usesOnlineServices']
            }
        }
    });
    (0, extensions_1.registerSingleton)(telemetry_1.ITelemetryService, TelemetryService);
    /**
     * This is called by vs/workbench/browser/web.main.ts after the workbench has
     * been initialized so we can initialize our own client-side code.
     */
    const initialize = async (services) => {
        const event = new CustomEvent('ide-ready');
        window.dispatchEvent(event);
        if (parent) {
            // Tell the parent loading has completed.
            parent.postMessage({ event: 'loaded' }, '*');
            // Proxy or stop proxing events as requested by the parent.
            const listeners = new Map();
            window.addEventListener('message', (parentEvent) => {
                const eventName = parentEvent.data.bind || parentEvent.data.unbind;
                if (eventName) {
                    const oldListener = listeners.get(eventName);
                    if (oldListener) {
                        document.removeEventListener(eventName, oldListener);
                    }
                }
                if (parentEvent.data.bind && parentEvent.data.prop) {
                    const listener = (event) => {
                        parent.postMessage({
                            event: parentEvent.data.event,
                            [parentEvent.data.prop]: event[parentEvent.data.prop]
                        }, window.location.origin);
                    };
                    listeners.set(parentEvent.data.bind, listener);
                    document.addEventListener(parentEvent.data.bind, listener);
                }
            });
        }
        if (!window.isSecureContext) {
            services.get(notification_1.INotificationService).notify({
                severity: notification_1.Severity.Warning,
                message: 'code-server is being accessed over an insecure domain. Web views, the clipboard, and other functionality will not work as expected.',
                actions: {
                    primary: [{
                            id: 'understand',
                            label: 'I understand',
                            tooltip: '',
                            class: undefined,
                            enabled: true,
                            checked: true,
                            dispose: () => undefined,
                            run: () => {
                                return Promise.resolve();
                            }
                        }],
                }
            });
        }
        const logService = services.get(log_1.ILogService);
        const storageService = services.get(storage_1.IStorageService);
        const updateCheckEndpoint = path.join(options.base, '/update/check');
        const getUpdate = async () => {
            logService.debug('Checking for update...');
            const response = await fetch(updateCheckEndpoint, {
                headers: { 'Accept': 'application/json' },
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            const json = await response.json();
            if (json.error) {
                throw new Error(json.error);
            }
            if (json.isLatest) {
                return;
            }
            const lastNoti = storageService.getNumber('csLastUpdateNotification', 0 /* GLOBAL */);
            if (lastNoti) {
                // Only remind them again after 1 week.
                const timeout = 1000 * 60 * 60 * 24 * 7;
                const threshold = lastNoti + timeout;
                if (Date.now() < threshold) {
                    return;
                }
            }
            storageService.store('csLastUpdateNotification', Date.now(), 0 /* GLOBAL */, 1 /* MACHINE */);
            services.get(notification_1.INotificationService).notify({
                severity: notification_1.Severity.Info,
                message: `[code-server v${json.latest}](https://github.com/cdr/code-server/releases/tag/v${json.latest}) has been released!`,
            });
        };
        const updateLoop = () => {
            getUpdate().catch((error) => {
                logService.debug(`failed to check for update: ${error}`);
            }).finally(() => {
                // Check again every 6 hours.
                setTimeout(updateLoop, 1000 * 60 * 60 * 6);
            });
        };
        if (!options.disableUpdateCheck) {
            updateLoop();
        }
        // This will be used to set the background color while VS Code loads.
        const theme = storageService.get('colorThemeData', 0 /* GLOBAL */);
        if (theme) {
            localStorage.setItem('colorThemeData', theme);
        }
        // Use to show or hide logout commands and menu options.
        const contextKeyService = services.get(contextkey_1.IContextKeyService);
        contextKeyService.createKey('code-server.authed', options.authed);
        // Add a logout command.
        const logoutEndpoint = path.join(options.base, '/logout') + `?base=${options.base}`;
        const LOGOUT_COMMAND_ID = 'code-server.logout';
        commands_1.CommandsRegistry.registerCommand(LOGOUT_COMMAND_ID, () => {
            window.location.href = logoutEndpoint;
        });
        // Add logout to command palette.
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
            command: {
                id: LOGOUT_COMMAND_ID,
                title: (0, nls_1.localize)(2, null)
            },
            when: contextkey_1.ContextKeyExpr.has('code-server.authed')
        });
        // Add logout to the (web-only) home menu.
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHomeMenu, {
            command: {
                id: LOGOUT_COMMAND_ID,
                title: (0, nls_1.localize)(3, null)
            },
            when: contextkey_1.ContextKeyExpr.has('code-server.authed')
        });
    };
    exports.initialize = initialize;
});
//# sourceMappingURL=client.js.map