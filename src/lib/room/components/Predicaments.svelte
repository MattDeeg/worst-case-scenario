<script lang="ts">
	import Card from './Card.svelte';
	import Token, { isTokenValue } from './Token.svelte';

	import { getRoundContext } from './RoundManager.svelte';
	import type { Predicament } from '$lib/firebase/docTypes/Predicament';

	export let victimCards: Predicament[] = null;

	const { cards, tokensByCardID, updateToken, color } = getRoundContext();

	$: displayCards = victimCards ?? $cards;
	$: tokensByCard = $tokensByCardID;
</script>

<div class="cards">
	{#each displayCards as { id, text }, i (i)}
		{@const token = tokensByCard[id]}
		<Card droppable {text} on:droppedToken={(e) => updateToken(e.detail, id)} flipped={text !== ''}>
			{#if isTokenValue(token)}
				<Token draggable value={token} {color} slot="token" />
			{/if}
		</Card>
	{/each}
</div>

<style lang="scss">
	.cards {
		align-self: start;
		display: flex;
		width: 100%;
		justify-content: space-around;
		flex-wrap: wrap;
		row-gap: 2em;
		column-gap: 2em;
		padding: 0 3em;
		margin: 3em 0 10em;
	}
</style>
