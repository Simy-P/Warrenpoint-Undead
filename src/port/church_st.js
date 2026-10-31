// ================================================================ Church Street landmarks placed on the real footprints from the 3D model:
// Walsh's Pharmacy (the corner past Kings Lane), the parish church (the cross-shaped building with its tower toward the street), and a lit-up retro video shop
const LMANIM=[];const LMCLEAR=[];
function takeBuild(cx,cz){let bi=-1,bd=4;BUILD.forEach((b,i)=>{const d=Math.hypot(b.cx-cx,b.cz-cz);if(d<bd){bd=d;bi=i;}});if(bi<0)return null;const b=BUILD[bi];BUILD.splice(bi,1);return b.pts;}
// fit a box to a four-sided footprint, its front on the edge nearest the street
function fitFront(pts,sx,sz){let best=null;const n=pts.length;for(let k=0;k<n;k++){const [x0,z0]=pts[k],[x1,z1]=pts[(k+1)%n];const L=Math.hypot(x1-x0,z1-z0);if(L<3)continue;const mx=(x0+x1)/2,mz=(z0+z1)/2;const d=Math.hypot(mx-sx,mz-sz);if(!best||d<best.d)best={d,x0,z0,x1,z1,L,mx,mz};}
  const cx=pts.reduce((a,p)=>a+p[0],0)/n,cz=pts.reduce((a,p)=>a+p[1],0)/n;let nx=best.mx-cx,nz=best.mz-cz;const nl=Math.hypot(nx,nz);nx/=nl;nz/=nl;
  const depth=Math.max(...pts.map(p=>((best.mx-p[0])*nx+(best.mz-p[1])*nz)));return {x:best.mx-nx*depth/2,z:best.mz-nz*depth/2,ry:Math.atan2(nx,nz),w:best.L,d:depth};}
const gold=()=>lam({color:0xd8b25a,emissive:0x3a2a08});
function letters(txt,{w=10,h=1.2,col='#e7c46a',shadow='#3a2410',font='700 88px Georgia,serif',italic=false,glow=false}={}){const cw=1024,chh=Math.round(cw*h/w);
  return new THREE.MeshBasicMaterial({map:canvasTex(cw,chh,(c,W,H)=>{c.clearRect(0,0,W,H);c.font=(italic?'italic ':'')+font.replace(/\d+px/,Math.round(H*.78)+'px');c.textAlign='center';c.textBaseline='middle';
    if(glow){c.shadowColor=col;c.shadowBlur=H*.25;}c.fillStyle=shadow;c.fillText(txt,W/2+H*.04,H/2+H*.05,W*.96);c.fillStyle=col;c.fillText(txt,W/2,H/2,W*.96);}),transparent:true,depthWrite:false,fog:!glow});}
