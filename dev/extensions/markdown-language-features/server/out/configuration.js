"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationManager = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const dispose_1 = require("./util/dispose");
class ConfigurationManager extends dispose_1.Disposable {
    constructor(connection) {
        super();
        this._onDidChangeConfiguration = this._register(new vscode_languageserver_1.Emitter());
        this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
        // The settings have changed. Is send on server activation as well.
        this._register(connection.onDidChangeConfiguration((change) => {
            this._settings = change.settings;
            this._onDidChangeConfiguration.fire(this._settings);
        }));
    }
    getSettings() {
        return this._settings;
    }
}
exports.ConfigurationManager = ConfigurationManager;
//# sourceMappingURL=configuration.js.map