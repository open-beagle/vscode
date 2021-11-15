/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/actions/helpActions", "vs/platform/product/common/product", "vs/base/common/platform", "vs/platform/telemetry/common/telemetry", "vs/platform/opener/common/opener", "vs/base/common/uri", "vs/platform/actions/common/actions", "vs/base/common/keyCodes", "vs/platform/product/common/productService", "vs/workbench/common/actions"], function (require, exports, nls_1, product_1, platform_1, telemetry_1, opener_1, uri_1, actions_1, keyCodes_1, productService_1, actions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class KeybindingsReferenceAction extends actions_1.Action2 {
        constructor() {
            super({
                id: KeybindingsReferenceAction.ID,
                title: { value: (0, nls_1.localize)(0, null), original: 'Keyboard Shortcuts Reference' },
                category: actions_2.CATEGORIES.Help,
                f1: true,
                keybinding: {
                    weight: 200 /* WorkbenchContrib */,
                    when: null,
                    primary: (0, keyCodes_1.KeyChord)(2048 /* CtrlCmd */ | 41 /* KEY_K */, 2048 /* CtrlCmd */ | 48 /* KEY_R */)
                }
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const url = platform_1.isLinux ? productService.keyboardShortcutsUrlLinux : platform_1.isMacintosh ? productService.keyboardShortcutsUrlMac : productService.keyboardShortcutsUrlWin;
            if (url) {
                openerService.open(uri_1.URI.parse(url));
            }
        }
    }
    KeybindingsReferenceAction.ID = 'workbench.action.keybindingsReference';
    KeybindingsReferenceAction.AVAILABLE = !!(platform_1.isLinux ? product_1.default.keyboardShortcutsUrlLinux : platform_1.isMacintosh ? product_1.default.keyboardShortcutsUrlMac : product_1.default.keyboardShortcutsUrlWin);
    class OpenDocumentationUrlAction extends actions_1.Action2 {
        constructor() {
            super({
                id: OpenDocumentationUrlAction.ID,
                title: { value: (0, nls_1.localize)(1, null), original: 'Documentation' },
                category: actions_2.CATEGORIES.Help,
                f1: true
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.documentationUrl) {
                openerService.open(uri_1.URI.parse(productService.documentationUrl));
            }
        }
    }
    OpenDocumentationUrlAction.ID = 'workbench.action.openDocumentationUrl';
    OpenDocumentationUrlAction.AVAILABLE = !!product_1.default.documentationUrl;
    class OpenIntroductoryVideosUrlAction extends actions_1.Action2 {
        constructor() {
            super({
                id: OpenIntroductoryVideosUrlAction.ID,
                title: { value: (0, nls_1.localize)(2, null), original: 'Introductory Videos' },
                category: actions_2.CATEGORIES.Help,
                f1: true
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.introductoryVideosUrl) {
                openerService.open(uri_1.URI.parse(productService.introductoryVideosUrl));
            }
        }
    }
    OpenIntroductoryVideosUrlAction.ID = 'workbench.action.openIntroductoryVideosUrl';
    OpenIntroductoryVideosUrlAction.AVAILABLE = !!product_1.default.introductoryVideosUrl;
    class OpenTipsAndTricksUrlAction extends actions_1.Action2 {
        constructor() {
            super({
                id: OpenTipsAndTricksUrlAction.ID,
                title: { value: (0, nls_1.localize)(3, null), original: 'Tips and Tricks' },
                category: actions_2.CATEGORIES.Help,
                f1: true
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.tipsAndTricksUrl) {
                openerService.open(uri_1.URI.parse(productService.tipsAndTricksUrl));
            }
        }
    }
    OpenTipsAndTricksUrlAction.ID = 'workbench.action.openTipsAndTricksUrl';
    OpenTipsAndTricksUrlAction.AVAILABLE = !!product_1.default.tipsAndTricksUrl;
    class OpenNewsletterSignupUrlAction extends actions_1.Action2 {
        constructor() {
            super({
                id: OpenNewsletterSignupUrlAction.ID,
                title: { value: (0, nls_1.localize)(4, null), original: 'Signup for the VS Code Newsletter' },
                category: actions_2.CATEGORIES.Help,
                f1: true
            });
        }
        async run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            const info = await telemetryService.getTelemetryInfo();
            openerService.open(uri_1.URI.parse(`${productService.newsletterSignupUrl}?machineId=${encodeURIComponent(info.machineId)}`));
        }
    }
    OpenNewsletterSignupUrlAction.ID = 'workbench.action.openNewsletterSignupUrl';
    OpenNewsletterSignupUrlAction.AVAILABLE = !!product_1.default.newsletterSignupUrl;
    class OpenTwitterUrlAction extends actions_1.Action2 {
        constructor() {
            super({
                id: OpenTwitterUrlAction.ID,
                title: { value: (0, nls_1.localize)(5, null), original: 'Join Us on Twitter' },
                category: actions_2.CATEGORIES.Help,
                f1: true
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.twitterUrl) {
                openerService.open(uri_1.URI.parse(productService.twitterUrl));
            }
        }
    }
    OpenTwitterUrlAction.ID = 'workbench.action.openTwitterUrl';
    OpenTwitterUrlAction.AVAILABLE = !!product_1.default.twitterUrl;
    class OpenRequestFeatureUrlAction extends actions_1.Action2 {
        constructor() {
            super({
                id: OpenRequestFeatureUrlAction.ID,
                title: { value: (0, nls_1.localize)(6, null), original: 'Search Feature Requests' },
                category: actions_2.CATEGORIES.Help,
                f1: true
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.requestFeatureUrl) {
                openerService.open(uri_1.URI.parse(productService.requestFeatureUrl));
            }
        }
    }
    OpenRequestFeatureUrlAction.ID = 'workbench.action.openRequestFeatureUrl';
    OpenRequestFeatureUrlAction.AVAILABLE = !!product_1.default.requestFeatureUrl;
    class OpenLicenseUrlAction extends actions_1.Action2 {
        constructor() {
            super({
                id: OpenLicenseUrlAction.ID,
                title: { value: (0, nls_1.localize)(7, null), original: 'View License' },
                category: actions_2.CATEGORIES.Help,
                f1: true
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.licenseUrl) {
                if (platform_1.language) {
                    const queryArgChar = productService.licenseUrl.indexOf('?') > 0 ? '&' : '?';
                    openerService.open(uri_1.URI.parse(`${productService.licenseUrl}${queryArgChar}lang=${platform_1.language}`));
                }
                else {
                    openerService.open(uri_1.URI.parse(productService.licenseUrl));
                }
            }
        }
    }
    OpenLicenseUrlAction.ID = 'workbench.action.openLicenseUrl';
    OpenLicenseUrlAction.AVAILABLE = !!product_1.default.licenseUrl;
    class OpenPrivacyStatementUrlAction extends actions_1.Action2 {
        constructor() {
            super({
                id: OpenPrivacyStatementUrlAction.ID,
                title: { value: (0, nls_1.localize)(8, null), original: 'Privacy Statement' },
                category: actions_2.CATEGORIES.Help,
                f1: true
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const openerService = accessor.get(opener_1.IOpenerService);
            if (productService.privacyStatementUrl) {
                if (platform_1.language) {
                    const queryArgChar = productService.privacyStatementUrl.indexOf('?') > 0 ? '&' : '?';
                    openerService.open(uri_1.URI.parse(`${productService.privacyStatementUrl}${queryArgChar}lang=${platform_1.language}`));
                }
                else {
                    openerService.open(uri_1.URI.parse(productService.privacyStatementUrl));
                }
            }
        }
    }
    OpenPrivacyStatementUrlAction.ID = 'workbench.action.openPrivacyStatementUrl';
    OpenPrivacyStatementUrlAction.AVAILABE = !!product_1.default.privacyStatementUrl;
    // --- Actions Registration
    if (KeybindingsReferenceAction.AVAILABLE) {
        (0, actions_1.registerAction2)(KeybindingsReferenceAction);
    }
    if (OpenDocumentationUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenDocumentationUrlAction);
    }
    if (OpenIntroductoryVideosUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenIntroductoryVideosUrlAction);
    }
    if (OpenTipsAndTricksUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenTipsAndTricksUrlAction);
    }
    if (OpenNewsletterSignupUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenNewsletterSignupUrlAction);
    }
    if (OpenTwitterUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenTwitterUrlAction);
    }
    if (OpenRequestFeatureUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenRequestFeatureUrlAction);
    }
    if (OpenLicenseUrlAction.AVAILABLE) {
        (0, actions_1.registerAction2)(OpenLicenseUrlAction);
    }
    if (OpenPrivacyStatementUrlAction.AVAILABE) {
        (0, actions_1.registerAction2)(OpenPrivacyStatementUrlAction);
    }
    // --- Menu Registration
    // Help
    if (OpenDocumentationUrlAction.AVAILABLE) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
            group: '1_welcome',
            command: {
                id: OpenDocumentationUrlAction.ID,
                title: (0, nls_1.localize)(9, null)
            },
            order: 3
        });
    }
    // Reference
    if (KeybindingsReferenceAction.AVAILABLE) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
            group: '2_reference',
            command: {
                id: KeybindingsReferenceAction.ID,
                title: (0, nls_1.localize)(10, null)
            },
            order: 1
        });
    }
    if (OpenIntroductoryVideosUrlAction.AVAILABLE) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
            group: '2_reference',
            command: {
                id: OpenIntroductoryVideosUrlAction.ID,
                title: (0, nls_1.localize)(11, null)
            },
            order: 2
        });
    }
    if (OpenTipsAndTricksUrlAction.AVAILABLE) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
            group: '2_reference',
            command: {
                id: OpenTipsAndTricksUrlAction.ID,
                title: (0, nls_1.localize)(12, null)
            },
            order: 3
        });
    }
    // Feedback
    if (OpenTwitterUrlAction.AVAILABLE) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
            group: '3_feedback',
            command: {
                id: OpenTwitterUrlAction.ID,
                title: (0, nls_1.localize)(13, null)
            },
            order: 1
        });
    }
    if (OpenRequestFeatureUrlAction.AVAILABLE) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
            group: '3_feedback',
            command: {
                id: OpenRequestFeatureUrlAction.ID,
                title: (0, nls_1.localize)(14, null)
            },
            order: 2
        });
    }
    // Legal
    if (OpenLicenseUrlAction.AVAILABLE) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
            group: '4_legal',
            command: {
                id: OpenLicenseUrlAction.ID,
                title: (0, nls_1.localize)(15, null)
            },
            order: 1
        });
    }
    if (OpenPrivacyStatementUrlAction.AVAILABE) {
        actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
            group: '4_legal',
            command: {
                id: OpenPrivacyStatementUrlAction.ID,
                title: (0, nls_1.localize)(16, null)
            },
            order: 2
        });
    }
});
//# sourceMappingURL=helpActions.js.map