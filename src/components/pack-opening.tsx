'use client';
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
  { cardId: 'CC063', slot: 0, isNewDiscovery: true, regularQuantityAfter: 1 }, // Infinite Rizz (NEW)
  { cardId: 'CC064', slot: 1, isNewDiscovery: false, regularQuantityAfter: 2 }, // Big Bald Energy
  { cardId: 'CC023', slot: 2, isNewDiscovery: true, regularQuantityAfter: 1 }, // Fraudo Baggins
  { cardId: 'CC002', slot: 3, isNewDiscovery: false, regularQuantityAfter: 2 }, // Light Yagamod
  { cardId: 'CC001', slot: 4, isNewDiscovery: true, regularQuantityAfter: 1 }, // Yasuo 0/10
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
            <ResidentCard
              card={card}
              compact
              isNew={pull.isNewDiscovery}
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
  const [demoRevealed, setDemoRevealed] = useState(2);
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
      } else {
        const nextIdx = demoRevealed < 5 ? demoRevealed : 1;
        setDemoRevealed(nextIdx + 1);
        if (DEMO_PULLS[nextIdx]) triggerBreakingCutIn([DEMO_PULLS[nextIdx]]);
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

  return (
    <section
      className={`pack-tabletop-stage ${session ? 'in-session' : 'is-preview'} ${tearing ? 'is-tearing' : ''} ${collecting ? 'is-collecting' : ''}`}
      aria-label="Open Packs tabletop"
    >
      <div className="pack-tabletop-backdrop" aria-hidden="true" />
      <div className="pack-tabletop-vignette" aria-hidden="true" />

      {/* Tabletop ambient props matching the bottom-left mockup */}
      <div className="pack-prop-soda" aria-hidden="true">
        <span>PULL</span>
        <span>POST</span>
        <span>COPE</span>
      </div>

      <div className="pack-prop-note" aria-hidden="true">
        <span>
          GOOD
          <br />
          PULLS
          <br />
          BETTER
          <br />
          PEOPLE
        </span>
        <b>☺</b>
      </div>

      {/* Top Brush Header */}
      <header className="pack-header-banner">
        <div className="pack-brush-title">
          <h1>OPEN PACKS</h1>
        </div>
        <div className="pack-per-sticker">
          <b>5 RESIDENTS</b>
          <span>PER PACK</span>
        </div>
      </header>

      {/* Main Tabletop Row: Left Foil Pack Wrapper + 5 Cards Fan */}
      <div className="pack-table-workspace">
        {/* Left Foil Booster Pack */}
        <div className="pack-wrapper-column">
          <button
            type="button"
            className={`pack-foil-pouch ${tearing ? 'is-ripping' : ''}`}
            disabled={!canOpen && !!session && allRevealed}
            onClick={() => (session ? void reveal(false) : void openAndRevealFirst())}
            aria-label="Open a Cancel City trading card pack"
          >
            <span className="pouch-crimp top" aria-hidden="true" />
            {tearing && (
              <span className="pouch-tear-slash" aria-hidden="true">
                <b>⚡ RRRIP!! ⚡</b>
              </span>
            )}
            <span className="pouch-body">
              <span className="pouch-splatter" aria-hidden="true" />
              <CityLogo small priority={false} />
              <strong className="pouch-sub">TRADING CARDS</strong>
              <span className="pouch-ribbon">
                {session ? `${5 - revealedCount} LEFT` : '⚡ RRRIP PACK!'}
              </span>
            </span>
            <span className="pouch-crimp bottom" aria-hidden="true" />
          </button>

          {canClaimDaily && (
            <button
              type="button"
              className="pack-daily-claim-pill"
              disabled={busy}
              onClick={() => void run({ type: 'daily' })}
            >
              <Gift size={14} />
              <span>CLAIM +3 FREE DAILY PACKS</span>
            </button>
          )}
        </div>

        {/* 5-Card Tabletop Spread */}
        <div className="pack-five-spread">
          {activePulls.map((pull, i) => (
            <PackCardSlot
              key={`${session?.id || 'demo'}-${i}`}
              pull={pull}
              index={i}
              revealed={i < revealedCount}
              next={i === revealedCount}
              busy={busy || !!spotlight}
              collecting={collecting}
              delay={cascade ? Math.max(0, i - cascadeFrom) * 0.08 : 0}
              onReveal={() => void reveal(false)}
              onInspect={onInspect}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {breakingPull && !spotlight && (() => {
          const bCard = CARD_BY_ID[breakingPull.cardId];
          const bRarity = rarityOf(bCard.rarity);
          return (
            <motion.div
              key={`cutin-${breakingPull.cardId}-${breakingPull.slot}`}
              className={`breaking-cancel-cutin rarity-${bCard.rarity}`}
              style={{ '--cutin-color': bRarity.color } as CSSProperties}
              initial={{ opacity: 0, scale: 0.85, rotate: -6, y: 24 }}
              animate={{ opacity: 1, scale: 1, rotate: -2.5, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.28, ease: CITY_EASE }}
              onClick={() => setBreakingPull(null)}
              role="status"
            >
              <div className="cutin-hazard-tape top" aria-hidden="true">
                BREAKING CANCEL ALERT ★ BREAKING CANCEL ALERT ★ BREAKING CANCEL ALERT ★
              </div>
              <div className="cutin-body">
                <div className="cutin-speedlines" aria-hidden="true" />
                <div className="cutin-portrait-wrap">
                  <img src={bCard.art} alt="" className="cutin-portrait-img" draggable={false} />
                  <span className="cutin-stamp">
                    {bCard.rarity === 'public-enemy'
                      ? '★ PUBLIC ENEMY! ★'
                      : bCard.rarity === 'uncancelable'
                        ? '★ UNCANCELABLE! ★'
                        : '★ NEW RESIDENT! ★'}
                  </span>
                </div>
                <div className="cutin-copy">
                  <span className="cutin-kicker">
                    {bRarity.name.toUpperCase()} · {bCard.ability.toUpperCase()}
                  </span>
                  <h2>{bCard.name.toUpperCase()}</h2>
                  <p>“{bCard.quote}”</p>
                </div>
              </div>
              <div className="cutin-hazard-tape bottom" aria-hidden="true">
                CLICK TO DISMISS ★ ZERO REMORSE ★ MAXIMUM CLOUT ★
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {spotlight && (
        <div className="pull-cinema-overlay" role="status">
          <PackFilm pull={spotlight} onComplete={() => setSpotlight(null)} />
        </div>
      )}

      {/* Bottom Controls matching mockup: 2 / 5 REVEALED + REVEAL NEXT + VIEW DROP RATES */}
      <footer className="pack-bottom-controls">
        <div className="pack-reveal-center">
          <div className="pack-revealed-counter">
            <b>
              {revealedCount} / 5 REVEALED
            </b>
            {session && session.revealedCount > 0 && session.revealedCount < 5 && (
              <button
                type="button"
                className="pack-reveal-all-inline"
                disabled={busy}
                onClick={() => void reveal(true)}
              >
                (REVEAL ALL)
              </button>
            )}
          </div>

          {allRevealed ? (
            <button
              type="button"
              className="pack-reveal-next-btn collect-mode"
              disabled={busy || !!spotlight}
              onClick={() => void collect()}
            >
              <Check size={24} />
              <span>COLLECT ALL 5</span>
            </button>
          ) : (
            <button
              type="button"
              className="pack-reveal-next-btn"
              disabled={busy || !!spotlight}
              onClick={() => void reveal(false)}
            >
              <span>REVEAL NEXT</span>
            </button>
          )}
        </div>

        <button type="button" className="pack-drop-rates-btn" onClick={onOdds}>
          <Info size={16} />
          <span>VIEW DROP RATES</span>
        </button>
      </footer>
    </section>
  );
}
