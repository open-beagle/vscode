/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestWorkspaceTrustRequestService = exports.TestWorkspaceTrustManagementService = void 0;
    class TestWorkspaceTrustManagementService {
        constructor(trusted = true) {
            this._onDidChangeTrust = new event_1.Emitter();
            this.onDidChangeTrust = this._onDidChangeTrust.event;
            this._onDidChangeTrustedFolders = new event_1.Emitter();
            this.onDidChangeTrustedFolders = this._onDidChangeTrustedFolders.event;
            this.trusted = trusted;
        }
        getTrustedFolders() {
            throw new Error('Method not implemented.');
        }
        setParentFolderTrust(trusted) {
            throw new Error('Method not implemented.');
        }
        getFolderTrustInfo(folder) {
            throw new Error('Method not implemented.');
        }
        setTrustedFolders(folders) {
            throw new Error('Method not implemented.');
        }
        setFoldersTrust(folders, trusted) {
            throw new Error('Method not implemented.');
        }
        canSetParentFolderTrust() {
            throw new Error('Method not implemented.');
        }
        canSetWorkspaceTrust() {
            throw new Error('Method not implemented.');
        }
        isWorkpaceTrusted() {
            return this.trusted;
        }
        setWorkspaceTrust(trusted) {
            if (this.trusted !== trusted) {
                this.trusted = trusted;
                this._onDidChangeTrust.fire(this.trusted);
            }
        }
    }
    exports.TestWorkspaceTrustManagementService = TestWorkspaceTrustManagementService;
    class TestWorkspaceTrustRequestService {
        constructor(_trusted) {
            this._trusted = _trusted;
            this._onDidInitiateWorkspaceTrustRequest = new event_1.Emitter();
            this.onDidInitiateWorkspaceTrustRequest = this._onDidInitiateWorkspaceTrustRequest.event;
            this._onDidCompleteWorkspaceTrustRequest = new event_1.Emitter();
            this.onDidCompleteWorkspaceTrustRequest = this._onDidCompleteWorkspaceTrustRequest.event;
        }
        cancelRequest() {
            throw new Error('Method not implemented.');
        }
        completeRequest(trusted) {
            throw new Error('Method not implemented.');
        }
        async requestWorkspaceTrust(options) {
            return this._trusted;
        }
    }
    exports.TestWorkspaceTrustRequestService = TestWorkspaceTrustRequestService;
});
//# sourceMappingURL=testWorkspaceTrustService.js.map