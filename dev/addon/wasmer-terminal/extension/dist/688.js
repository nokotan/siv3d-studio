"use strict";
(self["webpackChunkwasmer_term"] = self["webpackChunkwasmer_term"] || []).push([[688],{

/***/ 595:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Y": () => (/* binding */ WasmPseudoTerminal)
/* harmony export */ });
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(688);
/* harmony import */ var _vscode__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(509);


class WasmPseudoTerminal {
    constructor(fs, writeEmitter, closeEmitter, location) {
        this.fs = fs;
        this.writeEmitter = writeEmitter;
        this.closeEmitter = closeEmitter;
        this.location = location;
        this.onDidWrite = this.writeEmitter.event;
        this.onDidClose = this.closeEmitter.event;
    }
    static async createWasmPseudoTerminal(fs, location) {
        const vscode = await (0,_vscode__WEBPACK_IMPORTED_MODULE_0__/* .importVSCode */ .Tt)();
        return new WasmPseudoTerminal(fs, new vscode.EventEmitter(), new vscode.EventEmitter(), location);
    }
    async open(initialDimensions) {
        if (initialDimensions) {
            this.m_rows = initialDimensions.rows;
            this.m_cols = initialDimensions.columns;
        }
        const vscode = await (0,_vscode__WEBPACK_IMPORTED_MODULE_0__/* .importVSCode */ .Tt)();
        let pwd = undefined;
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0]) {
            const folder = vscode.workspace.workspaceFolders[0];
            pwd = vscode.Uri.parse(`wasmfs:/mnt/${folder.name || folder.index}`);
        }
        this.session = (0,_index__WEBPACK_IMPORTED_MODULE_1__.open)(this, this.fs, this.location, pwd);
    }
    close() {
        this.fs.backup();
        this.session?.free();
    }
    write(data) {
        this.writeEmitter.fire(data);
    }
    handleInput(data) {
        this.onDataCallback?.call(this, data);
    }
    onData(callback) {
        this.onDataCallback = callback;
    }
    onClose(exitCode) {
        this.closeEmitter.fire(exitCode);
    }
    setDimensions(dimensions) {
        this.m_rows = dimensions.rows;
        this.m_cols = dimensions.columns;
        this.onDimensionChangedCallback?.call(this, dimensions);
    }
    onDimensionChanged(callback) {
        this.onDimensionChangedCallback = callback;
    }
    get rows() {
        return this.m_rows;
    }
    get cols() {
        return this.m_cols;
    }
}


/***/ }),

/***/ 509:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Fk": () => (/* binding */ getWorkspaceFs),
/* harmony export */   "H9": () => (/* binding */ getFileSystemError),
/* harmony export */   "IC": () => (/* binding */ createEventEmitter),
/* harmony export */   "Tt": () => (/* binding */ importVSCode),
/* harmony export */   "_S": () => (/* binding */ createDisposable)
/* harmony export */ });
let code;
async function importVSCode() {
    return code || (code = await Promise.resolve(/* import() */).then(__webpack_require__.t.bind(__webpack_require__, 496, 23)));
}
function getWorkspaceFs() {
    return code?.workspace.fs;
}
async function createEventEmitter() {
    const code = await importVSCode();
    return new code.EventEmitter();
}
function createDisposable(callback) {
    return code && new code.Disposable(callback);
}
function getFileSystemError() {
    return code?.FileSystemError;
}


/***/ }),

/***/ 688:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "AnimationFrameCallbackWrapper": () => (/* binding */ AnimationFrameCallbackWrapper),
  "LeakyInterval": () => (/* binding */ LeakyInterval),
  "LoaderHelper": () => (/* binding */ LoaderHelper),
  "TerminalSession": () => (/* binding */ TerminalSession),
  "WasiFS": () => (/* binding */ WasiFS),
  "WasmerRuntimeError": () => (/* binding */ WasmerRuntimeError),
  "WcWidth": () => (/* binding */ WcWidth),
  "WebThreadPool": () => (/* binding */ WebThreadPool),
  "default": () => (/* binding */ pkg),
  "initSync": () => (/* binding */ initSync),
  "main": () => (/* binding */ main),
  "open": () => (/* binding */ pkg_open),
  "wasm_entry_point": () => (/* binding */ wasm_entry_point),
  "worker_entry_point": () => (/* binding */ worker_entry_point)
});

