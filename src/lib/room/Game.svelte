<script lang="ts">
	import './components/bottomBar.scss';
	import type { RunningGame } from '$lib/firebase/docTypes/Game';
	import UserList from './components/UserList.svelte';
	import RoundManager from './components/RoundManager.svelte';
	import Predicaments from './components/Predicaments.svelte';
	import VictimBar from './components/VictimBar.svelte';
	import PlayerBar from './components/PlayerBar.svelte';
	import DecisionReveal from './components/DecisionReveal.svelte';

	export let userID: string;
	export let game: RunningGame;
</script>

<UserList {game} {userID} />
{#key game.round}
	<RoundManager {userID} {game}>
		{#if game.decision && userID !== game.victim}
			<DecisionReveal />
		{:else if userID === game.victim}
			<VictimBar />
		{:else}
			<Predicaments />
			<PlayerBar />
		{/if}
	</RoundManager>
{/key}
