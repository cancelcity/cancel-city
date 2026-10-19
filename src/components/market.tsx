'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Layers, Recycle, Search, Sparkles, Wrench } from 'lucide-react';
import { Card, CARDS, CARD_BY_ID } from '../data/cards';
import { internetSearch } from '../data/internet';
import { EXCHANGE, quantity } from '../domain/game';
import { useGame } from '../state/store';
import { Portrait, rarityBadgeLabel, ResidentCard } from './card';
import { Dialog } from './dialog';
import { useCityMotion } from './city-motion';

const FEATURED_MARKET_IDS = [
  'CC063', // Infinite Rizz
  'CC064', // Big Bald Energy
  'CC023', // Fraudo Baggins
  'CC002', // Light Yagamod
  'CC001', // Yasuo 0/10
  'CC003', // L Ratio
  'CC004', // UsoppGPT
  'CC005', // Sauron Surveillance
  'CC010', // Homelesslander
  'CC135', // Daenerys Airfryer
  'CC066', // The Eternal 2nd
  'CC012', // Freezer
  'CC013', // Copy-Paste Kakashi
  'CC014', // Gordon Ramen
  'CC016', // PowerPoint
  'CC017', // MrLeast
  'CC019', // Master Cheese
  'CC007', // Kobeni Minimum Wage
  'CC011', // Nine-to-Five Nanami
  'CC039', // Elongated Ego
  'CC026', // Final Boss Karen
];

const VENDOR_ROASTS: Record<string, string> = {
  CC063: '“Blindfold stays on during negotiations. No refunds on Main Character syndrome.”',
  CC064: '“He punched my cash register in half because Tuesday coupons expired.”',
  CC023: '“Tried to sell me a ‘One Ring’ referral link. Straight into the shredder.”',
  CC002: '“Careful, if you lowball him he writes your IP address in a spiral notebook.”',
  CC001: '“0 wins, 10 deaths, still blaming the shopkeeper’s Wi-Fi.”',
  CC003: '“Crouched barefoot on my counter for three hours just to say ‘L + Ratio’.”',
};

type MarketFilter = 'all' | 'dupes' | 'missing';

