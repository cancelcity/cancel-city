import {describe,it,expect} from 'vitest';
import {z} from 'zod';
import {initialSave,applyCommand,decodeSave,type Save,type Command} from '../src/domain/game';
import {freshRoast,advanceRoastPractice,roastSchema,roastCommandShapes,roastReplyPreview,roastSpecialPreview,roastV2Intent,type Roast,type RoastAction,type RoastCommand} from '../src/domain/roast';
import {roastExchange} from '../src/data/roast-script';

const now=new Date('2026-10-22T16:00:00Z');
const loaners=['CC001','CC008','CC015'];
let sequence=0;
const fresh=()=>freshRoast('rehearsal',loaners,'steady',now,2);
const turn=(r:Roast,action:RoastAction)=>advanceRoastPractice(r,{type:'roast-act',matchId:r.id,step:r.step,action},now);
const atIntent=(r:Roast,kind:'rant'|'heckle'|'tantrum')=>{for(let i=0;i<6&&roastV2Intent(r).kind!==kind;i++)r.turn++;return r;};
const enemy=(r:Roast)=>advanceRoastPractice(r,{type:'roast-enemy',matchId:r.id,step:r.step},now);
const account=(s:Save,c:Command)=>applyCommand(s,c,now,()=>0,`roast-v2-${++sequence}`,s.revision);
function choose(r:Roast):RoastAction{
 const actor=r.team[r.active];
 if(actor.hype===3)return {type:'special'};
 if(actor.hp<45&&r.props.copium)return {type:'prop',propId:'copium'};
 if(actor.hp<24){const slot=r.team.findIndex((f,i)=>i!==r.active&&f.hp>45);if(slot>=0)return {type:'switch',slot};}
 const intent=roastV2Intent(r).kind;
 return {type:'reply',tone:intent==='rant'?'bait':intent==='tantrum'?'deadpan':'jab'};
}
function complete(r:Roast){
 for(let i=0;i<80&&r.phase!=='finished';i++)r=r.phase==='enemy'?enemy(r):turn(r,choose(r));
 return r;
}

