import {CARD_BY_ID} from '../data/cards';
import {KITS} from '../data/combat-kit';
import {attackPower,availableDuo,matchSchema,maxHp,type BattleAction,type BattleEvent,type Match,type Side} from './battle';
import {duelCard,duelStats,MAX_STARS,TURN_STARS,type DuelCardId} from './duel-rules';

export function frontline(m:Match,side:Side){const f=m[side][m[`${side}Active`]];return f.summoned&&f.hp>0?f:null;}
export function summonCost(m:Match,side:Side,slot:number,tributeSlot?:number){
 const f=m[side][slot];if(!f)throw new Error('Choose a resident.');
 if(tributeSlot!==undefined){const tribute=m[side][tributeSlot];if(tributeSlot===slot||!tribute?.summoned||tribute.hp<=0)throw new Error('Tribute a different surviving summoned resident.');}
 return Math.max(1,duelStats(f.cardId).stars-(tributeSlot===undefined?0:2));
}
export function takeDuelTurn(current:Match,side:Side,action:BattleAction):Match{
 if(current.phase!==side||!current.duel)throw new Error('Wait for your duel turn.');
 if('combo' in action&&action.combo!==undefined&&action.combo!==1)throw new Error('One committed action per turn.');
 const m=structuredClone(current),duel=m.duel!,other:Side=side==='player'?'enemy':'player',self=duel[side],opponent=duel[other];
 const actorSlot=m[`${side}Active`],targetSlot=m[`${other}Active`],actor=frontline(m,side),target=frontline(m,other);
 const event:BattleEvent={step:++m.step,side,kind:'attack',actor:actorSlot,targetSide:other,target:targetSlot,damage:0,heal:0,knockout:false,title:'',text:'',style:actor?KITS[actor.cardId].style:'ratio',passive:'',duoId:null,partnerId:null,lpDamage:0,reaction:''};
 const spend=(cost:number)=>{if(self.stars<cost)throw new Error(`Requires ${cost} stars.`);self.stars-=cost;};
 const requireActor=()=>{if(!actor)throw new Error('Summon a resident before taking this action.');return actor;};
 const discardTrap=()=>{const trap=opponent.trap!;opponent.trap=null;opponent.discard.push(trap);event.reaction=duelCard(trap).name;};
 const counter=()=>{if(opponent.trap!=='ban')return false;discardTrap();event.text='Cease & Desist cancels the effect. Its costs are still spent.';return true;};
 const hit=(power:number,pierce=false)=>{
  const a=requireActor();let damage=power*(a.weakened?.7:1)*(target?.exposed?1.25:1);a.weakened=false;
  if(target){if(!pierce){damage=Math.max(1,damage-(target.stance==='defense'?duelStats(target.cardId).defense:0));damage*=1-target.guard;}target.guard=0;target.exposed=false;}
  if(opponent.trap==='note'){discardTrap();damage*=.5;}
  damage=Math.max(1,Math.round(damage));
  if(target){event.damage=Math.min(target.hp,damage);target.hp-=event.damage;event.knockout=target.hp===0;damage-=event.damage;}
  event.lpDamage=Math.min(opponent.lp,damage);opponent.lp-=event.lpDamage;
 };
 const heal=(amount:number)=>{const a=requireActor(),restored=Math.min(amount,maxHp(a.cardId,m.districtId,side,4)-a.hp);a.hp+=restored;event.heal+=restored;};
 const ownTarget=()=>{event.targetSide=side;event.target=actorSlot;};
 switch(action.type){
  case 'summon':{
   if(!Number.isInteger(action.slot)||action.slot<0||action.slot>2)throw new Error('Choose a reserve resident.');
   const f=m[side][action.slot];if(f.summoned||f.hp<=0)throw new Error('Choose an unsummoned surviving reserve.');
   if(action.tributeSlot!==undefined&&!Number.isInteger(action.tributeSlot))throw new Error('Invalid tribute.');
   spend(summonCost(m,side,action.slot,action.tributeSlot));
   if(action.tributeSlot!==undefined){const t=m[side][action.tributeSlot];t.hp=0;t.guard=0;event.passive=`TRIBUTED ${CARD_BY_ID[t.cardId].name} · −2 STAR COST`;}
   f.summoned=true;f.stance='attack';m[`${side}Active`]=action.slot;event.kind='switch';event.targetSide=side;event.target=action.slot;event.title='SUMMONED!';event.text=`${CARD_BY_ID[f.cardId].name} enters the frontline.`;break;
  }
  case 'switch':{
   if(!Number.isInteger(action.slot)||action.slot===actorSlot||!m[side][action.slot]?.summoned||m[side][action.slot].hp<=0)throw new Error('Choose a different surviving summoned resident.');
   spend(1);m[`${side}Active`]=action.slot;event.kind='switch';event.targetSide=side;event.target=action.slot;event.title='TAG IN!';event.text=`${CARD_BY_ID[m[side][action.slot].cardId].name} takes the frontline. 1 star spent.`;break;
  }
  case 'pass':event.kind='guard';ownTarget();event.title='HOLD THE THREAD';event.text='Pass. Save stars for your next turn.';break;
  case 'attack':case 'receipt':{
   const a=requireActor();if(action.type==='receipt')throw new Error('Play a Receipt from your hand.');
   a.stance='attack';hit(attackPower(a.cardId,m.districtId,side,4));a.charge=Math.min(3,a.charge+1);event.title=target?'CALLED OUT!':'DIRECT ATTACK!';break;
  }
  case 'guard':{const a=requireActor();a.stance='defense';a.charge=Math.min(3,a.charge+1);event.kind='guard';ownTarget();event.title='DEFENSE STANCE';event.text=`${CARD_BY_ID[a.cardId].name} blocks ${duelStats(a.cardId).defense} damage on each hit while defending. +1 hype.`;break;}
  case 'ability':case 'duo':{
   const a=requireActor();if(a.charge<3)throw new Error('Build 3 hype before using a Special.');
   const duo=action.type==='duo'?availableDuo(m,side,action.duoId):null;
   if(action.type==='duo'&&!duo)throw new Error('Duo requires 3 lead hype, 1 summoned partner hype and an unused Duo.');
   a.charge=0;a.stance='attack';event.kind='ability';event.title=duo?duo.name.toUpperCase():CARD_BY_ID[a.cardId].ability.toUpperCase();
   if(duo){const partner=m[side].find(f=>f.cardId===duo.partnerId)!;partner.charge--;m.duoUsed.push(side);event.duoId=duo.id;event.partnerId=duo.partnerId;}
   if(counter())break;
   const power=attackPower(a.cardId,m.districtId,side,4);
   if(duo){hit(power+Math.round(attackPower(duo.partnerId,m.districtId,side,4)*.65)+12);if(target?.hp)target.weakened=true;break;}
   const k=KITS[a.cardId],extra=CARD_BY_ID[a.cardId].faction==='crypto-degenerates'&&!a.passiveUsed&&target&&target.guard>0?8:0;
   if(k.bonus||!k.heal&&!k.teamHeal)hit(power+k.bonus+extra,!!k.pierce);
   if(extra){a.passiveUsed=true;event.passive='EXIT LIQUIDITY +8';}
   if(k.heal)heal(k.heal);
   if(k.teamHeal)for(const f of m[side])if(f.summoned&&f.hp>0){const before=f.hp;f.hp=Math.min(maxHp(f.cardId,m.districtId,side,4),f.hp+k.teamHeal);if(f===a)event.heal+=f.hp-before;}
   if(k.shield)a.guard=k.shield;if(k.drain&&target)target.charge=Math.max(0,target.charge-k.drain);
   if(k.weaken&&target?.hp)target.weakened=true;if(k.expose&&target?.hp)target.exposed=true;
   if(k.recharge)a.charge=Math.min(3,k.recharge);if(k.cleanse){a.weakened=false;a.exposed=false;}
   if(!event.damage&&!event.lpDamage)ownTarget();break;
  }
  case 'play':{
   const index=self.hand.indexOf(action.cardId);if(index<0)throw new Error('That card is not in your hand.');
   const card=duelCard(action.cardId);if(card.kind!=='spell'&&self.trap)throw new Error('You already have a set trap.');
   if(card.kind==='spell')requireActor();spend(card.cost);self.hand.splice(index,1);event.title=card.name.toUpperCase();
   if(card.kind!=='spell'){self.trap=card.id as 'note'|'ban';event.kind='guard';ownTarget();event.text=`${card.name} set. It triggers automatically when its condition is met.`;break;}
   self.discard.push(card.id);
   const a=requireActor(),hostile=card.id==='receipt'||card.id==='leak'||card.id==='ratio';
   if(hostile){a.stance='attack';if(counter())break;}
   const power=attackPower(a.cardId,m.districtId,side,4);
   switch(card.id){
    case 'receipt':hit(power);if(target?.hp)target.exposed=true;break;
    case 'leak':hit(power+10,true);break;
    case 'ratio':hit(power-5);if(target?.hp)target.weakened=true;break;
    case 'apology':heal(20);a.charge=Math.min(3,a.charge+1);ownTarget();break;
    case 'lawyer':a.stance='defense';a.guard=.35;event.kind='guard';ownTarget();event.text='Defense stance + a temporary 35% shield for the next hit.';break;
    case 'charity':for(const f of m[side])if(f.summoned&&f.hp>0){const before=f.hp;f.hp=Math.min(maxHp(f.cardId,m.districtId,side,4),f.hp+12);event.heal+=f.hp-before;}ownTarget();break;
   }
   break;
  }
 }
 // Preserve authored faction passives without granting them to unsummoned reserves.
 if(actor&&actor.hp>0&&!actor.passiveUsed&&!event.reaction.includes('Cease')){
  const faction=CARD_BY_ID[actor.cardId].faction;let passive='';
  if(faction==='terminally-online'&&action.type==='attack'&&target){target.charge=Math.max(0,target.charge-1);passive='FIRST REPLY −1 HYPE';}
  if(faction==='corporate-hell'&&actor.hp<=maxHp(actor.cardId,m.districtId,side,4)/3){heal(8);passive='EMERGENCY PR +8';}
  if(faction==='international-incidents'&&action.type==='guard'){actor.weakened=false;actor.exposed=false;passive='DIPLOMATIC IMMUNITY';}
  if(faction==='politics-hypocrisy'&&action.type==='ability'){actor.charge=Math.min(3,actor.charge+1);passive='SPIN CYCLE +1 HYPE';}
  if(faction==='cursed-society'&&event.knockout){heal(12);passive='MAIN CHARACTER +12';}
  if(passive){actor.passiveUsed=true;event.passive=passive;}
 }
 if(!event.text)event.text=`${event.title}: ${event.damage} HP damage, ${event.lpDamage} LP damage${event.heal?`, ${event.heal} HP restored`:''}.${event.knockout?' CANCELLED.':''}`;
 if(event.reaction)event.text+=` TRAP: ${event.reaction}.`;if(event.passive)event.text+=` ${event.passive}.`;
 m.events.push(event);m.phase=other;
 for(const s of [other,side]){
  const standing=m[s].findIndex(f=>f.summoned&&f.hp>0);
  if(standing>=0&&!frontline(m,s))m[`${s}Active`]=standing;
  if(duel[s].lp===0||m[s].every(f=>f.hp===0)){m.phase='finished';m.winner=s==='player'?'enemy':'player';m.reason=duel[s].lp===0?'lp':'knockout';break;}
 }
 if(m.phase!=='finished'&&m.step>=80){
  const score=(s:Side)=>duel[s].lp+m[s].reduce((n,f)=>n+f.hp/maxHp(f.cardId,m.districtId,s,4),0);
  m.phase='finished';m.winner=score('player')>score('enemy')?'player':'enemy';m.reason='verdict';
 }
 if(m.phase!=='finished'&&m.step>1){
  const next=duel[other];next.stars=Math.min(MAX_STARS,next.stars+TURN_STARS);
  if(!next.deck.length&&next.discard.length){next.deck=next.discard;next.discard=[];}
  if(next.hand.length<5&&next.deck.length)next.hand.push(next.deck.shift()!);
 }
 return matchSchema.parse(m);
}

