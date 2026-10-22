import {z} from 'zod';
import {CARD_BY_ID} from '../data/cards';
import {KITS} from '../data/combat-kit';
import type {Save} from './game';
import {LOANERS} from './battle';
import {roastExchange,ROAST_VOICES,type RoastTone} from '../data/roast-script';
export const ROAST_OPPONENTS=[{cardId:'CC001',hp:96,name:'RAGE BAIT',rule:'Repeating yourself feeds his ego.',intro:'I HAVE ALREADY WON THIS ARGUMENT IN MY HEAD.',gag:'THE CROWD ASKED HIM TO TOUCH THE STAGE GRASS.'},{cardId:'CC026',hp:120,name:'MANAGER ENERGY',rule:'An angry audience strengthens her complaints.',intro:'I WOULD LIKE TO SPEAK TO THE ORGANISER OF HUMILIATION.',gag:'HER COMPLAINT HAS BEEN ESCALATED TO THE VENDING MACHINE.'},{cardId:'CC031',hp:138,name:'PROVE YOU ARE FUNNY',rule:'Keep the crowd on side to crack the final gate.',intro:'SELECT EVERY SQUARE CONTAINING A DECENT PUNCHLINE.',gag:'THE ROBOT FAILED ITS OWN VIBE CHECK.'}] as const;
export const ROAST_MOVE_LIMIT=36;
export const roastMovesLeft=(r:Roast)=>Math.max(0,(r.version===2?ROAST_MOVE_LIMIT:60)-r.turn);
export const ROAST_PROPS=[{id:'bonk',art:'/assets/props/P001.webp',name:'THE BONK STICK',effect:'18 damage. Cancel the next enemy turn.',quote:'The silence is now physical.'},{id:'copium',art:'/assets/props/P003.webp',name:'EMERGENCY COPIUM',effect:'Heal 24. Absorb the next hit, then burst for 14 damage.',quote:'The excuses have reached critical pressure.'},{id:'megaphone',art:'/assets/props/P004.webp',name:'APOLOGY MEGAPHONE',effect:'Win 30 crowd points. Expose the opponent for 2 hits.',quote:'I am sorry you are so loud.'}] as const;
const count=z.number().int().nonnegative(),cardId=z.string().refine(id=>Object.hasOwn(CARD_BY_ID,id));
const propId=z.enum(['bonk','copium','megaphone']);
const kind=z.enum(['attack','reply','guard','switch','special','bonk','copium','megaphone','enemy','interrupt','dodge','finale']);
export const roastEventSchema=z.object({step:count,kind,actorId:cardId,targetId:cardId,side:z.enum(['player','enemy']),damage:count.max(200),heal:count.max(200),knockout:z.boolean(),grade:z.enum(['miss','good','perfect']).nullable(),crowdDelta:z.number().int().min(-200).max(200),collision:z.boolean(),title:z.string().max(100),text:z.string().max(400),round:count.max(2),tone:z.enum(['jab','bait','deadpan']).optional(),setup:z.string().max(400).optional(),reply:z.string().max(400).optional(),retort:z.string().max(400).optional()});
const roastObject=z.object({version:z.union([z.literal(1),z.literal(2)]),id:z.string().min(1).max(100),createdAt:z.string().datetime(),mode:z.enum(['timed','steady']),team:z.array(z.object({cardId,hp:count.max(140),maxHp:count.max(140),hype:count.max(3)})).length(3),active:count.max(2),round:count.max(2),enemyHp:count.max(138),crowd:z.number().int().min(-100).max(100),step:count.max(300),turn:count.max(90),phase:z.enum(['player','enemy','window','finished']),winner:z.enum(['player','enemy']).nullable(),reason:z.enum(['knockout','timeout','surrender']).nullable(),pending:z.object({kind:z.enum(['special','interrupt','dodge']),openedAt:z.string().datetime(),duration:z.literal(4000)}).nullable(),lastMove:z.string().max(30).nullable(),repeat:count.max(90),props:z.object({bonk:count.max(1),copium:count.max(1),megaphone:count.max(1)}),shield:z.boolean(),copium:z.boolean(),silenced:z.boolean(),exposed:count.max(2),weakened:z.boolean(),collisions:z.array(count.max(2)).max(3),perfects:count.max(180),events:z.array(roastEventSchema).max(40),rewarded:z.boolean()});
export const roastSchema=roastObject.superRefine((r,ctx)=>{const bad=(message:string)=>ctx.addIssue({code:z.ZodIssueCode.custom,message});if(r.version===2&&(r.pending||r.phase==='window'))bad('The new show has no timing windows');if(new Set(r.team.map(f=>f.cardId)).size!==3||r.team.some(f=>f.hp>f.maxHp||f.maxHp!==roastHp(f.cardId)))bad('Invalid roast squad');if(r.enemyHp>ROAST_OPPONENTS[r.round].hp)bad('Invalid roast opponent health');if((r.phase==='window')!==!!r.pending)bad('Invalid roast timing window');if((r.phase==='finished')!==(r.winner!==null&&r.reason!==null))bad('Invalid roast verdict');if(r.phase!=='finished'&&r.team[r.active].hp===0)bad('Roast active resident is knocked out');if(r.winner==='player'&&(r.round!==2||r.enemyHp!==0))bad('All three roast opponents must be defeated');if(r.winner==='enemy'&&r.reason==='knockout'&&r.team.some(f=>f.hp>0))bad('Roast loss is incomplete');if(r.rewarded&&r.winner!=='player')bad('Unfinished roast cannot grant rewards');if(new Set(r.collisions).size!==r.collisions.length)bad('Duplicate stage collision');if(r.events.length&&r.events.at(-1)!.step!==r.step)bad('Invalid roast event order');if(r.events.some((e,i)=>e.step>r.step||i>0&&e.step!==r.events[i-1].step+1))bad('Invalid roast event sequence');});
export type Roast=z.infer<typeof roastSchema>;
export type RoastEvent=z.infer<typeof roastEventSchema>;
export type RoastAction={type:'attack'|'guard'|'special'}|{type:'reply';tone:RoastTone}|{type:'switch';slot:number}|{type:'prop';propId:'bonk'|'copium'|'megaphone'};
export type RoastCommand={type:'roast-start';matchId:string;team:string[];mode:'timed'|'steady';version?:2}|{type:'roast-act';matchId:string;step:number;action:RoastAction}|{type:'roast-enemy';matchId:string;step:number}|{type:'roast-resolve';matchId:string;step:number;input:'tap'|'skip'}|{type:'roast-surrender';matchId:string;step:number}|{type:'roast-leave';matchId:string;step:number};
const actionSchema=z.discriminatedUnion('type',[z.object({type:z.literal('reply'),tone:z.enum(['jab','bait','deadpan'])}),z.object({type:z.literal('attack')}),z.object({type:z.literal('guard')}),z.object({type:z.literal('special')}),z.object({type:z.literal('switch'),slot:count.max(2)}),z.object({type:z.literal('prop'),propId})]);
const ref={matchId:z.string().min(1).max(100),step:count.max(300)};
export const roastCommandShapes=[z.object({type:z.literal('roast-start'),matchId:ref.matchId,team:z.array(cardId).length(3),mode:z.enum(['timed','steady']),version:z.literal(2).optional()}),z.object({type:z.literal('roast-act'),...ref,action:actionSchema}),z.object({type:z.literal('roast-enemy'),...ref}),z.object({type:z.literal('roast-resolve'),...ref,input:z.enum(['tap','skip'])}),z.object({type:z.literal('roast-surrender'),...ref}),z.object({type:z.literal('roast-leave'),...ref})] as const;
export const roastHp=(id:string)=>Object.hasOwn(CARD_BY_ID,id)?Math.round(95+CARD_BY_ID[id].stats.shame*.2):0;
export function freshRoast(id:string,team:string[],mode:'timed'|'steady',now:Date,version:1|2=1):Roast{if(team.length!==3||new Set(team).size!==3||team.some(id=>!Object.hasOwn(CARD_BY_ID,id)))throw new Error('Choose three different roast residents.');return roastSchema.parse({version,id,createdAt:now.toISOString(),mode,team:team.map(cardId=>({cardId,hp:roastHp(cardId),maxHp:roastHp(cardId),hype:1})),active:0,round:0,enemyHp:96,crowd:0,step:0,turn:0,phase:'player',winner:null,reason:null,pending:null,lastMove:null,repeat:0,props:{bonk:1,copium:1,megaphone:1},shield:false,copium:false,silenced:false,exposed:0,weakened:false,collisions:[],perfects:0,events:[],rewarded:false});}
export function roastGrade(mode:Roast['mode'],openedAt:string,now:Date,input:'tap'|'skip'){'use strict';if(mode==='steady')return 'perfect' as const;if(input==='skip')return 'good' as const;const elapsed=now.getTime()-Date.parse(openedAt);return elapsed>=1750&&elapsed<=2550?'perfect' as const:elapsed>=1050&&elapsed<=3350?'good' as const:'miss' as const;}
export function roastIntent(r:Roast){return (r.turn+r.round)%3===2?'dodge' as const:'interrupt' as const;}
export function applyRoastCommand(s:Save,command:RoastCommand,now:Date,award:(id:string,packs:number)=>boolean){
 if(command.type==='roast-start'){if(s.roast&&s.roast.phase!=='finished')throw new Error('Finish or surrender the saved Roast Night first.');if(s.battle.active&&s.battle.active.phase!=='finished')throw new Error('Finish your other battle first.');if(command.team.some(id=>!LOANERS.includes(id)&&(s.inventory[id]?.regular||0)+(s.inventory[id]?.foil||0)<1))throw new Error('Use owned residents or the three starter loaners.');s.roast=freshRoast(command.matchId,command.team,command.mode,now,command.version??1);return;}
 const r=s.roast;if(!r||r.id!==command.matchId)throw new Error('This Roast Night is no longer active.');if(r.step!==command.step)throw new Error('Roast Night advanced. Use the current turn.');if(command.type==='roast-leave'){if(r.phase!=='finished')throw new Error('Finish or surrender before leaving the show.');s.roast=null;return;}if(r.phase==='finished')throw new Error('This Roast Night is already finished.');
 if(r.version===2){s.roast=advanceRoastPractice(r,command,now);if(s.roast.winner==='player'&&award('encounter:roast-night',1)){s.totalXp+=60;s.roast.rewarded=true;}return;}
 const actor=r.team[r.active],enemyId=ROAST_OPPONENTS[r.round].cardId,oldRound=r.round,oldCrowd=r.crowd;
 const e:RoastEvent={step:r.step+1,kind:'attack',actorId:actor.cardId,targetId:enemyId,side:'player',damage:0,heal:0,knockout:false,grade:null,crowdDelta:0,collision:false,title:'',text:'',round:r.round};
 const crowd=(delta:number)=>{r.crowd=Math.max(-100,Math.min(100,r.crowd+delta));};
 const heal=(amount:number)=>{e.heal=Math.min(actor.maxHp-actor.hp,amount);actor.hp+=e.heal;};
 const hit=(amount:number)=>{const bonus=r.exposed?1.25:1,gate=r.round===2&&r.crowd<0?.8:1;e.damage=Math.min(r.enemyHp,Math.max(1,Math.round(amount*bonus*gate)));r.enemyHp-=e.damage;if(r.exposed)r.exposed--;if(r.enemyHp>0&&r.crowd>=45&&e.damage>=22&&!r.collisions.includes(r.round)){const collision=Math.min(18,r.enemyHp);e.damage+=collision;r.enemyHp-=collision;r.collisions.push(r.round);e.collision=true;crowd(8);e.text+=' The opponent hits a mic stand, rebounds into the snack machine, and gets billed for the collision.';}e.knockout=r.enemyHp===0;};
 const enemyHit=(amount:number)=>{e.side='enemy';e.actorId=enemyId;e.targetId=actor.cardId;let damage=Math.round(amount*(r.shield?.4:1)*(r.weakened?.65:1));r.shield=false;r.weakened=false;if(r.copium&&damage>0){damage=0;r.copium=false;const burst=Math.min(14,r.enemyHp);r.enemyHp-=burst;e.collision=true;e.text+=' Copium absorbs the hit and bursts for '+burst+' damage.';}e.damage=Math.min(actor.hp,damage);actor.hp-=e.damage;e.knockout=actor.hp===0;};
 const move=(name:string)=>{r.repeat=r.lastMove===name?r.repeat+1:0;r.lastMove=name;crowd(r.repeat?-12-Math.min(12,r.repeat*3):10);};
 if(command.type==='roast-surrender'){r.phase='finished';r.pending=null;r.winner='enemy';r.reason='surrender';e.kind='finale';e.title='THE MIC HAS BEEN ABANDONED.';e.text='The council considers this a successful consultation.';}
 else if(command.type==='roast-act'){
  if(r.phase!=='player')throw new Error('Wait for the current roast beat.');const a=command.action;if(a.type==='reply')throw new Error('This saved show uses the original call-out controls.');const power=Math.round(24+CARD_BY_ID[actor.cardId].stats.clout*.07);move(a.type==='prop'?a.propId:a.type);r.turn++;
  switch(a.type){
   case 'attack':e.kind='attack';e.title=r.repeat?'THE CROWD HAS HEARD THIS ONE.':'CALLED OUT, LIVE.';e.text=r.repeat?'A heckler yells copy-paste.':'The front row finally puts its phones down.';hit(Math.max(10,power-r.repeat*7));actor.hype=Math.min(3,actor.hype+1);break;
   case 'guard':e.kind='guard';e.title='LET THEM FINISH EMBARRASSING THEMSELVES.';e.text='Block 60% of the next hit. Gain one hype.';r.shield=true;actor.hype=Math.min(3,actor.hype+1);break;
   case 'switch':if(a.slot===r.active||!r.team[a.slot]||r.team[a.slot].hp===0)throw new Error('Tag in a different standing resident.');r.active=a.slot;e.kind='switch';e.targetId=r.team[a.slot].cardId;e.title='NEW FACE. SAME MUNICIPAL LIABILITY.';e.text='The bench sends a new problem to the microphone.';break;
   case 'prop':if(!Object.hasOwn(r.props,a.propId)||r.props[a.propId]<1)throw new Error('That stage prop has already been used.');r.props[a.propId]--;e.kind=a.propId;if(a.propId==='bonk'){e.title='BONK. THE FLOOR IS CLOSED.';e.text='The next enemy turn is cancelled.';hit(18);r.silenced=true;}if(a.propId==='copium'){e.title='INDUSTRIAL STRENGTH EXCUSES.';e.text='Heal 24. The next hit is absorbed and bursts the tank.';heal(24);r.copium=true;}if(a.propId==='megaphone'){e.title='I AM SORRY YOU ARE STILL TALKING.';e.text='The audience changes sides. Two hits gain 25% damage.';crowd(30);r.exposed=2;}break;
   case 'special':if(actor.hype<3)throw new Error('Build three hype before the special.');actor.hype=0;r.pending={kind:'special',openedAt:now.toISOString(),duration:4000};r.phase='window';e.kind='special';e.title='SET UP THE PUNCHLINE.';e.text='The special is armed. Its effect lands when this timing beat resolves.';break;
  }
  if(a.type!=='special')r.phase='enemy';
 }else if(command.type==='roast-enemy'){
  if(r.phase!=='enemy')throw new Error('The next roast beat is not an enemy turn.');if(r.silenced){r.silenced=false;e.kind='interrupt';e.title='THE BONK STICK HAS THE FLOOR.';e.text='The opponent has been muted by municipal foam.';crowd(12);r.phase='player';}else{const intent=roastIntent(r);r.pending={kind:intent,openedAt:now.toISOString(),duration:4000};r.phase='window';e.kind='enemy';e.side='enemy';e.actorId=enemyId;e.targetId=actor.cardId;e.title=intent==='dodge'?'INCOMING: A VERY BAD TAKE.':'INTERRUPT THE MONOLOGUE.';e.text=intent==='dodge'?'The opponent throws the entire microphone.':'The opponent begins an unnecessarily long explanation.';}
 }else if(command.type==='roast-resolve'){
  if(r.phase!=='window'||!r.pending)throw new Error('There is no roast timing beat to resolve.');if(now.getTime()<Date.parse(r.pending.openedAt))throw new Error('Timing requires the current clock.');const pending=r.pending,grade=roastGrade(r.mode,pending.openedAt,now,command.input);r.pending=null;e.grade=grade;if(grade==='perfect')r.perfects++;crowd(grade==='perfect'?20:grade==='good'?8:-15);
  if(pending.kind==='special'){e.kind='special';e.title=CARD_BY_ID[actor.cardId].ability.toUpperCase();e.text=grade==='miss'?'The punchline lands sideways. It still does damage.':grade==='perfect'?'The audience finishes the punchline for you.':'The back row laughs one beat late.';const kit=KITS[actor.cardId],power=30+Math.round(CARD_BY_ID[actor.cardId].stats.clout*.08)+kit.bonus;hit(Math.round(power*(grade==='perfect'?1.3:grade==='good'?1:.7)));if(kit.heal)heal(kit.heal);if(kit.teamHeal){for(const f of r.team)if(f.hp>0)f.hp=Math.min(f.maxHp,f.hp+kit.teamHeal);}if(kit.shield)r.shield=true;if(kit.weaken)r.weakened=true;if(kit.expose)r.exposed=2;if(kit.cleanse){r.shield=true;}if(kit.recharge)actor.hype=Math.min(3,kit.recharge);r.phase='enemy';}
  else{e.kind=pending.kind;e.title=grade==='perfect'?(pending.kind==='dodge'?'THE MIC MISSED. THE INVOICE DID NOT.':'THE CROWD FINISHED THE RANT.'):grade==='good'?'GOOD SAVE. QUESTIONABLE DIGNITY.':'THE FRONT ROW FELT THAT.';e.text=grade==='perfect'?'The opponent has lost the room.':'The opponent tests the municipal noise limit.';const base=20+r.round*4+(r.round===1&&r.crowd<0?8:0);enemyHit(grade==='perfect'?0:grade==='good'?Math.round(base*.4):base);if(grade==='perfect'){actor.hype=Math.min(3,actor.hype+1);if(pending.kind==='interrupt'){r.enemyHp=Math.max(0,r.enemyHp-10);}else if(!r.collisions.includes(r.round)){r.enemyHp=Math.max(0,r.enemyHp-18);r.collisions.push(r.round);e.collision=true;e.text+=' The thrown mic trips a stand and catapults an unpaid snack.';}}r.phase='player';}
 }
 if(r.phase!=='finished'){
  if(r.team.every(f=>f.hp===0)){r.phase='finished';r.pending=null;r.winner='enemy';r.reason='knockout';}
  else if(r.enemyHp===0){if(r.round===2){r.phase='finished';r.pending=null;r.winner='player';r.reason='knockout';}else{r.round++;r.enemyHp=ROAST_OPPONENTS[r.round].hp;r.phase='player';r.pending=null;r.lastMove=null;r.repeat=0;r.exposed=0;r.silenced=false;r.weakened=false;crowd(10);for(const f of r.team)if(f.hp>0){f.hp=Math.min(f.maxHp,f.hp+12);f.hype=Math.min(3,f.hype+1);}e.text+=' '+ROAST_OPPONENTS[oldRound].gag+' Next act: '+ROAST_OPPONENTS[r.round].name+'.';}}
  if(r.team[r.active].hp===0&&r.team.some(f=>f.hp>0))r.active=r.team.findIndex(f=>f.hp>0);
  if(r.turn>=60&&r.phase!=='finished'){r.phase='finished';r.pending=null;r.winner='enemy';r.reason='timeout';e.text+=' The venue closes. The council calls this a draw with expenses.';}
 }
 e.crowdDelta=r.crowd-oldCrowd;r.step++;e.step=r.step;r.events=[...r.events,e].slice(-40);
 if(r.winner==='player'&&award('encounter:roast-night',1)){s.totalXp+=60;r.rewarded=true;}
 s.roast=roastSchema.parse(r);
}
/** The intent belongs to the line on stage, including while its enemy response is pending. */
export function roastV2Intent(r:Roast){
 const exchange=roastExchange(r.round,r.phase==='enemy'?Math.max(0,r.turn-1):r.turn,r.id);
 const base=exchange.intent==='rant'?22+r.round*3:exchange.intent==='heckle'?16+r.round*3:30+r.round*4;
 const penalty=r.round===1&&r.crowd<0?5:0;
 const repetition=r.round===0?Math.min(10,r.repeat*4):r.round===2?Math.min(12,r.repeat*5):0;
 return {kind:exchange.intent,text:exchange.intentText,damage:base+penalty+repetition};
}

