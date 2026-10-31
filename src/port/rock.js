// ================================================================ the bonus round's music: an original flat-out 50s rock'n'roll boogie, in a retro MIDI-ish sound (12-bar in G)
const RK={key:43,bars:[0,0,0,0,5,5,0,0,7,5,0,7]};// I I I I IV IV I I V IV I V
const BOOG=[0,4,7,9,10,9,7,4];
function rkNote(t,f,d,vol,type,q=0){const ctx=AU.ctx;const o=ctx.createOscillator();o.type=type;o.frequency.value=f;const g=ctx.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0005,t+d);
  if(q){const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=q;o.connect(fl);fl.connect(g);}else o.connect(g);g.connect(MU.bus);o.start(t);o.stop(t+d+.05);}
function sax(t,n,d,bend){const ctx=AU.ctx;const o=ctx.createOscillator();o.type='sawtooth';const f=MF(n);o.frequency.setValueAtTime(bend?f*.94:f,t);if(bend)o.frequency.linearRampToValueAtTime(f,t+.06);
  const v=ctx.createOscillator(),vg=ctx.createGain();v.frequency.value=5.5;vg.gain.value=f*.012;v.connect(vg);vg.connect(o.frequency);
  const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1300;bp.Q.value=1.4;const lo=ctx.createBiquadFilter();lo.type='lowpass';lo.frequency.value=3200;
  const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.075,t+.02);g.gain.setValueAtTime(.065,t+d*.7);g.gain.linearRampToValueAtTime(0,t+d);
  o.connect(bp);bp.connect(lo);lo.connect(g);g.connect(MU.bus);g.connect(MU.verb);o.start(t);v.start(t);o.stop(t+d+.05);v.stop(t+d+.05);}
// the sax line: an original riff built from the blues scale, a different phrase each 2 bars
const BLUES=[0,3,5,6,7,10,12,15];let RIFF=null;
function newRiff(){RIFF=[];let p=0;for(let k=0;k<16;k++){if(Math.random()<.28){RIFF.push(null);continue;}p=clamp(p+((Math.random()*5)|0)-2,0,BLUES.length-1);RIFF.push({n:BLUES[p],len:Math.random()<.3?2:1,bend:Math.random()<.25});}
  RIFF[0]={n:0,len:2,bend:true};RIFF[8]={n:10,len:2,bend:true};}
const spbR=()=>60/184/2;
function rockTick(t,s){const step=s%96,bar=(step/8)|0,b=step%8,root=RK.key+RK.bars[bar],sw=spbR()*.18*(b%2);t+=sw;// a little swing
  if(step===0||!RIFF||step%16===0)newRiff();
  // drums: kick 1 & 3, snare backbeat, hats on the 8ths, a fill in the last bar
  if(b===0||b===4)drum(t,60,.6,.25,0);if(b===2||b===6)snare(t,.42);hat(t,b%2?.06:.1,.05);if(bar===11&&b>=4)drum(t,[150,125,105,88][b-4],.35,.18,600);
  // boogie-woogie bass
  rkNote(t,MF(root-12+BOOG[b]),spbR()*.95,.13,'square',900);
  // pounding piano: chord stabs on every 8th
  for(const iv of [12,16,19,22])rkNote(t,MF(root+iv),.12,.022,'triangle');if(b%2===0)rkNote(t,MF(root+24),.09,.018,'square',2400);
  // honking sax over the top
  const r=RIFF[step%16];if(r)sax(t,root+12+r.n,spbR()*r.len*.95,r.bend);}