// ---------------------------------------------------------------- Walsh's Pharmacy, No. 25
function walshsPharmacy(){const pts=takeBuild(69.4,-10);if(!pts)return;const f=fitFront(pts,60,6);const W=f.w,D=f.d,Hh=9.4;const g=new THREE.Group();const y=groundH(f.x,f.z);
  SOLIDS.push({box:1,x:f.x,y,z:f.z,ry:f.ry,w:W,d:D,h:Hh});const F=D/2;
  const rend=lam({color:0xdcdcd6}),red=lam({color:0x8e1616}),redD=lam({color:0x6e1010});
  const body=new THREE.Mesh(new THREE.BoxGeometry(W,Hh,D),rend);body.position.y=Hh/2;g.add(body);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(W+.3,.5,D+.3),lam({map:TX.slate,color:0x777a80}));roof.position.y=Hh+.25;g.add(roof);
  // upper floors: tall sash windows, the right-hand ones round-headed
  const sash=canvasTex(64,128,(c,w,h)=>{c.fillStyle='#f6f6f4';c.fillRect(0,0,w,h);c.fillStyle='#3a4450';c.fillRect(6,6,w-12,h/2-8);c.fillRect(6,h/2+2,w-12,h/2-8);});const sm=lam({map:sash});
  const nW=Math.max(2,Math.round(W/3.4));for(let k=0;k<nW;k++){const wx=-W/2+W*(k+.5)/nW;for(const wy of [5.6,8.0]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.15,1.75),sm);p.position.set(wx,wy,F+.03);g.add(p);
    const sl=new THREE.Mesh(new THREE.BoxGeometry(1.35,.14,.22),lam({color:0x9a9a94}));sl.position.set(wx,wy-.95,F+.1);g.add(sl);}}
  // the shopfront: deep red with gold beading
  const fasc=new THREE.Mesh(new THREE.BoxGeometry(W-.2,1.35,.35),red);fasc.position.set(0,4.05,F+.25);g.add(fasc);
  for(const yy of [3.38,4.72]){const bd=new THREE.Mesh(new THREE.BoxGeometry(W-.2,.07,.05),gold());bd.position.set(0,yy,F+.44);g.add(bd);}
  const num=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.75),letters('25',{w:1.6,h:1,font:'700 88px Georgia,serif'}));num.position.set(-W/2+1.6,4.1,F+.44);g.add(num);
  const nm=new THREE.Mesh(new THREE.PlaneGeometry(W*.66,1.05),letters("WALSH'S PHARMACY",{w:W*.66,h:1.05}));nm.position.set(W*.1,4.05,F+.46);g.add(nm);
  // fluted pilasters, a side door, two shop windows with labelled transoms, a red stall riser
  const flute=canvasTex(32,128,(c,w,h)=>{c.fillStyle='#8e1616';c.fillRect(0,0,w,h);c.fillStyle='#c99a45';for(const x of [8,14,20])c.fillRect(x,10,2,h-20);});const pil=lam({map:flute});
  const px=[-W/2+.35,-W/2+2.6,W*.12,W/2-.35];for(const x of px){const p=new THREE.Mesh(new THREE.BoxGeometry(.55,3.4,.4),pil);p.position.set(x,1.7,F+.2);g.add(p);}
  const door=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.6),lam({map:canvasTex(64,112,(c,w,h)=>{c.fillStyle='#8e1616';c.fillRect(0,0,w,h);c.fillStyle='#1c2026';c.fillRect(12,10,14,70);c.fillRect(38,10,14,70);c.fillStyle='#c99a45';c.fillRect(30,90,4,8);})}));door.position.set(-W/2+1.47,1.3,F+.06);g.add(door);
  const shopWin=canvasTex(128,96,(c,w,h)=>{c.fillStyle='#8e1616';c.fillRect(0,0,w,h);c.fillStyle='#3e5860';c.fillRect(4,4,w-8,16);c.fillStyle='#e8eef0';c.font='700 11px Barlow,sans-serif';c.fillText('BABY CARE',10,16);c.fillText('MEDICINES',70,16);
    c.fillStyle='#a8b8bc';c.fillRect(4,24,w-8,h-30);c.fillStyle='rgba(255,255,255,.35)';for(let x=8;x<w-8;x+=30)c.fillRect(x,28,3,h-38);c.fillStyle='#2a5aa8';c.fillRect(12,40,26,44);c.fillStyle='#f0d8c0';c.fillRect(16,50,18,12);});
  const wm=lam({map:shopWin,emissive:0x1a1a14});
  for(const [a,b] of [[-W/2+2.85,W*.12-.3],[W*.12+.3,W/2-.6]]){const ww=b-a;const p=new THREE.Mesh(new THREE.PlaneGeometry(ww,2.7),wm);p.position.set((a+b)/2,1.85,F+.05);g.add(p);
    const rs=new THREE.Mesh(new THREE.BoxGeometry(ww,.5,.3),redD);rs.position.set((a+b)/2,.25,F+.15);g.add(rs);}
  g.position.set(f.x,y,f.z);g.rotation.y=f.ry;SR.add(g);LMPOS.push([f.x,f.z]);LMDBG.push(["WALSH'S PHARMACY",f.x,f.z,f.ry,D]);
  // the green cross, lit, on a bracket at the corner (kept out of the static bake so it can glow)
  const cr=new THREE.Group();const plate=new THREE.Mesh(new THREE.BoxGeometry(.12,1.1,1.1),lam({color:0xf4f4f0}));cr.add(plate);const gm=new THREE.MeshBasicMaterial({color:0x22d456,fog:true});
  for(const [sy,sz] of [[.8,.26],[.26,.8]]){for(const s of [-1,1]){const c=new THREE.Mesh(new THREE.BoxGeometry(.03,sy,sz),gm);c.position.x=s*.075;cr.add(c);}}
  cr.position.set(W/2-.4,5.2,F+.9);g.updateMatrixWorld(true);const wp=cr.position.clone().applyMatrix4(g.matrixWorld);cr.position.copy(wp);cr.rotation.y=f.ry;world.add(cr);
  LMANIM.push((dt,t)=>{gm.color.setHSL(.38,.85,.42+.08*Math.sin(t*3));});}
