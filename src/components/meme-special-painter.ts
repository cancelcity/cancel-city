import type {SpecialScene} from './live-scene-painter';
import {CARD_BY_ID} from '../data/cards';
import {MEME_SPECIALS,memeSpecialId,memeShot,memeVerdict} from '../domain/meme-presentation';
import type {WeaponFamily} from '../data/live-direction';
import {paintExpansionSpecial} from './expansion-special-painter';
import {paintMegaSpecial} from './mega-special-painter';
import {paintCrossover} from './crossover-painter';

export interface MemeDraw {
 background:(p:number,dark?:number,zoom?:number)=>void;
 actor:(id:string,pose:number,x:number,floor?:number,height?:number,angle?:number,opacity?:number,mirror?:boolean)=>void;
 dossier:(id:string,x:number,y:number,w?:number,angle?:number)=>void;
 weapon:(family:WeaponFamily,x:number,y:number,scale:number,angle:number,accent:string,word:string)=>void;
 text:(s:string,x:number,y:number,size?:number,color?:string,angle?:number,max?:number)=>void;
 tag:(s:string,x:number,y:number,color?:string,angle?:number,max?:number)=>void;
 bubble:(s:string,x:number,y:number,w?:number)=>void;
 rays:(color:string,x?:number,y?:number,light?:boolean)=>void;
 dust:(x:number,y:number,p:number,color?:string)=>void;
 receipt:(p:number,time:number)=>void;
 wrap:(x:number,y:number,p:number)=>void;
 image:(src:string,x:number,y:number,w:number,h?:number,angle?:number)=>void;
 result:(s:SpecialScene['playback'])=>string;
}
const INK='#111016',PAPER='#f2e8cb',PINK='#ff269e',ACID='#deff00',BLUE='#31d7ff';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));const ease=(n:number)=>1-(1-clamp(n))**3;
function rect(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke=INK,lw=4){c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.strokeRect(x,y,w,h);}}
function line(c:CanvasRenderingContext2D,pts:number[][],color:string,width=4){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.lineWidth=width;c.strokeStyle=color;c.stroke();}
function panel(c:CanvasRenderingContext2D,d:MemeDraw,x:number,y:number,w:number,h:number,title:string,color=BLUE,angle=0){c.save();c.translate(x,y);c.rotate(angle*Math.PI/180);rect(c,7,9,w,h,'#08080999','');rect(c,0,0,w,h,PAPER);rect(c,0,0,w,35,color);d.text(title,w/2-14,18,17,INK,0,w-55);d.text('×',w-18,17,26,INK);c.restore();}
function chat(c:CanvasRenderingContext2D,d:MemeDraw,lines:readonly string[],x=645,y=452,w=584){rect(c,x,y,w,157,INK,PAPER,3);d.tag('NPC COMMENT SECTION',x+w/2,y+1,ACID,-2,w-30);lines.forEach((s,i)=>d.text(s,x+w/2,y+49+i*35,19,i%2?PAPER:BLUE,0,w-28));}
function result(d:MemeDraw,s:SpecialScene,x=834,y=660){d.tag(s.playback.preview?'PREVIEW / NO REWARDS':d.result(s.playback),x,y,ACID,-2,720);}
function cord(c:CanvasRenderingContext2D,x:number,y:number,p:number){c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-260*p,y-170*p,x-530*p,y+50*p,x-780*p,y+130*p);c.lineWidth=8;c.strokeStyle=INK;c.stroke();c.lineWidth=4;c.strokeStyle=PAPER;c.stroke();}
function gamer(c:CanvasRenderingContext2D,d:MemeDraw,s:SpecialScene,shot:string){const p=s.reduced?1:clamp(s.progress),a=s.playback;
 if(shot==='charge'){d.background(p,.55,1.13+p*.5);d.actor(a.cardId,p>.13?1:0,330,678,565,-3);panel(c,d,640,144,550,351,'RANKED.EXE / FINAL ATTEMPT',BLUE,-3);d.text('ULTIMATE GAMER AURA',910,235,47,PINK,-3,490);rect(c,678,304,460,55,INK);rect(c,684,310,448*ease(p/.39),43,BLUE,'');d.text('13 LOSSES. ONE FINAL EXCUSE.',902,410,26,INK,0,490);d.tag('HE IS ABOUT TO COOK',854,92,ACID,3,580);d.weapon('controller',850,545,.77,0,BLUE,'LAG');}
 else if(shot==='disconnect'){d.rays('#31273b',310,350);d.actor(a.cardId,5,350,689,580,-7);panel(c,d,638,186,570,278,'PERIPHERAL DRAMA',PINK,1);d.text('CONTROLLER',925,282,65,INK,0,510);d.text('DISCONNECTED',925,344,65,PINK,0,510);d.text('ATTEMPTING TO RECONNECT: 0%',924,417,21,INK,0,510);d.weapon('controller',1050,567,.82,37,PINK,'NO SIGNAL');line(c,[[950,515],[929,499],[942,477]],PAPER,7);d.tag('THE SILENCE IS THE SOUND EFFECT.',855,98,PAPER,2,700);}
 else if(shot==='throw'||shot==='contact'){const q=ease((p-.50)/(.6875-.50)),hit=clamp((p-.6875)/.1725);d.background(p,.48,1.21);d.actor(a.cardId,2,304+q*25,678,560,-5);d.dossier(a.targetId,1044+hit*70,383-Math.sin(hit*Math.PI)*74,252,-7-hit*30);const x=440+q*602,y=479-Math.sin(q*Math.PI)*219;cord(c,x,y,q);d.weapon('controller',x,y,1.5,-14+q*280,BLUE,'RAGE');d.tag('THREW THE MATCH. LITERALLY.',765,86,ACID,-3,780);if(shot==='contact'){d.dust(1044,383,hit,BLUE);d.text(memeVerdict(a),816,569,77,PINK,-7,743);result(d,s,834,669);}else d.text('BRO THREW THE ENTIRE SETUP',856,634,40,PAPER,-3,745);}
 else {d.rays('#d4c4a8',1010,370,true);d.actor(a.cardId,5,329,700,550,-5);d.weapon('controller',482,627,.52,35,BLUE,'LAG');d.text('ABSOLUTE TECH SUPPORT',834,128,72,PINK,-3,759);d.bubble('THE CONTROLLER HAD BETTER AIM.',825,326,750);chat(c,d,['chat: the throw was physical','reply_guy: source? the controller','gamer: still blaming the wifi']);result(d,s);}
}
function complaints(c:CanvasRenderingContext2D,d:MemeDraw,s:SpecialScene,shot:string){const p=s.reduced?1:clamp(s.progress),a=s.playback;
 if(shot==='review'){d.background(p,.43,1.18+p*.22);d.actor(a.cardId,0,322,680,544,-2);panel(c,d,651,149,536,362,'RATE YOUR EXPERIENCE',PINK,-3);d.text('CAUSALITY',921,246,67,INK,0,466);d.text('1 / 5 STARS',921,321,65,PINK,0,460);d.text('NO MANAGER IN THIS DIMENSION',913,418,22,INK,0,479);d.tag('A NORMAL CUSTOMER INTERACTION',816,87,ACID,3,756);}
 else if(shot==='tickets'){d.background(p,.65,1.23);const n=Math.min(17,1+Math.floor((p-.23)/.23*17));for(let i=0;i<n;i++){const x=430+i*57%622,y=138+i*43%375;panel(c,d,x,y,260,120,`COMPLAINT ${i+1} / 17`,i%2?ACID:PINK,(i%5-2)*3);d.text(i%3?'MANAGER REQUIRED':'REFUND REALITY',x+130,y+77,21,INK,0,232);}d.actor(a.cardId,1,282,694,600,-3);d.tag(`SUPPORT QUEUE: ${n} KARENS / 0 MANAGERS`,855,76,ACID,-2,737);d.text('ALT + F4 IS A PERSONAL ATTACK',835,660,38,PAPER,-3,815);}
 else if(shot==='mods'||shot==='contact'){const q=ease((p-.46)/.2275),hit=clamp((p-.6875)/.1725);d.background(p,.58,1.18);d.actor(a.cardId,2,281,685,559,-4);d.dossier(a.targetId,1060+hit*40,404,247,-9-hit*23);d.receipt(q,(p-.46)*5);for(let j=0;j<3;j++){const t=ease((p-.49-j*.025)/.17),x=774+j*142,y=-135+t*(317+j*46);d.weapon('hammer',x,y,.54,j*12-7,PINK,'BAN');d.image(CARD_BY_ID.CC002.art,x,84,61,61,j*8-6);}d.tag('THE MODS HAVE ENTERED THE CHAT',822,57,ACID,-2,810);if(shot==='contact'){d.wrap(1060+hit*40,404,hit);d.dust(1060,402,hit,PINK);d.text(memeVerdict(a),843,595,78,PINK,-5,790);result(d,s,825,680);}else d.text('SEVENTEEN TICKETS. ONE TARGET.',822,637,39,PAPER,-2,806);}
 else {d.rays('#dccdb1',900,340,true);d.actor(a.cardId,3,286,702,520,-3);d.actor(a.cardId,0,1100,707,342,5,1,true);d.text('MANAGER REVEAL',800,112,80,PINK,-3,750);d.bubble('SHE HAS ESCALATED TO HERSELF.',810,308,744);chat(c,d,['mod: there is no higher manager','karen: yes there is. also me','chat: customer service any%']);result(d,s);}
}
function rent(c:CanvasRenderingContext2D,d:MemeDraw,s:SpecialScene,shot:string){const p=s.reduced?1:clamp(s.progress),a=s.playback;
 if(shot==='listing'){d.background(p,.57,1.18);d.actor(a.cardId,0,294,685,553,-3);panel(c,d,634,115,572,491,'ARENA LETTINGS / PREMIUM LISTING',ACID,2);d.text('THIS FIGHT IS A RENTAL',916,208,53,INK,0,525);d.dossier(a.targetId,1015,363,176,0);d.text('0 BEDROOMS. 1 ENEMY.',923,511,27,INK,0,490);d.text('DEPOSIT: YOUR ENTIRE AURA',918,557,25,PINK,0,518);d.tag('OWNER: THE GUY TRYING TO EVICT YOU',791,71,PAPER,-3,811);}
 else if(shot==='fees'){d.background(p,.6,1.24);d.actor(a.cardId,1,284,691,559,-3);const fees=['ENTERING THE ARENA','LOOKING AT THE ARENA','BREATHING NEAR THE ARENA','READING THIS SURCHARGE'],n=Math.min(4,1+Math.floor((p-.23)/.23*4));for(let i=0;i<n;i++){const x=612+i*34,y=145+i*113;panel(c,d,x,y,516,127,`ADDITIONAL FEE ${i+1}`,i%2?PINK:ACID,(i-2)*2);d.text(fees[i],x+257,y+82,30,INK,0,482);}d.tag('IT IS NOT PAY TO WIN. IT IS PAY TO STAND.',773,73,ACID,-3,933);}
 else if(shot==='lease'||shot==='contact'){const q=ease((p-.46)/.2275),hit=clamp((p-.6875)/.1725);d.background(p,.58,1.2);d.actor(a.cardId,2,291,695,560,-5);const room=363-q*225;rect(c,1085-room,174,room,413,PAPER,ACID,5);d.dossier(a.targetId,1080-room/2+hit*55,379,Math.max(110,room-33),-hit*23);d.weapon('key',412+q*590,400-Math.sin(q*Math.PI)*180,1.3,-23+q*89,ACID,'RENT');d.tag('YOUR PERSONAL SPACE IS NOW A DLC.',790,78,ACID,-3,835);if(shot==='contact'){d.weapon('stamp',1050,485,1.19,-13,PINK,a.knockout?'EVICTED':'RENT DUE');d.dust(1054,374,hit,ACID);d.text(memeVerdict(a),804,602,79,PINK,-4,747);result(d,s,826,685);}else d.text('SQUARE FOOTAGE: LEAVING THE CHAT',813,659,36,PAPER,-3,815);}
 else {d.rays('#e1c989',934,355,true);d.actor(a.cardId,3,314,696,534,-2);d.text('FIVE STARS. ALL FROM HIM.',825,112,68,PINK,-3,779);d.bubble('BRO CHARGES RENT FOR THE HEALTH BAR.',814,310,760);chat(c,d,['tenant: is breathing included?','landlord: that is the oxygen tier','chat: alpha male. beta lease.']);result(d,s);}
}
export function paintMemeSpecial(c:CanvasRenderingContext2D,s:SpecialScene,d:MemeDraw){if(paintCrossover(c,s,d)||paintMegaSpecial(c,s,d)||paintExpansionSpecial(c,s,d))return true;const id=memeSpecialId(s.playback.cardId);if(!id||s.playback.duoId)return false;const shot=memeShot(id,s.progress,s.reduced);if(id==='CC001')gamer(c,d,s,shot);else if(id==='CC026')complaints(c,d,s,shot);else rent(c,d,s,shot);return true;}
export const memeSceneLabel=(id:string)=>{const key=memeSpecialId(id);return key?MEME_SPECIALS[key].caption:null;};
