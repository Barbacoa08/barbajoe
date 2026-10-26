# CSS library 0.4.1 disclosure review

Reviewed October 25, 2026, against main `964307931323c61305138df8522905ac5631e1e7`. The PR records the final commit and CI/deploy results. This patch adds the optional filled disclosure and preserves existing markup, chip targets, and the other library APIs. Existing bordered disclosures intentionally receive inward/downward chevrons aligned with the first title line.

## Implementation and maintainability

- One shared native disclosure rule owns chevron geometry, direction, title alignment, hover, and focus. Variant rules own only surface, padding, and border differences. The downward chevron's visible-stroke correction is derived from its size, with the formula documented beside the rule.
- One example-only filter renderer/controller serves the catalog and state gallery. The gallery covers empty, short, and many selections, each open/closed in both themes, plus bordered examples, reset, and a 320px panel toggle. Synthetic state and specimen layout are excluded from npm.
- Clear is visually inset before the chevron but remains a separate native sibling button outside summary. A reserved slot protects text and chevron hit areas. It clears both groups, focuses summary before hiding, and preserves expansion. The documentation explains the native keyboard order: after body controls when expanded, directly after summary when collapsed.
- The generated CSS initially failed an explicit-direction check: Lightning CSS lowered `:dir()` to a language approximation. The build now uses the same compiler version and target query through its API, excluding only that selector transformation. Native `:dir()` also preserves correct logical-property selectors. Tests cover explicit, opposite nested, and `dir="auto"` boundaries. The system-preference theme contract remains unchanged.
- Fresh independent **GPT-6 Astra** review covered the whole change for correctness and maintainability. The direction issue and two stale documentation statements were corrected; the reviewer verified closure with no remaining actionable findings. The reviewer did not independently rerun the full browser matrix.

## Automated verification

- Exact toolchain: Node 24.22.1, pnpm 12.14.0; locked dependencies.
- Warning-fatal lint, generated CSS build, and optimized eight-page specimen build.
- Targeted source/package checks: **8/8 passed**, including a failing-before/fixed-after direction regression.
- Full browser matrix: **828/828 passed** in 6.6 minutes. Playwright 1.64.1 uses bundled Chromium 156.0.8078.4, Firefox 157.0, and WebKit 27.2, with desktop/narrow and light/dark projects. Bundled WebKit is not installed Safari.
- Release helpers: **13/13 passed**. Package dry run checked version **0.4.1** and exactly `README.md`, `package.json`, and `dist/barbajoe.css`.
- New checks cover native toggling, padded clear activation, distinct clear/chevron hit areas, empty-state hiding, focus restoration, independent groups, long summaries, visible chevron-ink centering, nested variant isolation, source/package parity, and gallery reset/reflow. Existing chip and hidden-state checks remain in the full suite.

## Visual evidence

Matched fixtures use identical markup and widths, with main's source CSS for “before” and 0.4.1 source CSS for “after.” Captured in the local in-app review browser at 100% zoom; the embedded browser version was not separately identified. This is visual evidence, not a supported-browser certification. The filled variant did not exist on main, so the matched comparison isolates the existing bordered pattern.

The matched desktop (1280 × 720) and narrow (390 × 844) captures, gallery capture, and manual-browser screenshots are retained as local review artifacts, outside Git and the npm package.

For interactive review, use the [deployed disclosure state gallery](https://deploy-preview-282--library-specimen.netlify.app/disclosures.html#many-closed). Automated screenshots and the browser report are available in the `browser-review-report` artifact on the [verified implementation run](https://github.com/Barbacoa08/barbajoe/actions/runs/40260858824). That artifact is retained for 14 days; it does not contain the local manual-browser captures. The written findings below remain the durable review record.

## Actual desktop browser checks

**Chrome 155.0.8059.85, macOS 27.0.1:** source gallery at `http://127.0.0.1:1245/disclosures.html#selected-open`, system dark preference with both forced-theme panels. Native Chrome zoom was increased to **200%**, confirmed by Chrome's “Zoom: 200%” UI. At the 1679 × 1029 captured window size, headers, targets, and chip wrapping remained usable. Clear hid after activation, retained expansion, and returned focus to summary; Tab reached the chips, and Space selected aldis with a visible focus outline. Chrome zoom was reset to 100%, and the temporary tab was closed. This is actual browser zoom, not an enlarged root font.

**Installed Safari 27.0.1, macOS 27.0.1:** optimized Parcel specimen at `http://127.0.0.1:4173/disclosures.html#selected-closed`, 100% zoom, system dark preference with both forced-theme panels. Clearing a collapsed selection kept it collapsed and focused summary. Space expanded it, Option+Tab reached All stores and then aldis, and Space selected aldis and restored the clear action. The keyboard focus outline and aligned header controls were visually inspected. This used the installed application, not Playwright WebKit. The temporary tab was closed afterward.

## Verification limits

Actual screen-reader speech and physical-phone testing were not repeated, following Joe's earlier decision to skip those checks after his own testing. No speech or device pass is claimed. Native accessibility-state inspection and desktop narrow viewports do not substitute. Installed desktop Firefox was not manually exercised; bundled Firefox is covered by automation. Motion behavior was not separately reviewed because this change introduces no animation.

For any additional final review: open the preview's Disclosure states page, clear a collapsed selection, reopen with Enter/Space, toggle chips, reset, and inspect the many-selection states in both themes and at narrow widths. Confirm the X and chevron stay beside the title and the downward chevron aligns with the X. Applications still need their own result-announcement and persistence checks.
