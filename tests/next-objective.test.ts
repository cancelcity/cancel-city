import {describe,it,expect} from 'vitest';
import {initialSave,applyCommand,type Save} from '../src/domain/game';
import {createMatch,DISTRICTS,LOANERS} from '../src/domain/battle';
import {freshCity} from '../src/domain/city';
import {freshRoast} from '../src/domain/roast';
import {courtQuery,courtDistrict} from '../src/domain/court';
import {nextObjective} from '../src/domain/next-objective';
const now=new Date('2026-10-26T12:00:00Z');
function established(){const s=initialSave(now,'objectives');s.battle.wins=1;s.battle.clearedDistrictIds=['street'];s.awardedRewardIds.push('battle:street');return s;}
function cityPlayer(){const s=established();s.city=freshCity(now);return s;}
function campaignComplete(){const s=cityPlayer();s.battle.clearedDistrictIds=DISTRICTS.map(d=>d.id);s.awardedRewardIds.push(...DISTRICTS.filter(d=>d.id!=='street').map(d=>`battle:${d.id}`));return s;}
describe('next playable objective',()=>{
 it('preserves the starter lessons and puts pending activity before new goals',()=>{
  expect(nextObjective(null,now)).toMatchObject({kind:'pack',href:'/packs/'});
  let s=established();s.battle.active=createMatch('active','media',LOANERS,{version:5});expect(nextObjective(s,now)).toMatchObject({kind:'battle',href:'/battle/',shortAction:'RESUME'});
  s.battle.active=null;s.roast=freshRoast('show',LOANERS,'steady',now,2);expect(nextObjective(s,now).href).toBe('/roast/');
  s=applyCommand(s,{type:'open',sessionId:'pending'},now,()=>0,'open',s.revision);expect(nextObjective(s,now)).toMatchObject({kind:'reveal',href:'/packs/'});
 });
 it('directs a completed starter to the actual block builder, then the next unlocked case',()=>{
  const s=established();expect(nextObjective(s,now)).toMatchObject({kind:'found',href:'/city/?view=block'});
  s.city=freshCity(now);const goal=nextObjective(s,now);expect(goal).toMatchObject({kind:'campaign',progress:{value:1,total:6}});
  const query=courtQuery(new URLSearchParams(goal.href.split('?')[1]));expect(query).toEqual({district:'media',mode:'campaign'});expect(courtDistrict(query.district!,query.mode!,s.battle.clearedDistrictIds)).toBe('media');
 });
 it('offers a completed manual job before another fight, and moves on after its real claim',()=>{
  let s=cityPlayer();s.activity.dailyOpened=2;expect(nextObjective(s,now)).toMatchObject({kind:'claim',href:'/missions/?tab=daily'});
  s=applyCommand(s,{type:'claim-mission',missionId:'daily-open'},now,()=>0,'claim',s.revision);expect(nextObjective(s,now).kind).toBe('campaign');
  expect(nextObjective(s,new Date('2026-10-27T12:00:00Z')).kind).toBe('campaign');
 });
 it('requires a hosted and finished city job before promising a claim',()=>{
  const s=cityPlayer();s.city!.contracts['feed:1']={startedAt:now.toISOString(),progress:2,claimed:false};expect(nextObjective(s,now)).toMatchObject({kind:'city-claim',href:'/missions/?tab=neighbourhood'});
  s.city!.plots[0]!.residentId=null;expect(nextObjective(s,now).kind).toBe('campaign');
 });
 it('keeps an open story ahead of other activities and never advertises a fixed verdict prize',()=>{
  const s=cityPlayer();s.airfryer.phase='hearing';expect(nextObjective(s,now)).toMatchObject({kind:'case',href:'/battle/?case=airfryer'});expect(nextObjective(s,now).benefit).toContain('based on your choices');
 });
 it('gives campaign finishers a first-clear show, then the city case, then the daily battle',()=>{
  const s=campaignComplete();expect(nextObjective(s,now).kind).toBe('roast');s.awardedRewardIds.push('encounter:roast-night');expect(nextObjective(s,now)).toMatchObject({kind:'case',href:'/missions/?tab=cases'});
  s.airfryer.phase='resolved';expect(nextObjective(s,now)).toMatchObject({kind:'daily',href:'/battle/?crew=1&mode=daily'});s.awardedRewardIds.push('daily-battle:2026-10-26');expect(nextObjective(s,now).kind).toBe('city');expect(nextObjective(s,new Date('2026-10-27T12:00:00Z')).kind).toBe('daily');
 });
 it('does not change saves or grant rewards just for recommending a goal',()=>{const s:Save=cityPlayer(),before=JSON.stringify(s);nextObjective(s,now);expect(JSON.stringify(s)).toBe(before);});
 it('rejects unknown battle destinations and keeps normal campaign locks on deep links',()=>{expect(courtQuery(new URLSearchParams('district=nope&mode=admin'))).toEqual({district:undefined,mode:undefined});expect(courtDistrict(courtQuery(new URLSearchParams('district=algorithm')).district!,'campaign',['street'])).toBe('street');});
});
