<script lang="ts">
	import victimImg from './victim.png';
	import Spinner from './Spinner.svelte';
	import { darkenHex } from '$lib/utils';
	import { getRoomContext } from '$lib/room/context';

	const { api, round, users, scores, readiness } = getRoomContext();

	let victimIsInactive = false;
	$: {
		const victim = $round?.victim;
		const user = ($users ?? []).find((user) => user.id === victim);
		if (user.inactive) {
			victimIsInactive = true;
		} else if (victimIsInactive === true) {
			victimIsInactive = false;
		}
	}
</script>

<div class="users">
	<Spinner target={$round?.bonusType} forceSpin={$round?.id} />
	{#each $users as user (user.id)}
		<div
			class="user"
			class:victim={$round?.victim === user.id}
			class:ready={$readiness?.[user.id]}
			class:inactive={user.inactive}
			style="--user-color: {user.color}; --shadow-color: {darkenHex(user.color)}"
		>
			<img src={victimImg} alt="{user.name} is The Victim" />
			<span class="name">{user.name}</span>
			<span class="score">{$scores?.[user.id] ?? 0}</span>
		</div>
	{/each}
	{#if victimIsInactive}
		<button type="button" on:click={api.nextRound}>Skip Inactive Victim</button>
	{/if}
</div>

<style lang="scss">
	.users {
		display: flex;
		flex-direction: column;
		gap: 1em;
		align-self: start;
		margin-top: 1em;
		user-select: none;

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
			justify-content: space-between;
			transition: transform 0.25s, box-shadow 0.25s, width 0.5s;

			img {
				opacity: 0;
				transition: opacity 0.5s, width 0.5s;
				height: 2em;
				width: 0;
			}

			&.inactive {
				opacity: 0.5;
			}
			&.victim {
				img {
					opacity: 1;
					width: 2em;
				}
				width: calc(100% + 2em);
			}
			&.ready {
				transform: translateY(-0.25em);
				box-shadow: 0.2em 0.2em 0.25em 0 var(--shadow-color);
			}

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
