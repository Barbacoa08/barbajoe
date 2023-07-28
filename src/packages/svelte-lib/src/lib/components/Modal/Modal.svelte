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

<style>
  dialog {
    width: 32em;
    height: 30rem;
    border-radius: 0.2em;
    border: none;
    padding: 0;
  }
  dialog::backdrop {
    background: rgba(0, 0, 0, 0.3);
  }

  dialog > div.dialog-content-container {
    height: -webkit-fill-available;
    display: grid;
    grid-template-rows: auto 1fr auto;

    padding: 1em;
  }

  dialog h2.dialog-header {
    margin: 0;
    padding: 0.5em 1em;
  }

  dialog div.dialog-footer {
    display: flex;
    justify-content: end;
    gap: 1em;
  }

  dialog[open] {
    animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes zoom {
    from {
      transform: scale(0.95);
    }
    to {
      transform: scale(1);
    }
  }
  dialog[open]::backdrop {
    animation: fade 0.2s ease-out;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
