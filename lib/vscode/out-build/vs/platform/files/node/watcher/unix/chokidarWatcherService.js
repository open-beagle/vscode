/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "chokidar", "fs", "graceful-fs", "vs/base/common/glob", "vs/base/common/extpath", "vs/base/common/async", "vs/base/common/normalization", "vs/base/node/extpath", "vs/base/common/platform", "vs/platform/files/node/watcher/watcher", "vs/base/common/event", "vs/base/common/arrays", "vs/base/common/lifecycle"], function (require, exports, chokidar, fs, gracefulFs, glob, extpath_1, async_1, normalization_1, extpath_2, platform_1, watcher_1, event_1, arrays_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.normalizeRoots = exports.ChokidarWatcherService = void 0;
    gracefulFs.gracefulify(fs); // enable gracefulFs
    process.noAsar = true; // disable ASAR support in watcher process
    class ChokidarWatcherService extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeFile = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChangeFile.event;
            this._onDidLogMessage = this._register(new event_1.Emitter());
            this.onDidLogMessage = this._onDidLogMessage.event;
            this.watchers = new Map();
            this._watcherCount = 0;
        }
        get wacherCount() { return this._watcherCount; }
        async init(options) {
            this.pollingInterval = options.pollingInterval;
            this.usePolling = options.usePolling;
            this.watchers.clear();
            this._watcherCount = 0;
            this.verboseLogging = options.verboseLogging;
        }
        async setVerboseLogging(enabled) {
            this.verboseLogging = enabled;
        }
        async setRoots(requests) {
            const watchers = new Map();
            const newRequests = [];
            const requestsByBasePath = normalizeRoots(requests);
            // evaluate new & remaining watchers
            for (const basePath in requestsByBasePath) {
                const watcher = this.watchers.get(basePath);
                if (watcher && isEqualRequests(watcher.requests, requestsByBasePath[basePath])) {
                    watchers.set(basePath, watcher);
                    this.watchers.delete(basePath);
                }
                else {
                    newRequests.push(basePath);
                }
            }
            // stop all old watchers
            for (const [, watcher] of this.watchers) {
                await watcher.stop();
            }
            // start all new watchers
            for (const basePath of newRequests) {
                const requests = requestsByBasePath[basePath];
                watchers.set(basePath, this.watch(basePath, requests));
            }
            this.watchers = watchers;
        }
        watch(basePath, requests) {
            const pollingInterval = this.pollingInterval || 5000;
            let usePolling = this.usePolling; // boolean or a list of path patterns
            if (Array.isArray(usePolling)) {
                // switch to polling if one of the paths matches with a watched path
                usePolling = usePolling.some(pattern => requests.some(r => glob.match(pattern, r.path)));
            }
            const watcherOpts = {
                ignoreInitial: true,
                ignorePermissionErrors: true,
                followSymlinks: true,
                interval: pollingInterval,
                binaryInterval: pollingInterval,
                usePolling: usePolling,
                disableGlobbing: true // fix https://github.com/microsoft/vscode/issues/4586
            };
            const excludes = [];
            const isSingleFolder = requests.length === 1;
            if (isSingleFolder) {
                excludes.push(...requests[0].excludes); // if there's only one request, use the built-in ignore-filterering
            }
            if ((platform_1.isMacintosh || platform_1.isLinux) && (basePath.length === 0 || basePath === '/')) {
                excludes.push('/dev/**');
                if (platform_1.isLinux) {
                    excludes.push('/proc/**', '/sys/**');
                }
            }
            excludes.push('**/*.asar'); // Ensure we never recurse into ASAR archives
            watcherOpts.ignored = excludes;
            // Chokidar fails when the basePath does not match case-identical to the path on disk
            // so we have to find the real casing of the path and do some path massaging to fix this
            // see https://github.com/paulmillr/chokidar/issues/418
            const realBasePath = platform_1.isMacintosh ? ((0, extpath_2.realcaseSync)(basePath) || basePath) : basePath;
            const realBasePathLength = realBasePath.length;
            const realBasePathDiffers = (basePath !== realBasePath);
            if (realBasePathDiffers) {
                this.warn(`Watcher basePath does not match version on disk and was corrected (original: ${basePath}, real: ${realBasePath})`);
            }
            this.debug(`Start watching with chokidar: ${realBasePath}, excludes: ${excludes.join(',')}, usePolling: ${usePolling ? 'true, interval ' + pollingInterval : 'false'}`);
            let chokidarWatcher = chokidar.watch(realBasePath, watcherOpts);
            this._watcherCount++;
            // Detect if for some reason the native watcher library fails to load
            if (platform_1.isMacintosh && chokidarWatcher.options && !chokidarWatcher.options.useFsEvents) {
                this.warn('Watcher is not using native fsevents library and is falling back to unefficient polling.');
            }
            let undeliveredFileEvents = [];
            let fileEventDelayer = new async_1.ThrottledDelayer(ChokidarWatcherService.FS_EVENT_DELAY);
            const watcher = {
                requests,
                stop: async () => {
                    try {
                        if (this.verboseLogging) {
                            this.log(`Stop watching: ${basePath}]`);
                        }
                        if (chokidarWatcher) {
                            await chokidarWatcher.close();
                            this._watcherCount--;
                            chokidarWatcher = null;
                        }
                        if (fileEventDelayer) {
                            fileEventDelayer.cancel();
                            fileEventDelayer = null;
                        }
                    }
                    catch (error) {
                        this.warn('Error while stopping watcher: ' + error.toString());
                    }
                }
            };
            chokidarWatcher.on('all', (type, path) => {
                if (platform_1.isMacintosh) {
                    // Mac: uses NFD unicode form on disk, but we want NFC
                    // See also https://github.com/nodejs/node/issues/2165
                    path = (0, normalization_1.normalizeNFC)(path);
                }
                if (path.indexOf(realBasePath) < 0) {
                    return; // we really only care about absolute paths here in our basepath context here
                }
                // Make sure to convert the path back to its original basePath form if the realpath is different
                if (realBasePathDiffers) {
                    path = basePath + path.substr(realBasePathLength);
                }
                let eventType;
                switch (type) {
                    case 'change':
                        eventType = 0 /* UPDATED */;
                        break;
                    case 'add':
                    case 'addDir':
                        eventType = 1 /* ADDED */;
                        break;
                    case 'unlink':
                    case 'unlinkDir':
                        eventType = 2 /* DELETED */;
                        break;
                    default:
                        return;
                }
                // if there's more than one request we need to do
                // extra filtering due to potentially overlapping roots
                if (!isSingleFolder) {
                    if (isIgnored(path, watcher.requests)) {
                        return;
                    }
                }
                const event = { type: eventType, path };
                // Logging
                if (this.verboseLogging) {
                    this.log(`${eventType === 1 /* ADDED */ ? '[ADDED]' : eventType === 2 /* DELETED */ ? '[DELETED]' : '[CHANGED]'} ${path}`);
                }
                // Check for spam
                const now = Date.now();
                if (undeliveredFileEvents.length === 0) {
                    this.spamWarningLogged = false;
                    this.spamCheckStartTime = now;
                }
                else if (!this.spamWarningLogged && typeof this.spamCheckStartTime === 'number' && this.spamCheckStartTime + ChokidarWatcherService.EVENT_SPAM_WARNING_THRESHOLD < now) {
                    this.spamWarningLogged = true;
                    this.warn(`Watcher is busy catching up with ${undeliveredFileEvents.length} file changes in 60 seconds. Latest changed path is "${event.path}"`);
                }
                // Add to buffer
                undeliveredFileEvents.push(event);
                if (fileEventDelayer) {
                    // Delay and send buffer
                    fileEventDelayer.trigger(async () => {
                        const events = undeliveredFileEvents;
                        undeliveredFileEvents = [];
                        // Broadcast to clients normalized
                        const res = (0, watcher_1.normalizeFileChanges)(events);
                        this._onDidChangeFile.fire(res);
                        // Logging
                        if (this.verboseLogging) {
                            res.forEach(r => {
                                this.log(` >> normalized  ${r.type === 1 /* ADDED */ ? '[ADDED]' : r.type === 2 /* DELETED */ ? '[DELETED]' : '[CHANGED]'} ${r.path}`);
                            });
                        }
                        return undefined;
                    });
                }
            });
            chokidarWatcher.on('error', (error) => {
                if (error) {
                    // Specially handle ENOSPC errors that can happen when
                    // the watcher consumes so many file descriptors that
                    // we are running into a limit. We only want to warn
                    // once in this case to avoid log spam.
                    // See https://github.com/microsoft/vscode/issues/7950
                    if (error.code === 'ENOSPC') {
                        if (!this.enospcErrorLogged) {
                            this.enospcErrorLogged = true;
                            this.stop();
                            this.error('Inotify limit reached (ENOSPC)');
                        }
                    }
                    else {
                        this.warn(error.toString());
                    }
                }
            });
            return watcher;
        }
        async stop() {
            for (const [, watcher] of this.watchers) {
                await watcher.stop();
            }
            this.watchers.clear();
        }
        log(message) {
            this._onDidLogMessage.fire({ type: 'trace', message: `[File Watcher (chokidar)] ` + message });
        }
        debug(message) {
            this._onDidLogMessage.fire({ type: 'debug', message: `[File Watcher (chokidar)] ` + message });
        }
        warn(message) {
            this._onDidLogMessage.fire({ type: 'warn', message: `[File Watcher (chokidar)] ` + message });
        }
        error(message) {
            this._onDidLogMessage.fire({ type: 'error', message: `[File Watcher (chokidar)] ` + message });
        }
    }
    exports.ChokidarWatcherService = ChokidarWatcherService;
    ChokidarWatcherService.FS_EVENT_DELAY = 50; // aggregate and only emit events when changes have stopped for this duration (in ms)
    ChokidarWatcherService.EVENT_SPAM_WARNING_THRESHOLD = 60 * 1000; // warn after certain time span of event spam
    function isIgnored(path, requests) {
        for (const request of requests) {
            if (request.path === path) {
                return false;
            }
            if ((0, extpath_1.isEqualOrParent)(path, request.path)) {
                if (!request.parsedPattern) {
                    if (request.excludes && request.excludes.length > 0) {
                        const pattern = `{${request.excludes.join(',')}}`;
                        request.parsedPattern = glob.parse(pattern);
                    }
                    else {
                        request.parsedPattern = () => false;
                    }
                }
                const relPath = path.substr(request.path.length + 1);
                if (!request.parsedPattern(relPath)) {
                    return false;
                }
            }
        }
        return true;
    }
    /**
     * Normalizes a set of root paths by grouping by the most parent root path.
     * equests with Sub paths are skipped if they have the same ignored set as the parent.
     */
    function normalizeRoots(requests) {
        requests = requests.sort((r1, r2) => r1.path.localeCompare(r2.path));
        let prevRequest = null;
        const result = Object.create(null);
        for (const request of requests) {
            const basePath = request.path;
            const ignored = (request.excludes || []).sort();
            if (prevRequest && ((0, extpath_1.isEqualOrParent)(basePath, prevRequest.path))) {
                if (!isEqualIgnore(ignored, prevRequest.excludes)) {
                    result[prevRequest.path].push({ path: basePath, excludes: ignored });
                }
            }
            else {
                prevRequest = { path: basePath, excludes: ignored };
                result[basePath] = [prevRequest];
            }
        }
        return result;
    }
    exports.normalizeRoots = normalizeRoots;
    function isEqualRequests(r1, r2) {
        return (0, arrays_1.equals)(r1, r2, (a, b) => a.path === b.path && isEqualIgnore(a.excludes, b.excludes));
    }
    function isEqualIgnore(i1, i2) {
        return (0, arrays_1.equals)(i1, i2);
    }
});
//# sourceMappingURL=chokidarWatcherService.js.map