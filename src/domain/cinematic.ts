import {PROP_BY_ID} from '../data/props';
import {CARD_BY_ID} from '../data/cards';
import {KITS} from '../data/combat-kit';
import {SPECIAL_TIMING,specialAt} from '../data/specials';
import {BattleEvent,Match,Side} from './battle';
import {actionTiming} from './action-presentation';
export type CinematicMode='full'|'quick'|'off';
export type CinematicPhase='entrance'|'windup'|'launch'|'impact'|'verdict';
export interface SceneTiming {full:number;impact:number;short:number;shortImpact:number;reduced:number;reducedImpact:number;normal:number}
export interface SpecialPlayback {key:string;cardId:string;targetId:string;side:Side;damage:number;heal:number;knockout:boolean;preview:boolean;step:number;title:string;passive:string;propId:string|null;support:boolean;duoId:string|null;partnerId:string|null}
export const shouldPlaySpecial=(match:Match,completedStep:number,mode:CinematicMode,paused=false)=>!paused&&mode!=='off'&&completedStep<match.step&&match.events.at(-1)?.kind==='ability';
export function specialPlayback(match:Match,event:BattleEvent,propId:string|null=null):SpecialPlayback{
 if(event.kind!=='ability'||event.step!==match.step)throw new Error('A cinematic requires the current committed ability event');
 const actor=match[event.side][event.actor],target=match[event.targetSide][event.target];
 if(!actor||!target)throw new Error('Invalid cinematic participant');
 specialAt(actor.cardId);
 return {key:`${match.id}:${event.step}`,cardId:actor.cardId,targetId:target.cardId,side:event.side,damage:event.damage,heal:event.heal,knockout:event.knockout,preview:false,duoId:event.duoId,partnerId:event.partnerId,support:event.targetSide===event.side,step:event.step,title:event.title,passive:event.passive,propId:propId&&Object.hasOwn(PROP_BY_ID,propId)?propId:null};
}
export function previewSpecial(cardId:string,propId:string|null=null):SpecialPlayback{
 specialAt(cardId);const card=CARD_BY_ID[cardId],kit=KITS[cardId],support=!kit.bonus&&!!(kit.heal||kit.teamHeal);
 return {key:`preview:${cardId}`,cardId,targetId:support?cardId:cardId==='CC003'?'CC008':'CC003',side:'player',damage:0,heal:0,knockout:false,preview:true,support,duoId:null,partnerId:null,step:0,title:card.ability.toUpperCase(),passive:'',propId:propId&&Object.hasOwn(PROP_BY_ID,propId)?propId:null};
}
export function cinematicDuration(mode:CinematicMode,reduced:boolean,timing:SceneTiming=SPECIAL_TIMING){return reduced?timing.reduced:mode==='off'?0:mode==='quick'?timing.short:timing.full;}
export function cinematicImpactAt(mode:CinematicMode,reduced:boolean,timing:SceneTiming=SPECIAL_TIMING){return reduced?timing.reducedImpact:mode==='off'?0:mode==='quick'?timing.shortImpact:timing.impact;}
export function cinematicFrame(elapsed:number,mode:CinematicMode,reduced:boolean,timing:SceneTiming=SPECIAL_TIMING){
 const duration=cinematicDuration(mode,reduced,timing),progress=duration?Math.min(1,Math.max(0,elapsed)/duration):1;
 const impact=elapsed>=cinematicImpactAt(mode,reduced,timing),phase:CinematicPhase=reduced?'verdict':progress<.23?'entrance':progress<.46?'windup':!impact?'launch':progress<.86?'impact':'verdict';
 return {progress,phase,impact,complete:progress>=1};
}
export function visualActionDelay(kind:BattleEvent['kind']|undefined,mode:CinematicMode,reduced:boolean){return cinematicDuration(mode,reduced,kind==='ability'?SPECIAL_TIMING:actionTiming(kind));}
export class CinematicClock{
 elapsed=0;private impacted=false;private finished=false;
 constructor(private mode:CinematicMode,private reduced:boolean,private timing:SceneTiming=SPECIAL_TIMING){}
 configure(mode:CinematicMode,reduced:boolean){this.mode=mode;this.reduced=reduced;}
 private transition(){const frame=cinematicFrame(this.elapsed,this.mode,this.reduced,this.timing),emitImpact=frame.impact&&!this.impacted,emitComplete=frame.complete&&!this.finished;if(emitImpact)this.impacted=true;if(emitComplete)this.finished=true;return {frame,emitImpact,emitComplete};}
 tick(delta:number,paused=false){if(paused)return {frame:cinematicFrame(this.elapsed,this.mode,this.reduced,this.timing),emitImpact:false,emitComplete:false};if(!this.finished&&Number.isFinite(delta))this.elapsed+=Math.min(80,Math.max(0,delta));return this.transition();}
 skip(){this.elapsed=cinematicDuration(this.mode,this.reduced,this.timing);return this.transition();}
}
