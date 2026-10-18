'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useStarterGuide} from './starter-guide';
import {AnimatePresence,motion} from 'motion/react';
import {CSSProperties,useEffect,useState} from 'react';
import {Check,Layers,Skull,Sparkles,Ticket} from 'lucide-react';
import {Card,CARD_BY_ID,RARITIES,rarityOf} from '../data/cards';
import {Pull,Save} from '../domain/game';
import {playReveal,useGame} from '../state/store';
import {selectPullReaction} from '../domain/meme-presentation';
import {PackFilm} from './pack-film';
import {ResidentCard} from './card';
import {CityLogo,PackWrapper} from './brand';
import {CITY_EASE,useCityMotion} from './city-motion';


function PackCard({pull,index,revealed,next,busy,preview=false,collecting=false,delay=0,onReveal,onInspect}:{pull:Pull;index:number;revealed:boolean;next:boolean;busy:boolean;preview?:boolean;collecting?:boolean;delay?:number;onReveal:()=>void;onInspect:(card:Card)=>void}){
 const reduced=useCityMotion(),card=CARD_BY_ID[pull.cardId],rarity=rarityOf(card.rarity),rare=!preview&&['uncancelable','public-enemy'].includes(card.rarity);
 return <div className={`reveal-slot slot-${index} ${revealed?'revealed':''} ${rare&&revealed?'rare-pull':''}`} style={{'--rarity':rarity.color} as CSSProperties}>
  <motion.div className="pack-card-arrival" initial={reduced?false:{opacity:0,y:110,scale:.76}} animate={collecting&&!reduced?{opacity:0,x:90-index*24,y:-240,scale:.12,rotate:12+index*8}:{opacity:1,x:0,y:0,scale:1,rotate:0}} transition={{duration:reduced?0:collecting?.5:.65,delay:reduced?0:collecting?index*.06:index*.075,ease:CITY_EASE}}>
   <motion.div className={`flip-surface ${revealed?'is-face-up':'is-face-down'}`} data-reduced={reduced} initial={false} animate={{rotateY:reduced?0:revealed?0:180}} transition={{duration:reduced?0:.72,delay:reduced?0:delay,ease:CITY_EASE}}>
    <div className="pack-card-front" aria-hidden={!revealed}><ResidentCard card={card} onClick={revealed&&!collecting?()=>onInspect(card):undefined}/></div>
    {!preview&&<button className={`pack-card-back card-back ${next?'next':''}`} aria-hidden={revealed} tabIndex={revealed?-1:0} disabled={busy||revealed||!next||collecting} onClick={onReveal} aria-label={`Reveal resident ${index+1}`}><span className="back-number">0{index+1}</span><CityLogo small priority={false}/><Skull className="back-skull" size={32}/><span>{next?'CLICK TO REVEAL':'WAIT YOUR TURN'}</span></button>}
   </motion.div>
   {!preview&&revealed&&<motion.span className={`pull-badge ${pull.isNewDiscovery?'new':'dupe'}`} initial={reduced?false:{opacity:0,scale:1.5,rotate:-12}} animate={{opacity:1,scale:1,rotate:-3}} transition={{delay:reduced?0:.48+delay,duration:reduced?0:.25,ease:CITY_EASE}}>{pull.isNewDiscovery?'✦ NEW RESIDENT':`DUPLICATE ×${pull.regularQuantityAfter}`}</motion.span>}
   {rare&&revealed&&!collecting&&<div className="rarity-impact" aria-hidden="true" style={{'--impact-delay':`${delay+.35}s`} as CSSProperties}><span className="rarity-ring"/>{Array.from({length:8},(_,i)=><i key={i} style={{'--angle':`${i*45}deg`,'--delay':`${delay+.35}s`} as CSSProperties}/>)}<b style={{animationDelay:`${delay+.4}s`}}>{rarity.name.toUpperCase()}!</b></div>}
  </motion.div>
 </div>;
}

