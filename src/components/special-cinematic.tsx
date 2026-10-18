'use client';
import Link from 'next/link';
import {CSSProperties,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowRight,Film,Play,Search,SkipForward,Volume2,VolumeX,Zap} from 'lucide-react';
import {DUOS} from '../data/duos';
import {BattleDirector} from './battle-director';
import {OpeningGallery} from './opening-gallery';
import {EXPANSION_IDS} from '../data/expansion';
import {CARDS,CARD_BY_ID,FACTIONS} from '../data/cards';
import {internetSearch} from '../data/internet';
import {specialAt} from '../data/specials';
import {weaponFamily} from '../data/live-direction';
import {LiveCanvas,preloadLiveScene} from './live-canvas';
import {hasActingPoses,specialOutcome} from './live-scene-painter';
import {cinematicDuration,cinematicFrame,CinematicClock,CinematicMode,previewSpecial,SpecialPlayback} from '../domain/cinematic';
import {abilityDescription} from '../domain/battle';
import {memeCues,MEME_SPECIALS} from '../domain/meme-presentation';
import {characterSignature} from '../domain/audio-signature';
import {FIRST_ROSTER_BY_ID} from '../data/first-roster-batch';
import {firstRosterCues} from '../domain/first-roster-audio';
import {SECOND_ROSTER_BY_ID} from '../data/second-roster-batch';
import {secondRosterCues} from '../domain/second-roster-audio';
import {liveCue,memeCue,signatureCue} from '../services/live-audio';
import {useGame} from '../state/store';
import {Portrait} from './card';
import {useCityMotion} from './city-motion';
import {filmForPlayback,LAYERED_FILMS} from '../data/layered-films';
import {PresentationGate} from '../domain/presentation-gate';
import {FilmSpecial} from './film-special';

const MODE_KEY='cancel-city.cinematic-mode.v1';
export function useCinematicMode(storageKey=MODE_KEY){
 const [mode,setMode]=useState<CinematicMode>('full');
 useEffect(()=>{try{const saved=localStorage.getItem(storageKey);if(saved==='full'||saved==='quick'||saved==='off')queueMicrotask(()=>setMode(saved));}catch{}},[storageKey]);
 const change=(value:CinematicMode)=>{setMode(value);try{localStorage.setItem(storageKey,value);}catch{}};
 return [mode,change] as const;
}
export function CinematicModeControl({mode,onChange}:{mode:CinematicMode;onChange:(mode:CinematicMode)=>void}){
 return <label className="cinematic-mode-control"><Film size={17}/><span>SPECIALS<select aria-label="Special attack cinematic playback on this device" value={mode} onChange={e=>onChange(e.target.value as CinematicMode)}><option value="full">Full cinematic</option><option value="quick">Quick · 1.2 seconds</option><option value="off">Off · instant result</option></select></span></label>;
}

