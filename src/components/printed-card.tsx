'use client';
import {useEffect,useRef,type CSSProperties,type PointerEvent} from 'react';
import {Crown,Diamond,Skull,Shield} from 'lucide-react';
import {Card,factionOf,rarityOf} from '../data/cards';
import {fighterRole} from '../domain/fighter-role';
import {residentStats} from '../domain/duel-rules';
import {Portrait} from './card';
import {useCityMotion} from './city-motion';

const clearTilt=(element:HTMLElement|null)=>{
 for(const property of ['--rx','--ry','--glare-x','--glare-y','--glare-opacity'])element?.style.removeProperty(property);
};

export function PrintedCard({card,compact=false,foil=false,locked=false,copies,onClick,health,priority=false,atk,def,stance}:{card:Card;compact?:boolean;foil?:boolean;locked?:boolean;copies?:number;onClick?:()=>void;health?:{value:number;max:number};priority?:boolean;atk?:number;def?:number|string;stance?:'attack'|'defense'}){
 const reduced=useCityMotion(),element=useRef<HTMLElement|null>(null),hoverQuery=useRef<MediaQueryList|null>(null);
 const canTilt=Boolean(onClick)&&!compact&&!locked&&!reduced;
 useEffect(()=>{
  const cardElement=element.current;
  clearTilt(cardElement);
  if(!canTilt)return;
  const query=window.matchMedia('(hover: hover) and (pointer: fine)');
  hoverQuery.current=query;
  const changed=()=>{if(!query.matches)clearTilt(cardElement);};
  query.addEventListener('change',changed);
  return()=>{query.removeEventListener('change',changed);hoverQuery.current=null;clearTilt(cardElement);};
 },[canTilt]);
 const rarity=rarityOf(card.rarity);
 const stats=residentStats(card);
 const effectiveAtk=atk??stats.attack;
 const effectiveDef=def??stats.defense;
 const onPointerMove=(e:PointerEvent<HTMLElement>)=>{
  if(e.pointerType==='touch'||!hoverQuery.current?.matches)return;
  const rect=e.currentTarget.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  const px=(e.clientX-rect.left)/rect.width;
  const py=(e.clientY-rect.top)/rect.height;
  const rx=((0.5-py)*4).toFixed(2);
  const ry=((px-0.5)*5).toFixed(2);
  e.currentTarget.style.setProperty('--rx',`${rx}deg`);
  e.currentTarget.style.setProperty('--ry',`${ry}deg`);
  e.currentTarget.style.setProperty('--glare-x',`${(px*100).toFixed(1)}%`);
  e.currentTarget.style.setProperty('--glare-y',`${(py*100).toFixed(1)}%`);
  e.currentTarget.style.setProperty('--glare-opacity','1');
 };
 const onPointerLeave=(e:PointerEvent<HTMLElement>)=>{
  clearTilt(e.currentTarget);
 };
 const body=<><header><Skull/><h3>{card.name}</h3>{stance&&<span className={`card-stance-pill ${stance}`}>{stance==='defense'?'🛡️ DEF':'⚔️ ATK'}</span>}</header><div className="printed-art"><span className="printed-type" title={fighterRole(card.id).text}>FIGHTER · {fighterRole(card.id).name}</span>{locked?<span className="printed-unknown">?</span>:<Portrait card={card} priority={priority}/>}<strong className="printed-power" title={`Summon cost: ${stats.stars} stars`}>{stats.stars}★</strong><span className="printed-rarity" title={rarity.name}>{card.rarity==='public-enemy'?<Crown/>:<Diamond/>}</span>{foil&&<span className="printed-foil">FOIL ✦</span>}{stance==='defense'&&<div className="printed-defense-overlay"><span><Shield size={12}/> DEFENSE MODE</span></div>}</div>{health&&<div className="printed-health"><i style={{width:`${Math.max(0,health.value/health.max*100)}%`}}/><b>{health.value} / {health.max}</b></div>}<div className="printed-yugioh-stats"><span className="duel-hp"><b>HP</b>/{health?.max??stats.hp}</span><span className="yugioh-atk"><b>ATK</b>/{effectiveAtk}</span><span className="yugioh-def"><b>DEF</b>/{effectiveDef}</span></div>{!compact&&<div className="printed-copy"><p>“{card.quote}”</p><div><span>{factionOf(card.faction).name.split(' ')[0]}</span><span>{card.ability}</span></div></div>}{compact&&copies!==undefined&&<small className="printed-copies">{copies?`×${copies}`:`#${String(card.number).padStart(3,'0')}`}</small>}</>;
 const props={ref:(node:HTMLElement|null)=>{element.current=node;},className:`printed-card ${compact?'compact':''} ${foil?'foil':''} ${locked?'locked':''} ${stance?`stance-${stance}`:''}`,style:{'--card-color':rarity.color} as CSSProperties,onPointerMove:canTilt?onPointerMove:undefined,onPointerLeave:canTilt?onPointerLeave:undefined,onPointerCancel:canTilt?onPointerLeave:undefined};
 return onClick?<button type="button" {...props} aria-label={`Inspect fighter ${card.name}, ${fighterRole(card.id).name}, ${rarity.name}${copies!==undefined?`, ${copies} owned`:''}`} onClick={onClick}>{body}</button>:<div {...props}>{body}</div>;
}
