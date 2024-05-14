<script context="module" lang="ts">
  import { EyeOff, EyeOpen } from "$lib/icons";
  import { genId } from "$lib/utils";
</script>

<script lang="ts">
  export let value: string = "";
  export let placeholder: string = "";
  export let id: string | undefined = genId();
  export let type:
    | "text"
    | "password"
    | "email"
    | "number"
    | "tel"
    | "url"
    | "search" = "text";

  $: inputType = type;
  const handleVisibilityToggle = () => {
    inputType = inputType === "password" ? "text" : "password";
  };

  const handleOnInput = (
    e: Event & {
      currentTarget: EventTarget & HTMLInputElement;
    },
  ) => {
    value = (e.target as HTMLInputElement).value;
  };
</script>

<label for={id}><slot /></label>

<div class="wrapper">
  <input
    type={inputType}
    {id}
    {value}
    {placeholder}
    on:click
    on:blur
    on:focus
    on:change
    on:input={handleOnInput}
    on:keydown
    on:keyup
    on:paste
    {...$$restProps}
  />

  {#if type === "password"}
    <button
      type="button"
      aria-label="toggle text visibility"
      on:click={handleVisibilityToggle}
    >
      {#if inputType === "password"}
        <EyeOff />
      {:else}
        <EyeOpen />
      {/if}
    </button>
  {/if}
</div>

<style>
  label {
    font-size: larger;
    font-weight: bold;
  }

  input[type="text"],
  input[type="password"],
  input[type="email"],
  input[type="number"],
  input[type="tel"],
  input[type="url"],
  input[type="search"] {
    font-size: var(--font-size-base);
    box-sizing: border-box;
    width: 100%;
    margin-top: 0.1rem;
    border: 1px solid var(--border-color-gray);
    border-radius: 0.2em;
    padding: 0.3em;
  }

  div.wrapper {
    position: relative;
  }
  div.wrapper input + button {
    background-color: transparent;
    border: none;

    position: absolute;
    right: 0.4rem;
    top: 0.4rem;
    cursor: pointer;
  }
</style>
