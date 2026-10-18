# Cancel City special cinematics

Original punk motion-comic specials inspired by the dramatic staging requested by the user. All 42 residents have a new transparent action pose, authored scene direction, scene prop/effect, entrance cut-in, ability title, launch, impact and verdict. Player and enemy specials are supported.

## Playback

- Full: 4.8 seconds of active presentation time; impact at 3.3 seconds. Quick: 1.2 seconds; impact at 825 milliseconds. These share the same impact fraction. Off: instant committed result. Preference is saved on this device only, with a safe fallback if browser storage is unavailable.
- Reduced motion: a static 650-millisecond verdict, with no camera movement, projectile movement, shake or particle burst. Existing system and in-game preferences are respected.
- A native modal cinematic keeps background battle controls inert. Skip or Escape applies the already-saved presentation result and returns once. The battle turn status receives focus on completion.
- Active animation time and CSS animation pause while the document is hidden. Audio nodes stop on hide, skip and unmount. Synthesized entrance/launch/impact cues are original and honor sound opt-in/volume. A per-cinematic mute control is available when sound is enabled.
- Current fight sprites are preloaded for six combatants. Playback allows up to 900 ms for the actor asset, then falls back to the existing portrait; target image failure also falls back. No asset error can change or retry an attack.
- The preview theater at /battle/?specials=1 shows all 42 without needing ownership, hype or a running battle. It provides faction/text search and never invokes a gameplay command. The Arena waits while preview/rules dialogs are open; an already-in-flight server response can finish but its presentation waits.

## Save and event safety

The authoritative command commits before the cinematic. The Arena retains its prior visual snapshot until impact, then displays the committed snapshot; enemy progression waits for completion. The actor and target are read from the committed event slots, so a knockout cannot substitute the next resident as the attacked character. Support specials target their actual recipient, and displayed damage/healing are exactly the committed amounts.

Mounting a saved battle marks the current step presented, so refresh does not replay its special. Duplicate responses, skip and mode changes cannot create game commands, damage, healing or rewards. No balance, battle rule, save schema or database migration changed.

## Source

- src/data/specials.ts: 42 authored directions and timing constants.
- src/domain/cinematic.ts: committed-event mapping, preview records, playback eligibility and a tested presentation clock.
- src/components/special-cinematic.tsx: native dialog playback, 39 scene motifs, preview gallery, image fallbacks, audio/visibility handling.
- src/components/battle.tsx: visual snapshot, impact/completion gate, AI pause and deep link.
- app/specials.css: camera, scene, sprite, props and responsive/reduced-motion timelines.
- src/services/special-audio.ts: cancellable original synth cues.

## Artwork / final paths and prompt set

Built-in image_gen used for all 42 new sprites; original resident portraits were identity/style references. Exact final prompt set is [art/specials/briefs.json](art/specials/briefs.json). Each of the six faction provenance files beside it records generated output paths, edits, hashes and visual/alpha checks.

Masters are saved under /workspace/scratch/80a8c8c1affe/cancel-city/docs/art/specials/; runtime sprites under /workspace/scratch/80a8c8c1affe/cancel-city/public/assets/specials/. Masters remain unchanged. scripts/prepare-special-assets.mjs performs technical alpha-bound alignment, proportional resizing, 896px canvas/baseline padding and WebP encoding. The 42 runtime sprites total 9,133,216 bytes, largest 331,898 bytes; this is not measured page transfer.

