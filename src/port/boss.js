// ================================================================ Big Toasty: a giant golem of campfire-toasted marshmallows that wakes when extraction starts, stomps towards you and lobs red-hot marshmallows the size of a person
const BOSS=(()=>{const B={on:false,x:0,z:0,h:0,hp:1,maxhp:1,throwT:4,stepT:0,ph:0,dead:0,arm:0,shots:[],goo:[],pvx:0,pvz:0,lx:0,lz:0,popped:0,killed:false,roarT:0,hitFlash:0};
  // a rounded marshmallow shape, toasted golden and charred on top
  function mallowGeo(r,h,toast,seed){const pr=[];const rr=Math.min(r*.28,h*.3);pr.push(new THREE.Vector2(0,-h/2));for(let k=0;k<=5;k++){const a=-Math.PI/2+k/5*Math.PI/2;pr.push(new THREE.Vector2(r-rr+Math.cos(a)*rr,-h/2+rr+Math.sin(a)*rr));}
    for(let k=0;k<=5;k++){const a=k/5*Math.PI/2;pr.push(new THREE.Vector2(r-rr+Math.cos(a)*rr,h/2-rr+Math.sin(a)*rr));}pr.push(new THREE.Vector2(0,h/2));
    const g=new THREE.LatheGeometry(pr,22);const p=g.attributes.position,col=[];const C=new THREE.Color(),cream=new THREE.Color(0xf4ead6),gold=new THREE.Color(0xd99a48),burnt=new THREE.Color(0x3b2414);
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=Math.sin(x*1.7+seed)*Math.cos(z*1.9-seed*2)+Math.sin((x+z)*3.1+seed*3)*.5;const top=(y/(h/2)+1)/2;
      const t=clamp(toast*(.35+top*.9)+n*.25,0,1.3);C.copy(cream).lerp(gold,Math.min(1,t));if(t>.95)C.lerp(burnt,Math.min(1,(t-.95)*2.4));
      // lumpy
      const bump=1+.04*n;p.setX(i,x*bump);p.setZ(i,z*bump);col.push(C.r,C.g,C.b);}
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();return g;}
  const mat=lam({vertexColors:true,emissive:0x2a1a0c});
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);
  const add=(par,r,h,x,y,z,toast,rx=0,rz=0)=>{const m=new THREE.Mesh(mallowGeo(r,h,toast,x*3+y*7+z),mat);m.position.set(x,y,z);m.rotation.set(rx,0,rz);par.add(m);return m;};
  const legs=[-1,1].map(s=>{const L=new THREE.Group();L.position.set(s*2.6,9.5,0);body.add(L);for(let k=0;k<3;k++)add(L,2.1-k*.1,3.1,0,-1.6-k*3.0,0,.35+k*.05);return L;});
  const torso=new THREE.Group();torso.position.y=9.5;body.add(torso);
  add(torso,4.6,4.8,0,2.6,0,.45);add(torso,5.2,5.2,0,7.4,0,.55);add(torso,4.4,4.2,0,11.9,0,.75);
  const head=new THREE.Group();head.position.set(0,16.6,0);torso.add(head);add(head,3.5,4.2,0,0,0,1.05);
  const ember=new THREE.MeshBasicMaterial({color:0xff6a1a,fog:false});for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.55,10,8),ember);e.position.set(s*1.3,.6,-3.2);e.scale.set(1.2,.7,.5);head.add(e);}
  const mouthT=canvasTex(256,96,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#1a0a04';c.beginPath();c.moveTo(10,30);for(let k=0;k<=10;k++)c.lineTo(10+k*23.6,k%2?62:38);c.lineTo(246,30);c.quadraticCurveTo(128,96,10,30);c.fill();c.fillStyle='rgba(255,120,30,.85)';c.beginPath();c.ellipse(128,62,70,10,0,0,Math.PI*2);c.fill();});
  const mouth=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.35),new THREE.MeshBasicMaterial({map:mouthT,transparent:true,fog:false}));mouth.position.set(0,-.8,-3.45);mouth.rotation.y=Math.PI;head.add(mouth);
  // gooey drips
  const gooM=lam({color:0xf6efe0,emissive:0x2a2a22});for(let k=0;k<5;k++){const d=new THREE.Mesh(new THREE.ConeGeometry(.22,1.2+Math.random()*1.4,6),gooM);d.rotation.x=Math.PI;d.position.set((Math.random()-.5)*4,-2.2-Math.random()*.5,-2.9+Math.random()*.8);head.add(d);}
  const arms=[-1,1].map(s=>{const A=new THREE.Group();A.position.set(s*5.6,12.4,0);torso.add(A);for(let k=0;k<3;k++)add(A,1.55,2.6,0,-1.4-k*2.5,0,.5+k*.12);
    const hand=new THREE.Object3D();hand.position.set(0,-8.4,0);A.add(hand);A.userData.hand=hand;return A;});
  // the roasting skewer through its right arm, charred at the tip
  const sk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,13,6),lam({color:0x8a6236}));sk.position.set(0,-3.6,0);arms[1].add(sk);const tip=new THREE.Mesh(new THREE.ConeGeometry(.16,.9,6),lam({color:0x1a1410}));tip.position.set(0,-10.5,0);tip.rotation.x=Math.PI;arms[1].add(tip);
  g.visible=false;scene.add(g);
  // projectiles: person-sized hot marshmallows, glowing and smoking, with a warning ring where they'll land
  const shotGeo=mallowGeo(.85,1.7,.8,1.3);const shotMat=lam({vertexColors:true,emissive:0x8a3a08});
  const ringT=canvasTex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='rgba(255,80,30,1)';c.lineWidth=10;c.beginPath();c.arc(64,64,56,0,Math.PI*2);c.stroke();c.fillStyle='rgba(255,80,30,.25)';c.beginPath();c.arc(64,64,52,0,Math.PI*2);c.fill();});
  const gooT=canvasTex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='rgba(246,236,214,.95)';c.beginPath();for(let k=0;k<=24;k++){const a=k/24*Math.PI*2,r=44+Math.sin(k*2.7)*10+Math.random()*8;c.lineTo(64+Math.cos(a)*r,64+Math.sin(a)*r);}c.fill();c.fillStyle='rgba(217,154,72,.7)';c.beginPath();c.arc(56,58,18,0,Math.PI*2);c.fill();});
  const SPLASH=2.7;
  function reset(){B.on=false;g.visible=false;for(const s of B.shots){scene.remove(s.m);scene.remove(s.ring);}B.shots.length=0;for(const q of B.goo)scene.remove(q.m);B.goo.length=0;B.popped=0;B.killed=false;B.dead=0;PL.slow=0;}
  function spawn(){reset();const [ex,ez]=END;const a=Math.atan2(-EX.dir.y,-EX.dir.x);let bx=ex+Math.cos(a)*200,bz=ez+Math.sin(a)*200;
    // stay on land and in the map
    for(let k=0;k<24&&(sdWater(bx,bz)<5||bx<AREA.x0+20||bx>AREA.x1-20||bz<AREA.z0+20||bz>AREA.z1-20);k++){const b=a+(k%2?1:-1)*Math.ceil(k/2)*.26;bx=ex+Math.cos(b)*200;bz=ez+Math.sin(b)*200;}
    B.x=bx;B.z=bz;B.h=Math.atan2(-(PL.x-bx),-(PL.z-bz));B.maxhp=B.hp=1700*DIFF.hp;B.throwT=5;B.on=true;B.ph=0;B.rise=1;B.lx=PL.x;B.lz=PL.z;g.visible=true;roar();msg('BIG TOASTY HAS WOKEN UP!',2.8);setTimeout(()=>{if(B.on&&state==='play')msg('DODGE THE HOT MARSHMALLOWS!',2.4);},3000);}
  function roar(){if(!AU.ctx)return;const ctx=AU.ctx,t=ctx.currentTime;const out=ctx.createGain();out.gain.value=2.6;const p=panTo(out,B.x,22,B.z);p.refDistance=70;p.rolloffFactor=.6;
    for(const [f,ty,v] of [[44,'sawtooth',.5],[66,'sawtooth',.35],[88,'square',.15]]){const o=ctx.createOscillator();o.type=ty;o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*1.25,t+.6);o.frequency.linearRampToValueAtTime(f*.7,t+2.6);
      const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(300,t);fl.frequency.linearRampToValueAtTime(1100,t+.5);fl.frequency.linearRampToValueAtTime(220,t+2.6);const gg=ctx.createGain();gg.gain.setValueAtTime(0,t);gg.gain.linearRampToValueAtTime(v,t+.25);gg.gain.linearRampToValueAtTime(0,t+2.8);
      o.connect(fl);fl.connect(gg);gg.connect(out);o.start(t);o.stop(t+2.9);}
    const n=ctx.createBufferSource();n.buffer=AU.noise;const nf=ctx.createBiquadFilter();nf.type='bandpass';nf.frequency.value=700;nf.Q.value=.7;const ng=ctx.createGain();ng.gain.setValueAtTime(0,t);ng.gain.linearRampToValueAtTime(.4,t+.3);ng.gain.linearRampToValueAtTime(0,t+2.6);n.connect(nf);nf.connect(ng);ng.connect(out);n.start(t,Math.random());n.stop(t+2.7);}
  function thud(x,z,big){if(!AU.ctx)return;const ctx=AU.ctx,t=ctx.currentTime;const out=ctx.createGain();out.gain.value=big?2.4:1.6;const p=panTo(out,x,1,z);p.refDistance=big?45:12;p.rolloffFactor=.7;
    const o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(big?55:90,t);o.frequency.exponentialRampToValueAtTime(big?28:40,t+.4);const g2=ctx.createGain();g2.gain.setValueAtTime(.9,t);g2.gain.exponentialRampToValueAtTime(.001,t+.6);o.connect(g2);g2.connect(out);o.start(t);o.stop(t+.7);
    const n=ctx.createBufferSource();n.buffer=AU.noise;const nf=ctx.createBiquadFilter();nf.type=big?'lowpass':'highpass';nf.frequency.value=big?300:1800;const ng=ctx.createGain();ng.gain.setValueAtTime(big?.5:.45,t);ng.gain.exponentialRampToValueAtTime(.001,t+(big?.5:.9));n.connect(nf);nf.connect(ng);ng.connect(out);n.start(t,Math.random());n.stop(t+1);}
  function whoosh(x,y,z){if(!AU.ctx)return;const ctx=AU.ctx,t=ctx.currentTime;const n=ctx.createBufferSource();n.buffer=AU.noise;const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=1.5;f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(1400,t+.8);const g2=ctx.createGain();g2.gain.setValueAtTime(0,t);g2.gain.linearRampToValueAtTime(.9,t+.3);g2.gain.linearRampToValueAtTime(0,t+1);n.connect(f);f.connect(g2);const p=panTo(g2,x,y,z);p.refDistance=30;n.start(t,Math.random());n.stop(t+1.1);}
  function throwAt(){const hand=arms[1].userData.hand;g.updateMatrixWorld(true);const sp=hand.getWorldPosition(new THREE.Vector3());
    const d=Math.hypot(PL.x-sp.x,PL.z-sp.z);const tf=clamp(d/34,1.7,3.1);const G=12;
    // aim where you're heading (a bit), so standing still or running straight gets you hit
    const lead=.65+Math.random()*.3;let tx=PL.x+B.pvx*tf*lead+(Math.random()-.5)*2.5,tz=PL.z+B.pvz*tf*lead+(Math.random()-.5)*2.5;const ty=H(tx,tz);
    const v=new THREE.Vector3((tx-sp.x)/tf,(ty+.85-sp.y+.5*G*tf*tf)/tf,(tz-sp.z)/tf);
    const m=new THREE.Mesh(shotGeo,shotMat);m.position.copy(sp);scene.add(m);
    const ring=new THREE.Mesh(new THREE.PlaneGeometry(SPLASH*2,SPLASH*2),new THREE.MeshBasicMaterial({map:ringT,transparent:true,depthWrite:false,fog:false,opacity:.3}));ring.rotation.x=-Math.PI/2;ring.position.set(tx,ty+.15,tz);scene.add(ring);
    B.shots.push({m,ring,v,t:0,tf,G,spin:new THREE.Vector3(Math.random()*4-2,Math.random()*4-2,Math.random()*4-2),hp:3});whoosh(sp.x,sp.y,sp.z);}
  function splat(s,hitGround){const p=s.m.position;scene.remove(s.m);scene.remove(s.ring);
    for(let k=0;k<26;k++)PFX.add(p.x,p.y,p.z,(Math.random()-.5)*9,Math.random()*6,(Math.random()-.5)*9,k%3?0xf4ead6:0xff8a2a,.22,.9);thud(p.x,p.z,false);
    if(hitGround){const gm=new THREE.Mesh(new THREE.PlaneGeometry(SPLASH*2.1,SPLASH*2.1),new THREE.MeshBasicMaterial({map:gooT,transparent:true,depthWrite:false}));gm.rotation.x=-Math.PI/2;gm.rotation.z=Math.random()*6;gm.position.set(p.x,H(p.x,p.z)+.1,p.z);scene.add(gm);B.goo.push({m:gm,x:p.x,z:p.z,t:7});
      const d=Math.hypot(PL.x-p.x,PL.z-p.z);if(d<SPLASH&&!PL.ride&&state==='play'){const dmg=34*DIFF.dmg*(1-d/SPLASH*.4);PL.hp-=dmg;dmgTaken+=dmg;PL.hurtT=.45;PL.regenT=5;sfx('hurt');msg('SPLAT! HOT MARSHMALLOW!',1.4);}}}
  // the laser: hits on Big Toasty (a big upright capsule) and on marshmallows in flight
  function rayHit(o,d,tMax){if(!B.on||B.dead)return null;const R=6.2;const ox=o.x-B.x,oz=o.z-B.z;const a=d.x*d.x+d.z*d.z;if(a<1e-6)return null;const b=2*(ox*d.x+oz*d.z),c=ox*ox+oz*oz-R*R;const disc=b*b-4*a*c;if(disc<0)return null;
    const t=(-b-Math.sqrt(disc))/(2*a);if(t<0||t>tMax)return null;const y=o.y+d.y*t-H(B.x,B.z);return y>0&&y<26?t:null;}
  function shotHit(o,d,tMax){let best=null,bt=tMax;for(const s of B.shots){const c=s.m.position;const cx=c.x-o.x,cy=c.y-o.y,cz=c.z-o.z;const t=cx*d.x+cy*d.y+cz*d.z;if(t<0||t>bt)continue;const px=cx-d.x*t,py=cy-d.y*t,pz=cz-d.z*t;if(px*px+py*py+pz*pz<1.25*1.25){best=s;bt=t;}}return best?{s:best,t:bt}:null;}
  function damage(n,at){B.hp-=n;B.hitFlash=.08;if(at)for(let q=0;q<4;q++)PFX.add(at.x,at.y,at.z,(Math.random()-.5)*5,Math.random()*4,(Math.random()-.5)*5,q%2?0xf4ead6:0xff8a1e,.14,.5);
    if(B.hp<=0&&!B.dead){B.dead=.001;B.killed=true;msg('BIG TOASTY IS TOAST! +150 CREDITS',3);roar();for(const s of B.shots){scene.remove(s.m);scene.remove(s.ring);}B.shots.length=0;}}
  function popShot(s){B.popped++;const i=B.shots.indexOf(s);if(i>=0)B.shots.splice(i,1);splat(s,false);}
  function update(dt){// how fast you're moving (for leading the throws)
    const vx=(PL.x-B.lx)/Math.max(dt,1e-3),vz=(PL.z-B.lz)/Math.max(dt,1e-3);B.pvx=lerp(B.pvx,vx,Math.min(1,dt*3));B.pvz=lerp(B.pvz,vz,Math.min(1,dt*3));B.lx=PL.x;B.lz=PL.z;
    // the goo slows you
    PL.slow=0;for(let i=B.goo.length-1;i>=0;i--){const q=B.goo[i];q.t-=dt;q.m.material.opacity=Math.min(1,q.t);if(q.t<=0){scene.remove(q.m);B.goo.splice(i,1);continue;}if(Math.hypot(PL.x-q.x,PL.z-q.z)<SPLASH*.9)PL.slow=.55;}
    // shots in flight
    for(let i=B.shots.length-1;i>=0;i--){const s=B.shots[i];s.t+=dt;s.v.y-=s.G*dt;s.m.position.addScaledVector(s.v,dt);s.m.rotation.x+=s.spin.x*dt;s.m.rotation.y+=s.spin.y*dt;s.m.rotation.z+=s.spin.z*dt;
      const k=clamp(s.t/s.tf,0,1);s.ring.material.opacity=.25+.65*k;s.ring.scale.setScalar(1.3-.3*k);
      const p=s.m.position;if(Math.random()<.9)PFX.add(p.x,p.y,p.z,(Math.random()-.5),Math.random()*.8,(Math.random()-.5),Math.random()<.6?0xffa040:0x5a5048,.3,.6);
      const pd=Math.hypot(p.x-PL.x,p.z-PL.z),py=p.y-(H(PL.x,PL.z)+1);if(pd<1.3&&Math.abs(py)<1.4&&!PL.ride){B.shots.splice(i,1);s.m.position.set(PL.x,H(PL.x,PL.z)+.8,PL.z);splat(s,true);continue;}
      if(p.y<=H(p.x,p.z)+.85&&s.t>.3){B.shots.splice(i,1);splat(s,true);}}
    if(!B.on)return;
    const by=H(B.x,B.z);
    if(B.dead){B.dead+=dt;// melts down into a puddle
      const k=Math.min(1,B.dead/3.5);body.scale.set(1+k*.5,Math.max(.05,1-k),1+k*.5);body.rotation.x=k*.25;g.position.set(B.x,by,B.z);if(Math.random()<.6)PFX.add(B.x+(Math.random()-.5)*10,by+Math.random()*8*(1-k),B.z+(Math.random()-.5)*10,(Math.random()-.5)*3,Math.random()*2,(Math.random()-.5)*3,0xf4ead6,.3,1);
      if(B.dead>6){B.on=false;g.visible=false;}return;}
    const dx=PL.x-B.x,dz=PL.z-B.z,d=Math.hypot(dx,dz);const want=Math.atan2(-dx,-dz);let dh=want-B.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));B.h+=clamp(dh,-dt*.6,dt*.6);
    const walking=d>16&&!PL.ride;const sp=walking?2.7*DIFF.spd:0;B.x-=Math.sin(B.h)*sp*dt;B.z-=Math.cos(B.h)*sp*dt;if(walking)B.ph+=dt*1.5;
    // stomping gait
    const sw=Math.sin(B.ph);legs[0].rotation.x=sw*.32;legs[1].rotation.x=-sw*.32;body.position.y=Math.abs(Math.cos(B.ph))*.6;torso.rotation.z=sw*.05;arms[0].rotation.x=-sw*.25;
    const sNow=Math.sign(Math.cos(B.ph));if(walking&&sNow!==B.stepS){B.stepS=sNow;thud(B.x,B.z,true);if(d<140&&!renderer.xr.isPresenting)SHAKE=Math.max(SHAKE,.35*(1-d/140));for(let k=0;k<10;k++)PFX.add(B.x+(Math.random()-.5)*8,by+.3,B.z+(Math.random()-.5)*8,(Math.random()-.5)*6,1+Math.random()*2,(Math.random()-.5)*6,0x6a6253,.3,1);}
    // wind up and throw
    B.throwT-=dt;const rate={easy:3.4,normal:2.5,hard:1.8}[dkey];
    if(B.throwT<.9)B.arm=Math.min(1,B.arm+dt*2.2);else B.arm=Math.max(0,B.arm-dt*3);arms[1].rotation.x=-B.arm*2.3+(B.throwT>2?-sw*.25:0);
    if(B.throwT<=0&&!PL.ride&&state==='play'&&d<230){throwAt();B.throwT=rate*(.8+Math.random()*.4);B.arm=0;}
    // up close it stamps on you
    if(d<12&&!PL.ride){B.roarT-=dt;if(B.roarT<=0){B.roarT=2.6;thud(PL.x,PL.z,true);const dmg=40*DIFF.dmg;PL.hp-=dmg;dmgTaken+=dmg;PL.hurtT=.5;msg('STOMP! GET AWAY FROM IT!',1.4);}}
    // rising embers off its toasted head, and a hit flash
    if(Math.random()<.5){const hx=B.x+(Math.random()-.5)*5,hz=B.z+(Math.random()-.5)*5;PFX.add(hx,by+26+Math.random()*3,hz,(Math.random()-.5),1+Math.random()*1.5,(Math.random()-.5),Math.random()<.7?0xff7a22:0x4a4038,.25,1.4);}
    B.hitFlash=Math.max(0,B.hitFlash-dt);mat.emissive.setHex(B.hitFlash>0?0xff7a2a:0x2a1a0c);
    g.position.set(B.x,by,B.z);g.rotation.y=B.h;}
  return {B,spawn,reset,update,rayHit,shotHit,damage,popShot,g};})();
let SHAKE=0;
