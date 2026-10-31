// ================================================================ the Whistledown Hotel, after the photo: white three storeys with slate-grey quoins and floor bands,
// full-height canted bay windows each crowned by a pointed gable with dark bargeboards and a finial, a purple-grey slate roof with big chimneys,
// arched doorways, window boxes, and a terrace of orange tables
function whistledownReal(x,z,ry){const w=36,h=10.8,d=16;const g=new THREE.Group();const f=[Math.sin(ry),Math.cos(ry)],r=[Math.cos(ry),-Math.sin(ry)];
  let y=-1e9;for(const a of [-1,1])for(const b of [-1,1])y=Math.max(y,groundH(x+r[0]*a*w/2+f[0]*b*d/2,z+r[1]*a*w/2+f[1]*b*d/2));
  const white=lam({color:0xf3f4f6}),grey=lam({color:0x6f7588}),dark=lam({color:0x2a2d36}),slate=lam({map:TX.slate,color:0x8d8299,side:THREE.DoubleSide});
  const box=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),white);box.position.y=h/2;g.add(box);
  const base=new THREE.Mesh(new THREE.BoxGeometry(w+.4,6,d+.4),lam({color:0xbfc1bd}));base.position.y=-3;g.add(base);
  const F=d/2;// the front face
  // grey floor bands and quoins
  for(const yy of [3.65,7.25]){const b=new THREE.Mesh(new THREE.BoxGeometry(w+.1,.32,.18),grey);b.position.set(0,yy,F+.06);g.add(b);}
  for(const qx of [-w/2+.25,w/2-.25,8.6,-1.2])for(let yy=.4;yy<h-.3;yy+=.9){const qn=new THREE.Mesh(new THREE.BoxGeometry(qx===8.6||qx===-1.2?.45:.55,.42,.1),grey);qn.position.set(qx+((yy/.9|0)%2?.1:-.1),yy,F+.06);g.add(qn);}
  const eaves=new THREE.Mesh(new THREE.BoxGeometry(w+.6,.3,.5),dark);eaves.position.set(0,h,F+.15);g.add(eaves);
  // two-pane sash windows (white frames, dark glass), window boxes of flowers on the lower floors
  const sash=canvasTex(64,128,(c,W,H)=>{c.fillStyle='#fbfbfd';c.fillRect(0,0,W,H);c.fillStyle='#253040';c.fillRect(6,6,W-12,H/2-9);c.fillRect(6,H/2+3,W-12,H/2-9);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(8,8,8,H-16);});
  const winM=lam({map:sash}),boxM=lam({color:0x3a2a20}),flowers=[0xd8326a,0xff5a7a,0xf04a3a,0xe8e0f0];
  const win=(par,px,py,pz,ry2,wd=1.25,ht=1.9,flw=false)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(wd,ht),winM);p.position.set(px,py,pz);p.rotation.y=ry2;par.add(p);
    if(flw){const bx=new THREE.Mesh(new THREE.BoxGeometry(wd+.1,.25,.3),boxM);bx.position.set(px+Math.sin(ry2)*.15,py-ht/2-.15,pz+Math.cos(ry2)*.15);bx.rotation.y=ry2;par.add(bx);
      for(let k=0;k<5;k++){const fl=new THREE.Mesh(new THREE.IcosahedronGeometry(.13,0),lam({color:flowers[k%4]}));const t=(k/4-.5)*wd*.85;fl.position.set(px+Math.cos(ry2)*t+Math.sin(ry2)*.2,py-ht/2+.04,pz-Math.sin(ry2)*t+Math.cos(ry2)*.2);par.add(fl);}}};
  const floors=[1.8,5.45,9.0];
  // canted bays rising the full height, each under its own pointed gable
  const BAYS=[-13.2,-5,13];const R=2.35;
  for(const bx of BAYS){const bay=new THREE.Group();bay.position.set(bx,0,F);g.add(bay);
    const prism=new THREE.Mesh(new THREE.CylinderGeometry(R,R,h,3,1,false,-Math.PI/2,Math.PI),white);prism.position.y=h/2;bay.add(prism);
    for(const yy of [3.65,7.25]){const ring=new THREE.Mesh(new THREE.CylinderGeometry(R+.08,R+.08,.32,3,1,true,-Math.PI/2,Math.PI),grey);ring.position.y=yy;bay.add(ring);}
    for(const [a,b] of [[-Math.PI/2,-Math.PI/6],[-Math.PI/6,Math.PI/6],[Math.PI/6,Math.PI/2]]){const m=(a+b)/2,cx=R*(Math.sin(a)+Math.sin(b))/2,cz=R*(Math.cos(a)+Math.cos(b))/2;
      floors.forEach((fy,k)=>win(bay,cx+Math.sin(m)*.03,fy,cz+Math.cos(m)*.03,m,1.05,k===0?2.1:1.8,k<2));}
    // the pointed gable: a steep little roof running back into the main roof, its white face edged with dark bargeboards, a finial on top
    const gw=5.4,gh=3.9;const tri=new THREE.Shape();tri.moveTo(-gw/2,0);tri.lineTo(gw/2,0);tri.lineTo(0,gh);tri.closePath();
    const face=new THREE.Mesh(new THREE.ShapeGeometry(tri),lam({color:0xf3f4f6,side:THREE.DoubleSide}));face.position.set(0,h,R*.87+.05);bay.add(face);
    const sl=Math.hypot(gw/2,gh),ang=Math.atan2(gh,gw/2);
    for(const s of [-1,1]){const pl=new THREE.Mesh(new THREE.PlaneGeometry(sl+.3,5.2),slate);pl.position.set(s*gw/4,h+gh/2,R*.87-2.5);pl.rotation.set(0,0,0);pl.rotation.order='YXZ';pl.rotation.y=0;pl.rotation.x=-Math.PI/2;
      const piv=new THREE.Group();piv.position.set(s*gw/4,h+gh/2,R*.87-2.5);piv.rotation.z=s*(Math.PI/2-ang)*-1+(s>0?0:0);bay.add(piv);pl.position.set(0,0,0);piv.add(pl);pl.rotation.set(-Math.PI/2,0,0);piv.rotation.set(0,0,-s*ang);
      const bb=new THREE.Mesh(new THREE.BoxGeometry(sl+.3,.22,.12),dark);bb.position.set(s*gw/4,h+gh/2,R*.87+.12);bb.rotation.z=-s*ang;bay.add(bb);}
    const fin=new THREE.Mesh(new THREE.ConeGeometry(.12,1.1,6),dark);fin.position.set(0,h+gh+.45,R*.87+.1);bay.add(fin);
    const gwin=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.0),lam({color:0x6f7588}));gwin.position.set(0,h+1.25,R*.87+.07);bay.add(gwin);}
  // flat stretches between the bays: windows on each floor, and the arched entrance with its name plate
  for(const wx of [-9.1,-.9,2.6,6.3,9.4,16.6,-17.2])floors.forEach((fy,k)=>{if(!(k===0&&(wx===2.6||wx===-9.1)))win(g,wx,fy,F+.03,0,1.25,k===0?2.1:1.8,k<2);});
  const arch=new THREE.Shape();arch.moveTo(-.85,0);arch.lineTo(-.85,1.9);arch.absarc(0,1.9,.85,Math.PI,0,true);arch.lineTo(.85,0);arch.closePath();
  for(const ax of [2.6,-9.1]){const dr=new THREE.Mesh(new THREE.ShapeGeometry(arch),lam({color:0x1d1e22}));dr.position.set(ax,0,F+.05);g.add(dr);
    const sur=new THREE.Mesh(new THREE.TorusGeometry(.95,.12,6,16,Math.PI),grey);sur.position.set(ax,1.9,F+.08);g.add(sur);}
  const plate=new THREE.Mesh(new THREE.PlaneGeometry(3,.55),lam({map:canvasTex(256,48,(c,W,H)=>{c.fillStyle='#1c1d22';c.fillRect(0,0,W,H);c.fillStyle='#d9b35a';c.font='italic 700 30px Georgia,serif';c.textAlign='center';c.textBaseline='middle';c.fillText('The Whistledown',W/2,H/2+2);})}));
  plate.position.set(2.6,3.25,F+.12);g.add(plate);
  // roof: a purple-grey slate hip, tall chimneys with pots
  {const ex=w/2+.3,ez=d/2+.3,rh=5,rx=w/2-6;const P=[[-ex,0,-ez],[ex,0,-ez],[ex,0,ez],[-ex,0,ez],[-rx,rh,0],[rx,rh,0]];const Fs=[[3,2,5],[3,5,4],[1,0,4],[1,4,5],[2,1,5],[0,3,4]];const pos=[],uv=[];
    for(const fc of Fs)for(const k of fc){pos.push(...P[k]);uv.push(P[k][0]*.1,(P[k][1]+P[k][2])*.1);}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));rg.computeVertexNormals();
    const rm=new THREE.Mesh(rg,slate);rm.position.y=h;g.add(rm);}
  for(const [cx,cz] of [[-11,-1],[-1,-1.5],[15,0]]){const ch=new THREE.Mesh(new THREE.BoxGeometry(1.9,3.6,1.5),lam({map:TX.wall,color:0xd9dade}));ch.position.set(cx,h+4.6,cz);g.add(ch);
    for(let k=0;k<4;k++){const pot=new THREE.Mesh(new THREE.CylinderGeometry(.16,.18,.6,8),lam({color:0xb06a45}));pot.position.set(cx-.6+k*.4,h+6.7,cz);g.add(pot);}}
  // terrace with orange tables and chairs, looking out over the lough
  const ter=new THREE.Mesh(new THREE.BoxGeometry(w,.3,5),lam({map:TX.stone}));ter.position.set(0,.15,F+2.5);g.add(ter);
  const orange=lam({color:0xe8822a}),chairM=lam({color:0x9aa0a8});
  for(let k=0;k<7;k++){const tx=-15+k*4.6+(k%2)*.6,tz=F+3.3+(k%2)*.8;const t=new THREE.Mesh(new THREE.BoxGeometry(1.1,.08,.8),orange);t.position.set(tx,1.05,tz);g.add(t);const lg=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.75),chairM);lg.position.set(tx,.67,tz);g.add(lg);
    for(const s of [-1,1]){const c=new THREE.Mesh(new THREE.BoxGeometry(.45,.5,.45),chairM);c.position.set(tx+s*.85,.55,tz);g.add(c);}}
  const rail=new THREE.Mesh(new THREE.BoxGeometry(w,.08,.08),lam({color:0x1c1c1c}));rail.position.set(0,1.05,F+5);g.add(rail);
  SOLIDS.push({box:1,x,y,z,ry,w,d:d+2.4,h});g.position.set(x,y,z);g.rotation.y=ry;SR.add(g);for(const t of [-14,0,14])LMPOS.push([x+r[0]*t,z+r[1]*t]);LMDBG.push(['THE WHISTLEDOWN',x,z,ry,d]);}
