# Cancel City — game source

Playable source mirror for Cancel City. This snapshot contains saved **Site version 56**, source commit `73b002ff61a2808a819bcab7fc3a01b26ecfdf0b`.

## Download the latest uploaded version

- Repository: https://github.com/cancelcity/cancel-city
- ZIP: https://github.com/cancelcity/cancel-city/archive/refs/heads/main.zip

The ZIP always reflects the current `main` branch, including subsequent uploaded updates. GitHub does not automatically import changes from the separate Site repository; publishing updates must also synchronize this mirror.

The project includes all game code, configuration, tests, text documentation and runtime assets: character portraits, actor sprites, scenery, movies, fonts and audio. The optional original illustration/video production masters under `docs/` remain in the original Site repository; their paths and object hashes are recorded in `docs/omitted-authoring-assets.json`.

The `Sync game assets` workflow verifies the exact runtime files from `.openai/github-assets.json` and commits them to `main`. Download after that workflow succeeds. The normal ZIP then contains the assets directly; no separate download is needed.

The publication service returned `https://cancel-city-gacha.tokieth.chatgpt.site` for version 56. The mirror's provenance, asset manifest and restoration helper use this verified origin; this export-specific adjustment does not change the saved game source or runtime assets.

The game is a web application. Downloading its source does not copy player accounts or hosted database contents. Development and hosting instructions from the original project follow below.

---

# Cancel City

Karen's original motion-comic animation has been restored in battles and previews after the articulated experiment was rejected. `/cinema/karen/` now previews the original special; `/cinema/` retains the original film. The experiment is archived, not part of runtime playback. See `docs/karen-benchmark.md` for its historical notes.

A punk comic collectible card game. Everyone is the problem.

Roast Night now stages a detailed inked basement show with 18 authored exchanges and 54 actual reply choices. Jab, bait and deadpan have distinct tactical effects, visible enemy intentions and truthful previews; support Specials trade damage for recovery. Independent browser-saved practice works without signing in, while account shows retain first-clear rewards and old saved shows keep their original rules. See [Roast Night](docs/roast-night.md).

Screenshot Court uses a prepare-then-fight turn: one optional deployment, one optional tactic, then a battle action. Leads start deployed, knockouts cost 40 LP, and empty decks cause fatigue. Separate browser-saved practice works without cloud authentication and leaves Roast Night untouched. Existing saved battles retain their original rules. Fighters now show their combat role and HP/ATK/DEF. Thirteen spells and seven traps/counters have dedicated inked-comic illustrations, city themes, separate flavour jokes and their own catalogue at `/collection/?type=tactics`. Build twelve tactics (maximum two copies each), choose three fighters and play. Slop & Cope covers draw, cleanse, healing counters and insurance. The Consequences Sold Separately recipe adds HP-for-stars and draw costs, hype theft, debuff transfer, risky team healing and three new reactions. The New Drop filter shows all eight new cards. All twenty tactics are free; selection saves in this browser and each cloud match saves its own deck. A separate five-lesson guided rehearsal at `/battle/?learn=1` teaches the real rules, and twelve practice fighters are available as loaners. See [the current duel rules](docs/tactical-duel.md).

The unified game design uses one navigation and printed-paper interface across Home, City, Cards, Packs, Battle, Market, Events, the Archive, cinema and the Permanent Record (`/profile/`). Cards groups residents, props and crew; Profile groups rankings, settings and save management. Home continues into the neighbourhood, and Airfryer Gate connects Home, City, Events and Court. All existing game artwork and rules are retained.

The Home (`/`), Collection (`/collection/`), Packs (`/packs/`) and Battle (`/battle/`) pages now use the supplied page compositions. The separate playable city remains at `/city/`. Current character identities and real save values are preserved. The October visual revision uses: detailed inked city backdrop, graffiti logo, distressed paper UI, cream card frames and grotesque hand-inked portraits. Existing saves retain stable IDs and upgrade to schema 2 without losing their collections. Rarity labels are Common / Uncommon / Rare / Epic / Mythic; stable rarity IDs and odds are unchanged.

