/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check
'use strict';

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const path = require('path');
const webpack = require('webpack');

module.exports = /** @type WebpackConfig */ {
	context: __dirname,
	mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
	target: 'webworker', // extensions run in a webworker context
	entry: {
		extension: './src/extension.ts',
		webworker: './wasm-terminal/src/workers/process.worker.ts'
	},
	resolve: {
		mainFields: ['module', 'main'],
		extensions: ['.ts', '.js', '.json'], // support ts-files and js-files
		fallback: {
			path: false,
			util: false,
			fs: false,
			constants: false,
		}
	},
	plugins: [
		new webpack.ProvidePlugin({
			process: 'process/browser',
			Buffer: [ 'buffer', 'Buffer' ]
		}),
	],
	module: {
		rules: [{
			test: /\.ts$/,
			exclude: /node_modules/,
			use: [{
				// configure TypeScript loader:
				// * enable sources maps for end-to-end source maps
				loader: 'ts-loader',
				options: {
					compilerOptions: {
						'sourceMap': true,
						'declaration': false
					}
				}
			}]
		}]
	},
	externals: {
		'vscode': 'commonjs vscode', // ignored because it doesn't exist
	},
	performance: {
		hints: false
	},
	output: {
		filename: '[name].js',
		path: path.join(__dirname, 'dist'),
		libraryTarget: 'commonjs'
	},
	devtool: 'source-map'
};
