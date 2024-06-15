<script context="module" lang="ts">
import { genId } from "$lib/utils";
</script>

<script lang="ts">
	export let value: string = "";
	export let placeholder: string = "";
	export let id: string | undefined = genId();
</script>

<div>
	<label for={id}><slot /></label>
	<textarea
		{...$$restProps}
		{id}
		{value}
		{placeholder}
		on:click
		on:blur
		on:focus
		on:change
		on:input
		on:keydown
		on:keyup
		on:paste
	/>
</div>
