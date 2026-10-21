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
 {id:'receipt',number:1,name:'2014 Tweet Receipt',kind:'spell',cost:2,theme:'terminally-online',purpose:'DAMAGE / EXPOSE',art:'/assets/tactics/receipt-illustrated.webp',text:'Strike for ATK. Expose the survivor: next hit +25%.',flavor:'You deleted the post. The internet has abandonment issues.'},
 {id:'apology',number:2,name:'Ukulele Apology',kind:'spell',cost:1,theme:'politics-hypocrisy',purpose:'HEAL / HYPE',art:'/assets/tactics/apology-illustrated.webp',text:'Restore 20 HP to your frontline and gain 1 hype.',flavor:'The apology is sincere. The sponsorship is non-refundable.'},
 {id:'charity',number:3,name:'Fake Charity Stream',kind:'spell',cost:3,theme:'politics-hypocrisy',purpose:'TEAM RECOVERY',art:'/assets/tactics/charity-illustrated.webp',text:'Restore 12 HP to every surviving summoned resident.',flavor:'Every donation helps a child. My inner child wants a yacht.'},
 {id:'lawyer',number:4,name:'Lawyer Up',kind:'spell',cost:1,theme:'corporate-hell',purpose:'DEFENSE / SHIELD',art:'/assets/tactics/lawyer-illustrated.webp',text:'Enter defense stance. Block another 35% of the next hit.',flavor:'Morality was unavailable. We retained counsel.'},
 {id:'note',number:5,name:'Community Note',kind:'trap',cost:2,theme:'international-incidents',purpose:'DAMAGE REACTION',art:'/assets/tactics/note-illustrated.webp',text:'Set: halve the next incoming damaging attack or spell. Then discard.',flavor:'A source entered the chat. Your personality is in critical condition.'},
 {id:'ban',number:6,name:'Cease & Desist',kind:'counter',cost:2,theme:'international-incidents',purpose:'CANCEL AN EFFECT',art:'/assets/tactics/ban-illustrated.webp',text:'Set: cancel the next opposing Special, Duo or damaging spell. Then discard.',flavor:'Free speech. Premium legal fees.'},
 {id:'leak',number:7,name:'Leaked DMs',kind:'spell',cost:3,theme:'cursed-society',purpose:'PIERCING DAMAGE',art:'/assets/tactics/leak-illustrated.webp',text:'Strike for ATK + 10, ignoring DEF and temporary shields.',flavor:'End-to-end encryption. Mouth-to-mouth distribution.'},
 {id:'ratio',number:8,name:'Ratio Storm',kind:'spell',cost:2,theme:'terminally-online',purpose:'DAMAGE / WEAKEN',art:'/assets/tactics/ratio-illustrated.webp',text:'Strike for ATK − 5. Weaken the survivor’s next hit by 30%.',flavor:'The crowd has spoken. Unfortunately, all at once.'},
 {id:'slop',number:9,name:'AI Slop Tsunami',kind:'spell',cost:1,theme:'crypto-degenerates',purpose:'DRAW / DECK CYCLE',art:'/assets/tactics/slop-illustrated.webp',text:'Draw up to 2 cards from your draw pile. At 5 cards in hand, discard extra draws. No empty-pile draws.',flavor:'Five million posts. Six fingers. Zero thoughts.'},
 {id:'grass',number:10,name:'Touch Grass Injunction',kind:'spell',cost:1,theme:'cursed-society',purpose:'HEAL / CLEANSE',art:'/assets/tactics/grass-illustrated.webp',text:'Restore 12 HP to your frontline. Remove its weakness and exposure.',flavor:'Your screen time qualifies as a missing-person report.'},
 {id:'terms',number:11,name:'Terms & Conditions Apply',kind:'counter',cost:1,theme:'corporate-hell',purpose:'COUNTER RECOVERY',art:'/assets/tactics/terms-illustrated.webp',text:'Set: cancel the next enemy healing spell or healing Special, including its other effects. Costs stay spent. Then discard.',flavor:'Your suffering was approved. Your claim was not.'},
 {id:'insurance',number:12,name:'Skill Issue Insurance',kind:'trap',cost:2,theme:'crypto-degenerates',purpose:'PRE-HIT RECOVERY',art:'/assets/tactics/insurance-illustrated.webp',text:'Set: before your wounded frontline takes a damaging hit, restore up to 16 HP to it. Then discard. Does not trigger at full HP or revive a knockout.',flavor:'We cover skill issues. Consequences sold separately.'},
] as const;
export type DuelCardId=typeof DUEL_CARDS[number]['id'];
export type DuelTrapId=Extract<typeof DUEL_CARDS[number],{kind:'trap'|'counter'}>['id'];
export const LEGACY_DUEL_CARD_IDS=['receipt','apology','charity','lawyer','note','ban','leak','ratio'] as const;
export const TACTICAL_DECK:DuelCardId[]=['receipt','receipt','apology','apology','charity','lawyer','note','ban','leak','leak','ratio','ratio'];
export const duelCardIdSchema=z.enum(['receipt','apology','charity','lawyer','note','ban','leak','ratio','slop','grass','terms','insurance']);
export const tacticDeckSchema=z.array(duelCardIdSchema).length(12,'Choose exactly twelve tactics.').refine(cards=>DUEL_CARDS.every(c=>cards.filter(id=>id===c.id).length<=2),'Maximum two copies of each tactic.');
export const tacticType=(kind:typeof DUEL_CARDS[number]['kind'])=>kind==='spell'?'SPELL':kind==='counter'?'COUNTER TRAP':'TRAP';
export const tacticArtwork=(id:DuelCardId)=>DUEL_CARDS.find(c=>c.id===id)!.art;
export const DECK_RECIPES=[
 {id:'balanced',name:'Starter / balanced',description:'Damage, recovery and both reactions.',cards:TACTICAL_DECK},
 {id:'pressure',name:'Pressure',description:'Six damage spells. Finish fights before fatigue.',cards:['receipt','receipt','leak','leak','ratio','ratio','apology','apology','lawyer','lawyer','note','ban'] as DuelCardId[]},
 {id:'control',name:'Control',description:'Two of each trap and more recovery. Manage your stars.',cards:['receipt','receipt','ratio','ratio','apology','apology','lawyer','lawyer','note','note','ban','ban'] as DuelCardId[]},
 {id:'slop-cycle',name:'Slop & cope',description:'Cycle your deck, cleanse debuffs and deny enemy healing.',cards:['slop','slop','grass','insurance','terms','note','ban','lawyer','apology','receipt','leak','ratio'] as DuelCardId[]},
] as const;
export const allTactics=(side:DuelState['player']):DuelCardId[]=>[...side.hand,...side.deck,...side.discard,...(side.trap?[side.trap]:[])];
const pile=z.array(duelCardIdSchema).max(12);
const duelist=z.object({lp:z.number().int().min(0).max(DUEL_LP),stars:z.number().int().min(0).max(MAX_STARS),hand:pile,deck:pile,discard:pile,trap:z.enum(['note','ban','terms','insurance']).nullable(),deploymentUsed:z.boolean().default(false),tacticUsed:z.boolean().default(false),fatigue:z.number().int().min(0).max(120).default(0)});
export const duelStateSchema=z.object({player:duelist,enemy:duelist,turnNumber:z.number().int().min(1).max(81).default(1)});
export type DuelState=z.infer<typeof duelStateSchema>;
export const duelCard=(id:DuelCardId)=>DUEL_CARDS.find(c=>c.id===id)!;
export function freshDuel(id:string,version:4|5=4,playerDeck?:DuelCardId[]):DuelState{
 const make=(side:string)=>{
  let seed=Array.from(id+side).reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
  const deck:DuelCardId[]=version===5?[...tacticDeckSchema.parse(side==='player'&&playerDeck?playerDeck:TACTICAL_DECK)]:[...LEGACY_DUEL_CARD_IDS];
  for(let i=deck.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}
  return {lp:DUEL_LP,stars:STARTING_STARS,hand:deck.splice(0,4),deck,discard:[] as DuelCardId[],trap:null,deploymentUsed:false,tacticUsed:false,fatigue:0};
 };
 return {player:make('player'),enemy:make('enemy'),turnNumber:1};
}
