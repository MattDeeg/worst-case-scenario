<script lang="ts">
	import { isTokenValue, type TokenValue } from '$lib/firebase/dbTypes/Database';

	import { getRoomContext } from '../context';
	import Card from './Card.svelte';
	import Token from './Token.svelte';

	const { api, cards, tokens, user } = getRoomContext();

	const updateToken = (token: TokenValue, cardIndex: number) => {
		if (isTokenValue(cardIndex)) {
			api.setToken({ token, cardIndex });
		}
	};

	$: displayCards = $cards;
</script>

<div class="cards">
	{#each displayCards as text, i (i)}
		{@const token = ($tokens ?? []).indexOf(i)}
		<Card droppable {text} on:droppedToken={(e) => updateToken(e.detail, i)} flipped={text !== ''}>
			{#if isTokenValue(token)}
				<Token draggable value={token} color={$user.color} slot="token" />
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
