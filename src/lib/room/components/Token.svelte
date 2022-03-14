<script lang="ts" context="module">
	export type Value = 0 | 1 | 2 | 3 | 4;
	export const isTokenValue = (n: number): n is Value => n > -1 && n < 5;
	const labels = ['Bad', 'Very Bad', 'Awful', 'Horrible', 'The Worst'];
</script>

<script lang="ts">
	import { getAnimationContext } from './RoundManager.svelte';

	export let value: Value;
	export let color: string;
	export let label: string = null;
	export let draggable: boolean = false;
	export let disabled: boolean = false;

	let svg: HTMLSpanElement;
	let clone: HTMLSpanElement;
	const makeClone = () => {
		if (!clone) {
			clone = svg.cloneNode(true) as HTMLSpanElement;
			clone.classList.remove('disabled');
			clone.style.position = 'absolute';
			clone.style.left = '-1000px';
			clone.style.top = '-1000px';
			document.body.appendChild(clone);
		}
		return clone;
	};

	const handleDragStart = (e: DragEvent) => {
		if (draggable) {
			const shadow = makeClone();
			e.dataTransfer.setData('application/playertoken', JSON.stringify(value));
			e.dataTransfer.setDragImage(shadow, svg.clientWidth * 0.5, svg.clientHeight * 0.5);
		}
	};

	const removeClone = () => {
		if (clone) {
			document.body.removeChild(clone);
			clone = null;
		}
	};

	const { send, receive } = getAnimationContext();
	$: console.log({ send, receive });
	const animKey = { key: `token.${value}` };
</script>

<svelte:body on:dragend={removeClone} />

<span {draggable} class="wrapper" class:disabled on:dragstart={handleDragStart} bind:this={svg}>
	{#key value}
		<svg viewBox="0 0 200 200" on:click in:receive={animKey} out:send={animKey}>
			<defs>
				<path d="m35,97 a60,60 90 0 1 130,0" id="top" />
				<path d="m5,97 a95,95 0 0 0 190,0" id="bottom" />
			</defs>
			<circle cx="100" cy="100" r="90" fill="#FFF" id="background" />
			<circle fill="none" stroke={color} cx="100" cy="100" r="80" stroke-width="40" id="rim" />
			<text
				style="text-anchor: middle;font-size: 8rem;font-weight: bold;"
				x="100"
				y="140"
				fill={color}
				class="value">{value + 1}</text
			>
			<g style="text-transform: uppercase; font-size: 2rem">
				<text>
					<textPath
						style="text-anchor:middle; letter-spacing:-0.05em"
						class="top"
						startOffset="50%"
						fill="#fff"
						xlink:href="#top">{label ?? labels[value]}</textPath
					>
				</text>
				<text>
					<textPath
						style="text-anchor:middle; letter-spacing:0.15em"
						startOffset="50%"
						fill="#fff"
						xlink:href="#bottom">{labels[value]}</textPath
					>
				</text>
			</g>
		</svg>
	{/key}
</span>

<style lang="scss">
	svg,
	.wrapper {
		--r: var(--radius, 5em);
		height: var(--r);
		width: var(--r);
		user-select: none;
		cursor: pointer;
	}
	.disabled {
		opacity: 0.25;
	}
</style>
