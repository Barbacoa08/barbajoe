<script>
  import Button from "../Button.svelte";

  $: result = "no action";
</script>

<main>
  <Button on:click={() => (result = "clicked")}>{result}</Button>
</main>
