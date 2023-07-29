<script lang="ts">
  import Modal from "../Modal.svelte";

  let showModal = false;

  const clearAndClose = () => {
    showModal = false;
  };
</script>

<button on:click={() => (showModal = true)}> open </button>

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
    <button class="modal-action-button" on:click={clearAndClose}>
      cancel
    </button>

    <button class="modal-action-button" on:click={clearAndClose}>
      insert
    </button>
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
