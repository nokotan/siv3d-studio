import * as fs from "fs";
import { downloadAndUnzipExtensions, downloadAndUnzipVSCode } from "./download";

async function main() {
    await downloadAndUnzipVSCode("stable");
    await downloadAndUnzipExtensions("siv3d-playground", "https://github.com/nokotan/siv3d-web-playground/releases/download/v0.0.16/siv3d-playground.tgz");
    await downloadAndUnzipExtensions("emscripten-remote-build", "https://github.com/nokotan/emscripten-remote-build/releases/download/v0.0.3/emscripten-remote-build.tgz");
    fs.copyFileSync("index.html", "vscode/vscode-web/index.html");
}

main();
