> **11 October gacha finishing revision:** The four mockups drive the implemented layouts. See `docs/design-references/README.md`. All thirty residents now have standalone illustrated portraits, served as responsive WebP assets; masters and prompts are in `docs/art/`. Stable IDs and rarity probabilities remain unchanged. Schema 2 adds limited daily/weekly/journey jobs and first-play guidance; validated schema-1 saves migrate without losing existing inventory or pending outcomes. Three welcome packs and three packs per UTC daily grant supersede the old one-pack daily default below. Owned card PNG downloads are implemented. Battle remains a labeled visual concept. `docs/production-readiness.md` is the authoritative public-launch backlog; this prototype is not production signed off.

Battle follow-up: single-player AI combat is now implemented. See `battle-spec.md` for the current combat contract; the original gacha-first scope below remains the baseline specification.

# Cancel City implementation specification

Version 1.0 • 11 October 2026 • Audience: coding agent

Build a playable browser prototype of **Cancel City** using **Next.js, TypeScript and Tailwind CSS**. The first release centres on free gacha packs, a collectible card album and duplicate fusion. Establish an original punk cartoon identity and make pack opening the most polished interaction. Crypto and battles belong to later releases.

This document defines the implementation contract. Values marked as defaults are product decisions for this prototype and may be tuned centrally after playtesting. Implement the specified defaults without waiting for further product decisions.

## 1 Product scope and priorities

**Game identity:** a fictional city where online celebrities, corporate hypocrites, political opportunists and crypto grifters become collectible residents. The humour targets absurd behaviour, hypocrisy and institutions. Tagline: **Everyone is the problem.** Secondary line: **Collect them all. Regret everything.** UI language: English. Tone: cynical, funny and readable.

**First playable loop:** arrive in the city → claim free packs → open one five-card pack → reveal residents → inspect new discoveries and duplicates → browse the album → fuse three regular copies into one foil → complete factions → earn more free packs.

The player should understand and open a first pack within 60 seconds, without creating an account. The prototype stores progress on the current browser and device. Explain this in Settings and onboarding.

| Priority | Deliverable | Release requirement |
| --- | --- | --- |
| P0 | Punk identity and responsive game shell | Original card frames, pack wrapper, city backdrop, navigation |
| P0 | Gacha opening | Five actual rolls, animated reveal, odds dialog, skip control |
| P0 | Persistence | Saved inventory, pack balance, opening recovery, daily claim |
| P0 | Collection | All 30 residents, filters, detail view, completion counters |
| P0 | Duplicate fusion | Three regular copies become one cosmetic foil |
| P0 | Progression | Starter packs, daily pack, finite achievements, XP |
| P1 | Polish | Optional audio, foil effects, card image export, save export and import |
| Later | Battle and Scandal Meter | Future design reference only; no combat implementation in v0.1 |
| Later | Crypto and social services | Wallets, token, minting, trading, accounts, cloud saves, public profiles |

Do not build payments, tradable rewards, staking, a marketplace, PvP, idle income, live events or generative card combinations. All 30 cards share one launch pool. Faction labels are collection categories, not separate purchasable packs. The first release must be completable and enjoyable with free resources.

## 2 Visual reference contract

Use the four supplied mockups as design references and reconstruct their interfaces with working components. The coding agent should inspect the actual image files before finalising layout. Store references under `docs/design-references/` rather than shipping full mockup images as interface backgrounds.

| Reference file alias | Intended use | Scope in v0.1 |
| --- | --- | --- |
| `01-home` | Logo treatment, city atmosphere, navigation, featured card arrangement | Functional home screen |
| `02-pack-opening` | Pack composition, opening stage, light effects, reveal hierarchy | Primary interaction to match most closely |
| `03-collection` | Album density, card frames, faction and rarity filters | Functional collection and details |
| `04-battle` | Shared card language, stat icons, future arena atmosphere | Document future direction; do not implement combat |

These aliases describe roles and do not prescribe image formats. Record the actual filenames in `docs/design-references/README.md`. Write a short reference audit covering layout, palette, type, illustration style, card proportions and motion implications. Resolve contradictory details in favour of readable controls and the gacha-first scope.

If reference files are missing, continue implementing the functional shell and the art system below. Add a clearly named outstanding asset task. Do not claim visual comparison has passed until the actual images have been inspected. Screenshots are art-direction inputs; copy, mechanics and data come from this specification.

### 2.1 Punk design system

The game should resemble an illicit cartoon trading-card product sold at a ruined convenience store. Combine rough illustrated surfaces with precise alignment and readable type. Use a dirty city skyline, sticker labels, misregistered ink, halftone shading, thick cartoon outlines and printed-paper textures. Keep visual noise away from body text and controls.

