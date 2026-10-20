'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
import {Crown,Settings,Skull,Ticket,Trash2,Share2} from 'lucide-react';
import {CityLogo} from './brand';
import {useGame} from '../state/store';

export function ComicHeader(){
 const path=usePathname(),save=useGame(s=>s.save),xp=save?.totalXp||0;
 const links=[['HOME','/'],['CARDS','/collection/'],['MARKET','/market/'],['BATTLE','/battle/'],['EVENTS','/missions/'],['LEADERBOARD','/leaderboard/'],['LORE','/lore/']];
 return <header className="comic-header"><Link className={`comic-brand ${path==='/'?'mascot':''}`} href="/" aria-label="Cancel City home">{path==='/'?<><Crown/><Skull/></>:<CityLogo small/>}</Link><nav aria-label="Main navigation">{links.map(([label,href])=><Link key={href} href={href} className={(path.replace(/\/$/,'')===href.replace(/\/$/,'')||href==='/'&&path==='/packs/')?'active':''} aria-current={path.replace(/\/$/,'')===href.replace(/\/$/,'')?'page':undefined}>{label}</Link>)}</nav><div className="comic-wallet"><Link href="/market/" className="comic-currency" title="Trash is your saved crafting scrap"><Trash2/><span>TRASH<b>{(save?.career.scrap||0).toLocaleString('en-US')}</b></span><i>+</i></Link><Link href="/packs/" className="comic-currency tickets" title="One ticket opens one free pack"><Ticket/><span>TICKETS<b>{save?.packBalance??3}</b></span><i>+</i></Link><Link href="/settings/" className="comic-profile"><Skull/><span><b>{save?.alias||'NewProblem'}</b><small>Level {Math.floor(xp/1000)+1}</small><i><em style={{width:`${xp%1000/10}%`}}/></i></span></Link><Link className="comic-settings" href="/settings/" aria-label="Settings"><Settings/></Link></div></header>;
}

export function ComicTicker(){
 const [copied,setCopied]=useState(false);
 return <footer className="comic-ticker"><b>NEWS</b><span><i/> AIRFRYER GATE: the receipts are in.</span><span className="ticker-secondary">Everyone is the problem. <em>·</em> Three free packs every UTC day.</span><Link href="/city/">YOUR CITY ↗</Link><button onClick={async()=>{try{await navigator.clipboard.writeText(window.location.origin);setCopied(true);}catch{setCopied(false);}}}><Share2 size={16}/>{copied?'LINK COPIED':'SPREAD THE PROBLEM'}</button></footer>;
}
