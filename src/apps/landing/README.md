# Landing application

This directory records the retired landing application so it can be rebuilt
deliberately rather than kept on an outdated stack.

## Purpose

The application served [barbajoe.tech](https://barbajoe.tech/) as a small
personal landing page. It displayed the Markdown from the Barbacoa08 GitHub
profile README, linked to a résumé, and included basic traffic monitoring.

## Former implementation

- Astro generated the static site.
- `@astrojs/markdown-component` rendered the remotely fetched profile README.
- Cronitor RUM provided browser monitoring.
- A small amount of application-local CSS supplied the responsive layout,
  light and dark colors, and animated gradient heading.
- Netlify hosted the site. Its builds are stopped so the last deployment can
  remain available while this implementation is absent.

## Rebuild direction

Keep the replacement intentionally small. Use a current static-site approach,
consume `@barbajoe/css-lib` for shared styling, and decide whether the profile
content should be fetched at build time or maintained directly in the site.
Accessibility, minimal dependencies, and a reliable static deployment should
take priority. Reconfigure and restart the Netlify site only when the
replacement is ready.
