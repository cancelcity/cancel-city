# Cancel City premiere

`render-premiere.py` is the source of the film, not a screen recording. Each shot is a deterministic function of frame time. Pillow composites the existing city art and original six-pose Karen sheet with authored paper deformation, typography, curved receipt trails, camera crops, motion trails and impact holds. NumPy synthesizes an original score and synchronized effects; FFmpeg encodes H.264/AAC with fast-start metadata.

Render from the project root with Python 3, Pillow, NumPy and FFmpeg available:

```sh
python scripts/cinema/render-premiere.py
```

Use `--stills` for selected shot frames and a contact sheet without encoding a movie. Use `--width 1280` for a smaller draft; the release is rendered at 1920 × 1080, 30 fps. Generated temporary audio and contact sheets go into ignored `work/cinema/`. Release media, poster and captions go into `public/assets/cinema/`.

The release is 14.8 seconds. Its story is a preview and grants no cards or combat rewards. It plays on explicit request at `/cinema/`, with native playback, seeking, captions, volume and fullscreen controls. The game retains version 11's visual identity and cloud schema.

This establishes one authored animation direction. It does not replace every pack pull, city animation or existing character special. Browser playback and complete Site composition require separate visual QA; rendered frames and media metadata verify the movie itself.

The original generated pose master, prompt and processing metadata are in `docs/art/cinema/`. Fonts and their license are included alongside this script for reproducible rendering.
