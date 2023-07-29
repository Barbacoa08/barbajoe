<script lang="ts">
  import Modal from "../Modal.svelte";
</script>

<Modal showModal>
  <svelte:fragment slot="dialog-header-text">Information</svelte:fragment>

  This is information for the user on page load.
</Modal>
