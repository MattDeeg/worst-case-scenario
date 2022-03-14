<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let flipped: boolean = false;
	export let text: string;
	export let droppable: boolean = false;

	let draggedOver = false;
	const dispatch = createEventDispatcher();

	const dataType = 'application/playertoken';
	const handleDragOver = (e: DragEvent) => {
		if (droppable && e.dataTransfer.types.includes(dataType)) {
			e.preventDefault();
			draggedOver = true;
		}
	};
	const handleDragOut = () => {
		draggedOver = false;
	};
	const handleDrop = (e: DragEvent) => {
		dispatch('droppedToken', JSON.parse(e.dataTransfer.getData(dataType)));
	};
</script>

<svelte:body on:dragend={handleDragOut} />

<div class="wrapper">
	{#if $$slots.victim}
		<div class="victim"><slot name="victim" /></div>
	{/if}
	{#if $$slots.token}
		<div class="token"><slot name="token" /></div>
	{/if}
	{#if $$slots.default}
		<div class="content"><slot /></div>
	{/if}
	<div
		class="card"
		class:flipped
		class:dragtarget={draggedOver}
		on:dragover={handleDragOver}
		on:drop={handleDrop}
		on:dragleave={handleDragOut}
	>
		<div class="front">
			<span class="text-pad">{text}</span>
		</div>
		<div class="back">
			<div class="sm">The</div>
			<div>Worst-Case</div>
			<div>Scenario</div>
			<div class="sm">Card Game</div>
		</div>
	</div>
</div>

<style lang="scss">
	.wrapper {
		--r: var(--ratio, 0.5);
		--sw: calc(20px * var(--r));
		position: relative;
		width: calc(25rem * var(--r));
		height: calc(35rem * var(--r));
	}
	.token {
		--radius: 3em;
		position: absolute;
		top: 0;
		right: 0;
		z-index: 1;
		transform: translate(50%, calc(var(--radius) * -0.5));
		height: calc(35rem * var(--r));
	}
	.victim {
		--radius: 5em;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
		transform: translate(-50%, calc(var(--radius) * -0.5));
	}
	.content {
		--radius: 3em;
		position: absolute;
		top: 0;
		right: 0;
		z-index: 1;
		transform: translate(50%, calc(var(--radius) * -0.5));
		height: calc(35rem * var(--r));
	}
	.card {
		width: calc(25rem * var(--r));
		height: calc(35rem * var(--r));
		position: relative;
		top: 0;
		transition: transform 500ms, top 250ms;
		transform-style: preserve-3d;
		perspective: 500px;
		color: #000;
		font-weight: bold;
		font-size: calc(2.5rem * var(--r));
		text-transform: uppercase;
		text-align: center;
		user-select: none;
		transform: rotateY(180deg);

		&.dragtarget {
			top: -0.5em;
			box-shadow: 0em 0.25em 0.75em;
		}
		&.flipped {
			transform: rotateY(0deg);
		}
	}
	.sm {
		font-size: 0.75em;
	}
	.card > div {
		pointer-events: none;
		border-radius: 0.5rem;
		position: absolute;
		top: 0;
		height: 100%;
		width: 100%;
		backface-visibility: hidden;
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow: hidden;
	}
	.front {
		background-color: #fff;
		border: 1px solid darken(#fff, 10%);
		.text-pad {
			padding: 0 1em;
		}
		&::before,
		&::after {
			content: '';
			display: inline-block;
			position: absolute;
			height: calc(3rem * var(--r));
			width: 100%;
			background: repeating-linear-gradient(
				-60deg,
				var(--brand-500),
				var(--brand-500) var(--sw),
				#000 var(--sw),
				#000 calc(var(--sw) * 2)
			);
		}
		&::before {
			top: 0;
		}
		&::after {
			bottom: 0;
		}
	}
	.back {
		border: 1px solid var(--brand-600);
		background-color: var(--brand-500);
		transform: rotateY(180deg);
		&::before,
		&::after {
			content: '';
			display: inline-block;
			position: absolute;
			height: calc(3rem * var(--r));
			width: 100%;
			background: repeating-linear-gradient(
				-60deg,
				transparent,
				transparent var(--sw),
				#000 var(--sw),
				#000 calc(var(--sw) * 2)
			);
		}
		&::before {
			top: calc(5rem * var(--r));
		}
		&::after {
			bottom: calc(5rem * var(--r));
		}
	}
</style>
