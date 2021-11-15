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
define(["require", "exports", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/extensions", "vs/platform/storage/common/storage", "vs/platform/remote/common/tunnel", "vs/base/common/lifecycle", "vs/platform/configuration/common/configuration", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/services/environment/common/environmentService", "vs/base/common/types", "vs/platform/workspace/common/workspace", "vs/base/common/hash", "vs/platform/log/common/log", "vs/base/common/cancellation", "vs/base/common/arrays"], function (require, exports, event_1, instantiation_1, extensions_1, storage_1, tunnel_1, lifecycle_1, configuration_1, remoteAuthorityResolver_1, environmentService_1, types_1, workspace_1, hash_1, log_1, cancellation_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TunnelModel = exports.PortsAttributes = exports.OnPortForward = exports.mapHasAddressLocalhostOrAllInterfaces = exports.mapHasAddress = exports.parseAddress = exports.makeAddress = exports.TunnelEditId = exports.TunnelPrivacy = exports.TunnelType = exports.PORT_AUTO_SOURCE_SETTING_OUTPUT = exports.PORT_AUTO_SOURCE_SETTING_PROCESS = exports.PORT_AUTO_SOURCE_SETTING = exports.PORT_AUTO_FORWARD_SETTING = exports.TUNNEL_VIEW_CONTAINER_ID = exports.TUNNEL_VIEW_ID = exports.REMOTE_EXPLORER_TYPE_KEY = exports.IRemoteExplorerService = void 0;
    exports.IRemoteExplorerService = (0, instantiation_1.createDecorator)('remoteExplorerService');
    exports.REMOTE_EXPLORER_TYPE_KEY = 'remote.explorerType';
    const TUNNELS_TO_RESTORE = 'remote.tunnels.toRestore';
    exports.TUNNEL_VIEW_ID = '~remote.forwardedPorts';
    exports.TUNNEL_VIEW_CONTAINER_ID = '~remote.forwardedPortsContainer';
    exports.PORT_AUTO_FORWARD_SETTING = 'remote.autoForwardPorts';
    exports.PORT_AUTO_SOURCE_SETTING = 'remote.autoForwardPortsSource';
    exports.PORT_AUTO_SOURCE_SETTING_PROCESS = 'process';
    exports.PORT_AUTO_SOURCE_SETTING_OUTPUT = 'output';
    var TunnelType;
    (function (TunnelType) {
        TunnelType["Candidate"] = "Candidate";
        TunnelType["Detected"] = "Detected";
        TunnelType["Forwarded"] = "Forwarded";
        TunnelType["Add"] = "Add";
    })(TunnelType = exports.TunnelType || (exports.TunnelType = {}));
    var TunnelPrivacy;
    (function (TunnelPrivacy) {
        TunnelPrivacy["ConstantPrivate"] = "ConstantPrivate";
        TunnelPrivacy["Private"] = "Private";
        TunnelPrivacy["Public"] = "Public";
    })(TunnelPrivacy = exports.TunnelPrivacy || (exports.TunnelPrivacy = {}));
    var TunnelEditId;
    (function (TunnelEditId) {
        TunnelEditId[TunnelEditId["None"] = 0] = "None";
        TunnelEditId[TunnelEditId["New"] = 1] = "New";
        TunnelEditId[TunnelEditId["Label"] = 2] = "Label";
        TunnelEditId[TunnelEditId["LocalPort"] = 3] = "LocalPort";
    })(TunnelEditId = exports.TunnelEditId || (exports.TunnelEditId = {}));
    function makeAddress(host, port) {
        return host + ':' + port;
    }
    exports.makeAddress = makeAddress;
    function parseAddress(address) {
        var _a;
        const matches = address.match(/^([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\:|localhost:|[a-zA-Z]+:)?([0-9]+)$/);
        if (!matches) {
            return undefined;
        }
        return { host: ((_a = matches[1]) === null || _a === void 0 ? void 0 : _a.substring(0, matches[1].length - 1)) || 'localhost', port: Number(matches[2]) };
    }
    exports.parseAddress = parseAddress;
    function mapHasAddress(map, host, port) {
        const initialAddress = map.get(makeAddress(host, port));
        if (initialAddress) {
            return initialAddress;
        }
        if ((0, tunnel_1.isLocalhost)(host)) {
            // Do localhost checks
            for (const testHost of tunnel_1.LOCALHOST_ADDRESSES) {
                const testAddress = makeAddress(testHost, port);
                if (map.has(testAddress)) {
                    return map.get(testAddress);
                }
            }
        }
        else if ((0, tunnel_1.isAllInterfaces)(host)) {
            // Do all interfaces checks
            for (const testHost of tunnel_1.ALL_INTERFACES_ADDRESSES) {
                const testAddress = makeAddress(testHost, port);
                if (map.has(testAddress)) {
                    return map.get(testAddress);
                }
            }
        }
        return undefined;
    }
    exports.mapHasAddress = mapHasAddress;
    function mapHasAddressLocalhostOrAllInterfaces(map, host, port) {
        const originalAddress = mapHasAddress(map, host, port);
        if (originalAddress) {
            return originalAddress;
        }
        const otherHost = (0, tunnel_1.isAllInterfaces)(host) ? 'localhost' : ((0, tunnel_1.isLocalhost)(host) ? '0.0.0.0' : undefined);
        if (otherHost) {
            return mapHasAddress(map, otherHost, port);
        }
        return undefined;
    }
    exports.mapHasAddressLocalhostOrAllInterfaces = mapHasAddressLocalhostOrAllInterfaces;
    var OnPortForward;
    (function (OnPortForward) {
        OnPortForward["Notify"] = "notify";
        OnPortForward["OpenBrowser"] = "openBrowser";
        OnPortForward["OpenPreview"] = "openPreview";
        OnPortForward["Silent"] = "silent";
        OnPortForward["Ignore"] = "ignore";
    })(OnPortForward = exports.OnPortForward || (exports.OnPortForward = {}));
    class PortsAttributes extends lifecycle_1.Disposable {
        constructor(configurationService) {
            super();
            this.configurationService = configurationService;
            this.portsAttributes = [];
            this._onDidChangeAttributes = new event_1.Emitter();
            this.onDidChangeAttributes = this._onDidChangeAttributes.event;
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(PortsAttributes.SETTING) || e.affectsConfiguration(PortsAttributes.DEFAULTS)) {
                    this.updateAttributes();
                }
            }));
            this.updateAttributes();
        }
        updateAttributes() {
            this.portsAttributes = this.readSetting();
            this._onDidChangeAttributes.fire();
        }
        getAttributes(port, commandLine) {
            var _a, _b, _c, _d;
            let index = this.findNextIndex(port, commandLine, this.portsAttributes, 0);
            const attributes = {
                label: undefined,
                onAutoForward: undefined,
                elevateIfNeeded: undefined
            };
            while (index >= 0) {
                const found = this.portsAttributes[index];
                if (found.key === port) {
                    attributes.onAutoForward = (_a = found.onAutoForward) !== null && _a !== void 0 ? _a : attributes.onAutoForward;
                    attributes.elevateIfNeeded = (found.elevateIfNeeded !== undefined) ? found.elevateIfNeeded : attributes.elevateIfNeeded;
                    attributes.label = (_b = found.label) !== null && _b !== void 0 ? _b : attributes.label;
                }
                else {
                    // It's a range or regex, which means that if the attribute is already set, we keep it
                    attributes.onAutoForward = (_c = attributes.onAutoForward) !== null && _c !== void 0 ? _c : found.onAutoForward;
                    attributes.elevateIfNeeded = (attributes.elevateIfNeeded !== undefined) ? attributes.elevateIfNeeded : found.elevateIfNeeded;
                    attributes.label = (_d = attributes.label) !== null && _d !== void 0 ? _d : found.label;
                }
                index = this.findNextIndex(port, commandLine, this.portsAttributes, index + 1);
            }
            if (attributes.onAutoForward !== undefined || attributes.elevateIfNeeded !== undefined || attributes.label !== undefined) {
                return attributes;
            }
            // If we find no matches, then use the other port attributes.
            return this.getOtherAttributes();
        }
        hasStartEnd(value) {
            return (value.start !== undefined) && (value.end !== undefined);
        }
        findNextIndex(port, commandLine, attributes, fromIndex) {
            if (fromIndex >= attributes.length) {
                return -1;
            }
            const sliced = attributes.slice(fromIndex);
            const foundIndex = sliced.findIndex((value) => {
                if ((0, types_1.isNumber)(value.key)) {
                    return value.key === port;
                }
                else if (this.hasStartEnd(value.key)) {
                    return port >= value.key.start && port <= value.key.end;
                }
                else {
                    return commandLine ? value.key.test(commandLine) : false;
                }
            });
            return foundIndex >= 0 ? foundIndex + fromIndex : -1;
        }
        readSetting() {
            const settingValue = this.configurationService.getValue(PortsAttributes.SETTING);
            if (!settingValue || !(0, types_1.isObject)(settingValue)) {
                return [];
            }
            const attributes = [];
            for (let attributesKey in settingValue) {
                if (attributesKey === undefined) {
                    continue;
                }
                const setting = settingValue[attributesKey];
                let key = undefined;
                if (Number(attributesKey)) {
                    key = Number(attributesKey);
                }
                else if ((0, types_1.isString)(attributesKey)) {
                    if (PortsAttributes.RANGE.test(attributesKey)) {
                        const match = attributesKey.match(PortsAttributes.RANGE);
                        key = { start: Number(match[1]), end: Number(match[2]) };
                    }
                    else {
                        let regTest = undefined;
                        try {
                            regTest = RegExp(attributesKey);
                        }
                        catch (e) {
                            // The user entered an invalid regular expression.
                        }
                        if (regTest) {
                            key = regTest;
                        }
                    }
                }
                if (!key) {
                    continue;
                }
                attributes.push({
                    key: key,
                    elevateIfNeeded: setting.elevateIfPrivileged,
                    onAutoForward: setting.onAutoForward,
                    label: setting.label
                });
            }
            const defaults = this.configurationService.getValue(PortsAttributes.DEFAULTS);
            if (defaults) {
                this.defaultPortAttributes = {
                    elevateIfNeeded: defaults.elevateIfNeeded,
                    label: defaults.label,
                    onAutoForward: defaults.onAutoForward
                };
            }
            return this.sortAttributes(attributes);
        }
        sortAttributes(attributes) {
            function getVal(item, thisRef) {
                if ((0, types_1.isNumber)(item.key)) {
                    return item.key;
                }
                else if (thisRef.hasStartEnd(item.key)) {
                    return item.key.start;
                }
                else {
                    return Number.MAX_VALUE;
                }
            }
            return attributes.sort((a, b) => {
                return getVal(a, this) - getVal(b, this);
            });
        }
        getOtherAttributes() {
            return this.defaultPortAttributes;
        }
        static providedActionToAction(providedAction) {
            switch (providedAction) {
                case tunnel_1.ProvidedOnAutoForward.Notify: return OnPortForward.Notify;
                case tunnel_1.ProvidedOnAutoForward.OpenBrowser: return OnPortForward.OpenBrowser;
                case tunnel_1.ProvidedOnAutoForward.OpenPreview: return OnPortForward.OpenPreview;
                case tunnel_1.ProvidedOnAutoForward.Silent: return OnPortForward.Silent;
                case tunnel_1.ProvidedOnAutoForward.Ignore: return OnPortForward.Ignore;
                default: return undefined;
            }
        }
    }
    exports.PortsAttributes = PortsAttributes;
    PortsAttributes.SETTING = 'remote.portsAttributes';
    PortsAttributes.DEFAULTS = 'remote.otherPortsAttributes';
    PortsAttributes.RANGE = /^(\d+)\-(\d+)$/;
    let TunnelModel = class TunnelModel extends lifecycle_1.Disposable {
        constructor(tunnelService, storageService, configurationService, environmentService, remoteAuthorityResolverService, workspaceContextService, logService) {
            super();
            this.tunnelService = tunnelService;
            this.storageService = storageService;
            this.configurationService = configurationService;
            this.environmentService = environmentService;
            this.remoteAuthorityResolverService = remoteAuthorityResolverService;
            this.workspaceContextService = workspaceContextService;
            this.logService = logService;
            this._onForwardPort = new event_1.Emitter();
            this.onForwardPort = this._onForwardPort.event;
            this._onClosePort = new event_1.Emitter();
            this.onClosePort = this._onClosePort.event;
            this._onPortName = new event_1.Emitter();
            this.onPortName = this._onPortName.event;
            this._onCandidatesChanged = new event_1.Emitter();
            // onCandidateChanged returns the removed candidates
            this.onCandidatesChanged = this._onCandidatesChanged.event;
            this._onEnvironmentTunnelsSet = new event_1.Emitter();
            this.onEnvironmentTunnelsSet = this._onEnvironmentTunnelsSet.event;
            this._environmentTunnelsSet = false;
            this.portAttributesProviders = [];
            this.configPortsAttributes = new PortsAttributes(configurationService);
            this.tunnelRestoreValue = this.getTunnelRestoreValue();
            this._register(this.configPortsAttributes.onDidChangeAttributes(this.updateAttributes, this));
            this.forwarded = new Map();
            this.remoteTunnels = new Map();
            this.tunnelService.tunnels.then(tunnels => {
                tunnels.forEach(tunnel => {
                    var _a;
                    if (tunnel.localAddress) {
                        const key = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces((_a = this._candidates) !== null && _a !== void 0 ? _a : new Map(), tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                        this.forwarded.set(key, {
                            remotePort: tunnel.tunnelRemotePort,
                            remoteHost: tunnel.tunnelRemoteHost,
                            localAddress: tunnel.localAddress,
                            localPort: tunnel.tunnelLocalPort,
                            runningProcess: matchingCandidate === null || matchingCandidate === void 0 ? void 0 : matchingCandidate.detail,
                            hasRunningProcess: !!matchingCandidate,
                            pid: matchingCandidate === null || matchingCandidate === void 0 ? void 0 : matchingCandidate.pid,
                            privacy: this.makeTunnelPrivacy(tunnel.public),
                            userForwarded: true
                        });
                        this.remoteTunnels.set(key, tunnel);
                    }
                });
            });
            this.detected = new Map();
            this._register(this.tunnelService.onTunnelOpened(async (tunnel) => {
                var _a;
                const key = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                if ((!this.forwarded.has(key)) && tunnel.localAddress) {
                    const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces((_a = this._candidates) !== null && _a !== void 0 ? _a : new Map(), tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
                    this.forwarded.set(key, {
                        remoteHost: tunnel.tunnelRemoteHost,
                        remotePort: tunnel.tunnelRemotePort,
                        localAddress: tunnel.localAddress,
                        localPort: tunnel.tunnelLocalPort,
                        closeable: true,
                        runningProcess: matchingCandidate === null || matchingCandidate === void 0 ? void 0 : matchingCandidate.detail,
                        hasRunningProcess: !!matchingCandidate,
                        pid: matchingCandidate === null || matchingCandidate === void 0 ? void 0 : matchingCandidate.pid,
                        privacy: this.makeTunnelPrivacy(tunnel.public),
                        userForwarded: true
                    });
                }
                await this.storeForwarded();
                this.remoteTunnels.set(key, tunnel);
                this._onForwardPort.fire(this.forwarded.get(key));
            }));
            this._register(this.tunnelService.onTunnelClosed(async (address) => {
                const key = makeAddress(address.host, address.port);
                if (this.forwarded.has(key)) {
                    this.forwarded.delete(key);
                    await this.storeForwarded();
                    this._onClosePort.fire(address);
                }
            }));
        }
        makeTunnelPrivacy(isPublic) {
            return isPublic ? TunnelPrivacy.Public : this.tunnelService.canMakePublic ? TunnelPrivacy.Private : TunnelPrivacy.ConstantPrivate;
        }
        async getStorageKey() {
            const workspace = this.workspaceContextService.getWorkspace();
            const workspaceHash = workspace.configuration ? (0, hash_1.hash)(workspace.configuration.path) : (workspace.folders.length > 0 ? (0, hash_1.hash)(workspace.folders[0].uri.path) : undefined);
            return `${TUNNELS_TO_RESTORE}.${this.environmentService.remoteAuthority}.${workspaceHash}`;
        }
        async getTunnelRestoreValue() {
            const deprecatedValue = this.storageService.get(TUNNELS_TO_RESTORE, 1 /* WORKSPACE */);
            if (deprecatedValue) {
                this.storageService.remove(TUNNELS_TO_RESTORE, 1 /* WORKSPACE */);
                await this.storeForwarded();
                return deprecatedValue;
            }
            return this.storageService.get(await this.getStorageKey(), 0 /* GLOBAL */);
        }
        async restoreForwarded() {
            var _a;
            if (this.configurationService.getValue('remote.restoreForwardedPorts')) {
                const tunnelRestoreValue = await this.tunnelRestoreValue;
                if (tunnelRestoreValue) {
                    const tunnels = (_a = JSON.parse(tunnelRestoreValue)) !== null && _a !== void 0 ? _a : [];
                    this.logService.trace(`ForwardedPorts: (TunnelModel) restoring ports ${tunnels.map(tunnel => tunnel.remotePort).join(', ')}`);
                    for (let tunnel of tunnels) {
                        if (!mapHasAddressLocalhostOrAllInterfaces(this.detected, tunnel.remoteHost, tunnel.remotePort)) {
                            await this.forward({ host: tunnel.remoteHost, port: tunnel.remotePort }, tunnel.localPort, tunnel.name, undefined, undefined, tunnel.privacy === TunnelPrivacy.Public);
                        }
                    }
                }
            }
            if (!this.restoreListener) {
                // It's possible that at restore time the value hasn't synced.
                const key = await this.getStorageKey();
                this.restoreListener = this._register(this.storageService.onDidChangeValue(async (e) => {
                    if (e.key === key) {
                        this.tunnelRestoreValue = Promise.resolve(this.storageService.get(await this.getStorageKey(), 0 /* GLOBAL */));
                        await this.restoreForwarded();
                    }
                }));
            }
        }
        async storeForwarded() {
            if (this.configurationService.getValue('remote.restoreForwardedPorts')) {
                this.storageService.store(await this.getStorageKey(), JSON.stringify(Array.from(this.forwarded.values()).filter(value => value.userForwarded)), 0 /* GLOBAL */, 0 /* USER */);
            }
        }
        async forward(remote, local, name, source, elevateIfNeeded, isPublic, restore = true) {
            var _a, _b, _c, _d, _e;
            const existingTunnel = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, remote.host, remote.port);
            const port = local !== undefined ? local : remote.port;
            const attributes = (_a = (await this.getAttributes([port]))) === null || _a === void 0 ? void 0 : _a.get(port);
            if (!existingTunnel) {
                const authority = this.environmentService.remoteAuthority;
                const addressProvider = authority ? {
                    getAddress: async () => { return (await this.remoteAuthorityResolverService.resolveAuthority(authority)).authority; }
                } : undefined;
                const tunnel = await this.tunnelService.openTunnel(addressProvider, remote.host, remote.port, local, (!elevateIfNeeded) ? attributes === null || attributes === void 0 ? void 0 : attributes.elevateIfNeeded : elevateIfNeeded, isPublic);
                if (tunnel && tunnel.localAddress) {
                    const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces((_b = this._candidates) !== null && _b !== void 0 ? _b : new Map(), remote.host, remote.port);
                    const newForward = {
                        remoteHost: tunnel.tunnelRemoteHost,
                        remotePort: tunnel.tunnelRemotePort,
                        localPort: tunnel.tunnelLocalPort,
                        name: (_c = attributes === null || attributes === void 0 ? void 0 : attributes.label) !== null && _c !== void 0 ? _c : name,
                        closeable: true,
                        localAddress: tunnel.localAddress,
                        runningProcess: matchingCandidate === null || matchingCandidate === void 0 ? void 0 : matchingCandidate.detail,
                        hasRunningProcess: !!matchingCandidate,
                        pid: matchingCandidate === null || matchingCandidate === void 0 ? void 0 : matchingCandidate.pid,
                        source,
                        privacy: this.makeTunnelPrivacy(tunnel.public),
                        userForwarded: restore
                    };
                    const key = makeAddress(remote.host, remote.port);
                    this.forwarded.set(key, newForward);
                    this.remoteTunnels.set(key, tunnel);
                    await this.storeForwarded();
                    this._onForwardPort.fire(newForward);
                    return tunnel;
                }
            }
            else {
                if ((_d = attributes === null || attributes === void 0 ? void 0 : attributes.label) !== null && _d !== void 0 ? _d : name) {
                    existingTunnel.name = (_e = attributes === null || attributes === void 0 ? void 0 : attributes.label) !== null && _e !== void 0 ? _e : name;
                }
                this._onForwardPort.fire();
                return mapHasAddressLocalhostOrAllInterfaces(this.remoteTunnels, remote.host, remote.port);
            }
        }
        async name(host, port, name) {
            const existingForwarded = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, host, port);
            const key = makeAddress(host, port);
            if (existingForwarded) {
                existingForwarded.name = name;
                await this.storeForwarded();
                this._onPortName.fire({ host, port });
                return;
            }
            else if (this.detected.has(key)) {
                this.detected.get(key).name = name;
                this._onPortName.fire({ host, port });
            }
        }
        async close(host, port) {
            return this.tunnelService.closeTunnel(host, port);
        }
        address(host, port) {
            var _a;
            const key = makeAddress(host, port);
            return (_a = (this.forwarded.get(key) || this.detected.get(key))) === null || _a === void 0 ? void 0 : _a.localAddress;
        }
        get environmentTunnelsSet() {
            return this._environmentTunnelsSet;
        }
        addEnvironmentTunnels(tunnels) {
            if (tunnels) {
                tunnels.forEach(tunnel => {
                    var _a;
                    const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces((_a = this._candidates) !== null && _a !== void 0 ? _a : new Map(), tunnel.remoteAddress.host, tunnel.remoteAddress.port);
                    this.detected.set(makeAddress(tunnel.remoteAddress.host, tunnel.remoteAddress.port), {
                        remoteHost: tunnel.remoteAddress.host,
                        remotePort: tunnel.remoteAddress.port,
                        localAddress: typeof tunnel.localAddress === 'string' ? tunnel.localAddress : makeAddress(tunnel.localAddress.host, tunnel.localAddress.port),
                        closeable: false,
                        runningProcess: matchingCandidate === null || matchingCandidate === void 0 ? void 0 : matchingCandidate.detail,
                        hasRunningProcess: !!matchingCandidate,
                        pid: matchingCandidate === null || matchingCandidate === void 0 ? void 0 : matchingCandidate.pid,
                        privacy: TunnelPrivacy.ConstantPrivate,
                        userForwarded: false
                    });
                });
            }
            this._environmentTunnelsSet = true;
            this._onEnvironmentTunnelsSet.fire();
            this._onForwardPort.fire();
        }
        setCandidateFilter(filter) {
            this._candidateFilter = filter;
        }
        async setCandidates(candidates) {
            let processedCandidates = candidates;
            if (this._candidateFilter) {
                // When an extension provides a filter, we do the filtering on the extension host before the candidates are set here.
                // However, when the filter doesn't come from an extension we filter here.
                processedCandidates = await this._candidateFilter(candidates);
            }
            const removedCandidates = this.updateInResponseToCandidates(processedCandidates);
            this.logService.trace(`ForwardedPorts: (TunnelModel) removed candidates ${Array.from(removedCandidates.values()).map(candidate => candidate.port).join(', ')}`);
            this._onCandidatesChanged.fire(removedCandidates);
        }
        // Returns removed candidates
        updateInResponseToCandidates(candidates) {
            var _a;
            const removedCandidates = (_a = this._candidates) !== null && _a !== void 0 ? _a : new Map();
            const candidatesMap = new Map();
            this._candidates = candidatesMap;
            candidates.forEach(value => {
                const addressKey = makeAddress(value.host, value.port);
                candidatesMap.set(addressKey, {
                    host: value.host,
                    port: value.port,
                    detail: value.detail,
                    pid: value.pid
                });
                if (removedCandidates.has(addressKey)) {
                    removedCandidates.delete(addressKey);
                }
                const forwardedValue = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, value.host, value.port);
                if (forwardedValue) {
                    forwardedValue.runningProcess = value.detail;
                    forwardedValue.hasRunningProcess = true;
                    forwardedValue.pid = value.pid;
                }
            });
            removedCandidates.forEach((_value, key) => {
                const parsedAddress = parseAddress(key);
                if (!parsedAddress) {
                    return;
                }
                const forwardedValue = mapHasAddressLocalhostOrAllInterfaces(this.forwarded, parsedAddress.host, parsedAddress.port);
                if (forwardedValue) {
                    forwardedValue.runningProcess = undefined;
                    forwardedValue.hasRunningProcess = false;
                    forwardedValue.pid = undefined;
                }
                const detectedValue = mapHasAddressLocalhostOrAllInterfaces(this.detected, parsedAddress.host, parsedAddress.port);
                if (detectedValue) {
                    detectedValue.runningProcess = undefined;
                    detectedValue.hasRunningProcess = false;
                    detectedValue.pid = undefined;
                }
            });
            return removedCandidates;
        }
        get candidates() {
            return this._candidates ? Array.from(this._candidates.values()) : [];
        }
        get candidatesOrUndefined() {
            return this._candidates ? this.candidates : undefined;
        }
        async updateAttributes() {
            var _a;
            // If the label changes in the attributes, we should update it.
            for (let forwarded of this.forwarded.values()) {
                const attributes = (_a = (await this.getAttributes([forwarded.remotePort], false))) === null || _a === void 0 ? void 0 : _a.get(forwarded.remotePort);
                if (attributes && attributes.label && attributes.label !== forwarded.name) {
                    await this.name(forwarded.remoteHost, forwarded.remotePort, attributes.label);
                }
            }
        }
        async getAttributes(ports, checkProviders = true) {
            const matchingCandidates = new Map();
            const pidToPortsMapping = new Map();
            ports.forEach(port => {
                var _a, _b;
                const matchingCandidate = mapHasAddressLocalhostOrAllInterfaces((_a = this._candidates) !== null && _a !== void 0 ? _a : new Map(), tunnel_1.LOCALHOST_ADDRESSES[0], port);
                if (matchingCandidate) {
                    matchingCandidates.set(port, matchingCandidate);
                    if (!pidToPortsMapping.has(matchingCandidate.pid)) {
                        pidToPortsMapping.set(matchingCandidate.pid, []);
                    }
                    (_b = pidToPortsMapping.get(matchingCandidate.pid)) === null || _b === void 0 ? void 0 : _b.push(port);
                }
            });
            const configAttributes = new Map();
            ports.forEach(port => {
                var _a;
                const attributes = this.configPortsAttributes.getAttributes(port, (_a = matchingCandidates.get(port)) === null || _a === void 0 ? void 0 : _a.detail);
                if (attributes) {
                    configAttributes.set(port, attributes);
                }
            });
            if ((this.portAttributesProviders.length === 0) || !checkProviders) {
                return (configAttributes.size > 0) ? configAttributes : undefined;
            }
            // Group calls to provide attributes by pid.
            const allProviderResults = await Promise.all((0, arrays_1.flatten)(this.portAttributesProviders.map(provider => {
                return Array.from(pidToPortsMapping.entries()).map(entry => {
                    const portGroup = entry[1];
                    const matchingCandidate = matchingCandidates.get(portGroup[0]);
                    return provider.providePortAttributes(portGroup, matchingCandidate === null || matchingCandidate === void 0 ? void 0 : matchingCandidate.pid, matchingCandidate === null || matchingCandidate === void 0 ? void 0 : matchingCandidate.detail, new cancellation_1.CancellationTokenSource().token);
                });
            })));
            const providedAttributes = new Map();
            allProviderResults.forEach(attributes => attributes.forEach(attribute => {
                if (attribute) {
                    providedAttributes.set(attribute.port, attribute);
                }
            }));
            if (!configAttributes && !providedAttributes) {
                return undefined;
            }
            // Merge. The config wins.
            const mergedAttributes = new Map();
            ports.forEach(port => {
                var _a;
                const config = configAttributes.get(port);
                const provider = providedAttributes.get(port);
                mergedAttributes.set(port, {
                    elevateIfNeeded: config === null || config === void 0 ? void 0 : config.elevateIfNeeded,
                    label: config === null || config === void 0 ? void 0 : config.label,
                    onAutoForward: (_a = config === null || config === void 0 ? void 0 : config.onAutoForward) !== null && _a !== void 0 ? _a : PortsAttributes.providedActionToAction(provider === null || provider === void 0 ? void 0 : provider.autoForwardAction)
                });
            });
            return mergedAttributes;
        }
        addAttributesProvider(provider) {
            this.portAttributesProviders.push(provider);
        }
    };
    TunnelModel = __decorate([
        __param(0, tunnel_1.ITunnelService),
        __param(1, storage_1.IStorageService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, log_1.ILogService)
    ], TunnelModel);
    exports.TunnelModel = TunnelModel;
    let RemoteExplorerService = class RemoteExplorerService {
        constructor(storageService, tunnelService, configurationService, environmentService, remoteAuthorityResolverService, workspaceContextService, logService) {
            this.storageService = storageService;
            this._targetType = [];
            this._onDidChangeTargetType = new event_1.Emitter();
            this.onDidChangeTargetType = this._onDidChangeTargetType.event;
            this._onDidChangeEditable = new event_1.Emitter();
            this.onDidChangeEditable = this._onDidChangeEditable.event;
            this._onEnabledPortsFeatures = new event_1.Emitter();
            this.onEnabledPortsFeatures = this._onEnabledPortsFeatures.event;
            this._portsFeaturesEnabled = false;
            this.namedProcesses = new Map();
            this._tunnelModel = new TunnelModel(tunnelService, storageService, configurationService, environmentService, remoteAuthorityResolverService, workspaceContextService, logService);
        }
        set targetType(name) {
            // Can just compare the first element of the array since there are no target overlaps
            const current = this._targetType.length > 0 ? this._targetType[0] : '';
            const newName = name.length > 0 ? name[0] : '';
            if (current !== newName) {
                this._targetType = name;
                this.storageService.store(exports.REMOTE_EXPLORER_TYPE_KEY, this._targetType.toString(), 1 /* WORKSPACE */, 0 /* USER */);
                this.storageService.store(exports.REMOTE_EXPLORER_TYPE_KEY, this._targetType.toString(), 0 /* GLOBAL */, 0 /* USER */);
                this._onDidChangeTargetType.fire(this._targetType);
            }
        }
        get targetType() {
            return this._targetType;
        }
        get tunnelModel() {
            return this._tunnelModel;
        }
        forward(remote, local, name, source, elevateIfNeeded, isPublic, restore) {
            return this.tunnelModel.forward(remote, local, name, source, elevateIfNeeded, isPublic, restore);
        }
        close(remote) {
            return this.tunnelModel.close(remote.host, remote.port);
        }
        setTunnelInformation(tunnelInformation) {
            this.tunnelModel.addEnvironmentTunnels(tunnelInformation === null || tunnelInformation === void 0 ? void 0 : tunnelInformation.environmentTunnels);
        }
        setEditable(tunnelItem, editId, data) {
            console.log('setting edit ' + data);
            if (!data) {
                this._editable = undefined;
            }
            else {
                this._editable = { tunnelItem, data, editId };
            }
            this._onDidChangeEditable.fire(tunnelItem ? { tunnel: tunnelItem, editId } : undefined);
        }
        getEditableData(tunnelItem, editId) {
            var _a;
            return (this._editable &&
                ((!tunnelItem && (tunnelItem === this._editable.tunnelItem)) ||
                    (tunnelItem && (((_a = this._editable.tunnelItem) === null || _a === void 0 ? void 0 : _a.remotePort) === tunnelItem.remotePort) && (this._editable.tunnelItem.remoteHost === tunnelItem.remoteHost)
                        && (this._editable.editId === editId)))) ?
                this._editable.data : undefined;
        }
        setCandidateFilter(filter) {
            if (!filter) {
                return {
                    dispose: () => { }
                };
            }
            this.tunnelModel.setCandidateFilter(filter);
            return {
                dispose: () => {
                    this.tunnelModel.setCandidateFilter(undefined);
                }
            };
        }
        onFoundNewCandidates(candidates) {
            this.tunnelModel.setCandidates(candidates);
        }
        restore() {
            return this.tunnelModel.restoreForwarded();
        }
        enablePortsFeatures() {
            this._portsFeaturesEnabled = true;
            this._onEnabledPortsFeatures.fire();
        }
        get portsFeaturesEnabled() {
            return this._portsFeaturesEnabled;
        }
    };
    RemoteExplorerService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, tunnel_1.ITunnelService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, environmentService_1.IWorkbenchEnvironmentService),
        __param(4, remoteAuthorityResolver_1.IRemoteAuthorityResolverService),
        __param(5, workspace_1.IWorkspaceContextService),
        __param(6, log_1.ILogService)
    ], RemoteExplorerService);
    (0, extensions_1.registerSingleton)(exports.IRemoteExplorerService, RemoteExplorerService, true);
});
//# sourceMappingURL=remoteExplorerService.js.map