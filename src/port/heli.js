// ================================================================ extraction: the evac helicopter flies in off the lough, lands on the pad, and you have to jump on before it lifts off
const HELI=(()=>{const g=new THREE.Group();const body=new THREE.Group();g.add(body);
  const prof=[[0,-3.35],[.55,-3.2],[1.0,-2.8],[1.28,-2.1],[1.4,-1.1],[1.42,.4],[1.36,1.5],[1.05,2.55],[.6,3.3],[.36,3.6]].map(([r,y])=>new THREE.Vector2(r,y));
  const fg=new THREE.LatheGeometry(prof,20);fg.rotateX(Math.PI/2);fg.scale(.92,1,1);
  {const p=fg.attributes.position,col=[];const C=new THREE.Color();for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
      if(z<-1.55&&y>-.25)C.setHex(0x101a26);// windscreen
      else if(Math.abs(x)>.95&&y>.05&&y<.85&&z>-1.5&&z<1.2&&!(x<0&&z>-.7&&z<1.05))C.setHex(0x131d29);// side windows
      else if(y>-.42&&y<-.08)C.setHex(0xff6a1a);// hi-vis band
      else if(y<-.95)C.setHex(0x1b1f25);else C.setHex(0x2d333c);col.push(C.r,C.g,C.b);}fg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));}
  const vc=lam({vertexColors:true});body.add(new THREE.Mesh(fg,vc));
  const dark=lam({color:0x1d2127}),orange=lam({color:0xff6a1a}),metal=lam({color:0x7c8590});
  const boom=new THREE.Mesh(new THREE.CylinderGeometry(.2,.4,6.4,10),dark);boom.rotation.x=Math.PI/2;boom.position.set(0,.35,6.3);body.add(boom);
  const fin=new THREE.Mesh(new THREE.BoxGeometry(.12,1.9,1.15),orange);fin.position.set(0,1.15,9.25);fin.rotation.x=-.35;body.add(fin);
  const stab=new THREE.Mesh(new THREE.BoxGeometry(2.5,.08,.62),dark);stab.position.set(0,.42,8.1);body.add(stab);
  const eng=new THREE.Mesh(new THREE.BoxGeometry(1.25,.55,2.3),dark);eng.position.set(0,1.38,.5);body.add(eng);
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(.11,.14,.55,8),metal);mast.position.set(0,1.85,.1);body.add(mast);
  // skids
  for(const s of [-1,1]){const sk=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,4.7,8),metal);sk.rotation.x=Math.PI/2;sk.position.set(s*1.2,-2.05,.1);body.add(sk);
    const tip=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.6,8),metal);tip.position.set(s*1.2,-1.86,-2.42);tip.rotation.x=-.9;body.add(tip);
    for(const zz of [-1.05,1.2]){const st=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1.1,6),metal);st.position.set(s*.98,-1.6,zz);st.rotation.z=s*.42;body.add(st);}}
  // the open side door: a warm-lit cabin behind an orange frame
  const doorM=new THREE.MeshBasicMaterial({color:0x8a6236,fog:true});const door=new THREE.Mesh(new THREE.PlaneGeometry(1.55,1.55),doorM);door.position.set(-1.33,-.15,.17);door.rotation.y=-Math.PI/2;body.add(door);
  const frameM=new THREE.MeshBasicMaterial({color:0xff7a22});for(const [w,h,y,z] of [[1.7,.08,.65,.17],[1.7,.08,-.95,.17],[.08,1.6,-.15,-.68],[.08,1.6,-.15,1.02]]){const f=new THREE.Mesh(new THREE.PlaneGeometry(w,h),frameM);f.position.set(-1.345,y,z);f.rotation.y=-Math.PI/2;body.add(f);}
  const seat=new THREE.Object3D();seat.position.set(-.55,-1.05,.25);body.add(seat);const doorPt=new THREE.Object3D();doorPt.position.set(-2.7,-2.05,.2);body.add(doorPt);
  // livery on both sides of the boom (invented: the lab's own evac flight)
  const lt=canvasTex(512,96,(c,w,h)=>{c.fillStyle='#1d2127';c.fillRect(0,0,w,h);c.fillStyle='#ff7a22';c.font='700 62px Barlow,sans-serif';c.textBaseline='middle';c.fillText('LAB EVAC 7',22,50);});
  for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.48),new THREE.MeshBasicMaterial({map:lt}));p.position.set(s*.37,.38,5.4);p.rotation.y=s*Math.PI/2;body.add(p);}
  // rotors
  const rotor=new THREE.Group();rotor.position.set(0,2.12,.1);body.add(rotor);const bg=new THREE.BoxGeometry(5.7,.05,.34);bg.translate(2.85,0,0);
  for(let k=0;k<4;k++){const b=new THREE.Mesh(bg,dark);b.rotation.y=k*Math.PI/2;b.rotation.x=.04;rotor.add(b);}
  const disc=new THREE.Mesh(new THREE.CircleGeometry(5.75,40),new THREE.MeshBasicMaterial({color:0x0b0d10,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide}));disc.rotation.x=-Math.PI/2;disc.position.copy(rotor.position);body.add(disc);
  const trot=new THREE.Group();trot.position.set(.2,1.45,9.45);body.add(trot);const tb=new THREE.BoxGeometry(.04,1.6,.16);for(let k=0;k<2;k++){const b=new THREE.Mesh(tb,dark);b.rotation.x=k*Math.PI/2;trot.add(b);}
  // beacons and the searchlight
  const bm=new THREE.MeshBasicMaterial({color:0xff2a2a,fog:false});const beacons=[[0,2.15,9.6],[0,-1.45,.3]].map(p=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),bm);m.position.set(...p);body.add(m);return m;});
  const search=new THREE.SpotLight(0xfff4dc,0,90,.32,.5,1.2);search.position.set(0,-1.2,-2.8);body.add(search);const tgt=new THREE.Object3D();tgt.position.set(0,-12,-9);body.add(tgt);search.target=tgt;
  const cone=new THREE.Mesh(new THREE.ConeGeometry(4.2,16,20,1,true),new THREE.MeshBasicMaterial({color:0xfff2d0,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  cone.geometry.translate(0,-8,0);cone.position.copy(search.position);cone.lookAt(new THREE.Vector3(0,-12,-9));cone.rotateX(-Math.PI/2);body.add(cone);
  // a jump-here chevron over the door
  const chev=new THREE.Mesh(new THREE.ConeGeometry(.35,.7,4),new THREE.MeshBasicMaterial({color:0x43f0ff,fog:false}));chev.rotation.x=Math.PI;chev.position.set(-2.4,1.3,.2);body.add(chev);
  g.visible=false;scene.add(g);
  return {g,body,rotor,trot,disc,door,doorM,frameM,seat,doorPt,beacons,search,cone,chev};})();
const EX={phase:'none',t:0,land:new THREE.Vector3(),far:new THREE.Vector3(),app:new THREE.Vector3(),dir:new THREE.Vector2(0,1),yaw:0,landYaw:0,prompt:0,off:new THREE.Vector2(),snd:null,board0:new THREE.Vector3()};
const _hp=new THREE.Vector3(),_hq=new THREE.Vector3();
function heliSound(on){if(!AU.ctx)return;const ctx=AU.ctx;if(on&&!EX.snd){const n=ctx.createBufferSource();n.buffer=AU.noise;n.loop=true;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=190;bp.Q.value=.8;
    const am=ctx.createGain();am.gain.value=.55;const lfo=ctx.createOscillator();lfo.type='sawtooth';lfo.frequency.value=11;const lg=ctx.createGain();lg.gain.value=.5;lfo.connect(lg);lg.connect(am.gain);
    const lo=ctx.createBiquadFilter();lo.type='lowpass';lo.frequency.value=900;n.connect(bp);bp.connect(am);const wh=ctx.createOscillator();wh.frequency.value=3150;const wg=ctx.createGain();wg.gain.value=.012;wh.connect(wg);
    const out=ctx.createGain();out.gain.value=0;am.connect(lo);lo.connect(out);wg.connect(out);const p=panTo(out,0,0,0);p.refDistance=22;p.rolloffFactor=1;
    for(const s of [n,lfo,wh])s.start();EX.snd={out,p,stop:()=>{try{out.gain.setTargetAtTime(0,ctx.currentTime,.3);setTimeout(()=>{for(const s of [n,lfo,wh])s.stop();out.disconnect();p.disconnect();},1500);}catch(e){}}};out.gain.setTargetAtTime(3.2,ctx.currentTime,2);}
  if(!on&&EX.snd){EX.snd.stop();EX.snd=null;}}
function extractBuild(){if(extract)scene.remove(extract.g);heliSound(false);EX.phase='none';EX.t=0;PL.ride=null;
  const g=new THREE.Group();const [x,z]=END,y=H(x,z);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,90,16,1,true),new THREE.MeshBasicMaterial({color:0x43f0ff,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));beam.position.y=45;g.add(beam);
  const pad=new THREE.Mesh(new THREE.RingGeometry(7.2,8,40),new THREE.MeshBasicMaterial({color:0x43f0ff,transparent:true,opacity:.6,side:THREE.DoubleSide}));pad.rotation.x=-Math.PI/2;pad.position.y=.12;g.add(pad);
  const hm=new THREE.Mesh(new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({map:canvasTex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='rgba(67,240,255,.75)';c.font='700 110px Barlow,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('H',w/2,h/2+6);}),transparent:true,depthWrite:false}));hm.rotation.x=-Math.PI/2;hm.position.y=.13;g.add(hm);
  g.position.set(x,y,z);scene.add(g);extract={g,beam,y};
  EX.land.set(x,y+2.1,z);
  // come in off the water: the direction from the pad with the most sea
  let best=-1e9,ba=0;for(let k=0;k<24;k++){const a=k/24*Math.PI*2;let s=0;for(const r of [80,160,260])s+=-sdWater(x+Math.cos(a)*r,z+Math.sin(a)*r);if(s>best){best=s;ba=a;}}
  EX.dir.set(Math.cos(ba),Math.sin(ba));EX.far.set(x+EX.dir.x*480,y+110,z+EX.dir.y*480);EX.app.set(x+EX.dir.x*70,y+32,z+EX.dir.y*70);
  HELI.g.visible=false;HELI.search.intensity=0;}
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function heliPose(dt){const h=HELI.g;const prev=_hq.copy(h.position);let pitch=0,roll=0;
  if(EX.phase==='inbound'){const k=clamp(1-holdT/MIS.hold,0,1);
    if(k<.68){const u=ease(k/.68);h.position.lerpVectors(EX.far,EX.app,u);h.position.y+=Math.sin(u*Math.PI)*12;}
    else if(k<.9){const u=(k-.68)/.22,e=1-Math.pow(1-u,2);_hp.copy(EX.land);_hp.y+=11;h.position.lerpVectors(EX.app,_hp,e);pitch=lerp(.0,.18,u)*(u<.8?1:(1-u)*5);}
    else{const u=(k-.9)/.1;_hp.copy(EX.land);_hp.y+=11;h.position.lerpVectors(_hp,EX.land,1-Math.pow(1-u,1.6));}
    const vx=h.position.x-prev.x,vz=h.position.z-prev.z,sp=Math.hypot(vx,vz)/Math.max(dt,1e-3);
    if(k<.9&&sp>.5)EX.yaw=Math.atan2(-vx,-vz);else{// pedal-turn so the open door faces you
      const want=Math.atan2(PL.x-EX.land.x,PL.z-EX.land.z)-Math.PI/2;EX.landYaw=want;let d=want-EX.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));EX.yaw+=clamp(d,-dt*.9,dt*.9);}
    if(k<.68)pitch=-clamp(sp/45,0,1)*.22;}
  else if(EX.phase==='landed'||EX.phase==='board'){h.position.copy(EX.land);h.position.y+=Math.sin(T*2.2)*.04;}
  else if(EX.phase==='lift'){const t=EX.t;const up=Math.min(1,t/3.5);h.position.copy(EX.land);h.position.y+=ease(up)*22+Math.max(0,t-3)*6;
    const fwd=Math.max(0,t-2.2);h.position.x+=EX.dir.x*fwd*fwd*2.2;h.position.z+=EX.dir.y*fwd*fwd*2.2;
    const want=Math.atan2(-EX.dir.x,-EX.dir.y);let d=want-EX.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));EX.yaw+=clamp(d,-dt*.5,dt*.5);pitch=-clamp(fwd*.08,0,.2);roll=Math.sin(t*.7)*.04;}
  h.rotation.set(0,EX.yaw,0);HELI.body.rotation.set(pitch,0,roll);}
