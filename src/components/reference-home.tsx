'use client';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowRight,ChevronLeft,ChevronRight,Crown,Layers,Library,Play,ShoppingCart,Skull,Swords} from 'lucide-react';
import {CARDS,CARD_BY_ID} from '../data/cards';
import {useGame} from '../state/store';
import {CityLogo} from './brand';
import {PrintedCard} from './printed-card';
import {ComicHeader,ComicTicker} from './comic-chrome';
import {useStarterGuide} from './starter-guide';

export function ReferenceHome(){
 const save=useGame(s=>s.save),[page,setPage]=useState(0),{journey,guided}=useStarterGuide();
 const featured=['CC021','CC026','CC002','CC015','CC030','CC023','CC063','CC064'];
 const discovered=save?.discoveredCardIds.length||0,progress=Math.round(discovered/CARDS.length*100);
 const actions=[{label:journey.action,sub:journey.title,href:journey.href,Icon:Play},{label:'OPEN PACKS',sub:`${save?.packBalance??3} PACKS READY TO OPEN`,href:'/packs/',Icon:Layers},{label:'COLLECTION',sub:'VIEW YOUR DEGENERATES',href:'/collection/',Icon:Library},{label:'MARKET',sub:'RECYCLE DUPLICATES. CRAFT CHARACTERS.',href:'/market/',Icon:ShoppingCart},{label:'BATTLE',sub:"PROVE WHO’S WORSE",href:'/battle/',Icon:Swords}];
 return <div className={`reference-page reference-home ${guided?'first-session-home':''}`} data-next-step={journey.stage}><ComicHeader/><main className="reference-home-main"><h1 className="sr-only">Cancel City — Everyone is the problem</h1><div className="home-title-art"><CityLogo/></div><nav className="reference-home-actions" aria-label="Play Cancel City">{actions.map(({label,sub,href,Icon},i)=><Link className={`reference-action ${i===0?'primary':''}`} key={label} href={href}><Icon/><span><b>{label}</b><small>{sub}</small>{i===0&&<em className="home-next-description">{journey.description}</em>}</span>{i===1&&!!save?.packBalance&&<em>{save.packBalance}</em>}</Link>)}</nav><section className="reference-featured"><header><h2 className="tape yellow">FEATURED CARDS</h2><button aria-label="Previous featured cards" onClick={()=>setPage(p=>p?0:1)}><ChevronLeft/></button><button aria-label="Next featured cards" onClick={()=>setPage(p=>p?0:1)}><ChevronRight/></button><Link href="/collection/">VIEW ALL <ArrowRight/></Link></header><div className="reference-featured-grid">{featured.slice(page*4,page*4+4).map(id=><Link key={id} href={`/collection/?card=${id}`}><PrintedCard card={CARD_BY_ID[id]} priority/></Link>)}</div></section><Link className="reference-event" href="/city/"><div><span className="tape pink">NEIGHBOURHOOD EVENT</span><h2>AIRFRYER GATE</h2><p>ONE SCANDAL. THREE BAD DECISIONS.</p></div><span className="event-status">{save?.airfryer.phase==='resolved'?'CASE CLOSED':'CASE 001'}<b>{save?.airfryer.phase==='resolved'?'VIEW YOUR VERDICT':'FOLLOW THE SMOKE →'}</b></span><img src={CARD_BY_ID.CC135.art} alt="Daenerys Airfryer"/><strong>EVERYONE<br/>HAS<br/>RECEIPTS.</strong></Link><div className="reference-home-bottom"><Link href="/collection/" className="home-scandal"><div><b className="tape yellow">SCANDAL METER</b><small>Your collection’s notoriety.</small></div><div className="home-scandal-progress"><div><i style={{width:`${progress}%`}}/></div><span>NOBODY CARES</span><span>KIND OF A BIG DEAL</span><span>TRENDING</span><span>CANCEL CITY <Skull size={15}/></span></div></Link><Link href="/city/" className="home-city-bonus"><Crown/><span>YOUR BLOCK<b>{save?.city?'RETURN TO THE CITY':'FOUND YOUR CITY'}</b></span></Link></div></main><ComicTicker/></div>;
}
