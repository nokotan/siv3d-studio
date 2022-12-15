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
import { WasmMemFs } from './wasmfs';
import { WasmPseudoTerminal } from './terminal'

export interface ExtensionContext {
	memFs: WasmMemFs;
}

export async function activate(context: vscode.ExtensionContext): Promise<ExtensionContext> {
	
	const memFs = enableFs(context);

	vscode.window.registerTerminalProfileProvider('wasm.terminal', {
		provideTerminalProfile(
			token: vscode.CancellationToken
		): vscode.ProviderResult<vscode.TerminalProfile> {
			const webWorkerPath = vscode.Uri.joinPath(context.extensionUri, "dist/webworker.js");
			return new vscode.TerminalProfile({
				name: "wasm terminal",
				pty: new WasmPseudoTerminal(memFs.wasmFs, webWorkerPath)
			});
		}
	});

	context.subscriptions.push(
		vscode.commands.registerCommand("wasm-playground.openRootFolder", function() {
			vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.parse("vscode-remote:/"));
		}),
		vscode.commands.registerCommand("wasm-playground.openFolder", function(uri: vscode.Uri) {
			vscode.commands.executeCommand("vscode.openFolder", uri);
		}),
		vscode.commands.registerCommand("wasm-playground.openTerminal", function() {
			const webWorkerPath = vscode.Uri.joinPath(context.extensionUri, "dist/webworker.js");
			return new vscode.TerminalProfile({
				name: "wasm terminal",
				pty: new WasmPseudoTerminal(memFs.wasmFs, webWorkerPath)
			});
		})
	);
	
	return { memFs };
}

function enableFs(context: vscode.ExtensionContext) {
	const memFs = new WasmMemFs();
	context.subscriptions.push(memFs);

	return memFs;
}
