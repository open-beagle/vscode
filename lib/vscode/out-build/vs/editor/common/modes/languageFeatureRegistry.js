/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/hash", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/numbers", "vs/editor/common/modes/languageSelector", "vs/editor/common/services/modelService"], function (require, exports, event_1, hash_1, lifecycle_1, map_1, numbers_1, languageSelector_1, modelService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageFeatureRequestDelays = exports.LanguageFeatureRegistry = void 0;
    function isExclusive(selector) {
        if (typeof selector === 'string') {
            return false;
        }
        else if (Array.isArray(selector)) {
            return selector.every(isExclusive);
        }
        else {
            return !!selector.exclusive; // TODO: microsoft/TypeScript#42768
        }
    }
    class LanguageFeatureRegistry {
        constructor() {
            this._clock = 0;
            this._entries = [];
            this._onDidChange = new event_1.Emitter();
        }
        get onDidChange() {
            return this._onDidChange.event;
        }
        register(selector, provider) {
            let entry = {
                selector,
                provider,
                _score: -1,
                _time: this._clock++
            };
            this._entries.push(entry);
            this._lastCandidate = undefined;
            this._onDidChange.fire(this._entries.length);
            return (0, lifecycle_1.toDisposable)(() => {
                if (entry) {
                    let idx = this._entries.indexOf(entry);
                    if (idx >= 0) {
                        this._entries.splice(idx, 1);
                        this._lastCandidate = undefined;
                        this._onDidChange.fire(this._entries.length);
                        entry = undefined;
                    }
                }
            });
        }
        has(model) {
            return this.all(model).length > 0;
        }
        all(model) {
            if (!model) {
                return [];
            }
            this._updateScores(model);
            const result = [];
            // from registry
            for (let entry of this._entries) {
                if (entry._score > 0) {
                    result.push(entry.provider);
                }
            }
            return result;
        }
        ordered(model) {
            const result = [];
            this._orderedForEach(model, entry => result.push(entry.provider));
            return result;
        }
        orderedGroups(model) {
            const result = [];
            let lastBucket;
            let lastBucketScore;
            this._orderedForEach(model, entry => {
                if (lastBucket && lastBucketScore === entry._score) {
                    lastBucket.push(entry.provider);
                }
                else {
                    lastBucketScore = entry._score;
                    lastBucket = [entry.provider];
                    result.push(lastBucket);
                }
            });
            return result;
        }
        _orderedForEach(model, callback) {
            if (!model) {
                return;
            }
            this._updateScores(model);
            for (const entry of this._entries) {
                if (entry._score > 0) {
                    callback(entry);
                }
            }
        }
        _updateScores(model) {
            let candidate = {
                uri: model.uri.toString(),
                language: model.getLanguageIdentifier().language
            };
            if (this._lastCandidate
                && this._lastCandidate.language === candidate.language
                && this._lastCandidate.uri === candidate.uri) {
                // nothing has changed
                return;
            }
            this._lastCandidate = candidate;
            for (let entry of this._entries) {
                entry._score = (0, languageSelector_1.score)(entry.selector, model.uri, model.getLanguageIdentifier().language, (0, modelService_1.shouldSynchronizeModel)(model));
                if (isExclusive(entry.selector) && entry._score > 0) {
                    // support for one exclusive selector that overwrites
                    // any other selector
                    for (let entry of this._entries) {
                        entry._score = 0;
                    }
                    entry._score = 1000;
                    break;
                }
            }
            // needs sorting
            this._entries.sort(LanguageFeatureRegistry._compareByScoreAndTime);
        }
        static _compareByScoreAndTime(a, b) {
            if (a._score < b._score) {
                return 1;
            }
            else if (a._score > b._score) {
                return -1;
            }
            else if (a._time < b._time) {
                return 1;
            }
            else if (a._time > b._time) {
                return -1;
            }
            else {
                return 0;
            }
        }
    }
    exports.LanguageFeatureRegistry = LanguageFeatureRegistry;
    /**
     * Keeps moving average per model and set of providers so that requests
     * can be debounce according to the provider performance
     */
    class LanguageFeatureRequestDelays {
        constructor(_registry, min, max = Number.MAX_SAFE_INTEGER) {
            this._registry = _registry;
            this.min = min;
            this.max = max;
            this._cache = new map_1.LRUCache(50, 0.7);
        }
        _key(model) {
            return model.id + (0, hash_1.hash)(this._registry.all(model));
        }
        _clamp(value) {
            if (value === undefined) {
                return this.min;
            }
            else {
                return Math.min(this.max, Math.max(this.min, Math.floor(value * 1.3)));
            }
        }
        get(model) {
            const key = this._key(model);
            const avg = this._cache.get(key);
            return this._clamp(avg === null || avg === void 0 ? void 0 : avg.value);
        }
        update(model, value) {
            const key = this._key(model);
            let avg = this._cache.get(key);
            if (!avg) {
                avg = new numbers_1.MovingAverage();
                this._cache.set(key, avg);
            }
            avg.update(value);
            return this.get(model);
        }
    }
    exports.LanguageFeatureRequestDelays = LanguageFeatureRequestDelays;
});
//# sourceMappingURL=languageFeatureRegistry.js.map