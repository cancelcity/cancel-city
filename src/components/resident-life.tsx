'use client';
import Image from 'next/image';
import {useEffect,useRef,useState} from 'react';
import {BuildingKind} from '../data/city';
import {CITY_GAGS} from '../data/live-direction';
import {actorPoseSrc,hasActingPoses} from './live-scene-painter';
import {useCityMotion} from './city-motion';

export function ResidentLife({id,kind,active,plot}:{id:string;kind:BuildingKind;active:boolean;plot:number}){
 const reduced=useCityMotion(),ref=useRef<HTMLSpanElement>(null),[pose,setPose]=useState(0),[joke,setJoke]=useState(-1);
 useEffect(()=>{
  if(!active||reduced)return;
  let visible=false,time=0;
  const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);},{threshold:.1});if(ref.current)observer.observe(ref.current);
  const interval=setInterval(()=>{if(!visible||document.hidden)return;time++;const beat=(time+plot*8)%64;setPose(beat<45?0:beat<49?1:beat<54?2:beat<58?4:5);setJoke(beat>=49?Math.floor(time/64)%2+1:-1);},350);
  return()=>{clearInterval(interval);observer.disconnect();};
 },[active,reduced,plot]);
 return <span ref={ref} className={`resident-street-life street-${kind}`} data-performing={joke>=0} aria-hidden="true">
  <Image src={actorPoseSrc(id,hasActingPoses(id)?pose:0)} width={540} height={540} alt="" draggable={false}/>
  {joke>=0&&<span>{CITY_GAGS[kind][joke]}</span>}
 </span>;
}
