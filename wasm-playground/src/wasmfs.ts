import { WasmFs } from '@wasmer/wasmfs';
import { Dirent } from 'fs';
import {
	CancellationToken,
	Disposable,
	Event,
	EventEmitter,
	FileChangeEvent,
	FileChangeType,
	FileSearchOptions,
	FileSearchProvider,
	FileSearchQuery,
	FileStat,
	FileSystemError,
	FileSystemProvider,
	FileType,
	Position,
	Progress,
	ProviderResult,
	Range,
	TextSearchComplete,
	TextSearchOptions,
	TextSearchQuery,
	TextSearchProvider,
	TextSearchResult,
	Uri,
	workspace,
} from 'vscode';

export class WasmMemFs implements FileSystemProvider, FileSearchProvider, TextSearchProvider, Disposable {

    wasmFs: WasmFs;
    private readonly disposable: Disposable;

    constructor() {
        this.wasmFs = new WasmFs();

        let disposables = [];

        disposables.push(
            workspace.registerFileSystemProvider("memfs", this, { isCaseSensitive: true }),
            workspace.registerFileSystemProvider("vscode-remote", this, { isCaseSensitive: true }),
        );

        disposables.push(
            workspace.registerFileSearchProvider("memfs", this),
            workspace.registerFileSearchProvider("vscode-remote", this),
        );

        disposables.push(
            workspace.registerTextSearchProvider("memfs", this),
            workspace.registerTextSearchProvider("vscode-remote", this),
        );

        this.disposable = Disposable.from(...disposables);
    }

    dispose() {
        delete this.wasmFs;
        this.disposable.dispose();
    }

    async backup() {
        const fs = this.wasmFs;

        const db = await new Promise<IDBDatabase>(function (resolve, reject) {
            const workspaceDBOpenRequest = indexedDB.open("WasmFS", 1);

            workspaceDBOpenRequest.onupgradeneeded = function() {
                const db = workspaceDBOpenRequest.result;
                db.createObjectStore("DirectoryEntries");
            };

            workspaceDBOpenRequest.onsuccess = function() {
                resolve(workspaceDBOpenRequest.result);       
            };

            workspaceDBOpenRequest.onerror = reject;
        });

        await new Promise<void>(function (resolve, reject) {
            const transaction = db.transaction("DirectoryEntries", "readwrite")
            const store = transaction.objectStore("DirectoryEntries");
            const storeRequest = store.put(fs.toJSON(), "SavedData");

            storeRequest.onsuccess = function() {
                resolve();
            };

            storeRequest.onerror = reject;
        });
    }

    async restore() {
        const fs = this.wasmFs;

        const db = await new Promise<IDBDatabase>(function (resolve, reject) {
            const workspaceDBOpenRequest = indexedDB.open("WasmFS", 1);

            workspaceDBOpenRequest.onupgradeneeded = function() {
                const db = workspaceDBOpenRequest.result;
                db.createObjectStore("DirectoryEntries");
            };

            workspaceDBOpenRequest.onsuccess = function() {
                resolve(workspaceDBOpenRequest.result);       
            };

            workspaceDBOpenRequest.onerror = reject;
        });

        await new Promise<void>(function (resolve, reject) {
            const transaction = db.transaction("DirectoryEntries", "readwrite")
            const store = transaction.objectStore("DirectoryEntries");
            const readRequest = store.get("SavedData");

            readRequest.onsuccess = function() {
                if (readRequest.result) {
                    fs.fromJSON(readRequest.result);
                }
                resolve();
            };

            readRequest.onerror = reject;
        });
    }

    // --- manage file metadata

    stat(uri: Uri): Promise<FileStat> {
        return new Promise((c, e) => {
            this.wasmFs.fs.stat(uri.path, (err, stats) => {
                if (err) {
                    return e(FileSystemError.FileNotFound(uri));
                }

                let type = FileType.Unknown;
                if (stats.isFile()) {
                    type = FileType.File;
                } else if (stats.isDirectory()) {
                    type = FileType.Directory;
                } else if (stats.isSymbolicLink()) {
                    type = FileType.SymbolicLink;
                }

                c({
                    type,
                    ctime: stats.ctime.getTime(),
                    mtime: stats.mtime.getTime(),
                    size: Number(stats.size)
                });
            });
        });
	}

    readDirectory(uri: Uri): Promise<[string, FileType][]> {
        return new Promise((c, e) => {
            this.wasmFs.fs.readdir(uri.path, { withFileTypes: true }, (err, children) => {
                if (err) {
                    return e(err);
                }
                c((children as Dirent[]).map(stat => {
                    if (stat.isSymbolicLink()) {
                        return [stat.name, FileType.SymbolicLink];
                    } else if (stat.isDirectory()) {
                        return [stat.name, FileType.Directory];
                    } else if (stat.isFile()) {
                        return [stat.name, FileType.File];
                    } else {
                        return [stat.name, FileType.Unknown];
                    }
                }));
            });
        });
    }

