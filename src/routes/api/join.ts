import type { RequestHandler } from '@sveltejs/kit';
import { getString } from '$lib/api/readFormData';
import { getColorFor } from '$lib/api/nextColor';
import { database } from '$lib/firebase/server';
import { wrapDatabase } from '$lib/firebase/dbTypes/Accessor';
import { asSuccess, refExists } from '$lib/utils';

export const post: RequestHandler = async (event) => {
	const formData = await event.request.formData();

	const { userID } = event.locals;
	const gameID = getString(formData, 'gameID');
	const displayName = getString(formData, 'displayName');

	if (!gameID || !userID || !displayName) {
		return {
			status: 302,
			headers: {
				location: '/?error=data'
			}
		};
	}

	const db = wrapDatabase(database);
	const gameRef = db.games[gameID];

	const exists = await refExists(gameRef.players.count);
	if (!exists) {
		return {
			status: 302,
			headers: {
				location: '/?error=exists'
			}
		};
	}

	if (await refExists(gameRef.players.users[userID])) {
		// already joined
		return {
			status: 302,
			headers: {
				location: `/room/${gameID}`
			}
		};
	}

	const success = await asSuccess(
		gameRef.victims[userID].set(0),
		gameRef.players.transaction((players) => {
			const color = getColorFor(players.count);
			players.count++;
			players.users[userID] = {
				color,
				name: displayName,
				inactive: false
			};
			return players;
		})
	);

	if (!success) {
		return {
			status: 302,
			headers: {
				location: `/?error=nogame`
			}
		};
	}

	return {
		status: 302,
		headers: {
			location: `/room/${gameID}`
		}
	};
};
