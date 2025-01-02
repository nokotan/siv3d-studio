"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.startVsCodeServer = startVsCodeServer;
exports.startServer = startServer;
const l10n = require("@vscode/l10n");
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const md = require("vscode-markdown-languageservice");
const vscode_uri_1 = require("vscode-uri");
const config_1 = require("./config");
const configuration_1 = require("./configuration");
const diagnostics_1 = require("./languageFeatures/diagnostics");
const logging_1 = require("./logging");
const protocol = require("./protocol");
const workspace_1 = require("./workspace");
const organizeLinkDefKind = 'source.organizeLinkDefinitions';
async function startVsCodeServer(connection) {
    const configurationManager = new configuration_1.ConfigurationManager(connection);
    const logger = new logging_1.LogFunctionLogger(connection.console.log.bind(connection.console), configurationManager);
    const parser = new class {
        constructor() {
            this.slugifier = md.githubSlugifier;
        }
        tokenize(document) {
            return connection.sendRequest(protocol.parse, { uri: document.uri.toString() });
        }
    };
    const documents = new vscode_languageserver_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
    const notebooks = new vscode_languageserver_1.NotebookDocuments(documents);
    const workspaceFactory = ({ connection, config, workspaceFolders }) => {
        const workspace = new workspace_1.VsCodeClientWorkspace(connection, config, documents, notebooks, logger);
        workspace.workspaceFolders = (workspaceFolders ?? []).map(x => vscode_uri_1.URI.parse(x.uri));
        return workspace;
    };
    return startServer(connection, { documents, notebooks, configurationManager, logger, parser, workspaceFactory });
}
async function startServer(connection, serverConfig) {
    const { documents, notebooks } = serverConfig;
    let mdLs;
    connection.onInitialize((params) => {
        const initOptions = params.initializationOptions;
        const mdConfig = (0, config_1.getLsConfiguration)(initOptions ?? {});
        const workspace = serverConfig.workspaceFactory({ connection, config: mdConfig, workspaceFolders: params.workspaceFolders });
        mdLs = md.createLanguageService({
            workspace,
            parser: serverConfig.parser,
            logger: serverConfig.logger,
            ...mdConfig,
            get preferredMdPathExtensionStyle() {
                switch (serverConfig.configurationManager.getSettings()?.markdown.preferredMdPathExtensionStyle) {
                    case 'includeExtension': return md.PreferredMdPathExtensionStyle.includeExtension;
                    case 'removeExtension': return md.PreferredMdPathExtensionStyle.removeExtension;
                    case 'auto':
                    default:
                        return md.PreferredMdPathExtensionStyle.auto;
                }
            }
        });
        registerCompletionsSupport(connection, documents, mdLs, serverConfig.configurationManager);
        registerDocumentHighlightSupport(connection, documents, mdLs, serverConfig.configurationManager);
        (0, diagnostics_1.registerValidateSupport)(connection, workspace, documents, mdLs, serverConfig.configurationManager, serverConfig.logger);
        return {
            capabilities: {
                diagnosticProvider: {
                    documentSelector: null,
                    identifier: 'markdown',
                    interFileDependencies: true,
                    workspaceDiagnostics: false,
                },
                codeActionProvider: {
                    resolveProvider: true,
                    codeActionKinds: [
                        organizeLinkDefKind,
                        'quickfix',
                        'refactor',
                    ]
                },
                definitionProvider: true,
                documentLinkProvider: { resolveProvider: true },
                documentSymbolProvider: true,
                foldingRangeProvider: true,
                referencesProvider: true,
                renameProvider: { prepareProvider: true, },
                selectionRangeProvider: true,
                workspaceSymbolProvider: true,
                workspace: {
                    workspaceFolders: {
                        supported: true,
                        changeNotifications: true,
                    },
                }
            }
        };
    });
    connection.onDocumentLinks(async (params, token) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return [];
        }
        return mdLs.getDocumentLinks(document, token);
    });
    connection.onDocumentLinkResolve(async (link, token) => {
        return mdLs.resolveDocumentLink(link, token);
    });
    connection.onDocumentSymbol(async (params, token) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return [];
        }
        return mdLs.getDocumentSymbols(document, { includeLinkDefinitions: true }, token);
    });
    connection.onFoldingRanges(async (params, token) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return [];
        }
        return mdLs.getFoldingRanges(document, token);
    });
    connection.onSelectionRanges(async (params, token) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return [];
        }
        return mdLs.getSelectionRanges(document, params.positions, token);
    });
    connection.onWorkspaceSymbol(async (params, token) => {
        return mdLs.getWorkspaceSymbols(params.query, token);
    });
    connection.onReferences(async (params, token) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return [];
        }
        return mdLs.getReferences(document, params.position, params.context, token);
    });
    connection.onDefinition(async (params, token) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return undefined;
        }
        return mdLs.getDefinition(document, params.position, token);
    });
    connection.onPrepareRename(async (params, token) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return undefined;
        }
        try {
            return await mdLs.prepareRename(document, params.position, token);
        }
        catch (e) {
            if (e instanceof md.RenameNotSupportedAtLocationError) {
                throw new vscode_languageserver_1.ResponseError(0, e.message);
            }
            else {
                throw e;
            }
        }
    });
    connection.onRenameRequest(async (params, token) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return undefined;
        }
        return mdLs.getRenameEdit(document, params.position, params.newName, token);
    });
    connection.onCodeAction(async (params, token) => {
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return undefined;
        }
        if (params.context.only?.some(kind => kind === 'source' || kind.startsWith('source.'))) {
            const action = {
                title: l10n.t("Organize link definitions"),
                kind: organizeLinkDefKind,
                data: { uri: document.uri },
            };
            return [action];
        }
        return mdLs.getCodeActions(document, params.range, params.context, token);
    });
    connection.onCodeActionResolve(async (codeAction, token) => {
        if (codeAction.kind === organizeLinkDefKind) {
            const data = codeAction.data;
            const document = documents.get(data.uri);
            if (!document) {
                return codeAction;
            }
            const edits = (await mdLs?.organizeLinkDefinitions(document, { removeUnused: true }, token)) || [];
            codeAction.edit = {
                changes: {
                    [data.uri]: edits
                }
            };
            return codeAction;
        }
        return codeAction;
    });
    connection.onRequest(protocol.getReferencesToFileInWorkspace, (async (params, token) => {
        return mdLs.getFileReferences(vscode_uri_1.URI.parse(params.uri), token);
    }));
    connection.onRequest(protocol.getEditForFileRenames, (async (params, token) => {
        const result = await mdLs.getRenameFilesInWorkspaceEdit(params.map(x => ({ oldUri: vscode_uri_1.URI.parse(x.oldUri), newUri: vscode_uri_1.URI.parse(x.newUri) })), token);
        if (!result) {
            return result;
        }
        return {
            edit: result.edit,
            participatingRenames: result.participatingRenames.map(rename => ({ oldUri: rename.oldUri.toString(), newUri: rename.newUri.toString() }))
        };
    }));
    connection.onRequest(protocol.resolveLinkTarget, (async (params, token) => {
        return mdLs.resolveLinkTarget(params.linkText, vscode_uri_1.URI.parse(params.uri), token);
    }));
    documents.listen(connection);
    notebooks?.listen(connection);
    connection.listen();
}
function registerDynamicClientFeature(config, isEnabled, register) {
    let registration;
    function update() {
        const settings = config.getSettings();
        if (isEnabled(settings)) {
            if (!registration) {
                registration = register();
            }
        }
        else {
            registration?.then(x => x.dispose());
            registration = undefined;
        }
    }
    update();
    return config.onDidChangeConfiguration(() => update());
}
function registerCompletionsSupport(connection, documents, ls, config) {
    function getIncludeWorkspaceHeaderCompletions() {
        switch (config.getSettings()?.markdown.suggest.paths.includeWorkspaceHeaderCompletions) {
            case 'onSingleOrDoubleHash': return md.IncludeWorkspaceHeaderCompletions.onSingleOrDoubleHash;
            case 'onDoubleHash': return md.IncludeWorkspaceHeaderCompletions.onDoubleHash;
            case 'never':
            default: return md.IncludeWorkspaceHeaderCompletions.never;
        }
    }
    connection.onCompletion(async (params, token) => {
        const settings = config.getSettings();
        if (!settings?.markdown.suggest.paths.enabled) {
            return [];
        }
        const document = documents.get(params.textDocument.uri);
        if (document) {
            // TODO: remove any type after picking up new release with correct types
            return ls.getCompletionItems(document, params.position, {
                ...(params.context || {}),
                includeWorkspaceHeaderCompletions: getIncludeWorkspaceHeaderCompletions(),
            }, token);
        }
        return [];
    });
    return registerDynamicClientFeature(config, (settings) => !!settings?.markdown.suggest.paths.enabled, () => {
        const registrationOptions = {
            documentSelector: null,
            triggerCharacters: ['.', '/', '#'],
        };
        return connection.client.register(vscode_languageserver_1.CompletionRequest.type, registrationOptions);
    });
}
function registerDocumentHighlightSupport(connection, documents, mdLs, configurationManager) {
    connection.onDocumentHighlight(async (params, token) => {
        const settings = configurationManager.getSettings();
        if (!settings?.markdown.occurrencesHighlight.enabled) {
            return undefined;
        }
        const document = documents.get(params.textDocument.uri);
        if (!document) {
            return undefined;
        }
        return mdLs.getDocumentHighlights(document, params.position, token);
    });
    return registerDynamicClientFeature(configurationManager, (settings) => !!settings?.markdown.occurrencesHighlight.enabled, () => {
        const registrationOptions = {
            documentSelector: null,
        };
        return connection.client.register(vscode_languageserver_1.DocumentHighlightRequest.type, registrationOptions);
    });
}
//# sourceMappingURL=server.js.map