/** Mechanical previews use the same calculation as the authoritative reply reducer. */
export function roastReplyPreview(r:Roast,tone:RoastTone){
 const actor=r.team[r.active],intent=roastV2Intent(r).kind,repeat=r.lastMove===`reply:${tone}`?r.repeat+1:0;
 const power=Math.round(24+CARD_BY_ID[actor.cardId].stats.clout*.07);
 const base=tone==='jab'?power+2:tone==='bait'?Math.round(power*.6):Math.round(power*.35);
 const damage=Math.min(r.enemyHp,Math.max(1,Math.round(Math.max(4,base-repeat*7)*(r.exposed?1.25:1)*(r.round===2&&r.crowd<0?.8:1))));
 const applause=tone==='jab'?(intent==='heckle'?12:4):tone==='bait'?(intent==='rant'?11:5):(intent==='tantrum'?10:4);
 const applauseDelta=repeat?-14-Math.min(18,repeat*4):applause;
 const crowd=Math.max(-100,Math.min(100,r.crowd+applauseDelta))-r.crowd;
 const collision=r.crowd+crowd>=35&&damage>=25&&damage<r.enemyHp&&!r.collisions.includes(r.round)?Math.min(10,r.enemyHp-damage):0;
 const effect=tone==='jab'?'Biggest hit. A heckler gives you the best crowd response.':tone==='bait'?(intent==='rant'?'Interrupt the rant: the next enemy hit is cancelled.':'Cut the next enemy hit by 45%.'):'Block 60% of the next hit. Gain up to 2 hype.';
 return {damage:damage+collision,collision,hype:Math.min(3-actor.hype,tone==='deadpan'?2:1),crowd,effect,repeated:repeat>0};
}

