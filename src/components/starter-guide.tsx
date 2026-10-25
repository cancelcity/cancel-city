'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {create} from 'zustand';
import {ArrowRight,Check,Layers,Swords} from 'lucide-react';
import {useGame} from '../state/store';
import {starterJourney,starterComplete} from '../domain/starter-journey';
import {Portrait} from './card';
import {CARD_BY_ID} from '../data/cards';

const KEY='cancel-city.beginner-guide.v1';
const usePreference=create<{hidden:boolean;loaded:boolean;load:()=>void;change:(hidden:boolean)=>void}>((set,get)=>({hidden:false,loaded:false,load:()=>{if(get().loaded)return;let hidden=false;try{hidden=localStorage.getItem(KEY)==='hidden';}catch{}set({hidden,loaded:true});},change:hidden=>{set({hidden});try{localStorage.setItem(KEY,hidden?'hidden':'shown');}catch{}}}));
function readPracticeProgress(){
 let learnedBattle=false,practiceComplete=false;
 try{const raw=localStorage.getItem('cancel-city.guided-duel.v1');if(raw){const value=JSON.parse(raw);learnedBattle=value?.lesson==='done'&&value?.match?.mode==='practice'&&value?.match?.rulesVersion===5;}}catch{}
 try{const raw=localStorage.getItem('cancel-city.practice-duel.v1');if(raw){const value=JSON.parse(raw);practiceComplete=value?.phase==='finished'&&value?.mode==='practice'&&value?.rulesVersion===5;}}catch{}
 return {learnedBattle,practiceComplete};
}
export function useStarterGuide(){
 const save=useGame(s=>s.save),preference=usePreference(),[progress,setProgress]=useState({learnedBattle:false,practiceComplete:false});
 useEffect(()=>preference.load(),[preference.load]);
 useEffect(()=>{const update=()=>setProgress(readPracticeProgress());update();window.addEventListener('storage',update);window.addEventListener('cancel-city.training-progress',update);window.addEventListener('cancel-city.practice-progress',update);window.addEventListener('focus',update);return()=>{window.removeEventListener('storage',update);window.removeEventListener('cancel-city.training-progress',update);window.removeEventListener('cancel-city.practice-progress',update);window.removeEventListener('focus',update);};},[]);
 const completed=starterComplete(save);
 return {guided:!preference.hidden&&!completed,completed,journey:starterJourney(save,progress),hide:()=>preference.change(true),restore:()=>preference.change(false)};
}
export function StarterProgress({view}:{view:string}){
 const {guided,journey,hide}=useStarterGuide();
 if(!guided||!['home','packs','battle','collection','city'].includes(view))return null;
 return <aside className="starter-progress global-starter-progress" aria-label="First-session guide"><div><span className="starter-guide-label">START HERE</span><ol>{[['First pack',1],['Learn',2],['First win',3],['Reward',4],['Your crew',5]].map(([label,step])=><li key={label} className={journey.step===step?'current':journey.step>Number(step)?'done':''} aria-current={journey.step===step?'step':undefined}><span>{journey.step>Number(step)?<Check size={13}/>:step}</span>{label}</li>)}</ol></div><Link className="starter-next-action" href={journey.href}>{journey.action}<ArrowRight size={13}/></Link><button className="text-link" onClick={hide}>HIDE GUIDE</button></aside>;
}
export function StarterHome({onStart,disabled}:{onStart:()=>void;disabled:boolean}){const {journey,hide}=useStarterGuide();return <section className="starter-home"><div className="starter-home-copy"><span className="tape pink">START HERE / FREE TO PLAY</span><h2>WELCOME TO<br/><span>CANCEL CITY.</span></h2><h3>{journey.title}</h3><p>{journey.description}</p><button className="button magenta starter-main-action" disabled={disabled} onClick={onStart}>{journey.step===1?<Layers/>:<Swords/>}{journey.action}<ArrowRight/></button><small>Keep your characters. Account progress and browser practice save separately.</small><button className="text-link starter-explore" onClick={hide}>I already know the game — show everything</button></div><div className="starter-home-art" aria-hidden="true"><Portrait card={CARD_BY_ID.CC015}/><span className="tape paper">THEY ARE THE PROBLEM.<br/>YOU ARE THE PLAYER.</span></div></section>;}
export function PrimaryNavigation({view}:{view:string}){const {guided,hide,restore}=useStarterGuide();return <nav className="clear-navigation" aria-label="Main navigation">{[['/','HOME','home'],['/packs/','PACKS','packs'],['/battle/','BATTLE','battle'],['/collection/','COLLECTION','collection'],['/city/','CITY','city']].map(([href,label,id])=><Link key={id} href={href} className={view===id?'active':''} aria-current={view===id?'page':undefined}>{label}</Link>)}<Link href="/battle/?learn=1">LEARN TO PLAY</Link><button onClick={guided?hide:restore}>{guided?'HIDE GUIDE':'SHOW GUIDE'}</button></nav>;}
