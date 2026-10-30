/* build 60e9392564 */

const DATA=window.__DATA__;
const $=s=>document.querySelector(s), listEl=$('#list'), countEl=$('#count'), crumbEl=$('#crumb');
let tab='guide', disc=null, man=null, sec='ALL', q='', special=null;
let extraSub=lsGet('efr-extrasub','tables');
const MANFULL={}; DATA.disciplines.forEach(d=>d.mans.forEach(m=>{MANFULL[m.k]={name:m.name,full:m.full};}));
const byId={}; DATA.entries.forEach(e=>{byId[e.id]=e;});
function lsGet(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
let fav=new Set(lsGet('efr-fav',[])), recent=lsGet('efr-recent',[]);
function isFav(id){return fav.has(id);}
function toggleFav(id){if(fav.has(id))fav.delete(id);else fav.add(id);lsSet('efr-fav',[...fav]);}
function addRecent(id){recent=recent.filter(x=>x!==id);recent.unshift(id);if(recent.length>30)recent=recent.slice(0,30);lsSet('efr-recent',recent);}
function saveLast(){lsSet('efr-last',{disc,man,sec});}
function makeBackup(){return 'EFR1:'+btoa(unescape(encodeURIComponent(JSON.stringify({v:1,fav:[...fav],recent:recent,last:lsGet('efr-last',null)}))));}
function applyBackup(str){try{let s=(str||'').trim();if(!s)return false;if(s.indexOf('EFR1:')===0)s=s.slice(5);const o=JSON.parse(decodeURIComponent(escape(atob(s.trim()))));if(Array.isArray(o.fav)){fav=new Set(o.fav.filter(id=>byId[id]));lsSet('efr-fav',[...fav]);}if(Array.isArray(o.recent)){recent=o.recent.filter(id=>byId[id]);lsSet('efr-recent',recent);}if(o.last)lsSet('efr-last',o.last);return true;}catch(e){return false;}}
try{const t=localStorage.getItem('efr-theme'); if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}
$('#theme').onclick=()=>{const d=document.documentElement; const cur=d.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'); const nx=cur==='dark'?'light':'dark'; d.setAttribute('data-theme',nx); try{localStorage.setItem('efr-theme',nx);}catch(e){}};
const esc=s=>(s==null?'':String(s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function toast(m){let el=$('#toast');if(!el){el=document.createElement('div');el.id='toast';el.className='toast';document.body.appendChild(el);}el.textContent=m;el.classList.add('on');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('on'),1400);}
function copyTxt(txt,msg){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(()=>toast(msg)).catch(()=>fbCopy(txt,msg));}else fbCopy(txt,msg);}
function fbCopy(txt,msg){const a=document.createElement('textarea');a.value=txt;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');toast(msg);}catch(e){}a.remove();}
function copyTask(id){const e=byId[id];if(!e)return;const m=MANFULL[e.doc]||{name:e.doc};let t=(e.n||'').toUpperCase()+'\n'+m.name+(e.sn?' · '+e.sn:'')+'\n';if(e.desc)t+='\n'+e.desc+'\n';[['Use case',e.use],['How to',e.how],['Dimensions',e.dim],['Equipment',e.eq],['Time / effort',e.tm],['Protection',e.pr],['Warnings',e.wn]].forEach(r=>{if(r[1])t+='\n'+r[0]+': '+r[1];});t+='\n\nSource: '+(e.src||'');copyTxt(t,'Copied as text');}
function shareLink(id){copyTxt(location.origin+location.pathname+'#'+id,'Link copied');}
function reportIssue(id){const e=byId[id];const subj=encodeURIComponent('Engineer Field Reference — issue with '+(id||''));const body=encodeURIComponent('Task: '+(e?e.n:id)+'\nManual: '+(e?(MANFULL[e.doc]||{}).name:'')+'\n\nWhat looks wrong:\n');window.location.href='mailto:Dylan.W.Lundquist.Mil@army.mil?subject='+subj+'&body='+body;}
// ---- checkable how-to steps: only when the source text itself is a numbered sequence (never invented) ----
function splitSteps(how){
 if(!how) return null;
 const nums=[];const re=/(?:^|[\s.])([1-9])[\.\)]\s+/g;let mm;
 while((mm=re.exec(how))) nums.push(mm[1]);
 if(new Set(nums).size<2) return null;
 const parts=how.split(/(?:^|[\s.])[1-9][\.\)]\s+/).map(s=>s.trim()).filter(Boolean);
 return parts.length>=2?parts:null;
}
let stepState=lsGet('efr-steps',{});
function setStep(tid,i,on){const a=stepState[tid]||(stepState[tid]=[]);a[i]=on;lsSet('efr-steps',stepState);}
const CONV={Length:[['Feet',0.3048],['Meters',1],['Inches',0.0254],['Yards',0.9144]],
 Volume:[['Cubic yards',0.764555],['Cubic meters',1],['Cubic feet',0.0283168]],
 Area:[['Square feet',0.092903],['Square meters',1],['Acres',4046.86],['Square yards',0.836127]],
 Weight:[['Pounds',0.453592],['Kilograms',1],['Short tons',907.185],['Metric tons',1000]]};
function makeConverter(){
 const cat=lsGet('efr-convcat','Length'),u=CONV[cat]||CONV.Length;
 const box=document.createElement('div');box.className='conv';
 box.innerHTML=`<div class="cr"><div><input id="cvA" type="number" inputmode="decimal" value="1" aria-label="From value"><select id="cvAU" aria-label="From unit">${u.map((x,i)=>`<option value="${i}">${esc(x[0])}</option>`).join('')}</select></div><div class="eq">=</div><div><input id="cvB" type="number" inputmode="decimal" readonly aria-label="Result"><select id="cvBU" aria-label="To unit">${u.map((x,i)=>`<option value="${i}" ${i===1?'selected':''}>${esc(x[0])}</option>`).join('')}</select></div></div><div class="srow" style="margin-top:10px">${Object.keys(CONV).map(c=>`<button class="chip" aria-pressed="${c===cat}" data-cat="${c}">${c}</button>`).join('')}</div>`;
 const A=box.querySelector('#cvA'),B=box.querySelector('#cvB'),AU=box.querySelector('#cvAU'),BU=box.querySelector('#cvBU');
 function cv(){const a=parseFloat(A.value),base=a*u[+AU.value][1];B.value=isFinite(base)?(base/u[+BU.value][1]).toLocaleString(undefined,{maximumFractionDigits:4}):'';}
 [A,AU,BU].forEach(el=>el.addEventListener('input',cv));cv();
 box.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{lsSet('efr-convcat',b.dataset.cat);render();});
 return box;}
