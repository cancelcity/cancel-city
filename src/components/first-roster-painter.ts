import type {SpecialScene} from './live-scene-painter';
import type {MemeDraw} from './meme-special-painter';
import {FIRST_ROSTER_BY_ID} from '../data/first-roster-batch';
const INK='#111016',PAPER='#f2e8cb',BLUE='#31d7ff',PINK='#ff269e',ACID='#deff00';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>1-(1-clamp(n))**3;
function box(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string,stroke=INK){c.fillStyle=color;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=5;c.strokeRect(x,y,w,h);}}
function line(c:CanvasRenderingContext2D,points:number[][],color:string,width=5){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
function oval(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();c.strokeStyle=INK;c.lineWidth=4;c.stroke();}
function sheet(c:CanvasRenderingContext2D,d:MemeDraw,x:number,y:number,w:number,h:number,label:string,angle=0){c.save();c.translate(x,y);c.rotate(angle*Math.PI/180);box(c,-w/2,-h/2,w,h,PAPER);d.text(label,0,0,22,INK,0,w-20);c.restore();}
function noodle(c:CanvasRenderingContext2D,x:number,y:number,size:number,phase:number){c.beginPath();for(let i=0;i<125;i++){const t=i*.23,xx=x+Math.sin(t)*size*(.65+.28*Math.cos(t*.19)),yy=y+Math.cos(t*1.07)*size*.62; if(i)c.lineTo(xx,yy);else c.moveTo(xx,yy);}c.strokeStyle=INK;c.lineWidth=17;c.stroke();c.strokeStyle='#efc66b';c.lineWidth=10;c.stroke();line(c,[[x-size*.8,y-size*.6],[x-size*.9+phase*15,y-size]],'#efc66b',10);}
function fridge(c:CanvasRenderingContext2D,d:MemeDraw){box(c,492,481,360,183,PAPER);box(c,481,463,382,40,BLUE);box(c,497,470,350,23,'#e5eced');d.text('COLD STORAGE',672,550,25,INK,0,315);d.tag('−18°C / DO NOT DISTURB',672,620,BLUE,0,330);}
function fryer(c:CanvasRenderingContext2D,d:MemeDraw,x:number,y:number,open:number,index:number){box(c,x-67,y-130,134,173,'#30303c',PAPER);oval(c,x,y-135,43,24,'#30303c');line(c,[[x-48,y-138],[x-75,y-169]],PAPER,9);line(c,[[x+48,y-138],[x+75,y-169]],PAPER,9);box(c,x-50,y-91,100,32,ACID);d.text(open?'READY':'PREHEAT',x,y-75,13,INK,0,94);box(c,x-54+open*19,y-34+open*21,108,71,'#685346',PAPER);d.text(String(index+1),x,y+8,22,PAPER);}

// Only intact pose sprites are transformed. No body-part hierarchy or physics.
// Actual combat commits stay in CinematicClock; the visual contact is .6875.
export function paintFirstRoster(c:CanvasRenderingContext2D,s:SpecialScene,d:MemeDraw):boolean {
 const a=s.playback,r=FIRST_ROSTER_BY_ID[a.cardId];
 if(!r||a.duoId)return false; // Preserve the existing paired cinematics.
 const p=s.reduced?1:clamp(s.progress),hit=clamp((p-.6875)/.15),launch=ease((p-.48)/.2075),end=p>=.86;
 const target=(x=1005,floor=665,height=300)=>d.actor(a.targetId,hit>0?5:0,x,floor,height,hit*5);
 d.background(p,.58,1.07);
 switch(a.cardId){
 case 'CC001': {
  // Wind-up -> wrong exit -> return -> scoreboard. Continuous full-body dash.
  box(c,75,566,1130,90,'#28354a');line(c,[[105,609],[1160,609]],BLUE,4);
  d.tag('MID LANE →',1060,208,BLUE,0,300);
  if(p<.48){d.actor(a.cardId,p<.18?0:1,335,668,470);target();d.tag(p<.2?'0 / 9 / READY TO COOK':'THE PERFECT DASH',665,130,ACID);}
  else if(p<.62){const q=(p-.48)/.14;d.actor(a.cardId,2,335-ease(q)*640,668,470);for(let i=0;i<7;i++)line(c,[[335-q*640+i*42,405+i*15],[600-q*640+i*42,405+i*15]],BLUE,4);target();d.tag('OTHER WAY.',790,210,PINK);}
  else {const q=ease((p-.62)/.0675);d.actor(a.cardId,hit>0?5:2,-180+q*600,668,470);target(1005+hit*50);d.dust(995,465,hit,BLUE);if(end)sheet(c,d,865,285,420,130,'TEAM REPORT: 0 / 10');}
  break;
 }
 case 'CC002': {
  // A slow handwritten ban removes the *scene's* channels, never real UI.
  d.actor(a.cardId,p<.4?1:end?5:2,310,668,490);target(1110);
  for(let i=0;i<3;i++){const gone=p>.6875+i*.05;box(c,590,160+i*114,420,86,gone?INK:PAPER,gone?PINK:INK);d.text(gone?'CHANNEL DELETED':['#opponent','#general','#tech-support'][i],800,202+i*114,25,gone?PINK:INK);}
  d.tag(p<.48?'BAN NOTE':p<.6875?'WRITING…':'USERNAME SAVED',370,555,PAPER,0,330);
  if(end)d.bubble('WHO CAN FIX THE SERVER NOW?',347,168,560);
  break;
 }
 case 'CC006': {
  // Captain call, employee response, ascending chart charge, certificates.
  d.actor(a.cardId,p<.28?1:end?4:2,275+launch*100,660,475);
  for(let i=0;i<3;i++){const h=55+ease((p-.33-i*.04)/.31)*(105+i*78);box(c,600+i*135,625-h,100,h,['#b99bff',BLUE,ACID][i]);if(i<2)d.actor(i===0?'CC007':'CC008',p<.33?0:4,650+i*135,625-h,170);}
  target(1110+hit*25,665-hit*25,270);
  line(c,[[580,625],[1160,625]],PAPER);d.text('QUARTERLY MORALE',885,153,35,PAPER,0,560);
  if(p<.3)d.bubble('DEDICATE YOUR QUARTERLY RESULTS!',730,278,600);
  if(hit>0){d.dust(880,390,hit,ACID);sheet(c,d,844,345,355,94,'MORALE CERTIFICATE',-3);}
  if(end)d.tag('THE GRAPH GOT PROMOTED.',875,530,ACID,0,650);
  break;
 }
 case 'CC007': {
  // Whole-body slip; independent plates, caught before healing the ally.
  const q=ease((p-.33)/.3);d.actor(a.cardId,p<.2?0:p<.48?5:p<.6875?2:4,330+q*95,674,460,p<.6875?Math.sin(q*Math.PI)*-13:0);
  box(c,665,568,460,46,'#9b6351');line(c,[[700,615],[690,700]],PAPER);line(c,[[1080,615],[1090,700]],PAPER);
  for(let i=0;i<3;i++){const xx=400+i*75+launch*(385-i*18),yy=465-Math.sin(launch*Math.PI)*(155+i*35)+launch*88;oval(c,xx,yy,43,12,PAPER);oval(c,xx,yy-9,25,13,['#e6ac56','#70b17c','#f49884'][i]);}
  if(a.targetId!==a.cardId)d.actor(a.targetId,hit>0?4:0,1020,665,310);
  if(hit>0){d.tag('MEALS DELIVERED / ALLIES RESTORED',865,270,ACID,0,640);d.dust(880,500,hit,ACID);}
  if(end)sheet(c,d,700,375,360,95,'TIP: ONE UNPAID INVOICE',-4);
  break;
 }
 case 'CC012': {
  // Deliberately holds dead still in the shut freezer, rather than attacking.
  if(p<.4){d.actor(a.cardId,p<.18?0:1,440,670,440);d.bubble('BEHOLD MY FINAL FORM.',790,154,560);}
  else if(p<.58){d.actor(a.cardId,2,620,670,440);}
  else {if(!end)fridge(c,d);else d.actor(a.cardId,4,520,677,440);if(hit>0&&!end){c.strokeStyle=BLUE;c.lineWidth=8;c.strokeRect(470,451,402,226);}if(a.targetId!==a.cardId)d.actor(a.targetId,4,1040,675,325);d.tag(p<.86?'PLEASE HOLD.':'FINAL FORM: LUNCH BREAK',670,201,BLUE,0,620);}
  break;
 }
 case 'CC013': {
  // A paper copy, not a second dismembered actor; scan fails backwards.
  d.actor(a.cardId,p<.48?1:end?5:2,297,675,470);target(1040);
  box(c,520,460,290,200,'#565560',PAPER);box(c,548,426,235,40,BLUE);
  d.text('COPY',665,570,35,PAPER);
  if(p>.32){const y=465-ease((p-.32)/.35)*207;sheet(c,d,664,y,210,260,'',0);c.save();c.beginPath();c.rect(568,y-119,191,228);c.clip();d.actor(a.targetId,2,670-launch*130,y+111,235,0,.55,true);c.restore();line(c,[[562,y+4],[768,y+4]],PINK,6);}
  if(hit>0){sheet(c,d,1010,399,365,124,'UNLICENSED COPY',-8);d.dust(1025,477,hit,PAPER);}
  if(end)d.tag('CLONE ATTACKED BACKWARDS.',835,180,ACID,0,660);
  break;
 }
 case 'CC014': {
  // Hold on the tasting, then a noodle knot expands around the target.
  d.actor(a.cardId,p<.3?0:p<.6875?1:4,325,672,470);target(1018);
  oval(c,580,550,88,24,PAPER);noodle(c,580,500,p<.6875?55:75,launch);
  if(p<.48)d.tag('THE CHEF IS THINKING.',785,182,PAPER,0,600);
  if(p>.48){noodle(c,580+launch*437,460,65+launch*86,launch);if(hit>0)d.dust(1030,510,hit,'#efc66b');}
  if(end)d.bubble('I WOULD STILL SEND IT BACK.',670,207,700);
  break;
 }
 case 'CC016': {
  // Promise a spell, reveal slides; the slides protect instead of hit.
  d.actor(a.cardId,p<.48?1:4,310,675,465);box(c,615,135,540,370,PAPER);box(c,615,135,540,43,PINK);
  d.text(p<.48?'ULTIMATE BLOOD SPELL':'MANDATORY PRESENTATION',885,157,21,INK,0,500);
  if(p<.48){d.text('WITNESS MY POWER!',885,318,42,PINK,0,480);d.weapon('screen',865,510,.6,-4,PINK,'LOADING');}
  else {oval(c,855,330,90,90,PINK);c.fillStyle=ACID;c.beginPath();c.moveTo(855,330);c.arc(855,330,90,0,Math.PI*.68);c.closePath();c.fill();d.text('???',855,330,34,INK);d.text('SLIDE 97 OF 97',889,465,21,INK);}
  if(hit>0){for(let i=0;i<4;i++)sheet(c,d,735+i*100,620-i%2*29,130,100,'APPROVED',i%2?7:-7);if(a.targetId!==a.cardId)d.actor(a.targetId,4,1080,671,295);d.tag('SQUAD SHIELDED BY PAPER.',855,80,ACID,0,650);}
  break;
 }
 case 'CC018': {
  // The location changes around the target; a shutter is the contact gag.
  d.actor(a.cardId,p<.4?1:end?4:2,300,678,480);target(1000);
  box(c,590,110,585,550,p<.4?'#57515a':'#171b32',PAPER);
  if(p<.4){line(c,[[630,110],[630,660]],PAPER,7);d.text('AUDIT OFFICE',883,176,36,PAPER);d.bubble('YOU SHALL NOT AUDIT.',695,306,570);}
  else {oval(c,890,391,220,245,'#644596');d.text('GREY-MARKET MAGIC',885,165,32,ACID,0,540);target(1000+hit*25);d.tag('STAFF SOLD SEPARATELY',864,597,PAPER,0,480);const h=ease((p-.55)/.1375)*413;box(c,610,205,543,h,'#87808a');for(let y=216;y<205+h;y+=24)line(c,[[618,y],[1145,y]],INK,2);}
  if(end)d.tag('CUSTOMS: COME BACK TOMORROW.',815,90,ACID,0,730);
  break;
 }
 case 'CC023': {
  // Thread extraction gradually dismantles the carpet into referral paths.
  d.actor(a.cardId,p<.48?1:end?4:2,280,674,440);target(1025+hit*75,665-hit*50);
  const length=750*(1-launch);box(c,400,572,length,90,PINK);box(c,420,584,Math.max(0,length-40),61,'#7d3754');
  oval(c,440,332,34,34,'#ffda6a');oval(c,440,332,18,18,INK);
  for(let i=0;i<6;i++){line(c,[[440,363],[440+launch*(140+i*94),405+i*34],[1030+hit*60,617+i*7]],i%2?PINK:ACID,4);if(launch>.4)oval(c,640+i*73,405+i*34,12,12,ACID);}
  if(p<.48)d.bubble('ONE RING. INFINITE REFERRALS.',773,162,620);
  if(hit>0)d.dust(1020,544,hit,PINK);
  if(end)d.tag('THE ROADMAP WAS MADE OF THREAD.',787,185,ACID,0,730);
  break;
 }
 case 'CC058': {
  // Dramatic whole-pose transformation halts at 99; repair is a squad buff.
  d.actor(a.cardId,p<.2?0:p<.6875?1:4,349,678,490);
  box(c,640,211,534,238,PAPER);d.text(p<.6875?'DO NOT TURN OFF THE HERO':'RESTART COMPLETE',907,251,26,INK,0,484);
  box(c,680,307,453,46,INK);box(c,685,312,443*(p<.2?ease(p/.2):p<.6875?.99:1),36,BLUE,'');d.text(p<.6875?'99%':'100%',907,397,54,INK);
  if(p>.35&&p<.6875)d.tag('THE LAST 1% HAS ITS OWN UPDATE.',869,147,PINK,0,670);
  if(hit>0){if(a.targetId!==a.cardId)d.actor(a.targetId,4,1065,681,275);for(let i=0;i<3;i++){const x=685+i*142;line(c,[[x,545],[x,600]],ACID,10);line(c,[[x-26,574],[x+26,574]],ACID,10);}d.tag('SQUAD REPAIRED / DEBUFFS CLEANSED',874,491,ACID,0,700);}
  if(p>.94)d.bubble('…DING.',552,190,260);
  break;
 }
 case 'CC135': {
  // Three appliances politely delay the queen; one giant crisped prop.
  d.actor(a.cardId,p<.45?1:end?4:2,270,675,460);target(1110+hit*40,673,285);
  for(let i=0;i<3;i++)fryer(c,d,580+i*171,584,p>=.6875?1:0,i);
  if(p<.3)d.bubble('DRACARYS!',705,155,380);
  else if(p<.6875)d.tag('PLEASE WAIT FOR THE PREHEAT.',813,195,PAPER,0,650);
  if(p>.48){const x=751+launch*333,y=428-Math.sin(launch*Math.PI)*165;oval(c,x,y,70,50,'#d7893b');for(let i=0;i<4;i++)line(c,[[x-45+i*26,y-31],[x-36+i*26,y+27]],'#653620',4);if(hit>0)d.dust(1090,434,hit,'#d7893b');}
  if(end)d.tag('CHECK INTERNAL TEMPERATURE.',785,191,ACID,0,690);
  break;
 }
 }
 if(end){d.text(r.name.toUpperCase(),355,81,37,PAPER,0,580);d.tag(a.preview?'FREE PREVIEW / NO REWARDS':d.result(a),875,689,ACID,0,650);}
 else d.text(r.attack,642,49,28,PAPER,0,1090);
 return true;
}
