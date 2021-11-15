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
define(["require", "exports", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/editor/common/editorService", "vs/base/common/network", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/common/editor", "vs/base/common/resources", "vs/workbench/services/environment/common/environmentService", "vs/platform/registry/common/platform", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/path/common/pathService", "vs/platform/log/common/log", "vs/base/common/async"], function (require, exports, workingCopyBackup_1, editorService_1, network_1, lifecycle_1, editor_1, resources_1, environmentService_1, platform_1, instantiation_1, pathService_1, log_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LegacyWorkingCopyBackupRestorer = void 0;
    /**
     * @deprecated TODO@bpasero remove me once all backups are handled properly
     */
    let LegacyWorkingCopyBackupRestorer = class LegacyWorkingCopyBackupRestorer {
        constructor(editorService, workingCopyBackupService, lifecycleService, environmentService, instantiationService, pathService, logService) {
            this.editorService = editorService;
            this.workingCopyBackupService = workingCopyBackupService;
            this.lifecycleService = lifecycleService;
            this.environmentService = environmentService;
            this.instantiationService = instantiationService;
            this.pathService = pathService;
            this.logService = logService;
            this.editorInputFactories = platform_1.Registry.as(editor_1.EditorExtensions.EditorInputFactories);
            this.restoreLegacyBackups();
        }
        restoreLegacyBackups() {
            this.lifecycleService.when(3 /* Restored */).then(() => this.doRestoreLegacyBackups());
        }
        async doRestoreLegacyBackups() {
            // Resolve all backup resources that exist for this window
            // that have not yet adopted the working copy editor handler
            // - any working copy without `typeId`
            // - not `search-edior:/` (supports migration to typeId)
            const backups = (await this.workingCopyBackupService.getBackups())
                .filter(backup => backup.typeId.length === 0)
                .filter(backup => backup.resource.scheme !== 'search-editor');
            // Trigger `resolve` in each opened editor that can be found
            // for the given resource and keep track of backups that are
            // not opened.
            const unresolvedBackups = await this.resolveOpenedBackupEditors(backups);
            // For remaining unresolved backups, explicitly open an editor
            if (unresolvedBackups.length > 0) {
                try {
                    await this.openEditors(unresolvedBackups);
                }
                catch (error) {
                    this.logService.error(error);
                }
                // Finally trigger `resolve` in the newly opened editors
                await this.resolveOpenedBackupEditors(unresolvedBackups);
            }
        }
        async resolveOpenedBackupEditors(backups) {
            const unresolvedBackups = [];
            await async_1.Promises.settled(backups.map(async (backup) => {
                const openedEditor = this.findOpenedEditor(backup);
                if (openedEditor) {
                    try {
                        await openedEditor.resolve();
                    }
                    catch (error) {
                        unresolvedBackups.push(backup); // ignore error and remember as unresolved
                    }
                }
                else {
                    unresolvedBackups.push(backup);
                }
            }));
            return unresolvedBackups;
        }
        findOpenedEditor(backup) {
            for (const editor of this.editorService.editors) {
                const customFactory = this.editorInputFactories.getCustomEditorInputFactory(backup.resource.scheme);
                if ((customFactory === null || customFactory === void 0 ? void 0 : customFactory.canResolveBackup(editor, backup.resource)) || (0, resources_1.isEqual)(editor.resource, backup.resource)) {
                    return editor;
                }
            }
            return undefined;
        }
        async openEditors(backups) {
            const hasOpenedEditors = this.editorService.visibleEditors.length > 0;
            const editors = await async_1.Promises.settled(backups.map((backup, index) => this.resolveEditor(backup, index, hasOpenedEditors)));
            await this.editorService.openEditors(editors);
        }
        async resolveEditor(backup, index, hasOpenedEditors) {
            // Set editor as `inactive` if we have other editors
            const options = { pinned: true, preserveFocus: true, inactive: index > 0 || hasOpenedEditors };
            // This is a (weak) strategy to find out if the untitled input had
            // an associated file path or not by just looking at the path. and
            // if so, we must ensure to restore the local resource it had.
            if (backup.resource.scheme === network_1.Schemas.untitled && !LegacyWorkingCopyBackupRestorer.UNTITLED_REGEX.test(backup.resource.path)) {
                return { resource: (0, resources_1.toLocalResource)(backup.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme), options, forceUntitled: true };
            }
            // Handle custom editors by asking the custom editor input factory
            // to create the input.
            const customFactory = this.editorInputFactories.getCustomEditorInputFactory(backup.resource.scheme);
            if (customFactory) {
                const editor = await customFactory.createCustomEditorInput(backup.resource, this.instantiationService);
                return { editor, options };
            }
            // Finally return with a simple resource based input
            return { resource: backup.resource, options };
        }
    };
    LegacyWorkingCopyBackupRestorer.UNTITLED_REGEX = /Untitled-\d+/;
    LegacyWorkingCopyBackupRestorer = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(2, lifecycle_1.ILifecycleService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, pathService_1.IPathService),
        __param(6, log_1.ILogService)
    ], LegacyWorkingCopyBackupRestorer);
    exports.LegacyWorkingCopyBackupRestorer = LegacyWorkingCopyBackupRestorer;
});
//# sourceMappingURL=legacyBackupRestorer.js.map