<script lang="ts">
  import { Layout } from "..";
</script>

<Layout links={[{ href: "/", text: "home", active: true }]}>
  <svelte:fragment slot="header">barbajoe's svelte library</svelte:fragment>

  <h1>Layout With Links</h1>

  <svelte:fragment slot="footer">footer as empty fragment slot</svelte:fragment>
</Layout>
