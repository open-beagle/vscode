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
define(["require", "exports", "vs/nls!vs/editor/contrib/suggest/suggestWidgetRenderer", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/platform/theme/common/themeService", "vs/editor/common/services/modeService", "vs/editor/common/modes", "vs/base/browser/ui/iconLabel/iconLabel", "vs/editor/common/services/getIconClasses", "vs/editor/common/services/modelService", "vs/base/common/uri", "vs/platform/files/common/files", "vs/base/common/arrays", "./suggestWidgetDetails", "vs/base/common/codicons", "vs/base/common/event", "vs/platform/theme/common/iconRegistry"], function (require, exports, nls, filters_1, lifecycle_1, dom_1, themeService_1, modeService_1, modes_1, iconLabel_1, getIconClasses_1, modelService_1, uri_1, files_1, arrays_1, suggestWidgetDetails_1, codicons_1, event_1, iconRegistry_1) {
    "use strict";
    var _a;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemRenderer = exports.suggestMoreInfoIcon = exports.getAriaId = void 0;
    function getAriaId(index) {
        return `suggest-aria-id:${index}`;
    }
    exports.getAriaId = getAriaId;
    exports.suggestMoreInfoIcon = (0, iconRegistry_1.registerIcon)('suggest-more-info', codicons_1.Codicon.chevronRight, nls.localize(0, null));
    const _completionItemColor = new (_a = class ColorExtractor {
            extract(item, out) {
                if (item.textLabel.match(ColorExtractor._regexStrict)) {
                    out[0] = item.textLabel;
                    return true;
                }
                if (item.completion.detail && item.completion.detail.match(ColorExtractor._regexStrict)) {
                    out[0] = item.completion.detail;
                    return true;
                }
                if (typeof item.completion.documentation === 'string') {
                    const match = ColorExtractor._regexRelaxed.exec(item.completion.documentation);
                    if (match && (match.index === 0 || match.index + match[0].length === item.completion.documentation.length)) {
                        out[0] = match[0];
                        return true;
                    }
                }
                return false;
            }
        },
        _a._regexRelaxed = /(#([\da-fA-F]{3}){1,2}|(rgb|hsl)a\(\s*(\d{1,3}%?\s*,\s*){3}(1|0?\.\d+)\)|(rgb|hsl)\(\s*\d{1,3}%?(\s*,\s*\d{1,3}%?){2}\s*\))/,
        _a._regexStrict = new RegExp(`^${_a._regexRelaxed.source}$`, 'i'),
        _a);
    let ItemRenderer = class ItemRenderer {
        constructor(_editor, _modelService, _modeService, _themeService) {
            this._editor = _editor;
            this._modelService = _modelService;
            this._modeService = _modeService;
            this._themeService = _themeService;
            this._onDidToggleDetails = new event_1.Emitter();
            this.onDidToggleDetails = this._onDidToggleDetails.event;
            this.templateId = 'suggestion';
        }
        dispose() {
            this._onDidToggleDetails.dispose();
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.disposables = new lifecycle_1.DisposableStore();
            data.root = container;
            data.root.classList.add('show-file-icons');
            data.icon = (0, dom_1.append)(container, (0, dom_1.$)('.icon'));
            data.colorspan = (0, dom_1.append)(data.icon, (0, dom_1.$)('span.colorspan'));
            const text = (0, dom_1.append)(container, (0, dom_1.$)('.contents'));
            const main = (0, dom_1.append)(text, (0, dom_1.$)('.main'));
            data.iconContainer = (0, dom_1.append)(main, (0, dom_1.$)('.icon-label.codicon'));
            data.left = (0, dom_1.append)(main, (0, dom_1.$)('span.left'));
            data.right = (0, dom_1.append)(main, (0, dom_1.$)('span.right'));
            data.iconLabel = new iconLabel_1.IconLabel(data.left, { supportHighlights: true, supportIcons: true });
            data.disposables.add(data.iconLabel);
            data.parametersLabel = (0, dom_1.append)(data.left, (0, dom_1.$)('span.signature-label'));
            data.qualifierLabel = (0, dom_1.append)(data.left, (0, dom_1.$)('span.qualifier-label'));
            data.detailsLabel = (0, dom_1.append)(data.right, (0, dom_1.$)('span.details-label'));
            data.readMore = (0, dom_1.append)(data.right, (0, dom_1.$)('span.readMore' + themeService_1.ThemeIcon.asCSSSelector(exports.suggestMoreInfoIcon)));
            data.readMore.title = nls.localize(1, null);
            const configureFont = () => {
                const options = this._editor.getOptions();
                const fontInfo = options.get(40 /* fontInfo */);
                const fontFamily = fontInfo.fontFamily;
                const fontFeatureSettings = fontInfo.fontFeatureSettings;
                const fontSize = options.get(104 /* suggestFontSize */) || fontInfo.fontSize;
                const lineHeight = options.get(105 /* suggestLineHeight */) || fontInfo.lineHeight;
                const fontWeight = fontInfo.fontWeight;
                const fontSizePx = `${fontSize}px`;
                const lineHeightPx = `${lineHeight}px`;
                data.root.style.fontSize = fontSizePx;
                data.root.style.fontWeight = fontWeight;
                main.style.fontFamily = fontFamily;
                main.style.fontFeatureSettings = fontFeatureSettings;
                main.style.lineHeight = lineHeightPx;
                data.icon.style.height = lineHeightPx;
                data.icon.style.width = lineHeightPx;
                data.readMore.style.height = lineHeightPx;
                data.readMore.style.width = lineHeightPx;
            };
            configureFont();
            data.disposables.add(this._editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(40 /* fontInfo */) || e.hasChanged(104 /* suggestFontSize */) || e.hasChanged(105 /* suggestLineHeight */)) {
                    configureFont();
                }
            }));
            return data;
        }
        renderElement(element, index, data) {
            var _b, _c, _d;
            const { completion } = element;
            data.root.id = getAriaId(index);
            data.colorspan.style.backgroundColor = '';
            const labelOptions = {
                labelEscapeNewLines: true,
                matches: (0, filters_1.createMatches)(element.score)
            };
            let color = [];
            if (completion.kind === 19 /* Color */ && _completionItemColor.extract(element, color)) {
                // special logic for 'color' completion items
                data.icon.className = 'icon customcolor';
                data.iconContainer.className = 'icon hide';
                data.colorspan.style.backgroundColor = color[0];
            }
            else if (completion.kind === 20 /* File */ && this._themeService.getFileIconTheme().hasFileIcons) {
                // special logic for 'file' completion items
                data.icon.className = 'icon hide';
                data.iconContainer.className = 'icon hide';
                const labelClasses = (0, getIconClasses_1.getIconClasses)(this._modelService, this._modeService, uri_1.URI.from({ scheme: 'fake', path: element.textLabel }), files_1.FileKind.FILE);
                const detailClasses = (0, getIconClasses_1.getIconClasses)(this._modelService, this._modeService, uri_1.URI.from({ scheme: 'fake', path: completion.detail }), files_1.FileKind.FILE);
                labelOptions.extraClasses = labelClasses.length > detailClasses.length ? labelClasses : detailClasses;
            }
            else if (completion.kind === 23 /* Folder */ && this._themeService.getFileIconTheme().hasFolderIcons) {
                // special logic for 'folder' completion items
                data.icon.className = 'icon hide';
                data.iconContainer.className = 'icon hide';
                labelOptions.extraClasses = (0, arrays_1.flatten)([
                    (0, getIconClasses_1.getIconClasses)(this._modelService, this._modeService, uri_1.URI.from({ scheme: 'fake', path: element.textLabel }), files_1.FileKind.FOLDER),
                    (0, getIconClasses_1.getIconClasses)(this._modelService, this._modeService, uri_1.URI.from({ scheme: 'fake', path: completion.detail }), files_1.FileKind.FOLDER)
                ]);
            }
            else {
                // normal icon
                data.icon.className = 'icon hide';
                data.iconContainer.className = '';
                data.iconContainer.classList.add('suggest-icon', ...(0, modes_1.completionKindToCssClass)(completion.kind).split(' '));
            }
            if (completion.tags && completion.tags.indexOf(1 /* Deprecated */) >= 0) {
                labelOptions.extraClasses = (labelOptions.extraClasses || []).concat(['deprecated']);
                labelOptions.matches = [];
            }
            data.iconLabel.setLabel(element.textLabel, undefined, labelOptions);
            if (typeof completion.label === 'string') {
                data.parametersLabel.textContent = '';
                data.qualifierLabel.textContent = '';
                data.detailsLabel.textContent = (completion.detail || '').replace(/\n.*$/m, '');
                data.root.classList.add('string-label');
                data.root.title = '';
            }
            else {
                data.parametersLabel.textContent = (completion.label.parameters || '').replace(/\n.*$/m, '');
                data.qualifierLabel.textContent = (completion.label.qualifier || '').replace(/\n.*$/m, '');
                data.detailsLabel.textContent = (completion.label.type || '').replace(/\n.*$/m, '');
                data.root.classList.remove('string-label');
                data.root.title = `${element.textLabel}${(_b = completion.label.parameters) !== null && _b !== void 0 ? _b : ''}  ${(_c = completion.label.qualifier) !== null && _c !== void 0 ? _c : ''}  ${(_d = completion.label.type) !== null && _d !== void 0 ? _d : ''}`;
            }
            if (this._editor.getOption(103 /* suggest */).showInlineDetails) {
                (0, dom_1.show)(data.detailsLabel);
            }
            else {
                (0, dom_1.hide)(data.detailsLabel);
            }
            if ((0, suggestWidgetDetails_1.canExpandCompletionItem)(element)) {
                data.right.classList.add('can-expand-details');
                (0, dom_1.show)(data.readMore);
                data.readMore.onmousedown = e => {
                    e.stopPropagation();
                    e.preventDefault();
                };
                data.readMore.onclick = e => {
                    e.stopPropagation();
                    e.preventDefault();
                    this._onDidToggleDetails.fire();
                };
            }
            else {
                data.right.classList.remove('can-expand-details');
                (0, dom_1.hide)(data.readMore);
                data.readMore.onmousedown = null;
                data.readMore.onclick = null;
            }
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    };
    ItemRenderer = __decorate([
        __param(1, modelService_1.IModelService),
        __param(2, modeService_1.IModeService),
        __param(3, themeService_1.IThemeService)
    ], ItemRenderer);
    exports.ItemRenderer = ItemRenderer;
});
//# sourceMappingURL=suggestWidgetRenderer.js.map