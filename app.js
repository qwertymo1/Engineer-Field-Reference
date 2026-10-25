/* build eb9570b95a */

const DATA=window.__DATA__;
const $=s=>document.querySelector(s), listEl=$('#list'), countEl=$('#count'), crumbEl=$('#crumb');
let tab='guide', disc=null, man=null, sec='ALL', q='', special=null;
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
function hay(o){return [o.n,o.c,o.desc,o.use,o.how,o.dim,o.eq,o.tm,o.pr,o.wn,o.src,o.sn].join(' ').toLowerCase();}
function lnk(v,doc){if(!v)return '';let s=esc(v);return s.replace(/(Table|Figure)\s+([0-9A-Z]+-\d+)/g,(m,k,num)=>{const key=doc+' '+k+' '+num;return DATA.images[key]?`<a class="ref" data-k="${key}" data-l="${k+' '+num}">${m}</a>`:m;});}
function viewer(imgKey,title){const im=DATA.images[imgKey];if(!im)return;$('#vimg').src=im;$('#vtitle').textContent=title||'';$('#viewer').classList.add('on');}
$('#vclose').onclick=()=>{$('#viewer').classList.remove('on');$('#vimg').src='';};
$('#viewer').addEventListener('click',e=>{if(e.target.id==='viewer'){$('#viewer').classList.remove('on');$('#vimg').src='';}});
function taskCard(t){const d=document.createElement('details');d.className='card';d.style.setProperty('--col',t.col);
 let kv='';const row=(l,v,w)=>{if(v)kv+=`<dt>${l}</dt><dd class="${w?'w':''}">${lnk(v,t.doc)}</dd>`;};
 row('Type',t.tp);row('Use case',t.use);row('How to',t.how);row('Dimensions',t.dim);row('Equipment',t.eq);row('Time / effort',t.tm);row('Protection',t.pr);row('Warnings',t.wn,1);
 const pics=(t.figs||[]).filter(k=>DATA.images[k]);
 let fig='';
 if(pics.length){fig=`<div class="pix"><div class="pixh">Pictures (${pics.length}) &mdash; tap to zoom</div><div class="pixrow">`+
   pics.map(k=>`<button class="pcell" data-fig="${esc(k)}"><img src="${DATA.images[k]}" alt="" loading="lazy" decoding="async"><span>${esc(k.split(' ').slice(1).join(' '))}</span></button>`).join('')+`</div></div>`;}
 const tag=(q||special)?`<span class="seclab">${esc(t.sn)}</span>`:'';
 d.innerHTML=`<summary><span class="nm">${esc(t.n)}</span>${tag}<button class="star${isFav(t.id)?' on':''}" data-fid="${esc(t.id)}" aria-label="Save to favorites" title="Save">&#9733;</button><span class="car">&rsaquo;</span></summary>`+
  `<div class="body">${t.desc?`<div class="lead">${lnk(t.desc,t.doc)}</div>`:''}<dl class="kv">${kv}</dl>${fig}<div class="src">Source: ${lnk(t.src,t.doc)}</div></div>`;
 d.addEventListener('toggle',()=>{if(d.open)addRecent(t.id);});
 return d;}
