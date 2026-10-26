'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
import {BookOpen,HelpCircle,Menu,Share2,Ticket} from 'lucide-react';
import {CityLogo} from './brand';
import {useGame} from '../state/store';
import {PRIMARY_DESTINATIONS,navigationGroup} from '../domain/navigation';
import {useStarterGuide} from './starter-guide';

const MENU_GROUPS=[
 {label:'PLAY',links:[['Battles','/battle/?crew=1'],['Roast Night','/roast/'],['Stories & objectives','/missions/'],['Learn Battle','/battle/?learn=1']]},
 {label:'COLLECTION',links:[['Open packs','/packs/'],['Market · recycle & craft','/market/'],['Props','/stash/']]},
 {label:'YOUR GAME',links:[['Profile & rankings','/profile/'],['Settings & save','/settings/'],['City archive','/lore/'],['Special animations','/cinema/specials/'],['Data notice','/privacy/']]},
];

export function ComicHeader({focus}:{focus?:'lesson'|'battle'}){
 const path=usePathname(),group=navigationGroup(path),save=useGame(s=>s.save),hydrated=useGame(s=>s.hydrated),{guided,restore,hide}=useStarterGuide();
 const balance=hydrated?save?.packBalance??3:null;
 const closeMenu=(event:React.MouseEvent<HTMLElement>)=>{if((event.target as HTMLElement).closest('a,button'))event.currentTarget.closest('details')?.removeAttribute('open');};
 return <header className={`comic-header focused-header ${focus?`focused-header-${focus}`:''}`}>
  <Link className="comic-brand" href="/" aria-label="Cancel City — Play"><CityLogo small/></Link>
  <nav className="focused-main-nav" aria-label="Main navigation">{PRIMARY_DESTINATIONS.map(link=><Link key={link.id} href={link.href} className={group===link.id?'active':''} aria-current={group===link.id?'page':undefined}>{link.label}</Link>)}</nav>
  <div className="focused-header-tools">
   {group==='collection'&&!focus&&<Link className="focused-ticket-balance" href="/packs/" aria-label={`${balance??'Loading'} tickets. One ticket opens five fighter cards.`}><Ticket size={17}/><b>{balance??'…'}</b></Link>}
   <details className="comic-more focused-menu" onKeyDown={event=>{if(event.key==='Escape'){event.currentTarget.removeAttribute('open');event.currentTarget.querySelector('summary')?.focus();}}}>
    <summary aria-label="Game menu"><Menu size={18}/><span>MENU</span></summary>
    <nav aria-label="Game menu destinations" onClick={closeMenu}>
     {MENU_GROUPS.map(section=><section key={section.label}><b>{section.label}</b>{section.links.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</section>)}
     <section><b>HELP</b><button type="button" onClick={()=>window.dispatchEvent(new Event('cancel-city.open-help'))}><HelpCircle size={16}/>How to play</button><button type="button" onClick={guided?hide:restore}><BookOpen size={16}/>{guided?'Hide first-session guide':'Show first-session guide'}</button></section>
    </nav>
   </details>
  </div>
 </header>;
}

export function ComicTicker(){
 const [copied,setCopied]=useState(false),path=usePathname();
 if(path.startsWith('/battle'))return null;
 return <footer className="comic-ticker"><b>NEWS</b><span><i/> AIRFRYER GATE: the receipts are in.</span><span className="ticker-secondary">Everyone is the problem. <em>·</em> Three free tickets every UTC day.</span><Link href="/city/">YOUR CITY ↗</Link><button onClick={async()=>{try{await navigator.clipboard.writeText(window.location.origin);setCopied(true);}catch{setCopied(false);}}}><Share2 size={16}/>{copied?'LINK COPIED':'SPREAD THE PROBLEM'}</button></footer>;
}
