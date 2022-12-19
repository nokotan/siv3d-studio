import * as fs from "fs";
import { buildExtension, downloadAndUnzipVSCode, downloadExternalRepository } from "./download";

async function main() {
    await downloadAndUnzipVSCode("stable");
    await downloadExternalRepository("https://github.com/lostintangent/gistpad.git");

    await buildExtension("siv3d-playground");
    await buildExtension("wasm-playground");
    await buildExtension("emscripten-remote-build");
    await buildExtension("gistpad", {
        vsceOptions: [ "" ],
        projectName: "gistfs"
    });
    
    fs.copyFileSync("index.html", "vscode/vscode-web/index.html");
    fs.copyFileSync("favicon.ico", "vscode/vscode-web/favicon.ico");
}

main();
