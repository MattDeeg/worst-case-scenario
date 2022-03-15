<script lang="ts">
	import Card from './Card.svelte';
	import Token from './Token.svelte';
	import { getRoomContext, type UserWithID } from '../context';
	import type { DecisionToken, TokenValue } from '$lib/firebase/dbTypes/Database';

	const { round, users } = getRoomContext();

	const getTokenProps = (token: DecisionToken, users: UserWithID[]) => {
		if (!token) {
			return { value: -1 as TokenValue, color: '#000' };
		}
		const user = users.find((user) => user.id === token.userID);
		return {
			value: token.token,
			color: user?.color ?? '#000'
		};
	};

	$: cardIndex = $round?.decision?.cardIndex;
	$: card = $round?.cards?.[cardIndex] ?? '';
	$: victimToken = getTokenProps($round?.decision?.victim, $users);
	$: guessers = ($round?.decision?.others ?? []).map((token) => getTokenProps(token, $users));
</script>

<div class="wrapper">
	{#if card}
		<Card text={card} flipped>
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