function hay(o){return [o.n,o.c,o.desc,o.use,o.how,o.dim,o.eq,o.tm,o.pr,o.wn,o.src,o.sn].join(' ').toLowerCase();}
const MAN_ORDER_JS=DATA.manOrder||[];
function trustLine(){
 const el=document.createElement('div');el.className='trust';
 const off=lsGet('efr-offline',null);
 el.innerHTML=(off?`<span class="ok">&#10003; Offline ready</span>`:`<span>Not yet saved offline &mdash; </span>`)+
  (off?'':`<a style="color:var(--accent-ink);font-weight:700;cursor:pointer" id="trustoff">download for offline</a>`)+
  `<span> &middot; Guide updated ${esc(DATA.build||'')}</span>`;
 if(!off){el.querySelector('#trustoff').onclick=openOffline;}
 return el;
}
// ---- glossary auto-linking: link the first mention of each term per card, longest term wins ----
const GLOSS=(DATA.glossary||[]).map(g=>g.t).filter(t=>t&&t.length>=3).sort((a,b)=>b.length-a.length);
const GLOSSMAP={};(DATA.glossary||[]).forEach(g=>{GLOSSMAP[g.t.toLowerCase()]=g.d;});
function escRe(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function linkGlossary(root){
 if(!root||!GLOSS.length) return;
 const used=new Set();
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
 const nodes=[];let n;while((n=walker.nextNode())){const p=n.parentElement;if(p&&!p.closest('a,button,select,input,.kl,.pcell,.gcell,.src')) nodes.push(n);}
 nodes.forEach(node=>{
  const txt=node.nodeValue;
  for(const term of GLOSS){
   const key=term.toLowerCase(); if(used.has(key)) continue;
   const caseFlag=/^[A-Z0-9]{2,8}$/.test(term)?'':'i';
   let re; try{re=new RegExp('\\b'+escRe(term)+'\\b',caseFlag);}catch(e){continue;}
   const m=re.exec(txt);
   if(m){
    used.add(key);
    const before=txt.slice(0,m.index),hit=m[0],after=txt.slice(m.index+hit.length);
    const a=document.createElement('a');a.className='ref';a.dataset.gl=term;a.textContent=hit;
    const parent=node.parentNode;
    parent.insertBefore(document.createTextNode(before),node);
    parent.insertBefore(a,node);
    parent.insertBefore(document.createTextNode(after),node);
    parent.removeChild(node);
    break;
   }
  }
 });
}
function renderGlobalSearch(frag){
 const tasks=DATA.entries.filter(e=>hay(e).includes(q));
 const tbls=DATA.tables.filter(t=>(t.t+' '+t.cap).toLowerCase().includes(q));
 const terms=DATA.glossary.filter(g=>(g.t+' '+g.d).toLowerCase().includes(q));
 const toolHits=[];
 TOOLS.forEach(t=>{
  if((t.name+' '+(t.note||'')).toLowerCase().includes(q)) toolHits.push(t.name);
  if(t.equip) Object.values(t.equip).forEach(e=>{if((e.name+' '+(e.note||'')).toLowerCase().includes(q)) toolHits.push('Equipment production — '+e.name);});
 });
 const total=tasks.length+tbls.length+terms.length+toolHits.length;
 countEl.textContent=total+' result'+(total===1?'':'s')+' for "'+q+'"';
 if(!total){const x=document.createElement('div');x.className='empty';x.textContent='No matches. Try different words.';frag.appendChild(x);return;}
 const goTools=()=>{tab='tools';document.querySelectorAll('.tab').forEach(xx=>xx.setAttribute('aria-selected',xx.dataset.tab==='tools'?'true':'false'));q='';$('#q').value='';$('#qx').style.display='none';render();window.scrollTo(0,0);};
 if(tasks.length){const h=document.createElement('div');h.className='srchgrp first';h.textContent='Tasks & topics ('+tasks.length+')';frag.appendChild(h);
  tasks.slice(0,50).forEach(e=>frag.appendChild(entryEl(e)));}
 if(tbls.length){const h=document.createElement('div');h.className='srchgrp';h.textContent='Tables & figures ('+tbls.length+')';frag.appendChild(h);
  tbls.slice(0,30).forEach(t=>{const b=document.createElement('button');b.className='srchtbl';b.innerHTML=`<b>${esc(t.t)}</b><span>${esc(t.cap)}</span>`;b.onclick=()=>viewer(t.img,t.t+'. '+t.cap);frag.appendChild(b);});}
 if(terms.length){const h=document.createElement('div');h.className='srchgrp';h.textContent='Glossary ('+terms.length+')';frag.appendChild(h);
  terms.slice(0,30).forEach(g=>{const el=document.createElement('div');el.className='srchterm';el.innerHTML=`<span style="font-weight:700;color:var(--accent-ink)">${esc(g.t)}</span> &mdash; ${esc(g.d)}`;frag.appendChild(el);});}
 if(toolHits.length){const h=document.createElement('div');h.className='srchgrp';h.textContent='Tools ('+toolHits.length+')';frag.appendChild(h);
  toolHits.forEach(name=>{const b=document.createElement('button');b.className='srchtool';b.textContent=name;b.onclick=goTools;frag.appendChild(b);});}
}
function lnk(v,doc){if(!v)return '';return esc(v).replace(/(Table|Figure)s?\s+([0-9A-Za-z]+-\d+)/gi,(m,k,num)=>{const kk=k.charAt(0).toUpperCase()+k.slice(1).toLowerCase(),nn=num.toUpperCase();const key=doc+' '+kk+' '+nn;return DATA.images[key]?`<a class="ref" data-k="${key}" data-l="${kk+' '+nn}">${m}</a>`:m;});}
function viewer(imgKey,title){const im=DATA.images[imgKey];if(!im)return;$('#vimg').src=im;$('#vtitle').textContent=title||'';$('#viewer').classList.add('on');}
$('#vclose').onclick=()=>{$('#viewer').classList.remove('on');$('#vimg').src='';};
$('#viewer').addEventListener('click',e=>{if(e.target.id==='viewer'){$('#viewer').classList.remove('on');$('#vimg').src='';}});
function taskCard(t){const d=document.createElement('details');d.className='card';d.dataset.tid=t.id;d.style.setProperty('--col',t.col);
 let key='';const krow=(l,v,w)=>{if(v)key+=`<div class="kr${w?' w':''}"><span class="kl">${l}</span><dd>${lnk(v,t.doc)}</dd></div>`;};
 krow('Dimensions',t.dim);krow('Equipment',t.eq);krow('Warnings',t.wn,1);
 const keystrip=key?`<div class="keystrip">${key}</div>`:'';
 let kv='';const row=(l,v)=>{if(v)kv+=`<dt>${l}</dt><dd>${lnk(v,t.doc)}</dd>`;};
 row('Type',t.tp);row('Use case',t.use);
 const steps=splitSteps(t.how);
 let howHtml='';
 if(steps){const st=(stepState[t.id]||[]);howHtml=`<div class="lead"><b>How to:</b></div><ul class="steps" data-steps="${esc(t.id)}">`+
   steps.map((s,i)=>`<li class="step${st[i]?' done':''}" data-i="${i}"><input type="checkbox" ${st[i]?'checked':''} aria-label="Mark step done"><span>${lnk(s,t.doc)}</span></li>`).join('')+`</ul>`;}
 else row('How to',t.how);
 row('Time / effort',t.tm);row('Protection',t.pr);
 const pics=(t.figs||[]).filter(k=>DATA.images[k]);
 let fig='';
 if(pics.length){fig=`<div class="pix"><div class="pixh">Pictures (${pics.length}) &mdash; tap to zoom</div><div class="pixrow">`+
   pics.map(k=>`<button class="pcell" data-fig="${esc(k)}"><img src="${DATA.images[k]}" alt="" loading="lazy" decoding="async"><span>${esc(k.split(' ').slice(1).join(' '))}</span></button>`).join('')+`</div></div>`;}
 const tag=(q||special)?`<span class="seclab">${esc(t.sn)}</span>`:'';
 d.innerHTML=`<summary><span class="nm">${esc(t.n)}</span>${tag}<button class="star${isFav(t.id)?' on':''}" data-fid="${esc(t.id)}" aria-label="Save to favorites" title="Save">&#9733;</button><span class="car">&rsaquo;</span></summary>`+
  `<div class="body">${t.desc?`<div class="lead">${lnk(t.desc,t.doc)}</div>`:''}${keystrip}${howHtml}<dl class="kv">${kv}</dl>${fig}<div class="cardacts"><button class="cact" data-copy="${esc(t.id)}">Copy text</button><button class="cact" data-share="${esc(t.id)}">Share link</button><button class="cact" data-report="${esc(t.id)}">Report issue</button></div><div class="src">Source: ${lnk(t.src,t.doc)}</div></div>`;
 d.addEventListener('toggle',()=>{if(d.open){addRecent(t.id);linkGlossary(d.querySelector('.body'));}});
 return d;}
function topicEl(t){const el=document.createElement('div');el.className='topic';el.dataset.tid=t.id;el.style.setProperty('--col',t.col);
 const parts=[];if(t.desc)parts.push(t.desc);if(t.how&&t.how!==t.desc)parts.push(t.how);
 const kf=[t.dim,t.eq,t.pr,t.wn].filter(Boolean).join('; ');
 const tag=(q||special)?` <span class="seclab">${esc(t.sn)}</span>`:'';
 el.innerHTML=`<h3>${esc(t.n)}${tag}</h3>${t.use?`<div class="use">When / why: ${lnk(t.use,t.doc)}</div>`:''}<p>${lnk(parts.join(' '),t.doc)}</p>${kf?`<div class="kf"><b>Key facts:</b> ${lnk(kf,t.doc)}</div>`:''}<div class="cardacts"><button class="cact" data-copy="${esc(t.id)}">Copy text</button><button class="cact" data-share="${esc(t.id)}">Share link</button><button class="cact" data-report="${esc(t.id)}">Report issue</button></div><div class="src">Source: ${lnk(t.src,t.doc)}</div>`;
 linkGlossary(el);
 return el;}
function entryEl(t){return t.kind==='task'?taskCard(t):topicEl(t);}
function go(d,m,s){special=null;disc=d;man=m;sec=s||'ALL';q='';$('#q').value='';$('#qx').style.display='none';saveLast();render();window.scrollTo(0,0);}
function goSpecial(k){special=k;disc=null;man=null;sec='ALL';q='';$('#q').value='';$('#qx').style.display='none';render();window.scrollTo(0,0);}
function upLevel(){if(special){go(null,null,'ALL');return;}if(sec!=='ALL')go(disc,man,'ALL');else if(man)go(disc,null,'ALL');else if(disc)go(null,null,'ALL');}
function crumb(parts){crumbEl.innerHTML='';
 const bk=document.createElement('button');bk.className='backbtn';bk.innerHTML='&lsaquo; Back';bk.setAttribute('aria-label','Go back one level');bk.onclick=upLevel;crumbEl.appendChild(bk);
 parts.forEach((p,i)=>{
 if(i){const s=document.createElement('span');s.className='sep';s.textContent='›';crumbEl.appendChild(s);}
 if(p.fn){const a=document.createElement('a');a.textContent=p.label;a.onclick=p.fn;crumbEl.appendChild(a);}
 else{const s=document.createElement('span');s.className='here';s.textContent=p.label;crumbEl.appendChild(s);}});}
const EQUIP={
 dozer:{name:'Dozer',
  note:'Production = maximum production × the product of the correction factors. Tap a chart below to read the maximum production for your dozer and push distance, then enter it.',
  links:[{k:'TM62 Figure 2-13',l:'Fig 2-13 (D6T–D7E)'},{k:'TM62 Figure 2-14',l:'Fig 2-14 (D7–D8)'},{k:'TM62 Figure 2-15',l:'Fig 2-15 grade'},{k:'TM62 Table 2-2',l:'Table 2-2 operator'},{k:'TM62 Table 2-4',l:'Table 2-4 material'},{k:'TM62 Table 2-5',l:'Table 2-5 technique'}],
  fields:[{k:'max',l:'Max production (LCY/hr) — from chart'},{k:'grade',l:'Grade factor (Fig 2-15; 1.0 = level)',v:1}],
  selects:[
   {k:'mat',l:'Material (Table 2-4)',opts:[['Average / as-is (1.0)',1],['Loose, stockpile (1.2)',1.2],['Hard to cut; frozen, w/ tilt (0.8)',0.8],['Hard to cut; frozen, no tilt (0.7)',0.7],['Hard to drift / dead / sticky (0.8)',0.8],['Rock, ripped or blasted (0.7)',0.7]]},
   {k:'tech',l:'Technique (Table 2-5)',opts:[['Normal (1.0)',1],['Slot dozing (1.2)',1.2],['Side-by-side dozing (1.2)',1.2]]},
   {k:'op',l:'Operator (Table 2-2)',opts:[['Excellent — day (1.0)',1],['Average — day (0.75)',0.75],['Poor — day (0.6)',0.6],['Excellent — night (0.75)',0.75],['Average — night (0.56)',0.56],['Poor — night (0.45)',0.45]]}],
  eff:true,
  calc:o=>{const p=o.max*o.grade*o.mat*o.tech*o.op*(o.wm/60);return [['Production',fmt(p)+' LCY/hr'],['Per 8-hr day',fmt(p*8)+' LCY']];}},
 loader:{name:'Wheel loader',
  note:'Production = heaped-bucket capacity × fill factor × (60 ÷ cycle time) × efficiency. Fill factor from TM 3-34.62 Table 5-1; typical cycle time 0.45–0.55 min (Table 5-2).',
  links:[{k:'TM62 Table 5-1',l:'Table 5-1 fill'},{k:'TM62 Table 5-2',l:'Table 5-2 cycle'}],
  fields:[{k:'cap',l:'Heaped bucket capacity (CY)'},{k:'ct',l:'Cycle time (min) — Table 5-2',v:0.5}],
  selects:[{k:'ff',l:'Material fill factor (Table 5-1)',opts:[['Mixed moist aggregates (0.98)',0.98],['Uniform aggregate ≤ 1/8 in (0.98)',0.98],['Uniform 1/8–3/8 in (0.93)',0.93],['Uniform ≥ 1/2 in (0.88)',0.88],['Blasted rock — well (0.88)',0.88],['Blasted rock — average (0.83)',0.83],['Blasted rock — poor (0.68)',0.68],['Rock-dirt mixture (1.10)',1.1],['Moist loam (1.05)',1.05],['Soil (0.90)',0.9]]}],
  eff:true,
  calc:o=>{const p=o.cap*o.ff*(60/o.ct)*(o.wm/60);return [['Production',fmt(p)+' LCY/hr'],['Per 8-hr day',fmt(p*8)+' LCY']];}},
 hoe:{name:'Hydraulic excavator / backhoe',
  note:'Production = heaped-bucket capacity × fill factor × (60 ÷ cycle time) × efficiency. Fill factor from TM 3-34.62 Table 8-1; enter a cycle time typical for your machine and depth of cut.',
  links:[{k:'TM62 Table 8-1',l:'Table 8-1 fill'}],
  fields:[{k:'cap',l:'Heaped bucket capacity (CY)'},{k:'ct',l:'Cycle time (min)',v:0.4}],
  selects:[{k:'ff',l:'Material fill factor (Table 8-1)',opts:[['Moist loam / sandy clay (1.05)',1.05],['Sand and gravel (1.02)',1.02],['Hard, tough clay (0.85)',0.85],['Rock — well blasted (0.68)',0.68],['Rock — poorly blasted (0.45)',0.45]]}],
  eff:true,
  calc:o=>{const p=o.cap*o.ff*(60/o.ct)*(o.wm/60);return [['Production',fmt(p)+' LCY/hr'],['Per 8-hr day',fmt(p*8)+' LCY']];}},
 scraper:{name:'Scraper',
  note:'Production = heaped load × trips per hour. Cycle time CT = travel time (haul + return) + turn-&-dump + load time (TM 3-34.62 para 3-30). Defaults: turn/dump 0.81 min, load 0.85 min (621G w/ D8 push) — adjust for your equipment. Enter travel time from your haul/return profile.',
  fields:[{k:'cap',l:'Heaped load (CY)'},{k:'tt',l:'Travel time, haul+return (min)'},{k:'td',l:'Turn & dump (min)',v:0.81},{k:'lt',l:'Load time (min)',v:0.85}],
  eff:true,
  calc:o=>{const ct=o.tt+o.td+o.lt,p=o.cap*(o.wm/ct);return [['Cycle time',fmt(ct)+' min'],['Production',fmt(p)+' LCY/hr'],['Per 8-hr day',fmt(p*8)+' LCY']];}},
 grader:{name:'Grader',
  note:'Hourly area A = speed × (effective blade length − overlap) × 5280 × efficiency (TM 3-34.62 para 4-34). Speed from Table 4-4, effective blade length from Table 4-5. “Finished area” divides the coverage by the number of passes.',
  links:[{k:'TM62 Table 4-4',l:'Table 4-4 speed'},{k:'TM62 Table 4-5',l:'Table 4-5 blade'}],
  fields:[{k:'S',l:'Operating speed (mph) — Table 4-4'},{k:'Le',l:'Effective blade length (ft) — Table 4-5'},{k:'Lo',l:'Overlap (ft) — typically 2.0 ft',v:2},{k:'passes',l:'Passes',v:1}],
  eff:true,
  calc:o=>{const A=o.S*(o.Le-o.Lo)*5280*(o.wm/60),ac=A/43560;return [['Coverage',fmt(ac)+' acre/hr ('+fmt(A)+' sq ft/hr)'],['Finished area',fmt(ac/o.passes)+' acre/hr']];}}
};
const TOOLS=[
 {cat:'Horizontal',name:'Earthwork volume (average end area)',src:'TM 3-34.55 / TM 3-34.62',
  note:'Average-end-area method. Enter the two cross-section end areas and the distance between the stations.',
  in:[{k:'a1',l:'End area A1 (sq ft)'},{k:'a2',l:'End area A2 (sq ft)'},{k:'L',l:'Distance between (ft)'}],
  out:o=>[['Volume',fmt(o.L*(o.a1+o.a2)/2/27)+' cu yd']]},
 {cat:'Horizontal',name:'Soil volume — swell & shrinkage',src:'TM 3-34.41 / TM 3-34.62',
  note:'Convert in-place (bank) soil to loose and compacted volumes. Enter the swell and shrinkage percentages for your soil — see TM 3-34.62 Table 1-1 for soil conversion factors.',
  links:[{k:'TM62 Table 1-1',l:'Table 1-1 conversion'}],
  in:[{k:'b',l:'Bank volume (BCY)'},{k:'sw',l:'Swell %'},{k:'sh',l:'Shrinkage %'}],
  out:o=>[['Loose (LCY)',fmt(o.b*(1+o.sw/100))],['Compacted (CCY)',fmt(o.b*(1-o.sh/100))]]},
 {cat:'Horizontal',name:'Equipment production rate',equip:EQUIP},
 {cat:'Vertical',name:'Concrete volume',src:'TM 3-34.44',
  note:'Length × width × thickness ÷ 27, plus a waste allowance. Length and width in feet, thickness in inches.',
  in:[{k:'L',l:'Length (ft)'},{k:'W',l:'Width (ft)'},{k:'T',l:'Thickness (in)'},{k:'wa',l:'Waste %',v:5}],
  out:o=>[['Concrete needed',fmt(o.L*o.W*(o.T/12)/27*(1+o.wa/100))+' cu yd']]},
 {cat:'Vertical',name:'Concrete mix materials',src:'TM 3-34.44 (ch 3, trial-batch yield)',
  note:'Splits a concrete volume into cement, sand, and gravel by your mix ratio. Set the mix (parts by volume) and the dry-material yield factor you determined for your mix with a trial batch (TM 3-34.44, para 3-12–3-13); 1 bag of cement ≈ 1 cu ft.',
  in:[{k:'v',l:'Concrete volume (cu yd)'},{k:'c',l:'Cement parts',v:1},{k:'s',l:'Sand parts',v:2},{k:'g',l:'Gravel parts',v:3},{k:'y',l:'Dry yield factor (from your trial batch)'}],
  out:o=>{const dry=o.v*27*o.y,sum=o.c+o.s+o.g;return [['Cement',fmt(dry*o.c/sum)+' bags'],['Sand',fmt(dry*o.s/sum)+' cu ft'],['Gravel',fmt(dry*o.g/sum)+' cu ft']];}},
 {cat:'Vertical',name:'Masonry — CMU block count',src:'TM 3-34.44',
  note:'Standard 8×8×16 in. concrete block (1.125 blocks per sq ft of wall). Subtract openings and add a waste allowance.',
  in:[{k:'L',l:'Wall length (ft)'},{k:'H',l:'Wall height (ft)'},{k:'op',l:'Openings (sq ft)',v:0},{k:'wa',l:'Waste %',v:5}],
  out:o=>{const a=o.L*o.H-o.op;return [['Net wall area',fmt(a)+' sq ft'],['Blocks needed',fmt(Math.ceil(a*1.125*(1+o.wa/100)))]];}},
 {cat:'Vertical',name:'Lumber — board feet',src:'TM 3-34.47',
  note:'Board feet = (thickness-in × width-in × length-ft) ÷ 12 × number of pieces.',
  in:[{k:'t',l:'Thickness (in)'},{k:'w',l:'Width (in)'},{k:'L',l:'Length (ft)'},{k:'q',l:'Pieces',v:1}],
  out:o=>[['Board feet',fmt(o.t*o.w*o.L/12*o.q)+' bd ft']]},
 {cat:'Vertical',name:'Wall framing — stud count',src:'TM 3-34.47',
  note:'Studs on center for a wall. Add plates, corner/partition posts, and extra studs at openings separately.',
  in:[{k:'L',l:'Wall length (ft)'},{k:'sp',l:'Stud spacing (in)',v:16}],
  out:o=>[['Field studs',fmt(Math.floor(o.L*12/o.sp)+1)],['Then add','plates, corners, openings']]}
];
function fmt(n){return (!isFinite(n))?'—':(Math.round(n*100)/100).toLocaleString();}
let toolMem=lsGet('efr-toolmem',{});
function memGet(key,k,dflt){const m=toolMem[key];return (m&&m[k]!=null)?m[k]:dflt;}
function memSet(key,k,v){const m=toolMem[key]||(toolMem[key]={});m[k]=v;lsSet('efr-toolmem',toolMem);}
function toolCard(t){
 const d=document.createElement('details');d.className='card tool';d.style.setProperty('--col',t.cat==='Horizontal'?'#a8702e':'#2f7d6b');
 if(t.equip){
  const keys=Object.keys(t.equip);
  d.innerHTML=`<summary><span class="nm">${esc(t.name)}</span><span class="car">&rsaquo;</span></summary><div class="body"><label class="tin"><span>Equipment</span><select data-eq>${keys.map(k=>`<option value="${k}">${esc(t.equip[k].name)}</option>`).join('')}</select></label><div class="eqbody"></div></div>`;
  const sel=d.querySelector('[data-eq]'),body=d.querySelector('.eqbody');
  sel.value=memGet(t.name,'_eq',keys[0]);
  function calc(){const e=t.equip[sel.value],o={};body.querySelectorAll('[data-k]').forEach(x=>{o[x.dataset.k]=parseFloat(x.value);memSet(t.name+':'+sel.value,x.dataset.k,x.value);});let rows;try{rows=e.calc(o)||[];}catch(err){rows=[];}const outs=body.querySelector('.touts');if(outs)outs.innerHTML=rows.map(r=>`<div class="tout"><span>${esc(r[0])}</span><b>${esc(r[1])}</b></div>`).join('');}
  function buildEq(){const e=t.equip[sel.value];memSet(t.name,'_eq',sel.value);const mk=t.name+':'+sel.value;
   const flds=(e.fields||[]).map(f=>`<label class="tin"><span>${esc(f.l)}</span><input type="number" inputmode="decimal" step="any" data-k="${f.k}" value="${memGet(mk,f.k,f.v!=null?f.v:'')}"></label>`).join('');
   const sels=(e.selects||[]).map(s=>`<label class="tin"><span>${esc(s.l)}</span><select data-k="${s.k}">${s.opts.map(o=>`<option value="${o[1]}">${esc(o[0])}</option>`).join('')}</select></label>`).join('');
   const ef=e.eff?`<label class="tin"><span>Working min / hr</span><input type="number" inputmode="decimal" step="any" data-k="wm" value="${memGet(mk,'wm',50)}"></label>`:'';
   const lks=(e.links||[]).map(x=>`<button type="button" class="ref chartlink" data-k="${esc(x.k)}" data-l="${esc(x.l)}">${esc(x.l)}</button>`).join('');
   const lkrow=lks?`<div class="chartlinks">${lks}</div>`:'';
   body.innerHTML=`<p class="tnote">${esc(e.note)}</p>${lkrow}<div class="tins">${flds}${sels}${ef}</div><div class="touts"></div><div class="src">Source: TM 3-34.62 (Earthmoving)</div>`;
   (e.selects||[]).forEach(s=>{const el=body.querySelector(`[data-k="${s.k}"]`);const sv=memGet(mk,s.k,null);if(sv!=null)el.value=sv;});
   calc();}
  sel.addEventListener('change',buildEq);d.addEventListener('input',calc);d.addEventListener('toggle',()=>{if(d.open)buildEq();});
  return d;
 }
 const ins=t.in.map(f=>`<label class="tin"><span>${esc(f.l)}</span><input type="number" inputmode="decimal" step="any" data-k="${f.k}" value="${memGet(t.name,f.k,f.v!=null?f.v:'')}"></label>`).join('');
 const glk=(t.links||[]).map(x=>`<button type="button" class="ref chartlink" data-k="${esc(x.k)}" data-l="${esc(x.l)}">${esc(x.l)}</button>`).join('');
 d.innerHTML=`<summary><span class="nm">${esc(t.name)}</span><span class="car">&rsaquo;</span></summary><div class="body"><p class="tnote">${esc(t.note)}</p>${glk?`<div class="chartlinks">${glk}</div>`:''}<div class="tins">${ins}</div><div class="touts"></div><div class="src">Source: ${esc(t.src)}</div></div>`;
 const outs=d.querySelector('.touts');
 function calc(){const o={};d.querySelectorAll('input[data-k]').forEach(x=>{o[x.dataset.k]=parseFloat(x.value);memSet(t.name,x.dataset.k,x.value);});let rows;try{rows=t.out(o)||[];}catch(e){rows=[];}outs.innerHTML=rows.map(r=>`<div class="tout"><span>${esc(r[0])}</span><b>${esc(r[1])}</b></div>`).join('');}
 d.addEventListener('input',calc);d.addEventListener('toggle',()=>{if(d.open)calc();});
 return d;
}
function render(){
 const guide=tab==='guide';
 crumbEl.hidden=!(guide&&!q&&(special||disc||man));
 listEl.innerHTML='';countEl.innerHTML='';const frag=document.createDocumentFragment();
 if(q){
  renderGlobalSearch(frag);
 } else if(guide){
  if(special){
   crumb([{label:'Disciplines',fn:()=>go(null,null,'ALL')},{label:special==='saved'?'★ Saved':'Recent'}]);
   const ids=special==='saved'?[...fav]:recent;
   const rows=ids.map(id=>byId[id]).filter(Boolean);
   countEl.textContent=`${rows.length} ${special==='saved'?'saved task':'recent task'}${rows.length===1?'':'s'}`;
   rows.forEach(e=>frag.appendChild(entryEl(e)));
   if(!rows.length){const x=document.createElement('div');x.className='empty';x.textContent=special==='saved'?'No saved tasks yet. Tap the ★ on any task to save it here.':'Nothing viewed yet.';frag.appendChild(x);}
  } else if(!disc){
   frag.appendChild(trustLine());
   {
    const jg=document.createElement('div');jg.className='jobgrid';
    (DATA.jobs||[]).forEach(j=>{const b=document.createElement('button');b.className='jobcard';
     b.innerHTML=`<span class="ji">${j.icon}</span><span class="jl">${esc(j.label)}</span>`;
     b.onclick=()=>go(j.disc,j.man,'ALL');jg.appendChild(b);});
    frag.appendChild(jg);
   }
   {
    const sc=document.createElement('div');sc.className='shortcuts';
    if(fav.size){const b=document.createElement('button');b.className='scut';b.style.setProperty('--dc','#c9a227');b.innerHTML=`<span class="si">&#9733;</span><span class="sl">Saved</span><span class="sn">${fav.size}</span>`;b.onclick=()=>goSpecial('saved');sc.appendChild(b);}
    if(recent.length){const b=document.createElement('button');b.className='scut';b.style.setProperty('--dc','#6a6a5a');b.innerHTML=`<span class="si">&#8635;</span><span class="sl">Recent</span><span class="sn">${recent.length}</span>`;b.onclick=()=>goSpecial('recent');sc.appendChild(b);}
    const ob=document.createElement('button');ob.className='scut';ob.style.setProperty('--dc','#3f6fa0');ob.innerHTML=`<span class="si">&#11015;</span><span class="sl">Download TMs for offline use</span><span class="sn">&rsaquo;</span>`;ob.onclick=openOffline;sc.appendChild(ob);
    frag.appendChild(sc);
   }
   const h=document.createElement('div');h.className='idxhead';h.textContent='Choose a discipline:';h.style.marginTop='4px';frag.appendChild(h);
   DATA.disciplines.forEach(d=>{const b=document.createElement('button');b.className='disccard';b.style.setProperty('--dc',d.color);
    b.innerHTML=`<div class="dt">${esc(d.d)}<span class="cnt">${d.mans.length} manual${d.mans.length===1?'':'s'}</span></div><div class="dd">${esc(d.desc)}</div>`;
    b.onclick=()=>go(d.d,null,'ALL');frag.appendChild(b);});
  } else if(!man){
   const dd=DATA.disciplines.find(x=>x.d===disc);
   crumb([{label:'Disciplines',fn:()=>go(null,null,'ALL')},{label:disc}]);
   dd.mans.forEach(m=>{const b=document.createElement('button');b.className='mancard';b.style.setProperty('--dc',dd.color);
    b.innerHTML=`<div class="mh"><span class="mn">${esc(m.name)}</span><span class="cnt">${m.n} items</span></div><div class="mf">${esc(m.full)}</div><div class="syn">${esc(m.syn)}</div>${m.date?`<div class="mdate">Published ${esc(m.date)}</div>`:''}<div class="go">View sections ›</div>`;
    b.onclick=()=>go(disc,m.k,'ALL');frag.appendChild(b);});
  } else if(sec==='ALL'){
   const dd=DATA.disciplines.find(x=>x.d===disc),m=dd.mans.find(x=>x.k===man);
   crumb([{label:'Disciplines',fn:()=>go(null,null,'ALL')},{label:disc,fn:()=>go(disc,null,'ALL')},{label:m.name}]);
   const syn=document.createElement('div');syn.className='synbox';syn.innerHTML=`<b>${esc(m.name)} — ${esc(m.full)}${m.date?', '+esc(m.date):''}.</b> ${esc(m.syn)}`;countEl.appendChild(syn);
   const h=document.createElement('div');h.className='idxhead';h.textContent='Sections:';countEl.appendChild(h);
   DATA.sections[man].forEach(s=>{const b=document.createElement('button');b.className='secbtn';b.style.setProperty('--accent',dd.color);
    b.innerHTML=`<span class="sk" style="background:${dd.color}">${esc(s.label)}</span><span class="snm">${esc(s.name)}</span><span class="sn">${s.n}</span><span class="car">&rsaquo;</span>`;
    b.onclick=()=>go(disc,man,s.k);frag.appendChild(b);});
  } else {
   const dd=DATA.disciplines.find(x=>x.d===disc),m=dd.mans.find(x=>x.k===man);
   const s=DATA.sections[man].find(x=>x.k===sec)||{label:'',name:''};
   crumb([{label:'Disciplines',fn:()=>go(null,null,'ALL')},{label:disc,fn:()=>go(disc,null,'ALL')},{label:m.name,fn:()=>go(disc,man,'ALL')},{label:s.label}]);
   const rows=DATA.entries.filter(e=>e.doc===man&&e.sk===sec);
   const figs=(s.figs||[]).filter(f=>DATA.images[f.k]);
   const sp=document.createElement('span');sp.textContent=`${m.name} · ${s.label} ${s.name} · ${rows.length} item${rows.length===1?'':'s'}`+(figs.length?` · ${figs.length} figure${figs.length===1?'':'s'}`:'');countEl.appendChild(sp);
   rows.forEach(e=>frag.appendChild(entryEl(e)));
   if(figs.length){
    const h=document.createElement('div');h.className='galhead';h.textContent=`Figures from this section (${figs.length}) — tap to zoom`;frag.appendChild(h);
    const g=document.createElement('div');g.className='gallery';
    figs.forEach(f=>{const c=document.createElement('button');c.className='gcell';
     c.innerHTML=`<img src="${DATA.images[f.k]}" alt="" loading="lazy" decoding="async"><span class="gc">${esc(f.num)}${f.cap?' · '+esc(f.cap):''}</span>`;
     c.onclick=()=>viewer(f.k,`${man} ${f.num}`+(f.cap?' · '+f.cap:''));g.appendChild(c);});
    frag.appendChild(g);
   }
  }
 } else if(tab==='pmcs'){
  renderPmcs(frag);
 } else if(tab==='tools'){
  countEl.textContent='Field tools — converter & production estimates';
  const ch=document.createElement('div');ch.className='idxhead toolcat first';ch.textContent='Unit converter';frag.appendChild(ch);frag.appendChild(makeConverter());
  ['Horizontal','Vertical'].forEach((cat)=>{const h=document.createElement('div');h.className='idxhead toolcat';h.textContent=cat+' engineering';frag.appendChild(h);TOOLS.filter(t=>t.cat===cat).forEach(t=>frag.appendChild(toolCard(t)));});
  const n=document.createElement('p');n.className='src';n.style.margin='16px 2px';n.textContent='These follow the formulas in the referenced manuals. Enter the job factors (swell, shrinkage, efficiency, mix, waste) from your manual — the tool does the math. Verify critical estimates against the source.';frag.appendChild(n);
 } else if(tab==='extras'){
  const sub=document.createElement('div');sub.className='srow';
  [['tables','Tables'],['glossary','Glossary']].forEach(([k,label])=>{const b=document.createElement('button');b.className='chip';b.setAttribute('aria-pressed',extraSub===k?'true':'false');b.textContent=label;b.onclick=()=>{extraSub=k;lsSet('efr-extrasub',k);render();window.scrollTo(0,0);};sub.appendChild(b);});
  frag.appendChild(sub);
  if(extraSub==='tables'){
   const mf=lsGet('efr-tblman','');
   const chips=document.createElement('div');chips.className='srow';
   const allb=document.createElement('button');allb.className='chip';allb.setAttribute('aria-pressed',mf===''?'true':'false');allb.textContent='All manuals';allb.onclick=()=>{lsSet('efr-tblman','');render();};chips.appendChild(allb);
   MAN_ORDER_JS.filter(mk=>DATA.tables.some(t=>t.doc===mk)).forEach(mk=>{const b=document.createElement('button');b.className='chip';b.setAttribute('aria-pressed',mf===mk?'true':'false');b.textContent=(MANFULL[mk]||{name:mk}).name;b.onclick=()=>{lsSet('efr-tblman',mk);render();};chips.appendChild(b);});
   frag.appendChild(chips);
   const rows=DATA.tables.filter(t=>!mf||t.doc===mf);
   countEl.textContent=rows.length+' tables'+(mf?' in '+(MANFULL[mf]||{name:mf}).name:'');
   rows.forEach(t=>{const el=document.createElement('div');el.className='tbl';el.innerHTML=`<div class="cap">${esc(t.t)}. ${esc(t.cap)}</div><img src="${DATA.images[t.img]}" alt="" loading="lazy" decoding="async">`;el.onclick=()=>viewer(t.img,t.t+'. '+t.cap);frag.appendChild(el);});
  } else {
   const rows=DATA.glossary;
   countEl.textContent=rows.length+' terms';
   rows.forEach(g=>{const el=document.createElement('div');el.className='gitem';el.innerHTML=`<span class="t">${esc(g.t)}</span> &mdash; <span class="d">${esc(g.d)}</span>`;frag.appendChild(el);});
  }
 } else if(tab==='settings'){
  countEl.textContent='Settings';
  const sc=document.createElement('div');sc.className='shortcuts';
  const bb=document.createElement('button');bb.className='scut';bb.style.setProperty('--dc','#5a7d5a');bb.innerHTML=`<span class="si">&#128190;</span><span class="sl">Back up / restore</span><span class="sn">&rsaquo;</span>`;bb.onclick=openBackup;sc.appendChild(bb);
  frag.appendChild(sc);
  const n=document.createElement('p');n.className='src';n.style.margin='4px 2px 0';n.textContent='Your favorites, recents, and last position are stored only in this browser. Back them up before clearing your browser or switching devices.';frag.appendChild(n);
 }

 listEl.appendChild(frag);
}
listEl.addEventListener('click',e=>{
 const cp=e.target.closest('[data-copy]');if(cp){e.preventDefault();e.stopPropagation();copyTask(cp.dataset.copy);return;}
 const sh=e.target.closest('[data-share]');if(sh){e.preventDefault();e.stopPropagation();shareLink(sh.dataset.share);return;}
 const rp=e.target.closest('[data-report]');if(rp){e.preventDefault();e.stopPropagation();reportIssue(rp.dataset.report);return;}
 const st=e.target.closest('.star');if(st){e.preventDefault();e.stopPropagation();toggleFav(st.dataset.fid);st.classList.toggle('on');return;}
 const gl=e.target.closest('[data-gl]');if(gl){e.preventDefault();e.stopPropagation();showGloss(gl.dataset.gl);return;}
 const rf=e.target.closest('.ref');if(rf){e.preventDefault();e.stopPropagation();viewer(rf.dataset.k,rf.dataset.l);return;}
 const sp=e.target.closest('.step');if(sp){const li=sp,ul=li.closest('[data-steps]'),i=+li.dataset.i,cb=li.querySelector('input');
  if(e.target.tagName!=='INPUT')cb.checked=!cb.checked;
  const on=cb.checked;li.classList.toggle('done',on);setStep(ul.dataset.steps,i,on);return;}
 const b=e.target.closest('.pcell,.figbtn');if(b){e.preventDefault();viewer(b.dataset.fig,b.dataset.fig);}});
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected','false'));t.setAttribute('aria-selected','true');tab=t.dataset.tab;q='';$('#q').value='';$('#qx').style.display='none';$('#q').placeholder='Search everything…';render();window.scrollTo(0,0);});
$('#q').placeholder='Search everything…';
const qi=$('#q');qi.addEventListener('input',()=>{q=qi.value.trim().toLowerCase();$('#qx').style.display=q?'block':'none';render();});
$('#qx').onclick=()=>{qi.value='';q='';$('#qx').style.display='none';render();qi.focus();};
function showGloss(term){const d=GLOSSMAP[term.toLowerCase()];if(!d)return;$('#tipbody').innerHTML=`<b>${esc(term)}</b><p>${esc(d)}</p>`;$('#tipnext').textContent='Close';$('#tipnext').onclick=()=>{$('#tipsheet').hidden=true;};$('#tipsheet').hidden=false;guard();}
// contact sheet
$('#contact').onclick=()=>{$('#csheet').hidden=false;};
$('#cclose').onclick=()=>{$('#csheet').hidden=true;};
$('#csheet').addEventListener('click',e=>{if(e.target.id==='csheet')$('#csheet').hidden=true;});
$('#ccopy').onclick=async()=>{const em='Dylan.W.Lundquist.Mil@army.mil';try{await navigator.clipboard.writeText(em);$('#ccopy').textContent='Copied';setTimeout(()=>$('#ccopy').textContent='Copy',1500);}catch(e){const r=document.createRange();r.selectNodeContents($('.cmail a'));const s=getSelection();s.removeAllRanges();s.addRange(r);}};
function setBsta(msg,ok){const el=$('#bsta');el.textContent=msg||'';el.className='bsta'+(msg?(ok?' ok':' err'):'');}
function openBackup(){$('#csheet').hidden=true;try{$('#bcode').value=makeBackup();}catch(e){$('#bcode').value='';}$('#brest').value='';setBsta('');$('#bsheet').hidden=false;guard();}
function setOsta(m,ok){const el=$('#osta');el.textContent=m||'';el.className='bsta'+(m?(ok?' ok':' err'):'');}
function openOffline(){$('#csheet').hidden=true;const o=lsGet('efr-offline',null);setOsta(o?('All '+o.n+' figures & tables saved for offline use ✓'):'',true);$('#odl').textContent=o?'Refresh offline copy':'Download all for offline';$('#oprog').hidden=true;$('#obarfill').style.width='0%';$('#opct').textContent='0%';$('#osheet').hidden=false;guard();}
$('#oclose').onclick=()=>{$('#osheet').hidden=true;};
$('#osheet').addEventListener('click',e=>{if(e.target.id==='osheet')$('#osheet').hidden=true;});
$('#odl').onclick=async()=>{const b=$('#odl');b.disabled=true;$('#oprog').hidden=false;setOsta('');
 const urls=Object.values(DATA.images),total=urls.length;let done=0,i=0,cache=null;
 try{cache=await caches.open('efr-images-v1');}catch(e){}
 const upd=()=>{const p=total?Math.round(done/total*100):100;$('#obarfill').style.width=p+'%';$('#opct').textContent=p+'%';};
 async function worker(){while(i<urls.length){const u=urls[i++];try{if(cache){const hit=await cache.match(u);if(!hit){const r=await fetch(u,{cache:'reload'});if(r&&r.ok)await cache.put(u,r.clone());}}else{await fetch(u);}}catch(e){}done++;upd();}}
 try{await Promise.all([0,0,0,0,0,0].map(worker));lsSet('efr-offline',{n:total,ts:Date.now()});setOsta('All '+total+' figures & tables saved for offline use ✓',true);b.textContent='Refresh offline copy';}
 catch(e){setOsta('Download interrupted — tap again to resume.',false);}
 b.disabled=false;};
$('#bclose').onclick=()=>{$('#bsheet').hidden=true;};
$('#bsheet').addEventListener('click',e=>{if(e.target.id==='bsheet')$('#bsheet').hidden=true;});
$('#bcopy').onclick=async()=>{const t=$('#bcode');try{await navigator.clipboard.writeText(t.value);$('#bcopy').textContent='Copied';setTimeout(()=>$('#bcopy').textContent='Copy code',1500);}catch(e){t.focus();t.select();try{document.execCommand('copy');$('#bcopy').textContent='Copied';setTimeout(()=>$('#bcopy').textContent='Copy code',1500);}catch(_){}}};
$('#bdl').onclick=()=>{try{const blob=new Blob([$('#bcode').value],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='engineer-field-reference-backup.txt';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},800);setBsta('Backup file saved to your downloads.',true);}catch(e){setBsta('Could not save a file here — use Copy code instead.',false);}};
try{if(window.self!==window.top){$('#bdl').style.display='none';}}catch(e){}
$('#bfilebtn').onclick=()=>$('#bfile').click();
$('#bfile').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$('#brest').value=(r.result||'').toString();setBsta('File loaded — tap Restore to apply.',true);};r.onerror=()=>setBsta('Could not read that file.',false);r.readAsText(f);};
$('#bgo').onclick=()=>{if(applyBackup($('#brest').value)){setBsta('Restored ★ '+fav.size+' saved, '+recent.length+' recent.',true);setTimeout(()=>{$('#bsheet').hidden=true;render();window.scrollTo(0,0);},900);}else{setBsta('That code didn’t work — check you copied all of it.',false);}};
// ---- trap the back gesture: step back within the app, then confirm before leaving ----
let _leaving=false;
function guard(){try{history.pushState({g:1},'');}catch(e){}}
try{history.replaceState({app:1},'');guard();}catch(e){}
window.addEventListener('popstate',()=>{
 if(_leaving)return;
 if(!$('#leave').hidden){$('#leave').hidden=true;guard();return;}            // dismiss leave dialog = stay
 if($('#viewer').classList.contains('on')){$('#viewer').classList.remove('on');$('#vimg').src='';guard();return;}
 if(!$('#osheet').hidden){$('#osheet').hidden=true;guard();return;}
 if(!$('#bsheet').hidden){$('#bsheet').hidden=true;guard();return;}
 if(!$('#csheet').hidden){$('#csheet').hidden=true;guard();return;}
 if(tab==='pmcs'&&typeof pmView!=='undefined'&&pmView.s!=='list'){const m=document.querySelector('.pm-modal');if(m){m.remove();guard();return;}pmBack();guard();return;}
 if(special||disc||man){upLevel();guard();return;}                           // step up inside the app
 $('#leave').hidden=false;guard();                                           // at the top -> ask
});
$('#lcancel').onclick=()=>{$('#leave').hidden=true;};
$('#leave').addEventListener('click',e=>{if(e.target.id==='leave')$('#leave').hidden=true;});
$('#lyes').onclick=()=>{_leaving=true;$('#leave').hidden=true;history.go(-2);setTimeout(()=>{_leaving=false;try{window.close();}catch(e){}},500);};
const TIPS=[
 {i:'&#128269;',t:'Search finds everything',d:'Type in the search box from any tab and get matching tasks, tables, glossary terms, and tools together.'},
 {i:'&#9733;',t:'Star to save',d:'Tap the star on any task to keep it in your Saved list for fast access later.'},
 {i:'&#11015;',t:'Download for offline',d:'From the home screen, tap Offline to save every figure and table so the whole guide works with no signal.'}
];

