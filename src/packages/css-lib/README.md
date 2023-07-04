# barbajoe's css library

TODO: add content and run+build details

## tech notes

Uses [lightningcss](https://lightningcss.dev/docs.html) (a parcel library) for the prod build, which doesn't have a `watch` command, but is _delightfully_ barebones, and I love that.

Uses [Parcel](https://parceljs.org/) for the dev build (HMR).

## hosted via Netlify

[See it in action here](https://lib-staging.barbajoe.tech/css-lib)

## publish instructions

- navigate to this directory (`barbajoe/src/packages/css-lib/`)
- `npm login`
- `npm publish --otp=onetimepasswordfromauthenticator`
