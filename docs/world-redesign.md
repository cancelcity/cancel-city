> RETIRED: this implementation was rejected for failing to reproduce the approved mockup. The original interface is restored in source. Keep this document as an experiment record, not the current game specification.

# Cancel City: connected world redesign

The approved visual direction is a continuous etched-ink city with dirty cream concrete, charcoal shadows, acid yellow and magenta. Screen art is separated from real navigation, game state and controls.

## Playable screens

- The shared dock exposes City, Battle, Open Packs, Collection, Market and Prop Stash on every game screen. Jobs, Roast Night, rankings, lore, special previews, cinema, settings and the session guide remain in More.
- The shared wallet shows the actual XP, pack balance, scrap and city Influence. The home page has an illustrated entrance to the block.
- Explore City has real destination links over a continuous city illustration. My Buildings switches to the same twelve saved plots. Building, replacement, moving, resident assignment, upgrades, daily collection, custom signs, chapters, jobs, incidents, events and prop displays use the existing commands.
- The battle stage places all six intact drawings on one fixed courthouse background. Three compact vitals per side show HP, hype and the active resident. Standing teammates can be tagged in from their vitals. A threat notice exposes the enemy's current hype and special/duo availability; it does not claim to predict the AI's next action.
- Basic battle actions retain their presentation timing. Existing full solo movies, quick/reduced scenes, duos, equipped-prop scenes, mute settings and skip behavior remain supported.
- Rug Alley's catalogue has All, My Duplicates and Missing filters. Recycling protections, crafting prices and confirmation still use the existing exchange rules.
- Packs keep five saved draws, rates, reveal/resume behavior, collection and daily grants. The presentation now sits on the kiosk counter.
- The stash keeps all twelve milestone props, reusable cosmetic loadouts, city display and special previews inside an evidence-locker treatment. Resident trading-card artwork and frames are not replaced.

## Artwork and review

Original new PNG environments and generation prompts are in `docs/art/world`. Runtime derivatives are in `public/assets/world`, encoded as WebP at quality 90 without creative edits. `asset-processing.json` records dimensions and delivery bytes.

`scripts/prepare-arena-footprints.mjs` measures visible alpha in the existing idle drawings. Regenerate `src/data/arena-footprints.json` if actor artwork or normalization metadata changes. Fitting is per resident, so changing action poses does not rescale the actor during a move.

`scripts/review-world.mjs` renders four frames with the actual production compositor using the offline canvas runtime. It produces `work/world-review/battle-contact-sheet.jpg` and individual PNG frames. This reviews compositing, not browser layout.

Validation: TypeScript, existing progression/API/gameplay tests, whole-squad compositing tests, production build and packaged route/media checks. Managed browser control is unavailable in this environment; interactive browser and phone layout verification must not be represented as completed.