| Token | Default | Use |
| --- | --- | --- |
| `ink` | `#101014` | Page backdrop, card outlines |
| `surface` | `#1C1C24` | Interactive panels |
| `paper` | `#F1E8D5` | Card text areas, readable paper panels |
| `acid` | `#DEFF00` | Primary action, brand accent |
| `magenta` | `#FF2DAA` | Foil treatment, selected accents |
| `cyan` | `#31D7FF` | Information and rarity highlights |
| `danger` | `#FF665C` | Errors and destructive actions |
| `muted` | `#B8B4C2` | Secondary text on dark backgrounds |

Use black text on acid and paper surfaces. Check contrast for every actual foreground/background pair. Rarity labels must include words and symbols as well as colour.

Use a licensed condensed display font for headings and a licensed sans-serif for UI copy; suggested defaults are locally hosted Barlow Condensed and Inter. Keep graffiti effects in the wordmark, titles and decorative labels. Body text uses ordinary readable typography. Track font licences with other assets.

Default spacing scale: 4, 8, 12, 16, 24, 32 and 48 px. Panel outlines: 2–3 px. Card outlines: 3 px. Corners: mostly 4–8 px. Hard offset shadows replace broad blurry shadows. Decorative stickers may rotate by 1–3 degrees; reading surfaces remain upright.

Trading-card aspect ratio: **5:7**. A frame contains rarity/name header, large original portrait, faction strip, three stat values, ability label, short description and card number. Show abbreviated content in small tiles; all text is readable in detail view. Never shrink a complete card until its text becomes illegible.

### 2.2 Artwork pipeline

Create `public/assets/cards/`, `packs/`, `city/`, `textures/`, `icons/`, `audio/` and `fonts/`. Define an asset manifest containing path, dimensions, author/source, licence, alt text and status: `final`, `placeholder` or `missing`.

Thirty original portraits are needed, preferably 768 × 768 source images with room for cropping. Render card frames and all labels in HTML/CSS; artwork contains no essential text. Create one reusable pack wrapper and one city background, with independent foreground texture layers. Use WebP or AVIF derivatives while retaining production sources separately.

If finished illustrations are unavailable, use deliberate faction-specific silhouette or sketch placeholders with visible **ART PENDING** badges. Do not fill the album with unrelated stock photos, copied South Park characters or random emoji portraits. Ship an explicit asset backlog listing each pending portrait. Use the same card component for home, reveal, collection and export.

## 3 Technology and project structure

Use Next.js App Router, strict TypeScript and Tailwind. Add Zustand for client game state, Zod for runtime save validation, Motion for React for bounded animation, Vitest for domain tests, and Playwright for user-flow tests. Prefer native controls or accessible dialog primitives. Avoid adding a general dashboard theme.

Inspect the existing repository, its `AGENTS.md`, package manager and lockfile before editing. Preserve working configuration. In a new repository, use the current stable compatible Next.js setup with TypeScript, ESLint, Tailwind, App Router and a `src/` directory. Pin the resulting dependency versions in the lockfile. Do not mix Tailwind v3 and v4 installation patterns. For a new v4 setup, follow the official PostCSS guide and CSS import pattern.

Server-render the static shell and metadata. Browser storage, animated openings, inventory selectors and sound belong in client components. Do not read `window`, storage, the clock or random values during server rendering. Hydrate game state before enabling commands; render deterministic placeholders first. Do not convert the entire app into one oversized client component.

| Location | Responsibility |
| --- | --- |
| `src/app/` | Layout and routes for home, packs, collection and settings |
| `src/components/game/` | Shared shell, card, pack, rarity label, progress and dialogs |
| `src/features/packs/` | Opening stage, reveal controls, summary and odds |
| `src/features/collection/` | Album, filtering, details and fusion controls |
| `src/features/progression/` | Daily reward and achievement presentation |
| `src/domain/` | Pure draw, inventory, fusion, XP and reward rules |
| `src/data/` | Card catalogue, factions, rarity configuration and balance |
| `src/state/` | Store, command dispatcher and derived selectors |
| `src/services/` | Save repository, clock, RNG, coordination and export |
| `public/assets/` | Runtime art, sound and fonts |
| `docs/` | Specification, reference audit, asset backlog and implementation notes |
| `tests/` | Unit fixtures and end-to-end flows |

Use stable semantic IDs. Keep static catalogue records separate from ownership. Store rarity style classes in a complete static map so Tailwind can discover them. All balance values have one source of truth.

## 4 Screen requirements

### 4.1 Home screen

Route: `/`. Present the logo and tagline over the original city backdrop. Feature three character cards, a large **Open packs** action, unopened pack count and a daily reward panel. Show a compact player alias, level and collection progress. Include one authored Cancel Times headline, such as “LOCAL CRYPTO MILLIONAIRE REVEALED TO HAVE $17.” This is flavour content, not a live news feed.

Primary navigation: Home, Packs, Collection and Settings. A small “Battle — coming later” sign may appear as decorative roadmap copy, but is not a clickable game mode. Do not create fake Events or Connect Wallet buttons.

