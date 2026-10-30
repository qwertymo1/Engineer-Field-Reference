/* build dd6c47a08d */

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
 if(special||disc||man){upLevel();guard();return;}                           // step up inside the app
 $('#leave').hidden=false;guard();                                           // at the top -> ask
});
$('#lcancel').onclick=()=>{$('#leave').hidden=true;};
$('#leave').addEventListener('click',e=>{if(e.target.id==='leave')$('#leave').hidden=true;});
$('#lyes').onclick=()=>{_leaving=true;$('#leave').hidden=true;history.go(-2);setTimeout(()=>{_leaving=false;try{window.close();}catch(e){}},500);};
// deep link (shareable), else resume where you left off
(function(){
 let h='';try{h=decodeURIComponent((location.hash||'').slice(1));}catch(e){}
 if(h){
  if(h==='tables'||h==='glossary'){extraSub=h;lsSet('efr-extrasub',h);const tb=document.querySelector('.tab[data-tab="extras"]');if(tb){tb.click();return;}}
  if(['tools','extras','settings'].includes(h)){const tb=document.querySelector('.tab[data-tab="'+h+'"]');if(tb){tb.click();return;}}
  const e=byId[h];
  if(e){go(e.disc,e.doc,e.sk);const el=document.querySelector('[data-tid="'+e.id.replace(/[^A-Za-z0-9._-]/g,'')+'"]');if(el){if(el.tagName==='DETAILS')el.open=true;el.scrollIntoView({block:'center'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1700);}return;}
 }
 const l=lsGet('efr-last',null);if(l&&l.disc){const dd=DATA.disciplines.find(x=>x.d===l.disc);if(dd){disc=l.disc;if(l.man&&dd.mans.some(x=>x.k===l.man)){man=l.man;sec=(l.sec&&DATA.sections[l.man]&&DATA.sections[l.man].some(x=>x.k===l.sec))?l.sec:'ALL';}}}
 render();
 if(!h && !lsGet('efr-tips-seen',false)) runTips();
})();
const TIPS=[
 {i:'&#128269;',t:'Search finds everything',d:'Type in the search box from any tab and get matching tasks, tables, glossary terms, and tools together.'},
 {i:'&#9733;',t:'Star to save',d:'Tap the star on any task to keep it in your Saved list for fast access later.'},
 {i:'&#11015;',t:'Download for offline',d:'From the home screen, tap Offline to save every figure and table so the whole guide works with no signal.'}
];
function runTips(){let i=0;function show(){const t=TIPS[i];$('#tipbody').innerHTML=`<div class="ti">${t.i}</div><b>${esc(t.t)}</b><p>${esc(t.d)}</p>`;$('#tipnext').textContent=(i<TIPS.length-1)?'Next':'Got it';$('#tipsheet').hidden=false;guard();}
 $('#tipnext').onclick=()=>{i++;if(i<TIPS.length)show();else{$('#tipsheet').hidden=true;lsSet('efr-tips-seen',true);}};
 show();}
