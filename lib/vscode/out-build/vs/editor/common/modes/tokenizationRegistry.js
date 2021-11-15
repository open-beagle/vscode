/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle"], function (require, exports, event_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TokenizationRegistryImpl = void 0;
    class TokenizationRegistryImpl {
        constructor() {
            this._map = new Map();
            this._promises = new Map();
            this._onDidChange = new event_1.Emitter();
            this.onDidChange = this._onDidChange.event;
            this._colorMap = null;
        }
        fire(languages) {
            this._onDidChange.fire({
                changedLanguages: languages,
                changedColorMap: false
            });
        }
        register(language, support) {
            this._map.set(language, support);
            this.fire([language]);
            return (0, lifecycle_1.toDisposable)(() => {
                if (this._map.get(language) !== support) {
                    return;
                }
                this._map.delete(language);
                this.fire([language]);
            });
        }
        registerPromise(language, supportPromise) {
            let registration = null;
            let isDisposed = false;
            this._promises.set(language, supportPromise.then(support => {
                this._promises.delete(language);
                if (isDisposed || !support) {
                    return;
                }
                registration = this.register(language, support);
            }));
            return (0, lifecycle_1.toDisposable)(() => {
                isDisposed = true;
                if (registration) {
                    registration.dispose();
                }
            });
        }
        getPromise(language) {
            const support = this.get(language);
            if (support) {
                return Promise.resolve(support);
            }
            const promise = this._promises.get(language);
            if (promise) {
                return promise.then(_ => this.get(language));
            }
            return null;
        }
        get(language) {
            return (this._map.get(language) || null);
        }
        setColorMap(colorMap) {
            this._colorMap = colorMap;
            this._onDidChange.fire({
                changedLanguages: Array.from(this._map.keys()),
                changedColorMap: true
            });
        }
        getColorMap() {
            return this._colorMap;
        }
        getDefaultBackground() {
            if (this._colorMap && this._colorMap.length > 2 /* DefaultBackground */) {
                return this._colorMap[2 /* DefaultBackground */];
            }
            return null;
        }
    }
    exports.TokenizationRegistryImpl = TokenizationRegistryImpl;
});
//# sourceMappingURL=tokenizationRegistry.js.map