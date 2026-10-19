'use client';
import Link from 'next/link';
import {AirfryerCase} from './airfryer-case';
import {VERDICTS} from '../domain/airfryer';
import {useRouter,useSearchParams} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,ArrowUpCircle,Crown,Flame,HelpCircle,Home,Radio,Sparkles,Swords,Ticket,UserPlus,Users} from 'lucide-react';
import {useGame} from '../state/store';
import {dailyEligible,type Command} from '../domain/game';
import {cityCanCollect,cityProduction,influenceRate} from '../domain/city';
import {buildingOf,CITY_BALANCE} from '../data/city';
import {CARD_BY_ID} from '../data/cards';
import {CITY_EVENTS,CITY_EVENT_BY_ID} from '../data/city-events';
import {PROP_BY_ID} from '../data/props';
import {LOCAL_LINES} from '../domain/living-city';
import {Portrait} from './card';
import {Dialog} from './dialog';
import {useCityMotion} from './city-motion';
import {CityManagement} from './city-management';
import {CityEventBoard} from './city-events';
import {CityIncidents} from './city-incident';
import {useCinematicMode} from './special-cinematic';
import {LivingCityWorld} from './living-city-world';
import {CityGameHeader,CityGameNavigation} from './game-chrome';

const RIVAL_BLOCKS=[
 {
  handle:'SOLANA_WHALE_99',
  blockName:'RUG PULL PENTHOUSE',
  bounty:'+450 CLOUT · +1 PACK',
  heat:'★★★★★',
  taunt:'“My hardware wallet is insured by your rent money.”',
  crew:['CC031','CC023','CC063'] as const,
 },
 {
  handle:'HR_FINAL_BOSS',
  blockName:'MANDATORY WELLNESS PLAZA',
  bounty:'+450 CLOUT · +1 PACK',
  heat:'★★★★☆',
  taunt:'“We scheduled your cancellation for 4:45 PM on Friday.”',
  crew:['CC008','CC006','CC054'] as const,
 },
 {
  handle:'DOOMSCROLL_KING',
  blockName:'BASEMENT SERVER FARM',
  bounty:'+450 CLOUT · +1 PACK',
  heat:'★★★★★',
  taunt:'“I have 40 terabytes of 2014 screenshots ready.”',
  crew:['CC002','CC003','CC001'] as const,
 },
];

