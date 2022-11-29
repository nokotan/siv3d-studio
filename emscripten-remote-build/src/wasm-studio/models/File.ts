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

import { assert, getNextKey } from "../util";
import { FileType, isBinaryFileType, languageForFileType } from "./types";

export class File {
  name: string;
  type: FileType;
  data: string | ArrayBuffer | null;
  onClose?: Function;
  /**
   * True if the buffer is out of sync with the data.
   */
  isDirty: boolean = false;
  isBufferReadOnly: boolean = false;
  /**
   * True if the file is temporary. Transient files are usually not serialized to a
   * backing store.
   */
  isTransient = false;
  readonly key = String(getNextKey());

  /**
   * File type of the buffer. This may be different than this file's type, true for
   * non-text files.
   */
  bufferType: FileType;
  description: string;
  constructor(name: string, type: FileType) {
    this.name = name;
    this.type = type;
    this.data = null;
    this.description = "";
    if (isBinaryFileType(type)) {
      this.bufferType = FileType.Unknown;
    } else {
      this.bufferType = type;
    }
  }
  setNameAndDescription(name: string, description: string) {
    this.name = name;
    this.description = description;
  }
  setData(data: string | ArrayBuffer) {
    assert(data != null);
    this.data = data;
  }
  getData(): string | ArrayBuffer | null {
    return this.data;
  }
  toString() {
    return "File [" + this.name + "]";
  }
}
