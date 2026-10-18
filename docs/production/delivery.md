# Cinematic delivery

The first fifteen-film archive exceeded Sites' 256 MiB input limit and was not published. The live version remained v32 while delivery was repaired.

The web movies use H.264, 1280×720, 60 fps, yuv420p, fast-start MP4, slow animation-tuned encoding at CRF27. Existing AAC packets are copied during optimization. Full decode, stream fingerprints, frame count and duration are checked before replacing a delivery file. Original illustration assets and all compositing code remain in source; the previous high-bitrate encodes remain in Git history.

The Infinite Rizz comparison against its previous CRF19 encode measured SSIM 0.967370 overall. An actual decoded delivery frame was inspected at full resolution. This is a representative compression check, not a claim of browser or audible playback testing.

Superseded Gokart v1/v2 files stay in source but are excluded from the release assets. The active Gokart v3 and its references remain checked. Builds enforce a 245 MiB static payload budget before packaging, leaving room below the hosting input limit. Every released movie, poster, caption and chapter still is checked again in the final deployment archive.
