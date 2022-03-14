<script lang="ts">
	import { store } from '$lib/firebase/browser';
	import { fly } from 'svelte/transition';
	import type { CardPacks } from '$lib/firebase/docTypes/CardPacks';

	import Card from '$lib/room/components/Card.svelte';
	import Surface from '$lib/ui/Surface.svelte';
	import { onMount } from 'svelte';

	let keyForTransition = 100000;
	let packs = [];
	onMount(() => {
		store.onSnapshot(store.doc<CardPacks>('meta/packs'), (snap) => {
			packs = snap.data()?.packs ?? [];
		});
	});
	let pack = 'Base Game';
	let text = '';

	const resetForm = () => {
		pack = 'Base Game';
		text = '';
		keyForTransition -= 1;
	};
	const submitForm = () => {
		fetch('/api/addCard', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json;charset=utf-8'
			},
			body: JSON.stringify({ pack, text })
		})
			.then((res) => res.json())
			.then(() => {
				resetForm();
			});
	};
</script>

<Surface>
	<div class="row g3">
		<form on:reset={resetForm} on:submit|preventDefault={submitForm}>
			<label for="pack">
				Card Pack
				<input type="text" bind:value={pack} name="pack" list="card-packs" />
			</label>
			<datalist id="card-packs">
				<option value="Base Game">Base Game</option>
				{#each packs as pack}
					<option value={pack}>{pack}</option>
				{/each}
			</datalist>
			<label for="text">
				Card Text
				<input name="text" bind:value={text} autocomplete="off" />
			</label>
			<button>Create</button>
		</form>
		<div style="width:28em; height: 18em;">
			{#key keyForTransition}
				<span
					style="position: absolute; z-index: {keyForTransition}"
					out:fly={{ y: -1000, opacity: 1, duration: 750 }}
				>
					<Card {text} flipped />
				</span>
			{/key}
		</div>
	</div>
</Surface>
