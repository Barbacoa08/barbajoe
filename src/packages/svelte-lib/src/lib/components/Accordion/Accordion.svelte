<script lang="ts">
import { genId } from "$lib/utils";

const id = genId();
</script>

<div {id}>
  <slot name="header" />
</div>

<ul aria-labelledby={id}>
  <slot />
</ul>

<style>
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
</style>
