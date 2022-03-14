<script lang="ts" context="module">
	import type { Game } from '$lib/firebase/docTypes/Game';
	import type { Load } from '@sveltejs/kit';
	import { browser } from '$app/env';

	export const load: Load = async ({ session, params }) => {
		let redirectToJoin = false;
		const { userID } = session;
		const { gameID } = params;
		if (browser) {
			const { store } = await import('$lib/firebase/browser');
			const game = await store.getDoc(store.doc<Game>(`games/${gameID}`));
			if (game.exists()) {
				redirectToJoin = !(userID in game.data().users);
			} else {
				redirectToJoin = true;
			}
		} else {
			const { store } = await import('$lib/firebase/server');
			const game = await store.doc<Game>(`games/${gameID}`).get();
			if (game.exists) {
				redirectToJoin = !(userID in game.data().users);
			} else {
				redirectToJoin = true;
			}
		}

		if (redirectToJoin) {
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
	onMount(() => {
		activate();
		return deactivate;
	});
</script>

<svelte:window on:beforeunload={deactivate} />
<slot />
