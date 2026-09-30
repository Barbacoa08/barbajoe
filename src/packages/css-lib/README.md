# Barbajoe CSS library

One global stylesheet for personal applications. It gives ordinary semantic HTML a consistent foundation for typography, forms, links, dialogs, page layout, and a small set of reusable visual treatments.

## Installation and import

Install the package, then import its stylesheet once from an application entry point. The package-root import is preferred:

```js
import "@barbajoe/css-lib";
```

The explicit stylesheet subpath remains supported:

```js
import "@barbajoe/css-lib/dist/barbajoe.css";
```

Both paths resolve to the same global stylesheet. The repository tracks the source in `lib/`; npm receives only the generated `dist/barbajoe.css` bundle, the package metadata, and this README.

## What the library owns

Start with semantic HTML and the single stylesheet. The library supplies global defaults for ordinary elements such as links, form controls, buttons, and dialogs. Use its documented classes for roles that HTML alone cannot identify, such as an application shell or a structured dialog, and for optional visual treatments.

Application CSS owns content- and project-specific choices. Override or extend the defaults with the public `--barba-` tokens and your own selectors. In particular, each application decides how wide data tables adapt to limited space, how images are sized or cropped, and when its content wraps or shortens. The library ships no image styling or general-purpose responsive table transformation.

