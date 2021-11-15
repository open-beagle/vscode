/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.stop = exports.stopEvent = exports.domEvent = void 0;
    const domEvent = (element, type, useCapture) => {
        const fn = (e) => emitter.fire(e);
        const emitter = new event_1.Emitter({
            onFirstListenerAdd: () => {
                element.addEventListener(type, fn, useCapture);
            },
            onLastListenerRemove: () => {
                element.removeEventListener(type, fn, useCapture);
            }
        });
        return emitter.event;
    };
    exports.domEvent = domEvent;
    function stopEvent(event) {
        event.preventDefault();
        event.stopPropagation();
        return event;
    }
    exports.stopEvent = stopEvent;
    function stop(event) {
        return event_1.Event.map(event, stopEvent);
    }
    exports.stop = stop;
});
//# sourceMappingURL=event.js.map