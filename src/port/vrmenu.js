// ================================================================ in-headset menu: point the right controller and pull the trigger. Missions, difficulty, options, the lab, and your results
const VRM=(()=>{const W=1024,Hh=800;const c=document.createElement('canvas');c.width=W;c.height=Hh;const g=c.getContext('2d');const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.25),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthTest:false,fog:false}));mesh.renderOrder=40;mesh.visible=false;scene.add(mesh);
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
      MISSIONS.forEach((m,i)=>btn(40+i*318,y,300,64,m.title,m===MIS,()=>{MIS=m;saveOpt();buildMenu();}));y+=84;
      g.fillStyle='#43f0ff';g.fillText('DIFFICULTY',40,y+20);g.fillText('TIME OF DAY',540,y+20);y+=30;
      Object.entries(DIFFS).forEach(([k,d],i)=>btn(40+i*150,y,138,56,d.name,k===dkey,()=>{dkey=k;DIFF=d;saveOpt();buildMenu();}));
      [['dusk','Dusk'],['night','Night']].forEach(([v,l],i)=>btn(540+i*215,y,200,56,l,OPT.tod===v,()=>{OPT.tod=v;saveOpt2();applyTod();buildOptions();}));y+=76;
      g.fillStyle='#43f0ff';g.fillText('WEATHER',40,y+20);g.fillText('MUSIC',540,y+20);y+=30;
      [[true,'Thunderstorm'],[false,'Calm']].forEach(([v,l],i)=>btn(40+i*215,y,200,56,l,(OPT.storm!==false)===v,()=>{OPT.storm=v;saveOpt2();buildOptions();}));
      [[true,'Spooky music'],[false,'Off']].forEach(([v,l],i)=>btn(540+i*215,y,200,56,l,(OPT.music!==false)===v,()=>{OPT.music=v;saveOpt2();musicStart();musicSetVol();buildOptions();}));y+=86;
      const go=state==='paused'?'RESUME':st.result?'PLAY AGAIN':'START MISSION';
      btn(40,y,460,84,go,false,()=>{if(state==='paused'){close();state='play';return;}close();startMission();},{bold:1,fs:34});
      btn(524,y,460,84,`THE LAB · ${CRED} credits`,false,()=>{st.page='lab';},{fs:28});
      if(state==='paused'){y+=100;btn(40,y,944,56,'Quit mission (back to menu)',false,()=>{state='menu';st.result=null;});}}
    else{g.fillStyle='#43f0ff';g.font='700 22px Barlow,sans-serif';g.fillText(`THE LAB · ${CRED} CREDITS TO SPEND`,40,y+28);y+=44;
      UPG_DEF.forEach(([k,name,desc],i)=>{const col=i%2,row=i/2|0,x=40+col*482,yy=y+row*150;rr(x,yy,462,136,16);g.fillStyle='rgba(255,255,255,.05)';g.fill();
        g.fillStyle='#fff';g.font='700 26px Barlow,sans-serif';g.fillText(name,x+16,yy+34);g.fillStyle='#9fb0bd';g.font='500 19px Barlow,sans-serif';g.fillText(desc,x+16,yy+62);
        for(let p=0;p<3;p++){g.fillStyle=p<UPG[k]?'#43f0ff':'rgba(255,255,255,.14)';g.fillRect(x+16+p*50,yy+78,44,8);}
        const lv=UPG[k],cost=UPG_COST[lv];btn(x+200,yy+80,246,44,lv>=3?'Maxed':`Upgrade: ${cost}`,false,()=>{if(lv>=3||CRED<cost)return;CRED-=cost;UPG[k]++;saveUpg();tone(660,990,.18,.08);buildOptions();},{dis:lv>=3||CRED<cost,fs:22});});
      btn(40,y+470,944,64,'BACK',false,()=>{st.page='main';},{bold:1,fs:28});}
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
    if(hit){ray.scale.z=hit.distance;const u=hit.uv;const px=u.x*W,py=(1-u.y)*Hh;dot.visible=true;dot.position.set((u.x-.5)*1.6,(u.y-.5)*1.25,.002);hot=st.btns.findIndex(b=>px>=b.x&&px<=b.x+b.w&&py>=b.y&&py<=b.y+b.h);}else{ray.scale.z=5;dot.visible=false;}
    if(hot!==st.hot){st.hot=hot;draw();if(hot>=0&&!st.btns[hot].dis)tone(1300,1300,.03,.03,'sine');}
    const gp=c.userData.gp;const trig=!!(gp&&gp.buttons[0]&&gp.buttons[0].value>.5);
    if(trig&&!st.trigWas&&hot>=0&&!st.btns[hot].dis){tone(880,1320,.07,.06,'triangle');st.btns[hot].act();if(st.open)draw();}st.trigWas=trig;}
  return {open,close,update,draw,st,mesh};})();
