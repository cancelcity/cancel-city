import {CARD_BY_ID} from '../data/cards';
/** Four-note original synth ident; no recorded voices or licensed samples. */
export function characterSignature(cardId:string){const card=Object.hasOwn(CARD_BY_ID,cardId)?CARD_BY_ID[cardId]:null;if(!card)throw new Error('Unknown signature resident');const n=card.number-1,root=220*2**((n%12)/12),intervals=[0,3+(Math.floor(n/12)%4),7+(Math.floor(n/48)%3),12];return intervals.map((semitones,i)=>({frequency:root*2**(semitones/12),delay:i*(.085+(n%5)*.012),duration:.085+(n%3)*.025,waveform:(['triangle','sine','square'] as const)[n%3]}));}
