# Barbajoe CSS library

One global stylesheet for personal applications. It gives ordinary semantic
HTML a consistent foundation for typography, forms, links, dialogs, page
layout, and a small set of reusable visual treatments.

## Installation and import

Install the package, then import its stylesheet once from an application entry
point. The package-root import is preferred:

```js
import "@barbajoe/css-lib";
```

The explicit stylesheet subpath remains supported:

```js
import "@barbajoe/css-lib/dist/barbajoe.css";
```

Both paths resolve to the same global stylesheet. The repository tracks the
source in `lib/`; npm receives only the generated `dist/barbajoe.css` bundle,
the package metadata, and this README.

## Application shell

Add `app-shell` to the element that owns the page regions. A direct `main` is
required. Direct `header` and `footer` regions are independently optional, so
the supported structures are:

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

See the [full shell](specimen/index.html),
[header-and-main shell](specimen/layout-header.html),
[main-and-footer shell](specimen/layout-footer.html), and
[main-only shell](specimen/layout-minimal.html) specimens.

A `site-header` supports a brand or title with navigation, a brand or title
alone, or navigation alone. All three compositions appear in the
[header specimen](specimen/headers.html#combined-header).

Classes remain appropriate for roles that semantic HTML cannot express by
itself, including `site-header`, `text-gradient`, `scaleup-on-hover`, and
`dialog-content-container`.

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

The following default pairings are guaranteed. Text roles meet at least 7:1
against both supported backgrounds. Border meets at least 3:1; focus ring uses
the link-hover color and therefore also exceeds 3:1.

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

These guarantees apply only to the listed default pairings. Accent,
inverse-surface, arbitrary token combinations, and consumer overrides do not
carry a general contrast guarantee. The forced light and dark matrices in the
[component catalog](specimen/index.html#color-heading) display the contract.

## Local development

From this package directory, install the repository dependencies and start the
specimen:

```bash
pnpm dev
```

Parcel opens the component catalog automatically and applies HTML, CSS, and
dialog-fixture changes with hot module replacement. Use the navigation to
review the component catalog, header compositions, and all four application
shell structures in the same session.

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

`dist/`, `.output/`, and `.parcel-cache/` are generated locally and are not
tracked by Git.

## Hosted specimen

The specimen is hosted at https://lib-staging.barbajoe.tech/ on the existing
library-staging Netlify site. Production deploys from `main`, and pull requests
receive Netlify Deploy Previews for review before merging. Netlify publishes
the static output of `pnpm build:specimen`.

For live editing, run `pnpm css-lib dev` from the repository root. Parcel's
watch mode and hot module replacement remain the local development workflow.

## Publication state

The package remains at version `0.2.1`. Publication is paused until a separate
release need and a restored publication process are explicitly approved. Do
not change the version merely because stabilization work contains breaking
pre-1.0 changes.
