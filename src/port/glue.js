// ================================================================ the driving game's Warrenpoint: its town lap road, landmarks and clearing rules, so both games share one map
let SR=null;const SOLIDS=[],LMPOS=[];const W2=5.5,VERGE=4;let P=[],R=[],NS=0;const LGRID=new Map(),LCELL=20;
const groundH=(x,z)=>H(x,z);const shortClear=()=>true;
function nearest(x,z){const cx=Math.floor(x/LCELL),cz=Math.floor(z/LCELL);let best=1e18,bi=0;
  for(let r=1;r<40;r++){for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){if(r>1&&Math.abs(a)<r&&Math.abs(b)<r)continue;const l=LGRID.get((cx+a)+','+(cz+b));if(!l)continue;for(const i of l){const dx=P[i].x-x,dz=P[i].z-z,d=dx*dx+dz*dz;if(d<best){best=d;bi=i;}}}if(best<1e18&&r>=2)break;}
  return [Math.sqrt(best),bi];}
const freeSpot=(x,z,m)=>nearest(x,z)[0]>W2+VERGE+m&&!solid(x,z);
function buildLap(){const pts=filletPts(LAP_CP,false);const curve=new THREE.CatmullRomCurve3(pts.map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');curve.arcLengthDivisions=Math.max(2000,pts.length*120);
  const L=curve.getLength();NS=Math.floor(L/2);P=[];for(let i=0;i<NS;i++)P.push(curve.getPointAt(i/NS));
  let ys=P.map(p=>H(p.x,p.z));for(let pass=0;pass<2;pass++){const n=[];for(let i=0;i<NS;i++){let s=0;for(let j=-6;j<=6;j++)s+=ys[(i+j+NS)%NS];n.push(s/13);}ys=n;}P.forEach((p,i)=>p.y=ys[i]+.05);
  R=P.map((p,i)=>{const a=P[(i+NS-1)%NS],b=P[(i+1)%NS];const tx=b.x-a.x,tz=b.z-a.z,l=Math.hypot(tx,tz)||1;return new THREE.Vector3(-tz/l,0,tx/l);});
  for(let i=0;i<NS;i++){const k=Math.floor(P[i].x/LCELL)+','+Math.floor(P[i].z/LCELL);if(!LGRID.has(k))LGRID.set(k,[]);LGRID.get(k).push(i);}}
const lapY=(x,z)=>{const [d,i]=nearest(x,z);return [d,P[i].y];};
function buildRacerTown(){SR=new THREE.Group();world.add(SR);racerLandmarks();
  const sprites=[];SR.traverse(o=>{if(o.isSprite||o.isPoints)sprites.push(o);});for(const sp of sprites)world.attach(sp);bakeInto(SR,world);world.remove(SR);}
// keep the lap road, its pavements, the Square, the park and the landmarks clear, exactly as the racer does
function clearForRacer(){const lmBoxes=SOLIDS.filter(o=>o.box);const lmHit=(x,z,m)=>lmBoxes.some(o=>{const dx=x-o.x,dz=z-o.z,c=Math.cos(o.ry),s=Math.sin(o.ry);const lx=dx*c-dz*s,lz=dx*s+dz*c;return Math.abs(lx)<o.w/2+m&&Math.abs(lz)<o.d/2+m;});
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
