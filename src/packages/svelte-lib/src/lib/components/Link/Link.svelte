<script lang="ts">
  export let isExternal = false;
  export let href = "/";
</script>

<a
  {href}
  target={isExternal ? "_blank" : "_self"}
  rel={isExternal ? "noopener noreferrer" : ""}
  class={$$props.class}
  aria-label={$$props["aria-label"]}
>
  <slot />
</a>
