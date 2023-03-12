function updateWorkspaceDataBase(databaseName) {
    const workspaceDBOpenRequest = indexedDB.open(databaseName, 1);

    workspaceDBOpenRequest.onupgradeneeded = function(e) {
        const db = (e.target as IDBOpenDBRequest).result;
        db.createObjectStore("ItemTable");
    };

    workspaceDBOpenRequest.onsuccess = function(e) {
        const db = (e.target as IDBOpenDBRequest).result;
        const transaction = db.transaction("ItemTable", "readwrite")
        const store = transaction.objectStore("ItemTable");

        store.put("", "workbench.sidebar.activeviewletid");
    };
}

if (window.matchMedia("(max-width: 400px)").matches) {
    updateWorkspaceDataBase("vscode-web-state-db--5b40c8f4");
}
