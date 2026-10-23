'use client';

import {ArrowUpRight,Check,MapPin} from 'lucide-react';
import {CITY_ATLAS_BUILDINGS,CITY_ATLAS_DISTRICTS,type AtlasDistrictId} from '../data/city-atlas';
import {useGame} from '../state/store';

export function CityDistrictGuide({onVisit}:{onVisit:(district:AtlasDistrictId)=>void}){
 const {save,hydrated}=useGame(),city=save?.city;
 const stories=CITY_ATLAS_BUILDINGS.filter(building=>building.legacyVenue),total=stories.length,visited=stories.filter(building=>building.legacyVenue&&city?.zoneEndings[building.legacyVenue]!==undefined).length;
 return <section className="city-district-guide is-district-guide" aria-labelledby="city-district-guide-title">
  <header><div><span>THE REST OF THE CITY</span><h2 id="city-district-guide-title">PICK A NEIGHBOURHOOD.</h2><p>Six districts, 41 addresses. Find stories, game services and your residents’ favourite bad decisions.</p></div><b aria-label={`${visited} of ${total} story endings saved`}>{hydrated?visited:'—'} / {total}<small>STORY ENDINGS SAVED</small></b></header>
  <div className="city-district-cards">{CITY_ATLAS_DISTRICTS.map(district=>{
   const buildings=CITY_ATLAS_BUILDINGS.filter(building=>building.district===district.id),localStories=buildings.filter(building=>building.legacyVenue),done=localStories.filter(building=>building.legacyVenue&&city?.zoneEndings[building.legacyVenue]!==undefined).length;
   return <button key={district.id} className={`city-district-card ${localStories.length&&done===localStories.length?'is-visited':''}`} onClick={()=>onVisit(district.id)}>
    <span className="city-district-card-art"><img src={district.art} alt="" loading="lazy" style={{objectPosition:`${district.focus.x}% ${district.focus.y}%`}}/><span className="city-district-card-status"><MapPin size={13}/>{buildings.length} ADDRESSES</span></span>
    <span className="city-district-card-copy"><small>CANCEL CITY / PUBLIC DISTRICT</small><strong>{district.name}</strong><span>{district.description}</span><span className="city-v3-guide-building-list">{buildings.slice(0,4).map(building=><span key={building.id}>{building.legacyVenue&&city?.zoneEndings[building.legacyVenue]!==undefined?<Check size={12} aria-label="Ending saved"/>:<i aria-hidden="true"/>}{building.name}</span>)}</span><em>EXPLORE THE DISTRICT<ArrowUpRight size={16}/></em><small>{localStories.length?`${done} / ${localStories.length} STORY ENDINGS SAVED`:'GAME SERVICES / RESIDENT FILES'}</small></span>
   </button>;
  })}</div>
  <p className="city-district-guide-note">Districts are free to explore. The ten story venues keep their saved endings and one-time rewards. Other addresses open the game service named on their door. Build, assign residents and upgrade on your own block.</p>
 </section>;
}
