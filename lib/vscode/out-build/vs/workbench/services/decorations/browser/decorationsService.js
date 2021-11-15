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
define(["require", "exports", "vs/base/common/event", "./decorations", "vs/base/common/map", "vs/base/common/lifecycle", "vs/base/common/async", "vs/base/common/linkedList", "vs/base/browser/dom", "vs/platform/theme/common/themeService", "vs/base/common/strings", "vs/nls!vs/workbench/services/decorations/browser/decorationsService", "vs/base/common/errors", "vs/base/common/cancellation", "vs/platform/instantiation/common/extensions", "vs/base/common/hash", "vs/workbench/services/uriIdentity/common/uriIdentity", "vs/base/common/codicons"], function (require, exports, event_1, decorations_1, map_1, lifecycle_1, async_1, linkedList_1, dom_1, themeService_1, strings_1, nls_1, errors_1, cancellation_1, extensions_1, hash_1, uriIdentity_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DecorationsService = void 0;
    class DecorationRule {
        constructor(data, key) {
            this._refCounter = 0;
            this.data = data;
            const suffix = (0, hash_1.hash)(key).toString(36);
            this.itemColorClassName = `${DecorationRule._classNamesPrefix}-itemColor-${suffix}`;
            this.itemBadgeClassName = `${DecorationRule._classNamesPrefix}-itemBadge-${suffix}`;
            this.bubbleBadgeClassName = `${DecorationRule._classNamesPrefix}-bubbleBadge-${suffix}`;
            this.iconBadgeClassName = `${DecorationRule._classNamesPrefix}-iconBadge-${suffix}`;
        }
        static keyOf(data) {
            if (Array.isArray(data)) {
                return data.map(DecorationRule.keyOf).join(',');
            }
            else {
                const { color, letter } = data;
                if (themeService_1.ThemeIcon.isThemeIcon(letter)) {
                    return `${color}+${letter.id}`;
                }
                else {
                    return `${color}/${letter}`;
                }
            }
        }
        acquire() {
            this._refCounter += 1;
        }
        release() {
            return --this._refCounter === 0;
        }
        appendCSSRules(element, theme) {
            if (!Array.isArray(this.data)) {
                this._appendForOne(this.data, element, theme);
            }
            else {
                this._appendForMany(this.data, element, theme);
            }
        }
        _appendForOne(data, element, theme) {
            const { color, letter } = data;
            // label
            (0, dom_1.createCSSRule)(`.${this.itemColorClassName}`, `color: ${getColor(theme, color)};`, element);
            // icon
            if (themeService_1.ThemeIcon.isThemeIcon(letter)) {
                this._createIconCSSRule(letter, color, element, theme);
            }
            // letter
            else if (letter) {
                (0, dom_1.createCSSRule)(`.${this.itemBadgeClassName}::after`, `content: "${letter}"; color: ${getColor(theme, color)};`, element);
            }
        }
        _appendForMany(data, element, theme) {
            var _a;
            // label
            const { color } = data[0];
            (0, dom_1.createCSSRule)(`.${this.itemColorClassName}`, `color: ${getColor(theme, color)};`, element);
            // icon (only show first)
            const icon = (_a = data.find(d => themeService_1.ThemeIcon.isThemeIcon(d.letter))) === null || _a === void 0 ? void 0 : _a.letter;
            if (icon) {
                this._createIconCSSRule(icon, color, element, theme);
            }
            else {
                // badge
                const letters = data.filter(d => !(0, strings_1.isFalsyOrWhitespace)(d.letter)).map(d => d.letter);
                if (letters.length) {
                    (0, dom_1.createCSSRule)(`.${this.itemBadgeClassName}::after`, `content: "${letters.join(', ')}"; color: ${getColor(theme, color)};`, element);
                }
                // bubble badge
                // TODO @misolori update bubble badge to adopt letter: ThemeIcon instead of unicode
                (0, dom_1.createCSSRule)(`.${this.bubbleBadgeClassName}::after`, `content: "\uea71"; color: ${getColor(theme, color)}; font-family: codicon; font-size: 14px; padding-right: 14px; opacity: 0.4;`, element);
            }
        }
        _createIconCSSRule(icon, color, element, theme) {
            const codicon = codicons_1.iconRegistry.get(icon.id);
            if (!codicon || !('fontCharacter' in codicon.definition)) {
                return;
            }
            const charCode = parseInt(codicon.definition.fontCharacter.substr(1), 16);
            (0, dom_1.createCSSRule)(`.${this.iconBadgeClassName}::after`, `content: "${String.fromCharCode(charCode)}"; color: ${getColor(theme, color)}; font-family: codicon; font-size: 16px; padding-right: 14px; font-weight: normal`, element);
        }
        removeCSSRules(element) {
            (0, dom_1.removeCSSRulesContainingSelector)(this.itemColorClassName, element);
            (0, dom_1.removeCSSRulesContainingSelector)(this.itemBadgeClassName, element);
            (0, dom_1.removeCSSRulesContainingSelector)(this.bubbleBadgeClassName, element);
            (0, dom_1.removeCSSRulesContainingSelector)(this.iconBadgeClassName, element);
        }
    }
    DecorationRule._classNamesPrefix = 'monaco-decoration';
    class DecorationStyles {
        constructor(_themeService) {
            this._themeService = _themeService;
            this._styleElement = (0, dom_1.createStyleSheet)();
            this._decorationRules = new Map();
            this._dispoables = new lifecycle_1.DisposableStore();
            this._themeService.onDidColorThemeChange(this._onThemeChange, this, this._dispoables);
        }
        dispose() {
            this._dispoables.dispose();
            this._styleElement.remove();
        }
        asDecoration(data, onlyChildren) {
            // sort by weight
            data.sort((a, b) => (b.weight || 0) - (a.weight || 0));
            let key = DecorationRule.keyOf(data);
            let rule = this._decorationRules.get(key);
            if (!rule) {
                // new css rule
                rule = new DecorationRule(data, key);
                this._decorationRules.set(key, rule);
                rule.appendCSSRules(this._styleElement, this._themeService.getColorTheme());
            }
            rule.acquire();
            let labelClassName = rule.itemColorClassName;
            let badgeClassName = rule.itemBadgeClassName;
            let iconClassName = rule.iconBadgeClassName;
            let tooltip = data.filter(d => !(0, strings_1.isFalsyOrWhitespace)(d.tooltip)).map(d => d.tooltip).join(' • ');
            if (onlyChildren) {
                // show items from its children only
                badgeClassName = rule.bubbleBadgeClassName;
                tooltip = (0, nls_1.localize)(0, null);
            }
            return {
                labelClassName,
                badgeClassName,
                iconClassName,
                tooltip,
                dispose: () => {
                    if (rule === null || rule === void 0 ? void 0 : rule.release()) {
                        this._decorationRules.delete(key);
                        rule.removeCSSRules(this._styleElement);
                        rule = undefined;
                    }
                }
            };
        }
        _onThemeChange() {
            this._decorationRules.forEach(rule => {
                rule.removeCSSRules(this._styleElement);
                rule.appendCSSRules(this._styleElement, this._themeService.getColorTheme());
            });
        }
    }
    class FileDecorationChangeEvent {
        constructor() {
            this._data = map_1.TernarySearchTree.forUris(_uri => true); // events ignore all path casings
        }
        affectsResource(uri) {
            var _a;
            return (_a = this._data.get(uri)) !== null && _a !== void 0 ? _a : this._data.findSuperstr(uri) !== undefined;
        }
        static debouncer(last, current) {
            if (!last) {
                last = new FileDecorationChangeEvent();
            }
            if (Array.isArray(current)) {
                // many
                for (const uri of current) {
                    last._data.set(uri, true);
                }
            }
            else {
                // one
                last._data.set(current, true);
            }
            return last;
        }
    }
    class DecorationDataRequest {
        constructor(source, thenable) {
            this.source = source;
            this.thenable = thenable;
        }
    }
    class DecorationProviderWrapper {
        constructor(provider, uriIdentityService, _uriEmitter, _flushEmitter) {
            this.provider = provider;
            this._uriEmitter = _uriEmitter;
            this._flushEmitter = _flushEmitter;
            this.data = map_1.TernarySearchTree.forUris(uri => uriIdentityService.extUri.ignorePathCasing(uri));
            this._dispoable = this.provider.onDidChange(uris => {
                if (!uris) {
                    // flush event -> drop all data, can affect everything
                    this.data.clear();
                    this._flushEmitter.fire({ affectsResource() { return true; } });
                }
                else {
                    // selective changes -> drop for resource, fetch again, send event
                    // perf: the map stores thenables, decorations, or `null`-markers.
                    // we make us of that and ignore all uris in which we have never
                    // been interested.
                    for (const uri of uris) {
                        this._fetchData(uri);
                    }
                }
            });
        }
        dispose() {
            this._dispoable.dispose();
            this.data.clear();
        }
        knowsAbout(uri) {
            return this.data.has(uri) || Boolean(this.data.findSuperstr(uri));
        }
        getOrRetrieve(uri, includeChildren, callback) {
            let item = this.data.get(uri);
            if (item === undefined) {
                // unknown -> trigger request
                item = this._fetchData(uri);
            }
            if (item && !(item instanceof DecorationDataRequest)) {
                // found something (which isn't pending anymore)
                callback(item, false);
            }
            if (includeChildren) {
                // (resolved) children
                const iter = this.data.findSuperstr(uri);
                if (iter) {
                    for (const [, value] of iter) {
                        if (value && !(value instanceof DecorationDataRequest)) {
                            callback(value, true);
                        }
                    }
                }
            }
        }
        _fetchData(uri) {
            // check for pending request and cancel it
            const pendingRequest = this.data.get(uri);
            if (pendingRequest instanceof DecorationDataRequest) {
                pendingRequest.source.cancel();
                this.data.delete(uri);
            }
            const source = new cancellation_1.CancellationTokenSource();
            const dataOrThenable = this.provider.provideDecorations(uri, source.token);
            if (!(0, async_1.isThenable)(dataOrThenable)) {
                // sync -> we have a result now
                return this._keepItem(uri, dataOrThenable);
            }
            else {
                // async -> we have a result soon
                const request = new DecorationDataRequest(source, Promise.resolve(dataOrThenable).then(data => {
                    if (this.data.get(uri) === request) {
                        this._keepItem(uri, data);
                    }
                }).catch(err => {
                    if (!(0, errors_1.isPromiseCanceledError)(err) && this.data.get(uri) === request) {
                        this.data.delete(uri);
                    }
                }));
                this.data.set(uri, request);
                return null;
            }
        }
        _keepItem(uri, data) {
            const deco = data ? data : null;
            const old = this.data.set(uri, deco);
            if (deco || old) {
                // only fire event when something changed
                this._uriEmitter.fire(uri);
            }
            return deco;
        }
    }
    let DecorationsService = class DecorationsService {
        constructor(themeService, _uriIdentityService) {
            this._uriIdentityService = _uriIdentityService;
            this._data = new linkedList_1.LinkedList();
            this._onDidChangeDecorationsDelayed = new event_1.Emitter();
            this._onDidChangeDecorations = new event_1.Emitter();
            this.onDidChangeDecorations = event_1.Event.any(this._onDidChangeDecorations.event, event_1.Event.debounce(this._onDidChangeDecorationsDelayed.event, FileDecorationChangeEvent.debouncer, undefined, undefined, 500));
            this._decorationStyles = new DecorationStyles(themeService);
        }
        dispose() {
            this._decorationStyles.dispose();
            this._onDidChangeDecorations.dispose();
            this._onDidChangeDecorationsDelayed.dispose();
        }
        registerDecorationsProvider(provider) {
            const wrapper = new DecorationProviderWrapper(provider, this._uriIdentityService, this._onDidChangeDecorationsDelayed, this._onDidChangeDecorations);
            const remove = this._data.push(wrapper);
            this._onDidChangeDecorations.fire({
                // everything might have changed
                affectsResource() { return true; }
            });
            return (0, lifecycle_1.toDisposable)(() => {
                // fire event that says 'yes' for any resource
                // known to this provider. then dispose and remove it.
                remove();
                this._onDidChangeDecorations.fire({ affectsResource: uri => wrapper.knowsAbout(uri) });
                wrapper.dispose();
            });
        }
        getDecoration(uri, includeChildren) {
            let data = [];
            let containsChildren = false;
            for (let wrapper of this._data) {
                wrapper.getOrRetrieve(uri, includeChildren, (deco, isChild) => {
                    if (!isChild || deco.bubble) {
                        data.push(deco);
                        containsChildren = isChild || containsChildren;
                    }
                });
            }
            return data.length === 0
                ? undefined
                : this._decorationStyles.asDecoration(data, containsChildren);
        }
    };
    DecorationsService = __decorate([
        __param(0, themeService_1.IThemeService),
        __param(1, uriIdentity_1.IUriIdentityService)
    ], DecorationsService);
    exports.DecorationsService = DecorationsService;
    function getColor(theme, color) {
        if (color) {
            const foundColor = theme.getColor(color);
            if (foundColor) {
                return foundColor;
            }
        }
        return 'inherit';
    }
    (0, extensions_1.registerSingleton)(decorations_1.IDecorationsService, DecorationsService, true);
});
//# sourceMappingURL=decorationsService.js.map