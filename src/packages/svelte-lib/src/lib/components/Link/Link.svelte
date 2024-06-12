<script lang="ts">
export let isExternal = false;
export let href = "/";
</script>

<a
  {href}
  target={isExternal ? "_blank" : "_self"}
  rel={isExternal ? "noopener noreferrer" : ""}
  {...$$restProps}
>
  <slot />
</a>
