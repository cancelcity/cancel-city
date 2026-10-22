# Roast Night: the basement show

The current show at `/roast/` uses version 2: three illustrated acts with authored dialogue, visible opponent intentions and untimed tactical choices. Existing version-1 account shows keep their original rules and timing controls until finished. No saved show is automatically surrendered or replaced.

## Get on stage

Choose three owned residents or the three starter loaners. **Take the Fucking Mic** starts independent practice without a login. Practice uses `cancel-city.roast-practice.v2` in browser storage, validates its saved state, resumes the same crew and show, and never calls the account command API. Lobby / Save & Pause leaves it intact. Account shows use the authoritative API and retain first-clear rewards: one pack and 60 XP, once. Existing Battle and account Roast shows remain untouched by practice.

## Read the room, choose a line

Each exchange shows the opponent's actual setup and next intention. Choose one of three real replies, a Special, a borrowed prop or a tag-in; each spends the turn. An automatic enemy response follows after presentation. There is no reflex timer in version 2.

- **Go for the throat / jab:** strongest direct damage, +1 hype; particularly good crowd response against a heckler.
- **Wind them up / bait:** lower damage, +1 hype; cancels a rant or reduces another incoming hit by 45%.
- **Let them look stupid / deadpan:** small damage, up to +2 hype and 60% protection against the next hit.

The engine supplies the same damage, hype, collision and effect calculations used by the interface previews. Repeating a delivery reduces its damage and loses crowd support. The audience drifts back toward the opponent after enemy responses, and only 40% of your crowd score carries into a new act. Crowd support of 35 can add one finite 10-damage stage collision per act. The final opponent resists damage while the room dislikes you; Karen hits harder with a hostile crowd, while the gamer and final act punish repetition. After 36 player turns the venue closes.

Three hype powers a resident's Roast adaptation of its Special, immediately. Recovery and protection reduce its punchline damage so support characters have a distinct role. The Special button prints its actual damage and kit effects. Roast composure measures performance stamina and is separate from Battle's summon stars and fighter HP. A knocked-out resident stays out; another surviving crew member takes the microphone automatically. Between acts, standing residents recover up to 10 composure and gain one hype.

## Props and writing

One Bonk Stick, Copium Tank and Apology Megaphone are supplied per show, independent of cosmetic ownership. Bonk deals 18 base damage and cancels the next enemy hit. Copium heals up to 24, absorbs the next actual hit and bursts for 14. Megaphone gives up to 30 crowd and exposes the opponent for two hits. All remain bounded by the printed rules and current state; they are not consumed from inventory.

`src/data/roast-script.ts` contains 18 authored setups and 54 tailored jab/bait/deadpan responses, with separate aftermath lines and opponent voices. Gamer excuses, Karen's customer-service abuse and the final boss's surveillance/verification routines have different subjects and delivery. A deterministic per-show offset varies the dialogue order while refresh/resume keeps the same exchange. No generative text service or hidden network request writes the jokes during play.

## Art and presentation

The detailed inked basement venue is `/assets/roast/venue-v2.webp`. Its original production master remains in the Site source under `docs/art/roast/venue-v2.png`; the downloadable mirror includes the optimized runtime image. Existing resident portraits, costumes and acting sprites remain unchanged. The painter composites the original performers over the club with grounded shadows, reactions and finite stage impacts. Deadpan stays calm; direct replies lean forward. The current act replaces the old stage opponent after transitions.

The interface presents compact composure/crowd scores, a readable opposing setup and intention, actual response cards, crew, Special effects and props. Chosen lines and reactions remain visible after the enemy response and in the receipt log. Short desktop layouts keep choices alongside the stage; narrow screens use readable stacked controls. Reduced motion and cinematic preferences are retained. Legacy timing controls remain available only for legacy shows.

## Validation

Focused checks cover old-save compatibility, all new response mechanics, preview parity, finite crowd/collisions, pure practice isolation, stale commands, full three-act completion, server-side validation and single reward delivery. Browser review covers starting/resuming local practice, actual exchanges and stage transitions. These checks establish functioning rules and flows; comedy and competitive balance still benefit from play feedback.

---

# Original version-1 encounter reference

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
