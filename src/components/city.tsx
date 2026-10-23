'use client';
import Link from 'next/link';
import {ComicHeader,ComicTicker} from './comic-chrome';
import {NeighbourhoodStage} from './neighbourhood-stage';
import {AirfryerCase} from './airfryer-case';
import {VERDICTS} from '../domain/airfryer';
import {useRouter,useSearchParams} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,ArrowUpCircle,Crown,Flame,HelpCircle,Home,Radio,Sparkles,Swords,Ticket,UserPlus,Users} from 'lucide-react';
import {useGame} from '../state/store';
import {dailyEligible,type Command} from '../domain/game';
import {cityCanCollect,cityProduction,influenceRate,nextStreetBeef} from '../domain/city';
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
 const [inspectorOpen,setInspectorOpen]=useState(false),[selected,setSelected]=useState('plot-0'),[paused,setPaused]=useState(false),[manager,setManager]=useState<{plot:number;tab:'plot'|'stories'|'jobs'}|null>(params.get('tab')==='jobs'||params.get('tab')==='stories'?{plot:0,tab:params.get('tab') as 'jobs'|'stories'}:null),[drama,setDrama]=useState(false),[help,setHelp]=useState(false),[beefOpen,setBeefOpen]=useState(false),[beefVerdict,setBeefVerdict]=useState<string|null>(null),[resolvedBeefId,setResolvedBeefId]=useState<string|null>(null),[raidOpen,setRaidOpen]=useState(false),[lootBursts,setLootBursts]=useState<{id:number;label:string;tone:'acid'|'pink'|'cyan'}[]>([]),[notice,setNotice]=useState(''),[clock,setClock]=useState<Date|null>(null),[departing,setDeparting]=useState<string|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
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
  setNotice(income===0?'Assign a resident to start daily production.':'Today’s Influence was already collected. Next pickup: 00:00 UTC.');
 };
 const door=(e:React.MouseEvent<HTMLAnchorElement>,id:string,href:string)=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();if(departing)return;setDeparting(id);timer.current=setTimeout(()=>router.push(href),reduced?0:330);};
 const upcomingBeefEvent=nextStreetBeef(city);
 const nextBeefEvent=beefVerdict&&resolvedBeefId?CITY_EVENT_BY_ID[resolvedBeefId]:upcomingBeefEvent;
 const resolveStreetBeef=async(choice:0|1|2)=>{
  if(!city){await found();return;}
  const ev=upcomingBeefEvent;if(!ev)return;
  if(city.activeEvent?.eventId!==ev.id&&!await run({type:'city-event-start',eventId:ev.id}))return;
  const ok=await run({type:'city-event-choice',eventId:ev.id,choice});
  if(!ok)return;
  const rewardLabel=choice===0?'+1 FREE PACK 🎟':choice===1?'+25 INFLUENCE 👑':'+6 SCRAP ⚙';
  const rewardTone=choice===0?'pink':choice===1?'acid':'cyan';
  spawnLoot(rewardLabel,rewardTone);
  setResolvedBeefId(ev.id);setBeefVerdict(ev.endings[choice]);
  if(ok)setNotice(`STREET BEEF SETTLED: ${rewardLabel}`);
 };
 const runSafeHustle=async()=>{if(!save&&!await enter())return;await mutate({type:'clout-scheme',scheme:'safe'},'SPONSORED POST SAVED. +40 CLOUT.',{label:'+40 CLOUT',tone:'acid'});};
 const runHighRiskScheme=async()=>{if(!save&&!await enter())return;await mutate({type:'clout-scheme',scheme:'risk'},'SPONSOR SPOTLIGHT SAVED. +250 CLOUT +1 PACK.',{label:'+250 CLOUT · +1 PACK',tone:'pink'});};
 const display=save?.props.cityDisplay?PROP_BY_ID[save.props.cityDisplay]?.art:undefined;

 const hourlyRate=building?influenceRate(building):0;
 const upgradeAction=async()=>{
  if(!city){await found();return;}
  if(!building){manage('plot');return;}
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

 return <div className="reference-page whole-game whole-city" data-departing={!!departing}>
  <ComicHeader/>
  <NeighbourhoodStage selected={selected} onSelect={setSelected} onManage={manage} onFound={()=>void found()} onCollect={()=>void collect()} onUpgrade={()=>void upgradeAction()} canCollect={canCollect} income={income} onDrama={()=>setDrama(true)} onBeef={()=>{setBeefOpen(true);setBeefVerdict(null);setResolvedBeefId(null);}} onRaid={()=>setRaidOpen(true)} onHelp={()=>setHelp(true)} onHustle={()=>void runSafeHustle()}/>
  <ComicTicker/>
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
         <span>{upcomingBeefEvent?'NEXT STREET BEEF ⚡':'BLOCK CLEARED →'}</span>
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
  {beefOpen&&!nextBeefEvent&&<Dialog title="STREET BEEF / BLOCK CLEARED" onClose={()=>setBeefOpen(false)}><h2>ALL {CITY_EVENTS.length} INCIDENTS SETTLED.</h2><p>Your endings and rewards are saved. Revisit Street Drama to read your choices and replay their atmosphere; replays do not award more loot.</p><button className="button paper" onClick={()=>{setBeefOpen(false);setDrama(true);}}>OPEN STREET DRAMA <ArrowRight size={17}/></button></Dialog>}
  {manager&&<Dialog title="YOUR BLOCK / MUNICIPAL RECORDS" onClose={()=>setManager(null)} wide><CityManagement initialPlot={manager.plot} initialTab={manager.tab} sceneMode={sceneMode} setSceneMode={setSceneMode}/></Dialog>}
  {drama&&<Dialog title="STREET DRAMA / EVERYONE IS THE PROBLEM" onClose={()=>setDrama(false)} wide><CityEventBoard/><CityIncidents/></Dialog>}
  {help&&<Dialog title="WELCOME TO THE WORST BLOCK." onClose={()=>setHelp(false)}><ol className="how-to-play"><li><b>Found your block.</b> A free tower, starter resident and 200 Influence.</li><li><b>Accept the tower’s job.</b> Open two packs, then claim a pack, Influence and XP here.</li><li><b>Give residents an address.</b> Select an address, then use its bottom property dock to build, assign residents, read chapters and upgrade. Matching factions unlock stories. Advanced Records keeps moving and renaming available.</li><li><b>Collect once per UTC day.</b> Influence funds construction and upgrades. Residents stay available for battles.</li><li><b>The city is your hub.</b> Pick a district on the map, then select a building to see what is inside. Drag to explore, scroll or pinch to zoom, or use the searchable Directory to find any address. Your Block opens your actual twelve saved plots; its address buttons switch between the two streets. In Cloutside, enter Probable Cause to inspect its receipt, then question the dealer outside. In Liability Hills, inspect the harbour invoice and speak to the waterfront witness. Evidence unlocks a one-time case resolution. Existing stories keep their saved endings and rewards; replays are story-only. Back to City returns to the map.</li></ol><button className="block-action pink" onClick={()=>setHelp(false)}>LET’S MAKE THIS WORSE <ArrowRight size={17}/></button></Dialog>}
  {notice&&<div className="toast" role="status"><Sparkles size={18}/>{notice}</div>}
 </div>;
}
