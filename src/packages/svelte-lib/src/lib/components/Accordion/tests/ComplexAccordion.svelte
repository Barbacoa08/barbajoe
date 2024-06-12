<script>
import Accordion from "../Accordion.svelte";
import AccordionItem from "../AccordionItem.svelte";
</script>

<main>
  <Accordion>
    <h1 slot="header">Header slot content</h1>

    <AccordionItem>
      <svelte:fragment slot="header">Item 1</svelte:fragment>

      <p>Item 1 content</p>
    </AccordionItem>

    <AccordionItem expanded>
      <svelte:fragment slot="header">Item 2</svelte:fragment>

      <p>Item 2 content</p>
    </AccordionItem>

    <AccordionItem>
      <svelte:fragment slot="header">Item 3</svelte:fragment>

      <p>Item 3 content</p>
    </AccordionItem>
  </Accordion>
</main>
