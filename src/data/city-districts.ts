import {CITY_ZONE_BY_ID,type CityZoneId} from './city-zones';

export type CityDistrictId='cloutside'|'liability-hills';
export interface CityDistrict {
 id:CityDistrictId;
 name:string;
 kicker:string;
 tagline:string;
 intro:string;
 art:string;
 color:string;
 buildings:readonly {id:CityZoneId;x:number;y:number}[];
}

// Coordinates are percentages of each district's illustrated map. Every venue belongs to one district.
export const CITY_DISTRICTS=[
 {
  id:'cloutside',name:'Cloutside',kicker:'THE BLOCK / FOUR SPECIALIST BUILDINGS',
  tagline:'EVERYBODY’S LOCAL. THE PRICES AREN’T.',
  intro:'The barbershop debate has outlasted three haircuts. Across the road, a reseller is charging rent money for trainers and the label wants a cut of your fucking ringtone. Four doors, four very different ways to get overcharged.',
  art:'/assets/city-v3/district-cloutside.webp',color:'#f5bb48',
  buildings:[{id:'fade-court',x:25,y:29},{id:'sole-custody',x:74,y:30},{id:'kfc',x:25,y:71},{id:'360-records',x:75,y:71}],
 },
 {
  id:'liability-hills',name:'Liability Hills',kicker:'GATED EXCESS / FIVE SPECIALIST BUILDINGS',
  tagline:'THE GATES ARE HIGHER THAN THEIR STANDARDS.',
  intro:'Yachts, oil deliveries, trophy egos and a museum charging admission to a comeback that still hasn’t happened. Every address here has a publicist. None of them answers a straight fucking question.',
  art:'/assets/city-v3/district-liability-hills.webp',color:'#d4a6ff',
  buildings:[{id:'oscar-studios',x:23,y:26},{id:'oil-manor',x:75,y:26},{id:'red-flag-house',x:50,y:50},{id:'yacht-club',x:23,y:74},{id:'moonwalk-museum',x:75,y:74}],
 },
] as const satisfies readonly CityDistrict[];

export const CITY_DISTRICT_BY_ID:Record<CityDistrictId,CityDistrict>={cloutside:CITY_DISTRICTS[0],'liability-hills':CITY_DISTRICTS[1]};
export const districtForBuilding=(id:CityZoneId):CityDistrict=>CITY_DISTRICT_BY_ID[CITY_ZONE_BY_ID[id].districtId];
