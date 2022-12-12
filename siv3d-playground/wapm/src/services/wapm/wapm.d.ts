import WasmTerminal from "../../../../wasm-terminal/src/wasm-terminal";
import { WasmFs } from "@wasmer/wasmfs";

export default class WAPM {

    constructor(wasmTerminal: WasmTerminal, wasmFs: WasmFs);

    runCommand(options: { args: string[] }): Promise<{ args: string[], module: WebAssembly.Module }>;

    installWasmBinary(commandName: string, wasmBinary: Uint8Array): Promise<void>;
}
