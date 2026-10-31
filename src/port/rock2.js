// ================================================================ the bonus round's music: an original 50s-style rock'n'roll stomper. 172 bpm, boogie-woogie bass, 12-bar blues in A, hammered piano, a growling sax lead
const RK={bars:[0,0,0,0,5,5,0,0,7,5,0,7]};// I I I I IV IV I I V IV I V
const BOOG=[0,4,7,9,10,9,7,4];// the classic boogie walk: root, 3rd, 5th, 6th, flat 7th and back
const A4n=69;const NN={A4:69,B4:71,C5:72,'C#5':73,D5:74,E5:76,'F#5':78,G5:79,'G#5':80,A5:81,B5:83,'G#4':68};
// the tune, written out bar by bar: [eighth, length in eighths, note]
const TUNE=[
 [[0,2,'E5'],[2,1,'E5'],[3,1,'F#5'],[4,2,'E5'],[6,2,'C#5']],
 [[0,1,'A4'],[1,1,'C5',1],[2,2,'C#5'],[4,4,'A4']],
 [[0,2,'E5'],[2,1,'E5'],[3,1,'G5'],[4,2,'A5'],[6,2,'G5']],
 [[0,2,'E5'],[2,2,'C#5'],[4,2,'C#5'],[6,2,'B4']],
 [[0,2,'F#5'],[2,1,'F#5'],[3,1,'A5'],[4,2,'F#5'],[6,2,'D5']],
 [[0,1,'A4'],[1,1,'C5',1],[2,2,'D5'],[4,4,'F#5']],
 [[0,2,'E5'],[2,1,'E5'],[3,1,'F#5'],[4,2,'E5'],[6,2,'C#5']],
 [[0,2,'A4'],[2,2,'C#5'],[4,4,'E5']],
 [[0,2,'B5'],[2,2,'G#5'],[4,2,'E5'],[6,2,'B4']],
 [[0,2,'A5'],[2,2,'F#5'],[4,2,'D5'],[6,2,'A4']],
 [[0,1,'C5',1],[1,1,'C#5'],[2,2,'E5'],[4,1,'A5'],[5,1,'G5'],[6,2,'E5']],
 [[0,2,'E5'],[2,2,'D5'],[4,2,'B4'],[6,2,'G#4']]];
const spbR=()=>60/172/2;
function rkPiano(t,notes,vol,len){const ctx=AU.ctx;const g=ctx.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(vol*.25,t+len*.6);g.gain.exponentialRampToValueAtTime(.0005,t+len);
  const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(5200,t);f.frequency.exponentialRampToValueAtTime(1400,t+len);f.connect(g);g.connect(MU.bus);g.connect(MU.verb);
  for(const n of notes){for(const [ty,m,v] of [['triangle',1,1],['square',2,.18],['sine',3,.12]]){const o=ctx.createOscillator();o.type=ty;o.frequency.value=MF(n)*m;o.detune.value=(Math.random()-.5)*6;const og=ctx.createGain();og.gain.value=v/notes.length;o.connect(og);og.connect(f);o.start(t);o.stop(t+len+.02);}}}
function rkBass(t,n,len){const ctx=AU.ctx;const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.2,t+.006);g.gain.exponentialRampToValueAtTime(.06,t+len*.5);g.gain.exponentialRampToValueAtTime(.0005,t+len);
  const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(1500,t);f.frequency.exponentialRampToValueAtTime(380,t+len);f.Q.value=1.5;f.connect(g);g.connect(MU.bus);
  for(const [ty,m,v] of [['triangle',1,1],['sawtooth',1,.35],['sine',.5,.5]]){const o=ctx.createOscillator();o.type=ty;o.frequency.value=MF(n)*m;const og=ctx.createGain();og.gain.value=v;o.connect(og);og.connect(f);o.start(t);o.stop(t+len+.02);}}
