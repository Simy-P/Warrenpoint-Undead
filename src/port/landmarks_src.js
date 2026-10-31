function house(x,z,ry,{w=8,d=6,h=4.5,wall=0xefe9dc,roof='slate',door=0x2d4f8a,chimney=true}={}){const g=new THREE.Group();const y=groundH(x,z);SOLIDS.push({box:1,x,y,z,ry,w,d,h:h+1});
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,h+2,d),lam({map:TX.wall,color:wall}));body.position.y=h/2-1;g.add(body);
  const rg=new THREE.CylinderGeometry(.01,d*.72,w+.6,4,1,true);rg.rotateZ(Math.PI/2);rg.rotateX(Math.PI/4);rg.scale(1,.75,1);
  const roofM=new THREE.Mesh(rg,lam({map:TX[roof],color:0xffffff,flatShading:true}));roofM.position.y=h+d*.36;g.add(roofM);
  const dr=new THREE.Mesh(new THREE.PlaneGeometry(1.1,2.1),lam({color:door}));dr.position.set(0,1.05,d/2+.03);g.add(dr);
  const winM=lam({color:0x23303d});for(const wx of [-w*.3,w*.3])for(let wy=1.6;wy<h-.7;wy+=2.2){const wi=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1),winM);wi.position.set(wx,wy,d/2+.03);g.add(wi);}
  if(chimney){const ch=new THREE.Mesh(new THREE.BoxGeometry(.8,2,.8),lam({color:0x8a5a44}));ch.position.set(w*.32,h+d*.45,0);g.add(ch);}
  g.position.set(x,y,z);g.rotation.y=ry;SR.add(g);return g;}
function shopFront(x,z,{name,w=12,d=9,h=9,wall=0xf4efe4,bg='#1d3b2a',fg='#e8d9a8',roof='slate',font,ry=null}={}){const q=ry==null?byRoad(x,z,d):{x,z,ry};const g=house(q.x,q.z,q.ry,{w,d,h,wall,roof});
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w*.85,10),1.2),lam({map:signTex(name,bg,fg,font)}));sg.position.set(0,3.4,d/2+.09);g.add(sg);LMPOS.push([q.x,q.z]);LMDBG.push([name,q.x,q.z,q.ry,d]);return g;}
function friarTucks(x,z){const w=22,h=7.6,d=11;const q=byRoad(x,z,d);SOLIDS.push({box:1,x:q.x,y:groundH(q.x,q.z),z:q.z,ry:q.ry,w,d,h});const g=new THREE.Group(),y=groundH(q.x,q.z);const wall=lam({map:TX.wall,color:0xf1f1ee}),grey=lam({color:0x5a6067});
  const box=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),[wall,wall,wall,wall,lam({map:friarFacade()}),wall]);box.position.y=h/2;g.add(box);
  const base=new THREE.Mesh(new THREE.BoxGeometry(w,2.2,d),grey);base.position.y=-1.1;g.add(base);
  const rg=new THREE.CylinderGeometry(.01,d*.72,w+.6,4,1,true);rg.rotateZ(Math.PI/2);rg.rotateX(Math.PI/4);rg.scale(1,.62,1);
  const roof=new THREE.Mesh(rg,lam({map:TX.slate,flatShading:true}));roof.position.y=h+d*.3;g.add(roof);
  // front gable with the clock, over the right-hand end
  const sh=new THREE.Shape();sh.moveTo(-3.6,0);sh.lineTo(3.6,0);sh.lineTo(0,3.4);sh.lineTo(-3.6,0);
  const gab=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:4,bevelEnabled:false}),wall);gab.position.set(w/2-4.2,h,d/2-4);g.add(gab);
  const gr=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.2,bevelEnabled:false}),lam({color:0x3d4247}));gr.scale.set(1.08,1.08,1);gr.position.set(w/2-4.2,h-.05,d/2-4.15);g.add(gr);
  const clock=new THREE.Mesh(new THREE.CircleGeometry(.78,24),lam({color:0xf7f7f2}));clock.position.set(w/2-4.2,h+1.25,d/2+.03);g.add(clock);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.78,.08,6,24),lam({color:0x1d1d1d}));ring.position.copy(clock.position);g.add(ring);
  for(const [len,ang] of [[.5,.9],[.65,-.4]]){const hand=new THREE.Mesh(new THREE.BoxGeometry(.06,len,.03),lam({color:0x111111}));hand.position.set(clock.position.x+Math.sin(ang)*len/2,clock.position.y+Math.cos(ang)*len/2,clock.position.z+.03);hand.rotation.z=-ang;g.add(hand);}
  const ch=new THREE.Mesh(new THREE.BoxGeometry(1.4,2.2,1.2),lam({map:TX.wall,color:0xd9d9d4}));ch.position.set(-w/2+1.6,h+d*.3+.6,0);g.add(ch);
  for(const k of [0,1]){const pot=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.5,8),lam({color:0xa0a0a0}));pot.position.set(-w/2+1.3+k*.6,h+d*.3+1.95,0);g.add(pot);}
  g.position.set(q.x,y,q.z);g.rotation.y=q.ry;SR.add(g);
  for(const t of [-8,0,8])LMPOS.push([q.x+Math.cos(q.ry)*t,q.z-Math.sin(q.ry)*t]);LMDBG.push(["FRIAR TUCK'S",q.x,q.z,q.ry,d]);}