The [hosted specimen](https://lib-staging.barbajoe.tech/) shows the maintained defaults in context. The specimen is not part of the npm package.

## Application shell

Add `app-shell` to the element that owns the page regions. A direct `main` is required. Direct `header` and `footer` regions are independently optional, so the supported structures are:

```html
<!-- Full shell -->
<div class="app-shell">
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</div>

<!-- Header and main -->
<div class="app-shell">
  <header>...</header>
  <main>...</main>
</div>

<!-- Main and footer -->
<div class="app-shell">
  <main>...</main>
  <footer>...</footer>
</div>

<!-- Main only -->
<div class="app-shell">
  <main>...</main>
</div>
```

See the [full shell](https://lib-staging.barbajoe.tech/), [header-and-main shell](https://lib-staging.barbajoe.tech/layout-header.html), [main-and-footer shell](https://lib-staging.barbajoe.tech/layout-footer.html), and [main-only shell](https://lib-staging.barbajoe.tech/layout-minimal.html) specimens.

A `site-header` supports a brand or title with navigation, a brand or title alone, or navigation alone. All three compositions appear in the [header specimen](https://lib-staging.barbajoe.tech/headers.html#combined-header).

Classes remain appropriate for roles that semantic HTML cannot express by itself, including `site-header`, `text-gradient`, `scaleup-on-hover`, and `dialog-content-container`.

## Data tables

Use a semantic `<table>` for tabular data, with a `<caption>` and `<th scope="col">` or `<th scope="row">` where appropriate. The library gives these elements collapsed borders, start-aligned captions and headings, modest cell spacing, and row dividers from the existing palette. No table class is required. See [MDN's table guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/table) and the [compact and wide specimens](https://lib-staging.barbajoe.tech/#tables-heading).

The library does not set table width, scrolling, stripes, sticky headings, sorting, or narrow-screen column behavior. Each application chooses how its data fits available space. The wide specimen's scroll container demonstrates one application choice; it is not part of the shipped CSS.

## Buttons, forms, and dialogs

Native `button` and button-type `input` elements are styled automatically: `submit` is primary, `button` is secondary, and `reset` is tertiary. A button without a type receives primary styling to match its usual form-submit behavior; write `type="button"` for a non-submit action. Override emphasis independently of behavior with `data-barba-variant="primary"`, `"secondary"`, or `"tertiary"`. These attributes affect appearance only.

The Updated Soft treatment reuses the existing palette. Primary hover uses link-hover in light mode and inverse-surface (light gray) in dark mode. Secondary hover uses surface; tertiary hover uses control background. Text colors do not change on hover. Disabled controls retain their emphasis with reduced opacity and no hover treatment. The global keyboard focus ring applies to controls inside and outside forms.

Text inputs (including omitted `type`), textarea, and select receive the same appearance regardless of form ancestry or the `form` attribute. Full-width sizing and additional top spacing remain specific to controls inside forms. Forms retain their stacked layout. Page-footer margin/alignment apply only to `.app-shell > footer`, not article or dialog footers.

For a three-region dialog, use this direct-child structure:

```html
<dialog id="edit-dialog" aria-labelledby="edit-title" closedby="any">
  <form method="dialog" class="dialog-content-container">
    <header class="dialog-header"><h2 id="edit-title">Edit</h2></header>
    <div class="dialog-body">
      <label>Title <input name="title" value="Initial title" required /></label>
    </div>
    <footer class="dialog-footer">
      <button type="reset">Reset</button>
      <button type="button" command="request-close" commandfor="edit-dialog">Cancel</button>
      <button type="submit" value="submit">Submit</button>
    </footer>
  </form>
</dialog>
<button type="button" command="show-modal" commandfor="edit-dialog">Open</button>
```

Dialogs grow with content from a 16rem minimum to an 80dvb maximum; available viewport space caps the minimum and maximum to preserve 1rem outer gutters. The structured body normally owns scrolling, leaving header/footer visible and the footer at the bottom for short content. Its scrolling region retains at least 6rem of height. On exceptionally short screens, the outer dialog can scroll too, keeping the readable body and oversized header/footer actions reachable. Unstructured dialogs retain padding and native scrolling; their content does not receive the three-region layout. Existing structured consumers should wrap their body in `.dialog-body`.

Dialogs share a top offset of 10% of the visible viewport, with a minimum 1rem gap. Their opening animation is anchored at the top, so different content heights do not change that position. Place footer actions in HTML order **Reset (if present), Cancel, Submit**: Submit is rightmost and Cancel immediately precedes it in left-to-right layouts. Use markup order rather than CSS reversal so keyboard and reading order match the visual order; actions may wrap on narrow screens.

`method="dialog"` submits and closes after native validation without a network request. Cancel is a non-submit button; `command="request-close"` follows the same cancellable dismissal path as native outside-click dismissal or Escape. Reset restores initial values without closing. Closing does not reset fields. Unless there is a strong reason otherwise, use `closedby="any"` to treat clicks outside the dialog as cancellation: no submission, validation, or reset. Applications with cancellation cleanup should share that behavior through the dialog's `cancel` event, not solely a Cancel-button click handler. Preventing that event can keep the dialog open when dismissal needs confirmation.

Invoker commands and native light dismissal require browser support; CSS cannot supply those behaviors. Consumers targeting older browsers must provide appropriate open/close/dismissal behavior. The specimen includes feature-detected fallbacks (outside clicks invoke its Cancel button), not library JavaScript. See the [short and long dialog examples](https://lib-staging.barbajoe.tech/#dialog-heading) and [native light-dismiss documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog#closedby).

An `aria-disabled="true"` link receives disabled appearance and ignores pointer interaction, but ARIA does not prevent keyboard activation. Consumers must remove its navigation target or prevent activation; the specimen prevents its click event for both pointer and keyboard activation.

## Tokens and accessibility contract

All public tokens use the `--barba-` prefix. The semantic color roles are:

- `--barba-color-text`
- `--barba-color-text-muted`
- `--barba-color-bg`
- `--barba-color-surface`
- `--barba-color-surface-inverse`
- `--barba-color-control-bg`
- `--barba-color-border`
- `--barba-color-link`
- `--barba-color-link-hover`
- `--barba-color-accent`
- `--barba-color-focus-ring`
- `--barba-color-danger`

The old unprefixed aliases were intentionally removed before version 1.0.

The following default pairings are guaranteed. Text roles meet at least 7:1 against both supported backgrounds. Border meets at least 3:1; focus ring uses the link-hover color and therefore also exceeds 3:1.

| Scheme | Role | On page background | On surface |
| --- | --- | ---: | ---: |
| Light | Text | 17.52:1 | 19.77:1 |
| Light | Muted text | 8.33:1 | 9.40:1 |
| Light | Link | 8.33:1 | 9.40:1 |
| Light | Link hover / focus | 13.61:1 | 15.36:1 |
| Light | Danger | 7.22:1 | 8.15:1 |
| Light | Border | 3.14:1 | 3.54:1 |
| Dark | Text | 13.06:1 | 13.67:1 |
| Dark | Muted text | 8.75:1 | 9.16:1 |
| Dark | Link | 7.62:1 | 7.98:1 |
| Dark | Link hover / focus | 7.89:1 | 8.26:1 |
| Dark | Danger | 7.16:1 | 7.49:1 |
| Dark | Border | 3.01:1 | 3.15:1 |

These guarantees apply only to the listed default pairings. Accent, inverse-surface, arbitrary token combinations, and consumer overrides do not carry a general contrast guarantee. The forced light and dark matrices in the [component catalog](https://lib-staging.barbajoe.tech/#color-heading) display the contract.

## Browser support

The library targets the current stable releases of Chrome, Edge, Firefox, and Safari on desktop, plus Safari on iOS and Chrome on Android, at the time a package version is released. Older browser versions, beta releases, and embedded or in-app webviews are outside this support target. A release-time target does not imply that every browser/device combination was manually checked.

The Lightning CSS `>= 0.25%` build target controls CSS compilation; it is not a browser-support threshold or a polyfill for browser-native behavior. When a targeted browser lacks a CSS feature, provide a usable fallback or document the limitation before release. Dialog invoker commands and light dismissal are HTML features; applications using them own any needed behavioral fallback. The specimen's JavaScript fallback is not part of the CSS package.

## Local development

From this package directory, install the repository dependencies and start the specimen:

```bash
pnpm dev
```

Parcel opens the component catalog automatically and applies HTML, CSS, and dialog-fixture changes with hot module replacement. Use the navigation to review the component catalog, header compositions, and all four application shell structures in the same session.

Build the production package with Lightning CSS:

```bash
pnpm build
```

Build the specimen independently of the development server:

```bash
pnpm build:specimen
```

Run warning-fatal checks for the maintained CSS and specimen files:

```bash
pnpm lint
```

`dist/`, `.output/`, and `.parcel-cache/` are generated locally and are not tracked by Git.

### Manual browser review

For CSS-changing pull requests, review the affected examples in the source specimen and the built specimen or deploy preview. Serve `.output/specimen` as the web root because its generated asset URLs are root-relative. Use current desktop Chrome or Edge (one Chromium representative), Firefox, and Safari where available; check the other Chromium browser when a browser-specific issue warrants it. Record the date, commit or package version, specimen URL/build type, browser and version, OS/device, viewport and zoom, relevant color/motion settings, results, and anything not checked. Build and release-helper test results are separate from browser evidence.

For the affected examples, check a narrow viewport (including 320px where layout matters), keyboard focus and navigation, 200% browser zoom, light and dark schemes, and actual reduced-motion behavior. A desktop window resized to phone width checks layout but not a mobile browser. **Recommended, not required:** occasionally review on an actual device in current iOS Safari and Android Chrome. Include this reminder in PR review, but do not block a PR or release solely because these device checks were skipped; record them as *not checked*, never *passed*.

For visual CSS changes, keep a small before/after screenshot set of the affected specimen at the same desktop (1280×720) and narrow (390×844) viewport sizes; include an open-dialog state when dialog layout changes. Attach review screenshots to the PR rather than the CSS package. No automated visual-regression service is required.

When buttons, forms, or dialogs change, use these focused checks:

- Compare primary, secondary, and tertiary buttons in both forced schemes, including hover, keyboard focus, disabled, and optional emphasis overrides. Primary dark hover is light gray; all hover text stays unchanged.
- Compare text fields inside, outside, and associated with a form. Edit the associated field and confirm the form's Reset restores it.
- Open the short dialog: the footer sits at the bottom without forcing maximum height. Open the long dialog: the body scrolls while header/footer stay visible. Switching between them keeps the same top offset; footer actions read Reset, Cancel, Submit.
- Edit dialog fields and Reset; clear the required title and Submit; Cancel or click outside while invalid; Submit while valid. Reset stays open, invalid Submit stays open, Cancel/outside dismissal and valid Submit close, and focus returns to the opener. Reopening retains values until Reset. Clicking inside or dragging from inside to outside must not dismiss the dialog.
- Tab and Shift+Tab through a dialog, reach the final long-body field, and dismiss with Escape. Check 320px-wide and exceptionally short viewports; all actions must remain reachable without page horizontal overflow.
- If table styling changes, inspect the compact and wide tables in both schemes. The wide specimen should scroll horizontally with keyboard focus without making the page overflow.
- A successful build or one browser's measurements are not a cross-browser accessibility guarantee. Record any browser or device you did not check.

## Hosted specimen

The specimen is hosted at https://lib-staging.barbajoe.tech/ on the existing library-staging Netlify site. Production deploys from `main`, and pull requests receive Netlify Deploy Previews for review before merging. Netlify publishes the static output of `pnpm build:specimen`.

For live editing, run `pnpm css-lib dev` from the repository root. Parcel's watch mode and hot module replacement remain the local development workflow.

## Releasing the CSS package

The package is currently at version `0.3.2`. Change the version only when there is an approved reason to release the CSS library. The staged-release workflow is specific to this package and accepts stable `MAJOR.MINOR.PATCH` versions only.

The npm trusted publisher for `@barbajoe/css-lib` identifies GitHub user `Barbacoa08`, repository `barbajoe`, and workflow `stage-css-release.yml`. It must allow **stage publishing only**, not direct publishing. Keep the npm maintainer account's 2FA enabled and the package's Publishing access set to **Require two-factor authentication and disallow tokens**. The workflow uses OIDC; it needs neither a bypass-2FA npm access token nor an `NPM_AUTH_TOKEN` GitHub secret. Enable GitHub email notifications for issue assignments if you want the staged-release reminder in your inbox.

To release, raise this package's version in a pull request and merge it into `main`. The workflow compares that version with the preceding `main` version and npm's published `latest`; equal, lower, and prerelease versions do not stage. It then installs locked dependencies, tests, builds, checks that the package contains only its expected CSS file and metadata, and stages it on npm. A separate job assigns Joe a GitHub issue only after staging succeeds. The staged version is not installable until a maintainer approves it with npm 2FA.

Review the successful workflow run and sign in to npm. Open [Staged Packages](https://www.npmjs.com/settings/barbajoe/staged-packages), inspect the staged version of `@barbajoe/css-lib`, and approve or reject it with npm 2FA. Close the reminder issue afterward. GitHub email and the issue are reminders; neither can approve the npm release. If staging fails, no approval issue is created. If the reminder job fails after staging succeeded, check npm's staging queue before retrying anything; do not rerun the entire release workflow blindly because npm will reject a duplicate staged version. Create the reminder issue manually if necessary.
