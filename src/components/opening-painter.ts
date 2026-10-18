import type {MemeDraw} from './meme-special-painter';
import type {PullScene} from './live-scene-painter';
import {openingFor} from '../data/openings';
import {CARD_BY_ID,rarityOf} from '../data/cards';
const INK='#111016',PAPER='#f2e8cb',PINK='#ff269e',ACID='#deff00',BLUE='#31d7ff';
const clamp=(n:number)=>Math.max(0,Math.min(1,n)),ease=(n:number)=>1-(1-clamp(n))**3;
function box(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){c.fillStyle=color;c.fillRect(x,y,w,h);c.strokeStyle=INK;c.lineWidth=5;c.strokeRect(x,y,w,h);}
function oval(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();c.strokeStyle=INK;c.lineWidth=4;c.stroke();}
export const openingBeat=(p:number,reduced=false)=>reduced?'result':p<.24?'setup':p<.62?'delivery':p<.83?'reveal':'result';
export function paintOpening(c:CanvasRenderingContext2D,s:PullScene,d:MemeDraw){
 const p=s.reduced?1:clamp(s.progress),scene=openingFor(s.cardId,s.copies,s.isNew,s.openingId),beat=openingBeat(p,s.reduced),q=ease((p-.24)/.38),ending=beat==='result',card=CARD_BY_ID[s.cardId],color=rarityOf(card.rarity).color;
 d.background(p,.57,1.13+p*.08);if(ending)d.rays('#dcd0b8',940,372,true);
 d.tag(`CANCEL CITY / ${scene.name.toUpperCase()}`,713,56,ACID,-2,1054);
 let actorX=360,actorFloor=676,actorHeight=430,pose=ending?3:p>.62?2:p>.24?1:0,cardX=954,cardY=393,cardAngle=0;
 switch(scene.id){
  case 'auction':box(c,155,481,365,180,'#79563c');d.actor('CC007',1,284,496,310);d.weapon('hammer',676,245+q*146,1.2,q*-45,color,'SOLD');d.text('ONE COIN. HALF A SANDWICH.',840,577,42,PAPER,-3,720);actorX=685;actorHeight=359;break;
  case 'receipt':box(c,546,203,361,112,'#5d536b');box(c,584,289,287,61,INK);box(c,587,340,280,Math.max(1,q*323),PAPER);for(let i=0;i<6;i++)d.text(i===5?'RESIDENT ENCLOSED':'AUDACITY ........ 99',727,371+i*43,19,INK,0,247);cardX=993;cardY=244+q*221;break;
  case 'hologram':oval(c,450,647,218,34,BLUE);actorX=448;actorHeight=ending?430:p<.42?180+q*195:p<.62?660-100*q:430;for(let i=0;i<8;i++)box(c,243,266+i*42,410,2,BLUE);d.tag('CALIBRATING AN EXTREMELY STRANGE PERSON',852,580,PAPER,3,660);break;
  case 'vending':box(c,423,183,405,458,PINK);box(c,462,221,240,251,INK);for(let i=0;i<6;i++)box(c,484+i%3*72,245+Math.floor(i/3)*105,55,67,i%2?ACID:BLUE);box(c,752,255,43,115,PAPER);box(c,467,529,257,54,INK);cardX=690+q*270;cardY=477-q*98;actorX=ending?313:297;d.text('PLEASE DO NOT SHAKE THE MUNICIPALITY',916,626,30,PAPER,-2,646);break;
  case 'border':box(c,429,441,576,162,'#9b7747');d.actor('CC007',0,553,450,283);d.weapon('stamp',816,231+q*228,1.4,q*13,PINK,'APPROVED');actorX=315;cardX=1042;cardY=368;break;
  case 'weather':box(c,510,183,625,327,BLUE);d.text('FORECAST: COMMON WITH A CHANCE OF CHAOS',823,233,26,INK,0,584);for(let i=0;i<6;i++)d.weapon('storm',654+i*87,314+Math.sin(i+p*5)*48,.4,i*12,ACID,'?');cardX=955;cardY=-90+q*480;actorX=296;break;
  case 'museum':box(c,764,177,368,453,'#b58a41');box(c,786,199,324,409,PAPER);cardX=949;cardY=389;d.dossier(s.cardId,cardX,cardY,205,0);if(p<.62)box(c,763,176,369*(1-q),454,'#803056');d.actor('CC007',1,582,673,378);actorX=307;d.tag('AN IMPORTANT CULTURAL MISTAKE',875,648,PAPER,-2,635);break;
  case 'inflatable':actorX=450;actorHeight=ending?430:130+q*470-Math.sin(q*Math.PI)*59;oval(c,469,674,204,24,PINK);d.text('INFLATING DIGNITY',935,570,46,PAPER,-3,601);break;
  case 'elevator':box(c,425,160,448,487,'#7c7789');box(c,451,183,397,442,INK);if(p<.49)d.actor('CC007',0,647,629,355);else d.actor(s.cardId,0,647,629,370);if(p<.62){box(c,451,183,197*(1-q),442,'#b8b4b8');box(c,848-197*(1-q),183,197*(1-q),442,'#b8b4b8');}d.text(p<.49?'WRONG FLOOR':'YOUR BAD COMPANY',1004,583,35,PAPER,-3,457);actorX=ending?324:-999;break;
  case 'carpet':box(c,184,603,Math.max(1,901*q),66,'#ad1d5b');oval(c,180+q*907,640,22,46,PINK);actorX=ending?365:370+q*675;cardX=ending?958:1138-q*257;d.text('PHOTOGRAPHERS: STILL OVER THERE',826,578,29,PAPER,-2,741);break;
  case 'stamps':for(let i=0;i<6;i++){box(c,622+i*16,266+i*31,370,149,PAPER);if(q>i/7)d.weapon('stamp',873+i*6,302+i*34,.5,i*11,PINK,'APPROVED');}d.actor('CC007',2,480,668,352);cardX=1040;actorX=250;break;
  case 'teleprompter':box(c,652,174,476,357,INK);d.text('GRAND ENTRANCE SCRIPT',890,237,35,ACID,0,428);d.text(p<.62?'I AM HERE TO ANNOUNCE…':'[SCRIPT HAS ENDED]',890,338,39,PAPER,0,428);d.text('PLEASE IMPROVISE A PERSONALITY',890,447,24,PINK,0,428);actorX=344;pose=p>.62?5:1;cardY=ending?415:391;break;
  case 'truck':box(c,208+q*457,559,108,77,PINK);box(c,273+q*457,536,63,100,ACID);oval(c,232+q*457,640,23,23,INK);oval(c,307+q*457,640,23,23,INK);cardX=534+q*403;cardY=430;cardAngle=Math.sin(p*17)*7;d.tag('LOAD LIMIT: IGNORED',942,632,ACID,-3,524);actorX=299;break;
  case 'security':box(c,69,143,1140,524,INK);d.actor(s.cardId,p<.62?1:5,449+q*247,657,415,-6);for(let i=0;i<18;i++)box(c,81,159+i*27,1115,1,'#78928d66');d.text('CITY GATE / CAMERA 07',841,185,23,PAPER,0,678);d.tag(p<.62?'RESIDENT DETECTED':'FREEZE FRAME: ENTIRE PERSONALITY',834,591,ACID,2,701);actorX=ending?287:-999;break;
  case 'fireworks':for(let i=0;i<6;i++)d.dust(387+i*129,210+i%2*87,clamp(q-i*.07),i%2?PINK:ACID);box(c,1110,158,118,213,'#372435');d.actor('CC007',5,628,678,347);d.text('THE CLEANER REQUESTS A SMALLER ENTRANCE',793,594,29,PAPER,-3,765);actorX=322;break;
  case 'laundry':box(c,472,218,383,390,PAPER);oval(c,663,430,145,145,INK);oval(c,663,430,120,120,BLUE);c.save();c.translate(661,429);c.rotate(p<.62?p*22:0);d.dossier(s.cardId,0,0,165,0);c.restore();box(c,545,643,38,43,PINK);box(c,545,681,78,21,PINK);actorX=ending?329:655-q*274;actorFloor=ending?676:645;cardX=1000;break;
  case 'spinner':c.save();c.translate(824,363);c.rotate(p*21);for(let i=0;i<3;i++){c.rotate(Math.PI*2/3);oval(c,0,-73-q*93,55+q*32,55+q*32,i%2?PINK:BLUE);}oval(c,0,0,36,36,ACID);c.restore();cardX=ending?960:822;cardY=ending?405:379;actorX=327;break;
  case 'claw':box(c,531,151,623,488,'#242637');box(c,547,170,590,451,'#87c5d333');const x=818+Math.sin(p*12)*(1-q)*134,y=193+q*139;c.beginPath();c.moveTo(x,163);c.lineTo(x,y);c.strokeStyle=PAPER;c.lineWidth=7;c.stroke();c.strokeStyle=ACID;c.lineWidth=9;for(const dir of [-1,0,1]){c.beginPath();c.moveTo(x,y);c.lineTo(x+dir*52,y+43);c.lineTo(x+dir*34,y+70);c.stroke();}cardX=x;cardY=349+q*98;cardAngle=Math.sin(p*19)*(1-q)*13;actorX=293;break;
  case 'scanner':box(c,614,171,464,459,INK);cardX=850;cardY=400;d.dossier(s.cardId,cardX,cardY,250,0);if(p<.62)box(c,640,187+q*416,413,Math.max(0,419-q*416),INK);box(c,628,193+q*403,432,5,BLUE);d.text('INK → COLOR → CONSEQUENCES',873,669,23,PAPER,0,556);actorX=314;break;
  case 'sponsor':windowFrame();actorX=355;pose=p>.62?5:3;d.text('ONE MORE OUTRO',919,280,61,INK,0,567);d.text('THE RESIDENT HAS A PROMOTIONAL OUTRO',919,375,25,INK,0,562);d.text('THE OUTRO ALSO HAS AN OUTRO',919,444,25,PINK,0,562);cardX=995;cardY=ending?448:575;break;
 }
 function windowFrame(){box(c,624,177,587,344,PAPER);box(c,624,177,587,37,PINK);d.text('MANDATORY SELF PROMOTION',918,196,23,INK,0,551);}
 if(actorX>-500)d.actor(s.cardId,pose,actorX,actorFloor,actorHeight,-3);
 if(!['laundry','scanner','museum'].includes(scene.id)||ending)d.dossier(s.cardId,cardX,cardY,ending?235:205,cardAngle);
 if(ending){d.text(s.preview?'OPENING PREVIEW':s.isNew?'NEW RESIDENT':'DUPLICATE RESIDENT',844,138,61,PINK,-3,771);d.bubble(scene.gag,810,242,743);d.tag(s.preview?'NO PACK OPENED / NO REWARDS':`${rarityOf(card.rarity).name.toUpperCase()} / ${card.name.toUpperCase()} / ${s.copies} REGULAR`,812,580,ACID,-2,766);}else d.tag(s.preview?'SCENE PREVIEW / NO PACK OPENED':beat.toUpperCase()+' / THE RESULT IS ALREADY YOURS',640,684,PAPER,2,892);
}
