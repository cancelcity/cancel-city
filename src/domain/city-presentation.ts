import type {City,CityBuilding} from './city';
import type {SceneTiming} from './cinematic';
export const CITY_REVEAL_TIMING:SceneTiming={full:4100,impact:2819,short:700,shortImpact:458,reduced:450,reducedImpact:0,normal:0};
export const LOOT_REVEAL_TIMING:SceneTiming={full:1700,impact:1050,short:650,shortImpact:402,reduced:450,reducedImpact:0,normal:0};
export interface CityReveal {plot:number;before:CityBuilding|null;after:CityBuilding;spent:number;founding:boolean;preview?:boolean}
export function constructionChange(before:City|null,after:City|null):CityReveal|null{
 if(!after)return null;
 const plot=after.plots.findIndex((b,i)=>b&&(!before?.plots[i]||b.kind!==before.plots[i]?.kind||b.level!==before.plots[i]?.level));
 if(plot<0)return null;return {plot,before:before?.plots[plot]||null,after:after.plots[plot]!,spent:before?Math.max(0,before.influence-after.influence):0,founding:!before};
}
export function cameraTarget(x:number,y:number,worldWidth:number,worldHeight:number,viewportWidth:number,viewportHeight:number){
 return {left:Math.min(Math.max(0,worldWidth-viewportWidth),Math.max(0,x/1600*worldWidth-viewportWidth/2)),top:Math.min(Math.max(0,worldHeight-viewportHeight),Math.max(0,y/1050*worldHeight-viewportHeight*.62))};
}
