/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/(function(){var g=["vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker","require","exports","vs/base/common/stopwatch","vs/editor/common/services/editorSimpleWorker"],v=function(f){for(var u=[],h=0,l=f.length;h<l;h++)u[h]=g[f[h]];return u};define(g[0],v([1,2,3,4]),function(f,u,h,l){"use strict";Object.defineProperty(u,"__esModule",{value:!0}),u.LanguageDetectionSimpleWorker=u.create=void 0;function b(p){return new c(p,null)}u.create=b;class c extends l.EditorSimpleWorker{constructor(){super(...arguments),this.v=!1,this.y=!1,this.z=new Map}async detectLanguage(s,n,e,r){const i=[],t=[],d=new h.StopWatch(!0),w=this.A(s);if(!w)return;const y=async()=>{for await(const a of this.F(w)){this.z.has(a.languageId)||this.z.set(a.languageId,await this.d.fhr("getLanguageId",[a.languageId]));const o=this.z.get(a.languageId);o&&(!r?.length||r.includes(o))&&(i.push(o),t.push(a.confidence))}if(d.stop(),i.length)return this.d.fhr("sendTelemetryEvent",[i,t,d.elapsed()]),i[0]},m=async()=>this.C(w,n??{},r);if(e){const a=await m();if(a)return a;const o=await y();if(o)return o}else{const a=await y();if(a)return a;const o=await m();if(o)return o}}A(s){const n=this.j(s);if(!n)return;const e=n.positionAt(1e4);return n.getValueInRange({startColumn:1,startLineNumber:1,endColumn:e.column,endLineNumber:e.lineNumber})}async B(){if(this.v)return;if(this.u)return this.u;const s=await this.d.fhr("getRegexpModelUri",[]);try{return this.u=await new Promise((n,e)=>{f([s],n,e)}),this.u}catch{this.v=!0;return}}async C(s,n,e){const r=await this.B();if(!r)return;if(e?.length)for(const t of Object.keys(n))e.includes(t)?n[t]=1:n[t]=0;return r.detect(s,n,e)}async D(){if(this.w)return this.w;const s=await this.d.fhr("getIndexJsUri",[]),{ModelOperations:n}=await new Promise((e,r)=>{f([s],e,r)});return this.w=new n({modelJsonLoaderFunc:async()=>{const e=await fetch(await this.d.fhr("getModelJsonUri",[]));try{return await e.json()}catch{const i="Failed to parse model JSON.";throw new Error(i)}},weightsLoaderFunc:async()=>await(await fetch(await this.d.fhr("getWeightsUri",[]))).arrayBuffer()}),this.w}E(s){switch(s.languageId){case"js":case"html":case"json":case"ts":case"css":case"py":case"xml":case"php":s.confidence+=c.r;break;case"cpp":case"sh":case"java":case"cs":case"c":s.confidence+=c.s;break;case"bat":case"ini":case"makefile":case"sql":case"csv":case"toml":s.confidence-=c.t;break;default:break}return s}async*F(s){if(this.y)return;let n;try{n=await this.D()}catch(t){console.log(t),this.y=!0;return}let e;try{e=await n.runModel(s)}catch(t){console.warn(t)}if(!e||e.length===0||e[0].confidence<c.q)return;const r=this.E(e[0]);if(r.confidence<c.q)return;const i=[r];for(let t of e){if(t===r)continue;if(t=this.E(t),i[i.length-1].confidence-t.confidence>=c.q){for(;i.length;)yield i.shift();if(t.confidence>c.q){i.push(t);continue}return}else{if(t.confidence>c.q){i.push(t);continue}return}}}}c.q=.2,c.r=.05,c.s=.025,c.t=.5,u.LanguageDetectionSimpleWorker=c})}).call(this);

//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/e344f1f539a80912a0e9357cec841f36ce97a4e2/core/vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorker.js.map
