<script lang="ts">
	import { store } from '$lib/firebase/browser';
	import { onMount } from 'svelte';
	import { page, session } from '$app/stores';
	import { type Game, isLobbyGame, isRunningGame } from '$lib/firebase/docTypes/Game';
	import Lobby from '$lib/room/Lobby.svelte';
	import GameBoard from '$lib/room/Game.svelte';

	const { gameID } = $page.params;
	const { userID } = $session;

	let game: Game = null;
	onMount(() => {
		const ref = store.doc<Game>(`games/${gameID}`);
		return store.onSnapshot(ref, (snap) => {
			game = snap.data();
		});
	});
</script>

{#if !game}
	loading
{:else if isLobbyGame(game)}
	<Lobby {userID} {gameID} {game} />
{:else if isRunningGame(game)}
	<GameBoard {userID} {game} />
{:else}
	Something's wrong...
{/if}
