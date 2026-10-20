'use client';
import {TheaterFrame} from './whole-game';

import Image from 'next/image';
import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, Film, Play, RotateCcw, Volume2, VolumeX} from 'lucide-react';
import {PREMIERE} from '../data/premiere';
import {startMusic, stopMusic} from '../services/music';
import {useGame} from '../state/store';
import {CityLogo} from './brand';

export function CinemaInvitation() {
  return <Link href="/cinema/specials/" className="cinema-invitation">
    <span className="cinema-invitation-icon"><Film size={28}/></span>
    <span><small>NOW SHOWING · NEW SPECIALS</small><strong>THE CITY HAS NEW INCIDENTS.</strong><em>Watch the latest cinematic attacks.</em></span>
    <span className="cinema-invitation-play"><Play size={21} fill="currentColor"/></span>
  </Link>;
}

export function CinemaShowcase() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [error, setError] = useState('');
  const musicEnabled = useGame(s => s.save?.settings.musicEnabled);
  const musicVolume = useGame(s => s.save?.settings.volume ?? .4);
  const active = [...PREMIERE.chapters].reverse().find(chapter => time >= chapter.time) ?? PREMIERE.chapters[0];

  useEffect(() => {
    const player = video.current;
    const hidden = () => {if (document.hidden) player?.pause();};
    document.addEventListener('visibilitychange', hidden);
    return () => {
      document.removeEventListener('visibilitychange', hidden);
      if (player && !player.paused) player.pause();
      const settings = useGame.getState().save?.settings;
      if (settings?.musicEnabled && !document.hidden) startMusic(settings.volume);
    };
  }, []);

  const play = async (at?: number, sound = !muted) => {
    const player = video.current;
    if (!player) return;
    if (typeof at === 'number') player.currentTime = at;
    player.muted = !sound;
    setMuted(!sound);
    setError('');
    try {await player.play();} catch {
      setError('Playback did not start. Try the video’s play control.');
    }
  };
  const restoreMusic = () => {
    setPlaying(false);
    if (musicEnabled && !document.hidden) startMusic(musicVolume);
  };

  return <TheaterFrame><div className="cinema-page">
    <a className="skip-link" href="#cinema-main">Skip to film</a>
    <header className="cinema-header">
      <Link href="/" aria-label="Cancel City home"><CityLogo small/></Link>
      <Link className="button dark small" href="/"><ArrowLeft size={17}/>BACK TO THE CITY</Link>
    </header>
    <main id="cinema-main">
      <Link className="button magenta small" href="/cinema/specials/">NEW CINEMATIC SPECIALS <ArrowRight size={16}/></Link><br/><br/>
      <Link className="button acid small" href="/cinema/gokart/">GOKART · FULL THROTTLE PREMIERE <ArrowRight size={16}/></Link><br/><br/>
      <Link className="button paper small" href="/cinema/first-batch/">FIRST 12 · ROSTER PLAYBACK REVIEW <ArrowRight size={16}/></Link>
      <div className="cinema-heading">
        <div><span className="tape pink">CANCEL CITY PICTURES PRESENTS</span><h1>SHE KEPT<br/><span>THE RECEIPTS.</span></h1></div>
        <p>Final Boss Karen.<br/>One complaint.<br/><b>Everybody’s problem.</b></p>
      </div>
      <section className="cinema-screen" aria-label="Receipt Apocalypse film">
        <div className="cinema-marquee"><span><Film size={17}/>RECEIPT APOCALYPSE</span><span>CC026 · {PREMIERE.duration} SEC</span></div>
        <video ref={video} className="cinema-video" controls playsInline preload="metadata" poster={PREMIERE.poster} muted={muted}
          aria-label="Cancel City: Final Boss Karen’s Receipt Apocalypse"
          onPlay={() => {setPlaying(true); stopMusic();}}
          onPause={restoreMusic} onEnded={restoreMusic}
          onTimeUpdate={event => setTime(event.currentTarget.currentTime)}
          onVolumeChange={event => setMuted(event.currentTarget.muted)}
          onError={() => {restoreMusic(); setError('The film could not load. Reload the page to try again.');}}>
          <source src={PREMIERE.video} type="video/mp4"/>
          <track kind="captions" src={PREMIERE.captions} srcLang="en" label="English"/>
          Your browser does not support this video. The scene descriptions below tell the story.
        </video>
        <div className="cinema-controls">
          <button className="button acid" onClick={() => playing ? video.current?.pause() : void play(time >= PREMIERE.duration - .1 ? 0 : undefined, true)}>
            <Play size={17} fill="currentColor"/>{playing ? 'PAUSE FILM' : 'PLAY WITH SOUND'}
          </button>
          <button className="button dark small" onClick={() => void play(0)}><RotateCcw size={16}/>REPLAY</button>
          <button className="button dark small" aria-pressed={!muted} onClick={() => {if (video.current) video.current.muted = !muted; setMuted(!muted);}}>
            {muted ? <VolumeX size={16}/> : <Volume2 size={16}/>}{muted ? 'SOUND OFF' : 'SOUND ON'}
          </button>
          <span className="cinema-current-scene">{active.title}</span>
        </div>
        {error && <p role="alert" className="cinema-error">{error}</p>}
      </section>
      <div className="cinema-chapters" aria-label="Jump to a scene">
        {PREMIERE.chapters.map((chapter, i) => <button key={chapter.id} className={active.id === chapter.id ? 'active' : ''} aria-label={`Play scene ${i + 1}: ${chapter.title}`} aria-pressed={active.id === chapter.id} onClick={() => void play(chapter.time)}>
          <Image src={chapter.image} alt="" width={384} height={216}/><span><i>0{i + 1}</i><b>{chapter.title}</b></span>
        </button>)}
      </div>
      <div className="cinema-afterparty">
        <p><span className="tape yellow">THE RECEIPTS ARE REAL. THE DRAMA IS FICTIONAL.</span><br/>A short from the worst neighbourhood on the internet.</p>
        <Link className="button magenta" href="/packs/">MAKE YOUR NEXT BAD DECISION<ArrowRight size={20}/></Link>
      </div>
      <details className="cinema-transcript"><summary>Read the scene descriptions</summary><ol>
        <li>A camera moves through Cancel City’s graffiti-covered streets. Karen is waiting. “Another normal day.”</li>
        <li>A sealed foil pack bends and strains, then tears open. Final Boss Karen emerges.</li>
        <li>Karen points furiously: “I kept the receipts.”</li>
        <li>A receipt printer feeds an impossibly long list of audacity and bad takes. Karen raises a receipt, then lunges.</li>
        <li>A paper ribbon curls across the street and wraps the Reply Guy’s card. “Ratio.” The thread is locked.</li>
        <li>“I am the manager.” A flying receipt startles Karen. “Paper cut. Emotional damage.” She recovers her smug pose.</li>
        <li>Cancel City. “Everyone is the problem. Pull. Fight. Repeat.”</li>
      </ol></details>
    </main>
  </div></TheaterFrame>;
}
