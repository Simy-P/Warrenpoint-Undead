// ================================================================ VR head-up display: a strip at the top of your view (health, heat, objective, arrow, kills, time), a minimap low right, and a red flash when you're bitten
function drawMiniMap(g,W,yaw){g.save();g.clearRect(0,0,W,W);g.beginPath();g.arc(W/2,W/2,W/2,0,Math.PI*2);g.clip();g.fillStyle='#0b1016';g.fillRect(0,0,W,W);
  const sc=W/300*1.1;g.translate(W/2,W/2);g.rotate(yaw);g.scale(sc,sc);g.drawImage(MAPIMG,-(PL.x-AREA.x0)/2,-(PL.z-AREA.z0)/2);
  for(const z of Z){if(z.dead)continue;g.fillStyle=z.type==='brute'?'#ff9a3a':'#ff4a4a';g.fillRect((z.x-PL.x)/2-1.5,(z.z-PL.z)/2-1.5,3,3);}
  g.fillStyle='#43f0ff';g.beginPath();g.arc((END[0]-PL.x)/2,(END[1]-PL.z)/2,5,0,Math.PI*2);g.fill();for(const p of PICKS)if(p.on){g.fillStyle=p.kind==='snack'?'#38d45f':'#ffd34a';g.fillRect((p.x-PL.x)/2-2,(p.z-PL.z)/2-2,4,4);}g.restore();
  g.fillStyle='#fff';const k=W/300;g.beginPath();g.moveTo(W/2,W/2-9*k);g.lineTo(W/2+6*k,W/2+6*k);g.lineTo(W/2-6*k,W/2+6*k);g.fill();
  g.strokeStyle='rgba(67,240,255,.6)';g.lineWidth=3;g.beginPath();g.arc(W/2,W/2,W/2-2,0,Math.PI*2);g.stroke();}
const VRH=(()=>{const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return {c,g:c.getContext('2d'),t};};
  const S=mk(1024,190),M=mk(256,256);
  const face=(m,x,y,z)=>{m.position.set(x,y,z);const mt=new THREE.Matrix4().lookAt(m.position,m.position.clone().multiplyScalar(2),new THREE.Vector3(0,1,0));m.quaternion.setFromRotationMatrix(mt);};
  const strip=new THREE.Mesh(new THREE.PlaneGeometry(.96,.178),new THREE.MeshBasicMaterial({map:S.t,transparent:true,depthTest:false,fog:false}));strip.renderOrder=35;face(strip,0,.37,-1.4);camera.add(strip);
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
    if(EX.phase==='landed'){t1='JUMP ON THE HELICOPTER!';t2='Get to the door, press A';}else if(PL.ride){t1='EXTRACTING';t2='Hold tight';}else if(holdT>0){t1=`HOLD ON: ${Math.ceil(holdT)} s`;t2='The helicopter is coming in';}else{t1=`${MIS.endName}: ${d} m`;t2='Follow the blue light';}
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
