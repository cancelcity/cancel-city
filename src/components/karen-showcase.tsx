'use client';
import {TheaterFrame} from './whole-game';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowLeft,Play} from 'lucide-react';
import {SpecialCinematic} from './special-cinematic';
import {previewSpecial,type CinematicMode} from '../domain/cinematic';
import {PREMIERE} from '../data/premiere';
import {CityLogo} from './brand';

export function KarenShowcase(){
 const [playing,setPlaying]=useState<{key:number;mode:CinematicMode}|null>(null);
 const start=(mode:CinematicMode)=>setPlaying({key:Date.now(),mode});
 return <TheaterFrame><div className="karen-premiere">
  <header><Link href="/" aria-label="Cancel City home"><CityLogo small/></Link><Link className="button dark small" href="/battle/"><ArrowLeft size={17}/>BACK TO GAME</Link></header>
  <main><span className="tape pink">CANCEL CITY / SPECIAL PREVIEW</span><h1>SHE KEPT<br/><span>THE RECEIPTS.</span></h1><p className="karen-logline">Final Boss Karen.<br/>One complaint. Everybody’s problem.</p>
   <div className="karen-poster"><img src={PREMIERE.poster} alt="Karen’s original Receipt Apocalypse motion-comic film"/><span>THE ORIGINAL CINEMATIC.</span></div>
   <div className="karen-play-controls"><button className="button magenta" onClick={()=>start('full')}><Play size={20}/>PLAY ORIGINAL SPECIAL</button><button className="button paper" onClick={()=>start('quick')}>QUICK REPLAY · 1.2 SEC</button></div>
   <p className="karen-preview-note">One complaint. A 4.8-second citywide incident. Free preview: no cards, hype or rewards used. Sound follows your settings. Esc skips; reduced motion is respected.</p>
   <Link className="text-link" href="/cinema/">Watch the original short film →</Link>
  </main>
  {playing&&<SpecialCinematic key={playing.key} playback={{...previewSpecial('CC026'),key:`original-karen:${playing.key}`}} mode={playing.mode} onComplete={()=>setPlaying(null)}/>}
 </div></TheaterFrame>;
}
