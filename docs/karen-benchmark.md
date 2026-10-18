# Receipt Apocalypse — articulated animation benchmark

**RETIRED — 14 October 2026.** The user rejected this experiment after viewing actual playback: the body parts moved incoherently. Karen's original Canvas/motion-comic special has been restored in battles and galleries. `/cinema/karen/` now plays the original scene, and promotions link to the original `/cinema/` film. Source and assets below are retained for history only, with no active renderer entry point. Static frame review did not validate animation quality. Future work keeps the established animation system and authors character-specific scenes.

This update rebuilds **Karen's solo special**, not the full roster. It preserves the game's punk art direction, beginner flow, card IDs, saved collections, combat kits, odds and reward processing. Her new animation is used for player/enemy solo specials and no-cost gallery previews. Duo scenes retain their existing direction.

Free preview: `/cinema/karen/`. Earlier motion-comic film remains at `/cinema/`.

## Direction

| Full cut | Shot |
| --- | --- |
| 0–1.45 s | Receipt insert: a 0.99 Audacity Tax on one normal day. |
| 1.45–3.10 s | Eye close-up and a localized twitch in the original inked eye texture. |
| 3.10–4.60 s | Karen unrolls a receipt that flows from her gripping hand. |
| 4.60–5.95 s | Her committed opponent tries to escape; paper catches the ankle. |
| 5.95–7.40 s | Jointed snap; textured office panels fold into a complaint form. |
| 7.40–8.65 s | Stamp anticipation, contact at 7.60 s, recoil and Refund Denied mark. |
| 8.65–11.00 s | Karen notices the denial. The cashier changes expression and closes the shutter. |

The 2.4-second replay is an independently mapped edit beginning at the paper pull. It omits the receipt insert and eye close-up rather than speeding every shot up. Impact remains synchronized with stamp contact at 1.52 s. Full scenes remain available in the free preview.

## Implementation

- PixiJS 8.22, dynamically loaded only for this special, rendering native sprites, nested joint containers, text and deforming paper geometry directly through WebGL. It does not upload an animated Canvas as a GPU texture.
- Sixteen separated Karen parts: two face expressions, torso, skirt, upper/lower arms, hands, thighs and lower legs/heels. Continuous shoulder/elbow/wrist/knee transforms, breathing and head rotation replace whole-body pose swapping.
- Separate cashier rig: head expressions, uniform and articulated shutter arm. Custom inked office background.
- The deterministic display list drives both the GPU renderer and the equivalent Canvas compatibility renderer. Unsupported GPU devices receive the same authored scene.
- Browser animation uses requestAnimationFrame without the old 40 ms React-frame throttle. Actual frame rate is device-dependent and has not been measured in a browser.
- Native modal focus, keyboard Esc and Skip; static 650 ms reduced-motion result. The clock pauses while hidden, with stopped sound and no elapsed-time catch-up. Skip/impact/completion callbacks are guarded against duplicates.
- Game outcomes remain server-committed before animation; the renderer never changes damage, inventory, battle progression or rewards.
- Sound remains opt-in. Nine original material-specific stereo procedural Foley assets: room noise, twitch click, thermal printer chatter, paper friction, steps, snap, fold, stamp and shutter. No cloned voice, sampled song or claims of recorded live Foley. Silence after the stamp is deliberate.

## Files and reproduction

`src/components/karen-renderer.ts` — shared scene geometry and articulation.

`src/components/karen-pixi.ts` — direct GPU rendering and fallback.

`src/components/karen-cinematic.tsx` — safe playback/modal lifecycle.

`src/domain/karen-direction.ts` — cuts, edit map and cue timing.

`public/assets/karen/` — generated PNG texture atlases, office WebP, original office PNG and WAV audio.

`scripts/prepare-karen-rig.mjs` — mechanical sprite-region detection and office encoding, not creative image editing.

`scripts/karen-sound.py` — deterministic original Foley generator (NumPy required).

`scripts/review-karen.mjs` — 20 selected render frames and 661 full-cut geometry evaluations using the same display list.

Runtime art was generated with the built-in image-generation tool, using Karen's existing CC026 special artwork as an identity/style reference. Brief: separated transparent sixteen-part Karen rig; transparent four-part exhausted municipal cashier; empty customer-service office with right-hand counter and shutter, all in dense punk ink/crosshatching/halftone. No new characters enter the playable catalogue.

## Verification limits

Automated tests cover both edits, impact/completion, skip, pause, reduced motion, solo routing, continuous articulation, scene keys/geometry, asset existence, cue metadata and immutable playback. Selected offline frames have been visually inspected and joint/paper alignment revised.

The managed environment has no supported browser-control skill. Browser/GPU playback, device frame rate, sound listening, touch/focus behavior and human quality judgment remain unverified. This is an implemented benchmark for review, not a claim that every animation in the game is now professional or that the roster has been migrated.