/** Roast Specials adapt the resident kit: recovery trades some punchline damage for support. */
export function roastSpecialPreview(r:Roast){
 const actor=r.team[r.active],kit=KITS[actor.cardId],living=r.team.filter(f=>f.hp>0).length;
 const recovery=(kit.heal||0)+(kit.teamHeal||0)*living;
 const base=Math.max(12,30+Math.round(CARD_BY_ID[actor.cardId].stats.clout*.08)+kit.bonus-Math.round(recovery*.35)-(kit.shield?4:0));
 const damage=Math.min(r.enemyHp,Math.max(1,Math.round(base*(r.exposed?1.25:1)*(r.round===2&&r.crowd<0?.8:1))));
 const collision=r.crowd>=35&&damage>=25&&damage<r.enemyHp&&!r.collisions.includes(r.round)?Math.min(10,r.enemyHp-damage):0;
 const effects=[kit.heal?`Heal up to ${kit.heal}.`:'',kit.teamHeal?`Heal every standing ally up to ${kit.teamHeal}.`:'',kit.shield||kit.cleanse?'Block 60% of the next hit.':'',kit.weaken?'Cut the next hit by 45%.':'',kit.expose?'Expose the opponent for two hits.':'',kit.recharge?`Refund ${kit.recharge} hype.`:''].filter(Boolean);
 return {damage:damage+collision,collision,effect:effects.join(' ')||'A hard hit. No recovery.'};
}

