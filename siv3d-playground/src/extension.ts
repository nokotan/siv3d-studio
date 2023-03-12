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

export async function activate(context: vscode.ExtensionContext) {
	
	if (!vscode.workspace.getConfiguration("siv3d-playground").get<boolean>("enable-siv3d-preview")) {
		vscode.window.showErrorMessage("Siv3D Preview is not available in this browser tab. Please use another browser tab.");
	}

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

	const playgroundExtension = vscode.extensions.getExtension<{}>("kamenokosoft.wasm-playground");

	if (!playgroundExtension.isActive) {
		await playgroundExtension.activate();
	}

	// const memFs = playgroundExtension.exports.memFs;

	// await memFs.restore().catch(e => console.error(e));
	// memFs.onDidChangeFile(function () {
	// 	memFs.backup();
	// });

	const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0] : undefined;

	if (workspaceRoot) {
		seedWorkspace(context, workspaceRoot.uri);
	}
}

async function seedWorkspace(context: vscode.ExtensionContext, workspaceUri: vscode.Uri) {
	const openOptions: vscode.TextDocumentShowOptions = {
		preview: false
	};

	const folders = workspaceUri.path.split("/").slice(1);

	try {	
		await vscode.workspace.fs.stat(workspaceUri);
	} catch (e) {
		if (e instanceof vscode.FileSystemError) {
			for (let i = 1; i <= folders.length; i++) {
				const newDirectory = workspaceUri.with({ path: "/" + folders.slice(0, i).join("/") });
				await vscode.workspace.fs.createDirectory(newDirectory);
			}
		} else {
			throw e;
		}
	}

	if (folders.length > 0 && folders[0] === "gist") {
		await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "downloading files from GitHub Gist..."
		}, async _ => {
			const gistFsPath = vscode.Uri.parse(`gist://${folders.slice(1).join("/")}/`);
			const gistExtension = vscode.extensions.getExtension<void>("vsls-contrib.gistfs");

			if (!gistExtension.isActive) {
				await gistExtension.activate();
			}

			await vscode.workspace.fs.copy(gistFsPath, workspaceUri, { overwrite: true });

			const cppFiles = await vscode.workspace.findFiles("**/*.cpp");

			if (cppFiles.length > 0) {
				vscode.commands.executeCommand('vscode.open', cppFiles[0], openOptions);
			}
		});
	} else {
		await loadInitialAssets(workspaceUri, context.extensionUri);
		vscode.commands.executeCommand('vscode.open', vscode.Uri.joinPath(workspaceUri, "src/Main.cpp"), openOptions);
		// vscode.commands.executeCommand("emcc.preview.show", vscode.Uri.joinPath(workspaceUri, "main.html"), "Siv3D Preview");
	}
	await loadAdditionalAssets(workspaceUri, context.extensionUri);
}
