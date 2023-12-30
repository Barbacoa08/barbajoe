<script lang="ts">
  import { Button } from "$lib/components";
  import { Modal } from "../";

  let showModal = false;

  const clearAndClose = () => {
    showModal = false;
  };
</script>

<Button on:click={() => (showModal = true)}>open form modal</Button>

<Modal bind:showModal>
  <svelte:fragment slot="dialog-header-text">Insert Entry</svelte:fragment>

  <form>
    <div>
      <label for="name">Name</label>
      <input id="name" type="text" />
    </div>

    <div>
      <label for="notes">Notes</label>
      <textarea id="notes" />
    </div>
  </form>

  <svelte:fragment slot="dialog-footer">
    <Button variant="secondary" on:click={clearAndClose}>cancel</Button>

    <Button on:click={clearAndClose}>insert</Button>
  </svelte:fragment>
</Modal>

<style>
  form {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
