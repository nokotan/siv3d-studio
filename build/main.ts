import * as fs from "fs";
import { buildExtension, downloadAndUnzipVSCode } from "./download";

async function main() {

    await downloadAndUnzipVSCode("v0.0.4");
    await buildExtension("siv3d-playground");

    const copiedFiles = [
        "index.html",
        "callback.html",
        "favicon.ico",
        "manifest.json",
        "sw.js",
        "config.js",
        "patches/activityBar.js",
        "patches/explorerView.js",
        "patches/keyBinding.js",
        "icon.png",
    ];

    fs.mkdirSync("dist/patches");

    for (const file of copiedFiles) {
        fs.copyFileSync(`src/${file}`, "dist/" + file);
    }
}

main();
