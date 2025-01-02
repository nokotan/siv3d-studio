"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.VsCodeClientWorkspace = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const md = require("vscode-markdown-languageservice");
const vscode_uri_1 = require("vscode-uri");
const protocol = require("./protocol");
const file_1 = require("./util/file");
const limiter_1 = require("./util/limiter");
const resourceMap_1 = require("./util/resourceMap");
const schemes_1 = require("./util/schemes");
class VsCodeDocument {
    constructor(uri, init) {
        this.uri = uri;
        this.inMemoryDoc = init?.inMemoryDoc;
        this.onDiskDoc = init?.onDiskDoc;
    }
    get version() {
        return this.inMemoryDoc?.version ?? this.onDiskDoc?.version ?? 0;
    }
    get lineCount() {
        return this.inMemoryDoc?.lineCount ?? this.onDiskDoc?.lineCount ?? 0;
    }
    getText(range) {
        if (this.inMemoryDoc) {
            return this.inMemoryDoc.getText(range);
        }
        if (this.onDiskDoc) {
            return this.onDiskDoc.getText(range);
        }
        throw new Error('Document has been closed');
    }
    positionAt(offset) {
        if (this.inMemoryDoc) {
            return this.inMemoryDoc.positionAt(offset);
        }
        if (this.onDiskDoc) {
            return this.onDiskDoc.positionAt(offset);
        }
        throw new Error('Document has been closed');
    }
    hasInMemoryDoc() {
        return !!this.inMemoryDoc;
    }
    isDetached() {
        return !this.onDiskDoc && !this.inMemoryDoc;
    }
    setInMemoryDoc(doc) {
        this.inMemoryDoc = doc;
    }
    setOnDiskDoc(doc) {
        this.onDiskDoc = doc;
    }
}
class VsCodeClientWorkspace {
    constructor(connection, config, documents, notebooks, logger) {
        this.connection = connection;
        this.config = config;
        this.documents = documents;
        this.notebooks = notebooks;
        this.logger = logger;
        this._onDidCreateMarkdownDocument = new vscode_languageserver_1.Emitter();
        this.onDidCreateMarkdownDocument = this._onDidCreateMarkdownDocument.event;
        this._onDidChangeMarkdownDocument = new vscode_languageserver_1.Emitter();
        this.onDidChangeMarkdownDocument = this._onDidChangeMarkdownDocument.event;
        this._onDidDeleteMarkdownDocument = new vscode_languageserver_1.Emitter();
        this.onDidDeleteMarkdownDocument = this._onDidDeleteMarkdownDocument.event;
        this._documentCache = new resourceMap_1.ResourceMap();
        this._utf8Decoder = new TextDecoder('utf-8');
        this._watcherPool = 0;
        this._watchers = new Map();
        this._workspaceFolders = [];
        documents.onDidOpen(e => {
            if (!this.isRelevantMarkdownDocument(e.document)) {
                return;
            }
            this.logger.log(md.LogLevel.Trace, 'VsCodeClientWorkspace.TextDocument.onDidOpen', { document: e.document.uri });
            const uri = vscode_uri_1.URI.parse(e.document.uri);
            const doc = this._documentCache.get(uri);
            if (doc) {
                // File already existed on disk
                doc.setInMemoryDoc(e.document);
                // The content visible to the language service may have changed since the in-memory doc
                // may differ from the one on-disk. To be safe we always fire a change event.
                this._onDidChangeMarkdownDocument.fire(doc);
            }
            else {
                // We're creating the file for the first time
                const doc = new VsCodeDocument(e.document.uri, { inMemoryDoc: e.document });
                this._documentCache.set(uri, doc);
                this._onDidCreateMarkdownDocument.fire(doc);
            }
        });
        documents.onDidChangeContent(e => {
            if (!this.isRelevantMarkdownDocument(e.document)) {
                return;
            }
            this.logger.log(md.LogLevel.Trace, 'VsCodeClientWorkspace.TextDocument.onDidChanceContent', { document: e.document.uri });
            const uri = vscode_uri_1.URI.parse(e.document.uri);
            const entry = this._documentCache.get(uri);
            if (entry) {
                entry.setInMemoryDoc(e.document);
                this._onDidChangeMarkdownDocument.fire(entry);
            }
        });
        documents.onDidClose(async (e) => {
            if (!this.isRelevantMarkdownDocument(e.document)) {
                return;
            }
            this.logger.log(md.LogLevel.Trace, 'VsCodeClientWorkspace.TextDocument.onDidClose', { document: e.document.uri });
            const uri = vscode_uri_1.URI.parse(e.document.uri);
            const doc = this._documentCache.get(uri);
            if (!doc) {
                // Document was never opened
                return;
            }
            doc.setInMemoryDoc(undefined);
            if (doc.isDetached()) {
                // The document has been fully closed
                this.doDeleteDocument(uri);
                return;
            }
            // Check that if file has been deleted on disk.
            // This can happen when directories are renamed / moved. VS Code's file system watcher does not
            // notify us when this happens.
            if (!(await this.statBypassingCache(uri))) {
                if (this._documentCache.get(uri) === doc && !doc.hasInMemoryDoc()) {
                    this.doDeleteDocument(uri);
                    return;
                }
            }
            // The document still exists on disk
            // To be safe, tell the service that the document has changed because the
            // in-memory doc contents may be different than the disk doc contents.
            this._onDidChangeMarkdownDocument.fire(doc);
        });
        connection.onDidChangeWatchedFiles(async ({ changes }) => {
            for (const change of changes) {
                const resource = vscode_uri_1.URI.parse(change.uri);
                this.logger.log(md.LogLevel.Trace, 'VsCodeClientWorkspace.onDidChangeWatchedFiles', { type: change.type, resource: resource.toString() });
                switch (change.type) {
                    case vscode_languageserver_1.FileChangeType.Changed: {
                        const entry = this._documentCache.get(resource);
                        if (entry) {
                            // Refresh the on-disk state
                            const document = await this.openMarkdownDocumentFromFs(resource);
                            if (document) {
                                this._onDidChangeMarkdownDocument.fire(document);
                            }
                        }
                        break;
                    }
                    case vscode_languageserver_1.FileChangeType.Created: {
                        const entry = this._documentCache.get(resource);
                        if (entry) {
                            // Create or update the on-disk state
                            const document = await this.openMarkdownDocumentFromFs(resource);
                            if (document) {
                                this._onDidCreateMarkdownDocument.fire(document);
                            }
                        }
                        break;
                    }
                    case vscode_languageserver_1.FileChangeType.Deleted: {
                        const entry = this._documentCache.get(resource);
                        if (entry) {
                            entry.setOnDiskDoc(undefined);
                            if (entry.isDetached()) {
                                this.doDeleteDocument(resource);
                            }
                        }
                        break;
                    }
                }
            }
        });
        connection.onRequest(protocol.fs_watcher_onChange, params => {
            this.logger.log(md.LogLevel.Trace, 'VsCodeClientWorkspace.fs_watcher_onChange', { kind: params.kind, uri: params.uri });
            const watcher = this._watchers.get(params.id);
            if (!watcher) {
                return;
            }
            switch (params.kind) {
                case 'create':
                    watcher.onDidCreate.fire(vscode_uri_1.URI.parse(params.uri));
                    return;
                case 'change':
                    watcher.onDidChange.fire(vscode_uri_1.URI.parse(params.uri));
                    return;
                case 'delete':
                    watcher.onDidDelete.fire(vscode_uri_1.URI.parse(params.uri));
                    return;
            }
        });
    }
    listen() {
        this.connection.workspace.onDidChangeWorkspaceFolders(async () => {
            this.workspaceFolders = (await this.connection.workspace.getWorkspaceFolders() ?? []).map(x => vscode_uri_1.URI.parse(x.uri));
        });
    }
    get workspaceFolders() {
        return this._workspaceFolders;
    }
    set workspaceFolders(value) {
        this._workspaceFolders = value;
    }
    async getAllMarkdownDocuments() {
        // Add opened files (such as untitled files)
        const openTextDocumentResults = this.documents.all()
            .filter(doc => this.isRelevantMarkdownDocument(doc));
        const allDocs = new resourceMap_1.ResourceMap();
        for (const doc of openTextDocumentResults) {
            allDocs.set(vscode_uri_1.URI.parse(doc.uri), doc);
        }
        // And then add files on disk
        const maxConcurrent = 20;
        const limiter = new limiter_1.Limiter(maxConcurrent);
        const resources = await this.connection.sendRequest(protocol.findMarkdownFilesInWorkspace, {});
        await Promise.all(resources.map(strResource => {
            return limiter.queue(async () => {
                const resource = vscode_uri_1.URI.parse(strResource);
                if (allDocs.has(resource)) {
                    return;
                }
                const doc = await this.openMarkdownDocument(resource);
                if (doc) {
                    allDocs.set(resource, doc);
                }
                return doc;
            });
        }));
        return allDocs.values();
    }
    hasMarkdownDocument(resource) {
        return !!this.documents.get(resource.toString());
    }
    async openMarkdownDocument(resource) {
        const existing = this._documentCache.get(resource);
        if (existing) {
            return existing;
        }
        const matchingDocument = this.documents.get(resource.toString());
        if (matchingDocument) {
            let entry = this._documentCache.get(resource);
            if (entry) {
                entry.setInMemoryDoc(matchingDocument);
            }
            else {
                entry = new VsCodeDocument(resource.toString(), { inMemoryDoc: matchingDocument });
                this._documentCache.set(resource, entry);
            }
            return entry;
        }
        return this.openMarkdownDocumentFromFs(resource);
    }
    async openMarkdownDocumentFromFs(resource) {
        if (!(0, file_1.looksLikeMarkdownPath)(this.config, resource)) {
            return undefined;
        }
        try {
            const response = await this.connection.sendRequest(protocol.fs_readFile, { uri: resource.toString() });
            // TODO: LSP doesn't seem to handle Array buffers well
            const bytes = new Uint8Array(response);
            // We assume that markdown is in UTF-8
            const text = this._utf8Decoder.decode(bytes);
            const doc = new VsCodeDocument(resource.toString(), {
                onDiskDoc: vscode_languageserver_textdocument_1.TextDocument.create(resource.toString(), 'markdown', 0, text)
            });
            this._documentCache.set(resource, doc);
            return doc;
        }
        catch (e) {
            return undefined;
        }
    }
    async stat(resource) {
        this.logger.log(md.LogLevel.Trace, 'VsCodeClientWorkspace.stat', { resource: resource.toString() });
        if (this._documentCache.has(resource)) {
            return { isDirectory: false };
        }
        return this.statBypassingCache(resource);
    }
    async statBypassingCache(resource) {
        const uri = resource.toString();
        if (this.documents.get(uri)) {
            return { isDirectory: false };
        }
        const fsResult = await this.connection.sendRequest(protocol.fs_stat, { uri });
        return fsResult ?? undefined; // Force convert null to undefined
    }
    async readDirectory(resource) {
        this.logger.log(md.LogLevel.Trace, 'VsCodeClientWorkspace.readDir', { resource: resource.toString() });
        return this.connection.sendRequest(protocol.fs_readDirectory, { uri: resource.toString() });
    }
    getContainingDocument(resource) {
        if (resource.scheme === schemes_1.Schemes.notebookCell) {
            const nb = this.notebooks.findNotebookDocumentForCell(resource.toString());
            if (nb) {
                return {
                    uri: vscode_uri_1.URI.parse(nb.uri),
                    children: nb.cells.map(cell => ({ uri: vscode_uri_1.URI.parse(cell.document) })),
                };
            }
        }
        return undefined;
    }
    watchFile(resource, options) {
        const id = this._watcherPool++;
        this.logger.log(md.LogLevel.Trace, 'VsCodeClientWorkspace.watchFile', { id, resource: resource.toString() });
        const entry = {
            resource,
            options,
            onDidCreate: new vscode_languageserver_1.Emitter(),
            onDidChange: new vscode_languageserver_1.Emitter(),
            onDidDelete: new vscode_languageserver_1.Emitter(),
        };
        this._watchers.set(id, entry);
        this.connection.sendRequest(protocol.fs_watcher_create, {
            id,
            uri: resource.toString(),
            options,
            watchParentDirs: true,
        });
        return {
            onDidCreate: entry.onDidCreate.event,
            onDidChange: entry.onDidChange.event,
            onDidDelete: entry.onDidDelete.event,
            dispose: () => {
                this.logger.log(md.LogLevel.Trace, 'VsCodeClientWorkspace.disposeWatcher', { id, resource: resource.toString() });
                this.connection.sendRequest(protocol.fs_watcher_delete, { id });
                this._watchers.delete(id);
            }
        };
    }
    isRelevantMarkdownDocument(doc) {
        return (0, file_1.isMarkdownFile)(doc) && vscode_uri_1.URI.parse(doc.uri).scheme !== 'vscode-bulkeditpreview';
    }
    doDeleteDocument(uri) {
        this.logger.log(md.LogLevel.Trace, 'VsCodeClientWorkspace.deleteDocument', { document: uri.toString() });
        this._documentCache.delete(uri);
        this._onDidDeleteMarkdownDocument.fire(uri);
    }
}
exports.VsCodeClientWorkspace = VsCodeClientWorkspace;
//# sourceMappingURL=workspace.js.map