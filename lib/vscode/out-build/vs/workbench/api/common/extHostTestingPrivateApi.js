/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getPrivateApiFor = exports.ExtHostTestItemEventType = void 0;
    var ExtHostTestItemEventType;
    (function (ExtHostTestItemEventType) {
        ExtHostTestItemEventType[ExtHostTestItemEventType["NewChild"] = 0] = "NewChild";
        ExtHostTestItemEventType[ExtHostTestItemEventType["Disposed"] = 1] = "Disposed";
        ExtHostTestItemEventType[ExtHostTestItemEventType["Invalidated"] = 2] = "Invalidated";
        ExtHostTestItemEventType[ExtHostTestItemEventType["SetProp"] = 3] = "SetProp";
    })(ExtHostTestItemEventType = exports.ExtHostTestItemEventType || (exports.ExtHostTestItemEventType = {}));
    const eventPrivateApis = new WeakMap();
    /**
     * Gets the private API for a test item implementation. This implementation
     * is a managed object, but we keep a weakmap to avoid exposing any of the
     * internals to extensions.
     */
    const getPrivateApiFor = (impl) => {
        let api = eventPrivateApis.get(impl);
        if (!api) {
            api = { children: new Map(), bus: new event_1.Emitter() };
            eventPrivateApis.set(impl, api);
        }
        return api;
    };
    exports.getPrivateApiFor = getPrivateApiFor;
});
//# sourceMappingURL=extHostTestingPrivateApi.js.map