/* Copyright 2018 Mozilla Foundation
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { File } from "./models";
import { createCompilerService, Language } from "./compilerServices";

declare var capstone: {
  ARCH_X86: any;
  MODE_64: any;
  Cs: any;
};

declare var Module: ({ }) => any;

declare var showdown: {
  Converter: any;
  setFlavor: Function;
};

export interface IFiddleFile {
  name: string;
  data?: string;
  type?: "binary" | "text";
}

export interface ICreateFiddleRequest {
  files: IFiddleFile [];
}

export interface ILoadFiddleResponse {
  files: IFiddleFile [];
  id: string;
  message: string;
  success: boolean;
}

export { Language } from "./compilerServices";

export interface CompileResult {
  success: boolean;
  files: { [name: string]: (string|ArrayBuffer) };
  console: string;
}

export class Service {
  static async compileFiles(files: File[], from: Language, to: Language, options = ""): Promise<CompileResult> {
    const service = await createCompilerService(from, to);

    const fileNameMap: {[name: string]: File} = files.reduce((acc: any, f: File) => {
      acc[f.name] = f;
      return acc;
    }, {} as any);

    const input = {
      files: files.reduce((acc: any, f: File) => {
        acc[f.name] = {
          content: f.getData(),
        };
        return acc;
      }, {} as any),
      options,
    };
    const result = await service.compile(input);
    let consoleWritten = "";

    for (const [ name, item ] of Object.entries(result.items)) {
      const { fileRef, console } = item;
      if (!fileRef || !console) {
        continue;
      }
      const file = fileNameMap[fileRef];
      if (!file) {
        continue;
      }
      consoleWritten += console;
    }

    if (!result.success) {
      return {
        success: false,
        files: {},
        console: consoleWritten + result.console
      }
    }

    const outputFiles: any = {};
    for (const [ name, item ] of Object.entries(result.items)) {
      const { content } = item;
      if (content) {
        outputFiles[name] = content;
      }
    }
    return {
      success: true,
      files: outputFiles,
      console: consoleWritten
    };
  }

  static async compileFile(file: File, from: Language, to: Language, options = ""): Promise<any> {
    const result = await Service.compileFileWithBindings(file, from, to, options);
    return result.wasm;
  }

  static async compileFileWithBindings(file: File, from: Language, to: Language, options = ""): Promise<any> {
    if (to !== Language.Wasm) {
      throw new Error(`Only wasm target is supported, but "${to}" was found`);
    }
    const result = (await Service.compileFiles([file], from, to, options)).files;
    const expectedOutputFilename = "a.wasm";
    let output: any = {
      wasm: result[expectedOutputFilename],
    };
    const expectedWasmBindgenJsFilename = "wasm_bindgen.js";
    if (result[expectedWasmBindgenJsFilename]) {
      output = {
        ...output,
        wasmBindgenJs: result[expectedWasmBindgenJsFilename],
      };
    }
    return output;
  }

  static parseFiddleURI(): string {
    let uri = window.location.search.substring(1);
    if (uri) {
      const i = uri.indexOf("/");
      if (i > 0) {
        uri = uri.substring(0, i);
      }
    }
    return uri;
  }

  static lazyLoad(uri: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const self = this;
      const d = window.document;
      const b = d.body;
      const e = d.createElement("script");
      e.async = true;
      e.src = uri;
      b.appendChild(e);
      // TODO: What about fail?
    });
  }
}