let SAXC=null;
function rkSax(t,n,len,bend,honk){const ctx=AU.ctx;if(!SAXC){SAXC=new Float32Array(512);for(let i=0;i<512;i++){const x=i/255.5-1;SAXC[i]=Math.tanh(x*2.4);}}
  const f0=MF(n);const out=ctx.createGain();out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(honk?.11:.085,t+.025);out.gain.setValueAtTime(honk?.1:.08,t+Math.max(.03,len-.06));out.gain.linearRampToValueAtTime(0,t+len);
  const sh=ctx.createWaveShaper();sh.curve=SAXC;const pk1=ctx.createBiquadFilter();pk1.type='peaking';pk1.frequency.value=1150;pk1.Q.value=1.2;pk1.gain.value=9;const pk2=ctx.createBiquadFilter();pk2.type='peaking';pk2.frequency.value=2600;pk2.Q.value=1.6;pk2.gain.value=6;
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=honk?4200:3400;const pre=ctx.createGain();pre.gain.value=honk?1.6:1.1;
  pre.connect(sh);sh.connect(pk1);pk1.connect(pk2);pk2.connect(lp);lp.connect(out);out.connect(MU.bus);out.connect(MU.verb);
  const vib=ctx.createOscillator(),vg=ctx.createGain();vib.frequency.value=5.6;vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(len>.3?f0*.014:0,t+Math.min(.25,len));vib.connect(vg);
  for(const [ty,dt,v] of [['sawtooth',-6,.5],['sawtooth',7,.5],['square',0,.25]]){const o=ctx.createOscillator();o.type=ty;o.detune.value=dt;o.frequency.setValueAtTime(bend?f0*.943:f0,t);if(bend)o.frequency.exponentialRampToValueAtTime(f0,t+.07);vg.connect(o.frequency);const og=ctx.createGain();og.gain.value=v*.5;o.connect(og);og.connect(pre);o.start(t);o.stop(t+len+.02);}
  vib.start(t);vib.stop(t+len+.02);}
function rkWoo(t){const ctx=AU.ctx;const o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(520,t);o.frequency.exponentialRampToValueAtTime(980,t+.18);o.frequency.exponentialRampToValueAtTime(760,t+.7);
  const v=ctx.createOscillator(),vg=ctx.createGain();v.frequency.value=7;vg.gain.value=22;v.connect(vg);vg.connect(o.frequency);const out=ctx.createGain();out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(.09,t+.05);out.gain.linearRampToValueAtTime(0,t+.75);
  for(const [fr,q,gn] of [[420,6,1],[900,8,.5],[2600,10,.2]]){const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=fr;f.Q.value=q;const g=ctx.createGain();g.gain.value=gn;o.connect(f);f.connect(g);g.connect(out);}
  out.connect(MU.bus);out.connect(MU.verb);o.start(t);v.start(t);o.stop(t+.8);v.stop(t+.8);}
function rockTick(t,step){const e=spbR();const chorus=(step/96)|0,inC=step%96,bar=(inC/8)|0,b=inC%8,iv=RK.bars[bar],root=57+iv;// A3 = 57
  const honkChorus=chorus%2===1;
  // drums: big kick on 1 and 3, a cracking backbeat, eighth-note hats, crash at the top, snare fill into the turnaround
  if(b===0||b===4)drum(t,58,.8,.3,0);if(b===2||b===6)snare(t,.62);if(b===7&&bar%4===3)drum(t+e*.5,60,.4,.2,0);
  hat(t,b%2?.06:.11,.045);if(inC===0)crash(t,.22);if(bar===11&&b>=4)snare(t+e*.5,.35+b*.04);
  // the boogie-woogie walk, straight eighths
  rkBass(t,root-12+BOOG[b],e*.92);
  // hammered piano: the chord in the right hand on every eighth, accented on the beat, a run up the keys to close each chorus
  const tri=[root+12,root+16,root+19,root+22];rkPiano(t,b%2?tri.slice(0,3):tri,b%2?.07:.1,e*.9);
  if(bar===11)rkPiano(t+e*.5,[root+24+[0,4,7,10,12,16,19,24][b]],.05,e*.4);
  // the tune (first time round), then a honking sax chorus over the changes
  if(!honkChorus){for(const [s0,len,nm,bend] of TUNE[bar])if(s0===b)rkSax(t,NN[nm],e*len*.95,!!bend,false);}
  else{const pat=[[0,1,12],[1,1,12],[2,2,12,1],[4,1,10],[5,1,12],[6,2,7]];for(const [s0,len,ofs,bend] of pat)if(s0===b)rkSax(t,root+ofs,e*len*.92,!!bend,true);if(inC===0)rkWoo(t-.05);}}
