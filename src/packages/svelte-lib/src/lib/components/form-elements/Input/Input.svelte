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

<div class="wrapper">
	<label for={id}><slot /></label>

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
