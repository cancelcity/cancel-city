'use client';
import Image from 'next/image';
import { CSSProperties, PointerEvent, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { Card, rarityOf } from '../data/cards';
import { useGame } from '../state/store';
import { portraitSourceSet } from '../data/portrait-delivery';
import { useCityMotion } from './city-motion';

export interface CardStickerDef {
  id: string;
  label: string;
  tone: 'cyan' | 'pink' | 'acid' | 'red' | 'purple';
  rotate: string;
}

export const CARD_STICKERS: readonly CardStickerDef[] = [
  { id: 'noted', label: '🚨 COMMUNITY NOTED', tone: 'cyan', rotate: '-6deg' },
  { id: 'bozo', label: '🤡 CERTIFIED BOZO', tone: 'pink', rotate: '5deg' },
  { id: 'ratio', label: '⚡ RATIO KING', tone: 'acid', rotate: '-4deg' },
  { id: 'guilty', label: '⚖️ GUILTY AF', tone: 'red', rotate: '6deg' },
  { id: 'diamond', label: '💎 EXIT LIQUIDITY', tone: 'purple', rotate: '-5deg' },
];

const DEFAULT_CARD_STICKERS: Record<string, string> = {
  CC063: 'ratio',
  CC001: 'bozo',
  CC002: 'noted',
  CC015: 'guilty',
};

const STICKER_STORAGE_KEY = 'cc_card_stickers_v1';
const ASCEND_STORAGE_KEY = 'cc_card_ascend_v1';

export function useCardCustomization(cardId: string) {
  const [stickerId, setStickerState] = useState<string | null>(DEFAULT_CARD_STICKERS[cardId] || null);
  const [ascended, setAscendedState] = useState<boolean>(cardId === 'CC063');

  useEffect(() => {
    const sync = () => {
      try {
        const rawS = localStorage.getItem(STICKER_STORAGE_KEY);
        const mapS = rawS ? (JSON.parse(rawS) as Record<string, string | null>) : {};
        setStickerState(cardId in mapS ? mapS[cardId] : DEFAULT_CARD_STICKERS[cardId] || null);
        const rawA = localStorage.getItem(ASCEND_STORAGE_KEY);
        const mapA = rawA ? (JSON.parse(rawA) as Record<string, boolean>) : {};
        setAscendedState(cardId in mapA ? Boolean(mapA[cardId]) : cardId === 'CC063');
      } catch {
        setStickerState(DEFAULT_CARD_STICKERS[cardId] || null);
      }
    };
    sync();
    window.addEventListener('cancel-city.sticker-change', sync);
    return () => window.removeEventListener('cancel-city.sticker-change', sync);
  }, [cardId]);

  const setSticker = (nextId: string | null) => {
    try {
      const raw = localStorage.getItem(STICKER_STORAGE_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, string | null>) : {};
      map[cardId] = nextId;
      localStorage.setItem(STICKER_STORAGE_KEY, JSON.stringify(map));
    } catch {}
    setStickerState(nextId);
    window.dispatchEvent(new Event('cancel-city.sticker-change'));
  };

  const toggleAscend = () => {
    const next = !ascended;
    try {
      const raw = localStorage.getItem(ASCEND_STORAGE_KEY);
      const map = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      map[cardId] = next;
      localStorage.setItem(ASCEND_STORAGE_KEY, JSON.stringify(map));
    } catch {}
    setAscendedState(next);
    window.dispatchEvent(new Event('cancel-city.sticker-change'));
  };

  const sticker = CARD_STICKERS.find((s) => s.id === stickerId) || null;
  return { sticker, stickerId, setSticker, ascended, toggleAscend };
}

export function rarityBadgeLabel(rarity: Card['rarity']): string {
  return rarityOf(rarity).name.toUpperCase();
}

export function Portrait({
  card,
  large = false,
  priority = false,
}: {
  card: Card;
  large?: boolean;
  priority?: boolean;
}) {
  const sizes = large
    ? '(max-width:700px) 95vw, 430px'
    : '(max-width:700px) 36vw, (max-width:1300px) 24vw, 300px';
  return (
    <span role="img" aria-label={`Illustrated portrait of ${card.name}`} className="reference-portrait">
      <picture>
        <source srcSet={portraitSourceSet(card)} sizes={sizes} />
        <Image
          className="resident-portrait-image"
          src={card.art}
          width={896}
          height={896}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
        />
      </picture>
    </span>
  );
}

export function ResidentCard({
  card,
  foil = false,
  locked = false,
  copies,
  onClick,
  compact = false,
  selected = false,
  isNew = false,
}: {
  card: Card;
  foil?: boolean;
  locked?: boolean;
  copies?: number;
  onClick?: () => void;
  compact?: boolean;
  selected?: boolean;
  isNew?: boolean;
}) {
  const mastery = useGame((s) => s.save?.career.mastery[card.id] || 0);
  const { sticker, ascended } = useCardCustomization(card.id);
  const reduced = useCityMotion();
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const lightX = useMotionValue('50%');
  const lightY = useMotionValue('50%');
  const rotateX = useSpring(tiltX, { stiffness: 360, damping: 26 });
  const rotateY = useSpring(tiltY, { stiffness: 360, damping: 26 });

  const pointer = (e: PointerEvent<HTMLElement>) => {
    if (reduced || e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    tiltX.set((0.5 - y) * 11);
    tiltY.set((x - 0.5) * 14);
    lightX.set(`${x * 100}%`);
    lightY.set(`${y * 100}%`);
  };

  const reset = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const r = rarityOf(card.rarity);
  const badgeText = rarityBadgeLabel(card.rarity);

  const content = (
    <>
      {isNew && <span className="tcg-new-tape">NEW</span>}
      <div className="tcg-art-frame card-portrait">
        <Portrait card={card} />
        <motion.span
          className="tcg-halftone-glint"
          aria-hidden="true"
          style={{ '--light-x': lightX, '--light-y': lightY } as CSSProperties}
        />
        {foil && <span className="foil-stamp">✦ HOLO FOIL ✦</span>}
        {ascended && !locked && (
          <span className="tcg-ascended-stamp" aria-hidden="true">👑 CROWN BADGE</span>
        )}
        {sticker && !locked && (
          <span
            className={`tcg-slapped-sticker tone-${sticker.tone}`}
            style={{ '--sticker-rot': sticker.rotate } as CSSProperties}
            aria-hidden="true"
          >
            {sticker.label}
          </span>
        )}
        {mastery >= 3 && !locked && (
          <span className="mastery-stamp">{mastery >= 10 ? '★ LEGEND' : '★ MENACE'}</span>
        )}
        {copies !== undefined && (
          <span
            className={`copies-badge ${copies > 0 ? 'owned' : locked ? 'missing' : 'collector-num'}`}
          >
            {copies > 0
              ? `×${copies}`
              : locked
                ? 'LOCKED'
                : `#${String(card.number).padStart(3, '0')}`}
          </span>
        )}
      </div>

      <div className="tcg-footer">
        <div className="tcg-nameplate resident-title">
          <h3>{card.name}</h3>
        </div>
        <span className={`tcg-rarity-pill rarity-${card.rarity}`} aria-label={r.name}>
          {badgeText}
        </span>
      </div>

      {!compact && (
        <div className="tcg-hover-quote">
          <p className="card-quote">“{card.quote}”</p>
        </div>
      )}

      <motion.span
        className="card-sheen"
        aria-hidden="true"
        style={{ '--light-x': lightX, '--light-y': lightY } as CSSProperties}
      />
    </>
  );

  const props = {
    className: [
      'resident-card',
      'tcg-card',
      `tcg-rarity-${card.rarity}`,
      !locked && mastery >= 10 ? 'mastery-gold' : !locked && mastery >= 3 ? 'mastery-ink' : '',
      foil ? 'foil' : '',
      locked ? 'locked' : '',
      compact ? 'compact' : '',
      selected ? 'is-selected' : '',
    ]
      .filter(Boolean)
      .join(' '),
    style: {
      '--rarity': r.color,
      rotateX: reduced ? 0 : rotateX,
      rotateY: reduced ? 0 : rotateY,
      transformPerspective: 950,
    } as CSSProperties,
    onPointerMove: pointer,
    onPointerLeave: reset,
    whileHover: reduced ? undefined : { y: -7, scale: 1.035 },
    whileTap: reduced ? undefined : { scale: 0.98 },
    transition: { type: 'spring' as const, stiffness: 360, damping: 26 },
  };

  return onClick ? (
    <motion.button
      type="button"
      {...props}
      onClick={onClick}
      aria-label={`Inspect ${card.name}, ${r.name}${foil ? ', foil edition' : ''}${locked ? ', not yet owned' : ''}${copies !== undefined ? `, ${copies} owned` : ''}`}
    >
      {content}
    </motion.button>
  ) : (
    <motion.div {...props}>{content}</motion.div>
  );
}
