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
