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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "./scm", "vs/platform/log/common/log", "vs/platform/contextkey/common/contextkey", "vs/platform/storage/common/storage", "vs/base/common/history"], function (require, exports, lifecycle_1, event_1, scm_1, log_1, contextkey_1, storage_1, history_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SCMService = void 0;
    let SCMInput = class SCMInput {
        constructor(repository, storageService) {
            var _a;
            this.repository = repository;
            this.storageService = storageService;
            this._value = '';
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._placeholder = '';
            this._onDidChangePlaceholder = new event_1.Emitter();
            this.onDidChangePlaceholder = this._onDidChangePlaceholder.event;
            this._visible = true;
            this._onDidChangeVisibility = new event_1.Emitter();
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this._onDidChangeFocus = new event_1.Emitter();
            this.onDidChangeFocus = this._onDidChangeFocus.event;
            this._onDidChangeValidationMessage = new event_1.Emitter();
            this.onDidChangeValidationMessage = this._onDidChangeValidationMessage.event;
            this._validateInput = () => Promise.resolve(undefined);
            this._onDidChangeValidateInput = new event_1.Emitter();
            this.onDidChangeValidateInput = this._onDidChangeValidateInput.event;
            const historyKey = `scm/input:${this.repository.provider.label}:${(_a = this.repository.provider.rootUri) === null || _a === void 0 ? void 0 : _a.path}`;
            let history;
            let rawHistory = this.storageService.get(historyKey, 0 /* GLOBAL */, '');
            if (rawHistory) {
                try {
                    history = JSON.parse(rawHistory);
                }
                catch (_b) {
                    // noop
                }
            }
            if (!history || history.length === 0) {
                history = [this._value];
            }
            else {
                this._value = history[history.length - 1];
            }
            this.historyNavigator = new history_1.HistoryNavigator2(history, 50);
            this.storageService.onWillSaveState(e => {
                if (this.historyNavigator.isAtEnd()) {
                    this.historyNavigator.replaceLast(this._value);
                }
                if (this.repository.provider.rootUri) {
                    this.storageService.store(historyKey, JSON.stringify([...this.historyNavigator]), 0 /* GLOBAL */, 0 /* USER */);
                }
            });
        }
        get value() {
            return this._value;
        }
        get placeholder() {
            return this._placeholder;
        }
        set placeholder(placeholder) {
            this._placeholder = placeholder;
            this._onDidChangePlaceholder.fire(placeholder);
        }
        get visible() {
            return this._visible;
        }
        set visible(visible) {
            this._visible = visible;
            this._onDidChangeVisibility.fire(visible);
        }
        setFocus() {
            this._onDidChangeFocus.fire();
        }
        showValidationMessage(message, type) {
            this._onDidChangeValidationMessage.fire({ message: message, type: type });
        }
        get validateInput() {
            return this._validateInput;
        }
        set validateInput(validateInput) {
            this._validateInput = validateInput;
            this._onDidChangeValidateInput.fire();
        }
        setValue(value, transient, reason) {
            if (value === this._value) {
                return;
            }
            if (!transient) {
                this.historyNavigator.replaceLast(this._value);
                this.historyNavigator.add(value);
            }
            this._value = value;
            this._onDidChange.fire({ value, reason });
        }
        showNextHistoryValue() {
            if (this.historyNavigator.isAtEnd()) {
                return;
            }
            else if (!this.historyNavigator.has(this.value)) {
                this.historyNavigator.replaceLast(this._value);
                this.historyNavigator.resetCursor();
            }
            const value = this.historyNavigator.next();
            this.setValue(value, true, scm_1.SCMInputChangeReason.HistoryNext);
        }
        showPreviousHistoryValue() {
            if (this.historyNavigator.isAtEnd()) {
                this.historyNavigator.replaceLast(this._value);
            }
            else if (!this.historyNavigator.has(this._value)) {
                this.historyNavigator.replaceLast(this._value);
                this.historyNavigator.resetCursor();
            }
            const value = this.historyNavigator.previous();
            this.setValue(value, true, scm_1.SCMInputChangeReason.HistoryPrevious);
        }
    };
    SCMInput = __decorate([
        __param(1, storage_1.IStorageService)
    ], SCMInput);
    let SCMRepository = class SCMRepository {
        constructor(provider, disposable, storageService) {
            this.provider = provider;
            this.disposable = disposable;
            this.storageService = storageService;
            this._selected = false;
            this._onDidChangeSelection = new event_1.Emitter();
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this.input = new SCMInput(this, this.storageService);
        }
        get selected() {
            return this._selected;
        }
        setSelected(selected) {
            if (this._selected === selected) {
                return;
            }
            this._selected = selected;
            this._onDidChangeSelection.fire(selected);
        }
        dispose() {
            this.disposable.dispose();
            this.provider.dispose();
        }
    };
    SCMRepository = __decorate([
        __param(2, storage_1.IStorageService)
    ], SCMRepository);
    let SCMService = class SCMService {
        constructor(logService, contextKeyService, storageService) {
            this.logService = logService;
            this.storageService = storageService;
            this._providerIds = new Set();
            this._repositories = [];
            this._onDidAddProvider = new event_1.Emitter();
            this.onDidAddRepository = this._onDidAddProvider.event;
            this._onDidRemoveProvider = new event_1.Emitter();
            this.onDidRemoveRepository = this._onDidRemoveProvider.event;
            this.providerCount = contextKeyService.createKey('scm.providerCount', 0);
        }
        get repositories() { return [...this._repositories]; }
        registerSCMProvider(provider) {
            this.logService.trace('SCMService#registerSCMProvider');
            if (this._providerIds.has(provider.id)) {
                throw new Error(`SCM Provider ${provider.id} already exists.`);
            }
            this._providerIds.add(provider.id);
            const disposable = (0, lifecycle_1.toDisposable)(() => {
                const index = this._repositories.indexOf(repository);
                if (index < 0) {
                    return;
                }
                this._providerIds.delete(provider.id);
                this._repositories.splice(index, 1);
                this._onDidRemoveProvider.fire(repository);
                this.providerCount.set(this._repositories.length);
            });
            const repository = new SCMRepository(provider, disposable, this.storageService);
            this._repositories.push(repository);
            this._onDidAddProvider.fire(repository);
            this.providerCount.set(this._repositories.length);
            return repository;
        }
    };
    SCMService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, storage_1.IStorageService)
    ], SCMService);
    exports.SCMService = SCMService;
});
//# sourceMappingURL=scmService.js.map