    // --- manage file contents

    readFile(uri: Uri): Uint8Array {
        return this.wasmFs.fs.readFileSync(uri.path, { encoding: "buffer" }) as Buffer;
    }

    writeFile(uri: Uri, content: Uint8Array, options: { create: boolean, overwrite: boolean }): void {
        const filePath = uri.path;

        // Validate target unless { create: true, overwrite: true }
        if (!options.create || !options.overwrite) {
            const fileExists = this.wasmFs.fs.existsSync(filePath);
            if (fileExists) {
                if (!options.overwrite) {
                    throw new Error("File already exists");
                }
            } else {
                if (!options.create) {
                    throw new Error("File does not exist");
                }
            }
        }

        this.wasmFs.fs.writeFileSync(filePath, content);
		
        if (options.create) {   
            this._fireSoon({ type: FileChangeType.Created, uri });
        } else {
            this._fireSoon({ type: FileChangeType.Changed, uri });
        }
    }

	// --- manage files/folders

	rename(oldUri: Uri, newUri: Uri, options: { overwrite: boolean }): void {
        this.wasmFs.fs.renameSync(oldUri.path, newUri.path);
        this._fireSoon(
			{ type: FileChangeType.Deleted, uri: oldUri },
			{ type: FileChangeType.Created, uri: newUri }
		);
    }

    async delete(uri: Uri) {
        const statResult = await this.stat(uri);

        if (statResult.type === FileType.Directory) {
            this.wasmFs.fs.rmdirSync(uri.path, { recursive: true });
        } else {
            this.wasmFs.fs.unlinkSync(uri.path);
        }

        this._fireSoon({ uri, type: FileChangeType.Deleted });
    }

    createDirectory(uri: Uri): void {
        this.wasmFs.fs.mkdirSync(uri.path);
        this._fireSoon({ type: FileChangeType.Created, uri });
    }

    private _emitter = new EventEmitter<FileChangeEvent[]>();
    private _bufferedEvents: FileChangeEvent[] = [];
    private _fireSoonHandle?: any;

	readonly onDidChangeFile: Event<FileChangeEvent[]> = this._emitter.event;

	watch(_resource: Uri): Disposable {
		// ignore, fires for all changes...
		return new Disposable(() => { });
	}

    private _fireSoon(...events: FileChangeEvent[]): void {
		this._bufferedEvents.push(...events);

		if (this._fireSoonHandle) {
			clearTimeout(this._fireSoonHandle);
		}

		this._fireSoonHandle = setTimeout(() => {
			this._emitter.fire(this._bufferedEvents);
			this._bufferedEvents.length = 0;
		}, 5);
	}

    private _convertSimple2RegExpPattern(pattern: string): string {
		return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&').replace(/[\*]/g, '.*');
	}

	// --- search provider

	provideFileSearchResults(query: FileSearchQuery, _options: FileSearchOptions, _token: CancellationToken): ProviderResult<Uri[]> {
		return this._findFiles(query.pattern);
	}

    private _getFiles(): Set<[Dirent, Uri]> {
		const files = new Set<[Dirent, Uri]>();

		this._doGetFiles(Uri.parse("memfs:/"), files);

		return files;
	}

	private _doGetFiles(dir: Uri, files: Set<[Dirent, Uri]>): void {
        const entries = this.wasmFs.fs.readdirSync(dir.path, { withFileTypes: true }) as Dirent[];

		entries.forEach(entry => {
            const uri = Uri.joinPath(dir, entry.name);

			if (entry.isFile()) {
				files.add([ entry, uri ]);
			} else if (entry.isDirectory()) {
				this._doGetFiles(Uri.joinPath(dir, entry.name), files);
			}
		});
	}

	private _findFiles(query: string | undefined): Uri[] {
		const files = this._getFiles();
		const result: Uri[] = [];

		const pattern = query ? new RegExp(this._convertSimple2RegExpPattern(query)) : null;

		for (const file of files) {
			if (!pattern || pattern.exec(file[0].name)) {
				result.push(file[1]);
			}
		}

		return result;
	}

    private _textDecoder = new TextDecoder();

	provideTextSearchResults(query: TextSearchQuery, options: TextSearchOptions, progress: Progress<TextSearchResult>, _token: CancellationToken) {
		const result: TextSearchComplete = { limitHit: false };

		const files = this._findFiles(options.includes[0]);
		if (files) {
			for (const file of files) {
				const content = this._textDecoder.decode(this.readFile(file));

				const lines = content.split('\n');
				for (let i = 0; i < lines.length; i++) {
					const line = lines[i];
					const index = line.indexOf(query.pattern);
					if (index !== -1) {
						progress.report({
							uri: file,
							ranges: new Range(new Position(i, index), new Position(i, index + query.pattern.length)),
							preview: {
								text: line,
								matches: new Range(new Position(0, index), new Position(0, index + query.pattern.length))
							}
						});
					}
				}
			}
		}

		return result;
	}
}