import {z} from 'zod';
import {airfryerSchema,freshAirfryer,applyAirfryerCommand,refineAirfryer,type AirfryerCommand} from './airfryer';
import {roastSchema,applyRoastCommand,refineRoastSave,type RoastCommand} from './roast';
import {propsSchema,freshProps,PropCommand,applyPropCommand,recordPropActivity,refineProps,PropRuleError} from './props';
import {citySchema,CityCommand,applyCityCommand,recordCityActivity,CityRuleError,plotUnlock,refineCityEventRewards} from './city';
import {battleProgressSchema,freshBattle,createMatch,takeTurn,chooseEnemyAction,surrender,LOANERS,BattleAction,DistrictId,dailyChallenge,DISTRICTS} from './battle';
import {BALANCE,CARDS,CARD_BY_ID,FACTIONS,RARITIES,BASE_CARDS,WAVE_CARDS,CULTURE_CARDS,SETS,setOf,NEW_SET_REWARDS} from '../data/cards';
import {freshActivity,refreshActivity,missionsFor,dayKey,weekKey} from './progression';
const count=z.number().int().nonnegative().safe();
const cardId=z.string().refine(id=>Object.hasOwn(CARD_BY_ID,id),'Unknown resident');
const day=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v);
const pullSchema=z.object({slot:count.max(4),cardId,isNewDiscovery:z.boolean(),regularQuantityAfter:count});
const sessionSchema=z.object({id:z.string(),committedAt:z.string().datetime(),balanceVersion:z.string(),pulls:z.array(pullSchema).length(5),revealedCount:count.max(5),xpEarned:count,unlockedAchievementIds:z.array(z.string())});
const saveFields={
 revision:count,playerId:z.string(),createdAt:z.string().datetime(),updatedAt:z.string().datetime(),alias:z.string().min(2).max(24),
 packBalance:count,lastDailyClaimDate:day.nullable(),inventory:z.record(z.object({regular:count,foil:count})),discoveredCardIds:z.array(cardId),awardedRewardIds:z.array(z.string()),recentCommandIds:z.array(z.string()).max(200),
 lifetimePacksOpened:count,lifetimeCardsPulled:count,lifetimeFusions:count,totalXp:count,pendingOpening:sessionSchema.nullable(),settings:z.object({soundEnabled:z.boolean(),musicEnabled:z.boolean().default(false),volume:z.number().finite().min(0).max(1),motion:z.enum(['system','reduced'])}),
};
const activitySchema=z.object({day,week:day,dailyOpened:count,dailyFusions:count,weeklyOpened:count,weeklyDiscoveries:count,weeklyClaims:count.max(7)});
const careerSchema=z.object({scrap:count.default(0),clout:count.default(0),presets:z.array(z.array(cardId).length(3).refine(ids=>new Set(ids).size===3)).max(3).default([]),mastery:z.record(count).default({}),tutorialSeen:z.boolean().default(false)});
const freshCareer=()=>careerSchema.parse({});
const saveObject=z.object({schemaVersion:z.literal(2),...saveFields,activity:activitySchema,onboardingSeen:z.boolean(),battle:battleProgressSchema.default(freshBattle),career:careerSchema.default(freshCareer),city:citySchema.nullable().default(null),props:propsSchema.default(freshProps),roast:roastSchema.nullable().default(null),airfryer:airfryerSchema.default(freshAirfryer)});
const legacyObject=z.object({schemaVersion:z.literal(1),...saveFields});
function refineSave(s:z.infer<typeof legacyObject>|z.infer<typeof saveObject>,ctx:z.RefinementCtx){
 const bad=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});
 if(Object.keys(s.inventory).some(id=>!Object.hasOwn(CARD_BY_ID,id)))bad('Unknown inventory card');
 if(s.discoveredCardIds.length!==new Set(s.discoveredCardIds).size)bad('Duplicate discoveries');
 if(s.awardedRewardIds.length!==new Set(s.awardedRewardIds).size||s.recentCommandIds.length!==new Set(s.recentCommandIds).size)bad('Duplicate identifiers');
 if(Object.entries(s.inventory).some(([id,q])=>q.regular+q.foil>0&&!s.discoveredCardIds.includes(id)))bad('Owned resident not discovered');
 if(s.lifetimeCardsPulled!==s.lifetimePacksOpened*5)bad('Invalid lifetime pulls');
 if(s.pendingOpening&&s.pendingOpening.pulls.some((p,i)=>p.slot!==i))bad('Invalid reveal order');
}
export const saveSchema=saveObject.superRefine((s,ctx)=>{refineSave(s,ctx);refineAirfryer(s,ctx);refineRoastSave(s,ctx);refineProps(s,ctx);refineCityEventRewards(s,ctx);for(const kind of Object.keys(s.city?.incidents??{}))if(!s.awardedRewardIds.includes(`city-incident:${kind}`))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Incident ending requires reward marker'});for(const id of s.awardedRewardIds)if(id.startsWith('city-incident:')&&!Object.hasOwn(s.city?.incidents??{},id.slice(14)))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Incident reward requires ending'});if(s.city){if(s.city.plots.some((b,i)=>b&&!plotUnlock(s,i).unlocked))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Building occupies a locked plot'});for(const b of s.city.plots)if(b?.residentId&&!LOANERS.includes(b.residentId)&&quantity(s,b.residentId).regular+quantity(s,b.residentId).foil<1)ctx.addIssue({code:z.ZodIssueCode.custom,message:'City resident must be owned'});for(const [id,c] of Object.entries(s.city.contracts))if(c.claimed&&!s.awardedRewardIds.includes(`city-job:${id}`))ctx.addIssue({code:z.ZodIssueCode.custom,message:'City claims and rewards must agree'});}if(s.awardedRewardIds.some(id=>id.startsWith('city-job:')&&!s.city?.contracts[id.slice(9)]?.claimed))ctx.addIssue({code:z.ZodIssueCode.custom,message:'City reward requires a claimed contract'});if(s.battle.clearedDistrictIds.some(id=>!s.awardedRewardIds.includes(`battle:${id}`))||s.awardedRewardIds.some(id=>id.startsWith('battle:')&&!s.battle.clearedDistrictIds.includes(id.slice(7) as DistrictId)))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Battle rewards and clears must agree'});if(s.battle.active?.player.some(f=>!LOANERS.includes(f.cardId)&&quantity(s,f.cardId).regular+quantity(s,f.cardId).foil<1))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Battle squad contains an unowned resident'});if(weekKey(new Date(s.activity.day+'T00:00:00Z'))!==s.activity.week)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Week must start on Monday UTC'});});
export const legacySaveSchema=legacyObject.superRefine(refineSave);
export type Save=z.infer<typeof saveSchema>;
export function decodeSave(raw:unknown,now=new Date()):Save{if(raw&&typeof raw==='object'&&'schemaVersion' in raw&&raw.schemaVersion===1){const old=legacySaveSchema.parse(raw);return saveSchema.parse({...old,schemaVersion:2,activity:freshActivity(now),onboardingSeen:true});}if(raw&&typeof raw==='object'&&!('props' in raw)&&'awardedRewardIds' in raw&&Array.isArray(raw.awardedRewardIds)){const props=freshProps();props.ownedIds=raw.awardedRewardIds.filter((id:unknown):id is string=>typeof id==='string'&&id.startsWith('prop:')).map(id=>id.slice(5));return saveSchema.parse({...raw,props});}return saveSchema.parse(raw);}
export type Pull=z.infer<typeof pullSchema>;
export class GameError extends Error {constructor(public code:string,message:string){super(message);}}
export const utcDate=(date:Date)=>date.toISOString().slice(0,10);
export const dailyEligible=(s:Save,now:Date)=>utcDate(now)>=s.activity.day&&(!s.lastDailyClaimDate||s.lastDailyClaimDate<utcDate(now));
export const quantity=(s:Save|null,id:string)=>s?.inventory[id]||{regular:0,foil:0};
export function initialSave(now:Date,id:string):Save{return {schemaVersion:2,revision:0,playerId:id,createdAt:now.toISOString(),updatedAt:now.toISOString(),alias:'LOCAL MENACE',packBalance:BALANCE.welcomePacks,lastDailyClaimDate:null,inventory:{},discoveredCardIds:[],awardedRewardIds:['welcome'],recentCommandIds:[],lifetimePacksOpened:0,lifetimeCardsPulled:0,lifetimeFusions:0,totalXp:0,pendingOpening:null,settings:{soundEnabled:false,musicEnabled:false,volume:.35,motion:'system'},activity:freshActivity(now),onboardingSeen:false,battle:freshBattle(),career:freshCareer(),city:null,props:freshProps(),roast:null,airfryer:freshAirfryer()};}
export function validateCatalogue(){
 if(CARDS.length!==SETS.reduce((n,s)=>n+s.count,0)||new Set(CARDS.map(c=>c.id)).size!==CARDS.length||SETS.some(s=>CARDS.filter(c=>setOf(c)===s.id).length!==s.count))throw new Error('Invalid catalogue');
 if(Math.abs(RARITIES.reduce((n,r)=>n+r.weight,0)-1)>1e-10)throw new Error('Invalid weights');
 for(const r of RARITIES)if(!Number.isFinite(r.weight)||r.weight<0||(r.weight>0&&!CARDS.some(c=>c.rarity===r.id)))throw new Error('Invalid rarity pool');
 for(const f of FACTIONS)if(BASE_CARDS.filter(c=>c.faction===f.id).length!==5||WAVE_CARDS.filter(c=>c.faction===f.id).length!==2)throw new Error('Invalid faction');
}
export function rollPack(random:()=>number):string[]{return Array.from({length:BALANCE.packSize},()=>{
 const n=random();if(!Number.isFinite(n)||n<0||n>=1)throw new Error('RNG must return [0,1)');
 let total=0;const rarity=RARITIES.find(r=>(total+=r.weight)>n)||RARITIES.at(-1)!;
 const pool=CARDS.filter(c=>c.rarity===rarity.id),pick=random();if(!Number.isFinite(pick)||pick<0||pick>=1)throw new Error('Invalid card RNG');
 return pool[Math.floor(pick*pool.length)].id;
});}
export type Command={type:'battle-upgrade';matchId:string;step:number;newMatchId:string}|AirfryerCommand|RoastCommand|PropCommand|CityCommand|{type:'daily'}|{type:'open';sessionId:string}|{type:'reveal';count:number}|{type:'acknowledge'}|{type:'fuse';cardId:string}|{type:'claim-mission';missionId:string}|{type:'battle-start';matchId:string;districtId:DistrictId;team:string[];tacticDeck?:import('./duel-rules').DuelCardId[];rulesVersion?:4|5;mode?:'campaign'|'daily'|'practice';challengeKey?:string}|{type:'preset';team:string[];slot:number}|{type:'battle-tutorial'}|{type:'recycle';cardId:string}|{type:'craft';cardId:string}|{type:'battle-act';matchId:string;step:number;action:BattleAction}|{type:'battle-enemy';matchId:string;step:number}|{type:'battle-surrender';matchId:string}|{type:'battle-leave';matchId:string}|{type:'finish-onboarding'}|{type:'settings';settings:Partial<Save['settings']>;alias?:string}|{type:'clout-scheme';scheme:'safe'|'risk'|'grift'}|{type:'timeline-ratio';threadId:string};
export function applyCommand(current:Save,command:Command,now:Date,random:()=>number,commandId:string,expectedRevision:number):Save{
 if(current.recentCommandIds.includes(commandId))return current;
 if(current.revision!==expectedRevision)throw new GameError('STALE_REVISION','Your city changed in another tab. Try again.');
 const s=structuredClone(current);refreshActivity(s,now);
 const award=(id:string,packs:number)=>{if(!s.awardedRewardIds.includes(id)){s.awardedRewardIds.push(id);s.packBalance+=packs;return true;}return false;};
 if(command.type.startsWith('city-')){try{applyCityCommand(s,command as CityCommand,now,award);}catch(e){if(e instanceof CityRuleError)throw new GameError(e.code,e.message);throw e;}}else if(command.type.startsWith('prop-')){try{applyPropCommand(s,command as PropCommand);}catch(e){if(e instanceof PropRuleError)throw new GameError(e.code,e.message);throw e;}}else switch(command.type){
  case 'airfryer-start':case 'airfryer-choose':case 'airfryer-argue':try{applyAirfryerCommand(s,command,now,award);}catch(e){throw new GameError('AIRFRYER_CASE',e instanceof Error?e.message:'This case action is unavailable.');}break;
  case 'roast-start':case 'roast-act':case 'roast-enemy':case 'roast-resolve':case 'roast-surrender':case 'roast-leave':try{applyRoastCommand(s,command,now,award);}catch(e){throw new GameError('INVALID_ROAST_ACTION',e instanceof Error?e.message:'This roast action is unavailable.');}break;
  case 'daily':if(dayKey(now)<s.activity.day)throw new GameError('CLOCK_ROLLBACK','Your device clock moved backwards. Return to the current date to claim timed rewards.');if(!dailyEligible(s,now))throw new GameError('DAILY_ALREADY_CLAIMED','Already collected. Return after the next reset.');s.lastDailyClaimDate=utcDate(now);award(`daily:${utcDate(now)}`,BALANCE.dailyPacks);if(s.activity.week===weekKey(now))s.activity.weeklyClaims++;break;
  case 'open':{
   if(s.pendingOpening)throw new GameError('OPENING_IN_PROGRESS','Finish your current pack first.');
   if(s.packBalance<1)throw new GameError('NO_PACKS','No packs left. Claim your daily pack or complete a faction.');
   s.packBalance--;let discoveries=0;
   const pulls:Pull[]=rollPack(random).map((id,slot)=>{const isNewDiscovery=!s.discoveredCardIds.includes(id);if(isNewDiscovery){s.discoveredCardIds.push(id);discoveries++;}const q=s.inventory[id]||{regular:0,foil:0};s.inventory[id]={...q,regular:q.regular+1};return {slot,cardId:id,isNewDiscovery,regularQuantityAfter:q.regular+1};});
   if(s.activity.day===dayKey(now))s.activity.dailyOpened++;if(s.activity.week===weekKey(now)){s.activity.weeklyOpened++;s.activity.weeklyDiscoveries+=discoveries;}
   s.lifetimePacksOpened++;s.lifetimeCardsPulled+=BALANCE.packSize;const xpEarned=BALANCE.packXp+discoveries*BALANCE.discoveryXp;s.totalXp+=xpEarned;const unlocked:string[]=[];
   if(s.lifetimePacksOpened>=5&&award('first-five',1))unlocked.push('first-five');
   for(const f of FACTIONS)if(BASE_CARDS.filter(c=>c.faction===f.id).every(c=>s.discoveredCardIds.includes(c.id))&&award(`faction:${f.id}`,1))unlocked.push(`faction:${f.id}`);
   if(BASE_CARDS.every(c=>s.discoveredCardIds.includes(c.id))&&award('complete-city',3))unlocked.push('complete-city');
   for(const f of FACTIONS)if(WAVE_CARDS.filter(c=>c.faction===f.id).every(c=>s.discoveredCardIds.includes(c.id))&&award(`wave-two:${f.id}`,1))unlocked.push(`wave-two:${f.id}`);
   if(WAVE_CARDS.every(c=>s.discoveredCardIds.includes(c.id))&&award('complete-wave-two',3))unlocked.push('complete-wave-two');if(CULTURE_CARDS.every(c=>s.discoveredCardIds.includes(c.id))&&award('complete-culture',3))unlocked.push('complete-culture');
   s.pendingOpening={id:command.sessionId,committedAt:now.toISOString(),balanceVersion:BALANCE.version,pulls,revealedCount:0,xpEarned,unlockedAchievementIds:unlocked};break;
  }
  case 'reveal':if(!s.pendingOpening)throw new GameError('NO_SESSION','No pack to reveal.');s.pendingOpening.revealedCount=Math.max(s.pendingOpening.revealedCount,Math.min(5,Math.max(0,Math.floor(command.count))));break;
  case 'acknowledge':if(!s.pendingOpening)return current;if(s.pendingOpening.revealedCount<5)throw new GameError('NOT_REVEALED','Reveal all five residents first.');s.pendingOpening=null;break;
  case 'fuse':{if(!Object.hasOwn(CARD_BY_ID,command.cardId))throw new GameError('INVALID_CARD','Unknown resident.');const q=quantity(s,command.cardId);if(q.regular<BALANCE.fusionCost)throw new GameError('INSUFFICIENT_COPIES','You need three regular copies to fuse.');s.inventory[command.cardId]={regular:q.regular-BALANCE.fusionCost,foil:q.foil+1};s.totalXp+=BALANCE.fusionXp;s.lifetimeFusions++;if(s.activity.day===dayKey(now))s.activity.dailyFusions++;break;}
  case 'claim-mission':{const m=missionsFor(s,now).find(m=>m.id===command.missionId);if(!m||m.automatic)throw new GameError('INVALID_MISSION','This reward is not claimable.');if(m.kind!=='journey'&&dayKey(now)<s.activity.day)throw new GameError('CLOCK_ROLLBACK','Your device clock moved backwards. Return to the current date to claim timed rewards.');if(m.claimed)throw new GameError('MISSION_CLAIMED','You already collected this reward.');if(m.progress<m.target)throw new GameError('MISSION_INCOMPLETE','Finish this job before collecting the reward.');award(m.rewardId,m.packs);s.totalXp+=m.xp;break;}
  case 'battle-upgrade':{
   const old=s.battle.active;
   if(!old||old.id!==command.matchId||old.step!==command.step)throw new GameError('BATTLE_TURN_CHANGED','This battle changed. Reload before restarting.');
   if(old.rulesVersion>=5||old.phase==='finished')throw new GameError('INVALID_BATTLE_ACTION','Only an unfinished older battle can restart under the new rules.');
   if(s.roast&&s.roast.phase!=='finished')throw new GameError('ROAST_ACTIVE','Resume Roast Night, or play separate practice.');
   s.battle.active=createMatch(command.newMatchId,old.districtId,old.player.map(f=>f.cardId),{version:5,mode:old.mode,challengeKey:old.challengeKey});break;
  }
  case 'battle-start':{
   if(s.roast&&s.roast.phase!=='finished')throw new GameError('ROAST_ACTIVE','Finish or surrender Roast Night first.');
   if(s.battle.active&&s.battle.active.phase!=='finished')throw new GameError('BATTLE_ACTIVE','Finish or surrender your saved battle first.');
   if(command.team.some(id=>!LOANERS.includes(id)&&quantity(s,id).regular+quantity(s,id).foil<1))throw new GameError('BATTLE_OWNERSHIP','Use owned residents or the three starter loaners.');
   const mode=command.mode||'campaign';const index=DISTRICTS.findIndex(d=>d.id===command.districtId);if(mode==='campaign'&&index>0&&!command.challengeKey?.startsWith('rival:')&&!s.battle.clearedDistrictIds.includes(command.districtId)&&!s.battle.clearedDistrictIds.includes(DISTRICTS[index-1].id))throw new GameError('DISTRICT_LOCKED','Clear the preceding district first, or choose practice.');const challenge=dailyChallenge(now);
   s.battle.active=createMatch(command.matchId,mode==='daily'?challenge.districtId:command.districtId,command.team,{version:command.rulesVersion??3,tacticDeck:command.tacticDeck,mode,challengeKey:command.challengeKey||(mode==='daily'?challenge.key:null)});break;
  }
  case 'battle-act':case 'battle-enemy':case 'battle-surrender':case 'battle-leave':{
   const match=s.battle.active;
   if(!match||match.id!==command.matchId)throw new GameError('BATTLE_MISSING','This battle is no longer active.');
   if(command.type==='battle-leave'){if(match.phase!=='finished')throw new GameError('BATTLE_ACTIVE','Finish or surrender before leaving.');s.battle.active=null;break;}
   if(command.type!=='battle-surrender'&&command.step!==match.step)throw new GameError('BATTLE_TURN_CHANGED','This battle has advanced. Use the current turn.');
   let next;try{next=command.type==='battle-surrender'?surrender(match):command.type==='battle-enemy'?takeTurn(match,'enemy',chooseEnemyAction(match)):takeTurn(match,'player',command.action);}catch(e){throw new GameError('INVALID_BATTLE_ACTION',e instanceof Error?e.message:'This action is unavailable.');}
   if(next.phase==='finished'){
    if(next.winner==='player'){
     if(next.mode!=='practice'){s.battle.wins++;s.career.clout=(s.career.clout||0)+50;}
     if(next.mode==='campaign'&&!next.challengeKey?.startsWith('rival:')&&award(`battle:${next.districtId}`,1)){s.battle.clearedDistrictIds.push(next.districtId);s.totalXp+=50;next.reward={packs:1,xp:50};}

     if(next.mode!=='practice'){
      for(const f of next.player){s.career.mastery[f.cardId]=(s.career.mastery[f.cardId]||0)+1;for(const threshold of [3,10])if(s.career.mastery[f.cardId]>=threshold&&award(`mastery:${f.cardId}:${threshold}`,1)){next.reward.packs++;next.reward.xp+=20;s.totalXp+=20;}}
      if(next.mode==='daily'&&award(`daily-battle:${next.challengeKey}`,1)){next.reward.packs++;next.reward.xp+=25;s.totalXp+=25;}
      if(next.challengeKey?.startsWith('rival:')){
       const crewKey=next.enemy.map(f=>f.cardId).sort().join(',');
       if(award('rival-crew:'+crewKey,1)){s.career.clout+=450;s.totalXp+=35;next.reward.xp+=35;next.reward.packs++;}

      }
     }
    }else if(next.mode!=='practice')s.battle.losses++;
   }
   s.battle.active=next;break;
  }
  case 'clout-scheme':{
   if(utcDate(now)<s.activity.day)throw new GameError('CLOCK_ROLLBACK','Use the current date for daily schemes.');
   const schemeReward=`scheme-${command.scheme}:${utcDate(now)}`;
   if(s.awardedRewardIds.includes(schemeReward))throw new GameError('SCHEME_CLAIMED','This sponsor action is already claimed today.');
   if(command.scheme!=='risk')award(schemeReward,0);
   if(command.scheme==='safe'){s.career.clout=(s.career.clout||0)+40;s.totalXp+=10;}
   else if(command.scheme==='risk'){s.career.clout=(s.career.clout||0)+250;s.totalXp+=35;award(`scheme-risk:${utcDate(now)}`,1);}
   else if(command.scheme==='grift'){s.career.clout=(s.career.clout||0)+150;s.totalXp+=20;}
   break;
  }
  case 'timeline-ratio':{
   const rewardId=`ratio:${command.threadId}`;
   if(award(rewardId,0)){s.career.clout=(s.career.clout||0)+35;s.totalXp+=5;}
   break;
  }
  case 'battle-tutorial':s.career.tutorialSeen=true;break;
  case 'preset':if(command.slot<0||command.slot>2||!Number.isInteger(command.slot)||command.team.length!==3||new Set(command.team).size!==3||command.team.some(id=>!CARD_BY_ID[id]||(!LOANERS.includes(id)&&quantity(s,id).regular+quantity(s,id).foil<1)))throw new GameError('INVALID_PRESET','Choose three owned residents or loaners.');while(s.career.presets.length<=command.slot)s.career.presets.push([...command.team]);s.career.presets[command.slot]=command.team;break;
  case 'recycle':case 'craft':{const c=Object.hasOwn(CARD_BY_ID,command.cardId)?CARD_BY_ID[command.cardId]:null;if(!c)throw new GameError('INVALID_CARD','Unknown resident.');if(s.pendingOpening||s.battle.active?.phase!=='finished'&&s.battle.active)throw new GameError('BUSY_COLLECTION','Finish your pack or battle before exchanging residents.');const q=quantity(s,c.id);const rates=EXCHANGE[c.rarity];if(command.type==='recycle'){if(q.regular<1||q.regular+q.foil<2)throw new GameError('LAST_COPY','Keep at least one copy of every resident.');s.inventory[c.id]={...q,regular:q.regular-1};s.career.scrap+=rates.recycle;}else{if(s.career.scrap<rates.craft)throw new GameError('NO_SCRAP','Recycle spare regular copies to earn more scrap.');s.career.scrap-=rates.craft;s.inventory[c.id]={...q,regular:q.regular+1};if(!s.discoveredCardIds.includes(c.id)){s.discoveredCardIds.push(c.id);s.totalXp+=BALANCE.discoveryXp;if(s.activity.week===weekKey(now))s.activity.weeklyDiscoveries++;}for(const f of FACTIONS)if(BASE_CARDS.filter(c=>c.faction===f.id).every(c=>s.discoveredCardIds.includes(c.id)))award(`faction:${f.id}`,1);if(BASE_CARDS.every(c=>s.discoveredCardIds.includes(c.id)))award('complete-city',3);for(const f of FACTIONS)if(WAVE_CARDS.filter(c=>c.faction===f.id).every(c=>s.discoveredCardIds.includes(c.id)))award(`wave-two:${f.id}`,1);if(WAVE_CARDS.every(c=>s.discoveredCardIds.includes(c.id)))award('complete-wave-two',3);if(CULTURE_CARDS.every(c=>s.discoveredCardIds.includes(c.id)))award('complete-culture',3);}break;}
  case 'finish-onboarding':s.onboardingSeen=true;break;
  case 'settings':s.settings={...s.settings,...command.settings};if(command.alias!==undefined)s.alias=command.alias;break;
 }
 if(command.type==='open'||command.type==='craft')for(const set of NEW_SET_REWARDS){if(set.cards.every(c=>s.discoveredCardIds.includes(c.id))&&award(set.id,3)&&command.type==='open')s.pendingOpening!.unlockedAchievementIds.push(set.id);}
 recordCityActivity(s,current,command);recordPropActivity(s,current,command);s.revision++;s.updatedAt=now.toISOString();s.recentCommandIds=[...s.recentCommandIds,commandId].slice(-200);return saveSchema.parse(s);
}

export const EXCHANGE={nobody:{recycle:2,craft:20},problematic:{recycle:4,craft:35},'public-menace':{recycle:7,craft:60},uncancelable:{recycle:12,craft:100},'public-enemy':{recycle:20,craft:180}};
