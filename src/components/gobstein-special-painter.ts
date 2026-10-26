import type {SpecialScene} from './live-scene-painter';
import type {MemeDraw} from './meme-special-painter';
import {gobsteinFrame,GOBSTEIN_TIMING} from '../domain/gobstein-direction';
import {PROP_BY_ID} from '../data/props';

export const GOBSTEIN_ROOM='/assets/specials/gobstein-technical-difficulties-v1.webp';
const INK='#0c1010',PAPER='#e9ddba',GOLD='#d6ad45',RED='#c94a46';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>1-(1-clamp(n))**3;

function panel(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string){c.fillStyle=fill;c.fillRect(x,y,w,h);}
function line(c:CanvasRenderingContext2D,points:number[][],color:string,width:number){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}
function print(c:CanvasRenderingContext2D,text:string,x:number,y:number,size:number,color=PAPER,align:CanvasTextAlign='left'){c.font=`700 ${size}px CityMono, monospace`;c.textAlign=align;c.textBaseline='middle';c.fillStyle=color;c.fillText(text,x,y);}
function cracks(c:CanvasRenderingContext2D,x:number,y:number){
 c.save();c.translate(x,y);c.fillStyle='#393023';c.strokeStyle='#b4a17c';c.lineWidth=9;c.beginPath();
 for(let i=0;i<23;i++){const a=i*Math.PI*2/23,r=.84+(i%4)*.065,px=Math.cos(a)*119*r,py=Math.sin(a)*176*r;i?c.lineTo(px,py):c.moveTo(px,py);}c.closePath();c.fill();c.stroke();
 for(let i=0;i<17;i++){const xx=-87+(i*47)%174,yy=-134+(i*71)%263;line(c,[[xx,yy],[xx+14,yy-11]],i%2?'#5b4e37':'#231f19',2);}
 for(let i=0;i<13;i++){const a=i*Math.PI*2/13,r=150+(i%4)*18;line(c,[[Math.cos(a)*58,Math.sin(a)*94],[Math.cos(a+.08)*r,Math.sin(a+.08)*r],[Math.cos(a-.04)*(r+39),Math.sin(a-.04)*(r+28)]],'#332c22',i%3===0?6:3);}
 for(let i=0;i<7;i++){const x=-120+i*42,y=177+(i%3)*9;line(c,[[x,y],[x+19,y-9],[x+30,y+3]],'#88765a',7);}
 c.restore();
}
function cctv(c:CanvasRenderingContext2D,p:number,reduced:boolean){
 const turn=reduced?0:ease((p-.27)/.15);c.save();c.translate(797,104);line(c,[[0,-93],[0,-36],[25,-22]],'#292e2b',15);c.rotate(-.1+turn*.85);
 panel(c,-22,-34,132,63,INK);panel(c,-17,-29,120,53,'#9e987b');panel(c,-17,13,120,11,'#5e6456');
 for(let i=0;i<16;i++)line(c,[[-13+i*7,-24],[-20+i*7,-9]],'#716e57',1);
 for(const xx of [-9,62]){c.strokeStyle='#33392f';c.lineWidth=2;c.strokeRect(xx,-18,4,4);line(c,[[xx,-16],[xx+4,-16]],'#d8cba3',1);}
 panel(c,75,-27,46,50,INK);panel(c,81,-21,38,38,'#2f3731');panel(c,94,-15,26,26,'#070a0c');panel(c,103,-8,7,9,p<GOBSTEIN_TIMING.cut?RED:GOLD);line(c,[[-12,-25],[68,-25]],'#e6d5a1',3);c.restore();
}
function feedFrame(c:CanvasRenderingContext2D,p:number,reduced:boolean){
 c.strokeStyle='rgba(220,225,193,.32)';c.lineWidth=2;c.strokeRect(26,26,1228,668);
 print(c,'PRIVATE HARBOUR / SERVICE ACCESS',48,54,18);print(c,'CAM 06',1230,54,18,PAPER,'right');
 if(reduced||Math.floor(p*12)%2===0){c.fillStyle=RED;c.beginPath();c.arc(51,86,5,0,Math.PI*2);c.fill();}print(c,'REC',68,87,15);
 print(c,'02:13:09',1230,667,17,PAPER,'right');
 if(!reduced){c.fillStyle='rgba(2,6,6,.065)';for(let y=0;y<720;y+=5)c.fillRect(0,y,1280,1);}
}
function shiftReport(c:CanvasRenderingContext2D,d:MemeDraw,p:number,reduced:boolean,injured:boolean){
 const q=reduced?1:ease((p-GOBSTEIN_TIMING.report)/.045);c.save();c.translate(850,390+30*(1-q));c.rotate(-.035);
 panel(c,-246,-204,492,424,'rgba(0,0,0,.5)');panel(c,-258,-217,492,424,PAPER);c.strokeStyle='#3c3a2f';c.lineWidth=5;c.strokeRect(-258,-217,492,424);
 panel(c,-91,-232,166,36,'#43463c');print(c,'PRIVATE HARBOUR',-224,-160,23,INK);print(c,'NIGHT SECURITY / SHIFT LOG',-224,-124,16,'#555447');
 line(c,[[-222,-94],[196,-94]],'#8c856c',2);print(c,'02:13   CAMERA OFFLINE',-224,-61,16,INK);print(c,'02:13   CAMERA ONLINE',-224,-26,16,INK);line(c,[[-222,5],[196,5]],'#8c856c',2);
 c.strokeStyle=INK;c.lineWidth=3;c.strokeRect(-220,35,30,30);
 if(reduced||p>.9){line(c,[[-215,49],[-205,59],[-184,28]],INK,5);}
 print(c,'UNEVENTFUL',20,39,40,INK,'center');print(c,'SHIFT',20,83,40,INK,'center');print(c,'INCIDENTS REPORTED: 0',-224,137,17,INK);print(c,'SIGNATURE',-224,178,12,'#696557');line(c,[[-114,179],[-88,155],[-73,187],[-56,164],[-37,178],[37,167],[103,177]],INK,2);
 c.restore();
 // The actual target remains visible behind the false report. No fake damage values.
 if(!injured)d.tag('NO DAMAGE / EFFECT RESOLVED',957,677,PAPER,0,510);
}