function whistledown(x,z,ry){const w=36,h=11,d=16;const g=new THREE.Group();const f=[Math.sin(ry),Math.cos(ry)],r=[Math.cos(ry),-Math.sin(ry)];
  let y=-1e9;for(const a of [-1,1])for(const b of [-1,1])y=Math.max(y,groundH(x+r[0]*a*w/2+f[0]*b*d/2,z+r[1]*a*w/2+f[1]*b*d/2));
  const wall=lam({map:TX.wall,color:0xf6f6f2});const box=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),[wall,wall,wall,wall,lam({map:wdFacade()}),wall]);box.position.y=h/2;g.add(box);
  const base=new THREE.Mesh(new THREE.BoxGeometry(w+.4,6,d+.4),lam({color:0xbfc1bd}));base.position.y=-3;g.add(base);
  const rg=new THREE.CylinderGeometry(.01,d*.72,w+.4,4,1,true);rg.rotateZ(Math.PI/2);rg.rotateX(Math.PI/4);rg.scale(1,.5,1);
  const roof=new THREE.Mesh(rg,lam({map:TX.slate,flatShading:true}));roof.position.y=h+d*.25;g.add(roof);
  for(const t of [-12,-4,4,12]){const dm=new THREE.Mesh(new THREE.BoxGeometry(2.6,2,2.4),lam({color:0xf6f6f2}));dm.position.set(t,h+1.3,d/2-2.6);g.add(dm);
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.2),lam({color:0x34465a}));gl.position.set(t,h+1.2,d/2-1.39);g.add(gl);}
  for(const t of [-w/2+1.5,w/2-1.5]){const ch=new THREE.Mesh(new THREE.BoxGeometry(1.6,3,1.4),lam({map:TX.wall,color:0xe2e2de}));ch.position.set(t,h+d*.25+.8,0);g.add(ch);}
  // terrace and railings in front, looking out over the lough
  const ter=new THREE.Mesh(new THREE.BoxGeometry(w,.3,4),lam({map:TX.stone}));ter.position.set(0,.15,d/2+2);g.add(ter);
  const rail=new THREE.Mesh(new THREE.BoxGeometry(w,.08,.08),lam({color:0x1c1c1c}));rail.position.set(0,1.05,d/2+4);g.add(rail);
  SOLIDS.push({box:1,x,y,z,ry,w,d,h});g.position.set(x,y,z);g.rotation.y=ry;SR.add(g);for(const t of [-14,0,14])LMPOS.push([x+r[0]*t,z+r[1]*t]);LMDBG.push(['THE WHISTLEDOWN',x,z,ry,d]);}
