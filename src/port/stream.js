// ================================================================ the beam as a proton-style stream: a writhing white-hot core in an orange-red sheath, blue lightning crackling round it, whipping behind your aim
const STREAM=(()=>{const tex=canvasTex(8,64,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.35,'rgba(255,255,255,.55)');gr.addColorStop(.5,'rgba(255,255,255,1)');gr.addColorStop(.65,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);},{srgb:false});
  const N=56;const mk=(color,op,w,n=N)=>{const pos=new Float32Array(n*2*3),uv=new Float32Array(n*2*2),idx=[];for(let i=0;i<n;i++){uv[i*4]=i/(n-1);uv[i*4+1]=0;uv[i*4+2]=i/(n-1);uv[i*4+3]=1;if(i<n-1){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({map:tex,color,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:true,fog:false,side:THREE.DoubleSide}));m.frustumCulled=false;m.visible=false;m.renderOrder=5;scene.add(m);return {m,pos,n,w,op,pts:Array.from({length:n},()=>new THREE.Vector3())};};
  const glow=mk(0xff3a12,.55,.34),sheath=mk(0xff8a1e,.85,.13),core=mk(0xfff3c8,1,.05);
  const arcs=[0,1,2,3].map(k=>Object.assign(mk(k%2?0x9fd8ff:0x5aa8ff,.95,.028,40),{jit:new Float32Array(40*2),jt:0,ph:k*1.7,r:.1+k*.025}));
  const tipS=new THREE.Vector3();let live=0,time=0;
  const A=new THREE.Vector3(),D=new THREE.Vector3(),C=new THREE.Vector3(),e1=new THREE.Vector3(),e2=new THREE.Vector3(),tg=new THREE.Vector3(),cam=new THREE.Vector3(),sd=new THREE.Vector3(),q=new THREE.Vector3(),p1=new THREE.Vector3();
  function lay(rb,f,wf){const {pos,n,pts}=rb;for(let i=0;i<n;i++)f(i/(n-1),pts[i]);
    for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];tg.subVectors(b,a);sd.subVectors(cam,pts[i]);sd.crossVectors(tg,sd).normalize();const w=rb.w*wf(i/(n-1))/2;
      pos[i*6]=pts[i].x+sd.x*w;pos[i*6+1]=pts[i].y+sd.y*w;pos[i*6+2]=pts[i].z+sd.z*w;pos[i*6+3]=pts[i].x-sd.x*w;pos[i*6+4]=pts[i].y-sd.y*w;pos[i*6+5]=pts[i].z-sd.z*w;}
    rb.m.geometry.attributes.position.needsUpdate=true;}
  function update(dt,on,surge){time+=dt;const want=on?1:0;live+=(want-live)*Math.min(1,dt*(on?30:9));const vis=live>.03;
    for(const rb of [glow,sheath,core,...arcs])rb.m.visible=vis;BEAM.spot.intensity=vis?(5+3*surge)*live:0;if(!vis){tipS.copy(LZ.tip);return;}
    GUN.muzzle.getWorldPosition(A);if(renderer.xr.isPresenting){GUN.muzzle.getWorldQuaternion(_q1);D.set(0,0,-1).applyQuaternion(_q1);}else camera.getWorldDirection(D);camera.getWorldPosition(cam);
    if(tipS.distanceToSquared(LZ.tip)>900)tipS.copy(LZ.tip);tipS.lerp(LZ.tip,1-Math.exp(-dt*11));// the whip: the far end lags behind your aim
    const L=Math.max(1,A.distanceTo(tipS));p1.copy(A).addScaledVector(D,L*.5);C.subVectors(tipS,A).normalize();e1.crossVectors(C,_UP);if(e1.lengthSq()<1e-4)e1.set(1,0,0);e1.normalize();e2.crossVectors(C,e1).normalize();
    const amp=Math.min(.5,.07+L*.012)*(1+.6*surge);
    const path=(t,out,k=0)=>{const u=1-t;out.set(0,0,0).addScaledVector(A,u*u).addScaledVector(p1,2*u*t).addScaledVector(tipS,t*t);const env=Math.pow(Math.sin(Math.PI*Math.min(1,t*1.15)),.8);
      const s1=Math.sin(t*L*.55-time*26+k)+.45*Math.sin(t*L*1.3-time*41+k*2),s2=Math.cos(t*L*.43-time*19+k)+.4*Math.sin(t*L*1.7+time*33);out.addScaledVector(e1,s1*amp*env).addScaledVector(e2,s2*amp*env*.8);return out;};
    const taper=t=>(.35+.65*Math.min(1,t*5))*(1+.35*surge)*(.9+.2*Math.sin(t*40-time*60));
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
