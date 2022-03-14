import type { RequestHandler } from '@sveltejs/kit';
import { generateHand } from '$lib/api/generateHand';
import { getVictim } from '$lib/api/refs';
import type { Predicament } from '$lib/firebase/docTypes/Predicament';

interface Payload {
	gameID: string;
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const { userID } = event.locals;
	const { gameID } = payload;

	if (!gameID || !userID) {
		return { body: { success: false } };
	}

	const victimRef = getVictim(gameID);
	const victim = (await victimRef.get()).data();

	if (victim.victim !== userID) {
		return { body: { success: false } };
	}

	const hand = await generateHand(
		victim.allowedPacks,
		victim.cards.map((p: Predicament) => p.id)
	);

	const success = await Promise.all([victimRef.update('cards', hand)]).then(
		() => true,
		() => false
	);

	return { body: { success } };
};