On first visit, use a short welcome panel: explain free packs, device-local progress and the three starter packs. **Enter Cancel City** initialises the save and credits the starter reward once. The home page then highlights the route to Packs. Visiting or refreshing the home screen must not create additional starter packs.

If an opening is pending, replace the primary call to action with **Resume opening**. Claiming a daily reward credits a pack; opening remains a separate explicit action.

### 4.2 Packs screen

Route: `/packs`. Show one launch product, **City Intake — Set 01**, a five-card wrapper, pack balance, a daily claim control and a **View drop rates** control. The opening stage is the visual centre of the page. No shop prices or mock purchases.

When balance is zero, explain the next daily reset, show achievements with available rewards and offer **View collection**. Never allow a negative balance. An unavailable action is disabled with a visible reason.

Starting an opening commits the outcome before playing animations. Display a tear/peel animation, a short burst and a fan of five card backs. The player then reveals cards individually by button, keyboard or tapping the active card. A revealed card displays its name, faction, rarity, “NEW” or “DUPLICATE” badge, and updated quantity. Provide **Reveal all** throughout the reveal stage.

Preserve draw order. Do not sort the last card into a guaranteed rare slot. After all five cards are visible, show a summary with new discoveries, duplicates, XP gained and newly unlocked achievements. **Collect all** acknowledges the opening and returns to the pack shelf; cards already belong to the inventory. Explain this with “Saved to your collection” copy.

Provide optional sound toggle, skip animation control and reduced-motion behaviour. Never require swipe, drag or a precise timing gesture. Initial animation targets: tear 600–900 ms, burst 250–400 ms, flip 250–350 ms. Rare effects should not block input for more than 1.2 seconds. All timings are configurable.

### 4.3 Collection screen

Route: `/collection`. Display 30 catalogue entries by default, including locked silhouettes with readable names. Show overall completion, regular and foil copy totals, faction progress and fusion-ready count. Provide text search, rarity filter, faction filter, ownership filter and foil filter. Ownership options: All, Owned and Missing. Foil options: All, Has foil and Fusion ready. Sort options: Catalogue order, Rarity high to low, Name and Copies high to low. Use catalogue ID as a stable tie breaker.

Filters compose using AND; search matches normalised name, faction name and ability label. Default order is catalogue order. Keep filter state in URL search parameters so refresh and back navigation preserve the view. Display a clear empty result with **Clear filters**.

Each tile includes ownership quantity, foil badge if applicable and a detail action. Locked entries can open details but cannot export an owned foil or fuse. Use a labelled modal on desktop and a near-full-screen dialog on mobile. Show full art, faction, rarity, all stats, ability, flavour text and quantities. Allow switching between regular and foil presentations when owned.

In details, show **Fuse 3 regular copies** only with its eligibility state and exact before/after quantities. A confirmation explains that three regular copies are consumed. After success, show the foil and update all counts immediately. Card export is P1: generate a local image of the selected owned variant with name, art, rarity and branding. A **Download card** control must produce an actual file. Do not pretend there is a public share URL.

### 4.4 Settings screen

Route: `/settings`. Support sound on/off, volume, motion preference and player alias. Motion defaults to the operating-system preference; offer System and Reduced overrides. Audio defaults off and starts only after a user gesture. Alias is 2–24 characters and rendered as plain text.

Explain device-local saves and the absence of an account. Support P1 save export/import with schema validation and replace confirmation. Include a confirmed **Reset local progress** action; cancel leaves all data unchanged. Development-only fixture controls belong behind a development flag and must not appear in production.

## 5 Game rules and balance

### 5.1 Pack distribution

Every pack contains exactly five independent card draws with replacement. For each slot, draw a rarity using the weights below, then uniformly select a card within that rarity. Duplicate cards may occur within one pack. Pack rolls only produce regular copies; foils come from fusion.

| Internal rarity | Display label | Weight per slot | Launch cards |
| --- | --- | --- | --- |
| `nobody` | Nobody | 60% | 7 |
| `problematic` | Problematic | 25% | 7 |
| `public-menace` | Public Menace | 10% | 6 |
| `uncancelable` | Uncancelable | 4% | 4 |
| `public-enemy` | Public Enemy #1 | 1% | 6 |

Display labels are canonical. Generic descriptions may explain Common, Uncommon, Rare, Legendary and Mythic, but do not assign a second conflicting label to a card.

Each specific card has probability `rarityWeight / numberOfCardsInRarity` per slot. For example, each Public Enemy #1 card has probability 1% / 6, about 0.1667%. The odds dialog shows both tier weights and this formula. State that duplicates are possible, no rare card is guaranteed and there is no pity counter. Keep these rules truthful if tuning later changes them.

Implement weighted selection using intervals over `[0, 1)`, without gaps or overlap. A rarity with positive weight must contain at least one card. Reject invalid or non-finite weights; require sum 1 within a documented numerical tolerance. RNG accepts an injected `nextFloat()` function. Production uses a browser random source; tests use deterministic samples. Never reroll during rendering or animation.

