function scenery(cx,cz,S){
  LMPOS.length=0;LMDBG.length=0;CITY.on=false;BARR.list=[];barriersMesh();
  const L=LANDMARKS,here=([x,z])=>inNear(x,z,cx,cz,S)&&nearest(x,z)[0]<700;
  // town landmarks, placed first so the terraces fill in around them
  if(here(L.square))squarePlaza();
  if(here(L.friarTucks))friarTucks(...L.friarTucks);
  if(here(L.townHall)){const g=shopFront(...L.townHall,{name:'TOWN HALL',w:20,h:11,d:12,wall:0xd9d2c3,bg:'#d9d2c3',fg:'#3a3a3a',font:'700 54px Barlow, sans-serif'});
    const ped=new THREE.Mesh(new THREE.CylinderGeometry(.01,7,3,3,1),lam({map:TX.stone,color:0xd9d2c3}));ped.rotation.set(Math.PI/2,0,Math.PI);ped.scale.set(1,1,.2);ped.position.set(0,12.2,6.1);g.add(ped);
    const tw=new THREE.Mesh(new THREE.BoxGeometry(3.4,5,3.4),lam({map:TX.stone,color:0xd9d2c3}));tw.position.set(0,14,0);g.add(tw);
    const clk=new THREE.Mesh(new THREE.CircleGeometry(1.1,20),lam({color:0xf6f6f0}));clk.position.set(0,14.6,1.75);g.add(clk);}
  if(here(L.stPeters)){const q=byRoad(...L.stPeters,44);church(q.x,q.z,q.ry,{big:true});LMPOS.push([q.x,q.z]);}
  if(here(L.bandstand)){municipalPark();}
  if(here(L.phoneBox)){const q=byRoad(...L.phoneBox,1);const [,i]=nearest(q.x,q.z);const b=new THREE.Group();const red=lam({color:0xc8102e});
    const box=new THREE.Mesh(new THREE.BoxGeometry(1,2.4,1),red);box.position.y=1.2;b.add(box);const top=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1,12,1,false,0,Math.PI),red);top.rotation.z=Math.PI/2;top.position.y=2.4;b.add(top);
    for(const a of [0,Math.PI/2,Math.PI,-Math.PI/2]){const w=new THREE.Mesh(new THREE.PlaneGeometry(.7,1.4),lam({color:0x2a3440}));w.position.set(Math.sin(a)*.51,1.25,Math.cos(a)*.51);w.rotation.y=a;b.add(w);}
    const rh=Math.hypot(R[i].x,R[i].z),side=Math.sign((q.x-P[i].x)*R[i].x+(q.z-P[i].z)*R[i].z)||1;b.position.set(P[i].x+R[i].x/rh*side*(W2+VERGE-1.2),P[i].y+.12,P[i].z+R[i].z/rh*side*(W2+VERGE-1.2));b.rotation.y=q.ry;SR.add(b);}
  if(here(L.whistledown))whistledown(...L.whistledown,.594);
  if(here(L.loughQuay))shopFront(...L.loughQuay,{name:'THE LOUGH & QUAY',w:14,h:11,wall:0xe9e2d2,bg:'#183247',fg:'#f0e6c8'});
  if(here(L.baths))warrenpointBaths(...L.baths);
  if(here(L.annies))shopFront(...L.annies,{name:'ANNIE CAFE',ry:-.655,w:11,h:8,d:9,wall:0xf6e7d6,bg:'#f6e7d6',fg:'#7a2e3a',font:'700 60px Barlow, sans-serif'});
  if(here(L.breakwater)){const [x,z]=L.breakwater;const bw=new THREE.Mesh(new THREE.BoxGeometry(7,5,150),lam({map:TX.stone,color:0xa9a59a}));bw.position.set(x+20,0,z+75);bw.rotation.y=-.3;SR.add(bw);
    leadingLight(x+8,2.5,z+30,13.7);leadingLight(x+38,2.5,z+125,8.8);
    const cols=[0xc8322a,0x2a6fb5,0xf3c623,0x2f8a3a,0xf4f4ef,0xe66a1f];for(let k=0;k<9;k++){const bx=-120+k*10,bz=185+k*3;if(sdWater(bx,bz)<-4)boat(bx,bz,Math.PI/2+(rnd()-.5)*.3,cols[k%cols.length],k%3===0);}}
  if(here(L.port)){const [x,z]=L.port;crane(x-30,2.4,z-20,Math.PI/2);crane(x-25,2.4,z+40,Math.PI/2);
    for(let k=0;k<12;k++){const c=new THREE.Mesh(new THREE.BoxGeometry(6,2.6,2.4),lam({color:[0xb8322a,0x2a5d9c,0x3b8a4a,0xd99a1f][k%4]}));const cx2=x+15+(k%4)*7,cz2=z-30+(k>>2)*9;if(!freeSpot(cx2,cz2,2))continue;c.position.set(cx2,groundH(cx2,cz2)+1.3+(k%3===0?2.6:0),cz2);SR.add(c);}LMPOS.push(L.port);}
  if(here(L.keep)){const q=byRoad(...L.keep,16,{side:'water',off:W2+VERGE+10});keep(q.x,q.z,q.ry);LMPOS.push([q.x,q.z]);}
  if(here(L.castle)){const q=byRoad(...L.castle,16,{side:'land',off:95});mansion(q.x,q.z,q.ry);LMPOS.push([q.x,q.z]);const bx=q.x-Math.sin(q.ry)*60,bz=q.z-Math.cos(q.ry)*60;grove(bx,bz,110,70);}
  if(here(L.texaco))canopy(...L.texaco);
  if(here(L.circleK))canopy(...L.circleK);
  if(here(L.kellys)){const q=byRoad(...L.kellys,26);house(q.x,q.z,q.ry,{w:44,d:26,h:9,wall:0xc9ccd0,roof:'slate',chimney:false});LMPOS.push([q.x,q.z]);}
  if(here(L.burrenChurch)){const q=byRoad(...L.burrenChurch,30);church(q.x,q.z,q.ry);LMPOS.push([q.x,q.z]);}
  if(here(L.gardenCentre)){const q=byRoad(...L.gardenCentre,20);house(q.x,q.z,q.ry,{w:24,d:14,h:5,wall:0xe8efe0,roof:'slate',chimney:false});LMPOS.push([q.x,q.z]);}
  if(here(L.rostrevorInn))shopFront(...L.rostrevorInn,{name:'THE ROSTREVOR INN',w:14,h:9,wall:0xf6f1e6,bg:'#22311f',fg:'#e8d9a8'});
  if(here(L.fearons))shopFront(...L.fearons,{name:'FEARONS',w:10,h:8,wall:0xece4d0,bg:'#101820',fg:'#f2e6c8'});
  if(here(L.kilbroney))grove(L.kilbroney[0],L.kilbroney[1],260,140);
