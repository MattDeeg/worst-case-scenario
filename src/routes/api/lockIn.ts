import type { RequestHandler } from '@sveltejs/kit';
import { getAll, getMeta, getVictim } from '$lib/api/refs';

interface Payload {
	gameID: string;
	tokens: number[];
}

export const post: RequestHandler = async (event) => {
	const payload: Payload = await event.request.json();
	const { userID } = event.locals;
	const { gameID, tokens } = payload;

	if (!gameID || !userID || !tokens || tokens.length !== 5) {
		return { body: { success: false } };
	}

	const { metaRef, gameRef, victimRef } = getAll(gameID);
	const meta = (await metaRef.get()).data();

	if (meta.decisions[userID]) {
		return { body: { success: false, alreadyDone: true } };
	}

	const promises = [
		metaRef.update(`decisions.${userID}.tokens`, tokens),
		gameRef.update(`users.${userID}.lockedIn`, true)
	];

	const numUsers = Object.keys(meta.users).length;
	const numDecided = Object.keys(meta.decisions).length + 1;

	if (numUsers === numDecided) {
		promises.push(victimRef.update('readyToReveal', true));
	}

	const success = await Promise.all(promises).then(
		() => true,
		() => false
	);

	return { body: { success } };
};
