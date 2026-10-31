// ---------------------------------------------------------------- the roundabout where Duke Street meets Church Street at the top of the Square
function dukeRoundabout(){const cx=-15,cz=-58,R=10.5,y=Math.max(H(cx,cz),nearest(cx,cz)[0]<W2+VERGE+3?P[nearest(cx,cz)[1]].y:-99)+.05;const g=new THREE.Group();g.position.set(cx,y,cz);
  const asph=lam({map:asphaltTex(),color:0x9a9aa0});const disc=new THREE.Mesh(new THREE.CircleGeometry(R,40),asph);disc.rotation.x=-Math.PI/2;disc.position.y=.02;g.add(disc);
  // dashed give-way ring and the island
  const dash=new THREE.MeshBasicMaterial({color:0xeeeee6,fog:true});for(let k=0;k<28;k++){const a=k/28*Math.PI*2;const d=new THREE.Mesh(new THREE.BoxGeometry(.9,.02,.18),dash);d.position.set(Math.cos(a)*R*.96,.04,Math.sin(a)*R*.96);d.rotation.y=-a+Math.PI/2;g.add(d);}
  const kerb=new THREE.Mesh(new THREE.CylinderGeometry(3.3,3.4,.22,28),lam({color:0xb9b6ae}));kerb.position.y=.11;g.add(kerb);
  const isl=new THREE.Mesh(new THREE.CylinderGeometry(3.05,3.05,.24,28),lam({map:TX.pavement||TX.stone,color:0xd4d0c6}));isl.position.y=.13;g.add(isl);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.4,.06,4,28),dash);ring.rotation.x=Math.PI/2;ring.position.y=.27;g.add(ring);
  // the blue roundabout sign on a pole in the middle
  const pole=lam({color:0x8a9098});const rbSign=canvasTex(64,64,(c,w,h)=>{c.fillStyle='#1d5fd0';c.beginPath();c.arc(32,32,30,0,7);c.fill();c.strokeStyle='#fff';c.lineWidth=5;for(let k=0;k<3;k++){const a=k/3*Math.PI*2;c.beginPath();c.arc(32,32,15,a+.3,a+1.6);c.stroke();
    const ex=32+Math.cos(a+1.6)*15,ey=32+Math.sin(a+1.6)*15;c.fillStyle='#fff';c.beginPath();c.arc(ex,ey,4,0,7);c.fill();}});
  const p0=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,2.6,6),pole);p0.position.y=1.5;g.add(p0);for(const r of [0,Math.PI/2,Math.PI,-Math.PI/2]){const sg=new THREE.Mesh(new THREE.CircleGeometry(.36,18),lam({map:rbSign}));sg.position.set(Math.sin(r)*.06,2.55,Math.cos(r)*.06);sg.rotation.y=r;g.add(sg);}
  // the splitter island on the Church Street approach: kerbed, a give-way sign, a roundabout sign and a keep-left bollard
  const ax=-5-cx,az=-48-cz,al=Math.hypot(ax,az);const ux=ax/al,uz=az/al;const sp=new THREE.Group();sp.position.set(ux*(R+4.5),0,uz*(R+4.5));sp.rotation.y=Math.atan2(ux,uz);g.add(sp);
  const sh=new THREE.Shape();sh.moveTo(-.9,-3.2);sh.lineTo(.9,-3.2);sh.lineTo(.25,3.2);sh.lineTo(-.25,3.2);sh.closePath();const sg2=new THREE.ExtrudeGeometry(sh,{depth:.22,bevelEnabled:false});sg2.rotateX(-Math.PI/2);
  const spl=new THREE.Mesh(sg2,lam({map:TX.pavement||TX.stone,color:0xcfcac0}));sp.add(spl);
  const gw=canvasTex(64,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#d8201a';c.beginPath();c.moveTo(4,6);c.lineTo(60,6);c.lineTo(32,60);c.closePath();c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(15,12);c.lineTo(49,12);c.lineTo(32,46);c.closePath();c.fill();c.fillStyle='#111';c.font='700 9px Arial';c.textAlign='center';c.fillText('GIVE',32,22);c.fillText('WAY',32,31);});
  const p1=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,2.8,6),pole);p1.position.set(0,1.6,1.2);sp.add(p1);
  const gws=new THREE.Mesh(new THREE.PlaneGeometry(.8,.8),new THREE.MeshLambertMaterial({map:gw,transparent:true,alphaTest:.3,side:THREE.DoubleSide}));gws.position.set(0,2.25,1.25);sp.add(gws);
  const rbs=new THREE.Mesh(new THREE.CircleGeometry(.33,18),lam({map:rbSign,side:THREE.DoubleSide}));rbs.position.set(0,2.95,1.25);sp.add(rbs);
  const bol=new THREE.Mesh(new THREE.BoxGeometry(.32,.8,.32),lam({color:0xf2c418}));bol.position.set(0,.62,2.6);sp.add(bol);const bs=new THREE.Mesh(new THREE.CircleGeometry(.14,14),lam({color:0x1d5fd0}));bs.position.set(0,.75,2.77);sp.add(bs);
  // the message-sign trailer, warning everyone
  const tr=new THREE.Group();tr.position.set(ux*(R+2)-uz*4,0,uz*(R+2)+ux*4);tr.rotation.y=Math.atan2(ux,uz);g.add(tr);const yel=lam({color:0xe8b21a}),gry=lam({color:0x6a6e74});
  const bed=new THREE.Mesh(new THREE.BoxGeometry(1.6,.25,2.4),gry);bed.position.y=.55;tr.add(bed);for(const s of [-1,1]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.2,10),lam({color:0x151515}));wh.rotation.z=Math.PI/2;wh.position.set(s*.85,.32,0);tr.add(wh);}
  for(const s of [-1,1]){const bx=new THREE.Mesh(new THREE.BoxGeometry(.7,.35,.6),yel);bx.position.set(s*.4,.85,.6);tr.add(bx);}
  const mast=new THREE.Mesh(new THREE.BoxGeometry(.12,2.2,.12),gry);mast.position.set(0,1.7,-.4);tr.add(mast);
  const vm=new THREE.MeshBasicMaterial({map:canvasTex(128,96,(c,w,h)=>{c.fillStyle='#0c0c0c';c.fillRect(0,0,w,h);c.fillStyle='#f0a020';c.font='700 15px monospace';c.textAlign='center';['ROAD CLOSED','ZOMBIES','7PM-6AM','TURN BACK'].forEach((t,i)=>c.fillText(t,w/2,20+i*21));}),fog:false});
  const scr=new THREE.Mesh(new THREE.BoxGeometry(2,1.5,.15),lam({color:0x1a1a1a}));scr.position.set(0,2.9,-.4);tr.add(scr);const face=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.3),vm);face.position.set(0,2.9,-.32);tr.add(face);
  const face2=face.clone();face2.rotation.y=Math.PI;face2.position.z=-.48;tr.add(face2);
  const sol=new THREE.Mesh(new THREE.BoxGeometry(1.9,.05,1.1),lam({color:0x1c2a44}));sol.position.set(0,3.85,-.4);sol.rotation.x=-.3;tr.add(sol);
  SR.add(g);
  // the island and the trailer are solid
  SOLIDS.push({x:cx,z:cz,r:3.4,y});const tx=cx+ux*(R+2)-uz*4,tz=cz+uz*(R+2)+ux*4;SOLIDS.push({box:1,x:tx,y,z:tz,ry:Math.atan2(ux,uz),w:1.8,d:2.6,h:4});
  LMPOS.push([cx,cz]);LMDBG.push(['DUKE ST ROUNDABOUT',cx,cz,0,R]);}
