import {setOf,type Card} from './cards';

// Responsive candidates must depict the same identity and selected artwork.
// First-batch portraits have their own derivatives; legacy small images remain
// available for the rest of the deck, at their original delivery dimensions.
export function portraitSourceSet(card:Card){
 const redrawn=card.art.startsWith('/assets/roster-v3/')||card.art.startsWith('/assets/roster-b2/');
 const small=redrawn?card.art.replace(/\.webp$/,'-small.webp'):`/assets/residents/${card.id}-small.webp`;
 const width=redrawn?384:['set-03','set-04','set-05'].includes(setOf(card))?320:384;
 return `${small} ${width}w, ${card.art} 896w`;
}
