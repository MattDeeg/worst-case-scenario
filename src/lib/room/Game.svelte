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
{#if userID === $round.victim}
	{#if $round.decision}
		<DecisionReveal />
	{:else if $round.cards?.[0]}
		<Predicaments />
	{/if}
	<VictimBar />
{:else}
	{#if $round.decision}
		<DecisionReveal />
	{:else}
		<Predicaments />
	{/if}
	<PlayerBar />
{/if}
