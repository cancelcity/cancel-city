'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {chooseEnemyAction,createMatch,matchSchema,surrender,takeTurn,type BattleAction,type DistrictId,type Match} from '../domain/battle';
import type {CinematicMode} from '../domain/cinematic';
import {DuelArena} from './duel-arena';

const PRACTICE_KEY='cancel-city.practice-duel.v1';
export function PracticeCourt({team,district,paused,cinematicMode,onExit,resume=true}:{team:string[];district:DistrictId;paused:boolean;cinematicMode:CinematicMode;onExit:()=>void;resume?:boolean}){
 const [match,setMatch]=useState(()=>createMatch('practice-pending',district,team,{version:5,mode:'practice'})),[ready,setReady]=useState(false),[error,setError]=useState<string|null>(null),current=useRef<Match>(match);
 useEffect(()=>{
  let next:Match|null=null;
  try{const raw=localStorage.getItem(PRACTICE_KEY);if(resume&&raw){const parsed=matchSchema.safeParse(JSON.parse(raw));if(parsed.success&&parsed.data.rulesVersion===5&&parsed.data.mode==='practice')next=parsed.data;}}catch{}
  next??=createMatch(crypto.randomUUID(),district,team,{version:5,mode:'practice'});current.current=next;setMatch(next);setReady(true);
  // A practice mount resumes its independent save, never the account's battle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(PRACTICE_KEY,JSON.stringify(match));}catch{/* Practice remains playable when browser storage is unavailable. */}},[match,ready]);
 const commit=useCallback(async(kind:'player'|'enemy'|'surrender',action?:BattleAction)=>{
  if(!ready||current.current.id!==match.id||current.current.step!==match.step)return false;
  try{
   const before=current.current,next=kind==='surrender'?surrender(before):takeTurn(before,kind,kind==='enemy'?chooseEnemyAction(before):action!);
   current.current=next;setMatch(next);setError(null);return true;
  }catch(e){setError(e instanceof Error?e.message:'That move is unavailable.');return false;}
 },[match.id,match.step,ready]);
 const rematch=()=>{const next=createMatch(crypto.randomUUID(),match.districtId,match.player.map(f=>f.cardId),{version:5,mode:'practice'});current.current=next;setMatch(next);setError(null);};
 return <><div className="duel-practice-banner"><div><b>PRACTICE · LOCAL SAVE</b><span>No login or rewards. Your account and Roast Night are unchanged.</span></div><button onClick={onExit}>BACK TO MY ACCOUNT</button></div>{error&&<p className="duel-local-error" role="alert">{error}</p>}<DuelArena key={match.id} match={match} paused={paused} cinematicMode={cinematicMode} onLeave={onExit} onRematch={rematch} controller={{ready,act:action=>commit('player',action),enemy:()=>commit('enemy'),surrender:()=>commit('surrender')}}/></>;
}
