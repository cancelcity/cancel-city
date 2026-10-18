import type {SpecialScene} from './live-scene-painter';
import type {MemeDraw} from './meme-special-painter';
import {SECOND_ROSTER_BY_ID} from '../data/second-roster-batch';
const INK='#111016',PAPER='#f2e8cb',BLUE='#31d7ff',PINK='#ff269e',ACID='#deff00';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(v:number)=>1-(1-clamp(v))**3;
function box(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke=INK){c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=5;c.strokeRect(x,y,w,h);}}
function line(c:CanvasRenderingContext2D,pts:number[][],color:string,width=5){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
function shape(c:CanvasRenderingContext2D,pts:number[][],fill:string,stroke=INK){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=5;c.stroke();}
function oval(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,fill:string,stroke=INK){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=4;c.stroke();}}
function paper(c:CanvasRenderingContext2D,d:MemeDraw,x:number,y:number,w:number,h:number,title:string,angle=0){c.save();c.translate(x,y);c.rotate(angle*Math.PI/180);box(c,-w/2,-h/2,w,h,PAPER);d.text(title,0,0,26,INK,0,w-20);c.restore();}
function fan(c:CanvasRenderingContext2D,x:number,y:number,turn:number){box(c,x-9,y+40,18,90,'#536073');oval(c,x,y,65,65,PAPER);for(let i=0;i<3;i++){const a=turn+i*Math.PI*2/3;line(c,[[x,y],[x+Math.cos(a)*44,y+Math.sin(a)*44]],BLUE,16);}oval(c,x,y,10,10,INK);}
function pyramid(c:CanvasRenderingContext2D,height:number,tilt:number){c.save();c.translate(825,667);c.rotate(tilt);shape(c,[[-235,0],[0,-height],[235,0]],'#eccd50');shape(c,[[0,-height],[35,0],[235,0]],'#bd8836');for(let y=35;y<height;y+=45){const w=(1-y/height)*235;line(c,[[-w,-y],[w,-y]],'#76552f',3);}c.restore();}

