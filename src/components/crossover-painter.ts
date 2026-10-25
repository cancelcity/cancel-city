import type {SpecialScene} from './live-scene-painter';
import type {MemeDraw} from './meme-special-painter';
import {DUO_BY_ID} from '../data/duos';
const INK='#111016',PAPER='#f2e8cb',PINK='#ff269e',ACID='#deff00',BLUE='#31d7ff';
export const CROSSOVER_IDS=['for-your-consideration','exit-strategy','previously-on','second-place-express','ticket-still-open','verify-renewal','psychic-snacks','basement-optimization','proof-of-chill','transportation-damage'] as const;
const clamp=(n:number)=>Math.max(0,Math.min(1,n)),ease=(n:number)=>1-(1-clamp(n))**3;
function box(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,color:string){
 if(w>=36&&h>=22&&w<1100&&!color.startsWith('#000')){c.fillStyle='rgba(11,8,16,.42)';c.fillRect(x+5,y+6,w,h);}
 c.fillStyle=color;c.fillRect(x,y,w,h);
 if(w>=24&&h>=18&&!color.startsWith('#000')){
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
  c.fillStyle='rgba(255,244,210,.20)';c.fillRect(x,y,w,Math.min(5,h*.16));
  c.fillStyle='rgba(17,16,22,.18)';c.fillRect(x,y+h-Math.min(5,h*.16),w,Math.min(5,h*.16));
  c.strokeStyle='rgba(17,16,22,.11)';c.lineWidth=1.5;
  for(let d=-h;d<w+h;d+=18){c.beginPath();c.moveTo(x+d,y);c.lineTo(x+d-h*.55,y+h);c.stroke();}
  c.restore();
 }
 c.strokeStyle=INK;c.lineWidth=5;c.strokeRect(x,y,w,h);
}
function ellipse(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();c.strokeStyle=INK;c.lineWidth=4;c.stroke();}
function windowPanel(c:CanvasRenderingContext2D,d:MemeDraw,x:number,y:number,w:number,h:number,title:string,color=BLUE){box(c,x+8,y+9,w,h,'#0009');box(c,x,y,w,h,PAPER);box(c,x,y,w,32,color);d.text(title,x+w/2,y+16,18,INK,0,w-35);}
function gift(c:CanvasRenderingContext2D,x:number,y:number,q:number){c.save();c.translate(x,y);c.rotate(q*-.7);box(c,-95,-88,190,177,PINK);box(c,-14,-88,28,177,ACID);box(c,-99,-107,198,30,PAPER);ellipse(c,-29,-128,33,18,ACID);ellipse(c,29,-128,33,18,ACID);c.restore();}
function chair(c:CanvasRenderingContext2D,x:number,y:number,q:number){c.save();c.translate(x,y);c.rotate(-q*.55);box(c,-75,-110,150,170,'#6a477d');box(c,-93,38,186,32,PAPER);box(c,-90,-25,30,112,ACID);box(c,60,-25,30,112,ACID);box(c,-65,67,18,52,INK);box(c,47,67,18,52,INK);c.restore();}
function machine(c:CanvasRenderingContext2D,d:MemeDraw,x:number,y:number,q:number){c.save();c.translate(x,y);c.rotate(q);box(c,-114,-159,228,322,PINK);box(c,-92,-138,138,191,'#222536');for(let i=0;i<6;i++){box(c,-75+i%2*57,-114+Math.floor(i/2)*55,40,36,i%2?ACID:BLUE);}box(c,62,-112,32,60,PAPER);box(c,-81,84,163,38,INK);d.text('PSYCHIC SNACKS',0,59,17,PAPER,0,193);c.restore();}
function bottle(c:CanvasRenderingContext2D,x:number,y:number,q:number){c.save();c.translate(x,y);c.rotate(q);box(c,-25,-56,50,111,'#ffd66d');box(c,-16,-79,32,23,PAPER);box(c,-18,-19,36,34,PINK);c.restore();}
export const crossoverBeat=(p:number,reduced=false)=>reduced?'gag':p<.23?'setup':p<.46?'windup':p<.6875?'launch':p<.86?'contact':'gag';
export function paintCrossover(c:CanvasRenderingContext2D,s:SpecialScene,d:MemeDraw){
 const a=s.playback,id=a.duoId;if(!id||!CROSSOVER_IDS.includes(id as never))return false;
 const duo=DUO_BY_ID[id],p=s.reduced?1:clamp(s.progress),beat=crossoverBeat(p,s.reduced),launch=ease((p-.46)/.2275),hit=clamp((p-.6875)/.1725),ending=beat==='gag',pair=duo.pair;
 d.background(p,.57,1.14+p*.12);if(ending)d.rays('#dcd0b8',1001,384,true);
 d.tag(`DUO / ${duo.name.toUpperCase()}`,794,54,ACID,-2,902);
 if(!ending){d.text(beat==='setup'?duo.setup:duo.name.toUpperCase(),845,124,42,PAPER,-3,788);d.actor(pair[0],beat==='setup'?0:beat==='windup'?1:2,287,684,494,-3);d.actor(pair[1],beat==='setup'?0:beat==='windup'?1:2,95,693,340,4);if(beat==='launch'||beat==='contact')d.dossier(a.targetId,1053+hit*60,387-Math.sin(hit*Math.PI)*65,215,-hit*22);}
 switch(id){
  case 'for-your-consideration':{const x=ending?1015:beat==='setup'?855:437+launch*589,y=ending?467:421-Math.sin(launch*Math.PI)*160;gift(c,x,y,launch);if(p>.56&&!ending){box(c,613,562,558*launch,42,'#8f6541');for(let i=0;i<3;i++){d.weapon('stamp',660+i*166,341+hit*40,.9,-7,ACID,'AWARD');}}break;}
  case 'exit-strategy':{windowPanel(c,d,592,193,553,238,'YOU HAVE ESCAPED TO',ACID);d.text('A RELAXATION LOUNGE',868,294,47,INK,0,508);chair(c,ending?1005:558+launch*474,ending?454:463-Math.sin(launch*Math.PI)*141,launch);for(let i=0;i<7;i++)ellipse(c,488+i*103,591-Math.sin(p*7+i)*36,60,39,'#77a47988');break;}
  case 'previously-on':{const n=ending?1:Math.min(17,1+Math.floor(p*31));for(let i=0;i<n;i++){const x=560+i*61%550,y=195+i*47%279;windowPanel(c,d,x,y,246,129,`PREVIOUSLY ${i+1}/17`,i%2?PINK:BLUE);d.text(ending?'SKIP TO FINAL EPISODE':'WE MET 12 SECONDS AGO',x+123,y+83,17,INK,0,216);}if(beat==='launch')d.actor(pair[0],2,400+launch*540,677,380,-5,launch);if(hit)d.weapon('storm',1032,382,1.35,hit*70,BLUE,'FINALE');break;}
  case 'second-place-express':{if(!ending){windowPanel(c,d,634,212,477,188,'FINAL FLASH: ANNOUNCING',BLUE);box(c,676,316,387,29,INK);box(c,682,322,374*Math.min(.99,p),17,ACID);d.text('SPEECH NOT YET COMPLETE',871,448,30,PAPER,-2,546);if(hit){d.actor(pair[1],2,847,691,371,-3);d.weapon('storm',1040,392,1.4,0,PINK,'PUNCH');}}else {d.weapon('stamp',1012,431,1.3,-7,'#bec8d1','2ND');d.tag('THE COUPON HAS LEFT THE BUILDING',861,555,PAPER,2,690);}break;}
  case 'ticket-still-open':{const n=ending?2:Math.min(12,1+Math.floor(p*23));for(let i=0;i<n;i++){const x=534+i*52%509,y=181+i*35%302;windowPanel(c,d,x,y,336,148,i%2?'RESTART THE MANAGER':'ESCALATE THE UPDATE',i%2?ACID:BLUE);d.text('TICKET STILL OPEN',x+168,y+91,24,INK,0,310);}if(beat==='launch'||beat==='contact')d.weapon('screen',498+launch*537,440-Math.sin(launch*Math.PI)*122,1.5,launch*67,PINK,'ESCALATED');break;}
  case 'verify-renewal':{windowPanel(c,d,605,203,545,352,'SELECT ALL TILES CONTAINING A BILL',BLUE);for(let i=0;i<12;i++){const x=631+i%4*122,y=258+Math.floor(i/4)*85;box(c,x,y,113,74,i%3?PAPER:BLUE);d.text(i%3?'9.99':'BILL',x+56,y+38,25,INK,0,104);}if(beat==='launch'||beat==='contact')d.weapon('stamp',435+launch*619,377,1.65,launch*21,ACID,'RENEWED');break;}
  case 'psychic-snacks':{const q=ending?0:launch;for(let i=0;i<6;i++)d.weapon('psychic',616+i*88,273+(i%2)*168,.3+q*.15,i*23,PINK,'SNACK');machine(c,d,ending?998:555+q*460,ending?438:400-Math.sin(q*Math.PI)*135,q*Math.PI);if(hit)d.dust(1046,384,hit,ACID);break;}
  case 'basement-optimization':{const w=ending?309:560-launch*330,h=ending?186:319-launch*177,x=ending?866:596+launch*235,y=ending?368:221+launch*120;box(c,x,y,w,h,'#65533d');box(c,x+15,y+17,w-30,h-36,PAPER);chair(c,x+w*.4+hit*190,y+h*.68-hit*145,hit*1.2);for(let i=0;i<3;i++)d.weapon('paper',x+73+i*52+hit*(i-1)*95,y+88-hit*i*59,.36,hit*i*21,ACID,'RENT');break;}
  case 'proof-of-chill':{box(c,605,209,547,311,'#af8356');for(let i=0;i<6;i++){d.weapon('paper',674+i%3*169,288+Math.floor(i/3)*151,.43,(i-3)*5,PAPER,'SOURCE');}if(p>.39){c.save();c.translate(879,377);c.rotate(p*31);for(let i=0;i<4;i++){c.rotate(Math.PI/2);ellipse(c,0,-99,44,103,i%2?ACID:PAPER);}ellipse(c,0,0,36,36,INK);c.restore();for(let i=0;i<5;i++){box(c,972+launch*117,264+i*50,150*launch,5,BLUE);}}break;}
  case 'transportation-damage':{ellipse(c,856,614,342*Math.max(.2,launch),23,'#e8c05788');for(let i=0;i<7;i++)bottle(c,540+i*87,ending?510:258+launch*(226+i*18),launch*(i-3)*.37);if(beat==='launch')for(let i=0;i<3;i++)d.actor(pair[1],2,443+launch*(350+i*130),677,340,-launch*9,.15+i*.2);if(hit)d.actor(pair[0],5,406,678,427,-14-hit*13);break;}
 }
 if(beat==='contact'){d.dust(1048,385,hit,PINK);d.text(a.preview?'SPECIAL PREVIEW':a.knockout?'CANCELLED':'JOINT CONSEQUENCES',820,596,62,PINK,-4,769);d.tag(a.preview?'NO CARDS / NO HYPE SPENT':d.result(a),829,669,ACID,-2,741);}
 if(ending){d.actor(pair[0],id==='second-place-express'||id==='transportation-damage'?5:3,316,693,472,-3);d.actor(pair[1],3,115,701,307,4);d.text(a.preview?'SPECIAL PREVIEW':a.knockout?'THREAD CLOSED':duo.name.toUpperCase(),855,142,59,PINK,-3,734);d.bubble(duo.gag,805,247,755);d.tag(a.preview?'PREVIEW / NO REWARDS':d.result(a),835,655,ACID,-3,728);}
 return true;
}
