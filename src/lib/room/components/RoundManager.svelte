<script lang="ts" context="module">
	import { getContext, setContext } from 'svelte';
	import type { RunningGame } from '$lib/firebase/docTypes/Game';
	import { writable, derived, type Readable } from 'svelte/store';
	import type { Predicament } from '$lib/firebase/docTypes/Predicament';
	import { withGame, type GameApi } from '../apiCalls';

	const KEY = Symbol('round');
	export const ANIMATION = Symbol('animation');
	export const dataType = 'application/playertoken';

	type AnimFunc = (
		node: Element,
		params: CrossfadeParams & {
			key: any;
		}
	) => () => TransitionConfig;

	type AnimContext = { send: AnimFunc; receive: AnimFunc };

	const noop: AnimFunc = () => () => ({});

	export const getAnimationContext = (): AnimContext =>
		getContext(ANIMATION) ?? { send: noop, receive: noop };

	interface RoundContext {
		gameID: string;
		game: Readable<RunningGame>;
		cards: Readable<Predicament[]>;
		tokensByCardID: Readable<Record<string, number>>;
		updateToken: (token: number, id: string) => void;
		color: string;
		tokens: Readable<number[]>;
		api: GameApi;
		isLockedIn: Readable<boolean>;
	}
	export const getRoundContext = (): RoundContext => getContext(KEY);
</script>

<script lang="ts">
	import { crossfade, type CrossfadeParams, type TransitionConfig } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	export let game: RunningGame;
	export let userID: string;

	const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * 200),

		fallback(node) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});
	setContext(ANIMATION, { send, receive });

	const gameStore = writable(game);
	$: gameStore.set(game);
	const userStore = derived(gameStore, ($game) => $game.users[userID]);
	const cardStore = derived(gameStore, ($game) => {
		if ($game.cards?.length === 5) {
			return $game.cards;
		}
		return Array.from({ length: 5 }, (_, i) => ({ id: i, text: '', seed: 0, pack: '' }));
	});
	const tokenStore = writable(Array.from({ length: 5 }, () => -1));
	const tokensByCardID = derived([cardStore, tokenStore], ([$cards, $tokens]) => {
		return Object.fromEntries(
			$tokens.flatMap((cardIndex, tokenIndex) => {
				if (cardIndex === -1) {
					return [];
				}
				return [[$cards[cardIndex].id, tokenIndex]];
			})
		);
	});
	const updateToken = (token: number, id: string) => {
		tokenStore.update((tokens) => {
			const card = game.cards.findIndex((card) => card.id === id);
			if (card !== -1) {
				const tokenCurrentAssignedTo = tokens[token];
				const tokenInPosition = tokens.indexOf(card);

				if (tokenInPosition !== -1) {
					tokens[tokenInPosition] = tokenCurrentAssignedTo;
				}
			}
			tokens[token] = card;
			return tokens;
		});
	};
	const isLockedIn = derived(userStore, ($user) => $user.lockedIn);
	const api = withGame(game.id);

	setContext(KEY, {
		gameID: game.id,
		game: gameStore,
		cards: cardStore,
		tokensByCardID,
		updateToken,
		color: game.users[userID].color,
		tokens: tokenStore,
		api,
		isLockedIn
	});
</script>

<slot />
