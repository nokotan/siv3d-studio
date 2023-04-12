const applicationDBOpenRequest = indexedDB.open("vscode-web-state-db-global", 1);

applicationDBOpenRequest.onupgradeneeded = function(e) {
    const db = (e.target as IDBOpenDBRequest).result;
    db.createObjectStore("ItemTable");
};

applicationDBOpenRequest.onsuccess = function(e) {
    const db = (e.target as IDBOpenDBRequest).result;
    const transaction = db.transaction("ItemTable", "readwrite");
    const store = transaction.objectStore("ItemTable");

    const request = store.getKey("workbench.activity.pinnedViewlets2");
    request.onsuccess = function(_) {
        if (!!request.result) {
            // key found, do nothing
            return;
        }

        const preferredActivityBarStates = [
            {
                id: "workbench.view.explorer",
                pinned: true,
                visible: true,
                order: 0
            },
            {
                id: "workbench.view.search",
                pinned: true,
                visible: true,
                order: 1
            },
            {
                id: "workbench.view.scm",
                pinned: false,
                visible: true,
                order: 2
            },
            {
                id: "workbench.view.debug",
                pinned: false,
                visible: true,
                order: 3
            },
            {
                id: "workbench.view.extensions",
                pinned: false,
                visible: true,
                order: 4
            },
            {
                id: "workbench.view.extension.gistpad",
                pinned: false,
                visible: true,
                order: 5
            }
        ];
    
        store.put(JSON.stringify(preferredActivityBarStates), "workbench.activity.pinnedViewlets2");
        store.put(JSON.stringify([ "status.feedback" ]), "workbench.statusbar.hidden");
        store.put("false", "workbench.activity.showAccounts");
        store.put("", "workbench.sidebar.activeviewletid");
    };
};