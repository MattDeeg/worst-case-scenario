import type { RequestHandler } from '@sveltejs/kit';
import { store, database, validateDocumentID } from '$lib/firebase/server';
import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';
import { getString } from '$lib/api/readFormData';
import { getColorFor } from '$lib/api/nextColor';
import { asSuccess, refExists } from '$lib/utils';

export const post: RequestHandler = async (event) => {
	const formData = await event.request.formData();

	const userID = event.locals.userID;
	const gameID = getString(formData, 'gameID') || store.generateID();
	const name = getString(formData, 'displayName');
	// todo
	const allowedPacks: string[] = ['Base Game'];

	if (!userID || !validateDocumentID(gameID) || !name || (allowedPacks?.length ?? 0 > 0)) {
		return {
			status: 302,
			headers: {
				location: '/?error=data'
			}
		};
	}

	const db = wrapDatabase(database);

	const gameRef = db.games[gameID];

	if (!(await refExists(gameRef.players.count))) {
		return {
			status: 302,
			headers: {
				location: '/?error=exists'
			}
		};
	}

	const success = await asSuccess(
		store.doc(`games/${gameID}`).set({
			lastRoundAt: Date.now()
		}),
		gameRef.set({
			players: {
				count: 1,
				users: {
					[userID]: {
						color: getColorFor(0),
						name
					}
				}
			},
			cards: {
				allowedPacks
			},
			victims: {
				[userID]: 0
			},
			// unneeded to create game, but needed for type safety
			ready: null,
			round: null,
			scores: null,
			tokens: null
		})
	);

	return {
		status: 302,
		headers: {
			location: success ? `/room/${encodeURI(gameID)}` : '?error=unknown'
		}
	};
};
