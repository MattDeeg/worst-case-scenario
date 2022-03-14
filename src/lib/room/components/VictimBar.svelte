<script lang="ts">
	import { store } from '$lib/firebase/browser';
	import { onMount } from 'svelte';
	import type { GameVictim } from '$lib/firebase/docTypes/GameVictim';
	import PlayerBar from './PlayerBar.svelte';
	import { getRoundContext } from './RoundManager.svelte';
	import Predicaments from './Predicaments.svelte';

	const { isLockedIn, cards, api, gameID } = getRoundContext();

	let victimData: GameVictim = null;
	$: allRevealed = (victimData?.revealed ?? [false]).every(Boolean);
	onMount(() => {
		const ref = store.doc<GameVictim>(`gameVictim/${gameID}`);
		return store.onSnapshot(ref, (snap) => {
			victimData = snap.data();
		});
	});
</script>

<Predicaments victimCards={victimData?.cards} />

{#if victimData}
	{#if $cards[0].text === ''}
		<!-- If guesser cards aren't locked in -->
		<div class="bottomBar g4">
			<button on:click={() => api.startRound(victimData.cards)} type="button">Start Round</button>
			<button on:click={api.redrawCards} type="button">Redraw Cards</button>
			<button on:click={api.nextRound} type="button">Skip Me</button>
		</div>
	{:else if allRevealed}
		<!-- All cards have been revealed -->
		<div class="bottomBar">
			<button type="button" on:click={api.nextRound}>Next Victim</button>
		</div>
	{:else if victimData.readyToReveal}
		<!-- Ready to reveal -->
		<div class="bottomBar g1 column">
			<h4 class="header">Reveal Your Picks</h4>
			<div class="row g2">
				{#each victimData.revealed as revealed, i (i)}
					<button class:revealed on:click={() => api.revealDecision(i)} type="button">
						Reveal Card {i + 1}
					</button>
				{/each}
			</div>
		</div>
	{:else if !$isLockedIn}
		<!-- Deciding -->
		<PlayerBar />
	{/if}
{/if}

<style>
	.revealed {
		opacity: 0.5;
	}
</style>
