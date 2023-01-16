import {
	FileSystemProvider,
	Uri,
	workspace,
} from 'vscode';

async function readFileFromTemplate(workspaceRoot: Uri, extensionBase: Uri, sourcePath: string, targetPath?: string): Promise<void> {
    const fileContent = await workspace.fs.readFile(Uri.joinPath(extensionBase, "template", sourcePath));
    const targetFilePath = targetPath || sourcePath;
    await workspace.fs.writeFile(Uri.joinPath(workspaceRoot, targetFilePath), fileContent);
}

async function fetchFile(workspaceRoot: Uri, fetchBase: string, sourcePath: string, targetPath?: string): Promise<void> {
    const fileResponse = await fetch(Uri.joinPath(Uri.parse(fetchBase), sourcePath).toString());
    const fileContent = await fileResponse.arrayBuffer();
    const targetFilePath = targetPath || sourcePath;
    await workspace.fs.writeFile(Uri.joinPath(workspaceRoot, targetFilePath), new Uint8Array(fileContent));
}

export async function loadInitialAssets(workspaceRoot: Uri, extensionBase: Uri) {
    const promises: Promise<void>[] = [];

    // await workspace.fs.createDirectory(workspaceRoot);
    promises.push(readFileFromTemplate(workspaceRoot, extensionBase, "README.md"));
    
    await workspace.fs.createDirectory(Uri.joinPath(workspaceRoot, "src"));
    promises.push(readFileFromTemplate(workspaceRoot, extensionBase, "src/Main.cpp"));

    await workspace.fs.createDirectory(Uri.joinPath(workspaceRoot, "include"));

    await Promise.allSettled(promises);
}

export async function loadAdditionalAssets(workspaceRoot: Uri, extensionBase: Uri) {
    const promises: Promise<void>[] = [];

    const downloadUrl = workspace.getConfiguration("siv3d-playground").get<string>("siv3d-assets-download-url");

    promises.push(readFileFromTemplate(workspaceRoot, extensionBase, "main.html"));

    await workspace.fs.createDirectory(Uri.joinPath(workspaceRoot, ".vscode"));
    promises.push(readFileFromTemplate(workspaceRoot, extensionBase, ".vscode/tasks.json"));

    promises.push(fetchFile(workspaceRoot, downloadUrl, "lib/Siv3D.wasm", "Siv3D.wasm"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "lib/Siv3D.js", "Siv3D.js"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "lib/Siv3D.data", "Siv3D.data"));

    await Promise.allSettled(promises);

    await workspace.fs.createDirectory(Uri.joinPath(workspaceRoot, "example"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/windmill.png"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/particle.png"));

    await workspace.fs.createDirectory(Uri.joinPath(workspaceRoot, "example/geojson"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/geojson/countries.geojson"));

    await workspace.fs.createDirectory(Uri.joinPath(workspaceRoot, "example/texture"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/texture/uv.png"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/texture/grass.jpg"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/texture/rock.jpg"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/texture/ground.jpg"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/texture/earth.jpg"));

    await workspace.fs.createDirectory(Uri.joinPath(workspaceRoot, "example/shader"));
    await workspace.fs.createDirectory(Uri.joinPath(workspaceRoot, "example/shader/essl"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/shader/essl/terrain_forward.vert"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/shader/essl/terrain_forward.frag"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/shader/essl/terrain_normal.frag"));

    await workspace.fs.createDirectory(Uri.joinPath(workspaceRoot, "example/obj"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/obj/blacksmith.obj"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/obj/mill.obj"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/obj/tree.obj"));
    promises.push(fetchFile(workspaceRoot, downloadUrl, "example/obj/pine.obj"));
        
    await Promise.allSettled(promises);
}