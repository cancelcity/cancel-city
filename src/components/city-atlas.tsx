'use client';

import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ArrowLeft,ArrowUpRight,BookOpen,ChevronDown,Crown,HelpCircle,Home,Map,Pause,Play,Search,X} from 'lucide-react';
import {CITY_ATLAS_BUILDINGS,CITY_ATLAS_DISTRICTS,CITY_ATLAS_OVERVIEW_ART,type AtlasAction,type AtlasBuilding,type AtlasDistrictId} from '../data/city-atlas';
import {CARD_BY_ID} from '../data/cards';
import {buildingOf} from '../data/city';
import {useGame} from '../state/store';
import {CityMapViewport} from './city-map-viewport';
import {CityAtlasVenue} from './city-atlas-venue';
import type {CityZoneId} from '../data/city-zones';
import {CityAtlasLife,CITY_SCENE_ATMOSPHERE} from './city-atlas-life';
import {Dialog} from './dialog';

interface CityAtlasProps {
 districtId:AtlasDistrictId|null;
 selectedId:string|null;
 onDistrict:(id:AtlasDistrictId|null)=>void;
 onBuilding:(building:AtlasBuilding|null)=>void;
 onAction:(action:AtlasAction)=>void;
 onVenue:(id:CityZoneId)=>void;
 onBlock:()=>void;
 onHelp:()=>void;
}