function heliUpdate(dt){if(EX.phase==='none')return;const h=HELI.g;EX.t+=dt;heliPose(dt);
  const spin=EX.phase==='lift'||EX.phase==='inbound'?1:.9;HELI.rotor.rotation.y+=dt*spin*30;HELI.trot.rotation.x+=dt*60;HELI.disc.material.opacity=.13+Math.random()*.03;
  const bl=(T%1)<.12;for(const b of HELI.beacons)b.visible=bl;
  const night=OPT.tod==='night';HELI.search.intensity=(EX.phase==='lift'?0:night?50:22);HELI.cone.visible=EX.phase!=='lift';HELI.cone.material.opacity=night?.09:.05;
  const ready=EX.phase==='landed';HELI.chev.visible=ready;if(ready){HELI.chev.position.y=1.3+Math.sin(T*5)*.15;HELI.frameM.color.setHSL(.07,1,.5+.2*Math.sin(T*8));}else HELI.frameM.color.setHex(0xff7a22);
  if(EX.snd){if(EX.snd.p.positionX){EX.snd.p.positionX.value=h.position.x;EX.snd.p.positionY.value=h.position.y;EX.snd.p.positionZ.value=h.position.z;}}
  // downwash: grit and leaves blasted out under the rotor
  const agl=h.position.y-H(h.position.x,h.position.z);if(agl<22){const n=agl<6?4:2;for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,r=2+Math.random()*5;const gx=h.position.x+Math.cos(a)*r,gz=h.position.z+Math.sin(a)*r;
      PFX.add(gx,H(gx,gz)+.2,gz,Math.cos(a)*(5+Math.random()*4),.4+Math.random()*1.2,Math.sin(a)*(5+Math.random()*4),Math.random()<.3?0x5c6a2e:0x6a6253,.16,.9);}}
  if(EX.phase==='landed'){HELI.body.updateMatrixWorld(true);HELI.doorPt.getWorldPosition(_hp);const d=Math.hypot(PL.x-_hp.x,PL.z-_hp.z);const near=d<3.4;
    $('tJump').hidden=!(near&&coarse&&!renderer.xr.isPresenting);EX.prompt-=dt;
    if(near&&EX.prompt<=0){EX.prompt=1.2;msg(renderer.xr.isPresenting?'PRESS A TO JUMP ON!':coarse?'TAP JUMP TO GET ON!':'PRESS E TO JUMP ON!',1.3);}
    else if(!near&&EX.prompt<=0){EX.prompt=3;msg('GET TO THE HELICOPTER DOOR!',1.6);}
    if(near&&EX.jump)heliBoard();}
  if(EX.phase==='board'){const u=Math.min(1,EX.t/.7);HELI.body.updateMatrixWorld(true);HELI.seat.getWorldPosition(_hp);const gx=lerp(EX.board0.x,_hp.x,u),gz=lerp(EX.board0.z,_hp.z,u);
    PL.ride={y:lerp(EX.board0.y,_hp.y,u)+Math.sin(u*Math.PI)*.75};placeRider(gx,gz);if(u>=1){EX.phase='lift';EX.t=0;msg("YOU'RE ON! HOLD TIGHT",2.4);tone(520,780,.25,.08,'triangle');}}
  if(EX.phase==='lift'){HELI.body.updateMatrixWorld(true);HELI.seat.getWorldPosition(_hp);PL.ride={y:_hp.y};placeRider(_hp.x,_hp.z);if(EX.t>7.5&&state==='play'){heliSound(false);win();}}
  EX.jump=false;}
