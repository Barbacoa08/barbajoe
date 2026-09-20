# Library staging application

This directory records the retired library staging application.

## Purpose

The application served
[lib-staging.barbajoe.tech](https://lib-staging.barbajoe.tech/) as a place to
exercise and document the CSS, React, and Svelte libraries together. It offered
an index of the libraries plus dedicated example routes for each one.

## Former implementation

- Astro generated the site and routed the library example pages.
- Astro's Svelte integration rendered the Svelte layout components.
- Workspace dependencies connected the CSS, React, and Svelte libraries.
- The Svelte layout supplied the shared header, navigation, main content, and
  footer while the CSS library supplied global styling.
- Netlify hosted the site. Its builds are stopped so the last deployment can
  remain available while this implementation is absent.

## Rebuild direction

Rebuild this application only when there are active libraries that need a
shared demonstration environment. It should use current tooling, import the
real packaged outputs, provide focused examples and accessibility checks, and
avoid becoming a second implementation of library behavior. Reconfigure and
restart the Netlify site only after the replacement is ready.