// ================= PMCS module: guided PMCS -> faults -> DA Form 2404 =================
const PM_SESS='efr-pmcs-sess', PM_ADM='efr-pmcs-admin';
const PM_IVORDER=['Before','During','After','Weekly','Monthly','Quarterly','Semiannual','Annually','Periodic'];
const PM_IVLABEL={Periodic:'Periodic (hours / months)'};
const PM_SYMS=[
 {k:'X',g:'X',n:'X',d:'A deficiency in the equipment that places it in an inoperable status.'},
 {k:'CX',g:'⊗',n:'Circled X',d:'A deficiency, however the equipment may be operated under specific limitations as directed by higher authority or as prescribed locally, until corrective action can be accomplished.'},
 {k:'/',g:'/',n:'Diagonal',d:'A material defect other than a deficiency which must be corrected to increase efficiency or to make the item completely serviceable.'},
 {k:'-',g:'–',n:'Dash',d:'A required inspection, component replacement, maintenance operation check, or test flight is due but has not been accomplished, or an overdue MWO has not been accomplished.'}
];
let pmData=null, pmView={s:'list'}, pmSess=null, pmMsg='', pmFaultOpen=false, pmFaultSym='', pmPdf=null;
function pmAll(){return lsGet(PM_SESS,{});}
function pmSave(){if(!pmView.eq)return;const a=pmAll();a[pmView.eq]=pmSess;lsSet(PM_SESS,a);}
function pmLoadData(){
 if(pmData)return Promise.resolve(pmData);
 if(window.__PMCS__){pmData=window.__PMCS__;pmPrep();return Promise.resolve(pmData);}
 return fetch('pmcs.json?v='+encodeURIComponent(window.__BUILD__||''),{cache:'no-cache'}).then(r=>{if(!r.ok)throw 0;return r.json();}).then(d=>{pmData=d;pmPrep();return d;});
}
function pmPrep(){pmData.equip.forEach(e=>{const seen={};e.steps.forEach((s,i)=>{let k=s.id;if(seen[k]){seen[k]++;k=s.id+'#'+seen[k];}else seen[k]=1;s.key=k;s.i=i;});});}
function pmEq(id){return pmData.equip.find(e=>e.id===id);}
function pmIvs(e){const set={};e.steps.forEach(s=>s.iv.forEach(i=>{set[i]=(set[i]||0)+1;}));return PM_IVORDER.filter(i=>set[i]).map(i=>[i,set[i]]);}
function pmSteps(e,ivs){return e.steps.filter(s=>s.iv.some(i=>ivs.includes(i)));}
function pmCounts(e,sess){const st=pmSteps(e,sess.iv);let ok=0,f=0,na=0;st.forEach(s=>{const a=sess.ans[s.key];if(!a)return;if(a.r==='ok')ok++;else if(a.r==='fault')f++;else na++;});return{total:st.length,ok,f,na,left:st.length-ok-f-na};}
function pmEsc(s){return esc(s==null?'':s);}
function pmTop(){window.scrollTo(0,0);}