function warrenpointBaths(x0,z0){const sd=(x,z)=>sdWater(x,z);let gx=sd(x0+2,z0)-sd(x0-2,z0),gz=sd(x0,z0+2)-sd(x0,z0-2);let L=Math.hypot(gx,gz)||1;const ax=-gx/L,az=-gz/L;
  let sx=x0,sz=z0;for(let k=0;k<200&&sd(sx,sz)>0;k++){sx+=ax;sz+=az;}const yP=Math.max(groundH(sx-ax*6,sz-az*6),2.6);
  const g=new THREE.Group();g.position.set(sx-ax*2,0,sz-az*2);g.rotation.y=Math.atan2(ax,az);
  const conc=lam({map:TX.stone,color:0xe6e2d8}),wall=lam({map:TX.stone,color:0xbab4a8}),white=lam({color:0xf4f2ec}),green=lam({color:0x1f5c58}),water=lam({color:0x3fa6b4}),slip=lam({color:0x8fd3d8}),iron=lam({color:0x1c1c1c}),copper=lam({color:0x6fa58f});
  const B=(w,h,d,m,x,y,z,ry=0)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.rotation.y=ry;g.add(o);return o;};
  const deckY=yP-.1,lowY=yP-1.6;
  // the pier: upper deck down the middle, with a lower deck either side carrying the bathing boxes
  B(7,deckY+1.5,48,conc,0,(deckY-1.5)/2,24);B(2.2,lowY+1.5,46,wall,-4.6,(lowY-1.5)/2,24);B(2.2,lowY+1.5,46,wall,4.6,(lowY-1.5)/2,24);
  for(const sdn of [-1,1])for(let a=3;a<46;a+=2.1){const c=B(1.7,2.1,1.5,white,sdn*4.6,lowY+1.05,a);const dr=B(.05,1.7,.9,[lam({color:0x2a4f8c}),lam({color:0x8c1e24})][((a/2.1)|0)%2],sdn*3.73,lowY+.95,a);}
  for(const sdn of [-1,1])for(let a=0;a<48;a+=1.6)B(.06,1.0,.06,green,sdn*3.4,deckY+.5,a);for(const sdn of [-1,1])B(.06,.06,48,green,sdn*3.4,deckY+1,24);
  // the two baths: sea walls round each pool, the water held in at mid tide, a shallow slip at the landward end
  const pool=(side,len)=>{const b0=5.8,b1=b0+12.2,bc=side*(b0+b1)/2;B(1.2,2.6,len+1.2,wall,side*(b1+.6),.3,6+len/2);B(13.4,2.6,1.2,wall,bc,.3,6+len+.6);
    const w=new THREE.Mesh(new THREE.PlaneGeometry(12.2,len),water);w.rotation.x=-Math.PI/2;w.position.set(bc,.95,6+len/2);g.add(w);
    const sl=new THREE.Mesh(new THREE.PlaneGeometry(12.2,5),slip);sl.rotation.x=-Math.PI/2;sl.position.set(bc,.97,8.5);g.add(sl);
    for(let k=0;k<4;k++)B(.08,1.2,.08,iron,side*b0+side*(k*3.5+1.5),1.9,6+len+.7);};
  pool(1,36.6);pool(-1,24.4);
  // entrance from Marine Road: ornamental gates between two domed kiosks, and the name over the gate
  for(const sdn of [-1,1]){B(3,3,3,white,sdn*4.2,yP+1.5,-1.5);const dm=new THREE.Mesh(new THREE.SphereGeometry(1.7,12,8,0,Math.PI*2,0,Math.PI/2),copper);dm.position.set(sdn*4.2,yP+3,-1.5);g.add(dm);
    const fin=new THREE.Mesh(new THREE.ConeGeometry(.12,.8,6),copper);fin.position.set(sdn*4.2,yP+5,-1.5);g.add(fin);B(.3,3.6,.3,white,sdn*2.6,yP+1.8,-1.5);}
  for(let k=-5;k<=5;k++)B(.05,2.6+Math.cos(k/5*1.2)*.6,.05,iron,k*.46,yP+1.3,-1.5);B(5.2,.08,.08,iron,0,yP+.3,-1.5);B(5.2,.08,.08,iron,0,yP+2.5,-1.5);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(5,.7),lam({map:signTex('WARRENPOINT BATHS 1908','#1f5c58','#f4efe0','700 46px Barlow, sans-serif'),side:THREE.DoubleSide}));sg.position.set(0,yP+3.7,-1.62);sg.rotation.y=Math.PI;g.add(sg);
  // a flag at the end of the pier
  B(.12,7,.12,white,0,deckY+3.5,46.5);const fl=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1),lam({color:0x2a4f8c,side:THREE.DoubleSide}));fl.position.set(.85,deckY+6.4,46.5);g.add(fl);
  SR.add(g);LMPOS.push([sx,sz],[sx+ax*20,sz+az*20]);}
