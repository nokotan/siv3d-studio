import * as fs from "fs";
import { downloadAndUnzipExtensions, downloadAndUnzipVSCode, fetchExtensionsFromRepository } from "./download";

async function main() {
    await downloadAndUnzipVSCode("stable");

    if (process.argv.includes("--release")) {
        await downloadAndUnzipExtensions("siv3d-playground", "https://github.com/nokotan/siv3d-web-playground/releases/download/v0.0.18/siv3d-playground.tgz");
        await downloadAndUnzipExtensions("emscripten-remote-build", "https://github.com/nokotan/emscripten-remote-build/releases/download/v0.0.5/emscripten-remote-build.tgz");
    } else {
        await fetchExtensionsFromRepository("siv3d-playground", "https://github.com/nokotan/siv3d-web-playground.git");
        await fetchExtensionsFromRepository("emscripten-remote-build", "https://github.com/nokotan/emscripten-remote-build.git");
    }
    fs.copyFileSync("index.html", "vscode/vscode-web/index.html");
    fs.copyFileSync("favicon.ico", "vscode/vscode-web/favicon.ico");
}

main();
