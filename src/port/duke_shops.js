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
    c.fillStyle=u.pil||'#2a2a2a';for(let k=1;k<3;k++){const mx=(u.doorL?gx0+dw:gx0)+(gx1-gx0-dw)*k/3;c.fillRect(mx-2,Y(2.95),4,px*2.35);}
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
  for(const [t,s,units] of SH){const cx=A[0]+ux*t+uz*s,cz=A[1]+uz*t-ux*s;const b=findBuild(cx,cz);if(!b){console.warn('duke: no building at',t,s);continue;}const fe=frontEdge(b,A,B);if(!fe)continue;
    facadeOverlay(b,(mx,mz)=>Math.hypot(mx-fe[0],mz-fe[1])<.1?'duke':null,(c,w,h,L,Hh)=>paintFront(c,w,h,L,Hh,units));made++;}
  LMDBG.push(['DUKE STREET SHOPS',A[0]+ux*50,A[1]+uz*50,0,made]);}