function placeRider(x,z){if(renderer.xr.isPresenting){rig.position.set(x-EX.off.x,PL.ride.y,z-EX.off.y);}PL.x=x;PL.z=z;}
function heliBoard(){EX.phase='board';EX.t=0;$('tJump').hidden=true;sfx('step');tone(300,600,.18,.1,'triangle');
  EX.board0.set(PL.x,H(PL.x,PL.z),PL.z);if(renderer.xr.isPresenting){camera.getWorldPosition(_v1);EX.off.set(_v1.x-rig.position.x,_v1.z-rig.position.z);}else EX.off.set(0,0);}
function extractUpdate(dt){const [ex,ez]=END;const d=Math.hypot(ex-PL.x,ez-PL.z);extract.beam.material.opacity=EX.phase==='none'?.12+Math.sin(T*3)*.05:.05;
  if(EX.phase==='none'&&d<8&&state==='play'){EX.phase='inbound';EX.t=0;holdT=MIS.hold;HELI.g.visible=true;HELI.g.position.copy(EX.far);EX.yaw=Math.atan2(EX.dir.x,EX.dir.y);heliSound(true);msg('HOLD ON! THE HELICOPTER IS INBOUND',2.6);siren();hordeT=4;}
  if(EX.phase==='inbound'){holdT-=dt;if(d>18&&Math.random()<dt*.4)msg('STAY NEAR THE PAD!',1.2);if(holdT<=0){holdT=0;EX.phase='landed';EX.t=0;EX.prompt=0;msg('IT\'S DOWN! JUMP ON!',2.4);tone(660,990,.3,.1,'triangle');}}
  heliUpdate(dt);}
