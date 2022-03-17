<script lang="ts">
	import type { Card as CardType } from '$lib/api/generateHand';
	import { swoop, swoopIn } from '$lib/transitions/swoop';
	import Card from './Card.svelte';

	export let cards: CardType[];
</script>

<div class="cards">
	{#each cards as { text, id }}
		<div>
			{#key id}
				<div in:swoopIn={{ delay: 500, duration: 1000 }} out:swoop|local={{ duration: 1500 }}>
					<Card {text} flipped={text !== ''} />
				</div>
			{/key}
		</div>
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
