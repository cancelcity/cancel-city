'use client';
import Link from 'next/link';
import {animate} from 'motion/react';
import {CSSProperties,MouseEvent,PointerEvent,ReactNode,RefObject,useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {Check,Package,SkipForward,Sparkles,Zap} from 'lucide-react';
import {BuildingKind,BuildingLevel,buildingOf} from '../data/city';
import {PROP_BY_ID} from '../data/props';
import {CityReveal,cameraTarget,CITY_REVEAL_TIMING,LOOT_REVEAL_TIMING} from '../domain/city-presentation';
import {cinematicDuration,cinematicFrame,CinematicClock,CinematicMode,SceneTiming} from '../domain/cinematic';
import {specialCue} from '../services/special-audio';
import {useGame} from '../state/store';
import {CITY_EASE,useCityMotion} from './city-motion';
import {PropArt} from './prop-art';
import {LiveCanvas,preloadLiveAssets} from './live-canvas';
import {liveSceneAssets} from './live-scene-painter';

export function CityMotionControl({mode,onChange}:{mode:CinematicMode;onChange:(mode:CinematicMode)=>void}){return <label className="city-motion-control">CITY SCENES<select aria-label="City scene playback on this device" value={mode} onChange={e=>onChange(e.target.value as CinematicMode)}><option value="full">Full motion</option><option value="quick">Quick scenes</option><option value="off">Instant / still</option></select></label>;}

export function useCityCamera(viewport:RefObject<HTMLDivElement|null>,scene:RefObject<HTMLDivElement|null>,mode:CinematicMode,reduced:boolean,introKey:string,ready:boolean){
 const [intro,setIntro]=useState(false),controls=useRef<{stop:()=>void}[]>([]),drag=useRef<{id:number;x:number;y:number;left:number;top:number;moved:boolean}|null>(null),suppress=useRef(false);
 const cancel=useCallback(()=>{for(const c of controls.current)c.stop();controls.current=[];setIntro(false);},[]);
 useEffect(()=>{
  if(!ready||reduced||mode==='off'||!introKey){queueMicrotask(()=>setIntro(false));return;}
  const key=`cancel-city.city-intro:${introKey}`;try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');}catch{}
  queueMicrotask(()=>setIntro(true));const timer=setTimeout(()=>setIntro(false),mode==='quick'?400:1400);return()=>clearTimeout(timer);
 },[ready,reduced,mode,introKey]);
 useEffect(()=>()=>{for(const c of controls.current)c.stop();},[]);
 const focus=useCallback((x:number,y:number)=>{
  const el=viewport.current,world=scene.current;if(!el||!world)return;
  for(const c of controls.current)c.stop();controls.current=[];
  const to=cameraTarget(x,y,world.clientWidth,world.clientHeight,el.clientWidth,el.clientHeight);
  if(reduced||mode==='off'){el.scrollTo(to.left,to.top);return;}
  const duration=mode==='quick'?.18:.6;
  controls.current=[animate(el.scrollLeft,to.left,{duration,ease:CITY_EASE,onUpdate:value=>{el.scrollLeft=value;}}),animate(el.scrollTop,to.top,{duration,ease:CITY_EASE,onUpdate:value=>{el.scrollTop=value;}})];
 },[viewport,scene,mode,reduced]);
 const onScroll=()=>{const el=viewport.current,world=scene.current;if(!el||!world||reduced||mode==='off')return;world.style.setProperty('--city-parallax-x',`${Math.max(-18,Math.min(18,(el.scrollLeft-(world.clientWidth-el.clientWidth)/2)*-.025))}px`);world.style.setProperty('--city-parallax-y',`${Math.max(-10,Math.min(10,el.scrollTop*-.016))}px`);};
 const onPointerDown=(e:PointerEvent<HTMLDivElement>)=>{cancel();if(e.pointerType==='touch'||e.button!==0)return;drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,left:e.currentTarget.scrollLeft,top:e.currentTarget.scrollTop,moved:false};};
 const onPointerMove=(e:PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&Math.hypot(dx,dy)<6)return;if(!d.moved){d.moved=true;e.currentTarget.setPointerCapture(e.pointerId);}e.preventDefault();e.currentTarget.scrollLeft=d.left-dx;e.currentTarget.scrollTop=d.top-dy;};
 const onPointerUp=(e:PointerEvent<HTMLDivElement>)=>{const d=drag.current;if(!d)return;if(d.moved){suppress.current=true;setTimeout(()=>{suppress.current=false;},0);}if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);drag.current=null;};
 const onClickCapture=(e:MouseEvent<HTMLDivElement>)=>{if(suppress.current){e.preventDefault();e.stopPropagation();}};
 return {intro,cancel,focus,onScroll,onPointerDown,onPointerMove,onPointerUp,onPointerCancel:onPointerUp,onClickCapture};
}

