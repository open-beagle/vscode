/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "child_process", "vs/nls!vs/workbench/contrib/cli/node/cli.contribution", "vs/base/common/path", "vs/base/node/pfs", "vs/base/node/extpath", "util", "vs/platform/actions/common/actions", "vs/platform/product/common/product", "vs/platform/notification/common/notification", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/platform/log/common/log", "vs/base/common/network", "vs/platform/product/common/productService", "vs/platform/contextkey/common/contextkey", "vs/platform/contextkey/common/contextkeys"], function (require, exports, fs, cp, nls, path, pfs, extpath, util_1, actions_1, product_1, notification_1, dialogs_1, severity_1, log_1, network_1, productService_1, contextkey_1, contextkeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function ignore(code, value) {
        return err => err.code === code ? Promise.resolve(value) : Promise.reject(err);
    }
    let _source = null;
    function getSource() {
        if (!_source) {
            const root = network_1.FileAccess.asFileUri('', require).fsPath;
            _source = path.resolve(root, '..', 'bin', 'code');
        }
        return _source;
    }
    function isAvailable() {
        return Promise.resolve(pfs.exists(getSource()));
    }
    const category = nls.localize(0, null);
    class InstallAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.installCommandLine',
                title: {
                    value: nls.localize(1, null, product_1.default.applicationName),
                    original: `Shell Command: Install \'${product_1.default.applicationName}\' command in PATH`
                },
                category,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(contextkeys_1.IsMacNativeContext, contextkey_1.ContextKeyExpr.equals('remoteName', ''))
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const notificationService = accessor.get(notification_1.INotificationService);
            const logService = accessor.get(log_1.ILogService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const target = `/usr/local/bin/${productService.applicationName}`;
            return isAvailable().then(isAvailable => {
                if (!isAvailable) {
                    const message = nls.localize(2, null);
                    notificationService.info(message);
                    return undefined;
                }
                return this.isInstalled(target)
                    .then(isInstalled => {
                    if (!isAvailable || isInstalled) {
                        return Promise.resolve(null);
                    }
                    else {
                        return fs.promises.unlink(target)
                            .then(undefined, ignore('ENOENT', null))
                            .then(() => fs.promises.symlink(getSource(), target))
                            .then(undefined, err => {
                            if (err.code === 'EACCES' || err.code === 'ENOENT') {
                                return new Promise((resolve, reject) => {
                                    const buttons = [nls.localize(3, null), nls.localize(4, null)];
                                    dialogService.show(severity_1.default.Info, nls.localize(5, null), buttons, { cancelId: 1 }).then(result => {
                                        switch (result.choice) {
                                            case 0 /* OK */:
                                                const command = 'osascript -e "do shell script \\"mkdir -p /usr/local/bin && ln -sf \'' + getSource() + '\' \'' + target + '\'\\" with administrator privileges"';
                                                (0, util_1.promisify)(cp.exec)(command, {})
                                                    .then(undefined, _ => Promise.reject(new Error(nls.localize(6, null))))
                                                    .then(() => resolve(), reject);
                                                break;
                                            case 1 /* Cancel */:
                                                reject(new Error(nls.localize(7, null)));
                                                break;
                                        }
                                    });
                                });
                            }
                            return Promise.reject(err);
                        });
                    }
                })
                    .then(() => {
                    logService.trace('cli#install', target);
                    notificationService.info(nls.localize(8, null, productService.applicationName));
                });
            });
        }
        async isInstalled(target) {
            try {
                const stat = await fs.promises.lstat(target);
                return stat.isSymbolicLink() && getSource() === await extpath.realpath(target);
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    return false;
                }
                throw err;
            }
        }
    }
    class UninstallAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.uninstallCommandLine',
                title: {
                    value: nls.localize(9, null, product_1.default.applicationName),
                    original: `Shell Command: Uninstall \'${product_1.default.applicationName}\' command from PATH`
                },
                category,
                f1: true,
                precondition: contextkey_1.ContextKeyExpr.and(contextkeys_1.IsMacNativeContext, contextkey_1.ContextKeyExpr.equals('remoteName', ''))
            });
        }
        run(accessor) {
            const productService = accessor.get(productService_1.IProductService);
            const notificationService = accessor.get(notification_1.INotificationService);
            const logService = accessor.get(log_1.ILogService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const target = `/usr/local/bin/${productService.applicationName}`;
            return isAvailable().then(isAvailable => {
                if (!isAvailable) {
                    const message = nls.localize(10, null);
                    notificationService.info(message);
                    return undefined;
                }
                const uninstall = () => {
                    return fs.promises.unlink(target)
                        .then(undefined, ignore('ENOENT', null));
                };
                return uninstall().then(undefined, err => {
                    if (err.code === 'EACCES') {
                        return new Promise(async (resolve, reject) => {
                            const buttons = [nls.localize(11, null), nls.localize(12, null)];
                            const { choice } = await dialogService.show(severity_1.default.Info, nls.localize(13, null), buttons, { cancelId: 1 });
                            switch (choice) {
                                case 0 /* OK */:
                                    const command = 'osascript -e "do shell script \\"rm \'' + target + '\'\\" with administrator privileges"';
                                    (0, util_1.promisify)(cp.exec)(command, {})
                                        .then(undefined, _ => Promise.reject(new Error(nls.localize(14, null, target))))
                                        .then(() => resolve(), reject);
                                    break;
                                case 1 /* Cancel */:
                                    reject(new Error(nls.localize(15, null)));
                                    break;
                            }
                        });
                    }
                    return Promise.reject(err);
                }).then(() => {
                    logService.trace('cli#uninstall', target);
                    notificationService.info(nls.localize(16, null, productService.applicationName));
                });
            });
        }
    }
    (0, actions_1.registerAction2)(InstallAction);
    (0, actions_1.registerAction2)(UninstallAction);
});
//# sourceMappingURL=cli.contribution.js.map