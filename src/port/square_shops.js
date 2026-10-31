// ---------------------------------------------------------------- shops on The Square's terrace (facing the car park), on their real footprints
function squareRoadPt(cx,cz){const A=[20,-27],B=[-27,31];const dx=B[0]-A[0],dz=B[1]-A[1],L=Math.hypot(dx,dz);const t=((cx-A[0])*dx+(cz-A[1])*dz)/L;return [A[0]+dx/L*t,A[1]+dz/L*t];}
function hipRoof(W,D,rh,mat){const ex=W/2+.15,ez=D/2+.3;const P=[[-ex,0,-ez],[ex,0,-ez],[ex,0,ez],[-ex,0,ez],[-ex,rh,0],[ex,rh,0]];const Fs=[[3,2,5],[3,5,4],[1,0,4],[1,4,5],[2,1,5],[0,3,4]];const pos=[],uv=[];
  for(const fc of Fs)for(const k of fc){pos.push(...P[k]);uv.push(P[k][0]*.15,(P[k][1]+P[k][2])*.15);}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));rg.computeVertexNormals();return new THREE.Mesh(rg,mat);}
const archWinTex=(frame='#f4f4ee',glass='#3e4a58',blind=false)=>canvasTex(64,128,(c,w,h)=>{c.fillStyle=frame;c.fillRect(0,0,w,h);c.fillStyle=glass;c.beginPath();c.moveTo(6,h-6);c.lineTo(6,30);c.arc(32,30,26,Math.PI,0);c.lineTo(w-6,h-6);c.closePath();c.fill();
  if(blind){c.fillStyle='rgba(230,230,224,.85)';c.beginPath();c.moveTo(8,h*.6);c.lineTo(8,30);c.arc(32,30,24,Math.PI,0);c.lineTo(w-8,h*.6);c.closePath();c.fill();c.strokeStyle='rgba(160,160,150,.6)';for(let y=12;y<h*.6;y+=5){c.beginPath();c.moveTo(8,y);c.lineTo(w-8,y);c.stroke();}}
  c.fillStyle=frame;c.fillRect(w/2-2,30,4,h-36);c.fillRect(6,h*.58,w-12,4);});
// a Victorian terrace unit: rendered walls, round-headed sash windows, a pointed front gable with dark bargeboards and brackets under the eaves
function victorianUnit(f,{wall,floors=3,gable=true,gables=null,winTex,winCols,fascia,shop,extra}={}){const W=f.w,D=Math.min(f.d,14),F=D/2,fh=3.3,Hh=floors*fh+.4;const g=new THREE.Group();const y=groundH(f.x,f.z);SOLIDS.push({box:1,x:f.x,y,z:f.z,ry:f.ry,w:W,d:D,h:Hh});
  const wm=lam({color:wall});const body=new THREE.Mesh(new THREE.BoxGeometry(W,Hh,D),wm);body.position.y=Hh/2;g.add(body);
  const dark=lam({color:0x1c1e22});const rf=hipRoof(W,D,3,lam({map:TX.slate,color:0x6a6e74,side:THREE.DoubleSide}));rf.position.y=Hh;g.add(rf);
  const eav=new THREE.Mesh(new THREE.BoxGeometry(W+.3,.28,.45),dark);eav.position.set(0,Hh,F+.15);g.add(eav);for(let x=-W/2+.4;x<W/2;x+=.9){const br=new THREE.Mesh(new THREE.BoxGeometry(.14,.4,.35),dark);br.position.set(x,Hh-.3,F+.15);g.add(br);}
  for(const gx of (gables||(gable?[0]:[]))){const gw=Math.min(W*.6,5.4),gh=2.7;const tri=new THREE.Shape();tri.moveTo(-gw/2,0);tri.lineTo(gw/2,0);tri.lineTo(0,gh);tri.closePath();
    const fc=new THREE.Mesh(new THREE.ShapeGeometry(tri),lam({color:wall,side:THREE.DoubleSide}));fc.position.set(gx,Hh,F+.05);g.add(fc);const sl=Math.hypot(gw/2,gh),ang=Math.atan2(gh,gw/2);
    for(const s of [-1,1]){const bb=new THREE.Mesh(new THREE.BoxGeometry(sl+.3,.3,.14),dark);bb.position.set(gx+s*gw/4,Hh+gh/2,F+.12);bb.rotation.z=-s*ang;g.add(bb);}
    const rl=new THREE.Mesh(new THREE.BoxGeometry(gw*.75,.04,2.6),lam({map:TX.slate,color:0x6a6e74}));// little ridge back into the roof
    const ridge=new THREE.Mesh(new THREE.BoxGeometry(.25,.25,3),lam({map:TX.slate,color:0x5a5e64}));ridge.position.set(gx,Hh+gh-.1,F-1.4);g.add(ridge);}
  const wt=lam({map:winTex||archWinTex()});const cols=winCols||(W>9?[-W*.33,-W*.11,W*.11,W*.33]:[-W*.2,W*.2]);
  for(let fl=1;fl<floors;fl++){for(const wx of cols){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.15,2.1),wt);p.position.set(wx,fl*fh+1.6,F+.04);g.add(p);const sill=new THREE.Mesh(new THREE.BoxGeometry(1.4,.12,.22),lam({color:0xe8e8e2}));sill.position.set(wx,fl*fh+.52,F+.1);g.add(sill);}}
  if(gable)for(const gx of (gables||[0])){for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(.75,1.4),wt);p.position.set(gx+s*.55,Hh+.45,F+.07);g.add(p);}}
  if(fascia){const fm=new THREE.Mesh(new THREE.PlaneGeometry(W-.4,1.1),new THREE.MeshBasicMaterial({map:fascia,fog:true}));fm.position.set(0,3.55,F+.25);g.add(fm);const fb=new THREE.Mesh(new THREE.BoxGeometry(W-.2,1.25,.3),dark);fb.position.set(0,3.55,F+.08);g.add(fb);}
  if(shop){const sm=new THREE.Mesh(new THREE.PlaneGeometry(W-.4,2.9),new THREE.MeshBasicMaterial({map:shop,fog:true}));sm.position.set(0,1.5,F+.05);g.add(sm);}
  if(extra)extra(g,W,F,Hh);
  g.position.set(f.x,y,f.z);g.rotation.y=f.ry;SR.add(g);return g;}
