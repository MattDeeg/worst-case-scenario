<script lang="ts">
	import { page, session } from '$app/stores';
	import { api } from '$lib/room/apiCalls';
	import { watchStore } from '$lib/utils';
	import Lobby from '$lib/room/Lobby.svelte';
	import Game from '$lib/room/Game.svelte';
	import { database } from '$lib/firebase/browser';
	import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';
	import { setRoomContext, setAnimationContext, type UserWithID } from '$lib/room/context';
	import { derived } from 'svelte/store';
	import { flip } from '$lib/transitions/flip';

	const { userID } = $session;
	const { gameID } = $page.params;

	const [send, receive] = flip({
		duration: (d) => Math.sqrt(d * 200)
	});
	setAnimationContext({ send, receive });

	const db = wrapDatabase(database);
	const gameRef = db.games[gameID];
	const sortById = (a: UserWithID, b: UserWithID) => a.id.localeCompare(b.id);

	const userStore = watchStore(gameRef.players.users);
	const myUserStore = derived(userStore, ($users) => $users?.[userID]);
	const userListStore = derived(userStore, ($users) => {
		const { [userID]: myUser, ...others } = $users ?? {};

		const self: UserWithID = { id: userID, ...myUser };
		const othersWithID: UserWithID[] = Object.entries(others)
			.map(([id, user]) => ({
				...user,
				id
			}))
			.sort(sortById);

		return [self, ...othersWithID].filter((user) => user?.name);
	});
	const roundStore = watchStore(gameRef.round);
	const cardStore = derived(roundStore, ($round) => {
		if ($round?.cards?.length === 5) {
			return $round?.cards;
		}
		return Array.from({ length: 5 }, () => '');
	});
	const scoreStore = watchStore(gameRef.scores);
	const tokenStore = watchStore(
		gameRef.tokens[userID],
		Array.from({ length: 5 }, () => -1)
	);
	const readinessStore = watchStore(gameRef.ready);
	const allReadyStore = derived([userStore, readinessStore], ([$users, $readiness]) => {
		return Object.keys($users ?? {}).every(
			(id) => $users?.[id].inactive || $readiness?.[id] === true
		);
	});

	setRoomContext({
		gameID,
		userID,
		user: myUserStore,
		users: userListStore,
		round: roundStore,
		cards: cardStore,
		scores: scoreStore,
		readiness: readinessStore,
		allPlayersReady: allReadyStore,
		tokens: tokenStore,
		api: api(gameID)
	});
</script>

{#if !$myUserStore}
	loading loading loading
{:else if !$roundStore}
	<Lobby />
{:else}
	<Game />
{/if}