// EXTERNAL MODULE: ./pkg/snippets/wasmer-vscode-web-7bb130c80b4ace6c/js/terminal.ts
var terminal = __webpack_require__(595);
;// CONCATENATED MODULE: ./pkg/snippets/wasmer-vscode-web-7bb130c80b4ace6c/js/time.ts
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// EXTERNAL MODULE: ./pkg/snippets/wasmer-vscode-web-7bb130c80b4ace6c/js/vscode.ts
var vscode = __webpack_require__(509);
// EXTERNAL MODULE: ./pkg/snippets/wasmer-vscode-web-7bb130c80b4ace6c/js/worker.ts
var worker = __webpack_require__(372);
;// CONCATENATED MODULE: ./pkg/index.js
/* module decorator */ module = __webpack_require__.hmd(module);






let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.buffer !== wasm.memory.buffer) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

const cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
};

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.buffer !== wasm.memory.buffer) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().slice(ptr, ptr + len));
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

let cachedBigInt64Memory0 = null;

function getBigInt64Memory0() {
    if (cachedBigInt64Memory0 === null || cachedBigInt64Memory0.buffer !== wasm.memory.buffer) {
        cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer);
    }
    return cachedBigInt64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_3.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_54(arg0, arg1, arg2) {
    const ptr0 = passStringToWasm0(arg2, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    wasm._ZN12wasm_bindgen7convert8closures11invoke1_mut17h3cd0dea5fa91ad6dE(arg0, arg1, ptr0, len0);
}

function __wbg_adapter_57(arg0, arg1, arg2) {
    wasm._ZN12wasm_bindgen7convert8closures11invoke1_mut17h5c264fad79cddfdaE(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_60(arg0, arg1) {
    wasm._ZN12wasm_bindgen7convert8closures11invoke0_mut17hec29bfecae0a2bd2E(arg0, arg1);
}

function __wbg_adapter_65(arg0, arg1, arg2) {
    wasm._ZN136__LT_dyn_u20_core__ops__function__FnMut_LT__LP_A_C__RP__GT__u2b_Output_u20__u3d__u20_R_u20_as_u20_wasm_bindgen__closure__WasmClosure_GT_8describe6invoke17hc63c9eda56b450edE(arg0, arg1, addHeapObject(arg2));
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }
/**
* @param {number} state_ptr
*/
function worker_entry_point(state_ptr) {
    wasm.worker_entry_point(state_ptr);
}

/**
* @param {number} ctx_ptr
* @param {any} wasm_module
* @param {any} wasm_memory
*/
function wasm_entry_point(ctx_ptr, wasm_module, wasm_memory) {
    wasm.wasm_entry_point(ctx_ptr, addHeapObject(wasm_module), addHeapObject(wasm_memory));
}

/**
*/
function main() {
    wasm.main();
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}
/**
* @param {WasmPseudoTerminal} terminal
* @param {WasiFS} fs
* @param {string} location
* @param {vscode.Uri | undefined} pwd
* @returns {TerminalSession}
*/
function pkg_open(terminal, fs, location, pwd) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        _assertClass(fs, WasiFS);
        var ptr0 = fs.__destroy_into_raw();
        const ptr1 = passStringToWasm0(location, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.open(retptr, addHeapObject(terminal), ptr0, ptr1, len1, isLikeNone(pwd) ? 0 : addHeapObject(pwd));
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return TerminalSession.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1);
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}
function __wbg_adapter_339(arg0, arg1, arg2, arg3) {
    wasm._ZN12wasm_bindgen7convert8closures11invoke2_mut17h00c76e95962bd356E(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

/**
*/
const WcWidth = Object.freeze({ Width0:0,"0":"Width0",Width1:1,"1":"Width1",Width2:2,"2":"Width2", });
/**
*/
class AnimationFrameCallbackWrapper {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_animationframecallbackwrapper_free(ptr);
    }
}
/**
*/
class LeakyInterval {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_leakyinterval_free(ptr);
    }
}
/**
*/
class LoaderHelper {

    static __wrap(ptr) {
        const obj = Object.create(LoaderHelper.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_loaderhelper_free(ptr);
    }
    /**
    * @returns {string}
    */
    mainJS() {
        const ret = wasm.loaderhelper_mainJS(this.ptr);
        return takeObject(ret);
    }
}
/**
*/
class TerminalSession {

    static __wrap(ptr) {
        const obj = Object.create(TerminalSession.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_terminalsession_free(ptr);
    }
}
/**
*/
class WasiFS {

    static __wrap(ptr) {
        const obj = Object.create(WasiFS.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasifs_free(ptr);
    }
    /**
    * @param {vscode.Uri | undefined} backup_url
    * @returns {Promise<WasiFS>}
    */
    static new(backup_url) {
        const ret = wasm.wasifs_new(isLikeNone(backup_url) ? 0 : addHeapObject(backup_url));
        return takeObject(ret);
    }
    /**
    * @param {vscode.Uri} base_uri
    * @param {string} mount_point
    */
    mount(base_uri, mount_point) {
        const ptr0 = passStringToWasm0(mount_point, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.wasifs_mount(this.ptr, addHeapObject(base_uri), ptr0, len0);
    }
    /**
    * @param {string} mount_point
    */
    unmount(mount_point) {
        const ptr0 = passStringToWasm0(mount_point, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.wasifs_unmount(this.ptr, ptr0, len0);
    }
    /**
    * @returns {Promise<void>}
    */
    backup() {
        const ret = wasm.wasifs_backup(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {Promise<void>}
    */
    restore() {
        const ret = wasm.wasifs_restore(this.ptr);
        return takeObject(ret);
    }
    /**
    * @returns {WasiFS}
    */
    clone() {
        const ret = wasm.wasifs_clone(this.ptr);
        return WasiFS.__wrap(ret);
    }
    /**
    */
    dispose() {
        wasm.wasifs_dispose(this.ptr);
    }
    /**
    * @param {vscode.Uri} uri
    * @returns {vscode.FileStat}
    */
    stat(uri) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasifs_stat(retptr, this.ptr, addHeapObject(uri));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {vscode.Uri} uri
    * @returns {[string, vscode.FileType][]}
    */
    readDirectory(uri) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasifs_readDirectory(retptr, this.ptr, addHeapObject(uri));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {vscode.Uri} uri
    * @returns {Uint8Array}
    */
    readFile(uri) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasifs_readFile(retptr, this.ptr, addHeapObject(uri));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            var r3 = getInt32Memory0()[retptr / 4 + 3];
            if (r3) {
                throw takeObject(r2);
            }
            var v0 = getArrayU8FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 1);
            return v0;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {vscode.Uri} uri
    * @param {Uint8Array} buf
    * @param {any} options
    */
    writeFile(uri, buf, options) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            const ptr0 = passArray8ToWasm0(buf, wasm.__wbindgen_malloc);
            const len0 = WASM_VECTOR_LEN;
            wasm.wasifs_writeFile(retptr, this.ptr, addHeapObject(uri), ptr0, len0, addHeapObject(options));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {vscode.Uri} old_uri
    * @param {vscode.Uri} uri
    * @param {any} options
    */
    rename(old_uri, uri, options) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasifs_rename(retptr, this.ptr, addHeapObject(old_uri), addHeapObject(uri), addHeapObject(options));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {vscode.Uri} uri
    */
    delete(uri) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasifs_delete(retptr, this.ptr, addHeapObject(uri));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {vscode.Uri} uri
    */
    createDirectory(uri) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasifs_createDirectory(retptr, this.ptr, addHeapObject(uri));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            if (r1) {
                throw takeObject(r0);
            }
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {vscode.Uri} uri
    * @returns {vscode.Disposable}
    */
    watch(uri) {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.wasifs_watch(retptr, this.ptr, addHeapObject(uri));
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var r2 = getInt32Memory0()[retptr / 4 + 2];
            if (r2) {
                throw takeObject(r1);
            }
            return takeObject(r0);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {vscode.Event<vscode.FileChangeEvent[]>}
    */
    get onDidChangeFile() {
        const ret = wasm.wasifs_onDidChangeFile(this.ptr);
        return takeObject(ret);
    }
}
/**
* A struct representing an aborted instruction execution, with a message
* indicating the cause.
*/
class WasmerRuntimeError {

    static __wrap(ptr) {
        const obj = Object.create(WasmerRuntimeError.prototype);
        obj.ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_wasmerruntimeerror_free(ptr);
    }
}
/**
*/
class WebThreadPool {

    __destroy_into_raw() {
        const ptr = this.ptr;
        this.ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_webthreadpool_free(ptr);
    }
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function getImports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_fire_0fb763e232804280 = function(arg0, arg1) {
        getObject(arg0).fire(takeObject(arg1));
    };
    imports.wbg.__wbg_event_186b6c899d7dcd5e = function(arg0) {
        const ret = getObject(arg0).event;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getWorkspaceFs_a796aac6d15bf0c4 = function() {
        const ret = (0,vscode/* getWorkspaceFs */.Fk)();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_path_73abb336fa072094 = function(arg0, arg1) {
        const ret = getObject(arg1).path;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbg_static_accessor_URL_98474f49c14ab2ba = function() {
        const ret = "file:///home/runner/work/wasm-playground/wasm-playground/wasmer-terminal/pkg/index.js";
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_static_accessor_HARDWARE_CONCURRENCY_2d0f899c424af56f = function() {
        const ret = navigator.hardwareConcurrency;
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_cols_2442d66de0f3c49e = function(arg0) {
        const ret = getObject(arg0).cols;
        return ret;
    };
    imports.wbg.__wbg_rows_c03c14ccecd6f299 = function(arg0) {
        const ret = getObject(arg0).rows;
        return ret;
    };
    imports.wbg.__wbg_writeFile_3313c5387527d906 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).writeFile(takeObject(arg1), getArrayU8FromWasm0(arg2, arg3));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createDirectory_927ab2540dffd3ae = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).createDirectory(takeObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_code_5c5497e6be37ccb2 = function(arg0, arg1) {
        const ret = getObject(arg1).code;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_readDirectory_c3f17f8a60b43ecc = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).readDirectory(takeObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_readFile_86b6c1925d0c8825 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).readFile(takeObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createEventEmitter_b43e18a35508d800 = function() {
        const ret = (0,vscode/* createEventEmitter */.IC)();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_wasifs_new = function(arg0) {
        const ret = WasiFS.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getFileSystemError_d7aafad0b5d3e8f4 = function() {
        const ret = (0,vscode/* getFileSystemError */.H9)();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_Unavailable_5afffdae562524c1 = function(arg0, arg1, arg2) {
        try {
            const ret = getObject(arg0).Unavailable(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        } finally {
            wasm.__wbindgen_free(arg1, arg2);
        }
    };
    imports.wbg.__wbg_FileNotADirectory_5cc073842bc1bcd8 = function(arg0, arg1, arg2) {
        try {
            const ret = getObject(arg0).FileNotADirectory(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        } finally {
            wasm.__wbindgen_free(arg1, arg2);
        }
    };
    imports.wbg.__wbg_FileIsADirectory_f63924058bd1f11c = function(arg0, arg1, arg2) {
        try {
            const ret = getObject(arg0).FileIsADirectory(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        } finally {
            wasm.__wbindgen_free(arg1, arg2);
        }
    };
    imports.wbg.__wbg_FileExists_02c6d9a698fdcbef = function(arg0, arg1, arg2) {
        try {
            const ret = getObject(arg0).FileExists(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        } finally {
            wasm.__wbindgen_free(arg1, arg2);
        }
    };
    imports.wbg.__wbg_FileNotFound_d89904ce56a40252 = function(arg0, arg1, arg2) {
        try {
            const ret = getObject(arg0).FileNotFound(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        } finally {
            wasm.__wbindgen_free(arg1, arg2);
        }
    };
    imports.wbg.__wbg_NoPermissions_7c87959e6614a990 = function(arg0, arg1, arg2) {
        try {
            const ret = getObject(arg0).NoPermissions(getStringFromWasm0(arg1, arg2));
            return addHeapObject(ret);
        } finally {
            wasm.__wbindgen_free(arg1, arg2);
        }
    };
    imports.wbg.__wbg_cancelInterval_0f944ba4ae759061 = typeof cancelInterval == 'function' ? cancelInterval : notDefined('cancelInterval');
    imports.wbg.__wbg_sleep_01d1221b1eed596a = function(arg0) {
        const ret = sleep(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_bigint = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'bigint';
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
        const ret = BigInt.asUintN(64, arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
        const ret = getObject(arg0) === getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_in = function(arg0, arg1) {
        const ret = getObject(arg0) in getObject(arg1);
        return ret;
    };
    imports.wbg.__wbg_getWorkerLocation_bcddd654a83df703 = function(arg0) {
        const ret = (0,worker.getWorkerLocation)();
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_log_c4efa0e6bf9d210b = function(arg0, arg1) {
        console.log(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_startWasm_f2d3e6782a2d171f = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        const ret = (0,worker.startWasm)(takeObject(arg0), takeObject(arg1), takeObject(arg2), takeObject(arg3), LoaderHelper.__wrap(arg4), takeObject(arg5), takeObject(arg6));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_startWorker_d92069a0e13ba392 = function(arg0, arg1, arg2, arg3, arg4) {
        const ret = (0,worker.startWorker)(takeObject(arg0), takeObject(arg1), takeObject(arg2), takeObject(arg3), LoaderHelper.__wrap(arg4));
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createDisposable_257501c712499a8a = function(arg0) {
        const ret = (0,vscode/* createDisposable */._S)(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_write_c44b0c65b2358920 = function(arg0, arg1, arg2) {
        getObject(arg0).write(getStringFromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_clear_4e3e19e2678842c2 = function(arg0) {
        getObject(arg0).clear();
    };
    imports.wbg.__wbg_onClose_2300572fc305713d = function(arg0, arg1) {
        getObject(arg0).onClose(arg1);
    };
    imports.wbg.__wbg_instanceof_Terminal_2078d1d30c107b4d = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof terminal/* WasmPseudoTerminal */.Y;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_onData_05695ec8f1fc8ca8 = function(arg0, arg1) {
        getObject(arg0).onData(getObject(arg1));
    };
    imports.wbg.__wbg_onDimensionChanged_ae74c62f6ab6019c = function(arg0, arg1) {
        getObject(arg0).onDimensionChanged(getObject(arg1));
    };
    imports.wbg.__wbg_rename_c46734e94406017b = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).rename(takeObject(arg1), takeObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_stat_f15cbd9fa2195ad5 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).stat(takeObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_delete_54f0ca0d8b73dcdd = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).delete(takeObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        const ret = getObject(arg0) == getObject(arg1);
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_getwithrefkey_15c62c2b8546208d = function(arg0, arg1) {
        const ret = getObject(arg0)[getObject(arg1)];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_20cbc34131e76824 = function(arg0, arg1, arg2) {
        getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    };
    imports.wbg.__wbg_log_c9486ca5d8e2cbe8 = function(arg0, arg1) {
        try {
            console.log(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbg_log_aba5996d9bde071f = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        try {
            console.log(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbg_mark_40e050a77cc39fea = function(arg0, arg1) {
        performance.mark(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_measure_aa7a73f17813f708 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        try {
            performance.measure(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
            wasm.__wbindgen_free(arg2, arg3);
        }
    }, arguments) };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbg_write_b033ab804b165ec5 = function(arg0, arg1, arg2) {
        getObject(arg0).write(getStringFromWasm0(arg1, arg2));
    };
    imports.wbg.__wbindgen_link_046e3eff4cf0d899 = function(arg0) {
        const ret = "data:application/javascript," + encodeURIComponent(`onmessage = function (ev) {
            let [ia, index, value] = ev.data;
            ia = new Int32Array(ia.buffer);
            let result = Atomics.wait(ia, index, value);
            postMessage(result);
        };
        `);
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_waitAsync_bb098cfecda009b0 = function() {
        const ret = Atomics.waitAsync;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_waitAsync_41d03d8117e10c28 = function(arg0, arg1, arg2) {
        const ret = Atomics.waitAsync(getObject(arg0), arg1, arg2);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_async_5406ad9d7ea4f7c3 = function(arg0) {
        const ret = getObject(arg0).async;
        return ret;
    };
    imports.wbg.__wbg_value_1e1e7c35f498aff4 = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_typeof = function(arg0) {
        const ret = typeof getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Window_e266f02eee43b570 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Window;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_cancelAnimationFrame_d079cdb83bc43b26 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).cancelAnimationFrame(arg1);
    }, arguments) };
    imports.wbg.__wbg_fetch_465e8cb61a0f43ea = function(arg0, arg1) {
        const ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Blob_8da6b2db9a89ceeb = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Blob;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_set_a5d34c36a1a4ebd1 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).set(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_name_70b9c700f6f310f2 = function(arg0, arg1) {
        const ret = getObject(arg1).name;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_close_9e3b66c40e98af47 = function(arg0) {
        getObject(arg0).close();
    };
    imports.wbg.__wbg_now_c644db5194be8437 = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbg_headers_ab5251d2727ac41e = function(arg0) {
        const ret = getObject(arg0).headers;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithstrandinit_c45f0dc6da26fd03 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setonmessage_79a50b841d4ac8fb = function(arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    };
    imports.wbg.__wbg_new_9046c2caa253cdd4 = function() { return handleError(function (arg0, arg1) {
        const ret = new Worker(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_postMessage_85b17b465d6aacd6 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).postMessage(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_result_4c6690478b5532e4 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).result;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setonloadend_664a6399dd863d96 = function(arg0, arg1) {
        getObject(arg0).onloadend = getObject(arg1);
    };
    imports.wbg.__wbg_new_8eef8a8754c6aae7 = function() { return handleError(function () {
        const ret = new FileReader();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_readAsArrayBuffer_bc9f4aff6d3e1bb1 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).readAsArrayBuffer(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_data_af909e5dfe73e68c = function(arg0) {
        const ret = getObject(arg0).data;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setonopen_b91a933a10be7d48 = function(arg0, arg1) {
        getObject(arg0).onopen = getObject(arg1);
    };
    imports.wbg.__wbg_setonclose_eab2638c55817c51 = function(arg0, arg1) {
        getObject(arg0).onclose = getObject(arg1);
    };
    imports.wbg.__wbg_setonmessage_5ea7e452fd7a5544 = function(arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    };
    imports.wbg.__wbg_setbinaryType_c9b2fa398c277601 = function(arg0, arg1) {
        getObject(arg0).binaryType = takeObject(arg1);
    };
    imports.wbg.__wbg_new_8ad026ef33da9ab1 = function() { return handleError(function (arg0, arg1) {
        const ret = new WebSocket(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_send_a53bc0c57bd60533 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).send(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_instanceof_Response_fb3a4df648c1859b = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Response;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_redirected_9243efed72049e32 = function(arg0) {
        const ret = getObject(arg0).redirected;
        return ret;
    };
    imports.wbg.__wbg_status_d483a4ac847f380a = function(arg0) {
        const ret = getObject(arg0).status;
        return ret;
    };
    imports.wbg.__wbg_ok_1cd4c5ee1ccf4e0f = function(arg0) {
        const ret = getObject(arg0).ok;
        return ret;
    };
    imports.wbg.__wbg_statusText_9674693c2eb731fa = function(arg0, arg1) {
        const ret = getObject(arg1).statusText;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_arrayBuffer_cb886e06a9e36e4d = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_WorkerGlobalScope_88015ad1ebb92b29 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof WorkerGlobalScope;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_fetch_661ffba2a4f2519c = function(arg0, arg1) {
        const ret = getObject(arg0).fetch(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_randomFillSync_6894564c2c334c42 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_805f1c3d65988a5a = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_crypto_e1d53a1d73fb10b8 = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_process_038c26bf42b093f8 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_versions_ab37218d2f0b24a8 = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_080f4b19d15bc1fe = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_msCrypto_6e7d3e1f92610cbb = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_78a3dcfbdba9cbce = function() { return handleError(function () {
        const ret = module.require;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'function';
        return ret;
    };
    imports.wbg.__wbg_instanceof_Global_587b85be8a8cc1c1 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof WebAssembly.Global;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_wasmerruntimeerror_new = function(arg0) {
        const ret = WasmerRuntimeError.__wrap(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_27fe3dac1c4d0224 = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_e498fbc24f9c1d4f = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_new_b525de17f44a8943 = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newnoargs_2b8b6bd7753c76ba = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_b7d530c04fd8b217 = function(arg0) {
        const ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_88560ec06a094dea = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).next();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_done_1ebec03bbd919843 = function(arg0) {
        const ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_value_6ac8da5cc5b3efda = function(arg0) {
        const ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_iterator_55f114446221aa5a = function() {
        const ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_baf4855f9a986186 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_95d1ea488d03e4e8 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_f9876326328f45ed = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_e7c1f827057f6584 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_a09ec664e14b1b81 = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_87cbb8506fecf3a9 = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_c85a9259e621f3db = function() { return handleError(function () {
        const ret = __webpack_require__.g.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_newwithlength_0da6f12fbc1ab6eb = function(arg0) {
        const ret = new Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_17224bc548dd1d7b = function(arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    };
    imports.wbg.__wbg_isArray_39d28997bf6b96b4 = function(arg0) {
        const ret = Array.isArray(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_of_4ef61df23fe9e795 = function(arg0, arg1, arg2) {
        const ret = Array.of(getObject(arg0), getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_49c286f04dd3bf59 = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_a69f02ee4c4f5065 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof ArrayBuffer;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Function_17551b1809ea1825 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Function;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_apply_aedce30790c00792 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).apply(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_call_9495de66fdbe016b = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_bind_d6a4be1f31ed64ec = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).bind(getObject(arg1), getObject(arg2), getObject(arg3));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_name_4e66d4cfa3e9270a = function(arg0) {
        const ret = getObject(arg0).name;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_isSafeInteger_8c4789029e885159 = function(arg0) {
        const ret = Number.isSafeInteger(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_getTime_7c59072d1651a3cf = function(arg0) {
        const ret = getObject(arg0).getTime();
        return ret;
    };
    imports.wbg.__wbg_getTimezoneOffset_2a6b27fb18493a56 = function(arg0) {
        const ret = getObject(arg0).getTimezoneOffset();
        return ret;
    };
    imports.wbg.__wbg_new0_25059e40b1c02766 = function() {
        const ret = new Date();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_931686b195a14f9d = function() {
        const ret = Date.now();
        return ret;
    };
    imports.wbg.__wbg_constructor_0c9828c8a7cf1dc6 = function(arg0) {
        const ret = getObject(arg0).constructor;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getPrototypeOf_bc92b90803c143ac = function(arg0) {
        const ret = Object.getPrototypeOf(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_9d3a9ce4282a18a8 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_339(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_resolve_fd40f858d9db1a04 = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_ec5db6d509eb475f = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_f753623316e2873a = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_cf65c07de34b9a08 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_0b315875a88967fc = function(arg0) {
        const ret = new Int32Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_9fb2f11355ecadf5 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_537b7341ce90bb31 = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_17499e8aa4003ebd = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_length_27a2afe8ab42b09f = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_01cebe79ca606cca = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof Uint8Array;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_newwithlength_b56c882b57805732 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_5f1fc856188c4b44 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_subarray_7526649b91a252a6 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_compile_b482e5e65aed47e3 = function(arg0) {
        const ret = WebAssembly.compile(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_64f7331ea86b0949 = function() { return handleError(function (arg0, arg1) {
        const ret = new WebAssembly.Instance(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_exports_ff0a0a2b2c092053 = function(arg0) {
        const ret = getObject(arg0).exports;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Module_925a715095793138 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof WebAssembly.Module;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_new_3086807366ac3008 = function() { return handleError(function (arg0) {
        const ret = new WebAssembly.Module(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_exports_ebe6dd251e00d3b0 = function(arg0) {
        const ret = WebAssembly.Module.exports(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_imports_801913c621270d0f = function(arg0) {
        const ret = WebAssembly.Module.imports(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Table_27c4cc013dcdbf38 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof WebAssembly.Table;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_get_83118383573df91c = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).get(arg1 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_Memory_25684ccf3e250ca1 = function(arg0) {
        let result;
        try {
            result = getObject(arg0) instanceof WebAssembly.Memory;
        } catch {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_new_e6f2507f7bdea19b = function() { return handleError(function (arg0) {
        const ret = new WebAssembly.Memory(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_apply_5435e78b95a524a6 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.apply(getObject(arg0), getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_set_6aa458a4ebdb65cb = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbindgen_bigint_get_as_i64 = function(arg0, arg1) {
        const v = getObject(arg1);
        const ret = typeof(v) === 'bigint' ? v : undefined;
        getBigInt64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? BigInt(0) : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbindgen_rethrow = function(arg0) {
        throw takeObject(arg0);
    };
    imports.wbg.__wbindgen_module = function() {
        const ret = init.__wbindgen_wasm_module;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_function_table = function() {
        const ret = wasm.__wbindgen_export_3;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper819 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 316, __wbg_adapter_54);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper821 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 316, __wbg_adapter_57);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper823 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 316, __wbg_adapter_60);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper825 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 316, __wbg_adapter_57);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1413 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 574, __wbg_adapter_65);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper1414 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 574, __wbg_adapter_65);
        return addHeapObject(ret);
    };
    imports['./snippets/wasmer-vscode-web-7bb130c80b4ace6c/js/worker.ts'] = worker;

    return imports;
}

function initMemory(imports, maybe_memory) {
    imports.wbg.memory = maybe_memory || new WebAssembly.Memory({initial:32,maximum:16384,shared:true});
}

function finalizeInit(instance, module) {
    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    cachedBigInt64Memory0 = null;
    cachedFloat64Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint8Memory0 = null;

    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module, maybe_memory) {
    const imports = getImports();

    initMemory(imports, maybe_memory);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return finalizeInit(instance, module);
}

async function init(input, maybe_memory) {
    if (typeof input === 'undefined') {
        input = new URL(/* asset import */ __webpack_require__(275), __webpack_require__.b);
    }
    const imports = getImports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    initMemory(imports, maybe_memory);

    const { instance, module } = await load(await input, imports);

    return finalizeInit(instance, module);
}


/* harmony default export */ const pkg = (init);


/***/ }),

/***/ 275:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "26b5060c22b7fda48812.wasm";

/***/ })

}]);
//# sourceMappingURL=688.js.map