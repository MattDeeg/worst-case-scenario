import type { RequestHandler } from '@sveltejs/kit';
import { database } from '$lib/firebase/server';
import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';
import { asSuccess, refExists, successResponse } from '$lib/utils';

export interface Payload {
	gameID: string;
	color: string;
	displayName: string;
	ready: boolean;
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const userID = event.locals.userID;
	const { gameID, color, displayName, ready } = payload;

	if (!gameID || !color || !displayName) {
		return successResponse(false, 'invalid data');
	}

	const db = wrapDatabase(database);
	const gameRef = db.games[gameID];

	if (!(await refExists(gameRef.players.users[userID].name))) {
		return successResponse(false, 'game does not exist or player not in game');
	}

	const success = await asSuccess(
		gameRef.ready[userID].set(ready),
		gameRef.players.users[userID].set({
			color,
			name: displayName,
			inactive: false
		})
	);

	if (!success) {
		return {
			status: 302,
			headers: {
				location: `/?error=nogame`
			}
		};
	}

	return {
		status: 302,
		headers: {
			location: `/room/${gameID}`
		}
	};
};