function renderPmcs(frag){
 countEl.textContent='PMCS — guided checks & DA Form 2404';
 const w=document.createElement('div');w.className='pm-wrap';frag.appendChild(w);
 if(!pmData){w.innerHTML='<div class="empty">Loading PMCS data…</div>';
  pmLoadData().then(()=>render()).catch(()=>{w.innerHTML='<div class="empty">PMCS data could not be loaded. Connect once, or tap Download TMs for offline use on the Guide tab, then reopen this tab.</div>';});return;}
 const v=pmView;
 if(v.s==='list')pmList(w);
 else if(v.s==='intro')pmIntro(w);
 else if(v.s==='step')pmStep(w);
 else if(v.s==='review')pmReview(w);
 else if(v.s==='admin')pmAdmin(w);
 else if(v.s==='done')pmDone(w);
}
function pmGo(s,extra){Object.assign(pmView,extra||{});pmView.s=s;pmMsg='';render();pmTop();}
function pmBack(){
 const s=pmView.s;
 if(s==='step'){pmGo('list');return;}
 if(s==='review'){pmGo('step',{});return;}
 if(s==='admin'){pmGo('review');return;}
 if(s==='done'){pmGo('admin');return;}
 pmGo('list');
}

// ---------- 1. equipment list ----------
function pmList(w){
 const intro=document.createElement('p');intro.className='pm-note';
 intro.textContent='Pick your equipment, choose the PMCS interval, and step through every check in the TM. Record faults as you go; at the end the app fills out a DA Form 2404 you can download or email.';
 w.appendChild(intro);
 const groups=[['Construction equipment',['d6k','deuce','hmee','loader']],['Vehicles',['hmmwv','m915','dump']]];
 const all=pmAll();
 groups.forEach(([gname,ids])=>{
  const h=document.createElement('div');h.className='pm-h';h.textContent=gname;w.appendChild(h);
  ids.map(pmEq).filter(Boolean).forEach(e=>{
   const b=document.createElement('button');b.className='pm-eq';
   const ss=all[e.id];let res='';
   if(ss&&ss.ans&&Object.keys(ss.ans).length){const c=pmCounts(e,ss);res=`<span class="resume">Resume — ${c.total-c.left} of ${c.total} done${c.f?' · '+c.f+' fault'+(c.f===1?'':'s'):''}</span>`;}
   b.innerHTML=`<div class="t"><span class="n">${pmEsc(e.name)}</span><span class="c">${e.steps.length} checks</span></div><div class="s">${pmEsc(e.sub)}</div><div class="tm">${pmEsc(e.tm)}${e.date?' · '+pmEsc(e.date):''}</div>${res}`;
   b.onclick=()=>{pmView={s:'intro',eq:e.id};pmSess=all[e.id]||null;pmGo('intro');};
   w.appendChild(b);
  });
 });
 const n=document.createElement('p');n.className='pm-note';
 n.textContent='Every check, procedure and “not fully mission capable” condition comes straight from the TM listed on each card. Always follow the full TM for the vehicle or machine in front of you.';
 w.appendChild(n);
}

