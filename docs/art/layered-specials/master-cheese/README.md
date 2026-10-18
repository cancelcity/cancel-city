# Master Cheese layered cinematic assets

Built-in image generation produced two transparent eight-pose sheets and one fixed empty cold-storage background. All outputs were visually inspected against the CC019 card and existing intact actors. The character keeps cheddar-yellow Swiss-cheese armor, a green face behind the lime visor, black undersuit and silver box-grater gun in dense scratched-ink/stipple rendering.

Use the row-major pose sequence in `manifest.json`. Each sheet has eight large isolated alpha components, verified at alpha threshold 48. Several gun and arm projections cross nominal cell boundaries. Extract by component membership, not equal grid cuts or simple bounding boxes. `component-report.json` records the large-component boxes for diagnosis. Preserve the real alpha channel: brown RGB under fully clear pixels is not a visible background, and most subject pixels have alpha 253 rather than 255.

The ending is a controlled salute-to-crouch progression. Armor melting is restrained; the silhouette remains an intact recognizable soldier throughout. The loading bay is one reusable opaque plate with no actors or shots baked in. Composite separate muzzle flashes, cheese shavings, heat effects and camera movement in the renderer so the background cannot morph between poses.

Prompts and original generated PNGs are retained here. No app code, publication logic or shared manifest was edited by this asset task.
