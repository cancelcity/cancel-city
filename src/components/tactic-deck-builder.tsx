'use client';
import {useEffect,useState} from 'react';
import {DECK_RECIPES,DUEL_CARDS,TACTICAL_DECK,tacticDeckSchema,tacticType,type DuelCardId} from '../domain/duel-rules';
import {TacticCard} from './tactic-card';

const DECK_KEY='cancel-city.tactic-deck.v1';
export function useTacticDeck(){
 const [deck,setDeck]=useState<DuelCardId[]>([...TACTICAL_DECK]),[loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(DECK_KEY),parsed=raw&&tacticDeckSchema.safeParse(JSON.parse(raw));if(parsed&&parsed.success)setDeck(parsed.data);}catch{}setLoaded(true);},[]);
 useEffect(()=>{if(loaded&&tacticDeckSchema.safeParse(deck).success)try{localStorage.setItem(DECK_KEY,JSON.stringify(deck));}catch{}},[deck,loaded]);
 return [deck,setDeck,loaded] as const;
}
export function TacticDeckBuilder({deck,onChange,disabled=false}:{deck:DuelCardId[];onChange:(deck:DuelCardId[])=>void;disabled?:boolean}){
 const valid=tacticDeckSchema.safeParse(deck).success,spells=deck.filter(id=>DUEL_CARDS.find(c=>c.id===id)?.kind==='spell').length;
 return <section className="tactic-workshop" aria-label="Tactic deck builder">
  <header className="tactic-workshop-heading"><div><small>BUILD YOUR BAD INFLUENCE</small><h2>THREE FIGHTERS. TWELVE TACTICS.</h2><p>All eight tactics are free. Add up to two copies of each. Your first fighter leads.</p></div><strong className={valid?'valid':'invalid'} aria-live="polite">{deck.length} / 12<small>{spells} SPELLS · {deck.length-spells} TRAPS</small></strong></header>
  <div className="card-type-key"><span><b>FIGHTER</b>Person · HP / ATK / DEF · stays on field</span><span><b>SPELL</b>Action · resolves immediately</span><span><b>TRAP</b>Reaction · waits face down for its trigger</span></div>
  <div className="deck-recipes"><b>QUICK START</b>{DECK_RECIPES.map(recipe=><button key={recipe.id} disabled={disabled} title={recipe.description} onClick={()=>onChange([...recipe.cards])}>{recipe.name}</button>)}<span>Or adjust the copies below.</span></div>
  <div className="tactic-catalogue">{DUEL_CARDS.map(card=>{const count=deck.filter(id=>id===card.id).length;return <div key={card.id} className={`tactic-deck-entry ${count?'included':''}`}><TacticCard id={card.id}/><div className="tactic-copy-controls"><button aria-label={`Remove ${card.name}`} disabled={disabled||!count} onClick={()=>{const next=[...deck];next.splice(next.indexOf(card.id),1);onChange(next);}}>−</button><span aria-label={`${card.name}: ${count} copies`}><b>{count} / 2</b><small>{tacticType(card.kind)}</small></span><button aria-label={`Add ${card.name}`} disabled={disabled||count>=2||deck.length>=12} onClick={()=>onChange([...deck,card.id])}>+</button></div></div>;})}</div>
  <p className={`deck-validation ${valid?'valid':'invalid'}`} role="status">{valid?'DECK READY · Saved in this browser. Used for new practice, campaign and daily duels.':`CHOOSE ${12-deck.length} MORE TACTIC${12-deck.length===1?'':'S'} · A duel needs exactly twelve. Your last complete deck stays saved.`} Existing matches keep their starting deck.</p>
 </section>;
}