// The same intact-sprite runtime as batch one. Props may move independently;
// character limbs never do. Contact remains the committed .6875 boundary.
export function paintSecondRoster(c:CanvasRenderingContext2D,s:SpecialScene,d:MemeDraw):boolean {
 const a=s.playback,r=SECOND_ROSTER_BY_ID[a.cardId];if(!r||a.duoId)return false;
 const p=s.reduced?1:clamp(s.progress),q=ease((p-.48)/.2075),hit=ease((p-.6875)/.15),end=p>=.86;
 const actor=(pose:number,x=320,floor=673,height=480,angle=0)=>d.actor(a.cardId,pose,x,floor,height,angle);
 const target=(x=1030,floor=673,height=300)=>d.actor(a.targetId,hit?3:0,x,floor,height,hit*4);
 d.background(p,.72,1.05);
 switch(a.cardId){
 case 'CC003': {
  // Deduction stays correct; his freshly posted argument loses to a literal L.
  actor(p<.27?0:p<.48?1:end?5:2,305,674,470);target(1060+hit*25);
  box(c,550,183,420,340,'#7d5741',PAPER);for(let i=0;i<3;i++)paper(c,d,635+i*108,260+i%2*108,95,98,['SOURCE','PROOF','CASE'][i],i%2?7:-6);
  line(c,[[635,270],[855,270],[740,366],[635,270]],PINK,6);
  if(p<.48)d.tag('CASE SOLVED.',764,146,ACID,0,420);
  else {d.text('L',665+q*300,304+q*117,110+q*85,PINK,hit*8,270);d.tag(p<.6875?'POSTING THE EVIDENCE…':'THE REPLY WON.',766,147,ACID,0,520);}
  if(hit)d.dust(1040,488,hit,PINK);
  if(end)d.bubble('I WAS RIGHT. THAT WAS NOT ENOUGH.',696,568,670);
  break;
 }
 case 'CC004': {
  actor(p<.24?0:p<.48?1:end?4:2,300,674,470);target(1050+hit*22);
  box(c,524,438,210,162,'#343340',PAPER);box(c,533,451,192,60,BLUE);d.text('CANON PRINTER',629,480,19,INK,0,180);
  oval(c,750,470,65,65,'#514750');box(c,642,413,105,114,'#514750',PAPER);
  if(p<.48){paper(c,d,795,252,340,140,'GENERATE AN IMPOSSIBLE STORY',-3);d.tag('FACT CHECK: OFFLINE',802,361,PINK,0,470);}
  else {const x=745+q*280,y=410-Math.sin(q*Math.PI)*195;paper(c,d,x,y,120+q*130,166+q*110,'CANON',q*12);if(hit)d.dust(1030,477,hit,ACID);}
  if(end)d.tag('THE LIE HAS A PUBLICATION DATE.',785,177,ACID,0,720);
  break;
 }
 case 'CC005': {
  actor(p<.3?0:end?4:2,345,698,555);target(1060+hit*22);
  if(p>.28){const reach=ease((p-.28)/.3);shape(c,[[443,250],[455+reach*670,150],[455+reach*670,600]],'#31d7ff25','');line(c,[[450,240],[1040,310]],BLUE,3);for(let i=0;i<3;i++)box(c,900,195+i*84,260*reach,48,'#111016cc',BLUE);d.text('PROFILE ACQUIRED',1000,329,22,BLUE,0,235);}
  if(p>.48)paper(c,d,765+q*280,498-q*95,220+q*210,75+q*180,'PRIVACY POLICY',-q*9);
  if(hit)d.dust(1035,497,hit,BLUE);
  if(end){for(let i=0;i<5;i++){const x=200+i*68,y=616-i%2*33;oval(c,x,y,28,28,'#c99d58');for(let j=0;j<3;j++)oval(c,x-11+j*10,y-6+j%2*13,3,3,INK);}d.tag('THE EYE ACCEPTED ALL COOKIES.',830,106,ACID,0,700);}
  break;
 }
 case 'CC008': {
  // Pure support. Roar -> termination letter -> severance blanket shield.
  box(c,210,143,315,510,'#65428b',PAPER);box(c,233,173,269,437,'#292439');oval(c,477,423,8,8,ACID);
  const x=340,ally=a.targetId===a.cardId?x:1000;
  if(hit){oval(c,ally,440,185,210,'#31d7ff35',BLUE);paper(c,d,ally,594,360,92,'SEVERANCE COVERAGE');}
  actor(p<.27?0:p<.48?1:hit?4:5,x,685,515);
  if(a.targetId!==a.cardId)d.actor(a.targetId,hit?4:0,1000,673,300);
  if(p<.48)d.bubble('THIS IS CONSTRUCTIVE FEEDBACK!',810,167,620);
  else paper(c,d,747,178+q*170,380,105,'TERMINATED',-3);
  if(end)d.tag('FIRED. STILL COVERING THE SQUAD.',838,119,ACID,0,700);
  break;
 }
 case 'CC009': {
  // Heat lamp -> whole snowman puddle pose -> slip -> squad cooling.
  const pose=p<.24?0:p<.48?1:end?5:2;actor(pose,322,677,470);target(1045+hit*32,674-hit*9);
  box(c,621,295,18,340,'#677077');oval(c,630,286,93,35,'#e7c351');shape(c,[[561,313],[697,313],[780,640],[477,640]],'#ffae5a22','');
  if(p<.48){paper(c,d,847,202,344,119,'SPONSORED HEATWAVE',-3);d.tag('PLEASE REDUCE EMISSIONS.',843,329,PAPER,0,530);}
  if(p>.48){oval(c,570+q*220,663,80+q*210,15+q*15,'#aeeaf3');for(let i=0;i<5;i++)line(c,[[660+i*41,591],[742+i*44,591]],BLUE,4);fan(c,693,462,p*11);}
  if(hit)d.dust(1020,602,hit,BLUE);
  if(end)d.tag('TEAM COOLING. INFLUENCER: PUDDLE.',797,159,ACID,0,730);
  break;
 }
 case 'CC010': {
  // Bridge and cardboard castle. The gust moves scenery, never body pieces.
  box(c,30,160,1220,59,'#393641');box(c,70,219,95,454,'#393641');box(c,1150,219,76,454,'#393641');
  actor(p<.24?0:p<.48?1:end?5:2,312,675-q*77,480);target(1030+hit*35);
  if(p<.6875){box(c,570,365,290,300,'#a87846');shape(c,[[554,367],[650,280],[851,354],[867,397]],'#d2a063');d.text('PENTHOUSE',715,472,29,INK,0,265);}
  if(p>.48)for(let i=0;i<6;i++){const x=575+i*30+q*(135+i*55),y=390+i*32-Math.sin(q*Math.PI)*(60+i*11);shape(c,[[x,y],[x+56,y-15],[x+69,y+23],[x+8,y+33]],'#c2965b');line(c,[[409,260+i*42],[775+q*350,240+i*44]],BLUE,3);}
  if(p<.48)d.tag('UNDER BRIDGE / UPPER CLASS',824,111,PAPER,0,600);
  if(end)d.bubble('THAT WAS THE SECURITY DEPOSIT.',793,265,630);
  break;
 }
 case 'CC011': {
  box(c,645,212,300,372,'#77777f',PAPER);box(c,669,239,251,92,INK,BLUE);d.text(p<.4?'17:59':p<.75?'18:00':'CLOCKED OUT',795,285,p<.75?51:29,ACID,0,232);
  box(c,687,376,219,35,INK);paper(c,d,798,482,175,148,'TIME CARD');target(1050+hit*30);
  const exit=ease((p-.75)/.11);actor(p<.3?0:p<.48?1:p<.75?2:4,310+q*160-exit*850,676,470);
  if(p>.48&&p<.86){line(c,[[515,355],[590+q*455,355]],PAPER,13);line(c,[[515,355],[590+q*455,355]],BLUE,5);}
  if(hit)d.dust(1030,467,hit,PAPER);
  if(end)d.tag('THE CLOCK IS FINISHING THE SHIFT.',810,147,ACID,0,740);
  else if(p<.48)d.tag('DO NOT ASK AFTER 17:59.',842,141,PAPER,0,600);
  break;
 }
 case 'CC017': {
  actor(p<.26?0:p<.48?1:end?4:2,307,683,480);target(1050+hit*30);
  if(p<.48){paper(c,d,827,282,447,166,'THE BIGGEST GIVEAWAY',-3);d.tag('PLEASE PREPARE A STANDING OVATION.',813,154,ACID,0,710);}
  else {const x=678+q*360,y=281+q*120;oval(c,x,y,12,12,'#efd178');d.text('$1',x,y+36,21,PAPER);paper(c,d,674+q*320,490-q*87,270+q*175,135+q*70,'ONE DOLLAR',q*9);if(hit)d.dust(1030,490,hit,BLUE);}
  if(end)d.tag('THE CHEQUE COST MORE THAN THE PRIZE.',798,170,ACID,0,745);
  break;
 }
 case 'CC019': {
  // The soldier acts intact; only harmless dairy projectiles are independent.
  actor(p<.28?0:p<.48?1:p>.94?5:end?4:2,305,683,480);target(1060+hit*25);
  box(c,565,322,150,309,'#879192',PAPER);box(c,601,262,80,58,'#879192',PAPER);for(let row=0;row<5;row++)for(let col=0;col<3;col++)oval(c,591+col*48,355+row*53,9,13,INK);
  if(p<.48)d.tag('MILITARY-GRADE CHEDDAR',867,181,ACID,0,580);
  if(p>.48)for(let i=0;i<11;i++){const t=clamp(q*1.3-i*.025),x=657+t*(320+i*9),y=394+i*15-Math.sin(t*Math.PI)*135;shape(c,[[x,y],[x+28,y-9],[x+21,y+19]],'#f1c751');}
  if(hit)d.dust(1048,486,hit,'#f1c751');
  if(end)d.tag('REFRIGERATE THE VICTORY POSE.',817,150,ACID,0,680);
  break;
 }
 case 'CC021': {
  actor(p<.25?0:p<.48?1:end?4:2,289,681,475);target(1110+hit*15,675-hit*12,260);
  const h=40+ease((p-.26)/.4275)*415;pyramid(c,h,hit*.37);
  if(p<.48){d.bubble('I HAVE ANOTHER PLAN.',705,153,530);paper(c,d,417,448,152,170,'PLAN',-9);}
  if(p>.4)for(let i=0;i<4;i++){const t=clamp((p-.4)*4-i*.1);if(t>0)paper(c,d,471+t*200,494-t*(120+i*33),105,63,'PAYMENT',-t*14);}
  if(hit)d.dust(1070,543,hit,ACID);
  if(end)d.tag('TAHITI IS STILL A SUBSCRIPTION.',800,150,ACID,0,720);
  break;
 }
 }
 if(end){d.text(r.name.toUpperCase(),344,73,35,PAPER,0,590);d.tag(a.preview?'FREE PREVIEW / NO REWARDS':d.result(a),901,694,ACID,0,570);}
 else d.text(r.attack,642,53,29,PAPER,0,1130);
 return true;
}