export function BuildingLife({kind,level,active}:{kind:BuildingKind;level:BuildingLevel;active:boolean}){
 return <span className={`building-life life-${kind} life-level-${level}`} data-active={active} aria-hidden="true">
  {kind==='feed'&&<><i className="life-signal"/><i className="life-signal second"/>{[0,1,2].map(i=><span key={i} className="life-notification" style={{'--life-index':i} as CSSProperties}>{['!','↗','?'][i]}</span>)}</>}
  {kind==='pr'&&<><span className="life-conveyor"/>{[0,1,2,3].map(i=><i key={i} className="life-apology" style={{'--life-index':i} as CSSProperties}/>)}</>}
  {kind==='summit'&&<><span className="life-flag"><i/></span><i className="life-camera-glint"/></>}
  {kind==='civic'&&<><i className="life-podium-beam"/><span className="life-campaign-banner">NEXT TERM</span></>}
  {kind==='rocket'&&<>{[0,1,2].map(i=><i key={i} className="life-steam" style={{'--life-index':i} as CSSProperties}/>)}<i className="life-engine"/><span className="life-countdown"><b>03</b><b>02</b><b>SOON™</b></span></>}
  {kind==='afterparty'&&<><i className="life-party-beam"/><i className="life-party-beam second"/><svg className="life-dancers" viewBox="0 0 100 65"><g fill="#13131b" stroke="#e8dfc8" strokeWidth="2">{[0,1,2].map(i=><g key={i} transform={`translate(${i*30+8} 0)`}><g className="life-dancer" style={{'--life-index':i} as CSSProperties}><circle cx="10" cy="12" r="6"/><path d="M5 20h10l8 22H0Z"/><path d="M7 42l-6 18m12-18 7 18M5 24L0 10m15 14 9-13" fill="none" strokeWidth="4"/></g></g>)}</g></svg></>}
 </span>;
}

export function CityAtmosphere({active}:{active:boolean}){return <div className="city-atmosphere" data-active={active} aria-hidden="true"><div className="city-cloud-shadow"/><div className="city-neon-haze"/><div className="city-drifting-clouds"><i/><i/></div></div>;}
export function CityPropDisplay({id}:{id:string|null}){return <Link href={id?`/stash/?prop=${id}`:'/stash/'} className={`city-prop-display ${id?'filled':''}`} aria-label={id?`Displayed ${PROP_BY_ID[id].name}. Open your prop stash.`:'Choose a collectible prop to display in your city.'}><svg viewBox="0 0 200 100" aria-hidden="true"><path d="M20 38L100 8 180 38 100 72Z" fill="#766546" stroke="#131314" strokeWidth="5"/><path d="M20 38v24l80 30 80-30V38l-80 34Z" fill="#332b22" stroke="#131314" strokeWidth="5"/><path d="M42 39l58-21 58 21-58 21Z" fill="#deff00" opacity=".2"/></svg>{id?<span className="city-displayed-prop"><PropArt id={id} decorative/></span>:<Package size={32}/>}<span className="city-display-plaque">{id?PROP_BY_ID[id].name:'ADD A TROPHY'}</span></Link>;}

