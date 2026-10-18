'use client';
import Image from 'next/image';
import {CSSProperties,PointerEvent} from 'react';
import {motion,useMotionValue,useSpring} from 'motion/react';
import {Skull} from 'lucide-react';
import {Card,rarityOf,setOf,SETS} from '../data/cards';
import {useGame} from '../state/store';
import {INTERNET_PROFILES} from '../data/internet';
import {portraitSourceSet} from '../data/portrait-delivery';
import {useCityMotion} from './city-motion';
export function Portrait({card,large=false,priority=false}:{card:Card;large?:boolean;priority?:boolean}){
 const sizes=large?'(max-width:700px) 95vw, 430px':'(max-width:700px) 36vw, (max-width:1300px) 24vw, 300px';
 return <span role="img" aria-label={`Illustrated portrait of ${card.name}`} className="reference-portrait"><picture><source srcSet={portraitSourceSet(card)} sizes={sizes}/><Image className="resident-portrait-image" src={card.art} width={896} height={896} alt="" loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'}/></picture></span>;
}
export function ResidentCard({card,foil=false,locked=false,copies,onClick,compact=false}:{card:Card;foil?:boolean;locked?:boolean;copies?:number;onClick?:()=>void;compact?:boolean}){
 const mastery=useGame(s=>s.save?.career.mastery[card.id]||0);
 const reduced=useCityMotion(),tiltX=useMotionValue(0),tiltY=useMotionValue(0),lightX=useMotionValue('50%'),lightY=useMotionValue('50%');
 const rotateX=useSpring(tiltX,{stiffness:340,damping:28}),rotateY=useSpring(tiltY,{stiffness:340,damping:28});
 const pointer=(e:PointerEvent<HTMLElement>)=>{if(reduced||e.pointerType!=='mouse')return;const rect=e.currentTarget.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;tiltX.set((.5-y)*9);tiltY.set((x-.5)*12);lightX.set(`${x*100}%`);lightY.set(`${y*100}%`);};
 const reset=()=>{tiltX.set(0);tiltY.set(0);};
 const r=rarityOf(card.rarity),power=Math.max(1,Math.round(card.stats.clout/10));
 const tags=INTERNET_PROFILES[card.id]?.tags.slice(0,2)||card.ability.split(/[\s—:]+/).filter(Boolean).slice(0,3);
 const content=<><div className="resident-title"><Skull size={19}/><h3>{card.name}</h3></div><div className="card-portrait"><Portrait card={card}/><span className="power-token">{power}</span><span className="rarity-gem" style={{color:r.color}} aria-label={r.name}>◆</span>{setOf(card)!=='set-01'&&<span className="resident-set-stamp">{SETS.find(s=>s.id===setOf(card))?.name.toUpperCase()}</span>}{mastery>=3&&!locked&&<span className="mastery-stamp">{mastery>=10?'HEADLINE LEGEND':'LOCAL MENACE'}</span>}{foil&&<span className="foil-stamp">FOIL ✦</span>}</div>{!compact&&<div className="card-paper"><p className="card-quote">“{card.quote}”</p><div className="trait-tags">{tags.map((t,i)=><span key={i}>{t}</span>)}</div></div>}{copies!==undefined&&<span className={`copies-badge ${locked?'missing':''}`}>{copies>0?`×${copies}`:'MISSING'}</span>}<motion.span className="card-sheen" aria-hidden="true" style={{'--light-x':lightX,'--light-y':lightY} as CSSProperties}/></>;
 const props={className:`resident-card ${!locked&&mastery>=10?'mastery-gold':!locked&&mastery>=3?'mastery-ink':''} ${foil?'foil':''} ${locked?'locked':''} ${compact?'compact':''}`,style:{'--rarity':r.color,rotateX:reduced?0:rotateX,rotateY:reduced?0:rotateY,transformPerspective:900},onPointerMove:pointer,onPointerLeave:reset,whileHover:reduced?undefined:{y:-5,scale:1.025},whileTap:reduced?undefined:{scale:.98},transition:{type:'spring' as const,stiffness:340,damping:28}};
 return onClick?<motion.button {...props} onClick={onClick} aria-label={`Inspect ${card.name}, ${r.name}${foil?', foil edition':''}${locked?', not yet owned':''}${copies!==undefined?`, ${copies} owned`:''}`}>{content}</motion.button>:<motion.div {...props}>{content}</motion.div>;
}
