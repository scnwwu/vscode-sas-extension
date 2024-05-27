"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[3315],{5744:(e,n,o)=>{o.r(n),o.d(n,{assets:()=>l,contentTitle:()=>r,default:()=>h,frontMatter:()=>s,metadata:()=>a,toc:()=>c});var t=o(4848),i=o(8453);const s={sidebar_position:3},r="SAS 9.4 (remote - IOM) Connection Profile",a={id:"Configurations/Profiles/sas9iom",title:"SAS 9.4 (remote - IOM) Connection Profile",description:"To use a SAS 9.4 (remote \u2013 IOM) connection type, you need to have SAS Integration Technologies Client for Windows (ITCLIENT) installed on the client machine (the same machine VS Code is installed on).",source:"@site/docs/Configurations/Profiles/sas9iom.md",sourceDirName:"Configurations/Profiles",slug:"/Configurations/Profiles/sas9iom",permalink:"/vscode-sas-extension/Configurations/Profiles/sas9iom",draft:!1,unlisted:!1,editUrl:"https://github.com/sassoftware/vscode-sas-extension/tree/main/website/docs/Configurations/Profiles/sas9iom.md",tags:[],version:"current",sidebarPosition:3,frontMatter:{sidebar_position:3},sidebar:"defaultSidebar",previous:{title:"SAS 9.4 (local) Connection Profile",permalink:"/vscode-sas-extension/Configurations/Profiles/sas9local"},next:{title:"SAS 9.4 (remote - SSH) Connection Profile",permalink:"/vscode-sas-extension/Configurations/Profiles/sas9ssh"}},l={},c=[{value:"Profile Anatomy",id:"profile-anatomy",level:2},{value:"Steps to install ITCLIENT",id:"steps-to-install-itclient",level:2}];function d(e){const n={a:"a",admonition:"admonition",code:"code",h1:"h1",h2:"h2",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,i.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h1,{id:"sas-94-remote---iom-connection-profile",children:"SAS 9.4 (remote - IOM) Connection Profile"}),"\n",(0,t.jsx)(n.p,{children:"To use a SAS 9.4 (remote \u2013 IOM) connection type, you need to have SAS Integration Technologies Client for Windows (ITCLIENT) installed on the client machine (the same machine VS Code is installed on)."}),"\n",(0,t.jsx)(n.p,{children:'You can check the SASHOME location on your client machine to see if you already have ITCLIENT installed. For example, ITCLIENT is normally installed in the default path "C:\\Program Files\\SASHome\\x86\\Integration Technologies". If that path exists on your machine, you have ITCLIENT. ITCLIENT is automatically installed with some SAS software, such as SAS Enterprise Guide and SAS Add-in for Microsoft Office, so if you have one of those on your machine, you likely already have ITCLIENT as well.'}),"\n",(0,t.jsxs)(n.p,{children:["If you do not already have ITCLIENT installed on the client machine, follow the ",(0,t.jsx)(n.a,{href:"#steps-to-install-itclient",children:"steps"}),"."]}),"\n",(0,t.jsx)(n.admonition,{type:"note",children:(0,t.jsx)(n.p,{children:"If you are using a SAS 9.4 (remote - IOM) connection profile, you can use SAS Grid Manager to balance your workload across multiple servers."})}),"\n",(0,t.jsx)(n.h2,{id:"profile-anatomy",children:"Profile Anatomy"}),"\n",(0,t.jsx)(n.p,{children:"A SAS 9.4 (remote \u2013 IOM) connection profile includes the following parameters:"}),"\n",(0,t.jsx)(n.p,{children:(0,t.jsx)(n.code,{children:'"connectionType": "iom"'})}),"\n",(0,t.jsxs)(n.table,{children:[(0,t.jsx)(n.thead,{children:(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.th,{children:"Name"}),(0,t.jsx)(n.th,{children:"Description"}),(0,t.jsx)(n.th,{children:"Additional Notes"})]})}),(0,t.jsxs)(n.tbody,{children:[(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"host"})}),(0,t.jsx)(n.td,{children:"IOM Server Host"}),(0,t.jsx)(n.td,{children:"Appears when hovering over the status bar."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"username"})}),(0,t.jsx)(n.td,{children:"IOM Server Username"}),(0,t.jsx)(n.td,{children:"The username to establish the IOM connection to the server."})]}),(0,t.jsxs)(n.tr,{children:[(0,t.jsx)(n.td,{children:(0,t.jsx)(n.code,{children:"port"})}),(0,t.jsx)(n.td,{children:"IOM Server Port"}),(0,t.jsx)(n.td,{children:"The port of the IOM server. Default value is 8591."})]})]})]}),"\n",(0,t.jsx)(n.h2,{id:"steps-to-install-itclient",children:"Steps to install ITCLIENT"}),"\n",(0,t.jsxs)(n.p,{children:['You can install ITCLIENT by running your SAS 9.4 installer and making sure "Integration Technologies Client" is checked, or by visiting the following ',(0,t.jsx)(n.a,{href:"https://support.sas.com/downloads/browse.htm?fil=&cat=56",children:"link"})," to download and install it on the client machine. See the note below for guidance on which version to download and install."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"Note"}),": If you have no existing SAS software on the client machine, download and install the latest (currently 9.4M8) version of ITCLIENT from the link above. If you have SAS software already installed on the client machine, make sure to download and install the matching version of ITCLIENT. For example, if you already have SAS 9.4M6 on the client machine (a 9.4M6 SASHOME directory), download and install the 9.4M6 version of ITCLIENT from the link above."]}),"\n",(0,t.jsx)(n.p,{children:"ITCLIENT is backwards compatible, so any version of ITCLIENT will allow you to connect to the same or earlier version V9 SAS server. For example, if you have 9.4M8 ITCLIENT, you will be able to connect to SAS 9.4M8, 9.4M7, 9.4M6, or earlier SAS 9.4 servers. If you have 9.4M7 ITCLIENT, you will be able to connect to SAS 9.4M7, 9.4M6, or earlier SAS 9.4 servers."})]})}function h(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},8453:(e,n,o)=>{o.d(n,{R:()=>r,x:()=>a});var t=o(6540);const i={},s=t.createContext(i);function r(e){const n=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function a(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),t.createElement(s.Provider,{value:n},e.children)}}}]);