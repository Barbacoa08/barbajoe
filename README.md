# barbajoe's mono repo

This repo contains the scaffolding (WIP) for three app and two libraries.

## Apps:

- App 1 `src/apps/landing` ([repo](https://github.com/Barbacoa08/barbajoe/tree/main/src/apps/landing), [live site](https://barbajoe.tech/)): an overview of my creations
- App 2 `src/apps/lib-staging` ([repo](https://github.com/Barbacoa08/barbajoe/tree/main/src/apps/lib-staging), [live site](https://lib-staging.barbajoe.tech/)): WIP, a staging environment for the libraries for testing and example usage.

## Libraries:

- CSS Lib `src/packages/css-lib` ([repo](https://github.com/Barbacoa08/barbajoe/tree/main/src/packages/css-lib)): minimal css library that I've created so that I can stop copy-pasting my styling all over. Implemented in the barbajoe site, with plans to implement in the fighter-advice site.
- React Lib `src/packages/react-lib` ([repo](https://github.com/Barbacoa08/barbajoe/tree/main/src/packages/react-lib)): WIP, functional but not particularly useful or published to NPM/Deno
- Svelte Lib `src/packages/svelte-lib` ([repo](https://github.com/Barbacoa08/barbajoe/tree/main/src/packages/svelte-lib)): WIP, functional but not particularly useful or published to NPM/Deno. Code Coverage: ![badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/barbacoa08/0549c337c501b3d5d709f55341796e15/raw/jest-coverage-comment__main.json)

## dev

- run barbajoe landing: `pnpm start`
- run lib-staging: `pnpm start:lib-staging`
- run all libs: `pnpm start:libs`
- run libs individually:
  - `pnpm start:css-lib`
  - `pnpm start:svelte-lib`
  - `pnpm start:react-lib`
- ~run svelte lib app with css-lib: `pnpm start:css-lib & pnpm svelte-lib dev:sveltekit`~
  - auto build is misconfigured as I haven't update vite's `watch` command to handle css@next (for nested styling). Run svelte-lib app by itself and manually build css-lib via: `pnpm build:css-lib`
