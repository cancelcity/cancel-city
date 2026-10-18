# Municipal Roast Night

A complete three-act single-player encounter at `/roast/`, reachable from the Battle lobby and Municipal Roast Night city bulletin. The original website direction and the113-resident catalogue remain intact.

## Play

Choose three owned residents or the three free starter loaners. The show supplies one Bonk Stick, one Copium Tank and one Apology Megaphone, independently of cosmetic prop ownership. Cards are not consumed. Relaxed mode resolves timing beats at the player's pace with the same benefit as a perfect timed interaction; timed mode gives four-second windows plus a safe-take option. Reduced motion starts relaxed mode automatically.

Rage Gamer punishes repetition. Karen becomes more dangerous with a hostile audience. ReCaptcha Boss reduces damage while the crowd dislikes the player. Changing actions improves audience allegiance; repeating a move reduces damage and draws hecklers. At45crowd points, a qualifying hit can trip a mic stand, rebound an opponent into the snack machine, and eject an invoice. Each act allows one stage chain.

The Bonk Stick deals18damage and cancels the next enemy turn. Copium heals24, absorbs the next actual hit, then bursts for14damage. The megaphone adds30crowd points and exposes the opponent for two hits. Normal specials cost3hype and apply the character's damage/healing/status kit adaptations. Enemy monologues invite interruption; thrown microphones invite dodging. Perfect counters avoid damage and add hype; interruptions chip the opponent and dodges can trigger a stage chain. Between acts, standing residents recover12HP and gain one hype. Defeated residents stay defeated.

The show ends after all three opponents, a squad knockout, surrender, or sixty player turns. The first clear awards1pack+60XP; encores restore the supplied props without granting another reward. These encounters do not increment campaign battle wins/mastery or unlock campaign districts. The mayor's grant-denial finale can be replayed without commands or rewards.

## Save and server contracts

`Save.roast` defaults to null in old saves. All gameplay uses the existing cloud command API and revision/CAS/idempotency protections. Six new discriminated command schemas validate casting, props, beat references and timing inputs. The server computes effects and timing grades; client grades, damage, RNG and timestamps are ignored. Windows are saved and can be resolved after refresh or expiration. Timed input is scored when it arrives: perfect1750–2550ms, good1050–3350ms, otherwise miss. The safe take scores good; relaxed scores perfect. A wrong system clock or network delay can affect timed play, so relaxed mode is the default.

Animations display committed results, never award rewards themselves, and can be skipped. Stage images are preloaded before starting. Hidden tabs pause presentation and send no automatic enemy/counter commands; returning after a hidden expired beat takes the safe result. Dialog/keyboard controls, opt-in audio and reduced-motion behavior preserve the existing conventions. Server maintenance allows surrender and leaving an already finished show.

## Verification

TypeScript check, regression tests, new encounter tests, and real-SQLite API tests. Shared browser/offline Canvas painter reviewed across44frames, including normal actions, props, perfect interrupts/dodges, collisions, close-up cuts, final verdict and reduced motion. Painter inputs remain immutable. The loaner squad completes all three acts; retries cannot duplicate the final reward. Existing cloud saves and other modes pass regression checks.

Browser DOM interaction, audio output and frame pacing are unverified because the supported browser-control skill is unavailable. Native deployment success verifies publication, not production readiness.
