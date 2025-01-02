/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
(function() {
var __m = ["require","exports","vs/base/common/ternarySearchTree","vs/platform/instantiation/common/instantiation","vs/platform/profiling/common/profiling","vs/base/common/path","vs/platform/profiling/common/profilingModel","vs/base/common/arrays","vs/base/common/strings","vs/platform/profiling/electron-sandbox/profileAnalysisWorker","vs/base/common/uri"];
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
define(__m[2/*vs/base/common/ternarySearchTree*/], __M([0/*require*/,1/*exports*/,7/*vs/base/common/arrays*/,8/*vs/base/common/strings*/]), function (require, exports, arrays_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oi = exports.$ni = exports.$mi = exports.$li = exports.$ki = void 0;
    class $ki {
        constructor() {
            this.b = '';
            this.c = 0;
        }
        reset(key) {
            this.b = key;
            this.c = 0;
            return this;
        }
        next() {
            this.c += 1;
            return this;
        }
        hasNext() {
            return this.c < this.b.length - 1;
        }
        cmp(a) {
            const aCode = a.charCodeAt(0);
            const thisCode = this.b.charCodeAt(this.c);
            return aCode - thisCode;
        }
        value() {
            return this.b[this.c];
        }
    }
    exports.$ki = $ki;
    class $li {
        constructor(e = true) {
            this.e = e;
        }
        reset(key) {
            this.b = key;
            this.c = 0;
            this.d = 0;
            return this.next();
        }
        hasNext() {
            return this.d < this.b.length;
        }
        next() {
            // this._data = key.split(/[\\/]/).filter(s => !!s);
            this.c = this.d;
            let justSeps = true;
            for (; this.d < this.b.length; this.d++) {
                const ch = this.b.charCodeAt(this.d);
                if (ch === 46 /* CharCode.Period */) {
                    if (justSeps) {
                        this.c++;
                    }
                    else {
                        break;
                    }
                }
                else {
                    justSeps = false;
                }
            }
            return this;
        }
        cmp(a) {
            return this.e
                ? (0, strings_1.$ff)(a, this.b, 0, a.length, this.c, this.d)
                : (0, strings_1.$hf)(a, this.b, 0, a.length, this.c, this.d);
        }
        value() {
            return this.b.substring(this.c, this.d);
        }
    }
    exports.$li = $li;
    class $mi {
        constructor(f = true, g = true) {
            this.f = f;
            this.g = g;
        }
        reset(key) {
            this.d = 0;
            this.e = 0;
            this.b = key;
            this.c = key.length;
            for (let pos = key.length - 1; pos >= 0; pos--, this.c--) {
                const ch = this.b.charCodeAt(pos);
                if (!(ch === 47 /* CharCode.Slash */ || this.f && ch === 92 /* CharCode.Backslash */)) {
                    break;
                }
            }
            return this.next();
        }
        hasNext() {
            return this.e < this.c;
        }
        next() {
            // this._data = key.split(/[\\/]/).filter(s => !!s);
            this.d = this.e;
            let justSeps = true;
            for (; this.e < this.c; this.e++) {
                const ch = this.b.charCodeAt(this.e);
                if (ch === 47 /* CharCode.Slash */ || this.f && ch === 92 /* CharCode.Backslash */) {
                    if (justSeps) {
                        this.d++;
                    }
                    else {
                        break;
                    }
                }
                else {
                    justSeps = false;
                }
            }
            return this;
        }
        cmp(a) {
            return this.g
                ? (0, strings_1.$ff)(a, this.b, 0, a.length, this.d, this.e)
                : (0, strings_1.$hf)(a, this.b, 0, a.length, this.d, this.e);
        }
        value() {
            return this.b.substring(this.d, this.e);
        }
    }
    exports.$mi = $mi;
    var UriIteratorState;
    (function (UriIteratorState) {
        UriIteratorState[UriIteratorState["Scheme"] = 1] = "Scheme";
        UriIteratorState[UriIteratorState["Authority"] = 2] = "Authority";
        UriIteratorState[UriIteratorState["Path"] = 3] = "Path";
        UriIteratorState[UriIteratorState["Query"] = 4] = "Query";
        UriIteratorState[UriIteratorState["Fragment"] = 5] = "Fragment";
    })(UriIteratorState || (UriIteratorState = {}));
    class $ni {
        constructor(f, g) {
            this.f = f;
            this.g = g;
            this.d = [];
            this.e = 0;
        }
        reset(key) {
            this.c = key;
            this.d = [];
            if (this.c.scheme) {
                this.d.push(1 /* UriIteratorState.Scheme */);
            }
            if (this.c.authority) {
                this.d.push(2 /* UriIteratorState.Authority */);
            }
            if (this.c.path) {
                this.b = new $mi(false, !this.f(key));
                this.b.reset(key.path);
                if (this.b.value()) {
                    this.d.push(3 /* UriIteratorState.Path */);
                }
            }
            if (!this.g(key)) {
                if (this.c.query) {
                    this.d.push(4 /* UriIteratorState.Query */);
                }
                if (this.c.fragment) {
                    this.d.push(5 /* UriIteratorState.Fragment */);
                }
            }
            this.e = 0;
            return this;
        }
        next() {
            if (this.d[this.e] === 3 /* UriIteratorState.Path */ && this.b.hasNext()) {
                this.b.next();
            }
            else {
                this.e += 1;
            }
            return this;
        }
        hasNext() {
            return (this.d[this.e] === 3 /* UriIteratorState.Path */ && this.b.hasNext())
                || this.e < this.d.length - 1;
        }
        cmp(a) {
            if (this.d[this.e] === 1 /* UriIteratorState.Scheme */) {
                return (0, strings_1.$gf)(a, this.c.scheme);
            }
            else if (this.d[this.e] === 2 /* UriIteratorState.Authority */) {
                return (0, strings_1.$gf)(a, this.c.authority);
            }
            else if (this.d[this.e] === 3 /* UriIteratorState.Path */) {
                return this.b.cmp(a);
            }
            else if (this.d[this.e] === 4 /* UriIteratorState.Query */) {
                return (0, strings_1.$ef)(a, this.c.query);
            }
            else if (this.d[this.e] === 5 /* UriIteratorState.Fragment */) {
                return (0, strings_1.$ef)(a, this.c.fragment);
            }
            throw new Error();
        }
        value() {
            if (this.d[this.e] === 1 /* UriIteratorState.Scheme */) {
                return this.c.scheme;
            }
            else if (this.d[this.e] === 2 /* UriIteratorState.Authority */) {
                return this.c.authority;
            }
            else if (this.d[this.e] === 3 /* UriIteratorState.Path */) {
                return this.b.value();
            }
            else if (this.d[this.e] === 4 /* UriIteratorState.Query */) {
                return this.c.query;
            }
            else if (this.d[this.e] === 5 /* UriIteratorState.Fragment */) {
                return this.c.fragment;
            }
            throw new Error();
        }
    }
    exports.$ni = $ni;
    class TernarySearchTreeNode {
        constructor() {
            this.height = 1;
        }
        isEmpty() {
            return !this.left && !this.mid && !this.right && !this.value;
        }
        rotateLeft() {
            const tmp = this.right;
            this.right = tmp.left;
            tmp.left = this;
            this.updateHeight();
            tmp.updateHeight();
            return tmp;
        }
        rotateRight() {
            const tmp = this.left;
            this.left = tmp.right;
            tmp.right = this;
            this.updateHeight();
            tmp.updateHeight();
            return tmp;
        }
        updateHeight() {
            this.height = 1 + Math.max(this.heightLeft, this.heightRight);
        }
        balanceFactor() {
            return this.heightRight - this.heightLeft;
        }
        get heightLeft() {
            return this.left?.height ?? 0;
        }
        get heightRight() {
            return this.right?.height ?? 0;
        }
    }
    var Dir;
    (function (Dir) {
        Dir[Dir["Left"] = -1] = "Left";
        Dir[Dir["Mid"] = 0] = "Mid";
        Dir[Dir["Right"] = 1] = "Right";
    })(Dir || (Dir = {}));
    class $oi {
        static forUris(ignorePathCasing = () => false, ignoreQueryAndFragment = () => false) {
            return new $oi(new $ni(ignorePathCasing, ignoreQueryAndFragment));
        }
        static forPaths(ignorePathCasing = false) {
            return new $oi(new $mi(undefined, !ignorePathCasing));
        }
        static forStrings() {
            return new $oi(new $ki());
        }
        static forConfigKeys() {
            return new $oi(new $li());
        }
        constructor(segments) {
            this.b = segments;
        }
        clear() {
            this.c = undefined;
        }
        fill(values, keys) {
            if (keys) {
                const arr = keys.slice(0);
                (0, arrays_1.$Xb)(arr);
                for (const k of arr) {
                    this.set(k, values);
                }
            }
            else {
                const arr = values.slice(0);
                (0, arrays_1.$Xb)(arr);
                for (const entry of arr) {
                    this.set(entry[0], entry[1]);
                }
            }
        }
        set(key, element) {
            const iter = this.b.reset(key);
            let node;
            if (!this.c) {
                this.c = new TernarySearchTreeNode();
                this.c.segment = iter.value();
            }
            const stack = [];
            // find insert_node
            node = this.c;
            while (true) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    if (!node.left) {
                        node.left = new TernarySearchTreeNode();
                        node.left.segment = iter.value();
                    }
                    stack.push([-1 /* Dir.Left */, node]);
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    if (!node.right) {
                        node.right = new TernarySearchTreeNode();
                        node.right.segment = iter.value();
                    }
                    stack.push([1 /* Dir.Right */, node]);
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    if (!node.mid) {
                        node.mid = new TernarySearchTreeNode();
                        node.mid.segment = iter.value();
                    }
                    stack.push([0 /* Dir.Mid */, node]);
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            // set value
            const oldElement = node.value;
            node.value = element;
            node.key = key;
            // balance
            for (let i = stack.length - 1; i >= 0; i--) {
                const node = stack[i][1];
                node.updateHeight();
                const bf = node.balanceFactor();
                if (bf < -1 || bf > 1) {
                    // needs rotate
                    const d1 = stack[i][0];
                    const d2 = stack[i + 1][0];
                    if (d1 === 1 /* Dir.Right */ && d2 === 1 /* Dir.Right */) {
                        //right, right -> rotate left
                        stack[i][1] = node.rotateLeft();
                    }
                    else if (d1 === -1 /* Dir.Left */ && d2 === -1 /* Dir.Left */) {
                        // left, left -> rotate right
                        stack[i][1] = node.rotateRight();
                    }
                    else if (d1 === 1 /* Dir.Right */ && d2 === -1 /* Dir.Left */) {
                        // right, left -> double rotate right, left
                        node.right = stack[i + 1][1] = stack[i + 1][1].rotateRight();
                        stack[i][1] = node.rotateLeft();
                    }
                    else if (d1 === -1 /* Dir.Left */ && d2 === 1 /* Dir.Right */) {
                        // left, right -> double rotate left, right
                        node.left = stack[i + 1][1] = stack[i + 1][1].rotateLeft();
                        stack[i][1] = node.rotateRight();
                    }
                    else {
                        throw new Error();
                    }
                    // patch path to parent
                    if (i > 0) {
                        switch (stack[i - 1][0]) {
                            case -1 /* Dir.Left */:
                                stack[i - 1][1].left = stack[i][1];
                                break;
                            case 1 /* Dir.Right */:
                                stack[i - 1][1].right = stack[i][1];
                                break;
                            case 0 /* Dir.Mid */:
                                stack[i - 1][1].mid = stack[i][1];
                                break;
                        }
                    }
                    else {
                        this.c = stack[0][1];
                    }
                }
            }
            return oldElement;
        }
        get(key) {
            return this.d(key)?.value;
        }
        d(key) {
            const iter = this.b.reset(key);
            let node = this.c;
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            return node;
        }
        has(key) {
            const node = this.d(key);
            return !(node?.value === undefined && node?.mid === undefined);
        }
        delete(key) {
            return this.e(key, false);
        }
        deleteSuperstr(key) {
            return this.e(key, true);
        }
        e(key, superStr) {
            const iter = this.b.reset(key);
            const stack = [];
            let node = this.c;
            // find node
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    stack.push([-1 /* Dir.Left */, node]);
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    stack.push([1 /* Dir.Right */, node]);
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    stack.push([0 /* Dir.Mid */, node]);
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            if (!node) {
                // node not found
                return;
            }
            if (superStr) {
                // removing children, reset height
                node.left = undefined;
                node.mid = undefined;
                node.right = undefined;
                node.height = 1;
            }
            else {
                // removing element
                node.key = undefined;
                node.value = undefined;
            }
            // BST node removal
            if (!node.mid && !node.value) {
                if (node.left && node.right) {
                    // full node
                    // replace deleted-node with the min-node of the right branch.
                    // If there is no true min-node leave things as they are
                    const min = this.f(node.right);
                    if (min.key) {
                        const { key, value, segment } = min;
                        this.e(min.key, false);
                        node.key = key;
                        node.value = value;
                        node.segment = segment;
                    }
                }
                else {
                    // empty or half empty
                    const newChild = node.left ?? node.right;
                    if (stack.length > 0) {
                        const [dir, parent] = stack[stack.length - 1];
                        switch (dir) {
                            case -1 /* Dir.Left */:
                                parent.left = newChild;
                                break;
                            case 0 /* Dir.Mid */:
                                parent.mid = newChild;
                                break;
                            case 1 /* Dir.Right */:
                                parent.right = newChild;
                                break;
                        }
                    }
                    else {
                        this.c = newChild;
                    }
                }
            }
            // AVL balance
            for (let i = stack.length - 1; i >= 0; i--) {
                const node = stack[i][1];
                node.updateHeight();
                const bf = node.balanceFactor();
                if (bf > 1) {
                    // right heavy
                    if (node.right.balanceFactor() >= 0) {
                        // right, right -> rotate left
                        stack[i][1] = node.rotateLeft();
                    }
                    else {
                        // right, left -> double rotate
                        node.right = node.right.rotateRight();
                        stack[i][1] = node.rotateLeft();
                    }
                }
                else if (bf < -1) {
                    // left heavy
                    if (node.left.balanceFactor() <= 0) {
                        // left, left -> rotate right
                        stack[i][1] = node.rotateRight();
                    }
                    else {
                        // left, right -> double rotate
                        node.left = node.left.rotateLeft();
                        stack[i][1] = node.rotateRight();
                    }
                }
                // patch path to parent
                if (i > 0) {
                    switch (stack[i - 1][0]) {
                        case -1 /* Dir.Left */:
                            stack[i - 1][1].left = stack[i][1];
                            break;
                        case 1 /* Dir.Right */:
                            stack[i - 1][1].right = stack[i][1];
                            break;
                        case 0 /* Dir.Mid */:
                            stack[i - 1][1].mid = stack[i][1];
                            break;
                    }
                }
                else {
                    this.c = stack[0][1];
                }
            }
        }
        f(node) {
            while (node.left) {
                node = node.left;
            }
            return node;
        }
        findSubstr(key) {
            const iter = this.b.reset(key);
            let node = this.c;
            let candidate = undefined;
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    candidate = node.value || candidate;
                    node = node.mid;
                }
                else {
                    break;
                }
            }
            return node && node.value || candidate;
        }
        findSuperstr(key) {
            return this.g(key, false);
        }
        g(key, allowValue) {
            const iter = this.b.reset(key);
            let node = this.c;
            while (node) {
                const val = iter.cmp(node.segment);
                if (val > 0) {
                    // left
                    node = node.left;
                }
                else if (val < 0) {
                    // right
                    node = node.right;
                }
                else if (iter.hasNext()) {
                    // mid
                    iter.next();
                    node = node.mid;
                }
                else {
                    // collect
                    if (!node.mid) {
                        if (allowValue) {
                            return node.value;
                        }
                        else {
                            return undefined;
                        }
                    }
                    else {
                        return this.h(node.mid);
                    }
                }
            }
            return undefined;
        }
        hasElementOrSubtree(key) {
            return this.g(key, true) !== undefined;
        }
        forEach(callback) {
            for (const [key, value] of this) {
                callback(value, key);
            }
        }
        *[Symbol.iterator]() {
            yield* this.h(this.c);
        }
        h(node) {
            const result = [];
            this.j(node, result);
            return result[Symbol.iterator]();
        }
        j(node, bucket) {
            // DFS
            if (!node) {
                return;
            }
            if (node.left) {
                this.j(node.left, bucket);
            }
            if (node.value) {
                bucket.push([node.key, node.value]);
            }
            if (node.mid) {
                this.j(node.mid, bucket);
            }
            if (node.right) {
                this.j(node.right, bucket);
            }
        }
        // for debug/testing
        _isBalanced() {
            const nodeIsBalanced = (node) => {
                if (!node) {
                    return true;
                }
                const bf = node.balanceFactor();
                if (bf < -1 || bf > 1) {
                    return false;
                }
                return nodeIsBalanced(node.left) && nodeIsBalanced(node.right);
            };
            return nodeIsBalanced(this.c);
        }
    }
    exports.$oi = $oi;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[3/*vs/platform/instantiation/common/instantiation*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hi = exports._util = void 0;
    exports.$ii = $ii;
    exports.$ji = $ji;
    // ------ internal util
    var _util;
    (function (_util) {
        _util.serviceIds = new Map();
        _util.DI_TARGET = '$di$target';
        _util.DI_DEPENDENCIES = '$di$dependencies';
        function getServiceDependencies(ctor) {
            return ctor[_util.DI_DEPENDENCIES] || [];
        }
        _util.getServiceDependencies = getServiceDependencies;
    })(_util || (exports._util = _util = {}));
    exports.$hi = $ii('instantiationService');
    function storeServiceDependency(id, target, index) {
        if (target[_util.DI_TARGET] === target) {
            target[_util.DI_DEPENDENCIES].push({ id, index });
        }
        else {
            target[_util.DI_DEPENDENCIES] = [{ id, index }];
            target[_util.DI_TARGET] = target;
        }
    }
    /**
     * The *only* valid way to create a {{ServiceIdentifier}}.
     */
    function $ii(serviceId) {
        if (_util.serviceIds.has(serviceId)) {
            return _util.serviceIds.get(serviceId);
        }
        const id = function (target, key, index) {
            if (arguments.length !== 3) {
                throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
            }
            storeServiceDependency(id, target, index);
        };
        id.toString = () => serviceId;
        _util.serviceIds.set(serviceId, id);
        return id;
    }
    function $ji(serviceIdentifier) {
        return serviceIdentifier;
    }
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[4/*vs/platform/profiling/common/profiling*/], __M([0/*require*/,1/*exports*/,5/*vs/base/common/path*/,3/*vs/platform/instantiation/common/instantiation*/]), function (require, exports, path_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Utils = exports.$UF = void 0;
    exports.$UF = (0, instantiation_1.$ii)('IV8InspectProfilingService');
    var Utils;
    (function (Utils) {
        function isValidProfile(profile) {
            return Boolean(profile.samples && profile.timeDeltas);
        }
        Utils.isValidProfile = isValidProfile;
        function rewriteAbsolutePaths(profile, replace = 'noAbsolutePaths') {
            for (const node of profile.nodes) {
                if (node.callFrame && node.callFrame.url) {
                    if ((0, path_1.$jc)(node.callFrame.url) || /^\w[\w\d+.-]*:\/\/\/?/.test(node.callFrame.url)) {
                        node.callFrame.url = (0, path_1.$kc)(replace, (0, path_1.$oc)(node.callFrame.url));
                    }
                }
            }
            return profile;
        }
        Utils.rewriteAbsolutePaths = rewriteAbsolutePaths;
    })(Utils || (exports.Utils = Utils = {}));
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[6/*vs/platform/profiling/common/profilingModel*/], __M([0/*require*/,1/*exports*/]), function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ggc = exports.$Fgc = exports.$Egc = void 0;
    /**
     * Recursive function that computes and caches the aggregate time for the
     * children of the computed now.
     */
    const computeAggregateTime = (index, nodes) => {
        const row = nodes[index];
        if (row.aggregateTime) {
            return row.aggregateTime;
        }
        let total = row.selfTime;
        for (const child of row.children) {
            total += computeAggregateTime(child, nodes);
        }
        return (row.aggregateTime = total);
    };
    const ensureSourceLocations = (profile) => {
        let locationIdCounter = 0;
        const locationsByRef = new Map();
        const getLocationIdFor = (callFrame) => {
            const ref = [
                callFrame.functionName,
                callFrame.url,
                callFrame.scriptId,
                callFrame.lineNumber,
                callFrame.columnNumber,
            ].join(':');
            const existing = locationsByRef.get(ref);
            if (existing) {
                return existing.id;
            }
            const id = locationIdCounter++;
            locationsByRef.set(ref, {
                id,
                callFrame,
                location: {
                    lineNumber: callFrame.lineNumber + 1,
                    columnNumber: callFrame.columnNumber + 1,
                    // source: {
                    // 	name: maybeFileUrlToPath(callFrame.url),
                    // 	path: maybeFileUrlToPath(callFrame.url),
                    // 	sourceReference: 0,
                    // },
                },
            });
            return id;
        };
        for (const node of profile.nodes) {
            node.locationId = getLocationIdFor(node.callFrame);
            node.positionTicks = node.positionTicks?.map(tick => ({
                ...tick,
                // weirdly, line numbers here are 1-based, not 0-based. The position tick
                // only gives line-level granularity, so 'mark' the entire range of source
                // code the tick refers to
                startLocationId: getLocationIdFor({
                    ...node.callFrame,
                    lineNumber: tick.line - 1,
                    columnNumber: 0,
                }),
                endLocationId: getLocationIdFor({
                    ...node.callFrame,
                    lineNumber: tick.line,
                    columnNumber: 0,
                }),
            }));
        }
        return [...locationsByRef.values()]
            .sort((a, b) => a.id - b.id)
            .map(l => ({ locations: [l.location], callFrame: l.callFrame }));
    };
    /**
     * Computes the model for the given profile.
     */
    const $Egc = (profile) => {
        if (!profile.timeDeltas || !profile.samples) {
            return {
                nodes: [],
                locations: [],
                samples: profile.samples || [],
                timeDeltas: profile.timeDeltas || [],
                // rootPath: profile.$vscode?.rootPath,
                duration: profile.endTime - profile.startTime,
            };
        }
        const { samples, timeDeltas } = profile;
        const sourceLocations = ensureSourceLocations(profile);
        const locations = sourceLocations.map((l, id) => {
            const src = l.locations[0]; //getBestLocation(profile, l.locations);
            return {
                id,
                selfTime: 0,
                aggregateTime: 0,
                ticks: 0,
                // category: categorize(l.callFrame, src),
                callFrame: l.callFrame,
                src,
            };
        });
        const idMap = new Map();
        const mapId = (nodeId) => {
            let id = idMap.get(nodeId);
            if (id === undefined) {
                id = idMap.size;
                idMap.set(nodeId, id);
            }
            return id;
        };
        // 1. Created a sorted list of nodes. It seems that the profile always has
        // incrementing IDs, although they are just not initially sorted.
        const nodes = new Array(profile.nodes.length);
        for (let i = 0; i < profile.nodes.length; i++) {
            const node = profile.nodes[i];
            // make them 0-based:
            const id = mapId(node.id);
            nodes[id] = {
                id,
                selfTime: 0,
                aggregateTime: 0,
                locationId: node.locationId,
                children: node.children?.map(mapId) || [],
            };
            for (const child of node.positionTicks || []) {
                if (child.startLocationId) {
                    locations[child.startLocationId].ticks += child.ticks;
                }
            }
        }
        for (const node of nodes) {
            for (const child of node.children) {
                nodes[child].parent = node.id;
            }
        }
        // 2. The profile samples are the 'bottom-most' node, the currently running
        // code. Sum of these in the self time.
        const duration = profile.endTime - profile.startTime;
        let lastNodeTime = duration - timeDeltas[0];
        for (let i = 0; i < timeDeltas.length - 1; i++) {
            const d = timeDeltas[i + 1];
            nodes[mapId(samples[i])].selfTime += d;
            lastNodeTime -= d;
        }
        // Add in an extra time delta for the last sample. `timeDeltas[0]` is the
        // time before the first sample, and the time of the last sample is only
        // derived (approximately) by the missing time in the sum of deltas. Save
        // some work by calculating it here.
        if (nodes.length) {
            nodes[mapId(samples[timeDeltas.length - 1])].selfTime += lastNodeTime;
            timeDeltas.push(lastNodeTime);
        }
        // 3. Add the aggregate times for all node children and locations
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const location = locations[node.locationId];
            location.aggregateTime += computeAggregateTime(i, nodes);
            location.selfTime += node.selfTime;
        }
        return {
            nodes,
            locations,
            samples: samples.map(mapId),
            timeDeltas,
            // rootPath: profile.$vscode?.rootPath,
            duration,
        };
    };
    exports.$Egc = $Egc;
    class $Fgc {
        static root() {
            return new $Fgc({
                id: -1,
                selfTime: 0,
                aggregateTime: 0,
                ticks: 0,
                callFrame: {
                    functionName: '(root)',
                    lineNumber: -1,
                    columnNumber: -1,
                    scriptId: '0',
                    url: '',
                },
            });
        }
        get id() {
            return this.location.id;
        }
        get callFrame() {
            return this.location.callFrame;
        }
        get src() {
            return this.location.src;
        }
        constructor(location, parent) {
            this.location = location;
            this.parent = parent;
            this.children = {};
            this.aggregateTime = 0;
            this.selfTime = 0;
            this.ticks = 0;
            this.childrenSize = 0;
        }
        addNode(node) {
            this.selfTime += node.selfTime;
            this.aggregateTime += node.aggregateTime;
        }
    }
    exports.$Fgc = $Fgc;
    const $Ggc = (aggregate, node, model, initialNode = node) => {
        let child = aggregate.children[node.locationId];
        if (!child) {
            child = new $Fgc(model.locations[node.locationId], aggregate);
            aggregate.childrenSize++;
            aggregate.children[node.locationId] = child;
        }
        child.addNode(initialNode);
        if (node.parent) {
            (0, exports.$Ggc)(child, model.nodes[node.parent], model, initialNode);
        }
    };
    exports.$Ggc = $Ggc;
});

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(__m[9/*vs/platform/profiling/electron-sandbox/profileAnalysisWorker*/], __M([0/*require*/,1/*exports*/,5/*vs/base/common/path*/,2/*vs/base/common/ternarySearchTree*/,10/*vs/base/common/uri*/,4/*vs/platform/profiling/common/profiling*/,6/*vs/platform/profiling/common/profilingModel*/]), function (require, exports, path_1, ternarySearchTree_1, uri_1, profiling_1, profilingModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.create = create;
    function create() {
        return new ProfileAnalysisWorker();
    }
    class ProfileAnalysisWorker {
        analyseBottomUp(profile) {
            if (!profiling_1.Utils.isValidProfile(profile)) {
                return { kind: 1 /* ProfilingOutput.Irrelevant */, samples: [] };
            }
            const model = (0, profilingModel_1.$Egc)(profile);
            const samples = bottomUp(model, 5)
                .filter(s => !s.isSpecial);
            if (samples.length === 0 || samples[0].percentage < 10) {
                // ignore this profile because 90% of the time is spent inside "special" frames
                // like idle, GC, or program
                return { kind: 1 /* ProfilingOutput.Irrelevant */, samples: [] };
            }
            return { kind: 2 /* ProfilingOutput.Interesting */, samples };
        }
        analyseByUrlCategory(profile, categories) {
            // build search tree
            const searchTree = ternarySearchTree_1.$oi.forUris();
            searchTree.fill(categories);
            // cost by categories
            const model = (0, profilingModel_1.$Egc)(profile);
            const aggegrateByCategory = new Map();
            for (const node of model.nodes) {
                const loc = model.locations[node.locationId];
                let category;
                try {
                    category = searchTree.findSubstr(uri_1.URI.parse(loc.callFrame.url));
                }
                catch {
                    // ignore
                }
                if (!category) {
                    category = printCallFrameShort(loc.callFrame);
                }
                const value = aggegrateByCategory.get(category) ?? 0;
                const newValue = value + node.selfTime;
                aggegrateByCategory.set(category, newValue);
            }
            const result = [];
            for (const [key, value] of aggegrateByCategory) {
                result.push([key, value]);
            }
            return result;
        }
    }
    function isSpecial(call) {
        return call.functionName.startsWith('(') && call.functionName.endsWith(')');
    }
    function printCallFrameShort(frame) {
        let result = frame.functionName || '(anonymous)';
        if (frame.url) {
            result += '#';
            result += (0, path_1.$oc)(frame.url);
            if (frame.lineNumber >= 0) {
                result += ':';
                result += frame.lineNumber + 1;
            }
            if (frame.columnNumber >= 0) {
                result += ':';
                result += frame.columnNumber + 1;
            }
        }
        return result;
    }
    function printCallFrameStackLike(frame) {
        let result = frame.functionName || '(anonymous)';
        if (frame.url) {
            result += ' (';
            result += frame.url;
            if (frame.lineNumber >= 0) {
                result += ':';
                result += frame.lineNumber + 1;
            }
            if (frame.columnNumber >= 0) {
                result += ':';
                result += frame.columnNumber + 1;
            }
            result += ')';
        }
        return result;
    }
    function getHeaviestLocationIds(model, topN) {
        const stackSelfTime = {};
        for (const node of model.nodes) {
            stackSelfTime[node.locationId] = (stackSelfTime[node.locationId] || 0) + node.selfTime;
        }
        const locationIds = Object.entries(stackSelfTime)
            .sort(([, a], [, b]) => b - a)
            .slice(0, topN)
            .map(([locationId]) => Number(locationId));
        return new Set(locationIds);
    }
    function bottomUp(model, topN) {
        const root = profilingModel_1.$Fgc.root();
        const locationIds = getHeaviestLocationIds(model, topN);
        for (const node of model.nodes) {
            if (locationIds.has(node.locationId)) {
                (0, profilingModel_1.$Ggc)(root, node, model);
                root.addNode(node);
            }
        }
        const result = Object.values(root.children)
            .sort((a, b) => b.selfTime - a.selfTime)
            .slice(0, topN);
        const samples = [];
        for (const node of result) {
            const sample = {
                selfTime: Math.round(node.selfTime / 1000),
                totalTime: Math.round(node.aggregateTime / 1000),
                location: printCallFrameShort(node.callFrame),
                absLocation: printCallFrameStackLike(node.callFrame),
                url: node.callFrame.url,
                caller: [],
                percentage: Math.round(node.selfTime / (model.duration / 100)),
                isSpecial: isSpecial(node.callFrame)
            };
            // follow the heaviest caller paths
            const stack = [node];
            while (stack.length) {
                const node = stack.pop();
                let top;
                for (const candidate of Object.values(node.children)) {
                    if (!top || top.selfTime < candidate.selfTime) {
                        top = candidate;
                    }
                }
                if (top) {
                    const percentage = Math.round(top.selfTime / (node.selfTime / 100));
                    sample.caller.push({
                        percentage,
                        location: printCallFrameShort(top.callFrame),
                        absLocation: printCallFrameStackLike(top.callFrame),
                    });
                    stack.push(top);
                }
            }
            samples.push(sample);
        }
        return samples;
    }
});

}).call(this);
//# sourceMappingURL=profileAnalysisWorker.js.map
