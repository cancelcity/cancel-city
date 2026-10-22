'use client';

import {ArrowUpRight,Check,MapPin} from 'lucide-react';
import {CITY_ZONES,type CityZoneId} from '../data/city-zones';
import {useGame} from '../state/store';

export function CityDistrictGuide({onVisit}:{onVisit:(zone:CityZoneId)=>void}){
 const {save,hydrated}=useGame(),city=save?.city;
 const visited=CITY_ZONES.filter(zone=>city?.zoneEndings[zone.id]!==undefined).length;
 return <section className="city-district-guide" aria-labelledby="city-district-guide-title">
  <header><div><span>OFF YOUR BLOCK</span><h2 id="city-district-guide-title">FOUR ADDRESSES. NO GOOD COMPANY.</h2><p>Pick a venue. Choose one ending. Keep the reward.</p></div><b aria-label={`${visited} of ${CITY_ZONES.length} venue endings saved`}>{hydrated?visited:'—'} / {CITY_ZONES.length}<small>ENDINGS SAVED</small></b></header>
  <div className="city-district-cards">{CITY_ZONES.map(zone=>{
   const choice=city?.zoneEndings[zone.id],done=choice!==undefined;
   return <button key={zone.id} className={`city-district-card ${done?'is-visited':''}`} onClick={()=>onVisit(zone.id)}>
    <span className="city-district-card-art"><img src={zone.art} alt="" loading="lazy" width={1536} height={1024}/><span className="city-district-card-status">{done?<><Check size={13}/>ENDING SAVED</>:<><MapPin size={13}/>CHOOSE YOUR ENDING</>}</span></span>
    <span className="city-district-card-copy"><small>{zone.district}</small><strong>{zone.name}</strong><span>{done?zone.choices[choice].label:'3 CHOICES · 1 REWARD · NO ENTRY FEE'}</span><em>{done?'REVISIT THE STORY':'VISIT VENUE'}<ArrowUpRight size={16}/></em></span>
   </button>;
  })}</div>
  <p className="city-district-guide-note">{city?'Each venue pays once. Other endings stay readable; revisiting never charges you.':'You can look around first. Found your free block to save choices and collect venue rewards.'}</p>
 </section>;
}
