'use client';
import Link from 'next/link';
import {ComicHeader,ComicTicker} from './comic-chrome';
import {GuidedCourt} from './guided-court';
import {TacticDeckBuilder,useTacticDeck} from './tactic-deck-builder';
import {tacticDeckSchema,allTactics} from '../domain/duel-rules';
import {TRAINING_ROSTER} from '../domain/fighter-role';
import {PracticeCourt} from './practice-court';
import {DuelArena,DuelRules} from './duel-arena';
import {PrintedCard} from './printed-card';
import {AirfryerHearing} from './airfryer-case';
import {useRouter,useSearchParams} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Crown,Flag,Film,HelpCircle,RotateCcw,Shield,Skull,Sparkles,Swords,Users,Zap} from 'lucide-react';
import {CARD_BY_ID,CARDS} from '../data/cards';
import {quantity} from '../domain/game';
import {abilityDescription,attackPower,availableDuos,createMatch,districtOf,LOANERS,maxHp,type BattleAction,type DistrictId,type Match,type Side} from '../domain/battle';
import {courtDistrict,courtQuery,forecastAction,type CourtMode} from '../domain/court';
import {CinematicClock,shouldPlaySpecial,specialPlayback,type CinematicMode} from '../domain/cinematic';
import {actionTiming} from '../domain/action-presentation';
import {starterSquad} from '../domain/starter-journey';
import {specialAt} from '../data/specials';
import {weaponFamily} from '../data/live-direction';
import {liveCue} from '../services/live-audio';
import {useGame} from '../state/store';
import {Portrait} from './card';
import {useCityMotion} from './city-motion';
import {CityGameHeader,CityGameNavigation} from './game-chrome';
import {CourtLobby} from './court-lobby';
import {Dialog} from './dialog';
import {useStarterGuide} from './starter-guide';
import {CinematicModeControl,SpecialCinematic,SpecialGallery,useCinematicMode} from './special-cinematic';

function Hype({value}:{value:number}){return <span className="court-hype" aria-label={`${value} of 3 hype`}>{[1,2,3].map(n=><i key={n} className={n<=value?'charged':''}><Zap size={11}/></i>)}</span>;}

interface DramaDeckCardDef {
 id:string;
 cost:number;
 title:string;
 cardId:string;
 building:string;
 tone:'pink'|'cyan'|'purple'|'acid';
 kind:'attack'|'guard'|'switch'|'ability';
 speech:string;
 splat:string;
 desc:(dmg:number,enemyName:string,benchName:string)=>string;
}

const DRAMA_DECK_CATALOG:readonly DramaDeckCardDef[]=[
 {
  id:'deck-ukulele',
  cost:1,
  title:'UKULELE APOLOGY',
  cardId:'CC009',
  building:'APOLOGY FACTORY',
  tone:'pink',
  kind:'attack',
  speech:'“THIS SONG IS MY OFFICIAL STATEMENT!”',
  splat:'CRINGE HIT!',
  desc:(dmg,enemyName)=>`Weaponized tears! Deal ${dmg} DMG to ${enemyName} & gain +1 Hype.`,
 },
 {
  id:'deck-receipt',
  cost:2,
  title:'2014 TWEET RECEIPT',
  cardId:'CC002',
  building:'SCREENSHOT COURT',
  tone:'cyan',
  kind:'attack',
  speech:'“THIS YOU IN 4K FROM 2014?!”',
  splat:'EXPOSED!',
  desc:(dmg)=>`Unseal ancient screenshots! Strike for ${dmg} Ratio DMG & expose target.`,
 },
 {
  id:'deck-note',
  cost:2,
  title:'COMMUNITY NOTE TRAP',
  cardId:'CC003',
  building:'DOOMSCROLL TOWER',
  tone:'purple',
  kind:'guard',
  speech:'“READERS ADDED CONTEXT TO YOUR LIE!”',
  splat:'NOTED! +60%',
  desc:()=>'Slap a Community Note on the thread! Block 60% of next hit & gain +1 Hype.',
 },
 {
  id:'deck-manager',
  cost:3,
  title:'CALL THE MANAGER',
  cardId:'CC006',
  building:'VIP AFTERPARTY',
  tone:'cyan',
  kind:'switch',
  speech:'“I DEMAND TO SPEAK TO CORPORATE!”',
  splat:'AMBUSH TAG!',
  desc:(dmg,_e,benchName)=>`Tag in ${benchName} from your bench or escalate for ${dmg} DMG!`,
 },
 {
  id:'deck-charity',
  cost:3,
  title:'FAKE CHARITY STREAM',
  cardId:'CC063',
  building:'AIRFRYER PALACE',
  tone:'acid',
  kind:'ability',
  speech:'“100% OF PROCEEDS GO TO MY WALLET!”',
  splat:'CLOUT NUKE!',
  desc:(dmg)=>`Stream for clout! Deal ${dmg+18} projected impact or unleash Special!`,
 },
 {
  id:'deck-subtweet',
  cost:1,
  title:'3AM SUBTWEET JAB',
  cardId:'CC064',
  building:'DOOMSCROLL TOWER',
  tone:'pink',
  kind:'attack',
  speech:'“NO NAMES BUT SOME OF Y’ALL ARE FAKE!”',
  splat:'RATIO JAB!',
  desc:(dmg)=>`Passive-aggressive jab! Deal ${dmg} quick Shame DMG & chain combos.`,
 },
 {
  id:'deck-airfryer',
  cost:1,
  title:'SPONSORED SLOP AD',
  cardId:'CC001',
  building:'AIRFRYER PALACE',
  tone:'acid',
  kind:'attack',
  speech:'“USE CODE CANCEL20 AT CHECKOUT!”',
  splat:'SHILL HIT!',
  desc:(dmg)=>`Force-feed an ad read! Deal ${dmg} DMG & boost Clout combo.`,
 },
 {
  id:'deck-boating',
  cost:2,
  title:'LOST KEYS ON YACHT',
  cardId:'CC023',
  building:'RUG ALLEY',
  tone:'purple',
  kind:'guard',
  speech:'“MY HARDWARE WALLET SANK IN THE LAKE!”',
  splat:'DODGED! +60%',
  desc:()=>'Tax-haven defense! Block 60% of incoming damage & gain +1 Hype.',
 },
 {
  id:'deck-rugpull',
  cost:2,
  title:'LIQUIDITY RUG PULL',
  cardId:'CC031',
  building:'RUG ALLEY',
  tone:'cyan',
  kind:'attack',
  speech:'“DEV WALLET JUST DUMPED THE FLOOR!”',
  splat:'RUGGED!',
  desc:(dmg)=>`Pull the floor! Deal ${dmg+6} Chaos DMG to opposing lead.`,
 },
 {
  id:'deck-intern',
  cost:1,
  title:'BLAME THE INTERN',
  cardId:'CC008',
  building:'APOLOGY FACTORY',
  tone:'purple',
  kind:'guard',
  speech:'“OUR SOCIAL MEDIA INTERN WAS FIRED!”',
  splat:'DEFLECTED!',
  desc:()=>'Corporate scapegoat! Block 60% of next attack & keep combo rolling.',
 },
 {
  id:'deck-leaked-dm',
  cost:2,
  title:'LEAKED DISCORD DMS',
  cardId:'CC015',
  building:'SCREENSHOT COURT',
  tone:'pink',
  kind:'attack',
  speech:'“DROP THE FULL SERVER LOGS RIGHT NOW!”',
  splat:'LEAKED!',
  desc:(dmg)=>`Drop nuclear logs! Deal ${dmg+8} DMG & shatter composure.`,
 },
 {
  id:'deck-bot-farm',
  cost:1,
  title:'HIRE BOT ARMY',
  cardId:'CC056',
  building:'DOOMSCROLL TOWER',
  tone:'cyan',
  kind:'attack',
  speech:'“10,000 VERIFIED BOTS JUST RATIOED YOU!”',
  splat:'BOT SWARM!',
  desc:(dmg)=>`Flood the replies! Deal ${dmg} DMG & stack +1 Combo multiplier.`,
 },
 {
  id:'deck-paparazzi',
  cost:2,
  title:'PARKING LOT AMBUSH',
  cardId:'CC059',
  building:'VIP AFTERPARTY',
  tone:'acid',
  kind:'attack',
  speech:'“WHY WERE YOU AT THE VIP AFTERPARTY?!”',
  splat:'CAUGHT IN 4K!',
  desc:(dmg)=>`Flashbulb stun! Deal ${dmg+5} DMG & expose enemy lead.`,
 },
 {
  id:'deck-notes-app',
  cost:1,
  title:'NOTES APP SCREENSHOT',
  cardId:'CC054',
  building:'APOLOGY FACTORY',
  tone:'purple',
  kind:'guard',
  speech:'“I AM TAKING TIME TO LEARN AND GROW…”',
  splat:'COPE SHIELD!',
  desc:()=>'Classic Notes App statement! Gain 60% Guard & +1 Hype.',
 },
 {
  id:'deck-class-action',
  cost:3,
  title:'CLASS ACTION SUBPOENA',
  cardId:'CC066',
  building:'SCREENSHOT COURT',
  tone:'acid',
  kind:'ability',
  speech:'“YOU HAVE BEEN SERVED LIVE ON STREAM!”',
  splat:'SUBPOENAED!',
  desc:(dmg)=>`Maximum legal spectacle! Unleash Special or deal ${dmg+20} verdict DMG.`,
 },
];

