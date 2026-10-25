'use client';
import {useEffect,useRef,useState} from 'react';
import type {AtlasDistrictId} from '../data/city-atlas';
import walkCycle from '../data/city-walk-cycle.json';
import {useCityMotion} from './city-motion';

export type Scene='overview'|AtlasDistrictId;

export const CITY_SCENE_ATMOSPHERE:Record<Scene,{vibe:string;weather:string;accent:string}>={
 overview:{vibe:'LIVE · 6 DISTRICTS · 41 PUBLIC ADDRESSES',weather:'DUSK EDITION · CLEAR',accent:'#ff169e'},
 cloutside:{vibe:'LIVE · PROBABLE CAUSE & ROAST STAGE',weather:'NEON DUSK · CLEAR',accent:'#ffbe45'},
 'liability-hills':{vibe:'LIVE · PRIVATE HARBOUR & GALA PIER',weather:'HARBOUR EVENING · CLEAR',accent:'#e6bb68'},
 'overtime-downtown':{vibe:'LIVE · OVERTIME HQ & SCREENSHOT COURT',weather:'FLUORESCENT DUSK · CLEAR',accent:'#ffd35e'},
 'rug-street':{vibe:'LIVE · LIQUIDITY FLOOR & RUG EXCHANGE',weather:'AFTER HOURS · CLEAR',accent:'#f4cb57'},
 '404-quarter':{vibe:'LIVE · BAN PRECINCT & SERVER BLOCK',weather:'COOLING MIST · CLEAR',accent:'#4de5fa'},
 'doom-county':{vibe:'LIVE · BUNKER HILL & SALVAGE YARD',weather:'SODIUM GLOW · CLEAR',accent:'#c7e373'},
};

const ROUTES:Record<Scene,{van:string;courier:string;size:number;lamps:number[][]}>={
 overview:{van:'M 460 687 L 576 764 L 692 841 L 801 917',courier:'M 650 814 L 726 859 L 773 877',size:35,lamps:[[618,551],[884,596],[1073,635],[395,651],[1319,605],[1494,744]]},
 'overtime-downtown':{van:'M 887 686 L 996 740 L 1111 797 L 1224 852',courier:'M 1073 700 L 1145 741 L 1210 781',size:48,lamps:[[634,312],[1128,625],[1390,895],[816,776]]},
 'rug-street':{van:'M 1110 468 L 1190 508 L 1274 550',courier:'M 507 838 L 573 806 L 630 787',size:37,lamps:[[526,570],[775,486],[1240,550],[1430,823]]},
 '404-quarter':{van:'M 158 638 L 237 674 L 298 696',courier:'M 1128 641 L 1193 671 L 1255 696',size:36,lamps:[[438,500],[940,452],[1290,703]]},
 cloutside:{van:'M 816 664 L 916 708 L 1015 754',courier:'M 871 646 L 943 675 L 1026 710',size:38,lamps:[[532,425],[765,453],[1284,470],[935,761]]},
 'liability-hills':{van:'M 1008 366 Q 1110 395 1224 457 L 1280 478',courier:'M 1145 680 L 1202 702 L 1255 722',size:32,lamps:[[640,306],[1118,329],[1265,457],[642,868]]},
 'doom-county':{van:'M 112 857 L 220 902 L 298 937',courier:'M 580 435 L 650 467 L 719 493',size:38,lamps:[[540,402],[1150,430],[1290,505],[453,815]]},
};

/** Ambient routines share the scenery's exact street coordinates and never consume input or game rewards. */
export function CityAtlasLife({scene,paused=false}:{scene:Scene;paused?:boolean}){
 const ref=useRef<SVGSVGElement>(null),route=ROUTES[scene],reduced=useCityMotion(),[step,setStep]=useState(0);
 useEffect(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{if(paused||reduced||motion.matches||document.hidden)ref.current?.pauseAnimations();else ref.current?.unpauseAnimations();};
  update();motion.addEventListener('change',update);document.addEventListener('visibilitychange',update);
  const timer=window.setInterval(()=>{
   if(!paused&&!reduced&&!motion.matches&&!document.hidden){
    setStep(value=>(value+1)%walkCycle.length);
   }
  },110);
  return()=>{window.clearInterval(timer);motion.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);};
 },[paused,reduced,scene]);
 const frame=walkCycle[step]||walkCycle[0];
 return <svg ref={ref} viewBox="0 0 1672 941" preserveAspectRatio="none" className="city-atlas-life" data-paused={paused||reduced} aria-hidden="true" focusable="false">
  <g key={`${scene}-van`}>
   <animateMotion path={route.van} dur="31s" repeatCount="indefinite"/>
   <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.05;.8;.9;1" dur="31s" repeatCount="indefinite"/>
   <ellipse cy="2" rx={route.size*.42} ry={route.size*.09} fill="#0b0713" opacity=".65"/>
   <image href="/assets/living-city/van.webp" x={-route.size/2} y={-route.size*.39} width={route.size} height={route.size*.42}/>
  </g>
  <g key={`${scene}-courier`}>
   <animateMotion path={route.courier} dur="43s" repeatCount="indefinite"/>
   <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.05;.8;.9;1" dur="43s" repeatCount="indefinite"/>
   <ellipse cy="0" rx="3.1" ry="1.1" fill="#080611" opacity=".65"/>
   <svg x="-5" y="-18" width="10" height="18" viewBox={`${frame.x} ${frame.y} ${frame.width} ${frame.height}`} overflow="hidden">
    <image href="/assets/living-city/walker.webp" width="1776" height="887"/>
   </svg>
  </g>
  {route.lamps.map(([x,y],i)=><circle key={i} className="city-atlas-lamp" cx={x} cy={y} r="3" fill="#fff3b0" style={{animationDelay:`${i*1.7}s`}}/>)}
 </svg>;
}
