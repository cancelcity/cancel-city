'use client';
import {CSSProperties} from 'react';
import {Crown,Diamond,Skull,Shield} from 'lucide-react';
import {Card,factionOf,rarityOf} from '../data/cards';
import {fighterRole} from '../domain/fighter-role';
import {residentStats} from '../domain/duel-rules';
import {Portrait} from './card';

export function PrintedCard({card,compact=false,foil=false,locked=false,copies,onClick,health,priority=false,atk,def,stance}:{card:Card;compact?:boolean;foil?:boolean;locked?:boolean;copies?:number;onClick?:()=>void;health?:{value:number;max:number};priority?:boolean;atk?:number;def?:number|string;stance?:'attack'|'defense'}){
 const rarity=rarityOf(card.rarity);
 const stats=residentStats(card);
 const effectiveAtk=atk??stats.attack;
 const effectiveDef=def??stats.defense;
 const body=<><header><Skull/><h3>{card.name}</h3>{stance&&<span className={`card-stance-pill ${stance}`}>{stance==='defense'?'🛡️ DEF':'⚔️ ATK'}</span>}</header><div className="printed-art"><span className="printed-type" title={fighterRole(card.id).text}>FIGHTER · {fighterRole(card.id).name}</span>{locked?<span className="printed-unknown">?</span>:<Portrait card={card} priority={priority}/>}<strong className="printed-power" title={`Summon cost: ${stats.stars} stars`}>{stats.stars}★</strong><span className="printed-rarity" title={rarity.name}>{card.rarity==='public-enemy'?<Crown/>:<Diamond/>}</span>{foil&&<span className="printed-foil">FOIL ✦</span>}{stance==='defense'&&<div className="printed-defense-overlay"><span><Shield size={12}/> DEFENSE MODE</span></div>}</div>{health&&<div className="printed-health"><i style={{width:`${Math.max(0,health.value/health.max*100)}%`}}/><b>{health.value} / {health.max}</b></div>}<div className="printed-yugioh-stats"><span className="duel-hp"><b>HP</b>/{health?.max??stats.hp}</span><span className="yugioh-atk"><b>ATK</b>/{effectiveAtk}</span><span className="yugioh-def"><b>DEF</b>/{effectiveDef}</span></div>{!compact&&<div className="printed-copy"><p>“{card.quote}”</p><div><span>{factionOf(card.faction).name.split(' ')[0]}</span><span>{card.ability}</span></div></div>}{compact&&copies!==undefined&&<small className="printed-copies">{copies?`×${copies}`:`#${String(card.number).padStart(3,'0')}`}</small>}</>;
 const props={className:`printed-card ${compact?'compact':''} ${foil?'foil':''} ${locked?'locked':''} ${stance?`stance-${stance}`:''}`,style:{'--card-color':rarity.color} as CSSProperties};
 return onClick?<button type="button" {...props} aria-label={`Inspect fighter ${card.name}, ${fighterRole(card.id).name}, ${rarity.name}${copies!==undefined?`, ${copies} owned`:''}`} onClick={onClick}>{body}</button>:<div {...props}>{body}</div>;
}
