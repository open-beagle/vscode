define(["require", "exports", "vs/base/common/errors", "vs/base/common/network", "vs/base/common/lifecycle", "vs/base/common/event"], function (require, exports, errors, network_1, lifecycle_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemoteAuthorityResolverService = void 0;
    class PendingResolveAuthorityRequest {
        constructor(_resolve, _reject, promise) {
            this._resolve = _resolve;
            this._reject = _reject;
            this.promise = promise;
            this.value = null;
        }
        resolve(value) {
            this.value = value;
            this._resolve(this.value);
        }
        reject(err) {
            this._reject(err);
        }
    }
    class RemoteAuthorityResolverService extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onDidChangeConnectionData = this._register(new event_1.Emitter());
            this.onDidChangeConnectionData = this._onDidChangeConnectionData.event;
            this._resolveAuthorityRequests = new Map();
            this._connectionTokens = new Map();
        }
        resolveAuthority(authority) {
            if (!this._resolveAuthorityRequests.has(authority)) {
                let resolve;
                let reject;
                const promise = new Promise((_resolve, _reject) => {
                    resolve = _resolve;
                    reject = _reject;
                });
                this._resolveAuthorityRequests.set(authority, new PendingResolveAuthorityRequest(resolve, reject, promise));
            }
            return this._resolveAuthorityRequests.get(authority).promise;
        }
        getConnectionData(authority) {
            if (!this._resolveAuthorityRequests.has(authority)) {
                return null;
            }
            const request = this._resolveAuthorityRequests.get(authority);
            if (!request.value) {
                return null;
            }
            const connectionToken = this._connectionTokens.get(authority);
            return {
                host: request.value.authority.host,
                port: request.value.authority.port,
                connectionToken: connectionToken
            };
        }
        _clearResolvedAuthority(authority) {
            if (this._resolveAuthorityRequests.has(authority)) {
                this._resolveAuthorityRequests.get(authority).reject(errors.canceled());
                this._resolveAuthorityRequests.delete(authority);
            }
        }
        _setResolvedAuthority(resolvedAuthority, options) {
            if (this._resolveAuthorityRequests.has(resolvedAuthority.authority)) {
                const request = this._resolveAuthorityRequests.get(resolvedAuthority.authority);
                network_1.RemoteAuthorities.set(resolvedAuthority.authority, resolvedAuthority.host, resolvedAuthority.port);
                if (resolvedAuthority.connectionToken) {
                    network_1.RemoteAuthorities.setConnectionToken(resolvedAuthority.authority, resolvedAuthority.connectionToken);
                }
                request.resolve({ authority: resolvedAuthority, options });
                this._onDidChangeConnectionData.fire();
            }
        }
        _setResolvedAuthorityError(authority, err) {
            if (this._resolveAuthorityRequests.has(authority)) {
                const request = this._resolveAuthorityRequests.get(authority);
                request.reject(err);
            }
        }
        _setAuthorityConnectionToken(authority, connectionToken) {
            this._connectionTokens.set(authority, connectionToken);
            network_1.RemoteAuthorities.setConnectionToken(authority, connectionToken);
            this._onDidChangeConnectionData.fire();
        }
    }
    exports.RemoteAuthorityResolverService = RemoteAuthorityResolverService;
});
//# sourceMappingURL=remoteAuthorityResolverService.js.map