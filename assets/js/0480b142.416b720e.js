"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[8070],{8614:(e,t,o)=>{o.r(t),o.d(t,{assets:()=>l,contentTitle:()=>i,default:()=>h,frontMatter:()=>r,metadata:()=>c,toc:()=>d});var s=o(4848),n=o(8453);const r={},i="Frequently Asked Questions",c={id:"faq",title:"Frequently Asked Questions",description:"Usage questions",source:"@site/docs/faq.md",sourceDirName:".",slug:"/faq",permalink:"/vscode-sas-extension/faq",draft:!1,unlisted:!1,editUrl:"https://github.com/sassoftware/vscode-sas-extension/tree/main/website/docs/faq.md",tags:[],version:"current",frontMatter:{},sidebar:"defaultSidebar",previous:{title:"SAS Notebook",permalink:"/vscode-sas-extension/Features/sasNotebook"}},l={},d=[{value:"Usage questions",id:"usage-questions",level:2},{value:"I don&#39;t see correct syntax colors on SAS code",id:"i-dont-see-correct-syntax-colors-on-sas-code",level:3},{value:"I don&#39;t see error/note colors on SAS log",id:"i-dont-see-errornote-colors-on-sas-log",level:3},{value:"Is there a way to change the default shortcuts to run SAS code?",id:"is-there-a-way-to-change-the-default-shortcuts-to-run-sas-code",level:3},{value:"The autocomplete pops up too aggressively",id:"the-autocomplete-pops-up-too-aggressively",level:3},{value:"I can&#39;t see word-based suggestions after enabling this extension",id:"i-cant-see-word-based-suggestions-after-enabling-this-extension",level:3},{value:"It took so long to run at first time",id:"it-took-so-long-to-run-at-first-time",level:3},{value:"Connection issues",id:"connection-issues",level:2},{value:"How to get client ID/Secret?",id:"how-to-get-client-idsecret",level:3},{value:"I got <code>unable to verify the first certificate</code> error when run",id:"i-got-unable-to-verify-the-first-certificate-error-when-run",level:3},{value:"I got <code>Invalid endpoint</code> error",id:"i-got-invalid-endpoint-error",level:3},{value:"I got <code>Unable to parse decrypted password</code> error",id:"i-got-unable-to-parse-decrypted-password-error",level:3},{value:"I got <code>See console log for more details</code> error. Where to see the console log?",id:"i-got-see-console-log-for-more-details-error-where-to-see-the-console-log",level:3},{value:"I keep getting blank errors",id:"i-keep-getting-blank-errors",level:3}];function a(e){const t={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",ul:"ul",...(0,n.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(t.h1,{id:"frequently-asked-questions",children:"Frequently Asked Questions"}),"\n",(0,s.jsx)(t.h2,{id:"usage-questions",children:"Usage questions"}),"\n",(0,s.jsx)(t.h3,{id:"i-dont-see-correct-syntax-colors-on-sas-code",children:"I don't see correct syntax colors on SAS code"}),"\n",(0,s.jsxs)(t.p,{children:["Select ",(0,s.jsx)(t.code,{children:"File > Preferences > Color Theme"})," and select a SAS provided theme."]}),"\n",(0,s.jsx)(t.h3,{id:"i-dont-see-errornote-colors-on-sas-log",children:"I don't see error/note colors on SAS log"}),"\n",(0,s.jsxs)(t.p,{children:["Select ",(0,s.jsx)(t.code,{children:"File > Preferences > Color Theme"})," and select a SAS provided theme."]}),"\n",(0,s.jsx)(t.h3,{id:"is-there-a-way-to-change-the-default-shortcuts-to-run-sas-code",children:"Is there a way to change the default shortcuts to run SAS code?"}),"\n",(0,s.jsxs)(t.p,{children:['To manage shortcuts in VS Code, Click the "Manage" button from the left bottom and select ',(0,s.jsx)(t.code,{children:"Keyboard Shortcuts"}),'. Type "run sas" or so to filter and you\'ll see ',(0,s.jsx)(t.code,{children:"SAS: Run Selected or All SAS code"})," command and you can define shortcuts to it."]}),"\n",(0,s.jsx)(t.h3,{id:"the-autocomplete-pops-up-too-aggressively",children:"The autocomplete pops up too aggressively"}),"\n",(0,s.jsx)(t.p,{children:'To prevent the autocomplete from popping up on pressing spacebar, uncheck the "Suggest On Trigger Characters" option in settings. Then the autocomplete will only show when you type matched text or press Ctrl+spacebar.'}),"\n",(0,s.jsx)(t.p,{children:'Set the "Accept Suggestion On Enter" option to false in settings. Then only Tab key will commit suggestions.'}),"\n",(0,s.jsxs)(t.p,{children:["Also note that all settings can be set specific to sas to not impact other languages.\nRefers to ",(0,s.jsx)(t.a,{href:"https://code.visualstudio.com/docs/getstarted/settings#_language-specific-editor-settings",children:"https://code.visualstudio.com/docs/getstarted/settings#_language-specific-editor-settings"})]}),"\n",(0,s.jsx)(t.h3,{id:"i-cant-see-word-based-suggestions-after-enabling-this-extension",children:"I can't see word-based suggestions after enabling this extension"}),"\n",(0,s.jsxs)(t.p,{children:["VS Code provides a default autocomplete that suggests existing words gathered in opened documents when there's no other autocomplete provider. But when an extension provided some autocomplete items, the default autocomplete will not show up. It's not specific to SAS. Refers to ",(0,s.jsx)(t.a,{href:"https://github.com/microsoft/vscode/issues/21611",children:"https://github.com/microsoft/vscode/issues/21611"})]}),"\n",(0,s.jsx)(t.h3,{id:"it-took-so-long-to-run-at-first-time",children:"It took so long to run at first time"}),"\n",(0,s.jsx)(t.p,{children:"A new session must be created the first time you run SAS code. Connection time will vary depending on the server connection. Subsequent runs within the session should be quicker."}),"\n",(0,s.jsx)(t.h2,{id:"connection-issues",children:"Connection issues"}),"\n",(0,s.jsx)(t.h3,{id:"how-to-get-client-idsecret",children:"How to get client ID/Secret?"}),"\n",(0,s.jsxs)(t.p,{children:["SAS administrator can refers to this ",(0,s.jsx)(t.a,{href:"https://go.documentation.sas.com/doc/en/sasadmincdc/v_022/calauthmdl/n1iyx40th7exrqn1ej8t12gfhm88.htm#n0brttsp1nuzzkn1njvr535txk86",children:"documentation"})," for how to generate client IDs."]}),"\n",(0,s.jsxs)(t.p,{children:["The client ID needs ",(0,s.jsx)(t.code,{children:"authorization_code"})," grant type. If you want it to automatically refresh access token, it also need ",(0,s.jsx)(t.code,{children:"refresh_token"})," grant type."]}),"\n",(0,s.jsxs)(t.h3,{id:"i-got-unable-to-verify-the-first-certificate-error-when-run",children:["I got ",(0,s.jsx)(t.code,{children:"unable to verify the first certificate"})," error when run"]}),"\n",(0,s.jsx)(t.p,{children:"You'll have to manually trust your server's certificate, with below steps:"}),"\n",(0,s.jsxs)(t.ol,{children:["\n",(0,s.jsxs)(t.li,{children:["\n",(0,s.jsx)(t.p,{children:"Get your server's certificate file"}),"\n",(0,s.jsx)(t.p,{children:"1.1. Access your Viya endpoint with Google Chrome or Microsoft Edge"}),"\n",(0,s.jsx)(t.p,{children:'1.2. Click the "lock" icon on the left of the URL on the address bar. It will popup a panel.'}),"\n",(0,s.jsx)(t.p,{children:'1.3. Click "Connection is secure", then click "Certificate is valid". It will open Certificate Viewer.'}),"\n",(0,s.jsx)(t.p,{children:'1.4. Click "Details", then click "Export". Select "Base64-encoded ASCII, certificate chain" and save it to a file.'}),"\n"]}),"\n",(0,s.jsxs)(t.li,{children:["\n",(0,s.jsxs)(t.p,{children:["For Mac OS, you can install the certificate file into your Keychain Access and trust the certificate. For other Operating Systems or if you don't want to add the certificate to your system, open VS Code Settings > ",(0,s.jsx)(t.code,{children:"SAS: User Provided Certificates"}),". Add full path of the certificate file to it."]}),"\n"]}),"\n",(0,s.jsxs)(t.li,{children:["\n",(0,s.jsx)(t.p,{children:"Restart VS Code."}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(t.p,{children:"If it doesn't work, here's a workaround:"}),"\n",(0,s.jsxs)(t.ol,{children:["\n",(0,s.jsxs)(t.li,{children:["Set environment variable ",(0,s.jsx)(t.a,{href:"https://nodejs.org/api/cli.html#node_tls_reject_unauthorizedvalue",children:"NODE_TLS_REJECT_UNAUTHORIZED"})," to 0 (This will bypass the certificate check)."]}),"\n",(0,s.jsxs)(t.li,{children:["Shut down all VS Code instances and restart to pick up the environment variable. If you're connecting to a remote workspace, please set the environment variable on the remote system and kill all vscode server processes (for example, run ",(0,s.jsx)(t.code,{children:"ps -aux | grep vscode-server"})," on the remote Linux to see the processes)."]}),"\n"]}),"\n",(0,s.jsxs)(t.h3,{id:"i-got-invalid-endpoint-error",children:["I got ",(0,s.jsx)(t.code,{children:"Invalid endpoint"})," error"]}),"\n",(0,s.jsxs)(t.p,{children:["Please specify the correct protocol. For example, if your Viya server is on https, make sure you included ",(0,s.jsx)(t.code,{children:"https://"})," in your ",(0,s.jsx)(t.code,{children:"endpoint"})," setting."]}),"\n",(0,s.jsxs)(t.h3,{id:"i-got-unable-to-parse-decrypted-password-error",children:["I got ",(0,s.jsx)(t.code,{children:"Unable to parse decrypted password"})," error"]}),"\n",(0,s.jsxs)(t.ul,{children:["\n",(0,s.jsxs)(t.li,{children:["\n",(0,s.jsxs)(t.p,{children:["For Windows, open ",(0,s.jsx)(t.code,{children:"Control Panel\\All Control Panel Items\\Credential Manager"}),", click ",(0,s.jsx)(t.code,{children:"Windows Credentials"}),", find items start with ",(0,s.jsx)(t.code,{children:"vscodesas"}),", click ",(0,s.jsx)(t.code,{children:"Remove"}),"."]}),"\n"]}),"\n",(0,s.jsxs)(t.li,{children:["\n",(0,s.jsxs)(t.p,{children:["For Mac OS, open ",(0,s.jsx)(t.code,{children:"Keychain Access"}),", select ",(0,s.jsx)(t.code,{children:"login"})," keychain, select ",(0,s.jsx)(t.code,{children:"Passwords"}),", find items start with ",(0,s.jsx)(t.code,{children:"vscodesas"}),", open context menu and select ",(0,s.jsx)(t.code,{children:"Delete"}),"."]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(t.p,{children:"Then restart VS Code"}),"\n",(0,s.jsxs)(t.h3,{id:"i-got-see-console-log-for-more-details-error-where-to-see-the-console-log",children:["I got ",(0,s.jsx)(t.code,{children:"See console log for more details"})," error. Where to see the console log?"]}),"\n",(0,s.jsxs)(t.p,{children:["Click ",(0,s.jsx)(t.code,{children:"Help > Toggle Developer Tools"})," from the top menu bar."]}),"\n",(0,s.jsx)(t.h3,{id:"i-keep-getting-blank-errors",children:"I keep getting blank errors"}),"\n",(0,s.jsx)(t.p,{children:"Please try restart your VS Code."})]})}function h(e={}){const{wrapper:t}={...(0,n.R)(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(a,{...e})}):a(e)}},8453:(e,t,o)=>{o.d(t,{R:()=>i,x:()=>c});var s=o(6540);const n={},r=s.createContext(n);function i(e){const t=s.useContext(r);return s.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(n):e.components||n:i(e.components),s.createElement(r.Provider,{value:t},e.children)}}}]);