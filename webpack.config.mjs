import * as path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    devServer: {
        static: {
            directory: path.join(__dirname, 'vscode/vscode-web'),
        },
        compress: true,
        headers: {
            // This headers are needed so the SharedArrayBuffer can be properly
            // inited in the browsers
            'cross-origin-embedder-policy': 'require-corp',
            'cross-origin-opener-policy': 'same-origin',
            'cross-origin-resource-policy': 'cross-origin',
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET,POST,HEAD,OPTIONS'
        },
        https: true,
        port: 8080,
    }
}