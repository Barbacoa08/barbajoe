# CSS library 0.4.2 disclosure spacing review

Reviewed October 26, 2026, against main `09fabed240de3aadd6c106fec8b3809af824d9d0`.

## Correction

A short title occupied less than the summary's minimum target height. Top alignment put the unused height below the title; the source and packaged regression fixtures measured a 6.40625px imbalance at a 16px root font size. One shared two-column grid now centers the label/chevron row within spare height, while keeping the chevron beside the first title line for descriptions and wrapped titles. The minimum target, padding tokens, native behavior, and public markup/API remain unchanged. Obsolete flex declarations were removed.

The existing catalog already demonstrates title-only headings and spans, descriptions, long titles, both styles, and both themes. No new public hook or application migration is required.

## Independent review

- **GPT-6.1 Sol:** correctness, regression coverage, and surrounding behavior. No actionable findings.
- **GPT-6 Astra:** maintainability, extensibility, and integration with existing composition rules. No actionable findings.
- Both reviewed the working diff independently without editing it or rerunning the primary browser matrix. Application-specific overrides and Our List adoption are outside this change.

## Verification

- Exact toolchain: Node 24.22.1 and pnpm 12.14.0, with frozen dependencies.
- Existing focused baseline: 2/2 passed. New source/package regression: both failed on the original CSS with the measured spacing imbalance, then passed after the fix.
- Focused disclosure tests: 36/36 passed across Chromium, Firefox, and WebKit. Geometry coverage includes heading/span/wrapped-label markup, descriptions, wrapped titles, open/closed states, both variants, and 16px/32px root text. Existing tests cover chevron direction, first-line alignment with descriptions, clear placement, padded activation, keyboard focus, and source/package parity.
- Lint and package build passed; release-helper tests passed 13/13. Package dry-run inspection confirmed version 0.4.2 and only `README.md`, `package.json`, and `dist/barbajoe.css`.
- Full post-review browser matrix: **852/852 passed** in 9.0 minutes across Chromium, Firefox, and WebKit, desktop/narrow, and light/dark. Playwright 1.64.1 uses bundled Chromium 156.0.8078.4, Firefox 157.0, and WebKit 27.2.

## Visual and manual checks

On macOS 27.0.1, compared the unchanged staging catalog with the local source catalog at `http://127.0.0.1:1248/index.html#bordered-disclosures-heading`. Matched Chromium captures use 1280×720 and 390×844 viewports, system dark preference, both forced-theme panels, 100% zoom, and reduced motion. Short titles are vertically balanced; descriptions and wrapped titles retain first-line chevrons. The in-app browser was also inspected; its engine version was not separately identified. Screenshots stay in ignored local review artifacts, not Git or npm. Automated screenshots are available in the PR's browser-review report artifact (14-day retention).

**Installed Chrome 155.0.8059.85:** confirmed actual **200% browser zoom** through Chrome's own UI, at a 1679×1029 window. Inspected both themes and wrapped titles, opened and closed Preferences using the keyboard, and confirmed focus remained on its summary. Restored 100% zoom and closed the temporary tab.

**Installed Safari 27.0.1:** inspected the optimized specimen at `http://127.0.0.1:4173/index.html#bordered-disclosures-heading`, 100% zoom, 1324×940 window. Reviewed short titles, descriptions, and wrapped labels in both themes, exercised summary toggling with Space, and confirmed visible summary focus. Closed the temporary tab.

Actual screen-reader speech and physical-phone checks were not repeated, following Joe's earlier waiver. Installed Firefox was not manually exercised; the bundled browser is covered by automation. Enlarged root text is not counted as browser zoom, and WebKit automation is not counted as installed Safari. No motion was added; reduced-motion behavior was not separately reviewed.