### 5.2 Free pack economy

| Grant | Amount | Eligibility |
| --- | --- | --- |
| Welcome | 3 packs | Once when creating a new local profile |
| Daily | 1 pack | Once per UTC calendar date, claimed explicitly |
| First five openings | 1 pack | Once after five completed draw transactions |
| Faction completion | 1 pack each | Once per faction when all five residents are discovered |
| Complete city | 3 packs | Once when all 30 residents are discovered |

Daily eligibility resets at 00:00 UTC. Show “Daily reset: 00:00 UTC” plus a local-time conversion and live countdown. Missed days do not accumulate. A first-day player may claim the daily pack in addition to the welcome grant. Opening a pack does not auto-claim the daily grant.

Evaluate discovery achievements against the candidate inventory before committing a draw transaction, award eligible rewards once and store their IDs in that same transaction. Rewards are visible while an opening animation is pending, but a second opening remains blocked until the first summary is acknowledged. Achievement grants do not themselves trigger another opening.

XP defaults: 25 per opened pack, 5 per first-ever resident discovery and 10 per successful fusion. Duplicate draws add no discovery XP. Level is `1 + floor(totalXp / 100)`. Levels are cosmetic in this release and grant no extra packs or draw advantage. Display progress as `totalXp % 100` out of 100. Future tuning must not retroactively duplicate awards.

The browser clock is acceptable for this free local prototype, but not authoritative. Do not introduce real rewards relying on local daily timestamps. On later backend migration, the server must control time, eligibility and draw outcomes.

### 5.3 Ownership and fusion

Each catalogue card has separate non-negative integer `regular` and `foil` counts. Every draw increments regular by one. Fusion requires at least three regular copies, consumes exactly three and adds one foil of the same card. There is no fee or random failure. Foils have identical future gameplay stats to regular cards.

Fusion can be repeated if three regular copies remain; owning an existing foil does not block it. Exactly three regular copies become zero regular and one foil. A foil counts as owning and discovering that resident. Maintain first-ever discovery independently from current quantities so completion does not regress if later features consume ownership.

Show duplicate extras as `max(regular + foil - 1, 0)`, but fuse eligibility uses regular only. Three combined variants are not eligible unless all three are regular. For launch, a resident remains owned if either count is positive. Collection completion is discovered residents / 30; faction completion is discovered residents in faction / 5.

Distinguish **lifetime pulls**, **current regular copies**, **current foil copies** and **unique discoveries**. Fusion reduces total owned copies by two; lifetime pulls and discoveries stay unchanged. Never reconstruct XP or completion by counting only current inventory.

## 6 Launch catalogue and editable content

Implement exactly the 30 original residents below. Abilities are flavour text in v0.1 and do not execute combat rules. Clout, Shame and Chaos are collectible profile attributes, each an integer from 0 to 100. Higher Shame means resistance to scandal. Do not imply these values influence pack odds.

Keep descriptive copy and ability labels as separate editable strings. Default description length: 1–2 sentences; flavour quote: one short line. Use the supplied hooks as authored starting copy. Do not invent slurs or derogatory claims about protected groups. National satire targets familiar institutions and situations.

