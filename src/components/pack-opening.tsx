'use client';
import Link from 'next/link';
import {useRouter,useSearchParams} from 'next/navigation';
import {Layers,Library,ShoppingCart,Swords,Ticket,ArrowRight,Zap} from 'lucide-react';
import {PrintedCard} from './printed-card';
import {PackWrapper} from './brand';
import {CARDS} from '../data/cards';
import { AnimatePresence, motion } from 'motion/react';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import { Check, Gift, Info, Sparkles } from 'lucide-react';
import { Card, CARD_BY_ID, RARITIES, rarityOf } from '../data/cards';
import { dailyEligible, Pull, Save } from '../domain/game';
import { playReveal, useGame } from '../state/store';
import { selectPullReaction } from '../domain/meme-presentation';
import { PackFilm } from './pack-film';
import { ResidentCard } from './card';
import { CityLogo } from './brand';
import { CITY_EASE, useCityMotion } from './city-motion';
import {useStarterGuide} from './starter-guide';
import {ResourceGuide} from './resource-guide';
import {missionsFor} from '../domain/progression';

function PackReceipt({opening,save,collected}:{opening:NonNullable<Save['pendingOpening']>;save:Save|null;collected:boolean}){
 const discoveries=opening.pulls.filter(pull=>pull.isNewDiscovery).length;
 const bonuses=missionsFor(save,new Date(opening.committedAt)).filter(mission=>mission.automatic&&opening.unlockedAchievementIds.includes(mission.rewardId));
 const tickets=bonuses.reduce((total,mission)=>total+mission.packs,0);
 return <section className="pack-opening-receipt" aria-label="Saved pack receipt"><small>THIS PACK / SAVED</small><h2>5 FIGHTER CARDS</h2><strong>+{opening.xpEarned} XP</strong><p>{discoveries} new {discoveries===1?'discovery':'discoveries'} · {opening.pulls.length-discoveries} duplicate {opening.pulls.length-discoveries===1?'copy':'copies'}</p>{tickets>0&&<div className="pack-bonus-rewards"><b>+{tickets} BONUS {tickets===1?'TICKET':'TICKETS'} · ALREADY ADDED</b><ul>{bonuses.map(mission=><li key={mission.rewardId}>{mission.title} · +{mission.packs} {mission.packs===1?'ticket':'tickets'}</li>)}</ul></div>}<p>{collected?'All five collected. Your cards and XP are saved.':'Cards and XP are saved. Collect all five to finish this opening.'}</p></section>;
}

const DEMO_PULLS: Pull[] = [
  { cardId: 'CC008', slot: 0, isNewDiscovery: true, regularQuantityAfter: 1 }, // Infinite Rizz (NEW)
  { cardId: 'CC003', slot: 1, isNewDiscovery: false, regularQuantityAfter: 2 }, // Big Bald Energy
  { cardId: 'CC030', slot: 2, isNewDiscovery: true, regularQuantityAfter: 1 }, // Fraudo Baggins
  { cardId: 'CC023', slot: 3, isNewDiscovery: false, regularQuantityAfter: 2 }, // Light Yagamod
  { cardId: 'CC028', slot: 4, isNewDiscovery: true, regularQuantityAfter: 1 }, // Yasuo 0/10
];

const SLOT_COORDS = [
  { x: 125, y: 410 },
  { x: 255, y: 295 },
  { x: 560, y: 250 },
  { x: 845, y: 310 },
  { x: 985, y: 445 },
];

