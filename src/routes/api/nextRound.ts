import type { RequestHandler } from '@sveltejs/kit';
import { database, store } from '$lib/firebase/server';
import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';
import { asSuccess, refExists, successResponse } from '$lib/utils';
import { nextVictim } from '$lib/api/nextVictim';
import { getBonusType } from '$lib/api/scoreRound';

export interface Payload {
	gameID: string;
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const userID = event.locals.userID;
	const { gameID } = payload;

	if (!gameID) {
		return successResponse(false, 'invalid data');
	}

	const db = wrapDatabase(database);
	const gameRef = db.games[gameID];

	if (!(await refExists(gameRef.players.users[userID].name))) {
		return successResponse(false, 'game does not exist or player not in game');
	}

	const victimTimes = (await gameRef.victims.get()).val();
	const victim = nextVictim(victimTimes);

	const success = await asSuccess(
		store.doc(`games/${gameID}`).set({
			lastRoundAt: Date.now()
		}),
		gameRef.update({
			ready: null,
			victims: {
				[victim]: Date.now()
			},
			tokens: null,
			round: {
				id: store.generateID(),
				victim,
				bonusType: getBonusType(),
				revealed: null,
				cards: null // victim will fetch via API and then set
			}
		})
	);

	return successResponse(success);
};
