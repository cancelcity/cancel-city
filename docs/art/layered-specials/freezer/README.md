# Freezer layered cinematic assets

Two usable eight-pose sheets and one fixed empty frozen-food aisle were generated with the built-in image tool and inspected. The current v3 card defines the white/violet alien, teal apron and rough scratchy etched style. Existing actor-cast assets are named `CC012-roster-v2-*`; they provided anatomy and the white cobalt-rim chest-freezer prop, while the new sprites use the rougher current card style.

Use `action-sheet-clean.png` (2 columns × 4 rows), followed by `ending-sheet-original.png` (4 columns × 2 rows). Each consumed sheet has exactly eight large connected alpha components at threshold48. The first action attempt merged neighboring poses2 and3, so a built-in image edit regenerated the layout with wider separation. The rejected original remains only for provenance. Exact prompts and verification boxes are retained in the JSON files.

Always extract by connected-component membership. Nominal row boundaries are not valid crop lines, and the ending has small detached ink shiver ticks that should be discarded. Keep actor and chest freezer as one intact composite sprite. When the lid is closed the body is naturally concealed inside the opaque chest; no detached limbs need animation. Align the chest-freezer base across poses and animate camera, tremor and ice effects separately over the same fixed background.

Both sheets have real alpha. Most subject pixels are alpha253 rather than255; RGB under fully transparent pixels is harmless colored matting and must not be flattened into the scene.
