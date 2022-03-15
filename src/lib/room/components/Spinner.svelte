<script lang="ts">
	export let target = 0;
	export let forceSpin: string;

	const noop = (n: string) => n;

	let angle = 0;
	$: {
		noop(forceSpin);
		if (angle < 360) {
			angle = 3600 + 60 * (target - 1);
		} else {
			angle = 60 * (target - 1);
		}
	}
</script>

{#if target !== 0}
	<div class="scrim">
		<div class="container">
			<div class="spinner" style="--rotation:{angle}deg">
				<div class="face">
					<div class="title">The 4 is more</div>
					<div class="body">Players who match The Victim's #4 chip get a 4-point bonus.</div>
				</div>
				<div class="face">
					<div class="title">All = Bonus!</div>
					<div class="body">Players who match all The Victim's chips get a 5-point bonus.</div>
				</div>
				<div class="face">
					<div class="title">Bad is Good!</div>
					<div class="body">Players who match the victim's #1 chip get a 1-point bonus.</div>
				</div>
				<div class="face">
					<div class="title">Score Your Chips</div>
					<div class="body">
						Your point total equals the numbers shown on all your matching chips.
					</div>
				</div>
				<div class="face">
					<div class="title">Triple Up!</div>
					<div class="body">All players triple their points</div>
				</div>
				<div class="face">
					<div class="title">Double Up!</div>
					<div class="body">All players double their points</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.scrim {
		position: relative;
		overflow: hidden;
		font-size: 0.75em;
		width: 15rem;
		margin: 0 auto;
		background-color: darken(#fdb71a, 20%);
		border: 1px solid #000;
	}
	.container {
		position: relative;
		overflow: hidden;
		box-sizing: border-box;
		perspective: 500px;
		height: 10em;
		width: 100%;
		z-index: 1;
	}
	.spinner {
		position: relative;
		height: 5em;
		transform: rotateY(var(--rotation, 0deg));
		transform-style: preserve-3d;
		transition: transform 2s cubic-bezier(0.2, 0.7, 0.4, 0.95);
		top: 20%;
	}
	.face {
		background-color: var(--brand-500);
		width: 12em;
		height: 8em;
		outline: 1px solid #000;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: absolute;
		backface-visibility: hidden;
		text-align: center;
	}
	.face .title {
		font-size: 1.2em;
	}
	.face .body {
		font-size: 0.75em;
		padding: 0 0.5em;
	}
	.face:nth-child(even) {
		background-color: #fff;
	}
	@for $i from 0 through 5 {
		.face:nth-child(#{$i + 1}) {
			transform: translateX(10em)
				translateX(-50%)
				rotateY($i * -60deg)
				translateY(-1em)
				translateZ(10.5em);
		}
	}
</style>
