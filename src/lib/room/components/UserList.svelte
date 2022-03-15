<script lang="ts">
	import Spinner from './Spinner.svelte';

	import { getRoomContext } from '$lib/room/context';

	const { round, users, scores } = getRoomContext();
</script>

<div class="users">
	<Spinner target={$round?.bonusType} forceSpin={$round?.id} />
	{#each $users as user (user.id)}
		<div class="user" style="--user-color: {user.color}">
			<span class="name">{user.name}</span>
			<span class="score">{$scores[user.id]}</span>
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
