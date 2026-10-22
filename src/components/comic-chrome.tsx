'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
import {Crown,Settings,Skull,Ticket,Trash2,Share2,ChevronDown,BookOpen,Film,Trophy,Mic2,HelpCircle} from 'lucide-react';
import {CityLogo} from './brand';
import {useGame} from '../state/store';
import {levelProgress} from '../domain/progression';
import {useStarterGuide} from './starter-guide';

export function ComicHeader(){
 const path=usePathname(),save=useGame(s=>s.save),hydrated=useGame(s=>s.hydrated),xp=save?.totalXp||0,level=levelProgress(xp),{guided,restore,hide}=useStarterGuide();
 const links=[['HOME','/'],['CITY','/city/'],['COLLECTION','/collection/'],['PACKS','/packs/'],['BATTLE','/battle/'],['MARKET','/market/'],['JOBS','/missions/']];
 const active=(href:string)=>href==='/collection/'?path.startsWith('/collection')||path.startsWith('/stash'):path.replace(/\/$/,'')===href.replace(/\/$/,'');
 return <header className="comic-header"><Link className="comic-brand" href="/" aria-label="Cancel City home"><CityLogo small/></Link><nav aria-label="Main navigation">{links.map(([label,href])=><Link key={href} href={href} className={active(href)?'active':''} aria-current={active(href)?'page':undefined}>{label}</Link>)}<details className="comic-more"><summary className={['/lore','/cinema','/roast'].some(p=>path.startsWith(p))?'active':''}>MORE <ChevronDown size={13}/></summary><nav aria-label="More destinations" onClick={e=>e.currentTarget.closest('details')?.removeAttribute('open')}><Link href="/lore/"><BookOpen size={18}/>LORE / CITY ARCHIVE</Link><Link href="/cinema/specials/"><Film size={18}/>GALLERY / SPECIAL ATTACKS</Link><Link href="/roast/"><Mic2 size={18}/>ROAST NIGHT</Link><Link href="/leaderboard/"><Trophy size={18}/>RANKINGS</Link><Link href="/profile/"><Skull size={18}/>PROFILE / YOUR RECORD</Link><Link href="/settings/"><Settings size={18}/>SETTINGS & SAVE</Link><Link href="/battle/?learn=1"><HelpCircle size={18}/>LEARN BATTLE</Link><button type="button" onClick={()=>window.dispatchEvent(new Event('cancel-city.open-help'))}><HelpCircle size={18}/>HOW TO PLAY</button><button type="button" onClick={guided?hide:restore}><BookOpen size={18}/>{guided?'HIDE FIRST-SESSION GUIDE':'SHOW FIRST-SESSION GUIDE'}</button><Link href="/privacy/"><HelpCircle size={18}/>DATA NOTICE</Link></nav></details></nav><div className="comic-wallet"><Link href="/market/" className="comic-currency" title="Trash is your saved crafting scrap"><Trash2/><span>TRASH<b>{(save?.career.scrap||0).toLocaleString('en-US')}</b></span><i>+</i></Link><Link href="/packs/" className="comic-currency tickets" title="One ticket opens one free pack"><Ticket/><span>TICKETS<b>{hydrated?save?.packBalance??3:'…'}</b></span><i>+</i></Link><Link href="/profile/" className={`comic-profile ${path==='/profile/'?'active':''}`}><Skull/><span><b>{save?.alias||'NewProblem'}</b><small>Level {level.level}</small><i><em style={{width:`${level.percent}%`}}/></i></span></Link><Link className="comic-settings" href="/settings/" aria-label="Settings"><Settings/></Link></div></header>;
}

export function ComicTicker(){
 const [copied,setCopied]=useState(false);
 return <footer className="comic-ticker"><b>NEWS</b><span><i/> AIRFRYER GATE: the receipts are in.</span><span className="ticker-secondary">Everyone is the problem. <em>·</em> Three free packs every UTC day.</span><Link href="/city/">YOUR CITY ↗</Link><button onClick={async()=>{try{await navigator.clipboard.writeText(window.location.origin);setCopied(true);}catch{setCopied(false);}}}><Share2 size={16}/>{copied?'LINK COPIED':'SPREAD THE PROBLEM'}</button></footer>;
}
