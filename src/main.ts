import * as fs from "fs";
import { buildExtension, downloadAndUnzipVSCode } from "./download";

async function main() {
    await downloadAndUnzipVSCode("stable");
    await buildExtension("siv3d-playground");
    await buildExtension("wasm-playground");
    await buildExtension("emscripten-remote-build");
    
    fs.copyFileSync("index.html", "vscode/vscode-web/index.html");
    fs.copyFileSync("favicon.ico", "vscode/vscode-web/favicon.ico");
}

main();
