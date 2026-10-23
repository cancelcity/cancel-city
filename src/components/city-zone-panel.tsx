'use client';

import Link from 'next/link';
import {useRef,useState,type CSSProperties} from 'react';
import {ArrowLeft,ArrowUpRight,Check,Eye,LoaderCircle,LockKeyhole,MapPin,RotateCcw,Ticket,Trash2,Zap} from 'lucide-react';
import {CARD_BY_ID} from '../data/cards';
import {CITY_ZONE_BY_ID,type CityZoneId,type CityZoneReward} from '../data/city-zones';
import {useGame} from '../state/store';
import {districtForBuilding} from '../data/city-districts';
import {Portrait} from './card';

function ZoneRewards({reward,muted=false}:{reward:CityZoneReward;muted?:boolean}){
 return <span className={`city-zone-rewards ${muted?'is-story-only':''}`}>
  {!!reward.packs&&<span><Ticket size={13} aria-hidden="true"/>+{reward.packs} PACK TICKET{reward.packs===1?'':'S'}</span>}
  {!!reward.influence&&<span><Zap size={13} aria-hidden="true"/>+{reward.influence} INFLUENCE</span>}
  {!!reward.scrap&&<span><Trash2 size={13} aria-hidden="true"/>+{reward.scrap} TRASH</span>}
 </span>;
}

export function CityZonePanel({zoneId,onBack,onBlock,onVisit}:{zoneId:CityZoneId;onBack:()=>void;onBlock:()=>void;onVisit:(zone:CityZoneId)=>void}){
 return <CityZoneStory key={zoneId} zoneId={zoneId} onBack={onBack} onBlock={onBlock} onVisit={onVisit}/>;
}

