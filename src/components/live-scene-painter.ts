// Shared deterministic painter for browser gameplay and offline frame review.
import {paintMemeSpecial} from './meme-special-painter';
import {paintFirstRoster} from './first-roster-painter';
import {paintSecondRoster} from './second-roster-painter';
import type {MemeDraw} from './meme-special-painter';
import {paintRoast,type RoastScene} from './roast-painter';
import {ROAST_OPPONENTS,ROAST_PROPS} from '../domain/roast';
import {paintOpening} from './opening-painter';
import {pullReaction} from '../domain/meme-presentation';
import {DUO_BY_ID} from '../data/duos';
import {rarityOf} from '../data/cards';
import {CARD_BY_ID} from '../data/cards';
import {SPECIAL_ART, specialAt} from '../data/specials';
import {CITY_GAGS, CITY_HOSTS, sceneSeed, specialJoke, weaponFamily, WeaponFamily} from '../data/live-direction';
import {INCIDENTS} from '../data/incidents';
import type {BuildingKind} from '../data/city';
import {buildingOf} from '../data/city';
import {PROP_BY_ID} from '../data/props';
import type {CityReveal} from '../domain/city-presentation';
import type {SpecialPlayback} from '../domain/cinematic';
import type {BattleEvent, Match} from '../domain/battle';
import cast from '../data/actor-cast.json';
import {paintCourtBattle} from './court-painter';

export type SceneImages=Record<string,CanvasImageSource>;
interface Pose {src:string;width:number;height:number;anchor:{x:number;y:number}}
interface Actor {baseHeight:number;poses:Pose[]}
const ACTORS=cast as Record<string,Actor>;
const CITY='/assets/reference/city-backdrop.webp',LOGO='/assets/reference/title-logo.webp';
const INK='#111016',PAPER='#f2e8cb',PINK='#ff269e',ACID='#deff00';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>1-(1-clamp(n))**3;
const mix=(a:number,b:number,p:number)=>a+(b-a)*clamp(p);
const radians=(degrees:number)=>degrees*Math.PI/180;

export interface SpecialScene {kind:'special';playback:SpecialPlayback;progress:number;reduced:boolean;time?:number}
export interface BattleScene {kind:'battle';match:Match;event?:BattleEvent;progress:number;impact:boolean;reduced:boolean;time?:number}
export interface CityScene {kind:'city';reveal:CityReveal;progress:number;reduced:boolean;time?:number}
export interface IncidentScene {kind:'incident';buildingKind:BuildingKind;cardId:string;choice:0|1;progress:number;reduced:boolean;time?:number}
export interface PackScene {kind:'pack';progress:number;reduced:boolean;time?:number}
export interface PullScene {kind:'pull';cardId:string;isNew:boolean;copies:number;progress:number;reduced:boolean;time?:number;openingId?:string;preview?:boolean}
export type LiveScene=SpecialScene|BattleScene|CityScene|IncidentScene|PackScene|PullScene|RoastScene;
export const hasActingPoses=(id:string)=>!!ACTORS[id];
export const actorPoseSrc=(id:string,pose:number)=>ACTORS[id]?.poses[pose]?.src??SPECIAL_ART(id);
export function specialOutcome(playback:SpecialPlayback){return [playback.damage?`−${playback.damage} COMPOSURE`:'',playback.heal?`+${playback.heal} RESTORED`:''].filter(Boolean).join(' / ')||'EFFECT APPLIED';}

function actorAssets(id:string){return [...(ACTORS[id]?.poses.map(p=>p.src)??[SPECIAL_ART(id)]),CARD_BY_ID[id].art];}
export function liveSceneAssets(scene:LiveScene):string[]{
 let urls:string[]=[CITY,LOGO];
 if(scene.kind==='special')urls.push(...actorAssets(scene.playback.cardId),...actorAssets(scene.playback.targetId),...(scene.playback.partnerId?actorAssets(scene.playback.partnerId):[]),...(scene.playback.cardId==='CC026'?[CARD_BY_ID.CC002.art]:[]),...(scene.playback.propId?[PROP_BY_ID[scene.playback.propId].art]:[]));
 else if(scene.kind==='roast'){for(const id of new Set([...scene.roast.team.map(f=>f.cardId),...ROAST_OPPONENTS.map(f=>f.cardId),'CC007','CC028','CC074','CC068','CC043','CC083','CC015','CC008']))urls.push(...actorAssets(id));urls.push(...ROAST_PROPS.map(p=>p.art));}
 else if(scene.kind==='battle'){urls.push('/assets/world/screenshot-court.webp');for(const id of new Set([...scene.match.player,...scene.match.enemy].map(f=>f.cardId)))urls.push(...actorAssets(id));}
 else if(scene.kind==='pack'){}
 else if(scene.kind==='pull')urls.push(...actorAssets(scene.cardId),...actorAssets('CC007'));
 else if(scene.kind==='incident')urls.push(...actorAssets(scene.cardId),...actorAssets(scene.cardId==='CC007'?'CC001':'CC007'),`/assets/city/${scene.buildingKind}-l1.webp`);
 else {const r=scene.reveal;urls.push(...actorAssets('CC007'),...actorAssets(r.after.residentId??CITY_HOSTS[r.after.kind]),`/assets/city/${r.after.kind}-l${r.after.level}.webp`);if(r.before)urls.push(`/assets/city/${r.before.kind}-l${r.before.level}.webp`);}
 if(scene.kind==='special'&&scene.playback.cardId==='CC006')for(const id of ['CC007','CC008','CC003'])urls.push(...actorAssets(id));
 if(scene.kind==='special'&&scene.playback.cardId==='CC001')urls.push(...actorAssets('CC003'));
 return [...new Set(urls)];
}