function church(x,z,ry,{scale=1,big=false}={}){const g=new THREE.Group(),y=groundH(x,z),gran=lam({map:TX.stone,color:0xb3b0a8}),render=lam({map:TX.wall,color:0xd9d6cf}),slate=lam({map:TX.slate,flatShading:true}),dark=lam({color:0x1e2630});
  const L=big?36:24,W=big?13:10,H=big?11:8;
  const nave=new THREE.Mesh(new THREE.BoxGeometry(W,H+2,L),render);nave.position.y=H/2-1;g.add(nave);
  const rf=new THREE.Mesh(new THREE.CylinderGeometry(.01,W*.78,L+.6,4,1,true),slate);rf.rotation.set(Math.PI/2,Math.PI/4,0);rf.scale.set(1,1,.62);rf.position.set(0,H+W*.3,0);g.add(rf);
  if(big){const tr=new THREE.Mesh(new THREE.BoxGeometry(30,H+1,10),render);tr.position.set(0,H/2-.5,-4);g.add(tr);const trf=new THREE.Mesh(new THREE.CylinderGeometry(.01,7.8,30.6,4,1,true),slate);trf.rotation.set(0,0,Math.PI/2);trf.rotateX(Math.PI/4);trf.scale.set(1,1,.62);trf.position.set(0,H+3,-4);g.add(trf);}
  for(const sd of [-1,1])for(let k=0;k<(big?6:4);k++){const w=new THREE.Mesh(new THREE.PlaneGeometry(1.1,4.2),dark);w.position.set(sd*(W/2+.03),H*.55,-L/2+5+k*(L-10)/((big?6:4)-1));w.rotation.y=sd*Math.PI/2;g.add(w);}
  const TW=big?8:6,TH=big?24:18;const tw=new THREE.Mesh(new THREE.BoxGeometry(TW,TH,TW),gran);tw.position.set(0,TH/2,L/2+TW/2-1);g.add(tw);
  for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const bt=new THREE.Mesh(new THREE.BoxGeometry(1.2,TH-2,1.2),gran);bt.position.set(a*(TW/2+.3),TH/2-1,L/2+TW/2-1+b*(TW/2+.3));g.add(bt);
    const pin=new THREE.Mesh(new THREE.CylinderGeometry(.05,.7,3.6,8),gran);pin.position.set(a*(TW/2+.3),TH+1.6,L/2+TW/2-1+b*(TW/2+.3));g.add(pin);}
  const sp=new THREE.Mesh(new THREE.ConeGeometry(TW*.62,big?26:15,8),lam({map:TX.stone,color:0x9e9b94}));sp.position.set(0,TH+(big?13:7.5),L/2+TW/2-1);sp.rotation.y=Math.PI/8;g.add(sp);
  const door=new THREE.Mesh(new THREE.PlaneGeometry(2.4,4.4),lam({color:0x3a2416}));door.position.set(0,2.2,L/2+TW-.97);g.add(door);
  const arch=new THREE.Mesh(new THREE.CircleGeometry(1.2,12,0,Math.PI),lam({color:0x3a2416}));arch.position.set(0,4.4,L/2+TW-.96);g.add(arch);
  for(const yy of [8,13]){const lw=new THREE.Mesh(new THREE.PlaneGeometry(1,3),dark);lw.position.set(0,yy,L/2+TW-.96);g.add(lw);}
  const cross=new THREE.Mesh(new THREE.BoxGeometry(.2,1.6,.2),lam({color:0x333333}));cross.position.set(0,TH+(big?26.8:15.8),L/2+TW/2-1);g.add(cross);
  g.scale.setScalar(scale);g.position.set(x,y,z);g.rotation.y=ry;SR.add(g);return g;}
