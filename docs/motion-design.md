# Cancel City motion direction

This pass gives the existing punk comic artwork a shared material vocabulary: packets tear, paper buttons compress, cards turn, and reward labels stamp into place. Animation expresses an action and its result. It does not change entitlement, odds, save format or inventory.

## Choreography

| Surface | Behaviour | Timing |
| --- | --- | --- |
| Page | Short opacity and 16 px vertical entrance | 450 ms |
| Sealed pack | Subtle float; pointer/focus lift; wrapper sheen on hover | 4.6 s idle loop; 400 ms interaction |
| Open pack | Save outcomes, then anticipation, jagged cap tear, body departure and paper debris | 1.35 s, skippable |
| Deal | Five card backs arrive from below | 650 ms each; 75 ms stagger |
| Reveal | Persistent front/back card surface rotates through 180 degrees | 720 ms; reveal-all stagger 85 ms |
| New/duplicate | Paper badge lands after the front becomes visible | 250 ms; starts after 480 ms |
| Epic/Mythic | Local ink ring, paper fragments and rarity headline | Finite 750–1150 ms accents |
| Collect | Acknowledge the saved opening; cards leave the stage; receipt confirms filing | 500 ms per card, 60 ms stagger; scene ends after 850 ms |
| Album | Filtered cards enter/leave; surviving cards move to their new positions | 300 ms; entrance stagger capped at 125 ms |
| Card detail | Short paper entrance; foil-forging stamp after successful fusion | 320 ms; 1.3 s celebration |
| Card hover | Spring tilt, light position, lift and press | Spring stiffness 340, damping 28 |
| Dialog | Paper entrance, native backdrop fade and delayed removal on close | 340 ms in; 180 ms out |
| Market | Metal shutter lifts, three concept cards arrive, permanent preview label remains | 850 ms shutter; 650 ms cards, 100 ms stagger |
| Counters | Visible number interpolates; screen readers receive the actual value | 550 ms |

Main entrances use `[0.16, 1, 0.3, 1]`. Repositioning and pointer response use damped springs. Rarity colour comes from the existing catalogue. The market has no purchase, price, trade or wallet actions.

## Implementation boundaries

- `src/components/city-motion.tsx` owns shared easing, reduced-motion preferences and number animation.
- `src/components/pack-opening.tsx` owns temporary presentation states. Domain commands remain the source of truth. Open persists the complete outcome before the tear starts; Collect acknowledges outcomes already granted.
- `src/components/brand.tsx` shares the exact pack wrapper between idle and torn states.
- `src/components/card.tsx` applies mouse-only tilt and sheen. Touch and keyboard do not depend on pointer position.
- `src/components/dialog.tsx` retains native dialog focus behaviour while allowing a finite exit.
- `src/components/market.tsx` is an explicitly labelled future-feature preview at `/market/`.
- Existing artwork, card IDs, economic rules, rewards and save migrations remain intact.

## Reduced motion and interruption

System preference or the in-game Reduced setting disables decorative CSS motion and skips tear/collection choreography. Card faces switch immediately, filtering becomes immediate and the market shutter is hidden. Reveal, Reveal all, Collect and inspection remain usable. Decorative fragments are hidden from assistive technology. Optional audio retains the existing opt-in setting.

Tear can be skipped. Presentation timers are cleaned up on unmount. Refreshing or leaving during a tear/reveal uses the persisted opening on return. Returning after collection does not grant inventory again. The rare accent is local to its card, with no screen-wide flash or camera shake.

## Evidence and remaining visual QA

The existing 41 tests cover domain rules and persistence, not rendered animation. TypeScript, ESLint and the production build are required before publication. This environment does not provide the supported browser QA surface; visual quality, device performance, focus and touch behaviour have not been signed off.

Before calling this studio-level polish, review the actual running build at 1440 × 900, 768 × 1024, 390 × 844 and 320 px width:

- Open from both the physical wrapper and the large CTA; skip the tear; refresh mid-opening; resume a partially revealed pack.
- Reveal individually and all at once; check front/back visibility in Chrome, Firefox and Safari; inspect a revealed card; collect without double grants.
- Open Settings mid-flow and enable reduced motion. Also test the OS setting before loading the page.
- Search, filter and sort the album with zero, one and thirty results; rapidly change filters; check focus and scroll at mobile widths.
- Inspect cards using keyboard only; close every dialog with Escape, backdrop and close button; ensure focus returns to the invoking control.
- Check rare-card overlays for clipping, badge readability, overlap, and replay on saved-session reload.
- Check the market preview label on mobile, route navigation, slow asset loads and a low-end phone. Record frame pacing and tune transforms if necessary.
- Compare spacing, typography, contrast and artwork scale against all four approved references. Assess the composition both still and in motion.

Do not infer a browser QA pass from passing domain tests. Production readiness remains tracked in `docs/production-readiness.md`.
