# GOKART intro animation assets

Two distinct cinematic shots generated with the built-in `image_gen` tool using the parent-provided GOKART master image as the identity, costume, kart, palette and drawing reference. Exact prompts and source image paths are in `prompts.json`; extraction coordinates and output sizes are in `manifest.json`.

- `ignition-original.png`: 2 columns × 4 rows, eight face/steering-wheel close-up frames.
- `reveal-original.png`: 2 columns × 4 rows, eight low-angle whole-kart frames.
- `ignition-00.webp` through `ignition-07.webp` and `reveal-00.webp` through `reveal-07.webp`: left-to-right row reading order.

Both source sheets are 1182 × 1330. Individual extracts are 591 × 332. The requested larger sheet size was not honored by the generator. Frames have not been upscaled. Extraction uses the regular grid; fractional half-pixel row boundaries were rounded, discarding at most one edge pixel per cell. WebP quality 88, effort 6, opaque.

Visual inspection confirmed matching hero/costume, eight cells per shot, intact arms/hands, correct kart numeral 2, no labels/gutters/watermark, and changing drawn expressions, clothing, posture, aura and vehicle stance. Reveal frame 1 is upright with sputtering engine; frame 8 is leaned forward with speed/spray and a larger kart in the composition. The camera/composition drifts slightly across the generated frames; these are finite drawn keyframes, not a validated fluid in-between animation. Playback, timing, cut continuity and integrated motion quality still require owner review.

Only mechanical cropping, source copying and WebP encoding were performed after generation. No source/UI files were changed, no external image API fallback was used, and no image-generation shots were blocked.
