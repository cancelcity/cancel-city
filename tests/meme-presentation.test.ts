import {describe,it,expect} from 'vitest';
import {memeShot,memeVerdict,MEME_SPECIALS,pullReaction,selectPullReaction,pullFilmDuration,memeCues} from '../src/domain/meme-presentation';
import {previewSpecial,specialPlayback,cinematicImpactAt,cinematicDuration} from '../src/domain/cinematic';
import {createMatch,takeTurn} from '../src/domain/battle';
import {applyCommand,initialSave,decodeSave,Pull} from '../src/domain/game';
import {CARDS,CARD_BY_ID,RARITIES} from '../src/data/cards';
import {MEME_POSTS} from '../src/data/internet';
import {liveSceneAssets,hasActingPoses} from '../src/components/live-scene-painter';
import {existsSync} from 'node:fs';

describe('comedy presentation uses committed game facts',()=>{
 it('starts the contact shot at the real full and quick impact boundary',()=>{
  for(const id of Object.keys(MEME_SPECIALS) as (keyof typeof MEME_SPECIALS)[])for(const mode of ['full','quick'] as const){const contact=cinematicImpactAt(mode,false)/cinematicDuration(mode,false);expect(memeShot(id,contact-.001)).not.toBe('contact');expect(memeShot(id,contact+.001)).toBe('contact');}
  expect(memeShot('CC001',.405)).toBe('disconnect');for(const id of Object.keys(MEME_SPECIALS) as (keyof typeof MEME_SPECIALS)[])expect(memeShot(id,0,true)).toBe(MEME_SPECIALS[id].shots.at(-1));
 });
 it('uses warning/increase for surviving real targets and ban/eviction only after a real KO',()=>{
  for(const [id,survived,ko] of [['CC001','ACCIDENTAL SKILL','ACCIDENTAL KO'],['CC026','WARNING ISSUED','PERMANENTLY BANNED'],['CC046','RENT INCREASED','EVICTED']]){
   for(const targetHp of [999,1]){const m=createMatch('gag-'+id+targetHp,'street',[id,'CC007','CC012'],{version:3});m.player[0].charge=3;if(targetHp===1)m.enemy[0].hp=1;const after=takeTurn(m,'player',{type:'ability'}),saved=JSON.stringify(after),p=specialPlayback(after,after.events.at(-1)!);expect(memeVerdict(p)).toBe(targetHp===1?ko:survived);expect(JSON.stringify(after)).toBe(saved);}
   expect(memeVerdict({...previewSpecial(id),knockout:true})).toBe('SCENE PREVIEW');
  }
  expect(memeVerdict({...previewSpecial('CC012'),preview:false,support:true})).toBe('SUPPORT APPLIED');
 });
 it('selects reactions from only the newly revealed committed pulls and never mutates them',()=>{
  const common=CARDS.find(c=>c.rarity===RARITIES[0].id)!.id,rare=CARDS.find(c=>c.rarity===RARITIES[2].id)!.id,epic=CARDS.find(c=>c.rarity===RARITIES[3].id)!.id;
  const pulls:Pull[]=[{slot:0,cardId:epic,isNewDiscovery:true,regularQuantityAfter:1},{slot:1,cardId:common,isNewDiscovery:false,regularQuantityAfter:2},{slot:2,cardId:rare,isNewDiscovery:true,regularQuantityAfter:1}];const saved=JSON.stringify(pulls);
  expect(selectPullReaction(pulls)).toBe(pulls[0]);expect(selectPullReaction(pulls.slice(1))).toBe(pulls[1]);expect(selectPullReaction([])).toBeNull();expect(JSON.stringify(pulls)).toBe(saved);
  expect(pullReaction(pulls[1])).toBe('duplicate');expect(pullReaction({...pulls[1],isNewDiscovery:true})).toBe('common');expect(pullReaction(pulls[2])).toBe('rare');expect(pullFilmDuration(pulls[1])).toBeLessThan(pullFilmDuration(pulls[0]));
 });
 it('shows a duplicate when a foil owner pulls their first regular copy, without granting any extra copy on reveal/reload',()=>{
  const now=new Date('2026-10-13T12:00:00Z'),s=initialSave(now,'dupe-owner');s.inventory.CC001={regular:0,foil:1};s.discoveredCardIds=['CC001'];const opened=applyCommand(s,{type:'open',sessionId:'foil-dupe'},now,()=>0,'meme-open',s.revision);const pulls=opened.pendingOpening!.pulls;expect(pulls[0]).toMatchObject({cardId:'CC001',isNewDiscovery:false,regularQuantityAfter:1});expect(pullReaction(pulls[0])).toBe('duplicate');const inventory=JSON.stringify(opened.inventory);let next=opened;for(let i=1;i<=5;i++)next=applyCommand(next,{type:'reveal',count:i},now,()=>{throw new Error('Reveal cannot roll again');},'meme-reveal-'+i,next.revision);expect(JSON.stringify(decodeSave(next).inventory)).toBe(inventory);expect(selectPullReaction(next.pendingOpening!.pulls)).toBe(next.pendingOpening!.pulls[0]);
 });
 it('loads both redraws and all panels from stable existing resident IDs',()=>{
  for(const id of ['CC012','CC027']){expect(hasActingPoses(id)).toBe(true);for(const url of liveSceneAssets({kind:'special',playback:previewSpecial(id),progress:.5,reduced:false}))expect(existsSync(`public${url}`),url).toBe(true);}
  for(const post of MEME_POSTS){expect(CARD_BY_ID[post.cardId]).toBeDefined();for(const panel of post.panels||[])expect(CARD_BY_ID[panel.cardId]).toBeDefined();}expect(new Set(MEME_POSTS.map(p=>p.id)).size).toBe(MEME_POSTS.length);
 });
 it('places distinct sound cues in setup beats, before the authoritative contact',()=>{expect(memeCues('CC001',.38)).toEqual([]);expect(memeCues('CC001',.4)).toMatchObject([{cue:'disconnect',at:.39}]);for(const id of ['CC026','CC046']){const cues=memeCues(id,1);expect(new Set(cues.map(c=>c.key)).size).toBe(cues.length);for(const c of cues)expect(c.at).toBeLessThan(cinematicImpactAt('full',false)/cinematicDuration('full',false));}expect(memeCues('CC012',1)).toEqual([]);});
});
