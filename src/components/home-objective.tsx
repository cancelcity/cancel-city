import Link from 'next/link';
import {ArrowRight,Check,Ticket} from 'lucide-react';
import {CARD_BY_ID} from '../data/cards';
import type {NextObjective} from '../domain/next-objective';

export function HomeObjective({objective}:{objective:NextObjective}){
 const progress=objective.progress;
 return <section className="home-objective" aria-labelledby="next-objective-title" data-objective={objective.kind}>
  <div className="home-objective-art" aria-hidden="true"><img src={CARD_BY_ID[objective.portraitId].art} alt=""/></div>
  <div className="home-objective-copy"><span className="home-objective-label">{objective.eyebrow}</span><h2 id="next-objective-title">{objective.title}</h2><p>{objective.description}</p><div className="home-objective-benefit">{objective.kind.includes('claim')?<Check size={15}/>:<Ticket size={15}/>}<span>{objective.benefit}</span></div></div>
  <div className="home-objective-action">{progress&&<div className="home-objective-progress"><span>{progress.label}<b>{progress.value} / {progress.total}</b></span><progress value={progress.value} max={progress.total}/></div>}<Link href={objective.href}>{objective.action}<ArrowRight size={19}/></Link></div>
 </section>;
}
