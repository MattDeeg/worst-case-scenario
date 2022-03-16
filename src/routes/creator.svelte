<script lang="ts">
	import { store } from '$lib/firebase/browser';
	import type { CardPacks } from '$lib/firebase/docTypes/CardPacks';

	import Card from '$lib/room/components/Card.svelte';
	import { swoop } from '$lib/transitions/swoop';
	import Surface from '$lib/ui/Surface.svelte';
	import { onMount } from 'svelte';

	let keyForTransition = Date.now();
	let packs = [];
	onMount(() => {
		return store.onSnapshot(store.doc<CardPacks>('meta/packs'), (snap) => {
			packs = snap.data()?.packs ?? [];
		});
	});
	let pack = 'Base Game';
	let text = '';

	const resetForm = () => {
		pack = 'Base Game';
		text = '';
		keyForTransition = Date.now();
	};
	const submitForm = () => {
		if (text.trim().length === 0 || pack.trim().length === 0) {
			return;
		}
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
				{#each packs as pack}
					<option value={pack}>{pack}</option>
				{/each}
			</datalist>
			<label for="text">
				Card Text
				<input name="text" bind:value={text} autocomplete="off" />
			</label>
			<button>Create</button>
			<button type="button" on:click={resetForm}>Reset {keyForTransition}</button>
		</form>
		<div style="width:28em; height: 18em;">
			{#key keyForTransition}
				<span out:swoop={{ duration: 1000 }}>
					<Card {text} flipped />
				</span>
			{/key}
		</div>
	</div>
</Surface>