function municipalPark(){const y=groundH(PARK.x,PARK.z);const g=new THREE.Group(),green=lam({color:0x1f3d2c});
  const lawn=new THREE.Mesh(new THREE.BoxGeometry(PARK.w,1.6,PARK.d),[lam({color:0x6e5a40}),lam({color:0x6e5a40}),lam({color:0x6fae4a}),lam({color:0x6e5a40}),lam({color:0x6e5a40}),lam({color:0x6e5a40})]);lawn.position.y=-.6;g.add(lawn);
  const posts=[];for(let t=0;t<=1;t+=.012){for(const [ax,az] of [[-1,-1],[1,-1]]){}}
  const rails=[];const edge=(x0,z0,x1,z1)=>{const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/1.2);for(let k=0;k<=n;k++){const f=k/n;rails.push({x:PARK.x+x0+(x1-x0)*f,y:y+.9,z:PARK.z+z0+(z1-z0)*f});}};
  const hw=PARK.w/2,hd=PARK.d/2;edge(-hw,-hd,hw,-hd);edge(-hw,hd,hw,hd);edge(-hw,-hd,-hw,-6);edge(-hw,6,-hw,hd);edge(hw,-hd,hw,hd);
  inst(new THREE.BoxGeometry(.07,1.6,.07),green,rails.filter(r=>shortClear(r.x,r.z,1.5)));
  for(const zz of [-hd,hd])for(const xx of [-hw,hw]){const p=new THREE.Mesh(new THREE.BoxGeometry(.5,2,.5),lam({map:TX.stone}));p.position.set(xx,1,zz);g.add(p);}
  for(const zz of [-6,6]){const gp=new THREE.Mesh(new THREE.BoxGeometry(.7,2.6,.7),lam({map:TX.stone}));gp.position.set(-hw,1.3,zz);g.add(gp);}
  const path=new THREE.Mesh(new THREE.BoxGeometry(PARK.w-6,.12,3),lam({color:0xc9bfa6}));path.position.y=.25;g.add(path);const path2=new THREE.Mesh(new THREE.BoxGeometry(3,.12,PARK.d-6),lam({color:0xc9bfa6}));path2.position.set(-10,.25,0);g.add(path2);
  for(const [a,b,c] of [[-30,-20,0xd8324a],[-30,20,0xf3c623],[20,-22,0x8a4fd8],[30,20,0xd8324a]]){const bed=new THREE.Mesh(new THREE.CylinderGeometry(5,5,.3,16),lam({color:c}));bed.position.set(a,.3,b);g.add(bed);}
  const court=new THREE.Mesh(new THREE.PlaneGeometry(11,24),lam({map:canvasTex(64,128,(c,w,h)=>{c.fillStyle='#3d7a4a';c.fillRect(0,0,w,h);c.strokeStyle='#fff';c.lineWidth=2;c.strokeRect(4,4,w-8,h-8);c.beginPath();c.moveTo(4,h/2);c.lineTo(w-4,h/2);c.moveTo(w/2,20);c.lineTo(w/2,h-20);c.stroke();})}));court.rotation.x=-Math.PI/2;court.rotation.z=Math.PI/2;court.position.set(32,.32,-4);g.add(court);
  g.position.set(PARK.x,y,PARK.z);SR.add(g);bandstand(...LANDMARKS.bandstand);LMPOS.push([PARK.x,PARK.z]);}