export function CourtBattleScreen(){const params=useSearchParams();return params.get('case')==='airfryer'?<AirfryerHearing/>:<RegularCourtBattleScreen/>;}
function RegularCourtBattleScreen(){
 const {save,run,enter,busy,error,clearError,hydrated,mode:saveMode}=useGame(),params=useSearchParams(),router=useRouter(),{guided}=useStarterGuide();
 const [cinematicMode,setCinematicMode]=useCinematicMode(),[gallery,setGallery]=useState(params.get('specials')==='1'),[rules,setRules]=useState(false),[showDocket,setShowDocket]=useState(params.get('crew')==='1'||params.get('practice')!=='1'),[team,setTeam]=useState<string[]>(LOANERS),[district,setDistrict]=useState<DistrictId>(()=>courtQuery(params).district||'street'),[mode,setMode]=useState<CourtMode>(()=>courtQuery(params).mode||'campaign'),[day,setDay]=useState<string|null>(null),suggested=useRef(false);
 const [practiceOpen,setPracticeOpen]=useState(params.get('practice')==='1'),[practiceFresh,setPracticeFresh]=useState(false),[practiceTake,setPracticeTake]=useState(0);
 const [tacticDeck,setTacticDeck,deckLoaded]=useTacticDeck(),[deckOpen,setDeckOpen]=useState(params.get('deck')==='1'),[learnOpen,setLearnOpen]=useState(params.get('learn')==='1');
 const deckValid=tacticDeckSchema.safeParse(tacticDeck).success;
 const queryKey=params.toString(),syncedQuery=useRef(queryKey);
 useEffect(()=>{if(syncedQuery.current===queryKey)return;syncedQuery.current=queryKey;const query=new URLSearchParams(queryKey),selection=courtQuery(query);if(selection.district)setDistrict(selection.district);if(selection.mode)setMode(selection.mode);setLearnOpen(query.get('learn')==='1');setPracticeOpen(query.get('practice')==='1');if(query.get('practice')==='1')setPracticeFresh(false);setShowDocket(query.get('crew')==='1'||query.get('learn')!=='1'&&query.get('practice')!=='1'&&!useGame.getState().save?.battle.active);},[queryKey]);
 const syncView=(view:'crew'|'learn'|'practice'|'battle')=>{const query=new URLSearchParams(params.toString());for(const key of ['crew','learn','practice','district','mode'])query.delete(key);if(view!=='battle')query.set(view,'1');syncedQuery.current=query.toString();router.replace(`/battle/${query.size?`?${query.toString()}`:''}`,{scroll:false});};
 const [previewId,setPreviewId]=useState('court-preview');
 useEffect(()=>setPreviewId(crypto.randomUUID()),[]);
 const isRaid=params.get('raid')==='1';
 const rivalBy=params.get('by');
 const vsParam=params.get('vs');
 const vsCards=(vsParam?vsParam.split(','):[]).filter(id=>Object.hasOwn(CARD_BY_ID,id));
 const rivalCrew=vsCards.length===3?vsCards:['CC002','CC006','CC003'];
 const recipeParam=params.get('recipe');
 const raidChallengeKey=isRaid?`rival:${rivalBy||'CancelMob'}:${rivalCrew.join(',')}:450${recipeParam?`:${recipeParam}`:''}`:null;
 const match=save?.battle.active,cleared=save?.battle.clearedDistrictIds||[],selectedDistrict=isRaid?'crypto':courtDistrict(district,mode,cleared);
 const previewMatch=match||createMatch(previewId,selectedDistrict,team.length===3?team:LOANERS,{version:5,mode:mode==='daily'?'campaign':mode,challengeKey:raidChallengeKey,tacticDeck:deckValid?tacticDeck:undefined});
 const clearRoastIfActive=async()=>{const roast=useGame.getState().save?.roast;if(!roast)return;if(roast.phase!=='finished'&&!await run({type:'roast-surrender',matchId:roast.id,step:roast.step}))return;const finished=useGame.getState().save?.roast;if(finished?.phase==='finished')await run({type:'roast-leave',matchId:finished.id,step:finished.step});};
 useEffect(()=>{if(vsParam&&!isRaid)setShowDocket(true);},[vsParam,isRaid]);
 useEffect(()=>{if(save&&(!match||match.phase==='finished')&&!suggested.current){setTeam(save.career.presets[0]||match?.player.map(f=>f.cardId)||starterSquad(save));suggested.current=true;}},[guided,save,match]);
 useEffect(()=>{const update=()=>setDay(new Date().toISOString().slice(0,10));update();const timer=setInterval(update,30000);return()=>clearInterval(timer);},[]);
 const start=async(ids=team,id=selectedDistrict,playMode=mode,cards=tacticDeck)=>{if(!tacticDeckSchema.safeParse(cards).success){setDeckOpen(true);return;}if(playMode==='practice'){setLearnOpen(false);setPracticeFresh(true);setPracticeTake(n=>n+1);setPracticeOpen(true);syncView('practice');return;}if(saveMode==='offline'||saveMode==='loading'||save?.roast&&save.roast.phase!=='finished')return;if(save?.battle.active&&save.battle.active.phase!=='finished'){clearError();setShowDocket(false);syncView('battle');return;}if(!save&&!await enter())return;setShowDocket(false);syncView('battle');await run({type:'battle-start',rulesVersion:5,tacticDeck:cards,matchId:crypto.randomUUID(),districtId:id,team:ids,mode:playMode,challengeKey:raidChallengeKey||undefined});};
 const leave=async()=>{if(!match){setShowDocket(true);syncView('crew');return;}setTeam(match.player.map(f=>f.cardId));setDistrict(match.districtId);setMode(match.mode);setShowDocket(true);syncView('crew');setPreviewId(crypto.randomUUID());clearError();if(match.phase==='finished')await run({type:'battle-leave',matchId:match.id});};
 useEffect(()=>{if(match&&!params.get('crew'))setShowDocket(false);},[match?.id]);
 const inArena=learnOpen||practiceOpen||!showDocket;
 const blockedReason=saveMode==='offline'?'Your cloud save is disconnected. Practice works without signing in.':save?.roast&&save.roast.phase!=='finished'?'Roast Night is still running. Resume it, or play separate practice here.':!hydrated?'Connecting your save…':null;
 return <div className={`court-page reference-page reference-battle ${inArena?'court-playing':''} ${isRaid?'court-raid-emergency':''}`}><ComicHeader/><div className="court-toolbar"><Link href="/city/" aria-label="Return to the city"><ArrowLeft size={16}/><span>THE CITY</span></Link><div><small>{isRaid?'🚨 5-STAR RAID TRIBUNAL':'SCREENSHOT COURT'}</small><b>{isRaid?'RIVAL CHALLENGE · FIRST-WIN BOUNTY':inArena?'HEARING IN PROGRESS':'DEPARTMENT OF PUBLIC HUMILIATION'}</b></div><span className="court-record">{save?.battle.wins||0} W <i/> {save?.battle.losses||0} L</span><button type="button" onClick={()=>{if(learnOpen){setLearnOpen(false);setPracticeOpen(false);setShowDocket(true);syncView('crew');}else if(practiceOpen){setPracticeOpen(false);setShowDocket(true);setMode('practice');syncView('crew');}else{setShowDocket(d=>!d);syncView(showDocket?'battle':'crew');}}}><Users size={15}/><span>{showDocket?'BACK TO HEARING':'CASE DOCKET / CREW'}</span></button><button aria-label="Special attack theater" onClick={()=>setGallery(true)}><Film size={16}/><span>SPECIALS</span></button><button onClick={()=>setDeckOpen(true)}>BUILD DECK</button><button onClick={()=>{setPracticeOpen(false);setLearnOpen(true);syncView('learn');}}>LEARN TO PLAY</button><button onClick={()=>{if(!deckValid){setDeckOpen(true);return;}setLearnOpen(false);setPracticeFresh(false);setPracticeOpen(true);syncView('practice');}}>PLAY PRACTICE</button><button aria-label="Battle rules and settings" onClick={()=>setRules(true)}><HelpCircle size={16}/><span>RULES & SETTINGS</span></button></div>
 {!practiceOpen&&!learnOpen&&mode!=='practice'&&(error||blockedReason)&&<div className="reference-battle-error duel-account-block" role="status"><span>{blockedReason||error}</span><div><button className="button magenta small" onClick={()=>{if(!deckValid){setDeckOpen(true);return;}setLearnOpen(false);setPracticeFresh(false);setPracticeOpen(true);syncView('practice');}}>PLAY PRACTICE NOW</button>{save?.roast&&<Link href="/roast/">RESUME ROAST NIGHT →</Link>}<button className="button paper small" onClick={clearError}>RETRY CONNECTION</button>{saveMode!=='offline'&&save?.roast&&<button className="button paper small" disabled={busy} onClick={()=>void clearRoastIfActive()}>FORFEIT ROAST NIGHT</button>}</div></div>}{!practiceOpen&&!learnOpen&&mode!=='practice'&&match&&match.rulesVersion<5&&match.phase!=='finished'&&<div className="duel-legacy-banner"><span>This saved battle uses the old rules. Restart it with the new turn structure without recording a loss.</span><button disabled={busy||saveMode==='offline'||!!(save?.roast&&save.roast.phase!=='finished')} onClick={()=>void run({type:'battle-upgrade',matchId:match.id,step:match.step,newMatchId:crypto.randomUUID()})}>RESTART WITH NEW RULES · NO LOSS</button></div>}{showDocket&&!practiceOpen&&!learnOpen&&match&&match.phase!=='finished'&&<div className="duel-saved-match-notice"><span><b>YOUR CURRENT BATTLE IS SAVED.</b> Crew and deck changes apply to your next battle. Resume to finish or surrender this one.</span><button className="button acid small" onClick={()=>{clearError();setShowDocket(false);syncView('battle');}}>RESUME SAVED BATTLE →</button></div>}<div className="court-content" aria-label="Screenshot Court battle">{learnOpen?<GuidedCourt paused={gallery||rules||deckOpen} cinematicMode={cinematicMode} onExit={()=>{setLearnOpen(false);setPracticeOpen(false);setMode('campaign');setDistrict('street');setTeam(save?.career.presets[0]||starterSquad(save));setShowDocket(true);syncView('crew');}} onPractice={()=>{if(!deckValid){setDeckOpen(true);return;}setLearnOpen(false);setPracticeFresh(true);setPracticeTake(n=>n+1);setPracticeOpen(true);syncView('practice');}}/>:practiceOpen?<PracticeCourt key={practiceTake} resume={!practiceFresh} onCampaign={()=>{setPracticeOpen(false);setMode('campaign');setDistrict('street');setTeam(save?.career.presets[0]||starterSquad(save));setShowDocket(true);syncView('crew');}} deckReady={deckLoaded} tacticDeck={tacticDeck} team={team.length===3?team:LOANERS} district={selectedDistrict} paused={gallery||rules||deckOpen} cinematicMode={cinematicMode} onExit={()=>{setPracticeOpen(false);setMode('practice');setShowDocket(true);syncView('crew');}}/>:inArena?<CourtArenaRouter blockedReason={blockedReason} onPractice={()=>{if(!deckValid){setDeckOpen(true);return;}setLearnOpen(false);setPracticeFresh(false);setPracticeOpen(true);syncView('practice');}} key={`${previewMatch.id}:${previewMatch.player.map(f=>f.cardId).join('-')}:${previewMatch.districtId}`} match={previewMatch} isPreview={!match} isRaid={isRaid} rivalBy={params.get('by')} onAutoStart={async(action)=>{if(blockedReason)return;if(previewId==='court-preview')return;const mid=previewId;if(!save&&!await enter())return;if(await run({type:'battle-start',rulesVersion:5,tacticDeck:deckValid?tacticDeck:undefined,matchId:mid,districtId:selectedDistrict,team:team.length===3?team:LOANERS,mode:mode==='daily'?'campaign':mode,challengeKey:raidChallengeKey||undefined})){await run({type:'battle-act',matchId:mid,step:0,action});}}} paused={gallery||rules||deckOpen} cinematicMode={cinematicMode} onLeave={()=>void leave()} onRematch={()=>void start(previewMatch.player.map(f=>f.cardId),previewMatch.districtId,previewMatch.mode,previewMatch.duel?allTactics(previewMatch.duel.player):tacticDeck)}/>:<CourtLobby resumeAccount={!!match&&match.phase!=='finished'} accountBlocked={!!blockedReason} team={team} roster={CARDS.filter(c=>mode==='practice'?TRAINING_ROSTER.includes(c.id):LOANERS.includes(c.id)||quantity(save,c.id).regular+quantity(save,c.id).foil>0)} tacticDeck={tacticDeck} onDeck={setTacticDeck} onLearn={()=>{setPracticeOpen(false);setLearnOpen(true);syncView('learn');}} district={selectedDistrict} mode={mode} day={day} guided={guided} disabled={busy||mode!=='practice'&&!hydrated} onChoose={id=>setTeam(t=>t.includes(id)?t.filter(c=>c!==id):t.length<3?[...t,id]:t)} onTeam={setTeam} onDistrict={setDistrict} onMode={m=>{setMode(m);setDistrict(courtDistrict(district,m,cleared));}} onStart={()=>void start()}/>}</div>
 <ComicTicker/>
 {gallery&&<Dialog wide title="THE SPECIAL ATTACK THEATER" onClose={()=>setGallery(false)}><CinematicModeControl mode={cinematicMode} onChange={setCinematicMode}/><SpecialGallery mode={cinematicMode}/></Dialog>}
 {deckOpen&&<Dialog wide title="SPELLS & TRAPS / YOUR DECK" onClose={()=>setDeckOpen(false)}><TacticDeckBuilder deck={tacticDeck} onChange={setTacticDeck}/><button className="button magenta" disabled={!deckValid} onClick={()=>{setDeckOpen(false);if(!match&&!practiceOpen)setShowDocket(true);}}>USE THIS DECK · {tacticDeck.length}/12</button></Dialog>}
 {rules&&<Dialog title="COURT PROCEDURE / BAD ADVICE, GOOD RULES" onClose={()=>{setRules(false);if(save&&!save.career.tutorialSeen)void run({type:'battle-tutorial'});}}><CinematicModeControl mode={cinematicMode} onChange={setCinematicMode}/><div className="court-rules">{practiceOpen||learnOpen||previewMatch.rulesVersion>=4?<DuelRules version={practiceOpen||learnOpen||!inArena?5:previewMatch.rulesVersion}/>:<><p>Three residents against three. Reduce the whole opposing crew’s composure to zero. Chain multiple Drama &amp; Receipt cards up to 4 Energy per turn, then unleash your combo!</p><dl><dt>CALL OUT / RECEIPTS</dt><dd>Damage the active opponent and gain 1 hype. The preview includes current guard, exposure and weakness.</dd><dt>SPECIAL</dt><dd>Spend 3 hype on the character’s authored ability. Effects and animation are character-specific.</dd><dt>COMMUNITY NOTE / LAWYER UP</dt><dd>Gain 1 hype and block 60% of the next hit. Shield replaces an existing shield; it does not stack.</dd><dt>TAG IN</dt><dd>Select a standing bench resident or play Call The Manager. This spends your turn. A knockout automatically promotes the next resident.</dd><dt>DUO FINISHER</dt><dd>A matching partner needs to be standing with at least 1 hype. Spend 3 lead hype plus 1 partner hype. Once per side per fight.</dd></dl><p>Three matching factions start with 2 hype; three different factions start with a 35% shield. Each resident also has a once-per-battle faction passive. Foils do not change stats.</p><p>Campaign first clears earn 1 pack + 50 XP; daily first wins earn 1 pack + 25 XP. Mastery can add rewards. Practice earns none. After 40 rounds, standing residents and remaining health decide the verdict; a final tie goes to the city.</p><p>Your cards are never consumed. Combat saves before its animation. Surrender records a loss. Sound and reduced motion are controlled in <Link href="/settings/">Settings</Link>.</p></>}</div></Dialog>}</div>;
}

