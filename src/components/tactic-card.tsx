import {duelCard,tacticArtwork,tacticType,type DuelCardId} from '../domain/duel-rules';

export function TacticArt({id}:{id:DuelCardId}){
 const card=duelCard(id);
 return <div className={`tactic-art ${card.kind}`}><img src={tacticArtwork(id)} alt={`${card.name}: illustrated action card`} draggable={false}/><span>{tacticType(card.kind)}</span></div>;
}
export function TacticCard({id}:{id:DuelCardId}){
 const card=duelCard(id);
 return <article className={`tactic-catalogue-card ${card.kind}`}><header><strong>{card.cost} ★</strong><h3>{card.name}</h3></header><TacticArt id={id}/><p>{card.text}</p><footer>{card.kind==='spell'?'PLAY → RESOLVE → DISCARD':'SET FACE DOWN → TRIGGER → DISCARD'}</footer></article>;
}
