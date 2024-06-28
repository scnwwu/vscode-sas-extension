"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[2138],{1035:(e,t,r)=>{r.r(t),r.d(t,{default:()=>$});var s=r(6540),a=r(4586),n=r(2415),c=r(5260),l=r(8774),o=r(1312);const u=["zero","one","two","few","many","other"];function h(e){return u.filter((t=>e.includes(t)))}const i={locale:"en",pluralForms:h(["one","other"]),select:e=>1===e?"one":"other"};function m(){const{i18n:{currentLocale:e}}=(0,a.A)();return(0,s.useMemo)((()=>{try{return function(e){const t=new Intl.PluralRules(e);return{locale:e,pluralForms:h(t.resolvedOptions().pluralCategories),select:e=>t.select(e)}}(e)}catch(t){return console.error(`Failed to use Intl.PluralRules for locale "${e}".\nDocusaurus will fallback to the default (English) implementation.\nError: ${t.message}\n`),i}}),[e])}function d(){const e=m();return{selectMessage:(t,r)=>function(e,t,r){const s=e.split("|");if(1===s.length)return s[0];s.length>r.pluralForms.length&&console.error(`For locale=${r.locale}, a maximum of ${r.pluralForms.length} plural forms are expected (${r.pluralForms.join(",")}), but the message contains ${s.length}: ${e}`);const a=r.select(t),n=r.pluralForms.indexOf(a);return s[Math.min(n,s.length-1)]}(r,t,e)}}var p=r(5391),g=r(6347),x=r(2303),f=r(1088);const y=function(){const e=(0,x.A)(),t=(0,g.W6)(),r=(0,g.zy)(),{siteConfig:{baseUrl:s}}=(0,a.A)(),n=e?new URLSearchParams(r.search):null,c=n?.get("q")||"",l=n?.get("ctx")||"",o=n?.get("version")||"",u=e=>{const t=new URLSearchParams(r.search);return e?t.set("q",e):t.delete("q"),t};return{searchValue:c,searchContext:l&&Array.isArray(f.Hg)&&f.Hg.some((e=>"string"==typeof e?e===l:e.path===l))?l:"",searchVersion:o,updateSearchPath:e=>{const r=u(e);t.replace({search:r.toString()})},updateSearchContext:e=>{const s=new URLSearchParams(r.search);s.set("ctx",e),t.replace({search:s.toString()})},generateSearchPageLink:e=>{const t=u(e);return`${s}search?${t.toString()}`}}};var C=r(5891),S=r(2384),j=r(9913),w=r(6841),A=r(3810),I=r(7674),v=r(2849),R=r(4471);const P={searchContextInput:"searchContextInput_mXoe",searchQueryInput:"searchQueryInput_CFBF",searchResultItem:"searchResultItem_U687",searchResultItemPath:"searchResultItemPath_uIbk",searchResultItemSummary:"searchResultItemSummary_oZHr",searchQueryColumn:"searchQueryColumn_q7nx",searchContextColumn:"searchContextColumn_oWAF"};var b=r(3385),F=r(4848);function T(){const{siteConfig:{baseUrl:e},i18n:{currentLocale:t}}=(0,a.A)(),{selectMessage:r}=d(),{searchValue:n,searchContext:l,searchVersion:u,updateSearchPath:h,updateSearchContext:i}=y(),[m,g]=(0,s.useState)(n),[x,j]=(0,s.useState)(),[w,A]=(0,s.useState)(),I=`${e}${u}`,R=(0,s.useMemo)((()=>m?(0,o.T)({id:"theme.SearchPage.existingResultsTitle",message:'Search results for "{query}"',description:"The search page title for non-empty query"},{query:m}):(0,o.T)({id:"theme.SearchPage.emptyResultsTitle",message:"Search the documentation",description:"The search page title for empty query"})),[m]);(0,s.useEffect)((()=>{h(m),x&&(m?x(m,(e=>{A(e)})):A(void 0))}),[m,x]);const T=(0,s.useCallback)((e=>{g(e.target.value)}),[]);return(0,s.useEffect)((()=>{n&&n!==m&&g(n)}),[n]),(0,s.useEffect)((()=>{!async function(){const{wrappedIndexes:e,zhDictionary:t}=!Array.isArray(f.Hg)||l||f.dz?await(0,C.Z)(I,l):{wrappedIndexes:[],zhDictionary:[]};j((()=>(0,S.m)(e,t,100)))}()}),[l,I]),(0,F.jsxs)(s.Fragment,{children:[(0,F.jsxs)(c.A,{children:[(0,F.jsx)("meta",{property:"robots",content:"noindex, follow"}),(0,F.jsx)("title",{children:R})]}),(0,F.jsxs)("div",{className:"container margin-vert--lg",children:[(0,F.jsx)("h1",{children:R}),(0,F.jsxs)("div",{className:"row",children:[(0,F.jsx)("div",{className:(0,p.A)("col",{[P.searchQueryColumn]:Array.isArray(f.Hg),"col--9":Array.isArray(f.Hg),"col--12":!Array.isArray(f.Hg)}),children:(0,F.jsx)("input",{type:"search",name:"q",className:P.searchQueryInput,"aria-label":"Search",onChange:T,value:m,autoComplete:"off",autoFocus:!0})}),Array.isArray(f.Hg)?(0,F.jsx)("div",{className:(0,p.A)("col","col--3","padding-left--none",P.searchContextColumn),children:(0,F.jsxs)("select",{name:"search-context",className:P.searchContextInput,id:"context-selector",value:l,onChange:e=>i(e.target.value),children:[f.dz&&(0,F.jsx)("option",{value:"",children:(0,o.T)({id:"theme.SearchPage.searchContext.everywhere",message:"Everywhere"})}),f.Hg.map((e=>{const{label:r,path:s}=(0,b.p)(e,t);return(0,F.jsx)("option",{value:s,children:r},s)}))]})}):null]}),!x&&m&&(0,F.jsx)("div",{children:(0,F.jsx)(v.A,{})}),w&&(w.length>0?(0,F.jsx)("p",{children:r(w.length,(0,o.T)({id:"theme.SearchPage.documentsFound.plurals",message:"1 document found|{count} documents found",description:'Pluralized label for "{count} documents found". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)'},{count:w.length}))}):(0,F.jsx)("p",{children:(0,o.T)({id:"theme.SearchPage.noResultsText",message:"No documents were found",description:"The paragraph for empty search result"})})),(0,F.jsx)("section",{children:w&&w.map((e=>(0,F.jsx)(_,{searchResult:e},e.document.i)))})]})]})}function _(e){let{searchResult:{document:t,type:r,page:s,tokens:a,metadata:n}}=e;const c=r===j.i.Title,o=r===j.i.Keywords,u=r===j.i.Description,h=u||o,i=c||h,m=r===j.i.Content,d=(c?t.b:s.b).slice(),p=m||h?t.s:t.t;i||d.push(s.t);let g="";if(f.CU&&a.length>0){const e=new URLSearchParams;for(const t of a)e.append("_highlight",t);g=`?${e.toString()}`}return(0,F.jsxs)("article",{className:P.searchResultItem,children:[(0,F.jsx)("h2",{children:(0,F.jsx)(l.A,{to:t.u+g+(t.h||""),dangerouslySetInnerHTML:{__html:m||h?(0,w.Z)(p,a):(0,A.C)(p,(0,I.g)(n,"t"),a,100)}})}),d.length>0&&(0,F.jsx)("p",{className:P.searchResultItemPath,children:(0,R.$)(d)}),(m||u)&&(0,F.jsx)("p",{className:P.searchResultItemSummary,dangerouslySetInnerHTML:{__html:(0,A.C)(t.t,(0,I.g)(n,"t"),a,100)}})]})}const $=function(){return(0,F.jsx)(n.A,{children:(0,F.jsx)(T,{})})}}}]);