/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/debug/common/abstractDebugAdapter", "vs/workbench/contrib/debug/common/debugStorage", "vs/workbench/contrib/debug/common/debugModel", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/services/uriIdentity/common/uriIdentityService"], function (require, exports, abstractDebugAdapter_1, debugStorage_1, debugModel_1, workbenchTestServices_1, uriIdentityService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createMockDebugModel = exports.MockDebugAdapter = exports.MockRawSession = exports.MockSession = exports.MockDebugService = exports.mockUriIdentityService = void 0;
    const fileService = new workbenchTestServices_1.TestFileService();
    exports.mockUriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
    class MockDebugService {
        get state() {
            throw new Error('not implemented');
        }
        get onWillNewSession() {
            throw new Error('not implemented');
        }
        get onDidNewSession() {
            throw new Error('not implemented');
        }
        get onDidEndSession() {
            throw new Error('not implemented');
        }
        get onDidChangeState() {
            throw new Error('not implemented');
        }
        getConfigurationManager() {
            throw new Error('not implemented');
        }
        getAdapterManager() {
            throw new Error('Method not implemented.');
        }
        canSetBreakpointsIn(model) {
            throw new Error('Method not implemented.');
        }
        focusStackFrame(focusedStackFrame) {
            throw new Error('not implemented');
        }
        sendAllBreakpoints(session) {
            throw new Error('not implemented');
        }
        addBreakpoints(uri, rawBreakpoints) {
            throw new Error('not implemented');
        }
        updateBreakpoints(uri, data, sendOnResourceSaved) {
            throw new Error('not implemented');
        }
        enableOrDisableBreakpoints(enabled) {
            throw new Error('not implemented');
        }
        setBreakpointsActivated() {
            throw new Error('not implemented');
        }
        removeBreakpoints() {
            throw new Error('not implemented');
        }
        setExceptionBreakpointCondition(breakpoint, condition) {
            throw new Error('Method not implemented.');
        }
        setExceptionBreakpoints(data) {
            throw new Error('Method not implemented.');
        }
        addFunctionBreakpoint() { }
        moveWatchExpression(id, position) { }
        updateFunctionBreakpoint(id, update) {
            throw new Error('not implemented');
        }
        removeFunctionBreakpoints(id) {
            throw new Error('not implemented');
        }
        addDataBreakpoint(label, dataId, canPersist) {
            throw new Error('Method not implemented.');
        }
        removeDataBreakpoints(id) {
            throw new Error('Method not implemented.');
        }
        addReplExpression(name) {
            throw new Error('not implemented');
        }
        removeReplExpressions() { }
        addWatchExpression(name) {
            throw new Error('not implemented');
        }
        renameWatchExpression(id, newName) {
            throw new Error('not implemented');
        }
        removeWatchExpressions(id) { }
        startDebugging(launch, configOrName, options) {
            return Promise.resolve(true);
        }
        restartSession() {
            throw new Error('not implemented');
        }
        stopSession() {
            throw new Error('not implemented');
        }
        getModel() {
            throw new Error('not implemented');
        }
        getViewModel() {
            throw new Error('not implemented');
        }
        logToRepl(session, value) { }
        sourceIsNotAvailable(uri) { }
        tryToAutoFocusStackFrame(thread) {
            throw new Error('not implemented');
        }
    }
    exports.MockDebugService = MockDebugService;
    class MockSession {
        constructor() {
            this.configuration = { type: 'mock', name: 'mock', request: 'launch' };
            this.unresolvedConfiguration = { type: 'mock', name: 'mock', request: 'launch' };
            this.state = 2 /* Stopped */;
            this.capabilities = {};
        }
        get compoundRoot() {
            return undefined;
        }
        stepInTargets(frameId) {
            throw new Error('Method not implemented.');
        }
        cancel(_progressId) {
            throw new Error('Method not implemented.');
        }
        breakpointsLocations(uri, lineNumber) {
            throw new Error('Method not implemented.');
        }
        dataBreakpointInfo(name, variablesReference) {
            throw new Error('Method not implemented.');
        }
        sendDataBreakpoints(dbps) {
            throw new Error('Method not implemented.');
        }
        get compact() {
            return false;
        }
        setSubId(subId) {
            throw new Error('Method not implemented.');
        }
        get parentSession() {
            return undefined;
        }
        getReplElements() {
            return [];
        }
        hasSeparateRepl() {
            return true;
        }
        removeReplExpressions() { }
        get onDidChangeReplElements() {
            throw new Error('not implemented');
        }
        addReplExpression(stackFrame, name) {
            return Promise.resolve(undefined);
        }
        appendToRepl(data, severity, source) { }
        logToRepl(sev, args, frame) { }
        getId() {
            return 'mock';
        }
        getLabel() {
            return 'mockname';
        }
        get name() {
            return 'mockname';
        }
        setName(name) {
            throw new Error('not implemented');
        }
        getSourceForUri(modelUri) {
            throw new Error('not implemented');
        }
        getThread(threadId) {
            throw new Error('not implemented');
        }
        get onDidCustomEvent() {
            throw new Error('not implemented');
        }
        get onDidLoadedSource() {
            throw new Error('not implemented');
        }
        get onDidChangeState() {
            throw new Error('not implemented');
        }
        get onDidEndAdapter() {
            throw new Error('not implemented');
        }
        get onDidChangeName() {
            throw new Error('not implemented');
        }
        get onDidProgressStart() {
            throw new Error('not implemented');
        }
        get onDidProgressUpdate() {
            throw new Error('not implemented');
        }
        get onDidProgressEnd() {
            throw new Error('not implemented');
        }
        setConfiguration(configuration) { }
        getAllThreads() {
            return [];
        }
        getSource(raw) {
            throw new Error('not implemented');
        }
        getLoadedSources() {
            return Promise.resolve([]);
        }
        completions(frameId, threadId, text, position, overwriteBefore) {
            throw new Error('not implemented');
        }
        clearThreads(removeThreads, reference) { }
        rawUpdate(data) { }
        initialize(dbgr) {
            throw new Error('Method not implemented.');
        }
        launchOrAttach(config) {
            throw new Error('Method not implemented.');
        }
        restart() {
            throw new Error('Method not implemented.');
        }
        sendBreakpoints(modelUri, bpts, sourceModified) {
            throw new Error('Method not implemented.');
        }
        sendFunctionBreakpoints(fbps) {
            throw new Error('Method not implemented.');
        }
        sendExceptionBreakpoints(exbpts) {
            throw new Error('Method not implemented.');
        }
        getDebugProtocolBreakpoint(breakpointId) {
            throw new Error('Method not implemented.');
        }
        customRequest(request, args) {
            throw new Error('Method not implemented.');
        }
        stackTrace(threadId, startFrame, levels, token) {
            throw new Error('Method not implemented.');
        }
        exceptionInfo(threadId) {
            throw new Error('Method not implemented.');
        }
        scopes(frameId) {
            throw new Error('Method not implemented.');
        }
        variables(variablesReference, threadId, filter, start, count) {
            throw new Error('Method not implemented.');
        }
        evaluate(expression, frameId, context) {
            throw new Error('Method not implemented.');
        }
        restartFrame(frameId, threadId) {
            throw new Error('Method not implemented.');
        }
        next(threadId) {
            throw new Error('Method not implemented.');
        }
        stepIn(threadId, targetId) {
            throw new Error('Method not implemented.');
        }
        stepOut(threadId) {
            throw new Error('Method not implemented.');
        }
        stepBack(threadId) {
            throw new Error('Method not implemented.');
        }
        continue(threadId) {
            throw new Error('Method not implemented.');
        }
        reverseContinue(threadId) {
            throw new Error('Method not implemented.');
        }
        pause(threadId) {
            throw new Error('Method not implemented.');
        }
        terminateThreads(threadIds) {
            throw new Error('Method not implemented.');
        }
        setVariable(variablesReference, name, value) {
            throw new Error('Method not implemented.');
        }
        loadSource(resource) {
            throw new Error('Method not implemented.');
        }
        terminate(restart = false) {
            throw new Error('Method not implemented.');
        }
        disconnect(restart = false) {
            throw new Error('Method not implemented.');
        }
        gotoTargets(source, line, column) {
            throw new Error('Method not implemented.');
        }
        goto(threadId, targetId) {
            throw new Error('Method not implemented.');
        }
    }
    exports.MockSession = MockSession;
    class MockRawSession {
        constructor() {
            this.capabilities = {};
            this.disconnected = false;
            this.sessionLengthInSeconds = 0;
            this.readyForBreakpoints = true;
            this.emittedStopped = true;
            this.onDidStop = null;
        }
        getLengthInSeconds() {
            return 100;
        }
        stackTrace(args) {
            return Promise.resolve({
                seq: 1,
                type: 'response',
                request_seq: 1,
                success: true,
                command: 'stackTrace',
                body: {
                    stackFrames: [{
                            id: 1,
                            name: 'mock',
                            line: 5,
                            column: 6
                        }]
                }
            });
        }
        exceptionInfo(args) {
            throw new Error('not implemented');
        }
        launchOrAttach(args) {
            throw new Error('not implemented');
        }
        scopes(args) {
            throw new Error('not implemented');
        }
        variables(args) {
            throw new Error('not implemented');
        }
        evaluate(args) {
            return Promise.resolve(null);
        }
        custom(request, args) {
            throw new Error('not implemented');
        }
        terminate(restart = false) {
            throw new Error('not implemented');
        }
        disconnect(restart) {
            throw new Error('not implemented');
        }
        threads() {
            throw new Error('not implemented');
        }
        stepIn(args) {
            throw new Error('not implemented');
        }
        stepOut(args) {
            throw new Error('not implemented');
        }
        stepBack(args) {
            throw new Error('not implemented');
        }
        continue(args) {
            throw new Error('not implemented');
        }
        reverseContinue(args) {
            throw new Error('not implemented');
        }
        pause(args) {
            throw new Error('not implemented');
        }
        terminateThreads(args) {
            throw new Error('not implemented');
        }
        setVariable(args) {
            throw new Error('not implemented');
        }
        restartFrame(args) {
            throw new Error('not implemented');
        }
        completions(args) {
            throw new Error('not implemented');
        }
        next(args) {
            throw new Error('not implemented');
        }
        source(args) {
            throw new Error('not implemented');
        }
        loadedSources(args) {
            throw new Error('not implemented');
        }
        setBreakpoints(args) {
            throw new Error('not implemented');
        }
        setFunctionBreakpoints(args) {
            throw new Error('not implemented');
        }
        setExceptionBreakpoints(args) {
            throw new Error('not implemented');
        }
    }
    exports.MockRawSession = MockRawSession;
    class MockDebugAdapter extends abstractDebugAdapter_1.AbstractDebugAdapter {
        constructor() {
            super(...arguments);
            this.seq = 0;
        }
        startSession() {
            return Promise.resolve();
        }
        stopSession() {
            return Promise.resolve();
        }
        sendMessage(message) {
            setTimeout(() => {
                if (message.type === 'request') {
                    const request = message;
                    switch (request.command) {
                        case 'evaluate':
                            this.evaluate(request, request.arguments);
                            return;
                    }
                    this.sendResponseBody(request, {});
                    return;
                }
            }, 0);
        }
        sendResponseBody(request, body) {
            const response = {
                seq: ++this.seq,
                type: 'response',
                request_seq: request.seq,
                command: request.command,
                success: true,
                body
            };
            this.acceptMessage(response);
        }
        sendEventBody(event, body) {
            const response = {
                seq: ++this.seq,
                type: 'event',
                event,
                body
            };
            this.acceptMessage(response);
        }
        evaluate(request, args) {
            if (args.expression.indexOf('before.') === 0) {
                this.sendEventBody('output', { output: args.expression });
            }
            this.sendResponseBody(request, {
                result: '=' + args.expression,
                variablesReference: 0
            });
            if (args.expression.indexOf('after.') === 0) {
                this.sendEventBody('output', { output: args.expression });
            }
        }
    }
    exports.MockDebugAdapter = MockDebugAdapter;
    class MockDebugStorage extends debugStorage_1.DebugStorage {
        constructor() {
            super(undefined, undefined, undefined);
        }
        loadBreakpoints() {
            return [];
        }
        loadFunctionBreakpoints() {
            return [];
        }
        loadExceptionBreakpoints() {
            return [];
        }
        loadDataBreakpoints() {
            return [];
        }
        loadWatchExpressions() {
            return [];
        }
        storeWatchExpressions(_watchExpressions) { }
        storeBreakpoints(_debugModel) { }
    }
    function createMockDebugModel() {
        return new debugModel_1.DebugModel(new MockDebugStorage(), { isDirty: (e) => false }, exports.mockUriIdentityService);
    }
    exports.createMockDebugModel = createMockDebugModel;
});
//# sourceMappingURL=mockDebug.js.map