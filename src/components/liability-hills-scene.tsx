'use client';

import Link from 'next/link';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Check,ChevronRight,DoorOpen,Eye,FileText,LoaderCircle,LockKeyhole,MessageCircle,Pause,Play,RotateCcw,Search,SkipForward,Ticket,Trash2,Volume2,VolumeX,Zap} from 'lucide-react';
import {HILLS_CAST,HILLS_CLUES,HILLS_ENDINGS,HILLS_OPENING,type HarbourClueId,type HillsLine,type HillsSpeaker} from '../data/liability-hills';
import {CITY_ZONE_BY_ID,type CityZoneId,type CityZoneReward} from '../data/city-zones';
import {useGame} from '../state/store';
import {useCornerAudio} from './use-corner-audio';

const CAST=['oscar','owner','supplier'] as const;
const ADDRESSES=['oscar-studios','oil-manor','red-flag-house','moonwalk-museum'] as const;
const CLUES:HarbourClueId[]=['invoice','guest-list'];
const POSITION:Record<HillsSpeaker,{x:number;y:number;width:number}>={
 owner:{x:53,y:82,width:17},oscar:{x:31,y:82,width:18},supplier:{x:77,y:83,width:18},
};
const SHORT_NAME:Record<HillsSpeaker,string>={owner:'GOBSTEIN',oscar:'OSCAR',supplier:'SUPPLIER'};
const BUILDINGS=[
 {id:'oscar-studios',x:46,y:24,width:16,height:19},
 {id:'oil-manor',x:76,y:20,width:19,height:24},
 {id:'red-flag-house',x:94,y:29,width:11,height:18},
 {id:'moonwalk-museum',x:95,y:41,width:10,height:12},
] as const;

function Reward({reward}:{reward:CityZoneReward}){
 return <span className="corner-reward">
  {!!reward.packs&&<span><Ticket size={13} aria-hidden="true"/>+{reward.packs} PACK TICKET</span>}
  {!!reward.influence&&<span><Zap size={13} aria-hidden="true"/>+{reward.influence} INFLUENCE</span>}
  {!!reward.scrap&&<span><Trash2 size={13} aria-hidden="true"/>+{reward.scrap} TRASH</span>}
 </span>;
}