describe('Roast Night authored show',()=>{
 it('opts new starts into v2 while preserving old saves, windows, and commands',()=>{
  const legacy=freshRoast('old-show',loaners,'timed',now);
  expect(legacy.version).toBe(1);
  let saved=account(initialSave(now,'legacy'),{type:'roast-start',matchId:'legacy',team:loaners,mode:'timed'});
  saved.roast!.team[0].hype=3;
  saved=account(saved,{type:'roast-act',matchId:'legacy',step:0,action:{type:'special'}});
  const resumed=decodeSave(JSON.parse(JSON.stringify(saved)));
  expect(resumed.roast!.version).toBe(1);
  expect(resumed.roast!.pending?.kind).toBe('special');
  expect(account(resumed,{type:'roast-resolve',matchId:'legacy',step:1,input:'skip'}).roast!.phase).toBe('enemy');
  const modern=account(initialSave(now,'modern'),{type:'roast-start',matchId:'modern',team:loaners,mode:'timed',version:2});
  expect(modern.roast!.version).toBe(2);
  expect(()=>account(saved,{type:'roast-start',matchId:'replace',team:loaners,mode:'steady',version:2})).toThrow('saved Roast');
 });
 it('validates real choices and never accepts client-authored damage or crowd values',()=>{
  const schema=z.discriminatedUnion('type',[...roastCommandShapes]);
  const parsed=schema.parse({type:'roast-act',matchId:'rehearsal',step:0,action:{type:'reply',tone:'jab',damage:999},crowd:100});
  expect(parsed).toEqual({type:'roast-act',matchId:'rehearsal',step:0,action:{type:'reply',tone:'jab'}});
  expect(schema.safeParse({type:'roast-act',matchId:'rehearsal',step:0,action:{type:'reply',tone:'perfect'}}).success).toBe(false);
 });
 it('plays the selected authored line and previews its actual hit, hype, and applause',()=>{
  const r=fresh(),preview=roastReplyPreview(r,'jab'),exchange=roastExchange(0,0,r.id),next=turn(r,{type:'reply',tone:'jab'});
  const event=next.events.at(-1)!;
  expect(event.setup).toBe(exchange.setup);
  expect(event.reply).toBe(exchange.responses.find(v=>v.id==='jab')!.line);
  expect(event.retort).toBe(exchange.responses.find(v=>v.id==='jab')!.reaction);
  expect(event.damage).toBe(preview.damage);
  expect(event.crowdDelta).toBe(preview.crowd);
  expect(next.team[0].hype-r.team[0].hype).toBe(preview.hype);
  expect(next.phase).toBe('enemy');
  expect(next.pending).toBeNull();
  expect(roastV2Intent(next).kind).toBe(exchange.intent);
 });
 it('counters a visible rant with bait and consumes the interruption once',()=>{
  let r=atIntent(fresh(),'rant');expect(roastV2Intent(r).kind).toBe('rant');
  const hp=r.team[0].hp;r=turn(r,{type:'reply',tone:'bait'});
  expect(r.silenced).toBe(true);r=enemy(r);
  expect(r.phase).toBe('player');expect(r.team[0].hp).toBe(hp);
  expect(r.events.at(-1)!.kind).toBe('interrupt');expect(r.silenced).toBe(false);
  expect(r.pending).toBeNull();
  r=enemy(turn(r,{type:'reply',tone:'jab'}));
  expect(r.team[0].hp).toBeLessThan(hp);
 });
 it('gives deadpan meaningful protection and hype against a tantrum without free perfect grades',()=>{
  const original=atIntent(fresh(),'tantrum');
  expect(roastV2Intent(original).kind).toBe('tantrum');
  const jab=enemy(turn(original,{type:'reply',tone:'jab'}));
  const deadpan=enemy(turn(original,{type:'reply',tone:'deadpan'}));
  expect(deadpan.events.at(-1)!.damage).toBe(Math.round(jab.events.at(-1)!.damage*.4));
  expect(deadpan.team[0].hype).toBe(3);
  expect(deadpan.enemyHp).toBeGreaterThan(jab.enemyHp);
  expect(deadpan.perfects).toBe(0);
  expect(deadpan.events.every(e=>e.grade===null)).toBe(true);
 });
 it('punishes repeated delivery, loses audience each response, and resets applause between acts',()=>{
  let r=fresh();r=enemy(turn(r,{type:'reply',tone:'jab'}));
  const first=roastReplyPreview(fresh(),'jab'),repeat=roastReplyPreview(r,'jab');
  expect(repeat.repeated).toBe(true);expect(repeat.damage).toBeLessThan(first.damage);expect(repeat.crowd).toBeLessThan(0);
  const before=r.crowd;r=turn(r,{type:'reply',tone:'jab'});
  const withReply=r.crowd;r=enemy(r);expect(r.crowd).toBeLessThan(withReply);expect(r.crowd).toBeLessThan(before);
  r=fresh();r.enemyHp=1;r.crowd=80;r=turn(r,{type:'reply',tone:'jab'});
  expect(r.round).toBe(1);expect(r.crowd).toBeLessThan(40);expect(r.repeat).toBe(0);expect(r.lastMove).toBeNull();
 });
 it('spends a Special once and applies its resident kit immediately, without a timing command',()=>{
  let r=fresh();expect(()=>turn(r,{type:'special'})).toThrow('three hype');
  r.team[0].hype=3;r=turn(r,{type:'special'});
  expect(r.team[0].hype).toBe(0);expect(r.enemyHp).toBeLessThan(96);expect(r.weakened).toBe(true);
  expect(r.phase).toBe('enemy');expect(r.pending).toBeNull();
  const healer=fresh();healer.active=1;healer.team[1].hp-=30;healer.team[1].hype=3;
  const supportPreview=roastSpecialPreview(healer),support=turn(healer,{type:'special'});
  expect(support.events.at(-1)!.damage).toBe(supportPreview.damage);expect(supportPreview.damage).toBeLessThan(r.events.at(-1)!.damage);expect(support.team[1].hp).toBeGreaterThan(healer.team[1].hp);expect(support.shield).toBe(true);
  expect(()=>advanceRoastPractice(r,{type:'roast-resolve',matchId:r.id,step:r.step,input:'tap'},now)).toThrow('no timing');
 });
 it('keeps props finite, clears temporary defenses on the enemy response, and auto-tags survivors',()=>{
  let r=fresh();r.team[0].hp=40;r=turn(r,{type:'prop',propId:'copium'});
  const hp=r.team[0].hp,enemyHp=r.enemyHp;r=enemy(r);
  expect(r.team[0].hp).toBe(hp);expect(r.enemyHp).toBe(enemyHp-14);expect(r.copium).toBe(false);
  expect(()=>turn(r,{type:'prop',propId:'copium'})).toThrow('already');
  r=fresh();r.team[0].hp=1;r=enemy(turn(r,{type:'reply',tone:'jab'}));
  expect(r.active).toBe(1);expect(r.team[0].hp).toBe(0);
  expect(()=>turn(r,{type:'switch',slot:0})).toThrow('standing');
 });
 it('keeps collision damage truthful and finite even when it finishes an act',()=>{
  let r=fresh();r.crowd=40;r.enemyHp=35;
  const preview=roastReplyPreview(r,'jab');expect(preview.collision).toBeGreaterThan(0);
  r=turn(r,{type:'reply',tone:'jab'});
  expect(r.events.at(-1)!.damage).toBe(preview.damage);expect(r.events.at(-1)!.collision).toBe(true);expect(r.collisions).toContain(0);
 });
 it('finishes all three opponents with loaners using decisions rather than perfect timing',()=>{
  const finished=complete(fresh());
  expect(finished.winner).toBe('player');expect(finished.round).toBe(2);expect(finished.enemyHp).toBe(0);
  expect(finished.turn).toBeLessThan(25);expect(finished.perfects).toBe(0);expect(finished.rewarded).toBe(false);
  expect(finished.team.some(f=>f.hp>0)).toBe(true);expect(roastSchema.parse(JSON.parse(JSON.stringify(finished)))).toEqual(finished);
 });
 it('awards the account show once without leaking rewards or mutations from rehearsal',()=>{
  const original=initialSave(now,'spectator'),snapshot=structuredClone(original);
  const practiced=complete(fresh());expect(practiced.rewarded).toBe(false);expect(original).toEqual(snapshot);
  let saved=account(original,{type:'roast-start',matchId:'paid-show',team:loaners,mode:'steady',version:2});
  for(let i=0;i<80&&saved.roast!.phase!=='finished';i++){
   const r=saved.roast!;
   saved=account(saved,r.phase==='enemy'?{type:'roast-enemy',matchId:r.id,step:r.step}:{type:'roast-act',matchId:r.id,step:r.step,action:choose(r)});
  }
  expect(saved.roast!.winner).toBe('player');expect(saved.roast!.rewarded).toBe(true);
  expect(saved.packBalance).toBe(original.packBalance+1);expect(saved.totalXp).toBe(60);
  expect(saved.battle).toEqual(original.battle);expect(saved.inventory).toEqual(original.inventory);
  expect(decodeSave(JSON.parse(JSON.stringify(saved)))).toEqual(saved);
 });
 it('preserves input on failures, rejects stale ids/steps, and bounds a no-damage stall',()=>{
  const original=fresh(),snapshot=structuredClone(original),next=turn(original,{type:'reply',tone:'jab'});
  expect(original).toEqual(snapshot);
  expect(()=>advanceRoastPractice(next,{type:'roast-enemy',matchId:next.id,step:0},now)).toThrow('advanced');
  expect(()=>advanceRoastPractice(next,{type:'roast-enemy',matchId:'other',step:next.step},now)).toThrow('no longer active');
  expect(()=>advanceRoastPractice(original,{type:'roast-start',matchId:'other',team:loaners,mode:'steady',version:2},now)).toThrow('outside');
  let stall=fresh();stall.turn=35;
  stall=turn(stall,{type:'switch',slot:1});
  expect(stall.phase).toBe('finished');expect(stall.winner).toBe('enemy');expect(stall.reason).toBe('timeout');expect(stall.rewarded).toBe(false);
  expect(roastSchema.safeParse({...fresh(),phase:'window',pending:{kind:'dodge',openedAt:now.toISOString(),duration:4000}}).success).toBe(false);
 });
});
