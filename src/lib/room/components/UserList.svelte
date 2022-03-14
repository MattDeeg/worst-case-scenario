<script lang="ts">
	import { sortedUsers, type RunningGame } from '$lib/firebase/docTypes/Game';
	import Spinner from './Spinner.svelte';

	export let userID: string;
	export let game: RunningGame;

	$: users = sortedUsers(game, userID);
</script>

<div class="users">
	{#if game.type === 'competitive'}
		<Spinner target={game.bonusType} forceSpin={game.round} />
	{/if}
	{#each users as user (user.id)}
		<div class="user" style="--user-color: {user.color}">
			<span class="name">{user.displayName}</span>
			<span class="score">{user.score}</span>
		</div>
	{/each}
</div>

<style lang="scss">
	.users {
		display: flex;
		flex-direction: column;
		gap: 1em;
		align-self: start;
		margin-top: 1em;

		.user {
			background: var(--user-color, #000);
			padding: 0.5em 1em;
			border-top-right-radius: 4px;
			border-bottom-right-radius: 4px;
			font-weight: bold;
			color: #fff;
			display: flex;
			align-items: center;
			width: 15em;
			justify-content: center;

			.name {
				flex-grow: 1;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
				max-width: 10em;
				margin-right: 1em;
			}
			.score {
				font-style: italic;
				font-size: 1.5em;
			}
		}
	}
</style>
