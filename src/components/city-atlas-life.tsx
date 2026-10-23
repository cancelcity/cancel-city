'use client';
import {useEffect,useRef} from 'react';
import {useCityMotion} from './city-motion';

type Scene='overview'|'overtime'|'rug404';
const ROUTES:Record<Scene,{van:string;courier:string;size:number;lamps:number[][]}>={
 overview:{van:'M 460 687 L 576 764 L 692 841 L 801 917',courier:'M 650 814 L 726 859 L 773 877',size:35,lamps:[[618,551],[884,596],[1073,635],[395,651],[1319,605],[1494,744]]},
 overtime:{van:'M 731 549 L 864 620 L 1020 708 L 1179 805 L 1358 921',courier:'M 966 609 L 1040 650 L 1133 710',size:59,lamps:[[879,505],[603,321],[151,766],[1128,625],[1390,895]]},
 rug404:{van:'M 873 443 L 972 502 L 1088 572',courier:'M 1389 520 L 1461 560 L 1545 606',size:48,lamps:[[923,468],[1093,530],[640,748],[1130,739],[1471,626]]},
};

/** Ambient routines share the scenery's coordinates and never consume input or game rewards. */
export function CityAtlasLife({scene,paused=false}:{scene:Scene;paused?:boolean}){
 const ref=useRef<SVGSVGElement>(null),route=ROUTES[scene],reduced=useCityMotion();
 useEffect(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{if(paused||reduced||motion.matches||document.hidden)ref.current?.pauseAnimations();else ref.current?.unpauseAnimations();};
  update();motion.addEventListener('change',update);document.addEventListener('visibilitychange',update);
  return()=>{motion.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);};
 },[paused,reduced,scene]);
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
   <svg x="-5" y="-18" width="10" height="18" viewBox="0 0 450 450" overflow="hidden">
    <image href="/assets/living-city/walker.webp" width="1800" height="900"/>
   </svg>
  </g>
  {route.lamps.map(([x,y],i)=><circle key={i} className="city-atlas-lamp" cx={x} cy={y} r="3" fill="#fff3b0" style={{animationDelay:`${i*1.7}s`}}/>)}
 </svg>;
}
