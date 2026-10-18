# Cancel City — expansion checkpoint 02

The authorized scope remains all 240 concepts in `mega-expansion-scope.json`. This is a progress ledger, not a production-readiness claim.

## Implemented in this source

- 47 of 80 new residents, bringing the runtime catalogue to 113. Each ready resident has a reviewed portrait and six transparent acting poses, an actual combat kit, catalogue/archive entries and a six-beat special. `mega-ready.json` gates release; incomplete portraits never enter gacha.
- All 10 new crossover attacks, bringing the total to 16. The battle interface lets the player choose between eligible pairs. Active/partner hype costs, once-per-fight use, actual participants and committed outcomes remain authoritative.
- All 20 new pack entrance scenes, plus a free casting gallery. The scene displays the already committed pull and never rerolls it or changes its rewards.
- All 20 city events, with three endings each, five-minute themed atmosphere, saved decisions and one reward per event. Replaying is cosmetic; expired atmosphere does not trap an unresolved decision.
- Battle Director: selectable solo/crossover/opening scenes, shared runtime painter, timeline scrubbing, six beat markers and slow motion. It is a read-only rehearsal.
- Two presentation additions: persistent custom city signs (carried with moved buildings) and unique original synthesized audio signatures for all 113 residents, respecting existing sound and volume settings.

The old punk direction and original homepage art are retained. The first 15 residents were already published in checkpoint01; this source adds the other 32 ready residents. Existing features are not counted as new scope entries.

## Compatibility and checks

Rarity weights remain 60/25/10/4/1. Original sets/rewards remain unchanged. Each new set reward still requires all twenty residents, even during staged art release. Daily roster versions1–4 preserve original 30/42/50/66-card pools; version5 stores an exact pool snapshot. Old city saves default new event/sign fields safely. Cards and foils have equal combat stats.

Validation: TypeScript check and 240 tests across21 suites; shared runtime Canvas render review covers376 solo frames and130 additional crossover/opening frames, with mutation checks. Contact sheets visually reviewed. DOM interaction, actual browser animation timing and audible playback remain unverified because supported browser QA is unavailable. This build must not be described as production-ready.

## Still pending

33 new resident illustrations/acting sets;60 functional equipment additions;20 boss encounters;19 other gameplay additions;8 other presentation upgrades. Total pending scope entries:140. The remaining art is blocked by the built-in image-generation daily quota, reported reset2026-10-14T05:06:05Z. No alternative API was substituted. Exact prompts, masters, review sheets, extraction metadata and incomplete work are preserved with this source.

CC109–112 and some other designs use original characters after likeness generation was blocked; they are not exact depictions of their named inspirations. The source records these limitations honestly.

## Municipal Roast Night follow-up

A complete three-opponent encounter is now implemented at `/roast/`: reactive audience allegiance and repetition penalties, supplied functional stage props, interactive special/counter windows with an equally strong relaxed option, physical stage collision chains, server-owned saved progress, finite first-clear reward and a replayable grant-denial finale. This advances the gameplay portion of the expansion; it does not complete the equipment/boss catalogue or all other proposed modes. See `roast-night.md` for exact rules and verification limits.