/** A live scene: the committed combat target and equipped prop are never baked into a movie. */
export function paintGobsteinSpecial(c:CanvasRenderingContext2D,s:SpecialScene,d:MemeDraw){
 const f=gobsteinFrame(s.playback,s.progress,s.reduced);if(!f)return false;
 const p=f.progress,a=s.playback;
 panel(c,0,0,1280,720,INK);
 if(f.blackout){
  // No actors, props, result badges or impact flashes can leak through the outage.
  print(c,'CAM 06',48,54,18,'#747a70');print(c,'TECHNICAL DIFFICULTIES',640,340,34,'#b7beb1','center');print(c,'RECONNECTING...',640,387,15,'#747a70','center');
  if(!s.reduced){panel(c,0,Math.floor(p*307)%720,1280,2,'rgba(130,146,127,.08)');}
  return true;
 }
 const tamper=f.phase==='tamper',aftermath=f.phase==='aftermath'||f.phase==='report';
 const zoom=tamper?1+ease((p-GOBSTEIN_TIMING.tamper)/.16)*.22:1;
 c.save();c.translate(640,360);c.scale(zoom,zoom);c.translate(-640,-360);
 d.image(GOBSTEIN_ROOM,640,360,1280,720);
 if(f.opponentInjured)cracks(c,1060,385);
 const reaction=aftermath&&!s.reduced?ease((p-GOBSTEIN_TIMING.reconnect)/.07):0;
 d.actor(a.targetId,f.opponentKnockedOut?5:f.opponentInjured?4:0,f.opponentInjured?1030:1040,f.opponentInjured?566+reaction*3:638,f.opponentInjured?386:399,f.opponentInjured?8:0,1,true);
 d.actor(a.cardId,tamper?2:0,tamper?451:401,652,tamper?485:475,tamper?-2:0);
 if(f.showProps&&a.propId)d.image(PROP_BY_ID[a.propId].art,472,599,88,undefined,-8);
 cctv(c,p,s.reduced);
 // Quiet gold access indicator conveys the existing protection effect without a bubble.
 if(aftermath){c.fillStyle=GOLD;c.beginPath();c.arc(481,256,6,0,Math.PI*2);c.fill();}
 c.restore();
 feedFrame(c,p,s.reduced);
 if(aftermath){panel(c,35,605,515,64,'rgba(7,11,10,.9)');print(c,'SHIFT STATUS: UNEVENTFUL',55,638,22);}
 if(f.phase==='report')shiftReport(c,d,p,s.reduced,f.opponentInjured);
 return true;
}
