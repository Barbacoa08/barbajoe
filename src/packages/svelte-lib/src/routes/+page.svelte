<script lang="ts">
import {
	Button,
	Icons,
	Input,
	Link,
	Share,
	TextGradient,
	Textarea,
} from "$lib";
import type { ShareCallback } from "$lib/components";

import BasicModalImplementation from "$lib/components/Modal/tests/BasicModalImplementation.svelte";
import FormModal from "$lib/components/Modal/tests/FormModal.svelte";
// import OpenModal from "$lib/components/Modal/tests/OpenModal.svelte";

import "./global.css";

const mockShareCallback: ShareCallback = async ({ webshared }) => {
	if (webshared) {
		alert("Shared!");
	} else {
		alert("Copied URL to clipboard");
	}
};
</script>

<svelte:head>
	<title>Barbajoe's Svelte Library</title>
	<meta
		name="description"
		content="The landing page for Barbajoe's Svelte Library"
	/>
</svelte:head>

<h1>Minimal Page Example</h1>
<p>Minimal svelte page example.</p>

<h2>Link Example</h2>
<p>Internal Link: <Link href="/page1">Page 1</Link></p>

<h2>Modal Examples (from tests)</h2>
<div>
	<BasicModalImplementation />
	<FormModal />
	<!-- <OpenModal /> -->
</div>

<h2>TextGradient Example</h2>
<p>Example of the <TextGradient>Text Gradient</TextGradient> component.</p>

<h2>Icons Example</h2>
<div>
	<ul>
		<li>The Search Icon: <span><Icons.Search /></span></li>
		<li>The Notebook Icon: <span><Icons.Notebook /></span></li>
	</ul>
</div>

<h2>Form Elements</h2>
<section class="form-examples">
	<div class="buttons">
		<Button>Primary Button</Button>
		<Button variant="secondary">Secondary Button</Button>
		<Button variant="tertiary">Tertiary Button</Button>
		<Button variant="icon" aria-label="Search">
			<Icons.Search /> <span>⌘K</span>
		</Button>
		<Button variant="custom" class="custom-button-class">Custom Button</Button>
		<Button disabled>Disabled Button</Button>
	</div>

	<form>
		<Input on:click={() => console.log("ping")}>
			Using <TextGradient>special formatting</TextGradient>
		</Input>
	</form>

	<form>
		<Input type="password" aria-label="password input without visual label" />
		<Input type="password">Password Inputs 👆👇</Input>
	</form>

	<form>
		<Textarea>
			Adding <TextGradient>swagger</TextGradient> to the label
		</Textarea>
	</form>
</section>

<h2>Share Button</h2>
<section>
	<Share
		title="Share Button Example"
		text="This is an example of the Share Button component."
		url="/"
		callback={mockShareCallback}
	>
		Share
	</Share>
</section>

<style>
	ul li span {
		color: purple;
	}

	div.buttons {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.form-examples {
		display: grid;
		gap: 2rem;
	}
</style>
