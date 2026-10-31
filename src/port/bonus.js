// ================================================================ bonus round: ride the chopper's door seat and cover a survivor running for their own pick-up
const NPC=(()=>{const g=new THREE.Group();const jk=lam({color:0xf2d21b,emissive:0x2a2400}),dk=lam({color:0x2a2f38}),sk=lam({color:0xe0b48f});
  const torso=new THREE.Mesh(new THREE.BoxGeometry(.5,.62,.3),jk);torso.position.y=1.18;g.add(torso);const strip=new THREE.Mesh(new THREE.BoxGeometry(.52,.07,.32),lam({color:0xd8dde2,emissive:0x444444}));strip.position.y=1.08;g.add(strip);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.15,10,8),sk);head.position.y=1.66;g.add(head);
  const limb=(w,h,m,x,y)=>{const p=new THREE.Group();p.position.set(x,y,0);const l=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),m);l.position.y=-h/2;p.add(l);g.add(p);return p;};
  const legL=limb(.17,.86,dk,-.13,.88),legR=limb(.17,.86,dk,.13,.88),armL=limb(.12,.62,jk,-.32,1.46),armR=limb(.12,.62,jk,.32,1.46);
  const mark=new THREE.Mesh(new THREE.ConeGeometry(.45,.9,4),new THREE.MeshBasicMaterial({color:0x5dff8a,fog:false}));mark.rotation.x=Math.PI;mark.position.y=3.2;g.add(mark);
  g.visible=false;scene.add(g);return {g,legL,legR,armL,armR,mark,x:0,z:0,h:0,hp:100,ph:0,grab:0};})();
const BON={active:false,done:false,phase:'',t:0,saved:false,E:null,D:null,ang:0,fade:0,res:null};
// a black veil for the scene change (works in the headset too)
const FADE=(()=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(4,4),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:0,depthTest:false,depthWrite:false,fog:false}));m.position.z=-.25;m.renderOrder=60;m.visible=false;camera.add(m);return m;})();
function bfsFrom(gx,gz){const D=new Int32Array(NW*ND).fill(-1),Q=new Int32Array(NW*ND);const s=navIdx(gx,gz);if(s<0)return D;let h=0,t=0;D[s]=0;Q[t++]=s;
  while(h<t){const c=Q[h++];const x=c%NW;for(const o of [-1,1,-NW,NW]){const n=c+o;if(n<0||n>=NW*ND)continue;if((o===-1&&x===0)||(o===1&&x===NW-1))continue;if(D[n]<0&&!NAV[n]){D[n]=D[c]+1;Q[t++]=n;}}}return D;}
function bonusPickRoute(){// a random start somewhere on the streets, and a pick-up a good run away
  for(let tries=0;tries<40;tries++){const sx=lerp(AREA.x0+80,AREA.x1-80,Math.random()),sz=lerp(AREA.z0+70,AREA.z1-70,Math.random());const S=snapWalk(sx,sz,40);if(!S)continue;const ni=navIdx(S[0],S[1]);if(ni<0||NAV[ni])continue;
    const D=bfsFrom(S[0],S[1]);const cand=[];for(let i=0;i<D.length;i+=7){const d=D[i]*NC;if(d>230&&d<330){const x=AREA.x0+(i%NW+.5)*NC,z=AREA.z0+((i/NW|0)+.5)*NC;if(cellAt(x,z)===3)cand.push([x,z]);}}
    if(cand.length<5)continue;const E=cand[(Math.random()*cand.length)|0];return {S,E};}return null;}
function bonusStart(){const r=bonusPickRoute();if(!r){finishMission();return;}
  BON.active=true;BON.done=false;BON.phase='fadeout';BON.t=0;BON.saved=false;BON.route=r;FADE.visible=true;msg('BONUS ROUND!',2);}
function bonusBegin(){const {S,E}=BON.route;BON.E=E;BON.D=bfsFrom(E[0],E[1]);
  Z.length=0;BOSS.reset();musicBossOn(false);MU.rock=true;MU.step=0;MU.bar=0;
  NPC.x=S[0];NPC.z=S[1];NPC.hp=100;NPC.grab=0;NPC.g.visible=true;TGT=NPC;END=E;totalDist=Math.hypot(E[0]-S[0],E[1]-S[1]);
  extract.g.position.set(E[0],H(E[0],E[1]),E[1]);extract.g.visible=true;
  EX.phase='bonus';BON.ang=Math.random()*Math.PI*2;const hp=bonusHeliTarget(0);HELI.g.position.copy(hp);HELI.g.visible=true;
  for(let k=0;k<Math.round(DIFF.cap*.45);k++)trySpawn(25,70,'walker');hordeT=18;spawnT=1;flowField(NPC.x,NPC.z);
  BON.phase='run';BON.t=0;msg('BONUS: COVER THE SURVIVOR!',2.6);BON.msgT=2.8;}
