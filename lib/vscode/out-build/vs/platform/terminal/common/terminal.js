/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FlowControlConstants = exports.LocalReconnectConstants = exports.HeartbeatConstants = exports.IPtyService = exports.ILocalTerminalService = exports.TerminalIpcChannels = exports.WindowsShellType = void 0;
    var WindowsShellType;
    (function (WindowsShellType) {
        WindowsShellType["CommandPrompt"] = "cmd";
        WindowsShellType["PowerShell"] = "pwsh";
        WindowsShellType["Wsl"] = "wsl";
        WindowsShellType["GitBash"] = "gitbash";
    })(WindowsShellType = exports.WindowsShellType || (exports.WindowsShellType = {}));
    var TerminalIpcChannels;
    (function (TerminalIpcChannels) {
        /**
         * Communicates between the renderer process and shared process.
         */
        TerminalIpcChannels["LocalPty"] = "localPty";
        /**
         * Communicates between the shared process and the pty host process.
         */
        TerminalIpcChannels["PtyHost"] = "ptyHost";
        /**
         * Deals with logging from the pty host process.
         */
        TerminalIpcChannels["Log"] = "log";
        /**
         * Enables the detection of unresponsive pty hosts.
         */
        TerminalIpcChannels["Heartbeat"] = "heartbeat";
    })(TerminalIpcChannels = exports.TerminalIpcChannels || (exports.TerminalIpcChannels = {}));
    exports.ILocalTerminalService = (0, instantiation_1.createDecorator)('localTerminalService');
    exports.IPtyService = (0, instantiation_1.createDecorator)('ptyService');
    var HeartbeatConstants;
    (function (HeartbeatConstants) {
        /**
         * The duration between heartbeats
         */
        HeartbeatConstants[HeartbeatConstants["BeatInterval"] = 5000] = "BeatInterval";
        /**
         * Defines a multiplier for BeatInterval for how long to wait before starting the second wait
         * timer.
         */
        HeartbeatConstants[HeartbeatConstants["FirstWaitMultiplier"] = 1.2] = "FirstWaitMultiplier";
        /**
         * Defines a multiplier for BeatInterval for how long to wait before telling the user about
         * non-responsiveness. The second timer is to avoid informing the user incorrectly when waking
         * the computer up from sleep
         */
        HeartbeatConstants[HeartbeatConstants["SecondWaitMultiplier"] = 1] = "SecondWaitMultiplier";
        /**
         * How long to wait before telling the user about non-responsiveness when they try to create a
         * process. This short circuits the standard wait timeouts to tell the user sooner and only
         * create process is handled to avoid additional perf overhead.
         */
        HeartbeatConstants[HeartbeatConstants["CreateProcessTimeout"] = 5000] = "CreateProcessTimeout";
    })(HeartbeatConstants = exports.HeartbeatConstants || (exports.HeartbeatConstants = {}));
    var LocalReconnectConstants;
    (function (LocalReconnectConstants) {
        /**
         * If there is no reconnection within this time-frame, consider the connection permanently closed...
        */
        LocalReconnectConstants[LocalReconnectConstants["ReconnectionGraceTime"] = 60000] = "ReconnectionGraceTime";
        /**
         * Maximal grace time between the first and the last reconnection...
        */
        LocalReconnectConstants[LocalReconnectConstants["ReconnectionShortGraceTime"] = 6000] = "ReconnectionShortGraceTime";
    })(LocalReconnectConstants = exports.LocalReconnectConstants || (exports.LocalReconnectConstants = {}));
    var FlowControlConstants;
    (function (FlowControlConstants) {
        /**
         * The number of _unacknowledged_ chars to have been sent before the pty is paused in order for
         * the client to catch up.
         */
        FlowControlConstants[FlowControlConstants["HighWatermarkChars"] = 100000] = "HighWatermarkChars";
        /**
         * After flow control pauses the pty for the client the catch up, this is the number of
         * _unacknowledged_ chars to have been caught up to on the client before resuming the pty again.
         * This is used to attempt to prevent pauses in the flowing data; ideally while the pty is
         * paused the number of unacknowledged chars would always be greater than 0 or the client will
         * appear to stutter. In reality this balance is hard to accomplish though so heavy commands
         * will likely pause as latency grows, not flooding the connection is the important thing as
         * it's shared with other core functionality.
         */
        FlowControlConstants[FlowControlConstants["LowWatermarkChars"] = 5000] = "LowWatermarkChars";
        /**
         * The number characters that are accumulated on the client side before sending an ack event.
         * This must be less than or equal to LowWatermarkChars or the terminal max never unpause.
         */
        FlowControlConstants[FlowControlConstants["CharCountAckSize"] = 5000] = "CharCountAckSize";
    })(FlowControlConstants = exports.FlowControlConstants || (exports.FlowControlConstants = {}));
});
//# sourceMappingURL=terminal.js.map