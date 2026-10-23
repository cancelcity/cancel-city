import {z} from 'zod';
import {CITY_EVENTS,CITY_EVENT_BY_ID} from '../data/city-events';
import {CITY_ZONE_BY_ID,type CityZoneId} from '../data/city-zones';
import type {CornerClueId} from '../data/cloutside-corner';
import type {HarbourClueId} from '../data/liability-hills';
import {CARD_BY_ID} from '../data/cards';
import {BuildingKind,buildingOf,CITY_BALANCE,CONTRACTS,CONTRACT_BY_ID} from '../data/city';
import {LOANERS} from './battle';
import type {Save,Command} from './game';
const count=z.number().int().nonnegative().safe();
const resident=z.string().refine(id=>Object.hasOwn(CARD_BY_ID,id),'Unknown city resident');
const eventId=z.string().refine(id=>Object.hasOwn(CITY_EVENT_BY_ID,id),'Unknown city event');
const eventChoice=z.union([z.literal(0),z.literal(1),z.literal(2)]);
const zoneId=z.enum(['yacht-club','oil-manor','red-flag-house','kfc','fade-court','sole-custody','360-records','oscar-studios','moonwalk-museum','probable-cause']);
const cornerClueId=z.enum(['receipt','statement']);
const harbourClueId=z.enum(['invoice','guest-list']);
export const buildingKindSchema=z.enum(['feed','pr','summit','civic','rocket','afterparty']);
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v);
const buildingSchema=z.object({kind:buildingKindSchema,level:z.union([z.literal(1),z.literal(2),z.literal(3)]),residentId:resident.nullable()});
export const citySchema=z.object({version:z.literal(1),startedAt:z.string().datetime(),influence:count,lastProductionDay:date.nullable(),lifetimeGenerated:count,plots:z.array(buildingSchema.nullable()).length(12),contracts:z.record(z.string().refine(id=>Object.hasOwn(CONTRACT_BY_ID,id)),z.object({startedAt:z.string().datetime(),progress:count.max(5),claimed:z.boolean()})),epilogues:z.array(buildingKindSchema).max(6),tutorialSeen:z.boolean(),unlockedThemes:z.array(z.enum(['afterhours','riot','gold'])).min(1).max(3).default(['afterhours']),theme:z.enum(['afterhours','riot','gold']),incidents:z.record(buildingKindSchema,z.union([z.literal(0),z.literal(1)])).default({}),eventEndings:z.record(eventId,eventChoice).default({}),zoneEndings:z.record(zoneId,eventChoice).default({}),cornerClues:z.array(cornerClueId).max(2).default([]),harbourClues:z.array(harbourClueId).max(2).default([]),activeEvent:z.object({eventId,startedAt:z.string().datetime(),endsAt:z.string().datetime()}).nullable().default(null),signs:z.record(z.string().regex(/^(?:[0-9]|1[01])$/),z.string().min(1).max(24)).default({})}).superRefine((city,ctx)=>{
 const bad=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});
 const residents=city.plots.flatMap(b=>b?.residentId?[b.residentId]:[]);if(new Set(residents).size!==residents.length)bad('A resident can occupy only one building');
 if(new Set(city.unlockedThemes).size!==city.unlockedThemes.length||!city.unlockedThemes.includes(city.theme))bad('Invalid city theme unlock');
 if(new Set(city.epilogues).size!==city.epilogues.length)bad('Duplicate city epilogue');
 if(new Set(city.cornerClues).size!==city.cornerClues.length)bad('Duplicate corner clue');
 if(new Set(city.harbourClues).size!==city.harbourClues.length)bad('Duplicate harbour clue');
 if(Object.hasOwn(city.zoneEndings,'probable-cause')&&city.cornerClues.length!==2)bad('The loyalty inspection ending requires both clues');
 for(const [id,contract] of Object.entries(city.contracts)){const definition=CONTRACT_BY_ID[id];if(!definition)continue;if(contract.progress>definition.target||contract.claimed&&contract.progress<definition.target)bad('Invalid city contract progress');if(definition.tier===2&&!city.contracts[`${definition.kind}:1`]?.claimed)bad('Second chapter requires first chapter reward');}
 for(const kind of city.epilogues)if(!city.contracts[`${kind}:2`]?.claimed)bad('Epilogue requires second chapter reward');
 if(city.activeEvent&&(Date.parse(city.activeEvent.endsAt)-Date.parse(city.activeEvent.startedAt)!==300000))bad('City event atmosphere must last five minutes');
 if(Object.keys(city.signs).some(i=>!city.plots[Number(i)]))bad('Sign requires a built plot');
 if(city.lastProductionDay&&city.lastProductionDay<city.startedAt.slice(0,10))bad('Production predates city start');
});
export type City=z.infer<typeof citySchema>;
export type CityBuilding=NonNullable<City['plots'][number]>;
export type CityCommand={type:'city-harbour-clue';clueId:HarbourClueId}|{type:'city-corner-clue';clueId:CornerClueId}|{type:'city-zone-choice';zoneId:CityZoneId;choice:0|1|2}|{type:'city-event-start';eventId:string}|{type:'city-event-choice';eventId:string;choice:0|1|2}|{type:'city-sign';plot:number;text:string|null}|{type:'city-incident';kind:BuildingKind;choice:0|1}|{type:'city-start'}|{type:'city-build';plot:number;kind:BuildingKind}|{type:'city-upgrade';plot:number}|{type:'city-assign';plot:number;residentId:string|null}|{type:'city-move';from:number;to:number}|{type:'city-collect'}|{type:'city-accept';contractId:string}|{type:'city-claim';contractId:string}|{type:'city-epilogue';kind:BuildingKind}|{type:'city-tutorial'}|{type:'city-theme';theme:City['theme']};
const plot=z.number().int().min(0).max(11);
export const cityCommandShapes=[z.object({type:z.literal('city-harbour-clue'),clueId:harbourClueId}),z.object({type:z.literal('city-corner-clue'),clueId:cornerClueId}),z.object({type:z.literal('city-zone-choice'),zoneId,choice:eventChoice}),z.object({type:z.literal('city-event-start'),eventId}),z.object({type:z.literal('city-event-choice'),eventId,choice:eventChoice}),z.object({type:z.literal('city-sign'),plot,text:z.string().trim().min(1).max(24).nullable()}),z.object({type:z.literal('city-incident'),kind:buildingKindSchema,choice:z.union([z.literal(0),z.literal(1)])}),z.object({type:z.literal('city-start')}),z.object({type:z.literal('city-build'),plot,kind:buildingKindSchema}),z.object({type:z.literal('city-upgrade'),plot}),z.object({type:z.literal('city-assign'),plot,residentId:resident.nullable()}),z.object({type:z.literal('city-move'),from:plot,to:plot}),z.object({type:z.literal('city-collect')}),z.object({type:z.literal('city-accept'),contractId:z.string().refine(id=>Object.hasOwn(CONTRACT_BY_ID,id))}),z.object({type:z.literal('city-claim'),contractId:z.string().refine(id=>Object.hasOwn(CONTRACT_BY_ID,id))}),z.object({type:z.literal('city-epilogue'),kind:buildingKindSchema}),z.object({type:z.literal('city-tutorial')}),z.object({type:z.literal('city-theme'),theme:z.enum(['afterhours','riot','gold'])})] as const;
export class CityRuleError extends Error{constructor(public code:string,message:string){super(message);}}
export const freshCity=(now:Date):City=>({version:1,startedAt:now.toISOString(),influence:CITY_BALANCE.welcomeInfluence,lastProductionDay:null,lifetimeGenerated:0,plots:[{kind:'feed',level:1,residentId:'CC001'},...Array.from({length:11},()=>null)],contracts:{},epilogues:[],tutorialSeen:false,unlockedThemes:['afterhours'],theme:'afterhours',incidents:{},eventEndings:{},zoneEndings:{},cornerClues:[],harbourClues:[],activeEvent:null,signs:{}});
export function plotUnlock(save:Save,index:number):{unlocked:boolean;requirement:string}{
 if(!Number.isInteger(index)||index<0||index>11)return {unlocked:false,requirement:'Unknown plot'};
 if(index<6)return {unlocked:true,requirement:'Starter district'};
 const requirements=[{unlocked:save.discoveredCardIds.length>=5,requirement:'Discover 5 residents'},{unlocked:save.discoveredCardIds.length>=10,requirement:'Discover 10 residents'},{unlocked:save.battle.clearedDistrictIds.includes('street'),requirement:'Clear Comment Section'},{unlocked:save.battle.wins>=3,requirement:'Win 3 scored battles'},{unlocked:save.discoveredCardIds.length>=20,requirement:'Discover 20 residents'},{unlocked:save.battle.clearedDistrictIds.includes('media'),requirement:'Clear Outrage Network'}];return requirements[index-6];
}
export function matched(building:CityBuilding){return !!building.residentId&&CARD_BY_ID[building.residentId].faction===buildingOf(building.kind).faction;}
export function influenceRate(building:CityBuilding){return building.residentId?15+building.level*10+15+(matched(building)?10:0):0;}
export function cityProduction(city:City){return Math.min(CITY_BALANCE.dailyCap,city.plots.reduce((n,b)=>n+(b?influenceRate(b):0),0));}
/** Production is collected city-wide, so an upgrade may hit the daily cap. */
export function cityUpgradePreview(city:City,index:number){
 const building=city.plots[index];if(!building||building.level===3)return null;
 const level=(building.level+1) as 2|3,upgraded={...building,level};
 const incomeBefore=cityProduction(city),incomeAfter=cityProduction({...city,plots:city.plots.map((b,i)=>i===index?upgraded:b)});
 return {level,cost:CITY_BALANCE.upgradeCosts[level],incomeBefore,incomeAfter,incomeGain:incomeAfter-incomeBefore,buildingBefore:influenceRate(building),buildingAfter:influenceRate(upgraded),capped:incomeAfter===CITY_BALANCE.dailyCap};
}
/** An unfinished incident stays actionable even after its five-minute atmosphere ends. */
export function nextStreetBeef(city:City|null){
 if(city?.activeEvent&&!Object.hasOwn(city.eventEndings,city.activeEvent.eventId))return CITY_EVENT_BY_ID[city.activeEvent.eventId];
 return CITY_EVENTS.find(event=>!city||!Object.hasOwn(city.eventEndings,event.id))||null;
}
export function cityCanCollect(city:City,now:Date){const day=now.toISOString().slice(0,10);return day>=city.startedAt.slice(0,10)&&(!city.lastProductionDay||city.lastProductionDay<day)&&cityProduction(city)>0;}
export function chapterHosts(city:City,kind:BuildingKind,tier:1|2|3){return city.plots.filter((b):b is CityBuilding=>!!b&&b.kind===kind&&b.level>=tier&&matched(b));}
export const claimedCityJobs=(city:City)=>Object.values(city.contracts).filter(c=>c.claimed).length;
export function themeUnlocked(city:City,theme:City['theme']){return city.unlockedThemes.includes(theme);}
export function cityJobs(save:Save){const city=save.city;return CONTRACTS.map(definition=>{const state=city?.contracts[definition.id],host=city?chapterHosts(city,definition.kind,definition.tier):[],previous=definition.tier===1||!!city?.contracts[`${definition.kind}:1`]?.claimed;return {...definition,state,available:!!city&&host.length>0&&previous,host:host[0]||null};});}
function requireCity(s:Save){if(!s.city)throw new CityRuleError('CITY_MISSING','Found your neighbourhood first.');return s.city;}
function requirePlot(s:Save,index:number){if(!plotUnlock(s,index).unlocked)throw new CityRuleError('CITY_PLOT_LOCKED',plotUnlock(s,index).requirement);return index;}
function spend(city:City,amount:number){if(city.influence<amount)throw new CityRuleError('CITY_NO_INFLUENCE','Collect daily Influence or finish a neighbourhood job first.');city.influence-=amount;}
export function applyCityCommand(s:Save,command:CityCommand,now:Date,award:(id:string,packs:number)=>boolean){
 if(command.type==='city-start'){if(s.city)throw new CityRuleError('CITY_ALREADY_STARTED','Your neighbourhood is already founded.');s.city=freshCity(now);return;}
 const city=requireCity(s);if(now.toISOString().slice(0,10)<city.startedAt.slice(0,10)||city.lastProductionDay&&now.toISOString().slice(0,10)<city.lastProductionDay)throw new CityRuleError('CITY_CLOCK_ROLLBACK','Timed city actions require the current date.');
 switch(command.type){
  case 'city-harbour-clue':{
   if(!['invoice','guest-list'].includes(command.clueId))throw new CityRuleError('CITY_HARBOUR_CLUE_UNKNOWN','Choose the harbour invoice or the guest list.');
   if(!city.harbourClues.includes(command.clueId))city.harbourClues.push(command.clueId);
   break;
  }
  case 'city-corner-clue':{
   if(!['receipt','statement'].includes(command.clueId))throw new CityRuleError('CITY_CORNER_CLUE_UNKNOWN','Choose the receipt or the Plug’s statement.');
   if(!city.cornerClues.includes(command.clueId))city.cornerClues.push(command.clueId);
   break;
  }
  case 'city-zone-choice':{
   if(!Object.hasOwn(CITY_ZONE_BY_ID,command.zoneId))throw new CityRuleError('CITY_ZONE_UNKNOWN','Choose a specialist building in a city district.');
   if(Object.hasOwn(city.zoneEndings,command.zoneId))throw new CityRuleError('CITY_ZONE_RESOLVED','This landmark ending is already saved. Read it again without claiming another reward.');
   if(![0,1,2].includes(command.choice))throw new CityRuleError('CITY_ZONE_CHOICE','Choose one of the three landmark endings.');
   if(command.zoneId==='probable-cause'&&(!city.cornerClues.includes('receipt')||!city.cornerClues.includes('statement')))throw new CityRuleError('CITY_CORNER_CLUES_MISSING','Read the receipt inside and hear the Plug’s statement outside first.');
   if(command.zoneId==='yacht-club'&&(!city.harbourClues.includes('invoice')||!city.harbourClues.includes('guest-list')))throw new CityRuleError('CITY_HARBOUR_CLUES_MISSING','Read the invoice in the harbour office and ask Oscar for the guest list outside first.');
   const reward=CITY_ZONE_BY_ID[command.zoneId].choices[command.choice].reward;
   if(award(`city-zone:${command.zoneId}`,reward.packs||0)){
    city.influence+=reward.influence||0;s.career.scrap+=reward.scrap||0;city.zoneEndings[command.zoneId]=command.choice;
   }
   break;
  }
  case 'city-event-start':{if(!Object.hasOwn(CITY_EVENT_BY_ID,command.eventId))throw new CityRuleError('CITY_EVENT_UNKNOWN','Choose one of the twenty city events.');if(city.activeEvent&&!Object.hasOwn(city.eventEndings,city.activeEvent.eventId))throw new CityRuleError('CITY_EVENT_ACTIVE','Resolve the active incident first.');city.activeEvent={eventId:command.eventId,startedAt:now.toISOString(),endsAt:new Date(now.getTime()+300000).toISOString()};break;}
  case 'city-event-choice':{if(city.activeEvent?.eventId!==command.eventId||!Object.hasOwn(CITY_EVENT_BY_ID,command.eventId))throw new CityRuleError('CITY_EVENT_MISSING','Start this city event first.');if(Object.hasOwn(city.eventEndings,command.eventId))throw new CityRuleError('CITY_EVENT_RESOLVED','This ending was already saved. Replays do not grant rewards.');if(![0,1,2].includes(command.choice))throw new CityRuleError('CITY_EVENT_CHOICE','Choose one of the three endings.');if(award(`city-event:${command.eventId}`,command.choice===0?1:0)){if(command.choice===1)city.influence+=25;if(command.choice===2)s.career.scrap+=6;city.eventEndings[command.eventId]=command.choice;}break;}
  case 'city-sign':{const index=requirePlot(s,command.plot);if(!city.plots[index])throw new CityRuleError('CITY_EMPTY_PLOT','Build this address first.');if(command.text===null){delete city.signs[String(index)];break;}const text=command.text.trim().replace(/[\u0000-\u001f\u007f]/g,'');if(!text||text.length>24)throw new CityRuleError('CITY_SIGN_TEXT','Use 1 to 24 visible characters.');city.signs[String(index)]=text;break;}
  case 'city-incident':{if(Object.hasOwn(city.incidents,command.kind))throw new CityRuleError('CITY_INCIDENT_RESOLVED','This incident already has an ending. Replays do not grant rewards.');if(!city.plots.some(b=>b?.kind===command.kind&&b.residentId))throw new CityRuleError('CITY_INCIDENT_LOCKED','Build this address and assign a resident first.');if(award(`city-incident:${command.kind}`,command.choice===0?1:0)){if(command.choice===1)city.influence+=20;city.incidents[command.kind]=command.choice;}break;}
  case 'city-build':{const index=requirePlot(s,command.plot),definition=buildingOf(command.kind);if(!definition)throw new CityRuleError('CITY_UNKNOWN_BUILDING','Choose an available building.');if(city.plots[index]?.kind===command.kind)throw new CityRuleError('CITY_SAME_BUILDING','This building is already here. Upgrade or move it.');spend(city,definition.cost);city.plots[index]={kind:command.kind,level:1,residentId:city.plots[index]?.residentId||null};break;}
  case 'city-upgrade':{const index=requirePlot(s,command.plot),building=city.plots[index];if(!building)throw new CityRuleError('CITY_EMPTY_PLOT','Build something here first.');if(building.level===3)throw new CityRuleError('CITY_MAX_LEVEL','This building is already at level 3.');const level=(building.level+1) as 2|3;spend(city,CITY_BALANCE.upgradeCosts[level]);building.level=level;break;}
  case 'city-assign':{const index=requirePlot(s,command.plot),building=city.plots[index];if(!building)throw new CityRuleError('CITY_EMPTY_PLOT','Build something here first.');const id=command.residentId;if(id&&!Object.hasOwn(CARD_BY_ID,id))throw new CityRuleError('CITY_UNKNOWN_RESIDENT','Choose a known resident.');if(id&&!LOANERS.includes(id)&&(s.inventory[id]?.regular||0)+(s.inventory[id]?.foil||0)<1)throw new CityRuleError('CITY_OWNERSHIP','Assign an owned resident or a free starter loaner.');if(id)for(const other of city.plots)if(other?.residentId===id)other.residentId=null;building.residentId=id;break;}
  case 'city-move':{const from=requirePlot(s,command.from),to=requirePlot(s,command.to);if(from===to||!city.plots[from])throw new CityRuleError('CITY_MOVE_INVALID','Choose another unlocked plot.');[city.plots[from],city.plots[to]]=[city.plots[to],city.plots[from]];const a=city.signs[String(from)],b=city.signs[String(to)];delete city.signs[String(from)];delete city.signs[String(to)];if(a)city.signs[String(to)]=a;if(b)city.signs[String(from)]=b;break;}
  case 'city-collect':{if(!cityCanCollect(city,now))throw new CityRuleError('CITY_PRODUCTION_CLAIMED','Assign residents, then collect once per UTC day. Missed pickups do not stack.');const income=cityProduction(city);city.influence+=income;city.lifetimeGenerated+=income;city.lastProductionDay=now.toISOString().slice(0,10);break;}
  case 'city-accept':{const job=cityJobs(s).find(c=>c.id===command.contractId);if(!job||!job.available)throw new CityRuleError('CITY_STORY_LOCKED','Assign a matching resident and meet this chapter’s building level.');if(city.contracts[job.id])throw new CityRuleError('CITY_JOB_ACCEPTED','This story job is already on your board.');city.contracts[job.id]={startedAt:now.toISOString(),progress:0,claimed:false};break;}
  case 'city-claim':{const job=cityJobs(s).find(c=>c.id===command.contractId);if(!job?.state||!job.available)throw new CityRuleError('CITY_JOB_LOCKED','Keep a matching resident assigned to an eligible building.');if(job.state.claimed)throw new CityRuleError('CITY_JOB_CLAIMED','This neighbourhood reward was already collected.');if(job.state.progress<job.target)throw new CityRuleError('CITY_JOB_INCOMPLETE','Finish this neighbourhood job first.');if(award(`city-job:${job.id}`,job.packs)){city.influence+=job.influence;s.totalXp+=job.xp;}job.state.claimed=true;break;}
  case 'city-epilogue':if(chapterHosts(city,command.kind,3).length===0||!city.contracts[`${command.kind}:2`]?.claimed)throw new CityRuleError('CITY_EPILOGUE_LOCKED','Reach level 3 and finish both story jobs.');if(!city.epilogues.includes(command.kind))city.epilogues.push(command.kind);break;
  case 'city-tutorial':city.tutorialSeen=true;break;
  case 'city-theme':if(!themeUnlocked(city,command.theme))throw new CityRuleError('CITY_THEME_LOCKED','Finish the theme’s neighbourhood milestone first.');city.theme=command.theme;break;
 }
}
export function recordCityActivity(s:Save,before:Save,command:Command){
 const city=s.city;if(!city||!before.city)return;
 if(new Set(city.plots.flatMap(b=>b?[b.kind]:[])).size===6&&!city.unlockedThemes.includes('riot'))city.unlockedThemes.push('riot');
 if(claimedCityJobs(city)>=6&&!city.unlockedThemes.includes('gold'))city.unlockedThemes.push('gold');
 const winner=s.battle.active,previous=before.battle.active;const won=winner?.phase==='finished'&&previous?.phase!=='finished'&&winner.winner==='player'&&winner.mode!=='practice'&&winner.id===previous?.id;
 for(const definition of CONTRACTS){const contract=city.contracts[definition.id];if(!contract||contract.claimed||contract.progress>=definition.target)continue;const hosts=chapterHosts(city,definition.kind,definition.tier);if(hosts.length===0)continue;const actionMatches=definition.event===command.type||definition.event==='win'&&won&&hosts.some(b=>winner!.player.some(f=>f.cardId===b.residentId));if(actionMatches)contract.progress=Math.min(definition.target,contract.progress+1);}
}

export function refineCityEventRewards(s:Save,ctx:z.RefinementCtx){const bad=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});for(const id of Object.keys(s.city?.eventEndings??{}))if(!s.awardedRewardIds.includes(`city-event:${id}`))bad('City event ending requires its reward marker');for(const id of s.awardedRewardIds)if(id.startsWith('city-event:')&&!Object.hasOwn(s.city?.eventEndings??{},id.slice(11)))bad('City event reward requires its saved ending');for(const id of Object.keys(s.city?.zoneEndings??{}))if(!s.awardedRewardIds.includes(`city-zone:${id}`))bad('City landmark ending requires its reward marker');for(const id of s.awardedRewardIds)if(id.startsWith('city-zone:')&&!Object.hasOwn(s.city?.zoneEndings??{},id.slice(10)))bad('City landmark reward requires its saved ending');}
