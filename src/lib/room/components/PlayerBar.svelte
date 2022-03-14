<script lang="ts">
	import { getRoundContext } from './RoundManager.svelte';
	import Token, { isTokenValue } from './Token.svelte';

	const { color, isLockedIn, tokens, updateToken, api } = getRoundContext();

	$: allAssigned = $tokens.every((v) => v > -1);

	const unsetToken = (e: DragEvent) => {
		const token = JSON.parse(e.dataTransfer.getData('application/playertoken'));
		updateToken(token, null);
	};
</script>

{#if !$isLockedIn}
	<div class="bottomBar" on:dragover|preventDefault on:drop={unsetToken}>
		{#if allAssigned}
			<button style="max-width:50vw" on:click={() => api.lockIn($tokens)} type="button">
				Lock In
			</button>
		{:else}
			{#each $tokens as value, i (i)}
				<span>
					{#if value === -1 && isTokenValue(i)}
						<Token draggable value={i} {color} />
					{/if}
				</span>
			{/each}
		{/if}
	</div>
{/if}
