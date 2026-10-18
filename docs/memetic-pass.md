# Municipal Brainrot / memetic content pass

Direction: Cancel City is a place built from internet folklore, shitposts, ego, corporate dread and cursed comment sections. Humor comes from recognizable situations and punchlines rather than a layer of generic slang. This pass includes profanity and dark fictional satire.

## Delivered content

- Rewritten descriptions and quotes for all 42 existing residents. Stable names, IDs, portraits, rarity, faction, sets, stats and abilities are retained.
- An authored original post and one resident reply for every character: 84 scripted posts in expandable dossier threads. Meme tags appear on full cards and dossiers, and become searchable in Collection, Market and Lore.
- 18 original in-world meme posters: three per faction, using impact captions, a falling chart, a receipt or a terminal. Existing original character art is composed in HTML/CSS; no external meme images or fake screenshots of real posts are used.
- An interactive archive in Lore with faction filters, progressive loading, expanded posters, resident inspection, caption copying and an optional deep-fry treatment of the illustration. Text remains outside the image filter.
- Manual next-post dispatches on Home and Market. No auto-scrolling or timed content replacement. Reduced-motion preferences disable the transition movement.
- All six faction dossiers, all 18 city chapters/epilogues and all twelve city mission titles rewritten around the same culture. Pack and battle presentation copy adopts the same voice while action effects, reward details and odds stay explicit.

## Source

- `src/data/internet.ts`: profiles, reply references, meme tags/search and poster content.
- `src/components/internet.tsx`: dispatches, reply threads, poster renderer and archive controls.
- `app/internet.css`: responsive poster formats and thread layout.
- `src/data/catalogue.json`, `src/data/city.ts`, `src/components/lore.tsx`: authored resident, city and faction writing.

These posts are fictional dialogue, including the celebrity caricatures. Scripted-feed labels are shown in the UI. The archive is not a live social service, and its controls do not generate rewards, change player records or send anything to other people. Copy caption writes only to the visitor's clipboard following their click. Clipboard rejection gives a visible message. No download or new dependency is introduced.

No schema, migration, RNG, balance, prices, pack budget, mission target or combat-rule change is part of this pass. Existing saves, paused openings and battles use the same identities and rules.

## Verification

- 151 existing rules, save recovery, city and API tests pass.
- TypeScript passes.
- A content-integrity check validates all 42 profiles and reply references, 18 unique faction-matched poster references, three posters per faction and search coverage for copium/NPC/apology/doomscroll/Discord/Elon. All non-copy catalogue fields match the prior published source exactly.
- Publication uses an exact-source production build.

Supported browser QA is unavailable here. Actual poster fit on real screens, touch/keyboard interactions, clipboard permissions, modal-to-dossier focus handoff and visual polish still need a device/browser pass. The Sites skill instructs skipping browser QA when `$control-browser` is unavailable. No preview server or improvised browser was used.
