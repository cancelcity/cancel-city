'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {ArrowRight,ChevronLeft,ChevronRight,Mic2,Swords,Map} from 'lucide-react';
import {CARD_BY_ID} from '../data/cards';
import {useGame} from '../state/store';
import {PrintedCard} from './printed-card';
import {ComicHeader,ComicTicker} from './comic-chrome';
import {useStarterGuide} from './starter-guide';
import {nextObjective} from '../domain/next-objective';
import {HomeObjective} from './home-objective';

const ACTIVITIES=[
 {title:'BATTLES',href:'/battle/?crew=1',Icon:Swords,description:'Three fighters and a ready tactics deck. Plan your turn and defeat the opposing crew.'},
 {title:'ROAST NIGHT',href:'/roast/',Icon:Mic2,description:'Choose your replies, read their intentions and break three egos on stage.'},
 {title:'CITY STORIES',href:'/city/',Icon:Map,description:'Visit the neighbourhoods, meet residents and investigate their stories.'},
];
export function ReferenceHome(){
 const save=useGame(s=>s.save),[page,setPage]=useState(0),{progress,guided}=useStarterGuide();
 const [now,setNow]=useState(new Date('2000-01-01'));
 useEffect(()=>{const update=()=>setNow(new Date());update();const timer=setInterval(update,30000);return()=>clearInterval(timer);},[]);
 const objective=nextObjective(save,now,progress),featured=['CC021','CC026','CC002','CC015','CC030','CC023','CC063','CC064'];
 return <div className={`reference-page reference-home play-hub ${guided?'first-session-home':''}`} data-next-step={objective.kind}>
  <ComicHeader/>
  <main className="reference-home-main play-hub-main">
   <header className="play-hub-heading"><span>CANCEL CITY</span><h1>PLAY</h1><p>{guided?'Start here. Your next step is ready.':'Pick up where you left off.'}</p></header>
   <HomeObjective objective={objective}/>
   <details className="play-hub-activities"><summary>OTHER WAYS TO PLAY <ArrowRight size={17}/></summary><div>{ACTIVITIES.map(({title,href,Icon,description})=><Link href={href} key={href}><Icon size={25}/><span><b>{title}</b><p>{description}</p></span><ArrowRight size={18}/></Link>)}</div></details>
   <nav className="play-hub-collection-links" aria-label="Collection tools"><Link href="/packs/">OPEN PACKS <small>{save?.packBalance??3} tickets available</small></Link><Link href="/collection/">MY FIGHTERS</Link><Link href="/market/">RECYCLE & CRAFT</Link></nav>
   <details className="play-hub-catalogue"><summary>BROWSE CHARACTERS <ArrowRight size={17}/></summary><section className="reference-featured"><header><h2>FEATURED CHARACTERS</h2><button aria-label="Previous featured cards" onClick={()=>setPage(p=>p?0:1)}><ChevronLeft/></button><button aria-label="Next featured cards" onClick={()=>setPage(p=>p?0:1)}><ChevronRight/></button><Link href="/collection/">VIEW ALL <ArrowRight/></Link></header><div className="reference-featured-grid">{featured.slice(page*4,page*4+4).map(id=><Link href={`/collection/?card=${id}`} key={id} className="featured-card-link"><PrintedCard card={CARD_BY_ID[id]}/></Link>)}</div></section></details>
  </main>
  <ComicTicker/>
 </div>;
}
