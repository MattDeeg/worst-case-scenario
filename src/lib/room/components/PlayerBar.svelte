<script lang="ts">
	import { asTokenValue, isTokenValue } from '$lib/firebase/dbTypes/Database';

	import { getRoomContext } from '../context';

	import Token from './Token.svelte';

	const { userID, user, cards, tokens, readiness, api } = getRoomContext();

	$: tokenValues = $tokens ?? [-1, -1, -1, -1, -1];
	$: allAssigned = tokenValues.every((v) => v > -1);
	$: hasCards = $cards?.[0] !== '';

	const unsetToken = (e: DragEvent) => {
		const token = JSON.parse(e.dataTransfer.getData('application/playertoken'));
		api.setToken({
			token,
			cardIndex: -1
		});
	};
	const lockIn = () => api.lockIn();
</script>

{#if !$readiness?.[userID]}
	<div class="bottomBar" on:dragover|preventDefault on:drop={unsetToken}>
		{#if allAssigned}
			<button class="lockBtn" on:click={lockIn} type="button"> Lock In </button>
		{:else}
			{#each tokenValues as value, i (i)}
				<span class="tokenWrapper">
					{#if value === -1 && isTokenValue(i)}
						<Token draggable={hasCards} value={i} color={$user?.color} />
					{/if}
				</span>
			{/each}
		{/if}
	</div>
{/if}

<style>
	.tokenWrapper {
		--radius: 5em;
		height: var(--radius);
		width: var(--radius);
	}
	.lockBtn {
		max-width: 50vw;
	}
</style>
