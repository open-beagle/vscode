define(["require", "exports", "vs/base/common/uriIpc"], function (require, exports, uriIpc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.encodePath = exports.getUriTransformer = void 0;
    const getUriTransformer = (remoteAuthority) => {
        return new uriIpc_1.URITransformer(remoteAuthority);
    };
    exports.getUriTransformer = getUriTransformer;
    /**
     * Encode a path for opening via the folder or workspace query parameter. This
     * preserves slashes so it can be edited by hand more easily.
     */
    const encodePath = (path) => {
        return path.split('/').map((p) => encodeURIComponent(p)).join('/');
    };
    exports.encodePath = encodePath;
});
//# sourceMappingURL=util.js.map