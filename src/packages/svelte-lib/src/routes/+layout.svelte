<script lang="ts">
  import { Layout, Link } from "$lib";
  import type { HeaderLink } from "$lib/types";

  const links: HeaderLink[] = [
    { href: "/page1", text: "Page 1" },
    { href: "/page2", text: "Page 2" },
    { href: "/page3", text: "Page 3" },
  ];
</script>

<Layout {links}>
  <svelte:fragment slot="header">
    <Link>barbajoe's svelte library</Link>
  </svelte:fragment>

  <slot />

  <svelte:fragment slot="footer">footer as empty fragment slot</svelte:fragment>
</Layout>
