import type {Match,DistrictId} from './battle';
import type {Save} from './game';
import type {Roast} from './roast';

export const REWARD_RULES={
 campaign:{tickets:1,xp:50},daily:{tickets:1,xp:25},rival:{tickets:1,xp:35,clout:450},
 roast:{tickets:1,xp:60},winClout:50,mastery:{tickets:1,xp:20},masteryThresholds:[3,10],
} as const;
export type RewardAmounts={tickets?:number;xp?:number;trash?:number;clout?:number};
export type RewardLine={label:string;amounts:RewardAmounts};
export type MasteryProgress={cardId:string;wins:number;nextThreshold:number|null;remaining:number};
export type RewardPresentation={title:string;lines:RewardLine[];note:string;mastery?:MasteryProgress[]};
export function formatReward(amounts:RewardAmounts){
 return ([['tickets','TICKET'],['xp','XP'],['trash','TRASH'],['clout','CLOUT']] as const)
  .filter(([key])=>(amounts[key]??0)>0)
  .map(([key,label])=>`${amounts[key]} ${label}${key==='tickets'&&amounts[key]!==1?'S':''}`).join(' · ');
}
export function nextMasteryMilestone(wins:number):number|null{return REWARD_RULES.masteryThresholds.find(n=>n>wins)??null;}
const rivalKey=(team:readonly string[])=>'rival-crew:'+ [...team].sort().join(',');
type BattleOffer={mode:Match['mode'];districtId:DistrictId;team:readonly string[];challengeKey?:string|null;enemyTeam?:readonly string[]};
export function battleRewardPreview(save:Save|null,offer:BattleOffer):RewardPresentation{
 if(offer.mode==='practice')return {title:'PRACTICE · NO REWARDS',lines:[],note:'A separate browser save. No tickets, XP, Clout or mastery.'};
 const claimed=(id:string)=>save?.awardedRewardIds.includes(id)??false;
 const rival=offer.challengeKey?.startsWith('rival:')??false;
 const key=rival?offer.enemyTeam?.length===3?rivalKey(offer.enemyTeam):null:offer.mode==='daily'?offer.challengeKey?`daily-battle:${offer.challengeKey}`:null:`battle:${offer.districtId}`;
 const base=rival?REWARD_RULES.rival:offer.mode==='daily'?REWARD_RULES.daily:REWARD_RULES.campaign;
 const available=key!==null&&!claimed(key),lines:RewardLine[]=[];
 if(available)lines.push({label:rival?'First win against this crew':offer.mode==='daily'?'First win today (UTC)':'First district clear',amounts:{tickets:base.tickets,xp:base.xp}});
 lines.push({label:'Every account win',amounts:{clout:REWARD_RULES.winClout+(available&&rival?REWARD_RULES.rival.clout:0)}});
 const mastery=[...new Set(offer.team)].map(cardId=>{
  const wins=save?.career.mastery[cardId]??0,nextThreshold=REWARD_RULES.masteryThresholds.find(n=>!claimed(`mastery:${cardId}:${n}`))??null;
  return {cardId,wins,nextThreshold,remaining:nextThreshold===null?0:Math.max(0,nextThreshold-wins)};
 });
 const thresholds=mastery.reduce((total,f)=>total+REWARD_RULES.masteryThresholds.filter(n=>f.wins+1>=n&&!claimed(`mastery:${f.cardId}:${n}`)).length,0);
 if(thresholds)lines.push({label:`Mastery bonus on this win (${thresholds} ${thresholds===1?'milestone':'milestones'})`,amounts:{tickets:thresholds*REWARD_RULES.mastery.tickets,xp:thresholds*REWARD_RULES.mastery.xp}});
 return {title:'IF YOU WIN',lines,mastery,note:offer.team.length!==3?'Choose three fighters to preview their mastery bonuses.':available?'First-clear rewards are granted once. Every fighter gains one mastery win, including the bench.':key===null?'Choose a dated daily challenge or a valid rival crew to preview its first-win reward.':'First-clear reward already collected. Every fighter still gains one mastery win.'};
}

/** Match totals are the receipt. Infer a split only when it matches these rules exactly. */
export function battleRewardResult(match:Match):RewardPresentation{
 if(match.mode==='practice')return {title:'PRACTICE COMPLETE',lines:[],note:'No account rewards. Your collection is unchanged.'};
 if(match.winner!=='player')return {title:'NO REWARD THIS MATCH',lines:[],note:'Your fighters stay in your collection. Try a different crew or tactic.'};
 const recorded={tickets:match.reward.packs,xp:match.reward.xp};
 const legacy={title:'REWARD SAVED',lines:formatReward(recorded)?[{label:'Recorded match reward',amounts:recorded}]:[],note:'This saved match has no detailed reward receipt.'};
 if(match.rulesVersion<5||match.rosterVersion<5)return legacy;
 const rival=match.challengeKey?.startsWith('rival:')??false;
 const base=rival?REWARD_RULES.rival:match.mode==='daily'?REWARD_RULES.daily:REWARD_RULES.campaign;
 const candidates=[false,true].flatMap(first=>{
  const bonus=recorded.tickets-(first?base.tickets:0);
  return Number.isInteger(bonus)&&bonus>=0&&bonus<=match.player.length*REWARD_RULES.masteryThresholds.length&&recorded.xp===(first?base.xp:0)+bonus*REWARD_RULES.mastery.xp?[{first,bonus}]:[];
 });
 if(candidates.length!==1)return legacy;
 const {first,bonus}=candidates[0],lines:RewardLine[]=[];
 if(first)lines.push({label:rival?'First rival clear':match.mode==='daily'?'First daily win':'First district clear',amounts:{tickets:base.tickets,xp:base.xp}});
 if(bonus)lines.push({label:`Mastery (${bonus} ${bonus===1?'milestone':'milestones'})`,amounts:{tickets:bonus,xp:bonus*REWARD_RULES.mastery.xp}});
 lines.push({label:'Win reputation',amounts:{clout:REWARD_RULES.winClout+(rival&&first?REWARD_RULES.rival.clout:0)}});
 return {title:'REWARD SAVED',lines,note:`All three fighters gained one mastery win.${!first?' First-clear rewards were already collected.':''}`};
}
export function roastRewardPreview(save:Save|null,practice=false):RewardPresentation{
 if(practice)return {title:'PRACTICE · NO REWARDS',lines:[],note:'Your account and collection stay unchanged.'};
 const claimed=save?.awardedRewardIds.includes('encounter:roast-night')??false;
 return {title:claimed?'ENCORE · NO NEW REWARD':'FIRST SHOW WIN',lines:claimed?[]:[{label:'Clear all three acts',amounts:REWARD_RULES.roast}],note:claimed?'Your first-clear reward was already collected. Play again for the show.':'One reward per account. Encores give no tickets, XP or mastery.'};
}
export function roastRewardResult(roast:Roast,practice=false):RewardPresentation{
 if(practice)return {title:'PRACTICE COMPLETE',lines:[],note:'No account rewards. Your collection is unchanged.'};
 if(roast.rewarded)return {title:'FIRST-CLEAR REWARD SAVED',lines:[{label:'All three acts cleared',amounts:REWARD_RULES.roast}],note:'Your ticket is ready in Packs. This show gives no mastery or Clout.'};
 return {title:roast.winner==='player'?'ENCORE COMPLETE':'NO REWARD THIS SHOW',lines:[],note:roast.winner==='player'?'Your first-clear reward was already collected.':'Your collection is safe. Try another delivery or tag in a backup.'};
}
