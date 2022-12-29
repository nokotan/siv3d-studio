import * as vscode from 'vscode';
import * as path from 'path';

export function showPreview(storageRoot: vscode.Uri, htmlUrl: vscode.Uri, previewTabName: string) {
    PreviewPalel.createOrShow(storageRoot, htmlUrl, previewTabName);
}

export function reloadPreview() {
    PreviewPalel.reload();
}

interface ReloadCommand {
	command: "emcc.preview.reload";
}

interface OutputCommand {
	command: "emcc.preview.output";
	content: string;
}

class PreviewPalel {
    public static currentPanel: PreviewPalel | undefined;

	public static readonly viewType = 'emccPreview';
	public static readonly emccPreviewActiveContextKey = 'emccPreviewFocus';

	private disposables: vscode.Disposable[] = [];
	private outputChannel: vscode.OutputChannel;
	private textDecoder: TextDecoder;

	public static reload() {
		// If we already have a panel, show it.
		if (PreviewPalel.currentPanel) {
			PreviewPalel.currentPanel._panel.reveal();
			PreviewPalel.currentPanel._clear();
			PreviewPalel.currentPanel._update();
			return;
		}
	}

    public static createOrShow(storageRoot: vscode.Uri, htmlUrl: vscode.Uri, previewTabName: string) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (PreviewPalel.currentPanel) {
			PreviewPalel.currentPanel._htmlUrl = htmlUrl;
			PreviewPalel.reload();
			return;
		}

        const parentFolder = path.dirname(htmlUrl.path);
        const parentFolderUrl = htmlUrl.with({ 
			path: parentFolder,
			scheme: htmlUrl.scheme === "vscode-remote" ? "memfs" : htmlUrl.scheme
		});

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			PreviewPalel.viewType,
			previewTabName,
			column || vscode.ViewColumn.One,
			{
                enableScripts: true,
                localResourceRoots: [
                    parentFolderUrl,
					storageRoot
                ],
				retainContextWhenHidden: true,
				enableFindWidget: true
            }
		);

		PreviewPalel.currentPanel = new PreviewPalel(panel, parentFolderUrl, htmlUrl);
	}

    private constructor(private readonly _panel: vscode.WebviewPanel, private readonly _parentUrl: vscode.Uri, private _htmlUrl: vscode.Uri) {
		this.textDecoder = new TextDecoder();

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this.disposables);
		this._panel.onDidChangeViewState(({ webviewPanel }) => {
			this.setPreviewActiveContext(webviewPanel.active);
		}, this);

		this.outputChannel = vscode.window.createOutputChannel("Preview Output");
		this.disposables.push(this.outputChannel);

		this._panel.webview.onDidReceiveMessage((e: ReloadCommand | OutputCommand) => {
			if (e.command === 'emcc.preview.reload') {
				vscode.commands.executeCommand('emcc.preview.reload');
			} else if (e.command === 'emcc.preview.output') {
				this.outputChannel.appendLine(e.content);
			}
		})

		this.setPreviewActiveContext(true);
	}

	private _clear() {
		const webview = this._panel.webview;
        webview.html = "<html></html>";

		this.outputChannel.clear();
    }

    private async _update() {
		const webview = this._panel.webview;
        let rawcontent = await vscode.workspace.fs.readFile(this._htmlUrl);
        let content = this.textDecoder.decode(rawcontent);

        content = content.replace(/\bsrc\s*=\s*['"](.+?)['"]/g, (all: string, path?: string) => {
			let resourcePath = vscode.Uri.joinPath(this._parentUrl, path || "");
			if (resourcePath.scheme === "vscode-remote") {
				resourcePath = resourcePath.with({ scheme: "memfs" });
			}
            const blobUrl = webview.asWebviewUri(resourcePath);
            if (!blobUrl) {
              return all;
            }
            return `src="${blobUrl}"`;
        });

		content = content.replace("<script>", 
			`<script>
			(function () { 
				const vscode = acquireVsCodeApi();

				window.location.reload = function() {
					vscode.postMessage({ command: 'emcc.preview.reload' });
				};

				function log(content) {
					vscode.postMessage({ command: 'emcc.preview.output', content });
				}

				window.console.log = log;
				window.console.warn = log;
				window.console.error = log;
			})();
			</script>
			<script>`
		);
        webview.html = content;
    }

    public dispose() {
		PreviewPalel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this.disposables.length) {
			const x = this.disposables.pop();
			if (x) {
				x.dispose();
			}
		}

		this.setPreviewActiveContext(false);
	}

	private setPreviewActiveContext(value: boolean) {
		vscode.commands.executeCommand('setContext', PreviewPalel.emccPreviewActiveContextKey, value);
	}
}