"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogFunctionLogger = void 0;
const md = require("vscode-markdown-languageservice");
const dispose_1 = require("./util/dispose");
class LogFunctionLogger extends dispose_1.Disposable {
    static now() {
        const now = new Date();
        return String(now.getUTCHours()).padStart(2, '0')
            + ':' + String(now.getMinutes()).padStart(2, '0')
            + ':' + String(now.getUTCSeconds()).padStart(2, '0') + '.' + String(now.getMilliseconds()).padStart(3, '0');
    }
    static data2String(data) {
        if (data instanceof Error) {
            if (typeof data.stack === 'string') {
                return data.stack;
            }
            return data.message;
        }
        if (typeof data === 'string') {
            return data;
        }
        return JSON.stringify(data, undefined, 2);
    }
    constructor(_logFn, _config) {
        super();
        this._logFn = _logFn;
        this._config = _config;
        this._register(this._config.onDidChangeConfiguration(() => {
            this._logLevel = LogFunctionLogger.readLogLevel(this._config);
        }));
        this._logLevel = LogFunctionLogger.readLogLevel(this._config);
    }
    static readLogLevel(config) {
        switch (config.getSettings()?.markdown.server.log) {
            case 'trace': return md.LogLevel.Trace;
            case 'debug': return md.LogLevel.Debug;
            case 'off':
            default:
                return md.LogLevel.Off;
        }
    }
    get level() { return this._logLevel; }
    log(level, message, data) {
        if (this.level < level) {
            return;
        }
        this.appendLine(`[${this.toLevelLabel(level)} ${LogFunctionLogger.now()}] ${message}`);
        if (data) {
            this.appendLine(LogFunctionLogger.data2String(data));
        }
    }
    toLevelLabel(level) {
        switch (level) {
            case md.LogLevel.Off: return 'Off';
            case md.LogLevel.Debug: return 'Debug';
            case md.LogLevel.Trace: return 'Trace';
        }
    }
    appendLine(value) {
        this._logFn(value);
    }
}
exports.LogFunctionLogger = LogFunctionLogger;
//# sourceMappingURL=logging.js.map