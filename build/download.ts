/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { promises as fs, existsSync, createWriteStream } from 'fs';
import * as path from 'path';

import * as https from 'https';
import * as http from 'http';
import * as createHttpsProxyAgent from 'https-proxy-agent';
import * as createHttpProxyAgent from 'http-proxy-agent';
import { URL } from 'url';

import * as decompress from 'decompress';
import { execSync } from 'child_process';

export interface Static {
	readonly type: 'static';
	readonly location: string;
	readonly quality: 'stable' | 'insider';
	readonly productVersion: string;
	readonly version: string;
}

const reset = '\x1b[G\x1b[0K';

async function download(downloadUrl: string, destination: string, message: string) {
	process.stdout.write(message);

	return new Promise((resolve, reject) => {
		const httpLibrary = downloadUrl.startsWith('https') ? https : http;

		httpLibrary.get(downloadUrl, getAgent(downloadUrl), res => {
			if (res.statusCode === 302 && res.headers.location) {
				download(res.headers.location, destination, "").then(() => resolve(destination));
				return;
			}

			const total = Number(res.headers['content-length']);
			let received = 0;
			let timeout: NodeJS.Timeout | undefined;

			const outStream = createWriteStream(destination);
			outStream.on('close', () => resolve(destination));
			outStream.on('error', reject);

			res.on('data', chunk => {
				if (!timeout) {
					timeout = setTimeout(() => {
						process.stdout.write(`${reset}${message}: ${received}/${total} (${(received / total * 100).toFixed()}%)`);
						timeout = undefined;
					}, 100);
				}

				received += chunk.length;
			});
			res.on('end', () => {
				if (timeout) {
					clearTimeout(timeout);
				}

				process.stdout.write(`${reset}${message}: complete\n`);
			});


			res.on('error', reject);
			res.pipe(outStream);
		});
	});
}

async function unzip(source: string, destination: string, message: string, strip?: number) {
	process.stdout.write(message);
	if (!existsSync(destination)) {
		await fs.mkdir(destination, { recursive: true });
	}

	await decompress(source, destination, {
		strip
	});
	process.stdout.write(`${reset}${message}: complete\n`);
}

export async function downloadAndUnzipVSCode(version: string): Promise<Static> {

	const installationPath = path.resolve(process.cwd(), "dist");

	if (existsSync(installationPath) && existsSync(path.join(installationPath, 'version'))) {
		const versionPath = path.join(installationPath, 'version');
		const versionInfo = await fs.readFile(versionPath, { encoding: 'utf8' });
		return JSON.parse(versionInfo);
	}

	const downloadURL = `https://github.com/nokotan/wasm-playground/releases/download/${version}/wasm-playground.tar.gz`;
	const tmpArchiveName = `wasm-playground-${version}-tmp.tar.gz`;

	try {
		await download(downloadURL, tmpArchiveName, `Downloading`);
		await unzip(tmpArchiveName, installationPath, `Unpacking`);
	} catch (err) {
		console.error(err);
		throw Error(`Failed to download and unpack`);
	} finally {
		try {
			fs.unlink(tmpArchiveName);
		} catch (e) {
			// ignore
		}
	}

	const versionPath = path.join(installationPath, 'version');
	const versionInfo = await fs.readFile(versionPath, { encoding: 'utf8' });
	
	return JSON.parse(versionInfo);
}

function hasStdOut(object: unknown): object is { stdout: string, stderr: string } {
	const arg = object as any;

	return arg !== null
		&& typeof arg === "object"
		&& typeof arg.stdout === "string"
		&& typeof arg.stderr === "string";
}

export async function downloadExternalRepository(extensionRepository: string) {

	const extensionName = path.basename(extensionRepository, ".git");

	if (!existsSync(extensionName)) {
		execSync(`git clone ${extensionRepository} ${extensionName}`);
	}
}

export interface BuildExtensionConfig {
	vsceOptions: string[],
	projectName?: string
}

export async function buildExtension(extensionName: string, options?: BuildExtensionConfig): Promise<void> {

	if (!options) {
		options = {
			vsceOptions: [ "--no-dependencies" ]
		};
	}

	const installationPath = path.resolve("dist", `addon/${extensionName}`);
	const tmpArchiveName = path.resolve(extensionName, `${extensionName}.vsix`);
	const projectName = options.projectName || extensionName;

	try {
		execSync(`cd ${extensionName} && npm install && npx vsce package ${options.vsceOptions.join(" ")} && mv ${projectName}-*.vsix ${extensionName}.vsix`, { encoding: "utf8", stdio: "inherit" });
		await unzip(tmpArchiveName, installationPath, `Unpacking ${extensionName}`);
	} catch (err) {
		if (hasStdOut(err)) {
			console.log(err.stdout);
			console.log(err.stderr);
		}
		throw Error(`Failed to download and unpack ${extensionName}`);
	} finally {
		try {
			fs.unlink(tmpArchiveName);
		} catch (e) {
			// ignore
		}
	}
}

export async function fetch(api: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const httpLibrary = api.startsWith('https') ? https : http;
		httpLibrary.get(api, getAgent(api), res => {
			if (res.statusCode !== 200) {
				reject('Failed to get content from ');
			}

			let data = '';

			res.on('data', chunk => {
				data += chunk;
			});

			res.on('end', () => {
				resolve(data);
			});

			res.on('error', err => {
				reject(err);
			});
		});
	});
}

export async function fetchJSON<T>(api: string): Promise<T> {
	const data = await fetch(api);
	try {
		return JSON.parse(data);
	} catch (err) {
		throw new Error(`Failed to parse response from ${api}`);
	}
}

let PROXY_AGENT: createHttpProxyAgent.HttpProxyAgent | undefined = undefined;
let HTTPS_PROXY_AGENT: createHttpsProxyAgent.HttpsProxyAgent | undefined = undefined;

if (process.env.npm_config_proxy) {
	PROXY_AGENT = createHttpProxyAgent(process.env.npm_config_proxy);
	HTTPS_PROXY_AGENT = createHttpsProxyAgent(process.env.npm_config_proxy);
}
if (process.env.npm_config_https_proxy) {
	HTTPS_PROXY_AGENT = createHttpsProxyAgent(process.env.npm_config_https_proxy);
}

function getAgent(url: string): https.RequestOptions {
	const parsed = new URL(url);
	const options: https.RequestOptions = {};
	if (PROXY_AGENT && parsed.protocol.startsWith('http:')) {
		options.agent = PROXY_AGENT;
	}

	if (HTTPS_PROXY_AGENT && parsed.protocol.startsWith('https:')) {
		options.agent = HTTPS_PROXY_AGENT;
	}

	return options;
}

export async function directoryExists(path: string): Promise<boolean> {
	try {
		const stats = await fs.stat(path);
		return stats.isDirectory();
	} catch {
		return false;
	}
}

export async function fileExists(path: string): Promise<boolean> {
	try {
		const stats = await fs.stat(path);
		return stats.isFile();
	} catch {
		return false;
	}
}
