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
