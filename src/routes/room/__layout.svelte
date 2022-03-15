<script lang="ts" context="module">
	import type { Load } from '@sveltejs/kit';
	import { database } from '$lib/firebase/browser';
	import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';

	export const load: Load = async ({ session, params }) => {
		const { userID } = session;
		const { gameID } = params;

		const db = wrapDatabase(database);
		const playerRef = await db.games[gameID].players.users[userID].color.get();
		if (!playerRef.exists()) {
			return { redirect: `/join/${gameID}`, status: 302 };
		}
		return {};
	};
</script>

<slot />
