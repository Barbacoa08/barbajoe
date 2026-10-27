# CSS library 0.4.3 disclosure animation review

Reviewed October 26, 2026, against main `3db8de92957d1000f38acd68a9072872c459f980`.

## Change

The reviewed specimen animation now belongs to the library's `.disclosure` component. Both styles animate opening and closing with the existing 300ms base motion token, only when all four CSS capabilities are supported and reduced motion is not requested. The complete effect is gated, so other browsers keep instant native disclosure behavior. Unclassed `details` remains native, and 0.4.2's summary-spacing correction is retained. No JavaScript, markup migration, or dependency is added.

A temporary `interactivity: inert` keyframe protects closing controls without permanently hiding closed text from browser search. It has no forwards fill, and reopening or requesting reduced motion cancels it. A zero-duration token also makes a disclosure instant. The gallery defaults to animation and retains an instant comparison switch. The README adds “check modern CSS first” guidance for future interface work.

## Verification

- Source and generated-package motion checks failed before promotion because the library alone did not animate; both passed after the move. The checks remove specimen CSS, sample real intermediate heights, and cover both variants, instant fallbacks, reduced motion, search restoration, closing focus, rapid reopening, and a zero-duration override.
- Lint passed for 54 files. Package and optimized specimen builds passed. Parcel's existing macOS `term-size` helper printed a nonfatal CPU-type warning.
- Release-helper tests passed 13/13. Package dry-run inspection confirmed version 0.4.3 and only `README.md`, `package.json`, and `dist/barbajoe.css`.
- Full browser matrix: **884 passed, 16 intentionally skipped**, in 8.8 minutes across Chromium, Firefox, and WebKit, desktop/narrow, and light/dark. The skips are Chromium-specific `window.find` characterization on Firefox and WebKit; those engines passed their animation-fallback and ordinary disclosure checks. Playwright 1.64.1 uses bundled Chromium 156.0.8078.4, Firefox 157.0, and WebKit 27.2. The local run used an isolated port because the default review port was occupied.
- Local verification used Node 24.21.0 and pnpm 12.4.1 with frozen dependencies. These differ from the repository's pinned Node 24.22.1 and pnpm 12.14.0; PR CI supplies the pinned toolchain. No toolchain or lockfile change is included.

## Independent review

One independent GPT-6.1 Sol review covered correctness, compatibility, maintainability, the complete diff, generated CSS, and surrounding tests. It found no actionable defects. The reviewer identified a nonblocking coverage opportunity: the closing-focus assertion checks the first frame rather than a later point during closing. Native Find reveal was confirmed separately below. The reviewer made no edits and did not repeat the primary suite; its optional browser probe could not launch under local process restrictions, so it adds no separate runtime-pass claim.

## Manual evidence and limits

Installed Chrome 156.0.8078.48 on macOS: in the optimized disclosure gallery, animation was enabled and every panel was collapsed. Native Find for `inward/downward` reported “Result 1 of 4” and automatically opened the matching bordered disclosures. The revealed content was inspected in both forced themes. This separately verifies the actual Find toolbar and automatic expansion; automated `window.find` checks alone do not establish that behavior. The in-app preview was refreshed with the promoted library and animation enabled.

The preceding prototype review also exercised source and optimized specimens, empty and long-selection filled panels, bordered panels, rapid reversal, keyboard collapse, and 1280px/390px layouts. Chromium animated; Firefox and WebKit retained the instant fallback. That evidence is historical prototype coverage, not a substitute for the release matrix above.

Screen-reader speech, physical phones, and actual browser zoom were not checked for this motion change. Bundled WebKit is not installed Safari. Screenshots and local logs remain in ignored review artifacts; CI publishes its browser report with 14-day retention. This PR prepares 0.4.3 for the established staged release; merging and npm maintainer approval remain separate steps.
