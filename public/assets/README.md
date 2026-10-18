# Original Cancel City art

All vector illustrations in this directory are original code-authored artwork, with no external illustrations, branded assets, or third-party character designs. The shape language uses chunky cutout silhouettes, thick ink, excessive expressions, halftone and deliberately limited colours. Text required to understand gameplay is rendered by the game UI, not embedded into artwork.

- `cards/CC001.svg` through `cards/CC030.svg`: 480 × 480 resident portraits. The first five belong to Terminally Online; faction ranges follow the specification.
- `city/skyline.svg`: 1800 × 900 city backdrop with dark left-side space for page headings.
- `packs/city-intake.svg`: 480 × 480 original booster wrapper, with transparent surround.
- `manifest.json`: paths, dimensions, attribution, originality/licence information, accessibility descriptions and artwork status.
- `generate_assets.py`: reproducible original illustration sources. Run with Python 3 to recreate the SVGs and manifest. Uses only the standard library and validates every generated file as XML.
- `qa/contact-sheet.png` and `qa/skyline.png`: rendering review images. These are development reference material rather than interface assets.

Every resident has its own authored composition and props. Examples include the Dictator's headset and ban hammer, the Algorithm's phone body, the Intern's paperwork and book stack, the Necromancer's skeleton face and mandatory wellness clipboard, the Museum Collector's artifacts, the Evasion Wizard's portal, the Chad's market chart and chain, the Karen's enormous haircut and customer-support phone, and the Seed Phrase's locked vault.

Validation: all 32 SVG files parse successfully; all 32 render using Sharp. A visual contact-sheet review confirmed portrait distinction, framing, no clipped essential features and palette consistency. City review confirmed text-safe negative space at left.
