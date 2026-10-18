'use client';
import {useEffect} from 'react';
import {MotionConfig} from 'motion/react';
import {startMusic,stopMusic} from '../services/music';
import {SAVE_KEY,CLOUD_KEY,useGame} from '../state/store';
export function Bootstrap({children}:{children:React.ReactNode}){
 const hydrate=useGame(s=>s.hydrate),motion=useGame(s=>s.save?.settings.motion),music=useGame(s=>s.save?.settings.musicEnabled),volume=useGame(s=>s.save?.settings.volume||0);
 useEffect(()=>{hydrate();const changed=(e:StorageEvent)=>{if(e.key===SAVE_KEY||e.key===CLOUD_KEY)hydrate();};window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed);},[hydrate]);
 useEffect(()=>{document.documentElement.dataset.motion=motion||'system';},[motion]);
 useEffect(()=>{const update=()=>{if(music&&!document.hidden)startMusic(volume);else stopMusic();};const unlock=()=>{if(music&&!document.hidden)startMusic(volume);};update();document.addEventListener('visibilitychange',update);document.addEventListener('pointerdown',unlock,{once:true});return()=>{stopMusic();document.removeEventListener('visibilitychange',update);document.removeEventListener('pointerdown',unlock);};},[music,volume]);
 return <MotionConfig reducedMotion={motion==='reduced'?'always':'user'} transition={{type:'spring',stiffness:380,damping:32}}>{children}</MotionConfig>;
}
