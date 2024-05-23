"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[7693],{6663:(e,n,M)=>{M.r(n),M.d(n,{assets:()=>L,contentTitle:()=>o,default:()=>r,frontMatter:()=>t,metadata:()=>u,toc:()=>c});var i=M(4848),s=M(8453);const t={},o="Running SAS Code",u={id:"Features/running",title:"Running SAS Code",description:"After you configure the SAS extension for your SAS environment, you can run your SAS program and view the log and results. The steps to connect to SAS and run your program are different for SAS Viya and SAS 9.",source:"@site/docs/Features/running.md",sourceDirName:"Features",slug:"/Features/running",permalink:"/vscode-sas-extension/Features/running",draft:!1,unlisted:!1,editUrl:"https://github.com/sassoftware/vscode-sas-extension/tree/main/website/docs/Features/running.md",tags:[],version:"current",frontMatter:{},sidebar:"defaultSidebar",previous:{title:"SAS Code Editing Features",permalink:"/vscode-sas-extension/Features/sasCodeEditing"},next:{title:"Running SAS Code by Task",permalink:"/vscode-sas-extension/Features/runningTask"}},L={},c=[{value:"SAS Viya",id:"sas-viya",level:2},{value:"SAS 9.4",id:"sas-94",level:2},{value:"Additional notes",id:"additional-notes",level:2}];function j(e){const n={admonition:"admonition",code:"code",h1:"h1",h2:"h2",img:"img",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h1,{id:"running-sas-code",children:"Running SAS Code"}),"\n",(0,i.jsx)(n.p,{children:"After you configure the SAS extension for your SAS environment, you can run your SAS program and view the log and results. The steps to connect to SAS and run your program are different for SAS Viya and SAS 9."}),"\n",(0,i.jsx)(n.h2,{id:"sas-viya",children:"SAS Viya"}),"\n",(0,i.jsx)(n.p,{children:"To run a SAS program with a SAS Viya connection:"}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:["Click the ",(0,i.jsx)(n.img,{alt:"running person",src:M(4467).A+"#gh-light-mode-only",width:"16",height:"16"}),(0,i.jsx)(n.img,{alt:"running person",src:M(3251).A+"#gh-dark-mode-only",width:"16",height:"16"})," icon in the upper right corner of your SAS program window."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsx)(n.p,{children:"For a secure connection to SAS Viya, you must connect with an authorization code:"}),"\n",(0,i.jsx)(n.p,{children:"2.1. If VS Code prompts you to sign in using SAS, click 'Allow'."}),"\n",(0,i.jsx)(n.p,{children:"2.2. If VS Code prompts you to open an external website, click 'Open'. A new browser window opens so that you can log on to SAS."}),"\n",(0,i.jsx)(n.p,{children:"2.3. Log on with your SAS credentials."}),"\n",(0,i.jsx)(n.p,{children:"2.4. SAS returns an authorization code. Copy this code."}),"\n",(0,i.jsx)(n.p,{children:"2.5. Paste the authorization code in the authorization box at the top of the VS Code application."}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsx)(n.p,{children:"VS Code connects to SAS and runs the code."}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsx)(n.p,{children:"The results are displayed in the application."}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsx)(n.p,{children:"The SAS output log and error information are displayed in the application."}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(n.p,{children:(0,i.jsx)(n.img,{alt:"runCode2",src:M(9634).A+"",width:"1920",height:"1040"})}),"\n",(0,i.jsx)(n.admonition,{type:"info",children:(0,i.jsxs)(n.p,{children:["Your sign in status will persist in VS Code. You can view it and sign out from VS Code's ",(0,i.jsx)(n.code,{children:"Accounts"})," menu."]})}),"\n",(0,i.jsx)(n.h2,{id:"sas-94",children:"SAS 9.4"}),"\n",(0,i.jsxs)(n.ol,{children:["\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsxs)(n.p,{children:["Click the ",(0,i.jsx)(n.img,{alt:"running person",src:M(4467).A+"#gh-light-mode-only",width:"16",height:"16"}),(0,i.jsx)(n.img,{alt:"running person",src:M(3251).A+"#gh-dark-mode-only",width:"16",height:"16"})," icon in the upper right corner of your SAS program window."]}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsx)(n.p,{children:"VS Code connects to SAS and runs the code."}),"\n"]}),"\n",(0,i.jsxs)(n.li,{children:["\n",(0,i.jsx)(n.p,{children:"The results, log, and error status are displayed in the application."}),"\n"]}),"\n"]}),"\n",(0,i.jsx)(n.h2,{id:"additional-notes",children:"Additional notes"}),"\n",(0,i.jsx)(n.p,{children:"To run a selection of SAS code:"}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsxs)(n.li,{children:["The ",(0,i.jsx)(n.code,{children:"Run Selected or All SAS Code"})," command (",(0,i.jsx)(n.code,{children:"F3"}),") will automatically run selected code when you have selected lines of code in a program. If you have not selected any lines of code, SAS runs the entire program."]}),"\n",(0,i.jsxs)(n.li,{children:["If you have selected multiple sections of code, the ",(0,i.jsx)(n.code,{children:"Run Selected or All SAS Code"})," command combines the code from the selections in the order in which they were selected, and then submits the combined code."]}),"\n",(0,i.jsxs)(n.li,{children:["The ",(0,i.jsx)(n.code,{children:"Run All SAS Code"})," command (",(0,i.jsx)(n.code,{children:"F8"}),") always runs the entire program."]}),"\n"]}),"\n",(0,i.jsxs)(n.p,{children:[(0,i.jsx)(n.strong,{children:"Notes"}),":"]}),"\n",(0,i.jsxs)(n.ul,{children:["\n",(0,i.jsx)(n.li,{children:"A new session must be created the first time you run SAS code. Connection time will vary depending on the server connection."}),"\n",(0,i.jsxs)(n.li,{children:["Currently, only HTML output is supported. By default, the ODS HTML5 statement is added to the submitted code. Clear the ",(0,i.jsx)(n.code,{children:"Enable/disable ODS HTML5 output"})," option in the Settings editor for the SAS extension to disable this output."]}),"\n",(0,i.jsxs)(n.li,{children:["When you click ",(0,i.jsx)(n.code,{children:"Run"}),", the code in the active tab in the editor is submitted. Make sure that the correct tab is active when you run your program."]}),"\n",(0,i.jsxs)(n.li,{children:["To reset your connection to SAS, run the ",(0,i.jsx)(n.code,{children:"Close Current Session"})," command in VS Code or click the ",(0,i.jsx)(n.code,{children:"Close Session"})," button from the tooltip of the active profile status bar item."]}),"\n"]})]})}function r(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,i.jsx)(n,{...e,children:(0,i.jsx)(j,{...e})}):j(e)}},3251:(e,n,M)=>{M.d(n,{A:()=>i});const i="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjMuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IlN1Ym1pdFNBU0NvZGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIKCSB5PSIwcHgiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTYgMTYiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBpZD0iVlNfQkciIGZpbGw9IiNjNWM1YzUiIGQ9Ik05Ljc0Miw2LjUwOEw4LjM2OCw3Ljg4MkM5LjU3OSw3Ljg3MywxMC43ODUsOC4xLDExLjY2OSw4LjY3YzAuMzA1LDAuMTk3LDAuNDE1LDAuNTcyLDAuMjYzLDAuODkyCgljLTAuNTc4LDEuMjA4LTEuMjM0LDIuMDcyLTEuNzE1LDIuNjA5bDAuODk5LDAuNDg0YzAuMTc1LDAuMDk0LDAuMzAyLDAuMjQ5LDAuMzU2LDAuNDM1YzAuMDU0LDAuMTg1LDAuMDI5LDAuMzc4LTAuMDcsMC41NDQKCUMxMS4yNywxMy44NiwxMS4wMTgsMTQsMTAuNzQ3LDE0Yy0wLjEyOCwwLTAuMjU1LTAuMDMzLTAuMzY4LTAuMDk0bC0xLjc0OC0wLjk0Yy0wLjIxNi0wLjExNi0wLjM1OC0wLjMyNS0wLjM4MS0wLjU2MgoJYy0wLjAyMS0wLjIzOCwwLjA4MS0wLjQ2OCwwLjI3MS0wLjYxOGMwLjA5NC0wLjA3NywwLjkzLTAuNzksMS43MjQtMi4yMDZDOS4yMTMsOS4yMTcsNy44MjcsOS4yNjIsNi43MTMsOS41MWwtMS42NzYsMi4yMQoJQzQuOTAyLDExLjg5OCw0LjY5NSwxMiw0LjQ3LDEyYy0wLjEzNCwwLTAuMjY2LTAuMDM4LTAuMzc5LTAuMTA5bC0yLjA2MS0xLjI5N2wtMC43NzUsMC45MjJjLTAuMjUxLDAuMjk1LTAuNjk3LDAuMzM2LTAuOTk4LDAuMDkKCWMtMC4xNDctMC4xMjEtMC4yMzctMC4yOTEtMC4yNTMtMC40NzljLTAuMDE3LTAuMTg3LDAuMDQxLTAuMzY5LDAuMTYyLTAuNTEzTDEuMzQsOS4yMThjMC4yMjktMC4yNywwLjYyNi0wLjMyOSwwLjkyNS0wLjE0MwoJbDIuMDMzLDEuMjhsMC42ODctMC45MDdMNy4yMzIsNC41OEM2LjI0Myw0LjE0Niw1LjA3MSw0LjMzMSwzLjE1MSw2LjA4OUMzLjAxMyw2LjIxNCwyLjgyOSw2LjI4NCwyLjY0OCw2LjI2NwoJQzIuNDY0LDYuMjU1LDIuMjk2LDYuMTcsMi4xNzQsNi4wMjdDMi4wNTIsNS44ODMsMS45OSw1LjcsMi4wMDEsNS41MDhjMC4wMTItMC4xOSwwLjA5NC0wLjM2NiwwLjIzMy0wLjQ5MwoJYzMuNjc4LTMuMzY3LDUuNjcxLTEuOTMzLDcuMTY1LTAuNjU1YzEuMTk5LDEuMDIyLDEuNzg4LDEuNzg5LDMuNDc1LDAuMzkzYzAuMjk4LTAuMjQ0LDAuNzM1LTAuMTk2LDAuOTc0LDAuMTEyCgljMC4xMTUsMC4xNDksMC4xNjcsMC4zMzYsMC4xNDgsMC41MjdjLTAuMDIxLDAuMTktMC4xMTIsMC4zNjEtMC4yNTYsMC40OEMxMi44MjQsNi42MzEsMTEuOTc5LDcsMTEuMTYsNwoJQzEwLjYwNSw3LDEwLjE1LDYuNzkzLDkuNzQyLDYuNTA4eiBNMTAuNSw0QzExLjMyOSw0LDEyLDMuMTA0LDEyLDJzLTAuNjcxLTItMS41LTJDOS42NzEsMCw5LDAuODk2LDksMlM5LjY3MSw0LDEwLjUsNHoiLz4KPC9zdmc+Cg=="},4467:(e,n,M)=>{M.d(n,{A:()=>i});const i="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjMuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IlN1Ym1pdFNBU0NvZGUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIKCSB5PSIwcHgiIHdpZHRoPSIxNnB4IiBoZWlnaHQ9IjE2cHgiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTYgMTYiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBpZD0iVlNfQkciIGZpbGw9IiM0MjQyNDIiIGQ9Ik05Ljc0Miw2LjUwOEw4LjM2OCw3Ljg4MkM5LjU3OSw3Ljg3MywxMC43ODUsOC4xLDExLjY2OSw4LjY3YzAuMzA1LDAuMTk3LDAuNDE1LDAuNTcyLDAuMjYzLDAuODkyCgljLTAuNTc4LDEuMjA4LTEuMjM0LDIuMDcyLTEuNzE1LDIuNjA5bDAuODk5LDAuNDg0YzAuMTc1LDAuMDk0LDAuMzAyLDAuMjQ5LDAuMzU2LDAuNDM1YzAuMDU0LDAuMTg1LDAuMDI5LDAuMzc4LTAuMDcsMC41NDQKCUMxMS4yNywxMy44NiwxMS4wMTgsMTQsMTAuNzQ3LDE0Yy0wLjEyOCwwLTAuMjU1LTAuMDMzLTAuMzY4LTAuMDk0bC0xLjc0OC0wLjk0Yy0wLjIxNi0wLjExNi0wLjM1OC0wLjMyNS0wLjM4MS0wLjU2MgoJYy0wLjAyMS0wLjIzOCwwLjA4MS0wLjQ2OCwwLjI3MS0wLjYxOGMwLjA5NC0wLjA3NywwLjkzLTAuNzksMS43MjQtMi4yMDZDOS4yMTMsOS4yMTcsNy44MjcsOS4yNjIsNi43MTMsOS41MWwtMS42NzYsMi4yMQoJQzQuOTAyLDExLjg5OCw0LjY5NSwxMiw0LjQ3LDEyYy0wLjEzNCwwLTAuMjY2LTAuMDM4LTAuMzc5LTAuMTA5bC0yLjA2MS0xLjI5N2wtMC43NzUsMC45MjJjLTAuMjUxLDAuMjk1LTAuNjk3LDAuMzM2LTAuOTk4LDAuMDkKCWMtMC4xNDctMC4xMjEtMC4yMzctMC4yOTEtMC4yNTMtMC40NzljLTAuMDE3LTAuMTg3LDAuMDQxLTAuMzY5LDAuMTYyLTAuNTEzTDEuMzQsOS4yMThjMC4yMjktMC4yNywwLjYyNi0wLjMyOSwwLjkyNS0wLjE0MwoJbDIuMDMzLDEuMjhsMC42ODctMC45MDdMNy4yMzIsNC41OEM2LjI0Myw0LjE0Niw1LjA3MSw0LjMzMSwzLjE1MSw2LjA4OUMzLjAxMyw2LjIxNCwyLjgyOSw2LjI4NCwyLjY0OCw2LjI2NwoJQzIuNDY0LDYuMjU1LDIuMjk2LDYuMTcsMi4xNzQsNi4wMjdDMi4wNTIsNS44ODMsMS45OSw1LjcsMi4wMDEsNS41MDhjMC4wMTItMC4xOSwwLjA5NC0wLjM2NiwwLjIzMy0wLjQ5MwoJYzMuNjc4LTMuMzY3LDUuNjcxLTEuOTMzLDcuMTY1LTAuNjU1YzEuMTk5LDEuMDIyLDEuNzg4LDEuNzg5LDMuNDc1LDAuMzkzYzAuMjk4LTAuMjQ0LDAuNzM1LTAuMTk2LDAuOTc0LDAuMTEyCgljMC4xMTUsMC4xNDksMC4xNjcsMC4zMzYsMC4xNDgsMC41MjdjLTAuMDIxLDAuMTktMC4xMTIsMC4zNjEtMC4yNTYsMC40OEMxMi44MjQsNi42MzEsMTEuOTc5LDcsMTEuMTYsNwoJQzEwLjYwNSw3LDEwLjE1LDYuNzkzLDkuNzQyLDYuNTA4eiBNMTAuNSw0QzExLjMyOSw0LDEyLDMuMTA0LDEyLDJzLTAuNjcxLTItMS41LTJDOS42NzEsMCw5LDAuODk2LDksMlM5LjY3MSw0LDEwLjUsNHoiLz4KPC9zdmc+Cg=="},9634:(e,n,M)=>{M.d(n,{A:()=>i});const i=M.p+"assets/images/runCode2-a240da2956ea35c7d66839721abb0dbb.png"},8453:(e,n,M)=>{M.d(n,{R:()=>o,x:()=>u});var i=M(6540);const s={},t=i.createContext(s);function o(e){const n=i.useContext(t);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function u(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),i.createElement(t.Provider,{value:n},e.children)}}}]);