# CC037 live-motion pose sheet

Built-in imagegen was used with genuine transparency. The first sheet received one targeted spacing correction. Original alpha was preserved during crop and WebP encoding.

## Initial prompt

Use case: illustration-story.
Asset type: a production animation sprite sheet for Cancel City, 3 columns by 2 rows, six completely isolated full-body character drawings with genuine transparent background.
Input images: Image 1 is the established Karen pose-sheet style reference. Image 2 is the exact face, hairstyle and costume identity reference for Don Tremendous CC037. Use their thick ink editorial punk comic style, not the scenery or panels.
Primary request: Make six consistent expressive full-body poses of the same fictional political satire character from Image 2: squat bulky orange-faced showman, dramatically swooped pale blond hair, navy suit, white shirt, comically enormous long red tie, black dress shoes. Draw head, hands, costume, tie and hair consistently in all six poses. Strong outlines, rough printed ink hatching and halftone texture. Orange, hot pink and acid-yellow accent details, matching established colorful punk comic art.
Layout: canvas landscape with exactly six equally sized square cells in a regular 3 columns x 2 rows grid. Place one full-body drawing at center of each cell, broad truly transparent gutters. Character feet sit near bottom of each cell at a common baseline. Every hair strand, shoe, tie, hand and prop entirely within its own cell with roomy margins. No visible cell borders, no scenery, no captions, no text, no labels, no logo, no watermark, no background glow or ground shadow.
Poses in row-major order: 
0 top-left: smug standing, enormous tie, one tiny hand adjusting the tie and a self-important grin.
1 top-middle: dramatic wind-up pulling an oversized golden rubber office stamp backwards, anticipation, bent knees, ridiculous grin.
2 top-right: lunging to the right, stamping and pointing right in exaggerated full-body action, stamp fully visible and held in hand.
3 bottom-left: triumphant thumbs-up, puffed chest, wide silly smile.
4 bottom-middle: shocked recoil, eyes huge, mouth round, hands up, blond hair blown vertically upward, tie flying.
5 bottom-right: pretending embarrassment was a victory: theatrical shrug, sheepish smug face, palms upward, tie slightly crooked.
Constraints: genuine alpha transparency outside the characters and props. These must be six discrete animation cutouts, not a comic page. No crop, no overlap, no extra people, no extra limbs, no podium or buildings. Keep pose artwork polished and visually legible at 512 pixels each.

## Spacing correction

Edit the supplied CC037 six-pose sprite sheet. Keep the exact same character design, face, costume, hair, red tie, gold stamp, six poses in the same row-major order and rough printed punk comic rendering. Change only spacing and unwanted backdrop.
Output a genuine transparent RGBA 1536x1024 landscape sprite sheet, equal 3columns x2rows grid with cells512x512. Scale every pose smaller to fit fully inside its own square cell. REQUIRE very broad transparent gutters: all content including hair, fingers, shoes, tie, stamp must be contained within x=40..472, y=48..456 relative to each 512square cell. The surprised bottom-middle hair must fit fully below the horizontal row boundary; absolutely no hair reaches into the cell above. The pointing upper-right fingertip must have at least40pixels of right margin. Put both feet near y456 in each cell. No content within40pixels of any grid boundary. No glow, no colored backdrop, no ground shadows, no text, no grid lines. Exactly six isolated transparent animation cutouts, not a comic page. Preserve all illustrated character details and expressive poses, simply with generous safe spacing.

