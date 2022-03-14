<script lang="ts">
	import { sortedUsers, type Game } from '$lib/firebase/docTypes/Game';
	import Surface from '$lib/ui/Surface.svelte';
	import Token from '$lib/room/components/Token.svelte';

	export let userID: string;
	export let gameID: string;
	export let game: Game;

	$: isHost = game?.users?.[userID]?.host;
	$: isReady = game?.users?.[userID]?.ready;
	let userColor = game?.users?.[userID]?.color;
	let userName = game?.users?.[userID]?.displayName;
	$: allReady = Object.values(game.users).every((user) => user.ready);

	const readyUser = () => {
		fetch('/api/readyUser', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify({ gameID, color: userColor, displayName: userName, ready: !isReady })
		})
			.then((res) => res.json())
			.then(console.log);
	};
	const startGame = () => {
		fetch('/api/start', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify({ gameID })
		})
			.then((res) => res.json())
			.then(console.log);
	};

	$: users = sortedUsers(game, userID);
</script>

<Surface header="{gameID} Lobby" --min-height="75vh">
	<div class="column g1">
		{#each users as user (user.id)}
			{@const isSelf = user.id === userID}
			{@const isSelfUnready = isSelf && !user.ready}
			<div class="row g2">
				{#if user.host}
					<img class="icon" src="/crown.svg" alt="user is host" />
				{:else}
					<span class="icon" />
				{/if}
				{#if isSelfUnready}
					<input class="flex-auto" style="--spacing: 0" bind:value={userName} />
				{:else}
					<span class="flex-auto">
						{user.displayName}
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
					class:ready={user.ready}
				>
					Ready <i>✓</i>
				</button>
			</div>
		{/each}
		{#if isHost}
			<button type="button" on:click={startGame} disabled={!allReady}>Start Game</button>
		{/if}
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
	.icon {
		width: 2em;
		min-height: 1em;
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
