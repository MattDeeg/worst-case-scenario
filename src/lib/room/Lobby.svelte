<script lang="ts">
	import Surface from '$lib/ui/Surface.svelte';
	import Token from '$lib/room/components/Token.svelte';
	import { getRoomContext } from './context';

	const { api, gameID, userID, user, users, readiness } = getRoomContext();

	$: isReady = $readiness?.[userID] ?? false;
	let userColor = $user?.color;
	let userName = $user?.name;
	let allReady = false;
	$: {
		const userIDs = Object.keys($users);
		const ready = $readiness;
		allReady = userIDs.every((id) => ready[id] === true);
	}

	const readyUser = () =>
		api.readyUser({
			color: userColor,
			displayName: userName,
			ready: !isReady
		});

	const startGame = () => api.nextRound();
</script>

<Surface header="{gameID} Lobby" --min-height="75vh">
	<div class="column g1">
		{#each $users as user (user.id)}
			{@const isSelf = user.id === userID}
			{@const isSelfUnready = isSelf && !isReady}
			<div class="row g2">
				{#if isSelfUnready}
					<input class="flex-auto" style="--spacing: 0" bind:value={userName} />
				{:else}
					<span class="flex-auto">
						{user.name}
					</span>
				{/if}
				<span class="colorSelect">
					<Token value={1} color={isSelfUnready ? userColor : user.color} --radius="2.5em" />
					{#if isSelfUnready}
						<input type="color" bind:value={userColor} />
					{/if}
				</span>
				<button
					type="button"
					disabled={!isSelf}
					on:click={readyUser}
					class="inline-btn"
					class:ready={$readiness[user.id]}
				>
					Ready <i>✓</i>
				</button>
			</div>
		{/each}
		<button type="button" on:click={startGame} disabled={!allReady}>Start Game</button>
	</div>
</Surface>

<style lang="scss">
	.inline-btn {
		width: auto;
		margin: auto 0 0;
		white-space: nowrap;
		--form-element-spacing-horizontal: 2em;
		&.ready {
			padding-left: 1.5em;
			padding-right: 2.5em;
			i {
				opacity: 1;
			}
		}
		i {
			position: absolute;
			margin-left: 0.5em;
			opacity: 0;
		}
	}
	.row {
		align-items: center;
	}
	.colorSelect {
		position: relative;
		input {
			-webkit-appearance: none;
			-moz-appearance: none;
			appearance: none;
			width: 3em;
			height: 3em;
			background-color: transparent;
			border: none;
			position: absolute;
			padding: 0;
			opacity: 0;
			left: 0;
			top: 0;
		}
	}
</style>
