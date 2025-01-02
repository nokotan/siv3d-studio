"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.looksLikeMarkdownPath = looksLikeMarkdownPath;
exports.isMarkdownFile = isMarkdownFile;
const vscode_uri_1 = require("vscode-uri");
function looksLikeMarkdownPath(config, resolvedHrefPath) {
    return config.markdownFileExtensions.includes(vscode_uri_1.Utils.extname(resolvedHrefPath).toLowerCase().replace('.', ''));
}
function isMarkdownFile(document) {
    return document.languageId === 'markdown';
}
//# sourceMappingURL=file.js.map