// ---------- 2. interval picker ----------
function pmIntro(w){
 const e=pmEq(pmView.eq);
 const ex=pmSess;
 const back=document.createElement('button');back.className='pm-lk';back.textContent='‹ All equipment';back.onclick=()=>pmGo('list');w.appendChild(back);
 const c=document.createElement('div');c.className='pm-card';
 c.innerHTML=`<div class="pm-loc">${pmEsc(e.tm)}${e.date?' · '+pmEsc(e.date):''}</div><div class="pm-title">${pmEsc(e.name)}</div><div class="s" style="color:var(--muted);font-size:13px">${pmEsc(e.sub)}</div>`;
 w.appendChild(c);
 const ivs=pmIvs(e);
 let sel=(ex&&ex.iv)||[(ivs.find(x=>x[0]==='Before')||ivs[0])[0]];
 const h=document.createElement('div');h.className='pm-h';h.textContent='Which PMCS are you doing?';w.appendChild(h);
 const row=document.createElement('div');row.className='pm-ivrow';w.appendChild(row);
 const cnt=document.createElement('p');cnt.className='pm-note';w.appendChild(cnt);
 function paint(){
  row.innerHTML='';
  ivs.forEach(([i,n])=>{const b=document.createElement('button');b.setAttribute('aria-pressed',sel.includes(i)?'true':'false');b.textContent=(PM_IVLABEL[i]||i)+' ('+n+')';b.onclick=()=>{sel=sel.includes(i)?sel.filter(x=>x!==i):sel.concat(i);if(!sel.length)sel=[i];paint();};row.appendChild(b);});
  const n=pmSteps(e,sel).length;cnt.textContent=n+' check'+(n===1?'':'s')+' selected. You can pick more than one interval; checks stay in TM order.';
  go.disabled=!n;
 }
 const go=document.createElement('button');go.className='pm-btn';
 const stNote=(()=>{if(!ex||!ex.ans||!Object.keys(ex.ans).length)return '';const cc=pmCounts(e,ex);return cc.total-cc.left;})();
 go.textContent=stNote?'Resume where I left off':'Start PMCS';
 paint();
 go.onclick=()=>{
  const same=ex&&JSON.stringify(ex.iv.slice().sort())===JSON.stringify(sel.slice().sort());
  if(!same){ if(ex&&Object.keys(ex.ans||{}).length&&!confirm('Changing the interval starts a new inspection and clears the one in progress. Continue?'))return; pmSess={iv:sel,idx:0,ans:{},admin:null,ts:Date.now(),build:window.__BUILD__||''}; }
  else{ pmSess.iv=sel; }
  pmSave();
  const st=pmSteps(e,pmSess.iv);
  pmView.idx=Math.min(pmSess.idx||0,st.length-1);
  pmGo('step');
 };
 w.appendChild(go);
 if(ex&&Object.keys(ex.ans||{}).length){const nb=document.createElement('button');nb.className='pm-btn sec';nb.textContent='Discard saved inspection';nb.onclick=()=>{if(!confirm('Discard the inspection in progress for this equipment?'))return;const a=pmAll();delete a[e.id];lsSet(PM_SESS,a);pmSess=null;pmGo('intro');};w.appendChild(nb);}
 if(e.preface){const h2=document.createElement('div');h2.className='pm-h';h2.textContent='From the TM — read first';w.appendChild(h2);const p=document.createElement('div');p.className='pm-pre';p.textContent=e.preface.replace(/\s*•\s*/g,'\n• ').trim();w.appendChild(p);}
 const src=document.createElement('p');src.className='pm-note';src.textContent=`Source: ${e.tm}, ${e.table}, pp. ${e.pages} of the PDF supplied.`;w.appendChild(src);
}

