<script context="module" lang="ts">
  import clsx from "clsx";

  export type Variant =
    | "primary"
    | "secondary"
    | "tertiary"
    | "icon"
    | "custom";
</script>

<script lang="ts">
  export let variant: Variant = "primary";

  if (
    variant === "icon" &&
    !$$props["aria-label"] &&
    !$$props["aria-labelledby"]
  ) {
    const error =
      "BARBAJOE svelte-lib error: Icon buttons must have an `aria-label` or `aria-labelledby` to comply with accessibility guidelines.";
    console.error(error);
  }

  const cssClasses = clsx(
    variant === "primary" && "primary",
    variant === "secondary" && "secondary",
    variant === "tertiary" && "tertiary",
    variant === "icon" && "icon",
    $$props.class,
  );
</script>

<button on:click on:blur on:focus {...$$restProps} class={cssClasses}>
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

    &.icon {
      color: var(--color-link-text);
      background: none;

      display: flex;
      align-items: center;

      border: 1px solid var(--color-link-text);
      padding: 0.3rem 0.5rem;
      border-radius: 0.5rem;

      &:hover {
        color: var(--color-text);
        border-color: var(--color-text);
        background-color: var(--color-bg);
        box-shadow: inset 0 0 0 0.1rem var(--color-link-text);
        transition: all 0.15s cubic-bezier(0.165, 0.84, 0.44, 1);
      }

      & > span {
        padding-left: 0.25rem;
      }
    }
  }
</style>
