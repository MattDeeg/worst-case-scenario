<script lang="ts">
	import type { DecisionToken, TokenValue } from '$lib/firebase/dbTypes/Database';
	import Card from './Card.svelte';
	import Token from './Token.svelte';
	import { getRoomContext, type UserWithID } from '../context';
	import { fly, type FlyParams } from 'svelte/transition';

	function swoop(node: Element, opts: FlyParams) {
		const anim = fly(node, { ...opts, opacity: 1 });
		if (card === '') {
			return { delay: 0, duration: 0 };
		}
		return {
			...anim,
			css: (t: number, u: number) => `z-index: 5; ${anim.css(t, u)}`
		};
	}

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

{#if card !== ''}
	<div class="decisionWrapper">
		{#key card}
			<div class="transition" out:swoop|local={{ y: -1000, duration: 1500 }}>
				<Card text={card} flipped>
					<Token {...victimToken} slot="victim" />
					<div class="column flex-wrap g1" style="height: 100%">
						{#each guessers as guessToken}
							<Token {...guessToken} />
						{/each}
					</div>
				</Card>
			</div>
		{/key}
	</div>
{/if}

<style>
	.transition {
		position: absolute;
	}
	.decisionWrapper {
		--ratio: 0.75;
		display: flex;
		flex-grow: 1;
		justify-content: center;
		align-self: start;
		margin-top: 5em;
	}
</style>
