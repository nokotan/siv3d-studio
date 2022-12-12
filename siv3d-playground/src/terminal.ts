import * as vscode from 'vscode';
import WasmTerminal from "../wasm-terminal/src/index";
import { WasmFs } from '@wasmer/wasmfs';
import WAPM from "../wapm/src/services/wapm/wapm";

export class WasmPseudoTerminal implements vscode.Pseudoterminal {
	private writeEmitter = new vscode.EventEmitter<string>();
	onDidWrite: vscode.Event<string> = this.writeEmitter.event;
	private closeEmitter = new vscode.EventEmitter<number>();
	onDidClose?: vscode.Event<number> = this.closeEmitter.event;
	private textDecoder: TextDecoder;
    private terminal: WasmTerminal;
	private wapm: WAPM;
	private callback?: (data: string) => void;

	constructor(fs: WasmFs) {
		const bindedThis = this;

		this.textDecoder = new TextDecoder();
        this.terminal = new WasmTerminal({ 
            async fetchCommand(option: { args: string[] }) {
                return await bindedThis.wapm.runCommand(option);
            },
            wasmFs: fs,
            tty: this,
			processWorkerUrl: "dist/webworker.js"
        });
		this.wapm = new WAPM(this.terminal, fs);
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