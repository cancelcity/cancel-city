import {createMatch,LOANERS,matchSchema,takeTurn,type BattleAction,type Match} from './battle';
import {frontline} from './duel';
import type {DuelCardId} from './duel-rules';
export type TrainingLesson='attack'|'spell'|'after-spell'|'trap'|'defend'|'special'|'replacement-ready'|'replace'|'replacement-attack'|'done';
export const TRAINING_LESSONS:Record<TrainingLesson,{title:string;text:string;number:number}>={
 attack:{number:1,title:'FIGHTERS STAY ON THE FIELD',text:'Your lead is already deployed. HP is health; ATK is attack power; DEF reduces hits while defending. Press ATTACK: it costs no stars, gains hype and ends your turn.'},
 spell:{number:2,title:'SPELLS RESOLVE IMMEDIATELY',text:'Inspect 2014 Tweet Receipt in your hand, then PLAY SPELL. Pay 2 stars to hit with your frontline’s ATK and expose the target. The spell discards, but your turn continues.'},
 'after-spell':{number:2,title:'YOU CAN STILL FIGHT',text:'Your tactic slot is used, but your battle action remains. Press ATTACK. If the spell knocked out their lead, this attack hits their exposed LP directly.'},
 trap:{number:3,title:'TRAPS WAIT FOR A TRIGGER',text:'Inspect Community Note, then SET TRAP for 2 stars. It waits face down in your trap zone. It does not deal damage or become a fighter.'},
 defend:{number:3,title:'WATCH YOUR TRAP REACT',text:'Press DEFEND to gain hype and use your printed DEF. The trainer attacks next: Community Note will automatically halve that hit, then discard.'},
 special:{number:4,title:'A SPECIAL BELONGS TO YOUR FIGHTER',text:'Your lead has 3 hype. Press INSPECT SPECIAL to read the effect, then USE SPECIAL to spend the hype and end your turn. A Special belongs to the fighter, not the tactics deck.'},
 'replacement-ready':{number:4,title:'NOW LEARN KNOCKOUT REPLACEMENT',text:'You have attacked, cast a spell, triggered a trap and used a Special. The next drill starts with your lead already knocked out and 80 LP: a knockout costs 40 LP.'},
 replace:{number:5,title:'YOUR FRONTLINE IS EMPTY',text:'This is a replacement drill: the lead starts knocked out, and neither reserve is deployed. Choose DEPLOY under either surviving reserve. Pay its stars; your battle action stays available.'},
 'replacement-attack':{number:5,title:'YOUR REPLACEMENT CAN FIGHT',text:'The new fighter is now your frontline. Press ATTACK. In a normal match, an already deployed surviving reserve would replace a knockout automatically.'},
 done:{number:5,title:'YOU KNOW THE BASICS',text:'Bring three fighters and twelve tactics. Each turn: optionally deploy, optionally play one tactic, then fight. Reduce enemy LP to zero; each knockout costs 40 LP plus overflow.'},
};
export function trainingMatch(id:string,replacement=false){
 const m=createMatch(id,'street',LOANERS,{version:5,mode:'practice'}),d=m.duel!.player;
 const all=[...d.hand,...d.deck];
 const hand:DuelCardId[]=['receipt','note','apology','lawyer'];
 for(const card of hand)all.splice(all.indexOf(card),1);
 d.hand=hand;d.deck=all;
 if(replacement){m.player[0].hp=0;d.lp=80;}
 return matchSchema.parse(m);
}
export function trainingAllows(lesson:TrainingLesson,action:BattleAction){
 if(lesson==='spell')return action.type==='play'&&action.cardId==='receipt';
 if(lesson==='trap')return action.type==='play'&&action.cardId==='note';
 if(lesson==='defend')return action.type==='guard';
 if(lesson==='special')return action.type==='ability';
 if(lesson==='replace')return action.type==='summon';
 return ['attack','after-spell','replacement-attack'].includes(lesson)&&action.type==='attack';
}
export function nextTrainingLesson(lesson:TrainingLesson):TrainingLesson{
 const next:Partial<Record<TrainingLesson,TrainingLesson>>={attack:'spell',spell:'after-spell','after-spell':'trap',trap:'defend',defend:'special',special:'replacement-ready',replace:'replacement-attack','replacement-attack':'done'};
 return next[lesson]||lesson;
}
export function trainerAction(match:Match):BattleAction{
 if(frontline(match,'enemy'))return {type:'attack'};
 const slot=match.enemy.findIndex(f=>f.hp>0&&!f.summoned);
 return slot>=0?{type:'summon',slot}:{type:'pass'};
}
export function applyTrainingMove(match:Match,lesson:TrainingLesson,action:BattleAction){
 if(!trainingAllows(lesson,action))throw new Error('Follow the highlighted lesson action, or exit to free practice.');
 return {match:takeTurn(match,'player',action),lesson:nextTrainingLesson(lesson)};
}
