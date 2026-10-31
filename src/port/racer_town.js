const LMDBG=[];
function asphaltTex(edge='#ece9df',centre='#ece9df'){return canvasTex(256,512,(g,w,h)=>{g.fillStyle='#4a4b4f';g.fillRect(0,0,w,h);
  speckle(g,w,h,['#3c3d41','#56575c','#606166','#45464a','#6d6e72'],9000,2);
  g.fillStyle=edge;g.fillRect(10,0,7,h);g.fillRect(w-17,0,7,h);
  g.fillStyle=centre;for(let y=0;y<h;y+=128)g.fillRect(w/2-3,y,6,64);
  g.fillStyle='rgba(30,30,32,.35)';for(let i=0;i<8;i++)g.fillRect(rnd()*w,rnd()*h,40+rnd()*60,3);});}
const TX={
  grass:canvasTex(256,256,(g,w,h)=>{g.fillStyle='#5d9a3c';g.fillRect(0,0,w,h);speckle(g,w,h,['#4f8a33','#6aa846','#78b452','#558f37','#8fc260'],7000,3);speckle(g,w,h,['#f6e35a','#ffffff','#f2d14b'],120,2);}),
  field:canvasTex(512,512,(g,w,h)=>{g.fillStyle='#6ea446';g.fillRect(0,0,w,h);for(let i=0;i<14;i++){g.fillStyle=i%2?'rgba(255,255,200,.06)':'rgba(30,60,20,.08)';g.fillRect(0,i*w/14,w,w/14);}speckle(g,w,h,['#5f963b','#7cb352','#649f40','#86bd5b'],14000,3);},{repeat:[90,90]}),
  stone:canvasTex(256,128,(g,w,h)=>{g.fillStyle='#7c776b';g.fillRect(0,0,w,h);let y=0;while(y<h){const rh=12+rnd()*12;let x=-rnd()*30;while(x<w){const rw=20+rnd()*34;const c=100+rnd()*70|0;
    g.fillStyle=`rgb(${c},${c-6|0},${c-18|0})`;g.beginPath();g.roundRect(x+1,y+1,rw-2,rh-2,5);g.fill();x+=rw;}y+=rh;}speckle(g,w,h,['rgba(90,120,60,.5)','rgba(120,150,70,.35)'],600,4);}),
  hedge:canvasTex(256,128,(g,w,h)=>{g.fillStyle='#2f5e24';g.fillRect(0,0,w,h);speckle(g,w,h,['#3d7a2d','#4a8a34','#27501d','#5a9a3e','#346b28'],5000,5);speckle(g,w,h,['#f2f2f2','#f7d6e6'],60,2);}),
  pavement:canvasTex(128,128,(g,w,h)=>{g.fillStyle='#9a9a96';g.fillRect(0,0,w,h);g.strokeStyle='#7f7f7b';g.lineWidth=2;for(let x=0;x<w;x+=32)for(let y=0;y<h;y+=32)g.strokeRect(x,y,32,32);speckle(g,w,h,['#a8a8a4','#8c8c88'],1200,2);
    g.fillStyle='#d8d8d2';g.fillRect(0,0,10,h);}),
  wall:canvasTex(128,128,(g,w,h)=>{g.fillStyle='#efe9dc';g.fillRect(0,0,w,h);speckle(g,w,h,['#e4ddcf','#f6f1e6'],900,4);}),
  slate:canvasTex(128,128,(g,w,h)=>{g.fillStyle='#4a5058';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=10){g.fillStyle=y%20?'#555c65':'#3f454c';g.fillRect(0,y,w,9);}}),
  chevron:canvasTex(128,256,(g,w,h)=>{g.strokeStyle='#5ff7ff';g.lineWidth=16;g.lineJoin='round';for(let k=0;k<3;k++){const y=200-k*70;g.beginPath();g.moveTo(14,y);g.lineTo(w/2,y-50);g.lineTo(w-14,y);g.stroke();}}),
  wpad:canvasTex(128,128,(g,w,h)=>{g.fillStyle='rgba(255,120,20,.9)';g.fillRect(6,6,w-12,h-12);g.strokeStyle='#fff3c0';g.lineWidth=6;g.strokeRect(12,12,w-24,h-24);
    g.fillStyle='#fff';g.font='400 84px "Russo One", Impact, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('?',w/2,h/2+4);}),
  grille:canvasTex(128,64,(g,w,h)=>{g.fillStyle='#0d0e12';g.fillRect(0,0,w,h);g.fillStyle='#2a2c34';for(let y=4;y<h;y+=8)for(let x=((y/8)%2)*5;x<w;x+=10)g.fillRect(x,y,5,4);}),
};
const bayTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#3e3f43';g.fillRect(0,0,w,h);speckle(g,w,h,['#36373b','#4a4b4f'],3000,2);g.fillStyle='#e8e8e0';for(let x=0;x<w;x+=32)g.fillRect(x,0,3,96);for(let x=0;x<w;x+=32)g.fillRect(x,160,3,96);g.fillRect(0,96,w,3);g.fillRect(0,157,w,3);},{repeat:[3,3]});
const glowTex=canvasTex(64,64,(g,w,h)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
const vcMats=new Map();
function vcMat(map,side,flat,basic){const k=(map?map.uuid:'-')+'|'+side+'|'+flat+'|'+basic;if(!vcMats.has(k))vcMats.set(k,basic?new THREE.MeshBasicMaterial({map,vertexColors:true,side}):lam({map,vertexColors:true,side,flatShading:flat}));return vcMats.get(k);}
function bakeInto(root,target,renderOrder=0){root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();const buckets=new Map();
  root.traverse(o=>{if(!o.isMesh)return;const m4=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld);const multi=Array.isArray(o.material);
    const mats=multi?o.material:[o.material];const groups=multi?o.geometry.groups:[{start:0,count:0,materialIndex:0}];
    for(const gr of groups){const mat=mats[gr.materialIndex];let geo=o.geometry;
      if(multi){const src=o.geometry;geo=new THREE.BufferGeometry();for(const nm of ['position','normal','uv'])if(src.attributes[nm])geo.setAttribute(nm,src.attributes[nm]);geo.setIndex(Array.from(src.index.array.slice(gr.start,gr.start+gr.count)));}
      geo=geo.index?geo.toNonIndexed():geo.clone();if(!geo.attributes.normal)geo.computeVertexNormals();geo.applyMatrix4(m4);
      let useMat,vc=true;if(mat.transparent||mat.isShaderMaterial){useMat=mat;vc=false;}else useMat=vcMat(mat.map||null,mat.side,!!mat.flatShading,!!mat.isMeshBasicMaterial);
      const key=useMat.uuid;if(!buckets.has(key))buckets.set(key,{mat:useMat,list:[],vc});buckets.get(key).list.push({geo,color:mat.color});}});
  for(const {mat,list,vc} of buckets.values()){let n=0;for(const q of list)n+=q.geo.attributes.position.count;
    const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2),col=vc?new Float32Array(n*3):null;let o=0;
    for(const q of list){const g=q.geo,c=g.attributes.position.count;pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,o*2);
      if(col)for(let k=0;k<c;k++){col[(o+k)*3]=q.color.r;col[(o+k)*3+1]=q.color.g;col[(o+k)*3+2]=q.color.b;}o+=c;g.dispose();}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));if(col)g.setAttribute('color',new THREE.BufferAttribute(col,3));
    const mesh=new THREE.Mesh(g,mat);if(mat.transparent)mesh.renderOrder=renderOrder;target.add(mesh);}}