type SpecialCinematicProps={playback:SpecialPlayback;mode?:CinematicMode;initialMuted?:boolean;onImpact?:()=>void;onComplete:()=>void};
export function SpecialCinematic(props:SpecialCinematicProps){
 const reduced=useCityMotion(),[fallback,setFallback]=useState(false),gate=useRef(new PresentationGate());
 const film=filmForPlayback(props.playback,props.mode??'full',reduced);
 const impact=()=>gate.current.impact(()=>props.onImpact?.());
 const complete=()=>gate.current.complete(()=>props.onImpact?.(),props.onComplete);
 return film&&!fallback?<FilmSpecial film={film} playback={props.playback} initialMuted={props.initialMuted} onImpact={impact} onComplete={complete} onFallback={()=>setFallback(true)}/>:<LiveSpecialCinematic {...props} onImpact={impact} onComplete={complete}/>;
}
export function CardSpecialPreview({cardId}:{cardId:string}){
 const [take,setTake]=useState(0),[playing,setPlaying]=useState(false);
 return <><button className="button acid card-special-preview" onClick={()=>{setTake(n=>n+1);setPlaying(true);}}><Play size={17}/>{LAYERED_FILMS.some(f=>f.cardId===cardId)?'WATCH CINEMATIC SPECIAL':'PREVIEW SPECIAL'}<ArrowRight size={17}/></button>{playing&&<SpecialCinematic key={`${cardId}:${take}`} playback={previewSpecial(cardId)} mode="full" onComplete={()=>setPlaying(false)}/>}</>;
}
function LiveSpecialCinematic({playback,mode='full',onImpact,onComplete,initialMuted=false}:SpecialCinematicProps){
 const direction=specialAt(playback.cardId),actor=CARD_BY_ID[playback.cardId],reduced=useCityMotion(),settings=useGame(s=>s.save?.settings),duration=cinematicDuration(mode,reduced);
 const [frame,setFrame]=useState(()=>cinematicFrame(0,mode,reduced)),[asset,setAsset]=useState<'loading'|'ready'|'fallback'>('loading'),[hidden,setHidden]=useState(false),[muted,setMuted]=useState(initialMuted),dialog=useRef<HTMLDialogElement>(null),callbacks=useRef({onImpact,onComplete}),clock=useRef(new CinematicClock(mode,reduced)),hit=useRef(false),done=useRef(false),sounds=useRef<(()=>void)[]>([]),cues=useRef(new Set<string>()),memeProgress=useRef(0);
 useLayoutEffect(()=>{callbacks.current={onImpact,onComplete};});
 const stopSound=()=>{for(const stop of sounds.current)stop();sounds.current=[];};
 const reveal=()=>{if(!hit.current){hit.current=true;callbacks.current.onImpact?.();}};
 const finish=()=>{if(done.current)return;clock.current.skip();done.current=true;reveal();stopSound();callbacks.current.onComplete();};
 useEffect(()=>{const el=dialog.current;if(el&&!el.open)el.showModal();return()=>{el?.close();for(const stop of sounds.current)stop();};},[]);
 useEffect(()=>{
  let alive=true;const timer=setTimeout(()=>{if(alive)setAsset('fallback');},1800);
  void preloadLiveScene({kind:'special',playback,progress:0,reduced}).then(()=>{clearTimeout(timer);if(alive)setAsset('ready');});
  return()=>{alive=false;clearTimeout(timer);};
 },[playback,reduced]);
 useEffect(()=>{
  if(asset==='loading')return;clock.current.configure(mode,reduced);let request=0,last=performance.now(),renderAt=-100;
  const visibility=()=>{last=performance.now();setHidden(document.hidden);if(document.hidden)for(const stop of sounds.current)stop();};
  visibility();document.addEventListener('visibilitychange',visibility);
  const tick=(now:number)=>{
   if(done.current)return;const next=clock.current.tick(now-last,document.hidden);last=now;
   if(next.emitImpact&&!hit.current){hit.current=true;callbacks.current.onImpact?.();}
   if(now-renderAt>=40||next.frame.complete){setFrame(next.frame);renderAt=now;}
   if(next.emitComplete){done.current=true;for(const stop of sounds.current)stop();callbacks.current.onComplete();return;}
   request=requestAnimationFrame(tick);
  };
  request=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(request);document.removeEventListener('visibilitychange',visibility);};
 },[asset,mode,reduced]);
 useEffect(()=>{
  if((FIRST_ROSTER_BY_ID[playback.cardId]||SECOND_ROSTER_BY_ID[playback.cardId])&&!playback.duoId)return;
  const gamerPause=playback.cardId==='CC001'&&!playback.duoId&&frame.progress>=.39&&frame.progress<.50;
  const cue=gamerPause?null:frame.phase==='entrance'||frame.phase==='windup'?'windup':frame.phase==='launch'?'launch':frame.phase==='impact'||reduced?'impact':frame.phase==='verdict'?'gag':null;
  if(asset==='loading'||muted||!settings?.soundEnabled||hidden){for(const stop of sounds.current)stop();return;}
  if(cue&&!cues.current.has(cue)){cues.current.add(cue);if(cue==='windup')sounds.current.push(signatureCue(characterSignature(playback.cardId),settings.volume));sounds.current.push(liveCue(cue,weaponFamily(direction.motif),settings.volume));}
 },[frame.phase,frame.progress,playback.cardId,playback.duoId,direction.motif,settings?.soundEnabled,settings?.volume,muted,hidden,reduced,asset]);
 useEffect(()=>{
  const previous=memeProgress.current;memeProgress.current=frame.progress;
  if(reduced||playback.duoId||asset==='loading'||muted||hidden||!settings?.soundEnabled)return;
  if(SECOND_ROSTER_BY_ID[playback.cardId]){for(const cue of secondRosterCues(playback.cardId,frame.progress))if(cue.at>previous&&!cues.current.has(cue.key)){cues.current.add(cue.key);sounds.current.push(signatureCue(cue.frequencies.map((frequency,i)=>({frequency,delay:i*.065,duration:cue.duration,waveform:cue.waveform})),settings.volume));}return;}
  if(FIRST_ROSTER_BY_ID[playback.cardId]){for(const cue of firstRosterCues(playback.cardId,frame.progress))if(cue.at>previous&&!cues.current.has(cue.key)){cues.current.add(cue.key);sounds.current.push(signatureCue(cue.frequencies.map((frequency,i)=>({frequency,delay:i*.065,duration:cue.duration,waveform:cue.waveform})),settings.volume));}return;}
  for(const cue of memeCues(playback.cardId,frame.progress))if(cue.at>previous&&!cues.current.has('meme:'+cue.key)){cues.current.add('meme:'+cue.key);if(cue.cue==='disconnect')stopSound();sounds.current.push(memeCue(cue.cue,settings.volume));}
 },[frame.progress,playback.cardId,playback.duoId,reduced,asset,muted,hidden,settings?.soundEnabled,settings?.volume]);
 const paused=hidden||asset==='loading';
 const result=playback.preview?'CINEMATIC PREVIEW':playback.knockout?'CANCELLED':direction.impact;
 return createPortal(<dialog ref={dialog} className="special-cinematic" data-phase={frame.phase} data-reduced={reduced} data-paused={paused} aria-label={`${actor.name}: ${playback.title}${playback.preview?', preview':''}`} onCancel={e=>{e.preventDefault();finish();}} style={{'--special-accent':direction.accent,'--cinema-duration':`${duration}ms`} as CSSProperties}>
  <div className="cinema-controls"><span><Film size={16}/>{playback.preview?'SPECIAL PREVIEW':playback.side==='player'?'YOUR SPECIAL ATTACK':'ENEMY SPECIAL ATTACK'}</span><div>{settings?.soundEnabled?<button onClick={()=>{setMuted(v=>!v);stopSound();}} aria-pressed={muted} aria-label={muted?'Unmute this cinematic':'Mute this cinematic'}>{muted?<VolumeX size={18}/>:<Volume2 size={18}/>}</button>:<span className="cinema-sound-off"><VolumeX size={16}/>SOUND OFF</span>}<button className="cinema-skip" autoFocus onClick={finish}><SkipForward size={18}/>SKIP</button></div></div>
  <div className="live-special-screen">
   <LiveCanvas scene={{kind:'special',playback,progress:frame.progress,reduced}} paused={paused}/>
   {asset==='loading'&&<span className="live-scene-loading">SETTING THE SCENE…</span>}
   {frame.impact&&!playback.preview&&<div className="live-special-result">{result} · {specialOutcome(playback)}{playback.passive?` · ${playback.passive}`:''}</div>}
  </div>
  <div className="cinema-bottom"><span>{asset==='loading'?'LOADING THE SET':hidden?'PAUSED':reduced?'REDUCED MOTION':mode==='quick'?'QUICK CINEMATIC':'CANCEL CITY / LIVE COMIC'}</span><div className="cinema-progress" aria-hidden="true"><i style={{width:`${frame.progress*100}%`}}/></div><span>ESC TO SKIP</span></div>
  <p className="sr-only" role="status">{playback.preview?`Preview of ${actor.name}'s ${actor.ability}. ${abilityDescription(actor)}`:`${actor.name} uses ${playback.title}.${playback.damage?` ${playback.damage} damage.`:''}${playback.heal?` ${playback.heal} composure restored.`:''}${playback.knockout?' Opponent cancelled.':''}`}</p>
 </dialog>,document.body);
}

