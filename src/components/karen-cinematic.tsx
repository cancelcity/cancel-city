'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Film,SkipForward,Volume2,VolumeX} from 'lucide-react';
import {CinematicClock,type CinematicMode,type SpecialPlayback} from '../domain/cinematic';
import {KAREN_TIMING,karenState,karenCuesBetween} from '../domain/karen-direction';
import {karenDisplayList} from './karen-renderer';
import {createKarenRenderer,type KarenRenderer} from './karen-pixi';
import {playKarenCue,unlockKarenAudio} from '../services/karen-audio';
import {useGame} from '../state/store';
import {useCityMotion} from './city-motion';
import {startMusic,stopMusic} from '../services/music';

export function KarenCinematic({playback,mode='full',onImpact,onComplete,initialMuted=false,soundRequested=false}:{playback:SpecialPlayback;mode?:CinematicMode;onImpact?:()=>void;onComplete:()=>void;initialMuted?:boolean;soundRequested?:boolean}){
 const reduced=useCityMotion(),settings=useGame(s=>s.save?.settings),[muted,setMuted]=useState(initialMuted||!(soundRequested||settings?.soundEnabled)),[status,setStatus]=useState('LOADING THE SET'),[error,setError]=useState(''),[impact,setImpact]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null),host=useRef<HTMLDivElement>(null),bar=useRef<HTMLDivElement>(null),clock=useRef(new CinematicClock(mode,reduced,KAREN_TIMING)),done=useRef(false),hit=useRef(false),sounds=useRef<(()=>void)[]>([]),current=useRef({mode,reduced,muted,volume:settings?.volume??.45,onImpact,onComplete});
 useLayoutEffect(()=>{current.current={mode,reduced,muted,volume:settings?.volume??.45,onImpact,onComplete};});
 const stopAudio=()=>{for(const stop of sounds.current)stop();sounds.current=[];};
 const finish=()=>{if(done.current)return;done.current=true;clock.current.skip();if(!hit.current){hit.current=true;current.current.onImpact?.();}stopAudio();current.current.onComplete();};
 useEffect(()=>{const el=dialog.current;el?.showModal();stopMusic();if(soundRequested||settings?.soundEnabled)unlockKarenAudio();return()=>{el?.close();stopAudio();const saved=useGame.getState().save?.settings;if(saved?.musicEnabled&&!document.hidden)startMusic(saved.volume);};},[]);
 useEffect(()=>{
  let alive=true,renderer:KarenRenderer|undefined,request=0,last=performance.now(),previous=-1,lastShot='',timer:ReturnType<typeof setTimeout>|undefined;const fired=new Set<string>();
  const hidden=()=>{last=performance.now();if(document.hidden){stopAudio();setStatus('PAUSED');}else lastShot='';};document.addEventListener('visibilitychange',hidden);
  timer=setTimeout(()=>{if(alive)setError('The scene is taking longer to load. You can skip safely.');},8000);
  const tick=(now:number)=>{
   if(!alive||done.current)return;const c=current.current;clock.current.configure(c.mode,c.reduced);const result=clock.current.tick(now-last,document.hidden);last=now;
   if(!document.hidden){const s=karenState(result.frame.progress,c.mode,c.reduced);renderer?.render(karenDisplayList(result.frame.progress,c.mode,c.reduced,playback.targetId));if(bar.current)bar.current.style.width=`${result.frame.progress*100}%`;
    if(s.shot!==lastShot){lastShot=s.shot;setStatus(c.reduced?'REDUCED MOTION':c.mode==='quick'?'QUICK REPLAY':'RECEIPT APOCALYPSE / DIRECTOR’S CUT');}
    if(!c.reduced)for(const cue of karenCuesBetween(previous,s.time,c.mode))if(!fired.has(cue.id)){fired.add(cue.id);if(!c.muted)sounds.current.push(playKarenCue(cue.file,c.volume));}previous=s.time;
   }
   if(result.emitImpact&&!hit.current){hit.current=true;setImpact(true);c.onImpact?.();}
   if(result.emitComplete){done.current=true;stopAudio();c.onComplete();return;}request=requestAnimationFrame(tick);
  };
  void createKarenRenderer(host.current!,playback.targetId).then(r=>{clearTimeout(timer);if(!alive){r.destroy();return;}renderer=r;setError('');setStatus(r.gpu?'RECEIPT APOCALYPSE / PIXIJS':'RECEIPT APOCALYPSE / COMPATIBILITY');last=performance.now();request=requestAnimationFrame(tick);}).catch(()=>{clearTimeout(timer);if(alive){setError('The cinematic could not load. Skip to continue; your battle result is already saved.');setStatus('SCENE UNAVAILABLE');}});
  return()=>{alive=false;clearTimeout(timer);cancelAnimationFrame(request);document.removeEventListener('visibilitychange',hidden);renderer?.destroy();stopAudio();};
 },[playback.key,playback.targetId]);
 return createPortal(<dialog ref={dialog} className="special-cinematic karen-cinematic" aria-label="Karen’s Receipt Apocalypse" onCancel={e=>{e.preventDefault();finish();}}>
  <div className="cinema-controls"><span><Film size={16}/>{playback.preview?'KAREN / FREE PREVIEW':'RECEIPT APOCALYPSE'}</span><div><button aria-label={muted?'Enable cinematic sound':'Mute cinematic sound'} aria-pressed={!muted} onClick={()=>{if(muted)unlockKarenAudio();else stopAudio();setMuted(!muted);}}>{muted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button><button className="cinema-skip" autoFocus onClick={finish}><SkipForward size={18}/>SKIP</button></div></div>
  <div className="live-special-screen"><div ref={host} className="karen-stage"/>{status==='LOADING THE SET'&&<span className="live-scene-loading">LOADING THE SET…</span>}{error&&<p className="karen-error" role="alert">{error}</p>}{impact&&!playback.preview&&<div className="live-special-result">{playback.knockout?'CANCELLED':'REFUND DENIED'} · {playback.damage?`${playback.damage} DAMAGE`:'EFFECT APPLIED'}</div>}</div>
  <div className="cinema-bottom"><span>{status}</span><div className="cinema-progress" aria-hidden="true"><i ref={bar}/></div><span>ESC TO SKIP</span></div>
  <p className="sr-only" role="status">{playback.preview?'Karen finds an incorrect charge. She unrolls a receipt, catches the opponent, and folds the arena into a complaint form. A Refund Denied stamp lands. Karen becomes furious and the cashier closes the shutter.':`Karen uses Receipt Apocalypse. ${playback.damage} damage.${playback.knockout?' Opponent cancelled.':''}`}</p>
 </dialog>,document.body);
}
