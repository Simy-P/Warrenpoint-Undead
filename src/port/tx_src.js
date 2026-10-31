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