export function SpecialGallery({mode}:{mode:CinematicMode}){
 const loadout=useGame(s=>s.save?.props.loadout);
 const [query,setQuery]=useState(''),[faction,setFaction]=useState(''),[playing,setPlaying]=useState<SpecialPlayback|null>(null),[take,setTake]=useState(0);
 const residents=CARDS.filter(c=>(!faction||c.faction===faction)&&internetSearch(c).includes(query.toLowerCase().trim()));
 return <div className="special-gallery"><p>All {CARDS.length} residents. Every cinematic. Previewing attacks uses no hype, cards or rewards. Equipped props appear in their resident’s special.</p><Link href="/cinema/specials/" className="button acid cinema-gallery-premiere"><Film size={18}/>NEW SPECIALS · HOMELESSLANDER / MASTER CHEESE / MRLEAST<ArrowRight size={17}/></Link><div className="duo-pair-guide"><b>DUO PREMIERES · FREE PREVIEWS</b>{DUOS.map(duo=><button className="button paper small" key={duo.id} onClick={()=>{const p=previewSpecial(duo.pair[0]);setPlaying({...p,key:`duo-preview:${duo.id}:${crypto.randomUUID()}`,duoId:duo.id,partnerId:duo.pair[1],title:duo.name.toUpperCase(),support:false});setTake(n=>n+1);}}>{duo.name} · {duo.pair.map(id=>CARD_BY_ID[id].name).join(' + ')}</button>)}</div><div className="duo-pair-guide"><b>NEW COMEDY CUTS · NO CARDS NEEDED</b>{Object.entries(MEME_SPECIALS).map(([id,scene])=><button key={id} className="button paper small" onClick={()=>{setPlaying({...previewSpecial(id,loadout?.[id]||null),key:`gag-preview:${id}:${crypto.randomUUID()}`});setTake(n=>n+1);}}>{CARD_BY_ID[id].name} · {scene.title}</button>)}</div><div className="expansion-preview-list"><b>NEW SETS · ALL 16 SPECIALS · FREE PREVIEWS</b><div>{EXPANSION_IDS.map(id=><button className="button paper small" key={id} onClick={()=>{setPlaying({...previewSpecial(id,loadout?.[id]||null),key:`expansion-preview:${id}:${crypto.randomUUID()}`});setTake(n=>n+1);}}>{CARD_BY_ID[id].name}</button>)}</div></div><OpeningGallery/><BattleDirector/><div className="special-gallery-filters"><label className="search-box"><Search size={17}/><input aria-label="Search cinematic previews" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find an attack or resident…"/></label><select aria-label="Filter cinematic previews by faction" value={faction} onChange={e=>setFaction(e.target.value)}><option value="">ALL FACTIONS</option>{FACTIONS.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></div><div className="special-gallery-grid">{residents.map(card=><button key={card.id} className={`special-preview-button ${hasActingPoses(card.id)?'has-acting-poses':''}`} onClick={()=>{setTake(n=>n+1);setPlaying({...previewSpecial(card.id,loadout?.[card.id]||null),key:`preview:${card.id}:${crypto.randomUUID()}`});}}><Portrait card={card}/><span><b>{card.name}</b><small>{card.ability}</small><em><Zap size={13}/>{LAYERED_FILMS.some(f=>f.cardId===card.id)?'CINEMATIC SPECIAL':hasActingPoses(card.id)?'ACTING SCENE':'PLAY SPECIAL'} <ArrowRight size={14}/></em></span></button>)}</div>{!residents.length&&<p>No specials match. Try a resident name or meme tag.</p>}{playing&&<SpecialCinematic key={`${playing.key}:${take}`} playback={playing} mode={mode==='off'?'full':mode} onComplete={()=>setPlaying(null)}/>}</div>;
}
