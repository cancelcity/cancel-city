import {duelStateSchema,freshDuel,duelStats,TACTICAL_DECK} from './duel-rules';
import {takeDuelTurn,chooseDuelAction} from './duel';
import {z} from 'zod';
import {DUOS} from '../data/duos';
import {KITS} from '../data/combat-kit';
import {CARD_BY_ID,Card,FactionId,BASE_CARDS,WAVE_CARDS,CULTURE_CARDS,CARDS} from '../data/cards';

export const LOANERS=['CC001','CC008','CC015'];
export const DISTRICTS=[
 {id:'street',name:'Comment Section',tag:'01 · STREET LEVEL',description:'Three loud strangers. One very bad thread.',crew:['CC003','CC007','CC028'],scale:.85},
 {id:'media',name:'Outrage Network',tag:'02 · PRIME TIME',description:'The cameras are rolling. Make it everyone’s problem.',crew:['CC001','CC009','CC019'],scale:1},
 {id:'corporate',name:'Corporate Hell',tag:'03 · HOSTILE TAKEOVER',description:'Mandatory wellness. Optional morals.',crew:['CC006','CC008','CC010'],scale:1},
 {id:'crypto',name:'Rug Alley',tag:'04 · EXIT LIQUIDITY',description:'The price is always someone else’s problem.',crew:['CC021','CC023','CC024'],scale:1.02},
 {id:'city-hall',name:'Cancel City Hall',tag:'05 · PUBLIC HEARING',description:'ENDGAME. Bring a collected squad; starter-heavy crews will struggle.',crew:['CC010','CC026','CC030'],scale:1.1},
 {id:'algorithm',name:'The Algorithm',tag:'06 · FINAL HEADLINE',description:'FINAL BOSS. Build synergy, manage hype and change the ending.',crew:['CC020','CC025','CC005'],scale:1.07},
] as const;
export type DistrictId=typeof DISTRICTS[number]['id'];
export type Side='player'|'enemy';
export const districtOf=(id:DistrictId)=>DISTRICTS.find(d=>d.id===id)!;
const resident=z.string().refine(id=>Object.hasOwn(CARD_BY_ID,id),'Unknown battle resident');
const integer=z.number().int().nonnegative().safe();
const fighterSchema=z.object({cardId:resident,hp:integer.max(200),charge:integer.max(3),guard:z.union([z.literal(0),z.literal(.35),z.literal(.6)]),weakened:z.boolean(),exposed:z.boolean().default(false),passiveUsed:z.boolean().default(false),summoned:z.boolean().default(true),stance:z.enum(['attack','defense']).default('attack')});
const eventSchema=z.object({step:integer,side:z.enum(['player','enemy']),kind:z.enum(['attack','ability','guard','switch','surrender']),actor:integer.max(2),targetSide:z.enum(['player','enemy']),target:integer.max(2),damage:integer.max(200),heal:integer.max(200),knockout:z.boolean(),title:z.string(),text:z.string(),style:z.string().default('ratio'),passive:z.string().default(''),duoId:z.string().nullable().default(null),partnerId:resident.nullable().default(null),lpDamage:integer.max(200).default(0),reaction:z.string().default('')});
export const matchSchema=z.object({
 rosterVersion:z.union([z.literal(1),z.literal(2),z.literal(3),z.literal(4),z.literal(5)]).default(1),dailyPoolIds:z.array(resident).max(146).default([]),rulesVersion:z.union([z.literal(1),z.literal(2),z.literal(3),z.literal(4),z.literal(5)]),duel:duelStateSchema.nullable().default(null),duoUsed:z.array(z.enum(['player','enemy'])).max(2).default([]),mode:z.enum(['campaign','daily','practice']).default('campaign'),challengeKey:z.string().nullable().default(null),id:z.string().min(1).max(100),districtId:z.enum(['street','media','corporate','crypto','city-hall','algorithm']),
 player:z.array(fighterSchema).length(3),enemy:z.array(fighterSchema).length(3),playerActive:integer.max(2),enemyActive:integer.max(2),
 phase:z.enum(['player','enemy','finished']),step:integer.max(240),winner:z.enum(['player','enemy']).nullable(),reason:z.enum(['knockout','verdict','surrender','lp']).nullable(),
 events:z.array(eventSchema).max(240),reward:z.object({packs:integer.max(8),xp:integer.max(500)}),
}).superRefine((m,ctx)=>{
 const bad=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});
 for(const side of ['player','enemy'] as const){
  if(new Set(m[side].map(f=>f.cardId)).size!==3)bad('Battle squad contains duplicates');
  if(m[side].some(f=>f.hp>maxHp(f.cardId,m.districtId,side,m.rulesVersion)))bad('Battle health exceeds maximum');
  if(m.rulesVersion<4&&m.phase!=='finished'&&m[side][m[`${side}Active`]].hp<=0)bad('Active resident is knocked out');
 }
 for(const side of ['player','enemy'] as const){const count=m.events.filter(e=>e.side===side&&e.duoId).length;if(count>1||m.duoUsed.includes(side)!==(count===1))bad('Duo use and event must agree');}
 if(m.rulesVersion>=4){
  if(!m.duel)bad('Missing duel state');
  else for(const side of ['player','enemy'] as const){
   const d=m.duel[side],cards=[...d.hand,...d.deck,...d.discard,...(d.trap?[d.trap]:[])];
   if(m.rulesVersion>=5?cards.length!==12||TACTICAL_DECK.some(id=>cards.filter(c=>c===id).length!==TACTICAL_DECK.filter(c=>c===id).length)||d.hand.length>5:cards.length!==8||new Set(cards).size!==8||d.hand.length>5)bad('Invalid duel deck');
   if(m.phase!=='finished'&&d.lp===0)bad('Unfinished duel has no life points');
   if(m.rulesVersion>=5&&d.stars>6)bad('Standard duel stars exceed the cap');
   const field=m[side].filter(f=>f.summoned&&f.hp>0);
   if(field.length&&(!m[side][m[`${side}Active`]].summoned||m[side][m[`${side}Active`]].hp<=0))bad('Invalid duel frontline');
  }
  if(m.rulesVersion>=5&&m.duel&&(m.phase==='player'&&m.duel.turnNumber%2!==1||m.phase==='enemy'&&m.duel.turnNumber%2!==0))bad('Invalid tactical turn');
  if(m.reason==='lp'&&m.duel?.[m.winner==='player'?'enemy':'player'].lp!==0)bad('Life points remain');
 }else if(m.duel)bad('Legacy battle cannot contain duel state');
 if(new Set(m.duoUsed).size!==m.duoUsed.length||m.rulesVersion<3&&m.duoUsed.length)bad('Invalid duo use');
 if(m.events.some(e=>!!e.duoId!==!!e.partnerId))bad('Incomplete duo participants');
 for(const e of m.events)if(e.duoId){const d=DUOS.find(d=>d.id===e.duoId);if(!d||e.kind!=='ability'||!e.partnerId||!d.pair.includes(m[e.side][e.actor].cardId as never)||!d.pair.includes(e.partnerId as never)||e.partnerId===m[e.side][e.actor].cardId||!m[e.side].some(f=>f.cardId===e.partnerId))bad('Invalid duo event');}
 if(m.rosterVersion===5&&m.mode==='daily'&&(m.dailyPoolIds.length<66||new Set(m.dailyPoolIds).size!==m.dailyPoolIds.length))bad('Invalid daily pool snapshot');
 if(m.enemy.some((f,i)=>f.cardId!==crewFor(m.districtId,m.mode,m.challengeKey,m.rosterVersion,m.dailyPoolIds)[i]))bad('Invalid district crew');
 if(m.phase==='finished'?(m.winner===null||m.reason===null):(m.winner!==null||m.reason!==null))bad('Invalid battle outcome');
 if(m.rulesVersion<5&&(m.phase==='player'&&m.step%2!==0||m.phase==='enemy'&&m.step%2!==1))bad('Invalid battle turn');
 if(m.events.length&&m.events.at(-1)!.step!==m.step)bad('Invalid battle event sequence');
 if(m.events.some((e,i)=>e.step>m.step||i>0&&e.step!==m.events[i-1].step+1))bad('Invalid battle event order');
 if(m.phase!=='finished'&&(m.reward.packs||m.reward.xp))bad('Unfinished battle cannot grant rewards');

 if(m.reason==='knockout'&&m[m.winner==='player'?'enemy':'player'].some(f=>f.hp>0))bad('Battle knockout is incomplete');
});
export const battleProgressSchema=z.object({active:matchSchema.nullable(),clearedDistrictIds:z.array(z.enum(['street','media','corporate','crypto','city-hall','algorithm'])).max(6),wins:integer,losses:integer}).superRefine((p,ctx)=>{
 if(new Set(p.clearedDistrictIds).size!==p.clearedDistrictIds.length||p.wins<p.clearedDistrictIds.length)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Invalid battle progress'});
});
export type Fighter=z.infer<typeof fighterSchema>;
export type BattleEvent=z.infer<typeof eventSchema>;
export type Match=z.infer<typeof matchSchema>;
export type BattleProgress=z.infer<typeof battleProgressSchema>;
export type BattleAction={type:'attack'|'receipt'|'ability'|'guard';combo?:number}|{type:'duo';duoId?:string;combo?:number}|{type:'switch';slot:number}|{type:'summon';slot:number;tributeSlot?:number}|{type:'play';cardId:import('./duel-rules').DuelCardId}|{type:'pass'};
export const freshBattle=():BattleProgress=>({active:null,clearedDistrictIds:[],wins:0,losses:0});
const tunedScale:Record<DistrictId,number>={street:.85,media:.86,corporate:.86,crypto:1.05,'city-hall':1.1,algorithm:1.12};
const scaleFor=(district:DistrictId,version:number)=>version>=2?tunedScale[district]:districtOf(district).scale;
export const maxHp=(id:string,district:DistrictId,side:Side,version=1)=>Math.round((65+CARD_BY_ID[id].stats.shame*.3)*(side==='enemy'?scaleFor(district,version):1));
export const attackPower=(id:string,district:DistrictId,side:Side,version=1)=>Math.round((16+CARD_BY_ID[id].stats.clout*.1)*(side==='enemy'?scaleFor(district,version):1));
export const ABILITIES:Record<FactionId,{type:'drain'|'heal'|'shield'|'weaken'|'pierce'|'steal';description:string}>={
 'terminally-online':{type:'drain',description:'Hit harder and remove 1 enemy hype.'},
 'corporate-hell':{type:'heal',description:'Restore composure and block 60% of the next hit.'},
 'international-incidents':{type:'shield',description:'Hit harder and block 35% of the next hit.'},
 'politics-hypocrisy':{type:'weaken',description:'Hit harder and weaken the next enemy hit by 30%.'},
 'crypto-degenerates':{type:'pierce',description:'A heavy hit that ignores the enemy’s guard.'},
 'cursed-society':{type:'steal',description:'Hit harder and restore 18 composure.'},
};
export const abilityOf=(card:Card)=>ABILITIES[card.faction];
export function abilityDescription(card:Card,district:DistrictId='street',side:Side='player',version=2){
 if(version>=2){const k=KITS[card.id],power=attackPower(card.id,district,side,version);return [(k.bonus||!k.heal&&!k.teamHeal)?`${power+k.bonus} base damage`:'',k.heal?`restore ${k.heal} composure`:'',k.teamHeal?`heal each teammate ${k.teamHeal}`:'',k.shield?`guard ${k.shield*100}%`:'',k.drain?`remove ${k.drain} hype`:'',k.weaken?'weaken next hit 30%':'',k.expose?'expose: next incoming hit +25%':'',k.pierce?'ignore guard':'',k.recharge?`refund ${k.recharge} hype`:'',k.cleanse?'clear weakness and exposure':''].filter(Boolean).join(' · ')+'.';}
 const power=attackPower(card.id,district,side,version);
 switch(abilityOf(card).type){
  case 'drain':return `${power+12} base damage. Remove 1 enemy hype.`;
  case 'heal':return `Restore up to ${Math.round(20+card.stats.chaos*.15)} composure. Block 60% of the next hit.`;
  case 'shield':return `${power+10} base damage. Block 35% of the next hit.`;
  case 'weaken':return `${power+15} base damage. Weaken the next enemy hit by 30%.`;
  case 'pierce':return `${power+20} base damage. Ignore the enemy’s guard.`;
  case 'steal':return `${power+8} base damage. Restore up to 18 composure.`;
 }
}
export function crewFor(district:DistrictId,mode:string,key:string|null,rosterVersion=5,snapshot:readonly string[]=[]){
 if(key?.startsWith('rival:')){
  const parts=key.split(':');
  const crewIds=parts[2]?.split(',')??[];
  if(crewIds.length===3&&crewIds.every(id=>Object.hasOwn(CARD_BY_ID,id)))return [...crewIds];
 }
 if(mode!=='daily'||!key)return [...districtOf(district).crew];
 const pool=rosterVersion===5&&snapshot.length?[...snapshot]:(rosterVersion===1?BASE_CARDS:rosterVersion===2?[...BASE_CARDS,...WAVE_CARDS]:rosterVersion===3?[...BASE_CARDS,...WAVE_CARDS,...CULTURE_CARDS]:rosterVersion===4?CARDS.filter(c=>c.number<=66):CARDS).map(c=>c.id),seed=rosterVersion>=4?Array.from(key).reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261):Array.from(key).reduce((n,c)=>n+c.charCodeAt(0),0);return [0,1,2].map(i=>pool[(seed+i*7)%pool.length]);}
