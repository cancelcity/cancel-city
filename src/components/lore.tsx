'use client';
import Link from 'next/link';
import {CSSProperties,useState} from 'react';
import {AnimatePresence,motion} from 'motion/react';
import {ArrowDownRight,ArrowUpRight,Check,Search,Skull,Zap} from 'lucide-react';
import {CARDS,CARD_BY_ID,FACTIONS,Card,FactionId,rarityOf,setOf} from '../data/cards';
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
 const [faction,setFaction]=useState<FactionId>('politics-hypocrisy'),[query,setQuery]=useState(''),[edition,setEdition]=useState('');
 const save=useGame(s=>s.save),reduced=useCityMotion(),file=FILES[faction],identity=FACTIONS.find(f=>f.id===faction)!,lead=CARD_BY_ID[file.lead],q=query.trim().toLowerCase();
 const roster=CARDS.filter(c=>(q?internetSearch(c).includes(q):c.faction===faction)&&(!edition||setOf(c)===edition));
 const owned=CARDS.filter(c=>c.faction===faction&&quantity(save,c.id).regular+quantity(save,c.id).foil>0).length;
 return <div className="casebook" style={{'--file-color':identity.color} as CSSProperties}>
  <header className="casebook-cover"><div className="casebook-kicker"><span className="tape yellow">CANCEL CITY ARCHIVES</span><span>VOL. 02 / CULT OF PERSONALITY</span></div><div className="casebook-cover-grid"><div><p className="casebook-overline">INTERNET LORE. MUNICIPAL CONSEQUENCES.</p><h1>NO THOUGHTS.<br/><span>ONLY LORE.</span></h1><p className="casebook-intro">{CARDS.length} residents. Six factions. A city built from shitposts, dead charts, billionaire ego and cursed comment sections.</p><a href="#shitpost-archive" className="button paper">ENTER THE BRAINROT <ArrowDownRight size={20}/></a></div><div className="casebook-cover-art"><motion.button className="casebook-poster rocket" aria-label="Inspect Elongated Ego" onClick={()=>onInspect(CARD_BY_ID.CC039)} initial={reduced?false:{opacity:0,y:28,rotate:5}} animate={{opacity:1,y:0,rotate:5}} whileHover={reduced?undefined:{rotate:1,y:-8}} transition={{duration:reduced?0:.55,ease:CITY_EASE}}><Portrait card={CARD_BY_ID.CC039} large priority/><span>THE REBRAND BARON <ArrowUpRight size={18}/></span></motion.button><motion.button className="casebook-poster podium" aria-label="Inspect Don Tremendous" onClick={()=>onInspect(CARD_BY_ID.CC037)} initial={reduced?false:{opacity:0,y:38,rotate:-8}} animate={{opacity:1,y:0,rotate:-8}} whileHover={reduced?undefined:{rotate:-3,y:-8}} transition={{duration:reduced?0:.55,delay:reduced?0:.1,ease:CITY_EASE}}><Portrait card={CARD_BY_ID.CC037} large/><span>THE PODIUM TYRANT <ArrowUpRight size={18}/></span></motion.button><span className="casebook-cover-stamp">12 NEW<br/>PUBLIC MENACES</span></div></div><div className="casebook-rule"><Skull size={18}/><span>ALL CHARACTERS AND DIALOGUE ARE FICTIONAL SATIRE.</span><span>EVERYONE IS THE PROBLEM.</span></div></header>
  <MemeArchive onInspect={onInspect}/>
  <section className="casebook-files" id="faction-files"><nav className="casebook-directory" aria-label="Faction case files"><span className="casebook-directory-label">SELECT A FACTION</span>{FACTIONS.map((f,i)=><button key={f.id} className={faction===f.id?'selected':''} aria-pressed={faction===f.id} onClick={()=>{setFaction(f.id);setQuery('');}} style={{'--tab-color':f.color} as CSSProperties}><span>0{i+1}</span><b>{f.name}</b><ArrowUpRight size={17}/></button>)}</nav><AnimatePresence mode="wait" initial={false}><motion.article key={faction} className="casebook-file" initial={reduced?false:{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:reduced?0:.24,ease:CITY_EASE}}><div className="casebook-file-copy"><span className="casebook-label">FACTION DOSSIER / {file.territory}</span><h2>{file.headline}</h2>{file.story.map(p=><p key={p}>{p}</p>)}<blockquote>“{file.motto}”</blockquote><div className="casebook-file-facts"><div><span>ROSTER</span><b>{owned} / {CARDS.filter(c=>c.faction===faction).length} OWNED</b></div><div><span>FACTION PASSIVE</span><b>{PASSIVES[faction].name}</b><small>{PASSIVES[faction].text}</small></div></div></div><button className="casebook-person-of-interest" onClick={()=>onInspect(lead)} aria-label={`Inspect ${lead.name}`}><Portrait card={lead} large/><span className="tape pink">PERSON OF INTEREST</span><strong>{lead.name}</strong><small>OPEN RESIDENT DOSSIER <ArrowUpRight size={16}/></small></button></motion.article></AnimatePresence></section>
  <section className="casebook-roster"><div className="casebook-roster-heading"><div><span className="casebook-label">THE USUAL SUSPECTS</span><h2>{q?'SEARCH RESULTS.':identity.name.toUpperCase()+'.'}</h2></div><div className="casebook-search"><label><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search residents or memes…" aria-label="Search all lore residents"/></label><select value={edition} onChange={e=>setEdition(e.target.value)} aria-label="Filter lore set"><option value="">ALL SETS</option><option value="set-02">CULT OF PERSONALITY</option><option value="set-01">CITY INTAKE</option></select></div></div><div className="casebook-residents"><AnimatePresence mode="popLayout">{roster.map((c,i)=>{const own=quantity(save,c.id).regular+quantity(save,c.id).foil>0;return <motion.button key={c.id} className="casebook-resident" layout={reduced?false:'position'} onClick={()=>onInspect(c)} initial={reduced?false:{opacity:0,y:18}} animate={{opacity:1,y:0}} exit={{opacity:0}} whileHover={reduced?undefined:{y:-5}} transition={{duration:reduced?0:.3,delay:reduced?0:Math.min(i,5)*.04,ease:CITY_EASE}}><div><Portrait card={c}/><span className="casebook-number">#{c.number.toString().padStart(3,'0')}</span>{setOf(c)==='set-02'&&<span className="casebook-new">NEW BLOOD</span>}</div><section><small style={{color:rarityOf(c.rarity).color}}>{rarityOf(c.rarity).name} · {own?<><Check size={12}/> OWNED</>:'UNDISCOVERED'}</small><h3>{c.name}</h3><p>“{c.quote}”</p><span><Zap size={14}/>{c.ability}<ArrowUpRight size={16}/></span></section></motion.button>;})}</AnimatePresence></div>{!roster.length&&<div className="empty-state"><Search size={30}/><h3>NO RECEIPTS FOUND.</h3><button className="button paper" onClick={()=>{setQuery('');setEdition('');}}>CLEAR FILTERS</button></div>}<div className="casebook-cta"><div><span className="tape yellow">KNOW YOUR ENEMIES.</span><p>Collect the residents. Build a terrible squad. Make it everybody’s problem.</p></div><Link className="button magenta" href="/packs/">OPEN FREE PACKS <ArrowUpRight size={19}/></Link><Link className="button paper" href="/battle/">START A FIGHT <ArrowUpRight size={19}/></Link></div></section>
 </div>;
}
