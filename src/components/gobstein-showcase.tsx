'use client';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowLeft,Play} from 'lucide-react';
import {TheaterFrame} from './whole-game';
import {SpecialCinematic} from './special-cinematic';
import {previewSpecial,type CinematicMode} from '../domain/cinematic';
import {CityLogo} from './brand';
import {GOBSTEIN_ROOM} from './gobstein-special-painter';

export function GobsteinShowcase(){
 const [playing,setPlaying]=useState<{key:number;mode:CinematicMode}|null>(null);
 const start=(mode:CinematicMode)=>setPlaying({key:Date.now(),mode});
 return <TheaterFrame><div className="karen-premiere">
  <header><Link href="/" aria-label="Cancel City home"><CityLogo small/></Link><Link className="button dark small" href="/battle/?specials=1"><ArrowLeft size={17}/>BACK TO SPECIALS</Link></header>
  <main><span className="tape pink">JEFFREY GOBSTEIN / SPECIAL PREVIEW</span><h1>TECHNICAL<br/><span>DIFFICULTIES.</span></h1><p className="karen-logline">PRIVATE HARBOUR / CAMERA 06</p>
   <div className="karen-poster"><img src={GOBSTEIN_ROOM} alt="The private harbour security room. A guard ignores the empty corridor."/><span>CAM 06 / UNEVENTFUL SHIFT</span></div>
   <div className="karen-play-controls"><button className="button magenta" onClick={()=>start('full')}><Play size={20}/>PLAY SPECIAL · 4.8 SEC</button><button className="button paper" onClick={()=>start('quick')}>QUICK REPLAY · 1.2 SEC</button></div>
   <p className="karen-preview-note">Free preview. No cards, hype or rewards used. Sound follows your game settings. Esc skips; reduced motion is respected.</p>
  </main>
  {playing&&<SpecialCinematic key={playing.key} playback={{...previewSpecial('CC056'),key:`gobstein:${playing.key}`}} mode={playing.mode} onComplete={()=>setPlaying(null)}/>}
 </div></TheaterFrame>;
}
