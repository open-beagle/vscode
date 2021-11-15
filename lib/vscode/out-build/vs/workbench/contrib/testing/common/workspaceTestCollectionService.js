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
define(["require", "exports", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/testing/common/testService"], function (require, exports, event_1, iterator_1, lifecycle_1, instantiation_1, workspace_1, testService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkspaceTestCollectionService = exports.IWorkspaceTestCollectionService = exports.TestSubscriptionListener = void 0;
    class TestSubscriptionListener extends lifecycle_1.Disposable {
        constructor(subscription, onDispose) {
            super();
            this.subscription = subscription;
            this.onDispose = onDispose;
            this.onDiffEmitter = new event_1.Emitter();
            this.onFolderChangeEmitter = new event_1.Emitter();
            this.onDiff = this.onDiffEmitter.event;
            this.onFolderChange = this.onFolderChangeEmitter.event;
            this._register((0, lifecycle_1.toDisposable)(onDispose));
        }
        get workspaceFolders() {
            return this.subscription.workspaceFolders;
        }
        get workspaceFolderCollections() {
            return this.subscription.workspaceFolderCollections;
        }
        async waitForAllRoots(token) {
            await Promise.all(this.subscription.workspaceFolderCollections.map(([, c]) => (0, testService_1.waitForAllRoots)(c, token)));
        }
        publishFolderChange(evt) {
            this.onFolderChangeEmitter.fire(evt);
        }
        publishDiff(folder, diff) {
            this.onDiffEmitter.fire([folder, diff]);
        }
    }
    exports.TestSubscriptionListener = TestSubscriptionListener;
    exports.IWorkspaceTestCollectionService = (0, instantiation_1.createDecorator)('ITestingViewService');
    let WorkspaceTestCollectionService = class WorkspaceTestCollectionService {
        constructor(instantiationService) {
            this.instantiationService = instantiationService;
        }
        workspaceFolders() {
            var _a;
            return ((_a = this.subscription) === null || _a === void 0 ? void 0 : _a.workspaceFolders) || [];
        }
        /**
         * @inheritdoc
         */
        subscribeToWorkspaceTests() {
            if (!this.subscription) {
                this.subscription = this.instantiationService.createInstance(TestSubscription);
            }
            const listener = new TestSubscriptionListener(this.subscription, () => {
                if (!this.subscription) {
                    return;
                }
                this.subscription.removeListener(listener);
                if (this.subscription.listenerCount === 0) {
                    this.subscription.dispose();
                    this.subscription = undefined;
                }
            });
            this.subscription.addListener(listener);
            return listener;
        }
    };
    WorkspaceTestCollectionService = __decorate([
        __param(0, instantiation_1.IInstantiationService)
    ], WorkspaceTestCollectionService);
    exports.WorkspaceTestCollectionService = WorkspaceTestCollectionService;
    let TestSubscription = class TestSubscription extends lifecycle_1.Disposable {
        constructor(workspaceContext, testService) {
            super();
            this.testService = testService;
            this.listeners = new Set();
            this.pendingRootChangeEmitter = new event_1.Emitter();
            this.busyProvidersChangeEmitter = new event_1.Emitter();
            this.collectionsForWorkspaces = new Map();
            this.onPendingRootProvidersChange = this.pendingRootChangeEmitter.event;
            this.onBusyProvidersChange = this.busyProvidersChangeEmitter.event;
            this._register((0, lifecycle_1.toDisposable)(() => {
                for (const { listener } of this.collectionsForWorkspaces.values()) {
                    listener.dispose();
                }
            }));
            this._register(workspaceContext.onDidChangeWorkspaceFolders(evt => {
                for (const folder of evt.added) {
                    this.subscribeToWorkspace(folder);
                }
                for (const folder of evt.removed) {
                    const existing = this.collectionsForWorkspaces.get(folder.uri.toString());
                    if (existing) {
                        this.collectionsForWorkspaces.delete(folder.uri.toString());
                        existing.listener.dispose();
                    }
                }
                for (const listener of this.listeners) {
                    listener.publishFolderChange(evt);
                }
            }));
            for (const folder of workspaceContext.getWorkspace().folders) {
                this.subscribeToWorkspace(folder);
            }
        }
        get busyProviders() {
            let total = 0;
            for (const { collection } of this.collectionsForWorkspaces.values()) {
                total += collection.busyProviders;
            }
            return total;
        }
        get pendingRootProviders() {
            let total = 0;
            for (const { collection } of this.collectionsForWorkspaces.values()) {
                total += collection.pendingRootProviders;
            }
            return total;
        }
        get listenerCount() {
            return this.listeners.size;
        }
        get workspaceFolders() {
            return [...this.collectionsForWorkspaces.values()].map(v => v.folder);
        }
        get workspaceFolderCollections() {
            return [...this.collectionsForWorkspaces.values()].map(v => [v.folder, v.collection]);
        }
        /**
         * Returns whether there are any subscriptions with non-empty providers.
         */
        get isEmpty() {
            for (const { collection } of this.collectionsForWorkspaces.values()) {
                if (iterator_1.Iterable.some(collection.all, t => !!t.parent)) {
                    return false;
                }
            }
            return true;
        }
        addListener(listener) {
            this.listeners.add(listener);
        }
        removeListener(listener) {
            this.listeners.delete(listener);
        }
        subscribeToWorkspace(folder) {
            const folderNode = {
                folder,
                getChildren: function* () {
                    for (const rootId of ref.object.rootIds) {
                        const node = ref.object.getNodeById(rootId);
                        if (node) {
                            yield node;
                        }
                    }
                },
            };
            const ref = this.testService.subscribeToDiffs(0 /* Workspace */, folder.uri, diff => {
                for (const listener of this.listeners) {
                    listener.publishDiff(folder, diff);
                }
            });
            const disposable = new lifecycle_1.DisposableStore();
            disposable.add(ref);
            disposable.add(ref.object.onBusyProvidersChange(() => this.pendingRootChangeEmitter.fire(this.pendingRootProviders)));
            disposable.add(ref.object.onBusyProvidersChange(() => this.busyProvidersChangeEmitter.fire(this.busyProviders)));
            this.collectionsForWorkspaces.set(folder.uri.toString(), {
                listener: disposable,
                collection: ref.object,
                folder: folderNode,
            });
        }
    };
    TestSubscription = __decorate([
        __param(0, workspace_1.IWorkspaceContextService),
        __param(1, testService_1.ITestService)
    ], TestSubscription);
});
//# sourceMappingURL=workspaceTestCollectionService.js.map