// ---------------------------------------------------------------- the parish church: a three-stage tower with battlements and pinnacles, nave, transepts, lancets, railings and gates at the street
function parishChurch(){const pts=takeBuild(172.5,22.6);if(!pts)return;
  // axis: from the tower (the end nearest Church Street) to the chancel
  const T0=[160.2,36],C0=[182.5,12.5];const ax=C0[0]-T0[0],az=C0[1]-T0[1],AL=Math.hypot(ax,az);const ux=ax/AL,uz=az/AL;const ry=Math.atan2(-ux,-uz);// local +z points back towards the street
  const g=new THREE.Group();const y=Math.max(groundH(T0[0],T0[1]),groundH(C0[0],C0[1]));const stone=lam({map:TX.stone,color:0xbab6ac}),stoneD=lam({map:TX.stone,color:0x9c988e}),slate=lam({map:TX.slate,color:0x666a70,side:THREE.DoubleSide});
  const glass=lam({color:0x1c242e}),gl2=lam({color:0x2a3a4a,emissive:0x0a0c10});
  const lancet=(par,x,yy,z,ryy,w,h,mat=glass)=>{const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(-w/2,h-w*.7);s.quadraticCurveTo(-w/2,h,0,h+.05);s.quadraticCurveTo(w/2,h,w/2,h-w*.7);s.lineTo(w/2,0);s.closePath();
    const m=new THREE.Mesh(new THREE.ShapeGeometry(s),mat);m.position.set(x,yy,z);m.rotation.y=ryy;par.add(m);const tr=new THREE.Mesh(new THREE.PlaneGeometry(.06,h*.9),stone);tr.position.set(x+Math.sin(ryy)*.01,yy+h*.45,z+Math.cos(ryy)*.01);tr.rotation.y=ryy;par.add(tr);return m;};
  // the group's origin is the tower's front face centre; +z towards the street, -z back along the nave
  const TW=5.6,TH=21;const tower=new THREE.Mesh(new THREE.BoxGeometry(TW,TH,TW),stone);tower.position.set(0,TH/2,-TW/2);g.add(tower);
  for(const yy of [7.2,13.6]){const st=new THREE.Mesh(new THREE.BoxGeometry(TW+.3,.35,TW+.3),stoneD);st.position.set(0,yy,-TW/2);g.add(st);}
  for(const sx of [-1,1])for(const sz of [-1,1]){const bt=new THREE.Mesh(new THREE.BoxGeometry(.7,TH-2,.7),stoneD);bt.position.set(sx*(TW/2+.1),(TH-2)/2,-TW/2+sz*(TW/2+.1));g.add(bt);}
  // battlements and corner pinnacles
  for(let k=0;k<5;k++)for(const s of [0,1,2,3]){const mr=new THREE.Mesh(new THREE.BoxGeometry(.7,.8,.35),stone);const t=-TW/2+.5+k*(TW-1)/4;const P=[[t,TW/2],[t,-TW/2],[TW/2,t],[-TW/2,t]][s];mr.position.set(P[0],TH+.4,-TW/2+P[1]);if(s>1)mr.rotation.y=Math.PI/2;g.add(mr);}
  for(const sx of [-1,1])for(const sz of [-1,1]){const pn=new THREE.Mesh(new THREE.ConeGeometry(.3,2.4,4),stoneD);pn.position.set(sx*TW/2,TH+1.6,-TW/2+sz*TW/2);g.add(pn);}
  // west front: the pointed door, a lancet above, the clock, the belfry window
  const dr=lancet(g,0,0,.04,0,1.7,3.2,lam({color:0x1a1410}));lancet(g,0,4.6,.04,0,1.1,2.3);
  const clk=new THREE.Mesh(new THREE.CircleGeometry(.75,24),lam({map:canvasTex(128,128,(c,w,h)=>{c.fillStyle='#f4f2ea';c.beginPath();c.arc(64,64,62,0,7);c.fill();c.strokeStyle='#222';c.lineWidth=4;c.stroke();for(let k=0;k<12;k++){const a=k/12*Math.PI*2;c.fillStyle='#222';c.fillRect(64+Math.sin(a)*50-2,64-Math.cos(a)*50-5,4,10);}
    c.lineWidth=5;c.beginPath();c.moveTo(64,64);c.lineTo(64+28*Math.sin(5.4),64-28*Math.cos(5.4));c.stroke();c.lineWidth=3;c.beginPath();c.moveTo(64,64);c.lineTo(64,22);c.stroke();})}));clk.position.set(0,11.2,.05);g.add(clk);
  for(const [x,z,ryy] of [[0,.04,0],[TW/2+.02,-TW/2,Math.PI/2],[-TW/2-.02,-TW/2,-Math.PI/2],[0,-TW-.02,Math.PI]])lancet(g,x,14.6,z,ryy,1.2,3.4);
  // nave with a steep slate roof, lancet side windows between buttresses
  const NW=9.6,NL=20,NH=8;const nave=new THREE.Mesh(new THREE.BoxGeometry(NW,NH,NL),stone);nave.position.set(0,NH/2,-TW-NL/2);g.add(nave);
  const roofPair=(w,l,h0,zc,rise)=>{const ang=Math.atan2(rise,w/2),sl=Math.hypot(w/2,rise);for(const s of [-1,1]){const pl=new THREE.Mesh(new THREE.PlaneGeometry(sl+.4,l+.4),slate);pl.rotation.order='ZXY';pl.rotation.x=-Math.PI/2;pl.rotation.y=s*ang;pl.position.set(s*w/4,h0+rise/2,zc);g.add(pl);}
    const tri=new THREE.Shape();tri.moveTo(-w/2,0);tri.lineTo(w/2,0);tri.lineTo(0,rise);tri.closePath();for(const zz of [zc+l/2,zc-l/2]){const gb=new THREE.Mesh(new THREE.ShapeGeometry(tri),lam({map:TX.stone,color:0xbab6ac,side:THREE.DoubleSide}));gb.position.set(0,h0,zz);g.add(gb);}};
  roofPair(NW,NL,NH,-TW-NL/2,5.2);
  for(let k=0;k<4;k++){const zz=-TW-3-k*4.6;for(const s of [-1,1]){lancet(g,s*(NW/2+.02),2.6,zz,s*Math.PI/2,1.0,3.2);const bt=new THREE.Mesh(new THREE.BoxGeometry(.6,NH-1,.7),stoneD);bt.position.set(s*(NW/2+.25),(NH-1)/2,zz-2.3);g.add(bt);}}
  // transepts and a short chancel at the far end
  const TRW=19,TRD=7.5,zt=-TW-NL+TRD/2+1;const tr=new THREE.Mesh(new THREE.BoxGeometry(TRW,NH,TRD),stone);tr.position.set(0,NH/2,zt);g.add(tr);
  {const ang=Math.atan2(4.4,TRD/2),sl=Math.hypot(TRD/2,4.4);for(const s of [-1,1]){const pl=new THREE.Mesh(new THREE.PlaneGeometry(TRW+.4,sl+.4),slate);pl.rotation.x=-Math.PI/2+s*(Math.PI/2-ang)*-1;pl.rotation.set(s>0?-(Math.PI/2-ang):(Math.PI/2-ang),0,0);pl.position.set(0,NH+2.2,zt+s*TRD/4);g.add(pl);}
   for(const s of [-1,1]){lancet(g,s*(TRW/2+.02),2.4,zt,s*Math.PI/2,1.6,4.2);}}
  const ch=new THREE.Mesh(new THREE.BoxGeometry(6.4,6.5,5),stone);ch.position.set(0,3.25,-TW-NL-2.5);g.add(ch);
  g.position.set(T0[0],y,T0[1]);g.rotation.y=ry;SR.add(g);
  SOLIDS.push({box:1,x:T0[0]+ux*TW/2,y,z:T0[1]+uz*TW/2,ry,w:TW+1,d:TW+1,h:TH});SOLIDS.push({box:1,x:T0[0]+ux*(TW+NL/2),y,z:T0[1]+uz*(TW+NL/2),ry,w:NW,d:NL,h:NH});SOLIDS.push({box:1,x:T0[0]+ux*(TW+NL-TRD/2+1),y,z:T0[1]+uz*(TW+NL-TRD/2+1),ry,w:TRW,d:TRD,h:NH});
  LMPOS.push([T0[0],T0[1]]);LMDBG.push(['PARISH CHURCH',T0[0],T0[1],ry,TW]);
  // the churchyard: clear the ground between the tower and Church Street, then railings, stone piers and double gates at the pavement
  const A=[20,-27],B=[190,103];const sx=B[0]-A[0],sz=B[1]-A[1],sL=Math.hypot(sx,sz),dx=sx/sL,dz=sz/sL;// along the street
  const t=((T0[0]-A[0])*dx+(T0[1]-A[1])*dz);const px=A[0]+dx*t,pz=A[1]+dz*t;const nx=(T0[0]-px),nz=(T0[1]-pz),nL=Math.hypot(nx,nz);const gx=px+nx/nL*(W2+VERGE+.6),gz=pz+nz/nL*(W2+VERGE+.6);
  LMCLEAR.push({x:(gx+T0[0])/2,z:(gz+T0[1])/2,ry:Math.atan2(dx,dz),w:Math.hypot(T0[0]-gx,T0[1]-gz)+2,d:20});
  const yard=new THREE.Group();const fy=groundH(gx,gz);const iron=lam({color:0x16181c}),pier=lam({map:TX.stone,color:0xb2aea4});
  const railT=canvasTex(256,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#15171b';c.fillRect(0,8,w,3);c.fillRect(0,h-8,w,3);c.fillRect(0,20,w,2);for(let x=4;x<w;x+=8){c.fillRect(x,4,2,h-6);c.beginPath();c.moveTo(x-2,6);c.lineTo(x+1,0);c.lineTo(x+4,6);c.fill();}
    for(let x=8;x<w;x+=16){c.beginPath();c.arc(x,15,4,0,7);c.lineWidth=1.5;c.strokeStyle='#15171b';c.stroke();}});railT.wrapS=THREE.RepeatWrapping;
  const railM=new THREE.MeshLambertMaterial({map:railT,transparent:true,alphaTest:.4,side:THREE.DoubleSide});
  const span=32,gap=4.2;for(const s of [-1,1]){const L=span/2-gap/2;const wall=new THREE.Mesh(new THREE.BoxGeometry(L,.6,.5),pier);wall.position.set(s*(gap/2+L/2),.3,0);yard.add(wall);
    const rt=railT.clone();rt.needsUpdate=true;rt.repeat.set(L/4,1);const rm=new THREE.Mesh(new THREE.PlaneGeometry(L,1.5),new THREE.MeshLambertMaterial({map:rt,transparent:true,alphaTest:.4,side:THREE.DoubleSide}));rm.position.set(s*(gap/2+L/2),1.35,0);yard.add(rm);
    const pr=new THREE.Mesh(new THREE.BoxGeometry(1,2.6,1),pier);pr.position.set(s*(gap/2+.5),1.3,0);yard.add(pr);const cap=new THREE.Mesh(new THREE.ConeGeometry(.75,.6,4),pier);cap.rotation.y=Math.PI/4;cap.position.set(s*(gap/2+.5),2.9,0);yard.add(cap);}
  const gt=railT.clone();gt.needsUpdate=true;gt.repeat.set(.8,1);const gm2=new THREE.MeshLambertMaterial({map:gt,transparent:true,alphaTest:.4,side:THREE.DoubleSide});for(const s of [-1,1]){const gp=new THREE.Mesh(new THREE.PlaneGeometry(gap/2-.05,1.9),gm2);gp.position.set(s*gap/4,1.05,0);yard.add(gp);}
  const path=new THREE.Mesh(new THREE.PlaneGeometry(3,Math.hypot(T0[0]-gx,T0[1]-gz)),lam({color:0x8e8a80}));path.rotation.x=-Math.PI/2;path.position.set(0,.06,-Math.hypot(T0[0]-gx,T0[1]-gz)/2);yard.add(path);
  const board=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.8,.12),lam({color:0x141a2a}));board.position.set(7,1.3,-1.2);yard.add(board);
  yard.position.set(gx,fy,gz);yard.rotation.y=Math.atan2(-nx,-nz)+Math.PI;yard.rotation.y=Math.atan2(nx,nz)+Math.PI;SR.add(yard);
  for(const s of [-1,1]){const L=span/2-gap/2;SOLIDS.push({box:1,x:gx+dx*s*(gap/2+L/2),y:fy,z:gz+dz*s*(gap/2+L/2),ry:Math.atan2(dx,dz)+Math.PI/2,w:L,d:.6,h:1.6});}}