// ---------- 3. guided step ----------
function pmCoHtml(b){
 const lab={warning:'WARNING',caution:'CAUTION',notice:'NOTICE',note:'NOTE'}[b.k]||b.k.toUpperCase();
 const paras=b.t.split('\n').map(x=>`<p>${pmEsc(x)}</p>`).join('');
 return `<div class="pm-co ${b.k}"><b>${lab}</b>${paras}</div>`;
}
function pmStepHtml(s){
 let html='';
 s.proc.forEach(b=>{
  if(b.k==='who')return;
  if(b.k==='step'){
   const m=b.t.match(/^([a-z]\.|\(\d+[A-Z]?\)|\d+\.)\s*(.*)$/s);
   html+=m?`<p class="pm-p"><b>${pmEsc(m[1])}</b> ${pmEsc(m[2])}</p>`:`<p class="pm-p">${pmEsc(b.t)}</p>`;
  } else html+=pmCoHtml(b);
 });
 return html;
}
function pmNfHtml(t){
 if(!t)return '';
 const parts=t.split(/\n|(?<=[.;])\s+(?=[a-z]\.\s)/).filter(Boolean);
 return `<div class="pm-nf"><b>NOT FULLY MISSION CAPABLE IF</b>${parts.map(x=>`<p>${pmEsc(x)}</p>`).join('')}</div>`;
}
function pmStep(w){
 const e=pmEq(pmView.eq),st=pmSteps(e,pmSess.iv);
 let i=Math.max(0,Math.min(pmView.idx||0,st.length-1));pmView.idx=i;pmSess.idx=i;pmSave();
 const s=st[i],a=pmSess.ans[s.key];
 const c=pmCounts(e,pmSess);
 const bar=document.createElement('div');bar.className='pm-bar';
 bar.innerHTML=`<div class="top"><span><b>${pmEsc(e.name)}</b> · check ${i+1} of ${st.length}${c.f?' · <span style="color:#a43a30">'+c.f+' fault'+(c.f===1?'':'s')+'</span>':''}</span><span><button class="pm-lk" data-a="list">☰ Steps</button><button class="pm-lk" data-a="exit">Exit</button></span></div><div class="pm-prog"><i style="width:${Math.round((st.length-c.left)/st.length*100)}%"></i></div>`;
 w.appendChild(bar);
 bar.querySelector('[data-a=list]').onclick=()=>pmJumpList(e,st);
 bar.querySelector('[data-a=exit]').onclick=()=>pmGo('list');
 const card=document.createElement('div');card.className='pm-card';
 const who=s.proc.filter(b=>b.k==='who').map(b=>b.t);
 const chips=[`<span>Item ${pmEsc(s.id)}</span>`].concat(s.iv.map(x=>`<span>${pmEsc(x)}</span>`),(s.tbl?[`<span>${pmEsc(s.tbl)}</span>`]:[]),who.map(x=>`<span class="who">${pmEsc(x)}</span>`));
 if(s.ivraw&&/Every/.test(s.ivraw))chips.push(`<span>${pmEsc(s.ivraw)}</span>`);
 if(s.mh)chips.push(`<span>${pmEsc(s.mh)} man-hr</span>`);
 card.innerHTML=`${s.loc?`<div class="pm-loc">${pmEsc(s.loc)}</div>`:''}<div class="pm-title">${pmEsc(s.check)||'Check'}</div><div class="pm-chips">${chips.join('')}</div>${pmStepHtml(s)}${pmNfHtml(s.nfmc)}<div class="pm-note" style="margin:8px 0 0">${pmEsc(e.tm)} · PDF p. ${s.pg}</div>`;
 w.appendChild(card);
 // current answer state
 if(a&&a.r==='fault'&&!pmFaultOpen){
  const f=a.f;
  const fi=document.createElement('div');fi.className='pm-fi';
  fi.innerHTML=`<div class="sy">${pmSymGlyph(f.sym)}</div><div class="bd"><div class="it">FAULT RECORDED</div>${pmEsc(f.def)}${f.corr?'<br><i>Corrective action: '+pmEsc(f.corr)+'</i>':''}</div>`;
  w.appendChild(fi);
 } else if(a&&a.r==='ok'){w.insertAdjacentHTML('beforeend','<div class="pm-msg ok">Marked OK.</div>');}
 else if(a&&a.r==='na'){w.insertAdjacentHTML('beforeend','<div class="pm-msg">Marked N/A (not installed or not applicable).</div>');}
 if(pmFaultOpen){pmFaultForm(w,s,a);}
 else{
  const row=document.createElement('div');row.className='pm-row';
  const ok=document.createElement('button');ok.className='pm-btn ok';ok.textContent='✔ OK';ok.onclick=()=>{pmAns(s,{r:'ok'});pmNext(st);};
  const bad=document.createElement('button');bad.className='pm-btn bad';bad.textContent='✖ Fault';bad.onclick=()=>{pmFaultOpen=true;pmFaultSym=(a&&a.f&&a.f.sym)||'';render();};
  row.appendChild(ok);row.appendChild(bad);w.appendChild(row);
  const na=document.createElement('button');na.className='pm-btn na';na.style.minHeight='42px';na.style.fontSize='14px';na.textContent='N/A — not installed / not applicable';na.onclick=()=>{pmAns(s,{r:'na'});pmNext(st);};w.appendChild(na);
  const nav=document.createElement('div');nav.className='pm-row';nav.style.marginTop='8px';
  const pv=document.createElement('button');pv.className='pm-lk';pv.textContent='‹ Previous';pv.disabled=i===0;pv.style.visibility=i===0?'hidden':'visible';pv.onclick=()=>{pmView.idx=i-1;render();pmTop();};
  const nx=document.createElement('button');nx.className='pm-lk';nx.style.textAlign='right';nx.textContent=i===st.length-1?'Finish ›':'Skip ›';nx.onclick=()=>pmNext(st);
  nav.appendChild(pv);nav.appendChild(nx);w.appendChild(nav);
 }
}
function pmSymGlyph(k){const x=PM_SYMS.find(y=>y.k===k);return x?x.g:'';}
function pmAns(s,a){pmSess.ans[s.key]=a;pmSave();}
function pmNext(st){
 const i=pmView.idx;
 if(i>=st.length-1){pmGo('review');return;}
 pmView.idx=i+1;pmFaultOpen=false;render();pmTop();
}
function pmFaultForm(w,s,a){
 const f=(a&&a.f)||{sym:'',def:'',corr:''};
 const d=document.createElement('div');d.className='pm-fault';
 d.innerHTML=`<h4>Record the fault — Item ${pmEsc(s.id)}</h4>
 <label>Status symbol (DA Form 2404 legend)</label><div class="pm-sym"></div><div class="pm-symhelp"></div>
 <label for="pmdef">Deficiency / shortcoming (column c)</label><textarea id="pmdef" placeholder="What is wrong? Be specific (location, what you saw/heard/measured)."></textarea>
 <label for="pmcor">Corrective action (column d) — optional</label><textarea id="pmcor" style="min-height:56px" placeholder="Leave blank if you are reporting only. Fill in if you fixed it."></textarea>`;
 w.appendChild(d);
 const sy=d.querySelector('.pm-sym'),hp=d.querySelector('.pm-symhelp'),de=d.querySelector('#pmdef'),co=d.querySelector('#pmcor');
 de.value=f.def||'';co.value=f.corr||'';
 function paint(){sy.innerHTML='';PM_SYMS.forEach(x=>{const b=document.createElement('button');b.type='button';b.innerHTML=x.g;b.title=x.n;b.setAttribute('aria-label',x.n);b.setAttribute('aria-pressed',pmFaultSym===x.k?'true':'false');b.onclick=()=>{pmFaultSym=x.k;paint();};sy.appendChild(b);});
  const x=PM_SYMS.find(y=>y.k===pmFaultSym);hp.innerHTML=x?`<b>${pmEsc(x.n)}</b> — ${pmEsc(x.d)}`:'Pick the symbol that fits. If it matches the red “not fully mission capable” condition above, tell your supervisor.';}
 paint();
 const row=document.createElement('div');row.className='pm-row';
 const sv=document.createElement('button');sv.className='pm-btn bad';sv.textContent='Save fault';
 sv.onclick=()=>{
  if(!pmFaultSym){hp.innerHTML='<b style="color:#a43a30">Choose a status symbol first.</b>';return;}
  if(!de.value.trim()){de.focus();de.style.borderColor='#a43a30';return;}
  pmAns(s,{r:'fault',f:{sym:pmFaultSym,def:de.value.trim(),corr:co.value.trim(),ts:Date.now()}});
  pmFaultOpen=false;pmFaultSym='';pmNext(pmSteps(pmEq(pmView.eq),pmSess.iv));
 };
 const cn=document.createElement('button');cn.className='pm-btn sec';cn.textContent='Cancel';cn.onclick=()=>{pmFaultOpen=false;render();};
 row.appendChild(sv);row.appendChild(cn);w.appendChild(row);
 if(a&&a.r==='fault'){const rm=document.createElement('button');rm.className='pm-btn sec';rm.textContent='Remove this fault (mark OK)';rm.onclick=()=>{pmAns(s,{r:'ok'});pmFaultOpen=false;render();};w.appendChild(rm);}
}
function pmJumpList(e,st){
 const m=document.createElement('div');m.className='pm-modal';
 const inner=document.createElement('div');m.appendChild(inner);
 inner.innerHTML=`<h3>${pmEsc(e.name)} — all checks</h3>`;
 st.forEach((s,i)=>{const a=pmSess.ans[s.key];const b=document.createElement('button');b.className='pm-jump'+(i===pmView.idx?' cur':'');
  b.innerHTML=`<span class="st ${a?a.r:''}">${a?(a.r==='ok'?'✔':a.r==='fault'?'✖':'–'):'○'}</span><span class="id">${pmEsc(s.id)}</span><span>${pmEsc(s.check||s.proc.map(p=>p.t).join(' ').slice(0,60))}</span>`;
  b.onclick=()=>{m.remove();pmFaultOpen=false;pmView.idx=i;render();pmTop();};inner.appendChild(b);});
 const cl=document.createElement('button');cl.className='pm-btn sec';cl.textContent='Close';cl.onclick=()=>m.remove();inner.appendChild(cl);
 m.addEventListener('click',ev=>{if(ev.target===m)m.remove();});
 document.body.appendChild(m);
 const cur=inner.querySelector('.cur');if(cur)cur.scrollIntoView({block:'center'});
}

