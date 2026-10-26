'use client';
import Link from 'next/link';
import {CSSProperties,useEffect,useState} from 'react';
import {AnimatePresence,motion} from 'motion/react';
import {ArrowRight,ChevronLeft,ChevronRight,Crown,Layers,Library,Play,ShoppingCart,Skull,Swords} from 'lucide-react';
import {CARDS,CARD_BY_ID} from '../data/cards';
import {useGame} from '../state/store';
import {CityLogo} from './brand';
import {PrintedCard} from './printed-card';
import {ComicHeader,ComicTicker} from './comic-chrome';
import {CITY_EASE,useCityMotion} from './city-motion';
import {useStarterGuide} from './starter-guide';
import {nextObjective} from '../domain/next-objective';
import {HomeObjective} from './home-objective';

export function ReferenceHome(){
 const save=useGame(s=>s.save),[page,setPage]=useState(0),{progress:starterProgress,guided}=useStarterGuide(),reduced=useCityMotion();
 const [now,setNow]=useState(new Date('2000-01-01'));
 useEffect(()=>{const update=()=>setNow(new Date());update();const timer=setInterval(update,30000);return()=>clearInterval(timer);},[]);
 const objective=nextObjective(save,now,starterProgress);
 const featured=['CC021','CC026','CC002','CC015','CC030','CC023','CC063','CC064'];
 const discovered=save?.discoveredCardIds.length||0,progress=Math.round(discovered/CARDS.length*100);
 const actions=[{label:objective.shortAction,sub:objective.sub,href:objective.href,Icon:Play},{label:'OPEN PACKS',sub:`${save?.packBalance??3} TICKETS · 1 TICKET = 5 FIGHTERS`,href:'/packs/',Icon:Layers},{label:'COLLECTION',sub:'VIEW YOUR DEGENERATES',href:'/collection/',Icon:Library},{label:'MARKET',sub:'RECYCLE DUPLICATES. CRAFT CHARACTERS.',href:'/market/',Icon:ShoppingCart},{label:'BATTLE',sub:"PROVE WHO’S WORSE",href:'/battle/',Icon:Swords}];
 return <div className={`reference-page reference-home ${guided?'first-session-home':''}`} data-next-step={objective.kind}><ComicHeader/><main className="reference-home-main"><h1 className="sr-only">Cancel City — Everyone is the problem</h1><div className="home-title-art"><CityLogo/></div><HomeObjective objective={objective}/><nav className="reference-home-actions" aria-label="Play Cancel City">{actions.map(({label,sub,href,Icon},i)=><Link className={`reference-action ${i===0?'primary':''}`} style={{'--stagger-index':i} as CSSProperties} key={label} href={href} aria-label={i===0?`${objective.action}. ${objective.description}`:undefined}><Icon/><span><b>{label}</b><small>{sub}</small></span>{i===1&&!!save?.packBalance&&<em>{save.packBalance}</em>}</Link>)}</nav><section className="reference-featured"><header><h2 className="tape yellow">FEATURED CARDS</h2><button aria-label="Previous featured cards" onClick={()=>setPage(p=>p?0:1)}><ChevronLeft/></button><button aria-label="Next featured cards" onClick={()=>setPage(p=>p?0:1)}><ChevronRight/></button><Link href="/collection/">VIEW ALL <ArrowRight/></Link></header><div className="reference-featured-grid"><AnimatePresence mode="popLayout" initial={false}>{featured.slice(page*4,page*4+4).map((id,idx)=><motion.div key={id} initial={reduced?false:{opacity:0,y:14,scale:.95}} animate={{opacity:1,y:0,scale:1}} exit={reduced?{opacity:0}:{opacity:0,y:-10,scale:.96}} transition={{duration:reduced?0:.26,delay:reduced?0:idx*.035,ease:CITY_EASE}}><Link href={`/collection/?card=${id}`} className="featured-card-link"><PrintedCard card={CARD_BY_ID[id]} priority/></Link></motion.div>)}</AnimatePresence></div></section><div className="reference-home-bottom"><Link href="/collection/" className="home-scandal"><div><b className="tape yellow">SCANDAL METER</b><small>Your collection’s notoriety.</small></div><div className="home-scandal-progress"><div><i style={{width:`${progress}%`}}/></div><span>NOBODY CARES</span><span>KIND OF A BIG DEAL</span><span>TRENDING</span><span>CANCEL CITY <Skull size={15}/></span></div></Link><Link href="/city/" className="home-city-bonus"><Crown/><span>YOUR BLOCK<b>{save?.city?'RETURN TO THE CITY':'FOUND YOUR CITY'}</b></span></Link></div></main><ComicTicker/></div>;
}
