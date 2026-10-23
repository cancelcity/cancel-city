'use client';
import Link from 'next/link';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {ArrowLeft,ArrowRight,BookOpen,ChevronLeft,ChevronRight,Crown,Home,Lock,Plus} from 'lucide-react';
import {buildingOf,CITY_BALANCE} from '../data/city';
import {CITY_ZONES,type CityZoneId} from '../data/city-zones';
import {districtForBuilding} from '../data/city-districts';
import {cityJobs,cityUpgradePreview,matched,plotUnlock} from '../domain/city';
import {useGame} from '../state/store';
import {CityPropertyDock,type CityDockView} from './city-property-dock';
import {CityZonePanel} from './city-zone-panel';
import {CityDistrictGuide} from './city-district-guide';
import {CityAtlas} from './city-atlas';
import {CITY_ATLAS_BUILDINGS,CITY_ATLAS_DISTRICTS,type AtlasAction,type AtlasBuilding,type AtlasDistrictId} from '../data/city-atlas';
import {CloutsideCorner} from './cloutside-corner';
import {LiabilityHillsScene} from './liability-hills-scene';

type NeighbourhoodStageProps={selected:string;onSelect:(id:string)=>void;onManage:(tab:'plot'|'stories'|'jobs')=>void;onFound:()=>void;onCollect:()=>void;onUpgrade:()=>void;canCollect:boolean;income:number;onDrama:()=>void;onBeef:()=>void;onRaid:()=>void;onHelp:()=>void;onHustle:()=>void};

export function NeighbourhoodStage(props:NeighbourhoodStageProps){
 const router=useRouter(),params=useSearchParams();
 const legacyValue=params.get('building')||params.get('zone');
 const activeZone=CITY_ZONES.some(zone=>zone.id===legacyValue)?legacyValue as CityZoneId:null;
 const address=CITY_ATLAS_BUILDINGS.find(building=>building.id===params.get('address'))||null;
 const activeDistrict=activeZone?districtForBuilding(activeZone).id:address?.district||CITY_ATLAS_DISTRICTS.find(district=>district.id===params.get('zone'))?.id||null;
 const block=params.get('view')==='block';
 const go=(values:{district?:AtlasDistrictId|null;address?:string;building?:CityZoneId;view?:'block';tool?:'build'|'residents';venue?:string})=>{
  const search=new URLSearchParams(params.toString());
  for(const key of ['zone','address','building','view','tool','venue','tab'])search.delete(key);
  if(values.district)search.set('zone',values.district);
  if(values.address)search.set('address',values.address);
  if(values.building)search.set('building',values.building);
  if(values.view)search.set('view',values.view);
  if(values.tool)search.set('tool',values.tool);
  if(values.venue)search.set('venue',values.venue);
  router.push(`/city/${search.size?`?${search.toString()}`:''}`,{scroll:false});
 };
 const goLegacy=(id:CityZoneId)=>go({district:districtForBuilding(id).id,building:id});
 const goBlock=(tool?:'build'|'residents')=>go({view:'block',tool});
 const goBack=()=>go({district:activeDistrict,address:activeZone?CITY_ATLAS_BUILDINGS.find(building=>building.legacyVenue===activeZone)?.id:address?.id});
 const onAction=(action:AtlasAction)=>{
  if(action==='build'||action==='residents'){goBlock(action);return;}
  if(action==='jobs'){props.onManage('jobs');return;}
  if(action==='collect'){props.onCollect();return;}
  if(action==='drama'){props.onDrama();return;}
  if(action==='beef'){props.onBeef();return;}
  if(action==='raid'){props.onRaid();return;}
  if(action==='help'){props.onHelp();return;}
  if(action==='found')props.onFound();
 };
 if(block)return <PlayerBlockStage {...props} onBack={()=>go({})}/>;
 if(activeZone)return <main className="city-v2-main viewing-zone city-atlas-encounter"><nav className="city-atlas-returnbar" aria-label="City navigation"><button type="button" onClick={goBack}><ArrowLeft size={17}/>BACK TO {CITY_ATLAS_DISTRICTS.find(district=>district.id===activeDistrict)?.name.toUpperCase()||'CITY'}</button><button type="button" onClick={()=>go({})}>CITY OVERVIEW</button><button type="button" onClick={()=>goBlock()}><Home size={15}/>YOUR BLOCK</button></nav>{activeZone==='probable-cause'?<CloutsideCorner key="probable-cause" initialInterior onEnter={goLegacy} onBack={goBack}/>:activeZone==='yacht-club'?<LiabilityHillsScene key="yacht-club" initialInterior onEnter={goLegacy} onBack={goBack}/>:activeZone?<CityZonePanel zoneId={activeZone} onBack={goBack} onBlock={()=>goBlock()} onVisit={goLegacy}/>:null}</main>;
 return <CityAtlas districtId={activeDistrict} selectedId={address?.id||null} onDistrict={district=>go({district})} onBuilding={building=>go({district:building?.district||activeDistrict,address:building?.id})} onAction={onAction} onVenue={goLegacy} onBlock={()=>goBlock()} onHelp={props.onHelp}/>;
}

