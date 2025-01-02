/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
(function() {
var __m = ["vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker","require","exports","vs/base/common/stopwatch","vs/editor/common/services/editorSimpleWorker"];
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
define(__m[0/*vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker*/], __M([1/*require*/,2/*exports*/,3/*vs/base/common/stopwatch*/,4/*vs/editor/common/services/editorSimpleWorker*/]), function (require, exports, stopwatch_1, editorSimpleWorker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageDetectionSimpleWorker = void 0;
    exports.create = create;
    /**
     * Called on the worker side
     * @internal
     */
    function create(host) {
        return new LanguageDetectionSimpleWorker(host, null);
    }
    /**
     * @internal
     */
    class LanguageDetectionSimpleWorker extends editorSimpleWorker_1.EditorSimpleWorker {
        constructor() {
            super(...arguments);
            this.v = false;
            this.y = false;
            this.z = new Map();
        }
        static { this.q = 0.2; }
        static { this.r = 0.05; }
        static { this.s = 0.025; }
        static { this.t = 0.5; }
        async detectLanguage(uri, langBiases, preferHistory, supportedLangs) {
            const languages = [];
            const confidences = [];
            const stopWatch = new stopwatch_1.$3d();
            const documentTextSample = this.A(uri);
            if (!documentTextSample) {
                return;
            }
            const neuralResolver = async () => {
                for await (const language of this.F(documentTextSample)) {
                    if (!this.z.has(language.languageId)) {
                        this.z.set(language.languageId, await this.d.fhr('getLanguageId', [language.languageId]));
                    }
                    const coreId = this.z.get(language.languageId);
                    if (coreId && (!supportedLangs?.length || supportedLangs.includes(coreId))) {
                        languages.push(coreId);
                        confidences.push(language.confidence);
                    }
                }
                stopWatch.stop();
                if (languages.length) {
                    this.d.fhr('sendTelemetryEvent', [languages, confidences, stopWatch.elapsed()]);
                    return languages[0];
                }
                return undefined;
            };
            const historicalResolver = async () => this.C(documentTextSample, langBiases ?? {}, supportedLangs);
            if (preferHistory) {
                const history = await historicalResolver();
                if (history) {
                    return history;
                }
                const neural = await neuralResolver();
                if (neural) {
                    return neural;
                }
            }
            else {
                const neural = await neuralResolver();
                if (neural) {
                    return neural;
                }
                const history = await historicalResolver();
                if (history) {
                    return history;
                }
            }
            return undefined;
        }
        A(uri) {
            const editorModel = this.j(uri);
            if (!editorModel) {
                return;
            }
            const end = editorModel.positionAt(10000);
            const content = editorModel.getValueInRange({
                startColumn: 1,
                startLineNumber: 1,
                endColumn: end.column,
                endLineNumber: end.lineNumber
            });
            return content;
        }
        async B() {
            if (this.v) {
                return;
            }
            if (this.u) {
                return this.u;
            }
            const uri = await this.d.fhr('getRegexpModelUri', []);
            try {
                this.u = await new Promise((resolve_1, reject_1) => { require([uri], resolve_1, reject_1); });
                return this.u;
            }
            catch (e) {
                this.v = true;
                // console.warn('error loading language detection model', e);
                return;
            }
        }
        async C(content, langBiases, supportedLangs) {
            const regexpModel = await this.B();
            if (!regexpModel) {
                return;
            }
            if (supportedLangs?.length) {
                // When using supportedLangs, normally computed biases are too extreme. Just use a "bitmask" of sorts.
                for (const lang of Object.keys(langBiases)) {
                    if (supportedLangs.includes(lang)) {
                        langBiases[lang] = 1;
                    }
                    else {
                        langBiases[lang] = 0;
                    }
                }
            }
            const detected = regexpModel.detect(content, langBiases, supportedLangs);
            return detected;
        }
        async D() {
            if (this.w) {
                return this.w;
            }
            const uri = await this.d.fhr('getIndexJsUri', []);
            const { ModelOperations } = await new Promise((resolve_2, reject_2) => { require([uri], resolve_2, reject_2); });
            this.w = new ModelOperations({
                modelJsonLoaderFunc: async () => {
                    const response = await fetch(await this.d.fhr('getModelJsonUri', []));
                    try {
                        const modelJSON = await response.json();
                        return modelJSON;
                    }
                    catch (e) {
                        const message = `Failed to parse model JSON.`;
                        throw new Error(message);
                    }
                },
                weightsLoaderFunc: async () => {
                    const response = await fetch(await this.d.fhr('getWeightsUri', []));
                    const buffer = await response.arrayBuffer();
                    return buffer;
                }
            });
            return this.w;
        }
        // This adjusts the language confidence scores to be more accurate based on:
        // * VS Code's language usage
        // * Languages with 'problematic' syntaxes that have caused incorrect language detection
        E(modelResult) {
            switch (modelResult.languageId) {
                // For the following languages, we increase the confidence because
                // these are commonly used languages in VS Code and supported
                // by the model.
                case 'js':
                case 'html':
                case 'json':
                case 'ts':
                case 'css':
                case 'py':
                case 'xml':
                case 'php':
                    modelResult.confidence += LanguageDetectionSimpleWorker.r;
                    break;
                // case 'yaml': // YAML has been know to cause incorrect language detection because the language is pretty simple. We don't want to increase the confidence for this.
                case 'cpp':
                case 'sh':
                case 'java':
                case 'cs':
                case 'c':
                    modelResult.confidence += LanguageDetectionSimpleWorker.s;
                    break;
                // For the following languages, we need to be extra confident that the language is correct because
                // we've had issues like #131912 that caused incorrect guesses. To enforce this, we subtract the
                // negativeConfidenceCorrection from the confidence.
                // languages that are provided by default in VS Code
                case 'bat':
                case 'ini':
                case 'makefile':
                case 'sql':
                // languages that aren't provided by default in VS Code
                case 'csv':
                case 'toml':
                    // Other considerations for negativeConfidenceCorrection that
                    // aren't built in but suported by the model include:
                    // * Assembly, TeX - These languages didn't have clear language modes in the community
                    // * Markdown, Dockerfile - These languages are simple but they embed other languages
                    modelResult.confidence -= LanguageDetectionSimpleWorker.t;
                    break;
                default:
                    break;
            }
            return modelResult;
        }
        async *F(content) {
            if (this.y) {
                return;
            }
            let modelOperations;
            try {
                modelOperations = await this.D();
            }
            catch (e) {
                console.log(e);
                this.y = true;
                return;
            }
            let modelResults;
            try {
                modelResults = await modelOperations.runModel(content);
            }
            catch (e) {
                console.warn(e);
            }
            if (!modelResults
                || modelResults.length === 0
                || modelResults[0].confidence < LanguageDetectionSimpleWorker.q) {
                return;
            }
            const firstModelResult = this.E(modelResults[0]);
            if (firstModelResult.confidence < LanguageDetectionSimpleWorker.q) {
                return;
            }
            const possibleLanguages = [firstModelResult];
            for (let current of modelResults) {
                if (current === firstModelResult) {
                    continue;
                }
                current = this.E(current);
                const currentHighest = possibleLanguages[possibleLanguages.length - 1];
                if (currentHighest.confidence - current.confidence >= LanguageDetectionSimpleWorker.q) {
                    while (possibleLanguages.length) {
                        yield possibleLanguages.shift();
                    }
                    if (current.confidence > LanguageDetectionSimpleWorker.q) {
                        possibleLanguages.push(current);
                        continue;
                    }
                    return;
                }
                else {
                    if (current.confidence > LanguageDetectionSimpleWorker.q) {
                        possibleLanguages.push(current);
                        continue;
                    }
                    return;
                }
            }
        }
    }
    exports.LanguageDetectionSimpleWorker = LanguageDetectionSimpleWorker;
});

}).call(this);
//# sourceMappingURL=languageDetectionSimpleWorker.js.map
