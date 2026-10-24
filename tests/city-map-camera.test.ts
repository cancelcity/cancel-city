import {describe,expect,it} from 'vitest';
import {cityZoomLimit} from '../src/domain/city-map-camera';
import {CITY_ATLAS_DISTRICTS,CITY_ATLAS_OVERVIEW_ART} from '../src/data/city-atlas';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

describe('city illustration detail budget',()=>{
 it('never magnifies a desktop map beyond source detail',()=>{
  expect(cityZoomLimit(1672,1920)).toBe(1);
  expect(cityZoomLimit(1672,1200)).toBeCloseTo(1.3933,3);
  expect(cityZoomLimit(1672,1200,2)).toBe(1);
  expect(cityZoomLimit(1672,500)).toBe(1.65);
  expect(cityZoomLimit(1672,0)).toBe(1);
 });
 it('ships a separate full scene for all six districts',()=>{
  expect(new Set(CITY_ATLAS_DISTRICTS.map(d=>d.art)).size).toBe(6);
  for(const district of CITY_ATLAS_DISTRICTS){
   expect(district.art).not.toBe(CITY_ATLAS_OVERVIEW_ART);
   expect(district.focus.zoom).toBe(1);
   expect(existsSync(fileURLToPath(new URL(`../public${district.art}`,import.meta.url)))).toBe(true);
  }
 });
});
