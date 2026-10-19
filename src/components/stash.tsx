'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { Check, Lock, Play, Shield, Sparkles } from 'lucide-react';
import { CARDS, CARD_BY_ID, rarityOf } from '../data/cards';
import { PROPS, PROP_BY_ID } from '../data/props';
import { LOANERS } from '../domain/battle';
import { quantity } from '../domain/game';
import { propsFor } from '../domain/props';
import { previewSpecial } from '../domain/cinematic';
import { useGame } from '../state/store';
import { Portrait, rarityBadgeLabel } from './card';
import { PropArt } from './prop-art';
import { PropLootReveal } from './city-fx';
import { SpecialCinematic, useCinematicMode } from './special-cinematic';
import { Dialog } from './dialog';

const MOCKUP_CUBBY_ORDER = [
  'P001', // The Bonk Stick
  'P002', // Moderator's Ban Hammer
  'P003', // Emergency Copium Tank
  'P004', // Apology Megaphone (Megahorn)
  'P007', // RGB Keyboard
  'P008', // Rolled Carpet
  'P009', // Golden Umbrella
  'P011', // Ring Light Staff
  'P012', // Rolling Pin
  'P005', // Touch-Grass Blade
  'P006', // Mandatory Wellness Mace
  'P010', // Exposure Lanyard
];

const SHORT_PROP_NAMES: Record<string, string> = {
  P001: 'THE BONK STICK',
  P002: 'MODERATOR’S BAN HAMMER',
  P003: 'EMERGENCY COPIUM TANK',
  P004: 'MEGAHORN',
  P007: 'RGB KEYBOARD',
  P008: 'ROLLED CARPET',
  P009: 'GOLDEN UMBRELLA',
  P011: 'RING LIGHT STAFF',
  P012: 'ROLLING PIN',
  P005: 'TOUCH-GRASS BLADE',
  P006: 'WELLNESS MACE',
  P010: 'EXPOSURE LANYARD',
};

