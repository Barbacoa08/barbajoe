<script lang="ts">
  import { Link, TextGradient, Icons } from "$lib";

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

<h2>TextGradient Example</h2>
<p>Example of the <TextGradient>Text Gradient</TextGradient> component.</p>

<h2>Icons Example</h2>
<div>
  <ul>
    <li>The Search Icon: <span><Icons.Search /></span></li>
    <li>The Notebook Icon: <span><Icons.Notebook /></span></li>
  </ul>
</div>

<style>
  ul li span {
    color: purple;
  }
</style>
