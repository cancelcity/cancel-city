'use client';
import Image from 'next/image';
import {useEffect,useRef,useState} from 'react';
import {Crown,Sparkles} from 'lucide-react';
import {Card} from '../data/cards';
import {useGame} from '../state/store';
import {actorPoseSrc,hasActingPoses} from './live-scene-painter';
import {useCityMotion} from './city-motion';
export function MasteryShowcase({card}:{card:Card}){const wins=useGame(s=>s.save?.career.mastery[card.id]||0),reduced=useCityMotion(),[beat,setBeat]=useState(0),ref=useRef<HTMLDivElement>(null);useEffect(()=>{if(wins<3||reduced)return;let visible=false;const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);});if(ref.current)observer.observe(ref.current);const timer=setInterval(()=>{if(visible&&!document.hidden)setBeat(n=>(n+1)%10);},650);return()=>{observer.disconnect();clearInterval(timer);};},[wins,reduced,card.id]);if(wins<3)return <p className="mastery-locked">{wins} / 3 scored wins · unlock the victory poster. 10 wins unlock the gold headline frame.</p>;const pose=reduced?3:beat<5?0:beat<8?3:5;return <div ref={ref} className={`mastery-showcase ${wins>=10?'legend':''}`} data-still={reduced}><span>{wins>=10?<Crown size={16}/>:<Sparkles size={16}/>} {wins>=10?'HEADLINE LEGEND':'LOCAL MENACE'} · {wins} WINS</span><div className="mastery-actor"><Image key={pose} src={actorPoseSrc(card.id,hasActingPoses(card.id)?pose:0)} width={640} height={640} alt={`${card.name} in an unlocked victory poster`}/></div><b>{wins>=10?'YOUR DOWNFALL HAS A FANBASE.':'CERTIFIED BAD COMPANY.'}</b><small>COSMETIC MASTERY REWARD · SAME COMBAT STATS</small></div>;}
