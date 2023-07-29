<script lang="ts">
  import Modal from "../Modal.svelte";

  let showModal = false;
</script>

<button on:click={() => (showModal = true)}> open </button>

<Modal bind:showModal>
  <svelte:fragment slot="dialog-header-text">Put Title Here</svelte:fragment>

  I be a modal!
</Modal>
