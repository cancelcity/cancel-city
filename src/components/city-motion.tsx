'use client';
import {animate,useReducedMotion} from 'motion/react';
import {useLayoutEffect,useRef} from 'react';
import {useGame} from '../state/store';

export const CITY_EASE=[.16,1,.3,1] as const;
export function useCityMotion(){
 const system=useReducedMotion(),preference=useGame(s=>s.save?.settings.motion);
 return Boolean(system)||preference==='reduced';
}
export function AnimatedNumber({value}:{value:number}){
 const reduced=useCityMotion(),ref=useRef<HTMLSpanElement>(null),current=useRef(value);
 useLayoutEffect(()=>{
  if(reduced){current.current=value;if(ref.current)ref.current.textContent=String(value);return;}
  const controls=animate(current.current,value,{duration:.55,ease:CITY_EASE,onUpdate:n=>{current.current=n;if(ref.current)ref.current.textContent=String(Math.round(n));}});
  return()=>controls.stop();
 },[value,reduced]);
 return <span className="animated-number"><span className="sr-only">{value}</span><span aria-hidden="true" ref={ref}>{value}</span></span>;
}
