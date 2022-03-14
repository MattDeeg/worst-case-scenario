<script context="module" lang="ts">
	import type { ErrorLoad } from '@sveltejs/kit';
	export const load: ErrorLoad = ({ error, status }) => {
		return {
			props: {
				status: String(status),
				message: error.message
			}
		};
	};
</script>

<script lang="ts">
	import Surface from '$lib/ui/Surface.svelte';

	export let status: string;
	export let message: string;
</script>

<Surface>
	<h1>{status}</h1>
	<pre><code>{message}</code></pre>
</Surface>

<style>
	h1 {
		word-break: break-all;
		margin-bottom: 0.5em;
	}
	pre {
		margin: 0;
		background: var(--brand-700);
		white-space: pre-wrap;
		padding: 0.5em;
		font-size: 1.25em;
	}
</style>
