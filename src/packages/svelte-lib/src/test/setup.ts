/* eslint-disable @typescript-eslint/no-explicit-any */

import { toHaveNoViolations } from "jest-axe";
import { vi } from "vitest";

import "@testing-library/jest-dom";

expect.extend(toHaveNoViolations);

// https://github.com/sveltejs/kit/issues/5525#issuecomment-1186390654
vi.mock("$app/stores", async () => {
  const { readable, writable } = await import("svelte/store");
  /**
   * @type {import('$app/stores').getStores}
   */
  const getStores = () => ({
    navigating: readable(null),
    page: readable({ url: new URL("http://localhost"), params: {} }),
    session: writable(null),
    updated: readable(false),
  });
  /** @type {typeof import('$app/stores').page} */
  const page = {
    subscribe(fn: any) {
      return getStores().page.subscribe(fn);
    },
  };
  /** @type {typeof import('$app/stores').navigating} */
  const navigating = {
    subscribe(fn: any) {
      return getStores().navigating.subscribe(fn);
    },
  };
  /** @type {typeof import('$app/stores').session} */
  const session = {
    subscribe(fn: any) {
      return getStores().session.subscribe(fn);
    },
  };
  /** @type {typeof import('$app/stores').updated} */
  const updated = {
    subscribe(fn: any) {
      return getStores().updated.subscribe(fn);
    },
  };
  return {
    getStores,
    navigating,
    page,
    session,
    updated,
  };
});
