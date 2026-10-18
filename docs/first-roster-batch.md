# First roster batch — twelve presentation-only replacements

Baseline: published version 23, source `d361a90a4032d2ed990cbd38b1de85f5556e5f1d`.
Review route: `/cinema/first-batch/`, also available under MORE.

| ID | Previous identity | New identity | Individual scene |
| --- | --- | --- | --- |
| CC001 | Rage Gamer | Yasuo 0/10 | Wrong-way wind dash, return, team scoreboard |
| CC002 | Discord Dictator | Light Yagamod | Handwritten ban removes scene channels, including tech support |
| CC006 | LinkedIn Gladiator | Erwin LinkedIn | Workforce charge becomes quarterly bars and morale certificates |
| CC007 | Unpaid Intern | Kobeni Minimum Wage | Tray slip, airborne plates, meals delivered, unpaid tip |
| CC012 | Neutrality NPC | Freezer | Final-form announcement, hiding in chest freezer, cold drink |
| CC013 | Culture Vulture | Copy-Paste Kakashi | Scan, reversed paper clone, copyright watermark |
| CC014 | Italian Pasta Inquisition | Gordon Ramen | Slow tasting, giant noodle knot, dinner rejected |
| CC016 | Performative Ally | PowerPoint | Spell promise, mandatory pie chart, paper shields |
| CC018 | Tax Evasion Wizard | Gandalf the Grey Market | Audit doorway becomes shop portal, rolling shutter |
| CC023 | Rug Pull Magician | Fraudo Baggins | Referral ring thread unravels welcome carpet |
| CC058 | Vaccine Update | GenOS Windows Update | Transformation stuck at 99%, squad repair, late chime |
| CC135 | Air-Fryer Evangelist | Daenerys Airfryer | Three fryers preheat before launching a crisped prop |

## Preserved contracts

- All 113 IDs and their ordering, numbers, rarities, factions, set membership, stats, kits and odds are preserved.
- Ownership, foil quantities, saves, paused battle participants, rewards, roster version and server/API storage contracts are unchanged. No data migration or inventory conversion.
- The remaining 101 playable cards and all seven proposed future mergers are untouched in this batch.
- Karen still uses the restored original shared Canvas special; her original movie and legacy assets are retained.
- Existing authored duos retain their paired director rather than being swallowed by the new solo director.
- Support-only cards CC007, CC012, CC016 and CC058 receive no invented enemy damage. Mixed damage/support kits still use actual committed results.
- The original 4.8-second full, 1.2-second quick, and 650-ms reduced timings, impact fraction .6875, hidden-tab pause and exactly-once skip semantics remain.

## Art and sound production

Built-in image generation produced one six-pose transparent whole-character sheet per character, with targeted regenerations for clipped props/feet. Original selected sheets and exact final prompts are retained in `docs/art/roster-first-batch/<ID>/`; metadata/provenance filenames differ by asset group (`metadata.json` or `actor.json` + `provenance.json`). No celebrity recordings, copied music or factual allegations are used.

Mechanical extraction/encoding only: each intact pose and its held props are cropped from the sheet, alpha preserved, anchored at foot contact. The renderer transforms one whole sprite at a time; it never separates or articulates limbs. `public/assets/actors/<ID>-roster-v2-[0..5].webp` contains 72 final poses. `public/assets/roster-v2/<ID>.webp` contains 12 neutral-derived portraits. Original runtime assets remain available in the repository.

`src/data/first-roster-batch.ts` applies display overrides without modifying baseline catalogue records. The shared runtime dispatches to `first-roster-painter.ts` for the twelve solo scenes. Per-character synthesized cues are authored in `first-roster-audio.ts`, including GenOS's deliberately delayed startup chime.

## Verification and review gate

Automated suite: 290 tests passing after integration; TypeScript check passes. New tests cover catalogue invariants, existing save reload/ownership, deterministic pulls, support targeting, intact asset references and playback timing. Offline review uses the same deterministic painter as browser gameplay and checks scene state does not mutate.

`node scripts/review-first-roster.mjs` produces 108 sampled contact frames and twelve complete silent 25-fps/4.8-second clips (1,440 frames) under ignored `work/first-roster-review/`. Contact sheets identify pose clipping, unreadable staging and overlapping dialogue; complete renders exercise the whole timeline. Those clips are **offline**, not proof of browser playback or audio synchronization.

Browser automation is unavailable in this environment. Actual desktop/phone playback, mobile layout, sound and loading behavior remain unverified. This is the first-batch playback review, not the full 51-redesign rollout. Watch the published review before authoring subsequent batches.
