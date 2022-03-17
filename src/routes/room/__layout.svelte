<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';
	import { database } from '$lib/firebase/browser';
	import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';

	export const load: Load = async ({ session, params }) => {
		const { userID } = session;
		const { gameID } = params;

		const db = wrapDatabase(database);
		const playerRef = await db.games[gameID].players.users[userID].color.get();
		if (!playerRef.exists()) {
			return { redirect: `/join/${gameID}`, status: 302 };
		}
		return {};
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	const { gameID } = $page.params;
	const activate = () => {
		navigator.sendBeacon(`/api/${gameID}/reactivate`);
	};
	const deactivate = () => {
		navigator.sendBeacon(`/api/${gameID}/deactivate`);
	};
	const visibilityWrapper = () => {
		if (document.visibilityState === 'hidden') {
			deactivate();
		} else {
			activate();
		}
	};

	onMount(() => {
		document.addEventListener('visibilitychange', visibilityWrapper);
		activate();
		return () => {
			document.removeEventListener('visibilitychange', visibilityWrapper);
			deactivate();
		};
	});
</script>

<svelte:window on:beforeunload={deactivate} />
<slot />
