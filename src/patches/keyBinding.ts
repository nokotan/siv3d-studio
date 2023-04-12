const configDBOpenRequest = indexedDB.open("vscode-web-db", 3);

configDBOpenRequest.onupgradeneeded = function(e) {
    const db = (e.target as IDBOpenDBRequest).result;
    db.createObjectStore("vscode-userdata-store");
    db.createObjectStore("vscode-logs-store");
    db.createObjectStore("vscode-filehandles-store");
};

configDBOpenRequest.onsuccess = function(_) {
    const db = configDBOpenRequest.result;
    const transaction = db.transaction("vscode-userdata-store", "readwrite");
    const store = transaction.objectStore("vscode-userdata-store");
    const keyName = "/User/keybindings.json";

    const request = store.getKey(keyName);
    request.onsuccess = function(_) {
        if (!!request.result) {
            // key found, do nothing
            return;
        }
        const desiredKeyBindings = `
[
    {
        "key": "f5",
        "command": "-debug.openView",
        "when": "!debuggersAvailable"
    }
]`;
        const encoder = new TextEncoder();
        
        store.put(encoder.encode(desiredKeyBindings), keyName);
    };
};