/** Forecast the full exchange through the same reducer used to save real moves. */
export function roastActionForecast(r:Roast,action:RoastAction){
 if(r.version!==2||r.phase!=='player')return null;
 try{
  const now=new Date(r.createdAt),afterMove=advanceRoastPractice(r,{type:'roast-act',matchId:r.id,step:r.step,action},now);
  const move=afterMove.events.at(-1)!;
  const result=afterMove.phase==='enemy'?advanceRoastPractice(afterMove,{type:'roast-enemy',matchId:r.id,step:afterMove.step},now):afterMove;
  const response=result.step>afterMove.step?result.events.at(-1):undefined;
  const burst=response?.side==='enemy'?(result.round>afterMove.round?afterMove.enemyHp:Math.max(0,afterMove.enemyHp-result.enemyHp)):0;
  return {damage:move.damage+burst,incoming:response?.side==='enemy'?response.damage:0,hype:afterMove.team[r.active].hype-r.team[r.active].hype,crowd:result.crowd-r.crowd,heal:move.heal,interrupted:response?.kind==='interrupt',knockout:!!response?.knockout,actCleared:result.round>r.round,won:result.winner==='player',lost:result.winner==='enemy',timeout:result.reason==='timeout'};
 }catch{return null;}
}

/** Browser-local rehearsal: pure reducer, no Save, wallet, inventory, reward callback or network. */
export function advanceRoastPractice(current:Roast,command:RoastCommand,now:Date):Roast{
 const r=roastSchema.parse(structuredClone(current));
 const parsed=z.discriminatedUnion('type',[...roastCommandShapes]).parse(command);
 if(r.version!==2)throw new Error('Rehearsal uses the new Roast Night rules.');
 if(parsed.type==='roast-start'||parsed.type==='roast-leave')throw new Error('Start or leave rehearsal outside the turn reducer.');
 if(r.id!==parsed.matchId)throw new Error('This Roast Night is no longer active.');
 if(r.step!==parsed.step)throw new Error('Roast Night advanced. Use the current turn.');
 if(r.phase==='finished')throw new Error('This Roast Night is already finished.');
 r.rewarded=false;
 const actor=r.team[r.active],oldRound=r.round,oldCrowd=r.crowd,enemyId=ROAST_OPPONENTS[r.round].cardId;
 const exchange=roastExchange(r.round,r.phase==='enemy'?Math.max(0,r.turn-1):r.turn,r.id);
 const e:RoastEvent={step:r.step+1,kind:'reply',actorId:actor.cardId,targetId:enemyId,side:'player',damage:0,heal:0,knockout:false,grade:null,crowdDelta:0,collision:false,title:'',text:'',round:r.round};
 const crowd=(delta:number)=>{r.crowd=Math.max(-100,Math.min(100,r.crowd+delta));};
 const heal=(amount:number)=>{e.heal=Math.min(actor.maxHp-actor.hp,amount);actor.hp+=e.heal;};
 const hit=(amount:number,previewed=false)=>{
  const damage=Math.min(r.enemyHp,Math.max(1,Math.round(amount*(previewed?1:(r.exposed?1.25:1)*(r.round===2&&r.crowd<0?.8:1)))));
  e.damage=damage;r.enemyHp-=damage;if(r.exposed)r.exposed--;
  if(!previewed&&r.enemyHp>0&&r.crowd>=35&&damage>=25&&!r.collisions.includes(r.round)){
   const collision=Math.min(10,r.enemyHp);r.enemyHp-=collision;e.damage+=collision;e.collision=true;r.collisions.push(r.round);
   e.text+=' They back into the mic stand. The front row keeps the clip.';
  }
  e.knockout=r.enemyHp===0;
 };
 if(parsed.type==='roast-surrender'){
  r.phase='finished';r.winner='enemy';r.reason='surrender';e.kind='finale';e.title='YOU WALKED OFF.';e.text='The front row has already uploaded it.';
 }else if(parsed.type==='roast-resolve'){
  throw new Error('The new show has no timing window. Choose a reply.');
 }else if(parsed.type==='roast-act'){
  if(r.phase!=='player')throw new Error('Wait for the current roast beat.');
  const a=parsed.action;
  if(a.type==='special'&&actor.hype<3)throw new Error('Build three hype before the special.');
  if(a.type==='switch'&&(a.slot===r.active||!r.team[a.slot]||r.team[a.slot].hp===0))throw new Error('Tag in a different standing resident.');
  if(a.type==='prop'&&r.props[a.propId]<1)throw new Error('That stage prop has already been used.');
  const tone=a.type==='reply'?a.tone:a.type==='attack'?'jab':a.type==='guard'?'deadpan':null;
  const move=tone?`reply:${tone}`:a.type==='prop'?a.propId:a.type;
  const preview=tone?roastReplyPreview(r,tone):null;
  r.repeat=r.lastMove===move?r.repeat+1:0;r.lastMove=move;r.turn++;r.phase='enemy';
  if(tone&&preview){
   const response=exchange.responses.find(response=>response.id===tone)!;
   e.kind='reply';e.tone=tone;e.title=tone==='jab'?'SAY IT TO THEIR FACE.':tone==='bait'?'KEEP TALKING.':'LET THE SILENCE DO IT.';
   e.setup=exchange.setup;e.reply=response.line;e.retort=response.reaction;e.text=response.reaction;
   crowd(preview.crowd);
   // The preview includes the single finite collision, so consume it once here.
   const canCollide=preview.collision>0;
   hit(preview.damage,true);
   if(canCollide){e.collision=true;r.collisions.push(r.round);}
   actor.hype=Math.min(3,actor.hype+(tone==='deadpan'?2:1));
   if(tone==='bait'){if(exchange.intent==='rant')r.silenced=true;else r.weakened=true;}
   if(tone==='deadpan')r.shield=true;
   if(r.repeat)e.text+=' Same delivery again. The room starts talking over you.';
  }else if(a.type==='special'){
   actor.hype=0;e.kind='special';e.title=CARD_BY_ID[actor.cardId].ability.toUpperCase();
   e.setup=exchange.setup;e.reply='Enough. Give me the mic.';e.text='The front row gets their phones out.';
   const kit=KITS[actor.cardId],preview=roastSpecialPreview(r);
   hit(preview.damage,true);if(preview.collision){e.collision=true;r.collisions.push(r.round);}
   if(kit.heal)heal(kit.heal);
   if(kit.teamHeal)for(const f of r.team)if(f.hp>0)f.hp=Math.min(f.maxHp,f.hp+kit.teamHeal);
   if(kit.shield||kit.cleanse)r.shield=true;
   if(kit.weaken)r.weakened=true;
   if(kit.expose)r.exposed=2;
   if(kit.recharge)actor.hype=Math.min(3,kit.recharge);
   crowd(r.repeat?-18:8);
  }else if(a.type==='switch'){
   r.active=a.slot;e.kind='switch';e.targetId=r.team[a.slot].cardId;e.title='YOUR TURN. TRY NOT TO FUCK IT UP.';
   e.text='Your replacement gets the mic and the incoming hit.';crowd(r.repeat?-18:-2);
  }else if(a.type==='prop'){
   r.props[a.propId]--;e.kind=a.propId;
   if(a.propId==='bonk'){e.title='MIC PRIVILEGES REVOKED.';e.text='18 damage. Cancel the next enemy hit.';hit(18);r.silenced=true;}
   if(a.propId==='copium'){e.title='BREATHE. LIE TO YOURSELF.';e.text='Heal 24. Absorb the next hit and burst for 14 damage.';heal(24);r.copium=true;}
   if(a.propId==='megaphone'){e.title='THE PEOPLE AT THE BACK HATE YOU TOO.';e.text='Win 30 crowd. Expose the opponent for two hits.';crowd(30);r.exposed=2;}
  }
 }else if(parsed.type==='roast-enemy'){
  if(r.phase!=='enemy')throw new Error('The next roast beat is not an enemy turn.');
  const intent=roastV2Intent(r);
  e.kind='enemy';e.side='enemy';e.actorId=enemyId;e.targetId=actor.cardId;e.setup=exchange.setup;
  const reply=r.events.at(-1);if(reply?.round===r.round){e.reply=reply.reply;e.retort=reply.retort;}
  e.title=intent.kind==='rant'?'STILL FUCKING TALKING.':intent.kind==='heckle'?'THEY THINK THAT WAS A COMEBACK.':'HERE COMES THE TANTRUM.';
  if(r.silenced){
   r.silenced=false;e.kind='interrupt';e.title='THEY LOST THEIR OWN POINT.';e.text='No hit. They are still trying to explain themselves.';
  }else{
   let damage=Math.round(intent.damage*(r.shield?.4:1)*(r.weakened?.55:1));
   if(r.copium&&damage>0){damage=0;r.copium=false;const burst=Math.min(14,r.enemyHp);r.enemyHp-=burst;e.collision=true;e.text=`Copium absorbs the hit and bursts for ${burst} damage.`;}
   else e.text=`${intent.text} ${damage} composure damage.`;
   e.damage=Math.min(actor.hp,damage);actor.hp-=e.damage;e.knockout=actor.hp===0;
  }
  // Defenses last one enemy response; interrupting cannot bank them indefinitely.
  r.shield=false;r.weakened=false;
  crowd(-5-r.round);r.phase='player';
 }
 if(r.phase!=='finished'){
  if(r.team.every(f=>f.hp===0)){r.phase='finished';r.winner='enemy';r.reason='knockout';}
  else if(r.enemyHp===0){
   if(r.round===2){r.phase='finished';r.winner='player';r.reason='knockout';}
   else{
    r.round++;r.enemyHp=ROAST_OPPONENTS[r.round].hp;r.phase='player';r.lastMove=null;r.repeat=0;r.exposed=0;r.silenced=false;r.weakened=false;r.shield=false;
    r.crowd=Math.trunc(r.crowd*.4);
    for(const f of r.team)if(f.hp>0){f.hp=Math.min(f.maxHp,f.hp+10);f.hype=Math.min(3,f.hype+1);}
    const voice=ROAST_VOICES[ROAST_OPPONENTS[oldRound].cardId];e.text+=` ${voice.win}`;
   }
  }
  if(r.team[r.active].hp===0&&r.team.some(f=>f.hp>0))r.active=r.team.findIndex(f=>f.hp>0);
   if(r.turn>=ROAST_MOVE_LIMIT&&r.phase!=='finished'){r.phase='finished';r.winner='enemy';r.reason='timeout';e.text+=' Last orders. You had the mic for long enough.';}
 }
 if(r.phase==='finished'){
  const voice=ROAST_VOICES[enemyId];
  e.text+=` ${r.winner==='player'?voice.win:voice.lose}`;
 }
 e.text=e.text.slice(0,400);e.crowdDelta=r.crowd-oldCrowd;r.step++;e.step=r.step;r.events=[...r.events,e].slice(-40);
 return roastSchema.parse(r);
}

export function refineRoastSave(s:Save,ctx:z.RefinementCtx){const r=s.roast;if(r?.team.some(f=>!LOANERS.includes(f.cardId)&&(s.inventory[f.cardId]?.regular||0)+(s.inventory[f.cardId]?.foil||0)<1))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Roast squad contains an unowned resident'});if(r?.rewarded&&!s.awardedRewardIds.includes('encounter:roast-night'))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Roast reward requires its receipt'});}
