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
import { ExtensionContext } from '../../wasm-playground/src/extension';

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

		const playgroundExtension = vscode.extensions.getExtension<ExtensionContext>("kamenokosoft.wasm-playground");

		let extensionContext;

		if (playgroundExtension.isActive) {
			extensionContext = playgroundExtension.exports;
		} else {
			extensionContext = await playgroundExtension.activate();
		}

		const memFs = extensionContext.memFs;

		// const workSpaceUri = vscode.Uri.parse("memfs:/siv3d-playground");
		// seedWorkspace(context, memFs, workSpaceUri);

		const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
			? vscode.workspace.workspaceFolders[0] : undefined;

		if (workspaceRoot) {
			seedWorkspace(context, memFs, workspaceRoot.uri);
		}

		vscode.workspace.onDidChangeWorkspaceFolders(e => {
			for (const workspace of e.added) {
				seedWorkspace(context, memFs, workspace.uri);
			}
		});
	}
}

async function seedWorkspace(context: vscode.ExtensionContext, memFs: vscode.FileSystemProvider, workspaceUri: vscode.Uri) {
	const openOptions: vscode.TextDocumentShowOptions = {
		preview: false
	};

	const folders = workspaceUri.path.split("/").slice(1);

	try {
		await memFs.stat(workspaceUri);
	} catch (e) {
		if (e instanceof vscode.FileSystemError) {
			for (let i = 1; i <= folders.length; i++) {
				const newDirectory = workspaceUri.with({ path: "/" + folders.slice(0, i).join("/") });
				await memFs.createDirectory(newDirectory);
			}
		} else {
			throw e;
		}
	}

	if (folders.length > 0 && folders[0] === "gist") {
		const gistFsPath = vscode.Uri.parse(`gist://${folders.slice(1).join("/")}/`);
		const gistExtension = vscode.extensions.getExtension<void>("vsls-contrib.gistfs");

		if (!gistExtension.isActive) {
			await gistExtension.activate();
		}

		await vscode.workspace.fs.copy(gistFsPath, workspaceUri, { overwrite: true });
	} else {
		await loadInitialAssets(memFs, workspaceUri, context.extensionUri);
		vscode.commands.executeCommand('vscode.open', vscode.Uri.joinPath(workspaceUri, "src/Main.cpp"), openOptions);
		// vscode.commands.executeCommand("emcc.preview.show", vscode.Uri.joinPath(workspaceUri, "main.html"), "Siv3D Preview");
	}
	await loadAdditionalAssets(memFs, workspaceUri);
}
