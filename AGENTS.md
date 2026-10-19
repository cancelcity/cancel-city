# Cancel City source mirror

This is the owner's downloadable playable-source mirror of the Cancel City Site.

- Preserve the game source and every runtime asset when updating this repository.
- Keep `.openai/source-provenance.json` and `.openai/github-assets.json` consistent with the saved Site version being mirrored.
- After updating the Site, synchronize the same source version to this repository and verify the asset workflow before reporting the download as current. A stable GitHub link does not itself synchronize a separate Site repository.
- Never commit credentials, local player databases, dependency folders, build output, or caches.
- Use the current card portraits and matching actor sprites as the character identity references. Preserve the card caricatures, costumes, props and textures. New Battle artwork must not redesign characters.
- The downloaded game includes runtime art. The optional raw production masters listed in `docs/omitted-authoring-assets.json` remain in the original Site repository.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
