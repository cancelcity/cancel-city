'use client';
import {useState} from 'react';
import {AnimatePresence,motion} from 'motion/react';
import {Search} from 'lucide-react';
import {Card,CARDS,rarityOf} from '../data/cards';
import {internetSearch} from '../data/internet';
import {EXCHANGE,quantity} from '../domain/game';
import {useGame} from '../state/store';
import {ResidentCard} from './card';
import {Dialog} from './dialog';
import {MemeDispatch} from './internet';
import {CITY_EASE,useCityMotion} from './city-motion';
export function MarketScreen({onInspect}:{onInspect:(card:Card)=>void}){
 const {save,run,busy,enter}=useGame(),[selection,setSelection]=useState<{card:Card;type:'craft'|'recycle'}|null>(null),[query,setQuery]=useState(''),reduced=useCityMotion();
 const exchange=async()=>{if(!selection)return;if(!save&&!await enter())return;if(await run({type:selection.type,cardId:selection.card.id}))setSelection(null);};
 const list=CARDS.filter(c=>internetSearch(c).includes(query.toLowerCase().trim()));
 return <div className="exchange-page">
  <span className="tape yellow">THE RUG-FREE PART OF RUG ALLEY</span><h1>ONE MAN’S TRASH.<br/><span>YOUR NEXT MAIN.</span></h1><p>Turn duplicate brainrot into scrap. Craft the resident you actually want. Your last copy and every foil stay yours.</p>
  <MemeDispatch context="market" onInspect={onInspect}/>
  <div className="exchange-wallet"><b>{save?.career.scrap||0} SCRAP</b><span>No money or trading. Craft costs exceed recycling returns. The copium is complimentary.</span></div>
  <label className="search-box"><Search size={18}/><input aria-label="Search market by resident or meme" placeholder="Find a resident… copium, grindset, NPC…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
  {list.length?<motion.div className="exchange-grid" layout={reduced?false:true}><AnimatePresence mode="popLayout">{list.map(card=>{const q=quantity(save,card.id),rate=EXCHANGE[card.rarity];return <motion.article layout={reduced?false:'position'} initial={reduced?false:{opacity:0,y:14}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:reduced?0:.22,ease:CITY_EASE}} key={card.id} className="exchange-resident"><ResidentCard card={card} compact onClick={()=>onInspect(card)}/><p>{rarityOf(card.rarity).name} · {q.regular} REGULAR · {q.foil} FOIL</p><button className="button acid small" disabled={busy||!save||(save.career.scrap<rate.craft)} onClick={()=>setSelection({card,type:'craft'})}>CRAFT · {rate.craft} SCRAP</button><button className="button paper small" disabled={busy||q.regular<1||q.regular+q.foil<2} onClick={()=>setSelection({card,type:'recycle'})}>RECYCLE · +{rate.recycle}</button></motion.article>;})}</AnimatePresence></motion.div>:<div className="market-empty"><h2>NO MATCHING BRAINROT.</h2><p>Try a resident name or a meme tag such as copium, doomscroll or subscription.</p><button className="button paper small" onClick={()=>setQuery('')}>CLEAR SEARCH</button></div>}
  <AnimatePresence>{selection&&<Dialog title={selection.type==='craft'?'ACQUIRE WORSE COMPANY.':'RECYCLE THE DUPLICATE?'} onClose={()=>setSelection(null)}><p>{selection.type==='craft'?`Spend ${EXCHANGE[selection.card.rarity].craft} scrap for one regular ${selection.card.name}.`:`Consume one regular ${selection.card.name} for ${EXCHANGE[selection.card.rarity].recycle} scrap. This cannot be undone.`}</p><button className="button magenta" disabled={busy} onClick={()=>void exchange()}>CONFIRM EXCHANGE</button></Dialog>}</AnimatePresence>
 </div>;
}