export function CityAtlas({districtId,selectedId,onDistrict,onBuilding,onAction,onVenue,onBlock,onHelp}:CityAtlasProps){
 const city=useGame(state=>state.save?.city),[directory,setDirectory]=useState(false),[query,setQuery]=useState(''),[paused,setPaused]=useState(false),[blockCardOpen,setBlockCardOpen]=useState(true),[hovered,setHovered]=useState<string|null>(null);
 const searchRef=useRef<HTMLInputElement>(null);
 const district=CITY_ATLAS_DISTRICTS.find(item=>item.id===districtId),selected=CITY_ATLAS_BUILDINGS.find(item=>item.id===selectedId&&(!districtId||item.district===districtId));
 const visibleBuildings=district?CITY_ATLAS_BUILDINGS.filter(item=>item.district===district.id):[];
 const litBuilding=visibleBuildings.find(item=>item.id===(hovered||selected?.id));
 const litDistrict=!district?CITY_ATLAS_DISTRICTS.find(item=>item.id===hovered):undefined;
 const light=litBuilding?{x:litBuilding.x,y:litBuilding.y,w:litBuilding.width,h:litBuilding.height}:litDistrict?{x:litDistrict.overview.x+litDistrict.overview.width/2,y:litDistrict.overview.y+litDistrict.overview.height/2,w:litDistrict.overview.width,h:litDistrict.overview.height}:null;
 useEffect(()=>setHovered(null),[districtId]);
 const owned=city?.plots.filter(Boolean).length??0,firstProperty=city?.plots.find(Boolean);
 const term=query.trim().toLocaleLowerCase();
 const matches=CITY_ATLAS_BUILDINGS.filter(building=>!term||[building.name,building.purpose,building.description,CITY_ATLAS_DISTRICTS.find(item=>item.id===building.district)?.name,...building.cast.map(id=>CARD_BY_ID[id]?.name||id)].join(' ').toLocaleLowerCase().includes(term));
 useEffect(()=>{if(directory)searchRef.current?.focus();},[directory]);
 const chooseFromDirectory=(building:AtlasBuilding)=>{onBuilding(building);setDirectory(false);setQuery('');};
 const rectangle=(item:{x:number;y:number;width:number;height:number})=>({left:`${item.x}%`,top:`${item.y}%`,width:`${item.width}%`,height:`${item.height}%`}) as CSSProperties;
 return <main className={`city-atlas-shell ${paused?'is-paused':''}`} aria-label="Cancel City interactive map">
  <div className="city-atlas-world">
   <CityMapViewport art={district?.art||CITY_ATLAS_OVERVIEW_ART} label={district?`${district.name}: ${district.description}`:'Cancel City. Six districts of terrible decisions.'} sceneKey={`${district?.id||'overview'}:${selected?.id||''}`} initialFocus={selected&&district?{x:selected.x,y:selected.y,zoom:district.focus.zoom}:district?.focus} onMapClick={()=>{if(selected)onBuilding(null);}} paused={paused}>
    <div className="city-atlas-light" aria-hidden="true" style={{backgroundImage:`url("${district?.art||CITY_ATLAS_OVERVIEW_ART}")`,opacity:light?1:0,maskImage:light?`radial-gradient(ellipse ${light.w*.65}% ${light.h*.65}% at ${light.x}% ${light.y}%,black 10%,transparent 85%)`:'none'}}/>
    <CityAtlasLife scene={district?.id||'overview'} paused={paused}/>
    {district?visibleBuildings.map(building=><button type="button" key={building.id} className={`city-atlas-building-hotspot ${selected?.id===building.id?'is-selected':''}`} style={rectangle(building)} aria-label={`${building.name}. ${building.purpose}`} onMouseEnter={()=>setHovered(building.id)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(building.id)} onBlur={()=>setHovered(null)} aria-pressed={selected?.id===building.id} onClick={()=>onBuilding(building)}><i className="city-atlas-door" aria-hidden="true"/><span><b>{building.name}</b><small>{building.actionLabel}<ArrowUpRight size={12}/></small></span></button>):CITY_ATLAS_DISTRICTS.map(item=><button type="button" key={item.id} className="city-atlas-district-hotspot" style={{...rectangle(item.overview),'--district-color':item.color} as CSSProperties} aria-label={`Explore ${item.name}. ${item.description}`} onMouseEnter={()=>setHovered(item.id)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(item.id)} onBlur={()=>setHovered(null)} onClick={()=>onDistrict(item.id)}><span>{item.name}<ArrowUpRight size={14}/></span></button>)}
    {!district&&<button type="button" className="city-atlas-block-hotspot" style={rectangle({x:32,y:55,width:32,height:38})} aria-label={`Your block. ${owned} of 12 saved properties. Show block details.`} aria-pressed={blockCardOpen} onClick={()=>setBlockCardOpen(true)}><span>YOUR BLOCK<Home size={13}/></span></button>}
   </CityMapViewport>
   <nav className="city-atlas-toolbar" aria-label="City map controls">
    <button type="button" className="city-atlas-overview" onClick={()=>{setBlockCardOpen(true);onDistrict(null);}} aria-label={district?'Back to city overview':'City overview'}>{district?<ArrowLeft size={18}/>:<Map size={19}/>}<span>{district?'CITY OVERVIEW':'CITY MAP'}</span></button>
    <label className="city-atlas-district-select"><span className="city-atlas-sr-only">Choose a district</span><select value={district?.id||''} onChange={event=>onDistrict((event.target.value||null) as AtlasDistrictId|null)}><option value="">ALL DISTRICTS</option>{CITY_ATLAS_DISTRICTS.map(item=><option key={item.id} value={item.id}>{item.name.toUpperCase()}</option>)}</select><ChevronDown size={13} aria-hidden="true"/></label>
    <button type="button" className="city-atlas-directory-button" aria-label={`Open city directory (${CITY_ATLAS_BUILDINGS.length} addresses)`} onClick={()=>setDirectory(true)}><BookOpen size={17}/><span>DIRECTORY</span><small>{CITY_ATLAS_BUILDINGS.length}</small></button>
    <span className="city-atlas-toolbar-spacer"/>
    <button type="button" className="city-atlas-block-button" onClick={onBlock}><Home size={18}/><span>YOUR BLOCK<small>{owned} / 12 PROPERTIES</small></span></button>
    <span className="city-atlas-influence" title="Your saved Influence"><Crown size={17}/>{(city?.influence??0).toLocaleString('en-US')}</span>
    <button type="button" className="city-atlas-icon-button" aria-label={paused?'Resume city motion':'Pause city motion'} aria-pressed={paused} onClick={()=>setPaused(value=>!value)}>{paused?<Play size={17}/>:<Pause size={17}/>}</button>
    <button type="button" className="city-atlas-icon-button" aria-label="How the City works" onClick={onHelp}><HelpCircle size={18}/></button>
   </nav>
   {selected?<CityAtlasVenue building={selected} onClose={()=>onBuilding(null)} onAction={onAction} onVenue={onVenue}/>:district?<div className="city-atlas-map-caption"><small className="city-atlas-live-pill" style={{'--live-accent':CITY_SCENE_ATMOSPHERE[district.id].accent} as CSSProperties}><i className="city-atlas-live-dot"/>{CITY_SCENE_ATMOSPHERE[district.id].vibe} · {CITY_SCENE_ATMOSPHERE[district.id].weather}</small><span>{district.name}</span><p>{visibleBuildings.length} ADDRESSES · SELECT A LIT ENTRANCE</p></div>:blockCardOpen?<aside className="city-atlas-block-card" aria-label="Your saved block"><button type="button" className="city-atlas-block-card-close" aria-label="Close block details" onClick={()=>setBlockCardOpen(false)}><X size={18}/></button><div className="city-atlas-block-card-art">{firstProperty?<img src={`/assets/city/${firstProperty.kind}-l${firstProperty.level}.webp`} alt={`${buildingOf(firstProperty.kind).name}, level ${firstProperty.level}`}/>:<Home size={47} aria-hidden="true"/>}</div><div className="city-atlas-block-card-copy"><span>YOUR SAVED NEIGHBOURHOOD</span><h1>YOUR BLOCK</h1><p>{owned} / 12 PROPERTIES</p><button type="button" onClick={onBlock}>{owned?'MANAGE BLOCK':'FOUND YOUR BLOCK'}<ArrowUpRight size={17}/></button></div></aside>:<div className="city-atlas-map-caption"><small className="city-atlas-live-pill"><i className="city-atlas-live-dot"/>{CITY_SCENE_ATMOSPHERE.overview.vibe} · {CITY_SCENE_ATMOSPHERE.overview.weather}</small><span>CANCEL CITY</span><p>6 DISTRICTS · {CITY_ATLAS_BUILDINGS.length} ADDRESSES · SELECT A DISTRICT TO ZOOM IN</p></div>}
  </div>
  {directory&&<Dialog wide title="CANCEL CITY / ADDRESS BOOK" onClose={()=>setDirectory(false)}><div className="city-atlas-directory"><label className="city-atlas-directory-search"><Search size={19}/><span className="city-atlas-sr-only">Search buildings, districts and residents</span><input ref={searchRef} value={query} onChange={event=>setQuery(event.target.value)} placeholder="Find a building, district or resident…" type="search"/></label><p className="city-atlas-directory-summary">{matches.length} {matches.length===1?'address':'addresses'} · choose one to locate it on the map</p><div className="city-atlas-directory-groups">{CITY_ATLAS_DISTRICTS.map(item=>{const buildings=matches.filter(building=>building.district===item.id);return buildings.length?<section key={item.id} style={{'--district-color':item.color} as CSSProperties}><h2>{item.name}<small>{buildings.length}</small></h2>{buildings.map(building=><button type="button" key={building.id} onClick={()=>chooseFromDirectory(building)}><span><b>{building.name}</b><small>{building.purpose}</small></span><ArrowUpRight size={16}/></button>)}</section>:null;})}</div>{!matches.length&&<p className="city-atlas-directory-empty">No address matches “{query}”. Try a district or resident’s name.</p>}</div></Dialog>}
 </main>;
}
