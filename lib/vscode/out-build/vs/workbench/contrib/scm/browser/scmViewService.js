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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/event", "vs/workbench/contrib/scm/common/scm", "vs/base/common/iterator", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/scm/browser/menus", "vs/platform/storage/common/storage", "vs/base/common/decorators", "vs/platform/log/common/log"], function (require, exports, lifecycle_1, event_1, scm_1, iterator_1, instantiation_1, menus_1, storage_1, decorators_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SCMViewService = void 0;
    function getProviderStorageKey(provider) {
        return `${provider.contextValue}:${provider.label}${provider.rootUri ? `:${provider.rootUri.toString()}` : ''}`;
    }
    let SCMViewService = class SCMViewService {
        constructor(scmService, instantiationService, storageService, logService) {
            this.scmService = scmService;
            this.storageService = storageService;
            this.logService = logService;
            this.didFinishLoading = false;
            this.disposables = new lifecycle_1.DisposableStore();
            this._visibleRepositoriesSet = new Set();
            this._visibleRepositories = [];
            this._onDidChangeRepositories = new event_1.Emitter();
            this._onDidSetVisibleRepositories = new event_1.Emitter();
            this.onDidChangeVisibleRepositories = event_1.Event.any(this._onDidSetVisibleRepositories.event, event_1.Event.debounce(this._onDidChangeRepositories.event, (last, e) => {
                if (!last) {
                    return e;
                }
                return {
                    added: iterator_1.Iterable.concat(last.added, e.added),
                    removed: iterator_1.Iterable.concat(last.removed, e.removed),
                };
            }, 0));
            this._onDidFocusRepository = new event_1.Emitter();
            this.onDidFocusRepository = this._onDidFocusRepository.event;
            this.menus = instantiationService.createInstance(menus_1.SCMMenus);
            scmService.onDidAddRepository(this.onDidAddRepository, this, this.disposables);
            scmService.onDidRemoveRepository(this.onDidRemoveRepository, this, this.disposables);
            for (const repository of scmService.repositories) {
                this.onDidAddRepository(repository);
            }
            try {
                this.previousState = JSON.parse(storageService.get('scm:view:visibleRepositories', 1 /* WORKSPACE */, ''));
                this.eventuallyFinishLoading();
            }
            catch (_a) {
                // noop
            }
            storageService.onWillSaveState(this.onWillSaveState, this, this.disposables);
        }
        get visibleRepositories() {
            return this._visibleRepositories;
        }
        set visibleRepositories(visibleRepositories) {
            const set = new Set(visibleRepositories);
            const added = new Set();
            const removed = new Set();
            for (const repository of visibleRepositories) {
                if (!this._visibleRepositoriesSet.has(repository)) {
                    added.add(repository);
                }
            }
            for (const repository of this._visibleRepositories) {
                if (!set.has(repository)) {
                    removed.add(repository);
                }
            }
            if (added.size === 0 && removed.size === 0) {
                return;
            }
            this._visibleRepositories = visibleRepositories;
            this._visibleRepositoriesSet = set;
            this._onDidSetVisibleRepositories.fire({ added, removed });
            if (this._focusedRepository && removed.has(this._focusedRepository)) {
                this.focus(this._visibleRepositories[0]);
            }
        }
        get focusedRepository() {
            return this._focusedRepository;
        }
        onDidAddRepository(repository) {
            this.logService.trace('SCMViewService#onDidAddRepository', getProviderStorageKey(repository.provider));
            if (!this.didFinishLoading) {
                this.eventuallyFinishLoading();
            }
            let removed = iterator_1.Iterable.empty();
            if (this.previousState) {
                const index = this.previousState.all.indexOf(getProviderStorageKey(repository.provider));
                if (index === -1) { // saw a repo we did not expect
                    this.logService.trace('SCMViewService#onDidAddRepository', 'This is a new repository, so we stop the heuristics');
                    const added = [];
                    for (const repo of this.scmService.repositories) { // all should be visible
                        if (!this._visibleRepositoriesSet.has(repo)) {
                            added.push(repository);
                        }
                    }
                    this._visibleRepositories = [...this.scmService.repositories];
                    this._visibleRepositoriesSet = new Set(this.scmService.repositories);
                    this._onDidChangeRepositories.fire({ added, removed: iterator_1.Iterable.empty() });
                    this.finishLoading();
                    return;
                }
                const visible = this.previousState.visible.indexOf(index) > -1;
                if (!visible) {
                    if (this._visibleRepositories.length === 0) { // should make it visible, until other repos come along
                        this.provisionalVisibleRepository = repository;
                    }
                    else {
                        return;
                    }
                }
                else {
                    if (this.provisionalVisibleRepository) {
                        this._visibleRepositories = [];
                        this._visibleRepositoriesSet = new Set();
                        removed = [this.provisionalVisibleRepository];
                        this.provisionalVisibleRepository = undefined;
                    }
                }
            }
            this._visibleRepositories.push(repository);
            this._visibleRepositoriesSet.add(repository);
            this._onDidChangeRepositories.fire({ added: [repository], removed });
            if (!this._focusedRepository) {
                this.focus(repository);
            }
        }
        onDidRemoveRepository(repository) {
            this.logService.trace('SCMViewService#onDidRemoveRepository', getProviderStorageKey(repository.provider));
            if (!this.didFinishLoading) {
                this.eventuallyFinishLoading();
            }
            const index = this._visibleRepositories.indexOf(repository);
            if (index > -1) {
                let added = iterator_1.Iterable.empty();
                this._visibleRepositories.splice(index, 1);
                this._visibleRepositoriesSet.delete(repository);
                if (this._visibleRepositories.length === 0 && this.scmService.repositories.length > 0) {
                    const first = this.scmService.repositories[0];
                    this._visibleRepositories.push(first);
                    this._visibleRepositoriesSet.add(first);
                    added = [first];
                }
                this._onDidChangeRepositories.fire({ added, removed: [repository] });
            }
            if (this._focusedRepository === repository) {
                this.focus(this._visibleRepositories[0]);
            }
        }
        isVisible(repository) {
            return this._visibleRepositoriesSet.has(repository);
        }
        toggleVisibility(repository, visible) {
            if (typeof visible === 'undefined') {
                visible = !this.isVisible(repository);
            }
            else if (this.isVisible(repository) === visible) {
                return;
            }
            if (visible) {
                this.visibleRepositories = [...this.visibleRepositories, repository];
            }
            else {
                const index = this.visibleRepositories.indexOf(repository);
                if (index > -1) {
                    this.visibleRepositories = [
                        ...this.visibleRepositories.slice(0, index),
                        ...this.visibleRepositories.slice(index + 1)
                    ];
                }
            }
        }
        focus(repository) {
            if (repository && !this.visibleRepositories.includes(repository)) {
                return;
            }
            this._focusedRepository = repository;
            this._onDidFocusRepository.fire(repository);
        }
        onWillSaveState() {
            if (!this.didFinishLoading) { // don't remember state, if the workbench didn't really finish loading
                return;
            }
            const all = this.scmService.repositories.map(r => getProviderStorageKey(r.provider));
            const visible = this.visibleRepositories.map(r => all.indexOf(getProviderStorageKey(r.provider)));
            const raw = JSON.stringify({ all, visible });
            this.storageService.store('scm:view:visibleRepositories', raw, 1 /* WORKSPACE */, 1 /* MACHINE */);
        }
        eventuallyFinishLoading() {
            this.logService.trace('SCMViewService#eventuallyFinishLoading');
            this.finishLoading();
        }
        finishLoading() {
            if (this.didFinishLoading) {
                return;
            }
            this.logService.trace('SCMViewService#finishLoading');
            this.didFinishLoading = true;
            this.previousState = undefined;
        }
        dispose() {
            this.disposables.dispose();
            this._onDidChangeRepositories.dispose();
            this._onDidSetVisibleRepositories.dispose();
        }
    };
    __decorate([
        (0, decorators_1.debounce)(2000)
    ], SCMViewService.prototype, "eventuallyFinishLoading", null);
    SCMViewService = __decorate([
        __param(0, scm_1.ISCMService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, storage_1.IStorageService),
        __param(3, log_1.ILogService)
    ], SCMViewService);
    exports.SCMViewService = SCMViewService;
});
//# sourceMappingURL=scmViewService.js.map