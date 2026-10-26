# Gobstein — Technical Difficulties

A new live solo special for CC056. The existing VIP Immunity ability, damage, protection, card portrait, actor poses, suit, gold VIP card and miniature yacht are preserved. This is a directed Canvas scene with a new fixed illustrated room, not a prerecorded attack against a fixed enemy.

Preview: `/cinema/gobstein/`. The new special is also used by collection previews and player/enemy solo Specials in Battle and Roast Night. The cinema gallery links to the preview. Full lasts 4.8 seconds; Quick uses the same scene in 1.2 seconds. Equipped props remain compatible. Existing Duos retain their own scenes.

## Direction

- Establish the private-harbour security room with the actual opponent and a bored guard.
- Gobstein extends his existing VIP card; the CCTV camera turns away.
- The feed drops at 46% of the scene. Mechanical impacts are audible with sound enabled; there are no visible actors, props or result badges during the outage.
- The decisive slam shares the existing authoritative impact point: 3300 ms Full / 825 ms Quick. The renderer never applies damage or runs gameplay commands.
- The feed reconnects at 73%. The actual opponent is embedded in cracked plaster only when the committed event caused damage or a knockout. Cancelled zero-damage attacks keep them upright and have no violent hit cues.
- The final security log reads **UNEVENTFUL SHIFT / INCIDENTS REPORTED: 0**. Preview stages the full action without claiming numerical damage or rewards.

Reduced motion is one static final tableau for the existing 650 ms. Sound is opt-in, uses original short synthesized mechanical transients, and is cancelled on skip/hide/unmount. The existing presentation gate, background pause and exactly-once callbacks remain in charge.

## Art

Built-in imagegen generated `docs/art/gobstein-technical-difficulties/security-room-original.png`, using the current CC056 portrait and actor pose as style/identity references. No playable character is baked into the room. The guard is a small adult background extra. A mechanical resize and WebP conversion produced `public/assets/specials/gobstein-technical-difficulties-v1.webp` at 1600×900. Exact brief: `docs/art/gobstein-technical-difficulties/brief.md`.

## Verification

Focused timeline/audio tests cover Full/Quick impact alignment, blackout visibility, real zero-damage versus preview staging, knockout truth, stable reduced motion, solo/Duo selection, immutable playback, cue crossings and cancellable audio graphs. Browser playback and frame review are recorded with the release validation, rather than inferred from unit tests.
