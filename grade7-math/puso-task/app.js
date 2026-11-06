const NAMES=["Where I am","Week 5 budget","Goal check","Reflect","Review and submit"];
let TOK=null,LOCKED=false,saveT=null,ask=false,LMSG="";
try{TOK=sessionStorage.getItem("pw5")}catch(e){}
async function api(path,method,body){
const r=await fetch(API+path,{method:method||"GET",headers:Object.assign({"Content-Type":"application/json"},TOK?{Authorization:"Bearer "+TOK}:{}),body:body?JSON.stringify(body):undefined});
let j={};try{j=await r.json()}catch(e){}
if(!r.ok){const e=new Error(j.error||"Something went wrong. Please try again.");e.status=r.status;throw e}
return j}
const setSaved=t=>{const e=document.getElementById("saved");if(e)e.textContent=t};
function queueSave(){clearTimeout(saveT);setSaved("Saving…");saveT=setTimeout(doSave,800)}
async function doSave(){saveT=null;try{await api("/api/plan","PUT",{data:S});setSaved("Saved")}catch(e){if(e.status===401)signOut(true);else setSaved("Not saved yet. Check your connection.")}}
function load(j){S=Object.assign(fresh(),j.data||{});S.name=j.name;S.first=j.first;LOCKED=j.status==="submitted"}
async function signOut(expired){
if(saveT&&TOK&&!expired){clearTimeout(saveT);await doSave()}
TOK=null;try{sessionStorage.removeItem("pw5")}catch(e){}
S=fresh();LOCKED=false;ask=false;LMSG=expired===true?"Your session ended. Please sign in again.":"";render()}
function renderLogin(){document.getElementById("app").innerHTML=`<div class="band"><small>PUSO POINTS PASSPORT 2026</small><h1>My Week 5 Puso Plan</h1><p>Sign in to start or continue.</p></div>
<div class="card"><h2>Before you start</h2><p class="mut">This activity saves your name, PIN, and the money plan you enter, so your teacher can review it. Only your teacher can see it. It is used only for this Puso Points activity, and it will be deleted after grading. Do not enter anything you are not comfortable sharing with your teacher.</p>
<label class="chk"><input type="checkbox" id="cons"><span>I understand and agree. My parent or guardian knows I am doing this activity.</span></label></div>
<div class="card"><label class="f"><span>My last name</span><span class="in"><input id="ln" autocomplete="off" placeholder="Dela Cruz"></span></label>
<label class="f"><span>My first name</span><span class="in"><input id="fn" autocomplete="off" placeholder="Juan"></span></label>
<label class="f"><span>My 4-digit PIN</span><span class="in"><input id="pn" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="••••"></span></label>
<p class="mut">First time? Type your name, then choose a PIN you will remember. Next time, use the same name and PIN. Do not share your PIN.</p>
<p class="warn" id="lm">${esc(LMSG)}</p><button class="btn p" style="width:100%" onclick="doLogin()">Continue</button></div>`}
async function doLogin(){const lm=document.getElementById("lm");
if(!document.getElementById("cons").checked){lm.textContent="Please tick the box to continue.";return}
try{const j=await api("/api/login","POST",{first:document.getElementById("fn").value,last:document.getElementById("ln").value,pin:document.getElementById("pn").value,consent:true});
TOK=j.token;try{sessionStorage.setItem("pw5",TOK)}catch(e){}LMSG="";load(j);render()}catch(e){lm.textContent=e.message}}
function renderDone(){document.getElementById("app").innerHTML=`<div class="band"><small>PUSO POINTS PASSPORT 2026</small><h1>Submitted</h1><p>Thank you, ${esc(S.first||S.name)}.</p></div>
<div class="card"><h2>Your plan was sent to your teacher</h2><p>Your teacher will print it for you and your parent or guardian to sign. If something needs fixing, ask your teacher to reopen it.</p></div>${sheetBody(calc(),false)}<div class="card"><button class="btn" style="width:100%" onclick="signOut()">Sign out</button></div>`}
function review(c){return`<div class="card"><h2>Review your plan</h2><p class="mut">Check every number. After you submit, you cannot change it unless your teacher reopens it. Your teacher will print it for signing.</p></div>${sheetBody(c,false)}
<div class="card">${ask?`<p class="warn">Submit your plan to your teacher now?</p><div style="display:flex;gap:10px"><button class="btn" onclick="ask=false;render()">Not yet</button><button class="btn p" onclick="doSubmit()">Yes, submit</button></div>`:`<button class="btn p" style="width:100%" onclick="ask=true;render()">Submit to my teacher</button>`}<p id="sm" class="warn"></p></div>`}
async function doSubmit(){try{clearTimeout(saveT);saveT=null;await api("/api/plan","PUT",{data:S});await api("/api/submit","POST");LOCKED=true;ask=false;render();window.scrollTo(0,0)}catch(e){ask=false;render();const m=document.getElementById("sm");if(m)m.textContent=e.message}}
function render(){if(!TOK)return renderLogin();if(LOCKED)return renderDone();renderPlan()}
function V(c){const sur=Math.max(0,c.surplus);const b={short:"Short by "+fmt(-c.surplus)+". Revise your plan, or report your honest total.",on:"Exactly "+fmt(GOAL)+". Your plan works.",over:"Over the goal by "+fmt(sur)+". The extra stays with you."}[c.status];
return{total:fmt(c.total),needed:fmt(c.needed),pct:c.pct.toFixed(1)+"% of "+fmt(GOAL),sav:fmt(c.sav0),inc:fmt(c.inc),per0:fmt(c.per0),needsT:fmt(c.needs),wantsT:fmt(c.wants),free0:fmt(c.free0),remF:fmt(c.freeF),aleft:fmt(c.freeF-c.asum),req0:c.inc>0?(c.sav0/c.inc*100).toFixed(1)+"%":"–",savF:fmt(c.savF),wantsF:fmt(c.wantsF),reqF:c.incF>0?(c.needed/c.incF*100).toFixed(1)+"%":"–",projF:fmt(c.projF),banner:b,
warn0:c.free0<-.005?"Savings, needs, and wants are "+fmt(-c.free0)+" more than your income.":"",
note0:c.free0>.005?"This is money you have not planned yet. You will decide where it goes in the Goal check step.":"",
warn2:c.freeF<-.005?"Your plan spends "+fmt(-c.freeF)+" more than your income. Adjust your wants, savings %, or earnings.":(c.freeF>.005&&Math.abs(c.freeF-c.asum)>.005?"Assign your full remaining balance. "+fmt(c.freeF-c.asum)+" is left.":"")}}
function refresh(){const c=calc(),v=V(c);
document.querySelectorAll("[data-v]").forEach(e=>{e.textContent=v[e.dataset.v];if(e.dataset.v==="banner")e.dataset.status=c.status});
document.querySelectorAll("[data-show]").forEach(e=>e.hidden=e.dataset.show!==c.status);document.querySelectorAll("[data-rem]").forEach(e=>e.hidden=!(c.freeF>.005));
document.querySelectorAll("[data-meter]").forEach(e=>e.innerHTML=meter(c.total))}
function set(k,v,i){if(i===undefined)S[k]=v;else S[k][i]=v;queueSave();refresh()}
const meter=t=>{let h="";for(let i=1;i<=11;i++)h+='<i class="'+(t>=25*i?"f1":"")+'"></i>';return h};
const m=(label,k,i,ph)=>`<label class="f"><span>${label}</span><span class="in"><b>₱</b><input inputmode="decimal" placeholder="${ph||"0"}" value="${esc(i===undefined?S[k]:S[k][i])}" oninput="set('${k}',this.value${i===undefined?"":","+i})"></span></label>`;
const pct=(label,k,ph)=>`<label class="f"><span>${label}</span><span class="in"><input inputmode="decimal" placeholder="${ph||"0"}" value="${esc(S[k])}" oninput="set('${k}',this.value)"><b style="padding:0 12px 0 0">%</b></span></label>`;
function view(){const c=calc();
if(S.step===0)return`<div class="card"><h2>Can I reach ${fmt(GOAL)} by Week 5?</h2><p class="mut">Copy your numbers from the Savings Tracker (page 4). Use real numbers. Honest data earns credit, and a plan that falls short can still earn full marks.</p>
${m("Starting amount (₱100 is encouraged, if possible)","start")}<div class="row">${[0,1,2,3].map(i=>m("Week "+(i+1)+" savings","w",i)).join("")}</div></div>
<div class="card"><h3 style="margin-top:0">My progress meter</h3><p class="mut">One box for every ₱25 saved.</p><div class="meter" data-meter></div>
<div class="stat"><span>Total so far</span><b data-v="total"></b></div><div class="stat"><span>Still needed</span><b data-v="needed"></b></div><div class="stat"><span>Goal reached</span><b data-v="pct"></b></div></div>
<div class="card"><h2>My prediction</h2><p class="mut">Before you plan Week 5, what do you think will happen?</p><div class="chips">${[["short","I will be short"],["on","I will be on target"],["over","I will be over"]].map(x=>`<button class="chip ${S.pred===x[0]?"on":""}" onclick="S.pred='${x[0]}';queueSave();render()">${x[1]}</button>`).join("")}</div>
<label class="f"><span>Because…</span><textarea oninput="set('predWhy',this.value)">${esc(S.predWhy)}</textarea></label></div><p class="mut">Saved on this device only.</p>`;
if(S.step===1)return`<div class="card"><h2>My Week 5 budget</h2><p class="mut">Nov 9–13. Pay yourself first: choose how much of your income you will save, then plan the rest.</p><h3>Income this week</h3>${m("Allowance (fixed: regular and expected)","incA")}${m("Earned through honest effort (variable)","incE")}${m("Gifts / other (variable)","incG")}<div class="stat"><span>Total income</span><b data-v="inc"></b></div><h3>Puso savings (for the ₱275 goal)</h3><div class="stat"><span>Still needed to reach ₱275</span><b data-v="needed"></b></div>${m("Exact amount I will save for Puso this week","sp")}<div class="stat"><span>That is this % of my income</span><b data-v="req0"></b></div><h3>My own savings (optional)</h3><p class="mut">Savings for your own goal, separate from the Puso goal.</p>${pct("Percent of my income for my own savings","pp")}<div class="stat"><span>My own savings this week</span><b data-v="per0"></b></div><h3>Needs</h3>${m("Transport / fare","nA")}${m("School supplies and food","nB")}${m("Other needs","nC")}<div class="stat"><span>Total needs</span><b data-v="needsT"></b></div><h3>Wants</h3>${m("Snacks and treats","wA")}${m("Load and games","wB")}${m("Other wants","wC")}<div class="stat"><span>Total wants</span><b data-v="wantsT"></b></div>
<div class="stat"><span>Remaining balance</span><b data-v="free0"></b></div><div class="warn" data-v="warn0"></div><p class="mut" data-v="note0"></p></div>`;
if(S.step===2){const rev=c.rev?`<div class="card"><h2>Revise my plan</h2><p class="mut">You are short. Close the gap by raising your Puso savings amount, adding safe parent-approved earnings, lowering your wants, or a mix. Leave all blank to keep your plan and report your honest total. Never borrow.</p>
${m("New exact Puso savings (now "+fmt(c.sp)+")","revPct",undefined,String(c.sp))}${m("Extra approved earnings","extra")}${m("New total wants (now "+fmt(c.wants)+")","revWants",undefined,String(c.wants))}<div class="stat"><span>Puso savings needed to reach the goal</span><b data-v="needed"></b></div><div class="stat"><span>Revised savings</span><b data-v="savF"></b></div><div class="stat"><span>Revised wants</span><b data-v="wantsF"></b></div><div class="stat"><span>Remaining balance</span><b data-v="remF"></b></div></div>`:"";
return`<div class="card"><h2>Goal check</h2><div class="stat"><span>Total so far</span><b data-v="total"></b></div><div class="stat"><span>Week 5 savings</span><b data-v="savF"></b></div><div class="stat"><span>Projected total</span><b data-v="projF"></b></div><div class="banner" data-v="banner"></div></div>${rev}
<div class="card" data-show="on"><h2>What kept me on track?</h2><textarea oninput="set('onWhy',this.value)">${esc(S.onWhy)}</textarea></div>
<div class="card" data-rem><h2>Puso Allocation Plan</h2><p class="mut">Your ${fmt(GOAL)} goes in the envelope. Decide where your remaining balance goes, and assign all of it.</p><div class="stat"><span>Remaining balance to allocate</span><b data-v="remF"></b></div>
${[["Keep and save",0],["Share (gift or donation, with a parent’s agreement)",1],["Spend (a planned want)",2]].map(x=>`<div class="al"><span>${x[0]}</span><span class="in"><b>₱</b><input inputmode="decimal" placeholder="0" value="${esc(S.alloc[x[1]])}" oninput="set('alloc',this.value,${x[1]})"></span></div>`).join("")}
<div class="stat"><span>Left to allocate</span><b data-v="aleft"></b></div><label class="f"><span>Why I chose this</span><textarea oninput="set('allocWhy',this.value)">${esc(S.allocWhy)}</textarea></label></div><div class="warn" data-v="warn2"></div>`}
if(S.step===3)return`<div class="card"><h2>Reflect</h2><p class="mut">Required. In 3 sentences: what did my numbers show, and what values guided my choices?</p><textarea oninput="set('refl',this.value)">${esc(S.refl)}</textarea>
<label class="f"><span>One limitation and one improvement (required)</span><textarea oninput="set('limit',this.value)">${esc(S.limit)}</textarea></label></div>
<div class="card"><h2>Researcher’s checklist</h2><p class="mut">Why is this here? A researcher checks their own work before sharing it. Ticking each item shows your numbers and conclusions are honest and backed by evidence. It is part of how this task is graded.</p>${CHK.map((t,i)=>`<label class="chk"><input type="checkbox" ${S.chk[i]?"checked":""} onchange="set('chk',this.checked,${i})"><span>${t}</span></label>`).join("")}</div>`;
return review(c)}
function go(d){const c=calc();let msg="";
if(d>0&&S.step===1&&c.free0<-.005)msg="Your savings, needs, and wants are higher than your income. Adjust them first.";
if(d>0&&S.step===2){if(c.freeF<-.005)msg="Your plan spends more than your income. Adjust your wants, savings %, or earnings.";else if(c.freeF>.005&&Math.abs(c.freeF-c.asum)>.005)msg="Assign your full remaining balance first."}
if(d>0&&S.step===3&&(S.refl.trim().length<20||S.limit.trim().length<10))msg="Please answer both reflection questions before continuing.";
if(msg){document.getElementById("msg").textContent=msg;return}
S.step=Math.max(0,Math.min(4,S.step+d));queueSave();render();window.scrollTo(0,0)}
function renderPlan(){const s=S.step;
document.getElementById("app").innerHTML=`<div class="band noprint"><small>PUSO POINTS PASSPORT 2026</small><h1>My Week 5 Puso Plan</h1><p>Save it. Track it. Own it.</p><button class="btn" style="margin-top:10px;max-width:150px;background:#fff;color:#1f6b3b" onclick="signOut()">Sign out</button></div>
<div class="steps noprint">${NAMES.map((n,i)=>`<i class="${i<=s?"on":""}"></i>`).join("")}</div><p class="stepname noprint">Step ${s+1} of 5 · ${NAMES[s]}</p>${view()}
<p id="saved" class="mut noprint"></p><p id="msg" class="warn noprint"></p><div class="nav noprint"><div>${s>0?'<button class="btn" onclick="go(-1)">Back</button>':""}${s<4?'<button class="btn p" onclick="go(1)">'+(s===3?"Review my plan":"Next")+"</button>":""}</div></div>`;refresh()}

(async()=>{if(TOK){try{load(await api("/api/plan"))}catch(e){TOK=null;try{sessionStorage.removeItem("pw5")}catch(_){}}}render()})();
