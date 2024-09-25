import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { svelte_highlight_code_elem } from './pp.js';

export default {
	// Consult https://svelte.dev/docs#compile-time-svelte-preprocess
	// for more information about preprocessors
	preprocess: [vitePreprocess(), svelte_highlight_code_elem()],

	vitePlugin: {
		inspector: {},
	},
};