See `docs/roster-expansion.md` for the Cult of Personality expansion and download-free migration update. The agreed city is implemented; see `docs/city-spec.md` for twelve plots, Influence, resident stories and finite missions.

See `docs/memetic-pass.md` for the Municipal Brainrot content pass: 18 original meme posters, 42 resident reply threads, searchable meme tags and sharper internet-culture writing throughout the city.

See `docs/special-cinematics.md` for the 42 character special cinematics, action artwork, preview theater, playback controls and committed-event timing.

See `docs/city-motion-and-props.md` for the city camera/building animation pass and twelve collectible cosmetic props, resident equipment and city display.

See [Airfryer Gate](docs/airfryer-gate.md) for the first connected city case: three responses, original evidence, a four-statement hearing and persistent consequences.

## Playable features

- Fifty residents across six factions and three sets, with individually generated standalone portraits matched to the supplied visual references. Runtime images use responsive WebP derivatives; source artwork and references are archived in docs.
- Three free welcome packs and three claimable packs per UTC day.
- Limited daily and weekly jobs and one-time journey rewards, with individually saved reward claims.
- Five-card pack opening with a torn-wrapper sequence, staggered deal, persistent two-sided flips, individual reveal, reveal all, rare-pull ink bursts and a collection receipt. Outcomes are saved before animation.
- Transparent rarity weights, independent draws with replacement and no pity counter.
- Persistent collection, URL filters, sorting, animated album filtering and an adjacent resident detail panel. Mouse users get responsive card tilt and light; touch and keyboard actions remain available.
- Three regular copies fuse into one cosmetic foil; discoveries remain completed.
- XP, cosmetic levels and finite achievement pack rewards.
- Opt-in synthesised reveal audio, rare-pull emphasis, reduced motion and keyboard controls.
- First-play guidance and owned regular/foil card downloads as PNG images.
- Cloud account saves, server-owned RNG/rewards, legacy import, personal backups and confirmed account deletion.
- Playable three-versus-three single-player battles across six AI districts. Build squads from owned residents or free starter loaners; attack, guard, switch and use 42 authored charged abilities, faction passives and squad bonuses.
- Animated attacks, health, damage/healing, special impacts, knockout stamps, results and rematches. Battles resume after refresh, with one-time first-clear pack/XP rewards.
- Original motion-comic specials for all 50 residents: action poses, cut-ins, scene props/effects, camera movement, impact and saved-result verdicts; full/quick/off modes, skip, static reduced-motion results and a no-cost preview theater.
- A playable isometric neighbourhood with 12 fixed plots, six illustrated building types, three levels, resident assignments, capped daily Influence, twelve finite story jobs and cosmetic epilogues.
- Twelve illustrated collectible props with milestone claims, resident equipment for special visuals and a city trophy plinth. City arrival, distinct building loops, construction/upgrade scenes and Influence pickup respect playback and motion settings.
- A functional free scrap market: recycle spare regulars and craft chosen residents. Full faction lore, opt-in verified rankings, feedback and an operator console.
- A playable meme archive with faction filters, poster inspection, caption copying and deep-fried art; original fictional shitposts on Home and Market, plus scripted resident reply threads.
- Shared page entrances, physical button feedback, dialog entrances/exits, animated counters and foil-forging feedback.

Core gameplay is free. There are no payments, wallet connections, tokens, NFTs or multiplayer in this release. Foils have the same stats as regular cards. Battle effects use authored character kits and six faction passives.

## Run locally

