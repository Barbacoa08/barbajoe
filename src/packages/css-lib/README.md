# barbajoe's css library

One stylesheet for personal applications that makes ordinary semantic HTML look
and behave consistently. Import the bundle once at the application entry point;
the library deliberately styles document elements such as headings, forms,
links, dialogs, and `main` without requiring utility classes.

## application shell

Use `app-shell` on the element that owns the page-level header, main content,
and footer. It creates a full-height grid without assuming that a particular
direct child of `body` is always the application root.

```html
<body>
  <div class="app-shell">
    <header>...</header>
    <main>...</main>
    <footer>...</footer>
  </div>
</body>
```

Classes remain appropriate for visual or structural roles HTML cannot express,
such as `site-header`, `text-gradient`, and `dialog-content-container`.

## tokens

New library tokens use the `--bj-` prefix. They cover typography, spacing,
radius, shadow, motion, and semantic colors such as `--bj-color-text`,
`--bj-color-bg`, `--bj-color-border`, `--bj-color-text-muted`, and
`--bj-color-focus-ring`. Existing token names remain aliases so applications
can migrate only when it is useful.

## tech notes

Uses [lightningcss](https://lightningcss.dev/docs.html) (a parcel library) for the prod build, which doesn't have a `watch` command, but is _delightfully_ barebones, and I love that.

Uses [Parcel](https://parceljs.org/) for the dev build (HMR).

## hosted via Netlify

[See it in action here](https://lib-staging.barbajoe.tech/css-lib)

## publish instructions

- navigate to this directory (`barbajoe/src/packages/css-lib/`)
- `npm login`
- `npm publish --otp=onetimepasswordfromauthenticator`
