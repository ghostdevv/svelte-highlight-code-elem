<script lang="ts">
	import { writable } from 'svelte/store';
	import { Gooey } from 'gooey';

	function create_gui(s) {
		const gui = new Gooey({ container: s.parent });
		return gui;
	}
</script>

<main>
	<!-- prettier-ignore -->
	<code lang="svelte">
		<h1>hello world</h1>
	</code>

	<!-- prettier-ignore -->
	<code lang="ts">
		const button = document.createElement('button');
		button.setAttribute('onclick', "alert('hello world')")
		button.innerText = 'click me'
		s.parent.appendChild(button);
	</code>

	<!-- prettier-ignore -->
	<code lang="ts">
		const gui = create_gui(s);
		gui.addNumber('count', 10)
	</code>
</main>
