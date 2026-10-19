'use client';
import {useEffect,useRef} from 'react';
import {MotionConfig} from 'motion/react';
import {startMusic,stopMusic} from '../services/music';
import {SAVE_KEY,CLOUD_KEY,useGame} from '../state/store';
export function Bootstrap({children}:{children:React.ReactNode}){
 const hydrate=useGame(s=>s.hydrate),save=useGame(s=>s.save),hydrated=useGame(s=>s.hydrated),mode=useGame(s=>s.mode),error=useGame(s=>s.error),busy=useGame(s=>s.busy),enter=useGame(s=>s.enter),run=useGame(s=>s.run),autoInit=useRef(false);
 useEffect(()=>{hydrate();const changed=(e:StorageEvent)=>{if(e.key===SAVE_KEY||e.key===CLOUD_KEY)hydrate();};window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed);},[hydrate]);
 useEffect(()=>{
  if(!hydrated||mode!=='local'||error||busy||autoInit.current)return;
  if(!save){
   autoInit.current=true;
   void(async()=>{
    if(await enter()){
     await run({type:'daily'});
     await run({type:'open',sessionId:crypto.randomUUID()});
     await run({type:'reveal',count:5});
     await run({type:'acknowledge'});
     await run({type:'city-start'});
     await run({type:'city-build',plot:1,kind:'afterparty'});
     await run({type:'prop-claim',propId:'P001'});
     await run({type:'prop-claim',propId:'P004'});
     await run({type:'prop-equip',residentId:'CC001',propId:'P001'});
     await run({type:'prop-display',propId:'P001'});
     if((useGame.getState().save?.discoveredCardIds.length||0)>=5){
      await run({type:'prop-claim',propId:'P005'});
     }
    }
   })();
  }else{
   autoInit.current=true;
  }
 },[hydrated,mode,save,error,busy,enter,run]);
 const motion=save?.settings.motion,music=save?.settings.musicEnabled,volume=save?.settings.volume||0;
 useEffect(()=>{document.documentElement.dataset.motion=motion||'system';},[motion]);
 useEffect(()=>{const update=()=>{if(music&&!document.hidden)startMusic(volume);else stopMusic();};const unlock=()=>{if(music&&!document.hidden)startMusic(volume);};update();document.addEventListener('visibilitychange',update);document.addEventListener('pointerdown',unlock,{once:true});return()=>{stopMusic();document.removeEventListener('visibilitychange',update);document.removeEventListener('pointerdown',unlock);};},[music,volume]);
 return <MotionConfig reducedMotion={motion==='reduced'?'always':'user'} transition={{type:'spring',stiffness:380,damping:32}}>{children}</MotionConfig>;
}