export function legalDuelActions(m:Match,side:Side):BattleAction[]{
 if(m.phase!==side||!m.duel)return [];
 const candidates:BattleAction[]=[{type:'pass'},{type:'attack'},{type:'guard'},{type:'ability'},...m.duel[side].hand.map(cardId=>({type:'play' as const,cardId})),...m[side].flatMap((_,slot):BattleAction[]=>[{type:'summon',slot},{type:'switch',slot},...m[side].map((_,tributeSlot)=>({type:'summon' as const,slot,tributeSlot}))]),...(availableDuo(m,side)?[{type:'duo' as const}]:[])];
 return candidates.filter(action=>{try{takeDuelTurn(m,side,action);return true;}catch{return false;}});
}
export function chooseDuelAction(m:Match,side:Side):BattleAction{
 const other:Side=side==='player'?'enemy':'player',before=frontline(m,side);
 const hp=(x:Match,s:Side)=>x[s].reduce((n,f)=>n+f.hp,0);
 const score=(action:BattleAction)=>{
  const next=takeDuelTurn(m,side,action),after=frontline(next,side),target=frontline(next,other);
  if(next.winner===side)return 10000;
  let value=(hp(m,other)-hp(next,other))+(m.duel![other].lp-next.duel![other].lp)*2+(hp(next,side)-hp(m,side))*.65+(next.duel![side].stars-m.duel![side].stars)*.4;
  if(!before&&after)value+=65;
  if(before&&after&&before.cardId!==after.cardId)value+=(after.hp-before.hp)*.2+(duelStats(after.cardId).attack-duelStats(before.cardId).attack)*1.2-8;
  if(after){value+=(after.charge-(before?.charge??0))*4;if(action.type==='guard')value+=target?Math.min(duelStats(after.cardId).defense,duelStats(target.cardId).attack)*.8:0;value+=after.guard*15;}
  if(next.duel![side].trap&&!m.duel![side].trap)value+=12;
  if(target?.exposed)value+=5;if(target?.weakened)value+=6;
  return value-(action.type==='pass'?4:0);
 };
 return legalDuelActions(m,side).sort((a,b)=>score(b)-score(a))[0]??{type:'pass'};
}

// Forecasts must not reveal a face-down opponent trap or its damage reduction.
export function forecastDuelAction(m:Match,action:BattleAction){
 if(m.phase!=='player')return null;
 const visible=structuredClone(m);
 if(visible.duel?.enemy.trap){visible.duel.enemy.discard.push(visible.duel.enemy.trap);visible.duel.enemy.trap=null;}
 try{return takeDuelTurn(visible,'player',action).events.at(-1)??null;}catch{return null;}
}
