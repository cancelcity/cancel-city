'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {liveSceneAssets,LiveScene,paintLiveScene,SceneImages} from './live-scene-painter';

const images:SceneImages={},pending=new Map<string,Promise<void>>();
let fonts:Promise<void>|null=null;
function warm(src:string){
 if(images[src])return Promise.resolve();
 if(pending.has(src))return pending.get(src)!;
 const promise=new Promise<void>(resolve=>{const img=new window.Image();img.onload=()=>{images[src]=img;resolve();};img.onerror=()=>resolve();img.src=src;if(img.complete&&img.naturalWidth){images[src]=img;resolve();}});
 pending.set(src,promise);return promise;
}
export function preloadLiveAssets(urls:string[]){
 if(typeof window==='undefined')return Promise.resolve();
 fonts??=Promise.all([['CityDisplay','/assets/actors/city-display.ttf'],['CityMono','/assets/actors/city-mono.ttf']].map(async([name,url])=>{try{const face=await new FontFace(name,`url(${url})`).load();document.fonts.add(face);}catch{}})).then(()=>{});
 return Promise.all([...urls.map(warm),fonts]).then(()=>{});
}
export function preloadLiveScene(scene:LiveScene){return preloadLiveAssets(liveSceneAssets(scene));}
export function LiveCanvas({scene,paused=false,idle=false,onReady,className=''}:{scene:LiveScene;paused?:boolean;idle?:boolean;onReady?:()=>void;className?:string}){
 const canvas=useRef<HTMLCanvasElement>(null),current=useRef(scene),callback=useRef(onReady),[ready,setReady]=useState(false);
 const key=liveSceneAssets(scene).join('|');
 useLayoutEffect(()=>{current.current=scene;callback.current=onReady;});
 useEffect(()=>{let alive=true,done=false;const settle=()=>{if(!alive||done)return;done=true;setReady(true);callback.current?.();};const timer=setTimeout(settle,1800);void preloadLiveScene(current.current).then(()=>{clearTimeout(timer);settle();});return()=>{alive=false;clearTimeout(timer);};},[key]);
 useLayoutEffect(()=>{const el=canvas.current,ctx=el?.getContext('2d');if(ctx&&el)paintLiveScene(ctx,images,scene,el.width,el.height);},[scene,ready]);
 useEffect(()=>{
  if(!idle||paused||scene.reduced||!ready)return;
  let request=0,last=0;
  const tick=(now:number)=>{if(!document.hidden&&now-last>65){const el=canvas.current,ctx=el?.getContext('2d');if(el&&ctx)paintLiveScene(ctx,images,{...current.current,time:now},el.width,el.height);last=now;}request=requestAnimationFrame(tick);};request=requestAnimationFrame(tick);return()=>cancelAnimationFrame(request);
 },[idle,paused,scene.reduced,ready]);
 return <canvas ref={canvas} width={1600} height={900} className={`live-scene-canvas ${className}`} aria-hidden="true"/>;
}
