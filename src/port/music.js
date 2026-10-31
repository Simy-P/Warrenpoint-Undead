// ================================================================ spooky soundtrack: all synthesised live (music box, organ pad, drone, theremin, heartbeat as the horde closes in)
const MU={on:false,int:0,next:0,step:0,bar:0,timer:null};
function musicInit(){const ctx=AU.ctx;if(!ctx||MU.bus)return;
  MU.bus=ctx.createGain();MU.bus.gain.value=OPT.music===false?0:.55;MU.bus.connect(AU.master);
  // a cheap generated hall reverb and a dotted echo
  const len=ctx.sampleRate*3.2,ir=ctx.createBuffer(2,len,ctx.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);}
  MU.verb=ctx.createConvolver();MU.verb.buffer=ir;const vg=ctx.createGain();vg.gain.value=.55;MU.verb.connect(vg);vg.connect(MU.bus);
  MU.dl=ctx.createDelay(2);MU.dl.delayTime.value=.59;const fb=ctx.createGain();fb.gain.value=.42;const df=ctx.createBiquadFilter();df.type='lowpass';df.frequency.value=2400;MU.dl.connect(df);df.connect(fb);fb.connect(MU.dl);df.connect(MU.bus);df.connect(MU.verb);
  // the drone: detuned saws, slowly breathing filter
  MU.drone=[];const dg=ctx.createGain();dg.gain.value=.05;const dfl=ctx.createBiquadFilter();dfl.type='lowpass';dfl.frequency.value=260;dfl.Q.value=3;dfl.connect(dg);dg.connect(MU.bus);dg.connect(MU.verb);
  const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.07;lg.gain.value=140;lfo.connect(lg);lg.connect(dfl.frequency);lfo.start();
  for(const dt of [-7,0,6]){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=36.71;o.detune.value=dt;o.connect(dfl);o.start();MU.drone.push(o);}MU.dfl=dfl;MU.dg=dg;}
const MF=n=>440*Math.pow(2,(n-69)/12);
// D harmonic minor: Dm, Bb, Gm, A7(b9), then Dm, F/C, E dim, A
const PROG=[[62,65,69],[58,62,65],[55,58,62],[57,61,64,70],[62,65,69],[60,65,69],[64,67,70],[57,61,64]];
const BASS=[38,34,31,33,38,36,40,33];
function mNote(t,f,d,vol,type,dest,att=.005){const ctx=AU.ctx;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.0005,t+d);o.connect(g);for(const x of dest)g.connect(x);o.start(t);o.stop(t+d+.05);return o;}
function musicBox(t,n){const f=MF(n);mNote(t,f,1.6,.07,'sine',[MU.bus,MU.dl,MU.verb]);mNote(t,f*2.01,.5,.025,'sine',[MU.bus,MU.dl]);mNote(t,f*4.2,.18,.012,'triangle',[MU.dl]);}
function organ(t,ch,d){const ctx=AU.ctx;const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=900;const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+d*.4);g.gain.linearRampToValueAtTime(0,t+d);f.connect(g);g.connect(MU.bus);g.connect(MU.verb);
  for(const n of ch)for(const [m,v] of [[.5,1],[1,.7],[2,.35]]){const o=ctx.createOscillator();o.type='sine';o.frequency.value=MF(n-12)*m;const og=ctx.createGain();og.gain.value=v/ch.length;o.connect(og);og.connect(f);o.start(t);o.stop(t+d+.1);}}
function theremin(t){const ctx=AU.ctx;const o=ctx.createOscillator();o.type='sine';const base=MF(74+[0,3,7,10][(Math.random()*4)|0]);o.frequency.setValueAtTime(base*.94,t);o.frequency.exponentialRampToValueAtTime(base,t+.7);o.frequency.exponentialRampToValueAtTime(base*(Math.random()<.5?.75:1.19),t+3.2);
  const v=ctx.createOscillator(),vg=ctx.createGain();v.frequency.value=5.5;vg.gain.value=base*.018;v.connect(vg);vg.connect(o.frequency);const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.03,t+.8);g.gain.linearRampToValueAtTime(0,t+3.6);
  o.connect(g);g.connect(MU.bus);g.connect(MU.verb);o.start(t);v.start(t);o.stop(t+3.7);v.stop(t+3.7);}
function heart(t,vol){const ctx=AU.ctx;for(const [dt,k] of [[0,1],[.2,.7]]){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(70,t+dt);o.frequency.exponentialRampToValueAtTime(38,t+dt+.18);g.gain.setValueAtTime(vol*k,t+dt);g.gain.exponentialRampToValueAtTime(.0005,t+dt+.25);o.connect(g);g.connect(MU.bus);o.start(t+dt);o.stop(t+dt+.3);}}
function stab(t,ch){const ctx=AU.ctx;for(const n of ch){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=MF(n-12);const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(2200,t);f.frequency.exponentialRampToValueAtTime(300,t+.25);const g=ctx.createGain();g.gain.setValueAtTime(.022,t);g.gain.exponentialRampToValueAtTime(.0005,t+.3);o.connect(f);f.connect(g);g.connect(MU.bus);g.connect(MU.dl);o.start(t);o.stop(t+.35);}}
function musicTick(){const ctx=AU.ctx;if(!ctx||!MU.on)return;const spb=60/(70+MU.int*34)/2;// eighth notes, quicker when it gets hairy
  if(MU.next<ctx.currentTime)MU.next=ctx.currentTime+.05;
  while(MU.next<ctx.currentTime+.25){const t=MU.next,s=MU.step%16,ci=MU.bar%8,ch=PROG[ci];
    if(s===0){organ(t,ch,spb*16+.4);for(const o of MU.drone)o.frequency.setTargetAtTime(MF(BASS[ci]-12),t,.4);if(Math.random()<.35)theremin(t+spb*4);}
    if(s%2===0||Math.random()<.3){const pat=[0,1,2,1,2,3,2,1];let n=ch[pat[(s>>1)%8]%ch.length]+12;if(s===14&&Math.random()<.5)n+=1;// the odd wrong-sounding semitone
      if(Math.random()<.85)musicBox(t,n);}
    if(MU.int>.35&&(s===0||s===8))heart(t,.12+.18*MU.int);
    if(MU.int>.65&&(s===3||s===11))stab(t,ch);
    if(MU.int>.8&&s%4===2)heart(t,.08);
    MU.next+=spb;MU.step++;if(MU.step%16===0)MU.bar++;}}
function musicStart(){audioInit();if(!AU.ctx)return;musicInit();if(MU.on)return;MU.on=true;MU.next=0;MU.bar=0;MU.step=0;if(!MU.timer)MU.timer=setInterval(musicTick,90);}
function musicSetVol(){if(MU.bus)MU.bus.gain.setTargetAtTime(OPT.music===false?0:.55,AU.ctx.currentTime,.2);}
function musicIntensity(dt){let near=0;for(const z of Z){if(z.dead)continue;const d=Math.hypot(z.x-PL.x,z.z-PL.z);if(d<30)near+=1-d/30;}
  const want=state==='play'?clamp(near/5,0,1):0;MU.int+=(want-MU.int)*Math.min(1,dt*.6);if(MU.dg)MU.dg.gain.value=.04+.04*MU.int;}
