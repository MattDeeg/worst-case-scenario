<script lang="ts">
	import { page } from '$app/stores';
	import Surface from '$lib/ui/Surface.svelte';
	import sillyname from 'sillyname';

	let linkedRoom = $page.url.searchParams.get('room');
	let displayName = sillyname();
	const regenName = () => {
		displayName = sillyname();
	};

	let nameError = false;
	const validate = (e: SubmitEvent) => {
		nameError = false;
		const displayName = (e.target as HTMLFormElement).elements.namedItem(
			'displayName'
		) as HTMLInputElement;
		if (displayName.value === '') {
			e.preventDefault();
			nameError = true;
		}
	};
</script>

<Surface>
	<form on:submit={validate} action="/api/create" method="post">
		{#if linkedRoom}
			<input type="hidden" name="gameID" value={linkedRoom} />
		{/if}
		<label for="gameID">
			Room ID:
			<input
				type="text"
				name="gameID"
				value={linkedRoom}
				disabled={!!linkedRoom}
				placeholder="Room to Join"
			/>
			<sub>
				{#if !linkedRoom}
					Leave blank to generate random
				{/if}
			</sub>
		</label>
		<label for="displayName">
			My Name:
			<div class="reloadWrapper">
				<input
					type="text"
					name="displayName"
					bind:value={displayName}
					placeholder="My Name"
					autocomplete="off"
				/>
				<button on:click={regenName} type="button">Reload</button>
			</div>
			<sub class="error">
				&nbsp;
				{#if nameError}
					You must set a display name
				{/if}
			</sub>
		</label>

		{#if !linkedRoom}
			<button formaction="/api/create">Create New Room</button>
		{/if}
		<button class:secondary={!linkedRoom} formaction="/api/join">Join Existing Room</button>
	</form>
</Surface>

<style lang="scss">
	.secondary {
		--primary: var(--brand-900);
		--primary-hover: var(--brand-800);
	}
	sub {
		position: relative;
		top: calc(-1 * var(--spacing));
		display: block;
		font-size: 0.75em;
	}
	.error {
		color: #f00;
	}
	.reloadWrapper {
		position: relative;
		button {
			background: transparent;
			background-image: url(/static/reload.svg);
			background-size: contain;
			background-repeat: no-repeat;
			border: 0;
			color: transparent;
			position: absolute;
			right: 0.75em;
			top: 0.75em;
			height: 1.5em;
			width: 1.5em;
			cursor: pointer;
			user-select: none;
			padding: 0;
			margin: 0;
		}
	}
</style>
