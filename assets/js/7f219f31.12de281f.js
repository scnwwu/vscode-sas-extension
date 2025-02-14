"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[4782],{6762:(e,o,n)=>{n.r(o),n.d(o,{assets:()=>r,contentTitle:()=>l,default:()=>h,frontMatter:()=>a,metadata:()=>t,toc:()=>c});const t=JSON.parse('{"id":"Configurations/Profiles/sas9local","title":"SAS 9.4 (local) Connection Profile","description":"To use a SAS 9.4 (local) connection type, you need to have SAS Integration Technologies Client for Windows (ITCLIENT) installed on the client machine (the same machine VS Code is installed on).","source":"@site/docs/Configurations/Profiles/sas9local.md","sourceDirName":"Configurations/Profiles","slug":"/Configurations/Profiles/sas9local","permalink":"/vscode-sas-extension/Configurations/Profiles/sas9local","draft":false,"unlisted":false,"editUrl":"https://github.com/sassoftware/vscode-sas-extension/tree/main/website/docs/Configurations/Profiles/sas9local.md","tags":[],"version":"current","sidebarPosition":2,"frontMatter":{"sidebar_position":2},"sidebar":"defaultSidebar","previous":{"title":"SAS Viya Connection Profile","permalink":"/vscode-sas-extension/Configurations/Profiles/viya"},"next":{"title":"SAS 9.4 (remote - IOM) Connection Profile","permalink":"/vscode-sas-extension/Configurations/Profiles/sas9iom"}}');var i=n(4848),s=n(8453);const a={sidebar_position:2},l="SAS 9.4 (local) Connection Profile",r={},c=[{value:"Profile Anatomy",id:"profile-anatomy",level:2}];function d(e){const o={a:"a",code:"code",h1:"h1",h2:"h2",header:"header",p:"p",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(o.header,{children:(0,i.jsx)(o.h1,{id:"sas-94-local-connection-profile",children:"SAS 9.4 (local) Connection Profile"})}),"\n",(0,i.jsx)(o.p,{children:"To use a SAS 9.4 (local) connection type, you need to have SAS Integration Technologies Client for Windows (ITCLIENT) installed on the client machine (the same machine VS Code is installed on)."}),"\n",(0,i.jsx)(o.p,{children:'You can check the SASHOME location on your client machine to see if you already have ITCLIENT installed. For example, ITCLIENT is normally installed in the default path "C:\\Program Files\\SASHome\\x86\\Integration Technologies". If that path exists on your machine, you have ITCLIENT. ITCLIENT is automatically installed with some SAS software, such as SAS Enterprise Guide and SAS Add-in for Microsoft Office, so if you have one of those on your machine, you likely already have ITCLIENT as well.'}),"\n",(0,i.jsxs)(o.p,{children:["If you do not already have ITCLIENT installed on the client machine, follow the ",(0,i.jsx)(o.a,{href:"/vscode-sas-extension/Configurations/Profiles/sas9iom#steps-to-install-itclient",children:"steps"}),"."]}),"\n",(0,i.jsx)(o.h2,{id:"profile-anatomy",children:"Profile Anatomy"}),"\n",(0,i.jsx)(o.p,{children:"A local SAS 9.4 connection profile includes the following parameters:"}),"\n",(0,i.jsx)(o.p,{children:(0,i.jsx)(o.code,{children:'"connectionType": "com"'})}),"\n",(0,i.jsxs)(o.table,{children:[(0,i.jsx)(o.thead,{children:(0,i.jsxs)(o.tr,{children:[(0,i.jsx)(o.th,{children:"Name"}),(0,i.jsx)(o.th,{children:"Description"}),(0,i.jsx)(o.th,{children:"Additional Notes"})]})}),(0,i.jsx)(o.tbody,{children:(0,i.jsxs)(o.tr,{children:[(0,i.jsx)(o.td,{children:(0,i.jsx)(o.code,{children:"host"})}),(0,i.jsx)(o.td,{children:"Indicates SAS 9.4 local instance"}),(0,i.jsx)(o.td,{children:'Defaults to "localhost" for com'})]})})]})]})}function h(e={}){const{wrapper:o}={...(0,s.R)(),...e.components};return o?(0,i.jsx)(o,{...e,children:(0,i.jsx)(d,{...e})}):d(e)}},8453:(e,o,n)=>{n.d(o,{R:()=>a,x:()=>l});var t=n(6540);const i={},s=t.createContext(i);function a(e){const o=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(o):{...o,...e}}),[o,e])}function l(e){let o;return o=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:a(e.components),t.createElement(s.Provider,{value:o},e.children)}}}]);