// ---------- 4. review ----------
function pmReview(w){
 const e=pmEq(pmView.eq),st=pmSteps(e,pmSess.iv),c=pmCounts(e,pmSess);
 const t=document.createElement('div');t.className='pm-h';t.textContent=`${e.name} — review`;w.appendChild(t);
 const stat=document.createElement('div');stat.className='pm-stat';
 stat.innerHTML=`<div><b>${c.ok}</b><span>OK</span></div><div><b style="color:#a43a30">${c.f}</b><span>Faults</span></div><div><b>${c.na}</b><span>N/A</span></div><div><b${c.left?' style="color:#c68a12"':''}>${c.left}</b><span>Not done</span></div>`;
 w.appendChild(stat);
 if(c.left){const m=document.createElement('div');m.className='pm-msg err';m.textContent=`${c.left} check${c.left===1?'':'s'} not answered yet. Go back and finish them, or continue — unanswered checks are not written on the form.`;w.appendChild(m);
  const fb=document.createElement('button');fb.className='pm-btn sec';fb.textContent='Go to first unanswered check';fb.onclick=()=>{const k=st.findIndex(s=>!pmSess.ans[s.key]);pmView.idx=Math.max(0,k);pmGo('step');};w.appendChild(fb);}
 const fl=st.filter(s=>pmSess.ans[s.key]&&pmSess.ans[s.key].r==='fault');
 const h=document.createElement('div');h.className='pm-h';h.textContent=fl.length?'Faults that will go on the form':'No faults recorded';w.appendChild(h);
 fl.forEach(s=>{const f=pmSess.ans[s.key].f;const d=document.createElement('div');d.className='pm-fi';
  d.innerHTML=`<div class="sy">${pmSymGlyph(f.sym)}</div><div class="bd"><div class="it">ITEM ${pmEsc(s.id)} · ${pmEsc(s.check)}</div>${pmEsc(f.def)}${f.corr?'<br><i>Corrective action: '+pmEsc(f.corr)+'</i>':''}<div><button class="pm-lk" data-i="${s.i}">Edit</button></div></div>`;
  d.querySelector('[data-i]').onclick=()=>{pmView.idx=st.findIndex(x=>x.key===s.key);pmFaultOpen=true;pmFaultSym=f.sym;pmGo('step');};
  w.appendChild(d);});
 const go=document.createElement('button');go.className='pm-btn';go.textContent=fl.length?'Fill out DA Form 2404 ›':'Create a no-fault DA Form 2404 ›';go.onclick=()=>pmGo('admin');w.appendChild(go);
 const bk=document.createElement('button');bk.className='pm-btn sec';bk.textContent='‹ Back to checks';bk.onclick=()=>{pmView.idx=Math.max(0,st.length-1);pmGo('step');};w.appendChild(bk);
}

// ---------- 5. admin data ----------
function pmToday(){const d=new Date();return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');}
function pmTmDate(e){
 const m=(e.date||'').match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})/);
 const mon={JANUARY:1,FEBRUARY:2,MARCH:3,APRIL:4,MAY:5,JUNE:6,JULY:7,AUGUST:8,SEPTEMBER:9,OCTOBER:10,NOVEMBER:11,DECEMBER:12};
 if(m&&mon[m[2].toUpperCase()])return m[3]+String(mon[m[2].toUpperCase()]).padStart(2,'0')+String(m[1]).padStart(2,'0');
 const m2=(e.date||'').match(/^([A-Za-z]+) (\d{4})/);
 if(m2&&mon[m2[1].toUpperCase()])return m2[2]+String(mon[m2[1].toUpperCase()]).padStart(2,'0');
 return '';
}
function pmAdmin(w){
 const e=pmEq(pmView.eq);
 const g=lsGet(PM_ADM,{});
 const a=Object.assign({org:g.org||'',inspector:g.inspector||'',email:g.email||'',model:e.name+(e.sub?' — '+e.sub:''),serial:'',miles:'',hours:'',rounds:'',hot:'',date:pmToday(),type:pmSess.iv.join('/').toUpperCase(),tm1:e.tm,tmd1:pmTmDate(e),tm2:'',tmd2:'',time1:'',mh:''},pmSess.admin||{});
 const t=document.createElement('div');t.className='pm-h';t.textContent='DA Form 2404 — equipment data';w.appendChild(t);
 const p=document.createElement('p');p.className='pm-note';p.textContent='Fill in what you know; everything is optional and you can type over any pre-filled box. Your faults are already entered.';w.appendChild(p);
 const f=document.createElement('div');f.className='pm-form';
 const fld=(k,label,ph,extra)=>`<div><label for="pa_${k}">${label}</label><input id="pa_${k}" data-k="${k}" value="${pmEsc(a[k])}" placeholder="${pmEsc(ph||'')}" ${extra||''} autocomplete="off" autocapitalize="characters"></div>`;
 f.innerHTML=`${fld('org','1. Organization','e.g. 1-1 EN BN, A CO')}
 ${fld('model','2. Nomenclature and model','')}
 ${fld('serial','3. Registration / serial / NSN','Bumper no., serial no., or NSN')}
 <div class="g2">${fld('miles','4a. Miles','','inputmode="numeric"')}${fld('hours','4b. Hours','','inputmode="decimal"')}</div>
 <div class="g2">${fld('rounds','4c. Rounds fired','','inputmode="numeric"')}${fld('hot','4d. Hot starts','','inputmode="numeric"')}</div>
 <div class="g2">${fld('date','5. Date (YYYYMMDD)','','inputmode="numeric"')}${fld('type','6. Type inspection','')}</div>
 <div class="g2">${fld('tm1','7. TM number','')}${fld('tmd1','TM date (YYYYMMDD)','','inputmode="numeric"')}</div>
 <div class="hint">TM date: ${e.date?'the manual prints “'+pmEsc(e.date)+'”':'not printed on the pages supplied'}; add the day if the TM cover gives it, or the date of your latest change.</div>
 <div class="g2">${fld('tm2','TM number (2nd, optional)','')}${fld('tmd2','TM date (2nd)','','inputmode="numeric"')}</div>
 ${fld('inspector','8a. Person performing inspection (printed name)','e.g. SPC SMITH, J.')}
 <div class="g2">${fld('time1','8b. Time (HHMM)','','inputmode="numeric"')}${fld('mh','10. Man-hours required','','inputmode="decimal"')}</div>
 ${fld('email','Email the form to (optional)','name@army.mil','type="email" inputmode="email" autocapitalize="none"')}
 <div class="hint">Signature boxes are left blank — print and sign, or sign in your maintenance system.</div>`;
 w.appendChild(f);
 const read=()=>{f.querySelectorAll('input[data-k]').forEach(i=>{a[i.dataset.k]=i.value;});pmSess.admin=Object.assign({},a);delete pmSess.admin.org;delete pmSess.admin.inspector;delete pmSess.admin.email;pmSave();lsSet(PM_ADM,{org:a.org,inspector:a.inspector,email:a.email});};
 f.addEventListener('input',read);
 const go=document.createElement('button');go.className='pm-btn';go.textContent='Create DA Form 2404 ›';
 go.onclick=async()=>{read();go.disabled=true;go.textContent='Creating…';pmMsg='';
  try{pmPdf=await pmBuildPdf(e,a);pmGo('done');}catch(err){go.disabled=false;go.textContent='Create DA Form 2404 ›';const m=document.createElement('div');m.className='pm-msg err';m.textContent='Could not create the PDF: '+(err&&err.message||err);w.appendChild(m);console.error(err);}};
 w.appendChild(go);
 const bk=document.createElement('button');bk.className='pm-btn sec';bk.textContent='‹ Back to review';bk.onclick=()=>pmGo('review');w.appendChild(bk);
}

