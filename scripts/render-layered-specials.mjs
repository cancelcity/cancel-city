import {createRequire} from 'node:module';
import path from 'node:path';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {writeScore} from './layered-audio.mjs';
import {NEXT_SCENES,paintNextScene} from './layered-next-scenes.mjs';
const runtime=createRequire(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'package.json'));
const {createCanvas,loadImage,GlobalFonts}=runtime('@napi-rs/canvas'),sharp=runtime('sharp');
GlobalFonts.registerFromPath('scripts/cinema/fonts/Display.ttf','FilmDisplay');GlobalFonts.registerFromPath('scripts/cinema/fonts/Mono.ttf','FilmMono');
const films=JSON.parse(await readFile('src/data/layered-films.json','utf8')),W=1280,H=720,FPS=60;
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,p)=>a+(b-a)*p;
const hash=b=>createHash('sha256').update(b).digest('hex'),INK='#100d10',PAPER='#ded1ad',ACID='#e1ff00',PINK='#ff248f';
for(const film of films){
 if(process.argv.length>2&&!process.argv.slice(2).includes(film.slug))continue;
 const root=`docs/art/layered-specials/${film.slug}`,input=JSON.parse(await readFile(`${root}/render-input.json`,'utf8')),out=path.dirname(`public${film.video}`),work=`work/layered-specials/${film.slug}`;
 await mkdir(out,{recursive:true});await mkdir(work,{recursive:true});
 const canvas=createCanvas(W,H),c=canvas.getContext('2d'),bg=await loadImage(input.background),images={};
 for(const f of Object.values(input.groups).flat())images[f.file]=await loadImage(f.file);
 for(const file of Object.values(input.props??{}))images[file]=await loadImage(file);
 function prop(name,x,y,h,rotation=0){const im=images[input.props[name]],w=h*im.width/im.height;c.save();c.translate(x,y);c.rotate(rotation);c.drawImage(im,-w/2,-h,w,h);c.restore();}
 function shape(points,fill,stroke=INK,width=3){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
 function line(points,color,width=3){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke();}
 function ellipse(x,y,rx,ry,fill){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
 function label(value,x,y,size=35,color=ACID,max=1100){c.save();c.font=`${size}px FilmDisplay`;c.textAlign='center';c.textBaseline='middle';const ratio=Math.min(1,max/c.measureText(value).width);c.translate(x,y);c.scale(ratio,1);c.lineJoin='round';c.lineWidth=Math.min(6,size*.11);c.strokeStyle=INK;if(color!==INK)c.strokeText(value,0,0);c.fillStyle=color;c.fillText(value,0,0);c.restore();}
 function hatchRect(x,y,w,h,fill,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=fill;c.fillRect(-w/2,-h/2,w,h);c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(-w/2,-h/2,w,h);c.save();c.beginPath();c.rect(-w/2,-h/2,w,h);c.clip();for(let i=-w;i<w+h;i+=6){line([[i,-h/2],[i-h*.6,h/2]],'#271b1599',.7);if(i%3===0)line([[i,h/2],[i-h*.33,-h/2]],'#271b1566',.6);}for(let i=0;i<Math.min(170,w*h/45);i++){const xx=(i*37.3)%w-w/2,yy=(i*29.7)%h-h/2;ellipse(xx,yy,.3+i%3*.3,.7,'#21191166');}line([[-w/2+2,-h/2+2],[w/2-2,-h/2+2]],'#f1dfb277',2);c.restore();c.restore();}
 function background(shot,p,locked=false){const q=locked?.5:p,k=Math.max(W/bg.width,H/bg.height)*(shot.id==='close'?1.16:1.035),dx=shot.id==='launch'?mix(18,-18,q):0;c.drawImage(bg,(W-bg.width*k)/2+dx,(H-bg.height*k)/2,bg.width*k,bg.height*k);}
 function actor(role,index,x,y,h,rotation=0){const frames=input.groups[role],f=frames[Math.min(frames.length-1,Math.max(0,Math.floor(index)))],im=images[f.file];if(film.slug==='freezer')h=h*.85*f.height/f.width;const w=f.width/f.height*h;c.save();c.globalAlpha=.46;ellipse(x,y+3,w*.3,Math.max(6,h*.018),INK);c.restore();c.save();c.translate(x,y);c.rotate(rotation);c.drawImage(im,-w/2,-h,w,h);c.restore();return {file:f.file,x,y,h,rotation};}
 function stream(t,amount=1,color=PAPER){c.save();c.globalAlpha=.32*amount;for(let i=0;i<35;i++){const x=((i*211-t*1300)%1700+1700)%1700-180,y=160+i*53%515;line([[x,y],[x-80-i%5*24,y+13]],color,i%4?1:3);}c.restore();}
 function burst(x,y,p,color=PAPER){for(let i=0;i<25;i++){const a=i*2.399,r=p*(180+i%7*39),xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r*.65+90*p*p;c.save();c.globalAlpha=(1-p)*.8;shape([[xx,yy-6],[xx+15+p*20,yy+2],[xx+5,yy+19],[xx-11,yy+9]],i%4?color:ACID,INK,1.5);c.restore();}}
 function cardboard(p){const hit=ease((p-.05)/.9);for(let i=0;i<16;i++){const col=i%4,row=Math.floor(i/4),ox=850+col*68,oy=635-row*58,x=ox+hit*(230+col*80),y=oy-Math.sin(hit*Math.PI)*(130+row*40)+hit*190;hatchRect(x,y,66,55,i%3?'#ae8050':'#c59a5b',hit*(i%2?3:-4));}}
 function coin(x,y,r,t){c.save();c.translate(x,y);c.scale(Math.max(.15,Math.abs(Math.cos(t*8))),1);ellipse(0,0,r+3,r+3,INK);ellipse(0,0,r,r,'#e8b94a');label('$1',0,0,r*1.1,INK,r*1.7);c.restore();}
 function cheque(x,y,w,rotation=0){const h=w*.43;c.save();c.translate(x,y);c.rotate(rotation);hatchRect(0,0,w,h,PAPER);c.strokeStyle='#297ab4';c.lineWidth=4;c.strokeRect(-w*.46,-h*.4,w*.92,h*.8);line([[-w*.4,h*.07],[w*.38,h*.07]],'#297ab4',2);label('ONE ENTIRE DOLLAR',0,-h*.17,w*.06,'#205a7b',w*.8);label('$1.00',0,h*.25,w*.11,INK,w*.8);c.restore();}
 function plate(x,y,r,rotation=0){c.save();c.translate(x,y);c.rotate(rotation);ellipse(0,0,r,r*.36,INK);ellipse(0,-2,r-4,r*.36-3,PAPER);c.beginPath();c.ellipse(0,-2,r*.72,r*.24,0,0,Math.PI*2);c.strokeStyle='#66533e';c.lineWidth=1.2;c.stroke();for(let i=0;i<7;i++)line([[-r*.8+i*r*.23,-3],[-r*.74+i*r*.22,5]],'#8a745666',.7);c.restore();}
 function book(x,y,w,rotation=0){c.save();c.translate(x,y);c.rotate(rotation);hatchRect(12,10,w,w*.66,'#79402f');hatchRect(5,-4,w*.94,w*.57,PAPER);for(let i=0;i<7;i++)line([[-w*.45,w*.1+i*4],[w*.45,w*.1+i*4]],'#6d5747',.7);hatchRect(-w*.47,0,w*.09,w*.66,'#653226');label('CANON',0,-w*.04,w*.12,INK,w*.7);c.restore();}
 function copier(x,y){hatchRect(x,y,255,205,'#9b9b83');hatchRect(x,y-108,270,28,'#d0c7aa');hatchRect(x-35,y-109,160,12,'#88bfc2');hatchRect(x+92,y-82,47,28,INK);ellipse(x+87,y-85,5,5,ACID);for(let i=0;i<3;i++)hatchRect(x,y-35+i*57,210,43,'#c4bda2');line([[x-45,y-28],[x+45,y-28]],INK,5);line([[x-45,y+29],[x+45,y+29]],INK,5);hatchRect(x-78,y+110,25,15,INK);hatchRect(x+78,y+110,25,15,INK);}
 function cookie(x,y,r,rotation=0){c.save();c.translate(x,y);c.rotate(rotation);ellipse(0,0,r+2,r+2,INK);ellipse(0,0,r,r,'#c4934a');for(let i=0;i<13;i++){const a=i*2.399,d=r*(.15+i%4*.2);ellipse(Math.cos(a)*d,Math.sin(a)*d,r*.085,r*.07,'#4c2d21');}for(let i=0;i<7;i++)line([[-r*.65+i*r*.2,-r*.7],[-r*.8+i*r*.2,r*.65]],'#62422a66',.8);c.restore();}
 function energyRing(x,y,rx,ry,t,color=ACID,opacity=1){c.save();c.globalAlpha=opacity;for(let j=0;j<3;j++){const pts=[];for(let i=0;i<=100;i++){const a=i*Math.PI/50+t+j*.04,r=1+Math.sin(i*8+j*7)*.012;pts.push([x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r]);}line(pts,j===1?PAPER:color,j===1?2:5);}for(let i=0;i<28;i++){const a=i*2.399+t;line([[x+Math.cos(a)*rx*.98,y+Math.sin(a)*ry*.98],[x+Math.cos(a)*rx*1.06,y+Math.sin(a)*ry*1.06]],INK,1);}c.restore();}
 function heart(x,y,size,t){c.save();c.translate(x,y);c.rotate(Math.sin(t*3)*.1);c.scale(size/100,size/100);c.beginPath();c.moveTo(0,35);c.bezierCurveTo(-100,-22,-35,-90,0,-36);c.bezierCurveTo(35,-90,100,-22,0,35);c.fillStyle=PINK;c.fill();c.strokeStyle=INK;c.lineWidth=4;c.stroke();for(let i=0;i<8;i++)line([[-28+i*8,-30],[ -37+i*8,0]],'#451b3288',1);c.restore();}
 function finalFlash(x,y,tip,r,t){const edge=(scale)=>{const pts=[];for(const sign of [-1,1]){const count=44;for(let j=0;j<=count;j++){const i=sign<0?j:count-j,k=i/count,noise=Math.sin(i*17.3+t*6)*8+Math.sin(i*7.1)*5,bulge=r*(.27+.73*Math.sin(k*Math.PI*.58));pts.push([mix(x,tip,k),y+sign*(bulge*scale+noise)]);}}return pts;};shape(edge(1.2),'#ad731a',INK,4);shape(edge(1),'#f1b932',INK,2);shape(edge(.7),ACID,null);shape(edge(.27),PAPER,null);for(let i=0;i<95;i++){const k=(i*.173+t*.4)%1,xx=mix(x,tip,k),yy=y+Math.sin(i*13.7)*r*.9;line([[xx,yy],[xx+17+i%5*8,yy-3]],i%3? '#61411caa':'#fff0bf',.8+i%3*.5);}for(let i=0;i<12;i++){const k=i/12,a=Math.sin(i*8+t*4);line([[mix(x,tip,k),y-r*.8],[mix(x,tip,k)+25,y-r*(1.2+Math.abs(a)*.45)],[mix(x,tip,k)+70,y-r*.85]],i%2?ACID:PAPER,2);}energyRing(x,y,r*.22,r*.6,t,ACID);energyRing(tip,y,r*.3,r,t,ACID);}
 function noodle(p,t){const points=[],end=Math.max(1,Math.round(clamp(p)*75));for(let i=0;i<=end;i++){const k=i/75,x=560+k*560,y=325+k*155-Math.sin(k*Math.PI)*(150+Math.sin(t*4)*40)+Math.sin(k*11+t*3)*k*45;points.push([x,y]);}c.save();c.lineCap='round';line(points,INK,17);line(points,'#c88f29',12);line(points,'#f3d276',5);for(let i=2;i<points.length;i+=5){const [x,y]=points[i];line([[x-3,y-5],[x+2,y+4]],'#735429',1);}c.restore();}
 const shotAt=t=>[...film.shots].reverse().find(s=>t>=s.start)??film.shots[0],paths=[];
 function paint(t,options={}){
  const s=shotAt(t),p=clamp((t-s.start)/(s.end-s.start)),q=options.locked?.5:p;
  const zoom=s.id==='launch'?mix(1.02,1.2,ease(q)):s.id==='impact'?mix(1.2,1.08,q):s.id==='gag'?mix(1.01,1.07,q):1;
  const half=W/(2*zoom),focus=Math.max(half,Math.min(W-half,s.id==='impact'?760:s.id==='launch'?mix(600,690,q):640));
  c.setTransform(1,0,0,1,0,0);c.save();c.translate(W/2,H/2);c.scale(zoom,zoom);c.translate(-focus,-H/2);
  background(s,p,options.locked);if(options.backgroundOnly){c.restore();return {shot:s.id};}let a;
  const A=input.groups.action.length-1,B=input.groups.ending.length-1,T=(input.groups.attack?.length??1)-1;
  if(s.id==='close'){a=actor('action',0,590,1075,1080+p*35,-.01);c.fillStyle='#100d1022';c.fillRect(0,0,W,H);if(t>.15)label({'homelesslander':'NOTICE SERVED.','master-cheese':'DAIRY DIVISION.',mrleast:'HUGE ANNOUNCEMENT.',nanami:'17:59. DO NOT ASK.',freezer:'BEHOLD MY FINAL FORM.',powerpoint:'WITNESS MY BLOOD SPELL.',kobeni:'ONE TRAY. NO BENEFITS.','gordon-ramen':'A VERY SERIOUS TASTING.',usoppgpt:'ONE PROMPT. ZERO SOURCES.'}[film.slug]??film.title.split(':').slice(1).join(':').trim().toUpperCase(),920,560,38,ACID,560);}
  if(film.slug==='homelesslander'){
   if(s.id==='reveal'){cardboard(0);a=actor('action',Math.min(1,A),350,675,520+p*22);label('UNDER BRIDGE. UPPER CLASS.',850,116,33,PAPER,700);}
   if(s.id==='launch'){const q=ease(p);stream(t);for(let i=0;i<7;i++)line([[240+i*14,320+i*40],[430+q*750,290+i*38]],i%2?PAPER:'#5db9d2',i%3?2:4);cardboard(0);a=actor('action',2+p*Math.max(0,A-4),mix(280,830,q),mix(640,470,Math.sin(p*Math.PI)),490,-.05+Math.sin(p*Math.PI)*.08);}
   if(s.id==='impact'){stream(t,.8);cardboard(p);a=actor('action',Math.max(0,A-1),mix(780,1470,p),570,480,-.06);burst(1030,470,p);}
   if(s.id==='return'){a=actor('ending',p*2,610,675,520);for(let i=0;i<4;i++)hatchRect(950-i*150,100+p*500+i*35,70,52,'#ad8050',p*3+i);}
   if(s.id==='gag'){const q=ease(p);for(let i=0;i<7;i++)hatchRect(230+i*128,682-i%2*12,105,34,'#b18455',i*.24);a=actor('ending',2+q*Math.max(0,B-2),620,675,520);if(p>.32)label('SECURITY DEPOSIT: GONE.',640,122,43,ACID,1100);}
  }
  if(film.slug==='master-cheese'){
   if(s.id==='reveal'){a=actor('action',1,475,678,560+p*12);label('FINISH THE FIGHT.',905,124,40,ACID,650);}
   if(s.id==='launch'){const q=ease(p);a=actor('action',2+Math.min(1,p*1.5)*Math.max(0,A-3),370-Math.sin(p*Math.PI)*15,682,560,Math.sin(t*38)*.012);stream(t,.8,'#e7b640');for(let i=0;i<34;i++){const age=(p*2.3+i*.047)%1,x=590+age*830,y=310+Math.sin(i*5)*90+age*70;hatchRect(x,y,25+i%4*5,5+i%3*3,i%2?'#e6ab31':'#ffe357',age*3+i);}if(q>.2)label('CHEDDAR COMMAND',870,122,40,ACID,690);}
   if(s.id==='impact'){stream(t,.6,'#edc153');const hit=ease((p-.1)/.8);for(let i=0;i<15;i++){const x=875+i%3*72+hit*(i%3-1)*390,y=640-Math.floor(i/3)*64-Math.sin(hit*Math.PI)*(80+i%4*50)+hit*100;hatchRect(x,y,68,60,i%2?'#b7b9a8':'#657a78',hit*(i%2?4:-4));}burst(980,480,p,'#f2c34c');label('GRATED.',640,130,70,ACID);}
   if(s.id==='return'){a=actor('ending',p*2,640,680,555);label('MISSION COMPLETE.',640,118,42,PAPER);}
   if(s.id==='gag'){const q=ease(p);ellipse(640,685,130+q*130,10+q*10,'#da9e27');a=actor('ending',2+q*Math.max(0,B-2),640,682,555);for(let i=0;i<9;i++){const age=(p*1.8+i*.117)%1,x=480+i*37,y=410+age*270;ellipse(x,y,3+age*3,5+age*8,'#e5af30');}if(p>.3)label('REFRIGERATE AFTER OPENING.',640,120,43,ACID,1120);}
  }
  if(film.slug==='mrleast'){
   if(s.id==='reveal'){a=actor('action',0,580,680,550+p*15);label('THE BIGGEST GIVEAWAY.',640,115,45,PAPER,1120);}
   if(s.id==='launch'){const q=ease(p);stream(t,.7);a=actor('action',1+q*Math.max(0,A-3),mix(440,740,q),683,560,-.05+Math.sin(p*Math.PI)*.07);}
   if(s.id==='impact'){const q=ease(p);cheque(mix(540,870,q),mix(250,585,q),900,-.4+q*.5);burst(870,590,p);for(let i=0;i<10;i++)hatchRect(790+i%4*65+q*(i%4-1)*170,660-Math.floor(i/4)*45-Math.sin(q*Math.PI)*170,48,34,i%2?'#427c9b':'#a7764c',q*i);}
   if(s.id==='return'){a=actor('ending',p*2,640,930,970);label('ACTUAL PRIZE: $1',990,320,30,PAPER,370);}
   if(s.id==='gag'){a=actor('ending',2+ease(p)*Math.max(0,B-2),640,930,970);const y=130+p*490;hatchRect(210+Math.sin(p*6)*65,y,11,25,PINK,p*6);if(p>.25)label('PLEASE HOLD THE STANDING OVATION.',640,110,39,ACID,1160);}
  }
  if(film.slug==='nanami'){
   // One strike, followed by an unhurried exit. The timeclock stays behind.
   hatchRect(1035,395,210,320,'#777677');hatchRect(1035,300,178,80,INK);label(t<1.4?'17:59':t<4.2?'18:00':'OUT',1035,300,43,ACID,160);hatchRect(1035,427,135,18,INK);
   if(s.id==='reveal'){a=actor('action',1+p*2,360,680,565);label('CONTRACTED HOURS.',610,112,40,PAPER,1000);}
   if(s.id==='launch'){const q=ease(p);stream(t,.8);a=actor('action',3+q*Math.max(0,A-4),mix(300,830,q),681-Math.sin(p*Math.PI)*15,565,-Math.sin(p*Math.PI)*.045);if(p>.3)line([[460+q*220,340],[520+q*640,450]],PAPER,6);}
   if(s.id==='impact'){const hit=ease((p-.15)/.7);a=actor('action',A,mix(770,840,hit),680,555);line([[650,320],[1150,520]],ACID,9*(1-p));for(let i=0;i<18;i++){const x=920+hit*(i%5-2)*130,y=620-i%4*45-Math.sin(hit*Math.PI)*(100+i%6*35);hatchRect(x,y,65,87,PAPER,hit*(i%2?4:-5));}burst(990,480,p);label('OVERTIME APPROVED.',630,115,43,ACID,1120);}
   if(s.id==='return'){a=actor('ending',p*3,690,680,555);hatchRect(945,452,105,120,PAPER,-.06+p*.12);label('TIME CARD',945,452,17,INK,95);}
   if(s.id==='gag'){const q=ease(p);a=actor('ending',Math.min(B,4+q*2),mix(680,-340,q),680-Math.sin(p*Math.PI*4)*2.5,555);if(p>.25)label('THE CLOCK IS FINISHING THE SHIFT.',640,110,38,ACID,1140);}
  }
  if(film.slug==='freezer'){
   if(s.id==='reveal'){a=actor('action',1+p*1.5,585,682,530);label('THE FINAL FORM.',640,112,45,PAPER);}
   if(s.id==='launch'){a=actor('action',3+ease(p)*Math.max(0,A-3),620,683,535);for(let i=0;i<10;i++){const age=(p*.9+i*.1)%1,x=430+i*43,y=660-age*150;c.save();c.globalAlpha=(1-age)*.15;ellipse(x,y,30+age*45,12+age*22,'#cee6e8');c.restore();}}
   if(s.id==='impact'){a=actor('ending',p*2,630,682,525);const q=ease(p);for(let i=0;i<24;i++){const angle=i*Math.PI*2/24,r=110+q*(120+i%4*30),x=640+Math.cos(angle)*r,y=490+Math.sin(angle)*r*.65;shape([[x,y-18],[x+9,y],[x,y+18],[x-10,y]],i%2?'#bce4e7':'#f4f0d6','#48747d',1.5);}c.save();c.globalAlpha=.13;ellipse(640,475,210+q*70,210,'#c6edeb');c.restore();label('−18°C',1000,180,78,ACID,450);}
   if(s.id==='return'){a=actor('ending',2+p*2,640+Math.sin(t*70)*1.1,684,525);label('COLD STORAGE: ACTIVE.',640,110,40,PAPER,1100);}
   if(s.id==='gag'){a=actor('ending',4+ease(p)*Math.max(0,B-4),640,685,525);if(p>.28)label('HE HAS CLOCKED OUT OF THE FIGHT.',640,113,38,ACID,1160);}
  }
  if(film.slug==='powerpoint'){
   const slideNumber=Math.min(97,1+Math.floor(ease(clamp((t-1.4)/1.45))*96));
   // Projection and shield are separate objects; the presenter stays intact.
   if(s.id!=='close'){hatchRect(640,235,550,255,PAPER);label(t<3.7?`SLIDE ${slideNumber}`:'SLIDE 97',640,145,25,INK,450);for(let i=0;i<3;i++)hatchRect(530+i*110,295-(i%2)*25,45,35+i*45,i%2?PINK:'#7351b5');}
   if(s.id==='reveal'){a=actor('action',1+p,360,681,560);label('MANDATORY BLOOD DECK.',640,111,42,ACID,1100);}
   if(s.id==='launch'){a=actor('action',2+ease(p)*Math.max(0,A-3),350,680,560);for(let i=0;i<18;i++){const age=(p*1.8+i*.07)%1,x=mix(550,1050,age),y=475-Math.sin(age*Math.PI)*(200+i%4*28)+i%3*20;hatchRect(x,y,75,100,PAPER,age*4+i*.1);}}
   if(s.id==='impact'){const q=ease(p);a=actor('action',A,340,682,550);for(let i=0;i<24;i++){const angle=i*Math.PI*2/24,x=870+Math.cos(angle)*(210-30*q),y=460+Math.sin(angle)*210;hatchRect(x,y,80,112,i%3?PAPER:'#f1c2d9',angle+.1*q);}label('PAPER SHIELD',870,450,44,ACID,450);}
   if(s.id==='return'){a=actor('ending',p*2,385,683,560);ellipse(640,244,62,62,'#cf376d');shape([[640,244],[640,182],[699,224]],ACID,INK,2);label('Q4 BLOOD STRATEGY',640,335,20,INK,450);}
   if(s.id==='gag'){a=actor('ending',2+ease(p)*Math.max(0,B-2),385,683,560);label('QUESTIONS ARE ALSO MANDATORY.',640,112,38,ACID,1160);label('97 / 98',640,335,23,INK,450);}
  }
  if(film.slug==='kobeni'){
   if(s.id==='reveal'){a=actor('action',1+p,450,681,550);label('THE LUNCH RUSH.',850,126,43,PAPER,650);}
   if(s.id==='launch'){const q=ease(p);a=actor('action',2+q*Math.max(0,A-3),mix(410,650,q),680-Math.sin(p*Math.PI)*48,545,Math.sin(p*Math.PI)*.025);for(let i=0;i<4;i++){const age=clamp((p-i*.08)/.74),x=mix(530+i*35,1000+i*22,age),y=440-Math.sin(age*Math.PI)*(180+i*23)+i*27;plate(x,y,43+i*3,Math.sin(age*Math.PI)*.5);}}
   if(s.id==='impact'){a=actor('action',A,590,682,550);for(let i=0;i<4;i++){plate(900+i%2*120,500+Math.floor(i/2)*85,68,0);const age=ease(p),r=25+age*60;line([[900+i%2*120-r,480+Math.floor(i/2)*85],[900+i%2*120+r,480+Math.floor(i/2)*85]],'#dfed9b',2*(1-p));}label('LUNCH SAVED.',640,120,49,ACID);}
   if(s.id==='return'){a=actor('ending',p*2,530,684,555);hatchRect(920,360,210,290,PAPER,-.05);label('TIP',920,295,43,INK,160);label('$0.00',920,385,51,INK,180);}
   if(s.id==='gag'){a=actor('ending',2+ease(p)*Math.max(0,B-2),530,684,555);label('ALL PLATES SAVED. NO WAGES FOUND.',640,115,38,ACID,1160);hatchRect(920,380,210,290,PAPER,.04);label('TIP: $0',920,340,37,INK,175);label('EXPOSURE',920,410,23,INK,180);}
  }
  if(film.slug==='gordon-ramen'){
   if(s.id==='reveal'){a=actor('action',1+p*2,440,680,565);label('INSTANT DOES NOT MEAN ACCEPTABLE.',640,117,38,PAPER,1130);}
   if(s.id==='launch'){const q=ease(p);a=actor('action',3+q*Math.max(0,A-4),mix(370,465,q),682,565,-Math.sin(p*Math.PI)*.02);noodle(q,t);stream(t,.3,'#e0b34b');}
   if(s.id==='impact'){a=actor('action',A,430,680,560);noodle(1,t);const q=ease(p);for(let i=0;i<11;i++){c.beginPath();c.ellipse(1000+Math.sin(i*3)*35,480+Math.cos(i*5)*35,45+q*75,18+q*52,i*.61,0,Math.PI*2);c.strokeStyle=INK;c.lineWidth=12;c.stroke();c.strokeStyle=i%2?'#edc65e':'#c69537';c.lineWidth=7;c.stroke();}burst(1010,490,p,'#d2bb7e');label('KNOT ACCEPTABLE.',640,116,46,ACID);}
   if(s.id==='return'){a=actor('ending',p*2,490,681,575);label('THE VERDICT IS IN.',850,126,36,PAPER,620);}
   if(s.id==='gag'){a=actor('ending',2+ease(p)*Math.max(0,B-2),490,682,575);label('HE WOULD STILL SEND IT BACK.',640,116,41,ACID,1130);}
  }
  if(film.slug==='usoppgpt'){
   if(s.id==='reveal'){a=actor('action',1+p*2,420,682,565);label('FACT CHECK: OFFLINE.',880,125,39,PAPER,640);}
   if(s.id==='launch'){const q=ease(p);a=actor('action',4+q*Math.max(0,A-4),390,683,555);for(let i=0;i<13;i++){const age=(p*1.6+i*.08)%1,x=670+age*430,y=520-Math.sin(age*Math.PI)*(180+i%4*30);hatchRect(x,y,70,98,PAPER,age*4+i*.2);}if(p>.45)book(mix(660,1050,q),mix(420,320,q),mix(180,420,q),q*.1);}
   if(s.id==='impact'){const q=ease(p);stream(t,.7);book(mix(750,1030,q),mix(330,560,q),mix(500,650,q),mix(-.25,.1,q));burst(1030,600,p);label('PLOT ARMOR DELIVERED.',640,115,42,ACID,1130);}
   if(s.id==='return'){a=actor('ending',p*2.5,590,684,555);label('NEWLY PUBLISHED.',920,130,37,PAPER,600);}
   if(s.id==='gag'){a=actor('ending',3+ease(p)*Math.max(0,B-3),590,684,555);label('THE LIE HAS A PUBLICATION DATE.',640,113,39,ACID,1150);}
  }
  if(film.slug==='light-yagamod'){
   const monitor=(text,x,y,w=260)=>{hatchRect(x,y,w,115,INK);line([[x-w*.46,y-48],[x+w*.46,y-48]],'#506766',2);label(text,x,y,27,ACID,w*.88);};
   if(s.id==='reveal'){a=actor('action',p*1.4,425,683,560);monitor('ONLINE',915,305);label('THE NOTEBOOK HAS ADMIN ACCESS.',640,113,38,PAPER,1140);}
   if(s.id==='launch'){const q=ease(p);a=actor('action',1+q*Math.max(0,A-2),425,682,565);stream(t,.35);for(let i=0;i<5;i++){const age=clamp((p-i*.09)/.55);if(age>0){const x=mix(500,880+i%2*110,age),y=420-Math.sin(age*Math.PI)*150+i*35;hatchRect(x,y,230,65,PAPER,(1-age)*-.4);label('BANNED',x,y,32,INK,205);}}}
   if(s.id==='impact'){a=actor('action',A-1,410,683,555);const q=ease(p);monitor('CHANNEL DELETED',930,335,440);c.save();c.translate(920,mix(-250,440,Math.min(1,q*2)));c.rotate(-.12);hatchRect(0,0,530,170,'#ec4173');label('BANNED',0,0,116,INK,480);c.restore();burst(950,475,p);}
   if(s.id==='return'){a=actor('ending',p*2,430,683,560);monitor('APPEALS: BANNED',935,310,430);monitor('TECH SUPPORT: BANNED',935,465,430);}
   if(s.id==='gag'){a=actor('ending',2+ease(p)*Math.max(0,B-2),430,683,560);monitor('ADMIN: ALSO BANNED',935,360,430);if(p>.22)label('WHO MODERATES THE MODERATOR?',640,116,40,ACID,1150);}
  }
  if(film.slug==='copy-paste-kakashi'){
   if(s.id!=='close')copier(785,565);
   if(s.id==='reveal'){a=actor('action',1+p,400,681,550);label('COPY. PASTE. COPYRIGHT.',640,112,43,PAPER,1130);}
   if(s.id==='launch'){const q=ease(p);a=actor('action',3+q*3,440,681,545);for(let i=0;i<7;i++){const age=clamp((p-i*.09)/.55);if(age>0)hatchRect(mix(785,1010,age),mix(440,540,age)-Math.sin(age*Math.PI)*185,120,160,PAPER,age*.4);}if(p>.25){c.save();c.globalAlpha=.55;c.translate(mix(800,1100,q),0);c.scale(-1,1);actor('action',6,0,680,530);c.restore();}}
   if(s.id==='impact'){const q=ease(p);a=actor('action',A,430,681,550);c.save();c.globalAlpha=.65;c.translate(mix(1040,-400,q),0);c.scale(-1,1);actor('action',6,0,681-Math.sin(q*Math.PI)*28,550);c.restore();for(let i=0;i<11;i++)hatchRect(760+q*(i%4-2)*350,390+i%3*50-Math.sin(q*Math.PI)*120,75,105,PAPER,q*i*.3);c.save();c.translate(850,300);c.rotate(-.18);label('UNLICENSED COPY',0,0,58,PINK,800);c.restore();label('WRONG DIRECTION.',640,113,44,ACID,1130);}
   if(s.id==='return'){a=actor('ending',p*3,450,681,555);label('THE INSTRUCTIONS WERE INCLUDED.',640,112,39,PAPER,1140);}
   if(s.id==='gag'){a=actor('ending',3+ease(p)*Math.max(0,B-3),450,681,555);hatchRect(935,290,210,265,PAPER,.1);c.save();c.translate(935,290);c.rotate(Math.PI+.1);label('THIS SIDE UP',0,-55,24,INK,185);shape([[0,0],[-37,58],[37,58]],INK,null);c.restore();if(p>.2)label('ORIGINAL THINKING: PAPER JAM.',640,112,39,ACID,1140);}
  }
  if(film.slug==='sauron-surveillance'){
   const tower=()=>{a=actor(s.id==='return'||s.id==='gag'?'ending':'action',s.id==='reveal'?p*2:s.id==='launch'?2+ease(p)*4:s.id==='impact'?A:s.id==='return'?p*2:2+ease(p)*Math.max(0,B-2),410,682,590);};
   if(s.id!=='close')tower();
   if(s.id==='reveal'){label('YOUR HISTORY IS MY BUSINESS.',640,112,40,PAPER,1140);}
   if(s.id==='launch'){const q=ease(p),cy=mix(290,570,q);c.save();c.globalAlpha=.17;shape([[410,240],[1200,cy-180],[1200,cy+180]],ACID,null);c.restore();line([[500,240],[1120,cy]],'#e1ff0099',2);hatchRect(970,360,340,340,PAPER,-.03);label('PROFILE ACQUIRED',970,240,28,INK,310);for(let i=0;i<5;i++){hatchRect(975,310+i*42,260,16,INK);if(p>i*.13)label('TRACKED',975,310+i*42,14,ACID,240);}}
   if(s.id==='impact'){const q=ease(p),top=mix(-700,-30,Math.min(1,q*2));hatchRect(960,top+440,490,880,PAPER,-.04);label('PRIVACY POLICY',960,top+140,39,INK,450);for(let i=0;i<20;i++)line([[760,top+200+i*27],[1160-i%3*30,top+200+i*27]],'#594d3a',2);burst(960,620,p);label('READ ALL 48,000 PAGES.',640,112,40,ACID,1140);}
   if(s.id==='return'){for(let i=0;i<5;i++)cookie(735+i*80,635-Math.sin(p*Math.PI)*(100+i%3*45),30+i%2*7,p*3+i);label('CONSENT IS MANDATORY.',640,112,43,PAPER,1140);}
   if(s.id==='gag'){for(let i=0;i<9;i++){const q=ease(clamp(p*1.4-i*.04));cookie(mix(1140+i%3*50,520+i%3*35,q),mix(450+i%4*40,650-i%2*10,q)-Math.sin(q*Math.PI)*170,23+i%3*7,q*4+i);}hatchRect(940,380,380,160,PAPER,.03);hatchRect(940,410,285,55,ACID,.03);label('ACCEPT ALL',940,410,39,INK,260);if(p>.2)label('THE EYE ALSO ACCEPTS COOKIES.',640,112,40,ACID,1140);}
  }
  if(film.slug==='infinite-rizz'){
   const domain=(strength=1)=>{energyRing(500,400,225*strength,270*strength,t*.25,'#5cceeb',.7);energyRing(500,400,180*strength,245*strength,-t*.2,PINK,.5);};
   if(s.id==='reveal'){a=actor('action',1+p*3,500,683,570);label('PERSONAL SPACE: INFINITE.',640,113,43,PAPER,1140);}
   if(s.id==='launch'){const q=ease(p);domain(.7+q*.3);a=p<.36?actor('action',4+p/.36*3,500,683,570):actor('attack',(p-.36)/.64*2,500+q*18,682,570);heart(mix(1230,770,1-(1-p)**3),355,90,t);for(let i=0;i<3;i++)energyRing(795+i*50,355,20+q*15,40+q*30,t,'#5cceeb',.4);stream(t,.3,'#5cceeb');}
   if(s.id==='impact'){const q=ease(p);domain();a=actor('attack',3+q*Math.max(0,T-3),520,682,570);heart(p<.2?770:mix(770,1500,ease((p-.2)/.8)),355,90,-t);for(let i=0;i<4;i++)energyRing(790+i*55,355,25+q*70,70+q*90,t,'#5cceeb',1-q);label('LEFT ON INFINITY.',640,112,46,ACID,1140);}
   if(s.id==='return'){domain();a=actor('ending',p*2,520,682,570);label('UNTOUCHABLE.',960,350,37,PAPER,430);}
   if(s.id==='gag'){domain();a=actor('ending',2+ease(p)*Math.max(0,B-2),520,682,570);if(p>.2)label('THE BLINDFOLD HAS LEFT THE CHAT.',640,112,39,ACID,1150);}
  }
  if(film.slug==='big-bald-energy'){
   if(s.id==='reveal'){a=actor('action',1+p*3,500,682,560);label('SALE ENDS IN ONE PUNCH.',640,113,43,PAPER,1140);}
   if(s.id==='launch'){const q=ease(p);a=p<.25?actor('action',5+p/.25*2,500,682,560):actor('attack',(p-.25)/.75*3,500+q*38,682,560);for(let i=0;i<12;i++)line([[610+i*22,290+i%5*50],[650+i*23+q*130,295+i%5*50]],'#ded1ad88',1);}
   if(s.id==='impact'){const q=ease(p);a=actor('attack',p<.2?4:5+(p-.2)/.8*Math.max(0,T-5),535,682,560);energyRing(mix(700,1450,q),420,30+q*220,70+q*350,t,PAPER,1-q);stream(t,1);for(let i=0;i<16;i++){const age=ease(clamp(p*1.2-i*.02));hatchRect(890+i%4*66+age*(200+i%4*110),650-Math.floor(i/4)*65-Math.sin(age*Math.PI)*(120+i%3*60)+age*80,60,55,i%2?'#a57a55':'#8a9b8f',age*(i%2?4:-4));}label('NORMAL PUNCH.',640,112,49,ACID,1140);}
   if(s.id==='return'){a=actor('ending',p*2,500,682,560);label('BACK TO THE IMPORTANT PART.',640,112,40,PAPER,1140);}
   if(s.id==='gag'){a=actor('ending',2+ease(p)*Math.max(0,B-2),500,682,560);hatchRect(940,345,350,230,PAPER,-.05);label('20% OFF',940,285,60,INK,310);label('EXPIRED YESTERDAY',940,385,34,PINK,320);if(p>.25)label('THE ONLY DAMAGE HE FELT.',640,112,43,ACID,1140);}
  }
  if(film.slug==='eternal-second'){
   if(s.id==='reveal'){a=actor('action',1+p*4,440,684,555);label('THIS ONE IS DEFINITELY FIRST.',640,113,41,PAPER,1140);}
   if(s.id==='launch'){const q=ease(p);a=p<.33?actor('action',5+p/.33*2,440,684,555):actor('attack',(p-.33)/.67*3,450,684,555);for(let i=0;i<3;i++)energyRing(640,385,30+q*90+i*14,30+q*90+i*14,t+i,ACID,.6);stream(t,.45,'#f2cf69');}
   if(s.id==='impact'){const q=ease(p),r=50+Math.sin(p*Math.PI)*100,tip=mix(690,1510,Math.min(1,p*3));a=actor('attack',3+q*Math.max(0,T-3),450-Math.sin(p*Math.PI)*12,684,555);finalFlash(650,385,tip,r,t);stream(t,1,'#edcc60');label('MAXIMUM EFFORT.',640,112,46,ACID,1140);}
   if(s.id==='return'){a=actor('ending',p,530,684,560);label('THE RESULTS ARE IN.',640,112,43,PAPER,1140);}
   if(s.id==='gag'){const q=ease(p);hatchRect(970,590,270,170,'#869096');label('2',970,590,126,INK,230);a=actor('ending',1+q*Math.max(0,B-1),530,684,560);if(p>.25)label('SECOND. AGAIN.',640,112,56,ACID,1140);}
  }
  if(film.slug==='fraudo-baggins'){
   const roll=s.id==='return'?p*.35:s.id==='gag'?.35+ease(p)*.65:0,edge=mix(1050,220,roll);
   if(s.id!=='close'){shape([[230,690],[edge,690],[edge-90,610],[360,610]],'#a73f47',INK,4);for(let i=0;i<14;i++){const x=270+i*52;if(x<edge-35)line([[x,680],[x-5,620]],'#d1ac65',1.5);}if(roll>0){ellipse(edge,650,25,42,INK);ellipse(edge,650,19,37,'#b04c53');}}
   const ring=(x,y,r)=>{c.save();c.translate(x,y);c.scale(.45+.55*Math.abs(Math.cos(t*2)),1);for(const [w,color] of [[r*.29,INK],[r*.22,'#9e6418'],[r*.13,'#e4bd45'],[r*.035,PAPER]]){c.beginPath();c.ellipse(0,0,r,r,0,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=w;c.stroke();}for(let i=0;i<40;i++){const z=i*Math.PI/20;line([[Math.cos(z)*r*.92,Math.sin(z)*r*.92],[Math.cos(z)*r*1.08,Math.sin(z)*r*1.08]],'#654116',1);}c.restore();};
   if(s.id==='reveal'){a=actor('action',1+p*3,450,680,510);label('GUARANTEED RETURNS. PROBABLY.',640,112,40,PAPER,1140);}
   if(s.id==='launch'){const q=ease(p);a=actor('attack',q*T,mix(420,580,q),681-Math.sin(p*Math.PI)*55,510);if(p>.48){const k=ease((p-.48)/.52);ring(mix(670,1000,k),mix(350,410,k)-Math.sin(k*Math.PI)*95,mix(28,180,k));}stream(t,.35,'#ead183');}
   if(s.id==='impact'){const q=ease(p);a=actor('attack',T,565,680,510);ring(mix(950,1260,q),430,mix(185,240,q));for(let i=0;i<8;i++){const k=ease(clamp(p*1.6-i*.06)),x=830+i%2*120+k*450,y=360+Math.floor(i/2)*65-Math.sin(k*Math.PI)*80;hatchRect(x,y,210,55,PAPER,k*.3);label('100% RETURN',x,y,24,INK,190);}burst(1090,550,p,'#d7b45c');label('REFER EVERYONE.',640,112,48,ACID,1140);}
   if(s.id==='return'){a=actor('ending',p*2,560,680,510);label('THE RUG IS MOVING.',890,220,37,PAPER,650);}
   if(s.id==='gag'){a=actor('ending',2+ease(p)*Math.max(0,B-2),mix(560,400,ease(p)),680,510,p<.65?Math.sin(p*Math.PI)*-.08:0);if(p>.25)label('YOUR RETURNS HAVE BEEN REFERRED.',640,112,38,ACID,1140);}
  }
  if(film.slug==='daenerys-airfryer'){
   if(s.id!=='close'){hatchRect(985,652,490,70,'#71625a');hatchRect(1000,566,420,35,'#8e7a69');prop('airfryer',1000,560,240);prop('airfryer',835,655,280);prop('airfryer',1150,655,280);}
   if(s.id==='reveal'){a=actor('action',1+p*3,405,684,565);label('DRACARYS.',640,112,54,PAPER,1140);}
   if(s.id==='launch'){a=actor('attack',ease(p)*T,405,684,565);hatchRect(975,245,380,95,INK);label(p>.64?'PREHEAT: 99%':`PREHEAT: ${Math.floor(ease(p/.64)*99)}%`,975,245,38,ACID,350);for(let i=0;i<3;i++){c.save();c.globalAlpha=.05+p*.09;ellipse(835+i*155,475-i%2*70,78,45,'#ff9e35');c.restore();}}
   if(s.id==='impact'){a=actor('attack',T,480,684,565);label('PREHEAT COMPLETE.',640,112,44,ACID,1140);for(let i=0;i<3;i++){const k=clamp((p-.12-i*.04)/.7);if(k>0){const x=mix(835+i*155,1530,k),y=455-i%2*70-Math.sin(k*Math.PI)*150;line([[x-100*k,y+20],[x,y]],'#f3a12f',8);cookie(x,y,10+i*2,k*5);burst(1250,400,k,'#d6b768');}}}
   if(s.id==='return'){a=actor('ending',p*3,405,684,565);label('A MEAL FIT FOR A QUEEN.',640,112,41,PAPER,1140);}
   if(s.id==='gag'){a=actor('ending',3+ease(p)*Math.max(0,B-3),405,684,565);if(p>.2)label('THREE DRAGONS. ONE NUGGET.',640,112,44,ACID,1140);}
  }
  if(film.slug==='l-ratio'){
   const board=(end=false)=>{hatchRect(950,365,395,360,INK);label(end?'REPLIES: 0 / 10,000':'EVIDENCE: VERIFIED',950,240,27,ACID,360);for(let i=0;i<5;i++)line([[790,300+i*40],[1110-i%2*45,300+i*40]],end?'#d96099':'#96a6a1',3);};
   if(s.id==='reveal'){board();a=actor('action',1+p,450,682,530);label('THE FACTS ARE ALL HERE.',640,112,43,PAPER,1140);}
   if(s.id==='launch'){board();a=actor('action',3+ease(p)*Math.max(0,A-4),mix(420,535,ease(p)),682,535);for(let i=0;i<8;i++){const k=clamp((p-i*.06)/.65),x=mix(600,980,k),y=400+i%3*80-Math.sin(k*Math.PI)*130;hatchRect(x,y,145,80,PAPER,k*.12);label('PROOF',x,y,27,INK,130);}stream(t,.3);}
   if(s.id==='impact'){board(true);a=actor('action',A,510,682,540);const y=mix(-200,415,Math.min(1,ease(p)*1.8));hatchRect(950,y,260,250,PINK,-.09);label('L',950,y,210,INK,230);burst(950,530,p);label('CASE CLOSED. RATIO OPEN.',640,112,43,ACID,1140);}
   if(s.id==='return'){board(true);a=actor('ending',p*2,480,682,540);}
   if(s.id==='gag'){board(true);a=actor('ending',2+ease(p)*Math.max(0,B-2),480,682,540);label('STILL CORRECT. STILL RATIOED.',640,112,42,ACID,1140);}
  }
  if(film.slug==='yasuo-zero-ten'){
   if(s.id!=='close'){hatchRect(1040,220,230,110,INK);label(s.id==='return'||s.id==='gag'?'0 / 10':'0 / 9',1040,220,60,PINK,210);}
   if(s.id==='reveal'){a=actor('action',1+p*3,415,683,545);label('ONE PERFECT DASH.',640,112,44,PAPER,1140);}
   if(s.id==='launch'){const q=ease(p);a=p<.3?actor('action',5+p/.3*Math.max(0,A-5),415,683,545):actor('attack',(p-.3)/.7*Math.max(0,T-2),mix(390,820,q),683-Math.sin(p*Math.PI)*45,545);stream(t,.8);for(let i=0;i<6;i++)energyRing(480+q*420+i*35,420,25+i*12,150+i*18,t+i,'#8ec6d4',.5);}
   if(s.id==='impact'){const q=ease(p);a=actor('attack',T-1+q,mix(790,1510,q),680,545,-.03);for(let i=0;i<9;i++)line([[750+i*30,240+i*18],[1110+q*350,600-i*17]],i%2?PAPER:'#91d4de',i%3?2:6);hatchRect(1000,400,300,95,PAPER,-.08);label('WRONG EXIT',1000,400,43,INK,270);stream(t,.8);label('THE WRONG LANE.',640,112,48,ACID,1140);}
   if(s.id==='return'){a=actor('ending',p,550,683,545);label('0 / 10 POWER SPIKE.',640,112,44,PAPER,1140);}
   if(s.id==='gag'){a=actor('ending',1+ease(p)*Math.max(0,B-1),550,683,545);if(p>.2)label('DEFINITELY A TEAM PROBLEM.',640,112,43,ACID,1140);}
  }
  if(s.id!=='close'&&NEXT_SCENES.has(film.slug))a=paintNextScene({film,s,p,t,A,B,T,input,c,actor,shape,line,ellipse,label,hatchRect,energyRing,burst,stream,finalFlash,clamp,ease,mix});
  // Ink flecks are an overlay; the scenery itself is the same source plate.
  c.save();c.strokeStyle='#0b080b35';c.lineWidth=.7;for(let i=0;i<115;i++){const x=i*179%W,y=i*113%H;line([[x,y],[x+2+i%4,y-3]],'#0b080b35',.7);}c.restore();
  c.restore();
  if(t>film.duration-.08){c.fillStyle=`rgba(16,13,16,${clamp((t-film.duration+.08)/.08)})`;c.fillRect(0,0,W,H);}
  return {shot:s.id,actor:a};
 }
 await writeScore(film,`${work}/score.wav`);
 const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${W}x${H}`,'-framerate',`${FPS}`,'-i','pipe:0','-i',`${work}/score.wav`,'-c:v','libx264','-threads','2','-preset','slow','-tune','animation','-crf','27','-pix_fmt','yuv420p','-c:a','aac','-ar','48000','-b:a','160k','-movflags','+faststart','-t',`${film.duration}`,`public${film.video}`],{stdio:['pipe','inherit','inherit']});const exited=once(ff,'exit');
 for(let i=0;i<Math.round(film.duration*FPS);i++){const data=paint(i/FPS);paths.push({frame:i,...data});const pixels=c.getImageData(0,0,W,H).data;if(!ff.stdin.write(Buffer.from(pixels.buffer,pixels.byteOffset,pixels.byteLength)))await once(ff.stdin,'drain');}ff.stdin.end();const [code]=await exited;if(code!==0)throw Error(`Render failed: ${film.slug}`);
 const contact=createCanvas(1920,1440),cc=contact.getContext('2d');let cell=0;for(const s of film.shots){paint(s.start+(s.end-s.start)*.5);await sharp(canvas.toBuffer('image/png')).resize(384,216).webp({quality:92}).toFile(`public${s.thumbnail}`);for(const p of [.2,.74]){paint(s.start+(s.end-s.start)*p);cc.drawImage(canvas,cell%3*640,Math.floor(cell/3)*360,640,360);cell++;}}
 paint(film.shots[2].start+.55);await sharp(canvas.toBuffer('image/png')).webp({quality:93}).toFile(`public${film.poster}`);await writeFile(`${work}/contact.jpg`,contact.toBuffer('image/jpeg'));
 const time=t=>{const ms=Math.round(t*1000);return `00:${String(Math.floor(ms/60000)).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;};
 await writeFile(`public${film.captions}`,'WEBVTT\n\n'+film.shots.map((s,i)=>`${i+1}\n${time(s.start)} --> ${time(s.end)}\n${s.description}\n`).join('\n'));
 const stable=film.shots.map(s=>{paint(s.start+.01,{backgroundOnly:true,locked:true});const first=hash(canvas.toBuffer('image/png'));paint(s.end-.01,{backgroundOnly:true,locked:true});const equal=first===hash(canvas.toBuffer('image/png'));if(!equal)throw Error('Background changed');return {shot:s.id,lockedBackgroundIdentical:equal};});
 execFileSync('ffmpeg',['-v','error','-i',`public${film.video}`,'-f','null','-'],{stdio:'pipe'});
 const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',`public${film.video}`],{encoding:'utf8'}));
 // Absent Father's scripted final shots intentionally contain an empty stage.
 if(paths.filter(frame=>frame.actor).length/paths.length<(film.slug==='absent-father'?.48:.7))throw Error(`Character choreography is incomplete: ${film.slug}`);
 if(Math.abs(Number(probe.format.duration)-film.duration)>.03)throw Error('Wrong movie duration');
 await writeFile(`${root}/render-report.json`,JSON.stringify({slug:film.slug,cardId:film.cardId,duration:film.duration,fps:FPS,encoding:{codec:'H.264/AAC',crf:27,preset:'slow',tune:'animation'},frames:paths.length,drawings:Object.values(input.groups).flat().length,backgroundSourceHash:hash(await readFile(input.background)),backgroundStability:stable,wholeActorTransformsOnly:true,audio:'Original synthesized per-character Foley, no sampled music or voice.',verification:{decoded:true,duration:true,browserPlayback:'unverified',phoneLayout:'unverified',audiblePlayback:'unverified'},probe},null,2));
 await writeFile(`${work}/actor-paths.json`,JSON.stringify(paths));console.log(`${film.slug}: ${film.duration}s / ${paths.length} frames; decoded, duration and fixed plate verified`);
}
