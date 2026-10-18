import records from './catalogue.json';
import {EXPANSION_RESIDENTS} from './expansion';
import {MEGA_RESIDENTS,MEGA_SETS,MEGA_GOALS} from './mega';
import {rosterPresentation} from './first-roster-batch';
import {secondRosterPresentation} from './second-roster-batch';
export const RARITIES = [
 {id:'nobody',name:'Common',weight:.60,color:'#d5cfbf',symbol:'●'},
 {id:'problematic',name:'Uncommon',weight:.25,color:'#31d7ff',symbol:'◆'},
 {id:'public-menace',name:'Rare',weight:.10,color:'#ff2daa',symbol:'✦'},
 {id:'uncancelable',name:'Epic',weight:.04,color:'#deff00',symbol:'★'},
 {id:'public-enemy',name:'Mythic',weight:.01,color:'#ff665c',symbol:'☠'},
] as const;
export type RarityId=typeof RARITIES[number]['id'];
export const FACTIONS=[
 {id:'terminally-online',name:'Terminally Online',color:'#31d7ff',icon:'⌘'},
 {id:'corporate-hell',name:'Corporate Hell',color:'#b99bff',icon:'▥'},
 {id:'international-incidents',name:'International Incidents',color:'#f3a75d',icon:'⊕'},
 {id:'politics-hypocrisy',name:'Politics & Hypocrisy',color:'#ff665c',icon:'⚑'},
 {id:'crypto-degenerates',name:'Crypto Degenerates',color:'#deff00',icon:'↗'},
 {id:'cursed-society',name:'Cursed Society',color:'#ff2daa',icon:'✕'},
] as const;
export type FactionId=typeof FACTIONS[number]['id'];
export type SetId='set-01'|'set-02'|'set-03'|'set-04'|'set-05'|'set-06'|'set-07'|'set-08'|'set-09';
export interface Card {setId?:SetId;satire?:string;id:string;number:number;name:string;rarity:RarityId;faction:FactionId;ability:string;description:string;quote:string;stats:{clout:number;shame:number;chaos:number};art:string}
export const CARDS=[...(records as Card[]),...EXPANSION_RESIDENTS,...MEGA_RESIDENTS].map(rosterPresentation).map(secondRosterPresentation);
export const SETS=[{id:'set-01',name:'City Intake',count:30},{id:'set-02',name:'Cult of Personality',count:12},{id:'set-03',name:'Culture Collision',count:8},{id:'set-04',name:'Internet Infamy',count:10},{id:'set-05',name:'Anime Brainrot',count:6},...MEGA_SETS] as const;
export const setOf=(card:Card)=>card.setId||'set-01';
export const BASE_CARDS=CARDS.filter(c=>setOf(c)==='set-01');
export const WAVE_CARDS=CARDS.filter(c=>setOf(c)==='set-02');
export const CULTURE_CARDS=CARDS.filter(c=>setOf(c)==='set-03');
export const INFAMY_CARDS=CARDS.filter(c=>setOf(c)==='set-04');
export const ANIME_CARDS=CARDS.filter(c=>setOf(c)==='set-05');
export const NEW_SET_REWARDS=[{cards:INFAMY_CARDS,id:'complete-infamy',name:'Internet Infamy'},{cards:ANIME_CARDS,id:'complete-anime',name:'Anime Brainrot'},...MEGA_GOALS] as const;
export const CARD_BY_ID=Object.fromEntries(CARDS.map(c=>[c.id,c]));
export const rarityOf=(id:RarityId)=>RARITIES.find(r=>r.id===id)!;
export const factionOf=(id:FactionId)=>FACTIONS.find(f=>f.id===id)!;
export const BALANCE={version:'gacha-7',packSize:5,welcomePacks:3,dailyPacks:3,packXp:25,discoveryXp:5,fusionXp:10,fusionCost:3};
