import type { RequestHandler } from '@sveltejs/kit';
import type { RunningGame } from '$lib/firebase/docTypes/Game';
import type { Predicament } from '$lib/firebase/docTypes/Predicament';
import { getGame } from '$lib/api/refs';

interface Payload {
	gameID: string;
	cards: Predicament[];
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const { gameID, cards } = payload;

	if (!gameID || cards?.length !== 5) {
		return { body: { success: false } };
	}

	const gameRef = getGame<RunningGame>(gameID);
	const success = await Promise.all([
		gameRef.set(
			{
				cards
			},
			{ merge: true }
		)
	]).then(
		() => true,
		() => false
	);

	return { body: { success } };
};
