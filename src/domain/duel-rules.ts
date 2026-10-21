import {z} from 'zod';
import {CARD_BY_ID, type Card} from '../data/cards';

// Shared by the catalogue, client previews and authoritative battle engine.
export function residentStats(card:Card){
 const hp=Math.round(65+card.stats.shame*.3),attack=Math.round(16+card.stats.clout*.1),defense=Math.round(4+card.stats.chaos*.09);
 return {hp,attack,defense,stars:Math.max(1,Math.min(5,Math.ceil((hp+attack*2+defense-95)/16)))};
}
export const duelStats=(id:string)=>residentStats(CARD_BY_ID[id]);
export const DUEL_LP=120,STARTING_STARS=6,MAX_STARS=10,TURN_STARS=2;
export const TACTICAL_STAR_CAP=6,KNOCKOUT_LP=40;
export const DUEL_CARDS=[
 {id:'receipt',name:'2014 Tweet Receipt',kind:'spell',cost:2,art:'/assets/tactics/receipt.svg',text:'Strike for ATK. Expose the survivor: next hit +25%.'},
 {id:'apology',name:'Ukulele Apology',kind:'spell',cost:1,art:'/assets/tactics/apology.svg',text:'Restore 20 HP to your frontline and gain 1 hype.'},
 {id:'charity',name:'Fake Charity Stream',kind:'spell',cost:3,art:'/assets/tactics/charity.svg',text:'Restore 12 HP to every surviving summoned resident.'},
 {id:'lawyer',name:'Lawyer Up',kind:'spell',cost:1,art:'/assets/tactics/lawyer.svg',text:'Enter defense stance. Block another 35% of the next hit.'},
 {id:'note',name:'Community Note',kind:'trap',cost:2,art:'/assets/tactics/note.svg',text:'Set: halve the next incoming damaging attack or spell. Then discard.'},
 {id:'ban',name:'Cease & Desist',kind:'counter',cost:2,art:'/assets/tactics/ban.svg',text:'Set: cancel the next opposing Special, Duo or damaging spell. Then discard.'},
 {id:'leak',name:'Leaked DMs',kind:'spell',cost:3,art:'/assets/tactics/leak.svg',text:'Strike for ATK + 10, ignoring DEF and temporary shields.'},
 {id:'ratio',name:'Ratio Storm',kind:'spell',cost:2,art:'/assets/tactics/ratio.svg',text:'Strike for ATK − 5. Weaken the survivor’s next hit by 30%.'},
] as const;
export type DuelCardId=typeof DUEL_CARDS[number]['id'];
export const TACTICAL_DECK:DuelCardId[]=['receipt','receipt','apology','apology','charity','lawyer','note','ban','leak','leak','ratio','ratio'];
export const duelCardIdSchema=z.enum(['receipt','apology','charity','lawyer','note','ban','leak','ratio']);
export const tacticDeckSchema=z.array(duelCardIdSchema).length(12,'Choose exactly twelve tactics.').refine(cards=>DUEL_CARDS.every(c=>cards.filter(id=>id===c.id).length<=2),'Maximum two copies of each tactic.');
export const tacticType=(kind:typeof DUEL_CARDS[number]['kind'])=>kind==='spell'?'SPELL':kind==='counter'?'COUNTER TRAP':'TRAP';
export const tacticArtwork=(id:DuelCardId)=>`/assets/tactics/${id}.svg`;
export const DECK_RECIPES=[
 {id:'balanced',name:'Starter / balanced',description:'Damage, recovery and both reactions.',cards:TACTICAL_DECK},
 {id:'pressure',name:'Pressure',description:'Six damage spells. Finish fights before fatigue.',cards:['receipt','receipt','leak','leak','ratio','ratio','apology','apology','lawyer','lawyer','note','ban'] as DuelCardId[]},
 {id:'control',name:'Control',description:'Two of each trap and more recovery. Manage your stars.',cards:['receipt','receipt','ratio','ratio','apology','apology','lawyer','lawyer','note','note','ban','ban'] as DuelCardId[]},
] as const;
export const allTactics=(side:DuelState['player']):DuelCardId[]=>[...side.hand,...side.deck,...side.discard,...(side.trap?[side.trap]:[])];
const pile=z.array(duelCardIdSchema).max(12);
const duelist=z.object({lp:z.number().int().min(0).max(DUEL_LP),stars:z.number().int().min(0).max(MAX_STARS),hand:pile,deck:pile,discard:pile,trap:z.enum(['note','ban']).nullable(),deploymentUsed:z.boolean().default(false),tacticUsed:z.boolean().default(false),fatigue:z.number().int().min(0).max(120).default(0)});
export const duelStateSchema=z.object({player:duelist,enemy:duelist,turnNumber:z.number().int().min(1).max(81).default(1)});
export type DuelState=z.infer<typeof duelStateSchema>;
export const duelCard=(id:DuelCardId)=>DUEL_CARDS.find(c=>c.id===id)!;
export function freshDuel(id:string,version:4|5=4,playerDeck?:DuelCardId[]):DuelState{
 const make=(side:string)=>{
  let seed=Array.from(id+side).reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
  const deck:DuelCardId[]=version===5?[...tacticDeckSchema.parse(side==='player'&&playerDeck?playerDeck:TACTICAL_DECK)]:DUEL_CARDS.map(c=>c.id);
  for(let i=deck.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}
  return {lp:DUEL_LP,stars:STARTING_STARS,hand:deck.splice(0,4),deck,discard:[] as DuelCardId[],trap:null,deploymentUsed:false,tacticUsed:false,fatigue:0};
 };
 return {player:make('player'),enemy:make('enemy'),turnNumber:1};
}
