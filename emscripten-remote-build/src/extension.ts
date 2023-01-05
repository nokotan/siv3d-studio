// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { reloadPreview, showPreview } from './previewProvider';
import { CustomBuildTaskProvider, CustomBuildTaskTerminal } from './taskProvider';

import * as nls from 'vscode-nls';

interface LocalizeFunc extends nls.LocalizeFunc {
	(arg0: number, arg1: string): string;
}

nls.config({ messageFormat: nls.MessageFormat.bundle, bundleFormat: nls.BundleFormat.standalone })();
const localize: nls.LocalizeFunc = nls.loadMessageBundle() as LocalizeFunc;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri : undefined;
	if (!workspaceRoot) {
		return;
	}

	localize("emscripten-remote-build.unused", "Hello");

	const disposable = vscode.tasks.registerTaskProvider("emcc", new CustomBuildTaskProvider(workspaceRoot));

	context.subscriptions.push(disposable);

	context.subscriptions.push(
		vscode.commands.registerCommand("emcc.preview.show", (selectedFile, previewTabName) => {
			if (selectedFile instanceof vscode.Uri) {
				const tabName = typeof previewTabName === "string" ? previewTabName : "Emcc Preview";
				showPreview(context.storageUri!, selectedFile, tabName);
			}
		}),
		vscode.commands.registerCommand("emcc.preview.reload", () => {
			reloadPreview();
		})
	);

	vscode.window.registerTerminalProfileProvider('emcc.terminal', {
		provideTerminalProfile(
		  token: vscode.CancellationToken
		): vscode.ProviderResult<vscode.TerminalProfile> {
		  return new vscode.TerminalProfile({
			name: "emcc terminal",
			pty: new CustomBuildTaskTerminal(workspaceRoot)
		  });
		}
	});  
}

// this method is called when your extension is deactivated
export function deactivate() {}