export function StashScreen() {
  const { save, run, enter, busy, error, hydrated, mode } = useGame();
  const router = useRouter();
  const params = useSearchParams();
  const [sceneMode] = useCinematicMode('cancel-city.city-cinematics.v1');
  const [selected, setSelected] = useState(
    Object.hasOwn(PROP_BY_ID, params.get('prop') || '') ? params.get('prop')! : 'P002'
  );
  const [resident, setResident] = useState(params.get('resident') || 'CC063');
  const [notice, setNotice] = useState('');
  const [loot, setLoot] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const rows = propsFor(save);
  const owned = rows.filter((p) => p.owned).length;
  const prop = rows.find((p) => p.id === selected) || rows[1] || rows[0];

  const orderedCubbies = useMemo(() => {
    const rank = new Map(MOCKUP_CUBBY_ORDER.map((id, i) => [id, i]));
    return [...rows].sort((a, b) => (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99));
  }, [rows]);

  const roster = useMemo(() => {
    const ownedOrLoaner = CARDS.filter(
      (c) =>
        LOANERS.includes(c.id) ||
        quantity(save, c.id).regular + quantity(save, c.id).foil > 0
    );
    return ownedOrLoaner.length ? ownedOrLoaner : CARDS.slice(0, 12);
  }, [save]);

  const residentId = roster.some((c) => c.id === resident) ? resident : roster[0]?.id || 'CC001';
  const activeResident = CARD_BY_ID[residentId] || CARD_BY_ID.CC001;
  const equipped = save?.props.loadout[residentId] || null;
  const disabled = busy || !!error || mode === 'offline' || !hydrated;

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4200);
    return () => clearTimeout(timer);
  }, [notice]);

  const claim = async (id: string) => {
    if (!save && !(await enter())) return;
    const before = useGame.getState().save?.props.ownedIds.includes(id);
    if (await run({ type: 'prop-claim', propId: id })) {
      setSelected(id);
      setNotice(`${PROP_BY_ID[id].name.toUpperCase()} CLAIMED!`);
      if (!before && sceneMode !== 'off') setLoot(id);
    }
  };

  const equip = async () => {
    if (!save && !(await enter())) return;
    if (!prop.owned) {
      if (prop.ready || prop.id === 'P001') {
        await claim(prop.id);
      } else {
        setNotice(`UNLOCK ${prop.name.toUpperCase()} FIRST: ${prop.goal.toUpperCase()} (${prop.progress}/${prop.target})`);
      }
      return;
    }
    if (
      await run({
        type: 'prop-equip',
        residentId,
        propId: equipped === prop.id ? null : prop.id,
      })
    ) {
      setNotice(
        equipped === prop.id
          ? 'PROP UNEQUIPPED.'
          : `${activeResident.name.toUpperCase()} EQUIPPED ${prop.name.toUpperCase()}.`
      );
    }
  };

  const displayInCity = async () => {
    if (!save && !(await enter())) return;
    if (!save?.city) {
      router.push('/city/');
      return;
    }
    if (!prop.owned) {
      setNotice(`UNLOCK ${prop.name.toUpperCase()} FIRST: ${prop.goal.toUpperCase()} (${prop.progress}/${prop.target})`);
      return;
    }
    if (
      await run({
        type: 'prop-display',
        propId: save.props.cityDisplay === prop.id ? null : prop.id,
      })
    ) {
      setNotice('CITY TROPHY PLINTH UPDATED.');
    }
  };

  return (
    <section className="stash-locker-stage" aria-label="Prop Stash — Lost and Very Found">
      <div className="stash-locker-backdrop" aria-hidden="true" />
      <div className="stash-locker-vignette" aria-hidden="true" />

      {/* Top Brush Banner + 8 / 12 Pill */}
      <header className="stash-header-banner">
        <div className="stash-brush-title">
          <h1>PROP STASH / LOST &amp; VERY FOUND</h1>
        </div>
        <div className="stash-count-pill">
          <b>
            {owned} / {PROPS.length}
          </b>
        </div>
      </header>

      {/* Main Workspace: Left 4×3 Wooden Cubby Shelf + Right Inspector */}
      <div className="stash-main-workspace">
        {/* Left Wooden Shelf Cabinet */}
        <div className="stash-wooden-cabinet" role="listbox" aria-label="Collectible props shelf">
          {orderedCubbies.map((p, index) => {
            const isSelected = selected === p.id;
            const isUnknownSlot = !p.owned && !p.ready && index === 8;
            const showCheck = p.owned;
            return (
              <button
                type="button"
                key={p.id}
                role="option"
                aria-selected={isSelected}
                className={`stash-cubby ${isSelected ? 'is-selected' : ''} ${p.owned ? 'is-owned' : p.ready ? 'is-ready' : 'is-locked'} ${isUnknownSlot ? 'is-mystery' : ''}`}
                onClick={() => setSelected(p.id)}
                style={{ '--prop-color': rarityOf(p.rarity).color } as CSSProperties}
              >
                {showCheck && (
                  <span className="cubby-check-badge" aria-label="Owned">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
                {!showCheck && p.ready && <span className="cubby-ready-tag">CLAIM!</span>}

                <div className="cubby-art-well">
                  {isUnknownSlot ? (
                    <div className="cubby-mystery-silhouette">
                      <Lock size={34} />
                    </div>
                  ) : (
                    <PropArt id={p.id} priority={index < 4} decorative />
                  )}
                </div>

                <span className="cubby-nameplate">
                  {isUnknownSlot ? '???' : SHORT_PROP_NAMES[p.id] || p.name.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Prop Inspector Panel matching bottom-right mockup */}
        <aside
          className="stash-inspector-panel"
          aria-label="Selected prop details"
          style={{ '--prop-color': rarityOf(prop.rarity).color } as CSSProperties}
        >
          <div className="stash-inspector-showcase">
            <div className="stash-showcase-art">
              <PropArt id={prop.id} />
            </div>

            <div className="stash-showcase-title-bar">
              <h2>{prop.name.toUpperCase()}</h2>
            </div>
          </div>

          <div className="stash-inspector-mid">
            <div className="stash-inspector-copy">
              <span className={`tcg-rarity-pill rarity-${prop.rarity}`}>
                {rarityBadgeLabel(prop.rarity)}
              </span>
              <p className="stash-prop-quote">“{prop.quote}”</p>
              <small className="stash-prop-goal">
                {prop.owned ? 'IN YOUR STASH · REUSABLE' : `UNLOCK: ${prop.goal} (${prop.progress}/${prop.target})`}
              </small>
            </div>

            <button
              type="button"
              className="stash-equipped-by-card"
              onClick={() => setPickerOpen(true)}
              aria-label={`Equipped by ${activeResident.name}. Click to change resident`}
            >
              <div className="equipped-mini-portrait">
                <Portrait card={activeResident} />
              </div>
              <small>EQUIPPED BY</small>
              <b>{activeResident.name.toUpperCase()}</b>
            </button>
          </div>

          <div className="stash-inspector-buttons">
            {!prop.owned && (prop.ready || (prop.id === 'P001' && !save)) ? (
              <button
                type="button"
                className="stash-btn equip"
                disabled={disabled}
                onClick={() => void claim(prop.id)}
              >
                CLAIM FOR STASH
              </button>
            ) : (
              <button
                type="button"
                className="stash-btn equip"
                disabled={disabled}
                onClick={() => void equip()}
              >
                {equipped === prop.id ? 'UNEQUIP FROM SPECIALS' : 'EQUIP FOR SPECIALS'}
              </button>
            )}

            <button
              type="button"
              className="stash-btn display"
              disabled={disabled}
              onClick={() => void displayInCity()}
            >
              <Shield size={16} />
              <span>
                {save?.props.cityDisplay === prop.id ? 'DISPLAYED IN CITY ✓' : 'DISPLAY IN CITY'}
              </span>
            </button>
          </div>

          <div className="stash-cosmetic-footer">
            <div className="stash-cosmetic-text">
              <b>COSMETIC PROPS</b>
              <p>
                Change the look of special attack animations and your city trophy display. No stat
                changes.
              </p>
            </div>

            <button
              type="button"
              className="stash-preview-special-btn"
              onClick={() => setPreviewing(true)}
            >
              <Play size={13} fill="currentColor" />
              <span>PREVIEW SPECIAL</span>
            </button>
          </div>
        </aside>
      </div>

      {notice && (
        <div className="toast" role="status">
          <Sparkles size={18} />
          {notice}
        </div>
      )}

      {pickerOpen && (
        <Dialog title="CHOOSE RESIDENT FOR THIS PROP" onClose={() => setPickerOpen(false)}>
          <p>
            Pick which resident wields <b>{prop.name}</b> during their special attack animation:
          </p>
          <div className="stash-resident-picker-grid">
            {roster.slice(0, 16).map((c) => (
              <button
                type="button"
                key={c.id}
                className={`stash-resident-choice ${c.id === residentId ? 'selected' : ''}`}
                onClick={() => {
                  setResident(c.id);
                  setPickerOpen(false);
                }}
              >
                <Portrait card={c} />
                <b>{c.name}</b>
              </button>
            ))}
          </div>
        </Dialog>
      )}

      {previewing && (
        <SpecialCinematic
          key={`stash-preview:${residentId}:${prop.id}`}
          playback={previewSpecial(residentId, prop.id)}
          mode="full"
          onImpact={() => {}}
          onComplete={() => setPreviewing(false)}
        />
      )}

      {loot && (
        <PropLootReveal
          key={loot}
          id={loot}
          mode={sceneMode}
          onComplete={() => setLoot(null)}
        />
      )}
    </section>
  );
}
