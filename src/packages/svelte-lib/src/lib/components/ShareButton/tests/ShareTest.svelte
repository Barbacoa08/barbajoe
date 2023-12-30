<script>
  import Share from "../Share.svelte";

  $: result = "no action";
</script>

<main>
  <Share
    title="Share Button Example"
    text="This is an example of the Share Button component."
    url="/"
    callback={() => (result = "shared")}
  >
    {result}
  </Share>
</main>
