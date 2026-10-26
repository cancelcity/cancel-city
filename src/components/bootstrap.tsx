'use client';
import {useEffect} from 'react';
import {MotionConfig} from 'motion/react';
import {usePathname} from 'next/navigation';
import {SharedSaveStatus,SaveMigration} from './shared-save-status';
import {StarterProgress} from './starter-guide';
import {GameHelp} from './game-help';
import {startMusic,stopMusic} from '../services/music';
import {SAVE_KEY,CLOUD_KEY,GUEST_KEY,useGame} from '../state/store';
import {ARRIVAL_KEY,useArrival} from '../state/arrival';
import {showFirstClash} from '../domain/arrival';
export function Bootstrap({children}:{children:React.ReactNode}){
 const hydrate=useGame(s=>s.hydrate),save=useGame(s=>s.save),path=usePathname(),view=path.split('/').filter(Boolean)[0]||'home',arrival=useArrival();
 const intro=view==='home'&&showFirstClash(save,arrival.completed,arrival.began,arrival.forced);
 useEffect(()=>{arrival.load();hydrate();const changed=(e:StorageEvent)=>{if(e.key===SAVE_KEY||e.key===CLOUD_KEY||e.key===GUEST_KEY)hydrate();if(e.key===ARRIVAL_KEY&&e.newValue==='complete')arrival.finish();};window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed);},[hydrate,arrival.load,arrival.finish]);
 const motion=save?.settings.motion,music=save?.settings.musicEnabled,volume=save?.settings.volume||0;
 useEffect(()=>{document.documentElement.dataset.motion=motion||'system';},[motion]);
 useEffect(()=>{const update=()=>{if(music&&!document.hidden)startMusic(volume);else stopMusic();};const unlock=()=>{if(music&&!document.hidden)startMusic(volume);};update();document.addEventListener('visibilitychange',update);document.addEventListener('pointerdown',unlock,{once:true});return()=>{stopMusic();document.removeEventListener('visibilitychange',update);document.removeEventListener('pointerdown',unlock);};},[music,volume]);
 return <MotionConfig reducedMotion={motion==='reduced'?'always':'user'} transition={{type:'spring',stiffness:380,damping:32}}>{!intro&&<><SharedSaveStatus/><StarterProgress view={view}/></>}{children}{!intro&&<SaveMigration/>}<GameHelp/></MotionConfig>;
}
