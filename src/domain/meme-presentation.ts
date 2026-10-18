import {CARD_BY_ID,RARITIES} from '../data/cards';
import type {Pull} from './game';
import type {SpecialPlayback} from './cinematic';

export const MEME_SPECIALS={CC001:{kind:'disconnect',title:'CONTROLLER DISCONNECTED',caption:'THE THROW WAS PHYSICAL.',shots:['charge','disconnect','throw','contact','cope']},CC026:{kind:'complaints',title:'CUSTOMER CARE FINAL BOSS',caption:'SHE ESCALATED TO HERSELF.',shots:['review','tickets','mods','contact','manager']},CC046:{kind:'rent',title:'THIS ARENA IS NOW A RENTAL',caption:'RENT FOR THE HEALTH BAR.',shots:['listing','fees','lease','contact','invoice']}} as const;
export type MemeSpecialId=keyof typeof MEME_SPECIALS;
export function memeSpecialId(id:string):MemeSpecialId|null{return Object.hasOwn(MEME_SPECIALS,id)?id as MemeSpecialId:null;}
export function memeShot(id:MemeSpecialId,progress:number,reduced=false){const p=reduced?1:Math.max(0,Math.min(1,progress)),cuts=id==='CC001'?[.39,.50,.6875,.86]:[.23,.46,.6875,.86];return MEME_SPECIALS[id].shots[cuts.filter(t=>p>=t).length];}
export function memeVerdict(a:SpecialPlayback){if(a.preview)return 'SCENE PREVIEW';if(a.support)return 'SUPPORT APPLIED';if(a.cardId==='CC026')return a.knockout?'PERMANENTLY BANNED':'WARNING ISSUED';if(a.cardId==='CC046')return a.knockout?'EVICTED':'RENT INCREASED';return a.knockout?'ACCIDENTAL KO':'ACCIDENTAL SKILL';}
export type PullReaction='duplicate'|'rare'|'common'|'resident';
export function pullReaction(pick:Pick<Pull,'cardId'|'isNewDiscovery'>):PullReaction{if(!pick.isNewDiscovery)return 'duplicate';const rank=RARITIES.findIndex(r=>r.id===CARD_BY_ID[pick.cardId].rarity);return rank>=2?'rare':rank===0?'common':'resident';}
export function selectPullReaction(pulls:readonly Pull[]):Pull|null{if(!pulls.length)return null;return [...pulls].sort((a,b)=>{const score=(p:Pull)=>{const rank=RARITIES.findIndex(r=>r.id===CARD_BY_ID[p.cardId].rarity);return rank>=3?20+rank:!p.isNewDiscovery?15:rank>=2?10+rank:rank===0?5:1;};return score(b)-score(a)||a.slot-b.slot;})[0];}
export function pullFilmDuration(pick:Pick<Pull,'cardId'|'isNewDiscovery'>){return {duplicate:2000,rare:2700,common:1500,resident:1800}[pullReaction(pick)];}
export type MemeCue='disconnect'|'ticket'|'cash';
export function memeCues(cardId:string,progress:number):{key:string;cue:MemeCue;at:number}[]{if(cardId==='CC001')return progress>=.39?[{key:'disconnect',cue:'disconnect',at:.39}]:[];if(cardId==='CC026'||cardId==='CC046')return [.24,.31,.38,.44].flatMap((t,i)=>progress>=t?[{key:`${cardId}:${i}`,at:t,cue:cardId==='CC026'?'ticket' as const:'cash' as const}]:[]);return [];}
