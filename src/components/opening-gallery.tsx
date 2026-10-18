'use client';
import {useState} from 'react';
import {OPENINGS,OpeningId} from '../data/openings';
import {CARDS,CARD_BY_ID} from '../data/cards';
import {PackFilm} from './pack-film';
import {Dialog} from './dialog';
export function OpeningGallery(){const [playing,setPlaying]=useState<OpeningId|null>(null),[card,setCard]=useState('CC001'),[take,setTake]=useState(0);return <section className="expansion-preview-list"><b>20 OPENING PREMIERES / FREE PREVIEWS</b><p>Preview any entrance with any resident. These scenes do not open a pack or change your collection.</p><label>CAST THE SCENE <select aria-label="Opening preview resident" value={card} onChange={e=>setCard(e.target.value)}>{CARDS.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label><div>{OPENINGS.map(o=><button key={o.id} className="button paper small" onClick={()=>{setTake(t=>t+1);setPlaying(o.id);}}>{o.name}</button>)}</div>{playing&&<Dialog title={`${OPENINGS.find(s=>s.id===playing)!.name} / ${CARD_BY_ID[card].name}`} onClose={()=>setPlaying(null)}><PackFilm key={`${playing}:${take}`} openingId={playing} preview pull={{cardId:card,slot:0,isNewDiscovery:true,regularQuantityAfter:1}} onComplete={()=>setPlaying(null)}/></Dialog>}</section>;}