function ygoCardType(def:DramaDeckCardDef):{type:string;badge:string;color:string}{if(def.id==='deck-note'||def.id==='deck-notes-app')return {type:'TRAP',badge:'🛑 COUNTER TRAP',color:'#ff2882'};if(def.kind==='guard')return {type:'TRAP',badge:'🛡️ DEFENSE TRAP',color:'#ff2882'};if(def.kind==='switch')return {type:'SUMMON',badge:'👥 SPECIAL SUMMON',color:'#28e8ff'};if(def.kind==='ability'||def.cost>=3)return {type:'TRIBUTE',badge:'👑 TRIBUTE FINISHER',color:'#ffd700'};if(def.id==='deck-receipt'||def.id==='deck-leaked-dm')return {type:'SPELL',badge:'⚡ QUICK-PLAY SPELL',color:'#00e5a3'};return {type:'SPELL',badge:'📜 SPELL CARD',color:'#00e5a3'};}
function CourtStageOverlay({match,ready,onSwitch}:{match:Match;ready:boolean;onSwitch:(slot:number)=>void}){
 return <div className="reference-battle-crews">{(['player','enemy'] as const).map(side=><div key={side} className={`reference-crew ${side}`}>{match[side].map((f,i)=>{const c=CARD_BY_ID[f.cardId],active=i===match[`${side}Active`];return <div key={f.cardId} className={`reference-fighter ${active?'active':''} ${!f.hp?'knocked-out':''} ${f.guard>0?'in-defense-stance':'in-attack-stance'}`}><PrintedCard card={c} health={{value:f.hp,max:maxHp(f.cardId,match.districtId,side,match.rulesVersion)}} atk={attackPower(c.id,match.districtId,side,match.rulesVersion)} def={f.guard>0?`${Math.round(f.guard*100)}%`:'0%'} stance={f.guard>0?'defense':'attack'}/><div className="reference-fighter-status"><Hype value={f.charge}/>{f.guard>0&&<span className="fighter-stance-badge def" title="Defense Position (60% Shield)"><Shield size={14}/> DEF</span>}{!f.guard&&active&&<span className="fighter-stance-badge atk" title="Attack Position"><Swords size={14}/> ATK</span>}{f.exposed&&<span title="Exposed"><Skull size={17}/></span>}{side==='player'&&!active&&<button disabled={!ready||!f.hp} onClick={()=>onSwitch(i)}>{f.hp?'TAG IN':'CANCELLED'}</button>}{active&&<b>ACTIVE</b>}</div></div>;})}</div>)}</div>;
}

