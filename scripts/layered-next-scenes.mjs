// The second half of the twenty-card production batch. Actors remain intact;
// every moving document, beam, appliance, graph and plant is an independent layer.
export const NEXT_SCENES=new Set(['erwin-linkedin','gandalf-grey-market','genos-windows-update','sully-hr','olaf-global-warming','dutch-pyramid-scheme','absent-father','anti-anti-meat','power-of-friendship','touch-grass-final-boss']);
export function paintNextScene({film,s,p,t,A,B,T,input,c,actor,shape,line,ellipse,label,hatchRect,energyRing,burst,stream,finalFlash,clamp,ease,mix}){
 const INK='#100d10',PAPER='#ded1ad',ACID='#e1ff00',PINK='#ff248f';let a;
 const finish=(first=2,x=480,h=550)=>actor('ending',first+ease(p)*Math.max(0,B-first),x,683,h);
 const sheet=(x,y,w,h,text,angle=0)=>{hatchRect(x,y,w,h,PAPER,angle);label(text,x,y,Math.min(32,w*.15),INK,w*.9);};
 if(film.slug==='erwin-linkedin'){
  const graph=(growth=1)=>{hatchRect(955,400,420,400,PAPER);line([[790,540],[790,260],[1130,540]],INK,3);const pts=[[805,520],[875,480],[940,425],[1010,340],[1120,230]];line(pts.slice(0,Math.max(2,Math.ceil(growth*5))),PINK,12);shape([[1120,230],[1078,252],[1116,282]],PINK,INK,2);label('QUARTERLY GROWTH',955,585,24,INK,380);};
  if(s.id==='reveal'){a=actor('action',p*2,430,682,555);graph(.3);label('YOUR SACRIFICE IS A METRIC.',640,112,41,PAPER,1140);}
  if(s.id==='launch'){const q=ease(p);a=actor('action',2+q*Math.max(0,A-3),mix(400,650,q),681-Math.sin(p*Math.PI)*22,555);graph(q);for(let i=0;i<12;i++){const k=clamp((p-i*.04)/.6);sheet(mix(530,1080,k),550-Math.sin(k*Math.PI)*210-i%3*25,55,78,'ID',k*.4);}stream(t,.5);}
  if(s.id==='impact'){a=actor('action',A,650,682,555);graph();for(let i=0;i<16;i++){const k=ease(p);sheet(900+i%4*55+k*100,550-Math.floor(i/4)*60-k*530,55,78,'ID',k*i*.12);}burst(1070,300,p);label('GROWTH AT ANY COST.',640,112,44,ACID,1140);}
  if(s.id==='return'){graph();a=actor('ending',p*2,480,683,555);}
  if(s.id==='gag'){graph();a=finish(2);hatchRect(1070,285,190,85,ACID,-.08);label('PROMOTED',1070,285,30,INK,175);label('THE GRAPH GOT THE JOB.',640,112,45,ACID,1140);}
 }
 if(film.slug==='gandalf-grey-market'){
  const shutter=(drop=0)=>{for(let i=0;i<17;i++){const y=-380+i*38+drop*690;hatchRect(970,y,420,35,i%2?'#77746e':'#9b9486');}hatchRect(970,-393+drop*690,460,30,INK);};
  if(s.id==='reveal'){a=actor('action',p*2,430,683,560);label('YOU SHALL NOT AUDIT.',640,112,47,PAPER,1140);}
  if(s.id==='launch'){a=actor('action',2+ease(p)*Math.max(0,A-2),450,683,560);for(let i=0;i<16;i++){const k=(p+i*.063)%1,angle=i*2.4+t*2;sheet(510+Math.cos(angle)*(100+k*190),530-k*400,55,90,'?',angle*.12);}energyRing(500,650,60+ease(p)*160,20+ease(p)*35,t,ACID,.7);}
  if(s.id==='impact'){a=actor('action',A,460,683,560);shutter(ease(p));burst(970,650,p);label('INSPECTION DENIED.',640,112,47,ACID,1140);}
  if(s.id==='return'){shutter(1);a=actor('ending',p*2,470,683,560);}
  if(s.id==='gag'){shutter(1);a=finish(2,470,560);hatchRect(865,445,180,110,INK);sheet(865,445,150,70,'CASH ONLY');label('NO LICENCE. NO PROBLEM.',640,112,42,ACID,1140);}
 }
 if(film.slug==='genos-windows-update'){
  const status=text=>{hatchRect(960,290,400,110,INK);label(text,960,290,42,'#6bdbed',370);};
  if(s.id==='reveal'){a=actor('action',p*2,450,683,555);status('UPDATE AVAILABLE');label('INSTALLING ABSOLUTE POWER.',640,112,40,PAPER,1140);}
  if(s.id==='launch'){a=actor('action',2+ease(p)*Math.max(0,A-2),450,683,555);status(p>.6?'99% — PLEASE WAIT':`${Math.floor(ease(p/.6)*99)}% COMPLETE`);for(let i=0;i<3;i++)energyRing(460,405,100+i*25,130+i*30,t+i,'#6bdbed',.5);}
  if(s.id==='impact'){a=actor(input.groups.attack?'attack':'action',input.groups.attack?ease(p)*T:A,470,683,555);c.save();c.globalAlpha=.7;finalFlash(650,395,mix(720,1550,Math.min(1,p*3)),60+Math.sin(p*Math.PI)*90,t);c.restore();for(let i=0;i<12;i++){const k=ease(p);line([[750+i*40,350+i%3*40],[800+i*40+k*110,340+i%3*40]],'#6bdbed',4);}label('RESTART REQUIRED.',640,112,46,ACID,1140);}
  if(s.id==='return'){a=actor('ending',p*2,480,683,555);status('PLEASE WAIT...');}
  if(s.id==='gag'){a=finish(2,480,555);status(p>.5?'WELCOME BACK':'99% COMPLETE');label(p>.5?'ANOTHER UPDATE IS AVAILABLE.':'VICTORY IS STILL INSTALLING.',640,112,40,ACID,1140);}
 }
 if(film.slug==='sully-hr'){
  const blanket=(lift=0)=>{shape([[740,660-lift],[1180,660-lift],[1160,690],[730,690]],'#8ebbb3',INK,5);for(let i=0;i<18;i++)line([[745+i*24,664-lift],[740+i*24,682]],'#456c69',1);};
  if(s.id==='reveal'){a=actor('action',p*2,430,683,550);label('WELLNESS IS MANDATORY.',640,112,44,PAPER,1140);}
  if(s.id==='launch'){a=actor('action',2+ease(p)*Math.max(0,A-2),450,683,550);blanket(ease(p)*180);for(let i=0;i<5;i++)energyRing(650+p*280+i*40,390,20+i*30,90+i*30,t+i,PAPER,.5);}
  if(s.id==='impact'){a=actor('action',A,460,683,550);blanket(190);for(let i=0;i<10;i++){const k=ease(p);sheet(800+i%3*100+k*240,300+Math.floor(i/3)*75-Math.sin(k*Math.PI)*100,145,85,'REVIEW',k*i*.1);}label('TEAM MORALE: ENFORCED.',640,112,42,ACID,1140);}
  if(s.id==='return'){blanket(180);a=actor('ending',p*2,470,683,550);sheet(975,315,360,160,'EMPLOYMENT NOTICE');}
  if(s.id==='gag'){blanket(180);a=finish(2,470,550);sheet(975,315,360,160,'TERMINATED');label('THE SEVERANCE BLANKET STAYS.',640,112,40,ACID,1140);}
 }
 if(film.slug==='olaf-global-warming'){
  const fan=()=>{hatchRect(990,650,190,35,'#5e6970');hatchRect(990,550,32,180,'#6d7d81');ellipse(990,390,125,125,INK);ellipse(990,390,117,117,'#7e9b9d');c.save();c.translate(990,390);c.rotate(t*9);for(let i=0;i<3;i++){c.rotate(Math.PI*2/3);shape([[0,0],[30,-85],[90,-40],[45,10]],'#b3c0b1',INK,3);}c.restore();for(let i=0;i<8;i++){const z=i*Math.PI/4;line([[990-Math.cos(z)*115,390-Math.sin(z)*115],[990+Math.cos(z)*115,390+Math.sin(z)*115]],INK,2);}ellipse(990,390,15,15,INK);};
  if(s.id==='reveal'){a=actor('action',p*2,450,683,485);label('THIS HEATWAVE IS SPONSORED.',640,112,40,PAPER,1140);}
  if(s.id==='launch'){a=actor('action',2+ease(p)*Math.max(0,A-2),450,683,485);for(let i=0;i<42;i++){const k=(p+i*.024)%1;ellipse(550+k*650,220+i*71%400-Math.sin(k*Math.PI)*70,2+i%4,2+i%4,'#d0edf0');}stream(t,.4,'#b8e8e9');}
  if(s.id==='impact'){a=actor('action',A,470,683,485);fan();stream(t,1,'#b8e8e9');for(let i=0;i<8;i++)energyRing(850-i*60-p*180,400,20+i*5,95+i*7,t,'#b8e8e9',.3);label('SPONSORED COLD FRONT.',640,112,43,ACID,1140);}
  if(s.id==='return'){fan();a=actor('ending',p*2,470,683,485);}
  if(s.id==='gag'){fan();a=finish(2,470,485);label('PLEASE DO NOT TURN IT OFF.',640,112,42,ACID,1140);}
 }
 if(film.slug==='dutch-pyramid-scheme'){
  const pyramid=(fall=0)=>{for(let row=0;row<5;row++)for(let col=0;col<5-row;col++){const x=790+col*78+row*39+fall*(col-2)*140,y=645-row*65-Math.sin(fall*Math.PI)*(80+row*45)+fall*120;hatchRect(x,y,75,60,(row+col)%2?'#d0a43c':'#bb8b27',fall*(col-2));label('$',x,y,28,INK,60);}};
  if(s.id==='reveal'){a=actor('action',p*2,430,683,555);label('ONE MORE PAYMENT.',640,112,46,PAPER,1140);}
  if(s.id==='launch'){a=actor('action',2+ease(p)*Math.max(0,A-2),450,683,555);for(let i=0;i<15*p;i++){const row=Math.floor(i/5),col=i%5;sheet(760+col*80-row*15,600-row*90-Math.sin(p*Math.PI)*65,72,95,'FEE',.1*col);}stream(t,.3,'#d0a43c');}
  if(s.id==='impact'){a=actor('action',A,460,683,555);pyramid(ease(p));burst(980,590,p,'#d0a43c');label('COMPOUNDING CONSEQUENCES.',640,112,40,ACID,1140);}
  if(s.id==='return'){a=actor('ending',p*2,470,683,555);for(let i=0;i<5;i++)hatchRect(800+i*65,670,75,30,'#b78b2b',i*.12);}
  if(s.id==='gag'){a=finish(2,470,555);sheet(950,355,340,200,'NEW PAYMENT PLAN',-.06);label('THIS NEXT PLAN IS DIFFERENT.',640,112,40,ACID,1140);}
 }
 if(film.slug==='absent-father'){
  const bill=()=>{sheet(980,390,270,330,'FAMILY BILL',.04);label('PAST DUE',980,470,34,PINK,245);};
  if(s.id==='reveal'){a=actor('action',p*2,450,683,545);label('AN UNMATCHED LEVEL OF POWER.',640,112,39,PAPER,1140);}
  if(s.id==='launch'){a=actor('action',2+ease(p)*Math.max(0,A-2),450,683,545);for(let i=0;i<4;i++)energyRing(450,440,95+i*25,150+i*25,t+i,ACID,.6);stream(t,.6);}
  if(s.id==='impact'){bill();if(p<.27)a=actor('action',A,450,683-ease(p/.27)*1100,545);for(let i=0;i<13;i++)line([[320+i*20,200],[320+i*20,650-p*700]],'#ded1ad99',2);label('FAMILY NOTIFICATION RECEIVED.',640,112,40,ACID,1140);}
  if(s.id==='return'){bill();label('PLEASE HOLD.',640,112,48,PAPER,1140);}
  if(s.id==='gag'){bill();sheet(445,610,250,100,'DEPARTED',-.08);label('THE BILL DID NOT TELEPORT.',640,112,43,ACID,1140);}
 }
 if(film.slug==='anti-anti-meat'){
  const grill=()=>{ellipse(985,530,150,65,INK);ellipse(985,520,142,53,'#864331');for(let i=0;i<13;i++)line([[860+i*21,488],[870+i*21,555]],INK,3);line([[890,550],[860,675]],INK,12);line([[1080,550],[1110,675]],INK,12);for(let i=0;i<4;i++)hatchRect(910+i*49,515,42,25,'#bc713f',i*.3);};
  const salad=(fly=0)=>{const x=920+fly*600,y=400-Math.sin(fly*Math.PI)*200;ellipse(x,y,95,38,'#486c35');for(let i=0;i<10;i++)ellipse(x+Math.sin(i*4)*70,y-20+Math.cos(i*7)*20,20,12,i%2?'#84a848':'#a4bc68');shape([[x-95,y],[x+95,y],[x+66,y+65],[x-60,y+65]],PAPER,INK,4);};
  if(s.id==='reveal'){grill();salad();a=actor('action',p*2,430,683,525);label('THE BARBECUE NEEDS LIBERATION.',640,112,38,PAPER,1140);}
  if(s.id==='launch'){grill();salad();a=actor('action',2+ease(p)*Math.max(0,A-2),mix(400,700,ease(p)),683-Math.sin(p*Math.PI)*55,525);stream(t,.7);}
  if(s.id==='impact'){grill();salad(ease(p));a=actor('action',A,690,683,525);burst(1040,470,p,'#87a953');label('SALAD DEFEATED.',640,112,47,ACID,1140);}
  if(s.id==='return'){grill();a=actor('ending',p*2,490,683,525);}
  if(s.id==='gag'){grill();a=finish(2,490,525);label('ANOTHER MORAL VICTORY.',640,112,43,ACID,1140);}
 }
 if(film.slug==='power-of-friendship'){
  const memory=(x,y,i,scale=1)=>{hatchRect(x,y,180*scale,230*scale,PAPER,i*.025);c.save();c.globalAlpha=.65;actor('action',i%(A+1),x,y+87*scale,185*scale);c.restore();label(['TRAINING','THE PROMISE','LAST EPISODE'][i%3],x,y-85*scale,18*scale,INK,160*scale);};
  if(s.id==='reveal'){a=actor('action',p*2,450,683,540);label('REMEMBER THE PROMISE.',640,112,43,PAPER,1140);}
  if(s.id==='launch'){a=actor('action',2+ease(p)*Math.max(0,A-2),450,683,540);for(let i=0;i<4;i++){const k=clamp((p-i*.12)/.5);if(k>0)memory(700+i%2*240,280+Math.floor(i/2)*250-(1-k)*70,i,.8);}energyRing(450,430,130+ease(p)*40,190,t,ACID,.5);}
  if(s.id==='impact'){a=actor('action',A,470,683,540);for(let i=0;i<9;i++){const k=(p+i*.11)%1;memory(650+k*900,250+i%3*150-Math.sin(k*Math.PI)*90,i,.7);}stream(t,.8);label('FLASHBACK BARRAGE.',640,112,46,ACID,1140);}
  if(s.id==='return'){a=actor('ending',p*2,480,683,540);memory(980,390,2,.9);}
  if(s.id==='gag'){a=finish(2,480,540);memory(980,390,1,.9);label('PREVIOUSLY ON THIS ATTACK...',640,112,42,ACID,1140);}
 }
 if(film.slug==='touch-grass-final-boss'){
  const leaf=(x,y,size,angle=0)=>{c.save();c.translate(x,y);c.rotate(angle);const pts=[[0,-size]];for(let i=1;i<=12;i++){const k=i/12;pts.push([Math.sin(k*Math.PI)*size*.45+(i%2?8:-8),-size+2*size*k]);}for(let i=11;i>=0;i--){const k=i/12;pts.push([-Math.sin(k*Math.PI)*size*.45+(i%2?-8:8),-size+2*size*k]);}shape(pts,'#6c9143',INK,4);line([[0,-size],[0,size*1.14]],'#c1c97a',6);for(let i=0;i<10;i++){const y=-size*.7+i*size*.15;line([[-size*.24,y-size*.12],[0,y],[size*.24,y-size*.12]],INK,1.4);}c.restore();};
  if(s.id==='reveal'){a=actor('action',p*2,440,683,550);label('YOUR SESSION HAS ENDED.',640,112,44,PAPER,1140);}
  if(s.id==='launch'){a=actor('action',2+ease(p)*Math.max(0,A-2),mix(420,560,ease(p)),683,550);leaf(mix(650,900,ease(p)),440,100+ease(p)*130,-.5+p*.4);stream(t,.4,'#a4c576');}
  if(s.id==='impact'){a=actor('action',A,560,683,550);leaf(mix(850,1450,ease(p)),430,250,-.1+ease(p)*.7);for(let i=0;i<10;i++)sheet(900+i%3*80+ease(p)*350,330+i%4*80-Math.sin(p*Math.PI)*100,130,65,'OFFLINE',p*i*.1);label('OFFLINE REHABILITATION.',640,112,43,ACID,1140);}
  if(s.id==='return'){a=actor('ending',p*2,480,683,550);}
  if(s.id==='gag'){a=finish(2,480,550);hatchRect(800,500,60,110,INK,.08);hatchRect(800,495,46,83,p>.25?'#83c2cc':'#4a5558',.08);if(p>.25){ellipse(825,453,12,12,PINK);label('1',825,453,17,INK,18);}label('ONE NOTIFICATION LATER.',640,112,44,ACID,1140);}
 }
 return a;
}