function path(c:CanvasRenderingContext2D,points:number[][],fill:string,stroke=INK,width=3){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin='round';c.stroke();}}
function line(c:CanvasRenderingContext2D,points:number[][],color:string,width=3){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}
function box(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill:string,stroke=INK,width=3){c.fillStyle=fill;c.fillRect(x,y,w,h);if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.strokeRect(x,y,w,h);}}
function ellipse(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,fill:string){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();}
function text(c:CanvasRenderingContext2D,value:string,x:number,y:number,size=40,color=PAPER,angle=0,max=1000){c.save();c.translate(x,y);c.rotate(radians(angle));c.font=`900 ${size}px CityDisplay, Impact, sans-serif`;c.textAlign='center';c.textBaseline='middle';const width=c.measureText(value).width;c.scale(Math.min(1,max/Math.max(1,width)),1);c.lineWidth=Math.max(2,size*.055);c.strokeStyle=INK;c.lineJoin='round';if(size>26)c.strokeText(value,0,0);c.fillStyle=color;c.fillText(value,0,0);c.restore();}
function tag(c:CanvasRenderingContext2D,value:string,x:number,y:number,color=ACID,angle=-3,max=620){c.save();c.translate(x,y);c.rotate(radians(angle));c.font='bold 17px CityMono, monospace';c.textAlign='center';c.textBaseline='middle';const w=Math.min(max,c.measureText(value).width+30);path(c,[[-w/2,-20],[w/2,-18],[w/2-3,20],[-w/2+2,22]],color,INK,3);c.fillStyle=INK;c.fillText(value,0,1,w-20);c.restore();}
function bubble(c:CanvasRenderingContext2D,value:string,x:number,y:number,w=440){c.save();c.translate(x,y);c.rotate(radians(-3));path(c,[[-w/2,-40],[w/2,-37],[w/2-3,40],[-w*.23,38],[-w*.39,65],[-w*.35,36],[-w/2+3,40]],PAPER,INK,5);text(c,value,0,0,27,INK,0,w-30);c.restore();}
function dimensions(image:CanvasImageSource){const i=image as HTMLImageElement;return {width:i.naturalWidth||i.width||1280,height:i.naturalHeight||i.height||720};}
function image(c:CanvasRenderingContext2D,images:SceneImages,src:string,x:number,y:number,w:number,h?:number,angle=0,opacity=1){const img=images[src];if(!img)return;const d=dimensions(img),height=h??w*d.height/d.width;c.save();c.translate(x,y);c.rotate(radians(angle));c.globalAlpha*=opacity;c.drawImage(img,-w/2,-height/2,w,height);c.restore();}
function resident(c:CanvasRenderingContext2D,images:SceneImages,id:string,pose:number,x:number,floor=675,height=480,angle=0,opacity=1,mirror=false){
 const actor=ACTORS[id],p=actor?.poses[pose]??actor?.poses[0],src=p?.src??SPECIAL_ART(id),img=images[src]??images[CARD_BY_ID[id].art];
 if(!img){tag(c,CARD_BY_ID[id].name,x,floor-height*.5,PAPER);return;}
 c.save();c.translate(x,floor);c.rotate(radians(angle));if(mirror)c.scale(-1,1);c.globalAlpha*=opacity;
 if(p){const scale=height/actor.baseHeight;c.drawImage(img,-p.anchor.x*scale,-p.anchor.y*scale,p.width*scale,p.height*scale);}
 else {const d=dimensions(img),w=height*d.width/d.height;c.drawImage(img,-w/2,-height,w,height);}
 c.restore();
}
function backdrop(c:CanvasRenderingContext2D,images:SceneImages,p:number,dark=.45,zoom=1.08){const art=images[CITY];box(c,0,0,1280,720,INK,'');if(art){const d=dimensions(art),scale=Math.max(1280/d.width,720/d.height)*zoom,w=d.width*scale,h=d.height*scale;c.drawImage(art,-(w-1280)*(.37+p*.22),-(h-720)*.6,w,h);}box(c,0,0,1280,720,`rgba(10,9,18,${dark})`,'');line(c,[[-10,83],[370-p*45,38],[1290,86]],INK,6);path(c,[[20-p*45,0],[45-p*45,0],[68-p*55,720],[26-p*55,720]],INK,'');for(let i=0;i<4;i++){const x=190+i*270-p*45;line(c,[[x,61],[x,86]],INK,4);ellipse(c,x,91,7,10,'#f8cf4c');}}
function rays(c:CanvasRenderingContext2D,accent:string,focusX=640,focusY=360,light=false){box(c,0,0,1280,720,light?PAPER:INK,'');for(let i=0;i<22;i++){const a=i*Math.PI/11;const r=130,far=1700,delta=.025+(i%3)*.013;path(c,[[focusX+Math.cos(a-delta)*r,focusY+Math.sin(a-delta)*r],[focusX+Math.cos(a-delta)*far,focusY+Math.sin(a-delta)*far],[focusX+Math.cos(a+delta)*far,focusY+Math.sin(a+delta)*far],[focusX+Math.cos(a+delta)*r,focusY+Math.sin(a+delta)*r]],accent,'');}c.fillStyle='rgba(0,0,0,.16)';for(let y=12;y<720;y+=27)for(let x=12;x<1280;x+=27){c.beginPath();c.arc(x,y,2+(x+y)%3,0,Math.PI*2);c.fill();}}
function grain(c:CanvasRenderingContext2D,seed:number){c.save();c.strokeStyle='rgba(8,7,9,.19)';c.lineWidth=1;for(let i=0;i<95;i++){const x=(i*179+seed*3)%1280,y=(i*113+seed*7)%720;c.beginPath();c.moveTo(x,y);c.lineTo(x+2+i%5,y-3);c.stroke();}c.restore();}
function dust(c:CanvasRenderingContext2D,x:number,y:number,p:number,accent=PAPER){for(let i=0;i<13;i++){const a=i*2.39,r=ease(p)*(100+(i%4)*48),xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r+85*p*p;c.save();c.globalAlpha=1-clamp(p)*.8;path(c,[[xx,yy],[xx+19,yy-9],[xx+29,yy+13],[xx+7,yy+20]],i%3?accent:ACID,INK,2);c.restore();}}
function weapon(c:CanvasRenderingContext2D,family:WeaponFamily,x:number,y:number,scale:number,angle:number,accent:string,word:string){c.save();c.translate(x,y);c.rotate(radians(angle));c.scale(scale,scale);c.lineJoin='round';
 switch(family){
 case 'psychic':for(let j=3;j>0;j--){c.beginPath();c.ellipse(0,0,45+j*24,30+j*18,j*.5,0,Math.PI*2);c.strokeStyle=j%2?PINK:ACID;c.lineWidth=3+j;c.stroke();}ellipse(c,0,0,37,37,'#ffe6f8');text(c,'DMCA',0,0,22,INK,0,70);break;
 case 'camera':ellipse(c,0,-25,103,110,'#17121f');ellipse(c,0,-25,84,91,'#ffef9d');ellipse(c,0,-25,70,77,'#17121f');box(c,-59,-46,118,82,'#6c5144',PAPER,4);ellipse(c,14,-5,26,26,INK);ellipse(c,14,-5,15,15,accent);box(c,-45,-33,18,13,ACID,'');line(c,[[0,85],[0,120]],PAPER,5);text(c,'CHAT IS THIS REAL',0,145,17,PAPER,0,240);break;
 case 'key':ellipse(c,0,-61,63,63,'#ffdd65');ellipse(c,0,-61,31,31,INK);box(c,-15,-6,30,127,'#ffdd65',INK,5);path(c,[[12,55],[67,55],[67,77],[39,77],[39,99],[66,99],[66,121],[10,121]],'#ffdd65',INK,5);text(c,'RENT',0,-60,16,ACID,0,57);break;
 case 'grass':path(c,[[0,113],[-75,53],[-95,-10],[-57,-64],[35,-108],[83,-34],[58,47]],'#6ac66a',INK,6);line(c,[[0,100],[17,-78]],'#163b21',7);for(let j=0;j<4;j++){const y=60-j*36;line(c,[[7,y],[-45,y-26]],'#163b21',3);line(c,[[7,y],[52,y-29]],'#163b21',3);}text(c,'LOG OFF',0,8,20,PAPER,0,130);break;
 case 'badge':{const pts=[];for(let j=0;j<20;j++){const a=j*Math.PI/10-Math.PI/2,r=j%2?74:99;pts.push([Math.cos(a)*r,Math.sin(a)*r]);}path(c,pts,'#31d7ff',INK,5);line(c,[[-43,0],[-13,29],[47,-37]],PAPER,17);tag(c,'9.99 / MONTH',0,135,ACID,3,230);break;}
 case 'phone':box(c,-56,-101,112,205,INK,accent,7);box(c,-44,-80,88,157,'#27b7d0',INK,2);ellipse(c,-17,-21,9,11,INK);ellipse(c,18,-21,9,11,INK);line(c,[[-24,14],[0,28],[25,14]],INK,5);text(c,'BOT CHILD',0,59,13,INK,0,80);break;
 case 'controller':path(c,[[-90,-25],[-75,-57],[74,-57],[92,-25],[117,46],[80,58],[43,23],[-45,23],[-79,58],[-116,45]],'#41334f',PAPER,4);box(c,-62,-23,13,43,INK,'');box(c,-77,-8,44,13,INK,'');ellipse(c,60,-15,9,9,PINK);ellipse(c,82,5,9,9,ACID);ellipse(c,31,6,9,9,'#31d7ff');line(c,[[0,-57],[4,-90],[22,-115]],INK,5);break;
 case 'rocket':path(c,[[0,-105],[33,-52],[29,62],[-30,62],[-32,-52]],PAPER,INK,6);path(c,[[-30,22],[-68,78],[-23,70]],PINK);path(c,[[30,22],[67,78],[23,70]],PINK);ellipse(c,0,-35,18,20,accent);line(c,[[-15,3],[15,3]],INK,3);path(c,[[-19,63],[-9,118],[0,98],[13,127],[24,63]],ACID);break;
 case 'hammer':box(c,-13,-15,26,142,'#985139',INK,5);path(c,[[-91,-70],[88,-73],[88,4],[-93,7]],accent,INK,7);text(c,'BAN',0,-34,38,PAPER);break;
 case 'paper':path(c,[[-82,-95],[63,-91],[85,-69],[77,109],[-77,101]],PAPER,INK,5);line(c,[[63,-91],[61,-68],[85,-69]],INK,3);for(let j=0;j<5;j++)line(c,[[-58,-51+j*25],[45-(j%2)*22,-51+j*25]],'#3c3440',3);text(c,word,0,72,21,INK,0,133);break;
 case 'stamp':path(c,[[-63,10],[63,10],[79,51],[-79,51]],'#c18d23',INK,6);path(c,[[-27,10],[-23,-65],[23,-65],[27,10]],'#776038',INK,5);ellipse(c,0,-66,47,20,accent);text(c,word,0,37,25,INK,0,140);break;
 case 'screen':box(c,-115,-82,230,165,'#211e2f',accent,5);for(let j=0;j<4;j++){box(c,-93,-61+j*31,176-j*14,17,j%2?PAPER:accent,'');}text(c,word,0,112,20,PAPER,0,270);break;
 case 'shield':path(c,[[0,-104],[88,-65],[67,55],[0,113],[-65,55],[-88,-65]],accent,PAPER,6);line(c,[[0,-55],[0,56]],INK,9);line(c,[[-43,0],[43,0]],INK,9);break;
 case 'pasta':ellipse(c,0,38,110,44,PAPER);for(let j=0;j<11;j++){line(c,[[-80+j*14,-21],[-96+j*17,8],[-76+j*12,41],[-34+j*11,-5]],'#eec45e',7);}line(c,[[-73,-99],[-66,62]],INK,8);break;
 case 'rug':path(c,[[-112,-70],[111,-68],[88,73],[-88,76]],PINK,INK,5);path(c,[[-83,-44],[79,-44],[59,46],[-63,51]],accent,INK,2);for(let j=0;j<10;j++)line(c,[[-89+j*18,73],[-86+j*18,97]],PAPER,3);break;
 case 'laser':path(c,[[-85,-24],[93,-33],[113,25],[-105,34]],accent,INK,6);text(c,'UP ONLY',0,3,28,INK,0,190);break;
 case 'mic':ellipse(c,0,-51,42,51,'#787079');box(c,-12,-3,24,100,INK,PAPER,3);for(let j=0;j<6;j++)line(c,[[-27,-78+j*11],[27,-78+j*11]],INK,3);break;
 default:path(c,[[0,-100],[28,-34],[101,-25],[49,24],[71,94],[0,58],[-75,91],[-51,21],[-101,-30],[-29,-41]],accent,INK,5);text(c,word,0,0,22,INK,0,135);
 }
 c.restore();}
