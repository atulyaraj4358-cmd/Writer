addEventListener('error',e=>{let b=document.getElementById('err');if(!b){b=document.createElement('div');b.id='err';b.style.cssText='position:fixed;left:8px;right:8px;bottom:8px;z-index:99;background:#7a1010;color:#fff;font:12px monospace;padding:8px;border-radius:8px;white-space:pre-wrap';document.body.append(b)}b.textContent='Error: '+e.message+' ('+String(e.filename||'').split('/').pop()+':'+e.lineno+')'});
const NOP=new Proxy(function(){},{get:(t,p)=>p===Symbol.iterator?function*(){}:p===Symbol.toPrimitive?()=>'':p==='children'||p==='childNodes'?[]:p==='classList'?{toggle(){},add(){},remove(){},contains(){return false}}:p==='style'?{setProperty(){}}:p==='value'||p==='textContent'?'':p==='hidden'?true:p==='then'?undefined:NOP,set:()=>true,apply:()=>NOP});
const $=s=>document.querySelector(s)||NOP,KEY='inkwell.v1',MAX=10000;
const idb=(m,v,key='S')=>new Promise(r=>{try{const q=indexedDB.open('inkwell',1);q.onupgradeneeded=()=>q.result.createObjectStore('k');q.onerror=()=>r();q.onsuccess=()=>{try{const s=q.result.transaction('k',m==='get'?'readonly':'readwrite').objectStore('k'),x=m==='get'?s.get(key):s.put(v,key);x.onsuccess=()=>r(x.result);x.onerror=()=>r()}catch(e){r()}}}catch(e){r()}});
const D={paper:'letter',theme:'cream',ink:'',sound:true,profile:'classic',vol:.7,haptic:true,lampOn:true,warm:2700,int:.6,size:110,spread:135,font:20,fontfam:'',marg:1,lsp:1.7};
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
const lost=!S||!Array.isArray(S.notes);
if(lost)S={s:{},notes:[],cur:null};S.s={...D,...S.s};if(S.s.size>200||S.s.size<60)S.s.size=110;
let tm;const flush=()=>{const v=$('#sv');try{const j=JSON.stringify(S);idb('put',j);localStorage.setItem(KEY,j);if(v)v.textContent='Saved ✓';backupMaybe(j)}catch(e){if(v)v.textContent='Not saved'}},store=()=>{const v=$('#sv');if(v)v.textContent='Saving…';clearTimeout(tm);tm=setTimeout(flush,300)};
addEventListener('pagehide',flush);document.addEventListener('visibilitychange',flush);
const ta=$('#ta'),pg=$('#page'),root=document.documentElement;
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const hs=i=>{const x=Math.sin(i*12.9898+1.3)*43758.5453;return x-Math.floor(x)};
const EMO=/\p{Extended_Pictographic}/u;
const cur=()=>S.notes.find(n=>n.id===S.cur);
let verTimer=null,undoS=[],redoS=[],utimer=null,lastBackupAt=0;
function apply(){const s=S.s;root.dataset.theme=s.theme;root.dataset.paper=s.paper;root.classList.toggle('lampoff',!s.lampOn);root.style.setProperty('--inkb',s.ink||'#23201b');s.ink?root.style.setProperty('--ink',s.ink):root.style.removeProperty('--ink');root.dataset.fontfam=s.fontfam||'';root.style.setProperty('--mg',s.marg);root.style.setProperty('--lsp',s.lsp);
const t=(s.warm-2200)/4300;root.style.setProperty('--lamp',[255-45*t,170+55*t,90+165*t].map(Math.round).join(','));
root.style.setProperty('--int',s.int);const rp=160*s.size/100,rw=Math.min(rp*Math.tan(s.spread*Math.PI/360),700);[['--mh',rp/2],['--mw',rw*.8],['--ch',rp*1.15],['--cw',rw*2]].forEach(([k,v])=>root.style.setProperty(k,v+'px'));root.style.setProperty('--fs',s.font+'px');
$('#dim').style.display=s.lampOn?'block':'none';const dn=s.lampOn?(s.int<.45?1:s.int<.75?2:3):0;document.querySelectorAll('#pod b').forEach((b,i)=>b.classList.toggle('on',i<dn));Snd.cfg(s);pos()}
function bind(id,k,num){const e=$('#'+id),ck=e.type==='checkbox';ck?e.checked=S.s[k]:e.value=S.s[k];
const f=()=>{S.s[k]=ck?e.checked:num?+e.value:e.value;apply();store()};e.addEventListener('input',f);e.addEventListener('change',f)}
[['paper','paper'],['theme','theme'],['ink','ink'],['profile','profile'],['sound','sound'],['haptic','haptic'],['lampOn','lampOn'],['fontfam','fontfam']].forEach(a=>bind(...a));
[['font','font'],['vol','vol'],['warm','warm'],['int','int'],['size','size'],['spread','spread'],['marg','marg'],['lsp','lsp']].forEach(a=>bind(a[0],a[1],1));
let lv=null;
function place(p){const o=pg.querySelector('.c');if(o)o.remove();const c=document.createElement('i');c.className='c';let n=0,nd;const it=document.createNodeIterator(pg,5);
while(nd=it.nextNode()){if(nd.nodeType===1){if(nd.tagName==='B'){if(n===p){nd.before(c);return}n+=(+nd.dataset.l||1)}}else if(nd.parentNode.tagName!=='B'){const L=nd.length;if(p<n+L){if(p>n)nd.splitText(p-n);p>n?nd.after(c):nd.before(c);return}n+=L}}pg.append(c)}
let last='';
function render(){const v=ta.value,p=ta.selectionStart,key=v+'|'+p;if(key===last)return;last=key;if(v===lv){place(p);pos();return}lv=v;let o='',w=0,i=0;
const cps=(typeof Intl!=='undefined'&&Intl.Segmenter)?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(v)].map(s=>s.segment):Array.from(v);
for(let k=0;k<=cps.length;k++){if(i===p)o+='<i class="c"></i>';if(k>=cps.length)break;const c=cps[k],L=c.length;
if(c===' '||c==='\n'){if(w){o+='</span>';w=0}o+=c;i+=L;continue}
if(!w){o+='<span class="w">';w=1}
const em=EMO.test(c)?' class="em"':'';
o+=`<b${em} data-l="${L}" style="transform:translateY(${((hs(i)-.5)*1.6).toFixed(2)}px) rotate(${((hs(i+7)-.5)*1.8).toFixed(2)}deg);opacity:${(.82+hs(i+3)*.18).toFixed(2)}">${esc(c)}</b>`;i+=L}
if(w)o+='</span>';
pg.innerHTML=o+'\n';const n=v.length,wc=v.trim()?v.trim().split(/\s+/).length:0,c=$('#cnt');c.textContent=n+' / '+MAX.toLocaleString('en-US').replace(/,/g,' ')+' · '+wc+(wc===1?' word':' words');c.classList.toggle('full',n>=MAX);pos()}
function pos(){root.style.setProperty('--ro',Math.min(1,$('#desk').scrollTop/120).toFixed(2));const c=pg.querySelector('.c');if(!c)return;const sh=document.querySelector('.sheet'),dep=c.offsetTop+(c.offsetParent===pg?pg.offsetTop:0),th=pg.offsetHeight-S.s.font*1.7,ed=pg.offsetTop+th,k=0;sh.style.setProperty('--tilt',(k*13).toFixed(2)+'deg');sh.style.setProperty('--tn',k.toFixed(3));sh.style.setProperty('--tory',ed+'px');const r=c.getBoundingClientRect(),sr=document.querySelector('.sheet').getBoundingClientRect(),L=$('#lamp').style,y=r.top-S.s.font*.3+30,px=Math.min(Math.max(r.left+S.s.font*.3,sr.left+16),sr.right-16);
L.setProperty('--ry',y+'px');L.setProperty('--px',px+'px');L.setProperty('--rx',sr.left-8+'px');L.setProperty('--rw0',sr.width+16+'px');
const d=$('#dim').style;d.setProperty('--lx',px+'px');d.setProperty('--ly',y+'px');const g=$('#glow').style;g.setProperty('--lx',px+'px');g.setProperty('--ly',y+'px');const ck=$('#cone').style;ck.left=Math.min(Math.max(c.offsetLeft+(c.offsetParent===pg?pg.offsetLeft:0),44),sh.offsetWidth-44)+'px';ck.top=(dep+S.s.font*.45+22.5)+'px'}
let belled=false,lastTop=0;
function bell(){const c=pg.querySelector('.c');if(!c)return;const r=c.getBoundingClientRect(),pr=pg.getBoundingClientRect();
if(Math.abs(r.top-lastTop)>4){belled=false;lastTop=r.top}
if(!belled&&r.left>pr.right-10*S.s.font*.6){belled=true;Snd.play('bell')}}
const buzz=n=>S.s.haptic&&navigator.vibrate&&navigator.vibrate(n);
let tt;const typing=()=>{document.body.classList.add('typing');clearTimeout(tt);tt=setTimeout(()=>document.body.classList.remove('typing'),2500)};
function tap(){const p=$('#tee');p.classList.remove('tap');void p.offsetWidth;p.classList.add('tap')}
ta.addEventListener('beforeinput',e=>{Snd.init();tap();const t=e.inputType;
if(t.startsWith('insert')&&t!=='insertLineBreak'&&t!=='insertParagraph'&&ta.value.length>=MAX&&ta.selectionStart===ta.selectionEnd){Snd.play('full');return}
if(t==='insertLineBreak'||t==='insertParagraph'){markEdit();Snd.play('ret');buzz(15);belled=false}
else if(t.startsWith('delete')){markEdit();Snd.play('back');buzz(8)}
else if(t.startsWith('insert')){markEdit();Snd.play(e.data===' '?'space':'key');buzz(5)}});
ta.addEventListener('input',()=>{const n=cur();n.t=ta.value;n.u=Date.now();store();render();bell();typing();
clearTimeout(verTimer);verTimer=setTimeout(()=>snapshotVersion(n),90000);
follow();listNotes()});
ta.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();document.execCommand('insertText',false,'    ')}
if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();dl('inkwell.txt',new Blob([ta.value],{type:'text/plain'}))}
else if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&e.key.toLowerCase()==='z'){e.preventDefault();if(undoS.length){redoS.push(ta.value);ta.value=undoS.pop();ta.dispatchEvent(new Event('input'))}}
else if((e.ctrlKey||e.metaKey)&&(e.key.toLowerCase()==='y'||(e.shiftKey&&e.key.toLowerCase()==='z'))){e.preventDefault();if(redoS.length){undoS.push(ta.value);ta.value=redoS.pop();ta.dispatchEvent(new Event('input'))}}
if(e.key==='Escape')closeAll()});
let rq=0;document.addEventListener('selectionchange',()=>{if(document.activeElement===ta&&!rq)rq=requestAnimationFrame(()=>{rq=0;render()})});
ta.addEventListener('focus',()=>{document.body.classList.remove('nf');render()});ta.addEventListener('blur',()=>document.body.classList.add('nf'));
$('#desk').addEventListener('scroll',pos);addEventListener('resize',pos);
let vvt;const vv=window.visualViewport,vh=()=>{document.body.classList.add('vvresize');root.style.setProperty('--vh',(vv?vv.height:innerHeight)+'px');pos();clearTimeout(vvt);vvt=setTimeout(()=>{document.body.classList.remove('vvresize');pos()},220)};vv&&vv.addEventListener('resize',vh);vh();
['pointermove','pointerdown'].forEach(ev=>addEventListener(ev,()=>document.body.classList.remove('typing')));
function closeAll(){$('#panel').hidden=true;$('#notes').hidden=true;$('#sheetDlg').hidden=true;$('#nm').hidden=true;ta.focus()}
$('#studioB').onclick=()=>{const p=$('#panel');p.hidden=!p.hidden;$('#notes').hidden=true};
$('#boxB').onclick=()=>$('#notesB').click();$('#shareB').onclick=()=>png(1080,1080,'inkwell.png',true);
const pod=$('#pod');let lp;
pod.addEventListener('pointerdown',e=>{e.preventDefault();Snd.init();lp=setTimeout(()=>{lp=0;S.s.lampOn=!S.s.lampOn;$('#lampOn').checked=S.s.lampOn;apply();store();buzz(20)},550)});
['pointerup','pointerleave'].forEach(v=>pod.addEventListener(v,()=>clearTimeout(lp)));
pod.addEventListener('click',()=>{if(lp===0){lp=undefined;return}const n=S.s.int<.45?1:S.s.int<.75?2:3;S.s.int=[.35,.6,.9][n%3];S.s.lampOn=true;$('#lampOn').checked=true;$('#int').value=S.s.int;apply();store();buzz(8)});
pod.addEventListener('contextmenu',e=>e.preventDefault());
function toast(m,undo){const t=$('#toast');t.textContent=m;if(undo){const b=document.createElement('button');b.textContent='Undo';b.onclick=()=>{undo();t.hidden=true};t.append(b)}t.hidden=false;clearTimeout(t._t);t._t=setTimeout(()=>t.hidden=true,5000)}
function dl(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
const O=['The last thing I remember is','Nobody warned me that','Dear stranger, I need you to know','It started the night','Somewhere between midnight and morning,','If I could tell you one thing, it is that','The letter I never sent says','Tonight the quiet feels like','I keep coming back to the day','On the train home I realised','My grandmother once told me','Before the rain started,'];
const E=[' the window was open.',' nothing was ever lost.',' every clock had stopped.',' I was finally honest.',' the city held its breath.',' the coffee went cold.',' we both pretended not to know.',' the light was perfect.',' I forgot my own name.',' everything felt possible.'];
$('#spark').onclick=()=>{const l=O[Math.random()*12|0]+E[Math.random()*10|0],v=ta.value,add=(v&&!v.endsWith('\n')?'\n':'')+l;
ta.value=(v+add).slice(0,MAX);ta.dispatchEvent(new Event('input'));$('#panel').hidden=true;ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length)};
$('#save').onclick=()=>{clearTimeout(tm);flush();toast('Saved on this device')};
$('#billT').onclick=()=>{const w=28,l=c=>c.repeat(w),t="ATULYA'S INKWELL",d=new Date().toLocaleString('en-GB',{dateStyle:'medium',timeStyle:'short'});
const txt=[l('='),' '.repeat((w-t.length)>>1)+t,l('='),'DATE: '+d,l('-'),'ITEM'.padEnd(16)+'QTY'.padEnd(6)+'PRICE',l('-'),''].join('\n'),v=ta.value;
S.s.paper='bill';$('#paper').value='bill';apply();ta.value=((v&&!v.endsWith('\n')?v+'\n':v)+txt).slice(0,MAX);ta.dispatchEvent(new Event('input'));$('#panel').hidden=true;ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length)};
$('#copy').onclick=()=>navigator.clipboard.writeText(ta.value).then(()=>toast('Copied'),()=>toast('Copy failed'));
$('#txt').onclick=()=>dl('inkwell.txt',new Blob([ta.value],{type:'text/plain'}));
function png(w,h,name,share){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d'),cs=getComputedStyle(root),fs=w/30,m=w*.1,bill=S.s.paper==='bill',ink=bill?(S.s.ink||'#23201b'):cs.getPropertyValue('--ink').trim();
x.fillStyle=bill?'#f7f5ee':cs.getPropertyValue('--paper').trim();x.fillRect(0,0,w,h);
const nz=document.createElement('canvas');nz.width=nz.height=160;const nc=nz.getContext('2d'),id=nc.createImageData(160,160);for(let i=0;i<id.data.length;i+=4){id.data[i]=90;id.data[i+1]=80;id.data[i+2]=65;id.data[i+3]=Math.random()*45}nc.putImageData(id,0,0);
x.globalCompositeOperation='multiply';x.fillStyle=x.createPattern(nz,'repeat');x.fillRect(0,0,w,h);x.globalCompositeOperation='source-over';
if(!bill){const g=x.createLinearGradient(0,0,0,h*.14);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,w,h*.14)}
x.fillStyle=ink;x.font=fs+'px "Courier New",monospace';x.textAlign='center';
const cols=Math.floor((w-2*m)/(fs*.6));const y0=m*1.9+fs;
if(!bill){x.save();x.globalAlpha=.72;x.fillStyle=ink;x.textAlign='center';x.font='700 '+fs*.95+'px Georgia,serif';x.fillText('ATULYA INKWELL',w/2,m*.8);x.globalAlpha=.4;x.fillRect(w/2-fs*4.2,m*.8+fs*.35,fs*8.4,Math.max(1,fs/22));x.restore()}
if(S.s.paper==='ruled'){x.save();x.lineWidth=Math.max(1,fs/18);x.strokeStyle='rgba(70,100,170,.38)';for(let yy=y0+fs*.28;yy<h;yy+=fs*1.55){x.beginPath();x.moveTo(0,yy);x.lineTo(w,yy);x.stroke()}x.strokeStyle='rgba(210,70,70,.4)';x.beginPath();x.moveTo(m*.7,0);x.lineTo(m*.7,h);x.stroke();x.restore()}
let y=y0;
const draw=(l,s)=>{for(let k=0;k<l.length;k++){const ch=l[k];if(ch===' '||y>=h-m)continue;const j=s+k;x.save();x.globalAlpha=.82+hs(j+3)*.18;x.translate(m+k*fs*.6+fs*.3,y+(hs(j)-.5)*1.6*(fs/20));x.rotate((hs(j+7)-.5)*1.8*Math.PI/180);x.fillText(ch,0,0);x.restore()}y+=fs*1.55};
let p=0;for(const para of ta.value.split('\n')){let line='',ls=p;for(const wd of para.split(' ')){if((line+wd).length>cols&&line){draw(line,ls);ls+=line.length;line=''}line+=wd+' '}draw(line,ls);p+=para.length+1}
cv.toBlob(b=>{if(share&&navigator.canShare){const f=new File([b],name,{type:'image/png'});if(navigator.canShare({files:[f]}))return navigator.share({files:[f]}).catch(()=>{})}dl(name,b)})}
$('#png').onclick=()=>png(1080,1080,'inkwell.png');$('#story').onclick=()=>png(1080,1920,'inkwell-story.png');
document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{let s=$('#pgs');if(!s){s=document.createElement('style');s.id='pgs';document.head.append(s)}
s.textContent=`@page{size:${b.dataset.p==='Letter'?'8.5in 11in':b.dataset.p};margin:20mm}`;$('#panel').hidden=true;setTimeout(print,50)});
$('#bak').onclick=()=>dl('inkwell-backup.json',new Blob([JSON.stringify(S)],{type:'application/json'}));
$('#imp').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{const f=e.target.files[0];if(!f)return;const t=await f.text();let ok=false;
try{const j=JSON.parse(t);if(Array.isArray(j.notes)){j.notes.forEach((n,i)=>S.notes.push({id:Date.now()+i,t:String(n.t||'').slice(0,MAX),u:n.u||Date.now()}));ok=true}}catch(_){}
if(!ok)S.notes.push({id:Date.now(),t:t.slice(0,MAX),u:Date.now()});S.cur=S.notes[S.notes.length-1].id;openNote(S.cur);toast('Imported');e.target.value=''};
function newNote(){const n={id:Date.now(),t:'',u:Date.now()};S.notes.push(n);openNote(n.id)}
function openNote(id){clearTimeout(verTimer);undoS=[];redoS=[];utimer=null;S.cur=id;ta.value=cur().t;last='';lv=null;render();listNotes();store();$('#notes').hidden=true;ta.focus()}
function listNotes(){const q=$('#q').value.toLowerCase(),ul=$('#nl');ul.innerHTML='';
[...S.notes].sort((a,b)=>b.u-a.u).filter(n=>n.lock?!q:n.t.toLowerCase().includes(q)).forEach(n=>{const li=document.createElement('li');if(n.id===S.cur)li.className='on';
const b=document.createElement('button'),d=document.createElement('button');b.innerHTML='<span></span><small></small>';
b.firstChild.textContent=n.lock?'🔒 Locked note':(n.title||(n.t.split('\n')[0]||'Untitled').slice(0,40));b.lastChild.textContent=new Date(n.u).toLocaleString();
b.onclick=async()=>{if(n.lock&&n.id!==S.cur&&!await verifyPin(n))return;openNote(n.id)};
d.textContent='⋮';d.className='mb';d.setAttribute('aria-label','Note options');d.onclick=e=>{e.stopPropagation();menu(n,d)};li.append(b,d);ul.append(li)})}
$('#notesB').onclick=()=>{$('#panel').hidden=true;$('#notes').hidden=false;listNotes()};$('#nx').onclick=closeAll;$('#nn').onclick=newNote;$('#q').oninput=listNotes;
if(!cur()){S.notes.length?S.cur=S.notes[0].id:newNote()}if(cur().lock){const o=S.notes.find(x=>!x.lock);if(o)S.cur=o.id;else newNote()}ta.value=cur().t;apply();render();listNotes();
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js');
if(lost)idb('get').then(j=>{try{if(j&&Array.isArray(JSON.parse(j).notes)){localStorage.setItem(KEY,j);location.reload()}}catch(e){}});
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
let dp;addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e});
addEventListener('appinstalled',()=>{$('#install').hidden=true;toast('Installed')});
if(matchMedia('(display-mode: standalone)').matches||navigator.standalone)$('#install').hidden=true;
$('#install').onclick=async()=>{if(dp){dp.prompt();await dp.userChoice;dp=null}else toast('Browser menu me "Install app" ya "Add to Home screen" chun')};
document.querySelector('.sheet').addEventListener('transitionend',e=>{if(e.target===e.currentTarget)pos()});
function follow(){const c=pg.querySelector('.c');if(!c)return;const d=$('#desk'),dr=d.getBoundingClientRect(),r=c.getBoundingClientRect(),t=dr.top+Math.max(170,dr.height*.4);if(r.top>t)d.scrollBy({top:r.top-t,behavior:'smooth'})}