function bandstand(x,z){const g=new THREE.Group(),y=groundH(x,z),green=lam({color:0x2f6b4e}),white=lam({color:0xf3f1ea});
  const base=new THREE.Mesh(new THREE.CylinderGeometry(5,5.2,1.6,8),white);base.position.y=.3;g.add(base);
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2+Math.PI/8;const post=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,3.6,8),green);post.position.set(Math.cos(a)*4.5,2.9,Math.sin(a)*4.5);g.add(post);}
  const rail=new THREE.Mesh(new THREE.TorusGeometry(4.5,.08,4,8),white);rail.rotation.x=Math.PI/2;rail.rotation.z=Math.PI/8;rail.position.y=1.9;g.add(rail);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(5.6,2.8,8),green);roof.position.y=6.1;roof.rotation.y=Math.PI/8;g.add(roof);
  const fin=new THREE.Mesh(new THREE.SphereGeometry(.3,8,6),lam({color:0xd4af37}));fin.position.y=7.6;g.add(fin);
  const lawn=new THREE.Mesh(new THREE.CircleGeometry(22,24),lam({color:0x6fae4a}));lawn.rotation.x=-Math.PI/2;lawn.position.y=.15;g.add(lawn);
  const bed=new THREE.Mesh(new THREE.RingGeometry(9,10.6,24),lam({color:0xd8324a}));bed.rotation.x=-Math.PI/2;bed.position.y=.2;g.add(bed);
  g.position.set(x,y,z);SR.add(g);}
function squarePlaza(){const [,i]=nearest(SQUARE.x,SQUARE.z);const y=P[i].y+.12;const g=new THREE.Group();
  const base=new THREE.Mesh(new THREE.BoxGeometry(SQUARE.w,3,SQUARE.d),[lam({map:TX.stone}),lam({map:TX.stone}),lam({map:bayTex}),lam({map:TX.stone}),lam({map:TX.stone}),lam({map:TX.stone})]);base.position.y=-1.5;g.add(base);
  const kerb=new THREE.Mesh(new THREE.BoxGeometry(SQUARE.w+.6,.2,SQUARE.d+.6),lam({color:0xb5b3ac}));kerb.position.y=-.05;g.add(kerb);
  const cols=[0xd8262e,0xf2f2f2,0x1a1a1e,0x2a5d9c,0x8c8f95,0x6b2f2f,0xe0d9c6,0x2f6b3a];const cars=[],cabs=[];
  for(let row=0;row<3;row++)for(let k=0;k<12;k++){if(rnd()<.25)continue;const px=-SQUARE.w/2+5+k*(SQUARE.w-10)/11,pz=-SQUARE.d/2+12+row*(SQUARE.d-24)/2;if(Math.abs(px-9)<9&&Math.abs(pz-1)<6)continue;const c=cols[(rnd()*cols.length)|0];
    const [wx,wz]=sqWorld(px,pz);cars.push({x:wx,y:y+.55,z:wz,ry:Math.PI/2-SQUARE.a+(rnd()-.5)*.08,c});cabs.push({x:wx,y:y+1.25,z:wz,ry:Math.PI/2-SQUARE.a,c});}
  inst(new THREE.BoxGeometry(4.2,.8,1.8),lam({color:0xffffff}),cars);inst(new THREE.BoxGeometry(2.4,.65,1.6),lam({color:0xffffff}),cabs);
  const wc=new THREE.Mesh(new THREE.BoxGeometry(9,3.2,5),lam({map:TX.wall,color:0xe3ded2}));wc.position.set(9,1.6,1);g.add(wc);
  const wcr=new THREE.Mesh(new THREE.BoxGeometry(9.6,.3,5.6),lam({map:TX.slate}));wcr.position.set(9,3.3,1);g.add(wcr);
  for(const [a,b] of [[-30,-36],[30,-36],[-30,36],[30,36],[-30,0],[30,0]]){const tr=new THREE.Mesh(new THREE.IcosahedronGeometry(2.8,0),lam({color:0x3f7a32,flatShading:true}));tr.position.set(a,4.6,b);g.add(tr);
    const tk=new THREE.Mesh(new THREE.CylinderGeometry(.2,.3,3.4),lam({color:0x5e4129}));tk.position.set(a,1.6,b);g.add(tk);}
  for(let k=0;k<10;k++){const a=k<5?-SQUARE.w/2+2:SQUARE.w/2-2,b=-SQUARE.d/2+8+(k%5)*(SQUARE.d-16)/4;const lp=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,6),lam({color:0x1c1c1c}));lp.position.set(a,3,b);g.add(lp);
    const lt=new THREE.Mesh(new THREE.BoxGeometry(.5,.4,.5),lam({color:0xfff1c0}));lt.position.set(a,6.1,b);g.add(lt);}
  const sgn=new THREE.Mesh(new THREE.PlaneGeometry(5,1),lam({map:signTex('THE SQUARE','#fbfbf7','#111111','700 54px Barlow, sans-serif'),side:THREE.DoubleSide}));sgn.position.set(SQUARE.w/2-.5,2,SQUARE.d/2-6);sgn.rotation.y=-Math.PI/2;g.add(sgn);
  g.position.set(SQUARE.x,y,SQUARE.z);g.rotation.y=-SQUARE.a;SR.add(g);LMPOS.push([SQUARE.x,SQUARE.z]);}
