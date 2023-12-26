import{d as S,u as L,a as A,b as B,r as q,c as d,o as T,e as m,f as y,g as t,t as g,n as u,h as $,i as j,j as N,_ as M,p as P,k as V,l as D,m as E,q as F,L as G}from"./index-52529b81.js";const O=a=>(P("data-v-d1e8aa82"),a=a(),V(),a),Z={key:0},H={class:"question lg:border rounded lg:border-gray-300 p-2 sm:p-4 mb-4 sm:mb-8 h-52 2xs:h-44 xs:h-36 lg:h-32 overflow-y-auto"},J={class:"text-base xs:text-lg font-medium py-2"},K={class:"text-sm xs:text-base flex flex-row items-stretch"},U=O(()=>t("span",{class:"bg-gray-300 rounded-sm w-2 mr-2 my-1"},null,-1)),W={class:"flex-1 text-left"},X={class:"py-4 sm:mt-4"},Y={class:"text-sm text-gray-300"},ee=["disabled"],te={class:"p-1 text-lg text-gray-700"},se={class:"text-sm text-gray-300"},oe=["disabled"],ae={class:"w-full rounded h-6 p-1 border border-gray-300"},ne=S({__name:"Quiz",props:{questions:{type:Array,required:!0}},setup(a){const r=a,x=L(),Q=A(),l=B(),o=q(0),w=q(!1),h=d(()=>o.value===0),f=d(()=>o.value+1>=r.questions.length),c=d(()=>r.questions[o.value]),n=d(()=>{var s;return!!((s=l.answers.find(e=>e.Question.id===c.value.id))!=null&&s.agreeLevel)}),v=d(()=>{var s;return n.value?(s=l.answers.find(e=>e.Question.id===c.value.id))==null?void 0:s.agreeLevel:!1}),p=d(()=>r.questions.filter(s=>s.isPrimary).length),C=d(()=>p.value>o.value);T(async()=>{const s=parseInt(Q.query.q);if(s>0&&s<=r.questions.length&&l.answers.length>=s-1){o.value=s-1;return}await _()});async function _(){await x.push({query:{q:o.value+1}})}async function I(){h.value||(o.value-=1,await _())}async function k(){if(n.value&&!f.value){o.value+=1,await _();return}f.value&&(l.completeQuiz(),await x.push({name:"Result"}))}async function b(s){if(h.value&&(l.answers=[],l.quizCompleted=!1),l.answerQuestion({id:c.value.id,position:c.value.position},s),p.value-1===o.value)return w.value=!0;await k()}async function R(s){s?await k():(l.completeQuiz(),await x.push({name:"Result"})),w.value=!1}return(s,e)=>{var z;return(z=a.questions)!=null&&z.length?(m(),y("div",Z,[t("div",H,[t("h2",J,g(c.value.title),1),t("div",K,[U,t("h3",W,g(c.value.subtitle),1)])]),(m(),y("div",{key:o.value,class:"answers flex flex-col sm:max-w-2xl m-auto"},[t("button",{class:u(["border-2 border-solid active:outline-none answer col-al5 text-white font-semibold uppercase text-sm px-6 py-1 sm:py-2.5 rounded mb-1 ease-linear transition-all duration-150",n.value&&v.value==="5"?"border-dashed border-gray-500":"border-transparent"]),type:"button",onClick:e[0]||(e[0]=i=>b("5"))}," Rozhodně souhlasím ",2),t("button",{class:u(["border-2 border-solid active:outline-none answer col-al4 text-white font-semibold uppercase text-sm px-6 py-1 sm:py-2.5 rounded mb-1 ease-linear transition-all duration-150",n.value&&v.value==="4"?"border-dashed border-gray-500":"border-transparent"]),type:"button",onClick:e[1]||(e[1]=i=>b("4"))}," Spíše souhlasím ",2),t("button",{class:u(["flex-1 border-2 border-solid active:outline-none answer col-al3 text-white font-semibold uppercase text-sm px-6 py-1 sm:py-2.5 rounded mb-1 ease-linear transition-all duration-150",n.value&&v.value==="3"?"border-dashed border-gray-500":"border-transparent"]),type:"button",onClick:e[2]||(e[2]=i=>b("3"))}," Neutrální ",2),t("button",{class:u(["border-2 border-solid active:outline-none answer col-al2 text-white font-semibold uppercase text-sm px-6 py-1 sm:py-2.5 rounded mb-1 ease-linear transition-all duration-150",n.value&&v.value==="2"?"border-dashed border-gray-500":"border-transparent"]),type:"button",onClick:e[3]||(e[3]=i=>b("2"))}," Spíše nesouhlasím ",2),t("button",{class:u(["border-2 border-solid active:outline-none answer col-al1 text-white font-semibold uppercase text-sm px-6 py-1 sm:py-2.5 rounded mb-1 ease-linear transition-all duration-150",n.value&&v.value==="1"?"border-dashed border-gray-500":"border-transparent"]),type:"button",onClick:e[4]||(e[4]=i=>b("1"))}," Rozhodně nesouhlasím ",2),t("button",{class:u(["flex-1 w-1/2 sm:w-1/3 self-end border-2 border-solid active:outline-none answer col-al0 text-white font-semibold uppercase text-sm px-6 py-1 sm:py-2.5 rounded mb-1 ease-linear transition-all duration-150",n.value&&v.value==="0"?"border-dashed border-gray-500":"border-transparent"]),type:"button",onClick:e[5]||(e[5]=i=>b("0"))}," Nevím ",2)])),t("div",X,[(m(),y("div",{key:o.value,class:"xs:p-2 grid grid-cols-3 sm:max-w-2xl mx-auto"},[t("span",Y,[t("button",{class:u(["p-1 border border-transparent active:outline-none rounded",{"hover:border-gray-400 text-gray-600":!h.value}]),disabled:h.value,onClick:I}," < předchozí ",10,ee)]),t("span",te," Otázka "+g(o.value+1)+" z "+g(C.value?p.value:a.questions.length),1),t("span",se,[f.value?$("",!0):(m(),y("button",{key:0,class:u(["p-1 border border-transparent active:outline-none rounded",{"hover:border-gray-400 text-gray-600":n.value&&!f.value}]),disabled:!n.value,onClick:k}," další > ",10,oe))])])),t("div",ae,[t("div",{class:"progress-bar rounded-sm h-full bg-gray-300",style:j({width:100/((C.value?p.value:a.questions.length)/(o.value+1))+"%"})},null,4)])]),N(M,{show:w.value,message:`Zvládnete ještě ${a.questions.length-p.value} otázek?`,text:`Můžete test ihned ukončit nebo vyplnit posledních ${a.questions.length-p.value} otázek a dostat tak přesnější výsledek.`,"button-yes":"Ano, zvládnu!","button-no":"Ne, zobrazit výsledek",onClose:e[6]||(e[6]=i=>R(i))},null,8,["show","message","text"])])):$("",!0)}}});const re=D(ne,[["__scopeId","data-v-d1e8aa82"]]),le={key:0,class:"max-w-5xl"},ie=S({__name:"Test",setup(a){const r=q([]);return(async()=>r.value=await E({url:"questions"}))(),(x,Q)=>r.value.length?(m(),y("div",le,[N(re,{questions:r.value},null,8,["questions"])])):(m(),F(G,{key:1}))}});export{ie as default};