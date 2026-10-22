import {FACTIONS,BASE_CARDS,WAVE_CARDS,CULTURE_CARDS,NEW_SET_REWARDS} from '../data/cards';
import type {Save} from './game';
export const XP_PER_LEVEL=1000;
export const levelForXp=(xp:number)=>1+Math.floor(Math.max(0,Math.trunc(xp))/XP_PER_LEVEL);
export function levelProgress(xp:number){const value=Math.max(0,Math.trunc(xp));return {level:levelForXp(value),current:value%XP_PER_LEVEL,required:XP_PER_LEVEL,percent:value%XP_PER_LEVEL/XP_PER_LEVEL*100};}
export const dayKey=(now:Date)=>now.toISOString().slice(0,10);
export function weekKey(now:Date){const date=new Date(now);date.setUTCDate(date.getUTCDate()-((date.getUTCDay()+6)%7));return dayKey(date);}
export const freshActivity=(now:Date)=>({day:dayKey(now),week:weekKey(now),dailyOpened:0,dailyFusions:0,weeklyOpened:0,weeklyDiscoveries:0,weeklyClaims:0});
export function refreshActivity(save:Save,now:Date){
 const day=dayKey(now),week=weekKey(now);
 if(day>save.activity.day){save.activity.day=day;save.activity.dailyOpened=0;save.activity.dailyFusions=0;}
 if(week>save.activity.week){save.activity.week=week;save.activity.weeklyOpened=0;save.activity.weeklyDiscoveries=0;save.activity.weeklyClaims=0;}
}
export interface Mission {id:string;title:string;description:string;kind:'daily'|'weekly'|'journey';target:number;progress:number;packs:number;xp:number;rewardId:string;claimed:boolean;automatic:boolean}
export function missionsFor(save:Save|null,now:Date):Mission[]{
 const d=save?.activity.day===dayKey(now),w=save?.activity.week===weekKey(now);
 const row=(id:string,title:string,description:string,kind:Mission['kind'],target:number,progress:number,packs:number,xp=0,rewardId?:string,automatic=false):Mission=>{
  const reward=rewardId||`job:${id}:${kind==='daily'?dayKey(now):kind==='weekly'?weekKey(now):'once'}`;
  return {id,title,description,kind,target,progress:Math.min(progress,target),packs,xp,rewardId:reward,claimed:save?.awardedRewardIds.includes(reward)||false,automatic};
 };
 return [
  row('daily-open','Two bad decisions','Open two packs today.','daily',2,d?save!.activity.dailyOpened:0,2),
  row('daily-fuse','Make it shiny','Fuse three regular copies into a foil today.','daily',1,d?save!.activity.dailyFusions:0,1),
  row('weekly-open','Serial offender','Open fifteen packs this UTC week.','weekly',15,w?save!.activity.weeklyOpened:0,5),
  row('weekly-discover','New bad company','Discover five new residents this UTC week.','weekly',5,w?save!.activity.weeklyDiscoveries:0,3),
  row('weekly-claims','Regular visitor','Collect the daily grant on five days this UTC week.','weekly',5,w?save!.activity.weeklyClaims:0,2),
  row('discover-ten','A terrible circle','Discover ten residents.','journey',10,save?.discoveredCardIds.length||0,2),
  row('discover-twenty','The usual suspects','Discover twenty residents.','journey',20,save?.discoveredCardIds.length||0,3),
  row('first-foil','Polished disaster','Create your first foil.','journey',1,save?.lifetimeFusions||0,1),
  row('level-five','Local celebrity','Reach cosmetic level five (4,000 total XP).','journey',5,levelForXp(save?.totalXp||0),2),
  row('first-five','Five bad decisions','Open five packs. Reward granted automatically.','journey',5,save?.lifetimePacksOpened||0,1,0,'first-five',true),
  ...FACTIONS.map(f=>row(`faction:${f.id}`,`${f.name} · City Intake`,'Discover this original faction. Reward granted automatically.','journey',5,BASE_CARDS.filter(c=>c.faction===f.id&&save?.discoveredCardIds.includes(c.id)).length,1,0,`faction:${f.id}`,true)),
  ...FACTIONS.map(f=>row(`wave-two:${f.id}`,`${f.name} · Cult of Personality`,'Discover both new faction residents. Reward granted automatically.','journey',2,WAVE_CARDS.filter(c=>c.faction===f.id&&save?.discoveredCardIds.includes(c.id)).length,1,0,`wave-two:${f.id}`,true)),
  row('complete-culture','Culture collision','Discover all eight Culture Collision residents. Reward granted automatically.','journey',8,CULTURE_CARDS.filter(c=>save?.discoveredCardIds.includes(c.id)).length,3,0,'complete-culture',true),
  ...NEW_SET_REWARDS.map(set=>row(set.id,set.name,`Discover all ${set.cards.length} ${set.name} residents. Reward granted automatically.`,'journey',set.cards.length,set.cards.filter(c=>save?.discoveredCardIds.includes(c.id)).length,3,0,set.id,true)),
  row('complete-wave-two','Cult complete','Discover all 12 Cult of Personality residents. Reward granted automatically.','journey',WAVE_CARDS.length,WAVE_CARDS.filter(c=>save?.discoveredCardIds.includes(c.id)).length,3,0,'complete-wave-two',true),
  row('complete-city','The complete disaster','Discover the 30 City Intake residents. Reward granted automatically.','journey',BASE_CARDS.length,BASE_CARDS.filter(c=>save?.discoveredCardIds.includes(c.id)).length,3,0,'complete-city',true),
 ];
}
export const readyMissions=(save:Save|null,now:Date)=>missionsFor(save,now).filter(m=>!m.automatic&&!m.claimed&&m.progress>=m.target);
