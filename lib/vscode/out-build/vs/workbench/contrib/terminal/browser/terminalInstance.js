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
define(["require", "exports", "vs/base/common/path", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/common/config/commonEditorConfig", "vs/nls!vs/workbench/contrib/terminal/browser/terminalInstance", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/platform/storage/common/storage", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/common/theme", "vs/workbench/contrib/terminal/browser/widgets/widgetManager", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/contrib/terminal/browser/links/terminalLinkManager", "vs/platform/accessibility/common/accessibility", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalProcessManager", "vs/workbench/contrib/terminal/browser/addons/commandTrackerAddon", "vs/workbench/contrib/terminal/browser/addons/navigationModeAddon", "vs/workbench/common/views", "vs/workbench/contrib/terminal/browser/widgets/environmentVariableInfoWidget", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalTypeAheadAddon", "vs/base/browser/canIUse", "vs/workbench/services/preferences/common/preferences", "vs/platform/product/common/productService", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/base/common/async", "vs/base/common/codicons", "vs/workbench/contrib/terminal/browser/terminalStatusList", "vs/platform/quickinput/common/quickInput", "vs/workbench/services/environment/common/environmentService", "vs/base/common/platform", "vs/base/common/uri", "vs/base/common/network"], function (require, exports, path, dom, keyboardEvent_1, decorators_1, event_1, lifecycle_1, commonEditorConfig_1, nls, clipboardService_1, configuration_1, contextkey_1, instantiation_1, keybinding_1, log_1, notification_1, storage_1, colorRegistry_1, themeService_1, theme_1, widgetManager_1, terminal_1, terminalColorRegistry_1, terminalLinkManager_1, accessibility_1, terminal_2, terminalProcessManager_1, commandTrackerAddon_1, navigationModeAddon_1, views_1, environmentVariableInfoWidget_1, terminalActions_1, terminalTypeAheadAddon_1, canIUse_1, preferences_1, productService_1, terminalStrings_1, async_1, codicons_1, terminalStatusList_1, quickInput_1, environmentService_1, platform_1, uri_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalInstance = void 0;
    // How long in milliseconds should an average frame take to render for a notification to appear
    // which suggests the fallback DOM-based renderer
    const SLOW_CANVAS_RENDER_THRESHOLD = 50;
    const NUMBER_OF_FRAMES_TO_MEASURE = 20;
    var Constants;
    (function (Constants) {
        /**
         * The maximum amount of milliseconds to wait for a container before starting to create the
         * terminal process. This period helps ensure the terminal has good initial dimensions to work
         * with if it's going to be a foreground terminal.
         */
        Constants[Constants["WaitForContainerThreshold"] = 100] = "WaitForContainerThreshold";
    })(Constants || (Constants = {}));
    let xtermConstructor;
    let TerminalInstance = class TerminalInstance extends lifecycle_1.Disposable {
        constructor(_terminalFocusContextKey, _terminalShellTypeContextKey, _terminalAltBufferActiveContextKey, _configHelper, _container, _shellLaunchConfig, _terminalInstanceService, _terminalProfileResolverService, _contextKeyService, _keybindingService, _notificationService, _preferencesService, _viewsService, _instantiationService, _clipboardService, _themeService, _configurationService, _logService, _storageService, _accessibilityService, _viewDescriptorService, _productService, _quickInputService, workbenchEnvironmentService) {
            super();
            this._terminalFocusContextKey = _terminalFocusContextKey;
            this._terminalShellTypeContextKey = _terminalShellTypeContextKey;
            this._terminalAltBufferActiveContextKey = _terminalAltBufferActiveContextKey;
            this._configHelper = _configHelper;
            this._container = _container;
            this._shellLaunchConfig = _shellLaunchConfig;
            this._terminalInstanceService = _terminalInstanceService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._contextKeyService = _contextKeyService;
            this._keybindingService = _keybindingService;
            this._notificationService = _notificationService;
            this._preferencesService = _preferencesService;
            this._viewsService = _viewsService;
            this._instantiationService = _instantiationService;
            this._clipboardService = _clipboardService;
            this._themeService = _themeService;
            this._configurationService = _configurationService;
            this._logService = _logService;
            this._storageService = _storageService;
            this._accessibilityService = _accessibilityService;
            this._viewDescriptorService = _viewDescriptorService;
            this._productService = _productService;
            this._quickInputService = _quickInputService;
            this._latestXtermWriteData = 0;
            this._latestXtermParseData = 0;
            this._title = '';
            this._cols = 0;
            this._rows = 0;
            this._areLinksReady = false;
            this._initialDataEvents = [];
            this._widgetManager = this._instantiationService.createInstance(widgetManager_1.TerminalWidgetManager);
            this.statusList = new terminalStatusList_1.TerminalStatusList();
            this._onExit = new event_1.Emitter();
            this._onDisposed = new event_1.Emitter();
            this._onFocused = new event_1.Emitter();
            this._onProcessIdReady = new event_1.Emitter();
            this._onLinksReady = new event_1.Emitter();
            this._onTitleChanged = new event_1.Emitter();
            this._onData = new event_1.Emitter();
            this._onBinary = new event_1.Emitter();
            this._onLineData = new event_1.Emitter();
            this._onRequestExtHostProcess = new event_1.Emitter();
            this._onDimensionsChanged = new event_1.Emitter();
            this._onMaximumDimensionsChanged = new event_1.Emitter();
            this._onFocus = new event_1.Emitter();
            this._skipTerminalCommands = [];
            this._isExiting = false;
            this._hadFocusOnExit = false;
            this._isVisible = false;
            this._isDisposed = false;
            this._instanceId = TerminalInstance._instanceIdCounter++;
            this.hasHadInput = false;
            this._titleReadyPromise = new Promise(c => {
                this._titleReadyComplete = c;
            });
            this._terminalHasTextContextKey = terminal_1.KEYBINDING_CONTEXT_TERMINAL_TEXT_SELECTED.bindTo(this._contextKeyService);
            this._terminalA11yTreeFocusContextKey = terminal_1.KEYBINDING_CONTEXT_TERMINAL_A11Y_TREE_FOCUS.bindTo(this._contextKeyService);
            this._terminalAltBufferActiveContextKey = terminal_1.KEYBINDING_CONTEXT_TERMINAL_ALT_BUFFER_ACTIVE.bindTo(this._contextKeyService);
            this.disableLayout = false;
            this._logService.trace(`terminalInstance#ctor (instanceId: ${this.instanceId})`, this._shellLaunchConfig);
            // Resolve just the icon ahead of time so that it shows up immediately in the tabs. This is
            // disabled in remote because this needs to be sync and the OS may differ on the remote
            // which would result in the wrong profile being selected and the wrong icon being
            // permanently attached to the terminal.
            if (!this.shellLaunchConfig.executable && !workbenchEnvironmentService.remoteAuthority) {
                this._terminalProfileResolverService.resolveIcon(this._shellLaunchConfig, platform_1.OS);
            }
            this._initDimensions();
            this._createProcessManager();
            this._containerReadyBarrier = new async_1.AutoOpenBarrier(100 /* WaitForContainerThreshold */);
            this._xtermReadyPromise = this._createXterm();
            this._xtermReadyPromise.then(async () => {
                // Wait for a period to allow a container to be ready
                await this._containerReadyBarrier.wait();
                // Only attach xterm.js to the DOM if the terminal panel has been opened before.
                if (_container) {
                    this._attachToElement(_container);
                }
                this._createProcess();
            });
            this.addDisposable(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('terminal.integrated') || e.affectsConfiguration('editor.fastScrollSensitivity') || e.affectsConfiguration('editor.mouseWheelScrollSensitivity') || e.affectsConfiguration('editor.multiCursorModifier')) {
                    this.updateConfig();
                    // HACK: Trigger another async layout to ensure xterm's CharMeasure is ready to use,
                    // this hack can be removed when https://github.com/xtermjs/xterm.js/issues/702 is
                    // supported.
                    this.setVisible(this._isVisible);
                }
                if (e.affectsConfiguration('terminal.integrated.unicodeVersion')) {
                    this._updateUnicodeVersion();
                }
                if (e.affectsConfiguration('editor.accessibilitySupport')) {
                    this.updateAccessibilitySupport();
                }
                if (e.affectsConfiguration('terminal.integrated.gpuAcceleration')) {
                    this._storageService.remove(terminal_1.SUGGESTED_RENDERER_TYPE, 0 /* GLOBAL */);
                }
            }));
            // Clear out initial data events after 10 seconds, hopefully extension hosts are up and
            // running at that point.
            let initialDataEventsTimeout = window.setTimeout(() => {
                initialDataEventsTimeout = undefined;
                this._initialDataEvents = undefined;
            }, 10000);
            this._register({
                dispose: () => {
                    if (initialDataEventsTimeout) {
                        window.clearTimeout(initialDataEventsTimeout);
                    }
                }
            });
        }
        get instanceId() { return this._instanceId; }
        get resource() {
            return uri_1.URI.from({
                scheme: network_1.Schemas.vscodeTerminal,
                path: this.title,
                fragment: this.instanceId.toString(),
            });
        }
        get cols() {
            if (this._dimensionsOverride && this._dimensionsOverride.cols) {
                if (this._dimensionsOverride.forceExactSize) {
                    return this._dimensionsOverride.cols;
                }
                return Math.min(Math.max(this._dimensionsOverride.cols, 2), this._cols);
            }
            return this._cols;
        }
        get rows() {
            if (this._dimensionsOverride && this._dimensionsOverride.rows) {
                if (this._dimensionsOverride.forceExactSize) {
                    return this._dimensionsOverride.rows;
                }
                return Math.min(Math.max(this._dimensionsOverride.rows, 2), this._rows);
            }
            return this._rows;
        }
        get maxCols() { return this._cols; }
        get maxRows() { return this._rows; }
        // TODO: Ideally processId would be merged into processReady
        get processId() { return this._processManager.shellProcessId; }
        // TODO: How does this work with detached processes?
        // TODO: Should this be an event as it can fire twice?
        get processReady() { return this._processManager.ptyProcessReady; }
        get areLinksReady() { return this._areLinksReady; }
        get initialDataEvents() { return this._initialDataEvents; }
        get exitCode() { return this._exitCode; }
        get title() { return this._title; }
        get hadFocusOnExit() { return this._hadFocusOnExit; }
        get isTitleSetByProcess() { return !!this._messageTitleDisposable; }
        get shellLaunchConfig() { return this._shellLaunchConfig; }
        get shellType() { return this._shellType; }
        get commandTracker() { return this._commandTrackerAddon; }
        get navigationMode() { return this._navigationModeAddon; }
        get isDisconnected() { return this._processManager.isDisconnected; }
        get icon() { return this._getIcon(); }
        get onExit() { return this._onExit.event; }
        get onDisposed() { return this._onDisposed.event; }
        get onFocused() { return this._onFocused.event; }
        get onProcessIdReady() { return this._onProcessIdReady.event; }
        get onLinksReady() { return this._onLinksReady.event; }
        get onTitleChanged() { return this._onTitleChanged.event; }
        get onData() { return this._onData.event; }
        get onBinary() { return this._onBinary.event; }
        get onLineData() { return this._onLineData.event; }
        get onRequestExtHostProcess() { return this._onRequestExtHostProcess.event; }
        get onDimensionsChanged() { return this._onDimensionsChanged.event; }
        get onMaximumDimensionsChanged() { return this._onMaximumDimensionsChanged.event; }
        get onFocus() { return this._onFocus.event; }
        _getIcon() {
            var _a, _b;
            if (this.shellLaunchConfig.icon) {
                return codicons_1.iconRegistry.get(this.shellLaunchConfig.icon);
            }
            else if ((_b = (_a = this.shellLaunchConfig) === null || _a === void 0 ? void 0 : _a.attachPersistentProcess) === null || _b === void 0 ? void 0 : _b.icon) {
                return codicons_1.iconRegistry.get(this.shellLaunchConfig.attachPersistentProcess.icon);
            }
            return undefined;
        }
        addDisposable(disposable) {
            this._register(disposable);
        }
        _initDimensions() {
            // The terminal panel needs to have been created
            if (!this._container) {
                return;
            }
            const computedStyle = window.getComputedStyle(this._container.parentElement);
            const width = parseInt(computedStyle.getPropertyValue('width').replace('px', ''), 10);
            const height = parseInt(computedStyle.getPropertyValue('height').replace('px', ''), 10);
            this._evaluateColsAndRows(width, height);
        }
        /**
         * Evaluates and sets the cols and rows of the terminal if possible.
         * @param width The width of the container.
         * @param height The height of the container.
         * @return The terminal's width if it requires a layout.
         */
        _evaluateColsAndRows(width, height) {
            // Ignore if dimensions are undefined or 0
            if (!width || !height) {
                this._setLastKnownColsAndRows();
                return null;
            }
            const dimension = this._getDimension(width, height);
            if (!dimension) {
                this._setLastKnownColsAndRows();
                return null;
            }
            const font = this._configHelper.getFont(this._xtermCore);
            if (!font.charWidth || !font.charHeight) {
                this._setLastKnownColsAndRows();
                return null;
            }
            // Because xterm.js converts from CSS pixels to actual pixels through
            // the use of canvas, window.devicePixelRatio needs to be used here in
            // order to be precise. font.charWidth/charHeight alone as insufficient
            // when window.devicePixelRatio changes.
            const scaledWidthAvailable = dimension.width * window.devicePixelRatio;
            const scaledCharWidth = font.charWidth * window.devicePixelRatio + font.letterSpacing;
            const newCols = Math.max(Math.floor(scaledWidthAvailable / scaledCharWidth), 1);
            const scaledHeightAvailable = dimension.height * window.devicePixelRatio;
            const scaledCharHeight = Math.ceil(font.charHeight * window.devicePixelRatio);
            const scaledLineHeight = Math.floor(scaledCharHeight * font.lineHeight);
            const newRows = Math.max(Math.floor(scaledHeightAvailable / scaledLineHeight), 1);
            if (this._cols !== newCols || this._rows !== newRows) {
                this._cols = newCols;
                this._rows = newRows;
                this._fireMaximumDimensionsChanged();
            }
            return dimension.width;
        }
        _setLastKnownColsAndRows() {
            if (TerminalInstance._lastKnownGridDimensions) {
                this._cols = TerminalInstance._lastKnownGridDimensions.cols;
                this._rows = TerminalInstance._lastKnownGridDimensions.rows;
            }
        }
        _fireMaximumDimensionsChanged() {
            this._onMaximumDimensionsChanged.fire();
        }
        _getDimension(width, height) {
            // The font needs to have been initialized
            const font = this._configHelper.getFont(this._xtermCore);
            if (!font || !font.charWidth || !font.charHeight) {
                return undefined;
            }
            // The panel is minimized
            if (!this._isVisible) {
                return TerminalInstance._lastKnownCanvasDimensions;
            }
            if (!this._wrapperElement) {
                return undefined;
            }
            const wrapperElementStyle = getComputedStyle(this._wrapperElement);
            const marginLeft = parseInt(wrapperElementStyle.marginLeft.split('px')[0], 10);
            const marginRight = parseInt(wrapperElementStyle.marginRight.split('px')[0], 10);
            const bottom = parseInt(wrapperElementStyle.bottom.split('px')[0], 10);
            const innerWidth = width - marginLeft - marginRight;
            const innerHeight = height - bottom - 1;
            TerminalInstance._lastKnownCanvasDimensions = new dom.Dimension(innerWidth, innerHeight);
            return TerminalInstance._lastKnownCanvasDimensions;
        }
        get persistentProcessId() { return this._processManager.persistentProcessId; }
        get shouldPersist() { return this._processManager.shouldPersist; }
        async _getXtermConstructor() {
            if (xtermConstructor) {
                return xtermConstructor;
            }
            xtermConstructor = new Promise(async (resolve) => {
                const Terminal = await this._terminalInstanceService.getXtermConstructor();
                // Localize strings
                Terminal.strings.promptLabel = nls.localize(0, null);
                Terminal.strings.tooMuchOutput = nls.localize(1, null);
                resolve(Terminal);
            });
            return xtermConstructor;
        }
        /**
         * Create xterm.js instance and attach data listeners.
         */
        async _createXterm() {
            const Terminal = await this._getXtermConstructor();
            const font = this._configHelper.getFont(undefined, true);
            const config = this._configHelper.config;
            const editorOptions = this._configurationService.getValue('editor');
            let xtermRendererType;
            if (config.gpuAcceleration === 'auto') {
                // Set the builtin renderer to canvas, even when webgl is being used since it's an addon
                const suggestedRendererType = this._storageService.get(terminal_1.SUGGESTED_RENDERER_TYPE, 0 /* GLOBAL */);
                xtermRendererType = suggestedRendererType === 'dom' ? 'dom' : 'canvas';
            }
            else {
                xtermRendererType = config.gpuAcceleration === 'on' ? 'canvas' : 'dom';
            }
            const xterm = new Terminal({
                altClickMovesCursor: config.altClickMovesCursor && editorOptions.multiCursorModifier === 'alt',
                scrollback: config.scrollback,
                theme: this._getXtermTheme(),
                drawBoldTextInBrightColors: config.drawBoldTextInBrightColors,
                fontFamily: font.fontFamily,
                fontWeight: config.fontWeight,
                fontWeightBold: config.fontWeightBold,
                fontSize: font.fontSize,
                letterSpacing: font.letterSpacing,
                lineHeight: font.lineHeight,
                minimumContrastRatio: config.minimumContrastRatio,
                bellStyle: config.enableBell ? 'sound' : 'none',
                macOptionIsMeta: config.macOptionIsMeta,
                macOptionClickForcesSelection: config.macOptionClickForcesSelection,
                rightClickSelectsWord: config.rightClickBehavior === 'selectWord',
                fastScrollModifier: 'alt',
                fastScrollSensitivity: editorOptions.fastScrollSensitivity,
                scrollSensitivity: editorOptions.mouseWheelScrollSensitivity,
                rendererType: xtermRendererType,
                wordSeparator: config.wordSeparators
            });
            this._xterm = xterm;
            this._xtermCore = xterm._core;
            this._updateUnicodeVersion();
            this.updateAccessibilitySupport();
            this._terminalInstanceService.getXtermSearchConstructor().then(Addon => {
                this._xtermSearch = new Addon();
                xterm.loadAddon(this._xtermSearch);
            });
            if (this._shellLaunchConfig.initialText) {
                this._xterm.writeln(this._shellLaunchConfig.initialText);
            }
            // Delay the creation of the bell listener to avoid showing the bell when the terminal
            // starts up or reconnects
            setTimeout(() => {
                var _a;
                (_a = this._xterm) === null || _a === void 0 ? void 0 : _a.onBell(() => {
                    if (this._configHelper.config.enableBell) {
                        this.statusList.add({
                            id: "bell" /* Bell */,
                            severity: notification_1.Severity.Warning,
                            icon: codicons_1.Codicon.bell,
                            tooltip: nls.localize(2, null)
                        }, this._configHelper.config.bellDuration);
                    }
                });
            }, 1000);
            this._xterm.onLineFeed(() => this._onLineFeed());
            this._xterm.onKey(e => this._onKey(e.key, e.domEvent));
            this._xterm.onSelectionChange(async () => this._onSelectionChange());
            this._xterm.buffer.onBufferChange(() => this._refreshAltBufferContextKey());
            this._processManager.onProcessData(e => this._onProcessData(e));
            this._xterm.onData(data => this._processManager.write(data));
            this._xterm.onBinary(data => this._processManager.processBinary(data));
            this.processReady.then(async () => {
                if (this._linkManager) {
                    this._linkManager.processCwd = await this._processManager.getInitialCwd();
                }
            });
            // Init winpty compat and link handler after process creation as they rely on the
            // underlying process OS
            this._processManager.onProcessReady(() => {
                if (this._processManager.os === 1 /* Windows */) {
                    xterm.setOption('windowsMode', true);
                    // Force line data to be sent when the cursor is moved, the main purpose for
                    // this is because ConPTY will often not do a line feed but instead move the
                    // cursor, in which case we still want to send the current line's data to tasks.
                    xterm.parser.registerCsiHandler({ final: 'H' }, () => {
                        this._onCursorMove();
                        return false;
                    });
                }
                this._linkManager = this._instantiationService.createInstance(terminalLinkManager_1.TerminalLinkManager, xterm, this._processManager);
                this._areLinksReady = true;
                this._onLinksReady.fire(this);
            });
            this._commandTrackerAddon = new commandTrackerAddon_1.CommandTrackerAddon();
            this._xterm.loadAddon(this._commandTrackerAddon);
            this._register(this._themeService.onDidColorThemeChange(theme => this._updateTheme(xterm, theme)));
            this._register(this._viewDescriptorService.onDidChangeLocation(({ views }) => {
                if (views.some(v => v.id === terminal_1.TERMINAL_VIEW_ID)) {
                    this._updateTheme(xterm);
                }
            }));
            this._xtermTypeAhead = this._register(this._instantiationService.createInstance(terminalTypeAheadAddon_1.TypeAheadAddon, this._processManager, this._configHelper));
            this._xterm.loadAddon(this._xtermTypeAhead);
            return xterm;
        }
        reattachToElement(container) {
            var _a;
            if (!this._wrapperElement) {
                throw new Error('The terminal instance has not been attached to a container yet');
            }
            (_a = this._wrapperElement.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(this._wrapperElement);
            this._container = container;
            this._container.appendChild(this._wrapperElement);
        }
        attachToElement(container) {
            var _a;
            // The container did not change, do nothing
            if (this._container === container) {
                return;
            }
            // Attach has not occured yet
            if (!this._wrapperElement) {
                this._attachToElement(container);
                return;
            }
            // The container changed, reattach
            (_a = this._container) === null || _a === void 0 ? void 0 : _a.removeChild(this._wrapperElement);
            this._container = container;
            this._container.appendChild(this._wrapperElement);
        }
        async _attachToElement(container) {
            const xterm = await this._xtermReadyPromise;
            if (this._wrapperElement) {
                throw new Error('The terminal instance has already been attached to a container');
            }
            this._container = container;
            this._wrapperElement = document.createElement('div');
            this._wrapperElement.classList.add('terminal-wrapper');
            this._xtermElement = document.createElement('div');
            // Attach the xterm object to the DOM, exposing it to the smoke tests
            this._wrapperElement.xterm = this._xterm;
            this._wrapperElement.appendChild(this._xtermElement);
            this._container.appendChild(this._wrapperElement);
            xterm.open(this._xtermElement);
            const suggestedRendererType = this._storageService.get(terminal_1.SUGGESTED_RENDERER_TYPE, 0 /* GLOBAL */);
            if (this._configHelper.config.gpuAcceleration === 'auto' && (suggestedRendererType === 'auto' || suggestedRendererType === undefined)
                || this._configHelper.config.gpuAcceleration === 'on') {
                this._enableWebglRenderer();
            }
            if (!xterm.element || !xterm.textarea) {
                throw new Error('xterm elements not set after open');
            }
            this._setAriaLabel(xterm, this._instanceId, this._title);
            xterm.textarea.addEventListener('focus', () => this._onFocus.fire(this));
            xterm.attachCustomKeyEventHandler((event) => {
                // Disable all input if the terminal is exiting
                if (this._isExiting) {
                    return false;
                }
                const standardKeyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(event);
                const resolveResult = this._keybindingService.softDispatch(standardKeyboardEvent, standardKeyboardEvent.target);
                // Respect chords if the allowChords setting is set and it's not Escape. Escape is
                // handled specially for Zen Mode's Escape, Escape chord, plus it's important in
                // terminals generally
                const isValidChord = (resolveResult === null || resolveResult === void 0 ? void 0 : resolveResult.enterChord) && this._configHelper.config.allowChords && event.key !== 'Escape';
                if (this._keybindingService.inChordMode || isValidChord) {
                    event.preventDefault();
                    return false;
                }
                const SHOW_TERMINAL_CONFIG_PROMPT = 'terminal.integrated.showTerminalConfigPrompt';
                const EXCLUDED_KEYS = ['RightArrow', 'LeftArrow', 'UpArrow', 'DownArrow', 'Space', 'Meta', 'Control', 'Shift', 'Alt', '', 'Delete', 'Backspace', 'Tab'];
                // only keep track of input if prompt hasn't already been shown
                if (this._storageService.getBoolean(SHOW_TERMINAL_CONFIG_PROMPT, 0 /* GLOBAL */, true) &&
                    !EXCLUDED_KEYS.includes(event.key) &&
                    !event.ctrlKey &&
                    !event.shiftKey &&
                    !event.altKey) {
                    this.hasHadInput = true;
                }
                // for keyboard events that resolve to commands described
                // within commandsToSkipShell, either alert or skip processing by xterm.js
                if (resolveResult && resolveResult.commandId && this._skipTerminalCommands.some(k => k === resolveResult.commandId) && !this._configHelper.config.sendKeybindingsToShell) {
                    // don't alert when terminal is opened or closed
                    if (this._storageService.getBoolean(SHOW_TERMINAL_CONFIG_PROMPT, 0 /* GLOBAL */, true) &&
                        this.hasHadInput &&
                        !terminal_1.TERMINAL_CREATION_COMMANDS.includes(resolveResult.commandId)) {
                        this._notificationService.prompt(notification_1.Severity.Info, nls.localize(3, null, this._productService.nameLong), [
                            {
                                label: nls.localize(4, null),
                                run: () => {
                                    this._preferencesService.openSettings(false, '@id:terminal.integrated.commandsToSkipShell,terminal.integrated.sendKeybindingsToShell,terminal.integrated.allowChords');
                                }
                            }
                        ]);
                        this._storageService.store(SHOW_TERMINAL_CONFIG_PROMPT, false, 0 /* GLOBAL */, 0 /* USER */);
                    }
                    event.preventDefault();
                    return false;
                }
                // Skip processing by xterm.js of keyboard events that match menu bar mnemonics
                if (this._configHelper.config.allowMnemonics && !platform_1.isMacintosh && event.altKey) {
                    return false;
                }
                // If tab focus mode is on, tab is not passed to the terminal
                if (commonEditorConfig_1.TabFocus.getTabFocusMode() && event.keyCode === 9) {
                    return false;
                }
                // Always have alt+F4 skip the terminal on Windows and allow it to be handled by the
                // system
                if (platform_1.isWindows && event.altKey && event.key === 'F4' && !event.ctrlKey) {
                    return false;
                }
                // Fallback to force ctrl+v to paste on browsers that do not support
                // navigator.clipboard.readText
                if (!canIUse_1.BrowserFeatures.clipboard.readText && event.key === 'v' && event.ctrlKey) {
                    return false;
                }
                return true;
            });
            this._register(dom.addDisposableListener(xterm.element, 'mousedown', () => {
                // We need to listen to the mouseup event on the document since the user may release
                // the mouse button anywhere outside of _xterm.element.
                const listener = dom.addDisposableListener(document, 'mouseup', () => {
                    // Delay with a setTimeout to allow the mouseup to propagate through the DOM
                    // before evaluating the new selection state.
                    setTimeout(() => this._refreshSelectionContextKey(), 0);
                    listener.dispose();
                });
            }));
            // xterm.js currently drops selection on keyup as we need to handle this case.
            this._register(dom.addDisposableListener(xterm.element, 'keyup', () => {
                // Wait until keyup has propagated through the DOM before evaluating
                // the new selection state.
                setTimeout(() => this._refreshSelectionContextKey(), 0);
            }));
            this._register(dom.addDisposableListener(xterm.textarea, 'focus', () => {
                this._terminalFocusContextKey.set(true);
                if (this.shellType) {
                    this._terminalShellTypeContextKey.set(this.shellType.toString());
                }
                else {
                    this._terminalShellTypeContextKey.reset();
                }
                this._onFocused.fire(this);
            }));
            this._register(dom.addDisposableListener(xterm.textarea, 'blur', () => {
                this._terminalFocusContextKey.reset();
                this._refreshSelectionContextKey();
            }));
            this._widgetManager.attachToElement(xterm.element);
            this._processManager.onProcessReady(() => { var _a; return (_a = this._linkManager) === null || _a === void 0 ? void 0 : _a.setWidgetManager(this._widgetManager); });
            const computedStyle = window.getComputedStyle(this._container);
            const width = parseInt(computedStyle.getPropertyValue('width').replace('px', ''), 10);
            const height = parseInt(computedStyle.getPropertyValue('height').replace('px', ''), 10);
            this.layout(new dom.Dimension(width, height));
            this.setVisible(this._isVisible);
            this.updateConfig();
            // If IShellLaunchConfig.waitOnExit was true and the process finished before the terminal
            // panel was initialized.
            if (xterm.getOption('disableStdin')) {
                this._attachPressAnyKeyToCloseListener(xterm);
            }
        }
        async _measureRenderTime() {
            await this._xtermReadyPromise;
            const frameTimes = [];
            const textRenderLayer = this._xtermCore._renderService._renderer._renderLayers[0];
            const originalOnGridChanged = textRenderLayer.onGridChanged;
            const evaluateCanvasRenderer = () => {
                // Discard first frame time as it's normal to take longer
                frameTimes.shift();
                const medianTime = frameTimes.sort((a, b) => a - b)[Math.floor(frameTimes.length / 2)];
                if (medianTime > SLOW_CANVAS_RENDER_THRESHOLD) {
                    if (this._configHelper.config.gpuAcceleration === 'auto') {
                        this._storageService.store(terminal_1.SUGGESTED_RENDERER_TYPE, 'dom', 0 /* GLOBAL */, 1 /* MACHINE */);
                        this.updateConfig();
                    }
                    else {
                        const promptChoices = [
                            {
                                label: nls.localize(5, null),
                                run: () => this._configurationService.updateValue('terminal.integrated.gpuAcceleration', 'off', 1 /* USER */)
                            },
                            {
                                label: nls.localize(6, null),
                                run: () => { }
                            },
                            {
                                label: nls.localize(7, null),
                                isSecondary: true,
                                run: () => this._storageService.store(terminal_1.NEVER_MEASURE_RENDER_TIME_STORAGE_KEY, true, 0 /* GLOBAL */, 1 /* MACHINE */)
                            }
                        ];
                        this._notificationService.prompt(notification_1.Severity.Warning, nls.localize(8, null), promptChoices);
                    }
                }
            };
            textRenderLayer.onGridChanged = (terminal, firstRow, lastRow) => {
                const startTime = performance.now();
                originalOnGridChanged.call(textRenderLayer, terminal, firstRow, lastRow);
                frameTimes.push(performance.now() - startTime);
                if (frameTimes.length === NUMBER_OF_FRAMES_TO_MEASURE) {
                    evaluateCanvasRenderer();
                    // Restore original function
                    textRenderLayer.onGridChanged = originalOnGridChanged;
                }
            };
        }
        hasSelection() {
            return this._xterm ? this._xterm.hasSelection() : false;
        }
        async copySelection() {
            const xterm = await this._xtermReadyPromise;
            if (this.hasSelection()) {
                await this._clipboardService.writeText(xterm.getSelection());
            }
            else {
                this._notificationService.warn(nls.localize(9, null));
            }
        }
        get selection() {
            return this._xterm && this.hasSelection() ? this._xterm.getSelection() : undefined;
        }
        clearSelection() {
            var _a;
            (_a = this._xterm) === null || _a === void 0 ? void 0 : _a.clearSelection();
        }
        selectAll() {
            var _a, _b;
            // Focus here to ensure the terminal context key is set
            (_a = this._xterm) === null || _a === void 0 ? void 0 : _a.focus();
            (_b = this._xterm) === null || _b === void 0 ? void 0 : _b.selectAll();
        }
        findNext(term, searchOptions) {
            if (!this._xtermSearch) {
                return false;
            }
            return this._xtermSearch.findNext(term, searchOptions);
        }
        findPrevious(term, searchOptions) {
            if (!this._xtermSearch) {
                return false;
            }
            return this._xtermSearch.findPrevious(term, searchOptions);
        }
        notifyFindWidgetFocusChanged(isFocused) {
            if (!this._xterm) {
                return;
            }
            const terminalFocused = !isFocused && (document.activeElement === this._xterm.textarea || document.activeElement === this._xterm.element);
            this._terminalFocusContextKey.set(terminalFocused);
        }
        _refreshAltBufferContextKey() {
            this._terminalAltBufferActiveContextKey.set(!!(this._xterm && this._xterm.buffer.active === this._xterm.buffer.alternate));
        }
        dispose(immediate) {
            this._logService.trace(`terminalInstance#dispose (instanceId: ${this.instanceId})`);
            (0, lifecycle_1.dispose)(this._linkManager);
            this._linkManager = undefined;
            (0, lifecycle_1.dispose)(this._commandTrackerAddon);
            this._commandTrackerAddon = undefined;
            (0, lifecycle_1.dispose)(this._widgetManager);
            if (this._xterm && this._xterm.element) {
                this._hadFocusOnExit = this._xterm.element.classList.contains('focus');
            }
            if (this._wrapperElement) {
                if (this._wrapperElement.xterm) {
                    this._wrapperElement.xterm = undefined;
                }
                if (this._wrapperElement.parentElement && this._container) {
                    this._container.removeChild(this._wrapperElement);
                }
            }
            if (this._xterm) {
                const buffer = this._xterm.buffer;
                this._sendLineData(buffer.active, buffer.active.baseY + buffer.active.cursorY);
                this._xterm.dispose();
            }
            if (this._pressAnyKeyToCloseListener) {
                this._pressAnyKeyToCloseListener.dispose();
                this._pressAnyKeyToCloseListener = undefined;
            }
            this._processManager.dispose(immediate);
            // Process manager dispose/shutdown doesn't fire process exit, trigger with undefined if it
            // hasn't happened yet
            this._onProcessExit(undefined);
            if (!this._isDisposed) {
                this._isDisposed = true;
                this._onDisposed.fire(this);
            }
            super.dispose();
        }
        detachFromProcess() {
            this._processManager.detachFromProcess();
        }
        forceRedraw() {
            var _a;
            if (!this._xterm) {
                return;
            }
            (_a = this._webglAddon) === null || _a === void 0 ? void 0 : _a.clearTextureAtlas();
            // TODO: Do canvas renderer too?
        }
        focus(force) {
            this._refreshAltBufferContextKey();
            if (!this._xterm) {
                return;
            }
            const selection = window.getSelection();
            if (!selection) {
                return;
            }
            const text = selection.toString();
            if (!text || force) {
                this._xterm.focus();
            }
        }
        async focusWhenReady(force) {
            await this._xtermReadyPromise;
            this.focus(force);
        }
        async paste() {
            if (!this._xterm) {
                return;
            }
            this.focus();
            this._xterm.paste(await this._clipboardService.readText());
        }
        async pasteSelection() {
            if (!this._xterm) {
                return;
            }
            this.focus();
            this._xterm.paste(await this._clipboardService.readText('selection'));
        }
        async sendText(text, addNewLine) {
            // Normalize line endings to 'enter' press.
            text = text.replace(TerminalInstance.EOL_REGEX, '\r');
            if (addNewLine && text.substr(text.length - 1) !== '\r') {
                text += '\r';
            }
            // Send it to the process
            return this._processManager.write(text);
        }
        setVisible(visible) {
            this._isVisible = visible;
            if (this._wrapperElement) {
                this._wrapperElement.classList.toggle('active', visible);
            }
            if (visible && this._xterm && this._xtermCore) {
                // Trigger a manual scroll event which will sync the viewport and scroll bar. This is
                // necessary if the number of rows in the terminal has decreased while it was in the
                // background since scrollTop changes take no effect but the terminal's position does
                // change since the number of visible rows decreases.
                // This can likely be removed after https://github.com/xtermjs/xterm.js/issues/291 is
                // fixed upstream.
                this._xtermCore._onScroll.fire(this._xterm.buffer.active.viewportY);
                if (this._container && this._container.parentElement) {
                    // Force a layout when the instance becomes invisible. This is particularly important
                    // for ensuring that terminals that are created in the background by an extension will
                    // correctly get correct character measurements in order to render to the screen (see
                    // #34554).
                    const computedStyle = window.getComputedStyle(this._container.parentElement);
                    const width = parseInt(computedStyle.getPropertyValue('width').replace('px', ''), 10);
                    const height = parseInt(computedStyle.getPropertyValue('height').replace('px', ''), 10);
                    this.layout(new dom.Dimension(width, height));
                    // HACK: Trigger another async layout to ensure xterm's CharMeasure is ready to use,
                    // this hack can be removed when https://github.com/xtermjs/xterm.js/issues/702 is
                    // supported.
                    this._timeoutDimension = new dom.Dimension(width, height);
                    setTimeout(() => this.layout(this._timeoutDimension), 0);
                }
            }
        }
        scrollDownLine() {
            var _a;
            (_a = this._xterm) === null || _a === void 0 ? void 0 : _a.scrollLines(1);
        }
        scrollDownPage() {
            var _a;
            (_a = this._xterm) === null || _a === void 0 ? void 0 : _a.scrollPages(1);
        }
        scrollToBottom() {
            var _a;
            (_a = this._xterm) === null || _a === void 0 ? void 0 : _a.scrollToBottom();
        }
        scrollUpLine() {
            var _a;
            (_a = this._xterm) === null || _a === void 0 ? void 0 : _a.scrollLines(-1);
        }
        scrollUpPage() {
            var _a;
            (_a = this._xterm) === null || _a === void 0 ? void 0 : _a.scrollPages(-1);
        }
        scrollToTop() {
            var _a;
            (_a = this._xterm) === null || _a === void 0 ? void 0 : _a.scrollToTop();
        }
        clear() {
            var _a;
            (_a = this._xterm) === null || _a === void 0 ? void 0 : _a.clear();
        }
        _refreshSelectionContextKey() {
            const isActive = !!this._viewsService.getActiveViewWithId(terminal_1.TERMINAL_VIEW_ID);
            this._terminalHasTextContextKey.set(isActive && this.hasSelection());
        }
        _createProcessManager() {
            this._processManager = this._instantiationService.createInstance(terminalProcessManager_1.TerminalProcessManager, this._instanceId, this._configHelper);
            this._processManager.onProcessReady(() => {
                this._onProcessIdReady.fire(this);
                // Re-fire the title change event to ensure a slow resolved icon gets applied
                this._onTitleChanged.fire(this);
            });
            this._processManager.onProcessExit(exitCode => this._onProcessExit(exitCode));
            this._processManager.onProcessData(ev => {
                var _a;
                (_a = this._initialDataEvents) === null || _a === void 0 ? void 0 : _a.push(ev.data);
                this._onData.fire(ev.data);
            });
            this._processManager.onProcessOverrideDimensions(e => this.setDimensions(e, true));
            this._processManager.onProcessResolvedShellLaunchConfig(e => this._setResolvedShellLaunchConfig(e));
            this._processManager.onEnvironmentVariableInfoChanged(e => this._onEnvironmentVariableInfoChanged(e));
            this._processManager.onProcessShellTypeChanged(type => this.setShellType(type));
            if (this._shellLaunchConfig.name) {
                this.setTitle(this._shellLaunchConfig.name, terminal_1.TitleEventSource.Api);
            }
            else {
                // Only listen for process title changes when a name is not provided
                if (this._configHelper.config.experimentalUseTitleEvent) {
                    // Set the title to the first event if the sequence hasn't set it yet
                    event_1.Event.once(this._processManager.onProcessTitle)(e => {
                        if (!this._title) {
                            this.setTitle(this._title, terminal_1.TitleEventSource.Sequence);
                        }
                    });
                    // Listen to xterm.js' sequence title change event, trigger this async to ensure
                    // xterm is constructed since this is called from TerminalInstance's ctor
                    setTimeout(() => {
                        this._xtermReadyPromise.then(xterm => {
                            this._messageTitleDisposable = xterm.onTitleChange(e => this._onTitleChange(e));
                        });
                    });
                }
                else {
                    this.setTitle(this._shellLaunchConfig.executable, terminal_1.TitleEventSource.Process);
                    this._messageTitleDisposable = this._processManager.onProcessTitle(title => this.setTitle(title ? title : '', terminal_1.TitleEventSource.Process));
                }
            }
            this._processManager.onPtyDisconnect(() => {
                this._safeSetOption('disableStdin', true);
                this.statusList.add({
                    id: "disconnected" /* Disconnected */,
                    severity: notification_1.Severity.Error,
                    icon: codicons_1.Codicon.debugDisconnect,
                    tooltip: nls.localize(10, null)
                });
            });
            this._processManager.onPtyReconnect(() => {
                this._safeSetOption('disableStdin', false);
                this.statusList.remove("disconnected" /* Disconnected */);
            });
        }
        _createProcess() {
            if (this._isDisposed) {
                return;
            }
            this._processManager.createProcess(this._shellLaunchConfig, this._cols, this._rows, this._accessibilityService.isScreenReaderOptimized()).then(error => {
                if (error) {
                    this._onProcessExit(error);
                }
            });
        }
        _onProcessData(ev) {
            var _a;
            const messageId = ++this._latestXtermWriteData;
            if (ev.trackCommit) {
                ev.writePromise = new Promise(r => {
                    var _a;
                    (_a = this._xterm) === null || _a === void 0 ? void 0 : _a.write(ev.data, () => {
                        this._latestXtermParseData = messageId;
                        this._processManager.acknowledgeDataEvent(ev.data.length);
                        r();
                    });
                });
            }
            else {
                (_a = this._xterm) === null || _a === void 0 ? void 0 : _a.write(ev.data, () => {
                    this._latestXtermParseData = messageId;
                    this._processManager.acknowledgeDataEvent(ev.data.length);
                });
            }
        }
        /**
         * Called when either a process tied to a terminal has exited or when a terminal renderer
         * simulates a process exiting (e.g. custom execution task).
         * @param exitCode The exit code of the process, this is undefined when the terminal was exited
         * through user action.
         */
        async _onProcessExit(exitCodeOrError) {
            // Prevent dispose functions being triggered multiple times
            if (this._isExiting) {
                return;
            }
            this._isExiting = true;
            await this._flushXtermData();
            this._logService.debug(`Terminal process exit (instanceId: ${this.instanceId}) with code ${this._exitCode}`);
            let exitCodeMessage;
            // Create exit code message
            switch (typeof exitCodeOrError) {
                case 'number':
                    // Only show the error if the exit code is non-zero
                    this._exitCode = exitCodeOrError;
                    if (this._exitCode === 0) {
                        break;
                    }
                    let commandLine = undefined;
                    if (this._shellLaunchConfig.executable) {
                        commandLine = this._shellLaunchConfig.executable;
                        if (typeof this._shellLaunchConfig.args === 'string') {
                            commandLine += ` ${this._shellLaunchConfig.args}`;
                        }
                        else if (this._shellLaunchConfig.args && this._shellLaunchConfig.args.length) {
                            commandLine += this._shellLaunchConfig.args.map(a => ` '${a}'`).join();
                        }
                    }
                    if (this._processManager.processState === 3 /* KILLED_DURING_LAUNCH */) {
                        if (commandLine) {
                            exitCodeMessage = nls.localize(11, null, commandLine, this._exitCode);
                            break;
                        }
                        exitCodeMessage = nls.localize(12, null, this._exitCode);
                        break;
                    }
                    if (commandLine) {
                        exitCodeMessage = nls.localize(13, null, commandLine, this._exitCode);
                        break;
                    }
                    exitCodeMessage = nls.localize(14, null, this._exitCode);
                    break;
                case 'object':
                    this._exitCode = exitCodeOrError.code;
                    exitCodeMessage = nls.localize(15, null, exitCodeOrError.message);
                    break;
            }
            this._logService.debug(`Terminal process exit (instanceId: ${this.instanceId}) state ${this._processManager.processState}`);
            // Only trigger wait on exit when the exit was *not* triggered by the
            // user (via the `workbench.action.terminal.kill` command).
            if (this._shellLaunchConfig.waitOnExit && this._processManager.processState !== 4 /* KILLED_BY_USER */) {
                this._xtermReadyPromise.then(xterm => {
                    if (exitCodeMessage) {
                        xterm.writeln(exitCodeMessage);
                    }
                    if (typeof this._shellLaunchConfig.waitOnExit === 'string') {
                        xterm.write((0, terminalStrings_1.formatMessageForTerminal)(this._shellLaunchConfig.waitOnExit));
                    }
                    // Disable all input if the terminal is exiting and listen for next keypress
                    xterm.setOption('disableStdin', true);
                    if (xterm.textarea) {
                        this._attachPressAnyKeyToCloseListener(xterm);
                    }
                });
            }
            else {
                this.dispose();
                if (exitCodeMessage) {
                    const failedDuringLaunch = this._processManager.processState === 3 /* KILLED_DURING_LAUNCH */;
                    if (failedDuringLaunch || this._configHelper.config.showExitAlert) {
                        // Always show launch failures
                        this._notificationService.notify({
                            message: exitCodeMessage,
                            severity: notification_1.Severity.Error,
                            actions: { primary: [this._instantiationService.createInstance(terminalActions_1.TerminalLaunchHelpAction)] }
                        });
                    }
                    else {
                        // Log to help surface the error in case users report issues with showExitAlert
                        // disabled
                        this._logService.warn(exitCodeMessage);
                    }
                }
            }
            this._onExit.fire(this._exitCode);
        }
        /**
         * Ensure write calls to xterm.js have finished before resolving.
         */
        _flushXtermData() {
            if (this._latestXtermWriteData === this._latestXtermParseData) {
                return Promise.resolve();
            }
            let retries = 0;
            return new Promise(r => {
                const interval = setInterval(() => {
                    if (this._latestXtermWriteData === this._latestXtermParseData || ++retries === 5) {
                        clearInterval(interval);
                        r();
                    }
                }, 20);
            });
        }
        _attachPressAnyKeyToCloseListener(xterm) {
            if (xterm.textarea && !this._pressAnyKeyToCloseListener) {
                this._pressAnyKeyToCloseListener = dom.addDisposableListener(xterm.textarea, 'keypress', (event) => {
                    if (this._pressAnyKeyToCloseListener) {
                        this._pressAnyKeyToCloseListener.dispose();
                        this._pressAnyKeyToCloseListener = undefined;
                        this.dispose();
                        event.preventDefault();
                    }
                });
            }
        }
        reuseTerminal(shell, reset = false) {
            var _a, _b, _c;
            // Unsubscribe any key listener we may have.
            (_a = this._pressAnyKeyToCloseListener) === null || _a === void 0 ? void 0 : _a.dispose();
            this._pressAnyKeyToCloseListener = undefined;
            if (this._xterm) {
                if (!reset) {
                    // Ensure new processes' output starts at start of new line
                    this._xterm.write('\n\x1b[G');
                }
                // Print initialText if specified
                if (shell.initialText) {
                    this._xterm.writeln(shell.initialText);
                }
                // Clean up waitOnExit state
                if (this._isExiting && this._shellLaunchConfig.waitOnExit) {
                    this._xterm.setOption('disableStdin', false);
                    this._isExiting = false;
                }
            }
            // Dispose the environment info widget if it exists
            this.statusList.remove("relaunch-needed" /* RelaunchNeeded */);
            (_b = this._environmentInfo) === null || _b === void 0 ? void 0 : _b.disposable.dispose();
            this._environmentInfo = undefined;
            if (!reset) {
                // HACK: Force initialText to be non-falsy for reused terminals such that the
                // conptyInheritCursor flag is passed to the node-pty, this flag can cause a Window to stop
                // responding in Windows 10 1903 so we only want to use it when something is definitely written
                // to the terminal.
                shell.initialText = ' ';
            }
            // Set the new shell launch config
            this._shellLaunchConfig = shell; // Must be done before calling _createProcess()
            this._processManager.relaunch(this._shellLaunchConfig, this._cols, this._rows, this._accessibilityService.isScreenReaderOptimized(), reset);
            // Set title again as when creating the first process
            if (this._shellLaunchConfig.name) {
                this.setTitle(this._shellLaunchConfig.name, terminal_1.TitleEventSource.Api);
            }
            (_c = this._xtermTypeAhead) === null || _c === void 0 ? void 0 : _c.reset();
        }
        relaunch() {
            this.reuseTerminal(this._shellLaunchConfig, true);
        }
        _onLineFeed() {
            const buffer = this._xterm.buffer;
            const newLine = buffer.active.getLine(buffer.active.baseY + buffer.active.cursorY);
            if (newLine && !newLine.isWrapped) {
                this._sendLineData(buffer.active, buffer.active.baseY + buffer.active.cursorY - 1);
            }
        }
        _onCursorMove() {
            const buffer = this._xterm.buffer;
            this._sendLineData(buffer.active, buffer.active.baseY + buffer.active.cursorY);
        }
        _onTitleChange(title) {
            if (this.isTitleSetByProcess) {
                this.setTitle(title, terminal_1.TitleEventSource.Sequence);
            }
        }
        _sendLineData(buffer, lineIndex) {
            let line = buffer.getLine(lineIndex);
            if (!line) {
                return;
            }
            let lineData = line.translateToString(true);
            while (lineIndex > 0 && line.isWrapped) {
                line = buffer.getLine(--lineIndex);
                if (!line) {
                    break;
                }
                lineData = line.translateToString(false) + lineData;
            }
            this._onLineData.fire(lineData);
        }
        _onKey(key, ev) {
            const event = new keyboardEvent_1.StandardKeyboardEvent(ev);
            if (event.equals(3 /* Enter */)) {
                this._updateProcessCwd();
            }
        }
        async _onSelectionChange() {
            if (this._configurationService.getValue('terminal.integrated.copyOnSelection')) {
                if (this.hasSelection()) {
                    await this.copySelection();
                }
            }
        }
        async _updateProcessCwd() {
            // reset cwd if it has changed, so file based url paths can be resolved
            const cwd = await this.getCwd();
            if (cwd && this._linkManager) {
                this._linkManager.processCwd = cwd;
            }
            return cwd;
        }
        updateConfig() {
            const config = this._configHelper.config;
            this._safeSetOption('altClickMovesCursor', config.altClickMovesCursor);
            this._setCursorBlink(config.cursorBlinking);
            this._setCursorStyle(config.cursorStyle);
            this._setCursorWidth(config.cursorWidth);
            this._setCommandsToSkipShell(config.commandsToSkipShell);
            this._safeSetOption('scrollback', config.scrollback);
            this._safeSetOption('minimumContrastRatio', config.minimumContrastRatio);
            this._safeSetOption('fastScrollSensitivity', config.fastScrollSensitivity);
            this._safeSetOption('scrollSensitivity', config.mouseWheelScrollSensitivity);
            this._safeSetOption('macOptionIsMeta', config.macOptionIsMeta);
            const editorOptions = this._configurationService.getValue('editor');
            this._safeSetOption('altClickMovesCursor', config.altClickMovesCursor && editorOptions.multiCursorModifier === 'alt');
            this._safeSetOption('macOptionClickForcesSelection', config.macOptionClickForcesSelection);
            this._safeSetOption('rightClickSelectsWord', config.rightClickBehavior === 'selectWord');
            this._safeSetOption('wordSeparator', config.wordSeparators);
            const suggestedRendererType = this._storageService.get(terminal_1.SUGGESTED_RENDERER_TYPE, 0 /* GLOBAL */);
            if ((config.gpuAcceleration === 'auto' && suggestedRendererType === undefined) || config.gpuAcceleration === 'on') {
                this._enableWebglRenderer();
            }
            else {
                this._disposeOfWebglRenderer();
                this._safeSetOption('rendererType', (config.gpuAcceleration === 'auto' && suggestedRendererType === 'dom') ? 'dom' : (config.gpuAcceleration === 'off' ? 'dom' : 'canvas'));
            }
            this._refreshEnvironmentVariableInfoWidgetState(this._processManager.environmentVariableInfo);
        }
        async _enableWebglRenderer() {
            if (!this._xterm || this._webglAddon) {
                return;
            }
            const Addon = await this._terminalInstanceService.getXtermWebglConstructor();
            this._webglAddon = new Addon();
            try {
                this._xterm.loadAddon(this._webglAddon);
                this._webglAddon.onContextLoss(() => {
                    this._logService.info(`Webgl lost context, disposing of webgl renderer`);
                    this._disposeOfWebglRenderer();
                    this._safeSetOption('rendererType', 'dom');
                });
                this._storageService.store(terminal_1.SUGGESTED_RENDERER_TYPE, 'auto', 0 /* GLOBAL */, 1 /* MACHINE */);
            }
            catch (e) {
                this._logService.warn(`Webgl could not be loaded. Falling back to the canvas renderer type.`, e);
                const neverMeasureRenderTime = this._storageService.getBoolean(terminal_1.NEVER_MEASURE_RENDER_TIME_STORAGE_KEY, 0 /* GLOBAL */, false);
                // if it's already set to dom, no need to measure render time
                if (!neverMeasureRenderTime && this._configHelper.config.gpuAcceleration !== 'off') {
                    this._measureRenderTime();
                }
                this._safeSetOption('rendererType', 'canvas');
                this._storageService.store(terminal_1.SUGGESTED_RENDERER_TYPE, 'canvas', 0 /* GLOBAL */, 1 /* MACHINE */);
                this._disposeOfWebglRenderer();
            }
        }
        _disposeOfWebglRenderer() {
            var _a;
            try {
                (_a = this._webglAddon) === null || _a === void 0 ? void 0 : _a.dispose();
            }
            catch (_b) {
                // ignore
            }
            this._webglAddon = undefined;
        }
        async _updateUnicodeVersion() {
            if (!this._xterm) {
                throw new Error('Cannot update unicode version before xterm has been initialized');
            }
            if (!this._xtermUnicode11 && this._configHelper.config.unicodeVersion === '11') {
                const Addon = await this._terminalInstanceService.getXtermUnicode11Constructor();
                this._xtermUnicode11 = new Addon();
                this._xterm.loadAddon(this._xtermUnicode11);
            }
            this._xterm.unicode.activeVersion = this._configHelper.config.unicodeVersion;
        }
        updateAccessibilitySupport() {
            var _a;
            const isEnabled = this._accessibilityService.isScreenReaderOptimized();
            if (isEnabled) {
                this._navigationModeAddon = new navigationModeAddon_1.NavigationModeAddon(this._terminalA11yTreeFocusContextKey);
                this._xterm.loadAddon(this._navigationModeAddon);
            }
            else {
                (_a = this._navigationModeAddon) === null || _a === void 0 ? void 0 : _a.dispose();
                this._navigationModeAddon = undefined;
            }
            this._xterm.setOption('screenReaderMode', isEnabled);
        }
        _setCursorBlink(blink) {
            if (this._xterm && this._xterm.getOption('cursorBlink') !== blink) {
                this._xterm.setOption('cursorBlink', blink);
                this._xterm.refresh(0, this._xterm.rows - 1);
            }
        }
        _setCursorStyle(style) {
            if (this._xterm && this._xterm.getOption('cursorStyle') !== style) {
                // 'line' is used instead of bar in VS Code to be consistent with editor.cursorStyle
                const xtermOption = style === 'line' ? 'bar' : style;
                this._xterm.setOption('cursorStyle', xtermOption);
            }
        }
        _setCursorWidth(width) {
            if (this._xterm && this._xterm.getOption('cursorWidth') !== width) {
                this._xterm.setOption('cursorWidth', width);
            }
        }
        _setCommandsToSkipShell(commands) {
            const excludeCommands = commands.filter(command => command[0] === '-').map(command => command.slice(1));
            this._skipTerminalCommands = terminal_1.DEFAULT_COMMANDS_TO_SKIP_SHELL.filter(defaultCommand => {
                return excludeCommands.indexOf(defaultCommand) === -1;
            }).concat(commands);
        }
        _safeSetOption(key, value) {
            if (!this._xterm) {
                return;
            }
            if (this._xterm.getOption(key) !== value) {
                this._xterm.setOption(key, value);
            }
        }
        layout(dimension) {
            if (this.disableLayout) {
                return;
            }
            const terminalWidth = this._evaluateColsAndRows(dimension.width, dimension.height);
            if (!terminalWidth) {
                return;
            }
            this._timeoutDimension = new dom.Dimension(dimension.width, dimension.height);
            if (this._xterm && this._xterm.element) {
                this._xterm.element.style.width = terminalWidth + 'px';
            }
            this._resize();
            // Signal the container is ready
            this._containerReadyBarrier.open();
        }
        async _resize() {
            this._resizeNow(false);
        }
        async _resizeNow(immediate) {
            var _a;
            let cols = this.cols;
            let rows = this.rows;
            if (this._xterm && this._xtermCore) {
                // Only apply these settings when the terminal is visible so that
                // the characters are measured correctly.
                if (this._isVisible) {
                    const font = this._configHelper.getFont(this._xtermCore);
                    const config = this._configHelper.config;
                    this._safeSetOption('letterSpacing', font.letterSpacing);
                    this._safeSetOption('lineHeight', font.lineHeight);
                    this._safeSetOption('fontSize', font.fontSize);
                    this._safeSetOption('fontFamily', font.fontFamily);
                    this._safeSetOption('fontWeight', config.fontWeight);
                    this._safeSetOption('fontWeightBold', config.fontWeightBold);
                    this._safeSetOption('drawBoldTextInBrightColors', config.drawBoldTextInBrightColors);
                    // Any of the above setting changes could have changed the dimensions of the
                    // terminal, re-evaluate now.
                    this._initDimensions();
                    cols = this.cols;
                    rows = this.rows;
                }
                if (isNaN(cols) || isNaN(rows)) {
                    return;
                }
                if (cols !== this._xterm.cols || rows !== this._xterm.rows) {
                    this._onDimensionsChanged.fire();
                }
                this._xterm.resize(cols, rows);
                TerminalInstance._lastKnownGridDimensions = { cols, rows };
                if (this._isVisible) {
                    // HACK: Force the renderer to unpause by simulating an IntersectionObserver event.
                    // This is to fix an issue where dragging the window to the top of the screen to
                    // maximize on Windows/Linux would fire an event saying that the terminal was not
                    // visible.
                    if (this._xterm.getOption('rendererType') === 'canvas') {
                        (_a = this._xtermCore._renderService) === null || _a === void 0 ? void 0 : _a._onIntersectionChange({ intersectionRatio: 1 });
                        // HACK: Force a refresh of the screen to ensure links are refresh corrected.
                        // This can probably be removed when the above hack is fixed in Chromium.
                        this._xterm.refresh(0, this._xterm.rows - 1);
                    }
                }
            }
            if (immediate) {
                // do not await, call setDimensions synchronously
                this._processManager.setDimensions(cols, rows, true);
            }
            else {
                await this._processManager.setDimensions(cols, rows);
            }
        }
        setShellType(shellType) {
            this._shellType = shellType;
        }
        _setAriaLabel(xterm, terminalId, title) {
            var _a, _b;
            if (xterm) {
                if (title && title.length > 0) {
                    (_a = xterm.textarea) === null || _a === void 0 ? void 0 : _a.setAttribute('aria-label', nls.localize(16, null, terminalId, title));
                }
                else {
                    (_b = xterm.textarea) === null || _b === void 0 ? void 0 : _b.setAttribute('aria-label', nls.localize(17, null, terminalId));
                }
            }
        }
        setTitle(title, eventSource) {
            if (!title) {
                return;
            }
            switch (eventSource) {
                case terminal_1.TitleEventSource.Process:
                    if (platform_1.isWindows) {
                        // Remove the .exe extension
                        title = path.basename(title);
                        title = title.split('.exe')[0];
                    }
                    else {
                        const firstSpaceIndex = title.indexOf(' ');
                        if (title.startsWith('/')) {
                            title = path.basename(title);
                        }
                        else if (firstSpaceIndex > -1) {
                            title = title.substring(0, firstSpaceIndex);
                        }
                    }
                    break;
                case terminal_1.TitleEventSource.Api:
                    // If the title has not been set by the API or the rename command, unregister the handler that
                    // automatically updates the terminal name
                    (0, lifecycle_1.dispose)(this._messageTitleDisposable);
                    this._messageTitleDisposable = undefined;
                    break;
            }
            const didTitleChange = title !== this._title;
            this._title = title;
            if (didTitleChange) {
                this._setAriaLabel(this._xterm, this._instanceId, this._title);
                if (this._titleReadyComplete) {
                    this._titleReadyComplete(title);
                    this._titleReadyComplete = undefined;
                }
                this._onTitleChanged.fire(this);
            }
        }
        waitForTitle() {
            return this._titleReadyPromise;
        }
        setDimensions(dimensions, immediate = false) {
            if (this._dimensionsOverride && this._dimensionsOverride.forceExactSize && !dimensions && this._rows === 0 && this._cols === 0) {
                // this terminal never had a real size => keep the last dimensions override exact size
                this._cols = this._dimensionsOverride.cols;
                this._rows = this._dimensionsOverride.rows;
            }
            this._dimensionsOverride = dimensions;
            if (immediate) {
                this._resizeNow(true);
            }
            else {
                this._resize();
            }
        }
        _setResolvedShellLaunchConfig(shellLaunchConfig) {
            this._shellLaunchConfig.args = shellLaunchConfig.args;
            this._shellLaunchConfig.cwd = shellLaunchConfig.cwd;
            this._shellLaunchConfig.executable = shellLaunchConfig.executable;
            this._shellLaunchConfig.env = shellLaunchConfig.env;
        }
        showEnvironmentInfoHover() {
            if (this._environmentInfo) {
                this._environmentInfo.widget.focus();
            }
        }
        _onEnvironmentVariableInfoChanged(info) {
            var _a, _b;
            if (info.requiresAction) {
                (_b = (_a = this._xterm) === null || _a === void 0 ? void 0 : _a.textarea) === null || _b === void 0 ? void 0 : _b.setAttribute('aria-label', nls.localize(18, null, this._instanceId));
            }
            this._refreshEnvironmentVariableInfoWidgetState(info);
        }
        _refreshEnvironmentVariableInfoWidgetState(info) {
            var _a, _b;
            // Check if the widget should not exist
            if (!info ||
                this._configHelper.config.environmentChangesIndicator === 'off' ||
                this._configHelper.config.environmentChangesIndicator === 'warnonly' && !info.requiresAction) {
                this.statusList.remove("relaunch-needed" /* RelaunchNeeded */);
                (_a = this._environmentInfo) === null || _a === void 0 ? void 0 : _a.disposable.dispose();
                this._environmentInfo = undefined;
                return;
            }
            // Recreate the process if the terminal has not yet been interacted with and it's not a
            // special terminal (eg. task, extension terminal)
            if (info.requiresAction &&
                this._configHelper.config.environmentChangesRelaunch &&
                !this._processManager.hasWrittenData &&
                !this._shellLaunchConfig.isFeatureTerminal &&
                !this._shellLaunchConfig.customPtyImplementation
                && !this._shellLaunchConfig.isExtensionOwnedTerminal &&
                !this._shellLaunchConfig.attachPersistentProcess) {
                this.relaunch();
                return;
            }
            // (Re-)create the widget
            (_b = this._environmentInfo) === null || _b === void 0 ? void 0 : _b.disposable.dispose();
            const widget = this._instantiationService.createInstance(environmentVariableInfoWidget_1.EnvironmentVariableInfoWidget, info);
            const disposable = this._widgetManager.attachWidget(widget);
            if (info.requiresAction) {
                this.statusList.add({
                    id: "relaunch-needed" /* RelaunchNeeded */,
                    severity: notification_1.Severity.Warning,
                    icon: codicons_1.Codicon.warning,
                    tooltip: info.getInfo(),
                    hoverActions: info.getActions ? info.getActions() : undefined
                });
            }
            if (disposable) {
                this._environmentInfo = { widget, disposable };
            }
        }
        _getXtermTheme(theme) {
            if (!theme) {
                theme = this._themeService.getColorTheme();
            }
            const location = this._viewDescriptorService.getViewLocationById(terminal_1.TERMINAL_VIEW_ID);
            const foregroundColor = theme.getColor(terminalColorRegistry_1.TERMINAL_FOREGROUND_COLOR);
            const backgroundColor = theme.getColor(terminalColorRegistry_1.TERMINAL_BACKGROUND_COLOR) || (location === 0 /* Sidebar */ ? theme.getColor(theme_1.SIDE_BAR_BACKGROUND) : theme.getColor(theme_1.PANEL_BACKGROUND));
            const cursorColor = theme.getColor(terminalColorRegistry_1.TERMINAL_CURSOR_FOREGROUND_COLOR) || foregroundColor;
            const cursorAccentColor = theme.getColor(terminalColorRegistry_1.TERMINAL_CURSOR_BACKGROUND_COLOR) || backgroundColor;
            const selectionColor = theme.getColor(terminalColorRegistry_1.TERMINAL_SELECTION_BACKGROUND_COLOR);
            return {
                background: backgroundColor ? backgroundColor.toString() : null,
                foreground: foregroundColor ? foregroundColor.toString() : null,
                cursor: cursorColor ? cursorColor.toString() : null,
                cursorAccent: cursorAccentColor ? cursorAccentColor.toString() : null,
                selection: selectionColor ? selectionColor.toString() : null,
                black: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[0]).toString(),
                red: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[1]).toString(),
                green: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[2]).toString(),
                yellow: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[3]).toString(),
                blue: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[4]).toString(),
                magenta: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[5]).toString(),
                cyan: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[6]).toString(),
                white: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[7]).toString(),
                brightBlack: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[8]).toString(),
                brightRed: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[9]).toString(),
                brightGreen: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[10]).toString(),
                brightYellow: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[11]).toString(),
                brightBlue: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[12]).toString(),
                brightMagenta: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[13]).toString(),
                brightCyan: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[14]).toString(),
                brightWhite: theme.getColor(terminalColorRegistry_1.ansiColorIdentifiers[15]).toString()
            };
        }
        _updateTheme(xterm, theme) {
            xterm.setOption('theme', this._getXtermTheme(theme));
        }
        async toggleEscapeSequenceLogging() {
            const xterm = await this._xtermReadyPromise;
            const isDebug = xterm.getOption('logLevel') === 'debug';
            xterm.setOption('logLevel', isDebug ? 'info' : 'debug');
        }
        getInitialCwd() {
            return this._processManager.getInitialCwd();
        }
        getCwd() {
            return this._processManager.getCwd();
        }
        registerLinkProvider(provider) {
            if (!this._linkManager) {
                throw new Error('TerminalInstance.registerLinkProvider before link manager was ready');
            }
            return this._linkManager.registerExternalLinkProvider(this, provider);
        }
        async rename() {
            const name = await this._quickInputService.input({
                value: this.title,
                prompt: nls.localize(19, null),
            });
            if (name) {
                this.setTitle(name, terminal_1.TitleEventSource.Api);
            }
        }
        async changeIcon() {
            const items = [];
            for (const icon of codicons_1.iconRegistry.all) {
                items.push({ label: `$(${icon.id})`, description: `${icon.id}` });
            }
            const result = await this._quickInputService.pick(items, {
                title: nls.localize(20, null),
                matchOnDescription: true
            });
            if (result) {
                this.shellLaunchConfig.icon = result.description;
                this._onTitleChanged.fire(this);
            }
        }
        async configure() {
            const changeIcon = { label: nls.localize(21, null) };
            const rename = { label: nls.localize(22, null) };
            const result = await this._quickInputService.pick([changeIcon, rename], {
                title: nls.localize(23, null)
            });
            switch (result) {
                case changeIcon: return this.changeIcon();
                case rename: return this.rename();
            }
        }
    };
    TerminalInstance.EOL_REGEX = /\r?\n/g;
    TerminalInstance._instanceIdCounter = 1;
    __decorate([
        (0, decorators_1.debounce)(50)
    ], TerminalInstance.prototype, "_fireMaximumDimensionsChanged", null);
    __decorate([
        (0, decorators_1.debounce)(1000)
    ], TerminalInstance.prototype, "relaunch", null);
    __decorate([
        (0, decorators_1.debounce)(2000)
    ], TerminalInstance.prototype, "_updateProcessCwd", null);
    __decorate([
        (0, decorators_1.debounce)(50)
    ], TerminalInstance.prototype, "_resize", null);
    TerminalInstance = __decorate([
        __param(6, terminal_2.ITerminalInstanceService),
        __param(7, terminal_1.ITerminalProfileResolverService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, keybinding_1.IKeybindingService),
        __param(10, notification_1.INotificationService),
        __param(11, preferences_1.IPreferencesService),
        __param(12, views_1.IViewsService),
        __param(13, instantiation_1.IInstantiationService),
        __param(14, clipboardService_1.IClipboardService),
        __param(15, themeService_1.IThemeService),
        __param(16, configuration_1.IConfigurationService),
        __param(17, log_1.ILogService),
        __param(18, storage_1.IStorageService),
        __param(19, accessibility_1.IAccessibilityService),
        __param(20, views_1.IViewDescriptorService),
        __param(21, productService_1.IProductService),
        __param(22, quickInput_1.IQuickInputService),
        __param(23, environmentService_1.IWorkbenchEnvironmentService)
    ], TerminalInstance);
    exports.TerminalInstance = TerminalInstance;
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        // Border
        const border = theme.getColor(colorRegistry_1.activeContrastBorder);
        if (border) {
            collector.addRule(`
			.monaco-workbench.hc-black .pane-body.integrated-terminal .xterm.focus::before,
			.monaco-workbench.hc-black .pane-body.integrated-terminal .xterm:focus::before { border-color: ${border}; }`);
        }
        // Scrollbar
        const scrollbarSliderBackgroundColor = theme.getColor(colorRegistry_1.scrollbarSliderBackground);
        if (scrollbarSliderBackgroundColor) {
            collector.addRule(`
			.monaco-workbench .pane-body.integrated-terminal .find-focused .xterm .xterm-viewport,
			.monaco-workbench .pane-body.integrated-terminal .xterm.focus .xterm-viewport,
			.monaco-workbench .pane-body.integrated-terminal .xterm:focus .xterm-viewport,
			.monaco-workbench .pane-body.integrated-terminal .xterm:hover .xterm-viewport { background-color: ${scrollbarSliderBackgroundColor} !important; }
			.monaco-workbench .pane-body.integrated-terminal .xterm-viewport { scrollbar-color: ${scrollbarSliderBackgroundColor} transparent; }
		`);
        }
        const scrollbarSliderHoverBackgroundColor = theme.getColor(colorRegistry_1.scrollbarSliderHoverBackground);
        if (scrollbarSliderHoverBackgroundColor) {
            collector.addRule(`
			.monaco-workbench .pane-body.integrated-terminal .xterm .xterm-viewport::-webkit-scrollbar-thumb:hover { background-color: ${scrollbarSliderHoverBackgroundColor}; }
			.monaco-workbench .pane-body.integrated-terminal .xterm-viewport:hover { scrollbar-color: ${scrollbarSliderHoverBackgroundColor} transparent; }
		`);
        }
        const scrollbarSliderActiveBackgroundColor = theme.getColor(colorRegistry_1.scrollbarSliderActiveBackground);
        if (scrollbarSliderActiveBackgroundColor) {
            collector.addRule(`.monaco-workbench .pane-body.integrated-terminal .xterm .xterm-viewport::-webkit-scrollbar-thumb:active { background-color: ${scrollbarSliderActiveBackgroundColor}; }`);
        }
    });
});
//# sourceMappingURL=terminalInstance.js.map