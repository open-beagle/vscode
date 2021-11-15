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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/electron-browser/extensionProfileService", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extensions", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/workbench/services/statusbar/common/statusbar", "vs/workbench/contrib/extensions/electron-browser/runtimeExtensionsEditor", "vs/workbench/services/editor/common/editorService", "vs/platform/native/electron-sandbox/native", "vs/platform/dialogs/common/dialogs", "vs/base/node/ports", "vs/platform/product/common/productService", "vs/workbench/contrib/extensions/common/runtimeExtensionsInput", "vs/platform/extensions/common/extensions", "vs/workbench/services/extensions/electron-browser/extensionHostProfiler", "vs/platform/commands/common/commands"], function (require, exports, nls, event_1, instantiation_1, extensions_1, lifecycle_1, errors_1, statusbar_1, runtimeExtensionsEditor_1, editorService_1, native_1, dialogs_1, ports_1, productService_1, runtimeExtensionsInput_1, extensions_2, extensionHostProfiler_1, commands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionHostProfileService = void 0;
    let ExtensionHostProfileService = class ExtensionHostProfileService extends lifecycle_1.Disposable {
        constructor(_extensionService, _editorService, _instantiationService, _nativeHostService, _dialogService, _statusbarService, _productService) {
            super();
            this._extensionService = _extensionService;
            this._editorService = _editorService;
            this._instantiationService = _instantiationService;
            this._nativeHostService = _nativeHostService;
            this._dialogService = _dialogService;
            this._statusbarService = _statusbarService;
            this._productService = _productService;
            this._onDidChangeState = this._register(new event_1.Emitter());
            this.onDidChangeState = this._onDidChangeState.event;
            this._onDidChangeLastProfile = this._register(new event_1.Emitter());
            this.onDidChangeLastProfile = this._onDidChangeLastProfile.event;
            this._unresponsiveProfiles = new Map();
            this._state = runtimeExtensionsEditor_1.ProfileSessionState.None;
            this.profilingStatusBarIndicatorLabelUpdater = this._register(new lifecycle_1.MutableDisposable());
            this._profile = null;
            this._profileSession = null;
            this._setState(runtimeExtensionsEditor_1.ProfileSessionState.None);
            commands_1.CommandsRegistry.registerCommand('workbench.action.extensionHostProfiler.stop', () => {
                this.stopProfiling();
                this._editorService.openEditor(runtimeExtensionsInput_1.RuntimeExtensionsInput.instance, { revealIfOpened: true, pinned: true });
            });
        }
        get state() { return this._state; }
        get lastProfile() { return this._profile; }
        _setState(state) {
            if (this._state === state) {
                return;
            }
            this._state = state;
            if (this._state === runtimeExtensionsEditor_1.ProfileSessionState.Running) {
                this.updateProfilingStatusBarIndicator(true);
            }
            else if (this._state === runtimeExtensionsEditor_1.ProfileSessionState.Stopping) {
                this.updateProfilingStatusBarIndicator(false);
            }
            this._onDidChangeState.fire(undefined);
        }
        updateProfilingStatusBarIndicator(visible) {
            this.profilingStatusBarIndicatorLabelUpdater.clear();
            if (visible) {
                const indicator = {
                    text: nls.localize(0, null),
                    showProgress: true,
                    ariaLabel: nls.localize(1, null),
                    tooltip: nls.localize(2, null),
                    command: 'workbench.action.extensionHostProfiler.stop'
                };
                const timeStarted = Date.now();
                const handle = setInterval(() => {
                    if (this.profilingStatusBarIndicator) {
                        this.profilingStatusBarIndicator.update(Object.assign(Object.assign({}, indicator), { text: nls.localize(3, null, Math.round((new Date().getTime() - timeStarted) / 1000)) }));
                    }
                }, 1000);
                this.profilingStatusBarIndicatorLabelUpdater.value = (0, lifecycle_1.toDisposable)(() => clearInterval(handle));
                if (!this.profilingStatusBarIndicator) {
                    this.profilingStatusBarIndicator = this._statusbarService.addEntry(indicator, 'status.profiler', nls.localize(4, null), 1 /* RIGHT */);
                }
                else {
                    this.profilingStatusBarIndicator.update(indicator);
                }
            }
            else {
                if (this.profilingStatusBarIndicator) {
                    this.profilingStatusBarIndicator.dispose();
                    this.profilingStatusBarIndicator = undefined;
                }
            }
        }
        async startProfiling() {
            if (this._state !== runtimeExtensionsEditor_1.ProfileSessionState.None) {
                return null;
            }
            const inspectPort = await this._extensionService.getInspectPort(true);
            if (!inspectPort) {
                return this._dialogService.confirm({
                    type: 'info',
                    message: nls.localize(5, null),
                    detail: nls.localize(6, null, this._productService.nameLong),
                    primaryButton: nls.localize(7, null),
                    secondaryButton: nls.localize(8, null)
                }).then(res => {
                    if (res.confirmed) {
                        this._nativeHostService.relaunch({ addArgs: [`--inspect-extensions=${(0, ports_1.randomPort)()}`] });
                    }
                });
            }
            this._setState(runtimeExtensionsEditor_1.ProfileSessionState.Starting);
            return this._instantiationService.createInstance(extensionHostProfiler_1.ExtensionHostProfiler, inspectPort).start().then((value) => {
                this._profileSession = value;
                this._setState(runtimeExtensionsEditor_1.ProfileSessionState.Running);
            }, (err) => {
                (0, errors_1.onUnexpectedError)(err);
                this._setState(runtimeExtensionsEditor_1.ProfileSessionState.None);
            });
        }
        stopProfiling() {
            if (this._state !== runtimeExtensionsEditor_1.ProfileSessionState.Running || !this._profileSession) {
                return;
            }
            this._setState(runtimeExtensionsEditor_1.ProfileSessionState.Stopping);
            this._profileSession.stop().then((result) => {
                this._setLastProfile(result);
                this._setState(runtimeExtensionsEditor_1.ProfileSessionState.None);
            }, (err) => {
                (0, errors_1.onUnexpectedError)(err);
                this._setState(runtimeExtensionsEditor_1.ProfileSessionState.None);
            });
            this._profileSession = null;
        }
        _setLastProfile(profile) {
            this._profile = profile;
            this._onDidChangeLastProfile.fire(undefined);
        }
        getUnresponsiveProfile(extensionId) {
            return this._unresponsiveProfiles.get(extensions_2.ExtensionIdentifier.toKey(extensionId));
        }
        setUnresponsiveProfile(extensionId, profile) {
            this._unresponsiveProfiles.set(extensions_2.ExtensionIdentifier.toKey(extensionId), profile);
            this._setLastProfile(profile);
        }
    };
    ExtensionHostProfileService = __decorate([
        __param(0, extensions_1.IExtensionService),
        __param(1, editorService_1.IEditorService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, native_1.INativeHostService),
        __param(4, dialogs_1.IDialogService),
        __param(5, statusbar_1.IStatusbarService),
        __param(6, productService_1.IProductService)
    ], ExtensionHostProfileService);
    exports.ExtensionHostProfileService = ExtensionHostProfileService;
});
//# sourceMappingURL=extensionProfileService.js.map