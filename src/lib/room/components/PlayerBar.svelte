<script lang="ts">
	import { isTokenValue } from '$lib/firebase/dbTypes/Database';

	import { getRoomContext } from '../context';

	import Token from './Token.svelte';

	const { userID, user, tokens, readiness, api } = getRoomContext();

	$: tokenValues = $tokens;
	$: allAssigned = tokenValues.every((v) => v > -1);

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
			<button style="max-width:50vw" on:click={lockIn} type="button"> Lock In </button>
		{:else}
			{#each tokenValues as value, i (i)}
				<span>
					{#if value === -1 && isTokenValue(i)}
						<Token draggable value={i} color={$user.color} />
					{/if}
				</span>
			{/each}
		{/if}
	</div>
{/if}
