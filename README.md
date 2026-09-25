# barbajoe

This repository is centered on
[`@barbajoe/css-lib`](src/packages/css-lib/README.md), a small stylesheet for
giving ordinary semantic HTML a consistent visual foundation.

The previous landing and library-staging applications and the experimental
React and Svelte component libraries have been retired. Each former workspace
retains a short README describing its purpose, former technology, and a
possible rebuild direction. Their source remains available in Git history.

## Repository layout

- `src/packages/css-lib`: the active CSS package.
- `src/apps/landing`: rebuild brief for the personal landing site.
- `src/apps/lib-staging`: rebuild brief for the library demonstration site.
- `src/packages/react-lib`: rebuild brief for the React component library.
- `src/packages/svelte-lib`: rebuild brief for the Svelte component library.
- `.project`: local planning convention. Only its README is committed.

The former library-staging Netlify site now hosts the
[CSS specimen](https://lib-staging.barbajoe.tech/) from `src/packages/css-lib`.
The landing site's builds remain stopped. The CSS package has a staged npm
release workflow: a deliberate version increase merged into `main` prepares a
package for review, but npm publication still requires the maintainer's 2FA
approval. See the [CSS release instructions](src/packages/css-lib/README.md#releasing-the-css-package).

## Development

Install the locked dependencies and run the repository checks:

```sh
pnpm install --frozen-lockfile
pnpm check
```

The individual commands are `pnpm lint`, `pnpm build`, and
`pnpm test:release` for the release-workflow helpers.

## Future publishable libraries

The staged-release workflow covers only `@barbajoe/css-lib`. If a React,
Svelte, or other publishable library is reintroduced, give it a separate
release workflow or explicitly extend the existing one. Its build and package
checks, version gate, npm trusted-publisher configuration, and approval
reminder must be designed for that library; do not assume the CSS workflow
will publish it.
