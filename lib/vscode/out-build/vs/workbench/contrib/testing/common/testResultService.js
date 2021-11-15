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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/event", "vs/base/common/functional", "vs/base/common/uuid", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/workbench/api/common/extHostTypes", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultStorage"], function (require, exports, arrays_1, async_1, event_1, functional_1, uuid_1, contextkey_1, instantiation_1, extHostTypes_1, testingContextKeys_1, testResult_1, testResultStorage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestResultService = exports.ITestResultService = void 0;
    exports.ITestResultService = (0, instantiation_1.createDecorator)('testResultService');
    let TestResultService = class TestResultService {
        constructor(contextKeyService, storage) {
            this.storage = storage;
            this.changeResultEmitter = new event_1.Emitter();
            this._results = [];
            this.testChangeEmitter = new event_1.Emitter();
            /**
             * @inheritdoc
             */
            this.onResultsChanged = this.changeResultEmitter.event;
            /**
             * @inheritdoc
             */
            this.onTestChanged = this.testChangeEmitter.event;
            this.loadResults = (0, functional_1.once)(() => this.storage.read().then(loaded => {
                for (let i = loaded.length - 1; i >= 0; i--) {
                    this.push(loaded[i]);
                }
            }));
            this.persistScheduler = new async_1.RunOnceScheduler(() => this.persistImmediately(), 500);
            this.isRunning = testingContextKeys_1.TestingContextKeys.isRunning.bindTo(contextKeyService);
        }
        /**
         * @inheritdoc
         */
        get results() {
            this.loadResults();
            return this._results;
        }
        /**
         * @inheritdoc
         */
        getStateById(extId) {
            for (const result of this.results) {
                const lookup = result.getStateById(extId);
                if (lookup && lookup.computedState !== extHostTypes_1.TestResultState.Unset) {
                    return [result, lookup];
                }
            }
            return undefined;
        }
        /**
         * @inheritdoc
         */
        createLiveResult(req) {
            if ('id' in req) {
                return this.push(new testResult_1.LiveTestResult(req.id, this.storage.getOutputController(req.id), req));
            }
            else {
                const id = (0, uuid_1.generateUuid)();
                return this.push(new testResult_1.LiveTestResult(id, this.storage.getOutputController(id), req));
            }
        }
        /**
         * @inheritdoc
         */
        push(result) {
            if (result.completedAt === undefined) {
                this.results.unshift(result);
            }
            else {
                const index = (0, arrays_1.findFirstInSorted)(this.results, r => r.completedAt !== undefined && r.completedAt <= result.completedAt);
                this.results.splice(index, 0, result);
                this.persistScheduler.schedule();
            }
            if (this.results.length > testResultStorage_1.RETAIN_MAX_RESULTS) {
                this.results.pop();
            }
            if (result instanceof testResult_1.LiveTestResult) {
                result.onComplete(() => this.onComplete(result));
                result.onChange(this.testChangeEmitter.fire, this.testChangeEmitter);
                this.isRunning.set(true);
                this.changeResultEmitter.fire({ started: result });
            }
            else {
                this.changeResultEmitter.fire({ inserted: result });
                // If this is not a new result, go through each of its tests. For each
                // test for which the new result is the most recently inserted, fir
                // a change event so that UI updates.
                for (const item of result.tests) {
                    for (const otherResult of this.results) {
                        if (otherResult === result) {
                            this.testChangeEmitter.fire({ item, result, reason: 2 /* ComputedStateChange */ });
                            break;
                        }
                        else if (otherResult.getStateById(item.item.extId) !== undefined) {
                            break;
                        }
                    }
                }
            }
            return result;
        }
        /**
         * @inheritdoc
         */
        getResult(id) {
            return this.results.find(r => r.id === id);
        }
        /**
         * @inheritdoc
         */
        clear() {
            const keep = [];
            const removed = [];
            for (const result of this.results) {
                if (result.completedAt !== undefined) {
                    removed.push(result);
                }
                else {
                    keep.push(result);
                }
            }
            this._results = keep;
            this.persistScheduler.schedule();
            this.changeResultEmitter.fire({ removed });
        }
        onComplete(result) {
            this.resort();
            this.updateIsRunning();
            this.persistScheduler.schedule();
            this.changeResultEmitter.fire({ completed: result });
        }
        resort() {
            this.results.sort((a, b) => { var _a, _b; return ((_a = b.completedAt) !== null && _a !== void 0 ? _a : Number.MAX_SAFE_INTEGER) - ((_b = a.completedAt) !== null && _b !== void 0 ? _b : Number.MAX_SAFE_INTEGER); });
        }
        updateIsRunning() {
            this.isRunning.set(this.results.length > 0 && this.results[0].completedAt === undefined);
        }
        async persistImmediately() {
            // ensure results are loaded before persisting to avoid deleting once
            // that we don't have yet.
            await this.loadResults();
            this.storage.persist(this.results);
        }
    };
    TestResultService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, testResultStorage_1.ITestResultStorage)
    ], TestResultService);
    exports.TestResultService = TestResultService;
});
//# sourceMappingURL=testResultService.js.map