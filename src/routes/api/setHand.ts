import type { RequestHandler } from '@sveltejs/kit';
import { asSuccess, successResponse } from '$lib/utils';
import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';
import { database } from '$lib/firebase/server';
import type { Card } from '$lib/api/generateHand';

export interface Payload {
	gameID: string;
	cards: Card[];
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const { userID } = event.locals;
	const { gameID, cards } = payload;

	if (!gameID || !userID || (cards?.length ?? 0) !== 5) {
		return successResponse(false, 'invalid data');
	}

	const db = wrapDatabase(database);
	const gameRef = db.games[gameID];

	const victimSnap = await gameRef.round.victim.get();

	if (!victimSnap.exists()) {
		return successResponse(false, 'game does not exist');
	}
	if (victimSnap.val() !== userID) {
		return successResponse(false, 'player is not victim');
	}

	const success = await asSuccess(
		gameRef.cards.ids.set(cards.map((c) => c.id)),
		gameRef.round.update({
			cards: cards.map((c) => c.text),
			revealed: cards.map(() => false)
		})
	);

	return successResponse(success);
};
