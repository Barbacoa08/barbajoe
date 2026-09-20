# Svelte component library

This directory records the retired Svelte component library.

## Former contents

The package included:

- Accordion and accordion-item components.
- A page layout composed from header and footer components.
- Link, modal, share-button, and text-gradient components.
- Button, input, and textarea form components.
- Post-list components intended for content-management views.
- A collection of reusable SVG icon components.
- Small utilities and shared header and logo types.

The package used Svelte 4, SvelteKit, TypeScript, and Vite. Vitest, Testing
Library, jsdom, and `jest-axe` covered component behavior and accessibility.
Storybook provided interactive stories and development examples. The library
depended on `@barbajoe/css-lib` for shared styling.

## Rebuild direction

Reintroduce a Svelte package only when an application needs a reusable
component set. Use the current Svelte packaging recommendations, keep the CSS
library as the visual foundation, and restore components in consumer-driven
groups. Tests should cover behavior and accessibility, while an interactive
catalog such as Storybook should be added only when its ongoing value justifies
the dependency surface.
