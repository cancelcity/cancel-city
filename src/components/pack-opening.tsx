'use client';
import Link from 'next/link';
import {Layers,Library,ShoppingCart,Swords,Ticket,ArrowRight} from 'lucide-react';
import {PrintedCard} from './printed-card';
import {PackWrapper} from './brand';
import {CARDS} from '../data/cards';
import { AnimatePresence, motion } from 'motion/react';
import { CSSProperties, useEffect, useState } from 'react';
import { Check, Gift, Info, Sparkles } from 'lucide-react';
import { Card, CARD_BY_ID, RARITIES, rarityOf } from '../data/cards';
import { dailyEligible, Pull, Save } from '../domain/game';
import { playReveal, useGame } from '../state/store';
import { selectPullReaction } from '../domain/meme-presentation';
import { PackFilm } from './pack-film';
import { ResidentCard } from './card';
import { CityLogo } from './brand';
import { CITY_EASE, useCityMotion } from './city-motion';

const DEMO_PULLS: Pull[] = [
  { cardId: 'CC008', slot: 0, isNewDiscovery: true, regularQuantityAfter: 1 }, // Infinite Rizz (NEW)
  { cardId: 'CC003', slot: 1, isNewDiscovery: false, regularQuantityAfter: 2 }, // Big Bald Energy
  { cardId: 'CC030', slot: 2, isNewDiscovery: true, regularQuantityAfter: 1 }, // Fraudo Baggins
  { cardId: 'CC023', slot: 3, isNewDiscovery: false, regularQuantityAfter: 2 }, // Light Yagamod
  { cardId: 'CC028', slot: 4, isNewDiscovery: true, regularQuantityAfter: 1 }, // Yasuo 0/10
];

