import {describe,it,expect} from 'vitest';
import {existsSync} from 'node:fs';
import {CARDS} from '../src/data/cards';
import cast from '../src/data/actor-cast.json';
import fit from '../src/data/court-fit.json';
import {createMatch,takeTurn,LOANERS,DISTRICTS,type BattleAction} from '../src/domain/battle';
import {courtDistrict,courtUnlocked,courtSlots,courtPresentationSlots,forecastAction} from '../src/domain/court';
import {courtActorScale} from '../src/components/court-painter';
import {liveSceneAssets} from '../src/components/live-scene-painter';

describe('Screenshot Court',()=>{
 it('keeps campaign locks, all practice cases and the single daily case distinct',()=>{
  expect(DISTRICTS.filter(d=>courtUnlocked(d.id,'campaign')).map(d=>d.id)).toEqual(['street']);
  expect(DISTRICTS.filter(d=>courtUnlocked(d.id,'campaign',['street'])).map(d=>d.id)).toEqual(['street','media']);
  expect(DISTRICTS.every(d=>courtUnlocked(d.id,'practice'))).toBe(true);
  expect(DISTRICTS.filter(d=>courtUnlocked(d.id,'daily',DISTRICTS.map(d=>d.id))).map(d=>d.id)).toEqual(['street']);
  expect(courtDistrict('algorithm','campaign',[])).toBe('street');
  expect(courtDistrict('algorithm','practice',[])).toBe('algorithm');
  expect(courtDistrict('algorithm','daily',[])).toBe('street');
 });
 it('forecasts real attack, special, guard and tag events without touching the committed match',()=>{
  for(const c of CARDS){const m=createMatch('forecast-'+c.id,'street',[c.id,...LOANERS.filter(id=>id!==c.id)].slice(0,3),{version:3});m.player[0].charge=3;m.player[0].hp=25;m.player[0].weakened=true;m.enemy[0].guard=.6;m.enemy[0].exposed=true;
   for(const action of [{type:'attack'},{type:'ability'},{type:'guard'},{type:'switch',slot:1}] as BattleAction[]){const before=JSON.stringify(m),event=forecastAction(m,action);expect(event).toEqual(takeTurn(m,'player',action).events.at(-1));expect(JSON.stringify(m)).toBe(before);}
  }
 });
 it('does not promise illegal specials or turns, and caps predicted damage at remaining health',()=>{
  const m=createMatch('preview','street',LOANERS,{version:3});expect(forecastAction(m,{type:'ability'})).toBeNull();m.enemy[0].hp=1;
  expect(forecastAction(m,{type:'attack'})).toMatchObject({damage:1,knockout:true});
  const next=takeTurn(m,'player',{type:'attack'});expect(forecastAction(next,{type:'attack'})).toBeNull();
  expect(forecastAction({...m,phase:'finished'},{type:'attack'})).toBeNull();
 });
 it('has exactly three separate marks and one lead per side after tags and knockouts',()=>{
  const m=createMatch('marks','street',LOANERS,{version:3});const tag=takeTurn(m,'player',{type:'switch',slot:2});m.enemy[0].hp=1;const ko=takeTurn(m,'player',{type:'attack'});
  for(const match of [m,tag,ko]){const before=JSON.stringify(match),slots=[...courtSlots(match,'player'),...courtSlots(match,'enemy')];expect(slots).toHaveLength(6);expect(new Set(slots.map(s=>s.x+','+s.y)).size).toBe(6);for(const side of ['player','enemy'] as const){expect(slots.filter(s=>s.side===side&&s.lead)).toHaveLength(1);expect(slots.find(s=>s.side===side&&s.lead)?.slot).toBe(match[`${side}Active`]);}expect(JSON.stringify(match)).toBe(before);}
 });
 it('slides tag-ins and knockout promotions independently of the HUD impact swap',()=>{
  const before=createMatch('tag-slide','street',LOANERS,{version:3}),after=takeTurn(before,'player',{type:'switch',slot:2}),event=after.events.at(-1)!;
  const positions=(m:typeof before,p:number)=>courtPresentationSlots(m,event,p).map(({slot,side,x,y,height,width})=>({slot,side,x,y,height,width}));
  for(const p of [0,.25,.5,.75,1])expect(positions(before,p)).toEqual(positions(after,p));
  expect(positions(before,0)[0].x).toBe(430);expect(positions(after,1)[2].x).toBe(430);expect(positions(after,.5)[2].x).toBeGreaterThan(260);expect(positions(after,.5)[2].x).toBeLessThan(430);
  before.enemy[0].hp=1;const ko=takeTurn(before,'player',{type:'attack'}),e=ko.events.at(-1)!;
  expect(courtPresentationSlots(ko,e,.7).find(s=>s.side==='enemy'&&s.lead)?.slot).toBe(0);
  expect(courtPresentationSlots(ko,e,1).find(s=>s.side==='enemy'&&s.lead)?.slot).toBe(1);
 });
 it('fits every authored full-body resident to its idle silhouette without per-pose scale changes',()=>{
  expect(Object.keys(fit).sort()).toEqual(Object.keys(cast).sort());
  for(const [id,size] of Object.entries(fit)){for(const [height,width] of [[310,290],[215,135],[187,135]]){const scale=courtActorScale(id,height,width);expect(scale).toBeGreaterThan(0);expect(size.height*scale).toBeLessThanOrEqual(height+.001);expect(size.width*scale).toBeLessThanOrEqual(width+.001);}}
 });
 it('loads the fixed court and every participant asset across the whole roster',()=>{
  for(const c of CARDS){const m=createMatch('assets-'+c.id,'street',[c.id,...LOANERS.filter(id=>id!==c.id)].slice(0,3),{version:3}),urls=liveSceneAssets({kind:'battle',match:m,progress:1,impact:true,reduced:false});expect(urls).toContain('/assets/world/screenshot-court.webp');for(const src of urls)expect(existsSync('public'+src),src).toBe(true);}
 });
});
