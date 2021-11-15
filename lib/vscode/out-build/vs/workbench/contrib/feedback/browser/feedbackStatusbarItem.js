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
define(["require", "exports", "vs/base/common/lifecycle", "vs/workbench/contrib/feedback/browser/feedback", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/product/common/productService", "vs/workbench/services/statusbar/common/statusbar", "vs/nls!vs/workbench/contrib/feedback/browser/feedbackStatusbarItem", "vs/platform/commands/common/commands", "vs/base/common/uri", "vs/platform/actions/common/actions", "vs/workbench/common/actions", "vs/base/common/types", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/browser/parts/notifications/notificationsCommands"], function (require, exports, lifecycle_1, feedback_1, contextView_1, instantiation_1, productService_1, statusbar_1, nls_1, commands_1, uri_1, actions_1, actions_2, types_1, layoutService_1, notificationsCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FeedbackStatusbarConribution = void 0;
    class TwitterFeedbackService {
        combineHashTagsAsString() {
            return TwitterFeedbackService.HASHTAGS.join(',');
        }
        submitFeedback(feedback, openerService) {
            const queryString = `?${feedback.sentiment === 1 ? `hashtags=${this.combineHashTagsAsString()}&` : ''}ref_src=twsrc%5Etfw&related=twitterapi%2Ctwitter&text=${encodeURIComponent(feedback.feedback)}&tw_p=tweetbutton&via=${TwitterFeedbackService.VIA_NAME}`;
            const url = TwitterFeedbackService.TWITTER_URL + queryString;
            openerService.open(uri_1.URI.parse(url));
        }
        getCharacterLimit(sentiment) {
            let length = 0;
            if (sentiment === 1) {
                TwitterFeedbackService.HASHTAGS.forEach(element => {
                    length += element.length + 2;
                });
            }
            if (TwitterFeedbackService.VIA_NAME) {
                length += ` via @${TwitterFeedbackService.VIA_NAME}`.length;
            }
            return 280 - length;
        }
    }
    TwitterFeedbackService.TWITTER_URL = 'https://twitter.com/intent/tweet';
    TwitterFeedbackService.VIA_NAME = 'code';
    TwitterFeedbackService.HASHTAGS = ['HappyCoding'];
    let FeedbackStatusbarConribution = class FeedbackStatusbarConribution extends lifecycle_1.Disposable {
        constructor(statusbarService, productService, instantiationService, contextViewService, layoutService, commandService) {
            super();
            this.statusbarService = statusbarService;
            this.instantiationService = instantiationService;
            this.contextViewService = contextViewService;
            this.layoutService = layoutService;
            this.commandService = commandService;
            if (productService.sendASmile) {
                this.createFeedbackStatusEntry();
                this.registerListeners();
            }
        }
        createFeedbackStatusEntry() {
            // Status entry
            this.entry = this._register(this.statusbarService.addEntry(this.getStatusEntry(), 'status.feedback', (0, nls_1.localize)(0, null), 1 /* RIGHT */, -100 /* towards the end of the right hand side */));
            // Command to toggle
            commands_1.CommandsRegistry.registerCommand(FeedbackStatusbarConribution.TOGGLE_FEEDBACK_COMMAND, () => this.toggleFeedback());
            actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.CommandPalette, {
                command: {
                    id: FeedbackStatusbarConribution.TOGGLE_FEEDBACK_COMMAND,
                    category: actions_2.CATEGORIES.Help,
                    title: (0, nls_1.localize)(1, null)
                }
            });
        }
        registerListeners() {
            // Hide feedback widget whenever notifications appear
            this._register(this.layoutService.onDidChangeNotificationsVisibility(visible => {
                var _a;
                if (visible) {
                    (_a = this.widget) === null || _a === void 0 ? void 0 : _a.hide();
                }
            }));
        }
        createFeedbackWidget() {
            const statusContainer = document.getElementById('status.feedback');
            if (statusContainer) {
                const icon = (0, types_1.assertIsDefined)(statusContainer.getElementsByClassName('codicon').item(0));
                this.widget = this._register(this.instantiationService.createInstance(feedback_1.FeedbackWidget, icon, {
                    contextViewProvider: this.contextViewService,
                    feedbackService: this.instantiationService.createInstance(TwitterFeedbackService),
                    onFeedbackVisibilityChange: visible => { var _a; return (_a = this.entry) === null || _a === void 0 ? void 0 : _a.update(this.getStatusEntry(visible)); }
                }));
            }
        }
        toggleFeedback() {
            var _a, _b;
            if (!this.widget) {
                this.createFeedbackWidget();
            }
            // Hide when visible
            if ((_a = this.widget) === null || _a === void 0 ? void 0 : _a.isVisible()) {
                this.widget.hide();
            }
            // Show when hidden
            else {
                this.commandService.executeCommand(notificationsCommands_1.HIDE_NOTIFICATION_TOAST);
                this.commandService.executeCommand(notificationsCommands_1.HIDE_NOTIFICATIONS_CENTER);
                (_b = this.widget) === null || _b === void 0 ? void 0 : _b.show();
            }
        }
        getStatusEntry(showBeak) {
            return {
                text: '$(feedback)',
                ariaLabel: (0, nls_1.localize)(2, null),
                tooltip: (0, nls_1.localize)(3, null),
                command: FeedbackStatusbarConribution.TOGGLE_FEEDBACK_COMMAND,
                showBeak
            };
        }
    };
    FeedbackStatusbarConribution.TOGGLE_FEEDBACK_COMMAND = 'help.tweetFeedback';
    FeedbackStatusbarConribution = __decorate([
        __param(0, statusbar_1.IStatusbarService),
        __param(1, productService_1.IProductService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, contextView_1.IContextViewService),
        __param(4, layoutService_1.IWorkbenchLayoutService),
        __param(5, commands_1.ICommandService)
    ], FeedbackStatusbarConribution);
    exports.FeedbackStatusbarConribution = FeedbackStatusbarConribution;
});
//# sourceMappingURL=feedbackStatusbarItem.js.map