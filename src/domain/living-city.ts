import type {City} from './city';
import type {BuildingKind} from '../data/city';
export type Point={x:number;y:number};
export type Camera=Point&{zoom:number};
export type Place={id:string;x:number;y:number;width:number;src:string;plot?:number;kind?:BuildingKind};
export const SIZE={width:1920,height:1120};
export const SITES=[{x:1430,y:600,width:350},{x:390,y:640,width:470},{x:1440,y:340,width:280},{x:1710,y:660,width:280},{x:1720,y:960,width:330},{x:1390,y:1040,width:280},{x:160,y:390,width:240},{x:470,y:335,width:260},{x:760,y:285,width:250},{x:1100,y:285,width:250},{x:1700,y:350,width:250},{x:145,y:940,width:280}];
export const places=(city:City|null):Place[]=>[
 {id:'court',x:940,y:615,width:520,src:'/assets/living-city/court.webp'},
 {id:'packs',x:845,y:1050,width:410,src:'/assets/living-city/packs.webp'},
 ...SITES.map((p,plot)=>{const b=city?.plots[plot];return {...p,id:`plot-${plot}`,plot,kind:b?.kind,src:b?.kind==='afterparty'?'/assets/living-city/palace.webp':b?`/assets/city/${b.kind}-l${b.level}.webp`:plot===1?'/assets/living-city/palace.webp':''};}),
];
export const ROAD:Point[]=[{x:-180,y:630},{x:380,y:710},{x:920,y:675},{x:1550,y:785},{x:2100,y:700}];
export const WALKS:Point[][]=[
 [{x:-90,y:585},{x:350,y:635},{x:585,y:600},{x:920,y:605},{x:1215,y:650},{x:1570,y:715},{x:2050,y:650}],
 [{x:-90,y:765},{x:345,y:800},{x:590,y:775},{x:920,y:755},{x:1220,y:795},{x:1570,y:880},{x:2050,y:800}],
 [{x:470,y:1200},{x:510,y:950},{x:550,y:790},{x:585,y:620},{x:620,y:310}],
 [{x:1340,y:1200},{x:1310,y:920},{x:1300,y:810},{x:1300,y:590},{x:1340,y:310}],
];
export const routeLength=(r:Point[])=>r.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-r[i].x,p.y-r[i].y),0);
export function routePoint(r:Point[],distance:number){const total=routeLength(r);let d=((distance%total)+total)%total;for(let i=1;i<r.length;i++){const a=r[i-1],b=r[i],len=Math.hypot(b.x-a.x,b.y-a.y);if(d<=len)return {x:a.x+(b.x-a.x)*d/len,y:a.y+(b.y-a.y)*d/len,angle:Math.atan2(b.y-a.y,b.x-a.x)};d-=len;}return {...r[0],angle:0};}
export const fitCamera=(w:number,h:number):Camera=>({x:960,y:560,zoom:Math.max(w/1920,h/1120)});
export function clampCamera(c:Camera,w:number,h:number):Camera{const base=fitCamera(w,h).zoom,zoom=Math.max(base,Math.min(base*2.15,c.zoom)),x=w/2/zoom,y=h/2/zoom;return {zoom,x:Math.max(x,Math.min(1920-x,c.x)),y:Math.max(y,Math.min(1120-y,c.y))};}
export const screenPoint=(p:Point,c:Camera,w:number,h:number)=>({x:(p.x-c.x)*c.zoom+w/2,y:(p.y-c.y)*c.zoom+h/2});
export const worldPoint=(p:Point,c:Camera,w:number,h:number)=>({x:(p.x-w/2)/c.zoom+c.x,y:(p.y-h/2)/c.zoom+c.y});
export const LOCAL_LINES:Record<string,string>={CC063:'Infinity. Still cannot skip the queue.',CC064:'One punch. Three unpaid parking tickets.',CC066:'Second in line. Somehow second again.',CC135:'Your order is ready. Your kingdom is not.',CC023:'One ring. Twelve hidden service fees.'};
