import type { RequestHandler } from '@sveltejs/kit';
import { database, store } from '$lib/firebase/server';
import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';
import { asSuccess, successResponse } from '$lib/utils';

interface Payload {
	secret: string;
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const { secret } = payload;

	if (secret !== import.meta.env.VITE_PRUNE_SECRET) {
		return successResponse(false, 'invalid data');
	}

	const db = wrapDatabase(database);

	const ONE_DAY = 1000 * 60 * 60 * 24;

	const oldGames = await store.getDocs(
		store.collection('games', [{ field: 'lastRoundAt', op: '<', value: 7 * ONE_DAY }])
	);

	const oldGameIDs = oldGames.docs.map((snap) => snap.id);

	const wipeUpdate = Object.fromEntries(oldGameIDs.map((id) => [id, null]));

	const success = await asSuccess(db.games.update(wipeUpdate));

	return successResponse(success);
};
