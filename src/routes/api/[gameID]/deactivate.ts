import type { RequestHandler } from '@sveltejs/kit';
import { database } from '$lib/firebase/server';
import { asSuccess, successResponse } from '$lib/utils';
import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';

export const post: RequestHandler = async (event) => {
	const userID = event.locals.userID;
	const { gameID } = event.params;

	if (!gameID || !userID) {
		return successResponse(false, 'invalid data');
	}

	const db = wrapDatabase(database);

	const userRef = db.games[gameID].players.users[userID];
	const user = await userRef.color.get();
	if (!user.exists()) {
		return successResponse(false, 'game does not exist or player not in game');
	}

	const success = await asSuccess(userRef.inactive.set(true));

	return successResponse(success);
};