export function MarketScreen({ onInspect }: { onInspect: (card: Card) => void }) {
  const { save, run, busy, enter } = useGame();
  const reduced = useCityMotion();
  const [selectedId, setSelectedId] = useState<string>('CC063');
  const [pageIndex, setPageIndex] = useState(0);
  const [filter, setFilter] = useState<MarketFilter>('all');
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState<{ card: Card; type: 'craft' | 'recycle' } | null>(null);
  const [machineAction, setMachineAction] = useState<'idle' | 'recycle' | 'craft'>('idle');
  const [vendorLine, setVendorLine] = useState<string | null>(null);

  const orderedCards = useMemo(() => {
    const rank = new Map(FEATURED_MARKET_IDS.map((id, i) => [id, i]));
    return [...CARDS].sort((a, b) => {
      const ra = rank.has(a.id) ? rank.get(a.id)! : 1000 + a.number;
      const rb = rank.has(b.id) ? rank.get(b.id)! : 1000 + b.number;
      return ra - rb;
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return orderedCards.filter((c) => {
      if (q && !internetSearch(c).includes(q) && !c.name.toLowerCase().includes(q)) return false;
      const qty = quantity(save, c.id);
      if (filter === 'dupes') return qty.regular >= 1 && qty.regular + qty.foil >= 2;
      if (filter === 'missing') return qty.regular + qty.foil === 0;
      return true;
    });
  }, [orderedCards, query, filter, save]);

  const pageSize = 4;
  const maxPage = Math.max(0, Math.ceil(filtered.length / pageSize) - 1);
  const safePage = Math.min(pageIndex, maxPage);
  const visibleCards = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const activeCard =
    CARD_BY_ID[selectedId] || visibleCards[0] || CARD_BY_ID.CC063 || CARDS[0];
  const activeQty = quantity(save, activeCard.id);
  const activeRate = EXCHANGE[activeCard.rarity];
  const canRecycle = !busy && activeQty.regular >= 1 && activeQty.regular + activeQty.foil >= 2;
  const canCraft = !busy && !!save && save.career.scrap >= activeRate.craft;

  const chooseCard = (card: Card) => {
    setSelectedId(card.id);
    setVendorLine(
      VENDOR_ROASTS[card.id] || `“${card.name}? ${card.quote}”`
    );
  };

  const stepCarousel = (delta: number) => {
    if (filtered.length <= pageSize) return;
    const next = (safePage + delta + (maxPage + 1)) % (maxPage + 1);
    setPageIndex(next);
    const firstOnPage = filtered[next * pageSize];
    if (firstOnPage) chooseCard(firstOnPage);
  };

  const exchange = async () => {
    if (!selection) return;
    if (!save && !(await enter())) return;
    const kind = selection.type;
    const targetCard = selection.card;
    if (await run({ type: kind, cardId: targetCard.id })) {
      setSelection(null);
      setMachineAction(kind);
      setVendorLine(
        kind === 'recycle'
          ? `“SHREDDED! One spare ${targetCard.name} turned into +${EXCHANGE[targetCard.rarity].recycle} pure scrap.”`
          : `“FRESH OFF THE PRESS! ${targetCard.name} is legally your problem now.”`
      );
      setTimeout(() => setMachineAction('idle'), 1200);
    }
  };

  const dupeCount = useMemo(
    () =>
      CARDS.filter((c) => {
        const q = quantity(save, c.id);
        return q.regular >= 1 && q.regular + q.foil >= 2;
      }).length,
    [save]
  );

  return (
    <section className="rug-alley-stage" aria-label="Market — Rug Alley">
      <div className="rug-alley-backdrop" aria-hidden="true" />
      <div className="rug-alley-vignette" aria-hidden="true" />

      {/* Wall signs & ambient details matching mockup */}
      <div className="rug-wall-poster left-poster" aria-hidden="true">
        <span>BRING DUPES</span>
        <b>GET SCRAP</b>
      </div>
      <div className="rug-wall-graffiti" aria-hidden="true">
        SAME CARDS
        <br />
        NEW LIVES
      </div>
      <div className="rug-wall-poster right-poster" aria-hidden="true">
        <span>RECYCLE</span>
        <span>CRAFT</span>
        <b>RESPECT</b>
      </div>

      {/* Top Brush Banner */}
      <header className="rug-header-banner">
        <div className="rug-brush-title">
          <h1>MARKET / RUG ALLEY</h1>
        </div>
        <div className="rug-brush-subtitle">
          <p>RECYCLE DUPLICATES. CRAFT YOUR NEXT MAIN.</p>
        </div>
      </header>

      {/* Main Counter + Right Inspector Layout */}
      <div className="rug-main-workspace">
        {/* Left/Center Counter Stage */}
        <div className="rug-counter-zone">
          {/* Interactive Vendor + Recycler Machine behind the counter */}
          <div className="rug-behind-counter">
            <div className="rug-vendor-character">
              <img
                src="/assets/actors/CC023-roster-v2-0.webp"
                alt=""
                className="rug-vendor-sprite"
                draggable={false}
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={vendorLine || activeCard.id}
                  className="rug-vendor-bubble"
                  initial={reduced ? false : { opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {vendorLine ||
                    VENDOR_ROASTS[activeCard.id] ||
                    `“Got dupes? Toss ’em in the green shredder. Last copy & foils stay safe.”`}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Filter & Quick Search Strip tucked on the counter shelf */}
            <div className="rug-counter-filters">
              <div className="rug-filter-tabs" role="tablist" aria-label="Filter market">
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === 'all'}
                  className={filter === 'all' ? 'active' : ''}
                  onClick={() => {
                    setFilter('all');
                    setPageIndex(0);
                  }}
                >
                  ALL ({CARDS.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === 'dupes'}
                  className={filter === 'dupes' ? 'active' : ''}
                  onClick={() => {
                    setFilter('dupes');
                    setPageIndex(0);
                  }}
                >
                  DUPES ({dupeCount})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filter === 'missing'}
                  className={filter === 'missing' ? 'active' : ''}
                  onClick={() => {
                    setFilter('missing');
                    setPageIndex(0);
                  }}
                >
                  MISSING
                </button>
              </div>

              <label className="rug-mini-search">
                <Search size={14} />
                <input
                  aria-label="Search market by resident or meme"
                  placeholder="Search resident or meme…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPageIndex(0);
                  }}
                />
              </label>
            </div>

            {/* Green SCRAP IN / CARDS OUT Recycler Machine */}
            <div
              className={`rug-recycler-machine ${machineAction !== 'idle' ? `is-${machineAction}` : ''}`}
              aria-hidden="true"
            >
              <div className="recycler-top-cap" />
              <div className="recycler-body">
                <Recycle size={26} className="recycler-icon" />
                <b>SCRAP</b>
                <span>IN</span>
                <b>CARDS</b>
                <span>OUT</span>
              </div>
            </div>
          </div>

          {/* 4-Card Counter Carousel */}
          <div className="rug-carousel-row">
            <button
              type="button"
              className="rug-carousel-arrow prev"
              aria-label="Previous residents"
              disabled={filtered.length <= pageSize}
              onClick={() => stepCarousel(-1)}
            >
              <ChevronLeft size={34} />
            </button>

            {visibleCards.length > 0 ? (
              <div className="rug-cards-shelf">
                {visibleCards.map((card, idx) => {
                  const q = quantity(save, card.id);
                  const totalOwned = q.regular + q.foil;
                  const isSelected = activeCard.id === card.id;
                  return (
                    <div
                      key={card.id}
                      className={`rug-card-slot ${isSelected ? 'selected' : ''}`}
                    >
                      <ResidentCard
                        card={card}
                        compact
                        foil={q.foil > 0}
                        selected={isSelected}
                        onClick={() => chooseCard(card)}
                      />
                      <button
                        type="button"
                        className="rug-slot-count"
                        onClick={() => chooseCard(card)}
                        aria-label={`${card.name}: ${totalOwned} owned`}
                      >
                        <Layers size={13} />
                        <b>{totalOwned > 0 ? `×${totalOwned}` : `#${String(card.number).padStart(3, '0')}`}</b>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rug-empty-shelf">
                <h3>NO MATCHING RESIDENTS ON THIS SHELF.</h3>
                <button
                  type="button"
                  className="button paper small"
                  onClick={() => {
                    setQuery('');
                    setFilter('all');
                    setPageIndex(0);
                  }}
                >
                  SHOW ALL RESIDENTS
                </button>
              </div>
            )}

            <button
              type="button"
              className="rug-carousel-arrow next"
              aria-label="Next residents"
              disabled={filtered.length <= pageSize}
              onClick={() => stepCarousel(1)}
            >
              <ChevronRight size={34} />
            </button>
          </div>

          <div className="rug-shelf-footer">
            <span className="rug-memes-sign" aria-hidden="true">
              MEMES · PEOPLE · PROPS
            </span>
            <span className="rug-page-indicator">
              SHELF {safePage + 1} / {Math.max(1, maxPage + 1)} · CLICK A CARD TO INSPECT OR TRADE
            </span>
          </div>
        </div>

        {/* Right Inspector Panel matching mockup 1:1 */}
        <aside className="rug-inspector-panel" aria-label="Selected resident exchange">
          <div className="rug-inspector-top">
            <div className="rug-inspector-portrait">
              <Portrait card={activeCard} />
              <span className={`tcg-rarity-pill rarity-${activeCard.rarity}`}>
                {rarityBadgeLabel(activeCard.rarity)}
              </span>
            </div>

            <div className="rug-inspector-meta">
              <div className="rug-pinned-note">
                <i className="rug-pin" aria-hidden="true" />
                <span>
                  LAST COPY
                  <br />+ FOILS KEPT
                </span>
              </div>

              <h2>{activeCard.name}</h2>
              <p className="rug-owned-line">
                {activeQty.regular + activeQty.foil > 0
                  ? `×${activeQty.regular + activeQty.foil} OWNED${activeQty.foil > 0 ? ` (${activeQty.foil} FOIL)` : ''}`
                  : `0 OWNED · #${String(activeCard.number).padStart(3, '0')}`}
              </p>
              <p className="rug-flavour-copy">“{activeCard.quote}”</p>
            </div>
          </div>

          <div className="rug-inspector-actions">
            <button
              type="button"
              className={`rug-btn recycle ${canRecycle ? 'is-ready' : ''}`}
              disabled={busy}
              onClick={() => {
                if (canRecycle) {
                  setSelection({ card: activeCard, type: 'recycle' });
                } else {
                  setVendorLine(
                    `“Hold up! You need at least 2 copies of ${activeCard.name} to shred a spare (you own ${activeQty.regular + activeQty.foil}). Rip some FREE PACKS first!”`
                  );
                }
              }}
            >
              <Recycle size={24} />
              <div>
                <b>RECYCLE DUPLICATE</b>
                <small>+{activeRate.recycle.toLocaleString('en-US')} SCRAP</small>
              </div>
            </button>

            <button
              type="button"
              className={`rug-btn craft ${canCraft ? 'is-ready' : ''}`}
              disabled={busy}
              onClick={() => {
                if (canCraft) {
                  setSelection({ card: activeCard, type: 'craft' });
                } else {
                  setVendorLine(
                    `“Printing ${activeCard.name} costs ${activeRate.craft.toLocaleString('en-US')} SCRAP (you have ${(save?.career.scrap || 0).toLocaleString('en-US')}). Shred spare cards to stack Scrap!”`
                  );
                }
              }}
            >
              <Wrench size={22} />
              <div>
                <b>CRAFT RESIDENT</b>
                <small>{activeRate.craft.toLocaleString('en-US')} SCRAP</small>
              </div>
            </button>

            <div className="rug-inspector-bottom-row">
              <Link href="/collection/" className="rug-btn collection">
                <Layers size={16} />
                <span>VIEW COLLECTION</span>
              </Link>
              <button
                type="button"
                className="rug-btn dossier"
                onClick={() => onInspect(activeCard)}
              >
                <Sparkles size={15} />
                <span>DOSSIER</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {selection && (
          <Dialog
            title={
              selection.type === 'craft'
                ? 'ACQUIRE WORSE COMPANY.'
                : 'RECYCLE THE DUPLICATE?'
            }
            onClose={() => setSelection(null)}
          >
            <p>
              {selection.type === 'craft'
                ? `Spend ${EXCHANGE[selection.card.rarity].craft.toLocaleString('en-US')} scrap for one regular ${selection.card.name}.`
                : `Consume one spare regular ${selection.card.name} for +${EXCHANGE[selection.card.rarity].recycle.toLocaleString('en-US')} scrap. Your last copy and foils are never touched.`}
            </p>
            <button
              type="button"
              className="button magenta"
              disabled={busy}
              onClick={() => void exchange()}
            >
              CONFIRM EXCHANGE
            </button>
          </Dialog>
        )}
      </AnimatePresence>
    </section>
  );
}
