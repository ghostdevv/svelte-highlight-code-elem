<script lang="ts">
	import { writable } from 'svelte/store';
</script>

<main>
	<!-- prettier-ignore -->
	<code lang="ts">
		import { Gooey } from 'gooey';

		const gui = new Gooey();

		gui.addFolder('test');

		if (true) {
			doSomething()
		}
	</code>
</main>
