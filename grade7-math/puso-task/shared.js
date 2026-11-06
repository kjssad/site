const GOAL=275;
const CHK=["I stated my question and my prediction.","I recorded my data as it happened.","My table and graph have units (₱).","My conclusion is supported by my data.","I named one limitation and one improvement.","Every number is honest and my own."];
const fresh=()=>({step:0,name:"",start:"",w:["","","",""],pred:"",predWhy:"",incA:"",incE:"",incG:"",sp:"",pp:"",nA:"",nB:"",nC:"",wA:"",wB:"",wC:"",revPct:"",extra:"",revWants:"",alloc:["","",""],allocWhy:"",onWhy:"",refl:"",limit:"",chk:[false,false,false,false,false,false]});
let S=fresh();
const num=v=>{const n=parseFloat(String(v).replace(/,/g,""));return isFinite(n)&&n>0?n:0};
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const fmt=n=>(n<0?"−":"")+"₱"+(Math.round(Math.abs(n)*100)/100).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2});
const rate=(s,i)=>i>0?(s/i*100).toFixed(1)+"%":"–";
function calc(){
const w=S.w.map(num),start=num(S.start),total=start+w.reduce((a,b)=>a+b,0);
const incA=num(S.incA),incE=num(S.incE),incG=num(S.incG),inc=incA+incE+incG,sp=num(S.sp),pp=Math.min(100,num(S.pp)),needs=num(S.nA)+num(S.nB)+num(S.nC),wants=num(S.wA)+num(S.wB)+num(S.wC),sav0=sp,per0=inc*pp/100,free0=inc-sav0-per0-needs-wants,proj0=total+sav0;
const rev=proj0<GOAL-.005,revOn=rev&&(S.revPct!==""||num(S.extra)>0||S.revWants!==""),spF=revOn&&S.revPct!==""?num(S.revPct):sp,incF=inc+(revOn?num(S.extra):0);
const savF=spF,perF=incF*pp/100,wantsF=revOn&&S.revWants!==""?num(S.revWants):wants,freeF=incF-savF-perF-needs-wantsF,projF=total+savF,surplus=projF-GOAL;
const status=Math.abs(surplus)<.005?"on":surplus<0?"short":"over";
const al=S.alloc.map(num),asum=al.reduce((a,b)=>a+b,0);
return{w,start,total,needed:Math.max(0,GOAL-total),pct:total/GOAL*100,inc,incA,incE,incG,sp,pp,spF,needs,wants,sav0,per0,perF,free0,freeF,proj0,rev,revOn,wantsF,incF,savF,projF,surplus,status,al,asum}}
function pie(items){items=items.filter(x=>x.v>.004);const tot=items.reduce((a,b)=>a+b.v,0);if(tot<=0)return'<p class="mut">No data to chart yet.</p>';let a=-Math.PI/2,p="";
items.filter(x=>x.v>0).forEach(x=>{const a2=a+2*Math.PI*x.v/tot;if(x.v===tot)p+=`<circle cx="60" cy="60" r="50" fill="${x.c}"/>`;else{const X=t=>(60+50*Math.cos(t)).toFixed(2),Y=t=>(60+50*Math.sin(t)).toFixed(2);p+=`<path d="M60 60L${X(a)} ${Y(a)}A50 50 0 ${a2-a>Math.PI?1:0} 1 ${X(a2)} ${Y(a2)}Z" fill="${x.c}" stroke="var(--card)" stroke-width="1.5"/>`}a=a2});
return`<div class="pies"><svg viewBox="0 0 120 120" role="img" aria-label="Pie chart">${p}</svg><div class="lg">${items.map(x=>`<div><i style="background:${x.c}"></i>${x.l}: ${fmt(x.v)} (${(x.v/tot*100).toFixed(0)}%)</div>`).join("")}</div></div>`}
function sheetBody(c,print){const run=[c.start];c.w.forEach((x,i)=>run.push(run[i]+x));const heads=["Start","Wk 1","Wk 2","Wk 3","Wk 4"],P={short:"short",on:"on target",over:"over"};
const fin=c.status==="short"?"Short by "+fmt(-c.surplus):c.status==="on"?"Exactly "+fmt(GOAL):"Over by "+fmt(c.surplus);
const sav=Math.max(0,c.savF);
return`<div class="card sheet"><div class="hd"><div><div class="mut">Puso Points Passport 2026 · High School Edition</div><b>My Week 5 Puso Plan</b> <span class="mut">(Mathematics)</span></div></div>
<p>Name: ${S.name?`<b>${esc(S.name)}</b>`:'<span class="line"></span>'}</p>
<h4>Where I started</h4><table><tr><th></th>${heads.map(h=>`<th class="n">${h}</th>`).join("")}</tr><tr><td>Saved</td><td class="n">${fmt(c.start)}</td>${c.w.map(x=>`<td class="n">${fmt(x)}</td>`).join("")}</tr><tr><td>Running total</td>${run.map(x=>`<td class="n">${fmt(x)}</td>`).join("")}</tr></table>
<h4>Week 5 budget${c.revOn?" (revised)":""}</h4><table><tr><td>Allowance (fixed)</td><td class="n">${fmt(c.incA)}</td><td>Puso savings</td><td class="n">${fmt(c.savF)}</td></tr><tr><td>Earned (variable)</td><td class="n">${fmt(c.incE)}</td><td>My own savings (${+c.pp.toFixed(2)}%)</td><td class="n">${fmt(c.perF)}</td></tr><tr><td>Gifts / other (variable)</td><td class="n">${fmt(c.incG)}</td><td>Needs</td><td class="n">${fmt(c.needs)}</td></tr><tr><td>Extra earnings (revision)</td><td class="n">${fmt(c.revOn?num(S.extra):0)}</td><td>Wants</td><td class="n">${fmt(c.wantsF)}</td></tr><tr><td><b>Total income</b></td><td class="n"><b>${fmt(c.incF)}</b></td><td>Remaining balance</td><td class="n">${fmt(c.freeF)}</td></tr><tr><td>Goal</td><td class="n">${fmt(GOAL)}</td><td><b>Projected total</b></td><td class="n"><b>${fmt(c.projF)}</b></td></tr></table><p class="mut">Needs: transport ${fmt(num(S.nA))}, school supplies and food ${fmt(num(S.nB))}, other ${fmt(num(S.nC))}. ${c.revOn&&S.revWants!==""?"Wants (revised): "+fmt(c.wantsF)+".":"Wants: snacks and treats "+fmt(num(S.wA))+", load and games "+fmt(num(S.wB))+", other "+fmt(num(S.wC))+"."}</p>
${pie([{l:"Needs",v:c.needs,c:"var(--c1)"},{l:"Wants",v:c.wantsF,c:"var(--c2)"},{l:"Puso savings",v:sav,c:"var(--c3)"},{l:"My own savings",v:c.perF,c:"var(--c4)"},{l:"Remaining balance",v:Math.max(0,c.freeF),c:"var(--line)"}])}
${c.freeF>.005?`<h4>Puso Allocation Plan for my remaining balance of ${fmt(c.freeF)}</h4>${pie([{l:"Keep and save",v:c.al[0],c:"var(--c3)"},{l:"Share",v:c.al[1],c:"var(--c4)"},{l:"Spend",v:c.al[2],c:"var(--c2)"}])}<p>${esc(S.allocWhy)}</p>`:""}
${c.status==="on"&&S.onWhy?`<h4>What kept me on track</h4><p>${esc(S.onWhy)}</p>`:""}
<h4>My prediction</h4><p>I predicted I would be ${P[S.pred]||"(not chosen)"}. ${esc(S.predWhy)} Result: ${fin}.</p>
<h4>Reflection</h4><p>${esc(S.refl)||"—"}</p><h4>Limitation and improvement</h4><p>${esc(S.limit)||"—"}</p>
<h4>Researcher’s checklist</h4><p class="mut">Why this is here: a researcher checks their own work. Ticking each item shows my numbers and conclusions are honest and backed by evidence.</p><p>${CHK.map((t,i)=>(S.chk[i]?"☑ ":"☐ ")+t).join("<br>")}</p>
<p class="mut">Anything beyond ${fmt(GOAL)} stays with the student. I will not borrow money to reach the goal.</p>
${print?`<div class="sig"><span>Student signature over printed name</span><span>Parent / guardian signature over printed name</span></div>`:""}</div>`}
