<script lang="ts">
	import { onMount } from 'svelte';
	import PlayerBar from './PlayerBar.svelte';
	import Predicaments from './PredicamentGame.svelte';
	import { getRoomContext } from '../context';
	import type { Card } from '$lib/api/generateHand';
	import PredicamentSelector from './PredicamentSelector.svelte';

	const { api, userID, round, allPlayersReady, readiness, cards } = getRoomContext();

	let previewCards: Card[] = [];
	$: cardsSelected = $cards?.[0] !== '';
	$: revealed = $round?.revealed ?? [false];
	$: allRevealed = revealed.length === 5 && revealed.every(Boolean);

	const startRound = () => api.setHand({ cards: previewCards });
	const redrawCards = async () => {
		previewCards = await api.getHand().then((r) => r.data);
	};
	const reveal = (index: number) => api.revealDecision({ index });
	onMount(() => {
		if (!cardsSelected) {
			redrawCards();
		}
	});
</script>

{#if !cardsSelected}
	<PredicamentSelector cards={previewCards} />
{:else}
	<Predicaments />
{/if}

{#if !cardsSelected}
	<!-- If guesser cards aren't locked in -->
	<div class="bottomBar g4">
		<button on:click={startRound} type="button">Start Round</button>
		<button on:click={redrawCards} type="button">Redraw Cards</button>
		<button on:click={api.nextRound} type="button">Skip Me</button>
	</div>
{:else if allRevealed}
	<!-- All cards have been revealed -->
	<div class="bottomBar">
		<button type="button" on:click={api.nextRound}>Next Victim</button>
	</div>
{:else if $allPlayersReady}
	<!-- Ready to reveal -->
	<div class="bottomBar g1 column">
		<h4 class="header">Reveal Your Picks</h4>
		<div class="row g2">
			{#each $round.revealed as revealed, i (i)}
				<button class:revealed on:click={() => reveal(i)} type="button">
					Reveal Card {i + 1}
				</button>
			{/each}
		</div>
	</div>
{:else if !$readiness?.[userID]}
	<!-- Deciding -->
	<PlayerBar />
{/if}

<style>
	.revealed {
		opacity: 0.5;
	}
</style>
