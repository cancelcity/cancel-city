'use client';
import {TheaterFrame} from './whole-game';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowLeft,Play} from 'lucide-react';
import {SECOND_ROSTER_BATCH} from '../data/second-roster-batch';
import {CARD_BY_ID} from '../data/cards';
import {portraitSourceSet} from '../data/portrait-delivery';
import {SpecialCinematic} from './special-cinematic';
import {previewSpecial,type CinematicMode} from '../domain/cinematic';
import {CityLogo} from './brand';
import './first-roster-showcase.css';

export function SecondRosterShowcase(){
 const [playing,setPlaying]=useState<{id:string;key:number;mode:CinematicMode}|null>(null);
 const play=(id:string,mode:CinematicMode)=>setPlaying({id,key:Date.now(),mode});
 const playback=playing?previewSpecial(playing.id):null;
 return <TheaterFrame><div className="first-roster-review"><header><Link href="/" aria-label="Cancel City home"><CityLogo small/></Link><Link className="button dark small" href="/collection/"><ArrowLeft size={17}/>BACK TO GAME</Link></header>
  <main><span className="tape pink">SPECIAL ATTACK THEATER / VOLUME 02</span><h1>RECOGNIZABLE.<br/><span>RIDICULOUS.</span></h1><p className="roster-review-intro">Ten more crossover disasters. Dedicated card art in the original deck style, intact character poses, and a different physical punchline for every special.</p><p className="roster-review-note">Free previews use no cards, charge or rewards. Esc skips; reduced motion and your sound settings are respected.</p>
  <div className="roster-review-grid">{SECOND_ROSTER_BATCH.map(r=><article key={r.id}><div className="roster-review-art"><picture><source srcSet={portraitSourceSet(CARD_BY_ID[r.id])} sizes="(max-width:620px) 90vw, (max-width:1050px) 43vw, 30vw"/><img src={CARD_BY_ID[r.id].art} width={896} height={896} alt={`${r.name} crossover card portrait`} loading="lazy"/></picture><span>{r.id} / {r.tempo}</span></div><div className="roster-review-copy"><small>RESIDENT SPECIAL / {r.name.toUpperCase()}</small><h2>{r.name}</h2><p>{r.description}</p><div className="roster-review-buttons"><button className="button magenta" onClick={()=>play(r.id,'full')} aria-label={`Play ${r.name} full special`}><Play size={16}/>PLAY · 4.8 SEC</button><button className="button paper small" onClick={()=>play(r.id,'quick')} aria-label={`Play ${r.name} quick special`}>QUICK</button></div></div></article>)}</div>
  <p className="roster-review-note">Free previews use no cards, charge or rewards. Esc skips; reduced motion and your sound settings are respected.</p><Link className="text-link" href="/cinema/first-batch/">Review the first 12 →</Link>
  </main>{playing&&playback&&<SpecialCinematic key={playing.key} playback={{...playback,...(playback.support?{targetId:'CC007'}:{}),key:`second-roster:${playing.id}:${playing.key}`}} mode={playing.mode} onComplete={()=>setPlaying(null)}/>}
 </div></TheaterFrame>;
}