function receiptRibbon(c:CanvasRenderingContext2D,progress:number,time:number){const p=clamp(progress);c.beginPath();for(let i=0;i<=80*p;i++){const k=i/80,x=160+k*940,y=270-Math.sin(k*Math.PI)*185+Math.sin(k*9+time)*k*70+k*120;if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.lineJoin='round';c.lineCap='butt';c.strokeStyle=INK;c.lineWidth=61;c.stroke();c.strokeStyle=PAPER;c.lineWidth=51;c.stroke();for(let k=.04;k<p;k+=.072){const x=160+k*940,y=270-Math.sin(k*Math.PI)*185+Math.sin(k*9+time)*k*70+k*120;const angle=Math.cos(k*Math.PI)*-27+Math.cos(k*9+time)*k*12;text(c,'AUDACITY 99',x,y,11,INK,angle,95);}}
function wrapTarget(c:CanvasRenderingContext2D,x:number,y:number,p:number){for(let j=0;j<4;j++){const k=ease((p-j*.10)*3);if(k<=0)continue;c.save();c.translate(x,y-85+j*64);c.rotate(radians(12-j*7));box(c,-160*k,-20,320*k,40,PAPER,INK,3);text(c,j%2?'MANAGERS: ZERO':'TOTAL: YOUR DIGNITY',0,0,14,INK,0,280*k);c.restore();}}
function dossier(c:CanvasRenderingContext2D,images:SceneImages,id:string,x:number,y:number,w=255,angle=0){c.save();c.translate(x,y);c.rotate(radians(angle));const h=w*1.38;box(c,-w/2,-h/2,w,h,PAPER,PINK,6);image(c,images,CARD_BY_ID[id].art,0,-h*.12,w-18,w-18);text(c,CARD_BY_ID[id].name.toUpperCase(),0,h*.35,22,INK,0,w-24);c.restore();}

function paintSpecial(c:CanvasRenderingContext2D,images:SceneImages,s:SpecialScene){
 const p=s.reduced?1:clamp(s.progress),a=s.playback,d=specialAt(a.cardId),seed=sceneSeed(a.key+a.targetId),family=weaponFamily(d.motif),support=a.support,duo=a.duoId?DUO_BY_ID[a.duoId]:null,joke=duo?.gag??specialJoke(a.cardId,seed),impact=.6875;
 const draw:MemeDraw={
  background:(q,dark,zoom)=>backdrop(c,images,q,dark,zoom),actor:(id,pose,x,floor,height,angle,opacity,mirror)=>resident(c,images,id,pose,x,floor,height,angle,opacity,mirror),dossier:(id,x,y,w,angle)=>dossier(c,images,id,x,y,w,angle),weapon:(f,x,y,scale,angle,accent,word)=>weapon(c,f,x,y,scale,angle,accent,word),text:(value,x,y,size,color,angle,max)=>text(c,value,x,y,size,color,angle,max),tag:(value,x,y,color,angle,max)=>tag(c,value,x,y,color,angle,max),bubble:(value,x,y,w)=>bubble(c,value,x,y,w),rays:(color,x,y,light)=>rays(c,color,x,y,light),dust:(x,y,q,color)=>dust(c,x,y,q,color),receipt:(q,time)=>receiptRibbon(c,q,time),wrap:(x,y,q)=>wrapTarget(c,x,y,q),image:(src,x,y,w,h,angle)=>image(c,images,src,x,y,w,h,angle),result:specialOutcome,
 };
 if(paintSecondRoster(c,s,draw)||paintFirstRoster(c,s,draw)||paintMemeSpecial(c,s,draw)){if(a.propId)image(c,images,PROP_BY_ID[a.propId].art,470,567,126,undefined,-13);grain(c,seed%50+Math.floor(p*12));return;}
 if(p<.23){backdrop(c,images,p,.32,1.12+p*.28);resident(c,images,a.cardId,0,355,702,535,-3);tag(c,d.location,880,90,PAPER,3,670);text(c,CARD_BY_ID[a.cardId].name.toUpperCase(),873,246,86,d.accent,-4,685);tag(c,duo?.setup??d.setup,885,407,ACID,2,640);bubble(c,d.quote,873,552,630);}
 else if(p<.46){const u=(p-.23)/.23;rays(c,d.accent,370,330);resident(c,images,a.cardId,1,350,716,605,-4);weapon(c,family,900,327,1.8+u*.42,-8+u*9,d.accent,d.prop);tag(c,duo?.setup??d.setup,845,88,PAPER,3,640);text(c,duo?.name.toUpperCase()??d.attack,857,566,61,PAPER,-3,680);}
 else if(p<.86){const u=(p-.46)/.40,launch=ease((p-.46)/(impact-.46)),hit=clamp((p-impact)/(.86-impact));backdrop(c,images,p,.5,1.14);path(c,[[0,0],[685,0],[415,720],[0,720]],`${d.accent}44`,'');dossier(c,images,a.targetId,1040+hit*47,403-Math.sin(hit*Math.PI)*75,245,-8-hit*28);
  if(support){ellipse(c,890,406,170+hit*48,220+hit*25,`${d.accent}33`);weapon(c,family==='grass'?'grass':'shield',905,348,1.4,-5,d.accent,'RESTORED');}
  else if(a.cardId==='CC026'){receiptRibbon(c,launch,u*2);if(hit>0)wrapTarget(c,1040+hit*47,403-Math.sin(hit*Math.PI)*75,hit);}
  else {const px=mix(420,1030,launch),py=420-Math.sin(launch*Math.PI)*180;for(let j=3;j>0;j--){c.save();c.globalAlpha=.08+j*.03;weapon(c,family,px-j*42,py+j*9,1.2,-18+launch*62,d.accent,d.prop);c.restore();}weapon(c,family,px,py,1.2,-18+launch*62,d.accent,d.prop);if(family==='screen'||family==='phone')for(let j=0;j<4;j++){const q=clamp(launch-j*.13);weapon(c,family==='phone'?'phone':'paper',mix(390,1080,q),160+j*105,.52,j*11-12,d.accent,j%2?d.prop:'REPORTED');}}
  if(p>.49&&p<.54){resident(c,images,a.cardId,2,282,702,575,-8,.26);resident(c,images,a.cardId,2,304,702,575,-6,.45);}
  resident(c,images,a.cardId,p<.51?1:2,320+launch*36,702,580,-4+launch*5);
  if(a.propId)image(c,images,PROP_BY_ID[a.propId].art,486,523,150,undefined,-18+launch*45);
  if(hit>0){dust(c,1040,405,hit,d.accent);text(c,a.preview?d.impact:a.knockout?'CANCELLED':d.impact,802,581,91,ACID,-8,620);if(!a.preview){text(c,specialOutcome(a),849,665,35,PAPER,0,690);}}
  else text(c,duo?.name.toUpperCase()??d.attack,850,655,37,PAPER,-3,690);
 }
 else {rays(c,'#e1d4b9',1040,370,true);const u=(p-.86)/.14;const embarrassed=family==='rocket'||family==='controller';resident(c,images,a.cardId,embarrassed&&u>.3?5:3,339,721,535,embarrassed&&u>.3?-4:0);if(support)resident(c,images,a.cardId,0,1054,691,390);else {dossier(c,images,a.targetId,1050,408,205,-18);if(a.cardId==='CC026')wrapTarget(c,1050,408,1);}
  text(c,a.preview?'SPECIAL PREVIEW':a.knockout?'THREAD CLOSED':d.impact,873,144,83,PINK,-3,670);bubble(c,joke,822,389,730);if(!a.preview)tag(c,specialOutcome(a),830,527,ACID,-3,550);else tag(c,'PREVIEW · NO REWARDS OR HYPE SPENT',813,535,ACID,-2,630);
  text(c,CARD_BY_ID[a.cardId].ability.toUpperCase(),810,644,22,INK,0,650);
 }
 if(duo&&a.partnerId){
  if(p<.23){path(c,[[0,450],[440,420],[410,720],[0,720]],INK,PAPER,4);resident(c,images,a.partnerId,0,160,740,310,6);tag(c,'DUO CAST · '+CARD_BY_ID[a.partnerId].name,675,686,PINK,-2,680);}
  else if(p<.46){resident(c,images,a.partnerId,1,130,728,390,8);tag(c,'TWO TAKES. ONE CRIME.',839,643,ACID,-4,640);}
  else if(p<.86){resident(c,images,a.partnerId,2,137+ease((p-.46)/.22)*50,720,365,6);if(p>.54){const q=ease((p-.54)/.15),pd=specialAt(a.partnerId);weapon(c,weaponFamily(pd.motif),mix(270,1070,q),535-Math.sin(q*Math.PI)*85,.72,-17+q*50,pd.accent,pd.prop);}}
  else {resident(c,images,a.partnerId,3,143,742,315,5);tag(c,duo.name.toUpperCase(),790,604,PINK,3,690);}
 }
 grain(c,seed%50+Math.floor(p*12));
}

function paintBattle(c:CanvasRenderingContext2D,images:SceneImages,s:BattleScene){paintCourtBattle(c,images,s,sceneDrawing(c,images));}

function paintCity(c:CanvasRenderingContext2D,images:SceneImages,s:CityScene){
 const r=s.reveal,p=s.reduced?1:clamp(s.progress),def=buildingOf(r.after.kind),u=ease((p-.38)/.30),seed=r.plot+r.after.level,jokes=CITY_GAGS[r.after.kind],host=r.after.residentId??CITY_HOSTS[r.after.kind],upgraded=r.before?.kind===r.after.kind;
 backdrop(c,images,p,.32,1.1+p*.09);path(c,[[310,639],[721,513],[1077,638],[656,721]],'#302634',PAPER,3);
 if(r.before&&p<.69)image(c,images,`/assets/city/${r.before.kind}-l${r.before.level}.webp`,771,411,555,undefined,0,1-clamp((p-.38)/.3));
 if(p<.69){c.save();c.globalAlpha=.75;for(let i=0;i<4;i++){const x=490+i*138;line(c,[[x,180],[x,640]],'#bdad85',9);}for(let y=225;y<650;y+=100)line(c,[[451,y],[1041,y]],'#bca783',8);line(c,[[490,180],[906,640]],'#aa957b',6);line(c,[[1041,180],[490,640]],'#aa957b',6);c.restore();tag(c,'PERMIT: TRUST ME BRO',759,355,PAPER,4,480);}
 if(p>.35){image(c,images,`/assets/city/${r.after.kind}-l${r.after.level}.webp`,778,418+(1-u)*220,590,undefined,(1-u)*-7,u);dust(c,764,594,clamp((p-.49)/.30),def.color);}
 if(p<.24){resident(c,images,'CC007',0,248,718,383,-3);text(c,upgraded?'AN UPGRADE.':'A NEW PROBLEM.',810,131,68,ACID,-3,745);tag(c,'CITY WORKS / PAPERWORK OPTIONAL',804,231,PAPER,2,630);}
 else if(p<.69){resident(c,images,'CC007',p<.43?1:4,246,718,402,p<.43?-3:-7);bubble(c,jokes[0],568,103,720);weapon(c,'paper',318,460,.85,-15+p*12,def.color,'PERMIT');}
 else {resident(c,images,'CC007',p>.88?5:3,225,720,363,-3);resident(c,images,host,p>.86?3:0,1083,720,300,2,1,true);
  if(r.after.kind==='rocket'){const q=clamp((p-.69)/.21);weapon(c,'rocket',806+q*255,246-Math.sin(q*Math.PI)*150,.50,10+q*155,ACID,'SOON');}
  else if(r.after.kind==='pr'){for(let j=0;j<3;j++)weapon(c,'paper',795+j*61,410-j*39,.35,j*14,def.color,'SORRY');}
  else if(r.after.kind==='civic'){weapon(c,'stamp',753,262,.8,-7,def.color,'PROMISE');}
  else if(r.after.kind==='feed'){weapon(c,'screen',822,258,.55,4,def.color,'SOURCE?');}
  else if(r.after.kind==='summit'){weapon(c,'pasta',808,287,.68,-8,def.color,'PASTA');}
  else weapon(c,'mic',815,272,.55,-15,def.color,'SORRY');
  tag(c,`PLOT ${r.plot+1} / LEVEL ${r.after.level}`,720,84,ACID,-3,480);text(c,def.name.toUpperCase(),736,166,67,PAPER,-3,740);bubble(c,jokes[1+seed%2],643,582,830);text(c,r.preview?'CEREMONY REPLAY / NO INFLUENCE SPENT':r.founding?'FREE STARTER BUILDING / +200 INFLUENCE':`${r.spent} INFLUENCE SPENT / CONSTRUCTION SAVED`,711,686,18,PAPER,0,810);
 }
 grain(c,seed+Math.floor(p*6));
}

function paintIncident(c:CanvasRenderingContext2D,images:SceneImages,s:IncidentScene){const p=s.reduced?1:clamp(s.progress),d=INCIDENTS[s.buildingKind],def=buildingOf(s.buildingKind),helper=s.cardId==='CC007'?'CC001':'CC007';
 if(p<.29){backdrop(c,images,p,.28,1.15+p*.18);image(c,images,`/assets/city/${s.buildingKind}-l1.webp`,914,399,480);resident(c,images,s.cardId,0,329,715,535,-4);tag(c,'CITY INCIDENT / '+def.name.toUpperCase(),824,86,ACID,3,720);text(c,d.title.toUpperCase(),831,217,73,PAPER,-4,720);bubble(c,'THE BLOCK MADE IT EVERYONE’S PROBLEM.',830,556,740);}
 else if(p<.66){rays(c,def.color,340,340);const q=ease((p-.29)/.37);resident(c,images,s.cardId,1,285,712,548,-5);resident(c,images,helper,q>.6?4:0,1059+q*25,727,343,q*14);const pd=specialAt(s.cardId);weapon(c,weaponFamily(pd.motif),mix(477,859,q),287-Math.sin(q*Math.PI)*100,1.4,q*33-12,def.color,pd.prop);text(c,s.choice===0?'MONETIZE THE DISASTER':'FIND THE FUCKING RECEIPTS',791,583,59,PAPER,-3,785);}
 else {rays(c,'#d8ccb5',1040,350,true);resident(c,images,s.cardId,3,316,736,503,-2);resident(c,images,helper,5,1104,740,292,5);text(c,d.outcomes[s.choice],820,170,74,PINK,-4,760);bubble(c,d.gags[s.choice],820,384,760);tag(c,s.choice===0?'+1 PACK / ENDING SAVED':'+20 INFLUENCE / ENDING SAVED',806,556,ACID,-2,720);text(c,'REPLAYS DO NOT GRANT MORE REWARDS',822,638,18,INK,0,690);}
 grain(c,sceneSeed(s.buildingKind)+Math.floor(p*10));}
function packetFace(c:CanvasRenderingContext2D,images:SceneImages,p:number,cap=false){c.save();c.beginPath();c.rect(-140,cap?-201:-128,280,cap?78:330);c.clip();path(c,[[-140,-201],[134,-199],[142,190],[-135,201]],PINK,INK,5);path(c,[[-140,-170],[141,-186],[125,-118],[-131,-104]],ACID,INK,4);path(c,[[-140,31],[141,-24],[140,190],[-140,201]],'#ff8fc0',INK,4);for(let j=0;j<18;j++)line(c,[[-132+j*15,-200],[-132+j*15,-170]],PAPER,2);image(c,images,LOGO,0,-44,245,145,-5);text(c,'SAME OUTRAGE.',0,81,32,INK,-6,260);text(c,'DIFFERENT DAY.',0,116,32,INK,-6,260);text(c,'5 RESIDENTS / 3 SETS',0,169,13,INK,-3,250);const shine=c.createLinearGradient(-130,-190,130,200);shine.addColorStop(0,'#fff8');shine.addColorStop(.15,'#fff0');shine.addColorStop(.42+p*.05,'#fff7');shine.addColorStop(.53+p*.05,'#fff0');shine.addColorStop(.87,'#160b3066');shine.addColorStop(1,'#fff6');c.fillStyle=shine;c.fillRect(-140,-201,280,402);for(let j=0;j<10;j++){const x=-128+j*28;line(c,[[x,-162],[x+Math.sin(j*2+p*10)*8,-40],[x-4,172]],j%2?'#fff3':'#340a3033',1.5);}c.restore();}
function paintPack(c:CanvasRenderingContext2D,images:SceneImages,s:PackScene){const p=s.reduced?1:clamp(s.progress),rip=ease((p-.33)/.23),squeeze=Math.sin(clamp((p-.13)/.23)*Math.PI),shake=p>.30&&p<.41?Math.sin(p*280)*5:0;backdrop(c,images,p,.76,1.12+p*.1);const halo=c.createRadialGradient(640,336,40,640,336,590);halo.addColorStop(0,'#ff269e52');halo.addColorStop(1,'#ff269e00');c.fillStyle=halo;c.fillRect(0,0,1280,720);c.save();c.translate(640+shake,352);c.scale(1.02+squeeze*.16,1.02-squeeze*.07);c.rotate(radians(-7+Math.sin(p*Math.PI)*12));ellipse(c,0,248,177,17,'#0009');c.save();c.translate(0,rip*128);c.rotate(radians(rip*16));c.scale(1-rip*.17,1);packetFace(c,images,p,false);c.restore();c.save();c.translate(-rip*335,-rip*183);c.rotate(radians(-rip*124));c.scale(1-rip*.35,1-rip*.1);packetFace(c,images,p,true);c.restore();if(p>.2&&p<.55){const q=clamp((p-.2)/.22);line(c,[[-146,-125],[-90,-128],[-67,-111],[-15,-132],[23,-117],[74,-134],[140*q,-124]],PAPER,5);tag(c,'DO NOT SHAKE / CONTENTS: FIVE PROBLEMS',0,270,ACID,-2,670);}c.restore();if(p>.40)for(let j=0;j<18;j++){const q=clamp((p-.4)/.38),a=j*2.4,r=ease(q)*(70+j%5*65);c.save();c.globalAlpha=1-q;path(c,[[640+Math.cos(a)*r,252+Math.sin(a)*r],[656+Math.cos(a)*r,243+Math.sin(a)*r],[670+Math.cos(a)*r,268+Math.sin(a)*r]],j%2?PINK:ACID,INK,2);c.restore();}if(p>.56)for(let j=0;j<5;j++){const q=ease((p-.56-j*.012)/.25);c.save();c.translate(mix(640,300+j*170,q),mix(355,319+Math.abs(j-2)*22,q));c.rotate(radians((j-2)*9*q));box(c,-58,-83,116,166,INK,ACID,4);image(c,images,LOGO,0,-7,103,70);text(c,'0'+(j+1),0,59,23,PAPER);c.restore();}if(p>.78){tag(c,'PACK SAVED. NO TAKE-BACKS.',640,94,ACID,-3,590);text(c,'FIVE NEW REASONS TO LOG OFF.',640,571,61,PAPER,-3,1090);}else text(c,p<.33?'ONE PACK. ZERO GOOD DECISIONS.':'THE SEAL HAS LOST THE ARGUMENT.',640,81,45,PAPER,-3,1070);grain(c,5+Math.floor(p*8));}
function sceneDrawing(c:CanvasRenderingContext2D,images:SceneImages):MemeDraw{return {background:(q,dark,zoom)=>backdrop(c,images,q,dark,zoom),actor:(id,pose,x,floor,height,angle,opacity,mirror)=>resident(c,images,id,pose,x,floor,height,angle,opacity,mirror),dossier:(id,x,y,w,angle)=>dossier(c,images,id,x,y,w,angle),weapon:(f,x,y,scale,angle,accent,word)=>weapon(c,f,x,y,scale,angle,accent,word),text:(value,x,y,size,color,angle,max)=>text(c,value,x,y,size,color,angle,max),tag:(value,x,y,color,angle,max)=>tag(c,value,x,y,color,angle,max),bubble:(value,x,y,w)=>bubble(c,value,x,y,w),rays:(color,x,y,light)=>rays(c,color,x,y,light),dust:(x,y,q,color)=>dust(c,x,y,q,color),receipt:(q,time)=>receiptRibbon(c,q,time),wrap:(x,y,q)=>wrapTarget(c,x,y,q),image:(src,x,y,w,h,angle)=>image(c,images,src,x,y,w,h,angle),result:specialOutcome};}
function paintPull(c:CanvasRenderingContext2D,images:SceneImages,s:PullScene){paintOpening(c,s,sceneDrawing(c,images));}

export function paintLiveScene(c:CanvasRenderingContext2D,images:SceneImages,scene:LiveScene,width=1280,height=720){c.save();c.setTransform(width/1280,0,0,height/720,0,0);c.clearRect(0,0,1280,720);if(scene.kind==='special')paintSpecial(c,images,scene);else if(scene.kind==='roast')paintRoast(c,scene,sceneDrawing(c,images));else if(scene.kind==='battle')paintBattle(c,images,scene);else if(scene.kind==='pack')paintPack(c,images,scene);else if(scene.kind==='pull')paintPull(c,images,scene);else if(scene.kind==='incident')paintIncident(c,images,scene);else paintCity(c,images,scene);box(c,3,3,1274,714,'transparent',INK,6);c.restore();}
