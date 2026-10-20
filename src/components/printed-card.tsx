'use client';
import {CSSProperties} from 'react';
import {Crown,Diamond,Skull} from 'lucide-react';
import {Card,factionOf,rarityOf} from '../data/cards';
import {Portrait} from './card';

export function PrintedCard({card,compact=false,foil=false,locked=false,copies,onClick,health,priority=false}:{card:Card;compact?:boolean;foil?:boolean;locked?:boolean;copies?:number;onClick?:()=>void;health?:{value:number;max:number};priority?:boolean}){
 const rarity=rarityOf(card.rarity);
 const body=<><header><Skull/><h3>{card.name}</h3></header><div className="printed-art">{locked?<span className="printed-unknown">?</span>:<Portrait card={card} priority={priority}/>}<strong className="printed-power">{Math.round(card.stats.clout/10)}</strong><span className="printed-rarity" title={rarity.name}>{card.rarity==='public-enemy'?<Crown/>:<Diamond/>}</span>{foil&&<span className="printed-foil">FOIL ✦</span>}</div>{health&&<div className="printed-health"><i style={{width:`${Math.max(0,health.value/health.max*100)}%`}}/><b>{health.value} / {health.max}</b></div>}{!compact&&<div className="printed-copy"><p>“{card.quote}”</p><div><span>{factionOf(card.faction).name.split(' ')[0]}</span><span>{card.ability}</span></div></div>}{compact&&copies!==undefined&&<small className="printed-copies">{copies?`×${copies}`:`#${String(card.number).padStart(3,'0')}`}</small>}</>;
 const props={className:`printed-card ${compact?'compact':''} ${foil?'foil':''} ${locked?'locked':''}`,style:{'--card-color':rarity.color} as CSSProperties};
 return onClick?<button type="button" {...props} aria-label={`Inspect ${card.name}, ${rarity.name}${copies!==undefined?`, ${copies} owned`:''}`} onClick={onClick}>{body}</button>:<div {...props}>{body}</div>;
}
