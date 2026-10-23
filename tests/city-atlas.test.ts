import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {describe,expect,it} from 'vitest';
import {CARD_BY_ID,FACTIONS} from '../src/data/cards';
import {CITY_ATLAS_BUILDINGS,CITY_ATLAS_DISTRICTS,CITY_ATLAS_DISTRICT_BY_ID} from '../src/data/city-atlas';
import {CITY_ZONES} from '../src/data/city-zones';

describe('city atlas destinations',()=>{
 it('covers six distinct districts and 41 unique public addresses',()=>{
  expect(CITY_ATLAS_DISTRICTS).toHaveLength(6);
  expect(new Set(CITY_ATLAS_DISTRICTS.map(district=>district.id)).size).toBe(6);
  expect(CITY_ATLAS_BUILDINGS).toHaveLength(41);
  expect(new Set(CITY_ATLAS_BUILDINGS.map(building=>building.id)).size).toBe(41);
  for(const district of CITY_ATLAS_DISTRICTS)expect(CITY_ATLAS_BUILDINGS.some(building=>building.district===district.id)).toBe(true);
  for(const building of CITY_ATLAS_BUILDINGS)expect(CITY_ATLAS_DISTRICT_BY_ID[building.district],building.id).toBeDefined();
 });

 it('maps every saved venue exactly once, within its original district',()=>{
  const oldDestinations=CITY_ATLAS_BUILDINGS.filter(building=>building.legacyVenue);
  expect(oldDestinations).toHaveLength(CITY_ZONES.length);
  for(const venue of CITY_ZONES){
   const matches=oldDestinations.filter(building=>building.legacyVenue===venue.id);
   expect(matches,venue.id).toHaveLength(1);
   expect(matches[0].district,venue.id).toBe(venue.districtId);
  }
 });

 it('gives each address one useful primary target and uses current character IDs',()=>{
  for(const building of CITY_ATLAS_BUILDINGS){
   expect([building.legacyVenue,building.action,building.href].filter(Boolean),building.id).toHaveLength(1);
   expect(building.actionLabel.trim().length,building.id).toBeGreaterThan(0);
   expect(new Set(building.cast).size,building.id).toBe(building.cast.length);
   for(const id of building.cast)expect(CARD_BY_ID[id],`${building.id}: ${id}`).toBeDefined();
  }
 });

 it('links only to existing local pages with supported query parameters',()=>{
  const gameSource=readFileSync(fileURLToPath(new URL('../src/components/game.tsx',import.meta.url)),'utf8');
  const battleSource=readFileSync(fileURLToPath(new URL('../src/components/court-battle.tsx',import.meta.url)),'utf8');
  for(const building of CITY_ATLAS_BUILDINGS.filter(building=>building.href)){
   const url=new URL(building.href!,'https://cancel-city.test');
   expect(url.origin,building.id).toBe('https://cancel-city.test');
   expect(existsSync(fileURLToPath(new URL(`../app${url.pathname}page.tsx`,import.meta.url))),building.href).toBe(true);
   for(const [key,value] of url.searchParams){
    if(url.pathname==='/collection/'&&key==='faction'){
     expect(FACTIONS.some(faction=>faction.id===value)).toBe(true);
     expect(gameSource).toContain("params.get('faction')");
    }else if(url.pathname==='/battle/'&&key==='practice'){
     expect(value).toBe('1');
     expect(battleSource).toContain("params.get('practice')==='1'");
    }else throw new Error(`Unverified atlas query: ${building.href}`);
   }
  }
  // Character links in the selected-address card use Collection's existing dossier selector.
  expect(gameSource).toContain("params.get('card')");
 });

 it('keeps all map targets finite and entirely within their illustrations',()=>{
  for(const building of CITY_ATLAS_BUILDINGS){
   for(const value of [building.x,building.y,building.width,building.height])expect(Number.isFinite(value),building.id).toBe(true);
   expect(building.width,building.id).toBeGreaterThan(0);
   expect(building.height,building.id).toBeGreaterThan(0);
   expect(building.x-building.width/2,building.id).toBeGreaterThanOrEqual(0);
   expect(building.x+building.width/2,building.id).toBeLessThanOrEqual(100);
   expect(building.y-building.height/2,building.id).toBeGreaterThanOrEqual(0);
   expect(building.y+building.height/2,building.id).toBeLessThanOrEqual(100);
  }
  for(const district of CITY_ATLAS_DISTRICTS){
   const {x,y,width,height}=district.overview;
   expect(x).toBeGreaterThanOrEqual(0);expect(x+width).toBeLessThanOrEqual(100);
   expect(y).toBeGreaterThanOrEqual(0);expect(y+height).toBeLessThanOrEqual(100);
   expect(district.focus.zoom).toBeGreaterThanOrEqual(1);
  }
 });
});
