const Snd=(()=>{let ctx,mg,nb;const p={on:true,vol:.7,profile:'classic'};
const P={classic:{f:1800,q:1.2,d:.045,th:140,g:.5},soft:{f:900,q:.8,d:.06,th:110,g:.35},clicky:{f:3200,q:2,d:.025,th:180,g:.25}};
function init(){if(ctx)return;ctx=new(window.AudioContext||window.webkitAudioContext)();mg=ctx.createGain();mg.connect(ctx.destination);
const n=ctx.sampleRate*.3;nb=ctx.createBuffer(1,n,ctx.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1}
function noise(f,q,d,g,t=0){const s=ctx.createBufferSource(),bp=ctx.createBiquadFilter(),e=ctx.createGain(),T=ctx.currentTime+t;
s.buffer=nb;bp.type='bandpass';bp.frequency.value=f*(.9+Math.random()*.2);bp.Q.value=q;
e.gain.setValueAtTime(g*(.85+Math.random()*.3),T);e.gain.exponentialRampToValueAtTime(.001,T+d);
s.connect(bp);bp.connect(e);e.connect(mg);s.start(T,Math.random()*.1,d+.02)}
function tone(f,d,g,t=0,end=.4,type='sine'){const o=ctx.createOscillator(),e=ctx.createGain(),T=ctx.currentTime+t;
o.type=type;o.frequency.setValueAtTime(f,T);o.frequency.exponentialRampToValueAtTime(f*end,T+d);
e.gain.setValueAtTime(g,T);e.gain.exponentialRampToValueAtTime(.001,T+d);o.connect(e);e.connect(mg);o.start(T);o.stop(T+d+.05)}
return{init,cfg(s){p.on=s.sound;p.vol=s.vol;p.profile=s.profile},
play(k){if(!p.on||!ctx)return;if(ctx.state==='suspended')ctx.resume();mg.gain.value=p.vol;const c=P[p.profile];
if(k==='key'){noise(c.f,c.q,c.d,.9);tone(c.th,.05,c.g)}
else if(k==='space'){noise(c.f*.5,c.q,c.d*1.8,.8);tone(c.th*.6,.09,c.g*1.4)}
else if(k==='back'){noise(c.f*.7,c.q,c.d*1.2,.7);tone(c.th*1.2,.04,c.g)}
else if(k==='full'){tone(90,.12,.6)}
else if(k==='ret'){noise(700,.5,.35,.6);tone(100,.12,.7);noise(2400,3,.03,.9,.34);tone(120,.08,.8,.36)}
else if(k==='bell'){tone(2637,1.3,.35,0,.98);tone(5274,.9,.15,0,.98);tone(3951,1,.12,0,.98)}}}})();
