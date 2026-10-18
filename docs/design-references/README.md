# Cancel City visual references

The four user-supplied images are preserved unchanged under `docs/design-references/mockup-1.png` through `mockup-4.png`.

| Reference | Implemented treatment |
| --- | --- |
| 1: Home | Full illustrated city, graffiti wordmark, vertically stacked paper actions, four featured cards, scandal progression bar, bottom news strip |
| 2: Packs | Left navigation, five dramatically arranged cards, bright opening burst, wrapper, free-pack CTA, right-side exact drop rates and collection progress |
| 3: Collection | Notebook-style cream album, six faction tabs, compact filters, five-column desktop card grid, adjacent full resident dossier, three cosmetic stats and foil fusion |
| 4: Battle | Clearly labeled concept-only arena with two three-card teams, central PERMABAN splash and action-card presentation |

The game keeps its first-release gacha rules: five independent draws, regular cards only, 60/25/10/4/1 rarity weights, no pity or guaranteed rare slot, free starter packs, three daily packs and limited daily/weekly/journey jobs, three-copy cosmetic fusion. Mockup commerce, boosted odds, guaranteed 10-packs and battles are not presented as implemented gameplay.

## Assets and implementation

All thirty residents now have individually generated, visually inspected 1254 × 1254 PNG masters in `docs/art/residents/`. Final prompts and provenance are in that directory. `scripts/optimize-assets.mjs` creates 384 px and 1024 px WebP derivatives for native responsive image selection and lazy loading. Neither screenshot crops nor the atlas are used at runtime. Original mockups are preserved as design documentation and excluded from the deployed asset set. Stable catalogue IDs remain unchanged; schema-1 saves migrate into schema 2.

The body city artwork and title are generated raster assets guided by all four references. Panel edge shapes and texture are native CSS. UI is real HTML and interactions use existing validated commands, not screenshot hotspots.

Browser rendering checks were unavailable in this environment. Visual assets were inspected, and mapping, type checking, gameplay tests and production export checks passed. Exact pixel fidelity and responsive layout require a browser QA pass.
