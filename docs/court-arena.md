# Screenshot Court battle pass

This pass follows the living-city hub. It replaces the Battle route presentation,
not the combat engine or the player's save format. The existing City, packs,
collection, market and prop stash remain available from its six-destination dock.

## Implemented

- Case-file lobby: campaign progression, daily crew/reward status, unrestricted
  practice, real opponent portraits, original card frames, lead selection,
  owned/loaner search, saved squads, faction synergy and duo requirements.
- Shared in-game resource header and navigation matching the living-city palette.
- Six independently drawn residents on one fixed Screenshot Court background.
  Existing full-body poses remain whole objects. Uniform silhouette-based sizing
  prevents per-pose scale changes; artwork without a pose set uses its existing
  special cutout at its correct aspect ratio.
- Ordinary actions have anticipation, lunge, recoil, weapon-family effects,
  impact numbers, guard feedback, sliding tag-ins and knockout promotion.
- Original character-specific special films, quick/off modes, duo specials and
  equipped-prop presentation remain connected.
- HP, hype, shield and status controls use the saved battle. Damage forecasts call
  the pure combat engine on a clone, including guard, weakness and exposure.
- Rewards use the actual saved receipt. Rematches retain campaign/daily/practice
  mode. Surrender, transcript, help and settings are available.
- Enemy turns wait for scene preparation and action presentation. Modal dialogs
  and hidden tabs pause ordinary-action presentation. Inputs remain gated while
  saving/animating or after an error; reload resumes saved combat.
- Responsive CSS, keyboard controls, descriptive names, live status announcements
  and reduced-motion support. Desktop canvas cropping is bottom-aligned so feet
  and captions stay in view.

## Checks

- `node node_modules/vitest/vitest.mjs run`: 313 tests across 31 files passed.
- `node node_modules/typescript/bin/tsc --noEmit`: passed.
- `node scripts/render-court.mjs`: nine production-painter scene fixtures rendered
  and inspected, including contact, guarding, tag-in, knockout, promotion and
  different resident proportions. This is offline canvas review, not browser QA.
- `scripts/prepare-court-fit.mjs` regenerates the committed alpha-silhouette
  metadata for the 96 existing pose sets; it does not change the character art.

Browser layout and end-to-end interaction verification were unavailable in this
environment. No preview server or substitute browser was started. Actual phone
and desktop interaction testing remains necessary; this pass is not a claim of
pixel-exact agreement with an unavailable historical mockup.

## Scope retained

No reward balance, ownership requirement, economy, D1 binding, sharing setting or
save migration was changed. No new animation batch was generated. Market, packs,
collection and stash have not been redesigned in this pass. The earlier rejected
flattened screenshot atlas remains unused.
