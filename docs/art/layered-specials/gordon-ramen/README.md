# Gordon Ramen layered cinematic assets

Sixteen usable full-body cutouts and one fixed kitchen background were generated with the built-in image tool and inspected against the current CC014 card and existing actor poses. They preserve the furious creased face, wild blond hair, food-stained white chef jacket, black trousers/boots and vivid magenta instant-noodle cup. The card's silver fork remains consistent for tasting and gestures.

Use `action-sheet-original.png` and `ending-sheet-clean.png`, both 2 columns × 4 rows in row-major order. Each sheet has exactly eight large connected alpha components at threshold48. Do not use `ending-sheet-original.png`: its top hair and last boot touched the canvas edges. A built-in framing edit regenerated the ending with complete hair, complete boots and clear outer margins. Prompts and component reports retain the history.

Extract component masks instead of equal cell rectangles because some figures cross the nominal row lines. These are whole actors with held cups/forks, not detached body parts. The action has a short tasting noodle near the mouth, but no long noodle whip, projectile food or steam. Animate the noodle whip, knot, particles and camera independently over the same fixed kitchen plate.

Preserve the real alpha; invisible background RGB is colored matting under alpha0 and most subject pixels have alpha253. The kitchen has empty metal pots and blank wall poster only, with a clear foreground stage and no people or food baked in.
