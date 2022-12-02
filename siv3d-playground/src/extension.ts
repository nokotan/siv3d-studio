/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//
// ############################################################################
//
//						! USED FOR RUNNING VSCODE OUT OF SOURCES FOR WEB !
//										! DO NOT REMOVE !
//
// ############################################################################
//

import * as vscode from 'vscode';
import { loadAdditionalAssets, loadInitialAssets } from './initialFiles';
import { MemFs } from './memfs';
import { WasmMemFs } from './wasmfs';

declare const navigator: unknown;

export async function activate(context: vscode.ExtensionContext) {
	if (typeof navigator === 'object') {	// do not run under node.js
		let compilePromiseResolver: ((resultCode: number) => void) | null;

		context.subscriptions.push(
			vscode.commands.registerCommand("siv3d-playground.compile.run", async () => {
				const compilePromise = new Promise<number>((resolve, _) => {
					compilePromiseResolver = resolve;
				});
				vscode.commands.executeCommand("workbench.action.tasks.runTask", "emcc build");

				if ((await compilePromise) === 0) {
					const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
						? vscode.workspace.workspaceFolders[0].uri : undefined;
					vscode.commands.executeCommand("emcc.preview.show", vscode.Uri.joinPath(workspaceRoot, "main.html"), "Siv3D Preview");
				}
				compilePromiseResolver = null;
			})
		);

		vscode.tasks.onDidEndTaskProcess(e => {
			if (e.execution.task.name == "emcc build") {
				compilePromiseResolver && compilePromiseResolver(e.exitCode);
			}
		});

		const memFs = enableFs(context);
		memFs.createDirectory(vscode.Uri.parse("memfs:/siv3d-playground"));

		const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
			? vscode.workspace.workspaceFolders[0] : undefined;

		if (workspaceRoot) {
			seedWorkspace(context, memFs, workspaceRoot);
		}

		vscode.workspace.onDidChangeWorkspaceFolders(e => {
			for (const workspace of e.added) {
				seedWorkspace(context, memFs, workspace);
			}
		});
	}
}

async function seedWorkspace(context: vscode.ExtensionContext, memFs: vscode.FileSystemProvider, workspace: vscode.WorkspaceFolder) {
	const openOptions: vscode.TextDocumentShowOptions = {
		preview: false
	};
	const workspaceRoot = workspace.uri;
	
	await loadInitialAssets(memFs, workspaceRoot, context.extensionUri);
	vscode.commands.executeCommand('vscode.open', vscode.Uri.joinPath(workspaceRoot, "src/Main.cpp"), openOptions);
	// vscode.commands.executeCommand("emcc.preview.show", vscode.Uri.joinPath(workspaceRoot, "main.html"), "Siv3D Preview");
	await loadAdditionalAssets(memFs, workspaceRoot);
}

function enableFs(context: vscode.ExtensionContext) {
	const memFs = new WasmMemFs();
	context.subscriptions.push(memFs);

	return memFs;
}
