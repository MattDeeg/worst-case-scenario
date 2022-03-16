import type { RequestHandler } from '@sveltejs/kit';
import { database } from '$lib/firebase/server';
import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';
import { asSuccess, successResponse } from '$lib/utils';

export interface Payload {
	gameID: string;
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const userID = event.locals.userID;
	const { gameID } = payload;

	if (!gameID || !userID) {
		return successResponse(false, 'invalid data');
	}

	const db = wrapDatabase(database);
	const gameRef = db.games[gameID];

	const tokenRef = await gameRef.tokens[userID].get();
	if (!tokenRef.exists()) {
		return successResponse(false, 'game does not exist or player not in game');
	}

	const tokens = tokenRef.val();

	if (tokens.length !== 5 || tokens.some((token) => token === -1)) {
		return successResponse(false, 'commited tokens not valid to lock in');
	}

	const success = await asSuccess(gameRef.ready[userID].set(true));

	return successResponse(success);
};
