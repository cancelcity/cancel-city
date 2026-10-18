'use client';
import {useEffect,useRef,useState} from 'react';
import {pullFilmDuration} from '../domain/meme-presentation';
import type {Pull} from '../domain/game';
import {LiveCanvas} from './live-canvas';
import {useCityMotion} from './city-motion';
export function PackFilm({pull,onComplete,openingId,preview=false}:{pull?:Pull;onComplete:()=>void;openingId?:string;preview?:boolean}){
 const reduced=useCityMotion(),[progress,setProgress]=useState(reduced?1:0),[ready,setReady]=useState(false),callback=useRef(onComplete),finished=useRef(false);callback.current=onComplete;
 const finish=()=>{if(finished.current)return;finished.current=true;callback.current();};
 useEffect(()=>{if(!ready)return;let request=0,last=performance.now(),elapsed=0;if(reduced){finish();return;}const duration=preview?4300:pull?Math.max(3200,pullFilmDuration(pull)+1400):2800;
  const tick=(now:number)=>{if(!document.hidden)elapsed+=Math.min(80,now-last);last=now;const p=Math.min(1,elapsed/duration);setProgress(p);if(p===1)finish();else request=requestAnimationFrame(tick);};request=requestAnimationFrame(tick);return()=>cancelAnimationFrame(request);
 },[reduced,ready,pull?.cardId,pull?.isNewDiscovery,pull?.regularQuantityAfter,openingId,preview]);
 return <div className="pack-film"><LiveCanvas onReady={()=>setReady(true)} scene={pull?{kind:'pull',cardId:pull.cardId,isNew:pull.isNewDiscovery,copies:pull.regularQuantityAfter,progress,reduced,openingId,preview}:{kind:'pack',progress,reduced}}/><button className="button paper small" onClick={finish}>SKIP SCENE →</button><span className="sr-only">{preview?'Opening scene preview. No pack opened.':pull?'Your saved resident arrived.':'Opening your saved pack. Five residents waiting.'}</span></div>;
}
