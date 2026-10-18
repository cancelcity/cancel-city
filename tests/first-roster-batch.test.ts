import {describe,it,expect} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import records from '../src/data/catalogue.json';
import {CARDS,CARD_BY_ID,RARITIES,type Card} from '../src/data/cards';
import {EXPANSION_RESIDENTS} from '../src/data/expansion';
import {MEGA_RESIDENTS} from '../src/data/mega';
import {FIRST_ROSTER_BATCH,FIRST_ROSTER_BY_ID} from '../src/data/first-roster-batch';
import {SECOND_ROSTER_BY_ID} from '../src/data/second-roster-batch';
import {INTERNET_PROFILES,MEME_POSTS} from '../src/data/internet';
import {KITS} from '../src/data/combat-kit';
import {initialSave,decodeSave,quantity,rollPack,validateCatalogue} from '../src/domain/game';
import {createMatch,takeTurn,LOANERS,matchSchema} from '../src/domain/battle';
import {previewSpecial,specialPlayback,CinematicClock,cinematicDuration} from '../src/domain/cinematic';
import {liveSceneAssets} from '../src/components/live-scene-painter';
import cast from '../src/data/actor-cast.json';
import {portraitSourceSet} from '../src/data/portrait-delivery';

describe('first 12 presentation-only roster replacements',()=>{
 const original=[...(records as Card[]),...EXPANSION_RESIDENTS,...MEGA_RESIDENTS];
 it('preserves all 113 ordered IDs, stats, factions, rarities, sets, and weights',()=>{
  expect(CARDS).toHaveLength(113);expect(FIRST_ROSTER_BATCH).toHaveLength(12);expect(CARDS.map(c=>c.id)).toEqual(original.map(c=>c.id));expect(()=>validateCatalogue()).not.toThrow();
  expect(RARITIES.map(r=>r.weight)).toEqual([.6,.25,.1,.04,.01]);
  for(const old of original){const card=CARD_BY_ID[old.id];for(const key of ['id','number','rarity','faction','setId','stats'] as const)expect(card[key],`${old.id}:${key}`).toEqual(old[key]);if(!FIRST_ROSTER_BY_ID[old.id]&&!SECOND_ROSTER_BY_ID[old.id])expect(card).toEqual(old);}
 });
 it('keeps existing owned copies, foil counts, pending fights, and rewards on reload',()=>{
  const s=initialSave(new Date('2026-10-14T12:00:00Z'),'roster-owner');
  for(const r of FIRST_ROSTER_BATCH){s.inventory[r.id]={regular:4,foil:1};s.discoveredCardIds.push(r.id);}
  s.battle.active=createMatch('old-fight','street',['CC007','CC012','CC016'],{version:3});
  const before=JSON.stringify(s),loaded=decodeSave(JSON.parse(before));expect(JSON.stringify(loaded)).toBe(before);
  for(const r of FIRST_ROSTER_BATCH)expect(quantity(loaded,r.id)).toEqual({regular:4,foil:1});
 });
 it('does not change deterministic pull ordering or duplicate pools',()=>{
  for(const seed of [0,.23,.72,.98]){let n=0;const values=[seed,.22,.7,.3,.95,.2,.999,.9,.86,.1];const rolled=rollPack(()=>values[n++]);n=0;const baseline=Array.from({length:5},()=>{const z=values[n++];let sum=0;const rarity=RARITIES.find(r=>(sum+=r.weight)>z)!;const pool=original.filter(c=>c.rarity===rarity.id);return pool[Math.floor(values[n++]*pool.length)].id;});expect(rolled).toEqual(baseline);}
 });
 it('uses the authored kits and real ally/enemy targets, without mutation',()=>{
  expect(KITS.CC001).toEqual({bonus:18,weaken:true,style:'ratio'});expect(KITS.CC007).toEqual({bonus:0,heal:28,teamHeal:8,style:'wellness'});expect(KITS.CC012).toEqual({bonus:0,heal:20,shield:.6,recharge:1,style:'riot'});expect(KITS.CC016).toEqual({bonus:0,teamHeal:15,shield:.6,style:'propaganda'});expect(KITS.CC058).toEqual({bonus:0,heal:18,teamHeal:6,cleanse:true,shield:.35,style:'wellness'});
  for(const r of FIRST_ROSTER_BATCH){const other=LOANERS.filter(id=>id!==r.id).slice(0,2),m=createMatch('roster-'+r.id,'street',[r.id,...other],{version:3});m.player[0].charge=3;m.player[0].hp=35;const before=JSON.stringify(m),after=takeTurn(m,'player',{type:'ability'}),e=after.events.at(-1)!,p=specialPlayback(after,e);expect(JSON.stringify(m)).toBe(before);expect(matchSchema.safeParse(after).success).toBe(true);expect(p.support).toBe(KITS[r.id].bonus===0);expect(e.targetSide).toBe(p.support?'player':'enemy');expect(p.damage).toBe(e.damage);if(p.support)expect(p.damage).toBe(0);}
 });
 it('updates portraits, lore profiles and memes and loads six intact pose sprites',()=>{
  for(const r of FIRST_ROSTER_BATCH){expect(CARD_BY_ID[r.id].name).toBe(r.name);expect(INTERNET_PROFILES[r.id].tags).toContain(r.name);expect(INTERNET_PROFILES[r.id].post).toBe(r.quote);for(const post of MEME_POSTS.filter(p=>p.cardId===r.id))expect(post.caption).toBe(r.description);const actor=cast[r.id as keyof typeof cast];expect(actor.poses).toHaveLength(6);for(const p of actor.poses)expect(p.src).toContain('roster-v2');for(const url of liveSceneAssets({kind:'special',playback:previewSpecial(r.id),progress:0,reduced:false}))expect(existsSync(`public${url}`),url).toBe(true);}
 });
 it('retains full/quick/reduced timing and never double-commits impact',()=>{
  expect(cinematicDuration('full',false)).toBe(4800);expect(cinematicDuration('quick',false)).toBe(1200);expect(cinematicDuration('full',true)).toBe(650);
  const clock=new CinematicClock('full',false);expect(clock.skip()).toMatchObject({emitImpact:true,emitComplete:true});expect(clock.skip()).toMatchObject({emitImpact:false,emitComplete:false});
  const painter=readFileSync('src/components/first-roster-painter.ts','utf8');expect(painter).not.toContain('pixi');expect(painter).toContain('if(!r||a.duoId)return false');
 });
 it('uses the matching new portrait at both phone and desktop sizes',()=>{
  for(const r of FIRST_ROSTER_BATCH){const card=CARD_BY_ID[r.id],source=portraitSourceSet(card);expect(source).toBe(`/assets/roster-v3/${r.id}-small.webp 384w, /assets/roster-v3/${r.id}.webp 896w`);for(const candidate of source.split(', ')){const url=candidate.split(' ')[0];expect(existsSync(`public${url}`),url).toBe(true);}expect(source).not.toContain(`/residents/${r.id}`);}
  expect(portraitSourceSet(CARD_BY_ID.CC026)).toBe('/assets/residents/CC026-small.webp 384w, /assets/residents/CC026.webp 896w');
  expect(portraitSourceSet(CARD_BY_ID.CC043)).toBe('/assets/residents/CC043-small.webp 320w, /assets/residents/CC043.webp 896w');
 });
});
