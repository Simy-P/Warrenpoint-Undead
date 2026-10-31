// ================================================================ Warrenpoint Town Hall, after the photo: a white two-storey front of lined render under a dark slate hipped roof,
// "TOWN HALL" on a panel at the roofline, multi-pane sash windows, a blue door in a stone surround, white railings on a low green wall
function townHallReal(x0,z0){const W=15,D=11,Hh=8.4;const q=byRoad(x0,z0,D);const g=new THREE.Group();const y=groundH(q.x,q.z);SOLIDS.push({box:1,x:q.x,y,z:q.z,ry:q.ry,w:W,d:D,h:Hh+1});
  const render=canvasTex(512,288,(c,w,h)=>{c.fillStyle='#f3f3ef';c.fillRect(0,0,w,h);for(let yy=10;yy<h;yy+=14){c.fillStyle='rgba(120,120,115,.22)';c.fillRect(0,yy,w,1.5);}
    for(let k=0;k<900;k++){c.fillStyle=`rgba(${150+Math.random()*60|0},${150+Math.random()*60|0},150,.08)`;c.fillRect(Math.random()*w,Math.random()*h,2,2);}});
  const white=lam({map:render}),side=lam({color:0xeeeeea});
  const body=new THREE.Mesh(new THREE.BoxGeometry(W,Hh+2,D),[side,side,side,side,white,side]);body.position.y=Hh/2-1;g.add(body);
  // corner quoins
  for(const s of [-1,1]){const qn=new THREE.Mesh(new THREE.BoxGeometry(.35,Hh+.2,.12),lam({color:0xf8f8f4}));qn.position.set(s*(W/2-.17),Hh/2,D/2+.06);g.add(qn);}
  // eaves band and a hipped slate roof
  const band=new THREE.Mesh(new THREE.BoxGeometry(W+.4,.35,.35),lam({color:0xe6e6e0}));band.position.set(0,Hh-.1,D/2+.1);g.add(band);
  {const ex=W/2+.35,ez=D/2+.35,rh=3.1,rx=W*.22;const P=[[-ex,0,-ez],[ex,0,-ez],[ex,0,ez],[-ex,0,ez],[-rx,rh,0],[rx,rh,0]];
    const F=[[3,2,5],[3,5,4],[1,0,4],[1,4,5],[2,1,5],[0,3,4]];const pos=[],uv=[];for(const f of F)for(const k of f){pos.push(...P[k]);uv.push(P[k][0]*.12,(P[k][1]+P[k][2])*.12);}
    const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));rg.computeVertexNormals();
    const rm=new THREE.Mesh(rg,lam({map:TX.slate,color:0x6a6e74,side:THREE.DoubleSide}));rm.position.y=Hh+.05;g.add(rm);}
  // the TOWN HALL panel standing up at the roofline
  const pan=new THREE.Mesh(new THREE.BoxGeometry(4.6,1.15,.35),lam({color:0xe9e9e4}));pan.position.set(0,Hh+.55,D/2+.02);g.add(pan);
  const pcap=new THREE.Mesh(new THREE.BoxGeometry(4.9,.18,.5),lam({color:0xdcdcd5}));pcap.position.set(0,Hh+1.2,D/2+.02);g.add(pcap);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.62),lam({map:signTex('TOWN HALL','#f2f2ee','#2d2d2d','700 58px Barlow, sans-serif')}));sg.position.set(0,Hh+.52,D/2+.2);g.add(sg);
  // six-over-six sash windows with stone sills
  const sash=canvasTex(96,128,(c,w,h)=>{c.fillStyle='#fdfdfb';c.fillRect(0,0,w,h);c.fillStyle='#3a4652';const fx=7,fy=7,cw=(w-2*fx-8)/3,ch=(h-2*fy-14)/4;
    for(let r=0;r<4;r++)for(let k=0;k<3;k++){const yy=fy+r*(ch+3)+(r>1?6:0);c.fillRect(fx+k*(cw+4),yy,cw,ch);}c.fillStyle='rgba(255,255,255,.18)';c.fillRect(fx,fy,8,h-2*fy);});
  const winM=lam({map:sash}),sill=lam({color:0xc9bfae});
  const win=(wx,wy)=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(1.55,2.05),winM);p.position.set(wx,wy,D/2+.04);g.add(p);const sl=new THREE.Mesh(new THREE.BoxGeometry(1.8,.16,.28),sill);sl.position.set(wx,wy-1.1,D/2+.12);g.add(sl);};
  for(const wx of [-4.9,0,4.9])win(wx,5.9);for(const wx of [-4.9,4.9])win(wx,2.4);
  // the blue door in its stone surround, with a fanlight and a hood
  const stone=lam({color:0xcbbd9f});const dr=new THREE.Mesh(new THREE.PlaneGeometry(1.25,2.35),lam({color:0x1f3aa8}));dr.position.set(0,1.32,D/2+.05);g.add(dr);
  const fan=new THREE.Mesh(new THREE.PlaneGeometry(1.25,.55),lam({color:0x2c3540}));fan.position.set(0,2.85,D/2+.05);g.add(fan);
  for(const s of [-1,1]){const pl=new THREE.Mesh(new THREE.BoxGeometry(.38,3.3,.22),stone);pl.position.set(s*.86,1.65,D/2+.1);g.add(pl);}
  const hood=new THREE.Mesh(new THREE.BoxGeometry(2.4,.32,.45),stone);hood.position.set(0,3.42,D/2+.2);g.add(hood);const lint=new THREE.Mesh(new THREE.BoxGeometry(2.1,.22,.24),stone);lint.position.set(0,3.18,D/2+.1);g.add(lint);
  for(let k=0;k<2;k++){const st=new THREE.Mesh(new THREE.BoxGeometry(2.2-k*.3,.18,.5),lam({color:0xb9b2a6}));st.position.set(0,.09+k*.18,D/2+.55-k*.25);g.add(st);}
  // the low green wall with white railings in front (a gap at the door), the notice board and a banner
  const greenM=lam({color:0x1f4d45}),railM=lam({color:0xf4f4f0});const fz=D/2+2.3;
  for(const [a,b] of [[-W/2,-1.2],[1.2,W/2]]){const L=b-a;const wl=new THREE.Mesh(new THREE.BoxGeometry(L,.7,.35),greenM);wl.position.set((a+b)/2,.35,fz);g.add(wl);
    const top=new THREE.Mesh(new THREE.BoxGeometry(L,.06,.06),railM);top.position.set((a+b)/2,1.75,fz);g.add(top);const mid=top.clone();mid.position.y=.95;g.add(mid);
    for(let xx=a+.1;xx<=b;xx+=.16){const r=new THREE.Mesh(new THREE.BoxGeometry(.035,1.05,.035),railM);r.position.set(xx,1.25,fz);g.add(r);}}
  for(const s of [-1,1]){const gp=new THREE.Mesh(new THREE.BoxGeometry(.18,1.9,.18),railM);gp.position.set(s*1.2,.95,fz);g.add(gp);}
  const nb=new THREE.Mesh(new THREE.BoxGeometry(1.7,1.15,.1),lam({color:0x5a3a22}));nb.position.set(-5.6,1.9,D/2+.12);g.add(nb);
  const np=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.95),lam({map:canvasTex(96,64,(c,w,h)=>{c.fillStyle='#cdb890';c.fillRect(0,0,w,h);for(const [px,py,pw,ph,cl] of [[6,6,26,34,'#e7e2d0'],[36,8,24,22,'#7fb0d8'],[64,6,26,30,'#d86a5a'],[38,34,22,24,'#f0d060']]){c.fillStyle=cl;c.fillRect(px,py,pw,ph);}})}));np.position.set(-5.6,1.9,D/2+.18);g.add(np);
  const bn=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.75),lam({map:canvasTex(256,54,(c,w,h)=>{c.fillStyle='#f6f6f2';c.fillRect(0,0,w,h);c.fillStyle='#c0287a';c.font='700 26px Barlow,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText("WHAT'S ON THIS WEEK",w/2,h/2+1);}),side:THREE.DoubleSide}));bn.position.set(-3,1.3,fz+.22);g.add(bn);
  g.position.set(q.x,y,q.z);g.rotation.y=q.ry;SR.add(g);LMPOS.push([q.x,q.z]);LMDBG.push(['TOWN HALL',q.x,q.z,q.ry,D]);return g;}
