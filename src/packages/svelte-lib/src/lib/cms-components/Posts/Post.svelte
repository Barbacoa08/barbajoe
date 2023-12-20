<script lang="ts">
  import { Icons } from "$lib";

  export let disabled: boolean = false;
  export let href: string = "";
</script>

<li class:disabled>
  <a href={disabled ? "" : href} aria-disabled={disabled}>
    <span class="icons-position">
      <slot name="icon">
        <Icons.WordBubble />
      </slot>
    </span>

    <slot />
  </a>
</li>

<style>
  :root {
    --list-background-color: rgb(34, 34, 34);
    --list-link-color: white;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --list-background-color: rgb(210, 210, 210);
      --list-link-color: rgb(34, 34, 34);
    }
  }

  li {
    border-radius: 1rem;
    margin-bottom: 1rem;
    background-color: var(--list-background-color);
    transition: transform 0.15s cubic-bezier(0, 0.2, 0.5, 3) 0s;
  }
  li:hover,
  li:focus-within {
    transform: scale(1.02);
  }

  li a {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    height: 3rem;
    color: var(--list-link-color);

    transition:
      box-shadow 0.25s cubic-bezier(0.08, 0.59, 0.29, 0.99) 0s,
      border-color 0.25s cubic-bezier(0.08, 0.59, 0.29, 0.99) 0s,
      transform 0.25s cubic-bezier(0.08, 0.59, 0.29, 0.99) 0s,
      background-color 0.25s cubic-bezier(0.08, 0.59, 0.29, 0.99) 0s;
  }

  li.disabled {
    transform: none;
  }
  li a[aria-disabled="true"],
  li.disabled a {
    pointer-events: none;
    opacity: 0.5;
    transition: none;
  }

  li a .icons-position {
    position: absolute;
    left: 1.5rem;
    color: var(--list-link-color);
  }
</style>
