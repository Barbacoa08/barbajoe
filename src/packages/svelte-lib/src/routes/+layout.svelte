<script lang="ts">
import { page } from "$app/stores";
import { Layout } from "$lib";
import type { HeaderLink, LogoData } from "$lib/types";

$: links = [
	{ href: "/page1", text: "Page 1", active: $page.url.pathname === "/page1" },
	{ href: "/page2", text: "Page 2", active: $page.url.pathname === "/page2" },
	{ href: "/page3", text: "Page 3", active: $page.url.pathname === "/page3" },
] as HeaderLink[];

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
