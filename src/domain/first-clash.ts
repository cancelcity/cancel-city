import {roastExchange,type RoastTone} from '../data/roast-script';
import {advanceRoastPractice,freshRoast,type Roast} from './roast';

export const FIRST_CLASH_STORAGE_KEY='cancel-city.first-clash.v1';
export const FIRST_CLASH_ACTOR='CC021';
export const FIRST_CLASH_OPPONENT='CC001';
export const FIRST_CLASH_EXCHANGE='gamer-controller';
const firstSeed=()=>{for(let i=0;i<256;i++){const seed=`first-clash-controller-${i}`;if(roastExchange(0,0,seed).id===FIRST_CLASH_EXCHANGE)return seed;}throw new Error('First clash opening is missing.');};
export const FIRST_CLASH_SEED=firstSeed();
export const clashSeed=(input?:string)=>input&&/^first-clash-controller-\d{1,3}$/.test(input)&&roastExchange(0,0,input).id===FIRST_CLASH_EXCHANGE?input:FIRST_CLASH_SEED;
const TONES=['jab','bait','deadpan'] as const;
export type FirstClashResult={version:1;id:string;seed:string;exchangeId:string;setup:string;reply:string;retort:string;actorId:string;opponentId:string;tone:RoastTone;damage:number;incoming:number;crowd:number;verdict:string};
export type FirstClashSession={version:1;phase:'invite'|'reply'|'result';seed:string;tone?:RoastTone;completed:boolean};
export const freshFirstClashSession=(seed?:string):FirstClashSession=>({version:1,phase:'invite',seed:clashSeed(seed),completed:false});
export function parseFirstClashSession(raw:string|null):FirstClashSession|null{
 try{
  const s:unknown=JSON.parse(raw||'null');
  if(!s||typeof s!=='object')return null;
  const v=s as Record<string,unknown>;
  if(v.version!==1||!['invite','reply','result'].includes(String(v.phase))||typeof v.seed!=='string'||clashSeed(v.seed)!==v.seed||typeof v.completed!=='boolean')return null;
  const tone=TONES.find(t=>t===v.tone);
  if(v.phase==='result'&&!tone||v.phase!=='result'&&tone)return null;
  return {version:1,phase:v.phase as FirstClashSession['phase'],seed:v.seed,...(tone?{tone}:{}),completed:v.completed};
 }catch{return null;}
}
/** An isolated one-exchange demo. It never receives or writes a player Save. */
export function createFirstClash(seed?:string):Roast{
 return freshRoast(clashSeed(seed),[FIRST_CLASH_ACTOR,'CC026','CC023'],'steady',new Date('2026-01-01T00:00:00Z'),2);
}
export function resolveFirstClash(tone:RoastTone,seed?:string){
 if(!TONES.includes(tone))throw new Error('Choose one of the three replies.');
 const before=createFirstClash(seed),exchange=roastExchange(0,0,before.id),now=new Date('2026-01-01T00:00:01Z');
 const playerBeat=advanceRoastPractice(before,{type:'roast-act',matchId:before.id,step:0,action:{type:'reply',tone}},now);
 const after=playerBeat.phase==='enemy'?advanceRoastPractice(playerBeat,{type:'roast-enemy',matchId:playerBeat.id,step:playerBeat.step},now):playerBeat;
 const line=playerBeat.events[0],result:FirstClashResult={
  version:1,id:`${before.id}:${tone}`,seed:before.id,exchangeId:exchange.id,
  setup:exchange.setup,reply:line.reply!,retort:line.retort!,actorId:FIRST_CLASH_ACTOR,opponentId:FIRST_CLASH_OPPONENT,tone,
  damage:before.enemyHp-after.enemyHp,incoming:before.team[0].hp-after.team[0].hp,crowd:after.crowd,
  verdict:tone==='jab'?'ZERO FILTER.':tone==='bait'?'PROFESSIONAL INSTIGATOR.':'DEADPAN MENACE.',
 };
 return {before,playerBeat,after,result};
}