// ---------- 6. PDF ----------
function pmLoadLib(){
 if(window.PDFLib)return Promise.resolve();
 if(window.__PDFLIB_SRC__){try{(0,eval)(window.__PDFLIB_SRC__);}catch(e){return Promise.reject(e);}return window.PDFLib?Promise.resolve():Promise.reject(new Error('PDF library failed to start'));}
 return new Promise((res,rej)=>{const s=document.createElement('script');s.src='pdf-lib.min.js?v='+encodeURIComponent(window.__BUILD__||'');s.onload=()=>window.PDFLib?res():rej(new Error('PDF library missing'));s.onerror=()=>rej(new Error('PDF library not available offline yet — connect once and try again'));document.head.appendChild(s);});
}
function pmLoadForm(){
 if(window.__FORM_B64__){const b=atob(window.__FORM_B64__);const u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return Promise.resolve(u);}
 return fetch('da2404-blank.pdf?v='+encodeURIComponent(window.__BUILD__||'')).then(r=>{if(!r.ok)throw new Error('blank form not available');return r.arrayBuffer();}).then(b=>new Uint8Array(b));
}
function pmAscii(s){return String(s==null?'':s).replace(/[‘’ʼ]/g,"'").replace(/[“”]/g,'"').replace(/[–—−]/g,'-').replace(/•/g,'-').replace(/°/g,' deg').replace(/ /g,' ').replace(/[^\x20-\x7e]/g,'?');}
const PM_P1=[377.2,353.2,329.2,305.2,281.2,257.2,233.2,209.2,185.2,161.2,137.2,113.3,89.2,65.2,42.0];
const PM_P2=[726.5,702.5,677.9,653.3,629.3,604.7,580.1,555.5,531.5,506.9,482.3,458.3,433.7,409.1,384.5,360.5,335.9,311.3,287.3,262.7,238.1,213.5,189.5,164.9,140.3,116.3,91.7,67.1,42.0];
const PM_COL={id:[35,71.2],sym:[71.2,107.2],def:[107.2,301.5],cor:[301.5,510.3],ini:[510.3,575]};
const PM_HDR={org:[38,717,303,727],model:[308,717,574,727],serial:[38,692,185,702],miles:[188,692,234,702],hours:[239,692,285,702],rounds:[297,690,327,700],hot:[346,690,376,700],date:[399,692,464,702],type:[482,692,571,702],tm1:[38,656,213,666],tmd1:[228,656,293,666],tm2:[308,656,484,666],tmd2:[498,656,563,666],inspector:[38,424,220,444],time1:[225,418,275,448],mh:[518,416,568,446]};
function pmWrap(font,text,size,maxW){
 const words=pmAscii(text).replace(/\s+/g,' ').trim().split(' ');const lines=[];let cur='';
 words.forEach(wd=>{
  let t=cur?cur+' '+wd:wd;
  if(font.widthOfTextAtSize(t,size)<=maxW){cur=t;return;}
  if(cur){lines.push(cur);cur='';}
  while(font.widthOfTextAtSize(wd,size)>maxW){let k=wd.length;while(k>1&&font.widthOfTextAtSize(wd.slice(0,k),size)>maxW)k--;lines.push(wd.slice(0,k));wd=wd.slice(k);}
  cur=wd;});
 if(cur)lines.push(cur);return lines;
}
async function pmBuildPdf(e,a){
 await pmLoadLib();
 const tpl=await pmLoadForm();
 const {PDFDocument,StandardFonts,rgb}=window.PDFLib;
 const doc=await PDFDocument.load(tpl);
 const font=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 const ink=rgb(0.04,0.1,0.45);
 // gather faults
 const st=pmSteps(e,pmSess.iv);
 const faults=st.filter(s=>pmSess.ans[s.key]&&pmSess.ans[s.key].r==='fault').map(s=>Object.assign({s},pmSess.ans[s.key].f));
 // lay out rows: each fault may need >1 row
 const rows=[];
 const defW=PM_COL.def[1]-PM_COL.def[0]-6,corW=PM_COL.cor[1]-PM_COL.cor[0]-6,SZ=7.2,LINE=8.3,MAXL=2; // lines per row
 faults.forEach(f=>{
  const dl=pmWrap(font,f.def,SZ,defW),cl=pmWrap(font,f.corr||'',SZ,corW);
  const n=Math.max(1,Math.ceil(dl.length/MAXL),Math.ceil(cl.length/MAXL));
  for(let r=0;r<n;r++)rows.push({id:r===0?f.s.id:'',sym:r===0?f.sym:'',def:dl.slice(r*MAXL,r*MAXL+MAXL),cor:cl.slice(r*MAXL,r*MAXL+MAXL),cont:r>0});
 });
 const total=rows.length;
 const pageCount=Math.max(2,1+Math.max(0,Math.ceil((total-14)/28)));   // the printed form is 2 pages; keep both so its own footer stays true
 // make pages: template has p1 + p2; add copies of p2 as needed
 let tplP2=null;
 if(pageCount>2){for(let i=2;i<pageCount;i++){const [c]=await doc.copyPages(doc,[1]);doc.addPage(c);}}
 const pages=doc.getPages();
 // renumber page footer
 if(pageCount>2)pages.forEach((pg,i)=>{
  pg.drawRectangle({x:524,y:30,width:52,height:9,color:rgb(1,1,1)});
  pg.drawText('PAGE '+(i+1)+' OF '+pageCount,{x:526,y:31.2,size:8,font:bold,color:rgb(0,0,0)});
 });
 // header
 const p1=pages[0];
 const put=(k,val,size)=>{const r=PM_HDR[k];if(!r||!val)return;const t=pmAscii(val);let sz=size||9;const w=r[2]-r[0]-2;while(sz>5&&font.widthOfTextAtSize(t,sz)>w)sz-=.5;p1.drawText(t,{x:r[0]+1,y:r[1]+2,size:sz,font,color:ink});};
 ['org','model','serial','miles','hours','rounds','hot','date','type','tm1','tmd1','tm2','tmd2'].forEach(k=>put(k,a[k]));
 // 8a printed name, 8b time, 10 manhours (inside taller boxes)
 const box=(k,val,size)=>{const r=PM_HDR[k];if(!r||!val)return;const t=pmAscii(val);let sz=size||9;const w=r[2]-r[0]-2;while(sz>5&&font.widthOfTextAtSize(t,sz)>w)sz-=.5;p1.drawText(t,{x:r[0]+1,y:r[1]+2,size:sz,font,color:ink});};
 box('inspector',a.inspector,8);box('time1',a.time1,9);box('mh',a.mh,9);
 // rows
 const bounds=[PM_P1,PM_P2];
 rows.forEach((r,idx)=>{
  let pi,ri;if(idx<14){pi=0;ri=idx;}else{const k=idx-14;pi=1+Math.floor(k/28);ri=k%28;}
  const B=pi===0?PM_P1:PM_P2;const top=B[ri],bot=B[ri+1];const pg=pages[pi];
  if(r.id){let sz=8;while(sz>5&&bold.widthOfTextAtSize(pmAscii(r.id),sz)>(PM_COL.id[1]-PM_COL.id[0]-3))sz-=.5;pg.drawText(pmAscii(r.id),{x:PM_COL.id[0]+2,y:(top+bot)/2-sz/3,size:sz,font:bold,color:ink});}
  if(r.sym){const cx=(PM_COL.sym[0]+PM_COL.sym[1])/2,cy=(top+bot)/2;
   if(r.sym==='X'||r.sym==='CX'){const d=6;pg.drawLine({start:{x:cx-d,y:cy-d},end:{x:cx+d,y:cy+d},thickness:1.6,color:ink});pg.drawLine({start:{x:cx-d,y:cy+d},end:{x:cx+d,y:cy-d},thickness:1.6,color:ink});}
   if(r.sym==='CX')pg.drawEllipse({x:cx,y:cy,xScale:9.5,yScale:9.5,borderColor:ink,borderWidth:1.3});
   if(r.sym==='/')pg.drawLine({start:{x:cx-7,y:cy-8},end:{x:cx+7,y:cy+8},thickness:1.6,color:ink});
   if(r.sym==='-')pg.drawLine({start:{x:cx-8,y:cy},end:{x:cx+8,y:cy},thickness:1.6,color:ink});}
  const draw=(lines,col)=>{const n=lines.length;const h=n*LINE;let y=(top+bot)/2+h/2-SZ+0.8;lines.forEach(l=>{pg.drawText(l,{x:PM_COL[col][0]+3,y,size:SZ,font,color:ink});y-=LINE;});};
  draw(r.def,'def');draw(r.cor,'cor');
 });
 doc.setTitle('DA Form 2404 - '+pmAscii(e.name)+' - '+pmAscii(a.date));
 doc.setProducer('Engineer Field Reference');
 const bytes=await doc.save();
 return {bytes,pages:pageCount,faults:faults.length,rows:total,name:'DA2404_'+e.id.toUpperCase()+'_'+(a.date||pmToday())+'.pdf',admin:a,eq:e};
}

// ---------- 7. done: download / email ----------
function pmDone(w){
 const r=pmPdf,e=r.eq;
 const d=document.createElement('div');d.className='pm-done';
 d.innerHTML=`<div class="big">✅</div><div class="pm-title">DA Form 2404 is ready</div><p class="pm-note">${pmEsc(e.name)} · ${r.faults} fault${r.faults===1?'':'s'} · ${r.pages} page${r.pages===1?'':'s'}</p>`;
 w.appendChild(d);
 const blob=new Blob([r.bytes],{type:'application/pdf'});
 const file=(()=>{try{return new File([blob],r.name,{type:'application/pdf'});}catch(x){return null;}})();
 const dl=document.createElement('button');dl.className='pm-btn';dl.textContent='⬇ Download PDF';
 dl.onclick=()=>{const u=URL.createObjectURL(blob);const x=document.createElement('a');x.href=u;x.download=r.name;document.body.appendChild(x);x.click();setTimeout(()=>{URL.revokeObjectURL(u);x.remove();},1500);pmNote('Saved to your downloads as '+r.name,true);};
 w.appendChild(dl);
 const em=document.createElement('button');em.className='pm-btn sec';em.textContent='✉ Email / share';
 em.onclick=async()=>{
  const subj='DA Form 2404 - '+e.name+' - '+r.admin.date;
  const body='DA Form 2404 for '+e.name+' ('+e.tm+') dated '+r.admin.date+' is attached. '+r.faults+' fault'+(r.faults===1?'':'s')+' recorded.';
  try{
   if(file&&navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:subj,text:body});pmNote('Shared.',true);return;}
  }catch(x){if(x&&x.name==='AbortError')return;}
  // fallback: download then open mail client (a link cannot attach files)
  dl.onclick();
  const to=r.admin.email||'';
  setTimeout(()=>{location.href='mailto:'+encodeURIComponent(to).replace(/%40/g,'@')+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body+'\n\n(Attach the PDF you just downloaded: '+r.name+')');},600);
  pmNote('Your device cannot attach files from a web page. The PDF was downloaded — attach it in the email that opens.',true);
 };
 w.appendChild(em);
 const msg=document.createElement('div');msg.id='pmmsg';w.appendChild(msg);
 if(pmMsg)msg.innerHTML=pmMsg;
 const open=document.createElement('button');open.className='pm-btn sec';open.textContent='Open / preview PDF';open.onclick=()=>{const u=URL.createObjectURL(blob);window.open(u,'_blank');setTimeout(()=>URL.revokeObjectURL(u),60000);};w.appendChild(open);
 const bk=document.createElement('button');bk.className='pm-btn sec';bk.textContent='‹ Edit equipment data';bk.onclick=()=>pmGo('admin');w.appendChild(bk);
 const fin=document.createElement('button');fin.className='pm-btn sec';fin.textContent='Finished — clear this inspection';fin.onclick=()=>{if(!confirm('Clear this inspection from the app? Make sure you saved or sent the PDF first.'))return;const a=pmAll();delete a[e.id];lsSet(PM_SESS,a);pmSess=null;pmPdf=null;pmGo('list');};w.appendChild(fin);
 const nt=document.createElement('p');nt.className='pm-note';nt.textContent='The form is filled from your entries and is unsigned. Faults go to your supervisor / maintenance chain per local SOP; this app does not submit anything.';w.appendChild(nt);
}
function pmNote(t,ok){const m=document.getElementById('pmmsg');pmMsg=`<div class="pm-msg${ok?' ok':' err'}">${pmEsc(t)}</div>`;if(m)m.innerHTML=pmMsg;}

// deep link (shareable), else resume where you left off
(function(){
 let h='';try{h=decodeURIComponent((location.hash||'').slice(1));}catch(e){}
 if(h){
  if(h==='tables'||h==='glossary'){extraSub=h;lsSet('efr-extrasub',h);const tb=document.querySelector('.tab[data-tab="extras"]');if(tb){tb.click();return;}}
  if(['tools','extras','settings','pmcs'].includes(h)){const tb=document.querySelector('.tab[data-tab="'+h+'"]');if(tb){tb.click();return;}}
  const e=byId[h];
  if(e){go(e.disc,e.doc,e.sk);const el=document.querySelector('[data-tid="'+e.id.replace(/[^A-Za-z0-9._-]/g,'')+'"]');if(el){if(el.tagName==='DETAILS')el.open=true;el.scrollIntoView({block:'center'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1700);}return;}
 }
 const l=lsGet('efr-last',null);if(l&&l.disc){const dd=DATA.disciplines.find(x=>x.d===l.disc);if(dd){disc=l.disc;if(l.man&&dd.mans.some(x=>x.k===l.man)){man=l.man;sec=(l.sec&&DATA.sections[l.man]&&DATA.sections[l.man].some(x=>x.k===l.sec))?l.sec:'ALL';}}}
 render();
 if(!h && !lsGet('efr-tips-seen',false)) runTips();
})();
function runTips(){let i=0;function show(){const t=TIPS[i];$('#tipbody').innerHTML=`<div class="ti">${t.i}</div><b>${esc(t.t)}</b><p>${esc(t.d)}</p>`;$('#tipnext').textContent=(i<TIPS.length-1)?'Next':'Got it';$('#tipsheet').hidden=false;guard();}
 $('#tipnext').onclick=()=>{i++;if(i<TIPS.length)show();else{$('#tipsheet').hidden=true;lsSet('efr-tips-seen',true);}};
 show();}
