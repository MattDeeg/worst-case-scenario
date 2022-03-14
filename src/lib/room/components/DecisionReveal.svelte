<script lang="ts">
	import Card from './Card.svelte';

	import { getRoundContext } from './RoundManager.svelte';
	import Token from './Token.svelte';

	const { game } = getRoundContext();

	$: card = $game.decision?.card;
	$: victimToken = $game.decision?.victimToken;
	$: guessers = $game.decision?.guessers;
</script>

<div class="wrapper">
	{#if card}
		<Card text={card.text} flipped>
			<Token {...victimToken} slot="victim" />
			<div class="column flex-wrap" style="height: 100%">
				{#each guessers as guessToken}
					<Token {...guessToken} />
				{/each}
			</div>
		</Card>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-grow: 1;
		justify-content: center;
		--ratio: 0.75;
	}
</style>
