import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import records from '../src/data/catalogue.json';
import {CARDS,CARD_BY_ID,RARITIES,type Card} from '../src/data/cards';
import {EXPANSION_RESIDENTS} from '../src/data/expansion';
import {MEGA_RESIDENTS} from '../src/data/mega';
import {rosterPresentation,FIRST_ROSTER_BATCH} from '../src/data/first-roster-batch';
import {SECOND_ROSTER_BATCH,SECOND_ROSTER_BY_ID} from '../src/data/second-roster-batch';
import {portraitSourceSet} from '../src/data/portrait-delivery';
import {INTERNET_PROFILES,MEME_POSTS} from '../src/data/internet';
import {KITS} from '../src/data/combat-kit';
import {initialSave,decodeSave,quantity,validateCatalogue,rollPack} from '../src/domain/game';
import {createMatch,takeTurn,LOANERS,matchSchema} from '../src/domain/battle';
import {previewSpecial,specialPlayback,CinematicClock,cinematicDuration} from '../src/domain/cinematic';
import {liveSceneAssets} from '../src/components/live-scene-painter';
import {secondRosterCues} from '../src/domain/second-roster-audio';
import cast from '../src/data/actor-cast.json';
import bank from '../docs/roster-idea-bank.json';

describe('second roster replacements',()=>{
 const baseline=[...(records as Card[]),...EXPANSION_RESIDENTS,...MEGA_RESIDENTS].map(rosterPresentation);
 it('preserves the ordered 113-card pool, all gameplay fields and the first batch',()=>{
  expect(CARDS).toHaveLength(113);expect(SECOND_ROSTER_BATCH).toHaveLength(10);expect(CARDS.map(c=>c.id)).toEqual(baseline.map(c=>c.id));expect(RARITIES.map(r=>r.weight)).toEqual([.6,.25,.1,.04,.01]);expect(()=>validateCatalogue()).not.toThrow();
  for(const old of baseline){const card=CARD_BY_ID[old.id];for(const key of ['id','number','stats','rarity','faction','setId'] as const)expect(card[key],`${old.id}:${key}`).toEqual(old[key]);if(!SECOND_ROSTER_BY_ID[old.id])expect(card).toEqual(old);}
  for(const r of FIRST_ROSTER_BATCH)expect(CARD_BY_ID[r.id].art).toBe(`/assets/roster-v3/${r.id}.webp`);
 });
 it('keeps existing ownership, foil quantities, rewards and paused battle state on reload',()=>{
  const s=initialSave(new Date('2026-10-14T12:00:00Z'),'second-roster-owner');for(const r of SECOND_ROSTER_BATCH){s.inventory[r.id]={regular:3,foil:2};s.discoveredCardIds.push(r.id);}s.battle.active=createMatch('paused-before-redraw','street',['CC003','CC008','CC010'],{version:3});s.battle.active.player[0].charge=3;
  const loaded=decodeSave(JSON.parse(JSON.stringify(s)));expect(loaded).toEqual(s);for(const r of SECOND_ROSTER_BATCH)expect(quantity(loaded,r.id)).toEqual({regular:3,foil:2});expect(loaded.awardedRewardIds).toEqual(s.awardedRewardIds);
 });
 it('leaves deterministic draws and rarity pools identical to the previous source',()=>{
  const samples=[0,.99,.61,.01,.87,.21,.97,.54,.999,.35];let i=0;const actual=rollPack(()=>samples[i++]);i=0;const expected=Array.from({length:5},()=>{const n=samples[i++];let sum=0;const r=RARITIES.find(r=>(sum+=r.weight)>n)!,pool=baseline.filter(c=>c.rarity===r.id);return pool[Math.floor(samples[i++]*pool.length)].id;});expect(actual).toEqual(expected);
 });
 it('uses the existing authored kits and committed enemy/support recipients',()=>{
  expect(KITS.CC008).toEqual({bonus:0,heal:25,cleanse:true,shield:.6,style:'wellness'});expect(KITS.CC009).toEqual({bonus:10,teamHeal:10,style:'wellness'});expect(KITS.CC022).toEqual({bonus:6,shield:.6,heal:12,style:'rug'});
  for(const r of SECOND_ROSTER_BATCH){const m=createMatch(`b2-${r.id}`,'street',[r.id,...LOANERS.filter(id=>id!==r.id).slice(0,2)],{version:3});m.player[0].charge=3;m.player[0].hp=34;const before=JSON.stringify(m),after=takeTurn(m,'player',{type:'ability'}),event=after.events.at(-1)!,p=specialPlayback(after,event);expect(JSON.stringify(m)).toBe(before);expect(matchSchema.safeParse(after).success).toBe(true);expect(p.damage).toBe(event.damage);expect(p.heal).toBe(event.heal);expect(p.support).toBe(r.id==='CC008');expect(event.targetSide).toBe(p.support?'player':'enemy');if(p.support)expect(p.damage).toBe(0);}
 });
 it('loads the same portrait identity at phone/desktop sizes and complete pose slots',()=>{
  const actors=cast as Record<string,{baseHeight:number;poses:{src:string;width:number;height:number;anchor:{x:number;y:number}}[]}>;
  for(const r of SECOND_ROSTER_BATCH){expect(CARD_BY_ID[r.id].name).toBe(r.name);expect(portraitSourceSet(CARD_BY_ID[r.id])).toBe(`/assets/roster-b2/${r.id}-small.webp 384w, /assets/roster-b2/${r.id}.webp 896w`);expect(existsSync(`public/assets/roster-b2/${r.id}-small.webp`)).toBe(true);expect(actors[r.id].poses).toHaveLength(6);expect(new Set(actors[r.id].poses.map(p=>p.src)).size).toBeGreaterThanOrEqual(3);for(const p of actors[r.id].poses){expect(p.src).toContain('-b2-');expect(p.anchor.x).toBeGreaterThanOrEqual(0);expect(p.anchor.x).toBeLessThanOrEqual(p.width);expect(p.anchor.y).toBeLessThanOrEqual(p.height);}for(const url of liveSceneAssets({kind:'special',playback:previewSpecial(r.id),progress:0,reduced:false}))expect(existsSync(`public${url}`),url).toBe(true);}
 });
 it('updates lore/posts and retains the supplied idea bank without growing gameplay roster',()=>{
  for(const r of SECOND_ROSTER_BATCH){expect(INTERNET_PROFILES[r.id].tags).toContain(r.name);expect(INTERNET_PROFILES[r.id].post).toBe(r.quote);for(const p of MEME_POSTS.filter(p=>p.cardId===r.id))expect(p.caption).toBe(r.description);}
  expect(JSON.stringify(bank)).toContain('Walter Black');expect(JSON.stringify(bank)).toContain('Master Cheese');expect(CARDS).toHaveLength(113);
 });
 it('keeps normal, quick and reduced timing, exactly-once skip, original Karen, and unique cues',()=>{
  expect(cinematicDuration('full',false)).toBe(4800);expect(cinematicDuration('quick',false)).toBe(1200);expect(cinematicDuration('full',true)).toBe(650);const clock=new CinematicClock('full',false);expect(clock.skip()).toMatchObject({emitImpact:true,emitComplete:true});expect(clock.skip()).toMatchObject({emitImpact:false,emitComplete:false});
  for(const r of SECOND_ROSTER_BATCH){const cues=secondRosterCues(r.id,1);expect(new Set(cues.map(c=>c.key)).size).toBe(cues.length);expect(cues.length).toBeGreaterThan(1);for(const cue of cues)expect(cue.at).toBeLessThan(1);}
  const runtime=readFileSync('src/components/special-cinematic.tsx','utf8');expect(runtime).not.toContain("from './karen-cinematic'");expect(readFileSync('src/components/second-roster-painter.ts','utf8')).toContain('if(!r||a.duoId)return false');
 });
});
