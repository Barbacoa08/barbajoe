<script lang="ts">
  import clsx from "clsx";

  export let variant: "primary" | "secondary" | "tertiary" | "custom" =
    "primary";

  const cssClasses = clsx(
    variant === "primary" && "primary",
    variant === "secondary" && "secondary",
    variant === "tertiary" && "tertiary",
    $$props.class,
  );
</script>

<button
  on:click
  on:blur
  on:focus
  on:keydown
  {...$$restProps}
  class={cssClasses}
>
  <slot />
</button>

<style>
  button {
    cursor: pointer;
    font-size: 1rem;
    border: 1px solid var(--border-color-gray);
    border-radius: 0.2em;
    padding: 0.2em 0.5em;
    background: rgba(0, 0, 0, 0.3);

    &.primary {
      color: var(--color-text);
      background: var(--color-bg-accent);

      &:hover,
      &:focus {
        box-shadow: 0 0 0 2px var(--color-link-text-hover);
      }
    }

    &.secondary {
      color: var(--color-link-text);

      &:hover,
      &:focus {
        color: var(--color-link-text-hover);
        box-shadow: 0 0 0 2px var(--color-link-text-hover);
      }
    }

    &.tertiary {
      color: var(--color-link-text);
      background: transparent;
      border: none;

      &:hover,
      &:focus {
        color: var(--color-text);
      }
    }
  }
</style>
