<script lang="ts">
  import { Footer, Header } from "./";
  import { Link } from "../Link";
</script>

<Header><slot name="header">Header</slot></Header>

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
