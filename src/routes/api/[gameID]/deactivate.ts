import type { RequestHandler } from '@sveltejs/kit';
import { store } from '$lib/firebase/server';

export const post: RequestHandler = async (event) => {
	const { gameID } = event.params;
	const { userID } = event.locals;

	if (!gameID || !userID) {
		return { body: { success: false } };
	}

	const success = await store
		.doc(`gameMeta/${gameID}`)
		.update(`users.${userID}.active`, false)
		.then(
			() => true,
			() => false
		);

	/*
		// TODO if host means something more than who can hit start, I guess
		if (game.users[userID].host) {
			const anotherUser = Object.keys(game.users).find((id) => id !== userID);
			if (anotherUser) {
				obj.users[userID].host = false;
				obj.users[anotherUser] = { host: true };
			}
		}
	*/

	return { body: { success } };
};
