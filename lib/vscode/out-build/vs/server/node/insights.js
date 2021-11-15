define(["require", "exports", "https", "http", "os"], function (require, exports, https, http, os) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TelemetryClient = void 0;
    class Channel {
        get _sender() {
            throw new Error('unimplemented');
        }
        get _buffer() {
            throw new Error('unimplemented');
        }
        setUseDiskRetryCaching() {
            throw new Error('unimplemented');
        }
        send() {
            throw new Error('unimplemented');
        }
        triggerSend() {
            throw new Error('unimplemented');
        }
    }
    class TelemetryClient {
        constructor() {
            this.context = undefined;
            this.commonProperties = undefined;
            this.config = {};
            this.channel = new Channel();
        }
        addTelemetryProcessor() {
            throw new Error('unimplemented');
        }
        clearTelemetryProcessors() {
            throw new Error('unimplemented');
        }
        runTelemetryProcessors() {
            throw new Error('unimplemented');
        }
        trackTrace() {
            throw new Error('unimplemented');
        }
        trackMetric() {
            throw new Error('unimplemented');
        }
        trackException() {
            throw new Error('unimplemented');
        }
        trackRequest() {
            throw new Error('unimplemented');
        }
        trackDependency() {
            throw new Error('unimplemented');
        }
        track() {
            throw new Error('unimplemented');
        }
        trackNodeHttpRequestSync() {
            throw new Error('unimplemented');
        }
        trackNodeHttpRequest() {
            throw new Error('unimplemented');
        }
        trackNodeHttpDependency() {
            throw new Error('unimplemented');
        }
        trackEvent(options) {
            if (!options.properties) {
                options.properties = {};
            }
            if (!options.measurements) {
                options.measurements = {};
            }
            try {
                const cpus = os.cpus();
                options.measurements.cores = cpus.length;
                options.properties['common.cpuModel'] = cpus[0].model;
            }
            catch (error) { }
            try {
                options.measurements.memoryFree = os.freemem();
                options.measurements.memoryTotal = os.totalmem();
            }
            catch (error) { }
            try {
                options.properties['common.shell'] = os.userInfo().shell;
                options.properties['common.release'] = os.release();
                options.properties['common.arch'] = os.arch();
            }
            catch (error) { }
            try {
                const url = process.env.TELEMETRY_URL || 'https://v1.telemetry.coder.com/track';
                const request = (/^http:/.test(url) ? http : https).request(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                request.on('error', () => { });
                request.write(JSON.stringify(options));
                request.end();
            }
            catch (error) { }
        }
        flush(options) {
            if (options.callback) {
                options.callback('');
            }
        }
    }
    exports.TelemetryClient = TelemetryClient;
});
//# sourceMappingURL=insights.js.map