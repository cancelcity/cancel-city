'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {chooseEnemyAction,createMatch,districtOf,matchSchema,surrender,takeTurn,type BattleAction,type DistrictId,type Match} from '../domain/battle';
import {allTactics,type DuelCardId} from '../domain/duel-rules';
import type {CinematicMode} from '../domain/cinematic';
import {DuelArena} from './duel-arena';
import {CARD_BY_ID} from '../data/cards';

const PRACTICE_KEY='cancel-city.practice-duel.v1';
export function PracticeCourt({deckReady,tacticDeck,team,district,paused,cinematicMode,onExit,onCampaign,resume=true}:{deckReady:boolean;tacticDeck:DuelCardId[];team:string[];district:DistrictId;paused:boolean;cinematicMode:CinematicMode;onExit:()=>void;onCampaign:()=>void;resume?:boolean}){
 const [match,setMatch]=useState(()=>createMatch('practice-pending',district,team,{version:5,mode:'practice'})),[ready,setReady]=useState(false),[savedPractice,setSavedPractice]=useState<Match|null>(null),[error,setError]=useState<string|null>(null),[storageFailed,setStorageFailed]=useState(false),current=useRef<Match>(match);
 const loadPractice=(next:Match)=>{current.current=next;setMatch(next);setSavedPractice(null);setError(null);setReady(true);};
 useEffect(()=>{
  if(!deckReady)return;
  let next:Match|null=null;
  try{const raw=localStorage.getItem(PRACTICE_KEY);if(raw){const parsed=matchSchema.safeParse(JSON.parse(raw));if(parsed.success&&parsed.data.rulesVersion===5&&parsed.data.mode==='practice'){if(parsed.data.phase!=='finished'){setSavedPractice(parsed.data);return;}if(resume)next=parsed.data;}}}catch{}
  next??=createMatch(crypto.randomUUID(),district,team,{version:5,mode:'practice',tacticDeck});loadPractice(next);
  // A practice mount resumes its independent save, never the account's battle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[deckReady]);
 useEffect(()=>{if(!ready)return;try{localStorage.setItem(PRACTICE_KEY,JSON.stringify(match));setStorageFailed(false);}catch{setStorageFailed(true);return;}window.dispatchEvent(new Event('cancel-city.practice-progress'));},[match,ready]);
 const commit=useCallback(async(kind:'player'|'enemy'|'surrender',action?:BattleAction)=>{
  if(!ready||current.current.id!==match.id||current.current.step!==match.step)return false;
  try{
   const before=current.current,next=kind==='surrender'?surrender(before):takeTurn(before,kind,kind==='enemy'?chooseEnemyAction(before):action!);
   current.current=next;setMatch(next);setError(null);return true;
  }catch(e){setError(e instanceof Error?e.message:'That move is unavailable.');return false;}
 },[match.id,match.step,ready]);
 const rematch=()=>{const next=createMatch(crypto.randomUUID(),match.districtId,match.player.map(f=>f.cardId),{version:5,mode:'practice',tacticDeck:allTactics(match.duel!.player)});current.current=next;setMatch(next);setError(null);};
 if(savedPractice)return <section className="duel-practice-choice"><span className="tape yellow">YOUR PRACTICE IS SAVED</span><h2>RESUME OR START FRESH?</h2><p><b>{districtOf(savedPractice.districtId).name}</b> · {savedPractice.player.map(f=>CARD_BY_ID[f.cardId].name).join(' / ')} · {savedPractice.duel!.player.lp} LP</p><button className="button acid" onClick={()=>loadPractice(savedPractice)}>RESUME SAVED CREW & DECK →</button><p>Or use the crew and twelve tactics currently selected in the lobby:</p><p><b>{team.map(id=>CARD_BY_ID[id].name).join(' / ')}</b></p><button className="button magenta" onClick={()=>loadPractice(createMatch(crypto.randomUUID(),district,team,{version:5,mode:'practice',tacticDeck}))}>NEW PRACTICE WITH THIS CREW & DECK →</button><small>Starting fresh replaces this browser’s practice. Your account battle, collection and Roast Night stay saved.</small><button className="button paper" onClick={onExit}>BACK TO CREW & DECK</button></section>;
 return <><div className="duel-practice-banner"><div><b>{storageFailed?'PRACTICE · NOT SAVED':'PRACTICE · LOCAL SAVE'}</b><span>No login or rewards. Your account and Roast Night are unchanged.</span></div><button onClick={onExit}>{storageFailed?'RETURN TO CREW':'SAVE & RETURN TO CREW'}</button></div>{storageFailed&&<p className="duel-local-error" role="status">This browser could not save your practice. You can keep playing, but your latest moves may be lost if you leave or refresh.</p>}{error&&<p className="duel-local-error" role="alert">{error}</p>}<DuelArena key={match.id} match={match} paused={paused} cinematicMode={cinematicMode} onCampaign={onCampaign} onLeave={onExit} onRematch={rematch} controller={{ready,act:action=>commit('player',action),enemy:()=>commit('enemy'),surrender:()=>commit('surrender')}}/></>;
}