function squareShops(){
  // The Genoa (7a): cream, "ICES" on the front, black fascia and awning
  {const pts=takeBuild(13,4.5);if(pts){const sp=squareRoadPt(13,4.5);const f=fitFront(pts,sp[0],sp[1]);
    const fas=canvasTex(512,64,(c,w,h)=>{c.fillStyle='#101010';c.fillRect(0,0,w,h);c.fillStyle='#f2f2ec';c.font='700 46px Georgia,serif';c.textAlign='center';c.textBaseline='middle';c.fillText('GENOA',w/2,h/2+3);});
    const shop=canvasTex(256,96,(c,w,h)=>{c.fillStyle='#141414';c.fillRect(0,0,w,h);c.fillStyle='#e8d2a8';c.fillRect(80,8,96,h-8);c.fillStyle='#ffe8b8';c.fillRect(84,12,88,40);for(let k=0;k<6;k++){c.fillStyle=['#f6c6d6','#c8e8a8','#f8e0a0','#d8b890','#b8d8f0','#f0a0a0'][k];c.fillRect(88+k*14,60,10,10);}
      c.fillStyle='#c8d8e0';c.fillRect(6,10,66,h-16);c.fillRect(184,10,66,h-16);c.fillStyle='#d8c8a8';c.fillRect(10,50,58,30);c.fillRect(188,50,58,30);});
    victorianUnit(f,{wall:0xeee8bc,floors:3,gable:true,winTex:archWinTex('#f4f4ee','#3e4a58',true),fascia:fas,shop,extra:(g,W,F,Hh)=>{
      const ices=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.8),letters('ICES',{w:2.6,h:.8,col:'#f6f6f0',shadow:'#8a8a80',font:'700 88px Georgia,serif'}));ices.position.set(0,6.1,F+.08);g.add(ices);
      const aw=new THREE.Mesh(new THREE.PlaneGeometry(W+.2,1.2),lam({map:canvasTex(512,64,(c,w,h)=>{c.fillStyle='#161616';c.fillRect(0,0,w,h);c.fillStyle='#e8e8e0';c.font='700 28px Georgia,serif';c.textAlign='center';c.fillText('THE GENOA',w/2,30);c.font='700 12px Georgia,serif';
        c.textAlign='left';c.fillText('RESTAURANT · TAKE-AWAY',8,56);c.textAlign='center';c.fillText('1910',w/2,56);c.textAlign='right';c.fillText('AWARD WINNING GELATO',w-8,56);}),side:THREE.DoubleSide}));aw.position.set(0,2.75,F+.75);aw.rotation.x=.75;g.add(aw);
      for(const s of [-1,1]){const ch=new THREE.Mesh(new THREE.BoxGeometry(.8,1.8,.6),lam({color:0x7a5a48}));ch.position.set(s*(W/2-.5),Hh+2.3,0);g.add(ch);}}});
    LMPOS.push([f.x,f.z]);LMDBG.push(['THE GENOA',f.x,f.z,f.ry,f.d]);}}
  // next door: the turquoise shopfront with the pink fascia
  {const pts=takeBuild(12,11.5);if(pts){const sp=squareRoadPt(12,11.5);const f=fitFront(pts,sp[0],sp[1]);
    const fas=canvasTex(512,64,(c,w,h)=>{c.fillStyle='#e8346a';c.fillRect(0,0,w,h);c.fillStyle='#fff';c.font='italic 700 40px Georgia,serif';c.textBaseline='middle';c.fillText('Mash',20,h/2+2);c.font='700 18px Arial,sans-serif';c.fillText('ACCESSORIES',140,h/2+3);});
    const shop=canvasTex(256,96,(c,w,h)=>{c.fillStyle='#5ac8c8';c.fillRect(0,0,w,h);c.fillStyle='#6ad8d8';c.fillRect(8,6,46,h-6);c.fillStyle='#f4f4f0';c.fillRect(64,6,186,h-12);for(let k=0;k<9;k++){c.fillStyle=['#f070a0','#ffffff','#e84a8a','#f8c8d8','#c870d8'][k%5];c.fillRect(72+k*19,20+(k%3)*12,14,30);}});
    victorianUnit(f,{wall:0xb3b9a2,floors:3,gable:true,fascia:fas,shop});LMPOS.push([f.x,f.z]);}}
  // Diamonds Restaurant (9-11): sage green, arched windows with little iron balconies and lanterns, black and gold fascia, a red timber shopfront
  {const pts=takeBuild(8.6,20.7);if(pts){const sp=squareRoadPt(8.6,20.7);const f=fitFront(pts,sp[0],sp[1]);
    const fas=canvasTex(1024,64,(c,w,h)=>{c.fillStyle='#141414';c.fillRect(0,0,w,h);c.strokeStyle='#c8a050';c.lineWidth=3;c.strokeRect(4,4,w-8,h-8);c.fillStyle='#e8e2d0';c.font='700 40px Georgia,serif';c.textBaseline='middle';c.fillText('DIAMONDS  RESTAURANT',60,h/2+2);c.textAlign='right';c.font='700 34px Georgia,serif';c.fillText('TAKE AWAY',w-40,h/2+2);});
    const shop=canvasTex(512,96,(c,w,h)=>{c.fillStyle='#b01c1c';c.fillRect(0,0,w,h);const panes=[[14,60],[92,96],[200,120],[332,60],[404,96]];for(const [x,ww] of panes){c.fillStyle='#d8c098';c.fillRect(x,8,ww,h-30);c.fillStyle='rgba(255,236,200,.7)';c.fillRect(x+4,12,ww-8,20);}
      c.fillStyle='#8a1414';c.fillRect(76,10,12,h-10);c.fillRect(184,10,12,h-10);c.fillStyle='#c01e1e';c.fillRect(150,26,30,h-26);c.fillStyle='#e8e0d0';c.fillRect(220,40,80,30);for(let k=0;k<5;k++){c.fillStyle='#7a4a2a';c.fillRect(226+k*14,52,8,18);}
      c.fillStyle='#8a1414';for(let x=0;x<w;x+=12)c.fillRect(x,h-22,6,22);});
    const n=Math.max(4,Math.round(f.w/2.6));const cols=[];for(let k=0;k<n;k++)cols.push(-f.w/2+f.w*(k+.5)/n);
    victorianUnit(f,{wall:0xa9b29a,floors:3,gable:false,gables:[-f.w*.3,f.w*.3],winCols:cols,fascia:fas,shop,extra:(g,W,F,Hh)=>{
      const iron=lam({color:0x141618});for(const wx of cols){const b=new THREE.Mesh(new THREE.BoxGeometry(1.4,.6,.06),new THREE.MeshLambertMaterial({map:canvasTex(64,32,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#141618';c.fillRect(0,0,w,3);c.fillRect(0,h-3,w,3);for(let x=2;x<w;x+=6)c.fillRect(x,0,2,h);c.beginPath();c.arc(w/2,h/2,6,0,7);c.lineWidth=2;c.strokeStyle='#141618';c.stroke();}),transparent:true,alphaTest:.4}));b.position.set(wx,3.3+.75,F+.45);g.add(b);
        const fl=new THREE.Mesh(new THREE.BoxGeometry(1.4,.08,.5),iron);fl.position.set(wx,3.3+.45,F+.25);g.add(fl);}
      for(const s of [-1,1]){const ln=new THREE.Group();const pole=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.5),iron);pole.position.z=.25;ln.add(pole);const lt=new THREE.Mesh(new THREE.ConeGeometry(.22,.55,6,1,true),iron);lt.position.set(0,-.2,.5);lt.rotation.x=Math.PI;ln.add(lt);
        const gl=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),new THREE.MeshBasicMaterial({color:0xffd890}));gl.position.set(0,-.25,.5);ln.add(gl);ln.position.set(s*(W/2-1.1),5.6,F);g.add(ln);}}});
    LMPOS.push([f.x,f.z]);LMDBG.push(['DIAMONDS',f.x,f.z,f.ry,f.d]);}}}