function leadingLight(x,y,z,h){const g=new THREE.Group(),steel=lam({color:0x3d4248});
  for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.18,h,.18),steel);leg.position.set(a*.9,h/2,b*.9);leg.rotation.set(-b*.05,0,a*.05);g.add(leg);}
  for(let k=1;k<4;k++){const ring=new THREE.Mesh(new THREE.BoxGeometry(1.9,.12,1.9),steel);ring.position.y=h*k/4;g.add(ring);}
  const hut=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.3,1.3),lam({color:0xf2f2ee}));hut.position.y=h+.6;g.add(hut);
  const lampS=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xff6a40,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));lampS.position.y=h+1.6;lampS.scale.set(3,3,1);g.add(lampS);
  g.position.set(x,y,z);SR.add(g);}
function boat(x,z,ry,hull,sail){const g=new THREE.Group();const h=new THREE.Mesh(new THREE.BoxGeometry(6,1.3,2),lam({color:hull}));g.add(h);
  if(sail){const mast=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,8),lam({color:0xdddddd}));mast.position.y=4.5;g.add(mast);const s=new THREE.Mesh(new THREE.ConeGeometry(2,7,3),lam({color:0xffffff,flatShading:true}));s.position.set(.6,4.4,0);s.scale.set(1,1,.1);g.add(s);}
  else{const wh=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,1.6),lam({color:0xf4f4ef}));wh.position.set(-1,1.4,0);g.add(wh);}
  g.position.set(x,.4,z);g.rotation.y=ry;SR.add(g);}
function crane(x,y,z,ry){const g=new THREE.Group(),m=lam({color:0x2a5d9c}),w=lam({color:0xe8e8e2});
  for(const a of [-1,1])for(const b of [-1,1]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.8,26,.8),m);leg.position.set(a*5,13,b*5);g.add(leg);}
  const top=new THREE.Mesh(new THREE.BoxGeometry(12,3,12),m);top.position.y=27;g.add(top);const cab=new THREE.Mesh(new THREE.BoxGeometry(4,3,4),w);cab.position.set(0,24,7);g.add(cab);
  const boom=new THREE.Mesh(new THREE.BoxGeometry(2,1.6,62),m);boom.position.set(0,30,14);g.add(boom);g.position.set(x,y,z);g.rotation.y=ry;SR.add(g);}
function byRoad(x,z,depth,force=null){const [d,i]=nearest(x,z);
  if(force){const rh=Math.hypot(R[i].x,R[i].z),rx=R[i].x/rh,rz=R[i].z/rh;const wa=sdWater(P[i].x+rx*30,P[i].z+rz*30),wb=sdWater(P[i].x-rx*30,P[i].z-rz*30);const waterSide=wa<wb?1:-1;const side=force.side==='water'?waterSide:-waterSide;
    const px=P[i].x+rx*side*force.off,pz=P[i].z+rz*side*force.off;return {x:px,z:pz,ry:Math.atan2(P[i].x-px,P[i].z-pz)};}const min=W2+VERGE+1.5+depth/2;if(d>min+12)return {x,z,ry:facingRoad(x,z)};
  const side=Math.sign((x-P[i].x)*R[i].x+(z-P[i].z)*R[i].z)||1;const off=Math.max(min,Math.min(d,min+12));const rh=Math.hypot(R[i].x,R[i].z);
  const px=P[i].x+R[i].x/rh*side*off,pz=P[i].z+R[i].z/rh*side*off;return {x:px,z:pz,ry:Math.atan2(P[i].x-px,P[i].z-pz)};}
function facingRoad(x,z){const [,i]=nearest(x,z);return Math.atan2(P[i].x-x,P[i].z-z);}