const NSHORE=[[-3700,-4250],[-3640,-4130],[-3075,-3350],[-2525,-2400],[-2075,-1700],[-1735,-1090],[-1320,-750],[-1090,-560],[-800,-360],[-649,-140],[-296,175],[-215,82],[-188,102],[-182,101],[-125,31],[-129,26],[-115,7],[-100,3],[-60,39],[-62,54],[-141,158],[-143,164],[-135,175],[-179,223],[-173,229],[-127,179],[-90,151],[-53,198],[-65,208],[-70,214],[-69,220],[-66,226],[-15,273],[-13,282],[-9,290],[1,300],[6,304],[16,305],[24,310],[63,344],[66,350],[66,358],[63,364],[34,399],[31,404],[31,408],[34,413],[-13,470],[7,486],[12,478],[7,474],[87,375],[109,368],[136,370],[164,384],[193,394],[220,398],[262,376],[305,340],[369,272],[386,289],[417,261],[400,243],[438,216],[469,195],[484,181],[535,145],[637,117],[670,109],[687,103],[737,76],[782,53],[827,28],[927,-1],[1002,-3],[1080,-27],[1125,-35],[1170,-49],[1195,-57],[1217,-62],[1240,-65],[1294,-64],[1315,-60],[1322,-57],[1341,-37],[1348,-36],[1356,-31],[1362,-21],[1372,-11],[1383,-8],[1400,4],[1411,14],[1421,30],[1422,39],[1416,55],[1425,61],[1425,79],[1429,89],[1439,94],[1452,94],[1470,88],[1489,92],[1520,87],[1557,64],[1593,34],[1638,12],[1668,-4],[1713,-25],[1774,-43],[1850,-47],[1899,-46],[1925,-34],[1933,-8],[1964,20],[2004,41],[2033,62],[2085,71],[2198,29],[2230,18],[2257,12],[2263,12],[2364,13],[2447,15],[2491,18],[2543,27],[2608,59],[2646,92],[2647,101],[2650,123],[2688,193],[2708,269],[2741,296],[2817,288],[2863,287],[2946,250],[3021,243],[3150,239],[3209,218],[3219,212],[3244,215],[3263,212],[3285,208],[3300,204],[3312,206],[3324,204],[3359,219],[3400,222],[3441,268],[3460,284],[3481,297],[3536,317],[3568,336],[3598,325],[3605,326],[3900,640],[4700,830],[6500,1000]];
const FSHORE=[[6500,3200],[4500,3000],[2500,2700],[800,2300],[-300,1600],[-600,700],[-700,150],[-950,-150],[-1230,-400],[-1450,-650],[-1870,-1020],[-2245,-1590],[-2690,-2290],[-3245,-3240],[-3810,-4020],[-3860,-4150]];
const WPOLY=[...NSHORE,...FSHORE];
function sdWater(x,z){let inside=false,best=1e18;const n=WPOLY.length;for(let i=0,j=n-1;i<n;j=i++){const xi=WPOLY[i][0],zi=WPOLY[i][1],xj=WPOLY[j][0],zj=WPOLY[j][1];
  if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))inside=!inside;
  const dx=xj-xi,dz=zj-zi,t=clamp(((x-xi)*dx+(z-zi)*dz)/(dx*dx+dz*dz),0,1),ex=xi+t*dx-x,ez=zi+t*dz-z,d2=ex*ex+ez*ez;if(d2<best)best=d2;}
  const d=Math.sqrt(best);return inside?-d:d;}
