/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri"], function (require, exports, async_1, event_1, lifecycle_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RemotePty = void 0;
    class RemotePty extends lifecycle_1.Disposable {
        constructor(_id, shouldPersist, _remoteTerminalChannel, _remoteAgentService, _logService) {
            super();
            this._id = _id;
            this.shouldPersist = shouldPersist;
            this._remoteTerminalChannel = _remoteTerminalChannel;
            this._remoteAgentService = _remoteAgentService;
            this._logService = _logService;
            this._onProcessData = this._register(new event_1.Emitter());
            this.onProcessData = this._onProcessData.event;
            this._onProcessExit = this._register(new event_1.Emitter());
            this.onProcessExit = this._onProcessExit.event;
            this._onProcessReady = this._register(new event_1.Emitter());
            this._onProcessTitleChanged = this._register(new event_1.Emitter());
            this.onProcessTitleChanged = this._onProcessTitleChanged.event;
            this._onProcessShellTypeChanged = this._register(new event_1.Emitter());
            this.onProcessShellTypeChanged = this._onProcessShellTypeChanged.event;
            this._onProcessOverrideDimensions = this._register(new event_1.Emitter());
            this.onProcessOverrideDimensions = this._onProcessOverrideDimensions.event;
            this._onProcessResolvedShellLaunchConfig = this._register(new event_1.Emitter());
            this._inReplay = false;
            this._startBarrier = new async_1.Barrier();
        }
        get onProcessReady() { return this._onProcessReady.event; }
        get onProcessResolvedShellLaunchConfig() { return this._onProcessResolvedShellLaunchConfig.event; }
        get id() { return this._id; }
        async start() {
            // Fetch the environment to check shell permissions
            const env = await this._remoteAgentService.getEnvironment();
            if (!env) {
                // Extension host processes are only allowed in remote extension hosts currently
                throw new Error('Could not fetch remote environment');
            }
            this._logService.trace('Spawning remote agent process', { terminalId: this._id });
            const startResult = await this._remoteTerminalChannel.start(this._id);
            if (typeof startResult !== 'undefined') {
                // An error occurred
                return startResult;
            }
            this._startBarrier.open();
            return undefined;
        }
        shutdown(immediate) {
            this._startBarrier.wait().then(_ => {
                this._remoteTerminalChannel.shutdown(this._id, immediate);
            });
        }
        input(data) {
            if (this._inReplay) {
                return;
            }
            this._startBarrier.wait().then(_ => {
                this._remoteTerminalChannel.input(this._id, data);
            });
        }
        resize(cols, rows) {
            if (this._inReplay) {
                return;
            }
            this._startBarrier.wait().then(_ => {
                this._remoteTerminalChannel.resize(this._id, cols, rows);
            });
        }
        acknowledgeDataEvent(charCount) {
            // Support flow control for server spawned processes
            if (this._inReplay) {
                return;
            }
            this._startBarrier.wait().then(_ => {
                this._remoteTerminalChannel.acknowledgeDataEvent(this._id, charCount);
            });
        }
        async getInitialCwd() {
            await this._startBarrier.wait();
            return this._remoteTerminalChannel.getInitialCwd(this._id);
        }
        async getCwd() {
            await this._startBarrier.wait();
            return this._remoteTerminalChannel.getCwd(this._id);
        }
        handleData(e) {
            this._onProcessData.fire(e);
        }
        processBinary(e) {
            return this._remoteTerminalChannel.processBinary(this._id, e);
        }
        handleExit(e) {
            this._onProcessExit.fire(e);
        }
        handleReady(e) {
            this._onProcessReady.fire(e);
        }
        handleTitleChanged(e) {
            this._onProcessTitleChanged.fire(e);
        }
        handleShellTypeChanged(e) {
            this._onProcessShellTypeChanged.fire(e);
        }
        handleOverrideDimensions(e) {
            this._onProcessOverrideDimensions.fire(e);
        }
        handleResolvedShellLaunchConfig(e) {
            // Revive the cwd URI
            if (e.cwd && typeof e.cwd !== 'string') {
                e.cwd = uri_1.URI.revive(e.cwd);
            }
            this._onProcessResolvedShellLaunchConfig.fire(e);
        }
        async handleReplay(e) {
            try {
                this._inReplay = true;
                for (const innerEvent of e.events) {
                    if (innerEvent.cols !== 0 || innerEvent.rows !== 0) {
                        // never override with 0x0 as that is a marker for an unknown initial size
                        this._onProcessOverrideDimensions.fire({ cols: innerEvent.cols, rows: innerEvent.rows, forceExactSize: true });
                    }
                    const e = { data: innerEvent.data, trackCommit: true };
                    this._onProcessData.fire(e);
                    await e.writePromise;
                }
            }
            finally {
                this._inReplay = false;
            }
            // remove size override
            this._onProcessOverrideDimensions.fire(undefined);
        }
        handleOrphanQuestion() {
            this._remoteTerminalChannel.orphanQuestionReply(this._id);
        }
        async getLatency() {
            return 0;
        }
    }
    exports.RemotePty = RemotePty;
});
//# sourceMappingURL=remotePty.js.map