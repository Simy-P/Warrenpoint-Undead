// ================================================================ Friar Tuck's, after the photo
function friarTucksReal(x,z){const w=17,h=8.2,d=11;const q=byRoad(x,z,d);const y=groundH(q.x,q.z);SOLIDS.push({box:1,x:q.x,y,z:q.z,ry:q.ry,w,d,h});const g=new THREE.Group();const F=d/2;
  const cream=lam({color:0xeeeee6}),greyF=lam({color:0x4c555c}),black=lam({color:0x16181b}),whiteM=lam({color:0xf7f7f3});
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),cream);body.position.y=h/2;g.add(body);
  const base=new THREE.Mesh(new THREE.BoxGeometry(w,2.2,d),lam({color:0x5a6067}));base.position.y=-1.1;g.add(base);
  {const ex=w/2+.2,ez=d/2+.3,rh=3;const P=[[-ex,0,-ez],[ex,0,-ez],[ex,0,ez],[-ex,0,ez],[-ex+3,rh,0],[ex-3,rh,0]];const Fs=[[3,2,5],[3,5,4],[1,0,4],[1,4,5],[2,1,5],[0,3,4]];const pos=[],uv=[];
    for(const fc of Fs)for(const k of fc){pos.push(...P[k]);uv.push(P[k][0]*.15,(P[k][1]+P[k][2])*.15);}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));rg.computeVertexNormals();
    const rf=new THREE.Mesh(rg,lam({map:TX.slate,color:0x6e7176,side:THREE.DoubleSide}));rf.position.y=h;g.add(rf);}
  // upstairs: tall grey-framed windows with black railings across their lower half, little wall lamps between
  const upw=lam({map:canvasTex(64,128,(c,W,H)=>{c.fillStyle='#4c555c';c.fillRect(0,0,W,H);c.fillStyle='#9fb6c8';c.fillRect(5,5,W-10,H/2-7);c.fillRect(5,H/2+2,W-10,H/2-7);c.fillStyle='#4c555c';c.fillRect(W/2-2,5,4,H-10);
    c.fillStyle='#16181b';c.fillRect(5,H*.62,W-10,3);c.fillRect(5,H-9,W-10,3);for(let xx=8;xx<W-6;xx+=6)c.fillRect(xx,H*.62,2,H*.38-8);})});
  for(const wx of [-5.6,0,5.6]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.3),upw);p.position.set(wx,6.05,F+.04);g.add(p);const sur=new THREE.Mesh(new THREE.BoxGeometry(1.85,2.6,.08),whiteM);sur.position.set(wx,6.05,F+.01);g.add(sur);}
  for(const wx of [-2.8,2.8]){const l=new THREE.Mesh(new THREE.BoxGeometry(.18,.3,.25),black);l.position.set(wx,7.0,F+.15);g.add(l);}
  // the cornice: moulded white with dentils, and a little slate canopy above the fascia
  const corn=new THREE.Mesh(new THREE.BoxGeometry(w+.3,.35,.55),whiteM);corn.position.set(0,4.55,F+.25);g.add(corn);
  for(let xx=-w/2+.4;xx<w/2;xx+=.55){const dn=new THREE.Mesh(new THREE.BoxGeometry(.22,.16,.12),whiteM);dn.position.set(xx,4.3,F+.48);g.add(dn);}
  const can=new THREE.Mesh(new THREE.BoxGeometry(w+.3,.12,.9),lam({map:TX.slate,color:0x8a9096}));can.position.set(0,4.78,F+.38);can.rotation.x=.35;g.add(can);
  // the green fascia
  const fas=new THREE.Mesh(new THREE.PlaneGeometry(w-1.6,1.25),lam({map:canvasTex(1024,96,(c,W,H)=>{const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#86e04a');gr.addColorStop(1,'#4cc232');c.fillStyle=gr;c.fillRect(0,0,W,H);c.fillStyle='#2a8a28';c.fillRect(0,H-6,W,6);
    c.font="italic 900 66px 'Arial Black',Impact,sans-serif";c.textAlign='center';c.textBaseline='middle';c.lineWidth=9;c.strokeStyle='#ffffff';c.strokeText("FRIAR  TUCK'S",W/2,H/2+3);c.fillStyle='#0f8a4a';c.fillText("FRIAR  TUCK'S",W/2,H/2+3);
    c.lineWidth=2;c.strokeStyle='#0b5a30';c.strokeText("FRIAR  TUCK'S",W/2,H/2+3);}),emissive:0x1a3a10}));fas.position.set(0,3.6,F+.3);g.add(fas);
  // fluted white columns at each end
  const flute=canvasTex(32,128,(c,W,H)=>{c.fillStyle='#f7f7f3';c.fillRect(0,0,W,H);c.fillStyle='rgba(120,120,110,.35)';for(const xx of [6,13,20,27])c.fillRect(xx,0,2,H);});
  for(const s of [-1,1]){const col=new THREE.Mesh(new THREE.CylinderGeometry(.42,.46,4.2,14),lam({map:flute}));col.position.set(s*(w/2-.5),2.1,F+.35);g.add(col);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(1.1,.3,1.1),whiteM);cap.position.set(s*(w/2-.5),4.25,F+.35);g.add(cap);}
  // the shopfront: dark grey frames; the left window behind a black iron gate, the open doors onto a lit counter, ice-cream posters on the right
  const shop=new THREE.Mesh(new THREE.PlaneGeometry(w-2.2,3.05),new THREE.MeshBasicMaterial({map:canvasTex(512,96,(c,W,H)=>{c.fillStyle='#4c555c';c.fillRect(0,0,W,H);
      c.fillStyle='#6a8296';c.fillRect(6,14,140,H-20);c.fillStyle='#cfe0ec';c.fillRect(10,18,40,22);c.fillStyle='#e04040';c.fillRect(60,24,24,10);
      c.fillStyle='#e8c89a';c.fillRect(170,8,150,H-10);c.fillStyle='#b05a2a';c.fillRect(178,H-30,134,22);for(let k=0;k<6;k++){c.fillStyle=['#e84a4a','#f0c040','#5ad070','#4a8ae8','#e870b0','#ffffff'][k];c.fillRect(184+k*22,40,16,16);}c.fillStyle='#2a2a2a';c.fillRect(178,10,134,14);c.fillStyle='#60ff80';c.fillRect(190,13,30,7);c.fillRect(240,13,30,7);
      c.fillStyle='#4c555c';c.fillRect(160,0,10,H);c.fillRect(320,0,10,H);
      for(const [xx,ww] of [[338,60],[404,100]]){c.fillStyle='#dde8ee';c.fillRect(xx,8,ww,H-14);}
      const cone=(cx,cy,s)=>{c.fillStyle='#d8a040';c.beginPath();c.moveTo(cx-8*s,cy);c.lineTo(cx+8*s,cy);c.lineTo(cx,cy+26*s);c.closePath();c.fill();c.fillStyle='#bfe0f8';c.beginPath();c.arc(cx,cy-4*s,9*s,0,7);c.fill();};
      c.fillStyle='#f6f0d8';c.fillRect(344,12,48,70);cone(368,30,1.2);c.fillStyle='#1a1a1a';c.fillRect(410,12,88,30);c.fillStyle='#f0d060';c.font='700 12px Georgia,serif';c.fillText('ICE CREAM',420,32);
      c.fillStyle='#f6f0d8';c.fillRect(430,46,40,40);cone(450,56,.9);c.fillStyle='#1a1a1a';c.fillRect(338,H-16,160,12);c.fillStyle='#f0d060';c.font='700 10px Georgia,serif';c.fillText('HOME MADE ICE CREAM',350,H-7);}),fog:true}));
  shop.position.set(0,1.55,F+.05);g.add(shop);
  // a recess at the door (a dark gap you can see into) and the iron gate across the left window
  const gateT=canvasTex(128,96,(c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#141618';c.fillRect(0,H-6,W,6);c.fillRect(0,34,W,3);for(let xx=3;xx<W;xx+=7){c.fillRect(xx,24,2,H-26);c.fillStyle='#c8a050';c.beginPath();c.arc(xx+1,22,2.4,0,7);c.fill();c.fillStyle='#141618';}
    c.lineWidth=2;c.strokeStyle='#141618';c.beginPath();c.moveTo(0,30);c.quadraticCurveTo(W/4,6,W/2,26);c.quadraticCurveTo(3*W/4,6,W,30);c.stroke();});
  const gate=new THREE.Mesh(new THREE.PlaneGeometry(4.3,2.4),new THREE.MeshLambertMaterial({map:gateT,transparent:true,alphaTest:.4,side:THREE.DoubleSide}));gate.position.set(-w/2+3.6,1.2,F+.75);g.add(gate);
  for(const xx of [-w/2+1.4,-w/2+5.8,w/2-4.2,w/2-1.4]){const b=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,1.15,10),black);b.position.set(xx,.58,F+.85);g.add(b);const t=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),lam({color:0xc8a050}));t.position.set(xx,1.2,F+.85);g.add(t);}
  const pav=new THREE.Mesh(new THREE.PlaneGeometry(w,2.4),lam({map:TX.pavement||TX.stone,color:0xd6d4ce}));pav.rotation.x=-Math.PI/2;pav.position.set(0,.03,F+1.2);g.add(pav);
  g.position.set(q.x,y,q.z);g.rotation.y=q.ry;SR.add(g);LMPOS.push([q.x,q.z]);LMDBG.push(["FRIAR TUCK'S",q.x,q.z,q.ry,d]);return g;}