const wait=ms=>new Promise(r=>setTimeout(r,ms)),pinEl=$('#pin'),pd=$('#pd'),pdots=[...pd.children],gl=$('#pin .gl');let buf='',res=null,fails=0,lockUntil=0;
const hx=async(s,salt)=>{if(window.crypto&&crypto.subtle){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}let h=5381;for(const c of salt+s)h=(h*33^c.charCodeAt(0))>>>0;return String(h)};
function draw(){pdots.forEach((d,i)=>d.classList.toggle('on',i<buf.length))}
function pinOpen(t,s){if(document.activeElement)document.activeElement.blur();$('#pt').textContent=t;$('#ps').textContent=s||'';buf='';draw();pd.className='dots';pinEl.classList.remove('ok');if(pinEl.hidden){pinEl.hidden=false;buzz(10)}}
function press(k){Snd.init();Snd.play(k==='b'?'back':'pintap');buzz(6);if(!res)return;if(k==='b'){buf=buf.slice(0,-1);draw();return}if(buf.length>=4)return;buf+=k;draw();if(buf.length===4){const r=res,v=buf;res=null;setTimeout(()=>r(v),230)}}
const getPin=()=>new Promise(r=>{res=r;buf='';draw()});
function pinCancel(){if(res){const r=res;res=null;r(null)}pinEl.hidden=true}
async function pinResult(k){pd.className='dots '+k;if(k==='bad'){Snd.play('pinbad');buzz([30,40,30,40,60]);await wait(520);buf='';draw();pd.className='dots'}else{Snd.play('pinok');buzz(25);pinEl.classList.add('ok');await wait(720);pinEl.hidden=true}}
async function verifyPin(n,t){if(Date.now()<lockUntil){toast('Too many tries. Wait '+Math.ceil((lockUntil-Date.now())/1000)+'s');return false}
pinOpen(t||'Enter PIN','Locked note');for(;;){const v=await getPin();if(v===null)return false;if(await hx(v,n.lock.s)===n.lock.h){fails=0;await pinResult('ok');return true}
fails++;if(fails>=5){lockUntil=Date.now()+30000;fails=0;await pinResult('bad');pinEl.hidden=true;toast('Too many tries. Try again in 30s');return false}
$('#ps').textContent='Wrong PIN · '+(5-fails)+' tries left';await pinResult('bad')}}
async function setPin(n,t){t=t||'Set a PIN';pinOpen(t,'Choose 4 digits');for(;;){const a=await getPin();if(a===null)return false;$('#pt').textContent='Confirm PIN';$('#ps').textContent='Enter it again';buf='';draw();const b=await getPin();if(b===null)return false;
if(a===b){const s=Math.random().toString(36).slice(2)+Date.now().toString(36);n.lock={s,h:await hx(a,s)};await pinResult('ok');return true}
$('#pt').textContent=t;$('#ps').textContent="PINs didn't match";await pinResult('bad')}}
function delNote(n){const i=S.notes.indexOf(n);S.notes.splice(i,1);if(!S.notes.length)newNote();else if(S.cur===n.id){const o=S.notes.find(x=>!x.lock);o?openNote(o.id):newNote()}store();listNotes();toast('Note deleted',()=>{S.notes.splice(i,0,n);openNote(n.id)})}
function menu(n,btn){const m=$('#nm');m.innerHTML='';const add=(t,f)=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{m.hidden=true;f()};m.append(b)};
add('Rename',async()=>{if(n.lock&&!await verifyPin(n))return;renameNote(n)});
if(n.lock){add('Change PIN',async()=>{if(await verifyPin(n,'Current PIN')&&await setPin(n,'New PIN')){store();toast('PIN changed')}});add('Remove lock',async()=>{if(await verifyPin(n)){n.lock=null;store();listNotes();toast('Lock removed')}})}
else add('Lock with PIN',async()=>{if(await setPin(n)){store();if(S.cur===n.id){const o=S.notes.find(x=>!x.lock);o?openNote(o.id):newNote()}listNotes();toast('Note locked')}});
add('Delete',async()=>{if(n.lock&&!await verifyPin(n))return;delNote(n)});
const r=btn.getBoundingClientRect();m.hidden=false;m.style.top=Math.min(r.bottom+4,innerHeight-m.offsetHeight-8)+'px';m.style.right=Math.max(8,innerWidth-r.right)+'px'}
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#nm,.mb'))$('#nm').hidden=true});
['1','2','3','4','5','6','7','8','9','','0','b'].forEach((k,i)=>{const b=document.createElement('button');b.type='button';b.style.setProperty('--i',i);
if(!k){b.style.visibility='hidden';b.disabled=true}else{b.innerHTML=k==='b'?'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H9l-6 7 6 7h12z"/><path d="M13 9l4 6M17 9l-4 6"/></svg>':k;b.setAttribute('aria-label',k==='b'?'Delete':k);
b.addEventListener('pointerdown',e=>{e.preventDefault();const r=b.getBoundingClientRect();b.style.setProperty('--px',(e.clientX-r.left)/r.width*100+'%');b.style.setProperty('--py',(e.clientY-r.top)/r.height*100+'%');b.classList.add('dn');press(k)});
['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>b.classList.remove('dn')))}$('#pp').append(b)});
$('#pc').onclick=pinCancel;
gl.addEventListener('pointermove',e=>{const r=gl.getBoundingClientRect();gl.style.setProperty('--mx',(e.clientX-r.left)/r.width*100+'%');gl.style.setProperty('--my',(e.clientY-r.top)/r.height*100+'%')});
document.addEventListener('keydown',e=>{if(pinEl.hidden)return;if(/^\d$/.test(e.key))press(e.key);else if(e.key==='Backspace')press('b');else if(e.key==='Escape')pinCancel();else return;e.preventDefault();e.stopPropagation()},true);

function markEdit(){if(!utimer)pushUndo(ta.value);clearTimeout(utimer);utimer=setTimeout(()=>utimer=null,500)}
function pushUndo(v){undoS.push(v);if(undoS.length>100)undoS.shift();redoS=[]}
function snapshotVersion(n){if(!n)return;if(!n.versions)n.versions=[];const last=n.versions[n.versions.length-1];if(last&&last.t_text===n.t)return;n.versions.push({t:Date.now(),t_text:n.t});if(n.versions.length>20)n.versions.shift();store()}
function backupMaybe(j){const now=Date.now();if(now-lastBackupAt<5*60*1000)return;lastBackupAt=now;S.meta=S.meta||{};const idx=S.meta.bkIdx||0;idb('put',JSON.stringify({t:now,data:j}),'bk'+idx);S.meta.bkIdx=(idx+1)%5}
async function listBackups(){const out=[];for(let i=0;i<5;i++){try{const r=await idb('get',undefined,'bk'+i);if(r){const o=JSON.parse(r);out.push({i,t:o.t,data:o.data})}}catch(e){}}return out.sort((x,y)=>y.t-x.t)}
function openDlg(title,html){$('#dT').textContent=title;$('#dB').innerHTML=html;$('#sheetDlg').hidden=false}
$('#dX').onclick=()=>$('#sheetDlg').hidden=true;
function renameNote(n){openDlg('Rename note','<input id="rnIn" type="text" maxlength="60" placeholder="Note title" style="width:100%;box-sizing:border-box;padding:.6rem .7rem;border-radius:8px;border:1px solid #5b4b33;background:#2d2418;color:inherit;font:inherit"><div class="btns" style="margin-top:.8rem"><button id="rnOk">Save</button><button id="rnClr">Clear title</button></div>');
const inp=document.getElementById('rnIn');if(inp){inp.value=n.title||'';setTimeout(()=>inp.focus(),60)}
const ok=document.getElementById('rnOk');if(ok)ok.onclick=()=>{n.title=(inp.value||'').trim().slice(0,60);store();listNotes();$('#sheetDlg').hidden=true;toast('Renamed')};
const clr=document.getElementById('rnClr');if(clr)clr.onclick=()=>{n.title='';store();listNotes();$('#sheetDlg').hidden=true}}
const SHORTCUTS_HTML=`<ul>
<li>Ctrl/Cmd + S — Save as .txt</li>
<li>Ctrl/Cmd + Z — Undo</li>
<li>Ctrl/Cmd + Shift + Z (or Ctrl+Y) — Redo</li>
<li>Tab — Insert 4 spaces</li>
<li>Esc — Close menu, Studio or dialog</li>
</ul>`;
async function showVersions(){const n=cur(),vs=(n.versions||[]).slice().reverse();
let html='<b>This note</b>'+(vs.length?('<ul>'+vs.map((v,i)=>{const idx=n.versions.length-1-i;return `<li class="vrow"><span>${new Date(v.t).toLocaleString()} · ${v.t_text.length} chars</span><button data-vi="${idx}">Restore</button></li>`}).join('')+'</ul>'):'<p>No saved versions yet. One is kept automatically every couple of minutes while you write.</p>');
const bks=await listBackups();
html+='<b>Device backups</b>'+(bks.length?('<ul>'+bks.map(b=>`<li class="vrow"><span>${new Date(b.t).toLocaleString()}</span><span><button data-bd="${b.i}">Download</button> <button data-br="${b.i}">Restore all</button></span></li>`).join('')+'</ul>'):'<p>No device backups yet. One is kept automatically every few minutes.</p>');
openDlg('Version history',html);
$('#dB').querySelectorAll('[data-vi]').forEach(b=>b.onclick=()=>{const v=n.versions[+b.dataset.vi];if(!v)return;if(n.t!==v.t_text)n.versions.push({t:Date.now(),t_text:n.t});ta.value=v.t_text;ta.dispatchEvent(new Event('input'));$('#sheetDlg').hidden=true;toast('Version restored')});
$('#dB').querySelectorAll('[data-bd]').forEach(b=>b.onclick=()=>{const bk=bks.find(x=>String(x.i)===b.dataset.bd);if(!bk)return;dl('inkwell-backup-'+new Date(bk.t).toISOString().slice(0,16).replace(/[:T]/g,'-')+'.json',new Blob([bk.data],{type:'application/json'}))});
$('#dB').querySelectorAll('[data-br]').forEach(b=>b.onclick=()=>{const bk=bks.find(x=>String(x.i)===b.dataset.br);if(!bk)return;if(!confirm('Replace all current notes with this backup from '+new Date(bk.t).toLocaleString()+'? This cannot be undone.'))return;localStorage.setItem(KEY,bk.data);location.reload()})}
$('#focusB').onclick=()=>{$('#panel').hidden=true;document.body.classList.toggle('focus');$('#exitTab').hidden=!document.body.classList.contains('focus')};
$('#exitTab').onclick=()=>{document.body.classList.remove('focus');$('#exitTab').hidden=true};
$('#readB').onclick=()=>{$('#panel').hidden=true;document.body.classList.toggle('reading')};
$('#shortB').onclick=()=>{$('#panel').hidden=true;openDlg('Keyboard shortcuts',SHORTCUTS_HTML)};
$('#verB').onclick=()=>{$('#panel').hidden=true;showVersions()};
