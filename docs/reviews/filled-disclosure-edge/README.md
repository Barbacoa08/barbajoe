# Filled disclosure edge review

Reviewed October 26, 2026, against main `3db8de9`. This change removes the filled body's inline-end padding so child backgrounds can reach the header's trailing edge. Block/start padding, the accent border, header padding, and bordered disclosures retain their existing styling. The rule mirrors in right-to-left content. The package version is unchanged; this PR does not stage an npm release.

The disclosure gallery includes native shopping-list examples in both themes. Alternating row backgrounds show the edge alignment, and each row provides its own text padding. Gallery reset restores the examples to their initially expanded state. These row styles and controls remain outside the published CSS.

## Independent review

- **GPT-6.1 Sol:** read-only correctness, compatibility, and maintainability review of the six implementation/documentation/test files. Approved, with no actionable findings.
- **GPT-6.1 Terra:** separate visual review of the four captures below. Approved the edge alignment, preserved accent/start inset, theme readability, and narrow wrapping, with no actionable findings.

Neither reviewer changed files or reran the primary test matrix. Application editing/persistence, Our List adoption, release/version changes, and removing the other body insets were outside scope.

## Verification

- Locked dependencies; local Node 24.21.0 and pnpm 12.6.0 (the repository declares Node 24.22.1 and pnpm 12.14.0).
- Lint: 53 files passed. Package and optimized specimen builds passed.
- Release helpers: **13/13 passed**.
- New source/package edge regression: both failed before the CSS correction, measuring an approximately 18.9px end gap at the specimen's fluid root size. Both passed after the change. The permanent test fixes the root at 16px and checks each row against the header at 1280px, 390px, and 320px, in LTR and RTL. It also checks preserved start/header padding and reset behavior.
- Full browser suite: **876/876 passed** in 8.6 minutes across bundled Chromium, Firefox, and WebKit, desktop/narrow, and light/dark. The suite exercises source imports and generated package CSS, native keyboard behavior, focus, nested panels, and gallery controls.
- The build emitted the existing nonfatal macOS term-size helper warning and color-output warnings.

## Visual evidence

The same new specimen markup was captured before and after the library CSS change. Captures use bundled Chromium 156.0.8078.4 on macOS 27.0.1, 100% zoom, reduced motion, and 1280×720 / 390×844 viewports. Each image crops the relevant section and includes both forced themes. They are review documentation, outside the npm package.

| Viewport | Before | After |
| --- | --- | --- |
| Desktop | [Before, 1280px](before-1280.png) | [After, 1280px](after-1280.png) |
| Narrow | [Before, 390px](before-390.png) | [After, 390px](after-390.png) |

Installed **Chrome 156.0.8078.48**: visually inspected the raw source at `http://127.0.0.1:4186/specimen/disclosures.html#edge-content` and the optimized specimen at `http://127.0.0.1:4185/disclosures.html#edge-content`, including actual **200% browser zoom** confirmed through Chrome's UI at a 1679×1029 window. Both themes retained edge alignment and readable wrapping. Restored 100% zoom and inspected the visible summary focus outline.

Installed **Safari 27.0.1**: visually inspected the optimized specimen at 100% zoom in a 1324×940 window. Both themes retained the trailing edge, accent border, and wrapped row text.

Physical iOS/Android devices, actual screen-reader speech, and installed desktop Firefox were not manually checked. Physical-device review remains recommended, not required. Bundled WebKit and narrow desktop viewports do not establish Safari-device acceptance. No animation was introduced; motion was not separately reviewed.
