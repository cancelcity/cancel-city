# Layered character specials

Production target: every active card in `docs/production/layered-roster.json`. The approved Gokart prototype remains at `/cinema/gokart/`. New releases are listed in `src/data/layered-films.json` and shown at `/cinema/specials/`.

Each character folder preserves built-in imagegen originals, exact generation prompts, reference paths, alpha inspection and production metadata. Two or three eight-pose sheets provide intact actors; newer priorities include a dedicated attack sheet. Clipped, merged or inconsistent drawings are excluded rather than stretched into an animation. Connected-component masks isolate the original RGBA pixels without cutting bodies into pieces, repainting anatomy or inventing in-between frames. One opaque scenery plate per character is reused throughout the sequence. Camera motion, actor transforms, projectiles, debris, paper, frost and other effects are composed independently at 60 fps. Pose and expression drawings remain discrete. This is layered motion with authored illustrations, not a claim of 60 hand-drawn images per second or studio animation.

The renderer gives each character six different story beats, its own movement and props, and a specific comic ending. All audio is original synthesized Foley with impacts aligned to film metadata. No sampled soundtrack, celebrity voice, external video generator, optical-flow warping or whole-frame dissolve is used.

Development commands (run in the supplied runtime):

```sh
node scripts/prepare-layered-specials.mjs
node scripts/render-layered-specials.mjs
node --import ./node_modules/.pnpm/tsx@4.22.1/node_modules/tsx/dist/loader.mjs scripts/plan-layered-roster.ts
```

An optional slug after the render script renders only that card. Rendering checks full movie decoding, exact duration, codec streams, frame count and unchanged background-only images with a locked camera. Actor transparency and completeness are checked during extraction. Contact sheets and frame trajectories are retained under ignored `work/layered-specials/`; production render reports are committed per character.

Full solo attacks play the released film in the existing battle dialog. A shared completion gate keeps impact/skip/end/fallback idempotent. Media load or stall failure returns to the existing scene. Quick, reduced-motion, duo and equipped-prop playback keeps the existing presentation. No balance fields, saved inventory, rewards or event commitment change. Previewing a movie is free.

Type checks, focused regression tests and the production build are required. The build force-copies and byte-verifies every Next export into the Worker asset directory and checks the movie references in the final gallery HTML. The deployment archive is inspected before publication. Browser, phone and audible playback remain unverified when the managed browser-control capability is unavailable; reports state that explicitly.
