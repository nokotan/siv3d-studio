import * as fs from "fs";
import { buildExtension, downloadAndUnzipVSCode, downloadExternalRepository } from "./download";

function replaceFileContentSync(fileName: string, pattern: string, replaced: string) {
    const content = fs.readFileSync(fileName, { encoding: "utf8" });
    fs.writeFileSync(fileName, content.replace(pattern, replaced), { encoding: "utf8" });
}

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
    fs.copyFileSync("vscode/vscode-web/out/vs/code/browser/workbench/callback.html", "vscode/vscode-web/callback.html");
    replaceFileContentSync("vscode/vscode-web/extensions/github-authentication/dist/browser/extension.js", "/(?:^|\\.)github\\.dev$/", "/(?:^|\\.)siv3d\\.dev$/");
    fs.copyFileSync("favicon.ico", "vscode/vscode-web/favicon.ico");
}

main();
