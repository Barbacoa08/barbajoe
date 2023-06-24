<script lang="ts">
  import { Layout } from "..";
</script>

<Layout logo={{ src: "", ariaLabel: "logo", text: "<- cool logo eh?" }}>
  <svelte:fragment slot="header">barbajoe's svelte library</svelte:fragment>

  <h1>Layout With Logo</h1>

  <svelte:fragment slot="footer">footer as empty fragment slot</svelte:fragment>
</Layout>
