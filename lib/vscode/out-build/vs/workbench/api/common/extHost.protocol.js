/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/services/extensions/common/proxyIdentifier", "vs/base/common/marshalling"], function (require, exports, uri_1, proxyIdentifier_1, marshalling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostContext = exports.MainContext = exports.ExtHostTestingResource = exports.reviveWorkspaceEditDto = exports.WorkspaceEditType = exports.ISuggestResultDtoField = exports.ISuggestDataDtoField = exports.IdObject = exports.ObjectIdentifier = exports.CandidatePortSource = exports.NotebookEditorRevealType = exports.CellOutputKind = exports.CellKind = exports.WebviewMessageArrayBufferViewType = exports.WebviewEditorCapabilities = exports.TextEditorRevealType = exports.UIKind = void 0;
    var UIKind;
    (function (UIKind) {
        UIKind[UIKind["Desktop"] = 1] = "Desktop";
        UIKind[UIKind["Web"] = 2] = "Web";
    })(UIKind = exports.UIKind || (exports.UIKind = {}));
    var TextEditorRevealType;
    (function (TextEditorRevealType) {
        TextEditorRevealType[TextEditorRevealType["Default"] = 0] = "Default";
        TextEditorRevealType[TextEditorRevealType["InCenter"] = 1] = "InCenter";
        TextEditorRevealType[TextEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
        TextEditorRevealType[TextEditorRevealType["AtTop"] = 3] = "AtTop";
    })(TextEditorRevealType = exports.TextEditorRevealType || (exports.TextEditorRevealType = {}));
    var WebviewEditorCapabilities;
    (function (WebviewEditorCapabilities) {
        WebviewEditorCapabilities[WebviewEditorCapabilities["Editable"] = 0] = "Editable";
        WebviewEditorCapabilities[WebviewEditorCapabilities["SupportsHotExit"] = 1] = "SupportsHotExit";
    })(WebviewEditorCapabilities = exports.WebviewEditorCapabilities || (exports.WebviewEditorCapabilities = {}));
    var WebviewMessageArrayBufferViewType;
    (function (WebviewMessageArrayBufferViewType) {
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Int8Array"] = 1] = "Int8Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Uint8Array"] = 2] = "Uint8Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Uint8ClampedArray"] = 3] = "Uint8ClampedArray";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Int16Array"] = 4] = "Int16Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Uint16Array"] = 5] = "Uint16Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Int32Array"] = 6] = "Int32Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Uint32Array"] = 7] = "Uint32Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Float32Array"] = 8] = "Float32Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["Float64Array"] = 9] = "Float64Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["BigInt64Array"] = 10] = "BigInt64Array";
        WebviewMessageArrayBufferViewType[WebviewMessageArrayBufferViewType["BigUint64Array"] = 11] = "BigUint64Array";
    })(WebviewMessageArrayBufferViewType = exports.WebviewMessageArrayBufferViewType || (exports.WebviewMessageArrayBufferViewType = {}));
    var CellKind;
    (function (CellKind) {
        CellKind[CellKind["Markdown"] = 1] = "Markdown";
        CellKind[CellKind["Code"] = 2] = "Code";
    })(CellKind = exports.CellKind || (exports.CellKind = {}));
    var CellOutputKind;
    (function (CellOutputKind) {
        CellOutputKind[CellOutputKind["Text"] = 1] = "Text";
        CellOutputKind[CellOutputKind["Error"] = 2] = "Error";
        CellOutputKind[CellOutputKind["Rich"] = 3] = "Rich";
    })(CellOutputKind = exports.CellOutputKind || (exports.CellOutputKind = {}));
    var NotebookEditorRevealType;
    (function (NotebookEditorRevealType) {
        NotebookEditorRevealType[NotebookEditorRevealType["Default"] = 0] = "Default";
        NotebookEditorRevealType[NotebookEditorRevealType["InCenter"] = 1] = "InCenter";
        NotebookEditorRevealType[NotebookEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
        NotebookEditorRevealType[NotebookEditorRevealType["AtTop"] = 3] = "AtTop";
    })(NotebookEditorRevealType = exports.NotebookEditorRevealType || (exports.NotebookEditorRevealType = {}));
    var CandidatePortSource;
    (function (CandidatePortSource) {
        CandidatePortSource[CandidatePortSource["None"] = 0] = "None";
        CandidatePortSource[CandidatePortSource["Process"] = 1] = "Process";
        CandidatePortSource[CandidatePortSource["Output"] = 2] = "Output";
    })(CandidatePortSource = exports.CandidatePortSource || (exports.CandidatePortSource = {}));
    var ObjectIdentifier;
    (function (ObjectIdentifier) {
        ObjectIdentifier.name = '$ident';
        function mixin(obj, id) {
            Object.defineProperty(obj, ObjectIdentifier.name, { value: id, enumerable: true });
            return obj;
        }
        ObjectIdentifier.mixin = mixin;
        function of(obj) {
            return obj[ObjectIdentifier.name];
        }
        ObjectIdentifier.of = of;
    })(ObjectIdentifier = exports.ObjectIdentifier || (exports.ObjectIdentifier = {}));
    class IdObject {
        static mixin(object) {
            object._id = IdObject._n++;
            return object;
        }
    }
    exports.IdObject = IdObject;
    IdObject._n = 0;
    var ISuggestDataDtoField;
    (function (ISuggestDataDtoField) {
        ISuggestDataDtoField["label"] = "a";
        ISuggestDataDtoField["kind"] = "b";
        ISuggestDataDtoField["detail"] = "c";
        ISuggestDataDtoField["documentation"] = "d";
        ISuggestDataDtoField["sortText"] = "e";
        ISuggestDataDtoField["filterText"] = "f";
        ISuggestDataDtoField["preselect"] = "g";
        ISuggestDataDtoField["insertText"] = "h";
        ISuggestDataDtoField["insertTextRules"] = "i";
        ISuggestDataDtoField["range"] = "j";
        ISuggestDataDtoField["commitCharacters"] = "k";
        ISuggestDataDtoField["additionalTextEdits"] = "l";
        ISuggestDataDtoField["command"] = "m";
        ISuggestDataDtoField["kindModifier"] = "n";
        // to merge into label
        ISuggestDataDtoField["label2"] = "o";
    })(ISuggestDataDtoField = exports.ISuggestDataDtoField || (exports.ISuggestDataDtoField = {}));
    var ISuggestResultDtoField;
    (function (ISuggestResultDtoField) {
        ISuggestResultDtoField["defaultRanges"] = "a";
        ISuggestResultDtoField["completions"] = "b";
        ISuggestResultDtoField["isIncomplete"] = "c";
        ISuggestResultDtoField["duration"] = "d";
    })(ISuggestResultDtoField = exports.ISuggestResultDtoField || (exports.ISuggestResultDtoField = {}));
    var WorkspaceEditType;
    (function (WorkspaceEditType) {
        WorkspaceEditType[WorkspaceEditType["File"] = 1] = "File";
        WorkspaceEditType[WorkspaceEditType["Text"] = 2] = "Text";
        WorkspaceEditType[WorkspaceEditType["Cell"] = 3] = "Cell";
    })(WorkspaceEditType = exports.WorkspaceEditType || (exports.WorkspaceEditType = {}));
    function reviveWorkspaceEditDto(data) {
        if (data && data.edits) {
            for (const edit of data.edits) {
                if (typeof edit.resource === 'object') {
                    edit.resource = uri_1.URI.revive(edit.resource);
                }
                else {
                    edit.newUri = uri_1.URI.revive(edit.newUri);
                    edit.oldUri = uri_1.URI.revive(edit.oldUri);
                }
                if (edit.metadata && edit.metadata.iconPath) {
                    edit.metadata = (0, marshalling_1.revive)(edit.metadata);
                }
            }
        }
        return data;
    }
    exports.reviveWorkspaceEditDto = reviveWorkspaceEditDto;
    var ExtHostTestingResource;
    (function (ExtHostTestingResource) {
        ExtHostTestingResource[ExtHostTestingResource["Workspace"] = 0] = "Workspace";
        ExtHostTestingResource[ExtHostTestingResource["TextDocument"] = 1] = "TextDocument";
    })(ExtHostTestingResource = exports.ExtHostTestingResource || (exports.ExtHostTestingResource = {}));
    // --- proxy identifiers
    exports.MainContext = {
        MainThreadAuthentication: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadAuthentication'),
        MainThreadBulkEdits: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadBulkEdits'),
        MainThreadClipboard: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadClipboard'),
        MainThreadCommands: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadCommands'),
        MainThreadComments: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadComments'),
        MainThreadConfiguration: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadConfiguration'),
        MainThreadConsole: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadConsole'),
        MainThreadDebugService: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadDebugService'),
        MainThreadDecorations: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadDecorations'),
        MainThreadDiagnostics: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadDiagnostics'),
        MainThreadDialogs: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadDiaglogs'),
        MainThreadDocuments: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadDocuments'),
        MainThreadDocumentContentProviders: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadDocumentContentProviders'),
        MainThreadTextEditors: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadTextEditors'),
        MainThreadEditorInsets: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadEditorInsets'),
        MainThreadEditorTabs: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadEditorTabs'),
        MainThreadErrors: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadErrors'),
        MainThreadTreeViews: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadTreeViews'),
        MainThreadDownloadService: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadDownloadService'),
        MainThreadKeytar: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadKeytar'),
        MainThreadLanguageFeatures: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadLanguageFeatures'),
        MainThreadLanguages: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadLanguages'),
        MainThreadLog: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThread'),
        MainThreadMessageService: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadMessageService'),
        MainThreadOutputService: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadOutputService'),
        MainThreadProgress: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadProgress'),
        MainThreadQuickOpen: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadQuickOpen'),
        MainThreadStatusBar: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadStatusBar'),
        MainThreadSecretState: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadSecretState'),
        MainThreadStorage: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadStorage'),
        MainThreadTelemetry: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadTelemetry'),
        MainThreadTerminalService: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadTerminalService'),
        MainThreadWebviews: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadWebviews'),
        MainThreadWebviewPanels: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadWebviewPanels'),
        MainThreadWebviewViews: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadWebviewViews'),
        MainThreadCustomEditors: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadCustomEditors'),
        MainThreadUrls: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadUrls'),
        MainThreadUriOpeners: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadUriOpeners'),
        MainThreadWorkspace: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadWorkspace'),
        MainThreadFileSystem: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadFileSystem'),
        MainThreadExtensionService: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadExtensionService'),
        MainThreadSCM: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadSCM'),
        MainThreadSearch: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadSearch'),
        MainThreadTask: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadTask'),
        MainThreadWindow: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadWindow'),
        MainThreadLabelService: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadLabelService'),
        MainThreadNotebook: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadNotebook'),
        MainThreadNotebookDocuments: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadNotebookDocumentsShape'),
        MainThreadNotebookEditors: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadNotebookEditorsShape'),
        MainThreadNotebookKernels: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadNotebookKernels'),
        MainThreadTheming: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadTheming'),
        MainThreadTunnelService: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadTunnelService'),
        MainThreadTimeline: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadTimeline'),
        MainThreadTesting: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('MainThreadTesting'),
    };
    exports.ExtHostContext = {
        ExtHostCommands: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostCommands'),
        ExtHostConfiguration: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostConfiguration'),
        ExtHostDiagnostics: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostDiagnostics'),
        ExtHostDebugService: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostDebugService'),
        ExtHostDecorations: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostDecorations'),
        ExtHostDocumentsAndEditors: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostDocumentsAndEditors'),
        ExtHostDocuments: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostDocuments'),
        ExtHostDocumentContentProviders: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostDocumentContentProviders'),
        ExtHostDocumentSaveParticipant: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostDocumentSaveParticipant'),
        ExtHostEditors: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostEditors'),
        ExtHostTreeViews: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostTreeViews'),
        ExtHostFileSystem: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostFileSystem'),
        ExtHostFileSystemInfo: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostFileSystemInfo'),
        ExtHostFileSystemEventService: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostFileSystemEventService'),
        ExtHostLanguageFeatures: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostLanguageFeatures'),
        ExtHostQuickOpen: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostQuickOpen'),
        ExtHostExtensionService: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostExtensionService'),
        ExtHostLogService: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostLogService'),
        ExtHostTerminalService: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostTerminalService'),
        ExtHostSCM: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostSCM'),
        ExtHostSearch: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostSearch'),
        ExtHostTask: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostTask'),
        ExtHostWorkspace: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostWorkspace'),
        ExtHostWindow: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostWindow'),
        ExtHostWebviews: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostWebviews'),
        ExtHostWebviewPanels: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostWebviewPanels'),
        ExtHostCustomEditors: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostCustomEditors'),
        ExtHostWebviewViews: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostWebviewViews'),
        ExtHostEditorInsets: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostEditorInsets'),
        ExtHostEditorTabs: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostEditorTabs'),
        ExtHostProgress: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostProgress'),
        ExtHostComments: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostComments'),
        ExtHostSecretState: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostSecretState'),
        ExtHostStorage: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostStorage'),
        ExtHostUrls: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostUrls'),
        ExtHostUriOpeners: (0, proxyIdentifier_1.createExtHostContextProxyIdentifier)('ExtHostUriOpeners'),
        ExtHostOutputService: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostOutputService'),
        ExtHosLabelService: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostLabelService'),
        ExtHostNotebook: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostNotebook'),
        ExtHostNotebookKernels: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostNotebookKernels'),
        ExtHostTheming: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostTheming'),
        ExtHostTunnelService: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostTunnelService'),
        ExtHostAuthentication: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostAuthentication'),
        ExtHostTimeline: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostTimeline'),
        ExtHostTesting: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostTesting'),
        ExtHostTelemetry: (0, proxyIdentifier_1.createMainContextProxyIdentifier)('ExtHostTelemetry'),
    };
});
//# sourceMappingURL=extHost.protocol.js.map