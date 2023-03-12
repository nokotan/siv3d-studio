const config = {
    additionalBuiltinExtensions: [	
        { 
            scheme: "https",
            authority: "siv3d.dev",
            path: "/addon/wasm-playground/extension"
        },
        { 
            scheme: "https",
            authority: "siv3d.dev",
            path: "/addon/siv3d-playground/extension"
        },
        {
            scheme: "https",
            authority: "siv3d.dev",
            path: "/addon/emscripten-remote-build/extension"
        },	
        { 
            scheme: "https",
            authority: "siv3d.dev",
            path: "/addon/gistpad/extension"
        },
        { 
            scheme: "https",
            authority: "siv3d.dev",
            path: "/addon/wasmer-terminal/extension"
        }
    ],
    folderUri: {
        $mid: 1,
        scheme: "vscode-remote",
        path: "/siv3d-playground"
    },
    callbackRoute: "callback",
    configurationDefaults: {
        "workbench.startupEditor": "none",
        "extensions.ignoreRecommendations": true,
        "siv3d-playground.siv3d-assets-download-url": "https://siv3d-assets.kamenokosoft.com/v6",
        "siv3d-playground.enable-siv3d-preview": typeof navigator.serviceWorker === "object",
        "editor.fontFamily": "Menlo, Monaco, \"Courier New\", Meiryo, monospace"
    },
    productConfiguration: {
        extensionsGallery: {
            serviceUrl: "https://open-vsx.org/vscode/gallery",
            itemUrl: "https://open-vsx.org/vscode/item"
        },
        extensionEnabledApiProposals: {
            "kamenokosoft.siv3d-playground": [
                "fileSearchProvider",
                "textSearchProvider"
            ],
            "kamenokosoft.wasm-playground": [
                "fileSearchProvider",
                "textSearchProvider"
            ]
        },
        enableTelemetry: false,
        openToWelcomeMainPage: false
    },
    codeExchangeProxyEndpoints: {
        github: "https://exchange-code.herokuapp.com/github/"
    }
};
const configElement = document.querySelector("#vscode-workbench-web-configuration");
configElement?.setAttribute("data-settings", JSON.stringify(config));