Requires Node.js 22.13 or newer and pnpm. Use the included lockfile.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000. Production retains a Next.js static frontend and adds a separate API Worker:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Next assets are generated in `out/`; the deployable Worker and assets are generated in `dist/server` and `dist/client`. Sites provisions D1 and applies the packaged Drizzle migrations. `next start` does not serve exported output. The managed build container lacks the RSS interface used by Node memory tracing. In that environment only, build with `NODE_OPTIONS=--require=./scripts/managed-memory.cjs pnpm build`. The guarded preload uses V8 heap statistics and marks unavailable RSS telemetry as zero. Normal local builds do not need it.

## Source map

- `app/`: Next.js App Router pages and Tailwind/CSS design system.
- `src/data/catalogue.json`: all editable card content and cosmetic stat values (the UI shows values on a 1–10 scale).
- `src/data/cards.ts`: rarity weights, faction identity and balance configuration.
- `src/domain/game.ts`: pure validated game rules and command processing.
- `src/domain/battle.ts`: deterministic combat, faction abilities, AI, battle validation and district configuration.
- `src/components/battle.tsx` and `app/battle.css`: squad selection, combat choreography and results.
- `src/state/store.ts`: Zustand state, authenticated API client, cloud cache and development-only local mutation locks.
- `src/components/`: reusable cards, accessible native dialogs and game screens.
- `public/assets/`: runtime WebP portraits, backdrop and logo; previous SVG assets are retained as legacy source.
- `docs/art/`: unmodified portrait masters, generation provenance and reproducible asset-processing metadata.
- `docs/design-references/`: the four unmodified visual reference images.
- `src/domain/progression.ts`: UTC job periods, progress and reward definitions.
- `scripts/optimize-assets.mjs`: image encoding pipeline (no creative image edits).
- `scripts/simulate-economy.mjs`: reproducible offline simulation of actual game commands.
- `tests/`: deterministic rules and actual persistence/coordination tests.
- `docs/implementation-spec.md`: full coding-agent implementation specification.
- `docs/motion-design.md`: motion direction, implementation timings and outstanding visual QA.
- `docs/battle-spec.md`: playable battle contract, persistence and QA gates.

## Save and recovery

Hosted gameplay uses authenticated cloud records. The server owns RNG, time, reward checks, inventory and battle state. Local storage is a display cache; offline mutations are refused. Legacy browser progress can be imported with a backup and remains playable, but is excluded from verified rankings. Localhost development retains Web Locks and validated browser saves. Pending openings and battles survive reload. See `docs/online-release.md` for the exact migration, concurrency, storage and operator contracts.

## Verification and limits

The rules, combat and persistence suite includes 151 automated tests for odds boundaries, duplicates, fusion, reward idempotency, UTC reset, invalid saves, write failure and competing tabs, combat effects, turn validity, AI completion, battle recovery and one-time first clears. Type checking, lint and the production build are separate required checks.

Automated browser testing was unavailable in the creation environment. Browser layout, focus, reveal animation and touch behaviour need a follow-up browser QA pass at 1440 × 900, 768 × 1024, 390 × 844 and 320 px width. The four mockups are the visual basis: home follows reference 1, pack opening reference 2, the album/detail view reference 3, and the playable arena builds on battle reference 4. Browser fidelity has not been measured pixel by pixel. All thirty portraits are now standalone illustrations; screenshot crops and the old atlas are not used at runtime.

Owned card-image export and save-file export/import are implemented. Accounts, cloud saves and optional verified rankings are implemented. Multiplayer, payments and blockchain services are deferred.

This is a private online beta, not a production sign-off. Read `docs/online-release.md` for current implementation and remaining launch gates; the earlier readiness checklist remains a baseline audit. See `docs/production-readiness.md` for the complete release checklist and evidence gates. `docs/economy-simulation.json` contains a 200-player synthetic pacing check; it is not a human playtest or a retention measurement.

Culture Collision adds eight diverse original parody residents, eight full acting sets, six duo finishers, finite city incidents, material pack cinematics, mastery frames and scripted callbacks. See docs/culture-collision.md.
