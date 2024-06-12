<script lang="ts">
import "@barbajoe/css-lib/dist/barbajoe.css";

import type { HeaderLink, LogoData } from "$lib/types";

import { Link } from "../Link";
import { Footer, Header } from "./";

export let links: HeaderLink[] = [];
export let logo: LogoData | undefined = undefined;
</script>

<Header {links} {logo}>
  <slot name="logo" />
  <slot name="header" />
</Header>

<main id="main-content">
  <slot />
</main>

<Footer>
  <slot name="footer">
    &forall; by <Link isExternal href="https://barbajoe.tech/">
      <code>barbajoe</code>
    </Link>
  </slot>
</Footer>
