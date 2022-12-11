import * as vscode from 'vscode';
import WasmTerminal from "../wasm-terminal/src/index";
import { WasmFs } from '@wasmer/wasmfs';

export class WasmPseudoTerminal implements vscode.Pseudoterminal {
	private writeEmitter = new vscode.EventEmitter<string>();
	onDidWrite: vscode.Event<string> = this.writeEmitter.event;
	private closeEmitter = new vscode.EventEmitter<number>();
	onDidClose?: vscode.Event<number> = this.closeEmitter.event;
	private textDecoder: TextDecoder;
    private terminal: WasmTerminal;
	private callback?: (data: string) => void;

	constructor(fs: WasmFs) {
		this.textDecoder = new TextDecoder();
        this.terminal = new WasmTerminal({ 
            fetchCommand() {
                return {};
            },
            wasmFs: fs,
            tty: this,
			processWorkerUrl: "dist/webworker.js"
        });
	}

	open(initialDimensions: vscode.TerminalDimensions | undefined): void {
		this.terminal.open();
	}

	close(): void {

	}

	write(data: string) {
		this.writeEmitter.fire(data);
	}

	handleInput(data: string) {
		this.callback?.call(null, data);
	}

	onData(callback: (data: string) => void) {
		this.callback = callback;
	}
}