function CourtArenaRouter(props:Parameters<typeof CourtArena>[0]&{blockedReason?:string|null;onPractice?:()=>void}){return props.match.rulesVersion>=4?<DuelArena {...props}/>:<CourtArena {...props}/>;}

function CourtArena({match,isPreview,isRaid,rivalBy,onAutoStart,onLeave,onRematch,cinematicMode,paused}:{match:Match;isPreview?:boolean;isRaid?:boolean;rivalBy?:string|null;onAutoStart?:(action:BattleAction)=>Promise<void>;paused:boolean;onLeave:()=>void;onRematch:()=>void;cinematicMode:CinematicMode}){
 const {run,save,busy,error}=useGame(),reduced=useCityMotion(),[completedStep,setCompletedStep]=useState(match.step),[presented,setPresented]=useState(match),[confirm,setConfirm]=useState(false),[logOpen,setLogOpen]=useState(false),[deckOpen,setDeckOpen]=useState(false),[energy,setEnergy]=useState(4),[playedSlots,setPlayedSlots]=useState<number[]>([]),[queuedAction,setQueuedAction]=useState<BattleAction|null>(null),[comboCount,setComboCount]=useState(0),[customSpeech,setCustomSpeech]=useState<string|null>(null),[customSplat,setCustomSplat]=useState<{label:string;val:string}|null>(null),[handOffset,setHandOffset]=useState(0),[playedNotice,setPlayedNotice]=useState<string|null>(null),actionClock=useRef<{key:string;clock:CinematicClock;cues:Set<string>}|null>(null),[stageReady,setStageReady]=useState(true),[actionFrame,setActionFrame]=useState({step:-1,progress:1,impact:true}),turnFocus=useRef<HTMLDivElement>(null);
 const event=match.events.at(-1),animating=completedStep<match.step,finished=match.phase==='finished',suspended=paused||confirm||logOpen||deckOpen,ready=(stageReady||Boolean(isPreview))&&match.phase==='player'&&!animating&&!busy&&!suspended;
 const cinematic=shouldPlaySpecial(match,completedStep,cinematicMode,suspended)&&event?specialPlayback(match,event,event.side==='player'?save?.props.loadout[match.player[event.actor].cardId]||null:null):null,display=presented.step<=match.step?presented:match;
 const finishPresentation=()=>{setPresented(match);setCompletedStep(match.step);requestAnimationFrame(()=>turnFocus.current?.focus({preventScroll:true}));};
 const fighter=match.player[match.playerActive],card=CARD_BY_ID[fighter.cardId],enemy=match.enemy[match.enemyActive],district=districtOf(match.districtId),duos=availableDuos(match,'player'),attack=forecastAction(match,{type:'attack'}),ability=forecastAction(match,{type:'ability'});
 const playerHp=display.player.reduce((n,f)=>n+f.hp,0),playerMaxLp=display.player.reduce((n,f)=>n+maxHp(f.cardId,match.districtId,'player',match.rulesVersion),0),enemyHp=display.enemy.reduce((n,f)=>n+f.hp,0),enemyMaxLp=display.enemy.reduce((n,f)=>n+maxHp(f.cardId,match.districtId,'enemy',match.rulesVersion),0);

 useEffect(()=>{
  setEnergy(4);
  setPlayedSlots([]);
  setQueuedAction(null);
  setComboCount(0);
  setHandOffset(match.step*2);
 },[match.step,fighter.charge]);

 useEffect(()=>{
  if(!playedNotice)return;
  const t=setTimeout(()=>setPlayedNotice(null),1900);
  return()=>clearTimeout(t);
 },[playedNotice]);

 useEffect(()=>{
  if(!stageReady||match.step<=completedStep||event?.kind==='ability'&&cinematicMode!=='off')return;
  const key=`${match.id}:${match.step}`;
  if(actionClock.current?.key!==key)actionClock.current={key,clock:new CinematicClock(cinematicMode,reduced,actionTiming(event?.kind)),cues:new Set()};
  const record=actionClock.current;record.clock.configure(cinematicMode,reduced);
  let request=0,last=performance.now(),renderAt=-100;const sounds:(()=>void)[]=[];
  const visibility=()=>{last=performance.now();if(document.hidden)for(const stop of sounds)stop();};document.addEventListener('visibilitychange',visibility);
  const tick=(now:number)=>{
   const next=record.clock.tick(now-last,suspended||document.hidden);last=now;
   if(next.emitImpact)setPresented(match);
   if(!suspended&&!document.hidden&&save?.settings.soundEnabled&&event){const cue=next.emitImpact?'impact':next.frame.phase==='entrance'?'windup':next.frame.phase==='verdict'?'gag':null;if(cue&&!record.cues.has(cue)){record.cues.add(cue);sounds.push(liveCue(cue,weaponFamily(specialAt(match[event.side][event.actor].cardId).motif),save.settings.volume));}}
   if(now-renderAt>32||next.frame.complete){setActionFrame({step:match.step,progress:next.frame.progress,impact:next.frame.impact});renderAt=now;}
   if(next.emitComplete){setPresented(match);setCompletedStep(match.step);requestAnimationFrame(()=>turnFocus.current?.focus({preventScroll:true}));return;}
   request=requestAnimationFrame(tick);
  };request=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(request);document.removeEventListener('visibilitychange',visibility);for(const stop of sounds)stop();};
 },[stageReady,match,completedStep,cinematicMode,reduced,event,suspended,save?.settings.soundEnabled,save?.settings.volume]);

 useEffect(()=>{if(!stageReady||match.phase!=='enemy'||animating||busy||error||suspended)return;const timer=setTimeout(()=>void run({type:'battle-enemy',matchId:match.id,step:match.step}),reduced?180:350);return()=>clearTimeout(timer);},[stageReady,match.phase,match.id,match.step,animating,busy,error,suspended,reduced,run]);

 const commitTurn=(finalAction:BattleAction,bannerText?:string,count=comboCount)=>{
  if(!ready)return;
  if(bannerText)setPlayedNotice(bannerText);
  const actionWithCombo:BattleAction={...finalAction};
  if(count>0&&(actionWithCombo.type==='attack'||actionWithCombo.type==='receipt'||actionWithCombo.type==='ability'||actionWithCombo.type==='guard'||actionWithCombo.type==='duo')){
   actionWithCombo.combo=count;
  }
  if(isPreview&&onAutoStart){void onAutoStart(actionWithCombo);return;}
  void run({type:'battle-act',matchId:match.id,step:match.step,action:actionWithCombo});
 };

 const benchSlot=match.player.findIndex((f,idx)=>idx!==match.playerActive&&f.hp>0);
 const benchCard=benchSlot>=0?CARD_BY_ID[match.player[benchSlot].cardId]:CARD_BY_ID.CC015;
 const dmgPreview=attack?.damage||attackPower(card.id,match.districtId,'player',match.rulesVersion);
 const specialDmgPreview=ability?.damage||(dmgPreview+18);
 const latestEvent=display.events.at(-1);
 const actorCardId=latestEvent?display[latestEvent.side][latestEvent.actor]?.cardId:card.id;
 const actorCard=CARD_BY_ID[actorCardId]||card;
 const isImpactShaking=animating&&actionFrame.step===match.step&&actionFrame.impact&&!reduced;

 // Build current 5-card hand from DRAMA_DECK_CATALOG (rotating with handOffset so drawing fresh hands works!)
 const currentHandDefs=[0,1,2,3].map(idx=>DRAMA_DECK_CATALOG[(handOffset+idx)%DRAMA_DECK_CATALOG.length]);

 const resolveActionForDef=(def:DramaDeckCardDef):BattleAction=>{
  if(def.id==='deck-receipt')return {type:'receipt'};
  if(def.kind==='guard')return {type:'guard'};
  if(def.kind==='switch'){
   if(benchSlot>=0)return {type:'switch',slot:benchSlot};
   return {type:'attack'};
  }
  if(def.kind==='ability'){
   if(fighter.charge>=3)return {type:'ability'};
   return {type:'attack'};
  }
  return {type:'attack'};
 };

 const playHandCard=(def:DramaDeckCardDef,slotIdx:number)=>{
  if(!ready||playedSlots.includes(slotIdx)||energy<def.cost)return;
  const action=resolveActionForDef(def);
  const nextEnergy=Math.max(0,energy-def.cost);
  const nextCombo=comboCount+1;
  const nextPlayed=[...playedSlots,slotIdx];
  setEnergy(nextEnergy);
  setPlayedSlots(nextPlayed);
  setComboCount(nextCombo);
  setQueuedAction(action);
  setCustomSpeech(def.speech);
  const comboDmg=Math.round(dmgPreview*(1+(nextCombo-1)*0.35));
  setCustomSplat({
   label:nextCombo>=2?`${def.splat} x${nextCombo}!`:def.splat,
   val:def.kind==='guard'?'+60%':`-${comboDmg}`,
  });

  // If this card spent our last energy OR is a 3-cost finisher, unleash the combo immediately!
  if(nextEnergy===0||def.cost>=3){
   commitTurn(action,nextCombo>=2?`🔥 UNLEASHED ${nextCombo}-CARD COMBO (${def.title})!`:`PLAYED: ${def.title}!`,nextCombo);
  }else{
   setPlayedNotice(`⚡ COMBO x${nextCombo} QUEUED: ${def.title} (${nextEnergy}⚡ LEFT — PLAY ANOTHER CARD OR END TURN!)`);
  }
 };

 const describeCard=(def:DramaDeckCardDef)=>{const action=resolveActionForDef(def),prediction=forecastAction(match,action);if(action.type==='guard')return 'Block 60% of the next hit. Gain 1 hype.';if(action.type==='switch')return 'Tag in '+benchCard.name+'. Ends turn.';if(action.type==='ability')return abilityDescription(card,match.districtId,'player',match.rulesVersion);return 'Deal '+(prediction?.damage??0)+' damage. +1 hype.'+(action.type==='receipt'?' Exposed: next hit +25%.':'')+' Last card resolves.';};
 const handCards=currentHandDefs.map((def,idx)=>{
  const isSpecialSlot=def.kind==='ability'&&fighter.charge>=3;
  return {
   id:`${def.id}-${idx}`,
   cost:def.cost,
   title:isSpecialSlot?card.ability.toUpperCase():def.title,
   building:def.building,
   art:def.kind==='ability'?card.art:(CARD_BY_ID[def.cardId]?.art||card.art),
   tone:def.tone,
   played:playedSlots.includes(idx),
   canAfford:energy>=def.cost,
   desc:describeCard(def),
   onPlay:()=>playHandCard(def,idx),
  };
 });

 return <section className="court-arena court-v2-arena">
  <div className={`court-theater court-v2-theater ${isImpactShaking?'is-shaking':''} ${isRaid?'raid-sirens-active':''}`}>
   <div className="reference-battle-score"><div className="battle-player-label"><Skull/><span><b>{save?.alias||'LOCAL MENACE'}</b><small>Professional Duelist</small><div className="duel-lp-badge"><span className="lp-label">LP</span><strong className="lp-num">{playerHp}</strong><small>/{playerMaxLp}</small></div><meter aria-label="Your crew health" min={0} max={playerMaxLp} value={playerHp}/></span></div><div className="battle-turn-label"><strong className="tape yellow">TURN {Math.floor(match.step/2)+1}</strong><b>{isPreview?'DECLARE OPENING MOVE':match.phase==='player'?'YOUR BATTLE PHASE':match.phase==='enemy'?'ENEMY BATTLE PHASE':'FINAL VERDICT'}</b><small>{district.name} · {match.mode.toUpperCase()} DUEL</small></div><div className="battle-player-label enemy"><Skull/><span><b>{rivalBy||district.name}</b><small>Opponent Duelist · AI</small><div className="duel-lp-badge"><span className="lp-label">LP</span><strong className="lp-num">{enemyHp}</strong><small>/{enemyMaxLp}</small></div><meter aria-label="Opponent crew health" min={0} max={enemyMaxLp} value={enemyHp}/></span></div></div>
   <CourtStageOverlay match={display} ready={ready} onSwitch={slot=>commitTurn({type:'switch',slot},'BENCH TAG-IN!')}/>
   {!animating&&!finished&&<div className="battle-center-callout"><Skull/><strong>{comboCount?`CHAIN x${comboCount}`:'VS'}</strong><span className="tape paper">{comboCount?'CHAIN READY':"DUEL FOR THE BLOCK"}</span><small>{comboCount?'RESOLVE CHAIN OR PLAY CARD':isPreview?'DECLARE OPENING ACTION':'BATTLE PHASE ACTIVE'}</small></div>}
   {/* Center Stage Spiky Comic Speech Bubble & Giant Jagged RATIOED! Starburst */}
   {!finished&&animating&&actionFrame.impact&&latestEvent&&(
    <div className="court-v2-center-fx" aria-hidden="true">
     <div key={`speech-${customSpeech||latestEvent?.step||0}`} className="court-spiky-speech">
      <b>{latestEvent.title}</b>
     </div>
     <div key={`ratio-${customSplat?.label||latestEvent?.step||0}`} className={`court-ratio-starburst ${latestEvent?.knockout?'is-ko':''}`}>
      <strong>{latestEvent.knockout?'DESTROYED TO GRAVEYARD!':latestEvent.kind==='guard'?'DEFENSE HELD!':latestEvent.damage?'BATTLE DAMAGE!':'ON RECORD'}</strong>
      <b>{latestEvent.kind==='guard'?'+60% DEF':latestEvent.damage?`-${latestEvent.damage} LP`:latestEvent.heal?`+${latestEvent.heal} LP`:''}</b>
     </div>
    </div>
   )}

   {playedNotice&&(
    <div className="court-played-banner" role="status">
     <span>⚡ {playedNotice} ⚡</span>
    </div>
   )}

   {finished&&!animating&&<div className={`court-result ${match.winner==='player'?'won':'lost'}`} role="status"><span className="court-verdict-stamp">{match.winner==='player'?'CASE DISMISSED':'GUILTY OF POSTING'}</span>{match.winner==='player'?<Crown size={35}/>:<Skull size={35}/>}<h2>{match.winner==='player'?'RATIO DELIVERED.':'CERTIFIED SKILL ISSUE.'}</h2><p>{match.reason==='surrender'?'Tactical retreat. Your cards are safe.':match.reason==='verdict'?'The 40-round district verdict is final.':match.winner==='player'?`${district.name} has heard enough.`:'Your crew lost the argument. Your collection is safe.'}</p><strong>{match.reward.packs?`+${match.reward.packs} PACKS · +${match.reward.xp} XP`:match.mode==='practice'?'PRACTICE COMPLETE / NO REWARDS':'RESULT SAVED'}</strong><div><button className="block-action pink" disabled={busy||!!error} onClick={onRematch}><RotateCcw size={16}/>REMATCH</button><button className="block-action paper" disabled={busy||!!error} onClick={onLeave}>CHANGE CREW <ArrowRight size={16}/></button></div>{match.reward.packs>0&&<Link href="/packs/">OPEN YOUR REWARD PACKS ↗</Link>}<Link href="/city/">RETURN TO YOUR BLOCK ↗</Link></div>}
  </div>

  {/* Bottom Playable 5-Card Fanned Hand + ENERGY 4/4 + END TURN */}
  <div className="court-tcg-bottom-bar" ref={turnFocus} tabIndex={-1}>
   <div className="court-energy-module">
    <strong className="energy-readout">ENERGY {energy}/4</strong>
    <div className="energy-orbs-row" aria-label={`${energy} of 4 energy`}>
     {[1,2,3,4].map(n=>(
      <span key={n} className={`energy-orb ${n<=energy?'lit':'spent'}`}/>
     ))}
    </div>
    <div className="reference-basic-actions"><button disabled={!ready} onClick={()=>commitTurn({type:'attack'},'⚔️ ATK (STRIKE)')}><Swords/>⚔️ ATK</button><button disabled={!ready||fighter.charge<3} title="Requires 3 hype" onClick={()=>commitTurn({type:'ability'},`👑 TRIBUTE: ${card.ability}`)}><Zap/>👑 TRIBUTE</button><button disabled={!ready} onClick={()=>commitTurn({type:'guard'},'🛡️ DEF (STANCE)')}><Shield/>🛡️ DEF</button><button disabled={!ready} onClick={()=>setDeckOpen(true)}><Users/>🃏 EXTRA DECK</button></div>
    <div className="energy-aux-links">
     <button type="button" className="aux-deck-btn" onClick={()=>setDeckOpen(true)}>🃏 DECK ({DRAMA_DECK_CATALOG.length})</button>
     <button type="button" onClick={()=>setLogOpen(true)}>LOG ({match.events.length})</button>
     <button type="button" disabled={finished||busy||animating} onClick={()=>setConfirm(true)}><Flag size={11}/> FOLD</button>
    </div>
   </div>

   <div className="court-fanned-hand" role="group" aria-label="Playable drama and receipt cards">
    {handCards.map((hc,idx)=>{const ygo=ygoCardType(currentHandDefs[idx]);return (
     <button
      key={hc.id}
      type="button"
      className={`tcg-hand-card slot-${idx} tone-${hc.tone} ${hc.played?'is-played-combo':''} ${!hc.canAfford&&!hc.played?'no-energy':''} ${idx===4&&fighter.charge>=3?'ult-ready':''}`}
      title={hc.desc}
      disabled={!ready||hc.played||!hc.canAfford}
      onClick={hc.onPlay}
     >
      <span className="hand-card-cost" aria-label={`Cost ${hc.cost} energy`}>{hc.cost}</span>
      <span className="hand-card-ygo-badge" style={{borderColor:ygo.color,color:ygo.color}}>{ygo.badge}</span>
      <span className="hand-card-header">
       <b>{hc.played?'✓ CHAIN LINK':hc.title}</b>
      </span>
      <span className="hand-card-art-box">
       <img src={hc.art} alt="" draggable={false}/>
       <span className="hand-card-halftone" aria-hidden="true"/>
      </span>
      <span className="hand-card-desc">
       <small>{hc.desc}</small>
      </span>
     </button>
    );})}
   </div>

   <div className="court-end-turn-module">
    <div className="active-hype-chip">
     <span>{card.name.toUpperCase()}</span>
     <Hype value={fighter.charge}/>
    </div>
    <button
     type="button"
     className={`court-end-turn-btn ${comboCount>0?'combo-hot':''}`}
     disabled={!ready}
     onClick={()=>{
      const finalAct=queuedAction||(fighter.charge>=3?{type:'ability'}:{type:'attack'});
      commitTurn(finalAct,comboCount>0?`🔥 CHAIN RESOLVED (${comboCount} CARDS)!`:'END BATTLE PHASE');
     }}
    >
     <span>{comboCount>0?`CHAIN x${comboCount}`:'END PHASE'}</span>
    </button>
   </div>
  </div>

  <aside className="reference-battle-log"><h2 className="tape yellow">BATTLE LOG</h2><ol aria-live="polite">{match.events.slice(-12).reverse().map(e=><li key={e.step}><Portrait card={CARD_BY_ID[match[e.side][e.actor].cardId]}/><p><b>TURN {Math.ceil(e.step/2)} · {e.side==='player'?'YOU':'CITY'}</b>{e.text}</p></li>)}{!match.events.length&&<li><p><b>YOUR MOVE</b>Play a card or choose Attack. Your crew and collection stay safe.</p></li>}</ol><button onClick={()=>setLogOpen(true)}>FULL TRANSCRIPT ↗</button></aside>
  <div className="reference-battle-bottom"><div><b className="tape yellow">SCANDAL METER</b><meter min={0} max={3} value={fighter.charge} aria-label="Active resident hype"/><small>{fighter.charge} / 3 HYPE · SPECIAL {fighter.charge>=3?'READY':'CHARGING'}</small></div><div className="reference-battle-quips" aria-live="polite"><button onClick={()=>setCustomSpeech('LOL. THE RECEIPTS SPEAK FOR THEMSELVES.')}>LOL</button><button onClick={()=>setCustomSpeech('RATIO. THE CITY HAS HEARD ENOUGH.')}>RATIO’D</button><button onClick={()=>setCustomSpeech('PERMABAN? I’LL APPEAL.')}>PERMABAN</button><button onClick={()=>setCustomSpeech('COPIUM IS A RENEWABLE RESOURCE.')}>COPE</button><button onClick={()=>setCustomSpeech('TOUCH GRASS. THE LAWN FILED A COMPLAINT.')}>TOUCH GRASS</button><small>{customSpeech||'LOCAL REACTIONS · SOLO BATTLE'}</small></div></div>
  {cinematic&&<SpecialCinematic key={cinematic.key} playback={cinematic} mode={cinematicMode} onImpact={()=>setPresented(match)} onComplete={finishPresentation}/>}

  {/* CITY-UNLOCKED 15-CARD DRAMA & RECEIPT DECK MODAL */}
  {deckOpen&&(
   <Dialog wide title="🃏 DRAMA & RECEIPT DECK (15 CARDS)" onClose={()=>setDeckOpen(false)}>
    <div className="court-deck-modal">
     <p className="court-deck-intro">
      Prepare up to <b>4 energy</b> of cards. The final card determines the committed action; each preceding card adds 35% damage to that action. Guard and tag-ins do not gain damage. Submit with END TURN. This shared deck rotates every turn.
     </p>
     <div className="court-deck-grid">
      {DRAMA_DECK_CATALOG.map(dc=>(
       <div key={dc.id} className={`court-deck-card-item tone-${dc.tone}`}>
        <div className="deck-card-top">
         <span className="deck-cost-orb">{dc.cost}⚡</span>
         <span className="deck-building-pill">🏢 {dc.building}</span>
        </div>
        <div className="deck-card-thumb">
         <img src={CARD_BY_ID[dc.cardId]?.art||card.art} alt=""/>
         <b>{dc.title}</b>
        </div>
        <small>{describeCard(dc)}</small>
       </div>
      ))}
     </div>
    </div>
   </Dialog>
  )}

  {logOpen&&<Dialog title="THE COURT TRANSCRIPT" onClose={()=>setLogOpen(false)}><ol className="court-transcript">{match.events.map(e=><li key={e.step}><small>{e.side==='player'?'YOU':'CITY'} / ACTION {e.step}</small><p>{e.text}</p></li>)}{!match.events.length&&<li>The hearing has not started yet.</li>}</ol></Dialog>}
  {confirm&&<Dialog title="LEAVE THE THREAD?" onClose={()=>setConfirm(false)}><p>Surrender ends this battle as a loss. Your collection stays safe.</p><div className="court-confirm"><button className="block-action pink" disabled={busy} onClick={async()=>{if(await run({type:'battle-surrender',matchId:match.id}))setConfirm(false);}}>SURRENDER</button><button className="block-action paper" disabled={busy} onClick={()=>setConfirm(false)}>KEEP FIGHTING</button></div></Dialog>}
 </section>;
}
