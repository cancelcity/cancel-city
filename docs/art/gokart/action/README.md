# Gokart action frames

Generated with the built-in imagegen tool from the approved local master reference. No CLI/API fallback was used. Exact prompts are preserved in `drift-prompt.txt` and `rush-prompt.txt`; original full sheets are preserved as `drift-original.png` and `rush-original.png`.

`manifest.json` records the exact source rectangle, dimensions, file size and reading order for all 20 extracted WebP cells. `split.cjs` mechanically extracts those regular cells and encodes WebP at quality 90. There is no creative pixel manipulation, background replacement, redraw, interpolation or invented intermediate frame.

The drift sheet is 3 columns × 4 rows, 1448 × 1086. Its 12 frames include an unexpected rear-view insert in cell 09. Use cells 01–08 and 10–12 for the main drift run, or direct 09 as a separate camera cut. The kart, clothing, number and hair are coherent enough for a quick sequence, but wheel perspective and exact pose design still shift between drawn keys. Do not stretch one shot into a long hold.

The rush sheet is 2 columns × 4 rows, 1182 × 1330. It contains 8 front-approach keys, changing foreshortening, low lift and facial acting. Late frames have intentional close framing and clip the very top of the hair in the original; preserve the full cell rather than zooming it further. The final bumper is intact, with right tire close to the edge.

Both originals were inspected at sheet size; individual drift 09 and rush 06 were inspected after extraction. All cells are opaque and roughly 16:9, with tiny pixel differences caused by the sheet dimensions. The assets are strong authored keyframes for editing into an anime sequence, not a claim of finished frame-by-frame clean-up.
