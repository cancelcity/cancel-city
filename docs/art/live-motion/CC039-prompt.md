# CC039 — Elongated Ego motion atlas

Built-in image generation; genuine alpha preserved. References: `public/assets/residents/CC039.webp` (identity) and `docs/art/cinema/karen-poses.png` (style).

## Initial prompt

+Use case: illustration-story.
Asset type: production transparent game character pose atlas, landscape 1536 by 1024 pixels, THREE columns and TWO rows of square 512 by 512 cells. This is ONE sheet containing exactly six poses of the SAME fictional satirical game character, Elongated Ego. No grid lines, no text, no scenic backdrops.
Reference image 1 is the character identity: retain this absurd exaggerated grinning middle-aged tech mogul caricature, broad round cheeks, swept dark-brown hair, expressive eyebrows, black suit jacket over black crew-neck shirt, black trousers and shoes; tiny red-and-silver toy rocket and plain black smartphone. Reference image 2 is STYLE ONLY: match its thick expressive black ink, scratchy hand-drawn punk comic hatching, screen-print texture and expressive illustrated acting. Use lime acid and magenta edge accents. Do not copy Karen's identity.
CRITICAL TRANSPARENCY: genuinely transparent alpha background, including all gutters, with NO shadows or backdrop washes. Every body and every handheld object fits inside its OWN cell, completely isolated from other cells. Broad transparent gutters. Each full body occupies approximately 390 by 410px maximum within its 512px square. No hands, hair, feet or rockets cross cell boundaries. Same character proportions and costume in all six cells, big face and expressive hands, readable animated acting. Whole head and shoes fully visible.
Reading order:
0 top left: standing smug, smiling with one raised brow, shows off a tiny toy rocket upright in one hand, other hand on hip.
1 top middle: squatting low with knees bent, tense launch preparation, both hands fiddling with the tiny toy rocket held close to his body, bitten lower lip.
2 top right: excited dramatic forward launch pose, arm reaching RIGHT with the tiny toy rocket pointing right, other hand gesturing grandly. Rocket remains fully inside cell; no flight plume.
3 bottom left: smug victory, standing with puffed chest and a broad grin while inspecting his smartphone, toy rocket tucked beneath other arm.
4 bottom middle: shocked recoil backwards at harmless little launch failure, wide-eyed mouth open, hands startled, toy rocket bent slightly, tiny comic smoke puff close to hand and fully inside cell.
5 bottom right: embarrassed 'everything fine' shrug, soot marks on cheeks, awkward grimace, both palms turned up, toy rocket dangling from one hand.
Constraints: consistent identity/costume/scale across cells. No lettering, no words, no logos, no scenic set, no large explosion, no border, no watermark. Keep feet on a consistent local baseline near y=460 inside each cell except crouching pose. All six figures and toy objects must be complete and distinctly separated.

## Final spacing correction prompt

+Edit the supplied 1536x1024 transparent six-pose atlas. Preserve EXACTLY the six depicted poses, character identity, line art, clothing, props, expressions, colors and transparent alpha. Change ONLY the size and placement of each isolated pose so it fits safely in its own square cell with broad transparent gutters. THREE columns, TWO rows, each cell exactly 512x512. Top row cells x0-511,512-1023,1024-1535 and y0-511. Bottom row same columns and y512-1023. Scale each COMPLETE figure and attached objects DOWN to approximately 76% of its current size. Place every figure completely within local x=55..457 and local y=55..457 of its own cell. Keep head, shoes, hands and rocket completely intact. Especially fix the bottom row hair that currently crosses above y512. There must be at least 48px COMPLETELY TRANSPARENT empty gutter INSIDE EVERY CELL on all four edges, including a total 96px transparent gap between rows. No pose reaches or crosses a cell edge. No new art, no scene, no backdrop wash, no text, no borders. Output transparent PNG 1536x1024. Exactly same six characters/poses, smaller and safely separated.