const SQUARE={x:-42.5,z:-12,w:58,d:62,a:.61};// a diamond on the map: corners at Newry St (W), Duke St (N), Church St (E) and Dock St (S)
const sqLocal=(x,z)=>{const dx=x-SQUARE.x,dz=z-SQUARE.z,c=Math.cos(SQUARE.a),s=Math.sin(SQUARE.a);return [dx*c+dz*s,-dx*s+dz*c];};
const sqWorld=(lx,lz)=>{const c=Math.cos(SQUARE.a),s=Math.sin(SQUARE.a);return [SQUARE.x+lx*c-lz*s,SQUARE.z+lx*s+lz*c];};
const PARK={x:190,z:180,w:90,d:66};
const inPark=(x,z,m=0)=>Math.abs(x-PARK.x)<PARK.w/2+m&&Math.abs(z-PARK.z)<PARK.d/2+m;
const inSquare=(x,z,m=0)=>{const [a,b]=sqLocal(x,z);return Math.abs(a)<SQUARE.w/2+m&&Math.abs(b)<SQUARE.d/2+m;};
// landmark positions from Google Places (metres east / south of The Square)

const RLM={square:[-40,-8],friarTucks:[43,-29],townHall:[94,5],stPeters:[87,176],bandstand:[204,173],phoneBox:[291,184],whistledown:[305,226],baths:[380,254],annies:[157.5,62],
  loughQuay:[-55,120],port:[-262,20],breakwater:[-40,205],keep:[-1669,-1161],castle:[-1910,-1510],texaco:[-1046,-636],circleK:[-332,-1316],kellys:[-722,-1988],
  burrenChurch:[-469,-3480],rostrevorInn:[3713,20],fearons:[3632,-105],kilbroney:[4237,605],gardenCentre:[1505,-548]};