| ID | Resident | Rarity | Ability label and collection hook |
| --- | --- | --- | --- |
| CC001 | The Professional Victim | Nobody | Weaponized Tears — Converts criticism into a sponsored apology |
| CC002 | Discord Dictator | Problematic | Permaban — Mistakes a server role for sovereign authority |
| CC003 | The Reply Guy | Nobody | Actually… — Interrupts everyone, including himself |
| CC004 | AI Slop Prophet | Public Menace | Generate More Garbage — Ten thousand posts, zero thoughts |
| CC005 | The Algorithm | Public Enemy #1 | You Are The Product — Turns public suffering into engagement |
| CC006 | LinkedIn Gladiator | Nobody | Humbled and Honored — Announces another inspirational defeat |
| CC007 | Unpaid Intern | Nobody | Exposure Payment — Survives on experience and vending-machine fumes |
| CC008 | HR Necromancer | Problematic | Mandatory Wellness — Reanimates morale for another compulsory webinar |
| CC009 | Private Jet Environmentalist | Uncancelable | Carbon Neutral-ish — Offsets a flight with a heartfelt caption |
| CC010 | CEO of Poverty | Public Enemy #1 | Record Profits — Claims credit for everyone else's exhaustion |
| CC011 | French Strike Simulator | Problematic | Grève Générale — Pauses the city, including his own plan |
| CC012 | Swiss Neutrality Enjoyer | Public Menace | Not My Problem — Watches the disaster from a perfectly insured balcony |
| CC013 | British Museum Collector | Uncancelable | Historical Acquisition — Keeps your belongings for their protection |
| CC014 | Italian Pasta Inquisition | Problematic | Nonna's Wrath — Opens a criminal investigation into broken spaghetti |
| CC015 | Florida Man | Public Enemy #1 | Local News — Makes tomorrow's headline tonight |
| CC016 | Minister of Denial | Nobody | I Was Not Informed — Files the consequences under someone else's name |
| CC017 | Virtue Signal Knight | Problematic | Moral Superiority — Polishes armour with public statements |
| CC018 | Tax Evasion Wizard | Public Menace | Offshore Portal — Makes taxable income disappear into fiction |
| CC019 | Populist Megaphone | Uncancelable | Blame Someone Else — Outsources every problem except the microphone |
| CC020 | Democracy Paywall | Public Enemy #1 | Premium Voting — Introduces the subscription tier for being heard |
| CC021 | Exit Liquidity Chad | Nobody | We're Still Early — Recruits friends into yesterday's opportunity |
| CC022 | Diamond Hands Corpse | Problematic | Never Selling — Holds the bag beyond the end of the skeleton |
| CC023 | Rug Pull Magician | Public Menace | Liquidity Vanished — Makes the roadmap and the money disappear |
| CC024 | Dubai Course Seller | Uncancelable | Financial Freedom — Rents a lifestyle to sell a shortcut |
| CC025 | Forgotten Seed Phrase | Public Enemy #1 | Funds Are Safu — Owns a fortune behind one missing word |
| CC026 | Final Boss Karen | Public Menace | Call The Manager — Escalates reality to customer support |
| CC027 | Doomsday Prepper | Problematic | I Told You So — Celebrates catastrophe before checking the batteries |
| CC028 | Conspiracy Uncle | Nobody | Do Your Research — Connects every dot except the obvious ones |
| CC029 | Doomscroll Parasite | Public Menace | One More Video — Feeds on a bedtime that never arrives |
| CC030 | Cancelled Messiah | Public Enemy #1 | You Can't Cancel Me Twice — Turns every downfall into a comeback tour |

Faction assignment by catalogue range: CC001–005 Terminally Online; CC006–010 Corporate Hell; CC011–015 International Incidents; CC016–020 Politics and Hypocrisy; CC021–025 Crypto Degenerates; CC026–030 Cursed Society. Faction IDs use stable lowercase slugs.

To remove arbitrary implementation choices, use editable starter stat presets by rarity. In Clout / Shame / Chaos order: Nobody 25 / 35 / 30; Problematic 40 / 45 / 45; Public Menace 60 / 45 / 65; Uncancelable 80 / 80 / 60; Public Enemy #1 95 / 65 / 95. Override CC007 to 10 / 70 / 20, CC012 to 55 / 90 / 15, and CC029 to 50 / 20 / 90. These are flavour defaults, not combat balance.

Every entry requires a stable ID, name, faction, rarity, description, flavour text, stats, ability label, ability text and artwork key. HP, energy and executable abilities are not required until combat design exists. Catalogue validation asserts 30 unique IDs, six factions of five cards, expected rarity membership and complete non-empty content. Keep placeholder art status explicit.

## 7 Data contracts

Use equivalent strict types to these contracts. Internal names may change if semantics stay intact. Store URLs in an asset manifest rather than duplicating them in inventory.

```ts
type RarityId = 'nobody' | 'problematic' | 'public-menace'
  | 'uncancelable' | 'public-enemy';
type FactionId = 'terminally-online' | 'corporate-hell'
  | 'international-incidents' | 'politics-hypocrisy'
  | 'crypto-degenerates' | 'cursed-society';
type CardId = string; // validate against the launch catalogue

interface CardDefinition {
  id: CardId;
  catalogueNumber: number;
  name: string;
  faction: FactionId;
  rarity: RarityId;
  description: string;
  flavourText: string;
  stats: { clout: number; shame: number; chaos: number };
  ability: { label: string; text: string };
  artworkKey: string;
}

interface InventoryEntry { regular: number; foil: number }
interface PullResult {
  slot: number; // 0 to 4
  cardId: CardId;
  isNewDiscovery: boolean;
  regularQuantityAfter: number;
}
interface OpeningSession {
  id: string;
  committedAt: string; // ISO timestamp
  balanceVersion: string;
  pulls: PullResult[]; // exactly five, immutable
  revealedCount: number; // 0 to 5
  xpEarned: number;
  unlockedAchievementIds: string[];
}

interface PlayerSaveV1 {
  schemaVersion: 1;
  revision: number;
  playerId: string;
  createdAt: string;
  updatedAt: string;
  alias: string;
  packBalance: number;
  lastDailyClaimDate: string | null; // YYYY-MM-DD, UTC
  inventory: Record<CardId, InventoryEntry>;
  discoveredCardIds: CardId[];
  awardedRewardIds: string[]; // welcome, daily date, achievements
  recentCommandIds: string[]; // bounded to the latest 200 mutations
  lifetimePacksOpened: number;
  lifetimeCardsPulled: number;
  lifetimeFusions: number;
  totalXp: number;
  pendingOpening: OpeningSession | null;
  settings: {
    soundEnabled: boolean;
    volume: number;
    motion: 'system' | 'reduced';
  };
}
```

