import * as fs from "fs";
import { buildExtension, downloadAndUnzipVSCode, downloadExternalRepository } from "./download";

function replaceFileContentSync(fileName: string, replacePatterns: { pattern: string | RegExp, replaced: string }[]) {
    let content = fs.readFileSync(fileName, { encoding: "utf8" });

    for (const item of replacePatterns) {
        content = content.replace(item.pattern, item.replaced);
    }

    fs.writeFileSync(fileName, content, { encoding: "utf8" });
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
    fs.copyFileSync("callback.html", "vscode/vscode-web/callback.html");
    replaceFileContentSync(
        "vscode/vscode-web/extensions/github-authentication/dist/browser/extension.js", 
        [ 
            { pattern: "/(?:^|\\.)github\\.dev$/", replaced: "/(?:^|\\.)siv3d\\.dev$/" },
            { pattern: /https:\/\/vscode.dev\/redirect/g, replaced: "https://siv3d.dev/callback" },
            { pattern: "01ab8ac9400c4e429b23", replaced: "49ba0b7a0fa218f5973a" },   
        ]
    );
    fs.copyFileSync("favicon.ico", "vscode/vscode-web/favicon.ico");
}

main();
