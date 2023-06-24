<script lang="ts">
  import { page } from "$app/stores";
  import { Link } from "$lib";
  import type { HeaderLink, LogoData } from "$lib/types";

  export let links: HeaderLink[] = [];
  export let logo: LogoData | undefined;
</script>

<header>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <slot />

  {#if logo}
    <div>
      <Link href={logo.href || "/"} aria-label={logo.ariaLabel}>
        <img width="50" height="50" src={logo.src} alt={logo.alt || "Logo"} />
      </Link>

      {#if logo.text}
        <span>{logo.text}</span>
      {/if}
    </div>
  {/if}

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

<style>
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
</style>