`discoveredCardIds`, `awardedRewardIds` and `recentCommandIds` are unique sets serialised as arrays. Quantities, XP, revision and counters are non-negative integers. Volume is finite and within 0–1. Date and timestamp values must be valid. Inventory keys must belong to the catalogue. Validate pending pull IDs and slots as well as the outer save shape. Semantic validation also checks that owned residents are discovered, a pending session has exactly five ordered slots, and lifetime cards pulled equals five times lifetime packs opened.

Do not persist computed level, filtered card lists, percentage, available fusion count or `isOwned` flags. Derive them from the canonical save. Session flags are snapshots: if a pack contains the same newly discovered card twice, only its first occurrence is NEW. Calculate post-pull quantities sequentially within that committed transaction.

## 8 Commands and persistence

### 8.1 Domain boundaries

The domain layer contains pure functions for rolling packs, applying pulls, determining daily eligibility, awarding achievements, fusing copies and deriving progress. Inject `Clock.now()` and `Rng.nextFloat()` instead of reading global time/random values inside these functions.

The save repository exposes `load`, `validate`, `migrate` and `commit`. Components call a command dispatcher; they do not mutate inventory directly. Commands include `initialiseProfile`, `claimDaily`, `openPack`, `setRevealProgress`, `acknowledgeOpening`, `fuseCard`, `updateSettings`, `importSave` and `resetProgress`.

Each command returns a typed success/error result. Suggested error codes: `NOT_HYDRATED`, `NO_PACKS`, `OPENING_IN_PROGRESS`, `DAILY_ALREADY_CLAIMED`, `INSUFFICIENT_COPIES`, `SAVE_UNAVAILABLE`, `INVALID_SAVE` and `STALE_REVISION`. User-facing messages explain a next action instead of exposing stack traces.

Every gameplay mutation includes a command ID and the caller's expected save revision. Under the lock, reject stale revisions and return the existing result or a no-op for a previously processed command ID. Keep the same ID when retrying an uncertain request. Record accepted IDs with the save, retaining the latest 200; older requests are blocked by their stale revision. This prevents a repeated fusion confirmation from consuming another set when six or more regular copies are available.

### 8.2 Pack transaction

Under the mutation lock, reload and validate the latest save, then verify balance > 0 and no pending opening. Roll all five cards once. Build a candidate save that subtracts one pack, applies all pulls in order, records discoveries, awards XP and newly earned reward packs, updates counters and creates an immutable opening session with `revealedCount = 0`. Increment revision and persist the entire candidate snapshot.

Only after persistence succeeds should the store publish the new state and start the visual opening. If writing fails, do not display a successful opening or consume a pack in the in-memory UI. Keep the prior authoritative state and allow retry after the storage issue is resolved.

Reloading mid-animation resumes the existing session and its recorded results. Never roll again. **Reveal all** only changes the reveal cursor. **Collect all** clears the session after all cards are revealed; it does not award cards. Repeated clicks, remounts, browser Back and React development double invocations must not duplicate rewards.

Navigation away from the pack page leaves the opening pending. Opening another pack is blocked until the current one is acknowledged. An acknowledged opening cannot be recovered as a new reward transaction.

### 8.3 Storage and coordination

Use one versioned localStorage key, for example `cancel-city.save.v1`. A single validated JSON snapshot contains all gameplay data. Migration functions are explicit, sequential and tested when a later schema is introduced. Avoid silently reinitialising a malformed or future-version save.

On invalid data, show a recovery panel with **Download raw save** and **Reset progress**. Preserve the original bytes until reset or a confirmed replacement import. If localStorage is unavailable or quota is exceeded, explain that progress cannot be saved and disable gameplay mutations. Browsing the catalogue remains available. This release requires durable local storage rather than silently offering a temporary session.

Coordinate mutations across tabs with an exclusive Web Lock and reload inside the lock. Listen for storage changes to refresh passive tabs. Require this coordination capability for gameplay mutations in v0.1. If unavailable, permit catalogue browsing and explain that a supported browser is needed to save game progress. Do not substitute an unguarded read-then-write sequence or claim a localStorage lease provides strict mutual exclusion. Document the capability requirement in the README.

Persist cursor changes as well as gameplay transactions. Do not bind inventory changes to animation callbacks. Background tabs may delay timers; this must not affect rewards or outcomes. Show an actionable saved-state conflict message if a pending action observes a newer revision.

### 8.4 Fusion and claim transaction rules

Fusion rechecks available regular copies under the same lock, applies minus three regular and plus one foil, adds 10 XP, increments the fusion counter and commits once. Repeated confirmation while processing is disabled. A late duplicate confirmation cannot bypass the new quantity check.

