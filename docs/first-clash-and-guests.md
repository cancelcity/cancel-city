# First Clash and guest play

New home visitors get one short authored Roast Night exchange before the main navigation, wallet and five-step guide. Play, choose one of three actual replies, see the reaction, then open the first pack or explore. Returning players with game progress keep the main home. A `?clash=` link explicitly opens the same scene again.

The scene uses existing portraits, actor sprites, venue, dialogue and the real `advanceRoastPractice` reducer. Its two turns run in an isolated object, never the account show or saved practice match. The verdict is a personal delivery badge, not a full-show victory, rare pull or currency award. Reload restores the selected reply. Graphics load after Play and never block selecting a reply; sound is off and saved reduced-motion preferences apply.

The result can become a browser-generated 1080 × 1350 PNG. It contains the real setup, reply, reaction, two existing portraits and the public replay URL. Sharing requires an explicit click. File-capable Web Share opens the native chooser; other browsers offer PNG download. Copy-link/manual-copy still works if image preparation fails. No image is uploaded by the game, and the URL includes no player identifier or save. The recipient plays the same opening independently; this is not live PvP.

## Guests and existing accounts

An explicit `401 AUTH_REQUIRED` response to `/api/player` selects browser-local guest play. `cancel-city.guest-save.v1` and its lock are separate from old browser saves and the cloud cache. Opening, revealing, collecting, battles and progression use the existing game reducer. Guest progress persists on this browser/device; clearing browser storage removes it. Guests do not receive verified ranking status.

Network failures, server errors and unrelated authentication failures keep the existing offline/read-only behavior. The worker's trusted identity and authorization rules remain intact. A guest never sends its game commands to authenticated endpoints, replaces cloud cache, or silently merges with an account. A newly connected empty account offers an explicit import/fresh-start choice. Existing account data takes precedence, and device copies remain separate backups.

The intro's explicit Open Your Free Pack action authorizes one first opening through `/packs/?welcome=1`. Hydration and a pending migration choice finish first. The intent is consumed once; returning players and an existing pending opening are not charged by that URL.

## Validation and limits

31 targeted tests passed across guest/cloud recovery, first-clash engine/session behavior, arrival gating and share text/URL handling. TypeScript passed. Public-anonymous API behavior is simulated at a non-local hostname in the store tests, including 401, 403, 503, network errors, cache isolation, storage quota, refresh and both migration choices.

Interactive visual QA was not performed: browser permission was denied for the local preview. No alternate browser or screenshot mechanism was used. The production build remains the publication gate. The thirty-second sequence is a design target; field loading times, retention and reactions from new human players have not yet been measured.
