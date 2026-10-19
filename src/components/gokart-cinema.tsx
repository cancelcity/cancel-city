'use client';
import Link from 'next/link';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {ArrowLeft,ArrowRight,Expand,Pause,Play,RotateCcw,Volume2,VolumeX} from 'lucide-react';
import defaultFilm from '../data/gokart-film.json';
import type {CinemaFilm} from '../data/layered-films';
import {CityGameHeader,CityGameNavigation} from './game-chrome';
import {useGame} from '../state/store';
import {startMusic,stopMusic} from '../services/music';
import './gokart-cinema.css';

export function GokartCinema({film=defaultFilm,navigation}:{film?:CinemaFilm;navigation?:ReactNode}={}){
 const video=useRef<HTMLVideoElement>(null),screen=useRef<HTMLDivElement>(null);
 const [playing,setPlaying]=useState(false),[muted,setMuted]=useState(true),[slow,setSlow]=useState(false),[time,setTime]=useState(0),[error,setError]=useState(''),[systemReduced,setSystemReduced]=useState(false),[motionAllowed,setMotionAllowed]=useState(false),[still,setStill]=useState(0);
 const preference=useGame(s=>s.save?.settings.motion),volume=useGame(s=>s.save?.settings.volume??.35),soundEnabled=useGame(s=>s.save?.settings.soundEnabled??false);
 const reduced=(preference==='reduced'||systemReduced)&&!motionAllowed;
 const active=[...film.shots].reverse().find(s=>time>=s.start)??film.shots[0];
 const restoreMusic=()=>{setPlaying(false);const settings=useGame.getState().save?.settings;if(settings?.musicEnabled&&!document.hidden)startMusic(settings.volume);};
 useEffect(()=>{const query=window.matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setSystemReduced(query.matches);change();query.addEventListener('change',change);const player=video.current;const hidden=()=>{if(document.hidden)player?.pause();};document.addEventListener('visibilitychange',hidden);return()=>{query.removeEventListener('change',change);document.removeEventListener('visibilitychange',hidden);player?.pause();const settings=useGame.getState().save?.settings;if(settings?.musicEnabled&&!document.hidden)startMusic(settings.volume);};},[film.video]);
 useEffect(()=>{if(video.current)video.current.volume=volume;},[volume,film.video]);
 useEffect(()=>{if(reduced)video.current?.pause();},[reduced,film.video]);
 useEffect(()=>{queueMicrotask(()=>{setTime(0);setPlaying(false);setStill(0);setError('');setSlow(false);});},[film.video]);
 const play=async(at?:number,sound=!muted)=>{const player=video.current;if(!player)return;setError('');if(at!==undefined)player.currentTime=at;player.muted=!sound;player.playbackRate=slow?.5:1;setMuted(!sound);try{await player.play();}catch{setError('Playback could not start. Try the video play control.');}};
 const jump=(index:number)=>{const shot=film.shots[index];setStill(index);setTime(shot.start);if(!reduced)void play(shot.start);};
 const toggleSound=()=>{const next=!muted;setMuted(next);if(video.current)video.current.muted=next;};
 const fullscreen=async()=>{try{if(screen.current?.requestFullscreen)await screen.current.requestFullscreen();else{const player=video.current as (HTMLVideoElement&{webkitEnterFullscreen?:()=>void})|null;player?.webkitEnterFullscreen?.();}}catch{setError('Fullscreen is unavailable here. You can use the video controls.');}};
 return <div className="arcade-shell view-cinema"><a className="skip-link" href="#gokart-film">Skip to special</a><CityGameHeader/><main className="arcade-main gokart-page">
  {navigation}
  <div className="gokart-heading"><div><span className="gokart-eyebrow">CANCEL CITY / SPECIAL PREMIERES</span><h1>{film.title.split(':')[0].toUpperCase()}<span>{film.title.split(':').slice(1).join(':').trim().toUpperCase()}</span></h1></div><p>{(film.tagline??'Unlimited power.\nVery limited legroom.').split('\n').map((line,i)=><span key={line}>{i>0&&<br/>}{line}</span>)}</p></div>
  <section id="gokart-film" className="gokart-theater" aria-label={film.title}>
   <div className="gokart-screen" ref={screen}>
    <video key={film.video} ref={video} controls playsInline preload="metadata" poster={film.poster} muted={muted} hidden={reduced} aria-label={film.title}
     onPlay={()=>{setPlaying(true);stopMusic();}} onPause={restoreMusic} onEnded={restoreMusic} onTimeUpdate={e=>setTime(e.currentTarget.currentTime)} onVolumeChange={e=>setMuted(e.currentTarget.muted)} onError={()=>{restoreMusic();setError('The special could not load. Reload the page to try again.');}}>
     <source src={film.video} type="video/mp4"/><track kind="captions" src={film.captions} srcLang="en" label="English sound captions"/>
    </video>
    {reduced&&<img className="gokart-still" src={film.shots[still].thumbnail} width={1280} height={720} alt={film.shots[still].description}/>}
    {!playing&&time===0&&!reduced&&<button className="gokart-start" onClick={()=>void play(0,soundEnabled)} aria-label={`Play ${film.title}`}><span><Play size={30} fill="currentColor"/></span><b>PLAY SPECIAL</b><small>{film.duration.toFixed(1)} SECONDS</small></button>}
   </div>
   <div className="gokart-toolbar"><div className="gokart-main-controls">{reduced?<button className="gokart-button primary" onClick={()=>setMotionAllowed(true)}><Play size={17}/>ENABLE ANIMATION</button>:<button className="gokart-button primary" onClick={()=>playing?video.current?.pause():void play(time>=film.duration-.1?0:undefined)}>{playing?<Pause size={17}/>:<Play size={17}/>} {playing?'PAUSE':'PLAY'}</button>}<button className="gokart-button" disabled={reduced} onClick={()=>void play(0)} aria-label="Replay special"><RotateCcw size={17}/><span>REPLAY</span></button><button className="gokart-button" aria-pressed={!muted} onClick={toggleSound}>{muted?<VolumeX size={17}/>:<Volume2 size={17}/>}<span>SOUND {muted?'OFF':'ON'}</span></button></div><div className="gokart-secondary-controls"><button className="gokart-button" disabled={reduced} aria-pressed={slow} onClick={()=>{setSlow(!slow);if(video.current)video.current.playbackRate=slow?1:.5;}}>{slow?'½×':'1×'}<span>SPEED</span></button><button className="gokart-button" onClick={()=>void fullscreen()} aria-label="Enter fullscreen"><Expand size={18}/></button><Link className="gokart-button" href="/battle/"><ArrowLeft size={16}/><span>COURT</span></Link></div></div>
   {error&&<p role="alert" className="gokart-error">{error}</p>}
   <div className="gokart-status"><span>{reduced?'STILL-FRAME MODE':active.title.toUpperCase()}</span><span>PREVIEW / NO CARDS OR CHARGE USED</span></div>
  </section>
  <div className="gokart-chapters" aria-label="Choose a shot">{film.shots.map((shot,index)=><button key={shot.id} onClick={()=>jump(index)} className={(reduced?still===index:active.id===shot.id)?'active':''} aria-pressed={reduced?still===index:active.id===shot.id}><img src={shot.thumbnail} alt="" width={384} height={216} loading="lazy"/><span><i>0{index+1}</i><b>{shot.title}</b></span></button>)}</div>
  <div className="gokart-footer"><p><b>ONE ATTACK. AN ENTIRE INCIDENT.</b><br/>Free previews. No cards or charge used.</p><Link href="/cinema/specials/">MORE SPECIAL PREMIERES <ArrowRight size={17}/></Link></div>
  <details className="gokart-transcript"><summary>Read the scene descriptions</summary><ol>{film.shots.map(shot=><li key={shot.id}><b>{shot.title}.</b> {shot.description}</li>)}</ol></details>
 </main><CityGameNavigation active="battle"/></div>;
}
