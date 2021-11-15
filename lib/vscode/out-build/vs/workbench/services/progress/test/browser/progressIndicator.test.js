/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/services/progress/browser/progressIndicator", "vs/workbench/test/browser/workbenchTestServices", "vs/base/common/event"], function (require, exports, assert, progressIndicator_1, workbenchTestServices_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestViewlet {
        constructor(id) {
            this.id = id;
            this.onDidBlur = event_1.Event.None;
            this.onDidFocus = event_1.Event.None;
        }
        hasFocus() { return false; }
        getId() { return this.id; }
        getTitle() { return this.id; }
        getControl() { return null; }
        focus() { }
        getOptimalWidth() { return 10; }
        openView(id, focus) { return undefined; }
        getViewPaneContainer() { return null; }
        saveState() { }
    }
    class TestCompositeScope extends progressIndicator_1.CompositeScope {
        constructor(viewletService, panelService, viewsService, scopeId) {
            super(viewletService, panelService, viewsService, scopeId);
            this.isActive = false;
        }
        onScopeActivated() { this.isActive = true; }
        onScopeDeactivated() { this.isActive = false; }
    }
    class TestProgressBar {
        constructor() {
            this.fTotal = 0;
            this.fWorked = 0;
            this.fInfinite = false;
            this.fDone = false;
        }
        infinite() {
            this.fDone = null;
            this.fInfinite = true;
            return this;
        }
        total(total) {
            this.fDone = null;
            this.fTotal = total;
            return this;
        }
        hasTotal() {
            return !!this.fTotal;
        }
        worked(worked) {
            this.fDone = null;
            if (this.fWorked) {
                this.fWorked += worked;
            }
            else {
                this.fWorked = worked;
            }
            return this;
        }
        done() {
            this.fDone = true;
            this.fInfinite = null;
            this.fWorked = null;
            this.fTotal = null;
            return this;
        }
        stop() {
            return this.done();
        }
        show() { }
        hide() { }
    }
    suite('Progress Indicator', () => {
        test('CompositeScope', () => {
            let viewletService = new workbenchTestServices_1.TestViewletService();
            let panelService = new workbenchTestServices_1.TestPanelService();
            let viewsService = new workbenchTestServices_1.TestViewsService();
            let service = new TestCompositeScope(viewletService, panelService, viewsService, 'test.scopeId');
            const testViewlet = new TestViewlet('test.scopeId');
            assert(!service.isActive);
            viewletService.onDidViewletOpenEmitter.fire(testViewlet);
            assert(service.isActive);
            viewletService.onDidViewletCloseEmitter.fire(testViewlet);
            assert(!service.isActive);
            viewsService.onDidChangeViewVisibilityEmitter.fire({ id: 'test.scopeId', visible: true });
            assert(service.isActive);
            viewsService.onDidChangeViewVisibilityEmitter.fire({ id: 'test.scopeId', visible: false });
            assert(!service.isActive);
        });
        test('CompositeProgressIndicator', async () => {
            let testProgressBar = new TestProgressBar();
            let viewletService = new workbenchTestServices_1.TestViewletService();
            let panelService = new workbenchTestServices_1.TestPanelService();
            let viewsService = new workbenchTestServices_1.TestViewsService();
            let service = new progressIndicator_1.CompositeProgressIndicator(testProgressBar, 'test.scopeId', true, viewletService, panelService, viewsService);
            // Active: Show (Infinite)
            let fn = service.show(true);
            assert.strictEqual(true, testProgressBar.fInfinite);
            fn.done();
            assert.strictEqual(true, testProgressBar.fDone);
            // Active: Show (Total / Worked)
            fn = service.show(100);
            assert.strictEqual(false, !!testProgressBar.fInfinite);
            assert.strictEqual(100, testProgressBar.fTotal);
            fn.worked(20);
            assert.strictEqual(20, testProgressBar.fWorked);
            fn.total(80);
            assert.strictEqual(80, testProgressBar.fTotal);
            fn.done();
            assert.strictEqual(true, testProgressBar.fDone);
            // Inactive: Show (Infinite)
            const testViewlet = new TestViewlet('test.scopeId');
            viewletService.onDidViewletCloseEmitter.fire(testViewlet);
            service.show(true);
            assert.strictEqual(false, !!testProgressBar.fInfinite);
            viewletService.onDidViewletOpenEmitter.fire(testViewlet);
            assert.strictEqual(true, testProgressBar.fInfinite);
            // Inactive: Show (Total / Worked)
            viewletService.onDidViewletCloseEmitter.fire(testViewlet);
            fn = service.show(100);
            fn.total(80);
            fn.worked(20);
            assert.strictEqual(false, !!testProgressBar.fTotal);
            viewletService.onDidViewletOpenEmitter.fire(testViewlet);
            assert.strictEqual(20, testProgressBar.fWorked);
            assert.strictEqual(80, testProgressBar.fTotal);
            // Acive: Show While
            let p = Promise.resolve(null);
            await service.showWhile(p);
            assert.strictEqual(true, testProgressBar.fDone);
            viewletService.onDidViewletCloseEmitter.fire(testViewlet);
            p = Promise.resolve(null);
            await service.showWhile(p);
            assert.strictEqual(true, testProgressBar.fDone);
            viewletService.onDidViewletOpenEmitter.fire(testViewlet);
            assert.strictEqual(true, testProgressBar.fDone);
            // Visible view: Show (Infinite)
            viewsService.onDidChangeViewVisibilityEmitter.fire({ id: 'test.scopeId', visible: true });
            fn = service.show(true);
            assert.strictEqual(true, testProgressBar.fInfinite);
            fn.done();
            assert.strictEqual(true, testProgressBar.fDone);
            // Hidden view: Show (Infinite)
            viewsService.onDidChangeViewVisibilityEmitter.fire({ id: 'test.scopeId', visible: false });
            service.show(true);
            assert.strictEqual(false, !!testProgressBar.fInfinite);
            viewsService.onDidChangeViewVisibilityEmitter.fire({ id: 'test.scopeId', visible: true });
            assert.strictEqual(true, testProgressBar.fInfinite);
        });
    });
});
//# sourceMappingURL=progressIndicator.test.js.map