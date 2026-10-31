// ---------------------------------------------------------------- facade overlays on the model's own buildings (they keep their real outline, height and collision)
function findBuild(cx,cz){let best=null,bd=4;for(const b of BUILD){const d=Math.hypot(b.cx-cx,b.cz-cz);if(d<bd){bd=d;best=b;}}return best;}
function facadeOverlay(b,faces,draw){const pts=b.pts,n=pts.length;const cx=b.cx,cz=b.cz;const y0=Math.min(...pts.map(p=>groundH(p[0],p[1])));const Hh=b.h||9;
  for(let k=0;k<n;k++){const [x0,z0]=pts[k],[x1,z1]=pts[(k+1)%n];const L=Math.hypot(x1-x0,z1-z0);if(L<2.5)continue;const mx=(x0+x1)/2,mz=(z0+z1)/2;let nx=z1-z0,nz=-(x1-x0);const nl=Math.hypot(nx,nz);nx/=nl;nz/=nl;
    if((mx-cx)*nx+(mz-cz)*nz<0){nx=-nx;nz=-nz;}const face=faces(mx,mz,nx,nz,L);if(!face)continue;
    const tw=Math.min(2048,Math.max(256,Math.round(L*48))),th=Math.round(tw*Hh/L);const tex=canvasTex(tw,th,(c,w,h)=>draw(c,w,h,L,Hh,face));
    const m=new THREE.Mesh(new THREE.PlaneGeometry(L,Hh),lam({map:tex}));m.position.set(mx+nx*.07,y0+Hh/2,mz+nz*.07);m.rotation.y=Math.atan2(nx,nz);SR.add(m);LMPOS.push([mx,mz]);}}
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
  const pp=findBuild(29.8,7);if(pp){facadeOverlay(pp,(mx,mz)=>nearLine(mx,mz,...CHS)<13?'church':null,(c,w,h,L,Hh)=>{const px=w/L;c.fillStyle='#f4f4f0';c.fillRect(0,0,w,h);
      const n=Math.max(1,Math.round(L/3));for(let k=0;k<n;k++){const cx=(k+.5)*w/n;for(const yy of [h*.08,h*.38]){c.fillStyle='#e0e0dc';c.fillRect(cx-px*.75,yy-4,px*1.5,px*1.7);c.fillStyle='#3e4a56';c.fillRect(cx-px*.6,yy,px*1.2,px*1.5);c.fillStyle='#f4f4f0';c.fillRect(cx-2,yy,4,px*1.5);c.fillRect(cx-px*.6,yy+px*.7,px*1.2,4);}}
      const fy=h*.64;c.fillStyle='#ffffff';c.fillRect(px*.2,fy,w-px*.4,px*.75);c.fillStyle='#d8201a';c.fillRect(px*.2,fy,w-px*.4,px*.1);c.fillRect(px*.2,fy+px*.65,w-px*.4,px*.1);
      c.fillStyle='#d8201a';c.font=`700 ${Math.round(px*.5)}px Arial,sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('pizza point',w/2,fy+px*.4);
      c.fillStyle='#7a4a24';c.fillRect(px*.3,fy+px*.8,w-px*.6,h-fy-px*.8);c.fillStyle='#c8dce6';c.fillRect(px*.5,fy+px*.95,w*.55-px*.5,(h-fy)*.62);c.fillStyle='#e8d8b0';c.fillRect(px*.7,fy+px*1.5,w*.4,px*.4);
      c.fillStyle='#5a3418';c.fillRect(w*.62,fy+px*.95,w*.3,h-fy-px*1.1);c.fillStyle='#c8dce6';c.fillRect(w*.65,fy+px*1.1,w*.24,(h-fy)*.4);});}}