function CityZoneStory({zoneId,onBack,onBlock,onVisit}:{zoneId:CityZoneId;onBack:()=>void;onBlock:()=>void;onVisit:(zone:CityZoneId)=>void}){
 const {save,run,busy,error,hydrated,mode,migration,clearError}=useGame();
 const [reading,setReading]=useState<number|null>(null),[claiming,setClaiming]=useState<number|null>(null),[notice,setNotice]=useState('');
 const claimLock=useRef(false);
 const zone=CITY_ZONE_BY_ID[zoneId],city=save?.city,chosen=city?.zoneEndings[zoneId],resolved=chosen!==undefined;
 const host=zone.hostCardId?CARD_BY_ID[zone.hostCardId]:undefined;
 const district=districtForBuilding(zoneId);
 const savedEnding=resolved?zone.choices[chosen]:null;
 const unvisited=district.buildings.filter(other=>other.id!==zoneId&&city?.zoneEndings[other.id]===undefined),visited=district.buildings.filter(other=>city?.zoneEndings[other.id]!==undefined).length;
 const rewardStep=savedEnding?.reward.packs?{href:'/packs/',label:'OPEN PACKS',note:'Your saved ending awarded a pack ticket. Spend tickets in Packs to add residents to your collection.'}:savedEnding?.reward.scrap?{href:'/market/',label:'VISIT THE TRASH MARKET',note:'Your saved ending awarded Trash. Save it toward a resident recipe, or recycle spare cards to earn more.'}:savedEnding?{href:null,label:'USE INFLUENCE ON YOUR BLOCK',note:'Your saved ending awarded Influence. Use it to build properties or upgrade your block.'}:null;
 const connected=hydrated&&(mode==='cloud'||mode==='local')&&!error&&!migration;
 const canChoose=connected&&!!city&&!busy&&!resolved;
 const viewed=resolved?(reading??chosen):null,ending=viewed!==null?zone.choices[viewed]:null,alternate=resolved&&viewed!==chosen;
 const readOnly=mode==='offline'||!!error;
 const gate=!hydrated||mode==='loading'?'CONNECTING YOUR SAVE…':migration?'CHOOSE YOUR SAVED GAME IN THE SAVE BAR FIRST.':readOnly?'YOUR SAVE IS READ-ONLY. RECONNECT TO SAVE AN ENDING.':!city?'FOUND YOUR BLOCK BEFORE CHOOSING AN ENDING.':busy?'SAVING YOUR GAME…':'';
 const choose=async(index:number)=>{
  if(claimLock.current||!canChoose)return;
  claimLock.current=true;setClaiming(index);setNotice('');
  try{if(await run({type:'city-zone-choice',zoneId,choice:index as 0|1|2})){setReading(null);}else setNotice('Your choice was not saved. Reconnect or retry when your save is ready.');}
  finally{claimLock.current=false;setClaiming(null);}
 };

 return <section className="city-zone-panel" data-zone={zoneId} style={{'--zone-accent':zone.color} as CSSProperties} aria-labelledby={`city-zone-${zoneId}-title`}>
  <nav className="city-v3-building-breadcrumb" aria-label="City location"><button onClick={onBlock}>YOUR BLOCK</button><span>/</span><button onClick={onBack}>{district.name}</button><span>/</span><b>{zone.name}</b></nav>
  <div className="city-zone-scene">
   <img className="city-zone-scene-art" src={zone.art} width={1536} height={1024} style={{objectPosition:zone.artPosition||'50% 50%'}} alt={`${zone.name}, ${zone.district}`} draggable={false}/>
   <div className="city-zone-scene-shade" aria-hidden="true"/>
   <div className="city-zone-scene-top"><button className="city-zone-back" onClick={onBack}><ArrowLeft size={17} aria-hidden="true"/>BACK TO {district.name.toUpperCase()}</button><span><MapPin size={13} aria-hidden="true"/>{zone.district}</span></div>
   <div className="city-zone-scene-bottom"><span className="city-zone-address">CANCEL CITY / FIXED ADDRESS. BAD REPUTATION.</span><h2>{zone.tagline}</h2>{host&&<div className="city-zone-host"><Portrait card={host}/><span><small>LOCAL LIABILITY</small><b>{host.name}</b></span></div>}</div>
  </div>

  <div className="city-zone-sheet">
   <header className="city-zone-story-heading"><span className="city-zone-eyebrow">{resolved?'YOUR VISIT IS ON THE RECORD':'SPECIALIST BUILDING / THREE BAD DECISIONS.'}</span><h1 id={`city-zone-${zoneId}-title`}>{zone.name}</h1>{resolved?<details className="city-zone-intro-replay"><summary>HOW YOU GOT HERE</summary><p>{zone.intro}</p></details>:<p className="city-zone-intro">{zone.intro}</p>}</header>

   {ending&&<section className={`city-zone-ending ${alternate?'is-alternate':''}`} aria-live="polite" aria-label={alternate?'Alternate ending preview':'Your saved ending'}><span className="city-zone-ending-stamp">{alternate?<><Eye size={15} aria-hidden="true"/>ALTERNATE / STORY ONLY</>:<><Check size={15} aria-hidden="true"/>REWARD COLLECTED ONCE</>}</span><h2>{ending.label}</h2><p>{ending.outcome}</p>{alternate?<div className="city-zone-replay-note"><b>NO REWARD. YOUR SAVED CHOICE STAYS UNCHANGED.</b><button onClick={()=>setReading(null)}><RotateCcw size={13} aria-hidden="true"/>BACK TO MY SAVED ENDING</button></div>:<ZoneRewards reward={ending.reward}/>}</section>}

   {!resolved&&gate&&<div className={`city-zone-save-note ${readOnly?'is-read-only':''}`} role="status"><LockKeyhole size={17} aria-hidden="true"/><span><b>{gate}</b>{readOnly?<small>{error||'Your existing progress is preserved. You can keep exploring.'}</small>:!city&&hydrated&&mode!=='loading'?<small>You can explore every venue first. Found your city from the block, then return to make your choice.</small>:null}</span>{readOnly&&<button onClick={clearError} disabled={busy}>RECONNECT</button>}{!city&&connected&&<button onClick={onBlock}>BACK TO BLOCK / FOUND CITY<ArrowUpRight size={14} aria-hidden="true"/></button>}</div>}
   {resolved&&readOnly&&<p className="city-zone-cached-note" role="status">Viewing your saved ending. Your connection is read-only; reading another ending earns no reward.</p>}
   {notice&&<p className="city-zone-error" role="alert">{notice}</p>}

   <div className="city-zone-choice-heading"><h2>{resolved?'READ THE OTHER ENDINGS':'HOW DO YOU HANDLE THIS PRICK?'}</h2><span>{resolved?'STORY REPLAY / NO MORE REWARDS':'CHOOSE ONE / REWARD SAVES IMMEDIATELY'}</span></div>
   <ol className="city-zone-choices">{zone.choices.map((choice,index)=><li key={choice.label}><button className={`city-zone-choice ${chosen===index?'is-chosen':''} ${viewed===index?'is-reading':''}`} disabled={!resolved&&!canChoose} aria-pressed={resolved?viewed===index:undefined} onClick={()=>resolved?setReading(index):void choose(index)}><span className="city-zone-choice-number">{chosen===index?<Check size={18} aria-hidden="true"/>:String(index+1).padStart(2,'0')}</span><span className="city-zone-choice-body"><strong>{choice.label}</strong><ZoneRewards reward={choice.reward} muted={resolved&&chosen!==index}/>{resolved&&<em>{chosen===index?'YOUR SAVED ENDING / COLLECTED':'READ ONLY / NO REWARD'}</em>}</span>{claiming===index?<LoaderCircle className="city-zone-saving" size={18} aria-label="Saving your choice"/>:resolved?<Eye size={17} aria-hidden="true"/>:<ArrowUpRight size={19} aria-hidden="true"/>}</button></li>)}</ol>
   <p className="city-zone-fine-print">{resolved?'Your first choice is final. Replays only change the story shown here.':'One saved ending per building. No entry fee. No countdown. Other endings remain readable after you choose.'}</p>
   {resolved&&rewardStep&&<footer className="city-zone-next">
    <span className="city-zone-next-label">PUT YOUR SAVED REWARD TO WORK</span>
    {rewardStep.href?<Link className="city-zone-reward-action" href={rewardStep.href}>{rewardStep.label}<ArrowUpRight size={16} aria-hidden="true"/></Link>:<button className="city-zone-reward-action" onClick={onBlock}>{rewardStep.label}<ArrowUpRight size={16} aria-hidden="true"/></button>}
    <small>{rewardStep.note}</small>
    <div className="city-zone-tour"><span>{visited} / {district.buildings.length} BUILDING ENDINGS SAVED IN {district.name.toUpperCase()}</span>{unvisited.length?<button onClick={()=>onVisit(unvisited[0].id)}>NEXT UNVISITED: {CITY_ZONE_BY_ID[unvisited[0].id].name}<ArrowUpRight size={15} aria-hidden="true"/></button>:<b>EVERY BUILDING IN THIS DISTRICT IS ON RECORD.</b>}</div>
    <button onClick={onBack}><ArrowLeft size={13} aria-hidden="true"/>EXPLORE {district.name.toUpperCase()}</button>
   </footer>}
  </div>
 </section>;
}
