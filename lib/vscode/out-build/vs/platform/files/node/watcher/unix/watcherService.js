/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.cp", "vs/base/common/lifecycle", "vs/base/common/network"], function (require, exports, ipc_1, ipc_cp_1, lifecycle_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileWatcher = void 0;
    class FileWatcher extends lifecycle_1.Disposable {
        constructor(folders, onDidFilesChange, onLogMessage, verboseLogging, watcherOptions = {}) {
            super();
            this.folders = folders;
            this.onDidFilesChange = onDidFilesChange;
            this.onLogMessage = onLogMessage;
            this.verboseLogging = verboseLogging;
            this.watcherOptions = watcherOptions;
            this.isDisposed = false;
            this.restartCounter = 0;
            this.startWatching();
        }
        startWatching() {
            const client = this._register(new ipc_cp_1.Client(network_1.FileAccess.asFileUri('bootstrap-fork', require).fsPath, {
                serverName: 'File Watcher (chokidar)',
                args: ['--type=watcherService'],
                env: {
                    VSCODE_AMD_ENTRYPOINT: 'vs/platform/files/node/watcher/unix/watcherApp',
                    VSCODE_PIPE_LOGGING: 'true',
                    VSCODE_VERBOSE_LOGGING: 'true' // transmit console logs from server to client
                }
            }));
            this._register(client.onDidProcessExit(() => {
                // our watcher app should never be completed because it keeps on watching. being in here indicates
                // that the watcher process died and we want to restart it here. we only do it a max number of times
                if (!this.isDisposed) {
                    if (this.restartCounter <= FileWatcher.MAX_RESTARTS) {
                        this.error('terminated unexpectedly and is restarted again...');
                        this.restartCounter++;
                        this.startWatching();
                    }
                    else {
                        this.error('failed to start after retrying for some time, giving up. Please report this as a bug report!');
                    }
                }
            }));
            // Initialize watcher
            this.service = ipc_1.ProxyChannel.toService((0, ipc_1.getNextTickChannel)(client.getChannel('watcher')));
            this.service.init(Object.assign(Object.assign({}, this.watcherOptions), { verboseLogging: this.verboseLogging }));
            this._register(this.service.onDidChangeFile(e => !this.isDisposed && this.onDidFilesChange(e)));
            this._register(this.service.onDidLogMessage(m => this.onLogMessage(m)));
            // Start watching
            this.service.setRoots(this.folders);
        }
        error(message) {
            this.onLogMessage({ type: 'error', message: `[File Watcher (chokidar)] ${message}` });
        }
        setVerboseLogging(verboseLogging) {
            this.verboseLogging = verboseLogging;
            if (this.service) {
                this.service.setVerboseLogging(verboseLogging);
            }
        }
        setFolders(folders) {
            this.folders = folders;
            if (this.service) {
                this.service.setRoots(folders);
            }
        }
        dispose() {
            this.isDisposed = true;
            super.dispose();
        }
    }
    exports.FileWatcher = FileWatcher;
    FileWatcher.MAX_RESTARTS = 5;
});
//# sourceMappingURL=watcherService.js.map