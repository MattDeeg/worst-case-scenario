<script lang="ts">
	import { onMount } from 'svelte';
	import PlayerBar from './PlayerBar.svelte';
	import { getRoomContext } from '../context';
	import type { Card as CardType } from '$lib/api/generateHand';
	import PredicamentSelector from './PredicamentSelector.svelte';
	import Card from './Card.svelte';
	import Token from './Token.svelte';
	import { asTokenValue } from '$lib/firebase/dbTypes/Database';

	const { api, userID, user, round, allPlayersReady, readiness, cards, tokens } = getRoomContext();

	let previewCards: CardType[] = [];
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
	$: orderedCards = $tokens.map((cardIndex, i) => ({
		originalIndex: i,
		text: $cards[cardIndex]
	}));
</script>

{#if !cardsSelected}
	<PredicamentSelector cards={previewCards} />
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
	<div class="bottomBar g3 column">
		<h4 class="header">Reveal Your Picks</h4>
		<div class="row g2 between">
			{#each orderedCards as { text, originalIndex }, i (i)}
				<div class="column g1">
					<Card {text} --ratio="0.35" flipped --token-radius="2em">
						<Token value={asTokenValue(i)} color={$user.color} slot="token" />
					</Card>
					<button
						class:revealed={revealed?.[i]}
						on:click={() => reveal(originalIndex)}
						type="button"
					>
						Reveal Card {i + 1}
					</button>
				</div>
			{/each}
		</div>
	</div>
{:else if !$readiness?.[userID]}
	<!-- Deciding -->
	<PlayerBar />
{/if}

<style>
	.between {
		justify-content: space-between;
	}
	.revealed {
		opacity: 0.5;
	}
</style>
