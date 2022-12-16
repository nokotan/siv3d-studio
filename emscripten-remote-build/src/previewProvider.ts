import * as vscode from 'vscode';
import * as path from 'path';

export function showPreview(workspaceRoot: vscode.Uri, storageRoot: vscode.Uri, htmlUrl: vscode.Uri, previewTabName: string) {
    PreviewPalel.createOrShow(workspaceRoot, storageRoot, htmlUrl, previewTabName);
}

export function reloadPreview() {
    PreviewPalel.reload();
}

class PreviewPalel {
    public static currentPanel: PreviewPalel | undefined;

	public static readonly viewType = 'emccPreview';
	public static readonly emccPreviewActiveContextKey = 'emccPreviewFocus';

	private _disposables: vscode.Disposable[] = [];
	private textDecoder: TextDecoder;
	private textEncoder: TextEncoder;

	public static reload() {
		// If we already have a panel, show it.
		if (PreviewPalel.currentPanel) {
			PreviewPalel.currentPanel._panel.reveal();
			PreviewPalel.currentPanel._clear();
			PreviewPalel.currentPanel._update();
			return;
		}
	}

    public static createOrShow(workspaceRoot: vscode.Uri, storageRoot: vscode.Uri, htmlUrl: vscode.Uri, previewTabName: string) {
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
        const parentFolderUrl = vscode.Uri.from({ scheme: "memfs", path: parentFolder });

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

		PreviewPalel.currentPanel = new PreviewPalel(panel, parentFolderUrl, htmlUrl, storageRoot);
	}

    private constructor(private readonly _panel: vscode.WebviewPanel, private readonly _parentUrl: vscode.Uri, private _htmlUrl: vscode.Uri, private readonly _storageRoot: vscode.Uri) {
		this.textDecoder = new TextDecoder();
		this.textEncoder = new TextEncoder();

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
		this._panel.onDidChangeViewState(({ webviewPanel }) => {
			this.setPreviewActiveContext(webviewPanel.active);
		}, this);

		this.setPreviewActiveContext(true);
	}

	private _clear() {
		const webview = this._panel.webview;
        webview.html = "<html></html>";
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

		content = content.replace("location.reload()", "(function () { const vscode = acquireVsCodeApi(); vscode.postMessage({ command: 'emcc.preview.reload' }); })()");
        webview.html = content;

		webview.onDidReceiveMessage(e => {
			if (e.command === 'emcc.preview.reload') {
				vscode.commands.executeCommand('emcc.preview.reload');
			}
		})
    }

    public dispose() {
		PreviewPalel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
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