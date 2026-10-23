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
  id:'cloutside',name:'Cloutside',kicker:'THE BLOCK / FIVE SPECIALIST BUILDINGS',
  tagline:'EVERYBODY’S LOCAL. THE PRICES AREN’T.',
  intro:'The dispensary has a very loyal police inspector. Outside, the Plug is losing customers to a receipt printer. Up the block, the barber is still arguing, the reseller still wants rent money and the label still owns your ringtone. Five doors. Somebody’s always getting taken for a ride.',
  art:'/assets/city-v4/corner-exterior.webp',color:'#f5bb48',
  buildings:[{id:'probable-cause',x:50,y:45},{id:'fade-court',x:25,y:29},{id:'sole-custody',x:74,y:30},{id:'kfc',x:25,y:71},{id:'360-records',x:75,y:71}],
 },
 {
  id:'liability-hills',name:'Liability Hills',kicker:'GATED EXCESS / FIVE SPECIALIST BUILDINGS',
  tagline:'THE GATES ARE HIGHER THAN THEIR STANDARDS.',
  intro:'Gobstein’s charity gala has a bar tab, an unpaid dock invoice and no actual charity. Oscar has donated his presence. The supplier has brought five hundred bottles to the wrong event. Read the harbour office invoice, then ask Oscar for the guest list. Four more questionable addresses are up the hill.',
  art:'/assets/city-v5/hills-waterfront.webp',color:'#d4a6ff',
  buildings:[{id:'oscar-studios',x:23,y:26},{id:'oil-manor',x:75,y:26},{id:'red-flag-house',x:50,y:50},{id:'yacht-club',x:23,y:74},{id:'moonwalk-museum',x:75,y:74}],
 },
] as const satisfies readonly CityDistrict[];

export const CITY_DISTRICT_BY_ID:Record<CityDistrictId,CityDistrict>={cloutside:CITY_DISTRICTS[0],'liability-hills':CITY_DISTRICTS[1]};
export const districtForBuilding=(id:CityZoneId):CityDistrict=>CITY_DISTRICT_BY_ID[CITY_ZONE_BY_ID[id].districtId];
