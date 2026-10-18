# GOKART corrected CANCEL CITY intro sheets

Both original cinematic sheets were edited with built-in `image_gen`, using each target sheet plus the owner-approved corrected GOKART master and actual `CC010.webp` card as references. Exact prompts and reference paths are in `prompts.json`.

Outputs are `ignition-original.png` and `reveal-original.png`, each 1182 × 1330, exact 2-column × 4-row grid, eight cells. `ignition-00.webp` … `ignition-07.webp` and `reveal-00.webp` … `reveal-07.webp` are sequential left-to-right row extracts, 591 × 332 each, encoded at WebP quality 88/effort 6 with no resizing. The half-pixel row boundaries were rounded, discarding at most one edge pixel per frame. Extraction coordinates and byte sizes are recorded in `manifest.json`.

Visual review: dense drawn black crosshatching/stipple/newsprint; acid yellow and hot magenta; flat black city and palm silhouettes; scratched road, scuffed red number2 kart; orange/navy costume retained; attached hands at steering wheel. Ignition acting evolves from gritted teeth to bulging bloodshot eyes and huge unhinged shout, while fabric/hair/energy progress. Reveal retains the changing kart/hero stances, engine cough, suspension and launch progression, and shifts from clenched teeth to huge yelling mouth. The edit redraws the entire frame rather than applying a color filter. Slight frame-to-frame composition drift remains. Integrated motion/timing must still be reviewed by the owner.

Only mechanical grid extraction and encoding followed generation. No repo/UI code was edited, no publishing was performed, and neither shot was blocked.
