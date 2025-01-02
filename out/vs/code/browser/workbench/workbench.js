/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
(function() {
var __m = ["vs/code/browser/workbench/workbench","require","exports","vs/base/browser/browser","vs/base/browser/window","vs/base/common/buffer","vs/base/common/event","vs/base/common/lifecycle","vs/base/common/marshalling","vs/base/common/network","vs/base/common/path","vs/base/common/resources","vs/base/common/strings","vs/base/common/uri","vs/platform/product/common/product","vs/platform/window/common/window","vs/workbench/workbench.web.main"];
var __M = function(deps) {
  var result = [];
  for (var i = 0, len = deps.length; i < len; i++) {
    result[i] = __m[deps[i]];
  }
  return result;
};
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[0/*vs/code/browser/workbench/workbench*/], __M([1/*require*/,2/*exports*/,3/*vs/base/browser/browser*/,4/*vs/base/browser/window*/,5/*vs/base/common/buffer*/,6/*vs/base/common/event*/,7/*vs/base/common/lifecycle*/,8/*vs/base/common/marshalling*/,9/*vs/base/common/network*/,10/*vs/base/common/path*/,11/*vs/base/common/resources*/,12/*vs/base/common/strings*/,13/*vs/base/common/uri*/,14/*vs/platform/product/common/product*/,15/*vs/platform/window/common/window*/,16/*vs/workbench/workbench.web.main*/]), function (require, exports, browser_1, window_1, buffer_1, event_1, lifecycle_1, marshalling_1, network_1, path_1, resources_1, strings_1, uri_1, product_1, window_2, workbench_web_main_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LocalStorageSecretStorageProvider = void 0;
    class TransparentCrypto {
        async seal(data) {
            return data;
        }
        async unseal(data) {
            return data;
        }
    }
    var AESConstants;
    (function (AESConstants) {
        AESConstants["ALGORITHM"] = "AES-GCM";
        AESConstants[AESConstants["KEY_LENGTH"] = 256] = "KEY_LENGTH";
        AESConstants[AESConstants["IV_LENGTH"] = 12] = "IV_LENGTH";
    })(AESConstants || (AESConstants = {}));
    class ServerKeyedAESCrypto {
        /** Gets whether the algorithm is supported; requires a secure context */
        static supported() {
            return !!crypto.subtle;
        }
        constructor(b) {
            this.b = b;
        }
        async seal(data) {
            // Get a new key and IV on every change, to avoid the risk of reusing the same key and IV pair with AES-GCM
            // (see also: https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams#properties)
            const iv = window_1.$KQ.crypto.getRandomValues(new Uint8Array(12 /* AESConstants.IV_LENGTH */));
            // crypto.getRandomValues isn't a good-enough PRNG to generate crypto keys, so we need to use crypto.subtle.generateKey and export the key instead
            const clientKeyObj = await window_1.$KQ.crypto.subtle.generateKey({ name: "AES-GCM" /* AESConstants.ALGORITHM */, length: 256 /* AESConstants.KEY_LENGTH */ }, true, ['encrypt', 'decrypt']);
            const clientKey = new Uint8Array(await window_1.$KQ.crypto.subtle.exportKey('raw', clientKeyObj));
            const key = await this.c(clientKey);
            const dataUint8Array = new TextEncoder().encode(data);
            const cipherText = await window_1.$KQ.crypto.subtle.encrypt({ name: "AES-GCM" /* AESConstants.ALGORITHM */, iv }, key, dataUint8Array);
            // Base64 encode the result and store the ciphertext, the key, and the IV in localStorage
            // Note that the clientKey and IV don't need to be secret
            const result = new Uint8Array([...clientKey, ...iv, ...new Uint8Array(cipherText)]);
            return (0, buffer_1.$Oe)(buffer_1.$ue.wrap(result));
        }
        async unseal(data) {
            // encrypted should contain, in order: the key (32-byte), the IV for AES-GCM (12-byte) and the ciphertext (which has the GCM auth tag at the end)
            // Minimum length must be 44 (key+IV length) + 16 bytes (1 block encrypted with AES - regardless of key size)
            const dataUint8Array = (0, buffer_1.$Ne)(data);
            if (dataUint8Array.byteLength < 60) {
                throw Error('Invalid length for the value for credentials.crypto');
            }
            const keyLength = 256 /* AESConstants.KEY_LENGTH */ / 8;
            const clientKey = dataUint8Array.slice(0, keyLength);
            const iv = dataUint8Array.slice(keyLength, keyLength + 12 /* AESConstants.IV_LENGTH */);
            const cipherText = dataUint8Array.slice(keyLength + 12 /* AESConstants.IV_LENGTH */);
            // Do the decryption and parse the result as JSON
            const key = await this.c(clientKey.buffer);
            const decrypted = await window_1.$KQ.crypto.subtle.decrypt({ name: "AES-GCM" /* AESConstants.ALGORITHM */, iv: iv.buffer }, key, cipherText.buffer);
            return new TextDecoder().decode(new Uint8Array(decrypted));
        }
        /**
         * Given a clientKey, returns the CryptoKey object that is used to encrypt/decrypt the data.
         * The actual key is (clientKey XOR serverKey)
         */
        async c(clientKey) {
            if (!clientKey || clientKey.byteLength !== 256 /* AESConstants.KEY_LENGTH */ / 8) {
                throw Error('Invalid length for clientKey');
            }
            const serverKey = await this.d();
            const keyData = new Uint8Array(256 /* AESConstants.KEY_LENGTH */ / 8);
            for (let i = 0; i < keyData.byteLength; i++) {
                keyData[i] = clientKey[i] ^ serverKey[i];
            }
            return window_1.$KQ.crypto.subtle.importKey('raw', keyData, {
                name: "AES-GCM" /* AESConstants.ALGORITHM */,
                length: 256 /* AESConstants.KEY_LENGTH */,
            }, true, ['encrypt', 'decrypt']);
        }
        async d() {
            if (this.a) {
                return this.a;
            }
            let attempt = 0;
            let lastError;
            while (attempt <= 3) {
                try {
                    const res = await fetch(this.b, { credentials: 'include', method: 'POST' });
                    if (!res.ok) {
                        throw new Error(res.statusText);
                    }
                    const serverKey = new Uint8Array(await await res.arrayBuffer());
                    if (serverKey.byteLength !== 256 /* AESConstants.KEY_LENGTH */ / 8) {
                        throw Error(`The key retrieved by the server is not ${256 /* AESConstants.KEY_LENGTH */} bit long.`);
                    }
                    this.a = serverKey;
                    return this.a;
                }
                catch (e) {
                    lastError = e;
                    attempt++;
                    // exponential backoff
                    await new Promise(resolve => setTimeout(resolve, attempt * attempt * 100));
                }
            }
            throw lastError;
        }
    }
    class LocalStorageSecretStorageProvider {
        constructor(c) {
            this.c = c;
            this.a = 'secrets.provider';
            this.b = this.d();
            this.type = 'persisted';
        }
        async d() {
            const record = this.f();
            // Get the secrets from localStorage
            const encrypted = localStorage.getItem(this.a);
            if (encrypted) {
                try {
                    const decrypted = JSON.parse(await this.c.unseal(encrypted));
                    return { ...record, ...decrypted };
                }
                catch (err) {
                    // TODO: send telemetry
                    console.error('Failed to decrypt secrets from localStorage', err);
                    localStorage.removeItem(this.a);
                }
            }
            return record;
        }
        f() {
            let authSessionInfo;
            const authSessionElement = window_1.$KQ.document.getElementById('vscode-workbench-auth-session');
            const authSessionElementAttribute = authSessionElement ? authSessionElement.getAttribute('data-settings') : undefined;
            if (authSessionElementAttribute) {
                try {
                    authSessionInfo = JSON.parse(authSessionElementAttribute);
                }
                catch (error) { /* Invalid session is passed. Ignore. */ }
            }
            if (!authSessionInfo) {
                return {};
            }
            const record = {};
            // Settings Sync Entry
            record[`${product_1.default.urlProtocol}.loginAccount`] = JSON.stringify(authSessionInfo);
            // Auth extension Entry
            if (authSessionInfo.providerId !== 'github') {
                console.error(`Unexpected auth provider: ${authSessionInfo.providerId}. Expected 'github'.`);
                return record;
            }
            const authAccount = JSON.stringify({ extensionId: 'vscode.github-authentication', key: 'github.auth' });
            record[authAccount] = JSON.stringify(authSessionInfo.scopes.map(scopes => ({
                id: authSessionInfo.id,
                scopes,
                accessToken: authSessionInfo.accessToken
            })));
            return record;
        }
        async get(key) {
            const secrets = await this.b;
            return secrets[key];
        }
        async set(key, value) {
            const secrets = await this.b;
            secrets[key] = value;
            this.b = Promise.resolve(secrets);
            this.g();
        }
        async delete(key) {
            const secrets = await this.b;
            delete secrets[key];
            this.b = Promise.resolve(secrets);
            this.g();
        }
        async g() {
            try {
                const encrypted = await this.c.seal(JSON.stringify(await this.b));
                localStorage.setItem(this.a, encrypted);
            }
            catch (err) {
                console.error(err);
            }
        }
    }
    exports.LocalStorageSecretStorageProvider = LocalStorageSecretStorageProvider;
    class LocalStorageURLCallbackProvider extends lifecycle_1.$Uc {
        static { this.a = 0; }
        static { this.b = [
            'scheme',
            'authority',
            'path',
            'query',
            'fragment'
        ]; }
        constructor(m) {
            super();
            this.m = m;
            this.c = this.B(new event_1.$7d());
            this.onCallback = this.c.event;
            this.f = new Set();
            this.g = Date.now();
            this.h = undefined;
        }
        create(options = {}) {
            const id = ++LocalStorageURLCallbackProvider.a;
            const queryParams = [`vscode-reqid=${id}`];
            for (const key of LocalStorageURLCallbackProvider.b) {
                const value = options[key];
                if (value) {
                    queryParams.push(`vscode-${key}=${encodeURIComponent(value)}`);
                }
            }
            // TODO@joao remove eventually
            // https://github.com/microsoft/vscode-dev/issues/62
            // https://github.com/microsoft/vscode/blob/159479eb5ae451a66b5dac3c12d564f32f454796/extensions/github-authentication/src/githubServer.ts#L50-L50
            if (!(options.authority === 'vscode.github-authentication' && options.path === '/dummy')) {
                const key = `vscode-web.url-callbacks[${id}]`;
                localStorage.removeItem(key);
                this.f.add(id);
                this.n();
            }
            return uri_1.URI.parse(window_1.$KQ.location.href).with({ path: this.m, query: queryParams.join('&') });
        }
        n() {
            if (this.j) {
                return;
            }
            const fn = () => this.s();
            window_1.$KQ.addEventListener('storage', fn);
            this.j = { dispose: () => window_1.$KQ.removeEventListener('storage', fn) };
        }
        r() {
            this.j?.dispose();
            this.j = undefined;
        }
        // this fires every time local storage changes, but we
        // don't want to check more often than once a second
        async s() {
            const ellapsed = Date.now() - this.g;
            if (ellapsed > 1000) {
                this.t();
            }
            else if (this.h === undefined) {
                this.h = setTimeout(() => {
                    this.h = undefined;
                    this.t();
                }, 1000 - ellapsed);
            }
        }
        t() {
            let pendingCallbacks;
            for (const id of this.f) {
                const key = `vscode-web.url-callbacks[${id}]`;
                const result = localStorage.getItem(key);
                if (result !== null) {
                    try {
                        this.c.fire(uri_1.URI.revive(JSON.parse(result)));
                    }
                    catch (error) {
                        console.error(error);
                    }
                    pendingCallbacks = pendingCallbacks ?? new Set(this.f);
                    pendingCallbacks.delete(id);
                    localStorage.removeItem(key);
                }
            }
            if (pendingCallbacks) {
                this.f = pendingCallbacks;
                if (this.f.size === 0) {
                    this.r();
                }
            }
            this.g = Date.now();
        }
    }
    class WorkspaceProvider {
        static { this.a = 'ew'; }
        static { this.b = 'folder'; }
        static { this.c = 'workspace'; }
        static { this.d = 'payload'; }
        static create(config) {
            let foundWorkspace = false;
            let workspace;
            let payload = Object.create(null);
            const query = new URL(document.location.href).searchParams;
            query.forEach((value, key) => {
                switch (key) {
                    // Folder
                    case WorkspaceProvider.b:
                        if (config.remoteAuthority && value.startsWith(path_1.$hc.sep)) {
                            // when connected to a remote and having a value
                            // that is a path (begins with a `/`), assume this
                            // is a vscode-remote resource as simplified URL.
                            workspace = { folderUri: uri_1.URI.from({ scheme: network_1.Schemas.vscodeRemote, path: value, authority: config.remoteAuthority }) };
                        }
                        else {
                            workspace = { folderUri: uri_1.URI.parse(value) };
                        }
                        foundWorkspace = true;
                        break;
                    // Workspace
                    case WorkspaceProvider.c:
                        if (config.remoteAuthority && value.startsWith(path_1.$hc.sep)) {
                            // when connected to a remote and having a value
                            // that is a path (begins with a `/`), assume this
                            // is a vscode-remote resource as simplified URL.
                            workspace = { workspaceUri: uri_1.URI.from({ scheme: network_1.Schemas.vscodeRemote, path: value, authority: config.remoteAuthority }) };
                        }
                        else {
                            workspace = { workspaceUri: uri_1.URI.parse(value) };
                        }
                        foundWorkspace = true;
                        break;
                    // Empty
                    case WorkspaceProvider.a:
                        workspace = undefined;
                        foundWorkspace = true;
                        break;
                    // Payload
                    case WorkspaceProvider.d:
                        try {
                            payload = (0, marshalling_1.$Qh)(value); // use marshalling#parse() to revive potential URIs
                        }
                        catch (error) {
                            console.error(error); // possible invalid JSON
                        }
                        break;
                }
            });
            // If no workspace is provided through the URL, check for config
            // attribute from server
            if (!foundWorkspace) {
                if (config.folderUri) {
                    workspace = { folderUri: uri_1.URI.revive(config.folderUri) };
                }
                else if (config.workspaceUri) {
                    workspace = { workspaceUri: uri_1.URI.revive(config.workspaceUri) };
                }
            }
            return new WorkspaceProvider(workspace, payload, config);
        }
        constructor(workspace, payload, f) {
            this.workspace = workspace;
            this.payload = payload;
            this.f = f;
            this.trusted = true;
        }
        async open(workspace, options) {
            if (options?.reuse && !options.payload && this.j(this.workspace, workspace)) {
                return true; // return early if workspace and environment is not changing and we are reusing window
            }
            const targetHref = this.g(workspace, options);
            if (targetHref) {
                if (options?.reuse) {
                    window_1.$KQ.location.href = targetHref;
                    return true;
                }
                else {
                    let result;
                    if ((0, browser_1.$4Q)()) {
                        result = window_1.$KQ.open(targetHref, '_blank', 'toolbar=no'); // ensures to open another 'standalone' window!
                    }
                    else {
                        result = window_1.$KQ.open(targetHref);
                    }
                    return !!result;
                }
            }
            return false;
        }
        g(workspace, options) {
            // Empty
            let targetHref = undefined;
            if (!workspace) {
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.a}=true`;
            }
            // Folder
            else if ((0, window_2.$gD)(workspace)) {
                const queryParamFolder = this.h(workspace.folderUri);
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.b}=${queryParamFolder}`;
            }
            // Workspace
            else if ((0, window_2.$fD)(workspace)) {
                const queryParamWorkspace = this.h(workspace.workspaceUri);
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.c}=${queryParamWorkspace}`;
            }
            // Append payload if any
            if (options?.payload) {
                targetHref += `&${WorkspaceProvider.d}=${encodeURIComponent(JSON.stringify(options.payload))}`;
            }
            return targetHref;
        }
        h(uri) {
            if (this.f.remoteAuthority && uri.scheme === network_1.Schemas.vscodeRemote) {
                // when connected to a remote and having a folder
                // or workspace for that remote, only use the path
                // as query value to form shorter, nicer URLs.
                // however, we still need to `encodeURIComponent`
                // to ensure to preserve special characters, such
                // as `+` in the path.
                return encodeURIComponent(`${path_1.$hc.sep}${(0, strings_1.$5e)(uri.path, path_1.$hc.sep)}`).replaceAll('%2F', '/');
            }
            return encodeURIComponent(uri.toString(true));
        }
        j(workspaceA, workspaceB) {
            if (!workspaceA || !workspaceB) {
                return workspaceA === workspaceB; // both empty
            }
            if ((0, window_2.$gD)(workspaceA) && (0, window_2.$gD)(workspaceB)) {
                return (0, resources_1.$Og)(workspaceA.folderUri, workspaceB.folderUri); // same workspace
            }
            if ((0, window_2.$fD)(workspaceA) && (0, window_2.$fD)(workspaceB)) {
                return (0, resources_1.$Og)(workspaceA.workspaceUri, workspaceB.workspaceUri); // same workspace
            }
            return false;
        }
        hasRemote() {
            if (this.workspace) {
                if ((0, window_2.$gD)(this.workspace)) {
                    return this.workspace.folderUri.scheme === network_1.Schemas.vscodeRemote;
                }
                if ((0, window_2.$fD)(this.workspace)) {
                    return this.workspace.workspaceUri.scheme === network_1.Schemas.vscodeRemote;
                }
            }
            return true;
        }
    }
    function readCookie(name) {
        const cookies = document.cookie.split('; ');
        for (const cookie of cookies) {
            if (cookie.startsWith(name + '=')) {
                return cookie.substring(name.length + 1);
            }
        }
        return undefined;
    }
    (function () {
        // Find config by checking for DOM
        const configElement = window_1.$KQ.document.getElementById('vscode-workbench-web-configuration');
        const configElementAttribute = configElement ? configElement.getAttribute('data-settings') : undefined;
        if (!configElement || !configElementAttribute) {
            throw new Error('Missing web configuration element');
        }
        const config = JSON.parse(configElementAttribute);
        const secretStorageKeyPath = readCookie('vscode-secret-key-path');
        const secretStorageCrypto = secretStorageKeyPath && ServerKeyedAESCrypto.supported()
            ? new ServerKeyedAESCrypto(secretStorageKeyPath) : new TransparentCrypto();
        // Create workbench
        (0, workbench_web_main_1.create)(window_1.$KQ.document.body, {
            ...config,
            windowIndicator: config.windowIndicator ?? { label: '$(remote)', tooltip: `${product_1.default.nameShort} Web` },
            settingsSyncOptions: config.settingsSyncOptions ? { enabled: config.settingsSyncOptions.enabled, } : undefined,
            workspaceProvider: WorkspaceProvider.create(config),
            urlCallbackProvider: new LocalStorageURLCallbackProvider(config.callbackRoute),
            secretStorageProvider: config.remoteAuthority && !secretStorageKeyPath
                ? undefined /* with a remote without embedder-preferred storage, store on the remote */
                : new LocalStorageSecretStorageProvider(secretStorageCrypto),
        });
    })();
});

}).call(this);
//# sourceMappingURL=workbench.js.map
