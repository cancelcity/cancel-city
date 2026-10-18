# Live comic animation pass

The film's composition and material vocabulary now drive actual gameplay through a shared deterministic Canvas painter. This is live rendering with the current combat participants and committed results, not a generic prerecorded victory clip.

## Coverage

- Every battle call-out, guard and switch has staged live presentation. Call-outs hold old visible health through anticipation and release, then display committed health on contact. Enemy response waits for presentation completion.
- All 42 special attacks use location shots, anticipation, props, targets, impact and punchline panels. Twelve weapon families carry their existing distinct directions; per-character text and seeded variants keep the joke contextual.
- Five residents have six original acting poses each: Rage Gamer, Unpaid Intern, Final Boss Karen, Don Tremendous and Elongated Ego. Other residents retain their existing cutout art while using the new scene direction. This is not a claim of 42 newly drawn pose sets.
- All six city building types use live construction and upgrade scenes, with a free cosmetic ceremony replay, with existing art, worker acting, materials and building-specific comedy. Assigned residents now appear at street level with short ambient episodes, suspended when hidden, outside the viewport or in reduced motion.
- Sound uses original synthesis for paper printing, release, impact, shields and awkward reaction cues. Sound remains opt-in; no recordings or outside samples are used.

## Timing and persistence

Normal attacks: 1180 ms, contact at 700 ms. Guard: 820 ms, contact at 420 ms. Switch: 900 ms, contact at 450 ms. Quick mode scales these consistently. Reduced motion and off resolve ordinary actions immediately.

Specials retain the existing 4800 / 1200 / 650 ms full, quick and reduced clocks, with full impact at 3300 ms. City reveals last 4100 ms; quick and reduced retain 700 and 450 ms. All presentations pause while hidden and skip or complete only once. Paint functions do not mutate saves or make commands. Refresh resumes the committed game state; it does not replay a reward or unfinished dramatic sequence.

The existing cloud schema, account data, economic rules, odds and costs remain unchanged. The v11 visual identity and the v13 premiere remain intact.

## Reproduce frame review

`node scripts/render-live-motion.mjs` compiles the shared painter and renders special, city, battle and reduced-motion frames using `@napi-rs/canvas`. It requires TypeScript, the project package manager and that optional development renderer; no browser is installed. Review files go into ignored `work/live-review/`. Runtime font files are the same licensed DejaVu files used by the premiere; license at `scripts/cinema/fonts/LICENSE.txt`.

Frame inspection and state/timing tests verify the composition and logic. Browser playback, keyboard focus, DOM layout and real-time performance still require supported browser QA; offline canvas review does not establish those checks.
