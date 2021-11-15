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
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/common/modes", "vs/nls!vs/workbench/contrib/format/browser/formatActionsMultiple", "vs/platform/contextkey/common/contextkey", "vs/platform/quickinput/common/quickInput", "vs/base/common/cancellation", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/format/format", "vs/editor/common/core/range", "vs/platform/telemetry/common/telemetry", "vs/platform/extensions/common/extensions", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/contributions", "vs/workbench/services/extensions/common/extensions", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/editor/common/services/modeService", "vs/platform/label/common/label", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/editor/common/config/commonEditorConfig", "vs/platform/dialogs/common/dialogs"], function (require, exports, editorExtensions_1, editorContextKeys_1, modes_1, nls, contextkey_1, quickInput_1, cancellation_1, instantiation_1, format_1, range_1, telemetry_1, extensions_1, platform_1, configurationRegistry_1, contributions_1, extensions_2, lifecycle_1, configuration_1, notification_1, modeService_1, label_1, extensionManagement_1, commonEditorConfig_1, dialogs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let DefaultFormatter = class DefaultFormatter extends lifecycle_1.Disposable {
        constructor(_extensionService, _extensionEnablementService, _configService, _notificationService, _dialogService, _quickInputService, _modeService, _labelService) {
            super();
            this._extensionService = _extensionService;
            this._extensionEnablementService = _extensionEnablementService;
            this._configService = _configService;
            this._notificationService = _notificationService;
            this._dialogService = _dialogService;
            this._quickInputService = _quickInputService;
            this._modeService = _modeService;
            this._labelService = _labelService;
            this._register(this._extensionService.onDidChangeExtensions(this._updateConfigValues, this));
            this._register(format_1.FormattingConflicts.setFormatterSelector((formatter, document, mode) => this._selectFormatter(formatter, document, mode)));
            this._updateConfigValues();
        }
        async _updateConfigValues() {
            var _a, _b;
            let extensions = await this._extensionService.getExtensions();
            extensions = extensions.sort((a, b) => {
                var _a, _b;
                let boostA = (_a = a.categories) === null || _a === void 0 ? void 0 : _a.find(cat => cat === 'Formatters' || cat === 'Programming Languages');
                let boostB = (_b = b.categories) === null || _b === void 0 ? void 0 : _b.find(cat => cat === 'Formatters' || cat === 'Programming Languages');
                if (boostA && !boostB) {
                    return -1;
                }
                else if (!boostA && boostB) {
                    return 1;
                }
                else {
                    return a.name.localeCompare(b.name);
                }
            });
            DefaultFormatter.extensionIds.length = 0;
            DefaultFormatter.extensionItemLabels.length = 0;
            DefaultFormatter.extensionDescriptions.length = 0;
            DefaultFormatter.extensionIds.push(null);
            DefaultFormatter.extensionItemLabels.push(nls.localize(0, null));
            DefaultFormatter.extensionDescriptions.push(nls.localize(1, null));
            for (const extension of extensions) {
                if (extension.main || extension.browser) {
                    DefaultFormatter.extensionIds.push(extension.identifier.value);
                    DefaultFormatter.extensionItemLabels.push((_a = extension.displayName) !== null && _a !== void 0 ? _a : '');
                    DefaultFormatter.extensionDescriptions.push((_b = extension.description) !== null && _b !== void 0 ? _b : '');
                }
            }
        }
        static _maybeQuotes(s) {
            return s.match(/\s/) ? `'${s}'` : s;
        }
        async _selectFormatter(formatter, document, mode) {
            const defaultFormatterId = this._configService.getValue(DefaultFormatter.configName, {
                resource: document.uri,
                overrideIdentifier: document.getModeId()
            });
            if (defaultFormatterId) {
                // good -> formatter configured
                const defaultFormatter = formatter.find(formatter => extensions_1.ExtensionIdentifier.equals(formatter.extensionId, defaultFormatterId));
                if (defaultFormatter) {
                    // formatter available
                    return defaultFormatter;
                }
                // bad -> formatter gone
                const extension = await this._extensionService.getExtension(defaultFormatterId);
                if (extension && this._extensionEnablementService.isEnabled((0, extensions_2.toExtension)(extension))) {
                    // formatter does not target this file
                    const label = this._labelService.getUriLabel(document.uri, { relative: true });
                    const message = nls.localize(2, null, extension.displayName || extension.name, label);
                    this._notificationService.status(message, { hideAfter: 4000 });
                    return undefined;
                }
            }
            else if (formatter.length === 1) {
                // ok -> nothing configured but only one formatter available
                return formatter[0];
            }
            const langName = this._modeService.getLanguageName(document.getModeId()) || document.getModeId();
            const message = !defaultFormatterId
                ? nls.localize(3, null, DefaultFormatter._maybeQuotes(langName))
                : nls.localize(4, null, defaultFormatterId);
            if (mode !== 2 /* Silent */) {
                // running from a user action -> show modal dialog so that users configure
                // a default formatter
                const result = await this._dialogService.confirm({
                    message,
                    primaryButton: nls.localize(5, null),
                    secondaryButton: nls.localize(6, null)
                });
                if (result.confirmed) {
                    return this._pickAndPersistDefaultFormatter(formatter, document);
                }
            }
            else {
                // no user action -> show a silent notification and proceed
                this._notificationService.prompt(notification_1.Severity.Info, message, [{ label: nls.localize(7, null), run: () => this._pickAndPersistDefaultFormatter(formatter, document) }], { silent: true });
            }
            return undefined;
        }
        async _pickAndPersistDefaultFormatter(formatter, document) {
            const picks = formatter.map((formatter, index) => {
                return {
                    index,
                    label: formatter.displayName || (formatter.extensionId ? formatter.extensionId.value : '?'),
                    description: formatter.extensionId && formatter.extensionId.value
                };
            });
            const langName = this._modeService.getLanguageName(document.getModeId()) || document.getModeId();
            const pick = await this._quickInputService.pick(picks, { placeHolder: nls.localize(8, null, DefaultFormatter._maybeQuotes(langName)) });
            if (!pick || !formatter[pick.index].extensionId) {
                return undefined;
            }
            this._configService.updateValue(DefaultFormatter.configName, formatter[pick.index].extensionId.value, {
                resource: document.uri,
                overrideIdentifier: document.getModeId()
            });
            return formatter[pick.index];
        }
    };
    DefaultFormatter.configName = 'editor.defaultFormatter';
    DefaultFormatter.extensionIds = [];
    DefaultFormatter.extensionItemLabels = [];
    DefaultFormatter.extensionDescriptions = [];
    DefaultFormatter = __decorate([
        __param(0, extensions_2.IExtensionService),
        __param(1, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, notification_1.INotificationService),
        __param(4, dialogs_1.IDialogService),
        __param(5, quickInput_1.IQuickInputService),
        __param(6, modeService_1.IModeService),
        __param(7, label_1.ILabelService)
    ], DefaultFormatter);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(DefaultFormatter, 3 /* Restored */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration(Object.assign(Object.assign({}, commonEditorConfig_1.editorConfigurationBaseNode), { properties: {
            [DefaultFormatter.configName]: {
                description: nls.localize(9, null),
                type: ['string', 'null'],
                default: null,
                enum: DefaultFormatter.extensionIds,
                enumItemLabels: DefaultFormatter.extensionItemLabels,
                markdownEnumDescriptions: DefaultFormatter.extensionDescriptions
            }
        } }));
    function logFormatterTelemetry(telemetryService, mode, options, pick) {
        function extKey(obj) {
            return obj.extensionId ? extensions_1.ExtensionIdentifier.toKey(obj.extensionId) : 'unknown';
        }
        /*
         * __GDPR__
            "formatterpick" : {
                "mode" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "extensions" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                "pick" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" }
            }
         */
        telemetryService.publicLog('formatterpick', {
            mode,
            extensions: options.map(extKey),
            pick: pick ? extKey(pick) : 'none'
        });
    }
    async function showFormatterPick(accessor, model, formatters) {
        const quickPickService = accessor.get(quickInput_1.IQuickInputService);
        const configService = accessor.get(configuration_1.IConfigurationService);
        const modeService = accessor.get(modeService_1.IModeService);
        const overrides = { resource: model.uri, overrideIdentifier: model.getModeId() };
        const defaultFormatter = configService.getValue(DefaultFormatter.configName, overrides);
        let defaultFormatterPick;
        const picks = formatters.map((provider, index) => {
            const isDefault = extensions_1.ExtensionIdentifier.equals(provider.extensionId, defaultFormatter);
            const pick = {
                index,
                label: provider.displayName || '',
                description: isDefault ? nls.localize(10, null) : undefined,
            };
            if (isDefault) {
                // autofocus default pick
                defaultFormatterPick = pick;
            }
            return pick;
        });
        const configurePick = {
            label: nls.localize(11, null)
        };
        const pick = await quickPickService.pick([...picks, { type: 'separator' }, configurePick], {
            placeHolder: nls.localize(12, null),
            activeItem: defaultFormatterPick
        });
        if (!pick) {
            // dismissed
            return undefined;
        }
        else if (pick === configurePick) {
            // config default
            const langName = modeService.getLanguageName(model.getModeId()) || model.getModeId();
            const pick = await quickPickService.pick(picks, { placeHolder: nls.localize(13, null, DefaultFormatter._maybeQuotes(langName)) });
            if (pick && formatters[pick.index].extensionId) {
                configService.updateValue(DefaultFormatter.configName, formatters[pick.index].extensionId.value, overrides);
            }
            return undefined;
        }
        else {
            // picked one
            return pick.index;
        }
    }
    (0, editorExtensions_1.registerEditorAction)(class FormatDocumentMultipleAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.formatDocument.multiple',
                label: nls.localize(14, null),
                alias: 'Format Document...',
                precondition: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.hasMultipleDocumentFormattingProvider),
                contextMenuOpts: {
                    group: '1_modification',
                    order: 1.3
                }
            });
        }
        async run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            const model = editor.getModel();
            const provider = (0, format_1.getRealAndSyntheticDocumentFormattersOrdered)(model);
            const pick = await instaService.invokeFunction(showFormatterPick, model, provider);
            if (typeof pick === 'number') {
                await instaService.invokeFunction(format_1.formatDocumentWithProvider, provider[pick], editor, 1 /* Explicit */, cancellation_1.CancellationToken.None);
            }
            logFormatterTelemetry(telemetryService, 'document', provider, typeof pick === 'number' && provider[pick] || undefined);
        }
    });
    (0, editorExtensions_1.registerEditorAction)(class FormatSelectionMultipleAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.formatSelection.multiple',
                label: nls.localize(15, null),
                alias: 'Format Code...',
                precondition: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.writable), editorContextKeys_1.EditorContextKeys.hasMultipleDocumentSelectionFormattingProvider),
                contextMenuOpts: {
                    when: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.hasNonEmptySelection),
                    group: '1_modification',
                    order: 1.31
                }
            });
        }
        async run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            const telemetryService = accessor.get(telemetry_1.ITelemetryService);
            const model = editor.getModel();
            let range = editor.getSelection();
            if (range.isEmpty()) {
                range = new range_1.Range(range.startLineNumber, 1, range.startLineNumber, model.getLineMaxColumn(range.startLineNumber));
            }
            const provider = modes_1.DocumentRangeFormattingEditProviderRegistry.ordered(model);
            const pick = await instaService.invokeFunction(showFormatterPick, model, provider);
            if (typeof pick === 'number') {
                await instaService.invokeFunction(format_1.formatDocumentRangesWithProvider, provider[pick], editor, range, cancellation_1.CancellationToken.None);
            }
            logFormatterTelemetry(telemetryService, 'range', provider, typeof pick === 'number' && provider[pick] || undefined);
        }
    });
});
//# sourceMappingURL=formatActionsMultiple.js.map