// ---------------------------------------------------------------- the video shop on the corner (an invented one, lit up like the old days) and the travel agent next door
function videoShop(){const p1=takeBuild(157.5,104),p2=takeBuild(148.6,97.3);if(!p1||!p2)return;const f1=fitFront(p1,172,90),f2=fitFront(p2,160,82);
  const Hh=7.4;const mk=(f,kind)=>{const W=f.w,D=f.d,F=D/2;const g=new THREE.Group();const y=groundH(f.x,f.z);SOLIDS.push({box:1,x:f.x,y,z:f.z,ry:f.ry,w:W,d:D,h:Hh});
    const body=new THREE.Mesh(new THREE.BoxGeometry(W,Hh,D),lam({color:0xf1f1ee}));body.position.y=Hh/2;g.add(body);
    const rg=new THREE.CylinderGeometry(.01,D*.72,W+.2,4,1,true);rg.rotateZ(Math.PI/2);rg.rotateX(Math.PI/4);rg.scale(1,.55,1);const rf=new THREE.Mesh(rg,lam({map:TX.slate,color:0x6c6e72,flatShading:true}));rf.position.y=Hh+D*.26;g.add(rf);
    const sash=lam({map:canvasTex(64,96,(c,w,h)=>{c.fillStyle='#fafaf8';c.fillRect(0,0,w,h);c.fillStyle='#4a5866';for(let r=0;r<2;r++)for(let k=0;k<2;k++)c.fillRect(8+k*25,8+r*42,22,36);})});
    for(let k=0;k<2;k++){const wx=-W/2+W*(k+.5)/2;const p=new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.8),sash);p.position.set(wx,5.3,F+.03);g.add(p);const sl=new THREE.Mesh(new THREE.BoxGeometry(1.6,.14,.2),lam({color:0x2a2e36}));sl.position.set(wx,4.35,F+.1);g.add(sl);}
    const navy=lam({color:0x1a2236});for(const x of [-W/2+.25,W/2-.25]){const p=new THREE.Mesh(new THREE.BoxGeometry(.5,3.6,.4),navy);p.position.set(x,1.8,F+.2);g.add(p);}
    const riser=new THREE.Mesh(new THREE.BoxGeometry(W-.6,.55,.3),navy);riser.position.set(0,.28,F+.15);g.add(riser);
    g.position.set(f.x,y,f.z);g.rotation.y=f.ry;SR.add(g);g.updateMatrixWorld(true);
    // the lit parts live outside the static bake so they can glow and flash
    const lit=new THREE.Group();lit.position.copy(g.position);lit.rotation.copy(g.rotation);world.add(lit);return {g,lit,W,F};};
  const A=mk(f1,'video'),Bt=mk(f2,'travel');
  // REWIND VIDEO: red and yellow fascia, posters, a neon border that chases, a flickering OPEN sign, windows glowing
  {const {lit,W,F}=A;const fas=new THREE.Mesh(new THREE.PlaneGeometry(W-.8,1.25),new THREE.MeshBasicMaterial({map:canvasTex(512,80,(c,w,h)=>{c.fillStyle='#d8241a';c.fillRect(0,0,w,h);c.fillStyle='#ffd21a';c.fillRect(0,h-14,w,8);c.fillRect(0,6,w,5);
      c.fillStyle='#141414';c.beginPath();c.moveTo(w*.72,0);c.lineTo(w,0);c.lineTo(w,h);c.lineTo(w*.66,h);c.closePath();c.fill();
      c.font='italic 900 50px Arial Black,Impact,sans-serif';c.textBaseline='middle';c.fillStyle='#ffd21a';c.fillText('REWIND',16,h/2+2);c.font='italic 900 22px Arial Black,Impact,sans-serif';c.fillStyle='#ffffff';c.fillText('VIDEO',w*.74,h/2-9);c.fillText('& GAMES',w*.74,h/2+15);}),fog:false}));
    fas.position.set(0,3.95,F+.42);lit.add(fas);
    const win=new THREE.Mesh(new THREE.PlaneGeometry(W-.9,2.9),new THREE.MeshBasicMaterial({map:canvasTex(256,96,(c,w,h)=>{c.fillStyle='#f6e7b0';c.fillRect(0,0,w,h);const P=[['#c0287a',14,12,40,56],['#2a6ad8',70,18,34,50],['#ff6a1a',120,10,40,60],['#2a2a2a',176,14,30,52],['#6ad8a0',212,20,34,46]];
      for(const [cl,x,yy,ww,hh] of P){c.fillStyle=cl;c.fillRect(x,yy,ww,hh);c.fillStyle='rgba(255,255,255,.8)';c.fillRect(x+4,yy+hh-12,ww-8,6);}c.fillStyle='#e8201a';c.fillRect(150,62,60,26);c.fillStyle='#fff';c.font='900 18px Arial Black,sans-serif';c.fillText('SALE!',154,82);}),fog:false}));
    win.position.set(0,1.95,F+.06);lit.add(win);
    const openM=new THREE.MeshBasicMaterial({map:canvasTex(128,48,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='#ff3a6a';c.lineWidth=4;c.strokeRect(4,4,w-8,h-8);c.shadowColor='#ff3a6a';c.shadowBlur=8;c.fillStyle='#ff6a8a';c.font='900 30px Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('OPEN',w/2,h/2+2);}),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
    const open=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.45),openM);open.position.set(W/2-1.6,2.7,F+.1);lit.add(open);
    // chaser bulbs around the fascia
    const n=Math.round((W-.6)*2/.32)+8;const bulbs=new THREE.InstancedMesh(new THREE.SphereGeometry(.07,6,4),new THREE.MeshBasicMaterial({fog:false}),n);const o=new THREE.Object3D();const fw=W-.6,fh=1.5;let k=0;const pos=[];
    for(let i=0;i<n;i++){const t=i/n,per=2*(fw+fh);let d=t*per,x,yy;if(d<fw){x=-fw/2+d;yy=fh/2;}else if((d-=fw)<fh){x=fw/2;yy=fh/2-d;}else if((d-=fh)<fw){x=fw/2-d;yy=-fh/2;}else{d-=fw;x=-fw/2;yy=-fh/2+d;}
      o.position.set(x,3.95+yy,F+.5);o.updateMatrix();bulbs.setMatrixAt(i,o.matrix);bulbs.setColorAt(i,new THREE.Color(0xffd21a));}lit.add(bulbs);
    const glowM=new THREE.MeshBasicMaterial({color:0xffb04a,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});const glow=new THREE.Mesh(new THREE.PlaneGeometry(W+2,4.6),glowM);glow.position.set(0,2.3,F+.7);lit.add(glow);
    const c1=new THREE.Color(0xffe24a),c0=new THREE.Color(0x3a2a08),cR=new THREE.Color(0xff3a2a);let acc=0;
    LMANIM.push((dt,t)=>{acc+=dt;if(acc>.09){acc=0;const ph=Math.floor(t*11);for(let i=0;i<n;i++){const on=(i+ph)%4===0;bulbs.setColorAt(i,on?((Math.floor(t*.5)%2)?cR:c1):c0);}bulbs.instanceColor.needsUpdate=true;}
      const fl=Math.random()<.04?.2:1;openM.opacity=fl;glowM.opacity=.16+.08*Math.sin(t*7)+(Math.random()<.02?.25:0);});}
  // the travel agent next door: blue fascia, posters, gently lit
  {const {lit,W,F}=Bt;const fas=new THREE.Mesh(new THREE.PlaneGeometry(W-.8,1.2),new THREE.MeshBasicMaterial({map:canvasTex(512,80,(c,w,h)=>{c.fillStyle='#1d7bc4';c.fillRect(0,0,w,h);c.fillStyle='#ffffff';c.font='700 24px Barlow,sans-serif';c.textBaseline='middle';c.fillText('SUNSEEKER TRAVEL',18,h/2-12);c.font='18px Barlow,sans-serif';c.fillText('028 0000 0000',18,h/2+16);
      c.font='italic 700 34px Georgia,serif';c.fillText('worldwide',w*.55,h/2+4);c.fillStyle='#ffcc22';c.beginPath();c.arc(w*.92,h/2,16,0,7);c.fill();}),fog:false}));fas.position.set(0,3.95,F+.42);lit.add(fas);
    const win=new THREE.Mesh(new THREE.PlaneGeometry(W-.9,2.9),new THREE.MeshBasicMaterial({map:canvasTex(256,96,(c,w,h)=>{c.fillStyle='#dfe8f0';c.fillRect(0,0,w,h);for(let k=0;k<6;k++){c.fillStyle=['#e83a7a','#2a8ad8','#f0a020','#3ac0a0','#8a3ad8','#e8601a'][k];c.fillRect(8+k*41,10+(k%2)*8,32,48);}
      c.fillStyle='#e8201a';c.fillRect(180,60,56,30);c.fillStyle='#fff';c.font='900 22px Arial,sans-serif';c.fillText('£50',188,84);c.fillStyle='#1d3a8a';c.font='900 16px Arial,sans-serif';c.fillText('SKI',30,86);}),fog:false}));win.position.set(0,1.95,F+.06);lit.add(win);}}
function churchStreetLandmarks(){try{walshsPharmacy();}catch(e){console.warn('pharmacy',e);}try{parishChurch();}catch(e){console.warn('church',e);}try{videoShop();}catch(e){console.warn('video',e);}}