function PackStageVfxCanvas({
  tearing,
  revealedCount,
  activePulls,
  inSession,
  reduced,
}: {
  tearing: boolean;
  revealedCount: number;
  activePulls: Pull[];
  inSession: boolean;
  reduced: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tearStartRef = useRef<number>(-9999);
  const flipBurstsRef = useRef<{ slot: number; startAt: number; color: string }[]>([]);
  const prevRevealedRef = useRef<number>(revealedCount);

  useEffect(() => {
    if (reduced) {
      tearStartRef.current = -9999;
    } else if (tearing) {
      tearStartRef.current = performance.now();
    }
  }, [tearing, reduced]);

  useEffect(() => {
    if (!inSession || reduced) {
      prevRevealedRef.current = inSession ? revealedCount : 0;
      flipBurstsRef.current = [];
      return;
    }
    const prev = prevRevealedRef.current;
    if (revealedCount > prev) {
      const now = performance.now();
      for (let i = prev; i < revealedCount; i++) {
        const pull = activePulls[i];
        if (!pull) continue;
        const card = CARD_BY_ID[pull.cardId];
        if (card.rarity !== 'public-enemy' && card.rarity !== 'uncancelable' && !pull.isNewDiscovery) continue;
        const color = rarityOf(card.rarity).color;
        flipBurstsRef.current.push({ slot: i, startAt: now + (i - prev) * 75, color });
      }
      flipBurstsRef.current = flipBurstsRef.current.slice(-10);
    }
    prevRevealedRef.current = revealedCount;
  }, [revealedCount, inSession, activePulls, reduced]);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const clear = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
    const hasEffects = (now: number) =>
      (now >= tearStartRef.current && now - tearStartRef.current <= 680) ||
      flipBurstsRef.current.some((burst) => now - burst.startAt < 650);
    const render = (now: number) => {
      raf = 0;
      clear();
      if (document.hidden) return;

      // 3. Booster Pack Foil-Tear Lightning & Confetti Fountain
      const tearElapsed = (now - tearStartRef.current) / 680;
      if (tearElapsed >= 0 && tearElapsed <= 1) {
        const p = Math.min(1, tearElapsed);
        const easeOut = 1 - (1 - p) ** 3;
        ctx.save();
        // Expanding shockwaves from pack center
        ctx.globalAlpha = 1 - p;
        ctx.beginPath();
        ctx.ellipse(555, 510, 50 + easeOut * 380, 28 + easeOut * 210, -0.1, 0, Math.PI * 2);
        ctx.strokeStyle = '#e5ff00';
        ctx.lineWidth = 8 * (1 - p);
        ctx.stroke();


        // Jagged foil rip lightning line across booster top
        if (p < 0.55) {
          ctx.beginPath();
          for (let seg = 0; seg <= 14; seg++) {
            const lx = 340 + seg * 31;
            const ly = 470 + (seg % 2 === 0 ? -14 : 14) * Math.sin(p * 25 + seg);
            if (seg === 0) ctx.moveTo(lx, ly);
            else ctx.lineTo(lx, ly);
          }
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 6;
          ctx.stroke();
          ctx.strokeStyle = '#31d7ff';
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // 14 foil shards
        for (let k = 0; k < 14; k++) {
          const a = -Math.PI * 0.92 + (k / 13) * Math.PI * 0.84 + Math.sin(k * 3) * 0.15;
          const speed = 150 + (k % 5) * 75;
          const fx = 555 + Math.cos(a) * speed * easeOut;
          const fy = 520 + Math.sin(a) * speed * easeOut + 190 * p * p;
          ctx.save();
          ctx.translate(fx, fy);
          ctx.rotate(p * 12 + k);
          ctx.fillStyle = k % 3 === 0 ? '#e5ff00' : k % 2 === 0 ? '#ff169e' : '#31d7ff';
          ctx.strokeStyle = '#111016';
          ctx.lineWidth = 2;
          ctx.fillRect(-7, -4, 14, 8);
          ctx.strokeRect(-7, -4, 14, 8);
          ctx.restore();
        }
        ctx.restore();
      }

      // 4. Localized Card-Flip Starbursts when revealing slots
      flipBurstsRef.current = flipBurstsRef.current.filter((b) => now - b.startAt < 650);
      for (const burst of flipBurstsRef.current) {
        if (now < burst.startAt) continue;
        const bp = Math.min(1, (now - burst.startAt) / 650);
        const be = 1 - (1 - bp) ** 3;
        const pos = SLOT_COORDS[burst.slot] ?? SLOT_COORDS[2];
        ctx.save();
        ctx.globalAlpha = 1 - bp;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 30 + be * 145, 0, Math.PI * 2);
        ctx.strokeStyle = burst.color;
        ctx.lineWidth = 6 * (1 - bp);
        ctx.stroke();

        for (let j = 0; j < 14; j++) {
          const ang = (j * Math.PI * 2) / 14 + bp * 1.4;
          const r1 = 24 + be * 65;
          const r2 = 45 + be * 135;
          ctx.beginPath();
          ctx.moveTo(pos.x + Math.cos(ang) * r1, pos.y + Math.sin(ang) * r1);
          ctx.lineTo(pos.x + Math.cos(ang) * r2, pos.y + Math.sin(ang) * r2);
          ctx.strokeStyle = j % 2 === 0 ? '#e5ff00' : burst.color;
          ctx.lineWidth = 3.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      if (hasEffects(now)) raf = requestAnimationFrame(render);
    };

    const resume = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (!document.hidden && hasEffects(performance.now())) {
        raf = requestAnimationFrame(render);
      } else {
        clear();
      }
    };
    document.addEventListener('visibilitychange', resume);
    resume();
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', resume);
      clear();
    };
  }, [reduced, activePulls, inSession, revealedCount, tearing]);

  if (reduced) return null;
  return (
    <canvas
      ref={canvasRef}
      width={1100}
      height={680}
      className="pack-stage-vfx-canvas"
      aria-hidden="true"
    />
  );
}

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
      className={`pack-table-slot slot-${index} ${revealed ? 'is-revealed' : 'is-hidden'} ${rare && revealed ? 'rare-pull' : ''} ${pull.isNewDiscovery && revealed ? 'new-discovery-pull' : ''}`}
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
          animate={{
            rotateY: reduced ? 0 : revealed ? 0 : 180,
          }}
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
  const { save, run, enter, busy, error, hydrated, migration } = useGame();
  const params=useSearchParams(),router=useRouter(),welcomeAttempt=useRef(false);
  const reduced = useCityMotion();
  const {journey}=useStarterGuide();
  const [justCollected,setJustCollected]=useState(false);
  const [lastOpening,setLastOpening]=useState<Save['pendingOpening']>(null);
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
    }, reduced ? 0 : 680);
    return () => clearTimeout(timer);
  }, [presentation, reduced]);

  useEffect(() => {
    if (!breakingPull) return;
    const timer = setTimeout(() => {
      setBreakingPull(null);
    }, reduced ? 0 : 2400);
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
    setJustCollected(false);
    setLastOpening(null);
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

  useEffect(()=>{
    if(params.get('welcome')!=='1'||!hydrated||busy||error||migration||welcomeAttempt.current)return;
    welcomeAttempt.current=true;
    // The intro's explicit "open" click authorizes exactly one first pack.
    // Returning players and unfinished packs are never charged by this URL.
    router.replace('/packs/',{scroll:false});
    if(!save?.pendingOpening&&!save?.lifetimePacksOpened)void openAndRevealFirst();
  },[params,router,hydrated,busy,error,migration,save?.pendingOpening,save?.lifetimePacksOpened]);

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
      setLastOpening(snapshot);
      setJustCollected(true);
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
  const receipt = allRevealed?session:justCollected?lastOpening:null;
  const breakingCard = breakingPull ? CARD_BY_ID[breakingPull.cardId] : null;
  const breakingRarity = breakingCard ? rarityOf(breakingCard.rarity) : null;

  const openNext=async()=>{await openAndRevealFirst();if(useGame.getState().save?.pendingOpening&&batchRemaining>0)setBatchRemaining(n=>n-1);};
  return <section className={`reference-packs ${session?'in-session':'is-preview'} ${tearing?'is-tearing':''}`} aria-label="Open Packs">
   <aside className="reference-pack-sidebar"><CityLogo/><span className="tape paper">PACKS</span><nav aria-label="Pack destinations"><Link href="/packs/" className="active"><Layers/>OPEN PACKS</Link><Link href="/collection/"><Library/>COLLECTION</Link><Link href="/market/"><ShoppingCart/>MARKET</Link><Link href="/battle/"><Swords/>BATTLE</Link></nav></aside>
   <div className="reference-pack-theater">
    <div className="reference-pack-burst" aria-hidden="true"/>
    <PackStageVfxCanvas tearing={tearing} revealedCount={revealedCount} activePulls={activePulls} inSession={!!session} reduced={reduced}/>
    <div className="reference-pack-shards" aria-hidden="true">{Array.from({length:20},(_,i)=><i key={i} style={{'--shard':i} as CSSProperties}/>)}</div>
    <div className="reference-pack-fan">{activePulls.map((pull,i)=><PackCardSlot key={`${session?.id||'preview'}-${i}`} pull={pull} index={i} revealed={!session||i<revealedCount} next={!!session&&i===revealedCount} busy={busy||!!spotlight||!session} collecting={collecting} delay={cascade?Math.max(0,i-cascadeFrom)*.08:0} onReveal={()=>void reveal(false)} onInspect={onInspect}/>)}</div>
    <span className="reference-pull-rarity tape pink">{session?`${revealedCount} / 5 REVEALED`:'CATALOGUE PREVIEW / NOT YOUR PULLS'}</span>
    <AnimatePresence>
     {breakingPull&&breakingCard&&breakingRarity&&(
      <motion.button
       type="button"
       key={`${breakingPull.cardId}-${breakingPull.slot}`}
       className="pack-breaking-cutin"
       style={{'--cutin-color':breakingRarity.color} as CSSProperties}
       initial={{opacity:0,y:-28,scale:0.86,rotate:-3}}
       animate={{opacity:1,y:0,scale:1,rotate:-1.5}}
       exit={{opacity:0,y:-18,scale:0.92}}
       transition={{duration:0.28,ease:CITY_EASE}}
       onClick={()=>{setBreakingPull(null);onInspect(breakingCard);}}
      >
       <span className="pack-cutin-badge"><Zap size={14}/>{breakingCard.rarity==='public-enemy'?'PUBLIC ENEMY PULL!':breakingCard.rarity==='uncancelable'?'UNCANCELABLE PULL!':'NEW RESIDENT UNLOCKED!'}</span>
       <strong>{breakingCard.name.toUpperCase()}</strong>
       <small>{breakingRarity.name.toUpperCase()} · {breakingCard.ability.toUpperCase()}</small>
      </motion.button>
     )}
    </AnimatePresence>
    <button className="reference-pack-wrapper" aria-label={session?'Reveal next resident':'Open one pack'} disabled={session?busy||allRevealed||!!spotlight:!canOpen} onClick={()=>void(session?reveal(false):openNext())}><PackWrapper/></button>
    {session&&<div className="reference-reveal-actions"><button className="button magenta" disabled={busy||!!spotlight||collecting} onClick={()=>void(allRevealed?collect():reveal(false))}>{allRevealed?'COLLECT ALL 5':'REVEAL NEXT'}<ArrowRight size={18}/></button>{!allRevealed&&<button className="button dark" disabled={busy||!!spotlight} onClick={()=>void reveal(true)}>REVEAL ALL</button>}</div>}
   </div>
   <aside className="reference-pack-info">{receipt?<PackReceipt opening={receipt} save={save} collected={justCollected}/>:<Link className="pack-poster" href="/city/"><span className="tape yellow">SCANDAL<br/>SEASON</span><p>Bad people.<br/>Good content.<br/><b>AIRFRYER GATE IS OPEN.</b></p><strong>EXPLORE YOUR CITY →</strong></Link>}<section className="reference-odds"><button onClick={onOdds}><h2>DROP RATES</h2><Info size={19}/></button><dl>{RARITIES.map(r=><div key={r.id} style={{color:r.color}}><dt>{r.name}</dt><dd>{(r.weight*100).toFixed(1)}%</dd></div>)}</dl><small>Same public odds for every pack.</small></section><section className="reference-pack-collection"><h2>YOUR COLLECTION</h2><b><Library size={24}/>{save?.discoveredCardIds.length||0} / {CARDS.length}</b><div className="progress-track"><i style={{width:`${(save?.discoveredCardIds.length||0)/CARDS.length*100}%`}}/></div><Link href="/collection/">VIEW COLLECTION <ArrowRight size={17}/></Link></section><ResourceGuide/></aside>
   <footer className="reference-pack-purchase"><button className="pack-purchase single" disabled={!canOpen||!!session} onClick={()=>void openNext()}><span className="purchase-wrapper"><PackWrapper/></span><span><b>{batchRemaining?`NEXT PACK · ${batchRemaining} LEFT`:'SINGLE PACK'}</b><small>5 residents · independent draws</small><strong><Ticket aria-hidden="true"/>1 <span>TICKET</span></strong></span></button><button className="pack-purchase ten" disabled={!canOpen||!!session||(save?.packBalance??0)<10||batchRemaining>0} onClick={async()=>{await openAndRevealFirst();if(useGame.getState().save?.pendingOpening)setBatchRemaining(9);}}><span className="purchase-wrapper"><PackWrapper/></span><span><b>10-PACK</b><small>Open ten packs, one at a time</small><strong><Ticket aria-hidden="true"/>10 <span>TICKETS</span></strong></span></button><button className="pack-daily-sticker" disabled={!canClaimDaily||busy} onClick={()=>void run({type:'daily'})}><span>3 FREE<br/>DAILY TICKETS!</span><small>{canClaimDaily?'CLAIM YOURS →':!save?'OPEN A PACK TO BEGIN':'NEXT RESET: 00:00 UTC'}</small></button></footer>
   {justCollected&&!session&&<section className="pack-next-step" aria-label="Your next step"><div><span className="tape yellow">ALL FIVE CHARACTERS SAVED</span><h2>{journey.title}</h2><p>{journey.description}</p></div><Link className="button magenta" href={journey.href}>{journey.action}<ArrowRight size={18}/></Link><Link className="text-link" href="/collection/">VIEW MY CHARACTERS →</Link><button className="text-link" onClick={()=>setJustCollected(false)}>KEEP OPENING PACKS</button></section>}
   {spotlight&&<div className="pull-cinema-overlay" role="status"><PackFilm pull={spotlight} onComplete={()=>setSpotlight(null)}/></div>}
  </section>;
}
