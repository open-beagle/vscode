define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TelemetryChannelClient = exports.TelemetryChannel = void 0;
    class TelemetryChannel {
        constructor(service) {
            this.service = service;
        }
        listen(_, event) {
            throw new Error(`Invalid listen ${event}`);
        }
        call(_, command, args) {
            switch (command) {
                case 'publicLog': return this.service.publicLog(args[0], args[1], args[2]);
                case 'publicLog2': return this.service.publicLog2(args[0], args[1], args[2]);
                case 'publicLogError': return this.service.publicLogError(args[0], args[1]);
                case 'publicLogError2': return this.service.publicLogError2(args[0], args[1]);
                case 'setEnabled': return Promise.resolve(this.service.setEnabled(args[0]));
                case 'getTelemetryInfo': return this.service.getTelemetryInfo();
                case 'setExperimentProperty': return Promise.resolve(this.service.setExperimentProperty(args[0], args[1]));
            }
            throw new Error(`Invalid call ${command}`);
        }
    }
    exports.TelemetryChannel = TelemetryChannel;
    class TelemetryChannelClient {
        constructor(channel) {
            this.channel = channel;
            // These don't matter; telemetry is sent to the Node side which decides
            // whether to send the telemetry event.
            this.isOptedIn = true;
            this.sendErrorTelemetry = true;
        }
        publicLog(eventName, data, anonymizeFilePaths) {
            return this.channel.call('publicLog', [eventName, data, anonymizeFilePaths]);
        }
        publicLog2(eventName, data, anonymizeFilePaths) {
            return this.channel.call('publicLog2', [eventName, data, anonymizeFilePaths]);
        }
        publicLogError(errorEventName, data) {
            return this.channel.call('publicLogError', [errorEventName, data]);
        }
        publicLogError2(eventName, data) {
            return this.channel.call('publicLogError2', [eventName, data]);
        }
        setEnabled(value) {
            this.channel.call('setEnable', [value]);
        }
        getTelemetryInfo() {
            return this.channel.call('getTelemetryInfo');
        }
        setExperimentProperty(name, value) {
            this.channel.call('setExperimentProperty', [name, value]);
        }
    }
    exports.TelemetryChannelClient = TelemetryChannelClient;
});
//# sourceMappingURL=telemetry.js.map