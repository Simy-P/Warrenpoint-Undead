// ================================================================ zombie voices: formant-synthesised moans and the odd croaked "braaains", placed in 3D on the zombie (louder and closer-sounding as they come for you)
const VOX=[];let RASP=null;
function raspCurve(){const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*3.2)*.9+.1*Math.sin(x*23);}return c;}
// one voice: a croaky glottal buzz plus breath, through four vowel formants that follow a phoneme timeline
function zvoice(z,kind){if(!AU.ctx||VOX.length>=7)return;const ctx=AU.ctx,t=ctx.currentTime+.02;const brute=z.type==='brute';
  const f0=(brute?58:kind==='brains'?92:72)+Math.random()*(brute?14:28);
  // phoneme timeline: [time, F1, F2, F3, F4, voicing, noise]
  let tl;if(kind==='brains'){const a=.55+Math.random()*.45;
    tl=[[0,250,850,2200,3300,0,0],[.04,260,900,2200,3300,.9,0],[.09,430,1080,1500,3100,1,0],[.22,760,1180,2450,3400,1,0],[.22+a,780,1150,2450,3400,1,0],[.32+a,330,2050,2750,3600,1,0],[.44+a,270,1450,2550,3400,.45,0],[.6+a,260,1400,2500,3400,.15,.6],[.82+a,260,1400,2500,3400,0,.35],[.95+a,260,1400,2500,3400,0,0]];}
  else{const d=1.1+Math.random()*1.1;const v=[[340,760,2300],[700,1100,2450],[520,880,2350],[420,820,2300]];const A=v[(Math.random()*4)|0],B=v[(Math.random()*4)|0];
    tl=[[0,A[0],A[1],A[2],3300,0,.1],[.12,A[0],A[1],A[2],3300,1,.15],[d*.55,B[0],B[1],B[2],3300,1,.2],[d,B[0]*.9,B[1]*.95,B[2],3300,.5,.25],[d+.3,B[0]*.85,B[1]*.9,B[2],3300,0,0]];}
  const end=t+tl[tl.length-1][0];
  // the source: a sawtooth with wobble and a slow sag in pitch (zombies don't hold a note)
  const o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f0*(kind==='brains'?.95:1.05),t);
  if(kind==='brains'){o.frequency.linearRampToValueAtTime(f0*1.12,t+.35);o.frequency.linearRampToValueAtTime(f0*.82,end);}else o.frequency.linearRampToValueAtTime(f0*(.62+Math.random()*.15),end);
  const vib=ctx.createOscillator(),vg=ctx.createGain();vib.frequency.value=4+Math.random()*4;vg.gain.value=f0*.05;vib.connect(vg);vg.connect(o.frequency);
  const jit=ctx.createBufferSource();jit.buffer=AU.noise;jit.loop=true;jit.playbackRate.value=.02;const jg=ctx.createGain();jg.gain.value=f0*.25;jit.connect(jg);jg.connect(o.frequency);// irregular croak
  const vox=ctx.createGain();vox.gain.value=0;o.connect(vox);
  const br=ctx.createBufferSource();br.buffer=AU.noise;br.loop=true;const brf=ctx.createBiquadFilter();brf.type='bandpass';brf.frequency.value=1600;brf.Q.value=.6;const brg=ctx.createGain();brg.gain.value=0;br.connect(brf);brf.connect(brg);
  // the "z" at the end of brains
  const fz=ctx.createBufferSource();fz.buffer=AU.noise;fz.loop=true;const fzf=ctx.createBiquadFilter();fzf.type='highpass';fzf.frequency.value=4200;const fzg=ctx.createGain();fzg.gain.value=0;fz.connect(fzf);fzf.connect(fzg);
  if(!RASP)RASP=raspCurve();const sh=ctx.createWaveShaper();sh.curve=RASP;const mix=ctx.createGain();mix.gain.value=(brute?1.3:1)*(kind==='brains'?1.5:1.1);
  const F=[0,1,2,3].map(k=>{const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=[7,9,11,12][k];const g=ctx.createGain();g.gain.value=[1,.55,.28,.12][k]*(brute&&k===0?1.3:1);vox.connect(f);brg.connect(f);f.connect(g);g.connect(sh);return f;});
  sh.connect(mix);fzg.connect(mix);
  for(const [tt,f1,f2,f3,f4,vo,no] of tl){const at=t+tt,s=brute?.86:1;[f1,f2,f3,f4].forEach((v,k)=>F[k].frequency.linearRampToValueAtTime(v*s,at));
    vox.gain.linearRampToValueAtTime(vo*.5,at);brg.gain.linearRampToValueAtTime((kind==='brains'?.15:.5)*(vo>0?.6:.1)+(no&&kind!=='brains'?no:0),at);fzg.gain.linearRampToValueAtTime(kind==='brains'?no*.22:0,at);}
  F.forEach((f,k)=>f.frequency.setValueAtTime(tl[0][1+k]*(brute?.86:1),t));
  const p=panTo(mix,z.x,1.6*(z.sc||1),z.z);p.refDistance=2.5;p.rolloffFactor=1.35;
  for(const n of [o,vib,jit,br,fz]){n.start(t);n.stop(end+.1);}
  const v={z,p,end};VOX.push(v);o.onended=()=>{const i=VOX.indexOf(v);if(i>=0)VOX.splice(i,1);try{mix.disconnect();p.disconnect();}catch(e){}};}
// keep each voice on its zombie as it shambles
function voxUpdate(){if(!AU.ctx)return;for(const v of VOX){const z=v.z;if(v.p.positionX){v.p.positionX.value=z.x;v.p.positionZ.value=z.z;}else v.p.setPosition(z.x,1.6,z.z);}}
function groan(z){const d=Math.hypot(z.x-PL.x,z.z-PL.z);const close=d<26&&!z.dead;zvoice(z,close&&Math.random()<(d<12?.32:.18)?'brains':'moan');}
