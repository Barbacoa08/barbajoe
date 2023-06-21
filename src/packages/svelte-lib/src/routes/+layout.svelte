<script lang="ts">
  import { Layout } from "$lib";
  import type { HeaderLink, LogoData } from "$lib/types";

  const links: HeaderLink[] = [
    { href: "/page1", text: "Page 1" },
    { href: "/page2", text: "Page 2" },
    { href: "/page3", text: "Page 3" },
  ];

  const logo: LogoData = {
    href: "/",
    src: "/favicon.ico",
    alt: "Logo",
    ariaLabel: "go to landing page",
    text: "barbajoe's svelte library",
  };
</script>

<Layout {links} {logo}>
  <slot />

  <svelte:fragment slot="footer">footer as empty fragment slot</svelte:fragment>
</Layout>
