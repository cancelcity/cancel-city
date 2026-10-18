'use client';
import Link from 'next/link';
import {useState} from 'react';
import {Play,ArrowLeft} from 'lucide-react';
import {FIRST_ROSTER_BATCH} from '../data/first-roster-batch';
import {CARD_BY_ID} from '../data/cards';
import {previewSpecial,type CinematicMode} from '../domain/cinematic';
import {SpecialCinematic} from './special-cinematic';
import {CityLogo} from './brand';
import './first-roster-showcase.css';
export function FirstRosterShowcase(){
 const [playing,setPlaying]=useState<{id:string;key:number;mode:CinematicMode}|null>(null);
 const play=(id:string,mode:CinematicMode)=>setPlaying({id,key:Date.now(),mode});
 return <div className="first-roster-review">
  <header><Link href="/" aria-label="Cancel City home"><CityLogo small/></Link><Link className="button dark small" href="/collection/"><ArrowLeft size={17}/>BACK TO GAME</Link></header>
  <main><span className="tape pink">ROSTER REDRAW / FIRST 12</span><h1>NEW FACES.<br/><span>SAME BAD CITY.</span></h1><p className="roster-review-intro">Whole-character drawings. Twelve individually staged specials. No separated-limb rigs.</p><p className="roster-review-note">Review this batch at full speed before the rest of the roster changes. All card IDs, owned copies, combat kits and pull odds are unchanged. Previews use no cards, charge or rewards. Esc skips; reduced motion and your sound settings are respected.</p>
  <div className="roster-review-grid">{FIRST_ROSTER_BATCH.map(r=><article key={r.id}><div className="roster-review-art"><img src={CARD_BY_ID[r.id].art} alt={r.name+' crossover character portrait'} loading="lazy"/><span>{r.id} / {r.tempo}</span></div><div className="roster-review-copy"><small>PREVIOUSLY {r.oldName.toUpperCase()}</small><h2>{r.name}</h2><p>{r.description}</p><div className="roster-review-buttons"><button className="button magenta" onClick={()=>play(r.id,'full')} aria-label={`Play ${r.name} full special`}><Play size={16}/>PLAY · 4.8 SEC</button><button className="button paper small" onClick={()=>play(r.id,'quick')} aria-label={`Play ${r.name} quick special`}>QUICK</button></div></div></article>)}</div>
  <p className="roster-review-note">This is the first 12-character batch, not the full roster rollout. Karen’s original special and film are untouched.</p><Link className="button magenta small" href="/cinema/second-batch/">SECOND BATCH →</Link><br/><br/><Link className="text-link" href="/cinema/karen/">Karen’s original special →</Link>
  </main>{playing&&<SpecialCinematic key={playing.key} playback={{...previewSpecial(playing.id),key:`roster-review:${playing.id}:${playing.key}`}} mode={playing.mode} onComplete={()=>setPlaying(null)}/>}
 </div>;
}
