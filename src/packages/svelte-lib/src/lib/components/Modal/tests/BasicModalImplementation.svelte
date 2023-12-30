<script lang="ts">
  import { Button } from "$lib/components";
  import { Modal } from "../";

  let showModal = false;
</script>

<Button on:click={() => (showModal = true)}>open basic modal</Button>

<Modal bind:showModal>
  <svelte:fragment slot="dialog-header-text">Put Title Here</svelte:fragment>

  I be a modal!
</Modal>