const _bt=new THREE.Vector3();
function bonusHeliTarget(dt){BON.ang+=dt*.16;const R=24;const cx=NPC.x+Math.sin(NPC.h)*-6,cz=NPC.z+Math.cos(NPC.h)*-6;_bt.set(cx+Math.cos(BON.ang)*R,Math.max(H(NPC.x,NPC.z),0)+24,cz+Math.sin(BON.ang)*R);return _bt;}
function bonusUpdate(dt){if(!BON.active)return;BON.t+=dt;
  if(BON.phase==='fadeout'){FADE.material.opacity=Math.min(1,BON.t/.8);if(BON.t>1){bonusBegin();}return;}
  if(BON.phase==='run'||BON.phase==='over'){FADE.material.opacity=Math.max(0,FADE.material.opacity-dt*1.5);FADE.visible=FADE.material.opacity>0;}
  if(BON.msgT>0){BON.msgT-=dt;if(BON.msgT<=0)msg('ZAP THE ZOMBIES BEFORE THEY GET THEM!',2.4);}
  // the survivor runs the shortest way to their pick-up
  if(BON.phase==='run'){const ni=navIdx(NPC.x,NPC.z);let tx=BON.E[0]-NPC.x,tz=BON.E[1]-NPC.z;
    if(ni>=0&&BON.D[ni]>1){let best=BON.D[ni],bi=-1;const ix=ni%NW;for(const [o,a,b] of DIRS8){const nn=ni+o;if(nn<0||nn>=NAV.length)continue;if(Math.abs((nn%NW)-ix)>1)continue;if(a&&(NAV[ni+a]||NAV[ni+b]))continue;const v=BON.D[nn];if(v>=0&&v<best){best=v;bi=nn;}}
      if(bi>=0){tx=AREA.x0+(bi%NW+.5)*NC-NPC.x;tz=AREA.z0+((bi/NW|0)+.5)*NC-NPC.z;}}
    const l=Math.hypot(tx,tz)||1;const sp=NPC.grab>0?.5:3.9;const [nx,nz]=slide(NPC.x,NPC.z,tx/l*sp*dt,tz/l*sp*dt,.28);NPC.x=nx;NPC.z=nz;
    const want=Math.atan2(-tx,-tz);let dh=want-NPC.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));NPC.h+=clamp(dh,-dt*8,dt*8);NPC.ph+=dt*(NPC.grab>0?4:11);NPC.grab=Math.max(0,NPC.grab-dt);
    if(Math.hypot(BON.E[0]-NPC.x,BON.E[1]-NPC.z)<4){BON.phase='over';BON.saved=true;BON.t=0;msg('SURVIVOR SAVED! +200 CREDITS',3);tone(660,990,.3,.1,'triangle');setTimeoutT(()=>tone(990,1320,.4,.1,'triangle'),.35);}
    if(NPC.hp<=0){BON.phase='over';BON.saved=false;BON.t=0;msg('THE SURVIVOR DIDN\\'T MAKE IT',3);tone(330,110,1.2,.12,'sawtooth');}}
  // pose the survivor
  const g=NPC.g;g.position.set(NPC.x,H(NPC.x,NPC.z),NPC.z);g.rotation.y=NPC.h;const sw=Math.sin(NPC.ph)*(BON.phase==='run'?.8:.1);NPC.legL.rotation.x=sw;NPC.legR.rotation.x=-sw;NPC.armL.rotation.x=-sw*.8;NPC.armR.rotation.x=sw*.8;
  if(NPC.hp<=0){g.rotation.x=Math.min(Math.PI/2,g.rotation.x+dt*3);}else g.rotation.x=0;NPC.mark.position.y=3.2+Math.sin(T*4)*.2;NPC.mark.material.color.setHSL(clamp(NPC.hp/100,0,1)*.33,1,.55);
  // the chopper circles them with the open door facing in
  const tgt=bonusHeliTarget(dt);HELI.g.position.lerp(tgt,1-Math.exp(-dt*1.2));const dx=NPC.x-HELI.g.position.x,dz=NPC.z-HELI.g.position.z;const wantY=Math.atan2(dz,-dx);let d=wantY-EX.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));EX.yaw+=clamp(d,-dt*1.2,dt*1.2);
  HELI.g.rotation.set(0,EX.yaw,0);HELI.body.rotation.set(0,0,-.06);HELI.body.updateMatrixWorld(true);HELI.seat.getWorldPosition(_hp);PL.ride={y:_hp.y};placeRider(_hp.x,_hp.z);
  if(BON.phase==='over'&&BON.t>3.2){BON.active=false;BON.done=true;NPC.g.visible=false;MU.rock=false;TGT=PL;heliSound(false);finishMission();}}
// tiny game-time timer (works in the fast test sim too)
const TT=[];function setTimeoutT(f,s){TT.push({f,t:s});}function ttUpdate(dt){for(let i=TT.length-1;i>=0;i--){TT[i].t-=dt;if(TT[i].t<=0){const f=TT[i].f;TT.splice(i,1);f();}}}
