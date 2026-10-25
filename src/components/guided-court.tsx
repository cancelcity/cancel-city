'use client';
import {useEffect,useRef,useState} from 'react';
import {z} from 'zod';
import {matchSchema,takeTurn,type BattleAction} from '../domain/battle';
import {applyTrainingMove,trainingMatch,trainingAllows,trainerAction,TRAINING_LESSONS,type TrainingLesson} from '../domain/duel-training';
import type {CinematicMode} from '../domain/cinematic';
import {DuelArena} from './duel-arena';

const TRAINING_KEY='cancel-city.guided-duel.v1';
const trainingSchema=z.object({match:matchSchema,lesson:z.enum(['attack','spell','after-spell','trap','defend','special','replacement-ready','replace','replacement-attack','done'])});
export function GuidedCourt({paused,cinematicMode,onExit,onPractice}:{paused:boolean;cinematicMode:CinematicMode;onExit:()=>void;onPractice:()=>void}){
 const [state,setState]=useState(()=>({match:trainingMatch('training-preview'),lesson:'attack' as TrainingLesson})),[ready,setReady]=useState(false),[error,setError]=useState(''),current=useRef(state);
 const update=(next:typeof state)=>{current.current=next;setState(next);};
 useEffect(()=>{let next={match:trainingMatch(crypto.randomUUID()),lesson:'attack' as TrainingLesson};try{const raw=localStorage.getItem(TRAINING_KEY);if(raw){const parsed=trainingSchema.safeParse(JSON.parse(raw));if(parsed.success&&parsed.data.match.mode==='practice'&&parsed.data.match.rulesVersion===5)next=parsed.data;}}catch{}update(next);setReady(true);},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(TRAINING_KEY,JSON.stringify(state));window.dispatchEvent(new Event('cancel-city.training-progress'));}catch{}},[state,ready]);
 const {match,lesson}=state,info=TRAINING_LESSONS[lesson],checkpoint=lesson==='replacement-ready'||lesson==='done';
 const commit=async(action?:BattleAction)=>{if(!ready||current.current.match.step!==match.step||current.current.match.id!==match.id)return false;try{const next=action?applyTrainingMove(match,lesson,action):{match:takeTurn(match,'enemy',trainerAction(match)),lesson};update(next);setError('');return true;}catch(e){setError(e instanceof Error?e.message:'Try the highlighted action.');return false;}};
 const restart=()=>{update({match:trainingMatch(crypto.randomUUID()),lesson:'attack'});setError('');};
 return <><div className="duel-training-banner" role="status"><div><small>GUIDED REHEARSAL · {info.number} / 5 · NO REWARDS</small><b>{info.title}</b><p>{match.phase==='enemy'&&lesson!=='done'?'Watch the trainer respond. Your next instruction: ':''}{info.text}</p></div><div>{lesson==='replacement-ready'&&<button className="button acid" disabled={match.phase!=='player'} onClick={()=>update({match:trainingMatch(crypto.randomUUID(),true),lesson:'replace'})}>START REPLACEMENT DRILL →</button>}{lesson==='done'&&<><button className="button magenta" onClick={onExit}>CHOOSE CREW &amp; PLAY FOR REWARDS →</button><button className="button paper" onClick={onPractice}>OPTIONAL: FREE PRACTICE →</button></>}<button onClick={restart}>RESTART LESSONS</button><button onClick={onExit}>BACK TO CREW / DECK</button></div></div>{error&&<p className="duel-local-error" role="alert">{error}</p>}<DuelArena key={match.id} match={match} paused={paused||checkpoint&&match.phase==='player'||lesson==='done'} cinematicMode={cinematicMode} onLeave={onExit} onRematch={restart} training={{lesson,allows:action=>trainingAllows(lesson,action)}} controller={{ready,act:action=>commit(action),enemy:()=>commit(),surrender:async()=>false}}/></>;
}
