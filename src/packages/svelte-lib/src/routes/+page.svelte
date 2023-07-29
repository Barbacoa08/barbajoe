<script lang="ts">
  import { Link } from "$lib";
  import BasicModalImplementation from "$lib/components/Modal/tests/BasicModalImplementation.svelte";
  import FormModal from "$lib/components/Modal/tests/FormModal.svelte";
  import OpenModal from "$lib/components/Modal/tests/OpenModal.svelte";
</script>

<h1>Minimal Page Example</h1>
<p>Minimal svelte page example.</p>

<h2>Link Example</h2>
<p>Internal Link: <Link href="/page1">Page 1</Link></p>

<h2>Modal Examples (for tests)</h2>
<div>
  <BasicModalImplementation />
  <FormModal />
  <OpenModal />
</div>
