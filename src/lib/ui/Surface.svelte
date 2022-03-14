<script lang="ts">
	export let header: string = null;
</script>

<main id="dialog">
	<header class="row g1">
		{#if $$slots.header}
			<slot name="header" />
		{:else if header}
			{header}
		{:else}
			<div class="column">
				<span class="sm">The</span>
				<span>Worst Case Scenario</span>
				<span class="sm tr">Card Game</span>
			</div>
		{/if}
		<div class="stripe" />
	</header>
	<slot />
</main>

<style>
	#dialog {
		border-radius: 4px;
		background: var(--brand-500);
		width: 60vw;
		padding: 3em 2em;
		position: relative;
		margin: 2em;
		min-height: var(--min-height, 0px);
		display: flex;
		flex-direction: column;
	}
	#dialog:before {
		content: '';
		position: absolute;
		top: -10px;
		bottom: -10px;
		left: -10px;
		right: -10px;
		z-index: -1;
		border-radius: 4px;
		background: repeating-linear-gradient(
			-60deg,
			var(--brand-500),
			var(--brand-500) 10px,
			#000 10px,
			#000 20px
		);
		background-color: rgba(255, 255, 255, 0.5);
		box-shadow: 0em 0.5em 1.5em;
	}
	#dialog > header {
		margin-top: -1em;
		margin-bottom: 1em;
		font-weight: bold;
		font-size: 1.5em;
		align-items: center;
	}
	.sm {
		font-size: 0.5em;
	}
	.tr {
		text-align: right;
	}
	.stripe {
		background: repeating-linear-gradient(
			-50deg,
			transparent,
			transparent 10px,
			#000 10px,
			#000 20px
		);
		flex-grow: 1;
		height: 1em;
	}
</style>
