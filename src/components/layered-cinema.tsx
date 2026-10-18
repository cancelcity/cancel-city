'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {ArrowRight,Play} from 'lucide-react';
import {LAYERED_FILMS} from '../data/layered-films';
import {GokartCinema} from './gokart-cinema';
import './layered-cinema.css';

export function LayeredCinema(){
 const [selected,setSelected]=useState(LAYERED_FILMS[0].slug);
 useEffect(()=>{const id=new URLSearchParams(window.location.search).get('card'),requested=LAYERED_FILMS.find(f=>f.cardId===id||f.slug===id);if(requested)queueMicrotask(()=>setSelected(requested.slug));},[]);
 const choose=(slug:string)=>{setSelected(slug);const chosen=LAYERED_FILMS.find(f=>f.slug===slug);if(chosen){const url=new URL(window.location.href);url.searchParams.set('card',chosen.cardId);window.history.replaceState(null,'',url);}};
 const film=LAYERED_FILMS.find(f=>f.slug===selected)??LAYERED_FILMS[0];
 return <GokartCinema film={film} navigation={<section className="layered-selection" aria-label="Choose a cinematic special">
  <div className="layered-selection-heading"><b>{LAYERED_FILMS.length} NEW INCIDENTS.</b><Link href="/cinema/gokart/">GOKART · ORIGINAL PREMIERE <ArrowRight size={15}/></Link></div>
  <label className="layered-picker">WATCH A SPECIAL<select value={selected} onChange={e=>choose(e.target.value)}>{[...LAYERED_FILMS].sort((a,b)=>a.title.localeCompare(b.title)).map(f=><option key={f.slug} value={f.slug}>{f.title}</option>)}</select></label>
  <div className="layered-film-grid">{LAYERED_FILMS.map(f=><button key={f.slug} aria-pressed={selected===f.slug} className={selected===f.slug?'selected':''} onClick={()=>choose(f.slug)}><img src={f.shots[2].thumbnail} width={384} height={216} alt="" loading="lazy"/><span><b>{f.title.split(':')[0]}</b><small><Play size={12}/>{f.duration.toFixed(1)} SEC · {f.title.split(':').slice(1).join(':')}</small></span></button>)}</div>
 </section>}/>;
}
