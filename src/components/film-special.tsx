'use client';
import {createPortal} from 'react-dom';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Film,Play,SkipForward,Volume2,VolumeX} from 'lucide-react';
import type {SpecialPlayback} from '../domain/cinematic';
import type {LayeredFilm} from '../data/layered-films';
import {CARD_BY_ID} from '../data/cards';
import {useGame} from '../state/store';
import {startMusic,stopMusic} from '../services/music';
import {specialOutcome} from './live-scene-painter';
import './layered-cinema.css';

export function FilmSpecial({film,playback,onImpact,onComplete,onFallback,initialMuted=false}:{film:LayeredFilm;playback:SpecialPlayback;onImpact:()=>void;onComplete:()=>void;onFallback:()=>void;initialMuted?:boolean}){
 const dialog=useRef<HTMLDialogElement>(null),video=useRef<HTMLVideoElement>(null),callbacks=useRef({onImpact,onComplete,onFallback});
 const settings=useGame(s=>s.save?.settings),[muted,setMuted]=useState(initialMuted),[blocked,setBlocked]=useState(false),[waiting,setWaiting]=useState(true),[hidden,setHidden]=useState(false),[time,setTime]=useState(0);
 const started=useRef(false),resume=useRef(false),failed=useRef(false),finished=useRef(false),lastMovement=useRef(0),lastTime=useRef(0);
 useLayoutEffect(()=>{callbacks.current={onImpact,onComplete,onFallback};});
 const finish=()=>{if(finished.current)return;finished.current=true;video.current?.pause();callbacks.current.onComplete();};
 const fallback=()=>{if(failed.current||finished.current)return;failed.current=true;video.current?.pause();callbacks.current.onFallback();};
 const play=()=>{const player=video.current;if(!player)return;setBlocked(false);void player.play().catch(()=>{if(!finished.current&&!failed.current)setBlocked(true);});};
 useEffect(()=>{const player=video.current;if(player){player.volume=settings?.volume??.35;player.muted=muted||!settings?.soundEnabled;}},[muted,settings?.volume,settings?.soundEnabled]);
 useEffect(()=>{
  const el=dialog.current,player=video.current;if(!el||!player)return;el.showModal();let frame=0;
  lastMovement.current=performance.now();
  const visibility=()=>{setHidden(document.hidden);lastMovement.current=performance.now();if(document.hidden){resume.current=!player.paused;player.pause();}else if(resume.current){resume.current=false;void player.play().catch(()=>setBlocked(true));}};
  document.addEventListener('visibilitychange',visibility);
  const tick=(now:number)=>{
   if(finished.current||failed.current)return;
   if(!document.hidden){
    if(player.currentTime!==lastTime.current){lastTime.current=player.currentTime;lastMovement.current=now;}
    if(player.currentTime>=film.impact)callbacks.current.onImpact();
    if((!started.current||!player.paused)&&now-lastMovement.current>8000){fallback();return;}
   }
   frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);play();
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);player.pause();el.close();const s=useGame.getState().save?.settings;if(s?.musicEnabled&&!document.hidden)startMusic(s.volume);};
 // The component is keyed by the committed event. Callbacks and settings use refs.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[film.video,film.impact]);
 const actor=CARD_BY_ID[playback.cardId];
 return createPortal(<dialog ref={dialog} className="special-cinematic layered-film-dialog" aria-label={`${actor.name}: ${actor.ability}`} onCancel={event=>{event.preventDefault();finish();}}>
  <div className="cinema-controls"><span><Film size={16}/>{playback.preview?'SPECIAL PREVIEW':playback.side==='player'?'YOUR SPECIAL ATTACK':'ENEMY SPECIAL ATTACK'}</span><div>{settings?.soundEnabled?<button onClick={()=>setMuted(!muted)} aria-pressed={muted} aria-label={muted?'Unmute cinematic':'Mute cinematic'}>{muted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button>:<span className="cinema-sound-off"><VolumeX size={16}/>SOUND OFF</span>}<button className="cinema-skip" autoFocus onClick={finish}><SkipForward size={18}/>SKIP</button></div></div>
  <div className="live-special-screen layered-film-screen"><video key={film.video} ref={video} src={film.video} poster={film.poster} playsInline preload="auto" muted={muted||!settings?.soundEnabled} aria-label={film.title}
   onPlaying={()=>{started.current=true;setWaiting(false);setBlocked(false);stopMusic();lastMovement.current=performance.now();}} onPause={()=>{if(started.current&&!finished.current&&!failed.current&&!document.hidden)setBlocked(true);}} onWaiting={()=>setWaiting(true)} onCanPlay={()=>setWaiting(false)} onEnded={finish} onError={fallback} onTimeUpdate={e=>setTime(e.currentTarget.currentTime)}>
   <track kind="captions" src={film.captions} srcLang="en" label="English scene captions"/>
  </video>
   {waiting&&!blocked&&!hidden&&<span className="live-scene-loading" role="status">SETTING THE SCENE…</span>}
   {blocked&&<button className="layered-film-start" onClick={play}><Play size={26}/>PLAY SPECIAL</button>}
   {hidden&&<span className="live-scene-loading">PAUSED</span>}
   {time>=film.impact&&!playback.preview&&<div className="live-special-result">{playback.knockout?'CANCELLED':actor.ability.toUpperCase()} · {specialOutcome(playback)}{playback.passive?` · ${playback.passive}`:''}</div>}
  </div>
  <div className="cinema-bottom"><span>{actor.name.toUpperCase()}</span><div className="cinema-progress" aria-hidden="true"><i style={{width:`${Math.min(100,time/film.duration*100)}%`}}/></div><span>ESC TO SKIP</span></div>
  <p className="sr-only" role="status">{playback.preview?`Preview of ${actor.name}'s ${actor.ability}.`:`${actor.name} uses ${playback.title}. ${playback.damage} damage. ${playback.heal} composure restored.`}</p>
 </dialog>,document.body);
}