function filletPts(cp,open){const out=[],n=cp.length;for(let i=0;i<n;i++){const c=cp[i];if((open&&(i===0||i===n-1))){out.push(c);continue;}
  const a=cp[(i-1+n)%n],b=cp[(i+1)%n];const li=Math.hypot(c[0]-a[0],c[1]-a[1]),lo=Math.hypot(b[0]-c[0],b[1]-c[1]);const din=[(c[0]-a[0])/li,(c[1]-a[1])/li],dout=[(b[0]-c[0])/lo,(b[1]-c[1])/lo];
  const turn=Math.abs(Math.atan2(din[0]*dout[1]-din[1]*dout[0],din[0]*dout[0]+din[1]*dout[1]));if(turn<.35){out.push(c);continue;}
  const r=Math.min(14,li*.4,lo*.4);const p0=[c[0]-din[0]*r,c[1]-din[1]*r],p1=[c[0]+dout[0]*r,c[1]+dout[1]*r];
  if(c[2])p0.push(c[2]);out.push(p0,[(p0[0]+p1[0])/4+c[0]/2,(p0[1]+p1[1])/4+c[1]/2],p1);}return out;}
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
function racerLandmarks(){const here=()=>true;
  if(here(RLM.square))squarePlaza();
  if(here(RLM.friarTucks))friarTucks(...RLM.friarTucks);
  if(here(RLM.townHall)){const g=shopFront(...RLM.townHall,{name:'TOWN HALL',w:20,h:11,d:12,wall:0xd9d2c3,bg:'#d9d2c3',fg:'#3a3a3a',font:'700 54px Barlow, sans-serif'});
    const ped=new THREE.Mesh(new THREE.CylinderGeometry(.01,7,3,3,1),lam({map:TX.stone,color:0xd9d2c3}));ped.rotation.set(Math.PI/2,0,Math.PI);ped.scale.set(1,1,.2);ped.position.set(0,12.2,6.1);g.add(ped);
    const tw=new THREE.Mesh(new THREE.BoxGeometry(3.4,5,3.4),lam({map:TX.stone,color:0xd9d2c3}));tw.position.set(0,14,0);g.add(tw);
    const clk=new THREE.Mesh(new THREE.CircleGeometry(1.1,20),lam({color:0xf6f6f0}));clk.position.set(0,14.6,1.75);g.add(clk);}
  if(here(RLM.stPeters)){const q=byRoad(...RLM.stPeters,44);church(q.x,q.z,q.ry,{big:true});LMPOS.push([q.x,q.z]);}
  if(here(RLM.bandstand)){municipalPark();}
  if(here(RLM.phoneBox)){const q=byRoad(...RLM.phoneBox,1);const [,i]=nearest(q.x,q.z);const b=new THREE.Group();const red=lam({color:0xc8102e});
    const box=new THREE.Mesh(new THREE.BoxGeometry(1,2.4,1),red);box.position.y=1.2;b.add(box);const top=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1,12,1,false,0,Math.PI),red);top.rotation.z=Math.PI/2;top.position.y=2.4;b.add(top);
    for(const a of [0,Math.PI/2,Math.PI,-Math.PI/2]){const w=new THREE.Mesh(new THREE.PlaneGeometry(.7,1.4),lam({color:0x2a3440}));w.position.set(Math.sin(a)*.51,1.25,Math.cos(a)*.51);w.rotation.y=a;b.add(w);}
    const rh=Math.hypot(R[i].x,R[i].z),side=Math.sign((q.x-P[i].x)*R[i].x+(q.z-P[i].z)*R[i].z)||1;b.position.set(P[i].x+R[i].x/rh*side*(W2+VERGE-1.2),P[i].y+.12,P[i].z+R[i].z/rh*side*(W2+VERGE-1.2));b.rotation.y=q.ry;SR.add(b);}
  if(here(RLM.whistledown))whistledown(...RLM.whistledown,.594);
  if(here(RLM.loughQuay))shopFront(...RLM.loughQuay,{name:'THE LOUGH & QUAY',w:14,h:11,wall:0xe9e2d2,bg:'#183247',fg:'#f0e6c8'});
  if(here(RLM.baths))warrenpointBaths(...RLM.baths);
  if(here(RLM.annies))shopFront(...RLM.annies,{name:'ANNIE CAFE',ry:-.655,w:11,h:8,d:9,wall:0xf6e7d6,bg:'#f6e7d6',fg:'#7a2e3a',font:'700 60px Barlow, sans-serif'});
  if(here(RLM.breakwater)){const [x,z]=RLM.breakwater;const bw=new THREE.Mesh(new THREE.BoxGeometry(7,5,150),lam({map:TX.stone,color:0xa9a59a}));bw.position.set(x+20,0,z+75);bw.rotation.y=-.3;SR.add(bw);
    leadingLight(x+8,2.5,z+30,13.7);leadingLight(x+38,2.5,z+125,8.8);
    const cols=[0xc8322a,0x2a6fb5,0xf3c623,0x2f8a3a,0xf4f4ef,0xe66a1f];for(let k=0;k<9;k++){const bx=-120+k*10,bz=185+k*3;if(sdWater(bx,bz)<-4)boat(bx,bz,Math.PI/2+(rnd()-.5)*.3,cols[k%cols.length],k%3===0);}}
  if(here(RLM.port)){const [x,z]=RLM.port;crane(x-30,2.4,z-20,Math.PI/2);crane(x-25,2.4,z+40,Math.PI/2);
    for(let k=0;k<12;k++){const c=new THREE.Mesh(new THREE.BoxGeometry(6,2.6,2.4),lam({color:[0xb8322a,0x2a5d9c,0x3b8a4a,0xd99a1f][k%4]}));const cx2=x+15+(k%4)*7,cz2=z-30+(k>>2)*9;if(!freeSpot(cx2,cz2,2))continue;c.position.set(cx2,groundH(cx2,cz2)+1.3+(k%3===0?2.6:0),cz2);SR.add(c);}LMPOS.push(RLM.port);}
}
const LAP_CP=[[-19.4,21.7,'THE SQUARE'],[-11.7,12.5],[-4.1,3.2],[3.4,-6.2],[10.9,-15.6],[19.3,-23.9],[30.1,-19.6,'CHURCH STREET'],[39.7,-12.4],[49.2,-5.1],[58.7,2.2],[68.2,9.5],[77.8,16.8],[87.3,24.1],[96.8,31.5],[106.3,38.8],[115.9,46.1],[125.4,53.4],[134.9,60.7],[144.5,68.0],[154.0,75.3],[163.5,82.7],[173.0,90.0],[182.6,97.3],[192.1,104.6,'QUEEN STREET'],[201.6,111.9],[211.1,119.2],[220.7,126.5],[230.2,133.8],[239.7,141.1],[249.3,148.4],[258.8,155.7],[268.3,163.0],[277.9,170.3],[287.4,177.7],[296.9,185.0],[306.3,192.5],[315.7,200.0],[325.1,207.5],[334.5,215.0],[341.0,224.6],[335.8,234.9,'SEAVIEW'],[326.8,243.0],[317.8,250.9],[308.9,259.0],[300.3,267.3],[291.6,275.7],[283.0,284.0],[274.4,292.4],[265.7,300.7],[257.1,309.0],[248.4,317.4],[239.8,325.7],[231.1,334.0],[221.9,341.7],[211.4,347.3],[199.7,349.7],[187.7,350.0],[175.7,350.0],[163.9,348.4],[152.1,346.2],[141.5,340.8,'OSBOURNE PROMENADE'],[132.7,332.7],[124.2,324.2],[115.7,315.7],[107.1,307.3],[98.6,298.8],[90.0,290.4],[81.5,282.0],[72.9,273.6],[64.3,265.2],[55.8,256.7],[47.3,248.3,'HAVELOCK PLACE'],[38.8,239.8],[30.3,231.3],[21.7,222.9],[12.9,214.7],[4.2,206.4],[-4.6,198.2],[-13.3,189.9],[-21.9,181.6],[-30.5,173.2],[-39.1,164.8],[-47.2,155.9,'MARINE PARADE'],[-54.8,146.7],[-62.4,137.4],[-70.0,128.1],[-77.6,118.8],[-83.2,108.7,'DOCK STREET'],[-77.1,98.5],[-69.9,88.9],[-62.7,79.3],[-55.5,69.7],[-48.3,60.1],[-41.1,50.5],[-34.0,40.7],[-27.0,31.0]];