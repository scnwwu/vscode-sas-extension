"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[9780],{3969:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>r,default:()=>h,frontMatter:()=>l,metadata:()=>d,toc:()=>x});var s=n(4848),i=n(8453);const l={},r="Choose connection type",d={id:"matrix",title:"Choose connection type",description:"When doing VS Code Remote Development, the SAS extension is running on the Remote OS.",source:"@site/docs/matrix.md",sourceDirName:".",slug:"/matrix",permalink:"/vscode-sas-extension/matrix",draft:!1,unlisted:!1,editUrl:"https://github.com/sassoftware/vscode-sas-extension/tree/main/website/docs/matrix.md",tags:[],version:"current",frontMatter:{},sidebar:"defaultSidebar",previous:{title:"Connect to SAS and Run Code",permalink:"/vscode-sas-extension/connect-and-run"}},c={},x=[];function o(e){const t={a:"a",admonition:"admonition",h1:"h1",mermaid:"mermaid",p:"p",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(t.h1,{id:"choose-connection-type",children:"Choose connection type"}),"\n",(0,s.jsx)(t.mermaid,{value:'flowchart LR;\nQ1{SAS version?}\nQ1 --\x3e|Viya| Viya[SAS Viya]\nQ1 --\x3e|SAS 9.4| Q2{Extension on Windows?}\nQ2 --\x3e|Yes| Q3{Connecting to Local?}\nQ2 --\x3e|No| SSH["SAS 9.4 (remote - SSH)"]\nQ3 --\x3e|Yes| Local["SAS 9.4 (local)"]\nQ3 --\x3e|No| IOM["SAS 9.4 (remote - IOM)"]'}),"\n",(0,s.jsx)(t.admonition,{type:"info",children:(0,s.jsxs)(t.p,{children:["When doing ",(0,s.jsx)(t.a,{href:"https://code.visualstudio.com/docs/remote/remote-overview",children:"VS Code Remote Development"}),", the SAS extension is running on the Remote OS."]})}),"\n",(0,s.jsx)(t.h1,{id:"capabilities-by-connection-type",children:"Capabilities by Connection Type"}),"\n",(0,s.jsxs)(t.table,{children:[(0,s.jsx)(t.thead,{children:(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.th,{children:"SAS Extension for Visual Studio Code - Capabilities by Connection Type"}),(0,s.jsx)(t.th,{style:{textAlign:"center"},children:"SAS Viya"}),(0,s.jsxs)(t.th,{style:{textAlign:"center"},children:["SAS 9.4 (local) ",(0,s.jsx)("br",{})," SAS 9.4 (remote - IOM)"]}),(0,s.jsx)(t.th,{style:{textAlign:"center"},children:"SAS 9.4 (remote - SSH)"}),(0,s.jsx)(t.th,{children:"Notes"})]})}),(0,s.jsxs)(t.tbody,{children:[(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"SAS System Options settings"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsxs)(t.td,{style:{textAlign:"center"},children:["\u2714\ufe0f","*"]}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{children:"*Startup options not supported for SAS 9.4 (local) and (remote-IOM)"})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"Autoexec settings"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u274c"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u274c"}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"Access SAS Content"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u274c"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u274c"}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"Access connected libraries"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u274c"}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"Table viewer"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u274c"}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"SAS Notebooks"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"Convert SAS Notebook to SAS Studio Flow"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u274c"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u274c"}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"SAS syntax highlighting in SAS code"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"SAS errors, warnings, and notes highlighting in SAS log"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u274c"}),(0,s.jsx)(t.td,{children:"A SAS color theme is required."})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"Code folding and code outline"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"Code completion"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"Pop-up syntax help"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"Snippets"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{})]}),(0,s.jsxs)(t.tr,{children:[(0,s.jsx)(t.td,{children:"Able to cancel a running program"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u2714\ufe0f"}),(0,s.jsx)(t.td,{style:{textAlign:"center"},children:"\u274c"}),(0,s.jsx)(t.td,{})]})]})]})]})}function h(e={}){const{wrapper:t}={...(0,i.R)(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(o,{...e})}):o(e)}}}]);