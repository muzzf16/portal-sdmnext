import{d as c,e as n}from"./index-C16ccCUI.js";/**
 * @license lucide-react v0.548.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r=[["path",{d:"m6 9 6 6 6-6",key:"qrunsl"}]],p=c("chevron-down",r),s="/jabatan",i=async()=>{var t;const a=await n.get(`${s}`);return((t=a.data)==null?void 0:t.data)||a.data},u=async()=>{var t;const a=await n.get(`${s}/tree-with-employees`);return((t=a.data)==null?void 0:t.data)||a.data},w=async a=>{var e;const t=await n.post(s,a);return((e=t.data)==null?void 0:e.data)||t.data},y=async(a,t)=>{var o;const e=await n.put(`${s}/${a}`,t);return((o=e.data)==null?void 0:o.data)||e.data},b=async a=>{await n.delete(`${s}/${a}`)};export{p as C,u as a,w as c,b as d,i as g,y as u};
