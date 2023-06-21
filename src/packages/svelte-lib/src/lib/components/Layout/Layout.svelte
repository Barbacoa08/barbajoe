<script lang="ts">
  import type { HeaderLink, LogoData } from "$lib/types";

  import { Footer, Header } from "./";
  import { Link } from "../Link";

  export let links: HeaderLink[] = [];
  export let logo: LogoData | undefined;
</script>

<slot name="header"><Header {links} {logo} /></slot>

<main id="main-content">
  <slot />
</main>

<Footer>
  <slot name="footer">
    &forall; by <Link isExternal href="https://github.com/Barbacoa08/">
      <code>barbajoe</code>
    </Link>
  </slot>
</Footer>
