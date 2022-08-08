import * as fs from "fs";
import { downloadAndUnzipVSCode } from "./download";

async function main() {
    await downloadAndUnzipVSCode("stable");
    fs.copyFileSync("index.html", "vscode/vscode-web/index.html");
}

main();
