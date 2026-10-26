'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {useGame} from '../state/store';
import {finishPlaytest,markPlaytest,PLAYTEST_CHANGE_EVENT,readPlaytest} from '../services/playtest';

// Opt-in only. No save snapshots, identities, click text or network requests.
export function PlaytestObserver(){
 const [active,setActive]=useState(false),path=usePathname(),router=useRouter();
 useEffect(()=>{const update=()=>{const report=readPlaytest();setActive(!!report&&!report.endedAt);};update();window.addEventListener(PLAYTEST_CHANGE_EVENT,update);return()=>window.removeEventListener(PLAYTEST_CHANGE_EVENT,update);},[]);
 useEffect(()=>{if(active&&path!=='/playtest/')markPlaytest('route',path);},[active,path]);
 useEffect(()=>{
  if(!active)return;
  let previous=useGame.getState();
  const unsubscribe=useGame.subscribe(next=>{
   if(next.hydrated&&(!previous.hydrated||next.mode!==previous.mode))markPlaytest(next.mode==='offline'?'save_unavailable':'save_ready',next.mode);
   const before=previous.save,after=next.save;
   if(before&&after){
    if(after.lifetimePacksOpened>before.lifetimePacksOpened)markPlaytest('pack_opened');
    if(after.pendingOpening?.revealedCount===5&&before.pendingOpening?.revealedCount!==5)markPlaytest('pack_revealed');
    if(before.pendingOpening&&!after.pendingOpening&&after.lifetimePacksOpened===before.lifetimePacksOpened)markPlaytest('pack_collected');
    const battle=after.battle.active,oldBattle=before.battle.active;
    if(battle&&battle.id!==oldBattle?.id)markPlaytest('battle_started',battle.mode);
    if(battle?.phase==='finished'&&oldBattle?.phase!=='finished')markPlaytest('battle_finished',battle.winner==='player'?'win':'loss');
    if(after.roast&&after.roast.id!==before.roast?.id)markPlaytest('roast_started',after.roast.mode);
    if(after.roast?.phase==='finished'&&before.roast?.phase!=='finished')markPlaytest('roast_finished',after.roast.winner==='player'?'win':'loss');
    if(JSON.stringify(after.career.presets)!==JSON.stringify(before.career.presets))markPlaytest('squad_saved');
   }
   previous=next;
  });
  const visibility=()=>markPlaytest(document.hidden?'hidden':'visible');
  document.addEventListener('visibilitychange',visibility);
  return()=>{unsubscribe();document.removeEventListener('visibilitychange',visibility);};
 },[active]);
 if(!active||path==='/playtest/')return null;
 return <aside className="playtest-control" aria-label="Playtest recording"><span>LOCAL PLAYTEST</span><button type="button" onClick={()=>{finishPlaytest();router.push('/playtest/');}}>END TEST</button><Link href="/playtest/">DETAILS</Link></aside>;
}
