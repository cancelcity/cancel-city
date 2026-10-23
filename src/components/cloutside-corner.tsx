'use client';

import Link from 'next/link';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ArrowLeft,ArrowRight,ArrowUpRight,Check,ChevronRight,DoorOpen,Eye,FileText,LoaderCircle,LockKeyhole,MessageCircle,Pause,Play,RotateCcw,Search,SkipForward,Ticket,Trash2,Volume2,VolumeX,Zap} from 'lucide-react';
import {CORNER_CAST,CORNER_CLUES,CORNER_ENDINGS,CORNER_OPENING,type CornerClueId,type CornerLine,type CornerSpeaker} from '../data/cloutside-corner';
import {CITY_ZONE_BY_ID,type CityZoneId,type CityZoneReward} from '../data/city-zones';
import {useGame} from '../state/store';
import {useCornerAudio} from './use-corner-audio';

const ADDRESSES=['kfc','fade-court','sole-custody','360-records'] as const;
const ACTOR_POSITION:Record<CornerSpeaker,{x:number;y:number;width:number}>={overlord:{x:55,y:76,width:21},dealer:{x:27,y:82,width:17},detective:{x:80,y:82,width:18}};
const ATLAS:Record<CornerSpeaker,string>={overlord:'overlord',dealer:'dealer',detective:'detective'};
const CLUE_IDS:CornerClueId[]=['receipt','statement'];

function Reward({reward,storyOnly=false}:{reward:CityZoneReward;storyOnly?:boolean}){
 return <span className={`corner-reward ${storyOnly?'is-story-only':''}`}>
  {!!reward.packs&&<span><Ticket size={13} aria-hidden="true"/>+{reward.packs} PACK TICKET</span>}
  {!!reward.influence&&<span><Zap size={13} aria-hidden="true"/>+{reward.influence} INFLUENCE</span>}
  {!!reward.scrap&&<span><Trash2 size={13} aria-hidden="true"/>+{reward.scrap} TRASH</span>}
 </span>;
}

