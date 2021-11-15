/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "nsfw", "vs/base/common/glob", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/extpath", "vs/platform/files/node/watcher/watcher", "vs/base/common/async", "vs/base/common/normalization", "vs/base/common/event", "vs/base/node/extpath", "vs/base/common/lifecycle"], function (require, exports, nsfw, glob, path_1, platform_1, extpath_1, watcher_1, async_1, normalization_1, event_1, extpath_2, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NsfwWatcherService = void 0;
    const nsfwActionToRawChangeType = [];
    nsfwActionToRawChangeType[0 /* CREATED */] = 1 /* ADDED */;
    nsfwActionToRawChangeType[2 /* MODIFIED */] = 0 /* UPDATED */;
    nsfwActionToRawChangeType[1 /* DELETED */] = 2 /* DELETED */;
    class NsfwWatcherService extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeFile = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChangeFile.event;
            this._onDidLogMessage = this._register(new event_1.Emitter());
            this.onDidLogMessage = this._onDidLogMessage.event;
            this.pathWatchers = {};
        }
        async setRoots(roots) {
            const normalizedRoots = this._normalizeRoots(roots);
            // Gather roots that are not currently being watched
            const rootsToStartWatching = normalizedRoots.filter(r => {
                return !(r.path in this.pathWatchers);
            });
            // Gather current roots that don't exist in the new roots array
            const rootsToStopWatching = Object.keys(this.pathWatchers).filter(r => {
                return normalizedRoots.every(normalizedRoot => normalizedRoot.path !== r);
            });
            // Logging
            this.debug(`Start watching: [${rootsToStartWatching.map(r => r.path).join(',')}]\nStop watching: [${rootsToStopWatching.join(',')}]`);
            // Stop watching some roots
            rootsToStopWatching.forEach(root => {
                this.pathWatchers[root].ready.then(watcher => watcher.stop());
                delete this.pathWatchers[root];
            });
            // Start watching some roots
            rootsToStartWatching.forEach(root => this.doWatch(root));
            // Refresh ignored arrays in case they changed
            roots.forEach(root => {
                if (root.path in this.pathWatchers) {
                    this.pathWatchers[root.path].ignored = Array.isArray(root.excludes) ? root.excludes.map(ignored => glob.parse(ignored)) : [];
                }
            });
        }
        doWatch(request) {
            let undeliveredFileEvents = [];
            const fileEventDelayer = new async_1.ThrottledDelayer(NsfwWatcherService.FS_EVENT_DELAY);
            let readyPromiseResolve;
            this.pathWatchers[request.path] = {
                ready: new Promise(resolve => readyPromiseResolve = resolve),
                ignored: Array.isArray(request.excludes) ? request.excludes.map(ignored => glob.parse(ignored)) : []
            };
            process.on('uncaughtException', (e) => {
                // Specially handle ENOSPC errors that can happen when
                // the watcher consumes so many file descriptors that
                // we are running into a limit. We only want to warn
                // once in this case to avoid log spam.
                // See https://github.com/microsoft/vscode/issues/7950
                if (e === 'Inotify limit reached' && !this.enospcErrorLogged) {
                    this.enospcErrorLogged = true;
                    this.error('Inotify limit reached (ENOSPC)');
                }
            });
            // NSFW does not report file changes in the path provided on macOS if
            // - the path uses wrong casing
            // - the path is a symbolic link
            // We have to detect this case and massage the events to correct this.
            let realBasePathDiffers = false;
            let realBasePathLength = request.path.length;
            if (platform_1.isMacintosh) {
                try {
                    // First check for symbolic link
                    let realBasePath = (0, extpath_2.realpathSync)(request.path);
                    // Second check for casing difference
                    if (request.path === realBasePath) {
                        realBasePath = ((0, extpath_2.realcaseSync)(request.path) || request.path);
                    }
                    if (request.path !== realBasePath) {
                        realBasePathLength = realBasePath.length;
                        realBasePathDiffers = true;
                        this.warn(`Watcher basePath does not match version on disk and will be corrected (original: ${request.path}, real: ${realBasePath})`);
                    }
                }
                catch (error) {
                    // ignore
                }
            }
            this.debug(`Start watching with nsfw: ${request.path}`);
            nsfw(request.path, events => {
                for (const e of events) {
                    // Logging
                    if (this.verboseLogging) {
                        const logPath = e.action === 3 /* RENAMED */ ? (0, path_1.join)(e.directory, e.oldFile || '') + ' -> ' + e.newFile : (0, path_1.join)(e.directory, e.file || '');
                        this.log(`${e.action === 0 /* CREATED */ ? '[CREATED]' : e.action === 1 /* DELETED */ ? '[DELETED]' : e.action === 2 /* MODIFIED */ ? '[CHANGED]' : '[RENAMED]'} ${logPath}`);
                    }
                    // Convert nsfw event to IRawFileChange and add to queue
                    let absolutePath;
                    if (e.action === 3 /* RENAMED */) {
                        // Rename fires when a file's name changes within a single directory
                        absolutePath = (0, path_1.join)(e.directory, e.oldFile || '');
                        if (!this.isPathIgnored(absolutePath, this.pathWatchers[request.path].ignored)) {
                            undeliveredFileEvents.push({ type: 2 /* DELETED */, path: absolutePath });
                        }
                        else if (this.verboseLogging) {
                            this.log(` >> ignored ${absolutePath}`);
                        }
                        absolutePath = (0, path_1.join)(e.newDirectory || e.directory, e.newFile || '');
                        if (!this.isPathIgnored(absolutePath, this.pathWatchers[request.path].ignored)) {
                            undeliveredFileEvents.push({ type: 1 /* ADDED */, path: absolutePath });
                        }
                        else if (this.verboseLogging) {
                            this.log(` >> ignored ${absolutePath}`);
                        }
                    }
                    else {
                        absolutePath = (0, path_1.join)(e.directory, e.file || '');
                        if (!this.isPathIgnored(absolutePath, this.pathWatchers[request.path].ignored)) {
                            undeliveredFileEvents.push({
                                type: nsfwActionToRawChangeType[e.action],
                                path: absolutePath
                            });
                        }
                        else if (this.verboseLogging) {
                            this.log(` >> ignored ${absolutePath}`);
                        }
                    }
                }
                // Delay and send buffer
                fileEventDelayer.trigger(async () => {
                    const events = undeliveredFileEvents;
                    undeliveredFileEvents = [];
                    if (platform_1.isMacintosh) {
                        events.forEach(e => {
                            // Mac uses NFD unicode form on disk, but we want NFC
                            e.path = (0, normalization_1.normalizeNFC)(e.path);
                            // Convert paths back to original form in case it differs
                            if (realBasePathDiffers) {
                                e.path = request.path + e.path.substr(realBasePathLength);
                            }
                        });
                    }
                    // Broadcast to clients normalized
                    const res = (0, watcher_1.normalizeFileChanges)(events);
                    this._onDidChangeFile.fire(res);
                    // Logging
                    if (this.verboseLogging) {
                        res.forEach(r => {
                            this.log(` >> normalized ${r.type === 1 /* ADDED */ ? '[ADDED]' : r.type === 2 /* DELETED */ ? '[DELETED]' : '[CHANGED]'} ${r.path}`);
                        });
                    }
                });
            }).then(watcher => {
                this.pathWatchers[request.path].watcher = watcher;
                const startPromise = watcher.start();
                startPromise.then(() => readyPromiseResolve(watcher));
                return startPromise;
            });
        }
        async setVerboseLogging(enabled) {
            this.verboseLogging = enabled;
        }
        async stop() {
            for (let path in this.pathWatchers) {
                let watcher = this.pathWatchers[path];
                watcher.ready.then(watcher => watcher.stop());
                delete this.pathWatchers[path];
            }
            this.pathWatchers = Object.create(null);
        }
        _normalizeRoots(roots) {
            // Normalizes a set of root paths by removing any root paths that are
            // sub-paths of other roots.
            return roots.filter(r => roots.every(other => {
                return !(r.path.length > other.path.length && (0, extpath_1.isEqualOrParent)(r.path, other.path));
            }));
        }
        isPathIgnored(absolutePath, ignored) {
            return ignored && ignored.some(i => i(absolutePath));
        }
        log(message) {
            this._onDidLogMessage.fire({ type: 'trace', message: `[File Watcher (nsfw)] ` + message });
        }
        warn(message) {
            this._onDidLogMessage.fire({ type: 'warn', message: `[File Watcher (nsfw)] ` + message });
        }
        error(message) {
            this._onDidLogMessage.fire({ type: 'error', message: `[File Watcher (nsfw)] ` + message });
        }
        debug(message) {
            this._onDidLogMessage.fire({ type: 'debug', message: `[File Watcher (nsfw)] ` + message });
        }
    }
    exports.NsfwWatcherService = NsfwWatcherService;
    NsfwWatcherService.FS_EVENT_DELAY = 50; // aggregate and only emit events when changes have stopped for this duration (in ms)
});
//# sourceMappingURL=nsfwWatcherService.js.map