export function dailyChallenge(now:Date){return {districtId:'street' as DistrictId,key:now.toISOString().slice(0,10)};}
export function squadBonus(team:string[]){const factions=new Set(team.map(id=>CARD_BY_ID[id].faction));return factions.size===1?'chorus':factions.size===3?'coalition':'none';}
export function createMatch(id:string,districtId:DistrictId,team:string[],options:{version?:1|2|3|4|5;mode?:'campaign'|'daily'|'practice';challengeKey?:string|null}={}):Match{
 const district=DISTRICTS.find(d=>d.id===districtId);
 if(!district||team.length!==3||new Set(team).size!==3||team.some(c=>!Object.hasOwn(CARD_BY_ID,c)))throw new Error('Choose three different residents and a valid district.');
 const squad=(ids:readonly string[],side:Side):Fighter[]=>ids.map((cardId,slot)=>({cardId,hp:maxHp(cardId,districtId,side,options.version||1),charge:(options.version||1)>=2&&squadBonus([...ids])==='chorus'?2:1,guard:(options.version||1)>=2&&squadBonus([...ids])==='coalition'?.35:0,weakened:false,exposed:false,passiveUsed:false,summoned:(options.version||1)<4||options.version===5&&slot===0,stance:'attack'}));
 const duel=(options.version||1)>=4?freshDuel(id,options.version===5?5:4):null;
 if(options.version===5&&duel){duel.player.stars-=duelStats(team[0]).stars;duel.enemy.stars-=duelStats(crewFor(districtId,options.mode||'campaign',options.challengeKey||null)[0]).stars;}
 return matchSchema.parse({rosterVersion:5,dailyPoolIds:options.mode==='daily'?CARDS.map(c=>c.id):[],rulesVersion:options.version||1,duel,mode:options.mode||'campaign',challengeKey:options.challengeKey||null,id,districtId,player:squad(team,'player'),enemy:squad(crewFor(districtId,options.mode||'campaign',options.challengeKey||null),'enemy'),playerActive:0,enemyActive:0,phase:'player',step:0,winner:null,reason:null,events:[],reward:{packs:0,xp:0}});
}
function settle(m:Match){
 for(const side of ['player','enemy'] as const){
  const alive=m[side].findIndex(f=>f.hp>0);
  if(alive<0){m.phase='finished';m.winner=side==='player'?'enemy':'player';m.reason='knockout';return;}
  if(m[side][m[`${side}Active`]].hp===0)m[`${side}Active`]=alive;
 }
 if(m.step>=80){
  const score=(side:Side)=>m[side].reduce((n,f)=>n+(f.hp>0?1:0)+f.hp/maxHp(f.cardId,m.districtId,side,m.rulesVersion)/10,0);
  m.phase='finished';m.winner=score('player')>score('enemy')?'player':'enemy';m.reason='verdict';
 }
}
export function takeTurn(current:Match,side:Side,action:BattleAction):Match{
 if(current.phase!==side)throw new Error('Wait for your turn.');
 if(current.rulesVersion>=4)return takeDuelTurn(current,side,action);
 if(action.type==='summon'||action.type==='play'||action.type==='pass')throw new Error('This saved battle uses the original rules.');
 const m=structuredClone(current),other:Side=side==='player'?'enemy':'player',actorSlot=m[`${side}Active`],targetSlot=m[`${other}Active`],actor=m[side][actorSlot],target=m[other][targetSlot],card=CARD_BY_ID[actor.cardId];
 const comboMultiplier=(action.type!=='switch'&&action.combo&&action.combo>1)?(1+(action.combo-1)*.35):1;
 const event:BattleEvent={lpDamage:0,reaction:'',step:++m.step,side,kind:action.type==='duo'?'ability':action.type==='receipt'?'attack':action.type,actor:actorSlot,targetSide:other,target:targetSlot,damage:0,heal:0,knockout:false,title:'',text:'',style:KITS[card.id].style,passive:'',duoId:null,partnerId:null};
 const hit=(power:number,pierce=false)=>{const damage=Math.max(1,Math.round(power*comboMultiplier*(actor.weakened?.7:1)*(pierce?1:1-target.guard)*(m.rulesVersion>=2&&target.exposed?1.25:1)));actor.weakened=false;target.guard=0;target.exposed=false;event.damage=Math.min(target.hp,damage);target.hp-=event.damage;event.knockout=target.hp===0;};
 const heal=(amount:number)=>{const restored=Math.min(amount,maxHp(actor.cardId,m.districtId,side,m.rulesVersion)-actor.hp);event.heal+=restored;actor.hp+=restored;};
 const power=attackPower(actor.cardId,m.districtId,side,m.rulesVersion);
 switch(action.type){
  case 'attack':hit(power);actor.charge=Math.min(3,actor.charge+1);event.title=comboMultiplier>1?`CALLED OUT! [${action.combo}X COMBO!]`:'CALLED OUT!';if(comboMultiplier>1)event.passive=`COMBO x${action.combo} (+${Math.round((comboMultiplier-1)*100)}% DMG)`;break;
  case 'receipt':hit(power);actor.charge=Math.min(3,actor.charge+1);if(target.hp>0)target.exposed=true;event.title='RECEIPT ENTERED';event.passive='EXPOSED: NEXT HIT +25%';break;
  case 'guard':actor.guard=.6;actor.charge=Math.min(3,actor.charge+1);event.targetSide=side;event.target=actorSlot;event.title=action.combo&&action.combo>1?`PR SHIELD [${action.combo}X COMBO!]`:'PR SHIELD.';if(action.combo&&action.combo>1)event.passive=`COMBO x${action.combo} (PR SHIELD)`;break;
  case 'switch':if(!Number.isInteger(action.slot)||action.slot<0||action.slot>2||action.slot===actorSlot||m[side][action.slot].hp===0)throw new Error('Choose a different standing resident.');m[`${side}Active`]=action.slot;event.targetSide=side;event.target=action.slot;event.title='NEW BAD COMPANY.';break;
  case 'duo':{const duo=availableDuo(m,side,action.duoId);if(!duo)throw new Error('A duo needs 3 active hype, 1 standing partner hype, and an unused combo this fight.');const partner=m[side].find(f=>f.cardId===duo.partnerId)!;actor.charge=0;partner.charge--;m.duoUsed.push(side);hit(power+Math.round(attackPower(partner.cardId,m.districtId,side,m.rulesVersion)*.65)+12);if(target.hp>0)target.weakened=true;event.title=comboMultiplier>1?`${duo.name.toUpperCase()} [${action.combo}X COMBO!]`:duo.name.toUpperCase();event.duoId=duo.id;event.partnerId=partner.cardId;event.passive=comboMultiplier>1?`DUO · ${action.combo}X COMBO`:'DUO · ONCE PER FIGHT';break;}
  case 'ability':{
   if(actor.charge<3)throw new Error('Build 3 hype before using an ability.');actor.charge=0;event.title=comboMultiplier>1?`${card.ability.toUpperCase()} [${action.combo}X COMBO!]`:card.ability.toUpperCase();
   if(m.rulesVersion>=2){
    const k=KITS[card.id],extra=card.faction==='crypto-degenerates'&&!actor.passiveUsed&&target.guard>0?8:0;
    if(k.bonus||!k.heal&&!k.teamHeal)hit(power+k.bonus+extra,!!k.pierce);
    if(extra){actor.passiveUsed=true;event.passive='EXIT LIQUIDITY +8';}
    if(k.heal)heal(k.heal);
    if(k.teamHeal)for(const f of m[side])if(f.hp>0){const before=f.hp;f.hp=Math.min(maxHp(f.cardId,m.districtId,side,m.rulesVersion),f.hp+k.teamHeal);if(f===actor)event.heal+=f.hp-before;}
    if(k.shield)actor.guard=k.shield;
    if(k.drain)target.charge=Math.max(0,target.charge-k.drain);
    if(k.weaken&&target.hp>0)target.weakened=true;
    if(k.expose&&target.hp>0)target.exposed=true;
    if(k.recharge)actor.charge=Math.min(3,k.recharge);
    if(k.cleanse){actor.weakened=false;actor.exposed=false;}
    if(!event.damage){event.targetSide=side;event.target=actorSlot;}
   }else switch(abilityOf(card).type){
    case 'drain':hit(power+12);target.charge=Math.max(0,target.charge-1);break;
    case 'heal':heal(Math.round(20+card.stats.chaos*.15));actor.guard=.6;event.targetSide=side;event.target=actorSlot;break;
    case 'shield':hit(power+10);actor.guard=.35;break;
    case 'weaken':hit(power+15);target.weakened=true;break;
    case 'pierce':hit(power+20,true);break;
    case 'steal':hit(power+8);heal(18);break;
   }
   break;
  }
 }
 if(m.rulesVersion>=2&&!actor.passiveUsed){
  let passive='';
  if(card.faction==='terminally-online'&&action.type==='attack'){target.charge=Math.max(0,target.charge-1);passive='FIRST REPLY −1 HYPE';}
  if(card.faction==='corporate-hell'&&actor.hp<=maxHp(actor.cardId,m.districtId,side,m.rulesVersion)/3){heal(8);passive='EMERGENCY PR +8';}
  if(card.faction==='international-incidents'&&action.type==='guard'){actor.weakened=false;actor.exposed=false;passive='DIPLOMATIC IMMUNITY';}
  if(card.faction==='politics-hypocrisy'&&action.type==='ability'){actor.charge=Math.min(3,actor.charge+1);passive='SPIN CYCLE +1 HYPE';}
  if(card.faction==='cursed-society'&&event.knockout){heal(12);passive='MAIN CHARACTER +12';}
  if(passive){actor.passiveUsed=true;event.passive=passive;}
 }
 event.text=action.type==='switch'?`${card.name} tags in ${CARD_BY_ID[m[side][m[`${side}Active`]].cardId].name}.`:action.type==='guard'?`${card.name} guards the next hit and builds hype.`:event.damage?`${card.name} hits ${CARD_BY_ID[target.cardId].name} for ${event.damage}${event.heal?` and heals ${event.heal}`:''}.${event.knockout?' CANCELLED.':''}`:`${card.name} restores ${event.heal} composure and raises a PR shield.`;
 if(event.partnerId)event.text=`${card.name} + ${CARD_BY_ID[event.partnerId].name}: ${event.title}. ${event.damage} composure damage.${event.knockout?' CANCELLED.':''}`;
 if(event.passive)event.text+=` ${event.passive}.`;m.events=[...m.events,event].slice(-80);m.phase=other;settle(m);return matchSchema.parse(m);
}
export function chooseEnemyAction(m:Match):BattleAction{
 if(m.phase!=='enemy')throw new Error('The city is not acting.');
 if(m.rulesVersion>=4)return chooseDuelAction(m,'enemy');
 if(m.rulesVersion>=2){
  const f=m.enemy[m.enemyActive],choices:BattleAction[]=[{type:'attack'},{type:'guard'},...(f.charge===3?[{type:'ability' as const}]:[]),...(availableDuo(m,'enemy')?[{type:'duo' as const}]:[]),...m.enemy.flatMap((p,i)=>i!==m.enemyActive&&p.hp>0?[{type:'switch' as const,slot:i}]:[])];
  const health=(x:Match,side:Side)=>x[side].reduce((n,p)=>n+p.hp,0);
  const score=(action:BattleAction)=>{const next=takeTurn(m,'enemy',action),e=next.enemy[next.enemyActive],t=next.player[next.playerActive];return next.winner==='enemy'?10000:(health(m,'player')-health(next,'player'))+(health(next,'enemy')-health(m,'enemy'))*.85+(e.charge-f.charge)*4+e.guard*attackPower(t.cardId,m.districtId,'player',m.rulesVersion)*.6+(t.weakened?6:0)+(t.exposed?6:0)+(next.events.at(-1)?.knockout?25:0)-(action.type==='switch'?15:0);};
  return choices.sort((a,b)=>score(b)-score(a))[0];
 }
 const actor=m.enemy[m.enemyActive],target=m.player[m.playerActive],kind=abilityOf(CARD_BY_ID[actor.cardId]).type,power=attackPower(actor.cardId,m.districtId,'enemy');
 if(actor.charge===3&&(kind!=='heal'||actor.hp<maxHp(actor.cardId,m.districtId,'enemy')*.75))return {type:'ability'};
 if(target.hp<=Math.round(power*(actor.weakened?.7:1)*(1-target.guard)))return {type:'attack'};
 if(actor.charge===2&&actor.hp<maxHp(actor.cardId,m.districtId,'enemy')*.4&&!actor.guard)return {type:'guard'};
 return {type:'attack'};
}
export function surrender(current:Match):Match{
 if(current.phase==='finished')throw new Error('This battle is already over.');
 const m=structuredClone(current);m.phase='finished';m.winner='enemy';m.reason='surrender';m.step++;
 m.events=[...m.events,{step:m.step,side:'player' as const,kind:'surrender' as const,actor:m.playerActive,targetSide:'player' as const,target:m.playerActive,damage:0,heal:0,knockout:false,title:'TACTICAL RETREAT.',text:'Your squad leaves the thread. The city takes the win.',lpDamage:0,reaction:'',style:'curse',passive:'',duoId:null,partnerId:null}].slice(-(m.rulesVersion>=5?240:80));return matchSchema.parse(m);
}

export function availableDuos(m:Match,side:Side){if(m.rulesVersion<3||m.duoUsed.includes(side))return [];const active=m[side][m[`${side}Active`]];if(active.hp<=0||active.charge<3||m.rulesVersion>=4&&!active.summoned)return [];return DUOS.flatMap(duo=>{if(!duo.pair.includes(active.cardId as never))return [];const partnerId=duo.pair.find(id=>id!==active.cardId)!;return m[side].some(f=>f.cardId===partnerId&&f.hp>0&&f.charge>=1&&(m.rulesVersion<4||f.summoned))?[{...duo,partnerId}]:[];});}
export function availableDuo(m:Match,side:Side,preferredId?:string){const choices=availableDuos(m,side);return (preferredId?choices.find(d=>d.id===preferredId):choices[0])??null;}
