import {
	FileSystemProvider,
	Uri,
	workspace,
} from 'vscode';

async function readFileFromTemplate(fs: FileSystemProvider, workspaceRoot: Uri, extensionBase: Uri, sourcePath: string, targetPath?: string): Promise<void> {
    const fileContent = await workspace.fs.readFile(Uri.joinPath(extensionBase, "template", sourcePath));
    const targetFilePath = targetPath || sourcePath;
    fs.writeFile(Uri.joinPath(workspaceRoot, targetFilePath), fileContent, { create: true, overwrite: false });
}

async function fetchFile(fs: FileSystemProvider, workspaceRoot: Uri, fetchBase: string, sourcePath: string, targetPath?: string): Promise<void> {
    const fileResponse = await fetch(Uri.joinPath(Uri.parse(fetchBase), sourcePath).toString());
    const fileContent = await fileResponse.arrayBuffer();
    const targetFilePath = targetPath || sourcePath;
    fs.writeFile(Uri.joinPath(workspaceRoot, targetFilePath), new Uint8Array(fileContent), { create: true, overwrite: false });
}

export async function loadInitialAssets(fs: FileSystemProvider, workspaceRoot: Uri, extensionBase: Uri) {
    const promises: Promise<void>[] = [];

    // fs.createDirectory(workspaceRoot);
    promises.push(readFileFromTemplate(fs, workspaceRoot, extensionBase, "main.html"));
    promises.push(readFileFromTemplate(fs, workspaceRoot, extensionBase, "README.md"));
        
    fs.createDirectory(Uri.joinPath(workspaceRoot, ".vscode"));
    promises.push(readFileFromTemplate(fs, workspaceRoot, extensionBase, ".vscode/tasks.json"));
    
    fs.createDirectory(Uri.joinPath(workspaceRoot, "src"));
    promises.push(readFileFromTemplate(fs, workspaceRoot, extensionBase, "src/Main.cpp"));

    fs.createDirectory(Uri.joinPath(workspaceRoot, "include"));

    await Promise.all(promises);
}

export async function loadAdditionalAssets(fs: FileSystemProvider, workspaceRoot: Uri) {
    const promises: Promise<void>[] = [];

    const downloadUrl = workspace.getConfiguration("siv3d-playground").get<string>("siv3d-assets-download-url");

    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "lib/Siv3D.wasm", "Siv3D.wasm"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "lib/Siv3D.js", "Siv3D.js"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "lib/Siv3D.data", "Siv3D.data"));

    await Promise.all(promises);

    fs.createDirectory(Uri.joinPath(workspaceRoot, "example"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/windmill.png"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/example/particle.png"));

    fs.createDirectory(Uri.joinPath(workspaceRoot, "example/geojson"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/geojson/countries.geojson"));

    fs.createDirectory(Uri.joinPath(workspaceRoot, "example/texture"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/texture/uv.png"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/texture/grass.jpg"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/texture/rock.jpg"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/texture/ground.jpg"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/texture/earth.jpg"));

    fs.createDirectory(Uri.joinPath(workspaceRoot, "example/shader"));
    fs.createDirectory(Uri.joinPath(workspaceRoot, "example/shader/essl"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/shader/essl/terrain_forward.vert"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/shader/essl/terrain_forward.frag"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/shader/essl/terrain_normal.frag"));

    fs.createDirectory(Uri.joinPath(workspaceRoot, "example/obj"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/obj/blacksmith.obj"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/obj/mill.obj"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/obj/tree.obj"));
    promises.push(fetchFile(fs, workspaceRoot, downloadUrl, "example/obj/pine.obj"));
        
    await Promise.all(promises);
}