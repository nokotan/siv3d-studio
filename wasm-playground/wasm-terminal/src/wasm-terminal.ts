// The Wasm Terminal
// import { WebglAddon } from 'xterm-addon-webgl';

import WasmTerminalConfig from "./wasm-terminal-config";
import WasmTty from "./wasm-tty/wasm-tty";
import WasmShell from "./wasm-shell/wasm-shell";

const MOBILE_KEYBOARD_EVENTS = ["click", "tap"];

export default class WasmTerminal {
  
  wasmTerminalConfig: WasmTerminalConfig;
  wasmTty: WasmTty;
  wasmShell: WasmShell;

  constructor(config: any) {
    this.wasmTerminalConfig = new WasmTerminalConfig(config);

    // Create our Shell and tty
    this.wasmTty = new WasmTty(config.tty);
    this.wasmShell = new WasmShell(this.wasmTerminalConfig, this.wasmTty);
    
    config.tty.onData(this.wasmShell.handleData);
  }

  open() {
    this.wasmShell.prompt();
  }

  setDimension(dimensions: {
    cols: number;
    rows: number;
  }) {
    this.wasmTty.setTermSize(dimensions.cols, dimensions.rows);
  }
}
