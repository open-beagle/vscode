/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UndoRedoSource = exports.UndoRedoGroup = exports.ResourceEditStackSnapshot = exports.UndoRedoElementType = exports.IUndoRedoService = void 0;
    exports.IUndoRedoService = (0, instantiation_1.createDecorator)('undoRedoService');
    var UndoRedoElementType;
    (function (UndoRedoElementType) {
        UndoRedoElementType[UndoRedoElementType["Resource"] = 0] = "Resource";
        UndoRedoElementType[UndoRedoElementType["Workspace"] = 1] = "Workspace";
    })(UndoRedoElementType = exports.UndoRedoElementType || (exports.UndoRedoElementType = {}));
    class ResourceEditStackSnapshot {
        constructor(resource, elements) {
            this.resource = resource;
            this.elements = elements;
        }
    }
    exports.ResourceEditStackSnapshot = ResourceEditStackSnapshot;
    class UndoRedoGroup {
        constructor() {
            this.id = UndoRedoGroup._ID++;
            this.order = 1;
        }
        nextOrder() {
            if (this.id === 0) {
                return 0;
            }
            return this.order++;
        }
    }
    exports.UndoRedoGroup = UndoRedoGroup;
    UndoRedoGroup._ID = 0;
    UndoRedoGroup.None = new UndoRedoGroup();
    class UndoRedoSource {
        constructor() {
            this.id = UndoRedoSource._ID++;
            this.order = 1;
        }
        nextOrder() {
            if (this.id === 0) {
                return 0;
            }
            return this.order++;
        }
    }
    exports.UndoRedoSource = UndoRedoSource;
    UndoRedoSource._ID = 0;
    UndoRedoSource.None = new UndoRedoSource();
});
//# sourceMappingURL=undoRedo.js.map