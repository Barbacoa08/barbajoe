<script lang="ts">
  import { page } from "$app/stores";
  import type { HeaderLink } from "$lib/types";

  export let links: HeaderLink[] = [];
</script>

<header>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <slot />

  {#if links.length > 0}
    <ul>
      {#each links as link}
        <li class:active={$page.url.pathname.startsWith(link.href)}>
          <a href={link.href}>{link.text}</a>
        </li>
      {/each}
    </ul>
  {/if}
</header>