| Resident | Special | Motif | Final files |
| --- | --- | --- | --- |
| CC001 · Rage Gamer | Rage Quit | controller | [master](art/specials/CC001.png) · [runtime](../public/assets/specials/CC001.webp) |
| CC002 · Discord Dictator | Permaban | hammer | [master](art/specials/CC002.png) · [runtime](../public/assets/specials/CC002.webp) |
| CC003 · The Reply Guy | Actually… | reply | [master](art/specials/CC003.png) · [runtime](../public/assets/specials/CC003.webp) |
| CC004 · AI Apocalypse Bro | Slop Apocalypse | bots | [master](art/specials/CC004.png) · [runtime](../public/assets/specials/CC004.webp) |
| CC005 · The Algorithm | You Are The Product | feed | [master](art/specials/CC005.png) · [runtime](../public/assets/specials/CC005.webp) |
| CC006 · LinkedIn Gladiator | Humbled and Honored | resume | [master](art/specials/CC006.png) · [runtime](../public/assets/specials/CC006.webp) |
| CC007 · Unpaid Intern | Exposure Payment | spotlight | [master](art/specials/CC007.png) · [runtime](../public/assets/specials/CC007.webp) |
| CC008 · HR Necromancer | Mandatory Wellness | wellness | [master](art/specials/CC008.png) · [runtime](../public/assets/specials/CC008.webp) |
| CC009 · Eco Influencer | Sponsored Sustainability | leaves | [master](art/specials/CC009.png) · [runtime](../public/assets/specials/CC009.webp) |
| CC010 · CEO on a Yacht | Offshore Everything | yacht | [master](art/specials/CC010.png) · [runtime](../public/assets/specials/CC010.webp) |
| CC011 · French Strike Simulator | Grève Générale | barricade | [master](art/specials/CC011.png) · [runtime](../public/assets/specials/CC011.webp) |
| CC012 · Swiss Neutrality Enjoyer | Not My Problem | neutral | [master](art/specials/CC012.png) · [runtime](../public/assets/specials/CC012.webp) |
| CC013 · Culture Vulture | Culture Harvest | stickers | [master](art/specials/CC013.png) · [runtime](../public/assets/specials/CC013.webp) |
| CC014 · Italian Pasta Inquisition | Nonna's Wrath | pasta | [master](art/specials/CC014.png) · [runtime](../public/assets/specials/CC014.webp) |
| CC015 · Florida Man | Local News | storm | [master](art/specials/CC015.png) · [runtime](../public/assets/specials/CC015.webp) |
| CC016 · Performative Ally | Public Solidarity | avatar | [master](art/specials/CC016.png) · [runtime](../public/assets/specials/CC016.webp) |
| CC017 · Virtue Signaler | Performative Outrage | alarm | [master](art/specials/CC017.png) · [runtime](../public/assets/specials/CC017.webp) |
| CC018 · Tax Evasion Wizard | Offshore Portal | portal | [master](art/specials/CC018.png) · [runtime](../public/assets/specials/CC018.webp) |
| CC019 · Populist Megaphone | Blame Someone Else | megaphone | [master](art/specials/CC019.png) · [runtime](../public/assets/specials/CC019.webp) |
| CC020 · Democracy Paywall | Premium Voting | paywall | [master](art/specials/CC020.png) · [runtime](../public/assets/specials/CC020.webp) |
| CC021 · Crypto Bro | Greed Delusion Scam | rocket | [master](art/specials/CC021.png) · [runtime](../public/assets/specials/CC021.webp) |
| CC022 · Diamond Hands Corpse | Never Selling | diamond | [master](art/specials/CC022.png) · [runtime](../public/assets/specials/CC022.webp) |
| CC023 · Rug Pull Magician | Liquidity Vanished | rug | [master](art/specials/CC023.png) · [runtime](../public/assets/specials/CC023.webp) |
| CC024 · Smooth Rug Pull | Liquidity Disappears | rug | [master](art/specials/CC024.png) · [runtime](../public/assets/specials/CC024.webp) |
| CC025 · Forgotten Seed Phrase | Funds Are Safu | key | [master](art/specials/CC025.png) · [runtime](../public/assets/specials/CC025.webp) |
| CC026 · Final Boss Karen | Privilege Outrage Summon | manager | [master](art/specials/CC026.png) · [runtime](../public/assets/specials/CC026.webp) |
| CC027 · Doomsday Prepper | I Told You So | bunker | [master](art/specials/CC027.png) · [runtime](../public/assets/specials/CC027.webp) |
| CC028 · Conspiracy Mom | Secret Research | strings | [master](art/specials/CC028.png) · [runtime](../public/assets/specials/CC028.webp) |
| CC029 · Doomscroll Parasite | One More Video | feed | [master](art/specials/CC029.png) · [runtime](../public/assets/specials/CC029.webp) |
| CC030 · Cancelled Messiah | You Can't Cancel Me Twice | comeback | [master](art/specials/CC030.png) · [runtime](../public/assets/specials/CC030.webp) |
| CC031 · Zuck.exe | Terms of Your Life | chains | [master](art/specials/CC031.png) · [runtime](../public/assets/specials/CC031.webp) |
| CC032 · Stan Empress | Weaponized Fanbase | fans | [master](art/specials/CC032.png) · [runtime](../public/assets/specials/CC032.webp) |
| CC033 · Prime Overlord | Same-Day Domination | delivery | [master](art/specials/CC033.png) · [runtime](../public/assets/specials/CC033.webp) |
| CC034 · Subscription Goblin | Free Trial Forever | invoice | [master](art/specials/CC034.png) · [runtime](../public/assets/specials/CC034.webp) |
| CC035 · Il Monumento | Bronze Diplomacy | statue | [master](art/specials/CC035.png) · [runtime](../public/assets/specials/CC035.webp) |
| CC036 · World Tour Savior | Charity Encore | encore | [master](art/specials/CC036.png) · [runtime](../public/assets/specials/CC036.webp) |
| CC037 · Don Tremendous | Absolutely Tremendous | podium | [master](art/specials/CC037.png) · [runtime](../public/assets/specials/CC037.webp) |
| CC038 · The Eternal Candidate | One More Term | clock | [master](art/specials/CC038.png) · [runtime](../public/assets/specials/CC038.webp) |
| CC039 · Elongated Ego | Hostile Rebrand | rocket | [master](art/specials/CC039.png) · [runtime](../public/assets/specials/CC039.webp) |
| CC040 · Laser-Eye Prophet | Number Go Up | laser | [master](art/specials/CC040.png) · [runtime](../public/assets/specials/CC040.webp) |
| CC041 · Ye of Chaos | I Am the Feature | ego | [master](art/specials/CC041.png) · [runtime](../public/assets/specials/CC041.webp) |
| CC042 · Apology Influencer | Tears Sponsored | apology | [master](art/specials/CC042.png) · [runtime](../public/assets/specials/CC042.webp) |

## Verification and limits

165 automated tests pass, including every actual ability event, enemy knockouts/target identity, support recipients, duplicate/resumed event eligibility, full/quick impact fractions, hidden pause, reduced motion, skip-once and mode changes. TypeScript and exact-source production build are required. Every generated sprite was inspected, and root inspected six combined runtime contact sheets.

Supported browser QA is unavailable: the Sites skill requires “If $control-browser is unavailable, skip browser QA.” Real scene composition, modal focus handoff, touch/small-screen playback, frame rate, audio latency and first-load performance remain unverified. Successful automated checks do not establish those results.
