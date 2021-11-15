/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/async", "vs/base/common/glob", "vs/base/common/uri", "./extHostTypeConverters", "./extHostTypes"], function (require, exports, event_1, async_1, glob_1, uri_1, typeConverter, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostFileSystemEventService = void 0;
    class FileSystemWatcher {
        constructor(dispatcher, globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
            this._onDidCreate = new event_1.Emitter();
            this._onDidChange = new event_1.Emitter();
            this._onDidDelete = new event_1.Emitter();
            this._config = 0;
            if (ignoreCreateEvents) {
                this._config += 0b001;
            }
            if (ignoreChangeEvents) {
                this._config += 0b010;
            }
            if (ignoreDeleteEvents) {
                this._config += 0b100;
            }
            const parsedPattern = (0, glob_1.parse)(globPattern);
            const subscription = dispatcher(events => {
                if (!ignoreCreateEvents) {
                    for (let created of events.created) {
                        const uri = uri_1.URI.revive(created);
                        if (parsedPattern(uri.fsPath)) {
                            this._onDidCreate.fire(uri);
                        }
                    }
                }
                if (!ignoreChangeEvents) {
                    for (let changed of events.changed) {
                        const uri = uri_1.URI.revive(changed);
                        if (parsedPattern(uri.fsPath)) {
                            this._onDidChange.fire(uri);
                        }
                    }
                }
                if (!ignoreDeleteEvents) {
                    for (let deleted of events.deleted) {
                        const uri = uri_1.URI.revive(deleted);
                        if (parsedPattern(uri.fsPath)) {
                            this._onDidDelete.fire(uri);
                        }
                    }
                }
            });
            this._disposable = extHostTypes_1.Disposable.from(this._onDidCreate, this._onDidChange, this._onDidDelete, subscription);
        }
        get ignoreCreateEvents() {
            return Boolean(this._config & 0b001);
        }
        get ignoreChangeEvents() {
            return Boolean(this._config & 0b010);
        }
        get ignoreDeleteEvents() {
            return Boolean(this._config & 0b100);
        }
        dispose() {
            this._disposable.dispose();
        }
        get onDidCreate() {
            return this._onDidCreate.event;
        }
        get onDidChange() {
            return this._onDidChange.event;
        }
        get onDidDelete() {
            return this._onDidDelete.event;
        }
    }
    class ExtHostFileSystemEventService {
        constructor(mainContext, _logService, _extHostDocumentsAndEditors) {
            this._logService = _logService;
            this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
            this._onFileSystemEvent = new event_1.Emitter();
            this._onDidRenameFile = new event_1.Emitter();
            this._onDidCreateFile = new event_1.Emitter();
            this._onDidDeleteFile = new event_1.Emitter();
            this._onWillRenameFile = new async_1.AsyncEmitter();
            this._onWillCreateFile = new async_1.AsyncEmitter();
            this._onWillDeleteFile = new async_1.AsyncEmitter();
            this.onDidRenameFile = this._onDidRenameFile.event;
            this.onDidCreateFile = this._onDidCreateFile.event;
            this.onDidDeleteFile = this._onDidDeleteFile.event;
            //
        }
        //--- file events
        createFileSystemWatcher(globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents) {
            return new FileSystemWatcher(this._onFileSystemEvent.event, globPattern, ignoreCreateEvents, ignoreChangeEvents, ignoreDeleteEvents);
        }
        $onFileEvent(events) {
            this._onFileSystemEvent.fire(events);
        }
        //--- file operations
        $onDidRunFileOperation(operation, files) {
            switch (operation) {
                case 2 /* MOVE */:
                    this._onDidRenameFile.fire(Object.freeze({ files: files.map(f => ({ oldUri: uri_1.URI.revive(f.source), newUri: uri_1.URI.revive(f.target) })) }));
                    break;
                case 1 /* DELETE */:
                    this._onDidDeleteFile.fire(Object.freeze({ files: files.map(f => uri_1.URI.revive(f.target)) }));
                    break;
                case 0 /* CREATE */:
                    this._onDidCreateFile.fire(Object.freeze({ files: files.map(f => uri_1.URI.revive(f.target)) }));
                    break;
                default:
                //ignore, dont send
            }
        }
        getOnWillRenameFileEvent(extension) {
            return this._createWillExecuteEvent(extension, this._onWillRenameFile);
        }
        getOnWillCreateFileEvent(extension) {
            return this._createWillExecuteEvent(extension, this._onWillCreateFile);
        }
        getOnWillDeleteFileEvent(extension) {
            return this._createWillExecuteEvent(extension, this._onWillDeleteFile);
        }
        _createWillExecuteEvent(extension, emitter) {
            return (listener, thisArg, disposables) => {
                const wrappedListener = function wrapped(e) { listener.call(thisArg, e); };
                wrappedListener.extension = extension;
                return emitter.event(wrappedListener, undefined, disposables);
            };
        }
        async $onWillRunFileOperation(operation, files, timeout, token) {
            switch (operation) {
                case 2 /* MOVE */:
                    return await this._fireWillEvent(this._onWillRenameFile, { files: files.map(f => ({ oldUri: uri_1.URI.revive(f.source), newUri: uri_1.URI.revive(f.target) })) }, timeout, token);
                case 1 /* DELETE */:
                    return await this._fireWillEvent(this._onWillDeleteFile, { files: files.map(f => uri_1.URI.revive(f.target)) }, timeout, token);
                case 0 /* CREATE */:
                    return await this._fireWillEvent(this._onWillCreateFile, { files: files.map(f => uri_1.URI.revive(f.target)) }, timeout, token);
            }
            return undefined;
        }
        async _fireWillEvent(emitter, data, timeout, token) {
            const extensionNames = new Set();
            const edits = [];
            await emitter.fireAsync(data, token, async (thenable, listener) => {
                var _a;
                // ignore all results except for WorkspaceEdits. Those are stored in an array.
                const now = Date.now();
                const result = await Promise.resolve(thenable);
                if (result instanceof extHostTypes_1.WorkspaceEdit) {
                    edits.push(result);
                    extensionNames.add((_a = listener.extension.displayName) !== null && _a !== void 0 ? _a : listener.extension.identifier.value);
                }
                if (Date.now() - now > timeout) {
                    this._logService.warn('SLOW file-participant', listener.extension.identifier);
                }
            });
            if (token.isCancellationRequested) {
                return undefined;
            }
            if (edits.length === 0) {
                return undefined;
            }
            // concat all WorkspaceEdits collected via waitUntil-call and send them over to the renderer
            const dto = { edits: [] };
            for (let edit of edits) {
                let { edits } = typeConverter.WorkspaceEdit.from(edit, this._extHostDocumentsAndEditors);
                dto.edits = dto.edits.concat(edits);
            }
            return { edit: dto, extensionNames: Array.from(extensionNames) };
        }
    }
    exports.ExtHostFileSystemEventService = ExtHostFileSystemEventService;
});
//# sourceMappingURL=extHostFileSystemEventService.js.map