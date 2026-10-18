# Gokart action — card-style redraw

Both original animation sheets were redrawn using built-in imagegen with three local inputs per call: the sheet being edited, the owner-reviewed Gokart master, and the actual CANCEL CITY `CC010.webp` card portrait. The target is the same dirty satirical print illustration as the game cards: dense black pen hatching, rough stipple, flat acid yellow and hot pink, black palms and angular city, grotesque angry facial acting and a battered red number-2 kart. This is new drawing rather than a filter applied to the polished anime frames.

The original output PNGs and exact prompts are preserved here. `split.cjs` only extracts regular grid rectangles and encodes WebP at quality 90. It does no creative image editing, interpolation or repainting. `manifest.json` contains grid dimensions, cell rectangles, native frame dimensions, file sizes, references and editorial notes.

- Drift: exact 3 columns × 4 rows, 12 frames. Original pose/camera order is retained, including known rear-view insert 09; owner omits 09 from the continuous sequence.
- Rush: exact 2 columns × 4 rows, 8 frames. Front-on approach, low hop and increasing foreshortening remain; expressions change from furious gritted teeth to grotesque screaming mouth.

Sheets were compared visually with the actual card and corrected master. The new drawing has flat dirty ink shapes rather than photographic reflections, smooth cel shadows or glossy lighting. Number-2 kart and orange/navy costume remain recognizable throughout. Frames are opaque, approximately 16:9; tiny per-cell pixel differences come from the source sheet dimensions. Close framing in later original cells remains, so additional zoom can clip hair or tires. Frame-to-frame key drawing variation still exists and should be directed with editing rather than described as fully cleaned frame-by-frame animation.
