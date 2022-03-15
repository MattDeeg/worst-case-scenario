import type { RequestHandler } from '@sveltejs/kit';
import { database } from '$lib/firebase/server';
import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';
import { asSuccess, successResponse } from '$lib/utils';
import type { TokenValue } from '$lib/firebase/dbTypes/Database';

export interface Payload {
	gameID: string;
	token: TokenValue;
	cardIndex: TokenValue; // not quite right, but same values
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const userID = event.locals.userID;
	const { gameID, token, cardIndex } = payload;

	if (!gameID || !userID || token == null || cardIndex == null) {
		return successResponse(false, 'invalid data');
	}

	const db = wrapDatabase(database);
	const gameRef = db.games[gameID];

	const tokenRef = await gameRef.tokens[userID].get();
	if (!tokenRef.exists()) {
		return successResponse(false, 'game does not exist or player not in game');
	}

	const success = await asSuccess(
		gameRef.tokens[userID].transaction((tokens) => {
			if (cardIndex !== -1) {
				const tokenCurrentAssignedTo = tokens[token];
				const tokenInPosition = tokens.indexOf(cardIndex);

				if (tokenInPosition !== -1) {
					tokens[tokenInPosition] = tokenCurrentAssignedTo;
				}
			}
			tokens[token] = cardIndex;
			return tokens;
		})
	);

	return successResponse(success);
};