export function LiabilityHillsScene({onEnter,onBack,initialInterior=false}:{onEnter:(id:CityZoneId)=>void;onBack:()=>void;initialInterior?:boolean}){
 const {save,run,busy,error,hydrated,mode,migration,clearError}=useGame();
 const city=save?.city,chosen=city?.zoneEndings['yacht-club'],resolved=chosen!==undefined;
 const clues=city?.harbourClues??[],hasInvoice=clues.includes('invoice'),hasGuestList=clues.includes('guest-list'),hasBoth=hasInvoice&&hasGuestList;
 const ending=resolved?HILLS_ENDINGS[chosen]:null,venue=CITY_ZONE_BY_ID['yacht-club'];
 const [view,setView]=useState<'harbour'|'office'>(initialInterior?'office':'harbour');
 const [intro,setIntro]=useState<number|null>(initialInterior?null:0),[line,setLine]=useState<HillsLine|null>(null);
 const [detail,setDetail]=useState<HarbourClueId|null>(null),[focused,setFocused]=useState<HillsSpeaker>('owner');
 const [paused,setPaused]=useState(false),[reduced,setReduced]=useState(false),[ambient,setAmbient]=useState(0);
 const [deciding,setDeciding]=useState(false),[reading,setReading]=useState<0|1|2|null>(null);
 const [notice,setNotice]=useState(''),[saving,setSaving]=useState<string|null>(null),[frameWidth,setFrameWidth]=useState(1100);
 const viewport=useRef<HTMLDivElement>(null),initialized=useRef(false),commandLock=useRef(false);
 const {enabled,toggle,playCue,error:audioError}=useCornerAudio(paused);
 const motionOff=paused||reduced;
 const connected=hydrated&&(mode==='cloud'||mode==='local')&&!migration&&!error;
 const writable=connected&&!!city&&!busy,readOnly=mode==='offline'||!!error;
 const gate=!hydrated||mode==='loading'?'Connecting your save…':migration?'Choose your saved game in the save bar first.':readOnly?'You can explore the harbour. Reconnect to keep evidence and save your ending.':!city?'Found your block to keep evidence and save an ending.':busy?'Saving…':'';

 useEffect(()=>{
  const media=window.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>setReduced(media.matches||document.documentElement.dataset.motion==='reduced');
  update();media.addEventListener('change',update);
  const observer=new MutationObserver(update);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
  return()=>{media.removeEventListener('change',update);observer.disconnect();};
 },[]);
 useEffect(()=>{
  if(!viewport.current)return;
  const observer=new ResizeObserver(entries=>setFrameWidth(entries[0].contentRect.width));
  observer.observe(viewport.current);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  if(!hydrated||initialized.current)return;
  initialized.current=true;
  if(resolved||clues.length)setIntro(null);
 },[hydrated,resolved,clues.length]);
 useEffect(()=>{
  if(motionOff||intro!==null||line||deciding)return;
  const timer=window.setInterval(()=>{if(!document.hidden)setAmbient(value=>value+1);},10000);
  return()=>window.clearInterval(timer);
 },[motionOff,intro,line,deciding]);
 useEffect(()=>{if(intro!==null)setFocused(HILLS_OPENING[intro].speaker);},[intro]);

 const worldWidth=Math.max(frameWidth,740),worldHeight=worldWidth*9/16;
 const actorX=(id:HillsSpeaker)=>view==='office'?67:id==='owner'&&resolved?chosen===1?58:51:POSITION[id].x;
 const focusX=view==='office'?67:actorX(focused);
 const offset=Math.max(0,Math.min(worldWidth-frameWidth,worldWidth*focusX/100-frameWidth/2));
 const currentIntro=intro!==null?HILLS_OPENING[intro]:null;
 const ambientSpeaker:HillsSpeaker=view==='office'?'owner':CAST[ambient%3];
 const ambientText=resolved?(ambientSpeaker==='oscar'?ending!.oscarLine:ambientSpeaker==='supplier'?ending!.supplierLine:ending!.line):HILLS_CAST[ambientSpeaker].ambient[Math.floor(ambient/3)%3];
 const currentLine=currentIntro??line??{speaker:ambientSpeaker,line:ambientText};
 const viewing=reading??chosen,alternative=resolved&&reading!==null&&reading!==chosen;
 const objective=resolved?'The gala is over. The harbour remembers how you settled the bill.':!hasInvoice?'Enter the harbour office. Inspect the invoice.':!hasGuestList?'Ask Oscar for the gala guest list.':'Show the invoice and guest list to Gobstein.';

 function finishIntro(){setIntro(null);setLine(null);setReading(null);}
 function advanceIntro(){if(intro===null)return;if(intro===HILLS_OPENING.length-1)finishIntro();else setIntro(intro+1);}
 function enterOffice(){finishIntro();setDeciding(false);setView('office');setFocused('owner');setDetail(null);setLine({speaker:'owner',line:resolved?ending!.line:HILLS_CAST.owner.firstLine});playCue('door');}
 function leaveOffice(){setView('harbour');setDetail(null);setLine(null);setReading(null);setFocused(hasBoth?'owner':'oscar');playCue('door');}
 async function collectClue(id:HarbourClueId){
  finishIntro();setFocused(HILLS_CLUES[id].speaker);setDetail(id);setLine(HILLS_CLUES[id]);setNotice('');
  setView(id==='invoice'?'office':'harbour');playCue('paper');
  if(clues.includes(id)||resolved)return;
  if(!writable){setNotice(gate||'Your save is not ready. The evidence will stay here.');return;}
  if(commandLock.current)return;
  commandLock.current=true;setSaving(id);
  try{if(!await run({type:'city-harbour-clue',clueId:id}))setNotice('The evidence was not saved. Reconnect and inspect it again.');}
  finally{commandLock.current=false;setSaving(null);}
 }
 function talk(id:HillsSpeaker){
  finishIntro();setFocused(id);setDetail(null);setNotice('');
  if(id!=='owner')setView('harbour');
  if(id==='oscar'&&!resolved){void collectClue('guest-list');return;}
  if(id==='owner'&&hasBoth&&!resolved){setDeciding(true);setLine({speaker:'owner',line:'You can’t put a price on charity. The captain seems determined to try.'});return;}
  const quote=resolved?(id==='oscar'?ending!.oscarLine:id==='supplier'?ending!.supplierLine:ending!.line):HILLS_CAST[id].firstLine;
  setLine({speaker:id,line:quote});
 }
 async function choose(index:0|1|2){
  if(resolved){setReading(index);setLine(HILLS_ENDINGS[index]);setDetail(null);return;}
  if(!writable||!hasBoth||commandLock.current)return;
  commandLock.current=true;setSaving(`ending-${index}`);setNotice('');
  try{
   if(await run({type:'city-zone-choice',zoneId:'yacht-club',choice:index})){
    setDeciding(false);setReading(null);setLine(HILLS_ENDINGS[index]);setFocused('owner');setDetail(null);setView('harbour');playCue('resolve');
   }else setNotice('The ending was not saved. Your evidence is safe; try again once connected.');
  }finally{commandLock.current=false;setSaving(null);}
 }
 function actOnObjective(){
  if(resolved){setDeciding(value=>!value);setReading(null);setLine(ending);return;}
  if(!hasInvoice){if(view==='harbour')enterOffice();else void collectClue('invoice');}
  else if(!hasGuestList)talk('oscar');
  else talk('owner');
 }
 function actorPose(id:HillsSpeaker){
  if(id==='owner')return resolved?5:deciding?4:0;
  if(id==='oscar')return detail==='guest-list'?5:0;
  return currentIntro?.speaker==='supplier'?4:0;
 }

 return <section className={`cloutside-corner liability-hills-scene ${motionOff?'is-paused':''} ${resolved?'is-resolved':''}`} data-scene={view} aria-labelledby="liability-hills-title">
  <header className="corner-header">
   <div className="corner-location"><button onClick={onBack}><ArrowLeft size={15} aria-hidden="true"/>CITY</button><ChevronRight size={12} aria-hidden="true"/><h1 id="liability-hills-title">LIABILITY HILLS</h1><span>PRIVATE HARBOUR / PUBLIC LIABILITY</span></div>
   <div className="corner-controls"><button onClick={()=>setPaused(value=>!value)} aria-pressed={paused} aria-label={paused?'Resume harbour animation':'Pause harbour animation'}>{paused?<Play size={15} aria-hidden="true"/>:<Pause size={15} aria-hidden="true"/>}<span>{paused?'PLAY':'PAUSE'}</span></button><button onClick={()=>void toggle()} aria-pressed={enabled} aria-label={enabled?'Turn off harbour sound':'Turn on harbour sound'}>{enabled?<Volume2 size={15} aria-hidden="true"/>:<VolumeX size={15} aria-hidden="true"/>}<span>SOUND {enabled?'ON':'OFF'}</span></button></div>
  </header>

  <div ref={viewport} className="corner-viewport hills-viewport" style={{height:worldHeight}} aria-label={view==='harbour'?'Liability Hills waterfront. Talk to the gala guests or enter the harbour office.':'The harbour office. Inspect the invoice on the desk.'}>
   <div className="corner-world hills-world" style={{width:worldWidth,height:worldHeight,transform:`translateX(-${offset}px)`} as CSSProperties}>
    <img className="corner-scene-art" src={`/assets/city-v5/hills-${view==='harbour'?'waterfront':'office'}.webp`} alt={view==='harbour'?'A violet evening over Liability Hills, its private harbour, studio, manor and yacht.':'The harbour office looking out over the marina, with an unpaid invoice on the desk.'} width={1600} height={900} draggable={false}/>
    <div className="hills-evening-light" aria-hidden="true"/>
    {view==='harbour'&&<>
     <div className="hills-water-shimmer" aria-hidden="true"/><div className="hills-yacht-light" aria-hidden="true"/><div className="hills-palm-shadow" aria-hidden="true"/>
     <button className="corner-door hills-office-door" onClick={enterOffice} aria-label="Enter the harbour office"><span><DoorOpen size={14} aria-hidden="true"/>HARBOUR OFFICE</span></button>
     {BUILDINGS.map(building=><button key={building.id} className="hills-building-hotspot" style={{left:`${building.x-building.width/2}%`,top:`${building.y-building.height/2}%`,width:`${building.width}%`,height:`${building.height}%`}} onClick={()=>onEnter(building.id)} aria-label={`Visit ${CITY_ZONE_BY_ID[building.id].name}`}><span>{CITY_ZONE_BY_ID[building.id].name}<ArrowUpRight size={12} aria-hidden="true"/></span></button>)}
     <button className="hills-yacht-gate" onClick={enterOffice} aria-label="Enter Gobstein Yacht Club through the harbour office"><span>YACHT CLUB<ArrowUpRight size={12} aria-hidden="true"/></span></button>
     {resolved&&<div className={`hills-aftermath-sign ending-${chosen}`} aria-label={`Harbour notice: ${ending!.sign}`}><small>HARBOUR NOTICE</small><b>{ending!.sign}</b></div>}
    </>}
    {view==='office'&&<button className={`corner-receipt-hotspot hills-invoice-hotspot ${hasInvoice?'is-found':''}`} onClick={()=>void collectClue('invoice')} aria-label={hasInvoice?'Read the harbour invoice again':'Inspect the invoice on the desk'}><span className="corner-hotspot-ring"/><FileText size={22} aria-hidden="true"/><span>{hasInvoice?'READ INVOICE':'INSPECT INVOICE'}</span></button>}
    {(view==='office'?['owner'] as const:CAST).map(id=>{
     const position=POSITION[id],talking=currentLine.speaker===id,pose=actorPose(id);
     return <button key={id} className={`corner-actor hills-actor hills-actor-${id} ${focused===id?'is-focused':''} ${talking?'is-speaking':''} ${id==='supplier'&&pose===4?'is-stumbling':''}`} style={{left:`${actorX(id)}%`,bottom:`${view==='office'?28:100-position.y}%`,width:`${view==='office'?22:position.width}%`} as CSSProperties} onClick={()=>talk(id)} aria-label={`Talk to ${HILLS_CAST[id].name}. ${HILLS_CAST[id].role}`}>
      <span className="corner-actor-shadow" aria-hidden="true"/><img className="hills-actor-image" src={`/assets/actors/${HILLS_CAST[id].cardId}-${pose}.webp`} width={512} height={512} alt="" aria-hidden="true" draggable={false}/><span className="corner-actor-name">{HILLS_CAST[id].name}<MessageCircle size={11} aria-hidden="true"/></span>
     </button>;
    })}
    {view==='office'&&<img className="corner-foreground hills-office-counter" src="/assets/city-v5/hills-office-counter.webp" alt="" aria-hidden="true" draggable={false}/>}
    <div className="corner-scene-vignette" aria-hidden="true"/>
   </div>
   <div className="corner-scene-caption"><span className="corner-open-dot"/>8:16 PM<span>/</span>{view==='office'?'ACCOUNTS OPEN. WALLETS CLOSED.':'TONIGHT’S GALA: CHARITY TO BE CONFIRMED.'}</div>
   {view==='office'&&<button className="corner-exit" onClick={leaveOffice}><ArrowLeft size={15} aria-hidden="true"/>BACK TO THE HARBOUR</button>}
   {frameWidth<740&&<div className="corner-camera-tabs" aria-label="Look around the harbour">{(view==='office'?['owner'] as const:CAST).map(id=><button key={id} aria-pressed={focused===id} onClick={()=>{finishIntro();setFocused(id);setDetail(null);}}>{SHORT_NAME[id]}</button>)}</div>}
  </div>

  <div className="corner-play-dock">
   <section className={`corner-dialogue speaker-${currentLine.speaker}`} aria-label="Harbour conversation">
    <div className="corner-dialogue-head"><span>{HILLS_CAST[currentLine.speaker].name}</span><small>{currentIntro?'THE CHARITY GALA':alternative?'ALTERNATE ENDING / STORY ONLY':detail?'EVIDENCE':resolved?'AFTER THE GALA':HILLS_CAST[currentLine.speaker].role}</small></div>
    <p aria-live={line||currentIntro?'polite':'off'}>“{currentLine.line}”</p>
    {detail&&<div className="corner-clue-detail"><FileText size={15} aria-hidden="true"/><span><b>{HILLS_CLUES[detail].title}{clues.includes(detail)&&<Check size={12} aria-label="Evidence saved"/>}{resolved&&!clues.includes(detail)&&<small className="hills-archive-badge">ARCHIVE / STORY ONLY</small>}</b>{HILLS_CLUES[detail].detail}</span></div>}
    {currentIntro?<div className="corner-dialogue-actions"><span>{intro!+1} / {HILLS_OPENING.length}</span><button className="corner-quiet-button" onClick={finishIntro}><SkipForward size={13} aria-hidden="true"/>TAKE CONTROL</button><button className="corner-solid-button" onClick={advanceIntro}>{intro===HILLS_OPENING.length-1?'INVESTIGATE':'NEXT'}<ArrowRight size={16} aria-hidden="true"/></button></div>:<div className="corner-cast-actions"><span>TALK TO</span>{(['owner','oscar','supplier'] as const).map(id=><button key={id} onClick={()=>talk(id)} aria-label={`Talk to ${HILLS_CAST[id].name}`}>{SHORT_NAME[id]}<MessageCircle size={12} aria-hidden="true"/></button>)}{line&&<button className="corner-listen" onClick={()=>{setLine(null);setDetail(null);setReading(null);}}>LISTEN TO THE HARBOUR</button>}</div>}
   </section>
   <aside className="corner-case" aria-label="Current objective and evidence">
    <div className="corner-case-title"><Search size={14} aria-hidden="true"/><span>{resolved?'GALA SETTLED':'CHARITY BEGINS AT THE BAR'}</span>{resolved&&<Check size={15} aria-hidden="true"/>}</div>
    <p>{objective}</p>
    <div className="corner-evidence">{CLUES.map(id=><button key={id} className={clues.includes(id)?'is-found':resolved?'is-archive':''} onClick={()=>resolved||clues.includes(id)?void collectClue(id):id==='invoice'?view==='harbour'?enterOffice():void collectClue(id):talk('oscar')} aria-label={`${id==='invoice'?'Invoice':'Guest list'}. ${clues.includes(id)?'Saved. Read again.':resolved?'Archived story evidence. Read only; your ending stays saved.':'Not collected. Find this clue.'}`}><span>{clues.includes(id)?<Check size={13} aria-hidden="true"/>:resolved?<Eye size={13} aria-hidden="true"/>:<span className="corner-empty-evidence"/>}</span><b className="hills-evidence-label">{id==='invoice'?'INVOICE':'GUEST LIST'}{resolved&&!clues.includes(id)&&<small>ARCHIVE</small>}</b></button>)}</div>
    <button className="corner-objective-action" onClick={actOnObjective}>{resolved?<><Eye size={15} aria-hidden="true"/>{deciding?'CLOSE STORY REPLAY':'READ OTHER ENDINGS'}</>:!hasInvoice?<><DoorOpen size={15} aria-hidden="true"/>{view==='office'?'INSPECT THE INVOICE':'ENTER THE HARBOUR OFFICE'}</>:!hasGuestList?<><MessageCircle size={15} aria-hidden="true"/>ASK OSCAR FOR THE LIST</>:<><Search size={15} aria-hidden="true"/>CONFRONT GOBSTEIN</>}<ChevronRight size={15} aria-hidden="true"/></button>
   </aside>
  </div>

  {audioError&&<p className="corner-audio-note" role="status">{audioError}</p>}
  {gate&&!resolved&&<div className={`corner-save-gate ${readOnly?'is-read-only':''}`} role="status"><LockKeyhole size={16} aria-hidden="true"/><span>{gate}</span>{readOnly?<button onClick={clearError} disabled={busy}>RECONNECT</button>:!city&&connected?<button onClick={onBack}>FOUND YOUR BLOCK<ArrowUpRight size={13} aria-hidden="true"/></button>:null}</div>}
  {notice&&<p className="corner-notice" role="alert">{notice}</p>}

  {(deciding||resolved)&&<section className={`corner-resolution ${alternative?'is-alternate':''}`} aria-label={resolved?'Saved harbour ending and story replay':'Choose the ending of the gala investigation'}>
   <div className="corner-resolution-heading"><div><span>{resolved?alternative?'ALTERNATE / NO REWARD':'ON THE RECORD / REWARD COLLECTED ONCE':'ONE INVOICE. NO CHARITY ACCOUNT.'}</span><h2>{resolved?venue.choices[viewing!].label:'WHO’S PAYING FOR THIS FUCKING GALA?'}</h2></div>{!resolved&&<button className="corner-quiet-button" onClick={()=>setDeciding(false)}>BACK TO THE HARBOUR</button>}</div>
   {resolved&&<div className="corner-saved-story"><p>{venue.choices[viewing!].outcome}</p>{alternative?<button className="corner-quiet-button" onClick={()=>{setReading(null);setLine(ending);}}><RotateCcw size={13} aria-hidden="true"/>RETURN TO YOUR SAVED ENDING</button>:<Reward reward={venue.choices[chosen].reward}/>}</div>}
   {(deciding||!resolved)&&<ol className="corner-ending-choices">{venue.choices.map((choice,index)=><li key={choice.label}><button disabled={!resolved&&(!writable||!hasBoth)} className={chosen===index?'is-saved':''} onClick={()=>void choose(index as 0|1|2)}><span className="corner-choice-number">{chosen===index?<Check size={17} aria-hidden="true"/>:String(index+1).padStart(2,'0')}</span><span><b>{choice.label}</b>{resolved?<small>{chosen===index?'YOUR SAVED ENDING':'STORY ONLY / NO EXTRA REWARD'}</small>:<Reward reward={choice.reward}/>}</span>{saving===`ending-${index}`?<LoaderCircle className="corner-spinner" size={17} aria-label="Saving ending"/>:resolved?<Eye size={17} aria-hidden="true"/>:<ArrowUpRight size={18} aria-hidden="true"/>}</button></li>)}</ol>}
   {resolved&&!alternative&&<div className="corner-reward-route"><span>YOUR REWARD IS SAVED.</span>{venue.choices[chosen].reward.packs?<Link href="/packs/">OPEN YOUR PACK<ArrowUpRight size={15} aria-hidden="true"/></Link>:venue.choices[chosen].reward.scrap?<Link href="/market/">USE TRASH IN THE MARKET<ArrowUpRight size={15} aria-hidden="true"/></Link>:<button onClick={onBack}>USE INFLUENCE ON YOUR BLOCK<ArrowUpRight size={15} aria-hidden="true"/></button>}<button className="corner-quiet-button" onClick={()=>{setIntro(0);setLine(null);setDetail(null);setView('harbour');}}>REPLAY THE OPENING / STORY ONLY</button></div>}
  </section>}

  <nav className="corner-addresses" aria-label="Other specialist buildings in Liability Hills"><span>THE REST OF THE HILLS</span><div>{ADDRESSES.map((id,index)=><button key={id} onClick={()=>onEnter(id)}><small>0{index+2}</small>{CITY_ZONE_BY_ID[id].name}{city?.zoneEndings[id]!==undefined?<Check size={13} aria-label="Ending saved"/>:<ArrowUpRight size={13} aria-hidden="true"/>}</button>)}</div></nav>
 </section>;
}
