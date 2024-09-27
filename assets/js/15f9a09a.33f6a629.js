"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[2679],{1448:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>l,contentTitle:()=>r,default:()=>h,frontMatter:()=>o,metadata:()=>c,toc:()=>d});var s=t(4848),i=t(8453);const o={},r="SAS Log",c={id:"Configurations/sasLog",title:"SAS Log",description:"You can customize when the SAS log is displayed in the bottom panel by using the following extension settings. These settings apply to all connection profiles:",source:"@site/docs/Configurations/sasLog.md",sourceDirName:"Configurations",slug:"/Configurations/sasLog",permalink:"/vscode-sas-extension/Configurations/sasLog",draft:!1,unlisted:!1,editUrl:"https://github.com/sassoftware/vscode-sas-extension/tree/main/website/docs/Configurations/sasLog.md",tags:[],version:"current",frontMatter:{},sidebar:"defaultSidebar",previous:{title:"Additional Profile Settings",permalink:"/vscode-sas-extension/Configurations/Profiles/additional"},next:{title:"Features",permalink:"/vscode-sas-extension/Features/"}},l={},d=[];function a(e){const n={admonition:"admonition",code:"code",h1:"h1",header:"header",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"sas-log",children:"SAS Log"})}),"\n",(0,s.jsx)(n.p,{children:"You can customize when the SAS log is displayed in the bottom panel by using the following extension settings. These settings apply to all connection profiles:"}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"Name"}),(0,s.jsx)(n.th,{children:"Description"}),(0,s.jsx)(n.th,{children:"Additional Notes"})]})}),(0,s.jsxs)(n.tbody,{children:[(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"SAS.log.showOnExecutionStart"})}),(0,s.jsx)(n.td,{children:"Show SAS log on start of execution"}),(0,s.jsxs)(n.td,{children:["default: ",(0,s.jsx)(n.code,{children:"true"})]})]}),(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:(0,s.jsx)(n.code,{children:"SAS.log.showOnExecutionFinish"})}),(0,s.jsx)(n.td,{children:"Show SAS log on end of execution"}),(0,s.jsxs)(n.td,{children:["default: ",(0,s.jsx)(n.code,{children:"true"})]})]})]})]}),"\n",(0,s.jsxs)(n.p,{children:["To access the SAS settings, select ",(0,s.jsx)(n.code,{children:"File > Preferences > Settings"}),'. Search for "sas" and then click SAS in the search results to view the SAS extension settings. You can edit the settings directly in the ',(0,s.jsx)(n.code,{children:"settings.json"})," file by clicking ",(0,s.jsx)(n.code,{children:"Edit in settings.json"}),"."]}),"\n",(0,s.jsx)(n.p,{children:"Example"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-json",metastring:'title="settings.json"',children:'{\n  "SAS.log.showOnExecutionFinish": true,\n  "SAS.log.showOnExecutionStart": false,\n  "SAS.connectionProfiles": {\n    "activeProfile": "viyaServer",\n    "profiles": {\n      "viya4": {\n        "endpoint": "https://example-endpoint.com",\n        "connectionType": "rest",\n        "sasOptions": ["NONEWS", "ECHOAUTO"],\n        "autoExec": [\n          {\n            "type": "line",\n            "line": "ods graphics / imagemap;"\n          },\n          {\n            "type": "file",\n            "filePath": "/my/local/autoexec.sas"\n          }\n        ]\n      }\n    }\n  }\n}\n'})}),"\n",(0,s.jsx)(n.admonition,{type:"tip",children:(0,s.jsxs)(n.p,{children:["To view the SAS log as a text file, click the ",(0,s.jsx)(n.code,{children:"..."})," icon on the top right of the OUTPUT panel, and select ",(0,s.jsx)(n.code,{children:"Open Output in Editor"}),"."]})})]})}function h(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(a,{...e})}):a(e)}},8453:(e,n,t)=>{t.d(n,{R:()=>r,x:()=>c});var s=t(6540);const i={},o=s.createContext(i);function r(e){const n=s.useContext(o);return s.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:r(e.components),s.createElement(o.Provider,{value:n},e.children)}}}]);