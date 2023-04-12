import { promises as fs } from "fs";
import { buildExtension, downloadAndUnzipVSCode } from "./download";

async function replaceFileContent(fileName: string, replacePatterns: { pattern: string | RegExp, replaced: string }[]) {
    let content = await fs.readFile(fileName, { encoding: "utf8" });

    for (const item of replacePatterns) {
        content = content.replace(item.pattern, item.replaced);
    }

    await fs.writeFile(fileName, content, { encoding: "utf8" });
}

async function main() {

    const info = await downloadAndUnzipVSCode("v0.0.5");
    await buildExtension("siv3d-playground");

    const copiedFiles = [
        "index.html",
        "callback.html",
        "favicon.ico",
        "manifest.json",
        "config.js",
        "patches/activityBar.js",
        "patches/explorerView.js",
        "patches/keyBinding.js",
        "icon.png",
    ];

    try {
        await fs.mkdir("dist/patches");
    } catch (_) {
        //
    }

    for (const file of copiedFiles) {
        await fs.copyFile(`src/${file}`, "dist/" + file);
    }

    await replaceFileContent(
        "dist/index.html",
        [
            {
                pattern: "5e805b79fcb6ba4c2d23712967df89a089da575b/1.76.1",
                replaced: `${info.version}/${info.productVersion}`
            }
        ]
    );
    await replaceFileContent(
        "dist/extensions/github-authentication/dist/browser/extension.js", 
        [ 
            { pattern: "/(?:^|\\.)kamenokosoft\\.com$/", replaced: "/(?:^|\\.)siv3d\\.dev$/" },
            { pattern: /https:\/\/wasm-playground\.kamenokosoft\.com\/callback/g, replaced: "https://siv3d.dev/callback" },  
        ]
    );
}

main();
