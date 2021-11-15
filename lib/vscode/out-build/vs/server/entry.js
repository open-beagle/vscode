define(["require", "exports", "@coder/logger", "vs/base/common/errors", "vs/base/node/proxy_agent", "vs/server/node/logger", "vs/server/node/marketplace", "vs/server/node/server"], function (require, exports, logger_1, errors_1, proxyAgent, logger_2, marketplace_1, server_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, errors_1.setUnexpectedErrorHandler)((error) => {
        logger_2.logger.warn('Uncaught error', (0, logger_1.field)('error', error instanceof Error ? error.message : error));
    });
    (0, marketplace_1.enableCustomMarketplace)();
    proxyAgent.monkeyPatch(true);
    /**
     * Ensure we control when the process exits.
     */
    const exit = process.exit;
    process.exit = function (code) {
        logger_2.logger.warn(`process.exit() was prevented: ${code || 'unknown code'}.`);
    };
    // Kill VS Code if the parent process dies.
    if (typeof process.env.CODE_SERVER_PARENT_PID !== 'undefined') {
        const parentPid = parseInt(process.env.CODE_SERVER_PARENT_PID, 10);
        setInterval(() => {
            try {
                process.kill(parentPid, 0); // Throws an exception if the process doesn't exist anymore.
            }
            catch (e) {
                exit();
            }
        }, 5000);
    }
    else {
        logger_2.logger.error('no parent process');
        exit(1);
    }
    const vscode = new server_1.Vscode();
    const send = (message) => {
        if (!process.send) {
            throw new Error('not spawned with IPC');
        }
        process.send(message);
    };
    // Wait for the init message then start up VS Code. Subsequent messages will
    // return new workbench options without starting a new instance.
    process.on('message', async (message, socket) => {
        logger_2.logger.debug('got message from code-server', (0, logger_1.field)('type', message.type));
        logger_2.logger.trace('code-server message content', (0, logger_1.field)('message', message));
        switch (message.type) {
            case 'init':
                try {
                    const options = await vscode.initialize(message.options);
                    send({ type: 'options', id: message.id, options });
                }
                catch (error) {
                    logger_2.logger.error(error.message);
                    logger_2.logger.error(error.stack);
                    exit(1);
                }
                break;
            case 'cli':
                try {
                    await vscode.cli(message.args);
                    exit(0);
                }
                catch (error) {
                    logger_2.logger.error(error.message);
                    logger_2.logger.error(error.stack);
                    exit(1);
                }
                break;
            case 'socket':
                vscode.handleWebSocket(socket, message.query, message.permessageDeflate);
                break;
        }
    });
    if (!process.send) {
        logger_2.logger.error('not spawned with IPC');
        exit(1);
    }
    else {
        // This lets the parent know the child is ready to receive messages.
        send({ type: 'ready' });
    }
});
//# sourceMappingURL=entry.js.map