Daily claim computes today's UTC date using the injected clock. If the recorded claim date is today or a future date, reject the claim; the next eligible reset is midnight UTC after that recorded date. Store the date, reward ID and extra pack in one commit. Repeated clicks and competing tabs must grant only one pack for that day. Clock rollback must not unlock a second claim.

## 9 Opening state machine and feedback

| UI state | Entry condition | Available actions |
| --- | --- | --- |
| Hydrating | Save has not loaded | Browse shell; commands disabled |
| Shelf | No pending opening | Claim, inspect odds, open if balance allows |
| Committing | Open command executing | Controls disabled, short progress indicator |
| Tearing | New session committed | Skip to first reveal; outcome already saved |
| Revealing | Pending session, fewer than five revealed | Reveal next, reveal all, toggle sound |
| Summary | Five revealed | Inspect cards, collect all, view achievements |
| Recoverable error | Failed command or storage problem | Retry safe action, export raw save, settings |

The tearing animation is transient; it need not be stored. A reloaded pending session enters Revealing or Summary according to its cursor. Summary actions must not create a second transaction that grants inventory.

Common pulls use a brief paper snap. Problematic pulls add cyan ink/light. Public Menace uses magenta sparks. Uncancelable uses warm acid/gold framing. Public Enemy #1 uses a bounded city-blackout effect with a bold label. Avoid flashing strobe effects. Foil uses a restrained iridescent overlay clipped to the frame; preserve text contrast.

Accessibility: all actions work with Enter/Space; use explicit buttons and focus states. Trap focus in dialogs, return it to the trigger on close and permit Escape. Announce revealed card names and rarity in a polite live region, but do not announce every animation frame. Reduced motion removes shaking, parallax, card tilt and particles, and uses instant or short opacity transitions. Provide animation skip even without reduced motion.

Audio files load after opt-in. Suspend or reduce ambient audio when the page is hidden. Successful gameplay never depends on sound being available. Missing art, audio or WebGL capabilities must not prevent opening packs; the implementation does not require WebGL.

## 10 Responsive layout and performance

Default desktop reference viewport: 1440 × 900. Also verify 1024 × 768, 768 × 1024 and 390 × 844. Test narrow layout at 320 px and browser zoom at 200%. Keep click/touch targets at least 44 × 44 px.

On desktop, use a compact top navigation, broad opening stage and supporting reward/odds controls. At medium widths, supporting panels move below the stage. On mobile, use compact top branding and a bottom navigation if needed; reserve safe-area padding and enough height to keep the active reveal and next action visible. The five-card summary may wrap into a grid. No horizontal page overflow.

Collection layout defaults: two compact portrait tiles on mobile, three at tablet sizes, five or six on wide desktop. Small tiles prioritise art, name, rarity and copies; stats and descriptions move to details. Filters wrap into a labelled drawer or expandable row. Reserve image dimensions to prevent layout jumps.

Use responsive image sizes, lazy-load off-screen portraits and preload only the pack/stage and immediate reveal assets. Keep city texture layers lightweight. Animate transform and opacity rather than layout where possible. Cap simultaneous particles at 40 desktop / 16 mobile and remove them for reduced motion. Avoid long-running blur filters on whole screens.

Measure performance in a production build. Targets: no animation-related main-thread tasks over 100 ms during reveal, smooth input during effects, and no cumulative layout shift from art loading. Record the tested device/browser and measurements; do not claim universal frame-rate guarantees. A missing asset should render its intentional fallback without crashing.

## 11 Verification and acceptance criteria

Test business rules directly with deterministic RNG and clocks. Avoid brittle random-frequency tests as the only evidence for correct odds. Validate interval boundaries, rarity membership and candidate state transitions. Use browser tests for persistence and real interactions.

| Test group | Required cases |
| --- | --- |
| Catalogue and configuration | 30 IDs; six groups of five; correct rarity counts; weights sum to 1; positive tier has members |
| Pack rolls | Five results; boundary RNG values; with-replacement duplicates; no automatic rare guarantee; no foils |
| Inventory | Existing copies increment; same-card double pull marks only first as NEW; current/lifetime totals differ correctly |
| Daily | First claim; repeat claim; next UTC date; Brussels DST does not change UTC reset; clock rollback; competing tabs |
| Starter and achievements | Welcome once; threshold crossed; multiple faction rewards in one pack; refresh does not re-award |
| Fusion | 0/2 copies rejected; 3 → 0 regular and 1 foil; 4 → 1 regular and 1 foil; repeated fusion; foil-only ineligible |
| Save lifecycle | Hydration; invalid JSON; invalid quantities/IDs; unsupported version; write failure; confirmed import/reset |
| Opening recovery | Reload before reveal, midway and on summary; skip; navigate away; double click; acknowledge twice |
| Access and layout | Keyboard journey; dialog focus; reduced motion; mobile filters; missing art fallback |