export function Packs({onInspect,onOdds}:{onInspect:(card:Card)=>void;onOdds:()=>void}){
 const {save,run,enter,busy,error,hydrated}=useGame(),reduced=useCityMotion();
 const [presentation,setPresentation]=useState<'ready'|'tear'|'collect'>('ready'),[collected,setCollected]=useState<Save['pendingOpening']>(null),[cascade,setCascade]=useState(false),[cascadeFrom,setCascadeFrom]=useState(0),[spotlight,setSpotlight]=useState<Pull|null>(null);
 const router=useRouter(),{guided,journey}=useStarterGuide();
 const session=save?.pendingOpening||collected,tearing=presentation==='tear',collecting=presentation==='collect';
 useEffect(()=>{
  if(presentation!=='collect')return;
  const timer=setTimeout(()=>{setPresentation('ready');setCollected(null);},reduced?0:850);
  return()=>clearTimeout(timer);
 },[presentation,reduced]);
 const open=async()=>{
  if(presentation!=='ready'||busy)return;
  if(!save&&!await enter())return;
  if(await run({type:'open',sessionId:crypto.randomUUID()})){
   setCascade(false);if(!reduced)setPresentation('tear');
   const preferences=useGame.getState().save?.settings;if(preferences?.soundEnabled)playReveal(0,preferences.volume);
  }
 };
 const reveal=async(all=false)=>{
  if(!session||busy||collecting||tearing||spotlight)return;
  setCascade(all);setCascadeFrom(session.revealedCount);
  if(await run({type:'reveal',count:all?5:session.revealedCount+1})){
   const shown=all?session.pulls.slice(session.revealedCount):[session.pulls[session.revealedCount]],headline=selectPullReaction(shown);if(!reduced&&headline)setSpotlight(headline);
   const preferences=useGame.getState().save?.settings;
   if(preferences?.soundEnabled){const pulls=all?session.pulls.slice(session.revealedCount):[session.pulls[session.revealedCount]];const rank=Math.max(...pulls.map(p=>RARITIES.findIndex(r=>r.id===CARD_BY_ID[p.cardId].rarity)));playReveal(rank,preferences.volume);}
  }
 };
 const collect=async()=>{
  if(!session||busy||collecting||spotlight)return;
  const snapshot=session;
  if(await run({type:'acknowledge'})){if(guided){router.push('/battle/?intro=1');return;}if(!reduced){setCollected(snapshot);setPresentation('collect');}}
 };
 const canOpen=hydrated&&!busy&&!error&&(!save||save.packBalance>0)&&presentation==='ready';
 const previews=['CC059','CC063','CC056','CC054','CC066'].map((id,slot):Pull=>({cardId:id,slot,isNewDiscovery:false,regularQuantityAfter:0}));
 if(guided&&journey.step>1&&!session)return <section className="starter-pack-handoff"><span className="tape yellow">YOUR PROGRESS IS SAVED</span><h2>{journey.title}</h2><p>{journey.description}</p><Link href={journey.href} className="button magenta">{journey.action}</Link><button className="text-link" disabled={!canOpen} onClick={()=>void open()}>Open another pack instead{save&&save.packBalance<1?' — no packs left':''}</button><small>Opening another pack uses 1 pack. Your current characters stay in your collection.</small></section>;
 return <section className={`opening-stage ${session?'in-session':'is-idle'} ${tearing?'is-tearing':''} ${collecting?'is-collecting':''}`}>
  <span className="tape yellow stage-label">{guided?(collecting?'CHARACTERS SAVED':session?'REVEAL YOUR FIVE CHARACTERS':'OPEN YOUR FIRST FREE PACK'):collecting?'NEW BRAINROT ACQUIRED':session?'YOUR NEXT BAD COMPANY':'OPEN. REVEAL. COPE.'}</span>
  <div className="pack-burst" aria-hidden="true"/><div className="foil-shards" aria-hidden="true"><i/><i/><i/><i/></div>
  <AnimatePresence mode="wait" initial={false}>
   {tearing?<motion.div className="opening-scene" key="tear" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.12}}><PackFilm onComplete={()=>setPresentation('ready')}/></motion.div>:
   <motion.div className="opening-scene" key={session?.id||'sealed'} initial={reduced?false:{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?0:.16}}>
    <div className={`fan-pulls ${!session?'preview-fan':''}`}>{(session?.pulls||previews).map((pull,i)=><PackCard key={`${session?.id||'preview'}-${i}`} pull={pull} index={i} revealed={!session||i<session.revealedCount} next={!!session&&i===session.revealedCount} busy={busy||!!spotlight} preview={!session} collecting={collecting} delay={cascade?Math.max(0,i-cascadeFrom)*.085:0} onReveal={()=>void reveal()} onInspect={onInspect}/>)}</div>
    {!session&&<div className="stage-wrapper">{guided?<div className="starter-sealed-pack" aria-hidden="true"><PackWrapper/></div>:<button className="sealed-pack-button" disabled={!canOpen} onClick={()=>void open()} aria-label="Tear open a free pack of five residents"><span className="pack-orbit" aria-hidden="true"/><span className="sealed-pack-float"><PackWrapper/></span><span className="pack-rip-tag tape pink">RIP IT OPEN <Sparkles size={18}/></span></button>}</div>}
   </motion.div>}
  </AnimatePresence>
  {spotlight&&<div className="pull-cinema-overlay" role="status"><PackFilm pull={spotlight} onComplete={()=>setSpotlight(null)}/></div>}
  <div className="reveal-actions">
   {!session?<><button className="pack-purchase" disabled={!canOpen} onClick={()=>void open()}><span className="mini-booster"><Skull/></span><span><b>{busy?'SAVING…':save&&save.packBalance<1?'NO PACKS LEFT':guided?'OPEN YOUR FIRST PACK':'OPEN A PACK'}</b><small>{guided?'Get five characters. Keep all five.':'5 random residents · free to play'}</small><span className="pack-price"><Ticket size={21}/>{save?'1 PACK':'3 WELCOME PACKS'}</span></span></button><button className="pack-rules" onClick={onOdds}><span>GACHA BRAIN.<br/>ZERO CELLS.</span><small>VIEW DROP RATES →</small></button></>:
   tearing?<span className="opening-progress"><i/>THE DEVS ARE COOKING. IT IS PROBABLY SLOP.</span>:
   collecting?<motion.div className="collection-receipt" initial={reduced?false:{opacity:0,y:12,scale:.9}} animate={{opacity:1,y:0,scale:1}}><Layers size={24}/><span>BRAINROT ADDED TO COLLECTION.</span><Check size={24}/></motion.div>:
   session.revealedCount<5?<><button className="button magenta large" disabled={busy||!!spotlight} onClick={()=>void reveal(guided)}>{guided?'REVEAL ALL FIVE':`REVEAL ${session.revealedCount+1} / 5`} <Sparkles size={22}/></button><button className={guided?'text-link':'button paper'} disabled={busy||!!spotlight} onClick={()=>void reveal(!guided)}>{guided?'ONE AT A TIME':'REVEAL ALL'}</button></>:
   <><motion.div className="pack-summary" initial={reduced?false:{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:reduced?0:.6,duration:.3}}><span><b>{session.pulls.filter(p=>p.isNewDiscovery).length}</b> NEW</span><span><b>+{session.xpEarned}</b> XP</span>{session.unlockedAchievementIds.length>0&&<span><b>+{session.unlockedAchievementIds.reduce((n,id)=>n+(['complete-city','complete-wave-two','complete-culture','complete-infamy','complete-anime'].includes(id)?3:1),0)}</b> PACKS</span>}</motion.div><button className="button magenta large" disabled={busy||!!spotlight} onClick={()=>void collect()}>{guided?'SAVE & CHOOSE YOUR SQUAD':'COLLECT ALL'} <Check size={20}/></button></>}
  </div>
  {!session?<p className="stage-caption">{guided?'Open one pack to begin. Next, you’ll choose three characters for your first battle.':'Possible pulls shown. Every pack has five independent draws. Claim daily packs or finish city jobs for more.'}</p>:<div className="sr-only" aria-live="polite">{session.revealedCount>0?`${CARD_BY_ID[session.pulls[session.revealedCount-1].cardId].name}, ${rarityOf(CARD_BY_ID[session.pulls[session.revealedCount-1].cardId].rarity).name}, revealed.`:'Pack saved. Reveal your five residents.'}</div>}
 </section>;
}
