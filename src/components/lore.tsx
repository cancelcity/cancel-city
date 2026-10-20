'use client';
import Link from 'next/link';
import {CSSProperties,useState} from 'react';
import {AnimatePresence,motion} from 'motion/react';
import {ArrowDownRight,ArrowUpRight,Check,Search,Skull,Zap} from 'lucide-react';
import {CARDS,CARD_BY_ID,FACTIONS,Card,FactionId,rarityOf,setOf,SETS} from '../data/cards';
import {PASSIVES} from '../data/combat-kit';
import {quantity} from '../domain/game';
import {useGame} from '../state/store';
import {Portrait} from './card';
import {MemeArchive} from './internet';
import {internetSearch} from '../data/internet';
import {CITY_EASE,useCityMotion} from './city-motion';
const FILES:Record<FactionId,{headline:string;territory:string;lead:string;story:string[];motto:string}>={
 "terminally-online": {
  "headline": "THE DEAD INTERNET IS ALIVE HERE.",
  "territory": "THE SCROLL",
  "lead": "CC031",
  "motto": "Source: the guy replying to himself.",
  "story": [
   "The city began as a ratio. Nobody remembers the original post; everybody has a screenshot of the screenshot. Feed Tower turned the comment section into public infrastructure. Pigeons deliver notifications. Grass is technically available, but the residents consider touching it a concession.",
   "Discord Dictator writes the laws. The Reply Guy corrects their punctuation. Zuck.exe performs a normal human barbecue while the bots argue beneath it. The Algorithm calls the whole mess authentic conversation. The rest of the city calls it 3 a.m."
  ]
 },
 "corporate-hell": {
  "headline": "THIS IS FINE. CLOCK IN.",
  "territory": "THE MACHINE",
  "lead": "CC033",
  "motto": "Your burnout is a growth opportunity.",
  "story": [
   "The wellness room is on fire. HR has classified the flames as warm company culture. The intern is paid in exposure, the LinkedIn Gladiator is humbled to haunt the building, and the CEO has posted a photo of his smaller yacht. Everyone agrees the quarter is challenging.",
   "Prime Overlord ships anxiety overnight. Subscription Goblin has hidden the exit behind Cancellation Pro. PR Factory turns the incident into a statement, the statement into an apology and the apology into merch. Morale is dead, but its calendar is fully booked."
  ]
 },
 "international-incidents": {
  "headline": "THE GROUP CHAT HAS IMMUNITY.",
  "territory": "THE SUMMIT",
  "lead": "CC035",
  "motto": "Refuse to elaborate. Send the invoice.",
  "story": [
   "The summit was supposed to be a serious meeting. Then somebody posted ketchup pasta. Now Nonna has entered the chat, Florida Man is fighting the lawn, and the neutral delegation is charging both sides for binoculars. International relations have become an unskippable side quest.",
   "Il Monumento orders a bigger statue of the agreement nobody reached. World Tour Savior offers a deluxe encore to solve the argument. The French Strike Simulator refuses to explain why the explanation department is on strike. Diplomacy is still buffering."
  ]
 },
 "politics-hypocrisy": {
  "headline": "THE PODIUM IS POSTING THROUGH IT.",
  "territory": "CITY HALL",
  "lead": "CC037",
  "motto": "The promise is coming in the next update.",
  "story": [
   "City Hall has one policy: remain the main character. The avatar changes, the megaphone gets louder, and the campaign promises are released as seasonal cosmetics. Democracy Paywall gives everyone a voice, provided their trial has not expired. The tax wizard has moved the budget to an island.",
   "Don Tremendous argues with the scoreboard and declares a tremendous victory over arithmetic. The Eternal Candidate announces an announcement. The Virtue Signaler condemns a headline he has not read. Nobody can fix the potholes because the potholes have become a culture war."
  ]
 },
 "crypto-degenerates": {
  "headline": "COPIUM IS THE LOCAL CURRENCY.",
  "territory": "RUG ALLEY",
  "lead": "CC039",
  "motto": "We are so back. Refresh. It is so over.",
  "story": [
   "The chart went down, so Rug Alley rotated every monitor. The devs were cooking; it turned out to be the books. Diamond Hands Corpse still owns the bag. Forgotten Seed Phrase remembers the password’s emotional atmosphere. The road to the moon ends at a garage.",
   "Elongated Ego buys the town square to stop getting ratioed in it. The Laser-Eye Prophet calls the collapsing floor a buying opportunity. Two rug pullers announce an exciting transfer of community ownership. The exit signs point toward a username that no longer exists."
  ]
 },
 "cursed-society": {
  "headline": "THE APOLOGY HAS A DISCOUNT CODE.",
  "territory": "THE AFTERPARTY",
  "lead": "CC041",
  "motto": "Accountability. Available in four colors.",
  "story": [
   "The Afterparty is a cursed iceberg with a postcode. Surface level: ring lights and main characters. Below that: Notes app apologies, manager summons and doomer bunkers. At the bottom, the Doomscroll Parasite explains the spoon-reviewer divorce arc to anyone still awake.",
   "Ye of Chaos is the headline, the album and the guest feature. The Apology Influencer releases a redemption hoodie before the disaster. Karen has left a one-star review of the universe. The Cancelled Messiah announces a second downfall because the first sold out."
  ]
 }
};
export function LoreScreen({onInspect}:{onInspect:(card:Card)=>void}){
 const [tab,setTab]=useState<'factions'|'residents'|'memes'>('factions'),[faction,setFaction]=useState<FactionId|null>(null),[query,setQuery]=useState(''),[edition,setEdition]=useState('');
 const save=useGame(s=>s.save),file=faction?FILES[faction]:null,identity=FACTIONS.find(f=>f.id===faction),roster=CARDS.filter(c=>(!faction||c.faction===faction)&&(!query||internetSearch(c).includes(query.toLowerCase()))&&(!edition||setOf(c)===edition));
 return <section className="whole-archive"><header className="newspaper-masthead"><div><span>ALL THE OUTRAGE THAT’S FIT TO PRINT</span><h1>THE CANCELLED TIMES</h1><p>INTERNET LORE. MUNICIPAL CONSEQUENCES.</p></div><span className="newspaper-edition">{CARDS.length} RESIDENTS<br/>SIX FACTIONS<br/>ZERO HEROES</span></header><nav className="paper-tabs archive-tabs" aria-label="Archive sections">{([['factions','FACTIONS'],['residents','RESIDENT STORIES'],['memes','MEME ARCHIVE']] as const).map(([key,title])=><button key={key} aria-pressed={tab===key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{title}</button>)}<Link href="/cinema/specials/">CINEMA <ArrowUpRight size={17}/></Link></nav><div className="archive-layout"><div className="archive-editorial">{tab==='factions'&&!file&&<div className="newspaper-factions">{FACTIONS.map(f=><article className="faction-column" key={f.id}><span>FACTION FILE / {FILES[f.id].territory}</span><h2>{f.name}</h2><button className="faction-column-art" onClick={()=>onInspect(CARD_BY_ID[FILES[f.id].lead])} aria-label={`Inspect ${CARD_BY_ID[FILES[f.id].lead].name}`}><Portrait card={CARD_BY_ID[FILES[f.id].lead]}/></button><h3>{FILES[f.id].headline}</h3><p>{FILES[f.id].story[0].split('. ').slice(0,2).join('. ')}.</p><button className="button magenta small" onClick={()=>setFaction(f.id)}>READ FILE <ArrowUpRight size={15}/></button></article>)}</div>}{tab==='factions'&&file&&identity&&<article className="newspaper-story paper-panel"><button className="text-link" onClick={()=>setFaction(null)}>← ALL FACTION FILES</button><span>{identity.name} / {file.territory}</span><h2>{file.headline}</h2><button className="newspaper-story-art" onClick={()=>onInspect(CARD_BY_ID[file.lead])}><Portrait card={CARD_BY_ID[file.lead]}/></button>{file.story.map(p=><p key={p}>{p}</p>)}<blockquote>“{file.motto}”</blockquote><div className="newspaper-passive"><b>{PASSIVES[identity.id].name}</b><p>{PASSIVES[identity.id].text}</p></div><button className="button magenta" onClick={()=>setTab('residents')}>MEET THE RESIDENTS <ArrowUpRight size={17}/></button></article>}{tab==='residents'&&<div className="archive-resident-files"><div className="archive-search"><label><Search size={17}/><input aria-label="Search all lore residents" placeholder="Find a resident or a bad take…" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Lore faction" value={faction||''} onChange={e=>setFaction(e.target.value as FactionId||null)}><option value="">ALL FACTIONS</option>{FACTIONS.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select><select aria-label="Filter lore set" value={edition} onChange={e=>setEdition(e.target.value)}><option value="">ALL SETS</option>{SETS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div><div className="archive-resident-grid">{roster.map(c=><button key={c.id} onClick={()=>onInspect(c)}><Portrait card={c}/><span><small>{rarityOf(c.rarity).name} / {quantity(save,c.id).regular+quantity(save,c.id).foil?'OWNED':'UNDISCOVERED'}</small><b>{c.name}</b><p>“{c.quote}”</p></span></button>)}</div>{!roster.length&&<p className="paper-panel">NO RECEIPTS FOUND.</p>}</div>}{tab==='memes'&&<MemeArchive onInspect={onInspect}/>}</div><aside className="archive-film-strip"><span>SPECIAL ATTACK THEATER</span><Link href="/cinema/karen/" className="archive-film-art"><Portrait card={CARD_BY_ID.CC026} large/><i>▶</i></Link><h2>FINAL BOSS KAREN</h2><p>Some complaints need a cinematic universe.</p><Link className="button magenta" href="/cinema/karen/">WATCH CINEMATIC <ArrowUpRight size={17}/></Link><Link className="archive-all-films" href="/cinema/specials/">ALL SPECIALS <ArrowUpRight size={17}/></Link><div className="archive-crosslinks"><span>ALSO IN THIS EDITION</span><Link href="/missions/">AIRFRYER GATE / THE ORIGINAL RECEIPTS →</Link><Link href="/city/">THE NEIGHBOURHOOD DESK →</Link><Link href="/collection/">YOUR PERSONAL ALBUM →</Link></div></aside></div></section>;
}
