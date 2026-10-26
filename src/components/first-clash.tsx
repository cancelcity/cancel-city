'use client';
import dynamic from 'next/dynamic';
import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {useCityMotion} from './city-motion';
import {ArrowRight,Crown,Mic,RotateCcw,VolumeX} from 'lucide-react';
import {CARD_BY_ID} from '../data/cards';
import {roastExchange,type RoastTone} from '../data/roast-script';
import {clashSeed,createFirstClash,FIRST_CLASH_ACTOR,FIRST_CLASH_OPPONENT,FIRST_CLASH_STORAGE_KEY,freshFirstClashSession,parseFirstClashSession,resolveFirstClash,type FirstClashResult,type FirstClashSession} from '../domain/first-clash';

const Stage=dynamic(()=>import('./live-canvas').then(m=>m.LiveCanvas),{ssr:false});
const TONE_COPY={jab:'GO FOR THE THROAT',bait:'MAKE HIM SAY MORE',deadpan:'KEEP A STRAIGHT FACE'} as const;
type Props={onContinue:()=>void;onBegin?:()=>void;onExplore?:()=>void;onResult?:(result:FirstClashResult)=>void;renderShare?:(result:FirstClashResult)=>ReactNode;initialChallenge?:string};

export function FirstClash({onContinue,onBegin,onExplore,onResult,renderShare,initialChallenge}:Props){
 const [session,setSession]=useState<FirstClashSession>(()=>freshFirstClashSession(initialChallenge)),[loaded,setLoaded]=useState(false),[stageReady,setStageReady]=useState(false),[animating,setAnimating]=useState(false),[progress,setProgress]=useState(1),[storageWarning,setStorageWarning]=useState(false);
 const reduced=useCityMotion(),answerLock=useRef(false),notified=useRef(''),resultCallback=useRef(onResult),beginCallback=useRef(onBegin),resultHeading=useRef<HTMLHeadingElement>(null);
 resultCallback.current=onResult;beginCallback.current=onBegin;
 useEffect(()=>{
  try{const saved=parseFirstClashSession(localStorage.getItem(FIRST_CLASH_STORAGE_KEY));if(saved&&(!initialChallenge||saved.seed===clashSeed(initialChallenge)))setSession(saved);}catch{setStorageWarning(true);}
  setLoaded(true);
 },[initialChallenge]);
 useEffect(()=>{if(!loaded)return;try{localStorage.setItem(FIRST_CLASH_STORAGE_KEY,JSON.stringify(session));}catch{setStorageWarning(true);}},[session,loaded]);
 const resolution=useMemo(()=>session.tone?resolveFirstClash(session.tone,session.seed):null,[session.tone,session.seed]),result=resolution?.result;
 useEffect(()=>{if(loaded&&session.phase!=='invite')beginCallback.current?.();},[loaded,session.phase]);
 useEffect(()=>{if(!result||notified.current===result.id)return;notified.current=result.id;resultCallback.current?.(result);},[result]);
 useEffect(()=>{
  if(!animating)return;
  if(reduced){setProgress(1);setAnimating(false);return;}
  let frame=0;const start=performance.now();
  const tick=(now:number)=>{const p=Math.min(1,(now-start)/620);setProgress(p);if(p<1)frame=requestAnimationFrame(tick);else setAnimating(false);};
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[animating,reduced]);
 useEffect(()=>{if(session.phase==='result'&&!animating)resultHeading.current?.focus({preventScroll:true});},[session.phase,animating]);
 const begin=()=>{onBegin?.();setSession(s=>({...s,phase:'reply'}));};
 const answer=(tone:RoastTone)=>{if(answerLock.current||session.phase!=='reply')return;answerLock.current=true;setProgress(reduced?1:0);setAnimating(!reduced);setSession(s=>({...s,phase:'result',tone}));};
 const replay=()=>{answerLock.current=false;setAnimating(false);setProgress(1);setSession(s=>({...s,phase:'reply',tone:undefined,completed:false}));};
 const leave=(packs:boolean)=>{const next={...session,completed:true};try{localStorage.setItem(FIRST_CLASH_STORAGE_KEY,JSON.stringify(next));}catch{}setSession(next);if(packs)onContinue();else(onExplore??onContinue)();};
 const isInvite=session.phase==='invite',showResult=session.phase==='result'&&!animating,exchange=roastExchange(0,0,session.seed),opponent=CARD_BY_ID[FIRST_CLASH_OPPONENT];
 const roast=resolution?(animating?resolution.playerBeat:resolution.after):createFirstClash(session.seed),event=animating?resolution?.playerBeat.events[0]:resolution?.after.events.at(-1);
 return <main className={`first-clash phase-${session.phase} ${stageReady?'stage-ready':''} ${animating?'is-acting':''}`}>
  <header className="first-clash-header"><a href="/" aria-label="Cancel City"><img src="/assets/reference/title-logo.webp" width="720" height="420" alt="Cancel City"/></a><span><Crown size={16}/>EVERYONE IS THE PROBLEM.</span><small><VolumeX size={14}/>SOUND OFF</small></header>
  <div className="first-clash-layout">
   <section className="first-clash-stage" aria-label={`${opponent.name} is heckling you at the basement club`}>
    <div className="first-clash-scene-fallback" aria-hidden="true"><img className="clash-opponent-portrait" src={opponent.art} alt=""/><img className="clash-player-portrait" src={CARD_BY_ID[FIRST_CLASH_ACTOR].art} alt=""/></div>
    {!isInvite&&<Stage className="first-clash-canvas" onReady={()=>setStageReady(true)} scene={{kind:'roast',roast,event,progress,reduced,finale:false,time:0}} idle={false}/>} 
    <div className="first-clash-stage-tag"><i/>BASEMENT CLUB / ONE EXCHANGE</div>
    <div className="first-clash-stage-caption"><span>{showResult?'YOUR FIRST IMPRESSION':isInvite?'MEET THE LOCALS':'YOU HAVE THE MIC'}</span><h1>{showResult?'THAT’S YOUR\nREPUTATION NOW.':isInvite?'HE’S ALREADY\nTALKING SHIT.':'MAKE IT\nHIS PROBLEM.'}</h1></div>
    {animating&&<span className="first-clash-impact" aria-hidden="true">THAT LANDED.</span>}
   </section>
   <section className="first-clash-interaction" aria-label={showResult?'Your exchange result':'Choose your comeback'}>
    {isInvite?<><span className="clash-eyebrow"><Mic size={15}/>YOUR FIRST BAD IMPRESSION</span><p className="clash-speaker">{opponent.name}</p><blockquote>“{exchange.setup}”</blockquote><p className="clash-intro-copy">He’s got a microphone and absolutely no self-awareness.<br/>Say something back.</p><button type="button" className="clash-primary" disabled={!loaded} onClick={begin}>PLAY FREE <ArrowRight size={22}/></button><p className="clash-free-note">No login. Pick a reply. See what happens.</p></>:showResult&&result?<><span className="clash-eyebrow">YOUR COMEBACK / YOUR REPUTATION</span><h2 ref={resultHeading} tabIndex={-1} className="clash-verdict">{result.verdict}</h2><div className="clash-receipt"><span>YOU SAID</span><q>{result.reply}</q><div className="clash-retort"><img src={opponent.art} alt=""/><p>{result.retort}</p></div><dl><div><dt>HIS COMPOSURE</dt><dd>−{result.damage}</dd></div><div><dt>YOUR COMPOSURE</dt><dd>−{result.incoming}</dd></div><div><dt>THE ROOM</dt><dd>{result.crowd>=0?'+':''}{result.crowd}</dd></div></dl></div><p className="clash-result-note">One exchange. Not a full show. Your first five fighters are waiting.</p><div className="clash-result-actions"><button className="clash-primary" type="button" onClick={()=>leave(true)}>OPEN YOUR FREE PACK <ArrowRight size={20}/></button><button className="clash-replay" type="button" onClick={replay}><RotateCcw size={14}/>TRY ANOTHER REPLY</button></div>{renderShare?.(result)}</>:<><span className="clash-eyebrow"><Mic size={15}/>HE SAID THIS. YOUR TURN.</span><p className="clash-speaker">{opponent.name}</p><blockquote>“{exchange.setup}”</blockquote><div className="clash-replies" aria-label="Three ways to answer">{exchange.responses.map(response=><button type="button" key={response.id} disabled={session.phase!=='reply'||animating} onClick={()=>answer(response.id)}><span>{TONE_COPY[response.id]}</span><q>{response.line}</q><ArrowRight size={18}/></button>)}</div><p className="clash-free-note">{animating?'He’s trying to come back from that.':'Choose the actual words you want to say.'}</p></>}
    <button className="clash-explore" type="button" onClick={()=>leave(false)}>EXPLORE THE GAME <ArrowRight size={14}/></button>
    {storageWarning&&<small className="clash-storage-note" role="status">This browser cannot keep your intro result after you leave.</small>}
   </section>
  </div>
  <footer className="first-clash-footer"><span>COLLECT THE WORST. PUT THEM TO WORK.</span><span>CARDS · TACTICAL BATTLES · ROAST NIGHT · YOUR CITY</span></footer>
 </main>;
}
