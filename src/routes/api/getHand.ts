import type { RequestHandlerOutput } from '@sveltejs/kit';
import { generateHand } from '$lib/api/generateHand';
import { successResponse, type Response } from '$lib/utils';
import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';
import { database } from '$lib/firebase/server';
import type { RequestEvent } from '@sveltejs/kit/types/internal';
import type { JSONValue } from '@sveltejs/kit/types/internal';

export interface Payload {
	gameID: string;
}

export const post = async (event: RequestEvent): Promise<RequestHandlerOutput<Response>> => {
	const payload: Payload = await event.request.json();
	const { userID } = event.locals;
	const { gameID } = payload;

	if (!gameID || !userID) {
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

	const cardData = (await gameRef.cards.get()).val();

	const hand = await generateHand(cardData.allowedPacks, cardData.ids);

	return successResponse(true, null, hand as unknown as JSONValue[]);
};
