import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
// ================================================================ the real map (from Simon's urban:EXPORT models and OpenStreetMap), game metres: x east, z south, y up
const CITY_B='__CITY_B__';
const CITY_T='__CITY_T__';
__CTERRS__
const OSM_TXT=`__OSM__`;
const CITY={ox:1645.7,oz:4.3};
const clamp=THREE.MathUtils.clamp,lerp=THREE.MathUtils.lerp;
let seed=91731;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const lam=o=>new THREE.MeshLambertMaterial(o);
function canvasTex(w,h,draw,{repeat=null,srgb=true}={}){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);const t=new THREE.CanvasTexture(c);if(srgb)t.colorSpace=THREE.SRGBColorSpace;if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat[0],repeat[1]);}t.anisotropy=4;return t;}
function speckle(g,w,h,cols,n,s){for(let i=0;i<n;i++){g.fillStyle=cols[(rnd()*cols.length)|0];g.fillRect(rnd()*w,rnd()*h,s*(.5+rnd()),s*(.5+rnd()));}}
const dec16=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new Int16Array(u.buffer);};

// ================================================================ ported from It's Like Wipeout VR: textures, coastline, the Square, landmarks and the town lap
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
function municipalPark(){const y=PARKY||groundH(PARK.x,PARK.z);const g=new THREE.Group(),green=lam({color:0x1f3d2c});
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
  g.position.set(PARK.x,y,PARK.z);SR.add(g);bandstand(...RLM.bandstand);LMPOS.push([PARK.x,PARK.z]);}
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
  // parked cars in tight rows, nose to tail across the bays
  const cols=[0xd8262e,0xf2f2f2,0x1a1a1e,0x2a5d9c,0x8c8f95,0x6b2f2f,0xe0d9c6,0x2f6b3a,0xb8bcc2,0x1f3a6a,0xc0c4c8,0x404448];const C={body:[],glass:[],roof:[],wh:[],hl:[],tl:[]};
  const rowsZ=[-25.6,-20.6,-8.6,-3.6,8.4,13.4,24.6];
  for(const rz of rowsZ)for(let k=0;k<21;k++){const px=-26+k*2.6;if(Math.abs(px-9)<7.5&&Math.abs(rz-1)<9)continue;if(rnd()<.14)continue;
    const flip=rowsZ.indexOf(rz)%2?1:-1;const [wx,wz]=sqWorld(px,rz);const ry=-SQUARE.a+(flip>0?0:Math.PI)+(rnd()-.5)*.05;const c=cols[(rnd()*cols.length)|0];
    const fx=Math.sin(ry),fz=Math.cos(ry),sx=Math.cos(ry),sz=-Math.sin(ry);// along the car / across it
    C.body.push({x:wx,y:y+.6,z:wz,ry,c});C.glass.push({x:wx-fx*.25,y:y+1.18,z:wz-fz*.25,ry});C.roof.push({x:wx-fx*.3,y:y+1.47,z:wz-fz*.3,ry,c});
    for(const a of [-1.35,1.35])for(const b of [-.78,.78])C.wh.push({x:wx+fx*a+sx*b,y:y+.33,z:wz+fz*a+sz*b,ry,rz:Math.PI/2});
    for(const b of [-.6,.6]){C.hl.push({x:wx+fx*2.16+sx*b,y:y+.72,z:wz+fz*2.16+sz*b,ry});C.tl.push({x:wx-fx*2.16+sx*b,y:y+.75,z:wz-fz*2.16+sz*b,ry});}}
  {const bg=new THREE.BoxGeometry(1.8,.72,4.3);bg.translate(0,0,0);inst(bg,lam({color:0xffffff}),C.body);
   inst(new THREE.BoxGeometry(1.62,.5,2.3),lam({color:0x1c2630}),C.glass);inst(new THREE.BoxGeometry(1.56,.08,2.0),lam({color:0xffffff}),C.roof);
   inst(new THREE.CylinderGeometry(.33,.33,.24,10),lam({color:0x141414}),C.wh);inst(new THREE.BoxGeometry(.38,.14,.06),new THREE.MeshBasicMaterial({color:0xf4f0dc}),C.hl);inst(new THREE.BoxGeometry(.38,.14,.06),new THREE.MeshBasicMaterial({color:0xb01818}),C.tl);}
  // painted bays
  {const L=[];for(const rz of rowsZ)for(let k=0;k<=21;k++)L.push([-27.3+k*2.6,rz]);
   const lt=new THREE.MeshBasicMaterial({color:0xe8e8e0,fog:true});const lines=[];for(const [lx,lz] of L){if(Math.abs(lx-9)<8&&Math.abs(lz-1)<9)continue;const [wx,wz]=sqWorld(lx,lz);lines.push({x:wx,y:y+.02,z:wz,ry:-SQUARE.a});}
   inst(new THREE.BoxGeometry(.1,.02,4.8),lt,lines);}
  {const hb=new THREE.Group();hb.position.set(9,0,1);g.add(hb);const rend=lam({map:TX.wall,color:0xd8dad6}),dk=lam({color:0x2a3036}),teal=lam({color:0x2a7a74});
   const body=new THREE.Mesh(new THREE.BoxGeometry(10,3.4,6),rend);body.position.y=1.7;hb.add(body);
   const arch=new THREE.Shape();arch.moveTo(-.6,0);arch.lineTo(-.6,1.4);arch.absarc(0,1.4,.6,Math.PI,0,true);arch.lineTo(.6,0);arch.closePath();const ag=new THREE.ShapeGeometry(arch);
   for(const [x,z,r,m] of [[-3,3.01,0,dk],[0,3.01,0,teal],[3,3.01,0,dk],[-3,-3.01,Math.PI,dk],[0,-3.01,Math.PI,dk],[3,-3.01,Math.PI,dk],[5.01,0,Math.PI/2,dk],[-5.01,0,-Math.PI/2,dk]]){const a=new THREE.Mesh(ag,m);a.position.set(x,.35,z);a.rotation.y=r;hb.add(a);}
   const P=[[-5.3,0,-3.3],[5.3,0,-3.3],[5.3,0,3.3],[-5.3,0,3.3],[-2.2,2.3,0],[2.2,2.3,0]];const Fs=[[3,2,5],[3,5,4],[1,0,4],[1,4,5],[2,1,5],[0,3,4]];const pos=[],uv=[];
   for(const fc of Fs)for(const k of fc){pos.push(...P[k]);uv.push(P[k][0]*.2,(P[k][1]+P[k][2])*.2);}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));rg.computeVertexNormals();
   const rf=new THREE.Mesh(rg,lam({map:TX.slate,color:0x6a6e74,side:THREE.DoubleSide}));rf.position.y=3.4;hb.add(rf);
   const cup=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.8,1.5),rend);cup.position.y=6.1;hb.add(cup);
   const ct=canvasTex(64,64,(c,w,h)=>{c.fillStyle='#f4f2ea';c.beginPath();c.arc(32,32,30,0,7);c.fill();c.strokeStyle='#222';c.lineWidth=3;c.stroke();c.lineWidth=3;c.beginPath();c.moveTo(32,32);c.lineTo(32,12);c.moveTo(32,32);c.lineTo(46,38);c.stroke();});
   for(const [x,z,r] of [[0,.76,0],[0,-.76,Math.PI],[.76,0,Math.PI/2],[-.76,0,-Math.PI/2]]){const cf=new THREE.Mesh(new THREE.CircleGeometry(.5,16),lam({map:ct}));cf.position.set(x,6.2,z);cf.rotation.y=r;hb.add(cf);}
   const cr=new THREE.Mesh(new THREE.ConeGeometry(1.15,1.2,4),lam({map:TX.slate,color:0x5a5e64}));cr.rotation.y=Math.PI/4;cr.position.y=7.6;hb.add(cr);
   const vane=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.2,5),dk);vane.position.y=8.6;hb.add(vane);const arr=new THREE.Mesh(new THREE.BoxGeometry(.9,.12,.04),dk);arr.position.y=8.9;hb.add(arr);}
  // the height-barrier gantry at the car-park entrance: black truss, hazard stripes, a 2.2 m warning sign
  {const gb=new THREE.Group();gb.position.set(SQUARE.w/2-1.2,0,17);gb.rotation.y=Math.PI/2;g.add(gb);const blk=lam({color:0x141618});
   for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.3,4.6,.3),blk);p.position.set(s*4.2,2.3,0);gb.add(p);}
   for(const yy of [2.35,3.6]){const b=new THREE.Mesh(new THREE.BoxGeometry(8.6,.16,.16),blk);b.position.y=yy;gb.add(b);}
   for(let k=0;k<6;k++){const d=new THREE.Mesh(new THREE.BoxGeometry(.1,1.55,.1),blk);d.position.set(-3.5+k*1.4,2.98,0);d.rotation.z=k%2?.62:-.62;gb.add(d);}
   const hz=new THREE.Mesh(new THREE.PlaneGeometry(8.4,.25),lam({map:canvasTex(256,8,(c,w,h)=>{for(let x=0;x<w;x+=16){c.fillStyle='#f2c418';c.fillRect(x,0,8,h);c.fillStyle='#141414';c.fillRect(x+8,0,8,h);}}),side:THREE.DoubleSide}));hz.position.y=2.12;gb.add(hz);
   const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.15),new THREE.MeshLambertMaterial({map:canvasTex(128,112,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#d8201a';c.beginPath();c.moveTo(w/2,4);c.lineTo(w-4,h-4);c.lineTo(4,h-4);c.closePath();c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(w/2,22);c.lineTo(w-20,h-14);c.lineTo(20,h-14);c.closePath();c.fill();
     c.fillStyle='#111';c.font='700 20px Arial,sans-serif';c.textAlign='center';c.fillText('2.2m',w/2,h-38);c.font='700 14px Arial,sans-serif';c.fillText("7'-0\"",w/2,h-22);}),transparent:true,alphaTest:.3,side:THREE.DoubleSide}));sg.position.set(-1.6,3.0,.12);gb.add(sg);}
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
  const bn=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.75),lam({map:canvasTex(256,54,(c,w,h)=>{c.fillStyle='#f6f6f2';c.fillRect(0,0,w,h);c.fillStyle='#c0287a';c.font='700 22px Barlow,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText("WHAT'S ON THIS WEEK",w/2,h/2+1,w-12);}),side:THREE.DoubleSide}));bn.position.set(-3,1.3,fz+.22);g.add(bn);
  g.position.set(q.x,y,q.z);g.rotation.y=q.ry;SR.add(g);LMPOS.push([q.x,q.z]);LMDBG.push(['TOWN HALL',q.x,q.z,q.ry,D]);return g;}

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
    {const ex=W/2+.15,ez=D/2+.3,rh=2.4;const P=[[-ex,0,-ez],[ex,0,-ez],[ex,0,ez],[-ex,0,ez],[-ex,rh,0],[ex,rh,0]];const Fs=[[3,2,5],[3,5,4],[1,0,4],[1,4,5],[2,1,5],[0,3,4]];const pos=[],uv=[];
      for(const fc of Fs)for(const k of fc){pos.push(...P[k]);uv.push(P[k][0]*.15,(P[k][1]+P[k][2])*.15);}const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));rg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));rg.computeVertexNormals();
      const rf=new THREE.Mesh(rg,lam({map:TX.slate,color:0x7a7c82,side:THREE.DoubleSide}));rf.position.y=Hh;g.add(rf);}
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

// ---------------------------------------------------------------- the roundabout where Duke Street meets Church Street at the top of the Square
function dukeRoundabout(){const cx=-15,cz=-58,R=10.5;const roadY=(x,z)=>{let y=H(x,z);const [dd,ii]=nearest(x,z);if(dd<W2+VERGE)y=Math.max(y,P[ii].y);return y+.13;};const y=roadY(cx,cz);const g=new THREE.Group();g.position.set(cx,y,cz);
  // painted straight onto the road, nothing raised: a small filled white circle, big curved arrows going round, give-way lines at the entries
  const paint=(w,h,draw)=>new THREE.MeshLambertMaterial({map:canvasTex(w,h,draw),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  const worn=(c,w,h)=>{c.globalCompositeOperation='destination-out';for(let k=0;k<260;k++){c.fillStyle=`rgba(0,0,0,${.25+Math.random()*.5})`;c.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*3,1+Math.random()*3);}c.globalCompositeOperation='source-over';};
  const dot=new THREE.Mesh(new THREE.CircleGeometry(1.35,28),paint(64,64,(c,w,h)=>{c.fillStyle='#f0f0ea';c.fillRect(0,0,w,h);c.strokeStyle='rgba(120,120,120,.35)';c.lineWidth=3;c.beginPath();c.arc(32,32,18,0,7);c.stroke();worn(c,w,h);}));
  dot.rotation.x=-Math.PI/2;dot.position.y=.002;g.add(dot);
  const arrM=paint(256,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#f0f0ea';c.beginPath();c.moveTo(0,52);c.lineTo(170,52);c.lineTo(170,30);c.lineTo(256,64);c.lineTo(170,98);c.lineTo(170,76);c.lineTo(0,76);c.closePath();c.fill();worn(c,w,h);});
  // three curved arrows round the circle, going clockwise (as UK traffic does)
  for(let k=0;k<3;k++){const a=k/3*Math.PI*2+.5;const r=5.2;for(let sgi=0;sgi<4;sgi++){const aa=a+sgi*.28;const x=Math.cos(aa)*r,z=Math.sin(aa)*r;const piece=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.8),sgi===3?arrM:paint(32,16,(c,w,h)=>{c.fillStyle='#f0f0ea';c.fillRect(0,4,w,8);worn(c,w,h);}));
      piece.rotation.order='YXZ';piece.rotation.y=-aa-Math.PI/2+Math.PI;piece.rotation.x=-Math.PI/2;piece.position.set(x,roadY(cx+x,cz+z)-y+.003,z);g.add(piece);}}
  // give-way double dashes across the three entries
  const entries=[[-5,-48],[32,-117],[-31,-60]];const gwm=paint(64,16,(c,w,h)=>{c.fillStyle='#f0f0ea';for(let x=0;x<w;x+=16){c.fillRect(x,1,10,5);c.fillRect(x,10,10,5);}worn(c,w,h);});
  for(const [ex,ez] of entries){const dx=ex-cx,dz=ez-cz,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l;const px=ux*8.2,pz=uz*8.2;const gl=new THREE.Mesh(new THREE.PlaneGeometry(6.5,.7),gwm);gl.rotation.order='YXZ';gl.rotation.y=Math.atan2(ux,uz);gl.rotation.x=-Math.PI/2;gl.position.set(px,roadY(cx+px,cz+pz)-y+.003,pz);g.add(gl);}
  const pole=lam({color:0x8a9098});const rbSign=canvasTex(64,64,(c,w,h)=>{c.fillStyle='#1d5fd0';c.beginPath();c.arc(32,32,30,0,7);c.fill();c.strokeStyle='#fff';c.lineWidth=5;for(let k=0;k<3;k++){const a=k/3*Math.PI*2;c.beginPath();c.arc(32,32,15,a+.3,a+1.6);c.stroke();
    const ex=32+Math.cos(a+1.6)*15,ey=32+Math.sin(a+1.6)*15;c.fillStyle='#fff';c.beginPath();c.arc(ex,ey,4,0,7);c.fill();}});
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
  const tx=cx+ux*(R+2)-uz*4,tz=cz+uz*(R+2)+ux*4;SOLIDS.push({box:1,x:tx,y,z:tz,ry:Math.atan2(ux,uz),w:1.8,d:2.6,h:4});
  LMPOS.push([cx,cz]);LMDBG.push(['DUKE ST ROUNDABOUT',cx,cz,0,R]);}

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

// ---------------------------------------------------------------- facade overlays on the model's own buildings (they keep their real outline, height and collision)
function findBuild(cx,cz){let best=null,bd=4;for(const b of BUILD){const d=Math.hypot(b.cx-cx,b.cz-cz);if(d<bd){bd=d;best=b;}}return best;}
function facadeOverlay(b,faces,draw,glow=0){b.faced=true;const pts=b.pts,n=pts.length;const cx=b.cx,cz=b.cz;const y0=Math.min(...pts.map(p=>groundH(p[0],p[1])));const Hh=b.h||9;
  for(let k=0;k<n;k++){const [x0,z0]=pts[k],[x1,z1]=pts[(k+1)%n];const L=Math.hypot(x1-x0,z1-z0);if(L<2.5)continue;const mx=(x0+x1)/2,mz=(z0+z1)/2;let nx=z1-z0,nz=-(x1-x0);const nl=Math.hypot(nx,nz);nx/=nl;nz/=nl;
    if((mx-cx)*nx+(mz-cz)*nz<0){nx=-nx;nz=-nz;}const face=faces(mx,mz,nx,nz,L);if(!face)continue;
    const tw=Math.min(2048,Math.max(256,Math.round(L*48))),th=Math.round(tw*Hh/L);const tex=canvasTex(tw,th,(c,w,h)=>draw(c,w,h,L,Hh,face));
    const m=new THREE.Mesh(new THREE.PlaneGeometry(L,Hh),lam(glow?{map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:glow}:{map:tex}));m.position.set(mx+nx*.07,y0+Hh/2,mz+nz*.07);m.rotation.y=Math.atan2(nx,nz);SR.add(m);LMPOS.push([mx,mz]);}}
const nearLine=(x,z,A,B)=>{const dx=B[0]-A[0],dz=B[1]-A[1],L=Math.hypot(dx,dz);const t=clamp(((x-A[0])*dx+(z-A[1])*dz)/(L*L),0,1);return Math.hypot(x-(A[0]+dx*t),z-(A[1]+dz*t));};
function cornerShops(){const SQR=[[20,-27],[-27,31]],CHS=[[20,-27],[190,103]];
  // the W.B.R. Credit Union: grey-beige lined render, a dark plinth, round-headed windows, green-tinted ground floor windows, raised lettering on the Square side
  const cu=findBuild(22,0);if(cu){facadeOverlay(cu,(mx,mz,nx,nz,L)=>{const ds=nearLine(mx,mz,...SQR),dc=nearLine(mx,mz,...CHS);if(ds<13&&ds<=dc)return 'square';if(dc<13)return 'church';return null;},(c,w,h,L,Hh,face)=>{
      const px=w/L;c.fillStyle='#bcb3a5';c.fillRect(0,0,w,h);c.fillStyle='rgba(90,84,76,.25)';for(let yy=h*.55;yy<h*.86;yy+=px*.42)c.fillRect(0,yy,w,2);
      c.fillStyle='#2b2e34';c.fillRect(0,h*.88,w,h*.12);c.fillStyle='#d8d2c6';c.fillRect(0,h*.33,w,px*.2);c.fillRect(0,h*.62,w,px*.18);
      const n=Math.max(2,Math.round(L/2.4));for(let k=0;k<n;k++){const cx=(k+.5)*w/n,ww=px*1.0,wh=px*1.5;// upper: round-headed sash windows
        for(const yy of [h*.06,h*.36]){c.fillStyle='#ececea';c.fillRect(cx-ww/2-4,yy-4,ww+8,wh+8);c.fillStyle='#45525e';c.beginPath();c.moveTo(cx-ww/2,yy+wh);c.lineTo(cx-ww/2,yy+ww/2);c.arc(cx,yy+ww/2,ww/2,Math.PI,0);c.lineTo(cx+ww/2,yy+wh);c.closePath();c.fill();
          c.fillStyle='rgba(235,235,230,.8)';c.fillRect(cx-ww/2+3,yy+ww*.4,ww-6,wh*.35);c.fillStyle='#ececea';c.fillRect(cx-1.5,yy+ww/2,3,wh-ww/2);}
        // ground: green-tinted windows with the emblem, the black door in the middle of the Square front
        const gy=h*.69,gw=px*1.2,gh=px*1.55;if(face==='square'&&k===Math.floor(n/2)){c.fillStyle='#16181c';c.fillRect(cx-px*.5,gy-px*.2,px,px*1.85);c.fillStyle='#d8b860';c.fillRect(cx+px*.3,gy+px*.8,3,6);continue;}
        c.fillStyle='#1c2228';c.fillRect(cx-gw/2-3,gy-3,gw+6,gh+6);c.fillStyle='#9ad0c8';c.fillRect(cx-gw/2,gy,gw,gh);c.fillStyle='#2aa098';c.beginPath();c.arc(cx,gy+gh*.45,gw*.22,0,7);c.fill();c.fillStyle='#e8f4f0';c.font=`700 ${Math.round(px*.16)}px Arial`;c.textAlign='center';c.fillText('W.B.R.',cx,gy+gh*.8);}
      if(face==='square'||L>8){c.fillStyle='#2a2a2c';c.font=`700 ${Math.round(px*.42)}px Georgia,serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('W.B.R.  CREDIT  UNION',w/2,h*.645);
        for(const s of [-1,1]){c.fillStyle='#2a2a2c';c.beginPath();c.arc(w/2+s*px*3.6,h*.645,px*.18,0,7);c.fill();}}});}
  // Pizza Point, next to it on Church Street: a white front, the red-and-white fascia, a wooden shopfront and a hanging sign
  const pp=findBuild(29.8,7);if(pp){let bm=null,bd=1e9;{const q=pp.pts;for(let k=0;k<q.length;k++){const [x0,z0]=q[k],[x1,z1]=q[(k+1)%q.length];if(Math.hypot(x1-x0,z1-z0)<2.5)continue;const d=nearLine((x0+x1)/2,(z0+z1)/2,...CHS);if(d<bd){bd=d;bm=[(x0+x1)/2,(z0+z1)/2];}}}facadeOverlay(pp,(mx,mz)=>bm&&Math.hypot(mx-bm[0],mz-bm[1])<.1?'church':null,(c,w,h,L,Hh)=>{const px=w/L;c.fillStyle='#f4f4f0';c.fillRect(0,0,w,h);
      const n=Math.max(1,Math.round(L/3));for(let k=0;k<n;k++){const cx=(k+.5)*w/n;for(const yy of [h*.08,h*.38]){c.fillStyle='#e0e0dc';c.fillRect(cx-px*.75,yy-4,px*1.5,px*1.7);c.fillStyle='#3e4a56';c.fillRect(cx-px*.6,yy,px*1.2,px*1.5);c.fillStyle='#f4f4f0';c.fillRect(cx-2,yy,4,px*1.5);c.fillRect(cx-px*.6,yy+px*.7,px*1.2,4);}}
      const fy=h*.64;c.fillStyle='#ffffff';c.fillRect(px*.2,fy,w-px*.4,px*.75);c.fillStyle='#d8201a';c.fillRect(px*.2,fy,w-px*.4,px*.1);c.fillRect(px*.2,fy+px*.65,w-px*.4,px*.1);
      c.fillStyle='#d8201a';c.font=`700 ${Math.round(px*.5)}px Arial,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('pizza point',w/2,fy+px*.4);
      c.fillStyle='#7a4a24';c.fillRect(px*.3,fy+px*.8,w-px*.6,h-fy-px*.8);c.fillStyle='#c8dce6';c.fillRect(px*.5,fy+px*.95,w*.55-px*.5,(h-fy)*.62);c.fillStyle='#e8d8b0';c.fillRect(px*.7,fy+px*1.5,w*.4,px*.4);
      c.fillStyle='#5a3418';c.fillRect(w*.62,fy+px*.95,w*.3,h-fy-px*1.1);c.fillStyle='#c8dce6';c.fillRect(w*.65,fy+px*1.1,w*.24,(h-fy)*.4);});}}

// ---------------------------------------------------------------- Duke Street: a front painted on the street-facing edge of each of the model's own buildings
function frontEdge(b,A,B){const q=b.pts,n=q.length;let best=null,bd=1e9;const dx=B[0]-A[0],dz=B[1]-A[1],LL=Math.hypot(dx,dz);
  for(let k=0;k<n;k++){const [x0,z0]=q[k],[x1,z1]=q[(k+1)%n];const L=Math.hypot(x1-x0,z1-z0);if(L<2.5)continue;const mx=(x0+x1)/2,mz=(z0+z1)/2;let nx=z1-z0,nz=-(x1-x0);const nl=Math.hypot(nx,nz);nx/=nl;nz/=nl;if((mx-b.cx)*nx+(mz-b.cz)*nz<0){nx=-nx;nz=-nz;}
    const t=clamp(((mx-A[0])*dx+(mz-A[1])*dz)/(LL*LL),0,1);const px=A[0]+dx*t-mx,pz=A[1]+dz*t-mz;const d=Math.hypot(px,pz);if(d<1e-3||(px*nx+pz*nz)/d<.6)continue;if(d<bd){bd=d;best=[mx,mz];}}return best;}
function paintFront(c,w,h,L,Hh,units){const px=w/L;const Y=m=>(Hh-m)*px;const tot=units.reduce((a,u)=>a+(u.wt||1),0);let x0=0;
  for(const u of units){const uw=w*(u.wt||1)/tot,cx=x0+uw/2;c.fillStyle=u.wall||'#d9d2c4';c.fillRect(x0,0,uw,h);
    if(u.render){c.fillStyle='rgba(0,0,0,.05)';for(let yy=0;yy<h;yy+=6)c.fillRect(x0,yy,uw,1);}
    c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x0,0,3,h);c.fillStyle=u.trim||'#f1efe8';c.fillRect(x0,Y(Hh-.05),uw,px*.25);// eaves
    // upper floors: sash windows
    const nw=Math.max(1,Math.round(uw/px/2.6));for(let f=1;f*3+1.6<=Hh;f++){const wy=Y(f*3+2.1);for(let k=0;k<nw;k++){const wx=x0+(k+.5)*uw/nw;c.fillStyle=u.trim||'#f1efe8';c.fillRect(wx-px*.62,wy-px*.12,px*1.24,px*1.84);c.fillStyle='#38434e';c.fillRect(wx-px*.5,wy,px,px*1.6);
        c.fillStyle=u.trim||'#f1efe8';c.fillRect(wx-px*.5,wy+px*.74,px,px*.08);c.fillRect(wx-px*.03,wy,px*.06,px*1.6);if((k+f)%3===0){c.fillStyle='rgba(255,214,150,.55)';c.fillRect(wx-px*.46,wy+px*.82,px*.92,px*.74);}}}
    if(u.kind==='house'){// a plain terraced front: a door with its number and a window
      c.fillStyle=u.door||'#203a5a';c.fillRect(cx-px*1.6,Y(2.3),px*.95,px*2.3);c.fillStyle='#d8b860';c.font=`700 ${Math.round(px*.3)}px Georgia,serif`;c.textAlign='center';c.fillText(u.num||'',cx-px*1.12,Y(2.55));
      c.fillStyle=u.trim||'#f1efe8';c.fillRect(cx-px*.2,Y(2.3),px*1.7,px*1.5);c.fillStyle='#38434e';c.fillRect(cx-px*.1,Y(2.2),px*1.5,px*1.3);x0+=uw;continue;}
    // shop: fascia, pilasters, glazing, door
    c.fillStyle=u.fas;c.fillRect(x0+px*.15,Y(3.95),uw-px*.3,px*.8);c.fillStyle='rgba(255,255,255,.18)';c.fillRect(x0+px*.15,Y(3.95),uw-px*.3,px*.05);
    let fs=Math.round(px*.46);c.font=`${u.font||'700'} ${fs}px ${u.face||'Georgia,serif'}`;while(c.measureText(u.name).width>uw-px*.7&&fs>8){fs--;c.font=`${u.font||'700'} ${fs}px ${u.face||'Georgia,serif'}`;}
    c.fillStyle=u.txt||'#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(u.name,cx,Y(3.55)-(u.sub?px*.08:0));
    if(u.sub){c.font=`600 ${Math.round(px*.15)}px Arial,sans-serif`;c.fillText(u.sub.toUpperCase(),cx,Y(3.55)+px*.27);}
    c.fillStyle=u.pil||'#2a2a2a';c.fillRect(x0+px*.15,Y(3.15),uw-px*.3,px*3.15);
    const gx0=x0+px*.4,gx1=x0+uw-px*.4,dw=px*1.05,dx=u.doorL?gx0:gx1-dw;
    c.fillStyle=u.glass||'#9cb6c2';c.fillRect(u.doorL?gx0+dw+px*.15:gx0,Y(2.95),gx1-gx0-dw-px*.15,px*2.35);
    c.fillStyle='rgba(255,226,170,.55)';c.fillRect(u.doorL?gx0+dw+px*.2:gx0+px*.05,Y(2.9),gx1-gx0-dw-px*.25,px*2.25);
    if(u.inside)u.inside(c,u.doorL?gx0+dw+px*.15:gx0,Y(2.95),gx1-gx0-dw-px*.15,px*2.35,px);
    {const gw=gx1-gx0-dw,nb=Math.max(2,Math.round(gw/px/1.6));c.fillStyle=u.pil||'#2a2a2a';for(let k=1;k<nb;k++){const mx=(u.doorL?gx0+dw:gx0)+gw*k/nb;c.fillRect(mx-px*.06,Y(2.95),px*.12,px*2.35);}c.fillRect(u.doorL?gx0+dw:gx0,Y(2.15),gw,px*.07);}
    c.fillStyle=u.pil||'#2a2a2a';c.fillRect(dx-3,Y(2.95),dw+6,px*2.95);c.fillStyle='#b9cdd6';c.fillRect(dx+px*.1,Y(2.85),dw-px*.2,px*1.7);c.fillStyle='rgba(255,226,170,.5)';c.fillRect(dx+px*.12,Y(2.8),dw-px*.24,px*1.6);
    c.fillStyle='#4a4a4a';c.fillRect(x0+px*.15,Y(.6),uw-px*.3,px*.6);x0+=uw;}}
const tables=(c,x,y,w,h,px)=>{for(let k=0;k<3;k++){const tx=x+w*(k+.5)/3;c.fillStyle='#6b4428';c.fillRect(tx-px*.35,y+h*.62,px*.7,px*.08);c.fillRect(tx-2,y+h*.62,4,h*.38);}};
const rails=(c,x,y,w,h,px,col)=>{c.fillStyle='#555';c.fillRect(x,y+h*.25,w,3);for(let k=0;k<8;k++){c.fillStyle=col[k%col.length];c.fillRect(x+w*(k+.5)/8-px*.15,y+h*.25,px*.3,h*.5);}};
function dukeShops(){const A=[-15,-58],D0=[43,-132];const dx=D0[0]-A[0],dz=D0[1]-A[1],LL=Math.hypot(dx,dz);const B=[A[0]+dx/LL*150,A[1]+dz/LL*150];
  const SH=[
   // south-east side, from the Square
   [17.9,14.3,[{name:'Fulla Beans',sub:'Sit in or takeaway',fas:'#2f4a2a',txt:'#f3e6c6',pil:'#2f4a2a',inside:tables}]],
   [17.7,21.4,[{name:'Pin Point Alterations',fas:'#e8e2d6',txt:'#3a3a48',pil:'#5a5a66',face:'Arial,sans-serif'}]],
   [30.3,26.3,[{name:"Raymie's",sub:'Seafood bar & grill',fas:'#b3261e',txt:'#fff',pil:'#3a1512',wall:'#efe7da',inside:tables,doorL:true}]],
   [38.6,17.3,[{name:'Newpoint Cleaners',fas:'#1f5fa8',txt:'#fff',pil:'#1a2f4a',face:'Arial,sans-serif',inside:(c,x,y,w,h,px)=>rails(c,x,y,w,h,px,['#d8d8e0','#3a4a6a','#e8e0d0'])}]],
   [42.1,15.2,[{name:'Sweet Pea',sub:'Coffee shop',fas:'#9fd3b5',txt:'#2e4a3a',pil:'#5f8f74',wall:'#f2ece2',inside:tables}]],
   [48.1,18.2,[{kind:'house',num:'10',wall:'#cfc6b6',wt:.8},{name:'Accessorised by Elite',sub:'Fashion accessories',fas:'#151515',txt:'#d8b860',pil:'#151515',wt:1.2,inside:(c,x,y,w,h,px)=>rails(c,x,y,w,h,px,['#d8b860','#c03a6a','#f0f0f0'])}]],
   [60.2,18.2,[{kind:'house',num:'10C',wall:'#e6dfd0',door:'#5a1f24'},{kind:'house',num:'12',wall:'#c9d3cf',door:'#1f3a2a'},{kind:'house',num:'14',wall:'#e8d9c0',door:'#203a5a'}]],
   [65.0,17.4,[{kind:'house',num:'',wall:'#bcb6ac',door:'#3a3a3a'}]],
   [69.8,21.5,[{name:"Lady T's Boutique",sub:"Women's clothing",fas:'#6b2d6b',txt:'#fbe8f6',pil:'#3e1a3e',font:'italic 700',inside:(c,x,y,w,h,px)=>rails(c,x,y,w,h,px,['#e05a8a','#f2d0dc','#4a2a5a','#ffffff'])}]],
   [75.1,15.2,[{name:"Linda's Super Shop",sub:'Convenience store',fas:'#f2c230',txt:'#c0201a',pil:'#9a1a14',face:'Arial,sans-serif',inside:(c,x,y,w,h,px)=>{for(let r=0;r<3;r++){c.fillStyle='#8a8a8a';c.fillRect(x,y+h*(.3+r*.22),w,3);for(let k=0;k<10;k++){c.fillStyle=['#d23','#2a6','#fc3','#36c'][(k+r)%4];c.fillRect(x+w*(k+.2)/10,y+h*(.3+r*.22)-px*.3,w/14,px*.3);}}}}]],
   [80.9,15.3,[{name:"Guys N' Dolls",sub:'Hair & beauty',fas:'#111',txt:'#ff6fae',pil:'#111',face:'Arial,sans-serif',font:'italic 700'}]],
   [88.3,21.1,[{kind:'house',num:'',wall:'#d6cdbd'},{kind:'house',num:'',wall:'#c5ccd3',door:'#4a1f1f'}]],
   // north-west side, from the Square
   [13.6,-22.6,[{name:'The Duke',sub:'No7 Duke Street',fas:'#1b2a3a',txt:'#e0c070',pil:'#1b2a3a',wall:'#2e3e52',trim:'#d8d0bc',doorL:true}]],
   [30.2,-24.8,[{name:'Duke Offsales',sub:'Wines · beers · spirits',fas:'#7a1c22',txt:'#fff',pil:'#3a0e12',face:'Arial,sans-serif',inside:(c,x,y,w,h,px)=>{for(let r=0;r<3;r++)for(let k=0;k<14;k++){c.fillStyle=['#2a5a2a','#6a2a1a','#c8a040'][(k+r)%3];c.fillRect(x+w*(k+.3)/14,y+h*(.25+r*.24),w/30,px*.45);}}}]],
   [37.8,-20.2,[{kind:'house',num:'17',wall:'#e2d8c4',door:'#1f3a2a'}]],
   [48.9,-20.3,[{kind:'house',num:'15',wall:'#cdd2d6',door:'#5a1f24'}]],
   [68.3,-23.0,[{name:'Bespoke',fas:'#2e2e30',txt:'#f2f2f2',pil:'#2e2e30',wall:'#ece8e0',font:'italic 400',inside:(c,x,y,w,h,px)=>rails(c,x,y,w,h,px,['#2a2a2a','#7a8a9a','#e8e0d0'])}]],
   [95.1,-22.3,[{name:'Beyond The Door',sub:'Wedding decor',fas:'#e9d6d0',txt:'#7a4a52',pil:'#b89a94',wall:'#f4f1ec',font:'italic 700'}]],
   [114.5,-22.4,[{name:"Molly's",fas:'#144d34',txt:'#e8c870',pil:'#0e3524',wall:'#d8cfbf',doorL:true}]]];
  const ux=dx/LL,uz=dz/LL;let made=0;
  for(const [t,s,units] of SH){const cx=A[0]+ux*t-uz*s,cz=A[1]+uz*t+ux*s;const b=findBuild(cx,cz);if(!b){console.warn('duke: no building at',t,s,cx.toFixed(1),cz.toFixed(1),JSON.stringify(BUILD.filter(q=>Math.hypot(q.cx-cx,q.cz-cz)<12).map(q=>[+q.cx.toFixed(1),+q.cz.toFixed(1)])));continue;}const fe=frontEdge(b,A,B);if(!fe){console.warn('duke: no front',t,s);continue;}
    facadeOverlay(b,(mx,mz)=>Math.hypot(mx-fe[0],mz-fe[1])<.1?'duke':null,(c,w,h,L,Hh)=>paintFront(c,w,h,L,Hh,units),.32);made++;}
  LMDBG.push(['DUKE STREET SHOPS',A[0]+ux*50,A[1]+uz*50,0,made]);}

// ---------------------------------------------------------------- more real shops from Simon's maps (fronts painted on the model's own buildings)
const books=(c,x,y,w,h,px)=>{for(let r=0;r<3;r++){c.fillStyle='#6b4a2a';c.fillRect(x,y+h*(.32+r*.24),w,3);for(let k=0;k<22;k++){c.fillStyle=['#a33','#2a5a8a','#d9b23a','#3a7a4a','#5a3a6a'][(k*7+r)%5];c.fillRect(x+w*(k+.1)/22,y+h*(.32+r*.24)-px*.32,w/26,px*.32);}}};
function mapShops(){const CHS=[[20,-27],[190,103]],SQR=[[20,-27],[-27,31]],DOCK=[[-27,31],[-82,105]],QUEEN=[[190,103],[347,225]];
  const L=[
   [36.2,7.4,CHS,[{name:'Raffles',sub:'Convenience store',fas:'#1d3a6b',txt:'#fff',pil:'#14284a',face:'Arial,sans-serif',inside:(c,x,y,w,h,px)=>{for(let r=0;r<3;r++)for(let k=0;k<12;k++){c.fillStyle=['#d23','#2a6','#fc3','#36c'][(k+r)%4];c.fillRect(x+w*(k+.2)/12,y+h*(.3+r*.22),w/16,px*.3);}}}]],
   [84.5,44.7,CHS,[{name:'Church Lane Coffee',sub:'Coffee · buns · sausage rolls',fas:'#3b2a20',txt:'#f3e2c0',pil:'#3b2a20',wall:'#efe9df',inside:tables}]],
   [103.5,59.6,CHS,[{name:'Point Off Licence',sub:'Wines · beers · spirits',fas:'#5a1430',txt:'#f2d98a',pil:'#3a0c20',inside:(c,x,y,w,h,px)=>{for(let r=0;r<3;r++)for(let k=0;k<14;k++){c.fillStyle=['#2a5a2a','#6a2a1a','#c8a040'][(k+r)%3];c.fillRect(x+w*(k+.3)/14,y+h*(.25+r*.24),w/30,px*.45);}}}]],
   [9.3,36.9,SQR,[{name:'EUROSTORE',sub:'Local groceries & drinks',fas:'#c8102e',txt:'#fff',pil:'#7a0a1c',face:'Arial,sans-serif',inside:(c,x,y,w,h,px)=>{for(let r=0;r<3;r++){c.fillStyle='#8a8a8a';c.fillRect(x,y+h*(.3+r*.22),w,3);for(let k=0;k<18;k++){c.fillStyle=['#d23','#2a6','#fc3','#36c','#f80'][(k+r)%5];c.fillRect(x+w*(k+.2)/18,y+h*(.3+r*.22)-px*.3,w/24,px*.3);}}}}]],
   [-18.9,51.1,DOCK,[{name:'Ciao',sub:'Italian restaurant',fas:'#1f5a34',txt:'#fff',pil:'#123a22',wall:'#f2ede4',inside:tables,doorL:true}]],
   [-38.0,74.1,DOCK,[{name:'Boutique',sub:'Fashion',fas:'#e7d3c9',txt:'#5a3a40',pil:'#8a6a64',font:'italic 700',inside:(c,x,y,w,h,px)=>rails(c,x,y,w,h,px,['#e05a8a','#f2d0dc','#2a2a2a'])}]],
   [-47.4,87.1,DOCK,[{name:'Iconic Accessories',sub:'Bags · jewellery · gifts',fas:'#111',txt:'#e8c870',pil:'#111',inside:(c,x,y,w,h,px)=>rails(c,x,y,w,h,px,['#e8c870','#c03a6a','#f0f0f0','#3a6aa0'])}]],
   [278.6,143.5,QUEEN,[{name:'Sinenna',sub:'Boutique',fas:'#2a2a2e',txt:'#f4e6e0',pil:'#2a2a2e',font:'italic 400',inside:(c,x,y,w,h,px)=>rails(c,x,y,w,h,px,['#b8a090','#2a2a2a','#e8e0d8'])}]],
   [342.6,203.1,QUEEN,[{name:'Elk Books',sub:'Local bookshop',fas:'#1e4a3a',txt:'#f0e6c8',pil:'#163a2c',inside:books}]]];
  let made=0;for(const [x,z,S,units] of L){const b=findBuild(x,z);if(!b){console.warn('map shop: no building',x,z);continue;}const fe=frontEdge(b,S[0],S[1]);if(!fe){console.warn('map shop: no front',x,z);continue;}
    facadeOverlay(b,(mx,mz)=>Math.hypot(mx-fe[0],mz-fe[1])<.1?'shop':null,(c,w,h,L2,Hh)=>paintFront(c,w,h,L2,Hh,units),.32);made++;}
  LMDBG.push(['MAP SHOPS',0,0,0,made]);}
// ---------------------------------------------------------------- every other house: a painted front (door, house number, windows, colours) from one shared atlas, one draw call
function houseFronts(){const PXM=32,UW=5.5,CW=Math.round(UW*PXM),NC=11,ROWS=[[1,2],[2,2],[3,2]];const AW=2048;let AH=0;const band={};
  for(const [f,r] of ROWS){band[f]={y:AH,h:f*3*PXM,rows:r};AH+=f*3*PXM*r;}
  const rnd=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647;})();
  const WALLS=['#e9e2d2','#d8cbb2','#c9d2cf','#efe0c4','#d9c7c0','#cfd6dc','#e4d6b8','#f2efe8','#bfb3a2','#e8d2c8','#cdbfa6','#dfe6d8'],DOORS=['#203a5a','#5a1f24','#1f3a2a','#2a2a2a','#7a5a2a','#3a3a6a','#8a1f1f','#e8e4dc'];
  const doorX={};const tex=canvasTex(AW,AH,(c)=>{for(const [f] of ROWS){const B=band[f];for(let r=0;r<B.rows;r++)for(let k=0;k<NC;k++){const x0=k*CW,y0=B.y+r*B.h,H=B.h;const id=f+'_'+r+'_'+k;const Y=m=>y0+H-m*PXM;
        const brick=rnd()<.28,wall=brick?['#8a4a36','#9a5a40','#7a3e30'][k%3]:WALLS[(k*5+r*3+f)%WALLS.length];c.fillStyle=wall;c.fillRect(x0,y0,CW,H);
        if(brick){c.fillStyle='rgba(0,0,0,.12)';for(let yy=y0;yy<y0+H;yy+=6){c.fillRect(x0,yy,CW,1);for(let xx=x0+((yy/6)%2)*7;xx<x0+CW;xx+=14)c.fillRect(xx,yy,1,6);}}
        else if(rnd()<.4){c.fillStyle='rgba(0,0,0,.06)';for(let i=0;i<500;i++)c.fillRect(x0+rnd()*CW,y0+rnd()*H,2,2);}
        c.fillStyle='rgba(0,0,0,.35)';c.fillRect(x0,y0,2,H);c.fillRect(x0+CW-2,y0,2,H);
        const trim=brick?'#efeae0':(rnd()<.5?'#ffffff':'#f0ece4');const dl=rnd()<.5;const dx=dl?x0+PXM*.6:x0+CW-PXM*1.6;doorX[id]=(dx-x0+PXM*.5)/CW;
        // door with fanlight and step
        c.fillStyle=trim;c.fillRect(dx-4,Y(2.45),PXM+8,PXM*2.45);c.fillStyle=DOORS[(k*3+r+f)%DOORS.length];c.fillRect(dx,Y(2.1),PXM,PXM*2.1);
        c.fillStyle='rgba(255,255,255,.15)';c.fillRect(dx+4,Y(1.95),PXM-8,PXM*.7);c.fillRect(dx+4,Y(1.1),PXM-8,PXM*.7);c.fillStyle='#cfe0e8';c.fillRect(dx,Y(2.4),PXM,PXM*.28);c.fillStyle='#d8b860';c.fillRect(dl?dx+PXM-7:dx+4,Y(1.1),3,5);
        c.fillStyle='#8a8478';c.fillRect(dx-6,Y(.12),PXM+12,PXM*.12);
        // windows: ground floor bay or sash, upper floors sash
        const win=(wx,wy,ww,wh,lit)=>{c.fillStyle=trim;c.fillRect(wx-4,wy-4,ww+8,wh+8);c.fillStyle=lit?'#f4c878':'#3a4652';c.fillRect(wx,wy,ww,wh);if(!lit){c.fillStyle='rgba(255,255,255,.12)';c.fillRect(wx,wy,ww*.45,wh);}
          c.fillStyle=trim;c.fillRect(wx+ww/2-1.5,wy,3,wh);c.fillRect(wx,wy+wh/2-1.5,ww,3);if(rnd()<.35){c.fillStyle='rgba(240,236,228,.8)';c.fillRect(wx,wy,ww,wh*.18);}};
        const gw=dl?[x0+PXM*2.1,x0+CW-PXM*.5]:[x0+PXM*.5,x0+CW-PXM*2.1];win(gw[0],Y(2.1),gw[1]-gw[0],PXM*1.4,rnd()<.25);
        for(let fl=1;fl<f;fl++){const n=2;for(let q=0;q<n;q++){const ww=PXM*1.2,wx=x0+CW*(q+.5)/n-ww/2;win(wx,Y(fl*3+2.2),ww,PXM*1.5,rnd()<.22);}}
        if(f>1){c.fillStyle=trim;c.fillRect(x0,Y(3.05),CW,4);}c.fillStyle='rgba(0,0,0,.25)';c.fillRect(x0,y0,CW,5);
        if(rnd()<.3){c.fillStyle='#2a3a2a';c.fillRect(gw[0]-2,Y(.55),gw[1]-gw[0]+4,PXM*.45);c.fillStyle='#4a7a3a';for(let i=0;i<8;i++){c.beginPath();c.arc(gw[0]+(gw[1]-gw[0])*(i+.5)/8,Y(.55),PXM*.16,0,7);c.fill();}}}}},{srgb:true});
  // house numbers: one atlas of plates 1..160
  const NN=160,NCOL=16,NW=64,NH=40;const ntex=canvasTex(NCOL*NW,Math.ceil(NN/NCOL)*NH,(c)=>{for(let i=0;i<NN;i++){const x=(i%NCOL)*NW,y=Math.floor(i/NCOL)*NH;c.fillStyle='#f4f1e8';c.fillRect(x+4,y+4,NW-8,NH-8);c.strokeStyle='#2a2a2a';c.lineWidth=3;c.strokeRect(x+6,y+6,NW-12,NH-12);
      c.fillStyle='#1a1a1a';c.font='700 26px Georgia,serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(i+1),x+NW/2,y+NH/2+1);}});
  // street segments, hashed
  const SEG=[],HS=new Map(),hk=(x,z)=>(Math.floor(x/20)+500)*4096+Math.floor(z/20)+500;
  STREETS.forEach((s,si)=>{for(let k=0;k<s.pts.length-1;k++){const a=s.pts[k],b=s.pts[k+1];const id=SEG.length;SEG.push([a,b,si]);const L=Math.hypot(b[0]-a[0],b[1]-a[1]),m=Math.ceil(L/10);for(let j=0;j<=m;j++){const x=a[0]+(b[0]-a[0])*j/m,z=a[1]+(b[1]-a[1])*j/m;for(let ox=-1;ox<=1;ox++)for(let oz=-1;oz<=1;oz++){const key=hk(x+ox*20,z+oz*20);let l=HS.get(key);if(!l)HS.set(key,l=new Set());l.add(id);}}}});
  const nearSeg=(x,z)=>{const l=HS.get(hk(x,z));if(!l)return null;let best=null,bd=1e9;for(const id of l){const [a,b,si]=SEG[id];const dx=b[0]-a[0],dz=b[1]-a[1],LL=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/LL,0,1);const px=a[0]+dx*t,pz=a[1]+dz*t,d=Math.hypot(px-x,pz-z);if(d<bd){bd=d;best={d,px,pz,si,t,id,dx,dz};}}return best;};
  const P=[],U=[],I=[],NP=[],NU=[],NI=[];const cnt={};let made=0;
  const quad=(Pa,Ua,Ia,x0,z0,x1,z1,y0,y1,nx,nz,off,u0,v0,u1,v1)=>{const b=Pa.length/3;Pa.push(x0+nx*off,y0,z0+nz*off,x1+nx*off,y0,z1+nz*off,x1+nx*off,y1,z1+nz*off,x0+nx*off,y1,z0+nz*off);Ua.push(u0,v0,u1,v0,u1,v1,u0,v1);Ia.push(b,b+1,b+2,b,b+2,b+3);};
  for(const b of BUILD){if(b.faced)continue;const q=b.pts,n=q.length;let area=0;for(let k=0;k<n;k++){const [x0,z0]=q[k],[x1,z1]=q[(k+1)%n];area+=x0*z1-x1*z0;}area=Math.abs(area)/2;if(area>420||area<18)continue;
    let best=null;for(let k=0;k<n;k++){const [x0,z0]=q[k],[x1,z1]=q[(k+1)%n];const L=Math.hypot(x1-x0,z1-z0);if(L<3.2)continue;const mx=(x0+x1)/2,mz=(z0+z1)/2;let nx=z1-z0,nz=-(x1-x0);nx/=L;nz/=L;if((mx-b.cx)*nx+(mz-b.cz)*nz<0){nx=-nx;nz=-nz;}
      const s=nearSeg(mx,mz);if(!s||s.d>24)continue;const tx=(s.px-mx)/(s.d||1),tz=(s.pz-mz)/(s.d||1);if(tx*nx+tz*nz<.55)continue;const score=s.d-L*.15;if(!best||score<best.score)best={score,k,x0,z0,x1,z1,L,nx,nz,s};}
    if(!best)continue;const f=clamp(Math.round((b.h||6)/3),1,3);const B=band[f];const y0=Math.min(...q.map(p=>groundH(p[0],p[1])))-.05,Hh=Math.max(2.9,b.h||6);
    const nu=Math.max(1,Math.round(best.L/UW));const side=((best.s.dx*(b.cz-best.s.pz)-best.s.dz*(b.cx-best.s.px))>0)?1:0;const key=best.s.si+'_'+side;
    // order the units along the street direction so numbers climb the way the street runs
    const dir=(best.x1-best.x0)*best.s.dx+(best.z1-best.z0)*best.s.dz>=0;
    for(let j=0;j<nu;j++){const jj=dir?j:nu-1-j;const ta=jj/nu,tb=(jj+1)/nu;const ax=best.x0+(best.x1-best.x0)*ta,az=best.z0+(best.z1-best.z0)*ta,bx=best.x0+(best.x1-best.x0)*tb,bz=best.z0+(best.z1-best.z0)*tb;
      const h=(Math.sin(b.cx*12.9898+b.cz*78.233+j*3.1)*43758.5453)%1;const hv=Math.abs(h);const r=Math.floor(hv*B.rows*NC)%(B.rows*NC);const row=Math.floor(r/NC),col=r%NC;const id=f+'_'+row+'_'+col;
      // texture is drawn facing out; flip u so the quad reads left-to-right from the street
      const u0=col*CW/AW,u1=(col+1)*CW/AW,vTop=1-(B.y+row*B.h)/AH,vBot=1-(B.y+(row+1)*B.h)/AH;
      // the quad runs a->b; seen from outside along the normal, a is on the right when n x up points b-a... compute which end is visually left
      const leftIsA=((bx-ax)*best.nz-(bz-az)*best.nx)<0;const [lx,lz,rx,rz]=leftIsA?[ax,az,bx,bz]:[bx,bz,ax,az];
      quad(P,U,I,lx,lz,rx,rz,y0,y0+Hh,best.nx,best.nz,.06,u0,vBot,u1,vTop);
      // number plate above the door
      cnt[key]=(cnt[key]||0)+1;const num=Math.min(NN,(cnt[key]-1)*2+1+side);const dxf=doorX[id]??.2;const px=lx+(rx-lx)*dxf,pz=lz+(rz-lz)*dxf;const ex=(rx-lx)/Math.hypot(rx-lx,rz-lz)*.24,ez=(rz-lz)/Math.hypot(rx-lx,rz-lz)*.24;
      const ni=num-1,nuu0=(ni%NCOL)/NCOL,nuu1=(ni%NCOL+1)/NCOL,nrows=Math.ceil(NN/NCOL),nv1=1-Math.floor(ni/NCOL)/nrows,nv0=1-(Math.floor(ni/NCOL)+1)/nrows;
      quad(NP,NU,NI,px-ex,pz-ez,px+ex,pz+ez,y0+2.55,y0+2.85,best.nx,best.nz,.09,nuu0,nv0,nuu1,nv1);}
    b.faced=true;made++;}
  const mk=(Pa,Ua,Ia,map,glow)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(Pa,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(Ua,2));g.setIndex(Ia);g.computeVertexNormals();
    const m=new THREE.Mesh(g,lam({map,emissive:0xffffff,emissiveMap:map,emissiveIntensity:glow,side:THREE.FrontSide}));m.matrixAutoUpdate=false;world.add(m);return m;};
  if(P.length){mk(P,U,I,tex,.18);mk(NP,NU,NI,ntex,.25);}
  LMDBG.push(['HOUSE FRONTS',0,0,0,made]);}

function churchStreetLandmarks(){try{walshsPharmacy();}catch(e){console.warn('pharmacy',e);}try{parishChurch();}catch(e){console.warn('church',e);}try{videoShop();}catch(e){console.warn('video',e);}try{centralStore();}catch(e){console.warn('central',e);}try{dukeRoundabout();}catch(e){console.warn('roundabout',e);}try{squareShops();}catch(e){console.warn('square shops',e);}try{cornerShops();}catch(e){console.warn('corner shops',e);}try{dukeShops();}catch(e){console.warn('duke shops',e);}try{mapShops();}catch(e){console.warn('map shops',e);}}

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
  for(const wx of [-5.6,0,5.6]){const p=new THREE.Mesh(new THREE.PlaneGeometry(1.5,2.3),upw);p.position.set(wx,6.05,F+.08);g.add(p);const sur=new THREE.Mesh(new THREE.BoxGeometry(1.85,2.6,.08),whiteM);sur.position.set(wx,6.05,F+.01);g.add(sur);}
  for(const wx of [-2.8,2.8]){const l=new THREE.Mesh(new THREE.BoxGeometry(.18,.3,.25),black);l.position.set(wx,7.0,F+.15);g.add(l);}
  // the cornice: moulded white with dentils, and a little slate canopy above the fascia
  const corn=new THREE.Mesh(new THREE.BoxGeometry(w+.3,.35,.55),whiteM);corn.position.set(0,4.55,F+.25);g.add(corn);
  for(let xx=-w/2+.4;xx<w/2;xx+=.55){const dn=new THREE.Mesh(new THREE.BoxGeometry(.22,.16,.12),whiteM);dn.position.set(xx,4.3,F+.48);g.add(dn);}
  const can=new THREE.Mesh(new THREE.BoxGeometry(w+.3,.12,.9),lam({map:TX.slate,color:0x8a9096}));can.position.set(0,4.78,F+.38);can.rotation.x=.35;g.add(can);
  // the green fascia
  const fas=new THREE.Mesh(new THREE.PlaneGeometry(w-1.6,1.25),lam({map:canvasTex(1024,96,(c,W,H)=>{const gr=c.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#86e04a');gr.addColorStop(1,'#4cc232');c.fillStyle=gr;c.fillRect(0,0,W,H);c.fillStyle='#2a8a28';c.fillRect(0,H-6,W,6);
    c.font="italic 900 66px 'Arial Black',Impact,sans-serif";c.textAlign='center';c.textBaseline='middle';c.lineWidth=9;c.strokeStyle='#ffffff';c.strokeText("FRIAR  TUCK'S",W/2,H/2+3);c.fillStyle='#0f8a4a';c.fillText("FRIAR  TUCK'S",W/2,H/2+3);
    c.lineWidth=2;c.strokeStyle='#0b5a30';c.strokeText("FRIAR  TUCK'S",W/2,H/2+3);}),emissive:0x1a3a10}));fas.material=new THREE.MeshBasicMaterial({map:fas.material.map,fog:false});fas.position.set(0,3.6,F+.3);g.add(fas);
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

function racerLandmarks(){const here=()=>true;
  if(here(RLM.square))squarePlaza();
  if(here(RLM.friarTucks))friarTucksReal(...RLM.friarTucks);
  if(here(RLM.townHall))townHallReal(...RLM.townHall);
  if(here(RLM.stPeters)){const q=byRoad(...RLM.stPeters,44);church(q.x,q.z,q.ry,{big:true});LMPOS.push([q.x,q.z]);}
  if(here(RLM.bandstand)){municipalPark();}
  if(here(RLM.phoneBox)){const q=byRoad(...RLM.phoneBox,1);const [,i]=nearest(q.x,q.z);const b=new THREE.Group();const red=lam({color:0xc8102e});
    const box=new THREE.Mesh(new THREE.BoxGeometry(1,2.4,1),red);box.position.y=1.2;b.add(box);const top=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1,12,1,false,0,Math.PI),red);top.rotation.z=Math.PI/2;top.position.y=2.4;b.add(top);
    for(const a of [0,Math.PI/2,Math.PI,-Math.PI/2]){const w=new THREE.Mesh(new THREE.PlaneGeometry(.7,1.4),lam({color:0x2a3440}));w.position.set(Math.sin(a)*.51,1.25,Math.cos(a)*.51);w.rotation.y=a;b.add(w);}
    const rh=Math.hypot(R[i].x,R[i].z),side=Math.sign((q.x-P[i].x)*R[i].x+(q.z-P[i].z)*R[i].z)||1;b.position.set(P[i].x+R[i].x/rh*side*(W2+VERGE-1.2),P[i].y+.12,P[i].z+R[i].z/rh*side*(W2+VERGE-1.2));b.rotation.y=q.ry;SR.add(b);}
  if(here(RLM.whistledown))whistledownReal(...RLM.whistledown,.594);
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

// ---------------------------------------------------------------- ground height: the town's fine grid first, then the long coast grid; the sea is 0
function gridTerr(T,x,z){const fx=(x-T.x0)/T.sx,fz=(z-T.z0)/T.sz;if(fx<0||fz<0||fx>T.nx-1||fz>T.nz-1)return null;if(!T.g)T.g=dec16(T.b64);
  const n=T.nx,ix=Math.min(n-2,Math.floor(fx)),iz=Math.min(T.nz-2,Math.floor(fz)),tx=fx-ix,tz=fz-iz,G=T.g;
  const h=((G[iz*n+ix]*(1-tx)+G[iz*n+ix+1]*tx)*(1-tz)+(G[(iz+1)*n+ix]*(1-tx)+G[(iz+1)*n+ix+1]*tx)*tz)/10;
  const e=Math.min(fx*T.sx,fz*T.sz,(T.nx-1-fx)*T.sx,(T.nz-1-fz)*T.sz);return [h,clamp((e-15)/80,0,1)];}
function cityTerr(x,z){let h=0,w=0;for(const T of CTERRS){const r=gridTerr(T,x,z);if(!r||r[1]<=0)continue;const k=r[1]*(1-w);h+=r[0]*k;w+=k;if(w>.999)break;}return w>0?h/w:null;}
function H0(x,z){const sd=sdWater(x,z);if(sd<0)return lerp(-1.6,-9,clamp(-sd/70,0,1));const c=cityTerr(x,z);return Math.max(.8,(c==null?0:c)+.7);}
let HG=null;const HS=2;
function H(x,z){if(HG){const fx=(x-AREA.x0)/HS,fz=(z-AREA.z0)/HS,nx=GW/HS+1;if(fx>=0&&fz>=0&&fx<nx-1&&fz<GD/HS){const ix=Math.floor(fx),iz=Math.floor(fz),tx=fx-ix,tz=fz-iz,o=iz*nx+ix;return (HG[o]*(1-tx)+HG[o+1]*tx)*(1-tz)+(HG[o+nx]*(1-tx)+HG[o+nx+1]*tx)*tz;}}return H0(x,z);}
function buildHeights(){const nx=GW/HS+1,nz=GD/HS+1;const g=new Float32Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)g[j*nx+i]=H0(AREA.x0+i*HS,AREA.z0+j*HS);HG=g;}
// lay the ground flush with the lap road and its pavements, under the Square's paving and the park lawn, blending out to the real terrain
let SQY=0,PARKY=0;
function flattenHeights(){const nx=GW/HS+1,nz=GD/HS+1;SQY=P[nearest(SQUARE.x,SQUARE.z)[1]].y+.12;PARKY=H(PARK.x,PARK.z);const out=new Float32Array(HG);const ss=t=>t*t*(3-2*t);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=AREA.x0+i*HS,z=AREA.z0+j*HS,o=j*nx+i;let h=HG[o];
    const [d,k]=nearest(x,z);const C=W2+VERGE;if(d<C+9){const rd=P[k].y+(d<W2?-.04:.08);h=d<C?rd:lerp(rd,h,ss((d-C)/9));}
    if(inSquare(x,z,6)){let m=0;while(m<6&&!inSquare(x,z,m))m++;h=m===0?SQY-.02:lerp(SQY-.02,h,ss(m/6));}
    if(inPark(x,z,6)){let m=0;while(m<6&&!inPark(x,z,m))m++;h=m===0?PARKY+.18:lerp(PARKY+.18,h,ss(m/6));}
    out[o]=h;}HG=out;}
const SEA=-.05;

// ---------------------------------------------------------------- the play area and its grids
const AREA={x0:-300,x1:900,z0:-450,z1:430};const GW=AREA.x1-AREA.x0,GD=AREA.z1-AREA.z0;
const GRID=new Uint8Array(GW*GD);// 1 m cells: 0 open, 1 building or tree, 2 water or outside, 3 street
const gi=(x,z)=>{const ix=Math.floor(x-AREA.x0),iz=Math.floor(z-AREA.z0);return (ix<0||iz<0||ix>=GW||iz>=GD)?-1:iz*GW+ix;};
const cellAt=(x,z)=>{const i=gi(x,z);return i<0?2:GRID[i];};
const solid=(x,z)=>{const c=cellAt(x,z);return c===1||c===2;};
const NC=2,NW=GW/NC|0,ND=GD/NC|0,NAV=new Uint8Array(NW*ND),DIST=new Int16Array(NW*ND).fill(-1);
const BUILD=[],TREES=[],STREETS=[],WINS=[];
function decodeMap(){
  const a=dec16(CITY_B);for(let i=0;i<a.length;){const c=a[i],h=a[i+1]/10,n=a[i+2];i+=3;const pts=[];for(let k=0;k<n;k++){pts.push([CITY.ox+a[i]/10,CITY.oz-a[i+1]/10]);i+=2;}
    let cx=0,cz=0;for(const p of pts){cx+=p[0];cz+=p[1];}cx/=n;cz/=n;if(cx<AREA.x0-60||cx>AREA.x1+60||cz<AREA.z0-60||cz>AREA.z1+60)continue;BUILD.push({c,h,pts,cx,cz});}
  const t=dec16(CITY_T);for(let i=0;i<t.length;i+=4){const x=CITY.ox+t[i]/10,z=CITY.oz-t[i+1]/10;if(x<AREA.x0-40||x>AREA.x1+40||z<AREA.z0-40||z>AREA.z1+40)continue;TREES.push([x,z,t[i+2]/10,t[i+3]/10]);}
  const SW={P:7.5,K:7.5,S:7,T:7,R:6,U:6,V:3.6,D:4,L:5};
  for(const l of OSM_TXT.trim().split('\n')){const f=l.split('|');const w=SW[f[0]];if(!w)continue;STREETS.push({k:f[0],name:f[1],w,pts:f[7].split(' ').map(q=>q.split(',').map(Number))});}}
function inPoly(x,z,p){let ins=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const xi=p[i][0],zi=p[i][1],xj=p[j][0],zj=p[j][1];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))ins=!ins;}return ins;}
function buildGrids(){
  for(let iz=0;iz<GD;iz++)for(let ix=0;ix<GW;ix++){if(ix%2||iz%2)continue;const x=AREA.x0+ix+1,z=AREA.z0+iz+1;const w=H(x,z)<.3?2:0;
    GRID[iz*GW+ix]=w;GRID[iz*GW+ix+1]=w;GRID[(iz+1)*GW+ix]=w;if(iz+1<GD&&ix+1<GW)GRID[(iz+1)*GW+ix+1]=w;}
  for(const s of STREETS){const hw=s.w/2+.6;for(let k=0;k<s.pts.length-1;k++){const [x0,z0]=s.pts[k],[x1,z1]=s.pts[k+1];const L=Math.hypot(x1-x0,z1-z0),m=Math.ceil(L);
      for(let j=0;j<=m;j++){const x=x0+(x1-x0)*j/m,z=z0+(z1-z0)*j/m;for(let dz=-hw;dz<=hw;dz+=1)for(let dx=-hw;dx<=hw;dx+=1){if(dx*dx+dz*dz>hw*hw)continue;const i=gi(x+dx,z+dz);if(i>=0)GRID[i]=3;}}}}
  for(let z=AREA.z0;z<AREA.z1;z++)for(let x=AREA.x0;x<AREA.x1;x++){const i=gi(x+.5,z+.5);if(i<0||GRID[i]===2)continue;const [d]=nearest(x+.5,z+.5);if(d<W2+VERGE)GRID[i]=3;}
  for(const o of SOLIDS){if(o.box){const R2=Math.hypot(o.w,o.d)/2+1,c=Math.cos(o.ry),sn=Math.sin(o.ry);for(let z=Math.floor(o.z-R2);z<=o.z+R2;z++)for(let x=Math.floor(o.x-R2);x<=o.x+R2;x++){const dx=x+.5-o.x,dz=z+.5-o.z;const lx=dx*c-dz*sn,lz=dx*sn+dz*c;if(Math.abs(lx)<o.w/2&&Math.abs(lz)<o.d/2){const i=gi(x+.5,z+.5);if(i>=0)GRID[i]=1;}}}
    else if(o.r>.6){for(let z=Math.floor(o.z-o.r);z<=o.z+o.r;z++)for(let x=Math.floor(o.x-o.r);x<=o.x+o.r;x++){if((x+.5-o.x)**2+(z+.5-o.z)**2<o.r*o.r){const i=gi(x+.5,z+.5);if(i>=0)GRID[i]=1;}}}}
  for(const b of BUILD){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const [x,z] of b.pts){x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}
    for(let z=Math.floor(z0);z<=z1;z++)for(let x=Math.floor(x0);x<=x1;x++){if(inPoly(x+.5,z+.5,b.pts)){const i=gi(x+.5,z+.5);if(i>=0)GRID[i]=1;}}}
  
  for(let iz=0;iz<ND;iz++)for(let ix=0;ix<NW;ix++){let bl=0;for(let a=0;a<2;a++)for(let b=0;b<2;b++){const c=GRID[(iz*2+a)*GW+ix*2+b];if(c===1||c===2)bl++;}NAV[iz*NW+ix]=bl>=1?1:0;}}
// a walkable spot near (x,z)
function snapWalk(x,z,r=40){for(let d=0;d<=r;d+=1)for(let a=0;a<Math.max(1,d*6);a++){const t=a/Math.max(1,d*6)*Math.PI*2,px=x+Math.cos(t)*d,pz=z+Math.sin(t)*d;if(!blockedR(px,pz,.6)&&cellAt(px,pz)===3)return [px,pz];}
  for(let d=0;d<=r;d+=1)for(let a=0;a<Math.max(1,d*6);a++){const t=a/Math.max(1,d*6)*Math.PI*2,px=x+Math.cos(t)*d,pz=z+Math.sin(t)*d;if(!blockedR(px,pz,.6))return [px,pz];}return [x,z];}
// move with sliding: straight, then along each axis, then glancing off at 45 and 90 degrees
function slide(x,z,vx,vz,r){if(!blockedR(x+vx,z+vz,r))return [x+vx,z+vz];if(!blockedR(x+vx,z,r)&&Math.abs(vx)>1e-4)return [x+vx,z];if(!blockedR(x,z+vz,r)&&Math.abs(vz)>1e-4)return [x,z+vz];
  for(const a of [.8,-.8,1.57,-1.57]){const c=Math.cos(a),s=Math.sin(a),k=a>1?.6:.8,ux=(vx*c-vz*s)*k,uz=(vx*s+vz*c)*k;if(!blockedR(x+ux,z+uz,r))return [x+ux,z+uz];}return [x,z];}
const blockedR=(x,z,r)=>solid(x-r,z-r)||solid(x+r,z-r)||solid(x-r,z+r)||solid(x+r,z+r)||solid(x,z);
// flow field towards the player (2 m cells, a window round the player)
const FQ=new Int32Array(NW*ND);let FWIN=null;
function flowField(px,pz){if(FWIN){const {x0,x1,z0,z1}=FWIN;for(let z=z0;z<=z1;z++)DIST.fill(-1,z*NW+x0,z*NW+x1+1);}
  const cx=clamp(Math.floor((px-AREA.x0)/NC),0,NW-1),cz=clamp(Math.floor((pz-AREA.z0)/NC),0,ND-1),R=72;
  const x0=Math.max(0,cx-R),x1=Math.min(NW-1,cx+R),z0=Math.max(0,cz-R),z1=Math.min(ND-1,cz+R);FWIN={x0,x1,z0,z1};
  let h=0,t=0;const s=cz*NW+cx;DIST[s]=0;FQ[t++]=s;
  while(h<t){const c=FQ[h++],x=c%NW,z=(c/NW)|0,d=DIST[c]+1;
    if(x>x0){const n=c-1;if(DIST[n]<0&&!NAV[n]){DIST[n]=d;FQ[t++]=n;}}if(x<x1){const n=c+1;if(DIST[n]<0&&!NAV[n]){DIST[n]=d;FQ[t++]=n;}}
    if(z>z0){const n=c-NW;if(DIST[n]<0&&!NAV[n]){DIST[n]=d;FQ[t++]=n;}}if(z<z1){const n=c+NW;if(DIST[n]<0&&!NAV[n]){DIST[n]=d;FQ[t++]=n;}}}}
const DIRS8=[[-1,0,0],[1,0,0],[-NW,0,0],[NW,0,0],[-NW-1,-NW,-1],[-NW+1,-NW,1],[NW-1,NW,-1],[NW+1,NW,1]];
const navIdx=(x,z)=>{const ix=Math.floor((x-AREA.x0)/NC),iz=Math.floor((z-AREA.z0)/NC);return (ix<0||iz<0||ix>=NW||iz>=ND)?-1:iz*NW+ix;};

// ================================================================ the driving game's Warrenpoint: its town lap road, landmarks and clearing rules, so both games share one map
function inst(geo,mat,list){const m=new THREE.InstancedMesh(geo,mat,Math.max(1,list.length));const o=new THREE.Object3D();
  list.forEach((it,i)=>{o.position.set(it.x,it.y,it.z);o.rotation.set(it.rx||0,it.ry||0,it.rz||0);o.scale.set(it.sx||1,it.sy||it.sx||1,it.sz||it.sx||1);o.updateMatrix();m.setMatrixAt(i,o.matrix);if(it.c)m.setColorAt(i,new THREE.Color(it.c));});
  m.count=list.length;world.add(m);return m;}
let friarTex=null,wdTex=null;
function signTex(txt,bg,fg,font='400 54px "Russo One", Impact, sans-serif'){return canvasTex(512,96,(g,w,h)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.strokeStyle=fg;g.lineWidth=4;g.strokeRect(6,6,w-12,h-12);
  g.fillStyle=fg;let fs=54;g.font=font.replace('54px',fs+'px');while(g.measureText(txt).width>w-40&&fs>18){fs-=2;g.font=font.replace('54px',fs+'px');}g.textAlign='center';g.textBaseline='middle';g.fillText(txt,w/2,h/2+2);});}
function friarFacade(){if(friarTex)return friarTex;friarTex=canvasTex(1024,352,(g,w,h)=>{
  g.fillStyle='#f1f1ee';g.fillRect(0,0,w,h);speckle(g,w,h,['#e9e9e5','#f7f7f4'],2500,3);
  g.fillStyle='#3d4247';g.fillRect(0,0,w,10);                                                  // eaves
  for(const x0 of [0,w-44])for(let y=12,k=0;y<176;y+=28,k++){g.fillStyle='#6a7077';g.fillRect(x0+(x0?(k%2?14:0):0),y,k%2?30:44,24);} // quoins
  const wins=[.1,.31,.51,.71,.84];
  for(const f of wins){const x=f*w,ww=f>.8?62:82,wy=26,wh=118;g.fillStyle='#7b8189';g.fillRect(x-6,wy-6,ww+12,wh+12);g.fillStyle='#5b3a2c';g.fillRect(x,wy,ww,wh);
    const gr=g.createLinearGradient(x,wy,x+ww,wy+wh);gr.addColorStop(0,'#6f8fb0');gr.addColorStop(.5,'#2f3d4d');gr.addColorStop(1,'#4d6580');g.fillStyle=gr;g.fillRect(x+5,wy+5,ww-10,wh-10);
    g.fillStyle='#5b3a2c';g.fillRect(x,wy+34,ww,5);
    g.fillStyle='#262626';g.fillRect(x-4,wy+wh+4,ww+8,16);for(let k=0;k<14;k++){g.fillStyle=k%3?'#e8c21a':'#4c8a2e';g.beginPath();g.arc(x+4+k*(ww/14),wy+wh+4+Math.random()*4,4.5,0,7);g.fill();}}
  // fascia
  g.fillStyle='#4a4f55';g.fillRect(0,178,w,6);g.fillStyle='#2c3136';g.fillRect(8,184,w-16,52);g.strokeStyle='#4f555c';g.lineWidth=4;g.strokeRect(10,186,w-20,48);
  g.fillStyle='#ffffff';g.textBaseline='middle';g.textAlign='center';g.font='700 30px "Russo One", Impact, sans-serif';g.fillText('RESTAURANT',w*.24,211);
  g.font='700 40px "Russo One", Impact, sans-serif';g.fillText("FRIAR TUCK'S",w*.56,211);g.font='700 24px "Russo One", Impact, sans-serif';g.fillText('TAKEAWAY',w*.87,211);
  // shop front
  g.fillStyle='#d9dcdf';g.fillRect(0,236,w,82);
  const glass=(x0,x1)=>{const gr=g.createLinearGradient(0,244,0,312);gr.addColorStop(0,'#59646e');gr.addColorStop(1,'#20262c');g.fillStyle=gr;g.fillRect(x0,244,x1-x0,66);g.fillStyle='rgba(255,210,140,.25)';g.fillRect(x0+10,262,(x1-x0)-20,30);g.fillStyle='#8a5a3c';for(let x=x0+40;x<x1-10;x+=110)g.fillRect(x,246,3,62);};
  glass(70,622);glass(676,820);glass(836,930);g.fillStyle='#c9ced2';g.fillRect(745,246,3,62);
  for(const x of [28,640,946]){g.fillStyle='#4a4f55';g.fillRect(x,236,28,96);g.fillStyle='#5a6067';g.fillRect(x+6,244,16,80);}
  g.fillStyle='#5a6067';g.fillRect(0,318,w,34);g.fillStyle='#4a4f55';g.fillRect(0,318,w,4);});return friarTex;}
function wdFacade(){if(wdTex)return wdTex;wdTex=canvasTex(1024,320,(g,w,h)=>{
  g.fillStyle='#f6f6f2';g.fillRect(0,0,w,h);speckle(g,w,h,['#eeeee9','#fbfbf8'],3000,3);
  g.fillStyle='#2b3440';g.fillRect(0,0,w,8);g.fillStyle='#d9dad6';g.fillRect(0,8,w,6);
  const sash=(x,y,ww,hh)=>{g.fillStyle='#1f2730';g.fillRect(x-3,y-3,ww+6,hh+6);const gr=g.createLinearGradient(x,y,x+ww,y+hh);gr.addColorStop(0,'#7d9cbb');gr.addColorStop(.55,'#2c3a49');gr.addColorStop(1,'#5a7590');g.fillStyle=gr;g.fillRect(x,y,ww,hh);
    g.fillStyle='#f6f6f2';g.fillRect(x,y+hh/2-2,ww,4);g.fillRect(x+ww/2-1.5,y,3,hh);g.fillStyle='#cfd0cc';g.fillRect(x-5,y+hh+2,ww+10,5);};
  for(let r=0;r<2;r++)for(let k=0;k<11;k++){const x=30+k*(w-60)/11+14;sash(x,26+r*82,40,58);}
  // ground floor: glazed bar and restaurant frontage either side of the entrance
  g.fillStyle='#e4e5e1';g.fillRect(0,188,w,8);
  const glass=(x0,x1)=>{const gr=g.createLinearGradient(0,206,0,300);gr.addColorStop(0,'#55636f');gr.addColorStop(1,'#1d242b');g.fillStyle=gr;g.fillRect(x0,206,x1-x0,94);g.fillStyle='rgba(255,214,150,.3)';g.fillRect(x0+8,236,x1-x0-16,40);g.fillStyle='#2b3440';for(let x=x0;x<=x1;x+=46)g.fillRect(x,206,4,94);g.fillRect(x0,250,x1-x0,3);};
  glass(30,430);glass(594,994);
  g.fillStyle='#2b3440';g.fillRect(452,196,120,124);g.fillStyle='#f6f6f2';g.fillRect(462,204,100,10);g.fillStyle='#3a2a20';g.fillRect(478,226,68,94);g.fillStyle='#c9a35a';g.fillRect(509,262,6,6);
  g.fillStyle='#1f2a3a';g.fillRect(150,150,724,34);g.fillStyle='#ffffff';g.textAlign='center';g.textBaseline='middle';g.font='700 30px "Russo One", Impact, sans-serif';g.fillText('THE WHISTLEDOWN HOTEL',w/2,168);
  g.fillStyle='#bfc1bd';g.fillRect(0,300,w,20);});return wdTex;}
let SR=null;const SOLIDS=[],LMPOS=[];const W2=5.5,VERGE=4;let P=[],R=[],NS=0;const LGRID=new Map(),LCELL=20;
const groundH=(x,z)=>H(x,z);const shortClear=()=>true;
let LDI=null;const LDS=2;let LDW=0,LDH=0;
function buildLapField(){LDW=Math.ceil((AREA.x1-AREA.x0)/LDS)+1;LDH=Math.ceil((AREA.z1-AREA.z0)/LDS)+1;const I=new Int32Array(LDW*LDH).fill(-1),D=new Float32Array(LDW*LDH).fill(1e9);
  const cx=(i)=>AREA.x0+i*LDS,cz=(j)=>AREA.z0+j*LDS;
  for(let k=0;k<NS;k++){const p=P[k];const i0=Math.floor((p.x-AREA.x0)/LDS),j0=Math.floor((p.z-AREA.z0)/LDS);for(let j=j0-3;j<=j0+4;j++)for(let i=i0-3;i<=i0+4;i++){if(i<0||j<0||i>=LDW||j>=LDH)continue;const o=j*LDW+i,d=Math.hypot(cx(i)-p.x,cz(j)-p.z);if(d<D[o]){D[o]=d;I[o]=k;}}}
  const tryN=(o,n,i,j)=>{const k=I[n];if(k<0)return;const d=Math.hypot(cx(i)-P[k].x,cz(j)-P[k].z);if(d<D[o]){D[o]=d;I[o]=k;}};
  for(let pass=0;pass<2;pass++){for(let j=0;j<LDH;j++)for(let i=0;i<LDW;i++){const o=j*LDW+i;if(i)tryN(o,o-1,i,j);if(j){tryN(o,o-LDW,i,j);if(i)tryN(o,o-LDW-1,i,j);if(i<LDW-1)tryN(o,o-LDW+1,i,j);}}
    for(let j=LDH-1;j>=0;j--)for(let i=LDW-1;i>=0;i--){const o=j*LDW+i;if(i<LDW-1)tryN(o,o+1,i,j);if(j<LDH-1){tryN(o,o+LDW,i,j);if(i<LDW-1)tryN(o,o+LDW+1,i,j);if(i)tryN(o,o+LDW-1,i,j);}}}
  LDI=I;}
function nearest(x,z){if(LDI){const fi=(x-AREA.x0)/LDS,fj=(z-AREA.z0)/LDS;const i=Math.round(fi),j=Math.round(fj);if(i>=0&&j>=0&&i<LDW&&j<LDH){let best=1e18,bi=0;
    for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=LDW||jj>=LDH)continue;let k=LDI[jj*LDW+ii];if(k<0)continue;for(let q=-3;q<=3;q++){const kk=(k+q+NS)%NS;const d=(P[kk].x-x)**2+(P[kk].z-z)**2;if(d<best){best=d;bi=kk;}}}
    return [Math.sqrt(best),bi];}}
  return nearestSlow(x,z);}
function nearestSlow(x,z){const cx=Math.floor(x/LCELL),cz=Math.floor(z/LCELL);let best=1e18,bi=0;
  for(let r=1;r<40;r++){for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){if(r>1&&Math.abs(a)<r&&Math.abs(b)<r)continue;const l=LGRID.get((cx+a)+','+(cz+b));if(!l)continue;for(const i of l){const dx=P[i].x-x,dz=P[i].z-z,d=dx*dx+dz*dz;if(d<best){best=d;bi=i;}}}if(best<1e18&&r>=2)break;}
  return [Math.sqrt(best),bi];}
const freeSpot=(x,z,m)=>nearest(x,z)[0]>W2+VERGE+m&&!solid(x,z);
function buildLap(){const pts=filletPts(LAP_CP,false);const curve=new THREE.CatmullRomCurve3(pts.map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');curve.arcLengthDivisions=Math.max(2000,pts.length*120);
  const L=curve.getLength();NS=Math.floor(L/2);P=[];for(let i=0;i<NS;i++)P.push(curve.getPointAt(i/NS));
  let ys=P.map(p=>H(p.x,p.z));for(let pass=0;pass<2;pass++){const n=[];for(let i=0;i<NS;i++){let s=0;for(let j=-6;j<=6;j++)s+=ys[(i+j+NS)%NS];n.push(s/13);}ys=n;}P.forEach((p,i)=>p.y=ys[i]+.05);
  R=P.map((p,i)=>{const a=P[(i+NS-1)%NS],b=P[(i+1)%NS];const tx=b.x-a.x,tz=b.z-a.z,l=Math.hypot(tx,tz)||1;return new THREE.Vector3(-tz/l,0,tx/l);});
  for(let i=0;i<NS;i++){const k=Math.floor(P[i].x/LCELL)+','+Math.floor(P[i].z/LCELL);if(!LGRID.has(k))LGRID.set(k,[]);LGRID.get(k).push(i);}buildLapField();}
const lapY=(x,z)=>{const [d,i]=nearest(x,z);return [d,P[i].y];};
function buildRacerTown(){SR=new THREE.Group();world.add(SR);racerLandmarks();churchStreetLandmarks();
  const sprites=[];SR.traverse(o=>{if(o.isSprite||o.isPoints)sprites.push(o);});for(const sp of sprites)world.attach(sp);bakeInto(SR,world);world.remove(SR);}
// keep the lap road, its pavements, the Square, the park and the landmarks clear, exactly as the racer does
function clearForRacer(){for(const c of LMCLEAR){const keep=[];for(const b of BUILD){const dx=b.cx-c.x,dz=b.cz-c.z,cs=Math.cos(c.ry),sn=Math.sin(c.ry);const lx=dx*cs-dz*sn,lz=dx*sn+dz*cs;if(Math.abs(lx)<c.w/2&&Math.abs(lz)<c.d/2)continue;keep.push(b);}BUILD.length=0;BUILD.push(...keep);}
window.__rawB=BUILD.map(b=>({pts:b.pts,h:b.h,cx:b.cx,cz:b.cz}));const lmBoxes=SOLIDS.filter(o=>o.box);const lmHit=(x,z,m)=>lmBoxes.some(o=>{const dx=x-o.x,dz=z-o.z,c=Math.cos(o.ry),s=Math.sin(o.ry);const lx=dx*c-dz*s,lz=dx*s+dz*c;return Math.abs(lx)<o.w/2+m&&Math.abs(lz)<o.d/2+m;});
  const keepB=[];for(const b of BUILD){const n=b.pts.length;let ok=sdWater(b.cx,b.cz)>1;
    for(let k=0;k<n&&ok;k++){const [x0,z0]=b.pts[k],[x1,z1]=b.pts[(k+1)%n];const L=Math.hypot(x1-x0,z1-z0),m=Math.max(1,Math.ceil(L/2.5));
      for(let j=0;j<m;j++){const x=x0+(x1-x0)*j/m,z=z0+(z1-z0)*j/m;const [d]=nearest(x,z);if(d<W2+.6||inSquare(x,z,3)||inPark(x,z,2)||lmHit(x,z,1.5)||sdWater(x,z)<-1){ok=false;break;}}}
    if(ok&&lmHit(b.cx,b.cz,1.5))ok=false;if(ok)keepB.push(b);}
  BUILD.length=0;BUILD.push(...keepB);
  const keepT=[];for(const t of TREES){const [x,z,r]=t;const [d]=nearest(x,z);if(d<W2+VERGE+1.5+r*.5||sdWater(x,z)<2||inSquare(x,z,1)||lmHit(x,z,1))continue;
    const hsh=((Math.sin(x*12.9898+z*78.233)*43758.5453)%1+1)%1;if(d>W2+VERGE+150&&hsh<.55)continue;if(d>W2+VERGE+320&&hsh<.8)continue;keepT.push(t);}
  TREES.length=0;TREES.push(...keepT);}
// the lap road itself: the racer's marked asphalt, raised pavements and railings on the seafront
function buildLapRoad(){const road=asphaltTex();road.wrapS=road.wrapT=THREE.RepeatWrapping;TX.pavement.wrapS=TX.pavement.wrapT=THREE.RepeatWrapping;
  const strip=(cols,vScale,mat)=>{const n=cols.length,pos=[],uv=[],idx=[];let v=0;for(let ii=0;ii<=NS;ii++){const k=ii%NS;if(ii)v+=P[k].distanceTo(P[(k+NS-1)%NS]);for(const [d,h,u] of cols){pos.push(P[k].x+R[k].x*d,P[k].y+h,P[k].z+R[k].z*d);uv.push(u,v/vScale);}
      if(ii){const b=(ii-1)*n;for(let c=0;c<n-1;c++){const a=b+c;idx.push(a,a+n,a+1,a+1,a+n,a+n+1);}}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.Mesh(g,mat);world.add(m);return m;};
  strip([[-W2,0,0],[W2,0,1]],14,lam({map:road,side:THREE.DoubleSide}));
  const pm=lam({map:TX.pavement,side:THREE.DoubleSide});strip([[-W2-VERGE,.12,0],[-W2,.12,1],[-W2,0,1]],4,pm);strip([[W2,0,1],[W2,.12,1],[W2+VERGE,.12,0]],4,pm);
  // seafront railings where the water is close
  const posts=[];for(let i=0;i<NS;i+=2)for(const sd of [-1,1]){const q=P[i].clone().addScaledVector(R[i],sd*(W2+VERGE+4));if(sdWater(q.x,q.z)<10){const p=P[i].clone().addScaledVector(R[i],sd*(W2+VERGE-.25));posts.push(p);}}
  if(posts.length){const im=new THREE.InstancedMesh(new THREE.BoxGeometry(.08,1.05,.08),lam({color:0x2f6a52}),posts.length*2);const o=new THREE.Object3D();let k=0;
    for(const p of posts){o.position.set(p.x,p.y+.12+.52,p.z);o.scale.set(1,1,1);o.updateMatrix();im.setMatrixAt(k++,o.matrix);o.position.y=p.y+1.1;o.scale.set(1,.06,1);o.updateMatrix();im.setMatrixAt(k++,o.matrix);}
    im.computeBoundingSphere();world.add(im);}}

// ================================================================ renderer, scene
const view=document.getElementById('view');
const renderer=new THREE.WebGLRenderer({canvas:view,antialias:true,powerPreference:'high-performance'});
const coarse=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;if(coarse)document.body.classList.add('touchui');
const PR=Math.min(devicePixelRatio,coarse?1.5:2);renderer.setPixelRatio(PR);renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.xr.enabled=true;renderer.xr.setFoveation?.(1);
const scene=new THREE.Scene();const FOG=0x2b2530;scene.background=new THREE.Color(FOG);scene.fog=new THREE.Fog(FOG,18,165);
const camera=new THREE.PerspectiveCamera(74,innerWidth/innerHeight,.05,600);const rig=new THREE.Group();rig.add(camera);scene.add(rig);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hemi=new THREE.HemisphereLight(0x8d8fb8,0x2a2018,.62);scene.add(hemi);
const moon=new THREE.DirectionalLight(0xb4c2ff,.42);moon.position.set(-120,200,90);scene.add(moon);
let SKYU=null;const LAMPS=[],LITM=[];
const torch=new THREE.SpotLight(0xfff0d0,9,48,.42,.55,1.3);torch.position.set(0,0,0);camera.add(torch);torch.target.position.set(0,0,-1);camera.add(torch.target);
{const g=new THREE.SphereGeometry(500,24,12);const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{flash:{value:0},fdir:{value:new THREE.Vector3(0,.3,1)},top:{value:new THREE.Vector3(.07,.06,.13)},hor:{value:new THREE.Vector3(.55,.24,.18)},low:{value:new THREE.Vector3(.17,.145,.19)}},
  vertexShader:'varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform vec3 top;uniform vec3 hor;uniform vec3 low;uniform float flash;uniform vec3 fdir;varying vec3 v;void main(){float t=clamp(v.y*1.8,0.,1.);vec3 c=mix(hor,top,pow(t,.6));c=mix(low,c,smoothstep(-.05,.08,v.y));float k=max(dot(normalize(v),normalize(fdir)),0.);c+=vec3(.5,.56,.85)*flash*(.18+.9*pow(k,4.))*smoothstep(-.05,.1,v.y);gl_FragColor=vec4(c,1.);}'});SKYU=m.uniforms;
 const sky=new THREE.Mesh(g,m);sky.renderOrder=-1;rig.add(sky);}

// ================================================================ the town
const world=new THREE.Group();scene.add(world);const CULL=[];
const FACADE=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);speckle(g,w,h,['#e9e6df','#f6f4ee','#d8d4cc'],600,3);
  g.fillStyle='#cfcac0';g.fillRect(36,22,58,74);g.fillStyle='#1b2028';g.fillRect(40,26,50,66);g.fillStyle='#e6e1d8';g.fillRect(64,26,3,66);g.fillRect(40,57,50,3);g.fillStyle='#bdb7ad';g.fillRect(34,96,62,5);},{repeat:[1,1]});
const FACADE_LIT=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);speckle(g,w,h,['#e9e6df','#f6f4ee','#d8d4cc'],600,3);
  g.fillStyle='#cfcac0';g.fillRect(36,22,58,74);const gr=g.createLinearGradient(0,26,0,92);gr.addColorStop(0,'#ffd88a');gr.addColorStop(1,'#d08a3a');g.fillStyle=gr;g.fillRect(40,26,50,66);g.fillStyle='#6b4a2a';g.fillRect(64,26,3,66);g.fillRect(40,57,50,3);},{repeat:[1,1]});
const COLS=[[0xf4efe4,0xe9d8c4,0xd9e6e8,0xf1dcd5,0xece4b4,0xffffff,0xdfe9d6,0xf2e6cf,0xe7d3c0,0xd4dbe6],[0xf6f1e6,0xe8e0f0,0xf3e1c7,0xdbe8dc,0xffffff],[0xd9d2c3],[0xb9bec4],[0xcfc8bb,0xc4bfb5],[0xe6e0d4,0xdcd6ca]];
function buildTown(){
  // ground: one mesh, coloured by height (grass, mud by the shore)
  {const S=2.5,nx=Math.floor(GW/S)+1,nz=Math.floor(GD/S)+1,pos=new Float32Array(nx*nz*3),col=new Float32Array(nx*nz*3),idx=[];const c=new THREE.Color();
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=AREA.x0+i*S,z=AREA.z0+j*S,y=H(x,z),k=j*nx+i;pos[k*3]=x;pos[k*3+1]=y-.05;pos[k*3+2]=z;
      const nzv=(Math.sin(x*.13)*Math.cos(z*.11)+Math.sin(x*.031+z*.027))*.04;if(y<SEA+.6)c.setRGB(.33,.3,.24);else c.setHSL(.24+nzv,.32,.17+nzv);col.set([c.r,c.g,c.b],k*3);}
    for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,d=a+nx,e=d+1;idx.push(a,d,b,b,d,e);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
    world.add(new THREE.Mesh(g,lam({vertexColors:true})));}
  {const w=new THREE.Mesh(new THREE.PlaneGeometry(4000,3000),new THREE.MeshLambertMaterial({color:0x1d2c3a,transparent:true,opacity:.92}));w.rotation.x=-Math.PI/2;w.position.set(300,0,0);world.add(w);}
  buildLapRoad();
  // the streets
  {const rp=[],ri=[],rc=[];const c=new THREE.Color();
    for(const s of STREETS){const sm=[];for(let k=0;k<s.pts.length-1;k++){const [x0,z0]=s.pts[k],[x1,z1]=s.pts[k+1];const L=Math.hypot(x1-x0,z1-z0),m=Math.max(1,Math.ceil(L/2.5));for(let j=0;j<m;j++)sm.push([x0+(x1-x0)*j/m,z0+(z1-z0)*j/m]);}sm.push(s.pts[s.pts.length-1]);
      if(!sm.some(([x,z])=>x>AREA.x0&&x<AREA.x1&&z>AREA.z0&&z<AREA.z1))continue;const tone=s.k==='V'?.2:.16;
      let prevIn=true;for(let k=0;k<sm.length;k++){const a=sm[Math.max(0,k-1)],b=sm[Math.min(sm.length-1,k+1)];let dx=b[0]-a[0],dz=b[1]-a[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const [x,z]=sm[k];
        const [ld,ly]=lapY(x,z);const inside=ld<W2+.2;let y=Math.max(H(x,z),SEA+.15)+.06;if(ld<W2+VERGE+9)y=lerp(y,ly+.02,THREE.MathUtils.smoothstep(W2+VERGE+9-ld,0,9));
        for(const o of [-s.w/2,s.w/2]){rp.push(x-dz*o,y,z+dx*o);c.setRGB(tone,tone,tone*1.05);rc.push(c.r,c.g,c.b);}
        if(k&&!(inside&&prevIn)){const v=rp.length/3-4;ri.push(v,v+1,v+2,v+1,v+3,v+2);}prevIn=inside;}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));g.setAttribute('color',new THREE.Float32BufferAttribute(rc,3));g.setIndex(ri);g.computeVertexNormals();
    world.add(new THREE.Mesh(g,lam({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})));}
  // buildings, in tiles so the far ones are not drawn
  const TILE=120,tiles=new Map(),col=new THREE.Color();
  BUILD.forEach((b,bi)=>{const P2=b.pts,n=P2.length;let gmin=1e9,gmax=-1e9;for(const [x,z] of P2){const g=H(x,z);gmin=Math.min(gmin,g);gmax=Math.max(gmax,g);}
    const lit=((bi*2654435761)>>>0)%5===0;const key=Math.floor(b.cx/TILE)+'_'+Math.floor(b.cz/TILE)+(lit?'L':'');
    if(!tiles.has(key))tiles.set(key,{lit,pos:[],nor:[],uv:[],col:[],x0:1e9,x1:-1e9,z0:1e9,z1:-1e9});const tl=tiles.get(key);
    tl.x0=Math.min(tl.x0,b.cx);tl.x1=Math.max(tl.x1,b.cx);tl.z0=Math.min(tl.z0,b.cz);tl.z1=Math.max(tl.z1,b.cz);
    const yb=gmin-.6,yt=gmax+b.h;const pal=COLS[b.c]||COLS[5];col.setHex(pal[(bi*7+3)%pal.length]).multiplyScalar(.82);const W=[col.r,col.g,col.b],PL=[.08,.08];const plain=b.c===3||b.c===4||b.h<3.2;
    const tri=(A,B,C,N,U,c)=>{const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],vx=C[0]-A[0],vy=C[1]-A[1],vz=C[2]-A[2];const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;let V=[A,B,C],UU=U;if(nx*N[0]+ny*N[1]+nz*N[2]<0){V=[A,C,B];UU=[U[0],U[2],U[1]];}for(let q=0;q<3;q++){tl.pos.push(...V[q]);tl.nor.push(...N);tl.uv.push(...UU[q]);tl.col.push(...c);}};
    let area=0;for(let k=0;k<n;k++){const [x0,z0]=P2[k],[x1,z1]=P2[(k+1)%n];area+=x0*z1-x1*z0;}area/=2;const sg=area>0?1:-1;
    const wall=(a,c2,ytop,u0)=>{const [x0,z0]=a,[x1,z1]=c2;const L=Math.hypot(x1-x0,z1-z0);if(L<.05)return u0;const N=[sg*(z1-z0)/L,0,-sg*(x1-x0)/L];
      if(!plain&&L>2){const ex=(x1-x0)/L,ez=(z1-z0)/L;let s0=(((.508-(u0%1))%1)+1)%1*3.6;for(let s=s0;s<L-.75;s+=3.6){if(s<.75)continue;for(let k=0;;k++){const y=gmin+(k+.54)*3;if(y+.9>ytop)break;WINS.push([x0+ex*s+N[0]*.05,y,z0+ez*s+N[2]*.05,Math.atan2(N[0],N[2]),tl]);}}}const v0=(yb-gmin)/3,v1=(ytop-gmin)/3,u1=u0+L/3.6;const uv=plain?[PL,PL,PL,PL]:[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];
      const A=[x0,yb,z0],B=[x1,yb,z1],C=[x1,ytop,z1],D=[x0,ytop,z0];tri(A,B,C,N,[uv[0],uv[1],uv[2]],W);tri(A,C,D,N,[uv[0],uv[2],uv[3]],W);return u1;};
    const Lr=k=>Math.hypot(P2[(k+1)%4][0]-P2[k][0],P2[(k+1)%4][1]-P2[k][1]);
    if(n===4&&b.c<=1&&Math.abs(area)<260&&b.h<13){const o=Lr(0)>=Lr(1)?0:1;const p=[0,1,2,3].map(k=>P2[(k+o)%4]);const sw=Math.min(Lr(o),Lr(o+1)),rh=clamp(sw*.38,1.6,4.2);
      const mid=(a,c2)=>[(a[0]+c2[0])/2,(a[1]+c2[1])/2];const Ra=mid(p[3],p[0]),Rb=mid(p[1],p[2]);const A3=[Ra[0],yt+rh,Ra[1]],B3=[Rb[0],yt+rh,Rb[1]];let u=0;for(let k=0;k<4;k++)u=wall(p[k],p[(k+1)%4],yt,u);
      col.setHex(0x3a3f47);const sl=[col.r,col.g,col.b];
      const plane=(a,c2,Rq,Rp)=>{const A=[a[0],yt,a[1]],B=[c2[0],yt,c2[1]];const ux=B[0]-A[0],uz=B[2]-A[2],vx=Rq[0]-A[0],vy=Rq[1]-A[1],vz=Rq[2]-A[2];let N=[-uz*vy,uz*vx-ux*vz,ux*vy];const l=Math.hypot(...N);N=N.map(q=>q/l);if(N[1]<0)N=N.map(q=>-q);tri(A,B,Rq,N,[PL,PL,PL],sl);tri(A,Rq,Rp,N,[PL,PL,PL],sl);};
      plane(p[0],p[1],B3,A3);plane(p[2],p[3],A3,B3);
      const gable=(a,c2,R3)=>{const L=Math.hypot(c2[0]-a[0],c2[1]-a[1]);const N=[sg*(c2[1]-a[1])/L,0,-sg*(c2[0]-a[0])/L];tri([a[0],yt,a[1]],[c2[0],yt,c2[1]],R3,N,[PL,PL,PL],W);};gable(p[1],p[2],B3);gable(p[3],p[0],A3);}
    else{let u=0;for(let k=0;k<n;k++)u=wall(P2[k],P2[(k+1)%n],yt,u);col.setHex(b.c===0?0x474b52:0x5c5f63);const rc=[col.r,col.g,col.b];
      const tr=THREE.ShapeUtils.triangulateShape(P2.map(([x,z])=>new THREE.Vector2(x,z)),[]);for(const [i0,i1,i2] of tr)tri([P2[i0][0],yt,P2[i0][1]],[P2[i1][0],yt,P2[i1][1]],[P2[i2][0],yt,P2[i2][1]],[0,1,0],[PL,PL,PL],rc);}});
  const mat=lam({map:FACADE,vertexColors:true}),matL=lam({map:FACADE_LIT,vertexColors:true,emissive:0x3a2208,emissiveMap:FACADE_LIT});
  for(const t of tiles.values()){if(!t.pos.length)continue;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(t.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(t.nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(t.uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(t.col,3));
    const m=new THREE.Mesh(g,t.lit?matL:mat);if(t.lit)LITM.push(m);m.userData.mats=[mat,matL];world.add(m);t.cull={x:(t.x0+t.x1)/2,z:(t.z0+t.z1)/2,r:Math.hypot(t.x1-t.x0,t.z1-t.z0)/2+40};CULL.push(Object.assign({o:m},t.cull));}
  // trees
  {const TT=150,tt=new Map();for(const [x,z,r,h] of TREES){if(cellAt(x,z)===3||cellAt(x,z)===2)continue;const k=Math.floor(x/TT)+'_'+Math.floor(z/TT);if(!tt.has(k))tt.set(k,{a:[],b:[],x,z});const t=tt.get(k);
      const y=H(x,z),sc=clamp(h/8.4,.55,1.3),cr=sc*clamp(r/2.6,.8,1.4);t.a.push([x,y+2*sc,z,sc,sc,sc]);t.b.push([x,y+5.6*sc,z,cr,sc*(.9+((x*13+z*7)%1+1)%1*.4),cr]);}
    const tg=new THREE.CylinderGeometry(.35,.5,4,6),cg=new THREE.IcosahedronGeometry(3.4,0),tm=lam({color:0x3e2c1c}),cm=lam({color:0xffffff,flatShading:true});const o=new THREE.Object3D(),cc=new THREE.Color();
    for(const t of tt.values()){const ms=[];for(const [list,geo,m,isC] of [[t.a,tg,tm,false],[t.b,cg,cm,true]]){const im=new THREE.InstancedMesh(geo,m,list.length);list.forEach((q,i)=>{o.position.set(q[0],q[1],q[2]);o.scale.set(q[3],q[4],q[5]);o.rotation.set(0,q[0]+q[2],0);o.updateMatrix();im.setMatrixAt(i,o.matrix);if(isC)im.setColorAt(i,cc.setHSL(.26+((q[0]*3.1)%1+1)%1*.06,.35,.13+((q[2]*1.7)%1+1)%1*.08));});im.computeBoundingSphere();world.add(im);ms.push(im);}
      for(const m of ms)CULL.push({o:m,x:m.boundingSphere.center.x,z:m.boundingSphere.center.z,r:m.boundingSphere.radius+10});}}
  // street lamps (glowing heads, no real lights)
  {const L=[];for(const s of STREETS){if(s.k==='V')continue;let acc=17;for(let k=0;k<s.pts.length-1;k++){const [x0,z0]=s.pts[k],[x1,z1]=s.pts[k+1];const len=Math.hypot(x1-x0,z1-z0);let d=acc;while(d<len){const x=x0+(x1-x0)*d/len,z=z0+(z1-z0)*d/len,nx=-(z1-z0)/len,nz=(x1-x0)/len;const px=x+nx*(s.w/2+.7),pz=z+nz*(s.w/2+.7);
          if(px>AREA.x0&&px<AREA.x1&&pz>AREA.z0&&pz<AREA.z1&&cellAt(px,pz)!==1&&nearest(px,pz)[0]>W2+VERGE+.3)L.push([px,H(px,pz),pz]);d+=36;}acc=d-len;}}
    for(let i=0;i<NS;i+=15){const sd=(i/15)%2?1:-1;const q=P[i].clone().addScaledVector(R[i],sd*(W2+VERGE-.5));if(cellAt(q.x,q.z)!==1&&sdWater(q.x,q.z)>3)L.push([q.x,P[i].y+.12,q.z]);}
    const pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(.07,.09,6,6),lam({color:0x2a2d31}),L.length),head=new THREE.InstancedMesh(new THREE.SphereGeometry(.28,8,6),new THREE.MeshBasicMaterial({color:0xffc070}),L.length);const o=new THREE.Object3D();
    L.forEach((p,i)=>{o.position.set(p[0],p[1]+3,p[2]);o.updateMatrix();pole.setMatrixAt(i,o.matrix);o.position.y=p[1]+6.05;o.updateMatrix();head.setMatrixAt(i,o.matrix);});world.add(pole,head);LAMPS.push(head);
    const glow=canvasTex(64,64,(g,w,h)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,200,120,.85)');gr.addColorStop(1,'rgba(255,160,60,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
    const gp=new Float32Array(L.length*3);L.forEach((p,i)=>gp.set([p[0],p[1]+6.05,p[2]],i*3));const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(gp,3));
    {const pts=new THREE.Points(gg,new THREE.PointsMaterial({map:glow,size:3.2,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:true}));world.add(pts);LAMPS.push(pts);}}
}
const LANDMARKS=[["FRIAR TUCK'S",43,-29,'#1d1d1d','#f2c94c'],['ANNIE CAFE',157.5,62,'#f6e7d6','#7a2e3a'],['TOWN HALL',94,5,'#d9d2c3','#2a2a2a'],['THE WHISTLEDOWN',305,226,'#13283a','#e8d9a8'],['WARRENPOINT BATHS',380,254,'#0d3b5a','#ffffff'],['THE SQUARE',-42,-12,'#ffffff','#111111']];
function nearestStreet(x,z){let best=1e18,bx=x,bz=z;for(const s of STREETS)for(let k=0;k<s.pts.length-1;k++){const [x0,z0]=s.pts[k],[x1,z1]=s.pts[k+1];const dx=x1-x0,dz=z1-z0,L=dx*dx+dz*dz||1,t=clamp(((x-x0)*dx+(z-z0)*dz)/L,0,1),qx=x0+dx*t,qz=z0+dz*t,d=(qx-x)**2+(qz-z)**2;if(d<best){best=d;bx=qx;bz=qz;}}return [bx,bz];}
function updateCull(px,pz){for(const c of CULL){const dx=c.x-px,dz=c.z-pz,R=200+c.r;c.o.visible=dx*dx+dz*dz<R*R;}}

// ================================================================ particles (one draw call)
const PFX=(()=>{const N=900,pos=new Float32Array(N*3),col=new Float32Array(N*3),sz=new Float32Array(N),al=new Float32Array(N),P=[];for(let i=0;i<N;i++)P.push({t:0,x:0,y:0,z:0,vx:0,vy:0,vz:0,g:0,s:0,life:1,r:1,gg:1,b:1});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('pcol',new THREE.BufferAttribute(col,3));g.setAttribute('psize',new THREE.BufferAttribute(sz,1));g.setAttribute('palpha',new THREE.BufferAttribute(al,1));
  const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{scale:{value:innerHeight*.6}},
    vertexShader:'attribute vec3 pcol;attribute float psize;attribute float palpha;varying vec3 vc;varying float va;uniform float scale;void main(){vc=pcol;va=palpha;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=psize*scale/max(.5,-mv.z);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'varying vec3 vc;varying float va;void main(){vec2 d=gl_PointCoord-.5;float r=dot(d,d);if(r>.25)discard;gl_FragColor=vec4(vc,va*(1.-r*4.));}'});
  const pts=new THREE.Points(g,m);pts.frustumCulled=false;scene.add(pts);let k=0;const c=new THREE.Color();
  return {add(x,y,z,vx,vy,vz,hex,s,life,gr=-6){const p=P[k];k=(k+1)%N;c.setHex(hex);Object.assign(p,{t:life,life,x,y,z,vx,vy,vz,g:gr,s,r:c.r,gg:c.g,b:c.b});},
    update(dt){for(let i=0;i<N;i++){const p=P[i];if(p.t<=0){al[i]=0;continue;}p.t-=dt;p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;pos[i*3]=p.x;pos[i*3+1]=p.y;pos[i*3+2]=p.z;col[i*3]=p.r;col[i*3+1]=p.gg;col[i*3+2]=p.b;sz[i]=p.s;al[i]=Math.max(0,p.t/p.life);}
      for(const a of ['position','pcol','psize','palpha'])g.attributes[a].needsUpdate=true;}};})();

// ================================================================ audio (all synthesised)
const AU={ctx:null,master:null,laser:null,lg:null,lf:null,noise:null,amb:null};
function audioInit(){if(AU.ctx){AU.ctx.resume?.();return;}const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C();AU.ctx=ctx;AU.master=ctx.createGain();AU.master.gain.value=.8;AU.master.connect(ctx.destination);
  const b=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.noise=b;
  // the laser: two detuned oscillators through a resonant filter, gated while firing
  const o1=ctx.createOscillator(),o2=ctx.createOscillator();o1.type='sawtooth';o2.type='square';o1.frequency.value=180;o2.frequency.value=362;const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=6;f.frequency.value=1400;const g=ctx.createGain();g.gain.value=0;
  o1.connect(f);o2.connect(f);f.connect(g);g.connect(AU.master);o1.start();o2.start();AU.laser=[o1,o2];AU.lf=f;AU.lg=g;
  // night wind
  const n=ctx.createBufferSource();n.buffer=b;n.loop=true;const nf=ctx.createBiquadFilter();nf.type='lowpass';nf.frequency.value=380;const ng=ctx.createGain();ng.gain.value=.05;n.connect(nf);nf.connect(ng);ng.connect(AU.master);n.start();AU.amb=ng;}
function panTo(node,x,y,z){const ctx=AU.ctx;const p=ctx.createPanner();p.panningModel='HRTF';p.distanceModel='inverse';p.refDistance=3;p.rolloffFactor=1.2;p.positionX.value=x;p.positionY.value=y;p.positionZ.value=z;node.connect(p);p.connect(AU.master);return p;}
function listener(){if(!AU.ctx)return;const L=AU.ctx.listener;camera.getWorldPosition(_v1);camera.getWorldDirection(_v2);if(L.positionX){L.positionX.value=_v1.x;L.positionY.value=_v1.y;L.positionZ.value=_v1.z;L.forwardX.value=_v2.x;L.forwardY.value=_v2.y;L.forwardZ.value=_v2.z;L.upX.value=0;L.upY.value=1;L.upZ.value=0;}else{L.setPosition(_v1.x,_v1.y,_v1.z);L.setOrientation(_v2.x,_v2.y,_v2.z,0,1,0);}}
// ================================================================ zombie voices: formant-synthesised moans and the odd croaked "braaains", placed in 3D on the zombie (louder and closer-sounding as they come for you)
const VOX=[];let RASP=null;
function raspCurve(){const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;c[i]=Math.tanh(x*1.7)*.95+.03*Math.sin(x*23);}return c;}
// one voice: a croaky glottal buzz plus breath, through four vowel formants that follow a phoneme timeline
function zvoice(z,kind){if(!AU.ctx||VOX.length>=7)return;const ctx=AU.ctx,t=ctx.currentTime+.02;const brute=z.type==='brute';
  const word=kind!=='moan';const f0=(brute?58:word?92:72)+Math.random()*(brute?14:28);
  // phoneme timeline: [time, F1, F2, F3, F4, voicing, noise]
  let tl;if(kind==='brains'){const a=.5+Math.random()*.35;
    // [time, F1, F2, F3, F4, voicing, hiss, high-formant level]
    tl=[[0,220,800,2100,3300,0,0,.3],[.045,240,850,2100,3300,.85,0,.4],[.08,380,1050,1450,3100,1,0,.7],[.2,420,1150,1500,3100,1,0,.8],[.3,680,1640,2420,3400,1,0,1],[.3+a,640,1720,2480,3450,1,0,1],[.48+a,420,2050,2650,3550,1,0,1],
      [.58+a,300,2150,2750,3600,.95,0,.9],[.64+a,260,1300,2500,3300,.8,0,.18],[.8+a,250,1250,2450,3300,.75,0,.15],[.86+a,260,1500,2500,3400,.3,.9,.2],[1.08+a,260,1500,2500,3400,.15,.7,.2],[1.18+a,260,1500,2500,3400,0,0,.2]];}
  else if(kind==='chicken'){const a=.25+Math.random()*.25,b2=.3+Math.random()*.3;
    // ch (hiss, no voice) -> long "chiii" -> k closure and click -> "-ennn" -> trailing n
    tl=[[0,400,2000,2650,3500,0,0,1],[.02,400,2000,2650,3500,0,.9,1],[.15,400,2000,2650,3500,0,.8,1],[.17,380,2050,2700,3500,1,0,1],[.17+a,420,2000,2650,3500,1,0,1],[.25+a,380,2300,2900,3600,.6,0,1],
      [.28+a,380,2300,2900,3600,0,0,1],[.36+a,380,2300,2900,3600,0,0,1],[.4+a,520,1750,2500,3400,1,0,1],[.4+a+b2,520,1700,2500,3400,1,0,1],[.5+a+b2,300,1450,2450,3300,.85,0,.18],[.75+a+b2,260,1300,2400,3300,.7,0,.15],[.9+a+b2,260,1300,2400,3300,0,0,.15]];
    tl.kAt=.37+a;}
  else{const d=1.1+Math.random()*1.1;const v=[[340,760,2300],[700,1100,2450],[520,880,2350],[420,820,2300]];const A=v[(Math.random()*4)|0],B=v[(Math.random()*4)|0];
    tl=[[0,A[0],A[1],A[2],3300,0,.1,1],[.12,A[0],A[1],A[2],3300,1,.15,1],[d*.55,B[0],B[1],B[2],3300,1,.2,1],[d,B[0]*.9,B[1]*.95,B[2],3300,.5,.25,1],[d+.3,B[0]*.85,B[1]*.9,B[2],3300,0,0,1]];}
  const end=t+tl[tl.length-1][0];
  // the source: a sawtooth with wobble and a slow sag in pitch (zombies don't hold a note)
  const o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f0*(kind==='brains'?.95:1.05),t);
  if(kind==='brains'){o.frequency.linearRampToValueAtTime(f0*1.15,t+.4);o.frequency.linearRampToValueAtTime(f0*1.05,end-.6);o.frequency.linearRampToValueAtTime(f0*.8,end);}else o.frequency.linearRampToValueAtTime(f0*(.62+Math.random()*.15),end);
  const vib=ctx.createOscillator(),vg=ctx.createGain();vib.frequency.value=4+Math.random()*4;vg.gain.value=f0*(word?.025:.05);vib.connect(vg);vg.connect(o.frequency);
  const jit=ctx.createBufferSource();jit.buffer=AU.noise;jit.loop=true;jit.playbackRate.value=.02;const jg=ctx.createGain();jg.gain.value=f0*(word?.06:.25);jit.connect(jg);jg.connect(o.frequency);// irregular croak
  const vox=ctx.createGain();vox.gain.value=0;o.connect(vox);
  const br=ctx.createBufferSource();br.buffer=AU.noise;br.loop=true;const brf=ctx.createBiquadFilter();brf.type='bandpass';brf.frequency.value=1600;brf.Q.value=.6;const brg=ctx.createGain();brg.gain.value=0;br.connect(brf);brf.connect(brg);
  // the "z" at the end of brains
  const fz=ctx.createBufferSource();fz.buffer=AU.noise;fz.loop=true;const fzf=ctx.createBiquadFilter();if(kind==='chicken'){fzf.type='bandpass';fzf.frequency.value=3300;fzf.Q.value=1.1;}else{fzf.type='highpass';fzf.frequency.value=4200;}const fzg=ctx.createGain();fzg.gain.value=0;fz.connect(fzf);fzf.connect(fzg);
  if(!RASP)RASP=raspCurve();const sh=ctx.createWaveShaper();sh.curve=RASP;const mix=ctx.createGain();mix.gain.value=(brute?1.3:1)*(word?1.5:1.1);
  const FG=[],FL=word?[1,.95,.6,.3]:[1,.6,.34,.16];const F=[0,1,2,3].map(k=>{const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=word?[6,10,13,14][k]:[7,9,11,12][k];const g=ctx.createGain();g.gain.value=FL[k]*(brute&&k===0?1.3:1);vox.connect(f);brg.connect(f);f.connect(g);g.connect(sh);FG.push(g);return f;});
  if(kind==='brains'){const lo=ctx.createBiquadFilter();lo.type='lowpass';lo.frequency.value=400;const lg=ctx.createGain();lg.gain.value=.06;vox.connect(lo);lo.connect(lg);lg.connect(sh);}// a little chest under the vowel
  sh.connect(mix);fzg.connect(mix);
  for(const [tt,f1,f2,f3,f4,vo,no,hi] of tl){const at=t+tt,s=brute?.86:1;[f1,f2,f3,f4].forEach((v,k)=>F[k].frequency.linearRampToValueAtTime(v*s,at));for(let k=1;k<4;k++)FG[k].gain.linearRampToValueAtTime(FL[k]*hi,at);
    vox.gain.linearRampToValueAtTime(vo*.5,at);brg.gain.linearRampToValueAtTime((word?.05:.35)*(vo>0?.6:.1)+(no&&!word?no*.6:0),at);fzg.gain.linearRampToValueAtTime(word?no*(kind==='chicken'?.55:.4):0,at);}
  F.forEach((f,k)=>f.frequency.setValueAtTime(tl[0][1+k]*(brute?.86:1),t));FG.forEach((g,k)=>g.gain.setValueAtTime(FL[k]*(k?tl[0][7]:1),t));
  if(kind==='chicken'){const ka=t+tl.kAt;const pb=ctx.createBufferSource();pb.buffer=AU.noise;const pf=ctx.createBiquadFilter();pf.type='bandpass';pf.frequency.value=2000;pf.Q.value=1.5;const pg=ctx.createGain();pg.gain.setValueAtTime(0,ka);pg.gain.linearRampToValueAtTime(.9,ka+.006);pg.gain.exponentialRampToValueAtTime(.001,ka+.05);pb.connect(pf);pf.connect(pg);pg.connect(mix);pb.start(ka,Math.random());pb.stop(ka+.06);}
  if(kind==='brains'){// the b: a soft low thump as the lips part
    const pb=ctx.createBufferSource();pb.buffer=AU.noise;const pf=ctx.createBiquadFilter();pf.type='lowpass';pf.frequency.value=900;const pg=ctx.createGain();pg.gain.setValueAtTime(0,t+.03);pg.gain.linearRampToValueAtTime(.5,t+.04);pg.gain.exponentialRampToValueAtTime(.001,t+.08);pb.connect(pf);pf.connect(pg);pg.connect(sh);pb.start(t,Math.random());pb.stop(t+.1);}
  const p=panTo(mix,z.x,1.6*(z.sc||1),z.z);p.refDistance=2.5;p.rolloffFactor=1.35;
  for(const n of [o,vib,jit,br,fz]){n.start(t);n.stop(end+.1);}
  const v={z,p,end};VOX.push(v);o.onended=()=>{const i=VOX.indexOf(v);if(i>=0)VOX.splice(i,1);try{mix.disconnect();p.disconnect();}catch(e){}};}
// keep each voice on its zombie as it shambles
function voxUpdate(){if(!AU.ctx)return;for(const v of VOX){const z=v.z;if(v.p.positionX){v.p.positionX.value=z.x;v.p.positionZ.value=z.z;}else v.p.setPosition(z.x,1.6,z.z);}}
function groan(z){const d=Math.hypot(z.x-PL.x,z.z-PL.z);const close=d<26&&!z.dead;const r=Math.random();zvoice(z,close&&r<(d<12?.32:.18)?(Math.random()<.22?'chicken':'brains'):'moan');}
function sfx(kind,x=null,y=1.4,z=0){if(!AU.ctx)return;const ctx=AU.ctx,t=ctx.currentTime;const src=ctx.createBufferSource();src.buffer=AU.noise;const f=ctx.createBiquadFilter(),g=ctx.createGain();src.connect(f);f.connect(g);
  const S={hit:[2400,'bandpass',.18,.09],splat:[500,'lowpass',.5,.35],hurt:[260,'lowpass',.6,.25],step:[900,'lowpass',.05,.06],pick:[3000,'highpass',.25,.2],vent:[2000,'highpass',.12,.9]}[kind]||[1000,'lowpass',.3,.2];
  f.type=S[1];f.frequency.value=S[0];g.gain.setValueAtTime(S[2],t);g.gain.exponentialRampToValueAtTime(.001,t+S[3]);if(x==null)g.connect(AU.master);else panTo(g,x,y,z);src.start(t,Math.random());src.stop(t+S[3]+.05);
  if(kind==='pick'){const o=ctx.createOscillator(),og=ctx.createGain();o.frequency.setValueAtTime(660,t);o.frequency.setValueAtTime(990,t+.08);og.gain.setValueAtTime(.12,t);og.gain.exponentialRampToValueAtTime(.001,t+.25);o.connect(og);og.connect(AU.master);o.start(t);o.stop(t+.3);}}
function tone(f0,f1,d,vol=.15,type='square'){if(!AU.ctx)return;const ctx=AU.ctx,t=ctx.currentTime;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.linearRampToValueAtTime(f1,t+d);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(AU.master);o.start(t);o.stop(t+d+.05);}
// ================================================================ spooky soundtrack: all synthesised live (music box, organ pad, drone, theremin, heartbeat as the horde closes in)
const MU={on:false,int:0,next:0,step:0,bar:0,timer:null};
function musicInit(){const ctx=AU.ctx;if(!ctx||MU.bus)return;
  MU.bus=ctx.createGain();MU.bus.gain.value=OPT.music===false?0:.55;const comp=ctx.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=8;comp.ratio.value=4;comp.attack.value=.004;comp.release.value=.18;const mk=ctx.createGain();mk.gain.value=1.15;MU.bus.connect(comp);comp.connect(mk);mk.connect(AU.master);
  // a cheap generated hall reverb and a dotted echo
  const len=ctx.sampleRate*3.2,ir=ctx.createBuffer(2,len,ctx.sampleRate);for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);}
  MU.verb=ctx.createConvolver();MU.verb.buffer=ir;const vg=ctx.createGain();vg.gain.value=.55;MU.verb.connect(vg);vg.connect(MU.bus);
  MU.dl=ctx.createDelay(2);MU.dl.delayTime.value=.59;const fb=ctx.createGain();fb.gain.value=.42;const df=ctx.createBiquadFilter();df.type='lowpass';df.frequency.value=2400;MU.dl.connect(df);df.connect(fb);fb.connect(MU.dl);df.connect(MU.bus);df.connect(MU.verb);
  // the drone: detuned saws, slowly breathing filter
  MU.drone=[];const dg=ctx.createGain();dg.gain.value=.05;const dfl=ctx.createBiquadFilter();dfl.type='lowpass';dfl.frequency.value=260;dfl.Q.value=3;dfl.connect(dg);dg.connect(MU.bus);dg.connect(MU.verb);
  const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.07;lg.gain.value=140;lfo.connect(lg);lg.connect(dfl.frequency);lfo.start();
  for(const dt of [-7,0,6]){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=36.71;o.detune.value=dt;o.connect(dfl);o.start();MU.drone.push(o);}MU.dfl=dfl;MU.dg=dg;}
const MF=n=>440*Math.pow(2,(n-69)/12);
// D harmonic minor: Dm, Bb, Gm, A7(b9), then Dm, F/C, E dim, A
const PROG=[[62,65,69],[58,62,65],[55,58,62],[57,61,64,70],[62,65,69],[60,65,69],[64,67,70],[57,61,64]];
const BASS=[38,34,31,33,38,36,40,33];
function mNote(t,f,d,vol,type,dest,att=.005){const ctx=AU.ctx;const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(.0005,t+d);o.connect(g);for(const x of dest)g.connect(x);o.start(t);o.stop(t+d+.05);return o;}
function musicBox(t,n){const f=MF(n);mNote(t,f,1.6,.07,'sine',[MU.bus,MU.dl,MU.verb]);mNote(t,f*2.01,.5,.025,'sine',[MU.bus,MU.dl]);mNote(t,f*4.2,.18,.012,'triangle',[MU.dl]);}
function organ(t,ch,d){const ctx=AU.ctx;const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=900;const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+d*.4);g.gain.linearRampToValueAtTime(0,t+d);f.connect(g);g.connect(MU.bus);g.connect(MU.verb);
  for(const n of ch)for(const [m,v] of [[.5,1],[1,.7],[2,.35]]){const o=ctx.createOscillator();o.type='sine';o.frequency.value=MF(n-12)*m;const og=ctx.createGain();og.gain.value=v/ch.length;o.connect(og);og.connect(f);o.start(t);o.stop(t+d+.1);}}
function theremin(t){const ctx=AU.ctx;const o=ctx.createOscillator();o.type='sine';const base=MF(74+[0,3,7,10][(Math.random()*4)|0]);o.frequency.setValueAtTime(base*.94,t);o.frequency.exponentialRampToValueAtTime(base,t+.7);o.frequency.exponentialRampToValueAtTime(base*(Math.random()<.5?.75:1.19),t+3.2);
  const v=ctx.createOscillator(),vg=ctx.createGain();v.frequency.value=5.5;vg.gain.value=base*.018;v.connect(vg);vg.connect(o.frequency);const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.03,t+.8);g.gain.linearRampToValueAtTime(0,t+3.6);
  o.connect(g);g.connect(MU.bus);g.connect(MU.verb);o.start(t);v.start(t);o.stop(t+3.7);v.stop(t+3.7);}
function heart(t,vol){const ctx=AU.ctx;for(const [dt,k] of [[0,1],[.2,.7]]){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(70,t+dt);o.frequency.exponentialRampToValueAtTime(38,t+dt+.18);g.gain.setValueAtTime(vol*k,t+dt);g.gain.exponentialRampToValueAtTime(.0005,t+dt+.25);o.connect(g);g.connect(MU.bus);o.start(t+dt);o.stop(t+dt+.3);}}
function stab(t,ch){const ctx=AU.ctx;for(const n of ch){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=MF(n-12);const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(2200,t);f.frequency.exponentialRampToValueAtTime(300,t+.25);const g=ctx.createGain();g.gain.setValueAtTime(.022,t);g.gain.exponentialRampToValueAtTime(.0005,t+.3);o.connect(f);f.connect(g);g.connect(MU.bus);g.connect(MU.dl);o.start(t);o.stop(t+.35);}}

// Mr Toasty's battle theme: war drums, a driving bass, brass stabs and a choir, over the same minor-key chords
const BPROG=[[62,65,69],[58,62,65],[60,64,67],[57,61,64]],BBASS=[38,34,36,33];
function drum(t,f0,vol,len,noise){const ctx=AU.ctx;const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*.45,t+len*.8);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0005,t+len);o.connect(g);g.connect(MU.bus);g.connect(MU.verb);o.start(t);o.stop(t+len+.05);
  if(noise){const n=ctx.createBufferSource();n.buffer=AU.noise;const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=noise;f.Q.value=.9;const ng=ctx.createGain();ng.gain.setValueAtTime(vol*.6,t);ng.gain.exponentialRampToValueAtTime(.0005,t+len*.6);n.connect(f);f.connect(ng);ng.connect(MU.bus);ng.connect(MU.verb);n.start(t,Math.random());n.stop(t+len);}}
function bassN(t,n,d){const ctx=AU.ctx;const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=MF(n);const f=ctx.createBiquadFilter();f.type='lowpass';f.Q.value=6;f.frequency.setValueAtTime(1100,t);f.frequency.exponentialRampToValueAtTime(160,t+d);const g=ctx.createGain();g.gain.setValueAtTime(.09,t);g.gain.exponentialRampToValueAtTime(.0005,t+d);o.connect(f);f.connect(g);g.connect(MU.bus);o.start(t);o.stop(t+d+.05);}
function brass(t,ch,d,vol){const ctx=AU.ctx;const f=ctx.createBiquadFilter();f.type='lowpass';f.Q.value=2;f.frequency.setValueAtTime(400,t);f.frequency.linearRampToValueAtTime(2600,t+Math.min(.25,d*.4));f.frequency.linearRampToValueAtTime(900,t+d);
  const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.05);g.gain.linearRampToValueAtTime(vol*.6,t+d*.7);g.gain.linearRampToValueAtTime(0,t+d);f.connect(g);g.connect(MU.bus);g.connect(MU.verb);
  for(const n of ch)for(const dt of [-9,8]){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=MF(n-12);o.detune.value=dt;o.connect(f);o.start(t);o.stop(t+d+.05);}}
function choir(t,ch,d){const ctx=AU.ctx;const out=ctx.createGain();out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(.05,t+d*.35);out.gain.linearRampToValueAtTime(0,t+d);out.connect(MU.bus);out.connect(MU.verb);
  const F=[[700,.9,8],[1150,.5,10],[2600,.22,12]].map(([fr,gn,q])=>{const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=fr;f.Q.value=q;const g=ctx.createGain();g.gain.value=gn;f.connect(g);g.connect(out);return f;});
  for(const n of ch)for(const dt of [-12,0,11]){const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=MF(n);o.detune.value=dt;const v=ctx.createOscillator(),vg=ctx.createGain();v.frequency.value=5+Math.random();vg.gain.value=3;v.connect(vg);vg.connect(o.detune);for(const f of F)o.connect(f);o.start(t);v.start(t);o.stop(t+d+.05);v.stop(t+d+.05);}}
function hat(t,vol,len){const ctx=AU.ctx;const n=ctx.createBufferSource();n.buffer=AU.noise;const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=7200;const g=ctx.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0005,t+len);n.connect(f);f.connect(g);g.connect(MU.bus);n.start(t,Math.random());n.stop(t+len+.02);}
function snare(t,vol){drum(t,210,vol*.6,.16,1900);hat(t,vol*.5,.12);}
function crash(t,vol){const ctx=AU.ctx;const n=ctx.createBufferSource();n.buffer=AU.noise;const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=4200;const g=ctx.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0005,t+1.8);n.connect(f);f.connect(g);g.connect(MU.bus);g.connect(MU.verb);n.start(t,Math.random());n.stop(t+1.9);}
function riser(t,d){const ctx=AU.ctx;const n=ctx.createBufferSource();n.buffer=AU.noise;n.loop=true;const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=3;f.frequency.setValueAtTime(400,t);f.frequency.exponentialRampToValueAtTime(6000,t+d);const g=ctx.createGain();g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.18,t+d);g.gain.linearRampToValueAtTime(0,t+d+.05);n.connect(f);f.connect(g);g.connect(MU.bus);n.start(t,Math.random());n.stop(t+d+.1);}
// how close you are to being lifted out: the theme builds as the hold-out counts down
const bossBuild=()=>EX.phase==='inbound'&&MIS?clamp(1-holdT/MIS.hold,0,1):EX.phase==='landed'?1:.3;
function bossTick(t,s,ci){const ch=BPROG[ci%4],b=BBASS[ci%4],u=bossBuild(),h=spbB()/2;
  // kick on every beat, war drums on top
  if(s%2===0)drum(t,58,.75,.32,0);
  if([0,3,6,8,11,14].includes(s))drum(t,82,.42,.5,s===0?170:0);
  // snare backbeat, doubling then rolling as the helicopter gets close
  if(s%4===2)snare(t,.5);
  if(u>.55&&s%2===1)snare(t,.22+u*.15);
  if(u>.82){snare(t+h,.18+(u-.82)*1.2);}
  // racing hi-hats on every 16th, accented on the beat
  hat(t,s%2===0?.11:.07,.05);hat(t+h,.05,.04);
  // tom fill to close every other phrase
  if(ci%2===1&&s>=12){const tf=[150,125,105,88][s-12];drum(t,tf,.4,.22,500);drum(t+h,tf*.92,.34,.2,500);}
  // crash at the top of each phrase once it's building
  if(s===0&&(u>.4||ci%4===0))crash(t,.14+u*.1);
  if(s===0&&ci%2===1&&u>.7)riser(t,spbB()*16);
  bassN(t,b+(s%4===3?12:0),.16);bassN(t+h,b,.1);
  if(s===0){brass(t,ch,spbB()*5,.055);choir(t,ch.map(n=>n+12),spbB()*16+.3);}
  if(s===10||(u>.5&&s%4===0&&s))brass(t,ch,spbB()*1.2,.045);
  musicBox(t,ch[s%3]+12+(s%8>5?12:0));if(u>.6)musicBox(t+h,ch[(s+1)%3]+24);}
const spbB=()=>60/(166+bossBuild()*14)/2;
function musicBossOn(on){if(!AU.ctx||!MU.bus)return;if(on===MU.boss)return;MU.boss=on;const ctx=AU.ctx,t=ctx.currentTime;
  if(on){// cymbal swell into a huge boom
    const n=ctx.createBufferSource();n.buffer=AU.noise;const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=5000;const g=ctx.createGain();g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.35,t+1.1);g.gain.linearRampToValueAtTime(0,t+1.25);n.connect(f);f.connect(g);g.connect(MU.bus);g.connect(MU.verb);n.start(t,Math.random());n.stop(t+1.3);
    drum(t+1.2,48,.9,2.2,120);brass(t+1.2,[50,53,57,62],2.4,.07);MU.next=t+1.2+spbB()*2;MU.step=0;MU.bar=0;}
  else{// triumph if you took him down, otherwise just let it fall away
    if(BOSS.B.killed)brass(t+.05,[62,66,69,74],2.6,.07);MU.step=0;MU.bar=0;}}
// ================================================================ the bonus round's music: an original 50s-style rock'n'roll stomper. 172 bpm, boogie-woogie bass, 12-bar blues in A, hammered piano, a growling sax lead
const RK={bars:[0,0,0,0,5,5,0,0,7,5,0,7]};// I I I I IV IV I I V IV I V
const BOOG=[0,4,7,9,10,9,7,4];// the classic boogie walk: root, 3rd, 5th, 6th, flat 7th and back
const A4n=69;const NN={A4:69,B4:71,C5:72,'C#5':73,D5:74,E5:76,'F#5':78,G5:79,'G#5':80,A5:81,B5:83,'G#4':68};
// the tune, written out bar by bar: [eighth, length in eighths, note]
const TUNE=[
 [[0,2,'E5'],[2,1,'E5'],[3,1,'F#5'],[4,2,'E5'],[6,2,'C#5']],
 [[0,1,'A4'],[1,1,'C5',1],[2,2,'C#5'],[4,4,'A4']],
 [[0,2,'E5'],[2,1,'E5'],[3,1,'G5'],[4,2,'A5'],[6,2,'G5']],
 [[0,2,'E5'],[2,2,'C#5'],[4,2,'C#5'],[6,2,'B4']],
 [[0,2,'F#5'],[2,1,'F#5'],[3,1,'A5'],[4,2,'F#5'],[6,2,'D5']],
 [[0,1,'A4'],[1,1,'C5',1],[2,2,'D5'],[4,4,'F#5']],
 [[0,2,'E5'],[2,1,'E5'],[3,1,'F#5'],[4,2,'E5'],[6,2,'C#5']],
 [[0,2,'A4'],[2,2,'C#5'],[4,4,'E5']],
 [[0,2,'B5'],[2,2,'G#5'],[4,2,'E5'],[6,2,'B4']],
 [[0,2,'A5'],[2,2,'F#5'],[4,2,'D5'],[6,2,'A4']],
 [[0,1,'C5',1],[1,1,'C#5'],[2,2,'E5'],[4,1,'A5'],[5,1,'G5'],[6,2,'E5']],
 [[0,2,'E5'],[2,2,'D5'],[4,2,'B4'],[6,2,'G#4']]];
const spbR=()=>60/172/2;
const ROCK_MP3='__ROCK_MP3__';const RKS={buf:null,src:null,g:null,loading:false};
function rockLoad(){if(RKS.buf||RKS.loading||!AU.ctx||ROCK_MP3.length<100)return;RKS.loading=true;try{const bin=atob(ROCK_MP3),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  AU.ctx.decodeAudioData(u.buffer,b=>{RKS.buf=b;},()=>{RKS.loading=false;});}catch(e){RKS.loading=false;}}
function rockPlay(on){const ctx=AU.ctx;if(!ctx||!MU.bus)return;if(on&&RKS.buf&&!RKS.src){const s=ctx.createBufferSource();s.buffer=RKS.buf;s.loop=true;s.loopStart=4*240/182;s.loopEnd=Math.min(RKS.buf.duration-1,88*240/182);const g=ctx.createGain();g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(1.25,ctx.currentTime+.6);s.connect(g);g.connect(MU.bus);s.start();RKS.src=s;RKS.g=g;}
  if(!on&&RKS.src){const s=RKS.src,g=RKS.g;RKS.src=null;try{g.gain.setTargetAtTime(0,ctx.currentTime,.4);s.stop(ctx.currentTime+2);}catch(e){}}}
function rkPiano(t,notes,vol,len){const ctx=AU.ctx;const g=ctx.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(vol*.25,t+len*.6);g.gain.exponentialRampToValueAtTime(.0005,t+len);
  const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(5200,t);f.frequency.exponentialRampToValueAtTime(1400,t+len);f.connect(g);g.connect(MU.bus);g.connect(MU.verb);
  for(const n of notes){for(const [ty,m,v] of [['triangle',1,1],['square',2,.18],['sine',3,.12]]){const o=ctx.createOscillator();o.type=ty;o.frequency.value=MF(n)*m;o.detune.value=(Math.random()-.5)*6;const og=ctx.createGain();og.gain.value=v/notes.length;o.connect(og);og.connect(f);o.start(t);o.stop(t+len+.02);}}}
function rkBass(t,n,len){const ctx=AU.ctx;const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.2,t+.006);g.gain.exponentialRampToValueAtTime(.06,t+len*.5);g.gain.exponentialRampToValueAtTime(.0005,t+len);
  const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(1500,t);f.frequency.exponentialRampToValueAtTime(380,t+len);f.Q.value=1.5;f.connect(g);g.connect(MU.bus);
  for(const [ty,m,v] of [['triangle',1,1],['sawtooth',1,.35],['sine',.5,.5]]){const o=ctx.createOscillator();o.type=ty;o.frequency.value=MF(n)*m;const og=ctx.createGain();og.gain.value=v;o.connect(og);og.connect(f);o.start(t);o.stop(t+len+.02);}}
let SAXC=null;
function rkSax(t,n,len,bend,honk){const ctx=AU.ctx;if(!SAXC){SAXC=new Float32Array(512);for(let i=0;i<512;i++){const x=i/255.5-1;SAXC[i]=Math.tanh(x*2.4);}}
  const f0=MF(n);const out=ctx.createGain();out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(honk?.11:.085,t+.025);out.gain.setValueAtTime(honk?.1:.08,t+Math.max(.03,len-.06));out.gain.linearRampToValueAtTime(0,t+len);
  const sh=ctx.createWaveShaper();sh.curve=SAXC;const pk1=ctx.createBiquadFilter();pk1.type='peaking';pk1.frequency.value=1150;pk1.Q.value=1.2;pk1.gain.value=9;const pk2=ctx.createBiquadFilter();pk2.type='peaking';pk2.frequency.value=2600;pk2.Q.value=1.6;pk2.gain.value=6;
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=honk?4200:3400;const pre=ctx.createGain();pre.gain.value=honk?1.6:1.1;
  pre.connect(sh);sh.connect(pk1);pk1.connect(pk2);pk2.connect(lp);lp.connect(out);out.connect(MU.bus);out.connect(MU.verb);
  const vib=ctx.createOscillator(),vg=ctx.createGain();vib.frequency.value=5.6;vg.gain.setValueAtTime(0,t);vg.gain.linearRampToValueAtTime(len>.3?f0*.014:0,t+Math.min(.25,len));vib.connect(vg);
  for(const [ty,dt,v] of [['sawtooth',-6,.5],['sawtooth',7,.5],['square',0,.25]]){const o=ctx.createOscillator();o.type=ty;o.detune.value=dt;o.frequency.setValueAtTime(bend?f0*.943:f0,t);if(bend)o.frequency.exponentialRampToValueAtTime(f0,t+.07);vg.connect(o.frequency);const og=ctx.createGain();og.gain.value=v*.5;o.connect(og);og.connect(pre);o.start(t);o.stop(t+len+.02);}
  vib.start(t);vib.stop(t+len+.02);}
function rkWoo(t){const ctx=AU.ctx;const o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(520,t);o.frequency.exponentialRampToValueAtTime(980,t+.18);o.frequency.exponentialRampToValueAtTime(760,t+.7);
  const v=ctx.createOscillator(),vg=ctx.createGain();v.frequency.value=7;vg.gain.value=22;v.connect(vg);vg.connect(o.frequency);const out=ctx.createGain();out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(.09,t+.05);out.gain.linearRampToValueAtTime(0,t+.75);
  for(const [fr,q,gn] of [[420,6,1],[900,8,.5],[2600,10,.2]]){const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=fr;f.Q.value=q;const g=ctx.createGain();g.gain.value=gn;o.connect(f);f.connect(g);g.connect(out);}
  out.connect(MU.bus);out.connect(MU.verb);o.start(t);v.start(t);o.stop(t+.8);v.stop(t+.8);}
function rockTick(t,step){const e=spbR();const chorus=(step/96)|0,inC=step%96,bar=(inC/8)|0,b=inC%8,iv=RK.bars[bar],root=57+iv;// A3 = 57
  const honkChorus=chorus%2===1;
  // drums: big kick on 1 and 3, a cracking backbeat, eighth-note hats, crash at the top, snare fill into the turnaround
  if(b===0||b===4)drum(t,58,.8,.3,0);if(b===2||b===6)snare(t,.62);if(b===7&&bar%4===3)drum(t+e*.5,60,.4,.2,0);
  hat(t,b%2?.06:.11,.045);if(inC===0)crash(t,.22);if(bar===11&&b>=4)snare(t+e*.5,.35+b*.04);
  // the boogie-woogie walk, straight eighths
  rkBass(t,root-12+BOOG[b],e*.92);
  // hammered piano: the chord in the right hand on every eighth, accented on the beat, a run up the keys to close each chorus
  const tri=[root+12,root+16,root+19,root+22];rkPiano(t,b%2?tri.slice(0,3):tri,b%2?.07:.1,e*.9);
  if(bar===11)rkPiano(t+e*.5,[root+24+[0,4,7,10,12,16,19,24][b]],.05,e*.4);
  // the tune (first time round), then a honking sax chorus over the changes
  if(!honkChorus){for(const [s0,len,nm,bend] of TUNE[bar])if(s0===b)rkSax(t,NN[nm],e*len*.95,!!bend,false);}
  else{const pat=[[0,1,12],[1,1,12],[2,2,12,1],[4,1,10],[5,1,12],[6,2,7]];for(const [s0,len,ofs,bend] of pat)if(s0===b)rkSax(t,root+ofs,e*len*.92,!!bend,true);if(inC===0)rkWoo(t-.05);}}

function musicTick(){const ctx=AU.ctx;if(!ctx||!MU.on)return;const spb=MU.boss?spbB():60/(70+MU.int*34)/2;// eighth notes, quicker when it gets hairy
  if(MU.next<ctx.currentTime)MU.next=ctx.currentTime+.05;
  while(MU.next<ctx.currentTime+.25){const t=MU.next,s=MU.step%16,ci=MU.bar%8,ch=PROG[ci];
    if(MU.rock){rockLoad();if(RKS.buf){rockPlay(true);MU.next=ctx.currentTime+.25;break;}rockTick(t,MU.step);MU.next+=spbR();MU.step++;continue;}
    if(RKS.src)rockPlay(false);
    if(MU.boss){bossTick(t,s,MU.bar);MU.next+=spb;MU.step++;if(MU.step%16===0)MU.bar++;continue;}
    if(s===0){organ(t,ch,spb*16+.4);for(const o of MU.drone)o.frequency.setTargetAtTime(MF(BASS[ci]-12),t,.4);if(Math.random()<.35)theremin(t+spb*4);}
    if(s%2===0||Math.random()<.3){const pat=[0,1,2,1,2,3,2,1];let n=ch[pat[(s>>1)%8]%ch.length]+12;if(s===14&&Math.random()<.5)n+=1;// the odd wrong-sounding semitone
      if(Math.random()<.85)musicBox(t,n);}
    if(MU.int>.35&&(s===0||s===8))heart(t,.12+.18*MU.int);
    if(MU.int>.65&&(s===3||s===11))stab(t,ch);
    if(MU.int>.8&&s%4===2)heart(t,.08);
    MU.next+=spb;MU.step++;if(MU.step%16===0)MU.bar++;}}
// ================================================================ the storm: lightning forking down on the horizon, the sky and town flashing, thunder rolling in after the distance delay
const STORM=(()=>{const st={next:6+Math.random()*6,flash:0,seq:[],t:0,bolts:[],base:{hemi:.62,fog:new THREE.Color(0x2b2530)}};
  const boltLight=new THREE.DirectionalLight(0xd4ddff,0);scene.add(boltLight);scene.add(boltLight.target);
  const tex=canvasTex(8,64,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.42,'rgba(255,255,255,.6)');gr.addColorStop(.5,'rgba(255,255,255,1)');gr.addColorStop(.58,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);},{srgb:false});
  const matCore=new THREE.MeshBasicMaterial({map:tex,color:0xf4f6ff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});
  const matGlow=new THREE.MeshBasicMaterial({map:tex,color:0x6f86ff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});
  // a jagged path by midpoint displacement
  function jag(a,b,rough,depth){if(depth===0)return [a,b];const m=a.clone().lerp(b,.5+(Math.random()-.5)*.2);const L=a.distanceTo(b);m.x+=(Math.random()-.5)*L*rough;m.z+=(Math.random()-.5)*L*rough;m.y+=(Math.random()-.5)*L*rough*.3;
    const l=jag(a,m,rough,depth-1),r=jag(m,b,rough,depth-1);return l.concat(r.slice(1));}
  function ribbon(pts,w,cam,mat){const pos=[],uv=[],idx=[];const tg=new THREE.Vector3(),sd=new THREE.Vector3();
    for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];tg.subVectors(b,a);sd.subVectors(cam,pts[i]);sd.crossVectors(tg,sd).normalize();const ww=w*(1-.55*i/pts.length);
      pos.push(pts[i].x+sd.x*ww,pts[i].y+sd.y*ww,pts[i].z+sd.z*ww,pts[i].x-sd.x*ww,pts[i].y-sd.y*ww,pts[i].z-sd.z*ww);uv.push(0,0,0,1);if(i){const k=(i-1)*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);const m=new THREE.Mesh(g,mat);m.frustumCulled=false;m.renderOrder=4;scene.add(m);return m;}
  function strike(forceNear){const cam=new THREE.Vector3();camera.getWorldPosition(cam);const fw=new THREE.Vector3();camera.getWorldDirection(fw);
    // usually somewhere you can see it; now and again right over the town
    const yaw=Math.atan2(fw.x,fw.z)+(Math.random()-.5)*(Math.random()<.7?1.6:5);const dist=forceNear?70+Math.random()*60:Math.random()<.15?90+Math.random()*90:170+Math.random()*260;
    const gx=cam.x+Math.sin(yaw)*dist,gz=cam.z+Math.cos(yaw)*dist,gy=Math.max(0,H(gx,gz));const top=new THREE.Vector3(gx+(Math.random()-.5)*80,gy+230+Math.random()*60,gz+(Math.random()-.5)*80);
    const main=jag(top,new THREE.Vector3(gx,gy,gz),.32,6);const meshes=[ribbon(main,1.1+dist*.004,cam,matCore),ribbon(main,6+dist*.02,cam,matGlow)];
    for(let k=0;k<2+(Math.random()*3|0);k++){const i0=2+(Math.random()*(main.length*.6)|0);const a=main[i0];const b=a.clone().add(new THREE.Vector3((Math.random()-.5)*90,-(30+Math.random()*70),(Math.random()-.5)*90));const br=jag(a,b,.4,4);meshes.push(ribbon(br,.5+dist*.002,cam,matCore),ribbon(br,3+dist*.01,cam,matGlow));}
    st.bolts.push({meshes,life:.55});
    // the flicker: a main flash, a dark gap, a restrike or two
    const t0=st.t;st.seq=[[t0,1],[t0+.06,.15],[t0+.11,.85],[t0+.2,.1],[t0+.28,Math.random()<.6?.7:0],[t0+.36,.05],[t0+.5,0]];
    boltLight.position.set(top.x,top.y,top.z);boltLight.target.position.set(cam.x,0,cam.z);st.dir=new THREE.Vector3(gx-cam.x,60,gz-cam.z).normalize();st.near=dist<150;
    setTimeout(()=>thunder(dist,gx,gz),dist/343*1000);}
  function thunder(dist,x,z){if(!AU.ctx)return;const ctx=AU.ctx,t=ctx.currentTime;const near=dist<160;const vol=clamp(1.4-dist/400,.35,1.2);
    const out=ctx.createGain();out.gain.value=vol;const pan=ctx.createStereoPanner?ctx.createStereoPanner():null;
    if(pan){const fw=new THREE.Vector3();camera.getWorldDirection(fw);const cp=new THREE.Vector3();camera.getWorldPosition(cp);const rx=-fw.z,rz=fw.x;const dx=x-cp.x,dz=z-cp.z,l=Math.hypot(dx,dz)||1;pan.pan.value=clamp((dx*rx+dz*rz)/l*.8,-.8,.8);out.connect(pan);pan.connect(AU.master);}else out.connect(AU.master);
    if(near){// the crack of a close strike
      const n=ctx.createBufferSource();n.buffer=AU.noise;const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=900;const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.9,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+.45);n.connect(f);f.connect(g);g.connect(out);n.start(t,Math.random());n.stop(t+.5);}
    // the long rumble: low-passed noise with rolling swells
    const dur=4.5+Math.random()*3.5;for(const [fc,gain,rate] of [[90,1.1,1],[220,.55,1.6],[480,.18,2.4]]){const n=ctx.createBufferSource();n.buffer=AU.noise;n.loop=true;n.playbackRate.value=.6+Math.random()*.2;
      const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(fc*(near?2.2:1.3),t);f.frequency.exponentialRampToValueAtTime(fc*.7,t+dur);f.Q.value=.7;
      const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);let tt=t+(near?.02:.25);g.gain.exponentialRampToValueAtTime(gain,tt);
      while(tt<t+dur){const nt=tt+(.25+Math.random()*.6)/rate;g.gain.linearRampToValueAtTime(gain*(.25+Math.random()*.75)*Math.max(.05,1-(nt-t)/dur),nt);tt=nt;}
      g.gain.linearRampToValueAtTime(.0001,t+dur+.4);n.connect(f);f.connect(g);g.connect(out);n.start(t,Math.random());n.stop(t+dur+.5);}}
  function update(dt){st.t+=dt;if(OPT.storm!==false&&(state==='play'||state==='menu')){st.next-=dt;if(st.next<=0){st.next=(OPT.tod==='night'?9:12)+Math.random()*20;strike(false);}}
    // flicker level from the sequence
    let f=0;for(let i=0;i<st.seq.length;i++){if(st.t>=st.seq[i][0])f=st.seq[i][1];}st.flash=f*(.85+.15*Math.random());
    for(let i=st.bolts.length-1;i>=0;i--){const b=st.bolts[i];b.life-=dt;const vis=b.life>0&&st.flash>.08;for(const m of b.meshes){m.visible=vis;m.material.opacity=Math.min(1,st.flash*1.3);}
      if(b.life<=0){for(const m of b.meshes){scene.remove(m);m.geometry.dispose();}st.bolts.splice(i,1);}}
    const fl=st.flash,night=OPT.tod==='night';hemi.intensity=st.base.hemi+fl*(night?1.1:1.4);boltLight.intensity=fl*(night?2.2:2.8);
    _stc.copy(st.base.fog).lerp(_stw,fl*(night?.28:.35));scene.fog.color.copy(_stc);scene.background.copy(_stc);
    if(SKYU&&SKYU.flash){SKYU.flash.value=fl;if(st.dir)SKYU.fdir.value.copy(st.dir);}}
  return {update,strike,st};})();
const _stc=new THREE.Color(),_stw=new THREE.Color(0x9aa6d8);
function musicStart(){setTimeout(()=>rockLoad(),500);audioInit();if(!AU.ctx)return;musicInit();if(MU.on)return;MU.on=true;MU.next=0;MU.bar=0;MU.step=0;if(!MU.timer)MU.timer=setInterval(musicTick,90);}
function musicSetVol(){if(MU.bus)MU.bus.gain.setTargetAtTime(OPT.music===false?0:.55,AU.ctx.currentTime,.2);}
function musicIntensity(dt){if(MU.dg&&MU.rock){MU.dg.gain.value=0;return;}let near=0;for(const z of Z){if(z.dead)continue;const d=Math.hypot(z.x-PL.x,z.z-PL.z);if(d<30)near+=1-d/30;}
  const want=state==='play'?clamp(near/5,0,1):0;MU.int+=(want-MU.int)*Math.min(1,dt*.6);if(MU.dg)MU.dg.gain.value=.04+.04*MU.int;}
function siren(){for(let k=0;k<3;k++)setTimeout(()=>{tone(520,760,.45,.08,'sawtooth');setTimeout(()=>tone(760,520,.45,.08,'sawtooth'),460);},k*920);}

// ================================================================ the laser gun
const _v1=new THREE.Vector3(),_v2=new THREE.Vector3(),_v3=new THREE.Vector3(),_q1=new THREE.Quaternion(),_m1=new THREE.Matrix4(),_m2=new THREE.Matrix4();
const GUN=(()=>{const g=new THREE.Group();const dark=lam({color:0x23262d}),steel=lam({color:0x8a929c});
  const body=new THREE.Mesh(new THREE.BoxGeometry(.06,.07,.24),dark);body.position.z=-.06;g.add(body);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.045,.12,.06),dark);grip.position.set(0,-.08,.02);grip.rotation.x=.3;g.add(grip);
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.018,.022,.16,10),steel);barrel.rotation.x=Math.PI/2;barrel.position.set(0,.01,-.24);g.add(barrel);
  const coilM=new THREE.MeshBasicMaterial({color:0x43f0ff});for(let k=0;k<3;k++){const c=new THREE.Mesh(new THREE.TorusGeometry(.03,.007,6,16),coilM);c.position.set(0,.01,-.12-k*.045);g.add(c);}
  const lens=new THREE.Mesh(new THREE.CircleGeometry(.016,12),new THREE.MeshBasicMaterial({color:0xffa030}));lens.position.set(0,.01,-.321);lens.rotation.y=Math.PI;g.add(lens);
  const heatM=new THREE.MeshBasicMaterial({color:0x43f0ff});const strip=new THREE.Mesh(new THREE.BoxGeometry(.008,.012,.2),heatM);strip.position.set(.032,.02,-.07);g.add(strip);
  const label=new THREE.Mesh(new THREE.PlaneGeometry(.05,.016),new THREE.MeshBasicMaterial({map:canvasTex(128,40,(c,w,h)=>{c.fillStyle='#111';c.fillRect(0,0,w,h);c.fillStyle='#43f0ff';c.font='700 26px Barlow,sans-serif';c.fillText('fs-LZR 01',8,29);})}));label.position.set(-.0305,.005,-.06);label.rotation.y=-Math.PI/2;g.add(label);
  const hoseM=lam({color:0x15171b});const hc=new THREE.CatmullRomCurve3([new THREE.Vector3(0,-.02,.06),new THREE.Vector3(.01,-.09,.16),new THREE.Vector3(.04,-.3,.22),new THREE.Vector3(.1,-.6,.3)]);g.add(new THREE.Mesh(new THREE.TubeGeometry(hc,24,.014,6),hoseM));
  for(let k=1;k<12;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(.016,.004,4,10),hoseM);const p=hc.getPointAt(k/12),t=hc.getTangentAt(k/12);r.position.copy(p);r.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),t);g.add(r);}
  const hand=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.09,8),lam({color:0x3a3f48}));hand.rotation.z=Math.PI/2;hand.position.set(0,-.045,-.2);g.add(hand);
  const muzzle=new THREE.Object3D();muzzle.position.set(0,.01,-.33);g.add(muzzle);return {g,coilM,heatM,muzzle};})();
const BEAM=(()=>{const core=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,1,6,1,true),new THREE.MeshBasicMaterial({color:0xffe8ff,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  const glow=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,1,8,1,true),new THREE.MeshBasicMaterial({color:0xff3d8b,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
  const g=new THREE.Group();g.add(core,glow);g.visible=false;scene.add(g);const spot=new THREE.PointLight(0xff7a2a,0,11,1.6);scene.add(spot);return {g,core,glow,spot};})();
// ================================================================ the beam as a proton-style stream: a writhing white-hot core in an orange-red sheath, blue lightning crackling round it, whipping behind your aim
const STREAM=(()=>{const tex=canvasTex(8,64,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.35,'rgba(255,255,255,.55)');gr.addColorStop(.5,'rgba(255,255,255,1)');gr.addColorStop(.65,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);},{srgb:false});
  const N=56;const mk=(color,op,w,n=N)=>{const pos=new Float32Array(n*2*3),uv=new Float32Array(n*2*2),idx=[];for(let i=0;i<n;i++){uv[i*4]=i/(n-1);uv[i*4+1]=0;uv[i*4+2]=i/(n-1);uv[i*4+3]=1;if(i<n-1){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tex,color,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:true,fog:false,side:THREE.DoubleSide}));m.frustumCulled=false;m.visible=false;m.renderOrder=5;scene.add(m);return {m,pos,n,w,op,pts:Array.from({length:n},()=>new THREE.Vector3())};};
  const glow=mk(0xff3a12,.5,.9),sheath=mk(0xff7a18,.85,.34),core=mk(0xfff3c8,1,.11);const baseW=[glow,sheath,core].map(r=>r.w);
  const arcs=[0,1,2,3].map(k=>Object.assign(mk(k%2?0x9fd8ff:0x5aa8ff,.95,.045,40),{jit:new Float32Array(40*2),jt:0,ph:k*1.7,r:.2+k*.05}));
  const tipS=new THREE.Vector3();let live=0,time=0;
  const A=new THREE.Vector3(),D=new THREE.Vector3(),C=new THREE.Vector3(),e1=new THREE.Vector3(),e2=new THREE.Vector3(),tg=new THREE.Vector3(),cam=new THREE.Vector3(),sd=new THREE.Vector3(),q=new THREE.Vector3(),p1=new THREE.Vector3();
  function lay(rb,f,wf){const {pos,n,pts}=rb;for(let i=0;i<n;i++)f(i/(n-1),pts[i]);
    for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];tg.subVectors(b,a);sd.subVectors(cam,pts[i]);sd.crossVectors(tg,sd).normalize();const w=rb.w*wf(i/(n-1))/2;
      pos[i*6]=pts[i].x+sd.x*w;pos[i*6+1]=pts[i].y+sd.y*w;pos[i*6+2]=pts[i].z+sd.z*w;pos[i*6+3]=pts[i].x-sd.x*w;pos[i*6+4]=pts[i].y-sd.y*w;pos[i*6+5]=pts[i].z-sd.z*w;}
    rb.m.geometry.attributes.position.needsUpdate=true;}
  function update(dt,on,surge){time+=dt;const want=on?1:0;live+=(want-live)*Math.min(1,dt*(on?30:9));const vis=live>.03;
    for(const rb of [glow,sheath,core,...arcs])rb.m.visible=vis;BEAM.spot.intensity=vis?(5+3*surge)*live:0;if(!vis){tipS.copy(LZ.tip);return;}
    const MZ=aimMuzzle();MZ.getWorldPosition(A);if(renderer.xr.isPresenting||HV.on){MZ.getWorldQuaternion(_q1);D.set(0,0,-1).applyQuaternion(_q1);}else camera.getWorldDirection(D);camera.getWorldPosition(cam);
    if(tipS.distanceToSquared(LZ.tip)>900)tipS.copy(LZ.tip);tipS.lerp(LZ.tip,1-Math.exp(-dt*11));// the whip: the far end lags behind your aim
    const L=Math.max(1,A.distanceTo(tipS));p1.copy(A).addScaledVector(D,L*.5);C.subVectors(tipS,A).normalize();e1.crossVectors(C,_UP);if(e1.lengthSq()<1e-4)e1.set(1,0,0);e1.normalize();e2.crossVectors(C,e1).normalize();
    const amp=(1+.6*surge);
    const path=(t,out,k=0)=>{const u=1-t;out.set(0,0,0).addScaledVector(A,u*u).addScaledVector(p1,2*u*t).addScaledVector(tipS,t*t);const d=t*L;
      const env=Math.min(.055*d,.9)*Math.min(1,(1-t)*L/3+.15);// grows from the nozzle, settles where it lands
      const s1=Math.sin(d*.9-time*24+k)+.5*Math.sin(d*2.3-time*39+k*2)+.25*Math.sin(d*5.1+time*55),s2=Math.cos(d*.7-time*18+k)+.45*Math.sin(d*1.9+time*31)+.25*Math.cos(d*4.3-time*47);
      out.addScaledVector(e1,s1*amp*env*.65).addScaledVector(e2,s2*amp*env*.55);return out;};
    {const k=HV.on?1.7:1;[glow,sheath,core].forEach((r,i)=>r.w=baseW[i]*k);}
    const taper=t=>(.12+.88*Math.min(1,t*4))*(1+.35*surge)*(.9+.2*Math.sin(t*40-time*60));
    lay(glow,(t,o)=>path(t,o),t=>taper(t)*1.15);lay(sheath,(t,o)=>path(t,o,.15),taper);lay(core,(t,o)=>path(t,o,.05),t=>taper(t)*(.8+.4*Math.random()));
    glow.m.material.opacity=.55*live*(.75+.25*surge);sheath.m.material.opacity=.85*live;core.m.material.opacity=live;
    for(const a of arcs){a.jt-=dt;if(a.jt<=0){a.jt=.035+Math.random()*.04;for(let i=0;i<a.jit.length;i++)a.jit[i]=(Math.random()-.5)*.16;a.ph+=Math.random()*2;a.on=Math.random()<.8;}
      a.m.visible=a.on;const r=a.r*(1+.5*surge);
      lay(a,(t,o)=>{path(t,o);const i=Math.round(t*(a.n-1));const ang=t*L*1.4+time*24+a.ph;const env=Math.min(1,t*6)*Math.min(1,(1-t)*4+.2);o.addScaledVector(e1,(Math.cos(ang)*r+a.jit[i*2])*env).addScaledVector(e2,(Math.sin(ang)*r+a.jit[i*2+1])*env);return o;},t=>1);
      a.m.material.opacity=.95*live;}
    // sparks spitting at the nozzle and splashing where the stream lands
    if(on&&Math.random()<.7)PFX.add(A.x,A.y,A.z,D.x*2+(Math.random()-.5)*1.5,Math.random()*1.5,D.z*2+(Math.random()-.5)*1.5,Math.random()<.5?0xffb040:0x8fd0ff,.035,.18);
    if(on)for(let k=0;k<2;k++)PFX.add(tipS.x,tipS.y,tipS.z,(Math.random()-.5)*5,Math.random()*3.5,(Math.random()-.5)*5,Math.random()<.6?0xff8a1e:0x8fd0ff,.08,.35);
    BEAM.spot.position.copy(tipS);}
  return {update};})();
const LZ={rep:10,pT:0,flash:0,tip:new THREE.Vector3(),sink:1,heat:0,over:false,firing:false,dmg:1,cool:1,pierce:1,assist:0,shots:0,onTarget:0,coolT:0};

// ================================================================ zombies: a jointed body (hips, spine, neck, shoulders, elbows, knees), drawn as instanced parts (15 draw calls for the whole horde)
const ZMAX=48;const Z=[];const ZT={walker:{hp:45,spd:[1.7,2.4],dmg:13,sc:1,stride:1.25},runner:{hp:30,spd:[4.2,4.9],dmg:10,sc:.95,stride:2.5},brute:{hp:190,spd:[1.35,1.7],dmg:26,sc:1.38,stride:1.45}};
const PARTS=(()=>{const mk=(w,h,d,oy,oz=0)=>{const g=new THREE.BoxGeometry(w,h,d);g.translate(0,oy,oz);return g;};
  const defs={pelvis:mk(.42,.2,.25,.02),torso:mk(.48,.56,.27,.28),head:mk(.28,.31,.29,.16,-.02),uarmL:mk(.12,.34,.12,-.16),uarmR:mk(.12,.34,.12,-.16),farmL:mk(.105,.36,.105,-.17),farmR:mk(.105,.36,.105,-.17),
    thighL:mk(.17,.45,.17,-.21),thighR:mk(.17,.45,.17,-.21),shinL:mk(.15,.44,.15,-.21),shinR:mk(.15,.44,.15,-.21),footL:mk(.14,.08,.26,-.04,-.05),footR:mk(.14,.08,.26,-.04,-.05)};
  const out={};for(const [k,geo] of Object.entries(defs)){const m=new THREE.InstancedMesh(geo,lam({color:0xffffff}),ZMAX);m.count=0;m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(m);out[k]={m};}
  const eyes=new THREE.InstancedMesh(new THREE.BoxGeometry(.2,.04,.02),new THREE.MeshBasicMaterial({color:0xd6ff4a}),ZMAX);eyes.count=0;eyes.frustumCulled=false;scene.add(eyes);out.eyes={m:eyes};
  const jaw=new THREE.InstancedMesh(new THREE.BoxGeometry(.16,.05,.03),new THREE.MeshBasicMaterial({color:0x1a0c0c}),ZMAX);jaw.count=0;jaw.frustumCulled=false;scene.add(jaw);out.jaw={m:jaw};return out;})();
const SHIRTS=[0x5a3b3b,0x2f4a5c,0x4d5a32,0x6b5a3a,0x3a3a46,0x7a3b22,0x2b3d2f,0x5c4e6a,0x6a6a6a,0x8a7a5a];const SKIN=[0x8fa07e,0x9aa58a,0x7f9479,0xa3a98d,0x93897a];
function spawnZombie(x,z,type){if(Z.length>=ZMAX)return null;const T=ZT[type];const near=Math.hypot(x-PL.x,z-PL.z)<48;
  const zz={x,z,y:H(x,z),h:Math.random()*6,type,hp:T.hp*DIFF.hp,max:T.hp*DIFF.hp,spd:(T.spd[0]+Math.random()*(T.spd[1]-T.spd[0]))*DIFF.spd,dmg:T.dmg,sc:T.sc*(.93+Math.random()*.14),stride:T.stride,
    ph:Math.random()*6,t:Math.random()*10,dead:0,flash:0,stag:0,atk:0,rise:(type!=='runner'&&near&&Math.random()<.45)?1:0,
    limp:Math.random()<.35?(Math.random()<.5?-1:1):0,dangle:Math.random()<.3?(Math.random()<.5?-1:1):0,tilt:(Math.random()-.5)*.5,seed:Math.random()*100,reach:.95+Math.random()*.45,
    shirt:SHIRTS[(Math.random()*SHIRTS.length)|0],skin:SKIN[(Math.random()*SKIN.length)|0],trou:[0x23262c,0x2e2a24,0x30384a,0x3b3328][(Math.random()*4)|0],groanT:2+Math.random()*6,stuck:0,lx:x,lz:z};
  if(zz.rise){zz.groanT=.3;}Z.push(zz);return zz;}
const _c=new THREE.Color(),_W=new THREE.Color(0xffffff),_CY=new THREE.Color(0x43f0ff),_E=new THREE.Euler(),_Tm=new THREE.Matrix4(),_Rm=new THREE.Matrix4();
const JM={};for(const k of ['root','pel','tor','head','shL','elL','shR','elR','hipL','knL','hipR','knR','anL','anR'])JM[k]=new THREE.Matrix4();
function joint(out,parent,x,y,z,rx,ry,rz){_Tm.makeTranslation(x,y,z);_E.set(rx,ry,rz,'YXZ');_Rm.makeRotationFromEuler(_E);return out.multiplyMatrices(parent,_Tm).multiply(_Rm);}
const easeO=t=>1-(1-t)*(1-t);
function drawZombies(){const n=Z.length;for(const k in PARTS)PARTS[k].m.count=n;
  Z.forEach((z,i)=>{const run=z.type==='runner',brute=z.type==='brute';const ph=z.ph,s1=Math.sin(ph),c1=Math.cos(ph),tt=z.t;
    // ---- the gait: stride swing, knee lift on the swing, a limp, a drag, a shuffle
    const A=run?.78:brute?.42:.5;const kb=run?1.45:brute?.55:.75;
    let thL=A*s1,thR=-A*s1,knL=kb*Math.max(0,c1)+.08,knR=kb*Math.max(0,-c1)+.08;
    if(z.limp){const lim=z.limp<0;if(lim){thL=thL*.45-.12;knL=.1;}else{thR=thR*.45-.12;knR=.1;}}
    let hipY=(run?.84:.86)-Math.abs(c1)*(run?.05:.035);let pitch=0,roll=(z.limp?z.limp*.05*Math.max(0,z.limp<0?s1:-s1):0)+(brute?.04*s1:0),lean=run?-.42:brute?-.12:-.22-.06*Math.sin(ph*2);
    let torTw=.14*s1*(run?1.3:1),torRoll=.05*s1,headRx=.25+(run?.35:0),headRz=z.tilt+.18*Math.sin(tt*.7+z.seed)+(Math.sin(tt*5.3+z.seed)>.97?.35:0),jaw=.02+.04*Math.max(0,Math.sin(tt*3+z.seed));
    // arms: reaching out in front, one dangling, runners pump, brutes spread wide
    let shL=z.reach*(1.25+.12*Math.sin(tt*1.3+z.seed)),shR=z.reach*(1.25+.12*Math.sin(tt*1.1+z.seed+1)),elL=.12+.1*Math.sin(tt*.9+z.seed),elR=.12+.1*Math.sin(tt*1.2+z.seed),aRL=.06,aRR=-.06;
    if(z.dangle<0){shL=.25*Math.sin(ph+Math.PI)+.1;elL=.15;}if(z.dangle>0){shR=.25*s1+.1;elR=.15;}
    if(run){shL=.85*Math.sin(ph+Math.PI)+.25;shR=.85*s1+.25;elL=1.5;elR=1.5;aRL=.12;aRR=-.12;}
    if(brute){aRL=.38;aRR=-.38;shL=.95+.15*Math.sin(tt*1.4);shR=.95+.15*Math.sin(tt*1.4+2);elL=elR=.35;}
    // attacking: claw at you
    if(z.atk>0){const w=Math.sin(tt*10);shL=1.35+.7*w;shR=1.35-.7*w;elL=.6;elR=.6;lean-=.25;thL=thR=.05;knL=knR=.15;hipY=.84;}
    // hit by a pulse: rock back
    if(z.stag>0){lean+=.55*z.stag;headRx-=.5*z.stag;shL-=.5*z.stag;shR-=.5*z.stag;}
    // climbing up out of the ground
    let yOff=0;if(z.rise>0){const r=z.rise;yOff=-1.75*Math.pow(r,1.4);shL=shR=2.7-1.2*(1-r);elL=elR=.3;lean=-.5*r;headRx=-.4*r;}
    // dying: knees go, then down it goes
    let fallX=0,sink=0;if(z.dead>0){const d=z.dead;const b=Math.min(1,d/.35);knL=knR=lerp(knL,1.7,b);thL=thR=lerp(thL,.9,b);hipY=lerp(hipY,.55,b);lean=lerp(lean,-.6,b);shL=shR=lerp(shL,.4,b);headRx+=.4*b;
      fallX=-1.45*easeO(clamp((d-.3)/.55,0,1));sink=clamp((d-.85)/.5,0,1);}
    const sc=z.sc;_v3.set(sc,sc*(1-sink*.9),sc);_m1.compose(_v1.set(z.x,z.y+yOff-sink*.4,z.z),_q1.setFromEuler(_E.set(fallX,z.h,0,'YXZ')),_v3);JM.root.copy(_m1);
    const hw=brute?.16:.12;
    joint(JM.pel,JM.root,0,hipY,0,pitch,-torTw*.5,roll);joint(JM.tor,JM.pel,0,.1,0,lean,torTw,torRoll);joint(JM.head,JM.tor,0,.56,-.02,headRx,Math.sin(tt*.5+z.seed)*.25,headRz);
    joint(JM.shL,JM.tor,-.3,.5,0,shL,0,aRL);joint(JM.elL,JM.shL,0,-.33,0,elL,0,0);joint(JM.shR,JM.tor,.3,.5,0,shR,0,aRR);joint(JM.elR,JM.shR,0,-.33,0,elR,0,0);
    joint(JM.hipL,JM.pel,-hw,0,0,thL,0,.03);joint(JM.knL,JM.hipL,0,-.43,0,-knL,0,0);joint(JM.anL,JM.knL,0,-.42,0,knL-thL,0,0);
    joint(JM.hipR,JM.pel,hw,0,0,thR,0,-.03);joint(JM.knR,JM.hipR,0,-.43,0,-knR,0,0);joint(JM.anR,JM.knR,0,-.42,0,knR-thR,0,0);
    const set=(k,M,hex)=>{const P=PARTS[k].m;P.setMatrixAt(i,M);if(hex!=null){_c.setHex(hex);if(z.flash>0)_c.lerp(_W,.85);else if(z.dead>0)_c.lerp(_CY,Math.min(1,z.dead*.8));P.setColorAt(i,_c);}};
    set('pelvis',JM.pel,z.trou);set('torso',JM.tor,z.shirt);set('head',JM.head,z.skin);set('uarmL',JM.shL,z.dangle<0?z.skin:z.shirt);set('uarmR',JM.shR,z.dangle>0?z.skin:z.shirt);set('farmL',JM.elL,z.skin);set('farmR',JM.elR,z.skin);
    set('thighL',JM.hipL,z.trou);set('thighR',JM.hipR,z.trou);set('shinL',JM.knL,z.trou);set('shinR',JM.knR,z.trou);set('footL',JM.anL,0x1c1d20);set('footR',JM.anR,0x1c1d20);
    _m2.copy(JM.head).multiply(_Tm.makeTranslation(0,.2,-.165));PARTS.eyes.m.setMatrixAt(i,_m2);_m2.copy(JM.head).multiply(_Tm.makeTranslation(0,.06-jaw,-.165));PARTS.jaw.m.setMatrixAt(i,_m2);
    // remember where the head and chest really are, for the laser
    _v1.set(0,.16,0).applyMatrix4(JM.head);z.hx=_v1.x;z.hy=_v1.y;z.hz=_v1.z;_v1.set(0,.3,0).applyMatrix4(JM.tor);z.cx=_v1.x;z.cy=_v1.y;z.cz=_v1.z;z.pT=T;});
  for(const k in PARTS){PARTS[k].m.instanceMatrix.needsUpdate=true;if(PARTS[k].m.instanceColor)PARTS[k].m.instanceColor.needsUpdate=true;}}

// ================================================================ missions
const MISSIONS=[
  {id:'m1',title:'Last orders',blurb:"Start outside Friar Tuck's on Church Street. Get down Queen Street and along Seaview to the evac helicopter at Warrenpoint Baths.",start:[40,-12],end:[372,234],endName:'Warrenpoint Baths',hold:30},
  {id:'m2',title:'The Clonallan run',blurb:'Start on Clonallan Road at the top of the town. Fight down through the estates and Summer Hill to the evac helicopter on The Square.',start:[594,-252],end:[-42,-12],endName:'The Square',hold:36},
  {id:'m3',title:'Down to the harbour',blurb:'Start on the Upper Dromore Road. Down Duke Street, past The Square, to the helicopter pick-up at the harbour.',start:[138,-394],end:[-72,52],endName:'the harbour',hold:40}];
const DIFFS={easy:{name:'Easy',hp:.65,spd:.9,dmg:.55,cap:20,horde:9,run:.6},normal:{name:'Normal',hp:1,spd:1,dmg:.85,cap:28,horde:12,run:1},hard:{name:'Hard',hp:1.3,spd:1.12,dmg:1.45,cap:42,horde:18,run:1.6}};
let PICKD=null;let MIS=MISSIONS[0],DIFF=DIFFS.normal,dkey='normal';
// levels: every region starts at level 1 (the old Easy). Each level won adds 20% more zombies, more aggression and bigger hordes.
let LEVEL={};try{LEVEL=JSON.parse(localStorage.getItem('wpu-lv')||'{}');}catch(e){}const saveLv=()=>{try{localStorage.setItem('wpu-lv',JSON.stringify(LEVEL));}catch(e){}};
const lvOf=m=>Math.max(1,LEVEL[(m||MIS).id]|0);
function levelDiff(n){const f=Math.pow(1.2,n-1);const b=DIFFS.easy;return {name:'Level '+n,lv:n,hp:b.hp,spd:b.spd*Math.min(f,1.6),dmg:b.dmg*f,cap:Math.min(70,Math.round(b.cap*f)),horde:Math.min(45,Math.round(b.horde*f)),run:Math.min(3,b.run*f)};}
function useLevel(){const n=lvOf();DIFF=levelDiff(n);dkey='L'+n;}
try{const s=JSON.parse(localStorage.getItem('wpu-opt')||'{}');if(s.m)MIS=MISSIONS.find(m=>m.id===s.m)||MIS;if(s.d&&DIFFS[s.d]){DIFF=DIFFS[s.d];dkey=s.d;}}catch(e){}
const saveOpt=()=>{try{localStorage.setItem('wpu-opt',JSON.stringify({m:MIS.id}));}catch(e){}};
let BEST={};try{BEST=JSON.parse(localStorage.getItem('wpu-best')||'{}');}catch(e){}

// ================================================================ game state
const PL={x:0,z:0,yaw:0,pitch:0,hp:100,maxhp:100,stam:1,run:false,bob:0,stepT:0,hurtT:0,regenT:0};
let state='loading',T=0,kills=0,dmgTaken=0,holdT=0,hordeT=0,spawnT=0,flowT=0,msgT=0,PICKS=[],START=null,END=null,totalDist=1,extract=null;
const $=id=>document.getElementById(id);
function msg(t,d=2.2){$('msg').textContent=t;$('msg').style.opacity=1;msgT=d;VRHUD.msg=t;VRHUD.msgT=d;}
function startMission(){BON.practice=false;if(!PICKD)useLevel();audioInit();musicStart();VRM.close();BON.active=false;BON.done=false;BON.saved=false;BON.phase='';NPC.g.visible=false;MU.rock=false;TGT=PL;FADE.visible=false;FADE.material.opacity=0;TT.length=0;PL.ride=null;$('tJump').hidden=true;Z.length=0;GH.length=0;ghostsBusted=0;kills=0;dmgTaken=0;T=0;holdT=0;hordeT=40;spawnT=0;flowT=0;PL.maxhp=100+20*UPG.armour;PL.hp=PL.maxhp;PL.stam=1;LZ.heat=0;LZ.over=false;LZ.dmg=1+.25*UPG.power;LZ.cool=1/(1-.18*UPG.cool);LZ.sink=1+.3*UPG.sink;LZ.pierce=1+UPG.optics;LZ.assist=UPG.optics?.05:0;LZ.shots=0;LZ.onTarget=0;applyTod();
  START=snapWalk(...MIS.start);END=snapWalk(...MIS.end);PL.x=START[0];PL.z=START[1];PL.yaw=Math.atan2(-(END[0]-START[0]),-(END[1]-START[1]));PL.pitch=0;rig.rotation.y=PL.yaw;totalDist=Math.hypot(END[0]-START[0],END[1]-START[1]);
  placePicks();extractBuild();flowField(PL.x,PL.z);if(renderer.xr.isPresenting){camera.getWorldPosition(_v1);rig.position.x+=PL.x-_v1.x;rig.position.z+=PL.z-_v1.z;rig.position.y=H(PL.x,PL.z);}
  // a few already shambling about the streets
  for(let k=0;k<Math.round(DIFF.cap*.5);k++)trySpawn(30,90,'walker');
  state='play';$('title').hidden=true;$('end').hidden=true;$('hud').hidden=false;$('touch').hidden=!coarse||renderer.xr.isPresenting;msg(MIS.title.toUpperCase(),2.4);setTimeout(()=>{if(state==='play')msg('Get to '+MIS.endName,2.6);},2500);}
// ================================================================ Mr Toasty: a giant golem of campfire-toasted marshmallows that wakes when extraction starts, stomps towards you and lobs red-hot marshmallows the size of a person
const BOSS=(()=>{const B={on:false,x:0,z:0,h:0,hp:1,maxhp:1,throwT:4,stepT:0,ph:0,dead:0,arm:0,shots:[],goo:[],pvx:0,pvz:0,lx:0,lz:0,popped:0,killed:false,roarT:0,hitFlash:0,squished:0};
  // a rounded marshmallow shape, toasted golden and charred on top
  function mallowGeo(r,h,toast,seed){const pr=[];const rr=Math.min(r*.28,h*.3);pr.push(new THREE.Vector2(0,-h/2));for(let k=0;k<=5;k++){const a=-Math.PI/2+k/5*Math.PI/2;pr.push(new THREE.Vector2(r-rr+Math.cos(a)*rr,-h/2+rr+Math.sin(a)*rr));}
    for(let k=0;k<=5;k++){const a=k/5*Math.PI/2;pr.push(new THREE.Vector2(r-rr+Math.cos(a)*rr,h/2-rr+Math.sin(a)*rr));}pr.push(new THREE.Vector2(0,h/2));
    const g=new THREE.LatheGeometry(pr,22);const p=g.attributes.position,col=[];const C=new THREE.Color(),cream=new THREE.Color(0xf4ead6),gold=new THREE.Color(0xd99a48),burnt=new THREE.Color(0x3b2414);
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=Math.sin(x*1.7+seed)*Math.cos(z*1.9-seed*2)+Math.sin((x+z)*3.1+seed*3)*.5;const top=(y/(h/2)+1)/2;
      const t=clamp(toast*(.35+top*.9)+n*.25,0,1.3);C.copy(cream).lerp(gold,Math.min(1,t));if(t>.95)C.lerp(burnt,Math.min(1,(t-.95)*2.4));
      // lumpy
      const bump=1+.04*n;p.setX(i,x*bump);p.setZ(i,z*bump);col.push(C.r,C.g,C.b);}
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();return g;}
  const mat=lam({vertexColors:true,emissive:0x5a3c22,fog:false});
  const g=new THREE.Group(),body=new THREE.Group();g.add(body);
  const add=(par,r,h,x,y,z,toast,rx=0,rz=0)=>{const m=new THREE.Mesh(mallowGeo(r,h,toast,x*3+y*7+z),mat);m.position.set(x,y,z);m.rotation.set(rx,0,rz);par.add(m);return m;};
  const legs=[-1,1].map(s=>{const L=new THREE.Group();L.position.set(s*2.6,9.5,0);body.add(L);for(let k=0;k<3;k++)add(L,2.1-k*.1,3.1,0,-1.6-k*3.0,0,.35+k*.05);return L;});
  const torso=new THREE.Group();torso.position.y=9.5;body.add(torso);
  add(torso,4.6,4.8,0,2.6,0,.45);add(torso,5.2,5.2,0,7.4,0,.55);add(torso,4.4,4.2,0,11.9,0,.75);
  const head=new THREE.Group();head.position.set(0,16.6,0);torso.add(head);add(head,3.5,4.2,0,0,0,1.05);
  const ember=new THREE.MeshBasicMaterial({color:0xff6a1a,fog:false});for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.55,10,8),ember);e.position.set(s*1.3,.6,-3.2);e.scale.set(1.2,.7,.5);head.add(e);}
  const mouthT=canvasTex(256,96,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#1a0a04';c.beginPath();c.moveTo(10,30);for(let k=0;k<=10;k++)c.lineTo(10+k*23.6,k%2?62:38);c.lineTo(246,30);c.quadraticCurveTo(128,96,10,30);c.fill();c.fillStyle='rgba(255,120,30,.85)';c.beginPath();c.ellipse(128,62,70,10,0,0,Math.PI*2);c.fill();});
  const mouth=new THREE.Mesh(new THREE.PlaneGeometry(3.6,1.35),new THREE.MeshBasicMaterial({map:mouthT,transparent:true,fog:false}));mouth.position.set(0,-.8,-3.45);mouth.rotation.y=Math.PI;head.add(mouth);
  // gooey drips
  const gooM=lam({color:0xf6efe0,emissive:0x2a2a22,fog:false});for(let k=0;k<5;k++){const d=new THREE.Mesh(new THREE.ConeGeometry(.22,1.2+Math.random()*1.4,6),gooM);d.rotation.x=Math.PI;d.position.set((Math.random()-.5)*4,-2.2-Math.random()*.5,-2.9+Math.random()*.8);head.add(d);}
  const arms=[-1,1].map(s=>{const A=new THREE.Group();A.position.set(s*5.6,12.4,0);torso.add(A);for(let k=0;k<3;k++)add(A,1.55,2.6,0,-1.4-k*2.5,0,.5+k*.12);
    const hand=new THREE.Object3D();hand.position.set(0,-8.4,0);A.add(hand);A.userData.hand=hand;return A;});
  // the roasting skewer through its right arm, charred at the tip
  const sk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,13,6),lam({color:0x8a6236,fog:false}));sk.position.set(0,-3.6,0);arms[1].add(sk);const tip=new THREE.Mesh(new THREE.ConeGeometry(.16,.9,6),lam({color:0x1a1410}));tip.position.set(0,-10.5,0);tip.rotation.x=Math.PI;arms[1].add(tip);
  const flameT=canvasTex(32,128,(c,w,h)=>{const gr=c.createLinearGradient(0,h,0,0);gr.addColorStop(0,'rgba(255,240,170,1)');gr.addColorStop(.35,'rgba(255,170,40,.9)');gr.addColorStop(.75,'rgba(230,60,10,.45)');gr.addColorStop(1,'rgba(150,20,0,0)');c.fillStyle=gr;c.fillRect(0,0,w,h);},{srgb:false});
  const fireM=new THREE.MeshBasicMaterial({map:flameT,color:0xffffff,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,fog:false,side:THREE.DoubleSide});const flames=[];
  const spots=[[head,0,2.2,0],[head,-1.8,1.4,-1],[head,1.8,1.4,.8],[torso,-4.2,13.2,0],[torso,4.2,13.2,0],[arms[0],0,-8.4,0],[arms[1],0,-8.4,0],[torso,0,9.8,-4.6],[torso,-2.5,6,-4.8],[torso,2.6,4,-4.4],[legs[0],0,-9,0],[legs[1],0,-9,0],[head,0,1.6,-2.6],[torso,0,13.8,3.6]];
  for(const [par,x,y,z] of spots){const f=new THREE.Mesh(new THREE.ConeGeometry(1.1,3.6,7,1,true),fireM);f.geometry.translate(0,1.8,0);f.position.set(x,y,z);f.visible=false;par.add(f);flames.push(f);}
  g.scale.setScalar(1.6);g.visible=false;scene.add(g);
  // projectiles: person-sized hot marshmallows, glowing and smoking, with a warning ring where they'll land
  const shotGeo=mallowGeo(.85,1.7,.8,1.3);const shotMat=lam({vertexColors:true,emissive:0x8a3a08});
  const ringT=canvasTex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='rgba(255,80,30,1)';c.lineWidth=10;c.beginPath();c.arc(64,64,56,0,Math.PI*2);c.stroke();c.fillStyle='rgba(255,80,30,.25)';c.beginPath();c.arc(64,64,52,0,Math.PI*2);c.fill();});
  const gooT=canvasTex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='rgba(246,236,214,.95)';c.beginPath();for(let k=0;k<=24;k++){const a=k/24*Math.PI*2,r=44+Math.sin(k*2.7)*10+Math.random()*8;c.lineTo(64+Math.cos(a)*r,64+Math.sin(a)*r);}c.fill();c.fillStyle='rgba(217,154,72,.7)';c.beginPath();c.arc(56,58,18,0,Math.PI*2);c.fill();});
  const SPLASH=2.7;
  function reset(){B.angry=0;B.on=false;body.scale.set(1,1,1);body.rotation.set(0,0,0);if(typeof musicBossOn==='function')musicBossOn(false);g.visible=false;for(const s of B.shots){scene.remove(s.m);scene.remove(s.ring);}B.shots.length=0;for(const q of B.goo)scene.remove(q.m);B.goo.length=0;B.popped=0;B.squished=0;B.killed=false;B.dead=0;PL.slow=0;}
  function spawn(){reset();// anywhere around you, 150 m out: inland, along the shore, or wading up out of the lough
    let bx=PL.x,bz=PL.z;for(let k=0;k<40;k++){const a=Math.random()*Math.PI*2;bx=PL.x+Math.cos(a)*150;bz=PL.z+Math.sin(a)*150;if(bx>AREA.x0+15&&bx<AREA.x1-15&&bz>AREA.z0+15&&bz<AREA.z1-15&&sdWater(bx,bz)>-90)break;}
    body.scale.set(1,1,1);body.rotation.set(0,0,0);body.position.set(0,0,0);B.x=bx;B.z=bz;B.h=Math.atan2(-(PL.x-bx),-(PL.z-bz));B.lv=DIFF.lv||1;B.maxhp=B.hp=1700*DIFF.hp*Math.pow(1.1,B.lv-1);B.throwT=5;B.on=true;B.ph=0;B.rise=1;B.lx=PL.x;B.lz=PL.z;g.visible=true;roar();musicBossOn(true);msg('MR TOASTY HAS WOKEN UP!',2.8);B.msgT=3;}
  function roar(){if(!AU.ctx)return;const ctx=AU.ctx,t=ctx.currentTime;const out=ctx.createGain();out.gain.value=2.6;const p=panTo(out,B.x,22,B.z);p.refDistance=70;p.rolloffFactor=.6;
    for(const [f,ty,v] of [[44,'sawtooth',.5],[66,'sawtooth',.35],[88,'square',.15]]){const o=ctx.createOscillator();o.type=ty;o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*1.25,t+.6);o.frequency.linearRampToValueAtTime(f*.7,t+2.6);
      const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(300,t);fl.frequency.linearRampToValueAtTime(1100,t+.5);fl.frequency.linearRampToValueAtTime(220,t+2.6);const gg=ctx.createGain();gg.gain.setValueAtTime(0,t);gg.gain.linearRampToValueAtTime(v,t+.25);gg.gain.linearRampToValueAtTime(0,t+2.8);
      o.connect(fl);fl.connect(gg);gg.connect(out);o.start(t);o.stop(t+2.9);}
    const n=ctx.createBufferSource();n.buffer=AU.noise;const nf=ctx.createBiquadFilter();nf.type='bandpass';nf.frequency.value=700;nf.Q.value=.7;const ng=ctx.createGain();ng.gain.setValueAtTime(0,t);ng.gain.linearRampToValueAtTime(.4,t+.3);ng.gain.linearRampToValueAtTime(0,t+2.6);n.connect(nf);nf.connect(ng);ng.connect(out);n.start(t,Math.random());n.stop(t+2.7);}
  function thud(x,z,big){if(!AU.ctx)return;const ctx=AU.ctx,t=ctx.currentTime;const out=ctx.createGain();out.gain.value=big?2.4:1.6;const p=panTo(out,x,1,z);p.refDistance=big?45:12;p.rolloffFactor=.7;
    const o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(big?55:90,t);o.frequency.exponentialRampToValueAtTime(big?28:40,t+.4);const g2=ctx.createGain();g2.gain.setValueAtTime(.9,t);g2.gain.exponentialRampToValueAtTime(.001,t+.6);o.connect(g2);g2.connect(out);o.start(t);o.stop(t+.7);
    const n=ctx.createBufferSource();n.buffer=AU.noise;const nf=ctx.createBiquadFilter();nf.type=big?'lowpass':'highpass';nf.frequency.value=big?300:1800;const ng=ctx.createGain();ng.gain.setValueAtTime(big?.5:.45,t);ng.gain.exponentialRampToValueAtTime(.001,t+(big?.5:.9));n.connect(nf);nf.connect(ng);ng.connect(out);n.start(t,Math.random());n.stop(t+1);}
  function whoosh(x,y,z){if(!AU.ctx)return;const ctx=AU.ctx,t=ctx.currentTime;const n=ctx.createBufferSource();n.buffer=AU.noise;const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=1.5;f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(1400,t+.8);const g2=ctx.createGain();g2.gain.setValueAtTime(0,t);g2.gain.linearRampToValueAtTime(.9,t+.3);g2.gain.linearRampToValueAtTime(0,t+1);n.connect(f);f.connect(g2);const p=panTo(g2,x,y,z);p.refDistance=30;n.start(t,Math.random());n.stop(t+1.1);}
  function throwAt(k=0){const hand=arms[1].userData.hand;g.updateMatrixWorld(true);const sp=hand.getWorldPosition(new THREE.Vector3());
    const d=Math.hypot(PL.x-sp.x,PL.z-sp.z);const tf=clamp(d/34,1.7,3.1);const G=12;
    // aim where you're heading (a bit), so standing still or running straight gets you hit
    const lead=.65+Math.random()*.3;const spread=k?(k===1?5:-5):0;let tx=PL.x+B.pvx*tf*lead+(Math.random()-.5)*2.5+Math.cos(B.h)*spread,tz=PL.z+B.pvz*tf*lead+(Math.random()-.5)*2.5-Math.sin(B.h)*spread;const ty=H(tx,tz);
    const v=new THREE.Vector3((tx-sp.x)/tf,(ty+.85-sp.y+.5*G*tf*tf)/tf,(tz-sp.z)/tf);
    const m=new THREE.Mesh(shotGeo,shotMat);m.position.copy(sp);scene.add(m);
    const ring=new THREE.Mesh(new THREE.PlaneGeometry(SPLASH*2,SPLASH*2),new THREE.MeshBasicMaterial({map:ringT,transparent:true,depthWrite:false,fog:false,opacity:.3}));ring.rotation.x=-Math.PI/2;ring.position.set(tx,ty+.15,tz);scene.add(ring);
    B.shots.push({m,ring,v,t:0,tf,G,spin:new THREE.Vector3(Math.random()*4-2,Math.random()*4-2,Math.random()*4-2),hp:3});whoosh(sp.x,sp.y,sp.z);}
  function splat(s,hitGround){const p=s.m.position;scene.remove(s.m);scene.remove(s.ring);
    for(let k=0;k<26;k++)PFX.add(p.x,p.y,p.z,(Math.random()-.5)*9,Math.random()*6,(Math.random()-.5)*9,k%3?0xf4ead6:0xff8a2a,.22,.9);thud(p.x,p.z,false);
    {let sq=0;for(const z of Z){if(z.dead)continue;if(Math.hypot(z.x-p.x,z.z-p.z)<SPLASH+.3*z.sc){killZombie(z);kills--;sq++;}}if(sq){B.squished+=sq;if(sq>=3)msg(`SPLAT! ${sq} ZOMBIES SQUASHED`,1.4);}}
    if(hitGround){const gm=new THREE.Mesh(new THREE.PlaneGeometry(SPLASH*2.1,SPLASH*2.1),new THREE.MeshBasicMaterial({map:gooT,transparent:true,depthWrite:false}));gm.rotation.x=-Math.PI/2;gm.rotation.z=Math.random()*6;gm.position.set(p.x,H(p.x,p.z)+.1,p.z);scene.add(gm);B.goo.push({m:gm,x:p.x,z:p.z,t:7});
      const d=Math.hypot(PL.x-p.x,PL.z-p.z);if(d<SPLASH&&!PL.ride&&state==='play'){const dmg=26*DIFF.dmg*(1-d/SPLASH*.4);PL.hp-=dmg;dmgTaken+=dmg;PL.hurtT=.45;PL.regenT=5;sfx('hurt');msg('SPLAT! HOT MARSHMALLOW!',1.4);}}}
  // the laser: hits on Mr Toasty (a big upright capsule) and on marshmallows in flight
  function rayHit(o,d,tMax){if(!B.on||B.dead)return null;const R=9.6;const ox=o.x-B.x,oz=o.z-B.z;const a=d.x*d.x+d.z*d.z;if(a<1e-6)return null;const b=2*(ox*d.x+oz*d.z),c=ox*ox+oz*oz-R*R;const disc=b*b-4*a*c;if(disc<0)return null;
    const t=(-b-Math.sqrt(disc))/(2*a);if(t<0||t>tMax)return null;const y=o.y+d.y*t-Math.max(H(B.x,B.z),-3.5);return y>0&&y<42?t:null;}
  function shotHit(o,d,tMax){let best=null,bt=tMax;for(const s of B.shots){const c=s.m.position;const cx=c.x-o.x,cy=c.y-o.y,cz=c.z-o.z;const t=cx*d.x+cy*d.y+cz*d.z;if(t<0||t>bt)continue;const px=cx-d.x*t,py=cy-d.y*t,pz=cz-d.z*t;if(px*px+py*py+pz*pz<1.25*1.25){best=s;bt=t;}}return best?{s:best,t:bt}:null;}
  function damage(n,at){B.hp-=n;B.hitFlash=.08;if(at)for(let q=0;q<4;q++)PFX.add(at.x,at.y,at.z,(Math.random()-.5)*5,Math.random()*4,(Math.random()-.5)*5,q%2?0xf4ead6:0xff8a1e,.14,.5);
    if(B.hp<=0&&!B.dead){B.dead=.001;B.killed=true;musicBossOn(false);msg('MR TOASTY IS TOAST! +500 CREDITS',3);roar();for(const s of B.shots){scene.remove(s.m);scene.remove(s.ring);}B.shots.length=0;}}
  function popShot(s){B.popped++;const i=B.shots.indexOf(s);if(i>=0)B.shots.splice(i,1);splat(s,false);}
  function update(dt){if(B.msgT>0){B.msgT-=dt;if(B.msgT<=0&&B.on&&state==='play')msg('DODGE THE HOT MARSHMALLOWS! WATCH FOR THE RED RINGS',2.6);}
    // how fast you're moving (for leading the throws)
    const vx=(PL.x-B.lx)/Math.max(dt,1e-3),vz=(PL.z-B.lz)/Math.max(dt,1e-3);B.pvx=lerp(B.pvx,vx,Math.min(1,dt*3));B.pvz=lerp(B.pvz,vz,Math.min(1,dt*3));B.lx=PL.x;B.lz=PL.z;
    // the goo slows you
    PL.slow=0;for(let i=B.goo.length-1;i>=0;i--){const q=B.goo[i];q.t-=dt;q.m.material.opacity=Math.min(1,q.t);if(q.t<=0){scene.remove(q.m);B.goo.splice(i,1);continue;}if(Math.hypot(PL.x-q.x,PL.z-q.z)<SPLASH*.9)PL.slow=.55;}
    // shots in flight
    for(let i=B.shots.length-1;i>=0;i--){const s=B.shots[i];s.t+=dt;s.v.y-=s.G*dt;s.m.position.addScaledVector(s.v,dt);s.m.rotation.x+=s.spin.x*dt;s.m.rotation.y+=s.spin.y*dt;s.m.rotation.z+=s.spin.z*dt;
      const k=clamp(s.t/s.tf,0,1);s.ring.material.opacity=.25+.65*k;s.ring.scale.setScalar(1.3-.3*k);
      const p=s.m.position;if(Math.random()<.9)PFX.add(p.x,p.y,p.z,(Math.random()-.5),Math.random()*.8,(Math.random()-.5),Math.random()<.6?0xffa040:0x5a5048,.3,.6);
      const pd=Math.hypot(p.x-PL.x,p.z-PL.z),py=p.y-(H(PL.x,PL.z)+1);if(pd<1.3&&Math.abs(py)<1.4&&!PL.ride){B.shots.splice(i,1);s.m.position.set(PL.x,H(PL.x,PL.z)+.8,PL.z);splat(s,true);continue;}
      let zh=false;if(p.y<H(p.x,p.z)+3)for(const z of Z){if(z.dead)continue;if(Math.hypot(z.x-p.x,z.z-p.z)<1.1*z.sc+.6&&p.y<z.y+2*z.sc+.5){zh=true;break;}}
      if(zh||(p.y<=H(p.x,p.z)+.85&&s.t>.3)){B.shots.splice(i,1);if(zh)s.m.position.y=Math.max(p.y,H(p.x,p.z)+.85);splat(s,true);}}
    if(!B.on)return;
    const by=Math.max(H(B.x,B.z),-3.5);
    if(B.dead){B.dead+=dt;// melts down into a puddle
      const k=Math.min(1,B.dead/3.5);body.scale.set(1+k*.5,Math.max(.05,1-k),1+k*.5);body.rotation.x=k*.25;g.position.set(B.x,by,B.z);if(Math.random()<.6)PFX.add(B.x+(Math.random()-.5)*10,by+Math.random()*8*(1-k),B.z+(Math.random()-.5)*10,(Math.random()-.5)*3,Math.random()*2,(Math.random()-.5)*3,0xf4ead6,.3,1);
      if(B.dead>6){B.on=false;g.visible=false;}return;}
    const dx=PL.x-B.x,dz=PL.z-B.z,d=Math.hypot(dx,dz);const want=Math.atan2(-dx,-dz);let dh=want-B.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));B.h+=clamp(dh,-dt*.6,dt*.6);
    const walking=d>22&&!PL.ride;const sp=walking?3.1*DIFF.spd*Math.min(1.6,Math.pow(1.12,(B.lv||1)-1))*(1+.25*(B.angry||0)):0;B.x-=Math.sin(B.h)*sp*dt;B.z-=Math.cos(B.h)*sp*dt;if(walking)B.ph+=dt*1.5;
    // stomping gait
    const sw=Math.sin(B.ph);legs[0].rotation.x=sw*.32;legs[1].rotation.x=-sw*.32;body.position.y=Math.abs(Math.cos(B.ph))*.6;torso.rotation.z=sw*.05;arms[0].rotation.x=-sw*.25;
    const sNow=Math.sign(Math.cos(B.ph));if(walking&&sNow!==B.stepS){B.stepS=sNow;thud(B.x,B.z,true);if(d<140&&!renderer.xr.isPresenting)SHAKE=Math.max(SHAKE,.35*(1-d/140));for(let k=0;k<10;k++)PFX.add(B.x+(Math.random()-.5)*8,by+.3,B.z+(Math.random()-.5)*8,(Math.random()-.5)*6,1+Math.random()*2,(Math.random()-.5)*6,0x6a6253,.3,1);}
    // wind up and throw
    B.throwT-=dt;const rate=Math.max(.75,3.4/Math.pow(1.2,(DIFF.lv||1)-1)*(.35+.65*clamp(B.hp/B.maxhp,0,1)));
    if(B.throwT<.9)B.arm=Math.min(1,B.arm+dt*2.2);else B.arm=Math.max(0,B.arm-dt*3);arms[1].rotation.x=-B.arm*2.3+(B.throwT>2?-sw*.25:0);
    if(B.throwT<=0&&!PL.ride&&state==='play'&&d<230){const f=B.hp/B.maxhp;const n=f<.33?3:f<.66?2:1;for(let k=0;k<n;k++)throwAt(k);B.throwT=rate*(.8+Math.random()*.4);B.arm=0;if(n>1&&!B.angry){B.angry=1;msg('MR TOASTY IS FURIOUS!',1.6);roar();}if(n>2&&B.angry<2){B.angry=2;msg('MR TOASTY IS BLAZING MAD!',1.6);roar();}}
    // up close it stamps on you
    if(d<18&&!PL.ride){B.roarT-=dt;if(B.roarT<=0){B.roarT=2.6;thud(PL.x,PL.z,true);const dmg=40*DIFF.dmg;PL.hp-=dmg;dmgTaken+=dmg;PL.hurtT=.5;msg('STOMP! GET AWAY FROM IT!',1.4);}}
    // rising embers off its toasted head, and a hit flash
    if(Math.random()<.5){const hx=B.x+(Math.random()-.5)*8,hz=B.z+(Math.random()-.5)*8;PFX.add(hx,by+41+Math.random()*4,hz,(Math.random()-.5),1+Math.random()*1.5,(Math.random()-.5),Math.random()<.7?0xff7a22:0x4a4038,.25,1.4);}
    const heat=clamp(((B.lv||1)-1)/5+(1-B.hp/B.maxhp)*.35,0,1.2);const nf=Math.min(flames.length,Math.round(heat*flames.length));
    flames.forEach((f,k)=>{f.visible=k<nf;if(f.visible){const fl=.75+Math.random()*.5;f.scale.set(fl*(.7+heat*.5),fl*(.8+heat*.7),fl*(.7+heat*.5));}});fireM.color.setHSL(.08-.03*Math.random(),1,.6+Math.random()*.1);
    if(heat>.05)for(let k=0;k<Math.round(heat*6);k++){const fx=B.x+(Math.random()-.5)*14,fz=B.z+(Math.random()-.5)*14;PFX.add(fx,by+8+Math.random()*34,fz,(Math.random()-.5)*2,3+Math.random()*4,(Math.random()-.5)*2,Math.random()<.6?0xff8a1e:0xffd24a,.4,.8);}
    B.hitFlash=Math.max(0,B.hitFlash-dt);_bc.setHex(0x5a3c22).lerp(_bh,Math.min(1,heat*.7));mat.emissive.copy(B.hitFlash>0?_bh2:_bc);
    g.position.set(B.x,by,B.z);g.rotation.y=B.h;}
  return {B,spawn,reset,update,rayHit,shotHit,damage,popShot,g};})();
let SHAKE=0;let TGT=PL;const _bc=new THREE.Color(),_bh=new THREE.Color(0xb8421a),_bh2=new THREE.Color(0xff7a2a);

// ================================================================ the chopper's door cannon: a heavy proton emitter on a swivel mount, used whenever you're riding
const HEAVY=(()=>{const g=new THREE.Group();const dark=lam({color:0x22262d}),steel=lam({color:0x8a929c}),hv=lam({color:0xff7a22,emissive:0x3a1400});
  const glowM=new THREE.MeshBasicMaterial({color:0x43f0ff,fog:false});
  const yoke=new THREE.Mesh(new THREE.BoxGeometry(.5,.12,.3),dark);yoke.position.set(0,-.05,.1);g.add(yoke);
  const body=new THREE.Mesh(new THREE.BoxGeometry(.26,.24,.62),dark);body.position.set(0,.12,.05);g.add(body);
  for(const s of [-1,1]){const st=new THREE.Mesh(new THREE.BoxGeometry(.02,.25,.45),hv);st.position.set(s*.135,.12,.05);g.add(st);}
  const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.085,.105,1.05,14),steel);barrel.rotation.x=Math.PI/2;barrel.position.set(0,.12,-.78);g.add(barrel);
  const rings=[];for(let k=0;k<5;k++){const r=new THREE.Mesh(new THREE.TorusGeometry(.13,.024,8,20),glowM);r.position.set(0,.12,-.42-k*.17);g.add(r);rings.push(r);}
  const tip=new THREE.Mesh(new THREE.CylinderGeometry(.13,.09,.16,14),dark);tip.rotation.x=Math.PI/2;tip.position.set(0,.12,-1.34);g.add(tip);
  const lens=new THREE.Mesh(new THREE.CircleGeometry(.075,14),new THREE.MeshBasicMaterial({color:0xffa030,fog:false}));lens.position.set(0,.12,-1.425);lens.rotation.y=Math.PI;g.add(lens);
  for(const s of [-1,1]){const h=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.22,8),dark);h.position.set(s*.22,.1,.42);g.add(h);const a=new THREE.Mesh(new THREE.BoxGeometry(.12,.04,.04),dark);a.position.set(s*.16,.1,.42);g.add(a);}
  const cable=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,.0,.4),new THREE.Vector3(.05,-.25,.6),new THREE.Vector3(.2,-.55,.7)]),12,.035,6),dark);g.add(cable);
  const muzzle=new THREE.Object3D();muzzle.position.set(0,.12,-1.45);g.add(muzzle);
  g.scale.setScalar(.62);g.visible=false;scene.add(g);return {g,muzzle,rings,glowM};})();
const HV={on:false,pivot:new THREE.Object3D()};
// where the cannon sits: on the door sill, below and just outside your seat
function heavyMount(){if(!HV.pivot.parent)HELI.body.add(HV.pivot);HV.pivot.position.set(-1.62,-.42,.2);}
const _hd=new THREE.Vector3(),_ht=new THREE.Vector3();
function heavyUpdate(){const on=!!PL.ride&&(BON.active?BON.phase!=='fadeout':EX.phase==='lift');HV.on=on;HEAVY.g.visible=on;GUN.g.visible=!on;if(!on)return;
  heavyMount();HELI.body.updateMatrixWorld(true);
  // on a swing arm from the door frame: it sits by your right hip, below and to the side of your view, so it never covers what you're aiming at
  camera.updateMatrixWorld(true);camera.getWorldPosition(_v1);camera.getWorldQuaternion(_q1);_v2.set(1,0,0).applyQuaternion(_q1);_v2.y=0;_v2.normalize();_v3.set(0,0,-1).applyQuaternion(_q1);_v3.y=0;if(_v3.lengthSq()<1e-4)_v3.set(0,0,-1);_v3.normalize();
  if(renderer.xr.isPresenting&&CTL[gunHand()]?.grip){CTL[gunHand()].grip.getWorldPosition(HEAVY.g.position);HEAVY.g.position.y-=.12;}
  else HEAVY.g.position.copy(_v1).addScaledVector(_v2,.36).addScaledVector(_v3,.12).add(new THREE.Vector3(0,-.5,0));
  // swing it to wherever you're aiming: your view, or your gun hand's controller in VR
  if(renderer.xr.isPresenting&&CTL[gunHand()]?.grip){const G=CTL[gunHand()].grip;G.getWorldQuaternion(_q1);_hd.set(0,0,-1).applyQuaternion(_q1);}else camera.getWorldDirection(_hd);
  _ht.copy(HEAVY.g.position).add(_hd);HEAVY.g.lookAt(_ht);HEAVY.g.rotateY(Math.PI);// lookAt points +z at the target; the barrel runs down -z
  const f=LZ.firing?1:0;HEAVY.glowM.color.setHSL(LZ.over?0:f?.07+.04*Math.random():.52,1,.5+.2*f);if(f){HEAVY.g.position.addScaledVector(_hd,-.015*Math.random());}
  HEAVY.g.updateMatrixWorld(true);}
// the barrel the beam really comes out of
const aimMuzzle=()=>HV.on?HEAVY.muzzle:GUN.muzzle;

// ================================================================ bonus round: ride the chopper's door seat and cover a survivor running for their own pick-up
const NPC=(()=>{const g=new THREE.Group();const jk=lam({color:0xf2d21b,emissive:0x2a2400}),dk=lam({color:0x2a2f38}),sk=lam({color:0xe0b48f});
  const torso=new THREE.Mesh(new THREE.BoxGeometry(.5,.62,.3),jk);torso.position.y=1.18;g.add(torso);const strip=new THREE.Mesh(new THREE.BoxGeometry(.52,.07,.32),lam({color:0xd8dde2,emissive:0x444444}));strip.position.y=1.08;g.add(strip);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.15,10,8),sk);head.position.y=1.66;g.add(head);
  const limb=(w,h,m,x,y)=>{const p=new THREE.Group();p.position.set(x,y,0);const l=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),m);l.position.y=-h/2;p.add(l);g.add(p);return p;};
  const legL=limb(.17,.86,dk,-.13,.88),legR=limb(.17,.86,dk,.13,.88),armL=limb(.12,.62,jk,-.32,1.46),armR=limb(.12,.62,jk,.32,1.46);
  const mark=new THREE.Mesh(new THREE.ConeGeometry(.45,.9,4),new THREE.MeshBasicMaterial({color:0x5dff8a,fog:false}));mark.rotation.x=Math.PI;mark.position.y=3.2;g.add(mark);
  g.visible=false;scene.add(g);return {g,legL,legR,armL,armR,mark,x:0,z:0,h:0,hp:100,ph:0,grab:0};})();
const BON={active:false,done:false,phase:'',t:0,saved:false,E:null,D:null,ang:0,fade:0,res:null};
// a black veil for the scene change (works in the headset too)
const FADE=(()=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(4,4),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:0,depthTest:false,depthWrite:false,fog:false}));m.position.z=-.25;m.renderOrder=60;m.visible=false;camera.add(m);return m;})();
function bfsFrom(gx,gz){const D=new Int32Array(NW*ND).fill(-1),Q=new Int32Array(NW*ND);const s=navIdx(gx,gz);if(s<0)return D;let h=0,t=0;D[s]=0;Q[t++]=s;
  while(h<t){const c=Q[h++];const x=c%NW;for(const o of [-1,1,-NW,NW]){const n=c+o;if(n<0||n>=NW*ND)continue;if((o===-1&&x===0)||(o===1&&x===NW-1))continue;if(D[n]<0&&!NAV[n]){D[n]=D[c]+1;Q[t++]=n;}}}return D;}
function bonusPickRoute(){// a random start somewhere on the streets, and a pick-up a good run away
  for(let tries=0;tries<40;tries++){const sx=lerp(AREA.x0+80,AREA.x1-80,Math.random()),sz=lerp(AREA.z0+70,AREA.z1-70,Math.random());const S=snapWalk(sx,sz,40);if(!S)continue;const ni=navIdx(S[0],S[1]);if(ni<0||NAV[ni])continue;
    const D=bfsFrom(S[0],S[1]);const cand=[];for(let i=0;i<D.length;i+=7){const d=D[i]*NC;if(d>230&&d<330){const x=AREA.x0+(i%NW+.5)*NC,z=AREA.z0+((i/NW|0)+.5)*NC;if(cellAt(x,z)===3)cand.push([x,z]);}}
    if(cand.length<5)continue;const E=cand[(Math.random()*cand.length)|0];return {S,E};}return null;}
function practiceBonus(){startMission();BON.practice=true;Z.length=0;BOSS.reset();holdT=0;EX.phase='lift';EX.t=0;HELI.g.visible=true;PL.ride={y:H(PL.x,PL.z)+20};WINREC={T:0,best:null};
  if(!coarse&&!renderer.xr.isPresenting)view.requestPointerLock?.();bonusStart();}
function bonusStart(){const r=bonusPickRoute();if(!r){finishMission();return;}
  BON.active=true;BON.done=false;BON.phase='fadeout';BON.t=0;BON.saved=false;BON.route=r;FADE.visible=true;msg('BONUS ROUND!',2);}
function bonusBegin(){const {S,E}=BON.route;BON.E=E;BON.D=bfsFrom(E[0],E[1]);
  Z.length=0;BOSS.reset();musicBossOn(false);MU.rock=true;MU.step=0;MU.bar=0;
  NPC.x=S[0];NPC.z=S[1];NPC.hp=100;NPC.grab=0;NPC.g.visible=true;TGT=NPC;END=E;totalDist=Math.hypot(E[0]-S[0],E[1]-S[1]);
  extract.g.position.set(E[0],H(E[0],E[1]),E[1]);extract.g.visible=true;
  EX.phase='bonus';BON.ang=Math.random()*Math.PI*2;const hp=bonusHeliTarget(0);HELI.g.position.copy(hp);HELI.g.visible=true;
  for(let k=0;k<Math.round(DIFF.cap*.45);k++)trySpawn(25,70,'walker');hordeT=18;spawnT=1;flowField(NPC.x,NPC.z);
  BON.phase='run';BON.t=0;msg('BONUS: COVER THE SURVIVOR!',2.6);BON.msgT=2.8;}
const _bt=new THREE.Vector3();
function bonusHeliTarget(dt){BON.ang+=dt*.16;const R=17;const cx=NPC.x+Math.sin(NPC.h)*-6,cz=NPC.z+Math.cos(NPC.h)*-6;_bt.set(cx+Math.cos(BON.ang)*R,Math.max(H(NPC.x,NPC.z),0)+21,cz+Math.sin(BON.ang)*R);return _bt;}
function bonusUpdate(dt){if(!BON.active)return;BON.t+=dt;
  if(BON.phase==='fadeout'){FADE.material.opacity=Math.min(1,BON.t/.8);if(BON.t>1){bonusBegin();}return;}
  if(BON.phase==='run'||BON.phase==='over'){FADE.material.opacity=Math.max(0,FADE.material.opacity-dt*1.5);FADE.visible=FADE.material.opacity>0;}
  if(BON.msgT>0){BON.msgT-=dt;if(BON.msgT<=0)msg('ZAP THE ZOMBIES BEFORE THEY GET THEM!',2.4);}
  // the survivor runs the shortest way to their pick-up
  if(BON.phase==='run'){const ni=navIdx(NPC.x,NPC.z);let tx=BON.E[0]-NPC.x,tz=BON.E[1]-NPC.z;
    if(ni>=0&&BON.D[ni]>1){let best=BON.D[ni],bi=-1;const ix=ni%NW;for(const [o,a,b] of DIRS8){const nn=ni+o;if(nn<0||nn>=NAV.length)continue;if(Math.abs((nn%NW)-ix)>1)continue;if(a&&(NAV[ni+a]||NAV[ni+b]))continue;const v=BON.D[nn];if(v>=0&&v<best){best=v;bi=nn;}}
      if(bi>=0){tx=AREA.x0+(bi%NW+.5)*NC-NPC.x;tz=AREA.z0+((bi/NW|0)+.5)*NC-NPC.z;}}
    const l=Math.hypot(tx,tz)||1;const sp=NPC.grab>0?.9:4.4;const [nx,nz]=slide(NPC.x,NPC.z,tx/l*sp*dt,tz/l*sp*dt,.28);NPC.x=nx;NPC.z=nz;
    const want=Math.atan2(-tx,-tz);let dh=want-NPC.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));NPC.h+=clamp(dh,-dt*8,dt*8);NPC.ph+=dt*(NPC.grab>0?4:11);NPC.grab=Math.max(0,NPC.grab-dt);
    if(Math.hypot(BON.E[0]-NPC.x,BON.E[1]-NPC.z)<4){BON.phase='over';BON.saved=true;BON.t=0;msg('SURVIVOR SAVED! +200 CREDITS',3);tone(660,990,.3,.1,'triangle');setTimeoutT(()=>tone(990,1320,.4,.1,'triangle'),.35);}
    if(NPC.hp<=0){BON.phase='over';BON.saved=false;BON.t=0;msg("THE SURVIVOR DIDN'T MAKE IT",3);tone(330,110,1.2,.12,'sawtooth');}}
  // pose the survivor
  const g=NPC.g;g.position.set(NPC.x,H(NPC.x,NPC.z),NPC.z);g.rotation.y=NPC.h;const sw=Math.sin(NPC.ph)*(BON.phase==='run'?.8:.1);NPC.legL.rotation.x=sw;NPC.legR.rotation.x=-sw;NPC.armL.rotation.x=-sw*.8;NPC.armR.rotation.x=sw*.8;
  if(NPC.hp<=0){g.rotation.x=Math.min(Math.PI/2,g.rotation.x+dt*3);}else g.rotation.x=0;NPC.mark.position.y=3.2+Math.sin(T*4)*.2;NPC.mark.material.color.setHSL(clamp(NPC.hp/100,0,1)*.33,1,.55);
  // the chopper circles them with the open door facing in
  const tgt=bonusHeliTarget(dt);{let top=0;for(const [ox,oz] of [[0,0],[6,0],[-6,0],[0,6],[0,-6]]){if(cellAt(tgt.x+ox,tgt.z+oz)===1)top=Math.max(top,H(tgt.x+ox,tgt.z+oz)+17);}tgt.y=Math.max(tgt.y,top+6);}HELI.g.position.lerp(tgt,1-Math.exp(-dt*1.2));const dx=NPC.x-HELI.g.position.x,dz=NPC.z-HELI.g.position.z;const wantY=Math.atan2(dz,-dx);let d=wantY-EX.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));EX.yaw+=clamp(d,-dt*1.2,dt*1.2);
  HELI.g.rotation.set(0,EX.yaw,0);HELI.body.rotation.set(0,0,-.06);HELI.body.updateMatrixWorld(true);HELI.seat.getWorldPosition(_hp);PL.ride={y:_hp.y};placeRider(_hp.x,_hp.z);
  if(BON.phase==='over'&&BON.t>3.2){BON.active=false;BON.done=true;NPC.g.visible=false;MU.rock=false;TGT=PL;heliSound(false);finishMission();}}
// tiny game-time timer (works in the fast test sim too)
const TT=[];function setTimeoutT(f,s){TT.push({f,t:s});}function ttUpdate(dt){for(let i=TT.length-1;i>=0;i--){TT[i].t-=dt;if(TT[i].t<=0){const f=TT[i].f;TT.splice(i,1);f();}}}

// ================================================================ extraction: the evac helicopter flies in off the lough, lands on the pad, and you have to jump on before it lifts off
const HELI=(()=>{const g=new THREE.Group();const body=new THREE.Group();g.add(body);
  const prof=[[0,-3.35],[.55,-3.2],[1.0,-2.8],[1.28,-2.1],[1.4,-1.1],[1.42,.4],[1.36,1.5],[1.05,2.55],[.6,3.3],[.36,3.6]].map(([r,y])=>new THREE.Vector2(r,y));
  const fg=new THREE.LatheGeometry(prof,20);fg.rotateX(Math.PI/2);fg.scale(.92,1,1);
  {const p=fg.attributes.position,col=[];const C=new THREE.Color();for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
      if(z<-1.55&&y>-.25)C.setHex(0x101a26);// windscreen
      else if(Math.abs(x)>.95&&y>.05&&y<.85&&z>-1.5&&z<1.2&&!(x<0&&z>-.7&&z<1.05))C.setHex(0x131d29);// side windows
      else if(y>-.42&&y<-.08)C.setHex(0xff6a1a);// hi-vis band
      else if(y<-.95)C.setHex(0x3a4048);else C.setHex(0xd5d8dc);col.push(C.r,C.g,C.b);}fg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));}
  const vc=lam({vertexColors:true,emissive:0x181818});body.add(new THREE.Mesh(fg,vc));
  const dark=lam({color:0x1d2127}),orange=lam({color:0xff6a1a}),metal=lam({color:0x7c8590});
  const light=lam({color:0xd5d8dc,emissive:0x181818});const boom=new THREE.Mesh(new THREE.CylinderGeometry(.2,.4,6.4,10),light);boom.rotation.x=Math.PI/2;boom.position.set(0,.35,6.3);body.add(boom);
  const fin=new THREE.Mesh(new THREE.BoxGeometry(.12,1.9,1.15),orange);fin.position.set(0,1.15,9.25);fin.rotation.x=-.35;body.add(fin);
  const stab=new THREE.Mesh(new THREE.BoxGeometry(2.5,.08,.62),dark);stab.position.set(0,.42,8.1);body.add(stab);
  const eng=new THREE.Mesh(new THREE.BoxGeometry(1.25,.55,2.3),light);eng.position.set(0,1.38,.5);body.add(eng);
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(.11,.14,.55,8),metal);mast.position.set(0,1.85,.1);body.add(mast);
  // skids
  for(const s of [-1,1]){const sk=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,4.7,8),metal);sk.rotation.x=Math.PI/2;sk.position.set(s*1.2,-2.05,.1);body.add(sk);
    const tip=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.6,8),metal);tip.position.set(s*1.2,-1.86,-2.42);tip.rotation.x=-.9;body.add(tip);
    for(const zz of [-1.05,1.2]){const st=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1.1,6),metal);st.position.set(s*.98,-1.6,zz);st.rotation.z=s*.42;body.add(st);}}
  // the open side door: a warm-lit cabin behind an orange frame
  const doorM=new THREE.MeshBasicMaterial({color:0x8a6236,fog:true});const door=new THREE.Mesh(new THREE.PlaneGeometry(1.55,1.55),doorM);door.position.set(-1.33,-.15,.17);door.rotation.y=-Math.PI/2;body.add(door);
  const frameM=new THREE.MeshBasicMaterial({color:0xff7a22});for(const [w,h,y,z] of [[1.7,.08,.65,.17],[1.7,.08,-.95,.17],[.08,1.6,-.15,-.68],[.08,1.6,-.15,1.02]]){const f=new THREE.Mesh(new THREE.PlaneGeometry(w,h),frameM);f.position.set(-1.345,y,z);f.rotation.y=-Math.PI/2;body.add(f);}
  const seat=new THREE.Object3D();seat.position.set(-.55,-1.05,.25);body.add(seat);const doorPt=new THREE.Object3D();doorPt.position.set(-3.35,-2.1,.17);body.add(doorPt);
  const stairs=new THREE.Group();stairs.position.set(-1.36,-.95,.17);body.add(stairs);{const sm=lam({color:0x9aa3ad,emissive:0x111111}),hv=lam({color:0xff7a22,emissive:0x331400});
    const run=1.75,rise=1.15,L=Math.hypot(run,rise),ang=Math.atan2(rise,run);
    for(const z of [-.46,.46]){const st=new THREE.Mesh(new THREE.BoxGeometry(L,.12,.05),sm);st.position.set(-run/2,-rise/2,z);st.rotation.z=ang;stairs.add(st);
      const rail=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,L,6),sm);rail.rotation.z=Math.PI/2+ang;rail.position.set(-run/2,-rise/2+.85,z);stairs.add(rail);
      for(const f of [.05,.95]){const po=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.85,6),sm);po.position.set(-run*f,-rise*f+.42,z);stairs.add(po);}}
    for(let i=1;i<=4;i++){const t=i/4.4;const stp=new THREE.Mesh(new THREE.BoxGeometry(.4,.06,.9),sm);stp.position.set(-run*t,-rise*t,0);stairs.add(stp);const ed=new THREE.Mesh(new THREE.BoxGeometry(.05,.065,.9),hv);ed.position.set(-run*t-.18,-rise*t+.002,0);stairs.add(ed);}}
  stairs.scale.set(.02,1,1);stairs.visible=false;
  // livery on both sides of the boom (invented: the lab's own evac flight)
  const lt=canvasTex(512,96,(c,w,h)=>{c.fillStyle='#d5d8dc';c.fillRect(0,0,w,h);c.fillStyle='#e8580e';c.font='700 62px Barlow,sans-serif';c.textBaseline='middle';c.fillText('LAB EVAC 7',22,50);});
  for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.48),new THREE.MeshBasicMaterial({map:lt}));p.position.set(s*.37,.38,5.4);p.rotation.y=s*Math.PI/2;body.add(p);}
  // rotors
  const rotor=new THREE.Group();rotor.position.set(0,2.12,.1);body.add(rotor);const bg=new THREE.BoxGeometry(5.7,.05,.34);bg.translate(2.85,0,0);
  for(let k=0;k<4;k++){const b=new THREE.Mesh(bg,dark);b.rotation.y=k*Math.PI/2;b.rotation.x=.04;rotor.add(b);}
  const disc=new THREE.Mesh(new THREE.CircleGeometry(5.75,40),new THREE.MeshBasicMaterial({color:0x0b0d10,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide}));disc.rotation.x=-Math.PI/2;disc.position.copy(rotor.position);body.add(disc);
  const trot=new THREE.Group();trot.position.set(.2,1.45,9.45);body.add(trot);const tb=new THREE.BoxGeometry(.04,1.6,.16);for(let k=0;k<2;k++){const b=new THREE.Mesh(tb,dark);b.rotation.x=k*Math.PI/2;trot.add(b);}
  // beacons and the searchlight
  const bm=new THREE.MeshBasicMaterial({color:0xff2a2a,fog:false});const beacons=[[0,2.15,9.6],[0,-1.45,.3]].map(p=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),bm);m.position.set(...p);body.add(m);return m;});
  const search=new THREE.SpotLight(0xfff4dc,0,90,.32,.5,1.2);search.position.set(0,-1.2,-2.8);body.add(search);const tgt=new THREE.Object3D();tgt.position.set(0,-12,-9);body.add(tgt);search.target=tgt;
  const cone=new THREE.Mesh(new THREE.ConeGeometry(4.2,16,20,1,true),new THREE.MeshBasicMaterial({color:0xfff2d0,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));
  cone.geometry.translate(0,-8,0);cone.position.copy(search.position);cone.lookAt(new THREE.Vector3(0,-12,-9));cone.rotateX(-Math.PI/2);body.add(cone);
  // a jump-here chevron over the door
  const chev=new THREE.Mesh(new THREE.ConeGeometry(.35,.7,4),new THREE.MeshBasicMaterial({color:0x43f0ff,fog:false}));chev.rotation.x=Math.PI;chev.position.set(-3.1,.6,.17);body.add(chev);
  g.visible=false;scene.add(g);
  return {g,body,rotor,trot,disc,door,doorM,frameM,seat,doorPt,stairs,beacons,search,cone,chev};})();
const EX={phase:'none',t:0,land:new THREE.Vector3(),far:new THREE.Vector3(),app:new THREE.Vector3(),dir:new THREE.Vector2(0,1),yaw:0,landYaw:0,prompt:0,off:new THREE.Vector2(),snd:null,board0:new THREE.Vector3()};
const _hp=new THREE.Vector3(),_hq=new THREE.Vector3();
function heliSound(on){if(!AU.ctx)return;const ctx=AU.ctx;if(on&&!EX.snd){const n=ctx.createBufferSource();n.buffer=AU.noise;n.loop=true;const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=190;bp.Q.value=.8;
    const am=ctx.createGain();am.gain.value=.55;const lfo=ctx.createOscillator();lfo.type='sawtooth';lfo.frequency.value=11;const lg=ctx.createGain();lg.gain.value=.5;lfo.connect(lg);lg.connect(am.gain);
    const lo=ctx.createBiquadFilter();lo.type='lowpass';lo.frequency.value=900;n.connect(bp);bp.connect(am);const wh=ctx.createOscillator();wh.frequency.value=3150;const wg=ctx.createGain();wg.gain.value=.012;wh.connect(wg);
    const out=ctx.createGain();out.gain.value=0;am.connect(lo);lo.connect(out);wg.connect(out);const p=panTo(out,0,0,0);p.refDistance=22;p.rolloffFactor=1;
    for(const s of [n,lfo,wh])s.start();EX.snd={out,p,stop:()=>{try{out.gain.setTargetAtTime(0,ctx.currentTime,.3);setTimeout(()=>{for(const s of [n,lfo,wh])s.stop();out.disconnect();p.disconnect();},1500);}catch(e){}}};out.gain.setTargetAtTime(3.2,ctx.currentTime,2);}
  if(!on&&EX.snd){EX.snd.stop();EX.snd=null;}}
function extractBuild(){BOSS.reset();EX.bossT=0;if(extract)scene.remove(extract.g);heliSound(false);EX.phase='none';EX.t=0;PL.ride=null;
  const g=new THREE.Group();const [x,z]=END,y=H(x,z);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,90,16,1,true),new THREE.MeshBasicMaterial({color:0x43f0ff,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));beam.position.y=45;g.add(beam);
  const pad=new THREE.Mesh(new THREE.RingGeometry(7.2,8,40),new THREE.MeshBasicMaterial({color:0x43f0ff,transparent:true,opacity:.6,side:THREE.DoubleSide}));pad.rotation.x=-Math.PI/2;pad.position.y=.12;g.add(pad);
  const hm=new THREE.Mesh(new THREE.PlaneGeometry(5,5),new THREE.MeshBasicMaterial({map:canvasTex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='rgba(67,240,255,.75)';c.font='700 110px Barlow,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('H',w/2,h/2+6);}),transparent:true,depthWrite:false}));hm.rotation.x=-Math.PI/2;hm.position.y=.13;g.add(hm);
  g.position.set(x,y,z);scene.add(g);extract={g,beam,y};
  EX.land.set(x,y+2.1,z);
  // come in off the water: the direction from the pad with the most sea
  let best=-1e9,ba=0;for(let k=0;k<24;k++){const a=k/24*Math.PI*2;let s=0;for(const r of [80,160,260])s+=-sdWater(x+Math.cos(a)*r,z+Math.sin(a)*r);if(s>best){best=s;ba=a;}}
  EX.dir.set(Math.cos(ba),Math.sin(ba));EX.far.set(x+EX.dir.x*480,y+110,z+EX.dir.y*480);EX.app.set(x+EX.dir.x*70,y+32,z+EX.dir.y*70);
  HELI.g.visible=false;HELI.search.intensity=0;}
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function heliPose(dt){if(EX.phase==='bonus')return;const h=HELI.g;const prev=_hq.copy(h.position);let pitch=0,roll=0;
  if(EX.phase==='inbound'){const k=clamp(1-holdT/MIS.hold,0,1);
    if(k<.68){const u=ease(k/.68);h.position.lerpVectors(EX.far,EX.app,u);h.position.y+=Math.sin(u*Math.PI)*12;}
    else if(k<.9){const u=(k-.68)/.22,e=1-Math.pow(1-u,2);_hp.copy(EX.land);_hp.y+=11;h.position.lerpVectors(EX.app,_hp,e);pitch=lerp(.0,.18,u)*(u<.8?1:(1-u)*5);}
    else{const u=(k-.9)/.1;_hp.copy(EX.land);_hp.y+=11;h.position.lerpVectors(_hp,EX.land,1-Math.pow(1-u,1.6));}
    const vx=h.position.x-prev.x,vz=h.position.z-prev.z,sp=Math.hypot(vx,vz)/Math.max(dt,1e-3);
    if(k<.9&&sp>.5)EX.yaw=Math.atan2(-vx,-vz);else{// pedal-turn so the open door faces you
      const want=Math.atan2(PL.x-EX.land.x,PL.z-EX.land.z)-Math.PI/2;EX.landYaw=want;let d=want-EX.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));EX.yaw+=clamp(d,-dt*.9,dt*.9);}
    if(k<.68)pitch=-clamp(sp/45,0,1)*.22;}
  else if(EX.phase==='landed'||EX.phase==='board'){h.position.copy(EX.land);h.position.y+=Math.sin(T*2.2)*.04;}
  else if(EX.phase==='lift'){const t=EX.t;const up=Math.min(1,t/3.5);h.position.copy(EX.land);h.position.y+=ease(up)*22+Math.max(0,t-3)*6;
    const fwd=Math.max(0,t-2.2);h.position.x+=EX.dir.x*fwd*fwd*2.2;h.position.z+=EX.dir.y*fwd*fwd*2.2;
    const want=Math.atan2(-EX.dir.x,-EX.dir.y);let d=want-EX.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));EX.yaw+=clamp(d,-dt*.5,dt*.5);pitch=-clamp(fwd*.08,0,.2);roll=Math.sin(t*.7)*.04;}
  h.rotation.set(0,EX.yaw,0);HELI.body.rotation.set(pitch,0,roll);}
function heliUpdate(dt){if(EX.phase==='none')return;const h=HELI.g;EX.t+=dt;heliPose(dt);
  {const riding=!!PL.ride;HELI.door.visible=!riding;HELI.disc.visible=!riding;HELI.seat.position.x=BON.active?-1.25:-.55;
    // as door gunner, only the rotor blades and skids stay in view, so the hull never blocks your aim
    const gun=BON.active&&riding;if(HELI.gunView!==gun){HELI.gunView=gun;for(const c of HELI.body.children){if(c===HELI.rotor||c===HELI.trot||c===HELI.seat||c===HELI.doorPt||c===HELI.stairs||c.isLight||c===HELI.search.target)continue;
      const keep=c.material&&c.material.color&&c.material.color.getHex()===0x7c8590;c.visible=!gun||keep;}HELI.cone.visible=!gun;HELI.chev.visible=false;}}
  const spin=EX.phase==='lift'||EX.phase==='inbound'?1:.9;HELI.rotor.rotation.y+=dt*spin*30;HELI.trot.rotation.x+=dt*60;HELI.disc.material.opacity=.13+Math.random()*.03;
  const bl=(T%1)<.12;for(const b of HELI.beacons)b.visible=bl;
  const night=OPT.tod==='night';HELI.search.intensity=(EX.phase==='lift'?0:night?50:22)*(HELI.gunView?.6:1);HELI.cone.visible=EX.phase!=='lift'&&!HELI.gunView;HELI.cone.material.opacity=night?.09:.05;
  {const want=EX.phase==='landed'||EX.phase==='board'?1:0;const st=HELI.stairs;const cur=st.scale.x;const nx=want?Math.min(1,cur+dt*1.1):Math.max(.02,cur-dt*.9);st.scale.x=nx;st.visible=nx>.03;if(want&&cur<1&&nx>=1)sfx('step');}
  const ready=EX.phase==='landed';HELI.chev.visible=ready&&!HELI.gunView;if(ready){HELI.chev.position.y=.6+Math.sin(T*5)*.15;HELI.frameM.color.setHSL(.07,1,.5+.2*Math.sin(T*8));}else HELI.frameM.color.setHex(0xff7a22);
  if(EX.snd){if(EX.snd.p.positionX){EX.snd.p.positionX.value=h.position.x;EX.snd.p.positionY.value=h.position.y;EX.snd.p.positionZ.value=h.position.z;}}
  // downwash: grit and leaves blasted out under the rotor
  const agl=h.position.y-H(h.position.x,h.position.z);if(agl<22){const n=agl<6?4:2;for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,r=2+Math.random()*5;const gx=h.position.x+Math.cos(a)*r,gz=h.position.z+Math.sin(a)*r;
      PFX.add(gx,H(gx,gz)+.2,gz,Math.cos(a)*(5+Math.random()*4),.4+Math.random()*1.2,Math.sin(a)*(5+Math.random()*4),Math.random()<.3?0x5c6a2e:0x6a6253,.16,.9);}}
  if(EX.phase==='landed'){HELI.body.updateMatrixWorld(true);HELI.doorPt.getWorldPosition(_hp);const d=Math.hypot(PL.x-_hp.x,PL.z-_hp.z);const deployed=HELI.stairs.scale.x>.95;const onSteps=d<2.1;EX.prompt-=dt;$('tJump').hidden=true;
    if(EX.prompt<=0){EX.prompt=d<8?1.6:3;msg(d<8&&deployed?'UP THE STEPS!':'GET TO THE CHOPPER!',1.8);}
    if(onSteps&&deployed)heliBoard();}
  if(EX.phase==='board'){HELI.body.updateMatrixWorld(true);const foot=HELI.doorPt.getWorldPosition(new THREE.Vector3());const sill=HELI.stairs.getWorldPosition(new THREE.Vector3());HELI.seat.getWorldPosition(_hp);
    const t=EX.t;let px,py,pz;
    if(t<.35){const u=t/.35;px=lerp(EX.board0.x,foot.x,u);pz=lerp(EX.board0.z,foot.z,u);py=lerp(EX.board0.y,H(foot.x,foot.z),u);}
    else if(t<1.35){const u=(t-.35)/1;const k=Math.floor(u*4.4);if(k!==EX.stepK){EX.stepK=k;sfx('step');}px=lerp(foot.x,sill.x,u);pz=lerp(foot.z,sill.z,u);py=lerp(H(foot.x,foot.z),sill.y,u)+Math.abs(Math.sin(u*Math.PI*4.4))*.06;}
    else{const u=Math.min(1,(t-1.35)/.4);px=lerp(sill.x,_hp.x,u);pz=lerp(sill.z,_hp.z,u);py=lerp(sill.y,_hp.y,u);}
    PL.ride={y:py};placeRider(px,pz);if(t>=1.75){EX.phase='lift';EX.t=0;msg("YOU'RE ON! HOLD TIGHT",2.4);tone(520,780,.25,.08,'triangle');}}
  if(EX.phase==='lift'){HELI.body.updateMatrixWorld(true);HELI.seat.getWorldPosition(_hp);PL.ride={y:_hp.y};placeRider(_hp.x,_hp.z);if(EX.t>7.5&&state==='play'&&!BON.active){win();}}
  EX.jump=false;}
function placeRider(x,z){if(renderer.xr.isPresenting){rig.position.set(x-EX.off.x,PL.ride.y,z-EX.off.y);}PL.x=x;PL.z=z;}
function heliBoard(){EX.phase='board';EX.stepK=-1;musicBossOn(false);EX.t=0;$('tJump').hidden=true;sfx('step');tone(300,600,.18,.1,'triangle');
  EX.board0.set(PL.x,H(PL.x,PL.z),PL.z);if(renderer.xr.isPresenting){camera.getWorldPosition(_v1);EX.off.set(_v1.x-rig.position.x,_v1.z-rig.position.z);}else EX.off.set(0,0);}
function extractUpdate(dt){const [ex,ez]=END;const d=Math.hypot(ex-PL.x,ez-PL.z);extract.beam.material.opacity=EX.phase==='none'?.12+Math.sin(T*3)*.05:.05;
  if(EX.phase==='none'&&d<8&&state==='play'){EX.phase='inbound';EX.t=0;holdT=MIS.hold;HELI.g.visible=true;HELI.g.position.copy(EX.far);EX.yaw=Math.atan2(EX.dir.x,EX.dir.y);heliSound(true);msg('HOLD ON! THE HELICOPTER IS INBOUND',2.6);siren();hordeT=4;EX.bossT=2.8;}
  if(EX.bossT>0){EX.bossT-=dt;if(EX.bossT<=0&&state==='play')BOSS.spawn();}
  if(EX.phase==='inbound'){holdT-=dt;if(d>18&&Math.random()<dt*.4)msg('STAY NEAR THE PAD!',1.2);if(holdT<=0){holdT=0;EX.phase='landed';EX.t=0;EX.prompt=0;msg('GET TO THE CHOPPER!',3);tone(660,990,.3,.1,'triangle');}}
  heliUpdate(dt);}

function placePicks(){for(const p of PICKS)world.remove(p.m);PICKS=[];const kinds=['snack','lens','snack','fins','snack','ao','cell','snack','snack'];
  for(let k=0;k<kinds.length;k++){const t=(k+.7)/(kinds.length+.6);const x=lerp(START[0],END[0],t)+(Math.random()-.5)*60,z=lerp(START[1],END[1],t)+(Math.random()-.5)*60;const [px,pz]=snapWalk(x,z,30);PICKS.push(pickup(kinds[k],px,pz));}}
const PICK_DEF={snack:{label:"FRIAR TUCK'S SNACK BOX +40 HEALTH",col:0x38d45f},lens:{label:'FOCUSING LENS: MORE POWER',col:0xff3d8b},fins:{label:'COOLING FINS: RUNS COOLER',col:0x43f0ff},ao:{label:'ADAPTIVE OPTICS: BEAM CUTS THROUGH 3',col:0xb46bff},cell:{label:'CRYO CELL: HEAT RESET',col:0x9bffcf}};
function pickup(kind,x,z){const d=PICK_DEF[kind];const g=new THREE.Group();const box=kind==='snack'?new THREE.Mesh(new THREE.BoxGeometry(.46,.3,.34),SNACK_MAT):new THREE.Mesh(new THREE.OctahedronGeometry(.25),new THREE.MeshBasicMaterial({color:d.col}));box.position.y=1.1;g.add(box);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.03,6,24),new THREE.MeshBasicMaterial({color:d.col,transparent:true,opacity:.7}));ring.rotation.x=Math.PI/2;ring.position.y=.08;g.add(ring);
  g.position.set(x,H(x,z),z);world.add(g);return {kind,x,z,m:g,box,on:true};}
function trySpawn(rmin,rmax,type,sector=null){for(let tries=0;tries<14;tries++){const a=sector!=null?sector+(Math.random()-.5)*1.1:Math.random()*Math.PI*2,r=rmin+Math.random()*(rmax-rmin);const x=TGT.x+Math.cos(a)*r,z=TGT.z+Math.sin(a)*r;
    if(blockedR(x,z,.5))continue;const ni=navIdx(x,z);if(ni<0||NAV[ni])continue;if(DIST[ni]<0&&r<140)continue;
    // not right in front of you if it can be helped
    if(sector==null&&r<45&&TGT===PL){const fx=-Math.sin(PL.yaw),fz=-Math.cos(PL.yaw);if(((x-PL.x)*fx+(z-PL.z)*fz)/r>.6)continue;}
    return spawnZombie(x,z,type);}return null;}
function progress(){return clamp(1-Math.hypot(END[0]-TGT.x,END[1]-TGT.z)/totalDist,0,1);}

// ================================================================ input
const keys={};addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Escape'&&state==='play')pause();if(e.code==='KeyR'&&state==='end')startMission();});addEventListener('keyup',e=>{keys[e.code]=false;});
document.addEventListener('pointerlockchange',()=>{if(!document.pointerLockElement&&state==='play'&&!coarse&&!renderer.xr.isPresenting)pause();});
let mouseDown=false;view.addEventListener('mousedown',e=>{if(state!=='play')return;audioInit();if(document.pointerLockElement!==view&&!coarse)view.requestPointerLock?.();if(e.button===0)mouseDown=true;});addEventListener('mouseup',e=>{if(e.button===0)mouseDown=false;});
addEventListener('mousemove',e=>{if(document.pointerLockElement===view&&state==='play'){PL.yaw-=e.movementX*.0022;PL.pitch=clamp(PL.pitch-e.movementY*.0022,-1.3,1.3);}});
const touch={mx:0,mz:0,fire:false,run:false,jump:false,look:null};
{const st=$('tStick'),kn=st.querySelector('.knob');let id=null;const upd=e=>{const r=st.getBoundingClientRect();let dx=(e.clientX-r.left-r.width/2)/(r.width/2),dy=(e.clientY-r.top-r.height/2)/(r.height/2);const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}touch.mx=dx;touch.mz=dy;kn.style.transform=`translate(${dx*36}px,${dy*36}px)`;};
  st.addEventListener('pointerdown',e=>{id=e.pointerId;try{st.setPointerCapture(id);}catch(_){}upd(e);audioInit();});st.addEventListener('pointermove',e=>{if(e.pointerId===id)upd(e);});
  for(const ev of ['pointerup','pointercancel'])st.addEventListener(ev,()=>{id=null;touch.mx=touch.mz=0;kn.style.transform='';});
  const lk=$('tLook');let lid=null,lx=0,ly=0;lk.addEventListener('pointerdown',e=>{lid=e.pointerId;try{lk.setPointerCapture(lid);}catch(_){}lx=e.clientX;ly=e.clientY;});
  lk.addEventListener('pointermove',e=>{if(e.pointerId!==lid)return;PL.yaw-=(e.clientX-lx)*.005;PL.pitch=clamp(PL.pitch-(e.clientY-ly)*.005,-1.2,1.2);lx=e.clientX;ly=e.clientY;});
  for(const ev of ['pointerup','pointercancel'])lk.addEventListener(ev,()=>{lid=null;});
  const hold=(el,k)=>{el.addEventListener('pointerdown',e=>{touch[k]=true;e.preventDefault();audioInit();});for(const ev of ['pointerup','pointercancel','pointerleave'])el.addEventListener(ev,()=>{touch[k]=false;});};
  hold($('tFire'),'fire');hold($('tJump'),'jump');$('tRun').addEventListener('pointerdown',()=>{touch.run=!touch.run;$('tRun').style.background=touch.run?'rgba(67,240,255,.7)':'';});$('tPause').addEventListener('click',()=>pause());}
// VR controllers: right hand holds the laser; left stick walks, right stick snap-turns
const ctl=[0,1].map(i=>{const g=renderer.xr.getControllerGrip(i);rig.add(g);const c=renderer.xr.getController(i);rig.add(c);g.userData.hand=null;
  c.addEventListener('connected',e=>{c.userData.gp=e.data.gamepad;c.userData.hand=e.data.handedness;CTL[e.data.handedness]=Object.assign(CTL[e.data.handedness]||{},{ray:c});attachHands();});
  g.addEventListener('connected',e=>{g.userData.hand=e.data.handedness;g.userData.gp=e.data.gamepad;CTL[e.data.handedness]=Object.assign(CTL[e.data.handedness]||{},{grip:g});attachHands();});
  g.addEventListener('disconnected',()=>{g.userData.hand=null;});return g;});
function attachHands(){const gh=gunHand(),oh=gh==='left'?'right':'left';const G=CTL[gh]?.grip,O=CTL[oh]?.grip;
  if(G){G.add(GUN.g);GUN.g.position.set(0,-.02,.04);GUN.g.rotation.set(-.55,0,0);GUN.g.scale.setScalar(1);}if(O)O.add(VRHUD.mesh);if(CTL[gh]?.ray)VRM.st.ctl=CTL[gh].ray;}
let snapWas=false,vrFire=false,vrRun=false,LASTDT=1/60;const CTL={};const gunHand=()=>OPT.hand==='left'?'left':'right';
function readInput(){let mx=0,mz=0,fire=false,run=false;
  if(keys.KeyW||keys.ArrowUp||keys.KeyI)mz-=1;if(keys.KeyS||keys.ArrowDown||keys.KeyK)mz+=1;if(keys.KeyA||keys.ArrowLeft||keys.KeyJ)mx-=1;if(keys.KeyD||keys.ArrowRight||keys.KeyL)mx+=1;if(keys.ShiftLeft||keys.ShiftRight)run=true;if(mouseDown||keys.Space)fire=true;
  if(touch.mx||touch.mz){mx+=touch.mx;mz+=touch.mz;}if(touch.fire)fire=true;if(touch.run)run=true;
  for(const gp of navigator.getGamepads?navigator.getGamepads():[]){if(!gp||gp.mapping!=='standard')continue;const dz=v=>Math.abs(v)<.15?0:v;const L=OPT.hand==='left',mv=L?2:0,lk=L?0:2;mx+=dz(gp.axes[mv]);mz+=dz(gp.axes[mv+1]);PL.yaw-=dz(gp.axes[lk])*.045;PL.pitch=clamp(PL.pitch-dz(gp.axes[lk+1])*.035,-1.2,1.2);
    if(gp.buttons[L?6:7]?.value>.3||gp.buttons[L?4:5]?.pressed)fire=true;if(gp.buttons[L?11:10]?.pressed||gp.buttons[L?7:6]?.value>.3)run=true;if(gp.buttons[9]?.pressed&&state==='play')pause();}
  if(renderer.xr.isPresenting){vrFire=false;for(const g of ctl){const gp=g.userData.gp;if(!gp)continue;const ax=gp.axes,X=ax.length>=4?ax[2]:ax[0],Y=ax.length>=4?ax[3]:ax[1];
      const gh=gunHand();
      if(g.userData.hand!==gh){mx+=Math.abs(X)>.15?X:0;mz+=Math.abs(Y)>.15?Y:0;if(gp.buttons[3]?.pressed||gp.buttons[1]?.pressed||gp.buttons[0]?.value>.5)run=true;}
      else{if(gp.buttons[0]?.value>.25)fire=vrFire=true;
        if(OPT.vrturn==='snap'){const s=Math.abs(X)>.7?Math.sign(X):0;if(s&&!snapWas){PL.yaw-=s*Math.PI/6;}snapWas=!!s;}
        else{const ax=Math.abs(X)>.15?(Math.abs(X)-.15)/.85*Math.sign(X):0;PL.yaw-=ax*Math.abs(ax)*2.6*LASTDT;}}
      const pb=!!(gp.buttons[5]?.pressed||gp.buttons[12]?.pressed);if(pb&&!g.userData.pbWas&&state==='play'){state='paused';VRM.open();}g.userData.pbWas=pb;}}
  let jump=!!(keys.KeyE||keys.KeyF||keys.KeyU||keys.KeyO||touch.jump);for(const gp of navigator.getGamepads?navigator.getGamepads():[]){if(gp&&gp.mapping==='standard'&&(gp.buttons[0]?.pressed||gp.buttons[2]?.pressed))jump=true;}
  if(renderer.xr.isPresenting)for(const g of ctl){const gp=g.userData.gp;if(gp&&gp.buttons[4]?.pressed)jump=true;}
  const l=Math.hypot(mx,mz);if(l>1){mx/=l;mz/=l;}return {mx,mz,fire,run,jump};}
function pause(){if(state!=='play')return;state='paused';document.exitPointerLock?.();$('title').hidden=false;$('bPlay').textContent='Resume';$('hud').hidden=true;$('touch').hidden=true;}

// ================================================================ VR wrist panel
const VRHUD=(()=>{const c=document.createElement('canvas');c.width=512;c.height=300;const g=c.getContext('2d');const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.2,.117),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthTest:false}));mesh.position.set(0,.06,.02);mesh.rotation.set(-1.0,0,0);mesh.renderOrder=30;
  const msgC=document.createElement('canvas');msgC.width=1024;msgC.height=160;const mg=msgC.getContext('2d');const mtex=new THREE.CanvasTexture(msgC);const msgM=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.25),new THREE.MeshBasicMaterial({map:mtex,transparent:true,depthTest:false}));msgM.position.set(0,.2,-2);msgM.renderOrder=31;msgM.visible=false;camera.add(msgM);
  return {mesh,msg:'',msgT:0,draw(){g.clearRect(0,0,512,300);g.fillStyle='rgba(8,10,16,.86)';g.beginPath();g.roundRect(4,4,504,292,26);g.fill();g.strokeStyle='rgba(67,240,255,.5)';g.lineWidth=3;g.stroke();
      g.fillStyle='#9fb0bd';g.font='600 26px Barlow,sans-serif';g.fillText('HEALTH',24,46);g.fillText(LZ.over?'VENTING':'LASER HEAT',24,124);
      g.fillStyle='rgba(255,255,255,.14)';g.fillRect(24,58,464,26);g.fillRect(24,136,464,26);g.fillStyle='#ff5a4a';g.fillRect(24,58,464*PL.hp/PL.maxhp,26);g.fillStyle=LZ.over?'#ff3d8b':'#43f0ff';g.fillRect(24,136,464*LZ.heat,26);
      const d=END?Math.round(Math.hypot(END[0]-PL.x,END[1]-PL.z)):0;g.fillStyle='#fff';g.font='700 34px Barlow,sans-serif';g.fillText(holdT>0?`HOLD ON: ${Math.ceil(holdT)} s`:`${d} m to ${MIS.endName}`,24,212);
      g.fillStyle='#9fb0bd';g.font='600 26px Barlow,sans-serif';g.fillText(`${kills} lasered · ${fmt(T)}`,24,262);tex.needsUpdate=true;
      if(this.msgT>0){mg.clearRect(0,0,1024,160);mg.fillStyle='rgba(8,10,16,.75)';mg.fillRect(0,20,1024,120);mg.fillStyle='#fff';mg.font='700 72px Barlow,sans-serif';mg.textAlign='center';mg.fillText(this.msg,512,108);mtex.needsUpdate=true;msgM.visible=renderer.xr.isPresenting;}else msgM.visible=false;}};})();
const fmt=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
// ================================================================ VR head-up display: a strip at the top of your view (health, heat, objective, arrow, kills, time), a minimap low right, and a red flash when you're bitten
function drawMiniMap(g,W,yaw){g.save();g.clearRect(0,0,W,W);g.beginPath();g.arc(W/2,W/2,W/2,0,Math.PI*2);g.clip();g.fillStyle='#0b1016';g.fillRect(0,0,W,W);
  const sc=W/300*1.1;g.translate(W/2,W/2);g.rotate(yaw);g.scale(sc,sc);g.drawImage(MAPIMG,-(PL.x-AREA.x0)/2,-(PL.z-AREA.z0)/2);
  for(const z of Z){if(z.dead)continue;g.fillStyle=z.type==='brute'?'#ff9a3a':'#ff4a4a';g.fillRect((z.x-PL.x)/2-1.5,(z.z-PL.z)/2-1.5,3,3);}
  if(BON.active){g.fillStyle='#5dff8a';g.beginPath();g.arc((NPC.x-PL.x)/2,(NPC.z-PL.z)/2,5,0,Math.PI*2);g.fill();}
  if(BOSS.B.on&&!BOSS.B.dead){g.fillStyle='#ffb040';g.beginPath();g.arc((BOSS.B.x-PL.x)/2,(BOSS.B.z-PL.z)/2,7,0,Math.PI*2);g.fill();for(const sh of BOSS.B.shots){g.fillStyle='#ff5a1a';g.beginPath();g.arc((sh.ring.position.x-PL.x)/2,(sh.ring.position.z-PL.z)/2,3,0,Math.PI*2);g.fill();}}
  g.fillStyle='#43f0ff';g.beginPath();g.arc((END[0]-PL.x)/2,(END[1]-PL.z)/2,5,0,Math.PI*2);g.fill();for(const p of PICKS)if(p.on){g.fillStyle=p.kind==='snack'?'#38d45f':'#ffd34a';g.fillRect((p.x-PL.x)/2-2,(p.z-PL.z)/2-2,4,4);}g.restore();
  g.fillStyle='#fff';const k=W/300;g.beginPath();g.moveTo(W/2,W/2-9*k);g.lineTo(W/2+6*k,W/2+6*k);g.lineTo(W/2-6*k,W/2+6*k);g.fill();
  g.strokeStyle='rgba(67,240,255,.6)';g.lineWidth=3;g.beginPath();g.arc(W/2,W/2,W/2-2,0,Math.PI*2);g.stroke();}
const VRH=(()=>{const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return {c,g:c.getContext('2d'),t};};
  const S=mk(1024,190),M=mk(256,256);
  const face=(m,x,y,z)=>{m.position.set(x,y,z);const mt=new THREE.Matrix4().lookAt(m.position,m.position.clone().multiplyScalar(2),new THREE.Vector3(0,1,0));m.quaternion.setFromRotationMatrix(mt);};
  const strip=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.204),new THREE.MeshBasicMaterial({map:S.t,transparent:true,depthTest:false,fog:false}));strip.renderOrder=35;face(strip,0,.37,-1.4);camera.add(strip);
  const mini=new THREE.Mesh(new THREE.PlaneGeometry(.27,.27),new THREE.MeshBasicMaterial({map:M.t,transparent:true,depthTest:false,fog:false}));mini.renderOrder=35;face(mini,.47,-.34,-1.3);camera.add(mini);
  const vt=canvasTex(256,256,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,w*.22,w/2,h/2,w*.52);gr.addColorStop(0,'rgba(200,0,20,0)');gr.addColorStop(1,'rgba(200,0,20,.85)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
  const vign=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.2),new THREE.MeshBasicMaterial({map:vt,transparent:true,opacity:0,depthTest:false,depthWrite:false,fog:false}));vign.position.set(0,0,-.3);vign.renderOrder=36;camera.add(vign);
  const all=[strip,mini,vign];for(const m of all)m.visible=false;
  function bar(g,x,y,w,h,f,c){g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.roundRect(x,y,w,h,h/2);g.fill();if(f>0){g.fillStyle=c;g.beginPath();g.roundRect(x,y,Math.max(h,w*f),h,h/2);g.fill();}}
  function draw(yaw){const g=S.g;g.clearRect(0,0,1024,190);g.fillStyle='rgba(8,10,16,.62)';g.beginPath();g.roundRect(2,2,1020,186,30);g.fill();
    g.fillStyle='#9fb0bd';g.font='600 22px Barlow,sans-serif';g.fillText('HEALTH',30,44);g.fillText(LZ.over?'VENTING':'LASER HEAT',30,112);
    g.textAlign='right';g.fillStyle='#fff';g.fillText(String(Math.max(0,Math.ceil(PL.hp))),300,44);g.fillText(LZ.over?'VENT':Math.round(LZ.heat*100)+'%',300,112);g.textAlign='left';
    bar(g,30,56,270,22,clamp(PL.hp/PL.maxhp,0,1),PL.hp<PL.maxhp*.35?'#ff3a3a':'#ff6a4a');bar(g,30,124,270,22,LZ.heat,LZ.over?'#ff3d8b':LZ.heat>.7?'#ffb43a':'#43f0ff');
    // objective and its arrow
    const d=END?Math.round(Math.hypot(END[0]-PL.x,END[1]-PL.z)):0;let t1,t2;
    if(BON.active){t1=`SURVIVOR: ${Math.max(0,Math.ceil(NPC.hp))}% · ${Math.round(Math.hypot(END[0]-NPC.x,END[1]-NPC.z))} m`;t2='Bonus: cover them from the chopper';}else if(EX.phase==='landed'){t1='GET TO THE CHOPPER!';t2='Walk up the steps into the cabin';}else if(PL.ride){t1='EXTRACTING';t2='Hold tight';}else if(holdT>0){t1=`HOLD ON: ${Math.ceil(holdT)} s`;t2=BOSS.B.on&&!BOSS.B.dead?'Dodge the hot marshmallows!':'The helicopter is coming in';}else{t1=`${MIS.endName}: ${d} m`;t2='Follow the blue light';}
    g.textAlign='center';g.fillStyle='#fff';g.font='700 34px Barlow,sans-serif';g.fillText(t1,512,104);g.fillStyle='#9fb0bd';g.font='500 22px Barlow,sans-serif';g.fillText(t2,512,140);
    if(END&&!PL.ride){const dx=END[0]-PL.x,dz=END[1]-PL.z,fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);const a=Math.atan2(dx*rx+dz*rz,dx*fx+dz*fz);
      g.save();g.translate(512,46);g.rotate(a);g.fillStyle='#43f0ff';g.beginPath();g.moveTo(0,-22);g.lineTo(17,18);g.lineTo(0,9);g.lineTo(-17,18);g.closePath();g.fill();g.restore();}
    g.textAlign='right';g.fillStyle='#fff';g.font='700 40px "Rubik Mono One",Barlow,sans-serif';g.fillText(String(kills),994,62);g.fillStyle='#9fb0bd';g.font='600 22px Barlow,sans-serif';g.fillText('lasered',994,92);
    g.fillStyle='#fff';g.font='600 30px Barlow,sans-serif';g.fillText(fmt(T),994,142);g.textAlign='left';S.t.needsUpdate=true;
    drawMiniMap(M.g,256,yaw);M.t.needsUpdate=true;}
  let tick=0;
  function update(dt){const on=renderer.xr.isPresenting&&state==='play'&&OPT.vrhud!==false;strip.visible=mini.visible=on;
    const hurt=renderer.xr.isPresenting&&state==='play'?(PL.hurtT>0?.75:PL.hp<PL.maxhp*.35?.25+Math.sin(T*6)*.1:0):0;vign.visible=hurt>0;vign.material.opacity=hurt;
    if(!on)return;tick-=dt;if(tick>0)return;tick=.1;camera.getWorldDirection(_v1);draw(Math.atan2(-_v1.x,-_v1.z));}
  return {update};})();

// ================================================================ in-headset menu: point the right controller and pull the trigger. Missions, difficulty, options, the lab, and your results
const VRM=(()=>{const W=1024,Hh=960;const c=document.createElement('canvas');c.width=W;c.height=Hh;const g=c.getContext('2d');const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.5),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,fog:false}));mesh.renderOrder=40;mesh.visible=false;scene.add(mesh);
  const rayG=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-1)]);const ray=new THREE.Line(rayG,new THREE.LineBasicMaterial({color:0x43f0ff,transparent:true,opacity:.8,depthTest:false}));ray.renderOrder=41;ray.visible=false;
  const dot=new THREE.Mesh(new THREE.CircleGeometry(.012,16),new THREE.MeshBasicMaterial({color:0xffffff,depthTest:false}));dot.renderOrder=42;dot.visible=false;mesh.add(dot);dot.position.z=.002;
  const st={open:false,page:'main',result:null,hot:-1,btns:[],trigWas:true,ctl:null};
  const rr=(x,y,w,h,r)=>{g.beginPath();g.roundRect(x,y,w,h,r);};
  function btn(x,y,w,h,label,on,act,opt={}){const i=st.btns.length;st.btns.push({x,y,w,h,act,dis:opt.dis});const hot=i===st.hot&&!opt.dis;
    rr(x,y,w,h,14);g.fillStyle=opt.dis?'rgba(255,255,255,.04)':on?'#43f0ff':hot?'rgba(67,240,255,.28)':'rgba(255,255,255,.08)';g.fill();g.strokeStyle=on||hot?'#43f0ff':'rgba(180,210,230,.3)';g.lineWidth=2;g.stroke();
    g.fillStyle=opt.dis?'#5d6873':on?'#04141a':'#eef2f5';g.font=`${opt.bold||on?700:600} ${opt.fs||26}px Barlow,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(label,x+w/2,y+h/2+1);g.textAlign='left';g.textBaseline='alphabetic';}
  function draw(){st.btns=[];g.clearRect(0,0,W,Hh);rr(4,4,W-8,Hh-8,34);g.fillStyle='rgba(8,10,16,.93)';g.fill();g.strokeStyle='rgba(67,240,255,.55)';g.lineWidth=3;g.stroke();
    g.fillStyle='#fff';g.font='700 46px "Rubik Mono One",Barlow,sans-serif';g.fillText('WARRENPOINT',40,72);g.fillStyle='#ff3d8b';g.fillText('UNDEAD',420,72);
    let y=100;
    if(st.result){const r=st.result;g.fillStyle=r.won?'#43f0ff':'#ff5a4a';g.font='700 34px Barlow,sans-serif';g.fillText(r.won?'EXTRACTED!':'YOU WERE OVERRUN',40,y+30);g.fillStyle='#9fb0bd';g.font='500 24px Barlow,sans-serif';
      g.fillText(`${r.title} · ${fmt(r.T)} · ${r.kills} lasered · ${r.ghosts} ghosts · +${r.earned} credits`,40,y+64);y+=86;}
    if(st.page==='main'){g.fillStyle='#43f0ff';g.font='700 20px Barlow,sans-serif';g.fillText('MISSION',40,y+28);y+=40;
      MISSIONS.forEach((m,i)=>btn(40+i*318,y,300,64,`${m.title} · L${lvOf(m)}`,m===MIS,()=>{MIS=m;PICKD=null;useLevel();saveOpt();buildMenu();}),{fs:24});y+=84;
      g.fillStyle='#43f0ff';g.fillText('LEVEL',40,y+20);g.fillText('TIME OF DAY',540,y+20);y+=30;
      {g.fillStyle='#fff';g.font='700 34px Barlow,sans-serif';g.fillText('LEVEL '+lvOf(),40,y+40);g.fillStyle='#9fb0bd';g.font='500 20px Barlow,sans-serif';g.fillText('Win to level up',190,y+38);}
      [['dusk','Dusk'],['night','Night']].forEach(([v,l],i)=>btn(540+i*215,y,200,56,l,OPT.tod===v,()=>{OPT.tod=v;saveOpt2();applyTod();buildOptions();}));y+=76;
      g.fillStyle='#43f0ff';g.fillText('WEATHER',40,y+20);g.fillText('MUSIC',540,y+20);y+=30;
      [[true,'Thunderstorm'],[false,'Calm']].forEach(([v,l],i)=>btn(40+i*215,y,200,56,l,(OPT.storm!==false)===v,()=>{OPT.storm=v;saveOpt2();buildOptions();}));
      [[true,'Spooky music'],[false,'Off']].forEach(([v,l],i)=>btn(540+i*215,y,200,56,l,(OPT.music!==false)===v,()=>{OPT.music=v;saveOpt2();musicStart();musicSetVol();buildOptions();}));y+=76;
      g.fillStyle='#43f0ff';g.fillText('GUN HAND',40,y+20);g.fillText('TURNING',540,y+20);y+=30;
      [['right','Right hand'],['left','Left hand']].forEach(([v,l],i)=>btn(40+i*215,y,200,56,l,(OPT.hand==='left'?'left':'right')===v,()=>{OPT.hand=v;saveOpt2();applyHand();buildOptions();}));
      [['smooth','Smooth'],['snap','Snap']].forEach(([v,l],i)=>btn(540+i*215,y,200,56,l,(OPT.vrturn==='snap'?'snap':'smooth')===v,()=>{OPT.vrturn=v;saveOpt2();buildOptions();}));y+=76;
      g.fillStyle='#43f0ff';g.fillText('HEAD-UP DISPLAY',40,y+20);y+=30;
      [[true,'On'],[false,'Wrist panel only']].forEach(([v,l],i)=>btn(40+i*215,y,200,56,l,(OPT.vrhud!==false)===v,()=>{OPT.vrhud=v;saveOpt2();buildOptions();}));y+=86;
      const go=state==='paused'?'RESUME':st.result?'PLAY AGAIN':'START MISSION';
      btn(40,y,460,84,go,false,()=>{if(state==='paused'){close();state='play';return;}close();startMission();},{bold:1,fs:34});
      btn(524,y,460,84,`THE LAB · ${CRED} credits`,false,()=>{st.page='lab';},{fs:28});
      y+=100;btn(40,y,944,56,'Play the bonus round (practice)',false,()=>{close();practiceBonus();});
      if(state==='paused'){y+=70;btn(40,y,944,56,'Quit mission (back to menu)',false,()=>{state='menu';st.result=null;});}}
    else{g.fillStyle='#43f0ff';g.font='700 22px Barlow,sans-serif';g.fillText(`THE LAB · ${CRED} CREDITS TO SPEND`,40,y+28);y+=44;
      UPG_DEF.forEach(([k,name,desc],i)=>{const col=i%2,row=i/2|0,x=40+col*482,yy=y+row*150;rr(x,yy,462,136,16);g.fillStyle='rgba(255,255,255,.05)';g.fill();
        g.fillStyle='#fff';g.font='700 26px Barlow,sans-serif';g.fillText(name,x+16,yy+34);g.fillStyle='#9fb0bd';g.font='500 19px Barlow,sans-serif';g.fillText(desc,x+16,yy+62);
        for(let p=0;p<3;p++){g.fillStyle=p<UPG[k]?'#43f0ff':'rgba(255,255,255,.14)';g.fillRect(x+16+p*50,yy+78,44,8);}
        const lv=UPG[k],cost=UPG_COST[lv];btn(x+200,yy+80,246,44,lv>=3?'Maxed':`Upgrade: ${cost}`,false,()=>{if(lv>=3||CRED<cost)return;CRED-=cost;UPG[k]++;saveUpg();tone(660,990,.18,.08);buildOptions();},{dis:lv>=3||CRED<cost,fs:22});});
      btn(40,y+470,944,64,'BACK',false,()=>{st.page='main';},{bold:1,fs:28});}
    // trim the panel to its contents
    st.used=y;
    tex.needsUpdate=true;}
  function open(result){st.open=true;st.page='main';if(result!==undefined)st.result=result;st.trigWas=true;
    camera.getWorldPosition(_v1);camera.getWorldDirection(_v2);_v2.y=0;if(_v2.lengthSq()<1e-4)_v2.set(0,0,-1);_v2.normalize();
    mesh.position.copy(_v1).addScaledVector(_v2,1.7);mesh.position.y=_v1.y-.12;mesh.lookAt(_v1.x,mesh.position.y,_v1.z);mesh.visible=true;draw();}
  function close(){st.open=false;mesh.visible=false;ray.visible=false;}
  const rc=new THREE.Raycaster();
  function update(){if(!st.open)return;if(!renderer.xr.isPresenting){close();return;}
    // keep it in front of you if you walk off (snap turn / room scale)
    const c=st.ctl;if(!c){return;}if(ray.parent!==c)c.add(ray);ray.visible=true;
    c.updateMatrixWorld();rc.ray.origin.setFromMatrixPosition(c.matrixWorld);rc.ray.direction.set(0,0,-1).transformDirection(c.matrixWorld);
    const hit=rc.intersectObject(mesh,false)[0];let hot=-1;
    if(hit){ray.scale.z=hit.distance;const u=hit.uv;const px=u.x*W,py=(1-u.y)*Hh;dot.visible=true;dot.position.set((u.x-.5)*1.6,(u.y-.5)*1.5,.002);hot=st.btns.findIndex(b=>px>=b.x&&px<=b.x+b.w&&py>=b.y&&py<=b.y+b.h);}else{ray.scale.z=5;dot.visible=false;}
    if(hot!==st.hot){st.hot=hot;draw();if(hot>=0&&!st.btns[hot].dis)tone(1300,1300,.03,.03,'sine');}
    const gp=c.userData.gp;const trig=!!(gp&&gp.buttons[0]&&gp.buttons[0].value>.5);
    if(trig&&!st.trigWas&&hot>=0&&!st.btns[hot].dis){tone(880,1320,.07,.06,'triangle');st.btns[hot].act();if(st.open)draw();}st.trigWas=trig;}
  return {open,close,update,draw,st,mesh};})();


// ================================================================ simulation
function movePlayer(inp,dt){const vr=renderer.xr.isPresenting;let yaw=PL.yaw;
  if(vr){camera.getWorldDirection(_v1);yaw=Math.atan2(-_v1.x,-_v1.z);}
  const moving=Math.abs(inp.mz)>.2||Math.abs(inp.mx)>.2;const run=OPT.auto?moving:(inp.run&&PL.stam>.05&&moving);const spd=(run?5.2:3.1)*(1-(PL.slow||0));if(!OPT.auto)PL.stam=clamp(PL.stam+(run?-.24:.1)*dt,0,1);
  const fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw);let vx=(fx*-inp.mz+rx*inp.mx)*spd,vz=(fz*-inp.mz+rz*inp.mx)*spd;
  // VR: the head is the body; walk from where the head actually is
  let hx=PL.x,hz=PL.z;if(vr){camera.getWorldPosition(_v1);hx=_v1.x;hz=_v1.z;}
  let [ox,oz]=slide(hx,hz,vx*dt,vz*dt,.32);
  // zombies push back a little
  for(const z of Z){if(z.dead)continue;const dx=ox-z.x,dz=oz-z.z,d=Math.hypot(dx,dz);if(d<.7&&d>.01){ox+=dx/d*(.7-d)*.5;oz+=dz/d*(.7-d)*.5;}}
  if(vr){rig.position.x+=ox-hx;rig.position.z+=oz-hz;PL.x=ox;PL.z=oz;rig.position.y=H(ox,oz);}else{PL.x=ox;PL.z=oz;}
  const stepping=Math.hypot(vx,vz)>.5;if(stepping){PL.bob+=dt*(run?11:7.5);PL.stepT-=dt;if(PL.stepT<=0){PL.stepT=run?.32:.48;sfx('step');}}}
function syncCamera(){rig.position.set(PL.x,PL.ride?PL.ride.y:H(PL.x,PL.z),PL.z);rig.rotation.y=PL.yaw;camera.position.set((Math.random()-.5)*SHAKE*.3,1.62+Math.sin(PL.bob)*.035+(Math.random()-.5)*SHAKE*.3,0);SHAKE=Math.max(0,SHAKE-.02);camera.rotation.set(PL.pitch,0,0);rig.updateMatrixWorld(true);}
function fireLaser(inp,dt){if(!renderer.xr.isPresenting)syncCamera();LZ.firing=inp.fire&&!LZ.over&&state==='play';
  // a pulsed laser: while the trigger is held it fires a train of short, hard pulses (10 a second); each one is a hit, a flash and a crack
  if(LZ.firing){LZ.pT-=dt;while(LZ.pT<=0&&!LZ.over){LZ.pT+=1/LZ.rep;firePulse();}LZ.coolT=.35;}
  else{LZ.pT=Math.max(0,LZ.pT-dt);LZ.coolT-=dt;if(LZ.coolT<=0)LZ.heat=Math.max(0,LZ.heat-dt*(LZ.over?.42:.55)*LZ.sink);if(LZ.over&&LZ.heat<.28){LZ.over=false;tone(440,880,.15,.08);}}
  LZ.flash=Math.max(0,LZ.flash-dt*14);GUN.heatM.color.setHSL(lerp(.52,0,LZ.heat),1,.55);GUN.coilM.color.setHSL(LZ.over?0:LZ.firing?.07+.04*Math.random():.55,1,.5+.3*LZ.flash);
  BEAM.g.visible=false;STREAM.update(dt,LZ.firing,LZ.flash);
  // the stream's growl: a throbbing low buzz under the crackle of each pulse
  if(AU.lg){if(LZ.firing){AU.lg.gain.value=.055*(.75+.25*Math.sin(T*63));AU.laser[0].frequency.value=88+LZ.heat*50+Math.random()*6;AU.laser[1].frequency.value=176+LZ.heat*95;AU.lf.frequency.value=650+Math.random()*700;AU.lf.Q.value=2.5;}else AU.lg.gain.value=0;}
  // the bright packet of each pulse racing down the beam
  for(const p of PKT){if(!p.on)continue;p.t+=dt;const k=p.t*190/p.L;if(k>=1){p.on=false;p.m.visible=false;continue;}p.m.position.copy(p.a).lerp(p.b,k);}}
const _UP=new THREE.Vector3(0,1,0);
const PKT=(()=>{const out=[];const geo=new THREE.CylinderGeometry(.035,.035,1.6,6);geo.rotateX(Math.PI/2);const mat=new THREE.MeshBasicMaterial({color:0xffb8ff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
  for(let k=0;k<10;k++){const m=new THREE.Mesh(geo,mat);m.visible=false;scene.add(m);out.push({m,on:false,t:0,L:1,a:new THREE.Vector3(),b:new THREE.Vector3()});}return out;})();
function firePulse(){LZ.heat+=.031/LZ.cool*(HV.on?.6:1);if(LZ.heat>=1){LZ.heat=1;LZ.over=true;msg('OVERHEATED: VENTING',1.6);sfx('vent');tone(880,220,.6,.1,'sawtooth');}LZ.shots++;LZ.flash=1;
  const vr=renderer.xr.isPresenting;const o=new THREE.Vector3(),d=new THREE.Vector3();
  if(vr&&!HV.on){GUN.muzzle.getWorldPosition(o);GUN.muzzle.getWorldQuaternion(_q1);d.set(0,0,-1).applyQuaternion(_q1);}else if(vr&&HV.on){HEAVY.muzzle.getWorldPosition(o);HEAVY.muzzle.getWorldQuaternion(_q1);d.set(0,0,-1).applyQuaternion(_q1);}else{camera.getWorldPosition(o);camera.getWorldDirection(d);}
  let tMax=70;for(let t=1;t<70;t+=.5){const x=o.x+d.x*t,y=o.y+d.y*t,z=o.z+d.z*t;if(cellAt(x,z)===1&&y<H(x,z)+9){tMax=t;break;}if(y<H(x,z)){tMax=t;break;}}
  const AS=LZ.assist+(HV.on?.45:0);const hits=[];for(const z of Z){if(z.dead||z.rise>.6)continue;const hasP=z.hx!=null&&Math.abs(T-z.pT)<.1;for(const [px0,py0,pz0,rr,mul] of [[hasP?z.cx:z.x,hasP?z.cy:z.y+1.12*z.sc,hasP?z.cz:z.z,.36*z.sc+AS,1],[hasP?z.hx:z.x,hasP?z.hy:z.y+1.58*z.sc,hasP?z.hz:z.z,.22*z.sc+AS*.6,2.2]]){const cx=px0-o.x,cy=py0-o.y,cz=pz0-o.z;const t=cx*d.x+cy*d.y+cz*d.z;if(t<0||t>tMax)continue;const px=cx-d.x*t,py=cy-d.y*t,pz=cz-d.z*t;if(px*px+py*py+pz*pz<rr*rr){hits.push({z,t,mul});break;}}}
  const sh=BOSS.shotHit(o,d,tMax);if(sh){tMax=sh.t;for(let q=hits.length-1;q>=0;q--)if(hits[q].t>tMax)hits.splice(q,1);}
  const bt=sh?null:BOSS.rayHit(o,d,tMax);if(bt!=null){tMax=bt;for(let q=hits.length-1;q>=0;q--)if(hits[q].t>tMax)hits.splice(q,1);}
  hits.sort((a,b)=>a.t-b.t);const n=Math.min(hits.length,LZ.pierce+(HV.on?1:0));let end=n?hits[n-1].t:tMax;
  if(sh&&n<LZ.pierce+(HV.on?1:0)){end=sh.t;sh.s.hp--;if(sh.s.hp<=0)BOSS.popShot(sh.s);else{const c=sh.s.m.position;for(let q=0;q<4;q++)PFX.add(c.x,c.y,c.z,(Math.random()-.5)*4,Math.random()*3,(Math.random()-.5)*4,0xffffff,.12,.3);}LZ.onTarget++;}
  if(bt!=null&&n<LZ.pierce+(HV.on?1:0)){end=bt;BOSS.damage(62*LZ.dmg/LZ.rep*1.15,new THREE.Vector3(o.x+d.x*bt,o.y+d.y*bt,o.z+d.z*bt));LZ.onTarget++;}
  if(n)LZ.onTarget++;
  for(let k=0;k<n;k++){const {z,t,mul}=hits[k];z.hp-=62*LZ.dmg*mul/LZ.rep*1.15*(HV.on?1.6:1);z.flash=.07;z.stag=Math.min(1,z.stag+.3);const hx=o.x+d.x*t,hy=o.y+d.y*t,hz=o.z+d.z*t;
    for(let q=0;q<6;q++)PFX.add(hx,hy,hz,(Math.random()-.5)*4+d.x*2,Math.random()*3,(Math.random()-.5)*4+d.z*2,q%2?0xff8a1e:0x8fd0ff,.09,.4);sfx('hit',hx,hy,hz);if(z.hp<=0)killZombie(z);}
  ghostsHit(o,d,end);
  if(!n&&tMax<70){const hx=o.x+d.x*tMax,hy=o.y+d.y*tMax,hz=o.z+d.z*tMax;for(let q=0;q<4;q++)PFX.add(hx,hy,hz,(Math.random()-.5)*3,Math.random()*2.5,(Math.random()-.5)*3,0xffb060,.07,.3);}
  LZ.tip.copy(o).addScaledVector(d,end);
  // the packet, from the muzzle
  const p=PKT.find(q=>!q.on)||PKT[0];aimMuzzle().getWorldPosition(p.a);p.b.copy(LZ.tip);p.L=Math.max(1,p.a.distanceTo(p.b));p.t=0;p.on=true;p.m.visible=false;p.m.position.copy(p.a);p.m.lookAt(p.b);
  pulseSound();}
function pulseSound(){if(!AU.ctx)return;const ctx=AU.ctx,t=ctx.currentTime;const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type='square';o.frequency.setValueAtTime(2600+LZ.heat*900,t);o.frequency.exponentialRampToValueAtTime(380,t+.06);
  f.type='bandpass';f.frequency.value=1800;f.Q.value=1.2;g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+.08);o.connect(f);f.connect(g);g.connect(AU.master);o.start(t);o.stop(t+.09);
  const n=ctx.createBufferSource();n.buffer=AU.noise;const ng=ctx.createGain(),nf=ctx.createBiquadFilter();nf.type='highpass';nf.frequency.value=2200;ng.gain.setValueAtTime(.08,t);ng.gain.exponentialRampToValueAtTime(.001,t+.05);n.connect(nf);nf.connect(ng);ng.connect(AU.master);n.start(t,Math.random());n.stop(t+.04);}
function killZombie(z){if(z.dead)return;z.dead=.001;kills++;sfx('splat',z.x,1,z.z);for(let k=0;k<14;k++)PFX.add(z.x+(Math.random()-.5)*.6,z.y+.4+Math.random()*1.4,z.z+(Math.random()-.5)*.6,(Math.random()-.5)*1.5,1+Math.random()*2.5,(Math.random()-.5)*1.5,k%2?0x43f0ff:0xd6ff4a,.12,1.1,-1);}
function zombiesUpdate(dt){let near=0;
  for(let i=Z.length-1;i>=0;i--){const z=Z[i];if(z.flash>0)z.flash-=dt;
    if(z.dead){z.dead+=dt;if(z.dead>1.35)Z.splice(i,1);continue;}
    const dx=TGT.x-z.x,dz=TGT.z-z.z,d=Math.hypot(dx,dz);if(d>190){Z.splice(i,1);continue;}if(d<20)near++;
    // which way: down the flow field if we have it, else straight at you
    let tx=dx,tz=dz;const ni=navIdx(z.x,z.z);
    if(ni>=0&&DIST[ni]>1){let best=DIST[ni],bi=-1;const ix=ni%NW;for(const [o,a,b] of DIRS8){const nn=ni+o;if(nn<0||nn>=NAV.length)continue;if(Math.abs((nn%NW)-ix)>1)continue;if(a&&(NAV[ni+a]||NAV[ni+b]))continue;const v=DIST[nn];if(v>=0&&v<best){best=v;bi=nn;}}
      if(bi>=0){tx=AREA.x0+(bi%NW+.5)*NC-z.x;tz=AREA.z0+((bi/NW|0)+.5)*NC-z.z;}}
    const tl=Math.hypot(tx,tz)||1;tx/=tl;tz/=tl;
    // keep apart
    for(const o of Z){if(o===z||o.dead)continue;const ex=z.x-o.x,ez=z.z-o.z,e2=ex*ex+ez*ez;if(e2<.64&&e2>1e-4){const e=Math.sqrt(e2);tx+=ex/e*(.8-e)*1.6;tz+=ez/e*(.8-e)*1.6;}}
    z.t+=dt;if(z.stag>0)z.stag=Math.max(0,z.stag-dt*2.2);if(z.rise>0){z.rise=Math.max(0,z.rise-dt/1.4);if(Math.random()<dt*12)PFX.add(z.x+(Math.random()-.5),z.y+.1,z.z+(Math.random()-.5),(Math.random()-.5),1+Math.random(),(Math.random()-.5),0x4a3b2a,.12,.8);continue;}
    const attack=d<1.05;z.atk=attack?Math.min(1,z.atk+dt*4):Math.max(0,z.atk-dt*3);const lurch=z.type==='walker'?.72+.56*Math.max(0,Math.sin(z.ph*2)):z.type==='brute'?.85+.3*Math.abs(Math.sin(z.ph)):1;const sp=attack?0:z.spd*lurch*(1-.75*z.stag);const want=Math.atan2(-tx,-tz);let dh=want-z.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));z.h+=clamp(dh,-dt*(z.type==='runner'?7:4),dt*(z.type==='runner'?7:4));
    const [nx,nz]=slide(z.x,z.z,tx*sp*dt,tz*sp*dt,.26*z.sc);z.x=nx;z.z=nz;z.y=lerp(z.y,H(z.x,z.z),Math.min(1,dt*10));
    z.ph+=dt*(attack?3:sp/(z.stride*z.sc)*Math.PI*2);
    if(attack&&state==='play'&&TGT!==PL){if(BON.phase==='run'){NPC.hp-=z.dmg*DIFF.dmg*dt*.7;NPC.grab=.25;}}else if(attack&&state==='play'&&!PL.ride){const dmg=z.dmg*DIFF.dmg*dt;PL.hp-=dmg;dmgTaken+=dmg;PL.hurtT=.25;PL.regenT=4;if(Math.random()<dt*2.5)sfx('hurt');}
    // stuck? try again from somewhere else
    z.stuck+=dt;if(z.stuck>4){if(Math.hypot(z.x-z.lx,z.z-z.lz)<.6&&d>25){Z.splice(i,1);continue;}z.stuck=0;z.lx=z.x;z.lz=z.z;}
    z.groanT-=dt;if(z.groanT<=0){z.groanT=2.5+Math.random()*6;if(d<45)groan(z);}}
  return near;}
function picksUpdate(dt){for(const p of PICKS){if(!p.on)continue;p.box.rotation.y+=dt*2;p.box.position.y=1.1+Math.sin(T*3+p.x)*.12;if(Math.hypot(p.x-PL.x,p.z-PL.z)<1.4){p.on=false;p.m.visible=false;sfx('pick');msg(PICK_DEF[p.kind].label,2.4);
    if(p.kind==='snack')PL.hp=Math.min(PL.maxhp,PL.hp+40);else if(p.kind==='lens')LZ.dmg*=1.4;else if(p.kind==='fins')LZ.cool*=1.45;else if(p.kind==='ao'){LZ.pierce=Math.max(LZ.pierce,3)+(LZ.pierce>=3?1:0);LZ.assist=.12;}else if(p.kind==='cell'){LZ.heat=0;LZ.over=false;}}}}
function director(dt){if(PL.ride&&!BON.active)return;if(BON.active&&BON.phase!=='run')return;const pr=progress();const cap=Math.round((BON.active?.7:1)*DIFF.cap*(.55+pr*.45+(holdT>0?.15:0)));const alive=Z.filter(z=>!z.dead).length;
  spawnT-=dt;if(spawnT<=0&&alive<cap){spawnT=holdT>0?.6:.7;const rr=Math.random();const type=(pr>.15&&rr<(.1+pr*.25)*DIFF.run)?'runner':(pr>.35&&rr>1-.07*DIFF.run)?'brute':'walker';
    // most of them come from up ahead, between you and the extraction
    const ahead=holdT<=0&&Math.random()<.65?Math.atan2(END[1]-TGT.z,END[0]-TGT.x):null;trySpawn(ahead!=null?30:28,ahead!=null?58:60,type,ahead);}
  hordeT-=dt;if(hordeT<=0&&state==='play'){hordeT=(BON.active?22:48)+Math.random()*20;const toEnd=Math.atan2(END[1]-TGT.z,END[0]-TGT.x);const n=Math.round(DIFF.horde*(.7+pr*.6));msg('HORDE INCOMING!',2.4);siren();
    for(let k=0;k<n;k++)setTimeout(()=>{if(state==='play')trySpawn(30,52,Math.random()<.2?'runner':k===0&&pr>.3?'brute':'walker',toEnd+(Math.random()<.3?Math.PI:0));},k*160);}}
function win(){if(!BON.done&&!BON.active){// level up this region, then straight into the bonus round
    WINREC={T,best:BEST[MIS.id+dkey]};if(WINREC.best==null||T<WINREC.best){BEST[MIS.id+dkey]=T;try{localStorage.setItem('wpu-best',JSON.stringify(BEST));}catch(e){}}
    if(DIFF.lv){LEVEL[MIS.id]=DIFF.lv+1;saveLv();}bonusStart();return;}
  finishMission();}
let WINREC=null;
function finishMission(){state='end';const rec=WINREC||{T,best:null};T=rec.T;endScreen(true,rec.best);tone(523,784,.5,.12,'triangle');setTimeoutT(()=>tone(784,1046,.6,.12,'triangle'),.45);}
function lose(){if(BON.active)return;state='end';heliSound(false);musicBossOn(false);PL.slow=0;PL.hp=0;endScreen(false);tone(330,110,1.2,.15,'sawtooth');}
function endScreen(won,best){document.exitPointerLock?.();if(AU.lg)AU.lg.gain.value=0;BEAM.g.visible=false;$('hud').hidden=true;$('touch').hidden=true;$('end').hidden=false;
  $('endK').textContent=BON.practice?'Bonus round practice':MIS.title+' · '+DIFF.name;$('endH').textContent=won?'EXTRACTED':'YOU WERE OVERRUN';
  const acc=LZ.shots>0?Math.round(LZ.onTarget/LZ.shots*100):0;const rows=[['Time',fmt(T)],['Zombies lasered',kills],['Pulses on target',acc+'%'],['Ghosts busted',ghostsBusted],['Marshmallows zapped',BOSS.B.popped],['Zombies squashed by marshmallows',BOSS.B.squished],['Mr Toasty',BOSS.B.killed?'Toasted! (+500)':'Still standing'],...(BON.done?[['Bonus survivor',BON.saved?'Saved! (+200)':'Lost']]:[]),...(won&&DIFF.lv&&!BON.practice?[['Next time',`Level ${DIFF.lv+1} unlocked`]]:[]),['Damage taken',Math.round(dmgTaken)],['Distance to go',won?'0 m':Math.round(Math.hypot(END[0]-PL.x,END[1]-PL.z))+' m']];
  if(won)rows.push(['Best time',best==null||T<best?fmt(T)+' (new best!)':fmt(best)]);$('endT').innerHTML=rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
  const earned=BON.practice?0:Math.round((kills*2+ghostsBusted*5+BOSS.B.popped*3+(BOSS.B.killed?500:0)+(won?120:0)+(BON.saved?200:0))*(DIFF.lv?(.7+.15*(DIFF.lv-1)):({easy:.7,normal:1,hard:1.5}[dkey]||1))*(OPT.tod==='night'?1.4:1));CRED+=earned;saveUpg();$('endC').textContent=BON.practice?'Practice run: no credits, levels unchanged':`+${earned} lab credits (${CRED} to spend)`;
  if(renderer.xr.isPresenting)setTimeout(()=>{if(state==='end')VRM.open({won,title:MIS.title,T,kills,ghosts:ghostsBusted,earned});},1600);}
function step(dt,inp){T+=dt;EX.jump=EX.jump||inp.jump;if(!PL.ride)movePlayer(inp,dt);const rode=!!PL.ride;if(rode){if(BON.active){heliUpdate(dt);bonusUpdate(dt);}else extractUpdate(dt);if(!renderer.xr.isPresenting)syncCamera();}heavyUpdate();fireLaser(inp,dt);flowT-=dt;if(flowT<=0){flowT=.4;flowField(TGT.x,TGT.z);}const near=zombiesUpdate(dt);ghostsUpdate(dt);picksUpdate(dt);director(dt);if(!rode){if(!BON.active)extractUpdate(dt);else{heliUpdate(dt);bonusUpdate(dt);}}BOSS.update(dt);ttUpdate(dt);
  PL.regenT-=dt;if(PL.regenT<=0&&PL.hp<PL.maxhp)PL.hp=Math.min(PL.maxhp,PL.hp+dt*1.5);flickerUpdate(dt);if(PL.hurtT>0)PL.hurtT-=dt;if(PL.hp<=0&&state==='play')lose();if(AU.amb)AU.amb.gain.value=.04+Math.min(.06,near*.005);}

// ================================================================ HUD and map
const MAPIMG=document.createElement('canvas');MAPIMG.width=GW/2;MAPIMG.height=GD/2;
function drawMapImage(){const g=MAPIMG.getContext('2d');g.fillStyle='#10161d';g.fillRect(0,0,MAPIMG.width,MAPIMG.height);const img=g.getImageData(0,0,MAPIMG.width,MAPIMG.height);const D=img.data;
  for(let z=0;z<MAPIMG.height;z++)for(let x=0;x<MAPIMG.width;x++){const c=GRID[(z*2)*GW+x*2],o=(z*MAPIMG.width+x)*4;const col=c===1?[70,78,88]:c===2?[14,32,52]:c===3?[150,156,164]:[24,40,30];D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;}g.putImageData(img,0,0);}
function drawHud(){const mp=$('map');drawMiniMap(mp.getContext('2d'),mp.width,PL.yaw);
  $('hpBar').firstChild.style.width=(PL.hp/PL.maxhp*100)+'%';$('hpN').textContent=Math.ceil(PL.hp);$('heatBar').firstChild.style.width=Math.round(LZ.heat*100)+'%';$('heatN').textContent=LZ.over?'VENT':Math.round(LZ.heat*100)+'%';$('heatL').textContent=LZ.over?'Venting':'Laser heat';
  $('hK').textContent=kills;$('hT').textContent=fmt(T);const d=Math.round(Math.hypot(END[0]-PL.x,END[1]-PL.z));
  $('obj').innerHTML=BON.active&&BON.phase!=='fadeout'?`BONUS: cover the survivor · ${Math.max(0,Math.ceil(NPC.hp))}% health<small>${Math.round(Math.hypot(END[0]-NPC.x,END[1]-NPC.z))} m to their pick-up · zap anything that gets near them</small>`:EX.phase==='landed'?`GET TO THE CHOPPER!<small>Run up the steps into the cabin</small>`:PL.ride?'Extracting...':holdT>0?`Hold on at ${MIS.endName}: ${Math.ceil(holdT)} s<small>${BOSS.B.on&&!BOSS.B.dead?'Dodge the hot marshmallows! Watch for the red rings':'The evac helicopter is coming in'}</small>`:`${MIS.endName}: ${d} m<small>Follow the blue light</small>`;
  {const ax=BON.active?NPC.x:END[0],az=BON.active?NPC.z:END[1];const dx=ax-PL.x,dz=az-PL.z,fx=-Math.sin(PL.yaw),fz=-Math.cos(PL.yaw),rx=Math.cos(PL.yaw),rz=-Math.sin(PL.yaw);$('arrow').style.transform=`rotate(${Math.atan2(dx*rx+dz*rz,dx*fx+dz*fz)*180/Math.PI}deg)`;}
  $('vign').style.opacity=PL.hurtT>0?.85:PL.hp<PL.maxhp*.35?.35+Math.sin(T*6)*.15:0;}

// ================================================================ main loop
const clock=new THREE.Clock();let hudT=0,cullT=0;
let MANUAL=null;
function frame(){if(MANUAL){clock.getDelta();return;}frameBody(Math.min(.05,clock.getDelta()),readInput());}
function frameBody(dt,inp){musicIntensity(dt);STORM.update(dt);voxUpdate();VRM.update();VRH.update(dt);LASTDT=dt;
  if(state==='play'){step(dt,inp);}else if(state==='end'){zombiesUpdate(dt);if(!renderer.xr.isPresenting&&false)rig.rotation.y+=dt*.1;}
  // camera
  if(!renderer.xr.isPresenting){syncCamera();
    if(GUN.g.parent!==camera){camera.add(GUN.g);GUN.g.position.set(.16,-.16,-.4);GUN.g.rotation.set(.04,.06,0);GUN.g.scale.setScalar(.72);}GUN.g.position.y=-.16+Math.sin(PL.bob*.5)*.008+(LZ.firing?Math.random()*.003:0);}
  else if(rig.rotation.y!==PL.yaw){// snap-turn about the head, not the room's centre
    camera.getWorldPosition(_v1);rig.rotation.y=PL.yaw;rig.updateMatrixWorld(true);camera.getWorldPosition(_v2);rig.position.x+=_v1.x-_v2.x;rig.position.z+=_v1.z-_v2.z;}
  if(msgT>0){msgT-=dt;if(msgT<=0)$('msg').style.opacity=0;}if(VRHUD.msgT>0&&VRHUD.msgT<900)VRHUD.msgT-=dt;
  for(const f of LMANIM)f(dt,T+performance.now()/1000);PFX.update(dt);drawZombies();drawGhosts();pumpkinsFlicker();for(const p of PICKS){}
  if((cullT-=dt)<=0){cullT=.25;updateCull(PL.x,PL.z);}
  if((hudT-=dt)<=0&&state!=='loading'){hudT=renderer.xr.isPresenting?.2:.1;if(state==='play'&&!renderer.xr.isPresenting)drawHud();if(renderer.xr.isPresenting)VRHUD.draw();}
  listener();renderer.render(scene,camera);}


// ================================================================ Halloween: jack-o'-lanterns on the pavements and windowsills, ghosts drifting over the rooftops, a big moon
let PUMP=null,PGLOW=null,ghostsBusted=0;const GH=[];let ghostT=4,swoopT=12;
const FACE_TEX=canvasTex(128,96,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#ffd24a';g.shadowColor='#ff8a00';g.shadowBlur=10;
  g.beginPath();g.moveTo(22,40);g.lineTo(44,40);g.lineTo(33,18);g.closePath();g.fill();g.beginPath();g.moveTo(84,40);g.lineTo(106,40);g.lineTo(95,18);g.closePath();g.fill();
  g.beginPath();g.moveTo(58,52);g.lineTo(70,52);g.lineTo(64,42);g.closePath();g.fill();
  g.beginPath();g.moveTo(16,60);for(let k=0;k<=8;k++){const x=16+k*12;g.lineTo(x,k%2?84:66);}g.lineTo(112,60);g.quadraticCurveTo(64,96,16,60);g.fill();});
function buildPumpkins(){const PU=[];const ok=(x,z)=>{const c=cellAt(x,z);return (c===0||c===3)&&!blockedR(x,z,.35);};
  for(const s of STREETS){if(s.k==='V')continue;let acc=Math.random()*20;for(let k=0;k<s.pts.length-1;k++){const [x0,z0]=s.pts[k],[x1,z1]=s.pts[k+1];const len=Math.hypot(x1-x0,z1-z0);let d=acc;
      while(d<len){if(Math.random()<.42){const x=x0+(x1-x0)*d/len,z=z0+(z1-z0)*d/len,nx=-(z1-z0)/len,nz=(x1-x0)/len,side=Math.random()<.5?-1:1;const px=x+nx*side*(s.w/2+1.3),pz=z+nz*side*(s.w/2+1.3);
          if(px>AREA.x0&&px<AREA.x1&&pz>AREA.z0&&pz<AREA.z1&&ok(px,pz)&&nearest(px,pz)[0]>W2+VERGE+.3)PU.push([px,pz,Math.atan2(-nx*side,-nz*side),.8+Math.random()*.5]);}d+=19;}acc=d-len;}}
  for(let i=0;i<NS;i+=7){if(Math.random()>.3)continue;const sd=Math.random()<.5?-1:1;const q=P[i].clone().addScaledVector(R[i],sd*(W2+VERGE-.6));if(ok(q.x,q.z))PU.push([q.x,q.z,Math.atan2(-R[i].x*sd,-R[i].z*sd),.8+Math.random()*.5,P[i].y+.12]);}
  // a few on ground-floor windowsills, and a pile outside Friar Tuck's and Annie Cafe
  for(const w of WINS){if(Math.random()<.012&&w[1]-H(w[0],w[2])<2.2){const nx=Math.sin(w[3]),nz=Math.cos(w[3]);const px=w[0]+nx*.4,pz=w[2]+nz*.4;if(ok(px,pz))PU.push([px,pz,w[3],.7,w[1]-.85]);}}
  for(const [,lx,lz] of LANDMARKS.slice(0,2)){const [sx,sz]=nearestStreet(lx,lz);for(let k=0;k<5;k++){const px=sx+(lx-sx)*.35+(Math.random()-.5)*3,pz=sz+(lz-sz)*.35+(Math.random()-.5)*3;if(ok(px,pz))PU.push([px,pz,Math.atan2(sx-px,sz-pz),.8+Math.random()*.6]);}}
  while(PU.length>420)PU.splice((Math.random()*PU.length)|0,1);if(!PU.length)return;const n=PU.length;
  const body=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.33,1),lam({color:0xe8761c,flatShading:true,emissive:0x3a1200}),n),stem=new THREE.InstancedMesh(new THREE.CylinderGeometry(.035,.05,.13,5),lam({color:0x3d5a1e}),n);
  const face=new THREE.InstancedMesh(new THREE.PlaneGeometry(.44,.33),new THREE.MeshBasicMaterial({map:FACE_TEX,transparent:true,depthWrite:false,fog:true}),n);const o=new THREE.Object3D(),c=new THREE.Color(),gp=new Float32Array(n*3);
  PU.forEach(([x,z,ry,sc,yy],i)=>{const y=yy!=null?yy:H(x,z);o.position.set(x,y+.24*sc,z);o.rotation.set(0,ry,0);o.scale.set(sc,sc*.78,sc);o.updateMatrix();body.setMatrixAt(i,o.matrix);body.setColorAt(i,c.setHSL(.07+Math.random()*.03,.85,.42+Math.random()*.1));
    o.position.y=y+.52*sc;o.scale.set(sc,sc,sc);o.rotation.set(.2,ry,0);o.updateMatrix();stem.setMatrixAt(i,o.matrix);
    o.rotation.set(0,ry,0);o.position.set(x+Math.sin(ry)*.3*sc,y+.25*sc,z+Math.cos(ry)*.3*sc);o.scale.set(sc,sc,sc);o.updateMatrix();face.setMatrixAt(i,o.matrix);gp.set([x+Math.sin(ry)*.34*sc,y+.27*sc,z+Math.cos(ry)*.34*sc],i*3);});
  for(const m of [body,stem,face]){m.computeBoundingSphere();world.add(m);}
  const glow=canvasTex(64,64,(g,w,h)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,170,60,.9)');gr.addColorStop(1,'rgba(255,90,0,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(gp,3));PGLOW=new THREE.Points(gg,new THREE.PointsMaterial({map:glow,size:1.7,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:true}));world.add(PGLOW);PUMP={body,face,n};}
function pumpkinsFlicker(){if(!PGLOW)return;PGLOW.material.opacity=.75+.18*Math.sin(T*13.1)+.12*Math.sin(T*7.3+1.7)+(Math.random()<.04?-.25:0);PGLOW.material.size=OPT.tod==='night'?2.2:1.7;}
// the moon
{const m=new THREE.Mesh(new THREE.CircleGeometry(16,32),new THREE.MeshBasicMaterial({color:0xffd9a0,fog:false,transparent:true,opacity:.92,depthWrite:false}));m.position.set(-230,170,-360);m.lookAt(0,0,0);m.renderOrder=-1;rig.add(m);
  const halo=new THREE.Mesh(new THREE.CircleGeometry(60,32),new THREE.MeshBasicMaterial({color:0xff9a50,fog:false,transparent:true,opacity:.05,blending:THREE.AdditiveBlending,depthWrite:false}));halo.position.copy(m.position).multiplyScalar(1.01);halo.lookAt(0,0,0);halo.renderOrder=-1;rig.add(halo);}
// ghosts: white sheets with a wavy hem, glowing a little, drifting and bobbing; now and then one swoops at you. Zap them for bonus credits.
const GHOST=(()=>{const prof=[new THREE.Vector2(0,1.18)];for(let k=1;k<=16;k++){const t=k/16;const y=1.18-t*1.18;const r=t<.36?.42*Math.sin(Math.acos(1-t/.36)):.42+(t-.36)*.2;prof.push(new THREE.Vector2(r,y));}
  const geo=new THREE.LatheGeometry(prof,18);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<.25){const a=Math.atan2(p.getZ(i),p.getX(i));p.setY(i,y+Math.sin(a*7)*.07*(1-y/.25));}}geo.computeVertexNormals();
  const body=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.34,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),12);body.count=0;body.frustumCulled=false;scene.add(body);
  const ftex=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#0b0b12';g.beginPath();g.ellipse(42,50,11,17,0,0,7);g.fill();g.beginPath();g.ellipse(86,50,11,17,0,0,7);g.fill();g.beginPath();g.ellipse(64,92,13,18,0,0,7);g.fill();});
  const face=new THREE.InstancedMesh(new THREE.PlaneGeometry(.5,.5),new THREE.MeshBasicMaterial({map:ftex,transparent:true,depthWrite:false,fog:true}),12);face.count=0;face.frustumCulled=false;scene.add(face);return {body,face};})();
function ghostWail(x,y,z,down){if(!AU.ctx)return;const ctx=AU.ctx,t=ctx.currentTime;const o=ctx.createOscillator();o.type='sine';const f0=down?620:420+Math.random()*120;o.frequency.setValueAtTime(f0,t);o.frequency.linearRampToValueAtTime(down?180:f0*1.35,t+.6);o.frequency.linearRampToValueAtTime(down?120:f0*.8,t+1.5);
  const v=ctx.createOscillator();v.frequency.value=5.5;const vg=ctx.createGain();vg.gain.value=f0*.04;v.connect(vg);vg.connect(o.frequency);const g=ctx.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+.3);g.gain.linearRampToValueAtTime(0,t+1.6);o.connect(g);panTo(g,x,y,z);o.start(t);v.start(t);o.stop(t+1.7);v.stop(t+1.7);}
function ghostsUpdate(dt){ghostT-=dt;if(ghostT<=0&&GH.length<9){ghostT=3+Math.random()*5;const a=Math.random()*Math.PI*2,r=25+Math.random()*35;GH.push({x:PL.x+Math.cos(a)*r,z:PL.z+Math.sin(a)*r,y:3+Math.random()*4,h:Math.random()*6,a:0,ph:Math.random()*6,vx:0,vz:0,sw:0,hp:2,dead:0,life:25+Math.random()*25});}
  swoopT-=dt;if(swoopT<=0){swoopT=12+Math.random()*14;const g=GH.find(q=>!q.dead&&!q.sw&&Math.hypot(q.x-PL.x,q.z-PL.z)>12);if(g){g.sw=1;ghostWail(g.x,g.y,g.z);}}
  for(let i=GH.length-1;i>=0;i--){const g=GH[i];g.ph+=dt;g.life-=dt;
    if(g.dead){g.dead+=dt;g.y+=dt*3;g.a=Math.max(0,1-g.dead/.6);if(g.dead>.6)GH.splice(i,1);continue;}
    g.a=Math.min(1,g.a+dt*.8);if(g.life<0){g.a-=dt*1.6;if(g.a<=0){GH.splice(i,1);continue;}}
    let tx,tz,ty,sp;if(g.sw){// swoop: dive past your head, then away
      const dx=PL.x-g.x,dz=PL.z-g.z,d=Math.hypot(dx,dz);tx=dx/d;tz=dz/d;ty=H(PL.x,PL.z)+2;sp=9;if(d<2.5){g.sw=0;g.vx=tx*9;g.vz=tz*9;g.life=Math.min(g.life,6);}}
    else{const a=Math.sin(g.ph*.21+i)*3+g.h;tx=Math.cos(a);tz=Math.sin(a);ty=H(g.x,g.z)+3.5+Math.sin(g.ph*.7)*1.5;sp=1.6;
      const d=Math.hypot(PL.x-g.x,PL.z-g.z);if(d>70){tx=(PL.x-g.x)/d;tz=(PL.z-g.z)/d;sp=3;}}
    g.vx=lerp(g.vx,tx*sp,Math.min(1,dt*1.5));g.vz=lerp(g.vz,tz*sp,Math.min(1,dt*1.5));g.x+=g.vx*dt;g.z+=g.vz*dt;g.y=lerp(g.y,ty+Math.sin(g.ph*2.3)*.25,Math.min(1,dt*(g.sw?2:.8)));
    const fp=Math.hypot(PL.x-g.x,PL.z-g.z)<30&&!g.sw;const wantH=fp?Math.atan2(-(PL.x-g.x),-(PL.z-g.z)):Math.atan2(-g.vx,-g.vz);let dh=wantH-g.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));g.h+=dh*Math.min(1,dt*2);}}
function ghostsHit(o,d,end){for(const g of GH){if(g.dead||g.a<.3)continue;const cx=g.x-o.x,cy=g.y+.6-o.y,cz=g.z-o.z;const t=cx*d.x+cy*d.y+cz*d.z;if(t<0||t>end+.5)continue;const px=cx-d.x*t,py=cy-d.y*t,pz=cz-d.z*t;
    if(px*px+py*py+pz*pz<.36){g.hp--;g.flash=.1;if(g.hp<=0){g.dead=.001;ghostsBusted++;ghostWail(g.x,g.y,g.z,true);msg('GHOST BUSTED! +5 CREDITS',1.4);for(let k=0;k<22;k++)PFX.add(g.x,g.y+.6,g.z,(Math.random()-.5)*4,(Math.random()-.2)*4,(Math.random()-.5)*4,k%2?0xffffff:0xa8e6ff,.14,1,-1);}}}}
function drawGhosts(){const n=GH.length;GHOST.body.count=GHOST.face.count=n;const c=new THREE.Color();GH.forEach((g,i)=>{const sq=1+Math.sin(g.ph*3)*.06;
    _m1.compose(_v1.set(g.x,g.y,g.z),_q1.setFromEuler(_E.set(Math.sin(g.ph*1.3)*.12+(g.sw?-.4:0),g.h,Math.sin(g.ph*1.7)*.1,'YXZ')),_v3.set(1/sq,sq*(g.dead?1+g.dead:1),1/sq));GHOST.body.setMatrixAt(i,_m1);
    GHOST.body.setColorAt(i,c.setScalar((g.flash>0?1.6:.95)*g.a));_m2.copy(_m1).multiply(_Tm.makeTranslation(0,.82,-.4));GHOST.face.setMatrixAt(i,_m2);if(g.flash>0)g.flash-=.016;});
  GHOST.body.instanceMatrix.needsUpdate=true;GHOST.face.instanceMatrix.needsUpdate=true;if(GHOST.body.instanceColor)GHOST.body.instanceColor.needsUpdate=true;}

// ================================================================ options, the lab, dusk and night
const OPT={auto:true,tod:'dusk'};try{Object.assign(OPT,JSON.parse(localStorage.getItem('wpu-opt2')||'{}'));}catch(e){}
function applyHand(){document.body.classList.toggle('lefty',OPT.hand==='left');attachHands();}
const saveOpt2=()=>{try{localStorage.setItem('wpu-opt2',JSON.stringify(OPT));}catch(e){}};
const UPG={power:0,cool:0,sink:0,optics:0,torch:0,armour:0};let CRED=0;
try{const u=JSON.parse(localStorage.getItem('wpu-upg')||'{}');Object.assign(UPG,u.u||{});CRED=u.c||0;}catch(e){}
const saveUpg=()=>{try{localStorage.setItem('wpu-upg',JSON.stringify({u:UPG,c:CRED}));}catch(e){}};
const UPG_DEF=[['power','Amplifier','More beam power: +25% damage a level.'],['cool','Cooling jacket','Heats up 18% slower a level.'],['sink','Heat sink','Cools and vents 30% faster a level.'],
  ['optics','Adaptive optics','The beam cuts through one more zombie a level.'],['torch','Torch','Brighter and further: for night missions.'],['armour','Hi-vis vest','+20 health a level.']];
const UPG_COST=[80,170,290];
const SNACK_MAT=lam({map:canvasTex(256,128,(g,w,h)=>{g.fillStyle='#1f9a45';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=32){g.fillStyle=(x/32)%2?'#2bb854':'#1a8a3c';g.fillRect(x,0,16,h);}g.fillStyle='rgba(8,40,18,.9)';g.fillRect(0,40,w,48);g.fillStyle='#ffffff';g.font='700 30px Barlow, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText("FRIAR TUCK'S",w/2,65);}),emissive:0x0a2a12});
function applyTod(){const night=OPT.tod==='night';const fog=night?0x040509:0x2b2530;scene.fog.color.setHex(fog);scene.background.setHex(fog);scene.fog.near=night?3:18;scene.fog.far=night?62:165;
  hemi.intensity=night?.07:.62;moon.intensity=night?.04:.42;
  if(SKYU){SKYU.top.value.set(...(night?[.004,.005,.012]:[.07,.06,.13]));SKYU.hor.value.set(...(night?[.02,.022,.035]:[.55,.24,.18]));SKYU.low.value.set(...(night?[.012,.013,.02]:[.17,.145,.19]));}
  for(const o of LAMPS)o.visible=!night;for(const m of LITM)m.material=night?m.userData.mats[0]:m.userData.mats[1];if(WINMESH)WINMESH.visible=!night;
  if(typeof STORM!=='undefined'){STORM.st.base.hemi=hemi.intensity;STORM.st.base.fog.setHex(fog);}
  torch.intensity=(night?15:9)*(1+.35*UPG.torch);torch.distance=(night?58:48)+12*UPG.torch;torch.angle=.42+.05*UPG.torch;}
// windows flashing on and off at dusk: a few hundred lit panes laid over the real windows, each on its own timer
let WINMESH=null;const WST=[];
function buildFlicker(){const pick=[];for(const w of WINS)if(Math.random()<.13)pick.push(w);while(pick.length>2400)pick.splice((Math.random()*pick.length)|0,1);if(!pick.length)return;
  // one batch per building tile, hidden with its tile, so far-off windows never float in the air
  WINMESH=new THREE.Group();world.add(WINMESH);const by=new Map();for(const w of pick){const k=w[4]||'x';if(!by.has(k))by.set(k,[]);by.get(k).push(w);}
  const geo=new THREE.PlaneGeometry(1.39,1.55),o=new THREE.Object3D();
  for(const [tl,list] of by){const m=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:0xffffff,fog:true}),list.length);
    list.forEach((w,i)=>{o.position.set(w[0],w[1],w[2]);o.rotation.set(0,w[3],0);o.updateMatrix();m.setMatrixAt(i,o.matrix);const kind=Math.random()<.22?1:Math.random()<.18?2:0;
      const st={on:Math.random()<.5,t:Math.random()*6,kind,c:kind===2?0x8fb4ff:[0xffd27a,0xffc062,0xffe2a8][(Math.random()*3)|0],m,i};WST.push(st);m.setColorAt(i,new THREE.Color(st.on?st.c:0x0d1016));});
    m.computeBoundingSphere();WINMESH.add(m);if(tl.cull)CULL.push(Object.assign({o:m},tl.cull));}}
const _fc=new THREE.Color();
function flickerUpdate(dt){if(!WINMESH||!WINMESH.visible)return;const ch=new Set();for(let i=0;i<WST.length;i++){const w=WST[i];w.t-=dt;if(w.t>0)continue;
    w.on=!w.on;w.t=w.kind===1?(w.on?.04+Math.random()*.18:.05+Math.random()*(Math.random()<.15?2.5:.25)):w.kind===2?.06+Math.random()*.3:(w.on?2+Math.random()*9:1+Math.random()*7);
    if(w.kind===2&&w.on)_fc.setHex(w.c).multiplyScalar(.6+Math.random()*.6);else _fc.setHex(w.on?w.c:0x0d1016);w.m.setColorAt(w.i,_fc);ch.add(w.m);}for(const m of ch)m.instanceColor.needsUpdate=true;}
function seg(el,items,cur,on){el.innerHTML='';for(const [v,label] of items){const b=document.createElement('button');b.className='seg';b.textContent=label;b.setAttribute('aria-pressed',String(v===cur));b.addEventListener('click',()=>on(v));el.appendChild(b);}}
function buildOptions(){seg($('tod'),[['dusk','Dusk'],['night','Night: torch only']],OPT.tod,v=>{OPT.tod=v;saveOpt2();applyTod();buildOptions();});
  seg($('storm'),[[true,'Thunderstorm on'],[false,'Calm']],OPT.storm!==false,v=>{OPT.storm=v;saveOpt2();buildOptions();});
  seg($('music'),[[true,'Spooky music on'],[false,'Music off']],OPT.music!==false,v=>{OPT.music=v;saveOpt2();musicStart();musicSetVol();buildOptions();});
  seg($('hand'),[['right','Right-handed'],['left','Left-handed (look left, move right)']],OPT.hand==='left'?'left':'right',v=>{OPT.hand=v;saveOpt2();applyHand();buildOptions();});
  seg($('vrturn'),[['smooth','Smooth turning'],['snap','Snap turning']],OPT.vrturn==='snap'?'snap':'smooth',v=>{OPT.vrturn=v;saveOpt2();buildOptions();});
  seg($('vrhud'),[[true,'Head-up display'],[false,'Wrist panel only']],OPT.vrhud!==false,v=>{OPT.vrhud=v;saveOpt2();buildOptions();});
  seg($('move'),[[true,'Auto-run on'],[false,'Auto-run off (hold to run)']],OPT.auto,v=>{OPT.auto=v;saveOpt2();buildOptions();});
  $('labH').textContent=`The lab · ${CRED} credits`;const lab=$('lab');lab.innerHTML='';
  for(const [k,name,desc] of UPG_DEF){const lv=UPG[k],cost=UPG_COST[lv];const d=document.createElement('div');d.className='up';
    d.innerHTML=`<b>${name}</b>${desc}<div class="pips">${[0,1,2].map(i=>`<i class="${i<lv?'on':''}"></i>`).join('')}</div>`;const b=document.createElement('button');
    b.textContent=lv>=3?'Maxed':`Upgrade: ${cost} credits`;b.disabled=lv>=3||CRED<cost;b.addEventListener('click',()=>{if(lv>=3||CRED<cost)return;CRED-=cost;UPG[k]++;saveUpg();tone(660,990,.18,.08);buildOptions();});d.appendChild(b);lab.appendChild(d);}}
// ================================================================ title screen
function buildMenu(){const box=$('missions');box.innerHTML='';for(const m of MISSIONS){const b=document.createElement('button');b.className='mis';b.setAttribute('aria-pressed',String(m===MIS));const lv=lvOf(m);const best=BEST[m.id+'L'+lv];
    b.innerHTML=`<b>${m.title} <em style="font-style:normal;color:var(--acc2)">· Level ${lv}</em></b><i>${m.blurb}</i><span>${best!=null?'Best at level '+lv+': '+fmt(best):'Not yet escaped at level '+lv}</span>`;b.addEventListener('click',()=>{MIS=m;PICKD=null;useLevel();saveOpt();buildMenu();if(state==='paused'){state='menu';$('bPlay').textContent='Start mission';}});box.appendChild(b);}
  buildOptions();
  {const lv=lvOf(),d=levelDiff(lv);$('diff').innerHTML=`<p class="help" style="margin:0">${MIS.title} is at <b>level ${lv}</b>: up to ${d.cap} zombies at once, hordes of ${d.horde}. Win to go up a level: each one brings 20% more zombies, more aggression and bigger hordes, and Mr Toasty burns hotter.</p><button class="seg" id="lvReset" style="margin-top:8px">Start ${MIS.title} again from level 1</button>`;
   $('lvReset').addEventListener('click',()=>{LEVEL[MIS.id]=1;saveLv();useLevel();buildMenu();});}
  $('help').innerHTML=coarse?'<b>Tablet or phone:</b> left stick to walk, drag on the right to look (swapped in left-handed mode), hold FIRE for the laser (you run automatically unless auto-run is off; then RUN sprints).<br><b>Headset:</b> left stick walks, right stick turns, right trigger fires, left grip or X runs.':
    '<b>Keyboard and mouse:</b> click to grab the mouse, WASD (or IJKL for a left-hand mouse) to walk, mouse to look, hold left button or Space to fire, Esc for the menu (with auto-run off, Shift runs).<br><b>Gamepad:</b> left stick walks, right stick looks, right trigger fires, left trigger runs.<br><b>Headset:</b> left stick walks, right stick snap-turns, right trigger fires, left grip or X runs, B pauses (the sticks and gun swap hands in left-handed mode). Point and pull the trigger on the floating menu to pick missions, options and upgrades.<br>Let go of the trigger now and then: if the laser overheats it vents, and you can\'t fire until it cools.';}
$('bBonus').addEventListener('click',()=>{if(state==='loading')return;practiceBonus();});
$('bPlay').addEventListener('click',()=>{if(state==='paused'){state='play';$('title').hidden=true;$('hud').hidden=false;$('touch').hidden=!coarse;if(!coarse)view.requestPointerLock?.();return;}startMission();if(!coarse)view.requestPointerLock?.();});
$('bAgain').addEventListener('click',()=>{if(BON.practice){practiceBonus();return;}startMission();if(!coarse)view.requestPointerLock?.();});$('bLab').addEventListener('click',()=>{state='menu';$('end').hidden=true;$('title').hidden=false;$('bPlay').textContent='Start mission';buildMenu();$('labH').scrollIntoView({behavior:'smooth'});});
$('bMenu').addEventListener('click',()=>{state='menu';$('end').hidden=true;$('title').hidden=false;$('bPlay').textContent='Start mission';buildMenu();});
async function setupVR(){if(!navigator.xr)return;try{if(!await navigator.xr.isSessionSupported('immersive-vr'))return;}catch(e){return;}const b=$('bVR');b.hidden=false;
  b.addEventListener('click',async()=>{audioInit();try{const s=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor']});renderer.xr.setReferenceSpaceType('local-floor');await renderer.xr.setSession(s);
    s.addEventListener('end',()=>{VRM.close();state=state==='play'?'paused':state;$('title').hidden=false;$('bPlay').textContent=state==='paused'?'Resume':'Start mission';camera.add(GUN.g);});
    camera.remove(GUN.g);if(state==='play'){state='paused';}else{placeAtStart();}$('title').hidden=true;$('end').hidden=true;setTimeout(()=>VRM.open(state==='end'?undefined:null),400);}catch(e){console.warn(e);}});}
function placeAtStart(){PL.x=MIS.start[0];PL.z=MIS.start[1];rig.position.set(PL.x,H(PL.x,PL.z),PL.z);}

// ================================================================ boot
setTimeout(()=>{const _t=[performance.now()],_m=()=>_t.push(performance.now());decodeMap();_m();buildHeights();_m();buildLap();flattenHeights();_m();buildRacerTown();_m();clearForRacer();_m();buildGrids();_m();buildTown();_m();try{houseFronts();}catch(e){console.warn('house fronts',e);}_m();window.__boot=_t.map((v,i)=>i?Math.round(v-_t[i-1]):0);buildFlicker();buildPumpkins();applyTod();drawMapImage();state='menu';$('load').hidden=true;$('bPlay').disabled=false;$('bPlay').textContent='Start mission';useLevel();buildMenu();setupVR();applyHand();
  START=snapWalk(...MIS.start);END=snapWalk(...MIS.end);PL.x=START[0];PL.z=START[1];PL.yaw=Math.atan2(-(END[0]-START[0]),-(END[1]-START[1]));extractBuild();
  renderer.setAnimationLoop(frame);},30);
window.__z={get MAPIMG(){return MAPIMG;},ghost(dx,dy,dz){GH.push({x:PL.x+dx,z:PL.z+dz,y:H(PL.x,PL.z)+dy,h:0,a:1,ph:0,vx:0,vz:0,sw:0,hp:2,dead:0,life:30});},GH,pump:()=>PUMP?PUMP.n:0,allOn(){if(!WINMESH)return 0;for(const w of WST){w.t=99;w.m.setColorAt(w.i,new THREE.Color(0xff0000));w.m.instanceColor.needsUpdate=true;}return WST.length;},get state(){return state},PL,touch,UPG,OPT,applyTod,flick:()=>WST.length,wins:()=>WINS.length,inp:()=>readInput(),Z,LZ,MIS:()=>MIS,END:()=>END,kills:()=>kills,
  pick:(i,d)=>{MIS=MISSIONS[i];if(typeof d==='number'){LEVEL[MIS.id]=d;useLevel();}else if(d){dkey=d;DIFF=DIFFS[d];PICKD=d;}},LEVEL,levelDiff,start:startMission,
  sim(n,f){const out=[];for(let i=0;i<n;i++){const inp=f?f(i):{mx:0,mz:0,fire:false,run:false};if(state==='play')step(1/60,inp);}return {state,T:+T.toFixed(1),hp:Math.round(PL.hp),kills,zombies:Z.length,heat:+LZ.heat.toFixed(2),x:Math.round(PL.x),z:Math.round(PL.z),hold:+holdT.toFixed(1)};},
  strike(n){STORM.strike(!!n);},bdump:(x0,z0,x1,z1)=>BUILD.filter(b=>b.cx>x0&&b.cx<x1&&b.cz>z0&&b.cz<z1).map(b=>({pts:b.pts.map(p=>[+p[0].toFixed(1),+p[1].toFixed(1)]),h:b.h})),lmdbg:()=>LMDBG,practiceBonus,rks:()=>[!!RKS.buf,RKS.buf?+RKS.buf.duration.toFixed(1):0,!!RKS.src,MU.rock],get kills(){return kills},get tip(){return [LZ.tip.x,LZ.tip.y,LZ.tip.z]},camPos(){camera.getWorldPosition(_v1);camera.getWorldDirection(_v2);return [_v1.x,_v1.y,_v1.z,_v2.x,_v2.y,_v2.z];},manual(on){MANUAL=on?1:null;},frameStep(dt,inp){frameBody(dt,inp);},zs:()=>Z,heightCheck(){let lapMax=0,lapAvg=0;for(let i=0;i<NS;i+=3){const p=P[i];for(const o of [-4,0,4]){const x=p.x+R[i].x*o,z=p.z+R[i].z*o;const dd=Math.abs(H(x,z)-(p.y-.04));lapAvg+=dd;lapMax=Math.max(lapMax,dd);}}
    let sqMax=0;for(let a=-25;a<=25;a+=5)for(let b=-28;b<=28;b+=7){const [x,z]=sqWorld(a,b);sqMax=Math.max(sqMax,Math.abs(H(x,z)-(SQY-.02)));}
    let pkMax=0;for(let a=-40;a<=40;a+=8)for(let b=-30;b<=30;b+=6)pkMax=Math.max(pkMax,Math.abs(H(PARK.x+a,PARK.z+b)-(PARKY+.18)));return {lapMax:+lapMax.toFixed(2),lapAvg:+(lapAvg/(NS/3*3)).toFixed(3),sqMax:+sqMax.toFixed(2),pkMax:+pkMax.toFixed(2),SQY,PARKY};},LZ,BON,NPC,get DIFF(){return DIFF},los(x0,z0,x1,z1){let b=0;const n=Math.ceil(Math.hypot(x1-x0,z1-z0));for(let i=0;i<n;i++){const t=i/n;if(cellAt(x0+(x1-x0)*t,z0+(z1-z0)*t)===1)b++;}return b;},
  async rockMusicTest(sec){const real={ctx:AU.ctx,master:AU.master,noise:AU.noise},rm={bus:MU.bus,verb:MU.verb,dl:MU.dl,drone:MU.drone,dg:MU.dg};const oc=new OfflineAudioContext(2,44100*sec,44100);AU.ctx=oc;AU.master=oc.createGain();AU.master.gain.value=.8;AU.master.connect(oc.destination);
    const b=oc.createBuffer(1,oc.sampleRate*2,oc.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.noise=b;MU.bus=null;musicInit();MU.dg.gain.value=0;
    let st=0;for(let t=.1;t<sec-.5;t+=spbR()){rockTick(t,st);st++;}const buf=await oc.startRendering();Object.assign(AU,real);Object.assign(MU,rm);const L=buf.getChannelData(0),R=buf.getChannelData(1);let pk=0;for(let i=0;i<L.length;i++)pk=Math.max(pk,Math.abs(L[i]));
    const out=[];for(let i=0;i<L.length;i+=2)out.push(Math.round((L[i]+R[i])/2*32767/Math.max(pk,.01)*.85));return [pk,out];},
  async bossMusicTest(sec){const real={ctx:AU.ctx,master:AU.master,noise:AU.noise},rm={bus:MU.bus,verb:MU.verb,dl:MU.dl,drone:MU.drone,dg:MU.dg};const oc=new OfflineAudioContext(2,44100*sec,44100);AU.ctx=oc;AU.master=oc.createGain();AU.master.gain.value=.8;AU.master.connect(oc.destination);
    const b=oc.createBuffer(1,oc.sampleRate*2,oc.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.noise=b;MU.bus=null;musicInit();
    const t0=1.4;{const n=oc.createBufferSource();n.buffer=AU.noise;const f=oc.createBiquadFilter();f.type='highpass';f.frequency.value=5000;const g=oc.createGain();g.gain.setValueAtTime(.001,.1);g.gain.exponentialRampToValueAtTime(.35,1.2);g.gain.linearRampToValueAtTime(0,1.35);n.connect(f);f.connect(g);g.connect(MU.bus);n.start(.1);n.stop(1.4);drum(1.3,48,.9,2.2,120);brass(1.3,[50,53,57,62],2.4,.07);}
    EX.phase='inbound';holdT=MIS.hold;let st=0;for(let t=t0+.2;t<sec-1;t+=spbB()){holdT=MIS.hold*(1-(t-t0)/(sec-1-t0));bossTick(t,st%16,Math.floor(st/16));st++;}EX.phase='none';holdT=0;
    const buf=await oc.startRendering();Object.assign(AU,real);Object.assign(MU,rm);const L=buf.getChannelData(0),R=buf.getChannelData(1);let pk=0;for(let i=0;i<L.length;i++)pk=Math.max(pk,Math.abs(L[i]),Math.abs(R[i]));
    const out=[];for(let i=0;i<L.length;i+=2)out.push(Math.round((L[i]+R[i])/2*32767/Math.max(pk,.01)*.85));return [pk,out];},BOSS,alive:()=>Z.filter(z=>!z.dead).length,EX,HELI,setPL(x,z){PL.x=x;PL.z=z;},VRM,btnWorld(i){const b=VRM.st.btns[i];const u=(b.x+b.w/2)/1024,v=1-(b.y+b.h/2)/960;const p=new THREE.Vector3((u-.5)*1.6,(v-.5)*1.5,0);VRM.mesh.localToWorld(p);rig.worldToLocal(p);return [p.x,p.y,p.z];},
  async voxTest(kind,dist){const real={ctx:AU.ctx,master:AU.master,noise:AU.noise};const oc=new OfflineAudioContext(2,44100*3,44100);AU.ctx=oc;AU.master=oc.createGain();AU.master.connect(oc.destination);
    const b=oc.createBuffer(1,oc.sampleRate*2,oc.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;AU.noise=b;
    oc.listener.positionX&&(oc.listener.positionX.value=PL.x,oc.listener.positionZ.value=PL.z);VOX.length=0;zvoice({x:PL.x+dist,z:PL.z,type:'walker',sc:1},kind);const buf=await oc.startRendering();Object.assign(AU,real);VOX.length=0;
    const ch=buf.getChannelData(0);let s=0,pk=0;for(const x of ch){s+=x*x;pk=Math.max(pk,Math.abs(x));}return [Math.sqrt(s/ch.length),pk,Array.from(ch.filter((_,i)=>i%2===0))];},
  face(x,z){PL.yaw=Math.atan2(-(x-PL.x),-(z-PL.z));},render(){renderer.render(scene,camera);},calls:()=>[renderer.info.render.calls,renderer.info.render.triangles],
  path(ax,az,bx,bz){const s=navIdx(ax,az),g=navIdx(bx,bz);if(s<0||g<0)return -2;const D=new Int32Array(NW*ND).fill(-1),Q=new Int32Array(NW*ND);let h=0,t=0;D[s]=0;Q[t++]=s;while(h<t){const c=Q[h++];if(c===g)return D[c]*NC;const x=c%NW;for(const o of [-1,1,-NW,NW]){const n=c+o;if(n<0||n>=NW*ND)continue;if((o===-1&&x===0)||(o===1&&x===NW-1))continue;if(D[n]<0&&!NAV[n]){D[n]=D[c]+1;Q[t++]=n;}}}return -1;},
  // test autopilot: a full-map field towards the goal, walk down it and laser the nearest zombie
  auto(){const g=navIdx(END[0],END[1]);const D=new Int32Array(NW*ND).fill(-1),Q=new Int32Array(NW*ND);let h=0,t=0;D[g]=0;Q[t++]=g;while(h<t){const c=Q[h++];const x=c%NW;for(const o of [-1,1,-NW,NW]){const n=c+o;if(n<0||n>=NW*ND)continue;if((o===-1&&x===0)||(o===1&&x===NW-1))continue;if(D[n]<0&&!NAV[n]){D[n]=D[c]+1;Q[t++]=n;}}}
    return ()=>{const i=navIdx(PL.x,PL.z);let tx=END[0],tz=END[1];if(i>=0&&D[i]>1){let best=D[i],bi=-1;for(const [o,a,b] of DIRS8){const n=i+o;if(n<0||n>=NW*ND)continue;if(a&&(NAV[i+a]||NAV[i+b]))continue;if(D[n]>=0&&D[n]<best){best=D[n];bi=n;}}if(bi>=0){tx=AREA.x0+(bi%NW+.5)*NC;tz=AREA.z0+((bi/NW|0)+.5)*NC;}}
      let near=null,nd=22;for(const z of Z){if(z.dead)continue;const d=Math.hypot(z.x-PL.x,z.z-PL.z);if(d<nd){nd=d;near=z;}}
      const mv=Math.atan2(-(tx-PL.x),-(tz-PL.z));let fire=false,mx=0,mz=-1;
      if(near&&!LZ.over&&nd<16){PL.yaw=Math.atan2(-(near.x-PL.x),-(near.z-PL.z));PL.pitch=Math.atan2((near.y+1.2)-(H(PL.x,PL.z)+1.62),nd);fire=true;const rel=mv-PL.yaw;mx=-Math.sin(rel);mz=-Math.cos(rel);if(nd<3.5){mx=0;mz=1;}}else{PL.yaw=mv;PL.pitch=0;}
      return {mx,mz,fire,run:!near};};},
  dump(x,z,r=6){let out='';for(let dz=-r;dz<=r;dz++){for(let dx=-r;dx<=r;dx++)out+=dx===0&&dz===0?'@':'.#~s'[cellAt(x+dx,z+dz)];out+='   ';for(let dx=-r/2|0;dx<=r/2;dx++){const i=navIdx(x+dx*2,z+dz*2);out+=i<0?'?':NAV[i]?'#':'.';}out+='\n';}return out;},
  spawnAt(dx,dz,type){return !!spawnZombie(PL.x+dx,PL.z+dz,type||'walker');},clear(){Z.length=0;},snap:(x,z)=>snapWalk(x,z),
  route(){// shortest walking route length from start to end using the grid (for tests)
    flowField(END[0],END[1]);const i=navIdx(PL.x,PL.z);return i>=0?DIST[i]*NC:-1;}};

addEventListener('pointerdown',()=>{try{musicStart();}catch(e){}},{once:true});addEventListener('keydown',()=>{try{musicStart();}catch(e){}},{once:true});
