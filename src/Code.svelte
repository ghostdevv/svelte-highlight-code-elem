<script lang="ts">
	import { onMount } from 'svelte';

	export let code: string;
	export let exec: () => Promise<any>;

	let parent;
	onMount(() => {
		exec?.({ parent });
	});
</script>

<div class="root">
	<div class="code">{@html code}</div>
	<div class="exec" bind:this={parent}>
		<slot />
	</div>
</div>

<style>
	.root {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		grid-template-rows: 1fr;
		border: 2px solid gray;
	}

	.code {
		background-color: #121212;
	}

	.exec {
		padding: 12px;
	}
</style>