function PlayerBlockStage({selected,onSelect,onManage,onFound,onCollect,onUpgrade,canCollect,income,onDrama,onBeef,onRaid,onHelp,onHustle,onBack}:NeighbourhoodStageProps&{onBack:()=>void}){
 const {save,busy,error,hydrated,mode,migration}=useGame(),router=useRouter(),params=useSearchParams(),city=save?.city,mainRef=useRef<HTMLElement>(null);
 const [dockView,setDockView]=useState<CityDockView>('overview'),[chapterRequest,setChapterRequest]=useState<{tier:1|2|3;serial:number}>(),handledTool=useRef('');
 const parsed=selected.startsWith('plot-')?Number(selected.slice(5)):0,plot=Number.isInteger(parsed)&&parsed>=0&&parsed<12?parsed:0,[page,setPage]=useState(plot>=6?1:0),blocked=!hydrated||busy||!!error||!!migration||mode==='offline';
 useEffect(()=>{setPage(plot>=6?1:0);},[plot]);
 const goDistrict=(district:AtlasDistrictId|null)=>router.push(district?`/city/?zone=${district}`:'/city/',{scroll:false});
 const selectPlot=(index:number,view:CityDockView='overview')=>{onSelect(`plot-${index}`);setPage(index>=6?1:0);setDockView(view);setChapterRequest(undefined);};
 useEffect(()=>{
  const tool=params.get('tool');
  if(!tool){handledTool.current='';return;}
  if(!city||handledTool.current===tool)return;
  handledTool.current=tool;
  const index=tool==='build'?city.plots.findIndex((building,index)=>!building&&!!save&&plotUnlock(save,index).unlocked):city.plots.findIndex(building=>!!building&&!building.residentId);
  selectPlot(index>=0?index:plot,tool==='build'?'build':'assign');
 },[params,city]);
 const jobs=save?cityJobs(save):[],unfinished=jobs.filter(job=>!job.state?.claimed);
 const objective=unfinished.find(job=>job.available&&job.state&&job.state.progress>=job.target)||unfinished.find(job=>job.available&&job.state)||unfinished.find(job=>job.available&&!job.state)||unfinished.find(job=>!!job.state||city?.plots.some(building=>building?.kind===job.kind));
 const objectiveHost=objective&&city?city.plots.findIndex(building=>!!building&&building.kind===objective.kind&&matched(building)&&building.level>=objective.tier):-1;
 const objectiveMatch=objective&&city?city.plots.findIndex(building=>!!building&&building.kind===objective.kind&&matched(building)):-1;
 const objectiveKind=objective&&city?city.plots.findIndex(building=>building?.kind===objective.kind):-1;
 const objectiveLevelHost=objective&&city?city.plots.findIndex(building=>building?.kind===objective.kind&&building.level>=objective.tier):-1;
 const needsBuilding=!!objective&&objectiveKind<0,emptyPlot=city&&save?city.plots.findIndex((building,index)=>!building&&plotUnlock(save,index).unlocked):-1;
 const objectivePlot=objectiveHost>=0?objectiveHost:objectiveMatch>=0?objectiveMatch:objectiveLevelHost>=0?objectiveLevelHost:objectiveKind>=0?objectiveKind:emptyPlot>=0?emptyPlot:plot,objectiveBuilding=city?.plots[objectivePlot];
 const needsLevel=!!objective&&!needsBuilding&&!objective.available&&!!objectiveBuilding&&matched(objectiveBuilding)&&objectiveBuilding.level<objective.tier,needsResident=!!objective&&!needsBuilding&&!objective.available&&(!objectiveBuilding||!matched(objectiveBuilding)),objectiveUpgrade=city&&needsLevel?cityUpgradePreview(city,objectivePlot):null;
 const openObjective=()=>{if(!city){onFound();return;}if(!objective){onManage('jobs');return;}selectPlot(objectivePlot,needsBuilding?'build':needsLevel?'overview':needsResident?'assign':'story');if(!needsBuilding&&!needsLevel&&!needsResident)setChapterRequest({tier:objective.tier,serial:Date.now()});};
 const activeJob=objective?.state,goalDone=!!objective&&!!activeJob&&activeJob.progress>=objective.target,objectiveHref=objective&&activeJob&&!goalDone&&objective.available?objective.href:null;
 return <main ref={mainRef} className="city-v2-main viewing-block city-player-block">
  <nav className="city-atlas-returnbar" aria-label="City navigation"><button type="button" onClick={onBack}><ArrowLeft size={17}/>CITY OVERVIEW</button><span>YOUR SAVED BLOCK / {city?.plots.filter(Boolean).length??0} OF 12 PROPERTIES</span><button type="button" onClick={onHelp}>HOW TO PLAY</button></nav>
  <>
   <header className="city-v2-resource-strip"><div className="city-v2-block-title"><h1>YOUR BLOCK</h1><div><Crown size={23}/><span>INFLUENCE</span><b>{city?.influence??0}</b></div></div><div className="city-v2-production"><span>CITY PRODUCTION</span><b>{income} / {CITY_BALANCE.dailyCap}<small>PER DAY</small></b></div><button className="city-v2-collect" disabled={blocked||!!city&&income>0&&!canCollect} onClick={!city?onFound:income===0?()=>selectPlot(Math.max(0,city.plots.findIndex(building=>!!building)),'assign'):onCollect}><Crown size={25}/><span>{!city?'FOUND YOUR BLOCK':canCollect?`COLLECT ${income}`:income===0?'ASSIGN RESIDENTS':'COLLECTED TODAY'}</span><small>{!city?'FREE TOWER +200 INFLUENCE':income===0?'START CITY PRODUCTION':canCollect?'ONCE PER UTC DAY':'NEXT RESET 00:00 UTC'}</small></button><div className="city-v2-next-objective"><BookOpen size={23}/><div><b>{!city?'NEXT: FOUND YOUR BLOCK':objective?needsBuilding?`NEXT: BUILD ${buildingOf(objective.kind).name.toUpperCase()}`:needsLevel?`NEXT: UPGRADE TO LEVEL ${objective.tier} · ${objectiveUpgrade?.cost||0}`:needsResident?'NEXT: ASSIGN A MATCHING RESIDENT':!objective.available?'NEXT: FINISH THE PREVIOUS CHAPTER':goalDone?'NEXT: CLAIM YOUR JOB REWARD':activeJob?objective.goal:'NEXT: ACCEPT A CHAPTER JOB':'NEXT: EXPLORE YOUR CITY STORIES'}</b><div className="city-v2-objective-progress"><i style={{width:objective&&activeJob?`${activeJob.progress/objective.target*100}%`:'0%'}}/><span>{objectiveUpgrade?`CITY: ${objectiveUpgrade.incomeBefore} → ${objectiveUpgrade.incomeAfter} / DAY`:objective?`${activeJob?.progress||0} / ${objective.target}`:'YOUR CITY IS SAVED'}</span></div></div>{objectiveHref?<Link href={objectiveHref}>CONTINUE<ArrowRight size={15}/></Link>:<button disabled={blocked} onClick={openObjective}>{!city?'START':needsBuilding?'BUILD':needsLevel?'VIEW UPGRADE':needsResident?'ASSIGN':goalDone?'CLAIM':'READ'}<ArrowRight size={15}/></button>}</div></header>
   <section className="city-v2-street" aria-label={`Your City plots ${page*6+1} through ${page*6+6}`}><img className="city-v2-street-backdrop" src="/assets/city-v2/street-backdrop.webp" alt="Cancel City at dusk: a filthy neon skyline above a busy street" onError={event=>{if(!event.currentTarget.src.endsWith('/assets/city/neighbourhood.webp'))event.currentTarget.src='/assets/city/neighbourhood.webp';}}/><div className="city-v2-street-shade"/><div className="city-v2-street-plots">{Array.from({length:6},(_,slot)=>{const index=page*6+slot,building=city?.plots[index],definition=building?buildingOf(building.kind):null,unlock=save?plotUnlock(save,index):{unlocked:index<6,requirement:'Found your block first.'};return <button key={index} className={`city-v2-frontage ${plot===index?'selected':''} ${building?'occupied':unlock.unlocked?'empty':'locked'}`} style={{'--building-color':definition?.color||'#eee4ca'} as CSSProperties} aria-pressed={plot===index} aria-label={`Plot ${index+1}: ${definition?.name||(!unlock.unlocked?unlock.requirement:'Empty plot. Build here.')}`} onClick={()=>selectPlot(index)}><span className="city-v2-address-pin">{index+1}</span>{building&&definition?<><img className="city-v2-building-art" src={`/assets/city/${building.kind}-l${building.level}.webp`} alt={`${definition.name}, level ${building.level}`} draggable={false}/><span className="city-v2-frontage-name"><b>{city?.signs[String(index)]||definition.name}</b><small>LEVEL {building.level}{building.residentId?' · RESIDENT ASSIGNED':' · NEEDS RESIDENT'}</small></span></>:<><span className="city-v2-empty-lot"/>
    <span className="city-v2-build-sign">{unlock.unlocked?<Plus size={24}/>:<Lock size={24}/>}<b>{unlock.unlocked?'BUILD HERE':'LOCKED'}</b><small>{unlock.unlocked?`PLOT ${String(index+1).padStart(2,'0')}`:unlock.requirement}</small></span></>}</button>;})}</div><span className="city-v2-street-stamp">SAME IDIOTS. DIFFERENT ADDRESS.</span><button className="city-v2-page-arrow previous" disabled={!page} aria-label="Show plots 1 through 6" onClick={()=>selectPlot(0)}><ChevronLeft size={24}/></button><button className="city-v2-page-arrow next" disabled={!!page} aria-label="Show plots 7 through 12" onClick={()=>selectPlot(6)}><ChevronRight size={24}/></button></section>
   <nav className="city-v2-addresses" aria-label="Your twelve City addresses"><span>ADDRESSES</span><div>{Array.from({length:12},(_,index)=>{const building=city?.plots[index],unlock=save?plotUnlock(save,index):{unlocked:index<6};return <button key={index} className={plot===index?'active':building?'built':!unlock.unlocked?'locked':''} aria-pressed={plot===index} aria-label={`Select plot ${index+1}${building?`, ${buildingOf(building.kind).name}`:!unlock.unlocked?', locked':', empty'}`} onClick={()=>selectPlot(index)}>{String(index+1).padStart(2,'0')}{building?<i/>:!unlock.unlocked?<Lock size={10}/>:null}</button>;})}</div><b>PLOTS {page*6+1}–{page*6+6} / 12</b><button className="city-v2-address-records" onClick={()=>onManage('plot')}>RECORDS<ArrowRight size={12}/></button></nav>
   <CityPropertyDock plot={plot} view={dockView} requestedChapter={chapterRequest} onView={setDockView} onFound={onFound} onUpgrade={onUpgrade} onAdvanced={()=>onManage(dockView==='story'?'stories':'plot')}/>
   <CityDistrictGuide onVisit={goDistrict}/>
   <nav className="city-v2-street-activities" aria-label="Street activities"><button onClick={onBeef}>STREET BEEF<ArrowRight size={13}/></button><button onClick={onDrama}>BUILDING INCIDENTS</button><button onClick={onHustle}>DAILY POST</button><button onClick={onRaid}>RIVAL CREWS</button><Link href="/missions/">ALL JOBS</Link><Link href="/stash/">PROP STASH</Link><button onClick={()=>onManage('stories')}>STORY ARCHIVE</button></nav>
  </>
 </main>;
}
