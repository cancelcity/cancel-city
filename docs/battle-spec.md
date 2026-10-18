# Cancel City: playable battle v1

Battle is now a complete browser-local, single-player loop: choose a district and three residents, fight the AI crew, receive a saved result and first-clear reward, then rematch or change squads. It replaces the static arena concept. Market, multiplayer and crypto remain separate work.

## Rules

- Three distinct residents per side. Owned regular or foil residents and the always-available starter loaners (`CC001`, `CC008`, `CC015`) are legal. Cards are never consumed. No rarity or foil multiplier is applied to player stats.
- The first slot starts; two residents remain on the bench. Player acts first, then the city, alternating until a result. Knockouts promote the first standing bench resident automatically.
- Maximum composure is `round(65 + shame × 0.3)`. Base attack is `round(16 + clout × 0.1)`. Enemy values additionally use the district multiplier: Street 0.85, Network 1, City Hall 1.05.
- Everyone begins with 1 of 3 hype. Call out deals base damage and adds 1 hype. PR Shield adds 1 hype and reduces the next incoming hit by 60%. Repeated guards replace the existing shield.
- Ability consumes 3 hype. Tagging in a standing bench resident spends the entire turn. Health, charge, guard and weakness remain with each fighter after switching.
- Damage is deterministic, rounded after modifiers and at least 1; actual damage/healing never exceeds remaining/missing health. A hit consumes guard and the attacker’s weakness. Weakness reduces the next outgoing hit by 30%. Pierce ignores guard, but respects weakness.
- After 40 full rounds, standing-resident count decides the result, then total remaining health fractions. A final tie goes to the city. Surrender records a loss and retains all cards.

| Faction | Ability effect, using the resident’s authored ability name |
| --- | --- |
| Terminally Online | Base attack +12 damage; remove 1 opposing hype |
| Corporate Hell | Heal up to `round(20 + chaos × 0.15)`; shield next hit by 60% |
| International Incidents | Base attack +10 damage; shield next hit by 35% |
| Politics & Hypocrisy | Base attack +15 damage; weaken next enemy hit by 30% |
| Crypto Degenerates | Base attack +20 damage; ignore opposing guard |
| Cursed Society | Base attack +8 damage; heal up to 18 composure |

The UI displays exact base ability values. Guard and weakness may reduce damage. The AI uses available abilities, avoids wasting full-health healing, finishes vulnerable opponents and guards to prepare a special when low on health.

## Progression and persistence

Each district’s first win grants 1 pack and 50 XP. This is a finite total of 3 packs and 150 XP. Replays record win/loss totals without additional rewards. Reward IDs are `battle:<district-id>` and share the existing atomic save transaction with the final combat step.

Schema 2 gains a defaulted `battle` field: current match, cleared district IDs and totals. Existing schema-1 migration and schema-2 saves remain compatible. A match stores rules version 1, team state, active indices, phase, step, up to 80 ordered events, winner, reason and awarded receipt. Inventory, pending gacha openings and previous rewards remain intact. Backup/import includes combat state.

The existing Web Lock protects all writes. Player commands identify match and step and reject stale actions. Automatic AI commands check their match/step inside the lock, so competing tabs can perform at most one AI turn. An obsolete automatic tick becomes a no-op. A fresh tick uses the latest locked revision. Combat and reward outcomes persist before their animations begin; failed writes expose no victory or reward. Reloading during the city’s turn schedules the remaining action on return.

This remains client-authoritative and editable by the browser owner. It is suitable for the free single-player prototype. Competitive play or a real-value economy requires backend authority; this release does not supply it.

## Motion and interaction

The arena uses the existing hand-inked card art, distressed cream paper, neon pink and acid green. Action controls remain below the active fighters; standing bench buttons switch the player’s resident.

- Call out: attack lunge, defender recoil, floating damage and animated composure bar.
- Ability: a larger finite headline with ink fragments; faction effects, healing and status badges match the resolved state.
- Knockout: departing card and cancellation stamp; replacement enters while the bench records the defeated resident.
- Guard: visible next-hit protection and charged hype cells.
- Result: finite paper entrance, clear win/loss headline and persisted first-clear receipt.
- Actions lock during the finite presentation delay, then the city answers. No infinite animation controls combat resolution.
- Reduced motion removes transforms and particles, retains immediate state changes and short opacity feedback. Sound respects the existing opt-in preference. Native dialogs explain rules and confirm surrender.

## Verification

The combined suite has 67 tests: the existing 41 gacha/progression/persistence checks plus 26 combat/recovery checks. They cover legal ownership, loaners, foil parity, all 30 ability executions, shielding, piercing, weakness, healing caps, turn validity, switches, knockouts, AI completion in every district, the round cap, legacy decode, reload recovery, stale turns, first-clear idempotency, competing AI ticks and storage failure. TypeScript, lint and production export are separate release checks.

Browser QA is unavailable in this environment. There is no claimed visual, keyboard, Safari, touch or device-performance sign-off, and deterministic tests do not establish fun or balance. Before public launch:

- Play every district with loaners and several owned squads; record duration, win rate and tactical choices.
- Inspect the arena at 1440 × 900, 768 × 1024, 390 × 844 and 320 px. Check text, control targets, health bars, effect clipping and result visibility.
- Verify attack, healing, ability, guard, switch, knockout and final-result choreography in Chrome, Firefox and Safari.
- Reload during player animation, AI delay, knockout and final reward. Return from another route and confirm the match resumes.
- Use keyboard and a screen reader; verify focus restoration after rules and surrender dialogs. Test both in-game and OS reduced motion.
- Test simultaneous tabs, slow storage, imported paused battles and opt-in audio. Inspect performance on a low-end phone.

Further production gates remain in `production-readiness.md`.
