'use client';
import Link from 'next/link';
import {useSearchParams} from 'next/navigation';
import {useState} from 'react';
import {ArrowRight,Check,Copy,Heart,Lock,Search,Share2,Shield,Sparkles,Swords,Ticket,X} from 'lucide-react';
import {CARD_BY_ID,type Card} from '../data/cards';
import {DUOS} from '../data/duos';
import {PASSIVES} from '../data/combat-kit';
import {abilityDescription,attackPower,crewFor,DISTRICTS,districtOf,maxHp,squadBonus,type DistrictId} from '../domain/battle';
import {courtUnlocked,type CourtMode} from '../domain/court';
import {quantity} from '../domain/game';
import {useGame} from '../state/store';
import {Portrait,ResidentCard} from './card';
import {Dialog} from './dialog';
type Props={team:string[];roster:Card[];district:DistrictId;mode:CourtMode;day:string|null;guided:boolean;disabled:boolean;onChoose:(id:string)=>void;onTeam:(ids:string[])=>void;onDistrict:(id:DistrictId)=>void;onMode:(mode:CourtMode)=>void;onStart:()=>void};
export function CourtLobby({team,roster,district,mode,day,guided,disabled,onChoose,onTeam,onDistrict,onMode,onStart}:Props){
 const {save,run}=useGame(),params=useSearchParams(),[query,setQuery]=useState(''),[notice,setNotice]=useState(''),[wantedOpen,setWantedOpen]=useState(false),[copied,setCopied]=useState(false);
 const vsParam=params.get('vs')||'',challengerIds=vsParam.split(',').filter(id=>Object.hasOwn(CARD_BY_ID,id)).slice(0,3);
 const docket=districtOf(district),cleared=save?.battle.clearedDistrictIds||[],crew=challengerIds.length===3?challengerIds:crewFor(district,mode,day),bonus=squadBonus(team),pairs=DUOS.filter(d=>d.pair.every(id=>team.includes(id))),filtered=roster.filter(c=>(c.name+' '+c.ability).toLowerCase().includes(query.toLowerCase()));
 const dailyDone=!!day&&save?.awardedRewardIds.includes(`daily-battle:${day}`);
 const bountyTotal=team.reduce((acc,id)=>acc+(CARD_BY_ID[id]?.stats.clout||50)*12500+(CARD_BY_ID[id]?.stats.chaos||50)*8500,0);
 const copyChallengeLink=async()=>{
  const url=`${window.location.origin}/battle/?vs=${team.join(',')}&district=${district}`;
  try{await navigator.clipboard.writeText(url);}catch{}
  setCopied(true);
  setTimeout(()=>setCopied(false),2800);
 };
 return <div className="court-lobby-stage">
  <div className="court-wall-poster left" aria-hidden="true"><span>EXHIBIT A</span><b>CRINGE</b></div>
  <div className="court-wall-poster right" aria-hidden="true"><span>NO LAWYERS</span><b>RATIO ONLY</b></div>
  <header className="court-brush-banner">
   <div className="court-brush-title"><h1>SCREENSHOT COURT / 3V3 TRIBUNAL</h1></div>
   <div className="court-brush-sub">
    <p>DROP THE RECEIPTS. WIN FREE PACKS.</p>
    <button type="button" className="court-wanted-trigger" onClick={()=>setWantedOpen(true)}>
     <Share2 size={14}/><span>WANTED POSTER / CHALLENGE FRIEND</span>
    </button>
   </div>
  </header>
  <div className="court-lobby"><aside className="court-docket"><div className="court-docket-heading"><small>MUNICIPAL COURT / CASE FILES</small><h2>CHOOSE YOUR<br/><em>BAD DECISION.</em></h2></div><div className="court-modes" aria-label="Battle mode">{(['campaign','daily','practice'] as const).map(m=><button key={m} aria-pressed={mode===m} onClick={()=>onMode(m)}>{m}</button>)}</div><p className="court-mode-copy">{mode==='daily'?'One new crew every UTC day. One daily reward.':mode==='practice'?'All districts open. No mastery, XP or pack rewards.':'Six districts. Clear each case to open the next.'}</p><div className="court-case-list">{DISTRICTS.map((d,i)=>{const open=courtUnlocked(d.id,mode,cleared),won=cleared.includes(d.id);return <button key={d.id} disabled={!open} aria-pressed={district===d.id} onClick={()=>onDistrict(d.id)}><b>{String(i+1).padStart(2,'0')}</b><span>{d.name}<small>{!open?'CLEAR THE PREVIOUS CASE':mode==='practice'?'PRACTICE CASE':mode==='daily'?'DAILY REMIX':won?'CLEARED / MASTERY REPLAY':'FIRST WIN: 1 PACK + 50 XP'}</small></span>{!open?<Lock size={15}/>:won?<Check size={17}/>:<ArrowRight size={17}/>}</button>;})}</div><Link href="/roast/" className="court-side-link">Prefer verbal violence? <b>ROAST NIGHT ↗</b></Link><Link href="/city/" className="court-side-link">Return to <b>YOUR NEIGHBOURHOOD ↗</b></Link></aside>
  <section className="court-preparation">
   {challengerIds.length===3&&(
    <div className="court-challenger-banner" role="status">
     <div>
      <span className="challenger-kicker">⚡ INCOMING STREET CHALLENGE LINK DETECTED ⚡</span>
      <b>CHALLENGER SQUAD: {challengerIds.map(id=>CARD_BY_ID[id].name.toUpperCase()).join(' · ')}</b>
     </div>
     <button type="button" className="block-action acid" disabled={disabled||team.length!==3} onClick={onStart}>
      <Swords size={16}/><span>ACCEPT CHALLENGE</span>
     </button>
    </div>
   )}
   <div className="court-matchup"><div className="court-matchup-left"><div className="court-bailiff" aria-hidden="true"><img src="/assets/actors/CC002-roster-v2-0.webp" alt="" draggable={false}/></div><div><span className="court-eyebrow">CASE {docket.tag} / {mode.toUpperCase()}</span><h1>{docket.name}</h1><p>“{docket.description}”</p><span className="court-prize"><Ticket size={16}/>{mode==='practice'?'FREE REHEARSAL · NO REWARDS':mode==='daily'?dailyDone?'DAILY REWARD ALREADY COLLECTED':'FIRST DAILY WIN: 1 PACK + 25 XP':cleared.includes(district)?'REPLAY FOR MASTERY':'FIRST CLEAR: 1 PACK + 50 XP'}</span></div></div><span className="court-matchup-vs" aria-hidden="true">VS</span><div className="court-opponents"><small>{challengerIds.length===3?'CHALLENGER CREW':'THE PROSECUTION'}</small><div>{crew.map(id=><div key={id}><Portrait card={CARD_BY_ID[id]}/><b>{CARD_BY_ID[id].name}</b></div>)}</div></div></div>
  <div className="court-crew-heading"><div><span className="court-eyebrow">YOUR DEFENCE / {team.length} OF 3</span><h2>THREE NAMES. ZERO ALIBIS.</h2></div><span>{guided?'Starter loaners are ready to fight.':'Your cards are never consumed.'}</span></div>
  <div className="court-squad-slots">{[0,1,2].map(slot=><article key={slot} className={team[slot]?'filled':''}><header><span>{slot===0?'01 / LEAD RESIDENT':`0${slot+1} / BENCH`}</span>{team[slot]&&<button disabled={disabled} onClick={()=>onChoose(team[slot])} aria-label={`Remove ${CARD_BY_ID[team[slot]].name}`}><X size={15}/></button>}</header>{team[slot]?<><ResidentCard card={CARD_BY_ID[team[slot]]} compact/><div className="court-card-meta"><span><Heart size={12}/>{maxHp(team[slot],district,'player',3)} <Swords size={12}/>{attackPower(team[slot],district,'player',3)}</span><small>{quantity(save,team[slot]).regular+quantity(save,team[slot]).foil?'OWNED':'FREE LOANER'}</small></div>{slot>0&&<button className="court-make-lead" disabled={disabled} onClick={()=>onTeam([team[slot],...team.filter((_,i)=>i!==slot)])}>MAKE LEAD ↑</button>}</>:<div className="court-empty-slot"><b>?</b><span>ADD A RESIDENT BELOW</span></div>}</article>)}</div>
  <div className="court-launch"><div className="court-synergy"><Shield size={21}/><span><b>{bonus==='coalition'?'MIXED MESSAGES':bonus==='chorus'?'ECHO CHAMBER':'SQUAD SYNERGY'}</b><small>{team.length!==3?'Choose three residents to see your starting bonus.':bonus==='coalition'?'Three factions: everyone starts with a 35% shield.':bonus==='chorus'?'One faction: everyone starts with 2 hype.':'No starting bonus. Three distinct factions give shields; three matching factions give hype.'}</small></span></div><button className="block-action pink" disabled={disabled||team.length!==3||!courtUnlocked(district,mode,cleared)||mode==='daily'&&!day} onClick={onStart}><Swords size={22}/>{team.length===3?'ENTER SCREENSHOT COURT':`CHOOSE ${3-team.length} MORE`}<ArrowRight size={20}/></button></div>
  {pairs.length>0&&<p className="court-duo-ready"><Sparkles size={16}/>DUO CASTING READY: {pairs.map(p=>p.name).join(' / ')} <small>3 lead + 1 partner hype · once per fight</small></p>}
  <details className="court-crew-details"><summary>ABILITY DOSSIERS / DUO CASTING / SAVED SQUADS</summary><div className="court-kit-grid">{team.map(id=><div key={id}><b>{CARD_BY_ID[id].name} / {CARD_BY_ID[id].ability}</b><p>{abilityDescription(CARD_BY_ID[id],district,'player',3)}</p><small>{PASSIVES[CARD_BY_ID[id].faction].name}: {PASSIVES[CARD_BY_ID[id].faction].text} · {save?.career.mastery[id]||0} mastery wins</small></div>)}</div><div className="court-presets">{[0,1,2].map(slot=><div key={slot}><button disabled={disabled||!save?.career.presets[slot]} onClick={()=>onTeam(save!.career.presets[slot])}>LOAD SQUAD {slot+1}</button><button disabled={disabled||!save||team.length!==3} onClick={async()=>{if(await run({type:'preset',slot,team}))setNotice(`SQUAD ${slot+1} SAVED.`);}}>SAVE</button></div>)}</div><span role="status">{notice}</span><div className="court-duo-list">{DUOS.map(d=><small key={d.id}><b>{d.name}</b> {d.pair.map(id=>CARD_BY_ID[id].name).join(' + ')}</small>)}</div></details>
  <div className="court-roster-heading"><h3>RECRUIT FROM YOUR COLLECTION</h3><label><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search residents or abilities" aria-label="Search available battle residents"/></label></div><p className="court-selection-hint">{team.length===3?'Remove a squad member above to choose a replacement. The first slot starts the fight.':'Choose residents below. Every standing bench resident can tag in during a fight.'}</p><div className="court-roster">{filtered.map(card=>{const selected=team.includes(card.id),q=quantity(save,card.id);return <button key={card.id} aria-pressed={selected} disabled={disabled||!selected&&team.length===3} onClick={()=>onChoose(card.id)}><Portrait card={card}/><span><b>{card.name}</b><small>{q.regular+q.foil?'OWNED':'FREE LOANER'} · {card.ability}</small></span>{selected&&<Check size={17}/>}</button>;})}{!filtered.length&&<p>No residents match that search.</p>}</div><Link href="/packs/" className="court-recruit-link">NEED WORSE COMPANY? OPEN PACKS <ArrowRight size={15}/></Link>
  </section></div>
  {wantedOpen&&(
   <Dialog wide title="CANCEL CITY MOST WANTED / SHAREABLE SQUAD CHALLENGE" onClose={()=>setWantedOpen(false)}>
    <div className="wanted-poster-modal">
     <div className="wanted-poster-header">
      <span className="wanted-stamp">★ PUBLIC ENEMIES AT LARGE ★</span>
      <h2>WANTED FOR AGGRAVATED POSTING</h2>
      <p>BOUNTY: <b>{bountyTotal.toLocaleString()} CLOUT</b> · CASE: {docket.name.toUpperCase()}</p>
     </div>
     <div className="wanted-poster-cards">
      {team.map((id,idx)=>{
       const c=CARD_BY_ID[id];
       return c?(
        <div key={id} className="wanted-card-slot">
         <span className="wanted-slot-tag">{idx===0?'RINGLEADER':'ACCOMPLICE'}</span>
         <ResidentCard card={c} compact/>
        </div>
       ):null;
      })}
     </div>
     <div className="wanted-poster-footer">
      <div className="wanted-url-preview">
       <small>SHAREABLE CHALLENGE LINK</small>
       <code>{`/battle/?vs=${team.join(',')}&district=${district}`}</code>
      </div>
      <button type="button" className="block-action acid" onClick={()=>void copyChallengeLink()}>
       <Copy size={18}/>
       <span>{copied?'CHALLENGE LINK COPIED!':'COPY CHALLENGE LINK'}</span>
      </button>
     </div>
    </div>
   </Dialog>
  )}
 </div>;
}
