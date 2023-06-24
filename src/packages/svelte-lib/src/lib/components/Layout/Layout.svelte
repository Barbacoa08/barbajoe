<script lang="ts">
  import "css-lib/dist/barbiecss.css";

  import type { HeaderLink, LogoData } from "$lib/types";

  import { Footer, Header } from "./";
  import { Link } from "../Link";

  export let links: HeaderLink[] = [];
  export let logo: LogoData | undefined = undefined;
</script>

<Header {links} {logo}><slot name="header" /></Header>

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
