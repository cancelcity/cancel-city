'use client';
import Link from 'next/link';
import { BookOpen, Crown, Flame, Home, Layers, ShoppingCart, Sparkles, Swords, Volume2, VolumeX } from 'lucide-react';
import { useGame } from '../state/store';
import { CityLogo } from './brand';
import { AnimatedNumber } from './city-motion';

export type MainTab = 'city' | 'battle' | 'packs' | 'collection' | 'market' | 'stash';

export function CityGameHeader() {
  const { save, mode, run, busy } = useGame();
  const xp = save?.totalXp || 0;
  const xpInLevel = xp % 1000;
  const xpFill = Math.max(14, Math.min(100, Math.round((xpInLevel / 1000) * 100)));

  return (
    <header className="city-game-header">
      <Link href="/city/" className="city-game-logo" aria-label="Cancel City home">
        <CityLogo small />
      </Link>

      <div className="city-resource-strip">
        <div className="city-resource xp-resource">
          <span>XP</span>
          <b className="xp-meter-box">
            <i className="xp-meter-fill" style={{ width: `${xpFill}%` }} aria-hidden="true" />
            <span className="xp-meter-text">
              <AnimatedNumber value={xp} />
              <small>/1000</small>
            </span>
          </b>
        </div>

        <Link href="/packs/" className="city-resource">
          <span>PACKS</span>
          <b>
            <AnimatedNumber value={save ? save.packBalance : 3} />
          </b>
        </Link>

        <Link href="/market/" className="city-resource">
          <span>SCRAP</span>
          <b>
            <AnimatedNumber value={save?.career.scrap || 0} />
          </b>
        </Link>

        <Link href="/city/" className="city-resource influence">
          <span>
            <Crown size={13} />
            INFLUENCE
          </span>
          <b>
            <AnimatedNumber value={save?.city?.influence || 0} />
          </b>
        </Link>

        <div className="city-resource clout-resource" title="Saved Clout — earned from Schemes, Ratios, and Raids">
          <span>
            <Flame size={13} />
            CLOUT
          </span>
          <b>
            <AnimatedNumber value={save?.career.clout || 0} />
          </b>
        </div>
      </div>

      <div className="city-more-cluster">
        <div className="city-more-top">
          <details className="city-more">
            <summary>MORE ▾</summary>
            <nav aria-label="More destinations">
              <Link href="/missions/">Jobs & rewards</Link>
              <Link href="/leaderboard/">Rankings</Link>
              <Link href="/lore/">Lore</Link>
              <Link href="/roast/">Roast Night</Link>
              <Link href="/cinema/specials/">Cinema</Link>
              <Link href="/settings/">Settings & sound</Link>
              <small>
                {mode === 'cloud'
                  ? 'PROGRESS SAVED TO YOUR ACCOUNT'
                  : mode === 'offline'
                    ? 'OFFLINE · RECONNECT TO PLAY'
                    : 'YOUR PROGRESS SAVES AUTOMATICALLY'}
              </small>
            </nav>
          </details>
          <button
            type="button"
            className="city-sound-toggle"
            aria-label={save?.settings.soundEnabled ? 'Mute sound' : 'Enable sound'}
            disabled={!save || busy}
            onClick={() =>
              void run({
                type: 'settings',
                settings: { soundEnabled: !save?.settings.soundEnabled },
              })
            }
          >
            {save?.settings.soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>
        <nav className="city-subnav-links" aria-label="Quick secondary links">
          <Link href="/missions/">JOBS</Link>
          <span aria-hidden="true">|</span>
          <Link href="/roast/">ROAST</Link>
          <span aria-hidden="true">|</span>
          <Link href="/leaderboard/">RANKINGS</Link>
          <span aria-hidden="true">|</span>
          <Link href="/lore/">LORE</Link>
          <span aria-hidden="true">|</span>
          <Link href="/cinema/specials/">CINEMA</Link>
          <span aria-hidden="true">|</span>
          <Link href="/settings/">SETTINGS</Link>
        </nav>
      </div>
    </header>
  );
}

export function CityGameNavigation({ active }: { active?: MainTab }) {
  const packs = useGame((s) => s.save?.packBalance || 0);
  const tabs: { id: MainTab; href: string; name: string; Icon: typeof Home }[] = [
    { id: 'city', href: '/city/', name: 'CITY', Icon: Home },
    { id: 'battle', href: '/battle/', name: 'BATTLE', Icon: Swords },
    { id: 'packs', href: '/packs/', name: 'OPEN PACKS', Icon: Layers },
    { id: 'collection', href: '/collection/', name: 'COLLECTION', Icon: BookOpen },
    { id: 'market', href: '/market/', name: 'MARKET', Icon: ShoppingCart },
    { id: 'stash', href: '/stash/', name: 'PROP STASH', Icon: Sparkles },
  ];

  return (
    <nav className="city-game-navigation" aria-label="Game destinations">
      {tabs.map(({ id, href, name, Icon }) => (
        <Link key={id} href={href} aria-current={id === active ? 'page' : undefined} className={id === active ? 'active' : ''}>
          <Icon size={15} />
          <span>{name}</span>
          {id === 'packs' && packs > 0 && <i>{packs}</i>}
        </Link>
      ))}
    </nav>
  );
}
