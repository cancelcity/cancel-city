import {DISTRICTS,takeTurn,type BattleAction,type BattleEvent,type DistrictId,type Match,type Side} from './battle';
export type CourtMode='campaign'|'daily'|'practice';
export function courtUnlocked(id:DistrictId,mode:CourtMode,cleared:readonly DistrictId[]=[]){
 if(mode==='daily')return id==='street';
 if(mode==='practice')return true;
 const index=DISTRICTS.findIndex(d=>d.id===id);
 return index===0||cleared.includes(id)||cleared.includes(DISTRICTS[index-1].id);
}
export function courtDistrict(id:DistrictId,mode:CourtMode,cleared:readonly DistrictId[]=[]):DistrictId{
 return courtUnlocked(id,mode,cleared)?id:'street';
}
export function forecastAction(match:Match,action:BattleAction){
 if(match.phase!=='player')return null;
 try{const after=takeTurn(match,'player',action);return after.events.at(-1)??null;}catch{return null;}
}
export function courtSlots(match:Match,side:Side){
 const active=match[`${side}Active`],direction=side==='player'?1:-1;
 const bench=match[side].map((_,i)=>i).filter(i=>i!==active);
 return match[side].map((fighter,slot)=>{
  const rank=bench.indexOf(slot),lead=slot===active;
  return {fighter,slot,side,lead,x:side==='player'?(lead?430:rank===0?145:260):(lead?850:rank===0?1135:1020),y:lead?649:rank===0?584:553,height:lead?310:rank===0?215:187,width:lead?290:135,direction};
 });
}
// Position interpolation depends on the committed event, not whether the HUD has
// reached impact yet. This prevents a visible teleport when presented state changes.
export function courtPresentationSlots(match:Match,event:BattleEvent|undefined,progress:number){
 const sides=['player','enemy'] as const;
 return sides.flatMap(side=>{
  let from=match[`${side}Active`],to=from,start=0,end=1;
  if(event?.kind==='switch'&&event.side===side){from=event.actor;to=event.target;start=.12;end=.88;}
  if(event?.knockout&&event.targetSide===side){from=event.target;to=match[side].findIndex((f,i)=>i!==from&&f.hp>0);if(to<0)to=from;start=.78;end=1;}
  if(from===to)return courtSlots(match,side);
  const a=courtSlots({...match,[`${side}Active`]:from},side),b=courtSlots({...match,[`${side}Active`]:to},side);
  const t=Math.max(0,Math.min(1,(progress-start)/(end-start))),q=t*t*(3-2*t);
  return a.map((slot,i)=>({...slot,lead:q<.5?slot.lead:b[i].lead,x:slot.x+(b[i].x-slot.x)*q,y:slot.y+(b[i].y-slot.y)*q,height:slot.height+(b[i].height-slot.height)*q,width:slot.width+(b[i].width-slot.width)*q}));
 });
}
