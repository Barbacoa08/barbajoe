<script lang="ts">
import { Layout } from "..";
</script>

<Layout>
  <svelte:fragment slot="header">barbajoe's svelte library</svelte:fragment>

  <h1>Layout With Header And Footer</h1>

  <svelte:fragment slot="footer">footer as empty fragment slot</svelte:fragment>
</Layout>
