/** Never promise detail beyond the source. At base fit, large displays may still
 * exceed the raster; further enlargement is disabled rather than inventing pixels. */
export function cityZoomLimit(sourceWidth:number,worldWidth:number,dpr=1){
 if(!Number.isFinite(worldWidth)||worldWidth<=0)return 1;
 const density=Math.max(1,Math.min(1.5,Number.isFinite(dpr)?dpr:1));
 return Math.max(1,Math.min(1.65,sourceWidth/(worldWidth*density)));
}