function ScenePresentation({title,mode,timing,onComplete,children,assets,accent='#deff00'}:{title:string;mode:CinematicMode;timing:SceneTiming;onComplete:()=>void;children:ReactNode|((frame:ReturnType<typeof cinematicFrame>)=>ReactNode);assets:string[];accent?:string}){
 const assetKey=assets.join('|'),[loading,setLoading]=useState(true);
 const reduced=useCityMotion(),settings=useGame(s=>s.save?.settings),[frame,setFrame]=useState(()=>cinematicFrame(0,mode,reduced,timing)),[hidden,setHidden]=useState(false),dialog=useRef<HTMLDialogElement>(null),clock=useRef(new CinematicClock(mode,reduced,timing)),callback=useRef(onComplete),done=useRef(false),cues=useRef(new Set<string>()),sounds=useRef<(()=>void)[]>([]);
 useLayoutEffect(()=>{callback.current=onComplete;});
 useEffect(()=>{let cancelled=false;const timer=setTimeout(()=>{if(!cancelled)setLoading(false);},1800);void preloadLiveAssets(assetKey.split('|')).then(()=>{clearTimeout(timer);if(!cancelled)setLoading(false);});return()=>{cancelled=true;clearTimeout(timer);};},[assetKey]);
 const close=()=>{if(done.current)return;clock.current.skip();done.current=true;for(const stop of sounds.current)stop();callback.current();};
 useEffect(()=>{const el=dialog.current;el?.showModal();return()=>{el?.close();for(const stop of sounds.current)stop();};},[]);
 useEffect(()=>{
  clock.current.configure(mode,reduced);let request=0,last=performance.now(),renderAt=-100;
  const visibility=()=>{last=performance.now();setHidden(document.hidden);if(document.hidden)for(const stop of sounds.current)stop();};visibility();document.addEventListener('visibilitychange',visibility);
  const tick=(now:number)=>{if(done.current)return;const next=clock.current.tick(now-last,document.hidden||loading);last=now;if(now-renderAt>=16||next.frame.complete){setFrame(next.frame);renderAt=now;}if(next.emitComplete){done.current=true;for(const stop of sounds.current)stop();callback.current();return;}request=requestAnimationFrame(tick);};request=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(request);document.removeEventListener('visibilitychange',visibility);};
 },[mode,reduced,loading]);
 useEffect(()=>{const cue=frame.phase==='entrance'?'entrance':frame.phase==='launch'?'launch':frame.phase==='impact'||reduced?'impact':null;if(!settings?.soundEnabled||hidden||loading)return;if(cue&&!cues.current.has(cue)){cues.current.add(cue);sounds.current.push(specialCue(cue,'office',settings.volume));}},[frame.phase,settings?.soundEnabled,settings?.volume,hidden,reduced,loading]);
 return createPortal(<dialog ref={dialog} className="city-scene-dialog" aria-label={title} data-reduced={reduced} data-paused={hidden||loading} data-assets-ready={!loading} data-phase={frame.phase} style={{'--scene-accent':accent,'--scene-duration':`${cinematicDuration(mode,reduced,timing)}ms`} as CSSProperties} onCancel={e=>{e.preventDefault();close();}}><div className="city-scene-controls"><span><Sparkles size={17}/>{title}</span><button autoFocus onClick={close}><SkipForward size={17}/>SKIP</button></div>{typeof children==='function'?children(frame):children}<div className="city-scene-bottom"><span>{loading?'SETTING THE SCENE…':reduced?'REDUCED MOTION':mode==='quick'?'QUICK SCENE':'SAVED IN YOUR CITY'}</span><div><i style={{width:`${frame.progress*100}%`}}/></div><span>ESC TO SKIP</span></div><p className="sr-only" role="status">{title}. Your progress is already saved.</p></dialog>,document.body);
}
export function CityConstructionReveal({reveal,mode,onComplete}:{reveal:CityReveal;mode:CinematicMode;onComplete:()=>void}){
 const building=buildingOf(reveal.after.kind),upgraded=reveal.before?.kind===reveal.after.kind,reduced=useCityMotion();
 const scene={kind:'city' as const,reveal,progress:0,reduced};
 return <ScenePresentation title={reveal.preview?'CEREMONY REPLAY':reveal.founding?'NEIGHBOURHOOD FOUNDED':upgraded?'BUILDING UPGRADED':'CONSTRUCTION COMPLETE'} mode={mode} timing={CITY_REVEAL_TIMING} assets={liveSceneAssets(scene)} accent={building.color} onComplete={onComplete}>{frame=><div className="live-city-scene"><LiveCanvas scene={{...scene,progress:frame.progress}}/></div>}</ScenePresentation>;
}
export function PropLootReveal({id,mode,onComplete}:{id:string;mode:CinematicMode;onComplete:()=>void}){const prop=PROP_BY_ID[id];return <ScenePresentation title="NEW PROP IN THE STASH" mode={mode} timing={LOOT_REVEAL_TIMING} assets={[prop.art]} onComplete={onComplete}><div className="prop-loot-scene"><div className="prop-loot-rays scene-animated"/><span className="prop-loot-art scene-animated"><PropArt id={id} priority/></span><div className="prop-loot-copy scene-animated"><span className="tape pink">COLLECTED · COSMETIC PROP</span><h2>{prop.name.toUpperCase()}</h2><p>“{prop.quote}”</p><b><Check size={17}/>OWNED. EQUIP IT OR SHOW IT OFF.</b></div></div></ScenePresentation>;}

export function InfluencePickup({starts,wallet,onComplete}:{starts:{x:number;y:number}[];wallet:{x:number;y:number};onComplete:()=>void}){
 const reduced=useCityMotion();useEffect(()=>{const timer=setTimeout(onComplete,reduced?0:1200);return()=>clearTimeout(timer);},[onComplete,reduced]);
 if(reduced)return null;
 return createPortal(<div className="influence-pickup-layer" aria-hidden="true">{starts.slice(0,12).map((from,i)=><span key={i} style={{left:from.x,top:from.y,'--pickup-x':`${wallet.x-from.x}px`,'--pickup-y':`${wallet.y-from.y}px`,'--pickup-delay':`${i*.028}s`} as CSSProperties}><Zap size={23}/></span>)}</div>,document.body);
}
