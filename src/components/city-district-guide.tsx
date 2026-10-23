'use client';

import {ArrowUpRight,Check,MapPin} from 'lucide-react';
import {CITY_ZONE_BY_ID} from '../data/city-zones';
import {CITY_DISTRICTS,type CityDistrictId} from '../data/city-districts';
import {useGame} from '../state/store';

export function CityDistrictGuide({onVisit}:{onVisit:(district:CityDistrictId)=>void}){
 const {save,hydrated}=useGame(),city=save?.city;
 const total=CITY_DISTRICTS.reduce((count,district)=>count+district.buildings.length,0),visited=CITY_DISTRICTS.reduce((count,district)=>count+district.buildings.filter(building=>city?.zoneEndings[building.id]!==undefined).length,0);
 return <section className="city-district-guide is-district-guide" aria-labelledby="city-district-guide-title">
  <header><div><span>THE REST OF THE CITY</span><h2 id="city-district-guide-title">PICK A NEIGHBOURHOOD.</h2><p>Enter a district, then choose a specialist building. Each address has its own story and reward.</p></div><b aria-label={`${visited} of ${total} building endings saved`}>{hydrated?visited:'—'} / {total}<small>BUILDINGS VISITED</small></b></header>
  <div className="city-district-cards">{CITY_DISTRICTS.map(district=>{
   const done=district.buildings.filter(building=>city?.zoneEndings[building.id]!==undefined).length;
   return <button key={district.id} className={`city-district-card ${done===district.buildings.length?'is-visited':''}`} onClick={()=>onVisit(district.id)}>
    <span className="city-district-card-art"><img src={district.art} alt="" loading="lazy"/><span className="city-district-card-status"><MapPin size={13}/>{district.buildings.length} SPECIALIST BUILDINGS</span></span>
    <span className="city-district-card-copy"><small>{district.kicker}</small><strong>{district.name}</strong><span>{district.tagline}</span><span className="city-v3-guide-building-list">{district.buildings.map(building=><span key={building.id}>{city?.zoneEndings[building.id]!==undefined?<Check size={12} aria-label="Ending saved"/>:<i aria-hidden="true"/>}{CITY_ZONE_BY_ID[building.id].name}</span>)}</span><em>EXPLORE THE DISTRICT<ArrowUpRight size={16}/></em><small>{done} / {district.buildings.length} BUILDING ENDINGS SAVED</small></span>
   </button>;
  })}</div>
  <p className="city-district-guide-note">{city?'Districts are free to explore. Every building saves one choice and pays once. Your block remains the place to build and upgrade.':'Explore the districts first if you like. Found your free block to save building choices and collect their rewards.'}</p>
 </section>;
}
