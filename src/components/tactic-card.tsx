import {duelCard,tacticArtwork,tacticType,type DuelCardId} from '../domain/duel-rules';
import {factionOf} from '../data/cards';

export function TacticArt({id}:{id:DuelCardId}){
 const card=duelCard(id);
 return <div className={`tactic-art ${card.kind}`}><img src={tacticArtwork(id)} width={768} height={768} loading="lazy" alt={`${card.name}: illustrated action card`} draggable={false}/><span>{tacticType(card.kind)}</span></div>;
}
export function TacticCard({id,onInspect}:{id:DuelCardId;onInspect?:()=>void}){
 const card=duelCard(id);
 const body=<><header><strong title={`Play cost: ${card.cost} stars`}>{card.cost} ★</strong><h3>{card.name}</h3></header><TacticArt id={id}/><div className="tactic-print-meta"><b>T{String(card.number).padStart(3,'0')} · {card.purpose}</b><span>{factionOf(card.theme).name}</span></div><p className="tactic-rules-text">{card.text}</p><blockquote>“{card.flavor}”</blockquote><footer>{card.kind==='spell'?'PLAY → RESOLVE → DISCARD':'SET FACE DOWN → TRIGGER → DISCARD'}</footer></>;
 return onInspect?<button type="button" className={`tactic-catalogue-card ${card.kind} inspectable`} onClick={onInspect} aria-label={`Inspect tactic ${card.name}`}>{body}</button>:<article className={`tactic-catalogue-card ${card.kind}`}>{body}</article>;
}
