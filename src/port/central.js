// ---------------------------------------------------------------- CENTRAL: a bright modern convenience store on Church Street (its own look, not a chain's)
function streetPt(cx,cz){const A=[20,-27],B=[190,103];const dx=B[0]-A[0],dz=B[1]-A[1],L=Math.hypot(dx,dz);const t=((cx-A[0])*dx+(cz-A[1])*dz)/L;return [A[0]+dx/L*t,A[1]+dz/L*t];}
function centralStore(){const pts=takeBuild(66.6,39.3);if(!pts)return;const sp=streetPt(66.6,39.3);const f=fitFront(pts,sp[0],sp[1]);const W=f.w,D=Math.min(f.d,16),Hh=7.6,F=D/2;
  const g=new THREE.Group();const y=groundH(f.x,f.z);SOLIDS.push({box:1,x:f.x,y,z:f.z,ry:f.ry,w:W,d:D,h:Hh});
  const body=new THREE.Mesh(new THREE.BoxGeometry(W,Hh,D),lam({color:0xe8e9ec}));body.position.y=Hh/2;g.add(body);
  {const ex=W/2+.2,ez=D/2+.3,rh=2.2;const P=[[-ex,0,-ez],[ex,0,-ez],[ex,0,ez],[-ex,0,ez],[-ex,rh,0],[ex,rh,0]];const Fs=[[3,2,5],[3,5,4],[1,0,4],[1,4,5],[2,1,5],[0,3,4]];const pos=[],uv=[];
    for(const fc of Fs)for(const k of fc){pos.push(...P[k]);uv.push(P[k][0]*.15,(P[k][1]+P[k][2])*.15);}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));rg.computeVertexNormals();
    const rf=new THREE.Mesh(rg,lam({map:TX.slate,color:0x7a7c82,side:THREE.DoubleSide}));rf.position.y=Hh;g.add(rf);}
  // upstairs windows
  const up=lam({map:canvasTex(64,80,(c,w,h)=>{c.fillStyle='#fafafa';c.fillRect(0,0,w,h);c.fillStyle='#3e4a56';c.fillRect(6,6,w-12,h-12);c.fillStyle='#fafafa';c.fillRect(w/2-2,6,4,h-12);})});
  const n=Math.max(2,Math.round(W/3.2));for(let k=0;k<n;k++){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.5),up);p.position.set(-W/2+W*(k+.5)/n,5.6,F+.03);g.add(p);}
  // navy fascia with the name, a yellow stripe
  const fas=new THREE.Mesh(new THREE.PlaneGeometry(W-.2,1.3),new THREE.MeshBasicMaterial({map:canvasTex(1024,96,(c,w,h)=>{c.fillStyle='#16255a';c.fillRect(0,0,w,h);c.fillStyle='#ffc61a';c.fillRect(0,h-12,w,8);
      c.font='900 64px Arial Black,Arial,sans-serif';c.textBaseline='middle';c.fillStyle='#ffffff';c.fillText('CENTRAL',30,h/2-2);c.font='600 26px Barlow,Arial,sans-serif';c.fillStyle='#ffc61a';c.fillText('convenience · deli · hot food · off-licence',360,h/2-1);
      c.fillStyle='#ffc61a';c.beginPath();c.arc(w-56,h/2-2,26,0,7);c.fill();c.fillStyle='#16255a';c.font='900 34px Arial Black,sans-serif';c.textAlign='center';c.fillText('C',w-56,h/2);}),fog:false}));
  fas.position.set(0,3.9,F+.06);g.add(fas);
  // a full glass front, lit inside: aisles of shelves, the till, posters in the glass
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(W-.6,3.0),new THREE.MeshBasicMaterial({map:canvasTex(512,160,(c,w,h)=>{c.fillStyle='#f4f6f8';c.fillRect(0,0,w,h);c.fillStyle='#dfe4ea';c.fillRect(0,h*.72,w,h*.28);
      const cols=['#e83a3a','#2a8ad8','#f0b020','#3ac060','#8a3ad8','#ff7a1a','#1ac0c0','#e85aa0'];for(let a=0;a<6;a++){const x=20+a*82;c.fillStyle='#b8c0ca';c.fillRect(x,30,60,95);for(let r=0;r<5;r++)for(let k=0;k<6;k++){c.fillStyle=cols[(a*3+r*5+k)%8];c.fillRect(x+3+k*9.5,34+r*18,7,12);}}
      c.fillStyle='#16255a';c.fillRect(0,0,w,14);c.fillStyle='#ffffff';for(let x=10;x<w;x+=60)c.fillRect(x,4,30,6);
      for(let x=0;x<w;x+=128){c.fillStyle='rgba(120,140,160,.35)';c.fillRect(x,0,5,h);}c.fillStyle='#ffc61a';c.fillRect(30,110,90,34);c.fillStyle='#16255a';c.font='900 18px Arial,sans-serif';c.fillText('MEAL DEAL',36,133);
      c.fillStyle='#e83a3a';c.fillRect(380,104,100,40);c.fillStyle='#fff';c.font='900 20px Arial,sans-serif';c.fillText('2 FOR £3',388,131);}),fog:false}));
  glass.position.set(0,1.75,F+.05);g.add(glass);
  for(const x of [-W/2+.15,W/2-.15]){const p=new THREE.Mesh(new THREE.BoxGeometry(.3,3.3,.3),lam({color:0x16255a}));p.position.set(x,1.65,F+.12);g.add(p);}
  const door=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.5),new THREE.MeshBasicMaterial({color:0xcfe0ea,transparent:true,opacity:.55,fog:false}));door.position.set(W*.18,1.25,F+.08);g.add(door);
  // outside: a newspaper stand and an A-board
  const stand=new THREE.Mesh(new THREE.BoxGeometry(1.2,1,.5),lam({color:0x16255a}));stand.position.set(-W/2+1.4,.5,F+.8);g.add(stand);
  const pap=new THREE.Mesh(new THREE.BoxGeometry(1.1,.06,.42),lam({color:0xf0f0e8}));pap.position.set(-W/2+1.4,1.03,F+.8);g.add(pap);
  const ab=new THREE.Mesh(new THREE.BoxGeometry(.7,1,.08),lam({map:canvasTex(64,96,(c,w,h)=>{c.fillStyle='#ffc61a';c.fillRect(0,0,w,h);c.fillStyle='#16255a';c.font='900 13px Arial,sans-serif';c.fillText('HOT',16,30);c.fillText('FOOD',12,48);c.fillText('TO GO',8,66);})}));ab.position.set(W*.18+2,.5,F+1.3);ab.rotation.x=.12;g.add(ab);
  g.position.set(f.x,y,f.z);g.rotation.y=f.ry;SR.add(g);LMPOS.push([f.x,f.z]);LMDBG.push(['CENTRAL',f.x,f.z,f.ry,D]);}
