(()=>{"use strict";var e={15:function(e,t,i){var r=this&&this.__awaiter||function(e,t,i,r){return new(i||(i=Promise))((function(s,o){function n(e){try{l(r.next(e))}catch(e){o(e)}}function a(e){try{l(r.throw(e))}catch(e){o(e)}}function l(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(n,a)}l((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.activate=void 0;const s=i(496),o=i(668);t.activate=function(e){return r(this,void 0,void 0,(function*(){if("object"==typeof navigator){const t={preview:!1},i=s.workspace.workspaceFolders&&s.workspace.workspaceFolders.length>0?s.workspace.workspaceFolders[0].uri:void 0,n=function(e){const t=new o.MemFS;return e.subscriptions.push(t),t}(e);let a;yield n.loadInitialAssets(e.extensionUri),s.commands.executeCommand("vscode.open",s.Uri.parse("memfs:/siv3d-playground/src/Main.cpp"),t),s.commands.executeCommand("emcc.preview.show",s.Uri.joinPath(i,"main.html"),"Siv3D Preview"),yield n.loadAdditionalAssets(),e.subscriptions.push(s.commands.registerCommand("siv3d-playground.compile.run",(()=>r(this,void 0,void 0,(function*(){const e=new Promise(((e,t)=>{a=e}));s.commands.executeCommand("workbench.action.tasks.runTask","emcc build"),yield e,s.commands.executeCommand("emcc.preview.show",s.Uri.joinPath(i,"main.html"),"Siv3D Preview"),a=null}))))),s.tasks.onDidEndTask((e=>{"emcc build"==e.execution.task.name&&a&&a()}))}}))}},668:function(e,t,i){var r=this&&this.__awaiter||function(e,t,i,r){return new(i||(i=Promise))((function(s,o){function n(e){try{l(r.next(e))}catch(e){o(e)}}function a(e){try{l(r.throw(e))}catch(e){o(e)}}function l(e){var t;e.done?s(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(n,a)}l((r=r.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.MemFS=t.Directory=t.File=void 0;const s=i(496);class o{constructor(e,t){this.uri=e,this.type=s.FileType.File,this.ctime=Date.now(),this.mtime=Date.now(),this.size=0,this.name=t}}t.File=o;class n{constructor(e,t){this.uri=e,this.type=s.FileType.Directory,this.ctime=Date.now(),this.mtime=Date.now(),this.size=0,this.name=t,this.entries=new Map}}t.Directory=n,new TextEncoder;class a{constructor(){this.root=new n(s.Uri.parse("memfs:/"),""),this._emitter=new s.EventEmitter,this._bufferedEvents=[],this.onDidChangeFile=this._emitter.event,this._textDecoder=new TextDecoder,this.disposable=s.Disposable.from(s.workspace.registerFileSystemProvider(a.scheme,this,{isCaseSensitive:!0}),s.workspace.registerFileSearchProvider(a.scheme,this),s.workspace.registerTextSearchProvider(a.scheme,this))}dispose(){var e;null===(e=this.disposable)||void 0===e||e.dispose()}loadInitialAssets(e){return r(this,void 0,void 0,(function*(){const t=[];this.createDirectory(s.Uri.parse("memfs:/siv3d-playground")),t.push(function(){return r(this,void 0,void 0,(function*(){const t=yield s.workspace.fs.readFile(s.Uri.joinPath(e,"template/main.html"));this.writeFile(s.Uri.parse("memfs:/siv3d-playground/main.html"),t,{create:!0,overwrite:!1})}))}.call(this)),t.push(function(){return r(this,void 0,void 0,(function*(){const t=yield s.workspace.fs.readFile(s.Uri.joinPath(e,"template/README.md"));this.writeFile(s.Uri.parse("memfs:/siv3d-playground/README.md"),t,{create:!0,overwrite:!1})}))}.call(this)),this.createDirectory(s.Uri.parse("memfs:/siv3d-playground/.vscode")),t.push(function(){return r(this,void 0,void 0,(function*(){const t=yield s.workspace.fs.readFile(s.Uri.joinPath(e,"template/.vscode/tasks.json"));this.writeFile(s.Uri.parse("memfs:/siv3d-playground/.vscode/tasks.json"),t,{create:!0,overwrite:!1})}))}.call(this)),this.createDirectory(s.Uri.parse("memfs:/siv3d-playground/src")),t.push(function(){return r(this,void 0,void 0,(function*(){const t=yield s.workspace.fs.readFile(s.Uri.joinPath(e,"template/src/Main.cpp"));this.writeFile(s.Uri.parse("memfs:/siv3d-playground/src/Main.cpp"),t,{create:!0,overwrite:!1})}))}.call(this)),this.createDirectory(s.Uri.parse("memfs:/siv3d-playground/include")),yield Promise.all(t)}))}loadAdditionalAssets(){return r(this,void 0,void 0,(function*(){const e=[];e.push(function(){return r(this,void 0,void 0,(function*(){const e=yield fetch("https://siv3d-assets.kamenokosoft.com/v6/lib/Siv3D.wasm");this.writeFile(s.Uri.parse("memfs:/siv3d-playground/Siv3D.wasm"),new Uint8Array(yield e.arrayBuffer()),{create:!0,overwrite:!1})}))}.call(this)),e.push(function(){return r(this,void 0,void 0,(function*(){const e=yield fetch("https://siv3d-assets.kamenokosoft.com/v6/lib/Siv3D.js");this.writeFile(s.Uri.parse("memfs:/siv3d-playground/Siv3D.js"),new Uint8Array(yield e.arrayBuffer()),{create:!0,overwrite:!1})}))}.call(this)),e.push(function(){return r(this,void 0,void 0,(function*(){const e=yield fetch("https://siv3d-assets.kamenokosoft.com/v6/lib/Siv3D.data");this.writeFile(s.Uri.parse("memfs:/siv3d-playground/Siv3D.data"),new Uint8Array(yield e.arrayBuffer()),{create:!0,overwrite:!1})}))}.call(this)),this.createDirectory(s.Uri.parse("memfs:/siv3d-playground/example")),e.push(function(){return r(this,void 0,void 0,(function*(){const e=yield fetch("https://siv3d-assets.kamenokosoft.com/v6/example/windmill.png");this.writeFile(s.Uri.parse("memfs:/siv3d-playground/example/windmill.png"),new Uint8Array(yield e.arrayBuffer()),{create:!0,overwrite:!1})}))}.call(this)),yield Promise.all(e)}))}stat(e){return this._lookup(e,!1)}readDirectory(e){const t=this._lookupAsDirectory(e,!1);let i=[];for(const[e,r]of t.entries)i.push([e,r.type]);return i}readFile(e){const t=this._lookupAsFile(e,!1).data;if(t)return t;throw s.FileSystemError.FileNotFound()}writeFile(e,t,i){let r=this._basename(e.path),a=this._lookupParentDirectory(e),l=a.entries.get(r);if(l instanceof n)throw s.FileSystemError.FileIsADirectory(e);if(!l&&!i.create)throw s.FileSystemError.FileNotFound(e);if(l&&i.create&&!i.overwrite)throw s.FileSystemError.FileExists(e);l||(l=new o(e,r),a.entries.set(r,l),this._fireSoon({type:s.FileChangeType.Created,uri:e})),l.mtime=Date.now(),l.size=t.byteLength,l.data=t,this._fireSoon({type:s.FileChangeType.Changed,uri:e})}rename(e,t,i){if(!i.overwrite&&this._lookup(t,!0))throw s.FileSystemError.FileExists(t);let r=this._lookup(e,!1),o=this._lookupParentDirectory(e),n=this._lookupParentDirectory(t),a=this._basename(t.path);o.entries.delete(r.name),r.name=a,n.entries.set(a,r),this._fireSoon({type:s.FileChangeType.Deleted,uri:e},{type:s.FileChangeType.Created,uri:t})}delete(e){let t=e.with({path:this._dirname(e.path)}),i=this._basename(e.path),r=this._lookupAsDirectory(t,!1);if(!r.entries.has(i))throw s.FileSystemError.FileNotFound(e);r.entries.delete(i),r.mtime=Date.now(),r.size-=1,this._fireSoon({type:s.FileChangeType.Changed,uri:t},{uri:e,type:s.FileChangeType.Deleted})}createDirectory(e){let t=this._basename(e.path),i=e.with({path:this._dirname(e.path)}),r=this._lookupAsDirectory(i,!1),o=new n(e,t);r.entries.set(o.name,o),r.mtime=Date.now(),r.size+=1,this._fireSoon({type:s.FileChangeType.Changed,uri:i},{type:s.FileChangeType.Created,uri:e})}_lookup(e,t){let i=e.path.split("/"),r=this.root;for(const o of i){if(!o)continue;let i;if(r instanceof n&&(i=r.entries.get(o)),!i){if(t)return;throw s.FileSystemError.FileNotFound(e)}r=i}return r}_lookupAsDirectory(e,t){let i=this._lookup(e,t);if(i instanceof n)return i;throw s.FileSystemError.FileNotADirectory(e)}_lookupAsFile(e,t){let i=this._lookup(e,t);if(i instanceof o)return i;throw s.FileSystemError.FileIsADirectory(e)}_lookupParentDirectory(e){const t=e.with({path:this._dirname(e.path)});return this._lookupAsDirectory(t,!1)}watch(e){return new s.Disposable((()=>{}))}_fireSoon(...e){this._bufferedEvents.push(...e),this._fireSoonHandle&&clearTimeout(this._fireSoonHandle),this._fireSoonHandle=setTimeout((()=>{this._emitter.fire(this._bufferedEvents),this._bufferedEvents.length=0}),5)}_basename(e){return(e=this._rtrim(e,"/"))?e.substr(e.lastIndexOf("/")+1):""}_dirname(e){return(e=this._rtrim(e,"/"))?e.substr(0,e.lastIndexOf("/")):"/"}_rtrim(e,t){if(!e||!t)return e;const i=t.length,r=e.length;if(0===i||0===r)return e;let s=r,o=-1;for(;o=e.lastIndexOf(t,s-1),-1!==o&&o+i===s;){if(0===o)return"";s=o}return e.substring(0,s)}_getFiles(){const e=new Set;return this._doGetFiles(this.root,e),e}_doGetFiles(e,t){e.entries.forEach((e=>{e instanceof o?t.add(e):this._doGetFiles(e,t)}))}_convertSimple2RegExpPattern(e){return e.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g,"\\$&").replace(/[\*]/g,".*")}provideFileSearchResults(e,t,i){return this._findFiles(e.pattern)}_findFiles(e){const t=this._getFiles(),i=[],r=e?new RegExp(this._convertSimple2RegExpPattern(e)):null;for(const e of t)r&&!r.exec(e.name)||i.push(e.uri);return i}provideTextSearchResults(e,t,i,r){const o=this._findFiles(t.includes[0]);if(o)for(const t of o){const r=this._textDecoder.decode(this.readFile(t)).split("\n");for(let o=0;o<r.length;o++){const n=r[o],a=n.indexOf(e.pattern);-1!==a&&i.report({uri:t,ranges:new s.Range(new s.Position(o,a),new s.Position(o,a+e.pattern.length)),preview:{text:n,matches:new s.Range(new s.Position(0,a),new s.Position(0,a+e.pattern.length))}})}}return{limitHit:!1}}}t.MemFS=a,a.scheme="memfs"},496:e=>{e.exports=require("vscode")}},t={},i=function i(r){var s=t[r];if(void 0!==s)return s.exports;var o=t[r]={exports:{}};return e[r].call(o.exports,o,o.exports,i),o.exports}(15),r=exports;for(var s in i)r[s]=i[s];i.__esModule&&Object.defineProperty(r,"__esModule",{value:!0})})();
//# sourceMappingURL=extension.js.map