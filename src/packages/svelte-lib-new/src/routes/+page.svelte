<script lang="ts">
  import { Layout } from "$lib/components/Layout";
  import { Link } from "$lib/components/Link";
</script>

<Layout>
  <svelte:fragment slot="header">barbajoe's svelte library</svelte:fragment>

  <h1>Minimal Page Example</h1>
  <p>Minimal svelte page example.</p>

  <h2>Link Example</h2>
  <p>Internal Link: <Link href="/about">About</Link></p>

  <svelte:fragment slot="footer">footer as empty fragment slot</svelte:fragment>
</Layout>