export function CloutsideCorner({onEnter,onBack,initialInterior=false}:{onEnter:(id:CityZoneId)=>void;onBack:()=>void;initialInterior?:boolean}){
 const {save,run,busy,error,hydrated,mode,migration,clearError}=useGame();
 const city=save?.city,chosen=city?.zoneEndings['probable-cause'],resolved=chosen!==undefined;
 const clues=city?.cornerClues??[],hasReceipt=clues.includes('receipt'),hasStatement=clues.includes('statement'),hasBoth=hasReceipt&&hasStatement;
 const savedEnding=resolved?CORNER_ENDINGS[chosen]:null,venue=CITY_ZONE_BY_ID['probable-cause'];
 const [view,setView]=useState<'street'|'inside'>(initialInterior?'inside':'street');
 const [intro,setIntro]=useState<number|null>(initialInterior?null:0),[line,setLine]=useState<CornerLine|null>(null),[detail,setDetail]=useState<CornerClueId|null>(null);
 const [focused,setFocused]=useState<CornerSpeaker>('overlord'),[paused,setPaused]=useState(false),[reduced,setReduced]=useState(false);
 const {enabled,toggle,playCue,error:audioError}=useCornerAudio(paused);
 const [arrived,setArrived]=useState(false),[arriving,setArriving]=useState(false),[ambient,setAmbient]=useState(0);
 const [deciding,setDeciding]=useState(false),[reading,setReading]=useState<0|1|2|null>(null),[notice,setNotice]=useState(''),[saving,setSaving]=useState<string|null>(null);
 const [frameWidth,setFrameWidth]=useState(1100);
 const viewport=useRef<HTMLDivElement>(null),initialized=useRef(false),commandLock=useRef(false),arrivalPlayed=useRef(false);
 const motionOff=paused||reduced;
 const connected=hydrated&&(mode==='cloud'||mode==='local')&&!migration&&!error;
 const writable=connected&&!!city&&!busy;
 const readOnly=mode==='offline'||!!error;
 const gate=!hydrated||mode==='loading'?'Connecting your save…':migration?'Choose your saved game in the save bar first.':readOnly?'Your save is read-only. You can explore; reconnect to keep evidence.':!city?'Found your block to keep evidence and save an ending.':busy?'Saving…':'';

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
  if(resolved||clues.length){setIntro(null);setArrived(true);}
 },[hydrated,resolved,clues.length]);
 useEffect(()=>{
  if(!hydrated||arrived||paused)return;
  const timer=window.setTimeout(()=>{setArrived(true);setArriving(!reduced);if(!arrivalPlayed.current){playCue('arrival');arrivalPlayed.current=true;}},650);
  return()=>window.clearTimeout(timer);
 },[hydrated,arrived,paused,reduced,playCue]);
 useEffect(()=>{
  if(!arriving||paused)return;
  const timer=window.setTimeout(()=>setArriving(false),2300);return()=>window.clearTimeout(timer);
 },[arriving,paused]);
 useEffect(()=>{
  if(motionOff||intro!==null||line||deciding||document.hidden)return;
  const timer=window.setInterval(()=>setAmbient(value=>value+1),9500);return()=>window.clearInterval(timer);
 },[motionOff,intro,line,deciding]);
 useEffect(()=>{if(intro!==null)setFocused(CORNER_OPENING[intro].speaker);},[intro]);

 const worldWidth=Math.max(frameWidth,740),worldHeight=worldWidth*9/16;
 const actorX=(id:CornerSpeaker)=>{
  if(view==='inside')return id==='overlord'?66:ACTOR_POSITION[id].x;
  if(id==='detective'&&resolved)return chosen===1?91:chosen===2?33:72;
  if(id==='dealer'&&resolved)return chosen===2?45:chosen===1?24:29;
  return ACTOR_POSITION[id].x;
 };
 const focusX=view==='inside'?(detail==='receipt'?72:actorX('overlord')):actorX(focused);
 const offset=Math.max(0,Math.min(worldWidth-frameWidth,worldWidth*focusX/100-frameWidth/2));
 const currentIntro=intro!==null?CORNER_OPENING[intro]:null;
 const ambientSpeaker:CornerSpeaker=view==='inside'?'overlord':(['dealer','overlord','detective'] as const)[ambient%3];
 const ambientLine=resolved&&ambientSpeaker==='dealer'?savedEnding!.dealerLine:resolved&&ambientSpeaker==='detective'?savedEnding!.detectiveLine:CORNER_CAST[ambientSpeaker].ambient[Math.floor(ambient/3)%3];
 const currentLine=currentIntro??line??{speaker:ambientSpeaker,line:resolved&&ambientSpeaker==='overlord'?savedEnding!.line:ambientLine};
 const viewing=reading??chosen;
 const alternative=resolved&&reading!==null&&reading!==chosen;
 const objective=resolved?'The corner remembers. Your first ending is saved.':!hasReceipt?'Go inside. Check the inspector’s receipt.':!hasStatement?'Ask Gandalf what he saw at the counter.':'Show both clues to Detective L Ratio.';

 function finishIntro(){setIntro(null);setLine(null);setReading(null);setArrived(true);setArriving(false);setFocused('overlord');}
 function advanceIntro(){if(intro===null)return;if(intro===CORNER_OPENING.length-1)finishIntro();else setIntro(intro+1);}
 function enterShop(){finishIntro();setView('inside');setFocused('overlord');setDetail(null);setLine({speaker:'overlord',line:CORNER_CAST.overlord.firstLine});playCue('door');}
 function leaveShop(){setView('street');setDetail(null);setLine(null);setReading(null);setFocused(hasBoth?'detective':'dealer');playCue('door');}
 async function collectClue(id:CornerClueId){
  finishIntro();setFocused(CORNER_CLUES[id].speaker);setDetail(id);setLine(CORNER_CLUES[id]);setNotice('');
  if(id==='statement')setView('street');
  playCue('paper');
  if(clues.includes(id)||resolved)return;
  if(!writable){setNotice(gate||'Your save is not ready. The clue will stay here.');return;}
  if(commandLock.current)return;
  commandLock.current=true;setSaving(id);
  try{if(!await run({type:'city-corner-clue',clueId:id}))setNotice('Evidence was not saved. Your clue is still here; reconnect and try again.');}
  finally{commandLock.current=false;setSaving(null);}
 }
 function talk(id:CornerSpeaker){
  finishIntro();setFocused(id);setDetail(null);setNotice('');
  if(id!=='overlord')setView('street');
  if(id==='dealer'&&!resolved){void collectClue('statement');return;}
  if(id==='detective'&&hasBoth&&!resolved){setDeciding(true);setLine({speaker:'detective',line:'It is not a loyalty card. It is a chronological record of official visits.'});return;}
  const quote=resolved?(id==='dealer'?savedEnding!.dealerLine:id==='detective'?savedEnding!.detectiveLine:savedEnding!.line):CORNER_CAST[id].firstLine;
  setLine({speaker:id,line:quote});
 }
 async function choose(index:0|1|2){
  if(resolved){setReading(index);setLine(CORNER_ENDINGS[index]);setDetail(null);return;}
  if(!writable||!hasBoth||commandLock.current)return;
  commandLock.current=true;setSaving(`ending-${index}`);setNotice('');
  try{
   if(await run({type:'city-zone-choice',zoneId:'probable-cause',choice:index})){
    setDeciding(false);setReading(null);setLine(CORNER_ENDINGS[index]);setFocused(CORNER_ENDINGS[index].speaker);setDetail(null);playCue('resolve');
   }else setNotice('The ending was not saved. Keep your clues and try again once connected.');
  }finally{commandLock.current=false;setSaving(null);}
 }
 function actOnObjective(){
  if(resolved){if(deciding){setDeciding(false);setReading(null);setLine(savedEnding);}else setDeciding(true);return;}
  if(!hasReceipt){if(view==='street')enterShop();else void collectClue('receipt');}
  else if(!hasStatement)talk('dealer');
  else talk('detective');
 }

 return <section className={`cloutside-corner ${motionOff?'is-paused':''} ${resolved?'is-resolved':''}`} data-scene={view} aria-labelledby="cloutside-corner-title">
  <header className="corner-header">
   <div className="corner-location"><button onClick={onBack}><ArrowLeft size={15} aria-hidden="true"/>CITY</button><ChevronRight size={12} aria-hidden="true"/><h1 id="cloutside-corner-title">CLOUTSIDE</h1><span>PROBABLE CAUSE / DISPENSARY CORNER</span></div>
   <div className="corner-controls"><button onClick={()=>setPaused(value=>!value)} aria-pressed={paused} aria-label={paused?'Resume scene animation':'Pause scene animation'}>{paused?<Play size={15} aria-hidden="true"/>:<Pause size={15} aria-hidden="true"/>}<span>{paused?'PLAY':'PAUSE'}</span></button><button onClick={()=>void toggle()} aria-pressed={enabled} aria-label={enabled?'Turn off neighbourhood sound':'Turn on neighbourhood sound'}>{enabled?<Volume2 size={15} aria-hidden="true"/>:<VolumeX size={15} aria-hidden="true"/>}<span>SOUND {enabled?'ON':'OFF'}</span></button></div>
  </header>

  <div ref={viewport} className="corner-viewport" style={{height:worldHeight}} aria-label={view==='street'?'Cloutside street. Talk to the characters or enter the dispensary.':'Inside Probable Cause Dispensary. Inspect the counter receipt.'}>
   <div className="corner-world" style={{width:worldWidth,height:worldHeight,transform:`translateX(-${offset}px)`} as CSSProperties}>
    <img className="corner-scene-art" src={`/assets/city-v4/corner-${view==='street'?'exterior':'interior'}.webp`} alt={view==='street'?'A neon dispensary on a hand-painted Cloutside street at dusk.':'The dispensary counter, shelves and lounge, lit from a street window.'} width={1600} height={900} draggable={false}/>
    <div className="corner-light-wash" aria-hidden="true"/><div className="corner-neon-spill" aria-hidden="true"/>
    <div className="corner-window-glow" aria-hidden="true"/>
    {view==='street'&&<><div className="corner-smoke" aria-hidden="true"><i/><i/><i/></div><div className="corner-road-glint" aria-hidden="true"/>
     <button className="corner-door" onClick={enterShop} aria-label="Enter Probable Cause Dispensary"><span><DoorOpen size={14} aria-hidden="true"/>ENTER</span></button>
     {resolved&&<div className={`corner-aftermath-sign ending-${chosen}`} aria-label={`The shop sign now reads: ${savedEnding!.sign}`}><small>NEW HOUSE RULE</small><b>{savedEnding!.sign}</b></div>}
    </>}
    {view==='inside'&&<button className={`corner-receipt-hotspot ${hasReceipt?'is-found':''}`} onClick={()=>void collectClue('receipt')} aria-label={hasReceipt?'Read the inspector’s receipt again':'Inspect the receipt on the counter'}><span className="corner-hotspot-ring"/><FileText size={22} aria-hidden="true"/><span>{hasReceipt?'READ RECEIPT':'INSPECT RECEIPT'}</span></button>}
    {(view==='inside'?['overlord'] as const:['dealer','overlord','detective'] as const).map(id=>{
     const position=ACTOR_POSITION[id],talking=currentLine.speaker===id,frame=talking?(detail?'response':'gesture'):'idle';
     const y=view==='inside'?64:position.y;
     return <button key={id} className={`corner-actor actor-${id} frame-${frame} ${focused===id?'is-focused':''} ${id==='detective'&&!arrived?'is-offstage':''} ${id==='detective'&&arriving?'is-arriving':''}`} style={{left:`${actorX(id)}%`,bottom:`${100-y}%`,width:`${view==='inside'?24:position.width}%`} as CSSProperties} onClick={()=>talk(id)} aria-label={`Talk to ${CORNER_CAST[id].name}. ${CORNER_CAST[id].role}`}>
      <span className="corner-actor-shadow" aria-hidden="true"/><span className="corner-actor-sprite" style={{backgroundImage:`url(/assets/city-v4/${ATLAS[id]}-atlas.webp)`}} aria-hidden="true"/><span className="corner-actor-name">{CORNER_CAST[id].name}<MessageCircle size={11} aria-hidden="true"/></span>
     </button>;
    })}
    <img className="corner-foreground" src={`/assets/city-v4/${view==='street'?'corner-foreground':'corner-counter'}.webp`} alt="" aria-hidden="true" draggable={false}/>
    <div className="corner-scene-vignette" aria-hidden="true"/>
   </div>
   <div className="corner-scene-caption"><span className="corner-open-dot"/>7:42 PM<span>/</span>{view==='inside'?'OPEN. NO ONE KNOWS UNTIL WHEN.':'THE BLOCK IS STILL OPEN.'}</div>
   {view==='inside'&&<button className="corner-exit" onClick={leaveShop}><ArrowLeft size={15} aria-hidden="true"/>BACK TO THE STREET</button>}
   {frameWidth<740&&<div className="corner-camera-tabs" aria-label="Look around the street">{(view==='inside'?['overlord'] as const:['dealer','overlord','detective'] as const).map(id=><button key={id} aria-pressed={focused===id} onClick={()=>{setFocused(id);setLine(null);setDetail(null);}}>{id==='overlord'?'SHOP':id==='dealer'?'THE PLUG':'DETECTIVE'}</button>)}</div>}
  </div>

  <div className="corner-play-dock">
   <section className={`corner-dialogue speaker-${currentLine.speaker}`} aria-label="Street conversation">
    <div className="corner-dialogue-head"><span>{CORNER_CAST[currentLine.speaker].name}</span><small>{currentIntro?'THE FOURTH INSPECTION':alternative?'ALTERNATE ENDING / STORY ONLY':detail?'EVIDENCE':resolved?'AFTER THE INCIDENT':CORNER_CAST[currentLine.speaker].role}</small></div>
    <p aria-live={line||currentIntro?'polite':'off'}>“{currentLine.line}”</p>
    {detail&&<div className="corner-clue-detail"><FileText size={15} aria-hidden="true"/><span><b>{CORNER_CLUES[detail].title}{clues.includes(detail)&&<Check size={12} aria-label="Evidence saved"/>}</b>{CORNER_CLUES[detail].detail}</span></div>}
    {currentIntro?<div className="corner-dialogue-actions"><span>{intro!+1} / {CORNER_OPENING.length}</span><button className="corner-quiet-button" onClick={finishIntro}><SkipForward size={13} aria-hidden="true"/>TAKE CONTROL</button><button className="corner-solid-button" onClick={advanceIntro}>{intro===CORNER_OPENING.length-1?'INVESTIGATE':'NEXT'}<ArrowRight size={16} aria-hidden="true"/></button></div>:<div className="corner-cast-actions"><span>TALK TO</span>{(['overlord','dealer','detective'] as const).map(id=><button key={id} onClick={()=>talk(id)} aria-label={`Talk to ${CORNER_CAST[id].name}`}>{id==='overlord'?'420':id==='dealer'?'THE PLUG':'L RATIO'}<MessageCircle size={12} aria-hidden="true"/></button>)}{line&&<button className="corner-listen" onClick={()=>{setLine(null);setDetail(null);setReading(null);}}>LISTEN TO THE STREET</button>}</div>}
   </section>
   <aside className="corner-case" aria-label="Current objective and evidence">
    <div className="corner-case-title"><Search size={14} aria-hidden="true"/><span>{resolved?'CASE CLOSED':'A VERY REGULAR CUSTOMER'}</span>{resolved&&<Check size={15} aria-hidden="true"/>}</div>
    <p>{objective}</p>
    <div className="corner-evidence">{CLUE_IDS.map(id=><button key={id} className={clues.includes(id)?'is-found':''} onClick={()=>clues.includes(id)?void collectClue(id):id==='receipt'?view==='street'?enterShop():void collectClue(id):talk('dealer')} aria-label={`${id==='receipt'?'Receipt':'Witness statement'}. ${clues.includes(id)?'Saved. Read again.':'Not collected. Find this clue.'}`}><span>{clues.includes(id)?<Check size={13} aria-hidden="true"/>:<span className="corner-empty-evidence"/>}</span>{id==='receipt'?'RECEIPT':'WITNESS'}</button>)}</div>
    <button className="corner-objective-action" onClick={actOnObjective}>{resolved?<><Eye size={15} aria-hidden="true"/>{deciding?'CLOSE STORY REPLAY':'READ OTHER ENDINGS'}</>:!hasReceipt?<><DoorOpen size={15} aria-hidden="true"/>{view==='inside'?'INSPECT THE RECEIPT':'ENTER THE DISPENSARY'}</>:!hasStatement?<><MessageCircle size={15} aria-hidden="true"/>ASK THE PLUG</>:<><Search size={15} aria-hidden="true"/>CONFRONT L RATIO</>}<ChevronRight size={15} aria-hidden="true"/></button>
   </aside>
  </div>

  {audioError&&<p className="corner-audio-note" role="status">{audioError}</p>}
  {gate&&!resolved&&<div className={`corner-save-gate ${readOnly?'is-read-only':''}`} role="status"><LockKeyhole size={16} aria-hidden="true"/><span>{gate}</span>{readOnly?<button onClick={clearError} disabled={busy}>RECONNECT</button>:!city&&connected?<button onClick={onBack}>FOUND YOUR BLOCK<ArrowUpRight size={13} aria-hidden="true"/></button>:null}</div>}
  {notice&&<p className="corner-notice" role="alert">{notice}</p>}

  {(deciding||resolved)&&<section className={`corner-resolution ${alternative?'is-alternate':''}`} aria-label={resolved?'Saved ending and story replay':'Choose the ending of this investigation'}>
   <div className="corner-resolution-heading"><div><span>{resolved?alternative?'ALTERNATE / NO REWARD':'ON THE RECORD / REWARD COLLECTED ONCE':'TWO CLUES. ONE VERY LOYAL CUSTOMER.'}</span><h2>{resolved?venue.choices[viewing!].label:'WHAT DO YOU DO WITH THE RECEIPTS?'}</h2></div>{!resolved&&<button className="corner-quiet-button" onClick={()=>setDeciding(false)}>BACK TO THE CORNER</button>}</div>
   {resolved&&<div className="corner-saved-story"><p>{venue.choices[viewing!].outcome}</p>{alternative?<button className="corner-quiet-button" onClick={()=>{setReading(null);setLine(savedEnding);}}><RotateCcw size={13} aria-hidden="true"/>RETURN TO YOUR SAVED ENDING</button>:<Reward reward={venue.choices[chosen].reward}/>}</div>}
   {(deciding||!resolved)&&<ol className="corner-ending-choices">{venue.choices.map((choice,index)=><li key={choice.label}><button disabled={!resolved&&(!writable||!hasBoth)} className={chosen===index?'is-saved':''} onClick={()=>void choose(index as 0|1|2)}><span className="corner-choice-number">{chosen===index?<Check size={17} aria-hidden="true"/>:String(index+1).padStart(2,'0')}</span><span><b>{choice.label}</b>{resolved?<small>{chosen===index?'YOUR SAVED ENDING':'STORY ONLY / NO EXTRA REWARD'}</small>:<Reward reward={choice.reward}/>}</span>{saving===`ending-${index}`?<LoaderCircle className="corner-spinner" size={17} aria-label="Saving ending"/>:resolved?<Eye size={17} aria-hidden="true"/>:<ArrowUpRight size={18} aria-hidden="true"/>}</button></li>)}</ol>}
   {resolved&&!alternative&&<div className="corner-reward-route"><span>YOUR REWARD IS SAVED.</span>{venue.choices[chosen].reward.packs?<Link href="/packs/">OPEN YOUR PACK<ArrowUpRight size={15} aria-hidden="true"/></Link>:venue.choices[chosen].reward.scrap?<Link href="/market/">USE TRASH IN THE MARKET<ArrowUpRight size={15} aria-hidden="true"/></Link>:<button onClick={onBack}>USE INFLUENCE ON YOUR BLOCK<ArrowUpRight size={15} aria-hidden="true"/></button>}<button className="corner-quiet-button" onClick={()=>{setIntro(0);setLine(null);setDetail(null);setView('street');}}>REPLAY THE OPENING / STORY ONLY</button></div>}
  </section>}

  <nav className="corner-addresses" aria-label="Other specialist buildings in Cloutside"><span>NEIGHBOURHOOD ADDRESSES</span><div>{ADDRESSES.map((id,index)=><button key={id} onClick={()=>onEnter(id)}><small>0{index+2}</small>{CITY_ZONE_BY_ID[id].name}{city?.zoneEndings[id]!==undefined?<Check size={13} aria-label="Ending saved"/>:<ArrowUpRight size={13} aria-hidden="true"/>}</button>)}</div></nav>
 </section>;
}
