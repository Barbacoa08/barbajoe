<script lang="ts">
  import type { HeaderLink } from "$lib/types";

  import { Footer, Header } from "./";
  import { Link } from "../Link";

  export let links: HeaderLink[] = [];
</script>

<Header {links}><slot name="header">Header</slot></Header>

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
