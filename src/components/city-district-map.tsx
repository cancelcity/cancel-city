'use client';

import {type CSSProperties} from 'react';
import {ArrowLeft,ArrowUpRight,Check,ChevronRight,MapPin} from 'lucide-react';
import {CITY_DISTRICT_BY_ID,type CityDistrictId} from '../data/city-districts';
import {CITY_ZONE_BY_ID,type CityZoneId} from '../data/city-zones';
import {useGame} from '../state/store';

export function CityDistrictMap({districtId,onEnter,onBack}:{districtId:CityDistrictId;onEnter:(id:CityZoneId)=>void;onBack:()=>void}){
 const {save,hydrated}=useGame(),district=CITY_DISTRICT_BY_ID[districtId];
 const endings=save?.city?.zoneEndings;
 const completed=district.buildings.filter(building=>endings?.[building.id]!==undefined).length;
 const allDone=hydrated&&completed===district.buildings.length;
 return <section className="city-district-map" data-district={districtId} style={{'--district-accent':district.color} as CSSProperties} aria-labelledby={`city-district-${districtId}-title`}>
  <header className="city-district-map-heading">
   <div className="city-district-map-title">
    <nav className="city-district-map-breadcrumb" aria-label="City location"><button onClick={onBack}><ArrowLeft size={14} aria-hidden="true"/>CITY</button><ChevronRight size={12} aria-hidden="true"/><span>ZONE</span></nav>
    <span className="city-district-map-kicker">{district.kicker}</span>
    <h1 id={`city-district-${districtId}-title`}>{district.name}</h1>
    <p>{district.tagline}</p>
   </div>
   <div className={`city-district-map-progress ${allDone?'is-complete':''}`} aria-live="polite"><span>{allDone?<Check size={17} aria-hidden="true"/>:<MapPin size={17} aria-hidden="true"/>}{allDone?'EVERY ADDRESS ON RECORD':'YOUR ZONE RECORD'}</span><b>{hydrated?completed:'—'}<small> / {district.buildings.length}</small></b><em>BUILDING ENDINGS SAVED</em></div>
  </header>

  <div className="city-district-map-intro"><p>{district.intro}</p><span><MapPin size={15} aria-hidden="true"/>ENTER A BUILDING. CHOOSE YOUR ENDING.</span></div>

  <div className="city-district-map-scene" role="group" aria-label={`Illustrated map of ${district.name}. Numbered buttons open buildings.`}>
   <img className="city-district-map-art" src={district.art} alt={`The specialist buildings of ${district.name}, connected by streets`} draggable={false}/>
   <span className="city-district-map-stamp" aria-hidden="true">{district.name}<small>{district.buildings.length} ADDRESSES. NO GOOD EXCUSES.</small></span>
   {district.buildings.map((building,index)=>{
    const venue=CITY_ZONE_BY_ID[building.id],done=endings?.[building.id]!==undefined;
    return <button key={building.id} className={`city-district-map-pin ${done?'is-saved':''} ${building.x>68?'align-right':building.x<30?'align-left':''}`} style={{left:`${building.x}%`,top:`${building.y}%`}} onClick={()=>onEnter(building.id)} aria-label={`Enter ${venue.name}. ${done?'Ending saved.':'Not visited yet.'}`}>
     <span className="city-district-map-pin-number">{String(index+1).padStart(2,'0')}{done&&<Check size={12} aria-hidden="true"/>}</span>
     <span className="city-district-map-pin-label"><b>{venue.name}</b><small>{done?'ENDING SAVED':'ENTER BUILDING'}<ArrowUpRight size={11} aria-hidden="true"/></small></span>
    </button>;
   })}
  </div>

  <section className="city-district-directory" aria-labelledby={`city-district-${districtId}-directory`}>
   <header><div><span>STREET DIRECTORY</span><h2 id={`city-district-${districtId}-directory`}>PICK YOUR NEXT BAD ADDRESS</h2></div><p>Every building has its own story.<br/>Entering the zone costs nothing.</p></header>
   <div className="city-district-directory-grid">{district.buildings.map((building,index)=>{
    const venue=CITY_ZONE_BY_ID[building.id],done=endings?.[building.id]!==undefined;
    return <button key={building.id} className={`city-district-directory-card ${done?'is-saved':''}`} onClick={()=>onEnter(building.id)}>
     <span className="city-district-directory-art"><img src={venue.art} alt="" width={300} height={220} style={{objectPosition:venue.artPosition||'50% 50%'}} loading="lazy" draggable={false}/><b>{String(index+1).padStart(2,'0')}</b></span>
     <span className="city-district-directory-copy"><small>{!hydrated?'CHECKING SAVE…':done?<><Check size={11} aria-hidden="true"/>ENDING SAVED</>:'UNVISITED ADDRESS'}</small><strong>{venue.name}</strong><span>{venue.specialty||venue.tagline}</span><em>ENTER BUILDING<ArrowUpRight size={14} aria-hidden="true"/></em></span>
    </button>;
   })}</div>
  </section>
  <footer className="city-district-map-footer"><button onClick={onBack}><ArrowLeft size={15} aria-hidden="true"/>BACK TO YOUR BLOCK</button><p>One saved ending per building. Previously saved choices stay on the record.</p></footer>
 </section>;
}
