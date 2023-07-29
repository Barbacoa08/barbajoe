<!-- copy-pasted (mostly) from: https://svelte.dev/examples/modal -->
<script lang="ts">
  export let showModal = false;

  let dialog: HTMLDialogElement;

  $: if (dialog && showModal) dialog.showModal();
  $: if (dialog && !showModal) dialog.close();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
  bind:this={dialog}
  on:close={() => (showModal = false)}
  on:click|self={() => dialog.close()}
>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="dialog-content-container" on:click|stopPropagation>
    <h2 class="dialog-header">
      <slot name="dialog-header-text" />
    </h2>

    <div>
      <slot />
    </div>

    <div class="dialog-footer">
      <slot name="dialog-footer">
        <button class="modal-action-button" on:click={() => dialog.close()}>
          close
        </button>
      </slot>
    </div>
  </div>
</dialog>