function topicEl(t){const el=document.createElement('div');el.className='topic';el.style.setProperty('--col',t.col);
 const parts=[];if(t.desc)parts.push(t.desc);if(t.how&&t.how!==t.desc)parts.push(t.how);
 const kf=[t.dim,t.eq,t.pr,t.wn].filter(Boolean).join('; ');
 const tag=(q||special)?` <span class="seclab">${esc(t.sn)}</span>`:'';
 el.innerHTML=`<h3>${esc(t.n)}${tag}</h3>${t.use?`<div class="use">When / why: ${esc(t.use)}</div>`:''}<p>${lnk(parts.join(' '),t.doc)}</p>${kf?`<div class="kf"><b>Key facts:</b> ${lnk(kf,t.doc)}</div>`:''}<div class="src">Source: ${lnk(t.src,t.doc)}</div>`;
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
  links:[{k:'TM62 Figure 2-13',l:'Fig 2-13 (D6T–D7E)'},{k:'TM62 Figure 2-14',l:'Fig 2-14 (D7–D8)'},{k:'TM62 Figure 2-15',l:'Fig 2-15 grade'}],
  fields:[{k:'max',l:'Max production (LCY/hr) — from chart'},{k:'grade',l:'Grade factor (Fig 2-15; 1.0 = level)',v:1}],
  selects:[
   {k:'mat',l:'Material (Table 2-4)',opts:[['Average / as-is (1.0)',1],['Loose, stockpile (1.2)',1.2],['Hard to cut; frozen, w/ tilt (0.8)',0.8],['Hard to cut; frozen, no tilt (0.7)',0.7],['Hard to drift / dead / sticky (0.8)',0.8],['Rock, ripped or blasted (0.7)',0.7]]},
   {k:'tech',l:'Technique (Table 2-5)',opts:[['Normal (1.0)',1],['Slot dozing (1.2)',1.2],['Side-by-side dozing (1.2)',1.2]]},
   {k:'op',l:'Operator (Table 2-2)',opts:[['Excellent — day (1.0)',1],['Average — day (0.75)',0.75],['Poor — day (0.6)',0.6],['Excellent — night (0.75)',0.75],['Average — night (0.56)',0.56],['Poor — night (0.45)',0.45]]}],
  eff:true,
  calc:o=>{const p=o.max*o.grade*o.mat*o.tech*o.op*(o.wm/60);return [['Production',fmt(p)+' LCY/hr'],['Per 8-hr day',fmt(p*8)+' LCY']];}},
 loader:{name:'Wheel loader',
  note:'Production = heaped-bucket capacity × fill factor × (60 ÷ cycle time) × efficiency. Fill factor from TM 3-34.62 Table 5-1; typical cycle time 0.45–0.55 min (Table 5-2).',
  fields:[{k:'cap',l:'Heaped bucket capacity (CY)'},{k:'ct',l:'Cycle time (min) — Table 5-2',v:0.5}],
  selects:[{k:'ff',l:'Material fill factor (Table 5-1)',opts:[['Mixed moist aggregates (0.98)',0.98],['Uniform aggregate ≤ 1/8 in (0.98)',0.98],['Uniform 1/8–3/8 in (0.93)',0.93],['Uniform ≥ 1/2 in (0.88)',0.88],['Blasted rock — well (0.88)',0.88],['Blasted rock — average (0.83)',0.83],['Blasted rock — poor (0.68)',0.68],['Rock-dirt mixture (1.10)',1.1],['Moist loam (1.05)',1.05],['Soil (0.90)',0.9]]}],
  eff:true,
  calc:o=>{const p=o.cap*o.ff*(60/o.ct)*(o.wm/60);return [['Production',fmt(p)+' LCY/hr'],['Per 8-hr day',fmt(p*8)+' LCY']];}},
 hoe:{name:'Hydraulic excavator / backhoe',
  note:'Production = heaped-bucket capacity × fill factor × (60 ÷ cycle time) × efficiency. Fill factor from TM 3-34.62 Table 8-1; enter a cycle time typical for your machine and depth of cut.',
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
  fields:[{k:'S',l:'Operating speed (mph) — Table 4-4'},{k:'Le',l:'Effective blade length (ft) — Table 4-5'},{k:'Lo',l:'Overlap (ft)',v:0},{k:'passes',l:'Passes',v:1}],
  eff:true,
  calc:o=>{const A=o.S*(o.Le-o.Lo)*5280*(o.wm/60),ac=A/43560;return [['Coverage',fmt(ac)+' acre/hr ('+fmt(A)+' sq ft/hr)'],['Finished area',fmt(ac/o.passes)+' acre/hr']];}}
};
const TOOLS=[
 {cat:'Horizontal',name:'Earthwork volume (average end area)',src:'TM 3-34.55 / TM 3-34.62',
  note:'Average-end-area method. Enter the two cross-section end areas and the distance between the stations.',
  in:[{k:'a1',l:'End area A1 (sq ft)'},{k:'a2',l:'End area A2 (sq ft)'},{k:'L',l:'Distance between (ft)'}],
  out:o=>[['Volume',fmt(o.L*(o.a1+o.a2)/2/27)+' cu yd']]},
 {cat:'Horizontal',name:'Soil volume — swell & shrinkage',src:'TM 3-34.41',
  note:'Convert in-place (bank) soil to loose and compacted volumes. Enter the swell and shrinkage percentages for your soil from the manual’s conversion-factor table.',
  in:[{k:'b',l:'Bank volume (BCY)'},{k:'sw',l:'Swell %'},{k:'sh',l:'Shrinkage %'}],
  out:o=>[['Loose (LCY)',fmt(o.b*(1+o.sw/100))],['Compacted (CCY)',fmt(o.b*(1-o.sh/100))]]},
 {cat:'Horizontal',name:'Equipment production rate',equip:EQUIP},
 {cat:'Vertical',name:'Concrete volume',src:'TM 3-34.44',
  note:'Length × width × thickness ÷ 27, plus a waste allowance. Length and width in feet, thickness in inches.',
  in:[{k:'L',l:'Length (ft)'},{k:'W',l:'Width (ft)'},{k:'T',l:'Thickness (in)'},{k:'wa',l:'Waste %',v:5}],
  out:o=>[['Concrete needed',fmt(o.L*o.W*(o.T/12)/27*(1+o.wa/100))+' cu yd']]},
 {cat:'Vertical',name:'Concrete mix materials',src:'TM 3-34.44',
  note:'Splits a concrete volume into cement, sand, and gravel by your mix ratio. Set the mix (parts by volume) and the dry-material yield factor from the manual; 1 bag of cement ≈ 1 cu ft.',
  in:[{k:'v',l:'Concrete volume (cu yd)'},{k:'c',l:'Cement parts',v:1},{k:'s',l:'Sand parts',v:2},{k:'g',l:'Gravel parts',v:3},{k:'y',l:'Dry yield factor',v:1.54}],
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
function toolCard(t){
 const d=document.createElement('details');d.className='card tool';d.style.setProperty('--col',t.cat==='Horizontal'?'#a8702e':'#2f7d6b');
 if(t.equip){
  const keys=Object.keys(t.equip);
  d.innerHTML=`<summary><span class="nm">${esc(t.name)}</span><span class="car">&rsaquo;</span></summary><div class="body"><label class="tin"><span>Equipment</span><select data-eq>${keys.map(k=>`<option value="${k}">${esc(t.equip[k].name)}</option>`).join('')}</select></label><div class="eqbody"></div></div>`;
  const sel=d.querySelector('[data-eq]'),body=d.querySelector('.eqbody');
  function calc(){const e=t.equip[sel.value],o={};body.querySelectorAll('[data-k]').forEach(x=>o[x.dataset.k]=parseFloat(x.value));let rows;try{rows=e.calc(o)||[];}catch(err){rows=[];}const outs=body.querySelector('.touts');if(outs)outs.innerHTML=rows.map(r=>`<div class="tout"><span>${esc(r[0])}</span><b>${esc(r[1])}</b></div>`).join('');}
  function buildEq(){const e=t.equip[sel.value];
   const flds=(e.fields||[]).map(f=>`<label class="tin"><span>${esc(f.l)}</span><input type="number" inputmode="decimal" step="any" data-k="${f.k}" value="${f.v!=null?f.v:''}"></label>`).join('');
   const sels=(e.selects||[]).map(s=>`<label class="tin"><span>${esc(s.l)}</span><select data-k="${s.k}">${s.opts.map(o=>`<option value="${o[1]}">${esc(o[0])}</option>`).join('')}</select></label>`).join('');
   const ef=e.eff?`<label class="tin"><span>Working min / hr</span><input type="number" inputmode="decimal" step="any" data-k="wm" value="50"></label>`:'';
   const lks=(e.links||[]).map(x=>`<button type="button" class="ref chartlink" data-k="${esc(x.k)}" data-l="${esc(x.l)}">${esc(x.l)}</button>`).join('');
   const lkrow=lks?`<div class="chartlinks">${lks}</div>`:'';
   body.innerHTML=`<p class="tnote">${esc(e.note)}</p>${lkrow}<div class="tins">${flds}${sels}${ef}</div><div class="touts"></div><div class="src">Source: TM 3-34.62 (Earthmoving)</div>`;calc();}
  sel.addEventListener('change',buildEq);d.addEventListener('input',calc);d.addEventListener('toggle',()=>{if(d.open)buildEq();});
  return d;
 }
 const ins=t.in.map(f=>`<label class="tin"><span>${esc(f.l)}</span><input type="number" inputmode="decimal" step="any" data-k="${f.k}" value="${f.v!=null?f.v:''}"></label>`).join('');
 d.innerHTML=`<summary><span class="nm">${esc(t.name)}</span><span class="car">&rsaquo;</span></summary><div class="body"><p class="tnote">${esc(t.note)}</p><div class="tins">${ins}</div><div class="touts"></div><div class="src">Source: ${esc(t.src)}</div></div>`;
 const outs=d.querySelector('.touts');
 function calc(){const o={};d.querySelectorAll('input[data-k]').forEach(x=>o[x.dataset.k]=parseFloat(x.value));let rows;try{rows=t.out(o)||[];}catch(e){rows=[];}outs.innerHTML=rows.map(r=>`<div class="tout"><span>${esc(r[0])}</span><b>${esc(r[1])}</b></div>`).join('');}
 d.addEventListener('input',calc);d.addEventListener('toggle',()=>{if(d.open)calc();});
 return d;
}
function render(){
 const guide=tab==='guide';
 crumbEl.hidden=!(guide&&!q&&(special||disc||man));
 listEl.innerHTML='';countEl.innerHTML='';const frag=document.createDocumentFragment();
 if(guide){
  if(q){
   let rows=DATA.entries.filter(e=>hay(e).includes(q));
   if(man)rows=rows.filter(e=>e.doc===man);else if(disc)rows=rows.filter(e=>e.disc===disc);
   countEl.textContent=`${rows.length} result${rows.length===1?'':'s'}`+(man?` in ${MANFULL[man].name}`:disc?` in ${disc}`:' (all manuals)');
   rows.forEach(e=>frag.appendChild(entryEl(e)));
   if(!rows.length){const x=document.createElement('div');x.className='empty';x.textContent='No matches. Clear the search or widen the area.';frag.appendChild(x);}
  } else if(special){
   crumb([{label:'Disciplines',fn:()=>go(null,null,'ALL')},{label:special==='saved'?'★ Saved':'Recent'}]);
   const ids=special==='saved'?[...fav]:recent;
   const rows=ids.map(id=>byId[id]).filter(Boolean);
   countEl.textContent=`${rows.length} ${special==='saved'?'saved task':'recent task'}${rows.length===1?'':'s'}`;
   if(special==='saved'){const br=document.createElement('div');br.className='shortcuts';const bb=document.createElement('button');bb.className='scut';bb.style.setProperty('--dc','#5a7d5a');bb.innerHTML=`<span class="si">&#128190;</span><span class="sl">Back up / restore</span><span class="sn">&rsaquo;</span>`;bb.onclick=openBackup;br.appendChild(bb);frag.appendChild(br);}
   rows.forEach(e=>frag.appendChild(entryEl(e)));
   if(!rows.length){const x=document.createElement('div');x.className='empty';x.textContent=special==='saved'?'No saved tasks yet. Tap the ★ on any task to save it here.':'Nothing viewed yet.';frag.appendChild(x);}
  } else if(!disc){
   {
    const sc=document.createElement('div');sc.className='shortcuts';
    if(fav.size){const b=document.createElement('button');b.className='scut';b.style.setProperty('--dc','#c9a227');b.innerHTML=`<span class="si">&#9733;</span><span class="sl">Saved</span><span class="sn">${fav.size}</span>`;b.onclick=()=>goSpecial('saved');sc.appendChild(b);}
    if(recent.length){const b=document.createElement('button');b.className='scut';b.style.setProperty('--dc','#6a6a5a');b.innerHTML=`<span class="si">&#8635;</span><span class="sl">Recent</span><span class="sn">${recent.length}</span>`;b.onclick=()=>goSpecial('recent');sc.appendChild(b);}
    const bb=document.createElement('button');bb.className='scut';bb.style.setProperty('--dc','#5a7d5a');bb.innerHTML=`<span class="si">&#128190;</span><span class="sl">Backup</span><span class="sn">&rsaquo;</span>`;bb.onclick=openBackup;sc.appendChild(bb);
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
    b.innerHTML=`<div class="mh"><span class="mn">${esc(m.name)}</span><span class="cnt">${m.n} items</span></div><div class="mf">${esc(m.full)}</div><div class="syn">${esc(m.syn)}</div><div class="go">View sections ›</div>`;
    b.onclick=()=>go(disc,m.k,'ALL');frag.appendChild(b);});
  } else if(sec==='ALL'){
   const dd=DATA.disciplines.find(x=>x.d===disc),m=dd.mans.find(x=>x.k===man);
   crumb([{label:'Disciplines',fn:()=>go(null,null,'ALL')},{label:disc,fn:()=>go(disc,null,'ALL')},{label:m.name}]);
   const syn=document.createElement('div');syn.className='synbox';syn.innerHTML=`<b>${esc(m.name)} — ${esc(m.full)}.</b> ${esc(m.syn)}`;countEl.appendChild(syn);
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
 } else if(tab==='tables'){
  const rows=DATA.tables.filter(t=>!q||(t.t+' '+t.cap).toLowerCase().includes(q));
  countEl.textContent=rows.length+' tables'+(q?` matching "${q}"`:'');
  rows.forEach(t=>{const el=document.createElement('div');el.className='tbl';el.innerHTML=`<div class="cap">${esc(t.t)}. ${esc(t.cap)}</div><img src="${DATA.images[t.img]}" alt="" loading="lazy" decoding="async">`;el.onclick=()=>viewer(t.img,t.t+'. '+t.cap);frag.appendChild(el);});
 } else if(tab==='tools'){
  countEl.textContent='Production estimate tools — built from the manuals';
  ['Horizontal','Vertical'].forEach((cat,i)=>{const h=document.createElement('div');h.className='idxhead toolcat'+(i===0?' first':'');h.textContent=cat+' engineering';frag.appendChild(h);TOOLS.filter(t=>t.cat===cat).forEach(t=>frag.appendChild(toolCard(t)));});
  const n=document.createElement('p');n.className='src';n.style.margin='16px 2px';n.textContent='These follow the formulas in the referenced manuals. Enter the job factors (swell, shrinkage, efficiency, mix, waste) from your manual — the tool does the math. Verify critical estimates against the source.';frag.appendChild(n);
 } else {
  const rows=DATA.glossary.filter(g=>!q||(g.t+' '+g.d).toLowerCase().includes(q));
  countEl.textContent=rows.length+' terms'+(q?` matching "${q}"`:'');
  rows.forEach(g=>{const el=document.createElement('div');el.className='gitem';el.innerHTML=`<span class="t">${esc(g.t)}</span> &mdash; <span class="d">${esc(g.d)}</span>`;frag.appendChild(el);});
 }

 listEl.appendChild(frag);
}
listEl.addEventListener('click',e=>{
 const st=e.target.closest('.star');if(st){e.preventDefault();e.stopPropagation();toggleFav(st.dataset.fid);st.classList.toggle('on');return;}
 const rf=e.target.closest('.ref');if(rf){e.preventDefault();e.stopPropagation();viewer(rf.dataset.k,rf.dataset.l);return;}
 const b=e.target.closest('.pcell,.figbtn');if(b){e.preventDefault();viewer(b.dataset.fig,b.dataset.fig);}});
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-selected','false'));t.setAttribute('aria-selected','true');tab=t.dataset.tab;q='';$('#q').value='';$('#qx').style.display='none';$('#q').placeholder=tab==='guide'?(man?'Search '+MANFULL[man].name+'…':disc?'Search '+disc+'…':'Search all manuals…'):(tab==='tables'?'Search tables…':tab==='tools'?'Production estimate tools':'Search glossary…');render();window.scrollTo(0,0);});
const qi=$('#q');qi.addEventListener('input',()=>{q=qi.value.trim().toLowerCase();$('#qx').style.display=q?'block':'none';render();});
$('#qx').onclick=()=>{qi.value='';q='';$('#qx').style.display='none';render();qi.focus();};
// contact sheet
$('#contact').onclick=()=>{$('#csheet').hidden=false;};
$('#cclose').onclick=()=>{$('#csheet').hidden=true;};
$('#csheet').addEventListener('click',e=>{if(e.target.id==='csheet')$('#csheet').hidden=true;});
$('#ccopy').onclick=async()=>{const em='Dylan.W.Lundquist.Mil@army.mil';try{await navigator.clipboard.writeText(em);$('#ccopy').textContent='Copied';setTimeout(()=>$('#ccopy').textContent='Copy',1500);}catch(e){const r=document.createRange();r.selectNodeContents($('.cmail a'));const s=getSelection();s.removeAllRanges();s.addRange(r);}};
function setBsta(msg,ok){const el=$('#bsta');el.textContent=msg||'';el.className='bsta'+(msg?(ok?' ok':' err'):'');}
function openBackup(){$('#csheet').hidden=true;try{$('#bcode').value=makeBackup();}catch(e){$('#bcode').value='';}$('#brest').value='';setBsta('');$('#bsheet').hidden=false;guard();}
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
 if(!$('#bsheet').hidden){$('#bsheet').hidden=true;guard();return;}
 if(!$('#csheet').hidden){$('#csheet').hidden=true;guard();return;}
 if(special||disc||man){upLevel();guard();return;}                           // step up inside the app
 $('#leave').hidden=false;guard();                                           // at the top -> ask
});
$('#lcancel').onclick=()=>{$('#leave').hidden=true;};
$('#leave').addEventListener('click',e=>{if(e.target.id==='leave')$('#leave').hidden=true;});
$('#lyes').onclick=()=>{_leaving=true;$('#leave').hidden=true;history.go(-2);setTimeout(()=>{_leaving=false;try{window.close();}catch(e){}},500);};
// resume where you left off
(function(){const l=lsGet('efr-last',null);if(!l||!l.disc)return;const dd=DATA.disciplines.find(x=>x.d===l.disc);if(!dd)return;disc=l.disc;
 if(l.man&&dd.mans.some(x=>x.k===l.man)){man=l.man;sec=(l.sec&&DATA.sections[l.man]&&DATA.sections[l.man].some(x=>x.k===l.sec))?l.sec:'ALL';}})();
render();
