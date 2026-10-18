import {describe,it,expect} from 'vitest';
import {places,clampCamera,fitCamera,screenPoint,worldPoint,routePoint,ROAD,WALKS} from '../src/domain/living-city';
import {pickWorld,type Hit} from '../src/components/living-city-painter';
import {applyCommand,initialSave,type Command,type Save} from '../src/domain/game';
describe('living city scene and existing economy',()=>{
 it('keeps the camera inside the world at desktop, portrait and ultrawide sizes',()=>{
  for(const [w,h] of [[1600,900],[390,650],[2500,720]])for(const zoom of [.01,100]){
   const c=clampCamera({x:-1000,y:5000,zoom},w,h),base=fitCamera(w,h).zoom;
   expect(c.zoom).toBeGreaterThanOrEqual(base);expect(c.zoom).toBeLessThanOrEqual(base*2.15);
   expect(c.x-w/(2*c.zoom)).toBeGreaterThanOrEqual(-.00001);expect(c.x+w/(2*c.zoom)).toBeLessThanOrEqual(1920.00001);
   expect(c.y-h/(2*c.zoom)).toBeGreaterThanOrEqual(-.00001);expect(c.y+h/(2*c.zoom)).toBeLessThanOrEqual(1120.00001);
  }
 });
 it('selects visible foreground pixels and passes through transparent artwork after camera movement',()=>{
  const camera={x:1150,y:650,zoom:1.65},w=1600,h=900,p={x:1430,y:600},screen=screenPoint(p,camera,w,h);
  expect(worldPoint(screen,camera,w,h)).toEqual(p);
  const hits:Hit[]=[{id:'front',src:'front',x:1400,y:550,width:100,height:100,depth:600},{id:'behind',x:1400,y:550,width:100,height:100,depth:550}];
  expect(pickWorld(hits,screen,camera,w,h)?.id).toBe('front');
  expect(pickWorld(hits,screen,camera,w,h,{front:()=>false})?.id).toBe('behind');
  expect(pickWorld(hits,{x:0,y:0},camera,w,h)).toBeUndefined();
 });
 it('keeps traffic and pedestrian paths finite across loop boundaries',()=>{
  for(const route of [ROAD,...WALKS])for(const distance of [-1,0,100,2000,50000]){
   const point=routePoint(route,distance);expect(Object.values(point).every(Number.isFinite)).toBe(true);
   expect(point.x).toBeGreaterThanOrEqual(Math.min(...route.map(p=>p.x)));expect(point.x).toBeLessThanOrEqual(Math.max(...route.map(p=>p.x)));
  }
 });
 it('connects the first job, two saved openings, reward, visible tower upgrade and palace lease without consuming cards',()=>{
  const now=new Date('2026-10-16T12:00:00Z');let seq=0,s=initialSave(now,'new-citizen');
  const command=(c:Command)=>{s=applyCommand(s,c,now,()=>0,`block-${++seq}`,s.revision);};
  command({type:'city-start'});command({type:'city-accept',contractId:'feed:1'});
  for(let i=0;i<2;i++){command({type:'open',sessionId:`opening-${i}`});command({type:'reveal',count:5});command({type:'acknowledge'});}
  const packs=s.packBalance,inventory=structuredClone(s.inventory);
  command({type:'city-claim',contractId:'feed:1'});expect(s.packBalance).toBe(packs+1);expect(s.city!.influence).toBe(250);
  command({type:'city-upgrade',plot:0});expect(s.city!.influence).toBe(130);expect(s.inventory).toEqual(inventory);
  expect(places(s.city).find(p=>p.id==='plot-0')?.src).toBe('/assets/city/feed-l2.webp');
  command({type:'city-build',plot:1,kind:'afterparty'});expect(s.city!.influence).toBe(60);
  expect(places(s.city).find(p=>p.id==='plot-1')?.src).toBe('/assets/living-city/palace.webp');
  expect(()=>command({type:'city-claim',contractId:'feed:1'})).toThrow('already collected');
 });
});
