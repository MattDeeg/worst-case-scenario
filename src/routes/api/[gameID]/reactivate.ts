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
		.update(`users.${userID}.active`, true)
		.then(
			() => true,
			() => false
		);

	return { body: { success } };
};
