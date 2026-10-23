# Cloutside: living street benchmark

The first finished scene is one connected dispensary corner, with an exterior,
an interior, a small cast and a choreographed encounter. Preserve the faces,
costumes, props and textures from the existing character portraits and actor
sprites. Movement, shadows, occlusion and dialogue should make those same
characters belong to the street rather than redesigning them.

The encounter follows a clear sequence: notice a problem, hear the local cast,
make a choice, watch a visual reaction and save the result. Its authored outcome
and reward can be claimed once. Reopening a finished scene must show its saved
consequence; reading other possibilities must never award another reward.

## Sound

`useCornerAudio(paused?)` supplies `{enabled, toggle, playCue, error}`. Sound is
off by default. Invoke `toggle()` directly from the sound button; its first
explicit gesture unlocks browser audio. The hook generates quiet city hiss,
neon hum and distant bass locally with WebAudio. Cues are `paper`, `arrival`,
`door` and `resolve`. No external media, library, fetch or automatic playback.

Pass `paused=true` while the scene is paused. Pausing and hiding the tab mute
ambience, cancel active cues and suspend audio. Returning can resume only after
the player has enabled sound. Leaving the scene disposes every source/context.
Short cues have bounded voices, envelopes and a restrained output gain. Audio
failure leaves play intact and offers a retry through the same button.

## Acceptance at normal playing size

- The entrance, available characters and next action are readable immediately.
- Mouse and touch use the same clear actions; targets do not obscure faces.
- Conversations stay short, with pauses and reactions timed to their jokes.
- A resolved encounter visibly changes the scene and survives reopening.
- Reduced motion still communicates every beat and choice without travel loops.
- Sound remains optional, quiet, and silent in a paused or hidden scene.
- Existing City saves, building identity and other districts remain intact.
