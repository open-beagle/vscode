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
define(["require", "exports", "vs/editor/common/services/modelService", "vs/editor/common/services/resolverService", "vs/workbench/contrib/testing/common/testingUri", "vs/workbench/contrib/testing/common/testResultService"], function (require, exports, modelService_1, resolverService_1, testingUri_1, testResultService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestingContentProvider = void 0;
    /**
     * A content provider that returns various outputs for tests. This is used
     * in the inline peek view.
     */
    let TestingContentProvider = class TestingContentProvider {
        constructor(textModelResolverService, modelService, resultService) {
            this.modelService = modelService;
            this.resultService = resultService;
            textModelResolverService.registerTextModelContentProvider(testingUri_1.TEST_DATA_SCHEME, this);
        }
        /**
         * @inheritdoc
         */
        async provideTextContent(resource) {
            var _a, _b, _c, _d;
            const existing = this.modelService.getModel(resource);
            if (existing && !existing.isDisposed()) {
                return existing;
            }
            const parsed = (0, testingUri_1.parseTestUri)(resource);
            if (!parsed) {
                return null;
            }
            const test = (_a = this.resultService.getResult(parsed.resultId)) === null || _a === void 0 ? void 0 : _a.getStateById(parsed.testExtId);
            if (!test) {
                return null;
            }
            let text;
            switch (parsed.type) {
                case 1 /* ResultActualOutput */:
                    text = (_b = test.tasks[parsed.taskIndex].messages[parsed.messageIndex]) === null || _b === void 0 ? void 0 : _b.actualOutput;
                    break;
                case 2 /* ResultExpectedOutput */:
                    text = (_c = test.tasks[parsed.taskIndex].messages[parsed.messageIndex]) === null || _c === void 0 ? void 0 : _c.expectedOutput;
                    break;
                case 0 /* ResultMessage */:
                    text = (_d = test.tasks[parsed.taskIndex].messages[parsed.messageIndex]) === null || _d === void 0 ? void 0 : _d.message.toString();
                    break;
            }
            if (text === undefined) {
                return null;
            }
            return this.modelService.createModel(text, null, resource, true);
        }
    };
    TestingContentProvider = __decorate([
        __param(0, resolverService_1.ITextModelService),
        __param(1, modelService_1.IModelService),
        __param(2, testResultService_1.ITestResultService)
    ], TestingContentProvider);
    exports.TestingContentProvider = TestingContentProvider;
});
//# sourceMappingURL=testingContentProvider.js.map