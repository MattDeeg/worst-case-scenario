<script lang="ts">
	import Card from '$lib/room/components/Card.svelte';
	import Token from '$lib/room/components/Token.svelte';
	import Spinner from '$lib/room/components/Spinner.svelte';

	let flipped: boolean = true;
	let spinner: number = 1;
	let forceSpin: string = String(Date.now());

	const spinTo = (n: number) => {
		if (spinner === n) {
			forceSpin = String(Date.now());
		} else {
			spinner = n;
		}
	};
</script>

<Spinner target={spinner} {forceSpin} />

<div class="row">
	<Token value={0} color="blue" on:click={() => spinTo(0)} />
	<Token value={1} color="blue" on:click={() => spinTo(1)} />
	<Token value={2} color="blue" on:click={() => spinTo(2)} />
	<Token value={3} color="blue" on:click={() => spinTo(3)} />
	<Token value={4} color="blue" on:click={() => spinTo(4)} />
</div>

<div class="row" on:click={() => (flipped = !flipped)}>
	<Card {flipped} text="stuff" />
</div>

<style>
	.row {
		display: flex;
		justify-content: space-around;
	}
</style>