function PackCardSlot({
  pull,
  index,
  revealed,
  next,
  busy,
  collecting = false,
  delay = 0,
  onReveal,
  onInspect,
}: {
  pull: Pull;
  index: number;
  revealed: boolean;
  next: boolean;
  busy: boolean;
  collecting?: boolean;
  delay?: number;
  onReveal: () => void;
  onInspect: (card: Card) => void;
}) {
  const reduced = useCityMotion();
  const card = CARD_BY_ID[pull.cardId];
  const rarity = rarityOf(card.rarity);
  const rare = ['uncancelable', 'public-enemy'].includes(card.rarity);

  return (
    <div
      className={`pack-table-slot slot-${index} ${revealed ? 'is-revealed' : 'is-hidden'} ${rare && revealed ? 'rare-pull' : ''}`}
      style={{ '--rarity': rarity.color } as CSSProperties}
    >
      <motion.div
        className="pack-card-arrival"
        initial={reduced ? false : { opacity: 0, y: 60, scale: 0.88 }}
        animate={
          collecting && !reduced
            ? { opacity: 0, x: 70 - index * 20, y: -180, scale: 0.2, rotate: 10 + index * 5 }
            : { opacity: 1, x: 0, y: 0, scale: 1, rotate: (index - 2) * 2.2 }
        }
        transition={{
          duration: reduced ? 0 : collecting ? 0.45 : 0.5,
          delay: reduced ? 0 : collecting ? index * 0.05 : index * 0.06,
          ease: CITY_EASE,
        }}
      >
        <motion.div
          className={`flip-surface ${revealed ? 'is-face-up' : 'is-face-down'}`}
          data-reduced={reduced}
          initial={false}
          animate={{ rotateY: reduced ? 0 : revealed ? 0 : 180 }}
          transition={{ duration: reduced ? 0 : 0.62, delay: reduced ? 0 : delay, ease: CITY_EASE }}
        >
          <div className="pack-card-front" aria-hidden={!revealed}>
            <PrintedCard
              card={card}
              onClick={revealed && !collecting ? () => onInspect(card) : undefined}
            />
          </div>

          <button
            type="button"
            className={`pack-card-back tcg-card-back ${next ? 'next' : ''}`}
            aria-hidden={revealed}
            tabIndex={revealed ? -1 : 0}
            disabled={busy || revealed || collecting}
            onClick={onReveal}
            aria-label={`Reveal resident ${index + 1}`}
          >
            <span className="tcg-back-border">
              <span className="tcg-back-splatter" aria-hidden="true" />
              <CityLogo small priority={false} />
            </span>
          </button>
        </motion.div>

        {rare && revealed && !collecting && (
          <div
            className="rarity-impact"
            aria-hidden="true"
            style={{ '--impact-delay': `${delay + 0.3}s` } as CSSProperties}
          >
            <span className="rarity-ring" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function Packs({
  onInspect,
  onOdds,
}: {
  onInspect: (card: Card) => void;
  onOdds: () => void;
}) {
  const { save, run, enter, busy, error, hydrated } = useGame();
  const reduced = useCityMotion();
  const [presentation, setPresentation] = useState<'ready' | 'tear' | 'collect'>('ready');
  const [collected, setCollected] = useState<Save['pendingOpening']>(null);
  const [cascade, setCascade] = useState(false);
  const [cascadeFrom, setCascadeFrom] = useState(0);
  const [spotlight, setSpotlight] = useState<Pull | null>(null);
  const [breakingPull, setBreakingPull] = useState<Pull | null>(null);
  const [demoRevealed, setDemoRevealed] = useState(5);
  const [batchRemaining,setBatchRemaining]=useState(0);
  const [clock, setClock] = useState<Date | null>(null);

  useEffect(() => {
    setClock(new Date());
  }, []);

  const session = save?.pendingOpening || collected;
  const tearing = presentation === 'tear';
  const collecting = presentation === 'collect';

  useEffect(() => {
    if (presentation !== 'tear') return;
    const timer = setTimeout(() => {
      setPresentation('ready');
    }, reduced ? 0 : 520);
    return () => clearTimeout(timer);
  }, [presentation, reduced]);

  useEffect(() => {
    if (!breakingPull) return;
    const timer = setTimeout(() => {
      setBreakingPull(null);
    }, reduced ? 0 : 2100);
    return () => clearTimeout(timer);
  }, [breakingPull, reduced]);

  useEffect(() => {
    if (presentation !== 'collect') return;
    const timer = setTimeout(() => {
      setPresentation('ready');
      setCollected(null);
      setDemoRevealed(2);
    }, reduced ? 0 : 750);
    return () => clearTimeout(timer);
  }, [presentation, reduced]);

  const triggerBreakingCutIn = (pulls: Pull[]) => {
    if (reduced || !pulls.length) return;
    const ranked = [...pulls].sort((a, b) => {
      const rankA = RARITIES.findIndex((r) => r.id === CARD_BY_ID[a.cardId].rarity);
      const rankB = RARITIES.findIndex((r) => r.id === CARD_BY_ID[b.cardId].rarity);
      return rankB - rankA || Number(b.isNewDiscovery) - Number(a.isNewDiscovery);
    });
    const best = ranked[0];
    if (!best) return;
    const rarityId = CARD_BY_ID[best.cardId].rarity;
    if (rarityId === 'public-enemy' || rarityId === 'uncancelable' || best.isNewDiscovery) {
      setBreakingPull(best);
    }
  };

  const openAndRevealFirst = async () => {
    if (presentation !== 'ready' || busy) return;
    if (!save && !(await enter())) return;
    if (!reduced) setPresentation('tear');
    const preferences = useGame.getState().save?.settings;
    if (preferences?.soundEnabled) playReveal(3, preferences.volume, 'riot');
    if (await run({ type: 'open', sessionId: crypto.randomUUID() })) {
      setCascade(false);
      if (await run({ type: 'reveal', count: 1 })) {
        const latestSession = useGame.getState().save?.pendingOpening;
        if (latestSession?.pulls[0]) {
          triggerBreakingCutIn([latestSession.pulls[0]]);
        }
      }
      if (preferences?.soundEnabled) playReveal(1, preferences.volume);
    }
  };

  const reveal = async (all = false) => {
    if (busy || collecting || spotlight) return;
    // If no active session yet, clicking REVEAL NEXT opens a pack and flips the next card!
    if (!session) {
      const canOpenNow = hydrated && !busy && !error && (!save || save.packBalance > 0);
      if (canOpenNow) {
        await openAndRevealFirst();
      }
      return;
    }
    setCascade(all);
    setCascadeFrom(session.revealedCount);
    const nextCount = all ? 5 : Math.min(5, session.revealedCount + 1);
    if (await run({ type: 'reveal', count: nextCount })) {
      const shown = all
        ? session.pulls.slice(session.revealedCount)
        : [session.pulls[session.revealedCount]];
      const validShown = shown.filter(Boolean);
      const headline = selectPullReaction(validShown);
      if (!reduced && headline && all) {
        setSpotlight(headline);
      } else {
        triggerBreakingCutIn(validShown);
      }
      const preferences = useGame.getState().save?.settings;
      if (preferences?.soundEnabled && validShown.length) {
        const rank = Math.max(
          ...validShown.map((p) => RARITIES.findIndex((r) => r.id === CARD_BY_ID[p.cardId].rarity))
        );
        playReveal(rank, preferences.volume);
      }
    }
  };

  const collect = async () => {
    if (!session || busy || collecting || spotlight) return;
    const snapshot = session;
    if (await run({ type: 'acknowledge' })) {
      if (!reduced) {
        setCollected(snapshot);
        setPresentation('collect');
      }
    }
  };

  const canOpen = hydrated && !busy && !error && (!save || save.packBalance > 0) && presentation === 'ready';
  const canClaimDaily = !!save && !!clock && dailyEligible(save, clock);
  const activePulls = session ? session.pulls : DEMO_PULLS;
  const revealedCount = session ? session.revealedCount : demoRevealed;
  const allRevealed = !!session && session.revealedCount >= 5;

  const openNext=async()=>{await openAndRevealFirst();if(useGame.getState().save?.pendingOpening&&batchRemaining>0)setBatchRemaining(n=>n-1);};
  return <section className={`reference-packs ${session?'in-session':'is-preview'} ${tearing?'is-tearing':''}`} aria-label="Open Packs">
   <aside className="reference-pack-sidebar"><CityLogo/><span className="tape paper">PACKS</span><nav aria-label="Pack destinations"><Link href="/packs/" className="active"><Layers/>OPEN PACKS</Link><Link href="/collection/"><Library/>COLLECTION</Link><Link href="/market/"><ShoppingCart/>MARKET</Link><Link href="/battle/"><Swords/>BATTLE</Link></nav></aside>
   <div className="reference-pack-theater"><div className="reference-pack-burst" aria-hidden="true"/><div className="reference-pack-shards" aria-hidden="true">{Array.from({length:20},(_,i)=><i key={i} style={{'--shard':i} as CSSProperties}/>)}</div><div className="reference-pack-fan">{activePulls.map((pull,i)=><PackCardSlot key={`${session?.id||'preview'}-${i}`} pull={pull} index={i} revealed={!session||i<revealedCount} next={!!session&&i===revealedCount} busy={busy||!!spotlight||!session} collecting={collecting} delay={cascade?Math.max(0,i-cascadeFrom)*.08:0} onReveal={()=>void reveal(false)} onInspect={onInspect}/>)}</div><span className="reference-pull-rarity tape pink">{session?`${revealedCount} / 5 REVEALED`:'MYTHIC · CATALOGUE PREVIEW'}</span><button className="reference-pack-wrapper" aria-label={session?'Reveal next resident':'Open one pack'} disabled={session?busy||allRevealed||!!spotlight:!canOpen} onClick={()=>void(session?reveal(false):openNext())}><PackWrapper/></button>{session&&<div className="reference-reveal-actions"><button className="button magenta" disabled={busy||!!spotlight||collecting} onClick={()=>void(allRevealed?collect():reveal(false))}>{allRevealed?'COLLECT ALL 5':'REVEAL NEXT'}<ArrowRight size={18}/></button>{!allRevealed&&<button className="button dark" disabled={busy||!!spotlight} onClick={()=>void reveal(true)}>REVEAL ALL</button>}</div>}</div>
   <aside className="reference-pack-info"><Link className="pack-poster" href="/city/"><span className="tape yellow">SCANDAL<br/>SEASON</span><p>Bad people.<br/>Good content.<br/><b>AIRFRYER GATE IS OPEN.</b></p><strong>EXPLORE YOUR CITY →</strong></Link><section className="reference-odds"><button onClick={onOdds}><h2>DROP RATES</h2><Info size={19}/></button><dl>{RARITIES.map(r=><div key={r.id} style={{color:r.color}}><dt>{r.name}</dt><dd>{(r.weight*100).toFixed(1)}%</dd></div>)}</dl><small>Same public odds for every pack.</small></section><section className="reference-pack-collection"><h2>YOUR COLLECTION</h2><b><Library size={24}/>{save?.discoveredCardIds.length||0} / {CARDS.length}</b><div className="progress-track"><i style={{width:`${(save?.discoveredCardIds.length||0)/CARDS.length*100}%`}}/></div><Link href="/collection/">VIEW COLLECTION <ArrowRight size={17}/></Link></section></aside>
   <footer className="reference-pack-purchase"><button className="pack-purchase single" disabled={!canOpen||!!session} onClick={()=>void openNext()}><span className="purchase-wrapper"><PackWrapper/></span><span><b>{batchRemaining?`NEXT PACK · ${batchRemaining} LEFT`:'SINGLE PACK'}</b><small>5 residents · independent draws</small><strong><Ticket/>1</strong></span></button><button className="pack-purchase ten" disabled={!canOpen||!!session||(save?.packBalance??0)<10||batchRemaining>0} onClick={async()=>{await openAndRevealFirst();if(useGame.getState().save?.pendingOpening)setBatchRemaining(9);}}><span className="purchase-wrapper"><PackWrapper/></span><span><b>10-PACK</b><small>Open ten packs, one at a time</small><strong><Ticket/>10</strong></span></button><button className="pack-daily-sticker" disabled={!canClaimDaily||busy} onClick={()=>void run({type:'daily'})}><span>3 FREE<br/>DAILY PACKS!</span><small>{canClaimDaily?'CLAIM YOURS →':!save?'OPEN A PACK TO BEGIN':'NEXT RESET: 00:00 UTC'}</small></button></footer>
   {spotlight&&<div className="pull-cinema-overlay" role="status"><PackFilm pull={spotlight} onComplete={()=>setSpotlight(null)}/></div>}
  </section>;
}
