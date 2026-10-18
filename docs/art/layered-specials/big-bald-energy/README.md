# Big Bald Energy — One Punch, One Coupon

Three eight-pose transparent sheets and one fixed supermarket forecourt were generated with the built-in image tool and inspected against the actual CC064 card and actor-cast references. They preserve the stippled bald egg head, droopy bored eyes, mustard-yellow zipped suit, black belt/gold buckle, red gauntlets/boots and dirty white cape with black clasps. The blank tan coupon remains in the left hand; the connected grocery bag hangs from the left elbow through every phase.

The sheets are `action-sheet-original.png`, `attack-sheet-original.png` and `ending-sheet-original.png`, all 2 columns × 4 rows and row-major. Each has exactly eight large connected alpha components at threshold48. All24 complete silhouettes are usable and none touches the canvas edge. No pose omission or margin retry was needed. Preserve true alpha: most subject pixels have alpha253 and invisible colored RGB under alpha0 must not be flattened.

Extract connected-component masks instead of equal cells because silhouettes can cross nominal row boundaries. The attack sheet depicts one punch from anticipation to recovery. Pose5/index4 has the oversized connected foreshortened red fist; adjacent extension poses have a more sideward angle. Use that pose briefly for contact or a camera cut rather than slowly blending between perspectives. The fist, wrist, arm, body and boots remain a single connected whole actor.

The fixed empty forecourt has blank sale-sign rectangles and unobstructed grey asphalt. Coupon letters, expiration reveal, shockwave and debris should be separate renderer layers. No impact, smoke, debris, lettering or background is baked into the actors. Exact prompts and detailed alpha/component boxes are retained here.
