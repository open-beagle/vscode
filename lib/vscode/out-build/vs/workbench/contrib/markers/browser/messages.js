/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/markers/browser/messages", "vs/base/common/resources", "vs/platform/markers/common/markers"], function (require, exports, nls, resources_1, markers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Messages {
    }
    exports.default = Messages;
    Messages.MARKERS_PANEL_TOGGLE_LABEL = nls.localize(0, null);
    Messages.MARKERS_PANEL_SHOW_LABEL = nls.localize(1, null);
    Messages.PROBLEMS_PANEL_CONFIGURATION_TITLE = nls.localize(2, null);
    Messages.PROBLEMS_PANEL_CONFIGURATION_AUTO_REVEAL = nls.localize(3, null);
    Messages.PROBLEMS_PANEL_CONFIGURATION_SHOW_CURRENT_STATUS = nls.localize(4, null);
    Messages.MARKERS_PANEL_TITLE_PROBLEMS = nls.localize(5, null);
    Messages.MARKERS_PANEL_NO_PROBLEMS_BUILT = nls.localize(6, null);
    Messages.MARKERS_PANEL_NO_PROBLEMS_ACTIVE_FILE_BUILT = nls.localize(7, null);
    Messages.MARKERS_PANEL_NO_PROBLEMS_FILTERS = nls.localize(8, null);
    Messages.MARKERS_PANEL_ACTION_TOOLTIP_MORE_FILTERS = nls.localize(9, null);
    Messages.MARKERS_PANEL_FILTER_LABEL_SHOW_ERRORS = nls.localize(10, null);
    Messages.MARKERS_PANEL_FILTER_LABEL_SHOW_WARNINGS = nls.localize(11, null);
    Messages.MARKERS_PANEL_FILTER_LABEL_SHOW_INFOS = nls.localize(12, null);
    Messages.MARKERS_PANEL_FILTER_LABEL_EXCLUDED_FILES = nls.localize(13, null);
    Messages.MARKERS_PANEL_FILTER_LABEL_ACTIVE_FILE = nls.localize(14, null);
    Messages.MARKERS_PANEL_ACTION_TOOLTIP_FILTER = nls.localize(15, null);
    Messages.MARKERS_PANEL_ACTION_TOOLTIP_QUICKFIX = nls.localize(16, null);
    Messages.MARKERS_PANEL_FILTER_ARIA_LABEL = nls.localize(17, null);
    Messages.MARKERS_PANEL_FILTER_PLACEHOLDER = nls.localize(18, null);
    Messages.MARKERS_PANEL_FILTER_ERRORS = nls.localize(19, null);
    Messages.MARKERS_PANEL_FILTER_WARNINGS = nls.localize(20, null);
    Messages.MARKERS_PANEL_FILTER_INFOS = nls.localize(21, null);
    Messages.MARKERS_PANEL_SINGLE_ERROR_LABEL = nls.localize(22, null);
    Messages.MARKERS_PANEL_MULTIPLE_ERRORS_LABEL = (noOfErrors) => { return nls.localize(23, null, '' + noOfErrors); };
    Messages.MARKERS_PANEL_SINGLE_WARNING_LABEL = nls.localize(24, null);
    Messages.MARKERS_PANEL_MULTIPLE_WARNINGS_LABEL = (noOfWarnings) => { return nls.localize(25, null, '' + noOfWarnings); };
    Messages.MARKERS_PANEL_SINGLE_INFO_LABEL = nls.localize(26, null);
    Messages.MARKERS_PANEL_MULTIPLE_INFOS_LABEL = (noOfInfos) => { return nls.localize(27, null, '' + noOfInfos); };
    Messages.MARKERS_PANEL_SINGLE_UNKNOWN_LABEL = nls.localize(28, null);
    Messages.MARKERS_PANEL_MULTIPLE_UNKNOWNS_LABEL = (noOfUnknowns) => { return nls.localize(29, null, '' + noOfUnknowns); };
    Messages.MARKERS_PANEL_AT_LINE_COL_NUMBER = (ln, col) => { return nls.localize(30, null, '' + ln, '' + col); };
    Messages.MARKERS_TREE_ARIA_LABEL_RESOURCE = (noOfProblems, fileName, folder) => { return nls.localize(31, null, noOfProblems, fileName, folder); };
    Messages.MARKERS_TREE_ARIA_LABEL_MARKER = (marker) => {
        const relatedInformationMessage = marker.relatedInformation.length ? nls.localize(32, null, marker.relatedInformation.length) : '';
        switch (marker.marker.severity) {
            case markers_1.MarkerSeverity.Error:
                return marker.marker.source ? nls.localize(33, null, marker.marker.source, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage)
                    : nls.localize(34, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage);
            case markers_1.MarkerSeverity.Warning:
                return marker.marker.source ? nls.localize(35, null, marker.marker.source, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage)
                    : nls.localize(36, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage, relatedInformationMessage);
            case markers_1.MarkerSeverity.Info:
                return marker.marker.source ? nls.localize(37, null, marker.marker.source, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage)
                    : nls.localize(38, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage);
            default:
                return marker.marker.source ? nls.localize(39, null, marker.marker.source, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage)
                    : nls.localize(40, null, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage);
        }
    };
    Messages.MARKERS_TREE_ARIA_LABEL_RELATED_INFORMATION = (relatedInformation) => nls.localize(41, null, relatedInformation.message, relatedInformation.startLineNumber, relatedInformation.startColumn, (0, resources_1.basename)(relatedInformation.resource));
    Messages.SHOW_ERRORS_WARNINGS_ACTION_LABEL = nls.localize(42, null);
});
//# sourceMappingURL=messages.js.map