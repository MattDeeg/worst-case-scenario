<script lang="ts">
	import './components/bottomBar.scss';
	import UserList from './components/UserList.svelte';
	import Predicaments from './components/PredicamentGame.svelte';
	import VictimBar from './components/VictimBar.svelte';
	import PlayerBar from './components/PlayerBar.svelte';
	import DecisionReveal from './components/DecisionReveal.svelte';

	import { getRoomContext } from '$lib/room/context';

	const { userID, round } = getRoomContext();
</script>

<UserList />
{#if $round}
	{#key $round.id}
		{#if $round.decision}
			<DecisionReveal />
		{:else if userID !== $round.victim || $round.cards?.[0]}
			<Predicaments />
		{/if}
		{#if userID === $round.victim}
			<VictimBar />
		{:else}
			<PlayerBar />
		{/if}
	{/key}
{/if}
