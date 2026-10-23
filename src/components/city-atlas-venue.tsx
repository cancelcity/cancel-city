'use client';

import Link from 'next/link';
import {useState,type CSSProperties} from 'react';
import {ArrowUpRight,ChevronDown,ChevronUp,Crown,X} from 'lucide-react';
import {CARD_BY_ID} from '../data/cards';
import {CITY_ATLAS_DISTRICT_BY_ID,type AtlasAction,type AtlasBuilding} from '../data/city-atlas';
import type {CityZoneId} from '../data/city-zones';
import {Portrait} from './card';

export interface CityAtlasVenueProps {
 building:AtlasBuilding;
 onClose:()=>void;
 onAction:(action:AtlasAction)=>void;
 onVenue:(id:CityZoneId)=>void;
}

export function CityAtlasVenue(props:CityAtlasVenueProps){
 return <AtlasVenueCard key={props.building.id} {...props}/>;
}

function AtlasVenueCard({building,onClose,onAction,onVenue}:CityAtlasVenueProps){
 const [expanded,setExpanded]=useState(false);
 const district=CITY_ATLAS_DISTRICT_BY_ID[building.district];
 const cast=building.cast.map(id=>CARD_BY_ID[id]).filter(Boolean);
 const enter=()=>{if(building.legacyVenue)onVenue(building.legacyVenue);else if(building.action)onAction(building.action);};
 const detailId=`atlas-venue-detail-${building.id}`;
 return <aside className={`city-atlas-venue ${expanded?'is-expanded':''}`} style={{'--atlas-venue-accent':district.color} as CSSProperties} aria-label={`${building.name}, selected building`}>
  <button className="city-atlas-venue-close" onClick={onClose} aria-label={`Close ${building.name}`}><X size={19} aria-hidden="true"/></button>
  <div className="city-atlas-venue-main">
   <div className="city-atlas-venue-art" aria-hidden="true" style={{backgroundImage:`url("${district.art}")`,backgroundPosition:`${building.x}% ${building.y}%`,backgroundSize:`${Math.min(1000,Math.max(450,10000/building.width))}% auto`}}>
    {cast[0]&&<span className="city-atlas-venue-host"><Portrait card={cast[0]}/></span>}
   </div>
   <div className="city-atlas-venue-copy">
    <span className="city-atlas-venue-address">{district.name}</span>
    <h2>{building.name}<Crown size={18} aria-hidden="true"/></h2>
    <p className="city-atlas-venue-purpose">{building.purpose}</p>
    {building.href?<Link className="city-atlas-venue-enter" href={building.href}>{building.actionLabel}<ArrowUpRight size={18} aria-hidden="true"/></Link>:<button className="city-atlas-venue-enter" onClick={enter}>{building.actionLabel}<ArrowUpRight size={18} aria-hidden="true"/></button>}
    <button className="city-atlas-venue-more" aria-expanded={expanded} aria-controls={detailId} onClick={()=>setExpanded(value=>!value)}>{expanded?'CLOSE STREET FILE':'WHO’S IN HERE?'}{expanded?<ChevronUp size={13} aria-hidden="true"/>:<ChevronDown size={13} aria-hidden="true"/>}</button>
   </div>
  </div>
  {expanded&&<div className="city-atlas-venue-detail" id={detailId}>
   <p>{building.description}</p>
   <blockquote>{building.quip}</blockquote>
   {cast.length>0&&<div className="city-atlas-venue-cast" aria-label="Characters at this address">{cast.map(card=><Link key={card.id} href={`/collection/?card=${card.id}`} className="city-atlas-venue-resident" title={`Find ${card.name} in the collection`}><Portrait card={card}/><span>{card.name}</span></Link>)}</div>}
   {building.legacyVenue&&<small className="city-atlas-venue-story-note">Enter to play this address’s story. Your saved ending and any rewards stay on the same record.</small>}
  </div>}
 </aside>;
}