P0 end-to-end journey: start in a clean browser → enter city and receive three packs → explicitly claim the daily pack → open one pack → reveal all five → acknowledge → confirm inventory and counters → reload → confirm unchanged save. A deterministic development fixture separately verifies fusion without waiting for random drops. Cross-tab tests verify that simultaneous claims and opens do not corrupt progress.

For every milestone, run lint, `tsc --noEmit`, relevant unit tests and production build. After the core loop is implemented, run the full browser suite. Verify in at least Chromium, and smoke-test Firefox and WebKit where supported. Report unsupported coordination behaviour clearly instead of assuming all browsers are identical.

Visual acceptance requires side-by-side screenshots against the supplied mockups at matching viewports. Compare silhouette/composition, visual hierarchy, spacing, cards, textures, typography and palette. Keep a short list of intentional deviations caused by responsive behaviour or gacha scope. Missing reference images mean visual acceptance is still outstanding.

The release passes when all P0 functionality works, rewards are idempotent, outcomes survive refresh, art placeholders are explicitly documented, controls are usable on mobile and keyboard, and no visible button simulates an unimplemented feature.

## 12 Implementation milestones

**Milestone 1 — Foundation and visual identity.** Inspect repository and four references. Create the design-reference audit, typed catalogue skeleton, tokens, shell, card frame, pack wrapper and responsive home. Implement real navigation. Run the app and capture desktop/mobile screenshots. Exit criterion: an identifiable punk game shell with a reusable card and pack system.

**Milestone 2 — Reliable gacha vertical slice.** Complete 30 records, weighted draws, welcome/daily rules, validated persistence and mutation coordination. Implement one transaction from pack shelf through five reveals and summary. Add odds dialog, skip and recovery. Exit criterion: the clean-browser journey works and reloading mid-opening preserves the same outcomes.

**Milestone 3 — Collection and fusion.** Add album, URL filters, details, completion metrics, variant switching and fusion. Integrate XP and finite achievement rewards. Exit criterion: fixtures prove quantity rules and reward idempotency; all views update from the same inventory.

**Milestone 4 — Polish and resilience.** Refine pack feel, textures, foil, motion preferences, optional audio, mobile controls and error states. Add P1 image/save export and import if P0 checks are already passing. Exit criterion: accessibility journey, storage failure recovery and target viewport checks pass.

**Milestone 5 — Handoff.** Run all required checks and production smoke tests. Compare final views with actual references. Document art gaps, prototype limitations and later architecture boundaries. Exit criterion: a playable local build, organised source, reproducible setup and an honest feature-status report.

Do not jump to battles, wallets or cloud infrastructure while P0 gacha work remains incomplete. At each milestone, implement and verify working code rather than stopping after a plan.

## 13 Future extension boundaries

Keep static card identity independent of local inventory and any future NFT identifier. A foil is a cosmetic local variant, not proof of on-chain ownership. Token or NFT ownership must never silently change draw weights or card power.

The command layer is the future seam for authenticated server operations. A later backend must own pack entitlement, draw outcomes, inventory, daily time, fusion and idempotency records. Client saves are user-controlled and must not be imported as authoritative tradable assets. Replacing a repository alone is insufficient for an economy with real value.

Future services may verify external cosmetic entitlements and associate them with card IDs, but core free gameplay should function without a wallet. Do not install wallet SDKs or create token contracts in v0.1. Keep an architectural note covering server commands and cosmetic entitlement mapping instead of speculative unused abstractions.

Battle design later can reuse card presentation and faction identity. It needs a separate specification for HP, energy, turn order, abilities and Scandal Meter rules. Existing flavour descriptions are not an executable battle system. Keep the battle mockup in the reference archive for that phase.

## 14 Expected coding deliverables

Deliver the working source, lockfile, README, editable catalogue and balance files, organised asset manifest, reference audit, art backlog and tests. README includes setup, runtime requirements, commands, save model, reset/recovery, and a clear list of implemented features and deferred work.

Required package scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test` and `test:e2e`. Use the repository's package manager consistently. Lint invokes the configured linter directly. Document fixture usage and exclude fixture controls from production.

Provide a short final report with screenshots of home, pack opening and collection on desktop/mobile; passed checks; unresolved issues; and exact local run instructions. No secrets, private keys or external credentials are required for this release.

Official implementation references, checked 11 October 2026:

- Next.js installation and App Router setup: https://nextjs.org/docs/app/getting-started/installation
- Tailwind CSS Next.js framework guide: https://tailwindcss.com/docs/installation/framework-guides/nextjs

## 15 Ready to send instruction for the coding agent

Build Cancel City from this specification using Next.js, strict TypeScript and Tailwind. Prioritise the free five-card gacha loop, persistent collection and duplicate-to-foil fusion. Use the four supplied mockups for art direction, with the pack-opening reference receiving the closest attention. Inspect the repository and reference files first, then implement Milestone 1 immediately. Continue milestone by milestone with working code, tests and visual checks. Keep battles and crypto deferred. Record any missing assets explicitly and use intentional placeholders while progressing on the functional implementation.
