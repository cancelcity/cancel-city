# Living Cancel City — first playable block

This checkpoint replaces the city hub with a movable Canvas2D scene and live HTML interface. The user-approved proof scope is one playable block: Screenshot Court, Open Packs, an upgradeable watchtower and Airfryer Palace. It is not a completed redesign of Battle, Market, Packs and Prop Stash.

## Scene

- Screenshot Court, Palace and Pack Shop are separate transparent images. Buildings are depth-sorted with residents, pedestrians, lamps and traffic. The ground image contains pavement, road texture and distant skyline only.
- The courier uses an eight-frame whole-body walking sheet. Existing recognizable characters use their established full-body artwork. The van follows a road route and pauses at the crossing.
- Steam, lighting, paper, short character captions and construction particles are separate layers. Alpha-aware building selection follows the same camera transform as the visible scene.
- Drag/swipe, keyboard movement, zoom, reset, pause and reduced-motion controls are supported. Hidden tabs stop scene time. Taller buildings are scaled to remain inside the scene.
- Existing incidents keep their saved choices and rewards. An active incident appears on the street noticeboard with its host where available; moonwalk, sleep and disco incidents alter the scene directly.

## Play and preserved progress

- Starting a block uses the existing command: free watchtower, loaner resident and 200 Influence.
- Inline objectives connect the first job to two real saved pack openings, then to its one-time pack/Influence/XP reward and building upgrades.
- The directory retains all twelve plots, assignment, move/swap, replacement, custom signs, story chapters and epilogues. Construction and upgrades use existing costs and validation.
- All six main destinations remain available: City, Battle, Open Packs, Collection, Market and Prop Stash. The other screens retain the restored pre-atlas implementations.
- Save schema, cloud persistence, reward rules, rarity odds, combat, existing specials and protected inventory operations are unchanged. Palace retains the existing `afterparty` kind ID, faction and costs.

## Art provenance

Six new assets were created with built-in imagegen, following the gritty inked yellow/magenta/cream visual direction. Exact prompts and paths are recorded in `docs/art/living-city/prompts.json`. Original PNGs remain in that directory; optimized alpha-preserving WebPs are in `public/assets/living-city/`. No supplied mockup is used as a runtime atlas.

The font and its license are retained from the existing project. Existing actors, cards, props and non-palace building levels keep their original assets.

## Verification

- TypeScript no-emit check passed during implementation.
- All 306 tests across 30 files passed, including camera bounds, alpha hit-testing, route boundaries and the actual first-session reward/upgrade/lease sequence.
- `node scripts/render-living-city.mjs` renders the same production scene painter at desktop and mobile sizes. The inspected outputs caught and corrected building clipping. These images inspect the scene renderer, not browser layout.
- Production build and archive creation are required publication gates run by the Sites source workflow.

Browser QA is unavailable in this managed environment. HTML layout, real pointer/touch behavior, transition timing and device frame rate have not been verified in a browser. The work must not be described as pixel-perfect or as completing the full four-screen mockup.

## Reproducible checks

```sh
node node_modules/typescript/bin/tsc --noEmit
node node_modules/vitest/vitest.mjs run
node scripts/render-living-city.mjs
```

The optional offline rendering script uses the provided runtime's `@napi-rs/canvas`, not a production dependency. Its output is under ignored `work/living-city-review/`. It never changes player data.
