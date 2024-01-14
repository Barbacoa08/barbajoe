<script context="module" lang="ts">
  import { genId } from "$lib/utils";
</script>

<script lang="ts">
  export let value: string = "";
  export let placeholder: string = "";
  export let id: string | undefined = genId();
</script>

<label for={id}><slot /></label>
<textarea
  {...$$restProps}
  {id}
  {value}
  {placeholder}
  on:click
  on:blur
  on:focus
  on:change
  on:input
  on:keydown
  on:keyup
  on:paste
/>

<style>
  label {
    font-size: larger;
    font-weight: bold;
  }

  textarea {
    font-size: var(--font-size-base);
    box-sizing: border-box;
    width: 100%;
    margin-top: 0.1rem;
    border: 1px solid var(--border-color-gray);
    border-radius: 0.2em;
    padding: 0.3em;
  }
</style>
