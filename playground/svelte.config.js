import { svelte_highlight_code_elem } from 'svelte-highlight-code-elem';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
	// Consult https://svelte.dev/docs#compile-time-svelte-preprocess
	// for more information about preprocessors
	preprocess: [vitePreprocess(), svelte_highlight_code_elem()],

	vitePlugin: {
		inspector: {},
	},
};
