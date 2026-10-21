'use client';
import {FACTIONS,factionOf} from '../data/cards';
import {Dialog} from './dialog';
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
 const [kind,setKind]=useState<'all'|'spell'|'trap'>('all'),[theme,setTheme]=useState(''),[query,setQuery]=useState(''),[selected,setSelected]=useState<DuelCardId|null>(null);
 const cards=DUEL_CARDS.filter(c=>(kind==='all'||(kind==='spell'?c.kind==='spell':c.kind!=='spell'))&&(!theme||c.theme===theme)&&(!query||`${c.name} ${c.flavor} ${c.purpose}`.toLowerCase().includes(query.toLowerCase())));
 const valid=tacticDeckSchema.safeParse(deck).success,spells=deck.filter(id=>DUEL_CARDS.find(c=>c.id===id)?.kind==='spell').length;
 return <section className="tactic-workshop" aria-label="Tactic deck builder">
  <header className="tactic-workshop-heading"><div><small>BUILD YOUR BAD INFLUENCE</small><h2>THREE FIGHTERS. TWELVE TACTICS.</h2><p>All {DUEL_CARDS.length} tactics are free. Build twelve. Max two copies each. Every theme works with any crew.</p></div><strong className={valid?'valid':'invalid'} aria-live="polite">{deck.length} / 12<small>{spells} SPELLS · {deck.length-spells} TRAPS</small></strong></header>
  <div className="card-type-key"><span><b>FIGHTER</b>Person · HP / ATK / DEF · stays on field</span><span><b>SPELL</b>Action · resolves immediately</span><span><b>TRAP</b>Reaction · waits face down for its trigger</span></div>
  <div className="deck-recipes"><b>QUICK START</b>{DECK_RECIPES.map(recipe=><button key={recipe.id} disabled={disabled} title={recipe.description} onClick={()=>onChange([...recipe.cards])}>{recipe.name}</button>)}<span>Or adjust the copies below.</span></div>
  <div className="tactic-browser-controls"><div role="group" aria-label="Filter tactic type">{(['all','spell','trap'] as const).map(type=><button key={type} aria-pressed={kind===type} onClick={()=>setKind(type)}>{type==='all'?'ALL CARDS':type==='spell'?'SPELLS / MAGIC':'TRAPS & COUNTERS'}</button>)}</div><label>THEME<select aria-label="Filter tactic theme" value={theme} onChange={e=>setTheme(e.target.value)}><option value="">Every part of the city</option>{FACTIONS.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label><input aria-label="Search tactics" placeholder="Search cards, jokes or effects…" value={query} onChange={e=>setQuery(e.target.value)}/><span>{cards.length} / {DUEL_CARDS.length} CARDS</span></div><div className="tactic-catalogue">{cards.map(card=>{const count=deck.filter(id=>id===card.id).length;return <div key={card.id} className={`tactic-deck-entry ${count?'included':''}`}><TacticCard id={card.id} onInspect={()=>setSelected(card.id)}/><div className="tactic-copy-controls"><button aria-label={`Remove ${card.name}`} disabled={disabled||!count} onClick={()=>{const next=[...deck];next.splice(next.indexOf(card.id),1);onChange(next);}}>−</button><span aria-label={`${card.name}: ${count} ${count===1?'copy':'copies'}`}><b>{count} / 2</b><small>{tacticType(card.kind)}</small></span><button aria-label={`Add ${card.name}`} disabled={disabled||count>=2||deck.length>=12} onClick={()=>onChange([...deck,card.id])}>+</button></div></div>;})}</div>
  {!cards.length&&<p className="tactic-no-results">No cards match. <button onClick={()=>{setKind('all');setTheme('');setQuery('');}}>CLEAR FILTERS</button></p>}
  <p className={`deck-validation ${valid?'valid':'invalid'}`} role="status">{valid?'DECK READY · Saved in this browser. Used for new practice, campaign and daily duels.':`CHOOSE ${12-deck.length} MORE TACTIC${12-deck.length===1?'':'S'} · A duel needs exactly twelve. Your last complete deck stays saved.`} Existing matches keep their starting deck.</p>
  {selected&&<Dialog title={`${DUEL_CARDS.find(c=>c.id===selected)!.name} / TACTIC DOSSIER`} onClose={()=>setSelected(null)}><div className="tactic-dossier"><TacticCard id={selected}/><div><b>{factionOf(DUEL_CARDS.find(c=>c.id===selected)!.theme).name} · FREE TACTIC</b><p>The theme is flavour, not a faction lock. Use this card with any three fighters. Play or set it during your optional tactic step; your battle action remains available.</p><p>{DUEL_CARDS.find(c=>c.id===selected)!.kind==='spell'?'Spells resolve immediately, then discard.':'One trap slot per side. Pay when setting; it reacts automatically once its printed trigger is met.'}</p><p>Copies in your next deck: <b>{deck.filter(id=>id===selected).length} / 2</b></p><button className="button magenta" disabled={disabled||deck.length>=12||deck.filter(id=>id===selected).length>=2} onClick={()=>onChange([...deck,selected])}>{deck.filter(id=>id===selected).length>=2?'TWO COPIES ALREADY ADDED':deck.length>=12?'DECK FULL · REMOVE A CARD FIRST':'ADD TO YOUR DECK'}</button></div></div></Dialog>}
 </section>;
}
