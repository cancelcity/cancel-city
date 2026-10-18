import cast from '../data/actor-cast.json';
import fitData from '../data/court-fit.json';
import {CARD_BY_ID} from '../data/cards';
import {SPECIAL_ART,specialAt} from '../data/specials';
import {weaponFamily} from '../data/live-direction';
import {courtPresentationSlots} from '../domain/court';
import type {BattleScene,SceneImages} from './live-scene-painter';
import type {MemeDraw} from './meme-special-painter';
const COURT='/assets/world/screenshot-court.webp',INK='#141218',PAPER='#eadfbd',YELLOW='#f1e632',PINK='#ff168e';
type Actor={baseHeight:number;poses:{src:string;width:number;height:number;anchor:{x:number;y:number}}[]};
const CAST=cast as Record<string,Actor>,FIT=fitData as Record<string,{width:number;height:number}>;
const clamp=(v:number)=>Math.max(0,Math.min(1,v)),ease=(v:number)=>1-(1-clamp(v))**3;
function oval(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,color:string){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function caption(c:CanvasRenderingContext2D,text:string,x:number,y:number,color=PAPER,size=18,max=1180){c.save();c.translate(x,y);c.font=`bold ${size}px CityDisplay,Impact,sans-serif`;c.scale(Math.min(1,max/Math.max(1,c.measureText(text).width)),1);c.textAlign='center';c.textBaseline='middle';c.lineWidth=3;c.strokeStyle=INK;c.strokeText(text,0,0);c.fillStyle=color;c.fillText(text,0,0);c.restore();}
export function courtActorScale(id:string,height:number,width:number){const a=CAST[id],b=FIT[id];return b?Math.min(height/b.height,width/b.width):height/(a?.baseHeight||600);}
function actor(c:CanvasRenderingContext2D,images:SceneImages,id:string,pose:number,x:number,y:number,h:number,w:number,mirror:boolean,angle=0,alpha=1){
 const a=CAST[id],p=a?.poses[pose]||a?.poses[0],src=p?.src||SPECIAL_ART(id),image=images[src]||images[CARD_BY_ID[id].art];
 if(!image){caption(c,CARD_BY_ID[id].name,x,y-35);return;}
 c.save();c.translate(x,y);if(mirror)c.scale(-1,1);c.rotate(angle);c.globalAlpha=alpha;
 if(p&&images[src]){const scale=courtActorScale(id,h,w);c.drawImage(image,-p.anchor.x*scale,-p.anchor.y*scale,p.width*scale,p.height*scale);}else{const img=image as HTMLImageElement,iw=img.naturalWidth||img.width||w,ih=img.naturalHeight||img.height||h,scale=Math.min(w/iw,h/ih);c.drawImage(image,-iw*scale/2,-ih*scale,iw*scale,ih*scale);}
 c.restore();
}
export function paintCourtBattle(c:CanvasRenderingContext2D,images:SceneImages,s:BattleScene,draw:Pick<MemeDraw,'weapon'|'dust'>){
 const bg=images[COURT],t=s.reduced?0:(s.time||0)/1000,p=s.reduced?1:clamp(s.progress),event=s.event,contact=!!event&&s.impact;
 c.fillStyle=INK;c.fillRect(0,0,1280,720);if(bg)c.drawImage(bg,0,0,1280,720);
 const shade=c.createLinearGradient(0,0,0,720);shade.addColorStop(0,'#11101888');shade.addColorStop(.35,'#13101922');shade.addColorStop(.8,'#15101911');shade.addColorStop(1,'#14111b99');c.fillStyle=shade;c.fillRect(0,0,1280,720);
 // Everything is anchored to one fixed court. Camera accents never swap backgrounds.
 const hitPulse=contact&&!s.reduced&&event?.damage?Math.max(0,1-(p-.59)/.22):0;
 c.save();c.translate(640,515);const zoom=1+hitPulse*.012;c.scale(zoom,zoom);c.translate(-640,-515);
 const slots=courtPresentationSlots(s.match,event,p);
 for(const o of slots.sort((a,b)=>a.y-b.y)){
  const acting=event?.side===o.side&&event.actor===o.slot,hit=event?.targetSide===o.side&&event.target===o.slot&&event.damage>0,attack=acting&&(event?.kind==='attack'||event?.kind==='ability'),sign=o.direction;
  const launch=attack&&!s.reduced?(p<.34?-ease(p/.34)*14:p<.6?-14+ease((p-.34)/.26)*100:86*(1-ease((p-.6)/.34))):0;
  const recoil=hit&&contact&&!s.reduced?Math.sin(clamp((p-.59)/.37)*Math.PI)*23:0;
  const dying=!!event?.knockout&&hit&&contact,dead=o.fighter.hp===0&&!dying;
  const pose=dead?4:dying&&p>.82?5:attack?p<.34?1:p<.64?2:3:hit&&contact?4:acting&&event?.kind==='guard'&&p<.8?1:0;
  const x=o.x+sign*(launch-recoil),y=o.y+(dying&&!s.reduced?ease((p-.75)/.2)*10:0);
  oval(c,x,y+2,o.lead?64:37,o.lead?11:7,dead?'#11111a33':'#11111a88');
  if(o.lead&&!dead){c.beginPath();c.ellipse(x,y+3,70,13,0,0,Math.PI*2);c.strokeStyle=o.side==='player'?YELLOW:PINK;c.lineWidth=3;c.stroke();}
  actor(c,images,o.fighter.cardId,pose,x,y,o.height,o.width,o.side==='enemy',hit&&contact&&!s.reduced?-sign*.055:0,dead?.23:dying&&p>.88?Math.max(.2,1-(p-.88)*5):o.lead?1:.84);
  if(o.fighter.guard>0&&!dead){c.save();c.strokeStyle=o.side==='player'?'#c0deff88':'#ffb2d588';c.lineWidth=3;c.beginPath();c.ellipse(x,y-o.height*.44,o.width*.34,o.height*.49,0,Math.PI,Math.PI*2);c.stroke();c.restore();}
  if(o.lead)caption(c,CARD_BY_ID[o.fighter.cardId].name.toUpperCase(),x,y+26,o.side==='player'?YELLOW:PAPER,21,330);
  if(dead)caption(c,'CANCELLED',x,y-25,PINK,15);
 }
 if(event){const actorId=s.match[event.side][event.actor].cardId,d=specialAt(actorId),sign=event.side==='player'?1:-1,start=event.side==='player'?455:825,end=event.side==='player'?820:460;
  if((event.kind==='attack'||event.kind==='ability')&&!contact&&p>.23){const q=ease((p-.23)/.37),x=start+(end-start)*q,y=462-Math.sin(q*Math.PI)*85;draw.weapon(weaponFamily(d.motif),x,y,.44,sign*(-12+q*30),d.accent,d.prop);}
  if(event.kind==='guard'&&p<.9)draw.weapon('shield',event.side==='player'?492:788,485,.62,sign*-4,d.accent,'PR');
  if(contact&&event.damage){const q=clamp((p-.59)/.4);draw.dust(event.side==='player'?840:440,482,q,d.accent);caption(c,event.knockout?'CANCELLED':`−${event.damage}`,event.side==='player'?840:440,330-q*40,event.knockout?PINK:YELLOW,event.knockout?37:65);}
  if(contact&&event.heal)caption(c,`+${event.heal}`,event.side==='player'?425:855,337,YELLOW,48);
  if(event.kind==='switch')caption(c,'NEW WITNESS. SAME PROBLEM.',640,270,YELLOW,27);
  if(event.kind==='guard'&&contact)caption(c,'MY LAWYER HAS ENTERED THE CHAT.',640,286,PAPER,25);
 }
 c.restore();
 // Authored ambient details remain whole objects; no per-limb deformation.
 for(let i=0;i<7;i++){const x=(t*16+i*189)%1360-40,y=650+Math.sin(t*.6+i)*13;c.save();c.translate(x,y);c.rotate(Math.sin(t+i)*.4);c.fillStyle='#e7dabbaa';c.fillRect(-4,-2,8,4);c.restore();}
 if(hitPulse>0){c.fillStyle=`rgba(255,237,173,${hitPulse*.07})`;c.fillRect(0,0,1280,720);}
 caption(c,'SCREENSHOT COURT / JUSTICE IS IN THE COMMENTS',640,697,PAPER,13);
}
