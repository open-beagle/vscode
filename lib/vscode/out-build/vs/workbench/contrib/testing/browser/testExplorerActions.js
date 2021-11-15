/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/codicons", "vs/base/common/iterator", "vs/base/common/types", "vs/editor/browser/editorBrowser", "vs/editor/common/core/range", "vs/nls!vs/workbench/contrib/testing/browser/testExplorerActions", "vs/platform/actions/common/actions", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/theme/common/themeService", "vs/platform/workspace/common/workspace", "vs/workbench/browser/parts/views/viewPane", "vs/workbench/common/views", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/files/browser/fileCommands", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/browser/icons", "vs/workbench/contrib/testing/browser/testingExplorerFilter", "vs/workbench/contrib/testing/browser/testingOutputPeek", "vs/workbench/contrib/testing/browser/testingOutputTerminalService", "vs/workbench/contrib/testing/common/testingAutoRun", "vs/workbench/contrib/testing/common/testingContextKeys", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testService", "vs/workbench/contrib/testing/common/workspaceTestCollectionService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/viewlet/browser/viewlet"], function (require, exports, actions_1, arrays_1, codicons_1, iterator_1, types_1, editorBrowser_1, range_1, nls_1, actions_2, commands_1, contextkey_1, files_1, notification_1, progress_1, themeService_1, workspace_1, viewPane_1, views_1, extensions_1, fileCommands_1, index_1, icons, testingExplorerFilter_1, testingOutputPeek_1, testingOutputTerminalService_1, testingAutoRun_1, testingContextKeys_1, testingStates_1, testResult_1, testResultService_1, testService_1, workspaceTestCollectionService_1, editorService_1, viewlet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchForTestExtension = exports.DebugLastRun = exports.ReRunLastRun = exports.DebugFailedTests = exports.ReRunFailedTests = exports.DebugCurrentFile = exports.RunCurrentFile = exports.DebugAtCursor = exports.RunAtCursor = exports.AutoRunOffAction = exports.AutoRunOnAction = exports.EditFocusedTest = exports.ClearTestResultsAction = exports.RefreshTestsAction = exports.CollapseAllAction = exports.ShowMostRecentOutputAction = exports.TestingSortByLocationAction = exports.TestingSortByNameAction = exports.TestingViewAsTreeAction = exports.TestingViewAsListAction = exports.CancelTestRunAction = exports.DebugAllAction = exports.RunAllAction = exports.DebugSelectedAction = exports.RunSelectedAction = exports.RunAction = exports.DebugAction = exports.HideOrShowTestAction = void 0;
    const category = (0, nls_1.localize)(0, null);
    var ActionOrder;
    (function (ActionOrder) {
        // Navigation:
        ActionOrder[ActionOrder["Run"] = 10] = "Run";
        ActionOrder[ActionOrder["Debug"] = 11] = "Debug";
        ActionOrder[ActionOrder["AutoRun"] = 12] = "AutoRun";
        ActionOrder[ActionOrder["Collapse"] = 13] = "Collapse";
        // Submenu:
        ActionOrder[ActionOrder["DisplayMode"] = 14] = "DisplayMode";
        ActionOrder[ActionOrder["Sort"] = 15] = "Sort";
        ActionOrder[ActionOrder["Refresh"] = 16] = "Refresh";
    })(ActionOrder || (ActionOrder = {}));
    let HideOrShowTestAction = class HideOrShowTestAction extends actions_1.Action {
        constructor(testId, testService) {
            super('testing.hideOrShowTest', testService.excludeTests.value.has(testId) ? (0, nls_1.localize)(1, null) : (0, nls_1.localize)(2, null));
            this.testId = testId;
            this.testService = testService;
        }
        /**
         * @override
         */
        run() {
            this.testService.setTestExcluded(this.testId);
            return Promise.resolve();
        }
    };
    HideOrShowTestAction = __decorate([
        __param(1, testService_1.ITestService)
    ], HideOrShowTestAction);
    exports.HideOrShowTestAction = HideOrShowTestAction;
    let DebugAction = class DebugAction extends actions_1.Action {
        constructor(tests, isRunning, testService) {
            super('testing.run', (0, nls_1.localize)(3, null), 'test-action ' + themeService_1.ThemeIcon.asClassName(icons.testingDebugIcon), 
            /* enabled= */ !isRunning);
            this.tests = tests;
            this.testService = testService;
        }
        /**
         * @override
         */
        run() {
            return this.testService.runTests({
                tests: [...this.tests],
                debug: true,
            });
        }
    };
    DebugAction = __decorate([
        __param(2, testService_1.ITestService)
    ], DebugAction);
    exports.DebugAction = DebugAction;
    let RunAction = class RunAction extends actions_1.Action {
        constructor(tests, isRunning, testService) {
            super('testing.run', (0, nls_1.localize)(4, null), 'test-action ' + themeService_1.ThemeIcon.asClassName(icons.testingRunIcon), 
            /* enabled= */ !isRunning);
            this.tests = tests;
            this.testService = testService;
        }
        /**
         * @override
         */
        run() {
            return this.testService.runTests({
                tests: [...this.tests],
                debug: false,
            });
        }
    };
    RunAction = __decorate([
        __param(2, testService_1.ITestService)
    ], RunAction);
    exports.RunAction = RunAction;
    class RunOrDebugSelectedAction extends viewPane_1.ViewAction {
        constructor(id, title, icon, debug) {
            super({
                id,
                title,
                icon,
                viewId: "workbench.view.testing" /* ExplorerViewId */,
                f1: true,
                category,
                precondition: views_1.FocusedViewContext.isEqualTo("workbench.view.testing" /* ExplorerViewId */),
            });
            this.debug = debug;
        }
        /**
         * @override
         */
        runInView(accessor, view) {
            const tests = this.getActionableTests(accessor.get(workspaceTestCollectionService_1.IWorkspaceTestCollectionService), view.viewModel);
            if (!tests.length) {
                return Promise.resolve(undefined);
            }
            return accessor.get(testService_1.ITestService).runTests({ tests, debug: this.debug });
        }
        getActionableTests(testCollection, viewModel) {
            const selected = viewModel.getSelectedTests();
            const tests = [];
            if (!selected.length) {
                for (const folder of testCollection.workspaceFolders()) {
                    for (const child of folder.getChildren()) {
                        if (this.filter(child)) {
                            tests.push({ testId: child.item.extId, src: child.src });
                        }
                    }
                }
            }
            else {
                for (const treeElement of selected) {
                    if (treeElement instanceof index_1.TestItemTreeElement && this.filter(treeElement.test)) {
                        tests.push({ testId: treeElement.test.item.extId, src: treeElement.test.src });
                    }
                }
            }
            return tests;
        }
    }
    class RunSelectedAction extends RunOrDebugSelectedAction {
        constructor() {
            super('testing.runSelected', (0, nls_1.localize)(5, null), icons.testingRunIcon, false);
        }
        /**
         * @override
         */
        filter({ item }) {
            return item.runnable;
        }
    }
    exports.RunSelectedAction = RunSelectedAction;
    class DebugSelectedAction extends RunOrDebugSelectedAction {
        constructor() {
            super('testing.debugSelected', (0, nls_1.localize)(6, null), icons.testingDebugIcon, true);
        }
        /**
         * @override
         */
        filter({ item }) {
            return item.debuggable;
        }
    }
    exports.DebugSelectedAction = DebugSelectedAction;
    const showDiscoveringWhile = (progress, task) => {
        return progress.withProgress({
            location: 10 /* Window */,
            title: (0, nls_1.localize)(7, null),
        }, () => task);
    };
    class RunOrDebugAllAllAction extends actions_2.Action2 {
        constructor(id, title, icon, debug, noTestsFoundError) {
            super({
                id,
                title,
                icon,
                f1: true,
                category,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    order: debug ? 11 /* Debug */ : 10 /* Run */,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyAndExpr.create([
                        contextkey_1.ContextKeyEqualsExpr.create('view', "workbench.view.testing" /* ExplorerViewId */),
                        testingContextKeys_1.TestingContextKeys.isRunning.isEqualTo(false),
                        debug
                            ? testingContextKeys_1.TestingContextKeys.hasDebuggableTests.isEqualTo(true)
                            : testingContextKeys_1.TestingContextKeys.hasRunnableTests.isEqualTo(true),
                    ])
                }
            });
            this.debug = debug;
            this.noTestsFoundError = noTestsFoundError;
        }
        async run(accessor) {
            const testService = accessor.get(testService_1.ITestService);
            const workspace = accessor.get(workspace_1.IWorkspaceContextService);
            const notifications = accessor.get(notification_1.INotificationService);
            const progress = accessor.get(progress_1.IProgressService);
            const tests = [];
            const todo = workspace.getWorkspace().folders.map(async (folder) => {
                const ref = testService.subscribeToDiffs(0 /* Workspace */, folder.uri);
                try {
                    await (0, testService_1.waitForAllRoots)(ref.object);
                    for (const root of ref.object.rootIds) {
                        const node = ref.object.getNodeById(root);
                        if (node && (this.debug ? node.item.debuggable : node.item.runnable)) {
                            tests.push({ testId: node.item.extId, src: node.src });
                        }
                    }
                }
                finally {
                    ref.dispose();
                }
            });
            await showDiscoveringWhile(progress, Promise.all(todo));
            if (tests.length === 0) {
                notifications.info(this.noTestsFoundError);
                return;
            }
            await testService.runTests({ tests, debug: this.debug });
        }
    }
    class RunAllAction extends RunOrDebugAllAllAction {
        constructor() {
            super('testing.runAll', (0, nls_1.localize)(8, null), icons.testingRunAllIcon, false, (0, nls_1.localize)(9, null));
        }
    }
    exports.RunAllAction = RunAllAction;
    class DebugAllAction extends RunOrDebugAllAllAction {
        constructor() {
            super('testing.debugAll', (0, nls_1.localize)(10, null), icons.testingDebugIcon, true, (0, nls_1.localize)(11, null));
        }
    }
    exports.DebugAllAction = DebugAllAction;
    class CancelTestRunAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'testing.cancelRun',
                title: (0, nls_1.localize)(12, null),
                icon: icons.testingCancelIcon,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    order: 10 /* Run */,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyAndExpr.create([
                        contextkey_1.ContextKeyEqualsExpr.create('view', "workbench.view.testing" /* ExplorerViewId */),
                        contextkey_1.ContextKeyEqualsExpr.create(testingContextKeys_1.TestingContextKeys.isRunning.serialize(), true),
                    ])
                }
            });
        }
        /**
         * @override
         */
        async run(accessor) {
            const testService = accessor.get(testService_1.ITestService);
            for (const run of testService.testRuns) {
                testService.cancelTestRun(run);
            }
        }
    }
    exports.CancelTestRunAction = CancelTestRunAction;
    class TestingViewAsListAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'testing.viewAsList',
                viewId: "workbench.view.testing" /* ExplorerViewId */,
                title: (0, nls_1.localize)(13, null),
                f1: false,
                toggled: testingContextKeys_1.TestingContextKeys.viewMode.isEqualTo("list" /* List */),
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    order: 14 /* DisplayMode */,
                    group: 'viewAs',
                    when: contextkey_1.ContextKeyEqualsExpr.create('view', "workbench.view.testing" /* ExplorerViewId */)
                }
            });
        }
        /**
         * @override
         */
        runInView(_accessor, view) {
            view.viewModel.viewMode = "list" /* List */;
        }
    }
    exports.TestingViewAsListAction = TestingViewAsListAction;
    class TestingViewAsTreeAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'testing.viewAsTree',
                viewId: "workbench.view.testing" /* ExplorerViewId */,
                title: (0, nls_1.localize)(14, null),
                f1: false,
                toggled: testingContextKeys_1.TestingContextKeys.viewMode.isEqualTo("true" /* Tree */),
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    order: 14 /* DisplayMode */,
                    group: 'viewAs',
                    when: contextkey_1.ContextKeyEqualsExpr.create('view', "workbench.view.testing" /* ExplorerViewId */)
                }
            });
        }
        /**
         * @override
         */
        runInView(_accessor, view) {
            view.viewModel.viewMode = "true" /* Tree */;
        }
    }
    exports.TestingViewAsTreeAction = TestingViewAsTreeAction;
    class TestingSortByNameAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'testing.sortByName',
                viewId: "workbench.view.testing" /* ExplorerViewId */,
                title: (0, nls_1.localize)(15, null),
                f1: false,
                toggled: testingContextKeys_1.TestingContextKeys.viewSorting.isEqualTo("name" /* ByName */),
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    order: 15 /* Sort */,
                    group: 'sortBy',
                    when: contextkey_1.ContextKeyEqualsExpr.create('view', "workbench.view.testing" /* ExplorerViewId */)
                }
            });
        }
        /**
         * @override
         */
        runInView(_accessor, view) {
            view.viewModel.viewSorting = "name" /* ByName */;
        }
    }
    exports.TestingSortByNameAction = TestingSortByNameAction;
    class TestingSortByLocationAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'testing.sortByLocation',
                viewId: "workbench.view.testing" /* ExplorerViewId */,
                title: (0, nls_1.localize)(16, null),
                f1: false,
                toggled: testingContextKeys_1.TestingContextKeys.viewSorting.isEqualTo("location" /* ByLocation */),
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    order: 15 /* Sort */,
                    group: 'sortBy',
                    when: contextkey_1.ContextKeyEqualsExpr.create('view', "workbench.view.testing" /* ExplorerViewId */)
                }
            });
        }
        /**
         * @override
         */
        runInView(_accessor, view) {
            view.viewModel.viewSorting = "location" /* ByLocation */;
        }
    }
    exports.TestingSortByLocationAction = TestingSortByLocationAction;
    class ShowMostRecentOutputAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'testing.showMostRecentOutput',
                title: (0, nls_1.localize)(17, null),
                f1: true,
                category,
                icon: codicons_1.Codicon.terminal,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    order: 13 /* Collapse */,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyEqualsExpr.create('view', "workbench.view.testing" /* ExplorerViewId */)
                }
            });
        }
        run(accessor) {
            const result = accessor.get(testResultService_1.ITestResultService).results[0];
            accessor.get(testingOutputTerminalService_1.ITestingOutputTerminalService).open(result);
        }
    }
    exports.ShowMostRecentOutputAction = ShowMostRecentOutputAction;
    class CollapseAllAction extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'testing.collapseAll',
                viewId: "workbench.view.testing" /* ExplorerViewId */,
                title: (0, nls_1.localize)(18, null),
                f1: false,
                icon: codicons_1.Codicon.collapseAll,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    order: 13 /* Collapse */,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyEqualsExpr.create('view', "workbench.view.testing" /* ExplorerViewId */)
                }
            });
        }
        /**
         * @override
         */
        runInView(_accessor, view) {
            view.viewModel.collapseAll();
        }
    }
    exports.CollapseAllAction = CollapseAllAction;
    class RefreshTestsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'testing.refreshTests',
                title: (0, nls_1.localize)(19, null),
                category,
                f1: true,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    order: 16 /* Refresh */,
                    group: 'refresh',
                    when: contextkey_1.ContextKeyEqualsExpr.create('view', "workbench.view.testing" /* ExplorerViewId */)
                }
            });
        }
        /**
         * @override
         */
        run(accessor) {
            accessor.get(testService_1.ITestService).resubscribeToAllTests();
        }
    }
    exports.RefreshTestsAction = RefreshTestsAction;
    class ClearTestResultsAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'testing.clearTestResults',
                title: (0, nls_1.localize)(20, null),
                category,
                f1: true
            });
        }
        /**
         * @override
         */
        run(accessor) {
            accessor.get(testResultService_1.ITestResultService).clear();
        }
    }
    exports.ClearTestResultsAction = ClearTestResultsAction;
    class EditFocusedTest extends viewPane_1.ViewAction {
        constructor() {
            super({
                id: 'testing.editFocusedTest',
                viewId: "workbench.view.testing" /* ExplorerViewId */,
                title: (0, nls_1.localize)(21, null),
                f1: false,
                menu: {
                    id: actions_2.MenuId.TestItem,
                },
                keybinding: {
                    weight: 100 /* EditorContrib */ - 10,
                    when: views_1.FocusedViewContext.isEqualTo("workbench.view.testing" /* ExplorerViewId */),
                    primary: 3 /* Enter */ | 512 /* Alt */,
                },
            });
        }
        async run(accessor, test, preserveFocus) {
            if (test) {
                await this.runForTest(accessor, test, preserveFocus);
            }
            else {
                await super.run(accessor);
            }
        }
        /**
         * @override
         */
        runInView(accessor, view) {
            const selected = view.viewModel.tree.getFocus().find(types_1.isDefined);
            if (selected instanceof index_1.TestItemTreeElement) {
                this.runForTest(accessor, selected.test.item, false);
            }
        }
        /**
         * @override
         */
        async runForTest(accessor, test, preserveFocus = true) {
            const commandService = accessor.get(commands_1.ICommandService);
            const fileService = accessor.get(files_1.IFileService);
            const editorService = accessor.get(editorService_1.IEditorService);
            accessor.get(testingExplorerFilter_1.ITestExplorerFilterState).reveal.value = [test.extId];
            let isFile = true;
            try {
                if (!(await fileService.resolve(test.uri)).isFile) {
                    isFile = false;
                }
            }
            catch (_a) {
                // ignored
            }
            if (!isFile) {
                await commandService.executeCommand(fileCommands_1.REVEAL_IN_EXPLORER_COMMAND_ID, test.uri);
                return;
            }
            const pane = await editorService.openEditor({
                resource: test.uri,
                options: {
                    selection: test.range
                        ? { startColumn: test.range.startColumn, startLineNumber: test.range.startLineNumber }
                        : undefined,
                    preserveFocus,
                },
            });
            // if the user selected a failed test and now they didn't, hide the peek
            const control = pane === null || pane === void 0 ? void 0 : pane.getControl();
            if ((0, editorBrowser_1.isCodeEditor)(control)) {
                testingOutputPeek_1.TestingOutputPeekController.get(control).removePeek();
            }
        }
    }
    exports.EditFocusedTest = EditFocusedTest;
    class ToggleAutoRun extends actions_2.Action2 {
        constructor(title, whenToggleIs) {
            super({
                id: 'testing.toggleautoRun',
                title,
                f1: true,
                icon: icons.testingAutorunIcon,
                toggled: whenToggleIs === true ? contextkey_1.ContextKeyTrueExpr.INSTANCE : contextkey_1.ContextKeyFalseExpr.INSTANCE,
                menu: {
                    id: actions_2.MenuId.ViewTitle,
                    order: 12 /* AutoRun */,
                    group: 'navigation',
                    when: contextkey_1.ContextKeyAndExpr.create([
                        contextkey_1.ContextKeyEqualsExpr.create('view', "workbench.view.testing" /* ExplorerViewId */),
                        testingContextKeys_1.TestingContextKeys.autoRun.isEqualTo(whenToggleIs)
                    ])
                }
            });
        }
        /**
         * @override
         */
        run(accessor) {
            accessor.get(testingAutoRun_1.ITestingAutoRun).toggle();
        }
    }
    class AutoRunOnAction extends ToggleAutoRun {
        constructor() {
            super((0, nls_1.localize)(22, null), false);
        }
    }
    exports.AutoRunOnAction = AutoRunOnAction;
    class AutoRunOffAction extends ToggleAutoRun {
        constructor() {
            super((0, nls_1.localize)(23, null), true);
        }
    }
    exports.AutoRunOffAction = AutoRunOffAction;
    class RunOrDebugAtCursor extends actions_2.Action2 {
        /**
         * @override
         */
        async run(accessor) {
            const control = accessor.get(editorService_1.IEditorService).activeTextEditorControl;
            const position = control === null || control === void 0 ? void 0 : control.getPosition();
            const model = control === null || control === void 0 ? void 0 : control.getModel();
            if (!position || !model || !('uri' in model)) {
                return;
            }
            const testService = accessor.get(testService_1.ITestService);
            const collection = testService.subscribeToDiffs(1 /* TextDocument */, model.uri);
            let bestDepth = -1;
            let bestNode;
            try {
                await showDiscoveringWhile(accessor.get(progress_1.IProgressService), (0, testService_1.getAllTestsInHierarchy)(collection.object));
                const queue = [[0, collection.object.rootIds]];
                while (queue.length > 0) {
                    const [depth, candidates] = queue.pop();
                    for (const id of candidates) {
                        const candidate = collection.object.getNodeById(id);
                        if (candidate) {
                            if (depth > bestDepth && this.filter(candidate) && candidate.item.range && range_1.Range.containsPosition(candidate.item.range, position)) {
                                bestDepth = depth;
                                bestNode = candidate;
                            }
                            queue.push([depth + 1, candidate.children]);
                        }
                    }
                }
                if (bestNode) {
                    await this.runTest(testService, bestNode);
                }
            }
            finally {
                collection.dispose();
            }
        }
    }
    class RunAtCursor extends RunOrDebugAtCursor {
        constructor() {
            super({
                id: 'testing.runAtCursor',
                title: (0, nls_1.localize)(24, null),
                f1: true,
                category,
            });
        }
        filter(node) {
            return node.item.runnable;
        }
        runTest(service, internalTest) {
            return service.runTests({
                debug: false,
                tests: [{ testId: internalTest.item.extId, src: internalTest.src }],
            });
        }
    }
    exports.RunAtCursor = RunAtCursor;
    class DebugAtCursor extends RunOrDebugAtCursor {
        constructor() {
            super({
                id: 'testing.debugAtCursor',
                title: (0, nls_1.localize)(25, null),
                f1: true,
                category,
            });
        }
        filter(node) {
            return node.item.debuggable;
        }
        runTest(service, internalTest) {
            return service.runTests({
                debug: true,
                tests: [{ testId: internalTest.item.extId, src: internalTest.src }],
            });
        }
    }
    exports.DebugAtCursor = DebugAtCursor;
    class RunOrDebugCurrentFile extends actions_2.Action2 {
        /**
         * @override
         */
        async run(accessor) {
            const control = accessor.get(editorService_1.IEditorService).activeTextEditorControl;
            const position = control === null || control === void 0 ? void 0 : control.getPosition();
            const model = control === null || control === void 0 ? void 0 : control.getModel();
            if (!position || !model || !('uri' in model)) {
                return;
            }
            const testService = accessor.get(testService_1.ITestService);
            const collection = testService.subscribeToDiffs(1 /* TextDocument */, model.uri);
            try {
                await (0, testService_1.waitForAllRoots)(collection.object);
                const roots = [...collection.object.rootIds]
                    .map(r => collection.object.getNodeById(r))
                    .filter(types_1.isDefined)
                    .filter(n => this.filter(n));
                if (roots.length) {
                    await this.runTest(testService, roots);
                }
            }
            finally {
                collection.dispose();
            }
        }
    }
    class RunCurrentFile extends RunOrDebugCurrentFile {
        constructor() {
            super({
                id: 'testing.runCurrentFile',
                title: (0, nls_1.localize)(26, null),
                f1: true,
                category,
            });
        }
        filter(node) {
            return node.item.runnable;
        }
        runTest(service, internalTests) {
            return service.runTests({
                debug: false,
                tests: internalTests.map(t => ({ testId: t.item.extId, src: t.src })),
            });
        }
    }
    exports.RunCurrentFile = RunCurrentFile;
    class DebugCurrentFile extends RunOrDebugCurrentFile {
        constructor() {
            super({
                id: 'testing.debugCurrentFile',
                title: (0, nls_1.localize)(27, null),
                f1: true,
                category,
            });
        }
        filter(node) {
            return node.item.debuggable;
        }
        runTest(service, internalTests) {
            return service.runTests({
                debug: true,
                tests: internalTests.map(t => ({ testId: t.item.extId, src: t.src }))
            });
        }
    }
    exports.DebugCurrentFile = DebugCurrentFile;
    class RunOrDebugExtsById extends actions_2.Action2 {
        /**
         * @override
         */
        async run(accessor) {
            const testService = accessor.get(testService_1.ITestService);
            const paths = [...this.getTestExtIdsToRun(accessor)];
            if (paths.length === 0) {
                return;
            }
            const workspaceTests = accessor.get(workspaceTestCollectionService_1.IWorkspaceTestCollectionService).subscribeToWorkspaceTests();
            try {
                const todo = Promise.all(workspaceTests.workspaceFolderCollections.map(([, c]) => Promise.all(paths.map(p => (0, testService_1.getTestByPath)(c, p)))));
                const tests = (0, arrays_1.flatten)(await showDiscoveringWhile(accessor.get(progress_1.IProgressService), todo)).filter(types_1.isDefined);
                if (tests.length) {
                    await this.runTest(testService, tests);
                }
            }
            finally {
                workspaceTests.dispose();
            }
        }
    }
    class RunOrDebugFailedTests extends RunOrDebugExtsById {
        /**
         * @inheritdoc
         */
        getTestExtIdsToRun(accessor) {
            const { results } = accessor.get(testResultService_1.ITestResultService);
            const paths = new Set();
            const sep = '$$TEST SEP$$';
            for (let i = results.length - 1; i >= 0; i--) {
                const resultSet = results[i];
                for (const test of resultSet.tests) {
                    const path = (0, testResult_1.getPathForTestInResult)(test, resultSet).join(sep);
                    if ((0, testingStates_1.isFailedState)(test.ownComputedState)) {
                        paths.add(path);
                    }
                    else {
                        paths.delete(path);
                    }
                }
            }
            return iterator_1.Iterable.map(paths, p => p.split(sep));
        }
    }
    class RunOrDebugLastRun extends RunOrDebugExtsById {
        /**
         * @inheritdoc
         */
        *getTestExtIdsToRun(accessor) {
            const lastResult = accessor.get(testResultService_1.ITestResultService).results[0];
            if (!lastResult) {
                return;
            }
            for (const test of lastResult.tests) {
                if (test.direct) {
                    yield (0, testResult_1.getPathForTestInResult)(test, lastResult);
                }
            }
        }
    }
    class ReRunFailedTests extends RunOrDebugFailedTests {
        constructor() {
            super({
                id: 'testing.reRunFailTests',
                title: (0, nls_1.localize)(28, null),
                f1: true,
                category,
            });
        }
        filter(node) {
            return node.item.runnable;
        }
        runTest(service, internalTests) {
            return service.runTests({
                debug: false,
                tests: internalTests.map(t => ({ testId: t.item.extId, src: t.src })),
            });
        }
    }
    exports.ReRunFailedTests = ReRunFailedTests;
    class DebugFailedTests extends RunOrDebugFailedTests {
        constructor() {
            super({
                id: 'testing.debugFailTests',
                title: (0, nls_1.localize)(29, null),
                f1: true,
                category,
            });
        }
        filter(node) {
            return node.item.debuggable;
        }
        runTest(service, internalTests) {
            return service.runTests({
                debug: true,
                tests: internalTests.map(t => ({ testId: t.item.extId, src: t.src })),
            });
        }
    }
    exports.DebugFailedTests = DebugFailedTests;
    class ReRunLastRun extends RunOrDebugLastRun {
        constructor() {
            super({
                id: 'testing.reRunLastRun',
                title: (0, nls_1.localize)(30, null),
                f1: true,
                category,
            });
        }
        filter(node) {
            return node.item.runnable;
        }
        runTest(service, internalTests) {
            return service.runTests({
                debug: false,
                tests: internalTests.map(t => ({ testId: t.item.extId, src: t.src })),
            });
        }
    }
    exports.ReRunLastRun = ReRunLastRun;
    class DebugLastRun extends RunOrDebugLastRun {
        constructor() {
            super({
                id: 'testing.debugLastRun',
                title: (0, nls_1.localize)(31, null),
                f1: true,
                category,
            });
        }
        filter(node) {
            return node.item.debuggable;
        }
        runTest(service, internalTests) {
            return service.runTests({
                debug: true,
                tests: internalTests.map(t => ({ testId: t.item.extId, src: t.src })),
            });
        }
    }
    exports.DebugLastRun = DebugLastRun;
    class SearchForTestExtension extends actions_2.Action2 {
        constructor() {
            super({
                id: 'testing.searchForTestExtension',
                title: (0, nls_1.localize)(32, null),
                f1: false,
            });
        }
        async run(accessor) {
            var _a;
            const viewletService = accessor.get(viewlet_1.IViewletService);
            const viewlet = (_a = (await viewletService.openViewlet(extensions_1.VIEWLET_ID, true))) === null || _a === void 0 ? void 0 : _a.getViewPaneContainer();
            viewlet.search('tag:testing @sort:installs');
            viewlet.focus();
        }
    }
    exports.SearchForTestExtension = SearchForTestExtension;
});
//# sourceMappingURL=testExplorerActions.js.map