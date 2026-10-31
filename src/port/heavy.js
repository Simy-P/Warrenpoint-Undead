// ================================================================ the chopper's door cannon: a heavy proton emitter on a swivel mount, used whenever you're riding
const HEAVY=(()=>{const g=new THREE.Group();const dark=lam({color:0x22262d}),steel=lam({color:0x8a929c}),hv=lam({color:0xff7a22,emissive:0x3a1400});
  const glowM=new THREE.MeshBasicMaterial({color:0x43f0ff,fog:false});
  const yoke=new THREE.Mesh(new THREE.BoxGeometry(.5,.12,.3),dark);yoke.position.set(0,-.05,.1);g.add(yoke);
  const body=new THREE.Mesh(new THREE.BoxGeometry(.34,.3,.72),dark);body.position.set(0,.12,.05);g.add(body);
  for(const s of [-1,1]){const st=new THREE.Mesh(new THREE.BoxGeometry(.02,.31,.5),hv);st.position.set(s*.175,.12,.05);g.add(st);}
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.085,.105,1.05,14),steel);barrel.rotation.x=Math.PI/2;barrel.position.set(0,.12,-.78);g.add(barrel);
  const rings=[];for(let k=0;k<5;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(.13,.024,8,20),glowM);r.position.set(0,.12,-.42-k*.17);g.add(r);rings.push(r);}
  const tip=new THREE.Mesh(new THREE.CylinderGeometry(.13,.09,.16,14),dark);tip.rotation.x=Math.PI/2;tip.position.set(0,.12,-1.34);g.add(tip);
  const lens=new THREE.Mesh(new THREE.CircleGeometry(.075,14),new THREE.MeshBasicMaterial({color:0xffa030,fog:false}));lens.position.set(0,.12,-1.425);lens.rotation.y=Math.PI;g.add(lens);
  for(const s of [-1,1]){const h=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.22,8),dark);h.position.set(s*.22,.1,.42);g.add(h);const a=new THREE.Mesh(new THREE.BoxGeometry(.12,.04,.04),dark);a.position.set(s*.16,.1,.42);g.add(a);}
  const cable=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,.0,.4),new THREE.Vector3(.05,-.25,.6),new THREE.Vector3(.2,-.55,.7)]),12,.035,6),dark);g.add(cable);
  const muzzle=new THREE.Object3D();muzzle.position.set(0,.12,-1.45);g.add(muzzle);
  g.visible=false;scene.add(g);return {g,muzzle,rings,glowM};})();
const HV={on:false,pivot:new THREE.Object3D()};
// where the cannon sits: on the door sill, below and just outside your seat
function heavyMount(){if(!HV.pivot.parent)HELI.body.add(HV.pivot);HV.pivot.position.set(-1.62,-.42,.2);}
const _hd=new THREE.Vector3(),_ht=new THREE.Vector3();
function heavyUpdate(){const on=!!PL.ride&&(BON.active?BON.phase!=='fadeout':EX.phase==='lift');HV.on=on;HEAVY.g.visible=on;GUN.g.visible=!on;if(!on)return;
  heavyMount();HELI.body.updateMatrixWorld(true);HV.pivot.getWorldPosition(HEAVY.g.position);
  // swing it to wherever you're aiming: your view, or your gun hand's controller in VR
  if(renderer.xr.isPresenting&&CTL[gunHand()]?.grip){const G=CTL[gunHand()].grip;G.getWorldQuaternion(_q1);_hd.set(0,0,-1).applyQuaternion(_q1);}else camera.getWorldDirection(_hd);
  _ht.copy(HEAVY.g.position).add(_hd);HEAVY.g.lookAt(_ht);HEAVY.g.rotateY(Math.PI);// lookAt points +z at the target; the barrel runs down -z
  const f=LZ.firing?1:0;HEAVY.glowM.color.setHSL(LZ.over?0:f?.07+.04*Math.random():.52,1,.5+.2*f);if(f){HEAVY.g.position.addScaledVector(_hd,-.015*Math.random());}
  HEAVY.g.updateMatrixWorld(true);}
// the barrel the beam really comes out of
const aimMuzzle=()=>HV.on?HEAVY.muzzle:GUN.muzzle;
