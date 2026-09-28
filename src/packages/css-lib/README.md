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

See the [full shell](specimen/index.html), [header-and-main shell](specimen/layout-header.html), [main-and-footer shell](specimen/layout-footer.html), and [main-only shell](specimen/layout-minimal.html) specimens.

A `site-header` supports a brand or title with navigation, a brand or title alone, or navigation alone. All three compositions appear in the [header specimen](specimen/headers.html#combined-header).

Classes remain appropriate for roles that semantic HTML cannot express by itself, including `site-header`, `text-gradient`, `scaleup-on-hover`, and `dialog-content-container`.

## Buttons, forms, and dialogs

Native `button` and button-type `input` elements are styled automatically: `submit` is primary, `button` is secondary, and `reset` is tertiary. A button without a type receives primary styling to match its usual form-submit behavior; write `type="button"` for a non-submit action. Override emphasis independently of behavior with `data-barba-variant="primary"`, `"secondary"`, or `"tertiary"`. These attributes affect appearance only.

The Updated Soft treatment reuses the existing palette. Primary hover uses link-hover in light mode and inverse-surface (light gray) in dark mode. Secondary hover uses surface; tertiary hover uses control background. Text colors do not change on hover. Disabled controls retain their emphasis with reduced opacity and no hover treatment. The global keyboard focus ring applies to controls inside and outside forms.

Text inputs (including omitted `type`), textarea, and select receive the same appearance regardless of form ancestry or the `form` attribute. Full-width sizing and additional top spacing remain specific to controls inside forms. Forms retain their stacked layout. Page-footer margin/alignment apply only to `.app-shell > footer`, not article or dialog footers.

For a three-region dialog, use this direct-child structure:

```html
<dialog id="edit-dialog" aria-labelledby="edit-title">
  <form method="dialog" class="dialog-content-container">
    <header class="dialog-header"><h2 id="edit-title">Edit</h2></header>
    <div class="dialog-body">
      <label>Title <input name="title" value="Initial title" required /></label>
    </div>
    <footer class="dialog-footer">
      <button type="submit" value="submit">Submit</button>
      <button type="button" command="close" commandfor="edit-dialog">Cancel</button>
      <button type="reset">Reset</button>
    </footer>
  </form>
</dialog>
<button type="button" command="show-modal" commandfor="edit-dialog">Open</button>
```

Dialogs grow with content from a 16rem minimum to an 80dvb maximum; available viewport space caps the minimum and maximum to preserve 1rem outer gutters. The structured body normally owns scrolling, leaving header/footer visible and the footer at the bottom for short content. Its scrolling region retains at least 6rem of height. On exceptionally short screens, the outer dialog can scroll too, keeping the readable body and oversized header/footer actions reachable. Unstructured dialogs retain padding and native scrolling; their content does not receive the three-region layout. Existing structured consumers should wrap their body in `.dialog-body`.

`method="dialog"` submits and closes after native validation without a network request. Cancel is a non-submit button; `command="close"` performs its dismissal in browsers supporting HTML invoker commands. Reset restores initial values without closing. Closing does not reset fields. Consumers supporting browsers without invoker commands must supply open/close behavior; the specimen includes a feature-detected fallback, not library JavaScript. See the [short and long dialog examples](specimen/index.html#dialog-heading).

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

These guarantees apply only to the listed default pairings. Accent, inverse-surface, arbitrary token combinations, and consumer overrides do not carry a general contrast guarantee. The forced light and dark matrices in the [component catalog](specimen/index.html#color-heading) display the contract.

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

### Button and dialog review checks

Review both the source specimen and built specimen served from `.output/specimen` as the web root (its generated asset URLs are root-relative). These are manual browser checks, separate from release-helper tests:

- Compare primary, secondary, and tertiary buttons in both forced schemes, including hover, keyboard focus, disabled, and optional emphasis overrides. Primary dark hover is light gray; all hover text stays unchanged.
- Compare text fields inside, outside, and associated with a form. Edit the associated field and confirm the form's Reset restores it.
- Open the short dialog: the footer sits at the bottom without forcing maximum height. Open the long dialog: the body scrolls while header/footer stay visible.
- Edit dialog fields and Reset; clear the required title and Submit; Cancel while invalid; Submit while valid. Reset stays open, invalid Submit stays open, Cancel and valid Submit close, and focus returns to the opener. Reopening retains values until Reset.
- Tab and Shift+Tab through a dialog, reach the final long-body field, and dismiss with Escape. Check 320px-wide and exceptionally short viewports; all actions must remain reachable without page horizontal overflow.
- Review reduced-motion preferences and additional browsers separately. A successful build or one browser's measurements are not a cross-browser accessibility guarantee.

## Hosted specimen

The specimen is hosted at https://lib-staging.barbajoe.tech/ on the existing library-staging Netlify site. Production deploys from `main`, and pull requests receive Netlify Deploy Previews for review before merging. Netlify publishes the static output of `pnpm build:specimen`.

For live editing, run `pnpm css-lib dev` from the repository root. Parcel's watch mode and hot module replacement remain the local development workflow.

## Releasing the CSS package

The package is currently at version `0.3.0`. Change the version only when there is an approved reason to release the CSS library. The staged-release workflow is specific to this package and accepts stable `MAJOR.MINOR.PATCH` versions only.

The npm trusted publisher for `@barbajoe/css-lib` identifies GitHub user `Barbacoa08`, repository `barbajoe`, and workflow `stage-css-release.yml`. It must allow **stage publishing only**, not direct publishing. Keep the npm maintainer account's 2FA enabled and the package's Publishing access set to **Require two-factor authentication and disallow tokens**. The workflow uses OIDC; it needs neither a bypass-2FA npm access token nor an `NPM_AUTH_TOKEN` GitHub secret. Enable GitHub email notifications for issue assignments if you want the staged-release reminder in your inbox.

To release, raise this package's version in a pull request and merge it into `main`. The workflow compares that version with the preceding `main` version and npm's published `latest`; equal, lower, and prerelease versions do not stage. It then installs locked dependencies, tests, builds, checks that the package contains only its expected CSS file and metadata, and stages it on npm. A separate job assigns Joe a GitHub issue only after staging succeeds. The staged version is not installable until a maintainer approves it with npm 2FA.

Review the successful workflow run and sign in to npm. Open [Staged Packages](https://www.npmjs.com/settings/barbajoe/staged-packages), inspect the staged version of `@barbajoe/css-lib`, and approve or reject it with npm 2FA. Close the reminder issue afterward. GitHub email and the issue are reminders; neither can approve the npm release. If staging fails, no approval issue is created. If the reminder job fails after staging succeeded, check npm's staging queue before retrying anything; do not rerun the entire release workflow blindly because npm will reject a duplicate staged version. Create the reminder issue manually if necessary.
