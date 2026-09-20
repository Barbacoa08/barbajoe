# React component library

This directory records the retired React component-library experiment.

## Former contents

The library contained one `MyButton` component. It used local state to count
clicks, displayed the count in an alert, and used a CSS Module for styling.

The package used React 18, TypeScript, Vite library mode, and
`vite-plugin-dts`. Vite produced ES module and UMD builds plus a separate CSS
asset. The implementation did not have a dedicated automated test suite or a
Storybook setup.

## Rebuild direction

Reintroduce a React package only when a real consumer or a meaningful reusable
component set justifies it. Start from current React and library-packaging
guidance, treat React as a peer dependency, consume `@barbajoe/css-lib`, and add
tests and interactive documentation that reflect the actual component API.