export function CityScreen(){
 const {save,enter,run,busy,error,hydrated,mode}=useGame(),router=useRouter(),params=useSearchParams(),reduced=useCityMotion(),[sceneMode,setSceneMode]=useCinematicMode('cancel-city.city-cinematics.v1');
 const [inspectorOpen,setInspectorOpen]=useState(false),[selected,setSelected]=useState('plot-1'),[paused,setPaused]=useState(false),[manager,setManager]=useState<{plot:number;tab:'plot'|'stories'|'jobs'}|null>(params.get('tab')==='jobs'||params.get('tab')==='stories'?{plot:0,tab:params.get('tab') as 'jobs'|'stories'}:null),[drama,setDrama]=useState(false),[help,setHelp]=useState(false),[beefOpen,setBeefOpen]=useState(false),[beefVerdict,setBeefVerdict]=useState<string|null>(null),[raidOpen,setRaidOpen]=useState(false),[lootBursts,setLootBursts]=useState<{id:number;label:string;tone:'acid'|'pink'|'cyan'}[]>([]),[notice,setNotice]=useState(''),[clock,setClock]=useState<Date|null>(null),[departing,setDeparting]=useState<string|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{setClock(new Date());const t=setInterval(()=>setClock(new Date()),30000);return()=>{clearInterval(t);if(timer.current)clearTimeout(timer.current);};},[]);
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(''),4600);return()=>clearTimeout(t);},[notice]);
 const spawnLoot=(label:string,tone:'acid'|'pink'|'cyan'='acid')=>{
  const id=Date.now()+Math.floor(Math.random()*1000);
  setLootBursts(prev=>[...prev,{id,label,tone}]);
  setTimeout(()=>setLootBursts(prev=>prev.filter(item=>item.id!==id)),1350);
 };
 const city=save?.city||null,plot=selected.startsWith('plot-')?Number(selected.slice(5)):1,building=city?.plots[plot]||null,definition=building?buildingOf(building.kind):null,resident=selected.startsWith('CC')?CARD_BY_ID[selected]:null,disabled=busy||!!error||mode==='offline';
 const income=city?cityProduction(city):0,canCollect=!!city&&!!clock&&cityCanCollect(city,clock);
 const mutate=async(command:Command,message:string,loot?:{label:string;tone:'acid'|'pink'|'cyan'})=>{if(await run(command)){setNotice(message);if(loot)spawnLoot(loot.label,loot.tone);return true;}return false;};
 const found=async()=>{if(!save&&!await enter())return;if(await mutate({type:'city-start'},'YOUR BLOCK IS OPEN. +200 INFLUENCE.',{label:'+200 INFLUENCE 👑',tone:'acid'}))setSelected('plot-1');};
 const manage=(tab:'plot'|'stories'|'jobs'='plot')=>setManager({plot,tab});
 const collect=async()=>{
  if(!city){await found();return;}
  if(canCollect){await mutate({type:'city-collect'},`+${income} INFLUENCE. TODAY’S PICKUP IS SAVED.`,{label:`+${income} INFLUENCE 👑`,tone:'acid'});return;}
  if(plot===1&&!building&&city.influence>=buildingOf('afterparty').cost){
   await mutate({type:'city-build',plot:1,kind:'afterparty'},'AIRFRYER PALACE OPENED. ASSIGN A RESIDENT TO COOK.',{label:'BUILT AIRFRYER PALACE ⚡',tone:'pink'});
   return;
  }
  setNotice('Production is collected once per UTC day.');
  manage('plot');
 };
 const door=(e:React.MouseEvent<HTMLAnchorElement>,id:string,href:string)=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();if(departing)return;setDeparting(id);timer.current=setTimeout(()=>router.push(href),reduced?0:330);};
 const activeEvent=city?.activeEvent&&clock&&Date.parse(city.activeEvent.endsAt)>clock.getTime()?CITY_EVENT_BY_ID[city.activeEvent.eventId]:null;
 const nextBeefEvent=activeEvent||CITY_EVENTS.find(e=>!city?.eventEndings||!Object.hasOwn(city.eventEndings,e.id))||CITY_EVENTS[0];
 const resolveStreetBeef=async(choice:0|1|2)=>{
  if(!city){await found();return;}
  const ev=nextBeefEvent;
  if(city.activeEvent?.eventId!==ev.id&&!await run({type:'city-event-start',eventId:ev.id}))return;
  const ok=await run({type:'city-event-choice',eventId:ev.id,choice});
  if(!ok)return;
  const rewardLabel=choice===0?'+1 FREE PACK 🎟':choice===1?'+25 INFLUENCE 👑':'+6 SCRAP ⚙';
  const rewardTone=choice===0?'pink':choice===1?'acid':'cyan';
  spawnLoot(rewardLabel,rewardTone);
  setBeefVerdict(ev.endings[choice]);
  if(ok)setNotice(`STREET BEEF SETTLED: ${rewardLabel}`);
 };
 const runSafeHustle=async()=>{if(!save&&!await enter())return;await mutate({type:'clout-scheme',scheme:'safe'},'SPONSORED POST SAVED. +40 CLOUT.',{label:'+40 CLOUT',tone:'acid'});};
 const runHighRiskScheme=async()=>{if(!save&&!await enter())return;await mutate({type:'clout-scheme',scheme:'risk'},'SPONSOR SPOTLIGHT SAVED. +250 CLOUT +1 PACK.',{label:'+250 CLOUT · +1 PACK',tone:'pink'});};
 const display=save?.props.cityDisplay?PROP_BY_ID[save.props.cityDisplay]?.art:undefined;

 const hourlyRate=building?influenceRate(building):0;
 const upgradeAction=async()=>{
  if(!city){await found();return;}
  if(!building){
   if(plot===1&&city.influence>=buildingOf('afterparty').cost){
    await mutate({type:'city-build',plot:1,kind:'afterparty'},'AIRFRYER PALACE LEASED.',{label:'NEW LEASE SIGNED ⚡',tone:'pink'});
    return;
   }
   manage('plot');
   return;
  }
  if(building.level<3){
   const cost=CITY_BALANCE.upgradeCosts[(building.level+1) as 2|3];
   if(city.influence>=cost){
    await mutate({type:'city-upgrade',plot},`${(definition?.name||'BUILDING').toUpperCase()} UPGRADED TO LVL ${building.level+1}.`,{label:`UPGRADED LVL ${building.level+1}! ⚡`,tone:'cyan'});
    return;
   }
  }
  manage('plot');
 };

 const inspectorCard=resident?resident:selected==='court'?CARD_BY_ID.CC002:selected==='packs'?CARD_BY_ID.CC063:plot===11&&!building?CARD_BY_ID.CC023:plot===4&&!building?CARD_BY_ID.CC064:building?.residentId?CARD_BY_ID[building.residentId]:CARD_BY_ID.CC135;
 const inspectorTitle=resident?resident.name.toUpperCase():selected==='court'?'SCREENSHOT COURT':selected==='packs'?'OPEN PACKS':plot===11&&!building?'RUG ALLEY':plot===4&&!building?'PROP STASH':plot===1?'AIRFRYER PALACE':definition?definition.name.toUpperCase():plot===2?'APOLOGY FACTORY':plot===0?'COLLECTION DOSSIER':plot===3?'CITY JOBS BOARD':`PLOT #${plot+1} · BUILD HERE`;

 return <div className="living-city-page" data-departing={!!departing}>
  <h1 className="sr-only">Cancel City — The Receipts District</h1>
  <CityGameHeader/>
  <LivingCityWorld city={city} selected={selected} onSelect={id=>{setSelected(id);setInspectorOpen(true);}} caseSign={save?.airfryer.outcome?VERDICTS[save.airfryer.outcome].sign:save?.airfryer.route?"CASE 001 / HEARING PENDING":undefined} reduced={reduced||sceneMode==='off'} paused={paused||!!manager||drama||help||raidOpen} onPause={()=>setPaused(p=>!p)} entering={departing} prop={display}>
   {inspectorOpen&&<aside className="city-inspector-card scheme-drawer-mode" aria-label="Selected city location and scheme drawer">
    <button className="case-inspector-close" aria-label="Close building details" onClick={()=>setInspectorOpen(false)}>×</button><div className="inspector-top-grid">
     <div className="inspector-portrait-box">
      <Portrait card={inspectorCard}/>
      <span className="inspector-corner-crown" aria-hidden="true"><Crown size={12}/></span>
     </div>
     <div className="inspector-right-col">
      <div className="inspector-titles">
       <h2>{inspectorTitle}</h2>
       <p>BUILDING · {hourlyRate}/DAY</p>
      </div>
      <div className="inspector-actions-stack">
       <button type="button" className="inspector-sub-btn" onClick={()=>manage('plot')}>ASSIGN</button>
       <button type="button" className="inspector-sub-btn" disabled={disabled} onClick={()=>void upgradeAction()}>UPGRADE</button>
      </div>
     </div>
    </div>

    <div className="scheme-drawer-cards">
     <button
      type="button"
      className="scheme-option-card safe-hustle"
      disabled={!hydrated||disabled||!!save?.awardedRewardIds.includes(`scheme-safe:${clock?.toISOString().slice(0,10)}`)}
      onClick={()=>void runSafeHustle()}
     >
      <span className="scheme-option-header">OPTION 1</span>
      <span className="scheme-option-body">
       <b>DAILY POST:</b>
       <strong>SPONSORED POST</strong>
       <em>(+40 CLOUT)</em>
      </span>
     </button>

     <button
      type="button"
      className="scheme-option-card high-risk-scheme"
      disabled={!hydrated||disabled||!!save?.awardedRewardIds.includes(`scheme-risk:${clock?.toISOString().slice(0,10)}`)}
      onClick={()=>void runHighRiskScheme()}
     >
      <span className="scheme-hazard-strip top" aria-hidden="true"/>
      <span className="scheme-risk-inner">
       <span className="scheme-risk-icon" aria-hidden="true">⚠</span>
       <span className="scheme-risk-copy">
        <b>DAILY SPOTLIGHT:</b>
        <strong>SPONSOR DEAL</strong>
        <em>(+250 CLOUT +1 PACK · ONCE PER UTC DAY)</em>
       </span>
      </span>
      <span className="scheme-hazard-strip bottom" aria-hidden="true"/>
     </button>
    </div>

    <div className="inspector-bottom-bar">
     <div className="inspector-rate">
      <Crown size={15}/>
      <b>{hourlyRate}</b>
      <span>/ day</span>
     </div>
     {selected==='court'?(
      <Link className="inspector-main-cta" href="/battle/" onClick={e=>door(e,'court','/battle/')}>ENTER COURT</Link>
     ):selected==='packs'?(
      <Link className="inspector-main-cta" href="/packs/" onClick={e=>door(e,'packs','/packs/')}>OPEN PACKS</Link>
     ):plot===11&&!building?(
      <Link className="inspector-main-cta" href="/market/" onClick={e=>door(e,'plot-11','/market/')}>OPEN MARKET</Link>
     ):plot===4&&!building?(
      <Link className="inspector-main-cta" href="/stash/" onClick={e=>door(e,'plot-4','/stash/')}>PROP STASH</Link>
     ):(
      <button type="button" className="inspector-main-cta" disabled={!hydrated||disabled} onClick={()=>void collect()}>
       COLLECT INFLUENCE
      </button>
     )}
    </div>
   </aside>}

   <AirfryerCase/>

   <div className="city-floating-tools">
    <button className="raid-rival-btn" onClick={()=>setRaidOpen(true)}><Swords size={14}/><span>RAID RIVAL BLOCK</span></button>
    <button onClick={()=>manage('plot')}><Home size={14}/><span>DIRECTORY ({city?.plots.filter(Boolean).length||0}/12)</span></button>
    <button onClick={()=>manage('jobs')}><Ticket size={14}/><span>JOBS</span></button>
    <button onClick={()=>setDrama(true)}><Radio size={14}/><span>{activeEvent?'LIVE: '+activeEvent.name.toUpperCase():'DRAMA'}</span></button>
    <button aria-label="How the city works" onClick={()=>setHelp(true)}><HelpCircle size={15}/></button>
   </div>
   {lootBursts.length>0&&(
    <div className="city-flying-loot-layer" aria-hidden="true">
     {lootBursts.map(burst=>(
      <span key={burst.id} className={`city-flying-loot tone-${burst.tone}`}>
       {burst.label}
      </span>
     ))}
    </div>
   )}
  </LivingCityWorld>
  <CityGameNavigation active="city"/>

  {/* RIVAL BLOCK TURF RAID MODAL */}
  {raidOpen&&(
   <Dialog wide title="🏴‍☠️ RIVAL TURF RADAR · EXPOSE & RAID A NEIGHBOR'S BLOCK" onClose={()=>setRaidOpen(false)}>
    <div className="city-rival-raid-modal">
     <p className="rival-raid-intro">
      Challenge a fictional rival crew in Screenshot Court. First victory against each crew: <b>450 Clout + 1 pack</b>, plus the standard scored-win reward. These are solo challenges.
     </p>
     <div className="rival-blocks-grid">
      {RIVAL_BLOCKS.map(rv=>(
       <div key={rv.handle} className="rival-block-card">
        <div className="rival-block-header">
         <span className="rival-heat-pill">HEAT {rv.heat}</span>
         <strong>@{rv.handle}</strong>
         <small>{rv.blockName}</small>
        </div>
        <blockquote className="rival-taunt">{rv.taunt}</blockquote>
        <div className="rival-defenders-row">
         {rv.crew.map(cid=>{
          const rc=CARD_BY_ID[cid];
          return (
           <div key={cid} className="rival-defender-badge">
            <Portrait card={rc}/>
            <span>{rc.name}</span>
           </div>
          );
         })}
        </div>
        <div className="rival-bounty-strip">
         <span>BOUNTY: <b>{rv.bounty}</b></span>
        </div>
        <Link
         href={`/battle/?vs=${rv.crew.join(',')}&by=${rv.handle}&raid=1`}
         className="block-action acid rival-launch-link"
         onClick={()=>setRaidOpen(false)}
        >
         <Swords size={16}/>
         <span>RAID @{rv.handle} ↗</span>
        </Link>
       </div>
      ))}
     </div>
    </div>
   </Dialog>
  )}

  {beefOpen&&nextBeefEvent&&(
   <Dialog title={`💢 STREET BEEF / ${nextBeefEvent.id} · SETTLE IT FOR LOOT`} onClose={()=>setBeefOpen(false)}>
    <div className="city-beef-modal">
     <div className="city-beef-instigator">
      <div className="city-beef-portrait">
       <Portrait card={CARD_BY_ID[nextBeefEvent.host]||CARD_BY_ID.CC007}/>
       <span className="city-beef-badge">INSTIGATOR</span>
      </div>
      <div className="city-beef-speech">
       <span className="beef-kicker">
        {(CARD_BY_ID[nextBeefEvent.host]||CARD_BY_ID.CC007).name.toUpperCase()} · {nextBeefEvent.name.toUpperCase()}
       </span>
       <p>“{nextBeefEvent.description}”</p>
      </div>
     </div>
     {beefVerdict?(
      <div className="city-beef-verdict" role="status">
       <span className="beef-ratio-stamp">💥 RATIOED!!</span>
       <p>{beefVerdict}</p>
       <div className="city-beef-verdict-actions">
        <button type="button" className="block-action acid" onClick={()=>setBeefVerdict(null)}>
         <span>NEXT STREET BEEF ⚡</span>
        </button>
        <button type="button" className="block-action paper" onClick={()=>setBeefOpen(false)}>
         <span>BACK TO THE BLOCK</span>
        </button>
       </div>
      </div>
     ):(
      <div className="city-beef-choices">
       <small className="beef-choices-heading">CHOOSE YOUR COMEBACK (AWARDS INSTANT LOOT):</small>
       {nextBeefEvent.choices.map((choiceText,idx)=>(
        <button
         key={choiceText}
         type="button"
         className={`city-beef-choice-btn choice-${idx}`}
         disabled={disabled}
         onClick={()=>void resolveStreetBeef(idx as 0|1|2)}
        >
         <span className="choice-num">0{idx+1}</span>
         <b>{choiceText}</b>
         <em className="choice-reward">
          {idx===0?'+1 PACK 🎟':idx===1?'+25 INFLUENCE 👑':'+6 SCRAP ⚙'}
         </em>
        </button>
       ))}
      </div>
     )}
    </div>
   </Dialog>
  )}
  {manager&&<Dialog title="YOUR BLOCK / MUNICIPAL RECORDS" onClose={()=>setManager(null)} wide><CityManagement initialPlot={manager.plot} initialTab={manager.tab} sceneMode={sceneMode} setSceneMode={setSceneMode}/></Dialog>}
  {drama&&<Dialog title="STREET DRAMA / EVERYONE IS THE PROBLEM" onClose={()=>setDrama(false)} wide><CityEventBoard/><CityIncidents/></Dialog>}
  {help&&<Dialog title="WELCOME TO THE WORST BLOCK." onClose={()=>setHelp(false)}><ol className="how-to-play"><li><b>Found your block.</b> A free tower, starter resident and 200 Influence.</li><li><b>Accept the tower’s job.</b> Open two packs, then claim a pack, Influence and XP here.</li><li><b>Give residents an address.</b> Use the Block directory to assign residents, build, move, rename and upgrade. Matching factions unlock stories.</li><li><b>Collect once per UTC day.</b> Influence funds construction and upgrades. Residents stay available for battles.</li><li><b>The city is your hub.</b> Court, Packs, Collection, Market and Prop Stash are one stop away. Drag or swipe the scene; use the camera buttons to zoom.</li></ol><button className="block-action pink" onClick={()=>setHelp(false)}>LET’S MAKE THIS WORSE <ArrowRight size={17}/></button></Dialog>}
  {notice&&<div className="toast" role="status"><Sparkles size={18}/>{notice}</div>}
 </div>;
}
